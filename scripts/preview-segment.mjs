#!/usr/bin/env node
/**
 * 单镜静帧预览
 *
 * 干什么：不渲视频，只出一张图，先看构图对不对，再决定要不要渲。
 * 用法：
 *   node scripts/preview-segment.mjs episodes/t3code s05
 *   node scripts/preview-segment.mjs episodes/t3code s05 --at 0.8
 *
 * 产出：episodes/<期号>/segments/<id>.png
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
process.chdir(ROOT);

const epArg = process.argv[2];
const segId = process.argv[3];
const atIdx = process.argv.indexOf('--at');
const at = atIdx >= 0 ? Number(process.argv[atIdx + 1]) : 0.7;

if (!epArg || !segId) {
  console.error('用法: node scripts/preview-segment.mjs episodes/<期号> <镜头id> [--at 0.7]');
  process.exit(1);
}

const epDir = path.isAbsolute(epArg) ? epArg : path.join(ROOT, epArg);
const manifest = JSON.parse(fs.readFileSync(path.join(epDir, 'manifest.json'), 'utf8'));
const seg = manifest.segments.find((s) => s.id === segId);

if (!seg) {
  console.error(`没有 id 为 ${segId} 的镜头`);
  process.exit(1);
}

const dur = seg.end - seg.start;
const single = {
  ...manifest,
  audio: undefined,
  segments: [{ ...seg, start: 0, end: dur }],
};

const outDir = path.join(epDir, 'segments');
fs.mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, `${segId}.png`);

const { bundle } = await import('@remotion/bundler');
const { selectComposition, renderStill } = await import('@remotion/renderer');

console.log('打包…');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });

const inputProps = { manifest: { ...single, fps: manifest.fps ?? 30 } };
const composition = await selectComposition({ serveUrl, id: 'Episode', inputProps });
const frame = Math.round((composition.durationInFrames - 1) * at);

await renderStill({ composition, output, frame, serveUrl, inputProps });
console.log(`✓ ${path.relative(ROOT, output)}  (${(dur).toFixed(1)}s 镜头，取 ${(at * 100).toFixed(0)}% 处)`);
