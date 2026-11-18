import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, sp, term } from '../kit';

export type T121Props = {
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
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
 * T121 · 一份变两份
 *
 * 上一版：一个黑胶囊分裂成两张白卡，是纯示意图。
 * 这一版：真实终端里跑 worktree 命令，磁盘上真的多出一个目录。
 * 承载物是终端 + 文件树，观众看到的是文件系统真的变了。
 */
export const T121Split: React.FC<T121Props> = ({
  title = '它不是默认给你开独立副本',
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const termRise = overshoot(t, 0.05, 0.6, 0.26, 0.03);
  const termP = p(t, 0.05, 0.5);

  const cmd = 'git worktree add ./feature-a';
  const typed = Math.floor(p(t, 0.5, 1.3) * cmd.length);
  const doneP = p(t, 1.4, 1.8);

  // 新目录出现
  const dirP = p(t, 1.5, 2.0);
  const dirRise = overshoot(t, 1.5, 0.5, 0.24, 0.04);

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

      <div style={{ display: 'flex', gap: sp(4), width: 1520, alignItems: 'flex-start' }}>
        {/* 终端：命令执行 */}
        <div
          style={{
            flex: 1,
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
            <span style={{ marginLeft: 16, fontFamily: font.mono, fontSize: fred.note * 0.5, color: term.path }}>
              demo-repo — zsh
            </span>
          </div>
          <div style={{ padding: '26px 30px', minHeight: 300 }}>
            <div style={{ fontFamily: font.mono, fontSize: fred.note * 0.7, lineHeight: 1.75 }}>
              <span style={{ color: term.green }}>➜</span>
              <span style={{ color: term.dim }}> demo-repo </span>
              <span style={{ color: fred.canvas }}>{cmd.slice(0, typed)}</span>
              {typed < cmd.length ? <span style={{ color: term.green }}>▊</span> : null}
            </div>
            {doneP > 0 ? (
              <div style={{ marginTop: 18, fontFamily: font.mono, fontSize: fred.note * 0.65, lineHeight: 1.8, opacity: doneP, color: term.text }}>
                <div>
                  <span style={{ color: term.green }}>Preparing worktree</span>
                </div>
                <div style={{ color: term.dim }}>HEAD is now at a3f91c2 初始版本</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 文件树：磁盘上真的多了一个目录 */}
        <div
          style={{
            flex: 1,
            borderRadius: 20,
            background: fred.canvas,
            boxShadow: dirP > 0.05 ? '0 24px 54px rgba(0,0,0,0.12)' : 'none',
            padding: '26px 30px',
            opacity: dirP,
            transform: `translateY(${(1 - dirRise) * 36}px)`,
            minHeight: 300,
          }}
        >
          <div style={{ fontFamily: font.mono, fontSize: fred.note * 0.55, color: fred.grayWeak, marginBottom: 14 }}>
            demo-repo/../worktrees
          </div>
          <div style={{ fontFamily: font.mono, fontSize: fred.note * 0.65, lineHeight: 2, color: fred.ink }}>
            <div style={{ color: fred.ink }}>demo-repo/</div>
            <div style={{ color: fred.gray, paddingLeft: 26 }}>├ .git</div>
            <div style={{ color: fred.gray, paddingLeft: 26 }}>├ src</div>
            <div style={{ color: fred.gray, paddingLeft: 26 }}>└ README.md</div>
            <div style={{ color: PURPLE, fontWeight: 700, marginTop: 12 }}>feature-a/</div>
            <div style={{ color: fred.gray, paddingLeft: 26 }}>├ .git</div>
            <div style={{ color: fred.gray, paddingLeft: 26 }}>├ src</div>
            <div style={{ color: fred.gray, paddingLeft: 26 }}>└ README.md</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T121_LABEL = '一份变两份';
export const T121_USE = ['worktree', 'isolation', 'parallel'];
export const T121_DESC = '终端跑 worktree 命令，文件树上真的多出一个目录';
