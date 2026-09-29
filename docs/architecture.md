# 架构

## 1. 模块与加载顺序

`index.html` 末尾：

```html
<script src="js/art.js"></script><script src="js/core.js"></script><script src="js/ui.js"></script><script src="js/scene.js"></script><script src="js/idle.js"></script><script src="js/story.js"></script><script src="js/battle.js"></script><script src="js/vfx.js"></script><script src="js/main.js"></script>
<script src="js/audio.js"></script>
```

全部是经典脚本（非 module），顶层 `const/let/function` 进入共享的全局词法作用域，后加载的脚本可直接引用先加载脚本的标识符。**顺序有依赖**：

| # | 文件 | 职责 | 依赖 |
|---|---|---|---|
| 1 | `art.js` | 定义 `window.ART`：`frames` `scale` `sheet` `icons` `walk` `run`（由管线脚本回写部分字段） | 无 |
| 2 | `core.js` | `IMG` 资源表、`CHARS/PORTS/ASSETS` 清单、`BRIGHT`、`loadAll()`/`sliceSheets()`/`loadOpt()`/`brightFg()`；工具 `$ rnd ri chance wait clamp`；画布 `cv/g`、`W=960 H=540`；数据 `ORIGINS STATN STATD SKILLS ITEMS`；存档 `S newState save loadSave derived DOG`；`fade placeName toast drawBg drawSprite vignette` | `ART` |
| 3 | `ui.js` | 对话 `say choose talk narr gain giveItem learn moral`；大地图 `NODES openMap drawMap`；面板 `openPanel closePanel shop storyQuiz coupletGame rumorBroker bagPanel`；`hud()`；`let mode`；`titleScreen creation` | core |
| 4 | `scene.js` | 地图常量（`GW/GH/WW/WH` 按场景，`setDims`）、`SC={}`、`player cam keys`、碰撞/寻路、`goScene interact takeExit`、路人/同伴、`drawScene`、氛围特效、`reviewStart` | core, ui |
| 5 | `story.js` | 填充 `SC.*`（8 个场景）、`mk()` 敌人模板、`ending()`、各场景氛围 `Object.assign`、文件末的生成数据块（`// <scene:id>` v2 地图的 gw/gh/mask/props，`// <mask:id>` 旧版地图的 mask；由 `tools_scene/` 脚本自动替换）、青蚨散支线、`COMPANIONS`、`onCompanionTalk`、`questLine/questLog` | 以上全部 |
| 6 | `battle.js` | `battle(opt)` 及全部战斗逻辑/绘制；给 `SKILLS` 追加同伴招式 | core, ui |
| 6b | `menu.js` | 江湖菜单与养成（W4）：重声明 `derived mkHero mkAlly bagPanel equipItem statRows ending`，包裹 `battle shop hud`；新增物品/栏位/词条、`S.mates`、8 页菜单（样式注入 `#jm-css`）。目标设计见[成长与战斗](design/growth-combat.md)、[队伍与宠物](design/party-pets.md)、[表现规范](design/presentation.md) | core, ui, story, battle, bui（`BUI.paper/swash/enso/seal/blot/face`） |
| 7 | `main.js` | 画布/键盘/触屏输入、`frame()` 主循环、启动 `loadAll().then(...)`、5 秒自动存档 | 全部 |
| 8 | `audio.js` | IIFE，自包含；**只包裹**全局函数（`say choose toast openPanel closePanel fade`）并轮询 `mode/cur/player/SC/S/TS`，不改其实现 | 全部 |

> `mode` 在 `ui.js` 中 `let mode='title'` 声明，但 `core.js` 的 `vignette()` 也读取它——函数在运行时才执行，故无 TDZ 问题。

## 2. 全局状态

| 标识符 | 所在 | 说明 |
|---|---|---|
| `S` | core.js | 存档对象（见下），`null` 直到建角/读档/评审启动 |
| `mode` | ui.js | `'title' \| 'scene' \| 'map' \| 'battle' \| 'end'` |
| `cur` | scene.js | 当前场景对象 `SC[id]` |
| `player` | scene.js | `{x,y,dir,walk,vx,vy,moving,path,goal,trail,talkTo,running,runPath,runK}`（世界像素） |
| `cam` / `camC` | scene.js | 镜头左上角 / 镜头平滑中心（世界像素） |
| `keys` | scene.js | 按键状态 `left right up down shift run` |
| `busy` / `dlgBusy` | scene.js / ui.js | 剧情脚本执行中 / 对话框打开中，二者任一为真即冻结移动与交互 |
| `wanderers` `followers` `particles` `bubbles` `amb` | scene.js | 路人、同伴、粒子、闲话气泡、水面/鸭/鸟状态 |
| `IMG` | core.js | 键 → `Image` 或切片后的 `<canvas>`（带伪 `naturalWidth/complete`） |
| `ART` | art.js | 美术清单，见 [art-pipeline.md](art-pipeline.md) |
| `B` | battle.js | 当前战斗状态，非战斗时 `null` |
| `SC` | scene.js | 场景表 |

