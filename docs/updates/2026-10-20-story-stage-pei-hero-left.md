# 2026-10-20 Q 版剧场：知古缩放、主角默认站左、立绘动感

状态：现行　最后核对：2026-10-20

**需求**（用户）：知古的 Q 版立绘比别人大一圈，查原因并修正，出对比图；剧场里主角位置没有规律（知古出场时萧白在右边），没有特殊原因时主角应在左边；试一下用横移、斜角拖拽等给立绘加动感（如挨打时快速平移有逃跑感），先测试，效果确认后再决定是否写进验收标准。

## 改动

1. **知古缩放**。原因：站位脚本按“脸一样高”统一缩放，知古这套图的脸只占图高 18.4%（其他人 22%～26%），于是被放大到 109.78%，头发、肩、胸前的书跟着变大。人工核过的脸框锚点没有量错。处理：`tools_scene/qihe/build_actor_layout.py` 新增 `FACE_SCALE = {'pei': 0.88}`，重新生成 `js/qh-mode-cultivation-actors.css` 和 `docs/assets/cultivation-actor-layout.json`。知古常态 109.78% → 96.61%（选择画面 95.11% → 83.70%），各表情档同比例；其他人数值不变。“下缘够不到底栏”检查仍为空。
   - 重跑脚本时顺带去掉了 `hero_short[data-mood="sleep"]` 的两条站位：对应的图已在 2026-10-19 尾部清理时归档，正式目录里没有这张图。
2. **主角默认站左**。原因：`composition` 直接按剧情 `cast` 的顺序排站位，而大部分剧情把先生／来客写在前面（如 `gn_lamp` 是 `['pei','hero']`），萧白就站到了右边。处理：`js/qh-mode-cultivation-story.js` 的 `composition` 先把萧白（含 hero_short/mid/long）挪到第一位，其他人保持 `cast` 顺序；需要萧白站右的剧情可在定义里写 `heroSide:'right'`（目前没有剧情用）。三人以上时“说话人＋萧白＋主角人物进大图，其余进头像栏”的规则不变。
3. **立绘动感试验**（只在本机评审，不进正式剧情、不写进验收标准）：新增 `js/qh-story-motion-review.js`，入口 `?uiReview=1&cultivationScene=<剧情id>&storyMotion=1`。右下角面板可选“说话人／左边／右边”，试 9 个动作：挨打后撤、吓得逃开、吓一跳、上前一步、被拖走（斜角）、发抖、泄气、点头、从侧边登场；“按表情自动”会在每句台词出现时按说话人表情挑动作，看连起来的节奏。动作只用 CSS 单项 `translate／rotate／scale`，不覆盖站位用的 `transform`。已登记到 `scripts/build-pages.cjs` 的 `REVIEW_SCRIPTS`（脚本）和 `REVIEW_PARAMS`（`storyMotion`）。
4. `index.html` 缓存版本：`qh-mode-cultivation-actors.css?v=20261020-pei1`、`qh-mode-cultivation-story.js?v=20261020-heroleft1`，并加载上面的评审脚本。

## 核对的文档

`docs/design/qihe-map/expansion/guiyun-household.md`（立绘站位一条，已补 `FACE_SCALE` 和左右站位规则）、`AGENTS.md`、规则登记表 R-工作区-01、R-清理-02。

## 验证

- 站位脚本：未改动的脚本重跑结果与现有 CSS 一致（只差已归档的 sleep 两条），确认改后只有 `pei` 的规则变化。
- `node` 调 `composition`：`['pei','hero']` → 萧白、知古；`['lu','zhou','hero','ye']` → 萧白、陆衡、周砚，叶蘅进头像栏；`heroSide:'right'` 时萧白在最右。
- 用真实的 `qh-mode-cultivation-story.css`、新旧 `actors.css`、`render()` 和正式立绘，在无头 Chromium 里按 1280×720 渲染 `gn_lamp` 首句截图对比；动作逐帧录了动画。证据：`docs/updates/evidence/2026-10-20-story-stage/`。这是**简化外壳里的渲染**（没有底栏、背景用纯色），**不是完整游戏流程的浏览器验收**。
- `python3 tools_assets/check_production.py`：pass（932 项）。`python3 ../xiaojianghu/tools_docs/check_docs.py`：过时说法 0、死链 0。
- `tests/guiyun-performance.test.cjs`：第 37 行地点断言（期望 `herb_garden`）失败，改动前的版本同样失败，与本次无关；它前面的 `composition` 断言通过。`tests/guiyun-performance-bounds.test.cjs`（Playwright + 本机 8792）未执行：需在 Mac 上开服务运行。

