# 裴知古：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/pei-zhigu.md)

当前定妆：25岁成年；25岁成年史料抄校研究者；柔和偏宽鹅蛋脸、松缓平眉、自然睁眼、圆润鼻尖与两点淡雀斑；细铜古式圆椭圆眼镜、透明镜片及细链，栗黑两条低松辫与耳侧木笔；燕麦白松垮露肩短衫、茶金不透明合体深领承托内搭、栗褐不透明裹式短裙与完整安全内衬、灰褐短靴；书册、夹签、折拓、系腰布囊。气质呆然入迷而非魅惑。
身体：丰腴成年胸部、细腰与腰胯曲线明确，胸部相对秦绯鸢当前选图丰盈两个美术档为设计目标；茶金内搭承托、胸下和腰胯不透明，衣装随意但结构完整，双腿自然。没有真实杯码测量。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 走神后倾听 | 单脚自然承重、肩颈松，头侧向来人，透过古式细铜眼镜自然睁眼认真听，回神稍迟、嘴轻合；左手托半合抄校册在腰侧，右指夹书签停住页。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/pei-zhigu/state-neutral.txt) |
| 查实欣喜 | 左手将合册收至肋侧，右手轻举沾墨拇指展示核验成功，肩身舒展、向来人点头而笑，不挥手招呼。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/pei-zhigu/state-happy.txt) |
| 为人惜字 | 左手托开册，右指缓慢抚过被划去的姓名，头偏低看页、右肩落下，眼神柔沉，嘴角收住，心疼资料中的人。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/pei-zhigu/state-sad.txt) |
| 据理护证 | 左前臂将证据夹稳贴肋，右食指点在册页证据处，身体侧转护住资料、抬下巴直视，不悦据理争论，不推掌或拔棍。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/pei-zhigu/state-angry.txt) |
| 停页确认 | 左手把册抬到胸上稳托，右指停在翻到一半的纸边，颈向前确认、眉眼骤抬、嘴轻分，是看到新证据而非后退贴胸。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/pei-zhigu/state-surprise.txt) |
| 入迷考据 | 双手将折叠拓本展开到胸下，左手托底、右手捏纸角，身体半侧前倾、前脚探出、视线沉入细纹，忘记看谈话者但非嬉笑。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/pei-zhigu/state-engrossed.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
