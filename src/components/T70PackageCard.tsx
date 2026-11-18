import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T70Props = {
  name: string;
  version: string;
  install: string;
  tags?: string[];
  note?: string;
};

/**
 * T70 · 包卡片
 * 用途：讲要装什么——包名、版本、安装命令一次给全
 * 画面：卡片落下，包名大、命令用等宽字，标签在底部
 */
export const T70PackageCard: React.FC<T70Props> = ({ name, version, install, tags, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 0, 22);
  const pCmd = springIn(frame, fps, 12, 18);
  const pTag = springIn(frame, fps, 22, 16);

  return (
    <Panel align="center">
      <div
        style={{
          opacity: fade(p),
          transform: `translateY(${(1 - p) * 20}px)`,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: sp(4),
          minWidth: sp(90),
          display: 'flex',
          flexDirection: 'column',
          gap: sp(2),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: sp(2) }}>
          <span style={{ fontFamily: font.mono, fontSize: type.l, fontWeight: 700, color: palette.ink }}>
            {name}
          </span>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: type.small,
              color: palette.accentSoft,
              background: 'rgba(99,91,255,0.16)',
              padding: `2px ${sp(1)}px`,
              borderRadius: 6,
            }}
          >
            v{version}
          </span>
        </div>

        <div
          style={{
            opacity: fade(pCmd),
            background: palette.term,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: `${sp(1.5)}px ${sp(2)}px`,
            fontFamily: font.mono,
            fontSize: type.small,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <span style={{ color: palette.ok }}>$ </span>
          {install}
        </div>

        {tags ? (
          <div style={{ display: 'flex', gap: sp(1), opacity: fade(pTag), flexWrap: 'wrap' }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: font.mono,
                  fontSize: type.micro,
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: sp(6),
                  padding: `2px ${sp(1.2)}px`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {note ? (
          <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.45)' }}>{note}</div>
        ) : null}
      </div>
    </Panel>
  );
};

export const T70_LABEL = '包卡片';
export const T70_USE = ['code', 'install', 'package'];
export const T70_DESC = '包名 + 版本 + 安装命令 + 标签，讲"要装什么"时一次给全';
