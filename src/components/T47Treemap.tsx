import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T47Props = { items: { label: string; value: number }[]; title?: string };

/**
 * T47 · 树图
 * 用途：看占比，但比饼图能塞更多信息——块里可以写字
 * 画面：块按面积排开，依次放大落位，越大的块颜色越深
 */
export const T47Treemap: React.FC<T47Props> = ({ items, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const sorted = [...items].sort((a, b) => b.value - a.value);

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp(1), width: '100%', height: sp(58) }}>
        {sorted.map((it, i) => {
          const p = springIn(frame, fps, 3 + i * 5, 18);
          const frac = it.value / total;
          const w = Math.max(12, frac * 100 * 0.92);
          return (
            <div
              key={it.label}
              style={{
                width: `${w}%`,
                height: `${Math.max(38, frac * 100)}%`,
                opacity: fade(p),
                transform: `scale(${0.9 + p * 0.1})`,
                background: `rgba(99,91,255,${0.16 + frac * 0.66})`,
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10,
                padding: sp(1.5),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontFamily: font.sans, fontSize: type.small, fontWeight: 620, color: palette.ink }}>
                {it.label}
              </div>
              <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.6)' }}>
                {Math.round(frac * 100)}%
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T47_LABEL = '树图';
export const T47_USE = ['data', 'share', 'hierarchy'];
export const T47_DESC = '按面积排开的色块，越大的块颜色越深，块内直接写字';
