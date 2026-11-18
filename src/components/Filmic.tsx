import React from 'react';
import { AbsoluteFill, HtmlInCanvas } from 'remotion';
import { glow } from '@remotion/effects/glow';
import { noise } from '@remotion/effects/noise';
import { vignette } from '@remotion/effects/vignette';
import { useCurrentFrame } from 'remotion';

/**
 * 电影感外壳
 *
 * 调研结论：显贵靠打光 + 分层 + 运镜，不靠特效。
 * 这一层负责"打光"和"材质"，把所有画面统一成"被一台摄影机拍下来"的样子。
 *
 * 三层顺序（从内到外）：
 *   1. glow      —— 亮的地方溢出光，画面不再是平的
 *   2. vignette  —— 四周压暗，视线收进中间
 *   3. noise     —— 2% 颗粒，抖掉渐变带，加"介质感"
 *
 * 注意：noise 的 seed 必须跟帧走，静止颗粒像脏玻璃。
 */
export const Filmic: React.FC<{
  children: React.ReactNode;
  /** 光晕强度，0 就是不开 */
  glowIntensity?: number;
  /** 暗角强度 */
  vignetteAmount?: number;
  /** 颗粒强度 */
  grain?: number;
  /** 暗底场景把阈值调低，亮部才出光 */
  threshold?: number;
}> = ({ children, glowIntensity = 0.55, vignetteAmount = 0.42, grain = 0.022, threshold = 0.45 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <HtmlInCanvas
        width={1920}
        height={1080}
        effects={[
          glow({ radius: 26, intensity: glowIntensity, threshold }),
          vignette({ amount: vignetteAmount, radius: 0.62, feather: 0.42 }),
          noise({ amount: grain, seed: frame % 7 }),
        ]}
        style={{ width: 1920, height: 1080 }}
      >
        {children}
      </HtmlInCanvas>
    </AbsoluteFill>
  );
};
