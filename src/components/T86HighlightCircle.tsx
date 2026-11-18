import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T86Props = { text: string; sub?: string; color?: string };

/**
 * T86 · 圈选
 * 用途：一句话里有一个词要被圈出来——手绘感比方框更有"人味"
 * 画面：椭圆手绘线沿路径描出来，轻微不规则
 */
export const T86HighlightCircle: React.FC<T86Props> = ({ text, sub, color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.6)));
  const c = color ?? palette.accent;

  return (
    <AbsoluteFill
      style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: sp(3) }}
    >
      <div style={{ position: 'relative', padding: `${sp(2)}px ${sp(5)}px` }}>
        <span style={{ fontFamily: font.sans, fontSize: type.xl, fontWeight: 700, color: palette.ink, letterSpacing: '-0.03em' }}>
          {text}
        </span>
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
        >
          <path
            d="M30 62 C 40 12, 360 6, 372 56 C 384 110, 44 116, 30 62"
            fill="none"
            stroke={c}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={1000}
            strokeDashoffset={1000 * (1 - t)}
            opacity={0.9}
          />
        </svg>
      </div>
      {sub ? (
        <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}>{sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T86_LABEL = '圈选';
export const T86_USE = ['emphasis', 'highlight', 'point'];
export const T86_DESC = '手绘感的椭圆沿路径描出来，比方框更有人味';
