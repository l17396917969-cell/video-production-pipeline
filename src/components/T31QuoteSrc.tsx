import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T31Props = { text: string; source?: string; avatarText?: string };

/**
 * T31 · 带出处的引文
 * 用途：引用官方文档、别人说过的话——出处比话本身更值钱
 * 画面：大引号在左上，引文逐行浮起，出处带一个圆形头像位
 */
export const T31QuoteSrc: React.FC<T31Props> = ({ text, source, avatarText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pMark = springIn(frame, fps, 0, 16);
  const pText = springIn(frame, fps, 8, 24);
  const pSrc = springIn(frame, fps, 24, 18);

  return (
    <Panel gap={4}>
      <div
        style={{
          opacity: fade(pMark),
          fontFamily: font.sans,
          fontSize: type.huge,
          lineHeight: 0.7,
          color: palette.accent,
          height: sp(9),
        }}
      >
        “
      </div>
      <div
        style={{
          ...riseIn(pText, 18),
          opacity: fade(pText),
          fontFamily: font.sans,
          fontSize: type.l,
          fontWeight: 560,
          color: palette.ink,
          lineHeight: 1.4,
          maxWidth: '84%',
        }}
      >
        {text}
      </div>
      {source ? (
        <div
          style={{
            opacity: fade(pSrc),
            display: 'flex',
            alignItems: 'center',
            gap: sp(1.5),
            marginTop: sp(2),
          }}
        >
          {avatarText ? (
            <div
              style={{
                width: sp(5),
                height: sp(5),
                borderRadius: sp(2.5),
                background: palette.accent,
                color: palette.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: font.sans,
                fontSize: type.small,
                fontWeight: 700,
              }}
            >
              {avatarText}
            </div>
          ) : null}
          <div style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.55)' }}>
            {source}
          </div>
        </div>
      ) : null}
    </Panel>
  );
};

export const T31_LABEL = '出处引文';
export const T31_USE = ['quote', 'evidence', 'explain'];
export const T31_DESC = '大引号 + 一句引文 + 圆形头像位和出处，用来引用官方原话或别人的判断';
