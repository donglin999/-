# 2026-10-23 子任务经路由器分流

状态：现行　最后核对：2026-10-23

## 需求

用户：“这边也需要同样的分流”，也就是照清河（gametry）的做法，小任务经 302 Enterprise 路由器交给 Claude 5.5 子任务去做，以节省主会话的 token。

## 改动

- `tools_por/.env` 加 `ENTERPRISE_API_KEY`（文件仍是 `0600`，git 已忽略；R-生图-03）。
- 新脚本 `tools_common/codex-router.sh`：照搬清河的 `codex-router.sh`。
  - 加了 `-w all|docs|game` 选可写的工作区。
  - 只从 .env 取 `ENTERPRISE_API_KEY` 一行。
  - 日志写到 `luotuozhuan/.router-tasks/`，不进 git。
- 新文档 `docs/router-subtasks.md`：配置、用法、哪些分派哪些不分派、任务说明怎么写、怎么验收、验证记录。
- 规则 R-子任务-02 写进 `rules.json`。依据是用户本轮要求，已 `--approve-rules`，现为 33 条。
- 根目录 `CLAUDE.md`、`ai-onboarding.md` 第 6 节加了引用。

## 验证

- 只读 ping（haiku）：返回 OK。
- `-w docs` 写入测试（sonnet）：统计结果 4，与实际一致，测试文件已删。
- `-w docs` 越界写入：被沙箱拒绝，子任务如实报告没写成。
- `check_docs.py`：0 问题。

提交：未提交。发布：不涉及。
