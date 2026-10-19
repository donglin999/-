# assets/ 保留说明

状态：现行　最后核对：2026-10-20

旧游戏原型的运行素材已于 2026-10-20 整体移入 `_attic/2026-10-20-prototype/xiaojianghu/assets/`，见[归档记录](../docs/updates/2026-10-20-prototype-archive.md)，不作画风或素材参考。这里只剩现行文档与工具的硬依赖：

| 路径 | 为什么留下 |
| --- | --- |
| `ui/martial-moves-v3/` | 64 招正式图标；`docs/design/martial-review/catalog.json` 登记路径与哈希，`tests/martial-moves-v3.test.cjs` 校验，武学图鉴页显示；由 `tools_docs/pack_martial_moves_v3.py` 生成 |
| `ui/martial-moves-v4/`、`ui/martial-hearts-v4/` | `tools_docs/pack_martial_icons_v4.py` 的输出，`js/martial-move-icons.js`、`js/martial-heart-icons.js` 登记 |
| `ui/equipment-v1/`、`ui/manuals-v1/` | `tools_docs/build_equipment_icons.py`、`build_manual_icons.py` 的输出，对应 `js/` 图标表 |
| `p_menu_hero_v1.webp`、`p_menu_ye_v1.webp`、`p_menu_suzhi_v1.webp` | 人物图谱 `docs/design/story-atlas.json` 与立绘规范页引用 |
| `audio/voice_pick/` | 语音后台 `tools_audio/voice_server.py` 的试听库（不入 git） |
