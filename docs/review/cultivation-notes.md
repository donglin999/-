# 培养模式移植记录与约定

状态：进行中　最后核对：2026-11-03

本页是培养模式（plan.md 第 23 项）子任务的移植约定与进度。原版只读：`xiaojianghu-legacy-prologue/js/`。

## 1. 模块对应（一个原版全局 → 一个 GDScript 文件）

原版每个 JS 文件是一个 IIFE，挂一个 `window.Xxx`。Godot 里一个全局对应 `game/scripts/cultivation/` 下一个文件、一个 `class_name`，**导出函数同名（保留 camelCase）、参数顺序相同**，写成 `static func`；原版可选参数给缺省值。内部函数也写成 static，名字前加 `_`。

| 原版全局 | 原版文件 | Godot 文件 | class_name | 负责 |
| --- | --- | --- | --- | --- |
| CultivationCore | qh-mode-cultivation-core.js | cu_core.gd | CuCore | 逻辑一 |
| CultivationBalance | qh-mode-cultivation-balance.js | cu_balance.gd | CuBalance | 逻辑一 |
| CultivationGrowth | qh-mode-cultivation-growth.js | cu_growth.gd | CuGrowth | 逻辑一 |
| CultivationRelations | qh-mode-cultivation-relations.js | cu_relations.gd | CuRelations | 逻辑一 |
| CultivationData | qh-mode-cultivation-data.js | cu_data.gd | CuData | 逻辑一 |
| QiheCultivationBridge（migrate、derived 加成等，不含界面） | qihe-cultivation-bridge.js | cu_bridge.gd | CuBridge | 逻辑一 |
| 旧版 CultivationCore/Data（迁移用） | qihe-cultivation-core.js、qihe-cultivation-data.js | cu_legacy.gd | CuLegacy | 逻辑一 |
| CultivationVisitors | qh-mode-cultivation-visitors.js | cu_visitors.gd | CuVisitors | 逻辑二 |
| CultivationDialogue | qh-mode-cultivation-dialogue.js | cu_dialogue.gd | CuDialogue | 逻辑二 |
| PreHangao | qh-pre-hangao.js（数据 qh-pre-hangao-data.js） | cu_pre_hangao.gd | CuPreHangao | 逻辑二 |
| PeiCompanion（含 runtime） | pei-companion.js、pei-companion-runtime.js | cu_pei.gd | CuPei | 逻辑二 |
| SharedInsightPool | shared-insight-pool.js | cu_insight.gd | CuInsight | 逻辑二 |
| CharacterGrowth / CharacterCondition | character-growth-state.js | cu_char_growth.gd | CuCharGrowth | 逻辑二 |
| 宠物 | pets.js | cu_pets.gd | CuPets | 逻辑二 |
| CultivationHousehold | qh-mode-cultivation-household.js | cu_household.gd | CuHousehold | 谷内剧情 |
| CultivationScripts | qh-mode-cultivation-scripts.js | cu_scripts.gd | CuScripts | 支线剧情 |
| CultivationScenes | qh-mode-cultivation-scenes.js | cu_scenes.gd | CuScenes | 支线剧情 |
| CultivationSide | qh-mode-cultivation-side.js | cu_side.gd | CuSide | 支线剧情 |
| CultivationNeighbors | qh-mode-cultivation-neighbors.js | cu_neighbors.gd | CuNeighbors | 支线剧情 |
| CultivationMentors | qh-mode-cultivation-mentors.js | cu_mentors.gd | CuMentors | 支线剧情 |
| CultivationPresentation | qh-mode-cultivation-presentation.js | cu_presentation.gd | CuPresentation | 演出美术 |
| CultivationMotion（含 MotionData） | qh-mode-cultivation-motion*.js | cu_motion.gd | CuMotion | 演出美术 |
| CultivationActionArt | qh-mode-cultivation-action-art.js | cu_action_art.gd | CuActionArt | 演出美术 |
| CultivationRigTrial（及其对 ActionArt 的替换） | qh-mode-cultivation-rig-trial-art.js | cu_rig_trial.gd | CuRigTrial | 演出美术 |
| CultivationActivityArt | qh-mode-cultivation-activity-art.js | cu_activity_art.gd | CuActivityArt | 演出美术 |
| CultivationMinigames | qh-mode-cultivation-minigames.js | cu_minigames.gd | CuMinigames | 演出美术 |
| 汉皋前立绘 | pre-hangao-art.js | cu_pre_hangao_art.gd | CuPreHangaoArt | 演出美术 |
| （画布控件，代替 `<canvas data-art…>`） | — | cu_art_canvas.gd | CuArtCanvas | 演出美术 |
| CultivationStory（对白卡、Q 版人物舞台） | qh-mode-cultivation-story.js、-story.css、-actors.css | cu_story.gd | CuStory | 剧情界面 |
| CultivationMail | qh-mode-cultivation-mail.js、-mail.css | cu_mail.gd | CuMail | 书信武学 |
| CultivationMartial | qh-mode-cultivation-martial.js | cu_martial.gd | CuMartial | 书信武学 |
| CultivationLibrary | qh-mode-cultivation-library.js | cu_library.gd | CuLibrary | 书信武学 |
| Cultivation（主界面、render、perform、onClick）+ bridge 的 enter | qh-mode-cultivation.js、qh-mode-cultivation.css、qihe-cultivation-bridge.js | cultivation.gd（自动加载 Cultivation）、可拆 cu_hub*.gd | — | 主界面 |
| 公用工具 | — | cu_db.gd | CuDB | 已有 |

