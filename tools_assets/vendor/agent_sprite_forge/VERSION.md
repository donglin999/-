# agent-sprite-forge 锁定副本

状态：现行　最后核对：2026-10-19

- 来源：https://github.com/0x0funky/agent-sprite-forge
- 版本：提交 5324342fdfab72430f4e9604f3fe427009f8596d（2026-10-06，0.4）
- 许可：MIT，见同目录 LICENSE
- 只拷贝了 `skills/generate2dsprite/scripts`（抠图、网格缩回、调色板）与 `skills/video2dsprite/scripts`（像素后期）两个目录，未改动其中任何文件。
- 依赖：numpy、Pillow、scipy。
- 项目内的调用入口是上一级的 `sprite_finish.py` 与 `prop_finish.py`；不要直接从这里调用它的生图路线（`generate2dmedia` 未拷贝，它在配置了 API 密钥时会优先走付费 API）。
- 升级：重新拷贝两个目录并更新本页提交号，再用两个入口脚本重跑岑霜与竹篮回归对比。