## 第二轮：立绘动感采用、知古登场重排

**需求**（用户）：“这个动感实验可以的”，按方案调整文档；回到知古那段剧情重新调整，并看进游戏后的体验。

- **文档**：`xiaojianghu/docs/design/dialogue-staging.md` 新增「立绘动感」一节（9 个动作、方向约定、`motion` 写法、一句一个／一场 2～5 处等用法规则、验收），并写明 Q 版剧场同样按“主角左位”；`story-writing.md` 第二节补第 6 种手段；`story-presentation.md` 第 1 节写明立绘动感不算专属动作；项目技能 `.claude/skills/story-writing/SKILL.md` 同步一句。
- **运行**：9 个动作的关键帧从评审脚本移进正式样式 `js/qh-mode-cultivation-story.css`（含“减少动态效果”时关闭）；`render()` 读台词上的 `motion`（字符串＝说话人；`{who,move}`；`who:'duo'`＝双人图），选项画面和同句重绘不重放。评审脚本 `qh-story-motion-review.js` 只保留手动面板。萧白独白也站左位（`data-solo="hero"`），下一句对方出场时不再从中间跳到左边。
- **知古登场 `gn_lamp`**（剧情源 `xiaojianghu/docs/design/scripts/chapter-two-dialogue.json`，`tools_story/build_pre_hangao_runtime.py` 重编 `js/qh-pre-hangao-data.js`；台词一字未改）：裴述开门 `enter`；托付扶梯子 `nod`；“……你不是我爹。”双人图 `startle`；“我、我下来。……对不住”知古 `slump`；“我叫裴知古。”知古 `step`。源文件只多了这 5 处。
- **缓存版本**：`qh-mode-cultivation-story.js/css?v=20261020-motion2`、`qh-pre-hangao-data.js?v=20261020-motion1`、`qh-story-motion-review.js?v=20261020-m2`。

**验证**：`tests/pre-hangao-runtime.test.cjs` 8/8 通过；`tests/cultivation-rework.test.cjs` 在 `gy_m04-intro-01-c694a7` 断言失败，改动前同样失败。用编译后的真实 `gn_lamp` 数据（扶梯分支）逐句走真实 `render()`，书屋背景、正式立绘与双人图：22 句无脚本错误，5 处动作都落在对的人身上，萧白从独白到对话位置不变。证据：`evidence/2026-10-20-story-stage/gn_lamp_sheet.jpg`、`gn_lamp_motion.gif`。**仍是简化外壳，不是完整游戏流程验收**：本机 8792 本轮一直没有开，内置浏览器连不上。

**观察到、未改**：双人图是全身远景，切到它时人物比单人半身小很多，像镜头拉远；这两张还是试样（`art_sources/qversion-duo-gn-lamp-20261020/` 标为草稿），定稿时再决定是否改取景。

## 第三轮：在完整游戏里走 `gn_lamp`

**需求**（用户）：上一轮的检查没有底栏，不是正式游戏内容，要放在游戏里完整体验。

- **怎么跑的**：用户本机 8792 没开，内置浏览器连不上；把 `index.html`、`js/`、`assets/`（668MB）原样搬到云端工作区，用 `scripts/serve-current.py` 起 8792（身份核验通过，中央图哈希与登记一致），无头 Chromium 打开 `?uiReview=1&cultivationScene=gn_lamp`，像玩家一样点 ▾／选项，两条分支各走到结果画面，1280×720 录像，扶梯分支另看 1920×1080。搬运用的临时打包文件已删除。
- **字体**：Google 字体在云端被拦；正文用的思源黑／宋用同一字族的系统字体代替，标题用的书法字体会和本机不同。
- **结果**：两条分支各 25～26 步、无脚本错误；5 处动作都在对的台词、对的人身上；萧白全程左位不跳边；对白框不挡脸。
- **发现并修了两处**：
  1. 开场字幕卡“第二天 · 溪东”要点好几下才过（实测 5 下）：卡上的“继续”按钮是 0×0，只剩 ▾ 一个字形能点，多数点击落在卡片上没反应。改为按钮铺满整张卡（同对白气泡，点哪里都继续），▾ 位置不变。改后一次点击即过。`js/qh-mode-cultivation-story.css`。
  2. 结束画面突然从“躲在父亲身后”的双人图换成三张单人图，再说一遍“爹……”：结果画面传给 `render()` 的台词丢了 `duo`。改为带上 `duo`，结果画面保持双人图，收益框也不再压到知古身上。`js/qh-mode-cultivation.js`。
