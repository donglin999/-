# 03 DOM 结构与右上队伍状态面板

源：`js/bui.js` → `battleDom()`、`battleCSS()`、`renderCards()`、`porFill()`、`syncCardGhost()`，以及文件末尾两段覆盖样式 `<style id="bui-compact">`、`<style id="bui-ot">`（均 `!important`，**以 bui-ot 为最终生效值**）和对 `renderCards` 的包装（加“/上限”）。

## 1. 层次与坐标
- 逻辑画布 `W=960,H=540`（`js/core.js`），战斗画布内容绘制完后再叠 DOM 层 `#bt`。
- `#bt`：`position:absolute;left:0;top:0;width:960px;height:540px;transform-origin:0 0;pointer-events:none`，用 `transform:scale(#game.clientWidth/960)` 跟随窗口（ResizeObserver）。插在 `#dlg`（对话框）之前。Godot：一个 960×540 的 `Control` 根，随视口等比缩放。
- 子节点：`#bt-cards`（队伍面板）、`#bt-hint`（说明条）、`#bt-cmd`（指令菜单）、`#bt-help`（按键提示，v4 中 `display:none`，见下）。胜利结算时追加 `#bt-win`。
- 只有 `#bt-cmd #bt-hint #bt-win .bt-card` 接收指针。
- 主题：`BUI.theme` = `ink`（默认）| `scroll`（`?uitheme=scroll` 或 localStorage `bui.theme`），给 `#bt` 加类 `th-ink`/`th-scroll`。正式版只用 ink；scroll 值见 04 节附录。

## 2. 队伍卡片 DOM（每名我方一张）
```
.bt-card[data-i] style="--sw:卡片墨迹(i%4)"
  .st            状态印（竖排）
  img.tp         目标箭头 pointer('#8fe0a8',16,'r')
  .fc            头像圈（v4 隐藏）
  .rg            圆相 n/c/t（v4 隐藏）
  .inf
    .nm  > span.n 名字 + span.pips 蓄势铜钱
    .ln.hp > .bar.hp(b.gh 残血 + i 实血) + span.v.hp
    .ln.mp > .bar.mp(i) + span.v.mp
```
点击（pointerdown）卡片：若处于选我方目标且该单位在 `B.tgtList` 中 → `B.pickCard(u)`。

## 3. 最终生效布局（bui-ot，“八方旅人”式）
- `#bt-cards`：`top:6px; right:44px; width:206px; gap:2px`，纵向排列。
- `.bt-card`：`height:54px`，无位移（transform:none）。背景 `::before` 铺满：
  - 常态：`linear-gradient(270deg, rgba(6,4,10,.78) 0%, rgba(6,4,10,.55) 55%, rgba(6,4,10,0) 100%)`（右深左透）。
  - `.cur`（当前行动者）：`linear-gradient(270deg, rgba(60,40,12,.85) 0%, rgba(40,26,8,.6) 60%, rgba(40,26,8,0) 100%)` + `box-shadow: inset -2px 0 0 #f0c878`（右缘 2px 金线）。
  - `.tgt`（被选为目标）：`linear-gradient(270deg, rgba(20,60,36,.85), rgba(20,60,36,0))`。
  - `.dead`：`filter:grayscale(1) brightness(.62)`。
  - `.hit`：动画 `bthit .28s ease-out`，位移关键帧 0%(0,0) 25%(-4,1) 50%(3,-1) 75%(-2,0) 100%(0,0)。触发：`u.flash` 变化时（`syncCardGhost` 每帧检查）。
- `.inf`：`left:26px; right:8px; top:2px; bottom:3px`，纵向 space-between。
- `.nm`：横排两端对齐，高 16px；`.n` 名字 `font-family:FB; 15px; line-height:16px; color:#f2e4c4; letter-spacing:.08em; text-shadow:0 1px 2px #000`；cur 时 `#ffe2a0`。
- `.pips`：铜钱 8×8px，间距 1px，最多 5 枚：`i<bp` 为 on，其中末尾 `use` 枚（当前投入数）为 use；use 动画 `pipu .5s ease-in-out infinite alternate` → `brightness(1.3) drop-shadow(0 0 3px #ffd070)`。贴图 `coin(state,28)`。
- `.ln`：`padding-left:18px`，纵向（数字在上、条在下：column-reverse），前缀伪元素文字“血”/“内”：`left:0; top:0; 12px/14px --serif; #d8cbb0`。
- 数字 `.v.hp`：FB 15px/15px，`#f6dcc4`，后缀 `/上限` 11px `#b8ab90` margin-left 1px；低血（hp<mhp*0.3）时 `.ln.low .v` 为 `#ff8a6a`。`.v.mp`：12px/12px `#a8d8e4`，后缀 10px `#90a8b4`。
- 条 `.bar`：宽 100%，HP 高 3px、MP 高 2px，素材横向拉伸（background-size 162px×3px）。
  - 底槽 `tr`：swash(w,9,{seed:71,col:'#e9dcc0',a:.16,dry:.5})；HP 满色 seed72 `#d63a22`；低血 seed72 `#ff5a2a`；MP seed73 `#4aa0b8`；残血 ghost seed72 `#f3e0b0` a.85。公共参数 `{rev:0,dry:.3,head:.12,tail:.3,tip:.6,thick:.9,wave:.12,a:1}`。
  - 宽度 = `100*hp/mhp%`；ghost = `100*gh/mhp%`；填充右端 7px 线性渐隐遮罩（`mask: linear-gradient(90deg,#000 calc(100% - 7px),transparent)`）。
- `.st` 状态印：`left:2px; top:4px` 纵向，每个 `seal(字,18,18,{col})`：防御['防',#2f5f8a]、护主['护',#2f7a55]、定神['定',#a8781a]（后跟回合数 11px #f3d58e）、眩晕['晕',#6a3a9a]、中毒['毒',#2f7a3a]、倒下['倒',#5a1a10]。条件：hp≤0 仅“倒下”；`u.defend`；`guardBy` 存活且 `guardUntil>=B.round`；`buffs.ding`；`stun`；`bleedN>0`。若有 `CharacterCondition.inspect(u)` 则以其列表为准。
- `.tp` 目标箭头：`left:-16px; top:18px`，仅 `.tgt` 显示，动画 `tpb .6s ease-in-out infinite alternate`（向左 4px）。
- tooltip：`${name} 气血 hp/mhp 内力 mp/mmp 蓄势 bp`。

## 4. 残血（ghost）
`ghostTick(u,now)` 每帧：gh 未定义或 <hp → gh=hp；若 gh>hp 且距 `u.ghT`（受击时刻）>400ms，则每帧 gh-=mhp*0.012（不低于 hp）。注意按帧不按时间（60fps 基准，约 1.39 秒掉满血条）。

## 5. 切换行动者钩子
`renderCards` 检测 `B.cur` 变化 → `BFX.onTurnStart(B.cur)`（见 09 节）。

## 6. 按键提示 `#bt-help`
v4 设 `display:none!important`，正式版不显示（教学战文本也被隐藏）。保留文案以备：`↑↓ / W/S 选择 · Enter / 空格 确认 · Esc 返回 · Q / E 蓄势 · 鼠标点击`。