## 2. 写法约定

1. **数据**：原版数据部分已在 `game/data/runtime/globals.json`，用 `CuDB.t("CultivationData")` 取（整数已转 int，只读；要改先 `CuDB.copy`）。原版数据里的函数（导出为 `{"__fn": 名}`，如 CultivationScripts 各 block 的 `when`）由所属模块用 GDScript 函数实现，按 id/下标查表。缺的字面量抄成 `game/data/cultivation/<模块>.json`。
2. **存档**：`G.S.cultivation` 即原版 `S.cultivation`，字段同名。原版 `persistState(S)` → `G.save()`。
3. **异常**：原版 `throw Error(msg)` → `return CuDB.fail(msg)`；调用可能失败的函数后 `if CuDB.error != "": return null` 往上传。原版 `perform` 的 try/catch → `Cultivation.perform(fn)`：先快照 `G.S.duplicate(true)`，`CuDB.clear()`，执行，`CuDB.error` 非空就整份回滚并提示 `操作未保存，已还原：{msg}`。
4. **数值**：JS 除法是浮点，GDScript int/int 截断——照原版写 `float()`；`Math.floor/round/ceil` → `floori/roundi/ceili`（JS 负数 .5 的 round 与 roundi 不同，遇到时注明）；`Number.isInteger` → `CuDB.is_int`；`Math.random` → `randf()`；`Date.now()` → 存档用 `CuDB.now_ms()`，动画计时用 `Time.get_ticks_msec()`。
5. **缺键**：JS 读不存在的字段是 undefined——一律 `d.get("k")`/`d.get("k", 缺省)`；`??`/`||` 照语义写。`Object.keys` 顺序 = Dictionary 插入顺序，与 JSON 一致。
6. **界面**：1280×720 基准、CSS px 直接用（见 dev-conventions.md §3）。原版 HTML 里 `data-cu="命令"` 加其他 `data-*` 的按钮，点击时一律调 `Cultivation.on_cu(命令: String, data: Dictionary)`（data 是去掉 `data-` 前缀的其余属性），与原版 `onClick` 的分派一致；主界面实现 `on_cu`。书信的 `data-mail` 由 CuMail 自己处理（原版 `M.bind`）。
7. **画布**：原版 `<canvas class="cu-art" width=W height=H data-art=… data-action=… data-index=…>` 及动作的 `<canvas data-clip|data-ui-icon|data-ui-piece>` → `CuArtCanvas.make(attrs: Dictionary, canvas_w: int, canvas_h: int) -> Control`；attrs 为去掉 `data-` 前缀的属性（另可带 `"class"`），控件按自身尺寸缩放绘制内部 W×H 画布并自己逐帧重绘。`.cu-environment` 环境层 → `CuPresentation.environment(attrs) -> Control`。`P.mount(host,onTick)` → `CuPresentation.mount(host, on_tick: Callable)`（每帧调 on_tick(now_ms)）、`CuPresentation.stop()`。
8. **剧情对白卡**：原版 `Q.render(root, opts)` → `CuStory.render(host: Control, opts: Dictionary) -> Control`，opts 字段与原版相同；卡上按钮走 `Cultivation.on_cu`。
9. **书信面板**：原版 `M.mount(root, {kind, s, ...})` → `CuMail.mount(host: Control, opts: Dictionary)`；`M.bind` 的点击由 CuMail 内部处理；其余导出（reset、canGift、canSendLetter、isBagOpen、closeBag、handleAction…）同名 static。
10. **注释**写明原版文件与函数；界面文字、提示语、台词照抄原版，不改写、不新编；不新做特效美术。
11. **检查**：在 `game/` 跑 `godot --headless --path . --import 2>&1 | grep -E "SCRIPT ERROR|Parse Error"`。别的子任务的文件可能还没写完，引用他人模块里尚不存在的函数产生的报错先记下，在汇报里列出，由主会话合并时解决。

