# 内容编写指南

状态：现行　最后核对：2026-10-19

> **2026-10-19：** `#street`、`#streetbright`、`#xiangyang` 襄阳演示入口与旧标题／建角流程已撤除，访问这些后缀直接进入栖河首页；`js/story.js` 的襄阳剧情、`quests.js`、`xiangyang-*.js`、`npc-*`、`containers.js` 已移入 `_attic/2026-10-19-deprecated/`。本页涉及它们的内容只作历史记录，见[弃用入口清理](updates/2026-10-19-deprecated-entries.md)。

所有剧情内容在 `js/story.js`，数据表在 `js/core.js`（`SKILLS` `ITEMS` `ORIGINS`）与 `js/battle.js`（`BSK` `FOE_DEF` `PARTY_DEF`）。剧情脚本是 `async` 函数，依次 `await` 对话/选择/战斗。

## 1. 场景定义 `SC[id]`

```js
SC.myscene={name:'地名',bg:'m_myscene',start:[24,20],region:'xiangyang',
  walk:[[c0,r0,c1,r1],...], block:[[...]],
  npcs:[...], exits:[...], extras:[...],
  async enter(){ /* 每次进场执行 */ }};
```

### 字段一览（均为 scene.js / story.js 实际读取的字段）

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string | 地名（HUD 左上、`placeName` 淡入） |
| `bg` | 资源键 | 地图底图，如 `'m_temple'`（旧版，1920×1080）或 `'m_street_v2'`（v2，按 `gw/gh`） |
| `gw` / `gh` | 格数 | 世界尺寸（缺省 48×27 → 1920×1080）；v2 场景由 `build_scene.py` 数据块写入 |
| `startDir` | `'d'\|'l'\|'r'\|'u'` | 评审直达等从 `start` 入场时的朝向（`reviewStart` 用） |
| `mapv` / `migrate(x,y)` | number / fn | 地图版本与旧档坐标迁移：改版时 `mapv` 加 1，`migrate` 把旧版世界坐标换算为新版（见 architecture.md §5 `placeFix`） |
| `props` / `propImg` / `propK` | 数组 / 资源键 / 数字 | v2 单体素材深度排序表 `[atlasX,atlasY,w,h,worldX,worldY,底边y]`、图集键、源像素→世界倍数（3）；由 `build_scene.py` 生成 |
| `start` | `[c,r]` 格 | 默认入场点（`goScene` 未给 `at` 时） |
| `region` | string | 进场时 `S.unlocked[region]=1`（缺省用场景 id），对应大地图节点 id |
| `walk` / `block` | `[[c0,r0,c1,r1]]` | 粗格可走矩形并集 / 障碍矩形（含端点） |
| `mask` | `{w,h,d}` | 可选精细碰撞位图（base64，1=可走），由管线生成，见 art-pipeline.md |
| `npcs` | 数组 | 剧情 NPC / 可交互物，见下 |
| `exits` | 数组 | `{r:[c0,r0,c1,r1], label, to:'场景id'|'map', at:[c,r], show()}` |
| `extras` | 数组 | 氛围路人，见下；旧格式 `crowd:[[sp,c0,r0,c1,r1]]` 视为 wander |
| `enter` | async fn | 进场脚本（运行时 `busy=true`） |
| `fx` | fn(t) | 每帧回调，常用 `embers(x,y,色)` `smokeAt(x,y)` `motes()` `leaves()` `fireflies()` |
| `fg` | 资源键 | 前景遮挡层（与地图同尺寸，透明处为空） |
| `fgp` | `[[x,y,w,h,底边y]]` 世界像素 | 前景分块，按底边 y 与角色深度排序；底边 29997 等大值 = 永远在上 |
| `cloths` | `[[x,y,w,h,'#色',底边y?,相位?]]` 世界像素 | 随风摆动的布（上沿固定） |
| `lights` | `[[x,y,r,'r,g,b',flicker?]]` 世界像素 | 光源；颜色缺省 `'255,150,60'`，flicker 缺省 1 |
| `dark` | css 颜色 | 夜色遮罩，在光源与主角处挖亮 |
| `heroLight` | number | 主角周身亮区半径（缺省 110） |
| `tint` | css 颜色 | 全屏色调（`BRIGHT` 模式探索中被忽略） |
| `grade` | css filter | 角色调色覆盖（仅 `!BRIGHT` 生效） |
| `dust` | `true` \| 矩形数组 | 脚下扬尘区域；`dustC` 自定义尘色 |
| `water` | 矩形数组（格） | 水面粼光 |
| `ducks` | `[[x,y,x0,x1]]` 世界像素 | 左右游的水鸭 |
| `birds` | `true` | 偶尔飞过的鸟群 |

