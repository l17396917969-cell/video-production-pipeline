---
name: assemble
description: 把稿件、音频时间轴、镜头素材装配成片子。逐句从组件库挑画面，写 manifest，渲染，过门禁。
---

# 装配

**输入**：`script.md` + `timeline.json` + `shots.json`
**输出**：`episodes/<期号>/manifest.json` → `out.mp4`

## 核心动作：逐句挑组件

**每句口播对应一个画面。顺序不能跳。**

对每一句：

1. **写画面描述**。写「镜头里看得见的对象和动作」，不是复述旁白。
   - ✗ 错：`AI 改变了开发方式`
   - ✓ 对：`两个方案左右并排对比，右边高亮`
2. **检索**：`node scripts/find.mjs "画面描述"`
3. **看前 3 个候选**的 desc 和样片图（`out/previews/T0x/p30.png`）
4. **记下理由**：为什么选它 / 为什么排除另外两个
5. 写进 manifest

候选都不合适 → **报告缺口**，说明缺什么类型的画面。不要退成大字页。

## manifest 格式

```json
{
  "episode": "0001",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "audio": "audio/full.wav",
  "segments": [
    {
      "id": "s01",
      "line": "稿件里的那句",
      "start": 0,
      "end": 4.2,
      "component": "T01",
      "props": { "kicker": "…", "title": "…" },
      "candidates": [
        { "id": "T01", "why": "开场唯一选择" },
        { "id": "T07", "why": "排除：金句没有标题层级" },
        { "id": "T03", "why": "排除：流程感过强" }
      ],
      "media": null
    }
  ]
}
```

`candidates` 不是给用户看的，是给门禁查的。**没写满 3 个会被 gate 拦下。**

## 渲染

```bash
# 预览：先出 1080p，看画面
npx remotion render src/index.ts Episode out/preview.mp4 --props=episodes/0001/manifest.json

# 正式：4K
npx remotion render src/index.ts Episode out/final.mp4 --props=episodes/0001/manifest.json --width=3840 --height=2160
```

**先预览再正式。** 4K 渲染很慢，别用 4K 试错。

## 门禁

```bash
node scripts/gate.mjs episodes/0001
```

会检查：组件候选够不够 3 个、时长对不对、有没有黑屏/闪帧、音频在不在、字幕有没有压到正文。

**PASS 之前不许说完成。**

## 禁止

- 禁止跳过检索直接写组件
- 禁止只记选中的，不记排除的
- 禁止在 props 里塞长文案（超过 20 字就拆句）
- 禁止一个组件连续用超过 2 次（观众会腻）
