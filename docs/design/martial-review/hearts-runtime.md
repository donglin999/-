# 内功接入运行时（v3 心法 → XINFA）

状态：现行　最后核对：2026-10-19（原记：**现行实现记录（本目录历史原型 `?runtimePrototype=1`），2026-10-08**。不是栖河试玩版（8792）的改动；数值是设计数值 HEARTS-NUM-2，未经实机校准。）

数据链：`tools_docs/build_hearts_numbers.py`（写 catalog.json / lineage-v3-moves.json 的 hearts）→ `tools_docs/build_runtime_hearts.py` → `js/martial-hearts-runtime.js`。该文件在 `index.html` 中于 `menu.js` 之后、`martial-structure.js` 之前加载，把 20 门 v3 内功按 `XINFA` 结构注册；`martial-structure.js` 读取其中的主动技规格（`window.MartialHeartsRuntime.specs`）并结算主动与被动。

## 1. 与旧 13 门的关系

| 旧运行 id | 旧名 | 处理 | 对应 v3 |
| --- | --- | --- | --- |
| `tuna` | 吐纳法 | **同一门**：保留 id `tuna`（养成课程 B01、存档、`cultivation-core` 都写 `tuna`），名称与数值改用 v3 | `xf_tuna`《吐故纳新篇》 |
| `bx_xin` | 本草经 | 保留，不合并。白鹇谷主修同一位置，v3 的继任者是《青囊养元经》；苏芷开局仍默认主修 `bx_xin` | 继任：`xf_baicao`《青囊养元经》 |
| `bx_du` | 毒经 | 保留 | 无 |
| `yq_xin` `yq_shi` | 玉泉心经、石佛功 | 保留（旧原型门派，v3 门派表中没有玉泉寺） | 无 |
| `gb_xin` `gb_shi` | 百衲功、市井身 | 保留 | 无 |
| `lm_xin` `lm_bo` | 浩然诀、博闻 | 保留 | 无 |
| `th_xin` `th_zuo` | 太和玄功、坐忘 | 保留 | 无 |
| `yy_xin` `yy_zhen` | 军中吐纳、行伍阵 | 保留 | 无 |

结论：旧门派心法全部保留以兼容存档；`xf_tuna` 并入 `tuna`；其余 19 门 v3 心法以 v3 id（`xf_guiyun` 等）**新增**。运行时 `XINFA` 共 32 门（旧 13 门含已改为 v3 的 `tuna`，加新增 19 门）。

`tuna` 的数值变化：内力上限每层 +5% → **+3%**；五层战后回复气血 20% → **15%**；三层战后回复内力 10% 不变；主动“归息”不变。

## 2. 字段映射

| XINFA 字段 | 来源 |
| --- | --- |
| `name` / `grade` / `xing` | catalog `name` / `grade` / `nature` |
| `slot` | `主` → `main`，`辅` → `sub` |
| `sect` | 门派组：guiyun→`guiyun`、white-heron→`baixian`（沿用旧白鹇谷 id）、zhaochuan、hechuan、songfeng、guijintang、qinghui 各自新 id；正道盟、巡江司、通用／散人、叶蘅家传为 `null`（不是师门，主修不查门派）。新门派名补入 `MN_SECT`。 |
| `e` | `[]`。v3 设计没有定“主修同属内劲 +3%/层”的属性，暂不给 |
| `req` | 品阶门槛（martial-lineage.md §3.2，内功路线主属性定力、副属性悟性，甲级起加根骨；绝级“定力 10”并入主属性 15） |
| `per` / `t3` / `t5` | 被动数值中运行时已有结算口的部分（见第 4 节） |
| `d3` / `d5` | 被动说明中“三层：”“五层：”的分句 |
| `desc` | `active_desc_v4` 的首句意象 + “养气：”被动基础句 |
| `v3n` / `passiveText` / `unsettled` | 被动原始数值、完整说明、未实装的键位置 |

品阶门槛：

| 品阶 | 定力 | 悟性 | 根骨 |
| --- | --- | --- | --- |
| 丁 | — | — | — |
| 丙 | 6 | — | — |
| 乙 | 9 | 6 | — |
| 甲 | 12 | 9 | 8 |
| 绝 | 15 | 12 | 11 |

## 3. 主动技

规格 `[名, 首效果, 内力, 冷却, 说明, 效果列表, 目标]` 并入 `martial-structure.js` 的 `specs`；注册为 `SKILLS.inner_<id>`（`innerId` 指回心法），`BSK.tgt` 按 `target_mode`（self / ally / foe）。耗一次行动、BP 不强化、冷却 3 次行动，沿用旧内功规则。

`doSkill` 内功分支对带效果列表的主动走 `innerV3`，新增效果类型如下（旧的 mp / ding / guard / heal / reveal / cleanse 仍照旧）：

