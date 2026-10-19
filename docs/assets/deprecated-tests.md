> 每次改动按[更新核对流程](../update-workflow.md)执行，并写入 docs/updates/。

# 弃用／不启用的测试方法清单

状态：现行　最后核对：2026-10-19

整理日期：2026-10-10。工作区：xiaojianghu-legacy-prologue / 8792。

**出图、取参考图、定规格之前先查这张表。** 下面列出的批次和方法都是测试、试点或候选，**没有被采用，不启用**：不得当作画风参考、规格依据或生成流程照搬，也不得从这些目录取参考图。目录和文件都原样保留，只供追溯；没有引用不等于可以删除。

起因：2026-10-10 给新城市出场景图时，`art_sources/scene-pixel-central-20261009`（90 格 Q 版扁平像素试点）被误当成画风参考，用户纠正——那是测试用的，正式版有自己的生成流程。

## 怎么判断一个批次能不能当参考

1. 只有登记在[正式素材清单](production-assets.md)（`production-assets.json`）里的文件及其 `source` 批次才是正式依据。
2. 批次 `README.md` 或 `DEPRECATED.md` 页首标着“未采用／试点／测试／候选／预览／撤回”的，一律不得作参考。
3. 不按目录名、版本数字、修改时间或“看起来更新”来选；目录名里带 `approved`、`final`、`formal` 也不等于已采用。
4. 被 `?pixel90=…` 这类显式预览参数加载，不等于已采用；默认 8792 入口不加载的都不是现行方案。
5. 拿不准就先问用户，不要自己判定。

## 正式依据（替代做法）

| 做什么 | 正式依据 |
| --- | --- |
| 新建、扩展、整改地图 | [现行地图开发规范](../../../xiaojianghu/docs/design/map-development-standard.md)（现行唯一入口）；已采用的模块化地图批次 `art_sources/qihe-modular-*-20261007/` 与[采用记录](../updates/2026-10-07-ch1-modular-adoption.md) |
| 选正式图、取参考原件 | [正式素材清单](production-assets.md) 与 `production-assets.json` 里登记的文件和来源 |
| 主角场景小人 | [蓝灰萧白正式入口采用](../design/qihe-map/hero-blue-adoption.md)，登记来源 `art_sources/hero-motion-unified-blue-20261010/`、`hero-blue-formal-20261010/` |
| 栖河 NPC 场景小人 | [栖河 NPC 场景小人重制](../design/qihe-map/npc-pixel-refresh.md)，登记来源 `art_sources/qihe-npc-refresh-20261010/` |
| 生图通道与接口 | [美术管线](../art-pipeline.md)、文档库的[美术管线 · 当前出图接口约定](../../../xiaojianghu/docs/art-pipeline.md) |

## 栖月楼V3剖视风格停止使用（2026-10-14）

`art_sources/qiyue-building-v3-20261013/building-cutaway.png`及`building-cutaway-r2.png`被用户明确否定画风和整楼剖视用途，保留历史，不作新图风格参考。楼层关系设计与检查代码可追溯复用；当前图风格由用户新上传图单独授权，见`art_sources/qiyue-scenes-v4-20261014/source/user-style.png`及负责文档。

## 清单：场景／地图

### 2026-10-12：独立 Unity / Tripo 测试全部弃用

兄弟目录 `../qihe-hd2d-unity/` **整体弃用**，2026-10-18 已整体移入 `_attic/2026-10-18/qihe-hd2d-unity/`，详见弃用范围（已移入 _attic，不作参考）。包括 Tripo 药棚、程序化建筑、像素材质、统一风格概念图、复现 05、构建及截图；用户明确表示不适合，不再作为正式素材、风格、规格或生成流程参考。历史认可方向与技术测试通过不代表采用。文件保留追溯，原正式蓝灰萧白等源素材及 8792 当前版本不受影响。

路径都相对本工作区根目录。

