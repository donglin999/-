# 遗留校验失败清理（2026-10-19）

状态：现行　最后核对：2026-10-19

## 需求

主会话转达用户要求：把 `tools_scene/qihe/` 里改动前就失败的校验清理掉，逐个查清是“测试过时”还是“代码有问题”。测试过时就改测试并注明依据；代码有问题就小改代码，不动玩法、数值、剧情，不改已批准的 ink。

涉及：verify_menu_fix（3 处）、verify_jianghu_ui、verify_ui_model，以及老失败点 verify_representatives、verify_stranger、verify_outsiders、verify_faction_contacts、verify_cg_direction、verify_chapter_battle。

## 结论一览

| 校验 | 失败点 | 原因 | 归类 | 处理 |
|---|---|---|---|---|
| verify_ui_model | 队伍里没有 ye | `PARTY_DEF.ye`、`MN_MEM.ye`、`MN_PREF.ye`、`COMPANIONS.ye` 原来写在 `js/xiangyang-slice.js`，今天随襄阳演示归档（`2026-10-19-deprecated-entries.md`）后就没了。`qihe-ui-model.js` 把“不在 PARTY_DEF 里的人”剔出队伍，真实游戏里叶蘅也会从出战编成里消失 | **代码问题**（今天归档时漏掉的硬依赖） | 四行定义原样移到 `js/qihe-characters.js` 文件头 |
| verify_jianghu_ui | 第 23 行同屏人数 2≠3 | 同上（叶蘅被剔除） | 代码问题 | 同上 |
| verify_jianghu_ui | 后面的行记断言（修好上一条后才暴露） | 断言的是旧标题“开始 · 风起栖河／开始 · 山村来客”、已取消的“中止”分类、旧内功名“吐纳法” | 测试过时 | 改为断言“眼下”“江湖经历 / 后山遇狼 / 栖河第一夜”、未知分类回到进行中、《吐故纳新篇》 |
| verify_menu_fix | 主角立绘路径 | 10-17 主角立绘换成高清半身像（`2026-10-17-portrait-hd-hero.md`） | 测试过时 | 期望值改为 `assets/production/portraits/p_opening_hero_{village,modern}_hd_20261017.webp` |
| verify_menu_fix | J 键 `assert(captured)` | 10-05 起 J 打开正式江湖任务页（`2026-10-05-free-exploration-journal.md`），不再弹活动选择框 | 测试过时 | 改为断言打开行记页、显示“眼下”、不耗半日、不弹选择框 |
| verify_menu_fix | 任务追踪 `before.length>1` | 10-10 行记只收已承办事项（`2026-10-10-quest-codex-adoption.md`），开局只有主线一条；“正道盟的请求”不再进行记 | 测试过时 | 新任务改用答应周婶跑腿“还碗”触发 |
| verify_menu_fix | 同上，修好后暴露：“眼下”被当成支线 | 今天主线改名“眼下”后，`qihe-jianghu-ui.js` 的主线识别正则 `MAIN_QUEST` 只认“开始 ·”等前缀，“眼下”的 `main` 为 false：HUD 里“当前行程”和追踪列表各显示一遍，取消追踪主线也藏不掉“当前行程” | **代码问题**（今天改名带出的） | 正则补上整名“眼下” |
| verify_representatives | `assert.rejects` 没等到异常 | 10-16 起剧情出错不再抛出，改记 `storyError` 并提示（`2026-10-16-save-load-p0-fixes.md`） | 测试过时 | 改为断言 `storyError` 记了第 1 次、断点仍在 `evidence-v2` |
| verify_stranger、verify_cg_direction | “领队动作表尺寸不符” | 10-13 起起火前插入领队交锋，它要真实解码动作表；测试环境的 `Image` 是空壳。素材本身尺寸正确（7680×324 = 480×16） | 测试过时 | 与 verify_chapter 一样跳过交锋演出 |
| verify_stranger | 修好上一条后：补播场景应在 qh_north | 10-17 起宋先生各段是主线前置一步，玩家自己走去后山，不再自动传送（`2026-10-17-playtest-rework.md`） | 测试过时 | 去掉场景断言 |
| verify_stranger | 沉默分支台词 | 红绳一场按 ink 重写 | 测试过时 | 改断言 ink 现行台词“先跟上大家” |
| verify_cg_direction | 旁白句、点火镜头说话人、岑霜那句的台词与镜头 | 起火一场按 ink 重写（不用旁白）；岑霜、沈雁回两句有 cen/shen 特写 | 测试过时 | 按 ink 现行台词与镜头改断言 |
| verify_cg_direction | 陈伯伤情 | 护车分支记为“腿伤待照护”（10-13 起；培养部分按此值读取） | 测试过时 | 改期望值 |
| verify_outsiders | 陆衡最后一句变成萧白的 | 先跟帮众说话时，ink 的搭话轮换写入 `qiheChapter.talkCycle`，在主线开始前就建出半截 `S.qiheChapter`（只有 talkCycle、没有阶段），之后跟陆衡说话就落到“今晚先歇着吧” | **代码问题**（今天加的搭话轮换带出的） | `js/story-runtime.js`：主线开始前写 `qiheChapter.*` 标记只记在内存，不建主线状态 |
| verify_faction_contacts | “Contact must not begin chapter” | `qihe-chapter.js` 的 `guarded()` 在每次交谈后都调 `state()`，主线开始前跟主事人说一句话就建出完整的 `S.qiheChapter` | **代码问题**（10-16 加出错记录时带出的） | `guarded()`／`storyFailed()` 改为只读 `S.qiheChapter`，不顺手建 |
| verify_faction_contacts | 修好后暴露：菜单第三项、第一夜证词 | 三方菜单与第一夜台词按 ink 重写 | 测试过时 | 按 ink 现行台词改断言 |
| verify_faction_contacts、verify_chapter_battle | 跑完不退出 | 测试环境 `setTimeout` 被压到 1ms，行记人物提示等轮询在没有真实页面时一直排队 | 测试环境问题 | 测试末尾主动 `process.exit` |
| verify_chapter_battle | 存档快照多出 `jianghuInsight` | 共享历练池在存档时补建空记录（10-17 记录已提到） | 测试过时 | 比较前先建好这条空记录 |

