# 培养Q版：实际生成提示词与来源

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）

> 2026-10-05 公共规格以[统一生成与验收标准](../../design/cultivation-q-generation-standard.md)为准。本文保留历史生成记录或具体姿态设计；不能把历史候选状态当成当前全部角色完成。


日期：2026-10-03。制作工具为 Codex 内置 image_gen；工具未返回可验证的底层模型名称，不自行补写。本页保存基准与动作立绘的实际提示词，制作规则见[画风、情绪与动作规范](../../design/cultivation-q-portraits.md)。主要交付为带肢体动作的立绘；纯表情提示词保留在历史记录中。

## 参考输入与基准归档

用户提供的[参考截图](../../../art_sources/cultivation_q_20261003/references/user-style.png)指向2015年《侠客风云传》养成Q版人物。截图中的文字、水印、网页与角色不作为输出元素。先前2001旧版参考与第一张写实水墨缩比例试稿均未采用，不作为本组输入。

| 图 | 原始输入次序 | 已保存原稿 | 原生尺寸／背景 |
| --- | --- | --- | --- |
| 萧白 | 用户截图；萧白既有成年立绘 | [基准图](../../../art_sources/cultivation_q_20261003/base/hero.png) | 1145×1374；RGB浅米白底 |
| 叶蘅 | 用户截图；上行萧白Q版；叶蘅既有成年立绘 | [基准图](../../../art_sources/cultivation_q_20261003/base/ye.png) | 1145×1374；RGB浅米白底 |
| 苏芷 | 用户截图；上行萧白Q版；苏芷既有成年立绘 | [基准图](../../../art_sources/cultivation_q_20261003/base/suzhi.png) | 1145×1374；RGB浅米白底 |

原身份参考已冻结为[萧白](../../../art_sources/cultivation_q_20261003/references/identity-hero.webp)、[叶蘅](../../../art_sources/cultivation_q_20261003/references/identity-ye.webp)、[苏芷](../../../art_sources/cultivation_q_20261003/references/identity-suzhi.webp)，避免现行素材以后更新使记录含义变化。原始生成文件保留在Codex生成目录，同时复制进项目；完整映射见[素材清单](../../../art_sources/cultivation_q_20261003/manifest.json)。

## 萧白：实际原始提示词

```text
Use case: stylized-concept, character style transfer.
请创作一张《小江湖》主角“萧白”的Q版养成对话立绘试稿。用户要求的正确画风就在参考图1：2015年《侠客风云传》养成时期那一组Q版人物立绘。

参考分工和优先级：
参考图1（用户提供的搜索结果截图）是本次唯一的画风、五官简化、比例、描线和着色依据。尤其看其中多次出现的蓝衣马尾男主：第一排第三、第四、靠右的抱拳形象，以及第二排惊讶形象。这些人物有大头、小而偏瘦的上身、灵活的小手、较短脖子、清楚且有粗细变化的黑色轮廓线，夸张但自然的眉眼口型，手绘游戏立绘感。借用这一组的绘画语言，不复制蓝衣人物本身、不复制搜索结果网格、文字、水印和广告。不要使用2001旧版《武林群侠传》的画风。
参考图2（萧白现有成年水墨立绘）只提供角色识别特征和服饰颜色：黑色高马尾、赭红发带、额前散发、较有棱角的眉毛、米白交领衣袍、灰蓝内领、赭红腰带、灰色护腕及红色系带。图2的写实五官、水墨纸纹、纤细衣褶、长躯干不作为画风依据。

画面：
只有萧白一个人，画成与参考图1同类的“养成对话用Q版半身立绘”，从完整头顶和马尾到大腿上部，腰带、两只手完整在画内。三分之四侧身朝向观者，身体偏瘦且紧凑；一手自然扶在腰侧，另一手做轻松的谈话手势。神态聪明、好奇，微微笑，适合刚在山居开始学习的年轻主角，不是冷酷的俊男写真。
真正的Q版角色结构：头明显大于胸腔，面部略圆但下颌有简洁转折，五官像参考蓝衣主角那样漫画化；深色大眼睛有清楚的眼白与小亮点，眼形具有人物性格而非圆滚滚洋娃娃眼；眉毛、嘴角能表达态度。额前头发是少量锐利的大片发束，马尾体积适中，不能成为比头更大的蓬松团块。手小但手指动作清楚。
服装按萧白的米白、灰蓝、赭红配色简化，衣褶只保留少数手绘线和较大的明暗形。衣服是棉布武侠便装，不复制参考图1的蓝色短袖制服。
绘画方式严格贴近参考图1：干净有变化的深色勾线，清楚的手绘色块，轻微笔触和局部渐变辅助体积，精简的二维游戏插画阴影；中等鲜明度，有传统国产武侠养成游戏的活泼感。不要写实插画缩头身，不要水墨晕染或宣纸颗粒，不要粗笨的现代矢量吉祥物，不要3D玩偶、塑料高光、油画或像素点。
纯净浅米白背景，背景不透明，无景物、无边框、无标签、无文字、无水印，人物四周留适当空白。不要多角色、不要多表情拼图、不要搜索网页布局。
阶段要求：养成初期，无剑、无剑鞘、无武器、无背剑肩带、无门派徽记。人物清楚完整，不裁掉头发和手。
```

