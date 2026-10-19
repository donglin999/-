# 石长庚：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companion-men.md)

当前定妆：26岁成年；厚肩方脸、红褐无袖外褂配内衫，磨旧绑手，憨厚但不呆傻。
身体：成年男性，按护卫／匠人职业塑造体格，不统一肌肉模板。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 抱臂等个准话 | 右前臂横在胸下、左手扶右臂外侧作松抱臂，双肘不耸；两脚稍分、肩稳、重心居中，头自然看向说话人、眉眼平直、嘴轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shi-changgeng/state-neutral.txt) |
| 说好一起把活干完 | 右手握松拳低位轻靠左掌，左掌向内托住拳下而不是抱拳礼；双肘在腰前打开、身子向前一点、脚分开承重，眉眼爽朗、露齿小笑，像主动和人约定开工。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shi-changgeng/state-happy.txt) |
| 肩上的绳也没卸下 | 左手抓住肩上原绳卷的固定带，右臂低垂、右手松拳贴在腿侧；肩一高一低、头低向前方地面但背仍扛住负载，膝稍松、重心居中，眉间担忧、唇压低。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shi-changgeng/state-sad.txt) |
| 先把人护到身后 | 左前臂弯在身体侧后、左手掌心朝后向下示意同伴退开，右手低位握拳紧贴肋旁；身体向前半步、肩展开、前膝微弯、头直视对方，眉压、嘴紧，动作不是向镜头推掌。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shi-changgeng/state-angry.txt) |
| 扛活时回头确认 | 左手握肩带稳住绳卷、右手拇指短促指向自己胸前但不贴胸，右肘低位外张；躯干仍朝工作方向而头回转、眼睛张开、眉扬、唇微开，前脚站稳，像突然听见自己欠的饭钱。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shi-changgeng/state-surprise.txt) |
| 两手叉腰痛快笑 | 双手叉在腰带两侧、两肘展开，肩背舒展、脚分开站稳，头稍抬后，眼弯、张嘴成年爽朗大笑，重心均衡。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/shi-changgeng/state-laugh.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
