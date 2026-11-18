import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, type } from '../kit';

export type T103Props = { label?: string; color?: string };

/**
 * T103 · 亮度扫过
 * 用途：最"高级"的转场——一条亮带扫过去，画面就换了
 * 画面：一条倾斜的发光带从左扫到右，扫过处留一道余辉
 * 参考：remotion-templates 的 transition-luma-sweep 思路
 */
export const T103LumaSweep: React.FC<T103Props> = ({ label, color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = E.inOut(Math.min(1, frame / Math.max(1, durationInFrames * 0.8)));
  const c = color ?? palette.accentSoft;
  const x = -40 + t * 140;

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${x}%) skewX(-14deg)`,
          width: '44%',
          background: `linear-gradient(90deg, transparent 0%, ${c}22 35%, ${c}cc 50%, ${c}22 65%, transparent 100%)`,
          filter: 'blur(1px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${x - 6}%) skewX(-14deg)`,
          width: '10%',
          background: `linear-gradient(90deg, transparent, ${c}55, transparent)`,
        }}
      />
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: 48,
            bottom: 44,
            fontFamily: font.mono,
            fontSize: type.micro,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.42)',
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T103_LABEL = '亮度扫过';
export const T103_USE = ['transition', 'premium', 'wipe'];
export const T103_DESC = '一条倾斜发光带从左扫到右，扫过处一道余辉，最"高级"的转场';
