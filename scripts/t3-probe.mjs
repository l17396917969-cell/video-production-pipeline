#!/usr/bin/env node
/**
 * 探测 T3 Code 界面：配对一次，把登录态存下来，顺便把可点元素列出来。
 *
 * 用法：node scripts/t3-probe.mjs <pairingToken>
 * 产出：out/t3-state.json（登录态，后续直接复用）、out/t3-probe.png、元素清单
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const token = process.argv[2];
if (!token) {
  console.error('用法: node scripts/t3-probe.mjs <pairingToken>');
  process.exit(1);
}

const PORT = Number(process.env.T3_PORT ?? 4780);
const BASE = `http://localhost:${PORT}`;

const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const page = await context.newPage();

console.log('配对…');
await page.goto(`${BASE}/pair#token=${token}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);

// 看是不是已经进主界面
const url = page.url();
console.log('当前 URL:', url);

await page.screenshot({ path: path.join(ROOT, 'out', 't3-probe.png') });

// 列出可点元素
const items = await page.evaluate(() => {
  const out = [];
  const nodes = document.querySelectorAll(
    'button, [role="button"], a, input, textarea, [contenteditable="true"], [role="menuitem"], [role="tab"]',
  );
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 60);
    out.push({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || '',
      text,
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    });
  }
  return out;
});

console.log(`\n可点元素 ${items.length} 个：`);
for (const it of items.slice(0, 60)) {
  console.log(`  [${it.tag}${it.role ? '/' + it.role : ''}] (${it.x},${it.y} ${it.w}x${it.h})  ${it.text}`);
}

// 登录态存下来，后面录屏复用
const statePath = path.join(ROOT, 'out', 't3-state.json');
await context.storageState({ path: statePath });
console.log(`\n✓ 登录态已保存：${path.relative(ROOT, statePath)}`);

await browser.close();
