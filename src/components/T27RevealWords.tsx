import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, springIn, type } from '../kit';
import { Panel } from './_base';

export type T27Props = { text: string; kicker?: string; accentWords?: number[] };

/**
 * T27 · 逐词揭示
 * 用途：一句有分量的话，让每个词依次落位
 * 画面：按空格切词，每个词带轻微上浮依次出现；指定下标的词用强调色
 */
export const T27RevealWords: React.FC<T27Props> = ({ text, kicker, accentWords = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/(\s+)/).filter((w) => w.trim());

  return (
    <Panel kicker={kicker}>
      <div
        style={{
          fontFamily: font.sans,
          fontSize: type.m,
          fontWeight: 640,
          lineHeight: 1.35,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.28em',
        }}
      >
        {words.map((w, i) => {
          const p = springIn(frame, fps, 4 + i * 5, 18);
          return (
            <span
              key={`${w}-${i}`}
              style={{
                ...riseIn(p, 14),
                opacity: fade(p),
                color: accentWords.includes(i) ? palette.accentSoft : palette.ink,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </Panel>
  );
};

export const T27_LABEL = '逐词揭示';
export const T27_USE = ['opening', 'title', 'quote'];
export const T27_DESC = '一句话按词依次浮起，可指定几个词用强调色';