> scene.js 注释里提到的 `leaves:true` / `smoke:[[x,y]]` 字段**实际未被读取**；落叶和炊烟需在 `fx()` 中调用 `leaves()` / `smokeAt()`。

### NPC

```js
{id:'smith', name:'铁匠', sp:'c_smith', x:26.35, y:15.05, dir:'r', verb:'买卖',
 show:()=>true,            // 可选：返回 false 则不出现
 mark:()=>!hasFlag('x'),   // 可选：头顶显示「!」
 fixed:false,              // 可选：true 则交谈时不转身
 h:120,                    // 可选：显示高度覆盖
 async act(n){ ... }}      // 交互脚本，n 即该 NPC 对象
```

- `sp:null` 表示无精灵的可交互物（画成闪光点，如篝火、古井、挖掘点 `digSpot(id,x,y,reward)`）。
- `name`/`sp` 可以是 getter（苏芷在未知名前叫「素衣女子」）。
- 提示条显示 `E {verb||'交谈'} · {name}`。

### extras（路人）

```js
{sp:'villager', mode:'stand'|'wander'|'run'|'patrol', x,y, dir, box:[c0,r0,c1,r1], pts:[[c,r],...], barks:['...'], show()}
```

| mode | 需要 | 行为 |
|---|---|---|
| `stand` | `x,y,dir` | 站桩；主角靠近转头；被挤会侧身让开再回位 |
| `wander` | `box` | 在框内随机走，停顿 1.5–4.5s |
| `run` | `box` | 快速乱跑（孩子） |
| `patrol` | `pts` | 依次巡逻各点，到点随机转向 |

`barks` 为闲话气泡文本（主角 230px 内随机冒出）。路人纯氛围，不可交互。

## 2. 对话与脚本 API（ui.js）

| 函数 | 说明 |
|---|---|
| `await say(who,text,sp)` | 打字机显示一句；`who` 空串为旁白；`sp`（如 `'c_lady'`）决定立绘：`PORTS` 内且资源就绪用 `p_*` 立绘，否则画站立帧小框。`who===S.name` 或 `sp` 为 hero 按主角样式，`FOES` 按敌方样式 |
| `await choose(who,text,opts,sp)` | 显示选项，返回下标（0 起） |
| `await talk(npc,...lines)` | 以 `npc.name/npc.sp` 连说多句（空串跳过） |
| `await narr(text)` | 旁白 = `say('',text)` |
| `await toast(text,ms=1400)` | 屏幕中上提示 |
| `await gain(text)` | `toast(text,1200)` |
| `await giveItem(k,n=1)` | 加入行囊并提示「获得 …」 |
| `await learn(k)` | 习得武学（已会则无事） |
| `await moral(d)` | 道德 ±d，夹在 0–30 |
| `hasFlag(f)` / `setFlag(f,v=1)` | 剧情标记，存于 `S.flags` |
| `await battle(opt)` | 见 [battle.md](archive/battle.md) |
| `await goScene(id,at)` / `openMap()` | 切场景 / 大地图 |
| `hud()` | 刷新 HUD（任务行变化后调用） |

## 3. 任务（questLine / questLog）

HUD 左上与「江湖 · 任务」标签调用 `window.questLine()`（一行字符串）与 `window.questLog()`（`[{done,t,d}]`，`d` 可含 `<br>`）。当前实现只跟踪青蚨散支线（按 `S.flags.xq` 分支），支线完成（`xq>=5`）后提示前往江陵渡口；`chief_dead` 后为空。新增任务时修改这两个函数，并在状态变化后调用 `hud()`。

