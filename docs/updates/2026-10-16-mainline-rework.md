# 2026-10-16 培养模式进城前主线 13 场换新台词

- 来源：文档库 `docs/design/scripts/pre-xiangyang.json` 返工（见文档库同日更新记录 `2026-10-16-mainline-rework.md`），已用 `tools_scene/qihe/build_pre_xiangyang_scripts.py` 重新生成 `js/qh-mode-cultivation-scripts.js`。
- 构建脚本：剧本台词带 `mood` 字段时直接用作运行表情（返工稿的表情只在情绪转折处标）。
- `js/qh-mode-cultivation-household.js`：gy_m02、gy_m08、gy_y02、gy_m09 的关系替换台词（REL_ALT）改为对应新句子。
- 验证：`verify_banter` 通过。`verify_household`（年度模拟里 gy_m09 没播）和 `verify_chapter`（“先完成拜师面”）失败，换回旧剧本也一样失败，与这次返工无关，应是今天别处的改动引起，未处理。
