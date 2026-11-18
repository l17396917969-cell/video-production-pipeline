#!/usr/bin/env node
/** 打开 Settings → Providers，看有哪些 provider、状态如何 */
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

await page.getByText('Open provider settings', { exact: false }).first().click().catch(() => {});
await page.waitForTimeout(2000);

// 点 Providers
const prov = page.getByText('Providers', { exact: true }).last();
await prov.click();
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(ROOT, 'out', 't3-providers.png') });

const text = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'));
console.log('--- Providers 页 ---');
console.log(text.slice(text.indexOf('Providers'), text.indexOf('Providers') + 2000));

await browser.close();
