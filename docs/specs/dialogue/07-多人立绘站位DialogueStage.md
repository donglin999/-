# 07 多人立绘站位：DialogueStage

源：`js/dialogue-stage.js`（`add`、`begin`、`end`、`enter`、`layout`、`render`、`avatar`、`boxBottom`、`frameOf`、`withCast`）；调用方 `js/ui.js` `dlgSetup`/`talk`、`js/qihe-chapter.js` `participants`/`sayAll`/`line`/`ask`/`guarded`。只管显示，不写存档。

## 1. 状态

```
state = { scene, actors:[{id, who, sp, slot}], active:id|null, closedAt, scope:{id, token, previous, hasHero}|null }
```

- **身份 `identity(who, sp)`**：`k = sp 去 c_ 后冒号前`；`k` 匹配 `/^(?:opening_)?hero(?:_|$)/` → `'hero'`；否则 `k`，`k` 空则用 `who`。同身份只占一个位置（换表情、换名牌只更新 `who/sp`）。
- **作用域栈**：`begin({id, cast})` 压栈新建空 state（记 `previous`），按顺序 `add` 预置演员，返回 `token`；`end(token)` 仅当栈顶 token 匹配时恢复 `previous`；`withCast(config, fn)` = begin → await fn → finally end。`add` 抛错时恢复旧 state 并抛出。
- `hasHero`：预置 cast 中是否有萧白。

## 2. `add(who, sp, slot)` 入场规则

1. `sp = OpeningCharacters.dialogueSprite(who, '', sp) || sp`；`sp` 空或 `face(sp)==='none'`（没有大立绘）→ 不入场，返回 null。
2. 已在场（同 id）→ 更新 `who/sp`，位置不变。
3. 未指定 `slot` 时自动分配，按顺序取第一个成立的：
   1. 是萧白且左位空 → `left`；
   2. 场上没人且作用域没有萧白 → `left`；
   3. 右位空 → `right`；
   4. 左位空 → `left`；
   5. 中位空 → `center`；
   6. 否则 → `rail`（小头像条，可多人）。
4. 指定的槽位必须是 `left|right|center|rail`；非 rail 槽位重复占用抛错 `重复立绘站位：<slot>`。

## 3. `enter(who, sp)`（每句 render 时调用）

- 若**没有作用域**：清空 state；若 `who` 非空，先把萧白（名 `S.name||'萧白'`，`sp 'c_hero'`）放左位。
- 然后 `who` 非空时 `add(who, sp)`；`active = 该演员 id`（无立绘则 null）。
- 因此在作用域内，说过话的人会累积留在台上直到作用域结束；没有作用域时，每句只有“萧白 + 说话人”。

## 4. `layout()` 显示槽位

- `middle` = 若当前说话人在 `rail` 则为他，否则为 `center` 位的人。
- 每人 `displaySlot`：`left/right` 原样；`=== middle` → `center`；其余 → `rail`。
- 效果：小头像条里的人开口时临时**顶替中位**，原中位的人这一句降到小头像条。

## 5. `render(d, who, sp, {suppress, primary})`

1. `enter(who, sp)`；首次调用时在 `#dlg` 末尾追加 `.dialogue-cast` 和 `.dialogue-cast-rail` 两个容器；每句清空它们。
2. `speakerless = who 非空 && active 为空 && identity 不是萧白`（说话人没立绘）。
3. `hidden = suppress || !who || speakerless`；`hidden` 时 `big=[]`、`small=[]`。否则 `big` = displaySlot ≠ rail 的人，`small` = rail 的人。
4. `speaker = big 中 active 者 || big[0]`；主节点 `.face` 用于 speaker，其余 big 各新建 `div.face` 放进 `.dialogue-cast`。
5. rail 每人一个头像格（03 §4）。`#dlg` 设 `data-cast-count=big.length`、`data-cast-total=全部人数`，加 `.dialogue-staged`，`.hasface = big.length>0`。

### 5.1 立绘几何（全部为 `#dlg` 宽/高的百分比）

