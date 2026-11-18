import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type , media } from '../kit';

export type T19Props = {
  src: string;
  title?: string;
  subtitle?: string;
  /** 推镜方向：in 缓慢推进，out 缓慢拉远，none 不动 */
  motion?: 'in' | 'out' | 'none';
  /** 底部压暗，放标题用 */
  scrim?: boolean;
};

/**
 * T19 · 全屏实拍
 * 用途：真实截图、真实录屏帧、官网首屏——画面的主体是图像本身
 * 画面：整张图铺满，带缓慢推近（Ken Burns），底部渐变压暗后浮出标题
 * 说明：src 是 public/ 下的相对路径，如 "shots/t3-home.png"
 */
export const T19FullShot: React.FC<T19Props> = ({
  src,
  title,
  subtitle,
  motion = 'in',
  scrim = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = Math.min(1, frame / Math.max(1, durationInFrames - 1));

  // Ken Burns：in 从 1.06 收到 1.0，out 反过来
  const scale =
    motion === 'none' ? 1 : motion === 'in' ? 1.06 - 0.06 * p : 1.0 + 0.06 * p;

  const pTitle = springIn(frame, fps, 6, 24);
  const pSub = springIn(frame, fps, 16, 22);

  return (
    <AbsoluteFill style={{ background: media.black, overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />

      {scrim ? (
        <AbsoluteFill
          style={{
            background:
              media.scrimBottom,
          }}
        />
      ) : null}

      {title ? (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            padding: `0 ${sp(10)}px ${sp(8)}px`,
          }}
        >
          <div
            style={{
              ...riseIn(pTitle, 22),
              fontFamily: font.sans,
              fontSize: type.m,
              fontWeight: 620,
              color: media.white,
              lineHeight: 1.25,
              maxWidth: sp(150),
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                opacity: fade(pSub),
                fontFamily: font.sans,
                fontSize: type.small,
                color: 'rgba(255,255,255,0.72)',
                marginTop: sp(1.5),
                maxWidth: sp(140),
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const T19_LABEL = '全屏实拍';
export const T19_USE = ['shots', 'recording', 'opening'];
export const T19_DESC = '真实截图或录屏帧铺满整屏，带缓慢推近，底部压暗浮出标题';
