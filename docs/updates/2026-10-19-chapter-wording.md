# 现行文档“第几章”措辞改为四部分说法（2026-10-19）

状态：现行　最后核对：2026-10-19

## 需求

按 R-剧情-02（剧情只分开始、培养、游历、终局四部分，不说“第几章”），把两个工作区现行文档里残留的“第一章／第二章／第三章”等写法逐处按上下文改成四部分说法。只改措辞，不改设定、剧情事实与数值（R-剧情-05）；未删文件、未提交 git，未动 `docs/rules/rules.json`、`rules.lock`。

## 映射口径

依据 `docs/design/opening-state.md`、`docs/design/README.md` 第 178 行、`story-framework-review.md` 与旧版 `archive/design/story-framework-before-20261016/`：

| 旧写法 | 改为 | 依据 |
| --- | --- | --- |
| 第一章（栖河村开篇，泛指） | 开始部分 | 序章《山村来客》＋第一章《风起栖河》合为开始部分 |
| 第一章（与序章并列、需区分时） | 风起栖河段／《风起栖河》（开始部分后段） | opening-state 表：序章与《风起栖河》是开篇两段 |
| 序章与第一章、序章／第一章 | 开始部分（必要时括注“序章与风起栖河段”） | 同上 |
| 第一章末 | 开始部分末尾 | — |
| 第二章（入谷后三年） | 培养部分／培养 | 2026-10-03 起第二章即三年师门培养 |
| 第二章首月、第二章第一个月 | 培养第一年一月 | R-剧情-02 培养期用“第一年 X 月”；pre-xiangyang-story“入门（1月月初）” |
| 第二章开篇、第二章次晨 | 培养开始时、培养开始的次晨 | — |
| 第八章／第8章（旧二十章，三年末身世收束、36 月末下山） | 培养末 | 旧框架“入世养成篇＝第一至八章” |
| xiaojianghu 工作区“第一章 · 襄阳风云”（旧襄阳演示：街市、偏巷、渡口、南门、庙外、寨门、山洞、庙内 8 场景；红冠将军） | 旧襄阳演示／襄阳演示 | `js/story.js` 头注、`js/ui.js` 顶栏原文、`js/core.js` 刮风脚 |
| 代码门槛“第二章开放”“第三章起显示” | 运行时章节值 `S.chapter≥2`（进入培养）／`S.chapter≥3` | `js/menu.js` 的 `mnXfOn()`、`mnQOn()`；8792 `chapter` 在开始部分结算后为 2 |

## 改动清单（115 份文件，共 344 处）

