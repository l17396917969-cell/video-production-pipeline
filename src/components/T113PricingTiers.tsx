import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, type } from '../kit';
import { Panel } from './_base';

export type T113Props = {
  tiers: { name: string; price: string; period?: string; features: string[]; highlight?: boolean }[];
  title?: string;
};

/**
 * T113 · 三档方案
 * 用途：讲定价、讲套餐、讲"你该选哪个"
 * 画面：三列并排，重点那列抬高一截并加边框
 * 参考：remotion-templates 的 pricing-three-tier-highlight 思路
 */
export const T113PricingTiers: React.FC<T113Props> = ({ tiers, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel title={title} gap={3}>
      <div style={{ display: 'flex', gap: sp(2.5), alignItems: 'flex-end' }}>
        {tiers.map((t, i) => {
          const p = springIn(frame, fps, 4 + i * 8, 20);
          const hot = t.highlight;
          return (
            <div
              key={t.name}
              style={{
                ...riseIn(p, 22),
                opacity: fade(p),
                flex: 1,
                padding: sp(3),
                paddingTop: hot ? sp(4) : sp(3),
                background: hot ? 'rgba(99,91,255,0.14)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${hot ? palette.accent : 'rgba(255,255,255,0.10)'}`,
                borderRadius: 14,
                marginBottom: hot ? sp(2.5) : 0,
                display: 'flex',
                flexDirection: 'column',
                gap: sp(1.2),
              }}
            >
              <div style={{ fontFamily: font.sans, fontSize: type.small, fontWeight: 640, color: hot ? palette.accentSoft : 'rgba(255,255,255,0.6)' }}>
                {t.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: font.sans, fontSize: type.m, fontWeight: 720, color: palette.ink }}>{t.price}</span>
                {t.period ? (
                  <span style={{ fontFamily: font.mono, fontSize: type.micro, color: 'rgba(255,255,255,0.4)' }}>/{t.period}</span>
                ) : null}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: sp(1) }}>
                {t.features.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: sp(1), fontFamily: font.sans, fontSize: type.micro, color: 'rgba(255,255,255,0.55)' }}>
                    <span style={{ color: hot ? palette.accentSoft : palette.ok }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const T113_LABEL = '三档方案';
export const T113_USE = ['pricing', 'plans', 'compare'];
export const T113_DESC = '三列并排，重点那列抬高一截并加强调边框，讲定价用';
