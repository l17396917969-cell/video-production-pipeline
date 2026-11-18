import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';
import { Panel } from './_base';

export type T45Props = { value: number; max?: number; label: string; status?: string; statusColor?: string };

/**
 * T45 · 仪表盘
 * 用途：健康度、负载、评分——一个指针指到某个位置
 * 画面：半圆刻度先出现，指针从最左扫到目标位置并轻微回弹
 */
export const T45Gauge: React.FC<T45Props> = ({ value, max = 100, label, status, statusColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = E.out(Math.min(1, frame / Math.max(1, durationInFrames * 0.65)));
  const ratio = Math.min(1, Math.max(0, value / max)) * t;
  const angle = -180 + ratio * 180;
  const R = 180;

  return (
    <Panel align="center" gap={2}>
      <div style={{ position: 'relative', width: R * 2 + 40, height: R + 60 }}>
        <svg width={R * 2 + 40} height={R + 60} style={{ overflow: 'visible' }}>
          <path
            d={`M 20 ${R + 20} A ${R} ${R} 0 0 1 ${R * 2 + 20} ${R + 20}`}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={20}
            strokeLinecap="round"
          />
          <path
            d={`M 20 ${R + 20} A ${R} ${R} 0 0 1 ${R * 2 + 20} ${R + 20}`}
            fill="none"
            stroke={palette.accent}
            strokeWidth={20}
            strokeLinecap="round"
            strokeDasharray={Math.PI * R}
            strokeDashoffset={Math.PI * R * (1 - ratio)}
          />
          <g transform={`translate(${R + 20} ${R + 20}) rotate(${angle})`}>
            <line x1={0} y1={0} x2={R - 30} y2={0} stroke={palette.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
          <circle cx={R + 20} cy={R + 20} r={12} fill={palette.ink} />
        </svg>
      </div>
      <div
        style={{
          fontFamily: font.sans,
          fontSize: type.l,
          fontWeight: 700,
          color: palette.ink,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(value * t)}
      </div>
      <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      {status ? (
        <div
          style={{
            marginTop: sp(1),
            padding: `${sp(0.8)}px ${sp(2)}px`,
            borderRadius: sp(8),
            background: `${statusColor ?? palette.ok}22`,
            border: `1px solid ${statusColor ?? palette.ok}`,
            fontFamily: font.mono,
            fontSize: type.small,
            color: statusColor ?? palette.ok,
          }}
        >
          {status}
        </div>
      ) : null}
    </Panel>
  );
};

export const T45_LABEL = '仪表盘';
export const T45_USE = ['data', 'status', 'score'];
export const T45_DESC = '半圆刻度 + 扫过的指针 + 数值，可带一个状态胶囊';
