# 全自动 AI 视频制作流水线

把一个 GitHub 项目，做成一条 60–90 秒的产品介绍视频。选题、写稿、配音、录屏、动效、装配、发布文案，每个环节都有工具和人可读的规范。

基于 [Remotion](https://remotion.dev/) 做画面，ffmpeg 做音视频处理，MiniMax 做中文语音合成。

## 流水线六步

| 步 | 读哪份 | 工具 | 产出 | 人要不要看 |
| --- | --- | --- | --- | --- |
| 1 选题 | `skills/01-topic-radar.md` | `radar.mjs` | 5 条候选 + 角度 | **要选 1 条** |
| 2 写稿 | `skills/02-script.md` | — | 逐字稿 | 可以改 |
| 3 素材 | `skills/03-material.md` | `record.mjs`、`shoot.mjs` | 画面需求表 + 真实画面 | 不用 |
| 4 配音 | `skills/04-voice.md` | `voice-episode.mjs` | 分句音频 + 时间轴 | 试听 |
| 5 装配 | `skills/05-assemble.md` | `render-episode.mjs` | 成片 | **要看画面** |
| 6 发布 | `skills/06-publish.md` | `publish.mjs` | 平台文案 + 封面 | **要点发布** |

人只做三个决定：**选题、确认画面、点发布**。其余全是自动的。

## 目录

```
src/
  components/      画面组件（一个文件一种画面，共 100+ 个）
  kit.ts           设计常量：颜色、字号、间距、缓动。改风格只改这里
  catalog.ts       组件索引，AI 检索入口
  Episode.tsx      装配：把镜头按 manifest 串成一条片子
  Root.tsx         注册（由 gen-registry.mjs 生成，不要手改）
scripts/
  radar.mjs            选题雷达：抓 GitHub 趋势
  record.mjs           录屏：Playwright 录制真实界面
  shoot.mjs            截图：抓取真实页面
  tts*.mjs             语音合成
  voice-episode.mjs    一期节目的配音编排
  build-subtitles.mjs  时间轴 → SRT / ASS
  mix-audio.mjs        配音 + 配乐混音
  gen-registry.mjs     扫描组件，生成注册表和索引
  gate.mjs             门禁：交付前必须 PASS
  render-episode.mjs   渲染成片（支持 --only 单镜渲染）
  review-frames.mjs    审片墙：抽帧拼成一张图
  publish.mjs          发布文案生成（不自动发布）
skills/             八份操作手册
rules/              五份规则库
docs/               补充文档
```

## 快速开始

```bash
npm install
npm run studio        # 打开 Remotion 预览
```

跑一期的完整流程：

```bash
node scripts/radar.mjs                    # 1 找选题
# 2 写稿：手写到 episodes/<期号>/script.txt
node scripts/voice-episode.mjs episodes/<期号>   # 4 配音
node scripts/record.mjs                   # 3 录屏（按需）
node scripts/render-episode.mjs episodes/<期号>  # 5 出片
node scripts/gate.mjs episodes/<期号>     # 门禁
node scripts/publish.mjs episodes/<期号>  # 6 文案
```

## 核心设计

### 画面是"组件"，不是"模板"

每一镜是一个 React 组件，`Episode.tsx` 按 `manifest.json` 把它串起来。换一镜就改一个 JSON 字段，不用碰代码。组件全部走 `kit.ts` 里的常量，所以改一次设计系统，全片跟着变。

### manifest 是唯一真相

一期的剪辑结构写在 `episodes/<期号>/manifest.json`：

```json
{
  "segments": [
    { "id": "s01", "start": 0, "end": 4.6, "component": "T116", "props": { ... } },
    { "id": "s02", "start": 4.6, "end": 9.1, "component": "T126", "props": { ... } }
  ],
  "subtitles": [ { "start": 0, "end": 3.4, "text": "..." } ]
}
```

时间轴的来源是配音的 `timeline.json`——**画面切点踩在句子边界上**，不是拍脑袋定的。

### 门禁先于交付

`gate.mjs` 会拦住这些东西：

- 组件里写死字号 / 颜色（必须走 `kit.ts`）
- 真实素材占比低于 50%（画面被大字灌满）
- 同一素材用超过 3 次
- 单镜超过 5 秒
- manifest 里的镜号不存在

跑不过门禁就不交付。

### 单镜渲染

改一个镜不用重渲整片：

```bash
node scripts/render-episode.mjs episodes/t3code --only s02
```

输出到 `episodes/<期号>/segments/s02.mp4`，音频自动从这一镜在全片里的起点切。

## 规范库

`skills/` 是操作手册，`rules/` 是判断标准。**开新片前必读 `rules/VIDEO.md`**。

几条不打折的：

- **写稿前先读源码**，不是读 README。至少三句是只有读过代码才说得出的
- **身份是技术点评者**，不是体验博主：讲"它在赌什么、边界在哪"
- **素材是证据不是插图**：全片至少 3 个"极强"画面
- **禁止脱离组件库原创画面**：先搜 `catalog.ts`，前 3 个候选逐个看
- **禁止自动点发布**
- **禁止覆盖原件**

## 素材说明

仓库不含字体和视频素材（体积原因）：

- **字体**：思源黑体 / Noto Sans SC 四个字重，放到 `public/fonts/`
- **配乐**：放到 `public/music/`
- **录屏**：用 `scripts/record.mjs` 自己录

## 踩过的坑

- **Playwright 的 `recordVideo` + `deviceScaleFactor` 不能叠加**：会把界面挤到左上角，其余是灰块。要高清就用大 viewport（如 3200×2000）
- **Remotion 里视频用 `transform: scale` 放大，超出部分会被裁掉**：换窗口尺寸或 `objectPosition`
- **`gen-registry.mjs` 会重写 `Root.tsx`**：要改 Root 的模板，去改脚本里的字符串
- **`amix` 的 `normalize` 参数**：老 ffmpeg 不认，混完掉 9 dB
- **`TransitionSeries` 会缩短总时长**：音轨不要跟着裁，末尾留静音

## 许可

内部工具，按需取用。
