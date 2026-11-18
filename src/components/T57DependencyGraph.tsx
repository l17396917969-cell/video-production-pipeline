import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T57Props = {
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: [string, string][];
  title?: string;
};

/**
 * T57 · 依赖图
 * 用途：谁依赖谁、谁阻塞谁
 * 画面：节点先落位，连线随后从起点长到终点
 */
export const T57DependencyGraph: React.FC<T57Props> = ({ nodes, edges, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <Panel title={title} gap={1}>
      <div style={{ position: 'relative', width: '100%', height: sp(58) }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          {edges.map(([a, b], i) => {
            const na = byId[a];
            const nb = byId[b];
            if (!na || !nb) return null;
            const p = springIn(frame, fps, 8 + i * 5, 16);
            return (
              <line
                key={`${a}-${b}`}
                x1={`${na.x}%`}
                y1={`${na.y}%`}
                x2={`${na.x + (nb.x - na.x) * p}%`}
                y2={`${na.y + (nb.y - na.y) * p}%`}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        {nodes.map((n, i) => {
          const p = springIn(frame, fps, 2 + i * 5, 16);
          return (
            <div
              key={n.id}
              style={{
                position: 'absolute',
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: `translate(-50%, -50%) scale(${0.85 + p * 0.15})`,
                opacity: fade(p),
                padding: `${sp(1)}px ${sp(2)}px`,
                background: palette.bg,
                border: `1.5px solid ${palette.accent}`,
                borderRadius: 8,
                fontFamily: font.sans,
                fontSize: type.small,
                fontWeight: 600,
                color: palette.ink,
                whiteSpace: 'nowrap',
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T57_LABEL = '依赖图';
export const T57_USE = ['structure', 'dependency', 'architecture'];
export const T57_DESC = '节点按坐标落位，连线从起点长到终点，表示依赖关系';
