#!/usr/bin/env node
/**
 * 录制 T3 Code 的真实操作
 *
 * 前提：T3 Code 服务在跑，且 out/t3-state.json 是有效的登录态。
 * 用法：node scripts/t3-record.mjs [秒数]
 * 产出：episodes/t3code/material/t3-live.mp4 + out/t3-rec-final.png
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.T3_PORT ?? 4780);
const BASE = `http://localhost:${PORT}`;
const SECONDS = Number(process.argv[2] ?? 80);

const PROMPT = '读一下这个目录里的 storyboard.md，用三句话总结这期视频讲了什么';

const statePath = path.join(ROOT, 'out', 't3-state.json');
if (!fs.existsSync(statePath)) {
  console.error('缺少登录态，先跑 node scripts/t3-probe.mjs <token>');
  process.exit(1);
}

const recDir = path.join(ROOT, 'out', 't3-rec');
fs.rmSync(recDir, { recursive: true, force: true });
fs.mkdirSync(recDir, { recursive: true });

const matDir = path.join(ROOT, 'episodes', 't3code', 'material');
fs.mkdirSync(matDir, { recursive: true });

const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: statePath,
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: recDir, size: { width: 1920, height: 1080 } },
  colorScheme: 'dark',
});
const page = await context.newPage();

console.log('打开 T3 Code…');
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4500);

// 新建线程，从干净状态开始
const newThread = page.locator('button[aria-label="New thread"]').first();
if (await newThread.count()) {
  await newThread.click();
  await page.waitForTimeout(2000);
}
console.log('已新建线程');

// 输入任务
const box = page.locator('[role="textbox"]').first();
await box.click();
await page.waitForTimeout(500);
await box.fill(PROMPT);
await page.waitForTimeout(1200);
console.log('已输入任务，提交');

await page.keyboard.press('Enter');

console.log(`录制 ${SECONDS} 秒…`);
// 前 12 秒不动，让 agent 开始；之后轻微滚动跟随
await page.waitForTimeout(12000);
await page.mouse.wheel(0, 260);
await page.waitForTimeout(SECONDS * 1000 - 12000 - 8000);
await page.mouse.wheel(0, 320);

await page.waitForTimeout(7000);
await page.screenshot({ path: path.join(ROOT, 'out', 't3-rec-final.png') });

await context.close();
await browser.close();

const webm = fs
  .readdirSync(recDir)
  .filter((f) => f.endsWith('.webm'))
  .map((f) => path.join(recDir, f))[0];

if (!webm) {
  console.error('没有拿到录像文件');
  process.exit(1);
}

const out = path.join(matDir, 't3-live.mp4');
console.log('转码 mp4…');
await new Promise((resolve, reject) => {
  const p = spawn(ffmpeg.path, [
    '-y', '-i', webm,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', out,
  ], { stdio: 'ignore' });
  p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('ffmpeg 失败'))));
});

console.log(`✓ ${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB`);
