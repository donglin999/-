# 霍逐尘：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companion-men.md)

当前定妆：28岁成年；粗眉、宽掌，灰棕工衣配皮围裙、工具卷，神态爱琢磨。
身体：成年男性，按护卫／匠人职业塑造体格，不统一肌肉模板。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 随手扶住工具腰带 | 右手叉在原工具腰带外侧、左臂自然垂下，身体轻侧、脚分开、重心平稳；头向来人、眉眼平静、嘴唇轻合，像工作被打断一会儿。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/huo-zhuchen/state-neutral.txt) |
| 边擦手边说修好了 | 左手捏干净擦布一端、右手用布轻擦自己左指，双手在腰上、两肘轻开；头稍侧、身体向来人一点，眼神亮、嘴角满意小笑、肩放松。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/huo-zhuchen/state-happy.txt) |
| 修过的东西出了问题 | 左手握擦布一端、右手紧抓同一擦布中段，两手下压在腹前，头俯下、肩背低落；脚仍稳立，眉间明显担心、嘴角下落，布被无意识捏紧而非在擦手。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/huo-zhuchen/state-sad.txt) |
| 把松动的零件摆到眼前 | 左掌在腰上稳托一块完整的小木金属零件，右手食指点其外缘、右肘明显外开；身子向前压、双脚稳立、肩一高一低，眉皱、嘴唇紧，像要对方看清偷工留下的危险，不举锤攻击。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/huo-zhuchen/state-angry.txt) |
| 听到异响先停住手 | 左手掌心在胸下托一个小圆形零件、右手两指原在拧它却突然分离停在上方，双肘有高低；头侧抬看声源、眉扬、眼睛张开、嘴微张，上身短暂僵直，重心在前脚，不触胸。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/huo-zhuchen/state-surprise.txt) |
| 零件里还有门道 | 左手稳捏小圆零件举在肩下、右手两指轻抵自己的下巴；身体向零件前倾、头偏、眼神细看、眉间专注，唇微开像在自言自语，双脚站稳。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/huo-zhuchen/state-curious.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
