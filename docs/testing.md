# 测试与评审

状态：现行　最后核对：2026-10-20

> 2026-10-20：本目录旧游戏原型及其测试已整体移入 `_attic/2026-10-20-prototype/`。下文凡是打开 `index.html`、加载 `js/` 运行代码或依赖旧原型素材的命令、页面与结果都只作追溯，不能再运行，也不作参考。本目录现在保留的测试与运行方法见[归档记录](updates/2026-10-20-prototype-archive.md)。

> 事件日程统一规则（2026-10-04）：新增和改期执行[事件排期系统](design/event-scheduling-system.md)及机器事件目录，先检查日期、人物在场、前置和联合行动预算，再接入游戏。现有文本未全部迁入；旧剧情草案不能自动视为排期通过。

<!-- map-standard: entry -->

> 地图开发统一入口（2026-10-04）：[现行地图开发规范](design/map-development-standard.md)。地图制作流程、硬参数、分区拼接与验收按此执行；本文旧地图尺寸、旧生成/重建方案和旧通过记录仅供对应版本追溯，不得用于新地图生产。人物等其他专项规则继续有效。

项目以 Node 内置测试、**无头浏览器驱动真实页面**（Playwright + Chromium）、碰撞审计与截图人工评审验证。

2026-09-30 起的桌面视觉整改按[视觉与交互验收合同](design/visual-acceptance.md)的 V01–V09 逐项判定。`debug.pdf` 的参考图不是运行结果；必须在同一待发布包中取得实际截图、碰撞叠图和交互记录。独立验收者记录每项通过/失败及证据路径，失败项修复并重测后才能发布。`tests/menu-icons.test.cjs` 只能证明图标映射与加载，不能证明语义和 UI 观感；碰撞审计也不能代替浅色地面与不可见阻挡的目视核对。

历史原型·襄阳片段回归（2026-09-29；襄阳城已撤除，只在审阅本目录历史原型时用）：在项目目录依次运行 `node --test tests/toast.test.cjs tests/npc-actions.test.cjs`、`node tests/battle-error-regression.cjs`、`node tests/xiangyang-slice.test.cjs`、`node tools_scene/xiangyang_regression.cjs`、`node tests/xiangyang-combat-balance.cjs`。分别检查提示与 NPC 菜单、战斗异常、单片段角色／存档／结算、剧情状态分支和正常数值战斗抽样。`tools_scene/street_flow.cjs <截图目录> '#xiangyang'` 通过真实寻路和键盘对话走街市流程，但为了聚焦场景交互会把敌人 HP 压到 1；它不用于证明战斗平衡。战斗抽样使用原战斗逻辑、固定种子与自动选招，详情见襄阳测试范围（已删除）。

## 开篇人物整改 OC.4（2026-10-04）

[OC.4 整改合同](archive/design/opening-correction-20261004-oc4.md)已归档，只供追溯；栖河现行检查见 `xiaojianghu-legacy-prologue/docs/testing.md`。安全本地检查：

```sh
OPENING_TEACHING_RECORD=1 node --test tests/dialogue-stage.test.cjs tests/prologue-review-driver.test.cjs tests/prologue-teaching-integration.test.cjs tests/opening-character-art.test.cjs tests/opening-asset-registration.test.cjs tests/opening-dialogue-regression.test.cjs tests/opening-battle-stage.test.cjs tests/opening-battle-heights.test.cjs tests/opening-motion-controller.test.cjs tests/character-grounding.test.cjs tests/prologue-arrival.test.cjs tests/prologue-story-battle.test.cjs tests/prologue-backhill.test.cjs tests/prologue-water.test.cjs tests/chapter1.test.cjs tests/chapter1-map-access.test.cjs
python3 tests/opening-correction-assets.test.py
node tests/battle-error-regression.cjs
node tools_scene/verify_dialogue_staging_render.cjs
node tools_scene/verify_opening_battle_render.cjs --oc4
node tools_scene/verify_opening_motion_render.cjs --oc4
node tools_scene/verify_opening_travel_cadence.cjs
```

历史OC.3的69项代码回归和3项素材门仅对应旧版；本轮计数以新验收记录为准。战斗胜负／异常／同伴与宠物回滚通过。本地绘制脚本直接加载当前生产绘制函数与素材，检查两个视口、阶段与实际帧选择；生成动态图供目视检查。它们没有启动浏览器或写入存档，不是完整游玩证明。`--hero-walk`仅验证萧白walk，`--walks`只检查两人walk，均不能作为全套run交付记录。

