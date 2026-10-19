# 培养BGM V2：匹配Q版的欢快方向

- 需求：用户听过V1后要求更欢快，配合Q版形象。
- 工作区/入口：xiaojianghu-legacy-prologue / 8792；核对AGENTS、设计总目录、培养配乐设计、素材README及正式清单、既有生成与检测流程。
- 设计先更新：cultivation-bgm.md改为108 BPM目标，短句竹笛与拨弦呼应、轻巧切分、弦乐拨奏和轻手鼓；保持中音区、控制高频与打击乐密度。
- 制作：art_sources/qihe-cultivation-bgm-v2保存完整提示词、请求记录、原件及试听。使用用户已有ElevenLabs接口，请求music_v2_5，返回实际版本未知；单次生成成功。重新生成编曲，未加速或覆盖V1。
- 检测：check_qihe_bgm.py --cultivation --version v2通过；120.032653秒、44.1kHz双声道MP3/约192kbps、-20.26 LUFS、-7.32 dBTP；无超过0.5秒的-50dB以下静音；本次无需裁切。V1/V2源哈希不同。
- 采用/弃用：V1标为用户要求调整，保留原件；V2为试听候选。未进行实际听感、BPM/配器或无缝循环验收，未装配运行资源，未做浏览器验收。
- 正式清单检查：check_production.py通过，317份素材，0错误。
- 状态：本地新版生成与技术检查完成；未Git提交；未线上发布。
