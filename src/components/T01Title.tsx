import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T01Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
};

/**
 * T01 · 开场标题
 * 用途：开场、章节头、单一结论
 * 画面：上方小字标签升起 → 巨大标题升起 → 副标题淡入
 */
export const T01Title: React.FC<T01Props> = ({
  kicker,
  title,
  subtitle,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pKicker = springIn(frame, fps, 0, 18);
  const pTitle = springIn(frame, fps, 8, 26);
  const pSub = springIn(frame, fps, 20, 24);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: `0 ${sp(17)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {kicker ? (
        <div
          style={{
            ...riseIn(pKicker, 16),
            fontFamily: font.sans,
            fontSize: type.small,
            letterSpacing: '0.18em',
            color: palette.accent,
            fontWeight: 500,
            marginBottom: sp(3),
          }}
        >
          {kicker}
        </div>
      ) : null}

      <div
        style={{
          ...riseIn(pTitle, 36),
          fontFamily: font.sans,
          fontSize: type.xl,
          lineHeight: 1.14,
          fontWeight: 620,
          color: th.ink,
          letterSpacing: '-0.02em',
          maxWidth: sp(170),
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            ...riseIn(pSub, 24),
            fontFamily: font.sans,
            fontSize: type.body,
            lineHeight: 1.5,
            color: th.muted,
            marginTop: sp(4),
            maxWidth: sp(140),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T01_LABEL = '开场标题';
export const T01_USE = ['opening', 'handoff'];
export const T01_DESC = '小字标签 + 巨大标题 + 副标题，逐层升起入场';
