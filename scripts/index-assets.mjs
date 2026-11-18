#!/usr/bin/env node
/**
 * 素材索引：把所有素材登记成一份 JSON，能回答三个问题
 *   1. 我手上有哪些素材？
 *   2. 每段用在哪几镜？
 *   3. 哪些素材被用得太狠了？
 *
 * 用法：node scripts/index-assets.mjs [episodes/t3code ...]
 * 产出：assets/index.json
 *
 * 为什么要这个：素材散在目录里，剪到一半才发现"这张图已经用过三次"，
 * 或者"这段录屏根本没进片子"。索引让这类问题在门禁阶段就能报出来。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const eps = process.argv.slice(2);
const epList = eps.length ? eps : fs.readdirSync(path.join(ROOT, 'episodes')).map((d) => `episodes/${d}`);

const SHOT_DIR = path.join(ROOT, 'public', 'shots');
const VIDEO_DIR = path.join(ROOT, 'public', 'video');

/** 从 ffmpeg 的输出里读时长和分辨率 */
function probe(file) {
  const r = spawnSync(ffmpeg.path, ['-i', file], { encoding: 'utf8' });
  const text = `${r.stderr ?? ''}`;
  const dur = text.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const dim = text.match(/,\s*(\d{2,5})x(\d{2,5})[\s,]/);
  return {
    seconds: dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : null,
    width: dim ? Number(dim[1]) : null,
    height: dim ? Number(dim[2]) : null,
  };
}

const assets = new Map();

function register(abs, kind) {
  const rel = path.relative(path.join(ROOT, 'public'), abs).split(path.sep).join('/');
  if (assets.has(rel)) return rel;
  const stat = fs.statSync(abs);
  const info = kind === 'video' ? probe(abs) : { seconds: null, width: null, height: null };
  assets.set(rel, {
    path: rel,
    kind,
    bytes: stat.size,
    ...info,
    // 来源默认标成自制/官方，需要人工改的在这里改
    license: kind === 'video' ? 'self-recorded' : 'screenshot',
    usedIn: [],
  });
  return rel;
}

if (fs.existsSync(SHOT_DIR)) {
  for (const f of fs.readdirSync(SHOT_DIR)) {
    if (/\.(png|jpg|jpeg|webp)$/i.test(f)) register(path.join(SHOT_DIR, f), 'image');
  }
}
if (fs.existsSync(VIDEO_DIR)) {
  for (const f of fs.readdirSync(VIDEO_DIR)) {
    if (/\.(mp4|mov|webm)$/i.test(f)) register(path.join(VIDEO_DIR, f), 'video');
  }
}

// 统计每段素材被哪几镜用到
for (const ep of epList) {
  const mp = path.join(ROOT, ep, 'manifest.json');
  if (!fs.existsSync(mp)) continue;
  const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
  for (const s of m.segments ?? []) {
    const src = s.props?.src;
    if (!src) continue;
    const a = assets.get(src);
    if (a) a.usedIn.push({ episode: path.basename(ep), segment: s.id });
    else {
      // 引用了但文件不存在
      assets.set(src, { path: src, kind: 'missing', bytes: 0, license: '?', usedIn: [{ episode: path.basename(ep), segment: s.id }] });
    }
  }
}

const out = [...assets.values()].map((a) => {
  const times = a.usedIn.length;
  return {
    ...a,
    times,
    // 复用警戒线：同一素材超过 2 次就要人看一眼
    warn: times > 2 ? `用了 ${times} 次，检查是否重复感过强` : null,
  };
});

const dir = path.join(ROOT, 'assets');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), assets: out }, null, 2));

const missing = out.filter((a) => a.kind === 'missing');
const hot = out.filter((a) => a.warn);
const unused = out.filter((a) => a.times === 0 && a.kind !== 'missing');

console.log(`✓ assets/index.json：${out.length} 个素材`);
if (missing.length) console.log(`  ✗ 引用了但不存在的：${missing.map((a) => a.path).join(', ')}`);
if (hot.length) hot.forEach((a) => console.log(`  ! ${a.path}  ${a.warn}`));
if (unused.length) console.log(`  · 还没用上的：${unused.length} 个`);
