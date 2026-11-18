import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { palette } from './kit';

/**
 * 背景：真实影像重度虚化
 *
 * 为什么是这个做法：
 *   做「渐变色 + 光晕」是中间态——既不是纯黑极简，也不是真实影像，两边不靠，所以显廉价。
 *   电影和高端广告的通用做法是浅景深：主体清晰，背后是虚化的真实场景。
 *   观众感到"高级"，本质上是背后有真实的东西，而不是因为渐变得好看。
 *
 * 所以背景不放抽象渐变，放真实界面/录屏，重度虚化 + 压暗。
 * 这样每个抽象画面背后都有一层"真实世界的影子"。
 */
export const Backdrop: React.FC<{
  /** 真实素材：图片或视频路径（public 下） */
  src?: string;
  /** 视频从第几秒开始 */
  startFrom?: number;
  /** 虚化强度，默认 70 */
  blur?: number;
  /** 压暗程度，0.6 很暗、0.85 几乎看不见 */
  dim?: number;
  /** 素材跑偏了就换一下位置 */
  scale?: number;
}> = ({ src, startFrom = 0, blur = 80, dim = 0.93, scale = 1.18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVideo = src?.endsWith('.mp4');

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: 'hidden', zIndex: -1 }}>
      {src ? (
        <AbsoluteFill
          style={{
            transform: `scale(${scale})`,
            filter: `blur(${blur}px) saturate(1.25) brightness(0.9)`,
          }}
        >
          {isVideo ? (
            <OffthreadVideo
              src={staticFile(src)}
              startFrom={Math.round(startFrom * fps)}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Img
              src={staticFile(src)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </AbsoluteFill>
      ) : null}

      {/* 压暗，保证前景字能读 */}
      <AbsoluteFill style={{ background: `rgba(10,10,14,${dim})` }} />

      {/* 一层极淡的纵向渐变，让上下有明暗差，不是死平 */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,14,0.45) 0%, rgba(10,10,14,0) 34%, rgba(10,10,14,0) 66%, rgba(10,10,14,0.55) 100%)',
        }}
      />

      {/* 噪点，去掉虚化带来的塑料感 */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
      />
    </AbsoluteFill>
  );
};
