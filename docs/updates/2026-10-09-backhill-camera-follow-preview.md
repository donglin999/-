> **状态（2026-10-10 标记）：** 本记录只是 `?pixel90=backhill` 显式预览的接入，新后山美术与“后山改镜头跟随”都未采用进默认游戏，不启用；默认 8792 的后山仍是 1152×648 固定一屏的现版。 不得作为画风、规格或流程的参考；正式依据与替代做法见[弃用／不启用的测试方法清单](../assets/deprecated-tests.md)。

# 2026-10-09 后山镜头跟随 · 90 格像素版显式预览接入

## 用户需求与已确认方案

- 用户决定把后山改为“镜头跟随”，以便接入整图像素重画批次 `art_sources/scene-pixel-backhill-full-20261009/`（1600×900 美术像素，1080p 下 1 美术像素 = 2 屏幕像素，主角 90 格）。
- 本轮只做**显式预览**接入：默认 8792 打开时后山必须与现版完全一致（1152×648 固定一屏、noFollow、m_prologue_backhill_v1 + 模块化道具层）。
- 新美术仍是“未采用”状态：不进 `assets/production`、不改正式素材清单。

## 工作区、运行入口

- 工作区：`xiaojianghu-legacy-prologue`，固定入口 `http://127.0.0.1:8792/`（`python3 scripts/serve-current.py --check` 通过，map_id m_qh_central）。
- 预览开关（URL 参数，只在 8792 的栖河入口 hash `''`/`#qihe-map`/`#prologue` 下生效）：
  - 剧情预览：`http://127.0.0.1:8792/?pixel90=backhill&play=1#qihe-map` — 新序章剧情直接在新后山演出。
  - 自由行走：`http://127.0.0.1:8792/?pixel90=backhill&pixel90roam=1&play=1#qihe-map` — 不走剧情，直接站在新后山“初遇”点，可用 WASD/方向键/点击移动。
  - 碰撞遮罩：自由行走中按 F9 切换（或加 `&pixel90mask=1`），不可走处压红，蓝条为脚底碰撞盒。
  - 预览页顶部常驻横条：“90 格像素后山 · 显式预览（不写正式存档）”，含“剧情 / 自由行走 / 返回当前游戏”链接。
  - 注意：首页“从序章开始”按钮会生成不带参数的新地址，因此预览要直接打开上面的完整地址（带 `play=1`）。

## 核对的文档

`AGENTS.md`、`docs/design/runtime-entry.md`、`docs/update-workflow.md`、`art_sources/scene-pixel-backhill-full-20261009/README.md`；代码 `js/prologue-backhill.js`、`js/prologue-backhill-props.js`、`js/scene.js`、`js/core.js`、`js/qihe-map-trial.js`、`js/qihe-startup.js`、`js/runtime-entry.js`、`js/prologue-arrival.js`。

## 实际修改

| 文件 | 类型 | 说明 | 对默认路径的影响 |
|---|---|---|---|
| `art_sources/scene-pixel-backhill-full-20261009/export_runtime.py` | 新增 | 导出脚本（见下） | 无，离线脚本 |
| `art_sources/scene-pixel-backhill-full-20261009/runtime/` | 新增（脚本产物） | `ground_runtime.png`、`props_atlas.png`、`backhill_px90_data.js`、`hero/xiaobai_{d,l,r,u}_1x.png`、`mask_debug.png`、`export_report.json`、`verify/*.png` | 无，只有预览会请求；不在正式清单内 |
| `js/prologue-backhill-pixel90-preview.js` | 新增 | 预览运行时；首行判断 `pixel90=backhill` 与栖河入口，不满足直接返回 | 默认入口根本不加载此文件 |
| `index.html` | 修改 1 处 | 在 `js/prologue-backhill.js` 之后加一段内联条件钩子：URL 含 `pixel90=backhill` 时才 `document.write` 预览数据包与预览脚本 | 默认入口只执行一次正则判断；浏览器核验默认地址时未请求任何 pixel90/px90 资源 |
| `docs/updates/2026-10-09-backhill-camera-follow-preview.md` | 新增 | 本记录 | — |

