import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T39Props = { items: { label: string; value: number }[]; title?: string };

const COLORS = [palette.accent, palette.accentSoft, palette.ok, palette.warn, palette.accentDeep];

/**
 * T39 · 饼图
 * 用途：构成——谁占大头
 * 画面：扇区从 12 点开始依次扫出，右侧图例逐条出现
 */
export const T39PieChart: React.FC<T39Props> = ({ items, title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const sweep = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.65)));
  const R = 150;

  let acc = 0;
  const arcs = items.map((it, i) => {
    const frac = it.value / total;
    const start = acc;
    acc += frac;
    const a0 = start * 360 - 90;
    const a1 = (start + frac * sweep) * 360 - 90;
    const rad = (d: number) => (d * Math.PI) / 180;
    const x0 = R + R * Math.cos(rad(a0));
    const y0 = R + R * Math.sin(rad(a0));
    const x1 = R + R * Math.cos(rad(a1));
    const y1 = R + R * Math.sin(rad(a1));
    const large = a1 - a0 > 180 ? 1 : 0;
    return {
      d: `M ${R} ${R} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`,
      fill: COLORS[i % COLORS.length],
      label: it.label,
      pct: Math.round(frac * 100),
    };
  });

  return (
    <Panel title={title} gap={4}>
      <div style={{ display: 'flex', alignItems: 'center', gap: sp(8) }}>
        <svg width={R * 2} height={R * 2} style={{ opacity: fade(Math.min(1, frame / 6)) }}>
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.fill} opacity={0.92} />
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp(2) }}>
          {items.map((it, i) => {
            const p = springIn(frame, fps, 16 + i * 6, 18);
            return (
              <div
                key={it.label}
                style={{ opacity: fade(p), display: 'flex', alignItems: 'center', gap: sp(1.5) }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: COLORS[i % COLORS.length],
                  }}
                />
                <span style={{ fontFamily: font.sans, fontSize: type.body, color: palette.ink }}>
                  {it.label}
                </span>
                <span style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.45)' }}>
                  {Math.round((it.value / total) * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
};

export const T39_LABEL = '饼图';
export const T39_USE = ['data', 'share', 'composition'];
export const T39_DESC = '扇区依次扫出，右侧图例带百分比，用来看构成';
