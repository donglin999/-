# 2026-10-07 门派功法传承重设计（提案）

## 需求

用户提出：甲等外功开始有两个招式，绝等外功三个招式；一个门派不能永远只有一个功法，要有从初级到高级的功法传承。先调研《大侠立志传》《逸剑风云决》《侠客风云传》，再重新设计。

## 改动

- 新增 [门派功法传承 v3](../design/martial-lineage.md)：调研摘要、品阶定招式数（丁丙乙 1、甲 2、绝 3）、重数开启规则、前置与取得、门派传承模板、现有 64 招逐项归位、25 个新增招式提案、江湖散学、界面与待确认问题。
- [功法结构规范 v2](../design/martial-structure.md) 顶部加待确认提示；[设计短链](../design/README.md) 加入口。

## 核对过的文档

martial-structure.md、grades-and-skill-vfx.md、martial-review/README.md、martial-systems.md、rules.md、catalog.json（64 招、18 心法的品阶）、cultivation-formal-martial.md、factions.md、各门派页、protagonist-sect.md、js/martial-structure.js、js/martial-external-data.js、js/menu.js 的 XINFA。

## 用户确认（同日）

乙级 1 招；甲第二招五重，绝第二招五重、第三招七重；做十重精通被动；绝学不设互斥；开放江湖散学；新名称单独审定；所有同伴的个人技能（含叶蘅）品阶随人物等级提升、不可传授（用户随后更正：不是统一定为甲级）。已据此修订方案第 3、4、6、8、9 节和 martial-structure.md 顶部说明。

后续确认：每位同伴一项招牌技能可升绝（条件为方案）；门派功法中限某人使用的招式品阶固定；人物技能每升一档重画一版图标，共 34 张。

人物技能整体暂缓：出场时机和剧情未定，升档节点、招牌技能、升绝条件与 34 张图标都不推进。

## 状态与未完成

- 规则已确认；新功法名、新招式名、25 个新招式效果、各档前置重数、人物技能成长曲线仍为方案。人物技能升档节点 13／25／39 级与甲级上限为提案；叶蘅两线已并入人物技能，原为她新增的 2 个甲级招式取消，新招式总数改为 23。
- 未改代码、未改 catalog.json／martial-systems.json／move-contracts、未生图、未做测试（纯文档改动）。
- 本地完成；未做 Git 提交，未发布。

## 落地（同日，用户要求“先完成其他的技能整改”）

### 改动
- 生成脚本 `tools_docs/build_martial_lineage_v3.py`（唯一数据来源）：输出 `martial-review/martial-systems.json`（v3：42 门门派功法、10 组暂缓人物技能、6 门散学候选）、`martial-systems.md`、`lineage-v3-moves.json`（23 条新招式合同）、`lineage-v3-naming.md`（命名审定表）、`js/martial-external-data.js`；`catalog.json` 的 64 招补 `system_id`／`art_unlock_level`／`character_skill`。v2 清单存档为 `martial-systems-v2.json`。
- 运行：`js/martial-structure.js` 加功法品阶标注、重数开启（开启前 `mnLoadWhy`／`skillWhy` 拒绝装配）、功法重数共享（`syncArts`，在建角色与升重后执行）、十重精通（包装 `mnHuo`）；`js/jianghu-ui.js/.css` 显示功法品阶、层级、功法重数、精通与未开启招式；`js/cultivation-data.js` 基础课说明列出后续传承。`index.html`、`village-4k-trial.html` 资源版本号更新为 `20261007-lineage-3`。
- 图录 `review/martial-library/`：按功法显示品阶、开启重数和待审新招式，品阶筛选按功法品阶。
- 文档：功法结构规范升 v3；方案第 8 节改为落地进度；正式教学合同补丙乙进阶与甲级前置七重；评审首页加 v3 说明。
- 验收脚本：`verify_martial_moves_v3.cjs`、`verify_martial_structure_v2.cjs` 的游戏入口改为 `index.html?runtimePrototype=1`（本地入口规则此前已改，旧地址会跳到 8792）；功法卡数 21→52。
- 新测试 `tests/martial-lineage-v3.test.cjs`（7 项）。

### 验证
- `node --test tests/martial-lineage-v3.test.cjs tests/martial-moves-v3.test.cjs tests/cultivation-formal-martial.test.cjs tests/cultivation-jianghu-modern.test.cjs`：30 通过、0 失败。
- `node tools_scene/verify_martial_moves_v3.cjs`：pass（64 招、图标全部加载、无页面错误）；`node tools_scene/verify_martial_structure_v2.cjs`：failures 0、errors 0，内功战斗回合与冷却菜单正常。两个脚本重写了 `review/martial-library/` 下的验收截图与 `completion-v3/browser-acceptance.json`。
- 浏览器（8149，`?runtimePrototype=1`）：武学页显示“守拙拳法 丁级 · 入门 · 功法 1 重 · 1／1 招 · 十重精通…”，伏虎拳显示“丙级 · 江湖散学”；控制台无错误。图录 52 项，《归云剑诀》详情显示两招与“5重开启”。
- 全量 `node --test tests/*.cjs`：315 项中 36 项失败，均与本次无关——缺少 playwright 模块的浏览器测试，以及从 `core.js`／`main.js`／`opening-maps.js` 截取代码的场景测试（这些文件本次未改）。

