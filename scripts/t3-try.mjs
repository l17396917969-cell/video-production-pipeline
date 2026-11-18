#!/usr/bin/env node
/**
 * 试跑：复用登录态，发一条消息，看 agent 能不能真的执行。
 * 用法：node scripts/t3-try.mjs "任务内容"
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.T3_PORT ?? 4780);
const BASE = `http://localhost:${PORT}`;
const prompt = process.argv[2] ?? '用一句话介绍这个目录里的 storyboard.md 讲了什么';

const statePath = path.join(ROOT, 'out', 't3-state.json');
if (!fs.existsSync(statePath)) {
  console.error('没有登录态，先跑 node scripts/t3-probe.mjs <token>');
  process.exit(1);
}

const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: statePath,
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const page = await context.newPage();

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
console.log('URL:', page.url());

// 输入
const box = page.locator('[role="textbox"]').first();
await box.click();
await page.waitForTimeout(400);
await box.fill(prompt);
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(ROOT, 'out', 't3-try-1.png') });
console.log('已输入:', prompt);

// 提交
const submit = page.locator('button[aria-label="Submit message"]').first();
if (await submit.count()) {
  await submit.click();
} else {
  await page.keyboard.press('Enter');
}
console.log('已提交，等 25 秒看反应…');

await page.waitForTimeout(25000);
await page.screenshot({ path: path.join(ROOT, 'out', 't3-try-2.png') });

const text = await page.evaluate(() => document.body.innerText.replace(/\s+\n/g, '\n').slice(0, 2500));
console.log('\n--- 页面文本 ---\n' + text);

await browser.close();
