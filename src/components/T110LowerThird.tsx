import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T110Props = { kicker: string; title: string; sub?: string; side?: 'left' | 'right' };

/**
 * T110 · 下三分之一
 * 用途：介绍人物、来源、出处——电视新闻那套，但更克制
 * 画面：左下角一条竖线先长出来，kicker 和标题依次滑入
 * 参考：remotion-templates 的 lower-third-underline-kicker 思路
 */
export const T110LowerThird: React.FC<T110Props> = ({ kicker, title, sub, side = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pLine = E.out(Math.min(1, frame / (fps * 0.5)));
  const pText = E.out(Math.min(1, Math.max(0, (frame - fps * 0.35) / (fps * 0.6))));
  const align = side === 'left' ? 'flex-start' : 'flex-end';

  return (
    <AbsoluteFill
      style={{
        alignItems: align,
        justifyContent: 'flex-end',
        paddingBottom: sp(11),
        paddingLeft: side === 'left' ? sp(8) : 0,
        paddingRight: side === 'right' ? sp(8) : 0,
      }}
    >
      <div style={{ display: 'flex', gap: sp(2), alignItems: 'stretch' }}>
        <div
          style={{
            width: 3,
            height: `${pLine * 100}%`,
            background: palette.accent,
            minHeight: sp(9),
            alignSelf: 'stretch',
          }}
        />
        <div style={{ transform: `translateX(${(1 - pText) * -18}px)`, opacity: pText }}>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: type.micro,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: palette.accentSoft,
              marginBottom: sp(0.8),
            }}
          >
            {kicker}
          </div>
          <div style={{ fontFamily: font.sans, fontSize: type.m, fontWeight: 680, color: palette.ink, lineHeight: 1.1 }}>
            {title}
          </div>
          {sub ? (
            <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.5)', marginTop: sp(0.8) }}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T110_LABEL = '下三分之一';
export const T110_USE = ['lower-third', 'source', 'profile'];
export const T110_DESC = '左下角竖线长出来，kicker 和标题滑入，介绍来源或人物';