### 主要剧情标记

| 标记 | 设置处 |
|---|---|
| `awake` | 庙内开场 |
| `pray` | 参拜神像 |
| `well` | 古井取锈剑（需身法 ≥6） |
| `spar` | 与老僧切磋（教学战）后，解锁大地图 `xiangyang` |
| `gate_ok` | 通过城门盘查 |
| `gossip_met` `smith_met` `rumor` `quiz` `couplet` | 街市各 NPC 首次/小游戏完成 |
| `beggar_win` `rooster` | 偏巷吴长老 / 怒晴鸡 |
| `road_wolf` | 首次去渡口的路遇狼群 |
| `ferry_in` `ferry_ev` | 渡口进场 / 喽啰事件处理 |
| `gate_pass` `snake` `chief_dead` `join_bandit` | 黑风寨 |
| `dig_{id}` | 挖掘点已挖 |
| `xq*` `sz_*` `suzhi_met` | 青蚨散支线，见 §8 |

`S.unlocked` 节点：`temple` `xiangyang` `ferry` `bandit`（`NODES` 定义在 ui.js，含 `x,y`（地图相对坐标）`to` `at`）。

## 4. 道具 `ITEMS`（core.js，story.js 追加 `jieyao` `ledger`）

```js
bun:{name:'羊肉馒头',desc:'…',heal:40,price:6}
```

| 字段 | 作用 |
|---|---|
| `heal` / `mp` | 使用回复气血/内力（战斗「道具」菜单也只列出这两类） |
| `weapon:{kind,atk,crit?}` | 兵器；`kind` 决定普攻类型（战斗弱点），`needWeapon` 武学需匹配 |
| `armor` | 防御值 |
| `key:1` | 要物：不可用、不可卖 |
| `book:1` | 使用后选择一门武学 +1 重 |
| `gall:1` | 使用后内力上限 +30（`S.mpBonus`） |
| `price` | 商店售价；卖出半价；无 `price` 不可在商店出售 |

图标：`ART.icons[key]`（`i_icons.webp` 图集），缺失时用 `ICO[key]` 单字（ui.js）。

## 5. 武学 `SKILLS`（core.js）与 `BSK`（battle.js）

`SKILLS[k]={name,kind,mp,pow,range,shape,combo,heal?,stun?,bleed?,needWeapon?,desc}`。其中 `range/shape/combo` 是旧格子战斗的字段，**当前战斗不再使用**（`range` 仅在「江湖 · 武学」面板里显示为「距离」）；战斗行为由 `BSK[k]` 决定：

```js
BSK[k]={t:'拳|剑|刀|棍|暗器', e:'阳|阴|毒|雷', tgt:'foe|foes|ally|allies|self', hits:n, reveal:n, stun:1, bleed:1, buff:1}
```

`t`=兵刃类型、`e`=内劲类型（都用于命中弱点），缺省 `tgt` 时有 `heal` 的为 `ally`、否则 `foe`。新增武学需同时加 `SKILLS` 与 `BSK`；通过 `learn(k)` 给主角。同伴招式（`jinzhen huichun baicao dingshen sniff`）在 battle.js 里 `Object.assign(SKILLS,…)` 追加。

出身专属武学：`ORIGINS.{orphan,beggar,shepherd}.skill` = `jingxin` / `shuaibei` / `bianfa`。

## 6. 敌人

`mk(key)`（story.js）返回模板深拷贝：

| key | 名称 | 精灵 | lv | 备注 |
|---|---|---|---|---|
| `bandit` | 黑风喽啰 | c_bandit | 3 | exp 25 银 8 |
| `wolf` | 野狼 | c_wolf | 3 | exp 18 |
| `snake` | 青鳞巨蟒 | c_snake | 8 | hpMul .55，exp 120 |
| `thug` | 铁臂帮打手 | c_bandit | 2 | exp 20 银 6 |
| `scarliu` | 疤脸刘 | c_bandit | 4 | 有 `ghost`，hpMul .6，exp 70 |
| `chief` | 独眼阎罗 | c_chief | 9 | 有 `ghost`，hpMul .6，exp 200 |

