# 2026-10-08 战斗规则接入：弱点 v2、削盾、破势 1.5、异常状态、伤害数字、头目久战、防御强化

## 需求

把已定稿的战斗规则接入 `xiaojianghu` 运行战斗：弱点类型改为“兵器类 + 属性”，每段削盾（每次行动每目标上限 6），破势倍率 1.5 且恢复回合先手，统一异常表与九种异常，伤害数字按规范着色定号，头目第 10 回合起久战发狠，防御强化招式随“防御”自动生效。

## 核对过的文档

- `docs/design/weakness-system.md`、`docs/design/status-effects.md`、`docs/design/damage-numbers.md`
- `docs/design/martial-review/balance/formula.md` 末尾“2026-10-08 模拟后用户确认的取舍”
- `docs/design/martial-structure.md`（防御强化）、`docs/battle.md`
- 招式数据：`docs/design/martial-review/catalog.json`、`lineage-v3-moves.json`；模拟敌人卡 `balance/sim/enemies.json`；模拟器 `tools_balance/combat_sim.cjs`（异常结算顺序与之对齐）

## 改动

- `js/battle.js`：新类型表 `WTYPES/WCOL/KIND_CLASS/normWeak/hitTypes`；内联招式表 `MOVE_RULES`（由两份目录 JSON 一次性导出）与别名 `jinzhen→bh_s1`；`ST_DEF` 与 `BattleRules`（成功率、免疫、施加、回合开始/行动后结算、解除、久战、防御强化、伤害数字样式）；`legacyAilProps` 让 `u.stun/u.bleedN` 映射到异常表；改写 `mkFoe`（弱点换算、`rank`、`inflict`）、`calcOrder`、`battleLoop`、`tickBuffs`、`planIntent`、`intentLabel`、`foeAct`、`doAttack`、`doSkill`、`strike`、`estDmg`、`hitsWeak`、`skillPv`、`hurt`、`heal`、`floatTxt`；新增 `dotHurt`、`foeHitDmg`、`guardCounter`、`foeConfusedHit`、`strikeSkill`、`floatDmg`、`floatHeal`、`castable`、`skillTags`。敌人卡 `FOE_DEF` 改为新类型并各配一种异常。
- `js/bfx.js`：同步覆盖版 `hurt/heal/doAttack/doSkill/foeAct`，共用 battle.js 的规则函数。
- `js/bui.js`：新类型字徽、`tyTag` 自动换算、我方卡片与敌人脚下的异常印、意图“晕”“狠”字徽、目标说明列出异常；武学菜单接入封穴/惊惧/内伤/防御强化；`drawFloats` 新增 `buiNum`（属性色、弱、会心、破势裂痕、多段上移、持续伤害圆点）与标签浮字。
- `js/battle-auto.js`：自动战斗遵守封穴、惊惧、防御强化与内伤耗内。
- `js/menu.js`、`js/martial-structure.js`：内力回复浮字改“+N 内”；清秽改用异常表。
- `js/quests.js`：山贼看破提示改为新类型名（拳掌、长兵）。
- `index.html`、`village-4k-trial.html`：上述脚本版本号改为 `20261008-battle-v4`。
- 文档：`docs/battle.md` 第 2–4、6 节；两份规则文档的状态行。
- 测试：新增 `tests/battle-weakness-status.test.cjs`（10 项）。

## 验证

- `node --check`：battle.js、bfx.js、bui.js、battle-auto.js、menu.js、martial-structure.js、quests.js 均通过。
- 改动前后：`node --test tests/battle-auto.test.cjs tests/cultivation-jianghu-modern.test.cjs tests/cultivation-formal-martial.test.cjs tests/martial-lineage-v3.test.cjs tests/combat-sim.test.cjs` 33/33 → 33/33；`node tests/battle-error-regression.cjs` 通过 → 通过；新测试 10/10。
- 另跑：opening-battle-stage 6/6、prologue-story-battle 13/13、prologue-teaching-integration 5/5、opening-asset-registration 1/1（与改动前相同）；`tests/xiangyang-combat-balance.cjs` 与 `BATTLE_AUTO=1` 版胜负格局与改动前一致（start/chief 改动前后都是 0/5），回合数小幅变化。
- 本地服务 `http://127.0.0.1:8149/index.html?runtimePrototype=1#street` 无头冒烟（tools_fx/bt_smoke.cjs 改端口与 playwright 路径的副本）：bandits、break、boss 三个场景 `errors: []`（break 场景另有一条既有的 `[VFX 等级自检] inner_* 缺少 FXDEF` 警告，与本次无关）；另跑一场强制挂异常的头目战，截图确认异常印、持续伤害数字、“久战将至/狠”预告与第 10 回合 +20%。函数测试与无头截图不等于人工浏览器验收。

## 未完成

- 头目“半血立即多行动一次”改为“提前一回合预告的阶段转换”、按阶段的护盾表：本次未要求，未改。
- 招式合同的 `shield_cap`、`extra_shield_damage`：运行中目录招式只有单段的 gy_s1、gy_p1，未接；只做了每次行动 6 盾的总上限。
- 运行中没有 `usage=defend_enhance` 的招式，防御强化只在测试与临时登记的冒烟里验证过。
- 伤害数字“同时超过 6 条时合并持续伤害与内力回复”未做。

## 状态

本地完成；未提交 Git；未发布。
