# 按模块整改：偷窃小游戏、新素材融入场景

状态：历史　最后核对：2026-10-27

## 需求

评审台第十八～二十二轮的回答按模块合并后（见 `xiaojianghu/docs/updates/2026-10-27-review-selfcheck.md`），用户让先做两个模块，重发的题按评审前自查流程（R-评审-01）附素材。

- **偷窃小游戏**：宋先生也要弹小游戏（“奖励丰厚也是因为游戏比较难”）；看不懂怎么算成功、红色和金色有什么区别；没看到实机样子；Esc 缩手照旧算失手。
- **新素材融入场景**：新素材“硬生生嵌到背景里”，色彩和摆放位置都不对（晒谷场最明显）；额外加的人很突兀，要么直接放大道上；货郎担和谷堆也太鲜艳。

## 改动

偷窃（`js/qihe-steal-ui.js`、`js/qihe-steal-ui.css`、`js/qihe-steal.js`、`tests/qihe-steal-table.test.cjs`、设计稿 `xiaojianghu/docs/design/npc-steal.md` 第 6、8.4.2 节）：
- 宋先生不再按存档种子一次定局，照常弹袖里一按；删掉 `seedResult` 和存档种子，以及对应测试。
- 刻度弧下加一行规则，三行图例改成大白话：落在金色段＝得手，东西到手；金段正中的红点＝妙手，到手、窃术经验多 1；落在金段外或没按＝失手，被他发觉。两手的东西注明“连按两手都中才到手”。
- 结果印旁加一句后果。

新素材（`js/qihe-town.js`、`art_sources/qihe-props-fit-20261027/`、素材登记）：
- 8 件道具按所在底图的色彩统计压色，不重画（脚本 `harmonize.py`，系数见 `out/report.json`），新键 `*_fit_20261027`，原件保留；运行时只加载压色版。
- 晒谷席、谷堆从山脚草地挪到西田埂路口空地；货郎、货郎担、阿栓、小禾从古井草地挪到村心大路；撤掉井台石板；立着的道具脚下加贴地淡影。
- 粮仓只压色，位置没动，已在评审台写明，请用户定要不要挪。

新工具：`tools_scene/qihe/shot_steal.cjs`、`tools_scene/qihe/shot_spots.cjs`（用本机 Chrome 截实机图，改前改后同取景）。

## 验证

- 单元测试：`tests/qihe-steal-formulas`、`qihe-steal-table`、`qihe-steal-ui` 通过。
- 场景测试：`verify_town` 12 项、`verify_expansion` 85 项、`verify_resources` 22 项、`verify_steal_real`、`verify_interactions` 通过。中途晒谷席、谷堆先后压住西田埂两个采集点，已挪开。
- 素材：`tools_assets/check_production.py` pass（镂空白名单按原件复制给压色版）。
- 实机截图：`evidence/2026-10-27-steal-rework/`（5 张）、`evidence/2026-10-27-props-fit/`（改前、改后各 6 张和 6 张对比图）。
- 评审台：整改写在第二十一轮第 9 题、第 6 题，各附图，挂在对应模块卡片；`check_review_batch.py` 通过；浏览器里看过图片能显示。

## 未完成

- 其余 9 个模块（能偷谁、查看页、图标、战斗背景、算命、关系页、易物商店、蔺管事、新人物剧情）还没动。
- 宋先生实机成功率显示为 9%，设计稿写的是 1%，还没查原因。
- 未发布、未提交。
