#!/usr/bin/env node
/**
 * 把 TTS 的时间轴写进 manifest 的字幕字段
 *
 * 用法：node scripts/build-subtitles.mjs episodes/t3code
 * 读：  episodes/<期号>/audio/timeline.json
 * 写：  episodes/<期号>/manifest.json 的 subtitles 字段（原文件其他内容不动）
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const epArg = process.argv[2];
if (!epArg) {
  console.error('用法: node scripts/build-subtitles.mjs episodes/<期号>');
  process.exit(1);
}

const epDir = path.isAbsolute(epArg) ? epArg : path.join(ROOT, epArg);
const timelinePath = path.join(epDir, 'audio', 'timeline.json');
const manifestPath = path.join(epDir, 'manifest.json');

if (!fs.existsSync(timelinePath)) {
  console.error('没有 timeline.json，先跑配音');
  process.exit(1);
}

const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 一句太长就按标点拆成两条字幕，免得一屏压三行
function splitLong(text, max = 22) {
  if (text.length <= max) return [text];
  const parts = text.split(/(?<=[，、；。！？])/).filter(Boolean);
  if (parts.length <= 1) return [text];
  const out = [];
  let buf = '';
  for (const p of parts) {
    if ((buf + p).length > max && buf) {
      out.push(buf);
      buf = p;
    } else {
      buf += p;
    }
  }
  if (buf) out.push(buf);
  return out;
}

const subs = [];
for (const seg of timeline.segments) {
  const pieces = splitLong(seg.text);
  if (pieces.length === 1) {
    subs.push({ start: +seg.start.toFixed(2), end: +seg.end.toFixed(2), text: seg.text });
  } else {
    // 按字数比例分配时间
    const total = pieces.reduce((a, p) => a + p.length, 0);
    let cursor = seg.start;
    for (const p of pieces) {
      const d = (p.length / total) * (seg.end - seg.start);
      subs.push({
        start: +cursor.toFixed(2),
        end: +(cursor + d).toFixed(2),
        text: p,
      });
      cursor += d;
    }
  }
}

manifest.subtitles = subs;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`✓ 写入 ${subs.length} 条字幕 → ${path.relative(ROOT, manifestPath)}`);
