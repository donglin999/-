# 2026-10-19 弃用入口清理与发布包评审分离

## 需求

用户：“我看到那个襄阳城的 demo 可以通过加后缀的方式进去，检查一下还有没有类似的问题，这种被弃用的不应该还放在一起污染代码。”

按 10-08 起的清理原则（旧的、被否定的不再复用，只保留硬依赖，移动不删除）处理：盘点所有 hash 入口和查询参数开关，弃用的连同只为它服务的脚本、数据、素材一起移出；评审工具保留在本机，但不再进发布包。

## 盘点

| 入口／开关 | 判定 | 依据 | 处理 |
| --- | --- | --- | --- |
| 无后缀、`#qihe-map`、`#prologue` | 现行 | [运行入口](../design/runtime-entry.md) | 保留 |
| `journey=`、`play=1`、`v=` | 现行（旅程存档、继续进度、缓存号） | [启动与存档](../design/qihe-map/startup.md) | 保留，发布包也保留 |
| `#street`、`#streetbright`、`#xiangyang` | **弃用**（襄阳演示） | 10-08 用户舍弃襄阳新手村剧情、主城改汉皋；襄阳／黑风寨设计 10-16 归档（文档库 `updates/2026-10-16-feian-cleanup.md`） | 入口删除；脚本、素材、测试归档。旧 hash 进入栖河首页 |
| 旧标题／建角（`titleScreen`、`creation`，开局羊太傅庙） | **弃用**（襄阳原型开局，非栖河 hash 的兜底） | 同上；8792 守卫早已不让它出现，但线上非栖河 hash 仍会落到这里 | 删除，所有入口统一走栖河首页 |
| `#chapter1`、`#cultivation` | 无效旧链接（不是入口） | 本机守卫一直把它们改成 `#qihe-map`（`verify_runtime_entry` 有此用例）；线上会落进旧标题 | 线上同样改写为首页。培养模式没有 hash 入口：继续处于培养阶段的旅程即进入培养 |
| 培养第 5 月“襄阳街市／南门／偏巷／渡口”走访与 `linkXiangyang` | **弃用残留** | 现行第 5 月由汉皋前置剧情 `hg_gate` 收束（10-13 用户授权，`hg_road`、`hg_gate` 均为自动主线，`tests/pre-hangao-runtime.test.cjs` 验证必定走到汉皋）；旧走访只在缺 `hg.pre.gate_handoff` 的旧存档出现 | 删走访地图与进场逻辑；旧存档停在走访场景时回“本月行程”面板，可直接返程。核心 `visit()`／存档校验保留以免旧档失效 |
| `?pixel90=backhill`、`pixel90roam`、`pixel90mask`、`heroRun`、`heroWalk`、`runVariant`、`heroMotion`、`heroReview` | **弃用**（90 格 Q 版测试画风） | [弃用测试清单](../assets/deprecated-tests.md)；10-10 蓝灰主角已正式采用，预览不再需要 | 预览脚本与加载片段归档；批次 art_sources 留原位（见下） |
| `runtimePrototype`、`openingPrototype` | 历史原型显式预览（兄弟工作区机制） | [运行入口](../design/runtime-entry.md)；入口守卫与文档库副本须一致 | 守卫不动；发布包删掉该参数 |
| `battleReview=road\|lesson\|voice\|ye\|clash\|hero`（含 `weapon`、`poseReview`、`holdReview`、`tail`） | 评审工具 | 10-12～10-18 多份更新记录在用；交锋演出链接已给用户 | 本机保留；发布包不含脚本、参数失效 |
| `storyReview=steward\|wukui\|procurement` | 评审工具 | `outsider-quests.md` | 同上 |
| `uiReview=1`（含 `martialCapacity=1`） | 评审工具 | `martial-preview-v9.md`、10-07 更新 | 同上 |
| `chapterPresentationReview=…`（含 `relationshipReview=1`） | 评审工具 | 10-08～10-16 多份更新 | 同上 |
| `uitheme=ink\|scroll` | 调试开关（战斗界面两套主题，默认 ink） | 无采用记录 | 本机保留；发布包参数失效 |
| `debug=xinfa` | 调试开关 | 无文档 | 本机保留；发布包参数失效 |
| 培养设置里的“调试：谷中日程”“小游戏候选试玩” | 游戏内调试按钮（非后缀） | — | 未动，列为待定 |

