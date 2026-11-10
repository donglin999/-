# 2026-11-05 · 剧情工具的 Opus 改走公司路由

状态：现行　最后核对：2026-11-05

## 需求（用户原话）

“更新下 302 的 opus 调用方式https://claude.ai/artifact/JXuPVhcT3Zy5jMxtHcJa1p，更新文档”

链接是《Claude Code 公司路由使用说明》，讲的是经 Token路由 本机代理走 zleap-router。

## 改了什么

- `tools_story/minimax_logic_review.py` 的 `call()`：
  - `claude-*` 默认走公司路由（新增 `router_conf`、`router_call`，用 Anthropic 原生接口）；
  - `302/claude-*` 走 302.AI，留作备用；
  - 逻辑初筛新增 `--provider router`，并设为默认。
- `minimax_actors.py`、`minimax_draft.py`：只改了注释和用法说明。它们本来就经这个 `call()` 调用，默认模型名 `claude-opus-5-5` 不变。
- 规则 R-剧情-01：“默认 302 的 claude-opus-5-5”改为“默认 claude-opus-5-5，经公司路由调用，302.AI 备用”。修改记录里写了你的原话，并已登记批准。
- 写作规范第七节“逻辑初筛”、剧情写作 skill 的两处、新文档 [model-router.md](../model-router.md)、子任务路由器说明（加了“现在不通”的提示）。

## 验证

- 本机 Token路由 代理加员工 Token：Opus 回“OK”，约 5 秒。带 system 提示的中文请求正常。
- 演员法端到端：`prologue-actors-brief.json` 的 `P1-walk` 场，3 句出稿，约 15 秒。
- 302 备用通道（`302/claude-opus-5-5`）仍然通。
- 逻辑初筛没有整份跑一遍（一次要三步、每步上万 token）。它和起草走的是同一个 `call()`，已经测通。

## 发现的问题（没改）

- 子任务路由器 `codex-router.sh` 用的 `ENTERPRISE_API_KEY` 直连 Router 返回 401 无效 Key，派子任务会失败。
- 员工 Token 直连 Router 也是 401，它只能经本机代理用。
- Codex 要 responses 接口，本机代理只有 Anthropic 接口，所以没法照搬这次的改法。
- 要恢复，需要一个新的有效 Key。
