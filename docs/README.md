# 小江湖 · 开发文档

状态：现行　最后核对：2026-10-20

**当前游戏：[栖河试玩 · 四向地图版](http://127.0.0.1:8792/)**，在兄弟工作区 `../xiaojianghu-legacy-prologue`；[唯一启动与防误入规则](design/local-game-entry.md)。本目录是文档库，没有可运行的游戏。

> 2026-10-20：本目录旧游戏原型（`index.html`、`js/` 运行代码、`assets/` 运行素材、根目录一次性脚本、`raw_*`，含已作废的襄阳演示和 `#street`、`#xiangyang`、`#cultivation`、`#prologue` 等入口）已整体移入 `_attic/2026-10-20-prototype/`，不作参考；清单、保留的硬依赖与还原方法见[归档记录](updates/2026-10-20-prototype-archive.md)。`docs/` 根目录的战斗、美术、测试等技术文档原本描述这个原型，现只作追溯。

当前物品命名：[物品与装备命名规范](design/item-naming-standard.md) · 30 件正式物品、5 类养成资源；旧名称仅作历史对照。

统一查看与评审：[文档书阁](http://127.0.0.1:8794/review/docs/) · [启动与使用说明](document-library.md)。覆盖游戏设定、开发、素材与验收记录，支持全文搜索和按版本保存评审意见。

<!-- map-standard: entry -->

> 地图开发统一入口（2026-10-04）：[现行地图开发规范](design/map-development-standard.md)。地图制作流程、硬参数、分区拼接与验收按此执行；本文旧地图尺寸、旧生成/重建方案和旧通过记录仅供对应版本追溯，不得用于新地图生产。人物等其他专项规则继续有效。

> [新剧情与三年培养设计短链](design/README.md)是目标设计入口。游戏里的襄阳城已撤除，城市内容目前只有[汉皋城](design/hangao-city.md)。

开始部分（序章与风起栖河段）的完整对白现见[开篇脚本目录](archive/design/story-scripts.md)，本次止于周砚山居安顿，仍是文档审阅稿。

## 目录结构

```
docs/                 本文档库：design/ 目标设计，rules/ 规则登记表，updates/ 更新记录，archive/ 历史文档
bible/                人物与物品设定（栖河剧本构建也读这里）
review/               文档书阁（review/docs/）与各批评审页
art_sources/          生图原件与批次记录
tools_docs/           文档检查、一致性检查、武学与装备文档生成、文档书阁服务
tools_story/          人物图谱、剧情起草等
tools_balance/        战斗数值模拟
tools_calendar/       事件排期检查
tools_common/         生图统一入口 imggen.py 与生图源登记
tools_audio/          语音后台 voice_server.py 等
tools_scene/ tools_fx/ tools_bright/   不读写旧原型的场景、特效、出图辅助脚本
tests/                保留的测试（旧原型测试已归档）
js/ assets/           只剩现行文档工具的硬依赖，原因见各自 README.md
```

## 文档索引

| 文档 | 内容 |
|---|---|
| [ai-onboarding.md](ai-onboarding.md) | **AI 开发导入引导**：工作区区分、读文档路线、权威规则、改动流程、生图约定、测试与发布 |
| [design/README.md](design/README.md) | 新故事、叶蘅分支、三年休闲培养及各系统的短链入口 |
| design/xiangyang-city.md（已删除） | 襄阳城地理、生活、角色、案件与现行实现边界 |
| design/xiangyang-art.md（已删除） | 襄阳场景、角色、证物和音景的素材规格与验收 |
| [现行地图开发规范](design/map-development-standard.md) | 唯一地图开发入口：硬参数、预览、分区生成、拼接、空间与验收；旧流程归档 |
| [pets.md](archive/pets.md) | 宠物当前代码行为、战斗优先级与未实现项；目标设计及验收链接 |
| [architecture.md](archive/architecture.md) | 模块职责与加载顺序、全局状态、主循环、场景生命周期、存档、坐标系、绘制顺序、输入/寻路、同伴跟随、音频钩子 |
| [content-guide.md](archive/content-guide.md) | 如何新增/修改内容：场景字段、对话 API、任务、道具、武学、敌人、同伴、青蚨散剧情、小游戏 |
| [battle.md](battle.md) | 战斗系统规格 |
| [art-pipeline.md](art-pipeline.md) | 资源格式与命名、出图与处理管线、重建顺序、已知美术问题 |
| [audio.md](archive/audio.md) | 音频设计、素材、增益、钩子、重新生成 |
| [testing.md](testing.md) | Playwright 测试、碰撞审计、截图评审、发布检查 |
| roadmap.md（已删除） | 已知问题、后续计划、打磨轮次 changelog |

- 功法开发前先读 [功法结构规范 v2](design/martial-structure.md)：外功含招式；内功恰好一主动一被动，覆盖旧分类与特性选装规则。
