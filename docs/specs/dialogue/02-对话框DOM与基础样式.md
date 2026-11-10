# 02 对话框 DOM 与基础样式

源：`index.html`（DOM 第 462 行；CSS `/* ── 对话 ── */` 段与文末“桌面对话”覆盖段）、`js/dialogue-stage.css`。本篇给出**非旁白、无立绘**时的最终生效值；各变体见 03。

## 1. DOM 结构（固定，不重建）

```html
<div id="dlg" class="ui" hidden>
  <div class="face"></div>                 <!-- 主立绘（正在说话者） -->
  <div class="box frame">
    <div class="mini frame" hidden></div> <!-- 无立绘时的像素小头像，内放 96×96 canvas -->
    <div class="who frame"></div>         <!-- 名牌 -->
    <div class="txt"></div>               <!-- 正文 -->
    <div class="choices"></div>           <!-- 选项按钮 -->
    <div class="more">▼</div>             <!-- 继续提示 -->
  </div>
  <!-- DialogueStage 首次 render 时追加： -->
  <div class="dialogue-cast"></div>       <!-- 其余大立绘 .face.dialogue-portrait -->
  <div class="dialogue-cast-rail"></div>  <!-- 第 4 人起的小头像条 -->
</div>
```

运行时数据属性/类（`ui.js dlgSetup`、`dialogue-stage.js render`）：
- `data-type`：`hero|foe|npc|thing|narr`（判定见 04）。`.narr` 与 `data-type=narr` 同步。
- `data-portrait`：主立绘键（无则 `none`）；`data-cg-portrait-suppressed`：`true/false`。
- `.hasface`（有大立绘）、`.hasmini`（有小头像）、`.choose`（选择模式）、`.dialogue-staged`（DialogueStage 渲染过，之后常驻）。
- `data-cast-count`（大立绘数）、`data-cast-total`（在场总数）。
- CG：`.cg-story`（递水）、`.qh-cg-dialogue`（章节 CG）。

## 2. CSS 变量（`:root`）

| 变量 | 值 |
|---|---|
| `--ink` | `#0d0a08` |
| `--bg1` / `--bg2` | `rgba(22,17,13,.93)` / `rgba(34,27,20,.95)` |
| `--paper` | `#e9dcc0`（正文色） |
| `--dim` / `--faint` | `#9c8b70` / `#6d5f4b` |
| `--gold` / `--hi` | `#e0bf78` / `#f3d58e` |
| `--red` | `#d9553a` |
| `--bz` / `--bz2` | `#6e5a3e` / `#a38a5e` |
| `--serif` | `"Noto Serif SC","Songti SC","STSong",serif` |
| `--sans` | `"Noto Sans SC","PingFang SC","Microsoft YaHei",...` |
| `--brush` | `"ZCOOL XiaoWei","Noto Serif SC",serif` |

字体通过 Google Fonts 加载：ZCOOL XiaoWei、Noto Sans SC 400/500/700、Noto Serif SC 500/700。Godot 需打包这三种字体文件。

`.ui` 基础：`position:absolute;font-size:17px;letter-spacing:.04em;line-height:1.5`。`#dlg` 覆盖 `font-family:var(--serif)`。以下 em 均以 17px 为基（除特别说明）。

## 3. `#dlg` 容器

`inset:0;cursor:pointer;z-index:5`。整个对话层铺满游戏区，**点击任意处推进**。

## 4. `.box` 对话框（非旁白最终值）

- 位置：`position:absolute;left:1.2%;right:1.2%;bottom:2%`。
- 高度：`height:auto;min-height:17%;max-height:40%`（`.dialogue-staged` 时 `left:2%;right:2%;min-height:19%;max-height:40%;z-index:3`。由于首次 say 后恒带 `.dialogue-staged`，实际以此为准）。
- 内边距：`1.1em 1.6em 1.2em`（=18.7/27.2/20.4px）。
- 背景：`linear-gradient(180deg, rgba(32,23,16,.96), rgba(13,10,8,.98))`；`border:0`；`box-shadow:0 8px 22px rgba(0,0,0,.5)`。
- 顶部金线（`.box.frame::before`，`inset:0`）：`linear-gradient(90deg, transparent, rgba(224,191,120,.75) 8%, rgba(224,191,120,.75) 85%, transparent)`，位于顶边，高 2px，宽 100%。

