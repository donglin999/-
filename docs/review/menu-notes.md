# 江湖菜单、HUD、行记 · 移植记录

状态：现行　最后核对：2026-11-03

## 文件与原版对应

| Godot | 原版 | 内容 |
| --- | --- | --- |
| `game/scripts/menu/menu.gd`（自动加载 Menu） | `qihe-jianghu-ui.js` 外壳、`menu.js`、`qihe-menu.js` | 打开/关闭、页签、页头页脚、抽屉/确认框、提交与播报、键位（Q/E、←→、数字、Z/C、Esc、B/K/L）、悬停提示、`debug_start` |
| `menu/model.gd`（QJModel） | `qihe-ui-model.js`、`qihe-grades.js` | 角色视图、命令（装备、用药、学习、加点、内功、阵型、心得）、修订号 |
| `menu/kit.gd`、`card.gd`、`fit_tex.gd` | `index.html` #panel CSS、`qihe-jianghu-ui.css`、`menu-icons.js`、`item-icons-v4.js` | 控件与样式、图集图标、立绘等比绘制 |
| `menu/page_party.gd` | `partyPage` 及属性、阵型、加点、心得、灵宠抽屉 | 队伍页 |
| `menu/page_skill.gd` | `martialPage` | 武学页 |
| `menu/page_bag.gd` | `bagPage` | 行囊页 |
| `menu/page_equip.gd` | `equipPage` | 装备页 |
| `menu/quest.gd` | `qihe-journal.js`、`qihe-jianghu-data.js`、`qihe-jianghu-slips.js`、`qihe-journal-notices.js` 的追踪部分 | 任务条目、人物图鉴数据、追踪状态 |
| `menu/page_quest.gd` | `qihe-journal-ui.js`、`qihe-journal.css` | 行记（任务 / 人物图鉴） |
| `menu/page_rep.gd` | `qihe-jianghu-rep-ui.js`、`qihe-jianghu-rep-ui.css` | 关系页（声誉秤杆、势力列表、门中人物、近事），只读 `Npc.rep` |
| `menu/page_sys.gd` | `sysPage`、`saveManager` | 设置页 |
| `scripts/ui/qihe_hud.gd` | `qihe-hud.js`、`qihe-hud.css`、`qihe-navigation.js`（render/bind/toggle）、`qihe-chapter-presentation.css` 的 .qh-minimap | 探索 HUD |
| `data/menu/*.json` | 上列 JS 中的字面量 | bsk、grades、pet_def、portraits、xinfa、journal（CAST、questDef、mountainPeople） |

调试：`godot --path game -- --menu=<party|skill|bag|equip|quest|rep|sys>`。

## 需要主会话补的接口

1. `hud.gd` 接入：`add_child(preload("res://scripts/ui/qihe_hud.gd").new())`，`refresh()` 中调用它的 `refresh()`；同时隐藏原有地名题签和「江湖」按钮（原版 `.qh-hud` 整体替换）。
2. 行程 J 键与 HUD「当前行程」点击：原版 `QihePrologue.journal()`。现在 `qihe_hud.gd` 先查 `Prologue.journal()`，没有时退回 `Menu.open("quest")`。
3. 小地图 M 键已由 `qihe_hud.gd._input` 处理；如果核心已有 M 键处理，需要去重。
4. 存档管理：原版 `QiheSaves.list/command`（新建、载入、重命名、移入回收站、恢复）。Godot 版目前只用 `G.runs()` 列出存档，没有操作按钮。
5. 返回首页：现在是 `G.save()` 后挂载 `title.tscn`（与 `cultivation.gd to_title` 做法相同），地图和 HUD 的清理需要 `Flow.to_title()`。
6. `Chapter.evidence()` 公开入口：现在用 `guarded(evidence_body)` 代替。
7. 战斗界面主题（BUI.theme / setTheme）：Godot 版没有，按钮固定显示「墨迹题签」，点击无效果。
8. 对话说话时调用 `preload("res://scripts/menu/quest.gd").record_encounter(who, text)`，用于人物图鉴「初识」地点。
9. 人物数值使用 `Stats.derived()`（battle/stats.gd），没有临时实现。

## 已知差异

