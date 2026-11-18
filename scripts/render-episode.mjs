#!/usr/bin/env node
/**
 * 渲染整片
 *
 * 用法：
 *   node scripts/render-episode.mjs episodes/demo               预览 1080p
 *   node scripts/render-episode.mjs episodes/demo --final       正式 4K60
 *
 * 读 manifest.json，包装成 Episode 组件的 props，渲染到 <episode>/out.mp4
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
process.chdir(ROOT);

const epArg = process.argv[2];
const isFinal = process.argv.includes('--final');
const onlyIdx = process.argv.indexOf('--only');
const onlyId = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;
if (!epArg) {
  console.error('用法: node scripts/render-episode.mjs episodes/<期号> [--final] [--only s05]');
  process.exit(1);
}

const epDir = path.isAbsolute(epArg) ? epArg : path.join(ROOT, epArg);
let manifest = JSON.parse(fs.readFileSync(path.join(epDir, 'manifest.json'), 'utf8'));

let outName = isFinal ? 'out.final.mp4' : 'out.mp4';

// 原子化：只渲一个镜头，改哪儿渲哪儿，不用整片重来
let onlyStart = 0;
if (onlyId) {
  const seg = manifest.segments.find((s) => s.id === onlyId);
  if (!seg) {
    console.error(`没有 id 为 ${onlyId} 的镜头。现有：${manifest.segments.map((s) => s.id).join(', ')}`);
    process.exit(1);
  }
  onlyStart = seg.start;
  const dur = seg.end - seg.start;
  manifest = {
    ...manifest,
    audio: undefined,
    segments: [{ ...seg, start: 0, end: dur }],
  };
  fs.mkdirSync(path.join(epDir, 'segments'), { recursive: true });
  outName = `segments/${onlyId}.mp4`;
}

const out = path.join(epDir, outName);
const width = isFinal ? 3840 : 1920;
const height = isFinal ? 2160 : 1080;
const fps = isFinal ? 60 : (manifest.fps ?? 30);

const total = manifest.segments.reduce((a, s) => a + (s.end - s.start), 0);
console.log(`\n渲染 ${manifest.episode ?? epArg}`);
console.log(`  ${manifest.segments.length} 段 · ${total.toFixed(1)}s · ${width}x${height} @${fps}fps`);
console.log(`  输出 ${path.relative(ROOT, out)}\n`);

const { bundle } = await import('@remotion/bundler');
const { selectComposition, renderMedia } = await import('@remotion/renderer');

console.log('打包…');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });

// 有混音就用混音（配音 + 配乐），没有就退回原配音
const mixPath = path.join(epDir, 'audio-mix.m4a');
const hasMix = fs.existsSync(mixPath);
if (hasMix) {
  fs.copyFileSync(mixPath, path.join(ROOT, 'public', 'voice', 'mix.m4a'));
  console.log('  音轨：混音（配音+配乐）');
} else {
  console.log('  音轨：原配音（未混音）');
}
// 转场会让画面比 manifest 略短，把音轨裁到画面长度，避免错位
// 转场后画面比 manifest 略短（实测约 1 秒），音轨保留原长，末尾留一点静音即可
const transitionFrames = 0;
const visualFrames = Math.round((manifest.segments[manifest.segments.length - 1].end) * fps) - transitionFrames;
const trimAudio = path.join(ROOT, 'public', 'voice', 'mix-trim.m4a');
if (hasMix) {
  const { spawnSync } = await import('node:child_process');
  const FFMPEG = path.join(ROOT, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
  // 单镜渲染时，音频必须从这一镜在全片里的起点开始切，否则音画对不上
  const seek = onlyStart > 0 ? ['-ss', String(onlyStart)] : [];
  spawnSync(FFMPEG, ['-y', '-i', path.join(ROOT, 'public', 'voice', 'mix.m4a'), ...seek, '-t', String(visualFrames / fps), '-c:a', 'aac', '-b:a', '192k', trimAudio], { encoding: 'utf8' });
}

const inputProps = {
  manifest: {
    ...manifest,
    fps,
    ...(hasMix ? { audio: 'voice/mix-trim.m4a' } : {}),
  },
};

const composition = await selectComposition({ serveUrl, id: 'Episode', inputProps });

console.log('渲染…');
let last = -1;
await renderMedia({
  composition: { ...composition, width, height, fps },
  serveUrl,
  codec: 'h264',
  outputLocation: out,
  inputProps,
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 10);
    if (p !== last) {
      last = p;
      process.stdout.write(`  ${p * 10}% `);
    }
  },
});

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`\n\n✓ ${path.relative(ROOT, out)} (${mb} MB)\n`);
