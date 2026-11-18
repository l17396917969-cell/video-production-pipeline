import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T67Props = {
  error: string;
  frames: string[];
  hint?: string;
  title?: string;
};

/**
 * T67 · 报错堆栈
 * 用途：讲坑的时候，把真实的报错贴出来比转述有力
 * 画面：红色错误行先出，堆栈逐条缩进列出，底部一条修复提示
 */
export const T67ErrorStack: React.FC<T67Props> = ({ error, frames, hint, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pErr = springIn(frame, fps, 0, 18);
  const pHint = springIn(frame, fps, 16 + frames.length * 4, 18);

  return (
    <Panel title={title} gap={2}>
      <div
        style={{
          opacity: fade(pErr),
          background: 'rgba(255,90,90,0.10)',
          border: `1px solid ${palette.danger}`,
          borderRadius: 12,
          padding: sp(2.5),
        }}
      >
        <div style={{ fontFamily: font.mono, fontSize: type.s, fontWeight: 700, color: palette.dangerSoft, marginBottom: sp(1.5) }}>
          {error}
        </div>
        {frames.map((f, i) => (
          <div
            key={i}
            style={{
              fontFamily: font.mono,
              fontSize: type.small,
              color: 'rgba(255,255,255,0.45)',
              paddingLeft: sp(1.5) * (i + 1),
              lineHeight: 1.7,
              opacity: Math.min(1, Math.max(0, (frame - 6 - i * 3) / 12)),
            }}
          >
            {f}
          </div>
        ))}
      </div>
      {hint ? (
        <div
          style={{
            opacity: fade(pHint),
            padding: `${sp(1.2)}px ${sp(2.2)}px`,
            background: 'rgba(61,220,151,0.10)',
            border: `1px solid ${palette.ok}`,
            borderRadius: 10,
            fontFamily: font.sans,
            fontSize: type.small,
            color: palette.ok,
          }}
        >
          {hint}
        </div>
      ) : null}
    </Panel>
  );
};

export const T67_LABEL = '报错堆栈';
export const T67_USE = ['error', 'debug', 'pitfall'];
export const T67_DESC = '红色错误块 + 缩进堆栈 + 底部绿色修复提示，讲坑时用';
