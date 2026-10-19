# 角色语音管理后台

状态：现行　最后核对：2026-10-19

[返回设计目录](README.md) · [配音台词清单](../../tools_audio/voice_lines.json) · [当前人物同步](voice-current-cast.md)

## 启动和范围

在 `xiaojianghu` 目录执行：

```bash
# 默认正式制作：启动自动补全所有角色候选缺失的多句试听
python3 tools_audio/voice_server.py
# 等价显式命令
python3 tools_audio/voice_server.py --provider minimax
# 流程测试：静音 WAV，不启动自动试听队列
python3 tools_audio/voice_server.py --provider mock
```

主要角色打开 <http://127.0.0.1:8765/review/voice_pick.html>，普通 NPC 打开 <http://127.0.0.1:8765/review/voice_npc.html>。服务仅监听本机，密钥从 `MiniMax_APIKEY`（或 `MINIMAX_API_KEY`）环境变量、项目本地 `.env` 获取；密钥不进入网页、响应、Git。Cloudflare Pages 是静态游玩站，不承载这套管理 API。

现有候选定义通过 AST 读取，避免导入旧生成脚本而自动请求接口。叶蘅方向为清亮、利落的年轻少女；最终听感由试听确认。启动时自动串行准备所有角色的全部候选，每候选至少三句，具有不同语气。已有有效试听直接复用，无需逐个制作确认。页面显示总进度和候选状态，完成后可逐句试听或连续播放。试听不绑定音色；确认角色音色后才绑定并生成正式台词。

2026-09-30 情绪制作更新：此前无显式情绪的试听全部过期，重新排队制作 17 个角色、133 个候选、503 段带情绪试听。本轮现已全部完成：503 段有效，缺失 0、当前失败 0；重启后 133 个候选全部直接复用。正式音色仍等待人工确认。试听与生成状态保存在忽略目录，换机器需重新启动后台按有效文件补齐。

## 当前同步（2026-10-05）

主要角色21人（18位同伴、3位开篇重要角色），单句NPC20人。叶蘅、苏芷的试听和确认音色保留，新增角色按人设提供3个系统候选。108条状态示例显示但不参与正式制作或游戏导出；旧503段完成记录是此前批次。

先运行 `python3 tools_audio/sync_voice_catalog.py` 保存清单，再从页面点击“同步台词与试听”，不会改动已确认绑定。

## 接口

JSON 请求和响应；错误响应为 `{ "error": "说明" }`。修改操作限制本地同源。冲突返回 409，非法请求 400，缺失资源 404。

| 请求 | 数据与用途 |
|---|---|
| `GET /api/state` | `mode`（mock/real）、provider、model、characters、bindings、lines、jobs、auto_preview；每次重新读取台词清单 |
| `POST /api/catalog/refresh` | `{}`；重新读取已保存角色/试听定义，补齐缺失试听，不修改绑定 |
| `POST /api/previews` | `{character_id,candidate_slug}`；生成该候选样音，返回 `{job}` |
| `POST /api/bind` | `{character_id,candidate_slug,confirm:true}`；明确确认，保存绑定并自动创建补全任务；返回 `{binding,job}` |
| `POST /api/jobs` | `{character_id,mode:"missing"}`；补齐缺失或过期语音；`mode:"retry"` 仅重试失败项；返回 `{job}` |
| `GET /api/jobs/<id>` | 单任务进度 |
| `GET /api/audio/<line_id>` | 当前角色绑定下有效的音频；旧稿/旧音色返回 404 |
| `GET /api/preview/<character>/<candidate>/<index>` | 新生成候选试听；既有候选试听沿用 assets 路径 |

角色含样音 `lines:[{text,tag,emotion,emotion_api,delivery_notes,revision}]` 与 `cands`。候选含 `occupied_by`（其他角色 ID）、`preview_available`、`preview_urls`（按样音顺序）、`preview_is_mock`、`preview_status`、`preview_error`，以及片段进度 `preview_ready_count/preview_total`。正式语句含清单原字段、`synthesis_status`、`status`（用于界面展示的生成状态）、`audio_url`、`error`、`mock`。自动批次 `auto_preview` 包含 status、total、completed、failed、current、error；current 为正在处理的角色和候选。

音频 URL 带内容指纹版本，响应使用 Cache-Control: no-store，防止改情绪后浏览器误播旧文件。

语句生成状态：`unbound`、`missing`、`stale`、`ready`、`mock_ready`、`failed`。任务含 `id,character_id,type,status,total,completed,failed,error,created_at,mock`；`completed` 是已处理数量，包括失败项。任务状态：queued、running、completed、failed、interrupted。预览任务额外记录 `candidate_slug`。

## 一致性和恢复

