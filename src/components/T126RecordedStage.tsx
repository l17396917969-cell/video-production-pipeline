import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, fred } from '../kit';
import { Grain } from './VisualStack';

/**
 * 录屏镜头（世界级样板）
 *
 * 设计原则，来自 Apple / Linear / Stripe 的拆解：
 *   1. 一个画面只有一个摄影机。窗口本身位置尺寸完全固定，动的是镜头
 *   2. 推近时窗口边界纹丝不动，画面被裁在窗口里（不出血、不露底）
 *   3. 画面里没有任何外挂标注物。引导靠推近，说明靠旁白
 *   4. 一镜只讲一件事：建立 → 推近到那件事 → 停住让人读
 *
 * 结构只有两层，避免坐标系打架：
 *   外层窗口：绝对定位、固定尺寸、overflow hidden
 *   内层视频：scale + translate，焦点永远算在窗口中心
 *
 * 素材必须用大视口录制（如 3200×2000），不要用 deviceScaleFactor 叠加，
 * 那条路 Playwright 会把界面挤到左上角。
 */
export type Shot = {
  /** 第几秒开始推 */
  at: number;
  /** 取景点在素材里的相对位置 0–1 */
  x: number;
  y: number;
  /** 推到多少倍，1 就是不推 */
  zoom: number;
};

export type T126Props = {
  src: string;
  startFrom?: number;
  /** 窗口宽度占画布的比例 */
  widthRatio?: number;
  /** 推近序列 */
  shots?: Shot[];
  /** 推近耗时（秒） */
  zoomDuration?: number;
  /** 暗角强度 */
  vignette?: number;
};

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3.2);
};

const CANVAS_W = 1920;
const CANVAS_H = 1080;

/** 舞台色，全部从 kit 派生 */
const STAGE_GRADIENT = `radial-gradient(120% 92% at 26% 6%, ${fred.canvas} 0%, ${fred.stage} 44%, ${fred.stageEdge} 100%)`;
const STAGE_GLOW = `radial-gradient(circle, ${fred.stageGlow} 0%, transparent 68%)`;

export const T126RecordedStage: React.FC<T126Props> = ({
  src,
  startFrom = 0,
  widthRatio = 0.708,
  shots = [],
  zoomDuration = 1.5,
  vignette = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const winW = Math.round(CANVAS_W * widthRatio);
  const winH = Math.round(winW * 0.625); // 素材 3200×2000 = 8:5

  // 窗口入场
  const rise = ease(t / 0.5);

  // 找最后一个已经开始的 shot，在它和前一个之间插值
  const started = shots.filter((s) => t >= s.at);
  const prev = started.length > 1 ? started[started.length - 2] : null;
  const cur = started.length ? started[started.length - 1] : null;

  let zoomNow = 1;
  let fx = 0.5;
  let fy = 0.5;

  if (cur) {
    const k = ease((t - cur.at) / zoomDuration);
    zoomNow = (prev ? prev.zoom : 1) + (cur.zoom - (prev ? prev.zoom : 1)) * k;
    fx = (prev ? prev.x : 0.5) + (cur.x - (prev ? prev.x : 0.5)) * k;
    fy = (prev ? prev.y : 0.5) + (cur.y - (prev ? prev.y : 0.5)) * k;
  }

  return (
    <AbsoluteFill style={{ background: fred.stage, overflow: 'hidden' }}>
      {/* 舞台：干净渐变 + 一层从左上打下来的柔光 */}
      <AbsoluteFill style={{ background: STAGE_GRADIENT }} />
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: '-26%',
          width: '72%',
          height: '84%',
          borderRadius: '50%',
          background: STAGE_GLOW,
          filter: 'blur(88px)',
        }}
      />

      {/* 窗口：位置和尺寸完全固定，只有里面的视频在动 */}
      <div
        style={{
          position: 'absolute',
          left: (CANVAS_W - winW) / 2,
          top: (CANVAS_H - winH) / 2,
          width: winW,
          height: winH,
          borderRadius: 18,
          overflow: 'hidden',
          opacity: rise,
          transform: `translateY(${(1 - rise) * 40}px)`,
          boxShadow: fred.shadowWindow,
          background: fred.screenBase,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(startFrom * fps)}
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${fx * 100}% ${fy * 100}%`,
            transform: `scale(${zoomNow})`,
            transformOrigin: `${fx * 100}% ${fy * 100}%`,
          }}
        />
        {/* 屏幕内壁高光 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            border: fred.screenEdge,
            pointerEvents: 'none',
          }}
        />
      </div>

      <Grain opacity={0.03} />

      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(74% 64% at 50% 48%, transparent 48%, ${fred.vignetteColor.replace('ALPHA', String(vignette))} 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const T126_LABEL = '录屏镜头';
export const T126_USE = ['screen', 'record', 'camera', 'push-in'];
export const T126_DESC = '窗口固定、镜头推近：推到目标点居中，画面不出血不露底';
