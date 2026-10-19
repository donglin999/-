# 乔行舟：六个完整对白状态

状态：现行　最后核对：2026-10-19

[目录](index.md) · [统一规格](../companion-performance.md) · [角色剧情](../companions/qiao-xingzhou.md)

当前定妆：27岁成年；圆润偏宽的软圆脸，苹果肌自然、短圆下巴；自然柔弯眉，眉毛密度适中；笑时弯起的月牙眼，眼尾圆、下眼睑柔和；柔和短鼻梁、圆润鼻尖；比其余角色宽的自然笑唇，左侧浅梨涡；明朗亲和，工作间隙看到熟人；原长辫与青发带；卷袖青绿短工衫、半围布、素皮工具套；舟舷侧坐回望、木刨与开阔河面。
身体：按用户身材参考，丰满而自然的成年胸腰曲线与修长腿部；肩臂只保留适度劳动力量，坐姿轻巧流畅，衣装干净、面容和整体画面美感优先。

每张为表情与全身姿态一起设计的透明人物层，切换整图。既有菜单背景立绘继续作为身份参考，不进入对白图。

| 状态 | 表情与身体语言 | 当前状态 | 提示词 |
| --- | --- | --- | --- |
| 先看你打算怎么做 | 两手自然收在自己腰侧偏后，一手扶原工具套外缘、另一手松垂，身体略侧回望；一脚稳、一脚轻松，肩放平、月牙眼自然柔和、嘴唇轻合。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qiao-xingzhou/state-neutral.txt) |
| 卷袖准备帮你 | 左手抓自己右袖口向上推，右前臂低位伸开、掌心向上，不是面向镜头招手；头微抬、肩放松、宽笑唇，前脚略向说话人。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qiao-xingzhou/state-happy.txt) |
| 把裂开的木料翻给自己看 | 左掌托一块巴掌大的裂木样片，右手拇指沿裂缝轻压却停住；上身低向木片、左肩沉，眉间忧起、嘴角轻落，双脚稍分开、重心前压，像检查失败试样而不是羞怯抓裙。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qiao-xingzhou/state-sad.txt) |
| 撑篙守住载重线 | 左右手在一根长篙上下两段实握，篙底着地在身体侧前；两脚分开、身体侧压形成稳固界线，眉头压低、目光直视、嘴紧合，不挥击。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qiao-xingzhou/state-angry.txt) |
| 下意识收住工具 | 左手握一柄小木刨靠腹前、刨底朝下，右手快速扣住左手腕，像听到变故先把锋口收向安全方向；肩向一侧转、身体微前，头抬向来人、眉扬、嘴微开，脚仍稳立，不按胸。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qiao-xingzhou/state-surprise.txt) |
| 干完活后痛快笑 | 右手叉腰、左手摸自己后脑侧，双肘展开，身体自然侧转、重心在一腿；头稍后、眼弯成笑、张嘴成年爽朗大笑，肩背松。 | internally_accepted | [完整提示词](../../../art_sources/companion_dialogue_states_20261004/prompts/qiao-xingzhou/state-laugh.txt) |

内部美术验收 6/6，单人对白预览通过 6/6；游戏逐句映射、多人站位及CG抑制仍待接入后验收。

质量：身份、阶段、结构、画风、情绪动作协调、对白预览显示分别验收；负面表情搭欢迎姿态即退回。原生PNG目标1024×1536，运行WebP512×768，真实alpha；双手双脚道具完整，不单独贴脸。

脚本用 `character / stage / dialogue_state / intent` 选整图；状态相同可连续多句沿用，不逐句随机换图。当前生成与内部检查不等于游戏逐句映射已完成。
