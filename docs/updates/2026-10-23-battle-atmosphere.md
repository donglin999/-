# 战斗场景氛围概念：景深虚化、光斑、光束托出人物

状态：现行　最后核对：2026-10-23

工作区：xiaojianghu-legacy-prologue（来源批次）＋ xiaojianghu（评审页）。只出概念图，等用户确认；未改游戏、未登记、未接线、未提交、未发布。

## 需求

用户决定战斗精灵保留 95 像素原方案，改用“背景很重的景深虚化、光斑和光束，把人物托出来”的方法凸显人物。

## 结果

- 护路战、练棍课两场，各五档概念图：现状、程序轻处理、程序重处理、生图氛围背景、生图氛围＋人物受光。
- 推荐“生图氛围＋人物受光”：背景景深与光由生图出，游戏只加脚下柔影、暗角、受光；程序画的光斑一眼假，只作对照。
- 详情：[art_sources/battle-atmosphere-20261023/README.md](../../art_sources/battle-atmosphere-20261023/README.md)；评审页 `xiaojianghu/review/battle-atmosphere/index.html`。

## 验证

- 8797 打开评审页：场景与档位切换、局部对照正常，图片全部加载，控制台无错误。
- 未做：游戏内实机（未接线，等用户确认）。

## 续：接入战斗（同日）

用户：“确认用‘生图氛围背景＋人物受光’。给第一章所有战斗背景出氛围版，接进战斗渲染（脚下柔影、暗角、受光），在 8792 实机给我看。”

### 改了什么

- **新背景（旧图保留）**：`bb_qh_training_atmo_20261023`（练武场，练棍课；归云切磋同用此键，一并换）、`bb_qh_evacuation_atmo_20261023`（护路战）、`bb_qh_faction_clash_atmo_20261023`（领队交锋，夜）、`bb_prologue_backhill_atmo_20261023`（序章后山、叶蘅针法战；竹径狼战同用此键）。练武场、撤离路两张即确认过的概念图；交锋、后山两张新出（302ai，2/2 成功，47～53 秒）。`tools/bake.py` 裁 16:9、回原尺寸 1672×941，烘焙分层景深与 8% 压暗。`adopt.py` 登记 production-assets（json/md/js），`check_production.py` pass。
- **js/bstage.js**：`BB_ASSET` 按场景名映射到氛围版（剧情仍传旧键）；交锋单列场景配置（原走 fallback 一档，粒子换萤火）；氛围版背景不再叠运行时景深、降饱和、地平线薄雾；脚下不再叠提亮光斑；单位之后、UI 之前按镜头画屏幕暗角；新增 `BSTAGE.atmo()`、`BSTAGE.assetFor()`。
- **js/bfx.js**：氛围版时脚下影子改径向柔影；精灵迎光面（屏幕左上，翻转时换边）一个美术像素混入场景暖色受光，按帧缓存；闪白、灰化等着色帧不加受光。
- **js/battle.js**：开战时同时预载对应氛围版背景，避免首帧闪旧图。
- `index.html` 四个脚本缓存版本号改为 `20261023-atmo1`。

### 验证

- 8792 实机：`battleReview=road`、`lesson`、`clash`、`ye` 四场都用上氛围版背景，`BSTAGE.atmo()` 返回各自受光色与暗角；截取画布放大确认头发左上沿暖色受光、脚下柔影。
- 1920×1080 护路战智能自动战斗 15 秒：出招、命中、破势、伤害数字、敌人消散正常，控制台无错误；1280×720 四场同样无错误。
- `tests/battle-auto`、`battle-feel-probe`、`qihe-faction-clash`、`hero-staff-grip`、`hero-multiweapon` 通过。`tests/character-grounding.test.cjs` 失败（`drawImageAsset is not defined`），该测试只读 `js/scene.js`，与本次改动无关，属已有问题。
- `battleReview=clash` 入口进地图后不会自动开战，需手动调用 `QiheFactionClash.play()`；为原有行为，本次未改。
- 未做：线上发布（R-发布-01）。
