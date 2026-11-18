import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, type } from '../kit';
import { Panel } from './_base';

export type T41Props = { points: number[]; title?: string; label?: string };

/**
 * T41 · 面积图
 * 用途：强调累积量、总量感——比折线更有"份量"
 * 画面：区域从底部向上填充生长，边缘一条亮线
 */
export const T41AreaChart: React.FC<T41Props> = ({ points, title, label }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const W = 1500;
  const H = 420;
  const pad = 30;
  const max = Math.max(...points) || 1;
  const p = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.7)));

  const n = points.length;
  const coords = points.map((v, i) => {
    const x = pad + (i / (n - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2) * p;
    return [x, y];
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const area = `${line} L ${coords[n - 1][0]} ${H - pad} L ${coords[0][0]} ${H - pad} Z`;

  return (
    <Panel title={title} gap={2}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity={0.55} />
            <stop offset="100%" stopColor={palette.accent} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke={palette.accentSoft} strokeWidth={4} strokeLinecap="round" />
      </svg>
      {label ? (
        <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}>
          {label}
        </div>
      ) : null}
    </Panel>
  );
};

export const T41_LABEL = '面积图';
export const T41_USE = ['data', 'trend', 'volume'];
export const T41_DESC = '区域从底部向上填充生长，边缘亮线，强调总量感';
