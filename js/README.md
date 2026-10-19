# js/ 保留说明

状态：现行　最后核对：2026-10-20

旧游戏原型的运行代码已于 2026-10-20 整体移入 `_attic/2026-10-20-prototype/xiaojianghu/js/`，见[归档记录](../docs/updates/2026-10-20-prototype-archive.md)。这里只剩现行文档工具的硬依赖，**不是可运行的游戏代码**，也不代表栖河试玩版采用。

| 文件 | 为什么留下 |
| --- | --- |
| `martial-move-model.js` | 64 招离线估算模型，`tests/martial-moves-v3.test.cjs` 直接加载 |
| `martial-moves-runtime.js` | `tools_docs/build_runtime_moves.py` 的输出（武学生成链最后一步） |
| `martial-hearts-runtime.js` | `tools_docs/build_runtime_hearts.py` 的输出 |
| `martial-external-data.js` | `tools_docs/build_martial_lineage_v3.py` 的输出 |
| `equipment-runtime.js` | `tools_docs/build_weapon_stats.py` 写入、`tools_docs/build_armor_acc.py` 读入后合并护具与佩饰 |
| `martial-manual-sources.js` | `tools_docs/build_manual_placement.py` 的输出 |
| `martial-move-icons.js`、`martial-heart-icons.js` | `tools_docs/pack_martial_moves_v3.py`、`pack_martial_icons_v4.py` 读写的图标表 |
| `martial-manual-icons.js`、`equipment-icons.js` | `tools_docs/build_manual_icons.py`、`build_equipment_icons.py` 的输出 |
| `chapter1-data.js` | `tools_audio/sync_voice_catalog.py` 从这里读开篇台词同步配音清单 |

这些生成文件原本供旧原型运行时加载，现在没有运行时使用者。若以后改武学、装备生成脚本不再输出运行时数据，可以连同本目录一起归档。
