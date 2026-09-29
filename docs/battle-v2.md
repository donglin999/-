# 战斗表现 v2 改造（参考《八方旅人》）· 分工契约

目标：把战斗从"探索地图上叠小人和调试面板"改成**有舞台、有体量、有镜头、UI 精致**的 HD-2D 风格像素战斗。战斗**规则与数值一律不改**（`battle.md` 中的机制、公式、流程保持不变），只改表现。

## 0. 现状问题 → 目标（摘要）

| 维度 | 现状 | 目标 |
|---|---|---|
| 舞台 | 直接用明亮街景；画了一条地面线和半透明黑块；无纵深 | 每个场景有**战斗专用背景**（低地平线、中场空旷、偏暗有氛围）；景深虚化、调色、脚下光斑、前景雾/尘、暗角；无地面线 |
| 站位/纵深 | 敌我各自平铺，同一平面 | 我方斜线纵深队形、敌方错落；按 y 做缩放与明暗；椭圆阴影落地 |
| 体量 | 敌我同高（150），主角 47px 正常比例 vs 敌人大头 Q 版 | 统一战斗精灵规格；敌人按档位放大（杂兵 ~1.2×、精英 ~1.5×、头目 ~2.2×） |
| 镜头 | 静止 | 2D 镜头：出招推近、破防拉近、回合切换回位 |
| 动作 | 仅主角有动作表；出招是整个人平移滑行 | 全员战斗动作表（待机/冲刺/出招/受击/运功/破防瘫倒/倒下/胜利）；冲刺残影、后跳回位 |
| 演出 | 受击仅闪白；蓄势一圈光；破防只有文字 | 顿帧真正冻结；蓄势分级光柱；破防：盾碎 + 拉镜 + 时停 + 瘫倒；死亡像素碎散；胜利姿势 |
| UI | 右下小卡片、文字方框菜单、敌人头顶黑底意图标签、方框盾行、毛笔字伤害数字、底部说明文字 | 右侧竖排队伍面板（当前行动者外移高亮）、带图标指令菜单、像素图标盾牌/弱点、克制的意图图标、像素描边伤害数字与图形化 WEAK/BREAK、去掉常驻说明 |

## 1. 文件归属（每个文件只由一个工作流修改）

加载顺序（`index.html` 已配置）：`battle.js → vfx.js → bart.js → bstage.js → bui.js → bfx.js → main.js`

| 工作流 | 负责文件（只改这些） | 可覆盖的 battle.js 函数 |
|---|---|---|
| **A 舞台与镜头** | `js/bstage.js`、`tools_fx/gen_battle_bg.py`（及其辅助脚本）、`assets/bb_*.webp` | `drawBattleBg` `layoutUnits` `unitH` `drawStageFront`；赋值 `CAM={...}` |
| **B UI** | `js/bui.js`、`tools_fx/ui_*.py`（若需要）、`assets/ui_*.webp` | `battleCSS` `battleDom` `renderCards` `porFill` `hint` `tyTag` `pips` `allyTurn` `drawOrderBar` `headChip` `drawShieldRow` `drawUnitUI` `drawIntentLines` `ghostTick` `syncCardGhost` `floatTxt` `bpop` `bigText` `showName` `drawFloats` `drawBanner` `drawBig` `victory` |
| **C 演出与特效** | `js/bfx.js`、`js/vfx.js` | `drawUnit` `lunge` `boostFx` `doAttack` `doSkill` `foeAct` `hurt` `heal` `doBreak` `drawParts` `drawBreakFlash` |
| **D 战斗美术** | `js/bart.js`、`tools_fx/*`（除 A/B 的脚本外，含 `hero_battle.py`）、`assets/b_*.webp`、`docs/battle-sprite-spec.md` | 无（只产出数据与素材） |

**禁止修改**：`battle.js core.js ui.js scene.js story.js main.js index.html` 及其他工作流的文件。确需改动时，在最终报告中写明需求，由总控合并。

