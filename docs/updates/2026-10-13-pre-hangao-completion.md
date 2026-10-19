# 汉皋入城前完整设计与预览交付

2026-10-13。本地完成，待用户审稿；未 Git 提交，未线上发布。

## 需求与范围

用户选择“先补齐完整设计、台词和演出方案，再看预览”，并要求继续完成中断工作。范围为归云谷安顿至第一年五月汉皋南门外，保持原短对白长度、小豆14岁及人物先获得信息再接话。正式游戏接入不在本轮范围。

设计权威在`xiaojianghu/docs/design/pre-hangao-completion-20261013/`；独立预览由`xiaojianghu-legacy-prologue/review/pre-hangao-completion-20261013/`承载，入口[8792评审页](http://127.0.0.1:8792/review/pre-hangao-completion-20261013/)。

## 交付与核对

- [总方案](../design/pre-hangao-completion-20261013/README.md)、[全量逐句稿](../design/pre-hangao-completion-20261013/dialogue.md)、[知古同行与见闻](../design/pre-hangao-completion-20261013/pei-and-handoff.md)、[演出清单](../design/pre-hangao-completion-20261013/staging.md)、[后续接入合同](../design/pre-hangao-completion-20261013/implementation.md)齐全。
- 40场既有事件完整收录，其中18场修订；新增善后信、寻父回复、装备核对、家人送行、半日路协作、城门交接6场。另有6类课程的首次、复习与进步短句。
- 知古固定3级加入模板与有效在队见闻分开；陌生、认识、问过残稿三版本互斥。剑、拳与未学外功路线都有对应考校与出行反馈。
- 续接中修正全量稿的署名信次序，补分镜旁席头像与接话人轮换，将送行场名改为“临行这一顿”，明确山路尚用灰盒。构建脚本现在同步所有预览文档，防止逐句稿与页面副本不同步。
- 核对了AI导入、文档与实现边界、事件排期、谷中书屋人物案、角色等级与动作合同、兄弟工作区协作/更新流程及正式素材登记。既有短稿保留编辑署名，不冒称MiniMax原始输出。
- 正式素材只作身份与分镜参考，没有新素材采用或替换；废弃Unity测试与未采用地图候选未用作参考。

## 验证与证据

以下命令在`xiaojianghu-legacy-prologue`执行：

```bash
python3 scripts/serve-current.py --check
python3 tools_story/build_pre_hangao_review.py
python3 tools_story/check_pre_hangao_review.py
node tests/pre-hangao-review-browser.cjs
python3 tools_assets/check_production.py
```

入口身份为`qihe-current` / 8792。构建46场、676条全条件文本块、6类课程。270组有效条件检查通过；新增场次均≤420字，四月底三段最大504字。浏览器核对46场阅读、75条分支路径、892句分镜，另检查知古三版本、考校三路线、送药三方法、陈伯三伤势、备剑两状态与步法依赖。

总方案、知古、演出、接入四页与6类课程可切换；五份Markdown副本与权威源一致。1440×1050/390×844阅读、分镜与文档页面无横向溢出。无页面错误/资源失败/写请求；隔离浏览器预置存储保留，未发生存储写入。957项正式素材核对通过。

中断前“close Pei”检查失败原因是测试要求双引号，而候选使用单引号；本轮改为检查“后来呢”的实际分支内容，并补知古熟悉版不得出现该回忆的断言。重跑已通过。

证据：[条件报告](../../../xiaojianghu-legacy-prologue/review/pre-hangao-completion-20261013/audit.json)、[浏览器报告](../../../xiaojianghu-legacy-prologue/review/pre-hangao-completion-20261013/browser-check.json)、[逐句阅读截图](../../../xiaojianghu-legacy-prologue/review/pre-hangao-completion-20261013/preview-reader.png)、[送行分镜](../../../xiaojianghu-legacy-prologue/review/pre-hangao-completion-20261013/preview-stage.png)、[手机分镜](../../../xiaojianghu-legacy-prologue/review/pre-hangao-completion-20261013/preview-mobile-stage.png)。已人工查看桌面阅读、知古/送行分镜和手机分镜截图；静态演出参考不算新动画或正式美术验收。

## 后续与状态

本轮完整设计与独立预览交付完成。汉皋场景、人物专用动作、知古队伍/书本/见闻事务、借用物、真实教学终止、配音与五月正式入口仍是后续制作事项，已逐项写入接入合同；本轮未进行正式游戏流程或存档迁移测试。

本地完成；未 Git 提交、推送或线上发布。
