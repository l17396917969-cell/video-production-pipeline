import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, riseIn, sp, springIn, type } from '../kit';

export type T90Props = { value: number | string; unit?: string; caption: string; prefix?: string };

/**
 * T90 · 大数字公告
 * 用途：一个数字就是一句话——让它占满屏
 * 画面：数字从下方升起并轻微回弹，说明在下面一行
 */
export const T90BigNumberNotice: React.FC<T90Props> = ({ value, unit, caption, prefix }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 2, 26);
  const pC = springIn(frame, fps, 14, 20);
  const glow = 0.35 + 0.15 * Math.sin(frame / 18);

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: sp(2) }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at 50% 45%, rgba(99,91,255,${glow * 0.16}) 0%, rgba(0,0,0,0) 60%)` }}
      />
      <div
        style={{
          ...riseIn(p, 26),
          opacity: fade(p),
          fontFamily: font.sans,
          fontSize: type.huge,
          fontWeight: 740,
          letterSpacing: '-0.05em',
          color: palette.ink,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'baseline',
          gap: sp(1),
        }}
      >
        {prefix ? <span style={{ fontSize: type.m, color: palette.accentSoft }}>{prefix}</span> : null}
        {value}
        {unit ? <span style={{ fontSize: type.m, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{unit}</span> : null}
      </div>
      <div
        style={{
          opacity: fade(pC),
          fontFamily: font.sans,
          fontSize: type.s,
          color: 'rgba(255,255,255,0.55)',
          maxWidth: '62%',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

export const T90_LABEL = '大数字公告';
export const T90_USE = ['data', 'impact', 'statement'];
export const T90_DESC = '一个巨大数字占满画面，中心有呼吸光晕，下方一句说明';
