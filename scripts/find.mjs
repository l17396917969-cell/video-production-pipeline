#!/usr/bin/env node
/**
 * 组件检索
 *
 * 用法：
 *   node scripts/find.mjs "两个方案左右对比"
 *   node scripts/find.mjs --all
 *
 * 铁律：query 写「画面里看得见的对象和动作」，不要复述旁白。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const catalogSrc = fs.readFileSync(path.join(ROOT, 'src', 'catalog.ts'), 'utf8');

// 直接从 catalog.ts 里读数据，避免维护两份
function parseCatalog() {
  const entries = [];
  const blocks = catalogSrc.split(/\n  \{\n/).slice(1);
  for (const b of blocks) {
    const id = b.match(/id:\s*'([^']+)'/)?.[1];
    const label = b.match(/label:\s*'([^']+)'/)?.[1];
    const use = b.match(/use:\s*\[([^\]]*)\]/)?.[1]?.replace(/['\s]/g, '');
    const desc = b.match(/desc:\s*'([^']+)'/)?.[1];
    const props = b.match(/props:\s*'([^']+)'/)?.[1];
    const frames = b.match(/frames:\s*(\d+)/)?.[1];
    if (id && label && desc) entries.push({ id, label, use, desc, props, frames });
  }
  return entries;
}

const entries = parseCatalog();
const query = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ');

if (process.argv.includes('--all') || !query) {
  console.log(`\n组件库（${entries.length} 条）\n`);
  for (const e of entries) {
    console.log(`[${e.id}] ${e.label}  · ${e.use} · ${e.frames}帧`);
    console.log(`     ${e.desc}`);
  }
  console.log('');
  process.exit(0);
}

/** 中文按 2-gram 切，英文按词切。整串匹配给高权重。 */
function tokenize(q) {
  const out = new Set();
  for (const m of q.matchAll(/[a-zA-Z][a-zA-Z0-9_.-]*/g)) out.add(m[0].toLowerCase());
  const zh = q.replace(/[^\u4e00-\u9fa5]/g, '');
  if (zh.length === 1) out.add(zh);
  for (let i = 0; i < zh.length - 1; i++) out.add(zh.slice(i, i + 2));
  return [...out];
}

const qLower = query.toLowerCase();
const tokens = tokenize(query);

const all = entries
  .map((e) => {
    const hay = `${e.label} ${e.desc} ${e.use}`.toLowerCase();
    let score = hay.includes(qLower) ? 5 : 0;
    for (const t of tokens) if (hay.includes(t)) score += 1;
    return { e, score };
  })
  .sort((a, b) => b.score - a.score);

const scored = all.filter((x) => x.score > 0).slice(0, 3);

// 不足 3 个就补位：逼着做比较，不能只看一个就定
if (scored.length < 3) {
  for (const x of all) {
    if (scored.length >= 3) break;
    if (!scored.some((s) => s.e.id === x.e.id)) scored.push({ ...x, fill: true });
  }
}

if (scored.length === 0) {
  console.log(`\n没有匹配「${query}」。`);
  console.log(`换个说法：拆成「对象 + 动作」，例如「两个面板并排」「数字滚动」「终端打字」。`);
  console.log(`或者 node scripts/find.mjs --all 看全部。\n`);
  process.exit(0);
}

console.log(`\n「${query}」的候选（前 3，必须逐个看并写理由）：\n`);
scored.forEach((s, i) => {
  const tag = s.fill ? '  （补位：非直接命中，用来对比排除）' : '';
  console.log(`${i + 1}. [${s.e.id}] ${s.e.label}  分数 ${s.score}${tag}`);
  console.log(`   画面：${s.e.desc}`);
  console.log(`   参数：${s.e.props}`);
  console.log(`   样片：out/previews/${s.e.id}/p30.png\n`);
});
console.log(`记住：这 3 个都要写进 manifest 的 candidates，写清选/不选的理由。\n`);
