# 襄阳体验章节：生图提示词与验收

状态：本轮内置图像生成的制作记录。剧情用途见[章节脚本](xiangyang-chapter.md)，资产盘点见[襄阳素材](xiangyang-art.md)。提示词可直接复用；同脸参考和后处理步骤也必须执行。

## 统一风格与参数

- 工具：Codex 内置 image_gen。叶蘅是 22 岁成年人，清秀、偏瘦、朴素干爽，比苏芷更稚嫩。
- 立绘：国画白描、淡彩矿物色，成人骨相和手部准确，布纹清晰，左上柔光；单人居中，不出现文字、水印、现代物件、幼态比例或 3D 光泽。
- 探索精灵：南宋武侠像素 RPG，三分之四俯视。透明 4×4 图，行序为正面、左、右、背面；每行四帧步行，全身在格内且每格同尺度。无地板、格线、标签或多余人物。
- 证物：透明 2×2 图，不含可辨文字。运行时图标槽为 96×96，图形约 29×29 逻辑像素。
- 本机源图：raw_scene/xiangyang_source/，不入 Git。运行时图：assets/。重生同名源图后运行 python3 tools_scene/build_xiangyang_chapter_assets.py；新构图须先检查裁切与色键。

## 叶蘅身份与形象

初始概念提示词原文还存在本机 review/yeheng_compare/prompts.json；使用[叶蘅形象稿](ye-appearance.md)核对脸、年龄和服装。本章接入朴素初始形象与[七张表情差分](ye-expression-prompts.md)。同行针术与白鹇谷医师路线的对照稿尚未接入换装。生成新图时，用已审定的叶蘅初始概念作第一身份参考；assets/p_hero.webp 与 assets/p_suzhi.webp 仅用于画风与版式，不能把苏芷改色当叶蘅。

### 叶蘅概念

~~~text
Premium Chinese wuxia RPG portrait of Ye Heng, a 22-year-old adult rural healer in a Southern Song inspired world. Clear delicate features, slightly younger and slimmer than Su Zhi, calm observant eyes, understated resolve, dark hair simply tied back. Clean plain off-white and pale gray cotton-linen short jacket, narrow rolled sleeves, cloth belt, practical shoes, modest needle roll and herb pouch. She rolls a clean bandage into her pouch. Masterwork Chinese gongbi ink linework, restrained watercolor and mineral pigments, accurate adult anatomy and expressive hands, nuanced cloth weave, crisp precise edges, exceptionally high fidelity. Centered three-quarter or full figure on uncluttered warm-white background, soft directional light. No text, watermark, childlike proportions, exaggerated eyes, glossy 3D, heavy anime shading, seductive pose, weapon or other people.
~~~

### 叶蘅立绘：ye_portrait_magenta.png → p_ye.webp

~~~text
Create a premium wuxia RPG dialogue portrait of the SAME adult Ye Heng in the supplied identity reference. Preserve facial structure, dark tied hair, slim adult build and calm alert expression. Southern Song Xiangyang, year-one summer. Plain off-white and pale gray cotton-linen short travel jacket with narrow sleeves, cloth belt, modest needle roll and herb pouch. Three-quarter turn, one hand holding a folded clean bandage, attentive to a patient just outside frame. Refined gongbi ink contours, restrained watercolor matching supplied game portraits, highly detailed face, hands and cloth, crisp silhouette, soft upper-left light. One character only, waist-to-thigh portrait, fully inside canvas. Entire background perfectly uniform solid #FF00FF magenta, no shadow or gradient, for chroma key. No text, watermark, other people, weapon, ornate jewelry, childlike proportions or 3D look.
~~~


### 叶蘅最终风格统一修订

初版虽然有同一张脸，实际偏照片质感；与苏芷游戏立绘并排后退稿。最终版以初版叶蘅为身份参考、以 p_suzhi.webp 仅作**渲染风格**参考进行编辑，随后再次品红抠图。采用的追加提示词：

~~~text
Edit the FIRST reference into a premium illustrated 2D Chinese wuxia RPG dialogue portrait. The FIRST image is the character identity, Ye Heng: preserve her exact adult face structure, dark tied hair, slim build, plain off-white gray cotton-linen clothing, narrow sleeves, bandage in her hands and simple medicine bag. The SECOND image is ONLY the rendering style reference: match its fine gongbi ink line contours, stylized but realistic adult facial proportions, hand-painted muted mineral watercolor, flat paper-like cloth shading, restrained contrast and soft upper-left light. Make Ye Heng visibly a little younger and slimmer than Su Zhi but still a 22-year-old adult. Remove photographic skin texture, camera realism, pore detail, photo lighting and high-frequency noise; do not copy Su Zhi's face, hair accessories or green robes. One centered figure, same vertical waist-to-thigh framing. The entire background must be completely uniform pure solid #FF00FF magenta with no glow, cast shadow, speckles, gradients or stray paint, for clean chroma key. Crisp clean silhouette with solid edge colors. No text, watermark, extra people, modern elements, exaggerated anime eyes or 3D rendering.
~~~

