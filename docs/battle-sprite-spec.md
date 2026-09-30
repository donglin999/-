# 战斗精灵规格（battle v4 · 工作流 I 重做敌人/动物；v3 工作流 E；v2 由工作流 D 建立）

战斗中的常驻我方与重复出现的敌方角色都应使用 `assets/b_{char}.webp` 专用动作表，由 `js/bart.js` 的 `BART` 描述（格式见 `battle-v2.md` §2.1）。缺表时现有代码会回退探索精灵，但**回退仅保底，不算画风验收通过**。2026-09-30 同屏复查已确认叶蘅与守军缺表，不能再以身体高度合格代替清晰度验收。

## 0. 三套角色素材（battle-v3.md §1）

| 素材 | 画风 | 规格 | 用途 | 文件 |
|---|---|---|---|---|
| 日常形象 | 像素 Q 版 | ~47 美术像素高，4 方向行走 | 地图 | `s_{c}(_bright).webp` 等 |
| 对话立绘 | 国画白描淡彩 | 1024×1536 原图 → ≤480×640 | 对话、面板头像（**平滑缩小，不像素化**） | `p_{c}(_{表情}).webp` |
| 战斗形象 | 像素、写实比例（约 6 头身）、侧身 | 普通成人素材约 56–64 美术像素高，表内 3×；运行时按实际身体 alpha 高归一到约 105 画布像素 | 战斗动作 | `b_{c}.webp` + `js/bart.js` |

三套素材互不派生：战斗形象不再由日常小人变形（v2 的 `b_hero/b_suzhi` 是 44×22 小人变形，糊且约 3 头身，已废弃）。

## 1. 像素网格与显示倍率

| 项 | 规定 |
|---|---|
| 美术像素 | 1 个美术像素 = 表内 3×3 像素块（×3 最近邻，无平滑、无半透明；alpha 只有 0/255） |
| `BART.h` | **`h = cell[1]`**（单元美术像素高 × 3）。不再使用 v2 的 `×165/47` 非整数倍 |
| 战斗显示 | `bstage.js` 的 `unitH` 指实际**可见身体高度**：同深度普通成人约 105 画布像素，`bfx.js` 用待机身体 alpha 包围盒换算整帧绘制高。原 `h × 2/3` 与整数显示倍率不再适用；头目按角色设定单独放大。新表须在最终尺寸复核像素颗粒，不得只检查源图的 3×网格 |
| 同屏清晰度 | 1280 与 1920 视口下，战斗待机和攻击均实开并排审稿。按可见身体高度归一后，主要像素块/描边台阶与萧白的比值目标 0.8–1.25；主体 alpha≥250 像素应占主体至少 95%，只允许一逻辑像素柔边；首帧 RGB 色数/千不透明像素目标不超过现有 BART 上限的 2 倍（约 22），且以脸、衣纹、武器可辨的实际画面为最终判断 |
| 描边 | 1px 外描边，统一深色（`bsprite.outline`：邻色 28% + `rgb(34,22,30)` 72%） |
| 调色板 | 每个角色一个共享调色板（中位切分 + kmeans）：我方 32 色、杂兵 24–28、精英 28、头目 36 |
| 光向 | 光从左上：高光在头顶/左肩，暗面在右下（提示词约定） |
| 朝向 | 表内我方面**左**（`facing:'l'`），敌方面**右**（`'r'`）；播放器按需镜像 |
| 对齐 | 脚底贴单元底边；所有角色（v4 起敌人/动物也走帧动画管线）的帧落在同一"白模坐标"——站姿骨盆（四足为髋-肩中点、禽为身体中心）x=0 = 单元水平中线，帧间位置完全由白模决定（零抖动） |

## 2. 体量（美术像素；运行时按身体 alpha 高归一）

