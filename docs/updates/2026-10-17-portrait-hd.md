# 2026-10-17 四人对话立绘高清半身重画

## 原因

沈雁回、徐令仪、岑霜、宋先生的对话立绘是 480×640 全身取景，脸很小，游戏里要放大 1.5～1.7 倍才和主角半身像一样大，因而发糊。

## 做了什么

- 以现有正式立绘为身份参考、主角半身像 `p_opening_hero_modern.webp` 为取景参考，用 `codex exec` 内置 image_gen 重画四人高清半身本体（原生透明 RGBA，1024×1536），再以各自高清本体为编辑目标生成表情差分（只换表情）。
- 提示词均带 `Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）`；内置生图由服务端选模型，实际后端型号未披露，只记为请求值。
- 沈雁回第一版脸偏大、高马尾占位高，3:4 画布底部会缺衣服，改为头部略小重画一次（`shen_base2`），第一版未采用。
- 后期 `art_sources/portrait-hd-20261017/finalize.py`：不抠图、不改 alpha，只做等比缩放＋平移到 960×1280（lossless webp）；表情差分先按 alpha 轮廓与本体配准，再共用本体变换。参数在同目录 `transforms.json`，结果在 `finalize-report.json`。

## 新文件（assets/production/portraits/，旧文件未动）

| 人物 | 本体 | 表情 | 眼线 y | 下巴 y |
|---|---|---|---|---|
| 沈雁回 | p_qh_shenyanhui_story_hd_20261017 | angry / happy / sad / skeptical / surprise | ≈240 | ≈340 |
| 徐令仪 | p_qh_xulingyi_story_hd_20261017 | angry / awkward / happy / sad / surprise | ≈232 | ≈336 |
| 岑霜 | p_qh_censhuang_story_hd_20261017 | angry / happy / sad / surprise / tease | ≈200 | ≈300 |
| 宋先生 | p_qh_song_story_hd_20261017 | firm / worry | ≈212 | ≈325 |

表情文件名为 `p_qh_<人物>_story_<表情>_hd_20261017.webp`，共 21 张，均 960×1280 RGBA，底边衣服自然裁切到画布底，左右不截断。

## 说明

- 沈雁回高马尾很高，要让发顶留在画布内，眼线只能放在 ≈240（略低于 190～230 的目标）。
- 姿势沿用新本体：旧差分里换姿势（举棍、看纸条、拿扇等）的版本没有照搬，差分只换表情。
- 尚未接入 js/html，由主会话接线。

## 第二批：第一章其余对话立绘（主会话接线）

用户要求“所有人的对话立绘也按同样方法重画”。

- 新画 33 张，做法见 `2026-10-17-portrait-hd-hero.md`（主角村装 6 张、现代装 7 张）和 `2026-10-17-portrait-hd-cast.md`（叶蘅 8 张，周砚、陆衡、程铎、乌魁各 3 张）。
- 接线：
  - `js/production-assets.js` 与登记表 `docs/assets/production-assets.json`、`.md` 里，这 33 个立绘名改为指向 `_hd_20261017` 文件。对话、战斗行动条头像、行记等用到的地方都换成了新图。
  - `js/dialogue-stage.js` 的取景数值按新图重新量过。现在第一章所有立绘的缩放系数都在 0.9～1 之间，不再放大原图。
- 岑霜在没有指定立绘的对话里原来会用旧版 `opening_censhuang`；`js/qihe-characters.js` 改为统一用 `qh_censhuang_story`。
- 第一章有立绘的人物至此全部换成高清版，共 54 张，发布用文件合计约 13MB（有损 webp，质量 92）。
- 周婶、陈伯、店家、药商等村民和路人原本没有大立绘，本轮未新画。
- 验证：
  - 浏览器里看过开场主角与叶蘅、村装主角与徐令仪同框；战斗行动条上主角头像裁得正常。
  - 素材检查通过（1107 项）；`verify_prologue` 7 项、`verify_chapter`、`verify_expansion` 75、`verify_startup` 10、`verify_household` 33 都通过。
- 发布：2026-10-17 已发布到 Cloudflare Pages：主地址 https://luotuo-36x.pages.dev/ ，预览地址 https://qihe.luotuo-36x.pages.dev/ 。用 curl 核对过：线上的立绘映射已指向高清文件。
