# 归云谷对白口语与演出同步

用户在当前 8792 培养试玩反馈人物漏场、台词生硬。文档库只更新负责的原稿，不作为栖河运行入口。

- `docs/design/scripts/pre-xiangyang.json` 改写 91 句 M/Z/Y/L 主线，保持条件、行 ID、选择、事实、费用、日期与合流；`pre-xiangyang-visitors.md` 同步 32 句来客对白，保留身份、见闻与分支。
- `tools_story/build_pre_xiangyang_scripts.py` 同步可读剧本、配音规划、review；最终 --check 通过、输出差异 0。86 场、1087 条、108 条拟配音，实际音频请求与绑定写入均 0，不宣称新文字已配音。
- 兄弟工作区 `xiaojianghu-legacy-prologue/tools_scene/qihe/build_pre_xiangyang_scripts.py` 生成当前主线。漏场、入退场、锚点、透明素材与真实游戏验证在那里完成；90 段培养全量和日常对白结果见该处 `docs/updates/2026-10-12-guiyun-performance-fix.md`。
- 逐句差异在兄弟工作区 `review/guiyun-performance-fix-20261012/dialogue-changes.json`、`visitor-dialogue-changes.json`。

本地原稿及生成文档完成，未 Git 提交、未推送、未线上发布。