| 文件 | 改动处数 | 备注 |
| --- | --- | --- |
| `xiaojianghu/bible/人物/周婶.md` | 1 |  |
| `xiaojianghu/bible/人物/陈伯.md` | 1 |  |
| `xiaojianghu/bible/定稿事实.md` | 2 |  |
| `xiaojianghu/docs/README.md` | 2 |  |
| `xiaojianghu/docs/art-pipeline.md` | 1 |  |
| `xiaojianghu/docs/design/README.md` | 10 |  |
| `xiaojianghu/docs/design/asset-requirements.md` | 1 |  |
| `xiaojianghu/docs/design/bond-banter.md` | 1 |  |
| `xiaojianghu/docs/design/cast-timeline.md` | 4 |  |
| `xiaojianghu/docs/design/cast-visuals.md` | 2 |  |
| `xiaojianghu/docs/design/cast.md` | 3 |  |
| `xiaojianghu/docs/design/chapter1-clash-jia-20261014.md` | 1 |  |
| `xiaojianghu/docs/design/character-asset-quality.md` | 3 |  |
| `xiaojianghu/docs/design/character-levels-100.md` | 1 |  |
| `xiaojianghu/docs/design/combat-presentation-boundary.md` | 1 |  |
| `xiaojianghu/docs/design/companions/cen-shuang.md` | 5 |  |
| `xiaojianghu/docs/design/companions/shen-yanhui.md` | 3 |  |
| `xiaojianghu/docs/design/companions/xu-lingyi.md` | 2 |  |
| `xiaojianghu/docs/design/cultivation-acceptance.md` | 1 |  |
| `xiaojianghu/docs/design/cultivation-balance-20261012/README.md` | 3 |  |
| `xiaojianghu/docs/design/cultivation-balance-20261012/balance-report.md` | 3 |  |
| `xiaojianghu/docs/design/cultivation-balance-20261012/martial-table.md` | 2 |  |
| `xiaojianghu/docs/design/cultivation-implementation.md` | 2 |  |
| `xiaojianghu/docs/design/cultivation-reference.md` | 1 |  |
| `xiaojianghu/docs/design/cultivation-rework-20261012/README.md` | 5 | 余 1 处，见下文 |
| `xiaojianghu/docs/design/cultivation-rework-20261012/dialogue.md` | 8 |  |
| `xiaojianghu/docs/design/cultivation.md` | 1 |  |
| `xiaojianghu/docs/design/delivery.md` | 1 |  |
| `xiaojianghu/docs/design/faction-attire.md` | 1 |  |
| `xiaojianghu/docs/design/fullflow-story-20261016/implementation-plan.md` | 1 |  |
| `xiaojianghu/docs/design/grades-and-skill-vfx.md` | 4 |  |
| `xiaojianghu/docs/design/hangao-city-spaces.md` | 4 | 余 1 处，见下文 |
| `xiaojianghu/docs/design/hangao-city.md` | 4 |  |
| `xiaojianghu/docs/design/hangao-story.md` | 3 |  |
| `xiaojianghu/docs/design/jianghu-icons.md` | 2 |  |
| `xiaojianghu/docs/design/manual-placement.md` | 3 |  |
| `xiaojianghu/docs/design/map-preflight.md` | 2 |  |
| `xiaojianghu/docs/design/map-size-review.md` | 2 |  |
| `xiaojianghu/docs/design/martial-review/lineage-v3-naming.md` | 1 |  |
| `xiaojianghu/docs/design/martial-review/martial-systems.md` | 1 |  |
| `xiaojianghu/docs/design/motion-oc11.md` | 1 |  |
| `xiaojianghu/docs/design/mountain-cultivation-curriculum.md` | 1 |  |
| `xiaojianghu/docs/design/mountain-cultivation-events.md` | 3 |  |
| `xiaojianghu/docs/design/opening-correction-20261004-oc4.md` | 1 |  |
| `xiaojianghu/docs/design/opening-pei-disguise.md` | 2 |  |
| `xiaojianghu/docs/design/opening-routes.md` | 4 |  |
| `xiaojianghu/docs/design/opening-state.md` | 8 |  |
| `xiaojianghu/docs/design/opening-three-representatives.md` | 1 |  |
| `xiaojianghu/docs/design/pei-zhigu-assets.md` | 1 |  |
| `xiaojianghu/docs/design/pre-xiangyang-story.md` | 3 |  |
| `xiaojianghu/docs/design/protagonist-sect.md` | 3 |  |
| `xiaojianghu/docs/design/qihe-hidden-rewards.md` | 3 |  |
| `xiaojianghu/docs/design/romance-stories.md` | 1 |  |
| `xiaojianghu/docs/design/scripts/hangao-main.md` | 3 |  |
| `xiaojianghu/docs/design/scripts/hangao-side.md` | 2 |  |
| `xiaojianghu/docs/design/secret-manuals.md` | 1 |  |
| `xiaojianghu/docs/design/shared-insight-pool.md` | 1 |  |
| `xiaojianghu/docs/design/story-atlas-audit.md` | 1 |  |
| `xiaojianghu/docs/design/story-decisions.md` | 4 |  |
| `xiaojianghu/docs/design/story-source-migration.md` | 3 |  |
| `xiaojianghu/docs/design/traits-20261013/README.md` | 1 |  |
| `xiaojianghu/docs/design/traits-20261013/implementation.md` | 1 |  |
| `xiaojianghu/docs/design/traits-20261013/numbers.md` | 1 |  |
| `xiaojianghu/docs/design/traits-20261013/routes.md` | 1 |  |
| `xiaojianghu/docs/design/voice-current-cast.md` | 2 |  |
| `xiaojianghu/docs/design/voice-runtime.md` | 1 |  |
| `xiaojianghu/docs/design/xiangyang-gathering-review.md` | 2 |  |
| `xiaojianghu/docs/design/xiangyang-icons-v3.md` | 7 |  |
| `xiaojianghu/docs/design/ye-routes.md` | 1 |  |
| `xiaojianghu/docs/rules/doc-status-proposal.md` | 16 | 余 26 处，见下文 |
| `xiaojianghu/docs/testing.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/README.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/architecture.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/art-pipeline.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/assets/README.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/assets/production-assets.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/audio.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/README.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/design/cultivation.md` | 3 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/README.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/cg-direction.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/README.md` | 12 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/battle-assets.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/chapter-presentation.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/cultivation-bgm.md` | 3 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/grade-balance.md` | 5 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/guiyun-household.md` | 3 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/implementation.md` | 13 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/inventory-ui-v3.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/jianghu-ui-v3.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/layout.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/martial-ui-v3.md` | 9 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/outsider-quests.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/party-ui-v3.md` | 3 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/resources.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/starter-equipment.md` | 7 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/story.md` | 11 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/training.md` | 17 | 余 1 处，见下文 |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/README.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/growth.md` | 2 | 余 1 处，见下文 |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/implementation.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/interaction-v7.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/martial-preview-v9.md` | 7 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/model-implementation.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/navigation.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/other-pages.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/quest-codex-refresh-20261010.md` | 4 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/quest-journal-v10.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/ultimate-v10.md` | 1 | 余 1 处，见下文 |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/hero-staff-combo.md` | 2 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/startup.md` | 6 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/three-representatives.md` | 3 |  |
| `xiaojianghu-legacy-prologue/docs/design/qihe-map/ye-needle-battle.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/design/runtime-entry.md` | 1 |  |
| `xiaojianghu-legacy-prologue/docs/testing.md` | 1 |  |

另：`hangao-city.md` 第 2 节标题改为“规模：开始部分村落的 3 倍”，`hangao-city-spaces.md` 两处锚点同步为 `#2-规模开始部分村落的-3-倍`；`bible/人物/陈伯.md`、`周婶.md` frontmatter“状态”同步改，`story-source-migration.md` 中的周婶示例同改。

