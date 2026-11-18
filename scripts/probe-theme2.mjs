#!/usr/bin/env node
/** 用系统深色偏好试探 T3 是否跟随 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUTH = path.join(ROOT, 'out', 't3-auth.json');
const outDir = path.join(ROOT, 'out', 'theme-probe');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    colorScheme: scheme,
    ...(fs.existsSync(AUTH) ? { storageState: AUTH } : {}),
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`${scheme}: body 背景 = ${bg}`);
  await page.screenshot({ path: path.join(outDir, `home-${scheme}.png`) });
  await ctx.close();
}

await browser.close();