未改：`js/scene.js`、`js/core.js`、`js/prologue-backhill.js`、`js/prologue-backhill-props.js`、`assets/production`、`production-assets.*`；批次内 `ground.py`、`compose_full.py`、`roles.json`、`extract.py`、`preview.py`、`sprites/`、`README.md` 均未改。

### 导出脚本 `export_runtime.py`

```bash
cd art_sources/scene-pixel-backhill-full-20261009
python3 compose_full.py      # 美术会话负责：先生成 out/
python3 export_runtime.py    # 读 out/ + sprites/ → runtime/；退出码 0 = 锚点全部可达，2 = 有不可达
# 可选：--mask-cell 2（遮罩每格美术像素） --foot-x 10（可达性检查用的脚底半宽，世界像素） --no-carve（不可达时不自动开路）
```

- 地面：`ground_1x.png` + 全部 flat 件烘进去；凡不被非 flat 道具不透明像素覆盖的位置直接取 `backhill_1x.png`（因此投影与美术烘焙完全一致）。
- 图集：非 flat 道具按 (精灵, flip) 去重打成货架图集；flip 件存镜像副本，运行时无需翻转。道具表与 `PROLOGUE_BACKHILL_PROPS` 同格式 `[ax,ay,w,h,worldX,worldY,sortY]`，`propK=1.2`。
- 自检：地面 + 图集道具按 sortY 叠回，与 `backhill_1x.png` 逐像素比较（本轮 0 像素差）。
- 碰撞：classes 1 草 / 2 土可走；4 林 / 5 灌丛 / 6 崖不可走；非 flat 道具按脚底扁椭圆挡住（大树只挡树干，最少 8 美术像素深，避免寻路采样穿过）。遮罩 800×450（每格 2 美术像素 = 2.4 世界像素），格式同 `sc.mask`。
- 锚点：`backhill.tmj` 的 anchors（初遇/遇狼各站位、4 个出口）按 1600/1152 换算；世界坐标 = 现版 ×5/3；剧情 poses 同样 ×5/3。按运行时脚底碰撞盒做可达性检查，若不可达可自动沿最低代价路开 12 像素宽的可走带并在报告里警告（本轮无需开路）。
- 主角：复制 `hero-pixel-design-20261009/approved/xiaobai_*_1x.png` 的当前快照，并记录脚底行。
- 其他会话还在改 `ground.py`/`compose_full.py`/精灵；本轮两次导出之间道具数从 flat 471→477→523 变化过，最后一次导出时间 2026-10-09 16:42:23。美术更新后重跑两条命令即可，无需改 JS。

### 预览运行时 `js/prologue-backhill-pixel90-preview.js`

- 世界：48×27 格 = 1920×1080 世界像素 = 1600×900 美术像素。`ZOOM=5/6`，所以画布上 1 美术像素 = 1 画布像素，1080p（画布 1920 宽）下 2 屏幕像素。
- 后山 `SC.prologue_backhill` 原地换成新底图、图集道具层（与人物按 sortY 排序，`revealPlayer` 开启，主角在大件后方时道具半透明）、新遮罩、`preciseNav`、`footX=10`。
- 镜头：后山模块在固定场景里每帧把镜头钉回 (0,0)。预览外包一层 `updateScene`，在后山时用引擎原有 `updateCam` 跟随主角并夹在 `[0,WW-VW]×[0,WH-VH]`；`show()/retreat()` 后立即对齐镜头。
- 剧情站位：原地替换 `PrologueBackhill.poses`（×5/3），`sc.start` 同步；后山模块里写死的第二只狼 `[430,330]` 在 `show()` 后按锚点 `dog_wolf2` 改正。
- 主角：90 格站立帧按朝向 d/l/r/u 切换，按画布像素取整绘制，带平涂脚底阴影。**目前没有走跑帧，移动时就是站立帧平移**（另一个会话在做动画）。
- 自由行走场景 `SC.px90_backhill_roam`：同一套新美术，不挂剧情，放一个静态叶蘅作排序对照。
- 存档隔离：预览期间 `persistState/loadSave` 改写到 `sessionStorage` 的 `xjh.qihe-pixel90.preview.v1`，每次打开从头开始，不写正式旅程与“最近旅程”指针。

## 采用、替换、弃用

无。新后山与 90 格主角仍是待审候选，未登记正式素材。

