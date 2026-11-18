import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T88Props = { items: { text: string; done?: boolean }[]; title?: string };

/**
 * T88 · 清单勾选
 * 用途：讲"该做什么""做完了什么"
 * 画面：每行一个方框，勾从左往右画出，文字随后变亮
 */
export const T88Checklist: React.FC<T88Props> = ({ items, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2.5}>
      {items.map((it, i) => {
        const p = springIn(frame, fps, 4 + i * 8, 16);
        const tick = Math.min(1, Math.max(0, (frame - (8 + i * 8)) / 10));
        return (
          <div key={it.text} style={{ display: 'flex', alignItems: 'center', gap: sp(2), opacity: fade(p) }}>
            <div
              style={{
                width: sp(3.4),
                height: sp(3.4),
                borderRadius: 6,
                border: `2px solid ${it.done !== false ? palette.ok : 'rgba(255,255,255,0.22)'}`,
                background: it.done !== false ? 'rgba(61,220,151,0.14)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {it.done !== false ? (
                <svg width={18} height={18} viewBox="0 0 24 24">
                  <path
                    d="M4 12 L9 17 L20 6"
                    fill="none"
                    stroke={palette.ok}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={40}
                    strokeDashoffset={40 * (1 - tick)}
                  />
                </svg>
              ) : null}
            </div>
            <span
              style={{
                fontFamily: font.sans,
                fontSize: type.s,
                color: it.done !== false ? palette.ink : 'rgba(255,255,255,0.45)',
              }}
            >
              {it.text}
            </span>
          </div>
        );
      })}
    </Panel>
  );
};

export const T88_LABEL = '清单勾选';
export const T88_USE = ['list', 'checklist', 'steps'];
export const T88_DESC = '方框里逐行画出对勾，已完成的文字变亮';