### 存档对象 `S`（`newState()`）

```js
{name:'无名', origin:'orphan', lv:1, exp:0, pts:0,
 st:{str:3,con:3,agi:3,wil:3,wis:3}, moral:10, hp:1, mp:1, silver:0, atkBonus:0, mpBonus:0,
 skills:{fist:1}, weapon:null, armor:null, bag:{bun:2}, party:[], flags:{}, scene:'temple', x:480, unlocked:{temple:1}}
```

运行中追加的字段：`y`（主循环每帧写 `S.x/S.y`）、`rumors`（已买消息 `{id:1}`）、`aff`（同伴好感 `{suzhi:n}`）、`quests`（W3 支线）；menu.js 惰性补齐（`mnEnsure()`，旧档无需迁移脚本）：`acc`（主角佩饰）、`load`/`skSeen`（主角武学栏 ≤6 与已见武学）、`chapter`（章节，第一章结算后为 2）、`mates`（同伴养成）：

```js
S.mates.suzhi={st,pts,lvSeen,equip:{weapon,armor,acc},skills:{k:重},load:[..],skSeen:[..],hp:null|n,mp:null|n,mpBonus}  // hp/mp null=满
```

同伴与主角共享境界；`lvSeen` < `S.lv` 时补发 `3×差` 属性点并回满。战斗中同伴只带 `load` 内武学，气血内力战后写回（`battle` 包裹层）。`skills` 值为「重」数（等级）；`bag` 为 `{itemKey:数量}`；`party` 为同伴 id 数组（`'suzhi'` `'dog'`）；`unlocked` 为大地图节点/区域 id。

派生属性 `derived(u=S)`（menu.js 重声明；公式本体未变，D2 的 03 §3.2 目标公式待实现）：

```
mhp = 60 + con*14 + lv*12
mmp = 30 + wil*7 + wis*2 + lv*5 + mpBonus
atk = 8 + str*3 + lv*2 + 武器atk + atkBonus
def = con + wil*2 + 护甲
spd = agi；crit = 5 + wis*2 + 武器crit；dodge = round(agi*1.5)；move = 2 + floor(agi/5)
```

装备合计：`u.weapon/u.armor/u.acc` 三栏的 `weapon.atk→atk`、`weapon.crit→crit`、`armor→def`，再加各物品 `fx` 词条（五维类先加到五维再算派生）。返回值另带 `st`（含装备的五维）与 `fx`（装备合计）。

## 3. 存档（localStorage）

| 键 | 写入 | 内容 |
|---|---|---|
| `xjh.save` | `save()`：`goScene` 进场时、`recruit()` 结束、建角后、以及 `main.js` 中 `setInterval(...,5000)`（仅 `mode==='scene'&&!busy`） | `JSON.stringify(S)` |
| `xjh.mute` | `audio.js` `setMute()` | `'1'`/`'0'` |

`loadSave()` 在 `titleScreen()` 调用；有档则显示「继续江湖」，恢复 `cur=SC[S.scene]`、`player.x=S.x`、`player.y=S.y`。`ending()` 由 menu.js 覆盖为章节结算页：正史结局发要物 `canglong_map`、置 `S.chapter=2` 并**保留存档**；落草结局（非正史）清档。

## 4. 启动与主循环

```js
// main.js
loadAll(p=>$('lbar').style.width=p*100+'%').then(()=>{
  $('loading').hidden=true;
  if(location.hash==='#street'||location.hash==='#streetbright')reviewStart(); else titleScreen();
  requestAnimationFrame(frame)});
function frame(t){const dt=Math.min(50,t-last);last=t;
  if(mode==='title'||mode==='end'){drawBg('bg_title');vignette();}
  else if(mode==='scene'&&cur){updateScene(dt);drawScene(t);S.x=player.x;S.y=player.y}
  else if(mode==='map')drawMap(t);
  else if(mode==='battle'&&B)drawBattle(t);
  requestAnimationFrame(frame)}
```

