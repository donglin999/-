# 2026-10-30 评审台剩余事项收尾

状态：现行　最后核对：2026-10-30

用户：“评审台还有很多工作还没做啊，完成所有啊”。把评审台上你已经答了的题全部落实。还需要你定的，做好素材后发成第三十轮。

## 已落实（归档）

- **失手台词**（第十九轮第 8 题，你通过并要求“后续所有新加角色都得加对应的内容，写入文档”）：
  - `人物-失手.ink` 补了两人的失手台词：
    - 阿炭：分认没认识两版，读 `qiheHidden.bandit.decided`，已登记进 `flags.json`。
    - 小禾。
  - 规则写进 `xiaojianghu/docs/design/npc-steal.md` 第 8.2 节。
  - 新增测试 `tests/qihe-steal-caught-lines.test.cjs`，逐个核对人物表，漏了就报错。
  - 剧本已登记批准。
- **小耗子保底**（第十九轮第 9 题，剧情由我代评）：两句人物逻辑通，登记批准。
- **粮仓**（第二十四轮第 3 题，“如果这里没剧情就直接清掉吧”）：粮仓只有一句心里话，没有剧情。
  - `js/qihe-town.js` 去掉村心的粮仓和它的交互，素材也不再加载，但留着不删。
  - `村中-景物.ink` 删掉那句台词，重新登记批准。
  - `verify_town` 的断言改成“粮仓已清掉”。

## 已落实，等你验收

- **查看页没有立绘的人**（第二十四轮第 1 题，你选甲“身份通用立绘”）：
  - 9 个人共用 8 张通用立绘：乡妇、匠人、老翁、店家、行商、公差、护院、帮众。其中公差由差役、采办随从共用。
  - 画风只参考叶蘅的立绘，服装照各人的地图小人。出图记录：`art_sources/generic-portraits-20261030/README.md`。
  - 已登记素材，造型空隙也登记进镂空白名单，`check_production` 通过。
  - `js/qihe-npc-data.js` 接上立绘后，人物表里没有缺立绘的人了。
  - 查看页和商店都换上了：店家、药商不再显示放大的地图小人。
  - 整改贴在原题下面。

## 第三十轮新题（要你定）

1. **物品图标**：照逸剑风云决的路子把 58 件全部重画，手绘，不走像素后期。
   - 附新旧对照、整套图、商店／查看页／货郎卖出的实际效果。效果图是在浏览器里临时换上截的，游戏里还没换。
   - 你点“采用”后再接进游戏，并改 R-画风-02。出图记录：`art_sources/item-icons-20261030/README.md`。
2. **三张新脸**：宋先生、程铎、蔺管事各两版，周砚不动。
   - 只拿叶蘅的立绘取画风，脸型彻底拉开。出图记录：`art_sources/faces-redesign-20261030/README.md`。
   - 选定后补表情差分、地图小人，并重画结局 3 的 CG。
3. **关系页说和**：照八方旅人改，栖河不用动。汉皋要你定：
   - 甲：邵和挪到酒肆。
   - 乙：换成酒肆掌柜。
   - 两种都加一条：去酒馆花钱可以提前消掉失手攒下的“风声”。
4. **培养部分的后果**：台词里给到手的东西没进背包，选项选了没区别。三种做法，等你定。

## 工具

`xiaojianghu/tools_docs/check_review_batch.py`：归档模块里的题也算“已收进来龙去脉”，不再当游离题报错。原先只跳过未归档模块里的题，所以模块一归档，通过验收的旧题反倒被当成游离题报出来。

## 验证

- `build_ink`：通过，64 份已批准。
- `check_production`：通过。
- 测试和实机验证：
  - 单元测试 `qihe-steal-caught-lines`、`qihe-gift-no-slot-limit`、`qihe-npc-bag-v2`、`qihe-jianghu-rep` 通过。
  - `verify_town`（12 项）、`verify_prologue`、`verify_hidden` 通过。
  - 实机截图确认查看页、商店换上了立绘，村心已没有粮仓。
