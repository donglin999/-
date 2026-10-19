# 文档状态分类建议清单

状态：历史　最后核对：2026-10-19（已按用户拍板执行完毕）

本清单只是建议，**没有移动或修改任何现有文档**。请用户过目后再按 R-文档-02 补页首状态、把“历史”移入 archive。机器可读版本：[doc-status-proposal.json](../../rules/doc-status-proposal.json)。

范围：`tools_docs/check_docs.py` 的 `docs()` 列出的 590 份 md（不含 art_sources、review、docs/updates、_attic、archive）。

## 计数

| 建议 | 份数 |
|---|---|
| 现行 | 354 |
| 历史 | 159 |
| 草稿 | 52 |
| 待定 | 25 |
| 合计 | 590 |

其中“现行”里有 41 份标了【需改措辞】：内容仍是现行设计，但文中写“第一章／第二章”等，按 R-剧情-02 应改成开始／培养／游历／终局。

判断口径：

- **现行**：现行入口（导入引导、两份设计 README、地图规范、规则登记表、AGENTS）当作现行链接的；页首写已确认、当前、执行中且没有更新版本的。
- **草稿**：页首写待审、待拍板、候选、评审中、执行中待评审，尚未定稿的（多是汉皋、特效逐招表、武学 V2 素材方案）。草稿不进 archive。
- **历史**：页首自称历史／已替代／旧目录／旧设计追溯；同主题有更新版本；开始部分台词已全部迁入 ink（R-剧情-04）；襄阳演示已撤除（R-清理-02）；一次性验收、评审、调研、自动检查报告，内容已落到现行文档的。
- **待定**：证据互相矛盾，或要用户拍板设计取舍的。

## 一、待定（请先拍板）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/architecture.md` | 描述本目录历史原型的模块结构，导入引导第 4 节仍把它当“内容扩展”现行入口；兄弟工作区另有一份已分叉的同名文档 | ai-onboarding.md 第 4 节；xiaojianghu-legacy-prologue/docs/architecture.md |
| `xiaojianghu/docs/content-guide.md` | 本目录历史原型（js/story.js、襄阳）的内容编写指南，导入引导仍当现行入口；兄弟工作区有分叉副本 | ai-onboarding.md 第 4 节；页首“所有剧情内容在 js/story.js” |
| `xiaojianghu/docs/pets.md` | 本目录原型宠物的实现核查（2026-09-30），宠物设计页仍链接它作“现行实现”，但原型已非当前游戏 | 页首“核对日期：2026-09-30。本篇来自静态代码核查” |
| `xiaojianghu/docs/vfx.md` | 原型 js/vfx.js 的 T0–T3 实现记录；设计 README 链为“当前特效”，与栖河分叉副本并存 | 页首“本页主要记录现行 T0–T3 规则……尚未实装” |
| `xiaojianghu/docs/audio.md` | 原型音频与襄阳语音装配说明；与栖河副本差异大，不确定以哪份为准 | 页首“角色配音制作入口见[襄阳语音清单]” |
| `xiaojianghu/docs/battle-v3.md` | 战斗表现 v3（09-28），导入引导仍写“再读 battle.md 及 v2/v3”，但战斗精灵规格已到 v4、表现边界 10-14 另定 | ai-onboarding.md 第 4 节“battle.md及v2/v3”；battle-sprite-spec.md 标题“battle v4” |
| `xiaojianghu/docs/battle-v2.md` | 战斗表现 v2 分工契约（09-30），同上：导入引导仍指向，但已被 v3/v4 接续 | ai-onboarding.md 第 4 节；battle-v3.md“在 v2 基础上的第二轮评审改造” |
| `xiaojianghu/docs/design/opening-routes.md` | 【R-剧情-02】“第一章末三选一”；10-16 完整流程开始部分写“随周砚离开”、未见三选一，是否仍保留三条去向待定 | fullflow-story-20261016/story.md“萧白和叶蘅随周砚离开” |
| `xiaojianghu/docs/design/pre-xiangyang-story.md` | 入谷后第 1～4 月剧情（目的地仍写襄阳）；汉皋已取代襄阳、10-16 完整流程重排培养部分，是否仍为培养前段现行设计待定 | hangao-story.md“取代旧襄阳新手村剧情”；fullflow-story-20261016/README.md |
| `xiaojianghu/docs/design/xiangyang-gathering-review.md` | 襄阳公共相会提案；汉皋已取代襄阳作为年一5月城市，但设计 README 现行任务表仍链接它 | design/README.md“评审襄阳公共初识”行；hangao-story.md |
| `xiaojianghu/docs/design/pre-xiangyang-visitors.md` | 襄阳前谷中来访设计（前四月）；前四月现行基础已转到 8792 数据与入汉皋前补全，本稿是否仍负责来访设计待定 | pre-hangao-completion-20261013/README.md“现行基础来自chapter-two-dialogue.json与8792事件定义” |
| `xiaojianghu/docs/design/opening-state.md` | 【R-剧情-02】两章交接与演出边界（本目录原型开篇）；开始部分已在栖河另行实现，是否仍为设计依据待定 | 页首“本版未同步运行存档、正式语音或CG” |
| `xiaojianghu/docs/design/jianghu-stroll-review.md` | 10-02 门派群像与三年闲逛评审提案；之后总纲与完整流程多次重排，是否仍有效待定 | 页首“门派群像与三年闲逛 · 评审提案”；story-framework-review.md |
| `xiaojianghu/docs/design/pre-xiangyang-character-arcs.md` | 入谷至首次襄阳人物深化（前四月）；前四月现行基础已转到 8792 与入汉皋前补全，是否仍负责人物线待定 | pre-hangao-completion-20261013/README.md |
| `xiaojianghu/docs/design/v4-vfx-kit.md` | 特效组件库与自动编排（10-08 已实装）；与 10-18 起 R-特效-02“主形来自生图、不得程序绘制优先”可能冲突，是否仍作现行做法待定 | R-特效-02；页首“其余招式用一套中性组件素材 + 按规格自动编排” |
| `xiaojianghu/docs/design/opening-correction-20261004-oc4.md` | 原型开篇 OC.4 整改合同；其中 grid94 等人物规格仍被质量规格当“当前标准”引用，开篇本身已在栖河另行实现 | character-asset-quality.md“开篇当前执行OC.4采用标准”；ai-onboarding.md“本目录的 opening-v4……不是当前地图” |
| `xiaojianghu/docs/design/pre-xiangyang-training.md` | 襄阳前基础培养（第 1～4 月）；前四月现行基础已转到 8792 数据与入汉皋前补全，本稿是否仍负责培养节奏待定 | pre-hangao-completion-20261013/README.md |
| `xiaojianghu/docs/design/motion-oc11.md` | OC.11 萧白便衣走跑（原型开篇）；四向行走质量页仍称其为当前开篇动作 | character-walk-quality.md“当前开篇萧白便衣使用 OC.11” |
| `xiaojianghu/docs/design/martial-review/icon-style-v4.md` | 技能图标风格 v4 试样：用户认可方向但未批量重画；与五档标准 icon-tiers 哪个是现行出图依据待定 | 页首“用户认可 C 版‘精绘’方向……尚未批量重画” |
| `xiaojianghu/docs/design/story-rework-20261016/faction-cast.md` | 三方行动与剧情人物调整（自称“新的负责设计”），但所在整组已被全流程接续、全流程人物页写明谢庄严旧草案部分被替换；哪些仍有效待定 | 页首“这是新的负责设计”；fullflow-story-20261016/README.md“谢、庄、严旧草案哪些地方被替换” |
| `xiaojianghu/docs/design/story-rework-20261016/companions.md` | 十九名同伴四部分剧情（入链 24），所在整组已被全流程接续；同伴各页改指全流程人物稿，本页形象部分是否仍负责待定 | companions/cen-shuang.md“全程剧情……按[完整流程人物稿]维护”；story-rework-20261016/README.md |
| `xiaojianghu/docs/design/story-rework-20261016/regions-gameplay.md` | 【R-剧情-02】第三、第四部分城市与地区玩法（10-16 当前设计方案）；全流程改为冒名、护棺、白石主干，旧地区估算是否保留待定 | story-travel-review.md“旧‘三地区任选二……’的草案不再是本作唯一主干” |
| `xiaojianghu-legacy-prologue/docs/battle.md` | 栖河工作区战斗技术文档（10-04），未含主库 10-14 表现边界更新；两份同名文档分叉，以哪份为准待定 | xiaojianghu/docs/battle.md 页首“当前表现规则（2026-10-14用户明确）” |
| `xiaojianghu-legacy-prologue/docs/design/cultivation.md` | 【R-剧情-02】栖河版三年休闲培养（10-12 带 8792 现行说明），与主库 cultivation.md 差异约 140 行，以哪份为准待定 | 页首“2026-10-12 当前第二章”；xiaojianghu/docs/design/cultivation.md |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/party-ui-v3.md` | 四人出战界面 V3，页首仍写“设计待评审，未修改游戏实现”，但界面流程包 party.md 以它为数据依据，是否已被流程包取代待定 | 页首“设计待评审，未修改游戏实现”；ui-flow/party.md“数据方案依据 → `../party-ui-v3.md`” |

## 二、历史（按主题归堆，可整批确认）

### 开始部分（原型序章与风起栖河段）旧台词、旧交付与旧素材（40 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/opening-polish.md` | 10-02 开始部分精修说明，之后被 OC.4、三位主事人修订接续 | 页首“序章与第一章 · 2026-10-02 精修说明” |
| `xiaojianghu/docs/design/opening-delivery-20261006.md` | 10-06 开篇素材与空间交付记录（本目录原型） | 规则第 6 条：交付记录；页首“实际尚未同步至8792” |
| `xiaojianghu/docs/design/story-scripts.md` | 【R-剧情-02】开始部分对白总目录（本目录原型）；开始部分台词已全部迁入 ink 剧本 | R-剧情-04；xiaojianghu-legacy-prologue/story/01-开始/；prologue-village.md“本稿台词已不是现行版本” |
| `xiaojianghu/docs/design/opening-correction-acceptance.md` | OC.3 验收记录，页首自称历史，被 OC.4 替代 | 页首“> 历史 OC.3 记录……当前被 OC.4整改替代” |
| `xiaojianghu/docs/design/prologue-arrival-acceptance.md` | 序章前段 OC.3 时期接入记录 | 页首“当前按OC.3 整改合同（已删除）修正” |
| `xiaojianghu/docs/design/chapter1-road-minigame.md` | 开始部分临时守路小游戏（原型 #chapter1）的交付参数记录 | 页首“状态：已接入独立 #chapter1 预览……本次交付参数” |
| `xiaojianghu/docs/design/prologue-scene.md` | 本目录原型序章村落场景（药棚前院）；导入引导写明本目录 opening 地图不是当前地图 | ai-onboarding.md“本目录的 opening-v4……不是当前地图” |
| `xiaojianghu/docs/design/chapter1-pressure.md` | 开始部分来者与旧物对白（本目录原型），台词已迁入 ink | R-剧情-04；story/01-开始/三方-*.ink |
| `xiaojianghu/docs/design/opening-assets.md` | 原型开始部分逐场素材需求；当前栖河素材以正式登记为准 | R-素材-01；页首“三位主事人新稿已本地接入”（本目录原型） |
| `xiaojianghu/docs/design/chapter1-delivery.md` | 开始部分场景交付记录（原型 v1/v2） | 规则第 6 条；页首“旧 v1/v2 记录只对应历史版本” |
| `xiaojianghu/docs/design/opening-spatial-delivery.md` | 原型开篇任务与场景落地（10-06 交付） | 页首“2026-10-06。适用于[序章村落]与[第一章]” |
| `xiaojianghu/docs/design/chapter1-fire-audio.md` | 开始部分局部火声，页首说实测是历史证据 | 页首“下方WebAudio实测是历史证据” |
| `xiaojianghu/docs/design/prologue-arrival.md` | 序章后山初遇对白（本目录原型）；开始部分台词已全部迁入 ink | R-剧情-04；xiaojianghu-legacy-prologue/story/01-开始/序章-后山相遇.ink |
| `xiaojianghu/docs/design/chapter1-clash-20261012.md` | 侧口交锋旧版，页首说已更新为双甲级群攻、下文为历史记录 | 页首“当前8792已更新为[双甲级群攻]……下文……为历史记录” |
| `xiaojianghu/docs/design/map-character-motion-plan.md` | 地图与角色移动 GIF 评审，页首说下文 OC.4／OC.5 参数为历史、当前实现见 OC.11 | 页首“下文 OC.4／OC.5 参数为问题诊断历史，不是当前运行值” |
| `xiaojianghu/docs/design/opening-functional-delivery.md` | 原型开始部分可玩测试版交付记录 | 页首“本页记录 2026-10-04 的功能实现与阶段例外” |
| `xiaojianghu/docs/design/opening-character-assets.md` | 开篇人物需求卡，页首自称旧运行版交付记录 | 页首“下方角色表及生成台账为旧运行版交付记录” |
| `xiaojianghu/docs/design/chapter1-fire.md` | 开始部分灯火与撤离对白（本目录原型），台词已迁入 ink | R-剧情-04；story/01-开始/风起-起火.ink |
| `xiaojianghu/docs/design/ye-walk-regeneration.md` | 叶蘅四向重生成（10-02）完成并采用的记录 | 页首“状态：已完成重生成……并采用” |
| `xiaojianghu/docs/design/prologue-village.md` | 序章村中第一夜对白，页首说台词已不是现行版本 | 页首“2026-10-19：本稿台词已不是现行版本” |
| `xiaojianghu/docs/design/prologue-water-prompt.md` | 后山递水 CG 提示词记录 | 规则第 6 条：制作记录 |
| `xiaojianghu/docs/design/prologue-battle-teaching.md` | 原型后山教学战合同（OC.4）；序章已迁入 ink 并在栖河另行实现 | story/01-开始/序章-遇狼.ink；ai-onboarding.md |
| `xiaojianghu/docs/design/chapter1-activities.md` | 开始部分六项村中活动对白（原型），台词已迁入 ink | R-剧情-04；story/01-开始/ |
| `xiaojianghu/docs/design/chapter1-mountain.md` | 开始部分山居安身对白（原型），台词已迁入 ink | R-剧情-04；story/01-开始/风起-山居.ink |
| `xiaojianghu/docs/design/opening-character-acceptance.md` | 开篇人物素材验收（10-03） | 规则第 6 条：验收记录 |
| `xiaojianghu/docs/design/chapter1-village.md` | 开始部分村中三日对白（原型），台词已迁入 ink | R-剧情-04；story/01-开始/ |
| `xiaojianghu/docs/design/prologue-exploration/minimap.md` | 原型序章小地图独立预览，未接入；开始部分已在栖河另行实现 | 页首“用户评审前只存在于独立review页面” |
| `xiaojianghu/docs/design/prologue-exploration/npc-audit.md` | 原型序章 NPC 核对（独立预览） | prologue-exploration/README.md“本轮检查和独立预览，未修改游戏入口” |
| `xiaojianghu/docs/design/prologue-exploration/README.md` | 原型序章人物、路人与小地图评审包，未接入 | 页首“预览待评审……未修改游戏入口” |
| `xiaojianghu/docs/design/prologue-exploration/ambient.md` | 原型序章生活路人（仅独立预览） | 页首“状态：仅在独立预览实现；未接入正式序章” |
| `xiaojianghu/docs/design/story-overview/chapter1.md` | 【R-剧情-02】开始部分概览，依附旧襄阳前剧本目录，台词已迁入 ink | pre-xiangyang-scripts.md“本页为旧目录”；R-剧情-04 |
| `xiaojianghu/docs/design/story-overview/prologue.md` | 序章概览，依附旧襄阳前剧本目录，台词已迁入 ink | pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/story-overview/village-life.md` | 【R-剧情-02】开始部分可选活动概览，台词已迁入 ink | R-剧情-04 |
| `xiaojianghu/docs/design/scripts/opening-voice-plan.md` | 开始部分配音标注；开始部分台词已迁入 ink | R-剧情-04；xiaojianghu-legacy-prologue/story/01-开始/ |
| `xiaojianghu/docs/design/registry/story-lint-opening-20261016.md` | 10-16 开篇台词自动检查报告（一次性输出） | 规则第 6 条；页首“检查台词 559 条” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/night-script.md` | 药箱与第一夜旧脚本，页首说台词已不是现行版本 | 页首“2026-10-19：本稿台词已不是现行版本” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/prologue.md` | 扩展前序章背景，页首说最新实现见扩展实施记录 | 页首“下文保留扩展前序章背景” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/errands-script.md` | 跑腿旧脚本，页首说台词已不是现行版本 | 页首“2026-10-19：本稿台词已不是现行版本” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/lodging-script.md` | 入村安顿旧脚本，扩展前序章背景；台词已迁入 ink | 页首“下文保留扩展前序章背景”；R-剧情-04 |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/arrival-script.md` | 后山初遇旧脚本，扩展前序章背景；台词已迁入 ink | 页首“下文保留扩展前序章背景”；R-剧情-04 |

