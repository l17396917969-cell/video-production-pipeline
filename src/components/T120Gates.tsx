import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, sp, term } from '../kit';

export type T120Props = {
  title?: string;
  gates?: { label: string; ok: boolean }[];
  verdict?: string;
  startAt?: number;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));
const q = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

const PURPLE = fred.purple;

/**
 * T120 · 三道判断
 *
 * 上一版：三张白卡 + ✕ 号，是"示意图"，没有承载物。
 * 这一版：做成一段真实的代码审查输出——三道检查逐条打印，最后给出判定。
 * 承载物是终端，所以它有材质、有因果、有尺寸参照。
 */
export const T120Gates: React.FC<T120Props> = ({
  title = '想回到它动手之前，得先过三道判断',
  gates = [
    { label: '会话能不能截断', ok: false },
    { label: 'AI 能不能回滚对话', ok: false },
    { label: '能不能用摘要接上', ok: false },
  ],
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const termRise = overshoot(t, 0.05, 0.6, 0.26, 0.03);
  const termP = p(t, 0.05, 0.5);
  const verdictP = p(t, 2.6, 3.1);

  return (
    <AbsoluteFill
      style={{
        background: fred.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: sp(5),
        paddingBottom: 190,
      }}
    >
      <div
        style={{
          fontFamily: font.sans,
          fontSize: fred.display,
          fontWeight: 900,
          color: fred.ink,
          letterSpacing: '-0.035em',
          opacity: p(t, 0.02, 0.4),
          width: 1520,
        }}
      >
        {title}
      </div>

      {/* 承载物：终端里逐条打印检查结果 */}
      <div
        style={{
          width: 1520,
          borderRadius: 20,
          overflow: 'hidden',
          background: term.bg,
          boxShadow: termRise > 0.05 ? '0 34px 72px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.14)' : 'none',
          opacity: termP,
          transform: `translateY(${(1 - termRise) * 40}px)`,
        }}
      >
        <div
          style={{
            height: 52,
            background: term.bar,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 20,
            gap: 9,
          }}
        >
          <span style={{ width: 13, height: 13, borderRadius: 7, background: term.dotRed }} />
          <span style={{ width: 13, height: 13, borderRadius: 7, background: term.dotYellow }} />
          <span style={{ width: 13, height: 13, borderRadius: 7, background: term.dotGreen }} />
          <span
            style={{
              marginLeft: 16,
              fontFamily: font.mono,
              fontSize: fred.note * 0.5,
              color: term.path,
            }}
          >
            can-rollback — check
          </span>
        </div>

        <div style={{ padding: '26px 34px' }}>
          <div style={{ fontFamily: font.mono, fontSize: fred.note * 0.7, lineHeight: 1.9 }}>
            <div style={{ color: term.dim }}>
              <span style={{ color: term.green }}>➜</span> 检查能不能回到动手之前
            </div>

            {gates.map((g, i) => {
              const a = 0.55 + i * 0.55;
              const appear = p(t, a, a + 0.4);
              return (
                <div
                  key={i}
                  style={{
                    opacity: appear,
                    transform: `translateX(${(1 - appear) * -18}px)`,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 14,
                    marginTop: 6,
                  }}
                >
                  <span style={{ color: g.ok ? term.green : term.red }}>
                    {g.ok ? '✓' : '✗'}
                  </span>
                  <span style={{ color: term.text }}>{g.label}</span>
                  <span style={{ color: g.ok ? term.green : term.red, marginLeft: 'auto' }}>
                    {g.ok ? '允许' : '不允许'}
                  </span>
                </div>
              );
            })}

            {verdictP > 0 ? (
              <div
                style={{
                  marginTop: 26,
                  paddingTop: 20,
                  borderTop: '1px solid rgba(255,255,255,0.10)',
                  opacity: verdictP,
                  color: term.amber,
                }}
              >
                结论：三道都不过 →{' '}
                <span style={{ color: fred.canvas, fontWeight: 600 }}>不动你的文件</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T120_LABEL = '三道判断';
export const T120_USE = ['rollback', 'gate', 'check'];
export const T120_DESC = '终端逐条打印三道检查结果，最后给判定';
