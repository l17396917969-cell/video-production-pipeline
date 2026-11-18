import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

/**
 * 组件基座：把「标题 + 内容 + 入场」这套重复逻辑收在一处。
 * 新组件优先用它，保证 100+ 个组件在间距、节奏、配色上不散。
 */

export const Panel: React.FC<{
  title?: string;
  kicker?: string;
  children: React.ReactNode;
  gap?: number;
  align?: 'start' | 'center';
  pad?: number;
}> = ({ title, kicker, children, gap = 4, align = 'start', pad = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 2, 20);

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        padding: sp(pad),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : 'stretch',
        gap: sp(gap),
      }}
    >
      {kicker ? (
        <div
          style={{
            opacity: fade(p),
            fontFamily: font.mono,
            fontSize: type.micro,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: palette.accentSoft,
          }}
        >
          {kicker}
        </div>
      ) : null}
      {title ? (
        <div
          style={{
            opacity: fade(p),
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 620,
            color: palette.ink,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  accent?: boolean;
  style?: React.CSSProperties;
}> = ({ children, accent, style }) => (
  <div
    style={{
      background: accent ? 'rgba(99,91,255,0.12)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${accent ? 'rgba(99,91,255,0.5)' : 'rgba(255,255,255,0.10)'}`,
      borderRadius: sp(1.75),
      padding: sp(3),
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children,
  color,
  size,
}) => (
  <div
    style={{
      fontFamily: font.sans,
      fontSize: size ?? type.small,
      color: color ?? 'rgba(255,255,255,0.55)',
      lineHeight: 1.4,
    }}
  >
    {children}
  </div>
);

export const Big: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <div
    style={{
      fontFamily: font.sans,
      fontSize: type.l,
      fontWeight: 680,
      letterSpacing: '-0.03em',
      color: color ?? palette.ink,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);
