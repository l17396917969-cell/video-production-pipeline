import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T115Props = { shapes?: 'emblem' | 'triangle' | 'hex'; name?: string; sub?: string };

/**
 * T115 · 线条描出标志
 * 用途：片头/栏目头——用一个几何标志把频道建立起来
 * 画面：几何线条按路径逐笔描出，描完填色并浮出名字
 * 参考：remotion-templates 的 intro-line-draw-emblem 思路
 *
 * 说明：这里的图形是通用几何标，不是任何第三方商标；要换成自己的 logo
 * 就把 paths 换成自己的 SVG path。
 */
const PATHS: Record<string, string[]> = {
  emblem: [
    'M 300 60 L 540 190 L 540 450 L 300 580 L 60 450 L 60 190 Z',
    'M 300 170 L 450 250 L 450 390 L 300 470 L 150 390 L 150 250 Z',
    'M 300 280 L 360 315 L 360 385 L 300 420 L 240 385 L 240 315 Z',
  ],
  triangle: ['M 300 80 L 540 500 L 60 500 Z', 'M 300 210 L 420 430 L 180 430 Z'],
  hex: ['M 300 80 L 500 190 L 500 410 L 300 520 L 100 410 L 100 190 Z', 'M 300 180 L 400 235 L 400 365 L 300 420 L 200 365 L 200 235 Z'],
};

export const T115LineDrawLogo: React.FC<T115Props> = ({ shapes = 'emblem', name, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const paths = PATHS[shapes] ?? PATHS.emblem;
  const total = paths.length;
  const perPath = 22;

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: sp(3),
      }}
    >
      <svg width={600} height={600} viewBox="0 0 600 640">
        {paths.map((d, i) => {
          const p = E.out(Math.min(1, Math.max(0, (frame - i * perPath) / perPath)));
          return (
            <path
              key={i}
              d={d}
              fill={i === 0 ? 'rgba(99,91,255,0.10)' : 'none'}
              stroke={i === 2 ? palette.accentSoft : palette.accent}
              strokeWidth={4}
              strokeLinejoin="round"
              strokeDasharray={2000}
              strokeDashoffset={2000 * (1 - p)}
              opacity={i === 0 ? 1 : 0.9}
            />
          );
        })}
      </svg>
      {name ? (
        <div
          style={{
            opacity: E.out(Math.min(1, Math.max(0, (frame - total * perPath - 4) / 18))),
            fontFamily: font.sans,
            fontSize: type.l,
            fontWeight: 740,
            color: palette.ink,
            letterSpacing: '-0.03em',
          }}
        >
          {name}
        </div>
      ) : null}
      {sub ? (
        <div
          style={{
            opacity: E.out(Math.min(1, Math.max(0, (frame - total * perPath - 14) / 18))),
            fontFamily: font.mono,
            fontSize: type.small,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T115_LABEL = '线条描出标志';
export const T115_USE = ['logo', 'intro', 'brand'];
export const T115_DESC = '几何线条逐笔描出，描完浮出名字和副标，做片头/栏目头';