实际浏览器全流程由`verify_prologue_interactive.cjs`与`verify_prologue_recovery.cjs`负责：双人战斗、角色立绘、CG退出恢复、略过／失败／缺图重试、阶段恢复与风起栖河段衔接。当前浏览器访问被策略拒绝，因此本轮没有运行这些脚本或绕过策略；旧PI.2和OC.3记录不能作为本轮通过证据。后续在允许访问的环境补实机复测。

## 养成界面 V5 本地回归（2026-10-04）

[确认简化需求](design/cultivation-simple-approved.md)、[实际实现](design/cultivation-implementation.md)、[素材合同](design/cultivation-assets.md)和[验收V5-01—18](design/cultivation-acceptance.md)是当前标准。旧设施、行卷、大详情页与整张头像动作脚本仅保留历史追溯。

```sh
node --test tests/cultivation.test.cjs tests/cultivation-motion.test.cjs tests/cultivation-v5.test.cjs tests/chapter1.test.cjs tests/chapter1-map-access.test.cjs
node tools/cultivation_asset_audit.cjs review/cultivation_v5_module_review_20261004/asset-audit.json
```

启动 `python3 -m http.server 8149 --bind 127.0.0.1` 后：

```sh
node tests/cultivation-v5-browser.test.cjs
node tests/cultivation-v5-handoff.test.cjs
node tests/cultivation-local-motion.test.cjs
node tests/cultivation-action-loop.test.cjs
node tests/cultivation-module-review.test.cjs http://127.0.0.1:8149 review/cultivation_v5_module_review_20261004/final
```

最新复查：35项单元、16项主流程浏览器检查及3项衔接检查通过，70项素材审计零错误；逐模块另查27个可用活动、8个独练、9个边界和三种横屏。见[逐模块记录与待补项](../review/cultivation_v5_module_review_20261004/README.md)及[实机/预览对照](../review/cultivation_v5_module_review_20261004/index.html)。内置浏览器连续点击复现并修复了内部滚动导致顶部裁切，最终几何检查包含游戏/场景原点与滚动偏移。浏览器检查真实点击教学、两秒扣费/结算、刷新、通信、地图、声音、四小游戏和开始部分衔接，并取得1280/1920/800横屏截图。外部字体在测试中拦截，使用本机备用字体。晚期月份通过夹具定位；完整日历状态检查不能当作全部三年剧情已完成。美术一致性尚有待补项，不由通过的功能断言代替验收。

同日后续六阶段动作整改：35项单元、16项主流程、30项活动像素与8项新动作/效果检查通过，71项素材审计零错误。吐纳另绘六张真实姿态；指导幅度检查采用实际轮廓位移，环境效果独立分层，指定手势局部外人物不动。800/1280/1920构图及减少动态全部图层已检查。见[当前整改与待补清单](../review/cultivation_action_loop_20261004/README.md)。旧[局部微动记录](../review/cultivation_local_motion_20261004/README.md)仅供追溯。

本机脚本默认使用已有Codex运行时Playwright与Chromium，无需安装依赖；主脚本支持 `PLAYWRIGHT_PATH`、`CHROMIUM_PATH` 覆盖。旧 `cultivation-browser`、`v2-browser`、`layout-browser`、`fallback-browser`针对已移除控件，不用于V5回归。旧motion助手测试仅检查API兼容，不证明当前整张人物动作。

## 1. Playwright 环境

- 包：`/tmp/claude-0/node_modules/playwright`（用绝对路径 `require`，项目本身不含 `package.json`）
- 浏览器：`executablePath: '/opt/pw-browsers/chromium'`
- 页面可直接用 `file:///home/user/xiaojianghu/index.html#street` 打开，无需起服务器。
- **macOS 工作机（2026-09）**：包 `/private/tmp/claude-501/pw/node_modules/playwright`，浏览器 `~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell`，本地服务 `python3 -m http.server 8123 --directory <仓库>`（`tools_fx/bt_smoke.cjs` 与 `tools_scene/*.cjs` 都按这套写死路径）。

### 最小示例

