import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { palette, sp } from '../kit';

export type T81Props = { rows?: number; avatar?: boolean };

/**
 * T81 · 骨架屏
 * 用途：表现界面"还没加载出来"——比截图更能说明卡顿
 * 画面：头像圆 + 几行条块，整体呼吸闪烁
 */
export const T81Skeleton: React.FC<T81Props> = ({ rows = 4, avatar = true }) => {
  const frame = useCurrentFrame();
  const breath = 0.5 + 0.5 * Math.sin(frame / 14);

  const bar = (w: string, h: number, key: number) => (
    <div
      key={key}
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: `rgba(255,255,255,${0.06 + breath * 0.08})`,
      }}
    />
  );

  return (
    <AbsoluteFill style={{ background: palette.bg, padding: sp(12), justifyContent: 'center', gap: sp(3) }}>
      <div style={{ display: 'flex', gap: sp(2.5), alignItems: 'center' }}>
        {avatar ? (
          <div
            style={{
              width: sp(8),
              height: sp(8),
              borderRadius: sp(4),
              background: `rgba(255,255,255,${0.06 + breath * 0.08})`,
            }}
          />
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp(1.2), flex: 1 }}>
          {bar('42%', 22, 1)}
          {bar('24%', 16, 2)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: sp(1.5) }}>
        {Array.from({ length: rows }).map((_, i) => bar(`${96 - i * 8}%`, 18, i + 10))}
      </div>
    </AbsoluteFill>
  );
};

export const T81_LABEL = '骨架屏';
export const T81_USE = ['ui', 'loading', 'placeholder'];
export const T81_DESC = '头像圆 + 条块骨架，整体呼吸闪烁，表现内容还没加载';
