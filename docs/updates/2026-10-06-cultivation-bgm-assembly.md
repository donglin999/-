# 培养配乐短开头版正式装配

## 需求与依据

用户确认“就用这个了”，采用V5短开头《小院新晴》，不再次生成或加工。核对 AGENTS.md、设计总目录、cultivation-bgm.md、chapter-presentation.md、docs/audio.md、docs/assets/README.md 与正式清单。

## 改动与采用

- 获批WAV原样复制到 assets/audio/bgm_qh_cultivation_v5_short.wav，SHA256 fa57f7cd7c7340b91007cace312bcd70bd3ff4cf4d9ca95bad6a54c3bb47674f。
- 音景接入实际培养模式及山居内武学面板；第一章首夜留白，外出切当地配乐，战斗返回恢复培养播放位置。
- 正式清单、音频路径映射、源码缓存版本、设计页、来源记录已同步。旧版本均保留，仅短开头版采用。
- 入库工具发现此前会把PNG原稿覆盖已转码WEBP成品，并把非WEBP加入图像映射。本轮纠正为校验并保留已经验收的成品，异常中止。受影响两张火场CG按原编码恢复，逐字节哈希与更新前相同；最终既有396项路径/哈希均未变。

## 验证

- verify_audio.cjs：通过。覆盖手势门禁、日常连续、对话与语音压低、战斗结算、培养WAV、首夜静默、武学菜单续播、战斗返回、静音、后台暂停、109秒循环及外出音景；这是模拟音频状态测试。
- 浏览器隔离 handoff 入口：通过实际交接台词进入培养，WAV readyState=4、duration=108.741104、paused=false；切换招式菜单仍连续；静音停在35.097728秒，恢复后从该位置续播。控制台无warn/error。浏览器未实际进行战斗，战斗返回由上面的状态测试覆盖。
- 浏览器证据：art_sources/qihe-cultivation-bgm-v5-short-intro/browser-playback.json 与 runtime.png。
- check_production.py：397项全部通过。新增1首配乐；396项既有素材路径/哈希不变。
- 未宣称无缝音乐小节循环；本轮不再改用户确认的音频内容。

## 状态

本地已装配并验收。未 Git 提交、未推送、未线上发布。
