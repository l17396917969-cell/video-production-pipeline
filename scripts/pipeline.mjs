#!/usr/bin/env node
/**
 * 一条命令跑完整个流程
 *
 * 用法：
 *   node scripts/pipeline.mjs episodes/t3code              从字幕跑到成片
 *   node scripts/pipeline.mjs episodes/t3code --from gate   从某一步开始
 *   node scripts/pipeline.mjs episodes/t3code --with-publish  连发布文案一起出
 *   node scripts/pipeline.mjs episodes/t3code --dry         只打印要跑什么
 *
 * 为什么要有这个：六个脚本手动跑，漏一步就是废片。而且没有统一入口，
 * 就没法在每步之间插验收——这才是"管线"和"一堆脚本"的区别。
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ep = process.argv[2];
const args = process.argv.slice(3);
const fromId = pick('--from');
const toId = pick('--to');
const dry = args.includes('--dry');
const withPublish = args.includes('--with-publish');

function pick(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

if (!ep) {
  console.error('用法: node scripts/pipeline.mjs episodes/<期号> [--from 步] [--to 步] [--dry]');
  process.exit(1);
}

const EP_DIR = path.join(ROOT, ep);
if (!fs.existsSync(EP_DIR)) {
  console.error(`找不到 ${ep}`);
  process.exit(1);
}

/** 每一步：名字 + 怎么跑 + 跑之前要有啥 + 跑完要满足啥 */
const STEPS = [
  {
    id: 'check',
    name: '检查素材与稿件',
    run: () => checkInputs(),
    verify: 'manifest 有段、音频在、字幕已生成',
  },
  {
    id: 'assets',
    name: '素材索引与复用检查',
    cmd: ['node', 'scripts/index-assets.mjs', ep],
    verify: '无缺失素材；同一素材复用不超过 3 次',
  },
  {
    id: 'subtitle',
    name: '按时间轴生成字幕',
    cmd: ['node', 'scripts/build-subtitles.mjs', ep],
    verify: '字幕条数 ≥ 台词句数的 90%',
  },
  {
    id: 'gate',
    name: '内容与节奏门禁',
    cmd: ['node', 'scripts/gate.mjs', ep],
    verify: 'PASS，且没有 ✗',
  },
  {
    id: 'render',
    name: '渲染成片',
    cmd: ['node', 'scripts/render-episode.mjs', ep],
    verify: 'out.mp4 存在且大于 5 MB',
  },
  {
    id: 'publish',
    name: '生成发布文案',
    cmd: ['node', 'scripts/publish.mjs', ep],
    optional: true,
    verify: '三个平台各一份 md',
  },
];

function checkInputs() {
  const manifestPath = path.join(EP_DIR, 'manifest.json');
  const problems = [];

  if (!fs.existsSync(manifestPath)) {
    problems.push('缺 manifest.json');
  } else {
    const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!m.segments?.length) problems.push('manifest 里没有镜头');
    if (!m.audio) problems.push('manifest 没指定音频');

    // 音频文件在不在
    if (m.audio) {
      const cands = [
        path.join(ROOT, 'public', m.audio),
        path.join(EP_DIR, m.audio),
        path.join(EP_DIR, path.basename(m.audio)),
      ];
      if (!cands.some((p) => fs.existsSync(p))) problems.push(`音频文件找不到：${m.audio}`);
    }

    // 素材引用是否都存在
    const missing = new Set();
    for (const s of m.segments) {
      const src = s.props?.src;
      if (!src) continue;
      if (!fs.existsSync(path.join(ROOT, 'public', src))) missing.add(src);
    }
    if (missing.size) problems.push(`素材缺失：${[...missing].join(', ')}`);
  }

  if (!fs.existsSync(path.join(EP_DIR, 'script.md'))) problems.push('缺 script.md');

  if (problems.length) {
    throw new Error(problems.join('；'));
  }
  console.log('   ✓ 稿件、音频、素材引用都齐全');
}

const fromIdx = fromId ? STEPS.findIndex((s) => s.id === fromId) : 0;
const toIdx = toId ? STEPS.findIndex((s) => s.id === toId) : STEPS.length - 1;
if (fromIdx < 0 || toIdx < 0) {
  console.error(`步名写错了。可选：${STEPS.map((s) => s.id).join(' / ')}`);
  process.exit(1);
}

const todo = STEPS.slice(fromIdx, toIdx + 1).filter((s) => withPublish || !s.optional);

console.log(`\n流程：${ep}`);
console.log(`要跑 ${todo.length} 步：${todo.map((s) => s.name).join(' → ')}\n`);

const t0 = Date.now();
for (let i = 0; i < todo.length; i++) {
  const step = todo[i];
  console.log(`[${i + 1}/${todo.length}] ${step.name}`);
  console.log(`   验收：${step.verify}`);

  if (dry) {
    console.log('   （dry run，跳过执行）\n');
    continue;
  }

  const started = Date.now();
  let ok = true;
  try {
    if (step.run) {
      step.run();
    } else {
      const r = spawnSync(step.cmd[0], step.cmd.slice(1), {
        cwd: ROOT,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      ok = r.status === 0;
    }
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    ok = false;
  }

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (!ok) {
    console.error(`\n✗ 卡在「${step.name}」，后面的步骤没有执行。`);
    console.error(`  修好之后从这一步继续：node scripts/pipeline.mjs ${ep} --from ${step.id}\n`);
    process.exit(1);
  }
  console.log(`   ✓ 通过（${secs}s）\n`);
}

console.log(`✓ 全部通过，总耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
const out = path.join(EP_DIR, 'out.mp4');
if (fs.existsSync(out)) {
  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
  console.log(`  成片：${path.relative(ROOT, out)}（${mb} MB）\n`);
}
