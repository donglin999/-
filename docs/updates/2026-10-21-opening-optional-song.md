# 2026-10-21 开始部分评审：宋先生线改为可选、删两项划水活动

状态：现行　最后核对：2026-10-21

## 需求

用户：“按照现有逻辑再去评审第一章的所有台词和剧情安排，因为有一些任务是完全没有必要的，没有帮助引导操作，也没有剧情推进，纯纯划水；然后有些剧情即使没有前置接受，后续我还是可以接受其后续的任务，然后角色台词还是会按照我接受的情况去响应，就是后山的那段剧情，不仅仅做进了主线，而且无论我做不做都会被人认为是卧底观察情况，太离谱了。”

（剧情只分四部分，这里的“第一章”指开始部分：序章、第一夜、风起栖河、三方。）

评审后用户选定：宋先生线“改成可选，可拒绝”；划水任务删“整理旧屋”“村口问讯”。另两项（主线“先找人再确认”、商量去处的两个“暂未开放”选项）用户没选，保持不动。

## 评审结论

后山宋先生线的问题出在 `js/qihe-chapter.js`：
- `mainStep()` 只要宋先生有一段没看，就把它当成主线下一步；`mainOffer()` 在这之前一律不放行；`rest()` 还会把没看的那段自动补播。等于强制。
- 竹匾那场两个选项都是答应，没有拒绝。
- 装卸路、对证里“这两天在路口数人的，是你吧”只看 `events['c1-00b']`（见没见过他），而这段又是强制的，所以每个玩家都被岑霜、沈雁回当成眼线。

划水的两项村中活动：
- 整理旧屋：抄笔记／包东西两个选项什么都不影响（`recordOnly`，无奖励、无回扣），内容和第一夜“收药箱”、主线“收拾药箱”重复，同一口箱子收了三遍。
- 村口问讯：问周砚的内容和徐令仪上门那场重复（周砚已自报是叶父旧友），问沈雁回的内容和装卸路、药单跑腿重复。

## 改动

设计文档（先改）：
- `xiaojianghu/docs/design/opening-pei-disguise.md`：时段与站位改为可选、可拒绝；计划落空原因分两条路线写；`stranger_deal` 增加 declined。
- `xiaojianghu/docs/design/opening-state.md`：删 relic_help、inquiry 两行；`stranger_deal` 与“人物知道什么”按可选改写。
- `xiaojianghu/docs/design/registry/story-hooks.json`：登记 `c1-00b`（门槛：答应过；中分支：装卸路、对证；小分支：起火前心里话、红绳）。

剧本（ink，用户确认后已 `--approve`）：
- 风起-竹匾：去掉补播句；加“这事我不掺和”，问过“为什么不自己说”后也能“那还是算了”；拒绝一支 C1-00B-C1～C4，不给谢礼。
- 风起-后山回话一／二：去掉补播句（C1-S1-00、C1-S2-00）。
- 风起-宋先生闲话：拒绝过的玩家听到 C1-S-idle-03。
- 风起-次日药摊：周婶托竹匾改成“得空就替我跑一趟，不急”。
- 风起-主线找人：删 `fq_main_pre`（C1-M-pre-*，把后山当主线前置的那段）。
- 风起-随口一句：`fq_zhou_after_inquiry` 改为 `fq_zhou_idle`，没在药棚门口见过叶蘅时多一句 C1-Z-idle-01。
- 三方-装卸路、三方-对证：只改注释，`watched` 参数的含义改为“答应过”。
- 归档：风起-整理旧屋、风起-村口问讯（连同批准快照、路线导出、fq_main_pre 路线导出）移入 `luotuozhuan/_attic/2026-10-21-opening-trim/`，有 manifest.json、restore.sh；approved.json 与 flags 删去的条目存在同目录 removed-registry-entries.json。

代码：
- `js/qihe-chapter.js`：宋先生三段只在各自上午出现；后两段只以“答应过”为门槛（不以前一段为前置）；删掉主线前置、确认拦截、补播和 `atLog`；红绳只在答应过时播；activities 删两项；周砚搭话改走 `fq_zhou_idle`；导出 `strangerAccepted`；删掉不再用的 `fq_track`。
- `js/qihe-representatives.js`：装卸路、对证的 `watched` 改看 `strangerAccepted`。
- `js/qihe-menu.js`：宋先生记录挪到“支线”，标“可选”，拒绝过的写“萧白没答应”；村中活动地点表删两项。
- `js/qihe-navigation.js`：行程指引不再把后山排在最前；删两项活动的建议。
- `js/qihe-expansion.js`：自由走访阶段叶家门不再开（原来只为整理旧屋），删“获准整理的旧物”。
- `js/qihe-journal.js`：删两项活动的记录与相关的认人条件（认识沈雁回仍由装卸路那场给出）。
- `index.html`：删两个剧本数据，fq_main_pre.js 改为 fq_main_2.js，改动文件的版本号改为 20261021-trim1。
- 测试：`verify_stranger.cjs` 改测答应（含跳过第三天不补播）、拒绝、从没上山三条路线；`verify_chapter.cjs`、`verify_representatives.cjs` 按新流程改。

