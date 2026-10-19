# 2026-10-08 开篇修订同步：乔装账房「宋先生」与不在箱里的遗物

## 用户需求与已确认方案

- 用户在文档库确认第一章修订：正道盟执事裴嵩乔装成账房「宋先生」，在后山托萧白打探三方；萧白的打探反而让三方互疑、不敢先强取。三件遗产不在叶蘅手中，她只有父亲笔记、母亲药签和夹层空压痕三样线索，交不出来所以离村。
- 依据：`../xiaojianghu/docs/design/opening-pei-disguise.md`，逐句对白见文档库 `chapter1-village.md`、`chapter1-pressure.md`、`chapter1-fire.md`、`chapter1-mountain.md`。
- 用户明确要求：复用 8792 现有后山地图 `qh_north`（底图 `m_qh_north`），不新建地图；宋先生暂无素材，用占位，不生图。

## 工作区、运行入口

- 工作区 `xiaojianghu-legacy-prologue`，固定入口 `http://127.0.0.1:8792/#qihe-map`。浏览器验收时 8792 已由另一会话按 `scripts/serve-current.py` 启动，本次直接打开该地址，未另起端口。

## 核对的设计页和正式素材条目

- 文档库：上述修订依据与四份第一章剧本；`chapter1-activities.md`（C1-A1、C1-A3 措辞）。
- 本工作区：`docs/design/qihe-map/expansion/story.md`、`docs/design/qihe-map/three-representatives.md`、`AGENTS.md`、`docs/update-workflow.md`。
- （本段为首轮状态，已由「追加二」替换）素材：未新增、未替换正式素材。宋先生占位用已登记的旧路人精灵 `s_merchant`（运行键 `c_merchant`，栖河其他人物未使用）。

## 实际修改与文档同步

设计页：`docs/design/qihe-map/expansion/story.md` 新增「2026-10-08 乔装账房与不在箱里的遗物」一节（落地边界、记录字段、占位说明），火灾段遗物措辞同步；`three-representatives.md` 加修订指引。

代码（这些文件在 git 中原本就是未跟踪状态，本次只做以下改动）：

| 文件 | 改动 |
| --- | --- |
| `js/qihe-chapter.js` | `C1-00` 末加周婶托收竹匾（N03–N05）；新增 `C1-00B`、`C1-S1`、`C1-S2` 三场与补播逻辑：任务页「继续主线」确认框弹出前，若本时段那一场未看，先切到后山倒木旁补播；三场都不推进 `halfDay`。`C1-03` 整场改为翻开夹层（含 A/B 两支与陆衡按准备的三种回话）。`C1-10` 红绳旁白在章末进山居前播放（按 `told_about_stranger` 两支）。邻村清点、叶蘅交谈、辞别、对证记录摘要改为笔记／药签／空压痕；`C1-A1`、`C1-A3` 的「药样」「残谱、药样和玉匣」改为母亲的小纸包、父亲笔记和旧针囊。周砚问讯在西田埂时不再切去陈伯家。 |
| `js/qihe-representatives.js` | `C1-01` N02（徐多看萧白一眼、护院改看侧门）；`C1-02` N10–N15 与改写后的 N09；`C1-07` N25–N27、N28–N34 外乡人段落与「说出宋先生／只说借住」两支，收尾改为 N24 新措辞；`C1-08` 岑、沈的善后交谈各加一句（匣子／药样不在叶蘅手里，仍要追查去向）。对证结果加 `relicsAbsent`、`strangerNamed`。 |
| `js/qihe-expansion.js` | 后山倒木南侧加「宋先生」（870,300）与「周婶的竹匾」（950,305）；西田埂加周砚（1010,600），第二、三日（`halfDay` 2、4）显示，陈伯家的周砚同时隐藏。 |
| `js/qihe-navigation.js` | 有待看后山场景时，任务栏与追踪指向后山：「去后山收回竹匾」「后山有人等你回话 · 不耗时间」；周砚在西田埂时问讯追踪改指西田埂。 |
| `js/qihe-menu.js` | J 页主线记录加「去后山收回竹匾／后山的账房 · 宋先生」；对证记录摘要加「叶家本就没有三方要的东西」及待问经手人；问讯地点随周砚站位变化。 |
| `tools_scene/qihe/verify_stranger.cjs` | 新增：主动上山、全程补播、旧档无宋先生三种路线；周砚站位；两种对证分支；红绳两支；不出现「残谱／三件旧物都在」。 |
| `tools_scene/qihe/verify_chapter.cjs`、`verify_representatives.cjs` | 新增的对证选项会占用预设选择序列，相应补一位；取消主线测试改为断言补播后仍保留已看。主事人测试加两支分支与旧措辞断言。 |

