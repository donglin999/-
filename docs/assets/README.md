> 每次改动按[更新核对流程](../update-workflow.md)执行，并写入 docs/updates/。

2026-10-16：本地采用主角六套多武器动作96帧、五位归云人物112帧和主角20个无固定兵器对白状态。正式清单、实际引用、原稿及SHA已核对；[来源与验收](../updates/2026-10-16-character-actions-completion.md)。主角另交付18张可编辑PNG分层图集，运行仍为整帧WebP。旧20261013非像素手绘稿继续撤回。

# 本版本素材入口

状态：现行　最后核对：2026-10-19

2026-10-13 本地采用[开始部分领队3v3交锋](../updates/2026-10-13-faction-clash.md)：两位女领队各14个完整战斗关键帧、9态，新夜间药棚战场，16张既有专属特效迁移、2条音效，共21项登记。来源、提示词及实机证据见[制作包](../../art_sources/qihe-faction-clash-20261012/README.md)。未提交、未线上发布。


2026-10-12 采用[归云谷透明素材整改](../../art_sources/guiyun-performance-fix-20261012/README.md)：知古 7、殷红缨 8、师母 8 张 Q 版，内置 image_gen 原生 RGBA。知古逐表情修正脸部锚点，殷红缨补全右轮廓；6 张紧构图候选未采用，旧正式副本与原稿保留。请求 gpt-image-2.5，实际后端未披露。完整提示词、尺寸、哈希、实机与叠底证据见批次和[更新记录](../updates/2026-10-12-guiyun-performance-fix.md)。本机正式采用，未提交、未线上发布。

2026-10-10 当前 `hero_village` 已采用[端握木棍连招与首击反馈](../design/qihe-map/hero-staff-combo.md)：版本化30帧表，横扫、斜打、直戳连续演出；上一正式26帧原像素保留。木棍撞击声一并正式登记，首击强化受击、顿帧与镜头。878项正式素材检查通过；开始部分守路战实际自动获胜，20.34秒含音效实录和来源在 `art_sources/hero-staff-combo-20261010`。本机采用，未提交、未线上发布。较早的[26帧首次采用](../archive/design/qihe-map/hero-staff-grip-adoption.md)保留为历史记录。

本目录属于 **xiaojianghu-legacy-prologue / 8792** 工作区。不得用兄弟目录 xiaojianghu 中的运行入口、opening-v4 图片或试验结果判断本版本正式素材。

**出图、取参考前先查[弃用／不启用的测试方法清单](deprecated-tests.md)。** 批次 README 或 DEPRECATED.md 标着“未采用／试点／测试／候选／预览／撤回”的，不得作画风、规格或流程参考；2026-10-08 至 10-10 的场景像素试点（`scene-pixel-*-20261009`）和多批人物像素测试都在表里。

2026-10-10 按用户要求正式采用[蓝灰主角完整 C 包](../design/qihe-map/hero-blue-adoption.md)，四向站立、12 帧步行、10 帧跑步一起用于普通开局和旧档继续。新增四份版本化无损 WebP；旧初版九份登记文件与哈希保留。普通地图沿原正式身高和步距，现代开场服装依剧情保留。[采用 manifest](../../art_sources/hero-blue-formal-20261010/manifest.json)及[正式实机验证](../updates/2026-10-10-hero-blue-formal-adoption.md)记录来源与限制。仅本机采用，未线上发布。

2026-10-07已采用[徐令仪、岑霜、沈雁回CG](../design/qihe-map/cg-three-heroines.md)、三人静态四向与各六张完整对白状态、陈伯坐姿。按[游戏接入合同](../design/qihe-map/three-representatives.md)接入8792剧情、任务与人物菜单；[25项采用记录](../../art_sources/qihe-representatives-adoption-20261007/manifest.json)。CG原生1672×941、无损WebP，岑按用户要求用窄折扇截手、不直接接触。现行中央图与主角探索素材继续使用。

- production-assets.md：按系统列出的正式运行登记，选图、替换和发布只查这份。
- production-assets.json：同一清单的完整哈希、原件来源与引用位置。
- inventory.json：全量路径、图片解码、尺寸、哈希、引用与重复组。
- audit.md：全量盘点统计与限制。
- runtime-after-organization.json：整理后浏览器加载记录。

仅替换已登记素材时，可在独立采用与验收完成后执行 `python3 tools_assets/organize_assets.py --adopt-reviewed --registered-only`：保留逻辑 ID、正式路径和一份原稿对应多份成品的关系，只同步登记展示/运行映射与库存，逐项验证现有正式哈希；不从其他批次自动发现新条目。新增正式资源仍须按采用合同单独登记。

## 分类边界

