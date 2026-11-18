import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E , media } from '../kit';

export type T21Props = {
  src: string;
  /** 起点区域，百分比（0-100） */
  from: { x: number; y: number; w: number; h: number };
  /** 终点区域，百分比 */
  to: { x: number; y: number; w: number; h: number };
  /** 推进发生的区间占总长的比例 */
  window?: [number, number];
};

/**
 * T21 · 推镜
 * 用途：从整屏平滑推到某个局部——"看这里"，比任何箭头都直观
 * 画面：镜头从 from 区域推到 to 区域，目标点始终落在画面正中，纯运镜不叠字
 *
 * 实现：把图放在一个放大后的容器里，通过 left/top 把目标点平移回画面中心。
 * 不用 transform-origin + scale，因为在目标点偏离中心时它会跑偏。
 */
export const T21PushIn: React.FC<T21Props> = ({ src, from, to, window = [0, 1] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const [a, b] = window;
  const t = Math.min(1, Math.max(0, (frame / Math.max(1, durationInFrames - 1) - a) / (b - a)));
  const e = E.inOut(t);

  const lerp = (u: number, v: number) => u + (v - u) * e;
  const cx = lerp(from.x + from.w / 2, to.x + to.w / 2);
  const cy = lerp(from.y + from.h / 2, to.y + to.h / 2);
  const w = lerp(from.w, to.w);

  const scale = 100 / Math.max(0.1, w);
  const imgW = 1920 * scale;
  const imgH = 1080 * scale;
  const left = -(cx / 100) * imgW + 1920 / 2;
  const top = -(cy / 100) * imgH + 1080 / 2;

  return (
    <AbsoluteFill style={{ background: media.black, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left, top, width: imgW, height: imgH }}>
        <Img
          src={staticFile(src)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const T21_LABEL = '推镜';
export const T21_USE = ['shots', 'recording'];
export const T21_DESC = '镜头从整屏平滑推到指定局部区域，目标点始终居中，纯运镜不叠加文字';
