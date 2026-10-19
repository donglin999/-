# 唐照雪：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/tang-zhaoxue.md)

当前定妆：23岁成年；用户本次指定的清丽成年脸、黑色高马尾、低饱和蓝白剑装、贴身束腰与护腕、佩剑及长靴；沿整张指定原图。
身体：完全沿用户本次指定图片的自然丰满成年体态、蓝白剑装剪裁、领口、裙衩和长靴；不得重新生成或以其他版本替换。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 端正听你陈述 | 右手叉腰、左手轻搭原剑鞘口外侧，剑未拔出；躯干平直略转侧，前后脚自然错开、重心居中，下巴平，直视对方、唇轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/tang-zhaoxue/state-neutral.txt) |
| 正式认可一招 | 右掌覆在左拳外侧作轻简的抱拳礼，双手在胸下、双肘舒展；身体挺直、重心均衡，头稍抬，眼神清亮、自然小笑，双靴稳立。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/tang-zhaoxue/state-happy.txt) |
| 护腕越理越紧 | 左臂斜横在身前、左手轻蜷，右手拇指拉住左护腕绑带却停住，双手高低不对称；头俯向护腕但眼神失焦，前脚脚尖微收、重心偏后，背仍努力挺直，内眉压低、唇轻抿，表现自责与受挫。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/tang-zhaoxue/state-sad.txt) |
| 按住尚未出鞘的剑 | 左手紧按原剑鞘口、右手在自己腰侧握拳，双肘向下压；身体转成略窄的剑步、前脚承重，胸肩平整而紧，下巴微压、双眉冷硬、嘴唇成直线。不是拔剑战斗，只是明确警告。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/tang-zhaoxue/state-angry.txt) |
| 抱拳礼停在半途 | 左拳已收在胸下，右掌尚未合上、停在左拳侧约半掌处；双肘呈一高一低，头转向一侧，眉眼迅速抬起、嘴唇微开，右肩稍转、前脚停住，身体未后仰。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/tang-zhaoxue/state-surprise.txt) |
| 护腕遮住难为情 | 左前臂抬至腰上、手指自然蜷；右手轻捏左护腕末端却不拉紧，身体偏侧、重心到远脚，头转向另一侧但眼神回看，双颊微热、嘴角压住一点笑，肩颈不夸张缩成少女。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/tang-zhaoxue/state-embarrassed.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
