# 第二章培养数值实装 · CH2-BALANCE-2

2026-10-12。用户要求参考《侠客风云传》数值，结合已有功法和战斗系统，逐项写明活动收益、实际作用、练成次数并接入游戏。完成位置为本机当前栖河工作区、固定8792入口。

## 采用方案与来源

负责文档：[完整数值设计](../../../xiaojianghu/docs/design/cultivation-balance-20261012/README.md)、[144项活动](../../../xiaojianghu/docs/design/cultivation-balance-20261012/activity-table.md)、[15门功法及节点次数](../../../xiaojianghu/docs/design/cultivation-balance-20261012/martial-table.md)、[三年模拟和实际战斗](../../../xiaojianghu/docs/design/cultivation-balance-20261012/balance-report.md)。表格从正式规则和测试证据生成，入口为 tools_story/build_cultivation_balance_docs.cjs。

开工已核对 ai-onboarding、两工作区AGENTS、设计索引、培养与功法负责页、正式素材索引和 production-assets.md、更新流程。参考资料是2015/2017年《侠客》玩家实测；取学习效率因素、课程系数比和前三类经验曲线，按本作战斗量级缩放，未声称是原作官方现行公式。

- 每自由期12体力，三年149期、1788体力；正式课程5，学艺／生产3，杂务2，寄信1，送物2，剧情免费。护路笔记免费但每期一次。
- 学习效率取行动开始时悟性、培养常识、五档心情；所有成果都有属性、造诣、医术、制作或人物关系的实际消费者。
- 永久根基与每门功法熟练分开，培养、实战、秘籍共用熟练账本。结算显示累计前后、跨档属性、下个效果和预计练习次数；面板与战斗一致。
- 十套归云外功、四门内功、护路棍法使用既有身份。首学吐故纳新篇，高阶依六月／十三月／二十四月／三十一月、根基、先修和考校传授；不会开篇送镇派心法。
- 16个归云招式合同映射到当前战斗，补齐防御强化、守势、援护、独立熟练、绝招BP与调息等本地消费。心法进度和辅修容量显示同步。
- 旧单位仅迁移一次；保留真实旧属性下限、已学高重数、未完成活动的已扣体力和旧收益单位。已结算结果不重复奖励，人物自主加点保留。

## 核验记录

证据目录：[review/cultivation-balance-20261012](../../review/cultivation-balance-20261012/)。修改前指定模块快照保存在其中 before/；仓库其他已有改动保留。

| 检查 | 结果与证据 |
|---|---|
| 数值／旧档／材料 | tests/cultivation-balance.test.cjs通过；覆盖跨档效果、五档心情、协调归属、首次授课、阶段封顶、旧活动续结、旧高重数保留、免费笔记限额、生产实际产量；growth-test.log |
| 36月预算 | 4种策略×剑拳2路，全部149自由期，消耗不超过1788；growth-report.json。自动剧情胜负是固定夹具，未冒称真实全剧情试玩 |
| 正式页面 | tests/cultivation-balance-browser.test.cjs通过；实际属性／菜单／战斗派生值一致，未泄漏到同伴；实战熟练、秘籍和授课读同一进度；browser-report.json |
| 真实战斗 | 8路线×4时间快照×4现有敌人组×3固定种子，共384战，无超时；实际battleLoop、敌人AI、伤害、BP、破势和内力，跳过表现延迟；combat-report.json |
| 招式机制 | 真实引擎另测防御自动强化、一次反击、25%援护减伤、冷却、两名同伴卸力、扣BP后绝招正常施放、下一行动调息、首次看破只回一次内力；同上 |
| 预览 | tests/cultivation-balance-preview.test.cjs通过六视图，第三年镇派拳路快照可见实际功法；preview-report.json、preview.png、year3-master.png，已查看收益页截图 |
| 原整改回归 | cultivation-rework.test.cjs通过90场×384条件、465120台词实例；原browser／preview测试通过，含人物关系、入门传授及拜师对白 |
| 既有行记／演出 | node --test qihe-journal、qihe-journal-notices、guiyun-performance、guiyun-performance-bounds共20项通过；regression-test.log |
| 剧本生成核对 | build_cultivation_dialogue.py --check通过：90场、1255条源句，来源SHA 690a65ffbe49ccc13beefa30bb26a83236c40d5d5b07b9390bff999e4374d975 |
| 素材／入口 | check_production.py通过936项；serve-current.py --check为qihe-current、m_qh_central，SHA 29131902cd53c5a97d3367caf5e550aa5eab1fbbfe08577de2d5e3e74b1b10a4 |
| 语法 | 修改的JS模块node --check通过；定向diff空白检查通过 |

战斗样本是单主角、境界1，剑路桃木剑、拳路空手，无护甲／药物／队友，开场血内满，以隔离培养本身的影响。首季较技可通过，首季单人打头目吃力；成熟培养显著强于现有早期敌人。384场是确定性回归样本，不是大样本胜率估计。

## 运行与范围

[直接体验新数值](http://127.0.0.1:8792/review/cultivation-balance-20261012/)：收益、人物属性、三年策略快照、进阶授课、入门心法、自由安排。它加载正式游戏模块，使用独立review存档，切换示例重置该预览。正常游戏 http://127.0.0.1:8792/ 已使用同一规则。测试未读写玩家正常存档。

群壑承声在当前UI自动选最多两位在场角色；万壑的守势防御二选一界面、惊惧／内伤未来状态系统没有接入，描述与合同明确本地范围。独立目标招式动画、正式出师演出与尚未制作的后期敌人不在本轮完成结论内；本轮无素材生成或替换。

本地完成；无Git提交，无线上发布，未访问远端.6。