### 培养前四月（入襄阳前）旧剧本与概览：已由入汉皋前补全接续（20 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/pre-xiangyang-visitor-acceptance.md` | 襄阳前来访的接入验收记录（10-05，本目录原型） | 规则第 6 条：验收记录；页首“三场可选来访已接入本地游戏的闲逛页” |
| `xiaojianghu/docs/design/pre-xiangyang-scripts.md` | 襄阳前剧本旧目录，页首自称旧目录，被入汉皋前补全接续 | 页首“本页为旧目录。首次目的地已转为汉皋”；pre-hangao-completion-20261013/README.md |
| `xiaojianghu/docs/design/pre-xiangyang-overview.md` | 入襄阳前剧情概览（目的地仍写襄阳），前四月已由入汉皋前补全收录 | pre-hangao-completion-20261013/README.md“40个前四月窗口事件完整收录” |
| `xiaojianghu/docs/design/pre-xiangyang-voice.md` | 入襄阳前逐句语音规划，依附已自称旧目录的襄阳前剧本，台词已转入 ink 与入汉皋前补全 | pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/pre-xiangyang-visitor-assets.md` | 襄阳前来访素材清单，已交付的一次性清单 | 规则第 6 条；页首“已交付并接入本地游戏” |
| `xiaojianghu/docs/design/story-overview/mountain-stories.md` | 培养段人物故事概览（旧襄阳前目录），前四月已由入汉皋前补全收录 | pre-hangao-completion-20261013/README.md“40个前四月窗口事件完整收录” |
| `xiaojianghu/docs/design/story-overview/mountain-main.md` | 培养段必要剧情概览（旧襄阳前目录） | pre-hangao-completion-20261013/README.md |
| `xiaojianghu/docs/design/story-overview/daily.md` | 培养段生活片段概览（旧襄阳前目录） | pre-hangao-completion-20261013/README.md |
| `xiaojianghu/docs/design/story-overview/reserved.md` | 待定师门扩展概览；师叔、师母等已在归云谷一家中确认 | guiyun-household.md“状态：已确认” |
| `xiaojianghu/docs/design/story-overview/lessons.md` | 培养段课程小剧情概览（旧襄阳前目录） | pre-hangao-completion-20261013/README.md |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-life.md` | 襄阳前日常、生产与通信对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-main.md` | 襄阳前必达消息与入城前转场对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-visitors.md` | 襄阳前来访制作剧本 V1（已接入原型），前四月已由入汉皋前补全收录 | pre-hangao-completion-20261013/README.md“40个前四月窗口事件完整收录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-escort.md` | 襄阳前首季护送对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-lu.md` | 襄阳前陆衡承诺与交接对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-letters.md` | 襄阳前乡邻来信对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-lessons.md` | 襄阳前课程首次教学与复习对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-reserved.md` | 待定师门人员对白提案；师门人物已在归云谷一家中确认 | guiyun-household.md“状态：已确认” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-zhou.md` | 襄阳前周砚练习与师承对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |
| `xiaojianghu/docs/design/scripts/pre-xiangyang-ye.md` | 襄阳前叶蘅帮助与目标对白审阅稿（10-05）；前四月台词已由入汉皋前补全收录，权威在 8792 的 chapter-two-dialogue.json | pre-hangao-completion-20261013/implementation.md“将本稿审定台词映射回权威chapter-two-dialogue.json”；pre-xiangyang-scripts.md“本页为旧目录” |

### 襄阳演示与襄阳城：已撤除、由汉皋取代（13 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/containers.md` | 原型襄阳 10 张地图容器的实现与发布记录；襄阳演示与 containers.js 已于 10-19 归档 | xiaojianghu-legacy-prologue/docs/README.md“containers.js 已移入 _attic/2026-10-19-deprecated/” |
| `xiaojianghu/docs/design/xiangyang-art-prompts.md` | 襄阳体验章节生图提示词制作记录 | 页首“状态：本轮内置图像生成的制作记录” |
| `xiaojianghu/docs/design/xiangyang-chapter.md` | 襄阳体验章节脚本；襄阳新手村剧情已由汉皋取代，#xiangyang 演示 10-19 撤除 | hangao-story.md“舍弃旧测试 demo 的襄阳新手村剧情”；updates/2026-10-19-deprecated-entries.md |
| `xiaojianghu/docs/design/character-assets-audit.md` | 10-02 襄阳角色素材验收记录 | 规则第 6 条；标题“当前襄阳角色素材验收” |
| `xiaojianghu/docs/design/xiangyang-alley.md` | 襄阳偏巷（原型地图与剧情），襄阳演示已撤除 | updates/2026-10-19-deprecated-entries.md；hangao-story.md |
| `xiaojianghu/docs/design/game-town-layout-research.md` | 襄阳城镇布局调研，襄阳已不再作主城 | 规则第 6 条；hangao-city.md“年一5月的城市不再用襄阳” |
| `xiaojianghu/docs/design/xiangyang-alley-art-prompt.md` | 偏巷战斗背景生图记录（09-29） | 规则第 6 条：制作记录 |
| `xiaojianghu/docs/design/xiangyang-voice.md` | 襄阳 #xiangyang 角色语音，襄阳演示已撤除 | updates/2026-10-19-deprecated-entries.md；页首“范围：当前 #xiangyang 体验章节” |
| `xiaojianghu-legacy-prologue/docs/design/xiangyang-art-prompts.md` | 襄阳生图提示词制作记录（副本） | 页首“状态：本轮内置图像生成的制作记录” |
| `xiaojianghu-legacy-prologue/docs/design/xiangyang-chapter.md` | 襄阳体验章节脚本副本，襄阳演示 10-19 撤除 | 页首“2026-10-19：……襄阳演示入口……已撤除” |
| `xiaojianghu-legacy-prologue/docs/design/xiangyang-alley.md` | 襄阳偏巷副本，襄阳演示已撤除 | updates/2026-10-19-deprecated-entries.md |
| `xiaojianghu-legacy-prologue/docs/design/xiangyang-alley-art-prompt.md` | 偏巷战斗背景生图记录（与主库同文） | 规则第 6 条：制作记录 |
| `xiaojianghu-legacy-prologue/docs/design/xiangyang-city.md` | 襄阳城设定基准（主库已删除），襄阳演示已撤除 | 页首“2026-10-19：……已撤除”；hangao-city.md“不再用襄阳” |

