import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { pushCut } from '@remotion/transitions/push-cut';
import { crossZoom } from '@remotion/transitions/cross-zoom';
import { REGISTRY } from './registry';
import { SceneCamera } from './components/SceneCamera';
import { font, palette, sp } from './kit';

export type Subtitle = { start: number; end: number; text: string };

export type Segment = {
  id: string;
  start: number;
  end: number;
  component: string;
  props?: Record<string, unknown>;
};

export type Manifest = {
  episode?: string;
  fps: number;
  width?: number;
  height?: number;
  audio?: string;
  segments: Segment[];
  subtitles?: Subtitle[];
};

/** 字幕：白字 + 半透明黑底框，盒子跟文字宽度走 */
const Subtitles: React.FC<{ subs: Subtitle[]; fps: number }> = ({ subs, fps }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const current = subs.find((s) => t >= s.start && t < s.end);
  if (!current) return null;

  const local = (t - current.start) * fps;
  const tail = (current.end - t) * fps;
  const opacity = Math.min(1, local / 4, tail / 4);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: sp(7) }}>
      <div
        style={{
          opacity,
          maxWidth: '82%',
          padding: `${sp(1.5)}px ${sp(3)}px`,
          background: 'rgba(0,0,0,0.62)',
          borderRadius: 14,
          color: '#FFFFFF',
          fontFamily: font.sans,
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.38,
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}
      >
        {current.text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * 段内运动：每镜一个主动作
 *
 * 调研规则：每镜一个主动作；推近落点必须是按钮/数字/代码行。
 * 1 → 1.032，0.7 秒到位后停住，不全程慢漂。
 */
const Motion: React.FC<{ kind?: 'push' | 'pull' | 'still'; children: React.ReactNode }> = ({
  kind = 'push',
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (kind === 'still') return <AbsoluteFill>{children}</AbsoluteFill>;

  const k = Math.min(1, Math.max(0, (t - 0.15) / 0.7));
  const eased = k * k * (3 - 2 * k);
  const scale = kind === 'push' ? 1 + 0.032 * eased : 1.032 - 0.032 * eased;

  return <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

/**
 * 转场配方
 *
 * 调研：70–80% 硬切 + 3 个软转场。但硬切不能用"静帧对静帧"，
 * 要用 pushCut —— 两端 punch-in + 11 帧微闪，切点藏进运动里。
 *
 * - 章节缝（换气）：fade 10 帧
 * - 普通硬切：pushCut 11 帧（这是"高级硬切"的关键）
 * - 同空间推近：crossZoom 14 帧
 */
const SOFT_SEAMS = new Set<string>(['s05', 's09', 's13']);
const ZOOM_SEAMS = new Set<string>(['s04', 's11']);

type TransitionSpec = {
  presentation: ReturnType<typeof fade> | ReturnType<typeof pushCut> | ReturnType<typeof crossZoom>;
  frames: number;
};

const transitionFor = (fromId: string): TransitionSpec => {
  if (SOFT_SEAMS.has(fromId)) return { presentation: fade(), frames: 10 };
  if (ZOOM_SEAMS.has(fromId)) return { presentation: crossZoom(), frames: 14 };
  // 普通硬切：punch-in + 微闪，11 帧
  return {
    presentation: pushCut({
      cutProgress: 0.45,
      outgoingScale: 1.06,
      incomingStartScale: 0.96,
      incomingEndScale: 1,
      flashColor: '#FFFFFF',
      flashOpacity: 0.12,
      flashFrames: 4,
    }),
    frames: 11,
  };
};

/** 计算所有转场占掉的额外帧数，用来对齐音轨 */
export const totalTransitionFrames = (segs: Segment[]): number => {
  let n = 0;
  for (let i = 0; i < segs.length - 1; i++) {
    n += transitionFor(segs[i].id).frames;
  }
  return n;
};

export const Episode: React.FC<{ manifest: Manifest }> = ({ manifest }) => {
  const { fps } = useVideoConfig();
  const segs = manifest?.segments ?? [];

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      {manifest?.audio ? <Audio src={staticFile(manifest.audio)} /> : null}

      <TransitionSeries>
        {segs.map((s, i) => {
          const frames = Math.max(1, Math.round((s.end - s.start) * fps));
          const C = REGISTRY[s.component];
          const tr = i < segs.length - 1 ? transitionFor(s.id) : null;

          // 每镜主动作：开场推、部分段拉、其余推
          // 段内运动交给 SceneCamera，这里只保留占位
          const motion: 'push' | 'pull' | 'still' = 'still';

          return [
            <TransitionSeries.Sequence key={s.id} durationInFrames={frames}>
              <SceneCamera
                push={0.045}
                origin="50% 46%"
                length={s.end - s.start}
                vignette={s.component === 'T117' || s.id === 's01' || s.id === 's14' ? 0 : 0.14}
                still={
                  // 录屏类镜头本身就在动，再放大只会重采样变糊
                  s.component === 'T117' || s.id === 's01' || s.id === 's14'
                }
              >
              <Motion kind={motion}>
                {C ? (
                  <C {...s.props} />
                ) : (
                  <AbsoluteFill
                    style={{
                      background: palette.bg,
                      color: palette.warn,
                      fontFamily: font.sans,
                      fontSize: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    缺组件：{s.component}
                  </AbsoluteFill>
                )}
              </Motion>
              </SceneCamera>
            </TransitionSeries.Sequence>,
            tr ? (
              <TransitionSeries.Transition
                key={`t-${s.id}`}
                presentation={tr.presentation}
                timing={linearTiming({ durationInFrames: tr.frames })}
              />
            ) : null,
          ];
        })}
      </TransitionSeries>

      {manifest.subtitles?.length ? <Subtitles subs={manifest.subtitles} fps={fps} /> : null}
    </AbsoluteFill>
  );
};
