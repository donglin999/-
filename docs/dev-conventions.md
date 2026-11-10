# 开发约定（移植原版 JS 到 GDScript）

状态：现行　最后核对：2026-11-08

本页给参与移植的人（含子任务）用。原版目录 `xiaojianghu-legacy-prologue` **只读**；Godot 工程在 `xiaojianghu-godot/game/`。全程中文（注释、文档、界面文字），代码标识符与路径保持原样。

## 1. 工程结构

| 路径 | 内容 |
| --- | --- |
| `game/project.godot` | 基准视口 960×540、canvas_items 拉伸、Compatibility 渲染器、贴图默认最近邻 |
| `game/assets/` | 原版素材（同相对路径），`tools/sync_assets.py` 复制，不要手改 |
| `game/data/story/` | ink 剧本 JSON（`tools/extract_story.cjs`），`index.json` 是 knot→文件 |
| `game/data/runtime/` | 原版运行时导出（`tools/dump_runtime.cjs`）：`sc.json` 场景表、`img.json` 图片键/切片、`bounds.json` 人物轮廓、`reg.json` 动作表、`art.json`、`dlg.json` 立绘映射、`nav.json` 寻路格、`occ.json` 遮挡格、`globals.json` 全部数据型全局对象（ITEMS、SKILLS、PARTY_DEF、BART、QiheClashData、CultivationData、PreHangaoData……，函数位置记为 `{"__fn": 名}`） |
| `game/scripts/core/` | 自动加载：Data、Assets、G、DB、Story、Audio、boot |
| `game/scripts/world/` | 地图引擎：World、CharArt、WorldDraw、Lights、OccGrid |
| `game/scripts/ui/` | UI（全局界面层）、Dialog（对白）、Paint（CSS 绘制工具）、hud、tpad |
| `game/scripts/flow/` | 主线与场景逻辑（挂到 World.scenes 的 NPC 上） |
| `game/scripts/battle/` | 战斗（子任务） |
| `game/scripts/menu/` | 江湖菜单（子任务） |
| `game/scripts/npc/` | 人物交互（子任务） |
| `game/scripts/cultivation/` | 培养模式（子任务） |
| `game/shaders/` | 着色器 |
| `docs/specs/` | 原版移植规格书（调研子任务写） |
| `docs/review/` | 并排对照评审记录 |

## 2. 原版名字 → Godot 对应

| 原版（JS 全局） | Godot（自动加载） |
| --- | --- |
| `S` 存档对象 | `G.S`（Dictionary，与原版字段同名）；`G.save()`、`G.checkpoint()`、`G.has_flag(f)`、`G.set_flag(f,v)` |
| `mode` | `G.mode`：`"title"`/`"scene"`/`"battle"`/`"cultivation"`/`"end"` |
| `SC` / `cur` / `player` / `busy` / `keys` | `World.scenes` / `World.cur` / `World.player`（Actor：x,y,dir,alpha…）/ `World.busy` / `World.keys` |
| `TS` `ZOOM` `CHAR_H` `W` `H` | `World.TS` `World.ZOOM` `World.CHAR_H`；逻辑画面 960×540 |
| `goScene(id,at,dir)` | `await World.go_scene(id, at, dir)`（at 为格坐标数组，可为 null） |
| `spawnWanderers()` / `snapCam()` / `npcsOf(cur)` | `World.spawn_wanderers()` / `World.snap_cam()` / `World.npcs_of(World.cur)`；当前可见 NPC 缓存是 `World.npcs` |
| `interact(n)` | `await World.interact(n)` |
| `say(who,text,sp)` / `choose(who,text,opts,sp,esc)` / `narr(t)` | `await Dialog.say(who, text, sp)` / `await Dialog.choose(who, text, opts, sp, esc)`（返回下标）/ `await Dialog.narr(t)` |
| `dlgBusy` | `Dialog.busy` |
| `DialogueStage.begin/end/withCast` | `Dialog.begin(id, cast)` / `Dialog.end(token)` / `await Dialog.with_cast(id, cast, fn)`；cast 元素 `{"who":..,"sp":..,"slot":..}` |
| `StoryRuntime.play(knot,{line,externals,vars})` | `await Story.play(knot, {"line": Callable, "externals": {"名": Callable}, "vars": {}})`；外部函数可 `await`；`flag/set_flag/checkpoint/toast/toast_for/mark` 有缺省实现 |
| `toast(t,ms)` / `fade(fn)` / `placeName(t)` / `hud()` | `UI.toast(t, ms)` / `await UI.fade(fn)` / `UI.place_name(t)` / `UI.hud()` |
| 人物交互接管（qihe-npc-ui.js 包裹 interact） | `World.interact_hook = func(n): return await 处理(n)`，返回 true 表示已接管 |
| 打开面板（`openPanel`） | 面板节点打开时 `UI.push_panel(节点)`，关闭时 `UI.pop_panel(节点)`；有面板时探索自动冻结 |
| `IMG[key]` / `ok(img)` | `Assets.tex(key)`（同步）/ `Assets.tex_ready(key)`（未就绪返回 null 并在后台加载）/ `await Assets.preload_keys([...])`；人物帧 `CharArt.frame(key)` 返回 `[Texture2D, Rect2, key]` |
| `drawChar(sp,x,y,dir,walk,t,opts)` | `CharArt.draw_char(canvas_item, sp, x, y, dir, walk, t, opts)` |
| `ITEMS` `SKILLS` `PARTY_DEF` 及其他数据表 | `DB.ITEMS` `DB.SKILLS` `DB.PARTY_DEF`，其余 `DB.g("名字")` |
| `giveItem(k,n)` / `learn(k)` / `gain(t)` | `DB.give_item(k, n)` / `DB.learn(k)` / `DB.gain(t)` |
| `battle(opt)` | `await Battle.start(opt)`，返回 `"win"`/`"lose"`/`"flee"`（战斗子任务实现） |
| 音效 `__audio.sfx(k)` / `bsfx(k,vol,rate)` | `Audio.sfx(k, vol, rate)`。音乐按原版规则每帧自动选（`Audio.soundscape()`）：战斗开始时设 `Audio.battle_obj = 本场战斗对象`、`Audio.battle_bg = 背景键`、`Audio.battle_settled = false`，结算画面出现时设 `Audio.battle_settled = true`。对白推进、选项、提示、面板开关、黑场、银两减少的音效已在核心里挂好 |
| `rnd(a,b)` `ri(a,b)` `clamp` `wait(ms)` | `randf_range(a,b)` `randi_range(a,b)` `clamp` `await get_tree().create_timer(ms/1000.0).timeout` |

