# Godot 版《小江湖》重做计划与系统清单

状态：现行　最后核对：2026-11-03

## 1. 目标与边界

- 用 Godot 4.7（Compatibility 渲染器，可导出 Web 与 macOS）在本目录一比一重做 `xiaojianghu-legacy-prologue`（栖河试玩版，本机 8792）。
- 素材全部沿用原版，经 `tools/sync_assets.py` 复制进 `game/assets/`（原版目录只读，不改任何文件）。
- 剧情台词单一来源仍是原版 ink 剧本：`tools/extract_story.cjs` 把原版编译产物 `js/story-data/*.js` 抽成 `game/data/story/*.json`，运行时用 inkgd（GDScript 版 ink 运行时）逐句播放。
- 原版在运行时由多份脚本拼出来的数据（场景表 SC、人物帧切片、立绘映射、物品武学表、养成数据……）由 `tools/dump_runtime.cjs` 开着原版导出到 `game/data/runtime/`，保证与原版同一份数据。
- 配音已全关且文件已删，Godot 版不做配音。序章配乐未定稿，先用原版现有配乐。
- 完成标准：从序章到开始部分结束、再到培养模式完整跑通；有 Web 与 macOS 导出；每个系统有并排对照截图与测试记录（`docs/review/`）。

## 2. 比原版更好的地方（性能与画面）

| 问题（原版） | Godot 版做法 |
| --- | --- |
| 首屏要下约 50MB、550 张图，慢网卡在“载入画卷中” | 首屏只等标题页与序章后山用的图；其余按场景分包（Web 版 PCK 分包，后台下载），换场前只等目标场景；贴图导入为有损 WebP（质量 0.9），引用素材 482MB → 导入后约 138MB |
| 地图大图逐帧在 Canvas2D 缩放绘制 | GPU 纹理批量绘制，像素画最近邻采样；人物轮廓、遮挡格、寻路格都离线预算 |
| 遮挡半透明要逐帧离屏合成 | 同色叠画法：被挡角色整身再画一遍半透明，未被挡部分颜色不变，等价且零离屏开销 |
| 寻路在 JS 里现算可站格 | 规划网格与八方向连通离线生成（`tools/nav_grids.py`） |
| 字体在线取 Google Fonts | 按实际用字裁剪后打包（`tools/build_fonts.py`） |

## 3. 系统清单（按原版模块）

状态：未开始 ／ 进行中 ／ 已对照（截图并排、差异修平）。“负责”里“主”＝主会话亲自移植，“子任务”＝经路由器分派的子任务（R-子任务-02），主会话验收。

