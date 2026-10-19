# 叶蘅四向重生成 · 2026-10-02

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）（原记：**已完成重生成、姿势 QA、1280／1920 实机验收并采用。**）

需求来源：三人行走检查（已删除）。保留乡村医者初始形象，不切换针法路线或白鹇谷服装。

## 画风基准与退回

第一批使用泛化「可爱 Q 版、16-bit JRPG」提示词，出现圆脸、大眼、偏厚描边、蓬松裤腿与显眼蝴蝶结。用户指出与现用萧白、苏芷探索风格不一致，**整批退回，不采用**。部分背向候选还出现肩带方向、发带侧别改变，均需重做。

画风以当前运行的 `s_hero_bright.webp`／`s_suzhi_bright.webp` 及其行走表为准。叶蘅现有素材用于身份与朴素服饰参照，不照搬其软边。不能把「像素化后有方格」「高画质提示词」等同于同一画风。

- [现用三人同高画风参考](../../../art_sources/ye_walk_20261002/existing-style-board.png)
- [修正站姿候选同高对比](../../../art_sources/ye_walk_20261002/corrected/style-comparison.png)：上萧白、中苏芷、下新版叶蘅。此图为生成站姿裁切／像素化预览，**不是游戏已接入截图或完整验收**。

## 本次目标

四向站姿＋每方向 8 个步行相位。增加过渡帧用于修正换脚生硬，不改变其他角色的最低帧数规则，不追加独立跑步需求。保持同脸、窄身形、灰白便衣、小药具与布鞋，收敛发束和衣摆变化。

先核对三人同高同背景的脸、头身比、描边、像素颗粒、布料与明暗；风格稳定后再扩展运动帧。普通像素边缘须清晰，不能通过改成另一种卡通风格获得所谓清晰度。

正反面必须真实换脚。药包／针筒、肩带与发带按实际身体侧保持一致，正反面不能直接复用同一屏幕侧关系。模型没有服从的帧写入退回记录，不靠组表或增加帧数掩盖。

## 制作记录

- 工具：内置 `image_gen.imagegen`；实际模型名称未由工具暴露，不标注为已固定的 images2.5。
- 当前站姿原生输出 1536×1024、RGBA；原稿保存，不把运行缩图当原生高清。
- [最初提示词](../../../art_sources/ye_walk_20261002/prompts.json)、[首批步行提示词](../../../art_sources/ye_walk_20261002/walk-prompts.json)：历史退回记录。
- [画风修正提示词](../../../art_sources/ye_walk_20261002/style-corrected-prompt.txt)、[修正后的逐向步行提示词](../../../art_sources/ye_walk_20261002/corrected/walk-prompts.json)、[背向肩带修正提示词](../../../art_sources/ye_walk_20261002/corrected/stand-back-fix-prompt.txt)。
- 追加修正提示词：[正向换脚](../../../art_sources/ye_walk_20261002/corrected/walk-phase-fix-prompts.json)、[侧向过渡](../../../art_sources/ye_walk_20261002/corrected/profile-phase-fix-prompts.json)、[背带与最后过渡帧](../../../art_sources/ye_walk_20261002/corrected/targeted-corrections.json)。
- [首批退回清单](../../../art_sources/ye_walk_20261002/rejected-candidates.json)、[当前制作状态](../../../art_sources/ye_walk_20261002/corrected/status.json)。

本次原稿、骨架参考、提示词和站姿预览位于 `art_sources/ye_walk_20261002/`。既有 `assets/s_ye.webp` 保留[旧版备份](../../../art_sources/ye_walk_20261002/previous-s_ye.webp)；验收后替换常规合表、新增 `assets/s_ye_walk_v2.webp`，同步 ART 元数据。萧白、苏芷素材未改。

## 完成条件

完整素材恢复生成后，统一调色板与逻辑像素网格、整倍打包；逐帧检查裁切、鞋腿连接、头部／衣色稳定及循环首尾。然后按[四向标准](../../design/character-walk-quality.md)在 1280／1920 视口检查三人同框、四向至少两轮、停止、转向和加速跟随，保存新证据后替换。

内置工具先前出现四次 `connection failed: error sending request`，失败发生在请求连接阶段，未出现额度／限流证据。用户已授权网络问题重试、额度等其他问题使用现有 API。重试后请求恢复成功；继续使用内置生图，未切换 API、未修改系统网络设置。详细证据见[网络排查记录](../../../art_sources/ye_walk_20261002/corrected/network-diagnosis.md)。

## 恢复后交付

- 四向站姿：背向肩带已经按身体左右修正。
- 步行：每向 8 个不同原生姿势；侧向过渡与背带错误通过内置生图局部重做。未程序画腿或镜像不对称道具。
- 原稿实际尺寸保留为 1536×1024，部分首轮侧向返回 1330×1182；使用真实剪影位置裁切，未把低尺寸放大冒充原生稿。
- 共同色板、47 行逻辑像素、整数 ×3 最近邻、lossless WebP：单元 **84×141**；常规合表 **336×564**，专用步行 **672×564**。
- [离线组表脚本](../../../art_sources/ye_walk_20261002/build_corrected.py)不联网、不替换运行资产。图集自动检查：二值 alpha、准确 ×3 网格、无水平裁切、每方向 8 帧唯一。
- [自动姿势 QA](../../../art_sources/ye_walk_20261002/corrected/packed/qa.json)：32／32 通过原有阈值；阶段与既有管线一致，为共用色板后的逻辑像素、追加描边前。没有放宽阈值。配准保留白模各相位的自然倾身，不能把头部强行固定到站姿位置而误移脚点。
- [最终同高风格对比](../../../art_sources/ye_walk_20261002/corrected/packed/style-comparison.png)、[原生姿势打包联系图](../../../art_sources/ye_walk_20261002/corrected/packed/walk-contact.png)。
- 步行 stride=0.2625，每轮 8×0.2625=2.1 倍可见身高，与萧白／苏芷 12×0.175 的整轮推进距离一致。叶蘅继续用步行加速跟随，不新增独立跑步表。

## 实机验收与采用

- [验收说明](../../review/character-walk-20261002/README.md)：1280×720、1920×1080，四向步行与加速跟随共 16 组；叶蘅每组覆盖 8 个相位、超过两轮，松键后三人停止。两个视口另测连续右→上→左→下转向。
- [实际绘制的叶蘅全部相位](../../review/character-walk-20261002/ye-all-phases.png)、[采用后三人实际移动同框](../../review/character-walk-20261002/production-party-frame.png)。
- 新表自带连接完整的鞋腿，运行时跳过叶蘅旧版补腿，避免重叠；苏芷原有处理保留。
- 白模 QA、文件检查及本次道路实机范围通过。仍允许像素探索表现中的轻微滑步；不宣称全部地形、线上部署或步幅物理关系全面通过。没有提交推送或发布本次资源。
