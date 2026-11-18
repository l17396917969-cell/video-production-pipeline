import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T34Props = { badge: string; title: string; sub?: string };

/**
 * T34 · 标签标题
 * 用途：栏目化视频的固定开场——上面一个胶囊标签，下面是大标题
 * 画面：胶囊从左滑入并轻微回弹，标题随后上浮
 */
export const T34BadgeTitle: React.FC<T34Props> = ({ badge, title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pB = springIn(frame, fps, 0, 18);
  const pT = springIn(frame, fps, 10, 22);
  const pS = springIn(frame, fps, 22, 18);

  return (
    <Panel gap={3}>
      <div
        style={{
          opacity: fade(pB),
          transform: `translateX(${(1 - pB) * -30}px)`,
          alignSelf: 'flex-start',
          padding: `${sp(1)}px ${sp(2.2)}px`,
          background: palette.accent,
          borderRadius: sp(9),
          fontFamily: font.mono,
          fontSize: type.micro,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: palette.paper,
        }}
      >
        {badge}
      </div>
      <div
        style={{
          ...riseIn(pT, 20),
          opacity: fade(pT),
          fontFamily: font.sans,
          fontSize: type.xl,
          fontWeight: 700,
          color: palette.ink,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{ opacity: fade(pS), fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}
        >
          {sub}
        </div>
      ) : null}
    </Panel>
  );
};

export const T34_LABEL = '标签标题';
export const T34_USE = ['opening', 'title', 'series'];
export const T34_DESC = '胶囊标签从左滑入，大标题上浮，适合栏目化的固定开场';
