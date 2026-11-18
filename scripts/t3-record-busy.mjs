#!/usr/bin/env node
/**
 * 录一段"真的在干活"的界面
 *
 * 上一版失败原因：点错了按钮（打开了命令面板），prompt 被输进搜索框。
 * 这次按 t3-record-scenes.mjs 里验证过的路径走：
 *   1. button[aria-label="New thread"]
 *   2. [role="textbox"] 或 textarea
 *   3. insertText + Enter
 *   4. 等真实输出出现，再开始录
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUTH = path.join(ROOT, 'out', 't3-auth.json');
const MATERIAL = path.join(ROOT, 'episodes', 't3code', 'material');
const FFMPEG = path.join(ROOT, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
fs.mkdirSync(MATERIAL, { recursive: true });

const scheme = process.argv[2] === 'light' ? 'light' : 'dark';
const OUT = path.join(MATERIAL, scheme === 'dark' ? 't3-busy.mp4' : 't3-busy-light.mp4');

const TASKS = [
  '把 util.ts 里现有的函数都补上 JSDoc 注释，并在 README 里列出每个函数',
  '给 util.ts 写一个 vitest 测试文件，覆盖每个导出函数，跑通后告诉我结果',
  '检查 README.md 和 package.json 是否一致，把不一致的地方修掉',
];

const rawDir = path.join(ROOT, 'out', `busy-${scheme}`);
fs.rmSync(rawDir, { recursive: true, force: true });
fs.mkdirSync(rawDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: scheme,
  recordVideo: { dir: rawDir, size: { width: 1600, height: 1000 } },
  ...(fs.existsSync(AUTH) ? { storageState: AUTH } : {}),
});
const page = await ctx.newPage();

const shot = (name) => page.screenshot({ path: path.join(ROOT, 'out', `busy-${name}.png`) }).catch(() => {});

console.log(`1. 打开（${scheme}）`);
await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
await shot('01-open');

/** 起一个任务：走验证过的路径 */
const startTask = async (prompt) => {
  const newBtn = page.locator('button[aria-label="New thread"]').first();
  if (await newBtn.count()) {
    await newBtn.click();
  } else {
    await page.keyboard.press('Control+Alt+N');
  }
  await page.waitForTimeout(2600);

  let box = page.locator('[role="textbox"]').first();
  if (!(await box.count())) box = page.locator('textarea').first();
  if (!(await box.count())) {
    console.log('   ✗ 找不到输入框');
    return false;
  }

  await box.click({ force: true, timeout: 9000 }).catch(() => {});
  await page.keyboard.insertText(prompt);
  await page.waitForTimeout(900);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  return true;
};

console.log('2. 起三个任务');
for (let i = 0; i < TASKS.length; i++) {
  const ok = await startTask(TASKS[i]);
  console.log(`   任务 ${i + 1} ${ok ? '已提交' : '失败'}`);
  await shot(`02-task${i + 1}`);
}

console.log('3. 等它们真的开始干活（25 秒）');
await page.waitForTimeout(25000);
await shot('03-working');

console.log('4. 录制期间做真实浏览：切任务、滚动、看 diff');
for (let round = 0; round < 6; round++) {
  // 点开第 i 个任务
  const items = page.locator('[role="button"], a, [class*="thread"]').filter({ hasText: /util|README|test|注释|测试|检查/i });
  const n = await items.count();
  if (n > 0) {
    await items.nth(round % n).click({ timeout: 3000 }).catch(() => {});
  }
  await page.waitForTimeout(3000);

  // 滚动看输出
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, -140);
  await page.waitForTimeout(1600);

  // 试着打开 diff 面板
  const diffBtn = page.locator('button, a, [role="button"]').filter({ hasText: /diff|changed/i }).first();
  if (await diffBtn.count()) {
    await diffBtn.click({ timeout: 2500 }).catch(() => {});
    await page.waitForTimeout(2600);
  }
  await shot(`04-round${round + 1}`);
}

await page.waitForTimeout(3000);
await ctx.close();
await browser.close();

const vids = fs.readdirSync(rawDir).filter((f) => f.endsWith('.webm'));
const latest = vids
  .map((f) => ({ f, t: fs.statSync(path.join(rawDir, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t)[0];
if (!latest) {
  console.error('没录到东西');
  process.exit(1);
}
const r = spawnSync(
  FFMPEG,
  ['-y', '-i', path.join(rawDir, latest.f), '-vf', 'fps=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', OUT],
  { encoding: 'utf8' },
);
console.log(r.status === 0 ? `✓ ${OUT}` : `转码失败：${r.stderr?.slice(-400)}`);
