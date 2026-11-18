#!/usr/bin/env node
/**
 * 录 T3 Code 的关键场景，用于第 03/05/07/12/15 句的画面
 *
 * 用法：node scripts/t3-record-scenes.mjs <配对令牌>
 * 产出：episodes/t3code/material/t3-scenes.mp4 + 若干关键帧截图
 *
 * 录什么：
 *   1. 跑一个真实任务（产生 checkpoint）
 *   2. 任务结束后的 diff 卡片
 *   3. 设置页里"新线程默认在哪"
 *   4. 回滚操作
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUTH_FILE = path.join(ROOT, 'out', 't3-auth.json');
const hasAuth = fs.existsSync(AUTH_FILE);
const token = process.argv[2];
if (!token && !hasAuth) {
  console.error('缺少配对令牌');
  process.exit(1);
}

const rawDir = path.join(ROOT, 'out', 'scenes-frames');
fs.rmSync(rawDir, { recursive: true, force: true });
fs.mkdirSync(rawDir, { recursive: true });

const shotDir = path.join(ROOT, 'out', 'scenes-shots');
fs.mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  colorScheme: 'light',
  ...(hasAuth ? { storageState: AUTH_FILE } : {}),
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } },
});
const page = await ctx.newPage();

const snap = (name) => page.screenshot({ path: path.join(shotDir, `${name}.png`) }).catch(() => {});

console.log('1. 打开并配对');
await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);

if (!hasAuth && await page.getByText('Pair with this environment').count()) {
  const input = page.locator('input').first();
  await input.click();
  await input.fill(token);
  await page.waitForTimeout(800);
  const cont = page.getByRole('button', { name: 'Continue' }).first();
  if (await cont.count()) await cont.click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
}
await snap('01-main');

console.log('2. 新建线程并派任务');
const newBtn = page.locator('button[aria-label="New thread"]').first();
if (await newBtn.count()) await newBtn.click();
await page.waitForTimeout(2500);

let box = page.locator('[role="textbox"]').first();
if (!(await box.count())) box = page.locator('textarea').first();
if (!(await box.count())) {
  await snap('02-nobox');
  throw new Error('找不到输入框');
}
// 输入框可能被 inert 挡住，强制聚焦 + 用键盘输入最稳
const prompt = '在 util.ts 里加一个 multiply 函数，并在 README 里补一句说明。改完告诉我改了哪些文件。';
let typed = false;
try {
  await box.click({ force: true, timeout: 8000 });
  await page.keyboard.insertText(prompt);
  typed = true;
} catch {
  try {
    await box.evaluate((el, t) => {
      el.focus();
      el.textContent = t;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: t }));
    }, prompt);
    typed = true;
  } catch (e) {
    await snap('02-typefail');
    throw new Error('输入不进去：' + e.message);
  }
}
await page.waitForTimeout(1500);
await snap('02-typed');
await page.keyboard.press('Enter');

console.log('3. 等它跑（最多 100 秒）');
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(5000);
  await snap(`03-run-${String((i + 1) * 5).padStart(3, '0')}s`);
  console.log(`   ${(i + 1) * 5}s`);
  // 出现 diff/改动卡片就认为跑完了
  const done = await page.getByText(/Changed|Files changed|\+\d+\s*−\d+/i).count();
  if (done > 0 && i > 6) {
    console.log('   检测到改动卡片，继续多录 15 秒');
    for (let k = 0; k < 3; k++) {
      await page.waitForTimeout(5000);
      await snap(`04-diff-${k + 1}`);
    }
    break;
  }
}

console.log('4. 打开设置页');
try {
  await page.goto('http://localhost:4780/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await snap('05-settings');
  // 找 worktree / 新线程 相关区域
  for (const t of ['worktree', 'Worktree', 'default', 'thread']) {
    const el = page.getByText(t, { exact: false }).first();
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(1500);
      await snap(`06-settings-${t}`);
    }
  }
} catch (e) {
  console.log('   设置页没打开：' + e.message);
}

await page.waitForTimeout(2000);
const video = page.video();
await ctx.close();
await browser.close();

const rawMp4 = await video.path();
const outDir = path.join(ROOT, 'episodes', 't3code', 'material');
fs.mkdirSync(outDir, { recursive: true });
const final = path.join(outDir, 't3-scenes.mp4');

await new Promise((resolve, reject) => {
  const p = spawn(ffmpeg.path, ['-y', '-i', rawMp4, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-an', final], {
    stdio: 'ignore',
  });
  p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('转码失败'))));
});

const mb = (fs.statSync(final).size / 1024 / 1024).toFixed(1);
console.log(`\n✓ ${path.relative(ROOT, final)}  ${mb} MB`);
console.log(`✓ 截图 ${fs.readdirSync(shotDir).length} 张在 out/scenes-shots/`);
