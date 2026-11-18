import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, sp } from '../kit';

export type T117Props = {
  src: string;
  startFrom?: number;
  label?: string;
  /** 外部素材的主色，用来铺四周 */
  matte?: string;
  /** 内容区宽度占画布的比例 */
  width?: number;
  caption?: string;
  /** 放大倍数：只取局部，不要整屏塞 */
  zoom?: number;
  /** 焦点位置，0–1，默认取画面中心 */
  focusX?: number;
  focusY?: number;
  /** 是否加一层浅色底把窗口托起来 */
  lift?: boolean;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));
const q = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * T117 · 真实录屏
 *
 * FredTalk 规范：白画布、素材靠阴影立住、不套假窗、不加黑框。
 * 关键改动：支持取景（zoom + focus）。T3 的界面留白很多，
 * 整屏塞进来就是一大片白，必须只取"有信息的那一块"放大。
 */
export const T117ExternalClip: React.FC<T117Props> = ({
  src,
  startFrom = 0,
  label,
  matte,
  width = 0.90,
  caption,
  zoom = 1,
  focusX = 0.5,
  focusY = 0.5,
  lift = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // 取景：先给全景，再缓慢推到焦点。推镜是事件，推完停住
  const enter = p(t, 0.1, 0.8);
  const push = q(t, 0.5, 1.9);
  const z = 1 + (zoom - 1) * push;

  // zoom 后，焦点要留在画面里：按焦点比例做反向位移
  const shiftX = -(focusX - 0.5) * (z - 1) * 100;
  const shiftY = -(focusY - 0.5) * (z - 1) * 100;

  const cardW = 1920 * width;
  const cardH = (cardW * 9) / 16;

  return (
    
    <AbsoluteFill
      style={{
        background: fred.stage,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: sp(16),
      }}
    >
      <div
        style={{
          width: cardW,
          height: cardH,
          borderRadius: 24,
          overflow: 'hidden',
          background: matte ?? fred.stage,
          boxShadow: lift
            ? '0 20px 32px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.06)'
            : 'none',
          opacity: enter,
          position: 'relative',
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(startFrom * fps)}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${z})`,
            transformOrigin: `${focusX * 100}% ${focusY * 100}%`,
          }}
        />
      </div>

      {false && label ? (
        <div
          style={{
            position: 'absolute',
            left: sp(6),
            top: sp(5),
            fontFamily: font.mono,
            fontSize: fred.note * 0.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: fred.grayWeak,
          }}
        >
          {label}
        </div>
      ) : null}

      {caption ? (
        <div
          style={{
            position: 'absolute',
            bottom: sp(9),
            fontFamily: font.sans,
            fontSize: fred.note,
            fontWeight: 500,
            color: fred.gray,
            opacity: enter,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T117_LABEL = '真实录屏';
export const T117_USE = ['screencast', 'proof', 'ui'];
export const T117_DESC = '白画布、浅灰托底、支持取景放大只留有信息的一块';
