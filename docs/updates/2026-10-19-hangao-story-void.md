# 2026-10-19 汉皋剧情作废、襄阳改为未设计的新城市

状态：现行　最后核对：2026-10-19

承接[襄阳清理记录](2026-10-19-xiangyang-sweep.md)第六节的遗留问题。用户 2026-10-19 拍板（要点）：

1. 襄阳**算**以后的地区／新城市，但“所有剧情都没有设计，需要重新去设计的，算是一个新城市”。
2. “汉皋的剧情也还没定，只是指定了有哪些商铺之类的系统而已，所以取消现有剧情的设计，后面另起炉灶”。
3. 秘籍和武学获取地点放在襄阳的：“暂时清空，后面重新安排”。
4. 陆衡推荐信（H6）原指襄阳城西镖局，改为汉皋的远山镖局（陆衡借住那里）。
5. 青蚨散案“可以作为苏芷的初始剧情，但是具体的情节对话需要重新审核设计（现阶段暂时先不处理，后面和别的一起处理）”。

本次只做作废、清空、标“待重新设计”，不新写剧情（R-剧情-05），不说“第几章”（R-剧情-02），不删除只归档（R-清理-01），不提交 git（R-git-01）。改动前的原文都备份在 `_attic/2026-10-19-hangao-story-void/`（保持相对路径），附 `manifest.json` 与 `restore.sh`，可一键还原。

## 一、口径

| 内容 | 处理 |
|---|---|
| 汉皋的城市布局、街区、店铺、货架、城市系统、空间切分、建筑、栖月楼建筑与场景 | 保留，继续现行 |
| 汉皋城内剧情：年一5月端阳药案（续脉丸）、寿宴、主线 HG-M、初识 HG-C、支线 HG-S、栖月楼篇、二年正月汉皋群像（HG2）、人物在汉皋的初见／再会 | 作废，待重新设计；纯剧情页归档，夹带在系统页里的标“剧情已作废，待重新设计” |
| “入汉皋前补全”（`pre-hangao-completion-20261013/`） | 培养第一年剧情，继续现行；只把交接到城内的部分标待重新设计 |
| 第5月、第13月整月外出的日历占期 | 保留占期，城内内容待重新设计 |
| 襄阳 | 保留地区与地理；剧情、事件、人物安排一律作废、待重新设计 |
| 放在襄阳的秘籍、武学、装备获取地点 | 清空为“待安排” |

## 二、归档清单

移到 `xiaojianghu/docs/archive/design/`，页首改“状态：历史”并加归档说明，所有指向它们的 markdown 链接（含 docs/updates、两个工作区）已改到新位置。

| 页面 | 原因 |
|---|---|
| [hangao-story.md](../archive/design/hangao-story.md) | 汉皋年一5月主线、初识、支线纲要，纯剧情 |
| [scripts/hangao-main.md](../archive/design/scripts/hangao-main.md) | 汉皋主线逐场稿 |
| [scripts/hangao-side.md](../archive/design/scripts/hangao-side.md) | 汉皋初识与支线逐步设计 |
| [qiyue-story-review-20261016/](../archive/design/qiyue-story-review-20261016/README.md)（整目录） | 栖月楼第二稿剧情评审 |
| `qiyue-story-review-20261014/` 剩余的 author.py、build_review.py、story.json、validate.py、validation.json | 该稿 README 与逐句稿早已归档，脚本与数据并入同一归档目录 |

两份 `build_review.py` 按原相对路径计算输出位置，归档后不能再直接运行；它们只供追溯。

**读过、判为不归档的：**

- `hangao-qiyue-complete-preview.md`：只讲栖月楼室内比例预览（家具量尺、角色叠加），属于建筑与场景，保留现行。
- `hangao-qiyue-scenes-v4.md`：栖月楼分场景制作，保留；只在“剧情与边界”一节标剧情承接作废。
- `scripts/hangao-qiyue*.md`：现行目录里已不存在（`hangao-qiyue.md` 早已归档）。

## 三、改写（约 314 处，89 份文件；另改链接 158 处，31 份）

