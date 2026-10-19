# 徐令仪：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/xu-lingyi.md)

当前定妆：26岁成年；额颞略宽的心形脸，清楚颧面、下巴短而钝收；平直长眉，眉头有自然密度；中等长的平眼裂，双眼皮清楚、眼尾平稳；清楚笔直鼻梁，眉鼻衔接利落；明确唇峰、略薄上唇与适中下唇，唇线端正；端正笃定，文职办事者的专注；原素簪发髻；绛青对襟长背心、米白窄袖内衫；文夹、文袋和可拆公议圆牌。
身体：必须参照用户两张身材基准：自然丰满胸部、明确收腰和腰胯曲线、修长腿部；正常衣装中可见胸腰轮廓。骨架、肌肉和软组织随本人职业与气质，衣装按原稿合体裁剪。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 等陈述落到实处 | 左手和左前臂抱闭合文夹在胸下，右臂自然垂下、右指稍松；身体偏侧站稳、双脚近而不交叉，肩平、下巴自然，眼神认真向说话人，嘴轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/xu-lingyi/state-neutral.txt) |
| 愿意把好消息告诉你 | 左前臂抱闭合文夹在胸下，右手平覆文夹正面，雙肘比常态略开放；头稍侧、身体轻前倾、眼神温暖，唇角真实小笑，重心向来人但双脚仍平稳。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/xu-lingyi/state-happy.txt) |
| 旧案读到失语 | 左手在腰上方托开薄文夹，右手握一支短笔贴在文夹内侧却停写；身体稍前倾、右肩低落，头俯向纸页，眉间收起、嘴角压低，左脚承重，像认识到自己留下过伤人的裁断。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/xu-lingyi/state-sad.txt) |
| 把依据指给对方看 | 左前臂在身前托开文夹、封面略向对话者，右手食指指到页内一处、其余手指自然收拢；身体挺直并向前一点、两脚扎实，下巴平、眉头压紧，嘴唇成直线，怒气落在据理争辩而非封路。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/xu-lingyi/state-angry.txt) |
| 翻页时忽然认出来 | 左手托半开的文夹，右手两指捏住一页右上角、翻页动作停住；头向上转、长眉抬起、眼睁大、唇微张，身体仍直站，前脚停在轻迈位置而不后仰。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/xu-lingyi/state-surprise.txt) |
| 承认自己说重了 | 左前臂抱住闭合文夹贴胸，右手在文夹下方轻抓左前臂，双肘收拢；肩膀内收、头低、目光斜下，重心偏后，唇轻抿、眉间微尴尬，成年认真而非少女娇羞。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/xu-lingyi/state-awkward.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
