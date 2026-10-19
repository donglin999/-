# 南村口模块化地图试点 + 第一章人物像素统一（候选）

- 需求：用户认为“整图生成再分块高清化”会持续出问题，要求更稳定、交互性更好的地图方案，以南村口试点并出对比图；同步处理人物像素不均一、与地图像素不匹配。范围限定第一章。追加要求：与现版从整体、细节、还原度、摆放逻辑全面对比测试。
- 核对：AGENTS.md、地图开发规范与空间合同（docs/design/qihe-map/expansion/standards/）、QIHE_EXPANSION.south 空间合同、引擎 props/mask/buildGrid 实现、ART 精灵登记（art.js、qihe-cast-art.js、qihe-static-art.js）。
- 改动（全部为候选，未登记采用）：
  - art_sources/qihe-modular-pilot-20261007：south.tmj（Tiled 地图数据）、gen/generate.py（13 次零件生图）、cut.py、layout.py、build.py（高清档/像素档）、test.py（22 项对比测试）、render.py、compare_views.py、preview.js（运行时内存替换预览）、compare/（报告与对比图）。
  - art_sources/character-pixel-20261007：normalize.py、audit.json、registry-patch.js、sheets/（第一章 19 人精灵表，4 张清理）。
- 采用 / 弃用：未采用，正式素材、production 登记、js 运行代码均未改动。
- 验证结果：test.py 22 项中 20 通过、2 未通过（地形逐格一致率 0.782<0.80、可玩区域 0.834<0.85，原因为林带重新散布）；引擎内（应用内浏览器，preview.js）现版/高清档/像素档三种状态 12 锚点 standOk 全部可站、findPath 入口可达全部锚点。游戏内截图因画布渲染与截图时序错帧，正式对比图改用离线按引擎规则合成（compare_views.py），已在报告中说明。详见 art_sources/qihe-modular-pilot-20261007/compare/README.md。
- 未完成：溪岸岩岸与上缘崖壁零件、高清档草地纹理偏花、像素档色数、画布非整数倍缩放导致的像素块不均、高清/像素两档的取舍需用户决定；人物统一未进入正式登记。
- 第二轮（用户反馈道路与草坪过渡、建筑差距太大）：查明茶棚零件选取脚本缺陷（派生件混入导致五件错位）；茶棚改为整座件程序拆件、建筑与现版自动配准（±6% 缩放、±28 平移）、道路交界锯齿+草丛+渐变、草地降对比与受光起伏、外缘山石带。新增外观结构相关与道路边缘不规则度测试。结果 24 项 18 通过；茶棚外观相关 0.30→0.584，道路边缘不规则度 2.98（现版 3.03）。未通过项与仍可见差异见批次 compare/README.md 第二轮。
- 第三轮（用户：1–4 并行；药摊是斜的）：药摊 v1 斜侧约 11°、栅栏 v1 约 14°，重出 stall_v2 / fence_v2 为严格正面（−0.01° / 0.06°），新增正面零件倾角 ≤2° 测试；草地重出 v2 并 60% 迁移；茶棚地台校色、右凳镜像。**运行代码改动**：js/scene.js `drawProp` 增加 revealPlayer 淡化（与 drawFg 一致），仅影响开启 revealPlayer 且使用 props 的场景，当前正式栖河场景未用 props；node --check 通过，应用内浏览器实测淡化生效、锚点全可站。25 项 20 通过。
- 状态：本地修改，未提交，未发布线上。
