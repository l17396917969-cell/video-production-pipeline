#!/usr/bin/env node
/**
 * 混音：配音 + 配乐
 *
 * 三条设计原则：
 *   1. 音乐不抢人声：基础音量压到 0.26 左右
 *   2. 说人话时音乐自动让位：sidechaincompress，配音一响音乐就降
 *   3. 随节奏起伏：分段音量包络，开场和结尾稍强，中段退到后面
 *
 * 用法：node scripts/mix-audio.mjs episodes/t3code
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const FFMPEG = path.join(ROOT, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
const ep = process.argv[2] ?? 'episodes/t3code';

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ep, 'manifest.json'), 'utf8'));
const total = manifest.segments[manifest.segments.length - 1].end;

const voice = path.join(ROOT, 'public', 'voice', 'full.mp3');
const music = path.join(ROOT, 'public', 'music', 'tech-drive.mp3');
const out = path.join(ROOT, ep, 'audio-mix.m4a');

if (!fs.existsSync(voice)) {
  console.error('缺配音：', voice);
  process.exit(1);
}
if (!fs.existsSync(music)) {
  console.error('缺配乐：', music);
  process.exit(1);
}

/**
 * 分段音量包络
 *
 * 开场 0-6 秒：0.34（把观众抓住）
 * 6-20 秒：0.22（退到后面，让内容说话）
 * 20-52 秒：0.20（中段最安静）
 * 52-64 秒：0.26（结论前抬起来）
 * 64-结束：0.32（收尾给力）
 *
 * 用 ffmpeg 的 volume 时间表达式，各段之间做 1.5 秒平滑过渡。
 */
const env = [
  `if(lt(t,6),0.34,`,
  `if(lt(t,20),0.22,`,
  `if(lt(t,52),0.20,`,
  `if(lt(t,64),0.26,0.32))))`,
].join('');

// 用三次线性插值把台阶变斜坡：分别算每段的加权
const parts = [
  { from: 0, to: 6, vol: 0.34 },
  { from: 6, to: 20, vol: 0.22 },
  { from: 20, to: 52, vol: 0.2 },
  { from: 52, to: 64, vol: 0.26 },
  { from: 64, to: total + 1, vol: 0.32 },
];

// 生成平滑包络：每段之间用 1.5 秒过渡
const smooth = [];
for (let i = 0; i < parts.length; i++) {
  const p = parts[i];
  const next = parts[i + 1];
  if (next) {
    smooth.push(`${p.vol}`);
  } else {
    smooth.push(`${p.vol}`);
  }
}

// ffmpeg 用 aevalsrc 生成分段音量，再叠加到音乐上
const expr = parts
  .map((p, i) => {
    const next = parts[i + 1];
    if (!next) return `gte(t,${p.from})*${p.vol}`;
    const span = Math.min(1.5, next.from - p.from);
    // 段内保持，末尾 1.5 秒线性过渡到下一段
    return `between(t,${p.from},${next.from})*(if(lt(t,${next.from - span}),${p.vol},${p.vol}+(${next.vol}-${p.vol})*(t-(${next.from - span}))/${span}))`;
  })
  .join('+');

const args = [
  '-y',
  '-i', voice,
  '-stream_loop', '-1',
  '-i', music,
  // 音乐：裁到片长 + 音量包络 + 首尾淡入淡出
  '-filter_complex',
  [
    `[1:a]atrim=0:${total},asetpts=PTS-STARTPTS,volume='${expr}':eval=frame,afade=t=in:st=0:d=2.2,afade=t=out:st=${(total - 2.5).toFixed(2)}:d=2.5[mus]`,
    // 配音压一下峰值，避免刺耳
    `[0:a]acompressor=threshold=-18dB:ratio=2.4:attack=8:release=180,alimiter=limit=0.95[vo]`,
    // 音乐在人声出现时自动让位
    `[mus][0:a]sidechaincompress=threshold=0.035:ratio=6:attack=14:release=380[duck]`,
    `[vo][duck]amix=inputs=2:duration=first:dropout_transition=0,volume=2.4,alimiter=limit=0.97[mix]`,
  ].join(';'),
  '-map', '[mix]',
  '-c:a', 'aac',
  '-b:a', '192k',
  out,
];

const r = spawnSync(FFMPEG, args, { encoding: 'utf8' });
if (r.status !== 0) {
  console.error('混音失败：');
  console.error((r.stderr || '').slice(-1200));
  process.exit(1);
}
console.log(`✓ ${out}（片长 ${total.toFixed(1)}s）`);