### 未完成
- 命名审定待用户审；23 个新招式的图标与特效分镜等名称通过后再做。
- 新功法的传授剧情、散学来源的世界观审定、人物技能（暂缓）。
- 运行中目前只有《试锋剑法》《守拙拳法》两门可学，多招功法的开启逻辑由测试用模拟功法验证，尚无真实可学的甲／绝功法。

## 内功命名（同日）

用户要求内功名多参考金庸、古龙，只参考不照抄。新增 [内功命名审定](../design/martial-review/hearts-naming.md)：归纳原作命名规律（典籍出处、阴阳数理、自然意象、佛门修持、名带代价、后缀分档），定下不照抄规则，为 18 门目标内功提出改名（如归云心法→出岫心经、存烬诀→薪火功、听风辨隙→地籁诀），观岚诀保留。仅方案，未改 catalog、hearts.md、运行代码和图标；同名检索为人工比对，未做原著全文检索。

## 内功改名落地（同日）

用户审定：《万壑归元》改为《万壑归元诀》，其余 17 门按建议名。已改 `catalog.json` 的内功名称与被动名（旧名记入 `name_history`），同步 hearts.md、builds.md、文学对照（md／json）、特效分镜（vfx 各分册与 catalog.json）、protagonist-sect.md、pre-xiangyang-training.md、martial-lineage.md，以及 `js/cultivation.js` 中培养成果显示“吐故纳新篇”（版本号 `20261007-hearts-1`）。图标生成提示词、assets.md、icon-tiers.md、历史整改单与 review 快照保留原名，作为生成与历史记录。重建图录数据（82／82）。

验证：武学、养成相关 6 个测试文件 43 项通过；物品命名检查通过。

数值核对：23 个新招式按离线公式在第 9 章锚点（攻击 67、敌防 30）估算，新甲级单体伤害 67–88，处于现有甲级单体 50–89 的区间内；群攻 47–54，与现有群攻 53–59 相当。这只是同档对比，不是全年平衡验证。内功被动仍为文字描述（“小幅提高”等），尚无具体数值；18 门内功主动共用 6 种模板。

## 2026-10-08 内功数值、弱点、异常状态、音律门派与战斗模拟

### 需求（用户）
补内功数值；自写数值战斗模拟系统打磨数值，弱点系统参考八方旅人；补异常状态并参考其他游戏；弱点类型按八方的 6 兵器 + 6 属性数量设计；每个门派两种属性；本作没有“短刃”，八方短剑位对应音律武器（琴、笛），短刃并入刀、扇归暗器；新增一个纯女子音律门派，类比归云谷，与柳含烟相关。

### 改动
- 内功数值 v1：`tools_docs/build_hearts_numbers.py` → catalog hearts 的主动效果与被动数值，`martial-review/hearts-numbers.md`；清徽阁两门内功写入 `lineage-v3-moves.json` 的 hearts。
- 弱点系统：新增负责文档 `design/weakness-system.md`（v2：剑、刀、长兵、音律、暗器、拳掌 + 炎寒雷风阳阴）；`tools_docs/build_elements.py` 给每招写 `weak_class` 与 `element`，每个门派恰好两种属性。
- 异常状态：新增负责文档 `design/status-effects.md`（九种，含七款游戏参考）；`tools_docs/build_status.py` 把施加与解除层级写入招式合同。
- 短刃并入刀（9 招、3 件装备，“藏锋短刃”改名“藏锋短刀”），扇归暗器；21 份现行文档文字同步，图标生成提示词保留原文。
- 清徽阁：`design/factions/qinghui.md`、门派目录登记、10 门功法 16 招、柳含烟人物篇补师承说明。
- 战斗模拟器 `tools_balance/combat_sim.cjs`（八方式弱点护盾破势、BP、内功、异常、连战、敌人曲线校准）、报告生成 `tools_balance/sim_report.cjs`、模拟报告 `martial-review/balance/sim-report.md`、测试 `tests/combat-sim.test.cjs`。
- 依据模拟调整的数值见模拟报告第 6 节（绝招威力上调、同担一线、防护类招式、内功主动等）。

### 未完成
- 运行战斗代码未改（弱点 12 类、削盾规则、破势恢复先手、异常状态都只在设计与模拟中）。
- 新名称（功法、招式、清徽阁人物）均待命名审定；新招式、新装备、清徽阁内功均未生成图标。
- 剧情图谱 `story-atlas.json` 等派生文件仍含旧词“短刃”，需重新生成。

