# 培养配乐V3：更欢快与减少乐段重复

- 需求：用户指出V2不够欢快、反复章节太多，要求借鉴逍遥谷重新生成。
- 核对：工作区legacy-prologue/8792；AGENTS、设计总目录、cultivation-bgm.md、素材README及正式清单、既有生成/检测脚本。
- 设计先更新：V3目标120 BPM、A/B/C三套旋律、D展开/E过渡、末段A′有限回顾；明确只换乐器不算新旋律，避免短音频循环拼接。
- 调研：再次查阅本传逍遥谷及季节曲索引；仍未取得可直接听析的原声，不宣称还原。核对ElevenLabs官方compose文档，确认music_v2_5使用composition_plan.chunks、计划模式不兼容prompt/music_length_ms/force_instrumental。
- 实现：既有生成/检测工具加入v3批次及可选composition-plan.json；校验分段总时长等于命令seconds；检测从计划总时长读取期望值。保留旧提示词生成路径。
- 生成：用户已有ElevenLabs接口，单次生成成功，请求music_v2_5，实际返回模型版本未知；来源/实际JSON输入/原件/试听完整保存在art_sources/qihe-cultivation-bgm-v3。
- 测试：新版生成与检测实际运行成功；120.032653秒、44.1kHz双声道MP3、约192kbps、-20.27 LUFS、-6.99dBTP；无超过0.5秒的-50dB以下静音。check_production.py检查317份、0错误。
- 验收限制：未实际听审，不以技术检查代替欢快程度、旋律重复或配器/BPM验收；不是最终无缝循环母带。
- 采用：V2记录用户要求整改并保留；V3仅候选，未改运行资源或正式清单，无浏览器运行改动。
- 状态：本地制作与技术检查完成；未Git提交；未线上发布。
