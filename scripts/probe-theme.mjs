#!/usr/bin/env node
/** 查 T3 的外观设置里有没有深色模式 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUTH = path.join(ROOT, 'out', 't3-auth.json');
const outDir = path.join(ROOT, 'out', 'theme-probe');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ...(fs.existsSync(AUTH) ? { storageState: AUTH } : {}),
});
const page = await ctx.newPage();
await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// 试 URL 直接进设置
for (const p of ['/settings', '/settings/appearance']) {
  await page.goto(`http://localhost:4780${p}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 400));
  const hasTheme = /appearance|theme|dark|light/i.test(txt);
  console.log(`${p} -> ${hasTheme ? '有外观相关字样' : '没有'}`);
  if (hasTheme) {
    await page.screenshot({ path: path.join(outDir, 'settings.png') });
    console.log(txt.slice(0, 300));
    break;
  }
}

// 也看系统偏好：prefers-color-scheme
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
console.log('body 背景色：', bg);

await browser.close();