`loadAll()`：加载 `ASSETS`（`bg_title`、`m_world`、旧版地图 `m_temple m_temple_out m_gate m_bgate m_cave`、v2 程序排布地图及其素材图集 `m_street_v2(_props) m_alley_v2(_props) m_ferry_v2(_props)`、非可选角色的 `s_*` 与 `p_*`），可选资源（`ART.walk/run` 表 `w_/r_`、`OPT_CHARS/OPT_PORTS`=`suzhi`）静默加载；`BRIGHT` 时再加载每个角色的 `s_{c}_bright` 并替换 `IMG['s_'+c]`。最后 `sliceSheets()` 把表切成独立画布。（旧街市 `m_street` / `m_street_fg` / `m_street_bright` 与旧 `m_alley` `m_ferry` 已不再加载，文件保留作对比；`brightFg()` 仍在 core.js 但无调用。）

dt 单位毫秒，上限 50。移动速度常量均为「世界像素/毫秒」。

## 5. 场景生命周期

```js
async function goScene(id,at,dir){
  await fade(async()=>{cur=SC[id];buildGrid(cur)/* 内含 setDims(cur) */;S.scene=id;S.mapv[id]=cur.mapv;const p=at||cur.start;
    player.dir=entryDir(cur,p,dir);player.x=p[0]*TS;player.y=p[1]*TS; /* 清速度/路径/足迹/粒子 */ spawnWanderers()/* 内含 placeFix() */;
    S.unlocked[cur.region||id]=1;/* 入场：退到入口点背后 ENTER_WALK(52px)，alpha=0，animWalk 走回入口点并淡入 */;/* 镜头对准入口点 */;save()});
  await 入场动画;placeName(cur.name);hud();
  if(cur.enter){busy=true;await cur.enter();busy=false;hud()}}
```

- **出入方向（2026-09 场景 v3，目标场景设计见 design/presentation.md）**：出口 `exits[i].dir`（'u/d/l/r'）为走出方向，缺省按出口矩形贴哪条地图边推断（`exitDir(e,sc)`；门洞/庙门这类内部出口必须显式写）。`takeExit(e)`：主角沿 `dir` 再走 `EXIT_WALK`(44px) 并淡出（`animWalk`，busy 期间由 `updateScene→stepAnim` 推进，无视碰撞与出口判定）→ `goScene(e.to,e.at,dir)`：新场景里朝**同一方向**从入口点背后走进来、淡入。从大地图进场（`goScene(id,at)` 不带 dir）时 `entryDir()` 取离入口点最近的 `to:'map'` 出口方向的反向。主角与同伴绘制时乘 `player.alpha`。
- 规则：相邻两图的出入方向一致——A 图里向下走出到 B，则 B 回 A 的出口方向必须是 'u'，且 `e.at` 在该回程出口旁（`audit.cjs` 检查）。

- `fade(fn)`：`#fade` 加 `on`（黑场）→ 等 460ms → 执行 `fn` → 60ms → 去 `on` → 300ms。
- `buildGrid(sc)`：先 `setDims(sc)` 切换世界尺寸，再（只算一次）缓存 `sc.grid`（粗格）、`sc._m/_ms`（mask 位图与每位像素数）。`updateScene/drawScene` 每帧也会 `setDims(cur)`，所以直接赋值 `cur=SC[x]` 的代码（ui.js 读档、测试脚本）只要调用过 `buildGrid` 即可。
- `placeFix()`（在 `spawnWanderers()` 开头调用，读档 / 进场 / 评审直达都会经过）：① 场景改版（`sc.mapv` 与 `S.mapv[id]` 不同）且存档停在该场景时，用 `sc.migrate(x,y,旧版本号)` 把旧版世界坐标换算成新版（街市/偏巷 v2→v3 只是局部改动，`migrate` 对 v2 原样返回，交给②吸附）（取最近的旧地标，放到新版同一地标旁），并写回 `S.mapv[id]`；② 主角若不可站（卡墙）或落在出口区内，吸附到最近的可站且不在出口区的点（8px 步长全图搜索，只在异常时执行）。
- `spawnWanderers()`：刷新 `cur._npcs`（按 `show()` 过滤后的 NPC 缓存），生成路人、`ambInit()`，`resetFollowers()`。
- 出口：`updateScene` 每帧检查主角所在格是否落在某个 `exitsOf(cur)` 的 `r` 矩形中，是则 `takeExit(e)`：先走出淡出，`to==='map'` 打开大地图，否则 `goScene(e.to,e.at,exitDir(e))`。
- 大地图 `openMap()`：记录返回点；取消时用 `mapBackAt()` 从出口朝场景起点挪出出口区，避免立刻再次触发。首次去江陵渡口会触发一次狼群战（`road_wolf` 标记）。
- `reviewStart()`（scene.js 末尾）：`S=newState()`，名「萧白」、`st={str:4,con:4,agi:4,wil:3,wis:3}`、银两 40、学会 `jingxin`、`flags.gate_ok=1`、`unlocked.xiangyang=1`、满血满蓝，直接 `mode='scene';cur=SC.street`，主角站在 `start`，朝向 `cur.startDir||'u'`（街市 v3 为南大街底、朝北 `'u'`，即从南门进城的落点）。不经 `fade`、不读档。

