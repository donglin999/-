# 音频（js/audio.js）

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）

角色配音制作入口见[襄阳语音清单](design/xiangyang-voice.md)、[确认与补全交互](../design/voice-management.md)和[本地语音后台](../design/voice-backend.md)。已接入角色配音播放，当前装配 13 个已确认角色、78 条正式语音。装配与播放规则见 [角色语音装配](../design/voice-runtime.md)。选音后台更新后执行装配脚本，将有效成品导出至游戏静态目录。

**角色语音统一使用 MiniMax 接口**（`speech-2.8-hd`，`POST /v1/t2a_v2`），包括音色候选试听、正式台词、情绪短句和新增台词补全。后台默认自动补全多句试听，选择音色时直接连播比较；正式音色绑定仍需用户点击确认。下文的 ElevenLabs 仅记录已有音乐和环境／提示音效管线。

## 1. 设计

- **自包含**：一个 IIFE，最后加载。只读取/包裹其它脚本的全局（`say choose toast fade openPanel closePanel`，以及 `mode cur player SC S TS`），不修改它们的实现。移除 `<script src="js/audio.js">` 游戏照常运行（仅无声）。
- **HTMLAudioElement**：不用 fetch/WebAudio，因此 `file://` 直接打开也能播放。
- **首次用户手势后才开声**：`pointerdown/keydown/touchstart`（capture）触发 `start()`，满足浏览器自动播放策略。
- **静音**：`M` 键（输入框内除外）或画面右上的喇叭按钮 `#sndbtn`；状态存 `localStorage['xjh.mute']`。面板或大地图打开时按钮隐藏，避免遮挡。
- 对外接口 `window.__audio={sfx,setMute,muted,started,bgm,amb}`，战斗通过 `bsfx()` 调用。

## 2. 音量与增益

分轨基础音量 `VOL={bgm:.25, amb:.35, sfx:.5}`，角色语音音量 .85。播放对白时音乐与环境声乘 .35，结束后恢复。每条音效的额外增益 `GAIN`（缺省 1）：

| 素材 | GAIN | 素材 | GAIN |
|---|---|---|---|
| blip | .35 | coin | .8 |
| advance | .6 | forge | .5 |
| select | .7 | kettle | 1 |
| menu_open | .6 | | |
| menu_close | .6 | whoosh | .35 |
| chime | .7 | | |

最终音量 = `VOL.sfx × GAIN[name] × 调用传入的 vol`（夹在 0..1）。`sfx(name,vol=1,rate=1)` 每个名字最多 4 个复用元素；`rate` 改变播放速率（`preservesPitch=false`，即变调）。

## 3. 素材（assets/audio/，音效为 mp3 44.1kHz 64kbps，新街市音乐为 128kbps）

| 文件 | 类型 | 用途 |
|---|---|---|
| `bgm_street_day_v4.mp3` | 音乐（约 86.2s，128kbps） | 当前街市 BGM：分段多声部合奏 |
| `bgm_street_day_v3.mp3` | 音乐（约 88.2s，128kbps） | 保留前版，对比用，当前街市不播放 |
| `bgm_street_day_v2.mp3` | 音乐（约 85.2s，128kbps） | 保留作门派场景候选，具体门派待定，当前街市不播放 |
| `bgm_street.mp3` | 旧音乐（75s） | 保留原稿，当前不播放 |
| `amb_street.mp3` | 环境（22s） | 街市环境音 |
| `blip` | UI | 对话打字（每 2 字左右一声，音高随机 .95–1.1） |
| `advance` | UI | 对话推进；战斗中受击（rate .7–.9） |
| `select` | UI | 选项确认 |
| `menu_open` / `menu_close` | UI | 面板开/关 |
| `chime` | UI | toast 提示（「购得…」除外）、治疗、蓄势、胜利 |
| `whoosh` | 过渡 | 探索中的 fade 黑场、战斗开场、破防、逃跑 |
| `coin` | 事件 | `S.silver` 减少时；胜利获得银两 |
| `step1..3` | 停用素材 | 原探索脚步；铃音干扰，已停止自动播放 |
| `forge` | 点声源 | 街市铁匠打铁 |
| `kettle` | 点声源 | 街市倒茶 |

## 4. 钩子（被包裹的全局函数）

| 函数 | 加上的行为 |
|---|---|
| `say` | 匹配已装配台词时播放角色语音并关闭打字 blip，推进后停止；未配音文本沿用 blip；结束播 advance |
| `choose` | 匹配角色选项提示时播放语音，选中后停止并播 select |
| `toast` | 播 `chime`（文本以「购得」开头时不播） |
| `openPanel` | 面板原本隐藏时播 `menu_open` |
| `closePanel` | 面板原本打开时播 `menu_close` |
| `fade` | `mode==='scene'` 时播 `whoosh` |

