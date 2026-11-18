import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T68Props = {
  leftTitle: string;
  left: string[];
  rightTitle: string;
  right: string[];
  verdict?: string;
};

/**
 * T68 · 配置对比
 * 用途：两个配置文件、两种做法并排看
 * 画面：左右两个代码块，差异行用不同颜色标出
 */
export const T68ConfigCompare: React.FC<T68Props> = ({ leftTitle, left, rightTitle, right, verdict }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const block = (title: string, lines: string[], tint: string, delay: number) => {
    const p = springIn(frame, fps, delay, 20);
    return (
      <div style={{ flex: 1, opacity: fade(p), transform: `translateY(${(1 - p) * 16}px)` }}>
        <div style={{ fontFamily: font.mono, fontSize: type.micro, color: tint, marginBottom: sp(1.5) }}>
          {title}
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${tint}44`,
            borderRadius: 10,
            padding: sp(2),
          }}
        >
          {lines.map((l, i) => (
            <div
              key={i}
              style={{ fontFamily: font.mono, fontSize: type.small, lineHeight: 1.8, color: 'rgba(255,255,255,0.75)' }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Panel gap={3}>
      <div style={{ display: 'flex', gap: sp(4) }}>
        {block(leftTitle, left, palette.danger, 0)}
        {block(rightTitle, right, palette.ok, 10)}
      </div>
      {verdict ? (
        <div
          style={{
            opacity: fade(springIn(frame, fps, 26, 18)),
            fontFamily: font.sans,
            fontSize: type.body,
            color: palette.ink,
            paddingLeft: sp(1),
          }}
        >
          {verdict}
        </div>
      ) : null}
    </Panel>
  );
};

export const T68_LABEL = '配置对比';
export const T68_USE = ['code', 'compare', 'config'];
export const T68_DESC = '左右两个配置块并排，左边红框右边绿框，底部给一句结论';