## 6. 坐标系

| 常量（scene.js） | 值 | 含义 |
|---|---|---|
| `W,H` | 960×540 | 画布逻辑分辨率（core.js） |
| `TS` | 40 | 格子边长（世界像素） |
| `GW,GH` | **按场景**：`sc.gw×sc.gh`，缺省 48×27 | 格子数（`let`，`setDims(sc)` 更新；街市 v2 66×39、偏巷/渡口 v2 60×33） |
| `WW,WH` | **按场景**：`GW*TS × GH*TS`，缺省 1920×1080 | 世界尺寸（街市 v2 2640×1560，偏巷/渡口 v2 2400×1320）；`sceneW(sc)/sceneH(sc)` 可不切场景直接取 |
| `ZOOM` | 5/6 | 世界→屏幕缩放；可见世界 `VW×VH`=1152×648 |
| `CHAR_H` | 92 | 主角世界高度；其他角色 × `ART.scale[k]`（缺省回落 `SIZE[k]`） |
| `SPEED` | 0.2 | 走速（世界像素/ms）；跑 × `RUN_MUL=1.7` |

- 场景数据里的 `start`、`npcs[].x/y`、`exits[].at`、`extras[].x/y/pts`、`walk/block/exits[].r/box/dust/water` 都是**格坐标**（可带小数；矩形 `[c0,r0,c1,r1]` 含端点）。
- `lights`、`cloths`、`ducks`、`fgp`、`fx()` 中 `embers/smokeAt` 的坐标是**世界像素**。
- 地图源图（旧版 640×360；v2 为 `gw*40/3 × gh*40/3`，如街市 880×520）以 `imageSmoothingEnabled=false` 绘制到 `WW×WH` 世界：1 源像素 = 3 世界像素；乘 ZOOM 后屏幕上 1 源像素 = 2.5 屏幕像素。新场景的源像素宽高必须是 40 的倍数（×3 后能被格宽 40 整除）。
- 精细碰撞 mask：`sc.mask={w,h,d}`，每位 = `WW/w` = **8 世界像素**见方（1=可走），`d` 为 base64 位图（MSB 在前）。**现在 8 个场景都有 mask**：旧版 5 图（庙/庙外/城门/寨门/山洞）为 `w:240,h:135`，由 `tools_scene/masks.py` 手标多边形生成；v2 三图（街市 330×195、偏巷/渡口 300×165）由 `tools_scene/build_scene.py` 按素材占地自动生成。有 mask 时 `ptOk` 走 mask，粗格 `walk/block` 仅用于兜底和 `sc.grid`。
- 镜头：`camFocusY()=player.y-CHAR_H*.45`，死区 7%×6%，带速度前瞻，指数平滑（τ=170ms），夹在地图内；绘制时镜头按 `ZOOM` 取整对齐像素。

## 7. 碰撞

- `standOk(x,y)`：脚底 5 个采样点（中心、左右 ±`FOOT_X=7`、前 +3、后 -5）全部 `ptOk`。宽松原则：宁可略贴边，不要空气墙。
- `npcBlock(px,py,self)`：剧情 NPC 为纵向压扁（dy×1.8）的椭圆，半径 `max(12, npcH*.15)`；主角已与 NPC 重叠时允许向外脱困。站桩路人只挡其他路人，不挡主角（主角挤过时路人侧身让开，最多离原位 26px 后回位）。
- 移动：`walkable()` 失败时分轴沿墙滑动；完全卡住且在走路径时结束路径（若在走向对话目标且距离 <110 则直接交谈）。
- 进场/读档站位不合法时由 `placeFix()` 吸附（见 §5）。

