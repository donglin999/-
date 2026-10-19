# 静态发布

状态：现行　最后核对：2026-10-20

本目录是文档库，**没有可运行、可构建、可发布的游戏**。

- 2026-10-20 用户要求“旧原型整体归档”：本目录旧原型（`index.html`、`js/` 运行代码、`assets/` 运行素材，含已作废的襄阳演示）连同构建脚本 `scripts/build-pages.cjs`（`--prototype`，输出 `dist-prototype`）一起移入 `_attic/2026-10-20-prototype/`，清单与还原脚本见[归档记录](docs/updates/2026-10-20-prototype-archive.md)。旧原型构建已取消，本目录不再有任何构建命令。
- 当前栖河试玩版的构建与发布只在兄弟工作区执行，见[栖河发布说明](../xiaojianghu-legacy-prologue/DEPLOY.md)，规则 R-发布-01。栖河发布构建会运行本目录的 `tools_docs/check_docs.py`。
- 本机游戏入口见[本机游戏入口与工作区](docs/design/local-game-entry.md)。

## 旧记录

线上站点 <https://luotuo-36x.pages.dev/> 早先用 Direct Upload 发布本目录旧原型（首次发布对应源码提交 `799d6a3`），2026-10-17 起已换成栖河试玩版。站点与 GitHub 仓库 `donglin999/-` 分开管理，推送 `main` 不会自动发布。