| 档位 `tier` | 目标 | 角色（白模身高 / 单元 `px` / `h`=cell[1]） |
|---|---|---|
| party | 普通成人同屏可见身体约 105 画布像素 | hero 64 / 132×70 / 210；suzhi 约 65 / 82×70 / 210；ye 66 / 132×70 / 210；dog 四足 s=0.8 身高 30 / 60×37 / 111 |
| minion | 与主角相当 | bandit 待机身体 57 / 120×68 / 204；monk 56（长袍）/ 62×59 / 177；soldier 59（长枪）/ 136×90 / 270；wolf 四足身高 36 / 74×48 / 144（扑咬腾空 7px 撑高单元） |
| elite | 略高于主角或体量大 | beggar 60（竹棒）/ 132×63 / 189；rooster 50 / 68×52 / 156；snake 盘起昂首 71 / 134×73 / 219 |
| boss | 独立设定体型 | chief 104（6.2 头身、bulk 1.4、披风、鬼头大刀扛肩）/ 184×122 / 366；现行运行时目标约主角身体高度 1.75 倍，实测约 183/105 |

数值以 `raw_battle/E/sheets.json`（我方）与 `raw_battle/I/sheets.json`（敌人 + 大黄）为准，`bart_sync.py` 同步进 `bart.js` 时写在注释里。单元高 = 所有帧最高点 + 1，所以姿势要收紧：举剑过顶、竖剑等动作会把单元撑高、让头顶 UI 浮起来——主角胜利姿势用"反手收剑贴臂"、运功用"横剑胸前"就是为此；头目的扛刀待机是单元最高帧（刀尖约 122）。同尺度对比图：`review/battle_v4/I/compare.png`（`tools_fx/rig/compare.py`）。

叶蘅与守军的独立战斗表于 2026-09-30 补齐，分别为 20 帧和 18 帧，条目位于 `bart.js` 自动同步区外。原生姿势、动作总览与可复现打包脚本见 `art_sources/ye_battle_20260930/`、`art_sources/soldier_battle_20260930/`；后续改动必须同时复核实际战斗镜头，不能只凭源图网格验收。

## 3. 我方：帧动画管线（`tools_fx/rig/`，详见 `docs/anim-pipeline.md`）

程序给骨架、生图给皮肤：

1. `rig.py` 人形骨骼 + 正向运动学（按角色身高/头身比实例化；武器骨：主角长剑、苏芷银针）；`poses.py` 关键帧库；
2. `mannequin.py` 渲染白模（近侧浅灰、躯干中灰、远侧深灰、武器纯色、鼻尖三角标朝向、地面线）与关节 JSON；总览 `review/battle_v3/E/rig_{char}.png`；
3. `genframes.py`：`model` 纯文字生成定妆图（侧身像素全身像，品红底）；`grid` 按动作网格生成（单张拼图输入：左定妆图、右 ≤4 格白模 → 同布局角色网格；`--multi` 为 image[] 双图输入，实测忠实度差，不作默认）。接口一律走异步 `/images/*/async` + 轮询；背景用品红色键 #FF00FF（模型有时直接返回透明底，也兼容）；
4. `qa.py`：逐帧配准到白模（缩放 0.82–1.35 + 平移搜索，最大化剪影 IoU），算覆盖率 / 溢出率 / 关节距离，不合格可 `--regen` 自动重生成，每个姿势挑最佳候选写 `raw_anim/{char}/qa.json`；
5. `assemble.py`：按配准结果降采样到白模网格（身高由白模锁定）→ 共用调色板 → 描边 → 派生微动作帧（呼吸/喘息 1–2px，不让模型重画）→ 组表 `assets/b_{char}.webp` + `raw_battle/E/sheets.json`；`--pipe <网格>` 出 白模/生成/像素化/叠合 对比图；
6. `python3 tools_fx/bart_sync.py` 写入 `js/bart.js` 的 `//@@PARTY … //@@PEND` 区。

### 3.1 我方帧与动作（hero / suzhi 共用结构，20 帧：14 个生成姿势 + 6 个派生微动作帧）