**覆盖方式**：在自己的文件里用 `function 同名(...){...}` 重新声明（battle.js 中这些都是经典脚本顶层函数声明，后加载者生效）；`CAM` 是 `let`，用赋值 `CAM={...}` 覆盖；`const`（如 `ALLY_SLOTS`）不能重声明，改走 `layoutUnits`。**覆盖时保持原函数的规则/数值逻辑完全一致**，只改表现。

## 2. 跨工作流接口

### 2.1 `BART`（D 产出，C/A 读取）—— `js/bart.js`

```js
window.BART = {
  hero: {
    file: 'b_hero',          // assets/b_hero.webp，单行或多行精灵表
    cell: [147, 141],        // 单元像素（含 3× 放大后）
    cols: 11,                // 每行帧数（多行时按行优先编号）
    facing: 'l',             // 表内角色朝向：我方 'l'（面向左侧敌人），敌方 'r'
    h: 150,                  // 960×540 画布中的显示高度（=单元高度对应的屏幕像素，脚底对齐单元底边）
    tier: 'party',           // party | minion | elite | boss（A 的 unitH 据此与 h 决定尺寸）
    anim: {                  // 每个动作：f 帧序号数组，ms 每帧毫秒，loop 是否循环
      idle: {f:[0,1,2,1,0,3], ms:170, loop:true},
      dash: {f:[...], ms:60},  atk: {f:[4,5,6,7,8], ms:80},  atk2: {f:[5,6,7], ms:60},
      hurt: {f:[9], ms:300},   cast: {f:[10], ms:420},
      brk:  {f:[...], ms:200, loop:true},   // 破防瘫倒
      dead: {f:[...], ms:200},  win: {f:[...], ms:160}   // 可选
    }
  },
  // suzhi, dog, bandit, wolf, chief, snake, monk, beggar, rooster ...
};
```

- 缺的动作由 C 回退：`dash→idle`、`atk2→atk`、`brk→hurt`、`dead→hurt`、`win→idle`；整个角色缺条目 → 用原 `c_{art}_{dir}_0` 静态帧 + 呼吸。
- 精灵表必须是**无平滑的整数倍像素**，脚底基线对齐单元底边，角色水平居中。

### 2.2 `CAM`（A 实现，C 调用）

```js
CAM = {
  update(now), apply(), toWorld(x,y),       // 框架已调用
  focus(x, y, zoom, ms),                    // 平滑移到世界坐标 (x,y) 居中、缩放 zoom（1=不缩放），ms 过渡
  punch(zoom, ms),                          // 在当前基础上瞬时冲击缩放再回弹（破防/重击）
  reset(ms)                                 // 回到全景
};
```
C 在出招/破防/胜利时调用；A 保证 `focus/punch/reset` 不存在时 C 的调用也不报错（C 用 `CAM.focus&&CAM.focus(...)`）。

### 2.3 `BFX`（C 实现，B 调用）

```js
window.BFX = { victoryPose(), onTurnStart(u) }   // 均可选；B 在 victory() 开头 await BFX.victoryPose?.()，在当前行动者切换时调用 onTurnStart
```

### 2.4 `BUI`（B 实现，C 调用）

```js
window.BUI = { weakIcon(type) -> HTMLCanvasElement|Image, breakBanner(u) }   // C 的破防演出可调用 breakBanner 画图形化 BREAK；不存在则 C 自己画
```

## 3. 统一约束

- **画风**：像素画 + 暗调氛围光（HD-2D 感），所有新 UI/特效元素都要像素化（整数倍、最近邻、1px 深色描边），不要矢量柔边、不要系统 emoji。字体：中文用现有 `ZCOOL XiaoWei`/`Noto Serif SC`，数字用像素字（B 实现）。
- **特效等级**：C 必须遵守 `docs/vfx.md` 的 T0–T3 预算与单调性，`VFX.audit()` 零警告。
- **性能**：960×540 画布 60fps；每帧不得新建大画布；模糊等昂贵滤镜只在预渲染/缓存时做。
- **生图**：`tools_por/.env` 的 FlatRouter，模型 `gpt-image-2.5-sunburst`，**每个工作流同时最多 1 个请求**（接口会断连，需重试；已有其他后台任务在用）。生成原图存 `raw_battle/<工作流>/`，参数与提示词记录到同目录 `params.json`。
- **验证**：`node --check` 自己的 JS；`node tools_fx/bt_smoke.cjs <输出目录> [ms] [间隔] [bandits|boss|slow]` 截图并确认 `errors: []`；输出目录用 `review/battle_v2/<工作流>/`。写文件用整文件写入，避免半截状态影响其他工作流的测试。

