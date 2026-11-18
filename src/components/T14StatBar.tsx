import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T14Props = {
  title?: string;
  rows: { label: string; value: number; display?: string }[];
  theme?: 'dark' | 'light';
};

/**
 * T14 · 指标条
 * 用途：几个数字横向比一比（谁更快、谁更强、成本差多少）
 * 画面：每行标签先出，条形从 0 长到目标比例，数字跟着滚
 */
export const T14StatBar: React.FC<T14Props> = ({ title, rows, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);
  const pTitle = springIn(frame, fps, 0, 18);
  const max = Math.max(...rows.map((r) => r.value), 1) * 1.25;

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(13),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(5),
      }}
    >
      {title ? (
        <div
          style={{
            opacity: fade(pTitle),
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 600,
            color: th.ink,
          }}
        >
          {title}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: sp(3) }}>
        {rows.map((r, i) => {
          const p = springIn(frame, fps, 8 + i * 8, 24);
          const ratio = Math.min(1, r.value / max) * p;
          const shown = Math.round(r.value * p);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: sp(1) }}>
              <div
                style={{
                  opacity: fade(p),
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: font.sans,
                  fontSize: type.small,
                  color: th.muted,
                }}
              >
                <span>{r.label}</span>
                <span style={{ color: th.ink, fontFamily: font.mono }}>
                  {r.display ?? shown}
                </span>
              </div>
              <div
                style={{
                  height: 14,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                  borderRadius: 7,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${ratio * 100}%`,
                    height: '100%',
                    background: i === 0 ? palette.accent : palette.ok,
                    borderRadius: 7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T14_LABEL = '指标条';
export const T14_USE = ['data', 'contrast', 'explain'];
export const T14_DESC = '多行横向条形图，条形从零生长到目标长度，右侧数字同步滚动';
