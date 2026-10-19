# 2026-10-11 攻击招式扩充 v1：六派第二路与江湖散学

范围：本目录（`xiaojianghu`）的设计文档库与历史运行原型（`index.html?runtimePrototype=1`）。不涉及 8792 的栖河试玩版。

## 1. 需求

用户原话（2026-10-11）：

- “现在攻击技能好像还很少，攻击的技能起码是辅助或者防御技能的 2.5 倍，要多样化，可能功法还是太少了。”
- “你去安排吧，尽量多借鉴金庸古龙小说的功法。”
- “古龙和金庸的功法直接换个类似的名字，然后直接按照小说描述去写对应内容即可。”

用户已确认、本轮不改的结构：外功丁、丙、乙各 1 招，甲 2 招（第二招五重开启），绝 3 招（五重、七重开启，只有第三招是绝招）；个人技能只能请教，不出秘籍。

起因数据见[攻击招式占比诊断](../archive/design/martial-review/attack-ratio-diagnosis.md)：扩充前攻击 64 招、辅助防御 59 招，比例 1.08。

## 2. 结果

| 项目 | 扩充前 | 扩充后 |
| --- | --- | --- |
| 攻击招 | 64 | 161 |
| 辅助防御招 | 59 | 59 |
| 比例 | 1.08 | 2.73 |
| 外功功法 | 52 门 | 110 门（门派 82、江湖散学 28） |

- **门派第二路**：白鹇谷飞针、照川袖剑、合川杠棒、松风拂尘、归烬烬砂、巡江腰刀，各 5 门功法 8 招，共 30 门 48 招。
- **江湖散学**：28 门 49 招（绝 5、甲 11、乙 7、丙 5），改编自金庸 17 门、古龙 11 门小说功法，名称另起，每门写明原型出处。
- 97 招全部是攻击招；群体 31 招（32%）；寒 15、炎 13、雷 14；长兵 4→24、暗器 7→44、刀 10→23；丙级攻击招 12→23、乙级 10→28。
- 现有 123 招的数值、名称、归属没有改动（逐项比对：`catalog.json` 的 64 招与 18 门内功、`lineage-v3-moves.json` 原 39 招与 2 门内功、`martial-systems.json` 原 62 个条目、`skill-text-v4.json` 原 123 条、`js/wuxia-kit-data.js` 原 123 条规格、`js/martial-moves-runtime.js` 原 81 招，全部与改动前相同）。

设计文档：[攻击招式扩充 v1](../design/martial-review/attack-expansion-v1.md)（总表、逐招、预算、新机制、模拟结果、待决定事项）。

## 3. 改动

### 设计数据与生成链

- 新增 `tools_docs/attack_expansion_data.py`：这批内容的唯一数据来源（97 招、58 门功法、属性、异常、徒手标记、原型出处、取得方式）。
- 新增 `tools_docs/build_attack_expansion.py`：`text` 把 97 招的玩家描述、四拍分镜、图标主体写进 `skill-text-v4.json`；`doc` 生成设计文档。
- 接入现有脚本（都只是读扩充数据，不改原有条目）：
  - `build_martial_lineage_v3.py`：功法与招式合同；江湖散学作为 `group=jianghu` 的外功（`tier=江湖散学`，无前置、有属性门槛，带 `prototype`、`placement` 字段）；新路线的属性门槛映射；命名审定表不收扩充内容。
  - `build_elements.py`、`build_status.py`：逐招属性与异常；门派第二路仍守“每派两种属性”的断言。
  - `build_runtime_moves.py`：登记 178 招；扩充招式随表带 `r` 字段补进 `MOVE_RULES`；徒手招不设 `needWeapon`；吼声的 `BSK.t` 按笛类取命中特效。
  - `build_manual_placement.py`：江湖散学的投放行。
  - `tools_fx/build_vfx_kit_specs.py`：扩充招式的规格带 `exp:1`（先用模板特效）。
- 生成链顺序：`complete_martial_moves_v3 → build_martial_lineage_v3 → build_elements → build_status → build_attack_expansion text → build_equipment_mods → build_hearts_numbers → build_skill_docs → build_weapon_stats → build_armor_acc → build_martial_library → build_runtime_moves`，之后 `build_runtime_hearts`、`build_manual_placement`、`tools_fx/build_vfx_kit_specs.py`、`build_attack_expansion doc`。
- 重新生成的文件：`martial-systems.json／.md`、`lineage-v3-moves.json`、`catalog.json`（只多了 `groups.jianghu`）、`skill-text-v4.json／.md`、`move-contracts.md` 的 v3 补充表、六个门派分册（`white-heron.md`、`zhaochuan.md`、`hechuan.md`、`songfeng.md`、`guijintang.md`、`patrol.md` 的“v3 招式总览”）、`manual-placement.json`、`docs/design/manual-placement.md`、`js/martial-external-data.js`、`js/martial-moves-runtime.js`、`js/martial-manual-sources.js`、`js/wuxia-kit-data.js`。

