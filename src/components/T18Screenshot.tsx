import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, themeOf, type } from '../kit';

export type T18Props = {
  src?: string;
  label?: string;
  caption?: string;
  theme?: 'dark' | 'light';
};

/**
 * T18 · 截图框
 * 用途：放真实截图、放录屏关键帧、放别人的界面
 * 画面：带圆点窗口栏的框落下，图片从 0.96 缩放归位
 * 说明：src 是 public/ 下的相对路径（如 "shots/s01.png"）
 */
export const T18Screenshot: React.FC<T18Props> = ({
  src,
  label = 'screenshot',
  caption,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const p = springIn(frame, fps, 0, 24);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(2),
      }}
    >
      <div
        style={{
          opacity: fade(p),
          transform: `scale(${0.96 + p * 0.04})`,
          width: '100%',
          maxWidth: sp(190),
          borderRadius: sp(2),
          overflow: 'hidden',
          border: `1px solid ${th.hairline}`,
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sp(1),
            padding: `${sp(1.5)}px ${sp(2.5)}px`,
            borderBottom: `1px solid ${th.hairline}`,
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 5, background: palette.windowDot[0] }} />
          <span style={{ width: 10, height: 10, borderRadius: 5, background: palette.windowDot[1] }} />
          <span style={{ width: 10, height: 10, borderRadius: 5, background: palette.windowDot[2] }} />
          <span
            style={{
              marginLeft: sp(2),
              fontFamily: font.mono,
              fontSize: type.micro,
              color: th.muted,
            }}
          >
            {label}
          </span>
        </div>

        {src ? (
          <Img
            src={staticFile(src)}
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              height: sp(90),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: font.mono,
              fontSize: type.small,
              color: th.muted,
              background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            把截图放到 public/{label}.png，src 填 {label}.png
          </div>
        )}
      </div>

      {caption ? (
        <div
          style={{
            opacity: fade(p),
            fontFamily: font.sans,
            fontSize: type.small,
            color: th.muted,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T18_LABEL = '截图框';
export const T18_USE = ['shots', 'recording', 'explain'];
export const T18_DESC = '带浏览器圆点栏的截图容器落下，图片轻微缩放归位，下方可带一句说明';
