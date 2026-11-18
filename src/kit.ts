/**
 * 设计常量（规则手册第 1 层：只管"长什么样"）
 *
 * 所有组件必须引用这里，禁止在组件里手写字号、颜色、间距。
 * 改风格只改这个文件，全库跟着变。
 */
import { Easing } from 'remotion';

/** 逻辑画布。渲染时按输出比例放大。 */
export const CANVAS = { w: 1920, h: 1080 } as const;

/** 配色：深色为默认，浅色备选。强调色只做稀疏点缀。 */
export const palette = {
  bg: '#14141A',
  /** 干净纸白，用于外部工具生成的浅色素材 */
  paperWarm: '#F4F3EF',
  bgLight: '#FBFBFD',
  ink: '#F2F2F5',
  inkMuted: 'rgba(242,242,245,0.58)',
  inkDark: '#0A0A0C',
  inkDarkMuted: 'rgba(10,10,12,0.55)',
  accent: '#635BFF',
  accentDim: 'rgba(99,91,255,0.16)',
  accentSoft: '#8C86FF',
  accentDeep: '#4A43C9',
  hairline: 'rgba(255,255,255,0.14)',
  hairlineDark: 'rgba(0,0,0,0.12)',
  glass: 'rgba(255,255,255,0.05)',
  ok: '#3DDC97',
  warn: '#FFB020',
  danger: '#FF5A5A',
  dangerSoft: '#FF8080',
  /** GitHub 语言色 */
  langTS: '#3178C6',
  /** 深色底上的主文字色，比纯白柔和 */
  ink: '#F2F2F5',
  /** 浅色底 */
  paper: '#FFFFFF',
  /** 终端/代码底、窗口栏、弹窗、气泡等深色界面层 */
  term: '#0B0B0E',
  screen: '#0C0C10',
  panelDark: '#101014',
  surface2: '#17171D',
  windowBar: '#1A1A20',
  surface3: '#22222A',
  bezel: '#23232B',
  key: '#2A2A33',
  /** 便签 */
  note: '#F5D76E',
  noteInk: '#2A2410',
  noteFold: '#E3C45B',
  /** 故障效果 */
  glitchRed: '#FF3B5C',
  glitchCyan: '#22D3EE',
  /** 立体面：正面 / 受光面 / 背光面 */
  solid: '#3A3A44',
  solidLit: '#5A5A68',
  solidDim: '#26262E',
  /** 终端/浏览器窗口的三个圆点 */
  windowDot: ['#FF5F57', '#FEBC2E', '#28C840'] as readonly string[],
} as const;

/** 铺真实画面（截图/录屏）时用的底色与遮罩，集中在这里，组件不许写死 */
export const media = {
  black: '#000000',
  white: '#FFFFFF',
  scrimBottom:
    'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 28%, rgba(0,0,0,0) 52%)',
  badgeBg: 'rgba(0,0,0,0.72)',
  border: 'rgba(255,255,255,0.14)',
  mask: 'rgba(0,0,0,0.68)',
} as const;

/** 字体栈。MiSans 装了就用，没装回落系统黑体。 */
export const font = {
  sans: `'Noto Sans SC','Source Han Sans SC','MiSans','PingFang SC','Microsoft YaHei',system-ui,sans-serif`,
  mono: `'JetBrains Mono','Cascadia Code',Consolas,monospace`,
} as const;

/** 字阶。同一模块内最多用两档，不要每个元素一个字号。 */
export const type = {
  huge: 200,
  xl: 132,
  l: 96,
  m: 64,
  s: 44,
  body: 34,
  small: 26,
  micro: 19,
} as const;

/** 间距，8 的倍数。 */
export const sp = (n: number) => n * 8;

/** 缓动。默认用 out，禁止 linear 淡入淡出。 */
export const E = {
  out: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  snap: Easing.bezier(0.16, 1, 0.3, 1),
} as const;

/** 主题派生。组件统一用 themeOf(theme) 取色，不直接读 palette。 */
export const themeOf = (theme: 'dark' | 'light' = 'dark') => ({
  bg: theme === 'dark' ? palette.bg : palette.bgLight,
  ink: theme === 'dark' ? palette.ink : palette.inkDark,
  muted: theme === 'dark' ? palette.inkMuted : palette.inkDarkMuted,
  hairline: theme === 'dark' ? palette.hairline : palette.hairlineDark,
});