[独立文本](../../../art_sources/cultivation_q_20261003/prompts/hero-base.txt)

## 叶蘅：实际原始提示词

```text
Use case: stylized-concept / character style transfer.
Create ONE finished Q版 cultivation dialogue character portrait for the Chinese wuxia game 小江湖, matching the specific 2015 侠客风云传 cartoon cultivation portraits in reference image 1 and the latest Xiao Bai Q portrait in reference image 2.
Input roles:
Image 1 is the user-selected collection of Q版 character portraits. It is the dominant drawing-style reference: large expressive heads, compact somewhat slim upper bodies, small expressive hands, clean dark outlines with varied thickness, hand-drawn Chinese RPG cartoon facial shapes, attractive and lively expressions, simple painted color blocks with restrained shadow and light pencil-like texture. DO NOT reproduce the search grid, labels, logos, watermark or characters in it.
Image 2 is our latest Xiao Bai Q portrait. Match its series, rendering, line treatment, level of simplification, size of head relative to shoulders, and half-body framing. Do not copy his male face, ponytail, red sash, pose or clothes onto the female.
Image 3 is this woman's EXISTING adult identity, hair, clothing and medical-tool reference ONLY. Translate her own recognizable features into the chosen Q版 style. Do not inherit realistic anatomy, realistic face rendering, fine ink-watercolor folds or photographic skin from it.
Composition: ONE female character, complete head and hair safely inside the canvas, portrayed from head to upper thighs, waistband and both hands visible; three-quarter standing view toward the viewer, comfortable padding. Plain opaque light warm ivory background, no scenery. Same visual scale and visual finish as the Xiao Bai Q portrait. Maintain a clearly female ADULT personality translated to Q proportions; short neck, enlarged head and compact torso, not a child, toddler, glossy doll or a normal-proportion beauty portrait.
Illustration: clean black/deep brown contour lines, expressive brows and eyes, readable silhouettes, restrained hand-painted cel-like shading, simplified practical cloth folds. No watercolor bloom, no rice-paper grain, no 3D, no pixel art, no fantasy aura, no pin-up pose or excessive ornament. A single image only, not a collage, no writing, labels, border, logo, watermark, UI or extra people.
Subject: 叶蘅 Ye Heng, the 22-year-old village healer and initial heroine. Her own face is delicately shaped, with softer brows and clear warm attentive dark eyes, a small naturally friendly smile. She should look younger and lighter in build than Su Zhi, but capable and self-possessed. Preserve the reference's dark hair gathered into a practical high bun with a plain pale cloth tie, a few fine loose strands at the forehead; no male high ponytail, ornate hairpins, or long loose princess hair.
Keep her simple ivory and warm-grey wrap tunic, grey inner collar, charcoal-grey cloth waist wrap, sleeves gathered up, a plain brown diagonal medicine-bag strap. Keep the simple cylindrical needle roll at one side and the worn modest cloth medicine pouch at the other, at a small readable scale. No green sect uniform, rust-red male hero sash, sword, attack needles, luxury ornaments or new faction badges.
Pose: she has just tidied ordinary medical supplies. Both hands gently hold one small clean folded cloth bandage roll near the waist, looking toward a companion with a lightly reassuring smile. Draw coherent hands; the bandage is plain medical cloth, not glowing or a mystical object. Show her tidy, brisk and kindly but alert character. The medical gear remains hers.
Simplify her clothing and gear to the same clear cartoon shapes as the selected Q版 series, rather than retaining realistic fabric scratches.
```

