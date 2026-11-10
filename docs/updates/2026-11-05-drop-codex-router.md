# 2026-11-05 · 舍弃子任务路由器（codex-router）

状态：现行　最后核对：2026-11-05

## 需求（用户原话）

“失效就舍弃”

上一步实测：子任务路由器用的 `ENTERPRISE_API_KEY` 直连 Router 返回 401（无效 Key），见 [2026-11-05-opus-company-router.md](2026-11-05-opus-company-router.md)。

## 做了什么

- **规则：** R-子任务-02 状态改为“废止”，修改记录写了用户原话，已登记批准。R-子任务-01 保留：派 Claude 自己的子代理时，仍要把相关规则附进任务说明。
- **归档到 `_attic/2026-11-05-codex-router/`**（附 manifest.json 和 restore.sh，可以还原）：
  - `xiaojianghu/tools_common/codex-router.sh`；
  - 项目根目录的 `.router-tasks/`（路由器子任务日志）。
- **说明文档移到 `docs/archive/`：**
  - `router-subtasks.md`、`router-api-for-agents.md`，状态改为“废止”，文首加了说明；
  - 所有指向它们的链接都已改过来；
  - `docs/archive/anim-pipeline-rig.md` 原来按 docs/ 写的相对链接，这次一并补成能打开的。
- **密钥：** 失效的 `ENTERPRISE_API_KEY` 从 `tools_por/.env` 删掉，没有进归档。要还原路由器，得重新配一个有效的 Key。
- **入口文档改了说法：** CLAUDE.md、ai-onboarding.md、dev-methods-summary.md 第 4 节、model-router.md、Godot 版 plan.md。

## 不受影响的

- 剧情工具的 Opus 走公司路由（Token路由 本机代理），见 [model-router.md](../model-router.md)。
- 生图、配音走的 302.AI 和 codex exec 内置生图，跟子任务路由器无关。
