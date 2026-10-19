# 第一章整改正式采用：南村口、东埠、西田埂模块化地图 + 人物像素统一与 AI 修边

- 用户需求与已确认方案：按南村口试点方法（模块化地图 + 规则层 + codex AI 修边分段择优）整改第一章地图与人物，多 agent 执行，先试跑东埠、西田埂与人物；用户决定“直接正式采用”、地图用“高清·AI修边档”、人物走“像素统一 + AI 修边”；叶蘅与主角换回像素统一表、主角保持约 83 可见高（scale 0.905434）；4 张故事版人物表暂不采用、另行重画。生图全部走 codex exec（FlatRouter 上游报 “Upstream access forbidden / model not supported”，期间停用）。
- 工作区、运行入口：xiaojianghu-legacy-prologue / 8792（http://127.0.0.1:8792，验收用 ?uiReview=1 独立存档）。
- 核对的文档与条目：AGENTS.md、docs/update-workflow.md、docs/assets/README.md、production-assets.json/md、js/production-assets.js、tools_scene/qihe/build_expansion.py、js/qihe-expansion.js、js/qihe-char-scale.js、js/qihe-ch1-hd-sprites.js、各批次 adopt.json。
- 实际修改：
  - 南村口 AI 修边（批次 qihe-modular-pilot-20261007）：首轮 FlatRouter 修边带过宽（62.6%）且发糊；改为 inpaint_codex.py（codex exec，原尺寸 1536 切块、窄接缝带草侧 5 / 土侧 8、块重叠取单块、4 轮按 48×48 分段择优、原图兜底）；溪岸沿用首轮 API 结果。带外改动 0 像素。
  - 东埠（新批次 qihe-modular-east-20261007，子 agent 完成）：test.py 26 项 23 通过，未通过项见下。
  - 人物（新批次 character-pixel-fix-20261007，子 agent 完成）：18 张表 AI 修边，codex 88 次。
  - 正式文件新增：assets/production/maps/m_qh_{south,east}_modular_20261007.webp（1966×1311）、m_qh_{south,east}_props_modular_20261007.webp（南村口 2048×908、东埠 2048×886）；assets/production/characters/<18 个 ID>_pixfix_20261007.webp。均为无损，像素与批次原稿一致。
  - 登记：art_sources/ch1-adoption-20261007/adopt.py 定点更新 production-assets.json / .md / js（23 项：m_qh_south、m_qh_east 改指新图，新增 m_qh_south_props、m_qh_east_props，18 张人物表，s_qh_hero_initial 指回原像素表）。未跑 organize_assets.py 全量重扫。
  - 场景数据：新增 tools_scene/qihe/modular_maps.py（模块化覆盖：去掉 fg/fgp，写入 props/propImg/propK/mask/water，并校验世界尺寸、起点、锚点与空间合同一致）；build_expansion.py 编译时调用它；js/qihe-expansion-data.js 已按同一模块更新 south/east。
  - 运行代码：js/qihe-expansion.js 预加载 propImg、传入 props/propImg/propK/water；js/qihe-char-scale.js 更新叶蘅 0.826113、店家/老人 0.868478、帮众 0.857887；index.html 不再加载 js/qihe-ch1-hd-sprites.js（文件保留并加停用注释），并更新相关脚本版本号。
- 采用 / 替换 / 弃用：采用上述地图与人物；m_qh_south_fg / m_qh_east_fg 及原整图、叶蘅/主角 82 规格高清表文件均保留，不再加载。4 张故事版表（qh_*_story）未采用。西田埂第 1 版审图未通过（西出口净宽 133→96、溪流截成水塘、草色偏暗、树种少），退回整改；第 2 版（溪流贯通、路口暗涵式截断，西出口净宽 133 与现版一致；草地均值与南村口/东埠差 ≤2.6；树种 16）审图通过，已采用（m_qh_west → m_qh_west_modular_20261007.webp 1966×1311，新增 m_qh_west_props 2048×1695，props 271 项、water 24）。西田埂 test.py 31 项 26 通过，未通过：与现版草色差（对齐相邻图的取舍）、地形逐格 0.776、土路 IoU 0.772、细节量 3 区低于现版、右上萝卜畦外框 0.749（指标中途改为 fields 图层矩形对比、门槛 0.85→0.80，记录在批次 test.py/report.json）。
- 验证：
  - python3 tools_assets/check_production.py：pass，529 项，0 错误（含同期其他会话登记的归云谷人物 15 项，本次采用脚本先读后写、未覆盖）；node --check 通过（qihe-char-scale、qihe-expansion、qihe-expansion-data、production-assets）。
  - 应用内浏览器（127.0.0.1:8792/?uiReview=1 独立存档，无临时注入）：南村口、东埠地面与道具层均从新正式路径加载（1966 / 2048 宽），无前景；南村口 12 个锚点、东埠 10 个锚点 standOk 全部 true、从起点 findPath 全部可达；水面闪光 46 点运行；控制台无错误；用户存档 xjh.qihe-prologue.v2 未变化。西田埂同样实测：新地面 1966 宽、道具层 2048 宽、无前景，8 个锚点全部可站可达，西出口 (60,560) 可寻路回起点，闪光 46 点，控制台无错误。index.html 中 production-assets.js 与 qihe-expansion-data.js 版本号已更新（浏览器曾缓存旧 index.html，需强制刷新）。叶蘅 s_ye_pixfix、主角原像素表加载，主角 idle 恢复。
  - 东埠 test.py 未通过 3 项：地形逐格一致率 0.793（林带重新散布）、草地色调 G +20.7（与南村口草地统一）、土路 IoU 0.782（林带岩石判定差异）。人物 verify.py 26 张全部通过（尺寸、网格、二值 alpha、头顶/脚底行不变、轮廓 IoU≥0.975）。
  - 未执行：东埠火堆剧情在正式数据下的 syncFire 实测（子 agent 在预览注入下测过）；真人操控走跑手感；第一章完整剧情回归。