## 改动

### 移出运行入口（`_attic/2026-10-19-deprecated/`，保持原相对路径，`manifest.json` 与 `restore.sh` 同 10-18 格式）

共 129 项、129 个文件、约 8.4 MB：

- 襄阳演示脚本 11 个：`js/xiangyang-chapter.js`、`xiangyang-slice.js`、`quests.js`（襄阳支线）、`story.js`（原“第一章 · 襄阳风云”全部场景剧情）、`npc-actions.js`、`npc-arts.js`、`npc-arts-ui.js`、`npc-art-lessons.js`、`npc-gestures.js`（江湖手段原型，只配置襄阳场景 NPC）、`containers.js`、`container-art.js`（20 个容器全在襄阳／庙／黑风寨）。
- 90 格预览脚本 1 个：`js/prologue-backhill-pixel90-preview.js`。
- 只测已归档代码的测试 8 个：`tests/xiangyang-chapter.test.cjs`、`xiangyang-slice.test.cjs`、`xiangyang-combat-balance.cjs`、`npc-actions.test.cjs`、`npc-arts.test.cjs`、`npc-arts-actions.test.cjs`、`npc-arts-browser.test.cjs`、`containers.test.cjs`。
- 素材 109 个文件：注销 55 个正式 ID（正式路径＋`assets/` 下原件），另含 10 张未登记的 v2 之前旧地图（`assets/m_street*.webp` 等）。注销 ID：襄阳／庙／黑风寨／渡口地图 21 个与大地图 `m_world`；战斗背景 `bb_alley`、`bb_alley_v3`、`bb_bandit_cave`、`bb_bandit_gate`、`bb_ferry`、`bb_gate`、`bb_river`、`bb_road`、`bb_street`、`bb_temple`、`bb_temple_out`；回退背景 `bg_alley`、`bg_bandit_cave`、`bg_bandit_gate`、`bg_ferry`、`bg_gate`、`bg_map`、`bg_street`、`bg_temple`、`bg_temple_out`；`containers_v1`、`cg_zhou_rescue`；音频 `bgm_street`、`amb_street`、`forge`、`kettle`、`arts_*` 7 个。
- `js/story.js` 原位换成 14 行精简版，只留栖河仍调用的 `questLine`／`questLog` 底层与 `onCompanionTalk`（大黄）。
- 引擎文件里删掉的代码原文留存在 `_attic/2026-10-19-deprecated/removed-code/engine-edits.txt`；注销的登记条目留存在同目录 `production-assets-removed.json`（未含原 `references` 字段）。工作区 git 最后提交是 09-30，之后的改动均未提交，所以这两份是恢复依据。

### 共用引擎文件里只删襄阳分支

- `index.html`：卸载上述脚本与 `pixel90` 加载片段。
- `js/core.js`：删 `isReviewEntry` 和三个襄阳 hash；载入时把任何非栖河 hash 改写为 `#qihe-map`（线上同样生效）；`ASSETS` 去掉襄阳地图与 `m_world`（`bg_title` 是栖河首页背景，保留）；删 `brightFg`、`pixel90` 存档键、会话存档分支。
- `js/main.js`：启动只走 `QiheEntry.start()`；删大地图与容器的输入、绘制分支。
- `js/scene.js`：删 `reviewStart`、大地图出口与 `mapNodeAt`。
- `js/ui.js`：删大地图整节、旧标题 `titleScreen` 与建角 `creation`。
- `js/bstage.js`：删襄阳战斗背景表、别名、4 秒后预载全部 `bb_*` 的循环（这是线上开局下载 `bb_street` 等 10 张图的原因）；交锋等未登记背景的默认氛围改名 `fallback`，数值与原街市一档相同，画面不变。
- `js/battle.js`：删“败后醒在羊太傅庙”分支（现行战斗都是 `noLose`）。
- `js/menu.js`：删襄阳结局 `ending()` 与 `m_world` 舆图样式；苍龙白鸟图等物品定义保留，以免旧存档背包条目失去名称。
- `js/audio.js`：删街市音景与打铁／茶壶音效轮询。
- `js/qihe-startup.js`：删 `pixel90` 分支。
- `js/qh-mode-cultivation.js`／`.css`：删第 5 月襄阳走访地图、`linkXiangyang`、`enterWorld`、`worldButton` 和相关样式。
- 素材登记：`docs/assets/production-assets.json`、`.md`（末尾加注销一节）、`js/production-assets.js` 同步注销 55 项。