- **汉皋系统页**：`hangao-city.md`、`hangao-systems.md`、`hangao-shops.md`、`hangao-city-spaces.md` 页首加作废说明；店铺页每家的“剧情”“剧情变化”条目标“已作废，待重新设计”；城市页店铺表“关联”一栏、第5节“门派人物在城中”、制作顺序里的剧情内容标作废；空间页寿宴夜景、寿宴主院等标作废；城市系统第17节叶蘅、周砚本月日程标旧稿。`system-completion-20261016/city-integration.md`、`city-time-economy.md` 加说明。
- **人物初见改中性写法**：苏芷、唐照雪、裴砚秋、闻疏桐、段明棠、石长庚、乔行舟、柳含烟、秦绯鸢、霍逐尘、陆衡、阮青雀（时间线与登记数据）、晏小楼（时间线与登记数据）的“汉皋初见／汉皋初识／寿宴初见”，改为“（初见地点与剧情待重新设计）”并保留“原写……”；徐令仪、岑霜、沈雁回的“汉皋再会”改为“再会（地点与剧情待重新设计）”。涉及人物页、门派页（“汉皋初识与后续行动”节名改“初识与后续行动”）、`cast.md`、`cast-timeline.md`、`companions.md`、`companion-men.md`、`companion-power.md`、`companion-recruitment.md`、`party-pets.md`、`protagonist-sect.md`、`opening-three-representatives.md`、`bible/人物/徐令仪.md`，并同步 `story-atlas.json`（64 处）、`companion-performance.json`、`cast-visuals.md`、`faction-styles.md`。
- **叶蘅“与苏芷共同救老周”**（`cast-timeline.md` 与 `story-atlas.json`）：改为“初见苏芷与了解白鹇谷机会的剧情待重新设计（原写……老周是旧襄阳演示人物，汉皋剧情也已作废）”。
- **剧情总纲类页面**加页首作废说明，写明哪些汉皋内容作废：`timeline.md`、`world-map-journeys.md`、`event-scheduling-system.md`、`ye-routes.md`、`story-framework-review.md`、`story.md`、`story-payoffs-review.md`、`story-decisions.md`（汉皋群像一节）、`story-rework-20261016/companions.md`、`fullflow-story-20261016/` 下 11 份、柳含烟／秦绯鸢／裴知古人物页。
- **入汉皋前补全**（6 份）：页首说明本组继续现行，只有交接到城内的部分（HG-M01、汉皋 T1、HG-C12 续见、入城后核验）待重新设计；README 两处交接句改写。邀请台词里的“祁老过寿、端阳药市与试艺”是城内剧情的引子，台词本次不改。
- **武学数据**：“苏芷汉皋任务体验”“苏芷襄阳任务体验”改为“苏芷初见任务体验（初见剧情待重新设计）”（`catalog.json`、`martial-systems-v2.json`、`literary-grade-matching.json`、`move-contracts.md`、`white-heron.md`）。
- **导航**：设计目录 README、栖河 README 等指向已归档剧情稿的链接加“（已作废归档）”。

## 四、复核上一轮“改汉皋”的结果

上一轮依据 `hangao-story.md` 第8节把一批“襄阳”改成了“汉皋”，本次逐条复核：

| 类别 | 结论 |
|---|---|
| 人物初见／再会改到汉皋（苏芷、柳含烟、秦绯鸢、阮青雀、裴知古书铺续见、乔行舟、晏小楼、霍逐尘、陆衡、唐照雪、裴砚秋、徐岑沈、各前辈“通过汉皋代表、寿宴”） | 属剧情安排，全部改为“初见／再会地点与剧情待重新设计”，不再写成汉皋已定 |
| 寿宴、城中救治、苏芷引荐、试艺（`delivery.md`、`protagonist-sect.md`、`mountain-cultivation-*.md`、`cultivation.md`、`hangao-city.md` 归云谷一行） | 属剧情，改为待重新设计 |
| 清徽阁“给汉皋、襄阳乐坊授课”、林清徵汉皋寿宴听曲 | 授课地点改为待重新安排；寿宴听曲标作废 |
| 栖月楼在汉皋花巷（`hangao-city.md` 第8节、`faction-styles.md`、人物页“汉皋栖月楼的艺人”） | 用户 2026-10-09 确认的建筑位置，属城市与店铺，保留 |
| 年一5月整月外出去汉皋、“入谷至第5月汉皋前”“第一次去汉皋前”等日程称呼（含栖河 `guiyun-household.md`、`content-guide.md`、`startup.md`） | 属日程与入汉皋前剧情，保留 |
| 殷红缨“顺路同去，在城门处离开” | 在入汉皋前补全里已有对白，属城门外，保留 |
| 装备来源“汉皋铁铺／成衣铺购买”（`weapon.md`、`armor.md`） | 属店铺，保留 |
| 平衡阶段名“年一夏汉皋” | 数值阶段标签，保留 |
| 牛皮护心甲“汉皋铁铺、镖局” | 原为襄阳，按第五节清空为“待安排” |