### 运行原型

- `js/battle.js`（`BattleRules` 与 `strike`）：
  - 新条件：`target_hp_below_50／35／30`、`target_hp_above_90`、`target_controlled／slowed／blinded／bleeding／poisoned／charging`。
  - 新效果：`self_damage`（自损，不致死）、`sure_hit`（不受自身目眩落空）、`sure_crit`（条件成立时必定会心）、`self_low_hp_bonus`、`bonus_per_status_stack`（各自封顶 30%）。
  - 没有改 `js/bfx.js`：它的 `doSkill` 调用同一套 `BattleRules.segOpt／applyEf` 与 `strike`，新机制自动生效。
- 秘籍：58 本新秘籍由 `js/martial-manuals.js` 按 `MartialExternalArts` 自动注册（脚本未改），来源说明来自重新生成的 `js/martial-manual-sources.js`。
- 没有新增脚本文件，`index.html` 未改。内容有变的已加载脚本：`js/battle.js`、`js/martial-external-data.js`、`js/martial-moves-runtime.js`、`js/martial-manual-sources.js`、`js/wuxia-kit-data.js`、`js/martial-move-icons.js`（版本号由主会话统一处理）。

### 模拟器

- `tools_balance/combat_sim.cjs`：同样实现上述 5 个效果与 10 个条件，条件增伤并入 30% 加法池。
- 新增 `tools_balance/attack_expansion_sim.cjs`：在内存里造 10 支“换招队”与原队对比，输出 `balance/sim/attack-expansion-v1.json`。

### 文档

- 新增：`docs/design/martial-review/attack-expansion-v1.md`（生成）、本记录。
- 更新：`martial-lineage.md`（顶部说明、4.2c 六派第二路、4.4 江湖散学补充、第 6 节规模）、`secret-manuals.md`（秘籍数量、散学门槛、待办）、`runtime-moves.md`（登记范围、`MOVE_RULES` 补登记、新效果、徒手招）、`attack-ratio-diagnosis.md`（状态）、`docs/design/README.md`（索引）。

### 测试

- 新增 `tests/attack-expansion.test.cjs`（11 项）：数量与比例、多样性指标、结构规则、现有数值抽查、改名与原型出处、分镜与模板特效、97 招逐招施放、新机制逐条结算、秘籍研习流程。
- 更新数量断言：`runtime-moves`（81→178、103→200）、`martial-lineage-v3`（52→110 门、39→136 招、绝学门数、江湖散学不设传承链）、`weapons-runtime`（设兵器要求的招式 46→124，徒手 8 招例外）、`vfx-coverage`（扩充的 11 个绝招暂用模板，按 `exp` 标记放行并断言数量）。

## 4. 核对过的文档

`CLAUDE.md`、`docs/ai-onboarding.md`、`docs/design/martial-structure.md`、`martial-lineage.md`、`martial-review/attack-ratio-diagnosis.md`、`martial-review/rules.md`、`secret-manuals.md`、`manual-placement.md`、`item-naming-standard.md`、`runtime-moves.md`、`martial-review/icon-style-v4.md`、`martial-review/balance/budget.json`。

与已确认规则的出入只有一处，已在设计文档第 10 节列为待决定：巡江司原设“官府训练没有镇派绝学”，本轮按任务要求给第二路补了绝级《镇澜刀》，写成老教头私传的江防旧军刀法。

## 5. 验证

### 平衡模拟

- **现有曲线不变**：改动前后的 `combat_sim.cjs` 各跑 40 个种子、23520 场，588 行结果、各招式统计、异常统计完全相同（改动前的脚本由还原新增段落得到，输出在会话临时目录，未入库）。
- **换招队对比**（`node tools_balance/attack_expansion_sim.cjs --seeds 12`，两遍共 34272 场）：
  - 输出位换输出位（照川袖剑、合川杠棒、归烬烬砂、散学剑、散学暗器）：回合数变化在一成左右，胜率不变。
  - 护卫或接应位换成纯攻击（白鹇飞针换陆衡、松风拂尘换闻疏桐、巡江腰刀换沈雁回、散学拳掌与刀棍换萧白拳掌）：头目战短一到两成，是队伍构成变化的结果；战后气血基本持平。
  - 绝招可用时（`jueAt=8` 口径的最后阶段）：新绝招每次伤害 323–530，旧绝招 214–540，在同一量级。
  - 详表在设计文档第 9 节。

