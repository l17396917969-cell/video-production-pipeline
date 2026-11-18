import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T38Props = { value: number; total?: number; label: string; caption?: string };

/**
 * T38 · 环形进度
 * 用途：完成度、占比——比文字更直观
 * 画面：底环先出现，进度环从 12 点方向顺时针长满，中心数字同步滚动
 */
export const T38RingProgress: React.FC<T38Props> = ({ value, total = 100, label, caption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = Math.min(1, frame / Math.max(1, durationInFrames * 0.7));
  const p = E.out(t) * (value / total);
  const R = 130;
  const C = 2 * Math.PI * R;
  const pIn = springIn(frame, fps, 0, 18);

  return (
    <Panel align="center" gap={3}>
      <div style={{ position: 'relative', width: R * 2 + 30, height: R * 2 + 30, opacity: fade(pIn) }}>
        <svg width={R * 2 + 30} height={R * 2 + 30}>
          <circle
            cx={R + 15}
            cy={R + 15}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={16}
          />
          <circle
            cx={R + 15}
            cy={R + 15}
            r={R}
            fill="none"
            stroke={palette.accent}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - p)}
            transform={`rotate(-90 ${R + 15} ${R + 15})`}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: font.sans,
              fontSize: type.l,
              fontWeight: 700,
              color: palette.ink,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(p * 100)}%
          </div>
          <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.5)' }}>
            {label}
          </div>
        </div>
      </div>
      {caption ? (
        <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.45)' }}>
          {caption}
        </div>
      ) : null}
    </Panel>
  );
};

export const T38_LABEL = '环形进度';
export const T38_USE = ['data', 'progress', 'percent'];
export const T38_DESC = '进度环顺时针长满，中心显示百分比和标签';
