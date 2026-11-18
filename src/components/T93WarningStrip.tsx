import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T93Props = { text: string; sub?: string; level?: 'warn' | 'danger' };

/**
 * T93 · 警示条
 * 用途：一句警告——比普通卡片更有压迫感
 * 画面：整条从左滑入，左侧有斜纹警示块，文字闪一下
 */
export const T93WarningStrip: React.FC<T93Props> = ({ text, sub, level = 'danger' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 0, 20);
  const color = level === 'danger' ? palette.danger : palette.warn;
  const pulse = 0.85 + 0.15 * Math.sin(frame / 8);

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: sp(2),
      }}
    >
      <div
        style={{
          opacity: fade(p),
          transform: `translateX(${(1 - p) * -40}px)`,
          display: 'flex',
          alignItems: 'stretch',
          width: '78%',
          borderRadius: 12,
          overflow: 'hidden',
          border: `1.5px solid ${color}`,
          background: `${color}14`,
        }}
      >
        <div
          style={{
            width: sp(5),
            background: `repeating-linear-gradient(45deg, ${color} 0 8px, transparent 8px 16px)`,
            opacity: pulse,
          }}
        />
        <div style={{ padding: `${sp(2)}px ${sp(2.5)}px`, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: font.sans, fontSize: type.s, fontWeight: 700, color }}>{text}</span>
          {sub ? (
            <span style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              {sub}
            </span>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T93_LABEL = '警示条';
export const T93_USE = ['warning', 'pitfall', 'risk'];
export const T93_DESC = '整条警示带从左滑入，斜纹块脉动，text 用警示色';
