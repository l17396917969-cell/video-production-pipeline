import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { font, palette, sp, type } from '../kit';

export type T111Props = { text?: string; sub?: string; rings?: number };

/**
 * T111 · 等高线背景
 * 用途：垫在文字或数据后面的底纹——有科技感但不抢内容
 * 画面：多圈不规则闭合曲线缓慢呼吸，像地形图
 * 参考：remotion-templates 的 bg-loop-topographic-contours 思路
 */
export const T111TopoBackground: React.FC<T111Props> = ({ text, sub, rings = 7 }) => {
  const frame = useCurrentFrame();
  const drift = frame / 90;

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: rings }).map((_, i) => {
          const k = 1 + i * 0.22;
          const wob = Math.sin(drift + i * 0.7) * 14;
          const pts = Array.from({ length: 24 }).map((__, j) => {
            const a = (j / 24) * Math.PI * 2;
            const r = 150 * k + Math.sin(a * 3 + drift + i) * 22 + wob;
            return `${960 + Math.cos(a) * r * 1.6},${540 + Math.sin(a) * r}`;
          });
          return (
            <polygon
              key={i}
              points={pts.join(' ')}
              fill="none"
              stroke={`rgba(99,91,255,${0.22 - i * 0.024})`}
              strokeWidth={1.2}
            />
          );
        })}
      </svg>
      {text ? (
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontFamily: font.sans, fontSize: type.xl, fontWeight: 720, color: palette.ink, letterSpacing: '-0.03em' }}>
            {text}
          </div>
          {sub ? (
            <div style={{ fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)', marginTop: sp(1) }}>
              {sub}
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T111_LABEL = '等高线背景';
export const T111_USE = ['background', 'ambient', 'tech'];
export const T111_DESC = '多圈不规则闭合曲线缓慢呼吸，做底纹不抢内容';