- 普通 NPC 允许复用原始 `voice_id`；使用者按原始 ID 汇总，包含不同 pitch/speed 变体。主要角色之间保持唯一，NPC 不阻止主要角色使用该音色。后端加锁执行检查与保存，不能只靠按钮禁用。
- 当前角色有正式台词任务时，绑定调整与重复创建任务返回冲突。其他候选试听制作不阻止确认已准备好的音色，正式台词任务进入同一串行 worker。
- 不同角色的任务按队列依次执行，避免同时向同一语音账户发出大量请求。
- CLI 在持久化目录持有独占进程锁；即使换一个端口再次启动也会拒绝，避免同一份素材被两个服务重复合成。退出后锁自动释放。不要通过导入模块另起真实生成脚本；启动统一使用上述 CLI。
- MiniMax 请求结束后至少间隔 2 秒再发送下一请求；仅错误码 1002／1039 等待 20 秒后重试，最多重试 3 次（共 4 次请求）。其他服务错误、网络错误立即记录失败，不自动重复付费请求。请求、密钥与原始服务响应不写日志。
- `text/revision/emotion/emotion_api/delivery_notes`、合成实现版本、完整音色设置、模型和 provider 参与内容 hash；有效文件存在才跳过。文字调整、音色调整、mock 切 real 均失效重做。
- 清单新增语句后，点击“补全新增/过期语音”；无需重新选择音色。任务快照期间新增或改稿，在下一次补全处理。
- 每条语句独立保存成败，失败不会中止剩余语句。失败项提供重试；不自动无限重试，以免重复费用。
- 试听指纹包含文本、情绪标签、音色、模型和 provider；旧素材须匹配原 manifest 的模型、文本、实际情绪、合成实现版本与音色设置才复用；此前无情绪的 manifest 不满足复用条件。重启自动续补缺失候选，已有有效片段不再次请求。每个候选本批只排一次任务，限流采取上述有限退避，最终失败后页面可直接重试。
- 状态原子写入 `tools_audio/.voice_state/state.json`，音频保存同目录 `audio/`。服务重启将未结束任务标为 interrupted；试听由启动队列续补，正式台词由人点击补全继续。完整音频已落盘但状态未保存时，按 hash 恢复文件；若接口已扣费而响应或文件尚未保存，不能保证该片段免于再次计费。
- 默认 MiniMax 会自动产生试听请求；正式对白等待角色音色确认。mock 必须显式启用，仅用于静音流程测试，与真实 provider hash 隔离，不能当正式素材。
- 此后台完成本地制作与试听。正式音频发布到游戏资源、触发语音与混音属于后续接入；绑定不等于立即更新线上游戏。

## 验证与服务依据

本轮加入显式情绪参数后重新制作全部候选，已完成 17 个角色、133 个候选、503 段带情绪试听；生成中的网络失败与叶蘅改情绪的过期片段均已补齐。重启验收自动队列为 completed、失败 0，所有候选完整可用。未替用户确认任何角色音色。原有未传情绪的 159 段新试听与 344 段旧样本不作为本轮有效素材。

```bash
python3 tests/voice-backend.test.py
```

21 项后端测试通过，另通过试听页面流程测试。覆盖实际请求包含情绪且不改变音色 ID／正文、新清单缺情绪拒绝生成、旧无情绪试听失效、各角色样音覆盖至少两种情绪，以及明确确认、音色排他与持久化、文本新增/修改增量生成、mock/真实隔离、失败重试、防重复任务、试听不绑定。另覆盖并发争抢同音色、变调候选排他、情绪和音色调整失效、服务重启恢复、自动多句补全、重复启动跳过、试听改稿失效、完整文件状态恢复、进程锁，以及试听期间排队确认。所有测试使用临时目录和 mock，不请求付费接口。

真实实现使用 `speech-2.8-hd`、`POST /v1/t2a_v2`、非流式 hex 音频，参数参照 [MiniMax 官方语音调试台](https://solutions.minimaxi.com/debug/speech)。每句读取 `emotion_api` 并发送为 `voice_setting.emotion`；中文标签与演出说明用于编辑与审核，不拼入台词。规则和字段见[台词情绪](voice-emotion.md)。

## 单句 NPC 更新

当前制作范围以[普通 NPC 配音](voice-npc.md)为准：2 个多句角色、15 个单句 NPC，正式清单启用 82 条；候选扩充后计划启用 308 段试听。此前完成的 503 段是历史全量记录，停用片段保留缓存，不进入新任务。角色 voice_mode/single_line_id/single_preview_index 决定唯一片段；voice_enabled 控制制作资格。后端验证单句角色只启用一条，试听、绑定与补全均执行同一范围。

确认单句音色时，校验已有试听的文本、情绪、版本、演出说明与音色参数一致，再将其记录为正式音频（adopted_from_preview=true），不再次合成。页面共用 JS/CSS 与绑定状态，使用者列表在两个页面之间同步；NPC 可以复用，主要角色之间仍保持区分。

单句策略验证覆盖：只制作指定索引、停配正文不进入队列、采用试听不新增请求、补全不扩为多句、非法扩配被拒绝；页面测试覆盖两页角色分组、单句候选与明确确认。

候选 API 新增 used_by（全部角色 ID，含当前角色）、voice_locked（主要角色之间的冲突）；occupied_by 保留兼容。NPC 即使 used_by 非空也可选择。界面以全角色姓名映射展示使用者，不因页面分组而显示裸 ID。扩充候选：224 个、308 段试听；增量生成新增 91 段，原有 217 段不重做。

扩充完成验收：/api/state 自动队列 completed，224 个候选全部可用、308 段有效，失败 0；NPC 的 voice_locked 均为 false，used_by 与所有现有绑定按 voice_id 汇总一致。新增规则通过 21 项后端测试和页面测试。

## 按描述新增候选

选音页提供描述对话框，新增接口 `POST /api/candidates/expand`，动态候选与扩充任务持久化。字段、重试规则、账户限制及 Skill 见 [按描述扩充角色音色](voice-expansion.md)。

## 战斗语音补充（2026-10-06）

[战斗规则与逐句台本](battle-voice.md)。战斗语音独立于普通对白目录；单句NPC仍只保留一条对话识别句，明确登记的参战角色可补kind=battle事件语音。`--no-auto-previews`可仅运行正式制作队列，避免启动时制作无关试听。
