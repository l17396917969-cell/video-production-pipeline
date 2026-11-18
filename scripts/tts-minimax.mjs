#!/usr/bin/env node
/**
 * MiniMax 配音
 *
 * 用法：
 *   node scripts/tts-minimax.mjs --text "一句话"              合成单句
 *   node scripts/tts-minimax.mjs --text "..." --voice male-qn-qingse --speed 1.05
 *   node scripts/tts-minimax.mjs --compare                    听几个音色
 *   node scripts/tts-minimax.mjs --file episodes/t3code/script.md   整期合成
 *
 * key 从 .env 读，不要写死在代码里。
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

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

const env = loadEnv();
const KEY = env.MINIMAX_API_KEY;
const args = process.argv.slice(2);

function pick(flag, fallback) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
}

if (!KEY) {
  console.error('缺 MINIMAX_API_KEY。复制 .env.example 为 .env 并填上。');
  process.exit(1);
}

/** 调一次合成，返回 mp3 Buffer */
async function synth(text, voice, speed) {
  const body = {
    model: 'speech-02-hd',
    text,
    stream: false,
    voice_setting: { voice_id: voice, speed, vol: 1, pitch: 0 },
    audio_setting: { sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1 },
  };

  const res = await fetch('https://api.minimaxi.com/v1/t2a_v2', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 300)}`);
  }

  const json = await res.json();
  const code = json?.base_resp?.status_code;
  if (code !== 0) {
    throw new Error(`接口返回 ${code}: ${json?.base_resp?.status_msg} ${JSON.stringify(json).slice(0, 200)}`);
  }

  const hex = json?.data?.audio;
  if (!hex) throw new Error(`没有拿到音频：${JSON.stringify(json).slice(0, 200)}`);
  return Buffer.from(hex, 'hex');
}

const outDir = path.join(ROOT, 'out', 'tts');
fs.mkdirSync(outDir, { recursive: true });

// ---- 对比模式 ----
if (args.includes('--compare')) {
  const text =
    '我花了两小时把 T3 Code 装上，先给结论：它解决的不是写代码的问题。六万三千星，但它不是编辑器。';
  const voices = [
    ['male-qn-qingse', '青涩青年'],
    ['male-qn-jingying', '精英青年'],
    ['female-shaonv', '少女'],
    ['female-yujie', '御姐'],
  ];
  for (const [id, name] of voices) {
    try {
      const buf = await synth(text, id, 1.0);
      const f = path.join(outDir, `compare-${id}.mp3`);
      fs.writeFileSync(f, buf);
      console.log(`✓ ${name}（${id}） ${(buf.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.error(`✗ ${name}（${id}） ${e.message}`);
    }
  }
  process.exit(0);
}

// ---- 单句 ----
const text = pick('--text');
if (!text) {
  console.error('缺 --text，或者用 --compare 试音色');
  process.exit(1);
}

const voice = pick('--voice', 'male-qn-jingying');
const speed = Number(pick('--speed', '1.0'));
const out = pick('--out', path.join(outDir, 'line.mp3'));

try {
  const buf = await synth(text, voice, speed);
  fs.writeFileSync(out, buf);
  console.log(`✓ ${path.relative(ROOT, out)} ${(buf.length / 1024).toFixed(0)} KB  音色=${voice} 语速=${speed}`);
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
