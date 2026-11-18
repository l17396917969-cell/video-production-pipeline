import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, type } from '../kit';

export type T102Props = { caption?: string; color?: string; reverse?: boolean };

/**
 * T102 · 穿门推镜
 * 用途：从"一个点"推进到"整屏"——适合进入某个界面、进入细节
 * 画面：一个圆从中心放大到铺满，边缘持续发光，整屏被吞掉
 * 参考：remotion-templates 的 transition-zoom-through 思路
 */
export const T102ZoomThrough: React.FC<T102Props> = ({ caption, color, reverse = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = E.inOut(Math.min(1, frame / Math.max(1, durationInFrames * 0.85)));
  const p = reverse ? 1 - t : t;
  const scale = 0.02 + p * 2.6;
  const c = color ?? palette.accent;

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div
        style={{
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c}44 0%, ${c}18 55%, transparent 72%)`,
          transform: `scale(${scale})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          border: `3px solid ${c}`,
          transform: `scale(${scale * 0.82})`,
          opacity: (1 - p) * 0.9 + 0.1,
          boxShadow: `0 0 70px ${c}66`,
        }}
      />
      {caption ? (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            fontFamily: font.sans,
            fontSize: type.body,
            color: 'rgba(255,255,255,0.55)',
            opacity: fade(Math.sin(t * Math.PI)),
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T102_LABEL = '穿门推镜';
export const T102_USE = ['transition', 'zoom', 'enter'];
export const T102_DESC = '中心光圈放大到吞掉整屏，带发光边圈，适合"进入界面/进入细节"';
