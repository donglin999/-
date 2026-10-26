# 项目入口

状态：现行　最后核对：2026-10-21

开工前先读 [AI 开发导入引导](docs/ai-onboarding.md)：工作区区分、读文档路线、权威与状态规则、改动流程、生图约定、测试与发布。

**改动清单（硬性要求，R-文档-03）**：两个工作区共用 [docs/changelist.md](docs/changelist.md)。开工前读最近的条目和“进行中”；动手时先在顶部加一条“进行中”；完成或交接时改成结果，并链上更新记录。漏登时 `check_docs.py` 失败，发布构建会停。

当前栖河试玩版在兄弟工作区 `../xiaojianghu-legacy-prologue`（8792）。本目录是文档库；旧游戏原型（含已作废的襄阳演示）已于 2026-10-20 整体移入 `_attic/2026-10-20-prototype/`，本目录不能再运行或构建游戏，见[归档记录](docs/updates/2026-10-20-prototype-archive.md)。`js/`、`assets/` 里只剩现行文档工具的硬依赖，各自 README 写明原因。

启动当前游戏：`python3 ../xiaojianghu-legacy-prologue/scripts/serve-current.py`，核验用`--check`。发布见 [DEPLOY.md](DEPLOY.md)。

生图：默认模型 **gpt-image-2.5**，每次生图提示词必须带上 `Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）`；详见 [美术管线 · 当前出图接口约定](docs/art-pipeline.md)。
