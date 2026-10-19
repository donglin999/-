# 戚铮：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companion-men.md)

当前定妆：28岁成年；精瘦长脸、墨色短衣、窄刃长刀、账签与旧铜扣；目光警觉。
身体：成年男性，按护卫／匠人职业塑造体格，不统一肌肉模板。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 抱臂听清价码 | 左右前臂交叠胸下，右手轻扣左上臂、左手自然收在右肘内侧；身体微侧、前后脚错开，重心在后脚，头平、眼神冷静审量、唇轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qi-zheng/state-neutral.txt) |
| 把谈妥的一笔收好 | 左手把闭合薄账册托在腰前，右手拇指压住夹在册中的一角普通凭条、准备合上；肩放松、身体略侧、前脚轻松，眼神有满意而不热情、嘴角一边轻扬。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qi-zheng/state-happy.txt) |
| 账算清了仍有人没回来 | 左手抓闭合账册的边沿垂在身体侧下方，右手轻扶自己额前一瞬、肘向外低开；身体微前弓、头偏低、重心后脚，眉间深收、嘴角僵直，没有哭泣和双手扣腰。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qi-zheng/state-sad.txt) |
| 把这场交易停下 | 右手将闭合薄账册收进自己左肋，左前臂横压封面，双肘收紧；身体转向一侧像准备离开、前脚尖也转出，头却留向说话人、眼神冷硬、唇压直。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qi-zheng/state-angry.txt) |
| 正在数的账忽然停住 | 左手在腰前托开小账册，右手食指悬于某一页的中段、手指收紧停数；头向侧上抬、眼神聚焦、眉略扬、唇微开，身体仍站稳、前脚脚尖轻转向消息来源。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qi-zheng/state-surprise.txt) |
| 话少但在重新估价 | 左手握闭合账册或原薄账物靠腰上，右手两指抵自己下巴，双肘收近；身子微侧、重心后脚、眼睛向下方追数、眉收、唇紧合，肩稳不惊。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qi-zheng/state-calculating.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