| 批次或方法 | 日期 | 测试内容 | 不采用的依据／原因 | 正确的替代做法 |
| --- | --- | --- | --- | --- |
| `art_sources/scene-pixel-pilot-20261009/`（后山像素规格试点） | 2026-10-09 | “场景跟着 90 格人物改”：后山一块区域按每格 2 屏幕像素重画，A/B/C/D 四个方向 | README 与[更新记录](../updates/2026-10-09-scene-pixel-pilot.md)写“候选，未采用”；未做碰撞对照、接入、验收、登记。否决原因未记录 | 地图规范 + 模块化地图批次 |
| `art_sources/scene-pixel-backhill-full-20261009/`（后山整图像素重画，含 `?pixel90=backhill` 显式预览） | 2026-10-09 | “B 配色 + C 道具”整张后山重画，1600×900 美术像素；后山改镜头跟随的显式预览 | README 与更新记录（[整图](../updates/2026-10-09-backhill-pixel-full.md)、[镜头跟随预览](../updates/2026-10-09-backhill-camera-follow-preview.md)）写“未采用／待审候选”；未登记；默认后山仍是现版。否决原因未记录。**注意**：`index.html` 条件钩子与 `js/prologue-backhill-pixel90-preview.js` 在显式参数下仍加载本目录，不能移动或删除 | 已采用的后山模块化图（`qihe-modular-backhill-20261007`，登记名 `m_prologue_backhill_modular_20261008`） |
| `art_sources/scene-pixel-central-20261009/`（村中心像素版复刻，含 `SPEC.md`） | 2026-10-09 | 按后山试点画法复刻村中心 `m_qh_central` 评审稿，3333×2222 美术像素 | README 标“未采用”；未登记、无代码引用；2026-10-10 用户明确它是测试批次，不能当新地图的画风参考 | 已采用的村中心模块化图（`qihe-modular-central-20261007`）+ 地图规范 |

## 清单：人物小人与动作

| 批次或方法 | 日期 | 测试内容 | 不采用的依据／原因 | 正确的替代做法 |
| --- | --- | --- | --- | --- |
| `art_sources/character-story-redraw-20261007/` | 2026-10-07～08 | 按 NPC 像素表密度重画 4 张故事版人物（徐令仪、岑霜、沈雁回、陈伯休息） | 采用后撤回：用户看放大图后否决（脸只剩两个黑点、长发糊成色块、服饰与气质丢失），见[采用记录](../updates/2026-10-07-ch1-modular-adoption.md)。`assets/production/characters/s_qh_*_story_redraw_20261008.webp` 留存但未登记、未加载，同样不得取用 | 正式清单登记的故事版小人；NPC 重制合同 |
| `art_sources/character-story-pixel-20261008/` | 2026-10-08 | 故事版 4 张的 C 方案：原生分辨率逐像素手绘 | 用户选“不采用，保持现版”：41 美术像素下人物方块僵硬、身段与发型气质丢失 | 同上 |
| `art_sources/character-pixel-style-pilot-20261008/`（含 `rig/`、`demo/`、`game/pixel-style-test.js`） | 2026-10-08 | “AI 直接出像素风 + 网格对齐取色”人物试点；部件动画；多版移动对比 demo；`?pixeltest=1` 游戏内测试挂钩 | [记录](../updates/2026-10-08-pixel-style-walk-run-test.md)写“未采用、未登记”；测试挂钩已在[部件动画记录](../updates/2026-10-08-hero-rig-demo.md)撤回（用户觉得像素 4 帧走跑“还是有点生硬”） | 主角、NPC 的正式合同与登记来源 |
| `art_sources/hero-long-pixel-20261008/` | 2026-10-08 | 入谷长发萧白按原版动作逐帧重画 | README 标“未采用”，未接入、未登记。否决原因未记录 | 同上 |
| `art_sources/hero-pixel-24f-20261008/` | 2026-10-08～09 | 像素 B 版萧白 24 帧走 / 20 帧跑（关键帧 + AI 中间帧） | README 标“未采用”；诊断为各张步幅不一、循环一瘸一拐 | 同上 |
| `art_sources/pixel-mannequin-20261009/` | 2026-10-09 | 区域编码人台 + 换色流水线（60 格人台） | README 标“试点，未采用”，未接入、未登记。否决原因未记录 | 同上 |
| `art_sources/hero-pixel-anim90-20261009/` | 2026-10-09 | 90 格定稿站立像上的逐帧动画小样 | README 标“进行中，未采用”，之后无采用记录；正式主角登记来源不是本批。原因未记录 | 同上 |
| `art_sources/hero-pixel-inpaint-20261009/` | 2026-10-09 | 蒙版局部重绘、图章拼帧做侧面走路 | README 写“真实游戏未接入”，未登记、无引用、无采用记录；记有 AI 不守蒙版、不听骨架、跳色。否决原因未记录 | 同上 |
| `art_sources/hero-pixel-rig90-20261009/` | 2026-10-09 | Godot 4 的 2D 骨骼动画小样（站、走、跑四向） | 无 README、无更新记录；未登记、无引用、无采用记录。原因未记录 | 同上 |
| `art_sources/cast-pixel90-20261009/` | 2026-10-09 | 叶蘅、野狗 90 格站立像，供后山像素预览用 | README 标“候选，未采用”，未进 `assets/` 与正式清单。否决原因未记录。**注意**：后山预览的导出脚本引用本目录，不能移动或删除 | NPC 重制合同，登记来源 `qihe-npc-refresh-20261010` |
| `art_sources/chapter1-hero-pose-preview-20261010/`、`review/chapter1-hero-pose-preview-20261010/` | 2026-10-10 | 用 `pose-pixel-animation` skill 重做萧白战斗动作的独立候选 | 用户已否定握法（后手中握、尾杆过长），见[负责页](../archive/design/qihe-map/hero-battle-pose-preview.md) | [现用战斗素材](../design/qihe-map/expansion/battle-assets.md) |