### 同日追加决定
- 敌方压力以单次命中比例为准；压力曲线 0.8 → 1.05（`sim/enemy-curve.json`），首季遭遇不连续超过两场；破势倍率 1.5；纯自保招改为“防御强化”（选防御时自动附带，验证轮使用量从个位数升到 466–5724 次）；头目第 10 回合起每回合 +20%（不缩短战斗，只给输出不足的配置加风险）。
- 升阶门槛最高七重（丙三、乙五、甲七、绝七）；个别功法可能因剧情提前到手——用户说明这只是表明有这种情况，不作为通用机制，随剧情逐个设计。
- 运行升重公式（6×n² 熟练，TBD-13）对高重数过陡，建议单独校准。
- 功法不与章节绑定（用户确认）：取得早晚取决于游戏内时间与资源分配；学习条件改为“前置重数 + 属性门槛 + 取得途径”，属性门槛表与路线主副属性写入 martial-lineage.md 3.2，每门功法的 `learn_req` 写入功法清单。新增 `tools_balance/progression_sim.cjs`（专修／均衡／游历三种时间分配的逐月推算与早期秘籍压力测试），结果见模拟报告第 8 节；测试 `tests/combat-sim.test.cjs` 增至 6 项。“剧情提前获得”按用户说明改为情况说明，不作通用机制。
- 升重曲线校准（用户要求让游历玩家后期也能开绝招）：n 重升 n+1 重所需熟练由 6n² 改为 min(6n², 20n)，前四重不变；运行代码 `js/menu.js` `mnProfNeed` 与 `js/jianghu-model.js` 武学页显示同步修改。模拟：开出绝招月份专修 42→33、均衡 55→46、游历 未开→60；早期秘籍仍被属性门槛挡到第 25–36 月。养成与武学相关测试 45 项通过。
- 技能文档同步（用户问“新门派、属性、装备是否已更新到技能”）：新增 `tools_docs/build_skill_docs.py`——每招写 `effect_v3`（原说明 + 弱点类型 + 施加异常 + 解除层级 + 防御强化）；9 份门派招式分册顶部生成“v3 招式总览”（含新建 `martial-review/qinghui.md`）；move-contracts.md 末尾补弱点与异常表；hearts.md 清单换成内功数值 v1；rules.md 状态词典加指向异常状态 v1 的说明；weapon.md 补兵器与弱点类对照；清徽阁 4 件琴笛装备写入 catalog（方案，未出图）；武学图录详情显示 v3 规则。命名检查通过（45 件装备），相关测试 36 项通过，浏览器核对图录详情无报错。
- 仍未做：装备对技能的影响（抗性、属性加成）只有方案；39 个新招式与 2 门新内功未进图录卡片、无图标和特效分镜（待命名审定）；运行战斗代码未接 12 类弱点与异常。
- 技能图标风格 v4：诊断现有图标“AI 味”来源（无容器、蝴蝶形对称、细节堆砌、假水墨），参考大侠立志传（圆形像素徽章）、逸剑风云决（白色剪影＋品质光晕）；试样 A、B 被评“太简陋”，C 版精绘（沿用已批准样张画风＋方形品阶边框＋单一焦点＋随品阶加场景）获用户认可，暂不批量重画。规范 `martial-review/icon-style-v4.md`，试样 `art_sources/martial_icons_v4_trial/`（codex exec 生成，服务端选模型）。

## 2026-10-08 收尾（用户：“完成所有的任务，并重写技能描述，包括内功；规范伤害数字”）
- 命名定稿：排云推岳→推山填壑、《百步震关拳》→《震关拳》，其余按审定表；名称状态改为 final_v3。
- 伤害数字与战斗浮字规范 `design/damage-numbers.md`（属性色、字号样式、异常色、特效分镜四拍）。
- 技能描述与特效分镜 v4：子代理写 `martial-review/skill-text-v4.json`（103 招 + 20 内功，校验通过），生成 `martial-review/skill-text-v4.md`，合并进数据与图录。子代理发现的 13 处数据矛盾已在数据源修正（防御强化不耗内力无冷却、卸力按基础值递增、希声裂石补绝招规则、眩晕不可解除、削盾上限、回灰护影退回主动招等）。
- 装备影响技能 `tools_docs/build_equipment_mods.py`：34 件装备的属性亲和、异常抗性、施加率、持续缩短；模拟对比见模拟报告第 9 节。
- 特效：第一批 8 招 13 帧概念图（`art_sources/v4_vfx_concepts_v1/`，评审页 `review/v4-vfx-concepts-v1/`），待用户确认后拆素材、编排动态。
- 图标 v4 批量生成脚本 `tools_docs/gen_icons_v4.py`（123 张，进行中）。
- 运行战斗接入（12 类弱点、异常、削盾、破势、久战、防御强化、伤害数字）由子代理进行中。
- 运行战斗接入完成（子代理，详见 `docs/updates/2026-10-08-battle-weakness-status.md`）：12 类弱点、每段削盾上限 6、破势 1.5 与恢复先手、九种异常、伤害数字规范、头目久战、防御强化。追加修正：新挂的中毒／流血／内伤层数首个回合开始不扣（运行与模拟器同步）；旧内功“清秽／忘虑”改为解除流血与中毒（眩晕不可解除）；异常时长单位写明按自身行动次数计。验证：战斗与养成、武学相关测试 43 项通过，战斗回归通过；内置浏览器实际战斗中弱点揭示、削盾、流血与目眩、我方淡红数字正常，控制台无错误。
