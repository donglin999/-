# 2026-10-05 区域小地图改为主动开关

- 用户要求：取消固定小地图，以快捷键开启；右上入口与江湖、行囊图标同风格。
- 工作区与入口：xiaojianghu-legacy-prologue，8792，#qihe-map。
- 文档先核对并更新：docs/design/README.md、docs/design/qihe-map/expansion/chapter-presentation.md、ui-flow/navigation.md；正式素材核对 docs/assets/README.md、production-assets.md 中 icons-atlas。
- 实现：默认收起，M切换、Esc或×收起；右上「地图 M」复用正式图集第12格书册与笔圆章，无新增图片。开启后浮于菜单下方，随桌面视窗调整宽度。保留位置、交互点、下一出口、目标追踪；开关为内存界面状态，HUD重绘保留；刷新恢复默认收起。对话、转场、战斗、菜单占用不打开；忽略文本编辑、组合键和重复按键。操作说明和缓存版本同步。
- 素材采用：沿用已登记 icons-atlas 与当前正式场景；无替换或弃用。
- 验证：三份修改JS node --check 通过；python3 tools_assets/check_production.py 通过，396条，0错误；git diff --check通过。
- 浏览器真实交互（第一章隔离试玩存档）：刷新默认无图、右上地图M；M打开/再次M关闭；Esc关闭；图标点击打开；×关闭；B打开行囊时M保持行囊，关闭行囊后地图仍收起。最终页面错误/警告日志为空。最终截图 evidence/2026-10-05-map-toggle/open.png。
- 验证边界：本轮未重跑全章剧情或战斗；文本编辑/长按/组合键及对话守卫为代码核对，未逐项做浏览器触发测试。浏览器只读evaluate无法访问运行全局，未以该方式核对存档；没有将其计为成功测试。
- 状态：本地完成；未提交Git，未推送，未线上发布。
