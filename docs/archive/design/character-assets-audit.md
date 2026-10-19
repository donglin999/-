# 当前襄阳角色素材验收

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）（原记：**2026-10-02 已整改、已接入本地游戏**。依据[角色分类](../../design/role-assets.md)、[质量标准](../../design/character-asset-quality.md)、[四向行走](../../design/character-walk-quality.md)和[战斗规格](../../battle-sprite-spec.md)。）

## 1. 范围和结果

盘点当前 `CHARS` 的 23 个角色，以及野外山贼探索外观变体；逐角色类型、文件和必需表达见[机器清单](../../design/character-assets-current.json)。本页验收当前襄阳阶段，不代表未来开篇服装、全章节或全部地形已验收。地图、图标、音乐和语音不属于本轮角色素材检查。

角色运行文件从 **113 个变为 127 个**。本轮采用 **53 个文件：38 个替换、15 个新增**；删除过时的 `s_hero_battle.webp`，移除其加载和绘制入口。失败原稿仅作为退稿证据归档，不再用于运行。

| 发现的问题 | 本轮处理 |
| --- | --- |
| 14 张探索表不满足严格像素网格／透明边缘，或有孤立杂点 | 对吴长老、柳三娘、老伯、铁匠、盐商、村民、疤脸刘、浪里鳅和军士涉及的版本重新技术导出；不改变已经认可的脸和服装 |
| 老周倒地小图脸、手和腿难辨，旧导出网格不合格 | 重生成卧姿，再按统一像素网格组表；单元 **138×141**，表 **552×564**。四向查询重复同一卧姿是明确的静态例外，不是行走循环 |
| 对话表情缺失，原稿画布宽度各异 | 补萧白 worry、苏芷 hurt；默庵、吴长老、独眼阎罗、疤脸刘、浪里鳅各 firm＋worry，共 **12 张**；19 张沿用立绘只补透明留白，统一到 **480×640**并修正头像锚点 |
| 疤脸刘、浪里鳅没有独立战斗身份 | 新增两套专用战斗表；浪里鳅固定双短直分水刺，持长刀候选退回；疤脸刘保留伤疤和铁臂护具 |
| 苏芷、吴长老、独眼阎罗部分战斗姿势未通过关节检查 | 重生成失败姿势，重新抽取、验收并组表；不降低 QA 阈值 |
| 大黄战斗耳形与探索身份不一致，菜单只有放大的小精灵 | 修正战斗姿势中的耳形；新增 **1024×1536**、淡雅襄阳河岸背景的宠物全身肖像，采用金黄毛色、浅胸口、微垂圆耳和卷尾 |

叶蘅已经通过的探索、立绘、表情、菜单及战斗基础包沿用；其最新行走验收见[专页](ye-walk-regeneration.md)。无需为了数量重复生成。普通 NPC 没有新增剧情动作包。

## 2. 采用的战斗表

| 角色 | 单元 | 帧数 | 整表 |
| --- | --- | --- | --- |
| 苏芷 | 252×210 | 20 | 5040×210 |
| 吴长老 | 408×252 | 18 | 7344×252 |
| 独眼阎罗 | 576×372 | 18 | 10368×372 |
| 疤脸刘 | 354×204 | 18 | 6372×204 |
| 浪里鳅 | 252×195 | 18 | 4536×195 |
| 大黄 | 186×111 | 14 | 2604×111 |

表的留白／武器长度不同，不能用单元高度判断角色实际身高。运行时按可见身体范围和脚点缩放。同深度参考身体高：萧白 105、叶蘅 102.9、苏芷 103.95、吴长老 102.9、默庵 108.15、疤脸刘／浪里鳅 109.2，均在普通成人 0.93–1.08 的范围内；大黄和独眼阎罗按各自物种／首领体型处理。

战斗基础调色板为我方 32、精英 28、首领 36 色；描边按既有 `outline` 规则从邻色派生，所以最终解码 RGB 总数会超过基础调色板数。不能把解码总色数误当作基础调色板门禁。

## 3. 实际做过的验收