## 清单：界面

| 批次或方法 | 日期 | 测试内容 | 不采用的依据／原因 | 正确的替代做法 |
| --- | --- | --- | --- | --- |
| `art_sources/qihe-quest-journal-refresh-20261010/` | 2026-10-10 | 江湖行记任务页／人物页整改预览 | 设计页（2026-10-18 随批次归档）记为“历史候选，已被用户反馈撤回” | [图鉴整改（已接入）](../design/qihe-map/expansion/ui-flow/quest-codex-refresh-20261010.md) |

## 待用户确认（没有标弃用，也不要当作已确认的现行规范）

下面几项记录互相牵连或彼此矛盾，本轮没有判定。用户确认之前：不要把它们标成弃用，也不要拿它们当新素材的画风或规格依据。

| 项目 | 为什么拿不准 |
| --- | --- |
| “人物 90 格高、1080p 下每格 2 屏幕像素、场景同颗粒 Q 版”这套规格本身 | 2026-10-09 多份记录写“用户已定”；但按这套规格做的场景批次全部未采用，用户 2026-10-10 说场景试点只是测试。正式主角合同写的是“共同图集身体基准 90 美术像素”，同时写明“不直接沿后山预览的 1.2 倍像素密度放大人物”，普通地图沿原正式人物尺度。规格是否作废、是否只保留人物部分，用户没有明说 |
| `art_sources/hero-pixel-design-20261009/`（萧白 90 格定妆，`approved/`） | README 标题写“未采用”，正文又写“定稿：正面 B、侧面 B、背面 B”；多个未采用的场景批次和后来的蓝灰主角候选都以它为造型标准。它没有登记在正式清单，但与已采用的蓝灰主角有沿用关系 |
| `art_sources/hero-run-blue-20261009/`、`hero-run-blue-small-20261009/`、`hero-walk-blue-20261010/`、`hero-run-initial-blue-20261010/`、`hero-run-initial-reference-20261010/` | 各自 README 写“候选，未正式采用”或已被完整 C 包取代；但它们是已采用蓝灰主角的前序版本，并且仍被 `js/prologue-backhill-pixel90-preview.js` 作为 A/B/D 对照项加载 |
| `art_sources/character-distinction-20261009/`（主角与路人辨识度候选） | [记录](../updates/2026-10-09-character-distinction-candidate.md)写“候选，等待用户审阅”，没有采用或否决的记录 |
| `art_sources/chapter1-hero-staff-grip-preview-20261010/`、`review/chapter1-hero-staff-grip-preview-20261010/` | README 写“独立候选，未替换游戏，待用户审阅”，尚无结论 |
| `?pixel90=backhill` 显式预览代码本身（`index.html` 条件钩子、`js/prologue-backhill-pixel90-preview.js`） | 属于运行代码，本轮不得改动。它加载的后山美术已标为不启用；预览入口是否保留、是否要摘掉，需要用户决定 |

