# 2026-10-20 培养进城前剧情排查（文档库侧记录）

状态：现行　最后核对：2026-10-20

用户原话（2026-10-20）：“同步按照新的规则去重新用 minimax 去排查进城之前的培养阶段的剧情和对话，我感觉还是有很多排查空间的”。

主报告在栖河工作区：[培养部分·进城前剧情排查报告](../../../xiaojianghu-legacy-prologue/docs/updates/2026-10-20-pre-city-story-audit.md)。范围 58 项、约 790 句，用 MiniMax 逐场与整条线路审读，加冷读子代理，人工复核后列出必须改 10 条、应该改 29 条、待拍板 4 项、工具问题 4 项。

## 与本目录相关的部分

- `tools_docs/story_lint.py` 经栖河的 `dump_story_lines.cjs` 读培养剧情，读的是文档版。被进城前完善版（`docs/design/scripts/chapter-two-dialogue.json` 的 preHangao 生成的 `qh-pre-hangao-data.js`）接管的 24 场，播出的 253 句从没进过自动检查。建议修导出（主报告 T-1），属工具修改，待用户同意。
- 进城前完善版的台词要改源 JSON `docs/design/scripts/chapter-two-dialogue.json`，不能直接改栖河的生成文件（T-3）。
- 反例库 `docs/design/story-ai-patterns.md` 末尾追加了“2026-10-20 培养进城前排查查出”一节。

## 改了什么

只新增本记录、栖河的排查报告，以及反例库的一节。没有改剧本、数据、工具和规则。未提交 git，未发布。

## 验证

- `story_lint --scene`（46 场＋闲逛）：需处理 0，提示 38；对实际播出台词套同一规则：需处理 3（信件被当旁白，见主报告 T-2）。
- `consistency_check`：警告 0。
- `check_docs.py`：通过（过时说法 0、死链 0、缺状态 0）。

## 待拍板

见主报告第六节（汉皋作废引子怎么处理、删场与合并、书信对象、两版并存），以及第四节 A 类要不要先改。

## 后续（同日）

用户答复“按清单开始改吧”。返工改了本目录的 `docs/design/scripts/chapter-two-dialogue.json`（preHangao、lines 底稿、correspondence）和 `pre-xiangyang.json`（L-02、Y-03、M-04、M-05、Z-03），新增戏眼卡 `docs/design/scripts/briefs/pre-city-rework-actors-brief.json`，以及 Q 版表情登记 [培养 Q 版表情：进城前缺口与补做建议](../design/cultivation-q-expression-needs.md)。详见栖河工作区的[返工记录](../../../xiaojianghu-legacy-prologue/docs/updates/2026-10-20-pre-city-story-rework.md)。
