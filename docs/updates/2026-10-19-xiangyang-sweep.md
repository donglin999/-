# 2026-10-19 襄阳描述清理

状态：现行　最后核对：2026-10-19

用户原话：“现在已经没有襄阳城的描述了，暂时只有汉皋城，排查一下整理后的问题”。游戏里作为城市、关卡、剧情地点的襄阳城已经撤除，城市内容目前只有汉皋城（[汉皋城](../design/hangao-city.md)、[汉皋城剧情](../archive/design/hangao-story.md)）。本次按规则只整理、不新增剧情、人物、地名（R-剧情-05），不说“第几章”（R-剧情-02），不删除只归档（R-清理-01），不提交 git（R-git-01）。

改动前的原文都备份在 `_attic/2026-10-19-xiangyang-sweep/`（保持相对路径），附 `manifest.json` 与 `restore.sh`，可一键还原。

## 一、分类口径

| 类 | 判定 | 处理 |
|---|---|---|
| A | 把襄阳当现行游戏城市或内容来写（如“年一5月去襄阳”“襄阳救治苏芷”） | 是年一5月首城这个位置、且汉皋设计里有对应人物或场所的，改成汉皋；没有对应的，改写成“旧襄阳……已撤除”；整页都是襄阳内容的归档 |
| B | 导航页、README 里指向襄阳页面的条目 | 链接改到归档位置，条目标“（历史）”或改指汉皋对应页 |
| C | 已经写明“旧襄阳”“已撤除”“已删除”，或是带日期的历史记录、原记 | 保留 |
| D | 真实地理与历史背景（汉水、襄樊对望、襄阳守城往事） | 保留 |
| E | 文件名、id、代码路径（`pre-xiangyang-*`、`xiangyang_*`） | 不改名，只按内容处理 |

依据：[汉皋城剧情第8节](../archive/design/hangao-story.md)已列出要改的地方：“襄阳邀请”改汉皋寿宴邀请；苏芷、柳含烟、秦绯鸢、阮青雀、裴知古、乔行舟、晏小楼、霍逐尘、陆衡的“襄阳初见”改“汉皋初见”；栖月楼改到汉皋；清徽阁授课加上汉皋。[汉皋城第5节](../design/hangao-city.md)给出了这些人物在汉皋的据点，所以这些机械替换都有依据。

## 二、总数

现行文档原有“襄阳”519 处（128 份）。其中 `docs/rules/doc-status-proposal.md` 的 73 处由主会话处理，本次不动；剩下 446 处（127 份）：

| 处理 | 处数 | 说明 |
|---|---|---|
| 整页归档 | 26 | 4 份页面，见第三节 |
| 改写（A 类改汉皋或改成“已撤除”，B 类导航改链接、标历史） | 193 | 约 67 份，见第四节 |
| 保留：已说明撤除或历史记录（C）、文件名与 id（E） | 约 150 | 见第五节 |
| 保留：真实地理与历史（D） | 约 7 | 汉水、襄樊对望、清徽阁前辈守城等 |
| 保留并请用户拍板 | 约 68 | 见第六节 |
| 主会话正在改的页面，本次不动 | 2 | `opening-correction-20261004-oc4.md`（已被主会话移走）、`character-asset-quality.md` |

## 三、归档清单

移到 `xiaojianghu/docs/archive/design/`，页首改成“状态：历史”，所有指向它们的 markdown 链接已改到新位置。

| 页面 | 原因 | 现行内容在哪 |
|---|---|---|
| [pre-xiangyang-story.md](../archive/design/pre-xiangyang-story.md) | 入谷第1～4月旧剧情设计，终点是“第5月去襄阳” | 入城前设计见[首次进汉皋城前](../design/pre-hangao-completion-20261013/README.md)；十个节点的对白在 `cultivation-rework-20261012/dialogue.md`，排期在 `calendar/mountain-events.json` |
| [pre-xiangyang-training.md](../archive/design/pre-xiangyang-training.md) | 旧前四月培养数值和推荐日程 | 数值已由[培养部分数值](../design/cultivation-balance-20261012/README.md)取代 |
| [pre-xiangyang-visitors.md](../archive/design/pre-xiangyang-visitors.md) | 三场外派来访的旧设计说明（接“襄阳邀请”） | 事件与对白已在 `calendar/pre-hangao-runtime-events.json`、`pre-hangao-completion-20261013/dialogue.md`；莫松年二月来访的事实也写在 `factions/songfeng.md` |
| [xiangyang-gathering-review.md](../archive/design/xiangyang-gathering-review.md) | 襄阳寿宴公共初识提案 | 寿宴与回查已由[汉皋城剧情](../archive/design/hangao-story.md)、[汉皋主线逐句稿](../archive/design/scripts/hangao-main.md)落实 |

