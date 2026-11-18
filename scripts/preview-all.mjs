#!/usr/bin/env node
/**
 * 批量出组件静帧，拼成 contact sheet
 *
 * 用法：node scripts/preview-all.mjs [每张网格几个，默认 12]
 * 产出：out/previews/T01.png …，以及 out/sheet-1.png 等拼图
 *
 * 注意：有些组件必须给 props 才能看，PROPS 表里补的是「能体现它最好状态」的示例内容。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
process.chdir(ROOT);

const PER_SHEET = Number(process.argv[2] ?? 12);

const PROPS = {
  T01: { title: '六万三千星的项目', sub: '但没人讲清楚它怎么用' },
  T02: { left: '以前', right: '现在', leftItems: ['手动提交', '串行等待', '靠记忆'], rightItems: ['自动 diff', '并行跑', '有记录'] },
  T03: { steps: ['选题', '素材', '写稿', '配音', '装配', '发布'] },
  T04: { value: 63000, unit: 'star', caption: '两个月' },
  T05: { title: '装 CLI', command: 'npm i -g @openai/codex', outputs: ['added 2 packages in 2m', 'codex-cli 0.169.0'] },
  T06: { items: [{ head: '快', body: '写代码变快了' }, { head: '乱', body: '并行多了会乱' }, { head: '卡', body: '卡在审查' }] },
  T07: { quote: '它卖的不是效率，是让并行变得可管理。', author: '我的判断' },
  T08: { nodes: [{ id: 'a', label: '用户', x: 20, y: 30 }, { id: 'b', label: '控制台', x: 50, y: 30 }, { id: 'c', label: 'Agent', x: 80, y: 30 }], edges: [['a', 'b'], ['b', 'c']] },
  T09: { repo: 'pingdotgg/t3code', stars: '63k', desc: '开源的编码 Agent 控制台', lang: 'TypeScript' },
  T10: { file: 'queue.ts', removed: ['send(edit)'], added: ['queue.push(edit)', 'flush()'] },
  T11: { messages: [{ role: 'user', text: '这个改动为什么这么写？' }, { role: 'ai', text: '要考虑断线重连顺序。' }] },
  T12: { root: 't3code', files: [{ name: 'src', dir: true }, { name: 'app.tsx' }, { name: 'queue.ts' }] },
  T13: { items: [{ time: '三月', label: '立项' }, { time: '五月', label: '六万星' }, { time: '现在', label: 'v0.1.10' }] },
  T14: { rows: [{ label: '改前', value: 12 }, { label: '改后', value: 4 }] },
  T15: { tags: ['Claude Code', 'Codex', 'Cursor', 'OpenCode', 'Grok', 'Kiro'] },
  T16: { layers: [{ label: '模型' }, { label: 'Agent 运行时' }, { label: '控制台' }, { label: '你的工作流' }] },
  T17: { kind: 'warn', title: '坑二：worktree 不是沙箱', body: '它只隔离代码目录，不隔离权限。' },
  T18: { src: 'shots/t3-ui.png', title: '真实界面' },
  T19: { src: 'shots/t3-home.png', motion: 'in' },
  T20: { src: 'shots/t3-gh.png', region: { x: 76.5, y: 16.8, w: 6, h: 4.6 }, label: '63k star' },
  T21: { src: 'shots/t3-home.png', from: { x: 0, y: 0, w: 100, h: 100 }, to: { x: 22, y: 28, w: 56, h: 32 }, window: [0, 0.9] },
  T23: { title: '这个项目有多重', items: [{ value: 63000, label: 'star' }, { value: 12064, label: '提交' }, { value: 1225, label: '贡献者' }, { value: 841, label: '版本' }] },
  T24: { title: '并行三个，审查还是一个人', items: [{ value: 1, label: '代码', display: '1' }, { value: 3, label: '任务', display: '3' }, { value: 9, label: 'diff', display: '9' }] },
  T25: { title: '它到底在哪一层', layers: [{ label: '模型', desc: 'Claude / GPT' }, { label: 'Agent 运行时', desc: 'Codex' }, { label: '控制台', desc: 'T3 Code' }, { label: '你的工作流', desc: '审查' }] },
  T26: { text: 'npm i -g @openai/codex' },
  T27: { text: '它解决的不是写代码的问题', kicker: '先给结论', accentWords: [1, 2] },
  T28: { from: 100, to: 9, caption: '要审的 diff' },
  T29: { index: '02', title: '瓶颈换人了', kicker: '第三章' },
  T30: { question: '它到底解决什么问题？', sub: '六万三千星，但没人讲清楚怎么用' },
  T31: { text: 'It works with Claude Code, Codex, Cursor, OpenCode.', source: 'README', avatarText: 'T3' },
  T32: { left: '写代码', right: '审代码', caption: '瓶颈从左边移到右边' },
  T33: { text: 'AGENT CRASHED', sub: 'exit code 1' },
  T34: { badge: '项目拆解', title: 'T3 Code', sub: '开源控制台，六万三千星' },
  T35: { title: '它卖的不是效率', sub: '是让并行变得可管理', cta: '关注看下一条', handle: '@你的账号' },
  T36: { items: ['63k star', '12k commits', '1225 contributors', '841 releases'] },
  T37: { before: '它把', highlight: '写代码', after: '变快了', sub: '但审查没变快' },
  T38: { value: 78, label: '审查耗时', caption: '并行三个任务后' },
  T39: { items: [{ label: '写代码', value: 20 }, { label: '审查', value: 55 }, { label: '合并', value: 25 }], title: '时间花在哪' },
  T40: { points: [3, 8, 6, 14, 22, 19, 31, 45, 60], title: 'star 增长', xLabels: ['1月', '9月'] },
  T41: { points: [5, 8, 7, 12, 18, 26, 34, 48], title: '累积提交', label: '12064 次' },
  T42: { points: [{ x: 0.2, y: 0.3, label: 'A' }, { x: 0.8, y: 0.85, label: 'T3 Code', accent: true }], title: '谁在右上角', xLabel: '易用', yLabel: '能力' },
  T43: { rows: ['周一', '周二', '周三'], cols: ['早', '中', '晚'], values: [[3, 6, 9], [2, 8, 4], [7, 5, 1]], title: '什么时候最忙' },
  T44: { steps: [{ label: '看到', value: 1000 }, { label: '点开', value: 320 }, { label: '试用', value: 90 }], title: '转化' },
  T45: { value: 68, label: '负载', status: '偏高', statusColor: '#FFB020' },
  T46: { axes: ['能力', '速度', '成本', '生态', '稳定'], values: [80, 70, 55, 90, 65], title: '能力分布' },
  T47: { items: [{ label: '写代码', value: 40 }, { label: '审查', value: 35 }, { label: '调试', value: 15 }, { label: '沟通', value: 10 }], title: '时间构成' },
  T48: { before: { label: '改前', value: 40 }, after: { label: '改后', value: 12 }, unit: '分钟', title: '耗时变化' },
  T49: { items: [{ label: 'star', points: [3, 9, 18, 40, 63], value: '63k' }, { label: '提交', points: [2, 5, 8, 10, 12], value: '12k' }, { label: '版本', points: [1, 3, 5, 7, 8], value: '841' }], title: '几个指标' },
  T50: { steps: [{ label: '选题', desc: '人做' }, { label: '写稿', desc: '机器做' }, { label: '发布', desc: '人点' }], title: '流水线' },
  T51: { lanes: ['你', 'Agent', '系统'], steps: [{ lane: 0, label: '下任务' }, { lane: 1, label: '改代码' }, { lane: 2, label: '跑测试' }, { lane: 0, label: '审 diff' }], title: '谁做什么' },
  T52: { steps: ['写', '跑', '审', '合'], center: '飞轮' },
  T53: { levels: [{ label: '你的判断' }, { label: '工具链' }, { label: '模型' }], title: '越往上越稀缺' },
  T54: { root: 't3code', branches: [{ label: 'src', children: ['app.tsx', 'queue.ts'] }, { label: 'docs', children: ['README'] }] },
  T55: { layers: [{ label: '对话' }, { label: '线程' }, { label: '工作副本' }], title: '一层装一层' },
  T56: { tasks: [{ name: '任务A', start: 0, span: 4 }, { name: '任务B', start: 1, span: 5 }, { name: '任务C', start: 3, span: 3 }], total: 10, title: '三个并行' },
  T57: { nodes: [{ id: 'ui', label: '界面', x: 25, y: 30 }, { id: 'core', label: '核心', x: 55, y: 30 }, { id: 'agent', label: 'Agent', x: 80, y: 60 }], edges: [['ui', 'core'], ['core', 'agent']] },
  T58: { root: '要自动发布吗？', branches: [{ label: '是', result: '出事了没人拦', ok: false }, { label: '否', result: '人点最后一下', ok: true }] },
  T59: { stages: ['写', '跑', '审', '合', '发'], title: '转一圈' },
  T60: { rows: ['重要', '不重要'], cols: ['急', '不急'], cells: [{ r: 0, c: 0, label: '马上做', accent: true }, { r: 1, c: 1, label: '删掉' }], title: '优先级' },
  T61: { left: '会写代码', right: '会判断', overlap: '真正的门槛在这里' },
  T62: { title: 'queue.ts', lines: ['export function flush() {', '  const q = queue.splice(0)', '  return send(q)', '}'], lang: 'TS' },
  T63: { lines: ['send(edit)', 'queue.push(edit)', 'flush()'], highlight: [1, 2] },
  T64: { method: 'POST', path: '/v1/threads', status: 201, latency: '142ms', body: '{ "id": "th_8f2a" }' },
  T65: { entries: [['model', 'gpt-5'], ['runtime', 'codex'], ['cwd', '/project']], title: '配置' },
  T66: { lines: [{ text: 'starting codex...' }, { level: 'info', text: 'reading storyboard.md' }, { level: 'warn', text: 'mcp not configured' }, { level: 'error', text: 'exit code 1' }], title: 'LOGS' },
  T67: { error: 'codex: command not found', frames: ['at run (cli.ts:42)', 'at main (index.ts:8)'], hint: 'npm i -g @openai/codex' },
  T68: { leftTitle: '以前', left: ['serial: true', 'retry: 0'], rightTitle: '现在', right: ['serial: false', 'retry: 3'], verdict: '并行之后，重试策略得更小心' },
  T69: { branches: [{ name: 'main', commits: [{ msg: 'init' }, { msg: 'feat: queue' }] }, { name: 'feat/sync', commits: [{ msg: 'wip' }, { msg: 'merge', merged: true }] }] },
  T70: { name: '@openai/codex', version: '0.169.0', install: 'npm i -g @openai/codex', tags: ['cli', 'agent'], note: '装完还要登录' },
  T71: { columns: ['字段', '类型', '说明'], rows: [['id', 'string', '线程 id'], ['cwd', 'string', '工作目录']], title: '数据结构' },
  T72: { vars: [{ name: 'OPENAI_API_KEY', value: 'sk-…' }, { name: 'LINGYUNZHI_DEV_KEY', present: false }], title: '环境变量' },
  T73: { steps: [{ cmd: 'npm i -g @openai/codex', out: 'added 2 packages' }, { cmd: 'codex login', out: 'Logged in using ChatGPT' }], title: '装它' },
  T74: { src: 'shots/t3-home.png', url: 't3.codes' },
  T75: { src: 'shots/t3-app.png', caption: '手机上接着看' },
  T76: { title: 'Agent 跑完了', body: '3 个任务已就绪，等你审查', app: 'T3 Code' },
  T77: { title: '允许读取整个磁盘？', body: '这次操作会访问项目外的文件。', confirm: '允许一次', danger: true },
  T78: { fields: [{ label: '端口', value: '4780' }, { label: '工作目录', value: '/project' }], title: '启动参数' },
  T79: { label: '正在读取 storyboard.md…' },
  T80: { label: '安装中', stages: ['下载', '校验', '解压', '完成'] },
  T81: { rows: 4 },
  T82: { title: '还没有线程', body: '在上面输入一个任务，或者打开已有项目。' },
  T83: { target: 'Setup Worktree', tip: '为这个任务开独立工作副本', keyboard: '⌘W' },
  T84: { keys: ['⌘', 'K'], action: '打开命令面板' },
  T85: { from: { x: 20, y: 70 }, to: { x: 72, y: 34 }, label: '点这里新建' },
  T86: { text: 'worktree 不是沙箱', sub: '它只隔离文件' },
  T87: { label: '真实瓶颈在这', from: { x: 24, y: 68 }, to: { x: 74, y: 32 } },
  T88: { items: [{ text: '装 CLI', done: true }, { text: '跑通第一个任务', done: true }, { text: '配好权限', done: false }], title: '上手清单' },
  T89: { points: [{ head: '坑在装 CLI', body: '桌面版 ≠ 命令行' }, { head: '坑在权限', body: 'worktree 不是沙箱' }, { head: '坑在审查', body: '瓶颈换了人' }], title: '三个坑' },
  T90: { value: 9, unit: '份 diff', caption: '三个任务跑完，全堆到你面前' },
  T91: { options: ['手动', 'T3 Code'], rows: [{ label: '并行任务', values: [false, true] }, { label: '独立副本', values: [false, true] }, { label: '需要配置', values: [true, false] }], title: '差在哪', winner: 1 },
  T92: { before: 'shots/t3-gh.png', after: 'shots/t3-home.png', labelBefore: '仓库', labelAfter: '官网' },
  T93: { text: 'worktree 不是沙箱', sub: 'Agent 照样能读整个磁盘、拿你的凭证。', level: 'danger' },
  T94: { steps: ['装', '连', '跑', '审'], progress: 0.4, title: '现在走到哪' },
  T95: { tags: ['Claude Code', 'Codex', 'Cursor', 'OpenCode', 'Grok', 'Kiro', 'Pi', 'Muse'], title: '支持这些', highlight: ['T3 Code'] },
  T96: { text: '装了桌面版不等于有命令行。这一条卡了我二十分钟。', author: '真实经历' },
  T97: { text: '并行', sub: '不是目的，可管理才是' },
  T98: { left: { title: '以前', body: '一个任务跑完再开下一个' }, right: { title: '现在', body: '三个同时跑，各自独立副本' } },
  T99: { line1: '它卖的不是效率', line2: '是让并行可管理', handle: 'T3 CODE' },
  T100: { from: 0, to: 63000, suffix: 'star', caption: '两个月' },
  T22: { src: 'video/t3-live.mp4', startFrom: 26, label: '实机' },
  T101: { from: '上一镜', to: '下一镜', direction: 'left' },
  T102: { caption: '进入界面' },
  T103: { label: 'LUMA SWEEP' },
  T104: { from: '之前', to: '之后', center: '2026' },
  T105: { src: 'shots/t3-gh.png', calls: [{ x: 76, y: 16, text: '63k star' }, { x: 30, y: 40, text: '文件列表' }] },
  T106: { src: 'shots/t3-ui169.png', region: { x: 76, y: 32, w: 14, h: 10 }, label: 'Setup Worktree' },
  T107: { src: 'shots/t3-ui169.png', spots: [{ x: 10, y: 35, text: '任务列表' }, { x: 80, y: 38, text: '工作副本' }] },
  T108: { from: { x: 20, y: 70 }, to: { x: 72, y: 34 }, label: '新建线程', backdrop: 'T3 Code' },
  T109: { x: 62, y: 46 },
  T110: { kicker: '来源', title: 'T3 Code 官方 README', sub: 'github.com/pingdotgg/t3code' },
  T111: { text: '六万三千星', sub: '但没人讲清楚怎么用' },
  T112: { text: 'T3 CODE', sub: 'CONTROL PLANE' },
  T113: {
    title: '三档方案',
    tiers: [
      { name: '自用', price: '免费', features: ['单线程', '本机运行'] },
      { name: '团队', price: '$20', period: '月', features: ['并行任务', '独立副本'], highlight: true },
      { name: '企业', price: '定制', features: ['审计日志', '私有部署'] },
    ],
  },
  T114: { value: 63000, suffix: 'star', caption: '两个月' },
  T115: { name: 'T3 CODE', sub: 'control plane' },
};

const outDir = path.join(ROOT, 'out', 'previews');
fs.mkdirSync(outDir, { recursive: true });

const { bundle } = await import('@remotion/bundler');
const { selectComposition, renderStill } = await import('@remotion/renderer');
const { CATALOG } = await import('../src/catalog.ts');

console.log('打包一次…');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });

const results = [];
for (const entry of CATALOG) {
  const props = PROPS[entry.id] ?? {};
  const out = path.join(outDir, `${entry.id}.png`);
  try {
    const comp = await selectComposition({ serveUrl, id: entry.id, inputProps: props });
    await renderStill({
      composition: comp,
      output: out,
      frame: Math.floor(comp.durationInFrames * 0.62),
      serveUrl,
      inputProps: props,
    });
    results.push({ id: entry.id, ok: true });
    process.stdout.write('.');
  } catch (e) {
    results.push({ id: entry.id, ok: false, err: String(e).slice(0, 160) });
    process.stdout.write('x');
  }
}
console.log('');

const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.log('渲染失败：');
  bad.forEach((b) => console.log(' ', b.id, b.err));
}

// 拼 contact sheet：先把图缩到统一尺寸，再用 ffmpeg 网格
const okIds = results.filter((r) => r.ok).map((r) => r.id);
const COLS = 3;
const ROWS = Math.ceil(PER_SHEET / COLS);

for (let s = 0; s * PER_SHEET < okIds.length; s++) {
  const group = okIds.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  while (group.length < COLS * ROWS) group.push(group[group.length - 1]);

  const inputs = [];
  const filters = [];
  group.forEach((id, i) => {
    inputs.push('-i', path.join(outDir, `${id}.png`));
    filters.push(
      `[${i}:v]scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x111111[v${i}]`,
    );
  });
  const layout = group
    .map((_, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      return `${c * 640}_${r * 360}`;
    })
    .join('|');

  const filter =
    filters.join(';') +
    ';' +
    group.map((_, i) => `[v${i}]`).join('') +
    `xstack=inputs=${group.length}:layout=${layout}:fill=0x0A0A0C[out]`;

  const sheet = path.join(ROOT, `out/sheet-${s + 1}.png`);
  await new Promise((resolve, reject) => {
    const p = spawn(ffmpeg.path, ['-y', ...inputs, '-filter_complex', filter, '-map', '[out]', sheet], {
      stdio: 'ignore',
    });
    p.on('close', (c) => (c === 0 ? resolve() : reject(new Error('拼图失败'))));
  });
  console.log(`✓ ${path.relative(ROOT, sheet)} (${group.length} 个)`);
}
