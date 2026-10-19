# 2026-10-16 废案文档清理

## 需求

用户：“现在有很多废案的，清理一下。”按 2026-10-08 起的原则（旧的、被否定的素材和剧情不再复用，只保留硬依赖）由 Claude 判断去留。

## 移走（15 个文件，放在 `../_attic/2026-10-16/`，`restore.sh` 可一键还原）

| 文件 | 理由 |
| --- | --- |
| `design/hangao-qiyue-hall-development.md` | 栖月楼外堂 V1，页首写明历史记录，已转 V2 |
| `design/hangao-qiyue-spaces-v2.md` | 栖月楼 V2，页首写明历史，空间以 V3/V4 为准 |
| `design/scene-generation-v2.md` | 序章第二版与襄阳迁移的旧生产记录，已标 superseded |
| `design/stitched-map-experience-v1.md` | 拼接 v1 试验，已标 superseded |
| `design/black-wind-fortress.md`、`black-wind-ground-v2.md` | 黑风寨属襄阳测试片段，随 10-08 舍弃 |
| `design/xiangyang-art.md`、`xiangyang-case.md`、`xiangyang-city.md`、`xiangyang-elevation-design.md`、`xiangyang-environment-design.md`、`xiangyang-expansion.md`、`xiangyang-expansion-blockout.svg`、`xiangyang-test.md` | 用户 2026-10-08 要求舍弃襄阳新手村剧情、主城改为汉皋（见 `design/hangao-story.md` 页首）；这些文档无代码、工具或测试引用 |
| `roadmap.md` | 襄阳原型时期的旧路线图 |

同步：`design/map-document-status.json` 去掉已移走的 3 条登记；两个工作区共 91 处指向这些文档的链接改为纯文字并注明“（已删除）”；索引表中只指向已删文档的 5 行去掉（误删的 3 行描述原型代码现状的 README 行已从 git 记录按原位找回）。

## 有意保留

- 栖月楼 V3（`hangao-qiyue-building-v3.md`）：画风被否定，但页首写明挑空、两处后房等功能关系仍可参考。
- 栖月楼两轮剧情审稿（10-14、10-16）：第二稿沿用第一稿待审数值，第一稿未被否定。
- 襄阳 5 篇：`xiangyang-alley.md`（及其提示词、示意图）、`xiangyang-chapter.md`、`xiangyang-art-prompts.md`、`xiangyang-voice.md`、`xiangyang-gathering-review.md`——被原型代码、生成工具或评审页引用；`xiangyang-icons-v3.md` 为已批准的图标画风合同。
- `female-visual-v3/v4.md`（`build_atlas.py` 读取）、`cultivation-action-loops.md`（评审页引用）、`ye-walk-regeneration.md`（已采用，非废案）、`life-skills.md`（暂缓、保留后续评估）、栖河 `bgm-production.md`（含现行 V2 提示词，被生成脚本引用）。
- 页首只交代历史段落的现行文档一律不动。

## 验证

`check_map_documentation.py` 无错误；`tests/document-library.test.py` OK；`consistency_check.py` 需处理 0。游戏代码与素材未改动。

## 状态

本地完成；未提交；未发布。
