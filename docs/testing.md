# 测试与评审

项目以 Node 内置测试、**无头浏览器驱动真实页面**（Playwright + Chromium）、碰撞审计与截图人工评审验证。

襄阳片段回归（2026-09-29）：在项目目录依次运行 `node --test tests/toast.test.cjs tests/npc-actions.test.cjs`、`node tests/battle-error-regression.cjs`、`node tests/xiangyang-slice.test.cjs`、`node tools_scene/xiangyang_regression.cjs`、`node tests/xiangyang-combat-balance.cjs`。分别检查提示与 NPC 菜单、战斗异常、单片段角色／存档／结算、剧情状态分支和正常数值战斗抽样。`tools_scene/street_flow.cjs <截图目录> '#xiangyang'` 通过真实寻路和键盘对话走街市流程，但为了聚焦场景交互会把敌人 HP 压到 1；它不用于证明战斗平衡。战斗抽样使用原战斗逻辑、固定种子与自动选招，详情见[襄阳测试范围](design/xiangyang-test.md)。

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
node tools_scene/audit.cjs [输出目录=review/scene_v4/audit] [场景id…]   # 全部 8 个场景的碰撞/交互/家具净空/出入方向审计
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

1. **离线**：v2 场景看 `review/scene_v2/<id>_layout_dbg.png`（`tools_scene/build_scene.py` 输出），（2026-09 S1 起第一章 8 个场景全部是程序排布，旧版 5 图的 `masks.py` 手标 mask 已退役），修改布局/多边形后重跑（数据块自动写回 `story.js`）。
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
