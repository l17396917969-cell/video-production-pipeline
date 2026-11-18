#!/usr/bin/env node
/**
 * 补录 2 倍分辨率素材
 *
 * 为什么要 2 倍：世界级产品片的镜头能"戳"到某个具体元素，
 * 推到 2 倍、3 倍仍然锐利。1600 宽的素材推 1.3 倍就糊了。
 *
 * 做法：
 *   viewport 1600×1000，deviceScaleFactor 2 → 实际像素 3200×2000
 *   录更长时间，覆盖完整流程：派活 → 并行跑 → 出结果 → 展开 diff
 *   动作要慢、要稳，不要来回抖，方便后面推镜
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
const OUT = path.join(MATERIAL, scheme === 'dark' ? 't3-hi.mp4' : 't3-hi-light.mp4');

const TASKS = [
  '把 util.ts 里现有的函数都补上 JSDoc 注释，并在 README 里列出每个函数',
  '给 util.ts 写一个 vitest 测试文件，覆盖每个导出函数，跑通后告诉我结果',
  '检查 README.md 和 package.json 是否一致，把不一致的地方修掉',
];

const rawDir = path.join(ROOT, 'out', `hi-${scheme}`);
fs.rmSync(rawDir, { recursive: true, force: true });
fs.mkdirSync(rawDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 3200, height: 2000 },
  colorScheme: scheme,
  recordVideo: { dir: rawDir, size: { width: 3200, height: 2000 } },
  ...(fs.existsSync(AUTH) ? { storageState: AUTH } : {}),
});
const page = await ctx.newPage();

const shot = (name) => page.screenshot({ path: path.join(ROOT, 'out', `hi-${name}.png`) }).catch(() => {});

console.log(`1. 打开（${scheme}，2x）`);
await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);

const startTask = async (prompt) => {
  const newBtn = page.locator('button[aria-label="New thread"]').first();
  if (await newBtn.count()) await newBtn.click();
  else await page.keyboard.press('Control+Alt+N');
  await page.waitForTimeout(2800);

  let box = page.locator('[role="textbox"]').first();
  if (!(await box.count())) box = page.locator('textarea').first();
  if (!(await box.count())) return false;

  await box.click({ force: true, timeout: 9000 }).catch(() => {});
  await page.keyboard.insertText(prompt);
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2200);
  return true;
};

console.log('2. 派三个任务');
for (let i = 0; i < TASKS.length; i++) {
  console.log(`   任务 ${i + 1} ${(await startTask(TASKS[i])) ? '已提交' : '失败'}`);
}

console.log('3. 等它们跑（40 秒，让它长出真实输出）');
await page.waitForTimeout(40000);
await shot('01-running');

console.log('4. 慢速浏览：一次只做一件事，动作稳，方便后续推镜');
// 4.1 停在任务列表，让"三个任务并行"这个状态被看清
await page.waitForTimeout(6000);
await shot('02-list');

// 4.2 点开第一个任务，等输出铺开
const items = page.locator('[role="button"], a, [class*="thread"]').filter({ hasText: /util|README|test|注释|测试|检查/i });
if (await items.count()) {
  await items.first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(9000);
}
await shot('03-first');

// 4.3 慢慢往下滚，看输出
await page.mouse.wheel(0, 220);
await page.waitForTimeout(7000);
await page.mouse.wheel(0, 200);
await page.waitForTimeout(7000);
await shot('04-scrolled');

// 4.4 滚回去一点，停在工具调用那一带
await page.mouse.wheel(0, -260);
await page.waitForTimeout(7000);
await shot('05-toolcall');

// 4.5 切到有 diff 的任务
if ((await items.count()) > 1) {
  await items.nth(1).click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(8000);
}
await shot('06-diff');

// 4.6 试着打开 diff 面板
const diffBtn = page.locator('button, a, [role="button"]').filter({ hasText: /open diff|changed files/i }).first();
if (await diffBtn.count()) {
  await diffBtn.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(9000);
}
await shot('07-diffopen');

// 4.7 再停一会儿，留足稳定画面
await page.waitForTimeout(8000);
await shot('08-final');

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
const src = path.join(rawDir, latest.f);
console.log('原始：', (fs.statSync(src).size / 1024 / 1024).toFixed(1), 'MB');

// 保留高分辨率，用高质量转码
const r = spawnSync(
  FFMPEG,
  ['-y', '-i', src, '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', OUT],
  { encoding: 'utf8' },
);
console.log(r.status === 0 ? `✓ ${OUT}` : `转码失败：${r.stderr?.slice(-400)}`);
if (r.status === 0) {
  const st = spawnSync(FFMPEG, ['-i', OUT], { encoding: 'utf8' });
  const line = (st.stderr || '').split('\n').find((l) => l.includes('Duration') || l.includes('Video:'));
  console.log('成品：', (fs.statSync(OUT).size / 1024 / 1024).toFixed(1), 'MB');
}