## 4. 战斗背景映射（工作流 S2 补齐，2026-09）

`battle({bg})` 的 `bg` 可以是 `bb_*`、`bg_{scene}` 或探索地图键 `m_{scene}(_v2)`，也可以不传（battle.js 取 `'bg_'+S.scene`）。`js/bstage.js` 统一解析成战斗背景名：去掉 `bb_/bg_/m_` 前缀与 `_vN` 后缀，再经 `BB_ALIAS`（探索场景 id 与战斗背景名不同的两处）；**只请求 `SC` 氛围表里登记过的 `bb_*`**，未登记的键直接走回退（不发请求、不会 404）。

| 传入键 / 所在场景 | 战斗背景 | 说明 |
|---|---|---|
| `bg_temple` `m_temple` / `temple` | `bb_temple` | 羊太傅庙正殿内（S2 新增） |
| `bg_temple_out` `m_temple_out` / `temple_out` | `bb_temple_out` | 庙外空地 |
| `bg_gate` `m_gate` / `gate` | `bb_gate` | 南门外官道、护城河石桥、城楼（S2 新增；quests 城防营操演用） |
| `bg_street` `m_street_v2` / `street` | `bb_street` | 街市 |
| `bg_alley` `m_alley_v2` / `alley` | `bb_alley` | 偏巷 |
| `bg_ferry` `m_ferry_v2` / `ferry` | `bb_ferry` | 东津渡 |
| `bg_bandit_gate` `m_bgate` / `bgate` | `bb_bandit_gate` | 黑风寨寨门（`BB_ALIAS.bgate`） |
| `bg_bandit_cave` `m_cave` / `cave` | `bb_bandit_cave` | 黑风寨山洞（S2 重生成：全封闭洞穴，无天空） |
| `bb_river` / `crossing` | `bb_river` | 汉水江心渡船甲板（工作流 F，江心截船；`BB_ALIAS.crossing`，`hz .60`） |
| `bb_ferry` / `ferry_e` | `bb_ferry` | 东岸芦苇荡暗桩借用东津渡背景（同一段江岸；`BB_ALIAS.ferry_e`） |
| `bb_road` | `bb_road` | 大地图赶路途中的山道遭遇（ui.js 往东津渡的饿狼战，S2 新增） |

- 回退：`bb_*` 未载入时用传入键的图（旧 `bg_*` 或探索地图）压暗降饱和；再没有就用当前探索场景底图 `SC[S.scene].bg` 模糊铺底。
- `bg_bgate` / `bg_cave` 没有文件（battle.js 不传 bg 时会按场景 id 拼出这两个键）：bstage 在 `bb_bandit_gate/bb_bandit_cave` 载入后把图挂到这两个键上（`NOFILE`），battle.js 就不再去请求。根治应在 battle.js 143 行改为 `opt.bg||'bb_'+BSTAGE.sceneOf()` 一类写法（归总控）。
- 预载：进入游戏 4s 后按 `SC` 表预载全部 `bb_*`（共 9 张，每张 30–40KB）。
- 新增战斗场景：`tools_fx/gen_battle_bg.py` 的 `SCENES` 加一项 → `python3 tools_fx/gen_battle_bg.py all <键> --raw <目录>` → bstage `SC` 表加氛围一行（`hz` 按成图地平线填）。验证：`node review/map_v2/bg_test.cjs`（逐键开战截图、核对实际使用的 bb 键、统计 404）。