### 地图流程旧版与原型村落（4 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/chen-yard-preview-r3.3.md` | 陈伯院 r3.3 已替代 | 页首“陈伯院r3.3历史整改（已替代）” |
| `xiaojianghu/docs/design/map-resolution-experiments.md` | 清晰度与 4K 请求实验，已替代 | 页首“清晰度与4K请求实验（已替代）” |
| `xiaojianghu/docs/design/preview-first-map-development.md` | 预览先行试验历程，已替代 | 页首“预览先行试验历程（已替代）” |
| `xiaojianghu/docs/design/village-functional-boundaries.md` | 原型村落边界整改，无现行入口链接 | 页首“本文保留专项规则或局部整改证据” |

### 养成界面与动作旧版、一次性记录（11 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/cultivation-interface.md` | 养成界面 V3，页首自称保留旧设计追溯 | 页首“本文保留旧设计追溯；当前画面和操作以[已确认简化需求]” |
| `xiaojianghu/docs/design/cultivation-home-approved.md` | 归云谷养成首页需求，页首自称保留旧设计追溯 | 页首“本文保留旧设计追溯” |
| `xiaojianghu/docs/design/cultivation-action-loops.md` | 养成局部手势旧版，页首自称历史版本 | 页首“> 历史版本：用户已明确退回” |
| `xiaojianghu/docs/design/cultivation-local-motion.md` | 养成局部微动，页首自称历史版本 | 页首“人物局部微动修订（历史版本）” |
| `xiaojianghu/docs/design/cultivation-q-prompts.md` | 培养 Q 版实际生成提示词记录，公共规格已改由统一标准负责 | 页首“本文保留历史生成记录”；cultivation-q-generation-standard.md |
| `xiaojianghu/docs/design/cultivation-interaction.md` | 培养交互旧设计，页首自称保留旧设计追溯 | 页首“本文保留旧设计追溯……不再作为开发标准” |
| `xiaojianghu/docs/design/cultivation-jianghu-entry.md` | 养成头像接入新版江湖的一次性修复记录（10-06） | 规则第 6 条；页首“2026-10-06：用户指出头像打开了旧江湖” |
| `xiaojianghu/docs/design/cultivation-story-trigger-audit.md` | 养成剧情触发一次性核对（10-06） | 规则第 6 条；页首“2026-10-06，用户询问……” |
| `xiaojianghu/docs/design/cultivation-plot-and-stance-sample.md` | 剧情触发修正与站桩样片（10-05 一次性评审） | 规则第 6 条；页首“本轮修正触发与动画调用，同时生成一个独立站桩样片供评审” |
| `xiaojianghu/docs/design/cultivation-rework-20261012/martial-mapping.md` | 首轮功法映射，页首说现以培养实装表为准 | 页首“下文是首轮映射与目标美术审计，保留来源” |
| `xiaojianghu/docs/design/cultivation-minimax-compare-20261012/README.md` | 培养对白 MiniMax 对照试写（候选），演员法已写入 R-剧情-01 | 页首“状态：候选试写，不代表正式采用”；R-剧情-01 |

### 人物美术旧版与生图记录（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/female-visual-v3.md` | 女性形象第三版，页首自称历史方案 | 页首“> 历史方案。当前……见[第五版]” |
| `xiaojianghu/docs/design/female-visual-v4.md` | 女性形象第四版，不再作为当前方案 | 页首“本页不再作为当前生成方案，采用[第五版]” |

### 剑法与技能特效旧轮次（18 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/sword-vfx-direction.md` | 剑法分级第一轮方向，已调整为东方剑侠方向 | 页首“2026-10-07 方向调整……见[剑法特效 · 东方剑侠方向]” |
| `xiaojianghu/docs/design/sword-shape-research.md` | 剑技形态复核调研，高阶样例判不通过 | 页首“高阶锋刃组暂列为不通过的探索样例” |
| `xiaojianghu/docs/design/sword-grade-ultimate.md` | 绝等剑法第一轮脚本，已被打击感调研与东方剑侠方向替代 | sword-impact-research.md“本页优先于原甲绝脚本”；sword-vfx-xianxia.md |
| `xiaojianghu/docs/design/sword-studies.md` | 剑法粒子表现第一轮评审，方向已调整为东方剑侠 | sword-vfx-direction.md“2026-10-07 方向调整” |
| `xiaojianghu/docs/design/sword-grade-a.md` | 甲等剑法第一轮脚本，已被替代 | sword-impact-research.md；sword-vfx-xianxia.md |
| `xiaojianghu/docs/design/sword-impact-research.md` | 剑气打击感调研（10-01），之后方向转东方剑侠 | sword-vfx-xianxia.md“剑法改为东方剑侠语汇” |
| `xiaojianghu/docs/design/martial-review/vfx/hechuan.md` | 合川拳门旧特效分镜（VFX-SCRIPT-1，64 招时期），已由 vfx_v4 与 vfx/hc.md 接续 | martial-review/vfx/README.md“VFX-SCRIPT-1 · 2026-10-04”；v4-vfx-batch1.md“分镜来自 skill-text-v4.json 的 vfx_v4” |
| `xiaojianghu/docs/design/martial-review/vfx/patrol.md` | 巡江司旧特效分镜（VFX-SCRIPT-1），已由 vfx/pj.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/guiyun.md` | 归云谷旧特效分镜（VFX-SCRIPT-1），已由 vfx/gy.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/alliance.md` | 正道盟旧特效分镜（VFX-SCRIPT-1），已由 vfx/am.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/README.md` | 全功法特效脚本 VFX-SCRIPT-1 入口（64 招＋18 心法），已由 skill-text-v4 与 vfx/ 逐招设计表接续 | 页首“VFX-SCRIPT-1 · 2026-10-04”；v4-vfx-per-skill.md |
| `xiaojianghu/docs/design/martial-review/vfx/ye.md` | 叶蘅旧特效分镜（VFX-SCRIPT-1） | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/independent.md` | 散人旧特效分镜（VFX-SCRIPT-1），已由 vfx/ren.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/guijintang.md` | 归烬堂旧特效分镜（VFX-SCRIPT-1），已由 vfx/gj.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/zhaochuan.md` | 照川旧特效分镜（VFX-SCRIPT-1），已由 vfx/zc.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/white-heron.md` | 白鹇谷旧特效分镜（VFX-SCRIPT-1），已由 vfx/bh.md 接续 | 同上 |
| `xiaojianghu/docs/design/martial-review/vfx/songfeng.md` | 松风观旧特效分镜（VFX-SCRIPT-1），已由 vfx/sf.md 接续 | 同上 |
| `xiaojianghu/docs/design/vfx/review-20261008.md` | 10-08 技能特效实战逐招评审报告（在已撤除的 #street 上进行） | 规则第 6 条；页首“方法：在 index.html?runtimePrototype=1#street 开战” |

### 武学、数值旧稿与模拟中间数据（12 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/martial-review/v2-changes.md` | 武学第二版变更表（10-04 待评审）；招式已由 v3 传承接续，装备数值另行定稿 | martial-lineage.md；martial-review/weapon-stats.md“已定稿” |
| `xiaojianghu/docs/design/martial-review/audit.md` | 10-04 武学设定复核一次性报告 | 规则第 6 条；页首“状态：2026-10-04 本轮文档核对” |
| `xiaojianghu/docs/design/martial-review/references.md` | 武侠参考与本作转化，已由金庸／古龙比对接续 | 页首“当前文学品阶复审：[金庸／古龙比对]” |
| `xiaojianghu/docs/design/martial-review/attack-ratio-diagnosis.md` | 攻击招式占比诊断，结论已落实为扩充 v1 | 页首“扩充已按‘加路数＋加江湖散学’落地，见[攻击招式扩充 v1]” |
| `xiaojianghu/docs/design/martial-review/icon-sample-revision.md` | 首批五图品阶整改单（10-04 一次性） | 规则第 6 条；页首“五张原稿保留对照” |
| `xiaojianghu/docs/design/martial-review/balance/current.md` | 10-04 现行数值与简化测试审计快照，之后数值多轮调整 | 规则第 6 条；页首“2026-10-04本地读取” |
| `xiaojianghu/docs/design/martial-review/balance/sim/tables-r5.md` | 模拟中间轮次 r5 数据表，最终主结果为 r6 | sim-report.md“sim/tables-r6.md（最终主结果）” |
| `xiaojianghu/docs/design/martial-review/balance/sim/tables-r5-ramp.md` | 模拟中间轮次 r5-ramp 数据表 | sim-report.md“sim/tables-r6.md（最终主结果）” |
| `xiaojianghu/docs/design/martial-review/balance/sim/tables-r7.md` | 模拟 r7 数据表，报告指定 r6 为最终主结果 | sim-report.md“sim/tables-r6.md（最终主结果）” |
| `xiaojianghu/docs/design/martial-review/balance/sim/tables-r3-ramp.md` | 模拟中间轮次 r3-ramp 数据表 | sim-report.md |
| `xiaojianghu/docs/design/martial-review/balance/sim/tables-r3-p1.0.md` | 模拟中间轮次 r3-p1.0 数据表 | sim-report.md |
| `xiaojianghu/docs/design/martial-review/balance/sim/tables-r2-p1.0.md` | 模拟中间轮次 r2-p1.0 数据表 | sim-report.md |

### 剧情整改前一轮与栖月楼旧稿（8 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/hangao-qiyue-building-v3.md` | 栖月楼 V3，页首自称历史方案，被 V4 取代 | 标题“栖月楼 V3：建筑关系历史方案”；hangao-qiyue-scenes-v4.md |
| `xiaojianghu/docs/design/story-faction-rework-20261016.md` | 全作主线与三方势力整改方向，页首自称历史方案 | 页首“历史方案：……已由当前四部分总纲及逐项调整接续” |
| `xiaojianghu/docs/design/scripts/hangao-qiyue.md` | 栖月楼篇启动旧设计，页首说保留旧设计对照 | 页首“本文件保留旧设计对照” |
| `xiaojianghu/docs/design/companions/qin-feiyuan-story.md` | 秦绯鸢旧对白稿，页首说保留旧设计对照，已由栖月楼审稿接续 | 页首“本文件保留旧设计对照”；qiyue-story-review-20261014/README.md |
| `xiaojianghu/docs/design/story-rework-20261016/validation.md` | 10-16 前一轮剧情整改的核对记录 | 规则第 6 条；story-rework-20261016/README.md“前一轮设计记录” |
| `xiaojianghu/docs/design/story-rework-20261016/README.md` | 四部分主线前一轮整改入口，页首自称前一轮设计记录，主干由全流程接续 | 页首“前一轮设计记录：主干及新人物出场由[全流程创作版]接续” |
| `xiaojianghu/docs/design/qiyue-story-review-20261014/dialogue.md` | 栖月楼首稿逐场对白，已被 10-16 第二稿（36 场全量）接续 | qiyue-story-review-20261016/dialogue.md“旧生活场保留，6场重写、12场新增” |
| `xiaojianghu/docs/design/qiyue-story-review-20261014/README.md` | 栖月楼首稿审稿入口，已被 10-16 第二稿接续 | design/README.md“2026-10-16：[栖月楼第二稿]” |

