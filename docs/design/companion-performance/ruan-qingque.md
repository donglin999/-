# 阮青雀：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/ruan-qingque.md)

当前定妆：24岁成年；乌黑齐颌短发、侧分碎刘海、一侧露耳；偏短成人软方脸、较浓直眉、横向长眼、短翘鼻与单侧抿笑。旧杏赭短打、米白内层、炭灰高腰热裤式布短裤、分段工具带与素短靴；货棚倚柱，举铜钱，单脚搭低箱。
身体：必须参照用户两张身材基准：自然丰满胸部、明确收腰和腰胯曲线、修长腿部；正常衣装中可见胸腰轮廓。肩臂轻巧有力；短打、明确双裤腿的高腰布热裤与工具带自然合体，衣料不透明。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 先试探半句 | 右手叉腰、左手轻捏本人肩带或衣缘，身体三分之二侧、重心在一脚；头偏、杏眼机灵地打量、嘴角一点玩笑，不幼态卖萌。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ruan-qingque/state-neutral.txt) |
| 把手艺亮给你看 | 右手两指夹一枚普通铜钱举至肩下、左手低位摊开；身体轻向对方、双肩开放、前脚承重，眼神亮、嘴角小笑。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ruan-qingque/state-happy.txt) |
| 摸着钱袋结不敢走 | 左手握紧自己腰侧钱袋结，右手低位轻抓左腕，手臂一横一垂；前脚朝外似要走、躯干却回转，肩内收，目光落在结上、眉间担忧、嘴角压低。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ruan-qingque/state-sad.txt) |
| 把伸出去的手收回来 | 左手牢握自己右腕、将右前臂拉回腰上，右手指收成半拳；身体低一侧肩、半侧转、前脚斜向外但仍站稳，眉皱、眼神硬、唇紧，不拔刃不推掌。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ruan-qingque/state-angry.txt) |
| 铜钱险些滑出手 | 右手掌心托单枚普通铜钱在腹前，左手拇指和食指迅速夹住币缘，双肘略张；上身向手中物倾一点、头突然抬向消息来源、眼睁大、嘴微张，重心向前脚，不能真的让币悬空。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ruan-qingque/state-surprise.txt) |
| 这回双手摊明白 | 左右手低位向两侧摊开、掌心微上而不对镜头推掌，双肘自然离腰；头微低、目光回看说话人，眉间难堪、嘴角勉强，肩轻缩、重心在后脚，两脚不交缠。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ruan-qingque/state-guilty.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
