import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T73Props = {
  steps: { cmd: string; out?: string; ok?: boolean }[];
  title?: string;
};

/**
 * T73 · 安装步骤
 * 用途：把"怎么装"讲清楚——一条命令一行回显
 * 画面：每步一条命令 + 一行真实输出，成功的打勾
 */
export const T73InstallSteps: React.FC<T73Props> = ({ steps, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: sp(2) }}>
        {steps.map((s, i) => {
          const p = springIn(frame, fps, 4 + i * 12, 18);
          return (
            <div
              key={i}
              style={{
                opacity: fade(p),
                transform: `translateX(${(1 - p) * -14}px)`,
                background: palette.term,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: `${sp(1.6)}px ${sp(2.2)}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: sp(1.5), fontFamily: font.mono, fontSize: type.small }}>
                <span style={{ color: palette.accentSoft }}>{i + 1}</span>
                <span style={{ color: palette.ok }}>$</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{s.cmd}</span>
                {s.ok !== false ? (
                  <span style={{ color: palette.ok, marginLeft: 'auto' }}>✓</span>
                ) : null}
              </div>
              {s.out ? (
                <div style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.42)', paddingLeft: sp(4) }}>
                  {s.out}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T73_LABEL = '安装步骤';
export const T73_USE = ['install', 'setup', 'steps'];
export const T73_DESC = '一步一步的安装命令加真实回显，成功的打勾';
