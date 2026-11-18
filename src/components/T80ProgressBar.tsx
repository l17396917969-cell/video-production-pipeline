import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, palette, sp, type } from '../kit';

export type T80Props = { label?: string; stages?: string[]; color?: string };

/**
 * T80 · 进度条
 * 用途：多阶段任务的推进——装依赖、下载、构建
 * 画面：横向进度条匀速推进，经过的阶段名逐个点亮
 */
export const T80ProgressBar: React.FC<T80Props> = ({ label = '安装中', stages = [], color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = E.inOut(Math.min(1, frame / Math.max(1, durationInFrames * 0.85)));
  const barColor = color ?? palette.accent;

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(14), justifyContent: 'center', gap: sp(2.5) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: font.sans, fontSize: type.s, color: palette.ink, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: font.mono, fontSize: type.small, color: palette.accentSoft }}>
          {Math.round(t * 100)}%
        </span>
      </div>
      <div style={{ height: sp(1.6), background: 'rgba(255,255,255,0.08)', borderRadius: sp(1) }}>
        <div style={{ width: `${t * 100}%`, height: '100%', background: barColor, borderRadius: sp(1) }} />
      </div>
      {stages.length ? (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {stages.map((s, i) => {
            const reached = t >= i / Math.max(1, stages.length - 1) - 0.001;
            return (
              <span
                key={s}
                style={{
                  fontFamily: font.mono,
                  fontSize: type.micro,
                  color: reached ? palette.accentSoft : 'rgba(255,255,255,0.28)',
                }}
              >
                {s}
              </span>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T80_LABEL = '进度条';
export const T80_USE = ['ui', 'progress', 'install'];
export const T80_DESC = '横向进度条匀速推进，经过的阶段名逐个点亮';
