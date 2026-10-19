# 主角与普通路人造型辨识度候选

- 用户需求：主角与路人区分度低，要求按本会话建议生成。方案先做主角、农民、商人、老人的站立同屏比较。
- 工作区：xiaojianghu-legacy-prologue，当前游戏入口 8792；本轮为本地候选生图。
- 核对：docs/design/README.md、docs/assets/README.md、production-assets.md、docs/update-workflow.md、本工作区 AGENTS.md；文档库 ai-onboarding.md、art-pipeline.md、角色类型、质量和衣装规范；hero-pixel-design-20261009 的正面 B 选择记录。
- 实际新增：art_sources/character-distinction-20261009/，含制作说明、完整提示词、两张参考原件、候选原稿及来源记录。使用 imagegen 技能、内置 image_gen；按规定在提示词要求 gpt-image-2.5，但实际型号未披露。原稿为 1672×941 RGB。
- 造型：主角保留定稿的蓝灰短衣与黑短发；普通职业示例分别用草帽短工衣、圆帽长背心、灰发微驼长袍区分。示例不冒充已有具名 NPC 定妆。
- 采用状态：候选，等待用户审阅；没有替换正式素材或运行引用，旧原件保留。
- 目视核对：四人人体完整，头饰、衣长、体态和大色块可区分；场景地面纹理仍较密。原图不是精确90格生产表，未做网格量测。
- 检查：python3 tools_assets/check_production.py 通过，671 项、无错误。没有运行变更，因此未做浏览器验收；不能将正式登记检查写成候选美术通过。
- 未完成项：用户造型确认、透明单体、严格像素网格、四向、走跑动画及游戏接入均未在本轮制作。
- 本地完成；未 Git 提交；未线上发布。
