import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T29Props = { index: number | string; title: string; kicker?: string };

/**
 * T29 · 章节页
 * 用途：长片分段，给观众一个"重新集中注意力"的拍子
 * 画面：巨大的章节号在左，标题在右，中间一条竖线生长
 */
export const T29Chapter: React.FC<T29Props> = ({ index, title, kicker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pNum = springIn(frame, fps, 2, 20);
  const pLine = springIn(frame, fps, 10, 18);
  const pTitle = springIn(frame, fps, 14, 20);

  return (
    <Panel kicker={kicker} gap={3}>
      <div style={{ display: 'flex', alignItems: 'center', gap: sp(5) }}>
        <div
          style={{
            opacity: fade(pNum),
            fontFamily: font.sans,
            fontSize: type.huge,
            fontWeight: 720,
            color: palette.accent,
            lineHeight: 0.9,
            letterSpacing: '-0.06em',
          }}
        >
          {index}
        </div>
        <div
          style={{
            width: 3,
            height: sp(22) * pLine,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 2,
          }}
        />
        <div
          style={{
            ...riseIn(pTitle, 18),
            opacity: fade(pTitle),
            fontFamily: font.sans,
            fontSize: type.l,
            fontWeight: 640,
            color: palette.ink,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      </div>
    </Panel>
  );
};

export const T29_LABEL = '章节页';
export const T29_USE = ['chapter', 'transition', 'structure'];
export const T29_DESC = '巨大章节号 + 竖线生长 + 标题，给长片换气的节点';