历史状态：2026-10-09蓝灰主角跑步仅接入[后山实机试用入口](../updates/2026-10-09-hero-run-blue-game-preview.md)，当时普通入口、正式角色映射及清单不变。该 A/B 试跑仍为历史候选；2026-10-10 实际采用的是上文完整 C 包。

正式图片在 assets/production/，使用 production-assets.js 路径映射。CG、图标和动态立绘也使用正式路径。UI 按正式清单逐项登记，不可因版本名字较新就自行替换整套。音频独立放在 assets/audio/。生成原稿与候选在 art_sources/各批次。assets/ 根目录保留历史原件，已登记图片不再从原件位置加载。未选用素材和评审截图在 inventory.json 单独标记，禁止无证据删除。

封闭原版 m_qihe_trial_v1 已退出正式加载；中央图唯一基准为用户确认的四向扩展 m_qh_central。扩展区域和室内图逐项登记。将来更换中央图前必须更新确认来源及验收记录。

## 验证

图片解码与正式哈希检查通过。（历史，已被下文 2026-10-08 modular 版取代）正式中央图2026-10-07起采用 qihe-central-tiled-20261007/generated-native.png（3072×2048，2×2分块重绘拼接，见[中央图高清化合同](../design/qihe-map/expansion/central-hd.md)）；它以用户确认的 qihe-expansion-v1/central.png 为唯一参考图，存在局部细节重绘。此前的 qihe-central-hd-20261005 整图保留为历史版本。正式文件与本次采用原稿像素一致。浏览器底图及前景均从正式目录加载，封闭原版不再请求；页面错误和失败请求均为0。江湖菜单、65种物品/招式/心法图标、悬停、装备槽及七个系统入口回归0失败。自动战斗测试通过。

开始部分模块化地图（2026-10-07 起）：南村口 m_qh_south、东埠 m_qh_east、西田埂 m_qh_west、邻村接应院 m_qh_refuge、后山采药路 m_qh_north、村中心 m_qh_central 改为模块化高清·AI修边档（地面 1966×1311 + 道具层 m_qh_*_props，世界 1536×1024 不变），覆盖规则见 tools_scene/qihe/modular_maps.py，批次为 qihe-modular-pilot-20261007 / qihe-modular-east-20261007 / qihe-modular-west-20261007 / qihe-modular-refuge-20261007 / qihe-modular-north-20261007 / qihe-modular-central-20261007；原整图与前景 m_qh_*_fg 文件保留未删，前景不再加载。序章后山 m_prologue_backhill_v1（固定演出场景）2026-10-08 起改指 qihe-modular-backhill-20261007 第 2 版（按现版午后暖光，崖壁/老槐树/石堆/树桩为原图切件），道具层 m_prologue_backhill_props 的数据在 js/prologue-backhill-props.js。开始部分 18 张人物表改用 character-pixel-fix-20261007 的像素统一 + AI 修边版（原位替换，单元格与排布不变）；叶蘅、主角撤回 82 规格高清表。采用脚本与记录见 art_sources/ch1-adoption-20261007/。

容器专项旧脚本依赖路径失效，未报告为通过；本轮没有改动容器逻辑。菜单专项使用本机现有 Playwright 运行时复跑通过。

本次检查覆盖文件、来源、引用、解码及加载，不等于逐条音频听审或全部图片美术验收。运行登记与人工质量验收应分别记录。

2026-10-05 明确采用培养设计会话的归云谷界面快照：assets/production/cultivation，原件与来源哈希在 art_sources/cultivation-adoption-20261005/manifest.json。按用户本轮衔接要求采用，不依赖8149服务、不自动同步来源更新；运行注册不等同于全部动画人工质量签收。

2026-10-06 CG整改：灯倒人物V2因右前臂/手缺失撤回，当前改用道具插入镜`cg_qh_fire_ignition_v3`；离开仍采用`cg_qh_fire_evacuation_v2`。V1与灯倒V2仅留历史登记。每镜作用、人物预算、动作、播放起止以[CG分镜合同](../design/qihe-map/cg-direction.md)为准；[灯倒生成与逐项看图记录](../../art_sources/qihe-lamp-insert-20261006/generation.json)、[灯倒实机结果](../../art_sources/qihe-lamp-insert-20261006/browser-review.json)单独记录。


中央图唯一基准 m_qh_central 自 2026-10-08 起采用 qihe-modular-central-20261007/out/hd/bg.png（3072×2048，世界 2400×1600 不变；建筑、崖壁、林带大树为现正式图原像素切件，碰撞逐位不变），map_acceptance 已同步（previous_adopted_source 为分块高清版 generated-native.png，参考图不变）。分块高清版文件与 m_qh_central_fg 保留未删，前景不再加载。
