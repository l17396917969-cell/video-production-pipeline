import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T06Props = {
  title?: string;
  items: { head: string; body?: string }[];
  theme?: 'dark' | 'light';
};

/**
 * T06 · 要点卡片
 * 用途：三个要点、能力清单、注意事项
 * 画面：标题落下 → 卡片逐个升起，卡片之间错峰 7 帧
 */
export const T06Cards: React.FC<T06Props> = ({ title, items, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);
  const pTitle = springIn(frame, fps, 0, 18);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(11),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(6),
      }}
    >
      {title ? (
        <div
          style={{
            opacity: pTitle,
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 600,
            color: th.ink,
          }}
        >
          {title}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: sp(3) }}>
        {items.map((it, i) => {
          const p = springIn(frame, fps, 8 + i * 7, 20);
          return (
            <div
              key={i}
              style={{
                ...riseIn(p, 28),
                flex: 1,
                border: `1px solid ${th.hairline}`,
                background: palette.glass,
                borderRadius: sp(3),
                padding: sp(4),
                display: 'flex',
                flexDirection: 'column',
                gap: sp(2),
                minHeight: sp(30),
              }}
            >
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: type.micro,
                  color: palette.accent,
                  letterSpacing: '0.1em',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div
                style={{
                  fontFamily: font.sans,
                  fontSize: type.s,
                  fontWeight: 580,
                  color: th.ink,
                  lineHeight: 1.3,
                }}
              >
                {it.head}
              </div>
              {it.body ? (
                <div
                  style={{
                    fontFamily: font.sans,
                    fontSize: type.small,
                    color: th.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {it.body}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T06_LABEL = '要点卡片';
export const T06_USE = ['explain', 'list'];
export const T06_DESC = '两到四张描边卡片并排，逐张升起，每张带编号、标题和说明';
