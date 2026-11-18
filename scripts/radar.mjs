#!/usr/bin/env node
/**
 * 选题雷达
 *
 * 干什么：抓 GitHub 榜单 + 各家 RSS，按你的三个框架打分，出一张选题单。
 * 怎么用：node scripts/radar.mjs
 * 输出：  out/radar/<日期>.md
 *
 * 规则：机器只出候选，人选最终一条。不要在这里加"自动决定"。
 */
import fs from 'node:fs';
import path from 'node:path';
import './_net.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'));
const S = cfg.scoring;

const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'out', 'radar');
fs.mkdirSync(OUT, { recursive: true });

const UA = { 'User-Agent': 'Mozilla/5.0 (aivideo-radar)' };

const clean = (s = '') =>
  s
    // 必须先剥 CDATA，否则 <![CDATA[标题]]> 会被当成标签整个删掉，标题就空了
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

async function get(url, timeoutMs = 15000) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers: UA, signal: ac.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- GitHub ---------- */

async function githubTrending() {
  const out = [];
  for (const t of cfg.github.trending) {
    try {
      const html = await get(t.url);
      // 注意用 <a[^>]*href，GitHub 的 <a> 带 class 等属性，紧跟 href 匹配不到
      const repos = [
        ...html.matchAll(/<h2[^>]*>\s*<a[^>]*href="\/([\w.-]+\/[\w.-]+)"/g),
      ].map((m) => m[1]);
      const uniq = [...new Set(repos)];
      for (const repo of uniq.slice(0, 12)) {
        out.push({
          kind: 'github',
          source: t.label,
          title: repo,
          link: `https://github.com/${repo}`,
          date: today,
        });
      }
      console.log(`  ✓ ${t.label}: ${uniq.length} 个仓库`);
    } catch (e) {
      console.warn(`  ! ${t.label} 抓取失败: ${e.message}`);
    }
  }
  return out;
}

/* ---------- RSS / Atom ---------- */

function parseFeed(xml, label) {
  const items = [];

  // RSS 2.0
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)) {
    const block = m[0];
    const title = clean(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const link = clean(block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? '');
    const date = clean(block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] ?? '');
    if (title && link) items.push({ kind: 'news', source: label, title, link, date });
  }

  // Atom
  if (items.length === 0) {
    for (const m of xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/g)) {
      const block = m[0];
      const title = clean(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
      const link =
        block.match(/<link[^>]*href="([^"]+)"/)?.[1] ??
        clean(block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? '');
      const date = clean(
        block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/)?.[1] ??
          block.match(/<published[^>]*>([\s\S]*?)<\/published>/)?.[1] ??
          '',
      );
      if (title && link) items.push({ kind: 'news', source: label, title, link, date });
    }
  }

  return items.slice(0, 15);
}

async function allFeeds() {
  const out = [];
  for (const f of cfg.rss) {
    try {
      const xml = await get(f.url);
      const got = parseFeed(xml, f.label).map((i) => ({ ...i, weight: f.weight ?? 1 }));
      out.push(...got);
      console.log(`  ✓ ${f.label}: ${got.length} 条`);
    } catch (e) {
      console.warn(`  ! ${f.label} 失败: ${e.message}`);
    }
  }
  return out;
}

/* ---------- 打分 ---------- */

function scoreItem(item) {
  const hay = `${item.title} ${item.source}`.toLowerCase();
  let score = 0;
  const hits = [];

  for (const [frame, words] of Object.entries(cfg.frameworks)) {
    const hit = words.filter((w) => hay.includes(w.toLowerCase()));
    if (hit.length > 0) {
      score += S.framework_hit * Math.min(hit.length, 2);
      hits.push(frame);
    }
  }

  // 能上 GitHub 榜本身就是一个信号，给它一个基础分
  if (item.kind === 'github') score += 2;

  if (item.weight) score += item.weight;

  // 新鲜度：能解析出日期的才加分
  const d = Date.parse(item.date);
  if (!Number.isNaN(d)) {
    const days = (Date.now() - d) / 86400000;
    if (days <= 2) score += S.fresh_within_days;
    else if (days <= 7) score += 1;
  }

  return { ...item, score, hits: [...new Set(hits)] };
}

/* ---------- 主流程 ---------- */

console.log(`\n选题雷达 ${today}\n`);
console.log('抓取中…');

const [gh, news] = await Promise.all([githubTrending(), allFeeds()]);
const all = [...gh, ...news].map(scoreItem);

// 去重：同一个标题只留分最高的
const seen = new Map();
for (const it of all) {
  const key = it.title.toLowerCase().slice(0, 60);
  if (!seen.has(key) || seen.get(key).score < it.score) seen.set(key, it);
}

const ranked = [...seen.values()]
  .filter((i) => i.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, S.top_n * 3);

if (ranked.length === 0) {
  console.log('\n今天没有命中框架的条目。检查 data/sources.json 的 frameworks 关键词。\n');
  process.exit(0);
}

/* ---------- 输出 ---------- */

const lines = [
  `# 选题候选 · ${today}`,
  '',
  `> 机器按相关度排序，最终选哪条由人决定。框架：${Object.keys(cfg.frameworks).join(' / ')}`,
  '',
];

ranked.slice(0, S.top_n).forEach((it, i) => {
  lines.push(`## ${i + 1}. ${it.title}`);
  lines.push('');
  lines.push(`- 来源：${it.source}（${it.kind === 'github' ? '新项目' : '新闻'}）`);
  lines.push(`- 命中框架：${it.hits.join('、') || '无'}`);
  lines.push(`- 分数：${it.score}`);
  lines.push(`- 链接：${it.link}`);
  lines.push('');
});

lines.push('---', '', '## 备选', '');
ranked.slice(S.top_n).forEach((it) => {
  lines.push(`- [${it.score}] ${it.title} — ${it.source}`);
});

const file = path.join(OUT, `${today}.md`);
fs.writeFileSync(file, lines.join('\n'), 'utf8');

console.log(`\n共 ${all.length} 条，去重后 ${seen.size} 条，命中框架 ${ranked.length} 条`);
console.log(`\n前 ${S.top_n} 条：`);
ranked.slice(0, S.top_n).forEach((it, i) => {
  console.log(`  ${i + 1}. [${it.score}] ${it.title}`);
  console.log(`     ${it.link}`);
});
console.log(`\n已写入 ${path.relative(ROOT, file)}\n`);
