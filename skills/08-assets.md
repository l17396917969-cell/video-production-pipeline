# 素材库与组件库

做新一期片子时，先看这里有什么，不要从零开始。

## 一、组件库（106 个，在 `src/components/`）

按功能分五类。检索走 `src/catalog.ts`，用「画面里看得见的对象和动作」搜，不要用旁白搜。

### 承载物类（做产品发布片首选）

| 组件 | 画面里是什么 |
| --- | --- |
| `T119SnapshotTimeline` | 深色终端跑 `git log`，快照卡从右边飞出来 |
| `T120Gates` | 终端逐条打印检查结果，最后给判定 |
| `T121Split` | 终端跑 `git worktree add` + 文件树多出一个目录 |
| `T122CleanupRules` | 真实配置文件 `.t3/worktree.yaml`，逐行擦出 |
| `T124Proof` | 白卡里的真实截图 + 标题 + 说明 |
| `T125CursorStage` | 界面 + 合成光标 + 点击涟漪 + 目标高亮环 |
| `T117ExternalClip` | 真实录屏，支持 zoom / focusX / focusY 取景 |

### 开场 / 结尾

| 组件 | 用途 |
| --- | --- |
| `T116RepoIntro` | 深色舞台 + 真实窗口发光 + 大数字 |
| `T99FinalFrame` | 结尾结论页 |

### 对比 / 论点

| 组件 | 画面里是什么 |
| --- | --- |
| `T123RollbackGap` | 两张卡：✓ 代码能回滚 / ✕ AI 的记忆不能 |

### 设计常量（`src/kit.ts`）

- `fred` 调色板：canvas / stage / stageDeep / ink / purple / gray / shadowWindow / stageGlow / onDark*
- `term` 终端配色：bg / bar / green / key / str / amber / red / dot*
- `font.sans` = 思源黑体（Noto Sans SC）
- 字号档位：display 92 / cardTitle 56 / bodyFred 46 / note 40

**禁止**在组件里手写字号、颜色、间距。

## 二、素材库

### 真实界面截图（`public/shots/`，22 张）

| 文件 | 内容 |
| --- | --- |
| `real-diff.png` | 真实 diff 卡片：2 changed files +5 −0 |
| `real-task.png` | 任务对话气泡 |
| `real-result.png` | 任务结果：util.ts / README.md 改动清单 |
| `real-sidebar.png` | 左侧 thread 列表 |
| `real-menu.png` | SnapShots / Worktrees 菜单 |
| `real-config.png` | Confirmations 三个开关 |
| `real-notify.png` | 通知截图 |

### 真实录屏（`public/video/`，10 段）

| 文件 | 内容 | 时长 |
| --- | --- | --- |
| `t3-diff.mp4` | 任务详情 + 改动清单（喂饱的界面，推荐） | 约 30 秒 |
| `t3-scenes.mp4` | 浅色界面场景集 | 122 秒 |
| `t3-dark.mp4` | 深色界面场景集（开场用） | 123 秒 |
| `t3-multi.mp4` | 并行任务 | 111 秒 |
| `t3-worktree.mp4` | worktree 隔离 | 57 秒 |
| `t3-live.mp4` / `t3-setup.mp4` | 启动与配置 | 约 60 秒 |

### 字体（`public/fonts/`）

思源黑体四个字重：Regular 400 / Medium 500 / Bold 700 / Black 900。
加载逻辑在 `src/fonts.ts`，已写进 `gen-registry.mjs` 模板，重新生成组件不会丢。

### 音乐（`public/music/`）

`tech-drive.mp3`，147 秒，Pixabay 免费商用。

## 三、做新一期时的顺序

1. **先读 [07-product-film.md](07-product-film.md)**，那是判断标准
2. 看上面这张表，哪些承载物能直接复用
3. 录新的真实界面时，**先喂饱再录**（多 thread、长 diff、终端输出）
4. 组件不够就报告缺口，不要退成大字号页面

## 四、缺口（还没有的）

- **共享元素过渡**：同一物体跨场时的 rect 插值，还没做成组件
- **手机画中画**：调研建议的第二层证据
- **音效库**：打字声、弹出声、落定声，一个都没有
- **3D 透视**：Linear 那种斜机位扫过，还没试