## 五、襄阳（A）与秘籍地点清空（C）

- [大地图](../design/world-map-layout.md)页首写明“**襄阳：以后开放的新城市，剧情未设计**”；北端描述、区域表、“襄樊北线”活动组同步标注。`factions.md`（襄阳—樊城地区链）、`factions/court.md`、`fullflow-story-20261016/characters.md`（梁定川）、`story-rework-20261016/companions.md`、`companion-men.md`（陆衡襄樊驿路）、裴知古“沿汉皋、合川和襄樊核访”标襄阳剧情未设计。`regions.json` 加 `revision20261019` 说明，`wm_xiangyang` 的开放说明改为“以后开放的新城市，剧情未设计”。`hangao-systems.md`“襄阳、合川镇以后接同一套系统”是系统复用，保留。
- **清空的获取地点**：秘籍投放表 16 本的地点改“待安排”（正道盟 3：短锋相照、明约协锋法、同气连枝篇；江湖散学 11：伏龙十八掌、驱犬棒法、冷月刀法、通犀指、落英掌、霹雳子、伏虎拳、柳叶剑法、莲花落、乞儿摔碑手、刮风脚；丐帮心法 2：百衲功、市井身），另有清徽阁 2 本的外派途径“襄阳乐坊旁听”改为“乐坊所在地待安排”、《吐故纳新篇》的“襄阳书铺也有售”改“书铺也有售（地点待安排）”，共 19 条。装备 2 件（牛皮护心甲、玉扳指 `eq_jade_thumb`）来源改“待安排”。
- 改的是数据源与生成脚本：`tools_docs/attack_expansion_data.py`、`build_martial_lineage_v3.py`（《莲花落》《刮风脚》说明）、`build_manual_placement.py`、`build_armor_acc.py`；顺带把生成脚本里的“第二章开篇人人自得”改为“培养开始时人人自得”（R-剧情-02，md 早已手改，脚本未跟上）。生成脚本现在直接输出“状态：现行　最后核对：2026-10-19（原记：……）”，包括 `build_attack_expansion.py`；该脚本里指向《攻击招式占比诊断》的链接也改成了归档路径（页面早已归档，旧脚本会生成死链）。
- 已重新运行：`build_martial_lineage_v3.py` → `build_manual_placement.py` → `build_attack_expansion.py doc` → `build_armor_acc.py`。核对结果：`manual-placement.md/json`、`js/martial-manual-sources.js`、`martial-systems.json/md`、`lineage-v3-naming.md`、`js/martial-external-data.js`、`attack-expansion-v1.md`、`catalog.json` 只有上述预期改动；`equipment.md`、`js/equipment-runtime.js` 无变化。
  - 例外 1：`build_martial_lineage_v3.py` 会把 `lineage-v3-moves.json` 冲掉一批由后续脚本补写的字段（与本次无关的生成链顺序问题），已用备份还原该文件。
  - 例外 2：`attack-expansion-v1.md` 重生成后“目标”统计一行由“单体 52、群体 12／118、43”变为“单体 51、群体 13／117、44”，这是现有数据与旧生成页之间的既有差异，按数据保留新值。

## 六、陆衡推荐信（D）与青蚨散案（E）

- [栖河隐藏奖励 H6](../design/qihe-hidden-rewards.md)：推荐信改指汉皋远山镖局；持信到远山镖局可直接下场切磋并多一场对练；“待拍板”改为“已定”，镖局管事名字仍待定。《伏虎拳》切磋地点已清空，是否挂这封信，重新安排时一起定。
- 青蚨散案在 `world.md`、`story.md`、`timeline.md`、`cast.md`、`ye-routes.md`、`factions.md` 标“定为苏芷初始剧情候选；情节与对白待重新审核设计，暂不处理”；[苏芷人物页](../design/companions/su-zhi.md)加一行待办。没有设计任何情节。

