# 项目协作规则：文档与正式素材核对

状态：现行　最后核对：2026-10-19

适用本工作区所有更新（剧情、系统、地图、角色、UI、音频、素材及发布）。

跨工作区的规则（生图、特效、剧情、发布、清理等）只在 `../xiaojianghu/docs/rules/规则登记表.md` 写正文，按编号引用；与本页冲突时以登记表为准。发布构建会跑 `python3 ../xiaojianghu/tools_docs/check_docs.py`。

## 每次更新的固定步骤

1. 更新前先确认工作区、运行入口和用户已确认方案。当前栖河版本属于 xiaojianghu-legacy-prologue / 8792；四向中央图为 m_qh_central。不得从兄弟工作区复制方案并默认它已被采用。
   默认游戏只用`python3 scripts/serve-current.py`或`启动当前游戏.command`，并用`--check`核验固定8792入口。运行身份及入口守卫的规则见`docs/design/runtime-entry.md`；不得另起端口替代当前origin，历史游戏必须显式预览。
2. 阅读 docs/design/README.md 中负责本次改动的设计页，以及 docs/assets/README.md、production-assets.md；核对现状、目标设计、候选、弃用状态。遇到互相矛盾的记录先查代码及已确认来源，纠正记录后再推进。
3. 涉及新设计时先更新负责该事实的文档，再实现。只改实现细节时同步修订对应当前实现记录。不要让多个文档分别维护冲突版本。
4. 新素材先进入 art_sources/批次；参考图须来自正式清单指定原件。生成完成后记录实际尺寸与实际模型，人工核对布局、风格与用途，再登记采用。不得按名称、版本数字或修改时间自动选用。
5. 采用或替换时同步正式文件、production-assets.json、production-assets.md、production-assets.js、实际代码引用、来源与验收证据。旧原件保留；无引用不等于可以删除。
6. 每轮在 docs/updates/ 写一份更新记录，包含需求、改动、核对的文档、采用/弃用、验证结果与证据、未完成项、是否提交及是否线上发布。测试未执行或失败必须如实记录；函数测试不能写成浏览器或美术验收通过。
7. 完成后执行 python3 tools_assets/check_production.py；涉及运行素材或交互时再验证对应浏览器流程。构建前检查必须通过。不能用刷新哈希或复制原稿掩盖检查失败，应先确定变更确实对应已审查设计。
8. 最终回复明确本地完成、提交、发布的实际状态，三者分开记录。

出图、取参考前先查 docs/assets/deprecated-tests.md（弃用／不启用的测试方法清单）；批次 README 或 DEPRECATED.md 标着未采用／试点／测试／候选／预览／撤回的，不得作画风、规格或流程参考，被显式预览参数加载也不等于已采用。

评审／测试入口（`battleReview`、`storyReview`、`uiReview`、`chapterPresentationReview` 等）只供本机 8792；发布包由 `scripts/build-pages.cjs` 剔除评审脚本并让这些参数失效。新增评审脚本或 URL 开关时同步登记到构建脚本的 `REVIEW_SCRIPTS`／`REVIEW_PARAMS`。被弃用的演示或测试入口要整体移出（2026-10-19 起襄阳演示 `#street`/`#xiangyang` 等已归档），不要只藏起入口。

正式资源唯一入口：docs/assets/production-assets.md。开发核对流程：docs/update-workflow.md。
