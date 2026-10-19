# 2026-10-16 存档与读档 P0 技术修复

## 需求

修复只读审查记录 [2026-10-16-battle-feel-rpg-review.md](2026-10-16-battle-feel-rpg-review.md) 第二节标为 P0 的四个技术问题，不改任何数值设计。

## 核对的文档

- `AGENTS.md`、`docs/design/runtime-entry.md`、`docs/design/qihe-map/startup.md`（启动与存档，本次负责文档）。
- 审查记录第二节；代码现状逐处核对（见下）。

先改文档：`docs/design/qihe-map/startup.md` 新增「写档与读档容错」一条，写明下面四项的规则和待确认点，再实现。

## 改动

### 1. 经济版本先迁移后校验（`js/qh-mode-cultivation-core.js`）

- 问题核实：`validate` 只接受 `economyVersion` 缺省或等于当前，`restore` 先校验再 `migrateEconomy`，所以版本一升，所有旧档在校验处就被拒，迁移永远执行不到。
- 改为：`validate(s)` 宽松模式接受不大于当前的版本号（缺省视为第 1 版），进行中活动 `pending.economyVersion` 同样处理；`restore` 依次 宽松校验 → 迁移 → `validate(s,{strict:true})`。严格模式要求顶层版本等于当前，只有存在进行中活动时允许暂留旧版本（原设计：活动收尾 `closeResult` 后再迁移，避免重复补体力）。比程序新的版本仍拒读。
- 体力上限按存档所属版本取：新增 `ENERGY_CAP={1:10}`，未登记的旧版本按当前上限；迁移补差 `当前上限 − 旧版上限`（≥0）。第 1 版→第 2 版的结果与原来逐字相同（补 2 点、封顶 12），没有改数值。

### 2. 培养读档失败不再卡死（`js/qh-mode-cultivation-core.js`、`js/qh-mode-cultivation.js`、`js/qihe-cultivation-bridge.js`）

- 新增 `CultivationCore.recover(raw)`：先照常 `restore`；失败时在副本上修复能确定安全的字段，再走一遍 `restore`。修复项：失效的栏目／动作选择重置为默认；`relations` 里不存在的人物条目丢弃；历练 `journey.visited` 里失效的地点去掉；`pending` 指向已删除动作时清除该活动。原数据不改动。
- `Cultivation.start`：读档改走 `recover`。修复成功时把原数据整份追加到存档字段 `S.cultivationQuarantine`（保留最近 3 份，含出错原因与修复清单），界面提示修了什么；修不了时不覆盖存档，显示「培养存档无法读取」面板，两个出口：「以新的培养进度继续」（先隔离原数据，再按栖河导入规则重建培养状态）与「返回首页」。会话缓存里带培养数据的存档也交给 `recover`，不再校验失败就静默换成新档。
- `QiheCultivationBridge.enter`：旧版培养导入（`migrate`）出错时提示并继续进入，不再整段抛错。
- **未定（数值规则）**：`pending` 指向失效动作时，是否退回已扣的体力／材料。目前保守地只清除活动、不退回。

### 3. 主线事件断点出错不再静默重放（`js/qihe-chapter.js`）

- `guarded` 增加 `catch`：写控制台日志，记录 `qiheChapter.storyError={key,count,message,at}`（key 为断点事件或阶段，同一 key 连续失败累加），并用 6 秒提示告诉玩家「剧情续接出错（…，连续第 N 次）…进度停在出错前」。之后续接成功、断点离开该 key 时自动清除记录。出错时不再向外抛。
- `resumeBody` 增加默认分支：阶段值无法识别时，未开始过（`halfDay` 为 0 且无已完成事件）回 `opening`，否则回 `days`，提示后续接。
- **未定（剧情结果）**：连续失败几次后是否允许跳过、跳过按什么默认结果继续。本次只加提示与日志。

### 4. 写档入口统一（`js/containers.js`、`js/qihe-resources.js`、`js/qihe-chapter.js`、`js/qh-mode-cultivation.js`、`js/core.js`）

