import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, type } from '../kit';
import { Panel } from './_base';

export type T71Props = {
  columns: string[];
  rows: string[][];
  title?: string;
};

/**
 * T71 · 数据表
 * 用途：字段、参数、对比项——规整的信息
 * 画面：表头先出，行从上到下依次淡入，鼠标掠过效果不做
 */
export const T71SchemaTable: React.FC<T71Props> = ({ columns, rows, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2}>
      <div style={{ border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            background: 'rgba(255,255,255,0.05)',
            padding: `${sp(1.4)}px ${sp(2)}px`,
            fontFamily: font.mono,
            fontSize: type.micro,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.06em',
          }}
        >
          {columns.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {rows.map((r, ri) => {
          const p = Math.min(1, Math.max(0, (frame - ri * 5) / 14));
          return (
            <div
              key={ri}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                padding: `${sp(1.4)}px ${sp(2)}px`,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                opacity: fade(p),
                fontFamily: font.sans,
                fontSize: type.small,
                color: ri === 0 ? palette.ink : 'rgba(255,255,255,0.62)',
              }}
            >
              {r.map((cell, ci) => (
                <span key={ci} style={{ fontFamily: ci === 0 ? font.mono : font.sans }}>
                  {cell}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T71_LABEL = '数据表';
export const T71_USE = ['data', 'table', 'reference'];
export const T71_DESC = '规整的表格，表头固定、行依次淡入，适合字段和对比项';
