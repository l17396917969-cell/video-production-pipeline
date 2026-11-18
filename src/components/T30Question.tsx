import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, springIn, type } from '../kit';
import { Panel } from './_base';

export type T30Props = { question: string; sub?: string };

/**
 * T30 · 大问句
 * 用途：开场抛问题，比陈述句更能抓住人
 * 画面：问句很大，逐行浮起；问号用强调色并轻微放大
 */
export const T30Question: React.FC<T30Props> = ({ question, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pQ = springIn(frame, fps, 2, 22);
  const pS = springIn(frame, fps, 16, 20);
  const mark = 1 + 0.06 * Math.sin(frame / 10);

  const [head, tail] = question.endsWith('？')
    ? [question.slice(0, -1), '？']
    : question.endsWith('?')
      ? [question.slice(0, -1), '?']
      : [question, ''];

  return (
    <Panel gap={4}>
      <div
        style={{
          ...riseIn(pQ, 20),
          opacity: fade(pQ),
          fontFamily: font.sans,
          fontSize: type.xl,
          fontWeight: 700,
          color: palette.ink,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
        }}
      >
        {head}
        {tail ? (
          <span style={{ color: palette.accent, display: 'inline-block', transform: `scale(${mark})` }}>
            {tail}
          </span>
        ) : null}
      </div>
      {sub ? (
        <div
          style={{
            opacity: fade(pS),
            fontFamily: font.sans,
            fontSize: type.body,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '70%',
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      ) : null}
    </Panel>
  );
};

export const T30_LABEL = '大问句';
export const T30_USE = ['opening', 'hook', 'question'];
export const T30_DESC = '一句巨大的问话，问号用强调色轻微呼吸，下面可跟一行补充';