[独立文本](../../../art_sources/cultivation_q_20261003/prompts/ye-base.txt)

## 苏芷：实际原始提示词

```text
Use case: stylized-concept / character style transfer.
Create ONE finished Q版 cultivation dialogue character portrait for the Chinese wuxia game 小江湖, matching the specific 2015 侠客风云传 cartoon cultivation portraits in reference image 1 and the latest Xiao Bai Q portrait in reference image 2.
Input roles:
Image 1 is the user-selected collection of Q版 character portraits. It is the dominant drawing-style reference: large expressive heads, compact somewhat slim upper bodies, small expressive hands, clean dark outlines with varied thickness, hand-drawn Chinese RPG cartoon facial shapes, attractive and lively expressions, simple painted color blocks with restrained shadow and light pencil-like texture. DO NOT reproduce the search grid, labels, logos, watermark or characters in it.
Image 2 is our latest Xiao Bai Q portrait. Match its series, rendering, line treatment, level of simplification, size of head relative to shoulders, and half-body framing. Do not copy his male face, ponytail, red sash, pose or clothes onto the female.
Image 3 is this woman's EXISTING adult identity, hair, clothing and medical-tool reference ONLY. Translate her own recognizable features into the chosen Q版 style. Do not inherit realistic anatomy, realistic face rendering, fine ink-watercolor folds or photographic skin from it.
Composition: ONE female character, complete head and hair safely inside the canvas, portrayed from head to upper thighs, waistband and both hands visible; three-quarter standing view toward the viewer, comfortable padding. Plain opaque light warm ivory background, no scenery. Same visual scale and visual finish as the Xiao Bai Q portrait. Maintain a clearly female ADULT personality translated to Q proportions; short neck, enlarged head and compact torso, not a child, toddler, glossy doll or a normal-proportion beauty portrait.
Illustration: clean black/deep brown contour lines, expressive brows and eyes, readable silhouettes, restrained hand-painted cel-like shading, simplified practical cloth folds. No watercolor bloom, no rice-paper grain, no 3D, no pixel art, no fantasy aura, no pin-up pose or excessive ornament. A single image only, not a collage, no writing, labels, border, logo, watermark, UI or extra people.
Subject: 苏芷 Su Zhi, the mature travelling female physician trained at 白鹇谷. Translate her OWN reference face: slightly longer facial structure, composed brows, calmly observant dark eyes, a tiny reserved smile. She is more mature and assured than Ye Heng, with a slightly fuller frame and quieter posture; do not make the two women the same face and do not make her an elderly woman.
Preserve the elegant dark high bun, the reference's small muted jade-green hairpin and restrained green hanging accent; keep hair compact and neat. Preserve the pale ivory outer robe with a few very subtle muted plant motifs, sage-green inner layers, dark teal-green waist wrap, and small practical medicine pouch. Her green/ivory physician costume is recognizable and distinct from Ye Heng's plain ivory/grey village clothing.
Pose: calm and upright, one hand supports a CLOSED plain needle roll near her waist, the other gently rests over it, attentive as if listening to a patient's description. Both hands and the medical tools are readable. This is a friendly quiet cultivation dialogue portrait, not a treatment demonstration or combat stance.
Use simple broad shapes for the robe and sage inner garment, a few controlled green plant marks only, no dense embroidery, luxurious jewelry, exposed costume, sword, sect authority crown or mystical bird imagery. Her competence should come through her clear gaze and steady posture.
```