包裹实现：`wrap(name,f)` 取 `window[name] ?? eval(name)`，再 `eval(name+'=w')` 重新赋值全局绑定。由于其它脚本在调用时按名字解析，包裹对所有调用点生效。

另有每帧轮询（`requestAnimationFrame`）：
- **音景**：`mode==='scene'` 时用 `SC` 反查当前场景 id，查 `SCENES` 表设置 BGM/环境音；未列出的场景淡出为静。
- **脚步**：当前关闭行走距离触发，保留源素材待替换。
- **打铁**：街市中每 2.8–5.3s，若主角距铁匠（npc id `smith`）<12 格，按距离衰减播 `forge`。
- **倒茶**：街市中每 14–26s 播一次 `kettle`（音量 .8）。
- **银两**：`S.silver` 比上一帧少即播 `coin`。

## 5. 场景音轨

```js
const SCENES={street:{bgm:'bgm_street_day_v4',amb:'amb_street'}};
```

| 场景 | BGM | 环境音 |
|---|---|---|
| `street` 襄阳城 · 街市 | `bgm_street_day_v4` | `amb_street` |
| 其余 7 个场景、大地图、战斗、标题 | — | — |

BGM/环境音由 `Loop` 类播放：两个 Audio 元素在曲尾 2.5s 交叉淡化以掩盖 mp3 循环缝；切换曲目时先以 1.6s 淡出再换。新增场景音轨：在 `tools_audio/gen_audio.py` 增加条目生成 mp3，再在 `SCENES` 里登记 `场景id:{bgm,amb}`。

## 6. 重新生成（ElevenLabs）

```bash
export elevenlabs_APIKEY=...                    # 只从环境变量读取，勿写入仓库
python3 tools_audio/gen_audio.py                # 只生成缺失的文件
python3 tools_audio/gen_audio.py forge kettle   # 指定 slug 强制重生成
```

