import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T13Props = {
  title?: string;
  items: { time: string; label: string; desc?: string }[];
  theme?: 'dark' | 'light';
};

/**
 * T13 · 时间线
 * 用途：讲版本演进、讲"三年前靠人，现在靠流水线"、讲一件事的来龙去脉
 * 画面：横线从左生长，节点依次点亮，文字逐个浮起
 */
export const T13Timeline: React.FC<T13Props> = ({ title, items, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pTitle = springIn(frame, fps, 0, 18);
  const pLine = springIn(frame, fps, 6, 40);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(12),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(8),
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

      <div style={{ position: 'relative', paddingTop: sp(4) }}>
        {/* 主轴 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: sp(4),
            height: 2,
            width: `${pLine * 100}%`,
            background: th.hairline,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {items.map((it, i) => {
            const p = springIn(frame, fps, 14 + i * 10, 18);
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: sp(1.5),
                  flex: 1,
                  paddingRight: sp(2),
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: i === items.length - 1 ? palette.accent : th.bg,
                    border: `2px solid ${i === items.length - 1 ? palette.accent : th.hairline}`,
                    opacity: fade(p),
                    transform: `scale(${0.6 + p * 0.4})`,
                  }}
                />
                <div
                  style={{
                    opacity: fade(p),
                    fontFamily: font.mono,
                    fontSize: type.micro,
                    color: i === items.length - 1 ? palette.accent : th.muted,
                    marginTop: sp(1),
                  }}
                >
                  {it.time}
                </div>
                <div
                  style={{
                    opacity: fade(p),
                    fontFamily: font.sans,
                    fontSize: type.s,
                    fontWeight: 580,
                    color: th.ink,
                    lineHeight: 1.3,
                  }}
                >
                  {it.label}
                </div>
                {it.desc ? (
                  <div
                    style={{
                      opacity: fade(p),
                      fontFamily: font.sans,
                      fontSize: type.small,
                      color: th.muted,
                      lineHeight: 1.45,
                    }}
                  >
                    {it.desc}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T13_LABEL = '时间线';
export const T13_USE = ['explain', 'story'];
export const T13_DESC = '横向时间轴从左生长，节点依次点亮，每个节点上方有时间、标题和一句说明';
