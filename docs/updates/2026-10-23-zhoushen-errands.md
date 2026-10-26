# 2026-10-23 开始部分：周婶三件合成「替周婶跑一圈」＋三方跑腿两处穿帮

状态：待用户过目，未 --approve　最后核对：2026-10-25

## 需求

用户第十三轮第 13 项：“三个任务”指周婶三件，方案由我们选；第 14 项：4 处穿帮改已批准剧本，「同意」。方案按 `xiaojianghu/docs/design/opening-errands-rework.md` 第零节：0.1 选乙-1（合成一件、旁听做主体），0.4 消四处穿帮。本次是批次二的“剧本二”子任务。

## 改动

### 剧本（7 份已批准剧本，**都未 --approve**，构建会因“已批准的剧本被改动”停下，运行时仍是旧台词）

| 剧本 | 改了什么 |
| --- | --- |
| `story/01-开始/第一夜-周婶托付.ink` | 三个选项合成一个：周婶一次报三处（“都在村里，跑一圈认认路”），萧白“三样都交给我”接下，三个键同时记 accepted；三处办完回药棚交差：任一处旁听过，周婶问一句“路上听着什么了”，萧白含糊带过；给金创药（记 `prologue.errandGift`）。旧档里分开接过的，进来时把没接的补成已接（隧道 `aunt_catch_up`）。 |
| `第一夜-还碗.ink` | 旁听前置：进门时陈伯正问客人“找行舟什么事”，选“站在门边听一会儿／先把碗送进去”；去掉“这位客人是……？” |
| `第一夜-取布.ink` | 旁听前置：帮众正逼问掌柜叶家怎么走，选“在门口听一会儿／上前找掌柜取布”；删去拖凳子那段，被打断时帮众骂一句 |
| `第一夜-送药.ink` | 旁听前置：老人正问门外差役“征药的随从说叶家的药早验过了，要装车拉走？”，选“在一旁听一会儿／上前把药递过去”；差役当面说“没人画押，作不得数”；去掉“坐会儿” |
| `第一夜-过夜.ink` | 删去 Q1-letter、Q2-account、Q3-ledger 三支（穿帮第 4 处）；三处都说给叶蘅的，多叶蘅“三拨人，全冲我家来”＋萧白想到门缝里的字条；追问第二次起叶蘅改问“还有呢？”；陈伯对阿蘅说“你爹”（不旁听的玩家不知道“行舟／温家”）；没办完的，周婶说“明儿再说，不急” |
| `三方-跑腿-拜帖.ink` | 穿帮第 1 处：开头改成徐令仪上门被拒之后（“药棚门口那回，你也在”“叶家的门，我也不便再登”）；删“亲自去向叶姑娘赔个不是”；第二个回话选项去掉“让她自己来问”；萧白对陈伯称“叶蘅” |
| `三方-跑腿-旧货账.ink` | 穿帮第 3 处：《次日药摊》在先——萧白转述药商说过罐底的款是温家的；药商“怎么又是你？上回叶姑娘领你来问罐子”；岑霜收尾不再说“替乌魁带话” |

不改：《徐令仪上门》《第一夜-收药箱》《风起-次日药摊》（0.4 定的）。穿帮第 2 处（拜帖借用 `heard.skill`）在 `js/qihe-outsiders.js`，归开发一。

### 标记与登记

- `story/_共用/flags.json`：新增 `prologue.errandGift`；`heard.*` 加读取方《周婶托付》；三方 `outsiders.quests.*.stage` 去掉读取方《过夜》，标 recordOnly（构建提示“剧本里没有用到”，是预期，它们仍由 `qihe-outsiders.js` 读写）。三个 errands 键沿用，不新增汇总状态（进度由三个键推导）。
- `xiaojianghu/docs/design/registry/story-hooks.json`：新增 `qihe_errand_round`（三处旁听与交差的种下与回扣）、`qihe_outsider_errands`（两份跑腿；《过夜》不再读它）。

### 运行侧（已生效于 8792）

- `js/qihe-map-trial.js`：行程提示改为“替周婶跑一圈（可不做）”，接下后列还差哪几处，三处办完提示“回药棚交差”；`mnQuests()` 只出一条“替周婶跑一圈”，按三步写进度；交差后见 `errandGift` 发一次 `ITEMS.pill`（金创药），另记 `errandGiftPaid`。旧剧本也能读（全由三个键推导）。
- `js/qihe-prologue-actions.js`：只更新说明注释。
- **任务面板（江湖行记·任务）的条目在 `js/qihe-journal.js` 里，不归我改**，仍是三条。补丁提议：`docs/updates/evidence/2026-10-23-zhoushen-errands/qihe-journal-一条任务三步-补丁提议.diff`（一条 `errand:round`，四步进度）；套用后 `tests/qihe-journal.test.cjs` 第 8 行要把 `errand:medicine` 的断言改成 `errand:round`（已在临时副本里试过，其余 9 条与 notices 8 条通过）。

## 三道关