### 调研、核对与自动检查的一次性报告（7 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/life-skills-verification.md` | 生活技能一次性验收记录（09-30），生活技能已暂缓 | 标题“生活技能本轮验收记录（2026-09-30）”；life.md“生活技能暂缓上线” |
| `xiaojianghu/docs/design/traits-20261013/review-notes.md` | V2 路线版核对说明，修订内容已落到 routes.md | 规则第 6 条；页首“本版已撤下该授予方式” |
| `xiaojianghu/docs/design/system-completion-20261016/consistency-review.md` | 10-16 一致性复核记录（一次性） | 规则第 6 条；页首“本页记录人工判定” |
| `xiaojianghu/docs/design/systems-benchmark-20261016/sources.md` | 三款游戏系统对照的资料来源，调研结论已落到系统设计补充 | 规则第 6 条；system-completion-20261016/README.md“承接三款武侠游戏对照报告的26项事项” |
| `xiaojianghu/docs/design/systems-benchmark-20261016/report.md` | 系统对照调研报告，页首说后续已由设计补充接续 | 页首“后续：用户已授权[设计补充与一致性校正]……本页保留” |
| `xiaojianghu/docs/design/systems-benchmark-20261016/gap-register.md` | 系统差距明细（调研建议），26 项已在系统设计补充中逐项落实 | 页首“以下为调研建议”；system-completion-20261016/README.md |
| `xiaojianghu/docs/design/registry/story-lint-baseline-20261016.md` | 10-16 全量台词自动检查基线报告（一次性输出） | 规则第 6 条；页首“检查台词 3506 条” |

### 栖河工作区：主库旧分叉副本、冻结快照与已被接续的记录（23 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu-legacy-prologue/docs/battle-v3.md` | 与主库同名文档逐字相同的战斗表现 v3 副本，无入链 | diff 结果为 0；xiaojianghu/docs/battle-v3.md |
| `xiaojianghu-legacy-prologue/docs/battle-v2.md` | 与主库同名文档逐字相同的战斗表现 v2 副本，无入链 | diff 结果为 0；xiaojianghu/docs/battle-v2.md |
| `xiaojianghu-legacy-prologue/docs/containers.md` | 场景容器实现记录，containers.js 已于 10-19 归档 | 页首“containers.js 已移入 _attic/2026-10-19-deprecated/” |
| `xiaojianghu-legacy-prologue/docs/design/npc-interaction.md` | 主库 NPC 交互的旧分叉副本；襄阳原型实现已归档，栖河文档说剧情与设定以主库为准 | 页首“江湖手段的襄阳原型实现……已随襄阳演示归档”；xiaojianghu-legacy-prologue/docs/README.md“剧情与设定类文档以主库为准” |
| `xiaojianghu-legacy-prologue/docs/design/life.md` | 主库生活与资源的旧分叉副本（10-08） | xiaojianghu-legacy-prologue/docs/README.md“剧情与设定类文档以主库为准”；xiaojianghu/docs/design/life.md |
| `xiaojianghu-legacy-prologue/docs/design/ye-routes.md` | 主库叶蘅路线的旧分叉副本（10-08） | xiaojianghu-legacy-prologue/docs/README.md“剧情与设定类文档以主库为准”；xiaojianghu/docs/design/ye-routes.md |
| `xiaojianghu-legacy-prologue/docs/design/world.md` | 主库势力与世界的旧分叉副本（10-08） | xiaojianghu-legacy-prologue/docs/README.md“剧情与设定类文档以主库为准” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/assets.md` | 栖河旧素材说明，页首说不得作选图依据 | 页首“本页历史素材说明不得作为选图依据” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/hero-battle-pose-preview.md` | 萧白战斗动作独立预览，已由端握采用与棍法连击接续 | qihe-map/hero-staff-combo.md；design/README.md（栖河）“此前首次端握采用为历史记录” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/hero-staff-grip-adoption.md` | 萧白端握首次采用，栖河 README 标为历史记录 | xiaojianghu-legacy-prologue/docs/design/README.md“[此前首次端握采用]为历史记录” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/production.md` | 10-05 冻结的扩展规则摘要；现行规则以规则登记表与地图规范为准 | 页首“本页冻结本分支扩展使用的规则摘要”；R-文档-02 |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/characters.md` | 10-05 人物素材部署状态快照；现行以正式素材清单为准 | R-素材-01；页首“2026-10-05部署状态” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/character-asset-quality.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/map-development-standard.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/anim-pipeline.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/map-size-review.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/scene-spatial-contract.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/village-layout-research.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/map-preflight.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/role-assets.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/character-walk-quality.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/standards/character-performance.md` | 2026-10-05 制作输入快照（主库规范的冻结副本），现行规范以主库原文为准 | 页首“2026-10-05 制作输入快照，源文件 SHA 见 source-sha.json” |
| `xiaojianghu-legacy-prologue/docs/assets/audit.md` | 10-12 全量素材盘点快照（一次性生成） | 规则第 6 条；页首“共检查 16168 份媒体文件” |

### 其他（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaojianghu/docs/design/wilderness-encounter-assets.md` | 野外遇敌首批素材清单与交付验收（原型襄阳地图） | 规则第 6 条；页首“首批素材已制作、接入并完成图像与功能验收” |

## 三、草稿（按目录）

### `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `ultimate-v10.md` | 绝式与战意 V10，名称数值等为待审提案 | 页首“名称、数值、习得来源与交互为本轮待审提案，未接入战斗” |

### `xiaojianghu/docs/design/`（12 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `hangao-city.md` | 汉皋城空间与店铺，页首写待用户审定 | 页首“状态：设计方案，待用户审定，未实装” |
| `hangao-systems.md` | 汉皋城系统设计，页首写待用户审定 | 页首“状态：系统设计方案，待用户审定” |
| `sword-vfx-xianxia.md` | 剑法东方剑侠方向第二轮样例，页首待用户评审 | 页首“状态：第二轮样例，待用户评审（2026-10-07）” |
| `romance-jealousy-review.md` | 吃醋与感情磨合，触发与数值仍待评审 | 页首“以下触发、强度、数值、频率与角色情节仍待评审” |
| `cultivation-minigames.md` | 养成小游戏候选，等待用户选择 | 页首“状态为 awaiting_user_selection” |
| `v4-vfx-batch1.md` | 技能特效 v4 第一批，页首写评审中 | 页首“状态：评审中，2026-10-08” |
| `qihe-hidden-rewards.md` | 栖河隐藏奇遇设计提案，待用户拍板 | 页首“状态：设计提案，2026-10-18，待用户拍板” |
| `hangao-story.md` | 汉皋城剧情，页首待用户审定、未排期 | 页首“状态：剧情设计方案，待用户审定，未实装，未排期” |
| `hangao-shops.md` | 汉皋城店铺功能，待用户审定 | 页首“状态：设计方案，待用户审定” |
| `hangao-city-spaces.md` | 汉皋城空间切分，待用户审定 | 页首“状态：设计方案，待用户审定，未实装” |
| `hangao-qiyue-complete-preview.md` | 栖月楼完整比例预览（进行中），原拼装图暂停定稿 | 页首“原拼装图暂停作为视觉定稿” |
| `hangao-architecture.md` | 汉皋建筑与街市，待用户审定 | 页首“状态：设计方案，待用户审定，未实装” |

### `xiaojianghu/docs/design/companions/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `ruan-qingque-story.md` | 阮青雀人物篇对白稿（10-04 设计稿，未接入） | 页首“状态：2026-10-04 设计稿，未接入游戏” |

### `xiaojianghu/docs/design/martial-review/`（8 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `weapon.md` | 兵器 24 件素材方案 V2，待评审 | 页首“状态：待评审，未生成图片” |
| `literary-grade-matching.md` | 金庸／古龙品阶比对，设计复审提案 | 页首“设计复审提案” |
| `identity.md` | 人物专长 V2 候选 | 页首“状态：V2候选” |
| `acc.md` | 佩饰 9 件素材方案 V2，待评审 | 页首“状态：待评审，未生成图片” |
| `ye.md` | 叶蘅双线招式方案 V2，待评审 | 页首“状态：2026-10-04 待评审，未开发、未生图” |
| `armor.md` | 护具 8 件素材方案 V2，待评审 | 页首“状态：待评审，未生成图片” |
| `independent.md` | 散人与人物专长招式方案 V2，待评审 | 页首“状态：2026-10-04 待评审，未开发、未生图” |
| `builds.md` | 人物打法与配装 V2，待评审 | 页首“状态：待评审” |

### `xiaojianghu/docs/design/martial-review/balance/`（5 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `validation.md` | 防难度跳变验证门槛，所列矩阵尚未运行（属 10-04 数值评审提案） | 页首“以下完整矩阵尚未运行” |
| `README.md` | 数值与难度曲线评审入口，设计提案 | 页首“设计提案，尚未完成全流程平衡验证” |
| `formula.md` | 公式与能力预算候选，待评审 | 页首“状态：待评审的新数值提案” |
| `sim-report.md` | 数值战斗模拟报告 v2，待用户审定 | 页首“状态：离线模拟结论与数值调整，待用户审定” |
| `progression.md` | 成长、经济与地区难度（10-04 数值评审提案的一部分） | martial-review/balance/README.md“设计提案” |

### `xiaojianghu/docs/design/martial-review/balance/sim/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `tables-r6.md` | 模拟最终主结果数据表 r6（随模拟报告待审定） | sim-report.md“sim/tables-r6.md（最终主结果）” |

### `xiaojianghu/docs/design/qiyue-story-review-20261016/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `dialogue.md` | 栖月楼第二稿逐场对白，R2 提案未采用 | 页首“状态：R2设计提案，未采用、未实装” |
| `README.md` | 栖月楼第二稿入口，待用户审稿 | 页首“待用户审稿；未采用、未接入正式剧情” |

### `xiaojianghu/docs/design/scripts/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `hangao-side.md` | 汉皋初识事件与支线逐步设计，草稿待审定 | 页首“状态：设计草稿，待用户审定，未排期、未实装” |
| `hangao-main.md` | 汉皋主线逐场稿，剧本草稿待审定 | 页首“状态：剧本草稿，待用户审定，未排期、未配音、未实装” |

### `xiaojianghu/docs/design/system-completion-20261016/`（4 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `exploration-endgame.md` | 探索接入与通关后边界，新产品取舍为本轮提案 | 页首“新产品取舍是本轮提案” |
| `city-time-economy.md` | 城市时间、经济与制作链，新增数值与取舍待评审 | 页首“新增数值与取舍待评审” |
| `city-integration.md` | 汉皋主旅程接入与局部追责，详细设计候选 | 页首“状态：详细设计候选” |
| `build-recovery-accessibility.md` | 重配、失败恢复、难度与可访问性，新增产品方案未采用 | 页首“新增产品方案，尚未采用或实现” |

