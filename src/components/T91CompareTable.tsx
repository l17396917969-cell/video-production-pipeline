import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, type } from '../kit';
import { Panel } from './_base';

export type T91Props = {
  options: string[];
  rows: { label: string; values: (string | boolean)[] }[];
  title?: string;
  winner?: number;
};

/**
 * T91 · 对比表
 * 用途：几个方案横向比——谁有谁没有
 * 画面：表头先出，行依次淡入，✓ 绿 ✗ 灰，胜出那列背景高亮
 */
export const T91CompareTable: React.FC<T91Props> = ({ options, rows, title, winner }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cell = (v: string | boolean) => {
    if (v === true) return <span style={{ color: palette.ok }}>✓</span>;
    if (v === false) return <span style={{ color: 'rgba(255,255,255,0.22)' }}>✗</span>;
    return <span style={{ color: 'rgba(255,255,255,0.7)' }}>{v}</span>;
  };

  return (
    <Panel title={title} gap={2}>
      <div style={{ border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `1.4fr repeat(${options.length}, 1fr)`,
            background: 'rgba(255,255,255,0.05)',
            padding: `${sp(1.4)}px ${sp(2)}px`,
          }}
        >
          <span />
          {options.map((o, i) => (
            <span
              key={o}
              style={{
                fontFamily: font.sans,
                fontSize: type.small,
                fontWeight: 640,
                color: i === winner ? palette.accentSoft : 'rgba(255,255,255,0.55)',
                textAlign: 'center',
              }}
            >
              {o}
            </span>
          ))}
        </div>
        {rows.map((r, ri) => {
          const p = Math.min(1, Math.max(0, (frame - ri * 6) / 14));
          return (
            <div
              key={r.label}
              style={{
                display: 'grid',
                gridTemplateColumns: `1.4fr repeat(${options.length}, 1fr)`,
                padding: `${sp(1.2)}px ${sp(2)}px`,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                opacity: fade(p),
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.6)' }}>
                {r.label}
              </span>
              {r.values.map((v, ci) => (
                <span key={ci} style={{ textAlign: 'center', fontFamily: font.mono, fontSize: type.small }}>
                  {cell(v)}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T91_LABEL = '对比表';
export const T91_USE = ['compare', 'table', 'choice'];
export const T91_DESC = '多方案横向对比，勾叉一目了然，胜出列高亮';