- **缓存版本**：`qh-mode-cultivation.js?v=20261020-duoresult1`、`qh-mode-cultivation-story.css?v=20261020-card1`。
- **证据**：`evidence/2026-10-20-story-stage/gn_lamp_ingame_wade.mp4`、`gn_lamp_ingame_count.mp4`、`gn_lamp_ingame_frames.png`。
- **仍存在、未改**：双人扶梯图是全身远景，从单人半身切过去人物明显变小（试样素材，定稿时再定取景）。

## 第四轮：“躲在父亲身后”要有萧白

**需求**（用户，附游戏截图）：“这里为什么没有主角对话，应该是对话才对”，“这里也要注意平齐大小统一”。

- **原因**：双人图只有一种用法，一出现就替换整个画面；而这三句是裴述在对萧白说话（“萧小兄弟往后路过……”），萧白却不在画面上。双人图又是全身远景，和单人半身立绘大小、脸线都对不上。
- **改动**：双人图新增“占一个站位”的用法：台词写 `duoCast`（图里是谁），双人图当作一个人站位，其余在场的人照常站，萧白仍在左边。`build_actor_layout.py` 新增 `DUO_FACES`，按图里裴述的脸（人工核对的锚点 y 0.117～0.33，知古半张脸被书挡住不作锚点）生成站位，和单人立绘同一套脸高、脸线；重跑后 CSS 只新增这张图的两条规则。`gn_lamp` 收尾三句（e07～e09）加 `duoCast:["peishu","pei"]`；选项画面、结果画面同样带上。扶梯子三句萧白本人在图里，保持整画面远景。规则写进 `dialogue-staging.md`。
- **游戏内复测**（云端同版本，1280×720，扶梯分支走到结果画面）：25 步、无脚本错误；萧白在左，双人图在右；萧白与裴述的脸中心都在 y≈361、脸高约 124px。证据：`evidence/2026-10-20-story-stage/gn_lamp_father_slot.png`。
- **缓存版本**：`qh-mode-cultivation-story.js`、`qh-mode-cultivation.js`、`qh-pre-hangao-data.js`、`qh-mode-cultivation-actors.css` 均为 `?v=20261020-duoslot1`。

## 第五轮：人物朝向

**需求**（用户）：“后面你还要注意是否人与人是面对的问题啊，像现在就是直接背向的（除非剧情需要）”。

- **发现**：培养 Q 版立绘几乎都画成脸朝画面右侧（萧白三种发型、周砚、师母、殷红缨、知古、裴述、莫松年、孟知微、照川来客），只有钟拙、方迟、陆衡朝左，小豆、小满、叶蘅、乡邻近正面。萧白默认站左也朝右，站右位的人就背对他。进城前 24 场：多人台词 305 句里 157 句背对，涉及 14 场。
- **规则与检查**：`dialogue-staging.md` 新增「人物朝向」（左位朝右或正面、右位朝左或正面；不镜像，因为右衽会变左衽；剧情需要背对写 `facingAway:true`）。新增朝向登记 `docs/assets/cultivation-actor-facing.json`（目视判定）和检查脚本 `tools_scene/qihe/check_facing.cjs`（用真实 `composition()` 逐句检查，背对或未登记时退出码 1）。
- **修正方式**：用户选“先试点知古一家”。批次 `art_sources/facing-left-pilot-20261020/`：知古、裴述各 7 张朝左表情档，加重出的“躲在父亲身后”（都朝左），共 15 张，提示词已存。云端和本机沙箱都连不上 302.AI（代理 403），由用户在 Mac 上双击 `run.command` 出图。

## 未完成

- ~~朝向试点与另外五位朝左版~~：2026-10-21 已出图、入库、接入，背对 0 句，见 `2026-10-21-facing-left.md`。
- 双人扶梯图的取景（全身远景，切换时人物变小），等试样定稿时决定。
- 用户本机 8792 上再看一遍（本轮是云端同版本复刻，标题书法字体与本机不同）。

**提交／发布**：本地完成；未提交 git（本机 worktree 在当前环境下读不到 git 元数据）；未发布。