[独立文本](../../../art_sources/cultivation_q_20261003/prompts/suzhi-base.txt)

## 辅助表情生成：历史锁定提示词

以下是前一轮纯表情差分的实际提示词，保留用于追溯；用户进一步要求肢体动作，因此它不作为主要动作包提示词。已生成图见[辅助清单](../../../art_sources/cultivation_q_20261003/expression-manifest.json)，其余纯表情计划停止。主要动作生成使用下节新主体。

```text
Use case: identity-preserve / expression-only edit of an adopted Q版 cultivation dialogue portrait.
The ONE input image is the canonical Q版 baseline of this exact character. This is NOT a redesign or a new costume. Keep the same face identity, facial contour, hairline and hairstyle, apparent adult age expressed in Q版 proportions, skin tone, costume colors, sleeves, waist wrap, medical tools if present, body proportions, shoulders, arm and hand positions, fingers, props, viewing angle, light, linework, painted shading, and background. Keep the exact original vertical canvas 1145×1374, the same character placement, head top, eyes level and waist level, the same scale, crop and padding. Do not pan, zoom, shift, rotate the head or change the silhouette. Only eyebrows, eyelids, gaze, cheeks and mouth may change to express the requested emotion.
Match the selected 2015 侠客风云传 cultivation Q版 portrait language already present in the input: large expressive head, small compact upper body, clean varied dark outlines, readable hand-painted color shapes, restrained cartoon shading. Do not return to realistic ink portrait proportions and do not switch to old 2001 武林群侠传 drawing language.
Keep the existing opaque pale ivory background and its original color, not transparent. Exactly one character per image, no labels, writing, emotion symbols, floating punctuation, watermark, border, extra people or collage. No new weapon, accessory, costume, permanent wound, blood, tears or new story fact. The body and hand pose remains the baseline even if the emotion would normally invite a new action.

```

| 情绪键 | 实际追加语句 |
| --- | --- |
| neutral | NEUTRAL / attentive: relaxed eyebrows and natural open eyes, gently closed neutral lips, quietly listening. Remove the baseline's talking grin if present. Not blank, angry, sad or sleepy. |
| smile | SMILE / sincere happiness: soften the brows, gently lift the mouth corners into a clearly warmer smile, lightly smiling eyes. A natural open smile is fine. Su Zhi's smile remains restrained and mature, but visibly warmer than her neutral baseline. No exaggerated blush or baby face. |
| worry | WORRY / concern: the inner brows lift and knit slightly, eyes focus with concern, lips close with a slight tense downturned corner. Readable concern, not anger, despair, tears or comical panic. |
| firm | FIRM / determined refusal: lower and set the eyebrows, focused narrowed eyes, closed firm mouth. Decisive and protective with controlled indignation; not a villainous sneer, rage, bared teeth or magically threatening aura. |
| surprise | SURPRISE / recognizing an unexpected fact: visibly raised eyebrows, eyes widen while maintaining their own shape, small open O-shaped mouth. Clear intelligent cartoon surprise. Keep jaw and skull shape unchanged; no huge mouth, floating punctuation, sweat beads or scream. |
| hurt | HURT / enduring pain or physical strain: lightly knit brow, one eyelid narrows in a small wince, lips tighten, eyes show strain but the character remains conscious and composed. No new injury mark, blood, scar, tears or changes to posture, clothing or medical tools. This expression does not assert a permanent injury. |
| puzzled | PUZZLED / thinking through a lesson: subtly asymmetric eyebrows, gaze slightly to the side without turning the head, a small closed questioning mouth. Thoughtful uncertainty, not fear or anger. Keep both hands in their original position; do not add a finger-to-chin pose or question-mark symbol. |
| tired | TIRED / after ordinary training: slightly drooping eyelids, relaxed low eyebrows, a small closed or slightly parted tired mouth. Mild exhausted but awake look. No new bruises, dark eye makeup, extreme eye bags, sweat effects, slumped torso or sleep pose. |

