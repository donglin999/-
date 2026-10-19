# 段明棠：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/duan-mingtang.md)

当前定妆：25岁成年；25岁成年，健康宽颊、明亮有力杏眼、麦色肤色、黑色高髻和赤色发带；赭红卷袖短褂、米白交叠内衫、炭灰高腰合体双裤口热裤与赤色窄包边、短侧布片、布绑手、工具腰带和缝补布囊、缠布短靴。
身体：沿本人自然丰满成年胸腰和明确腰胯曲线；肩背、手臂与长腿健美而流畅，炭灰热裤突出腿部线条，保留拳门劳动体态，不改变脸与上衣。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 抱臂听个明白 | 右前臂横在腰上，左手轻扶右上臂、右手藏在左肘内侧形成松抱臂；脚稍分开、重心均衡，肩平而不绷，下巴微抬，眼神直接、唇角自然。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/duan-mingtang/state-neutral.txt) |
| 大方夸你一声 | 右手叉腰、左手举到肩下竖拇指，双肩展开；一腿稳承重、另一腿轻松分开，头稍侧，眉眼明朗、露齿小笑。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/duan-mingtang/state-happy.txt) |
| 又把活揽到自己身上 | 左手把一副旧护腕贴在自己腰腹，右手捏住护腕上的松线停在半空；身体略往前压、肩膀沉下、前膝松弯，目光落在护腕而眼神疲惫，唇角轻落，像意识到自己还没学会让别人帮忙。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/duan-mingtang/state-sad.txt) |
| 拳头压在腿侧 | 两手握成清楚的拳，右拳收在肋旁、左拳垂至腿侧，肘角一弯一垂；肩宽站稳、前脚略前、重心压低一点，身体不挥击，眉锋压低、下颌绷紧、直视对方。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/duan-mingtang/state-angry.txt) |
| 护具差点没接稳 | 左手在腹前托住卷好的旧护腕，右手快速盖在其上阻止滑落，双肘一开一收；上身短暂向前、头突然抬起，眼神睁大、眉梢扬起、嘴微张，一脚略前但两脚落地。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/duan-mingtang/state-surprise.txt) |
| 肯把担子卸一点 | 右手松垂身侧、左手轻提本人肩上布带末端，肩背自然下落，重心在一脚而另一腿放松；头略抬、短暂闭眼、唇角很淡的轻笑，呼气不带烟雾或符号。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/duan-mingtang/state-relief.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