1. 戏眼卡：`xiaojianghu/docs/design/scripts/briefs/zhoushen-errand-round-brief.json`（ZR-aunt-offer／aunt-return／chen／cloth／elder／night-all／letter／account，含冷读后改动一节）。
2. 演员法：`tools_story/minimax_actors.py --takes 3`。默认模型 MiniMax-M2 已下线（报 2069），改用 `--model MiniMax-M3` 跑完；挑选剪辑后写入剧本。**脚本默认模型需要改成 M3**（不归我，交主会话）。
3. 冷读：子代理只拿路线全文（前情 qihe_lodging＋“只看固定”A、“全看”B、“部分看”C、三方两段连同前情 D）。路线是用临时副本编译（副本里登记批准，只为让构建导出路线）后按玩家顺序连播导出的；`dump_route.cjs` 只支持培养模式，不支持 ink。
   - 已改（10 处）：见戏眼卡“冷读后改动”。
   - 未改，属本轮不动的已批准场次，交主会话／用户：①《收药箱》萧白已告诉叶蘅有人打听她父亲，《过夜》陈伯又当新消息说、叶蘅再问一遍（B、C 路线重复）；《徐令仪上门》叶蘅仍问“你认得我爹？”；②《问候》叶家门口“连东南西北都没分清”对跑完三处的玩家不合适；③《次日药摊》《装卸路》陆衡搜山消息说两遍、字幕卡“第一日傍晚／次日／第二日傍晚”叫法不一；④《装卸路》萧白心里话“她们手里都捏着一张纸”；⑤过夜“躺下睡觉”选了也被陈伯叫走；拜帖、旧货账托付前萧白先说“帮你送可以”再出“去不去”选项。
   - 不改并说明：周婶“夜里别乱跑”后又托事——托的都是村里人家，改为“都在村里”交代。

## 验证

- `node tools_story/build_ink.cjs --check`：错误 15 条，全是“已批准的剧本被改动”（我的 7 份＋别的子任务 8 份），没有别的错误。临时副本（只含我的改动、全部登记）编译通过，路线覆盖无漏句。
- `python3 tools_docs/story_lint.py`（读临时副本导出的总表）：需处理 0；我改的句子只剩一条原有长句提示（E2-01，未改）。
- `node tools_scene/qihe/check_story_hooks.cjs`：错误 0，警告 2（原有）。
- 测试（新 js 与原 js 对照）：`qihe-journal`、`qihe-journal-notices`、`shared-insight-pool`、`verify_prologue`、`verify_menu_fix`、`verify_saves`、`verify_startup`、`verify_interactions` 与基线相同，全过。`verify_outsiders`、`verify_chapter` 现在失败、`verify_expansion` 由 75 项变 72 项——换回原版 `qihe-map-trial.js` 后结果完全一样，原因是同时段 `qihe-outsiders.js`／`qihe-expansion.js` 被开发一改动（18:53 起），不是本轮造成的。`qihe-journal-browser` 基线就失败（布局断言 264≠220），现在因同一原因失败在任务条数（1≠2）；`qihe-journal-notices-browser` 基线运行超过 15 分钟未结束，已停掉，没有对比。
- 浏览器：8792，Playwright 无头 Chromium 1248，一次性上下文（不碰玩家存档），脚本 `evidence/2026-10-23-zhoushen-errands/walk.cjs`，日志 `walk-log.txt`。
  - 现状段（运行时读编译产物，改稿没批准、不进构建，所以对白还是旧的三件分开接）：`01`、`02` 江湖行记“下一步”已显示“替周婶跑一圈（可不做）”及还差哪几处，左栏任务仍是三条（journal.js 未改）；`04` 旧台词旁听。
  - 预览段（只在这个上下文里注入临时副本编译出的改稿）：`05` 一次托付、`07`～`10` 三处听或不听与旁听、`11` 待交差、`12` 交差、`13` 已办完（金创药 1）、`14` 过夜三处都说了。
- 页面报错：无。预览截图里对白背后还留着江湖行记的画面：脚本按 Esc 关了面板（`panel.hidden` 为真），画面却没重画。这是脚本截图的问题，不影响读对白和选项。

## 时间线依赖（要开发一配合）

拜帖开头“药棚门口那回，你也在”与旧货账“上回叶姑娘领你来问罐子”**只在托付后移之后才成立**：徐令仪的托付须在《徐令仪上门》之后（第二天白天起，halfDay≥2 且 `xu-meeting` 已发生），岑霜的托付须在《装卸路》之后（halfDay≥4）；第一夜三方三人不上图。`qihe-outsiders.js` check() 不再借 `heard.*`。开发一落地前不要 --approve 这两份。

## 未完成

- 任务面板一条三步：等主会话决定是否套用 journal.js 补丁。
- `verify_prologue` 第二条断言“三件都做完不发东西”在改稿批准后会因金创药失败，需随之改。
- `minimax_actors.py` 默认模型改成 MiniMax-M3。

提交：未提交。发布：未发布。--approve：未做（待用户过目）。changelist：未改（主会话登记）。