- 音效 `SFX={slug:(英文提示词, 时长秒)}` → `POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_64`（`prompt_influence:0.5`）。
- 音乐 `MUSIC={slug:(提示词, 毫秒)}` → `POST /v1/music`，明确指定 `music_v1` 与 `force_instrumental:true`、128kbps。调用字段见 [ElevenLabs 官方音乐接口](https://elevenlabs.io/docs/api-reference/music/compose)。失败不再回落为短音效，避免把失败结果当成完整音乐；响应成功并通过 MP3 基础校验后再写文件。
- 输出到 `assets/audio/{slug}.mp3`。重生成后按听感调整 `audio.js` 的 `GAIN`。

角色对白与候选试听使用 MiniMax，逐句发送实际情绪参数；[台词情绪与合成](../design/voice-emotion.md)记录字段和验收要求。旧版未传情绪的试听须重做，正式音色仍由用户确认。

配音规模更新：叶蘅、苏芷保留多句；其余 15 个 NPC 一人一句，见[普通 NPC 单句配音](../design/voice-npc.md)。两类在独立页面选音，共用 MiniMax、绑定与音色占用规则。

## 7. 街市 v2 生成记录（现保留为门派候选）

用户反馈旧 BGM 偏哀。当前定位为“忙碌中有戒备”的夏日街市：音乐以温暖、有人气、自然的日常律动为主，紧张由剧情和局部音景表达，不用哀伤慢笛覆盖整条街。

生成目标：约100 BPM 的适中步行节奏、明亮五声音阶、轻盈笛子与温暖琵琶短句应答、古筝伴奏、轻木板与柔和打击乐。纯器乐，小编制，给对白和独立市集环境音留空间；避免悲凉长音、低沉持续音、战争鼓点、庆典大合奏和现代电子节拍。提示词是生成目标，不替代听感审核。

本批原始90秒音乐与精确请求、SHA-256保留在 `art_sources/audio_street_v2/`。原稿末尾自动淡出至静音，经解码测量后用 `tools_audio/prepare_street_music.py` 无损按完整MP3帧裁至85.185秒；生产末秒RMS约−18.9dBFS，无削波，采用现有2.5秒交叉淡化。技术检查与浏览器播放检查不能证明主观情绪已获用户批准，最终听感以实际试听反馈为准。

复现：先 `python3 tools_audio/gen_audio.py bgm_street_day_v2` 生成，再将返回原稿保存至 `art_sources/audio_street_v2/bgm_street_day_v2-original.mp3`、审查淡出位置后运行裁切工具。85.2秒截点只适用于本批已审查原稿，重生成后不能盲目沿用。当前仅本地替换，未发布线上。

本批浏览器验收：`node tests/audio-street.test.cjs` 通过，检查襄阳街市读取新版文件、约85秒解码时长、首次手势解锁、尾部双轨重叠、循环交接与静音；本地服务器不支持区段跳播，因此以16倍速真实播放至曲尾验证交接。

## 8. 襄阳街市 v3：丰满的日常合奏

用户认为v2可保留给门派，但用于襄阳太单薄。v2文件与原稿完整保留、从街市映射移出；暂不指定任何门派或新场景。

v3生成目标：约108 BPM，明亮五声音阶，中等编制；阮与拨弦低音持续托底，琵琶/扬琴交错节奏，笛子与高音弦乐短句应答，笙填充中音，木板与轻鼓提供流动。保持低音、伴奏、旋律多层同时出现，避免独奏长空白；仍是日常市集，不走战争、盛大庆典或哀婉方向。主观听感以用户试听为准，不由提示词推断已经完全达标。

请求、90秒返回原稿、原稿哈希与技术记录保存在 `art_sources/audio_street_v3/`。曲尾89秒处自动淡出，按本稿检查结果无损裁至88.189秒，并保留现有2.5秒交叉淡化。v3整体RMS约−16.7dBFS，比v2高约4dB，运行时额外增益0.7，降低单纯音量增加对评审的影响；对白自动压低音景的现有逻辑保留。

生产工具改为 `python3 tools_audio/prepare_street_music.py --version 3`，截点从绑定原稿SHA的技术记录读取，原稿改变会拒绝复用旧截点。当前仅本地使用，尚未发布线上。

v3浏览器检查已通过：新版曲目选择、88.189秒解码、首次手势播放、双轨交叉淡化与循环交接、静音均正常，未出现音乐请求或页面错误。

## 9. 襄阳街市 v4：按段锁定多声部

用户继续反馈v3偏单薄，要求更多乐器。本版采用 `tools_audio/street_music_v4_plan.json` 的三个30秒乐段，约108 BPM。每段都明确保留阮/中胡低音、琵琶/扬琴/古筝的交错伴奏、笙与二胡组的中音和声、笛子主旋律与高胡/箫应答，以及木板、轻鼓和沙响节奏。安排低、中、高音持续叠加，避免只列乐器名称却安排为轮流独奏。

这是生成的编曲目标；尚未拆分声部逐件确认乐器，也不能据提示词宣称听感已通过用户验收。使用 [官方 composition_plan 字段](https://elevenlabs.io/docs/api-reference/music/compose)，`music_v1`、分段时长严格控制，各段歌词数组为空、全局禁止人声；该模式不发送仅适用于prompt模式的 `force_instrumental`。

原稿、完整请求、原稿哈希、技术记录及裁切结果在 `art_sources/audio_street_v4/`。90秒原稿在87秒开始明显淡出，按已核原稿哈希无损裁至86.178秒，现有2.5秒交叉淡化保持。原稿RMS约−15.8dBFS，运行额外增益0.6以接近前版有效响度；对白压低音景规则保留。v2继续保留为门派候选，v3保留对照。当前仅本地替换。

v4浏览器实测通过：读取新版文件、86.178秒解码、首次手势播放、尾部双轨重叠与循环交接、静音均正常，未出现页面或音乐请求错误。

## 10. 梦境仙侠主题候选：bgm_dream_wandering_v1

用户希望生成类似《回梦游仙》氛围的BGM。曲目身份参考[官方原声精选集](https://store.steampowered.com/app/3860220/_/?l=schinese)，仅用于识别用户所指作品；本次没有上传或取用参考曲音频，也未分析其谱面。

独立生成目标：悠远、空灵、温柔怀念与希望，约76 BPM的6/8流动感，新的八小节主题及变奏。笛/箫引出主旋律，二胡接续，古筝/竖琴/钢琴分解和弦、低弦乐与笙托底，中段弦乐展开，避免单薄长空白。完整120秒纯器乐候选，精确请求与哈希在 `art_sources/audio_dream_wandering_v1/`。

已通过完整解码与信号检查：120.033秒、44.1kHz立体声、128kbps、峰值约−0.61dBFS、无满幅样本。听感相似程度、实际乐器声部及旋律辨识仍待用户试听，不依据生成提示词标作已验收。此曲暂不绑定场景，不替换当前襄阳街市v4，也未发布线上；用于梦境/回忆/山门等场景的具体用途须后续确定。

## 功法声画评审 v2

当前独立评审页采用 CC0 实录拳击、刀剑与挥动音效，由 `tools_fx/build_combat_av_cc0.py` 本地剪辑混音，未替换正式战斗音效。来源与许可见[本批记录](../../art_sources/combat_av_review_v2/CREDITS.md)，操作与绑定规格见声画评审（已删除）。后续同类评审优先选择许可明确的实录素材。