## 8. 绘制顺序（`drawScene`）

1. `g.scale(ZOOM)` + 平移镜头；地图 `cur.bg`（最近邻）。
2. `cur.fx(t)`（每帧回调，通常生成粒子）。
3. `drawWater`（水面粼光）→ `drawDucks` → `drawExits(t,0)`（出口区高亮）→ `drawMarker`（点击目标圈）。出口标签与箭头 `drawExits(t,1)` 在深度排序列表之后再画，不会被建筑/树遮住。
4. **深度排序列表** `DL`（按 y 升序）：
   - kind 0 剧情 NPC（`n.y*TS`，含名字标签/「!」任务标记/无 sp 的闪光点）
   - kind 1 路人 `wanderers`
   - kind 2 同伴 `followers`
   - kind 3 主角
   - kind 4 前景块 `cur.fgp` 的每一项 `[x,y,w,h,底边y]`（仅视野内），以底边 y 排序：角色 y 小于底边时被遮挡
   - kind 5 摆布 `cur.cloths`（排序 y = 第 6 项或 `y+h`）
   - kind 6 单体素材 `cur.props` 的每一项 `[atlasX,atlasY,w,h,worldX,worldY,底边y]`（仅视野内），从图集 `IMG[cur.propImg]` 取源像素、×`cur.propK`（3）绘制，以底边 y 排序：角色走到建筑/树/摊位底边以北即被屋檐、树冠遮住。底图里已烘焙了同样的像素，这里只是按深度再画一遍（v2 场景用它代替 `fg/fgp`）
5. 有 `cur.fg` 但无 `fgp` 时整张前景图盖在最上层。
6. `updParticles/drawParticles`（尘土、烟、落叶、萤火、火星）→ `drawBirds` → `drawBubbles`（路人闲话）。
7. 退出世界变换；`drawLights(t)`（屏幕空间：`cur.dark` 夜色遮罩按光源和主角 `heroLight` 挖洞，再以 `lighter` 叠暖光）；`vignette(cur.tint)`。`BRIGHT` 且探索模式时暗角减弱为 .18 且忽略 `tint`。

角色绘制 `drawChar()`：移动时优先 `ART.run`（奔跑）/`ART.walk` 专用表，按走过的距离推进帧（步幅 = 身高 × `.24`/`.16`）；否则用 4 帧表按 `CYCLE4=[1,2,3,2]`；缺左右帧时镜像另一侧；静止时第 0 帧 + 呼吸缩放。`!BRIGHT` 时会按 `CHAR_GRADE` 调色并缓存。

## 9. 输入

| 输入 | 行为 |
|---|---|
| WASD / 方向键 | 8 向移动（朝向 4 向带迟滞） |
| Shift 按住 / 同一方向键 280ms 内双击 | 奔跑（双击跑到松开所有方向键为止） |
| E / 空格 | 与最近目标交互（场景 NPC / 互动点 80px 内）。**跟随中的同伴不参与**（与同伴交谈走江湖菜单·队伍页 → `window.onCompanionTalk`） |
| I | 打开「江湖」菜单（`bagPanel`） |
| M | 静音切换（audio.js） |
| 对话中 空格/Enter/E 或点击 | 先补全文字，再推进；选项用数字键 1-n、↑↓/W S |
| 菜单 Q/E、←→、1-8 | 切换标签（1–5 ui.js，6–8 menu.js）；Z/C 或 [ ] 切换人物；Esc 关闭（丢弃待定加点） |
| 大地图 Esc/Enter | 取消/确认 |
| 点击地面 | A* 寻路走过去；路径长 > 8 格（触屏 > 5 格）或双击（320ms 内、60px 内）自动奔跑 |
| 点击 NPC | 80px 内直接交互，否则走到其身侧（优先靠主角一侧）后自动交谈（`player.talkTo`） |
| 触屏 `#tpad` | `(pointer:coarse)` 时显示方向键 `#tu #tl #tr #td` 与交互键 `#te` |

### A* 寻路（`findPath`）

