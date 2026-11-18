#!/usr/bin/env node
/**
 * 发布物料生成
 *
 * 干什么：把一条 episode.json 转成抖音 / B站 / 视频号三份可直接粘贴的文案。
 * 怎么用：node scripts/publish.mjs episodes/<id>
 * 输出：  <episode>/publish/{douyin,bilibili,shipinhao}.md
 *
 * 边界：只生成文案，不点发布。各平台没有稳定官方上传接口，
 *       真正的"点一下"留给 huimei 或人工，避免账号风险。
 */
import fs from 'node:fs';
import path from 'node:path';

const LIMITS = {
  douyin: { title: 55, desc: 500, tags: 5 },
  bilibili: { title: 80, desc: 2000, tags: 10 },
  shipinhao: { title: 30, desc: 1000, tags: 3 },
};

const episodeDir = process.argv[2];
if (!episodeDir) {
  console.error('用法: node scripts/publish.mjs episodes/<id>');
  process.exit(1);
}

const ep = JSON.parse(fs.readFileSync(path.join(episodeDir, 'episode.json'), 'utf8'));
const outDir = path.join(episodeDir, 'publish');
fs.mkdirSync(outDir, { recursive: true });

const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1) + '…');

/** 抖音：标题短、前 3 秒钩子、话题多 */
function douyin() {
  const hook = ep.hook ?? ep.title;
  const tags = (ep.tags ?? []).slice(0, LIMITS.douyin.tags);
  return [
    `# 抖音发布稿`,
    ``,
    `**标题**（${clip(ep.title, LIMITS.douyin.title).length}/${LIMITS.douyin.title}）`,
    ``,
    clip(ep.title, LIMITS.douyin.title),
    ``,
    `**简介**`,
    ``,
    clip(`${hook}\n\n${ep.summary ?? ''}`, LIMITS.douyin.desc),
    ``,
    `**话题**`,
    ``,
    tags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' '),
    ``,
    `**封面**：${ep.cover ?? '（待生成）'}`,
  ].join('\n');
}

/** B站：标题长、简介可以写结构、标签是独立字段 */
function bilibili() {
  const tags = (ep.tags ?? []).slice(0, LIMITS.bilibili.tags);
  const chapters = (ep.chapters ?? []).map((c, i) => `${String(i + 1).padStart(2, '0')} ${c}`).join('\n');
  return [
    `# B站发布稿`,
    ``,
    `**标题**（${clip(ep.title, LIMITS.bilibili.title).length}/${LIMITS.bilibili.title}）`,
    ``,
    clip(ep.title, LIMITS.bilibili.title),
    ``,
    `**简介**`,
    ``,
    clip(`${ep.hook ?? ''}\n\n${ep.summary ?? ''}`, LIMITS.bilibili.desc),
    ``,
    `**分P/章节**`,
    ``,
    chapters || '（单段，不分P）',
    ``,
    `**标签**（逗号分隔）`,
    ``,
    tags.join(','),
    ``,
    `**分区**：科技 → 计算机技术`,
  ].join('\n');
}

/** 视频号：标题极短，靠简介补齐 */
function shipinhao() {
  const tags = (ep.tags ?? []).slice(0, LIMITS.shipinhao.tags);
  return [
    `# 视频号发布稿`,
    ``,
    `**标题**（${clip(ep.title, LIMITS.shipinhao.title).length}/${LIMITS.shipinhao.title}）`,
    ``,
    clip(ep.title, LIMITS.shipinhao.title),
    ``,
    `**简介**`,
    ``,
    clip(ep.summary ?? ep.hook ?? '', LIMITS.shipinhao.desc),
    ``,
    `**标签**`,
    ``,
    tags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' '),
    ``,
    `> 视频号标题上限 30 字，超出会被截断。这里已自动裁。`,
  ].join('\n');
}

const files = {
  'douyin.md': douyin(),
  'bilibili.md': bilibili(),
  'shipinhao.md': shipinhao(),
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), content, 'utf8');
  console.log(`✓ ${path.relative(process.cwd(), path.join(outDir, name))}`);
}

// 通用信息，给 huimei 这类工具用
fs.writeFileSync(
  path.join(outDir, 'meta.json'),
  JSON.stringify(
    { title: ep.title, hook: ep.hook, summary: ep.summary, tags: ep.tags, video: ep.video, cover: ep.cover },
    null,
    2,
  ),
  'utf8',
);
console.log(`✓ publish/meta.json`);