### `xiaojianghu/docs/design/vfx/`（16 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `jh-b.md` | 江湖散学专属特效（二），执行中待评审 | 页首“状态：执行中，2026-10-11” |
| `gj.md` | 归烬堂逐招特效设计表，评审中 | 页首“状态：评审中” |
| `pj.md` | 巡江司逐招特效设计表，评审中 | 页首“状态：评审中” |
| `jh-c.md` | 江湖散学（三）专属特效，评审中 | 页首“状态：评审中” |
| `gy.md` | 归云谷逐招特效设计表，评审中 | 页首“状态：评审中” |
| `zc.md` | 照川剑派逐招特效设计表，执行中 | 页首“状态：执行中” |
| `xf.md` | 内功主动逐招特效设计表，评审中 | 页首“状态：评审中” |
| `hc.md` | 合川拳门逐招特效设计表，执行中 | 页首“状态：执行中” |
| `ren.md` | 人物个人技逐招特效设计表，评审中 | 页首“状态：评审中” |
| `hui.md` | 清徽阁逐招特效设计表，执行中 | 页首“状态：执行中” |
| `sf.md` | 松风观逐招特效设计表，评审中 | 页首“状态：评审中” |
| `upgrade-20261011.md` | 特效按标杆升级任务说明，执行中 | 页首“状态：执行中” |
| `bh.md` | 白鹇谷逐招特效设计表，评审中 | 页首“状态：评审中，2026-10-08” |
| `am.md` | 正道盟逐招特效设计表，评审中 | 页首“状态：评审中” |
| `jh-a.md` | 江湖散学（一）专属特效，执行中 | 页首“状态：执行中，2026-10-11” |
| `xfo.md` | 旧原型心法主动 12 门特效设计表，评审中 | 页首“状态：评审中，2026-10-08” |

## 四、现行（按目录）

### `.claude/skills/consistency-check/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `SKILL.md` | 一致性检查项目技能 | ai-onboarding.md 第 4 节“流程见项目技能 consistency-check” |

### `.claude/skills/story-writing/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `SKILL.md` | 剧情文案项目技能，R-剧情-01 出处 | R-剧情-01 |

### `xiaojianghu/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `DEPLOY.md` | 导入引导第 9 节链接的发布说明，写明本目录只做历史原型构建 | 页首“2026-10-07入口整改：本目录是文档库与历史原型” |
| `AGENTS.md` | 本工作区入口 | xiaojianghu/AGENTS.md |

### `xiaojianghu-legacy-prologue/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `DEPLOY.md` | 栖河工作区发布说明，R-发布-01 出处 | R-发布-01 |
| `AGENTS.md` | 栖河工作区协作规则 | CLAUDE.md“另有自己的 AGENTS.md” |

### `xiaojianghu-legacy-prologue/docs/`（10 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `architecture.md` | 栖河工作区架构（10-19 已更新） | 页首“2026-10-19：……襄阳演示入口……已撤除” |
| `art-pipeline.md` | 栖河工作区美术管线 | 页首“现行原生透明规范见[文档库·当前出图接口约定]” |
| `content-guide.md` | 栖河工作区内容编写指南（10-19 已更新） | 页首“2026-10-19”说明 |
| `vfx.md` | 栖河工作区 js/vfx.js 特效规范 | xiaojianghu-legacy-prologue/docs/README.md |
| `anim-pipeline.md` | 栖河工作区帧动画管线（已按表现边界加注） | 页首“当前制作范围遵守[普攻接触、功法特效命中]” |
| `audio.md` | 栖河工作区音频现状 | 页首“当前栖河分支已装配V2日常与战斗BGM” |
| `testing.md` | 栖河工作区测试与评审 | 页首“2026-10-19”说明 |
| `README.md` | 栖河工作区技术文档首页（注明下文是继承的襄阳原型说明） | 页首“本页以下内容是从主库继承的襄阳原型说明” |
| `update-workflow.md` | 每次更新的文档核对流程 | xiaojianghu-legacy-prologue/AGENTS.md“开发核对流程：docs/update-workflow.md” |
| `battle-sprite-spec.md` | 栖河工作区战斗精灵规格（已按表现边界加注） | 页首“2026-10-14当前规则” |

### `xiaojianghu-legacy-prologue/docs/assets/`（3 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `deprecated-tests.md` | 弃用／不启用测试方法清单，导入引导要求出图前先查 | ai-onboarding.md 第 4 节 |
| `production-assets.md` | 当前版本正式素材清单，R-素材-01 指定 | R-素材-01 |
| `README.md` | 【需改措辞】栖河素材目录说明，AGENTS.md 要求阅读（文中有 4 处“第X章”，R-剧情-02） | xiaojianghu-legacy-prologue/AGENTS.md“阅读……docs/assets/README.md” |

### `xiaojianghu-legacy-prologue/docs/design/`（3 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `runtime-entry.md` | 当前游戏入口与防误入规则 | ai-onboarding.md“完整规则只维护在[当前工作区入口合同]” |
| `battle-voice.md` | 栖河战斗语音接线（本工作区独有） | 页首“栖河战斗语音接线” |
| `README.md` | 【需改措辞】栖河工作区设计短链入口；页首仍写“当前第二章” | 页首“2026-10-12 当前第二章”；R-剧情-02 |

### `xiaojianghu-legacy-prologue/docs/design/qihe-map/`（9 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `three-representatives.md` | 【需改措辞】三位主事人当前游戏接入合同（文中有 3 处“第X章”，R-剧情-02） | 页首“状态：2026-10-07本地已接入” |
| `hero-staff-combo.md` | 萧白棍法连击，当前本地采用 | xiaojianghu-legacy-prologue/docs/design/README.md“2026-10-10当前本地采用” |
| `npc-pixel-refresh.md` | 栖河 NPC 场景小人统一重制，用户确认采用 | 页首“用户确认采用现行蓝灰萧白……栖河全部 NPC 的场景小人” |
| `ye-needle-battle.md` | 叶蘅针法战斗包，本地已采用 | 页首“本地已接入、已验收” |
| `cg-direction.md` | CG 分镜合同 | xiaojianghu-legacy-prologue/docs/design/README.md“CG逐镜作用……合同” |
| `README.md` | 【需改措辞】栖河地图目录（文中有 4 处“第X章”，R-剧情-02） | xiaojianghu-legacy-prologue/docs/README.md“栖河地图目录” |
| `hero-blue-adoption.md` | 蓝灰萧白正式采用，用户定稿 | 页首“主角当前 C 完整包定稿” |
| `startup.md` | 【需改措辞】游戏启动与继续进度（文中有 6 处“第X章”，R-剧情-02） | runtime-entry.md 链接 |
| `cg-three-heroines.md` | 三位主事人 CG，已正式采用 | 页首“正式采用到当前8792” |

### `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/`（21 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `implementation.md` | 【需改措辞】栖河扩展实施记录（QH-EXP-01 最新实现，多页指向） | qihe-map/prologue.md“QH-EXP-01最新实现见[扩展实施记录]”；R-剧情-02 |
| `battle-assets.md` | 【需改措辞】栖河战斗素材（标题“第一章战斗素材”） | 页首“两场战斗使用新生成的专用背景”；R-剧情-02 |
| `resources.md` | 栖河野外资源，已接入 | 页首“状态：已接入 QH-RES-01” |
| `inventory-ui-v3.md` | 【需改措辞】独立行囊（库存与事务规则仍有效，视觉以 V4 为准）（文中有 4 处“第X章”，R-剧情-02） | 页首“本页库存、事务、候补可用性与验收规则……” |
| `bgm-production.md` | 栖河 BGM 制作与验收（V1 已否决，现行依据在本页） | 页首“V1两首样段已被用户否决，保留追溯、禁止采用” |
| `training.md` | 【需改措辞】功法学习与培养交接（当前正式实现）；标题写“带入第二章培养” | 页首“当前正式实现（2026-10-12）”；R-剧情-02 |
| `chapter-presentation.md` | 【需改措辞】开始部分引导与火灾演出，栖河 README 本轮实施；标题写“第一章” | xiaojianghu-legacy-prologue/docs/design/README.md“本轮实施”；R-剧情-02 |
| `outsider-quests.md` | 三路来客支线，用户确认并接入 | 页首“用户确认三方当前委托改由徐令仪、岑霜、沈雁回直接对接” |
| `relationships.md` | 关系、送物与回信，用户确认方向 | 页首“2026-10-06 用户确认方向” |
| `jianghu-ui-v3.md` | 江湖界面 V3（编成与机制仍有效，视觉以 V4 为准） | 页首“最新视觉见[V4图像交互与悬停详情]” |
| `README.md` | 【需改措辞】栖河扩展总目录（QH-EXP-01，入链 19）；文中按“第一章／第二章”组织 | 页首“版本 QH-EXP-01……已接入村外地图、初始角色、第一章与第二章首期”；R-剧情-02 |
| `jianghu-ui-v4.md` | 江湖 V4 图像交互，已整理为流程包 | 页首“用户已认可四人同屏方向” |
| `central-hd.md` | 四向中央地图高清化合同 | 页首“参考只用用户确认的 qihe-expansion-v1/central.png” |
| `cultivation-bgm.md` | 【需改措辞】培养配乐（V5 现行目标）（文中有 3 处“第X章”，R-剧情-02） | 页首“当前目标改为V5” |
| `guiyun-household.md` | 【需改措辞】归云谷一家接入合同（10-19 更新）；标题写“第二章师门剧情” | 页首“归云谷一家：第二章师门剧情接入合同”；R-剧情-02 |
| `story.md` | 【需改措辞】栖河开始部分剧情因果（台词在 ink），文中多处“第一章” | chapter-presentation.md“剧情因果由 story.md 管理”；R-剧情-02 |
| `martial-ui-v3.md` | 【需改措辞】武学界面 V3 机制（视觉以 V4 为准）（文中有 9 处“第X章”，R-剧情-02） | 页首“视觉布局以[V4]为最新” |
| `grade-balance.md` | 【需改措辞】栖河品阶、命名、特效与初期数值（文中有 5 处“第X章”，R-剧情-02） | 页首“2026-10-06 本地实施规范” |
| `starter-equipment.md` | 【需改措辞】栖河初始装备获取；标题写“第一章初始装备” | 页首“本页负责当前8792栖河的获取设计”；R-剧情-02 |
| `bgm.md` | 栖河 BGM V2 | 页首“V1被用户否决，V2两首新版样段已……” |
| `layout.md` | 【需改措辞】栖河地图与人物分布（采用的拓扑）（文中有 4 处“第X章”，R-剧情-02） | 页首“此页是采用的拓扑和分时站位设计” |

