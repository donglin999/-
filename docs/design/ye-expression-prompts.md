# 叶蘅表情差分：提示词与使用

状态：襄阳体验章节已接入。基准图为[叶蘅初始立绘](xiangyang-art-prompts.md)，只对**初始朴素装**制作表情；三年后的两套服饰须另用该路线定稿图重新生成差分。七张运行图均为 306×640 透明 WebP，源 PNG 存于本机 raw_scene/xiangyang_source/ye_expr_*.png，打包函数为 tools_scene/build_xiangyang_chapter_assets.py 中的 ye_expressions()。

## 锁脸规则

- 每张都编辑同一张已采用的 assets/p_ye.webp，绝不从上一张表情继续编辑。保持 22 岁成年人的脸型、发际线、束发、米白灰短衣、针筒、药囊和基本镜头；只改表情与极小的头部角度。
- 七张源图同为 867×1815。处理时固定缩成 306×640，不单独重新裁脸；对白从一张切到另一张时不跳位。
- 透明边缘先剔除低 alpha 杂色，再缩一像素；最终在深色背景上并排审查同脸、衣装、头顶与下摆轮廓。预览联系图在本机 review/ye_expr_contact.jpg。
- 运行时对白写 c_ye:表情名；若某图尚未载入，自动回落 p_ye.webp。战斗常态选 battle，气血低于 30% 选 hurt。

## smile（病人转安）

~~~text
Edit the supplied Ye Heng game dialogue portrait into her SMILE expression variant. This is an identity-sensitive edit of the SAME 22-year-old adult woman. Preserve exactly her facial structure, hairline and tied dark hair, off-white and gray travel-healer robe, medicine bag, needle case, folded bandage, body proportions, hand pose, viewing angle, upper-left light, muted gongbi ink and mineral-watercolor rendering, and the same centered vertical crop. Change ONLY her expression: a small sincere relieved smile after Old Zhou's breathing steadies, slightly softened eyes and relaxed brow, with closed lips. Keep it subtle and in character, not a broad grin. Single figure on a clean fully transparent background, crisp edge, no painted backdrop or shadow. Premium polished 2D Chinese wuxia RPG portrait. No text, logo, watermark, extra people, photorealism, anime exaggeration, changed clothes or changed face.
~~~

## shy／worry／surprise 共用身份提示词

将下列完整身份提示词与表中的**对应补充句**连接为一条提示词，分别编辑基准图，不把多个表情放在一张图上：

~~~text
Identity-sensitive edit of the supplied Ye Heng portrait. SAME 22-year-old adult woman, exact same face and facial proportions, tied dark hair with plain cloth ribbon, off-white and gray Southern Song rural-healer clothes, narrow sleeves, needle case, medicine bag, folded bandage in hands, same body and hand position, same camera angle, centered vertical framing, crisp gongbi ink linework and restrained mineral watercolor, soft upper-left light. Change ONLY the facial expression and tiny natural head nuance. Clean fully transparent background and clean silhouette; no backdrop, text, logo, watermark, extra people, photorealism, anime exaggeration, new accessories, new clothes or changed hairstyle. Premium polished 2D Chinese wuxia RPG dialogue portrait.
~~~

| 文件后缀 | 原始补充句 | 襄阳使用位置 |
| --- | --- | --- |
| shy | SHY: Su Zhi has praised her diagnostic skill and offered to pass along her medical case. A restrained bashful smile, slightly lowered eyes, a trace of warmth at her cheeks, but adult composure and independent spirit; no exaggerated blush or childish embarrassment. | 苏芷提出转交医案后，叶蘅保留选择 |
| worry | WORRY: Old Zhou's poisoned breathing is unstable. Brows gently knit, eyes focused with concern and concentration, closed mouth, ready to act rather than panic or cry. | 街心初见、病情未稳、战败后关照 |
| surprise | SURPRISE: She notices a revealing detail in the evidence, such as the antidote vial. Slightly widened eyes and lifted brows, lips part a little in recognition; restrained, intelligent surprise, not a comic shock. | 首次发现茶渍等异常线索 |

## angry／battle／hurt 共用身份提示词

~~~text
Identity-sensitive edit of the supplied Ye Heng dialogue portrait. SAME 22-year-old adult woman; preserve exact facial structure and adult proportions, tied dark hair and cloth ribbon, plain off-white and gray rural-healer travel robe, narrow sleeves, needle case and medicine bag, centered vertical crop, upper-left soft light, fine gongbi ink contours and restrained mineral watercolor. The variant should be instantly recognizable as the same woman and garment. Clean fully transparent background with crisp alpha edges. Premium polished 2D Chinese wuxia RPG art. No text, watermark, backdrop, photorealism, anime exaggeration, new hairstyle, new armor or extra people.
~~~

| 文件后缀 | 原始补充句 | 襄阳使用位置 |
| --- | --- | --- |
| angry | ANGRY expression: she has heard a gang member threaten a sick porter. Brows lower, eyes sharpen, mouth firm with controlled indignation. She is brave and protective, not snarling or cruel. Maintain same body pose and folded bandage. | 疤脸刘勒索、过度拿走药费 |
| battle | BATTLE expression: focused, decisive readiness in front of danger; eyes lock toward an unseen opponent's pressure point, brows set, lips firmly closed. She may raise one hand slightly with a slender medical acupuncture needle poised between fingers, but preserve same clothing, body identity and medical tool kit. No sword, poison, magic effects or assassin styling. | 茶棚与黑风寨对峙、战斗常态头像 |
| hurt | HURT expression for low health in battle: she has taken a hit but remains conscious and determined. Slight wince, knit brow, tired eyes, controlled breath, a little strain in shoulders. No gore, open wound, tears, defeat pose or changed outfit. Preserve same camera framing. | 山寨战败台词、低血量战斗头像 |

七图采用 Codex 内置 image_gen，以基准图为单张身份参考并要求透明背景。生成的手指、针、额发与背景边缘需逐张检查；如出现换脸、换衣或儿童比例，退稿并仍从**基准图**重生。
