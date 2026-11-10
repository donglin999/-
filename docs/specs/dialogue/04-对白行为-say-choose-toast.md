# 04 对白行为：say / choose / talk / narr / toast / 面板

源：`js/ui.js`（`dlgSetup`、`say`、`choose`、`talk`、`narr`、`gain`、`giveItem`、`learn`、`moral`、`openPanel`、`closePanel`）、`js/core.js`（`toast`、`showNextToast`）。

## 1. 全局状态

- `dlgBusy`：有对白/选项开着时为真；地图交互、菜单热键都检查它。
- `busy`（`scene.js`）：剧情脚本占用中，玩家不能走动/交互。
- `lastSpeaker`：`who + '|' + sp 冒号前部分`，用于判断“换人”。只换表情不算换人。
- `qiheOverlayOpen()`：NPC 墨印/赠礼/偷窃覆盖层开着时，全局热键不响应。

## 2. `dlgSetup(who, sp, chooseMode)`

1. 显示 `#dlg`，记 `wasHidden`。
2. `suppress = OpeningCharacters.fullscreenCGActive()`（`body.qh-cinematic` 或 `#prologue-cg` 可见）。`f = suppress ? 'none' : face(sp)`（05）。
3. `data-portrait = f==='none' ? 'none' : sp 去 c_ 后冒号前部分`。
4. `changed = wasHidden || key!==lastSpeaker`。
5. 主立绘 `.face` 设背景并显隐；`.hasface`、`.choose` 切换。
6. 小头像：`!suppress && f==='none' && sp` 时 `miniSprite(sp冒号前)` 生成 96×96 canvas（§6），`.hasmini` 随之切换。
7. `DialogueStage.render(d, who, sp, {suppress, primary:.face})`（07）。
8. `data-type = whoType(who, sp)`，`.narr` 同步。
9. `changed` 时重启 `.face`、`.mini` 的 CSS 动画。
10. 名牌文本 `who||''`；清空 `.choices`；`.more` 在选择模式隐藏。

`whoType(who, sp)`：
- `who` 空 → `narr`。
- `k = sp 去掉开头 c_ 后，从第一个 '_' 或 ':' 起截断`。
- `k==='hero'` 或 `who===S.name` → `hero`；`k ∈ FOES=['bandit','chief','snake','wolf','liu','langli']` → `foe`；`sp` 为空 → `thing`；否则 `npc`。
- 注意：`sp` 是经 `dialogueSprite` 改写后的值。栖河人物多为 `c_opening_*`/`c_qh_*`，`k` 截成 `opening`/`qh`，因此几乎都是 `npc`（金色名牌）；萧白按名字判为 `hero`（青绿）；不在映射表的名字（如“路牌”“获得”）无 sp → `thing`（灰）。

## 3. `say(who, text, sp)` → Promise

1. `sp = OpeningCharacters.dialogueSprite(who, text, sp) || sp`。
2. `dlgBusy=true`，`dlgSetup(who, sp, false)`。
3. **打字机**：`.txt` 清空，`.more` `visibility:hidden`。
   - 首字延迟 **40ms**。
   - 每步显示前 `i` 个字符（按 UTF-16 码元 `slice`），下一步延迟 `26 + PAUSE[刚显示的那个字符]` ms。
   - `PAUSE = {'，':90,'、':80,'；':120,'：':90,'。':220,'！':220,'？':220,'…':110,'—':60,'\n':160}`，其余 0。
   - 显示完 → `fin()`：写全文、`done=true`、`.more` 可见。
4. **推进** `go()`：未打完 → 立刻 `fin()`（补全，不关闭）；已打完 → 解绑、隐藏 `#dlg`、`dlgBusy=false`、`DialogueStage.closeLine()`、80ms 后若对话框仍隐藏则 `lastSpeaker=null`、resolve。
5. 输入：`#dlg` 点击（任意位置）；键盘 `' '`、`'Enter'`、`'e'`、`'E'`（`e.repeat` 忽略，`preventDefault`）。键盘监听在 setup 后 **50ms** 才挂上，防止触发对话的同一次按键直接跳过首句。
6. 每句结束都会隐藏 `#dlg`；连续台词间对话框隐藏一帧再出现。Godot 可保持节点可见，但需保留“`lastSpeaker` 80ms 后清空”的语义：两句之间间隔超过 80ms 才算重新入场。

## 4. `choose(who, text, opts, sp, escIndex)` → Promise<下标>