新增记录（`S.qiheChapter.records`）：`stranger_deal`（accepted／asked_first）、`stranger_report`（full／partial）、`stranger_told_departure`（布尔）、`told_about_stranger`（布尔），另有 `basket`。`C1-03` 选择记在 `S.qiheChapter.packing`。都不改变主线能否推进，不发奖励。

旧存档：已过某时段且没看过前一场的存档，不补后续场，也不播 C1-02 疑眼线段、C1-07 外乡人段落和红绳，主线照常可达。

## 采用、替换、弃用及原因

- 未采用新素材，未替换任何正式文件，未生图。
- （本段为首轮状态，已由「追加二」替换）**占位**：宋先生地图精灵暂用旧路人 `c_merchant`。他没有对话立绘：当前对话舞台只给主要人物显示大立绘，配角说话时仍显示萧白立绘、名条显示「宋先生」，与周婶、药商等配角一致。他放下的包袱与账簿、`C1-10` 倒木上的红绳都没有地图道具，只在旁白里出现。正式形象（账房便装、衣领下露红绳的探索静态站／坐姿精灵与对话头像）待按角色素材规范另立需求。
- **待重画**：遗物静物 CG `chapter1_relics.webp` 需重画为「夹层只有笔记、药签与空压痕」。该图只在文档库 `xiaojianghu/assets/` 中（另有 `chapter1_relics_v2.webp`），8792 运行代码和正式清单都没有引用，本次只登记待重画，不替换。

## 验证命令、结果、证据

函数测试（本地引擎 VM，不等于浏览器验收）：

```bash
node tools_scene/qihe/verify_stranger.cjs        # 3 组 PASS
node tools_scene/qihe/verify_chapter.cjs         # 全部 PASS
node tools_scene/qihe/verify_expansion.cjs       # SUMMARY 76 passed
node tools_scene/qihe/verify_portals.cjs         # PASS
node tools_scene/qihe/verify_outsiders.cjs       # PASS
node tools_scene/qihe/verify_interactions.cjs    # PASS
node tools_scene/qihe/verify_prologue.cjs        # issues: []
node tools_scene/qihe/check_visibility.cjs、verify_jianghu_ui.cjs、verify_starter_equipment.cjs、verify_ui_model.cjs  # exit 0
python3 tools_assets/check_production.py         # {"status": "pass", "assets_checked": 614, "errors": []}
```

`verify_representatives.cjs` **在仓库中仍失败**，且失败与本次无关：它期望去向选择后停在 `ended`，而 2026-10-07 起章末自动进入培养，测试环境缺 `insertAdjacentHTML` 报错。已用本次改动前的代码副本复现同一行失败。另在临时目录用「只把该旧期望改成 `cultivation` 并跳过培养界面」的副本运行，全部 6 组 PASS（含本次新加的分支与措辞断言）；仓库里的那行旧期望未改。

浏览器实机（8792，独立 journey 存档，用脚本跳过序章，从 `C1-00` 起走）：

