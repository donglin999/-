# 晏小楼：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/yan-xiaolou.md)

当前定妆：23岁成年；沿本人较短圆的成人面颊、明亮笑眼与梨涡；杏黄发带与高马尾，象牙交领贴身上衣、收腰带、杏黄短披帛与单一A字短裙，内置不透明安全短裤；两腿自然微分站立，原戏本、招手与短靴，街头戏台初见情境。
身体：必须参照用户两张身材基准：自然丰满胸部、明确收腰和腰胯曲线、修长腿部；正常衣装中可见胸腰轮廓。保留本人已有成年体态；象牙上衣自然承托胸腰，单一A字短裙呈现两条完整腿部，短披帛与隐藏安全短裤沿戏班身份；没有交叠长下裙片。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 台下认真听 | 左前臂抱着闭合戏本贴在腰腹，右手轻覆本下边；身体略侧、重心均衡，头稍抬向说话人，目光平静而不卖笑，双肩自然。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/yan-xiaolou/state-neutral.txt) |
| 公开招呼新观众 | 左手抱戏本靠胸下，右手在肩旁展开五指轻招，双肘开放；前脚稳、后脚轻松、头稍侧，杏眼明亮，成年真实的欢迎笑。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/yan-xiaolou/state-happy.txt) |
| 笑话说不下去了 | 左前臂将闭合戏本横托于腰前，右手指尖轻压本脊，肩线明显由原开放降下；身体半侧、重心偏后，头向另一侧微低，眼神离开观众、嘴角没有笑，像从台上突然回到台下。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/yan-xiaolou/state-sad.txt) |
| 把自己的稿子抱回来 | 左臂把闭本竖抱贴肋，右手食指向下点自己的本封面，右肘向外，头偏侧；身体向对方斜前半步、肩挺直、眉锋压低、唇紧，像当面要求给作者署名，不推掌。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/yan-xiaolou/state-angry.txt) |
| 段子正好断在半句 | 左手托开戏本在腰上、右手食指悬在书页行间、肘自然外开；头先转向一侧，眼睁大、眉抬起、嘴停在说到半句的形状，前脚欲迈未迈、上身稍前，不摸胸。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/yan-xiaolou/state-surprise.txt) |
| 故意多停半拍 | 左手抱闭合戏本贴胸下，右食指轻触脸颊外侧、其余指自然收拢，身体歪一点但双脚落地；头稍偏、一眼轻眯、嘴角带小笑，重心在一腿。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/yan-xiaolou/state-playful.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
