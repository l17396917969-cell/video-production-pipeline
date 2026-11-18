import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T95Props = { tags: string[]; title?: string; highlight?: string[] };

/**
 * T95 · 标签墙
 * 用途：一堆名词铺满——能力清单、支持列表
 * 画面：标签从左到右逐行弹出，重点标签反色
 */
export const T95TagWall: React.FC<T95Props> = ({ tags, title, highlight = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={2}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp(1.2) }}>
        {tags.map((t, i) => {
          const p = springIn(frame, fps, 2 + i * 3, 14);
          const hot = highlight.includes(t);
          return (
            <span
              key={t}
              style={{
                opacity: fade(p),
                transform: `scale(${0.85 + p * 0.15})`,
                padding: `${sp(1)}px ${sp(2)}px`,
                borderRadius: sp(9),
                background: hot ? palette.accent : 'rgba(255,255,255,0.05)',
                border: `1px solid ${hot ? palette.accent : 'rgba(255,255,255,0.10)'}`,
                fontFamily: font.sans,
                fontSize: type.small,
                fontWeight: hot ? 640 : 500,
                color: hot ? palette.paper : 'rgba(255,255,255,0.7)',
              }}
            >
              {t}
            </span>
          );
        })}
      </div>
    </Panel>
  );
};

export const T95_LABEL = '标签墙';
export const T95_USE = ['list', 'capability', 'tags'];
export const T95_DESC = '标签逐行弹出铺满，重点标签反色，用来列能力清单';
