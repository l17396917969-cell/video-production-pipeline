import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T07Props = {
  text: string;
  author?: string;
  theme?: 'dark' | 'light';
};

/**
 * T07 · 金句
 * 用途：一句观点、一个结论、一句引用
 * 画面：左侧竖线生长 → 大字升起 → 落款淡入
 */
export const T07Quote: React.FC<T07Props> = ({ text, author, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pBar = springIn(frame, fps, 0, 26);
  const pText = springIn(frame, fps, 6, 26);
  const pAuthor = springIn(frame, fps, 22, 20);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: `0 ${sp(22)}px`,
        display: 'flex',
        alignItems: 'center',
        gap: sp(6),
      }}
    >
      <div
        style={{
          width: 5,
          height: `${pBar * 100}%`,
          maxHeight: sp(56),
          background: palette.accent,
          borderRadius: 3,
          flexShrink: 0,
          transformOrigin: 'top center',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: sp(3) }}>
        <div
          style={{
            ...riseIn(pText, 30),
            fontFamily: font.sans,
            fontSize: type.l,
            lineHeight: 1.35,
            fontWeight: 560,
            color: th.ink,
            letterSpacing: '-0.01em',
            maxWidth: sp(150),
          }}
        >
          {text}
        </div>

        {author ? (
          <div
            style={{
              opacity: fade(pAuthor),
              fontFamily: font.sans,
              fontSize: type.small,
              color: th.muted,
              letterSpacing: '0.06em',
            }}
          >
            — {author}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const T07_LABEL = '金句';
export const T07_USE = ['opening', 'explain'];
export const T07_DESC = '左侧强调竖线生长，右侧大字观点升起，底部落款淡入';
