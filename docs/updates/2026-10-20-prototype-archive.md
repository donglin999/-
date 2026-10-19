# 旧原型整体归档（2026-10-20）

状态：现行　最后核对：2026-10-20

## 需求

用户 2026-10-20：“旧原型整体归档”。“旧原型”指本工作区里能单独运行、构建的旧游戏原型（含已作废的襄阳演示）。文档库本身（`docs/`、`bible/`、现行工具与测试）保留并继续可用。按 R-清理-01 移入 `_attic/2026-10-20-prototype/`（附 `manifest.json`、`restore.sh`），不删除；按 R-工作区-01 只动本工作区（`xiaojianghu-legacy-prologue` 未改）；按 R-git-01 未提交。

## 判定口径

1. 读写原型 `js/`、`assets/`、入口页（`index.html` 等）、根目录一次性脚本或 `raw_*` 的工具与测试，算原型自己的工具，随原型归档；依赖这类脚本的脚本一并归档（传递依赖）。打开原型页面（`#cultivation`、`#xiangyang`、`/?icons=` 等）的浏览器测试也归档。
2. `tools_docs/` 全部是现行文档工具，保留。它们读写的 `js/`、`assets/` 文件算**硬依赖**，原地保留（改动最小：不必改工具、`catalog.json` 路径与哈希、人物图谱路径），并在 `js/README.md`、`assets/README.md` 写明原因。
3. 不读写原型的工具与数据保留原位（`tools_scene/`、`tools_fx/`、`tools_bright/` 里剩下的辅助脚本照旧可用）。

## 归档了什么

共 751 项、3186 个文件、约 1155 MB，全部在 `_attic/2026-10-20-prototype/xiaojianghu/`，保持原相对路径：

| 类别 | 项数 | 文件 | 体积 |
| --- | --- | --- | --- |
| 根目录：`index.html`、`cultivation-minigames.html`、`village-4k-trial.html`、`export.py`、`icons.py`、`pack.py`、`pixmaps.py`、`portrait.py`、`process.py`、`process_walk.py`、`process_walk_r1.py`、`split.py`、`street_layers.py`、`j_*.json`、`jobs_*.json`、`framemap.json`、`raw_*`（5 个目录）、`tmp/`、`screenshot.png`、`scripts/`（`build-pages.cjs`，`--prototype` 构建）、`tools/`（开篇人物素材管线） | 31 | 957 | 663.5 MB |
| `assets/` 运行素材（除下列硬依赖） | 383 | 1878 | 486.4 MB |
| `js/` 运行代码（除下列硬依赖） | 100 | 114 | 3.8 MB |
| `tests/` 原型测试 | 95 | 95 | 0.6 MB |
| `tools_scene/` 66、`tools_fx/` 43、`tools_story/` 15、`tools_bright/` 8、`tools_audio/` 7、`tools_por/` 3 | 142 | 142 | 1.1 MB |

逐项路径、大小、理由见 `_attic/2026-10-20-prototype/manifest.json`。一键还原：`sh _attic/2026-10-20-prototype/restore.sh`（移回全部文件，并用 `edited-backup/` 恢复本次改过的文档）。没有 `css/` 目录。

## 保留的硬依赖

| 位置 | 理由 |
| --- | --- |
| `js/martial-move-model.js` | `tests/martial-moves-v3.test.cjs` 直接加载 |
| `js/` 下九个武学、装备生成文件（`martial-moves-runtime`、`martial-hearts-runtime`、`martial-external-data`、`equipment-runtime`、`martial-manual-sources`、`martial-move-icons`、`martial-heart-icons`、`martial-manual-icons`、`equipment-icons`） | `tools_docs/build_*`、`pack_*` 写入；`build_armor_acc.py` 读 `equipment-runtime.js` 合并，`pack_martial_icons_v4.py` 读图标表。目录不在时这些工具会出错 |
| `js/chapter1-data.js` | `tools_audio/sync_voice_catalog.py` 从这里读开篇台词 |
| `assets/ui/martial-moves-v3/` | `docs/design/martial-review/catalog.json` 登记的 64 张正式图标，测试核对哈希，武学图鉴页显示 |
| `assets/ui/martial-moves-v4/`、`martial-hearts-v4/`、`equipment-v1/`、`manuals-v1/` | 上述保留工具的输出，与保留的图标表对应 |
| `assets/p_menu_{hero,ye,suzhi}_v1.webp` | 人物图谱 `story-atlas.json`、立绘规范页引用 |
| `assets/audio/voice_pick/` | 语音后台的试听库（不入 git） |
| `tools_audio/voice_server.py`、`gen_voice_pick.py`、`sync_voice_catalog.py`、`voice_lines.json`，`tests/voice-backend.test.py` | 语音后台是现行工具（[角色语音管理后台](../design/voice-backend.md)）；它的试听库在 `assets/audio/voice_pick/` 下，所以文本检索把它误判成了原型工具，已改回原位 |
| `tools_scene/xiangyang_icons_v3_manifest.json` | 数据文件，有文档链接；按同样理由改回原位 |
| `tools_por/.env` | 密钥文件，原地不动（R-生图-03）；目录里其余两个原型脚本已归档 |

