#!/usr/bin/env node
/**
 * 扫描 src/components，自动生成 registry / catalog / Root
 *
 * 为什么要有这个：组件到 100 个以后，手写 import 必错。组件文件里只要按约定
 * 导出「组件 + TXxx_LABEL / TXxx_USE / TXxx_DESC」，这里就能自动接上。
 *
 * 用法：node scripts/gen-registry.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src', 'components');

const files = fs
  .readdirSync(DIR)
  .filter((f) => /^T\d+.*\.tsx$/.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/^T(\d+)/)[1], 10);
    const nb = parseInt(b.match(/^T(\d+)/)[1], 10);
    return na - nb;
  });

const items = [];

for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const idM = f.match(/^(T\d+)/);
  if (!idM) continue;
  const id = idM[1];

  const compM = src.match(/export const (T\d+[A-Za-z0-9_]*)\s*:\s*React\.FC/);
  if (!compM) {
    console.warn(`跳过 ${f}：找不到导出的组件`);
    continue;
  }

  const labelM = src.match(/export const T\d+_LABEL\s*=\s*['"`](.+?)['"`]/);
  const descM = src.match(/export const T\d+_DESC\s*=\s*['"`](.+?)['"`]/);
  const useM = src.match(/export const T\d+_USE\s*=\s*\[([^\]]*)\]/);

  items.push({
    id,
    comp: compM[1],
    file: f.replace(/\.tsx$/, ''),
    label: labelM ? labelM[1] : id,
    desc: descM ? descM[1] : '',
    use: useM
      ? useM[1]
          .split(',')
          .map((s) => s.trim().replace(/['"]/g, ''))
          .filter(Boolean)
      : [],
  });
}

// ---- registry.ts ----
const regImports = items.map((i) => `import { ${i.comp} } from './components/${i.file}';`).join('\n');
const regMap = items.map((i) => `  ${i.id}: ${i.comp},`).join('\n');
fs.writeFileSync(
  path.join(ROOT, 'src', 'registry.ts'),
  `/**
 * 组件注册表（自动生成，勿手改）
 * 重新生成：node scripts/gen-registry.mjs
 */
import type React from 'react';
${regImports}

export const REGISTRY: Record<string, React.FC<any>> = {
${regMap}
};

export const REGISTRY_COUNT = ${items.length};
`,
);

// ---- catalog.ts ----
const catEntries = items
  .map(
    (i) =>
      `  {\n    id: '${i.id}',\n    label: '${i.label}',\n    use: [${i.use.map((u) => `'${u}'`).join(', ')}],\n    desc: '${i.desc}',\n    file: 'components/${i.file}.tsx',\n  },`,
  )
  .join('\n');

fs.writeFileSync(
  path.join(ROOT, 'src', 'catalog.ts'),
  `/**
 * 组件索引（自动生成，勿手改）
 * 检索入口：按「画面里看得见的对象和动作」找，不要按旁白找
 * 重新生成：node scripts/gen-registry.mjs
 */
export type CatalogEntry = {
  id: string;
  label: string;
  use: string[];
  desc: string;
  file: string;
};

export const CATALOG: CatalogEntry[] = [
${catEntries}
];

export const CATALOG_COUNT = ${items.length};

/** 按用途标签检索 */
export function findByUse(tag: string): CatalogEntry[] {
  return CATALOG.filter((c) => c.use.includes(tag));
}

/** 按关键词检索（标签 + 描述） */
export function search(q: string): CatalogEntry[] {
  const k = q.toLowerCase();
  return CATALOG.filter(
    (c) => c.label.toLowerCase().includes(k) || c.desc.toLowerCase().includes(k),
  );
}
`,
);

// ---- Root.tsx（只放 Composition，props 全部走 inputProps）----
const comps = items
  .map(
    (i) =>
      `      <Composition\n        id="${i.id}"\n        component={REGISTRY.${i.id}}\n        durationInFrames={150}\n        fps={30}\n        width={CANVAS.w}\n        height={CANVAS.h}\n        defaultProps={{}}\n      />`,
  )
  .join('\n');

fs.writeFileSync(
  path.join(ROOT, 'src', 'Root.tsx'),
  `import React from 'react';
import { Composition } from 'remotion';
import { REGISTRY } from './registry';
import { CANVAS } from './kit';
import { Episode, type Manifest } from './Episode';
import { ensureFonts } from './fonts';

/**
 * 组件预览用：每个组件一个 Composition，durationInFrames 统一 150（5 秒）。
 * 实际成片走 Episode，不按组件逐个渲。
 * 自动生成，勿手改；重新生成：node scripts/gen-registry.mjs
 */
export const RemotionRoot: React.FC = () => {
  // 字体必须先于任何一帧就位，否则整片字体不统一
  ensureFonts();
  return (
    <>
${comps}

      <Composition
        id="Episode"
        component={Episode}
        durationInFrames={150}
        fps={30}
        width={CANVAS.w}
        height={CANVAS.h}
        defaultProps={{ manifest: { fps: 30, segments: [] } as Manifest }}
        calculateMetadata={({ props }) => {
          const m = props.manifest as Manifest;
          const fps = m?.fps ?? 30;
          const total = (m?.segments ?? []).reduce((a: number, s: any) => a + (s.end - s.start), 0);
          return { durationInFrames: Math.max(1, Math.round(total * fps)), fps };
        }}
      />
    </>
  );
};
`,
);

console.log(`✓ 注册 ${items.length} 个组件`);
console.log(`  registry.ts / catalog.ts / Root.tsx 已更新`);
