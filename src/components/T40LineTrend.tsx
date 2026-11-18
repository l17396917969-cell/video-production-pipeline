import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, type } from '../kit';
import { Panel } from './_base';

export type T40Props = { points: number[]; title?: string; xLabels?: string[]; unit?: string };

/**
 * T40 · 折线趋势
 * 用途：随时间怎么变的
 * 画面：折线从左向右描出来，线头有个点跟着走，末尾显示当前值
 */
export const T40LineTrend: React.FC<T40Props> = ({ points, title, xLabels, unit = '' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const W = 1500;
  const H = 460;
  const pad = 40;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;

  const p = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.75)));
  const n = points.length;
  const xy = (i: number) => [
    pad + (i / (n - 1)) * (W - pad * 2),
    H - pad - ((points[i] - min) / span) * (H - pad * 2),
  ];

  // 只画到当前进度
  const drawn = [] as string[];
  for (let i = 0; i < n; i++) {
    const [x, y] = xy(i);
    drawn.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  const totalLen = (W - pad * 2) * 1.3;
  const head = Math.min(1, p * 1.15);
  const headIdx = Math.min(n - 1, Math.floor(head * (n - 1)));
  const [hx, hy] = xy(headIdx);

  return (
    <Panel title={title} gap={3}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <path
          d={drawn.join(' ')}
          fill="none"
          stroke={palette.accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLen}
          strokeDashoffset={totalLen * (1 - head)}
        />
        <circle cx={hx} cy={hy} r={10} fill={palette.accentSoft} opacity={fade(p)} />
        <circle cx={hx} cy={hy} r={20} fill={palette.accent} opacity={0.18 * p} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: W, opacity: fade(p) }}>
        <span style={{ fontFamily: font.sans, fontSize: type.body, color: palette.ink, fontWeight: 600 }}>
          {points[headIdx]}
          {unit}
        </span>
        {xLabels ? (
          <span style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.4)' }}>
            {xLabels[headIdx] ?? ''}
          </span>
        ) : null}
      </div>
    </Panel>
  );
};

export const T40_LABEL = '折线趋势';
export const T40_USE = ['data', 'trend', 'growth'];
export const T40_DESC = '折线从左向右描出，线头光点跟随并显示当前值';
