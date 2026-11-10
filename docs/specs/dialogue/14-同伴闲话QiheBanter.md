# 14 同伴闲话 QiheBanter

源：`js/qihe-banter.js`，IIFE 导出 `window.QiheBanter`。**现状：栖河试玩版只有规则与数据，没有界面入口**（无调用 `due`/`prompt` 的 UI）；但它会包裹全局 `battle()` 计交情。移植时实现数据层与存档字段即可，界面待后续章节。

## 1. 常量

- `NAMES = {hero:'萧白', ye:'叶蘅', yinhongying:'殷红缨'}`
- `REL = {ye:'ye', yinhongying:'yin'}`：同伴键 → `world.cultivation.relations` 的键。
- `STAGES = [{at:0,name:'生分'}, {at:6,name:'相熟'}, {at:18,name:'知己'}]`（单位：同队打过的场数）。
- `pairKey(a,b) = [a,b].sort().join('|')`

## 2. 存档字段（挂在全局存档 `S`，函数参数名 `world`）

| 字段 | 含义 |
|---|---|
| `world.kinship[pairKey]` | 两人同队战斗场数 |
| `world.banter.offered[id]` | 出现序号（1 起递增） |
| `world.banter.seen[id]` | 已读完 `true` |
| `world.cultivation.relations[REL].score` | 萧白与该同伴关系值 |
| `world.cultivation.facts[fact]` | 培养事实 |
| `world.cultivation.month` | 月数，`>= 13` 视为萧白满十八 |

## 3. 函数

| 函数 | 行为 |
|---|---|
| `fought(world, opt={}, result)` | `opt.solo/tutorial/storyLesson` 或 `result==='flee'` 返回 0；否则 `world.party` 中属于 `NAMES` 的成员两两 `kinship+1`，返回加的对数 |
| `kinship(world,a,b)` | `{battles, stage, name, next}`；`stage` 为满足 `battles>=at` 的最大序号，`next` 为下一阶 `at` 或 `null` |
| `relation(world,id)` | `relations[REL[id]].score || 0` |
| `blocked(world,b,venue)` | 依次检查，返回第一个原因，空串＝可出现（见 §4） |
| `due(world,venue)` | `list` 中第一条 `blocked` 为空的，否则 `null` |
| `offer(world,b)` | 未出现过则 `offered[id] = 已出现条数+1`；返回 `b` |
| `finish(world,id)` | 无此 id 抛 `没有这条闲话。`；未 offer 抛 `这条闲话还没出现过。`；否则 `seen[id]=true` |
| `book(world)` | 已出现的按序号排序：`{id, title, names:[中文名], read}` |
| `script(id)` | `{id, title, cast: pair, lines}` 或 `null` |
| `prompt(b)` | `pair[0]==='hero'` → `${NAMES[c]}有话跟你说`；否则 `${NAMES[a]}和${NAMES[c]}在说话` |

`battle` 包裹：`root.battle` 存在且无 `__banter` 标记时替换为 async 包装：`r = await base(...)`，再 `fought(S, opt, r)`（异常只 `console.error`），返回 `r`，打标 `__banter=true`。

## 4. `blocked` 检查顺序

1. `!venues.includes(venue)` → `地方不对`（`hangao` 汉皋城，`worldmap` 大地图自由模式）
2. `pair` 中有人不在（`hero` 永远在，其余看 `world.party`）→ `人不在`
3. `offered[id]` 已定义 → `已出现过`
4. `kin` 已定义且 `kinship(pair).stage < kin` → `交情未到`
5. `rel` 已定义且非 hero 那位 `relation < rel` → `关系未到`
6. `fact` 且 `!facts[fact]` → `事情还没发生`
7. `adult` 且 `month < 13` → `萧白未满十八`

## 5. 条目表 `list`（顺序即 `due` 优先级）

| id | pair | venues | 条件 | title |
|---|---|---|---|---|
| yy_herb_wine | ye, yinhongying | worldmap | kin:1 | 药和酒 |
| yy_pharmacy | ye, yinhongying | hangao | kin:1 | 汉皋的药铺 |
| yy_hand | ye, yinhongying | worldmap | kin:1, fact:`gy_yin_past_seen` | 那只手 |
| yy_way_home | ye, yinhongying | worldmap | kin:2 | 回谷的路 |
| hy_city_patient | hero, ye | hangao | rel:50 | 城里的病人 |
| hy_roadside | hero, ye | worldmap | rel:50 | 路边的草 |
| hn_tavern | hero, yinhongying | hangao | rel:50 | 酒肆 |
| hn_back_to_back | hero, yinhongying | worldmap | rel:80, adult | 背后 |

每条 `lines` 由 `L(who, text, mood)` 生成 `{speaker, text, mood}`；`speaker` 为 `NAMES` 键，`mood` 为表情键（`normal`、`fun`、`surprise` 等，按第 05 篇表情规则取立绘）。台词原文在源文件第 19–69 行，移植时原样搬入数据文件（如 `banter.json`）。
