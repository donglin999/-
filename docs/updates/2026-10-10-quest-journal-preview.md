> **状态（2026-10-10 标记）：** 本记录对应的任务／人物页整改预览（`art_sources/qihe-quest-journal-refresh-20261010/`）是历史候选，已被用户反馈撤回，未采用；后续以[图鉴整改](../design/qihe-map/expansion/ui-flow/quest-codex-refresh-20261010.md)为准。 不得作为画风、规格或流程的参考；正式依据与替代做法见[弃用／不启用的测试方法清单](../assets/deprecated-tests.md)。

# 2026-10-10 任务／人物行记比例、字体与内容整改预览

## 需求与状态

用户反馈当前任务页比例、字体和内容不合适，要求先设计方案并提供预览图。工作区为 `xiaojianghu-legacy-prologue`，8792身份已用 `scripts/serve-current.py --check` 核验。

**本轮完成独立预览，不采用进正式游戏；未提交Git、未线上发布。**

## 核对与设计

读取文档库AI导入引导、本工作区AGENTS与设计入口、素材README/正式清单、任务V10、V6细线留白、导航合同、交付规则，并核对 `qihe-jianghu-ui.js/css`、`qihe-outsiders.js`、`qihe-menu.js`、`qihe-map-trial.js`、`qihe-prologue-actions.js`、三方人物接入合同。

新设计先记录于[任务V10](../design/qihe-map/expansion/ui-flow/quest-journal-v10.md)及其[本轮候选](../../../_attic/2026-10-18/xiaojianghu-legacy-prologue/docs/design/qihe-map/expansion/ui-flow/quest-journal-refresh-20261010.md)，再建立HTML/CSS预览。

改动：目录约28%、正文约72%；导航居中；正文用正常字距的系统中文字体，宋体用于题头；主线与可选委托分开；三位人物从任务状态分离；每个对象一个地点标记主按钮；删除重复追踪动作与任务页无关的切人、出战提示。保留已确认的淡雅山水与细线，不增加大幅地点／人物插画。

内容以序章固定样例组织：药单已接取，下一步到村内东侧药铺问周婶；只记沈雁回已说的三篓／两篓和用途未分。未核实的第三篓用途与签名不展示；6文是脚本最终奖励、接取时未承诺，未写成约定或已发放。徐与岑的委托未接取，人物只记既有名字、势力、当前位置和可询问事项，不填未问身份与未来剧情。

## 素材与采用

独立候选位于 `art_sources/qihe-quest-journal-refresh-20261010/`。复用正式清单登记的UI背景与徽章，未更改原件；布局、文字和细线直接由代码渲染，未调用生图模型。截图为真实浏览器渲染的设计预览，不作为正式游戏运行证据。

未修改 `index.html`、正式江湖UI、三方对话或 `contactRecords()`。未新增／弃用正式素材，production-assets清单不变；旧版和用户存档保留。

## 验证与证据

- 三种窗口1600×900、1280×720、1920×1080，任务／人物页各1张，共6张截图。检查中文正文字号、列表每条边界、主按钮边界、页面整体溢出；初轮发现1280人物索引被下方说明挤压，取消重复说明并调整间距后再次检查通过。
- 独立预览页分类、三位人物地点和内存标记通过；页面错误0，失败请求0。无玩家存档读取或写入。
- 实际IAB打开人物预览并人工检查1280×720，三位人物名称与地点完整可见，正文、操作和未交谈状态清楚。保留预览标签页供用户查看。
- `python3 tools_assets/check_production.py`：696项通过、错误0。

[任务预览](../../../_attic/2026-10-18/xiaojianghu-legacy-prologue/art_sources/qihe-quest-journal-refresh-20261010/preview/task-journal-1600.png) · [人物预览](../../../_attic/2026-10-18/xiaojianghu-legacy-prologue/art_sources/qihe-quest-journal-refresh-20261010/preview/people-journal-1600.png) · [实际窗口](../../../_attic/2026-10-18/xiaojianghu-legacy-prologue/art_sources/qihe-quest-journal-refresh-20261010/preview/actual-iab-people.png) · [尺寸与检查报告](../../../_attic/2026-10-18/xiaojianghu-legacy-prologue/art_sources/qihe-quest-journal-refresh-20261010/preview/report.json) · [批次说明与入口](../../../_attic/2026-10-18/xiaojianghu-legacy-prologue/art_sources/qihe-quest-journal-refresh-20261010/README.md)

## 未完成项

待用户评审比例、字体、分类与文案。正式接入、存档事件日志与HUD追踪交互的实现及游戏回归尚未进行；不能把候选内存标记宣称为实机导航。岑霜正式页需要继续按实际半日取南村／东埠位置，不固定用样例的南村位置。