## 3. 界面怎么照 CSS 做

- 原版界面以“游戏区宽 1280”为基准排版（`--ui-zoom`）。Godot 里 `UI.root` 是 1280×720 的 Control、缩放 0.75 铺满视口：**直接用 CSS 的 px 数值**（`em` 换算按所在元素字号；根 `.ui` 是 17px）。
- 新界面节点挂到 `UI.root` 下（或自己的 CanvasLayer，内部同样 1280×720 ×0.75）。
- 颜色变量：`UI.PAPER #e9dcc0`、`UI.GOLD #e0bf78`、`UI.HI #f3d58e`、`UI.BZ #6e5a3e`、`UI.BZ2 #a38a5e`、`UI.RED #d9553a`、`UI.DIM #9c8b70`；`--bg1 rgba(22,17,13,.93)`、`--bg2 rgba(34,27,20,.95)`、`--faint #6d5f4b`、`--jade #7fbf8e`、`--ink #0d0a08`。
- 字体：`UI.serif`（Noto Serif SC 500）、`UI.serif_bold`、`UI.sans`/`UI.sans_medium`/`UI.sans_bold`（Noto Sans SC）、`UI.brush`（ZCOOL XiaoWei）。字距用 `Paint.font(字体, 字号, 字距em)`；带字距和阴影的标签用 `Paint.label(...)`。
- 渐变、金线、描边框：`Paint.grad(ci, rect, [[位置,颜色]...], 横向?)`、`Paint.fade_line(...)`、`Paint.frame(ci, rect)`。
- 立绘、CG 这类高清图用线性过滤（`texture_filter = TEXTURE_FILTER_LINEAR_WITH_MIPMAPS`）；地图、像素精灵保持最近邻。

## 4. 场景逻辑怎么挂

- 场景数据已在 `World.scenes`（来自 `sc.json`），NPC 的 `show`/`act`/`mark`、场景的 `enter`/`fx`/`over`/`under` 在原版是函数，导出里是 `{"__fn": 名}` 占位。移植时在模块 `_ready` 里按 NPC 的 `id` 找到它，把占位换成 Callable：`n.show = func(): return ...`、`n.act = func(n): await ...`。
- `fx`/`over`/`under` 的签名是 `func(ci: CanvasItem, t: float)`（under 多一个 dt），在世界坐标里画。
- 运行时新增的人物（剧情临时站位等）直接往 `World.cur.npcs` 追加字典，再 `World.npcs = World.npcs_of(World.cur)`。

## 5. 检查与验证

