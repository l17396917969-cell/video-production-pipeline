import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T10Props = {
  file: string;
  removed?: string[];
  added: string[];
  theme?: 'dark' | 'light';
};

/**
 * T10 · 代码改动
 * 用途：讲一个 PR 改了什么、agent 动了哪几行
 * 画面：代码窗口落下 → 红色删除行逐条出现 → 绿色新增行逐条出现
 */
export const T10CodeDiff: React.FC<T10Props> = ({
  file,
  removed = [],
  added,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pWin = springIn(frame, fps, 0, 20);

  const row = (text: string, kind: 'add' | 'del', i: number, offset: number) => {
    const p = springIn(frame, fps, offset + i * 4, 12);
    return (
      <div
        key={`${kind}-${i}`}
        style={{
          opacity: fade(p),
          transform: `translateX(${(1 - p) * 8}px)`,
          display: 'flex',
          gap: sp(2),
          padding: `${sp(0.75)}px ${sp(2)}px`,
          background: kind === 'add' ? 'rgba(61,220,151,0.10)' : 'rgba(255,90,90,0.10)',
          borderLeft: `3px solid ${kind === 'add' ? palette.ok : palette.danger}`,
          color: kind === 'add' ? palette.ok : palette.dangerSoft,
          fontFamily: font.mono,
          fontSize: type.small,
          lineHeight: 1.5,
          whiteSpace: 'pre',
        }}
      >
        <span style={{ opacity: 0.6, width: 18, flexShrink: 0 }}>{kind === 'add' ? '+' : '-'}</span>
        <span>{text}</span>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(10),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity: fade(pWin),
          transform: `translateY(${(1 - pWin) * 28}px)`,
          width: '100%',
          maxWidth: sp(180),
          border: `1px solid ${th.hairline}`,
          borderRadius: sp(2),
          overflow: 'hidden',
          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            padding: `${sp(2)}px ${sp(3)}px`,
            borderBottom: `1px solid ${th.hairline}`,
            fontFamily: font.mono,
            fontSize: type.micro,
            color: th.muted,
          }}
        >
          {file}
        </div>

        <div style={{ padding: `${sp(2)}px 0`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {removed.map((r, i) => row(r, 'del', i, 8))}
          {added.map((a, i) => row(a, 'add', i, 8 + removed.length * 4 + 4))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T10_LABEL = '代码改动';
export const T10_USE = ['code', 'github', 'explain'];
export const T10_DESC = '代码窗口里红色删除行和绿色新增行逐条出现，像看一次 PR 的 diff';