| 效果 | 用到的心法 | 运行实现 |
| --- | --- | --- |
| `mp_restore` | 吐故纳新篇、华阳养真经、江潮调息法、归藏息经 | 回复内力上限比例（至少 1） |
| `heal_self` | 万壑归元诀、归藏息经 | 回复自身气血上限比例 |
| `heal_ally` | 青囊养元经、同气连枝篇 | 治疗基值 = 12 + 4×悟性 + 0.1×内力上限（同 `combat_sim.cjs`）× 系数 ×（1+治疗加成，≤30%），单次不超过目标气血 35%；同担自动避开自己 |
| `regen_ally` | 营卫心经 | 目标其后 2 次行动结束时各回复 6% 气血（×(1+持续恢复加成)）；施放那次不跳 |
| `ding` | 出岫心经 | 定神 n 次行动（`buffs.ding = n+1`） |
| `guard` | 霜弦真气、承梁真劲 | 进入防御，受伤减半至下次行动 |
| `counter` | 承梁真劲 | 至下次行动前首次受单体攻击时以 60% 威力反击（走现有 `guard.counter`） |
| `intercept` | 负岳功 | 指定同伴下一次被单体攻击时改由施放者承受，承伤减 30%（+承梁真劲每层 3%，总减伤 ≤60%）；到下一回合结束失效 |
| `reveal` | 观岚诀、静练功、地籁诀 | 看破指定敌人 n 处未知弱点 |
| `focus_next` | 静练功 | 下一次攻击 +25%（走现有 `nextAtk`） |
| `exposure_buff` | 薪火功 | 攻击 +35%、受伤 +10%，持续 3 次行动后复原 |
| `unload` | 余烬息（自身）、同气连枝篇（同伴） | 卸力一次（走现有 `guard.unload`） |
| `cleanse` / `cleanse_slow` / `cleanse_exposure` | 归藏息经、希声诀 / 华阳养真经 / 余烬息 | 解除异常（眩晕不可解除）/ 解除迟滞 / 结束薪火功暴露 |
| `order_up` | 霜弦真气、江潮调息法 | 下回合先手（走现有 `prio`，等同防御的先手，比“前移一位”略强） |
| `guard_token` | 出岫心经、万壑归元诀 | 得守势（上限 1，万壑归元诀五层 2）；**守势的消耗加成尚无运行规则** |
| `next_support_half` | 百工养气诀 | 下一次援护、卸力、医疗或作用于同伴的招式内力减半 |
| `status_focus` | 清徽心经 | 下一次施加异常基础率 +20% |
| `status_immune` | 希声诀 | 本回合与下回合免疫封穴、心乱 |

## 4. 被动

运行时已有结算口的直接写进 `per` / `t3` / `t5`：内力、气血上限、防御（%）、暴击（每层 +1%）、治疗加成，战后回复内力／气血、开战看破、五层身速 +1。

由 `martial-structure.js` 内功钩子结算（包一层，不改 battle.js / bfx.js）：

| 被动键 | 心法 | 钩子 |
| --- | --- | --- |
| 对已看破目标伤害 +%、自身暴露时伤害 +%（共用 30% 池） | 观岚诀、静练功、薪火功 | `strike` |
| 攻后到下次行动前减伤 | 余烬息 | `strike` 记号 + `foeHitDmg` |
| 持续恢复加成、恢复中同伴减伤 | 营卫心经 | `regen_ally` + `foeHitDmg` |
| 援护减伤加成 | 承梁真劲 | `intercept` |
| 守势上限 | 万壑归元诀 | `guard_token` |
| 看破回内力（三层每次、五层每战首次 +2） | 静练功、观岚诀 | `reveal` |
| 每战首次促成破势得 1 BP | 静练功五层 | `doBreak` |
| 治疗附带解除 1 项异常 | 青囊养元经三层 | `heal` |
| 战后全队回复 5% 气血 | 青囊养元经五层 | `mnSettle` |
| 施加异常基础率 +%、成功回 1 内力、首次封穴／心乱得 1 BP | 清徽心经 | `BattleRules.moveInflict` |
| 受异常基础率 −% | 希声诀 | `BattleRules.foeInflict` |
| 卸力类 / 援护医疗类 / 棍类丁丙招式内力 −1～−2（最少 1） | 华阳养真经、同气连枝篇、百工养气诀、江潮调息法 | `BattleRules.mpCost` |

另：对敌内功（看破类，含旧“辨机”）在 `bui.js` 选目标时会读 `skillPv` 的空值报错，现由 `martial-structure.js` 给内功一个零伤害预览（显示“预计 0”）绕开，未改 bui.js。

**未实装（界面显示“已登记”）**：出岫心经、万壑归元诀的“防御或援护后得守势、消耗守势增伤／减伤”（运行时没有守势消耗规则）；霜弦真气“整回合未受伤，下一次剑招 +10～15%”；负岳功“援护承伤后下一次拳招 +10～20%”；归藏息经“针线削弱或医线增益后回 3% 内力”（运行时没有针线／医线分类）。

已知偏差：`ding` 走现有定神（攻击 +30%、受伤 −20%），出岫心经设计值是 +25% / −15%；`order_up` 用先手代替“前移一位”；同气连枝篇与百工养气诀的“援护类”判定用“医疗、作用于同伴或带卸力的招式”近似。

## 5. 秘籍、投放与封面

- 秘籍道具 `mj_xf_<运行 id>`（v3 为 `mj_xf_xf_guiyun` 等），学习要求读 `XINFA[id].req`，由 `js/martial-manuals.js` 注册；没有来源记录的心法（家传）不注册道具。
- 投放：`tools_docs/build_manual_placement.py` 的 `v3_inner_rows`，见[秘籍投放表](../manual-placement.md)。本门为拜入或传授时赐书；外派按品阶同外功（丙公开渠道、乙合作许可、甲人物篇或深交、绝不外传，归烬堂丙级缴获、清徽阁不对男子外传）；归云谷是主角本门；叶蘅家传《归藏息经》只能请教。
- 封面：`tools_docs/gen_manual_icons.py`，书皮按品阶，封面意象取该心法 `icon_subject` 的内息意象、主色取门派配色；`build_manual_icons.py` 整理到 `assets/ui/manuals-v1/`。

## 6. 仍需决定

- 主角当前没有 `S.sect`，归云谷心法主修受“须为归云谷门下”限制；正式拜师时要写 `S.sect='guiyun'`（养成 `CultivationCore.join` 暂未写）。
- v3 心法的取得事件（导师在场、日期）尚未按事件排期登记；目前只能经秘籍或调试开关获得。
- 守势消耗、未受伤蓄锋、援护后增伤等条件被动需要战斗规则先定。
