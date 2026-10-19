# 开始部分战斗素材

状态：现行　最后核对：2026-10-19

2026-10-05 · [返回目录](README.md) · [实施记录](implementation.md)

按用户最新要求，两场战斗使用新生成的专用背景，陆衡与两名帮众使用新生成动作表。已经替换实际 `QiheChapter.storyBattle` 引用。

## 场次与文件

|场次|背景|战斗角色|
|---|---|---|
|陆衡传授护路棍法后的对练|`bb_qh_training_v1`，1672×941；日间西田埂练场，远处农具棚、田地与木桩，中场留空|萧白借衣阶段 `hero_village`；新陆衡 `qh_luheng_v1` 在敌方朝右|
|撤离时守住药车通路|`bb_qh_evacuation_v1`，1672×941；暮色药车道，药车停在远侧，远村火光与烟，通路留空|萧白与新陆衡；两名独立帮众 `qh_raider_front_v1` / `qh_raider_rear_v1`|

|新动作表|完整尺寸|单帧尺寸|帧数与身份|
|---|---|---|---|
|`b_qh_luheng_v1.webp`|7560×276|378×276|20帧，蓝灰袍、褐色短外衣、木棍；可同时承担对练敌方与守路友方|
|`b_qh_raider_front_v1.webp`|6372×216|354×216|18帧，黑衣包头、棕色腰带、持刀、体型较壮|
|`b_qh_raider_rear_v1.webp`|6372×210|354×210|18帧，黑衣包头、蓝灰腰带、较瘦、持刀|

2026-10-10当前采用：主角借衣阶段 `hero_village` 使用 `b_hero_village_staff_combo_20261010`（14400×360，30列480×360），横扫、斜打、直戳连续演出；首击有木棍音、预算内顿帧与明显受击后退，规则结算仅在末次接触。详见[当前连招合同](../hero-staff-combo.md)。此前 `b_hero_village_staff_grip_20261010` 的26帧按同一固定平移保留原像素，首次采用记录见[端握合同](../../../archive/design/qihe-map/hero-staff-grip-adoption.md)。旧 `b_luheng`、`b_bandit` 与探索地图 `m_qh_west` 不再被本章两场战斗引用；其他场景资源没有被删除。

2026-10-13新增[领队交锋](../../../../../xiaojianghu/docs/archive/design/chapter1-clash-20261012.md)：徐令仪和岑霜各带两人，全自动各展示两招后沈叫停。两位领队采用独立战斗表，随行者复用正式持刀表；不是地图模型或立绘冒充战斗动作。此前两场主角战斗保留。

## 生成标准与记录

- [战斗精灵规格](../../../battle-sprite-spec.md)：六头身侧视、64逻辑像素骨架、3倍最近邻、硬透明、脚底坐标、动作与命中帧。
- [白模动作管线](../../../anim-pipeline.md)：程序骨架/关节 → 新定妆 → 按白模生成动作 → QA → 调色/描边/组表 → 实际渲染检查。
- [本分支角色质量规则](../../../archive/design/qihe-map/expansion/standards/character-asset-quality.md)：角色身份、服装阶段、动作完整性及同屏清晰度。
- [本批来源、复现方式和验收记录](../../../../art_sources/qihe-chapter1-battle-v1/README.md)：原图、全部提示词、参考、失败候选和选帧均归档。

本批由内置 imagegen 生成，未调用或移除用户 API。背景分别生成；两名帮众分别定妆与生成动作，不能以染色同一张旧表交付。

姿势门槛不变：覆盖率≥0.55、溢出率≤0.20，头部误差≤3、近侧手脚≤5、远侧≤9、武器尖≤8逻辑像素。改进配准时在最终落地像素上验收，禁止靠放宽门槛通过。陆衡倒地方向错误的首批候选已剔除。

## 接入规则

`js/qihe-chapter-battle-art.js` 登记独立 BART、背景和成人体量；`js/qihe-chapter.js` 分别选取两场资源；`js/bstage.js` 登记专用战斗舞台氛围。开战前验证所需素材加载与表尺寸，缺少专用素材会阻止开战并恢复状态，不能悄悄回退旧角色或探索地图。

同深度成人可见身体归一到105画布像素，按景深缩放。陆衡表默认朝左，对练时由播放器镜像朝右。行动顺序头像使用表内已核查的脸部区域，避免武器与透明留白影响自动取脸。

## 验收结果与边界

- [文件验收](../../../../art_sources/qihe-chapter1-battle-v1/file-acceptance.json)：3套/56帧，所有帧非空；alpha仅0/255；精确3×网格；动画索引有效；所有选用姿势通过既有QA；背景尺寸与比例通过。
- [战斗执行与素材映射测试](../../../../art_sources/qihe-chapter1-battle-v1/runtime/test.json)：对练、未学棍法守路、已学棍法守路均获胜并恢复场外状态；正确加载专用背景和各自动作表；缺图拒绝回退。
- [护身与BP回归](../../../../art_sources/qihe-expansion-v1/chapter-battle-test.json)：实际技能、防护效果、BP单击规则通过。
- [对练1280画面](../../../../art_sources/qihe-chapter1-battle-v1/runtime/lesson-1280-idle.png) / [守路1920画面](../../../../art_sources/qihe-chapter1-battle-v1/runtime/road-1920-idle.png)。已目检角色体型、脚底、武器朝向、场景安全区、行动顺序头像。
- [对练动作抽样](../../../../art_sources/qihe-chapter1-battle-v1/runtime/lesson-1280-actions.png) / [守路动作抽样](../../../../art_sources/qihe-chapter1-battle-v1/runtime/road-1920-actions.png)。两种尺寸均采样待机、冲刺、蓄力、出手、收势、第二攻击、受击、运功、破势、倒地及我方胜利；采样为固定动作检查，非实战录像。

以上画面由本地 VM 调用真实 Canvas 战斗渲染器导出，未包含 DOM 指令菜单和卡片。此前自动审批拒绝浏览器自动检查，本轮未绕换入口；浏览器原生操作、DOM遮挡、声音、实际帧率仍未验收。

## 独立候选

2026-10-10 最初按用户要求提供[木棍直刺动作独立预览](../../../archive/design/qihe-map/hero-battle-pose-preview.md)。随后用户要求替换到游戏，端握修正版已正式采用；早期中握版仍被否定，不用于当前游戏。
