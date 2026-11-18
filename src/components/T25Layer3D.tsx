import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, type } from '../kit';

export type T25Props = {
  layers: { label: string; desc?: string }[];
  title?: string;
  /** 视角 */
  tilt?: number;
  spin?: number;
};

/**
 * T25 · 3D 架构爆炸图
 * 用途：把一个系统的分层拆开看——谁在谁的上面，谁调用谁
 * 画面：等距视角的层叠平板，从最底层逐层向上抬起并分离，形成爆炸视图
 * 纯 CSS 3D，帧驱动，不依赖 three.js
 *
 * layers 按「从下到上」给：基础层在前，应用层在后
 */
export const T25Layer3D: React.FC<T25Props> = ({ layers, title, tilt = 62, spin = -32 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames - 1);

  // 整体缓慢转动，让立体感一直在变
  const spinNow = spin + Math.sin(t * Math.PI) * 10;
  const pTitle = Math.min(1, frame / (fps * 0.5));

  const GAP = 78;

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        padding: `${sp(10)}px ${sp(12)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: sp(2),
      }}
    >
      {title ? (
        <div
          style={{
            opacity: fade(pTitle),
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 620,
            color: palette.ink,
          }}
        >
          {title}
        </div>
      ) : null}

      <div
        style={{
          perspective: 1600,
          perspectiveOrigin: '50% 50%',
          height: sp(96),
          // 透视旋转后视觉重心会往左上跑，这里补一点下沉把它拉回中线
          transform: 'translateY(42px)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt}deg) rotateZ(${spinNow}deg)`,
          }}
        >
          {layers.map((l, i) => {
            // 自下而上依次弹出
            const p = Math.min(
              1,
              Math.max(0, (frame - (10 + i * 9)) / 22),
            );
            const e = E.out(p);
            const z = i * GAP * e;

            const top = i === layers.length - 1;
            const accent = top;
            const w = 62 + i * 5;

            return (
              <div
                key={l.label}
                style={{
                  position: 'absolute',
                  left: `${50 - w / 2}%`,
                  top: `${40 - i * 6}%`,
                  width: `${w}%`,
                  height: sp(14),
                  transform: `translateZ(${z}px)`,
                  transformStyle: 'preserve-3d',
                  opacity: fade(Math.min(1, p * 1.6)),
                  borderRadius: 14,
                  border: `1.5px solid ${accent ? palette.accent : 'rgba(255,255,255,0.16)'}`,
                  background: accent
                    ? 'linear-gradient(135deg, rgba(99,91,255,0.55), rgba(99,91,255,0.22))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
                  boxShadow: accent
                    ? '0 24px 60px rgba(99,91,255,0.35)'
                    : '0 18px 44px rgba(0,0,0,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `0 ${sp(4)}px`,
                }}
              >
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: type.s,
                    fontWeight: 640,
                    color: accent ? palette.paper : palette.ink,
                  }}
                >
                  {l.label}
                </span>
                {l.desc ? (
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontSize: type.body,
                      fontWeight: 500,
                      color: accent ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {l.desc}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T25_LABEL = '3D 架构爆炸图';
export const T25_USE = ['architecture', 'explain', 'ontology'];
export const T25_DESC = '等距视角的层叠平板，自下而上逐层抬起分离成爆炸视图，整片持续缓慢转动；纯 CSS 3D';