## 七、设计数据文件（F）

| 文件 | 读取方 | 处理 |
|---|---|---|
| `calendar/mountain-events.json` | `js/cultivation-visitors.js`、栖河 `qh-mode-cultivation-visitors.js`、测试、全流程脚本 | 保留；在 `notes` 末尾加一条作废说明，其余不动。`tests/calendar_schedule_test.py` 通过 |
| `scripts/pre-xiangyang.json`、`pre-xiangyang-summaries.json`、`pre-xiangyang-voice-plan.json` | `tools_story/build_pre_xiangyang_scripts.py` 等 | 保留不改（襄阳是旧首城名）。**`build_pre_xiangyang_scripts.py` 停用、勿再生成**：主会话已把栖河 JS 里培养模式的襄阳文字改为汉皋，重新运行会把改好的文字冲回去 |
| `scripts/chapter-two-dialogue.json` | 栖河 `build_pre_hangao_runtime.py`、`qh-pre-hangao-data.js` 等 | 保留不改（入汉皋前台词数据） |
| `martial-review/martial-systems.json`、`manual-placement.json` | 生成链 | 按第五节由生成脚本更新 |
| `character-card-ye.json` | `tools/build_opening_character_cards.py` | 保留不改；两处“襄阳”说的是旧演示素材来源，不是剧情或获取地点 |
| `character-assets-current.json` | 无代码读取 | 旧数据（2026-10-02 角色素材清单，含“老周（襄阳脚夫）”），移到 `_attic/2026-10-19-hangao-story-void/`；设计 README 与 `character-asset-quality.md` 两处链接改为文字说明 |
| `story-rework-20261016/regions.json` | `tools_docs/check_story_design.py` | 保留；加 `revision20261019` 说明，`wm_xiangyang` 开放说明改写 |

## 八、拿不准、没动的

1. `fullflow-story-20261016/hangao-year2.md`（二年正月汉皋群像八场）、`hangao-calendar-audit.md`：整页属汉皋剧情，但 `build_fullflow_review.py` 与 `check_fullflow_story.py` 直接读取，归档要连脚本一起改。本次只加了作废说明，状态仍为“现行”。建议主会话决定是否连脚本一起归档。
2. `story-atlas.json` 里徐令仪、岑霜、沈雁回的 `openingRevision.cityMeeting` 仍是“汉皋再会”：`tools_story/build_atlas.py` 的检查写死了这个值，没改。
3. 全流程主线 P2-02（初次进城、药案、青蚨散）和“阿七借名”依赖汉皋群像，只标了作废，没改结构。
4. `review/story-atlas/data.js` 等评审页产物没有重生成；`tools_story/build_atlas.py` 现在本来就跑不通（缺 `chapter1-fire.md`）。
5. 检查脚本里与本次无关的既有失败：`check_fullflow_story.py` 报“liang-dingchuan owner missing”，`check_story_design.py` 报“人物来源缺失：story-rework-20261016/faction-cast.md”，原因都是 `story-atlas.json` 里梁定川的来源页 `story-rework-20261016/faction-cast.md` 早已移到归档。

## 九、交主会话（本次不碰的文件里同类内容）

- `companions/yan-xiaolou.md`：第40行“**汉皋初见**：寿宴外为街坊演说……”；第99行“汉皋公开戏台初识”；第105行 CP-YX“汉皋戏台”。
- `companions/ruan-qingque.md`：第13行“汉皋市井小偷”；第17行定妆情境“年一五月，汉皋货棚侧巷”；第30行 RQ-01“年一5月汉皋”；第93行“汉皋钱袋事件”；第99行 CP-RQ“汉皋货棚”。`companions/ruan-qingque-story.md`：RQ-01 标题“年一五月，汉皋货棚”，以及第9行“不阻塞寿宴与救治”。时间线与登记数据里的同一内容已改为中性写法，人物页需同步。
- `bond-banter.md`：闲话只放在“汉皋城和大地图自由模式”，这是系统位置，可保留（本次核对时该页已无“襄阳”字样）。
- `xiaojianghu-legacy-prologue/js/qh-pre-hangao*.js` 的邀请台词（祁老寿宴、端阳药市与试艺）是汉皋城内剧情的引子，待城内剧情重新设计时一起重审。
