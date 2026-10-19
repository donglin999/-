# 2026-10-05 行程面板缩小

- 需求：截图中的左侧行程面板和文字偏大，统一缩小。
- 工作区：xiaojianghu-legacy-prologue / 8792 / #qihe-map。
- 核对：项目AGENTS.md、设计入口、chapter-presentation.md、正式素材入口与icons-atlas登记；先更新第一章引导规格再改CSS。
- 改动：面板总宽180px，旧宽210px还不含内边距；padding从9/12降为6/9。标题11px（旧13），栏目与地点日期9px（旧11）；目标最多两行；J角标9px、减小边距；背景减淡。更新CSS缓存版本。未新增、替换或弃用素材。
- 浏览器：刷新当前第一章试玩页，实际computed样式为宽180px、padding6px 9px、目标11px、栏目/地点9px；截图确认当前目标和日期完整，无截断。截图 evidence/2026-10-05-compact-objective/result.png。
- 检查：正式素材396条通过，0错误；git diff --check通过。此轮为样式调整，未重跑剧情流程。
- 状态：本地完成，未提交、推送或线上发布。
