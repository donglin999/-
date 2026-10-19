# 第一章收尾：弃用归云谷地图，章末直接进入培养

- 用户需求与已确认方案：“归云谷暂时不需要重置，那个地图后面需要丢弃的，因为我的想法是后面直接进培养模式，不需要进地图的，剧情上这一块可以安排一下”。拜师方式：“自动拜师后，让师叔带着主角和女主熟悉环境和打好基础两个月，刚好过渡主角从短头发到长头发的流程和开始接触功法”；师叔选“另一位师叔”，经归云谷一家线核对设定确认为钟拙（二师叔、周砚师弟、拳掌传人）；呈现方式选“进培养前的过渡演出”。
- 分工：本会话负责第一章收尾（本记录）；“两个月打基础”过渡演出与第一年日程顺延交由“归云谷一家”线（会话“第二张宗门人物与剧情补充”，负责 qh-mode-cultivation* 与 guiyun-household.md），已转达用户原话与接口约定（第一章只调用 QiheCultivationBridge.enter()）。
- 工作区、运行入口：xiaojianghu-legacy-prologue / 8792。
- 核对的文档：AGENTS.md、docs/design/qihe-map/expansion/training.md、story.md、layout.md、implementation.md、guiyun-household.md、docs/updates/2026-10-07-guiyun-household.md。
- 设计页（先改）：training.md「第一章末 → 第二章首期」改为目标设计（不切地图、庭院背景演出、自动拜师、两月过渡由归云谷一家线负责）；layout.md 归云谷区块标弃用；implementation.md 章末行同步。
- 实际修改：
  - js/qihe-chapter.js：道别后不再 go('mountain')；新增 courtyard()（复用火灾 CG 的 qh-fire-cg 层，背景为已登记的 cultivation/bg_mountain_spring_v1.png）；mountainEnd 在庭院背景下依次演出原“安顿”“晚饭”对白（台词未改），章末存档后自动接 cultivationBegin；拜师对白同样在庭院背景下播放，结束后 QiheCultivationBridge.enter()；读档时 stage 为 mountain / ended 的旧存档自动续接；任务栏文案改为“第一章已结束 · J 进入第二章”。
  - js/qihe-navigation.js：导航图去掉 refuge↔mountain 连线与 mountain 出口；ended 阶段不再指向归云谷周砚。
  - js/qihe-expansion.js：接应院北侧“上山道路”出口保留——它在剧情上是“去处选择”（QiheChapter.routes）的触发点，不是去归云谷的传送（首次误删后被回归测试发现，已恢复）。归云谷场景定义与 NPC 保留但不再可达，作旧存档兜底。
  - index.html：qihe-chapter / qihe-navigation / qihe-expansion 版本号更新。
  - tools_scene/qihe/verify_chapter.cjs：章末断言由 ended 改为直接 cultivation（含 settle / meal / apprenticeship 事件），新增旧存档 mountain / ended 续接用例。
- 采用 / 弃用：归云谷地图（m_qh_mountain / m_qh_mountain_fg）不再进入，文件与登记保留，待用户确认丢弃后再处理；不做模块化整改。
- 验证：
  - node tools_scene/qihe/verify_chapter.cjs：9 项 PASS（含 old mountain save、old ended save）；node tools_scene/qihe/verify_household.cjs：10 项 PASS；node --check 三个 js 通过。
  - 应用内浏览器，独立存档 ?chapterPresentationReview=refuge-guiyunend（新键，不碰用户存档与其他会话审阅存档）：接应院对证 → 去处 → 道别 → 归云谷庭院背景“安顿”“晚饭” → “第一章 · 风起栖河结束。山居第一夜已保存。” → 次日拜师 → 自动进入培养（S.chapter=2、sect=guiyun、joined=true），庭院背景层正确移除，培养首月谷中消息正常；控制台无错误；用户存档 xjh.qihe-prologue.v2 未变化。
  - 未执行：两个月过渡演出（归云谷一家线负责，尚未实现）；真人从头通关第一章。
- 剩余事项：过渡演出与日程顺延（归云谷一家线已接手；先做剧情逻辑与对白，萧白长发形象待门派服饰风格定稿后补画）；归云谷地图文件是否正式弃用登记。
- 状态：本地修改，未提交，未发布线上。
