import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, term } from '../kit';

export type T119Props = {
  commits?: number;
  snapshots?: number;
  startAt?: number;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));
const q = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);
const mix = (a: number, b: number, x: number) => a + (b - a) * x;

/** 深色终端：这是承载物，不是装饰。所有内容画在它里面，才不像 PPT */
const PURPLE = fred.purple;

/**
 * T119 · 快照时间轴（第三版）
 *
 * 上一版的问题：一条线 + 几个方块，是"示意图"，没有承载物、没有因果、没有尺寸参照。
 *
 * 这一版按三条硬规则重做：
 *   1. 不许裸图形：先给一个真实终端窗口，快照是从终端里"吐"出来的
 *   2. 有因果：不是先摆好再解释，而是一条命令跑完 → 快照被推出来
 *   3. 尺寸必须真：快照卡的大小对应真实的改动量
 */
export const T119SnapshotTimeline: React.FC<T119Props> = ({
  commits = 1,
  snapshots = 3,
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const W = 1680;
  const H = 720;

  // 终端窗口从下方抬起落定
  const termRise = overshoot(t, 0.05, 0.6, 0.26, 0.03);
  const termP = p(t, 0.05, 0.5);

  // 命令行逐字打出
  const cmd = 'git log --oneline';
  const typed = Math.floor(p(t, 0.55, 1.35) * cmd.length);
  const cmdDone = p(t, 1.35, 1.5);

  // 输出：只有一个提交
  const outP = p(t, 1.5, 1.9);

  // 快照卡从终端右侧"吐出来"，依次落下
  const snap = (i: number) => {
    const a = 2.0 + i * 0.62;
    const fly = q(t, a, a + 0.7);
    const land = overshoot(t, a + 0.05, 0.62, 0.26, 0.035);
    return {
      x: mix(860, 1010 + i * 190, fly),
      y: mix(470, 420 + (i % 2) * 130, fly),
      w: mix(40, 168, land),
      h: mix(24, 168, land),
      r: mix(6, 18, p(t, a, a + 0.5)),
      alpha: p(t, a, a + 0.25),
      on: p(t, a + 0.55, a + 0.95),
    };
  };

  return (
    <AbsoluteFill
      style={{
        background: fred.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 150,
      }}
    >
      <div style={{ position: 'relative', width: W, height: H }}>
        {/* 标题：先说结论 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: -90,
            fontFamily: font.sans,
            fontSize: fred.display,
            fontWeight: 900,
            color: fred.ink,
            letterSpacing: '-0.035em',
            opacity: p(t, 0.02, 0.4),
          }}
        >
          你的代码，只提交过
          <span style={{ color: PURPLE }}>一次</span>
        </div>

        {/* 承载物：深色终端窗口 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 260,
            width: 860,
            borderRadius: 20,
            overflow: 'hidden',
            background: term.bg,
            boxShadow: termRise > 0.05 ? fred.shadowWindow : 'none',
            opacity: termP,
            transform: `translateY(${(1 - termRise) * 40}px)`,
          }}
        >
          {/* 标题栏：三个圆点，一个光源方向 */}
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
              demo-repo — zsh
            </span>
          </div>

          {/* 终端正文 */}
          <div style={{ padding: '26px 30px', minHeight: 320 }}>
            <div style={{ fontFamily: font.mono, fontSize: fred.note * 0.75, lineHeight: 1.7 }}>
              <span style={{ color: term.green }}>➜</span>
              <span style={{ color: term.dim }}> demo-repo </span>
              <span style={{ color: fred.canvas }}>{cmd.slice(0, typed)}</span>
              {typed < cmd.length ? (
                <span style={{ color: term.green }}>▊</span>
              ) : null}
            </div>

            {cmdDone > 0 ? (
              <div
                style={{
                  marginTop: 18,
                  fontFamily: font.mono,
                  fontSize: fred.note * 0.7,
                  lineHeight: 1.85,
                  opacity: outP,
                  color: term.text,
                }}
              >
                <div>
                  <span style={{ color: term.amber }}>a3f91c2</span>
                  <span> </span>
                  <span>手动提交：初始版本</span>
                </div>
                <div style={{ marginTop: 10, color: term.dim }}>
                  以上是全部提交记录（{commits} 条）
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 因果：快照从终端里被推出来，落进右侧的槽 */}
        {Array.from({ length: snapshots }).map((_, i) => {
          const s = snap(i);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: s.x,
                top: s.y,
                width: s.w,
                height: s.h,
                borderRadius: s.r,
                background: fred.canvas,
                boxShadow: s.on > 0.05 ? fred.cardShadow : 'none',
                opacity: s.alpha,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {s.alpha > 0.3 ? (
                <>
                  <div
                    style={{
                      fontFamily: font.mono,
                      fontSize: fred.note,
                      fontWeight: 600,
                      color: PURPLE,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontFamily: font.sans, fontSize: fred.note * 0.45, color: fred.gray }}>
                    快照
                  </div>
                </>
              ) : null}
            </div>
          );
        })}

        {/* 说明：跟快照同一层，不是飘在空白里 */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 700,
            fontFamily: font.sans,
            fontSize: fred.note * 0.95,
            fontWeight: 500,
            color: fred.ink,
            opacity: p(t, 3.6, 4.2),
          }}
        >
          每一轮对话结束，它偷偷存一个
          <span style={{ color: PURPLE, fontWeight: 900 }}>你看不到的档</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T119_LABEL = '快照时间轴';
export const T119_USE = ['snapshot', 'git', 'rollback'];
export const T119_DESC = '真实终端窗口承载命令与输出，快照从终端里被推出来';