- 规划网格：有 mask 时 16px（`NS=16`，可站判定用 `standOk`），否则 40px 粗格；缓存在 `cur._nav`。
- 每次寻路复制通行表，把**站立的剧情 NPC**（有 `sp`）周围椭圆区域标为障碍（目标点附近、与主角重叠的除外）——避免路径穿人后卡住。路人不参与。
- 起点/终点不可走时吸附到最近可走格；8 邻接、禁止斜穿墙角；二叉堆开放表；启发 = 欧氏距离。
- 结果做「拉直」：从当前点贪心跳到最远的可直达路点——直达判定 = `lineOk`（每 8px 采样 `standOk`）**且**不穿过被剧情 NPC 占住的导航格（2026-09 修复：以前拉直只看地形，会把路径拉成直线穿过站着的 NPC，走到跟前被挡住卡死，例如从包打听身旁去偏巷出口）。
- `setPath(tx,ty,run)` 设置 `player.path/goal/runPath`。

## 10. 同伴跟随

逸剑风云决式链式跟随：主角每移动 ≥4px 在 `player.trail` 头部压入 `[x,y,dir]`（最多 90 点）。第 i 个同伴目标点为沿足迹距离 `FOLLOW_GAP*(i+1)`（52px）处（`trailAt`）。只走主角走过的路，因此不穿墙、不被路人挡；距离 > 400 直接瞬移；主角跑或落后时同伴也跑；停下 350ms 后转向主角。进场时 `seedTrail()` 沿主角背后铺虚拟足迹，同伴排在身后。`S.party` 变化时自动 `resetFollowers()`。同伴绘制用 `COMPANIONS`/角色 id 作精灵键（`drawChar(o.m,...)`，`o.m` 即 `'suzhi'`/`'dog'`）。跟随同伴**不是**探索交互目标（`nearest()` 只看 `cur._npcs`，2026-09 起）：与同伴交谈由江湖菜单队伍页调用 `window.onCompanionTalk(id)`；剧情需要同伴在某场景里"站着等你"时，在该场景 `npcs` 里另放一个带 `show()` 条件的 NPC（目标规则见 design/party-pets.md）。

## 11. 路人（extras）

`spawnWanderers()` 由 `cur.extras`（及旧格式 `cur.crowd`）生成，见 [content-guide.md](content-guide.md)。行为：`stand` 站桩（主角 90px 内转头看）、`wander` 在 `box` 内随机走（需直线可达）、`run` 快速乱跑（速度 .13）、`patrol` 沿 `pts` 巡逻（.05）。主角 34px 内让路。`barks` 在主角 230px 内随机冒气泡，同屏 ≤2 个，间隔 9–16s。

## 12. 音频钩子

`audio.js` 通过 `wrap(name,f)` 用 `eval` 重新赋值全局函数（顶层 `function` 声明可被重新赋值），挂上音效；并每帧轮询 `mode/cur/player`：探索模式下按 `SC` 反查场景 id 选择音景、按主角位移播放脚步、街市里按到铁匠距离播打铁声、定时倒茶声；`S.silver` 减少时播钱币声。战斗通过 `bsfx()` 调 `window.__audio.sfx`。详见 [audio.md](audio.md)。

## 13. DOM 结构（index.html `#game`）

`#cv`（画布）、`#hud`、`#place`（地名淡入）、`#prompt`（交互提示）、`#tpad`（触屏键）、`#dlg`（对话框：`.face .mini .who .txt .choices .more`）、`#mapui`、`#panel`（通用面板）、`#toast`、`#fade`、`#loading`。战斗时动态插入 `#bt`（在 `#dlg` 之前）与 `<style id="battle-css">`；audio.js 插入 `#sndbtn`。

另有旧战斗 UI 残留节点 `#blog #border #bhud/#bmenu`：`battle()` 开始时将其设为 hidden，当前版本不再使用。


## 附：新增模块

| 文件 | 职责 | 依赖 |
|---|---|---|
| `menu.js` | 见 §1 表 6b；截图与冒烟测试 `review/menu/menu_test.cjs` | 同上 |
| `idle.js` | 可交互 NPC 待机活动：`npcIdle()` 返回当帧朝向/位移/踏步，`npcIdleFx()` 画职业小动作（打铁火星、茶水热气…）与表情气泡；`scene.js` 的 `drawNpc()` 调用 | scene（`spKey faceTo player TS`） |
| `vfx.js` | 战斗像素特效 `VFX`（等级预算、各招式 cast/hit、破防）与主角战斗动作表绘制 `VFX.drawHero()`；`battle.js` 在出手/受击/破防/绘制处调用。规范见 [vfx.md](vfx.md) | battle（`B unitH SKILLS BSK`） |
