import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T83Props = { target: string; tip: string; keyboard?: string };

/**
 * T83 · 提示气泡
 * 用途：讲某个按钮干嘛用的——比箭头更准
 * 画面：目标元素先出现，上方弹出气泡，带一个向下的三角
 */
export const T83Tooltip: React.FC<T83Props> = ({ target, tip, keyboard }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pT = springIn(frame, fps, 0, 16);
  const pB = springIn(frame, fps, 10, 18);

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            opacity: fade(pB),
            transform: `translateY(${(1 - pB) * 10}px)`,
            background: palette.surface3,
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 10,
            padding: `${sp(1.2)}px ${sp(2)}px`,
            fontFamily: font.sans,
            fontSize: type.small,
            color: palette.ink,
            marginBottom: sp(2),
            display: 'flex',
            alignItems: 'center',
            gap: sp(1.5),
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
          }}
        >
          {tip}
          {keyboard ? (
            <span
              style={{
                fontFamily: font.mono,
                fontSize: type.micro,
                padding: `2px ${sp(0.8)}px`,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              {keyboard}
            </span>
          ) : null}
          <span
            style={{
              position: 'absolute',
              bottom: -7,
              left: '50%',
              marginLeft: -7,
              width: 14,
              height: 14,
              background: palette.surface3,
              borderRight: '1px solid rgba(255,255,255,0.16)',
              borderBottom: '1px solid rgba(255,255,255,0.16)',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
        <div
          style={{
            opacity: fade(pT),
            padding: `${sp(1.4)}px ${sp(3)}px`,
            border: `1.5px solid ${palette.accent}`,
            borderRadius: 10,
            background: 'rgba(99,91,255,0.12)',
            fontFamily: font.sans,
            fontSize: type.body,
            fontWeight: 600,
            color: palette.ink,
          }}
        >
          {target}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T83_LABEL = '提示气泡';
export const T83_USE = ['ui', 'hint', 'explain'];
export const T83_DESC = '目标按钮上方弹出气泡，带小三角和可选快捷键';
