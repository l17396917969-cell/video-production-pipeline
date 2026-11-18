import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, type } from '../kit';
import { Panel } from './_base';

export type T72Props = {
  vars: { name: string; value?: string; present?: boolean }[];
  title?: string;
  hint?: string;
};

/**
 * T72 · 环境变量
 * 用途：讲配置、讲缺了什么——缺的那个用红色标出来
 * 画面：每行一个变量，有值的绿色打勾，缺的红色打叉
 */
export const T72EnvVars: React.FC<T72Props> = ({ vars, title, hint }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2}>
      <div
        style={{
          background: palette.term,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: sp(2.5),
        }}
      >
        {vars.map((v, i) => {
          const p = Math.min(1, Math.max(0, (frame - i * 6) / 14));
          const ok = v.present !== false;
          const color = ok ? palette.ok : palette.danger;
          return (
            <div
              key={v.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: sp(2),
                opacity: fade(p),
                fontFamily: font.mono,
                fontSize: type.small,
                lineHeight: 2,
              }}
            >
              <span style={{ color, width: sp(2) }}>{ok ? '✓' : '✗'}</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{v.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
                {v.value ?? (ok ? '已设置' : '未设置')}
              </span>
            </div>
          );
        })}
      </div>
      {hint ? (
        <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.45)' }}>{hint}</div>
      ) : null}
    </Panel>
  );
};

export const T72_LABEL = '环境变量';
export const T72_USE = ['config', 'debug', 'setup'];
export const T72_DESC = '逐行列出环境变量，有值打绿勾、缺失打红叉，缺的那项一眼看到';
