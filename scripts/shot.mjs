#!/usr/bin/env node
/**
 * 拍一张指定组件的静帧，用来做素材（代码截图、设置页、图表示意）
 *
 * 用法：
 *   node scripts/shot.mjs T63 --props '{"lines":["a","b"],"highlight":[1]}' --out out/code.png
 *   node scripts/shot.mjs T63 --file props.json --out out/code.png
 *
 * 为什么单独做一个：有些画面不需要是一段视频，一张高质量静帧就够，
 * 而且静帧可以精细控制高亮和裁切，比录屏更好用。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const [id, ...rest] = process.argv.slice(2);
const pick = (f, d) => (rest.includes(f) ? rest[rest.indexOf(f) + 1] : d);

if (!id) {
  console.error('用法: node scripts/shot.mjs <组件ID> --props \'{...}\' --out out/x.png');
  process.exit(1);
}

const propsFile = pick('--file');
const propsRaw = pick('--props', '{}');
const out = pick('--out', path.join(ROOT, 'out', `shot-${id}.png`));
const frame = Number(pick('--frame', '90'));

let props;
try {
  props = propsFile ? JSON.parse(fs.readFileSync(propsFile, 'utf8')) : JSON.parse(propsRaw);
} catch (e) {
  console.error('props 不是合法 JSON：' + e.message);
  process.exit(1);
}

const { bundle } = await import('@remotion/bundler');
const { selectComposition, renderStill } = await import('@remotion/renderer');

console.log('打包…');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });
const comp = await selectComposition({ serveUrl, id, inputProps: props });
await renderStill({
  composition: comp,
  serveUrl,
  output: out,
  frame: Math.min(frame, comp.durationInFrames - 1),
  inputProps: props,
});
console.log(`✓ ${path.relative(ROOT, out)}`);
