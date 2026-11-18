import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, type } from '../kit';
import { Panel } from './_base';

export type T65Props = { entries: [string, string][]; title?: string };

/**
 * T65 · 键值表
 * 用途：配置、参数、返回结果——一堆 a: b
 * 画面：每行左边键名、右边值，从左到右依次出现
 */
export const T65JsonViewer: React.FC<T65Props> = ({ entries, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2}>
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: sp(2.5),
        }}
      >
        {entries.map(([k, v], i) => {
          const p = Math.min(1, Math.max(0, (frame - i * 4) / 14));
          return (
            <div
              key={k}
              style={{
                display: 'flex',
                gap: sp(2),
                fontFamily: font.mono,
                fontSize: type.small,
                lineHeight: 1.9,
                opacity: fade(p),
              }}
            >
              <span style={{ color: palette.accentSoft, minWidth: sp(26) }}>{k}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>:</span>
              <span style={{ color: palette.ink }}>{v}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T65_LABEL = '键值表';
export const T65_USE = ['code', 'config', 'data'];
export const T65_DESC = '键值成对排列，逐行出现，适合配置项和返回结果';
