# 音频（js/audio.js）

状态：现行　最后核对：2026-10-19

当前栖河分支已装配V2日常与战斗BGM，街市原曲保留。目标见[栖河BGM设计](design/qihe-map/expansion/bgm.md)与[制作验收](design/qihe-map/expansion/bgm-production.md)。下文描述现行代码。

## 1. 设计

- **自包含**：一个 IIFE，最后加载。只读取/包裹其它脚本的全局（`say choose toast fade openPanel closePanel`，以及 `mode cur player SC S TS`），不修改它们的实现。移除 `<script src="js/audio.js">` 游戏照常运行（仅无声）。
- **HTMLAudioElement**：不用 fetch/WebAudio，因此 `file://` 直接打开也能播放。
- **首次用户手势后才开声**：`pointerdown/keydown/touchstart`（capture）触发 `start()`，满足浏览器自动播放策略。
- **静音**：`M` 键（输入框内除外）或画面右上的喇叭按钮 `#sndbtn`；状态存 `localStorage['xjh.mute']`。面板或大地图打开时按钮隐藏，避免遮挡。
- 对外接口 `window.__audio={sfx,setMute,muted,started,bgm,amb}`，战斗通过 `bsfx()` 调用。

## 2. 音量与增益

分轨基础音量 `VOL={bgm:.25, amb:.35, sfx:.5}`。每条音效的额外增益 `GAIN`（缺省 1）：

| 素材 | GAIN | 素材 | GAIN |
|---|---|---|---|
| blip | .35 | coin | .8 |
| advance | .6 | forge | .5 |
| select | .7 | kettle | 1 |
| menu_open | .6 | step1/2/3 | .45 |
| menu_close | .6 | whoosh | .35 |
| chime | .7 | | |

最终音量 = `VOL.sfx × GAIN[name] × 调用传入的 vol`（夹在 0..1）。`sfx(name,vol=1,rate=1)` 每个名字最多 4 个复用元素；`rate` 改变播放速率（`preservesPitch=false`，即变调）。

## 3. 历史素材（assets/audio/，下表为 mp3 44.1kHz 64kbps）

| 文件 | 类型 | 用途 |
|---|---|---|
| `bgm_street.mp3` | 音乐（75s） | 街市 BGM |
| `amb_street.mp3` | 环境（22s） | 街市环境音 |
| `blip` | UI | 对话打字（每 2 字左右一声，音高随机 .95–1.1） |
| `advance` | UI | 对话推进；战斗中受击（rate .7–.9） |
| `select` | UI | 选项确认 |
| `menu_open` / `menu_close` | UI | 面板开/关 |
| `chime` | UI | toast 提示（「购得…」除外）、治疗、蓄势、胜利 |
| `whoosh` | 过渡 | 探索中的 fade 黑场、战斗开场、破防、逃跑 |
| `coin` | 事件 | `S.silver` 减少时；胜利获得银两 |
| `step1..3` | 脚步 | 历史素材，带金属铃音，当前已停用自动触发 |
| `forge` | 点声源 | 街市铁匠打铁 |
| `kettle` | 点声源 | 街市倒茶 |

## 4. 钩子（被包裹的全局函数）

| 函数 | 加上的行为 |
|---|---|
| `say` | 打字过程中按 `.txt` 长度增长播 `blip`；结束后播 `advance` |
| `choose` | 选中后播 `select` |
| `toast` | 播 `chime`（文本以「购得」开头时不播） |
| `openPanel` | 面板原本隐藏时播 `menu_open` |
| `closePanel` | 面板原本打开时播 `menu_close` |
| `fade` | `mode==='scene'` 时播 `whoosh` |

包裹实现：`wrap(name,f)` 取 `window[name] ?? eval(name)`，再 `eval(name+'=w')` 重新赋值全局绑定。由于其它脚本在调用时按名字解析，包裹对所有调用点生效。

另有每帧轮询（`requestAnimationFrame`）：
- **音景**：`mode==='scene'` 时用 `SC` 反查当前场景 id，查 `SCENES` 表设置 BGM/环境音；未列出的场景淡出为静。
- **脚步**：旧素材带明显金属铃音，当前已停用按移动距离自动播放；保留文件不代表恢复启用。
- **打铁**：街市中每 2.8–5.3s，若主角距铁匠（npc id `smith`）<12 格，按距离衰减播 `forge`。
- **倒茶**：街市中每 14–26s 播一次 `kettle`（音量 .8）。
- **银两**：`S.silver` 比上一帧少即播 `coin`。

## 5. 场景音轨

```js
const SCENES={street:{bgm:'bgm_street',amb:'amb_street'}};
```