本目录保留的测试：`martial-moves-v3`、`combat-sim`、`calendar_schedule_test`、`document-library`、`document-library-browser`、`voice-backend`、`voice-admin`、`hangao-town-core`、`map-preflight`、`map-review`、`concept-layout`、`chapter1-walls`、`side-run-arms`、`prologue-review-driver`。

## 文档改动

- `DEPLOY.md`：取消 `--prototype` 构建，说明本目录没有构建命令，栖河发布引用 R-发布-01。
- `AGENTS.md`（本目录与上层）、`docs/ai-onboarding.md`（工作区表、权威规则、代码速览、测试、发布）、`docs/README.md`（入口、本地运行、目录结构）、`docs/design/local-game-entry.md`、`docs/testing.md`：去掉“历史原型须显式 `runtimePrototype=1`”“本地 8766 运行原型”等说法，改为已归档。
- 死链按 check_docs 规则改成纯文字，注明“已随旧原型移入 _attic，不作参考”：`docs/particle-fx.md`、`docs/design/` 下的 `character-asset-quality`、`character-walk-quality`、`cultivation-activities`、`cultivation-assets`、`skill-polish`、`sword-vfx-xianxia`。
- `.gitignore`：删去 `dist-prototype/`。
- 新增 `js/README.md`、`assets/README.md`。
- `docs/updates`、`docs/archive`、`art_sources`、`review` 是历史记录，没有改动；其中链接或页面引用的旧原型文件现在打不开，不作参考。

## 验证（归档前基线 → 归档后）

| 检查 | 基线 | 归档后 |
| --- | --- | --- |
| `python3 tools_docs/check_docs.py` | 过时说法 0、死链 0、缺状态 0 | 同上 |
| `python3 tools_docs/consistency_check.py --out <临时目录>` | 通过，26 条提示 | 结果完全相同 |
| `python3 tools_story/build_atlas.py --check` | failures 为空，写入 0 | 输出完全相同 |
| `node tests/martial-moves-v3.test.cjs` | 4 通过 | 4 通过 |
| `node --test tests/combat-sim.test.cjs` | 6 通过 | 6 通过 |
| `calendar_schedule_test`、`document-library`、`map-preflight`、`map-review`、`concept-layout`、`chapter1-walls` | 全部通过 | 全部通过 |
| `hangao-town-core`、`prologue-review-driver`、`side-run-arms` | 16、4、1 通过 | 相同 |
| `document-library-browser`、`voice-admin` | 失败：本机缺 Playwright／Chromium | 同样原因失败 |
| `tests/voice-backend.test.py` | 归档前没单独跑 | 39 项中 38 通过；失败的一项只比较 `voice_lines.json` 与 `story-atlas.json` 的同伴名单（图谱多了 `yin-hongying`），两份文件内容未动，属于原有的数据不一致，与归档无关；`sync_voice_catalog.py --check` 也因缺 `yin-hongying` 的音色资料报错 |
| `python3 tools_docs/story_lint.py --out <临时目录>` | — | 正常完成（需处理 14、提示 204，都是剧情文案提示） |
| 栖河 `node tools_story/build_ink.cjs`（只读运行） | pass，41 段剧本 | pass，结果相同 |

## 未完成与需主会话处理

- **栖河有两处读本目录原型文件**（本次按要求没改那边）：`tools_scene/qihe/verify_runtime_entry.cjs` 读 `../xiaojianghu/js/local-game-entry.js`、`js/main.js`、`index.html`，`scripts/sync-runtime-entry.py` 写、查 `../xiaojianghu/js/local-game-entry.js`。归档后这两个入口守卫脚本跑本目录这一侧会失败；本目录已没有游戏页面，需要守卫的对象也没了，应在栖河那边删掉本目录这一侧的检查。栖河发布构建不调用这两个脚本。
- 栖河 `docs/assets/production-assets.json` 里 99 条 `source_workspace` 指向 `xiaojianghu/assets/cultivation/…`（素材来源记录），原件现在在 `_attic/2026-10-20-prototype/xiaojianghu/assets/cultivation/`。栖河的素材检查不读这个字段。
- 规则 R-工作区-01 正文仍写“xiaojianghu（文档库、设计权威、养成与旧原型）”。改规则须用户批准（R-文档-02），本次没动。
- `js/` 里保留的武学运行时生成文件已经没有运行时使用者。若以后把 `tools_docs` 里的生成脚本改成不再输出运行时数据，`js/` 可以整体归档。
- `tools_docs/server.py` 的放行名单里还有 `index.html`、`cultivation-minigames.html`，现在这些文件不存在，访问会得到 404，不影响使用。
- `review/` 下不少历史评审页引用旧原型的 `assets/`、`js/`，现在会缺图；它们是历史记录，没有改。