- **全套自测（2026-11-05 起，改完就跑）**：`python3 tools/selftest.py`（约 2 分钟：编译检查、单元测试、剧本全分支、六种自动通关、全人物扫荡＋自检、旧存档回归、截图对比；报告 `build/selftest/latest/report.md`）。导出脚本会先跑它，不过不导出。说明见 [2026-11-05-selftest.md](updates/2026-11-05-selftest.md)。
- 编译检查：`cd game && godot --headless --path . -- --checkall`（在游戏里逐个载入全部脚本和着色器，最后一行“检查完毕 … 失败 N 个”）。`--import` 查不出脚本错误；本机没有 `timeout` 命令，要限时就后台跑再 kill。
- **试玩审查（2026-11-09 起，改了地图、物件、站位、界面、剧情后、交给用户试玩前跑）**：全套自测只管“跑得通”，试玩审查管“玩起来对不对”。按问题类型清单看画面、读剧本：`python3 tools/playtest_review.py capture` 截图，`review` 交给本机命令行 Claude Code 看图，`story <剧本>` 读剧本，cc 报的问题由主会话逐条复核。清单和流程见 [playtest-review.md](playtest-review.md)。扫荡里的“没反馈”“一人两处”“任务没登记”三类已进全套自测。
- 剧情分支覆盖（2026-11-08 起）：培养部分每个剧本版本、每个选项、每个汉皋前事件的可达性都有自动测试，已进全套自测；说明和怎么加豁免见 [branch-coverage.md](branch-coverage.md)。界面全程测试（真点按钮、真打战斗，约 10 分钟）：`godot --headless --path game -- --walkthrough --fast --fullrun`。
- 自动测试（2026-11-05 起，GdUnit4）：`tools/gd_test.sh`（无头，不弹窗；0 全过，非 0 有失败）；只跑一个文件 `tools/gd_test.sh -a res://test/xxx_test.gd`。测试写在 `game/test/*_test.gd`，不进导出包。说明见 [2026-11-05-gdunit4.md](updates/2026-11-05-gdunit4.md)。
- 交锋节奏：`godot --headless --path . -- --battle=clash --clash-timeline` 打印每句喊话、每一步的时刻（自动按 60 帧测，不限帧时每次等待几乎不超时，会比原版短约 1.8%），与原版 `node tools/clash_timeline_web.cjs` 对照。
- 截图对照（需要窗口，主会话做）：`tools/gd_bg.sh --resolution 1280x720 -- --scene=<场景> --capture=毫秒 --out=目录`（后台启动、窗口开在 BetterDisplay 虚拟屏 QingheTest 上，不占实际屏幕、不抢焦点；找不到虚拟屏就不跑；直接 `godot --path game …` 会在桌面弹窗，不要用）；原版 `node tools/capture_web.cjs --scene=<场景> --out=文件`；拼图 `python3 tools/compare.py 原版 Godot 输出 标题`。
- 规则：不改原版目录；不提交 git；不发布；不打印密钥（R-生图-03、R-git-01、R-发布-01）。

## 6. 人物行踪（2026-11-10 起，规则 R-剧情-09）

用户试玩时看到：叶蘅在婶婶家，进叶家她又在屋里；和村口老人闲谈时，差役、采办随从站在门口，平时却看不到他们。规矩如下。

- **行踪表**：`docs/cast-schedule.md`。它列出每个有名有姓的人在每个进度点站在哪个场景，由全套自测实测生成（`python3 tools/cast_schedule.py`），不手改。
  - 加人物、改站位、改出没条件（`show`）、加剧情之前，先查这张表。
  - 改完跑全套自测，表会跟着更新。
- **同一时刻只在一处**：凡是有人物表的人（包括差役、采办随从这类）都算。全人物扫荡报“一人两处”。
- **不许临时变出人来**：
  - 日常戏（玩家自己挑时候做的活动、闲谈）只能挪动此刻已站在这个场景地图上的人，不能把别处的人摆过来，演完又收走。
  - 规则写在 `flow/chapter.gd`：
    - `DAILY`：日常站位戏；
    - `FIRST_NIGHT_ONLY`：第一夜的差事戏，进了日常不再摆站位；
    - `_gathering()`：主线大事。
  - 扫荡报“临时出场”。
- **不许隔空说话**：说话的人要在这个场景的地图上，或正跟在主角身后。
  - 隔着门、墙答话可以，前提是剧本交代清楚人在哪。这类要登记在 `tests/sweep_npc.gd` 的 `THROUGH_DOOR`，写明人在哪。
  - 不在场的人要传话，就由在场的人转述（例：叶蘅托陆衡捎话）。
  - 扫荡报“隔空说话”。
- **主线大事里的聚齐不算问题**：开场会把主角带到事发地，众人聚到一处，演完各回这一时段该在的地方。
  - 行踪表里有单独一节列出这些聚齐，备查。
  - 新加大事要在剧情里交代谁为什么来。