## 3. 进度

（各子任务完成后由主会话汇总。）

### 3.1 第三次派出的做法与进度（单人接手全部模块）

- **剧情脚本决策表**：原版 `CultivationVisitors.script(id, context)` 是按 context 分支拼台词的 JS 函数（师门、支线、串门、师承、前寒皋、来客都走它）。为保证台词一字不差，不手抄：`game/data/cultivation/_gen/gen_scripts.cjs` 在 node 里直接跑原版函数，用 Proxy 记录读到的 context 路径、按取值域穷举，输出 `game/data/cultivation/scripts.json`（111 段剧情、161 个版本）。Godot 端 `CuVisitors.script(id, ctx)` 按同样的 context 查表（数值路径取“不大于实际值的最大代表值”）。原版剧情改了要重跑：`node game/data/cultivation/_gen/gen_scripts.cjs`。
- 逻辑层已写完：cu_db、cu_balance、cu_growth、cu_relations、cu_visitors、cu_household（函数部分）、cu_pre_hangao、cu_pei、cu_scenes、cu_core。
- **逻辑对照**：`_gen/simr.cjs <种子>`（node 跑原版）与 `godot --headless --path game -- --cultivation=random1,2,3`（cu_selftest.gd，同一随机数、同一顺序）各自从拜师随机玩满三年，整份存档写到 `/tmp/cu_web_N.json`、`/tmp/cu_godot_N.json`，`python3 _gen/diff.py N` 逐字段比对。种子 1–8 全部一致（唯一差异 `preHangao.weapon`：node 里没有 ITEMS，Godot 结果才与浏览器一致）。
- 界面层（主界面、剧情卡、书信、演出）：见下文。

### 3.2 界面层（第三次派出完成）

培养层坐标按原版 `#cultivation` 的 1920×1080 写（`CuUI.CQW = 19.2`，1cqw = 19.2px），整层 CanvasLayer 20 缩放 0.5 贴到 960×540 视口。实际文件与上表的规划不完全相同，以下为准：

| 原版 | Godot 文件 | 内容 |
| --- | --- | --- |
| qh-mode-cultivation.js（render/perform/onClick/tick/keydown）+ bridge.enter | cultivation.gd | 入口 enter/debug_start、render 分派、动作、计时结算、战斗与修习、键盘 |
| 同上 renderBase/board/panel 等部件 | cu_hub.gd、cu_hub_place.gd | 背景、日历、体力、心情、底栏、行卷板、面板、结果卡 |
| 同上各 render*() 视图 | cu_hub_views.gd | 入门、来客、提亲、送达、告示、休息、月结、出发、行路、结业、设置、小游戏、选单、散步回顾 |
| qh-mode-cultivation-story.js/.css、-actors.css | cu_story.gd、cu_motion_fx.gd、data/cultivation/actor_layout.json | 对白卡、Q 版舞台、立绘动作 |
| qh-mode-cultivation-mail.js/.css | cu_mail.gd | 书信、送礼、收信、包裹 |
| ActionArt / RigTrial 六帧 | cu_clip.gd | 活动动画 |
| qh-mode-cultivation-minigames.js | cu_minigames.gd | 四个候选小游戏（逻辑逐行照抄，界面照 .mg-* 样式） |
| — | cu_ui.gd | 尺寸换算、按钮、图集等工具 |
| — | cu_uitest.gd | 调试：`--cultivation=uitest<N>` 先巡检各栏目、按原版解法玩完四个小游戏，再随机点 N 步，抓运行时报错 |
| — | shaders/cult_*.gdshader | 心情遮罩、地点图标、包裹羽化 |

检查：import 无编译错误；`--cultivation=random1,2,3` 三个种子都跑满 36 月；`--cultivation=uitest500` 从第 0 月推进到第 1 月，经过活动结算、来客、送礼、写信、设置、小游戏，没有运行时报错。截图对照尚未做（沙箱无窗口）。

### 3.3 已知差异

