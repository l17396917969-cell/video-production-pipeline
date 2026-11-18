import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T02Props = {
  leftLabel: string;
  leftItems: string[];
  rightLabel: string;
  rightItems: string[];
  verdict?: string;
  theme?: 'dark' | 'light';
};

/**
 * T02 · 左右对比
 * 用途：A vs B、以前和现在、两个工具、两种方案
 * 画面：左面板从左进、右面板从右进，列表逐条出现，最后落结论
 */
export const T02Contrast: React.FC<T02Props> = ({
  leftLabel,
  leftItems,
  rightLabel,
  rightItems,
  verdict,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pLeft = springIn(frame, fps, 0, 24);
  const pRight = springIn(frame, fps, 8, 24);
  const pVerdict = springIn(frame, fps, 26 + Math.max(leftItems.length, rightItems.length) * 6, 22);

  const panel = (side: 'l' | 'r', label: string, items: string[], p: number, highlight: boolean) => (
    <div
      style={{
        opacity: fade(p),
        transform: `translateX(${(1 - p) * (side === 'l' ? -48 : 48)}px)`,
        flex: 1,
        border: `1px solid ${highlight ? palette.accent : th.hairline}`,
        background: highlight ? palette.accentDim : 'transparent',
        borderRadius: sp(3),
        padding: sp(5),
        display: 'flex',
        flexDirection: 'column',
        gap: sp(3),
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: type.small,
          letterSpacing: '0.1em',
          color: highlight ? palette.accent : th.muted,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {items.map((it, i) => {
        const pi = springIn(frame, fps, 14 + i * 6, 16);
        return (
          <div
            key={i}
            style={{
              ...riseIn(pi, 12),
              fontFamily: font.sans,
              fontSize: type.s,
              color: th.ink,
              lineHeight: 1.4,
              display: 'flex',
              gap: sp(2),
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: highlight ? palette.accent : th.muted, fontSize: type.small }}>—</span>
            <span>{it}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(10),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(4),
      }}
    >
      <div style={{ display: 'flex', gap: sp(4), alignItems: 'stretch' }}>
        {panel('l', leftLabel, leftItems, pLeft, false)}
        {panel('r', rightLabel, rightItems, pRight, true)}
      </div>

      {verdict ? (
        <div
          style={{
            ...riseIn(pVerdict, 16),
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 560,
            color: th.ink,
            textAlign: 'center',
            paddingTop: sp(2),
          }}
        >
          {verdict}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T02_LABEL = '左右对比';
export const T02_USE = ['contrast', 'explain'];
export const T02_DESC = '左右两个面板并排对比，条目逐条出现，右侧高亮，底部落一句结论';
