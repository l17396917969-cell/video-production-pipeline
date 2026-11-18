import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, fred } from '../kit';
import { Glow, Grain, StageGradient } from './VisualStack';
import { ContactShadow, GridFloor, Sweep } from './Stage3D';

export type T116Props = {
  owner?: string;
  repo?: string;
  stars?: number;
  bg?: string;
  bgStart?: number;
  startAt?: number;
};

/**
 * 缓动：全片只锁这一条
 * cubic-bezier(0.16, 1, 0.3, 1) —— Anthropic / Linear / Stripe 用同一条
 * 快出慢收，落定时有"重量"，不弹跳。
 */
const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  // 近似 cubic-bezier(0.16, 1, 0.3, 1)
  return 1 - Math.pow(1 - t, 3.2);
};

const seg = (t: number, a: number, b: number) => ease((t - a) / (b - a));

/**
 * T116 · 开场（第五版）
 *
 * 这一版的核心变化：从"元素各自动"改成"一台摄影机在动"。
 *
 * 调研结论：AI 产品片的贵，来自有摄影机 + 有材质，不来自 3D 特效。
 * 所以这里只有一个 transform 在变——整个场景的 camera scale，
 * 数字、窗口、地面全部跟着这个镜头走，不是各缩各的。
 *
 * 时间轴（5 秒）：
 *   0.0–1.1  摄影机从 1.22 推近到 1.0，画面从虚到实（推镜）
 *   0.0–0.6  窗口从下方升起，同时从模糊变清晰（景深对焦）
 *   0.25–1.6 数字从 0 滚到 63,000
 *   0.9–1.4  repo 名淡入（错峰 0.65 秒）
 *   1.5–2.1  光扫过一次，数字落定
 *   2.2–3.1  摄影机第二次推近到窗口内的具体内容（punch-in）
 *   3.1–5.0  停住，让观众读
 */
