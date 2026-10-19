# 2026-10-08 继承旧文档清理

## 需求

清理干扰开发的旧文档，并打开游戏验证，防止误删。主记录见主库 `docs/updates/2026-10-08-asset-doc-cleanup.md`。

## 改动

- 移出 22 篇文档到 `../_attic/2026-10-08/xiaojianghu-legacy-prologue/`（可用 `restore.sh` 还原）。
  - 20 篇是从主库继承、在本工作区从未修改过、与栖河无关的过期快照：`roadmap`、黑风寨两篇、`cast`、`delivery`、`exploration-containers`、`growth-combat`、`jianghu-icons`、`life-skills` 两篇、`party-pets`、`presentation`、`story`、`timeline`、`visual-acceptance`、`xiangyang-art/case/test`、`ye-appearance`、`ye-expression-prompts`。这些主题以主库为准。
  - 另外 2 篇是已被完全取代的提案：`ui-flow/art-v5.md`（V6 取代）和 `ui-flow/martial-quest-preview-v8.md`（V9 和 V10 取代）。
- 63 处链接改为指向主库同名文档；其余指向已删文档的链接改为纯文字并注明“（已删除）”。
- `docs/README.md` 页首加注：本页是继承的襄阳原型说明，并列出栖河的现行入口。
- `docs/assets/README.md`：把 10-07 tiled 中央图的段落标为历史，现以 10-08 modular 版为准。
- 未改代码、素材和正式登记。

## 有意保留

`battle-v2/v3`、`xiangyang-alley*`、`xiangyang-chapter`、`xiangyang-art-prompts`、`ye-routes` 都被代码注释或审计脚本引用，保留。

## 验证

`check_production.py` 改动前后都是 pass（624）；运行时静态引用缺失数不变；11 个 node 测试结果与改动前逐个一致（8 个原有失败）；8792 浏览器从标题页走到开场对白正常，0 个失败请求。

未提交，未发布。
