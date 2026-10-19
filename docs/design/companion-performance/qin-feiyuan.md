# 秦绯鸢：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/qin-feiyuan.md)

当前定妆：28岁成年；长黑发半束、侧花梳与金穗；舒展额颧、高弧眉、细长上挑眼与宽润微启笑唇。半透明绛红舞者披纱依肩点与衣侧固定，连续斜搭实际覆住领口和胸部上缘，规整褶线与细绣边；原合体不透明舞衣透过披纱可辨。腰胯保留不透明短内衬，前侧与后侧长裙片统一轻薄半透明红纱；单侧开衩和腰间褶线连贯，后纱透出栏杆与地面、左侧透出自然腿影，执花扇立在公开前廊。
身体：必须参照用户两张身材基准：自然丰满胸部、明确收腰和腰胯曲线、修长腿部；正常衣装中可见胸腰轮廓。成年丰盈体态与自信舞者站姿；轻薄半透明舞者纱依固定搭法连续稍遮胸部，斜褶和细绣边规整；原合体不透明舞衣承托自然，前侧和后侧长裙片统一半透明红纱，腰间褶线、开衩与细绣边连贯，保留自然腿影和不透明腰胯短衬。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 先看是谁来了 | 右手握合起花扇放在腰前，左手轻搭扇柄外侧；两脚近而不交叉、重心在一腿、肩微偏，偏头直视来人，唇角轻挑但未正式招呼。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qin-feiyuan/state-neutral.txt) |
| 开扇把场子接住 | 右手打开花扇举在肩下，左手低位向外邀议掌心朝上；身体向来人略侧、髋自然移到承重腿，眉眼明艳、宽唇真实笑，双脚落地。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qin-feiyuan/state-happy.txt) |
| 扇子合了还想说笑 | 右手将合扇轻垂在腿侧、扇尖朝下，左手扣在自己右肘上方；腰身半侧、肩下沉，但头仍试图抬向说话人，嘴角想扬又压下、眉间轻皱，重心压在后脚。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qin-feiyuan/state-sad.txt) |
| 合扇挡住要伸来的手 | 右手持合扇横斜在胸下、扇骨朝外但不指脸；左手叉腰、左肘外张，髋转向侧前、前脚稳压，眉弓下压、嘴角冷利，直视对方像已把调笑收回，不推掌也不扇耳光。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qin-feiyuan/state-angry.txt) |
| 扇边掀开重新看人 | 右手持半开的花扇在脸旁，左手两指捏扇骨外侧把扇面向下压开一点；头快速转向来人、眼睁大、眉弓抬起、唇微张，肩一高一低、脚略错步但未后缩。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qin-feiyuan/state-surprise.txt) |
| 扇后多看你一眼 | 右手叉腰，左手握打开花扇举在下半脸外侧、遮住一点嘴角，头偏、上挑眼直看来人；重心在一腿、肩轻松不缩，眉微扬、唇角带明艳调笑。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qin-feiyuan/state-tease.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
