# 改动清单（两个工作区共用）

状态：现行　最后核对：2026-10-21

规则见 R-文档-03（[规则登记表](rules/规则登记表.md)）。这份清单让接手的 agent 知道别人做了什么、正在做什么。细节写在各自的更新记录里，这里只写一条摘要和链接。

## 怎么用

1. **开工前**：读最近几天的条目和全部“进行中”。别人正在改的文件、场次、素材，先别动；必须动的，先问用户。
2. **动手时**：在“条目”最上面加一条，状态写“进行中”，写明工作区和范围。
3. **完成或交接时**：把自己那条改成结果，补上更新记录链接。只改自己的条目，别人的有误就告诉用户。
4. **检查**：2026-10-21 起，两个工作区 `docs/updates/` 里的每份更新记录都要在这里有链接。`python3 xiaojianghu/tools_docs/check_docs.py` 会检查，发布构建也会跑，漏登会失败。

条目格式：

```markdown
### 2026-10-21 · 标题
- 工作区：xiaojianghu-legacy-prologue ／ xiaojianghu ／ 两边
- 谁：Claude Code（会话主题）／ Codex ／ ……
- 状态：进行中 ／ 本地完成 ／ 已提交 ／ 已发布（分开写）
- 范围：改了哪些文件、场次、素材
- 更新记录：链到本工作区 docs/updates/ 下的那份记录（Markdown 链接，相对本页路径）
- 留给接手的人：未完成、待拍板、要注意的坑
```

## 条目

### 2026-11-11 · 开始部分剧情按审读清单改 13 处
- 工作区：xiaojianghu-godot
- 谁：Claude Code（Fable 5.2 会话）
- 状态：已完成（整套自测全过，12 张截图看过，已提交 git、未推送）
- 范围：把要改的原版 ink 搬到 xiaojianghu-godot/story/ 再改（对证、随口一句、算命先生、后山回话一、找人交谈、商量去处），改小耗子二版和日常活动行踪版，chapter.gd 的送老人行踪与对证参数，定稿事实 F-0029
- 更新记录：[2026-11-11 开始部分剧情按审读清单改 13 处](../../xiaojianghu-godot/docs/updates/2026-11-11-story-fixes-13.md)
- 另：model-router.md、ai-onboarding.md 写入“要另外调模型时优先用命令行 Claude Code”（用户 11-11 定）；默认走法台词基准 docs/review/walkthrough-web-lines.txt 已更新
- 留给接手的人：这七本剧本此后改 xiaojianghu-godot/story/ 里的 ink 再跑 build_story.cjs，不要再改原版或直接改 json

### 2026-11-11 · 开始部分剧情用 Fable 5.2 重新审读（只读，不改剧本）
- 工作区：xiaojianghu-godot（读 xiaojianghu-legacy-prologue/story 与 xiaojianghu-godot/story）
- 谁：Claude Code（Fable 5.2 审读会话）
- 状态：已完成（只出问题清单，剧本没改）
- 范围：只读审读开始部分全部 ink 剧本，列出此前评审没发现的问题；不改剧本、数据和素材
- 结果：Fable 5.2 初筛 9 条成立、146 条存疑；复核后建议改 13 处（含《三方-对证》1 处），可改可不改约 20 处，未核实或待定 8 处
- 更新记录：[2026-11-11 开始部分剧情用 Fable 5.2 重新审读](../../xiaojianghu-godot/docs/updates/2026-11-11-story-review-fable52.md)
- 留给接手的人：哪些要改等用户定；初筛带的代码是原版 JS，动手前先在 Godot 版里再对一遍

### 2026-11-10 · Godot 版首次入 git、三个工作区提交推送、Windows 试玩包
- 工作区：两边（xiaojianghu-godot、xiaojianghu、xiaojianghu-legacy-prologue）
- 谁：Claude Code（队伍页背景会话）
- 状态：已提交；已推送（GitHub donglin999/-：godot、claude/desk-finish-20261031、codex/legacy-prologue-map）；Windows 包已上传 GitHub 发布版
- 范围：xiaojianghu-godot 新建 git 并加 .gitignore（不入 build、_attic、.godot、docs/review 图片）；export_presets.cfg 加 Windows 导出
- 更新记录：[2026-11-10 Godot 版入 git 与 Windows 包](../../xiaojianghu-godot/docs/updates/2026-11-10-git-and-windows.md)
- 留给接手的人：
  - Godot 版以后在 godot 分支提交；
  - 评审图片只在本机，不在仓库；
  - Windows 包没在真 Windows 上跑过，用户试玩后看反馈

### 2026-11-10 · 遗留收尾：底图局部重画、陈伯坐姿小人、Q 版动作差分、伏虎拳／横杆护身特效成品、敌人弱点正式值（用户授权按文档自评）
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：
  - 底图：村心、后山、西田埂、药棚、叶家、陈家（含前景层）；
  - 数据：sc.json 陈家可走格，nav/occ 重算；
  - 小人：s_npc_qh_chen_rest_story（覆盖原文件）；
  - 调试入口：battle.gd `--battle=skills`；
  - 评审素材：docs/review/r51-patch、r51-chen-rest、r51-q-actions、vfx-skill-concepts-batch2-v1；
  - 设计草案：docs/design/enemy-weakness.md
- 更新记录：[2026-11-10 遗留问题收尾](../../xiaojianghu-godot/docs/updates/2026-11-10-leftovers.md)
- 后续（同日）：
  - 用户说“你直接按照文档去自我评审，我后面直接去试玩测试就行”，第五十、五十一轮按文档自评定稿；
  - 动作差分（含朝左版）接进 6 场戏；两招特效烘焙进 fx_skills.json；敌人弱点改进 defs、globals、lesson、side_hidden、core（相克表在 stats.gd）
- 留给接手的人：
  - 用户接下来直接试玩，有意见在对话里提；
  - 殷红缨缺战斗形象，有组队战时要补；
  - 改了底图要先跑 godot --import 再截图

### 2026-11-10 · 队伍页 B 版第二版：照预览图对齐纸底与装裱；叶蘅行程说法
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：menu.gd（整页旧册页纸 album、页眉页脚金边、头像列细线与竹石、返回键）、page_party（册页布局、装裱、题签、字色字号、获得状态）、kit（album_band／album_strip、实底朱印、淡墨横扫加深）、素材 qj-kit-v1/album_*（纸底生图，金边与锦边裁自预览图 B）；quest.gd、chapter.gd 行程说法
- 更新记录：[2026-11-10 队伍页 B 版第二版](../../xiaojianghu-godot/docs/updates/2026-11-10-party-b-v2.md)
- 留给接手的人：贴在评审台第五十轮第 1 题下等用户验收（第二版）；整页纸底七页一起变了，用户要是只想队伍页变，把 menu.gd 的 PAGE_BG 按页分开；截图基准已更新

### 2026-11-10 · 队伍页 B 版（册页题跋）与全页面扫查
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：page_party（B 版布局）、kit（朱印题签、木签、锦纹带、修为条）、生图素材 qj-kit-v1（锦纹、远山、梅、竹）；新增 tests/menu_sweep.gd 并接进 selftest；设置页撤掉无效的“战斗界面”项；试玩审查 16 处（qihe_hud 导航与淡出、ui.gd 宋体微调加粗、world 气泡、sc.json 门口动词与站位、gift_kit、ring_ui、cu_story 立绘渐隐、cu_hub 锁定原因、page_skill／page_rep 字号与样式、page_sys 键位表、side／chapter 追踪说明）；截图基准已更新
- 更新记录：[2026-11-10 队伍页 B 版与全页面扫查](../../xiaojianghu-godot/docs/updates/2026-11-10-party-b.md)
- 留给接手的人：B 版和扫查整改贴在评审台第五十轮第 1 题下等用户验收；画在底图里的碎石、小溪等排进下一批局部重画；叶蘅“在队伍里却要去东埠找她”的剧情说法待理顺

### 2026-11-10 · 人物行踪表与第四十九轮界面整改、队伍页第四版
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：新增 docs/cast-schedule.md（自动生成）、tools/cast_schedule.py、selftest 接入；flow/chapter.gd 站位规则（FIRST_NIGHT_ONLY、DAILY、_gathering）；story/风起-日常活动-行踪版.ink；tests/harness.gd、sweep_npc.gd 新检查；界面 19 项（qihe_hud、menu 各页、gift、profile、ring、cultivation）；kit 分隔线、竹简签、墨扫标题（生图素材 qj-kit-v1）；银两图标
- 更新记录：[2026-11-10 人物行踪表与界面整改](../../xiaojianghu-godot/docs/updates/2026-11-10-cast-schedule.md)
- 留给接手的人：改剧情、站位、出没条件后跑全套自测看“人物行踪表”；规矩已登记为 R-剧情-09（用户批准）。队伍页改版方向待用户在评审台第五十轮第 1 题选

### 2026-11-10 · 试玩审查第二轮整改（剩余摆放、站位、底图局部重画）
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：sc.json（村心老树、十处人物站位、旧木桶交互点、村心地名、接应院可走格）；东埠道具图集、接应院底图、客栈底图与前景层局部重画；cu_hub 灰项短签位置；队伍页第三版（kit 题签改卷轴、page_party 圆印式武学图标与固定布局）
- 更新记录：[2026-11-10 试玩审查第二轮整改](../../xiaojianghu-godot/docs/updates/2026-11-10-playtest-round2.md)
- 留给接手的人：界面 19 项在评审台第四十九轮第 1 题等用户定；陈家门框、叶家脸盆架等低优先级未动

### 2026-11-09 · 第四十八轮评审整改（队伍页名字与装备、界面 11 处、底图 7 处局部重画）
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：page_party（名字改宋体、装备挪进人物栏）、qihe_hud（导航边距、追踪栏、时段、地名与提示条底色、交互时收起）、page_quest／page_rep／page_sys／menu 人物列、profile_ui 装备标注、cu_hub 灰项原因与技艺六图标；客栈、叶家、陈家底图和前景层，村心与后山道具图集，南村口底图；新工具 tools/patch_region.py
- 更新记录：[2026-11-09 第四十八轮评审整改](../../xiaojianghu-godot/docs/updates/2026-11-09-r48-fixes.md)
- 留给接手的人：第 8 处（山上三间客房同一张素材）按用户选择往后排；改室内底图要同步清前景层

### 2026-11-09 · 用户试玩七条整改与自动试玩检查
- 工作区：xiaojianghu-godot
- 谁：Claude Code（队伍页背景会话）
- 状态：本地完成；未提交
- 范围：墨印点标签、采集距离、叶家门、追踪框样式、村心酒缸与老树石凳、货郎位置与断扁担图与行记、小耗子的一课二版（story/风起-小耗子-二版.ink、side_aqi、窃印）；扫荡加“没反馈”“一人两处”检查；新增 test/aqi_lesson_test.gd
- 更新记录：[2026-11-09 试玩整改](../../xiaojianghu-godot/docs/updates/2026-11-09-playtest-fixes.md)
- 留给接手的人：小耗子剧本由主会话代评；断扁担新图、老树去石凳为生图修改，待用户看实机

### 2026-11-09 · 四款游戏参考知识库候选评审站
- 工作区：xiaojianghu（文档库）
- 谁：Codex（游戏参考知识库会话）
- 状态：本地完成，候选资料待用户评审；未提交、未推送、未线上发布
- 范围：review/game-reference-20261109/ 按当前 Godot 游戏板块组织的候选资料与评审网站；只读核对现行代码，不接入正式知识库，不改正式导航、游戏设定和实现
- 更新记录：[2026-11-09 游戏参考候选评审站](updates/2026-11-09-game-reference-review.md)
- 留给接手的人：用户要求先评审后入库，并结合现在的游戏板块筛选，禁止做全量百科；八方一、二代都收录并注明差异；外部事实、分析及项目采用状态分开记录

### 2026-11-09 · 队伍页背景跟人物走的试样、殷红缨立绘重画
- 工作区：xiaojianghu-godot（docs/review/menu-figure-trial-v1、yin-portrait-new-v1、yin-legs-fix-v1；game/assets/ui/jianghu-v4/portraits/bgtest/trA1～trB2 试样）
- 谁：Claude Code（菜单重设计会话）
- 状态：本地完成；未提交；11-09 用户选 A 分层；又按用户意见改成带人物意象的版本，八人各两张（叶蘅错用旧立绘，已换回现用立绘重出），第四十五轮用户点满意（未逐人选）；殷红缨新立绘和表情已验收；八张意象背景按推荐换进游戏；队伍页按第四十七轮 A 重排（立绘撑满、右栏武学与状态、身法归轻功），等用户验收
- 范围：殷红缨、裴知古按人物卡与立绘出背景，分层与整张两种做法各两张；殷红缨立绘整张重画四张；按 A 给萧白三套、叶蘅、苏芷、岑霜各出两张
- 更新记录：[2026-11-09 背景跟人物走的试样](../../xiaojianghu-godot/docs/updates/2026-11-09-figure-bg-trial.md)
- 留给接手的人：正式 figplate/、portraits/ 没动；殷红缨现行高清原图在 legacy 的 guiyun-inkcloud-cn-20261008/yin/p_gy_yinhongying_cn.png（别用 guiyun-inkcloud-20261008 的旧图）；选定后要重出五个表情

