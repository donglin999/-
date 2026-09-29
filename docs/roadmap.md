# 路线图与已知问题

## 1. 后续工作

| 优先级 | 事项 | 说明 |
|---|---|---|
| 高 | 其余 5 个旧场景按 v2 管线重建 | 街市 / 偏巷 / 渡口已于 2026-09 用 `tools_scene/` 程序排布重建（见 art-pipeline.md §场景管线 v2）。`temple temple_out gate bgate cave` 仍为旧整图像素化地图（已补精确 mask）：待按同一方法重建（庙内需要柱子/神龛前景遮挡，城门外需与街市北门楼呼应），并补音景（`SCENES` 表）、路人与剧情加厚；`dark/tint` 夜景在 `BRIGHT` 下与明亮角色风格不统一 |
| 高 | 剧情等级下的战斗平衡 | 新战斗系统只在街市评审配置（`reviewStart` 的 Lv1 萧白）下试过；老僧教学战、吴长老、怒晴鸡、渡口/山道狼群、寨门、巨蟒、独眼阎罗在正常剧情等级与装备下未测试。`mkFoe` 的 HP ×(hpMul‖.45)×1.8、攻击 ×(atkMul‖.62) 系数与 `FOE_DEF` 盾值需要整体调 |
| 高 | 未验证的剧情分支 | 青蚨散：婉拒同行 `xq_decline` 后再招募、代付 20 两 `xq_pay` 路线、对质战败 `lost()` 后重试、`xq_fate` 三种处置的后续台词；以及非 `noLose` 战斗失败回庙（银两减半）流程 |
| 中 | 苏芷立绘定稿 | 候选 `assets/review/p_suzhi_alt_{37,58,74}.webp`，当前 `p_suzhi.webp` = 37；定稿后复制并清理候选 |
| 中 | 美术瑕疵 | 说书老伯脸部、奔跑侧视图粗糙、商人 l/r 行疑似颠倒（见 art-pipeline.md §5） |
| 中 | 管线一致性 | `pack.py` 缺 `suzhi`（重跑会丢 `ART.sheet.suzhi`）；`suzhi_sheet.py` 只做到一半；`bright_sprites.py` 默认只处理 6 个角色；`street_layers.py` 已废弃（街市改 v2） |
| 低 | 清理 | 删除运行时不用的 `assets/c_*.webp`（360 个）、`sp_* td_* bg_map`、`game.js` `game.v2.js`、旧战斗 DOM `#blog #border #bhud`、`SKILLS` 中旧格子战斗字段 `range/shape/combo` |
| 低 | 代码小问题 | 见下节 |

## 2. 代码中发现的小问题（未修复）

- `battle()` 中 `battleLoop()` 抛异常会被当作胜利（`catch(e){console.error(e);result='win'}`），可能掩盖 bug 并白给奖励。
- `core.js` 注释称 `#streetbright` 才载入明亮变体、`BRIGHT_CHARS`「为本轮评审出的六个角色」；实际 `BRIGHT=true` 常开、`BRIGHT_CHARS=CHARS`。
- scene.js 注释列出的场景字段 `leaves:true`、`smoke:[[x,y]]` 未被读取（需在 `fx()` 里手动调用）。
- scene.js 的 `SIZE` 表无 `suzhi`（被 `ART.scale.suzhi` 覆盖，不影响显示）。
- `ART.walk/run` 的 `fps` 字段未被使用；art.js 头注释说由 `process_walk.py` 维护，实际 `ART.sheet`/`ART.icons` 由 `pack.py`/`icons.py` 回写，`walk/run` 为手写。
- `thug`/`scarliu` 精灵为 `c_bandit`，因此沿用 `FOE_DEF.bandit` 的盾值、弱点与 25% 馒头掉落。
- 大地图首次去江陵渡口的狼群战未指定 `bg`，按 `'bg_'+S.scene` 取背景；若从 `bgate`/`cave` 出发（无 `bg_bgate`/`bg_cave`），回落为模糊场景地图。
- `battle.js` 的 `cellAt(x,y)` 仅原样返回坐标（名字沿用自旧格子战斗）。

## 3. Changelog（打磨轮次，`git log --oneline`，均为 2026-09-27）

| 提交 | 内容 |
|---|---|
| `c32a3c7` | split modules baseline —— 单文件 `game.js` 拆为 `js/` 下多个模块 |
| `4c3a3b5` | art manifest stub —— 引入 `js/art.js` 美术清单 |
| `ac17e12` | round1 polish: art walk cycles, engine, ui —— 4 帧行走、引擎与 UI 第一轮打磨 |
| `3ed5a2f` | sprite sheets —— 单帧打包为 `s_*.webp` 精灵表（控制发布文件数） |
| `8e7420d` | round2 polish |
| `3156561` | round3 visual (maps pixelized) + partial QA —— 地图像素化管线 `pixmaps.py` |
| `aaee537` | street scene polish: map, occlusion, audio, interactions —— 街市新地图、前景遮挡、音频层、交互 |
| `caa2ca3` | air walls fixed, bright review mode, hero walk 8f, faces —— 精细 mask 修空气墙、明亮评审模式、主角 8 帧行走、补五官 |
| `51c9c7d` | adopt bright style B for street, all chars bright —— 定稿明亮 B 方案，全部角色 `_bright` |
| `55a39a0` | street story arc, suzhi companion, running, octopath battle, art fixes —— 青蚨散支线、苏芷同伴、奔跑、Octopath 式战斗、立绘清理 |
