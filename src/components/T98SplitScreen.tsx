import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T98Props = { left: { title: string; body: string }; right: { title: string; body: string } };

/**
 * T98 · 左右分屏
 * 用途：两个东西并排讲——旧 vs 新、A 方案 vs B 方案
 * 画面：中缝先出现，左右两栏依次从各自一侧滑入
 */
export const T98SplitScreen: React.FC<T98Props> = ({ left, right }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pL = springIn(frame, fps, 0, 22);
  const pR = springIn(frame, fps, 6, 22);

  const pane = (data: { title: string; body: string }, p: number, dir: -1 | 1, accent: boolean) => (
    <div
      style={{
        flex: 1,
        opacity: fade(p),
        transform: `translateX(${(1 - p) * 40 * dir}px)`,
        padding: sp(6),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(2),
        background: accent ? 'rgba(99,91,255,0.07)' : 'transparent',
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: type.s,
          fontWeight: 680,
          color: accent ? palette.accentSoft : 'rgba(255,255,255,0.55)',
        }}
      >
        {data.title}
      </div>
      <div style={{ fontFamily: font.sans, fontSize: type.body, color: palette.ink, lineHeight: 1.55 }}>
        {data.body}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: palette.bg, flexDirection: 'row' }}>
      {pane(left, pL, -1, false)}
      <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', margin: `${sp(8)}px 0` }} />
      {pane(right, pR, 1, true)}
    </AbsoluteFill>
  );
};

export const T98_LABEL = '左右分屏';
export const T98_USE = ['compare', 'split', 'two-views'];
export const T98_DESC = '中缝分隔，左右两栏从两侧滑入，右侧带强调底色';