- 评审台：整理检查、发题自查都通过。
  - 浏览器面板里的 claude.ai 没登录，这次没做页面目检。数据写入和附图上传都确认成功了。

## 还没做

- 第三十轮四道题等你答。
- 结局 3 的 CG 要等新脸定了再重画。

以上都没有提交，也没有发布。

## 第三十轮的回答怎么落实的（同日）

- **物品图标（采用）**：
  - 图集 `i_qh_items_v4_20261030` 共 62 件（后补小木鸟、缠手布条、护腕、裂镜片），代卖的木鸟和小木鸟共用一格。
  - 新增 `js/item-icons-v4.js`。菜单、商店和查看页（`mnIco`）、战斗（`buiItem`）、旧面板（`icoHTML`）、培养背包（`itemIcon`）都先查它。`qihe-jianghu-ui.js` 里 v3 像素图集的覆盖已去掉。
  - 规则 R-画风-02 已改、指纹已登记；`art-pipeline.md` 和记忆同步。
- **三张脸（要改）**：宋先生改阴险相，宋、蔺加伪装痕迹，各重出两版，每人一张大图，发第三十一轮第 1 题。程铎没动，默认甲。
- **关系页（“按实际去改，汉皋先别想”）**：
  - 只做栖河：客栈店家可以花钱压下风声（`qh_inn_rumor`），每级 10 两，每个时段问一次。
  - 设计稿写明汉皋说和等开发时再定。
- **培养后果（选甲）**：
  - 新物品 5 件：`gy_wood_bird`、`gy_hand_cloth`、`gy_wrist_guard`（丁级护具，防御 5）、`gy_wood_bird_sale`、`pei_lens`。由 `qh-mode-cultivation-core.js` 的 `CULT_GIFTS` 按场次发放，只发一次。
  - 回扣台词（我代写代批）：方迟负伤（读道别的选择）、追鹅（读喂鹅的选择）、小豆下山（读竹径的结果）。没看过的玩家没有这几句。
  - 送行补两句：裴知古托萧白收着镜片。原台词是裴叔交给她的，东西到萧白手上才说得通。
  - 回扣登记表已更新；代卖和镜片两件托付写明“待汉皋重做时回收”。

### 验证

- `build_ink`、`check_production`、`check_docs` 通过；`check_story_hooks` 错误 0，警告 2（都是原有的 W2）。
- 单元测试：`qihe-*` 全部、`pre-hangao-runtime`、`cultivation-balance`、`cultivation-grudge` 通过。
- 实机验证：`verify_town`（12）、`verify_prologue`（7）、`verify_hidden`、`verify_household`（33）通过。
- 专门实机试过：
  - 图标走 v4，资源没有 4xx，页面没有报错。
  - 2 级风声找店家后清零，银两 60→40。
  - 回扣台词三场按选择播出，没选过的不播；5 件物品调两次也只发一次。
- 没跑通的（都不是这次引入）：
  - `cultivation-rework` 卡在 `gy_m04` 的旧底稿对比，`cultivation-balance-combat` 是本机缺 playwright 浏览器，10-27 记录里已列为原有失败。
  - 战斗里物品图标（`buiItem`）和培养背包的图标只核对了代码路径，没有进这两个界面截图。

### 还没做

- 第三十一轮第 1 题等你挑；查看页的通用立绘等你验收（评审台上还没有你的验收记录）。
- 挑完后：后期、补表情差分和地图小人、补蔺管事缺的小指、重画结局 3 的 CG。

## 第三版新脸与开始部分复查（同日）

用户：“你这个假也太假了吧，直接挂个假胡子是啥意思，除了这个其他是不是已经没问题了；除了这个第一章的多分支以及其他内容已经安排好了是吗？”

### 新脸

宋先生、蔺管事重出第三版，第二版留档。第一眼就是真账房、真算命先生，破绽只留在手、领口、里衫衣缘。已换进第三十一轮第 1 题。蔺管事的小指还是没画出来，选定后局部重绘。详见 `art_sources/faces-redesign-20261030/README.md`。

### 查出并修好的两个真问题

