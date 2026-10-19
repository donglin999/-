# 功法传承 v3 招式进入运行战斗

状态：现行　最后核对：2026-10-19（原记：**现行实现（2026-10-08，本目录历史原型 `?runtimePrototype=1`）**。本页是“v3 招式在运行战斗里怎么登记、怎么结算、旧招式怎么兼容”的负责文档。招式数值以 [64 项招式合同](martial-review/move-contracts.md)、`catalog.json`、`lineage-v3-moves.json` 为准；功法结构见 [功法结构规范](martial-structure.md)，传承与重数开启见 [门派功法传承](martial-lineage.md)；战斗现行公式见 [battle.md](../battle.md)。本页不改设计，只记录接入方式与折算。）

## 1. 范围与数据流

- 登记 **52 门门派功法的 81 招**（`martial-systems.json` 中 `kind=external_art` 的全部 `skill_ids`）。2026-10-11 [攻击招式扩充 v1](martial-review/attack-expansion-v1.md) 后为 **110 门外功的 178 招**（门派第二路 48 招、江湖散学 49 招）。
- **人物技能组 22 招暂缓**（`character_skill_group`：叶蘅照护／针／医，晏小楼、乔行舟、柳含烟、秦绯鸢、阮青雀、陆衡、侯展川），运行时不登记，列在 `RuntimeMoves.paused`。
- 生成：`python3 tools_docs/build_runtime_moves.py` → `js/martial-moves-runtime.js`。它接在生成链最后：
  `complete_martial_moves_v3 → build_martial_lineage_v3 → build_elements → build_status → build_equipment_mods → build_hearts_numbers → build_skill_docs → build_martial_library → build_runtime_moves`。改了链上任何一步都要按顺序重跑到底。
- 加载：`index.html` 中位于 `battle.js`、`vfx.js` 之后、`martial-structure.js` 之前。**只补缺**：`SKILLS`／`BSK`／`FXDEF` 已有同 id 时一律不覆盖（养成开始时写入的 `gy_s1`、`gy_p1` 仍由 `cultivation.js` 覆盖为课程数值，二者一致）。
- 弱点类型与异常不在本表：仍由 `js/battle.js` 的 `MOVE_RULES`（目录一次性导出）给出，测试逐招核对与目录一致。**例外**：扩充 v1 的 97 招不在内联表里，由本表每招的 `r` 字段（`[兵器类, 属性, {st, ult}]`，格式同内联表）在加载时补进 `MOVE_RULES`，已有条目不覆盖。
- 2026-10-11 起生成链在 `build_status` 之后多一步 `build_attack_expansion.py text`（写扩充招式的描述与四拍分镜）；全链跑完后再跑 `build_runtime_hearts`、`build_manual_placement`、`tools_fx/build_vfx_kit_specs.py`、`build_attack_expansion.py doc`。

## 2. 字段映射

### 2.1 SKILLS

| 字段 | 来源 |
| --- | --- |
| `name`、`grade`、`mp`、`maxLevel` | 合同 `name`、`grade`、`combat.mp`、`combat.max_level` |
| `kind` | 兵器：剑、拳、刀、棍、暗器、琴、笛；医具→医，通用→身 |
| `pow` | 第一个可用 BP 档的总威力（绝招为 3BP 档）；只供旧界面显示，结算读 `BSK.bp` |
| `heal` | `heal_coefficient × 0.30`，单次封顶 0.35（目标最大气血比例；见 2.3） |
| `needWeapon`（徒手招不设：扩充 v1 的六脉剑气、寒魄符、雷音吼、飞石破空，名单在 `attack_expansion_data.py` 的 `FREE_HAND`） | 伤害招按 `weak_class` 设置：剑→剑、刀→刀、长兵→长兵、暗器→暗器、音律→音律；拳掌与无类不设。运行时由 `weaponFits` 按兵器类比较（伞/棍/篙都算长兵，扇/针都算暗器，琴/笛都算音律，短刀/锤都算刀；只限主角）。2026-10-08 武器运行时起，见 [更新记录](../updates/2026-10-08-weapons-runtime.md) |
| `desc`／`descV4` | 战斗提示用短文案 `effect_v3`；完整文案 `desc_v4` |

### 2.2 BSK

