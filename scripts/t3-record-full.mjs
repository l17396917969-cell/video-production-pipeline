#!/usr/bin/env node
/**
 * 录 T3 Code 的完整流程：打开页面 → 配对 → 进主界面 → 发任务 → agent 跑完
 *
 * 前提：T3 Code 服务已启动，且启动日志里能拿到 pairing token。
 * 用法：node scripts/t3-record-full.mjs <pairingToken> [秒数]
 * 产出：episodes/t3code/material/t3-setup.mp4
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.T3_PORT ?? 4780);
const BASE = `http://localhost:${PORT}`;
const token = process.argv[2];
const SECONDS = Number(process.argv[3] ?? 110);

if (!token) {
  console.error('用法: node scripts/t3-record-full.mjs <pairingToken> [秒数]');
  process.exit(1);
}

const recDir = path.join(ROOT, 'out', 't3-rec-full');
fs.rmSync(recDir, { recursive: true, force: true });
fs.mkdirSync(recDir, { recursive: true });

const matDir = path.join(ROOT, 'episodes', 't3code', 'material');
fs.mkdirSync(matDir, { recursive: true });

const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: recDir, size: { width: 1920, height: 1080 } },
  colorScheme: 'dark',
});
const page = await context.newPage();

console.log('1. 打开配对页（未登录状态）');
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

const hasPair = await page.getByText('Pair with this environment', { exact: false }).count();
console.log('   配对页出现:', hasPair > 0);

if (hasPair) {
  console.log('2. 手动输入配对令牌（真实操作）');
  const input = page.locator('input').first();
  await input.click();
  await page.waitForTimeout(700);
  await input.fill(token);
  await page.waitForTimeout(1200);
  const cont = page.getByRole('button', { name: 'Continue' }).first();
  if (await cont.count()) {
    await cont.click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(7000);
}

console.log('3. 进主界面');
await page.waitForTimeout(6000);

console.log('   当前 URL:', page.url());
await page.screenshot({ path: path.join(ROOT, 'out', 't3-full-after-pair.png') });
const brief = await page.evaluate(() =>
  document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 600),
);
console.log('   页面文本:', brief.replace(/\n/g, ' | ').slice(0, 300));

// 新建线程
const newThread = page.locator('button[aria-label="New thread"]').first();
if (await newThread.count()) {
  await newThread.click();
  await page.waitForTimeout(2500);
}

console.log('4. 输入任务');
// 不同版本的可编辑区实现不一样，几种选择器都试一遍
let box = page.locator('[role="textbox"]').first();
if (!(await box.count())) box = page.locator('textarea').first();
if (!(await box.count())) box = page.locator('[contenteditable="true"]').first();
if (!(await box.count())) {
  await page.screenshot({ path: path.join(ROOT, 'out', 't3-full-no-box.png') });
  throw new Error('找不到输入框，已截图 out/t3-full-no-box.png');
}
await box.click();
await page.waitForTimeout(600);
await box.fill('列出这个目录里所有 .md 文件，各用一句话说明用途');
await page.waitForTimeout(1800);

console.log('5. 提交，让它跑');
await page.keyboard.press('Enter');

// 录完整个执行过程
const remain = Math.max(20, SECONDS - 30);
console.log(`6. 录制 ${remain} 秒执行过程`);
await page.waitForTimeout(14000);
await page.mouse.wheel(0, 220);
await page.waitForTimeout(remain * 1000 - 16000);
await page.mouse.wheel(0, 260);
await page.waitForTimeout(6000);

await page.screenshot({ path: path.join(ROOT, 'out', 't3-full-final.png') });

await context.close();
await browser.close();

const webm = fs
  .readdirSync(recDir)
  .filter((f) => f.endsWith('.webm'))
  .map((f) => path.join(recDir, f))[0];

if (!webm) {
  console.error('没拿到录像');
  process.exit(1);
}

const out = path.join(matDir, 't3-setup.mp4');
console.log('转码…');
await new Promise((resolve, reject) => {
  const p = spawn(ffmpeg.path, [
    '-y', '-i', webm,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', out,
  ], { stdio: 'ignore' });
  p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('ffmpeg 失败'))));
});

console.log(`✓ ${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB`);
