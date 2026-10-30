# 按模块整改：其余十个模块

状态：历史　最后核对：2026-10-27

## 需求

用户：“完成所有我再去评审”。接[偷窃小游戏、新素材融入场景](2026-10-27-rectify-steal-props.md)之后，把评审台其余模块做完，要用户定的事按 R-评审-01 每个模块只出一道题、附图表或剧本原文。

## 各模块

| 模块 | 做了什么 | 主要文件 |
| --- | --- | --- |
| 能偷谁与后续剧情 | 七人去掉不可偷（周婶风灯标为任务剧情物）；培养阶段可选剧情加好感底线：牵涉的人在开始部分已敌对就不触发，日历必看剧情不受影响；补阿栓失手一句 | `js/qihe-npc-data.js`、`js/qh-mode-cultivation-core.js`（`grudge`）、`tests/cultivation-grudge.test.cjs`、`story/01-开始/人物-失手.ink`、偷窃稿第 7、8.4 节 |
| 算命先生与吉兆 | 删吉兆三种 10% 加成与状态，测字只记一句吉利话 | `js/qihe-lamp-watcher.js`、`js/qihe-gift.js`、`js/qihe-npc-core.js`、`tools_scene/qihe/verify_lamp.cjs`、地图可交互物稿 5.5 等三份 |
| 门派关系页 | 货郎、小耗子折进栖河村；地图右上纸签＋人物头顶小签（渲染图 02，第七轮已确认未接）；门派厌恶以下灰印可点，门人说一句（新剧本四句）；关系稿第 13 节标已答 | `js/qihe-jianghu-slips.js`（新）、`js/qihe-jianghu-rep.js`、`js/qihe-jianghu-data.js`、`js/qihe-npc-core.js`、`js/qihe-npc-ui.js`、`story/01-开始/人物-门派不睦.ink`（新） |
| 查看页 | 撤下 9 张过场人物半身像；无立绘两方案（取景／名帖）待选；接上门派一栏（渲染图 03） | `js/qihe-npc-ui.js`、`js/qihe-npc-ui.css`、`js/qihe-npc-data.js` |
| 新物品图标 | 53 件物品都有图标；枯枝、野草药、芦苇补手绘图标，图集换 `i_qh_items_v2_20261027`，去掉行囊、赠礼里的像素图特例 | `art_sources/qihe-icons-props-20261027/`、`js/qihe-jianghu-ui.js`、`js/qihe-gift-ui.js` |
| 交互地点战斗背景 | 9 张氛围版新背景（村心、东埠、南村口、后山采药路、接应院、山居、客栈大堂、药棚、陈伯门厅），西田埂共用练场；按所在地图自动取 | `art_sources/qihe-battle-bg-20261027/`、`js/bstage.js` |
| 以物易物与商店 | “文”统一成“两”；羊肉笼饼、金疮药按命名规范改名；宋先生偷窃按真实等级 72 算（1%） | `js/qihe-town.js`、`js/qihe-steal-ui.js`、`js/core.js`、`js/qihe-npc-data.js` |
| 蔺管事支线 | 结局 3 CG 两种构图草图 | `art_sources/qihe-lin-cg-sketch-20261027/` |
| 新上图人物 | 六人送礼喜好、收礼台词各 7 句，货郎易物 8 句（新剧本，已批准剧本不动，运行时先查原剧本）；修赠礼面板两层遮罩叠字 | `story/01-开始/人物-收礼与易物-补.ink`（新）、`js/qihe-gift.js`、`js/qihe-gift-ui.js` |
| 隐藏奇遇 | 设计稿四个待拍板问题未答，未开发；列表送审 | — |

新工具：`tools_scene/qihe/shot_js.cjs`（到某地执行一段脚本后截图）；`shot_steal.cjs` 可只截指定人物的物品扇。

## 评审台

- 第二十三轮 8 道题（查看页方案、CG 构图、新人物剧情、算命剧本、门派台词、商店价钱、隐藏奇遇、蔺管事走向），每题一个模块；各模块整改各一条，都附实机图。
- `check_review_batch.py` 全台自查通过；浏览器核对图片显示正常。

## 验证

- 新增与改动相关：`tests/cultivation-grudge.test.cjs`、`qihe-npc-bag-v2`、`qihe-jianghu-rep`、`qihe-steal-*` 通过；`verify_lamp`、`verify_town`、`verify_expansion`、`verify_resources`、`verify_steal_real`、`verify_prologue`、`verify_jianghu_ui` 通过。全量非浏览器测试 70 项：通过 51，失败 19，失败的都在 `2026-10-27-dev.md` 记录的“上次提交时就失败”名单里（character-grounding、cultivation-*、dou-sword-combat、guiyun-performance*、menu-icons、toast、verify_battle、verify_chapter_battle_art、verify_faction_contacts、verify_grade_balance、verify_menu_fix、verify_relationships、verify_representatives、verify_stranger）。中途 `verify_steal_real` 因头顶小签在无浏览器环境读样式报错，已改成提示出错不影响结算，复测通过。
- 剧本构建 pass（61 份，已批准 49 份未动）；`check_production.py` pass。

## 未完成

- 要用户定的八件事（见评审台第二十三轮）。
- 小耗子三处回扣落在培养、游历、终局的场次，场次未开发。
- 对证散场三句回扣只是草稿，未改已批准剧本。
- 未发布、未提交。
