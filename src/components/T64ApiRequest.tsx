import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T64Props = {
  method: string;
  path: string;
  status: number;
  latency?: string;
  body?: string;
  title?: string;
};

/**
 * T64 · 接口请求
 * 用途：讲调用、讲失败率、讲延迟
 * 画面：请求行向左，状态码和耗时向右，中间一条线把它们连起来
 */
export const T64ApiRequest: React.FC<T64Props> = ({ method, path, status, latency, body, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pReq = springIn(frame, fps, 0, 18);
  const pLine = springIn(frame, fps, 10, 20);
  const pRes = springIn(frame, fps, 20, 18);
  const ok = status < 400;
  const color = ok ? palette.ok : palette.danger;

  return (
    <Panel title={title} gap={3}>
      <div style={{ display: 'flex', alignItems: 'center', gap: sp(3), opacity: fade(pReq) }}>
        <span
          style={{
            padding: `${sp(0.6)}px ${sp(1.5)}px`,
            background: palette.accent,
            borderRadius: 6,
            fontFamily: font.mono,
            fontSize: type.small,
            fontWeight: 700,
            color: palette.paper,
          }}
        >
          {method}
        </span>
        <span style={{ fontFamily: font.mono, fontSize: type.body, color: palette.ink }}>{path}</span>
      </div>

      <div style={{ height: 2, width: `${pLine * 100}%`, background: 'rgba(255,255,255,0.14)' }} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: sp(3), opacity: fade(pRes) }}>
        <span style={{ fontFamily: font.mono, fontSize: type.l, fontWeight: 720, color }}>
          {status}
        </span>
        {latency ? (
          <span style={{ fontFamily: font.mono, fontSize: type.small, color: 'rgba(255,255,255,0.45)' }}>
            {latency}
          </span>
        ) : null}
      </div>

      {body ? (
        <div
          style={{
            opacity: fade(pRes),
            fontFamily: font.mono,
            fontSize: type.small,
            color: 'rgba(255,255,255,0.55)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: sp(2),
            whiteSpace: 'pre-wrap',
          }}
        >
          {body}
        </div>
      ) : null}
    </Panel>
  );
};

export const T64_LABEL = '接口请求';
export const T64_USE = ['code', 'api', 'debug'];
export const T64_DESC = '方法 + 路径 + 状态码 + 耗时，成功绿失败红，可带返回体';
