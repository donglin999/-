# 2026-10-08 功法传承 v3 招式进入运行战斗；战斗遗留四项

## 需求

1. 让功法传承 v3 的门派招式成为运行战斗可用技能：生成脚本、`SKILLS`／`BSK` 登记、`FXDEF` 档位、旧新招式对应与存档兼容、`syncArts` 按重数开启后战斗菜单可选，弱点／异常／破势／绝招锁定／防御强化对新招式生效。
2. 战斗遗留项：头目半血改为预告二阶段；每招削盾上限 `shield_cap`；浮字超过 6 条时合并；巨蟒为精英。

工作区：`xiaojianghu`（本目录历史原型，`?runtimePrototype=1`），不涉及 8792 栖河试玩版。

## 核对过的文档

- `docs/ai-onboarding.md`、`docs/design/martial-structure.md`（防御强化用户确认名单）、`docs/design/martial-lineage.md`、`docs/design/martial-review/move-contracts.md`、`audit.md`（旧招式迁移意见）
- 数据：`docs/design/martial-review/catalog.json`、`lineage-v3-moves.json`、`martial-systems.json`
- `docs/design/weakness-system.md`、`docs/design/damage-numbers.md` §4、`docs/design/martial-review/balance/formula.md`（头目阶段“保持本轮预算再分摊”）
- 代码：`js/battle.js`（`MOVE_RULES`、`BattleRules`）、`js/bfx.js`（实际生效的 `doSkill`）、`js/bui.js`、`js/battle-auto.js`、`js/vfx.js`、`js/martial-structure.js`、`js/martial-manuals.js`、`js/cultivation.js`、`js/story.js`（`mk('snake')`）

## 改动

- 新增 `tools_docs/build_runtime_moves.py`（生成链最后一步）→ 生成 `js/martial-moves-runtime.js`：登记 52 门门派功法的 **81 招**；人物技能组 22 招暂缓不登记；`SKILLS`／`BSK`／`FXDEF` 已有同 id 时不覆盖。
- `index.html`：在 `martial-structure.js` 之前加载 `js/martial-moves-runtime.js`；`battle.js`、`bfx.js`、`bui.js`、`battle-auto.js`、`vfx.js` 版本号改为 `20261008-runtime-moves`（`village-4k-trial.html` 同步这五个）。
- `js/battle.js`：
  - `BattleRules` 新增 v3 结算：`plan`（按 BP 档取总威力／段数／削盾上限／治疗倍率）、`moveWhy`／`markUsed`／`cdTick`（冷却、绝招调息、绝招需 3BP）、`condOk`／`segMul`／`segOpt`（条件加成、末段加成、附加削盾）、`healAmt`（v3 单次封顶 35%）、`applyEf`（卸力、援护、守势、转赠蓄势、濒危保护、解除、前移、护心、暴露、削弱下一击等）、`coverOf`、`guardDeath`。
  - `strike`：支持 `share`（总威力按段均分）、`cap`（本招削盾上限）、`mul`、`xs`（附加削盾）、目标暴露、同伴增伤标记；`estDmg`／`skillPv` 同公式。
  - `doSkill`、`hurt`、`foeHitDmg`、`foeAct`、`tickBuffs`、`battleLoop` 接入上述规则；`tryApply` 支持护心／免疫一次迟滞。
  - `MOVE_ALIAS` 新增 `huichun→bh_s2`；`castable` 在同时会旧招与对应 v3 招时只列 v3 招。
  - 遗留 a：头目半血 → `phaseCheck` 横幅“下回合起进入二阶段”并写进意图；下回合 `phaseTick` 进入二阶段（护盾 +2、换一项弱点），之后每回合多行动一次，每次 ×0.6；与久战发狠并存。原“半血立即加一次未预告行动”删除。
  - 遗留 c：`mergeFloat`，`dotHurt` 与 `mpFloat` 在存活浮字已达 6 条时并入一条“持续 −N · 内 +M”。
  - 核对 `MOVE_RULES` 与两份目录：除回灰护影外全部一致（见“未完成”）。
- `js/bfx.js`：覆盖版 `doSkill` 同规则改写（辅助招走施法演出）；`hurt` 接濒危保护；`foeAct` 接援护改向。
- `js/bui.js`：武学菜单显示并禁用“冷却剩余 N 次行动／绝招调息中／需 3 点蓄势”，说明附绝招与冷却；选绝招自动投入 3BP；目标说明行显示【精英】【头目】；合并浮字按标签绘制。
- `js/battle-auto.js`：跳过冷却／调息中招式和被别名隐藏的旧招，辅助招不参与伤害评分，v3 治疗按合同倍率估算。
- `js/vfx.js`：静心诀 T1→T2（内力 10，满足单调自检）；自检前按内力为内功主动 `inner_*` 补档（`fxFillInner`），原先“inner_* 缺少 FXDEF”告警消除；v3 招式档位由运行招式表补入。
- 遗留 b：v3 招式按 `BSK.bp[档][2]` 应用 `shield_cap`（此前只有 gy_s1／gy_p1 名义上有）。
- 遗留 d：核对结果——`mk('snake')` 精灵键 `snake` 取 `FOE_DEF.snake`，运行中已是 `rank:'elite'`（异常抗性 15%、控制后同类免疫）；本次补测试与【精英】显示，未改敌人数据。
- 文档：新增负责文档 `docs/design/runtime-moves.md`（字段映射、结算、效果实装表、旧新对应与存档兼容）；`docs/design/README.md` 登记；`weakness-system.md`（状态行、头目阶段、削盾上限、精英巨蟒标“已实装”）、`damage-numbers.md` §4 标“已实装”；`docs/battle.md` 第 1、3–6、8 节同步现行实现。
- 测试：新增 `tests/runtime-moves.test.cjs`（11 项）。

