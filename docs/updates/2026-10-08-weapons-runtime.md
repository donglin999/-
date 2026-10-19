# 2026-10-08 武器数值 v1 进入运行原型

工作区：`xiaojianghu`（历史原型，入口 `index.html?runtimePrototype=1#street`）。本记录只说明本目录原型的现行实现，**不代表栖河试玩版（8792）已采用**。没有提交，也没有推送。

## 需求

把已设计完成的武器数值 v1（`tools_docs/build_weapon_stats.py` → `js/equipment-runtime.js`）接入运行原型：注册 30 件武器；兵器适配改为按兵器类匹配；装备对技能的影响（属性亲和、施加率、抗性、异常持续缩短、治疗）与武器机制接入战斗，只用于我方。

## 核对过的文档

- [武器数值 v1](../design/martial-review/weapon-stats.md)：条件增伤加法池 30%、同一异常抗性上限 60%，以及机制的结算类型。
- [装备对技能的影响 v1](../design/martial-review/equipment.md)。
- [运行招式](../design/runtime-moves.md)：本次已更新其中的 `needWeapon` 规则。
- [battle.md](../battle.md)、[内容指南](../archive/content-guide.md)：本次已同步更新兵器适配的说明。

## 改动

| 文件 | 改动 |
| --- | --- |
| `js/equipment-runtime-register.js`（新） | 注册武器；汇总装备效果 `u.gearMods`；接入各项机制（包装 `mkHero`、`mkAlly`、`strike`、`heal`、`doSkill`、`foeHitDmg`，以及 `BattleRules.mpCost`、`segOpt`、`guardHit`、`defendApply`） |
| `js/battle.js` | 新增全局函数 `weaponFits(kind, need)`，按 `KIND_CLASS` 比较两件兵器是否同类；`BattleRules` 新增 `gearChance`、`gearResist`、`gearDurMinus` 和 `R.RESIST_CAP=.6`；`moveInflict` 计入装备施加率，`foeInflict` 计入装备抗性（有上限）；`apply` 计入我方异常持续缩短（最少 1）；武学菜单改用 `weaponFits` |
| `js/martial-structure.js` | 出手包装中，装备条件增伤并入心法的同一个 30% 加法池；施加包装计入装备施加率；受异常包装中，心法抗性与装备抗性按每种异常分别合计，上限 60% |
| `js/bui.js`、`js/battle-auto.js`、`js/jianghu-model.js`（`skillView`、`skillWhy`） | 招式兵器要求改用 `weaponFits` |
| `js/menu.js` `mnCan`、`js/jianghu-model.js` `equipWhy` | 同伴可用兵器改为按兵器类比较，`wk` 也按类理解，例如苏芷的 `['暗器','剑']` 现在可以用扇 |
| `js/menu.js` `mnLoadWhy` | 判断“兵刃不同只能择一”时也按兵器类比较 |
| `tools_docs/build_runtime_moves.py` → `js/martial-moves-runtime.js` | `needWeapon` 改为按招式 `weak_class` 设置（剑、刀、长兵、暗器、音律）；拳掌和无类招式不设；只给伤害招设置。重新生成后，数据只有 `needWeapon` 字段变化 |
| `index.html` | 在 `martial-manuals.js` 之后、`main.js` 之前加载 `js/equipment-runtime.js` 和注册脚本，并把改动过的 js 版本号统一改为 `?v=20261008-weapons-rt` |
| `tests/weapons-runtime.test.cjs`（新） | 共 10 项测试，见下文“测试” |
| 文档 | `runtime-moves.md`、`battle.md`、`content-guide.md` 修改了兵器适配说明；`weapon-stats.md` 新增第 7 节“运行原型接入” |

注册脚本在 `martial-structure.js` 之后加载，所以它的包装在最外层。`js/wuxia-fx.js`、`js/wuxia-battle.js` 和 `js/fx/*` 都没有改。

## 注册

- 30 件武器全部注册，id 沿用 catalog 的 `eq_` 前缀，没有跳过任何一件。旧原型兵器 wood、iron、rusty、club、knife、needles 的 id 不同，不受影响；如果已经存在同 id 条目，也不会覆盖（有测试覆盖）。
- 每件武器的字段：`name`、`desc`、`weapon{kind,atk,crit?}`、`fx`（可能为空对象）、`price`、`q`、`grade`、`mods`、`statusBonus`、`mech`，有需求时另带 `req`，归山另带 `unsellable`。归山 `price` 为 0，商店本来就不收。
- 图标：这批武器的图标还没出图（catalog `asset_status: not_generated`），所以用通用兵器字形填 `ICO`：剑、刀、锤、拳、棍、伞、扇、琴、笛取兵器名本字，短刀用“匕”，暗器用“针”，医具用“药”。

