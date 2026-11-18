import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, palette, sp, type } from '../kit';

export type T92Props = { before: string; after: string; labelBefore?: string; labelAfter?: string };

/**
 * T92 · 前后对比
 * 用途：改之前 / 改之后的两张图，一拉就懂
 * 画面：两张图叠放，分割线从左扫到右
 */
export const T92BeforeAfter: React.FC<T92Props> = ({
  before,
  after,
  labelBefore = '之前',
  labelAfter = '之后',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = Math.min(0.92, Math.max(0.08, frame / Math.max(1, durationInFrames * 0.55)));

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(8) }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden' }}>
        <Img src={staticFile(before)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, width: `${t * 100}%`, overflow: 'hidden' }}>
          <Img
            src={staticFile(after)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${t * 100}%`,
            width: 3,
            background: palette.accent,
            boxShadow: `0 0 20px ${palette.accent}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: sp(2),
            top: sp(2),
            fontFamily: font.mono,
            fontSize: type.small,
            color: palette.paper,
            background: 'rgba(0,0,0,0.6)',
            padding: `4px ${sp(1.2)}px`,
            borderRadius: 6,
          }}
        >
          {labelBefore}
        </div>
        <div
          style={{
            position: 'absolute',
            right: sp(2),
            top: sp(2),
            fontFamily: font.mono,
            fontSize: type.small,
            color: palette.paper,
            background: palette.accent,
            padding: `4px ${sp(1.2)}px`,
            borderRadius: 6,
          }}
        >
          {labelAfter}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T92_LABEL = '前后对比';
export const T92_USE = ['compare', 'screenshot', 'change'];
export const T92_DESC = '两张截图叠放，分割线从左扫到右，拉力感最强';
