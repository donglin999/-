# 陆衡：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companion-men.md)

当前定妆：30岁成年；风霜面容、褐色护送行装、结实肩背、修补刀鞘；说话先问行程。
身体：成年男性，按护卫／匠人职业塑造体格，不统一肌肉模板。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 先确认一起走的路 | 左右手各抓一侧背篓肩带，双肩自然负重、双脚稳站，身体略偏向说话人，头平、眉眼冷静、嘴唇轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/lu-heng/state-neutral.txt) |
| 确认前路后指给你 | 右手稳住自己的肩带，左臂向侧前方展开、食指指出一条方向而不是指人；肩背舒展、头看向所指方向、自然满意小笑，前脚略转向路线。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/lu-heng/state-happy.txt) |
| 检查过的带子还握着 | 左手抓一侧肩带靠肩下，右手轻捏另一侧背篓系带末端垂在胸下，双手高低不同；身体微向一侧低下，头偏低看向远处空位、眉间忧起、唇绷，双脚维持负重站稳。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/lu-heng/state-sad.txt) |
| 挡在退路和来人之间 | 左臂低位伸向身体侧后、左手四指朝后轻弯招同伴撤开；右手握原腰鞘上段但不拔刀，前脚跨在前、髋转侧挡住通路、肩稳，眉压低、嘴唇紧合、目光直盯危险方向。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/lu-heng/state-angry.txt) |
| 负重中停步回看 | 左手稳一侧肩带，右手向身体侧下方平伸、掌心向下示意同行先停步，肘低不推向镜头；躯干仍朝行路方向、头转回约四分之一，眉扬、眼睛睁大、嘴微开，前脚迈出后落地停住。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/lu-heng/state-surprise.txt) |
| 确定人齐后才松肩 | 左手还握一侧肩带、右臂松垂，肩明显沉松、站姿从紧绷变成一腿轻放；头低一点、短暂闭眼、嘴角带轻松小笑，无夸张气云。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/lu-heng/state-relief.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