## 没改的（共 52 处）及原因

| 类别 | 处数 | 位置 | 原因 |
| --- | --- | --- | --- |
| 用户原话引用 | 2 | `design/guiyun-household.md:3`（用户要求“第二章师门人物太少……”）、`design/hangao-city-spaces.md:115`（用户原定“第一章村落的 3 倍”） | 引号内是用户原话 |
| 引用其他作品 | 1 | `design/cultivation-rework-20261012/README.md:31` 链接文字“第二章情境记录” | 指《侠客风云传》攻略站页面 |
| 规则清单对旧标题／页首的原文引用与元说明 | 26 | `rules/doc-status-proposal.md` 第 19、39、55、64、74、440、461、465、466、470、474、475、478、639、689、766、773、774 行 | 引号内是被检查文档当时的原文，用来说明需改之处；本页状态为草稿。其中多处标题本次已改，清单里的【需改措辞】标记可由用户复核后更新（含 `doc-status-proposal.json`），本次未动 |
| 运行时界面原文引用 | 2 | `qihe-map/expansion/ui-flow/growth.md:29`（“第二章开启”）、`ui-flow/ultimate-v10.md:39`（V10“第一章”预览） | 引号内是界面／预览标签原文；8792 代码 `js/menu.js`、`js/jianghu-model.js`、`ui-flow/flows.json` 里仍写“第二章开放／开启”，属于代码不在本次范围 |
| 旧二十章编号（阿拉伯数字） | 19 | `martial-review/independent.md:62,84`、`martial-review/rules.md:29`、`martial-review/move-contracts.md:5522,5728`、`martial-review/balance/progression.md:18,19,59（2 处）`、`martial-review/balance/sim/tables-r6.md:17,19,20,21,54,56,57,58,75` | 见“拿不准”第 1 条 |
| 拿不准的旧说法 | 2 | `design/presentation.md:55`、`design/growth-combat.md:27` | 见“拿不准”第 2、3 条 |

## 拿不准的

1. **martial-review 下的“第9章～第19章”（19 处）**：这是 2026-10-02 旧“四篇二十章”的编号（游历篇＝第九至十四章、风云合流＝第十五至十七章、抉择篇＝第十八至二十章），用于武学获取时点和数值模拟锚点。现行框架没有给出旧第 9～19 章与“游历前段／中段／后段、终局”的对应表，尤其第 14 章“公共锚点”和第 15～17 章“风云合流”归游历后段还是终局无法确定，硬改会改动数值锚点含义。需用户或数值文档负责人确认映射后再改（例：第9章初到游历→游历前段？第10—13章地区模块→游历中段？）。
2. **`presentation.md:55`“旧第一章素材……‘苍龙身世’图像”**：可能指旧襄阳演示（现代装萧白、苍龙身世）而非栖河开始部分，无法从上下文确认，暂未改。
3. **`growth-combat.md:27` 旧“第一章终盘即全作结束”**：引号内是旧设计说法，多半指旧襄阳演示的结算，未确认，暂未改。
4. **`qihe-map/expansion/training.md:63` 打出“第一章 · 风起栖河结束”并存档**：引号内是章末字幕原文；8792 `js/` 里已搜不到这句，可能已改为别的字幕或改由 ink 生成，暂按界面原文保留未改，需确认现行字幕后再同步。
5. **8792 运行时文字**：`js/menu.js`“心法【第二章开放】”、`js/jianghu-model.js`“第二章开启”、`ui-flow/flows.json`“第一章显示第二章开启”，以及 xiaojianghu `js/ui.js` 顶栏“第一章 · 襄阳风云”仍是“第几章”。属于代码与界面文本，不在本次文档改写范围，若要统一需另行处理。
6. **`startup.md:18` 存档显示“序章、风起栖河段或培养部分”**：文档已改，但实际启动页标签文字未核对，可能仍显示“第一章／第二章”。

## 验证

- `python3 tools_docs/consistency_check.py`：通过，warn 0（four-parts-not-chapters 余 14 条 info，即上表未改项）。
- `node tools_story/build_ink.cjs`（8792）：pass，41 个剧本，errors 0、warnings 0。
- `python3 tools_docs/check_docs.py`：过时说法 0 处；死链 69 条（新增 0）；缺状态 9 份（只警告），无新增问题。
