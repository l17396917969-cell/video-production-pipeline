#!/usr/bin/env node
/**
 * 配音
 *
 * 用法：
 *   node scripts/tts.mjs --compare            听几个音色（含中英混读测试句）
 *   node scripts/tts.mjs --text "一句话"       单句合成
 *   node scripts/tts.mjs --script ep/script.md 逐句合成 + 时间轴 + SRT
 *
 * 默认 provider=edge（免费、免 key）。要换克隆声音，在 synthesize() 里加分支，
 * 不要改调用方。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
const ffmpegPath = ffmpeg.path;

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d = null) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const VOICES = [
  { id: 'zh-CN-YunxiNeural', name: '云希 · 男 · 年轻', note: '首选，技术口播常用' },
  { id: 'zh-CN-YunyangNeural', name: '云扬 · 男 · 新闻', note: '更稳，适合讲解' },
  { id: 'zh-CN-YunjianNeural', name: '云健 · 男 · 浑厚', note: '低沉，适合观点' },
  { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓 · 女 · 通用', note: '女声默认' },
  { id: 'zh-CN-XiaoyiNeural', name: '晓伊 · 女 · 年轻', note: '轻快' },
];

const COMPARE_TEXT =
  '这个项目叫 MCP，全称是 Model Context Protocol。用 vibe coding 的方式，两小时能跑通一个 Agent 的 demo。';

/* ---------- 术语规范化 ---------- */
function loadDict() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pronounce.json'), 'utf8')).map ?? {};
  } catch {
    return {};
  }
}

function normalize(text) {
  const map = loadDict();
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  let out = text;
  for (const k of keys) out = out.split(k).join(map[k]);
  return out;
}

/* ---------- 合成 ---------- */
async function synthesize(text, voice, outFile, { rate = 1.0 } = {}) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');

  const tts = new MsEdgeTTS({ connectionTimeoutMs: 20000, synthesisTimeoutMs: 90000 });
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
    wordBoundaryEnabled: true,
  });

  const { audioStream, metadataStream } = tts.toStream(normalize(text), { rate });

  let meta = '';
  if (metadataStream) {
    metadataStream.on('data', (d) => (meta += d.toString()));
  }

  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(outFile);
    audioStream.on('error', reject);
    ws.on('error', reject);
    ws.on('finish', resolve);
    audioStream.pipe(ws);
  });

  tts.close();

  let durationSec = 0;
  try {
    const j = JSON.parse(meta);
    const b = j.Metadata?.find((m) => m.Type === 'WordBoundary' || m.Type === 'SentenceBoundary');
    if (b) durationSec = (b.Data.Offset + b.Data.Duration) / 1e7;
  } catch {
    /* 没有边界信息就不写时长，后面用 ffmpeg 补 */
  }

  return { durationSec: durationSec || (await ffDuration(outFile)) };
}

/* ---------- 读音频时长 ---------- */
function ffDuration(file) {
  return new Promise((resolve) => {
    const p = spawn(ffmpegPath, ['-i', file, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', () => {
      const m = err.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (!m) return resolve(0);
      resolve(+m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]));
    });
  });
}

/* ---------- 解析逐字稿 ---------- */
function parseScript(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = [];
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d{1,3})\s*\[[^\]]*\]\s*(?:\(([^)]*)\))?\s*(.+?)\s*$/);
    if (m) lines.push({ no: m[1], hint: (m[2] ?? '').trim(), text: m[3].trim() });
  }
  return lines;
}

/* ---------- SRT ---------- */
const ts = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(3).replace('.', ',');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec.padStart(6, '0')}`;
};

function toSrt(segments) {
  return segments
    .map((s, i) => `${i + 1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.text}\n`)
    .join('\n');
}

/* ---------- 主流程 ---------- */
async function main() {
  const outDir = path.join(ROOT, 'out', 'tts');
  fs.mkdirSync(outDir, { recursive: true });

  /* 模式一：音色对比 */
  if (flag('--compare')) {
    console.log(`\n音色对比（含中英混读测试）\n`);
    for (const v of VOICES) {
      const f = path.join(outDir, `compare-${v.id}.mp3`);
      process.stdout.write(`  ${v.name} … `);
      try {
        const { durationSec } = await synthesize(COMPARE_TEXT, v.id, f);
        console.log(`${durationSec.toFixed(1)}s  → ${path.relative(ROOT, f)}`);
      } catch (e) {
        console.log(`失败: ${e.message}`);
      }
    }
    console.log(`\n用播放器听一遍，重点听：MCP、Model Context Protocol、vibe coding、Agent\n`);
    return;
  }

  /* 模式二：单句 */
  if (opt('--text')) {
    const voice = opt('--voice', 'zh-CN-YunxiNeural');
    const f = path.join(outDir, 'single.mp3');
    const { durationSec } = await synthesize(opt('--text'), voice, f);
    console.log(`\n✓ ${durationSec.toFixed(2)}s → ${path.relative(ROOT, f)}\n`);
    return;
  }

  /* 模式三：整篇 */
  const scriptPath = opt('--script');
  if (!scriptPath) {
    console.log(`
用法：
  node scripts/tts.mjs --compare                听音色
  node scripts/tts.mjs --text "一句话"           单句
  node scripts/tts.mjs --script <script.md>     整篇（逐句 + 时间轴 + SRT）
`);
    process.exit(0);
  }

  const abs = path.isAbsolute(scriptPath) ? scriptPath : path.join(ROOT, scriptPath);
  const lines = parseScript(abs);
  if (lines.length === 0) {
    console.error(`没解析出句子。逐字稿格式应为：01 [4s] (对比) 正文`);
    process.exit(1);
  }

  const epDir = path.dirname(abs);
  const audioDir = path.join(epDir, 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  const voice = opt('--voice', 'zh-CN-YunxiNeural');
  const rate = Number(opt('--rate', '1.0'));
  console.log(`\n逐句合成 ${lines.length} 句 · ${voice} · 语速 ${rate}\n`);

  const segments = [];
  let cursor = 0;

  for (const l of lines) {
    const f = path.join(audioDir, `s${l.no.padStart(2, '0')}.mp3`);
    process.stdout.write(`  ${l.no.padStart(2, '0')} … `);
    try {
      const { durationSec } = await synthesize(l.text, voice, f, { rate });
      segments.push({
        no: l.no,
        text: l.text,
        hint: l.hint,
        file: path.relative(epDir, f),
        start: +cursor.toFixed(3),
        end: +(cursor + durationSec).toFixed(3),
        dur: +durationSec.toFixed(3),
      });
      console.log(`${durationSec.toFixed(2)}s`);
      cursor += durationSec;
    } catch (e) {
      console.log(`失败: ${e.message}`);
    }
  }

  fs.writeFileSync(
    path.join(audioDir, 'timeline.json'),
    JSON.stringify({ voice, total: +cursor.toFixed(3), segments }, null, 2),
    'utf8',
  );
  fs.writeFileSync(path.join(audioDir, 'subtitle.srt'), toSrt(segments), 'utf8');

  console.log(`\n总时长 ${cursor.toFixed(1)}s`);
  console.log(`✓ audio/timeline.json`);
  console.log(`✓ audio/subtitle.srt\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
