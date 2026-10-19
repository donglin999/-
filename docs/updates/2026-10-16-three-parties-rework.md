# 2026-10-16 三方对证返工、进城前版补表情、在线预览发布

## 1. 主线两版取舍（用户授权由 Claude 决定）

- 游戏以 10-13 采用的“进城前完善版”为准：gy_m02/m03/m06/m07/m08（汉皋、祁老、义诊棚、裴知古同行）。文档库 `pre-xiangyang.json` 里同 id 的返工稿标为 `superseded-by-pre-hangao`，不播出。
- 进城前版修了两处凑约束的句子：“先有一个能问的人”里萧白那句“哪句是亲眼见的，也分开问”；徐令仪来信里的“不能写成赔清了”。
- **补回演出**：进城前版接管的场次里，有 9 场在游戏里没有任何表情（拜师面、初识心法、竹径的狼、出门前的考校、托你带一句话、M-02/03/06/07/08）。按“只在情绪转折处标”补了 91 句表情。
- **补回“初识心法”睡着那一幕**（10-11 试玩时用户要求的睡着 Q 版）：周砚说“先别盯，歇一歇”之后，萧白数着呼吸睡着，师父让给他披衣；一个时辰后醒来，接原句“能把这点急性子收住，就不一样了”。
- 来源：文档库 `docs/design/scripts/chapter-two-dialogue.json`，已用 `tools_story/build_pre_hangao_runtime.py` 重建 `js/qh-pre-hangao-data.js`。

## 2. 三方对证返工（`js/qihe-representatives.js`、`js/qihe-chapter.js`）

- 按剧情规范重写：设计简报在文档库 `docs/design/scripts/briefs/opening-three-parties-brief.json`，MiniMax 起草，人工改定后交独立审读，又按审读意见改了一轮。
- 范围：徐令仪上门、装卸路、第三夜侧口、次日对证、是否说出宋先生、三人认错、村里闲谈与初次接触、对证记录。第三夜起火的演出（画面 + 简短说明）保持原样。
- 主要变化：
  - 删去“署名、分开记、注明来源、核实、记责、复核”式台词，三人改按各自口吻说话：徐令仪讲道理、会自嘲（“我信的是纸。如今看来，纸比人会说话。”），岑霜带调笑、护短但认账，沈雁回先问具体时辰。
  - 动作旁白改为萧白心里话或台词；时间地点只保留字幕。
  - 补时间线：三家的附页都是“今天午后才补来”，解释为什么同一时辰撞到同一个口子。陆衡改为去邻村催车，不再像是他把三家叫来。
  - 沈雁回第二天就说清附页写着续脉散“已经验过、能延寿”，和次日的对证接得上。徐令仪改说“至少现在不在叶家”，不和夹层里的空印子矛盾。
  - 地点统一叫“装卸侧口”。
- 事件顺序、选项、存档事实（`evidence` 对象、`told_about_stranger` 等）未改。测试按原文引用的句子大多保留，只有一句改了说法，测试同步更新（`verify_stranger`：“她临走前多看了我一眼”）。

## 3. 测试

- `verify_household`：拜师面开头不再有时间卡；城门段改为 hg_road→hg_gate；来信正文不算旁白；切磋成长按用户认可的现值（输一场二师叔约 +11）。现 33 项全过。
- `verify_chapter` 9 项全过；`verify_saves`、`verify_banter`、`verify_startup` 通过。
- 仍失败、改动前后完全一样：
  - `verify_stranger`、`verify_cg_direction`、`verify_representatives`、`verify_relationships`：其中前两项卡在测试环境的假图片没有尺寸（“领队动作表尺寸不符”），实际图片是 6720×324，尺寸正确。
  - `verify_faction_contacts`、`verify_outsiders`、`verify_jianghu_ui`。
- 浏览器 8792 隔离验收（`?chapterPresentationReview=refuge-*`）：对证到进培养全程跑通，事实写入正确，控制台无报错；第一天、第二天（数过人、没数过人两种存档）逐句核对。
- `story_lint --scene opening`：三方对证没有“需处理”项；约束式台词从 25 句降到 2 句，这 2 句只是字面命中（“同意”、底单）。

## 4. 在线预览

- 地址：<https://qihe.luotuo-36x.pages.dev/#qihe-map>（Cloudflare Pages 项目 `luotuo` 的预览分支 `qihe`，本次部署 <https://5c87ee6d.luotuo-36x.pages.dev>）。首页 luotuo-36x.pages.dev 上原有的襄阳片段未动。
- 构建：`node scripts/build-pages.cjs`，素材检查通过；`dist/` 共 1556 个文件、982MB。
- `assets/audio/bgm_qh_cultivation_v5_short.wav` 原为 30MB（48kHz、24 位），超过 Pages 单文件 25MB 上限。**只在 `dist/` 里**转成 44.1kHz、16 位（18MB），文件名和格式不变，源素材未动。以后每次构建都要重做这一步，或把源文件换成小一点的格式。
- 线上核对：新脚本已生效（三方对证为新台词）；开场预载里最后 19 张地图/立绘（72MB）逐个用 curl 下载，全部 200，共 42 秒。
- 未完成的核对：内置浏览器面板和线上的 HTTP/3 连接会僵住，停在加载条约 93%；同一时刻 curl 正常，判断是面板环境问题，未能在面板里走完线上开场。
- 首次打开要先预载全部角色和地图图片（含旧襄阳原型的素材），网速一般时要等几分钟；之后有缓存会快一些。

### 2026-10-17 补：主地址也换成当前版本

- 用户打开的是不带 `qihe.` 的主地址，上面是两周前的旧版（“襄阳风云”）。同一份 `dist/` 已发布到 Production（`main`），部署 <https://3e5087e7.luotuo-36x.pages.dev>，复用已上传的 1556 个文件。
- 现在 <https://luotuo-36x.pages.dev/> 和 <https://qihe.luotuo-36x.pages.dev/> 都是当前栖河试玩版。旧的襄阳原型部署（cb03dd74、03d22c8c）还在 Cloudflare 的部署记录里，可以在控制台回滚。