### `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/`（17 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `model-implementation.md` | 江湖 UI 数据层实现（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `implementation.md` | 【需改措辞】江湖 UI 开发记录（江湖界面流程包）（文中有 4 处“第X章”，R-剧情-02） | ui-flow/README.md“本包是设计合同” |
| `settings.md` | 设置与存档管理（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `contracts.md` | 状态与接口合同（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `party.md` | 人物与四人编成（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `inventory.md` | 装备、行囊与物品使用（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `art-acceptance.md` | 江湖界面美术交付（现行 V6）（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `navigation.md` | 入口、页面与输入（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `README.md` | 江湖界面开发流程包入口（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `interaction-v7.md` | V7 江湖各页交互，用户确认（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `delivery.md` | 素材、开发顺序与验收（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `martial-preview-v9.md` | 【需改措辞】武学 V9，已接入 8792（江湖界面流程包）（文中有 7 处“第X章”，R-剧情-02） | ui-flow/README.md“本包是设计合同” |
| `growth.md` | 【需改措辞】属性、武学、内功与被动（江湖界面流程包）（文中有 3 处“第X章”，R-剧情-02） | ui-flow/README.md“本包是设计合同” |
| `other-pages.md` | 宠物、任务、行程与设置（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `quest-codex-refresh-20261010.md` | 【需改措辞】江湖行记窄目录与图鉴，已接入（江湖界面流程包）（文中有 4 处“第X章”，R-剧情-02） | ui-flow/README.md“本包是设计合同” |
| `art-v6.md` | V6 细线分区，用户确认方向（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |
| `quest-journal-v10.md` | 任务日志 V10（已由 10-10 窄目录接续细化）（江湖界面流程包） | ui-flow/README.md“本包是设计合同” |

### `xiaojianghu-legacy-prologue/docs/design/qihe-map/scripts/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `clash-voice-plan.md` | 侧口交锋新增台词待配音清单 | 页首“文字已接入8792” |
| `representatives-voice-plan.md` | 三位主事人实际台词与拟配音（由 8792 导出） | 页首“由当前8792实际加载的……导出” |

### `xiaojianghu-legacy-prologue/tools_assets/vendor/agent_sprite_forge/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `VERSION.md` | 第三方工具锁定副本版本说明 | 页首“agent-sprite-forge 锁定副本” |

### `xiaojianghu/bible/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `定稿事实.md` | 设定锁定事实表，R-剧情-05 指定的单一来源 | R-剧情-05；页首“锁定的条目只有用户同意才能改” |
| `README.md` | 设定圣经入口，R-剧情-05 单一来源 | 页首“本目录是设定的单一来源” |

### `xiaojianghu/bible/人物/`（20 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `管事.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `差役.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `陆衡.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `采办随从.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `帮众.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `陈伯.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `乌魁.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `萧白.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `宋先生.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `药商.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `沈雁回.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `周婶.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `采办使.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `店家.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `护院.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `徐令仪.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `村口老人.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `岑霜.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `周砚.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |
| `叶蘅.md` | 设定圣经人物页（R-剧情-05 单一来源） | R-剧情-05 |

### `xiaojianghu/bible/物品/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `栖河村路牌.md` | 设定圣经物品页（R-剧情-05 单一来源） | R-剧情-05 |

### `xiaojianghu/docs/`（9 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `ai-onboarding.md` | AI 开发导入引导，CLAUDE.md 指定的开工必读 | CLAUDE.md“开工前先读 AI 开发导入引导” |
| `art-pipeline.md` | 美术管线，R-生图-01/02/04 的详细出处 | 规则登记表 R-生图-01“xiaojianghu/docs/art-pipeline.md#生图源登记与切换” |
| `anim-pipeline.md` | 帧动画管线，设计 README 多处当现行入口 | design/README.md“制作与验收四向站立／行走”行 |
| `battle.md` | 战斗系统技术文档，导入引导战斗入口，10-14 已按现行表现边界更新 | 页首“当前表现规则（2026-10-14用户明确）” |
| `testing.md` | 【需改措辞】测试总说明，导入引导第 8 节入口（文中有 4 处“第X章”，R-剧情-02） | ai-onboarding.md 第 8 节 |
| `README.md` | 本工作区技术文档首页 | 页首“当前游戏：[栖河试玩 · 四向地图版]” |
| `particle-fx.md` | 通用粒子驱动，设计 README 当现行入口 | 页首“现行实现：[模拟与绘制]” |
| `document-library.md` | 文档书阁说明，导入引导链接 | ai-onboarding.md 第 2 节 |
| `battle-sprite-spec.md` | 战斗精灵规格 v4，10-14 按现行表现边界更新 | 页首“2026-10-14当前表现边界……下文基础九态和像素规格仍有效” |