模板字段：`name sp lv st skills h exp silver`，以及战斗可选字段 `shield weak drops hpMul atkMul boss`。未给 `shield/weak/drops` 时按精灵 key 查 `FOE_DEF`：

```js
FOE_DEF={bandit:{shield:3,weak:['拳','棍','暗器','阳'],drops:{bun:25}},
  wolf:{shield:2,weak:['刀','剑','暗器','阳'],drops:{bun:10}},
  snake:{shield:5,weak:['刀','暗器','雷']}, chief:{shield:6,weak:['刀','暗器','阳']}};
```

（因此 `thug`/`scarliu` 与 `bandit` 共享盾值与弱点。）也可以直接在 `battle({foes:[{name,sp,lv,st,skills,h,…}]})` 里写一次性敌人（老僧、吴长老、怒晴鸡就是这样），此时无 FOE_DEF 项则盾 3、弱点 `['拳','刀']`。

## 7. 同伴

- `S.party`：同伴 id 数组。加入：`S.party.push('suzhi')`；地图跟随与战斗参战自动生效。
- `window.COMPANIONS={suzhi:{name:'苏芷',sp:'c_suzhi',role:'医师'}}`（名字用于交互提示）。
- 战斗属性与招式：`PARTY_DEF`（battle.js），见 battle.md。
- 好感：`S.aff.suzhi`，`aff(d)` 夹在 -10..20 并提示；「同伴」标签页 `suzhiCard()` 按好感显示 知己(≥8)/信赖(≥5)/熟络(≥2)/生疏(≥0)/冷淡。
- 闲谈：`window.onCompanionTalk(id)`（story.js）。大黄只会「汪！」；苏芷：主角气血 <50% 且本场景未治疗过（`sz_heal_{scene}`）则回复 35% 气血；好感 ≥5 首次触发白鸟针尾彩蛋（`sz_white`）；否则按场景轮换台词（计数 `S.flags.sz_i`）。
- 苏芷精灵：`SUZHI_SP()` 在 `c_suzhi` 未加载时回落 `c_lady`。
- 大黄：偏巷用羊肉馒头喂狗入队（`DOG` 定义在 core.js）。

## 8. 街市剧情「青蚨散」（story.js 后半）

阶段 `S.flags.xq`（`xqSet(v)` 只升不降）：

| xq | 阶段 | 触发 |
|---|---|---|
| 0 | 未触发 | 街心有倒地的挑夫老周（`zhou`，头顶「!」）与素衣女子 |
| 1 | 查访 | 查看老周 → 苏芷施针，设 `suzhi_met` |
| 2 | 可对质 | 集齐任意 2 条线索（`clueGot`） |
| 3 | 已夺解药 | 茶摊对质 `confront()` 两场战斗获胜 |
| 4 | 已救人，待定去留 | 把解药交给苏芷 → `recruit()` |
| 5 | 苏芷同行 | `recruit` 中同意同行 |

线索标记（在原 NPC 的 `act` 前插入分支，见 story.js 末 IIFE）：

| 标记 | NPC | 内容 |
|---|---|---|
| `xq_c_gossip` | 包打听 | 付 10 两 / 砍价 5 两 / 赊（白送） |
| `xq_c_lady` | 柳三娘 | 未对过对子要先对对子 |
| `xq_c_oldman` | 说书老伯 | 未听过书要先答题 |
| `xq_c_smith` | 铁匠 | xq=2 时的可选对话（不计入线索数，只影响任务提示） |

其他标记：`xq_bun`（给苏芷馒头 +1 好感，仅一次）、`xq_pay`（替三娘交 20 两，跳过第一场打手战）、`xq_w1`（第一场打手战已赢）、`xq_fate`=`spare|guard|rob`（处置疤脸刘：放走 +1 道德 +1 好感 / 押送 +20 两 +2 道德 / 抢钱袋 +35 两 -2 道德 -2 好感）、`xq_decline`（婉拒同行，可再找她 `recruit(true)`）、`xq_tea`（事后在三娘处回满气血内力一次）。

