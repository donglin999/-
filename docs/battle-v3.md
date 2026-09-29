# 战斗表现 v3：武侠化 + 我方独立战斗形象 + 「破势」

在 v2（`docs/battle-v2.md`）基础上的第二轮评审改造。战斗**规则与数值不改**，只改表现与素材。

## 0. 评审结论（为什么改）

1. **我方战斗形象糊**：主因是没有独立战斗素材——`b_hero/b_suzhi` 由 44×22 美术像素的探索小人变形而来（源图本身是 AI 图平均降采样，色块软、无干净线条），而敌人是专门生成的 55–110 像素写实精灵；次因是显示倍率非整数（每美术像素 ≈3.5–3.75 画布像素，像素宽窄不一）。浏览器缩放不是原因（画布已 `image-rendering: pixelated`）。
2. **面板头像糊**：把高清国画立绘裁脸后压成 44px 像素风，是处理方式错误。立绘不是像素风，应平滑缩小。
3. **UI 太方正**：v2 是标准像素 UI（直角框、网格、像素数字），缺武侠气质。
4. **「BREAK」**：改为中文**「破势」**（已全局替换 battle.js 中的「破防」文字；bui.js / bfx.js 中的由对应工作流替换）。
5. **敌方 UI 偏大**：2× 盾牌 + 4–5 个 2× 弱点图标，比小怪还宽。

## 1. 三套角色素材规格

| 素材 | 画风 | 规格 | 用途 | 文件 |
|---|---|---|---|---|
| 日常形象 | 像素 Q 版 | ~47 像素高，4 方向行走 | 地图 | `s_{c}(_bright).webp` 等 |
| 对话立绘 | 国画白描淡彩 | 1024×1536 原图 → ≤480×640 | 对话、面板头像（**平滑缩小，不像素化**）；男女主各 6 张表情差分 | `p_{c}(_{表情}).webp` |
| 战斗形象 | 像素、写实比例、侧身 | 我方约 64 美术像素高；敌方按档位；**整数 3× 显示** | 战斗动作 | `b_{c}.webp` + `js/bart.js` |

## 2. 文件归属（每个文件只由一个工作流修改）

加载顺序：`battle.js → vfx.js → bart.js → bstage.js → bui.js → bfx.js → bposhi.js → main.js`

| 工作流 | 负责文件 | 说明 |
|---|---|---|
| **E 我方战斗形象** | `js/bart.js`、`tools_fx/`（除 `bt_smoke.cjs`、`ui_*`、`poshi_*` 外）、`assets/b_*.webp`、`raw_battle/E/`、`docs/battle-sprite-spec.md` | 重做 b_hero / b_suzhi；所有 BART 的 `h` 改为整数倍 |
| **F 破势演出** | `js/bposhi.js`、`js/bfx.js`（仅破势相关部分及其中的 BREAK/破防 文字）、`tools_fx/poshi_*.py`、`assets/fx_poshi*.webp`、`raw_battle/F/` | 书法大字「破势」横幅、敌人破势状态小印 |
| **G 武侠化 UI** | `js/bui.js`、`tools_fx/ui_*.py`、`assets/ui_*.webp` | 墨迹/印章/卷轴风格重做；头像平滑缩小；敌方 UI 收缩 |

禁改：`battle.js core.js ui.js scene.js story.js main.js index.html bstage.js vfx.js` 及他人文件。需要时写进最终报告由总控合并。

## 3. 接口

- `BART`（E）：格式同 v2 §2.1；**`h` 必须等于 单元美术像素高 × 整数倍率**（我方与敌方统一用 3，即 `h = cell[1]`，cell 已是 3× 像素）。A 的 `unitH` 直接用 `h`（再乘纵深 `dscale`，C 的 drawUnit 已关闭平滑）。
- `POSHI`（F 实现，G/C 调用）：
  ```js
  window.POSHI = {
    banner(u),        // 破势大横幅演出（替代 BUI.breakBanner；F 同时把 BUI.breakBanner 指向它）
    seal(size)        // 返回「破」字朱印小图（canvas/Image），G 用于敌人破势状态、行动顺序条
  }
  ```
  G 在 `POSHI` 不存在时用自己的回退。
- 字体：G 负责引入毛笔字体（用 JS 注入 Google Fonts `<link>` 或 `FontFace`，如 Ma Shan Zheng / Zhi Mang Xing / Liu Jian Mao Cao），F 若需要字体渲染素材在 Python 端自行下载 TTF 到 `raw_battle/F/` 使用。

## 4. 约束与验证

- 生图：`tools_por/.env` 的 FlatRouter，`gpt-image-2.5-sunburst`，**每个工作流同时最多 1 个请求**；接口慢且会断连（40 秒到 20 分钟），要重试并串行。原图与 params.json 存各自 `raw_battle/<工作流>/`。
- 验证：`node --check`；`node tools_fx/bt_smoke.cjs review/battle_v3/<工作流>/<名字> <ms> <间隔> <bandits|boss|slow|break>`（break 模式每次满蓄势并强制破势，覆盖破势/死亡/胜利），`errors: []` 且打到 `result:"win"`；Read 截图迭代观感。整文件写入，避免半截状态影响他人测试。
