import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type , fred } from '../kit';

export type T99Props = { line1: string; line2?: string; handle?: string };

/**
 * T99 · 最终帧
 * 用途：全片最后一帧——留给截图传播
 * 画面：一句话分两行，第二行用强调色，底部账号名
 */
export const T99FinalFrame: React.FC<T99Props> = ({ line1, line2, handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p1 = springIn(frame, fps, 0, 22);
  const p2 = springIn(frame, fps, 8, 22);
  const p3 = springIn(frame, fps, 18, 18);

  return (
    <AbsoluteFill
      style={{
        background: fred.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: sp(1.5),
      }}
    >
      <div
        style={{
          ...riseIn(p1, 16),
          opacity: fade(p1),
          fontFamily: font.sans,
          fontSize: type.l,
          fontWeight: 720,
          color: fred.gray,
          letterSpacing: '-0.03em',
          textAlign: 'center',
        }}
      >
        {line1}
      </div>
      {line2 ? (
        <div
          style={{
            ...riseIn(p2, 16),
            opacity: fade(p2),
            fontFamily: font.sans,
            fontSize: type.l,
            fontWeight: 720,
            color: palette.accentSoft,
            letterSpacing: '-0.03em',
            textAlign: 'center',
          }}
        >
          {line2}
        </div>
      ) : null}
      {handle ? (
        <div
          style={{
            opacity: fade(p3),
            marginTop: sp(4),
            fontFamily: font.mono,
            fontSize: type.small,
            color: 'rgba(255,255,255,0.38)',
            letterSpacing: '0.12em',
          }}
        >
          {handle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T99_LABEL = '最终帧';
export const T99_USE = ['ending', 'final', 'poster'];
export const T99_DESC = '两行结论 + 账号名，专门留给截图传播的最后一帧';
