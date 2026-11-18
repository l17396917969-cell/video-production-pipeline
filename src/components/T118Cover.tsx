import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, type } from '../kit';

export type T118Props = {
  /** 背景图：真实界面截图，压暗后当底 */
  src?: string;
  /** 主标题，封面上的大字 */
  headline: string;
  /** 副标题，一行就够 */
  sub?: string;
  /** 角标：栏目标签 */
  kicker?: string;
  /** 数字亮点，可选。有它就单独放大 */
  number?: string;
  variant?: 'left' | 'center' | 'bottom';
};

/**
 * T118 · 封面
 * 用途：给三个平台出统一封面图
 *
 * 为什么单独做一个组件：封面是唯一"决定有没有人点"的画面，
 * 它不能是视频里某一帧顺手截的——构图、字号、留白都要按封面重新排。
 */
export const T118Cover: React.FC<T118Props> = ({
  src,
  headline,
  sub,
  kicker,
  number,
  variant = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = width < height;
  const headlineSize = vertical ? 96 : 132;
  const p = springIn(frame, fps, 2, 18);

  const align = variant === 'center' ? 'center' : 'flex-start';
  const justify = variant === 'bottom' ? 'flex-end' : 'center';

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden' }}>
      {/* 真实画面打底，压暗到能压住大字 */}
      {src ? (
        <Img
          src={staticFile(src)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.26 }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background:
            variant === 'center'
              ? 'radial-gradient(ellipse at 50% 45%, rgba(20,20,26,0.55) 0%, rgba(20,20,26,0.92) 70%)'
              : 'linear-gradient(105deg, rgba(20,20,26,0.96) 0%, rgba(20,20,26,0.78) 48%, rgba(20,20,26,0.35) 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          padding: sp(9),
          display: 'flex',
          flexDirection: 'column',
          alignItems: align,
          justifyContent: justify,
          gap: sp(2.5),
        }}
      >
        {kicker ? (
          <div
            style={{
              fontFamily: font.mono,
              fontSize: type.body,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: palette.accentSoft,
              opacity: fade(p),
            }}
          >
            {kicker}
          </div>
        ) : null}

        <div
          style={{
            fontFamily: font.sans,
            // 封面字必须大，缩略图里也要能读出来
            fontSize: headlineSize,
            fontWeight: 780,
            lineHeight: 1.06,
            letterSpacing: '-0.045em',
            color: palette.paper,
            textAlign: variant === 'center' ? 'center' : 'left',
            maxWidth: variant === 'center' ? '86%' : '76%',
            opacity: fade(p),
            transform: `translateY(${(1 - p) * 24}px)`,
            textShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}
        >
          {headline}
        </div>

        {number ? (
          <div
            style={{
              fontFamily: font.sans,
              fontSize: vertical ? 76 : 96,
              fontWeight: 800,
              color: palette.accent,
              letterSpacing: '-0.04em',
              opacity: fade(p),
            }}
          >
            {number}
          </div>
        ) : null}

        {sub ? (
          <div
            style={{
              fontFamily: font.sans,
              fontSize: vertical ? 40 : 46,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.72)',
              textAlign: variant === 'center' ? 'center' : 'left',
              maxWidth: '80%',
              opacity: fade(E.out(Math.min(1, Math.max(0, (p - 0.4) / 0.6)))),
            }}
          >
            {sub}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const T118_LABEL = '封面';
export const T118_USE = ['cover', 'thumbnail', 'publish'];
export const T118_DESC = '真实画面压暗打底 + 超大字标题，横竖版通用';
