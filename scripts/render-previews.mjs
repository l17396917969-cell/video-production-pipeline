#!/usr/bin/env node
/**
 * 批量出预览图
 *
 * 干什么：给组件库每个组件渲染一张静帧，AI 和人看图选型用。
 * 怎么用：node scripts/render-previews.mjs           全部
 *         node scripts/render-previews.mjs T02 T05   指定几个
 * 输出：  out/previews/<id>/p30.png
 *
 * 只 bundle 一次，然后逐个渲染，比反复跑 CLI 快得多。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
process.chdir(ROOT);

const ids = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const catalogSrc = fs.readFileSync(path.join(ROOT, 'src', 'catalog.ts'), 'utf8');
const allIds = [...catalogSrc.matchAll(/id:\s*'(T\d+)'/g)].map((m) => m[1]);
const targets = ids.length ? ids : allIds;

if (targets.length === 0) {
  console.error('catalog 里没读到组件 id');
  process.exit(1);
}

const { bundle } = await import('@remotion/bundler');
const { selectComposition, renderStill } = await import('@remotion/renderer');

console.log(`\n打包…（首次较慢）`);
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });

console.log(`渲染 ${targets.length} 张预览图\n`);

let ok = 0;
for (const id of targets) {
  const dir = path.join(ROOT, 'out', 'previews', id);
  fs.mkdirSync(dir, { recursive: true });
  const output = path.join(dir, 'p30.png');
  try {
    const composition = await selectComposition({ serveUrl, id });
    // 取 70% 位置：入场已走完，又没到退场，最能代表终态
    const frame = Math.round(composition.durationInFrames * 0.7);
    await renderStill({ composition, serveUrl, output, frame, overwrite: true });
    console.log(`  ✓ ${id}  →  ${path.relative(ROOT, output)}`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${id}  ${String(e.message).split('\n')[0]}`);
  }
}

console.log(`\n完成 ${ok}/${targets.length}\n`);
