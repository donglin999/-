# 2026-10-21 培养 Q 版剧场：人物朝向整改（朝左立绘入库与接入）

状态：现行　最后核对：2026-10-21

**需求**（用户）：知古一家试点图“其实这个问题不大，按照需要去重新生成就完事了，最主要是先完成这部分剧情”；“对，直接采用接入，然后把另外五位也出图，一定要注意比例大小，不要出现素材大小不一的问题，不要一批一批生成，不好把控，多个请求去生成，然后完成现有剧情的整改”。

## 改动

1. **出图**
   - 知古一家 15 张（`art_sources/facing-left-pilot-20261020/`）：`run.command` 没有执行权限，之前没有跑起来；改为在用户终端执行，全部成功。
   - 另外五位 28 张（`art_sources/facing-left-cast-20261021/`）：周砚、殷红缨各 8 档，莫松年、孟知微、照川来客各 4 档。每张一个独立请求，28 个同时发出，全部第 1 次成功。
   - 生图源为登记表当前源 302ai-sunburst，带 `--opaque-fix`；提示词请求 gpt-image-2.5（R-生图-01～04）。
2. **入库**（R-素材-01）：43 张以新文件名入库，旧图不覆盖：
   - 42 张单人朝左版放在 `household-v1/*_left.png`；
   - 朝左双人图为 `neighbors-v1/duo_gn_lamp_father_left.png`；
   - 都登记在 `production-assets.json/.md`。PNG 不进运行映射。
   - 入库脚本：`art_sources/facing-left-pilot-20261020/adopt.py`。
3. **运行时**（`js/qh-mode-cultivation-story.js`）：
   - 新增 `LEFT_READY`，包括知古、裴述、周砚、殷红缨、莫松年、孟知微、照川来客。
   - 多人镜头里，这些人站最右位时，当前表情档换用 `_left` 版，并带 `data-facing="left"`。
   - 头像栏和单人镜头不换图。
4. **大小统一**（`tools_scene/qihe/build_actor_layout.py`）：
   - 朝左版逐张量脸，单独生成 `[data-mood][data-facing="left"]` 站位，共 42 张、84 条规则。规则仍是脸一样高、脸线对齐。原有规则一条没变。
   - 需要人工给锚点的几张写在 `LEFT_FACES`：
     - 殷红缨的生气、严肃、惊讶：原图是全身远景，朝左版是半身；
     - 莫松年惊讶：自动量脸量到了地图上；
     - 知古 7 档：眼镜和胸口肤色让自动量脸失败。逐张叠线核对过与原档脸框一致，所以沿用原档的人工锚点。
   - “下缘够不到底栏”检查为空。
5. **双人图站位补回**：上一轮第四轮的 `DUO_FACES` 和对应 CSS 在本地不存在，只有剧情数据和 `render()` 带了 `duoCast`，“躲在父亲身后”占一个站位时没有站位规则。
   - 这次在脚本里补回 `DUO_FACES`，锚点用朝左双人图里裴述的脸（y 0.136～0.303，人工核对）。
   - 剧情源 `chapter-two-dialogue.json` 里这 3 句的 `duo` 换成朝左版，重编了 `js/qh-pre-hangao-data.js`，台词没有改动。
6. **登记与检查**：
   - `cultivation-actor-facing.json` 补登朝左双人图，说明里写明 `LEFT_READY` 的作用。
   - `check_facing.cjs` 把站右位、且有朝左版的人算作朝左。
7. **评审入口**：`js/qihe-cultivation-scene-review.js` 增加 `&phase=`，可以进到某旬的剧情，例如 `gy_zhou_test` 要 `month=4&phase=3`。这个脚本本来就登记在 `REVIEW_SCRIPTS`，不进发布包。
8. **缓存版本**：
   - `qh-mode-cultivation-story.js`、`qh-mode-cultivation-actors.css`、`qh-pre-hangao-data.js`：`?v=20261021-facing1`
   - 评审脚本：`?v=20261021-r2`
9. **文档**：
   - `xiaojianghu/docs/design/dialogue-staging.md`「人物朝向」补了朝左版的接法和大小规则；
   - `docs/design/qihe-map/expansion/guiyun-household.md` 的立绘站位一条补了 `LEFT_FACES`、`DUO_FACES`；
   - 两个批次的 README 都已更新。

## 验证

- `node tools_scene/qihe/check_facing.cjs`：进城前 24 场的多人台词共 305 句，背对的从 157 句降到 **0 句**，退出码 0。
- 7 个人所有表情档的朝左文件都存在（node 逐档拼路径检查：42 档，缺 0）。
- `python3 tools_assets/check_production.py`：pass。
- `tests/pre-hangao-runtime.test.cjs`：8/8 通过。
- `tests/guiyun-performance.test.cjs` 第 37 行、`tests/cultivation-rework.test.cjs` 的 `gy_m04-intro-01-c694a7`：仍然失败，失败点与改动前相同。
- **本机 8792 实机**（内置浏览器，1280×720，`?uiReview=1&cultivationScene=…`）：
  - `gn_lamp` 两条分支逐句走完，裴述、知古站右位都换成朝左版，双人图也是朝左版，萧白在左位，两边脸高一致；
  - `gy_zhou_test`（`month=4&phase=3`）中周砚朝左。
  - `hg_gate`、`gy_m08` 有前置条件，评审存档进不去。所以在同一个游戏页面里，用正式 `render()` 把殷红缨放到右位检查。
  - 42 张朝左版全部按 CSS 数值离线拼出总览，确认脸都落在统一的脸框带里，并和游戏截图对照过位置一致。
  - 证据在 `evidence/2026-10-21-facing-left/`。

## 未做与待拍板

- 知古朝左版的木笔、发带换到了头的另一侧（用户：问题不大，需要时再重出）。
- 双人扶梯图取景偏远的问题仍然存在（试样素材，定稿时再定）。
- `hg_gate`、`hg_road`、`gy_m08` 等有前置条件的场次，没有从头按正常流程玩到；这些场次是用同一套 `render()` 和站位规则验证的。

**提交／发布**：本地完成；未提交 git（R-git-01）；未发布（R-发布-01）。
