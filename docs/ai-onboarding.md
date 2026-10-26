# AI 开发导入引导

状态：现行　最后核对：2026-10-21

本页给 AI 助手（Claude Code、Codex 等）和新加入的开发者用：开工前先读本页，再按任务进入对应文档。本页只做导航和规则汇总，具体事实以链接的负责文档为准；两边冲突时以负责文档为准，并回来修正本页。

整理日期：2026-10-07。

> 2026-10-19 起，开发、系统、流程、边界类规则只在[规则登记表](rules/规则登记表.md)写正文，本页引用编号；本页旧写法与登记表冲突时以登记表为准（R-文档-02）。

## 1. 先确认工作区

`luotuozhuan/` 下有两个独立工作区，地图、人物映射、存档和素材登记都不同。**开工第一步是确认本次改动属于哪一个**，不能把一边的方案、图片或测试结果当作另一边已采用。

| 工作区 | 用途 | 本地入口 | 自带规则 |
| --- | --- | --- | --- |
| `xiaojianghu`（本目录） | 设计文档库、开篇剧本与素材评审；旧游戏原型（含已作废的襄阳演示）2026-10-20 已整体归档，见[归档记录](updates/2026-10-20-prototype-archive.md) | 8794 文档书阁、`review/` 评审页；不能运行或构建游戏 | 本页、[文档与实现边界](design/delivery.md) |
| `xiaojianghu-legacy-prologue` | **当前栖河试玩版**（四向中央图 `m_qh_central`）、正式素材登记 | `python3 scripts/serve-current.py` → `http://127.0.0.1:8792/` | 该目录 `AGENTS.md`、`docs/update-workflow.md`、`docs/assets/production-assets.md` |

- 默认游戏统一8792。IDE和一键启动使用固定目录启动器；用`--check`核验身份，详见[本机游戏入口与工作区](design/local-game-entry.md)。
- 本目录的 `opening-v4` 和被用户否定的 4K 村落候选**不是**当前地图。
- 线上站点 <https://luotuo-36x.pages.dev/> 2026-10-17 起是栖河试玩版，见[栖河发布说明](../../xiaojianghu-legacy-prologue/DEPLOY.md)；本目录旧的襄阳片段已撤除，旧发布记录见 [DEPLOY.md](../DEPLOY.md)。

## 2. 文档库怎么用

- 统一查看：在本目录运行 `python3 tools_docs/server.py`，打开 <http://127.0.0.1:8794/review/docs/>（[文档书阁说明](document-library.md)）。分为 **游戏 Wiki**（世界、人物、门派、章节、玩法设定）和 **开发文档**（实现、数值、美术、地图、音频、测试、归档）两个空间。
- 也可以直接读 Markdown。推荐阅读顺序：
  1. [技术文档首页](README.md)：本目录结构与文档索引（旧原型的入口、存档说明只作追溯）。
  2. [设计短链](design/README.md)：“要做什么 → 先读 → 再读”的任务表，按任务找负责文档就从这里开始。
  3. [文档与实现边界](design/delivery.md)：哪些是目标设计、哪些已经实装、后续迁移顺序。
- 新增文档后，在书阁点“刷新目录”即可收录；新文档默认进入开发空间。

## 3. 权威与状态规则

1. **两类文档不能混用**：`docs/design/` 描述**目标游戏**；`docs/` 根目录的技术文档描述的是本目录**已归档的旧原型**，只作追溯。设计文档里写了，不等于已经实现；“已接入本目录原型”也不等于栖河已采用。
2. **状态用语**：“已确认”是用户明确决定；“设计方案”是文档提出的执行细节，可以再改；“现行实现”只说明当前代码。写文档或汇报时必须分清这三种。
3. **同一事实只在一个负责文档维护**，其他地方只放链接。新人物、新势力只在负责文档定义一次。
4. **新设计先改文档，再写实现**；只改实现细节时，同步更新对应的当前实现记录。
5. **历史与归档只作追溯**：旧地图参数、`archive/` 下的旧流程、OC.3 等旧验收记录，不能用于新生产，也不能当作本轮的通过证据。
6. 旧 `gamemaker` 剧本只是取材来源，里面的姓名、栖灯馆、十二日日期和对白都要按本目录重新审定。
7. 评审“已通过”不等于用户已确认设定，也不等于代码完成或测试通过。