## 验证

- `node tools_story/build_ink.cjs`：pass，错误 0、警告 0。
- `story_lint.py --scene opening`：需处理 0；提示 43 条都是原有句子，新句没有提示。
- `check_story_hooks.cjs`：错误 0，警告 2（都是培养段原有的）。
- `verify_stranger`、`verify_chapter`、`verify_representatives`、`verify_expansion`、`verify_outsiders`、`verify_starter_equipment`、`verify_jianghu_ui`、`verify_ui_model`、`verify_saves`、`verify_prologue`、`verify_portals`、`verify_startup`、`verify_resources`、`verify_faction_contacts`、`verify_banter`、`tests/qihe-journal.test.cjs`：通过。
- `verify_relationships`：失败（第 7 行，培养模式关系数值 undefined≠2）。它只加载 `qh-mode-cultivation-core.js`、`qh-mode-cultivation-relations.js`，这两个文件本次没动，工作区里有别的未提交改动，判断与本次无关，没有处理。
- `verify_interactions`：在 “PASS chen_guest/phone” 之后挂起，和 10-20 记录的一样，是原有问题，与本次无关，被强制结束。
- `check_production.py`：pass；`check_docs.py`：0 处问题。
- 没做浏览器验收；没做子代理冷读。

## 第二轮：主线推进与任务时限

用户：“把主线每段先找叶蘅／陆衡再弹确认那一步也去掉……不能直接开始演，需要玩家确认是否过度到下一个时间段，但是不提示还有什么没做，然后任务也是有时限的，不然就永远挂在那里了。”

设计先写进 `xiaojianghu/docs/design/opening-state.md` 新增的 2a 节（推进方式、四步主线的地点、各任务时限表；时限是设计方案，可再改）。

改动：
- `js/qihe-chapter.js`：`MAIN_STEPS` 加 `scene`；走进该场景就弹“进入下一时段：<标题>”，选“再等等”记 `mainDismissed`，本时段不再自动弹；剧情演出途中换场不弹。找对应的人说话，她先说一句再弹确认，选“再等等”且相关活动还开着，就接着问要不要做那件活动。确认框删掉“还有 N 件没做”，只在离村那步说“离村后就不能再回村里了”。第三步改为“回叶家收拾药箱 · 村西北叶家”。activities 加时限（学棍、修车、药棚 halfDay<4；集市 <5），过时播 `fq_act_late`；导出 `activityOpen`、`activityDeadline`。
- `js/qihe-outsiders.js`：三方跑腿加时限（拜帖 <2，旧货账、药单 <4）；过时不能再接、不能再查，任务里写“过了时限没办成”；进行中的写出时限。导出 `questOpen`。
- `js/qihe-representatives.js`：过时后三方不再问“有什么要帮忙的”。
- `js/qihe-menu.js`：村中活动写时限，过时标“错过了时候，没办成”（closed）。`js/qihe-navigation.js`：只推荐还开着的活动。`js/qihe-journal.js`：过时没办成的跑腿不再列出（同撤离后）。
- `js/qihe-expansion.js`：第三天上午叶蘅在家（叶家门打开，和她说话走主线）；第三天上午陆衡去邻村催车，西田埂不见他。
- 剧本：风起-主线找人四段只剩一句、不带选项（C1-M-2-01 改为“傍晚有几个生人要来”，C1-M-5-01 改为在叶家说“你来了”）；风起-随口一句加 `fq_act_late`。两份已批准剧本改动按用户这次要求登记批准。
- 测试：`verify_chapter` 加“走进地点弹确认／再等等不重复／不列没做的事／时限／离村提醒”一段；`verify_stranger`、`verify_representatives` 按少一个选项改序号。
- `index.html`：改动文件版本号改为 20261021-trim2。

验证（第二轮）：build_ink pass；story_lint 需处理 0（提示 43 为原有）；check_story_hooks 错误 0；check_docs、check_production pass；verify_stranger、verify_chapter（含新用例）、verify_representatives、verify_outsiders（加了跑腿时限用例）、verify_expansion（75 项）、verify_resources（22 项）、verify_faction_contacts、verify_prologue、verify_saves、verify_jianghu_ui、verify_ui_model、verify_starter_equipment、verify_portals、verify_startup、verify_banter、tests/qihe-journal.test.cjs 通过。verify_expansion、verify_resources 一开始只跑了一部分就静默退出：测试把进度放在第二天，切场景时弹出了新的主线确认、测试没接选择；已在这两份测试里先记成“本时段已选再等等”。没做浏览器验收。

## 未完成项（评审发现、本次没改）

- 商量去处里两个“暂未开放”选项仍在。
- 药棚帮忙（分药包）里叶蘅提到“母亲的旧东西”小纸包、收拾药箱选“要不要告诉周先生”，后面都没有下文。
- 旧存档：已做过整理旧屋／村口问讯的，江湖经历里不再显示这两条活动记录。

提交：未提交。发布：未发布。
