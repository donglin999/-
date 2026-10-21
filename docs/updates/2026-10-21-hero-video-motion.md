# 萧白蓝衣走跑换成视频后期版

状态：现行　最后核对：2026-10-21

工作区：xiaojianghu-legacy-prologue / 8792。

## 需求原话

2026-10-21：“用我的 302 key 去调用wan3.0-video-prime、seedance2.5 去试试生成移动预览给我看看”；“应该是是需要四向的视频才可以吧？还有跑步的视频也需要生成去看下”；试走后：“直接替代吧，新版好太多了”。

## 改了什么

- 新增正式素材 `s_qh_hero_blue_walk_20261021`（12 帧）与 `s_qh_hero_blue_run_20261021`（10 帧），规格同 C 包：单元 96×116、原点 [48,108]、行序 dlru、步距不变。已登记 production-assets.json/.md 与 js/production-assets.js；`check_production.py` 通过。
- `js/qihe-hero-blue-art.js` 的走、跑改指新文件；站立与基础表仍用 2026-10-10 C 包。旧走跑文件和登记保留供追溯，不再被运行代码引用。
- 新增本地评审入口 `js/qihe-hero-motion-review.js`：`http://127.0.0.1:8792/?journey=hero-anim-test&play=1` 用独立存档直接站在栖河地图（蓝衣、自由行走），不读写正式旅程；已登记 `scripts/build-pages.cjs` 的 REVIEW_SCRIPTS，不进发布包。
- 来源批次 `art_sources/hero-motion-video-20261021/`：首帧（idle 放大 6 倍贴纯绿底）、提示词、原始视频与任务返回、`tools/vgen2.py`（302 调用）、`tools/post.py`（后期）、`adopt.py`（登记）、`manifest.json`、对照图。

## 做法

1. 302.AI `wan3.0-video-prime` 图生视频：720P、5 秒、首帧为同向站姿；下、上、右三向各走、跑一段，左向用右向逐帧镜像（C 包已确认对称）。
2. 本地后期（不需 AE）：抠绿去溢色 → 缩回 1x → 锁同向站姿调色板 → 上半身中线与脚底对齐 → 自动找一个完整步伐循环 → 等距取帧。
3. 同时试过 `doubao-seedance-2-5-260628`（右向走一段）：开头约 1～2 秒几乎不动、步子偏小，未采用。

## 已知问题

- 正面走手臂摆动偏小。
- 侧面远侧手锁色后偏橙。
- 视频模型不能精确控制姿势，后续重做时需多抽几次再挑。

## 验证

- 8792 评审入口：走、跑新文件 200 加载，站立仍为 C 包，控制台无错误；左右方向键行走时朝向与位移正常。
- 未做：线上发布（须用户另行许可，R-发布-01）。
