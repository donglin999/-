# 2026-10-17 主角萧白立绘高清半身重画

## 做了什么

- 照 `2026-10-17-portrait-hd.md` 的做法，把萧白村装、现代装两套立绘重画为 960×1280 高清半身像（原生透明 RGBA）。工作目录 `art_sources/portrait-hd-hero-20261017/`（`prompts/`、`raw/`、`ref/`、`logs/`、`run.sh`、`finalize.py`、`transforms.json`、`finalize-report.json`）。
- 生图走 `codex exec` 内置 image_gen，提示词均带 `Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）`；实际后端型号未披露，只记为请求值。
- 本体：先以旧立绘为身份参考、宋先生高清像为画风/取景参考出第一版（`*_base.png`），头部偏大，按眼线 ≈215、眼到下巴 ≈105 缩放后底部会露空；于是以第一版为编辑目标“拉远镜头”重出 `*_base2.png` 作为本体。第一版未采用。
- 表情差分以高清本体为编辑目标生成，只换表情、不换姿势。旧 `modern_guard` 是持棍全身姿势，新版只做“戒备”表情，姿势同本体。
- 后期 `finalize.py`（复制自上一轮）：不抠图、不改 alpha，等比缩放＋平移到 960×1280；差分先按 alpha 轮廓与本体配准（IoU 0.988～0.995，均无需额外位移）再共用本体变换。无损原图在 `final/`；发布图另以有损 webp（quality=92, method=6, alpha_quality=100）导出到 `assets/production/portraits/`。

## 新文件（assets/production/portraits/，旧文件未动）

| 套装 | 本体 | 表情 | 缩放 | 眼线 y | 下巴 y | 发顶 y |
|---|---|---|---|---|---|---|
| 村装 | p_opening_hero_village_hd_20261017 | firm / hurt / smile / surprise / worry | 0.92 | ≈215 | ≈320 | ≈30 |
| 现代装 | p_opening_hero_modern_hd_20261017 | firm / guard / hurt / smile / surprise / worry | 0.87 | ≈215 | ≈320 | ≈25 |

表情文件名为 `p_opening_hero_<套装>_<表情>_hd_20261017.webp`，共 13 张。

## 说明

- 萧白头发蓬松偏高，眼线放 215、眼到下巴 105 时发顶只能在 y≈25～30（约 2%～2.3%），略高于 3%～6% 的目标，但头发完整未出画。
- 差分之间头发丝的走向有细微重绘差异（image_gen 编辑的固有现象），轮廓位置一致。
- 远离人物处有极少量 alpha≤2 的游离像素，肉眼不可见，按约定未做处理。
- 尚未接入 js/html，也未改素材登记表，由主会话接线和登记。
