import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T63Props = { lines: string[]; highlight: number[]; title?: string };

/**
 * T63 · 代码高亮
 * 用途：一段代码里只有两三行是关键，把它们点亮
 * 画面：整段代码半透明，指定行背景块从左滑入并变亮
 */
export const T63CodeHighlight: React.FC<T63Props> = ({ lines, highlight, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(10), justifyContent: 'center' }}>
      <div style={{ position: 'relative' }}>
        {title ? (
          <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.35)', marginBottom: sp(2) }}>
            {title}
          </div>
        ) : null}
        {lines.map((l, i) => {
          const isHl = highlight.includes(i);
          const p = springIn(frame, fps, 6 + i * 3, 16);
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                padding: `${sp(0.6)}px ${sp(2)}px`,
                fontFamily: font.mono,
                fontSize: type.body,
                lineHeight: 1.7,
                color: isHl ? palette.ink : 'rgba(255,255,255,0.28)',
                whiteSpace: 'pre',
              }}
            >
              {isHl ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${p * 100}%`,
                    background: 'rgba(99,91,255,0.18)',
                    borderLeft: `3px solid ${palette.accent}`,
                    borderRadius: 4,
                  }}
                />
              ) : null}
              <span style={{ position: 'relative' }}>{l}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T63_LABEL = '代码高亮';
export const T63_USE = ['code', 'emphasis', 'explain'];
export const T63_DESC = '整段代码压暗，指定行带强调块从左滑入并提亮';
