# 2026-10-09 装备清理：删除旧原型装备、持续伤害保命、养成熟练心法加成、好感统一入口

工作区：`xiaojianghu`（历史开篇原型，入口 `index.html?runtimePrototype=1`）。本地完成，未提交、未推送、未发布。

## 需求

用户 2026-10-09 指示：旧原型装备不需要兼容存档（“直接删档都没事”），并处理装备数值 v1 接入后的三个遗留问题。前置记录：[2026-10-08-weapons-runtime.md](2026-10-08-weapons-runtime.md)、[2026-10-08-armor-acc-runtime.md](2026-10-08-armor-acc-runtime.md)。

## 一、删除旧原型人物装备，改用新装备

ITEMS 中删除 11 个旧条目（core.js 5 个、menu.js 6 个）。铜铃颈环 `collar`（大黄用具）和山狼皮 `pelt` 保留。

| 旧 id | 旧名 | 替换为 |
| --- | --- | --- |
| wood | 桃纹木剑 | eq_practice_sword |
| iron | 青锋剑 | eq_clear_sword |
| rusty | 井底锈锋 | eq_clear_sword |
| club | 枣木短杖 | eq_patrol_staff |
| knife | 厚背樵刀 | eq_road_saber |
| needles | 素铜针囊 | eq_needle_roll |
| cloth | 素布短衣 | eq_plain_robe |
| vest | 熟革软甲 | eq_cowhide_guard |
| mianjia | 絮麻夹衣 | eq_padded_coat |
| charm | 安行符 | eq_sandal_beads |
| jade | 兰纹青佩 | eq_jade_thumb |

### 替换处清单

| 文件 | 位置 | 改动 |
| --- | --- | --- |
| `js/core.js` | ITEMS | 删除 wood / iron / rusty / cloth / vest；`derived()` 对找不到的装备 id 不再抛错 |
| `js/menu.js` | 扩充物品 | 删除 `Object.assign(ITEMS.wood…)` 品质补丁和 club / knife / needles / mianjia / charm / jade 定义；ICO 去掉对应字形 |
| `js/menu.js` | `MN_SMITH` 铁匠货单 | 换成 eq_patrol_staff、eq_practice_sword、eq_road_saber、eq_needle_roll、eq_clear_sword、eq_plain_robe、eq_padded_coat、eq_cowhide_guard、eq_sandal_beads、collar、eq_jade_thumb |
| `js/menu.js` | 空装备槽示意图标、江湖菜单“装备”入口图标 | iron / vest / jade → eq_clear_sword / eq_cowhide_guard / eq_jade_thumb（新装备图标） |
| `js/menu.js` | 章节结算给 `ITEMS.rusty` 追加“半截龙尾”描述 | 删除；线索改写进井底台词（见下） |
| `js/menu.js` | 新增 `MN_LEGACY_GEAR`、`mnDropGone(s)` | 存档残留：主角、同伴、宠物装备槽里找不到的 id 置空；背包里的 11 个旧 id 删除。`mnEnsure()` 开头调用 |
| `js/jianghu-model.js` | `normalize()` | 同样调用 `mnDropGone` |
| `js/story.js` | 庙外古井 | 台词改为“摸到一柄裹着井泥的长剑。擦净剑身，锋口仍亮，剑格上隐约刻着半截龙尾。”，给 eq_clear_sword（原 rusty） |
| `js/story.js` | 铁匠 `shop(n,[…])` | wood / iron / cloth / vest → eq_practice_sword / eq_clear_sword / eq_plain_robe / eq_cowhide_guard |
| `js/quests.js` | 铁匠支线结账 | 给 eq_plain_robe；选项文案与价格读 `ITEMS.eq_plain_robe` 的名称、价格；报酬说明改为“或一件练功短衣” |
| `js/containers.js` | 借宿衣柜、赠衣箱、喽啰衣柜 | `{cloth:1}` → `{eq_plain_robe:1}` |
| `js/ui.js` | 旧 ICO 字形表 | 去掉 wood / iron / rusty / cloth / vest |
| `js/npc-arts.js` | 铁匠劝说优惠与可窃物 | cloth → eq_plain_robe，文案“练功短衣”（该模块当前未被 index.html 加载） |
| `js/equipment-runtime-register.js` | 文件注释 | 说明旧条目已删除 |

逐处确认后**未改**的同名标识（不是装备道具）：养成资源 `resources.cloth`（素织布料，cultivation-core / cultivation-data / cultivation-mail）、序章受托布包 `errands.cloth`、地图道具坐标键 `cloth`（prologue-map、chapter1-maps）、`skill-polish.js` 与 wuxia-fx 的色带名 `wood` / `jade`、CSS 类 `jade`、图集坐标 `menu-icons.js` / `art.js` 的 wood、iron 等美术键、`jianghu-ui.js` 中 qh_practice_staff 借用的图集键 `club`。这些都是美术或资源键，保留。

