import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T32Props = { left: string; right: string; caption?: string };

/**
 * T32 · 对开
 * 用途：先给一个悬念，再把两个对立面打开
 * 画面：整屏从中间向两侧裂开，露出左右两个词，中间一条发光缝
 */
export const T32SplitOpen: React.FC<T32Props> = ({ left, right, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = Math.min(1, frame / Math.max(1, durationInFrames * 0.55));
  const open = E.out(t) * 50; // 百分比

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50%',
          height: '100%',
          transform: `translateX(-${open}%)`,
          background: palette.bg,
          borderRight: '1px solid rgba(255,255,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: sp(6),
        }}
      >
        <span style={{ fontFamily: font.sans, fontSize: type.l, fontWeight: 680, color: palette.ink }}>
          {left}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '50%',
          height: '100%',
          transform: `translateX(${open}%)`,
          background: palette.bg,
          borderLeft: '1px solid rgba(255,255,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: sp(6),
        }}
      >
        <span style={{ fontFamily: font.sans, fontSize: type.l, fontWeight: 680, color: palette.accentSoft }}>
          {right}
        </span>
      </div>
      {caption ? (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: sp(10) }}>
          <span style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}>
            {caption}
          </span>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const T32_LABEL = '对开';
export const T32_USE = ['opening', 'contrast', 'transition'];
export const T32_DESC = '画面从中间裂开向两侧推开，露出左右两个对立的词';
