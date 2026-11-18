import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';

export type T35Props = { title: string; sub?: string; cta?: string; handle?: string };

/**
 * T35 · 结尾卡
 * 用途：片尾收口——一句结论 + 一个行动指令
 * 画面：聚光灯从中心扩散，标题浮起，底部一行小字
 */
export const T35EndCard: React.FC<T35Props> = ({ title, sub, cta, handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pGlow = Math.min(1, frame / (fps * 0.8));
  const pT = springIn(frame, fps, 8, 24);
  const pS = springIn(frame, fps, 20, 20);

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(2.5),
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(99,91,255,${0.22 * pGlow}) 0%, rgba(0,0,0,0) 55%)`,
        }}
      />
      <div
        style={{
          ...riseIn(pT, 18),
          opacity: fade(pT),
          fontFamily: font.sans,
          fontSize: type.xl,
          fontWeight: 700,
          color: palette.ink,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            opacity: fade(pS),
            fontFamily: font.sans,
            fontSize: type.body,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: '70%',
          }}
        >
          {sub}
        </div>
      ) : null}
      {cta ? (
        <div
          style={{
            opacity: fade(pS),
            marginTop: sp(3),
            padding: `${sp(1.4)}px ${sp(3)}px`,
            border: `1px solid ${palette.accent}`,
            borderRadius: sp(9),
            fontFamily: font.sans,
            fontSize: type.small,
            fontWeight: 600,
            color: palette.accentSoft,
          }}
        >
          {cta}
        </div>
      ) : null}
      {handle ? (
        <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.32)' }}>
          {handle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T35_LABEL = '结尾卡';
export const T35_USE = ['ending', 'cta', 'outro'];
export const T35_DESC = '中心聚光灯扩散 + 结论句 + 行动指令胶囊，用来收口';
