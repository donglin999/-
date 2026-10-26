# 2026-10-21 改动清单 changelist.md 与规则 R-文档-03

状态：现行　最后核对：2026-10-21

## 需求（用户原话）

“还是再加一个 changelist.md，不然我的别的 agent 接手工作不知道你做了什么，同理，你也不知道别人做了什么，编入开发文档和硬性要求和 agent.md”

## 改动

- 新建 [docs/changelist.md](../changelist.md)：两个工作区共用，最新在上。开工前读最近条目和“进行中”；动手时先加“进行中”；完成或交接时改成结果。补登了当天已有的 7 份更新记录（其他 agent 的条目标“补登，原作者未写明”）。
- `docs/rules/rules.json` 新增 R-文档-03，规则正文只在登记表；用户这次的要求即批准，已运行 `--approve-rules`。
- `tools_docs/check_docs.py` 加第 5 项检查：两个工作区 `docs/updates/` 里文件名日期不早于 2026-10-21 的 .md，都要在 changelist.md 里有链接，否则失败。发布构建第一步会跑这个检查。
- 写进流程：
  - 导入引导 `docs/ai-onboarding.md` 第 6 节；
  - 根目录 `AGENTS.md`、`CLAUDE.md`；
  - `xiaojianghu/AGENTS.md`；
  - `xiaojianghu-legacy-prologue/AGENTS.md` 固定步骤。

## 验证

- `python3 xiaojianghu/tools_docs/check_docs.py`：通过（规则 32 条；过时说法 0；死链 0；缺状态 0；未登记的更新记录 0）。补登前先跑过一次，正确报出 8 份未登记，说明检查会生效。
- `check_production.py`：通过。

## 未做

- 2026-10-21 之前的更新记录没有补登，检查从这天起算。

**提交／发布**：本地完成，未提交 git，未发布。