### `xiaojianghu/docs/design/`（132 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `cultivation-activities.md` | 培养活动目录，设计 README 当负责页 | design/README.md“编写具体课程、生产与交游项目”行 |
| `character-asset-quality.md` | 【需改措辞】角色素材质量规格，导入引导第 4 节现行入口（文中有 3 处“第X章”，R-剧情-02） | ai-onboarding.md 第 4 节 |
| `cultivation-simple-approved.md` | 养成界面 V5 确认需求，设计 README 当现行入口（费用以体力规则覆盖） | 页首“2026-10-04 用户确认简化预览并授权完成开发” |
| `skill-vfx-reference.md` | 技能特效质量基准，用户确认的视觉方向 | 页首“状态：用户确认的视觉方向” |
| `pets-acceptance.md` | 宠物验收合同（目标合同，非一次性记录） | 页首“状态：目标验收合同” |
| `wilderness-encounter-research.md` | 野外遇敌调研，设计 README 仍以它为该任务“先读” | design/README.md“设计野外敌群、警戒、避战和刷新”行 |
| `world-map-layout.md` | 大地图方位与门派布局，10-16 当前设计方案 | 页首“版本 WM-2026-10-16.1。状态：当前设计方案” |
| `cultivation-redraw.md` | 养成动作整套重画，设计 README 标为最新评审（取代 cultivation-action-loops） | design/README.md“养成动作最新评审” |
| `npc-interaction.md` | NPC 交互设计方案，设计 README 当负责页 | 页首“状态：设计方案” |
| `ambient-npc-design.md` | 普通 NPC 模板，fullflow-20261016.3 生成 | 页首“状态：fullflow-20261016.3” |
| `voice-runtime.md` | 角色语音装配与播放，设计 README 链接 | design/README.md 文档状态用语节 |
| `portrait-review.md` | 人物参考立绘进度表，设计 README 链接，指向现行 v5 标准 | 页首“当前逐人标准 female-visual-v5.md” |
| `jianghu-portraits.md` | 江湖菜单三人立绘，用户确认的风格基准 | 页首“用户已确认本套风格，作为后续菜单立绘基准” |
| `presentation.md` | 画面、界面与素材表现规范 | 页首“状态：桌面版设计基准” |
| `secret-manuals.md` | 秘籍规则，已确认并接入 | 页首“状态：已确认并接入运行时，2026-10-08” |
| `growth-combat.md` | 成长与战斗设计 | 页首“状态：保留现行游戏已做的战斗体验作为基础” |
| `skill-polish.md` | 现有技能表现基线，用户确认 | 页首“状态：用户确认以原有技能版为基础” |
| `martial-structure.md` | 功法结构规范 v3，导入引导现行入口 | ai-onboarding.md 第 4 节 |
| `voice-npc.md` | 普通 NPC 单句配音规则，设计 README 链接 | design/README.md 文档状态用语节 |
| `cultivation-q-generation-standard.md` | 养成 Q 版统一生成标准，导入引导现行入口 | ai-onboarding.md 第 4 节 |
| `map-development-standard.md` | 现行地图开发规范 | 页首“地图开发规范（现行唯一入口）” |
| `life.md` | 生活、资源与外出设计方案 | 页首“状态：设计方案；生活技能暂缓上线” |
| `wen-visual-revision.md` | 闻疏桐当前定妆 r5 | 页首“当前定妆 r5” |
| `exploration-containers.md` | 探索容器规范，用户已确认方案（具体点位为原型襄阳地图） | 页首“状态：用户已确认方案一” |
| `party-pets.md` | 队伍与宠物，已确认方向 | 页首“状态：队友、宠物分离……来自已确认方向” |
| `character-portrait-style.md` | 人物立绘固定风格，用户确认 | 页首“状态：用户于 2026-09-30 确认” |
| `cultivation-story-approved-v6.md` | 养成剧情 Q 版对白，用户确认并接入 | 页首“用户已确认……授权开发” |
| `pets.md` | 宠物系统设计规范 | 页首“本篇是宠物玩法的维护入口” |
| `manual-placement.md` | 【需改措辞】秘籍投放表 v1 设计定稿（文中有 3 处“第X章”，R-剧情-02） | 页首“状态：设计定稿，2026-10-08” |
| `character-personality-performance.md` | 人设驱动对白动作验收规范 | 页首“状态：2026-10-05整改规范” |
| `battle-voice-lines.md` | 战斗逐句台本 | 设计 README 链接 battle-voice.md |
| `cast-visuals.md` | 人物形象总览，fullflow-20261016.3 生成 | 页首“状态：fullflow-20261016.3” |
| `voice-backend.md` | 角色语音管理后台说明 | 设计 README 链接 |
| `jianghu-icons.md` | 江湖行卷图标规范，用户批准 v3 画风 | 页首“2026-09-30 用户已批准 v3 静态画风” |
| `story-atlas-audit.md` | 人设矛盾审核，fullflow-20261016.3 生成 | 页首“状态：fullflow-20261016.3” |
| `combat-action-contracts.md` | 角色出手动作合同，已按 10-14 表现边界加注 | 页首“2026-10-14现阶段边界” |
| `battle-voice.md` | 战斗语音制作与表演规则 | 页首“本页负责制作与表演规则” |
| `story-endgame-review.md` | 叶家真相与白石终局，10-16 全流程版 | 页首“2026-10-16全流程创作版” |
| `companion-women.md` | 女性同伴人物篇目录 | 页首“状态：设计方案，剧情接入逐人记录” |
| `shop-ui-standard.md` | 挂轴式店铺界面，用户确认的界面方向 | 页首“状态：用户 2026-10-09 确认的界面方向” |
| `cultivation-acceptance.md` | 养成界面 V5 验收合同与回归入口 | design/README.md“验收合同与测试入口” |
| `local-game-entry.md` | 本机游戏入口与工作区 | 导入引导第 1 节链接 |
| `story-source-migration.md` | 【需改措辞】剧情与设定迁移方案，用户确认（R-剧情-04/05 出处）（文中有 3 处“第X章”，R-剧情-02） | 页首“状态：2026-10-18 用户确认” |
| `skill-vfx-pipeline.md` | 技能特效生成流程，R-特效-01 指定 | R-特效-01 |
| `romance-rules.md` | 关系、入队与结缘细则，已确认方向 | 页首“状态：已确认方向（2026-10-09 用户）” |
| `weakness-system.md` | 弱点、护盾与破势系统，已接入运行战斗 | 页首“状态：已接入离线战斗模拟与运行战斗” |
| `map-size-review.md` | 地图分级与分区验收，现行地图规范的配套页 | 页首“map-standard: supporting” |
| `factions.md` | 门派与组织目录 | 页首“下列各派原有性质与人员继续有效” |
| `life-skills.md` | 生活技能规范（发布暂缓，设计保留） | 页首“设计与原型保留” |
| `story-decisions.md` | 【需改措辞】故事方案决定记录，设计 README 用作采用范围核对入口（文中有 4 处“第X章”，R-剧情-02） | design/README.md“核对故事方案采用范围”行 |
| `dialogue-staging.md` | 对话立绘站位（OC.4 采用）；需对照 R-画风-03 的新对齐规则 | 页首“状态：OC-2026-10-04.4……采用”；R-画风-03 |
| `faction-attire.md` | 门派衣装规则 | 页首“当前图鉴的服装整改规则” |
| `voice-expansion.md` | 按描述扩充音色 | 设计 README 链接 |
| `jianghu-portrait-prompts.md` | 江湖菜单立绘提示词，是用户确认风格基准的出处 | jianghu-portraits.md“完整提示词见[制作记录]” |
| `ye-routes.md` | 叶蘅两条路线，已确认方向 | 页首“两条方向及不同立绘、能力是已确认” |
| `companion-recruitment.md` | 同伴招募系统合同 | 页首“状态：招募设计合同” |
| `cultivation-implementation.md` | 归云谷养成界面实现说明，设计 README 当本地实现入口 | design/README.md“运行和检查养成界面”行 |
| `character-condition-growth.md` | 人物持久状态与同队成长，用户确认 | 页首“用户确认：世界顶尖战力不超过90级” |
| `asset-requirements.md` | 素材需求总规范 | 页首“状态：开发与生产规范” |
| `voice-villains.md` | 反派音色候选 | 设计 README 链接 |
| `cultivation-design.md` | 培养阶段体验设计入口 | 页首“状态：设计阅读入口” |
| `cultivation-q-portraits.md` | Q 版人物情绪与动作规范（公共规格以统一标准为准） | design/README.md“制作培养Q版人物”行 |
| `cultivation-gift-portrait-selection.md` | 送物人物选择，用户通过并接入 | 页首“用户已通过古典纸面整套预览，已接入本地游戏” |
| `scene-spatial-contract.md` | 场景画板与空间合同，现行地图规范配套 | 页首“map-standard: supporting” |
| `companion-power.md` | 同伴武力与入队配置（逐人） | 页首“状态：设计方案，未实装”；design/README.md 任务表 |
| `shared-insight-pool.md` | 江湖历练共享池 | 页首“实施对象为8792当前游戏” |
| `README.md` | 【需改措辞】设计短链入口；页首仍写“当前第二章” | 页首“2026-10-12 当前第二章数值与传承”；R-剧情-02 |
| `story-payoffs-review.md` | 人物铺垫与回收，10-16 当前设计 | 页首“2026-10-16当前设计” |
| `village-layout-research.md` | 村落生活空间调研，现行地图规范要求先读 | map-development-standard.md“开发地图先读本文，再读[生活空间设计]” |
| `companion-men.md` | 男性同伴短篇招募表 | 页首“状态：精简版设计方案” |
| `timeline.md` | 三年事件表 | design/README.md“写主线、核对因果”行 |
| `opening-pei-disguise.md` | 乔装账房与遗物修订，用户确认（设定圣经宋先生条目依据） | 页首“用户确认两项改动” |
| `story-travel-review.md` | 游历与终局推进，10-16 当前设计 | 页首“2026-10-16。当前设计” |
| `damage-numbers.md` | 伤害数字与战斗浮字规范 | 页首“状态：设计规范……运行战斗按本页接入” |
| `wilderness-encounters.md` | 野外可见遇敌实施合同 | 页首“第一版实施合同” |
| `status-effects.md` | 异常状态 v1，已接入 | 页首“状态：已接入离线战斗模拟与运行战斗” |
| `story-presentation.md` | 剧情表现规则 | 页首“2026-09-30 用户要求的开发限制” |
| `pei-zhigu-assets.md` | 裴知古素材与动作 | 设计 README 链接 |
| `martial-lineage.md` | 门派功法传承 v3，规则已确认 | 页首“状态：规则已确认并已落地数据与运行代码” |
| `item-naming-standard.md` | 物品与装备命名规范 | 导入引导第 4 节 |
| `cast-timeline.md` | 【需改措辞】人物剧情时间窗口，fullflow-20261016.3 生成（文中有 3 处“第X章”，R-剧情-02） | 页首“状态：fullflow-20261016.3” |
| `mountain-cultivation-events.md` | 【需改措辞】正派山居三年养成事件（文中有“第几章”） | design/README.md“设计正派山居养成的事件”行；R-剧情-02 |
| `cultivation.md` | 三年体力制养成通用机制 | 页首“已获用户确认并接入本地游戏” |
| `romance.md` | 结缘系统现行口径 | 页首“本页是现行设计口径” |
| `runtime-moves.md` | 功法 v3 招式运行登记（本目录原型实现记录，招式数据仍现行） | 页首“状态：现行实现（2026-10-08……）” |
| `ye-appearance.md` | 叶蘅三阶段形象 | 页首“状态：三阶段形象方案” |
| `delivery.md` | 文档与实现边界，导入引导与两份 README 入口；正文“先以襄阳片段测试”已过时需更新 | ai-onboarding.md 第 2 节；页首“当前执行范围：先以襄阳片段（已删除）” |
| `hangao-qiyue-scenes-v4.md` | 栖月楼 V4 分场景（取代 V3） | 页首“用户明确指定……否定V3” |
| `romance-stories.md` | 十四位女性结缘篇 | 页首“全部具备结缘路线为已确认方向” |
| `faction-styles.md` | 门派风格，fullflow-20261016.3 生成 | 页首“状态：fullflow-20261016.3” |
| `voice-emotion.md` | 台词情绪与语音合成 | 设计 README 链接 |
| `cultivation-assets.md` | 养成素材合同与台账 V8 | 设计 README 链接 |
| `event-scheduling-system.md` | 事件排期系统，导入引导现行入口 | ai-onboarding.md 第 4 节 |
| `companion-performance.md` | 可加入角色六个对白状态，用户确认 | 页首“状态：2026-10-04，用户确认每人6张” |
| `guiyun-household.md` | 归云谷师门人物，用户已确认 | 页首“状态：已确认（2026-10-07 用户确认……）” |
| `grades-and-skill-vfx.md` | 【需改措辞】品阶与技能特效规范 v1（文中有 4 处“第X章”，R-剧情-02） | 页首“静态图标第二版画风已获用户确认” |
| `story-framework-review.md` | 四部分完整主线，当前设计入口 | 页首“当前设计入口” |
| `cast.md` | 【需改措辞】主要人物（文中有 3 处“第X章”，R-剧情-02） | design/README.md“写萧白、叶蘅、苏芷”行 |
| `story.md` | 故事主线 | 页首“状态：已确认方向 + 设计方案” |
| `world.md` | 势力与世界 | 页首“状态：……属于设计方案” |
| `cultivation-animation.md` | 养成微动 V5，当前采用 | 页首“当前采用[简化需求]” |
| `v4-vfx-per-skill.md` | 逐招专属特效规范，执行中，取代组件库为主方案 | 页首“状态：执行中……本页取代[组件库模板]” |
| `character-levels-100.md` | 100 级上限，用户确认 | 页首“用户确认：角色满级100级” |
| `voice-management.md` | 角色语音管理 | 设计 README 链接 |
| `bond-banter.md` | 羁绊与闲话，用户已拍板 | 页首“状态：用户已拍板（2026-10-10）” |
| `map-preflight.md` | 地图生产前置设计，现行地图规范配套 | 页首“map-standard: supporting”；design/README.md 任务表 |
| `opening-three-representatives.md` | 三位主事人剧情修订，已在 8792 接入，设定圣经依据 | xiaojianghu-legacy-prologue/docs/design/README.md“三位主事人的剧情……已在当前8792接入” |
| `companion-support.md` | 辅助同伴战斗设计 | 页首“状态：设计方案，未实装” |
| `combat-presentation-boundary.md` | 当前战斗表现边界 | 页首“2026-10-14用户再次明确的现阶段规则” |
| `xiangyang-icons-v3.md` | 【需改措辞】襄阳图标 v3 已批准画风（图标画风通用，名称沿用）（文中有 7 处“第X章”，R-剧情-02） | 页首“用户已确认第二版评审图的静态画风” |
| `companions.md` | 可招募同伴总名册 | 页首“状态：19人招募资格登记” |
| `visual-acceptance.md` | 视觉与交互验收合同，导入引导链接 | ai-onboarding.md 第 8 节 |
| `cultivation-formal-martial.md` | 归云谷基础功法与上乘传承（10-12 已更新） | 页首“2026-10-12 当前8792已接入初阶及高阶授课” |
| `numeric-reference.md` | 数值参考与采用边界 | 页首“2026-10-16按现行实现复核” |
| `world-map-journeys.md` | 整月大地图历练 | 页首“整月占用与多路线预留要求已确认” |
| `story-writing.md` | 剧情文案规范，R-剧情-03 出处 | R-剧情-03 |
| `chapter1-clash-jia-20261014.md` | 【需改措辞】8792 当前侧口双甲级群攻；标题写“第一章尾声” | 页首“2026-10-14最新表现修订”；R-剧情-02 |
| `character-face-identity.md` | 人物五官区分 | design/README.md 衣装与五官整改入口 |
| `cultivation-q-pose-diversity.md` | Q 版姿态差异方案，导入引导现行入口 | ai-onboarding.md“姿态差异门槛” |
| `voice-current-cast.md` | 当前人物语音同步，设计 README 语音入口 | design/README.md“制作角色语音与确认音色”行 |
| `duan-hotpants.md` | 段明棠衣装修订 | 页首“按用户要求改服装” |
| `story-ai-patterns.md` | 台词反例库，R-剧情-01/06 出处 | R-剧情-06 |
| `mountain-cultivation-curriculum.md` | 山居首季课程 | design/README.md“编写具体课程”行 |
| `role-assets.md` | 角色类型与必需素材 | 导入引导第 4 节 |
| `cultivation-routes.md` | 三条培养路线框架，已确认 | 页首“多路线可能性与提前纳入设计已确认” |
| `character-walk-quality.md` | 四向探索行走质量 | design/README.md 任务表 |
| `female-visual-v5.md` | 女性立绘第五版，当前标准 | 页首“当前选择与画面标准” |
| `ye-expression-prompts.md` | 叶蘅表情差分（初始装） | design/README.md“写萧白、叶蘅、苏芷”行 |
| `protagonist-sect.md` | 【需改措辞】萧白的门派与三年成长（文中有 3 处“第X章”，R-剧情-02） | 页首“用户接受本版归云谷安排” |
| `character-performance.md` | 主角与重要角色表现设计 | 页首“状态：开发与美术设计规范” |
| `cultivation-energy-rebalance.md` | 养成体力与费用，当前规则 | 页首“此稿是当前费用规则” |
| `cultivation-reference.md` | 侠客风云传养成机制调研，设计 README 仍以它为体力与日历机制“先读” | design/README.md“核对侠客风云传的体力与日历机制”行 |

### `xiaojianghu/docs/design/combat-characters/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `xiaobai-multiweapon.md` | 萧白多武器动作，已制作并接入 | 页首“已制作并本地接入” |
| `lu-xiaodou.md` | 卢小豆数值与精灵，用户确认 | 页首“用户确认：默认剑” |

