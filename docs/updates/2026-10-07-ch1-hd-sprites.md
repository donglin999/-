# 第一章叶蘅、主角重绘为 82 规格精灵（站立 + 走路 + 奔跑）

- 需求：用户认为人物精灵粗糙、像素不均一；确认以岑霜故事版精灵（约 82 像素）为统一标准，叶蘅与主角重新生成（否决文档库旧 v4 素材），做走路与奔跑帧，测试通过后汇报。生图按用户要求尽量走 codex exec。
- 核对：AGENTS.md、docs/assets/README.md、production-assets.md/json、qihe-representatives-adoption-20261007 批次（岑霜等故事版精灵规格）、引擎 drawChar / sliceSheets / walkSpec / motionAnchor 实现、qihe-characters.js（现代装 / 古装切换）。
- 改动：
  - 新批次 art_sources/character-hd-pilot-20261007：codex 原图、提示词、process82.py、motion_build.py、motion/gen.sh、adopt.py、对比图，验收记录 motion/README.md。
  - 正式文件 assets/production/characters/：s_ye_hd_20261007、s_ye_walk_hd_20261007、s_ye_run_hd_20261007、s_qh_hero_initial_hd_20261007、s_qh_hero_initial_walk_hd_20261007、s_qh_hero_initial_run_hd_20261007。
  - 正式清单：s_ye、s_qh_hero_initial 改指新站立表（记 supersedes，旧文件保留）；新增 4 条走路 / 奔跑表；旧的走路 / 奔跑 / 待机条目保留（运行时不再加载）。production-assets.json / .md / js 定点修改。
  - 新增 js/qihe-ch1-hd-sprites.js（index.html 中紧跟 qihe-char-scale.js）：两人的 sheet、walk、run、motionAnchor（body 246 / foot 264）、scale（叶蘅 0.85、主角 0.905），移除主角旧待机表。
  - js/scene.js：叶蘅有专用动作表时不再叠画长裙补腿。
  - js/bui.js：战斗头像无立绘兜底时，带脚点数据的 282 高精灵按实际头顶与身高裁头像（原固定比例会只裁到头发）。
  - index.html：production-assets.js、scene.js、bui.js 版本号更新，加载新脚本。
- 采用 / 弃用：采用新精灵为叶蘅、古装主角的正式探索精灵。文档库 xiaojianghu 的 v4 系列经用户否决，未接入。旧精灵文件全部保留。
- 验证：见 art_sources/character-hd-pilot-20261007/motion/README.md。加载、四方向走跑、帧序与帧率、实际绘制所用表、32 组逐帧绘制、同屏尺寸、屋顶遮挡、药棚 NPC 与对话、战斗头像均在应用内浏览器检查；verify.cjs 回归通过；check_production.py pass（510 项）；node --check 通过；控制台错误 0。测试为脚本推进，用户亲手键盘手感未测。
- 未完成：现代装主角 opening_hero_modern 仍为旧精灵；第一章其余 NPC 仍为旧精灵；地图规范中成人身高 92 的硬参数尚未改版（本轮可见身高约 78–83）。
- 状态：本地修改，未提交，未发布线上。
