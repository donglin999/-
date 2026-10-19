# 角色图标必填项写进机器数据（2026-10-20）

状态：现行　最后核对：2026-10-20

## 需求

2026-10-20 用户确认：角色专用图标（状态栏头像、队伍菜单、战斗轮次条共用，出框菱形，按性格专门设计、不从立绘裁切）是所有 `combat=true` 角色的必需素材之一。[角色类型与必需素材](../design/role-assets.md)与[角色图标设计](../../../xiaojianghu-legacy-prologue/docs/design/character-icons.md)已写好，本次把这一项同步进 JSON 机器数据。规则登记表未改（R-文档-02）；未改 `js/`、未登记正式素材、未提交 git。

## 改了什么

| 文件 | 改动 |
| --- | --- |
| `docs/design/character-asset-rules.json` | `card_template` 加 `character_icons: []`；新增 `character_icon_entry_template`（条目字段）、`groups.character_icon`（每阶段 1 张、专门设计不得裁切、透明无框、L/M/S 导出档、三种状态）、`common_conditional` 一条 `combat=true → character_icon`（覆盖我方、同伴、宠物、临时援助、可切磋者、敌人）、`field_constraints.combat_true_icon`、`docs.character_icons` |
| `docs/design/opening-character-assets.json` | 每张卡加 `character_icons`；`combat=false` 的卡为空列表。萧白现代装、萧白借衣、叶蘅、陆衡写“候选，未采用”；拦路帮众、后山野犬写“未生成”。新增 `character_icons_without_card` 记大黄、受惊灰狼（本文件尚无这两人的卡），同样“候选，未采用” |
| `docs/design/character-card-ye.json` | 当前阶段 `rural_healer_opening` 记叶蘅候选，“候选，未采用” |
| `docs/design/character-card-pei-zhigu.json` | `combat=true`，记一条“未生成”，演出方案待设计 |
| `docs/design/character-card-qin-feiyuan.json`、`character-card-ruan-qingque.json` | 当前阶段 `combat=false`，`character_icons` 为空列表；将来临时援助或入队阶段另建卡时再配 |
| `docs/design/role-assets.md`、`xiaojianghu-legacy-prologue/docs/design/character-icons.md` | 各加一句机器字段的引用 |

条目字段：`stage_id`、`required`、`performance_plan`（`personality_basis` 性格依据，`expression`／`pose`／`props`；评审期多版用 `variants`）、`reference_portraits`（相对项目根，带工作区前缀）、`facing`（我方画面左／敌方画面右）、`status`（未生成／候选，未采用／已采用）、`source_batch`、`candidate_ids`、`note`。一张卡一个阶段，换装、长发等新阶段另建卡另配图标，与 role-assets.md 第 1 节“一张角色卡对应一个当前阶段”一致。

## 候选登记

来源批次 `xiaojianghu-legacy-prologue/art_sources/char-icons-20261019/`，第二轮编号取自该目录 `manifest.json`，均为“候选，未采用”，未登记正式素材、未接入游戏：

| 角色 | 候选编号 | 备注 |
| --- | --- | --- |
| 萧白·现代装 | R2_hero_modern_a、R2_hero_modern_b | |
| 萧白·借衣 | R2_hero_village_a、R2_hero_village_b | 只有木棍，无剑 |
| 叶蘅 | R2_ye_a、R2_ye_b | 开篇卡与叶蘅卡两处同记 |
| 陆衡 | R2_luheng_a2、R2_luheng_b2 | 含刀鞘字样的提示词被接口拒，成图去掉兵器描述，是否符合演出方案以评审为准 |
| 大黄 | R2_dog_a2、R2_dog_b2 | R2_dog_a／b 画了设定外饰物，不建议选，未列入 |
| 受惊灰狼 | R2_wolf_a、R2_wolf_b | R2_wolf_a 头部裁切档偏离狼头 |

后山野犬（`wilddog`）不是灰狼，不得用 R2_wolf_* 冒充，状态为“未生成”。

## 检查

- `python3 tools_docs/check_docs.py`：改前改后都是过时说法 0、死链 0、缺状态 0。
- `python3 tools_docs/consistency_check.py --out <临时目录>`：改前改后 warn 0，info 总数相同。
- 脚本核对：所有候选编号都在批次 manifest 里，所有参考立绘路径存在。

## 待办

- 用户评审选定每人一版后，把对应条目改为“已采用”，同时进 `assets/production/` 并登记（R-素材-01）。
- 大黄、受惊灰狼建角色卡时，把 `character_icons_without_card` 里的条目移入卡片。
- 拦路帮众（第二批）、后山野犬、裴知古先按 character-icons.md 第 3.1 节写演出方案。
- `companion-performance.json` 未改：它须与 `art_sources/companion_dialogue_states_20261004/manifest.json` 完全一致（`tools_story/check_dialogue_states.py` 检查镜像），只改一边会报镜像过期；而且它只管六张对白状态。叶蘅、陆衡的图标已记在上面两份卡里。

## 附带情况（需知会）

为确认没碰坏对白状态镜像，本次跑了一次 `python3 tools_story/check_dialogue_states.py`。这个脚本运行时会**覆盖写** `art_sources/companion_dialogue_states_20261004/contract-check.json`（旧内容没有备份，无法还原）。本次结果报错，原因与本次改动无关（本次未改 `companion-performance.json` 与该目录 manifest）：`Roster mismatch`、`Quota mismatch`（人物图谱里的同伴名单与 manifest 的 18 人不一致），以及各状态 `missing runtime`（运行图应是随 2026-10-20 [旧原型归档](2026-10-20-prototype-archive.md)移走了）。现在的 contract-check.json 是这次运行的报告，不代表此前的验收状态。