```
width  = big.length > 2 ? 29 : 28
cx     = left: 1.5 + width/2 ; right: 100 - width/2 - 1.5 ; center: 50
f      = FRAMES[立绘键]  (06 §2)  → eye, chin, 性别
LINE   = 男 98 / 女 118           (眼线目标，640 坐标)
FACE   = 男 52 / 女 47            (眼线到下巴目标长度)
k      = f ? FACE / (chin - eye) : 1
h      = 72 * k                   (元素高 %H)
w      = width * k                (元素宽 %W)
top    = f ? 28 + 72 * (LINE - k*eye) / 640 : 28   (%H)
left   = cx - w/2                 (%W)
```

- 图片：`background-size:auto 100%`（图高 = 元素高），`background-position:center top`，超出元素宽的两侧被裁掉。
- 结果：所有男性眼线落在 **39.03%H**，女性落在 **41.28%H**；眼到下巴长度男 5.85%H、女 5.29%H。女性显得矮一些、脸略小（男 9 成）。
- 示例：萧白（108/160）k=1，h=72%，top=26.875%；叶蘅（120/171）k=0.9216，h=66.35%，w=25.8%，top=28.83%。

### 5.2 下沿渐隐遮罩

```
boxBottom = (.box 底 - #dlg 顶) / #dlg 高 × 100，上限 100；量不到时 98
fadeEnd   = min(100, (boxBottom - top) / h × 100)      (元素高的 %)
fadeStart = max(0, fadeEnd - 14 / h × 100)
mask      = linear-gradient(to bottom, #000 fadeStart%, transparent fadeEnd%)
```

即：立绘在对白框底边处完全透明，往上 14%H 的范围线性渐隐。普通对白 `.box bottom:2%` → boxBottom=98。Godot 用着色器按屏幕 y 做 alpha 渐变实现。

### 5.3 其他行内样式

`right:auto;bottom:auto;max-height:none;opacity:1;background-repeat:no-repeat`；`data-character=身份`、`data-slot=displaySlot`、`data-speaking=true/false`、`aria-label=名字+（正在发言）`。亮度与描边见 03 §3。绘制顺序：主节点 `.face`（z1，DOM 第一）在 `.box`（z3）之下；`.dialogue-cast` 内的其他立绘（无 z）在 DOM 末尾；小头像条 z2。由于 `.box` z3 最高，所有立绘都在对白框后面。

### 5.4 小头像条头像 `avatar(a)`

1. 序章激活且 `OPENING_CHARACTER_ART.avatars[去 opening_ 的键]` 存在 → `url(assets/<值>.webp)`。
2. 否则 `BUI.face({side:'ally', por:立绘键_表情, art:键, hp:1, mhp:1}, 48)`：从对话立绘取边长 = 图高×0.235 的正方形、以脸框为中心，画到 48×48 画布，底色 `#efe4cc`。
3. 再不行用整幅立绘，`background-size:auto 260%;background-position:center 12%`。

## 6. 谁会开作用域

| 调用方 | 作用域 id | 预置 cast |
|---|---|---|
| `ui.js talk(npc,...)` | `talk:<npc.id>` | 萧白 left、npc right |
| `qihe-chapter.js guarded()` | `qh-chapter` | 空（整个事件期间） |
| `sayAll(rows)` | `qh-scene` | `participants(rows)` |
| `line(w,t)` / `ask(w,t,opts)` | `qh-line` / `qh-choice` | `participants([[w,t]])` |
| 主线剧本内的 `choose` | `qh-choice` | 同上 |

`participants(rows)`：取每行说话人 `' · '` 前的名字，去重，保留萧白和 `castSprites` 里有的名字；若有人，则返回 `[{萧白,'c_hero',left}, ...其余按首次出现顺序（自动槽位）]`，否则空。所以典型多人戏：萧白左、第一个开口的人右、第二个中、第四人起进小头像条。

## 7. 对外接口

`DialogueStage = {frame(k,eye,chin,g), begin, end, withCast, enter, layout, render, closeLine, identity, snapshot}`；`frame` 供 06 §2.2 注册取景；`closeLine` 只记时间戳（未被使用）。