## 四、改了哪些（每份处数）

| 文件 | 处数 | 改法 |
|---|---|---|
| `xiaojianghu/docs/design/cast-timeline.md` | 27 | 年一5月各人物初识地点改汉皋（“汉皋代表”“汉皋短事件认识”等） |
| `xiaojianghu/docs/design/README.md` | 24 | 导航条目改链接、标“（历史）”；首城改汉皋；“按序章第二版重构襄阳地图”改为“做新城市地图（汉皋等）” |
| `xiaojianghu/docs/design/pre-xiangyang-character-arcs.md` | 10 | 首城改汉皋，标题改为“入谷至首次进城（汉皋，原写襄阳）”（未归档，见第七节） |
| `xiaojianghu/docs/design/companion-power.md` | 7 | 年一5月首城改汉皋；霍逐尘初识改“汉皋霍记修械” |
| `xiaojianghu/docs/design/mountain-cultivation-events.md` | 7 | 年一5月整月历练改汉皋；导读注记改到归档链接 |
| `xiaojianghu-legacy-prologue/docs/design/README.md` | 7 | 三条襄阳导航标“（历史）” |
| `xiaojianghu/docs/README.md` | 6 | 加说明：襄阳城已撤除，下文是历史原型旧记录；“当前状态”表襄阳行标历史原型 |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/guiyun-household.md` | 5 | “第一次去襄阳前”改“第一次去汉皋前”；第5月改汉皋整月历练 |
| `xiaojianghu/docs/ai-onboarding.md` | 4 | 去掉“襄阳片段”；线上站点改为栖河试玩版 |
| `xiaojianghu/docs/design/martial-review/weapon.md` | 4 | 年一兵器来源改“汉皋铁铺”（同步 `catalog.json`） |
| `cast.md`、`mountain-cultivation-curriculum.md`、`guiyun-household.md`、`companion-recruitment.md`、`delivery.md`、`life-skills.md`、`jianghu-portraits.md`、`jianghu-stroll-review.md`、`cast-visuals.md` | 各 3 | 首城改汉皋；旧演示素材与评审入口标“已撤除” |
| `art-pipeline.md`（两个工作区各一份）、`testing.md`、`presentation.md`、`cultivation-q-generation-standard.md`、`romance-rules.md`、`qihe-hidden-rewards.md`、`ye-appearance.md`、`world.md`、`ye-expression-prompts.md`、`protagonist-sect.md`、`martial-review/armor.md`、`balance/sim-report.md`、`balance/sim/tables-r6.md`、`qihe-map/startup.md` | 各 2 | 同上 |
| `AGENTS.md`、`wilderness-encounter-research.md`、`world-map-layout.md`、`npc-interaction.md`、`hangao-city.md`、`life.md`、`party-pets.md`、`ye-routes.md`、`cultivation-implementation.md`、`asset-requirements.md`、`hangao-story.md`、`opening-pei-disguise.md`、`story-presentation.md`、`cultivation.md`、`romance-stories.md`、`faction-styles.md`、`event-scheduling-system.md`、`story.md`、`opening-three-representatives.md`、`world-map-journeys.md`、`cultivation-reference.md`、`fullflow-story-20261016/feasibility.md`、`martial-review/README.md`、`rules.md`、`move-contracts.md`、`white-heron.md`、`balance/progression.md`、`companion-performance/ye-heng.md`、`su-zhi.md`、`factions/qinghui.md`、`companions/ruan-qingque.md`，以及栖河的 `content-guide.md`、`audio.md`、`runtime-entry.md`、`qihe-map/expansion/implementation.md` | 各 1 | 同上 |

另加了说明段（不改原句）的页面：`xiaojianghu/DEPLOY.md`（线上已是栖河，襄阳片段已撤除）、`exploration-containers.md`（适用的 10 张旧地图已撤除，通用规则仍可用）、`xiangyang-icons-v3.md`（画风契约仍有效，“襄阳现有内容”只供追溯）、`cultivation-rework-20261012/dialogue.md`（台词里的襄阳是 10-12 时的城名）、`world-map-layout.md`（襄樊只保留地理锚点，开放与否待拍板）。

同步改了设计数据，避免生成页和数据对不上：`story-atlas.json`（39 处，和 cast-timeline、cast-visuals、companion-performance、faction-styles 同口径）、`companion-performance.json`（5）、`martial-review/catalog.json`（9）、`martial-systems-v2.json`（2）、`balance/budget.json`、`balance/curve.csv`（各 1）。

人物定妆阶段的写法：原“襄阳同行阶段”“襄阳医师阶段”“襄阳当前阶段”改为“初版同行阶段／医师阶段／现行图鉴阶段（定妆来自已撤除的襄阳演示）”，不声称这些图是给汉皋画的。

## 五、保留的及原因

- **已写明撤除或历史（C）**：栖河的 `docs/README.md`、`architecture.md`、`content-guide.md`、`testing.md` 页首已有 2026-10-19 撤除说明，下文旧记录整页按历史读；`DEPLOY.md`、`AGENTS.md`、`production-assets.md` 的撤除记录；`hangao-story.md`、`hangao-city.md` 里“用户要求不再用襄阳”的决定原话；`pre-hangao-completion-20261013/` 的迁移说明；各页“原记”括号、带日期的验收记录、“（已删除）”标注；语音页“旧襄阳包”。
- **文件名与 id（E）**：`pre-xiangyang-*`、`xiangyang-icons-v3.md`、`xiangyang_road`、`xiangyang_invitation` 等，不改名。
- **真实地理与历史（D）**：大地图里汉水、襄阳与樊城隔江相望；清徽阁前辈“襄阳守城时以笛声传讯”、郁停云与周砚守城旧谊；心法命名取“南宋襄阳一带读得到的经史”。
- **生成页没改**：`manual-placement.md`、`martial-review/attack-expansion-v1.md`、`martial-systems.md`、`lineage-v3-naming.md` 由 `tools_docs/` 脚本从 json 生成，直接改 md 会被下次生成冲掉，且其中的地点要用户定（见第六节）。

## 六、需要用户拍板

1. **襄阳还算不算以后的地点。** 现行设计里襄阳仍是年二／游历的北线城市：[大地图](../design/world-map-layout.md)“襄阳·樊城，年二以后开放”、[势力页](../design/factions.md)“游历开放襄阳—樊城地区链”、[汉皋系统](../design/hangao-systems.md)“襄阳、合川镇以后接同一套系统”、`faction-styles.md` 巡江司“襄阳转运库”。要么只留地理锚点、以后不开放，要么保留为远期地区。本次只在大地图页加了“待拍板”说明，没删表行。
2. **汉皋主线的“襄阳钩子”。** [汉皋主线逐句稿](../archive/design/scripts/hangao-main.md)（16 处）和[汉皋城剧情](../archive/design/hangao-story.md)里，“知情人”字条劝叶蘅“去襄阳求护”、徐令仪说附页“转自襄阳办事点”、《问题清单》作为“年二襄阳线”入口；[栖月楼支线评审](../archive/design/qiyue-story-review-20261016/README.md)的“汪成在襄阳的代办护送生意”“徐的襄阳办事点”；[汉皋闲散支线](../archive/design/scripts/hangao-side.md)阿杏“往北，襄阳”。这些是现行剧情，改城名就是改剧情，本次不动，请定：保留襄阳作远方去处，还是换成别的地方。
3. **秘籍和武学的获取地点。** [秘籍投放表](../design/manual-placement.md)（22 处）与 `attack-expansion-v1.md`（6 处）把大量江湖散学放在襄阳书铺、酒楼、市井、火药作坊、丐帮分舵、正道盟襄阳联络院、乐坊。汉皋有书肆、望江楼、乐坊、正道盟联络院、远山镖局，没有武馆、丐帮分舵、火药作坊。改到汉皋还是另定地点，要用户定；定了以后改 `tools_docs/build_manual_placement.py`、`attack_expansion_data.py`、`build_martial_lineage_v3.py`（《莲花落》）和 `build_armor_acc.py`（`襄阳铁匠铺、镖局`、`襄阳玉器铺`）再重新生成。
4. **陆衡推荐信（H6）指向哪家镖局。** [栖河隐藏奖励](../design/qihe-hidden-rewards.md)原写“襄阳城西有家镖局”，已标待拍板；汉皋有远山镖局（陆衡借住）可选。
5. **青蚨散案去留。** [汉皋城剧情第7节](../archive/design/hangao-story.md)原就待定“移到襄阳区域作年二事件或删除”；襄阳撤除后，这条只剩“删除或另找地方”。
6. **阮青雀、晏小楼“襄阳市井里长大”**（`bond-banter.md`）：作为身世保留，还是改。

## 七、6 份待定页的结论

| 页面 | 结论 |
|---|---|
| `pre-xiangyang-story.md` | 已归档。必达骨架被入城前补充设计取代，十个节点的对白、事实与排期在别处都有 |
| `pre-xiangyang-training.md` | 已归档。数值被培养部分数值取代 |
| `pre-xiangyang-visitors.md` | 已归档。三场来访的对白和排期在别处都有 |
| `xiangyang-gathering-review.md` | 已归档。寿宴与回查已在汉皋落实 |
| `pre-xiangyang-character-arcs.md` | **未归档，交主会话。** 第2～7节是萧白、叶蘅、周砚、陆衡、周婶与陈伯的行为卡（日常辨识、弱点场面、改变证据、关系张力表），`bible/人物/` 的人物页只有几行，别处没有。本次只把首城改成汉皋。建议把行为卡并入 `bible/人物/` 对应人物页，或改名为“入谷至汉皋前人物深化”留在 design |
| `jianghu-stroll-review.md` | **曾归档后撤回，交主会话。** `hangao-systems.md`（势力声望“沿闲逛设计”）、`world-map-layout.md`（“见闲逛与三路线”）、`cultivation-routes.md` 都拿它的“触发与不卡关约定”“三条路线如何遇见同一批人”两节当规则依据。本次只改了 3 处襄阳。建议把这两节规则搬进 `cultivation-routes.md` 或 `hangao-systems.md`，再归档本页 |

## 八、栖河 8792 运行代码里的襄阳残留（不在本次范围，只列出）

`#xiangyang`、`#street`、`#streetbright` 入口和襄阳场景已撤除，玩家进不了襄阳城。以下是培养模式里**可能仍会显示给玩家**的文字，需要运行核对：