## 验证

- `python3 scripts/serve-current.py --check`：通过（8792 = 本工作区）。
- `python3 tools_assets/check_production.py`：`{"status": "pass", "assets_checked": 671, "errors": []}`。
- `node --check js/prologue-backhill-pixel90-preview.js`：通过。
- `node tests/toast.test.cjs`：通过。`tests/character-grounding.test.cjs` 失败（夹具里没有 `drawImageAsset`，`ReferenceError`）、`tests/containers.test.cjs` 失败（找不到 `/private/tmp/claude-501/pw/node_modules/playwright`）——两者都不加载本轮文件，属于既有问题，未处理。
- 导出报告 `runtime/export_report.json`：复合差 0 像素；10 个锚点（6 个剧情站位 + 4 个出口）全部可达，未开路。
- 浏览器（Claude 内置浏览器，视口模拟 1920×1080；截图为脚本把画布按 1920×1080、PXS=2 重绘后导出，即“画布铺满 1080p”时的样子）。截图在 `art_sources/scene-pixel-backhill-full-20261009/runtime/verify/`：
  - `01_roam_start.png`：自由行走初遇点。主角在 1080 画布上实测 180 像素高（脚底阴影另计）。
  - `02_follow_after_walk_right.png`：按住右键 240 帧，主角 x 982→1619（被林地挡住），镜头 x 404→768 跟随并夹在右边界 768。
  - `05/06_occlusion_oak_*`：主角在老槐树后方被遮挡（树半透明）/走到树前方时画在树前。
  - `07/08_occlusion_bush_*`：灌木后方只露上半身 / 灌木前方正常。
  - `09_collision_rock_mask.png`：从石块南侧向北走，停在石块排序线以南 7 世界像素，不能穿过。
  - `10_collision_cliff_mask.png`：向西走进崖坡，停在崖边（可站边界 x=584，停在 586.6）。
  - `11_clamp_topleft.png` / `12_clamp_bottomright.png`：主角瞬移到左上/右下角，镜头分别夹在 (0,0) 与 (768,432)。
  - 点击寻路：从初遇点分别点到 4 个出口、狼与叶蘅的站位，全部到达（终点误差 0）。
  - `13_story_encounter.png`：剧情预览 P-01-01，主角 (980,660)、叶蘅 (1240,630)，即现版 ×5/3；镜头以主角为中心。
  - `14_story_dog_pose_forced.png`：在控制台直接调用 `PrologueBackhill.show('dog')` 强制切到遇狼站位（没有真的打完递水片段），主角/叶蘅/两只狼都在可站位置，第二只狼已改到 (860,660)。
  - `15_default_backhill_unchanged.png`：默认地址（测试旅程 `?journey=px90-default-check&play=1#qihe-map`）下后山仍为 WW×WH=1152×648、镜头 (0,0)、底图 m_prologue_backhill_v1、道具 145 件、poses 原值，页面没有加载任何 pixel90/px90 资源，控制台无报错。该测试旅程的存档键事后已从浏览器面板的 localStorage 清除。
  - 剧情/自由行走预览期间 localStorage 没有出现任何 `xjh.qihe*` 键。

## 剩余事项 / 已知问题

1. 主角只有站立帧，移动时平移；走跑帧接入待另一会话完成（届时按 ART.walk/run 规格或在预览脚本里加帧表）。
2. 90 格主角是乡村便衣造型；剧情此时萧白应穿现代衣服，预览里一律用这套站立帧。
3. ~~叶蘅、狼仍是旧规格小人~~ → 第二轮已接入 90 格叶蘅与野狗（见下文“第二轮”）。
4. 后山模块的握木杆线条（`sc.fx`）按旧身高的偏移量画，本轮没有截到握杆状态，位置可能对不上新主角；剧情对白框会挡住画面下部，站位在新尺度下是否需要上移需人工看。
5. 当前游戏框在 1920×1080 视口里实际是 1856×1044（四周留边），所以真实 1080p 浏览器里 1 美术像素 ≈ 1.93 屏幕像素、主角约 174 屏幕像素，且放大倍数非整数；要做到严格 2 屏幕像素需要调整画框布局，本轮没动。
6. 首页“从序章开始”会丢掉预览参数，只能直接用带 `play=1` 的地址进入预览。
7. 后山原本没有出口（剧情驱动），预览也没有加出口交互，只检查了 4 个出口锚点可达。
8. 预览只隔离了自动存档路径；手动存档管理、资源/装备写入等后期系统仍直接写正式键，后山阶段不会触发，但不要在预览里使用这些功能。
9. 正式采用时需要：定稿美术 → 重跑导出 → 素材入库与清单登记 → 把预览钩子改为正式实现（后山模块本身改 noFollow/camera），并补浏览器验收。

