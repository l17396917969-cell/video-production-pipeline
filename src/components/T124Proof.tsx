import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, sp } from '../kit';

export type T124Props = {
  title: string;
  highlight?: string;
  image: string;
  caption?: string;
  startAt?: number;
  /** 图片占画面宽度比例 */
  width?: number;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));
const q = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

/**
 * T124 · 真实证据
 *
 * 为什么需要：纯白底 + 色块卡片，看了像设计稿。
 * FredTalk 的做法是白画布上直接放真实界面局部——观众看到的是"真东西"。
 *
 * 动效：标题先立，截图从下方抬起落定（过冲 3%），
 * 最后高亮词逐个亮起，把注意力引到证据上。
 */
export const T124Proof: React.FC<T124Props> = ({
  title,
  highlight,
  image,
  caption,
  startAt = 0,
  width = 0.72,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const titleP = p(t, 0.05, 0.5);
  const shotRise = overshoot(t, 0.5, 0.65, 0.28, 0.03);
  const capP = p(t, 1.5, 2.0);

  return (
    <AbsoluteFill
      style={{
        background: fred.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: sp(5),
        paddingBottom: sp(18),
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: fred.display,
          fontWeight: 900,
          color: fred.ink,
          letterSpacing: '-0.035em',
          opacity: titleP,
          transform: `translateY(${(1 - titleP) * 20}px)`,
          textAlign: 'center',
        }}
      >
        {title}
        {highlight ? (
          <span style={{ color: fred.purple }}>{highlight}</span>
        ) : null}
      </div>

      {/* 真实截图：白卡托住，靠阴影立起来 */}
      <div
        style={{
          width: `${width * 100}%`,
          borderRadius: 20,
          overflow: 'hidden',
          background: fred.canvas,
          boxShadow: shotRise > 0.05 ? '0 30px 64px rgba(0,0,0,0.14), 0 6px 18px rgba(0,0,0,0.06)' : 'none',
          opacity: p(t, 0.5, 0.9),
          transform: `translateY(${(1 - shotRise) * 44}px)`,
        }}
      >
        <Img src={staticFile(image)} style={{ width: '100%', display: 'block' }} />
      </div>

      {caption ? (
        <div
          style={{
            fontFamily: font.sans,
            fontSize: fred.note,
            fontWeight: 500,
            color: fred.gray,
            opacity: capP,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const T124_LABEL = '真实证据';
export const T124_USE = ['proof', 'screenshot', 'evidence'];
export const T124_DESC = '白画布大字 + 真实界面局部截图，截图抬起落定';