export const T116RepoIntro: React.FC<T116Props> = ({
  owner = 'pingdotgg',
  repo = 't3code',
  stars = 63000,
  bg = 'video/t3-dark.mp4',
  bgStart = 18,
  startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startAt;

  // ── 摄影机：全场唯一的运动源 ──────────────────────────────
  // 第一段推镜：1.22 → 1.0（0 到 1.1 秒）
  const camIn = seg(t, 0, 1.1);
  // 第二段 punch-in：1.0 → 1.14（2.2 到 3.1 秒），落点在窗口内容区
  const punch = seg(t, 2.2, 3.1);
  const camScale = 1.22 - 0.22 * camIn + 0.14 * punch;

  // 推镜时带一点运动模糊，停住就没有
  const camSpeed = Math.abs(camIn - seg(t - 0.05, 0, 1.1)) + Math.abs(punch - seg(t - 0.05, 2.2, 3.1));
  const motionBlur = Math.min(1.6, camSpeed * 16);

  // ── 窗口：升起 + 对焦 ──────────────────────────────────
  const winRise = seg(t, 0, 0.6);
  const winBlur = (1 - seg(t, 0, 0.75)) * 12; // 12px → 0，模拟对焦
  const winOpacity = seg(t, 0, 0.45) * 0.92;

  // ── 数字：滚动 + 落定 ──────────────────────────────────
  const countP = seg(t, 0.25, 1.6);
  const count = Math.round(stars * countP);
  const numOpacity = seg(t, 0.2, 0.55);
  // 数字落定时轻微下压，像"砸"到位
  const numSettle = 1 + 0.03 * (1 - seg(t, 1.6, 2.0));

  // ── 文字：错峰入场 ────────────────────────────────────
  const repoP = seg(t, 0.9, 1.4);
  const starsP = seg(t, 1.5, 1.85);
  const captionP = seg(t, 2.4, 2.9);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* 摄影机容器：整个场景唯一的变换 */}
      <AbsoluteFill
        style={{
          transform: `scale(${camScale})`,
          transformOrigin: '50% 44%',
          filter: motionBlur > 0.15 ? `blur(${motionBlur}px)` : undefined,
        }}
      >
        {/* 后层：舞台渐变 + 两盏环境光（离镜头最远，最虚） */}
        <StageGradient tone="deep" />
        <Glow x="18%" y="14%" size={1040} color="rgba(133,84,232,0.5)" opacity={0.52} />
        <Glow x="86%" y="86%" size={880} color="rgba(60,120,255,0.34)" opacity={0.38} />

        {/* 地面：给物体一个可参照的落点 */}
        <GridFloor opacity={0.085} />

        {/* 中景：真实窗口（主体层，最锐利） */}
        {bg ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1240,
              transform: `translate(-50%, -32%) translateY(${(1 - winRise) * 90}px) perspective(1600px) rotateX(2.2deg) rotateY(-2.4deg)`,
              borderRadius: 22,
              overflow: 'hidden',
              boxShadow: '0 60px 120px rgba(0,0,0,0.62), 0 14px 36px rgba(0,0,0,0.42)',
              opacity: winOpacity,
              filter: winBlur > 0.1 ? `blur(${winBlur}px)` : undefined,
            }}
          >
            <OffthreadVideo
              src={staticFile(bg)}
              startFrom={Math.round(bgStart * fps)}
              muted
              style={{ width: '100%', display: 'block' }}
            />
            {/* 屏幕内壁高光：让"一块屏"有玻璃感 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 22,
                border: '1px solid rgba(255,255,255,0.10)',
                background:
                  'linear-gradient(148deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 34%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : null}

        <ContactShadow width={1500} opacity={0.5} />

        {/* 前层：数字 + 文字（最靠近镜头） */}
        <div
          style={{
            position: 'absolute',
            top: 62,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            opacity: numOpacity,
          }}
        >
          <div
            style={{
              fontFamily: font.mono,
              fontSize: fred.note * 0.82,
              letterSpacing: '0.03em',
              color: fred.onDark,
              opacity: repoP,
              transform: `translateY(${(1 - repoP) * 14}px)`,
            }}
          >
            {owner}/{repo}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              transform: `scale(${numSettle})`,
            }}
          >
            <div
              style={{
                fontFamily: font.sans,
                fontSize: fred.display * 1.86,
                fontWeight: 900,
                color: fred.canvas,
                letterSpacing: '-0.048em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 0 60px rgba(255,255,255,0.22)',
              }}
            >
              {count.toLocaleString('en-US')}
            </div>
            <div
              style={{
                fontFamily: font.mono,
                fontSize: fred.note * 1.05,
                fontWeight: 500,
                color: fred.purple,
                opacity: starsP,
                transform: `translateX(${(1 - starsP) * -12}px)`,
              }}
            >
              stars
            </div>
          </div>
        </div>

        {/* 底部说明：错峰最晚 */}
        <div
          style={{
            position: 'absolute',
            bottom: 92,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: font.sans,
            fontSize: fred.note * 0.8,
            fontWeight: 500,
            color: fred.onDarkStrong,
            opacity: captionP,
            transform: `translateY(${(1 - captionP) * 10}px)`,
          }}
        >
          T3 Code
          <span style={{ color: fred.onDarkWeak }}> · Agent 编排控制台</span>
        </div>

        {/* 扫光：只在数字落定时过一次 */}
        <Sweep period={11} />
      </AbsoluteFill>

      {/* 颗粒在最外层，不跟摄影机缩放，否则颗粒会被放大 */}
      <Grain opacity={0.042} />

      {/* 暗角：把视线收进中间 */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(72% 62% at 50% 42%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.52) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const T116_LABEL = '开场';
export const T116_USE = ['intro', 'repo', 'stars'];
export const T116_DESC = '一台摄影机推近 + 三层景深 + 数字滚动 + 错峰入场';
