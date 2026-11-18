#!/usr/bin/env node
/**
 * 探测：新建线程时怎么切到 worktree 模式
 *
 * 关键：配对令牌是一次性的，用一次就废。
 * 所以第一次配对后把登录态存到 out/t3-auth.json，后面所有脚本都复用它。
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const token = process.argv[2];
const outDir = path.join(ROOT, 'out', 'probe');
fs.mkdirSync(outDir, { recursive: true });

const AUTH = path.join(ROOT, 'out', 't3-auth.json');
const hasAuth = fs.existsSync(AUTH);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  ...(hasAuth ? { storageState: AUTH } : {}),
});
const page = await ctx.newPage();

await page.goto('http://localhost:4780', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

if (await page.getByText('Pair with this environment').count()) {
  console.log('需要配对');
  if (!token) {
    console.error('没有登录态，需要传令牌');
    process.exit(1);
  }
  const input = page.locator('input').first();
  await input.click();
  await input.fill(token);
  await page.waitForTimeout(700);
  const cont = page.getByRole('button', { name: 'Continue' }).first();
  if (await cont.count()) await cont.click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(8000);
  if (await page.getByText('Pair with this environment').count()) {
    console.error('配对失败，令牌可能已用过');
    process.exit(1);
  }
  await ctx.storageState({ path: AUTH });
  console.log('登录态已保存到 out/t3-auth.json');
} else {
  console.log('登录态有效，跳过配对');
}

// 新建线程
const nb = page.locator('button[aria-label="New thread"]').first();
if (await nb.count()) await nb.click();
await page.waitForTimeout(1500);
// 会弹项目选择框，默认选中第一个项目，回车即可
await page.screenshot({ path: path.join(outDir, 'p1-picker.png') });
await page.keyboard.press('Enter');
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(outDir, 'p1-thread.png') });

// 点 Current checkout（文字是 span，要点外层按钮）
const co = page.locator('button:has-text("Current checkout")').first();
if (await co.count()) {
  console.log('找到 Current checkout，点击');
  // Playwright 的可见性判断对这个按钮不灵，直接触发
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('[data-composer-context-control=\"true\"]')];
    const visible = btns.find((b) => b.getBoundingClientRect().width > 0);
    visible?.click();
  });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(outDir, 'p2-menu.png') });
  const opts = await page.evaluate(() =>
    [...document.querySelectorAll('[role="menuitem"],[role="option"],button')]
      .map((el) => (el.textContent || '').trim())
      .filter((t) => t && t.length < 50)
      .slice(0, 40),
  );
  console.log('菜单选项：');
  console.log(opts.map((n) => '  · ' + n).join('\n'));
} else {
  console.log('没找到 Current checkout');
  await page.screenshot({ path: path.join(outDir, 'p2-nomenu.png') });
}

await browser.close();
