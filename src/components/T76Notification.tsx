import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T76Props = { title: string; body?: string; app?: string; delay?: number };

/**
 * T76 · 通知弹出
 * 用途：模拟一条系统通知，制造"事情正在发生"的临场感
 * 画面：右上角滑入一个通知卡片，几秒后轻微上浮
 */
export const T76Notification: React.FC<T76Props> = ({ title, body, app = 'T3 Code', delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, delay, 22);

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <div
        style={{
          position: 'absolute',
          top: sp(5),
          right: sp(5),
          width: sp(46),
          opacity: fade(p),
          transform: `translateY(${(1 - p) * -30}px) scale(${0.94 + p * 0.06})`,
          background: 'rgba(28,28,34,0.92)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: sp(2.2),
          padding: sp(2.2),
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          display: 'flex',
          gap: sp(1.5),
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: sp(5),
            height: sp(5),
            borderRadius: sp(1.4),
            background: palette.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: font.sans,
            fontWeight: 700,
            fontSize: type.small,
            color: palette.paper,
          }}
        >
          T3
        </div>
        <div>
          <div style={{ fontFamily: font.sans, fontSize: type.small, fontWeight: 640, color: palette.ink }}>
            {title}
          </div>
          {body ? (
            <div style={{ fontFamily: font.sans, fontSize: type.micro, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              {body}
            </div>
          ) : null}
          <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
            {app} · now
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T76_LABEL = '通知弹出';
export const T76_USE = ['overlay', 'status', 'event'];
export const T76_DESC = '右上角滑入一条系统通知，带应用名和"now"时间';
