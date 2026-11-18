import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T53Props = { levels: { label: string; desc?: string }[]; title?: string };

/**
 * T53 · 金字塔
 * 用途：层级越往上越少、越重要——权力、价值、优先级
 * 画面：从底向上逐层收窄堆叠，最顶一层用强调色
 */
export const T53Pyramid: React.FC<T53Props> = ({ levels, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = levels.length;

  return (
    <Panel title={title} gap={2} align="center">
      <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: sp(1) }}>
        {levels.map((l, i) => {
          const p = springIn(frame, fps, 4 + i * 8, 18);
          const w = 100 - i * (60 / Math.max(1, n - 1));
          const top = i === n - 1;
          return (
            <div
              key={l.label}
              style={{
                width: `${sp(120) * (w / 100)}px`,
                opacity: fade(p),
                transform: `scaleX(${0.7 + p * 0.3})`,
                padding: `${sp(1.8)}px ${sp(2.5)}px`,
                background: top ? 'rgba(99,91,255,0.85)' : `rgba(99,91,255,${0.10 + i * 0.06})`,
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: font.sans, fontSize: type.body, fontWeight: 640, color: top ? palette.paper : palette.ink }}>
                {l.label}
              </div>
              {l.desc ? (
                <div style={{ fontFamily: font.sans, fontSize: type.micro, color: top ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' }}>
                  {l.desc}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T53_LABEL = '金字塔';
export const T53_USE = ['structure', 'priority', 'hierarchy'];
export const T53_DESC = '自底向上逐层收窄堆叠，最顶一层高亮';
