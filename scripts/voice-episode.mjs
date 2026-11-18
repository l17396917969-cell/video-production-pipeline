#!/usr/bin/env node
/**
 * 整期配音：按 script.md 逐句合成，拼成一条，并给出精确时间轴
 *
 * 用法：node scripts/voice-episode.mjs episodes/t3code [--voice male-qn-jingying] [--speed 1.0]
 * 产出：
 *   out/voice/l01.mp3 …        每句一条
 *   out/voice/full.mp3         整条
 *   out/voice/timeline.json    每句的真实起止时间
 *
 * 为什么要逐句：整段一次性合成，断句和停顿不受控；
 * 逐句合成能拿到每句真实时长，字幕时间轴就不用靠字数估了。
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const epArg = process.argv[2];
const args = process.argv.slice(3);
const pickArg = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);

const voice = pickArg('--voice', 'male-qn-jingying');
const speed = Number(pickArg('--speed', '1.06'));

if (!epArg) {
  console.error('用法: node scripts/voice-episode.mjs episodes/<期号> [--voice ...]');
  process.exit(1);
}

function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return {};
  const out = {};
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const KEY = loadEnv().MINIMAX_API_KEY;
if (!KEY) {
  console.error('缺 MINIMAX_API_KEY');
  process.exit(1);
}

// 解析稿件：01 [5s] 台词
const scriptPath = path.join(ROOT, epArg, 'script.md');
const lines = fs
  .readFileSync(scriptPath, 'utf8')
  .split('\n')
  .map((l) => l.match(/^(\d+)\s*\[(\d+)s\]\s*(.+)$/))
  .filter(Boolean)
  .map((m) => ({ no: Number(m[1]), text: m[3].trim() }));

if (!lines.length) {
  console.error('script.md 里没解析出句子（格式应为：01 [5s] 台词）');
  process.exit(1);
}
console.log(`解析到 ${lines.length} 句`);

const outDir = path.join(ROOT, 'out', 'voice');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

async function synth(text) {
  const res = await fetch('https://api.minimaxi.com/v1/t2a_v2', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'speech-02-hd',
      text,
      stream: false,
      voice_setting: { voice_id: voice, speed, vol: 1.15, pitch: 1, emotion: 'happy' },
      audio_setting: { sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1 },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  if (json?.base_resp?.status_code !== 0) {
    throw new Error(`${json?.base_resp?.status_code}: ${json?.base_resp?.status_msg}`);
  }
  if (!json?.data?.audio) throw new Error('没拿到音频');
  return Buffer.from(json.data.audio, 'hex');
}

/** 用 ffmpeg 读 mp3 真实时长 */
function durationOf(file) {
  const r = spawnSync(ffmpeg.path, ['-i', file], { encoding: 'utf8' });
  const m = `${r.stderr ?? ''}`.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const parts = [];
let cursor = 0;

for (const line of lines) {
  const name = `l${String(line.no).padStart(2, '0')}.mp3`;
  const file = path.join(outDir, name);
  // 接口有每分钟请求数上限，逐句连续打会被限流，所以带退避重试
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let buf;
  for (let attempt = 0; ; attempt++) {
    try {
      buf = await synth(line.text);
      break;
    } catch (e) {
      const limited = /rate limit|1002|429/i.test(e.message);
      if (attempt >= 4) {
        console.error(`✗ 第 ${line.no} 句：${e.message}`);
        process.exit(1);
      }
      await sleep(limited ? 8000 : 1500);
    }
  }
  await sleep(400);
  fs.writeFileSync(file, buf);
  let dur = durationOf(file);
  if (!dur) dur = line.text.length / 4.2; // 兜底估算
  // 每句之间留 0.22 秒呼吸，念起来才不像连珠炮
  const gap = 0.22;
  parts.push({ no: line.no, text: line.text, file: name, start: Number(cursor.toFixed(2)), end: Number((cursor + dur).toFixed(2)) });
  cursor += dur + gap;
  process.stdout.write(` ${line.no}`);
}

// 拼接：每句后插一段静音
const sil = path.join(outDir, 'gap.mp3');
spawnSync(ffmpeg.path, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=32000:cl=mono', '-t', '0.22', '-q:a', '9', sil], { stdio: 'ignore' });

const listFile = path.join(outDir, 'list.txt');
const listLines = [];
// concat 列表里的路径必须是绝对路径，否则 ffmpeg 从当前目录找，找不到
for (const p of parts) {
  listLines.push(`file '${path.join(outDir, p.file).replace(/\\/g, '/')}'`);
  listLines.push(`file '${sil.replace(/\\/g, '/')}'`);
}
fs.writeFileSync(listFile, listLines.join('\n'), 'utf8');

const full = path.join(outDir, 'full.mp3');
const r = spawnSync(
  ffmpeg.path,
  ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', full],
  { encoding: 'utf8' },
);
if (!fs.existsSync(full)) {
  console.error('拼接失败：' + (r.stderr ?? '').slice(-300));
  process.exit(1);
}

const total = durationOf(full);
fs.writeFileSync(
  path.join(outDir, 'timeline.json'),
  JSON.stringify({ voice, speed, total, parts }, null, 2),
);

console.log(`\n✓ ${path.relative(ROOT, full)}  总长 ${total?.toFixed(2)}s  音色=${voice}`);
console.log(`✓ out/voice/timeline.json`);
