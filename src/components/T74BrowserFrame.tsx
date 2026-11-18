import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T74Props = { src: string; url: string; title?: string };

/**
 * T74 · 浏览器框
 * 用途：把一张网页截图装进真实浏览器里看，而不是浮在空背景上
 * 画面：窗口落下，地址栏显示真实 URL，截图在里面轻微上移
 */
export const T74BrowserFrame: React.FC<T74Props> = ({ src, url, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 0, 22);
  const drift = (frame / fps) * 6;

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(7), justifyContent: 'center' }}>
      <div
        style={{
          opacity: fade(p),
          transform: `translateY(${(1 - p) * 24}px)`,
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          background: palette.panelDark,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sp(1.5),
            padding: `${sp(1.2)}px ${sp(2)}px`,
            background: palette.windowBar,
          }}
        >
          {palette.windowDot.map((c, i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
          ))}
          <div
            style={{
              flex: 1,
              marginLeft: sp(1.5),
              padding: `3px ${sp(1.4)}px`,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 6,
              fontFamily: font.mono,
              fontSize: type.micro,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {url}
          </div>
        </div>
        <div style={{ height: sp(56), overflow: 'hidden' }}>
          <Img
            src={staticFile(src)}
            style={{ width: '100%', display: 'block', transform: `translateY(${-drift}px)` }}
          />
        </div>
      </div>
      {title ? (
        <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)', marginTop: sp(2) }}>
          {title}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T74_LABEL = '浏览器框';
export const T74_USE = ['screenshot', 'web', 'context'];
export const T74_DESC = '真实浏览器窗口，地址栏显示 URL，截图在里面缓慢上移';
