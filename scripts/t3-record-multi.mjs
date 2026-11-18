#!/usr/bin/env node
/**
 * 录一段"多个 agent 并行"的真实素材
 *
 * 用法：node scripts/t3-record-multi.mjs <配对令牌> [录制秒数]
 * 产出：episodes/t3code/material/t3-multi.mp4
 *
 * 为什么要专门录这个：T3 Code 最独特的画面不是界面本身，
 * 是"四个 agent 同时在不同文件上干活、进度条各走各的"。
 * 这必须真跑出来才有说服力，截图和组件都替代不了。
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const token = process.argv[2];
const recordSec = Number(process.argv[3] ?? 95);
const BASE = 'http://localhost:4780';
if (!token) {
  console.error('缺少配对令牌');
  process.exit(1);
}

const rawDir = path.join(ROOT, 'out', 'multi-frames');
fs.rmSync(rawDir, { recursive: true, force: true });
fs.mkdirSync(rawDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } },
});
const page = await ctx.newPage();

console.log('1. 打开');
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);

const hasPair = await page.getByText('Pair with this environment').count();
if (hasPair) {
  console.log('2. 配对');
  const input = page.locator('input').first();
  await input.click();
  await input.fill(token);
  await page.waitForTimeout(900);
  const cont = page.getByRole('button', { name: 'Continue' }).first();
  if (await cont.count()) await cont.click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
}

console.log('3. 新建线程');
const newBtn = page.locator('button[aria-label="New thread"]').first();
if (await newBtn.count()) await newBtn.click();
await page.waitForTimeout(2500);

console.log('4. 输入一个会触发并行的任务');
let box = page.locator('[role="textbox"]').first();
if (!(await box.count())) box = page.locator('textarea').first();
if (!(await box.count())) {
  await page.screenshot({ path: path.join(ROOT, 'out', 'multi-nobox.png') });
  throw new Error('找不到输入框');
}
await box.click();
const prompt =
  '并行处理：分别读取 script.md、plan.md、review.md、storyboard.md 四个文件，' +
  '对每个文件各用一个 subagent，最后汇总成一张表格：文件名 / 主要讲什么 / 有什么问题。';
await box.fill(prompt);
await page.waitForTimeout(1200);
await page.keyboard.press('Enter');

console.log(`5. 录 ${recordSec} 秒`);
// 中途抓几帧，便于事后挑画面
const marks = [8, 20, 35, 50, 65, 80];
for (let t = 0; t < recordSec; t += 5) {
  await page.waitForTimeout(5000);
  if (marks.includes(t)) {
    await page.screenshot({ path: path.join(ROOT, 'out', `multi-${t + 5}s.png`) }).catch(() => {});
    console.log(`   ${t + 5}s 已截图`);
  }
}

const video = page.video();
await ctx.close();
await browser.close();

const rawMp4 = await video.path();
const outDir = path.join(ROOT, 'episodes', 't3code', 'material');
fs.mkdirSync(outDir, { recursive: true });
const final = path.join(outDir, 't3-multi.mp4');

await new Promise((resolve, reject) => {
  const p = spawn(
    ffmpeg.path,
    ['-y', '-i', rawMp4, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-an', final],
    { stdio: 'inherit' },
  );
  p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('转码失败'))));
});

const mb = (fs.statSync(final).size / 1024 / 1024).toFixed(1);
console.log(`✓ ${path.relative(ROOT, final)}  ${mb} MB`);