## 兵器适配

- `weaponFits(kind, need)`：如果没有 `need`，直接通过；否则比较 `KIND_CLASS[kind]||kind` 和 `KIND_CLASS[need]||need` 是否相同。所以伞、棍、篙都算长兵，扇、针、暗器都算暗器，琴、笛都算音律，短刀、锤都算刀。医具没有兵器类，不满足任何要求。
- 招式兵器要求：重新生成后，有 `needWeapon` 的招式共 46 门，分布是剑 20、刀 7、长兵 4、暗器 2、音律 13。原先只有剑、刀、棍类招式有要求，共 31 门。
- **行为变化**：主角学会暗器或音律伤害招后，必须装备同类兵器（例如素铜针囊、琴或笛）才能施放；原来不需要。同伴的招式要求仍只在江湖面板 `skillView` 里提示，战斗中不限制同伴，与原来一致。

## 装备效果接入

装备在开局时汇总：主角读 `S.weapon/S.armor/S.acc`，同伴读 `S.mates[k].equip`，结果写到 `u.gearMods`。敌方和宠物不计。

| 效果 | 结算 |
| --- | --- |
| `element_bonus` 属性亲和 | 招式属性有对应加成时计入条件增伤，与心法的看破、暴露增伤共用 30% 加法池（`martial-structure.js` 出手包装，按攻击力折算）；没有心法模块时，注册脚本自带同样的 30% 池 |
| `status_chance`、武器 `statusBonus` | 两者相加，计入我方招式的施加基础率（`moveInflict` 和心法包装两条路径都计入） |
| `status_resist` | 每种异常与心法“受异常基础率 −N”合计，上限 60%；施加率仍有 5% 下限 |
| `status_duration_minus` | 我方受到持续型异常时，持续回合减去对应值，最少 1 |
| `mods.heal` 与机制 `heal` | 施放者在 `doSkill` 中造成的治疗乘以 `1+合计`，内功治疗也包括在内；物品治疗和持续回复跳数不计 |

护具与佩饰的 `skill_mods` 走同一套汇总（读取 `ITEMS[id].mods`），但 catalog 里那 17 件护具与佩饰还没有注册进 `ITEMS`；已注册的旧护具没有 `mods`，所以目前没有影响。

## 武器机制

| mech.type | 武器 | 结算方式 |
| --- | --- | --- |
| `basic_atk` | 麻缠护手 | 普攻（`strike` 没有招式 id 时）增伤 +10%，计入加法池 |
| `weak_hit` | 合川拳套 | 拳掌招式这一段命中目标弱点时 +10% |
| `revealed_first_hit` | 照晚 | 本回合第一次出手（这次行动的每一段）对已看破目标 +20% |
| `revealed_break_atk` | 校铁锤 | 招式这一段命中弱点，且目标已看破、有盾、未破势时 +12% |
| `exposed_atk` | 断烬刀 | 刀类招式在自身暴露（`u.expose` 或内功暴露）时 +20% |
| `status_target_atk` | 玉徽琴 | 琴路（`SKILLS.kind==='琴'`）单体招式打已封穴或心乱的目标时 +12% |
| `after_defend_atk` | 岚隙剑 | 选“防御”后，下一次剑类招式（这次行动的各段）+15%，用掉为止；没有借用 `nextAtk`，因为 `nextAtk` 不分兵器类，而且会被任何下一击消耗 |
| `after_guard_atk` | 承岳护拳 | 援护代受同伴伤害后，下一次拳掌招式 +20% |
| `hit_or_heal` | 归息针匣 | 开局按装配的招式多数决定：治疗招多于暗器招时治疗量 +8%，否则暗器招式 +8%；平局取暗器 |
| `route_mp` | 竹节横笛 | 笛路招式内力 −1（`BattleRules.mpCost`，有消耗的最少 1） |
| `control_mp` | 雀尾短刀 | 牵制、控制类招式内力 −2。控制类指施加封穴、眩晕、心乱、惊惧、迟滞，或带迟滞、削弱敌方下一击效果的招式 |
| `guard_mp` | 渡汀长篙、留灯伞 | 援护、救援、卸力类招式内力 −2，判定依据是效果含 intercept、unload、physical_unload、death_prevention，或防御强化带卸力 |
| `after_guard_mp` | 风雨兼程 | 援护代受后，下一次刀类招式内力 −3，施放后消耗 |
| `revealed_mp` | 循脉银针 | 对已看破目标施放暗器招式后返还 2 内力（每回合一次，返还后实际消耗至少 1）；招式菜单显示的仍是原价 |
| `unload_bonus` | 邀锋铁骨扇 | 每回合第一次卸力结算时，卸力比例 +10%（上限 90%） |
| `after_atk_unload` | 留烬 | 自身出手后的同一回合或下一回合，第一次卸力结算时卸力比例 +10%（每个出手回合一次）。设计原文是“首次获得的卸力”，这里改在卸力结算时加，数值效果相同 |
| `token_mp` | 归山 | 招式条件消耗守势时回 6 内力，每战两次（包装 `segOpt`） |
| `status_chance` | 截江棍 | 长兵招式施加迟滞、眩晕的基础率 +8%（招式兵器类须与所持兵器同类） |
| `weaken_next` | 锁江棍 | 长兵招式命中后，目标 `atkDown` 至少 10%，作用于其下一次出手（`foeMul`），每回合一次；首领不减半 |
| `team_fear_minus` | 关山笛 | 笛路群体招式命中后，全队下一次受到的惊惧持续 −1（最少 1） |
| `heal` | 行诊药囊 | 治疗量 +10%，与 `mods.heal` 的 12% 相加，共 +22% |
| `def` | 护行刀 | 防御 +2 已经写在 `fx` 里，由 `derived()` 计入 |
| `see_mods`、`none` | 夜阑琴；竹纹练剑、桐木练琴 | 没有额外结算；夜阑琴的特性就是 `mods` 和 `statusBonus` 的施加率 |

