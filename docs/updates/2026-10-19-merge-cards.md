# 2026-10-19 行为卡并入设定圣经、闲逛规则搬入培养路线页

状态：现行　最后核对：2026-10-19

用户 2026-10-19 同意两件“并入”：人物行为卡并入 `bible/人物/`；闲逛评审里仍被当规则依据的两节搬进[培养路线](../design/cultivation-routes.md)。然后把两份原稿归档。本次只搬运与删减、不新写设定（R-剧情-05），不说“第几章”（R-剧情-02），不删除只归档（R-清理-01），不提交 git（R-git-01）；`rules.json`、`rules.lock`、`bible/定稿事实.md` 未动。

改动前的原文都备份在 `_attic/2026-10-19-merge-cards/`（保持相对路径），附 `manifest.json` 与 `restore.sh`，可一键还原。

## 一、行为卡并入 bible 人物页

原稿 [pre-xiangyang-character-arcs.md](../archive/design/pre-xiangyang-character-arcs.md) 第 2～7 节，并入各人物页正文新一节“行为卡（2026-10-19 由 pre-xiangyang-character-arcs 并入）”。frontmatter 一律未动。原稿的“第 N 月”改写为“培养第一年 N 月”。具体剧情事件写成“例：……（旧稿场景，剧情待重新设计）”。

| 人物页 | 并入内容 | 删去的作废内容 |
| --- | --- | --- |
| [萧白](../../bible/人物/萧白.md) | 性格展开段；日常辨识；弱点场面（例：第一次指导）；关系受挫（例：补写药签）；改变证据（例：护送途中报脚滑）；4 月前后能说清已学与需帮助处；对白方向；关系表三行（萧白—叶蘅／周砚／陆衡） | “准备以归云谷弟子身份见外人”“全休养玩家仍能赴汉皋，由师友协助”（汉皋剧情，F-0050） |
| [叶蘅](../../bible/人物/叶蘅.md) | “怕亲近的人一去不返”与性格展开段；日常辨识；弱点场面；自主行动（例：请教当地医者）；改变证据（例：回谷清单）；边界（遗物不交人暂管、不提前定白鹇谷去向）；写法（不自动恋爱等）；关系表三行（萧白—叶蘅、叶蘅—周砚、叶蘅—乡邻） | “遗物不作拜寿礼”（旧襄阳寿宴剧情，F-0049）；“进城后的学习机会随城内剧情待重新设计”（汉皋城内剧情，F-0050） |
| [周砚](../../bible/人物/周砚.md) | 性格展开段与“承诺与谷中职责限制行程”；日常辨识；弱点场面（例）；自主行动；改变证据（摊开可核验事项与风险、听二人是否愿去；例：护送复盘）；4 月前后允许弟子有限承诺；写法限制（不新增丧徒、隐罪、暗伤）；关系表两行 | “收到汉皋邀请”（汉皋剧情，F-0050），只留下处事方式并注明原例子已作废 |
| [陆衡](../../bible/人物/陆衡.md) | 守诺与收入、不常驻谷不提前入队、性格展开段；日常辨识；弱点场面（例：2 月多托一件事）；自主行动；改变证据（例：首季护送前说清分工）；边界（不能整月做私人跟班、招募条件留正式合同）；关系表一行 | “通过来信明确自己在汉皋有护运事务”（汉皋剧情，F-0050；F-0052 远山镖局不受影响） |
| [周婶](../../bible/人物/周婶.md) | 原稿第 6 节与陈伯合写：留邻村不搬进谷、协调照应与医者交接、可谢绝不合用物资；来信要具体（例：划掉一项需求）；不因主角没点支线就无人照料；关系表“叶蘅—乡邻” | 无 |
| [陈伯](../../bible/人物/陈伯.md) | 同上合写段；按实际伤势休养、指导或做轻活；例：关于木架的批评；关系表“叶蘅—乡邻” | 无 |

