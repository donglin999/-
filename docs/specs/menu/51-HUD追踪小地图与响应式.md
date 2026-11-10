# 51 HUD：任务追踪栏、小地图、操作提示与响应式

源文件：`js/qihe-hud.js` `hud`、`js/qihe-hud.css`、`js/qihe-chapter-presentation.css`、`js/qihe-menu.js`（J 键）。根样式、状态牌、导航见 50 号文件。

### 3.4 任务追踪 `.qh-tracker`（左侧）
- `left:2.5%;top:24%;width:200px;display:flex;flex-direction:column;gap:4px`。
- 第一项为 `button.qh-objective`，仅当 `QiheJianghuUI.mainTracked()!==false` 时出现：`position:static;padding:8px 14px;border-left:2px solid #bea36a`，背景 `linear-gradient(90deg,#141d19bf,#141d1900)`，hover 时 `#141d19df`。
  - 第一行 `span` 12px `#d3bd88`，文字「当前行程」，`kbd J` 右浮（`font:9px/1.2 var(--sans);padding:1px 2px;border-radius:2px`），下边距 6。
  - `strong` 14px、行高 1.6，最多 3 行省略：`guide.title||'随处走走'`。
  - `small`：`guide.detail`。
  - `guide = QiheNavigation.guide()`，缺省为 `{title:questLine(),detail:'J 查看行程'}`。
  - 点击：`QihePrologue.journal()`。
- 接着是非主线追踪项：`rows = QiheJianghuUI.trackedQuests()`，取其中 `!r.main` 的前 `MAX_TRACK=4` 条，每条 `button.qh-track[data-track=key]`：
  - `padding:4px 9px;border-left:2px solid #bea36a80`，背景 `linear-gradient(90deg,#15201cd9,#15201c66)`。
  - `strong`：`11px/1.45` serif，最多 2 行，前缀 `◆ `（8px `#bea36a`）。
  - `small`：`9px/1.4` `#cabb96`，单行省略，内容为 where。
  - 点击：有 activity 调 `QiheNavigation.trackActivity`；有 npc 调 `trackNpc`；都没有调 `QiheJianghuUI.openQuest(key)`。
- 超过 4 条时显示 `button.qh-track-more`，文字「另有 N 项追踪 · L 管理」，9px `#cabb96`，点击打开 quest 页。
- 新任务提示：`UI.newQuests()` 非空时调 `toast('新任务 · '+names.join('、')+' · 已加入左侧追踪',3000)`。

### 3.5 小地图 `aside#qh-region-map.qh-minimap`
- 仅当 `QiheNavigation.isOpen()` 时显示。位置 `right:2.5%;top:23%;width:clamp(178px,24vw,286px);padding:7px;background:#14201be6;border:1px solid #9c8960`。
- header：「区域舆图 · 北 ↑」（`11px/1.5` serif `#e9d9b4`）+ 关闭钮 `×`（`20px/1`），点击调 `toggle(false)`。
- `canvas 328×220`，CSS `width:100%;aspect-ratio:328/220;margin:5px 0;cursor:crosshair`。内容由 `QiheNavigation.bind(el)` 绘制（不在本次范围）。
- footer：「白 · 本人　青 · 交互　金 · 目标」，`10px/1.4 sans-serif #c2cdb8`。

### 3.6 操作提示 `.qh-controls`
`left:2.5%;bottom:3%;font-size:11px;color:#e5d8b9;background:#121b167a;padding:4px 9px;letter-spacing:.08em`。文字「WASD 移动 · Shift 走跑 · E 交谈 · M 地图」，分隔点 `i` 左右 padding 各 5。
另有 `#npc-arts-button` 改到 `right:2.5%;bottom:3%;font-size:12px;padding:5px 10px;border-color:#9d8e64;background:#17201cbb`。

## 4. 响应式
- `max-width:1000px`：face 48×56；vitals 宽 150；strong 15px；small 8px；nav gap 7、按钮 11px、最小宽 32；图标 34；objective 宽 185、top 24%，strong 12px；location 12px。
- `max-width:760px`：图标 30；nav `gap:4px;right:1%;top:2%;padding:3px 4px 5px`，按钮最小宽 29、9px；status `left:1%;top:2%;gap:7px`；vitals 118；face 38×45；tracker 与 objective `top:26%`，宽 175。

## 5. 键位（HUD 相关）
- `J`：`qihe-menu.js` 全局 keydown 处理。不是重复按键、不在输入法组合中、没有 Ctrl/Meta/Alt、焦点不在可编辑元素或 INPUT/TEXTAREA/SELECT、`mode==='scene'`、不 busy、面板关闭时，调 `preventDefault` 并执行 `QihePrologue.journal()`。
- I/B/K/L/M/Esc 由江湖菜单键位处理（见 20 号文件）。
