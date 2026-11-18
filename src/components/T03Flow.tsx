import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T03Props = {
  steps: { title: string; sub?: string }[];
  title?: string;
  theme?: 'dark' | 'light';
};

/**
 * T03 · 横向流程
 * 用途：步骤、管线、因果链、架构分层
 * 画面：步骤框从左到右逐个落下，中间箭头随后生长
 */
export const T03Flow: React.FC<T03Props> = ({ steps, title, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);
  const pTitle = springIn(frame, fps, 0, 18);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(12),
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

      <div style={{ display: 'flex', alignItems: 'center', gap: sp(2) }}>
        {steps.map((s, i) => {
          const p = springIn(frame, fps, 10 + i * 9, 20);
          const pa = springIn(frame, fps, 10 + i * 9 + 5, 14);
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <div
                  style={{
                    opacity: fade(pa),
                    transform: `scaleX(${pa})`,
                    transformOrigin: 'left center',
                    width: sp(4),
                    height: 2,
                    background: th.hairline,
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <div
                style={{
                  opacity: fade(p),
                  transform: `translateY(${(1 - p) * 24}px)`,
                  flex: 1,
                  border: `1px solid ${i === 0 ? palette.accent : th.hairline}`,
                  background: i === 0 ? palette.accentDim : 'transparent',
                  borderRadius: sp(2),
                  padding: `${sp(3)}px ${sp(3)}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: sp(1),
                  minHeight: sp(18),
                }}
              >
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: type.micro,
                    color: i === 0 ? palette.accent : th.muted,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  style={{
                    fontFamily: font.sans,
                    fontSize: type.s,
                    fontWeight: 580,
                    color: th.ink,
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </div>
                {s.sub ? (
                  <div
                    style={{
                      fontFamily: font.sans,
                      fontSize: type.small,
                      color: th.muted,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.sub}
                  </div>
                ) : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T03_LABEL = '横向流程';
export const T03_USE = ['process', 'explain'];
export const T03_DESC = '多个步骤框从左到右依次落下，框间连线随后生长，首步高亮';
