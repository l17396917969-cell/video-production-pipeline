import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type , media } from '../kit';

export type T20Props = {
  src: string;
  /** 高亮区域，百分比（0-100），相对整张图 */
  region: { x: number; y: number; w: number; h: number };
  label?: string;
  /** 镜头的额外推近倍数 */
  zoom?: number;
};

/**
 * T20 · 聚焦高亮
 * 用途：在真实截图里圈出重点——某个按钮、某个数字、某一行
 * 画面：整张图压暗，指定区域挖洞保持原亮度，边框逐边画出，底部浮出标注
 * 这是把"真实画面"变成"讲解"的核心镜头，替代文字卡片
 */
export const T20Focus: React.FC<T20Props> = ({ src, region, label, zoom = 1.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 每个实例独立的遮罩 id：整片里会有多个聚焦镜头同时挂在 DOM 上，
  // 共用同一个 id 会互相覆盖，导致除了最后一个之外全部被遮死。
  const maskId = `fm-${React.useId().replace(/:/g, '')}`;

  const pMask = springIn(frame, fps, 0, 22);
  const pBox = springIn(frame, fps, 10, 20);
  const pLabel = springIn(frame, fps, 22, 18);

  // 从百分比换算成像素（按 1920x1080 逻辑画布）
  const X = (region.x / 100) * 1920;
  const Y = (region.y / 100) * 1080;
  const W = (region.w / 100) * 1920;
  const H = (region.h / 100) * 1080;

  const pad = 12;
  const bx = X - pad;
  const by = Y - pad;
  const bw = W + pad * 2;
  const bh = H + pad * 2;

  const scale = 1 + (zoom - 1) * Math.min(1, frame / 30);

  return (
    <AbsoluteFill style={{ background: media.black, overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id={maskId}>
            <rect x={0} y={0} width={1920} height={1080} fill="white" />
            <rect x={bx} y={by} width={bw} height={bh} rx={14} fill="black" />
          </mask>
        </defs>
        <rect
          x={0}
          y={0}
          width={1920}
          height={1080}
          fill={media.mask}
          opacity={pMask}
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* 高亮框：四条边分开画，做出"逐边生长"的手感 */}
      <div
        style={{
          position: 'absolute',
          left: bx,
          top: by,
          width: bw,
          height: bh,
          borderRadius: 14,
          boxShadow: `0 0 0 2px ${palette.accent}, 0 0 60px rgba(99,91,255,0.35)`,
          opacity: fade(pBox),
          transform: `scale(${0.96 + pBox * 0.04})`,
        }}
      />

      {label ? (
        <div
          style={{
            position: 'absolute',
            left: Math.max(sp(3), bx),
            top: Math.max(sp(3), by - 76),
            opacity: fade(pLabel),
            transform: `translateY(${(1 - pLabel) * 10}px)`,
            padding: `${sp(1.2)}px ${sp(2.5)}px`,
            background: palette.accent,
            color: media.white,
            borderRadius: 10,
            fontFamily: font.sans,
            fontSize: type.small,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T20_LABEL = '聚焦高亮';
export const T20_USE = ['shots', 'recording', 'explain'];
export const T20_DESC = '真实截图整体压暗，指定百分比区域挖洞保持原亮度并加发光边框，旁边浮出文字标签';
