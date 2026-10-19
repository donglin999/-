# 2026-10-08 护具与佩饰数值 v1 进入运行原型

工作区：`xiaojianghu`（历史原型，入口 `index.html?runtimePrototype=1#street`）。本记录只说明本目录原型的现行实现，**不代表栖河试玩版（8792）已采用**。没有提交，也没有推送。

## 需求

护具与佩饰数值 v1（`tools_docs/build_armor_acc.py` → `js/equipment-runtime.js` 的 `armors`、`accs`，汇总表见 [equipment.md「护具与佩饰数值 v1」](../design/martial-review/equipment.md)）接入运行原型：

- 注册 12 件护具、37 件佩饰；
- 护具机制与佩饰战斗词条进入战斗；
- 功能类词条接入对应系统。

做法沿用 [武器接入](2026-10-08-weapons-runtime.md) 的方式。

## 改动文件

| 文件 | 改动 |
| --- | --- |
| `js/equipment-runtime-register.js` | 注册护具和佩饰；`sum()` 扩展汇总；接入战斗词条与功能词条；新增 `EquipmentGear.func`、`onDodge`、`prepVictory`，以及全局 `gearBuyPrice`、`gearItemGain` |
| `js/battle.js` | 战败扣一半银两前判断 `noSilverLoss`；`foeAct` 的“闪”处调用 `EquipmentGear.onDodge`；战斗中使用药食改用 `gearItemGain` |
| `js/bfx.js` | `foeAct` 的“闪”处调用 `onDodge`（运行中实际生效的 `foeAct` 在这里） |
| `js/bui.js` | 战斗中使用药食改用 `gearItemGain`（实际生效的 `allyTurn` 在这里） |
| `js/ui.js` | 商店买价改用 `gearBuyPrice`，单价旁标注“佩饰减价，原价 N”；卖价仍是原价的一半；旧服药入口改用 `gearItemGain` |
| `js/menu.js` | `mnUse` 改用 `gearItemGain`；道具说明的类别行显示“佩饰 · 战斗类 / 功能类”“护具 · 轻 / 中 / 重 / 医装” |
| `js/jianghu-model.js` | `inspect` 的药食回复量改用 `gearItemGain`；`item()` 新增 `label`（如“佩饰 · 功能类”）；`calc()` 暴击封顶 35%，与 `derived()` 一致 |
| `js/jianghu-ui.js` | 道具详情的类别行显示 `label` |
| `js/scene.js` | `sceneMoveSpeed` 乘以 `EquipmentGear.walkMul()`，没有该函数时按 1 |
| `index.html` | 以上 9 个脚本的版本号统一改为 `?v=20261008-armor-acc` |
| `tests/armor-acc-runtime.test.cjs`（新） | 10 项测试 |

`js/wuxia-fx.js`、`js/wuxia-battle.js`、`js/fx/*` 都没有改，图标也没有处理（由主会话的 `js/equipment-icons.js` 负责；未出图前，`mnIco` 回退为名称首字）。

## 注册

注册数为 49：护具 12、佩饰 37，跳过 0。id 都用 catalog 的 `eq_` 前缀；已经存在的 id 一律不覆盖，有测试覆盖。旧的 `cloth`、`vest`、`mianjia`、`charm`、`collar`、`jade` 不动。

- 护具字段：`name, desc, armor（数字）, fx, price, q, grade, armorType（轻/中/重/医）, mods, mech`，有需求时另带 `req`，绝级另带 `unsellable`。
  - 类型用 `armorType` 存放，不用 `type`，以免和其他读取 `type` 的代码冲突。
- 佩饰字段：`name, desc, acc:1, fx, price, q, grade, cls（战斗/功能）, affix, mods`，绝级另带 `unsellable`。
- 绝级 `price` 为 0，商店不卖，行囊也不能卖出。

派生属性方面，`mnSlot`、`mnFx`、`derived` 原本就支持这些键：`armor→def`，以及 `fx` 里的五维、`mhp`、`mmp`、`def`、`crit`、`dodge`、`spd`、`block`。`derived` 已包含 `block`（上限 30）和 `mmp`，暴击上限 35% 沿用。

本轮唯一的补漏是：新版江湖界面的 `JianghuModel.calc` 原先没有封顶暴击，现在补上了。

## 战斗：已接入（只对我方，开战时汇总到 `u.gearMods`）

护具和佩饰的 `skill_mods` 原本就由 `sum()` 汇总，包括 `element_bonus`、`status_chance`、`status_resist`、`status_duration_minus`、`heal`，结算与武器相同：

- 增伤并入 30% 加法池；
- 抗性与心法抗性合计，上限 60%。

