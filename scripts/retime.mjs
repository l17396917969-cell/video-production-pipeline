#!/usr/bin/env node
/**
 * 换了配音之后，把镜头和字幕重新对齐到新音频
 *
 * 用法：node scripts/retime.mjs episodes/t3code
 *
 * 做法：不是简单按比例缩放整条时间轴——每句话语速不同，等比缩放会让后半段错位。
 * 正确做法是按「句子」映射：先知道每个镜头原来落在第几句的第几成，
 * 再把它放到新音频同一句的同一成位置。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const epArg = process.argv[2];
if (!epArg) {
  console.error('用法: node scripts/retime.mjs episodes/<期号>');
  process.exit(1);
}

const epDir = path.join(ROOT, epArg);
const manifestPath = path.join(epDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 新配音的逐句时间轴
const timelinePath = path.join(ROOT, 'out', 'voice', 'timeline.json');
if (!fs.existsSync(timelinePath)) {
  console.error('缺 out/voice/timeline.json，先跑 voice-episode.mjs');
  process.exit(1);
}
const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
const newParts = timeline.parts;

// 旧时间轴按原字幕推算每句边界（原字幕是按字数分的，16 句结构还在）
const oldLen = manifest.segments[manifest.segments.length - 1].end;
const scriptPath = path.join(epDir, 'script.md');
const scriptLines = fs
  .readFileSync(scriptPath, 'utf8')
  .split('\n')
  .map((l) => l.match(/^(\d+)\s*\[(\d+)s\]\s*(.+)$/))
  .filter(Boolean)
  .map((m) => m[3].trim());

if (scriptLines.length !== newParts.length) {
  console.error(`稿件 ${scriptLines.length} 句，新配音 ${newParts.length} 句，数量对不上`);
  process.exit(1);
}

// 旧边界：按每句字数占比切分旧总长
const totalChars = scriptLines.reduce((a, s) => a + s.length, 0);
let acc = 0;
const oldParts = scriptLines.map((text) => {
  const dur = (text.length / totalChars) * oldLen;
  const p = { start: acc, end: acc + dur };
  acc += dur;
  return p;
});

/** 找某个时间点落在第几句、句内几成 */
function locate(t, parts) {
  for (let i = 0; i < parts.length; i++) {
    if (t >= parts[i].start - 0.01 && t <= parts[i].end + 0.01) {
      const span = Math.max(0.01, parts[i].end - parts[i].start);
      return { idx: i, ratio: Math.min(1, Math.max(0, (t - parts[i].start) / span)) };
    }
  }
  // 超出末尾就贴最后一句
  return { idx: parts.length - 1, ratio: 1 };
}

let shifted = 0;
for (const seg of manifest.segments) {
  const a = locate(seg.start, oldParts);
  const b = locate(seg.end, oldParts);

  const newA = newParts[a.idx].start + a.ratio * (newParts[a.idx].end - newParts[a.idx].start);
  const newB = newParts[b.idx].start + b.ratio * (newParts[b.idx].end - newParts[b.idx].start);

  seg.start = Number(newA.toFixed(2));
  seg.end = Number(Math.max(newA + 0.4, newB).toFixed(2));
  shifted++;
}

// 字幕改用真实句子时间轴
manifest.subtitles = newParts.map((p) => ({
  start: Number(p.start.toFixed(2)),
  end: Number(p.end.toFixed(2)),
  text: p.text,
}));

// 指向新音频
manifest.audio = 'voice/full.mp3';
fs.mkdirSync(path.join(ROOT, 'public', 'voice'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'out', 'voice', 'full.mp3'), path.join(ROOT, 'public', 'voice', 'full.mp3'));

const newTotal = manifest.segments[manifest.segments.length - 1].end;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`✓ 重排 ${shifted} 镜：${oldLen.toFixed(1)}s → ${newTotal.toFixed(1)}s`);
console.log(`✓ 字幕 ${manifest.subtitles.length} 条（真实句界）`);
console.log(`✓ 音频 → public/voice/full.mp3`);