```js
// smoke.cjs —— node smoke.cjs
const {chromium}=require('/tmp/claude-0/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/user/xiaojianghu/index.html#street');
  // 全局 let/const 在 page.evaluate 中可按名字访问（mode、cur、SC、S、player…）
  await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&cur===SC.street,null,{timeout:30000});
  const r=await p.evaluate(()=>({scene:S.scene,x:player.x,y:player.y,npcs:cur._npcs.map(n=>n.id),quest:questLine()}));
  console.log(JSON.stringify(r),errs);
  await p.screenshot({path:'street.png'});
  await b.close()})();
```

已验证输出：`{"scene":"street","x":936,"y":856,"npcs":["gossip","oldman","smith","lady","zhou","suzhi"],"quest":"街心似乎出了什么事，去看看"} []`。

### 坑：不要在 `page.evaluate` 里 await 游戏的 async 函数

`say/choose/battle/interact/goScene` 等返回的 Promise 要等玩家输入（点击、按键）才会 resolve。`await p.evaluate(()=>interact(npc))` 会**永远挂起**。正确做法：在 evaluate 中「发起但不等待」，然后从外部驱动输入并轮询状态：

```js
await p.evaluate(()=>{interact(SC.street.npcs.find(n=>n.id==='zhou'))});   // 不 return Promise
// 多句对话：反复按空格（第一下补全文字，第二下推进），直到出现选项
for(let i=0;i<40&&!(await p.$('#dlg .choices button'));i++){await p.keyboard.press('Space');await p.waitForTimeout(150)}
await p.keyboard.press('1');                          // 选第 1 项
for(let i=0;i<60&&!(await p.evaluate(()=>!busy&&!dlgBusy));i++){await p.keyboard.press('Space');await p.waitForTimeout(150)}
console.log(await p.evaluate(()=>[S.flags.xq,S.aff,questLine()]));   // → [1,{suzhi:2},'查访毒的来历（线索 0/2）']
```

战斗中同理：等 `mode==='battle'` 与 `#bt-cmd:not([hidden])`，用 Enter/方向键操作；或在 evaluate 中直接把敌人 `B.foes.forEach(u=>u.hp=0)` 快速结束。

也可以直接改状态跳关：`S.flags.xq=2; S.flags.xq_c_gossip=1; ...; hud()`。

## 2. 碰撞 / 空气墙审计

目标：肉眼可走的铺地/沙地/土路都应可走，只挡建筑、墙、桌椅、桶、摊、推车（宽松原则）；同时**不能走到奇怪的位置**：屋顶、墙体、水面、桌椅、树干后、画面外沿、被屋檐整个挡住的死角。

### 2.0 一键审计与冒烟（`tools_scene/`，推荐）

```bash
node tools_scene/audit.cjs [输出目录=review/scene_v4/audit] [场景id…]   # 全部 10 个场景的碰撞/交互/家具净空/出入方向审计
node tools_scene/street_flow.cjs [截图目录=review/scene_v3/flow]    # 街市主线 + 同伴不可交互 + 出口方向 + 旧档迁移 冒烟
node tools_scene/exit_frames.cjs [输出目录=review/scene_v3/exits] [场景id…]  # 每个场景间出口的切换连续帧（26 帧/110ms）
node tools_scene/s1_flow.cjs [截图目录=review/scene_v4/s1flow]     # 序章（新开局→庙内→庙外教学战→进城）+ 寨门→山洞→头目战 + 尾声站位 + 5 图旧档迁移
node tools_scene/shot.cjs <out.png> [场景] [x格] [y格] [JS]          # 把主角放到某处截一张游戏画面
node tools_fx/bt_smoke.cjs review/scene_v2/bt 30000 5000 bandits    # 战斗冒烟（应 errors: []）
```

