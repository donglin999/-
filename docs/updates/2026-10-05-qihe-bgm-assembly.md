# 栖河V2配乐装配

- 需求：用户明确要求装配现有V2；不额外生成新曲。
- 工作区/入口：xiaojianghu-legacy-prologue / 8792 / #qihe-map；battleReview=road独立战斗入口已刷新验证。
- 核对：AGENTS、设计总目录、BGM设计/制作页、docs/audio.md、素材README和production-assets登记。
- 采用：bgm_qh_daily_v2（59.110秒）与bgm_qh_battle_v2（59.117秒）；逐字节复制已交付V2试听，原始生成与试听原件保留，V1继续否决。
- 同步：正式文件、JSON/Markdown登记、production-assets.js音频映射、来源请求/技术报告、index缓存版本、audio.js播放逻辑；整理工具保留原采用证据并产生音频映射，检查器增加音频映射一致性检查。
- 行为：日常跨场景续播；每场战斗重启；结算淡出；返回按剧情恢复或留白；对话/面板压低；静音/后台保留位置；单实例循环，不叠鼓。语音压低提供嵌套接口，尚无语音播放器接线。
- 验证：verify_audio.cjs通过，覆盖首次手势、跨地图、文字/嵌套语音压低、战斗、超过60秒循环、静音、后台、结算、恢复、起火留白、重试及快速切换。采用Audio模拟，不替代听审。
- 浏览器：实际村内与战斗均readyState=4、paused=false、播放时间推进；日常M暂停在26.84秒，恢复到26.94秒，未从头开始；两页错误日志为空。证据art_sources/qihe-bgm-v2/browser-playback.json及battle-installed.jpg。未声称人工听审或实机全战斗结算路径通过。
- 正式检查：check_production.py通过，317份资源，0错误；organize_assets.py --adopt-reviewed成功、图片解码0错误。
- 限制：当前59秒样段单实例循环+60毫秒边缘包络，不是重新编排的小节无缝母带；10分钟主观疲劳听审尚未完成。
- 状态：本地装配完成；未Git提交；未线上发布。
