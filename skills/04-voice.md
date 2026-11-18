---
name: voice-and-subtitle
description: 把逐字稿变成分句音频 + 精确时间戳 + SRT。按句合成，改一句话只重生成一句。处理中英混读的术语发音。
---

# 配音与字幕

**输入**：`script.md`
**输出**：`episodes/<期号>/audio/s01.wav … sNN.wav` + `timeline.json` + `subtitle.srt`

## 为什么按句合成

整段合成看起来省事，但后面三个动作全都变难：

- 改一句 → 整段重生成 → 时长变了 → 字幕全错位
- 想重录某句 → 只能整段重来
- 字幕对齐 → 得跑 ASR 再纠错

**按句合成，每个字的时间戳是 TTS 直接给的，字幕天然准。** 这是 TTS 路线比真人录音最大的优势。

## 流程

1. **拆句**：从 `script.md` 读，一行一句。句子过长（超过 30 字）按语义再拆。
2. **术语规范化**：查 `data/pronounce.json`，把英文术语替换成 TTS 读得对的写法。
3. **逐句合成**：`node scripts/tts.mjs --script episodes/0001/script.md`
4. **收集时间戳**：每句音频时长写进 `timeline.json`，累计成全局时间轴。
5. **出 SRT**：按时间轴生成，一句话一条。

## 发音词典

`data/pronounce.json` 是这个文件的行规。**遇到读错的词，加一条，不要每次手工改稿。**

```json
{
  "MCP": "M C P",
  "Claude Code": "Claude Code",
  "vibe coding": "vibe coding",
  "Cursor": "Cursor",
  "本体论": "本体论"
}
```

规则：
- 字母缩写一律拆成单个字母 + 空格（`MCP` → `M C P`）
- 产品名保持英文原样，加空格断词
- 中文专有名词不替换
- **每加一条都要实测**，不同引擎表现不一样

## 改稿流程

1. 改 `script.md` 里那一句
2. 重跑 tts，只生成变化的那几句（脚本会比对 hash）
3. `timeline.json` 自动重算，后面所有句子的起始时间跟着移
4. 重新生成 SRT

**不要手动改 SRT 的时间**，改稿源。

## 音色

先用 `edge`（免费、免 key），跑 `node scripts/tts.mjs --compare` 听几个候选。
确定音色后写进 `episodes/<期号>/episode.json` 的 `voice` 字段。

要克隆自己的声音，换 provider（豆包 / MiniMax），在 `scripts/tts.mjs` 的 provider 分支里加。**不要改调用方**。

## 禁止

- 禁止整段合成
- 禁止覆盖已交付的音频（版本号 +1）
- 禁止手动改 SRT 时间戳
- 禁止在脚本里硬编码 API key（读环境变量）
