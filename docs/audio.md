# 音频（js/audio.js）

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

## 3. 素材（assets/audio/，均为 mp3 44.1kHz 64kbps）

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
| `step1..3` | 脚步 | 探索移动，轮换 |
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
- **脚步**：主角每移动约 0.9×`TS` 世界像素播一次 `step{1,2,3}`（音量 .9–1.1，速率 .92–1.08）；单帧位移 ≥2 格视为传送，不计。
- **打铁**：街市中每 2.8–5.3s，若主角距铁匠（npc id `smith`）<12 格，按距离衰减播 `forge`。
- **倒茶**：街市中每 14–26s 播一次 `kettle`（音量 .8）。
- **银两**：`S.silver` 比上一帧少即播 `coin`。

## 5. 场景音轨

```js
const SCENES={street:{bgm:'bgm_street',amb:'amb_street'}};
```

| 场景 | BGM | 环境音 |
|---|---|---|
| `street` 襄阳城 · 街市 | `bgm_street` | `amb_street` |
| 其余 7 个场景、大地图、战斗、标题 | — | — |

BGM/环境音由 `Loop` 类播放：两个 Audio 元素在曲尾 2.5s 交叉淡化以掩盖 mp3 循环缝；切换曲目时先以 1.6s 淡出再换。新增场景音轨：在 `tools_audio/gen_audio.py` 增加条目生成 mp3，再在 `SCENES` 里登记 `场景id:{bgm,amb}`。

## 6. 重新生成（ElevenLabs）

```bash
export elevenlabs_APIKEY=...                    # 只从环境变量读取，勿写入仓库
python3 tools_audio/gen_audio.py                # 只生成缺失的文件
python3 tools_audio/gen_audio.py forge kettle   # 指定 slug 强制重生成
```

- 音效 `SFX={slug:(英文提示词, 时长秒)}` → `POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_64`（`prompt_influence:0.5`）。
- 音乐 `MUSIC={slug:(提示词, 毫秒)}` → `POST /v1/music`；失败时回落为 22 秒的 sound-generation。
- 输出到 `assets/audio/{slug}.mp3`。重生成后按听感调整 `audio.js` 的 `GAIN`。