开局：本原型新开局本来就不发初始装备（`newState()` 的 weapon / armor 为 null，没有其他初值写入点），本次没有新增。

## 二、持续伤害触发保命

现行持续伤害并不在“回合开始”结算：`battle.js` 中单位行动后 `tickBuffs` → `BattleRules.afterAction` → `dotHurt` 直接扣血，不经过 `hurt` / `guardDeath`。

`equipment-runtime-register.js` 把护心镜坠的判定抽成 `lastStandCut(t,d)`、扣血后的处理抽成 `afterHpLoss(t)`，受击（guardDeath / hurt 包装）和持续伤害（新增 `dotHurt` 包装）共用：

- 护心镜坠：致命伤以 1 点气血撑住并回复 15%，与受击共用 `t._gLs`，每战一次。
- 归途佩：气血首次跌破三成自动卸力 40%，与受击共用 `t._gLsu`，每战一次。
- 两件同戴：仍由 `sum()` 互斥，只保留撑住（较强）。
- 只作用于我方，敌人持续伤害不变。

## 三、养成接入熟练与心法加成

养成里实际产生进度的位置在 `cultivation-core.js`：

- `resolve()`：`gain = round(amount × 心情倍率)` 写入 `s.progress[a.gain]`，结果提示显示“试锋剑法 +N”。
- `growth()`：招式熟练（试锋剑法 K01、守拙拳法 K02）与吐纳心法（B01，对应心法 tuna 层数）的 xp 由付费历史推出，原来每次（受教那次除外）固定 25。

改动：

- 新增 `gearMultiplier(a,options)`：K01 / K02 取熟练系数，B01 取心法系数，其他项目为 1。系数来自 `options.gear`，否则读 `CultivationCore.gearMul(kind)`；`equipment-runtime-register.js` 把它设为主角本人的 `func.profMul('hero')` / `func.xinfaMul('hero')`（养成中只有主角练功）。
- `resolve()`：成果 `gain = round(amount × 心情倍率 × 装备系数)`（取整同原规则）；系数不为 1 时结果带 `gearKind`、`gearMultiplier`，历史行记 `xp = round(25 × 系数)`。
- `growth()`：熟练按历史行 `xp` 累加（旧行没有 xp 按 25），受教那次仍不计，上限不变（招式 125、吐纳 75）。由存档历史推出，重载不会重复发放。
- `cultivation.js` 结果提示追加“佩饰熟练加成 +N%”或“佩饰心法加成 +N%”；修行记录、江湖菜单里的熟练进度直接读 `growth()`，自动同步。养成信件不涉及熟练或心法，没有改。

例：书院闲章（熟练 +10%、心法 +25%）时，试锋剑法一次成果 8 → 9、熟练 25 → 28；吐纳一次熟练 25 → 31。

## 四、好感加成覆盖全部写入点

盘点结果（grep aff / favor / bond / relation / 好感 / 关系 等）：

| 写入点 | 数值 | 接入方式 |
| --- | --- | --- |
| `story.js aff(d,id)` | `S.aff`（苏芷；quests.js 的老僧问脉也经它） | 原有包装，走 `func.affAdd` |
| `npc-arts.js relation(n,delta)` | `S.npcArtRelations`（NPC 关系，−5～5） | 正向调用 `window.gearAffGain(delta,'npc:'+key)` |
| 养成模块 | 无好感 / 关系数值：来访只记 `facts.met_*` 与选择，送礼只给“通信”进度 | 无需接入，没有新造数值 |
| 同伴传授 / 请教、品德、结局 | 只读 `S.aff` | 不涉及 |

`window.gearAffGain` 与 `aff()` 包装都调用同一个 `func.affAdd`：队伍合计、上限 30%，只放大正向，扣减原样；小数按写入对象分开累计在 `S.affFrac`。每个写入点只经过一次，没有重复加成。新增测试会扫描 js 源码，若出现新的 `S.aff` 或 `npcArtRelations` 写入点会失败。

## index.html 版本号

core、ui、story、quests、menu、containers、jianghu-model、cultivation-core、cultivation、equipment-runtime-register 统一改为 `?v=20261009-eq-cleanup`。npc-arts.js 不在 index.html 中。

## 测试

新增 `tests/equipment-cleanup.test.cjs`（5 项：旧 id 不在 ITEMS、货单与剧情给物、存档丢弃、养成熟练心法系数与取整、gearMul 注入与恢复）；`tests/armor-acc-runtime.test.cjs` 新增 4 项（持续伤害撑住 / 卸力、养成系数注入、好感统一入口、写入点盘点）；按新 id 更新 weapons-runtime、armor-acc-runtime、cultivation-jianghu-modern、cultivation-formal-martial、npc-arts、menu-icons、xiangyang-combat-balance 和夹具 `tests/support/jianghu-dom-harness.cjs`（夹具同时加载装备运行时与注册脚本）。