## 旧新招式对应

| 旧 id | v3 | 处理 |
| --- | --- | --- |
| `jinzhen` 金针刺穴 | `bh_s1` | `MOVE_ALIAS`（已有）；数值保留旧条目 |
| `huichun` 回春散 | `bh_s2` | `MOVE_ALIAS`（新增）；治疗保留旧 0.38 |
| `fist` 粗浅拳脚 | `gy_p1` | 目录旧名；不别名，`fist` 仍为基础拳脚 |
| `baicao`、`dingshen` | （`bh_s4`、`yh_m2`） | 按审计意见不别名 |
| 江湖散学六招、`jingxin`、大黄与敌方招式 | — | 无对应 |

存档兼容：旧 id 的条目与存档里的重数不删不改，可照常使用；同时拥有旧招与 v3 对应招时菜单只列 v3 招；重数不自动迁移。

## 验证

- `node --check`：battle.js、bfx.js、bui.js、battle-auto.js、vfx.js、martial-moves-runtime.js 通过。
- `node --test tests/runtime-moves.test.cjs tests/battle-weakness-status.test.cjs tests/battle-auto.test.cjs tests/combat-sim.test.cjs tests/martial-lineage-v3.test.cjs tests/martial-manuals.test.cjs tests/cultivation-jianghu-modern.test.cjs`：49/49 通过（中途一次 `martial-manuals` 的“秘籍投放来源”用例因另一项进行中的工作改了 `manual-placement.json` 而失败，与本次无关；最终复跑通过）。
- `node tests/battle-error-regression.cjs`：通过。
- 另跑：`cultivation-formal-martial`、`opening-battle-stage`、`prologue-story-battle` 31/31；`tests/xiangyang-combat-balance.cjs` 胜负格局与上次记录一致（start/chief 仍 0/5）。
- 浏览器（预览服务 8149，`index.html?runtimePrototype=1#street`）：`RuntimeMoves.registered` 81、`kept` []，`VFX.audit()` 返回 []；开战 `battle({bg:'bg_street',foes:[mk('bandit'),mk('bandit'),mk('wolf')]})` 后控制台 `doSkill` 试放：单体拨云回锋 2BP（野狼盾 2→0 破势）、群体松涛合阵、治疗回春散、群疗百草回生、防御强化敛云守锋（卸力 40%、守势、下一击 +30%）、绝招云开见山（2BP 返回 false 不耗内力；3BP 4 段破盾 3、随后“绝招调息中”）；再从武学菜单选云开见山，自动投入 3BP、目标说明“预计 54 ×4 弱点！”，确认后正常施放并由 v4 编排接管特效；下一回合菜单显示“绝招调息中”置灰。页面脚本错误为 0；控制台唯一错误是另一项工作的 `assets/fx/v4_b2/manifest.json` 404。头目场景：首领跌破半血后横幅“下回合起进入二阶段”、意图栏出现预告。截图已人工核对；函数测试与控制台试放不等于人工浏览器验收。

## 未完成与已知问题

- `lineage-v3-moves.json` 中回灰护影 `usage=active`，与 `martial-structure.md` 用户确认的防御强化名单不一致；运行按确认名单处理，数据侧待修正后重跑生成链。
- 治疗系数按 ×0.30 折算为目标最大气血比例，合同“医疗基数（悟性、最大内力）”未接（原型战斗单位不带五维），待平衡确认。
- 未实装：施者降速（合川撑岳、担山护众）、延后敌方行动（断渡擒锋）、“本轮同伴主动护卫”“本轮援护实际承伤”两类条件；“两名选中同伴”的招式只作用于一名。
- 人物技能组 22 招暂缓；`yh_s0` 在 `MOVE_RULES` 有 `ct:'low'` 而目录无，留待人物技能设计时一并核对。
- 武学菜单超过 8 行时，最后几行被“智能自动战斗”按钮遮住（既有布局问题）。
- 浏览器面板与其他代理共用：头目场景的控制台检查跑在其他代理也在用的标签页里，开了一场未结束的测试战斗，重新载入该页即可清除。

## 状态

本地完成；未提交 Git；未发布。