### `xiaojianghu/docs/design/companion-performance/`（19 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `duan-mingtang.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `ruan-qingque.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `liu-hanyan.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `cen-shuang.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `qiao-xingzhou.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `pei-zhigu.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `xu-lingyi.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `wen-shutong.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `ye-heng.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `index.md` | 可加入角色对白状态目录 | design/README.md 人物与对白整改入口 |
| `lu-heng.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `qi-zheng.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `tang-zhaoxue.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `su-zhi.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `huo-zhuchen.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `yan-xiaolou.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `shen-yanhui.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `qin-feiyuan.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |
| `shi-changgeng.md` | 可加入角色六个对白状态逐人页，按统一规格维护 | companion-performance/index.md；companion-performance.md“用户确认每人6张” |

### `xiaojianghu/docs/design/companions/`（18 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `duan-mingtang.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `ruan-qingque.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `qin-feiyuan-assets.md` | 秦绯鸢素材与静态演出卡 | 页首“当前交付设计、对白和图鉴定妆参考” |
| `liu-hanyan.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `cen-shuang.md` | 【需改措辞】同伴人物负责页，形象、年龄、武学与招募约束继续有效（文中有 5 处“第X章”，R-剧情-02） | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `qiao-xingzhou.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `pei-zhigu-valley.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `pei-zhigu.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `xu-lingyi.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `yan-xiaolou-costume.md` | 晏小楼演出衣短裙修正（当前衣装） | 页首“## 当前衣装”；portrait-review.md |
| `wen-shutong.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `ye-heng.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `ruan-qingque-assets.md` | 阮青雀素材卡 | 页首“本轮交付人物图鉴参考与剧情设计” |
| `tang-zhaoxue.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `su-zhi.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `yan-xiaolou.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `shen-yanhui.md` | 【需改措辞】同伴人物负责页，形象、年龄、武学与招募约束继续有效（文中有 3 处“第X章”，R-剧情-02） | 页首“本页已有形象、年龄、武学与招募约束继续有效” |
| `qin-feiyuan.md` | 同伴人物负责页，形象、年龄、武学与招募约束继续有效 | 页首“本页已有形象、年龄、武学与招募约束继续有效” |

### `xiaojianghu/docs/design/cultivation-balance-20261012/`（4 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `activity-table.md` | 活动收益全表，由正式游戏规则生成 | 页首“由正式游戏规则生成” |
| `martial-table.md` | 功法、进度与练习次数 | cultivation-balance-20261012/README.md |
| `README.md` | 【需改措辞】培养数值现行规则，取代首轮临时换算；标题写“第二章” | 页首“本页取代 20261012 首轮整改中临时换算”；R-剧情-02 |
| `balance-report.md` | 【需改措辞】36 个月预算与现行战斗核对（由测试证据生成，配套现行数值）（文中有 3 处“第X章”，R-剧情-02） | 页首“本页由测试证据生成” |

### `xiaojianghu/docs/design/cultivation-rework-20261012/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `dialogue.md` | 【需改措辞】培养部分逐句对白与演出设计（8792 已接入关系与授课）；标题写“第二章” | xiaojianghu-legacy-prologue/docs/design/README.md“2026-10-12 当前第二章”；R-剧情-02 |
| `README.md` | 【需改措辞】培养、人物往来整改入口（入链 96）；标题写“第二章” | 页首“正式游戏实施位置：xiaojianghu-legacy-prologue / 8792”；R-剧情-02 |

### `xiaojianghu/docs/design/factions/`（10 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `hechuan.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `patrol.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `xuanzhuhui.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `alliance.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `court.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `guijintang.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `zhaochuan.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `qinghui.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `white-heron.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |
| `songfeng.md` | 门派负责页，按 10-16 全流程标注新旧职责 | factions.md；页首（门派状态行） |

### `xiaojianghu/docs/design/fullflow-story-20261016/`（11 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `companion-weight-and-vignettes.md` | 十九位同伴分量与十六则短篇（10-16 全流程） | fullflow-story-20261016/README.md |
| `validation.md` | 全流程本轮核对（fullflow-20261016.3 版本配套） | 页首“fullflow-20261016.3” |
| `characters.md` | 全流程人物负责页 | 页首“当前全流程设计的人物负责页” |
| `README.md` | 全流程剧情入口 | design/README.md“2026-10-16当前” |
| `implementation-plan.md` | 全流程落地矩阵 | fullflow-story-20261016/README.md |
| `migration-and-calendar.md` | 三年排期承接与旧稿迁移 | fullflow-story-20261016/README.md |
| `hangao-calendar-audit.md` | 汉皋群像排期核查 | fullflow-story-20261016/README.md |
| `story.md` | 全流程剧情正文 | story-framework-review.md“唯一全程叙事入口” |
| `hangao-year2.md` | 第二年正月汉皋群像 | fullflow-story-20261016/README.md |
| `feasibility.md` | 全流程实现承载力核查 | fullflow-story-20261016/README.md |
| `companions-and-side-stories.md` | 十九位同伴与地方故事嵌入稿 | story-payoffs-review.md“完整负责稿见” |

### `xiaojianghu/docs/design/martial-review/`（27 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `icon-tiers.md` | 功法与心法图标五档标准，用户确认 | 页首“用户已确认第二批五档10张样稿，作为扩展基准” |
| `icon-production.md` | 功法图标生成流程 | martial-review/README.md |
| `attack-expansion-v1.md` | 攻击招式扩充 v1 | design/README.md 功法入口 |
| `assets.md` | 技能、心法与装备素材制作合同 | 页首“五档10张已批准为风格基准” |
| `hechuan.md` | 合川拳门招式（顶部 v3 自动生成部分现行，下文 V2 方案保留） | 页首“v3 招式总览（自动生成）” |
| `armor-acc-stats.md` | 护具与佩饰数值，已定稿 | 页首“状态：已定稿并接入模拟” |
| `patrol.md` | 巡江司招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |
| `guiyun.md` | 归云谷招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |
| `alliance.md` | 正道盟招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |
| `martial-systems.md` | 门派功法清单 v3，名称已定稿 | 页首“规则已确认，名称已定稿（2026-10-08）” |
| `hearts.md` | 心法 18 项方案（按结构规范解释） | 页首“结构更新（2026-10-06）” |
| `octopath-research.md` | 八方旅人调研与取舍，武学评审多页以它为依据 | martial-review/README.md；design/README.md 武学评审节 |
| `skill-text-v4.md` | 技能描述与特效分镜 v4，由数据生成 | 页首“由 tools_docs/build_skill_docs.py 从 skill-text-v4.json 生成” |
| `README.md` | 武学评审入口 | design/README.md 武学与装备评审节 |
| `hearts-numbers.md` | 内功数值 v1 | 页首“设计数值，已接入离线战斗模拟” |
| `weapon-stats.md` | 武器数值 v1，已定稿 | 页首“状态：已定稿并接入模拟” |
| `hearts-runtime.md` | 内功接入运行时（本目录原型实现记录，数据链现行） | 页首“状态：现行实现记录” |
| `equipment.md` | 装备与素材总体设计 | martial-review/README.md |
| `hearts-naming.md` | 内功命名，用户已审定 | 页首“状态：用户已审定（2026-10-07）” |
| `rules.md` | 武学、心法与装备规则（按结构规范解释） | 页首“结构更新（2026-10-06）” |
| `lineage-v3-naming.md` | 门派功法 v3 命名审定表，已定稿 | 页首“状态：定稿（2026-10-08……由 Claude 代为定稿）” |
| `guijintang.md` | 归烬堂招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |
| `zhaochuan.md` | 照川剑派招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |
| `move-contracts.md` | 全招式命名与数值合同 v3，导入引导现行入口 | ai-onboarding.md 第 4 节“64 项招式合同 v3” |
| `qinghui.md` | 清徽阁招式方案 v3 | 页首“v3 招式总览（自动生成）” |
| `white-heron.md` | 白鹇谷招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |
| `songfeng.md` | 松风观招式（顶部 v3 自动生成部分现行） | 页首“v3 招式总览（自动生成）” |

### `xiaojianghu/docs/design/martial-review/balance/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `research.md` | 数值研究依据与采用边界（10-12 补充） | 页首“2026-10-12补充” |

### `xiaojianghu/docs/design/pre-hangao-completion-20261013/`（6 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `implementation.md` | 入汉皋前接入顺序与验收合同（已在 8792 执行） | xiaojianghu-legacy-prologue/docs/design/README.md“正式入城前流程已接入并验证至南门” |
| `dialogue.md` | 入汉皋前全量逐句稿（已接入 8792） | 同上；production-progress.md |
| `staging.md` | 入汉皋前演出与素材方案 | 同上 |
| `README.md` | 入汉皋前补全设计入口（已接入 8792） | xiaojianghu-legacy-prologue/docs/design/README.md“2026-10-16：[入汉皋前剧情补全]” |
| `production-progress.md` | 入汉皋前正式接入执行记录，栖河 README 指定的当前进度页 | xiaojianghu-legacy-prologue/docs/design/README.md“当前进度与证据见[执行记录]” |
| `pei-and-handoff.md` | 知古同行与汉皋交接合同 | pre-hangao-completion-20261013/README.md |

### `xiaojianghu/docs/design/system-completion-20261016/`（8 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `growth-combat.md` | 百级成长与多武器补充（系统补充 26 项之一） | system-completion-20261016/README.md |
| `characters-factions.md` | 同伴、组织身份与传承补充合同 | system-completion-20261016/README.md |
| `world-events-save.md` | 世界事件与长期保存补充合同 | system-completion-20261016/README.md |
| `decisions-needed.md` | 本轮已确认的三项口径（R1–R3） | 页首“用户已在本轮逐项选择” |
| `README.md` | 系统设计补充入口 | design/README.md“2026-10-16：[系统设计补充与一致性校正]” |
| `traits-integration.md` | 后天特征与伤病接入补充 | system-completion-20261016/README.md |
| `endings-relationship-integration.md` | 人物关系、补救线路与结局组合合同 | system-completion-20261016/README.md |
| `system-status.md` | 当前系统规则与接入状态（D01/D02 负责页） | 页首“本表负责定位权威与区分状态” |

### `xiaojianghu/docs/design/traits-20261013/`（6 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `implementation.md` | 特征与状态开发接入合同（V2 路线版） | 页首“catalog.acquisition和routes.json是当前权威” |
| `routes.md` | 正向永久特性获取路线（V2） | 页首“2026-10-13修订” |
| `triggers.md` | 特性触发与授予规则（路线版） | 页首“版本2……原单事件触发稿已归档” |
| `README.md` | 特征与状态设计包入口（路线版，未采用到正式存档）；异常状态页把它当现行负责页 | status-effects.md“现有剧情新增的永久特征和持久状态见[特征状态设计包]” |
| `numbers.md` | 特性数值与叠加合同 | 页首“JSON是逐项数据唯一源” |
| `ui.md` | 特征与状态 UI 设计 | traits-20261013/README.md |

### `xiaojianghu/docs/design/vfx/metrics/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `fx-grades.md` | 特效等级量化实测结果，由脚本生成 | 页首“状态：实测结果。由 tools_fx/fx_measure.sh 生成” |

### `xiaojianghu/docs/rules/`（1 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `README.md` | 规则管理说明，已写状态 | 页首“状态：现行　最后核对：2026-10-19” |

### `（根目录）/`（2 份）

| 文档 | 理由 | 依据 |
|---|---|---|
| `CLAUDE.md` | 根目录项目入口，规则登记表与生图约定的引用入口 | CLAUDE.md 页首“## 规则登记表（先读）” |
| `AGENTS.md` | 根目录项目入口 | AGENTS.md |
