# 《八方旅人》I／II 调研与本作取舍

状态：现行　最后核对：2026-10-19

2026-10-04；以两部单机正传的官方系统、角色页和发行方介绍为证据。未实机逐帧测量；不混用手游、TRPG、零代或其他JRPG规则。精确伤害公式、神技消耗及隐藏装备运算未在本次官方材料中核实，不冒充原作结论。

[评审首页](README.md) · [第二版具体改动](../../archive/design/martial-review/v2-changes.md)

## 官方确认与设计判断分列

| 维度 | 官方可确认的设计 | 本作推导／采用方式 |
| --- | --- | --- |
| 破防与蓄力 | 击弱点破防、投入BP强化行动，是系列核心；一代官方介绍区分蓄力物理连击与法术强化。[战斗介绍](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/OCTOPATH-TRAVELER-1275922.html) | 将“先拆防再输出”写成行动决策；每门招式指定BP究竟加段数、威力、持续还是资源，不能多项一起涨 |
| 本职与副职 | 一代在神祠取得副职；二代通过公会取得许可，可在原职之外加一个战斗职业。[一代介绍](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/OCTOPATH-TRAVELER-1275922.html)、[二代系统](https://www.jp.square-enix.com/octopathtraveler2/system/) | 本门是身份，外派授业是能力来源；副修不等于改换门庭。保持原有六招式栏，不叠加八职业菜单 |
| 支援能力 | 一代商人官方页说明，学会职业技能达到相应数量会开放支援能力，且能组合不同职业的支援能力。[商人](https://www.jp.square-enix.com/octopathtraveler/traveler/tressa/) | 按功法结构v2约束运转槽；内功固定一主动一被动，取消旧特性选装提案 |
| 资源支援 | 二代商人具有BP恢复、SP供给等支援，个人底力可立即蓄满BP。[商人](https://www.jp.square-enix.com/octopathtraveler2/traveler/partitio.html) | 徐令仪承担“把一次行动换成队友爆发资源”的职责；本作具体BP曲线自行设计，不照抄商人 |
| 行动时序 | 二代猎人可用多段弓技谋求破防，也能延后敌方行动。[猎人](https://www.jp.square-enix.com/octopathtraveler2/traveler/ochette.html) | 沈雁回延后符合资格的敌方意图；快慢装备都有用途，延后不等于眩晕 |
| 范围变化 | 二代舞者底力能将适用的单体能力全体化；职业含行动顺序调整。[舞者](https://www.jp.square-enix.com/octopathtraveler2/traveler/agnea.html) | 秦绯鸢主动安排队友先出手；未来可研究范围转换，当前不把所有单体保命无条件全体化 |
| 破防角色反差 | 二代神官虽有治疗与复活，底力可让攻击无视弱点削盾。[神官](https://www.jp.square-enix.com/octopathtraveler2/traveler/temenos.html) | 苏芷保留金针观察，支援角色在无需治疗时也有贡献；不把其所有攻击改成常驻万能削盾 |
| 目标收束 | 二代学者底力能将全体魔法集中到单体并增强威力。[学者](https://www.jp.square-enix.com/octopathtraveler2/traveler/osvald.html) | 高阶可改变范围、时序或窗口。本轮绝技要求完整蓄势再形成高潮，未来再审范围转换的具体白名单 |
| 个人专长 | 二代药师的调合使用材料、BP增加可用材料；底力允许不消耗材料调合。[药师](https://www.jp.square-enix.com/octopathtraveler2/traveler/castti.html) | 区分能传授的武学与不可复制的个人经验；苏芷急救判断、叶蘅循脉经验保留个性；不增一套未经规划的战斗药材消耗 |
| 额外行动 | 二代盗贼底力可在一回合内行动两次。[盗贼](https://www.jp.square-enix.com/octopathtraveler2/traveler/throne.html) | 确认“行动次数”是很强的设计资源。本作先做改序而不复制行动，等现有回合、宠物与多段稳定后再评审双动 |
| 装备与职业 | 一代官方新闻说明，副职拓展能装备的兵器与能用的能力。[官方新闻稿](https://www.jp.square-enix.com/company/ja/news/pdf/6341a4dc7edeb49921823c7886f3e26b.pdf) | 装备必须与战术覆盖、时序、支援适配一起评估。保留本作单武器三槽；不宣称八方使用同样槽位，也不抄未核实的装备算法 |
| 场景能力 | 两代都有按人物不同的场景指令；二代增加昼夜差异。[二代系统](https://www.jp.square-enix.com/octopathtraveler2/system/) | 学武、打探、偷盗在不同系统明确判定。图标画一把短刀不能同时代表战斗伤害、偷窃和机关万能钥匙 |

## 这次真正改变的地方

原方案已有不少名称与形象，但护卫同质化、统一削盾上限及一次性绝技会削弱组合空间。V2先改善“这一回合由谁做什么”，再考虑增加招式数量。

**保留**：三年培养、真实师承、弱点与BP、六招式上限、主辅心法、三装备槽、像素粒子战斗及手绘图标。

**调整**：逐招BP合同、支援分工、绝技资源循环、每招削盾预算、内功一主动一被动、装备速度取舍、人物独有被动。

**后置**：全员独立底力条、免费额外行动、常驻无视弱点、无限BP供给、全武器随意切换。后置项没有被写成当前实现，更不由本次调研自动获准开发。
