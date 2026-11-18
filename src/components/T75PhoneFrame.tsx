import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, palette, sp, springIn } from '../kit';

export type T75Props = { src: string; caption?: string; rotate?: number };

/**
 * T75 · 手机框
 * 用途：讲移动端、讲"手机上也能接着看"
 * 画面：手机从下方升起并轻微倾斜，屏幕内容随帧微微平移
 */
export const T75PhoneFrame: React.FC<T75Props> = ({ src, caption, rotate = -4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 0, 24);
  const drift = Math.sin(frame / 30) * 6;

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center', gap: sp(3) }}>
      <div
        style={{
          opacity: fade(p),
          transform: `translateY(${(1 - p) * 60}px) rotate(${rotate}deg)`,
          width: sp(38),
          height: sp(78),
          borderRadius: sp(5),
          background: palette.screen,
          border: `8px solid ${palette.bezel}`,
          boxShadow: '0 40px 90px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: sp(12),
            height: 18,
            background: palette.screen,
            borderRadius: 10,
            zIndex: 2,
          }}
        />
        <Img src={staticFile(src)} style={{ width: '100%', transform: `translateY(${drift}px)` }} />
      </div>
      {caption ? (
        <div style={{ opacity: fade(p), fontFamily: palette ? undefined : undefined }} />
      ) : null}
    </AbsoluteFill>
  );
};

export const T75_LABEL = '手机框';
export const T75_USE = ['mobile', 'device', 'app'];
export const T75_DESC = '带刘海和边框的手机，屏幕内容轻微浮动，可带倾斜角';
