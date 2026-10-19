# 栖河 BGM：制作、提示词与验收

[音乐设计](bgm.md) · [正式资源入口](../../../assets/production-assets.md)

状态：现行　最后核对：2026-10-19（原记：V1两首样段已被用户否决，保留追溯、禁止采用。当前依据为[修订设计](bgm.md)与以下V2提示词。）

## V2当前生产任务（两首新版样段已生成）

原始各60秒，试听副本去掉约0.9秒尾部静音。日常59.110秒/-20.31 LUFS/-7.49 dBTP，战斗59.117秒/-18.26 LUFS/-6.27 dBTP；技术门槛通过；用户已要求装配并已接入，长期循环听审仍待实玩。

设计目标：日常温暖钢琴/木吉他/木管；战斗156 BPM目标、快速弦乐/铜管/贝斯/鼓组。共享四音动机限制取消。

[当前V2试听批次](../../../../art_sources/qihe-bgm-v2/README.md) · [技术测量](../../../../art_sources/qihe-bgm-v2/technical-review.json)。

- [日常实际提示词](../../../../art_sources/qihe-bgm-v2/daily-prompt.txt)
- [战斗实际提示词](../../../../art_sources/qihe-bgm-v2/battle-prompt.txt)

以下V1设计和提示词仅作历史记录，编码、响度、循环及游戏验收技术标准继续适用。

## 历史V1试听（已否决）

| 候选 | 时长 | 实测综合响度 | 实测真峰值 | 文件 |
| --- | --- | --- | --- | --- |
| 溪桥日暖 | 40.046秒 | -19.35 LUFS | -1.69 dBTP | 日常试听（已移入 _attic，不作参考） |
| 护路初锋 | 40.046秒 | -18.27 LUFS | -3.72 dBTP | 战斗试听（已移入 _attic，不作参考） |

使用已有ElevenLabs账户凭据；请求模型`music_v2_5`，返回头未提供实际模型版本。生成模式为纯音乐文字提示，未上传音频参考；共享动机、具体BPM、配器与无意外人声仍待听审，不能由提示词或强制纯音乐参数直接判通过。两份文件实际为44.1kHz双声道MP3，目标编码192kbps；原件保留，试听版按两次测量校准响度，属于有损源再编码。无超过0.5秒的低于-50dB静音片段，解码与响度门槛通过。

