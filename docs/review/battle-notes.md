# 回合制战斗移植说明（battle）

状态：可运行　最后核对：2026-11-03

## 怎么跑

- 调试入口：`godot --path game -- --battle=<预设>`；预设有 `backhill_wolf`（序章后山遇狼）、`ye`（同一场，默认开自动）、`lesson`、`road`、`bailiff`、`clash`（领队交锋演出，打完返回 stopped）、`clash_sim`（只跑交锋规则 simulate()，在控制台打出结果，可与原版 node 输出逐项比对）。
- 调试入口会自造一份新开局的 G.S，打完在控制台输出 `[battle] 调试战斗结束：<预设> → <结果>`。
- 正式接口：`await Battle.start(opt) -> "win"/"lose"/"flee"`，opt 的键与原版 `battle(opt)` 一致，回调写成 Callable。

## 文件与原版对应

| 文件 | 原版 |
|---|---|
| scripts/battle/battle.gd（自动加载 Battle） | battle.js battle()/battleStoryLesson()、bui.js victory()/bigText()；挂载与卸载三个 CanvasLayer（10～12） |
| scripts/battle/rules.gd | battle.js aliveOf/newJit/calcOrder/battleLoop/endCheck/tickBuffs/planIntent/reveal/strike/foeAct/doAttack/doSkill；bposhi.js 破势与护盾 |
| scripts/battle/clash_rules.gd | qihe-faction-clash-rules.js 等：领队交锋的独立规则（阵容、出手顺序、伤害、simulate） |
| scripts/battle/clash.gd（继承 lesson.gd） | qihe-faction-clash*.js 演出：标题、喊话框、逐步出手、结果；接口 `await Battle.clash_play()` |
| scripts/battle/turn.gd | battle.js allyTurn 和指令子菜单（武学、道具、防御、逃跑） |
| scripts/battle/auto.gd | battle-auto.js |
| scripts/battle/lesson.gd | prologue-story-battle.js（storyLesson 与各场预设） |
| scripts/battle/stats.gd（class_name Stats） | menu.js derived/mkHero/mkAlly/装备合计；character-growth-state.js 战斗部分；qihe-acc-fx.js 饰物效果 |
| scripts/battle/view.gd、bdraw.gd、unit_node.gd | bstage.js 舞台绘制、bart.js/qihe-battle-art.js/qihe-chapter-battle-art.js 精灵与背景 |
| scripts/battle/motion.gd、cam.gd | bfx.js 出手与受击动画、镜头推拉 |
| scripts/battle/vfx.gd | vfx.js、faction-fx/*.js、hero-multiweapon*.js 招式特效 |
| scripts/battle/screen.gd（layer 11） | bui.js 顺序条、招式名横幅、胜败大字、破势演出（bposhi.js） |
| scripts/battle/panel.gd（layer 12） | bui.js #bt 队伍状态条、说明条、墨条指令菜单、自动按钮、教学浮层、胜利卷轴 |
| shaders/battle_tint.gdshader | 精灵着色和受击白闪（原版 prep 离屏画布） |
| shaders/battle_grade.gdshader | 舞台 soft-light 调色层 |
| data/battle/defs.json | battle.js、bui.js 里的字面量表（短名、颜色、招式类别等） |
| scripts/battle/fx_wuxia.gd | faction-fx/wuxia-fx.js 的 class WuxiaFX（overlay 模式；播放、粒子、贴图、辉光、压暗、闪白） |
| scripts/battle/fx_store.gd、fx_util.gd、fx_atlas.gd | wuxia-fx.js 闭包里的 RAMP/IMG/SKILLS、static load()、tinted()、define()；工具函数与随机数；Atlas 程序烘焙小精灵 |
| scripts/battle/fx_lib.gd | WuxiaFX.lib 组合件：chest、quad、fly、shed、strike、drawHits、motes、converge、hurt、leadAura |
| scripts/battle/fx_am.gd、fx_gj.gd、fx_clash_v2.gd | faction-fx/fx-am.js、fx-gj.js、fx-qihe-clash-v2.js 的逐招编排 |
| scripts/battle/fx_layer.gd | qihe-faction-clash.js paint(layer) 与 WuxiaFX.drawBackInto / drawFrontInto 的绘制节点 |

## 已支持的 opt

tutorial、solo、training、allowAuto、heroArt/heroPor、allyArts/allyPorts、bg、intro（字符串或 Callable）、foes、storyLesson、preset/learned（Flow.run_battle 传入）。另有切磋用到的 endCheck(B)->String、victory()、bigTextMap、spar，对应 qihe-npc-core.js runSpar：原版临时替换全局函数，这里改由 opt 传入。endCheck 返回 "draw" 时按脱身处理。

## 已知差异

- 辉光用加色图层近似；原版是 1/8 分辨率的模糊层。
- 精灵预处理（prep）改用着色器实现；原版的锐利双线性缩放改为线性过滤加 mipmap。
- 只做了 ink 主题，其他界面主题没做。
- 按键提示 #bt-help 没做（原版 v4 布局本来就隐藏它）。
- 配音按要求关闭。
- 毛笔字体（Ma Shan Zheng 等）原版在线加载，本工程用 UI.brush 代替。
- seal、blot 只有在烘焙图里有同一个字时才用图，否则用矢量画法回落；swash 类没烘到的参数取同函数尺寸最近的一张拉伸。
- 领队交锋的专属招式特效（WuxiaFX）已移植，差异见下文「交锋特效」一节。
- 交锋喊话框里「点击／空格 继续」原版字号 0.12px（实际不可见），不画。
- 顺序条令牌按 v4 布局画菱形令牌（v4 覆盖了旧圆相令牌），没有另画 enso 圆相。
- 带 preset 的剧情战斗结束后，本模块会快照还原存档，调用方 flow/chapter.gd 也会还原一次。两边重复，但结果相同、无害。

## 战斗表现精修（2026-11-03）

- 墨迹改用 `Bui`（主会话按原版 bui.js 实际参数烘焙的贴图）：bdraw.gd 新增 `bui()`、`bui_region()`、`sw()`、`seal_r()`、`blot_o()`、`coin()`、`item_icon()`，以及照抄 bui.js 的具名参数（sw_card、SW_CUR、SW_TGT、sw_row、SW_SEL、SW_HD、SW_HINT、SW_RED、SW_LV、PAP_M/H/W、ROD_H/W/S、ENSO_N/C/T、SW_BIG、sw_banner、sw_intent、bar_args）。取不到贴图时回落到原矢量画法。
- 指令菜单：表头 swHd，行 swRow(i%4)，选中 swSel，蓄势栏 swRow(4)；说明条 swHint 横扫。道具行和胜利卷轴战利品按 buiItem 取 ITEM_ICONS_V4，没有再取 ART.icons，都没有画「药」字徽。
- 状态卡按 v4 compact：206×54，top6、right44，当前行动者左移 10；名字 15px 加 5 枚 8px 铜钱；「血」「内」标签和数字在左，毛笔线条在右（swash(w,9,…) 铺排裁切，右端 7px 渐隐）。
- 招式横幅 sw_banner 从中间展开；胜败大字 SW_BIG；胜利卷轴 papW 宣纸、rodW 木轴、「大捷」印、blot 字徽、swLv 突破条。
- 画面压暗：screen.gd 新增 `_draw_vignette()`，照 core.js 战斗模式的屏幕空间径向暗角（0.35H 处为 0，0.95H 处 rgba(0,0,0,.55)）。
- 领队交锋：clash_rules.gd 加 clash.gd，`await Battle.clash_play()`；defs.json 的 BATTLE_ADULT 补了 qh_clash_guard、qh_bailiff。play 拍快照前先调 `UI.hud()`，因为 HUD 会惰性补 questTrack/prologue。
- 音乐：_mount 时设 Audio.battle_obj、battle_bg、battle_settled=false，结算时设 battle_settled=true；sfx 透传速率。

## 交锋特效（2026-11-03）

原版 qihe-faction-clash.js 的接线逐条照搬：ready() 加载 am_v1、kit_v1、clash_v2 三套素材并 `new WuxiaFX(null,{overlay:true})`、`quiet=true`；
出手时 startFx 换算锚点（镜像、以 pivot 为中心缩放 0.8、am_s2 改把目标当同伴）、写 pred（只有 am_s3/cs_whip_s1/cs_whip_s2 带预判），
在 hitAt 结算后写 outcome；tick 按战斗时钟推进（单帧最多 50ms），paint 把 back 层贴在背景之后、单位之前，front 层贴在特效层之后。
没有 fxId 的动作（普攻、防御）原版不放特效，这里也不放。

| 交锋招式 | fxId | 编排来源 | hitAt / dur（ms） |
|---|---|---|---|
| am_s1 短锋相照 | am_s1 | fx-am.js | 330 / 950 |
| am_s2 同担一线（序列里没出场） | am_s2 | fx-am.js | 700 / 1250 |
| am_s3 明约合锋 | am_s3_v2 | fx-qihe-clash-v2.js | 520 / 1250 |
| cs_whip_s1 缠腕短打 | cs_whip_s1_v2 | fx-qihe-clash-v2.js | 300 / 900 |
| cs_whip_s2 回身掠影 | cs_whip_s2_v2 | fx-qihe-clash-v2.js | 520 / 1250 |

fx-gj.js 的 gj_s1、gj_s2 也移植并注册了，但交锋不用，原版交锋也不加载 gj_v1 素材，所以这里同样不加载。

绘制方式：WuxiaFX.render() 不直接画，而是把每次绘制记成指令（贴图、方块、辉光点、辉光线、圆弧），由 fx_layer.gd 按“混合方式＋是否平滑”分段画出。
'lighter' 对应 CanvasItemMaterial.BLEND_MODE_ADD，'source-over' 对应 BLEND_MODE_MIX；像素层用最近邻采样，辉光层用线性采样。
素材 clip 按横向区间裁源图实现；tinted() 首次使用时在 CPU 上逐像素映射色带，结果按“id@色带”缓存。

已知差异：
- 辉光层：原版先画到 1/4 分辨率离屏层，再加 blur(8px) 贴回；这里直接按特效像素画径向渐变点和抗锯齿折线，没有那次模糊，辉光边缘略硬。
- low（原版 prefers-reduced-motion）恒为 false。
- 交锋走不到的部分没有移植：composite / drawChars（非 overlay 舞台）、drawNums / label（交锋 quiet=true）、beam、bpCharge / bpAura / ripple（bp 恒为 0）。
- cs_whip_s2_v2 的“破绽”缺环原版用 canvas arc+stroke 画；这里用 draw_arc 画（32 段折线、线宽 2、抗锯齿），弧线会比原版略多棱角。

## 验证记录

- 在本模块范围内，`godot --headless --import` 没有脚本错误。
- 冒烟副本（菜单换成桩，自动按键）里跑过：backhill_wolf 胜（自动和键盘手动两条路径）、lesson 胜、road 胜、bailiff 败，都没有脚本运行时错误。
- 2026-11-03：backhill_wolf、ye、clash_sim、clash 运行没有脚本错误；clash 从头演到尾，返回 stopped；clash_sim 结果与原版 node 输出一致。
- 截图对照由主会话做。
- 2026-11-03（交锋特效）：clash.gd 接线修了一处错误。原来一行写成 `fx_back.source = func(): return _paint("back"); fx_back.tick = _tick`，分号后面的赋值被并进单行 lambda，tick 一直为空，特效时钟不走。拆成两行后，用无窗口探针跑 `--battle=clash`（自动按键和不按键各跑一次），四次出手都在播特效，结果如下（指令峰值／粒子峰值）：am_s1 453/170、cs_whip_s1_v2 20/15、am_s3_v2 104/38、cs_whip_s2_v2 40/25。全程没有脚本错误，最后返回 stopped。
