> 选用素材前先查看[正式素材清单](../../assets/production-assets.md)，四向扩展中央地图为 `m_qh_central`。

# 栖河村序章 · 旧人物分支

状态：现行　最后核对：2026-10-19

分支 `codex/legacy-prologue-map`，基于 `36eaff1`。用户确认：**旧版人物与动作 + 栖河村新序章地图**。已扩展到村外四区、邻村、归云谷客院；开始部分结束于山居第一夜，培养部分开放首期培养。

**最新实施（2026-10-05，可玩原型）：[村外扩展、初始人物整改与培养衔接](expansion/README.md)。** 本次用户要求恢复正确初始短发便衣；下方旧人物说明仅记录当前实现，不再授权新制作沿用长发替身。

- [序章流程、操作和存档](../../archive/design/qihe-map/prologue.md)
- [启动、序章展示与继续进度](startup.md)：从序章开始与继续存档分开，旧进度保留。
- [后山初遇与教学战斗脚本](../../archive/design/qihe-map/arrival-script.md)
- [入村安顿脚本](../../archive/design/qihe-map/lodging-script.md)
- [三件可选小事脚本](../../archive/design/qihe-map/errands-script.md)
- [药箱与第一夜脚本](../../archive/design/qihe-map/night-script.md)
- 布局与空间用途（已删除）
- 地图制作与碰撞标准（已删除）
- [素材与静态演出规则](../../archive/design/qihe-map/assets.md)
- [开始部分萧白战斗独立预览](../../archive/design/qihe-map/hero-battle-pose-preview.md)：使用附件skill；最新已按单头前戳重做端握，仅供比较，暂未替换游戏。
- [CG作用、人物动作与播放分镜](cg-direction.md)：先限定每镜作用与出场人数，再生成；递水三句、灯倒一条旁白、离开两句。
- [徐令仪、岑霜、沈雁回的CG编排](cg-three-heroines.md)：三人各一镜，已随主线交涉／救援／必达对证接入8792。
- [三位主事人游戏接入与独立交互](three-representatives.md)：分阶段站位、来件证据、三选一与旧档兼容。
- 测试和交付边界（已删除）
- [村庄灰盒](../../../art_sources/qihe-v1/layout-guide.png) · [生成图](../../../art_sources/qihe-v1/generated-village.png)
- [生图提示词](../../../art_sources/qihe-v1/prompt.txt) · [生成记录](../../../art_sources/qihe-v1/manifest.json)
- [室内合同](../../../art_sources/qihe-prologue/rooms.json) · [本地引擎渲染](../../../art_sources/qihe-prologue/qa/contact.png)

试玩：`http://127.0.0.1:8792/index.html#qihe-map`（`#prologue` 同义）。首次从后山开始，之后继续独立持久存档。原工作目录未修改。
