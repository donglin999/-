# 人物交互移植说明（墨印八枚印、赠礼、易物、偷窃、江湖声望）

状态：功能代码已齐、精修已按实测排版对齐，待主会话截图对照　最后核对：2026-11-03

## 文件对照

| Godot（game/scripts/npc/） | 原版（xiaojianghu-legacy-prologue/js/） |
|---|---|
| npc.gd（自动加载 Npc，入口、键位、流程、对外接口、debug_start） | qihe-npc-ui.js install/interact/session/execute |
| core.gd | qihe-npc-core.js（存档、好感、菜单 menuFor、查看 view、请教、切磋） |
| gift.gd | qihe-gift.js（赠礼判定、易物估价、随身货） |
| rep.gd | qihe-jianghu-rep.js + qihe-jianghu-rep-ui.js（声望、头顶签、右上纸签） |
| steal.gd | qihe-steal.js（把握、成功率、戒心、结算效果表） |
| seal.gd / ring_ui.gd | qihe-npc-ui.js 墨印、环形菜单 |
| profile_ui.gd | qihe-npc-ui.js 查看页 |
| scroll_ui.gd | qihe-npc-ui.js 请教卷、切磋卷、结果卷 |
| gift_kit.gd / gift_ui.gd | qihe-gift-ui.js gift()、yi() |
| trade_ui.gd | qihe-gift-ui.js trade()（易物秤） |
| shop_ui.gd | qihe-gift-ui.js shop()（挂轴商店 .qs2） |
| steal_ui.gd | qihe-steal-ui.js 物品扇 pick()、steal() 入口 |
| steal_dial.gd | qihe-steal-ui.js minigame()（袖里一按）、zones/judge/combine/params |
| data/npc/extra.json | 原版未导出到 globals.json 的字面量 |
| data/npc/banter.json | qihe-banter.js 数据（逻辑由 flow/side_banter.gd 承担） |

## 对外接口（Npc.*）

open_seal_menu(n)、is_open、bond_get(id)、bond_add(id,d,opt)、person_for(n)、menu_for(p,n)、view(p)、bag_of(p)、recognize(key,grade)、
rep_score(faction)、rep_settle()、rep_emit(ev,payload)、shop(npc,p,opts)、close_panels()、steal_minigame(npc_id,item,rate,tier,perks,opts)、steal_teach(step,result)、debug_start(pid)。
World.interact_hook 在 Npc._ready 里挂上（对应原版 install 包 interact）。

## 调试

`godot --path game -- --npc=ye`（或 peddler、innkeeper……）：新存档、窃术二级、行囊几样礼物，进 qihe_trial 找到该人；找不到时铺空白底、在玩家右侧假一个人，直接开墨印。

## 已知差异

- 字体：Weibei（魏碑）用 UI.brush 代替；SVG 模糊、mask 渐隐、clip-path 用近似画法（分段渐隐、多边形）。
- 商店里“装上”按原版 mnEquip 只处理主角三格（直接写 G.S[slot]）；属性对比用 G.derived 前后差。
- 物品图标运行时借 menu/kit.gd 的 item_tex。
- 物品扇、小游戏的入场动画（qs-in、qs-stamp、qs-sleeve、qs-shake）按原版时长手算，不是 CSS 缓动曲线。
- 原版 firstFrom、stamp 本来是空实现，照空。
- qihe-acc-fx.js（佩饰战斗效果）挂在战斗结算上，属于战斗子任务，这里未做。

## 需要主会话补的

- Battle.start(opt) 支持切磋用的 opt：endCheck(B)→""/win/lose/draw、victory Callable、bigTextMap、spar、allowAuto、solo、heroArt、heroPor；以及 Battle.big_text、Battle.rules.victory_pose、Stats.award_battle。
- 场景 NPC 交互入口：World 已有 interact_hook，Npc 自己挂；若主会话另有入口，按原版条件（人物表里有、非 loot）调 Npc.open_seal_menu(n)。

## 精修（2026-11-03，对照 docs/specs/layout/npc-seal/v/gift.json）

调试入口：`godot --path game -- --npc=ye:seal`（或 `ye:view`、`ye:gift`）。新开局、arrival 设为 done 且 borrowed（换了村里衣服），进 prologue_ye_house，叶蘅在原位，主角站她左下（−52, +57），直接开墨印环／查看页／赠礼面板（赠礼焦点在第一件＝悬停第一件）。
加 `--layout-dump=<文件>`：开界面 1.2 秒后把人物交互层带字控件的设计坐标（1600×900）逐行写成 JSON 并退出；墨印环另写一行圆心、角度、朝向。比对时把原版数值换算成设计坐标：(x−32)/0.76、(y−18)/0.76。

对齐结果（无头导出与原版实测比对）：
- 墨印环：圆心 (871,372)、五枚印角度 −38…78、名牌、标签、键位条位置与原版一致（差 ≤1px）。
- 查看页：中栏、右栏、底部四枚印与按键提示，文字框位置差 ≤3px。改动：
  - `.eqrow` 三格照 flex 收缩成每格约 114.67（原来 118，整栏被撑到 410 宽）；雷达随之回到 350 宽；
  - h3 定高 32，hs 右对齐、顶在 h3 下 10；武学条目 an 26、mv 18、条目间 14；frow、战力印、物品名、装备槽名都按原版实测行高放进定高盒（profile_ui.gd `_fixh`）；
  - 底部印的灰字注（帮完药棚再来等）按实际字宽排，不再被压成标签宽。
- 赠礼面板：人物卡改成照 `.kv` 四列网格逐个摆放（宽 426，nm 行 42 高、职务靠右；关系／送过两列各 163；喜好框 34 高、三格两端对齐），补上 index.html `.kv>div` 的底色 rgba(0,0,0,.28) 与左边 2px #6e5a3e；“关系能换来”标题定高 21，右侧档名右对齐留 14。
- 全局：scroll_ui.gd `span()` 带字距时照 CSS 把末字的字距也算进宽度（Godot 量宽不算），所有人物交互界面的字宽因此与原版一致。

仍有的差异：
- Godot 字号只能取整，11.5px／12.5px／13.5px 会画成 12／13／14，注字宽多 2～3px；Label 字高比 CSS normal 行高高 1～3px（已用定高盒抵消累计，单个字框仍高一点）。
- Weibei 字体、SVG 模糊、印面纹理沿用前面的近似画法，未改。