### 补记：原“命中类”改为可结算机制，暴击率上限（同日第二轮）

第一轮说明过：运行战斗没有我方命中率（我方出手只在自身目眩时有 25% 落空），所以 `hit` 无法结算。主会话随后改了 `tools_docs/build_weapon_stats.py` 的 `MECH`，重新生成了 `js/equipment-runtime.js`，并同步了 `combat_sim.cjs`：四件武器改为新类型，数据里已经没有 `hit`。本轮的实现：

| mech.type | 武器 | 结算 |
| --- | --- | --- |
| `first_strike_atk` | 清流剑 | 施放者本场第一次攻击行动（这次行动的各段，含普攻）+15%，计入 30% 加法池，每场一次 |
| `blind_miss_half` | 理针囊 | 自身目眩时，暗器招式和暗器普攻的落空率从 25% 减半为 12.5%（`strike` 新增 `o.missMul`） |
| `crit_single` | 藏锋短刀 | 单体招式（`BSK.tgt` 不是 `foes`）暴击率 +6%（`strike` 新增 `o.critAdd`），仍受 35% 上限约束；普攻不加 |
| `multihit_later` | 燕尾飞刃 | 多段暗器招式从第二段起每段 +8%，计入加法池，段数不变 |

暴击率上限 35%（`rules.md`、`budget.json` 的 `critical_chance_cap`）有三处封顶：`js/menu.js` 的 `derived()` 返回前 `d.crit=Math.min(35,…)`，`js/core.js` 的旧 `derived` 同样封顶，`js/battle.js` 的 `strike` 暴击判定按 `min(R.CRIT_CAP=35, u.crit+o.critAdd)` 结算。`index.html` 中 `core.js`、`battle.js`、`menu.js`、`equipment-runtime.js`、`equipment-runtime-register.js` 的版本号改为 `?v=20261008-weapons-rt2`。

本轮验证：
- `tests/weapons-runtime.test.cjs` 增加 2 项，现为 12 项：四种新机制，以及暴击封顶（属性计算和判定两处）。
- `weapons-runtime`、`runtime-moves`、`battle-weakness-status`、`battle-auto`、`cultivation-jianghu-modern`、`cultivation-formal-martial` 共 53 项全部通过；`battle-error-regression` 通过。
- 浏览器（8149，加查询参数绕开缓存后，确认加载的是 rt2 脚本）：装备藏锋短刀后暴击 16。把随机数固定在 0.19：不带装备效果的“藏锋短刺”（`gj_s1`）没有暴击，伤害 28；带装备效果（22%）出现暴击，伤害 41。把暴击设为 60、随机数 0.4：按 35% 封顶，没有暴击。控制台没有错误。

### 设计方案中的取舍（可再改）

- 首领受锁江棍削弱时不减半。招式的 `next_enemy_attack_reduction` 对首领减半，但武器描述没写，这里按描述原值结算。
- “首击”“下一次 X 招”都按一次行动计，同一次行动的多段都吃加成。
- 增伤类机制都并入 30% 加法池，没有单独相乘。

## 测试