本轮每次调用明确设置 transparent_background=false，保留原稿浅米白底。表情是否完成、实际尺寸、输出来源与检查状态以素材清单为准，提示词存在不表示图已经生成。覆盖据点场景所需的透明运行版本另列交付，不用背景阈值自动抠掉米白衣料。

## 动作立绘：实际执行主体（2026-10-03调整）

输入1为本人Q版基准，输入2为用户提供的2015年《侠客风云传》动作画风截图。它允许手、头肩、重心、衣褶和发束随动作改变，身份和服饰设计保持一致。主体与每张身份／动作语句组成完整提示词，分别保存在prompts目录。

```text
Use case: identity-preserving Q版 character REPOSE with expressive acting.
Image 1 is the canonical adopted Q版 portrait of THIS character. Preserve the same recognizable face identity, hairline and hairstyle, Q版 age and body type, costume design, clothing colors and owned medical tools. It is an identity and rendering reference, NOT a pose to keep.
Image 2 is the user's exact 2015 侠客风云传 cultivation Q版 portrait collection. Study its expressive body language: different arms, hands, head tilts, shoulder positions and weight shifts work together with each facial emotion. Do not copy its characters, clothing, text, grid, logos or watermark.
CRITICAL REQUEST: create a CLEARLY DIFFERENT PHYSICAL POSE, with expressive facial emotion AND arms/torso/head acting. A face-only edit with the original hand pose is WRONG. Freely redraw the arms, hands, shoulders, torso inclination, hair sway and cloth folds to perform the specified action, while keeping identity and costume design consistent. Keep actual anatomical contact of hand and body/prop understandable.
Style: same adopted Q版 series, big expressive head, compact upper body, clean varied dark contour lines, restrained hand-painted cartoon shading, crisp readable character silhouette. Not a normal-proportion realistic portrait, 3D toy, glossy mascot, pixel art or watery ink illustration.
Canvas target: 1145×1374 portrait. One single character, usually framed from full head/hair to upper thighs; for a bending pose, include the knees and hands as needed. Keep the face readable at approximately the baseline scale; give gesture enough room, never crop a hand or hair. Natural head movement and action silhouette are EXPECTED, do not freeze all coordinates or reuse the baseline stance. Plain opaque warm ivory background. No background scene, floating emotion symbols, written words, UI, labels, collage, border, watermark or extra characters. No new weapon, magic, accessory, permanent wound, blood or new plot fact.

```

