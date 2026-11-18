import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T11Props = {
  messages: { role: 'user' | 'ai'; text: string }[];
  theme?: 'dark' | 'light';
};

/**
 * T11 · 对话气泡
 * 用途：讲 Agent、讲提示词、讲"人怎么说 AI 怎么回"
 * 画面：气泡一条条落下，用户靠左、AI 靠右，AI 那条带强调色描边
 */
export const T11ChatBubble: React.FC<T11Props> = ({ messages, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(12),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(3),
      }}
    >
      {messages.map((m, i) => {
        const p = springIn(frame, fps, i * 12, 20);
        const isUser = m.role === 'user';
        return (
          <div
            key={i}
            style={{
              opacity: fade(p),
              transform: `translateY(${(1 - p) * 18}px)`,
              alignSelf: isUser ? 'flex-start' : 'flex-end',
              maxWidth: sp(110),
              padding: `${sp(2.5)}px ${sp(3)}px`,
              borderRadius: sp(2.5),
              border: `1px solid ${isUser ? th.hairline : palette.accent}`,
              background: isUser
                ? theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.04)'
                : palette.accentDim,
              fontFamily: font.sans,
              fontSize: type.s,
              lineHeight: 1.5,
              color: th.ink,
            }}
          >
            <div
              style={{
                fontFamily: font.mono,
                fontSize: type.micro,
                color: isUser ? th.muted : palette.accent,
                marginBottom: sp(1),
                letterSpacing: '0.08em',
              }}
            >
              {isUser ? 'YOU' : 'AGENT'}
            </div>
            {m.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const T11_LABEL = '对话气泡';
export const T11_USE = ['agent', 'explain'];
export const T11_DESC = '用户和 Agent 的气泡一左一右逐条出现，Agent 那条用强调色描边';
