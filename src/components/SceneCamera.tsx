import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fred } from '../kit';

/**
 * 镜头外壳
 *
 * 全片 14 个镜头共用这一层，保证"一台摄影机"的一致性：
 *   1. 场景级推近 —— 不是元素各自缩放，是整个画面在一个变
 *   2. 统一缓动   —— cubic-bezier(0.16,1,0.3,1)，快出慢收，落定有重量
 *   3. 运动模糊   —— 只在快速推近时出现，停住就没有
 *   4. 暗角       —— 把视线收进中间
 *
 * 用法：
 *   <SceneCamera push={0.05} origin="50% 46%">
 *     ...这一镜的全部内容...
 *   </SceneCamera>
 */
export type SceneCameraProps = {
  children: React.ReactNode;
  /** 推近幅度，0.05 表示从 1.05 推到 1.0（越大越猛） */
  push?: number;
  /** 拉远幅度，给了就用拉远，忽略 push */
  pull?: number;
  /** 推近/拉远的落点 */
  origin?: string;
  /** 这一段自身的时间长度（秒），用于算推镜何时停 */
  length?: number;
  /** 起点时刻，用于接缝对齐 */
  startAt?: number;
  /** 暗角强度，0 就是不开 */
  vignette?: number;
  /** 是否跳过摄影机（有些镜头自带复杂运镜） */
  still?: boolean;
};

/** 全片唯一缓动：cubic-bezier(0.16, 1, 0.3, 1) 的近似 */
const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3.2);
};

export const SceneCamera: React.FC<SceneCameraProps> = ({
  children,
  push = 0.05,
  pull,
  origin = '50% 46%',
  length = 5,
  startAt = 0,
  vignette = 0.34,
  still = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  // 推镜在镜头前 45% 的时间走完，后面停住让观众读
  const span = Math.max(0.9, length * 0.45);
  const k = ease(t / span);

  // 起始状态下推近/拉远的方向相反
  const amount = pull ?? push;
  const scale = still ? 1 : pull != null ? 1 - amount * k : 1 + amount * (1 - k);

  // 推镜越快，模糊越明显；走完之后归零
  const speed = still ? 0 : Math.abs(ease((t + 0.04) / span) - k);
  const blur = Math.min(1.5, speed * 22);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: fred.stage }}>
      <AbsoluteFill
        style={{
          transform: still ? undefined : `scale(${scale})`,
          transformOrigin: origin,
          filter: blur > 0.12 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* 暗角：统一压四角，让中间成为视觉焦点 */}
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(76% 66% at 50% 46%, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * 错峰入场
 *
 * 同一组元素不要同时出现。每个元素晚 2–4 帧，观感上就是"一件一件摆上来"。
 * 返回 0–1 的进度，配 transform 用。
 */
export const useStagger = (index: number, base = 0.15, step = 0.11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return ease((t - (base + index * step)) / 0.42);
};

/** 把一个 0–1 的进度变成"从下方带渐入"的样式 */
export const riseIn = (p: number, distance = 26) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * distance}px)`,
});