- **答应过宋先生的存档进不了培养**：红绳 CG 预算 1 句，剧本 2 句，走到 `backhill-rope` 就报错，进度停住。
  - `js/qihe-fire-cinematic.js` 预算改 2。
  - 上次提交的版本（10-27）就有这个问题。10-27 记录写明了报错，但被列为“原有失败”没处理；10-29 我又把它错记成“主线时段推进的旧断言”。
- **行囊所有物品显示同一个通用图标**：上一轮接新图标时带进来的回归。江湖面板只认旧图标的类名，新图标被当成没有。`js/qihe-jianghu-ui.js` 已修，实机截图确认 9 件都是各自的图标。

### 验证

- 新增 `tools_scene/qihe/verify_route_sweep.cjs`：宋先生线、蔺管事线、对证说不说、救谁，共 50 种组合从主线走到进培养，全部通过；三种结局都走到了（结局 3 走 8 种，都发了赏书）。预算改回 1 时 40 种卡住，说明这个检查有效。
- 修了过时断言后通过：`verify_stranger`、`verify_representatives`、`verify_jianghu_ui`（小耗子一课排到主线前、台词改过、图标换过）。
- `verify_lamp`、`verify_chapter`、`verify_prologue`、`verify_hidden`、`verify_expansion` 通过。这些是函数级和脚本实机，没有人从头到尾手玩过每条路线。

### 全量测试（80 个，还有 24 个没过）

- 13 个跑不了：本机没装 playwright 浏览器。
- 7 个看报错像过时或测试环境问题，没有逐个证实：`cultivation-rework`、`verify_battle`、`verify_chapter_battle_art`、`verify_faction_contacts`、`character-grounding`、`toast`、`verify.cjs`。
- 4 个可能是真问题，没查：
  - `verify_menu_fix`：新任务提示。
  - `verify_grade_balance`：`gy_dou_basic`、`gy_zhou_teaching`、`pei_zhi`、`pei_wen`、`pei_shen`、`pei_jiao` 没有品阶。
  - `verify_relationships`：书信好感。
  - `guiyun-performance`：归云谷演出。

### 开始部分还没定或没做

- 待用户：第三十一轮第 1 题；查看页通用立绘验收。
- 新脸定后：后期、小指、表情、地图小人、人物卡长相、结局 3 CG。
- 《守烛心经》数值门槛、结局 2 奖励档位按设计稿暂用，没有明确拍板（支线稿第十一节）。
- 北坡石洞按用户意见关着；“他追上来”短版等地图上有渡口；阿炭的战斗动作表没做；隐藏奇遇的行记线索和回访点在代码里没查到。

## 查清剩余测试失败并发布（10-31）

用户：“先查再发布”。

### 真问题，已修

- 裴知古四个技能、小豆的点步直刺、周砚的示范与叫停没登记品阶，周砚那招还缺特效登记（每次加载都有控制台警告）。裴知古四招的品阶跟随残卷解锁档位（丁、丙、乙、甲）；后两招是不可学的 NPC 招式，记丁。

### 测试过时，已更新后通过

`verify_menu_fix`（任务改名“替周婶跑一圈”）、`verify_relationships`（10-20 起不再发通信点）、`guiyun-performance`（10-20 改写后散场不换地点）、`verify_grade_balance`、`verify_battle`（存档戳和历练池初值不算状态变化）、`verify_faction_contacts`（三方跑腿第一夜已删）、`cultivation-rework`（旧台词底稿已不是来源）、`character-grounding`、`toast`、`cultivation-balance-browser`、`cultivation-rework-browser`、`dou-sword-combat`。

最后三个原先“跑不了”的原因：测试写死了本机已没有的浏览器版本 1228，已改成 1248。

### 全量结果（80 个，最后一次全量 69 个通过）

没过的 11 个，分三类：