| # | 系统 | 原版文件 | Godot 文件 | 负责 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 1 | 素材与加载（按场景、后台线程、Web 分包） | core.js loadAll/ensureSceneAssets、production-assets.js | scripts/core/assets.gd、tools/sync_assets.py、tools/packs | 主 | 已对照 |
| 2 | 地图行走与碰撞（半分辨率位掩码、脚底五点、滑墙） | scene.js | scripts/world/world.gd | 主 | 已对照 |
| 3 | A* 寻路、点击行走、跑步、镜头 | scene.js、main.js | world.gd、tools/nav_grids.py | 主 | 已对照 |
| 4 | 深度排序、道具层 props、前景 fgp、遮挡半透明 | scene.js drawScene/occ* | scripts/world/world_draw.gd、occ_grid.gd、tools/occ_grids.py | 主 | 已对照 |
| 5 | 人物帧（站立/走/跑/待机/小动作）、轮廓接地、呼吸 | core.js sliceSheets、scene.js drawChar、art.js | scripts/world/char_art.gd、tools/char_bounds.py | 主 | 已对照 |
| 6 | NPC 待机、路人、跟随者、闲话气泡 | idle.js、scene.js | world.gd、world_draw.gd | 主 | 已对照 |
| 7 | 氛围：水面粼光、鸭、鸟、粒子、夜色光源、暗角 | scene.js、core.js vignette | world_draw.gd、lights.gd、shaders/ | 主 | 已对照 |
| 8 | 出入口与换场（黑场时序、走出走进） | scene.js goScene/takeExit | world.gd、ui.gd fade | 主 | 已对照 |
| 9 | 剧情运行时（ink、外部函数排队） | story-runtime.js | scripts/core/story_runtime.gd、addons/inkgd | 主 | 已对照 |
| 10 | 对白框、选项、打字机、名牌、小像 | ui.js say/choose、index.html #dlg | scripts/ui/dialog.gd | 主 | 已对照 |
| 11 | 立绘站位、眼线对齐、发言压暗、背景虚化 | dialogue-stage.js、qihe-dialogue-portraits.js | dialog.gd、shaders/portrait、dim_blur | 主 | 已对照 |
| 12 | CG（递水、火灾夜）、字幕卡、剧情站位与镜头 | prologue-water.js、qihe-fire-cinematic.js、qihe-staging*.js | scripts/flow/cinematic.gd、chapter.gd | 主 | 已移植 |
| 13 | 序章：后山相遇、递水、遇狼、进村第一夜 | prologue-*.js、qihe-map-trial.js、qihe-prologue-actions.js | scripts/flow/prologue.gd、first_night.gd | 主 | 已对照 |
| 14 | 开始部分主线（风起栖河：起火、三方、对证、接应院、山居） | qihe-chapter.js、qihe-town.js、qihe-expansion.js、qihe-representatives.js、qihe-faction-clash*.js | scripts/flow/chapter*.gd | 主 | 已对照 |
| 15 | 可选内容：支线、奇遇、灯会更夫、算命、阿七、隐藏点 | qihe-lamp-watcher.js、qihe-outsiders.js、qihe-hidden.js、qihe-aqi.js、qihe-banter.js | scripts/flow/side*.gd | 子任务 | 已移植 |
| 16 | 背包、物资点、宝箱（无钥匙，货币单位“两”） | qihe-resources.js、qihe-treasure.js、menu.js 物品 | scripts/flow/side*.gd、scripts/menu/page_bag.gd | 主 | 已对照 |
| 17 | 人物交互：墨印八枚印（托谈观礼教比易窃）、送礼、易物、偷窃、声望 | qihe-npc-*.js、qihe-gift*.js、qihe-steal*.js、qihe-jianghu-rep*.js | scripts/npc/** | 子任务 | 已对照 |
| 18 | 回合制战斗：规则、时间轴、AI、自动、指引 | battle.js、battle-auto.js、prologue-story-battle.js、guiyun-combat-runtime.js | scripts/battle/** | 子任务 | 已移植 |
| 19 | 战斗表现：舞台、单位动画、特效、破势、界面墨条 | bstage.js、bui.js、bfx.js、vfx.js、bart.js、bposhi.js、faction-fx/ | scripts/battle/** | 子任务 | 已对照（含交锋特效辉光模糊与节奏） |
| 20 | 江湖菜单（人物、武学、装备、背包、队伍、行程/江湖录） | menu.js、qihe-menu.js、qihe-jianghu-*.js、qihe-journal*.js、qihe-ui-model.js | scripts/menu/** | 子任务 | 已对照 |
| 21 | HUD（地名题签、任务提示、江湖按钮、小地图） | qihe-hud.js、index.html #hud | scripts/ui/hud.gd、qihe_hud.gd | 子任务（随 20） | 已对照 |
| 22 | 存档读档、标题页、选档、自动存档 | core.js save、qihe-saves.js、qihe-startup.js | scripts/core/game_state.gd、scripts/ui/title.gd | 主 | 已对照（含存档管理：新建、重命名、回收站、载入） |
| 23 | 培养模式（养成：时段、活动、师父、邻居、来客、书信、书库、武学、关系、家务、小游戏、演出） | qh-mode-cultivation*.js、qh-pre-hangao*.js、pei-companion*.js 等 | scripts/cultivation/** | 子任务 | 已对照（含八个面板） |
| 24 | 音乐与音效 | audio.js | scripts/core/audio.gd | 主 | 已移植 |
| 25 | 触屏（方向键、互动键、点击寻路） | index.html #tpad、main.js | scripts/ui/tpad.gd、world.gd | 主 | 已移植 |
| 26 | 界面缩放与字体 | ui-scale.js、Google Fonts | ui.gd（1280 基准 ×0.75）、tools/build_fonts.py、paint.gd（小数字号） | 主 | 已对照（苹果宋体／楷体按字重取；小数字号照原版） |
| 27 | 导出（Web 分包、macOS） | scripts/build-pages.cjs | export_presets.cfg、tools/export.py | 主 | 已导出并实测 |

## 4. 做法

1. **数据先行**：凡是原版的数据（场景、帧、立绘、物品、武学、养成表），都从原版运行时导出，不手抄。
2. **逻辑逐行移植**：原版 JS 的流程函数逐个对应成 GDScript（async/await 对应 await），常量、时序原样保留，并在注释里写明原版位置。约定见 [开发约定](dev-conventions.md)。
3. **自己评审**：每完成一个系统，开着原版 8792 与 Godot 版在同一场景、同一状态各截一张（`tools/capture_web.cjs` 与 `--capture`），用 `tools/compare.py` 拼图并算像素差，写进 `docs/review/`；差异修到一致才算完成。
4. **子任务分派**（2026-11-05 起路由器已废止，R-子任务-02 废止；子任务改派 Claude 自己的子代理）：独立系统（战斗、菜单、人物交互、培养模式、可选内容）经路由器分派（R-子任务-02），每个子任务只写自己的目录；主会话验收、截图对照、修整合问题。

## 5. 进度记录

见 `docs/review/README.md`（逐系统对照记录）与 `docs/test-log.md`（测试记录）。