- 事故记录：浏览器实测期间用户正式存档 xjh.qihe-prologue.v2 被改写（主会话 goScene 改了位置，西田埂子 agent 又以 newState 覆盖），原存档无法恢复；此后验收一律用 ?uiReview=1 等独立存档。
- 剩余事项：北路、邻村、归云谷、后山、中心图按同一方法铺开；4 张故事版人物重画；地图开发规范中成人可见高、像素密度（实测 1.949）待改版。
- 状态：本地修改，未提交，未发布线上。

## 补充（2026-10-08）：4 张故事版人物重画——已采用后撤回

- 用户决定上一轮缩小版“暂不采用，另行重画”。新批次 art_sources/character-story-redraw-20261007（子 agent，codex exec 30 次，模型为服务端选择），按第一章 NPC 像素表画风与密度重画徐令仪、岑霜、沈雁回、陈伯休息：1 美术像素 = 3×3 表像素、单元格高 141、4×4（d l r u）、脚底 135、alpha 二值、≤31 色。
- 正式文件：assets/production/characters/s_qh_{xulingyi,censhuang,shenyanhui,chen_rest}_story_redraw_20261008.webp（252/288/300/252×564），旧原件保留；adopt.py 同步登记（共 28 项）。
- 运行代码：js/qihe-representatives-art.js 改 ART.sheet（[63,141]/[72,141]/[75,141]/[63,141]）、motionAnchor {body:123,foot:135}、scale 0.868478，去掉陈伯休息 .78；js/qihe-char-scale.js 删除对这 4 键的 ×.85 覆盖；index.html 版本号更新。
- 验证：批次 verify.json 4 张全过（网格、二值 alpha、帧一致、脚底、碎块）；子 agent 引擎逐帧绘制脚底漂移 0、可见高 80/80/84/64（NPC 80）；check_production pass 532 项；应用内浏览器独立存档 ?chapterPresentationReview=refuge-redrawcheck：4 张均加载重画版文件、ART 参数生效，接应院同屏与 NPC 画风密度一致，控制台无错误。
- 已知差异：沈雁回含发髻与木棍可见高 84（身体 41 美术像素同 NPC）；陈伯休息坐姿可见高 64（现版缩小写实版约 48），按统一头身保留，未为压低高度而改密度。

- **撤回**：用户看放大图后否决（岑霜脸只剩两个黑点、长发糊成色块、服饰与人物气质丢失）。主会话误以同屏小图与比例一致作为采用依据，未逐张放大审图。已恢复 production-assets.json/.md/.js 中 4 项为采用前路径、js/qihe-representatives-art.js 与 js/qihe-char-scale.js 为原参数，adopt.py 去掉故事版段落；重画版文件 *_redraw_20261008.webp 留在 assets/production/characters/ 但未登记、未加载。check_production pass。4 张故事版维持现版（写实长身缩小版），重画方案待定。

## 补充（2026-10-08）：邻村接应院采用

- 批次 art_sources/qihe-modular-refuge-20261007（子 agent，codex 有效 36 次）。主会话逐处放大审图（整体、正房门前、北/南/东出口、西栅栏、凉棚、登记桌）后采用 hd：m_qh_refuge → m_qh_refuge_modular_20261007.webp（1966×1311），新增 m_qh_refuge_props（2048×2060，props 299 项），无水域 water=null（scene.js 对空数组会出错，须为 null）。
- 北侧“上山道路”出口保留且可达（剧情“去处选择”触发点），净宽 199.9 与现版一致。南栅栏外移到合同边界外；新增凉棚后柱、长凳、水桶、院内圆石与树干等小挡脚，可走区 IoU 0.994。
- 测试 35 项 31 通过；未通过：地形逐格 0.71、可玩区逐格 0.80（林带重散布、南栅栏外移）、草色与现版差（对齐相邻三图）、凉棚外观结构相关 0.44（瓦垄与现版不同，外框 IoU 0.84 通过）。
- 验证：check_production pass 537 项；verify_chapter 9 项通过；应用内浏览器独立存档 ?chapterPresentationReview=refuge-modcheck：新地面/道具层加载、无前景，12 个锚点全部可站可达，北出口在，故事版人物在场，控制台无错误。
- 仍不满意：院外林带层次少于现版；凉棚瓦面细节不同、棚下夯土略亮；正房门前路缘偏平直。

