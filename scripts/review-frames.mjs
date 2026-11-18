#!/usr/bin/env node
/**
 * 视觉验收：把成片按镜头抽帧、拼成审片墙，交给眼睛（人或 AI）看
 *
 * 用法：
 *   node scripts/review-frames.mjs episodes/t3code           每个镜头抽 1 帧
 *   node scripts/review-frames.mjs episodes/t3code --per 3   每镜抽 3 帧（更严）
 *   node scripts/review-frames.mjs episodes/t3code --only s17,s18
 *
 * 产出：out/review/<期号>/sheet-*.png
 *
 * 为什么需要这个：gate 只能查"有没有黑帧、时长够不够"，
 * 查不出"这画面难看、这字太小、这块糊了"。那只能看。
 * 把 33 个镜头摊在一张图上，一眼就能挑出哪几个不行。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const epArg = process.argv[2];
const args = process.argv.slice(3);
const per = Number(args.includes('--per') ? args[args.indexOf('--per') + 1] : 1);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;

if (!epArg) {
  console.error('用法: node scripts/review-frames.mjs episodes/<期号> [--per N] [--only s01,s02]');
  process.exit(1);
}

const epDir = path.join(ROOT, epArg);
const manifest = JSON.parse(fs.readFileSync(path.join(epDir, 'manifest.json'), 'utf8'));
const video = path.join(epDir, 'out.mp4');
if (!fs.existsSync(video)) {
  console.error('还没有 out.mp4，先渲染');
  process.exit(1);
}

const epName = path.basename(epArg);
const outDir = path.join(ROOT, 'out', 'review', epName);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const segs = manifest.segments.filter((s) => !only || only.includes(s.id));
const frames = [];

for (const s of segs) {
  const dur = s.end - s.start;
  for (let k = 0; k < per; k++) {
    // 取镜头中段，避开入场动画
    const at = s.start + dur * (0.35 + (0.5 / Math.max(1, per)) * k);
    const file = path.join(outDir, `${s.id}${per > 1 ? `-${k + 1}` : ''}.png`);
    spawnSync(ffmpeg.path, ['-y', '-ss', at.toFixed(2), '-i', video, '-frames:v', '1', file], { stdio: 'ignore' });
    if (fs.existsSync(file)) frames.push({ file, id: s.id, at });
  }
}

console.log(`抽了 ${frames.length} 帧`);

// 用 System.Drawing 拼审片墙（12 张一版）
const ps = `
Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem "${outDir.replace(/\\/g, '\\\\')}\\*.png" | Sort-Object Name
$cols = 3; $cw = 640; $ch = 360; $per = 12
$sheet = 0
for ($i = 0; $i -lt $files.Count; $i += $per) {
  $sheet++
  $group = $files[$i..([Math]::Min($i + $per - 1, $files.Count - 1))]
  $rows = [Math]::Ceiling($group.Count / $cols)
  $bmp = New-Object System.Drawing.Bitmap ($cols * $cw), ($rows * $ch)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(10,10,12))
  $g.InterpolationMode = 'HighQualityBicubic'
  for ($j = 0; $j -lt $group.Count; $j++) {
    $img = [System.Drawing.Image]::FromFile($group[$j].FullName)
    $g.DrawImage($img, ($j % $cols) * $cw, [Math]::Floor($j / $cols) * $ch, $cw, $ch)
    $img.Dispose()
  }
  $g.Dispose()
  $bmp.Save("${outDir.replace(/\\/g, '\\\\')}\\sheet-$sheet.png", [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  "sheet-$sheet.png"
}
`;
const r = spawnSync('pwsh', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
console.log(r.stdout?.trim() || '');
console.log(`\n审片墙在：${path.relative(ROOT, outDir)}`);