说明：verify_ui_model、verify_jianghu_ui 第 23 行这两处，是今天上午归档襄阳演示时带出的，不在 10-19 襄阳归档那份记录的基线名单里；“改动前就失败”指的是在之后几轮改动之前。

## 改动

代码（index.html 中版本号同步改为 `?v=20261019-tf1`）：

- `js/qihe-characters.js`：文件头加回叶蘅的四行同伴定义（与归档文件原文一致）。
- `js/qihe-jianghu-ui.js`：`MAIN_QUEST` 正则认“眼下”。
- `js/qihe-chapter.js`：`guarded()` 成功后、`storyFailed()` 出错时只读 `S.qiheChapter`；主线开始前出错，提示里的断点名写“主线开始前”。
- `js/story-runtime.js`：主线开始前写 `qiheChapter.*` 标记暂存内存（搭话轮换在开局前不存档，主线开始后照常存）。

测试：上表 9 个 `verify_*.cjs`，每处改动都在测试里注明依据。

备份：`_attic/2026-10-19-test-fixes/xiaojianghu-legacy-prologue/`（14 个文件，改动前原样）。

## 验证

| 校验 | 结果 |
|---|---|
| verify_menu_fix | 通过（13/13） |
| verify_jianghu_ui | 通过（46 项） |
| verify_ui_model | 通过 |
| verify_representatives | 通过 |
| verify_stranger | 通过 |
| verify_outsiders | 通过 |
| verify_faction_contacts | 通过 |
| verify_cg_direction | 通过（8 例） |
| verify_chapter_battle | 通过 |
| verify_startup、verify_prologue、verify_chapter、verify_saves、verify_household、verify_expansion | 均通过 |
| tests/qihe-journal.test.cjs、qihe-journal-notices.test.cjs | 18/18 通过 |
| tests/qihe-faction-clash-story.cjs | 仍失败，失败点与改动前逐字相同（在临时副本里用改动前文件复跑确认），是 ink 台词断言，本轮未动 |
| `node scripts/build-pages.cjs` | 通过（文档检查 0 问题；素材检查 pass，1062 项；剧本检查 pass，41 份已批准；生成 dist，未发布） |

浏览器（本机 8792，`?uiReview=1&v=tf1`，不读写玩家存档）：改前 `PARTY_DEF.ye` 不存在，队伍存档里有 ye，编成却只有主角、苏芷、岑霜；改后编成为主角、叶蘅、苏芷、岑霜，江湖队伍页四人同屏，叶蘅在列；追踪列表“眼下”识别为主线，HUD 只显示一次“当前行程”，没有重复的追踪行；控制台无报错。

## 没改、待拍板

- `story/01-开始/第一夜-过夜.ink` 第 186 行仍是“【山村来客 · 完。进度已保存。】”，与 10-19“界面不写固定环节名”的要求不符。这是已批准的 ink，未改，需用户确认后改。
- `js/qihe-jianghu-ui.js` 内功栏仍写“入谷培养后开启修习与主辅配置”“内功修习入谷培养后开启”，而 `qihe-ui-model.js` 已改成“暂未开放”。是否也算阶段名、要不要统一，拿不准，未改；测试仍按现行“入谷培养后开启”断言。
- `js/qihe-hud.js` 左上角头像仍用旧的 `assets/p_opening_hero_*.webp`，没换成 10-17 高清立绘。可能是有意保留小头像构图，拿不准，未改。
- `js/qihe-chapter-presentation-review.js`（本机评审夹具）把陈伯伤情写成“擦伤待照护”，现行值是“腿伤待照护”，培养部分会读成未知。只影响评审入口，未改。
- `verify_battle` 也有同样的 `jianghuInsight` 快照差异（10-17 记录已提到），不在本轮名单，未改。
- 控制台“[VFX 等级自检] gy_zhou_teaching 缺少 FXDEF”警告依旧，不影响测试，未查。

## 状态

本地完成；未提交 git；未发布。
