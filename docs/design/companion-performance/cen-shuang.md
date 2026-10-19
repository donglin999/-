# 岑霜：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/cen-shuang.md)

当前定妆：29岁成年；沿用户确认稿的成熟成年脸、黑发与金簪；墨紫、暗红和古金长衣，倚廊柱执账签，神态从容。
身体：必须参照用户两张身材基准：自然丰满胸部、明确收腰和腰胯曲线、修长腿部；正常衣装中可见胸腰轮廓。沿用户确认图的成熟丰腴体态、墨紫暗红长衣、领口和单侧裙衩。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 不急着接你的话 | 双手在腰前自然松收，一手轻搭另一腕，肩背舒展开、身体轻侧、头自然抬起，眼神平静看人、唇轻合。没有手中账签，当前腰饰固定完整。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/cen-shuang/state-neutral.txt) |
| 条件谈拢后的款待 | 右手持闭合账签立在胸下，左手低位向外打开、掌心朝上但不伸向镜头；头轻偏、肩舒展，重心在一腿、自然小笑，像给对方留下一句接话的余地。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/cen-shuang/state-happy.txt) |
| 不想把那笔账遮过去 | 右手握账签向下垂至腿旁，左手紧扣自己右肘内侧，使右前臂仍半悬而不垂两手；躯干偏转、肩沉但头未完全低下，目光落在远侧下方，眉间轻皱、唇压直，重心压在后脚。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/cen-shuang/state-sad.txt) |
| 把账签横过来 | 右手握闭合账签横在腰上、尖端朝自己侧方而不指人，左手食指屈起点住账签的一端；两肘外压、上身稍向前，重心在前脚，头偏侧、眼神冷利、唇抿成窄线，姿态是当面钉住问题。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/cen-shuang/state-angry.txt) |
| 算好的条件被改了 | 左掌翻起在腰前展示一张折好的普通凭条，右手持闭合账签停在左掌上方；身体微后撤但头向前确认，双眉稍抬、双眼定住凭条、唇微开，前脚仍朝对方。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/cen-shuang/state-surprise.txt) |
| 账签边的一句试探 | 左手叉腰，右手稳握闭合账签、将签尾轻靠下唇外侧，头稍偏、眼神从上眼睑下直看来人；重心在一腿、肩线斜而放松，嘴角挑起轻笑，成熟而含有计算。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/cen-shuang/state-tease.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
