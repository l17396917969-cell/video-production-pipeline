import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { font, palette, sp, type } from '../kit';

export type T112Props = { text?: string; sub?: string };

/**
 * T112 · 双色几何背景
 * 用途：最克制的一种底——几个半透明几何块慢慢转
 * 画面：三个圆角方块以不同速度旋转平移，只有两种颜色
 * 参考：remotion-templates 的 bg-loop-duotone-geometry 思路
 */
export const T112DuotoneGeometry: React.FC<T112Props> = ({ text, sub }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const block = (size: number, x: number, y: number, rot: number, op: number, accent: boolean) => (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: accent ? `rgba(99,91,255,${op})` : `rgba(255,255,255,${op * 0.5})`,
        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      }}
    />
  );

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      {block(520, 22, 30, t * 6, 0.10, true)}
      {block(380, 78, 68, -t * 9, 0.08, false)}
      {block(260, 62, 22, t * 12, 0.06, true)}
      {text ? (
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontFamily: font.sans, fontSize: type.xl, fontWeight: 740, color: palette.ink, letterSpacing: '-0.035em' }}>
            {text}
          </div>
          {sub ? (
            <div style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.45)', marginTop: sp(1.5), letterSpacing: '0.08em' }}>
              {sub}
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T112_LABEL = '双色几何背景';
export const T112_USE = ['background', 'ambient', 'minimal'];
export const T112_DESC = '几个半透明圆角方块以不同速度旋转平移，只有两种颜色，最克制';