| 键 | 物品 | 结算 |
| --- | --- | --- |
| mech `heal`、affix `heal` | 轻行医袍、百草织袍、鹤衔玉佩 | 并入 `g.heal`，作为施放者治疗量的乘数（例如百草织袍为 5%+12%） |
| affix `heal_recv` | 羊脂玉环 | 受到的治疗 ×1.15，与施放者治疗量相乘；回合回复与药食也计入 |
| mech / affix `guard_reduce` | 护运软甲、铁鳞软甲、承岳扣 | 援护代受时，伤害再乘 `1−合计`（合计上限 60%）；对 `_covering` 与内功援护 `_coverRed` 都生效 |
| mech `unload_bonus`、affix `unload_first` | 绯袖行衣、留灯坠 | 施放者给同伴卸力时，每回合第一次在同伴卸力上加合计值（上限 90%）。做法是在 `doSkill` 前后比较同伴的 `guard.unload` |
| mech / affix `first_round_spd` | 折锋剑衣、松径结 | 第一回合排序时身速 +N（包装 `orderKey`）；“下回合”预览不加 |
| affix `first_act` | 定风珠 | 第一回合排序键 +500，必定先手 |
| mech `expose_first_reduce` | 余烬行装 | 每战第一次带暴露（`expose` 或内功暴露）受击时，该次伤害 −20% |
| mech `guard_heal` | 守诺旧氅 | 每战第一次援护气血低于三成的同伴后，自身回复 10% 气血（受击结算后回复）。被援护者由 `coverOf` 包装或 `foeAct` 原目标得出 |
| mech `dodge_counter_atk` | 岚纹轻衫 | 闪避后（每回合一次触发），下一次攻击行动 +15%，计入加法池 |
| affix `weak_dmg` / `break_dmg` / `elite_dmg` | 青玉扳指、朱绳铜铃、墨玉印坠 | 分别对应命中弱点、目标破势中、目标为精英或首领；都计入 30% 加法池 |
| affix `crit_route` | 分针铜牌 | 暗器类招式 `opt.critAdd +4`（与藏锋短刀相加），判定时受 35% 上限约束 |
| affix `mp_after_token` | 回岚剑穗 | 守势被招式条件消耗后，下一次剑招内力 −2（有消耗的最少 1），施放后清除 |
| affix `mp_after_guard` | 践约环 | 第一次援护代受时回复 6 内力，每战一次 |
| affix `regen_hp` / `regen_mp` | 羊脂玉环、蜻蜓翠簪 | 每回合开始（包装 `BattleRules.roundStart`，第一回合也算）回复 3% 气血或内力 |
| affix `start_bp` | 鎏金腰牌 | 开战时（包装 `layoutUnits`）蓄势 +1，上限 5 |
| affix `resist_all` | 护心镜坠 | 给 `ST_DEF` 的全部异常加抗性，与其他抗性合计仍受 60% 上限 |
| affix `last_stand` | 护心镜坠 | 第一次受到致命伤时以 1 点气血撑住，并回复 15% 气血，每战一次（包装 `BattleRules.guardDeath` 和 `hurt`） |
| affix `last_stand_unload` | 归途佩 | 第一次被打到气血低于三成时，自动获得 40% 卸力，作用于下一次受击，自身行动时清除；每战一次。与 `last_stand` 同时存在时只保留 `last_stand` |
| mech `none` | 归谷短衣、行旅夹衣、牛皮护心甲 | 没有额外结算 |

## 功能类词条：已接入

“队伍”指主角加上 `S.party` 中已结伴的同伴，宠物不计。合计方式有三种：相加后封顶、取最高、只算装备者本人。

