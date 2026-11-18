import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fred } from '../kit';

/**
 * 视觉增强层
 *
 * "看起来贵"的三个基础要素，按投入产出比排：
 *   1. 噪点/颗粒  —— 打散纯色，画面立刻有"介质感"，不再是数字色块
 *   2. 辉光        —— 让光有来源，物体不再是被"贴"在背景上
 *   3. 渐变        —— 纯色是平的，渐变有方向，有方向就有空间
 *
 * 全部用 SVG 滤镜和 CSS，不引入任何依赖。
 */
export const Grain: React.FC<{ opacity?: number; scale?: number }> = ({ opacity = 0.055, scale = 1 }) => {
  const frame = useCurrentFrame();
  // 每 2 帧换一次种子，像胶片颗粒在跳，不是静态噪点
  const seed = Math.floor(frame / 2) % 8;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%" style={{ transform: `scale(${scale})` }}>
        <filter id={`grain-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** 辉光：给一个区域加柔和的发光，光要有来源 */
export const Glow: React.FC<{
  x: string;
  y: string;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 0.35 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
      opacity,
      filter: 'blur(40px)',
      pointerEvents: 'none',
    }}
  />
);

/** 舞台底：网格渐变，比纯色多一层空间感 */
export const StageGradient: React.FC<{ tone?: 'deep' | 'light' }> = ({ tone = 'deep' }) => {
  const base = tone === 'deep' ? fred.stageDeep : fred.stage;
  return (
    <AbsoluteFill style={{ background: base }}>
      <AbsoluteFill
        style={{
          background:
            tone === 'deep'
              ? 'radial-gradient(90% 70% at 22% 12%, rgba(133,84,232,0.16) 0%, transparent 58%), radial-gradient(80% 60% at 82% 88%, rgba(60,120,255,0.12) 0%, transparent 60%)'
              : 'radial-gradient(80% 60% at 18% 8%, rgba(133,84,232,0.09) 0%, transparent 55%), radial-gradient(70% 50% at 85% 92%, rgba(60,120,255,0.07) 0%, transparent 58%)',
        }}
      />
    </AbsoluteFill>
  );
};
