import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T84Props = { keys: string[]; action?: string; pressed?: boolean };

/**
 * T84 · 快捷键
 * 用途：讲"这一步只要按一个键就完了"
 * 画面：键帽依次落下，最后一起下压一下，右侧写它触发什么
 */
export const T84KeyboardKeys: React.FC<T84Props> = ({ keys, action, pressed = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const press = pressed && frame > fps * 1.1 ? 4 : 0;

  return (
    <AbsoluteFill
      style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: sp(4) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: sp(1.5) }}>
        {keys.map((k, i) => {
          const p = springIn(frame, fps, i * 4, 16);
          return (
            <React.Fragment key={k}>
              {i > 0 ? (
                <span style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.3)' }}>+</span>
              ) : null}
              <div
                style={{
                  opacity: fade(p),
                  transform: `translateY(${(1 - p) * -16 + press}px)`,
                  minWidth: sp(8),
                  padding: `${sp(1.4)}px ${sp(2)}px`,
                  background: `linear-gradient(180deg, ${palette.key}, ${palette.windowBar})`,
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderBottom: `3px solid rgba(0,0,0,0.6)`,
                  borderRadius: 10,
                  fontFamily: font.mono,
                  fontSize: type.s,
                  fontWeight: 700,
                  color: palette.ink,
                  textAlign: 'center',
                  boxShadow: `0 ${4 - press}px 0 rgba(255,255,255,0.08)`,
                }}
              >
                {k}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {action ? (
        <div
          style={{
            opacity: fade(springIn(frame, fps, 20, 18)),
            fontFamily: font.sans,
            fontSize: type.body,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {action}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T84_LABEL = '快捷键';
export const T84_USE = ['ui', 'shortcut', 'action'];
export const T84_DESC = '立体键帽依次落下，最后一起下压，右侧说明它触发什么';
