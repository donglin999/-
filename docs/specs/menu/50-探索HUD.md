# 50 探索 HUD

源文件：`js/qihe-hud.js`（包装全局 `hud()`）、`js/qihe-hud.css`、`js/qihe-chapter-presentation.css`（小地图、关闭钮、kbd 补丁）、`index.html` 中 `#hud`、`#toast`、`:root` 变量，`js/ui.js hud()`（旧版回退）。

## 1. 挂载与可见性（qihe-hud.js `hud`）
- DOM：`#game > #hud.ui`（`.ui{position:absolute;font-size:17px;letter-spacing:.04em;line-height:1.5}`），与 `canvas#cv 960×540` 同级。`#game` 是 16:9 舞台，HUD 所有百分比都相对 `#game` 计算。
- 每次调用 `hud()` 都会整段重写 `innerHTML`。触发时机包括：场景切换、拾取、交易、追踪变更、关闭面板等。没有 `window.QiheJianghuUI` 时回退到 `ui.js` 的旧 `hud()`。
- `el.hidden = mode!=='scene' || !S`；显示时加 class `qh-hud`。
- 显示 `.qh-hud` 时会隐藏：`body>.hint`、`#qihe-resources`（野外行囊旧按钮）、`#qihe-journal`、`#sndbtn`（均 `display:none!important`）。
- `#panel` 打开时：`#hud.qh-hud{visibility:hidden}`。
- 对话框 `#dlg` 打开时：`.qh-objective`、`.qh-controls`、`.qh-tracker`、`.qh-minimap` 不显示，其余按钮 `pointer-events:none;opacity:.55`。
- 点击守卫 `canOpen() = S && mode==='scene' && !busy && !dlgBusy && $('panel').hidden`。

## 2. 根样式
`#hud.qh-hud{position:absolute;inset:0;pointer-events:none;color:#f2e5c9;font-family:var(--serif);text-shadow:0 1px 3px #000}`。按钮：`pointer-events:auto;background:none;border:0;box-shadow:none;border-radius:0`；`:focus-visible{outline:2px solid #efce83;outline-offset:4px}`；hover 时 `color:#fff1c7`。
`--serif:"Noto Serif SC","Songti SC","STSong",serif`；`--sans:"Noto Sans SC","PingFang SC","Microsoft YaHei",…`。

## 3. 元素（按 DOM 顺序，即叠放顺序）

### 3.1 状态牌 `button.qh-status`（左上）
- 位置 `left:2%;top:3%`，`display:flex;align-items:center;gap:12px`，背景 `linear-gradient(90deg,#171d1bed,transparent)`，hover 背景不变。
- `.qh-face` 64×75，`border:1px solid #c0ac78`，背景 `#c3c0a2`，六边形裁切 `clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)`。内部 img：`width:100%;height:180%;object-fit:cover;object-position:top`（只露出头肩）。
  - 图片：`S.prologue.arrival.borrowed` 为真时用 `assets/p_opening_hero_village.webp`，否则用 `assets/p_opening_hero_modern.webp`。
- `.qh-vitals` 宽 190，`display:grid;gap:4px;padding-right:15px`：
  - `strong`（flex 两端对齐，18px）：`S.name` + `small`（10px `#cabb98`）章节名 = `QiheMenu.title()` = `QiheMilestones.latest(S)||'江湖行卷'`；QiheMenu 不存在时为 `'行走江湖'`。
  - 两条 `.qh-meter`：高 15，背景 `#141a18d9`，`border-bottom:1px solid #ae9760`，`transform:skewX(-12deg)`；填充 `i` 宽 = `clamp(hp/d.mhp*100,0,100)%`。气血条渐变 `#833930→#b77c59`，内力条 `#2c6269→#7da1a4`。文字 span 绝对铺满，`font:10px/15px sans-serif`，反向 `skewX(12deg)`，内容为「气血 {hp} / {mhp}」「内力 {mp} / {mmp}」。hp、mp 取 `max(0,S.hp)`，上限取 `derived()` 的 mhp/mmp。
- 点击：`QiheJianghuUI.open('party','hero')`。

### 3.2 导航 `nav.qh-nav`（右上）
- `right:2%;top:3%;display:flex;gap:12px;padding:0 12px 6px 30px`，背景 `linear-gradient(90deg,transparent,#18201dd9)`。
- 六个按钮，顺序固定：

| data-qh-page | 文字 | kbd | 图集位置 background-position |
|---|---|---|---|
| party | 江湖 | I | 2.17% 33.75% |
| bag | 行囊 | B | 65.94% 2.64% |
| skill | 武学 | K | 34.01% 2.64% |
| quest | 行记 | L | 34.01% 33.8% |
| map | 地图 | M | 2.12% 94.67% |
| sys | 设置 | Esc | 65.89% 33.8% |

- 按钮：`display:grid;justify-items:center;gap:2px;min-width:42px;padding:2px;font-size:13px`；`kbd` 绝对定位 `right:-5px;top:0;font:10px sans-serif;opacity:.8`。title 为「江湖 · I」这种格式。
- 图标 `span.qh-painted-icon`：42×42，`background:url(assets/ui/jianghu-v5/icons-atlas.png) 0 0/435.42% 435.42% no-repeat`，`filter:drop-shadow(0 2px 2px #0009)`。图集格宽 313.5px，各位置已按实测包围盒中心校正，保证六枚圆章大小、高度一致。hover 或 map 按钮 `aria-expanded="true"` 时：`drop-shadow(0 0 5px #edc66b)`，hover 另加 `translateY(-1px)`。
- Godot 实现：用 AtlasTexture，region 换算为 `offset = pos% × (atlasW − cellW)`，cellW = atlasW/4.3542。
- 点击：map 调 `QiheNavigation.toggle()`，其余调 `QiheJianghuUI.open(page)`。

### 3.3 地点名 `.qh-location`
`right:3%;top:17%;font-size:16px;letter-spacing:.12em`，内容为 `cur.name`。

（续见 51-HUD追踪小地图与响应式.md）
