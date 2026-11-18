import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T58Props = {
  root: string;
  branches: { label: string; result: string; ok?: boolean }[];
  title?: string;
};

/**
 * T58 · 决策树
 * 用途：如果 A 就 X，否则 Y——讲选择和后果
 * 画面：问题在顶，两条分支向下生长，结果块带对错标记
 */
export const T58DecisionTree: React.FC<T58Props> = ({ root, branches, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={3} align="center">
      <div
        style={{
          opacity: fade(springIn(frame, fps, 0, 16)),
          padding: `${sp(1.4)}px ${sp(3)}px`,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 10,
          fontFamily: font.sans,
          fontSize: type.body,
          fontWeight: 620,
          color: palette.ink,
        }}
      >
        {root}
      </div>
      <div style={{ display: 'flex', gap: sp(8) }}>
        {branches.map((b, i) => {
          const p = springIn(frame, fps, 8 + i * 9, 18);
          const color = b.ok === false ? palette.danger : palette.ok;
          return (
            <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: sp(1.5), opacity: fade(p) }}>
              <div style={{ width: 2, height: sp(4) * p, background: 'rgba(255,255,255,0.18)' }} />
              <div style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.5)' }}>
                {b.label}
              </div>
              <div
                style={{
                  padding: `${sp(1.4)}px ${sp(2.2)}px`,
                  background: `${color}18`,
                  border: `1.5px solid ${color}`,
                  borderRadius: 10,
                  fontFamily: font.sans,
                  fontSize: type.small,
                  fontWeight: 600,
                  color,
                  textAlign: 'center',
                  maxWidth: sp(32),
                }}
              >
                {b.result}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T58_LABEL = '决策树';
export const T58_USE = ['decision', 'explain', 'risk'];
export const T58_DESC = '一个问题上分出两条路，结果块用绿/红标记可行与否';
