import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T49Props = {
  items: { label: string; points: number[]; value?: string }[];
  title?: string;
};

/**
 * T49 · 迷你图网格
 * 用途：一次看六七个指标的趋势——信息密度最高的图表形态
 * 画面：每个小格里一条迷你折线从左描出，标签和当前值在旁边
 */
export const T49SparkGrid: React.FC<T49Props> = ({ items, title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.8)));

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: sp(2) }}>
        {items.map((it, i) => {
          const pin = springIn(frame, fps, 3 + i * 4, 16);
          const W = 330;
          const H = 90;
          const max = Math.max(...it.points);
          const min = Math.min(...it.points);
          const spanY = max - min || 1;
          const d = it.points
            .map((v, k) => {
              const x = (k / (it.points.length - 1)) * W;
              const y = H - ((v - min) / spanY) * H;
              return `${k === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');

          return (
            <div
              key={it.label}
              style={{
                opacity: fade(pin),
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: sp(2),
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: sp(0.8) }}>
                <span style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.55)' }}>
                  {it.label}
                </span>
                <span style={{ fontFamily: font.mono, fontSize: type.small, color: palette.ink, fontWeight: 600 }}>
                  {it.value ?? ''}
                </span>
              </div>
              <svg width={W} height={H}>
                <path
                  d={d}
                  fill="none"
                  stroke={palette.accentSoft}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={W * 1.4}
                  strokeDashoffset={W * 1.4 * (1 - p)}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T49_LABEL = '迷你图网格';
export const T49_USE = ['data', 'overview', 'dashboard'];
export const T49_DESC = '多个小格子，每个一条迷你折线同时描出，信息密度最高的图表';
