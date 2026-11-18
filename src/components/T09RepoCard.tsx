import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fade, font, palette, riseIn, sp, springIn, themeOf, type } from '../kit';

export type T09Props = {
  owner: string;
  repo: string;
  desc: string;
  stars?: string;
  lang?: string;
  langColor?: string;
  theme?: 'dark' | 'light';
};

/**
 * T09 · 仓库卡片
 * 用途：介绍一个 GitHub 项目的第一屏
 * 画面：卡片落下 → 仓库名升起 → 描述淡入 → 底部 star/语言逐个出现
 */
export const T09RepoCard: React.FC<T09Props> = ({
  owner,
  repo,
  desc,
  stars,
  lang,
  langColor = palette.langTS,
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = themeOf(theme);

  const pCard = springIn(frame, fps, 0, 22);
  const pRepo = springIn(frame, fps, 6, 22);
  const pDesc = springIn(frame, fps, 14, 22);
  const pMeta = springIn(frame, fps, 24, 20);

  return (
    <AbsoluteFill
      style={{
        background: th.bg,
        padding: sp(14),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity: fade(pCard),
          transform: `translateY(${(1 - pCard) * 32}px)`,
          width: '100%',
          maxWidth: sp(140),
          border: `1px solid ${th.hairline}`,
          background: theme === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.03)',
          borderRadius: sp(3),
          padding: sp(6),
          display: 'flex',
          flexDirection: 'column',
          gap: sp(3),
          boxShadow: theme === 'dark' ? '0 32px 80px rgba(0,0,0,0.45)' : '0 24px 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            ...riseIn(pRepo, 16),
            fontFamily: font.sans,
            fontSize: type.m,
            fontWeight: 620,
            color: th.ink,
            display: 'flex',
            alignItems: 'baseline',
            gap: sp(1),
          }}
        >
          <span style={{ color: th.muted, fontWeight: 400 }}>{owner} /</span>
          <span>{repo}</span>
        </div>

        <div
          style={{
            ...riseIn(pDesc, 18),
            fontFamily: font.sans,
            fontSize: type.body,
            lineHeight: 1.55,
            color: th.muted,
            maxWidth: sp(110),
          }}
        >
          {desc}
        </div>

        <div
          style={{
            opacity: fade(pMeta),
            display: 'flex',
            gap: sp(5),
            marginTop: sp(2),
            fontFamily: font.sans,
            fontSize: type.small,
            color: th.muted,
            alignItems: 'center',
          }}
        >
          {lang ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: sp(1) }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: langColor }} />
              {lang}
            </span>
          ) : null}
          {stars ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: sp(1) }}>
              <span style={{ color: palette.warn }}>★</span>
              {stars}
            </span>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const T09_LABEL = '仓库卡片';
export const T09_USE = ['github', 'opening', 'explain'];
export const T09_DESC = '一张 GitHub 仓库卡片落下，仓库名、描述、star 数和语言标签依次出现';
