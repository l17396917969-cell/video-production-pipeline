#!/usr/bin/env node
/**
 * 录一段"有内容"的界面：打开任务 → 打开 diff 面板 → 展开文件树
 *
 * 目的：解决"全屏录进去中间一大片白"。T3 的首页本身留白极多，
 * 必须录"工作现场"——对话填满、diff 展开、文件列表有内容。
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUTH = path.join(ROOT, 'out', 't3-auth.json');
const OUT = path.join(ROOT, 'episodes', 't3code', 'material', 't3-diff.mp4');
const RAW = path.join(ROOT, 'out', 't3-diff.webm');
const FFMPEG = path.join(ROOT, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: 'dark',
  recordVideo: { dir: path.join(ROOT, 'out'), size: { width: 1600, height: 1000 } },
  ...(fs.existsSync(AUTH) ? { storageState: AUTH } : {}),
});
const page = await ctx.newPage();
await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

// 点开一个已经有改动记录的任务
const opened = await page.evaluate(() => {
  const items = [...document.querySelectorAll('a, [role="button"], button, div')].filter((el) => {
    const t = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    return t.length > 6 && t.length < 90 && r.width > 160 && r.height > 24 && r.top > 80 && r.top < 800;
  });
  const withChange = items.find((el) => /Add Multiply|multiply|README/i.test(el.textContent || ''));
  if (withChange) {
    withChange.click();
    return (withChange.textContent || '').trim().slice(0, 40);
  }
  return null;
});
console.log('点开的任务：', opened);
await page.waitForTimeout(5000);

// 找并点 "Open diff" / "2 changed files"
const diffOpened = await page.evaluate(() => {
  const cands = [...document.querySelectorAll('button, a, [role="button"]')];
  const el = cands.find((c) => /open diff|changed files/i.test(c.textContent || ''));
  if (el) {
    el.click();
    return (el.textContent || '').trim().slice(0, 40);
  }
  return null;
});
console.log('打开 diff：', diffOpened);
await page.waitForTimeout(9000);

// 滚动一下，让 diff 内容铺满
await page.mouse.wheel(0, 260);
await page.waitForTimeout(6500);

await page.screenshot({ path: path.join(ROOT, 'out', 'diff-full.png') });
await ctx.close();
await browser.close();

// 找录出来的 webm
const vids = fs.readdirSync(path.join(ROOT, 'out')).filter((f) => f.endsWith('.webm'));
const latest = vids
  .map((f) => ({ f, t: fs.statSync(path.join(ROOT, 'out', f)).mtimeMs }))
  .sort((a, b) => b.t - a.t)[0];
if (!latest) {
  console.error('没找到录屏文件');
  process.exit(1);
}
fs.renameSync(path.join(ROOT, 'out', latest.f), RAW);
console.log('原始录屏：', RAW);

const r = spawnSync(
  FFMPEG,
  ['-y', '-i', RAW, '-vf', 'fps=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', OUT],
  { encoding: 'utf8' },
);
console.log(r.status === 0 ? `✓ ${OUT}` : `转码失败：${r.stderr?.slice(-300)}`);
