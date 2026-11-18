import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';

export type T77Props = {
  title: string;
  body?: string;
  confirm?: string;
  cancel?: string;
  danger?: boolean;
};

/**
 * T77 · 弹窗
 * 用途：讲"它要你确认"——权限确认、删除确认、危险操作
 * 画面：背景压暗，弹窗从中心放大出现，确认按钮用强调色或红色
 */
export const T77DialogModal: React.FC<T77Props> = ({ title, body, confirm = '确认', cancel = '取消', danger }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 4, 20);
  const accentColor = danger ? palette.danger : palette.accent;

  return (
    <AbsoluteFill style={{ background: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.6 * p})` }} />
      <div
        style={{
          opacity: fade(p),
          transform: `scale(${0.9 + p * 0.1})`,
          width: sp(72),
          background: palette.surface2,
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: sp(2.2),
          padding: sp(3.5),
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ fontFamily: font.sans, fontSize: type.s, fontWeight: 660, color: palette.ink }}>
          {title}
        </div>
        {body ? (
          <div style={{ fontFamily: font.sans, fontSize: type.small, color: 'rgba(255,255,255,0.55)', marginTop: sp(1.5), lineHeight: 1.6 }}>
            {body}
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: sp(1.5), marginTop: sp(3), justifyContent: 'flex-end' }}>
          <div
            style={{
              padding: `${sp(1)}px ${sp(2.4)}px`,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.14)',
              fontFamily: font.sans,
              fontSize: type.small,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {cancel}
          </div>
          <div
            style={{
              padding: `${sp(1)}px ${sp(2.4)}px`,
              borderRadius: 8,
              background: accentColor,
              fontFamily: font.sans,
              fontSize: type.small,
              fontWeight: 620,
              color: palette.paper,
            }}
          >
            {confirm}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T77_LABEL = '弹窗';
export const T77_USE = ['dialog', 'confirm', 'permission'];
export const T77_DESC = '背景压暗 + 居中弹窗 + 取消/确认按钮，危险操作用红色';
