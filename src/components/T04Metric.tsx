import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T04Props = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  theme?: 'dark' | 'light';
};

/**
 * T04 · 大数字
 * 用途：涨了多少、省了多少、跑了多久、规模数字
 * 画面：数字从 0 滚到目标值，标签淡入，底部细线生长
 */
export const T04Metric: React.FC<T04Props> = ({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const p = springIn(frame, fps, 0, 18);
  const pLine = springIn(frame, fps, 18, 30);
  const count = interpolate(frame, [6, 52], [0, value], {
    extrapolateRight: 'clamp',
    easing: E.out,
  });
  const shown = count.toFixed(decimals);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(16),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: sp(2),
      }}
    >
      <div
        style={{
          ...riseIn(p, 30),
          fontFamily: font.sans,
          fontSize: type.huge,
          lineHeight: 1,
          fontWeight: 640,
          letterSpacing: '-0.04em',
          color: th.ink,
          display: 'flex',
          alignItems: 'baseline',
          gap: sp(1),
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {prefix ? (
          <span style={{ fontSize: type.l, color: th.muted, fontWeight: 400 }}>{prefix}</span>
        ) : null}
        <span>{shown}</span>
        {suffix ? (
          <span style={{ fontSize: type.l, color: palette.accent, fontWeight: 500 }}>{suffix}</span>
        ) : null}
      </div>

      <div
        style={{
          ...riseIn(p, 18),
          fontFamily: font.sans,
          fontSize: type.m,
          color: th.muted,
          marginTop: sp(1),
        }}
      >
        {label}
      </div>

      <div
        style={{
          width: `${pLine * 100}%`,
          maxWidth: sp(80),
          height: 3,
          background: palette.accent,
          marginTop: sp(4),
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

export const T04_LABEL = '大数字';
export const T04_USE = ['data', 'explain'];
export const T04_DESC = '超大数字从零滚动到目标值，下方标签与强调线跟进';
