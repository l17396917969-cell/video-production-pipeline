import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T97Props = { text: string; sub?: string };

/**
 * T97 · 竖排大字
 * 用途：换一种版式打破横向疲劳——竖排有海报感
 * 画面：一个字一行从右往左依次落下
 */
export const T97VerticalText: React.FC<T97Props> = ({ text, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = [...text];

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(2),
        padding: sp(8),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {chars.map((c, i) => {
          const p = springIn(frame, fps, i * 4, 16);
          return (
            <span
              key={i}
              style={{
                opacity: fade(p),
                transform: `translateY(${(1 - p) * -20}px)`,
                fontFamily: font.sans,
                fontSize: type.xl,
                fontWeight: 720,
                color: palette.ink,
                lineHeight: 1.05,
                textAlign: 'center',
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      {sub ? (
        <div
          style={{
            opacity: fade(springIn(frame, fps, chars.length * 4 + 4, 18)),
            fontFamily: font.sans,
            fontSize: type.body,
            color: 'rgba(255,255,255,0.5)',
            writingMode: 'vertical-rl',
            letterSpacing: '0.1em',
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T97_LABEL = '竖排大字';
export const T97_USE = ['title', 'poster', 'variety'];
export const T97_DESC = '一个字一列竖排，从右往左落下，打破横向版式疲劳';
