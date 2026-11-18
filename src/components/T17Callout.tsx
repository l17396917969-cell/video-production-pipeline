import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T17Props = {
  kind?: 'note' | 'warn' | 'ok';
  title: string;
  body?: string;
  theme?: 'dark' | 'light';
};

/**
 * T17 · 强调框
 * 用途：一句提醒、一个坑、一条结论——最需要被记住的那一句
 * 画面：色条从上落下 → 标题升起 → 正文淡入
 */
export const T17Callout: React.FC<T17Props> = ({ kind = 'note', title, body, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const color = kind === 'warn' ? palette.warn : kind === 'ok' ? palette.ok : palette.accent;
  const icon = kind === 'warn' ? '!' : kind === 'ok' ? '✓' : 'i';

  const pBar = springIn(frame, fps, 0, 20);
  const pTitle = springIn(frame, fps, 4, 20);
  const pBody = springIn(frame, fps, 12, 20);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(14),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: sp(3),
      }}
    >
      <div style={{ display: 'flex', gap: sp(3), alignItems: 'flex-start', maxWidth: sp(150) }}>
        <div
          style={{
            width: 5,
            height: `${pBar * 100}%`,
            minHeight: sp(20),
            background: color,
            borderRadius: 3,
            flexShrink: 0,
            transform: `scaleY(${pBar})`,
            transformOrigin: 'top',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp(2) }}>
          <div
            style={{
              ...riseIn(pTitle, 18),
              display: 'flex',
              alignItems: 'center',
              gap: sp(2),
            }}
          >
            <span
              style={{
                width: sp(5),
                height: sp(5),
                borderRadius: sp(2.5),
                background: color,
                color: palette.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: font.mono,
                fontSize: type.micro,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
            <span
              style={{
                fontFamily: font.sans,
                fontSize: type.m,
                fontWeight: 620,
                color: th.ink,
                lineHeight: 1.25,
              }}
            >
              {title}
            </span>
          </div>

          {body ? (
            <div
              style={{
                ...riseIn(pBody, 16),
                fontFamily: font.sans,
                fontSize: type.body,
                lineHeight: 1.6,
                color: th.muted,
              }}
            >
              {body}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T17_LABEL = '强调框';
export const T17_USE = ['explain', 'warning', 'conclusion'];
export const T17_DESC = '左侧竖色条加圆形图标，右边一行大字结论和一段说明';
