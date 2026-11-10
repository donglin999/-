# 2026-11-10 Godot 版首次入 git、出 Windows 试玩包

状态：现行　最后核对：2026-11-10

用户说：“提交上传吧，同时告诉我如何在 windows 上进行游玩。”

## 提交

xiaojianghu-godot 从 11-03 建起来一直没进过 git，这次首次入库：
- 仓库：GitHub `donglin999/-`（公开），新分支 `godot`。和原版、文档用的是同一个仓库，原版和文档在各自的分支上。
- `.gitignore` 不入库的内容：
  - `build/`：测试与导出产物，4.1G；
  - `_attic/`：旧图备份；
  - `game/.godot/`：引擎缓存；
  - `docs/review` 下的图片：1.1G，而且里面有逸剑风云决、大侠立志传等别家游戏的参考截图，公开仓库不放。评审目录里的文字、脚本、提示词照常入库，图片只留在本机。
- 入库 4789 个文件，共 955MB。推送前扫过密钥（sk-、Bearer、ghp_ 等），没有发现。生图密钥本来就在 `.env` 里，`.env` 也写进了忽略规则。

同一天提交并推送了另外两个工作区：
- 文档工作区 `xiaojianghu`，分支 `claude/desk-finish-20261031`：11-01 以来的改动清单、规则登记、设计稿、工具。
- 原版 `xiaojianghu-legacy-prologue`，分支 `codex/legacy-prologue-map`：11-03 载入卡死的记录和 core.js 改动。原版此后不再更新。

## Windows 试玩包

- 导出配置：`game/export_presets.cfg` 新增 preset.10 “Windows”。
  - x86_64；
  - exe 和 pck 分开，不嵌入；
  - 不改 exe 资源（不用 rcedit）、不签名；
  - 排除测试脚本，和 macOS 那套一样。
- 产物在 `build/windows/XiaoJiangHu/`：
  - `XiaoJiangHu.exe`（109MB）；
  - `XiaoJiangHu.pck`（237MB）；
  - `README.txt`：带 BOM 的 UTF-8，记事本打开中文不乱码。
  - 文件名用英文，免得 Mac 打的 zip 在 Windows 资源管理器里解压时中文名变乱码。exe 和 pck 必须同名，引擎靠这个找资源包。
- 打包：`XiaoJiangHu-windows-20261110.zip`（267MB），上传到 GitHub 发布版。
- 核对：
  - 在 Mac 上用同一个资源包启动（`--main-pack`），无界面跑 600 帧，没有报错；
  - 在虚拟屏上开窗口录了 60 帧，标题页正常画出来。
  - exe 本身没在 Windows 上实际跑过，这台 Mac 跑不了。
- 字体：界面的宋体、楷体读的是 macOS 系统字体（Songti SC、Kaiti SC），Windows 上没有，会自动换成游戏自带的思源宋体（Noto Serif SC），和网页版一样。不缺字，只是字形和 Mac 上略有不同。
- 存档在 `%APPDATA%\Godot\app_userdata\` 下，和 Mac 上的存档不通。
