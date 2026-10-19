# 栖河日常与战斗 BGM 设计

- 需求：为当前栖河地图设计日常与战斗 BGM。
- 工作区/入口：`xiaojianghu-legacy-prologue`，`codex/legacy-prologue-map`，8792 / `#qihe-map`；当前用户入口为 `battleReview=road` 守路战。
- 核对：`AGENTS.md`、`docs/update-workflow.md`、设计总目录、扩展剧情与制作规范、`docs/audio.md`、素材README与正式清单音频条目；比对 `js/audio.js`、战斗入口和旧生成脚本。
- 现状：仅street有音乐映射，栖河/战斗专曲尚未接入；金属铃音脚步已停用。旧音频文档仍写自动脚步，本轮纠正为实际代码行为。
- 设计：新增 `docs/design/qihe-map/expansion/bgm.md` 与 `bgm-production.md`；提出《溪桥日暖》《护路初锋》，关联动机、配器、曲式、音景优先级、生产提示词、技术和听审标准；同步总目录、扩展目录和音频现状入口。
- 采用/弃用：没有生成或采用新音频，没有替换、删除正式素材，没有修改播放器。疏淡日常与轻对练混音是后续可选制作项。
- 验证：`python3 tools_assets/check_production.py` PASS，315份正式素材，0错误；新增两页相对链接检查PASS。仅文档改动，本轮未执行浏览器交互或音频听审，不宣称听感验收通过。
- 剩余：制作两首代表性样段、试听、完整曲与循环编辑、响度测量、正式入库、播放逻辑接入与游戏内听审。
- 状态：本地设计文档完成；未Git提交；未线上发布。
