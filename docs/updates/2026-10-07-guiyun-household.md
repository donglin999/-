# 2026-10-07 · 归云谷一家接入第二章培养

## 需求与已确认方案
用户：师门人物太少，补有个性的人物、剧情和宗门氛围，补师母与身材很好的女师叔；看过立绘后确认殷红缨用 B 版、可入队可结缘、接受常住人数，要求接入游戏并优化培养阶段剧情日程。过程中又要求：萧白培养形象（白袍红腰带马尾）与他人不统一，按《侠客风云传》养成 Q 版画风统一重画、生动夸张。工作区 xiaojianghu-legacy-prologue，入口 8792。

## 核对的文档
AGENTS.md、update-workflow、production-assets、expansion/training、relationships；文档库 protagonist-sect、cast-visuals、faction-attire、mountain-cultivation-events、cultivation-q-portraits、cultivation-q-generation-standard、art-pipeline 出图约定。

## 实际修改
- 设定：文档库 `docs/design/guiyun-household.md` 标为已确认；本工作区新增接入合同 `docs/design/qihe-map/expansion/guiyun-household.md`（人物、全年日程、关系门槛、入队与结缘）。
- 代码：新增 `js/qh-mode-cultivation-household.js`（14 段师门剧情，8 段必看自动开场、6 段闲逛可选），复用来客对白引擎；`visitors.js` 合并剧情定义；`relations.js` 新增江采薇、殷红缨及剧情关系增量（第三道门可到托付）；`core.js` 新增 `dueStory`、两位收件人、殷红缨入队写入名册；`qh-mode-cultivation.js` 自动开场、谷中日程面板、自动剧情不进闲逛列表；`story.js/css` 新人物形象与四人同框布局；`mail.js` 两张邮箱立绘；`presentation.js` 头像改用新萧白；新增 `js/qihe-guiyun-household-art.js` 注册殷红缨队友、精灵与对白立绘；`qihe-ui-model.js` 队伍立绘路径改走正式映射。
- 剧情内容按设定落地：拜师面、家规三条、夜归人、拳剑之争、师母账本、接风、回岚步与鹅、叶青的手、大师兄负伤、代师出行、中秋家宴、小豆下山、师母生辰、年终考校、除夕守岁。中秋改送冬衣夹袄（练衣按衣装规范入门即换）。

## 素材
批次 `art_sources/guiyun-household-20261007/`（提示词、参考图、process.py、adopt.py、manifest.json）。通道均为 codex exec 内置 image_gen，提示词含 gpt-image-2.5 行，实际模型未确认。
- 采用 19 项：household-v1 剧情 Q 版 10 张（萧白、周砚、叶蘅、江采薇、殷红缨、钟拙、方迟、卢小豆、周小满、鹅；侠客风云传式夸张画风，用户提供的风格参考 `xiaojianghu/art_sources/cultivation_q_20261003/references/user-style.png`）；殷红缨对白立绘 6 态 480×640；殷红缨四向静态像素精灵 720×1128；邮箱带背景立绘 2 张。
- 未采用（保留为历史候选）：`q/` 首版写实 Q 版 7 张、`hero/` `unify/` 中途停止的统一稿。
- 旧 hero_listen_v2、story-v6/zhou、ye_tidy_v2 原件保留，仅培养对白不再引用；陆衡、乡邻、来客 Q 图未改。

## 验证
- `node tools_scene/qihe/verify_household.cjs`：10 项通过（全年日程与窗口、避开送药与整月历练、全部选项脚本、结缘门槛、两条入队路径、关系上限、剧情幂等、存档续读）。
- `verify_relationships.cjs`：19 项通过（已扩为 6 位往来人物、18 种礼物回复）；`verify_chapter.cjs`：7 项通过。
- `python3 tools_assets/check_production.py`：532 项、0 错误。
- 浏览器 8792 `?chapterPresentationReview=handoff` 隔离存档（未碰普通存档）：第一章交接→培养首月消息与谷中日程→拜师面自动开场、选项、关系 +5、刷新后中途续读；快进至八月中旬，中秋四人同框截图（browser/mid-autumn-4cast.jpg），四个选项不遮挡；控制台无错误；殷红缨入队、名册、立绘与精灵资源 200。
- 未做：殷红缨实战战斗浏览器验收（仅资源与切片注册检查）；各事件逐一实机截图；1920×1080 与 1440×900 版面。

## 未完成
- 培养练功动画（v5–v10 约 30 张动作图集）仍是旧萧白形象，需按新画风重画。
- 殷红缨专属战斗动作表、个人篇与结缘后续剧情；招募名单补登记。
- 第二、三年师门剧情。

本地完成；未 Git 提交；未发布。
