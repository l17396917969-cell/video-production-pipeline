import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, type } from '../kit';

export type T28Props = { from?: number; to?: number; caption?: string };

/**
 * T28 · 倒数
 * 用途：制造压力——"还剩 3 天""从 100 降到 9"
 * 画面：巨大的数字从 from 滚到 to，每经过一个整数轻微跳一下
 */
export const T28Countdown: React.FC<T28Props> = ({ from = 10, to = 0, caption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const v = Math.round(from + (to - from) * E.inOut(t));
  const pulse = 1 + 0.04 * Math.abs(Math.sin(frame / 6));

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: type.huge,
          fontWeight: 720,
          color: palette.ink,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.05em',
          lineHeight: 1,
          transform: `scale(${pulse})`,
        }}
      >
        {v}
      </div>
      {caption ? (
        <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.55)' }}>
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T28_LABEL = '倒数';
export const T28_USE = ['data', 'pressure', 'opening'];
export const T28_DESC = '巨大数字从 A 滚到 B，带轻微脉动，可配一行说明';
