# 2026-10-10 把前两天的测试方法标记为不启用

## 用户需求与已确认方案

- 起因：今天另一个会话给新城市出场景图时，把 `art_sources/scene-pixel-central-20261009`（90 格 Q 版扁平像素试点）当成了画风参考。用户纠正：那是测试用的，正式版有自己的生成流程，要区分清楚。
- 用户要求：把前两天测试的这些方法标记为“不启用／弃用”，避免后面的测试或开发再犯同样的错。
- 范围约定：只做标记，不删除、不移动、不重命名；不改 `assets/`、`js/`、`index.html`、`production-assets.*`；拿不准是否已采用的不标弃用，列入“待用户确认”。

## 工作区、运行入口

- 工作区：xiaojianghu-legacy-prologue / 8792。`python3 scripts/serve-current.py --check` 通过（runtime_id `qihe-current`，map_id `m_qh_central`）。
- 本轮只改文档与批次说明，没有运行或素材改动。

## 核对的文档与判断依据

- `AGENTS.md`、`docs/update-workflow.md`、`docs/design/README.md`、`docs/assets/README.md`、`docs/assets/production-assets.md` 与 `.json`、`docs/design/runtime-entry.md`、`docs/design/qihe-map/hero-blue-adoption.md`、`docs/design/qihe-map/npc-pixel-refresh.md`；文档库的 `docs/ai-onboarding.md`、`docs/design/map-development-standard.md`、`docs/design/map-document-status.json`。
- 逐批次核对三件事：批次自己的 README／`adopt.json` 和对应更新记录里的状态字样；是否出现在 `production-assets.json`；是否被 `js/`、`index.html` 引用。结果见[弃用／不启用的测试方法清单](../assets/deprecated-tests.md)。
- 已采用、未列入清单的对照项：`qihe-modular-*-20261007`（模块化地图）、`hero-motion-unified-blue-20261010` 与 `hero-blue-formal-20261010`（正式蓝灰主角）、`qihe-npc-refresh-20261010`（NPC 重制）、`qihe-journal-codex-20261010`（行记图鉴）等，均登记在正式清单或被默认入口代码引用。

## 实际修改

新增：

- `docs/assets/deprecated-tests.md`：弃用／不启用的测试方法清单（判断规则、正式依据、场景／人物／界面三张表、待用户确认表）。
- `art_sources/character-story-redraw-20261007/DEPRECATED.md`、`art_sources/character-story-pixel-20261008/DEPRECATED.md`、`art_sources/hero-pixel-rig90-20261009/DEPRECATED.md`（这三个批次原先没有 README）。
- 本记录。

页首追加状态说明（原有内容原样保留在下方）：

- 批次 README：`scene-pixel-pilot-20261009`、`scene-pixel-backhill-full-20261009`、`scene-pixel-central-20261009`（另加 `SPEC.md`）、`character-pixel-style-pilot-20261008`、`hero-long-pixel-20261008`、`hero-pixel-24f-20261008`、`pixel-mannequin-20261009`、`hero-pixel-anim90-20261009`、`hero-pixel-inpaint-20261009`、`cast-pixel90-20261009`、`chapter1-hero-pose-preview-20261010`、`qihe-quest-journal-refresh-20261010`。
- 更新记录：`2026-10-08-pixel-style-walk-run-test.md`、`2026-10-08-hero-rig-demo.md`、`2026-10-09-scene-pixel-pilot.md`、`2026-10-09-backhill-pixel-full.md`、`2026-10-09-backhill-camera-follow-preview.md`、`2026-10-09-central-pixel-review.md`、`2026-10-10-quest-journal-preview.md`、`2026-10-10-hero-battle-pose-preview.md`。

入口提示：

- `AGENTS.md`、`docs/assets/README.md`、`docs/design/README.md` 各加一处指向清单的提示。
- 文档库 `xiaojianghu/docs/ai-onboarding.md`：第 4 节“生图、素材处理”一行和第 10 节“常见误区”各加一处。

没有改动：`assets/`、`js/`、`index.html`、`production-assets.json/.md/.js`、`2026-10-07-ch1-modular-adoption.md`、`map-development-standard.md`；`xiaojianghu/art_sources/hangao_city_spaces_20261010/` 与 `xiaojianghu/docs/design/hangao-*.md` 未触碰。没有删除、移动或重命名任何文件。

## 采用、替换、弃用

- 标为“测试批次，未采用，不启用”共 15 个批次，全部依据批次自身记录、更新记录、正式清单与代码引用，明细与原因见清单。
- 没有新增、替换或撤回任何正式素材；正式清单不变。
- 没有标弃用、列入“待用户确认”的：90 格／每格 2 屏幕像素规格本身；`hero-pixel-design-20261009`；蓝灰主角的前序候选（`hero-run-blue-20261009`、`hero-run-blue-small-20261009`、`hero-walk-blue-20261010`、`hero-run-initial-blue-20261010`、`hero-run-initial-reference-20261010`）；`character-distinction-20261009`；`chapter1-hero-staff-grip-preview-20261010`；`?pixel90=backhill` 显式预览代码是否保留。各自拿不准的原因写在清单里。
- 文档库 `map-document-status.json` 没有同步：它登记的是 xiaojianghu 自己的地图文档，`tools_scene/check_map_documentation.py` 要求每条都有 `<!-- map-standard: … -->` 标记、非现行条目要有归档副本；本轮标记的都是本工作区的素材批次，套不进这个格式，也没有发现文档库里有地图文档把这些测试写成现行方案。

## 验证结果与证据

- `python3 tools_assets/check_production.py`：改动前后各跑一次，结果都是 `{"status": "pass", "assets_checked": 875, "errors": []}`。
- `python3 scripts/serve-current.py --check`：通过。
- 文档库 `python3 tools_scene/check_map_documentation.py`：22 份文档、5 份归档，`errors: []`。
- 用脚本核对了清单和 26 个被改文件页首的相对链接，没有断链。
- 没有运行或素材改动，所以没有做浏览器验收；上面的检查只说明正式登记和文档路由没被破坏，不代表任何美术验收。

## 未完成项

- “待用户确认”表里的 6 项需要用户给结论，尤其是 90 格规格本身是否作废。
- `?pixel90=backhill` 预览入口仍在运行代码里（本轮按约束不动）。
- 清单只覆盖 2026-10-07 至 10-10 这段时间的测试批次；更早的候选、历史批次没有重新清点。

## 状态

本地完成；未 Git 提交；未线上发布。
