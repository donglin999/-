# 2026-10-08 v3 内功接入运行时（含秘籍、投放、封面）

范围：`xiaojianghu` 历史原型（`?runtimePrototype=1`）。不是栖河试玩版。本地完成；未提交 Git、未发布。

## 需求

把已定的 v3 心法（20 门，HEARTS-NUM-2）接入运行时心法表 `XINFA`，主动技接入功法结构的内功主动机制；补齐秘籍、投放与封面；测试与浏览器验证。

## 核对过的文档

`docs/ai-onboarding.md`、`martial-review/hearts-numbers.md`、`hearts-naming.md`、`catalog.json` / `lineage-v3-moves.json` 的 hearts、`skill-text-v4.json`、`martial-lineage.md` §3.2 / §5、`secret-manuals.md`、`manual-placement.md`、`tools_balance/combat_sim.cjs`（治疗基值与效果语义）。

## 改动

- 新增 `tools_docs/build_runtime_hearts.py` → 生成 `js/martial-hearts-runtime.js`（index.html 中在 martial-structure.js 之前加载）。
- 与旧心法关系（详见 [内功接入运行时](../design/martial-review/hearts-runtime.md)）：旧门派 12 门保留；`xf_tuna`《吐故纳新篇》即运行中的 `tuna`，保留 id、改用 v3 名称与数值（内力上限每层 5%→3%，五层战后回血 20%→15%）；其余 19 门以 `xf_*` 新增。`bx_xin` 本草经是 `xf_baicao` 青囊养元经的前身，保留不合并。运行时共 32 门。
- `js/martial-structure.js`：specs 并入 v3 规格；注册处带上效果列表、目标、完整被动说明；`doSkill` 内功分支新增 `innerV3`（20 种效果类型）；新增被动钩子（tickBuffs、foeHitDmg、foeAct、strike、reveal、doBreak、heal、mnSettle、BattleRules.moveInflict / foeInflict / mpCost）；对敌内功目标预览改为零伤害预览，修复选目标时 `v.hits` 空值报错。未改 syncArts、annotate、lockReason 等外功逻辑，未改 battle.js / bfx.js / vfx.js / wuxia-*.js / bui.js。
- `js/martial-manuals.js`：没有来源记录的心法（家传）不注册秘籍；心法秘籍品阶取 `grade`。
- `tools_docs/build_manual_placement.py`：新增 `v3_inner_rows`；`tuna` 名称改为吐故纳新篇。重跑生成 `manual-placement.json`、`docs/design/manual-placement.md`、`js/martial-manual-sources.js`。
- `tools_docs/gen_manual_icons.py`：v3 心法封面意象用 `icon_subject`、主色取门派配色；生成 18 张 → `art_sources/manual_icons_v1/mj_xf_xf_*.png`（附 .prompt.txt / .json / .codex.log）；`build_manual_icons.py` 重跑，运行图标 85 张，缺图 0。
- `index.html`：仅在 martial-structure.js 那一行插入 `martial-hearts-runtime.js`，并同步该行版本号（hearts-rt2 / hearts-rt1）。
- 文档：新增 `martial-review/hearts-runtime.md`；同步 `secret-manuals.md`、`hearts-numbers.md`（及其生成脚本的状态句，未重跑该脚本）、`hearts-naming.md` 补记。
- 测试：新增 `tests/runtime-hearts.test.cjs`；扩展 `tests/martial-manuals.test.cjs`。

## 美术（采用待人工确认）

封面 18 张由 `codex exec` 内置 image_gen 生成（服务端选模型；提示词含 gpt-image-2.5 要求，未经核实为该模型），参考图 `art_sources/xiangyang_icons_v3/style-approved.png`。总览检查：书皮按品阶（丙蓝布、乙青绢铜角、绝紫檀书匣）、题签空白无字、封面意象与 icon_subject 一致，未发现需重画的；已整理进 `assets/ui/manuals-v1/`，属“已接入原型”，不等于美术验收通过。

## 验证

- `node --test`：runtime-hearts 6/6、martial-manuals 7/7、cultivation-jianghu-modern 7/7、martial-lineage-v3 7/7、battle-weakness-status 10/10、pre-xiangyang-training 8/8、cultivation-formal-martial 12/12；`node tests/battle-error-regression.cjs` 通过。
- 浏览器（8149，`index.html?runtimePrototype=1#street`）：S.chapter=2 后放入 5 本 v3 秘籍，B 打开行囊，封面显示正常，研习确认后学会、书保留；武学页内功分页列出 v3 心法与图标，“设为主修”（同气连枝篇，弹出改修确认）与“设为辅修”（地籁诀）切换成功；`battle({bg:'bg_street',foes:[mk('bandit')]})` 中武学菜单出现“同担”“听风”，施放听风看破两处弱点、内力 −8、冷却登记，随后自动战斗胜利结算；本次页面无脚本错误。
- `tests/menu-icons.test.cjs` 需要本机不存在的 Playwright 路径，未运行。

## 未完成 / 问题

- 条件被动未实装：出岫心经、万壑归元诀的守势获得与消耗；霜弦真气未受伤蓄锋；负岳功援护后拳招增伤；归藏息经针线／医线回内（运行时缺对应规则或分类）。
- 偏差：出岫心经定神沿用现有 +30%/−20%（设计 +25%/−15%）；“行动前移一位”用先手代替；援护类招式判定为近似。
- 主角没有 `S.sect`，归云谷心法暂不能主修；v3 心法的取得事件尚未进事件排期。
- 新版江湖界面研习心法秘籍的确认文案写“学会第一重”，心法应为“第一层”（jianghu-ui，未改）。