对质流程：选择揭穿（有 ≥2 线索时 +1 道德）/ 代付 / 直接动手 → 若无 `xq_w1`：`battle({foes:[mk('thug'),mk('thug')],bg:'bg_street',noLose:true})` → 苏芷临时入队 → `battle({foes:[mk('scarliu'),mk('thug')],boss:true,noLose:true})`（`finally` 中移除临时队员）→ 获得 `jieyao` `ledger` → 处置。任一战败调用 `lost()`（气血回 60%，可重来）。

`recruit()` 同意后：`S.party.push('suzhi')`、`xq=5`、好感 +1/+2、解锁大地图江陵渡口、`save()`。

## 9. 小游戏系统（ui.js）

| 函数 | 数据 | 返回 |
|---|---|---|
| `shop(n,list)` | `list`=可买 `ITEMS` 键数组；左货单右详情，买入/卖出（半价） | `{bought:[],sold:[],spent,earned}` |
| `storyQuiz(n,Q,reward)` | `SHUSHU`：`[{title,story,q,opts,a,ok,ng}]`，讲一段问一题 | 答对题数；`reward(right)` 需返回 `{line,items:[]}` 用于结算页 |
| `coupletGame(n,list,reward)` | `COUPLETS`：`[上联,正解,干扰1,干扰2,点评]` | 对上副数；`reward` 同上 |
| `rumorBroker(n,R)` | `RUMORS`：`[{id,t,p,tag,tease,txt,unlock?,on?()}]`，已买记在 `S.rumors` | 本次新买的 id 数组；买入时调用 `on()` |

它们都通过 `openPanel()` 打开 `#panel`，`gpShell()` 统一绘制左侧 NPC 立绘（`assets/p_{sp}.webp`）与卷轴标题。

## 10. 培养模式剧情：时间、地点、闲逛与节奏（2026-10-08）

适用于归云谷培养里的所有剧情（师门、主线、来客、闲逛支线）。设计细则与当前一览见 [归云谷一家](design/qihe-map/expansion/guiyun-household.md)。

**每段剧情必须声明**
- `place`（地点键或中文别名，须在 `js/qh-mode-cultivation-scenes.js` 场景总表里登记）与 `time`（`day`／`dusk`／`night`）。背景、地点牌、夜间人物压暗都由总表解析，剧情里不写图片路径。剧情中途换景用 `card('当晚',{place,time})`。
- 开放窗口 `window:[起,止]`（slot＝(月−1)×5＋时段，第二年加 60）。不得跨整月历练（五、十、十六……月）与三月中旬送药（slot 12）。
- 关系加成：每个选项都要给关系值（`bonds`），可以同时给多人；选项之间的数值要有差别，后续剧情会按关系值分歧。人物须在 `qh-mode-cultivation-relations.js` 有往来档案。
- 立绘：现有表情不合场面（受伤、睡着等）时，不要硬套，另做状态档（如 `fang` 的 `hurt_*`、`dou` 的 `sleep`），在剧情定义用 `state:{人物:'状态'}` 或单句 `moods` 指定；新图以本人正式 Q 版为底图编辑，抠图后按头肩轮廓对齐底图。

**闲逛与节奏规则（用户定）**
- 闲逛先选地点；该地点此刻有未完成、条件满足的剧情就开场，多段同时可遇按确定性随机抽一段；没有就是纯逛，不触发任何内容。
- **每个时段闲逛最多遇一段**剧情。
- **触发完一段时间里的全部闲逛剧情，约需该段自由时段的四分之三**。以“第一次去汉皋前”（原写作“第一次去襄阳前”；第一年正月–四月，自由时段 19 个）为基准；之后每段（两次整月历练之间、或年末）按同一比例编排。可遇剧情数 ÷ 自由时段数须在 0.65～0.85 之间：超出就把支线挪到别的时段、改为到期自动开场或删减；不足就补支线。
- 自由时段：处于谷中日常（`mode==='home'`）的时段；整月历练和占整期的剧情（三月中旬送药）不算。
- 校验：`tools_scene/qihe/verify_household.cjs` 的节奏模拟（`PACE=1` 打印各段比例）按“每段自由时段只遇一段、优先去最快到期的地点”从头玩到第二年三月，要求每段剧情全部遇到且比例在区间内。新增或移动剧情后必须跑一次。