| 词条 | 合计方式 | 接入点 |
| --- | --- | --- |
| `silver_pct` 银两 | 队伍相加，上限 +30% | 胜利结算：在最外层包装 `victory`（实际生效的是 `bui.js` 的 `victory`，`battle.js` 的同名函数已被覆盖）。结算前把加成加到第一个敌人的 `silver` 上，结算后还原 |
| `exp_pct` 修为 | 队伍相加，上限 +25% | 同上，加在 `exp` 上。`menu.js` 的结算包装用同一修为推算心法进度，所以修为加成也会带动心法进度 |
| `drop_pct` 福源 | 队伍相加，上限 +80% | 同上，各掉落百分比乘 `1+合计`，单项上限 100 |
| `pickup` 拾得 | 队伍取最高 | 同上，按该概率另加一件药食（`bun`、`pill`、`wine` 中随机一件），显示在战利品中 |
| `no_silver_loss` | 队伍任一人装备即生效 | `battle.js` 战败时不扣一半银两 |
| `post_heal` 战后回复 | 装备者本人 | 包装 `mnSettle`：胜利时回复 8% 气血与内力，“精进”面板显示“吐纳调息” |
| `shop_disc` 商店 | 队伍相加，上限 20% | `ui.js` 商店买价。与 quests.js 铁匠八折相乘；卖价不受影响 |
| `prof_pct` 熟练 | 装备者本人 | 包装 `mnProfGain`，`raw` 乘以倍率 |
| `xinfa_pct` 心法 | 装备者本人 | 包装 `mnXfGain`，`exp` 乘以倍率（心法进度由修为折算） |
| `walk_pct` 行走 | 队伍取最高 | `scene.js` 的 `sceneMoveSpeed` 乘以倍率；跟随同伴同样按此速度 |
| `item_heal_pct` 药食 | 队伍取最高 | 药食的气血（及非酒类的内力）回复量乘以倍率。接入点包括 `menu.js mnUse`、`JianghuModel` 的 `useItem`/`inspect`、战斗中使用道具（`bui.js`、`battle.js`）和 `ui.js` 的旧入口 |
| `wine_pct` 酒 | 队伍取最高 | 只回内力的物品（`it.mp>0` 且没有 `heal`，目前为竹叶青 `wine`），内力回复量 ×1.5 |
| `aff_pct` 好感 | 队伍相加，上限 30% | 包装 `story.js` 的 `aff()`。只放大正向获得；小数部分记在 `S.affFrac`，累计满 1 点再入账 |
| `pet_atk` 大黄 | 队伍取最高 | 包装 `pets.js` 的 `mkPet`，开战时宠物攻击乘以倍率 |

封顶值是本轮的设计方案，可以再改。设计表只写了“+X%”，没有规定多人叠加怎么算，所以上限由本轮决定。

`EquipmentGear.func` 对外提供 `value(key,w)`、各类倍率函数、`itemGain`、`buyPrice`、`affAdd` 和 `FUNC` 策略表，便于测试和后续调整。

## 未能接入或有限制的部分

- **持续伤害致死**：`dotHurt` 不经过 `hurt` 和 `guardDeath`，所以护心镜坠撑不住中毒、流血造成的致命伤；归途佩也不会在持续伤害把气血压到三成以下时触发。两者都只对直接受击生效。
- **援护承伤与 60% 减伤上限**：装备的援护减伤与心法减伤池（上限 60%）是相乘关系，没有并进同一个池子；装备自身的合计另有 60% 上限。
- **宠物**：大黄只能戴项圈，宠物自己的装备不计入功能词条。
- **未接入的系统**：养成模块（`cultivation-*`）里的熟练和心法进度没有接入 `prof_pct`、`xinfa_pct`；只接了战后结算 `mnSettle` 和 `mnProfGain`、`mnXfGain` 这条路径。
- **好感入口**：只有 `aff()` 一处（苏芷）。目前没有其他写入 `S.aff` 的地方。
- **护心镜坠与归途佩互斥**：佩饰只有一格，同一人不可能同时装备两件。汇总时如果同时出现，只保留 `last_stand`。

## 测试

| 命令 | 结果 |
| --- | --- |
| `node --test tests/armor-acc-runtime.test.cjs`（新） | 10/10 通过，见下方测试内容 |
| `node --test tests/weapons-runtime.test.cjs tests/runtime-moves.test.cjs tests/battle-weakness-status.test.cjs tests/battle-auto.test.cjs tests/cultivation-jianghu-modern.test.cjs tests/cultivation-formal-martial.test.cjs tests/martial-manuals.test.cjs` | 与新测试合计 70/70 通过 |
| `node tests/battle-error-regression.cjs` | 通过（win、lose、injected error、companion/pet rollback） |
| 另跑 `runtime-hearts`、`martial-lineage-v3`、`martial-moves-v3`、`combat-sim`、`side-run-arms`、`pre-xiangyang-training`、`vfx-coverage` | 通过 |
| `tests/xiangyang-slice.test.cjs` | 没跑成：本机缺 `/private/tmp/claude-501/pw/node_modules/playwright`（环境问题） |
| `tests/scene-resolution-speed.test.cjs` | 4 项失败。原因是测试从 `main.js` 截取的片段以 `if(window.XJHRuntime&&…)` 结尾，造成语法错误，失败发生在 `main.js` 切片处，与本次 `scene.js` 改动无关。新测试中另外验证了 `sceneMoveSpeed` 乘以 `walkMul` |

新测试覆盖：