| 字段 | 含义 |
| --- | --- |
| `v3:1` | 走 v3 结算（`BattleRules.plan`） |
| `t`、`e` | 兵刃（进兵刃造诣、特效）与属性 |
| `tgt` | `all_foes→foes`、`all_allies→allies`、`self→self`；`specified`：有威力→`foe`，治疗或援护／转赠／濒危保护／条件含 ally→`ally`，防御强化与其余→`self` |
| `hits`、`reveal` | 基础段数（>1 时）、看破数 |
| `bp` | 4 档 `[总威力, 段数, 削盾上限, 治疗倍率]`；不可用档为 `null`（绝招只有 3BP 档） |
| `w` | 不均分的 `hit_weights` |
| `ult`、`cd` | 绝招调息（下一次自身行动不能用任何绝级）、冷却（随后 N 次自身行动） |
| `def`／`sup` | 防御强化（不进武学菜单，随“防御”附带）／无伤害无治疗的辅助招 |
| `ef` | 每档附带效果 `[type, value, condition]`（异常、看破、治疗系数除外） |
| `lv` | 每重加成（`mastery_per_level`，0.04） |

防御强化名单以 [功法结构规范](martial-structure.md) 用户确认为准：回岚步、松间错步、敛云守锋、逆流截江、**回灰护影**。`lineage-v3-moves.json` 里回灰护影仍写 `usage=active`，生成脚本按确认名单处理，数据侧待修正。

### 2.3 结算（`js/battle.js` 与覆盖版 `js/bfx.js` 的 `doSkill` 同规则）

- 出手方案 `BattleRules.plan(u,k,bp)`：总威力 × 重数加成 `1+0.04·(重数−1)`；**总威力按段均分**（`strike` 的 `share`；防御减免每次行动只算一次再均分）。
- 削盾：本档 `shield_cap` 作为本次行动对每个目标的上限（仍不超过 6）；`extra_shield_damage` 在命中弱点时附加一次，同受上限。
- 条件加成（`segMul`）：已看破目标、上次主动防御、目标已破势、消耗守势、末段加成、按已看破种类的末段加成（最多 5 种）。
- 治疗：`目标最大气血 × heal × 重数 × 治疗倍率`，单次不超过 35%。合同的“医疗基数 12+4×悟性+0.1×最大内力”需要运行单位携带五维，原型战斗单位没有，暂按 ×0.30 折算（回春散 1.15 → 0.345，旧回春散 0.38），**待平衡确认**。
- 绝招：未投 3BP 时 `doSkill` 直接返回 `false`，不耗内力；菜单选中绝招时自动投入 3BP；`BattleRules.moveWhy` 给出“需 3 点蓄势”“绝招调息中”“冷却剩余 N 次行动”，菜单置灰、自动战斗跳过。
- 冷却计数：施放时记 N+1，每次自身行动机会结束（`tickBuffs`，含被眩晕跳过的）−1。

### 2.4 附带效果实装情况

| 效果 | 运行处理 |
| --- | --- |
| `unload`、`physical_unload` | 受益人 `guard.unload`（下一次受击卸力，至其下次行动） |
| `counter_power` | 施者反击（防御强化走 `defendApply`） |
| `guard_token`、`next_attack_bonus`、`team_attack_bonus` | 守势一枚、下一击增伤 |
| `intercept` | 受益人 `cover=施者`：下一次单体攻击改打施者，施者受伤 ×0.7 |
| `bp_transfer` | 给另一名同伴蓄势（不能给自己） |
| `death_prevention` | 致命伤留 1 点，每名受益者每战一次 |
| `cleanse*` | 按 `MOVE_RULES.ct` 或具体异常解除；暴露清零 |
| `order_shift` | 受益人下回合 `prio`（排序 +100，与防御同） |
| `slow_immunity`、`status_guard` | 抵御下一次迟滞／下一次异常 |
| `self_exposure`、`target_exposure` | 下一次受击 +N% |
| `next_enemy_attack_reduction` | 目标下一次出手伤害 −N%（头目折半） |
| `next_ally_same_target_damage` | 下一名同伴对同目标增伤一次 |
| `slow` | 直接挂迟滞 |
| `self_damage`（扩充 v1） | 出手结算后施放者失去“最大气血 × 数值”，最少留 1 点；不触发援护、卸力、反击 |
| `sure_hit`、`sure_crit`（扩充 v1） | `segOpt` 写入 `o.sure`（不受自身目眩落空）、`o.sureCrit`（条件成立时必定会心，不占暴击率上限），`strike` 读取 |
| `self_low_hp_bonus`、`bonus_per_status_stack`（扩充 v1） | `segMul`：按施放者已损气血比例、按目标指定异常层数增伤，各自封顶 30% |
| 条件 `target_hp_below_50／35／30`、`target_hp_above_90`、`target_controlled／slowed／blinded／bleeding／poisoned／charging`（扩充 v1） | `condOk`，供 `conditional_damage` 与 `sure_crit` 使用 |
| **未实装** | `self_speed_multiplier`（合川撑岳、担山护众）、`delay_remaining_action`（断渡擒锋）、条件“本轮同伴主动护卫”（松涛合阵）与“本轮援护实际承伤”（叠岚掌）按不成立处理；“两名选中同伴”的招式（三径相援、群壑承声、担山护众）只作用于选中的一名 |

