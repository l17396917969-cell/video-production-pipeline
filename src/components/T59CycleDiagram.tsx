import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { font, palette, sp, type } from '../kit';
import { Panel } from './_base';

export type T59Props = { stages: string[]; title?: string };

/**
 * T59 · 循环图
 * 用途：转一圈又回来——反馈、迭代、增长飞轮
 * 画面：三个以上的阶段排成圈，一个光点沿圈匀速跑
 */
export const T59CycleDiagram: React.FC<T59Props> = ({ stages, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const C = 230;
  const n = stages.length;
  const speed = (frame / fps) * 0.55;
  const headAngle = speed * Math.PI * 2 - Math.PI / 2;
  const hx = C + Math.cos(headAngle) * (C - 40);
  const hy = C + Math.sin(headAngle) * (C - 40);

  return (
    <Panel title={title} gap={1}>
      <div style={{ position: 'relative', width: C * 2, height: C * 2, alignSelf: 'center' }}>
        <svg width={C * 2} height={C * 2}>
          <circle cx={C} cy={C} r={C - 40} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={3} />
          <circle cx={hx} cy={hy} r={12} fill={palette.accentSoft} />
          <circle cx={hx} cy={hy} r={26} fill={palette.accent} opacity={0.2} />
        </svg>
        {stages.map((s, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = C + Math.cos(a) * (C - 40);
          const y = C + Math.sin(a) * (C - 40);
          return (
            <div
              key={s}
              style={{
                position: 'absolute',
                left: x - 80,
                top: y - 22,
                width: 160,
                textAlign: 'center',
                fontFamily: font.sans,
                fontSize: type.small,
                fontWeight: 620,
                color: palette.ink,
                padding: `${sp(0.8)}px ${sp(1.5)}px`,
                background: palette.bg,
                borderRadius: 8,
              }}
            >
              {s}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T59_LABEL = '循环图';
export const T59_USE = ['process', 'cycle', 'growth'];
export const T59_DESC = '阶段排成圆环，一个光点沿圈匀速跑，表示循环往复';