全部通过（node --test）：equipment-cleanup 5、armor-acc-runtime 14、weapons-runtime 12、runtime-moves 11、runtime-hearts 6、battle-weakness-status 10、battle-auto 1、cultivation-jianghu-modern 7、cultivation-formal-martial 12、martial-manuals 7、martial-lineage-v3 7、cultivation 10、cultivation-energy 12、cultivation-direct-result 3、cultivation-v5 3、cultivation-story 8、cultivation-visitors 8、cultivation-plot-trigger 7、cultivation-mail 7、cultivation-mail-classic 5、cultivation-mail-classic-dom 22、npc-arts 1、combat-sim 6、side-run-arms 1、pre-xiangyang-training 8、prologue-arrival 11、prologue-backhill 7、prologue-review-driver 4、prologue-story-battle 13、prologue-teaching-integration 5、prologue-water 5、opening-asset-registration 1、opening-battle-heights 3、opening-battle-stage 6、opening-character-art 5、opening-delivery 1、opening-dialogue-regression 3、opening-fire-audio 1、opening-motion-controller 5、opening-motion-trial 7。`node tests/battle-error-regression.cjs` 通过；`node tests/xiangyang-combat-balance.cjs` 正常跑完（新初始兵器、护具下各场 5/5 胜）。

未通过 / 跳过（与本次改动无关，未处理）：

- 依赖本机缺失的 playwright（`/private/tmp/claude-501/pw/node_modules/playwright`）而跳过：menu-icons、prologue-collision、prologue-village、containers、xiangyang-slice。
- 养成浏览器脚本（cultivation-action-loop、-scale、-hud-style、-module-review、-local-motion、-v5-handoff、-v2/-v5/-v8-browser 等）：直接访问 `http://127.0.0.1:8149/?…#cultivation`，没带 `runtimePrototype=1`，被统一入口拦下后 30 秒超时。
- cultivation-rig-trial：`js/cultivation-presentation.js` 哈希漂移（本次未改该文件）。
- opening-motion-v11 地面尘土 1 项、chapter1 商人问答 1 项：断言内容与装备无关。

## 浏览器验证（8149 seed 标签页，`index.html?runtimePrototype=1`）

- `#street` 新开局：脚本均为 `?v=20261009-eq-cleanup`（10 个）；ITEMS 中 11 个旧 id 全部不存在；初始装备三槽为空，背包 `{bun:2}`。
- 铁匠商店实际列表：截江棍、竹纹练剑、护行刀、理针囊、清流剑、归谷短衣、行旅夹衣、牛皮护心甲、檀木手串、铜铃颈环、青玉扳指，以及青铁短铲、金疮药、竹叶青、羊肉笼饼。
- 模拟旧存档：`S.weapon='iron'`、`S.armor='vest'`、背包 cloth → `mnEnsure()` 后两槽为 null，cloth 已删除，无报错。
- 开战：装备清流剑与护心镜坠，`gearMods.ids` 正确；主角气血 5、中毒 3 层时行动后结算持续伤害，以 1 点撑住并回复（168×15%=25，中毒受治疗 −20% 后 +20），最终 21，`_gLs=1`。
- `#cultivation`：佩戴书院闲章，`CultivationCore.gearMul` 返回熟练 1.1、心法 1.25；吐纳第二次成果 10、熟练 31；通过界面点“招式 → 试锋剑法”练一次，成果 9、本次熟练 28，剑法熟练 0 → 28。
- 页面 error 事件与控制台错误：无。
- 结果提示里的“佩饰熟练加成”只用源码断言核对，浏览器里没有截到这段提示文字。

## 仍存在的问题

- 旧原型开局不发任何装备，“替换后的初始装备”只有商店、剧情、容器、任务四个来源；是否要给开局配一把练剑需要另行决定。
- 新装备价格、属性门槛和旧物不同：铁匠支线的短衣价值从 20 两变为 30 两；井底所得清流剑要求身法 5（古井本身要求身法 6，不冲突）；铁匠劝说优惠价仍是 16 两。
- 装备名称正在评审，台词中用到名称的地方（铁匠支线）读 ITEMS 动态显示；报酬说明和劝说文案写的是通用的“练功短衣”。
- `npc-arts.js` 尚未接入 index.html，NPC 关系加成只经过 node 测试验证。
- 图集 `menu-icons.js` / `art.js` 里旧装备的坐标键保留，作为美术键使用（江湖界面中 qh_practice_staff 仍借用 club 图标）。