最终源图覆盖本机 raw_scene/xiangyang_source/ye_portrait_magenta.png。打包脚本在色键之后额外消除品红抗锯齿边缘；终图须在深色底上检查，不能只看透明预览。

### 叶蘅精灵：ye_sheet.png → s_ye.webp

~~~text
Production-ready transparent 4 by 4 walking sprite sheet of the SAME adult Ye Heng from the identity reference. Southern Song Chinese wuxia pixel RPG, 3/4 top-down, clean deliberate pixel clusters matching supplied sprite. Slim silhouette, dark hair tied back, plain off-white and light gray short cotton-linen jacket, narrow wrapped sleeves, small needle roll and herb pouch, practical shoes. Exact row order: front, left, right, back; four coherent walk frames in each row. Equal cells, centered complete body in every cell, stable scale and clothing across all sixteen frames, visible feet, upper-left daylight. No ground, grid, writing, other people, duplicated limbs or cropped feet.
~~~

## 其他人物

### 老周：zhou_portrait.png → p_zhou.webp

~~~text
Premium Southern Song wuxia RPG dialogue portrait of Old Zhou, an adult Xiangyang dock porter in his late forties. Weathered kind face, sturdy shoulders bent by years carrying loads, sun-browned skin, coarse gray-brown cotton tunic and work belt, folded carrying cloth over one shoulder. Ill and exhausted after sudden poisoning, still an ordinary worker. Refined Chinese gongbi ink outlines and restrained watercolor matching supplied Xiao Bai and Su Zhi game portraits; accurate adult hands and anatomy, controlled cloth texture, crisp professional finish. Isolated centered half body, transparent background, soft upper-left light. No writing, watermark, modern objects, magic glow or other people.
~~~

### 老周倒地：zhou_fallen.png → s_zhou.webp

~~~text
One isolated top-down 3/4 pixel-art sprite of the SAME Old Zhou, collapsed on his side on a Xiangyang street, coarse gray-brown porter clothes, one hand near chest, visibly breathing but unable to stand. Readable at small game scale, complete silhouette, dark outline, restrained Southern Song wuxia RPG palette, transparent background. No street floor, blood pool, writing, other people or grid.
~~~

倒地姿态不是行走动画；打包脚本将其重复到方向格，避免昏迷者迈步。

### 疤脸刘：liu_portrait.png → p_liu.webp

~~~text
Premium Chinese gongbi ink-and-watercolor dialogue portrait of Scarface Liu, adult Xiangyang Iron Arm Gang debt collector in his late thirties. Rough face with ONE clearly visible old scar across one cheek, narrow suspicious eyes, cropped tied-back dark hair, stocky muscular torso, weathered dark brown short jacket, iron forearm guard, practical cloth belt. Believable local extortionist, not fantasy demon. Match supplied game portrait style: exceptionally refined linework, controlled mineral pigments, accurate adult hands, crisp detailed finish, soft upper-left light. Centered isolated half-to-three-quarter figure, transparent background. No writing, watermark, magic aura, blood, extra people or modern detail.
~~~

### 疤脸刘精灵：liu_sheet.png → s_liu.webp

~~~text
Transparent 4 by 4 walking sprite sheet of the SAME adult Scarface Liu. Chinese Southern Song wuxia pixel RPG, 3/4 top-down, matching supplied exploration sprite. Stocky silhouette, one cheek scar, dark brown short jacket, iron forearm guard, cloth belt and boots. Exact row order front, left, right, back; four coherent small walk frames per row. Equal cells and stable scale, full body centered, upper-left daylight, disciplined pixel clusters. No ground, text, grid, extra figures, duplicated limbs or cropped feet.
~~~

### 浪里鳅：langli_portrait_magenta.png → p_langli.webp

~~~text
Premium Chinese gongbi ink-and-watercolor dialogue portrait of Langli Qiu, adult Xiangyang river raider in his forties. Lean river-hardened face, sun-darkened skin, messy tied dark hair, tired wary eyes, water-stained indigo short jacket and rope belt, weathered hands. Drunk and evasive yet believable as a human boat thug. Accurate anatomy, crisp ink contour, restrained mineral watercolor, detailed fabric, upper-left light, matching supplied game portraits. One centered waist-to-thigh figure fully inside canvas. Entire background perfectly uniform solid #FF00FF magenta without shadow or gradient for chroma key. No text, watermark, fantasy glow, extra people or modern objects.
~~~

