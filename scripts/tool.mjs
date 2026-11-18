#!/usr/bin/env node
/**
 * 生产工具箱：把一批零散能力收进一个入口
 *
 * 用法：
 *   node scripts/tool.mjs shots episodes/t3code       生成分镜文档 shots.md
 *   node scripts/tool.mjs align episodes/t3code       台词与画面对位检查
 *   node scripts/tool.mjs snapshot episodes/t3code    给当前成片存一个版本快照
 *   node scripts/tool.mjs learn episodes/t3code       从 review.md 提取教训进规则库
 *   node scripts/tool.mjs track episodes/t3code 抖音 12000 480  记录发布数据
 *   node scripts/tool.mjs list                        看历史版本和发布数据
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const [cmd, ep, ...rest] = process.argv.slice(2);

const need = (cond, msg) => {
  if (!cond) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
};

function readManifest(epDir) {
  const p = path.join(ROOT, epDir, 'manifest.json');
  need(fs.existsSync(p), `找不到 ${epDir}/manifest.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ---------- shots：从 manifest 反推分镜文档 ----------
function shots(epDir) {
  const m = readManifest(epDir);
  const subs = m.subtitles ?? [];
  const lines = [
    `# ${path.basename(epDir)} 分镜表`,
    '',
    `自动生成自 manifest.json，共 ${m.segments.length} 镜。`,
    `改镜头请改 manifest，不要改这份文档。`,
    '',
    '| # | 时间 | 时长 | 组件 | 画面 | 台词 |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  m.segments.forEach((s, i) => {
    const sub = subs.find((x) => x.start < s.end - 0.05 && x.end > s.start + 0.05);
    const p = s.props ?? {};
    const what =
      p.label || p.title || p.text || p.question || p.line1 || p.name ||
      (p.tags ? p.tags.slice(0, 3).join(' / ') : '') ||
      (p.items ? p.items.map((x) => x.label || x.head).join(' / ') : '') ||
      (p.layers ? p.layers.map((x) => x.label).join(' → ') : '') ||
      (p.entries ? p.entries.map((x) => x[0]).join(', ') : '') ||
      (p.src ? p.src.split('/').pop() : '');
    const dur = (s.end - s.start).toFixed(1);
    lines.push(`| ${String(i + 1).padStart(2, '0')} | ${s.start.toFixed(1)}–${s.end.toFixed(1)} | ${dur}s | ${s.component} | ${String(what).slice(0, 26)} | ${(sub?.text ?? '').slice(0, 26)} |`);
  });

  const out = path.join(ROOT, epDir, 'shots.md');
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
  console.log(`✓ ${path.relative(ROOT, out)}（${m.segments.length} 镜）`);
}

// ---------- align：台词与画面对位检查 ----------
function align(epDir) {
  const m = readManifest(epDir);
  const subs = m.subtitles ?? [];
  const problems = [];

  m.segments.forEach((s, i) => {
    const tag = s.id ?? `#${i + 1}`;
    const dur = s.end - s.start;
    const sub = subs.find((x) => x.start < s.end - 0.05 && x.end > s.start + 0.05);

    // 1. 没字幕的镜头 = 观众不知道在看什么
    if (!sub) problems.push(`${tag} 没有对应字幕`);

    // 2. 长台词配太短的镜头。
    //    只检查「完整落在这一镜内」的字幕——跨镜字幕是正常的，
    //    一句话本来就该配几个机位，不能算错。
    const fullyInside = sub && sub.start >= s.start - 0.05 && sub.end <= s.end + 0.05;
    if (fullyInside && sub.text.length > 22 && dur < 2.0) {
      problems.push(`${tag} 台词 ${sub.text.length} 字但只有 ${dur.toFixed(1)}s`);
    }

    // 3. props 全空的镜头 = 大概忘了配内容
    const p = s.props ?? {};
    if (!Object.keys(p).length) problems.push(`${tag} props 是空的`);

    // 4. 时长异常
    if (dur < 0.8) problems.push(`${tag} 只有 ${dur.toFixed(1)}s，会闪一下`);
  });

  if (problems.length) {
    console.log(`对位检查发现 ${problems.length} 个问题：`);
    problems.forEach((p) => console.log(`  ✗ ${p}`));
    process.exit(1);
  }
  console.log(`✓ 对位检查通过（${m.segments.length} 镜）`);
}

// ---------- snapshot：版本快照 ----------
function snapshot(epDir) {
  const src = path.join(ROOT, epDir, 'out.mp4');
  need(fs.existsSync(src), '还没有 out.mp4，先渲染');
  const dir = path.join(ROOT, epDir, 'versions');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dst = path.join(dir, `out-${stamp}.mp4`);
  fs.copyFileSync(src, dst);

  const meta = path.join(dir, `out-${stamp}.json`);
  const m = readManifest(epDir);
  const total = m.segments.reduce((a, s) => a + (s.end - s.start), 0);
  fs.writeFileSync(
    meta,
    JSON.stringify({ at: stamp, segments: m.segments.length, seconds: Number(total.toFixed(1)), bytes: fs.statSync(dst).size }, null, 2),
  );
  console.log(`✓ versions/out-${stamp}.mp4`);
}

// ---------- learn：从返工记录提取教训 ----------
function learn(epDir) {
  const review = path.join(ROOT, epDir, 'review.md');
  need(fs.existsSync(review), `没有 ${epDir}/review.md`);
  const text = fs.readFileSync(review, 'utf8');
  const rules = path.join(ROOT, 'rules', 'LEARNED.md');
  const head = fs.existsSync(rules) ? fs.readFileSync(rules, 'utf8') : '# 从返工里长出来的规则\n\n';

  const date = new Date().toISOString().slice(0, 10);
  const title = path.basename(epDir);
  const body = text
    .split('\n')
    .filter((l) => /^[-*]\s+/.test(l))
    .slice(0, 12)
    .join('\n');

  if (!body) {
    console.log('review.md 里没找到可提取的条目（需要以 - 或 * 开头的行）');
    return;
  }

  const section = `\n## ${title}（${date}）\n\n${body}\n`;
  if (head.includes(`## ${title}（${date}）`)) {
    console.log('这一期的教训已经提取过了，跳过');
    return;
  }
  fs.writeFileSync(rules, head + section, 'utf8');
  console.log(`✓ rules/LEARNED.md 追加 ${body.split('\n').length} 条`);
}

// ---------- track：发布数据 ----------
function track(epDir) {
  const [platform, views, likes] = rest;
  need(platform, '用法：tool.mjs track <期号> <平台> <播放量> [点赞数]');
  const f = path.join(ROOT, 'data', 'published.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const data = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { records: [] };

  data.records.push({
    episode: path.basename(epDir),
    platform,
    views: Number(views) || 0,
    likes: Number(likes) || 0,
    recordedAt: new Date().toISOString(),
  });
  fs.writeFileSync(f, JSON.stringify(data, null, 2));
  console.log(`✓ 已记录：${platform} ${views} 播放`);

  // 顺手给一句横向对比
  const same = data.records.filter((r) => r.platform === platform);
  if (same.length > 1) {
    const avg = same.reduce((a, r) => a + r.views, 0) / same.length;
    const cur = Number(views);
    console.log(`  ${platform} 历史均值 ${Math.round(avg)}，这条${cur >= avg ? '高于' : '低于'}均值 ${Math.abs(Math.round(((cur - avg) / avg) * 100))}%`);
  }
}

// ---------- list：看历史 ----------
function list() {
  const eps = fs.readdirSync(path.join(ROOT, 'episodes'));
  console.log('版本快照：');
  for (const e of eps) {
    const v = path.join(ROOT, 'episodes', e, 'versions');
    if (!fs.existsSync(v)) continue;
    const files = fs.readdirSync(v).filter((f) => f.endsWith('.mp4'));
    if (files.length) console.log(`  ${e}: ${files.length} 个版本`);
  }
  const f = path.join(ROOT, 'data', 'published.json');
  if (fs.existsSync(f)) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log(`发布记录：${d.records?.length ?? 0} 条`);
  }
}

switch (cmd) {
  case 'shots': shots(ep); break;
  case 'align': align(ep); break;
  case 'snapshot': snapshot(ep); break;
  case 'learn': learn(ep); break;
  case 'track': track(ep); break;
  case 'list': list(); break;
  default:
    console.log('用法见文件头注释');
}
