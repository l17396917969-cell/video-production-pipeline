import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, fade, font, palette, sp, type } from '../kit';

export type T24Props = {
  items: { value: number; label: string; display?: string }[];
  title?: string;
  /** 说明为什么用对数刻度 */
  note?: string;
};

/**
 * T24 · 3D 柱状图
 * 用途：几个量级差很大的真实数字摆一起，看谁更重
 * 画面：等距视角的立体柱，从地面长起来，柱子三个面分别给不同明度
 * 注意：量级差太大时用对数刻度（会在 note 里注明），不要为了好看歪曲比例
 */
export const T24Bar3D: React.FC<T24Props> = ({ items, title, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames - 1);

  const pTitle = Math.min(1, frame / (fps * 0.4));

  // 对数刻度：跨两个数量级的数字直接比高度会失真
  const maxLog = Math.max(...items.map((it) => Math.log10(Math.max(1, it.value))));
  const MAX_H = 470; // px
  const W = 150; // 柱宽
  const D = 92; // 柱深
  const GAP = 88;

  const spin = -26 + Math.sin(t * Math.PI) * 8;

  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        padding: `${sp(12)}px ${sp(12)}px ${sp(8)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ opacity: fade(pTitle) }}>
        <div
          style={{
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 620,
            color: palette.ink,
          }}
        >
          {title}
        </div>
        {note ? (
          <div
            style={{
              fontFamily: font.mono,
              fontSize: type.micro,
              color: 'rgba(255,255,255,0.42)',
              marginTop: sp(1),
              letterSpacing: '0.04em',
            }}
          >
            {note}
          </div>
        ) : null}
      </div>

      <div style={{ perspective: 1500, height: sp(58), position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: GAP,
            transformStyle: 'preserve-3d',
            transform: `rotateX(-16deg) rotateY(${spin}deg)`,
          }}
        >
          {items.map((it, i) => {
            const logv = Math.log10(Math.max(1, it.value)) / maxLog;
            const p = Math.min(1, Math.max(0, (frame - (8 + i * 7)) / 30));
            const grow = E.out(p);
            const H = Math.max(24, MAX_H * logv * grow);
            const isTop = logv === 1;

            const face = isTop ? palette.accent : palette.solid;
            const lighter = isTop ? palette.accentSoft : palette.solidLit;
            const darker = isTop ? palette.accentDeep : palette.solidDim;

            return (
              <div
                key={it.label}
                style={{
                  position: 'relative',
                  width: W,
                  height: H,
                  transformStyle: 'preserve-3d',
                  opacity: fade(Math.min(1, p * 2)),
                }}
              >
                {/* 正面 */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: face,
                    transform: `translateZ(${D / 2}px)`,
                    borderTop: `2px solid ${lighter}`,
                  }}
                />
                {/* 右侧面 */}
                <div
                  style={{
                    position: 'absolute',
                    left: W,
                    top: 0,
                    width: D,
                    height: H,
                    background: darker,
                    transform: `rotateY(90deg) translateZ(${D / 2}px)`,
                    transformOrigin: 'left center',
                  }}
                />
                {/* 顶面 */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: W,
                    height: D,
                    background: lighter,
                    transform: `rotateX(90deg) translateZ(${D / 2}px)`,
                    transformOrigin: 'center top',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 标签层：2D 覆盖，绕开 3D 里文字变形 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: GAP }}>
        {items.map((it, i) => {
          const p = Math.min(1, Math.max(0, (frame - (8 + i * 7)) / 30));
          return (
            <div
              key={it.label}
              style={{
                width: W,
                opacity: fade(p),
                textAlign: 'center',
                fontFamily: font.sans,
                fontSize: type.small,
                color: 'rgba(255,255,255,0.62)',
              }}
            >
              <div
                style={{
                  fontSize: type.s,
                  fontWeight: 640,
                  color: i === items.length - 1 ? palette.accent : palette.ink,
                  marginBottom: 4,
                }}
              >
                {it.display ?? it.value.toLocaleString('en-US')}
              </div>
              {it.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const T24_LABEL = '3D 柱状图';
export const T24_USE = ['data', 'proof', 'compare'];
export const T24_DESC = '等距视角的立体柱从地面长起，三个面给不同明度；量级差大时用对数刻度并注明';