### 测试（node v24）

| 命令 | 结果 |
| --- | --- |
| `node --test tests/attack-expansion.test.cjs` | 11 通过 |
| `node --test tests/runtime-moves.test.cjs` | 11 通过 |
| `node --test tests/runtime-hearts.test.cjs` | 6 通过 |
| `node --test tests/martial-lineage-v3.test.cjs` | 7 通过 |
| `node --test tests/martial-manuals.test.cjs` | 7 通过 |
| `node --test tests/combat-sim.test.cjs` | 6 通过 |
| `node --test tests/battle-weakness-status.test.cjs` | 10 通过 |
| `node --test tests/battle-auto.test.cjs` | 1 通过 |
| `node --test tests/weapons-runtime.test.cjs` | 12 通过 |
| `node --test tests/armor-acc-runtime.test.cjs` | 14 通过 |
| `node --test tests/martial-moves-v3.test.cjs`、`equipment-cleanup`、`cultivation-formal-martial`、`npc-arts` | 4、5、12、1 通过 |
| `node tests/battle-error-regression.cjs` | 通过 |
| `node tools_scene/check_item_naming.cjs` | 通过 |
| `python3 tests/document-library.test.py` | 8 通过 |
| `node --test tests/vfx-coverage.test.cjs` | 最后一次运行 5 通过。其中“门派特效文件引用的素材都在本门素材包或公共素材包里”在本轮开工前的基线和中途几次运行里失败过（报 `js/fx/` 下 `fx-ren.js`、`fx-hui.js` 缺素材），是同时进行的特效升级任务在改素材，与本次改动无关；交付时以主会话最终运行为准 |

没有做浏览器验收：浏览器面板由主会话使用，本轮只用 node 测试验证运行时；函数测试不等于实机手感或美术验收。

## 6. 图标

- 招式图标：97 张全部生成并接入。沿用现有 v4 流水线 `python3 tools_docs/gen_icons_v4.py`（`codex exec` 内置生图，参考图 `art_sources/xiangyang_icons_v3/style-approved.png`，画面主体取 `skill-text-v4.json` 的 `icon_subject`），原图、提示词、回执与日志在 `art_sources/martial_icons_v4/<招式 id>.*`；`python3 tools_docs/pack_martial_icons_v4.py` 打包为 `assets/ui/martial-moves-v4/<招式 id>.webp`（128×128）并写入 `js/martial-move-icons.js`（原有 106 个键的路径不变）。
- 模型：内置生图由服务端选模型，提示词里带了 gpt-image-2.5 的要求，不能据此认定实际模型。没有使用 FlatRouter API。
- 状态：**已生成、未经用户评审**（数据里 `icon_status=generated_v4_pending_review`）。我只看了两张 49 格总览图：风格、品阶边框与现有 v4 图标一致，没有文字或水印；封脉寒针、缴械、扣刀不发、一指定阳、两指夹锋、飞石破空等几张画出了手或手腕，和规范里“掌法不画手臂”的取向不完全一致，是否重画请用户看图决定。
- 未生成：58 本新秘籍的封面图标（`tools_docs/gen_manual_icons.py` 可复用，本轮没有跑）。

## 7. 未完成项与待用户决定

1. 巡江司是否保留绝级《镇澜刀》。
2. 江湖散学的名称是否要离原著更远或更近（只改 `attack_expansion_data.py` 里的名称，id 不变）。
3. 《祛邪剑谱》没有采用原著的修习代价，是否另加代价。
4. 28 门散学的取得事件、传授人物和地点没有进事件排期，传授人未起名。
5. 97 招的专属特效不在本轮，现在是模板特效；其中 11 个绝招按规范应有专属编排（`tests/vfx-coverage.test.cjs` 以 `exp` 标记临时放行）。
6. 58 本新秘籍的封面图标未生成，行囊里显示通用卷轴图标；97 张招式图标已生成但未经用户评审。
7. 运行原型里“下一击增强”“暴露”“必定会心”与条件增伤相乘，没有模拟器的 30% 加法池（现有招式同样如此）；第十四式接第十五式、扣刀不发接一刀不虚的单次爆发会高于模拟值，是否统一待平衡确认。
8. 重跑生成链时，`catalog.json` 的清徽阁装备字段顺序、`equipment.md` 与 `weapon.md` 的个别行与改动前不同；用未改动的脚本原样重跑也会出现同样的差异，是此前生成物与脚本不同步留下的，与本轮内容无关。

## 8. 状态

- 本地完成：是（文档、数据、运行原型、模拟器、测试）。
- Git 提交：无（本目录不是 Git 仓库，也没有要求提交）。
- 线上发布：无。
