import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T37Props = { before: string; highlight: string; after?: string; sub?: string };

/**
 * T37 · 划线强调
 * 用途：一句话里有一个词非强调不可时，给它画一条线
 * 画面：整句浮起，强调词下方的高亮条从左向右生长，末尾轻微超出
 */
export const T37UnderlineTitle: React.FC<T37Props> = ({ before, highlight, after, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pText = springIn(frame, fps, 2, 20);
  const pLine = springIn(frame, fps, 16, 22);
  const pSub = springIn(frame, fps, 26, 18);

  return (
    <Panel gap={3}>
      <div
        style={{
          opacity: fade(pText),
          fontFamily: font.sans,
          fontSize: type.l,
          fontWeight: 660,
          color: palette.ink,
          lineHeight: 1.35,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: '0.18em',
        }}
      >
        <span>{before}</span>
        <span style={{ position: 'relative', color: palette.accentSoft }}>
          {highlight}
          <span
            style={{
              position: 'absolute',
              left: 0,
              bottom: -sp(0.5),
              height: 6,
              width: `${pLine * 104}%`,
              background: palette.accent,
              borderRadius: 3,
              opacity: 0.85,
            }}
          />
        </span>
        <span>{after}</span>
      </div>
      {sub ? (
        <div style={{ opacity: fade(pSub), fontFamily: font.sans, fontSize: type.body, color: 'rgba(255,255,255,0.5)' }}>
          {sub}
        </div>
      ) : null}
    </Panel>
  );
};

export const T37_LABEL = '划线强调';
export const T37_USE = ['title', 'emphasis', 'explain'];
export const T37_DESC = '一句话里指定一个词，用强调色并从左向右画一条高亮线';
