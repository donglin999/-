# 2026-10-16 设定与剧情一致性检查

## 需求

用户要求做设定与剧情一致性检查（此前调研的现成技能都不适配中文文档结构，借鉴 fcsouza `quest-narrative-coherence` 的“登记表 + 冲突检测”思路自建，未复制其 GPL 原文）。

## 改动

- 新增 `tools_docs/consistency_check.py`（只读）：以 `docs/design/story-atlas.json` 为人物登记，扫描两个工作区的 `docs/` 与 `AGENTS.md`（跳过更新记录、归档、`_attic`），检查：
  - `age`：人物名后紧跟的年龄与登记不符；萧白“现代时 24 岁”按 10-09 决定放行；美术文档按同一决定降为提示。
  - `owner-age`：人物负责文档开头自述的年龄与登记不符（多人合写的负责文档跳过）。
  - `faction`：人物名后紧跟其他势力的“弟子／门下／掌门”等（“原／曾／前”除外）。
  - 规则表中的已确认规则。
- 新增 `docs/design/registry/consistency-rules.json`，四条规则均附出处：不分章只分四部分（companion-support.md，10-10）、无昼夜交替（hangao-systems.md 第 2 节，10-10）、萧白入谷后不再是白袍红腰带马尾（栖河 guiyun-household.md，10-07/08）、旧 gamemaker 用语“栖灯馆”须重新审定（ai-onboarding.md 第 3 节）。
- 新增项目技能 `luotuozhuan/.claude/skills/consistency-check/SKILL.md`（真冲突／阶段不同／历史豁免三分类、先改负责文档、需拍板的问用户）。
- `docs/ai-onboarding.md` 按任务必读表加一行。

## 本次查出并修正的冲突（共 10 处，均为执行已确认决定时的漏改）

| 文档 | 原文 | 改为 | 依据 |
| --- | --- | --- | --- |
| `design/companions/duan-mingtang.md:10` | 初见25岁 | 初见20岁 | story-decisions.md「2026-10-09 萧白年龄与女主年龄」：女主统一下调 5 岁 |
| `design/companions/pei-zhigu.md:11` | 25岁成年……三年末约28岁 | 20岁成年……三年末约23岁 | 同上 |
| `design/companions/qiao-xingzhou.md:10` | 初见27岁 | 初见22岁 | 同上 |
| `design/companions/ruan-qingque.md:9` | 24岁 | 19岁 | 同上 |
| `design/companions/su-zhi.md:10` | 初见27岁 | 初见22岁 | 同上 |
| `design/companions/tang-zhaoxue.md:10` | 初见23岁 | 初见18岁 | 同上 |
| `design/companions/yan-xiaolou.md:10` | 初见23岁 | 初见18岁 | 同上 |
| `design/README.md:220` | 裴知古 25岁 | 20岁 | 同上 |
| `design/hangao-shops.md:200` | 看戏（2 两，耗一个时段，…） | 看戏（2 两，…） | hangao-systems.md 第 2 节方案 A；hangao-side.md 已注明“耗一个时段”作废 |

## 未改、待用户决定

- “第几章”用语：191 个文件（规则为提示级；记忆约定批量改写旧文档须先问用户）。
- “栖灯馆”：15 个文件 18 处，需确认是否已按文档库重新审定。
- 美术文档中的旧年龄（如 `cultivation-q-generation-standard.md`、`jianghu-portraits.md` 的“萧白 24 岁”）：10-09 决定写明不改，保留为提示。

## 验证

- 检查脚本修正后“需处理”为 0（年龄 12 条、规则若干均为提示级）。
- `tests/document-library.test.py`：OK。
- `tools_story/build_atlas.py` 重新生成书阁人物图谱（同步了已修正的同伴文档文本），自动核对 19 项全部通过；另 9 项叙事审阅为“已核对”、3 项范围说明为“待细化”，与此前一致。该脚本会重写 cast-visuals.md、faction-styles.md、cast-timeline.md、ambient-npc-design.md、story-atlas-audit.md/json 与 review/story-atlas/data.js，内容均由未改动的 story-atlas.json 生成。

## 状态

本地完成；未提交；未发布。