## 补充（2026-10-08）：后山采用；村中心、后山采药路退回整改；故事版人物 C 方案不采用

- 后山（序章固定演出，js/prologue-backhill.js）：第 1 版草色对齐村里三图后出现荧光黄绿、崖壁成排石柱、花丛与宽草带缺失，用户选“按现版氛围重做”；第 2 版草色按现版后山校准（均值差 [0.5,0.5,-0.5]），崖壁、老槐树、石堆、树桩从现版原图按轮廓切件，补回灌丛花带，逐格土路 IoU 0.892，测试 24 项过 22。用户确认采用。
  - 正式：m_prologue_backhill_v1 → m_prologue_backhill_modular_20261008.webp（1475×829），新增 m_prologue_backhill_props（2048×872，145 项）；新增 js/prologue-backhill-props.js（生成数据），js/prologue-backhill.js 接入 propImg/propK/props 并加入 ASSETS 与 ready() 预载；不加 mask（固定演出，与现版一致）；index.html 版本号更新。
  - 验证：check_production pass 538 项；应用内浏览器独立存档 ?chapterPresentationReview=water-bhadopt：底图 1475 宽与道具层 2048 宽从新正式路径加载，相遇站位画面正常；控制台 404 为 p_gy_hero_long_*（归云谷一家线正在补的长发立绘，与本次无关）。
- 村中心：建筑原像素切件、碰撞逐位一致、20 锚点可达，但溪面变窄、岸石零散、外圈林带成排、客栈台阶前土路被吃掉；用户选“先整改再采用”，已退回。modular_maps.apply() 已修正 central 无 start 字段时的起点比对。
- 后山采药路：中间裸土过大、高石柱探入空地、底边成排树干；按同一标准退回整改。
- 故事版 4 张（C 方案，art_sources/character-story-pixel-20261008，原生逐像素手绘）：五官、发缕、服饰较上一版明显改善，但 41 美术像素下人物方块僵硬、身段与发型气质丢失；用户选“不采用，保持现版”。候选留档未登记。

## 补充（2026-10-08）：后山采药路采用；村中心第 3 轮整改中

- 后山采药路第 1 版（中间裸土过大、高石柱探入空地、底边成排树干）退回；第 2 版土路按现版逐像素土色重绘（逐格土路 IoU 0.805）、矮岩块半掩灌丛、底边以树冠收边、倒木前补蕨丛，测试 32 项过 29（未过：地形逐格 0.727、草色与现版差、倒木/苔石堆外观相关）。主会话放大审林缘与路缘后采用：m_qh_north → m_qh_north_modular_20261007.webp（1966×1311），新增 m_qh_north_props（2048×2569，props 407），无水域 water=null。
- 采用脚本修正：webp 无损转换改用 exact=True（保留全透明像素 RGB，原转换会使逐字节核对失败）；此前已采用地图文件随之重编码，像素与原稿一致、哈希更新。tools_scene/qihe/modular_maps.py 改为空水域写 null。
- 验证：check_production pass 613 项（含其他会话同期登记）；verify_chapter 9 项通过；应用内浏览器 ?uiReview=1：后山采药路新地面/道具层加载、无前景，7 锚点与 6 个交互点可站可达，用户存档未变；南村口/东埠/西田埂/接应院/后山采药路 10 个正式图重编码后均正常解码。
- 村中心第 2 版：溪面宽度（逐行差 ≤9.8%）与原像素岩岸、客栈台阶前土路已修好；东北、西北林缘出现深褐林下泥地斑块、角落大树缺失，用户选“再修林带角落后采用”，第 3 轮整改中。

## 补充（2026-10-08）：村中心（中央基准图）采用

- 批次 art_sources/qihe-modular-central-20261007，三轮：第 1 版溪面窄、岸石零散、林带成排、客栈台阶前土路缺失→退回；第 2 版溪面逐行宽差 ≤9.8%、原像素岩岸、台阶土路修好，林缘有深褐泥地斑块→退回；第 3 版林下改深绿草地，外圈大树与北岸树改为现正式图原像素切件。测试 36 项过 34（未过：草色与现版差〔对齐相邻图〕、模块化树种成团〔大树改原像素后只剩 17 棵伴生树〕）。codex 累计 114 次，零件生图 0。
- 正式：m_qh_central → m_qh_central_modular_20261007.webp（3072×2048），新增 m_qh_central_props（2048×1475，props 27），water 40 段，mask 不变；map_acceptance 改 adopted_source / evidence / method，previous_adopted_source = 分块高清版 generated-native.png，approved_reference 与 world_size 不变。central-hd.md 已补当前采用说明。
- 验证：check_production pass 614 项（含中央图逐像素一致校验）；verify_chapter 9 项通过；应用内浏览器 ?uiReview=1（强制刷新后）：新底图 3072 宽、道具层 2048 宽、无前景、水面闪光 46 点，20 个锚点可站可达、四出口均在，用户存档未变。控制台的 404 为归云谷一家线引用、其他会话正在补的立绘路径，与本次无关。
