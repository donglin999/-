# 沈雁回：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/shen-yanhui.md)

当前定妆：24岁成年；修长利落的软方鹅蛋脸，颧骨与下颌转折清楚；略粗直眉，外段轻扬；偏窄长的锐杏眼，上眼线平直，眼尾轻提；挺直有骨感的鼻梁，鼻尖利落；较宽唇线、饱满下唇、一侧嘴角微提；英气自信，回身看人时目光有定力；黑色高马尾与灰蓝发带；靛蓝短勤衣、贴腿长裤、直护腕、案袋素木委办牌；长棍、江桥回身与柳岸柔光。
身体：按用户身材参考，保留自然丰满胸部、明确收腰与腰胯、修长腿部；衣装剪裁精致且适合行动，体态流畅，眼神与回身姿态具有吸引力。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 等你把时辰说清 | 左手握长棍近上段、棍底着地在左脚外侧，右手叉腰；前后脚小错步、身体略侧，肩平而警醒，头转向说话人，眼神认真、唇轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shen-yanhui/state-neutral.txt) |
| 核对之后放行 | 左手将长棍立在体侧，右手拇指向自己身后短促一示、其余四指收拢，不挥手；身体侧开半步给人留路，肩松、目光直接，嘴角很小的认可笑。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shen-yanhui/state-happy.txt) |
| 核查中难得垂眼 | 左手扶立棍，右手从案袋口取出一张折痕凭条、低位握在腰前；身体微侧、右肩沉下，头垂向凭条但脚仍站稳，眉间收起、嘴唇绷紧，像发现自己的记录曾让证人害怕。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shen-yanhui/state-sad.txt) |
| 横棍守住这条界限 | 左右手各握长棍一段，将棍横在腰前成清楚的水平界限；脚分开站稳、膝微松，身体稍前、肩绷、眉压低，目光严厉直视对方，唇抿紧，不挥棍攻击。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shen-yanhui/state-angry.txt) |
| 迅速回身找声音 | 左手把棍竖稳在远侧、底端着地，右手低位抓住案袋口使其不晃；髋仍朝前而肩和头回转约四分之一，后脚跟稍抬但脚尖着地，锐眼骤然睁开、眉略抬、唇微开。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shen-yanhui/state-surprise.txt) |
| 答案还差一个时辰 | 左手继续握立棍、右手叉腰，重心压在后脚，肩轻侧、下巴微扬，右眉稍抬而眼睛窄下，唇压平，注視说话人等待补充而非愤怒。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shen-yanhui/state-skeptical.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