批次与请求记录（已移入 _attic，不作参考） · 技术检查JSON（已移入 _attic，不作参考） · [官方接口契约](https://elevenlabs.io/docs/api-reference/music/compose)。完整循环点仍为空，不把40秒样段当成完整循环，也尚未执行游戏内混音听审。

## 历史V1制作任务

| 候选ID | 目标 | 源批次（计划路径） |
| --- | --- | --- |
| `bgm_qh_daily_v1` | 《溪桥日暖》，日常主曲约123秒 | `art_sources/qihe-bgm-v1/` |
| `bgm_qh_battle_v1` | 《护路初锋》，战斗主曲约116秒 | 同上 |

先各制作30–45秒代表性样段：包含主奏、伴奏与留白，不能只有前奏。两首放在实际场景里试听后，再做完整循环。共享动机要用自己制作的短旋律音频或MIDI参考；仅靠两个文字提示不能保证音高与旋律一致。模型若不支持音频条件，后期编曲统一动机，不将“相似国风”当成同主题。

## 历史V1提示词（禁止继续用于新生成）

### 日常

> Original instrumental exploration music for a small Chinese wuxia village in an early-story pixel-art RPG. Warm sun on earthen paths, a wooden bridge, drying medicinal herbs, villagers going about ordinary work, and two young travelers slowly finding a place to stay. Intimate, grounded, gently curious, with a very small trace of uncertainty. Target 78 BPM, 4/4, G-centered Chinese pentatonic palette. Soft low-register bamboo flute in short breathing phrases, answered by warm mid-register guzheng; sparse pipa notes and restrained low bowed strings. Preserve the supplied original four-note motif G4 A4 D5 B4 when reference input is available, with spacious phrasing. Clear natural transients, soft controlled highs, modest room ambience, ample space for spoken dialogue. A flowing two-minute gameplay cue with a quiet variation and a return that can be edited into a seamless loop. No vocals, humming, choir, speech, bells, wind chimes, metallic jingles, busy high flute, lush cinematic climax, heavy drums, EDM, sound effects, birds or water baked into the music. No quotation of an existing soundtrack.

### 战斗

> Original instrumental turn-based battle music for the same small Chinese wuxia RPG and the same original musical theme. Two inexperienced companions hold their ground on a mountain path; later they protect villagers and a medicine cart. Alert, determined, human-scale urgency and mutual support. Target 116 BPM, 4/4; related E-centered pentatonic color, retaining the supplied motif G4 A4 D5 B4 when reference input is available, reshaped into concise rhythmic calls and answers. Articulate pipa ostinato, restrained low Chinese drums and frame drum, short bowed-string responses, occasional low bamboo flute melody. Audible forward momentum with a thinner contrasting section, comfortable under long tactical decisions. Short four-bar introduction, a steady loopable body, no forced final climax. Clear separation, controlled low end and rounded highs. No vocals, choir, chanting, giant trailer orchestra, constant cymbal crashes, bells, metallic jingles, shrill suona, distorted electric guitar, EDM drops, sword hits, footsteps, wolf sounds or dialogue. No quotation of an existing soundtrack.

文字提示中的小节、速度、音高、循环长度须制作后实测；不符合时编辑、重作或标注偏差后重审，不把目标值写成实测值。

## 文件与接入标准

- 原始下载、实际服务/模型标识、请求参数、提示词、参考来源及哈希、生成时间保留在批次目录；密钥不入文档或Git。服务未返回模型版本则记“未提供”，不猜填。
- 有无损输出时保留无损母版，编辑导出推荐48 kHz/24-bit立体声WAV；仅返回有损文件时保留原件并如实登记，转WAV不等于获得无损源。
- 运行先匹配现有播放器使用44.1 kHz立体声MP3，建议192 kbps或以上，单主曲目标不超过4 MB；这不是现有旧素材64 kbps的沿用标准。
- 日常综合响度目标 -20 ±1 LUFS，战斗 -18 ±1 LUFS；真峰值不高于 -1 dBTP。均为本项目听审起点，最终以游戏内对话与战斗反馈可辨为准。测量后再调整，不能一律提高播放器音量掩盖音质问题。
- 清单记录 `durationSeconds`、`sampleRate`、`channels`、编码、响度、真峰值、文件哈希；循环另记 `introEnd`、`loopStart`、`loopEnd`、交叠窗口及其单位（秒）。缺字段保持待验。
- 不直接继承旧播放器固定2.5秒交叉淡化。鼓点曲按小节对齐循环并测接缝，防止叠成双鼓点；MP3的编码边界仍须在目标浏览器连续验证。若HTMLAudio定时达不到听感标准，升级循环调度后再放行。
- 当前生成脚本把音乐失败回退为22秒音效；新BGM生产必须显式失败并保留诊断，禁止将该回退片段登记为完整配乐。先写候选目录，经验收再采用至 `assets/audio/`，同步正式JSON/Markdown/运行映射与来源。此次不直接运行旧脚本覆盖资源。

## 验收单

| 检查 | 通过条件 |
| --- | --- |
| 音乐与美术同场 | 村曲明确温馨放松，战斗明确激烈且主题清晰；优先情绪对比，不要求关联主题；不预告三方身份 |
| 噪声与音质 | 无意外人声、金属铃音、削波、压缩泵动、明显合成瑕疵；手机扬声器与耳机都能分辨主旋律 |
| 长时间循环 | 日常连续10分钟、战斗连续5分钟；至少听过3次接缝，无卡顿、重拍重叠、突兀静音与明显烦躁段落 |
| 日常交互 | 中央→南村口→东埠→药铺反复通行，同曲不重头；对话、任务选项、I江湖菜单结束后音量正确恢复 |
| 战斗交互 | 狼战、陆衡对练、守路战分别验证；指令待机60秒、BP、目标、自动战斗不重播；胜利、失败、重试各测 |
| 剧情覆盖 | 夜谈、起火、撤离后不会自动冒出明亮村曲；读档按当前剧情选曲 |
| 播放控制 | 首次手势后播放；静音开关、后台切换、快速进出战斗不叠曲、不爆音；素材失败不阻塞游戏 |
| 留证 | 保存游戏内混音录屏/录音、响度与循环测量、测试步骤及问题；静态截图和无报错日志不能代替听审 |

验收完成前均为候选。完成文件存在性检查不代表配乐质量通过，试听样段通过也不代表完整循环与运行接入通过。
