#!/usr/bin/env node
/**
 * 录「开一个隔离副本」的完整过程，用于第 12 句
 *
 * 用法：node scripts/t3-record-worktree.mjs
 * 前提：out/t3-auth.json 里有登录态（跑过一次 probe-workspace.mjs 就有）
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUTH = path.join(ROOT, 'out', 't3-auth.json');
if (!fs.existsSync(AUTH)) {
  console.error('缺 out/t3-auth.json，先跑一次 probe-workspace.mjs <令牌>');
  process.exit(1);
}

const rawDir = path.join(ROOT, 'out', 'wt-frames');
fs.rmSync(rawDir, { recursive: true, force: true });
fs.mkdirSync(rawDir, { recursive: true });
const shotDir = path.join(ROOT, 'out', 'wt-shots');
fs.mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  storageState: AUTH,
  recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } },
});
const page = await ctx.newPage();
const snap = (n) => page.screenshot({ path: path.join(shotDir, `${n}.png`) }).catch(() => {});

await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

console.log('1. 新建线程');
await page.locator('button[aria-label="New thread"]').first().click();
await page.waitForTimeout(1500);
await page.keyboard.press('Enter');
await page.waitForTimeout(3000);
await snap('01-new-thread');

console.log('2. 切到 New worktree');
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('[data-composer-context-control="true"]')];
  btns.find((b) => b.getBoundingClientRect().width > 0)?.click();
});
await page.waitForTimeout(1500);
await snap('02-menu');

// 菜单项不是标准 button，按文字定位，再退到坐标点
let switched = false;
try {
  await page.getByText('New worktree', { exact: true }).first().click({ timeout: 6000 });
  switched = true;
} catch {
  try {
    await page.mouse.click(700, 616);
    switched = true;
  } catch {}
}
await page.waitForTimeout(2000);
console.log(switched ? '   已点 New worktree' : '   点击失败');
await snap('03-worktree-mode');

console.log('3. 派任务');
const prompt = '给 util.ts 加一个 multiply 函数，并在 README 补一句说明。';
await page.evaluate((text) => {
  const box = [...document.querySelectorAll('[data-testid="composer-editor"]')].find(
    (el) => el.getBoundingClientRect().width > 0,
  );
  box?.focus();
  box.textContent = text;
  box.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
}, prompt);
await page.waitForTimeout(1500);
await snap('04-typed');
await page.keyboard.press('Enter');

console.log('4. 等它跑');
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(5000);
  await snap(`05-run-${(i + 1) * 5}s`);
  const done = await page.getByText(/Worked for|Done/i).count();
  if (done > 0 && i > 5) {
    console.log(`   约 ${(i + 1) * 5}s 完成`);
    await page.waitForTimeout(6000);
    await snap('06-done');
    break;
  }
}

const video = page.video();
await ctx.close();
await browser.close();

const raw = await video.path();
const outDir = path.join(ROOT, 'episodes', 't3code', 'material');
fs.mkdirSync(outDir, { recursive: true });
const final = path.join(outDir, 't3-worktree.mp4');
await new Promise((res, rej) => {
  const p = spawn(ffmpeg.path, ['-y', '-i', raw, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-an', final], {
    stdio: 'ignore',
  });
  p.on('close', (c) => (c === 0 ? res() : rej(new Error('转码失败'))));
});
console.log(`\n✓ ${path.relative(ROOT, final)}`);
