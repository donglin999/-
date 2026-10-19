# 四向中央图分块重绘替换

- 需求：用户反馈室外与室内清晰度差距大，希望室外追上室内；选用“现有图放大并补细节”方案，用自己的 FlatRouter 接口先试中央图。看过实机对比后确认“新图效果可以，替换进游戏”。
- 核对：AGENTS.md、docs/assets/README.md、production-assets.md/json、central-hd.md、qihe-central-hd-20261005 批次记录、tools_assets/check_production.py。发现运行时读取的是 10-05 已采用的 3456×2304 整图（非 assets/ 根目录 1536 原件）；同显示密度高频细节仅 5.03（原图 4.65，室内 6.04），与 10-05 记录的“提升不明显”一致。
- 改动：
  - 新批次 art_sources/qihe-central-tiled-20261007：generate.py（参考原件 2×2 重叠分块，逐块 edit 重绘）、build.py（位移场对齐、低频色调固定、最小误差缝拼接、前景按原审核轮廓重建）、4 块原始输出与任务记录、generated-native.png、bg.webp/fg.webp（无损）、seam-check.json、visual-review.md、review/、verify.cjs 与 runtime/。
  - 正式文件新增 assets/production/maps/m_qh_central_tiled_20261007.webp 与 m_qh_central_fg_tiled_20261007.webp（3072×2048）。
  - 定点更新 production-assets.json（两项条目与 map_acceptance）、production-assets.md（两行）、js/production-assets.js（两项映射）。未运行 organize_assets.py 全量重扫，避免卷入工作区其他未提交改动。
  - 文档：central-hd.md 当前采用与尺寸约定、docs/assets/README.md 验证段。
- 采用 / 弃用：采用分块版为 m_qh_central / m_qh_central_fg。10-05 整图（m_qh_central_hd_20261005 / m_qh_central_fg_hd_20261005）退为历史版本，文件保留未删除。世界尺寸 2400×1600、碰撞遮罩、fgp、锚点均未改。
- 接缝排查（用户追加要求）：首版线性羽化拼接存在各块色偏不一（最大 8.7）、重叠区重影发糊、01 块局部拉伸 7px。改为对齐 + 低频固定 + 最小误差缝后：接缝带色调偏离参考 1.13（首版 6.74），缝两侧跳变低于对照位置，接缝带未变糊；最差区块人工复看无接缝。数据与图见批次 seam-check.json、review/seam_hotspots_v1_vs_v2.png。
- 验证结果：
  - build.py 重跑结果与用户看过的候选仅有压缩差异（候选为 q90 有损，平均差 2.8）；正式 webp 与 generated-native.png 逐像素一致。
  - 无头浏览器（批次 verify.cjs，uiReview 入口）：底图与前景均从新正式路径加载、3072×2048，世界 2400×1600；9 锚点可站；北南西东四出口往返通过；页面错误与失败请求 0。截图见 runtime/。
  - 用户自己 Chrome 的普通入口中，以控制台临时替换内存图片的方式看过新旧对比（非正式加载路径）。
  - 普通存档入口（应用内浏览器，刷新后无任何临时注入）：实际加载 m_qh_central_tiled_20261007.webp 与前景，均 3072 宽，场景“栖河村 · 暮色初起”。
  - python3 tools_assets/check_production.py：pass，481 项，0 错误；node --check js/production-assets.js 通过。
- 未完成：其余 6 张室外图（south/east/west/north/refuge/mountain）尚未处理；本版高频细节高于室内，用户已接受，未做降锐。普通存档入口仅核对加载，未做走动专项。
- 状态：本地修改，未提交，未发布线上。
