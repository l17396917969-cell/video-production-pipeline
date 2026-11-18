import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, palette, sp, type , media } from '../kit';

export type T22Props = {
  src: string;
  /** 从源视频第几秒开始播（注意：Remotion 的 startFrom 单位是帧，这里已替你换算） */
  startFrom?: number;
  label?: string;
  /** 播放速度，1 为原速 */
  speed?: number;
  /** 是否加一圈浏览器边框 */
  chrome?: boolean;
};

/**
 * T22 · 真实录屏
 * 用途：把录下来的真实操作直接放进片子——这是最不可能有"AI 感"的画面
 * 画面：录屏铺满，可带窗口边框和角标；前 0.6 秒轻微淡入，避免硬切
 * 说明：src 是 public/ 下的路径，如 "video/t3-live.mp4"
 */
export const T22Live: React.FC<T22Props> = ({
  src,
  startFrom = 0,
  label,
  speed = 1,
  chrome = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = Math.min(1, frame / Math.max(1, fps * 0.6));

  return (
    <AbsoluteFill style={{ background: media.black, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: chrome ? sp(5) : 0,
          borderRadius: chrome ? sp(1.5) : 0,
          overflow: 'hidden',
          border: chrome ? '1px solid rgba(255,255,255,0.12)' : 'none',
          opacity,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(startFrom * fps)}
          playbackRate={speed}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {label ? (
        <div
          style={{
            position: 'absolute',
            left: sp(6),
            top: sp(6),
            padding: `${sp(1.2)}px ${sp(2.5)}px`,
            background: media.badgeBg,
            border: `1px solid ${media.border}`,
            borderRadius: 10,
            color: media.white,
            fontFamily: font.mono,
            fontSize: type.micro,
            letterSpacing: '0.04em',
            opacity,
          }}
        >
          <span style={{ color: palette.danger, marginRight: sp(1) }}>●</span>
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T22_LABEL = '真实录屏';
export const T22_USE = ['recording', 'demo', 'shots'];
export const T22_DESC = '把录好的真实操作直接铺进画面，可带窗口边框和录制角标，支持指定起始秒数和倍速';