1. 同样先改写 `sp`；`dlgSetup(who, sp, true)`；`#dlg.onclick=null`（点空白无效）。
2. `.txt` 直接整句显示（**无打字机**）。
3. 每项生成 `<button><span class="n">{i+1}</span>{转义后的文字}</button>`；鼠标移入即聚焦；点击 → 隐藏 `#dlg`、`dlgBusy=false`、`lastSpeaker=null`、`closeLine()`、resolve(i)。
4. 键盘（立即挂上，`repeat` 忽略）：
   - `Escape` 且给了 `escIndex` 且该项存在 → 选它（并 `stopImmediatePropagation`，防止关菜单）。
   - 数字 `1`…`n` → 直接选。
   - `ArrowDown`/`s`：焦点下移（循环）；`ArrowUp`/`w`：上移（循环）。无焦点时 `k=-1`：下 → 第 0 项，上 → 第 `(n-2) mod n` 项（原版怪癖）。
   - `' '`/`e`：选当前焦点项。`Enter` 由浏览器按钮默认行为触发点击。
5. 打开时焦点在第 1 项。

## 5. 便捷函数

- `talk(npc, ...lines)`：在 `DialogueStage.withCast({id:'talk:'+npc.id, cast:[{who:S.name||'萧白', sp:'c_hero', slot:'left'}, {who:npc.name, sp:npc.sp, slot:'right'}]})` 内逐句 `say(npc.name, l, npc.sp)`，跳过空行。无 DialogueStage 时直接逐句。
- `narr(t) = say('', t)`。
- `gain(txt) = toast(txt, 1200)`；`giveItem(k,n)`：加背包，toast `获得 {名}` + (n>1 ? ` ×{n}` : '')；`learn(k)`：toast `习得武学「{名}」` 1600ms；`moral(d)`：道德夹在 0–30，toast `道德 +d/-d`。

## 6. 小头像 `miniSprite(sp)`（`ui.js`）

1. 取图：`IMG[sp+'_d'] || IMG[sp+'_d_0'] || IMG[sp]`（地图行走图朝下帧）。
2. `miniBox`：扫描不透明像素（alpha>24）求包围盒。
3. 96×96 画布，关闭平滑。有包围盒：`s = min(84/w, 88/h, 2.4)`，绘到 `x=(96-w·s)/2, y=94-h·s`（脚底距下边 2px）。无包围盒：`s=min(96/w,96/h,1.2)`，绘到 `((96-w·s)/2, 96-h·s-2)`。

## 7. toast 提示（`core.js`）

- `toast(t, ms=1400)`：入队，立即返回已完成的 Promise（**不阻塞剧情**）。队列依次显示：加 `.on` → 停 `ms` → 去 `.on` → 再等 **180ms** → 下一条。
- 样式 `#toast`：`top:17%;left:50%;padding:.45em 2.4em;font-family:serif;font-size:1.05em;letter-spacing:.2em;color:#f3d58e;white-space:nowrap;z-index:8`；背景 `linear-gradient(90deg, transparent, rgba(16,12,9,.92) 18%, rgba(16,12,9,.92) 82%, transparent)`；上下各 1px 边，`border-image: linear-gradient(90deg, transparent, #a38a5e, transparent) 1`。
- 动画：隐藏 `opacity:0; translate(-50%,-.6em)`，显示 `opacity:1; translate(-50%,0)`，`transition: opacity .35s, transform .35s`。
- ink 默认 `toast(text)` 停 **2800ms**；`toast_for(text, ms)` 自定。

## 8. 面板 `openPanel(cls)` / `closePanel()`

- `#panel` 类名设为 `ui panel` + 可选类并显示；关闭时清空内容、类名复位、调 `panelClose` 回调。
- `Esc`：有 `panelClose` 且面板可见且 `!dlgBusy` 时关闭。
- 样式：`inset:0;background:rgba(10,8,6,.84);backdrop-filter:blur(2px);z-index:4;flex 纵向居中;gap:.5em;padding:8%;line-height:2;text-align:center`。面板内容属菜单范围，不在本篇。

## 9. 包装层（后加载文件对 `say` 的改写）

- `qihe-staging.js`：`say` 前先 `look(who)`（11 §3）。
- `qihe-journal.js`、`qihe-journal-notices.js`：记录“遇见过谁”，不改演出。
- `qihe-chapter.js`/`qihe-representatives.js` 在播放剧本期间临时替换 `window.choose`，先演完攒下的台词、套上 `withCast` 再出选项（08 §5）。