| 动作 | 帧（姿势名，派生帧写作 `姿势:操作`） | 说明 |
|---|---|---|
| idle | guard, guard:bob1, guard:bob2, guard:lean-1；播放 0 1 2 1 0 3 | 呼吸 4 帧 |
| dash | dash0, dash1 | 低身疾冲、腾空 2px |
| atk | wind, strike, follow, back；`hit:1` | 蓄 → 出 → 斩（送到底）→ 收；主角挥剑、苏芷甩针（出手帧带三枚飞针） |
| atk2 | chamber, thrust, back；`hit:1` | 快招：主角回手突刺、苏芷腰间快甩 |
| hurt | hurt | 后仰 |
| cast | cast, cast:bob1 | 主角横剑剑指、苏芷合掌运功 |
| brk | kneel, kneel:bob1（loop） | 破势跪地喘息 |
| dead | hurt, kneel, dead | 倒地 |
| win | win, win:bob1, win | 主角反手收剑、苏芷举针 |

## 4. 敌人 / 大黄（battle v4 · 工作流 I：帧动画管线，替代 v2 的 14 帧变形流程）

敌人与大黄全部改走 §3 管线：人形敌人复用人形骨骼（按角色调比例/武器骨），动物用新增的非人形骨骼（`tools_fx/rig/rig_beast.py`：四足 / 禽 / 蛇样条链，见 `anim-pipeline.md` §2.2）。表内敌人朝**右**、大黄朝**左**。`BART` 条目为完整对象（不再用 `foe()` 工厂与统一 `FOE_ANIM`），由 `bart_sync.py` 从 `raw_battle/I/sheets.json` 写进 `//@@FOES` 区；该区里没有 I 条目的角色才回退 v2 的 `foe()` 行。

### 4.1 人形敌人（bandit / chief / monk / beggar，18 帧：12 个生成姿势 + 6 个派生帧）

| 帧 | 姿势 | 动作映射 |
|---|---|---|
| 0–3 | guard, guard:bob1, guard:bob2, guard:lean-1 | idle `[0,1,2,1,0,3]` loop |
| 4–5 | dash0, dash0:air2 | dash `[4,5]` |
| 6–9 | wind, strike, follow, back | atk `[6,7,8,9]` hit:1（蓄-出-斩-收） |
| 10–11 | chamber, thrust | atk2 `[10,11,9]` hit:1 |
| 12 | hurt | hurt `[12]` |
| 13–14 | cast, cast:bob1 | cast `[13,14]` |
| 15–16 | kneel, kneel:bob1 | brk `[15,16]` loop（破势瘫跪喘息） |
| 17 | dead | dead `[12,15,17]` |

各角色的招式：山贼厚背刀（举刀过肩 → 斜劈 → 刀落地前 → 收；atk2 腰间回刀 → 平刺；cast 扛刀马步）；独眼阎罗鬼头大刀（待机刀扛右肩；atk 过顶重劈；atk2 拖刀 → 横扫；**cast = 头目蓄力姿势**：大刀拖在身后、弓步沉身——`bfx.js` 在 `u.charging` 时 hold 播放 cast，所以蓄力回合显示这一帧）；老僧徒手（atk 收掌腰间 → 推掌；atk2 双掌收胸 → 双掌齐推；cast 合十）；丐帮长老竹棒（atk 举棒过顶 → 下劈；atk2 回棒 → 平棒直戳；cast 拄棒调息）。

### 4.2 动物（wolf / dog / rooster / snake，14 帧：8 个生成姿势 + 6 个派生帧）

| 帧 | 四足 wolf / dog | 禽 rooster | 蛇 snake |
|---|---|---|---|
| 0–3 待机（原姿 + bob1/bob2/lean-1） | stand | stand | coil（盘起昂首） |
| 4–5 冲刺（+ air2 / bob1） | run | run | slither（贴地蛇行） |
| 6 | crouch 伏身蓄势 | rear 扬翅后仰 | rear 后缩蓄势 |
| 7 | leap 扑（腾空 7） | peck 啄 | strike 扑咬 |
| 8 | bite 咬 | kick 飞踢（腾空 10） | wrap 缠绕 |
| 9 | hurt | hurt | hurt |
| 10 | crouch:bob1 | rear:bob1 | rear:bob1 |
| 11–12 | low, low:bob1 | low, low:bob1 | low, low:bob1 |
| 13 | dead | dead | dead |