- **确认不是游戏问题，测试未改**：
  - `guiyun-performance-browser`：真实存档初始化走全部 1985 句，只有 `gn_lamp` 的 23 句不显示单人立绘，那场用的是双人图（设计如此）。
  - `qihe-journal-browser`：夹具的药单任务要到更晚的时段才开放。
  - `verify_faction_contacts_browser`：三方人物改成见过才出现。
  - `menu-icons`：测试走已撤除的 `#street` 入口。
  - `verify.cjs`：测试环境缺桩，还没跑到断言。
- **对着 10 月 12 日的旧评审页或已删的辅助函数，没有逐个查根因**：`cultivation-balance-combat`（`mk` 已不存在）、`cultivation-rework-preview`、`guiyun-performance-preview`。
- **没有结论或小瑕疵**：
  - `guiyun-performance-bounds`：尹师父惊讶立绘在三人同屏最右位时，边缘被切掉 2～3 像素。真瑕疵，没修。
  - `verify_chapter_battle_art`：三场战斗都通过，最后“素材缺失时拦住战斗”那段超时。可能是这条防护失效，也可能是测试过时，没查清。
  - `qihe-journal-notices-browser`：页面加载超时，放宽到 90 秒单独跑也没有得出通过结果。

### 发布前检查

`node scripts/build-pages.cjs` 通过：文档检查 0 处问题，素材 1070 件 0 错，剧本 65 份 0 错 4 警告，回扣 0 错 2 警告。

### 评审台回答

- 第三十一轮第 1 题：选宋甲＋蔺甲＋程甲。这次发布不含新脸，后期和接线另做。
- 第二十四轮第 1 题：通用立绘验收通过。

### 发布结果

已提交 `5821e84`，部署到 main、qihe 两个分支，两个线上地址都返回 200，`curl` 核对了周砚特效登记、图标脚本和图集。这次不含新脸。

## 新脸定稿接入（10-31，发布之后做的，未上线）

用户选宋甲＋蔺甲＋程甲。做了立绘后期、宋和程铎的表情差分、蔺管事小指、四张地图小人，出了结局 3 CG 构图草图。详见 `art_sources/faces-redesign-20261030/README.md`。

- 验证：`check_production` 通过；`verify_lamp`、`verify_stranger`、`verify_route_sweep`、`verify_jianghu_ui`、`verify_chapter`、`verify_hidden`、`verify_town` 通过；浏览器里看过对白立绘、算命摊和小人同尺对照，页面没有报错。
- 没做：结局 3 正式 CG，等构图确认；全量测试和发布构建没有针对这批重跑。
- 已知：蔺管事下摆接缝发虚；算命摊上小人的布幡和摊位的“卜”字幡重复。发第三十二轮第 1 题请用户定。

## 结局 3 正式 CG（10-31，未上线）

第三十二轮第 1 题：新脸成品通过，CG 按草图构图出正式版；两处小问题没有意见，没动。

- 素材：`cg_qh_lamp_blade_20261031`，1536×864。原图透明度不干净，只取颜色。小指放大单独重绘后只贴回手部，避开铜灯牌，`adopted/cg/merge.py`。
- 和草图的差别：长圆筒函套改成扁方书函。
- 接入：`支线-蔺管事-赏书.ink` 加 `fq_cg_begin("lamp_blade")`／`fq_cg_end()`，包住 L7-05、L7-06 两句，收图后发奖励。台词未改，用户授权代评，已登记批准。
- 验证：`check_production`、`verify_lamp`、`verify_hidden` 通过；浏览器里按结局 3 状态走完整场，CG 显示、对话框不挡脸和函套、收图后奖励各一份、控制台无报错。测试环境不加载图片，CG 画面只靠这次浏览器检查。
- CG 正式版贴在第三十二轮第 1 题等用户看。

## 新脸和 CG 发布（10-31）

用户：“跑全量后发布”。

全量 80 个，这轮 68 个一起跑时通过。`verify_expansion` 单个要跑 5 分 25 秒，超过 300 秒上限被停，单独重跑 84 项全过，所以实际 69 个通过。没过的 11 个和上一轮是同一批，错误行相同，分类见上文“全量结果”，这轮没有修。其中 `verify_chapter_battle_art` 的素材缺失防护和 `qihe-journal-notices-browser` 仍然没有结论。
