# 剧情工具调用 Opus：走公司路由

状态：现行　最后核对：2026-11-05

规则见 R-剧情-01。这页只写操作。公司路由本身的说明见用户给的文档《[Claude Code 公司路由使用说明](https://claude.ai/artifact/JXuPVhcT3Zy5jMxtHcJa1p)》。

## 哪些工具用它

剧情工具默认用 `claude-opus-5-5`，2026-11-05 起经公司路由调用：

| 工具 | 用途 |
| --- | --- |
| `tools_story/minimax_actors.py` | 演员法起草 |
| `tools_story/minimax_draft.py` | 整场起草 |
| `tools_story/minimax_logic_review.py` | 逻辑初筛 |

文件名里的 minimax 是旧名，没改。三个工具都经 `minimax_logic_review.call()` 按模型名分通道：

| 模型名 | 走哪里 |
| --- | --- |
| `claude-*`（默认 `claude-opus-5-5`） | 公司路由 |
| `302/claude-*` | 302.AI（备用） |
| `deepseek-*` | DeepSeek |
| 其他 | MiniMax |

逻辑初筛也可以用 `--provider router|302|minimax|deepseek` 选，默认 `router`。

## 怎么接上公司路由

1. 打开 Token路由 → 配置 → Claude Code。
2. 选「zleap · Claude Code」并启用。看到“配置已写入”，顶部显示“代理就绪”即可。

之后脚本自己从 `~/.claude/settings.json` 的 `env` 里读两项：
- `ANTHROPIC_BASE_URL`：本机代理地址，现在是 `http://127.0.0.1:39445/claude`；
- `ANTHROPIC_AUTH_TOKEN`：员工 Token。

脚本用 Anthropic 原生接口（`/v1/messages`）发请求，再由代理转给 zleap-router。

- 只认本机地址（`127.0.0.1`、`localhost`），员工 Token 不会发到别处。
- 环境变量 `ZLEAP_BASE_URL`、`ZLEAP_TOKEN` 可以覆盖上面两项。
- 遇到 429、5xx 自动重试 3 次。

## 2026-11-05 实测

每种接法都只发一句“只回 OK”：

| 接法 | 结果 |
| --- | --- |
| 本机 Token路由 代理 ＋ 员工 Token（`/v1/messages`） | 成功，约 5 秒 |
| 员工 Token 直连 `model-router.zleap.com`（messages、chat/completions、responses 三个接口） | 401，无效 Key：这个 Token 只能经本机代理用 |
| `tools_por/.env` 的 `ENTERPRISE_API_KEY` 直连 Router | 401，无效 Key（这个 Key 已删，见下文“子任务路由器”） |
| 302.AI（`302/claude-opus-5-5`） | 成功，仍可作备用 |

端到端：用演员法起草 `prologue-actors-brief.json` 的 `P1-walk`，3 句，约 15 秒出稿。

## 常见问题

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| “公司路由没就绪” | Connector 切回了「Claude 官方」，settings.json 里没有本机代理地址 | 在 Token路由 里切到「zleap · Claude Code」；或临时加 `--provider 302`（演员法用 `--model 302/claude-opus-5-5`） |
| “连不上公司路由的本机代理” | Token路由 没开 | 打开 Token路由，等“代理就绪” |
| 公司路由返回 401 | 员工 Token 过期或被换 | 在 Token路由 里重新启用一次 |

注意：剧本、人物卡、定稿事实这些上下文会整份发给公司路由，哪些内容能发按公司规定。

## 子任务路由器（codex-router.sh）已舍弃

`tools_common/codex-router.sh` 用 `tools_por/.env` 的 `ENTERPRISE_API_KEY` 直连 `https://model-router.zleap.com/v1`（responses 接口）。11-05 实测这个 Key 被判无效（401）。员工 Token 直连 Router 也是 401；Codex 要的是 responses 接口，本机代理给的是 Anthropic 接口，也不能直接改用本机代理。

用户定“失效就舍弃”（2026-11-05）：
- 规则 R-子任务-02 废止；
- 脚本和任务日志移到 `_attic/2026-11-05-codex-router/`，用 `restore.sh` 可以还原；
- 说明文档移到 [archive/router-subtasks.md](archive/router-subtasks.md)；
- 失效的 Key 已从 `tools_por/.env` 删掉。

小任务改在主会话里做，或派 Claude 自己的子代理。
