# 《小江湖》设计短链

本目录是**目标设计**，用于写剧情、规划玩法和制作素材。先从此页按任务进入一篇短文档；同一事实只在负责它的文档维护。`docs/` 根目录下的技术文档描述**当前运行代码**，不代表新剧情已经实装。

| 要做什么 | 先读 | 再读 |
| --- | --- | --- |
| 写主线、核对因果 | [故事主线](story.md) | [三年事件表](timeline.md)、[势力与世界](world.md) |
| 写萧白、叶蘅、苏芷 | [人物](cast.md) | [叶蘅分支](ye-routes.md)、[叶蘅形象稿](ye-appearance.md)、[叶蘅表情](ye-expression-prompts.md) |
| 设计休闲培养 | [三年培养](cultivation.md) | [成长与战斗](growth-combat.md)、[生活与资源](life.md) |
| 写襄阳城、方位与市井 | [襄阳城设定](xiangyang-city.md) | [青蚨散事件](xiangyang-case.md)、[势力与世界](world.md) |
| 重做襄阳偏巷 | [偏巷功能布局](xiangyang-alley.md) | [襄阳城设定](xiangyang-city.md)、[襄阳素材规范](xiangyang-art.md) |
| 改襄阳现有剧情 | [襄阳章节脚本](xiangyang-chapter.md) | [青蚨散事件](xiangyang-case.md)、[故事主线](story.md) |
| 只测试襄阳片段 | [测试范围与缺口](xiangyang-test.md) | [青蚨散事件](xiangyang-case.md)、[技术测试](../testing.md) |
| 做 NPC 对话或江湖手段 | [NPC 交互](npc-interaction.md) | [三年培养](cultivation.md) |
| 做队友或宠物 | [队伍与宠物](party-pets.md) | [叶蘅分支](ye-routes.md) |
| 做襄阳地图、人物与证物 | [襄阳素材规范](xiangyang-art.md) | [生图提示词](xiangyang-art-prompts.md)、[美术管线](../art-pipeline.md) |
| 做其他立绘、地图或界面 | [表现规范](presentation.md) | 对应人物或事件页 |
| AI/开发对齐 | [文档与实现边界](delivery.md) | 对应主题页、[当前技术文档](../README.md) |

## 已确认的方向

- 主角固定名**萧白**，沿用旧稿的现代程序员穿越设定；叶蘅是初始女主。
- 叶蘅可入白鹇谷学医，或留在萧白身边共同修习，两线有不同立绘和能力。
- 栖灯馆从新剧情移除；旧十二日安排由**三年、三十六月的休闲培养**取代。
- 现有襄阳剧情改作三年中的一个地方事件。`#xiangyang` 已接入叶蘅同行、青蚨散案保底结案与可选深追；普通开局和部分共用渡口支线仍保留原型，具体边界看[襄阳章节脚本](xiangyang-chapter.md)和[片段测试范围](xiangyang-test.md)。

## 文档状态用语

**已确认**是用户明确决定；**设计方案**是本轮文档对执行细节的安排；**现行实现**只说明当前代码状态。设计方案仍可在后续讨论中修改。旧 `gamemaker` 剧本是取材来源，不再是本项目的第二套权威设定。