### 2026-11-08 · 接住评审台回答：背景板中档、八种命中成品、序章候选
- 工作区：xiaojianghu-godot（figplate/ 八张、portraits/yinhongying.webp、menu.gd；assets/fx/hits/、data/battle/fx_hits.json、battle/vfx.gd、view.gd、battle.gd 调试入口；docs/review/menu-figure-plate-v2～v4、vfx-hit-final-v1、prologue-staff-water-v1；_attic/2026-11-08-figplate-test、figplate-v3）
- 谁：Claude Code（菜单重设计会话）
- 状态：本地完成；未提交；背景板和命中特效等验收，持棍与递水 CG 等选
- 范围：第三十六、三十九、四十一轮的回答落实；第三十七、三十八轮缺具体选择，等用户补
- 更新记录：[2026-11-08 接住评审台回答](../../xiaojianghu-godot/docs/updates/2026-11-08-desk-r41-followup.md)
- 留给接手的人：命中特效第一批已验收，第二批（招式专属）还没做；持棍甲、递水 CG 甲已接进序章；背景板第四版只用菜单底图的颜色（`docs/review/menu-figure-plate-v4/`，新角色要加规格、tone.py 目标并跑 measure.py），等验收；第三十七、三十八轮配乐还缺具体选择


### 2026-11-08 · 培养部分剧情分支覆盖测试（设计＋开发）
- 工作区：xiaojianghu-godot（docs/branch-coverage.md、dev-conventions.md；game/test/branch_static_test.gd、branch_cases_test.gd、pre_hangao_finish_test.gd；game/scripts/cultivation/cu_coverage.gd、cultivation.gd；game/scripts/battle/rules.gd、stats.gd、turn.gd；game/data/cultivation/coverage_exempt.json；tools/selftest.py）
- 谁：Claude Code（菜单重设计会话）
- 状态：本地完成，已进全套自测；未提交、未发布
- 范围：五层分支覆盖测试设计并实现前四层；顺带把师承招式战斗效果改为照原版移植
- 更新记录：[2026-11-08 培养部分剧情分支覆盖测试](../../xiaojianghu-godot/docs/updates/2026-11-08-branch-coverage.md)
- 留给接手的人：新剧情不用写测试，自动纳入；有意走不到或可重来的登记进 coverage_exempt.json；开始部分×培养的组合维度目前只有“带不带秘籍”


### 2026-11-08 · 汉皋前能做的收尾（旧场下架、针路台词、内功与师承招式战斗效果）
- 工作区：xiaojianghu-godot（game/data/runtime/globals.json、data/cultivation/scripts.json、data/battle/defs.json；scripts/battle/stats.gd、rules.gd、battle.gd、auto.gd、turn.gd；scripts/cultivation/cu_pre_hangao.gd；test/pre_hangao_finish_test.gd；_attic/2026-11-08-gy_m09/）＋ xiaojianghu（设计稿 pre-hangao-timeline.md、qihe-mojiao-observer-sideline.md、cultivation-mentor-lines.md）
- 谁：Claude Code（菜单重设计会话）
- 状态：本地完成；未提交、未发布；数值待评审
- 范围：时间线第三节能做的几项＋内功主动招与特殊被动＋扬灰目眩；排查中发现师承招式在战斗里认不出类型和效果，一并接上
- 更新记录：[2026-11-08 汉皋前能做的收尾](../../xiaojianghu-godot/docs/updates/2026-11-08-pre-hangao-finish.md)
- 留给接手的人：新招专属特效等第三十九轮第一批画法定了再出；万壑归元诀二选一固定为加伤；薪火功三层说法不清没接；新增全程测试 `--walkthrough --fullrun`（战斗真打、培养点按钮推进到汉皋城门），三种选法都走通


### 2026-11-07 · 招式、内功图标换成新画风
- 工作区：xiaojianghu-godot（game/assets/ui/skill-icons-v5/ 新增 55 张；game/scripts/menu/kit.gd；docs/review/skill-icons-v5/）
- 谁：Claude Code（菜单重设计）
- 状态：本地完成；未提交、未发布
- 范围：旧菜单图集的招式、心法图标停用，换成逸剑式手绘新图标；修护路棍法笔记仍显示旧图
- 更新记录：[2026-11-07 招式、内功图标换成新画风](../../xiaojianghu-godot/docs/updates/2026-11-07-skill-icons-v5.md)
- 留给接手的人：新学得的招式、内功要按 skill-icons-v5 的提示词补图，否则显示墨迹字；R-画风-02 已扩到招式、内功图标


### 2026-11-06 · 江湖菜单七页按新预览图做进 Godot
- 工作区：xiaojianghu-godot（game/scripts/menu/ 的 menu.gd、kit.gd、page_party/skill/bag/equip/quest/sys.gd；不碰 model.gd；tests/shots/baseline/ 菜单 9 张基准重拍）
- 谁：Claude Code（菜单重设计）
- 状态：七页和存档弹窗本地完成，自测全过；未提交、未发布
- 范围：用户通过第四十轮第 2 题的七页预览图（含整改：行记、关系、设置无队员列，存档管理改弹窗），按 v3 预览图改菜单外壳和各页排版；自测除菜单截图外全过，菜单截图基准已重拍（行囊那张未重拍）
- 更新记录：[2026-11-06 江湖菜单按新预览图做进游戏](../../xiaojianghu-godot/docs/updates/2026-11-06-menu-redesign.md)
- 留给接手的人：关系页沿用原版式；培养模式设置页项目多，要滚动；左列已改切角印框＋6 张专属头像（game/assets/ui/jianghu-v4/rail/），新的可入队角色要补同规格头像；队伍页定稿为去框大立绘＋背景板（figplate/），加深版背景板与脚影／背光／虚化效果在 figplate-test/ 和 FIG_FX 开关下试样，待用户选；殷红缨立绘有未抠净的白块

### 2026-11-06 · 汉皋前时间线问题整改（秘籍参悟、过渡戏后挪、外出月份、遗产线索戏）
- 工作区：xiaojianghu-godot（数据 globals.json、scripts.json；menu/model.gd、page_bag.gd；cultivation/cu_balance.gd、cu_core.gd；flow/side_hidden.gd、side_lamp.gd）＋ xiaojianghu（设计稿 pre-hangao-timeline.md、bible 定稿事实）
- 谁：Claude Code（汉皋前时间线，子会话）
- 状态：本地完成；未提交；新功法数值与新剧情待评审
- 范围：用户 11-06 对时间线问题的答复：开始部分五本秘籍背包里满足条件可参悟；培养开头“两个月后”按日历后挪；整月外出第 16 月改第 13 月；补一场三件遗产的线索戏
- 更新记录：[2026-11-06-pre-hangao-fixes.md](../../xiaojianghu-godot/docs/updates/2026-11-06-pre-hangao-fixes.md)
- 留给接手的人：陆衡推荐信、阿七借名、第 6 月以后的安排按用户意思暂不动；page_bag.gd 已改完，菜单重设计会话可以动了；内功主动招与暴露类被动战斗里还没接

### 2026-11-06 · 江湖菜单重设计预览图（gpt-image-2.6）
- 工作区：xiaojianghu-godot（docs/review/menu-redesign-preview-v1/、v2/、v3/，只出预览图，不改游戏代码）
- 谁：Claude Code（生图源升级后续）
- 状态：用户选甲后七页（v3）已出，发评审台第四十轮第 2 题等验收；未提交
- 范围：第一版（插画式）用户说像广告，作废；对照逸剑风云决、大侠立志传、歧路旅人真实菜单截图出第二版甲乙丙，各含队伍页、设置页
- 更新记录：[2026-11-06 江湖菜单重设计预览图](../../xiaojianghu-godot/docs/updates/2026-11-06-menu-redesign-preview.md)
- 留给接手的人：用别家截图当参考图会被抄人物和数值，提示词要写死；评审台页面显示没验收（浏览器未登录）

### 2026-11-06 · 生图源升级到 gpt-image-2.6
- 工作区：xiaojianghu（tools_common/imgsources.json、imggen.py；规则 R-生图-01/02；CLAUDE.md、AGENTS.md、ai-onboarding、art-pipeline 等的模型说法）；测试图放在 xiaojianghu-legacy-prologue/art_sources/imagegen-302-26-test-20261106/
- 谁：Claude Code（生图源升级）
- 状态：本地完成，未提交
- 范围：登记 gpt-image-2.6-sunburst（当前源）和 gpt-image-2.6-flare，旧源保留；实测两档出图
- 更新记录：[2026-11-06 生图源升级到 gpt-image-2.6](updates/2026-11-06-imggen-2.6.md)
- 留给接手的人：Complexity 参数没接；带参考图编辑没单独实测；2.6 出图比 2.5 慢（196 秒／88 秒）

### 2026-11-05 · 现有特效分四批重做：第一批通用命中概念图
- 工作区：xiaojianghu-godot（docs/review/vfx-hit-concepts-batch1-v1/ 概念图与提示词；不改游戏代码）
- 谁：Claude Code（特效路线比对，子会话）
- 状态：本地完成；拳、剑、暗器、啄、毒概念图已并进评审台第三十九轮第 2 题，等用户选；未接进游戏；未提交 git
- 范围：用户要求“用 opus 或者 fable 去整改现有的所有技能特效”，且两个模型“用 cli 自带的，不要走 desktop 或者 302”；第一批＝拳、暗器、啄、毒、剑五种通用命中（音律没有角色用，不做）；文字模型写动作分析与提示词，出图仍用当前生图源；claude 命令行按用户指示重装过
- 留给接手的人：用户选完后，棍击烘焙进 Godot，其余按选定版做关键帧条成品；第二批（16 个招式）由 Fable 起草提示词、Opus 复核，一招一题
- 更新记录：[2026-11-05-vfx-route-compare.md](../../xiaojianghu-godot/docs/updates/2026-11-05-vfx-route-compare.md)（四轮一节）

### 2026-11-05 · 特效流程改为优化路线＋棍击命中概念图（等用户选）
- 工作区：xiaojianghu（rules.json R-特效-01 改写、新增 R-特效-03；docs/design/skill-vfx-pipeline.md 第 1、4～7 步）／xiaojianghu-godot（docs/review/vfx-staff-hit-concepts-v1/ 三版概念图）
- 谁：Claude Code（特效路线比对，子会话）
- 状态：规则已批准登记；棍击丙版成品与刀、咬概念图已发评审台第三十九轮第 2 题，等验收和选择；未接进游戏；未提交 git
- 范围：用户定“采用优化路线”并要求“设计要符合实际”；棍击按木杵砸中重设计，甲乙丙三版
- 更新记录：[2026-11-05-vfx-route-compare.md](../../xiaojianghu-godot/docs/updates/2026-11-05-vfx-route-compare.md)（二轮一节）
- 留给接手的人：棍击验收后烘焙精灵表接进 Godot（vfx.gd 的「棍」命中）；刀、咬按选定版做成品；其余按评审台附件“现有特效重做清单”逐批来，每批先过概念图

### 2026-11-05 · 特效路线比对：现有／pixelfx／优化 × 低中高三档（评审用，不接线）
- 工作区：xiaojianghu-godot（vfx.gd、clash.gd、battle.gd 各加一个只在命令行参数下生效的调试开关；新增评审目录 docs/review/vfx-route-compare-20261105/）
- 谁：Claude Code（特效路线比对，子会话）
- 状态：本地完成；评审页已发（私有 artifact https://claude.ai/artifact/LrzeaT9r1iBDkTEPDimFJB），待用户确认；未提交 git；未发布；未替换任何现有素材
- 范围：研究 patch-gg/pixelfx（代码只在 scratchpad）；低＝狼战木杵普通命中、中＝短锋相照、高＝明约合锋，各做现有／pixelfx／优化三版；优化路线 6 次生图（302ai，含 1 次重生）
- 更新记录：[2026-11-05-vfx-route-compare.md](../../xiaojianghu-godot/docs/updates/2026-11-05-vfx-route-compare.md)
- 留给接手的人：用户确认前不要把 pixelfx 版或优化版接进游戏；若采用优化流程，需按 R-文档-02 请用户批准后改 R-特效-01 与 skill-vfx-pipeline.md；调试开关 --fx-off／--fx-log／--auto 只供截图用

### 2026-11-05 · 汉皋前剧情时间线（梳理，只读）
- 工作区：xiaojianghu（只新增设计稿一份；剧本、代码未动）
- 谁：Claude Code（时间线梳理，子会话）
- 状态：本地完成；未提交 git；泳道图页面已发（私有 artifact https://claude.ai/artifact/ReY4Ggw5ft37eGKCjXwtyr）
- 范围：新增 docs/design/pre-hangao-timeline.md：开始部分半日表、培养第 1～5 月日历、独立事件线（三位前辈师承功法、三方代表、宋先生、蔺管事、小耗子、隐藏奇遇等）、矛盾与断档清单；另发泳道图页面
- 更新记录：[pre-hangao-timeline.md](design/pre-hangao-timeline.md)
- 留给接手的人：只列问题，没改；第三节 13 条矛盾与断档待用户拍板（重点：开始部分秘籍学不了、“两个月后”在一月月初、外出月份表仍是 16、陆衡推荐信无入口）

### 2026-11-05 · 舍弃子任务路由器（codex-router）
- 工作区：xiaojianghu（入口 CLAUDE.md、Godot 版 plan.md 各改一句）
- 谁：Claude Code（Godot 重做，子会话）
- 状态：本地完成；未提交 git
- 范围：R-子任务-02 废止（已登记批准）；codex-router.sh 与 .router-tasks/ 移到 _attic/2026-11-05-codex-router/；router-subtasks.md、router-api-for-agents.md 移到 docs/archive/ 并改链接；tools_por/.env 删掉失效的 ENTERPRISE_API_KEY
- 更新记录：[2026-11-05-drop-codex-router.md](updates/2026-11-05-drop-codex-router.md)
- 留给接手的人：不要再用 codex-router 派子任务；小任务主会话做或派 Claude 子代理（附 R-子任务-01 规则）

