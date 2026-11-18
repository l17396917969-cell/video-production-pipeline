import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T15Props = {
  title?: string;
  tags: string[];
  theme?: 'dark' | 'light';
};

/**
 * T15 · 标签云
 * 用途：讲技术栈、讲关键词、讲"它支持这些"
 * 画面：胶囊标签错落浮起，奇数个用描边、加强调色的复用强调色底
 */
export const T15TagCloud: React.FC<T15Props> = ({ title, tags, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);
  const pTitle = springIn(frame, fps, 0, 18);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(14),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(6),
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp(2), maxWidth: sp(170) }}>
        {tags.map((t, i) => {
          const p = springIn(frame, fps, 6 + i * 5, 18);
          const accent = i % 3 === 0;
          return (
            <div
              key={t}
              style={{
                opacity: fade(p),
                transform: `translateY(${(1 - p) * 14}px) scale(${0.94 + p * 0.06})`,
                padding: `${sp(1.5)}px ${sp(3)}px`,
                borderRadius: 999,
                border: `1px solid ${accent ? palette.accent : th.hairline}`,
                background: accent ? palette.accentDim : 'transparent',
                color: accent ? palette.accent : th.ink,
                fontFamily: font.sans,
                fontSize: type.s,
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T15_LABEL = '标签云';
export const T15_USE = ['explain', 'list', 'github'];
export const T15_DESC = '一排排胶囊标签错落浮起，每三个有一个用强调色填充';
