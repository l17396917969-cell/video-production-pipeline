import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T69Props = { branches: { name: string; commits: { msg: string; merged?: boolean }[] }[]; title?: string };

/**
 * T69 · 提交图
 * 用途：分支怎么分的、怎么合的——讲 worktree、讲并行最直观
 * 画面：每条分支一条竖线，提交点依次亮起，合并处有横线连接
 */
export const T69CommitGraph: React.FC<T69Props> = ({ branches, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ROW = 74;

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'flex', gap: sp(6) }}>
        {branches.map((b, bi) => {
          const pLine = springIn(frame, fps, bi * 6, 18);
          return (
            <div key={b.name} style={{ position: 'relative', paddingLeft: sp(3) }}>
              <div
                style={{
                  position: 'absolute',
                  left: sp(1),
                  top: sp(4),
                  bottom: 0,
                  width: 2,
                  height: `${pLine * 100}%`,
                  background: bi === 0 ? palette.accent : 'rgba(255,255,255,0.20)',
                }}
              />
              <div style={{ fontFamily: font.mono, fontSize: type.micro, color: bi === 0 ? palette.accentSoft : 'rgba(255,255,255,0.45)', marginBottom: sp(2) }}>
                {b.name}
              </div>
              {b.commits.map((c, ci) => {
                const p = springIn(frame, fps, 4 + bi * 5 + ci * 4, 14);
                return (
                  <div
                    key={ci}
                    style={{
                      height: ROW,
                      display: 'flex',
                      alignItems: 'center',
                      gap: sp(2),
                      opacity: fade(p),
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: sp(2),
                        height: sp(2),
                        borderRadius: sp(1),
                        background: c.merged ? palette.ok : palette.accent,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: font.sans,
                        fontSize: type.small,
                        color: 'rgba(255,255,255,0.72)',
                        whiteSpace: 'nowrap',
                        maxWidth: sp(34),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.msg}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T69_LABEL = '提交图';
export const T69_USE = ['git', 'branches', 'parallel'];
export const T69_DESC = '每条分支一条竖线，提交点依次亮起，合并点用绿色标出';