| 检查 | 证据与结论 |
| --- | --- |
| 127 个角色运行文件 | [整改后文件检查](../../../art_sources/character_assets_20261002/acceptance/file-audit-after.json)：尺寸、元数据网格、alpha、精确 3×3 像素块、战斗动作及 hit 索引无告警；[整改前](../../../art_sources/character_assets_20261002/acceptance/file-audit-before.json)保留失败事实 |
| 本轮六套战斗表 | **70 个采用的原生姿势**通过 QA；各角色 `battle/<id>/qa.json` 保存选帧、误差及可复现源文件。人体、握持和身份另做图像审阅，不靠 QA 数值代替 |
| 实际探索／战斗渲染函数 | 1280×720、1920×1080 各调用 **56 次四向探索绘制、32 次战斗关键帧绘制**；[1280 记录](../../../art_sources/character_assets_20261002/acceptance/runtime-1280.json)、[1920 记录](../../../art_sources/character_assets_20261002/acceptance/runtime-1920.json)。密集联系图只辅助核对绘制，不用于证明单图没有裁切 |
| 菜单与对话 | 两种视口检查三人菜单、大黄肖像，以及萧白 worry、苏芷 hurt；五名重要 NPC 的 neutral／firm／worry 都经过实际 `dlgSetup` 切换。共每种视口 19 次切换，[1280](../../../art_sources/character_assets_20261002/acceptance/runtime-dialogues-1280.json)、[1920](../../../art_sources/character_assets_20261002/acceptance/runtime-dialogues-1920.json)记录脸图地址、显示矩形、透明度和正文安全区 |
| 实际游戏画面 | [1280 战斗](../../../art_sources/character_assets_20261002/acceptance/runtime-game-battle-1280.png)、[1920 战斗](../../../art_sources/character_assets_20261002/acceptance/runtime-game-battle-1920.png)、[三人菜单](../../../art_sources/character_assets_20261002/acceptance/runtime-menu-1920.png)、[大黄菜单](../../../art_sources/character_assets_20261002/acceptance/runtime-pet-menu-1280.png)、[首领蓄力](../../../art_sources/character_assets_20261002/acceptance/runtime-chief-cast-1920.png)；本轮捕获未发现素材渲染异常，未请求旧主角备用表 |
| 回归 | 三项 Python 门禁测试和三项接地测试通过；修改过的 JS 语法检查、Python 编译及 diff 空白检查通过 |

本轮运行测试覆盖关键动作、表情切换与代表界面，没有把自动拼图扩大成完整剧情、全地形或所有技能逐帧通过的结论。

## 4. 源图、提示词与复用

- [完整提示词及生成记录](../../../art_sources/character_assets_20261002/generation-prompts.json)：本轮 44 次生成／修正的完整提示词、实际原生尺寸、工具及退稿状态。使用内置 image_gen；工具未暴露具体模型版本，不能写成已确认 images2.5。
- [采用清单及前后 SHA256](../../../art_sources/character_assets_20261002/adoption-manifest.json)、[立绘与卧姿导出记录](../../../art_sources/character_assets_20261002/packing-record.json)。`native/` 保存本轮原稿；`reference_inputs/` 保存能定位到的参考文件快照；14 次早期请求的引用路径没有留存到调用记录，已明确标注，不伪造调用元数据。采用源图及姿势 cells 均已保存，可继续按本轮身份基准和白模复现。
- `battle/<角色>/qa.json` 是采用记录；被拒绝的候选、旧 QA 和 `runtime-before/` 是溯源证据，不是运行输入。部分历史候选指标仍保留当时本机路径；复现采用表使用保存到项目内的 `pick` 源文件。
- `js/bart.js` 的 `CHARACTER_AUDIT_20261002` 段同步本轮实际表；只运行旧的 BART 自动同步区不能覆盖掉这段新数据。

复查文件：

```sh
node tools/character_asset_metadata.cjs review/character-assets-recheck
python3 tools/character_asset_audit.py --out review/character-assets-recheck --check
python3 tests/character-asset-gates.test.py
node --test tests/character-grounding.test.cjs
```

重组已采用战斗表（示例，保持项目根目录执行）：

```sh
python3 tools_fx/rig/assemble.py liu --qa art_sources/character_assets_20261002/battle/liu/qa.json --out-dir review/character-assets-rebuild
```

打包器拒绝有 `bad` 的选帧；姿势选择使用**实际缩放、接地后的输出**重新计算误差，原阈值不变。文件检查通过后仍须检查身份、手部和实机显示。

## 5. 章节适配边界

当前萧白带剑素材只用于现行襄阳，不作为初入村无剑阶段的通过证据。老周是襄阳脚夫，不借用周砚的导师身份。新章节、换装和能力分支另按角色卡派单。

沿用的救治事件画和第一章旧物画原生为 **1672×941**，现行运行导出为约 1280×720；不得宣传为原生 Full HD。它们是已有兼容事件画，1920×1080 是新 CG 的制作目标；章节级 CG 再制作时须按该目标验收。本轮没有用放大导出来冒充重新生成的高清 CG。
