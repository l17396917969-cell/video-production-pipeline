import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, palette, sp, type } from '../kit';

export type T26Props = { text: string; cursor?: boolean; size?: number };

/**
 * T26 · 打字机标题
 * 用途：开场、命令演示——像有人正在机器上敲
 * 画面：文字按字逐个出现，末尾竖线闪烁
 */
export const T26TypeTitle: React.FC<T26Props> = ({ text, cursor = true, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const speed = 1.6; // 每帧几个字
  const shown = Math.min(text.length, Math.floor((frame / fps) * 18 * speed));
  const done = shown >= text.length;
  const blink = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        padding: sp(12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: font.mono,
          fontSize: size ?? type.l,
          fontWeight: 600,
          color: palette.ink,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        {text.slice(0, shown)}
        {cursor ? (
          <span style={{ color: palette.accent, opacity: done && !blink ? 0 : 1 }}>▌</span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const T26_LABEL = '打字机标题';
export const T26_USE = ['opening', 'title', 'terminal'];
export const T26_DESC = '文字像被敲出来一样逐个出现，末尾有闪烁光标';
