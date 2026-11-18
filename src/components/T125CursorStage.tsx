import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred } from '../kit';

export type CursorEvent = {
  /** 到达位置，相对视频画面 0–1 */
  x: number;
  y: number;
  /** 到达时刻，秒 */
  at: number;
  /** 是不是在这里点一下 */
  click?: boolean;
  /** 点完之后高亮哪个区域（相对画面 0–1） */
  ring?: { x: number; y: number; r: number };
};

export type T125Props = {
  src: string;
  startFrom?: number;
  events?: CursorEvent[];
  label?: string;
  startAt?: number;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));
const q = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * T125 · 界面 + 代理交互
 *
 * 调研结论：浅色界面空的时候，靠"引导视线"救。
 * 做法：合成光标按一条规划好的路径走，只引导一个目标；
 * 点击配 0.12 秒高亮环；到位停住，人眼能跟住。
 *
 * 关键约束（来自 Apple / Stripe / AutoCue）：
 *   - 一条路径只引导一个目标
 *   - 只虚背景，绝不虚 UI
 *   - 光标运动是缓入缓出，不是匀速直线
 */
export const T125CursorStage: React.FC<T125Props> = ({
  src,
  startFrom = 0,
  events = [
    { x: 0.72, y: 0.66, at: 0.3 },
    { x: 0.5, y: 0.28, at: 1.6, click: true, ring: { x: 0.5, y: 0.26, r: 0.16 } },
  ],
  label,
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const W = 1600;
  const H = 900;
  const winRise = p(t, 0.05, 0.75);

  // 光标位置：按事件序列插值
  const cur = (() => {
    if (!events.length) return { x: 0.5, y: 0.5, appear: 0 };
    if (t <= events[0].at) return { ...events[0], appear: p(t, 0.1, 0.4) };
    for (let i = 1; i < events.length; i++) {
      if (t <= events[i].at) {
        const a = events[i - 1];
        const b = events[i];
        const k = q(t, a.at, b.at);
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, appear: 1 };
      }
    }
    return { ...events[events.length - 1], appear: 1 };
  })();

  // 点击涟漪：只在一个事件上
  const clicks = events.filter((e) => e.click);
  const activeClick = clicks.find((c) => t >= c.at && t < c.at + 1.6);

  return (
    <AbsoluteFill
      style={{
        background: fred.stage,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 130,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: W,
          height: H,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: fred.cardShadow,
          opacity: winRise,
          transform: `translateY(${(1 - winRise) * 36}px)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(startFrom * fps)}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* 高亮环：点击后出现，只框一个目标 */}
        {activeClick?.ring ? (
          <div
            style={{
              position: 'absolute',
              left: `${activeClick.ring.x * 100}%`,
              top: `${activeClick.ring.y * 100}%`,
              width: `${activeClick.ring.r * 200}%`,
              height: `${activeClick.ring.r * 200}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: 16,
              border: `3px solid ${fred.purple}`,
              boxShadow: 'none',
              opacity: p(t, activeClick.at + 0.06, activeClick.at + 0.24),
            }}
          />
        ) : null}

        {/* 点击涟漪：0.12 秒扩散 */}
        {activeClick ? (
          <div
            style={{
              position: 'absolute',
              left: `${activeClick.x * 100}%`,
              top: `${activeClick.y * 100}%`,
              width: 20 + 110 * p(t, activeClick.at, activeClick.at + 0.7),
              height: 20 + 110 * p(t, activeClick.at, activeClick.at + 0.7),
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `3px solid rgba(133,84,232,${0.7 * (1 - p(t, activeClick.at, activeClick.at + 0.7))})`,
            }}
          />
        ) : null}

        {/* 合成光标：缓入缓出，落定时停住 */}
        <div
          style={{
            position: 'absolute',
            left: `${cur.x * 100}%`,
            top: `${cur.y * 100}%`,
            width: 26,
            height: 26,
            transform: 'translate(-50%, -50%)',
            opacity: cur.appear,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" style={{ filter: 'none' }}>
            <path d="M3 2 L3 20 L8 15 L12 23 L15 21.5 L11 14 L18 14 Z" fill={fred.canvas} stroke={fred.ink} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {label ? (
        <div
          style={{
            position: 'absolute',
            left: (1920 - W) / 2,
            top: (1080 - H) / 2 - 46,
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
    </AbsoluteFill>
  );
};

export const T125_LABEL = '界面+光标';
export const T125_USE = ['ui', 'cursor', 'guided'];
export const T125_DESC = '合成光标规划路径 + 点击涟漪 + 目标高亮环，引导视线';
