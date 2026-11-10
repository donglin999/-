# 302 Enterprise 路由器：给其他 agent 的接入说明

> **2026-11-05 废止**（用户：“失效就舍弃”）：路由器 Key 失效（401），R-子任务-02 废止，脚本移到 `_attic/2026-11-05-codex-router/`。下面是当时的做法，只作存档。

状态：废止　最后核对：2026-11-02

这份说明交给其他 agent 直接照做。本项目内派子任务的规则见 [子任务分流](router-subtasks.md)（R-子任务-02），本页只讲怎么调用。

## 1. 密钥

- 变量名：`ENTERPRISE_API_KEY`。
- 本机存放位置：`/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu/tools_por/.env`，权限 `0600`，被 Git 忽略。
- **不要**把密钥写进代码、文档、提示词、日志或提交，也不要在输出里打印。
- 读取方法：
  ```bash
  export ENTERPRISE_API_KEY="$(sed -n 's/^ENTERPRISE_API_KEY=//p' /Users/wuxiuxiang/project/luotuozhuan/xiaojianghu/tools_por/.env | head -1 | tr -d "\"'")"
  ```
- 换密钥只改 `.env` 那一行。

## 2. 接口

基址：`https://model-router.zleap.com/v1`

三种格式 2026-11-02 都用 `claude-haiku-5-5` 实测返回 200：

| 格式 | 路径 | 认证头 |
| --- | --- | --- |
| OpenAI Responses | `POST /v1/responses` | `Authorization: Bearer $ENTERPRISE_API_KEY` |
| OpenAI Chat Completions | `POST /v1/chat/completions` | `Authorization: Bearer $ENTERPRISE_API_KEY` |
| Anthropic Messages | `POST /v1/messages` | `x-api-key: $ENTERPRISE_API_KEY`，加 `anthropic-version: 2023-06-01` |

- 模型列表：`GET /v1/models`，不计费。
- 不带密钥会返回 401。
- 每次返回都带 `usage`（token 数），按用量计费。

## 3. 可用模型

2026-11-02 `GET /v1/models` 返回 16 个，用前可以再查一次。

| 用途 | 模型 |
| --- | --- |
| 默认，复杂开发 | `claude-opus-5-5` |
| 一般小任务 | `claude-sonnet-5-5` |
| 只读统计、调研 | `claude-haiku-5-5` |
| 其他 | `claude-fable-5`、`claude-fable-5-1`、`claude-opus-5`、`claude-opus-5-thinking`、`claude-sonnet-5`、`gpt-6-astra`、`gpt-6-luna`、`gpt-6-sol`、`gpt-6.1-sol`、`deepseek-flash`、`qwen3.8-flash`、`sale/glm-5.3`、`sale/kimi-k3` |

## 4. 请求示例

### curl：Chat Completions

```bash
curl -sS https://model-router.zleap.com/v1/chat/completions \
  -H "Authorization: Bearer $ENTERPRISE_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"claude-sonnet-5-5","messages":[{"role":"user","content":"……"}],"max_tokens":2000}'
```

回复文本在 `choices[0].message.content`。

### curl：Responses

```bash
curl -sS https://model-router.zleap.com/v1/responses \
  -H "Authorization: Bearer $ENTERPRISE_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"claude-sonnet-5-5","input":"……","max_output_tokens":2000}'
```

回复文本在 `output[0].content[0].text`。

### curl：Anthropic Messages

```bash
curl -sS https://model-router.zleap.com/v1/messages \
  -H "x-api-key: $ENTERPRISE_API_KEY" -H 'anthropic-version: 2023-06-01' -H 'Content-Type: application/json' \
  -d '{"model":"claude-sonnet-5-5","max_tokens":2000,"messages":[{"role":"user","content":"……"}]}'
```

回复文本在 `content[0].text`。

### Python SDK

**本节两种 SDK 写法未实测**，只按上面验证过的路径推出来：

```python
from openai import OpenAI
client = OpenAI(base_url="https://model-router.zleap.com/v1", api_key=os.environ["ENTERPRISE_API_KEY"])
r = client.chat.completions.create(model="claude-sonnet-5-5", messages=[{"role": "user", "content": "……"}])

import anthropic
client = anthropic.Anthropic(base_url="https://model-router.zleap.com", api_key=os.environ["ENTERPRISE_API_KEY"])  # SDK 自己会补 /v1/messages
r = client.messages.create(model="claude-sonnet-5-5", max_tokens=2000, messages=[{"role": "user", "content": "……"}])
```

### Codex CLI

已实测（2026-10-23），本项目脚本 `xiaojianghu/tools_common/codex-router.sh` 就是这样调用的：

```bash
codex exec --ignore-user-config --skip-git-repo-check --ephemeral \
  -C <工作目录> -s workspace-write -m claude-opus-5-5 \
  -c model_provider='"enterprise"' \
  -c 'model_providers.enterprise={name="302 Enterprise",base_url="https://model-router.zleap.com/v1",env_key="ENTERPRISE_API_KEY",wire_api="responses"}' \
  -c approval_policy='"never"' --json "任务说明" < /dev/null
```

- 只读任务用 `-s read-only`。
- 必须在本机终端（沙箱外）运行，受限沙箱连不上网。
- 沙箱里起不了 Playwright／Chromium，需要截图的活别派。

## 5. 在骆驼传里派子任务

骆驼传（`/Users/wuxiuxiang/project/luotuozhuan`）里直接用脚本，它会自己读密钥：

```bash
xiaojianghu/tools_common/codex-router.sh [-m 模型] [-r] [-w all|docs|game] [-l 日志名] "任务说明"
xiaojianghu/tools_common/codex-router.sh -w docs -l 任务名 - < task.txt   # 长说明从文件读
```

日志写在 `luotuozhuan/.router-tasks/<日志名>.jsonl` 和 `.txt`。

任务说明照下面的模板写，四项缺一不可：

```text
全程用中文汇报。

## 任务
（一句话说清要做什么、为什么）

## 允许改的文件
- （逐个列出路径或目录）
## 不许碰
- 密钥文件 tools_por/.env；Git 提交、推送、发布；（其他）

## 完成标准
- （可检查的结果）
- 跑这条检查并贴结果：python3 xiaojianghu/tools_docs/check_docs.py（或对应的 verify / 测试）

## 相关规则（从 xiaojianghu/docs/rules/规则登记表.md 摘）
- R-语言-01：全程中文……
- （按任务挑，R-子任务-01）

## 汇报格式
- 改了哪些文件，每个文件一句话
- 跑了哪些检查、结果原文
- 没做完或拿不准的地方
```

**不派：** 剧情台词、设定与定稿事实、需要用户审美判断的美术界面特效、已批准剧本、规则、涉及密钥、提交与发布的操作。

**验收：** 子任务说“做完了”不算数。派任务的一方自己看改动、重跑检查，并登记[改动清单](../changelist.md)。