通用 `.frame` 原定义（名牌、小头像仍用）：`background:var(--bg1);border:1px solid var(--bz);box-shadow:inset 0 0 0 2px rgba(0,0,0,.55), inset 0 0 0 3px rgba(163,138,94,.22), 0 2px 10px rgba(0,0,0,.45)`；`::before` 在 `inset:3px` 处画四角各 0.7em×1px 的 L 形角线，颜色 `--bz2`。

## 5. `.who` 名牌

- 位置：`position:absolute;left:1.6em;bottom:100%;margin-bottom:.35em`（贴在框**上方外侧**，与正文左缘对齐）。
- `padding:.27em .7em .27em 0;min-width:0;font-size:1.12em`（19.04px）`;letter-spacing:.12em;font-family:var(--serif)`。
- 背景 `linear-gradient(90deg, rgba(30,20,14,.98), rgba(30,20,14,.74) 78%, transparent)`；无边框/阴影，仅 `border-left:3px solid var(--red)`。
- 文字色按 `data-type`：`hero #a9d8b5`、`foe #f08a6e`、`npc var(--hi)#f3d58e`、`thing var(--dim)#9c8b70`；默认 `var(--paper)`。
- 空字符串时 `display:none`。

## 6. `.txt` 正文

- `font-family:var(--serif);font-size:20.5px;line-height:1.5`（`.dialogue-staged` 覆盖，原 `max(18px,1.12em)`/1.65）。
- `letter-spacing:.055em;white-space:pre-wrap;color:var(--paper)`；`max-width:58em;padding-right:0`。
- 空时隐藏。

## 7. `.more` 继续提示

`position:absolute;right:1.6em;bottom:.6em;color:var(--gold);font-size:.9em`；内容 `▼`；动画 `bob 1s ease-in-out infinite`（50% 时 `translateY(.25em)`）。打字中 `visibility:hidden`，打完恢复；选择模式 `hidden`。

## 8. `.choices` 选项

- 容器：`display:flex;flex-direction:column;gap:.12em;margin-top:.35em;width:min(100%,32em);max-height:11em;overflow:auto`。
- 按钮：`text-align:left;background:transparent;border:none;box-shadow:none;position:relative;color:var(--paper);font-family:var(--serif);font-size:19.2px;line-height:1.5;min-height:2em;padding:.18em .7em .18em 1.2em;letter-spacing:.08em`。
- 编号 `<span class="n">`：`color:var(--gold);margin-right:.6em;font-size:.85em`，内容 `1`…`n`。
- 指示三角 `::before`：`left:.2em;top:50%;border:.35em solid transparent;border-left-color:var(--gold);translateY(-50%);opacity:0`。
- 悬停/聚焦：背景 `linear-gradient(90deg, rgba(224,191,120,.2), transparent)`，文字 `var(--hi)`，三角 `opacity:1`。鼠标移入即 `focus()`。
- 触屏（`pointer:coarse`）：按钮 `min-height:40px`。
- 选择模式 `.choose:not(.narr) .box`：`display:flex;flex-direction:column;height:auto;max-height:75%`；`.txt` 不收缩；`.choices` `flex:0 1 auto;min-height:0;overflow-y:auto`。

## 9. `.mini` 小头像（无立绘 NPC）

- `position:absolute;left:1.3em;top:50%;transform:translateY(-50%);width:5.4em;height:5.4em;padding:.3em`。
- 背景 `radial-gradient(ellipse at 50% 80%, #3a2d1f, #15100c 75%)`，`.frame` 边框。
- 内部 canvas 96×96，`image-rendering:pixelated`，铺满。
- 有小头像时：`.box padding-left:7.8em`，`.who left:6.9em`。
- 入场动画 `minin .28s ease-out`：从 `opacity:0; translate(-.6em,-50%)`。

## 10. 联动

- 对话显示时隐藏 `#prompt`、`#tpad`；隐藏小地图 `.qh-minimap`。
- 有大立绘时（`.dialogue-staged.hasface`）：地图画布 `#cv` `filter: blur(.32cqw) brightness(.72) saturate(.85)`，过渡 `.22s ease`（`cqw` 为游戏区宽的 1%，1280 宽 ≈ 4.1px 模糊）；`.qh-name` 与 `#hud` `opacity:.35`（过渡 .2s）。
- `prefers-reduced-motion`：关闭 `.more/.face/.mini` 动画及 fade/place/toast 过渡。
