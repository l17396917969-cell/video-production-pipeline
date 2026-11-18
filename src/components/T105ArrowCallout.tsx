import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, type } from '../kit';

export type T105Props = {
  src: string;
  calls: { x: number; y: number; text: string }[];
  dim?: number;
};

/**
 * T105 · 箭头标注
 * 用途：一张截图上有两三处要指出来，箭头比框更直接
 * 画面：截图压暗，箭头从标签指向目标点，依次描出
 * 参考：remotion-templates 的 ui-annotations-arrow-callouts 思路
 */
export const T105ArrowCallout: React.FC<T105Props> = ({ src, calls, dim = 0.55 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - dim }}
      />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {calls.map((c, i) => {
          const p = E.out(Math.min(1, Math.max(0, (frame - (8 + i * 12)) / 20)));
          const ex = `${c.x}%`;
          const ey = `${c.y}%`;
          const sx = `${Math.max(4, c.x - 16)}%`;
          const sy = `${Math.max(6, c.y - 18)}%`;
          return (
            <g key={i} opacity={p}>
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke={palette.accent}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <circle cx={ex} cy={ey} r={7} fill={palette.accent} />
              <circle cx={ex} cy={ey} r={14} fill={palette.accent} opacity={0.22} />
            </g>
          );
        })}
      </svg>
      {calls.map((c, i) => {
        const p = fade(Math.min(1, Math.max(0, (frame - (8 + i * 12)) / 20)));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.max(4, c.x - 16)}%`,
              top: `${Math.max(6, c.y - 18)}%`,
              transform: 'translateY(-115%)',
              opacity: p,
              padding: `${sp(0.8)}px ${sp(1.6)}px`,
              background: 'rgba(0,0,0,0.72)',
              border: `1px solid ${palette.accent}`,
              borderRadius: 8,
              fontFamily: font.sans,
              fontSize: type.small,
              fontWeight: 600,
              color: palette.ink,
              whiteSpace: 'nowrap',
            }}
          >
            {c.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const T105_LABEL = '箭头标注';
export const T105_USE = ['annotate', 'screenshot', 'explain'];
export const T105_DESC = '截图压暗，箭头从标签指向目标点，依次描出，可标两三处';