### 2026-11-05 · 剧情工具的 Opus 改走公司路由
- 工作区：xiaojianghu
- 谁：Claude Code（Godot 重做，子会话）
- 状态：本地完成；实测通过（公司路由、302 备用、演员法端到端）；未提交 git
- 范围：tools_story/minimax_logic_review.py（call 分通道、router_call）、minimax_actors.py／minimax_draft.py 注释；R-剧情-01（已登记批准）、story-writing.md 第七节、story-writing skill、新 docs/model-router.md、router-subtasks.md 加不通提示
- 更新记录：[2026-11-05-opus-company-router.md](updates/2026-11-05-opus-company-router.md)
- 留给接手的人：Token路由 要切在「zleap · Claude Code」，否则剧情工具报“公司路由没就绪”，可临时 --provider 302；codex-router.sh 的 ENTERPRISE_API_KEY 已失效（401），等新 Key

### 2026-11-05 · 开始部分与培养模式的 Esc 菜单统一
- 工作区：xiaojianghu-godot（设计稿 xiaojianghu/docs/design/cultivation-implementation.md 同步一句）
- 谁：Claude Code（Godot 重做，子会话）
- 状态：本地完成；全套自测 13/13 通过；未提交 git；未发布
- 范围：培养模式 Esc／齿轮改开江湖菜单设置页，原“养成设置”并入设置页（培养专有三项）；修培养模式菜单里返回首页后培养界面盖回来、bool() 收空值报错（12 处）；自测加 Esc 检查与两张截图
- 更新记录：[2026-11-05-esc-menu.md](../../xiaojianghu-godot/docs/updates/2026-11-05-esc-menu.md)
- 留给接手的人：两部分里同一功能的界面要用同一套；新加培养专有设置项放进 page_sys.gd 的 from_cultivation 分支

### 2026-11-05 · Godot 版全套自动测试（六项）＋ 查出的 4 个问题
- 工作区：xiaojianghu-godot
- 谁：Claude Code（Godot 重做，子会话）
- 状态：本地完成；全套自测 13/13 通过；未提交 git；未发布
- 范围：新增 tools/selftest.py、ink_sweep.cjs、shot_regress.py，game/scripts/tests/harness.gd、sweep_npc.gd、savecheck.gd，tests/saves、tests/shots；改 walkthrough.gd、gd_bg.sh（窗口改放 BetterDisplay 虚拟屏 QingheTest）、export.py（导出前先自测）、boot.gd；修 prologue.gd（借宿榻条件、旧存档缺字段）、chapter.gd（回叶家那步、药棚叶蘅“谈”）、game_state.gd（测试存档不改“最近一次”）
- 更新记录：[2026-11-05-selftest.md](../../xiaojianghu-godot/docs/updates/2026-11-05-selftest.md)
- 留给接手的人：改完跑 `python3 tools/selftest.py`；画面有意改动后用 `tools/shot_regress.py --update` 重拍基准；需要窗口的测试一律走 gd_bg.sh（虚拟屏），不要放实际屏幕

