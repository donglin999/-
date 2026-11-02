# 汉皋前培养排查与师承功法线（2026-11-02）

状态：本地完成；未提交、未发布。

用户：“汉皋前的培养的阶段全部都排查好了吗？现在这个阶段的闲逛剧情还是偏少，需要你根据实际需要补充一下别的可入队角色的一些剧情去完善，还有一些功法的学习内容也是需要补充，现在汉皋前可学习的功法和路子太少了，补充一些（培养阶段）（师母、两位师叔都应该一些闲逛剧情去学习他们独特的功法的，然后随着学习的程度提高，可以继续推进他们的关系剧情同时获得更好的武功等等。”

排查结果、缺口表、结构和数值都在负责文档：[师承功法线](../../../xiaojianghu/docs/design/cultivation-mentor-lines.md)。

## 改了什么

- 新增 12 场闲逛（`js/qh-mode-cultivation-mentors.js`）：师母、二师叔、小师叔各 3 场学艺；叶蘅《两种针》、陆衡《捆行李》、殷红缨《赊酒》。
- 新增 9 门功法（`js/qh-mode-cultivation-library.js` 末段）：《点绛针法》《锁云针法》《遮山手》《沉岳拳》《三响拳》《担雪诀》《绕岚剑》《分岚剑》《知还步》。第二、三步按练功重数开。
- `js/qh-mode-cultivation-balance.js`：本人亲授门槛、前五月封顶、针路经验。`-core.js`：`artNeed` 门槛、师承另算额度、铜针囊和桃木剑发放。`-growth.js`：暗器造诣。`-relations.js`：江采薇、钟拙第二道门加替代条件，汉皋前走得到。`-household.js`：接入，《出门的家伙》加一句回扣。`qh-mode-cultivation.js`：日程只提示现在能学的师承，结果面板写“学会《X》”。
- 文档：[师承功法线](../../../xiaojianghu/docs/design/cultivation-mentor-lines.md)新增；回扣登记表登记 12 段；定稿事实 F-0072～F-0074。
- 测试：新增 `tests/cultivation-mentors.test.cjs`。`tools_scene/qihe/verify_household.cjs` 改了三处：年度遍历和“不压行程月”不算师承；汉皋前闲逛比例上限放宽到 1.0（这段 18/19）；节奏检查改成直接开最快到期的一段，不走随机抽取，否则第一段没余量时会随机漏。

## 剧情三道关（R-剧情-01）

- 戏眼卡 48 段，演员法 3 个备选，模型 302 的 `claude-opus-5-5`。**302 主密钥 `AI302_API_KEY` 返回 401**，这次用备用密钥 `AI302_API_KEY_BACKUP`（与生图入口的备用约定一致），主密钥需要用户看一下。
- 主会话剪辑。冷读子代理查出的问题已改：刻痕三千天和“三年”对不上、赊酒没赊到却问“这酒”、“伤了不报才不教”逻辑说反、“别告诉谁”的梗用了五次（减到三次）、家规“第二条”开篇没有编号、知古此时未必认识。《捆行李》《两种针》路线导出工具没带上，冷读没读到，由主会话自己审读。
- 按代评授权（2026-10-29）定稿，写进评审台 log。
- 外部模型“逻辑初筛”（`minimax_logic_review.py`）只收 ink 剧本，这批在 JS 里，没跑。

## 验证

| 检查 | 结果 |
| --- | --- |
| `tests/cultivation-mentors.test.cjs` | 10 项通过 |
| `verify_household.cjs` | 33 项通过 |
| `check_story_hooks.cjs` | 错误 0，警告 2（`gs_snow_roof`、`gy_yin_bond`，改动前就有） |
| `cultivation-balance`、`cultivation-rework`、`pre-hangao-runtime`、`cultivation-grudge`、`guiyun-performance` | 通过 |
| `cultivation-balance-browser`、`cultivation-rework-browser`、`dou-sword-combat` | 通过 |
| `guiyun-performance-browser` | **失败**，缺立绘项只有 `gn_lamp`、`hg_aftercare`，新场次全部走过没有缺失。`gn_lamp` 是旧问题（见 10-30 记录）；`hg_aftercare` 这次才看到，那场和信件有关，本轮没碰，未查根因 |
| `cultivation-balance-combat` | **失败**，`mk is not defined`，旧问题（见 10-30 记录） |
| `story_lint.py` 12 场 | 需处理 0，提示 5 |
| 实机（8792，内置浏览器） | 造第 3 月存档：《穿不过的针眼》学会《点绛针法》、发铜针囊，结果面板正确；招式栏练功经验和暗器造诣入账；《手上的口子》到三重才开；真实入口打二师叔试手，持针动作组、点腕针看破、锁边三针削盾 3、肩肘掌都生效；武学页九门都在；《担雪诀》可改主修，气血 114→116；控制台无错 |

实测抓到并修了一处：页面里 `mentors.js` 先于数值模块加载，学功法时报错；Node 测试测不出来。

本轮没查全量 80 个测试，只跑上面相关的。

## 第二轮：徐令仪、岑霜、沈雁回

