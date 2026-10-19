# 第一章局部火声

> 2026-10-06：三位主事人新稿沿火起至C1-04-20的范围已接入。新版图片节点以dataset.stage判定起火画面，兼容旧背景图；新增本地生命周期检查见tests/opening-fire-audio.test.cjs。下方WebAudio实测是历史证据，本轮不把它写作新版主观听验。[修订](../../design/opening-three-representatives.md)。

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）（原记：已接入独立第一章入口。只在 `C1-04` 的火起关键画面与 `stage=fire` 同时成立时启用；争夺图、两条救援、避难点、山居和其他旧场景不启用。）

## 合成与混音

- `js/chapter1-fire-audio.js` 使用本地 WebAudio 合成六秒循环：低频缓慢噪声与稀疏木柴噼啪。没有外部接口、付费调用、角色语音、铃声或尖叫。
- 高频截止 850Hz、低频截止 55Hz；主增益 0.055。对白面板显示或 `CharacterVoice.playing` 时自动降至 28%，目标增益 0.0154，以 120ms 平滑变化。
- 尊重现有 `__audio.muted` 和用户音频解锁状态。设备无法启动时安静失败，不阻断剧情；下次用户点击或按键可恢复被浏览器暂停的上下文。
- `clearCG()`、剧情保护 `finally`、隐藏当前关键画面、标签页隐藏、页面退出及 hash 更换都会停 source、断开音频节点并清除检查定时器。不会修改街景 `audio.js` 的音景表。

## 验证证据

运行 `node tools_audio/check_chapter1_fire.cjs http://127.0.0.1:8774`。独立浏览器上下文中进行真实 WebAudio graph 验证，结果写 `review/chapter1/fire-audio-check.json`：

- 上下文运行、source 活跃，实测增益约 0.0548。
- 打开真实对白 DOM 后实测增益约 0.0155。
- 现有静音按钮状态启用后增益 0。
- 隐藏 CG 后 `active=false`、`polling=false`、增益 0。

这份检查是手动设置隔离火起状态的音频生命周期检查；整章真实过场与主观音量听验应由最终验收记录另列，不能把图节点验证写成已听取所有对白。

验收可在第一章推进到灯台倒下之后读取 `Chapter1FireSound.status`，退出该 CG 后再读取；声音只跟随局部火起画面，不带到黎明避难点。