## 2026-10-18 归档

以下批次已从工作区移入 `_attic/2026-10-18/`（保持原相对路径，可用该目录 `restore.sh` 恢复），本表各行保留作弃用依据：`scene-pixel-pilot-20261009`、`scene-pixel-central-20261009`、`character-story-redraw-20261007`（含 4 张未登记的 `s_qh_*_story_redraw_20261008.webp`）、`character-story-pixel-20261008`、`character-pixel-style-pilot-20261008`、`hero-long-pixel-20261008`、`hero-pixel-24f-20261008`、`pixel-mannequin-20261009`、`hero-pixel-anim90-20261009`、`hero-pixel-inpaint-20261009`、`hero-pixel-rig90-20261009`、`hero-multiweapon-design-20261013`、`qihe-quest-journal-refresh-20261010`（连同其设计页），以及兄弟目录 `qihe-hd2d-unity/`。仍在原位、不得移动的：`scene-pixel-backhill-full-20261009`、`cast-pixel90-20261009`、`chapter1-hero-pose-preview-20261010`（被保留的握杖预览页引用）及“待用户确认”各项。记录见[清理更新](../updates/2026-10-18-cleanup.md)。

## 2026-10-19 弃用入口清理

`?pixel90=backhill` 显式预览的运行代码（`js/prologue-backhill-pixel90-preview.js` 与 `index.html` 里的加载片段）已移入 `_attic/2026-10-19-deprecated/`，现在带这些参数打开只会进入普通首页。`scene-pixel-backhill-full-20261009`、`cast-pixel90-20261009` 及蓝灰主角走跑候选批次仍留在原位：前者被历史演示页 `art_sources/hero-run-*/demo/` 读取，后几个是已采用的 `hero-motion-unified-blue-20261010` 的来源链。它们依旧是弃用画风，不得作参考。同轮还归档了襄阳演示的脚本、地图、战斗背景、容器与音效，见[弃用入口清理](../updates/2026-10-19-deprecated-entries.md)。

## 维护

2026-10-14：`art_sources/hero-multiweapon-design-20261013/`的身体三视图、剑拳、刀棍暗器手绘设计稿因画风偏离战斗像素规范撤回。上一轮将`not pixelated`与水彩/柔和赛璐璐写入战斗身体提示词，用户明确指出与文档不符。原图保留追溯，不作画风、比例落地或生产流程参考。正式身体颗粒仍以登记主角战斗帧和战斗精灵规格为准。

- 以后做测试、试点、候选批次时，在批次 `README.md` 页首写明状态（候选／未采用／已采用），采用或否决后回来改这一行，并在本表增删。
- 某一项后来被用户采用时：先按 `AGENTS.md` 第 5 步登记正式清单，再把它从本表移走，并改掉批次页首的状态说明。

## 2026-10-14 岑霜软鞭画风退回

`art_sources/qihe-whip-clash-20261014` 内软鞭人物 `raw/atk、base、move、down`、`prepared/`、`out/` 与 `raw/concept*` 被用户指出不符合战斗精灵画风，停止采用和作为后续风格参考。原因：未先建立战斗侧身定妆，逐帧压色代替共享调色板、漏统一描边、未做白模配准QA；概念图又重画人物。该批已采用的8句领队音频、4张夜间CG不在此次撤回范围。陆衡/乌魁/堂众音色推荐未获同意，用户另选。替代制作须依文档库battle-sprite-spec.md与anim-pipeline.md。