原稿第 1 节（阶段共同问题）、第 8 节（推进方法）属写作流程，不是人物本身，未并入，留在归档页。各人物“已定基础”段（年龄、拜师时间等）已由 `cast.md` 与 bible 页首覆盖，未重复并入。

## 二、闲逛规则两节搬入培养路线页

[jianghu-stroll-review.md](../archive/design/jianghu-stroll-review.md) 的两节搬入 [cultivation-routes.md](../design/cultivation-routes.md) 作为新小节，标题不变，节首注明来源：

- [三条路线如何遇见同一批人](../design/cultivation-routes.md#三条路线如何遇见同一批人)：原样搬入。
- [触发与不卡关约定](../design/cultivation-routes.md#触发与不卡关约定)：删去“汉皋城（原写襄阳）”里的“（原写襄阳）”；“不要求‘先聊寿宴所有 NPC’解锁养成”删去寿宴（旧襄阳剧情），改为“不要求聊遍所有 NPC 才解锁养成”。

三处引用改指新位置：`hangao-systems.md`（势力声望）、`world-map-layout.md`（公共支线）改指对应锚点；`cultivation-routes.md` 原来那句“现有群像与三年闲逛提案……章表仍维持其待评审状态”改为说明已归档、两节已搬入本页，并删去“章表”。

## 三、归档与改链

| 原位置 | 新位置 |
| --- | --- |
| `docs/design/pre-xiangyang-character-arcs.md` | [docs/archive/design/pre-xiangyang-character-arcs.md](../archive/design/pre-xiangyang-character-arcs.md) |
| `docs/design/jianghu-stroll-review.md` | [docs/archive/design/jianghu-stroll-review.md](../archive/design/jianghu-stroll-review.md) |

两页页首改为“状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）”，加一行去向说明，页内相对链接按新目录重算。

指向它们的 markdown 链接已改到新位置：`docs/design/README.md`（2 处）、`cast.md`、`timeline.md`、`mountain-cultivation-events.md`、`mountain-cultivation-curriculum.md`、`guiyun-household.md`（链接文字补“已归档，行为卡已并入 bible/人物/”）、`docs/archive/design/pre-xiangyang-story.md`、`xiangyang-gathering-review.md`、`pre-xiangyang-training.md`；`docs/design/archive/story-framework-before-20261016/` 下三页原本就是死链（指向同目录不存在的文件），顺手改到归档位置。

未改的提及：`docs/updates/` 旧记录和 `xiaojianghu-legacy-prologue/docs/updates/2026-10-09-age-17.md` 只用反引号写文件名、不是链接，作历史记录保留；`docs/archive/rules/doc-status-proposal.*` 是历史提案；`tools_docs/wiki-sections.json` 按文件名登记（同类已归档的 `xiangyang-gathering-review` 也留在表里）；`review/story-atlas/data.js` 与 art_sources 下的生图日志不是文档链接。

## 四、与定稿事实对照

没有与锁定条目直接相反的内容；删去的都是 F-0049（襄阳旧剧情作废）、F-0050（汉皋剧情作废）范围内的事件。以下几处没有改，列出待确认：

1. 萧白“现代时 24 岁的程序员，穿越后身体回到 17 岁”在 `cast.md` 里，`定稿事实` F-0001 和 bible 萧白页只写“17 岁、从现代穿越”。不矛盾，但 bible 里缺这条；本次属于“已定基础”，没有并入。
2. 陈伯的例子写“一句关于木架的批评既表现职业”，bible 和定稿事实都没定陈伯的职业。按旧稿原样留作例子，职业待定。
3. 搬入的“触发与不卡关约定”写“按 6 点方案规划”，同页“共用规则”写每个自由时段 12 点体力。只搬不改，数值以哪边为准待确认。

## 五、检查

- `tools_docs/check_docs.py`：通过（过时说法 0、死链新增 0、缺状态 0）。
- `tools_docs/consistency_check.py`：0 条警告，提示项都不涉及本次改动的文件。
- `xiaojianghu-legacy-prologue/tools_story/build_ink.cjs`：pass（41 个剧本，0 错误 0 警告）。