| 角色／动作 | 实际动作追加语句 | 完整提示词 |
| --- | --- | --- |
| 萧白／listen | Both arms lowered and relaxed in front of his waist, fingers loosely together, shoulders square but easy, head slightly tilted toward the unseen teacher, mouth closed and eyes attentive. Do NOT repeat his baseline one-hand-on-waist / one-hand-open talking pose. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_listen_v1.txt) |
| 萧白／salute | He gives a friendly Chinese martial greeting: his LEFT OPEN PALM cups his RIGHT CLOSED FIST at upper chest height. Both elbows bent and held clear of the torso, shoulders lightly forward, a small pleased smile and relaxed bright eyes, a slight courteous head dip. Two coherent hands, a palm and a fist, not two fists or fused fingers. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_salute_v1.txt) |
| 萧白／scratch_head | His right arm lifts, right hand scratches the BACK/SIDE of his head just below the ponytail tie. Left arm bends with left hand resting loosely at his hip. Torso slightly leans to the opposite side, one eyebrow raised and mouth small and uncertain, looking thoughtfully toward the teacher. The raised elbow, hand/head contact and asymmetry must be immediately readable. Do not change his ponytail or add question marks. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_scratch_head_v1.txt) |
| 萧白／startled | Torso and head recoil slightly backward, shoulders lift, BOTH forearms lift near chest/shoulder height with open palms and spread natural fingers. Eyes widen and mouth opens briefly in surprise. The lean back and raised arms clearly differ from standing talk. Keep a grounded human pose, not a falling body, huge scream mouth or symbol effects. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_startled_v1.txt) |
| 萧白／stop | One arm firmly extends diagonally toward the unseen speaker, open palm facing outward in a clear STOP gesture; the other hand remains close to the torso, slightly closed and ready. Body leans slightly forward, eyebrows set and mouth closed, protective and determined. Readable foreshortening without an oversized hand obscuring his face. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_stop_v1.txt) |
| 萧白／concern | He leans his upper body forward to check on a companion. One hand rests lightly over his chest while the other reaches LOW and forward with palm up in a concerned questioning gesture; eyebrows knit and lips part a little. The shoulders, spine and lowered reaching arm show active concern; do not use the baseline raised talking hand. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_concern_v1.txt) |
| 萧白／hold_arm | His left hand gently grips/supports the opposite upper arm, that right arm rests bent near his abdomen. Shoulders draw inward, torso slightly turns away, eyes narrow in a small wince and lips tighten. A clearly protective curled-in pose, not the original open gesture. No visible wound, bruise, blood or damaged clothes. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_hold_arm_v1.txt) |
| 萧白／catch_breath | After ordinary practice he BENDS FORWARD at the hips, BOTH HANDS resting clearly on the corresponding knees, elbows slightly bent outward, shoulders lowered. Head tips up enough to see his tired eyes and small parted mouth catching breath. Show full head/hair, torso, both hands and knees inside the portrait, adjust lower framing for this pose. Keep Q proportions and the face large/readable, do not shrink to a tiny full-body figure. No sweat symbols, wounds, stool or extra props. | [文本](../../../art_sources/cultivation_q_20261003/prompts/hero_pose_catch_breath_v1.txt) |
| 叶蘅／inspect | She looks slightly downward with focused calm eyes, one hand supports her own soft medicine pouch at waist height and the other opens/looks into its top to check the ordinary supplies. The bandage can stay tucked inside the pouch. A different practical working gesture from both hands holding a cloth roll. Existing bag and strap move coherently with the action. | [文本](../../../art_sources/cultivation_q_20261003/prompts/ye_pose_inspect_v1.txt) |
| 叶蘅／help | She leans forward with worried attentive eyes, one hand extends a clean folded bandage toward an unseen person needing help, the other hand steadies her existing medicine pouch near her waist. The torso inclination and reaching hand must be clear; no extra patient in the frame. She remains capable, not panicked. | [文本](../../../art_sources/cultivation_q_20261003/prompts/ye_pose_help_v1.txt) |
| 叶蘅／protect | She draws her own soft cloth medicine pouch close against her chest/upper abdomen, one arm cradles it and the other hand firmly guards its opening. Shoulders turn slightly away from the unseen person, eyebrows set and mouth firm. Show coherent bag, strap and needle-roll positions. Protecting HER existing pouch, not a new wooden relic chest or new plot item. | [文本](../../../art_sources/cultivation_q_20261003/prompts/ye_pose_protect_v1.txt) |
| 叶蘅／notice | She pauses mid-task: one forearm lifts with hand lightly opened near her cheek, the other hand holds her ordinary folded cloth close to her waist; head and shoulders tilt back slightly. Lifted eyebrows, widened eyes and small open mouth express discovering something unexpected. A clear asymmetrical paused pose, not the baseline cloth-working stance. | [文本](../../../art_sources/cultivation_q_20261003/prompts/ye_pose_notice_v1.txt) |
| 叶蘅／strain | One hand supports her opposite forearm near the elbow, the other arm rests close against her abdomen, shoulders slightly tucked in. Her face shows a controlled small wince, still composed. Keep her medical pouch and needle roll in the same logical worn locations. No new wound, blood, tears, injury costume or attack needles. | [文本](../../../art_sources/cultivation_q_20261003/prompts/ye_pose_strain_v1.txt) |
| 苏芷／reassure | Her left forearm supports the closed needle roll near her waist; her right hand opens gently outward toward the unseen companion in a calm reassuring gesture. Head dips slightly, eyes soften and she gives a clearly warmer reserved smile. Mature, steady and approachable; not the baseline two-hands-on-roll posture. | [文本](../../../art_sources/cultivation_q_20261003/prompts/suzhi_pose_reassure_v1.txt) |
| 苏芷／concern | She leans forward slightly with knitted attentive brows and a small focused frown. One hand holds her closed needle roll at her side while the other hand raises to chest level with relaxed fingers as if asking the unseen patient to pause and describe the problem. Readable upper-body motion and different arm placement, no extra person or clinical demonstration. | [文本](../../../art_sources/cultivation_q_20261003/prompts/suzhi_pose_concern_v1.txt) |
| 苏芷／stop | One arm raises a composed outward-facing palm to stop an unsafe action; the other arm secures the CLOSED needle roll against her waist. Torso turns slightly toward the unseen person, eyebrows firm and lips closed. Controlled professional authority, not a threatening fighter or angry villain; no needle attack. | [文本](../../../art_sources/cultivation_q_20261003/prompts/suzhi_pose_stop_v1.txt) |
| 苏芷／startled | She pulls the closed needle roll gently closer to her chest with one hand while the free hand lifts near her shoulder, torso leans back a little, eyebrows raise and lips part. Restrained but visibly distinct mature surprise; not identical to baseline listening, no giant scream, flying tools or symbols. | [文本](../../../art_sources/cultivation_q_20261003/prompts/suzhi_pose_startled_v1.txt) |
| 苏芷／strain | She supports her side/upper abdomen with one hand, the other arm keeps the closed needle roll safely close to her body; shoulders lower and torso inclines slightly to the side. A restrained small wince and tightened lips show physical strain while remaining steady. No new wounds, blood, scars, torn robe or new plot facts. | [文本](../../../art_sources/cultivation_q_20261003/prompts/suzhi_pose_strain_v1.txt) |

叶蘅tidy与苏芷listen复用原稿，不声称再次调用生成工具。每张实际生成时仍使用内置image_gen并保留浅米白底；输出来源、实际尺寸与检查结果记录在主要素材清单。纯表情主体里的固定手势要求只用于辅助差分，不得混入动作提示词。

## 本轮结果

动作包已保存20张候选：萧白8、叶蘅6、苏芷6，其中18张新生成、2张复用女主基准。实际来源、输入、尺寸、SHA-256和基础视觉检查记录见[主要素材清单](../../../art_sources/cultivation_q_20261003/manifest.json)。整组浏览见[动作预览页](../../../art_sources/cultivation_q_20261003/preview.html)。这些是浅米白底原稿，V1时7张用于画框，现已派生透明V2；13张备用；逐项状态以[运行台账](../../../assets/cultivation/manifest.json)为准。本页记录V1原稿提示词；V2透明编辑、彩绘底栏、动作/心情序列的准确提示词另归档在 `art_sources/cultivation_v2_20261003/prompts/`，当前运行状态见[素材规范](../../design/cultivation-assets.md)。
