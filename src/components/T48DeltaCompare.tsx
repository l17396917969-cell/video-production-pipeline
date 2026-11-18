import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T48Props = {
  before: { label: string; value: number };
  after: { label: string; value: number };
  unit?: string;
  title?: string;
};

/**
 * T48 · 变化对比
 * 用途：改之前 / 改之后——把差值做成主角
 * 画面：两个数字并排，中间一个箭头，箭头带差值标签，增长用绿、下降用红
 */
export const T48DeltaCompare: React.FC<T48Props> = ({ before, after, unit = '', title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pA = springIn(frame, fps, 2, 20);
  const pArrow = springIn(frame, fps, 14, 18);
  const pB = springIn(frame, fps, 18, 20);

  const delta = after.value - before.value;
  const up = delta >= 0;
  const pct = before.value ? Math.round((delta / before.value) * 100) : 0;
  const color = up ? palette.ok : palette.danger;

  return (
    <Panel title={title} gap={4}>
      <div style={{ display: 'flex', alignItems: 'center', gap: sp(6) }}>
        <div style={{ opacity: fade(pA) }}>
          <div style={{ fontFamily: font.sans, fontSize: type.l, fontWeight: 660, color: 'rgba(255,255,255,0.45)', textDecoration: 'line-through' }}>
            {before.value}
            {unit}
          </div>
          <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.35)' }}>
            {before.label}
          </div>
        </div>

        <div style={{ opacity: fade(pArrow), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: sp(1) }}>
          <div style={{ fontFamily: font.mono, fontSize: type.s, fontWeight: 700, color }}>
            {up ? '+' : ''}
            {pct}%
          </div>
          <div style={{ width: sp(10), height: 3, background: color, borderRadius: 2 }} />
          <div style={{ fontFamily: font.sans, fontSize: type.micro, color: 'rgba(255,255,255,0.4)' }}>
            变化
          </div>
        </div>

        <div style={{ ...riseIn(pB, 14), opacity: fade(pB) }}>
          <div style={{ fontFamily: font.sans, fontSize: type.l, fontWeight: 720, color: palette.ink }}>
            {after.value}
            {unit}
          </div>
          <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.55)' }}>
            {after.label}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export const T48_LABEL = '变化对比';
export const T48_USE = ['data', 'before-after', 'improve'];
export const T48_DESC = '改前数字划掉，箭头标出涨幅，改后数字放大；涨幅用绿、下降用红';
