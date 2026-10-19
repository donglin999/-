# 2026-10-08 旧素材与旧文档清理

## 需求

用户反馈旧素材、旧文档严重干扰开发，要求素材瘦身并删除旧文档，同时打开游戏验证，防止误删。

## 改动

- 待删内容**未直接删除**，统一移到工作区外的 `../_attic/2026-10-08/`（共 79 项、407M）。逐项来源见该目录 `manifest.json`，一键还原脚本为 `restore.sh`。
- 本目录移出：
  - 34 个素材批次（`art_sources/`、`review/`）。移出条件：在两个工作区的代码、脚本、测试、文档、JSON 中均无引用，且 24 小时内没有改动。
  - 根目录零散文件：5 个 `gen*.log`、`faces.png`，以及上级目录的 `xiaojianghu_20260929.zip`。
  - 16 篇已被取代或一次性的文档：OC.3～OC.10 开篇合同与验收、`cultivation-mail-v7`、`chapter1-acceptance`、`prologue-cg-audit`、`prologue-water-acceptance`、`character-walk-audit`、`cultivation-rig-trial`、`prologue-village-layout-v3`。
- 剩余文档中指向已删文档的链接改为纯文字并注明“（已删除）”；索引页中只指向已删文档的条目整行去掉。
- 生图通道说明：`ai-onboarding.md` 和 `art-pipeline.md` 不再写 codex MCP，改为 `codex exec`（与根目录 CLAUDE.md 一致）。

## 有意保留

- `battle-v2.md` 和 `battle-v3.md`：战斗代码注释指定的规格文档。
- `raw_*`：生成脚本引用。`dist`：DEPLOY 和脚本引用。
- 根目录截图 `round*.png` 等：`testing.md` 引用。
- 下列文档在 24 小时内有改动或仍有引用，均未动：`female-visual-v3/v4`（`build_atlas.py` 读取）、`prologue-deferred-opening`（用户要求保存旧稿）、`combat-av-review`（保留作整改对照）、`v4-vfx-batch1`（评审中）。

## 验证

| 检查 | 改动前 | 改动后 |
| --- | --- | --- |
| 栖河 `check_production.py` | pass（624） | pass（624） |
| 两边运行时代码静态引用缺失 | 栖河 6、本目录 3（原有） | 不变 |
| 栖河 `tests/*.test.cjs` | 3 个通过，8 个原有失败（缺 Playwright 模块 / 原有断言） | 逐个一致 |
| `tests/document-library.test.py` | OK | OK |
| `check_map_documentation.py` | 无错误 | 无错误 |
| 浏览器 8792 | 标题页正常 | 标题页 → 新游戏 → 栖河开场对白正常，0 个失败请求，无控制台错误 |
| 指向已删文档的残留链接 | — | 0 |

## 未完成

- `.mcp.json` 仍配有已失效的 codex `mcp-server`，未改动，需用户决定。
- 本目录 `review/`（约 5G）大多仍被旧评审文档或更新记录引用，本轮没有动。
- 未提交，未发布。用户确认游戏无误后，可清空 `_attic/2026-10-08`。

## 第二轮（同日）：按“旧素材与被否定剧情不复用”原则由 Claude 代为决策

用户看了逐条勾选页后表示条目太多，要求 Claude 按原则直接决定：旧素材、被丢弃的素材和剧情一律不复用。

- 判定规则：只保留硬依赖，删除其余。硬依赖包括：
  - 栖河的正式登记和运行时代码；
  - 测试读取的文件；
  - 栖河代码或脚本引用的内容；
  - 主库运行时、评审页、生成或校验脚本，以及**保留文件内结构化数据**（JSON、JS、HTML、PY）引用的内容；
  - 战斗代码指定的规格文档；
  - 地图文档检查要读的文档；
  - 24 小时内有改动的内容。
- 第二轮移出 14 篇文档：剑法旧评审、`legacy-skill-gallery`、`prologue-deferred-opening`、`combat-av-review`、功法 V2 推演，以及栖河的 `jianghu-ui.md`、`ui-preview.md`、`qihe-map/pipeline.md`、`verification.md` 等。另移出一批被否定的素材，包括：
  - 第一章村落的大部分评审图（`review/chapter1` 中未被依赖的部分）；
  - 中央图落选稿（10-05 HD、两轮细节稿）；
  - 江湖界面 V7～V10 预览；
  - 栖河 BGM v1～v3 和养成 BGM v1～v3；
  - 主库根目录的 `dist/`、`outputs/`、`fx/` 和旧截图。
- 第一次移动后，检查发现保留文件仍在引用其中部分批次：书阁人物图谱用到裴之顾表情图，养成重绘页读 `cultivation_action_loop` 的提示词，测试间接读 `cultivation_q`，`assets/cultivation/manifest.json` 记录了多个养成来源。按上面的规则循环恢复，直到没有新增依赖为止。
- `.mcp.json` 去掉了已失效的 codex `mcp-server` 配置，原文件备份为 `_attic/2026-10-08/mcp.json.bak`。
- `_attic/2026-10-08` 最终约 1.4G，共 303 项；`restore.sh` 可一键还原（包括 `.mcp.json`）。

第二轮验证：

| 检查 | 结果 |
| --- | --- |
| 栖河 `check_production.py` | pass（624） |
| 两边运行时代码静态引用 | 没有新增缺失（主库多出的一条是另一会话新脚本里的模板字符串 `assets/ui/{sub}/{k}.webp`） |
| 栖河 11 个 node 测试 | 与基线逐个一致 |
| 主库全部测试 | 32 个失败，没有一个出现缺文件、404 或已移走路径；原因都是缺 Playwright 模块、浏览器超时或断言本身不通过 |
| 书阁测试 | OK |
| 地图文档检查 | 无错误 |
| 8792 浏览器 | 标题页 → 新游戏 → 开场对白正常，0 个失败请求，无控制台错误 |

保守之处：仍有许多旧批次被旧的生成脚本或校验脚本（`tools_scene/verify_*`、`build_chapter1_v2.py` 等）引用，所以保留了下来。要进一步瘦身，需要连同这些旧脚本一起清理。