- 已验证：`C1-00` 末周婶托付，任务栏显示「去后山收回竹匾 · 不耗时间」；在后山拾竹匾触发 `C1-00B`，选「您为什么不自己去说？」，竹匾消失、`halfDay` 不变；宋先生闲聊台词；`C1-01` N02；第二日任务栏「后山有人等你回话」、周砚在西田埂 (1010,600)、陈伯家无周砚；主动回话 `C1-S1`（如实全说）；`C1-02` N10–N15、N09；第三日不上山直接继续主线，自动切到后山补播 `C1-S2`（说今晚要走），确认后播新 `C1-03`（先问她打算怎么办）；村火、救陈伯、实际守路战胜利；邻村清点新措辞；`C1-07` 外乡人段落，两种分支都已播（先走「只说借住」，回到对证前存档再走「说出宋先生」）；对证记录与 J 页摘要；去向确认后辞别新措辞与 `C1-10` 红绳「他没来。」一支，进入培养。控制台无错误。
- 截图：`evidence/2026-10-08-opening-pei-disguise/01-c1-00-task-hud.jpg`（任务栏提示）、`02-c1-s2-fallback-backhill.jpg`（补播时宋先生占位坐在倒木前与选项）。
- 限制：浏览器面板处于隐藏状态时游戏帧循环暂停，角色无法实际走动；跨图用的是传送门同一函数 `QiheExpansion.go`，走到 NPC 处用的是直接设置坐标，交互用真实 E 键，「继续主线」第一次用任务页按钮，之后直接调同一函数 `QiheChapter.rest()`。对白推进与选项点击在页面内完成。
- 未在浏览器单独走：`C1-S1`「只说个大概」、`C1-S2`「说还没定」、`C1-03`「把剩下的分别包好」、红绳「未说出」一支、全程不上山路线、旧档路线。这些只由函数测试覆盖。
- 美术未验收：占位精灵的观感、与倒木的遮挡关系只看了截图，没有做正式美术验收。

## 追加：宋先生的谢礼（同日，按「第一章剧情」会话转达的用户新要求）

- 依据：文档库 `opening-pei-disguise.md`「奖励：宋先生的“谢礼”」节；对白 `chapter1-village.md` C1-00B N03–N05、C1-S1 N01–N04、C1-S2 N01–N03，`chapter1-fire.md` C1-07 SA12。诱饵一直按现稿「沿路替叶蘅打听她父亲的下落」实现，代码中没有「路引」，无需改。
- 代码：`js/qihe-chapter.js` 新增物品 `qh_song_coat`「青绫行衣」（q:2，armor 12，fx {mhp:20}，价 120）、`qh_song_abacus`「乌木算珠」（q:2，acc，fx {wil:1,wis:1,mmp:15}，价 90）与 `strangerGift`：每份只发一次，记 `records.stranger_gifts`（含经验、物品、升到的层数）；修为按 `battle.js` 胜利结算同一规则（`S.exp` 满 `S.lv*100` 升一层、`pts+3`、回满气血内力），提示「获得：… · 修为 +N」「境界突破 · 第 N 层 · 属性点 +3」。`js/qihe-representatives.js` 对证说出宋先生后播 SA12（只列出萧白仍持有的两件物品），修为 +50，物品不收走。
- 措辞差异：宋先生台词照剧本说「金疮药」，获得提示用游戏现有物品名「金创药」（`pill`）。
- （本段为首轮状态，已由「追加二」替换）占位：两件新物品没有专用图标，装备页显示通用包裹图标；未生图。
- 验证：`verify_stranger.cjs` 加断言（各份数量与修为、只说大概 +30、重复交谈不再发、第三日升到第 2 层且属性点 +3、说出后 +50 且物品仍在、只说借住无 c1-07 份、介绍不含「正道盟／裴嵩」），3 组全部 PASS；`verify_chapter`、`verify_equipment_v3`、`verify_grade_balance`、`verify_jianghu_ui`、`verify_starter_equipment`、`verify_ui_model`、`verify_expansion` 和主事人测试修正副本均通过；`check_production.py` pass。`tests/menu-icons.test.cjs` 因本机缺少它依赖的 Node 模块无法加载（MODULE_NOT_FOUND），与本次无关，未计入。
- 浏览器实机（8792，新建第一日存档）：C1-00B 获得金创药 ×2、修为 +30；C1-S1 选「只说个大概」获得青绫行衣、修为 +30；第三日补播 C1-S2 获得乌木算珠、修为 +50 并提示「境界突破 · 第 2 层 · 属性点 +3」（等级 2、属性点 3）；装备页两件均显示「乙级」，双击穿戴青绫行衣后气血上限 146。截图 `03-song-gifts-equipment.jpg`。C1-07 说出宋先生的 +50 只有函数测试覆盖，这一轮没在浏览器重走对证。

