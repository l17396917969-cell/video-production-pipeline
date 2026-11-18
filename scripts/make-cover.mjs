#!/usr/bin/env node
/**
 * 出封面：横版 16:9 和竖版 9:16 各一套，三版备选
 *
 * 用法：node scripts/make-cover.mjs episodes/t3code
 * 产出：episodes/t3code/covers/cover-1-16x9.png … cover-3-9x16.png
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const epArg = process.argv[2];
if (!epArg) {
  console.error('用法: node scripts/make-cover.mjs episodes/<期号>');
  process.exit(1);
}

const epDir = path.join(ROOT, epArg);
const outDir = path.join(epDir, 'covers');
fs.mkdirSync(outDir, { recursive: true });

// 三版封面：角度不同，让人挑
const VARIANTS = [
  {
    name: 'cover-1',
    src: 'shots/t3-ui169.png',
    kicker: '开源项目拆解',
    headline: '六万三千星',
    number: '但它不是编辑器',
    sub: 'T3 Code 装了两小时，我踩到三个坑',
    variant: 'left',
  },
  {
    name: 'cover-2',
    src: 'video/../shots/t3-gh.png',
    kicker: '真实体验',
    headline: '装了两小时',
    number: '63,000 ★',
    sub: '一个控制台，管住所有 Agent',
    variant: 'left',
  },
  {
    name: 'cover-3',
    src: 'shots/t3-home.png',
    kicker: 'T3 Code',
    headline: '瓶颈换人了',
    number: null,
    sub: '写代码变快之后，审查成了新的坑',
    variant: 'center',
  },
];

const { bundle } = await import('@remotion/bundler');
const { selectComposition, renderStill } = await import('@remotion/renderer');

console.log('打包…');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });

const SIZES = [
  { tag: '16x9', width: 1920, height: 1080 },
  { tag: '9x16', width: 1080, height: 1920 },
];

for (const v of VARIANTS) {
  for (const size of SIZES) {
    const props = { ...v };
    delete props.name;
    const comp = await selectComposition({
      serveUrl,
      id: 'T118',
      inputProps: props,
    });
    // 覆盖尺寸以出竖版
    const scaled = { ...comp, width: size.width, height: size.height };
    const file = path.join(outDir, `${v.name}-${size.tag}.png`);
    await renderStill({
      composition: scaled,
      serveUrl,
      output: file,
      frame: 20,
      inputProps: props,
    });
    console.log(`✓ covers/${path.basename(file)}`);
  }
}
