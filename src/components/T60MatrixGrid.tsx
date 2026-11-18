import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T60Props = {
  rows: string[];
  cols: string[];
  cells: { r: number; c: number; label: string; accent?: boolean }[];
  title?: string;
};

/**
 * T60 · 矩阵
 * 用途：两个维度交叉定位——四象限、优先级矩阵
 * 画面：网格先铺开，标签依次落进对应格
 */
export const T60MatrixGrid: React.FC<T60Props> = ({ rows, cols, cells, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2} align="center">
      <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${cols.length}, 1fr)`, gap: sp(1), width: '100%' }}>
        <div />
        {cols.map((c) => (
          <div key={c} style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            {c}
          </div>
        ))}
        {rows.map((r, ri) => (
          <React.Fragment key={r}>
            <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.4)', alignSelf: 'center', paddingRight: sp(1.5) }}>
              {r}
            </div>
            {cols.map((_, ci) => {
              const cell = cells.find((x) => x.r === ri && x.c === ci);
              const p = springIn(frame, fps, 3 + (ri * cols.length + ci) * 3, 14);
              return (
                <div
                  key={ci}
                  style={{
                    minHeight: sp(12),
                    opacity: fade(p),
                    transform: `scale(${0.9 + p * 0.1})`,
                    background: cell?.accent ? 'rgba(99,91,255,0.30)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${cell?.accent ? palette.accent : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: sp(1),
                    fontFamily: font.sans,
                    fontSize: type.small,
                    color: cell ? palette.ink : 'transparent',
                  }}
                >
                  {cell?.label ?? ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Panel>
  );
};

export const T60_LABEL = '矩阵';
export const T60_USE = ['structure', 'priority', 'quadrant'];
export const T60_DESC = '行列网格，标签落进对应格，可高亮特定的格';
