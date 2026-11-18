import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { palette } from '../kit';

export type T109Props = { x: number; y: number; count?: number; color?: string };

/**
 * T109 · 点击波纹
 * 用途：垫在别的画面上——告诉观众"这里被点了"
 * 画面：目标点连续扩散两三圈波纹，纯叠加层，不带背景
 * 参考：remotion-templates 的 cursor-demos-click-ripple 思路
 */
export const T109ClickRipple: React.FC<T109Props> = ({ x, y, count = 3, color }) => {
  const frame = useCurrentFrame();
  const c = color ?? palette.accent;
  const cycle = 26;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const local = (frame - i * 7) % (cycle * count);
        const t = Math.max(0, Math.min(1, local / cycle));
        if (frame - i * 7 < 0) return null;
        const size = 26 + t * 150;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: '50%',
              border: `2px solid ${c}`,
              opacity: (1 - t) * 0.85,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: 14,
          height: 14,
          marginLeft: -7,
          marginTop: -7,
          borderRadius: '50%',
          background: c,
          boxShadow: `0 0 24px ${c}`,
        }}
      />
    </AbsoluteFill>
  );
};

export const T109_LABEL = '点击波纹';
export const T109_USE = ['overlay', 'click', 'hint'];
export const T109_DESC = '目标点连续扩散几圈波纹，纯叠加层，可盖在任意画面上';
