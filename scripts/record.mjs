#!/usr/bin/env node
/**
 * 录屏
 *
 * 干什么：用 Playwright 打开一个网页，按剧本操作，录成 1080p mp4。
 *         讲 GitHub 项目时，先用它把项目跑起来再录，这是最难被搬运的素材。
 *
 * 用法：
 *   node scripts/record.mjs --recipe episodes/0001/record.json
 *   node scripts/record.mjs --url http://localhost:3000 --out out/demo.mp4 --steps '[{"action":"wait","ms":1500}]'
 *
 * 首次要装浏览器：npx playwright install chromium
 *
 * 剧本动作：
 *   {action:"goto", url}        跳转
 *   {action:"wait", ms}         等待（录屏里是"停顿"，给人看清楚）
 *   {action:"click", selector}  点击
 *   {action:"type", selector, text}  输入
 *   {action:"press", key}       按键
 *   {action:"scroll", dy}       滚动
 *   {action:"hover", selector}  悬停
 *   {action:"shot", name}       截单帧图
 */
import './_net.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
const ffmpegPath = ffmpeg.path;

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d = null) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const recipePath = opt('--recipe');
let recipe;

if (recipePath) {
  const abs = path.isAbsolute(recipePath) ? recipePath : path.join(ROOT, recipePath);
  recipe = JSON.parse(fs.readFileSync(abs, 'utf8'));
} else {
  recipe = {
    url: opt('--url'),
    out: opt('--out', 'out/record/demo.mp4'),
    viewport: { width: 1920, height: 1080 },
    steps: JSON.parse(opt('--steps', '[{"action":"wait","ms":2000}]')),
  };
}

if (!recipe.url) {
  console.error('缺少 url。用 --url 或 --recipe');
  process.exit(1);
}

const outFile = path.resolve(ROOT, recipe.out);
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const vp = recipe.viewport ?? { width: 1920, height: 1080 };
const tmpDir = path.join(ROOT, 'out', 'record', '.tmp-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

/* ---------- 起本地服务（可选） ---------- */
let server = null;
async function startServer() {
  if (!recipe.serve) return;
  console.log(`启动服务: ${recipe.serve}`);
  server = spawn(recipe.serve, { shell: true, cwd: recipe.cwd ? path.resolve(ROOT, recipe.cwd) : ROOT });

  const readyUrl = recipe.url;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const r = await fetch(readyUrl, { method: 'GET' });
      if (r.status < 500) {
        console.log(`服务就绪（${i + 1}s）`);
        return;
      }
    } catch {
      /* 还没起来 */
    }
  }
  throw new Error('服务 60 秒没起来');
}

/* ---------- 转码 ---------- */
function toMp4(webm) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath, [
      '-y', '-i', webm,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      outFile,
    ]);
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err.slice(-400)))));
  });
}

/* ---------- 主流程 ---------- */
(async () => {
  const { chromium } = await import('playwright');

  await startServer();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: vp.width, height: vp.height } },
  });

  const page = await context.newPage();

  console.log(`打开 ${recipe.url}`);
  await page.goto(recipe.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  for (const [i, s] of recipe.steps.entries()) {
    try {
      switch (s.action) {
        case 'goto':
          await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          break;
        case 'wait':
          await page.waitForTimeout(s.ms ?? 1000);
          break;
        case 'click':
          await page.locator(s.selector).first().click({ timeout: 20000 });
          break;
        case 'type':
          await page.locator(s.selector).first().fill(s.text ?? '', { timeout: 20000 });
          break;
        case 'press':
          await page.keyboard.press(s.key ?? 'Enter');
          break;
        case 'scroll':
          await page.mouse.wheel(0, s.dy ?? 400);
          break;
        case 'hover':
          await page.locator(s.selector).first().hover({ timeout: 20000 });
          break;
        case 'shot': {
          const f = path.join(path.dirname(outFile), `${s.name ?? 'shot' + i}.png`);
          await page.screenshot({ path: f });
          console.log(`  截图 ${path.relative(ROOT, f)}`);
          break;
        }
        default:
          console.warn(`  未知动作: ${s.action}`);
      }
      console.log(`  ${i + 1}/${recipe.steps.length} ${s.action}${s.selector ? ' ' + s.selector : ''}`);
      await page.waitForTimeout(300);
    } catch (e) {
      console.warn(`  步骤 ${i + 1} 失败（继续）: ${e.message.split('\n')[0]}`);
    }
  }

  await page.waitForTimeout(800);
  const video = page.video();
  await context.close();
  await browser.close();

  if (server) {
    console.log('关闭服务');
    server.kill();
  }

  const webm = await video.path();
  console.log(`转码 mp4 …`);
  await toMp4(webm);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const size = (fs.statSync(outFile).size / 1024 / 1024).toFixed(1);
  console.log(`\n✓ ${path.relative(ROOT, outFile)} (${size} MB)\n`);
})().catch((e) => {
  console.error(e);
  if (server) server.kill();
  process.exit(1);
});
