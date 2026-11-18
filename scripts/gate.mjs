#!/usr/bin/env node
/**
 * 门禁
 *
 * 干什么：交付前机械检查。只证明"没犯已知的错"，不证明"画面好看"。
 * 怎么用：node scripts/gate.mjs episodes/0001
 * 退出码：0 = PASS，1 = FAIL
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
const ffmpegPath = ffmpeg.path;

const ROOT = path.resolve(import.meta.dirname, '..');
const epDir = process.argv[2];
if (!epDir) {
  console.error('用法: node scripts/gate.mjs episodes/<期号>');
  process.exit(1);
}

const abs = path.isAbsolute(epDir) ? epDir : path.join(ROOT, epDir);
const problems = [];
const notes = [];

const fail = (msg) => problems.push(msg);

/* ---------- 1. 结构 ---------- */
const manifestPath = path.join(abs, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  fail('缺少 manifest.json（还没装配）');
} else {
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const segs = m.segments ?? [];

  if (segs.length === 0) fail('manifest 里没有 segments');

  segs.forEach((s, i) => {
    if (!s.component) fail(`段 ${s.id ?? i} 没有指定组件`);

    if (!Array.isArray(s.candidates) || s.candidates.length < 3) {
      fail(`段 ${s.id ?? i} 候选不足 3 个（规则：前 3 必须逐个看并写理由）`);
    } else {
      const empty = s.candidates.filter((c) => !c.why || c.why.trim().length < 4);
      if (empty.length) fail(`段 ${s.id ?? i} 有候选没写理由`);
    }

    if (i > 0 && segs[i - 1].component === s.component) {
      // 素材类组件连续用是合理的（同一张图换个机位），只要参数不同就算不同镜头。
      // 文字类组件连续用才会真的看起来一样。
      const MATERIAL = new Set([
  'T124',
  'T124','T18','T19','T20','T21','T22','T23','T24','T25','T74','T75','T92','T105','T106','T117','T126']);
      const sameProps =
        JSON.stringify(segs[i - 1].props ?? {}) === JSON.stringify(s.props ?? {});
      if (MATERIAL.has(s.component) && !sameProps) {
        notes.push(`段 ${s.id ?? i} 与上一段同为 ${s.component}，参数不同，视为不同机位`);
      } else {
        fail(`段 ${s.id ?? i} 和上一段用了同一个组件（连续重复）`);
      }
    }

    // 节奏：单镜 3–8 秒
    const dur = s.end - s.start;
    if (dur > 8) fail(`段 ${s.id ?? i} 时长 ${dur.toFixed(1)}s，超过 8s（会拖节奏）`);
    if (dur < 3) notes.push(`段 ${s.id ?? i} 只有 ${dur.toFixed(1)}s，可能一闪而过`);

    const propsText = JSON.stringify(s.props ?? {});
    const longest = Math.max(
      0,
      ...(propsText.match(/"[^"]{20,}"/g) ?? []).map((x) => x.length),
    );
    if (longest > 26) notes.push(`段 ${s.id ?? i} 有个 prop 超过 26 字符，可能一屏字太多`);
  });

  // ---- 节奏与素材构成 ----
  if (segs.length) {
    const total = segs.reduce((a, s) => a + (s.end - s.start), 0);
    const avg = total / segs.length;

    if (total < 50) notes.push(`总时长 ${total.toFixed(1)}s，偏短`);
    if (total > 80) fail(`总时长 ${total.toFixed(1)}s，超过 80s`);
    if (avg > 5.5) fail(`平均单镜 ${avg.toFixed(1)}s，超过 5.5s（太慢，拆机位）`);

    // 真实素材（截图/录屏类组件）占比
    const MATERIAL = new Set([
  'T124',
  'T124','T18','T19','T20','T21','T22','T23','T24','T25','T74','T75','T92','T105','T106','T117','T126']);
    const materialCount = segs.filter((s) => MATERIAL.has(s.component)).length;
    const ratio = materialCount / segs.length;
    // 55% 是底线：再低就说明画面被文字卡片占满了。
    // 纯转场和底纹是叙事需要，不能简单算成 PPT 感。
    if (ratio < 0.5) {
      fail(`真实素材镜头只占 ${(ratio * 100).toFixed(0)}%，低于 50%（画面被文字占满）`);
    }

    // 另一条更狠的：纯文字卡片不能超过 30%
    const CARD = new Set(['T01', 'T02', 'T06', 'T07', 'T17', 'T89', 'T93', 'T95', 'T97', 'T99', 'T110', 'T111', 'T112', 'T115']);
    const cardRatio = segs.filter((s) => CARD.has(s.component)).length / segs.length;
    if (cardRatio > 0.3) {
      fail(`纯文字卡片占 ${(cardRatio * 100).toFixed(0)}%，超过 30%`);
    }

    notes.push(`节奏：${segs.length} 镜 / ${total.toFixed(1)}s / 平均 ${avg.toFixed(1)}s / 真实素材 ${(ratio * 100).toFixed(0)}%`);

    // 素材复用：同一张图/同一段录屏反复出现，观众第七分钟就看出在凑
    const srcUse = {};
    for (const s of segs) {
      const src = s.props?.src;
      if (!src) continue;
      srcUse[src] = (srcUse[src] ?? 0) + 1;
    }
    const hot = Object.entries(srcUse).filter(([, n]) => n > 3);
    if (hot.length) {
      fail(`素材复用过头：${hot.map(([k, n]) => `${k} 用了 ${n} 次`).join('；')}`);
    }
    const warm = Object.entries(srcUse).filter(([, n]) => n === 3);
    if (warm.length) {
      notes.push(`素材用了 3 次（可接受但要盯着）：${warm.map(([k]) => k).join(', ')}`);
    }
  }

  if (m.audio) {
    // 音频走 Remotion 的 staticFile，实际放在 public/ 下
    const tries = [path.join(ROOT, 'public', m.audio), path.join(abs, m.audio)];
    if (!tries.some((f) => fs.existsSync(f))) {
      fail(`manifest 指向的音频不存在: ${m.audio}（找过 public/ 和期目录）`);
    }
  }
}

/* ---------- 2. 成片 ---------- */
const videoCandidates = ['out.mp4', 'out/final.mp4', 'out/preview.mp4']
  .map((f) => path.join(abs, f))
  .filter((f) => fs.existsSync(f));

if (videoCandidates.length === 0) {
  fail('找不到成片（out.mp4 / out/final.mp4 / out/preview.mp4）');
} else {
  const video = videoCandidates[videoCandidates.length - 1];
  const info = await probe(video);

  if (!info) {
    fail('视频读不出来（ffmpeg 无法解析）');
  } else {
    const { duration, videoSec, audio } = info;
    if (duration < 1) fail('视频时长异常');

    if (!videoSec) fail('视频流缺失');
    if (!audio) fail('没有音频轨（口播片必须有）');

    // 真黑屏：阈值 20，深色主题（背景亮度约 25）不会被误判
    const blacks = await blackDetect(video);
    const longBlacks = blacks.filter((b) => b.d > 0.35);
    if (longBlacks.length) {
      fail(
        `检测到 ${longBlacks.length} 段真黑屏 >0.35s：` +
          longBlacks.map((b) => `${b.start.toFixed(1)}–${b.end.toFixed(1)}s`).join(', '),
      );
    } else if (blacks.length) {
      notes.push(`有 ${blacks.length} 段短黑屏（<0.35s），作转场则正常，确认一下`);
    }

    console.log(`  视频 ${duration.toFixed(1)}s · ${info.w}x${info.h} · ${audio ? '有音轨' : '无音轨'}`);
  }
}

/* ---------- 3. 组件库规范 ---------- */
const compDir = path.join(ROOT, 'src', 'components');
if (fs.existsSync(compDir)) {
  for (const f of fs.readdirSync(compDir).filter((x) => x.endsWith('.tsx'))) {
    const src = fs.readFileSync(path.join(compDir, f), 'utf8');
    if (/#[0-9A-Fa-f]{3,6}/.test(src)) fail(`${f} 里写死了颜色（应走 kit.ts）`);
    if (/fontSize:\s*\d+/.test(src)) fail(`${f} 里写死了字号（应走 kit.ts）`);
  }
}

/* ---------- 汇报 ---------- */
function probe(file) {
  return new Promise((resolve) => {
    const p = spawn(ffmpegPath, ['-i', file, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', () => {
      const dm = err.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      const vm = err.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
      if (!dm) return resolve(null);
      resolve({
        duration: +dm[1] * 3600 + +dm[2] * 60 + parseFloat(dm[3]),
        w: vm?.[1] ?? '?',
        h: vm?.[2] ?? '?',
        videoSec: !!vm,
        audio: /Audio:/.test(err),
      });
    });
  });
}

/**
 * 真黑屏检测。
 *
 * 不用 blackdetect：它对深色主题不友好，背景 #0A0A0C（亮度约 25）
 * 会被它判成黑，导致每段都误报。改用 blackframe 按亮度阈值判断：
 * threshold=20，比背景暗的才算黑，真正的渲染失败（Y≈16）能抓到。
 */
function blackDetect(file) {
  return new Promise((resolve) => {
    const p = spawn(
      ffmpegPath,
      ['-i', file, '-vf', 'blackframe=amount=90:threshold=20', '-an', '-f', 'null', '-'],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', () => {
      const times = [];
      for (const m of err.matchAll(/blackframe:.*?t:([\d.]+)/g)) times.push(+m[1]);

      // 连续的黑帧合成区间
      const ranges = [];
      for (const t of times) {
        const last = ranges[ranges.length - 1];
        if (last && t - last.end <= 0.15) last.end = t;
        else ranges.push({ start: t, end: t });
      }
      resolve(ranges.map((r) => ({ ...r, d: r.end - r.start })));
    });
  });
}

console.log(`\n门禁检查 ${path.relative(ROOT, abs)}\n`);

if (notes.length) {
  console.log('提示：');
  notes.forEach((n) => console.log(`  · ${n}`));
  console.log('');
}

if (problems.length) {
  console.log('FAIL：');
  problems.forEach((p) => console.log(`  ✗ ${p}`));
  console.log('');
  process.exit(1);
}

console.log('PASS\n');
