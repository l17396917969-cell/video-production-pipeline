import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, font, fred, sp, term } from '../kit';

export type T122Props = {
  title?: string;
  rules?: { label: string; value: string; hot?: boolean }[];
  startAt?: number;
};

const p = (t: number, a: number, b: number) => E.out(Math.min(1, Math.max(0, (t - a) / (b - a))));

const PURPLE = fred.purple;

/**
 * T122 · 清理规则
 *
 * 上一版：六行文字，白底，没有承载物。
 * 这一版：做成真实的配置文件，规则就是配置项本身。
 * 文件是这个概念的原本形态——比任何示意都可信。
 */
export const T122CleanupRules: React.FC<T122Props> = ({
  title = '一份副本能活多久，全都是你定的',
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  const confRise = p(t, 0.05, 0.7);
  const confP = p(t, 0.05, 0.5);

  const lines = [
    { key: 'retainOnDirty', val: 'true', hot: false, note: '有未提交的改动就保留' },
    { key: 'retentionDays', val: '7', hot: false, note: '多少天后自动清理' },
    { key: 'retainAfterTask', val: 'false', hot: true, note: '任务完成后保留吗' },
    { key: 'deleteAfterMerge', val: 'true', hot: false, note: '合并之后' },
    { key: 'deleteWithThread', val: 'true', hot: false, note: '删掉任务时' },
    { key: 'deleteIfUnchanged', val: 'true', hot: false, note: '没改动过的副本' },
  ];

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
        一份副本能活多久，
        <span style={{ color: PURPLE }}>全都是你定的</span>
      </div>

      <div
        style={{
          width: 1520,
          borderRadius: 20,
          overflow: 'hidden',
          background: term.bg,
          boxShadow: '0 34px 72px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.14)',
          opacity: confP,
          transform: `translateY(${(1 - confRise) * 40}px)`,
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
            .t3/worktree.yaml
          </span>
        </div>

        <div style={{ padding: '24px 34px' }}>
          <div style={{ fontFamily: font.mono, fontSize: fred.note * 0.68, lineHeight: 1.9 }}>
            <div style={{ color: term.dim }}># 工作副本的清理策略</div>
            <div style={{ color: PURPLE }}>worktree:</div>
            {lines.map((l, i) => {
              const a = 0.55 + i * 0.26;
              const appear = p(t, a, a + 0.42);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    paddingLeft: 28,
                    opacity: appear,
                    clipPath: `inset(0 ${100 * (1 - appear)}% 0 0)`,
                    transform: `translateX(${(1 - appear) * -14}px)`,
                  }}
                >
                  <span style={{ color: term.key }}>{l.key}</span>
                  <span style={{ color: term.dim }}>:</span>
                  <span style={{ color: l.hot ? PURPLE : term.str, fontWeight: l.hot ? 700 : 400 }}>
                    {l.val}
                  </span>
                  <span style={{ color: term.dimmer, fontSize: fred.note * 0.55, marginLeft: 8 }}>{l.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T122_LABEL = '清理规则';
export const T122_USE = ['cleanup', 'settings', 'worktree'];
export const T122_DESC = '规则做成真实配置文件，每行逐条擦出';
