import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T16Props = {
  title?: string;
  layers: { label: string; desc?: string }[];
  theme?: 'dark' | 'light';
};

/**
 * T16 · 分层
 * 用途：讲架构分层、讲"底下是什么上面是什么"、讲企业本体论的几层
 * 画面：从最底层开始一层层往上堆，每层升起后上一层才出现
 */
export const T16LayerStack: React.FC<T16Props> = ({ title, layers, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);
  const pTitle = springIn(frame, fps, 0, 18);

  // 从底部开始铺，所以倒序渲染
  const reversed = [...layers].reverse();

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(12),
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: sp(1.5),
          width: '100%',
          maxWidth: sp(150),
          alignSelf: 'center',
        }}
      >
        {reversed.map((l, i) => {
          const p = springIn(frame, fps, 8 + i * 9, 20);
          const top = i === reversed.length - 1;
          // 底层最宽、顶层最窄，堆得稳
          const w = Math.min(100, 76 + i * 8);
          return (
            <div
              key={l.label}
              style={{
                opacity: fade(p),
                transform: `translateY(${(1 - p) * 20}px)`,
                width: `${w}%`,
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: `${sp(2)}px ${sp(3)}px`,
                borderRadius: sp(2),
                border: `1px solid ${top ? palette.accent : th.hairline}`,
                background: top
                  ? palette.accentDim
                  : theme === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'baseline',
                gap: sp(2),
              }}
            >
              <div
                style={{
                  fontFamily: font.sans,
                  fontSize: type.s,
                  fontWeight: 580,
                  color: top ? palette.accent : th.ink,
                }}
              >
                {l.label}
              </div>
              {l.desc ? (
                <div style={{ fontFamily: font.sans, fontSize: type.small, color: th.muted }}>
                  {l.desc}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T16_LABEL = '分层';
export const T16_USE = ['architecture', 'explain', 'ontology'];
export const T16_DESC = '从底层开始一层层往上堆叠的长条，宽度逐层收窄，最顶层用强调色';
