# 武学文档取消旧二十章章号锚点（2026-10-19）

状态：现行　最后核对：2026-10-19

## 需求

用户 2026-10-19：“取消，没有这个定义的”。本作只分开始、培养、游历、终局四部分（R-剧情-02），没有“四篇二十章”结构。武学文档里残留的“第9章”～“第19—20章”等章号（用作武学获取时点和数值模拟锚点）全部取消。

## 口径

- 删除章号；需要时点处写“获取时点待安排”。不把章号换算成新的游历时点（R-剧情-05）。
- 数值模拟锚点：行标签改为不带章号的写法，数值一律不改。`travel_entry` 原“第9章初到游历”改为“初到游历”；`chapter14`／`chapter17`／`chapter18`／`finale` 原“第14章公共锚点／第17章／第18章／第19—20章”改为“锚点9／锚点10／锚点11／锚点12”（按12个锚点的顺序编号），并注明“原二十章锚点已取消，时点待安排，数值未改”。
- 锚点的机器 id（`chapter14` 等）保留不改：`tools_balance/combat_sim.cjs`、各 `sim/results-*.json`、`sim/chain-*.json`、`sim/loadouts.json` 都按 id 取数，改 id 会使历史模拟结果对不上。id 不对玩家和文档正文显示。
- 未删文件、未提交 git；未动 `rules.json`、`rules.lock`、`bible/定稿事实.md`。

## 改动

数据源（`docs/design/martial-review/`）：

| 文件 | 处数 | 内容 |
| --- | ---: | --- |
| `catalog.json` | 6 | `phases.TRAVEL`、`phases.LATE` 去掉“9—14章”“15—20章”；4 条 `obtain` 去掉章号 |
| `martial-systems.json` | 8 | 3 套散人功法的 `obtain`／`training_stages.requires` |
| `martial-systems-v2.json` | 8 | 同上 |
| `literary-grade-matching.json` | 4 | `design_basis.obtain` |
| `balance/budget.json` | 5 | 锚点 `stage` 标签 |

文档：

| 文件 | 处数 |
| --- | ---: |
| `independent.md` | 15 |
| `weapon.md` | 9 |
| `guiyun.md` | 4 |
| `move-contracts.md` | 4 |
| `acc.md`、`armor.md`、`hearts.md` | 各 3 |
| `rules.md` | 2（成长阶段表两行，含“第19章不可逆行动”改为“不可逆的最终行动”） |
| `hechuan.md`、`songfeng.md`、`white-heron.md`、`zhaochuan.md`、`guijintang.md`、`ye.md` | 各 2 |
| `alliance.md`、`patrol.md` | 各 1 |
| `balance/progression.md` | 6（表格 3 行、加注 1 处、游历地区访问顺序一段 2 处） |
| `balance/validation.md` | 1 |
| `balance/sim-report.md` | 9（绝学取得时点改按锚点表述，月份假设改列 38、44、50、56、60、64 月，并加注） |
| `balance/curve.csv` | 5（由 `check_curve.py` 重新生成，换行统一为 LF；`arithmetic.json` 重生成后无变化） |
| `balance/sim/tables-r6.md` | 11（由 `sim_report.cjs --main r6 --jue r6-jue8 --chain r6 --alt r6-brk20` 重新生成，比对只有标签与注释变化；页首状态行补回） |

阶段行统一写法：“下山游历（另满足人物条件；获取时点待安排）”“后期（最终行动前取得机会；获取时点待安排）”。

脚本：

- `tools_balance/sim_report.cjs`：“绝学提前到第14章取得时”改为“绝学提前到锚点9取得时”；表格页加注“原二十章锚点已取消”。
- `tools_balance/progression_sim.cjs`：注释“下山后每章约 2 个月”改为按锚点月份假设，注明时点待安排（不改数值）。

## 未改与待定

- `story-decisions.md` 第27行、`docs/design/README.md` 第16、178行写到“四篇二十章”，是历史决定与追溯说明，未改。
- `rules.md` 与各武学页仍用“后期”一词（原与“15—20章”并列），它不是四部分之一；本次只去章号，是否改称“游历后段”或“终局前”需用户定。
- 锚点 9—12 的实际时点、“绝学提前取得”的位置均待剧情安排后再定。

## 备份

改动前原样备份在 `_attic/2026-10-19-chapter-anchors/`（含 `manifest.json`）。

## 检查

- `python3 tools_docs/check_docs.py`：通过（过时说法 0，死链新增 0，缺状态 0）。
- `python3 tools_docs/consistency_check.py`：`four-parts-not-chapters` 无涉及武学目录的命中。