- 墨迹单字图标（blot）是近似实现；mnFace 用立绘裁切代替。
- 行囊网格没做虚拟滚动（数量少，影响不大）。
- 山居人物缺少 CultivationVisitors 和 CultivationRelations 的数据，只按 `facts.met_*` 与 joined 判定是否相识。
- 拱顶画框（border-image）用底色遮角近似。
- 培养模式下的菜单分支按未开启处理。
- 行记页的整体底色 #f6f3e9 未单独设置，沿用菜单纸底。
- HUD 图标 drop-shadow 用偏移半透明叠绘近似；斜条气血用平行四边形加线性渐变近似。
- 沙箱里不能起窗口，截图对照由主会话做；已用无头脚本把 6 页所有按钮类型和抽屉按钮各点一遍，HUD 用 `refresh()` 和地图开关做了冒烟测试，均无脚本错误。

## 精修（2026-11-03，对照 docs/specs/layout/menu-*.json、hud.json）

数值都取自 1280×720 窗口实测，菜单直接用。

- 外壳（`menu.gd`）：页签加上「关系」，共 7 个，图标用 `ui_qj_nav_rep_20261027.webp`。头部高 83，页脚高 30。页签 63×73、间距 34，图标 43，名称 13px，序号 10px（透明度 .6）。返回按钮 89×42，「返回」16px 加「Esc」11px。行记页按 `qihe-journal.css` 收紧：头部 65、页脚 29，页签改成横排（64×51，图标 29，名称 15px，不显示序号），品牌字 30px #34392f，页脚字色 #797d70。
- 队伍页：左侧摘要卡补上浅色卡底 rgba(250,247,238,.93)，「属性详情」「江湖历练」两个按钮改为 11px、高 30。字号缩小：眉题 9、角色行 13、气血/内力 12/11、修为 10。属性图标 57，格子 80×76。底栏高 82，头像位 41，按钮 12px。
- 武学页：三栏改为 350/502/315，间距 11。中栏和右栏加卡底 .93。分类签 13px、高 40；搜索框高 35，前面的「⌕」24px；空提示 15px #736c56。
- 行囊页：工具条高 52，搜索框撑满剩余宽度。分类签 54×40、14px，间距 5。物品格高 82，操作条高 61。
- 装备页：三栏改为 343/366/473，间距 17，左右两栏加卡底。眉题 12px #665d49，数值图标 27。分类签 47×40，空提示 15px。
- 行记页：外边距 27，整页底色 #f6f3e9。pagebar 高 54，目录栏宽 209。
- 设置页：版本行 16px 墨色，卡片 141 高，图标 51，行距 15。
- 关系页（新增 `page_rep.gd`）：逐个函数移植 render、fameBar、rbar、groups、metOf、members、memberStage、outlook、gateText、recent、handleClick，样式照 CSS。选中的势力存在 `s.repSel`，折叠和近事展开存在 `s.repUi`。数值规则只读 `Npc.rep`（`ensure/stage/fame_level/part`）。空状态（未见过任何势力）的位置照 menu-rep.json。
- HUD（`qihe_hud.gd`）：导航键位改成原版 kbd 小框（底 #2a2119、1px #a38a5e、下方 2px 硬阴影、透明度 .8，右上角对齐）。「当前行程」的 J 键也改成键框（9px，圆角 2）。状态牌、行程框尺寸已和 hud.json 对过，没有改动。

### 关系页已知差异

- 楷体（KaiTi）用思源宋体粗体代替。
- 没有立绘的人物，原版用 `miniSprite` 像素小人当头像，这里改成姓氏印（原版第三档）。
- 立绘裁脸的算法照抄 faceCrop/placeFace，但运行时读的是 Godot 导入后的纹理，压缩纹理会先解压再采样。
- 声誉秤杆的雾区斜纹和菱形标记的外描边是用线段和多边形近似画的。
- 原版在窗口宽度 ≤1180px 时隐藏 `.qjr-fnote`，Godot 固定 1280 基准，所以一直显示。
- 本地存档里还没见过任何势力，所以只对空状态做了位置对照；有势力时的列表和人物卡是照 CSS 换算的，需要主会话用有关系数据的存档截图核对。