- `js/qh-mode-cultivation-household.js`：`gy_welcome_back`（六月接风）“襄阳回来的头一顿，都坐下！”；`gy_m09`《城门还在前面》用场景 `xiangyang_road`。
- `js/qh-mode-cultivation-scenes.js`：`xiangyang_road` 显示名“襄阳城外”、说明“通往襄阳的官道”。
- `js/qh-mode-cultivation-data.js`：通知 `xiangyang_invitation`“周砚收到赴襄阳的邀请”、`xiangyang_departure`“下月赴襄阳”；W07 叶蘅“襄阳那边，有位受治者的见闻”。
- `js/ui.js` 顶栏“第一章 · 襄阳风云”、叶蘅简介“与萧白同行赴襄阳”；`js/menu.js` 在没有 `QiheMenu` 时的兜底标题“襄阳风云 · 卷”；`js/core.js` 出身“流落襄阳街头”。
- `js/qh-pre-hangao.js` 已覆盖 `gy_zhou_test`（出门考校）和照川送帖弟子的台词，不在上面的列表里。

另外，下列设计数据和脚本里还有旧襄阳内容，没有改：`calendar/mountain-events.json`、`scripts/pre-xiangyang*.json`、`scripts/chapter-two-dialogue.json`、`martial-review/martial-systems.json`、`manual-placement.json`、`character-card-ye.json`、`character-assets-current.json`（“老周（襄阳脚夫）”）、`story-rework-20261016/regions.json`；`cast-timeline.md` 里叶蘅一条“与苏芷共同救老周”没有“襄阳”二字，但老周是旧襄阳演示人物，汉皋剧情里救的是脚夫牛大的母亲，也要一并核对。
