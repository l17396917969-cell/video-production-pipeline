#!/usr/bin/env node
/**
 * 网页截图 / 录屏取帧
 *
 * 干什么：把真实页面截下来，作为视频素材。讲项目时，真实截图比任何文字卡片都有说服力。
 * 怎么用：
 *   node scripts/shoot.mjs --url https://github.com/pingdotgg/t3code --out shots/gh.png
 *   node scripts/shoot.mjs --url https://example.com --out shots/a.png --full
 *   node scripts/shoot.mjs --url https://example.com --out shots/a.png --clip 0,0,1920,800
 *
 * 参数：
 *   --url      要截的页面
 *   --out      输出 png（相对项目根）
 *   --full     截整页（默认只截一屏）
 *   --wait     等多久再截，毫秒，默认 2500
 *   --width    视口宽，默认 1920
 *   --height   视口高，默认 1080
 *   --clip     x,y,w,h 只截这块
 *   --selector 只截某个元素
 *   --dark     强制深色模式
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d = null) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const flag = (n) => args.includes(n);

const url = opt('--url');
const outRel = opt('--out');
if (!url || !outRel) {
  console.error('用法: node scripts/shoot.mjs --url <url> --out <path.png> [--full] [--wait 2500]');
  process.exit(1);
}

const out = path.isAbsolute(outRel) ? outRel : path.join(ROOT, outRel);
fs.mkdirSync(path.dirname(out), { recursive: true });

const width = Number(opt('--width', 1920));
const height = Number(opt('--height', 1080));
const wait = Number(opt('--wait', 2500));

const { chromium } = await import('playwright');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
  colorScheme: flag('--dark') ? 'dark' : 'light',
  locale: 'zh-CN',
});
const page = await context.newPage();

console.log(`打开 ${url}`);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(wait);

// 去掉可能挡住画面的弹窗/横幅
await page
  .evaluate(() => {
    for (const sel of ['.cookie-banner', '[class*="cookie"]', '[class*="banner"]', '[role="dialog"]']) {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height > 40) el.style.display = 'none';
      });
    }
  })
  .catch(() => {});

const clipArg = opt('--clip');
const selector = opt('--selector');

if (selector) {
  await page.locator(selector).first().screenshot({ path: out });
} else if (clipArg) {
  const [x, y, w, h] = clipArg.split(',').map(Number);
  await page.screenshot({ path: out, clip: { x, y, width: w, height: h } });
} else {
  await page.screenshot({ path: out, fullPage: flag('--full') });
}

await context.close();
await browser.close();

const stat = fs.statSync(out);
console.log(`✓ ${path.relative(ROOT, out)}  ${(stat.size / 1024).toFixed(0)} KB`);
