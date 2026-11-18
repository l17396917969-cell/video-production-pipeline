import { staticFile } from 'remotion';
import { continueRender, delayRender } from 'remotion';

/**
 * 加载思源黑体
 *
 * 为什么必须显式加载：Remotion 是逐帧截图，字体没加载完就出帧，
 * 第一帧会是 fallback 字体，整片字体不统一。
 *
 * 用法：在 Root 组件的顶层调用一次即可（模块级只跑一次）。
 */
let started = false;
let handle: number | null = null;

const FACES: { file: string; weight: number; style: string }[] = [
  { file: 'fonts/NotoSansSC-Regular.otf', weight: 400, style: 'normal' },
  { file: 'fonts/NotoSansSC-Medium.otf', weight: 500, style: 'normal' },
  { file: 'fonts/NotoSansSC-Bold.otf', weight: 700, style: 'normal' },
  { file: 'fonts/NotoSansSC-Black.otf', weight: 900, style: 'normal' },
];

export const ensureFonts = (): void => {
  if (started) return;
  started = true;

  handle = delayRender('加载思源黑体');
  const faces = FACES.map(({ file, weight, style }) => {
    const face = new FontFace('Noto Sans SC', `url(${staticFile(file)})`, {
      weight: String(weight),
      style,
    });
    document.fonts.add(face);
    return face.load();
  });

  Promise.all(faces)
    .then(() => {
      if (handle !== null) continueRender(handle);
    })
    .catch((err) => {
      console.error('字体加载失败，会退回系统字体：', err);
      if (handle !== null) continueRender(handle);
    });
};
