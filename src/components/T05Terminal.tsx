import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T05Props = {
  title?: string;
  command: string;
  outputs: string[];
  theme?: 'dark' | 'light';
};

/**
 * T05 · 终端打字
 * 用途：讲 GitHub 项目、命令行工具、部署过程、代码报错
 * 画面：窗口落下 → 命令逐字打出 → 输出行逐条出现 → 光标闪烁
 */
export const T05Terminal: React.FC<T05Props> = ({
  title = 'terminal',
  command,
  outputs,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pWin = springIn(frame, fps, 0, 20);
  const typeStart = 14;
  const typeEnd = typeStart + command.length * 1.1;
  const typed = Math.floor(
    interpolate(frame, [typeStart, typeEnd], [0, command.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: E.inOut,
    }),
  );

  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity: fade(pWin),
          transform: `translateY(${(1 - pWin) * 32}px)`,
          width: '100%',
          maxWidth: sp(180),
          borderRadius: sp(2),
          border: `1px solid ${th.hairline}`,
          background: theme === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sp(1),
            padding: `${sp(2)}px ${sp(3)}px`,
            borderBottom: `1px solid ${th.hairline}`,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 6, background: palette.windowDot[0] }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: palette.windowDot[1] }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: palette.windowDot[2] }} />
          <span
            style={{
              marginLeft: sp(2),
              fontFamily: font.mono,
              fontSize: type.micro,
              color: th.muted,
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ padding: sp(4), fontFamily: font.mono, fontSize: type.s, lineHeight: 1.7 }}>
          <div style={{ color: th.ink }}>
            <span style={{ color: palette.accent, marginRight: sp(1) }}>$</span>
            {command.slice(0, typed)}
            <span
              style={{
                display: 'inline-block',
                width: '0.55em',
                height: '1.05em',
                background: cursorOn ? palette.accent : 'transparent',
                verticalAlign: 'text-bottom',
                marginLeft: 2,
              }}
            />
          </div>

          {outputs.map((o, i) => {
            const po = springIn(frame, fps, typeEnd + 4 + i * 7, 14);
            return (
              <div
                key={i}
                style={{
                  opacity: po,
                  transform: `translateX(${(1 - po) * 10}px)`,
                  color: i === outputs.length - 1 ? palette.ok : th.muted,
                }}
              >
                {o}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T05_LABEL = '终端打字';
export const T05_USE = ['recording', 'explain', 'code'];
export const T05_DESC = '终端窗口下落，命令逐字打出，输出行逐条出现，末尾光标闪烁';
