import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T89Props = { points: { head: string; body: string }[]; title?: string };

/**
 * T89 · 三点总结
 * 用途：结尾归纳——只讲三件事，观众才记得住
 * 画面：三块从左到右依次浮起，序号用强调色
 */
export const T89ThreePoints: React.FC<T89Props> = ({ points, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={3}>
      <div style={{ display: 'flex', gap: sp(3) }}>
        {points.map((p, i) => {
          const pin = springIn(frame, fps, 4 + i * 10, 18);
          return (
            <div
              key={p.head}
              style={{
                ...riseIn(pin, 20),
                opacity: fade(pin),
                flex: 1,
                padding: sp(2.5),
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: sp(1.2),
              }}
            >
              <span style={{ fontFamily: font.mono, fontSize: type.micro, color: palette.accentSoft }}>
                0{i + 1}
              </span>
              <span style={{ fontFamily: font.sans, fontSize: type.s, fontWeight: 640, color: palette.ink, lineHeight: 1.35 }}>
                {p.head}
              </span>
              <span style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.48)', lineHeight: 1.55 }}>
                {p.body}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T89_LABEL = '三点总结';
export const T89_USE = ['summary', 'ending', 'list'];
export const T89_DESC = '三张并列卡片依次浮起，序号强调，只讲三件事';