- `audit.cjs`：逐场景直接切换 `cur` 并用引擎自己的 `standOk/navOf` 判定，输出 `audit_<id>.png`（世界 ×0.5 叠图：绿=可走且与入场点连通，**黄=可走但不连通的孤岛**（最常见的「奇怪位置」），蓝框=出口，白圈=NPC 80px 交互圈（红=圈内无可达站位），青点=入场点 start/各出口 at/大地图 at（品红=不可站或落在出口区），橙块=路人站位不可站）与 `audit.json`，控制台打印问题清单：入场点不可站 / 入场点落在本场景出口区、NPC 无可达站位、NPC 脚底不在可走区、出口不可达、路人站位不可站、孤岛、出口区以外能走到画面外沿；**（2026-09 v3 新增）家具净空**：剧情 NPC 与站桩路人脚下 ±10px 内有障碍（贴着/踩进桌凳摊架）、或站在素材图像下半部的背后（被桌凳盖住）；**出入方向**：A 向 d 走出到 B，B 回 A 的出口方向必须是 d 的反向、入口点 at 离回程出口 ≤5 格（控制台每行打印 `exits=目标:方向`）。
- `street_flow.cjs`：真实寻路行走 + 键盘推进对话 + 页面内自动战斗（敌人血量压到 1）：挑夫老周 → 包打听（赊消息）→ 线索 2 → 疤脸刘对质两场战斗 → 交药 → 苏芷入队 → 站到苏芷身旁检查 `nearest()` 不返回同伴 → 南大街向下出图到城门（须在门洞口、朝下）↔ 进城（须在南大街底、朝上）→ 偏巷出口 ↔ 回街市 → 写入 4 个旧版 48×27 坐标与 2 个 v2 坐标的存档并读档，检查迁移后 `standOk` 且可寻路。
- `s1_flow.cjs`（2026-09 S1）：①标题「初入江湖」→ 建角（自动分配 6 点）→ 羊太傅庙：检查开场运镜（镜头先对准神龛、主角在草铺）、运镜结束回到主角 → 参拜 / 烤火 / 旧木箱 → 出庙（台阶下、朝下）→ 古井 / 药炉 → 老僧教学战 + 学武 → 断碑互动点可达 → 下山打开大地图 → 选襄阳（落在 `mapIn`、朝上）→ 榜文 / 桥头军士盘查 → 进城（南大街底、朝上）；②大地图进寨门（`mapIn`、朝上）→ 挖酒 → 亮令牌 → 进寨（洞口、朝上）→ 账桌 / 山川图 → 巨蟒战 → 独眼阎罗头目战 → `mode==='end'`；③尾声站位与战败回庙点可站；temple/temple_out/gate/bgate/cave 各 4–5 个旧整图坐标写入无 `mapv` 的存档、读档后可站、不在出口区、可寻路、`mapv` 升到 1。末行 `{"fails":0,"errors":[]}`。
- `exit_frames.cjs`：把主角放在每个出口前、寻路走进去，逐帧截图并记录场景/坐标/朝向/alpha，末帧须在目标场景、朝向等于走出方向。每步打印 ✓/✗ 与状态，最后 `{"errors":[]}`。
- 2026-09 审计前后对比：`review/scene_v2/before/`（改前）与 `review/scene_v2/audit_*.png`（改后）；场景 v3 重排（02 文档落地）：`review/scene_v3/before/`、`review/scene_v3/after/`、`review/scene_v3/audit_*.png`、`review/scene_v3/exits/*_strip.png`。

1. **离线**：v2 场景看 `review/scene_v2/<id>_layout_dbg.png`（`tools_scene/build_scene.py` 输出），（2026-09 S1 起旧襄阳演示 8 个场景全部是程序排布，旧版 5 图的 `masks.py` 手标 mask 已退役），修改布局/多边形后重跑（数据块自动写回 `story.js`）。
2. **在线采样**：在页面中遍历网格，用引擎自己的判定函数找可疑区域：

```js
await p.evaluate(()=>{const out=[];
  for(let y=4;y<WH;y+=8)for(let x=4;x<WW;x+=8) out.push(standOk(x,y)?1:0);   // standOk 与移动判定一致
  return out});
```

   再把结果画到地图截图上人工核对；对「可走区里的孤立不可走点」「本该连通却不连通的区域」逐一检查。
3. **可达性**：对每个 NPC 身侧与每个出口 `at` 点调用 `findPath(x,y)`（从 `player` 当前位置出发），返回 `null` 即为不可达。
4. **实走**：用 `setPath(x,y)` 让主角实际走过去，轮询 `player.path===null` 后比较位置，发现被卡住（空气墙）或穿模。

## 3. 截图评审流程

