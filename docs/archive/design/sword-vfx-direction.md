# 剑法表现 · 分级与参考

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）

[评审入口](sword-studies.md) · [甲等](sword-grade-a.md) · [绝等](sword-grade-ultimate.md)

> **2026-10-07 方向调整**：剑法改为东方剑侠语汇，五档样例与生成范围见[剑法特效 · 东方剑侠方向](../../design/sword-vfx-xianxia.md)。

> 后续用户反馈：水流形态打击感不足。分级规模保留，攻击主体以[打击感调研](sword-impact-research.md)为下一轮修正依据。

## 用户确认的分级（2026-10-01）

当前已认可的七路宽厚粒子剑气正式作为**乙等**基准，保留其轨迹、粒子尺寸、宽度、速度和 4.7 秒时间轴。展示名改为“七流穿云”。甲等和绝等在同一粒子风格下增加独立编舞。

| 品阶 | 核心识别 | 演出结构 | 完整演示 |
| --- | --- | --- | --- |
| 乙 | 七路宽厚剑流 | 一轮渐密汇击 | 4.7 s |
| 甲 | 双流成阵、上下八剑、交叉重斩 | 蓄势 → 连击 → 重斩 | 6.1 s |
| 绝 | 三层剑域、十二剑雨、回吸、主辅贯空 | 蓄势 → 第一波 → 间歇 → 第二波 → 余韵 | 8.1 s |

这些是表现评审样例，不表示新功法已加入游戏，也不自动改动现有 T0–T3 战斗数值。

## 调研来源及采用方式

以下来源阅读于 2026-10-01。引用的是公开设计说明、讲座摘要及作者案例文字，未把文章内无法播放的演示当作已观看视频。具体秒数和剑招编舞均为本项目设计。

- [Riot：Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/)：技能的重要性应与其吸引的注意力相匹配，文中以 Zoe Q 的前置信号和 Kayle 大招的高影响、高表现为例；投射物尾部也用于说明行进方向。用于本项目的品阶层级、单一主焦点与有方向的剑流。
- [Riot：VFX Style Guide 介绍](https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/)：从玩法、明度、色彩、形状、时间组织特效。用于限制色彩角色、低亮外层与亮核分工，不把全部元素同时推至最大亮度。原 PDF 链接本次跳转失效，因此未将 PDF 内页作为已验证依据。
- [GDC：The Thinking Process of Beautiful Design](https://gdcvault.com/play/1025300/Visual-Effects-Bootcamp-The-Thinking)：Riot 艺术家 Ryan Woodward 的讲座摘要强调二维动画思维及音乐性节奏。用于设计慢展开、快释放、间歇和重拍；这里采用的是摘要原则，并未声称看完讲座。
- [Paulina：Groundbreaking lava attack](https://realtimevfx.com/t/groundbreaking-lava-attack-vfx-breakdown/17186)：作者公开的 Unity VFX Graph / ShaderGraph 案例及围绕蓄势、命中、地面表现的讨论。用于把角色蓄势、主攻击与地面余波安排为不同层和时间点；它是个人案例，不等同于商业游戏已采用的规范。

## 工程落点

`sword-choreography.js` 存放高阶时间表与发射脚本；`sword-particles.js` 负责确定性粒子发射与渲染；`sword.js` 统一推进时间、受击闪亮与音效。前后景分开绘制，避免场景后方气流盖住人物。

当前原型使用 Canvas CPU 粒子，较高粒子数量应在目标设备验证。后续实战降级优先裁剪外层碎屑和拖尾采样，保留主路径、关键命中时刻、回吸阶段与重拍；不改变甲绝独立编舞来省成本。
