# 战斗动作两种做法对比：生图逐帧 vs Wan 视频抽帧

状态：历史　最后核对：2026-10-23

> 2026-10-23 归档：用户答复“复杂技能弃用”“复杂招式弃用”“不采用的候选移到 attic”，本记录涉及的来源批次与评审页已移入 `_attic/2026-10-23-motion-candidates/`（见其中 manifest.json，`restore.sh` 可还原）。下文路径已改指归档位置。

工作区：xiaojianghu-legacy-prologue（来源批次）＋ xiaojianghu（评审页）。只出候选与对比，不登记、不接线、不改运行代码、不提交、不发布。

## 需求

测试并比较两种做战斗精灵动作的方式：生图逐帧出动作，和直接用 Wan 视频生成动作再后期抽帧。同一角色、同一动作各出一版，对齐后并排对比，给出推荐。用户选定在小江湖做，角色与动作由 Claude 按现有素材选。

## 做了什么

- 选萧白归云钢剑普攻“斜撩一剑”，8 帧，规格同正式战斗表（480×324、锚点 [240,304]、48 色、2× 最近邻）。
- 生图：整组 2 张（一张图画 8 个姿势）＋单帧 7 张（302ai，`--opaque-fix`）。视频：`wan3.0-video-prime` 720P 5 秒 2 段，首帧为正式待机。
- 两种做法走同一套后期，算了剪影、颜色、跳动指标，做了同步播放的评审页。
- 来源批次与完整结论：[_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/motion-method-compare-20261023/README.md](../../../_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/motion-method-compare-20261023/README.md)；评审页：`_attic/2026-10-23-motion-candidates/files/xiaojianghu/review/motion-method-compare/index.html`。

## 结论

- 普攻、快招继续用生图整组；视频两段都在蓄力时转成正面朝镜头，命中瞬间只有运动拖影，0/2 可直接用。
- 视频适合走跑、待机呼吸、运功、受击到跪倒这类慢的连续动作：首帧锁住造型与配色，色差约为生图的一半。
- 逐帧单张生图不推荐：没有共同尺度，细节逐帧漂。

## 验证

- 8797 本地打开评审页：6 个版本同步播放与逐帧切换正常，全部图片加载，控制台无错误。
- 未做：游戏内实机对比（未接线）。

## 续：复杂技能用混合做法

用户要求：“‘视频出过渡帧＋生图出命中帧’的做法，做一些复杂一点的动作，参考下八方旅人的复杂技能”。

- 萧白钢剑测试招式“三连斩”（蓄势、横斩、转身、上撩、腾空、落地下劈、收势），21 帧约 2 秒：8 个关键姿势一张图生图，相邻两个做 Wan 首尾帧视频（8 段 × 3 秒）取 11 张过渡帧。
- 结果：8/8 段都准确落到关键姿势上，比只放关键姿势顺得多；4/8 段要人工改挑帧（转向镜头、剑反方向、剑花、视频自带刀光粒子）。
- 只做身体动作，没做特效；现行《战斗表现边界》下功法不用复杂身体动作，本批只验证做法。
- 来源批次：[_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/skill-hybrid-motion-20261023/README.md](../../../_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/skill-hybrid-motion-20261023/README.md)；评审页：`_attic/2026-10-23-motion-candidates/files/xiaojianghu/review/skill-hybrid-motion/index.html`。
- 验证：8797 本地打开，两版同步播放、逐帧、缩略图跳转正常，图片全部加载，控制台无错误。

## 续：画风偏离定位

用户：“我感觉你这个画风是不是已经偏离了我之前的设定，你看下第一章的战斗精灵及其动作”。

- 主因是参照选了归云阶段的钢剑表（白衣黑裤、马尾发带、反差大），不是第一章那组低饱和土灰色写实造型；其次第一章与归云正式表都由 codex 出图，本轮用 302ai，轮廓偏浅、色块更平；视频帧再软一些。
- 定位记录与指标：[art_sources/style-drift-check-20261023/README.md](../../art_sources/style-drift-check-20261023/README.md)；对照图 `xiaojianghu/review/style-drift-check/`。没改任何素材。