## 第二轮（同日）：叶蘅 / 野狗 90 格站立像 + 美术定稿重导出

- 需求：协调方告知 `art_sources/cast-pixel90-20261009/approved/` 已完成叶蘅（ye_d/l/r/u_1x，39/33/33/38×90）与野狗（dog_l/r_1x，91×48）；后山美术批次已稳定（大石堆、崖壁、地面更新）。
- 改动：
  - `export_runtime.py`：人物帧复制改为通用函数，主角之外再把叶蘅、野狗原样复制到 `runtime/cast/`，数据包新增 `cast:{ye:{d,l,r,u},dog:{l,r}}`（含脚底行）。不做任何抠色。
  - `js/prologue-backhill-pixel90-preview.js`：预览场景里 `c_ye` 用 ye 帧按朝向切换，`c_wolf`（两只狼都是）用 dog_l/dog_r，上下朝向沿用最近的左右朝向；图像原样绘制，**没有绿色抠图**（药篓草叶保留）。剧情 NPC 的 `h` 改为新站立像世界高度（叶蘅 108、狼 57.6），名牌与碰撞半径随之调整。自由行走场景加了一只静态野狗（dog_dog 站位）作对照。仍只在 `?pixel90=backhill` 下加载。
- 重跑：`python3 compose_full.py && python3 export_runtime.py` → 退出码 0；`export_report.json`（17:05:33）：复合自检 0 像素差，10 个锚点全部可达，未开路；非 flat 道具 296、flat 523、图集 35 项。
- 浏览器验证（1920×1080，截图 `runtime/verify/v2_*.png`）：
  - `v2_13_story_encounter.png`：初遇 P-01-01，萧白与叶蘅在 1080 画布上都是 180 像素高（隐藏前后像素差测得，含阴影 188），叶蘅药篓绿叶正常显示。
  - `v2_14_story_dog_pose_forced.png`：控制台强制切到遇狼站位（未打完递水片段）；两只狼都用 90 格野狗图，站位 (700,660)/(860,660)，叶蘅 (1480,630)，均可站。
  - `v2_01_roam_start.png`、`v2_02_follow_walk_right.png`：自由行走；按住右键主角 x 981→1619（林地挡住），镜头 x 404→768 并夹在右边界。
  - `v2_09_collision_boulder_mask.png`：新大石堆（254×144 世界像素，排序线 y=354.8）从南侧向北走，停在 y=363.1，穿不过去。
  - `v2_10_collision_cliff_mask.png`：向西走进崖区，停在崖边（可站边界 584，停在 586.6）；崖区按“空地是台地、崖区在下方落差”处理，崖区整体不可走。
  - `v2_11/12_clamp_*`：镜头夹在 (0,0) / (768,432)（瞬移测试）。点击寻路到 4 个出口及狼、叶蘅站位附近全部到达。
  - `v2_15_default_backhill_unchanged.png`：默认地址后山仍为 1152×648、镜头 (0,0)、m_prologue_backhill_v1、145 件道具、poses 原值，未请求任何 pixel90/px90/cast-pixel 资源；测试旅程存档已清除。
- `python3 tools_assets/check_production.py`：pass（671 项，0 错误）；`node --check` 通过。
- 仍未完成：走跑帧（三个角色都只有站立帧，移动时平移）；狼只有左右两向；剧情此时萧白应穿现代服；握木杆线条未适配；画框 1856×1044 导致真实 1080p 下非整数倍放大（同第一轮第 5 条）。

## 本地完成 / Git 提交 / 线上发布

- 本地完成：是（预览接入、导出脚本、验证截图）。
- Git 提交：否（按要求未提交）。
- 线上发布：否。
