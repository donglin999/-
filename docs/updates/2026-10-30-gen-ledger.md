# 2026-10-30 生成账本

状态：现行　最后核对：2026-10-30

## 需求

用户在美术方法评估后选定“先做生成账本”：`imggen.py` 是统一入口但没有记账，`art_sources` 下 3 份视频生成脚本也要一起接。

## 改动

- 新增 `tools_common/genledger.py`：追加式账本 `tools_common/gen-ledger.jsonl`，带汇总、按日、最近 N 次、按哈希反查。账本在第一次真实调用时才生成。
- `tools_common/imggen.py`：所有源的调用都入账，失败和中断也记；`openai_compat` 的返回里多一个 `key_env`，只写主密钥或备用密钥的变量名，用来分清这笔走了哪个账户。
- `xiaojianghu-legacy-prologue/art_sources` 下 3 份脚本接账本：`hero-motion-video-20261021/tools/vgen2.py`、`censhuang-motion-video-20261021/tools/vgen2.py`、`ye-motion-video-20261028/tools/vgen.py`。接口请求内容没变。
- 新增 `tests/gen-ledger.test.py`；`docs/art-pipeline.md` 加“生成账本”一节。

## 决定

- **调用前先记一笔**：进程被杀或断网时账上还有记录，汇总里显示 `unfinished`；视频拿到任务号立刻再记一笔，事后能拿任务号去查。
- **账本进 Git（不忽略）**：换电脑后还在。它是提示词全文的文本文件，不含密钥。
- **不换算费用**：没有可靠的价格来源，只记接口返回的用量，避免记出看着准确其实不对的金额。
- **记账失败不影响产物**：只打提醒。
- **没走路由器分派**：改动碰密钥读取和抹除，属于 `docs/archive/router-subtasks.md` 第 3 节的“不分派”。

## 核对过的文档

`CLAUDE.md`、`docs/ai-onboarding.md`、`docs/art-pipeline.md`、`docs/archive/router-subtasks.md`、规则 R-生图-01～04、R-子任务-02。

## 验证

`python3 tests/gen-ledger.test.py`：11 项通过，全部离线，没有发计费请求。

- 生图用本机假接口跑 `imggen.main()`：成功、失败、主密钥额度不足换备用、账本路径写不进去时产物仍在。
- 视频把 3 份脚本抄到临时目录后替换 `urlopen` 运行：成功、提交失败；`ye` 那份还测了轮询断网。
- 测试断言账本里没有本次请求用的密钥，签名链接的查询串已去掉。
- 8 线程各写 50 次，400 条都能读回。

**没有验证的**：没有用真实接口跑过，真实返回的 `usage` 长什么样要等下一次实际出图。

## 未完成项

- 直接调 `flatimg.py` 的脚本（`tools_por/gen_por.py`、`tools_fx/`、`tools_scene/` 下几份）和直接跑 `codex exec` 没有入账。`flatimg.py` 内部还有重试，一次调用可能对应多次提交。
- 3 份视频脚本仍是副本，新批次复制时要带上账本那几行；没有合并成一份。
- 账本只记今天之后的调用，历史出图不补。
- 3 份视频脚本所在的路径被 `xiaojianghu-legacy-prologue` 的 Git 忽略，这部分改动只在本机，提交也带不走；换电脑要手工带上。

## 状态

本地完成；未提交；未发布（本次不涉及游戏运行代码）。