## 4. 按任务必读的现行规范

| 任务 | 现行唯一入口 |
| --- | --- |
| 新建、扩展、整改地图 | [现行地图开发规范](design/map-development-standard.md)（硬参数、分区生成、拼接与验收） |
| 新角色、角色素材 | [角色类型与必需素材](design/role-assets.md) → [质量规格](design/character-asset-quality.md) → [素材需求规范](design/asset-requirements.md) |
| 功法、武学 | [功法结构规范 v2](design/martial-structure.md)、[64 项招式合同 v3](design/martial-review/move-contracts.md) |
| 物品命名 | [物品与装备命名规范](design/item-naming-standard.md) |
| 新增或改期剧情事件 | [事件排期系统](design/event-scheduling-system.md)（先查日期、人物在场、前置和行动预算） |
| 改人物、门派、造型、时间规则后核对一致性 | `python3 tools_docs/consistency_check.py --out <目录>`；登记 [story-atlas.json](design/story-atlas.json)，已确认规则 [consistency-rules.json](design/registry/consistency-rules.json)；流程见项目技能 `consistency-check` |
| 养成 Q 版人物 | [统一生成与验收标准](design/cultivation-q-generation-standard.md)、[姿态差异门槛](design/cultivation-q-pose-diversity.md) |
| 生图、素材处理 | [美术管线](art-pipeline.md) 的「当前出图接口约定」；出图、取参考前先查[弃用／不启用的测试方法清单](../../xiaojianghu-legacy-prologue/docs/assets/deprecated-tests.md) |
| 内容扩展（场景、对话、任务、道具、敌人） | 在栖河工作区按其 `AGENTS.md` 做；本目录[内容指南](archive/content-guide.md)、[架构](archive/architecture.md)只是旧原型记录 |
| 战斗 | 先读[当前表现边界：普攻接触、功法特效命中](design/combat-presentation-boundary.md)，再读[battle.md](battle.md)及v2/v3 |

## 5. 本目录的代码与数据

- 本目录没有游戏运行代码：旧原型的 `index.html`、`js/` 模块、`assets/` 素材、根目录一次性脚本与 `raw_*` 已于 2026-10-20 移入 `_attic/2026-10-20-prototype/`（[归档记录](updates/2026-10-20-prototype-archive.md)，`restore.sh` 可一键还原）。归档内容不作参考。
- `js/` 只剩武学、装备文档生成链（`tools_docs/build_*`）读写的数据文件和离线估算模型；`assets/` 只剩武学／装备图标、人物图谱用的三张菜单立绘和语音试听库。保留原因写在 `js/README.md`、`assets/README.md`。
- 现行工具：`tools_docs/`（文档检查、一致性检查、武学与装备文档生成、文档书阁）、`tools_story/`（人物图谱、剧情起草）、`tools_balance/`、`tools_calendar/`、`tools_common/`（生图入口）、`tools_audio/voice_server.py`（语音后台）。脚本都以本目录为工作目录运行。

## 6. 每次改动的流程

1. 确认工作区、运行入口，以及用户已确认的方案。
   - 先读[改动清单](changelist.md)最近的条目和全部“进行中”（R-文档-03），看别人刚改了什么、有没有人正在改同一处。
   - 动手时在清单顶部加一条“进行中”，写明工作区和范围。
