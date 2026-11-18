import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T55Props = { layers: { label: string; desc?: string }[]; title?: string };

/**
 * T55 · 嵌套容器
 * 用途：包含关系——一个装一个，从外到内
 * 画面：外框先出现，内框一层层往里缩，每层左上角标名字
 */
export const T55NestedBox: React.FC<T55Props> = ({ layers, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const render = (i: number): React.ReactNode => {
    if (i >= layers.length) return null;
    const p = springIn(frame, fps, 3 + i * 8, 18);
    const l = layers[i];
    return (
      <div
        style={{
          opacity: fade(p),
          transform: `scale(${0.94 + p * 0.06})`,
          border: `1.5px solid ${i === layers.length - 1 ? palette.accent : 'rgba(255,255,255,0.14)'}`,
          background: i === layers.length - 1 ? 'rgba(99,91,255,0.10)' : 'rgba(255,255,255,0.02)',
          borderRadius: 14,
          padding: sp(3),
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: sp(1.5), marginBottom: sp(1.5) }}>
          <span style={{ fontFamily: font.sans, fontSize: type.small, fontWeight: 640, color: palette.ink }}>
            {l.label}
          </span>
          {l.desc ? (
            <span style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.4)' }}>
              {l.desc}
            </span>
          ) : null}
        </div>
        {render(i + 1)}
      </div>
    );
  };

  return (
    <Panel title={title} gap={2}>
      {render(0)}
    </Panel>
  );
};

export const T55_LABEL = '嵌套容器';
export const T55_USE = ['structure', 'containment', 'explain'];
export const T55_DESC = '一层套一层的方框，从外到内依次出现，表示包含关系';