| 场景 | BGM | 环境音 |
|---|---|---|
| `street` 襄阳城 · 街市（2026-10-19 已随襄阳演示归档） | `bgm_street` | `amb_street` |
| 栖河村/外区/后山/室内（日常阶段） | bgm_qh_daily_v2 | — |
| 栖河狼战/陆衡对练/药车守路战 | bgm_qh_battle_v2 | — |
| 培养部分及培养内江湖武学面板 | bgm_qh_cultivation_v5_short（WAV） | — |
| 栖河起火撤离/接应/山居首夜；其他未配置场景 | — | — |

非栖河BGM及环境音仍由 `Loop` 类播放：两个 Audio 元素在曲尾 2.5s 交叉淡化以掩盖 mp3 循环缝；切换曲目时先以 1.6s 淡出再换。新增场景音轨：在 `tools_audio/gen_audio.py` 增加条目生成 mp3，再在 `SCENES` 里登记 `场景id:{bgm,amb}`。

## 6. 重新生成（ElevenLabs）

```bash
export elevenlabs_APIKEY=...                    # 只从环境变量读取，勿写入仓库
python3 tools_audio/gen_audio.py                # 只生成缺失的文件
python3 tools_audio/gen_audio.py forge kettle   # 指定 slug 强制重生成
```

- 音效 `SFX={slug:(英文提示词, 时长秒)}` → `POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_64`（`prompt_influence:0.5`）。
- 音乐 `MUSIC={slug:(提示词, 毫秒)}` → `POST /v1/music`；失败时回落为 22 秒的 sound-generation。
- 旧脚本直接输出到 `assets/audio/{slug}.mp3`。新配乐须先改为候选批次输出并关闭22秒音效回退，按[新素材流程](update-workflow.md)验收采用，不能直接覆盖正式文件。

## 栖河V2运行实现（2026-10-05）

用户要求装配V2，正式文件为 assets/audio/bgm_qh_daily_v2.mp3 和 bgm_qh_battle_v2.mp3，来源及哈希登记在正式素材清单。production-assets.js 同步导出 PRODUCTION_AUDIO_PATHS；旧地图路径与图像别名不变。

栖河使用MusicLoop：每首一个HTMLAudio，原生循环，首尾60毫秒音量包络防点击，无双元素叠鼓。日常跨区域保持位置，战斗每场从头；切换日常到战斗先约0.6秒淡出、0.2秒淡入，其他退场约0.8秒。battleLoop结束即退场，结算不会继续放战斗曲；返回后按剧情决定日常恢复或留白。对练同曲乘0.8，不是另一个轻编曲版本。

对话/选择/江湖面板打开时BGM平滑降至0.708倍，关闭恢复。__audio.voice(true/false)为嵌套语音压低接口（0.5倍）；角色对白与战斗语音均调用该接口；2026-10-10补入普通对白播放器。

M立即暂停BGM和现有短音效；取消静音保留位置。页面隐藏立即暂停，恢复页面时渐入；首次真实点击后才能开声。背景音频加载失败保持安静且不阻塞战斗/剧情。

目前采用用户要求的约59秒版本。技术上可循环，尚未声称音乐小节边界无缝或长期听审通过。证据见 art_sources/qihe-bgm-v2/browser-playback.json；流程测试 tools_scene/qihe/verify_audio.cjs 区分模拟音频状态与浏览器实际加载播放。

## 培养音乐装配（2026-10-06）

用户采用《小院新晴》V5短开头版。正式文件 `assets/audio/bgm_qh_cultivation_v5_short.wav`，108.741秒，48kHz/24bit双声道，保留获批文件原始字节。`mode=cultivation` 与培养中的山居江湖面板播放同一元素，菜单/月份切换不断曲；战斗切换现有战斗音乐，返回后续播。开始部分山居首夜不提前播培养曲，外出街市使用街市音景。首次手势、静音、后台暂停沿用MusicLoop合同。来源和循环限制见[培养配乐](design/qihe-map/expansion/cultivation-bgm.md)。

## 战斗角色短句（2026-10-06）

`battle-voice.js`读取静态战斗清单，在最终战斗动作和受伤函数挂接事件。20位已确认角色160句，萧白和动物静默，未绑定人物不借用其他人的音色。单通道、倒地优先、连击一次、冷却与不连续重复；播音时调用voice接口压低BGM，静音、后台及离场立即停止。规则、台本和未完成音色见[战斗语音](design/battle-voice.md)，逐句试听见[试听页](../review/battle_voice.html)。

## 已确认对白（2026-10-10）

`assets/audio/voices/manifest.js`为14人95句静态包，`js/voice.js`按角色与正文匹配，`audio.js`在say/choose起止调用。推进、离场、静音或隐藏均停止，语音播放时压低BGM并关闭配音句的打字音。不会把未匹配的旧稿读进新剧情；专用CG字幕未额外挂接。
