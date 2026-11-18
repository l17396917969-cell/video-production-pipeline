#!/usr/bin/env node
/** 打开 provider 设置，把错误信息抓出来 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = `http://localhost:${Number(process.env.T3_PORT ?? 4780)}`;
const statePath = path.join(ROOT, 'out', 't3-state.json');

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
await page.waitForTimeout(4000);

// 先试着点掉那条 provider 错误横幅，看它写了什么
const banner = page.locator('button[aria-label="Dismiss Codex provider error"]');
if (await banner.count()) {
  console.log('找到 Codex provider error 横幅');
}

const open = page.getByText('Open provider settings', { exact: false }).first();
if (await open.count()) {
  await open.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(ROOT, 'out', 't3-provider.png') });
  const text = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 3000));
  console.log('\n--- 设置页文本 ---\n' + text);
} else {
  console.log('没找到 Open provider settings');
  await page.screenshot({ path: path.join(ROOT, 'out', 't3-provider.png') });
}

await browser.close();