### 评审工具与发布包分开（`scripts/build-pages.cjs`）

- 发布包不复制评审专用脚本：`qihe-ui-review.js`、`qihe-story-review.js`、`qihe-battle-review.js`、`hero-multiweapon-review.js`、`qihe-chapter-presentation-review.js`、`qihe-relationship-review.js`，`dist/index.html` 里对应标签一并去掉（找不到标签时构建报错）。
- `dist/index.html` 在入口守卫之前注入一段脚本，删掉 `REVIEW_PARAMS` 列出的评审／测试参数，并置 `window.XJH_RELEASE=true`。`journey`、`play` 不受影响。
- 源码 `index.html` 与 `js/` 不变，本机 8792 的评审链接照常可用。以后新增评审脚本或 URL 开关，要同步登记到构建脚本的 `REVIEW_SCRIPTS`、`REVIEW_PARAMS`（`AGENTS.md` 已写入）。

**以后只能在本机 8792 使用的链接**（发布包里打开都只是正常试玩）：`?battleReview=clash&play=1#qihe-map`（交锋演出，含 `&holdReview=1`、`&tail=1`）、`?battleReview=road|lesson|voice|ye|hero…`（含 `weapon=`、`poseReview=1`）、`?storyReview=…`、`?uiReview=1`（含 `martialCapacity=1`）、`?chapterPresentationReview=…`（含 `relationshipReview=1`）、`?uitheme=scroll`、`?debug=xinfa`、`?runtimePrototype=1`／`?openingPrototype=1`。

### 测试与文档同步

- `tools_scene/qihe/verify_startup.cjs` 末项改为验证襄阳 hash 已无引擎入口和独立存档；`verify_audio.cjs` 的“离开培养换曲”用例从襄阳街市改为栖河南路（`bgm_qh_daily_v2`）。
- 加注说明：`docs/design/runtime-entry.md`（新增一节）、`docs/assets/deprecated-tests.md`（新增一节）、`docs/design/README.md`、`docs/design/qihe-map/expansion/guiyun-household.md`（第 5 月襄阳衔接注明撤下）、`docs/design/npc-interaction.md`、`docs/design/xiangyang-city.md`、`docs/design/xiangyang-chapter.md`、`docs/README.md`、`docs/architecture.md`、`docs/testing.md`、`docs/content-guide.md`、`docs/containers.md`、`DEPLOY.md`、`AGENTS.md`。

## 核对的文档

`AGENTS.md`、`docs/design/runtime-entry.md`、`docs/design/qihe-map/startup.md`、`docs/assets/deprecated-tests.md`、`docs/assets/production-assets.md`、`docs/updates/2026-10-18-cleanup.md`、文档库 `docs/updates/2026-10-16-feian-cleanup.md` 与 `2026-10-18-cleanup.md`、`guiyun-household.md`、`npc-interaction.md`。

## 验证