2. 读负责该事实的设计页和当前实现记录；如果记录互相矛盾，先查代码和已确认来源，纠正记录后再推进。
3. 先更新负责文档，再改实现。
4. 新素材先放进 `art_sources/<批次>/`，记录**实际**尺寸、模型、提示词和参考图，人工核对后再登记采用；不得按文件名、版本号或修改时间自动选用。旧原件保留，没有引用不等于可以删除。
5. 在 `docs/updates/YYYY-MM-DD-主题.md` 写更新记录：需求、改动、核对过的文档、采用/弃用、验证结果与证据、未完成项。然后把改动清单里自己那条改成结果并链上这份记录。漏登的话 `check_docs.py` 会失败，发布构建也会停。
6. 按风险选择测试（见第 8 节）。没执行或失败的测试要如实写明；函数测试不能写成浏览器验收或美术验收通过。
7. 最终汇报把 **本地完成 / Git 提交 / 线上发布** 三种状态分开写。没有用户要求，不要提交、推送或发布。

小任务和可独立完成的开发任务按 R-子任务-02 经路由器分流给 Claude 5.5 子任务，用法、哪些可以分派、怎么验收见[子任务分流](router-subtasks.md)。

在 `xiaojianghu-legacy-prologue` 改动时，还要执行该目录 `AGENTS.md` 的固定步骤，完成后运行 `python3 tools_assets/check_production.py`。

## 7. 生图约定

- 默认生图模型：**gpt-image-2.5**。每次生图的提示词都必须带上这一行：

  ```text
  Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）
  ```

- 生图源、模型请求行、密钥、透明输出分别见规则 R-生图-01～04（[规则登记表](rules/规则登记表.md)）；各源的操作说明见根目录 `CLAUDE.md`「生图」。
- 内置生图不可用时报告原因，不要自动改用需要 `OPENAI_API_KEY` 的付费 API。
- 完整规则见[美术管线 · 当前出图接口约定](art-pipeline.md)。

## 8. 测试与验证

- 总说明：[testing.md](testing.md)；旧襄阳片段范围页已随襄阳城撤除删除。
- 测试在 `tests/`。旧原型的测试已随原型归档；本目录保留的测试清单见[归档记录](updates/2026-10-20-prototype-archive.md)，testing.md 里针对旧原型页面的命令只作追溯。
- 浏览器测试使用本机已有的 Playwright 与 Chromium，可用 `PLAYWRIGHT_PATH`、`CHROMIUM_PATH` 覆盖。testing.md 里部分路径是旧 Linux 环境（`/home/user/...`、`/opt/pw-browsers`）留下的，运行前先确认路径存在。
- 文档书阁自身：`python3 tests/document-library.test.py`、`node tests/document-library-browser.test.cjs`。
- 视觉整改按[视觉与交互验收合同](design/visual-acceptance.md)逐项判定，需要实际截图证据。

## 9. 发布

当前栖河构建与发布从兄弟工作区执行（R-发布-01）；本目录没有构建命令，详见 [DEPLOY.md](../DEPLOY.md)。推送 `main` 不会自动发布。

## 10. 常见误区

- 用任意当前目录的静态服务当默认游戏。2026-10-07再次发现8123配置指向旧目录；统一使用固定启动器和8792身份核验。
- 把设计文档写的内容当成已经实现，或把“已接入本目录原型”写成“已接入正常游戏”。
- 从历史文档里挑方便的旧参数（地图尺寸、旧生成方案）用于新生产。
- 把测试批次当画风参考。2026-10-10 给新城市出场景图时，误用了未采用的 `xiaojianghu-legacy-prologue/art_sources/scene-pixel-central-20261009`（90 格 Q 版扁平像素试点）。出图、取参考前先查[弃用／不启用的测试方法清单](../../xiaojianghu-legacy-prologue/docs/assets/deprecated-tests.md)；README 标着未采用／试点／测试的批次不得作参考，地图画风以[现行地图开发规范](design/map-development-standard.md)和正式素材清单登记的批次为准。
- 用刷新哈希、复制原稿等方式让检查通过，而不是先确认改动对应已审查的设计。
- 工作区里通常有大量未提交改动，那是用户进行中的工作：不要重置、清理或批量提交。
