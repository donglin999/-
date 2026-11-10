# 2026-11-08 接住评审台回答：背景板中档、八种命中成品、序章持棍与递水 CG 候选

状态：现行　最后核对：2026-11-08

用户在评审台答了第三十六、三十七、三十八、三十九、四十一轮共七道题，随后说“开工”。

## 各题怎么接的

- **第四十一轮 1 · 队伍页背景板**：选中档＋脚影、背光、虚化。
  - 八张背景板按中档重出（`docs/review/menu-figure-plate-v2/*-mid.png`，总览 `_sheet_mid.jpg`），替换 `game/assets/ui/jianghu-v4/figplate/`；`menu.gd` 的 `FIG_FX` 默认改为 `["shadow", "halo", "dof"]`。呼吸没开（用户没选）。
  - 殷红缨菜单立绘 `portraits/yinhongying.webp` 里袖子和裙摆之间四块没抠净的纯白改成透明（修改前的原件存在 `_attic/2026-11-08-yin-portrait/`；对话用的 `p_gy_yinhongying.webp` 在浅底上看不出，没动）。
  - 试样目录 `figplate-test/` 移到 `_attic/2026-11-08-figplate-test/`。
  - 实机 `build/menu-plate-mid/cmp.jpg`；整改贴在题下等验收。
- **第四十一轮 2 · 招式内功图标**：选“可以”，模块归档。
- **第四十一轮 3 · 新功法数值**：选“按现在的数值”，模块归档；表末两处没定的维持现状（万壑归元诀固定加伤、薪火功三层不接）。
- **第三十九轮 2 · 通用命中**：棍击通过，其余按推荐（刀甲、咬甲、拳乙、剑乙、暗器甲、啄乙、毒乙）。
  - 七种各出一张 2×2 关键帧条（`docs/review/vfx-hit-final-v1/`，提示词在 `prompts/`，咬第一次出成灰底重出一次），棍击用 11-05 的条。
  - `bake_hits.py`：切格 → 接触点锚定 → 缩到战斗特效像素 → 每种取 24 色锁色、透明度 5 阶 → 横排精灵表 `game/assets/fx/hits/*.png` ＋ `game/data/battle/fx_hits.json`（12fps 持帧、末帧淡出、顿帧震屏、概念图力的方向 `dir`、接触点下移 `oy`）。
  - `battle/vfx.gd`：新增贴图缓冲 `buf_sp` 和 `baked_hit()`，`hit_fx()` 有成品就播成品；出手方向和概念图相反时镜像；暗器有成品后不再叠旧的三道程序轨迹。`battle/view.gd` 画贴图。
  - 截图用调试战斗 `--battle=hits`（每 0.9 秒放一种），实机连拍改了三轮：剑缩小、啄接触点挪到膝、毒挪到腰胯、暗器放大、去旧轨迹。连拍在 `build/fx-hits5/_sheet.jpg`；整改贴在题下等验收。
  - 只换了普通攻击和走通用命中的招式；有专门特效的招式（第二批）照旧。
- **第三十六轮 · 序章**：11-02 选的“持棍要专门画一张，CG 也重画”一直没接住，补上。持棍地图小人（甲双手横握、乙单手棍尖指地）、递水 CG（甲土坡石头边、乙坡脚大石旁，林间土路、天色偏晚）各两版候选在 `docs/review/prologue-staff-water-v1/`，发第四十二轮第 1 题。
- **第三十七轮音频、第三十八轮序章配乐**：只选了方向，没写每场用哪首，在模块里记下、等用户补。

## 验证

- 全套自测（`build/selftest/20261108-223320/`）：除队伍页截图因新背景板变了以外全过；重拍 menu-party 基准。
- 评审台：发题自查通过；浏览器里看过新题和两处整改，图、选项、按钮都正常。
- 界面全程测试（默认选法，`build/fullrun/firstc.log`）：从开局真打到汉皋城门，8 场战斗都用上了新命中特效，没有脚本报错、没有卡住。

## 第二轮（同日）：你又在台上答了三处

- **第三十九轮 2**：命中特效点了满意，模块归档。
- **第四十二轮 1**：选持棍甲、CG 甲。
  - 持棍：`staff_A` 去边、缩到地图小人的像素尺度，存为 `assets/production/characters/s_opening_hero_staff_hold_20261108.webp`；`prologue.gd` 的 `_draw_holding_rod` 优先画它（脚底对齐人物站点），不再用战斗帧缩小。截图参数 `--scene=prologue_backhill --rod=1`，实拍 `build/staff-hold/rod.png`。
  - 递水 CG：`water_A` 居中裁成 16:9、缩到原尺寸，覆盖 `cg_p_water_v1.webp`（文件名在资源清单、打包表等六处登记，沿用原名）；旧图在 `_attic/2026-11-08-water-cg/`。
- **第四十一轮 1 · 继续改**：“背景没有差异化……提示词是不是也应该有一些量化指标”。第三版按量化规格重出八张，量化检查 28／28 对达到差异门槛（上一版 0／28），见 [menu-figure-plate-v3](../review/menu-figure-plate-v3/README.md)。已换进 `figplate/`，实机 `build/menu-plate-v3/cmp.jpg`。
- 全套自测（`build/selftest/20261108-232327/`）只有队伍页截图因换背景板变了，已重拍基准，其余全过。

## 第三轮（同日）：背景板只用底图的颜色

- 用户在对话里说：“背景不需要更多的颜色，还是以背景的色点作为组成色，不然就太乱了。”第三版靠换色相拉开差异，被否。
- 第四版：从菜单底图取 20 色色板，提示词只许用这些颜色；`tone.py` 只调深浅把每张调到目标明度和对比；`measure.py` 改成查“配色在不在底图色内”＋明暗、对比、留白、重心、上下明暗五项差异。结果：八张全在底图色内，28／28 对拉得开。见 [menu-figure-plate-v4](../review/menu-figure-plate-v4/README.md)。
- 先试过把第三版事后硬锁色，出来发黄发粉，弃用（`lock.py`、`try_lock_v3/` 留作记录）。
- 已换进 `figplate/`，第三版存到 `_attic/2026-11-08-figplate-v3/`；实机截图 `docs/review/menu-figure-plate-v4/_ingame.jpg`。
- 全套自测（`build/selftest/20261108-234734/`）全过；之前重拍了 menu-party 基准。
