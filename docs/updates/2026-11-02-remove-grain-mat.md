# 去掉西田晒谷竹席和谷堆（2026-11-02）

状态：本地完成；未提交、未发布。

用户（看物资点截图时，指着西田的晒谷竹席）：“这玩意直接去掉”

## 改动

- `js/qihe-town.js`：删掉西田的晒谷场、谷堆两个点，以及告示招工、翻谷领炒米的接线；两张竹席、谷堆素材不再加载，文件留着不删（同 10-30 删粮仓的做法）。
- `story/01-开始/村中-景物.ink`：删 `qh_notice_work`、`qh_grain_turn`、`qh_grain_idle` 三段。这份剧本用户批准过，按“直接去掉”这句话重新登记批准（`build_ink.cjs --approve`），改动只有这三段的删除和一行说明。
- `tools_scene/qihe/verify_town.cjs`：翻谷那项改成断言竹席、谷堆、招工条都不在；`shot_spots.cjs` 去掉晒谷场。
- 设计稿 `qihe-map-interactables.md` 顶部加注：W1、Q4 的晒谷部分作废。

## 影响

- 少了一个领一袋炒米的小活。东埠破货箱、商店、接应院仍有炒米或干粮来源。
- 旧存档里 `S.qiheTown.grain` 字段留着不读，不报错。

## 验证

- `build_ink` 通过；`verify_town` 12 项、`verify_treasure` 7 项通过；`verify_expansion` 结果见改动清单。
