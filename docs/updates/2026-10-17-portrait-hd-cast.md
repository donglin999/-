# 2026-10-17 叶蘅与开场四人立绘高清半身重画

## 原因

叶蘅（306×640 窄幅近景）和周砚、陆衡、程铎、乌魁（480×640 全身）的对话立绘与已完成的沈雁回等高清半身像规格不一，放大后发糊。

## 做了什么

- 沿用 `art_sources/portrait-hd-20261017/` 的做法，工作目录 `art_sources/portrait-hd-cast-20261017/`。
- 本体：现有正式立绘作身份参考（图1），已完成的高清半身像作画风参考（图2：叶蘅用沈雁回，男性用宋先生），用 `codex exec` 内置 image_gen 重画，原生透明 RGBA，1024×1536。
- 第一版（`*_base.png`）头太大，3:4 画布底部会露出断边，未采用；第二版（`*_base2.png`）在提示词里写明眼线、下巴的像素位置后重画，已采用。
- 表情差分以各自高清本体为编辑目标，只换表情、不换姿势（叶蘅 battle 为戒备神情，姿势同本体）。
- 提示词均带 `Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）`；内置生图由服务端选模型，实际后端型号未披露，只记为请求值。
- 后期 `finalize.py`（同上一轮：不抠图、不改 alpha，只做等比缩放＋平移到 960×1280；差分先按 alpha 轮廓与本体配准，IoU 均 ≥0.98）。参数在 `transforms.json`，结果在 `finalize-report.json`。无损原图在 `final/`，发布用文件为有损 webp（quality=92, method=6, alpha_quality=100），可用 `python3 finalize.py _hd_20261017 --publish` 重新导出。

## 新文件（assets/production/portraits/，旧文件未动）

| 人物 | 本体 | 表情 | 眼线 y | 下巴 y |
|---|---|---|---|---|
| 叶蘅 | p_ye_hd_20261017 | angry / battle / hurt / shy / smile / surprise / worry | ≈239 | ≈342 |
| 周砚 | p_opening_zhouyan_hd_20261017 | firm / worry | ≈208 | ≈320（山羊须下缘≈340） |
| 陆衡 | p_opening_luheng_hd_20261017 | firm / worry | ≈211 | ≈320 |
| 程铎 | p_opening_chengduo_hd_20261017 | firm / worry | ≈211 | ≈322 |
| 乌魁 | p_opening_wukui_hd_20261017 | firm / worry | ≈208 | ≈320（胡须下缘≈328） |

表情文件名为原名加 `_hd_20261017`，共 20 张，均 960×1280 RGBA，衣服自然裁切到画布底，上左右不截断。

## 说明

- 头顶位置：陆衡高马尾顶在 y≈18（1.4%），其余 2.1%～2.8%，略高于 3%～6% 的目标；要保证底边不露断口，脸的大小又要符合眼线/下巴规格，只能这样取舍。
- 取景实际到大腿上部（和宋先生等一致），不是严格腰线。
- 叶蘅 hurt 与 worry、angry 与 battle 神情较接近。
- 尚未接入 js/html，也未登记，由主会话处理。
