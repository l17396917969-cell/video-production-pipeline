import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T62Props = { title?: string; lines: string[]; lang?: string };

/**
 * T62 · 代码窗口
 * 用途：给人看一段代码长什么样（不是 diff，不强调改动）
 * 画面：带圆点标题栏的窗口落下，代码行从上往下逐行淡入
 */
export const T62CodeWindow: React.FC<T62Props> = ({ title = 'index.ts', lines, lang }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pWin = springIn(frame, fps, 0, 20);

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(8), justifyContent: 'center' }}>
      <div
        style={{
          opacity: fade(pWin),
          transform: `translateY(${(1 - pWin) * 22}px)`,
          background: palette.panelDark,
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: sp(1.5),
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sp(1),
            padding: `${sp(1.5)}px ${sp(2.5)}px`,
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {palette.windowDot.map((c, i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
          ))}
          <span style={{ marginLeft: sp(2), fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.45)' }}>
            {title}
          </span>
          {lang ? (
            <span style={{ marginLeft: 'auto', fontFamily: font.mono, fontSize: type.micro, color: palette.accentSoft }}>
              {lang}
            </span>
          ) : null}
        </div>
        <div style={{ padding: `${sp(2.5)}px ${sp(3)}px` }}>
          {lines.map((l, i) => {
            const p = Math.min(1, Math.max(0, (frame - (6 + i * 3)) / 12));
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: sp(2.5),
                  fontFamily: font.mono,
                  fontSize: type.small,
                  lineHeight: 1.75,
                  opacity: fade(p),
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.22)', width: sp(3), textAlign: 'right', userSelect: 'none' }}>
                  {i + 1}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.82)', whiteSpace: 'pre' }}>{l}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T62_LABEL = '代码窗口';
export const T62_USE = ['code', 'explain', 'show'];
export const T62_DESC = '带圆点标题栏的代码窗口，代码行逐行淡入，只展示不强调改动';
