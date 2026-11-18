import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T106Props = {
  src: string;
  region: { x: number; y: number; w: number; h: number };
  label?: string;
  dim?: number;
};

/**
 * T106 · 括号聚焦
 * 用途：比方框更轻的强调——四个角括号收拢，不压暗整屏
 * 画面：四个 L 形括号从外向内收拢到目标区域，标签随后出现
 * 参考：remotion-templates 的 ui-annotations-bracket-focus 思路
 */
export const T106BracketFocus: React.FC<T106Props> = ({ src, region, label, dim = 0.35 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = E.out(Math.min(1, frame / (fps * 0.9)));
  const arm = sp(4) * (0.6 + p * 0.4);
  const inset = (1 - p) * 26;

  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const style: React.CSSProperties = {
      position: 'absolute',
      width: arm,
      height: arm,
      borderColor: palette.accent,
      borderStyle: 'solid',
      borderWidth: 0,
    };
    if (pos === 'tl') Object.assign(style, { left: -inset, top: -inset, borderLeftWidth: 3, borderTopWidth: 3 });
    if (pos === 'tr') Object.assign(style, { right: -inset, top: -inset, borderRightWidth: 3, borderTopWidth: 3 });
    if (pos === 'bl') Object.assign(style, { left: -inset, bottom: -inset, borderLeftWidth: 3, borderBottomWidth: 3 });
    if (pos === 'br') Object.assign(style, { right: -inset, bottom: -inset, borderRightWidth: 3, borderBottomWidth: 3 });
    return <div style={style} />;
  };

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - dim * p }} />
      <div
        style={{
          position: 'absolute',
          left: `${region.x}%`,
          top: `${region.y}%`,
          width: `${region.w}%`,
          height: `${region.h}%`,
        }}
      >
        {corner('tl')}
        {corner('tr')}
        {corner('bl')}
        {corner('br')}
      </div>
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: `${region.x}%`,
            // 放在框的上方，不压住界面里的真实内容
            top: `calc(${region.y}% - ${sp(4)}px)`,
            fontFamily: font.mono,
            fontSize: type.small,
            color: palette.accentSoft,
            opacity: p,
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T106_LABEL = '括号聚焦';
export const T106_USE = ['annotate', 'screenshot', 'focus'];
export const T106_DESC = '四个 L 形角括号从外向内收拢到目标区域，比方框更轻';