## 追加二：C1-07 说出宋先生实机补验；补齐宋先生素材与演出（同日，用户要求）

### C1-07 说出宋先生（浏览器实机）

新建第一日存档后逐段走到对证：C1-00B（谢礼）、C1-S1「只说个大概」（+30、行衣）、第三日补播 C1-S2「说还没定」（+50、算珠、升到第 2 层）、C1-03「把剩下的分别包好」、村火选「同陆衡护住药车」、守路战胜利、邻村对证选「说出后山的宋先生」。实际看到：SA01–SA11 全部台词，SA12「萧白把青绫行衣和乌木算珠放到桌上；沈只记下物件样式，不收走，东西仍归萧白。」，「获得：修为 +50」（修为 10→60，仍为第 2 层），青绫行衣仍穿在身上、乌木算珠仍在包裹，`stranger_gifts.c1-07` 记一次。核对点用的是该节点自身的交互函数（合成键盘事件在当时失效，见下方限制）。

### 新素材（批次 `art_sources/qh-song-disguise-20261008`）

生图走 `codex exec` 内置 image_gen（`gen.sh`，提示词经标准输入，均带「Model: gpt-image-2.5」行；服务端选模型，不能确认实际版本）。未使用 FlatRouter。

| 正式 ID | 用途 | 来源与处理 | 尺寸 | 人工核对 |
| --- | --- | --- | --- | --- |
| `s_qh_song_story` | 后山站姿四向（第三日） | AI 草稿只取造型配色；`draw_song.py` 逐像素手绘，`build.py` ×3 排表；以已采用管事表为比例模板 | 240×564，单元 60×141 | 黑方巾、花白鬓角、八字须、领下 1 像素红绳、托账簿；lint 无问题 |
| `s_qh_song_seated` | 后山坐姿（第一、二日） | 同上，膝上翻开账簿；`motionAnchor body 123` 保持与站姿同密度 | 240×564 | 坐在倒木前，脚底与站位一致 |
| `p_qh_song_story`、`_firm`、`_worry` | 对话立绘（按台词切换情绪） | 以已采用立绘对齐画风生成，差分以基础稿为身份参考；白底按边缘泛洪抠图 | 480×640 | 三张身份、衣装一致；领下红绳较淡 |
| `r_qh_song_basket_v1`、`r_qh_song_bundle_v1` | 竹匾拾取物、宋先生身旁包袱 | 像素道具草稿 → 网格吸附 → 按实物比例缩小（`shrink_props.py`），×2 输出 | 40×40、32×32 | 第一版过大（竹匾近一人宽），已缩到竹匾 18、包袱 13 美术像素宽 |
| `i_qh_song_gifts_v1` | 青绫行衣、乌木算珠菜单图标（栖河模块接管 `mnIco` 这两个键，未改动 `i_jianghu.webp`） | 白底透明化同 `build_menu_icons_v2` | 384×192（两格 192） | 衣襟内回纹在大图可见、菜单小图看不清 |
| `cg_qh_relics_lining_v1` | C1-03 第 05–06 句 CG「夹层里没有的东西」 | 道具特写，只出现叶蘅的手 | 1672×941 | 验收记录 `cg-relics-visual-acceptance.json`；笔记插图里有一幅人体背面经络线稿 |
| `cg_qh_backhill_rope_v1` | C1-10 N01 CG「倒木上的红绳」 | 零人物道具特写；第一版照片质感弃用（原稿保留 `codex/out/cg_rope_r1_photo.png`），第二版采用 | 1672×941 | 验收记录 `cg-rope-visual-acceptance.json` |