1. 用 Playwright 在固定视口（1280×720 或 1920×1080）截取关键画面：进场、NPC 对话（带立绘）、面板（商店/小游戏/江湖菜单）、战斗（选指令、破防、胜利结算）、遮挡（主角站到屋檐/灯笼后）。
2. 与参考图对比：`original_ref.png`（原作参考）、`round1.png` `round2.png` `street_review.png` `playtest_screens.png`（历轮评审拼图），`review/` 下有美术对比图（`bright_compare.png` `lr_check.png` `walk_frames.png` `walk_hero.gif` `run_hero.gif` `portraits_suzhi.png` `companion_sheet.png` `ingame_compare.png` `round_story.png`）。
3. 发布前检查 `pageerror` 为空、控制台无 404（缺资源会画粉色方块 `#b88`）。

## 4. 发布检查清单（Artifact）

- [ ] `#street` 入口能直接进入街市，无报错
- [ ] 标题 → 建角 → 庙 → 城门 → 街市 流程可走通
- [ ] 所有被引用的资源存在（`ASSETS`、`s_*_bright`、`w_/r_` 表、`bg_*`、`p_*`、`i_icons`、`assets/audio/*.mp3`）
- [ ] **文件数 ≤ 255**：Artifact 单次发布最多 255 个文件（版本总上限 511 个 / 256MB）。这是角色帧打包成 4×4（或 8×4）精灵表 `s_*.webp`、运行时 `sliceSheets()` 再切片的原因——19 个角色 ×4 方向 ×4 帧若逐帧存文件就超过 300 个。运行时实际需要约 100 个文件（`index.html`、8 个 js、`bg_title`、10 个 `m_*`、`m_street_bright`、19 张 `s_*` 及其 `_bright`、walk/run 表、12 张 `p_*`、8 张战斗 `bg_*`、`i_icons`、15 个 mp3）。发布时只带这些，**排除** `assets/c_*.webp`（360 个旧单帧）、`sp_* td_* bg_map`、`assets/review/`、`raw*/ frames/ review/`、Python 脚本与 `game*.js`
- [ ] 单文件 ≤ 16MB（当前最大为 `bgm_street.mp3` 约 600KB）
- [ ] 静音按钮与 M 键可用；首次点击后有声音

历史V2（已替代，不用于当前界面）：`node tests/cultivation-v2-browser.test.cjs http://127.0.0.1:8149 review/cultivation_v2_20261003`；透明像素检查：`python3 tools/cultivation_alpha_audit.py`（Pillow）。四个小游戏为候选，真实剧情和奖励未接入。


## 后山固定演出与真实战斗（2026-10-04）

现代装无行走包；使用现有 battle，不以旧防御小游戏按钮作为通过依据。

- 实际对白、战斗命令与两种视口：`node tools_scene/verify_prologue_interactive.cjs`。
- 缺图重试、HP=1失败略过、换衣刷新：`node tools_scene/verify_prologue_recovery.cjs`。
- 后续村中与风起栖河段至山居：`node tools_scene/verify_opening_complete.cjs`。

三个脚本使用本地8786静态服务，运行在独立浏览器会话；故障fixture仅用于恢复测试。

## 当前四向走跑 GIF 评审（2026-10-04 OC.5）

运行 `node tools_scene/render_motion_review_oc5.cjs`，输出[六张 GIF 与参数](../review/motion-review-20261004-oc5/index.html)。脚本调用生产切片、移动、跟队及人物绘制函数，校验导出帧数与总时长；不修改游戏速度、素材或存档。字体与 Canvas 依赖路径为当前本机配置。

这属于本地函数渲染，不能代替浏览器实走、碰撞和前景遮挡验证。当前走跑体验已退回整改，后续必须按[动作适配方案](archive/design/map-character-motion-plan.md)检查时间连续性、同地图移动与手感，单帧技术通过不能放行动作体验。


## 汉皋城系统交互原型（2026-10-09）

范围：`review/hangao-town/` 独立原型的规则与交互；不涉及 8792 当前游戏、地图、剧情和美术。

```bash
node --test tests/hangao-town-core.test.cjs
```

```bash
PLAYWRIGHT_PATH=<playwright 或 playwright-core 包路径> node tests/hangao-town-ui.test.cjs
```

逻辑测试 16 项；浏览器测试 29 项（挂轴式界面；2026-10-10 起时间为方案 A；自起临时静态服务，1280×720 交互，1280／1920 舞台等比缩放无溢出，控制台无报错）。原 `/private/tmp/claude-501/pw` 下的 playwright 包已被系统清理，需要时用 `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install playwright-core` 装到临时目录，浏览器沿用 `~/Library/Caches/ms-playwright/chromium_headless_shell-1228`。
