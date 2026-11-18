import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, type } from '../kit';

export type T23Props = {
  items: { value: number; suffix?: string; label: string; accent?: boolean }[];
  title?: string;
  theme?: 'dark' | 'light';
};

/**
 * T23 · 数据墙
 * 用途：把一堆真实数字摆出来，让「体量」有参照系
 * 画面：四格依次升起，每格数字从 0 滚到目标值，底部一条细线跟着长满
 * 注意：数字必须是真的，不能编。
 */
export const T23DataWall: React.FC<T23Props> = ({ items, title, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dark = theme === 'dark';
  const ink = dark ? palette.ink : palette.bg;
  const muted = dark ? 'rgba(242,242,245,0.55)' : 'rgba(20,20,22,0.55)';
  const hairline = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';

  const pTitle = springIn(frame, fps, 0, 18);

  return (
    <AbsoluteFill
      style={{
        background: dark ? palette.bg : palette.paper,
        padding: `${sp(16)}px ${sp(12)}px ${sp(10)}px`,
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
            color: ink,
          }}
        >
          {title}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: sp(4), alignItems: 'flex-end' }}>
        {items.map((it, i) => {
          const p = springIn(frame, fps, 6 + i * 7, 26);
          // 数字滚动：6 帧后开始，用 40 帧走完
          const progress = Math.min(
            1,
            Math.max(0, interpolateLocal(frame, 6 + i * 7, 46 + i * 7)),
          );
          const shown = Math.round(it.value * E.out(progress));
          const num = shown.toLocaleString('en-US');

          return (
            <div
              key={it.label}
              style={{
                flex: 1,
                opacity: fade(p),
                transform: `translateY(${(1 - p) * 22}px)`,
                display: 'flex',
                flexDirection: 'column',
                gap: sp(1.5),
              }}
            >
              <div
                style={{
                  fontFamily: font.sans,
                  fontSize: type.l,
                  fontWeight: 680,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: it.accent ? palette.accent : ink,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {num}
                {it.suffix ? (
                  <span
                    style={{
                      fontSize: type.s,
                      fontWeight: 500,
                      marginLeft: 6,
                      color: it.accent ? palette.accent : muted,
                    }}
                  >
                    {it.suffix}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  height: 3,
                  width: `${progress * 100}%`,
                  background: it.accent ? palette.accent : hairline,
                  borderRadius: 2,
                }}
              />

              <div style={{ fontFamily: font.sans, fontSize: type.small, color: muted }}>
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 简单线性归一化，避免为一个小工具再引一个依赖 */
function interpolateLocal(frame: number, start: number, end: number) {
  return (frame - start) / Math.max(1, end - start);
}

export const T23_LABEL = '数据墙';
export const T23_USE = ['data', 'proof', 'explain'];
export const T23_DESC = '四格真实数字依次升起，数字从零滚到目标值，底部细线跟着长满；用来给「体量」一个参照系';