### 浪里鳅精灵：langli_sheet.png → s_langli.webp

~~~text
Transparent 4 by 4 pixel-art walking sheet of the SAME adult river raider Langli Qiu. Southern Song Chinese wuxia RPG, 3/4 top-down. Lean river-worker silhouette, indigo short jacket darkened by water, rope belt, worn boots, rough dark tied hair, no fancy armor. Exact four rows front, left, right, back; four coherent walk frames each. Match supplied game's pixel density, compact clean clusters, full body centered and same size in every cell, upper-left light. No background, water tile, grid, labels, extra characters or clipped limbs.
~~~

## 案件证物：evidence_sheet.png → i_icons.webp 第四行

~~~text
One transparent 2 by 2 icon sheet for a Southern Song Xiangyang investigation, clean high-readability pixel art with restrained earth colors and clear outlines. Top left: small rough clay tea bowl with tea stain on rim. Top right: thumb-sized sealed pale-blue ceramic antidote vial. Bottom left: worn stitched debt ledger with blank cover and visible page edges, NO legible writing. Bottom right: two narrow wooden river-cargo tags bound with hemp cord, blank surfaces, NO writing. Each object centered separately with transparent margin, consistent 3/4 top-down angle and upper-left daylight. No hands, glow, gems, labels, grid lines or extra objects.
~~~

运行时键依次为 tea_bowl、jieyao、ledger、ferry_tag。货签只证明东津渡与黑风寨的收货关系，不画制毒者姓名。


## 街心救治事件画：zhou_rescue_cg.png → cg_zhou_rescue.webp

本图用于第一次接触倒地老周后、玩家做救治选择前的全屏事件画。参考按顺序为已采用的叶蘅、苏芷、老周立绘；三人的脸与服装锁身份，不照搬立绘姿势。源图为宽幅，打包到不超过 1280×720；场景中可按“继续”或 Enter／空格／Esc 返回对白。提示词：

~~~text
Create a wide 16:9 illustrated story-event still for a premium Chinese wuxia RPG. First reference is Ye Heng identity: same 22-year-old slim adult woman in plain off-white gray short healer travel clothes, tied dark hair and simple needle pouch. Second reference is Su Zhi identity: same experienced adult physician with pale robe and muted sage green layers, controlled calm manner. Third reference is Old Zhou identity: same middle-aged dock porter in coarse brown clothing. All three must be recognizable and distinct. Scene: daytime Southern Song Xiangyang stone-paved market street near a small tea stall; Old Zhou has suddenly collapsed on his side beside a shoulder carrying pole and bundles, breathing weakly. Su Zhi kneels beside him placing three acupuncture needles with exact careful hands; Ye Heng kneels on his other side supporting his shoulder and checking his pulse, observant and concerned. A clear empty ring around them gives space to treat him, a few ordinary townspeople remain back; roof tiles and warm wooden shopfronts softly establish location. Dramatic human urgency without gore or supernatural glow. Elegant fine gongbi ink contour and restrained mineral watercolor, same 2D illustrated rendering language as the reference game portraits, accurate adult anatomy and expressive hands, extremely polished professional visual novel CG, high detail, coherent clothing and faces, warm upper-left summer daylight. Landscape composition with central treatment group, no text, labels, watermark, border, modern things, huge crowds, childlike bodies, extra fingers or duplicated needles.
~~~

验收：画中叶蘅在左扶肩、苏芷在右施针、老周侧卧在货担旁；与脚本动作一致，围观人群留出救治空地。运行时图片不含字，标题由 HTML 覆盖，方便修改和本地化。

## 验收记录

| 项目 | 结果与复用条件 |
| --- | --- |
| 画面 | 四张立绘、四张精灵、四枚证物图标和一张街心救治事件画已接入；叶蘅/浪里鳅品红底由脚本抠图。重生时须查头发、袖口边缘残色。 |
| 身份 | 叶蘅立绘和精灵沿用同一初始身份参考；后续路线必须复用同脸参考。 |
| 尺寸 | s_ye 为 300×564；s_liu 与 s_langli 为 360×564；s_zhou 为 480×564；立绘最长边不超过 640。 |
| 退稿 | 叶蘅透明底和深色底稿边缘有明显晕圈，改用纯品红背景；概念对比稿仅在本机 review/ 中。 |
| 场景 | 南门、街市、偏巷、渡口、船、东岸、寨门、洞内沿用现有地图、图集和战斗背景。普通行人、商贩、军士沿用职业素材。 |

这批图覆盖本章具名人物和关键证物。其他季节、白鹇谷正式入门立绘、完整配音不属于襄阳体验片段。
