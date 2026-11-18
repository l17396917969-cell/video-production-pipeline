import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T08Props = {
  title?: string;
  nodes: { id: string; label: string; tag?: string }[];
  edges: [string, string][];
  theme?: 'dark' | 'light';
};

/**
 * T08 · 关系图
 * 用途：本体论、Agent 架构、实体关系、调用链
 * 画面：中心节点落下 → 外围节点逐个出现 → 连线随后画出
 * 约定：nodes[0] 放中心，其余按角度均匀环绕
 */
export const T08Graph: React.FC<T08Props> = ({ title, nodes, edges, theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);
  const pTitle = springIn(frame, fps, 0, 18);

  const W = 1920;
  const H = 1080;
  const cx = W / 2;
  const cy = H / 2 + (title ? 40 : 0);
  const rx = 520;
  const ry = 300;

  const pos = nodes.map((n, i) => {
    if (i === 0) return { x: cx, y: cy };
    const ring = nodes.length - 1;
    const a = ((i - 1) / ring) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  });

  const idx = (id: string) => nodes.findIndex((n) => n.id === id);

  const nodeW = 260;
  const nodeH = 92;

  return (
    <AbsoluteFill style={{ background: th.bg }}>
      {title ? (
        <div
          style={{
            position: 'absolute',
            left: sp(11),
            top: sp(7),
            opacity: fade(pTitle),
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 600,
            color: th.ink,
          }}
        >
          {title}
        </div>
      ) : null}

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {edges.map(([from, to], i) => {
          const a = pos[idx(from)];
          const b = pos[idx(to)];
          if (!a || !b) return null;
          const pe = springIn(frame, fps, 26 + i * 5, 16);
          const x2 = a.x + (b.x - a.x) * pe;
          const y2 = a.y + (b.y - a.y) * pe;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={x2}
              y2={y2}
              stroke={palette.accent}
              strokeWidth={2}
              strokeOpacity={0.5}
              strokeDasharray="8 8"
            />
          );
        })}
      </svg>

      {nodes.map((n, i) => {
        const p = springIn(frame, fps, 8 + i * 8, 20);
        const center = i === 0;
        return (
          <div
            key={n.id}
            style={{
              position: 'absolute',
              left: pos[i].x - nodeW / 2,
              top: pos[i].y - nodeH / 2,
              width: nodeW,
              height: nodeH,
              opacity: fade(p),
              transform: `scale(${0.9 + p * 0.1})`,
              border: `1px solid ${center ? palette.accent : th.hairline}`,
              background: center ? palette.accentDim : theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              borderRadius: sp(2),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: font.sans,
                fontSize: type.small,
                fontWeight: 580,
                color: th.ink,
              }}
            >
              {n.label}
            </div>
            {n.tag ? (
              <div style={{ fontFamily: font.mono, fontSize: type.micro, color: th.muted }}>
                {n.tag}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const T08_LABEL = '关系图';
export const T08_USE = ['explain', 'architecture'];
export const T08_DESC = '中心节点加环绕节点，连线逐条画出，适合讲本体论、Agent 架构、实体关系';
