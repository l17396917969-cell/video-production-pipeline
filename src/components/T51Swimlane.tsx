import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T51Props = {
  lanes: string[];
  steps: { lane: number; label: string }[];
  title?: string;
};

/**
 * T51 · 泳道图
 * 用途：谁做什么——协作、责任划分
 * 画面：泳道横带先出现，任务块按顺序在各自泳道里落位
 */
export const T51Swimlane: React.FC<T51Props> = ({ lanes, steps, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LANE_H = 92;

  return (
    <Panel title={title} gap={2}>
      <div style={{ position: 'relative', display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: sp(16) }}>
          {lanes.map((l) => (
            <div
              key={l}
              style={{
                height: LANE_H,
                display: 'flex',
                alignItems: 'center',
                fontFamily: font.sans,
                fontSize: type.small,
                color: 'rgba(255,255,255,0.55)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {l}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {lanes.map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: i * LANE_H,
                left: 0,
                right: 0,
                height: LANE_H,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
              }}
            />
          ))}
          {steps.map((s, i) => {
            const p = springIn(frame, fps, 4 + i * 7, 18);
            const perRow = 4;
            const col = i % perRow;
            const W = 190;
            return (
              <div
                key={`${s.label}-${i}`}
                style={{
                  position: 'absolute',
                  left: sp(4) + col * (W + 26),
                  top: s.lane * LANE_H + LANE_H / 2 - 24,
                  width: W,
                  height: 48,
                  opacity: fade(p),
                  transform: `translateY(${(1 - p) * 10}px)`,
                  background: 'rgba(99,91,255,0.18)',
                  border: `1px solid ${palette.accent}`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: font.sans,
                  fontSize: type.small,
                  color: palette.ink,
                }}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
};

export const T51_LABEL = '泳道图';
export const T51_USE = ['process', 'roles', 'collaboration'];
export const T51_DESC = '按角色分泳道，任务块在各自泳道里依次落位';
