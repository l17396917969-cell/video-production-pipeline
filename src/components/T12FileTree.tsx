import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T12Props = {
  root: string;
  files: { path: string; depth?: number; type?: 'file' | 'dir' }[];
  highlight?: string;
  theme?: 'dark' | 'light';
};

/**
 * T12 · 文件树
 * 用途：讲项目结构、讲"代码变成一堆文件"、讲 worktree 隔离
 * 画面：文件树逐行出现，被 highlight 的那行用强调色点亮并轻微右移
 */
export const T12FileTree: React.FC<T12Props> = ({
  root,
  files,
  highlight,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: sp(130),
          border: `1px solid ${th.hairline}`,
          borderRadius: sp(2),
          padding: sp(4),
          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: sp(1),
        }}
      >
        <div
          style={{
            fontFamily: font.mono,
            fontSize: type.small,
            color: th.muted,
            marginBottom: sp(1),
          }}
        >
          {root}
        </div>

        {files.map((f, i) => {
          const p = springIn(frame, fps, 6 + i * 3, 14);
          const hit = highlight && f.path === highlight;
          const isDir = f.type === 'dir';
          const depth = f.depth ?? 1;
          return (
            <div
              key={`${f.path}-${i}`}
              style={{
                opacity: fade(p),
                transform: `translateX(${(1 - p) * 8 + (hit ? 6 : 0)}px)`,
                paddingLeft: depth * sp(3),
                fontFamily: font.mono,
                fontSize: type.small,
                lineHeight: 1.7,
                color: hit ? palette.accent : isDir ? th.ink : th.muted,
                fontWeight: hit ? 600 : 400,
                background: hit ? palette.accentDim : 'transparent',
                borderRadius: 4,
              }}
            >
              <span style={{ marginRight: sp(1), opacity: 0.55 }}>{isDir ? '▸' : '·'}</span>
              {f.path}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T12_LABEL = '文件树';
export const T12_USE = ['code', 'explain', 'agent'];
export const T12_DESC = '项目文件树逐行展开，指定的那一行用强调色点亮并右移';
