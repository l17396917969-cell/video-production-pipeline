import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fred } from '../kit';

/**
 * 三维展示台
 *
 * AI 产品片的空间感来自两件事：透视 + 层级。
 * 这里用 CSS 3D，不引入 three.js —— 对"一块屏幕"这种对象，
 * CSS transform3d 足够做出斜置、翻转、纵深，而且逐帧确定。
 *
 * 关键：所有旋转角度和位置都由帧数直接算出，不用随机，保证可重渲染。
 */
export type Stage3DProps = {
  children: React.ReactNode;
  /** 起始时刻，秒 */
  at?: number;
  /** 从左还是从右进场 */
  from?: 'left' | 'right' | 'below';
  /** 落定后的倾斜角，度 */
  tilt?: number;
  /** 落定后的偏转角，度 */
  yaw?: number;
};

const p = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return 1 - Math.pow(1 - x, 3);
};

export const Stage3D: React.FC<Stage3DProps> = ({
  children,
  at = 0,
  from = 'below',
  tilt = 6,
  yaw = -10,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const k = p(t, at, at + 0.9);

  // 起始姿态：远离、侧倾、下沉
  const startTilt = tilt + 22;
  const startYaw = from === 'left' ? yaw - 34 : from === 'right' ? yaw + 34 : yaw;
  const startY = from === 'below' ? 140 : 60;
  const startZ = -320;

  const tiltNow = startTilt + (tilt - startTilt) * k;
  const yawNow = startYaw + (yaw - startYaw) * k;
  const yNow = startY * (1 - k);
  const zNow = startZ * (1 - k);

  return (
    <AbsoluteFill
      style={{
        perspective: 1800,
        perspectiveOrigin: '50% 40%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `translateY(${yNow}px) translateZ(${zNow}px) rotateX(${tiltNow}deg) rotateY(${yawNow}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/**
 * 接触阴影：物体和地面之间的一道光影，
 * 没有它，3D 物体像浮在真空里。
 */
export const ContactShadow: React.FC<{ width?: number; opacity?: number }> = ({
  width = 1200,
  opacity = 0.5,
}) => (
  <div
    style={{
      position: 'absolute',
      bottom: -60,
      left: '50%',
      transform: 'translateX(-50%)',
      width,
      height: 120,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)',
      opacity,
      filter: 'blur(28px)',
    }}
  />
);

/**
 * 扫光：8 秒一束，从左上斜切过画面。
 * 这一层是"贵"的作弊码，几乎所有产品片都有。
 */
export const Sweep: React.FC<{ period?: number; color?: string }> = ({
  period = 8,
  color = 'rgba(255,255,255,0.14)',
}) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) % period;
  const k = t / period;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          left: `${-60 + k * 220}%`,
          width: '42%',
          height: '180%',
          background: `linear-gradient(102deg, transparent 0%, ${color} 46%, transparent 100%)`,
          transform: 'rotate(12deg)',
          filter: 'blur(26px)',
          opacity: k > 0.82 ? (1 - k) / 0.18 : 1,
        }}
      />
    </AbsoluteFill>
  );
};

/** 网格地面：给 3D 场景一个可参照的地面，空间才成立 */
export const GridFloor: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '46%',
        opacity,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '84px 84px',
        transform: 'perspective(700px) rotateX(64deg)',
        transformOrigin: 'bottom center',
        maskImage: 'linear-gradient(to top, black 0%, transparent 82%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 82%)',
      }}
    />
  );
};