用户：“汉皋前的角色互动除了知古一家，应该包含第一章的出现的那三个人物的剧情”；“设计的时候需要考虑哪三个人物如何在闲逛的时候碰到，会比较好，可以参考下侠客风云传的那个闲逛事务表，看下需要多少次单独的闲逛才可以把一个角色的剧情走完”；“你可以比对一下事件安排的，因为侠客风云传里面也是有类似的安排，在一段时间后就带着人物去历练了，也是在那个时候和大多数可入队角色认识的”。

比对结果和排期写在[师承功法线](../../../xiaojianghu/docs/design/cultivation-mentor-lines.md)第三点五节。三人汉皋前各 2 次当面、3 封书信；其余 12 位放到汉皋及之后，撤回给苏芷等人出图的提议。

- **已能玩**：书信。`-relations.js` 加三人往来和 `letters`（按寄信次数依次回），`-core.js` 读过二月善后回信后开放、闹翻的不开，`-data.js`、`-mail.js` 加名单和头像。
- **写好接好、未开放**：6 段当面戏（`-mentors.js` 的 `repDefinitions`，`REPS_ART_READY=false`）。等立绘。开放时要：出表情、登记素材、改开关、登记回扣表，并另开冷读。这 6 段是我审的，**没跑独立冷读**。
- **留到汉皋**：《哪天到的》《不收钱的茶》《第三手》的戏眼卡和草稿在 `art_sources/qihe-reps-q-20261102/held-scenes/`。
- **立绘候选**：`art_sources/qihe-reps-q-20261102/`，三张透明 PNG 1024×1536（提示词请求 gpt-image-2.5），未登记采用。用了 302 备用密钥。
- **定稿事实**：F-0075。
- **验证**：`cultivation-mentors` 12 项、`verify_household` 33 项、`check_story_hooks` 错误 0、`check_production` 通过；实机送信名单、头像、回信和关系入账正常，控制台无错。实测查出并修了关系门场次名写旧、邮箱头像空白。当面戏没有实机跑过，因为还没有立绘。

## 第三轮：评审台回答（第三十五轮）

用户：第 2 题选三张都能用。第 1 题没选项，意见是“不要有这个提醒，直接和之前的那个小字提醒就行了，这样太丑了；而且功法名字很离谱啊，就叫做挑水诀，太随便了，这方面命名没有规范吗？”。另说“这版 Q 版还是有点死板，什么装备都拿着，动作也很少，多一些动作差分吧（写到角色素材生成那里，按照剧情需要的时候再去补充，不用立刻生成”。

- **提醒**：去掉结果面板的大字，并进小字。
- **命名**：九门重起名，含义和同名比对写在负责文档第三点六节（人工比对，未做全文检索）。拟的命名规矩放在评审台第 1 题，**没登记**。
- **动作差分**：写进 `cultivation-q-generation-standard.md`，待补清单在批次 README，没有生成。我先加过一条规则 R-画风-06，`check_docs.py` 拦下（要用户批准），已撤回，同样放在第 1 题问。
- **立绘采用**：31 个文件进 `household-v1`，登记 `production-assets.json/.md`，发隙透明登记进 `prop-holes-allow.json`（亮底看过全部，状态 reviewed）。朝左版是生成的，翻转后请模型改回右衽。用 302 备用密钥。
- **当面戏打开**：`REPS_ART_READY=true`，实机 6 段走完，立绘全部加载，控制台无错。《照价赔》挪到谷口。
- **冷读**：独立冷读后改了岑霜几句带撩拨味的话（称呼统一成开始部分的“小兄弟”）、徐令仪一句自相矛盾、沈雁回独白接不上、回信里几处重复。它不了解开始部分而报的“程巡检、乌魁、第三日”没改。
- **验证**：`cultivation-mentors` 12 项、`verify_household` 33 项、`check_story_hooks` 错误 0、`cultivation-balance`、`cultivation-rework`、`pre-hangao-runtime`、`guiyun-performance`、`cultivation-grudge`、`save-recovery` 及三个浏览器测试都通过，`check_production`、`check_docs` 通过。`guiyun-performance-browser` 这次退出码 0，上轮是 1，没查为什么变了。`cultivation-balance-combat` 这轮没跑。评审台页面仍未亲眼看（内置浏览器未登录）。

## 未做与待拍板

- 评审台第 1 题用户点了满意，选项没选：提醒和命名定了；学艺另算额度、丙级提前按现方案继续，九招先用通用特效。两条规矩用户在对话里批准（“登记这两条”），已登记为 R-命名-01、R-画风-06。两题都已收起，模块归档。


- 评审台第三十五轮第 2 题已改成三人的 Q 版立绘（同样没在页面上看过，理由同下）。


- 评审台第三十五轮已发两题：师承线的玩法和数值（含九招要不要做专属特效）、三人立绘。`check_review_batch.py`、`review_desk_tidy.py` 通过；**R-评审-01 要求的页面检查没做**：内置浏览器未登录 claude.ai，图片和选项的显示没有亲眼看过。
- 汉皋后的乙级第四门和补学、`gy_goose_steps` 衔接、`hg_pack_review` 只学针路时的台词，见负责文档第四节。
- 未提交、未发布。
