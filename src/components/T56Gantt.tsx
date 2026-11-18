import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T56Props = {
  tasks: { name: string; start: number; span: number }[];
  total: number;
  title?: string;
};

/**
 * T56 · 甘特图
 * 用途：并行、排期——谁和谁同时在跑
 * 画面：左侧任务名，右侧时间条从左向右长出来
 */
export const T56Gantt: React.FC<T56Props> = ({ tasks, total, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: sp(1.6) }}>
        {tasks.map((t, i) => {
          const p = springIn(frame, fps, 4 + i * 7, 18);
          return (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: sp(2), opacity: fade(p) }}>
              <div
                style={{
                  width: sp(20),
                  fontFamily: font.sans,
                  fontSize: type.small,
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'right',
                }}
              >
                {t.name}
              </div>
              <div style={{ flex: 1, height: sp(4), background: 'rgba(255,255,255,0.04)', borderRadius: 6, position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: `${(t.start / total) * 100}%`,
                    width: `${(t.span / total) * 100 * p}%`,
                    height: '100%',
                    background: i % 2 === 0 ? palette.accent : palette.accentSoft,
                    borderRadius: 6,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: sp(22), fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.3)' }}>
          <span>0</span>
          <span>{total}</span>
        </div>
      </div>
    </Panel>
  );
};

export const T56_LABEL = '甘特图';
export const T56_USE = ['plan', 'parallel', 'schedule'];
export const T56_DESC = '每行一个任务，时间条从左向右长出来，一眼看出并行段';