- 基线（改动前）与改动后各跑一遍：`tools_scene/qihe/` 的 verify_prologue、verify_chapter、verify_startup、verify_expansion、verify_saves、verify_household 通过；verify_representatives、verify_stranger、verify_outsiders、verify_faction_contacts、verify_cg_direction、verify_chapter_battle 改动前就失败，改动后失败信息逐字相同。`tests/` 下非浏览器单测：通过的仍通过；character-grounding、cultivation-balance-combat、cultivation-balance-preview、cultivation-rework-preview、cultivation-rework、dou-sword-combat、guiyun-performance-bounds、guiyun-performance-preview、menu-icons、toast、qihe-faction-clash-story 改动前即失败，失败点相同（toast 只有耗时与行号变化）。附加：verify_runtime_entry、verify_audio、verify_portals、verify_interactions 通过；verify、verify_battle 前后同样失败。被归档的 8 个测试不再运行。
- `python3 tools_assets/check_production.py`：pass（1117 → 1062 项）。
- `node tools_story/build_ink.cjs`：pass。
- `node scripts/build-pages.cjs`：完成（未发布）。`dist/` 912,640 KB／1625 个文件 → 902,752 KB／1499 个文件（约少 9.7 MB、126 个文件）；`dist/js` 无评审脚本，`dist/index.html` 含参数清除脚本。
- 浏览器（8792 内置浏览器，标签页切到前台）：新开一局推进到遇狼战斗，网络全部 200，开局不再请求任何 `bb_street` 等襄阳战斗背景、襄阳地图、`containers_v1`；控制台无报错。`?battleReview=clash&play=1#qihe-map` 完整播完（约 20 秒战斗，结束提示“战斗结束”）。`#xiangyang`、`#street`、`?pixel90=backhill` 均进入栖河首页。`#cultivation` 进入首页（培养由继续旅程进入）；用 `chapterPresentationReview=cultivation-…` 夹具进入培养正常，并模拟旧存档停在襄阳走访：回到“本月行程”面板、返程进入下月正常。测试产生的旅程存档与评审档已清掉，“最近进度”指针还原为此前最新的一份。
- 发布包（`dist/` 用 `python3 -m http.server 8799`，经 `qihe.localhost:8799` 访问以模拟线上非本机域名）：`?battleReview=clash&play=1` 被改写为 `?play=1` 并开始普通游玩；`#xiangyang`、`#street` 进首页；`runtimePrototype`、`pixel90`、`uiReview`、`storyReview`、`chapterPresentationReview`、`uitheme`、`debug` 一并失效、无原型横幅；新开一局到遇狼战斗正常。服务日志只有 `favicon.ico` 404（项目本来就没有图标）。控制台一条 `[VFX 等级自检] gy_zhou_teaching 缺少 FXDEF` 警告，8792 源码同样存在，与本轮无关。

## 保留与未完成

- 旧角色精灵与立绘（`s_monk`、`s_smith`、`s_lady`、`s_beggar`、`s_boatman`、`s_chief`、`s_child`、`s_rooster`、`s_snake`、`s_suzhi`、`s_liu`、`s_langli` 及其 `_bright`、`p_*`，`b_monk` 等战斗表）：仍由共用的 `CHARS`/`PORTS` 预载与 `bart.js` 表引用，栖河 NPC 还在用 `c_oldman`、`c_gossip`、`c_merchant`、`c_zhou`、`c_bandit`、`c_soldier`、`c_villager` 等兜底精灵。拆开要改预载结构，本轮保留，开局仍会下载这批小图。
- 襄阳敌人与苏芷等战斗语音（`battle-voices` 的 chief、langli、liu、suzhi、pipi 等）：由语音清单单独管理，本轮未动。
- 共用文件里的休眠残留：`ORIGINS` 出身文案、`ui.js` 旧江湖面板“第一章 · 襄阳风云”字样、`menu.js` 的苏芷队伍定义与 `mnQuests` 兼容层、`#mapui` 节点与样式、`scene.js` 渡船远景绘制支持、`qh-mode-cultivation-core.js` 的襄阳地点白名单（旧档校验需要）。
- 现行剧情数据里的 `xiangyang_invitation` 等事实名与“赴襄阳”文案属于汉皋前置剧情本身，不是演示残留，未动；是否改名交剧情侧决定。
- `art_sources/scene-pixel-backhill-full-20261009`、`cast-pixel90-20261009`、蓝灰走跑候选批次：仍被历史演示页或已采用批次的生成脚本读取，留原位。
- 只为襄阳服务的生成工具（如 `tools_scene/build_scene.py` 写 `story.js` 场景块）未处理。
- 文档库 `xiaojianghu/docs/design/systems-benchmark-20261016/report.md`、`gap-register.md` 各有一处链接指向已归档的 `js/npc-arts-ui.js`，该目录按约定只读，未改。
- 入口守卫 `js/runtime-entry.js` 未改（改了需同步到文档库副本）；线上旧 hash 由 `core.js` 收口。

## 状态

本地完成；未提交 Git；未发布线上（线上要等下一次 `build-pages` 发布后才生效）。
