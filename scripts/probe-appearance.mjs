#!/usr/bin/env node
/** 查 T3 的外观设置：有没有主题色/深色开关 */
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
await page.waitForTimeout(3500);

// 找设置入口
const opened = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button, [role="button"], a')].find(
    (el) => /setting|设置|preference/i.test(el.textContent || '') || el.getAttribute('aria-label')?.match(/setting/i),
  );
  if (btn) {
    btn.click();
    return btn.textContent?.trim().slice(0, 30) ?? 'clicked';
  }
  return null;
});
console.log('设置入口：', opened);
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, 'settings-open.png') });

// 找 Appearance
const hasAppearance = await page.evaluate(() =>
  [...document.querySelectorAll('*')].some((el) => /appearance/i.test(el.textContent || '') && el.children.length === 0),
);
console.log('有没有 Appearance：', hasAppearance);

if (hasAppearance) {
  await page.getByText('Appearance', { exact: false }).first().click().catch(() => {});
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(outDir, 'appearance.png') });
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 900));
  console.log('--- 外观页文字 ---');
  console.log(txt);
}

await browser.close();