### 2.5 特效档位

`FXDEF` 由本表补入：丁0／丙1／乙2／甲3／绝3，再按 `vfx.js` 的 `tierCap(内力)` 截顶（例如甲级防御强化内力 0 → T0）。内功主动 `inner_*` 由 `vfx.js` 在自检前按内力取上限档；静心诀改为 T2（内力 10），保证 `VFX.audit()` 无告警。v4 招式编排由 `js/wuxia-battle.js` 按同 id 自动接管，本模块不涉及。

## 3. 旧原型招式与 v3 招式的对应、存档兼容

| 旧 id | 旧名 | v3 对应 | 关系与处理 |
| --- | --- | --- | --- |
| `fist` | 粗浅拳脚 | `gy_p1` 守拙立桩 | 目录 `legacy_name`；`fist` 仍是人人会的基础拳脚，不设别名 |
| `guiyun_sword`（养成旧档） | — | `gy_s1` 试锋探路 | 养成课程 `legacySkillId`，由养成模块处理 |
| `jinzhen` | 金针刺穴 | `bh_s1` | 同名同义：`MOVE_ALIAS`，弱点、异常与 v4 特效按 `bh_s1`，数值保留旧条目 |
| `huichun` | 回春散 | `bh_s2` | 同名同义：`MOVE_ALIAS`（2026-10-08 新增），治疗仍按旧 0.38 |
| `baicao` | 百草露 | （`bh_s4` 百草回生为高阶另授） | 不别名（[审计](../archive/design/martial-review/audit.md)：迁移前技能保留） |
| `dingshen` | 定神 | （`yh_m2` 和脉同息，人物技能暂缓） | 不别名 |
| `fuhu`、`liuye`、`lianhua`、`shuaibei`、`bianfa`、`guafeng` | 江湖散学 | `art_jh_*` 自成功法 | 不属门派 v3 招式，不别名 |
| `jingxin`、`sniff`、`lick` | 出身调息、大黄 | — | 无对应 |
| `blade`、`ghost`、`bite`、`peck`、`coil`、`palm_m`、`staff` | 敌方招式 | — | 无对应 |

存档兼容策略：

1. **不删、不改写**：旧 id 的 `SKILLS`、`BSK` 条目与玩家存档 `S.skills`／`mates[*].skills` 中的旧 id 原样保留，可照常装配和施放；苏芷队友模板仍用 `jinzhen`、`huichun`。
2. **同时会两者时只列 v3 招**：`castable` 在单位同时拥有旧招与其 `MOVE_ALIAS` 目标时隐藏旧招，避免同名两条；存档里的旧招与重数不动。
3. 重数不自动迁移：旧招的重数不会转给 v3 招；若以后要合并，需另立迁移规则并经用户确认。

## 4. 学会与开启

- 秘籍研习（`js/martial-manuals.js`）写入功法首招一重；`MartialStructure.syncArts` 按功法重数开启后续招式：甲级第二招五重，绝级第二招五重、绝招七重；已开启招式共享功法重数。v3 招式登记后 `SKILLS[k]` 存在，`syncArts` 才会开启它们。
- 装配仍走 `mnLoadWhy`（门槛、兵刃一致、群攻上限、栏位）；战斗中 `mkHero` 取已装配招式，武学菜单列出可施放的招式，防御强化随“防御”生效。

## 5. 验证

- `node --test tests/runtime-moves.test.cjs`：81 招登记、字段与合同一致、FXDEF 与自检、段数与削盾上限、附加削盾、异常与破势、绝招与冷却、防御强化与辅助、`syncArts` 重数开启、头目二阶段、浮字合并、巨蟒精英。
- 浏览器：`http://127.0.0.1:8149/index.html?runtimePrototype=1#street` 控制台开战后 `doSkill` 试放单体、群体、治疗、防御强化、绝招（记录见 [更新记录](../updates/2026-10-08-runtime-moves.md)）。
