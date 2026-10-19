# 叶蘅：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/ye-heng.md)

当前定妆：22岁成年；初版成年清秀脸、浅色发带、米麻灰色朴素干爽行装；针具、布带和药袋，初版同行阶段（定妆来自已撤除的襄阳演示）。
身体：沿初版清秀、轻巧、偏瘦的成年体态；米白灰色朴素行装，按原图恢复，不再套用上一轮增丰满修改。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 安静听你说 | 三分之二侧身，右手轻搭左手手背，双手松放腹前；左脚承重、右脚略松，肩颈平，头自然抬起看向说话人，杏眼警醒而平静，嘴唇轻合。药袋垂在腰侧，身体没有欢迎动作。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ye-heng/state-neutral.txt) |
| 照料后的小得意 | 右手掌向上在腰前托起一小束包好药布，左手拇指轻按布包结，双肘轻轻打开；上身向说话人前倾一点、重心到前脚，头略抬，清亮眼神与抿唇小笑，像终于把一件照料的事做对。两脚仍落地，不扬手问候。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ye-heng/state-happy.txt) |
| 想追问又忍住 | 左手从腰旁药袋中取出一条干净药布并捏住末端，右手停在身体前方约一掌距离，掌心向内、指尖半蜷，欲伸向远处又收住；一脚仍向前，身体却轻收肩，视线追着说话人而非盯地，内眉忧起，嘴角轻抿。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ye-heng/state-sad.txt) |
| 护住自己的药袋 | 右手拉住药袋口绳把袋口合上，左前臂横在药袋前护住，左手握自身右腕而非向外推；身体半转使腰侧远离来人，前脚稳立、后脚向侧退半步，眉头压低，直视越界者，嘴唇紧合，成年人的冷硬拒绝。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ye-heng/state-angry.txt) |
| 药布忽然停住 | 左手托着折到一半的干净药布，右手拇指食指保持折角的动作并悬在布边，双手停在腰上方；头先转向传话人、眼睛清楚睁大、唇微张，上身跟着转而脚仍停留原向，前后重心短暂停顿，不抬手按胸。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ye-heng/state-surprise.txt) |
| 没说完的亲近 | 身体略转开、肩收一点，右手拇指食指捏住自己胸前衣缘，左手轻托右腕，双肘贴近躯干；重心落在远脚，头偏下而眼神侧看说话人，双颊微红、唇轻抿带很小的笑，两脚不交缠。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/ye-heng/state-shy.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