未采用、只留在批次里的候选：账簿、红绳地图道具（账簿已画进精灵；红绳只在 CG 中出现）。

入库：成品复制到 `assets/production/<系统>/`，`docs/assets/production-assets.json` 新增 10 条（`acceptance_status=adopted-20261008`），运行 `organize_assets.py --adopt-reviewed` 生成映射。**整理工具有副作用**：它把 98 个既有条目的 `role` 重算成默认值、并重排了 `production-assets.md`（丢掉手工的「归云谷师门（2026-10-07 采用）」小节）。我已把这 98 个 `role` 恢复为整理前的值，Markdown 恢复为整理前原文后只插入本次 10 行；`js/production-assets.js` 与整理前相比只多本次 10 项（顺序重排）。`inventory.json` 是工具生成的报告，保留重新生成的版本。

代码：`js/qihe-chapter.js` 注册精灵／立绘／道具、宋先生情绪映射、谢礼图标接管、C1-03 与 C1-10 播 CG；对话临时站位沿用宋先生当时的坐／站姿。`js/qihe-expansion.js` 宋先生节点按日切换坐／站姿，有待看场景时头顶「!」，绘制身旁包袱与竹匾。`js/qihe-fire-cinematic.js` 新增 `relics`、`rope` 两个镜头。之前的「宋先生用旧路人 `c_merchant` 占位、无立绘」已全部替换。

### 验证

- `verify_stranger.cjs` 加断言（坐／站姿切换、「!」提示、图标接管、夹层与红绳镜头播放），通过；`verify_representatives.cjs` 的 CG 顺序断言改为含 `relics`（仓库文件仍在第 9 行旧期望处失败，修正副本全部通过）；其余 13 个相关脚本通过；`check_production.py` pass（624 项）。
- 浏览器实机（8792）：后山第一日坐姿宋先生、左侧包袱、右侧竹匾、头顶「!」（`04-backhill-song-seated-props.jpg`）；C1-00B 对话中地图保持坐姿与包袱、右侧显示宋先生立绘并按台词切到 firm（`05-c1-00b-portrait-firm.jpg`）；三种情绪解析到对应文件；两张 CG 在 CG 层正常显示（`06-cg-relics-lining.jpg`、`07-cg-backhill-rope.jpg`，用播放器同一函数直接调用）；装备页两件谢礼显示新图标、乙级（`08-gift-icons.jpg`）。
- 限制：浏览器面板隐藏，游戏帧循环暂停，角色不能实际走动，位置靠直接设坐标；这一轮后段合成键盘事件失效，对白推进改为派发对话框点击、个别交互直接调用节点函数。控制台里 68 条 `onKey ... reading 'qj'` 报错都由注入脚本向 window 派发合成键盘事件引起（调用栈指向注入脚本），正常键盘输入下未复现。C1-03、C1-10 的 CG 在完整流程中的播放位置只由函数测试覆盖，实机是单独调用播放器看的。
- 美术观感由我逐张看图核对，不等于用户美术验收。

### 交给文档库

`cg_qh_relics_lining_v1` 可作为文档库 `assets/chapter1_relics.webp`（1280×720，C1-03 第 5–13 句）的重画候选，路径 `art_sources/qh-song-disguise-20261008/final/cg_qh_relics_lining_v1.webp`；文档库原文件未改动。宋先生外观（黑软方巾、灰褐旧长衫、八字须与下颌短须、花白鬓角、领下红绳）可回写 `cast-visuals.md` 裴嵩乔装条目。

## 剩余事项

- 文档库 `chapter1_relics.webp` 是否换成本批夹层 CG，由文档库决定。
- 新增对白未配音（与文档库约定一致）。
- `verify_representatives.cjs` 的章末旧期望需要另行修正（本次范围外）。
- `told_about_stranger=false` 时萧白何时向叶蘅坦白、三件遗产的去向，由培养段剧本另定。

## 本地完成 / Git 提交 / 线上发布

- 本地完成：是（代码、设计页、测试、更新记录）。
- Git 提交：否。
- 线上发布：否。