/** 标准入场：给每段动画一个统一手感。 */
export const springIn = (
  frame: number,
  fps: number,
  delay = 0,
  durationInFrames = 24,
) => {
  const f = frame - delay;
  if (f <= 0) return 0;
  // 用余弦缓出，比线性自然，且比 spring 更可控
  const p = Math.min(1, f / durationInFrames);
  return 1 - Math.pow(1 - p, 3);
};

/**
 * 透明度下限。段与段是硬切的，如果元素从 0 开始淡入，
 * 每段开头会出现约 0.4 秒纯背景色（门禁会判成黑屏）。
 * 所以入场从 12% 起，保证任何一帧都有内容。
 */
export const MIN_OPACITY = 0.12;

export const fade = (p: number) => MIN_OPACITY + p * (1 - MIN_OPACITY);

/** 缓慢上浮 + 淡入，组件通用的"进入"动作。 */
export const riseIn = (p: number, distance = 28) => ({
  opacity: fade(p),
  transform: `translateY(${(1 - p) * distance}px)`,
});

/**
 * FredTalk 视觉规范（DESIGN.md 2.1/2.2）
 *
 * 白画布、黑面 #19191C、白卡靠阴影立住（无描边）、
 * 紫色只给当前关键词、灰只用于退后层。
 * 不要加别的装饰色：彩色只来自真实素材的像素。
 */
export const fred = {
  canvas: '#FFFFFF',
  /** 画布底色：不用纯白，极淡冷灰，界面才立得住 */
  stage: '#F4F4F6',
  /** 深色舞台：不用纯黑 */
  stageDeep: '#17171A',
  ink: '#19191C',
  purple: '#8554E8',
  gray: '#6C6C72',
  grayWeak: '#A3A3AB',
  cardShadow: '0 18px 34px rgba(0,0,0,0.10)',
  /** 深色窗口投影：比白卡重，屏幕才立得住 */
  shadowWindow: '0 34px 72px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.14)',
  /** 深色舞台上的窗口投影 */
  shadowStage: '0 50px 120px rgba(0,0,0,0.62), 0 12px 30px rgba(0,0,0,0.4)',
  /** 深色舞台微光 */
  stageGlow: 'radial-gradient(120% 90% at 50% 30%, rgba(120,110,255,0.10) 0%, rgba(23,23,26,0) 62%)',
  /** 浅舞台的远端色，和 stage 拼成一层渐变 */
  stageEdge: '#E9E9EF',
  /** 舞台柔光点，录屏镜头用它打方向光 */
  stageAmbient: 'rgba(133,84,232,0.13)',
  /** 屏幕底色：比纯黑浅，看起来像一块屏 */
  screenBase: '#0E0E11',
  /** 屏幕内壁高光 */
  screenEdge: '1px solid rgba(255,255,255,0.10)',
  /** 暗角：ALPHA 会被替换成强度 */
  vignetteColor: 'rgba(0,0,0,ALPHA)',
  /** 屏幕玻璃反光 */
  screenSheen: 'linear-gradient(148deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 32%)',
  /** 暗底上的文字层级 */
  onDarkStrong: 'rgba(255,255,255,0.86)',
  onDark: 'rgba(255,255,255,0.5)',
  onDarkWeak: 'rgba(255,255,255,0.35)',
  line: 'rgba(25,25,28,0.18)',
  lineSoft: 'rgba(25,25,28,0.10)',
  /** 大字：单屏结论 */
  display: 92,
  /** 卡片标题 */
  cardTitle: 56,
  /** 正文 */
  bodyFred: 46,
  /** 说明 */
  note: 40,
} as const;

/** 终端配色：所有「代码/命令」画面共用一套，避免每个组件各写一份 */
export const term = {
  bg: '#0E0E11',
  bar: '#18181C',
  text: '#D8D8E0',
  dim: '#6E6E7A',
  dimmer: '#585862',
  path: 'rgba(255,255,255,0.45)',
  green: '#3ECF8E',
  key: '#8AB4F8',
  str: '#A5D6A7',
  amber: '#E8C170',
  red: '#E5484D',
  dotRed: '#FF5F57',
  dotYellow: '#FEBC2E',
  dotGreen: '#28C840',
} as const;
