import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T44Props = { steps: { label: string; value: number }[]; title?: string };

/**
 * T44 · 漏斗
 * 用途：转化、流失——每一步掉多少人
 * 画面：梯形从上往下逐级变窄，每级标数量和流失率
 */
export const T44Funnel: React.FC<T44Props> = ({ steps, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = steps[0]?.value || 1;

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: sp(1.2), alignItems: 'center' }}>
        {steps.map((s, i) => {
          const p = springIn(frame, fps, 4 + i * 8, 18);
          const w = (s.value / max) * 100;
          const drop = i > 0 ? Math.round((1 - s.value / steps[i - 1].value) * 100) : 0;
          return (
            <div
              key={s.label}
              style={{
                width: `${w}%`,
                minWidth: 260,
                opacity: fade(p),
                transform: `scaleY(${0.7 + p * 0.3})`,
                padding: `${sp(1.6)}px ${sp(3)}px`,
                background: `linear-gradient(90deg, rgba(99,91,255,${0.85 - i * 0.2}), rgba(99,91,255,${0.45 - i * 0.12}))`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: sp(3),
              }}
            >
              <span style={{ fontFamily: font.sans, fontSize: type.body, fontWeight: 600, color: palette.paper }}>
                {s.label}
              </span>
              <span style={{ display: 'flex', gap: sp(2), alignItems: 'baseline' }}>
                <span style={{ fontFamily: font.mono, fontSize: type.s, fontWeight: 700, color: palette.paper }}>
                  {s.value}
                </span>
                {drop > 0 ? (
                  <span style={{ fontFamily: font.mono, fontSize: type.micro, color: palette.warn }}>
                    −{drop}%
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T44_LABEL = '漏斗';
export const T44_USE = ['data', 'funnel', 'conversion'];
export const T44_DESC = '逐级变窄的梯形，标出每一步的数量和流失百分比';