- 容器领取原写死 `xjh.save`／`xjh.review.save`：在栖河入口下实际写进会话存储的 `xjh.review.save`，没有写进当前旅程存档。改走 `persistState(next)`。
- 资源采集、装备买换、培养 `persist()` 原直接 `localStorage.setItem(saveKey(),…)`，绕过了 `persistState` 的保存时间、最近旅程指针、江湖历练同步与行记通知。改走 `persistState`；各自原有的失败回滚与提示不变。
- `core.js` 自动存档 `save()` 原 `catch(e){}` 静默。改为写日志并显示常驻提示 `#save-warning`（存储满时提示空间已满），任一次 `persistState` 写成功后自动撤下。培养启动时写档失败也走同一提示。

### 测试改动

- 新增 `tests/save-recovery.test.cjs`（纯 node）：模拟 `economyVersion` 升一级后旧档（含进行中活动）仍能读入、收尾后版本跟上；更新版本拒读；第 1 版旧档补体力结果不变；失效选择／关系人物／进行中活动的修复与原数据不变；修不了时返回 `state:null`。在修改前的逻辑副本上运行，第 1 项按预期报「养成存档格式不正确」。
- `tests/qihe-faction-clash-story.cjs`：原断言「领队交锋中断时 `resume()` 抛错」，按第 3 项的新行为改为检查 `storyError` 记录（第 1 次），并补充重试成功后记录清除。其余断言不变。

## 采用／弃用

不涉及素材；无新增、替换或弃用素材。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| `node tests/save-recovery.test.cjs` | 通过 |
| `tests/*.cjs` 全量，修改前基线 | 21 过 29 败。基线运行时 8792 服务未启动，浏览器测试多为连接被拒 |
| `tests/*.cjs` 全量，修改后（8792 已启动） | 39 过 13 败（另有其他会话新增的 `battle-feel-probe.test.cjs`，通过）。唯一由过变败的是 `qihe-faction-clash-story.cjs`，属有意行为变化，已改断言，现通过 |
| 修改后仍失败的 13 个 | 均在基线中已失败：6 个缺 Playwright（`/private/tmp/claude-501/pw`），`character-grounding`、`hero-staff-combo`、`npc-actions` 为原有断言失败；`cultivation-balance-combat`、`cultivation-rework-preview`、`guiyun-performance-browser` 基线时连不上服务，为此临时换回修改前的 7 个文件单独重跑，三者失败信息与修改后完全相同，确认是原有问题，已换回 |
| `python3 tools_assets/check_production.py` | pass，1091 项，无错误 |
| 浏览器 8792：首页「从序章开始」→ 后山开场对白推进 | 正常，控制台无错误 |
| 浏览器 8792：回首页「继续进度」读已有存档 | 正常进入并续接开场断点，控制台无错误。读的是刚建的那份旅程（本浏览器里只有两份序章阶段的旅程，没有培养阶段的真实存档） |
| 浏览器：带失效选择与失效关系人物的培养档 | 提示「培养存档有失效内容，已修复：…原数据已另存」，`cultivationQuarantine` 已写入存档 |
| 浏览器：`route` 损坏、无法修复的培养档 | 显示「培养存档无法读取」及两个出口；存档内原数据未被覆盖；点「以新的培养进度继续」后进入一月初，隔离记录 2 份 |
| 浏览器：注入存储写满后自动存档 | 显示「进度未能保存：浏览器存储空间已满…」，恢复后下一次保存即撤下 |
| 浏览器：注入断点事件出错 | 提示「剧情续接出错（xu-meeting，连续第 1 次）…」，第二次计数为 2；未知阶段回到 `days` |
| 浏览器：栖河入口下领取容器 | 写入当前旅程存档键并更新保存时间；`xjh.save`、`xjh.review.save` 均未被写 |

浏览器核验用的是本次新建的独立旅程存档，在页面里注入构造数据完成；不是整章复测。核验后已恢复该旅程的存档内容（其中培养字段与隔离记录保留在这个测试旅程里）。

## 未完成项／待用户确认

1. 进行中活动指向已删除动作时，是否退回已扣的体力与材料（目前不退）。
2. 主线断点连续失败后是否提供跳过，以及跳过时按什么剧情结果继续（目前只提示）。
3. 审查记录同节 P1（顶层存档版本与迁移链、`.bak`、旧档语料）及「回收站是否真删除」不在本次范围。
4. 未更新 `index.html` 里脚本的 `?v=` 版本参数。

## 提交与发布

本地完成；未提交；未发布。
