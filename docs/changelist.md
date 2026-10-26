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
- 范围：`npc-interaction-v2.md`、`npc-gifts-and-inventory.md`、`qihe-map-interactables.md`、`review/batch2-ui/`；道具镂空（`assets/production/` 新文件、`tools_assets/check_production.py` 加检查）；红绳 CG；新人物立绘与精灵登记；`docs/router-subtasks.md` 调用场景
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
- 范围：新脚本 `tools_common/codex-router.sh`；`tools_por/.env` 加 `ENTERPRISE_API_KEY`；新文档 `docs/router-subtasks.md`；规则 R-子任务-02（用户 2026-10-23：“这边也需要同样的分流”）；`ai-onboarding.md`、根目录 `CLAUDE.md` 引用
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
