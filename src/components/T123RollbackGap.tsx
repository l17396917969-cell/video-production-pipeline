import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, sp } from '../kit';

export type T123Props = {
  title?: string;
  leftTitle?: string;
  rightTitle?: string;
  leftText?: string;
  rightText?: string;
  startAt?: number;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));
const q = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

const INK = fred.ink;
const PURPLE = fred.purple;
const GRAY = fred.gray;
const SHADOW = fred.cardShadow;

/**
 * T123 · 能回与回不去
 *
 * FredTalk 规范：白画布、白卡靠阴影、无描边。
 * 动效：左卡先抬起（能回），右卡晚一拍抬起并压一道灰（回不去）——
 * 观众先看到"可以"，再看到"不行"，落差才有冲击。
 */
export const T123RollbackGap: React.FC<T123Props> = ({
  title = '代码能回滚，AI 的记忆不能',
  leftTitle = '代码',
  rightTitle = 'AI 的记忆',
  leftText = '退回上一个版本',
  rightText = '它还记着刚才发生的事',
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const titleP = p(t, 0.05, 0.5);
  const leftRise = overshoot(t, 0.5, 0.6, 0.26, 0.03);
  const rightRise = overshoot(t, 1.15, 0.6, 0.26, 0.03);
  const verdictP = p(t, 2.2, 2.8);

  return (
    <AbsoluteFill
      style={{
        background: fred.canvas,
        paddingBottom: 220,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: sp(7),
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: fred.display,
          fontWeight: 900,
          color: INK,
          letterSpacing: '-0.035em',
          opacity: titleP,
          transform: `translateY(${(1 - titleP) * 20}px)`,
          width: 1560,
        }}
      >
        代码能回滚，
        <span style={{ color: PURPLE }}>AI 的记忆不能</span>
      </div>

      <div style={{ display: 'flex', gap: sp(5), width: 1560 }}>
        {/* 左：能回 */}
        <div
          style={{
            flex: 1,
            background: fred.canvas,
            borderRadius: 28,
            boxShadow: leftRise > 0.05 ? SHADOW : 'none',
            padding: `${sp(6)} ${sp(5)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: sp(2.5),
            opacity: p(t, 0.5, 0.85),
            transform: `translateY(${(1 - leftRise) * 46}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: sp(2) }}>
            <span style={{ fontSize: fred.cardTitle, color: PURPLE, fontWeight: 900 }}>✓</span>
            <span style={{ fontFamily: font.sans, fontSize: fred.cardTitle, fontWeight: 900, color: INK }}>
              {leftTitle}
            </span>
          </div>
          <div style={{ fontFamily: font.sans, fontSize: fred.note, fontWeight: 500, color: GRAY }}>
            {leftText}
          </div>
        </div>

        {/* 右：回不去 */}
        <div
          style={{
            flex: 1,
            background: fred.canvas,
            borderRadius: 28,
            boxShadow: rightRise > 0.05 ? SHADOW : 'none',
            padding: `${sp(6)} ${sp(5)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: sp(2.5),
            opacity: p(t, 1.15, 1.5),
            transform: `translateY(${(1 - rightRise) * 46}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: sp(2) }}>
            <span style={{ fontSize: fred.cardTitle, color: GRAY, fontWeight: 900 }}>✕</span>
            <span style={{ fontFamily: font.sans, fontSize: fred.cardTitle, fontWeight: 900, color: GRAY }}>
              {rightTitle}
            </span>
          </div>
          <div style={{ fontFamily: font.sans, fontSize: fred.note, fontWeight: 500, color: GRAY }}>
            {rightText}
          </div>
        </div>
      </div>

      <div
        style={{
          width: 1560,
          fontFamily: font.sans,
          fontSize: fred.cardTitle,
          fontWeight: 900,
          color: INK,
          opacity: verdictP,
          transform: `translateY(${(1 - verdictP) * 16}px)`,
        }}
      >
        文件退回去了，
        <span style={{ color: PURPLE }}>它没退</span>
      </div>
    </AbsoluteFill>
  );
};

export const T123_LABEL = '能回与回不去';
export const T123_USE = ['rollback', 'compare', 'context'];
export const T123_DESC = '两张白卡先后抬起，先给"可以"再给"不行"，落差有冲击';