### 2026-11-05 · Godot 版装上 GdUnit4 自动测试
- 工作区：xiaojianghu-godot
- 谁：Claude Code（Godot 重做，子会话）
- 状态：本地完成；11 个测试全过；未提交 git；未发布
- 范围：game/addons/gdUnit4（6.2.3）、project.godot 启用、export_presets.cfg 排除插件和测试、tools/gd_test.sh、game/test/*_test.gd；同步 globals.json 里的旧副本 QiheNpc.data（还留着“托”和站岗不能交谈）
- 更新记录：[2026-11-05-gdunit4.md](../../xiaojianghu-godot/docs/updates/2026-11-05-gdunit4.md)
- 留给接手的人：新测试放 game/test/，用 tools/gd_test.sh 跑；同一文件里一个测试失败后，后面的测试不再跑

### 2026-11-03 · 线上载入卡死整改
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改）
- 状态：本地完成；测试预览 loadfix 已验证；未提交，main、qihe 未发布
- 范围：js/core.js 开场预载（排队、超时重试、立绘后台下、看门狗、进场地图优先）
- 更新记录：[2026-11-03-load-stall.md](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-03-load-stall.md)
- 留给接手的人：根子是到 Cloudflare 的线路慢，换国内托管要用户定

### 2026-11-03 · Godot 版一比一重做（新目录 xiaojianghu-godot）
- 工作区：新目录 xiaojianghu-godot（只读参照 xiaojianghu-legacy-prologue，不改原版）
- 谁：Claude Code（Godot 重做，子会话）
- 状态：本地完成（序章→开始部分→进入培养模式可完整游玩；Web 与 macOS 已导出并实测）；未提交 git；未发布
- 范围：新建 xiaojianghu-godot/（Godot 4.7 工程、素材打包脚本、docs/plan 与 docs/review）；不碰原版 js/、assets/、story/
- 更新记录：[2026-11-03-godot-remake.md](../../xiaojianghu-godot/docs/updates/2026-11-03-godot-remake.md)
- 续做（11-03 第二轮，本地完成，未提交、未发布）：已补存档管理（新建、重命名、回收站、载入）、培养八个面板对照（4.2–6.0）、系统楷体／宋体／魏碑；三方冲突特效已移植接线并截图对照（scripts/battle/fx_*.gd）；关系页带数据对照；重导 Web/macOS 并验证；测试改为后台批量（tools/gd_bg.sh、--shots）
- 续做（11-03 第三轮“完成还差的地方”，本地完成，未提交、未发布）：交锋辉光补上 1/4 分辨率离屏层＋8px 模糊；苹果宋体／楷体按字重从系统字体集合取（缓存在用户目录，不打包）；小数字号（12.5、13.5、14.5、18.5、20.5px 等）照原版大小显示；交锋连拍对照对齐（以第一句喊话为零点、连拍改后台编码），十帧招式一一对上；新增 `--checkall` 编译检查、`--clash-timeline` 节奏打印
- 续做（11-03 第四轮“量化比对”，本地完成，未提交、未发布）：两边全部重跑，记录在 xiaojianghu-godot/docs/review/quant-2026-11-03.md；剧情、剧本数据、交锋规则全一致，地图差不超过压缩底数；更正交锋节奏（Godot 快约 1.8%）与旧帧耗说法；修批量截图工具标题页暗角残留
- 续做（11-04 第五轮“修交锋节奏”，本地完成，未提交、未发布）：查明“快 1.8%”是 Godot 无头不限帧（约 144 帧）的测量偏差，原版浏览器 60 帧下每次等待也多等约 10ms，两边逻辑一致；`--clash-timeline` 改为按 60 帧测，结果落在原版自身波动内（17.76–17.81 秒对 17.76–17.91 秒）；游戏代码未改，120Hz 高刷待查
- 续做（11-04 试玩修卡关，本地完成，未提交、未发布）：用户试玩卡在“进村第一夜”周婶留饭一句后。原因是剧本外部函数传的参数比 Godot 接的函数多（go_scene 传场景和入口），Godot 的 callv 会静默不执行，整段戏留在后山演完，演完出不去；`xiaojianghu-godot/game/scripts/core/story_runtime.gd` 改为截掉多的参数，所有剧本外部函数一并受益。自动通关复跑：序章结束在药棚，298 句与原版逐句一致；用户那份存档已改到药棚门口（原档备份在会话临时目录）
- 续做（11-04 墨印“互”与“谈”人人都有，本地完成，未提交、未发布）：用户定今后只更新 Godot 版（规则 R-工作区-01 已改）；“托／回”改名“互”，接应院护院、差役补上“谈”和新台词（xiaojianghu-godot/story/），R-交互-01 与设计稿 npc-interaction-v2 第 2.2 节同步；插件只推荐未安装。决策记录：xiaojianghu-godot/docs/decisions/2026-11-04-interaction-hu-tan.md
- 留给接手的人：已知差异见更新记录“未完成”一节；原版 js/core.js 另有会话在修，本目录不依赖它；序章配乐用原版现有配乐

### 2026-11-02 · 删掉配音文件和登记
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：删 assets/audio/voices、battle-voices（269 个文件）；index.html 去掉两份登记脚本；素材表去掉 267 条配音
- 更新记录：[2026-11-02-voice-off.md](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-voice-off.md)
- 留给接手的人：播放代码留着；art_sources 里的生成原件没删；用户说配音以后再处理

### 2026-11-02 · 去掉起火时的救人二选一
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：风起-起火、三方-侧口对峙、风起-随口一句三份剧本；js/qihe-chapter.js、qihe-staging-data.js；旗标登记；三份测试
- 更新记录：[2026-11-02-remove-rescue-choice.md](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-remove-rescue-choice.md)
- 留给接手的人：R3-R10 台词改了，旧配音对不上，重开配音时要重录

### 2026-11-02 · 路由器接入说明（给其他 agent）
- 工作区：xiaojianghu
- 谁：Claude Code（骆驼传美术方法评估）
- 状态：本地完成（未提交）
- 范围：新增 `docs/archive/router-api-for-agents.md`；`docs/archive/router-subtasks.md` 加一句链接。实测 `/v1/models` 和三种请求格式（haiku 各一次，极少量计费）。
- 更新记录：本条内容少，没有另写，说明见 [router-api-for-agents](archive/router-api-for-agents.md)。
- 留给接手的人：Python SDK 写法未实测。

### 2026-11-02 · 暂时关掉所有配音
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（汉皋前培养补充，同一会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：`js/voice.js`（总开关 ENABLED=false）、`js/battle-voice.js`、`tools_scene/qihe/verify_battle_voice.cjs`、`tests/qihe-clash-voice-browser.cjs`
- 更新记录：[2026-11-02-voice-off](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-voice-off.md)
- 留给接手的人：配音文件和登记都在，改回 true 即恢复；重新开时要查起火夜战收场少播一句的问题
### 2026-11-02 · 接应院缩小成小农舍；第一部分全量测试复查
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（汉皋前培养补充，同一会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）；接应院仍待用户验收
- 范围：接应院底图和遮挡件、`js/qihe-expansion-data.js`（接应院碰撞、锚点）、`js/qihe-staging-data.js`（对证站位）、`js/qihe-treasure.js`（东埠铁箍箱挪到 1130,805，避开芦苇采集点）、`tests/qihe-finale-browser.cjs`（选项文字跟上 10-20 改写、等到达对话后再对证、点击容错）
- 更新记录：[2026-11-02-refuge-shrink](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-refuge-shrink.md)
- 留给接手的人：接应院战斗背景没重出；起火夜战收场岑霜那句配音测试只播出 4/5 句，没查清
### 2026-11-03 · 序章配乐按情景分场出候选
- 工作区：xiaojianghu-legacy-prologue（素材）；规划记在 xiaojianghu
- 谁：Claude Code（音频规划，子会话）
- 状态：本地完成（未提交、未发布）；评审台第三十八轮“序章配乐”已出题，等用户挑
- 范围：legacy `art_sources/audio-20261103-prologue/`：六场（后山相遇、递水、遇狼、进村收留、第一夜走动、入睡），每场 Suno v5 两首、MiniMax 作曲一首，共 18 首；试听页 https://claude.ai/artifact/NzY8AUxvVrVbMPAAZ1XFjm 最上面一节；没改游戏代码、没接线
- 更新记录：见 [audio-plan-20261102](design/audio-plan-20261102.md)“序章配乐按情景分场”一节
- 留给接手的人：试听拷贝已统一响度，原件没动；接线时改 `qiheSoundscape` 按地图和剧情分曲，并一起改 verify_audio 的“first-night silence”断言

### 2026-11-02 · 音乐、音效、配音重新规划（302 新入口：Suno、Gemini 语音、MiniMax 作曲和语音）
- 工作区：xiaojianghu（规划文档）；盘点的是 xiaojianghu-legacy-prologue 现状
- 谁：Claude Code（音频规划，子会话）
- 状态：本地完成（未提交、未发布）；试听题已发评审台，等用户挑
- 范围：新增 `docs/design/audio-plan-20261102.md`、`tools_audio/try302_audio.py`；按用户“都去尝试下”给村中白天出了试样（legacy `art_sources/audio-20261102/village-day/` 和 `ui-click/`，每家只用最好模型：配乐 3、环境声 2、吆喝 6、点击音效 9 类各 2 版），试听页 https://claude.ai/artifact/NzY8AUxvVrVbMPAAZ1XFjm ；用户随后说“现有版本挺好的，帮我补充没有的就行”，现用的都保留，补出 P0 缺口候选（legacy `art_sources/audio-20261102/p0/`：危急、安顿配乐各 3 首，火场环境声 2，战斗音效 15），并入同一试听页；没改游戏代码、没接线
- 更新记录：规划正文即记录，见 [audio-plan-20261102](design/audio-plan-20261102.md)
- 留给接手的人：四个新入口都做不了音效；ElevenLabs 直连密钥已失效，音效走 302 转接的 ElevenLabs；配乐 Suno 和 MiniMax 作曲要同题试样再定；302 上的 MiniMax 语音只有系统音色，现有角色音色能不能搬过去要先查；用户批准前不批量生成、不接线

### 2026-11-02 · 去掉西田晒谷竹席和谷堆
- 工作区：两边（代码在 xiaojianghu-legacy-prologue，设计稿注在 xiaojianghu）
- 谁：Claude Code（汉皋前培养补充，同一会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：`js/qihe-town.js`、`story/01-开始/村中-景物.ink`（已重新登记批准）、`tools_scene/qihe/verify_town.cjs`、`shot_spots.cjs`、`docs/design/qihe-map-interactables.md`
- 更新记录：[2026-11-02-remove-grain-mat](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-remove-grain-mat.md)
- 留给接手的人：翻谷领炒米的小活随之删掉；竹席、谷堆素材文件留着
### 2026-11-02 · 栖河物资点去掉钥匙
- 工作区：两边（设计稿在 xiaojianghu，代码在 xiaojianghu-legacy-prologue）
- 谁：Claude Code（汉皋前培养补充，同一会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：`js/qihe-treasure.js`、`story/01-开始/村中-宝箱.ink`、`tools_scene/qihe/verify_treasure.cjs`、`docs/design/qihe-treasure-points.md` 及其戏眼卡
- 更新记录：[2026-11-02-treasure-points](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-treasure-points.md)（文末“追加：去掉钥匙”）
- 留给接手的人：用户定了宝箱一律不用钥匙；以后别处加箱子也照此
- 追加：货币单位统一写“两”（10-23 定），物资点台词和 6 页仍写“统一显示文”的设计页已改；旧更新记录和归档不改；野外行囊界面（`js/qihe-resources.js`）也已改成两
### 2026-11-02 · 栖河地图补宝箱和隐藏物资点（参考八方旅人）
- 工作区：两边（设计稿在 xiaojianghu，代码和素材在 xiaojianghu-legacy-prologue）
- 谁：Claude Code（汉皋前培养补充，同一会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：新增 `js/qihe-treasure.js`、`story/01-开始/村中-宝箱.ink`、`docs/design/qihe-treasure-points.md`、`assets/production/maps/town-props-20261102/`、`tools_scene/qihe/verify_treasure.cjs`；两只旧木桶改成淡蓝提示
- 更新记录：[2026-11-02-treasure-points](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-treasure-points.md)
- 留给接手的人：箱子素材状态是候选；只有北坡铁箍箱亲手按键开过，其余靠 verify_treasure
### 2026-11-02 · 序章重新排查（后山、遇狼、进村第一夜）
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（汉皋前培养补充，同一会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：`js/prologue-backhill.js`、`js/prologue-arrival.js`、`story/_共用/externals.ink`，代批了 6 份序章和第一夜剧本
- 更新记录：[2026-11-02-prologue-audit](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-prologue-audit.md)
- 留给接手的人：递水 CG 和地图对不上，在评审台第三十六轮等用户定；第一夜跑腿和过夜改的台词没手动走过

### 2026-11-02 · 汉皋前培养排查：师承功法线与闲逛补充
- 工作区：xiaojianghu-legacy-prologue（代码、剧情）；xiaojianghu（设计文档、登记）
- 谁：Claude Code（汉皋前培养补充，子会话）
- 状态：已提交（`61fc805`，未推送）并发布（main、qihe，11-02）
- 范围：新增 `js/qh-mode-cultivation-mentors.js`、`tests/cultivation-mentors.test.cjs`、`docs/design/cultivation-mentor-lines.md`；改 `js/qh-mode-cultivation-library.js`（追加 9 门功法）、`-balance.js`、`-core.js`、`-growth.js`、`-household.js`、`-martial.js`、`-relations.js`、`-side.js`（注释）、`js/qh-mode-cultivation.js`、`index.html`、`tools_scene/qihe/verify_household.cjs`、回扣登记表、定稿事实；只动第 1～4 月的闲逛，固定剧情只在《出门的家伙》加一句回扣，没动 ink
- 更新记录：[2026-11-02-mentor-lines](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-02-mentor-lines.md)
- 留给接手的人：排查和缺口表在 `docs/design/cultivation-mentor-lines.md`；徐令仪、岑霜、沈雁回的立绘已采用、当面戏已开；评审台第三十五轮两题已收，学艺额度和丙级提前按现方案跑，九招用通用特效；用户批准后登记了 R-命名-01、R-画风-06；留到汉皋的三段草稿在 `art_sources/qihe-reps-q-20261102/held-scenes/`；302 主密钥 401，这次走的备用密钥；`guiyun-performance-browser` 里的 `hg_aftercare` 未查根因

### 2026-11-01 · 开发方法总结（给别的游戏参考）
- 工作区：xiaojianghu
- 谁：Claude Code（开发方法总结，子会话）
- 状态：本地完成（游戏仓库未提交）；脱敏副本已推送到 donglin999/gameArchitecture（main，541902d，私有）
- 范围：新增 `docs/dev-methods-summary.md`；改 R-剧情-01、新增 R-动作-01（用户批准）；重写 `docs/anim-pipeline.md`，白模管线归档到 `docs/archive/anim-pipeline-rig.md`（两个工作区）；更新相关引用；不碰场景重画的改动
- 更新记录：[2026-11-01-dev-methods-summary](updates/2026-11-01-dev-methods-summary.md)
- 留给接手的人：线上是脱敏改写过的副本，不和本地脚本同步；要调模型的脚本、`build_ink.cjs`、后期脚本在副本里没实际跑过

### 2026-11-01 · 开始部分场景重画（客栈甲接入起）
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：已提交（`1a1feab`）并发布（main、qihe）；中央村落、接应院、叶家、后山采药路（撤掉草药丛后）、接应院战斗背景用户都已验收通过；后山相遇、药棚室内按排查表不改
- 范围：客栈甲接入（`rooms.json`、`assets/production/maps/m_qihe_inn_interior*_20261101.webp`、`js/qihe-rooms-data.js`、`js/qihe-town.js`、`js/qihe-staging-data.js`）、客栈战斗背景重出、南村口改名和菜牌挪位、东埠库棚和货物（`assets/production/maps/town-props-20261101/`）、3 份剧本改说法并代批。
- 更新记录：[2026-11-01-scene-audit](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-01-scene-audit.md)
- 留给接手的人：中央、接应院重跑用 `art_sources/qihe-scene-rebuild-20261101/adopt.py`；收尾批重跑顺序见更新记录；换房间图后要同步 `assets/production/maps/`，`build_rooms.py` 只写 `assets/`。发布前全量 68/80：11 个是老问题，`verify_expansion` 并发超时、单跑通过。

### 2026-11-01 · 全场站位与旧素材排查
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：已提交（`1a1feab`）并发布（main、qihe）
- 范围：新增站位表 `js/qihe-staging-data.js`、`js/qihe-staging.js`，对话框立绘 `js/qihe-dialogue-portraits.js`，小人重画 `art_sources/npc-sprites-20261101/`；改 `js/scene.js`、`js/qihe-chapter.js`、`js/qihe-expansion.js`、`js/dialogue-stage.js`。
- 更新记录：[2026-11-01-staging](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-01-staging.md)
- 排查记录：[2026-11-01-scene-audit](../../xiaojianghu-legacy-prologue/docs/updates/2026-11-01-scene-audit.md)
- 留给接手的人：站位以站位表为准，不要回到按主角位置自动摆人。

### 2026-10-31 · 结局 3 正式 CG「以书酬功」
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：已提交 `0cb6a84`（未推送），已发布到 main、qihe
- 范围：`art_sources/faces-redesign-20261030/adopted/cg/`、`assets/production/shared/cg_qh_lamp_blade_20261031.webp`、素材登记、`story/01-开始/支线-蔺管事-赏书.ink`（只加 CG 调用，台词未改，已按代评授权登记批准）、`js/qihe-fire-cinematic.js`。
- 更新记录：[2026-10-30-desk-finish](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-30-desk-finish.md)
- 留给接手的人：第三十二轮第 1 题新脸已通过；CG 正式版贴在同题等用户看。全量 80 个还有 11 个没过，和上一轮同一批。

### 2026-10-31 · 新脸定稿接入（宋甲＋蔺甲＋程甲）
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：已提交 `0cb6a84`（未推送），已发布到 main、qihe
- 范围：`assets/production/portraits`、`characters` 的宋先生、程铎、蔺管事新素材，`js/production-assets.js`、`js/qihe-cast-art.js`，素材登记和镂空白名单。
- 更新记录：[2026-10-30-desk-finish](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-30-desk-finish.md)
- 留给接手的人：等第三十二轮第 1 题验收；结局 3 正式 CG 等构图确认。

### 2026-10-31 · 查清剩余测试失败，提交并发布栖河
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：已提交（xiaojianghu-legacy-prologue `5821e84`；xiaojianghu 分支 `claude/desk-finish-20261031` 的 `d9fe0e9`，都没推送）；已发布（main、qihe 两个分支，10-31）
- 范围：补品阶与特效登记（`js/pei-companion-runtime.js`、`js/qh-mode-cultivation-martial.js`、`js/guiyun-combat-runtime.js`）；更新过时测试；按 R-发布-01 提交并发布（用户已许可）。
- 更新记录：[2026-10-30-desk-finish](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-30-desk-finish.md)
- 留给接手的人：全量还有 11 个没过，分类见更新记录；`verify_chapter_battle_art` 的素材缺失防护和 `qihe-journal-notices-browser` 没有结论。

### 2026-10-30 · 生成账本：生图和视频调用记账
- 工作区：两边
- 谁：Claude Code（骆驼传美术方法评估）
- 状态：本地完成（未提交、未发布）
- 范围：xiaojianghu：新增 `tools_common/genledger.py`，改 `tools_common/imggen.py`，加测试和文档。xiaojianghu-legacy-prologue：`art_sources` 下 3 份视频生成脚本接账本。没有调用计费接口。
- 更新记录：[2026-10-30-gen-ledger](updates/2026-10-30-gen-ledger.md)
- 留给接手的人：直接调 `flatimg.py` 和直接跑 `codex exec` 的路径没有入账；没用真实接口跑过；费用未换算。

### 2026-10-30 · 宋先生、蔺管事第三版；开始部分复查修两个真问题
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（未提交、未发布）
- 范围：
  - `art_sources/faces-redesign-20261030/` 重出四张候选，评审台第三十一轮第 1 题换图。
  - 修红绳 CG 预算（答应过宋先生的存档进不了培养）：`js/qihe-fire-cinematic.js`。
  - 修行囊图标回归：`js/qihe-jianghu-ui.js`。
  - 新增 `verify_route_sweep.cjs`；修 `verify_stranger`、`verify_representatives`、`verify_jianghu_ui` 的过时断言。
- 更新记录：[2026-10-30-desk-finish](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-30-desk-finish.md)
- 留给接手的人：
  - 全量 80 个测试还有 24 个没过，分类见更新记录；其中 4 个可能是真问题，没查。
  - 候选未入库，等用户挑。

### 2026-10-30 · 评审台剩余事项收尾
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（未提交、未发布）
- 范围：
  - 失手台词补了阿炭、小禾，加了测试；小耗子保底由我代批。
  - 粮仓清掉。
  - 9 个没有立绘的人改用 8 张身份通用立绘，查看页和商店已换上。
  - 物品图标 62 件按逸剑风云决式重画，已接进游戏，R-画风-02 已改。
  - 客栈店家可花钱压偷窃风声；培养部分 5 件实物和三场回扣台词。
  - 宋先生、蔺管事新脸第二版（候选），发第三十一轮。
  - check_review_batch 改为归档模块里的题也跳过。
- 更新记录：[2026-10-30-desk-finish](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-30-desk-finish.md)
- 留给接手的人：
  - 三张脸等第三十一轮第 1 题选定后再后期、补表情、补小指、重画结局 3 的 CG。
  - 查看页通用立绘等用户验收。

### 2026-10-29 · 帮众挑衅新版（新人阿炭）
- 工作区：两边
- 谁：Claude Code（栖河整改评审，从主会话接手的分会话）
- 状态：本地完成（未提交、未发布）
- 范围：
  - xiaojianghu-legacy-prologue：
    - 剧本 `奇遇-帮众挑衅.ink` 整份重写，已代批。
    - 出图 `art_sources/atan-20261029/`，立绘、地图小人已登记采用。
    - 代码：`qihe-hidden`、`qihe-npc-data`、`qihe-gift`、`qihe-jianghu-data`、`qihe-characters`、`qihe-chapter`、`index.html`。
    - 验证：`verify_hidden` 已改，新增 `shot_atan.cjs`。
  - xiaojianghu：
    - 设定：`story-atlas` 加 a-tan，人物卡 `阿炭.md`，定稿事实 F-0071。
    - 剧本相关：戏眼卡、回扣登记表。
- 更新记录：[2026-10-29-atan](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-29-atan.md)
- 留给接手的人：
  - 阿炭的战斗动作表没做，现在用帮众的战斗图。
  - `qh_recruit_returned` 的回扣，等游历部分设计时再定。

### 2026-10-29 · 培养部分去汉皋前剧情：Opus 排查与整改
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（未提交、未发布）
- 范围：
  - 进城前 40 场＋来客 3 段＋闲逛 W02～W07 逐场交 302 Opus 初筛，复核后改约二十处台词。
  - 两个场名改了：二师叔试手、送到城门。
  - 源头：chapter-two-dialogue.json、pre-xiangyang.json、household.js、data.js。
  - 生成物：qh-pre-hangao-data、scripts、dialogue。
  - 工具：新增 dump_precity_scenes.cjs；minimax_logic_review.py 加了 --background、--glob 两个参数。
- 更新记录：[2026-10-29-precity-logic-review](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-29-precity-logic-review.md)
- 留给接手的人：
  - 低档存疑约 50 条没复核。
  - 护腕、木鸟、镜片等后果要等汉皋城内剧情重新设计。
  - 还没在浏览器里实机点过。

### 2026-10-29 · 剧情逻辑排查改法落实
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（未提交、未发布）
- 范围：
  - xiaojianghu-legacy-prologue：
    - 改了 21 份剧本，其中 17 份已批准、按授权重新登记批准；另有 7 份由我代审后新登记批准。
    - 代码改了 qihe-map-trial、qihe-town、qihe-hidden、qihe-gift、qihe-gift-ui 五个文件，同时更新了 index.html 的版本号和送礼测试。
  - xiaojianghu：
    - 定稿事实改了 F-0009、F-0026、F-0028，废止 F-0031。
    - 剧情写作规范加了第九节；规则登记表加了 R-剧情-08。
- 更新记录：[2026-10-29-story-logic-fixes](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-29-story-logic-fixes.md)
- 留给接手的人：
  - 阿炭（帮众挑衅新版）、三张脸重设计、关系页方案还没做。
  - verify_representatives 是旧失败，不是这次引入的。

### 2026-10-29 · 剧情题改由我代评
- 工作区：xiaojianghu
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（评审台数据已写；剧本和代码还没改）
- 范围：
  - 评审台五道剧情题代评：第一夜、三方、风起、村中、隐藏奇遇。
  - 接住商店、跑步动画、蔺管事新脸、关系页四条回答。
  - review-desk skill 加了一节。
- 更新记录：[2026-10-29-story-review-delegated](updates/2026-10-29-story-review-delegated.md)
- 留给接手的人：
  - 各模块“等我做”里的改法都还没落实。
  - 其中改锁定事实 F-0009、F-0028，改已批准的《序章-进村第一夜》，都是按用户授权代批的。

### 2026-10-29 · 商店改回挂轴式界面
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成，评审台“商店界面”模块待用户验收；未提交、未发布
- 范围：`js/qihe-gift-ui.js`（shop 重写）、`js/qihe-gift-ui.css`（挂轴样式）、`index.html`（版本号）、`tools_scene/qihe/shot_shop.cjs`（新）
- 更新记录：[2026-10-29-shop-scroll](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-29-shop-scroll.md)
- 留给接手的人：照 10-09 确认的 docs/design/shop-ui-standard.md 做；店家、药商没立绘先放地图小人，等查看页那题定了再改

### 2026-10-29 · 评审台整理＋评审台管理 skill
- 工作区：xiaojianghu（脚本、skill、文档）；评审台 artifact
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成；评审台已更新（页面第 6 版、数据 64 条）；未提交
- 范围：新增 `tools_docs/review_desk_tidy.py`、`tools_docs/review_desk/index.html`（页面源码）、`.claude/skills/review-desk/SKILL.md`；改 `tools_docs/check_review_batch.py`、`docs/review-desk.md`、`docs/ai-onboarding.md`
- 更新记录：[2026-10-29-review-desk-tidy](updates/2026-10-29-review-desk-tidy.md)
- 留给接手的人：碰评审台先按 skill review-desk 跑 `review_desk_tidy.py --report`；欠用户的：新脸定后重画结局 3 CG、登记两份已通过剧本（商店界面已在下一条做完）

### 2026-10-29 · 开始部分全部剧本逻辑排查
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（只排查，没改剧本和代码）
- 范围：`story/01-开始/` 除北坡石洞（停用）、帮众挑衅（待改版）外的 63 个剧本，302 Opus 初筛＋复核
- 更新记录：[2026-10-29-logic-review-all](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-29-logic-review-all.md)
- 留给接手的人：改法已发评审台（第二十七轮补充、第二十八轮三题），等用户定了再改剧本和代码；评审台页面改为模块卡内可作答；低档存疑约 80 条未复核

### 2026-10-28 · 剧情逻辑初筛交给 MiniMax（新工具）
- 工作区：xiaojianghu
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成；确认的问题已拟改法发评审台第二十七轮第 1～4 题（帮众挑衅归第二十六轮第 2 题），待用户审
- 范围：新增 `tools_story/minimax_logic_review.py`。每个剧本连同逐分支路线、钩子登记上下游、相关定稿事实、人物卡、调用代码、人工审读清单原文、`--rules` 原则文件一起送 MiniMax 挑逻辑问题，主会话只复核；对 10-26 后改过的 64 个剧本跑了两轮
- 更新记录：[2026-10-28 隐藏奇遇](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-hidden.md)
- 留给接手的人：这是初筛，误报不少（多半是缺上下文）；主线按播放先后的前后场还没有导出，暂时靠文件头时点和定稿事实来接

### 2026-10-28 · 隐藏奇遇改为“化用不联动”：石洞先关，帮众挑衅改版待审
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（石洞关闭、评审题已发）；帮众挑衅新版与原则入规范等用户评审
- 范围：`js/qihe-hidden.js`（`CAVE_ON=false`）、`index.html`（hid4）、`tools_scene/qihe/verify_hidden.cjs`、设计稿第 10 节、剧情钩子登记备注；评审台第二十五轮第 2 题回答、第二十六轮第 1、2 题
- 更新记录：[2026-10-28 隐藏奇遇](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-hidden.md)
- 留给接手的人：石洞台词与素材都保留，别删；帮众挑衅旧版仍在游戏里，新版认了再换；全村平安符不改

### 2026-10-28 · 老更夫改写：暗合《连城诀》狄云，功法改《南窗心法》
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成（剧本未经审批；未提交、未上线）
- 范围：设计稿 [qihe-hidden-rewards.md](design/qihe-hidden-rewards.md) 第 9 节；评审台第二十五轮第 1 题（甲 连城诀狄云／乙 射雕郭靖／丙 楚留香）
- 更新记录：[2026-10-28-hidden.md](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-hidden.md)
- 留给接手的人：用户第二十五轮第 1 题选甲；第二、三回已重写（梆子刀痕、屋脊人影），物品换成 `qh_nanchuang_xf`；《南窗心法》数值是提案，要平衡后登 catalog.json

### 2026-10-28 · 落实评审台第二十三轮第 3、4、5、8 题的通过
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成；未发布、未提交
- 范围：story/01-开始/三方-对证.ink（散场三句回扣）、支线-蔺管事-灯四.ink（转述）、人物-算命先生.ink（铜板）、approved.json 登记 6 份；js/qihe-representatives.js；xiaojianghu：bible/人物 六张卡、qihe-mojiao-observer-sideline.md 第十二节、faction-reputation.md
- 更新记录：[2026-10-28-review23](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-review23.md)
- 留给接手的人：“他追上来”短版要等邻村有渡口再接

### 2026-10-28 · 隐藏奇遇 H1 北坡石洞、H2 老更夫、H3 帮众挑衅、H7 全村平安符接进游戏
- 工作区：两边（代码、剧本、素材在 xiaojianghu-legacy-prologue；设计稿第 8 节、回扣登记表在 xiaojianghu）
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成，剧本四份与新图两张待用户评审；未发布、未提交
- 范围：js/qihe-hidden.js（新）、story/01-开始/奇遇-*.ink（新四份）、js/story-data/qh_hid_*.js（生成）、js/qihe-fire-cinematic.js、js/qihe-acc-fx.js、index.html、art_sources/qihe-hidden-cave-20261028/（新）、assets/production/shared/cg_qh_north_cave_20261028.webp、assets/production/maps/hidden-cave-20261028/、素材三处登记、tools_scene/qihe/verify_hidden.cjs（新）；xiaojianghu：qihe-hidden-rewards.md 第 8 节、registry/story-hooks.json、bible/人物/村口老人.md
- 更新记录：[2026-10-28-hidden](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-hidden.md)
- 留给接手的人：《守更吐纳》已被《南窗心法》替换（见上一条）；叶蘅事后两句、行记线索、回访点、图标没做

### 2026-10-28 · 功能类佩饰、行诊药囊与走镖手札接上效果；改动清单条目移出格式样例
- 工作区：两边（代码在 xiaojianghu-legacy-prologue；xiaojianghu 只改本页）
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成；未发布、未提交
- 范围：js/qihe-acc-fx.js（新）、js/qihe-steal-data.js、js/qihe-npc-items.js、js/battle.js、js/bui.js、js/menu.js、js/shared-insight-pool.js、js/qihe-town.js、js/bfx.js、js/qihe-characters.js、index.html、tests/qihe-acc-fx.test.cjs（新）；本页之前有 6 条误写在“条目格式”样例代码块里，已移到条目区
- 更新记录：[2026-10-28-acc-fx](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-acc-fx.md)
- 留给接手的人：《寒魄符》参悟在开始部分没有入口；10-28 补：实战验证、行诊药囊（医具兵器）已做

### 2026-10-27 · 补做漏掉的模块卡意见（送礼不限次数、蔺管事重设计）＋叶蘅跑步上评审台
- 工作区：两边
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成，待用户评审（评审台第二十四轮第 4、6 题）；未发布、未提交
- 范围：js/qihe-gift.js、js/qihe-gift-ui.js、js/qihe-npc-core.js、index.html、tests/qihe-gift-no-slot-limit.test.cjs（新）、art_sources/qihe-lin-redesign-20261027/（新）；xiaojianghu：rules.json（R-画风-05）、art-pipeline.md、review-desk.md、tools_docs/check_review_batch.py、npc-gifts-and-inventory.md、npc-interaction-v2.md
- 更新记录：[2026-10-27-rectify-missed-notes](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-rectify-missed-notes.md)
- 留给接手的人：蔺管事新脸定了再改人物卡长相、补表情与地图小人、重画结局 3 CG

### 2026-10-28 · 叶蘅重设计地图形象＋叶蘅、主角的 Wan 走路／站立／闲置小动作
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code（叶蘅动作）
- 状态：本地完成，待用户看；未提交、未发布
- 范围：art_sources/ye-motion-video-20261028/、7 张新动作素材与登记（10-27 补叶蘅跑步 s_qh_ye_run_20261028）、js/core.js（ART.fidget）、js/scene.js（站久了播小动作）、js/qihe-ye-motion-art.js（新）、index.html
- 更新记录：[2026-10-28-ye-motion](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-28-ye-motion.md)
- 留给接手的人：其他人物要加闲置小动作，照 js/qihe-ye-motion-art.js 写 ART.fidget 即可

### 2026-10-27 · 第二轮评审意见整改（偷窃、商店、图标、粮仓、查看页、CG、隐藏奇遇）
- 工作区：两边
- 谁：Claude Code（栖河整改评审，接手会话）
- 状态：已并入下一条“评审台第二轮整改”（用户同时开了两个会话做同一批，由那条继续）；本会话写的商店交易面板被沿用，其余重复素材已由那条撤掉
- 范围：同下一条
- 更新记录：[2026-10-27-rectify-round2](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-rectify-round2.md)
- 留给接手的人：无，以下一条为准

### 2026-10-27 · 评审台第二轮整改
- 工作区：两边（实现在 xiaojianghu-legacy-prologue；偷窃、赠礼、交互、隐藏奇遇设计稿在 xiaojianghu）
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成，待用户评审（评审台第二十四轮 5 题）；未发布、未提交
- 范围：偷窃 5% 下限与戒心、武侠部件；删 19 件无用任务物品；商店交易面板（沿用另一会话所写）；像素版图标；粮仓预览；查看页紧凑版式；结局 3 CG 正式图；隐藏奇遇设计第 7 节
- 更新记录：[2026-10-27-rectify-round2](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-rectify-round2.md)
- 留给接手的人：用户同时开过两个会话做同一批整改，已停；js/scene.js 的“站久了的小动作”有一行被注释吞掉，属叶蘅动作视频那条线

### 2026-10-27 · 按模块整改：其余十个模块
- 工作区：两边（实现在 xiaojianghu-legacy-prologue；设计稿、检查脚本在 xiaojianghu）
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成，待用户评审（评审台第二十三轮 8 题）；未发布、未提交
- 范围：能偷谁与好感底线、吉兆删除、关系页纸签与头顶小签、查看页无立绘方案与门派一栏、采集物手绘图标、9 张交互地点战斗背景、货币“两”与物品改名、宋先生偷窃 1%、结局 3 CG 草图、新人物收礼台词（新剧本）、门人拒绝台词（新剧本）
- 更新记录：[2026-10-27-rectify-all-modules](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-rectify-all-modules.md)
- 留给接手的人：查看页两方案开关 QIHE_NPC_DATA.INSPECT_STYLE，用户选定后删另一种；补充剧本《人物-收礼与易物-补》与《人物-门派不睦》未批准

### 2026-10-27 · 按模块整改：偷窃小游戏、新素材融入场景
- 工作区：两边（实现在 xiaojianghu-legacy-prologue；偷窃设计稿、评审流程文档、检查脚本在 xiaojianghu）
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成，待用户评审；未发布、未提交
- 范围：js/qihe-steal*.js、qihe-steal-ui.css、js/qihe-town.js、8 件道具压色版与素材登记、tools_scene/qihe/shot_steal.cjs、shot_spots.cjs、npc-steal.md、review-desk.md、check_review_batch.py
- 更新记录：[2026-10-27-rectify-steal-props](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-rectify-steal-props.md)
- 留给接手的人：其余 9 个模块未动；宋先生成功率实机 9%、设计稿 1%，待查

### 2026-10-27 · 评审前自查流程与本轮评审合并
- 工作区：xiaojianghu
- 谁：Claude Code（栖河整改评审）
- 状态：本地完成；未提交
- 范围：新规则 R-评审-01、docs/review-desk.md、tools_docs/check_review_batch.py、导入引导与 CLAUDE.md 入口；评审台写入 12 个合并模块
- 更新记录：[2026-10-27-review-selfcheck](updates/2026-10-27-review-selfcheck.md)
- 留给接手的人：发评审前必须跑 check_review_batch.py；各模块整改未开始

### 2026-10-27 · 试玩反馈整改：Esc、旧精灵、站位、查看页立绘、物品体系与易物买卖分开、偷窃小游戏与保底、素材、多路自我评审
- 工作区：xiaojianghu-legacy-prologue（代码、素材）；xiaojianghu（设计稿）
- 谁：Claude Code（整改清单接手会话）＋会话内子代理 A～F
- 状态：本地完成，待用户评审（评审台第十九轮补 4 题、第二十一轮试玩整改 10 题、第二十二轮拍板 14 题）；未发布、未提交
- 范围：用户 2026-10-27 试玩反馈 10 条（墨印菜单 Esc、老人门口、查看页无立绘、圆簸箕、船家站位、粮仓太抽象、客栈旧精灵、以物易物与买卖分开并重设计 NPC 随身物品、偷窃小游戏简陋卡住要保底、多 agent 自我评审）
- 文件分工：子代理 A 偷窃小游戏（`js/qihe-steal-ui.js/.css`、`js/qihe-steal.js`）；B 物品体系（设计稿 `npc-gifts-and-inventory.md`、`js/qihe-npc-data.js`、`js/qihe-gift*.js`、`js/qihe-steal-data.js` 的物品难度）；C 查看页立绘（`js/qihe-npc-ui.js/.css`、新立绘素材）；D 素材（`art_sources/`、`assets/production/maps/`、三处登记）；E、F 只读评审；主会话其余文件（`js/qihe-aqi.js`、`js/qihe-town.js`、`js/qihe-lamp-watcher.js`、`js/qihe-chapter.js`、`index.html`、`story/`）
- 更新记录：[2026-10-27-dev](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-dev.md) 第四节；复查报告在 `docs/updates/evidence/2026-10-27-dev/review-visual/`、`review-flow/`

### 2026-10-27 · 开发：蔺管事支线、偷窃与小耗子、地图可交互物上图、门派关系页
- 工作区：xiaojianghu-legacy-prologue（运行代码、地图）；xiaojianghu（设计稿注记）
- 谁：Claude Code（整改清单接手会话）
- 状态：本地完成，待用户统一评审（评审台第十九轮剧情 8 份、第二十轮系统与界面 24 条）；已发布（用户「上线吧，我边玩边评审」）：main https://25a0e522.luotuo-36x.pages.dev 、qihe https://qihe.luotuo-36x.pages.dev ，curl 核对一致；未提交
- 范围：用户 2026-10-27：「完成所有的开发先吧，把遇到的问题先 mark，然后完成之后我再统一评审」。新 `js/qihe-lamp-watcher.js`、`js/qihe-town.js`、`js/qihe-aqi.js`、`js/qihe-steal*.js`、`js/qihe-jianghu-data.js`、`js/qihe-jianghu-rep*.js`；改 `js/qihe-chapter.js`、`js/qihe-representatives.js`、`js/qihe-npc-core.js`、`js/qihe-npc-data.js`、`js/qihe-gift.js`、`js/qihe-journal.js`、`js/qihe-jianghu-ui.js`、`js/qihe-resources.js`、`index.html`；新剧本 8 份（未批）；新道具七件 `assets/production/maps/town-props-20261027/`（三处登记，候选待评审）；新测试 `verify_lamp`、`verify_town`、`verify_aqi`、`verify_steal_real` 与偷窃、关系表驱动测试
- 更新记录：[2026-10-27-dev](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-27-dev.md)
- 留给接手的人：本条分三路同时改，文件分工——偷窃子任务（路由器 steal-20261027）：新 `js/qihe-steal*.js`，可改 `js/qihe-npc-core.js`、`js/qihe-npc-ui.js`、`js/qihe-npc-data.js`、`index.html`；关系页子任务（路由器 faction-20261027）：新 `js/qihe-jianghu-rep*.js`、`js/qihe-jianghu-data.js`，可改 `js/qihe-jianghu-ui.js/.css`；主会话：`js/qihe-chapter.js`、`js/qihe-representatives.js`、`js/qihe-expansion*.js`、`js/qihe-map-*.js`、新 `js/qihe-lamp-watcher.js`、`story/`。三路以外的人先别动这些文件

### 2026-10-27 · 第十八轮剧本 25 场由 Claude 代审代批
- 工作区：xiaojianghu-legacy-prologue（剧本、构建）
- 谁：Claude Code（整改清单接手会话）
- 状态：本地完成；已发布（用户本轮「上线我去游玩评审一下」）：main https://9484d9f7.luotuo-36x.pages.dev 、qihe https://qihe.luotuo-36x.pages.dev ，curl 核对一致；已提交并推送：xiaojianghu-legacy-prologue `codex/legacy-prologue-map` `cbe7f29`，xiaojianghu `main`（本条所在提交）
- 范围：`story/01-开始/` 下 15 场改过的已批准剧本＋10 场新写（人物-收礼与易物、支线-蔺管事 8 场、风起-小耗子），冷读后改 9 场，49 份全部 --approve；用户 2026-10-27：「这一版你自己去审批吧，符合之前说的文档开发流程就行」。`tools_story/build_ink.cjs` 支持字符串参数遍历；枣木短棍改由门厅陈伯当面给（`js/qihe-chapter.js`、`js/qihe-expansion.js`，新测试 `tools_scene/qihe/verify_club_gift.cjs`）；`verify_starter_equipment`、`verify_prologue` 跟新流程更新；反例库补一节
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第二十轮”一节）
- 留给接手的人：小耗子、蔺管事 8 场已批准但 JS 未接；红绳 `broken`、对证 `has_roster` 调用处未传（走基线）；冷读“建议改”里还有 R4-17／18、L7、L8、C1-08-05 没改

### 2026-10-27 · 评审台迁到新账号
- 工作区：两边（评审台为 claude.ai Artifact；只改了交接页一行）
- 谁：Claude Code（整改清单接手会话）
- 状态：完成；交接页改动随 `cbe7f29` 提交
- 范围：新评审台 https://claude.ai/artifact/7R9dsj6v3v5P2yp1qkFV6U （页面同旧台第 9 版，写入第十八轮及其 25 题）；交接页“不在仓库里”表格的评审台一行
- 更新记录：[换电脑交接](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-26-handover.md)
- 留给接手的人：新电脑登的是另一个 claude.ai 账号，旧台只拿到查看权限，Claude Code 读写不了它的数据；之后拍板题都发新台。第一～十七轮的回答、整改、截图只在旧台

### 2026-10-26 · 第十九轮：待过目剧本 25 场上评审台；换电脑交接
- 工作区：两边
- 谁：Claude Code（整改清单会话）
- 状态：已提交并推送（用户要求换电脑）：xiaojianghu `main` `a5770d1`、xiaojianghu-legacy-prologue `codex/legacy-prologue-map` `504c167`，含两个工作区里其他会话的未提交改动；剧本 25 场等用户在评审台第十八轮逐场批；未发布
- 范围：评审台第十八轮（15 场改过的已批准剧本＋10 场新写），评审台第 9 版（文字参考占满整行）；交接页 `xiaojianghu-legacy-prologue/docs/updates/2026-10-26-handover.md`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十九轮”一节）；[换电脑交接](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-26-handover.md)
- 留给接手的人：**先看交接页**。新电脑 `git pull` 两个分支；`art_sources/`、`review/` 不在 git 里，要的话整目录拷；剧本批完前构建不出包；生图密钥、共用笔记、记忆不在仓库里

### 2026-10-26 · 第十八轮：赠礼、赔礼、易物接进游戏
- 工作区：两边
- 谁：Claude Code（整改清单会话）
- 状态：本地完成，8792 实测，用户验收通过；台词剧本待用户过目；未提交；未发布
- 范围：`xiaojianghu-legacy-prologue`：新 `js/qihe-gift.js`、`js/qihe-gift-ui.js/.css`、`story/01-开始/人物-收礼与易物.ink`，改 `js/qihe-npc-core.js`、`js/qihe-npc-ui.js`、`index.html`，新素材 `assets/production/ui/trade-scale-20261026/`（三处登记）；`xiaojianghu`：`npc-gifts-and-inventory.md` 3.6.1 实装说明、戏眼卡 `scripts/briefs/qihe-gift-trade-lines-brief.json`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十八轮”一节）
- 留给接手的人：构建被已批准剧本的改动挡着不出包，面板气泡暂空，批准后构建即生效并补跑 story_lint；熟络回礼待接逐人表“回 ✓”。用户已验收（「可以」）；商店不改（「商店还是不变」）

### 2026-10-26 · 第十七轮：评审结果落地（红绳 CG 定稿入库、R-交互-01、对话框小头像、买卖统一挂轴商店、非地图镂空复核）
- 工作区：两边
- 谁：Claude Code（整改清单会话；镂空复核交子代理）
- 状态：本地完成，用户已验收（红绳定稿、R-交互-01、对话框小头像、镂空复核、修理台晾衣架重画）；“买卖统一挂轴商店”后来改为“商店还是不变”（见第十八轮条目）；未提交；未发布
- 范围：`xiaojianghu-legacy-prologue`：`assets/production/shared/cg_qh_backhill_rope_v4_20261026.webp` 与三处登记、`js/qihe-fire-cinematic.js`、`js/dialogue-stage.js`、`story/01-开始/风起-红绳.ink`（06k，待用户过目）；`xiaojianghu`：`docs/rules/rules.json`（R-交互-01，用户批准）、`npc-interaction-v2.md`、`song-red-cord-foreshadow.md`、改写稿草稿与演员简报、`review/batch2-ui/03`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十七轮”一节）
- 续（同日）：孩子小头像（`js/qihe-npc-pixel-art.js`、`js/qihe-characters.js`、`js/ui.js`、`index.html`）；修理台、晾衣架 302 重画写成新图集 `m_qh_central_props_regen_20261026`；易物秤可交互原型 `xiaojianghu/review/batch2-ui/trade-physics/`
- 续二：非地图镂空复核完成；33 张 Q 版立绘按用户批准原位替换（例外于 R-素材-01），旧图备份 `xiaojianghu-legacy-prologue/art_sources/asset-holes-backup-20261026/`；易物秤天平换四种预览待选（评审台第十六轮第 1 题）
- 留给接手的人：赠礼界面运行代码待做；易物秤天平待用户选样式后拆件进原型；镂空拿不准的 10 张待看；ink 改动待用户过目后 --approve

### 2026-10-26 · 第十六轮：赠礼、赔礼、交易照大侠立志传重做；评审台合并的题只在模块里出现
- 工作区：两边（设计稿、渲染图、素材候选；评审台为 claude.ai Artifact）
- 谁：Claude Code（整改清单会话）
- 状态：本地完成，第三版用户验收通过（之后易物改回大侠立志传做法并接进游戏，见第十八轮）；未提交；未发布
- 范围：`npc-gifts-and-inventory.md` 3.6、3.6.1、10.12；`npc-interaction-v2.md` 2.2、2.3；`review/batch2-ui/`（01、01b、02、03，旧图移 `_v3/`）；`xiaojianghu-legacy-prologue/art_sources/gift-trade-ui-20261026/`（新增 `scale_line` 秤纹候选，礼盘与 302 天平停用）；评审台第 8 版
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十六轮”一节）
- 留给接手的人：秤纹、界面均未采用、未入库；第十五轮第 4～9 题仍待用户重答

### 2026-10-26 · 第十五轮整改：赠礼交易器物 302 生图与交互、红绳 CG 第四版、评审台归档与链路
- 工作区：两边（设计稿、渲染图、素材候选；评审台为 claude.ai Artifact）
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：本地完成；礼盘天平方案被第十六轮取代，红绳 CG 第四版用户验收（甲 1）；未提交；未发布
- 范围：`npc-gifts-and-inventory.md` 3.6.1、`npc-interaction-v2.md` 2.3、`review/batch2-ui/`（01、01b、02、03）、`xiaojianghu-legacy-prologue/art_sources/gift-trade-ui-20261026/`；`song-red-cord-foreshadow.md` 第九节、`review/red-cord-cg-v4/`；评审台 https://claude.ai/artifact/Na9nuGC8efHNqeR2YxTNyr
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十五轮整改”一节）
- 留给接手的人：第十五轮第 4～9 题用户的回答没存上，待重答；倒木心里话 C1-10-06k 改哪句待定

### 2026-10-25 · 第十四轮整改（评审台）：交互统一进“谈”、赠礼赔礼交易界面重做、道具镂空修复与检查、红绳 CG 重新设计、新人物素材采用
- 工作区：两边
- 谁：Claude Code（整改清单会话，多 agent；登记类同步经 codex-router 分派）
- 状态：本地完成；整改已贴回评审台；红绳 CG 与新界面待用户在第十五轮选；未提交；未发布
- 范围：`npc-interaction-v2.md`、`npc-gifts-and-inventory.md`、`qihe-map-interactables.md`、`review/batch2-ui/`；道具镂空（`assets/production/` 新文件、`tools_assets/check_production.py` 加检查）；红绳 CG；新人物立绘与精灵登记；`docs/archive/router-subtasks.md` 调用场景
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十四轮整改”一节）
- 留给接手的人：用户回答在评审台 https://claude.ai/artifact/Na9nuGC8efHNqeR2YxTNyr 的 answers 集合

### 2026-10-25 · Godot 技术验证：复现绝招「云开见山」特效
- 工作区：新建独立目录 `godot-poc/`（不属于两个工作区，不接入游戏）；更新记录放 xiaojianghu
- 谁：Claude Code（Godot 迁移评估会话）
- 状态：本地完成；未提交；未发布
- 范围：只读引用 `_attic/2026-10-20-prototype/xiaojianghu` 的 `js/wuxia-fx.js`、`js/fx/fx-gy.js`；`sword_v1`、`gy_v1` 素材复制到 `godot-poc/project/`；两个工作区的运行代码与素材未改
- 更新记录：[2026-10-25-godot-yunkai-poc](updates/2026-10-25-godot-yunkai-poc.md)
- 留给接手的人：仅技术验证，不算特效评审通过，也不代表决定迁移；Web 导出未测（本机无导出模板）

### 2026-10-23 · 第十三轮第二批：ink 三道关改写、人物交互框架开发、新界面渲染图、新人物美术候选
- 工作区：两边
- 谁：Claude Code（整改清单会话，多 agent；过时测试修正经 codex-router 分派）
- 状态：本地完成；ink 改写 16 份待用户过目与批准（未 --approve）；人物交互框架已接入 8792 并截图验证；未提交；未发布
- 范围：分工与文件归属见共用笔记 `39-第二批分工.md`：《风起-小耗子》新写、《风起-赠物》、周婶三件与四处穿帮（第一夜五份、拜帖、旧货账）、对证断线版与蔺管事线；`js/qihe-npc-*`、`qihe-representatives.js`、`qihe-outsiders.js`、`qihe-expansion.js`；`review/batch2-ui/`、`review/batch2-cast/`；`tests/qihe-faction-clash-story.cjs`
- 更新记录：[2026-10-23-red-cord-script](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-red-cord-script.md)、[2026-10-23-xiaohaozi-script](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-xiaohaozi-script.md)、[2026-10-23-zhoushen-errands](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-zhoushen-errands.md)、[2026-10-23-lin-sideline-script](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-lin-sideline-script.md)；总记录 [2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十三轮第二批”一节）
- 留给接手的人：ink 改完未 --approve，等用户过目；`xiaojianghu/tools_story/minimax_actors.py` 默认 MiniMax-M2 已下线（本批用 --model MiniMax-M3），默认值待改

### 2026-10-23 · 第十三轮：汇总清单答完后的落实（设计、设定、数据同步、引擎半透明、差役采用、美术候选）
- 工作区：两边
- 谁：Claude Code（整改清单会话，多 agent；数据同步经 codex-router 分派）
- 状态：第一批本地完成（设计稿、设定、数据同步、引擎半透明、差役接线、周砚立绘修复、美术候选）；ink 与系统开发待下一批；未提交；未发布
- 范围：分工与文件归属见会话共用笔记 `32-第十三轮落实分工.md`；F-0027 等用户确认后再改；ink 改写与系统开发分批进行
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十三轮第一批”一节）
- 留给接手的人：用户只让动作会话提交其氛围版；本条不提交、不发布

### 2026-10-23 · 第十二轮：宋先生红绳伏笔重设计
- 工作区：xiaojianghu（设计稿与改写稿草稿），不改 ink、不改 bible
- 谁：Claude Code（整改清单会话）
- 状态：设计稿与改写稿草稿完成；用户 2026-10-23 已答 7 问（F-0027 待确认）；未改 ink 与 bible；未提交；未发布
- 范围：新稿 `docs/design/song-red-cord-foreshadow.md`；F-0027 拟改文；改写稿草稿 `docs/design/scripts/drafts/红绳伏笔-改写稿-草稿.md`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十二轮”一节）
- 留给接手的人：F-0027 是锁定条目，拟文须用户确认后才改

### 2026-10-23 · 开始部分战斗氛围版接入：生图氛围背景＋脚下柔影、暗角、人物受光
- 工作区：xiaojianghu-legacy-prologue（战斗背景素材、bstage.js/bfx.js/battle.js、production-assets 登记、index.html 缓存号）
- 谁：Claude Code（动作做法对比子会话）
- 状态：已提交（xiaojianghu-legacy-prologue `1d19b53`，分支 codex/legacy-prologue-map，未推送；只含本条涉及文件，共用文件里他人未提交改动未带入）；未发布
- 范围：四张战斗背景（练武场、撤离路、交锋、后山）氛围版 `bb_*_atmo_20261023` 新文件并登记，旧背景保留；战斗渲染加脚下柔影、暗角、迎光面受光；练武场与后山两键也被归云切磋、竹径狼战共用，一并换上
- 更新记录：[2026-10-23-battle-atmosphere](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-battle-atmosphere.md)（“续：接入战斗”一节）
- 留给接手的人：`tests/character-grounding.test.cjs` 原本就失败（drawImageAsset 未定义，与本次无关）；飘动火星／光尘若要加强另走特效流程
### 2026-10-23 · 第十一轮：货币单位统一为两、指南鱼坠换效果、说和人定为牙郎邵和
- 工作区：xiaojianghu（设计稿），不改运行代码
- 谁：Claude Code（整改清单会话；货币单位统一经 codex-router 分派）
- 状态：设计稿已改；未提交；未发布
- 范围：`docs/design/npc-steal.md`、`npc-gifts-and-inventory.md`、`faction-reputation.md`、`qihe-map-interactables.md`、`npc-spar-and-insight.md` 中的货币单位；指南鱼坠效果；各稿拍板记录
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十一轮”一节）
- 留给接手的人：运行代码里的币名（铜钱／文）未改，开发时再统一；装备目录里指南鱼坠仍写行走速度，要改源头 `tools_docs/build_armor_acc.py` 的数据后重生成

### 2026-10-23 · 战斗场景氛围概念：景深虚化、光斑、光束托出人物（保留 95 像素精灵）
- 工作区：xiaojianghu-legacy-prologue（art_sources/battle-atmosphere-20261023/）＋ xiaojianghu（review/battle-atmosphere/）
- 谁：Claude Code（动作做法对比子会话）
- 状态：概念图完成，用户已确认“生图氛围背景＋人物受光”，已接入（见上一条“开始部分战斗氛围版接入”）；未提交；未发布
- 范围：只出概念图，不改运行代码、不登记素材
- 更新记录：[2026-10-23-battle-atmosphere](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-battle-atmosphere.md)
- 留给接手的人：用户已定精灵保留 95 像素（清晰度方案 B/D 不采用）

### 2026-10-23 · 第十轮：删回火救孩子伏笔、宋先生可偷物升甲级
- 工作区：xiaojianghu（设计稿），不改运行代码
- 谁：Claude Code（整改清单会话）
- 状态：设计稿已改；遗留四问 2026-10-23 用户交由我们定（见第十三轮）；未提交；未发布
- 范围：`docs/design/npc-steal.md` 第 3.4 节、第 8.4 节；`npc-gifts-and-inventory.md` 宋先生一行
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第十轮”一节）
- 留给接手的人：宋先生甲级物是开始部分丙级上限的例外，用户第十轮定

### 2026-10-23 · 战斗精灵清晰度方案试验（向八方旅人 / 逸剑风云决靠）
- 工作区：xiaojianghu-legacy-prologue（_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/clarity-spec-trial-20261023/）＋ xiaojianghu（_attic/2026-10-23-motion-candidates/files/xiaojianghu/review/clarity-spec-trial/）
- 谁：Claude Code（动作做法对比子会话）
- 状态：已结：用户决定不采用（“还是用我们的原方案，95 像素”，改走背景氛围路线），候选移入 `_attic/2026-10-23-motion-candidates/`；不提交
- 范围：只出候选与模拟图，不改运行代码、不改 docs/battle-sprite-spec.md、不登记素材
- 更新记录：[2026-10-23-battle-clarity-spec](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-battle-clarity-spec.md)
- 留给接手的人：B、D 两档与整数倍渲染均不做，精灵规格不变；原作对照页 refs.html 只引用 Steam 官方截图地址，未下载

### 2026-10-23 · 子任务经路由器分流（Codex 外壳＋Claude 5.5）
- 工作区：两边（脚本与文档在 xiaojianghu）
- 谁：Claude Code
- 状态：本地完成；未提交
- 范围：新脚本 `tools_common/codex-router.sh`；`tools_por/.env` 加 `ENTERPRISE_API_KEY`；新文档 `docs/archive/router-subtasks.md`；规则 R-子任务-02（用户 2026-10-23：“这边也需要同样的分流”）；`ai-onboarding.md`、根目录 `CLAUDE.md` 引用
- 更新记录：[2026-10-23-router-subtasks](updates/2026-10-23-router-subtasks.md)
- 留给接手的人：脚本须在沙箱外运行；子任务汇报不算证据，主会话要重跑检查

### 2026-10-23 · 战斗动作两种做法对比：生图逐帧 vs Wan 视频抽帧（萧白钢剑普攻）
- 工作区：xiaojianghu-legacy-prologue（来源批次 _attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/motion-method-compare-20261023/）＋ xiaojianghu（评审页 _attic/2026-10-23-motion-candidates/files/xiaojianghu/review/motion-method-compare/）
- 谁：Claude Code（动作做法对比子会话）
- 状态：已结：复杂技能与复杂招式用户定“弃用”，候选移入 `_attic/2026-10-23-motion-candidates/`；战斗精灵生图源用户定“优先用 302”（与 R-生图-01 当前源一致，不换 codex）；未提交（候选已归档，不提交）
- 范围：只出候选与对比页，不登记素材、不接线、不改运行代码；新增 `docs/updates/2026-10-23-motion-method-compare.md`；续做复杂技能混合做法（批次 _attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/skill-hybrid-motion-20261023/、评审页 _attic/2026-10-23-motion-candidates/files/xiaojianghu/review/skill-hybrid-motion/）；画风偏离定位（art_sources/style-drift-check-20261023/、review/style-drift-check/）
- 更新记录：[2026-10-23-motion-method-compare](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-23-motion-method-compare.md)
- 留给接手的人：结论是普攻用生图整组、慢的连续动作用视频；复杂技能混合做法已弃用，《战斗表现边界》不放开；画风偏离定位（style-drift-check）保留作诊断记录
### 2026-10-23 · 第九轮拍板：定稿事实加三条、小耗子第一单重设计、宋先生可偷物、「关系」页签
- 工作区：xiaojianghu（bible 与设计稿、渲染图），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：设计稿完成；问题已在第十、十一轮答完（村镇关系照现稿）；未提交；未发布
- 范围：`bible/定稿事实.md` 新增 F-0060～F-0062（用户第九轮“都加”）、`bible/人物/阿七.md` 第一单改为方向性描述；`npc-steal.md`（第一单、三条小剧情精简、宋先生可偷物）；`faction-reputation.md` 与 `review/faction-reputation/`（页签改「关系」、汉皋说和新人物、官府不收钱）；`npc-gifts-and-inventory.md`（周砚传心法暂缓）
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第九轮”一节）
- 留给接手的人：村镇关系用户说“要改”未说改哪；第 17～20 项未答

### 2026-10-22 · 第八轮拍板：「声名」页仿大侠立志传、小耗子并阿七落设定、周砚另传绝级心法、差役战斗形象
- 工作区：两边（设计稿、bible、atlas 在 xiaojianghu；差役美术候选在 xiaojianghu-legacy-prologue/art_sources），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：设计稿、设定文件、渲染图完成；新问题已在第九轮答完；差役候选 2026-10-23 用户定为正式采用（落实中）；未提交；未发布
- 范围：`faction-reputation.md` 与 `review/faction-reputation/`；`npc-steal.md`、`story-atlas.json`（a-qi）、新建 `bible/人物/阿七.md`、全流程人物页（用户 12 项批准合并）；`npc-gifts-and-inventory.md`、`npc-spar-and-insight.md`；差役战斗形象候选 `xiaojianghu-legacy-prologue/art_sources/bailiff-battle-20261022/`、对照图 `review/bailiff-battle/`；`review/faction-reputation/` v3、`review/npc-steal/03` 重出
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第八轮”一节）
- 留给接手的人：小耗子与阿七名字关系为主会话理解，待用户确认

### 2026-10-22 · 第七轮拍板：声誉改单轴、「声名」页重做、小耗子并入阿七、兵器熟练分类
- 工作区：xiaojianghu（设计稿与渲染图），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：设计稿与渲染图完成；22 个新问题已在第八轮答完；未提交；未发布
- 范围：`docs/design/faction-reputation.md` 与 `review/faction-reputation/`；`npc-steal.md`（小耗子并入阿七、宋先生可偷物改为剧情道具／实用物、数据驱动架构）；`npc-gifts-and-inventory.md`、`npc-spar-and-insight.md`（周砚剑诀、兵器熟练、叶蘅请教、对证断线改写稿草稿 `docs/design/scripts/drafts/三方-对证-断线版-草稿.md`）
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第七轮”一节）
- 留给接手的人：F-0027 不改了（用户：藏的东西不是用来说明身份的）

### 2026-10-22 · 第六轮拍板：门派关系与声誉系统、偷窃难度曲线、邻村站位
- 工作区：xiaojianghu（设计稿与渲染图），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：设计稿与渲染图完成；28 个新问题已在第七轮答完；未提交；未发布
- 范围：新稿 `docs/design/faction-reputation.md`（门派关系＋声誉，含界面渲染图）；修订 `npc-steal.md`、`npc-gifts-and-inventory.md`、`npc-spar-and-insight.md`；`review/faction-reputation/`；`review/npc-steal/` 01、01b 重出（旧图 `_v2/`）；`review/qihe-map-interactables/layout-refuge-v2.png`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第六轮”一节）
- 留给接手的人：第 13 项宋先生可偷物会触及定稿事实 F-0027，须用户明确同意

### 2026-10-22 · 偷窃、赠礼、切磋三稿逐项拍板与修订
- 工作区：xiaojianghu（设计稿与渲染图），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：三稿修订完成；问题已在第六轮答完；未提交；未发布
- 范围：`docs/design/npc-steal.md`、`npc-gifts-and-inventory.md`、`npc-spar-and-insight.md`、`npc-interaction-v2.md`（菜单第八枚印“窃”）；`review/npc-steal/` 重出（旧图在 `_v1/`）
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第五轮”一节）
- 留给接手的人：用户拍板原话见各稿待拍板节；G9（新提四件物品）用户未答

### 2026-10-22 · NPC 交互第 10 节拍板与细化：偷窃、赠礼与随身物品、切磋
- 工作区：xiaojianghu（设计稿与渲染图），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：三份子文档完成；问题已在第五～六轮答完；未提交；未发布
- 范围：`docs/design/npc-interaction-v2.md` 第 10 节改为拍板记录；新子文档 `docs/design/npc-steal.md`、`npc-gifts-and-inventory.md`、`npc-spar-and-insight.md`；渲染图 `review/npc-steal/`、`review/npc-spar/`；概念素材 `xiaojianghu-legacy-prologue/art_sources/npc-steal-concept-20261022/`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第四轮”一节）
- 留给接手的人：用户拍板原话在主稿第 10 节表里；“亲眼见过的招式”例外已定不要（严格按等级差分档），两份稿已同步

### 2026-10-22 · 整改清单第三轮：环形交互菜单重新设计、魔教新人物改为与岑霜同级
- 工作区：xiaojianghu（设计稿与渲染图），不改运行代码
- 谁：Claude Code（整改清单会话）
- 状态：完成；环形菜单定甲「金石朱印」，新人物与岑霜同级；未提交；未发布
- 范围：`review/npc-interaction-v2/` 新增 05b、06～09 与 `xiaojianghu-legacy-prologue/art_sources/npc-ring-menu-concept-20261022/`；与 `docs/design/npc-interaction-v2.md` 相关段；`docs/design/qihe-mojiao-observer-sideline.md` 人物位阶
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第三轮”一节）
- 留给接手的人：用户认可半圈墨印的形式，嫌样式丑；新人物与岑霜同级，“岑地位高只是因为身份和背景问题，后面会提及”

### 2026-10-22 · 整改清单第二轮：NPC 交互界面重做、归烬堂支线重写、小孩支线改猜字谜
- 工作区：xiaojianghu（设计稿与渲染图），不改运行代码
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：完成；后续各轮已拍板；未提交；未发布
- 范围：`docs/design/npc-interaction-v2.md` 与 `review/npc-interaction-v2/`（按用户反馈重做，第一版图移到 `_v1-被否/`）；`docs/design/qihe-mojiao-observer-sideline.md`（按用户给的三结局重写）；`docs/design/qihe-map-interactables.md` 第 5.3 节（小孩支线改猜字谜）
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)（“第二轮”一节）
- 留给接手的人：裴嵩在 bible 里是正道盟的人，不是魔教，支线人设要用户确认；第一版支线稿移入 `docs/archive/design/`；布置图 west、north 两张还画着撤掉的小孩点

### 2026-10-21 · 栖河开始部分整改清单（六项，用户微信清单 1.md）
- 工作区：两边（实现在 xiaojianghu-legacy-prologue，新人物与支线设计在 xiaojianghu）
- 谁：Claude Code（整改清单会话，多 agent）
- 状态：第 1、3 项本地完成；第 4 项设计已定待开发；第 2、5、6 项 2026-10-23 用户已答完，落实中；未提交；未发布
- 范围：①碰撞与遮挡：`js/qihe-expansion-data.js`、`js/qihe-rooms-data.js`、`js/scene.js`、`js/qihe-map-trial.js`、6 个 `art_sources/qihe-modular-*/out/hd/scene.json`、`tools_scene/qihe/occlusion_fixes_20261021.json` 与 `fix_occlusion_20261021.py` ③立绘路径与下沿渐隐：`js/qihe-journal.js`、`js/ui.js`、`js/qihe-ui-model.js`、`js/dialogue-stage.js` ②④⑤⑥设计稿：`xiaojianghu/docs/design/opening-errands-rework.md`、`npc-interaction-v2.md`、`qihe-map-interactables.md`、`qihe-mojiao-observer-sideline.md`；渲染图在 `xiaojianghu/review/npc-interaction-v2/`、`review/qihe-map-interactables/`
- 更新记录：[2026-10-21-rectify](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-rectify.md)
- 留给接手的人：用户截图读不到，位置是自己找的，等用户核对；重跑地图编译脚本后要再跑 `fix_occlusion_20261021.py`；ink 没改、没 `--approve`；第 2 项和第 6 项对“监督三派”的理解不一致，等用户定

### 2026-10-21 · 发布栖河试玩版到线上
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code
- 状态：已发布（main、qihe）；未提交 git
- 范围：`node scripts/build-pages.cjs` 构建，wrangler 部署 main 与 qihe（用户本轮许可：“上传到线上”）；包含本地已完成未发布的全部改动
- 更新记录：[2026-10-21-deploy](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-deploy.md)
- 留给接手的人：此前各条“未发布”的内容都已随这次上线

### 2026-10-21 · 302.AI 备用密钥（额度不够时自动换用）
- 工作区：xiaojianghu
- 谁：Claude Code
- 状态：本地完成；未提交
- 范围：`tools_common/imggen.py`、`tools_common/imgsources.json`（302ai-sunburst 加 `key_env_backup`）；密钥写入 `tools_por/.env`（R-生图-03）
- 更新记录：[2026-10-21-302-backup-key](updates/2026-10-21-302-backup-key.md)
- 留给接手的人：没能联网验证备用密钥；302 额度不足的真实报错若不是 402 也不含余额／额度字样，要补进 `QUOTA_WORDS`

### 2026-10-21 · 开始部分：收拾药箱冷读三处原有问题
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code
- 状态：本地完成；未提交；未发布
- 范围：`story/01-开始/风起-收拾药箱.ink`（C1-03-05、C1-03-07、C1-03-B1）
- 更新记录：[2026-10-21-packing-coldread](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-packing-coldread.md)
- 留给接手的人：用户 2026-10-21 要求改并批准，已登记指纹；C1-03-07 仍有超 40 字提示（原有）

### 2026-10-21 · 开始部分：药棚小纸包、告诉周先生两处补下文
- 工作区：xiaojianghu-legacy-prologue（定稿事实在 xiaojianghu）
- 谁：Claude Code
- 状态：本地完成；未提交；未发布
- 范围：`story/01-开始/风起-药棚帮忙.ink`、`风起-商量去处.ink`、`风起-山居.ink`；`story/_共用/flags-风起主线.json`；`registry/story-hooks.json`；`bible/定稿事实.md`
- 更新记录：[2026-10-21-clinic-seeds-zhou](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-clinic-seeds-zhou.md)
- 留给接手的人：用户定：小纸包是母亲留的药圃种子；周砚认得温行舟的字、不懂「归元」；三场已批准登记指纹；收拾药箱冷读挑出的原有问题未改

### 2026-10-21 · 去掉“一年串门至少 10 段”的门槛
- 工作区：xiaojianghu-legacy-prologue
- 谁：Claude Code
- 状态：本地完成；未提交；未发布
- 范围：`tools_scene/qihe/verify_household.cjs` 删去 `strollPace.visits>=10`（用户定：串门不设段数，闲逛地点多、剧情还要陆续补）；“每段串门都能遇到”的检查保留
- 更新记录：[2026-10-21-pei-redo](updates/2026-10-21-pei-redo.md)（末尾补记）
- 留给接手的人：`verify_household` 33 项全过；裴知古条目里“待拍板”的段数一项已了结

### 2026-10-21 · 改动清单 changelist.md 与规则 R-文档-03
- 工作区：两边
- 谁：Claude Code（开始部分评审会话）
- 状态：本地完成；未提交；未发布
- 范围：新建本页；`docs/rules/rules.json` 加 R-文档-03（已按用户要求 `--approve-rules`）；`tools_docs/check_docs.py` 加第 5 项检查；导入引导第 6 节、根目录与两个工作区的 AGENTS.md、根目录 CLAUDE.md 加上这一步；补登当天已有的 7 份更新记录
- 更新记录：[2026-10-21-changelist](updates/2026-10-21-changelist.md)
- 留给接手的人：今天之前的更新记录没有补登（检查从 2026-10-21 起算）

### 2026-10-21 · 开始部分：宋先生线改可选、删两项划水活动、主线到地点确认、任务时限
- 工作区：xiaojianghu-legacy-prologue（设计文档在 xiaojianghu）
- 谁：Claude Code（开始部分评审会话）
- 状态：本地完成；未提交；未发布；用户正在 8792 实际试玩
- 范围：`story/01-开始/` 下竹匾、后山回话一二、宋先生闲话、次日药摊、主线找人、随口一句、装卸路、对证（已批准）；`js/qihe-chapter.js`、`qihe-representatives.js`、`qihe-outsiders.js`、`qihe-menu.js`、`qihe-navigation.js`、`qihe-expansion.js`、`qihe-journal.js`、`index.html`；`tools_scene/qihe/verify_*`；设计 `opening-pei-disguise.md`、`opening-state.md`（2a 节时限表）、`registry/story-hooks.json`；归档 `luotuozhuan/_attic/2026-10-21-opening-trim/`
- 更新记录：[2026-10-21-opening-optional-song](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-opening-optional-song.md)
- 留给接手的人：时限表是设计方案，等用户试玩反馈；走进主线地点会弹确认，新写测试切场景前要先接这个选择或记 `mainDismissed`；`verify_interactions` 原本就会挂起；`verify_relationships` 失败与本条无关

### 2026-10-21 · 裴知古人设与进城前剧情推倒重来
- 工作区：两边（设计在 xiaojianghu，运行接入在 xiaojianghu-legacy-prologue）
- 谁：（补登，原作者未写明）
- 状态：本地完成；未提交；未发布
- 范围：人物卡 `companions/pei-zhigu-valley.md`；`js/qh-mode-cultivation-neighbors.js`、`js/qh-pre-hangao.js`
- 更新记录：[文档库](updates/2026-10-21-pei-redo.md)、[运行接入](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-pei-redo.md)
- 留给接手的人：`verify_household` 的“一年串门至少 10 段”现为 8 段，待用户拍板；第二、三批未做

### 2026-10-21 · 进城前培养阶段剧情全面评审
- 工作区：两边
- 谁：（补登，原作者未写明）
- 状态：本地完成；未提交；未发布
- 范围：第 0～20 期 40 场；知古“认识”门槛改为 `met_pei`
- 更新记录：[2026-10-21-precity-review](updates/2026-10-21-precity-review.md)
- 留给接手的人：第五节有待用户拍板的项

### 2026-10-21 · 进城前剧情素材：白边与大小统一
- 工作区：xiaojianghu-legacy-prologue
- 谁：（补登，原作者未写明）
- 状态：本地完成；未提交；未发布
- 范围：进城前 40 场用到的 Q 版立绘与背景；新脚本 `tools_scene/qihe/audit_story_actors.py`、`register_faces.py` 等
- 更新记录：[2026-10-21-actor-fringe-size](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-actor-fringe-size.md)
- 留给接手的人：与 R-素材-01 的关系待拍板；`duo_gn_lamp_ladder_trial.png` 是否改名待定

### 2026-10-21 · 培养 Q 版剧场：人物朝向（朝左立绘入库与接入）
- 工作区：xiaojianghu-legacy-prologue
- 谁：（补登，原作者未写明）
- 状态：本地完成；未提交；未发布
- 范围：43 张朝左立绘入库（`household-v1/*_left.png` 等）；培养剧场运行时；评审入口加 `&phase=`
- 更新记录：[2026-10-21-facing-left](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-facing-left.md)
- 留给接手的人：见该记录“未做与待拍板”

### 2026-10-21 · 岑霜四向走跑（视频后期版）入库
- 工作区：xiaojianghu-legacy-prologue
- 谁：（补登，原作者未写明）
- 状态：本地完成；未提交；未发布
- 范围：`s_qh_censhuang_walk/run_20261021`；`js/qihe-censhuang-motion-art.js`；`art_sources/censhuang-motion-video-20261021/`
- 更新记录：[2026-10-21-censhuang-video-motion](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-censhuang-video-motion.md)
- 留给接手的人：线上发布须用户另行许可

### 2026-10-21 · 萧白蓝衣走跑换成视频后期版
- 工作区：xiaojianghu-legacy-prologue
- 谁：（补登，原作者未写明）
- 状态：本地完成；未提交；未发布
- 范围：`s_qh_hero_blue_walk/run_20261021`；`js/qihe-hero-blue-art.js`；评审入口 `js/qihe-hero-motion-review.js`（`?journey=hero-anim-test&play=1`）
- 更新记录：[2026-10-21-hero-video-motion](../../xiaojianghu-legacy-prologue/docs/updates/2026-10-21-hero-video-motion.md)
- 留给接手的人：线上发布须用户另行许可