- 49 件全部注册，字段与运行时数据一致；不覆盖已有 id；旧物品不动。
- `mnSlot`、`mnCat`。
- `derived` 的防御、气血、内力、五维、暴击、闪避、身速、格挡，以及暴击 35% 和格挡 30% 两个上限。
- `sum` 汇总。
- 各战斗词条，包括先手、蓄势、回复、援护、暴露、撑住、卸力、内力减免。
- 功能词条的乘数函数与封顶。
- 药食、酒、商店、好感累计、胜利结算临时加成与还原。
- 熟练、心法、好感、大黄、战后回复的包装。
- 源码接入点。

## 浏览器验证（预览服务 8149，`seed` 标签页）

入口：`index.html?runtimePrototype=1&cb=aa1#street`。确认加载的是 `?v=20261008-armor-acc` 脚本：护具注册 12、佩饰注册 37、跳过 0。

- **行囊与装备**：把 9 件护具、佩饰放进行囊。
  - 装备铁鳞软甲：防御 15→35、身速 9→8、格挡 9→17。
  - 再戴虎爪坠：攻击 22→25、暴击 11→14。
  - 新版江湖界面的行囊能列出这些物品；行商牙牌的详情类别行显示“佩饰 · 功能类 · 持有 1”。
- **开战**，装备鎏金腰牌和岚纹轻衫：开战蓄势为 2（1+1）；`gearMods` 中有 `dodge_counter_atk`、`start_bp`，以及目眩、迟滞、心乱、惊惧抗性 25%。
- **定风珠**：把野狼身速改为 30 后，第一回合排序为萧白（身速 10）、野狼、喽啰；下回合预览为野狼在先。
- **羊脂玉环**：开战时气血 50，第一回合开始后为 59（3% 气血上限 = 8，再乘受到的治疗 1.15，得 9）。
- **胜利结算**：
  - 行商牙牌：喽啰银两 12×1.15，结算面板显示“银两 +14”，结算后敌人数据还原。
  - 长命金锁：两只野狼修为 36×1.15，显示“修为 +41”。
  - 掉落率加成的抽样只在单元测试中验证（随机，浏览器这一场没有掉落）。
- **商店**：佩戴行商牙牌后，铁匠铺枣木短杖单价 14，标注“佩饰减价，原价 16”，其余货品同样按 −12% 显示。
- **行走速度**：无佩饰时 `sceneMoveSpeed(1,0)` 为 0.27，戴行脚结后为 0.297（×1.1）。
- **控制台**：没有错误（`read_console_messages` 只看错误，结果为空；页面 `error` 监听也没有收集到错误）。

以上是函数级验证加界面冒烟测试，不等于美术验收或平衡验收。本轮没有在浏览器中实际触发援护、闪避、致命伤这几类时机（由单元测试覆盖）。

## 未完成项

- 49 件护具与佩饰的图标由主会话负责（`js/equipment-icons.js`）。
- `tools_balance/combat_sim.cjs` 还没有接入护具与佩饰。
- 上文“未能接入或有限制的部分”列出的持续伤害致死、养成模块熟练与心法进度两项，待后续决定是否补接。

## 设计、模拟与图标（主会话）

- **设计**：`docs/design/martial-review/armor-acc-stats.md`。生成脚本 `tools_docs/build_armor_acc.py`，接在 `build_weapon_stats.py` 之后。
  - 护具 12 件，分轻、中、重、医四类。
  - 佩饰 37 件，战斗类 22 件、功能类 15 件。
  - 新增 32 件，名称待命名评审。
- **模拟**：`tools_balance/combat_sim.cjs` 接入了护具防御（按中装梯度计算差值）和佩饰战斗词条，名册按角色定位换装。
  - 全套装备对照不计装备数值：胜率不变，各队伍平均回合快 0.5–4%，剩余气血多 1–3 个百分点。
  - 结果归档在 `balance/sim/weapons-v1/results-full-gear-*.json`。
- **图标**：护具 12 张、佩饰 37 张，画风与武器、技能图标一致。
  - 生成：`tools_docs/gen_equipment_icons.py --slot armor/acc`；整理：`build_equipment_icons.py`。现在共 79 张装备图标。
  - 自审时重画了分针铜牌：初版和行旅凭牌几乎一样，都是木牌，已改为嵌银针的黄铜牌。
- **文本修正**：福寿钱的外观描述里原有一句生图提示“只画纹样不可辨读”，会显示在道具说明里，已删除。
- **已知的旧测试问题**：`tests/scene-resolution-speed.test.cjs` 失败，原因是它从 `main.js` 截取的代码终点落在一条 `if` 语句中间。`main.js` 最后修改于 10 月 7 日，与本次改动无关。