| 命令 | 结果 |
| --- | --- |
| `node --test tests/weapons-runtime.test.cjs`（新） | 10/10 通过：30 件全部注册、字段齐全、与运行时数据一致；不覆盖已有条目；`weaponFits` 真值表；46 门招式 `needWeapon` 与 `weak_class` 一致，同类兵器可施放；装备汇总；属性亲和增伤；施加率叠加；抗性与 60% 上限；持续缩短；治疗 ×1.22；普攻增伤、减费、削弱下一击、防御后剑招、守势回内 |
| `node --test tests/runtime-moves.test.cjs tests/battle-weakness-status.test.cjs tests/battle-auto.test.cjs tests/cultivation-jianghu-modern.test.cjs tests/cultivation-formal-martial.test.cjs tests/martial-manuals.test.cjs tests/vfx-coverage.test.cjs` | 53/53 通过；没有测试断言旧的精确匹配行为，所以没有改旧测试 |
| `node tests/battle-error-regression.cjs` | 通过 |
| 另跑 `node --test tests/runtime-hearts.test.cjs tests/martial-lineage-v3.test.cjs tests/martial-moves-v3.test.cjs` | 通过 |
| `tests/menu-icons.test.cjs` | 没跑成：本机缺 `/private/tmp/claude-501/pw/node_modules/playwright`（环境问题，与本次改动无关） |

## 浏览器验证（预览服务 8149）

入口：`http://127.0.0.1:8149/index.html?runtimePrototype=1#street`。等 `mode==='scene'` 后检查：注册 30 件、跳过 0 件，`weaponFits('伞','长兵')===true`，`weaponFits('剑','刀')===false`，加载的脚本版本都是 `20261008-weapons-rt`。

- 行囊装备：往 `S.bag` 放岚隙剑、留灯伞、夜阑琴（并把身法、定力、悟性调到 8 以满足需求），按 B 打开行囊，逐件“装备给萧白”并确认。空手时攻击 22、防御 20、暴击 21。依次装备后：岚隙剑为攻击 39、暴击 24（+17、+3）；留灯伞为攻击 36、防御 28（+14、+8）；夜阑琴为攻击 34（+12）。
- 开战 `battle({bg:'bg_street',foes:[mk('bandit'),mk('bandit'),mk('wolf')]})`。主角 `gearMods` 为 `cls 音律`，阴 +6%，封穴、心乱各 +17%。
- 属性招式：固定 `Math.random=0.5`，排除会心和浮动后，对同一喽啰施放“夜阑”（`hui_q3`，音律·阴）：不带装备效果 39，带装备效果 42。无属性的“勾弦”（`hui_q1`）两种情况都是 29。
- 带异常的招式：`R.rand=0.45` 时施放“夜阑”（封穴基础 35%）：不带装备效果没有封穴，带装备效果（35%+17%）封穴成功。
- 界面操作：战斗武学菜单里，“夜阑”“勾弦”在持琴时可选（音律类匹配）；通过菜单选“夜阑”和目标，正常走完一回合，进入第 2 回合。
- 控制台：没有错误（`read_console_messages` 只看错误，结果为空；`window.onerror` 也没有收集到错误）。

以上是函数级验证加界面冒烟测试，不等于美术验收或平衡验收。持琴时主角的战斗精灵仍然拿着剑，因为战斗造型不随兵器变化。

## 未完成项

- 30 件武器的图标还没出图，目前用通用字形。
- 17 件护具与佩饰没有注册进 `ITEMS`，它们的 `skill_mods` 目前没有入口。
- `village-4k-trial.html` 这个历史试验页没有加载注册脚本；它加载的 `battle.js` 自带 `weaponFits`，所以不受影响。

## 武器图标与数值收尾（主会话）

- **武器图标**：30 件武器都有了 v4 精绘画风的图标，品阶边框与技能图标一致。
  - 生成：`tools_docs/gen_equipment_icons.py`，原图在 `art_sources/equipment_icons_v1/`。
  - 整理：`tools_docs/build_equipment_icons.py`，输出 `assets/ui/equipment-v1/` 和 `js/equipment-icons.js`。
  - 接入方式是包住 `mnIco`，新旧两个行囊都显示图标。
- **补齐兵器梯度**：新增两件甲级武器，名称待命名评审。
  - 锁江棍（长兵，巡江司）。
  - 玉徽琴（琴，清徽阁）。
- **修正**：清徽阁 4 件装备原先复制了留灯伞的“长兵 / 阴劲 +6%”，现已改为音律并按装备效果表套用（`build_skill_docs.py`）。
- **模拟**：`tools_balance/combat_sim.cjs` 接入了武器数值和可直接结算的机制，名册按兵器类梯度换装。结果见 `docs/design/martial-review/weapon-stats.md` §5，模拟数据归档在 `balance/sim/weapons-v1/`。
