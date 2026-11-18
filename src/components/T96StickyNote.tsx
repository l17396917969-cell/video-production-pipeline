import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T96Props = { text: string; author?: string; tilt?: number };

/**
 * T96 · 便利贴
 * 用途：一条经验、一句吐槽——比正式卡片更有人味
 * 画面：黄色便签轻微倾斜落下，带一点阴影和折角
 */
export const T96StickyNote: React.FC<T96Props> = ({ text, author, tilt = -3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 0, 24);

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          opacity: fade(p),
          transform: `translateY(${(1 - p) * 30}px) rotate(${tilt}deg) scale(${0.94 + p * 0.06})`,
          width: sp(62),
          minHeight: sp(40),
          background: palette.note,
          borderRadius: 4,
          padding: sp(4),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 26px 60px rgba(0,0,0,0.55)',
          position: 'relative',
        }}
      >
        <div style={{ fontFamily: font.sans, fontSize: type.s, fontWeight: 600, color: palette.noteInk, lineHeight: 1.6 }}>
          {text}
        </div>
        {author ? (
          <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(42,36,16,0.6)', marginTop: sp(2) }}>
            — {author}
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            borderLeft: '34px solid rgba(0,0,0,0.12)',
            borderBottom: `34px solid ${palette.noteFold}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const T96_LABEL = '便利贴';
export const T96_USE = ['note', 'tip', 'informal'];
export const T96_DESC = '黄色便签带倾角落下，右下有折角阴影，适合一条经验或吐槽';
