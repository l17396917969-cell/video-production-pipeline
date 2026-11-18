import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, type } from '../kit';
import { Panel } from './_base';

export type T61Props = { left: string; right: string; overlap: string; title?: string };

/**
 * T61 · 韦恩图
 * 用途：重叠的部分才是关键——"既是 A 又是 B"
 * 画面：两个圆从两侧靠拢并交叠，交集区域高亮，中间写重叠的含义
 */
export const T61VennDiagram: React.FC<T61Props> = ({ left, right, overlap, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = Math.min(1, frame / (fps * 0.9));
  const R = 170;
  const gap = 110 * p;

  return (
    <Panel title={title} gap={1} align="center">
      <div style={{ position: 'relative', width: R * 2 + 240, height: R * 2 }}>
        <div
          style={{
            position: 'absolute',
            left: 120 - gap,
            top: 0,
            width: R * 2,
            height: R * 2,
            borderRadius: '50%',
            background: 'rgba(99,91,255,0.22)',
            border: `2px solid ${palette.accent}`,
            opacity: fade(p),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: R * 0.55,
          }}
        >
          <span style={{ fontFamily: font.sans, fontSize: type.body, fontWeight: 640, color: palette.ink }}>{left}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 120 + gap,
            top: 0,
            width: R * 2,
            height: R * 2,
            borderRadius: '50%',
            background: 'rgba(99,91,255,0.22)',
            border: `2px solid ${palette.accentSoft}`,
            opacity: fade(p),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: R * 0.55,
          }}
        >
          <span style={{ fontFamily: font.sans, fontSize: type.body, fontWeight: 640, color: palette.ink }}>{right}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -10,
            textAlign: 'center',
            opacity: fade(p),
            fontFamily: font.sans,
            fontSize: type.s,
            fontWeight: 700,
            color: palette.accentSoft,
          }}
        >
          {overlap}
        </div>
      </div>
    </Panel>
  );
};

export const T61_LABEL = '韦恩图';
export const T61_USE = ['structure', 'overlap', 'concept'];
export const T61_DESC = '两个圆从两侧靠拢交叠，交集下方标出重叠的含义';
