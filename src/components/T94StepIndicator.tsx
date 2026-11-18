import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, type } from '../kit';

export type T94Props = { steps: string[]; progress: number; title?: string };

/**
 * T94 · 步骤指示器
 * 用途：长流程里告诉观众"现在走到第几步"
 * 画面：顶部一排圆点用横线连起来，进度线从前往后填满
 */
export const T94StepIndicator: React.FC<T94Props> = ({ steps, progress, title }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = Math.min(1, frame / Math.max(1, durationInFrames * 0.7));
  const reached = t * (steps.length - 1);

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(12), justifyContent: 'center', gap: sp(4) }}>
      {title ? (
        <div style={{ fontFamily: font.sans, fontSize: type.m, fontWeight: 620, color: palette.ink }}>{title}</div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((s, i) => {
          const done = reached >= i - 0.02;
          const active = Math.abs(reached - i) < 0.5;
          return (
            <React.Fragment key={s}>
              {i > 0 ? (
                <div style={{ flex: 1, height: 2, background: done ? palette.accent : 'rgba(255,255,255,0.12)' }} />
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: sp(1) }}>
                <div
                  style={{
                    width: sp(3.2),
                    height: sp(3.2),
                    borderRadius: sp(1.6),
                    background: done ? palette.accent : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${active ? palette.accentSoft : 'transparent'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: font.mono,
                    fontSize: type.micro,
                    color: done ? palette.paper : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {i + 1}
                </div>
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: type.micro,
                    color: done ? palette.ink : 'rgba(255,255,255,0.35)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T94_LABEL = '步骤指示器';
export const T94_USE = ['progress', 'process', 'navigation'];
export const T94_DESC = '一排编号圆点用横线串起，进度线随帧填满';