- 字体：原版是楷体，工程没有，统一用 UI.serif。
- CSS 近似：气泡尾巴、径向/线性渐变（改为纯色）、ridge 边框、撕纸墨签 clip-path、选项纸条 SVG、心情头像 saturate（改为调暗）。
- 小游戏：原版拖放（drag/drop）没做，只保留点击与键盘（原版两种都支持，结果相同）；棋盘格渐变改为纯色。
- 调试日程开关不持久化（原版存 localStorage）；声音开关用 AudioServer bus0 静音。
- 角色语音 CharacterVoice 没接。邮箱物品图标只有可赠三格有图。
- 包裹打开时，外壳按钮以 disable 模拟 inert。
- 书库、武学没有单独界面：原版通过设置“武学与装备”打开江湖页 skill 标签，已照做。
- 尚未单独移植：pre-hangao-art、shared-insight-pool、character-growth-state、pets（养成主流程目前不依赖它们）。

### 3.4 需要主会话补的核心接口

- Menu 关闭时的回调或信号（现在靠轮询 `Menu.s.open`）。
- 统一的“回到标题”接口（现在直接实例化 `res://scenes/title.tscn`）。
- Battle.start 需支持 `opt.guiyunHero / heroPor / temporaryDou / training.result`。
- G.derived 的养成加成依赖 battle 的 Stats；仇怨读 `G.S.qiheBond` 与 `DB.g("QIHE_NPC_DATA")`；CuPei 读 `DB.ITEMS`。

## 4. 精修（第四次派出，2026-11-03）

依据 `docs/specs/layout/cult-entry.json`、`cult-hub.json`、`cult-p0…p7.json`（1280×720 实测）。换算：培养层 1920 宽，原版 1px = 1.5 培养层像素（`CuUI.PX`），cqw 仍为 19.2。

**原版实测要点**：关掉“谷中消息”后，师门剧情（江采薇在厨房煮拜师面）自动开场，底栏全部禁用；所以 p0…p7 与 hub 完全相同（JSON 只差心情头像动画 1px）。Godot 端行为一致：点底栏不响应。

**调试截图入口**：`godot --path game -- --cultivation=shot:<entry|hub|p0…p7>`（cu_shot.gd）。存档同 `--cultivation=1`；hub 先点“知道了 · 继续培养”，pN 再点底栏第 N 个（按真实按钮，禁用就不响应）。追加 `:dump`（如 `shot:hub:dump`）会把可见元素按 1280 坐标打印后退出，headless 下即可与 JSON 逐项比对。

**改动**：
- `CuUI.fs` 的上下限按原版 px×1.5 换算（原先把 px 当培养层像素，大字号被截小）；新增 `CuUI.lh`/`vlabel`/`orn_box`，新文件 `cu_text_box.gd`（按 CSS line-height 计盒高、字形居中）。
- 通用按钮：字号继承 clamp(14px,1.35cqw,26px)，padding .4em .8em，边框/圆角/阴影按 px 换算，字距 .02em。
- 面板 `.cu-overlay`：边框 6px 计入内距，标题行高 1.45、底线前 .5em、正文前 .6em、段距 .7em，按钮左对齐按字宽（实测 170×44 已一致）。
- 日期牌两列竖排按 1.12 行宽 + .16em 间隙居中；“舒畅”心情签竖排居中（字距 .05em）；“萧白”名签、“体力”签的花饰改为宽×宽正方形居中溢出（原先被压成扁框里的小方块）。
- 底栏墨签按 rig-trial-v1 规则：高度随字、垂直居中、padding .3em .18em、字距 .06em（实测三字 20×51、两字 20×37 已一致）；栏间距取整修正。
- 剧情气泡：边框 2px 计入内距，h2 行高 1.2、下距 .3em，正文 1.4 行高、左右内距 .5em/.8em；继续热区改为盖住气泡内框（原先被内边距挤成 0 大小），▾ 位置对齐；地点牌内距 .25em .65em .3em、字距 .08em。

**对照结果（dump 与 JSON）**：入口弹窗框、标题、按钮一致；正文纵向累计偏 1–2px。主界面日期、体力、心情、名签、设置、底栏、气泡、热区、▾、地点牌误差 ≤1px。

**未能对齐 / 已知差异**：
- 剧情立绘在 Godot 中不显示：工程 `game/assets` 缺 202 张原版培养素材（`hero-empty` 19 张、`household-v1` 174 张带心情立绘、`mood-avatars-v1/*_fx`、三季山景背景等），清单见 `game/data/cultivation/missing_assets.txt`，需主会话从原版同路径拷入。拷入后立绘宽度会自然对上（现在无图时按 0.6 宽高比占位）。
- 字体：楷体缺失，用 UI.serif，按钮/文字宽度因字形不同略有出入。
- 各活动面板（picker）在本存档下原版也打不开（被师门剧情锁住），没有实测数据，未逐项精修。