`BART` 动画：idle `[0,1,2,1,0,3]`、dash `[4,5]`、hurt `[9]`、cast `[6,10]`、brk `[11,12]` loop、dead `[9,11,13]`；
四足 atk `[6,7,8,0]` **hit:2**（扑到身前才咬中）、atk2 `[6,8,0]` hit:1；禽 atk `[6,7,0]` hit:1（啄）、atk2 `[6,8,0]` hit:1（飞踢）；蛇 atk `[6,7,0]` hit:1（扑咬）、atk2 `[6,8,0]` hit:1（缠绕）。

v2 的 `raw_battle/D/*.png` 原图保留作参考，不再参与组表。

## 5. 精灵表排布

- 单行，帧号 = 列号（`cols` = 帧数）。单元 `cell` = `px × 3`。
- 文件：`assets/b_{char}.webp`（无损 webp）。

## 6. `BART` 字段

| 字段 | 含义 |
|---|---|
| `file` | `assets/` 下文件名（不带扩展名） |
| `cell` | 单元像素 `[w,h]`（已含 ×3） |
| `cols` | 每行帧数 |
| `facing` | 表内朝向 `'l'` / `'r'` |
| `h` | `= cell[1]`（源表 3× 单元高的元数据；当前实际显示身体高度由 `unitH` 与待机身体 alpha 范围决定，不再等于 `h × 2/3`） |
| `tier` | `party / minion / elite / boss` |
| `anim.{k}` | `f` 帧序号；`ms` 每帧毫秒（数或逐帧数组）；`loop`；`hit` 命中帧在 `f` 中的序号 |

## 7. 命令

```bash
# 我方（帧动画管线）
python3 tools_fx/rig/mannequin.py hero                 # 白模总览 review/battle_v3/E/rig_hero.png + raw_anim/hero/rig/
GEN_MODEL=gpt-image-2.5-flare python3 tools_fx/rig/genframes.py model hero   # 定妆图 raw_anim/hero/model.png
GEN_MODEL=gpt-image-2.5-flare python3 tools_fx/rig/genframes.py grid hero atk base move down   # 动作网格（≤3 并发；同名重复 = 多候选）
python3 tools_fx/rig/qa.py hero [--regen 2]            # 质检 + 选帧 → raw_anim/hero/qa.json
python3 tools_fx/rig/assemble.py hero --pipe atk       # 组表 + 对比图 review/battle_v3/E/pipe_hero_atk.png
# 敌人 / 动物（帧动画管线，工作流 I）
python3 tools_fx/rig/mannequin.py chief                # 白模总览 review/battle_v4/I/rig_chief.png
python3 tools_fx/rig/batch.py model chief wolf         # 定妆图（≤3 并发，已有则跳过）
python3 tools_fx/rig/batch.py grid chief:atk,base,move wolf:atk,base   # 动作网格
python3 tools_fx/rig/qa.py chief [--regen 1]           # 质检选帧 → raw_anim/chief/qa.json
python3 tools_fx/rig/assemble.py chief --pipe all      # 组表 assets/b_chief.webp + raw_battle/I/sheets.json + review/battle_v4/I/pipe_chief.png
python3 tools_fx/rig/compare.py                        # 同尺度对比 review/battle_v4/I/compare.png
# 同步与检查
python3 tools_fx/bart_sync.py                          # sheets.json → js/bart.js 自动区
python3 tools_fx/bcompare.py [帧号]                     # （v3）同尺度对比图 review/battle_v3/E/compare.png
```

`hero_battle.py` / `party_battle.py`（v2 小人变形）已停用；`foe_battle.py`（v2 敌人 14 帧变形）在 v4 起停用（`bart.js` 的 `foe()` / `FOE_ANIM` 仅作未重做角色的回退）。
