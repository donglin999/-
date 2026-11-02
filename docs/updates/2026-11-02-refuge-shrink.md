# 接应院缩小成小农舍（2026-11-02）

状态：本地完成，待用户验收；未提交、未发布。

用户：“太大了，而且没剧情，设计得小一点吧”；看了两张候选后：“用候选1”。

## 改动

- 底图：左上的大院（院墙、门楼、厢房）换成一间三开间小瓦房加竹篱前院，篱笆东侧留口子接大路；空出的地方林子往里收，院南是草地和几棵树。路、凉棚、登记桌、河、渡口不动。302 生图（备用密钥），出图带半透明，入库时压成不透明；东侧篱笆口去掉半截立柱。
- 批次 `art_sources/qihe-refuge-shrink-20261102/`（`adopt.py` 从 `qihe-expansion-data.before.js` 出发，可重复运行）。新文件 `m_qh_refuge_20261102.webp`、`m_qh_refuge_props_20261102.webp`，素材 id 不变，状态候选。
- 遮挡件重切（房子、篱笆、水缸、柴堆、长凳、三棵树，右半边沿用 11-01 的切件），x<700 的碰撞重标。
- 站位：周婶、陈伯、村口老人挪进小院门前（440/520/600, 352）；对证那场陈伯、周婶挪到 460,620 / 460,680（原位落在新画的树上）；站位说明“院墙外”改“篱笆外”。

## 验证

- `verify_scene_reach`、`verify_staging`（24 场）、`verify_resources`（22 项）、`verify_treasure`、`verify_chapter`、`verify_hidden`、`check_production`（1113 件）通过；`qihe-finale-browser` 两条救援路线走到次日对证都通过。`verify_expansion` 结果见改动清单。
- 实机截图 `review/points-20261102/refuge-yard.png`、`refuge-road.png`。

## 没做

- 接应院战斗背景 `bb_qh_refuge_atmo_20261101` 还是按 11-01 大院画的，没重出。
