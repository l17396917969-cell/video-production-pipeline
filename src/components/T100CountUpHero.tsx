import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T100Props = { from?: number; to: number; prefix?: string; suffix?: string; caption?: string };

/**
 * T100 · 数字滚动英雄
 * 用途：一个数字从旧值涨到新值，全屏只有它
 * 画面：数字持续滚动，每跳动一次轻微放大，底部一行小字
 */
export const T100CountUpHero: React.FC<T100Props> = ({ from = 0, to, prefix, suffix, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.8)));
  const v = Math.round(from + (to - from) * t);
  const bump = t < 1 ? 1 + 0.02 * Math.abs(Math.sin(frame / 4)) : 1;

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
          display: 'flex',
          alignItems: 'baseline',
          gap: sp(1),
          transform: `scale(${bump})`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {prefix ? (
          <span style={{ fontFamily: font.sans, fontSize: type.m, fontWeight: 600, color: palette.accentSoft }}>{prefix}</span>
        ) : null}
        <span style={{ fontFamily: font.sans, fontSize: type.huge, fontWeight: 760, color: palette.ink, letterSpacing: '-0.05em', lineHeight: 1 }}>
          {v.toLocaleString('en-US')}
        </span>
        {suffix ? (
          <span style={{ fontFamily: font.sans, fontSize: type.m, fontWeight: 600, color: palette.accentSoft }}>{suffix}</span>
        ) : null}
      </div>
      {caption ? (
        <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}>{caption}</div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T100_LABEL = '数字滚动英雄';
export const T100_USE = ['data', 'impact', 'count'];
export const T100_DESC = '全屏只有一个数字，从旧值滚到新值，每跳一次轻微放大';
