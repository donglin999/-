extends Node
## 音乐与音效（移植原版 js/audio.js）。规格见 docs/specs/system/04-音频.md。
## - 音量：BGM .25、音效 .5 × 单条增益 GAIN × 参数；变速即变调。
## - 每首曲一个循环播放器，切走只暂停；淡出 .8s（战斗 .6s）、淡入 1.2s（战斗 .2s）；循环首尾各 60ms 接缝包络。
## - 对白或面板打开时 BGM 压到 .708（每秒 3 逼近）；配音已关闭，不做。
## - 选曲（qiheSoundscape）每帧求值；标题页无音乐。
## - 全局音效挂点：打字 blip、对白推进 advance、选项 select、提示 chime、面板开关、黑场 whoosh、银两减少 coin。

const VOL := {"bgm": 0.25, "sfx": 0.5}
const GAIN := {"blip": 0.35, "advance": 0.6, "select": 0.7, "menu_open": 0.6, "menu_close": 0.6, "chime": 0.7, "whoosh": 0.35, "coin": 0.8}

var muted := false
var started := false
var _players := {}        # 曲名 → AudioStreamPlayer
var _pool := {}           # 音效名 → [AudioStreamPlayer]
var target := ""          # 目标曲（name）
var playing := ""         # 正在放（playingName）
var level := 0.0
var gain := 1.0
var cur_gain := 1.0
var _last_silver = null
var battle_obj = null     # 战斗模块设置：当前战斗对象（新对象 → 战斗曲归零）
var battle_settled := false
var battle_bg := ""
var _last_battle = null

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var f := "user://mute.txt"
	muted = FileAccess.file_exists(f) and FileAccess.get_file_as_string(f) == "1"
	started = not OS.has_feature("web")   # 浏览器要等第一次用户操作才能出声（与原版一致）

func _input(ev: InputEvent) -> void:
	if not started and (ev is InputEventMouseButton or ev is InputEventKey or ev is InputEventScreenTouch) and ev.is_pressed():
		started = true
	if ev is InputEventKey and ev.pressed and not ev.echo and ev.keycode == KEY_M:
		# 自由探索时 M 是地图（qihe-navigation 抢先处理）；其余时候 M 是静音开关
		var free: bool = G.mode == "scene" and G.S != null and not World.busy and not Dialog.busy and not UI.panel_open()
		if not free: set_mute(not muted)

func set_mute(m: bool) -> void:
	muted = m
	var f := FileAccess.open("user://mute.txt", FileAccess.WRITE)
	if f: f.store_string("1" if m else "0")
	if m:
		for p in _players.values(): p.stream_paused = true
		level = 0
		for arr in _pool.values():
			for p in arr: p.stop()
	else:
		started = true

# ── 音效 ──
func sfx(key: String, vol := 1.0, rate := 1.0) -> void:
	if muted or not started: return
	var v: float = clamp(VOL.sfx * GAIN.get(key, 1.0) * vol, 0, 1)
	if v <= 0: return
	var arr: Array = _pool.get(key, [])
	var p: AudioStreamPlayer = null
	for q in arr:
		if not q.playing: p = q; break
	if p == null:
		if arr.size() < 4:
			var s := Assets.audio(key)
			if s == null: return
			p = AudioStreamPlayer.new(); p.stream = s; add_child(p); arr.append(p); _pool[key] = arr
		else:
			p = arr[0]
	p.volume_db = linear_to_db(v); p.pitch_scale = rate
	p.play(0.0)

# ── BGM ──
func _player(name: String) -> AudioStreamPlayer:
	if _players.has(name): return _players[name]
	var s := Assets.audio(name)
	if s == null: _players[name] = null; return null
	if s is AudioStreamMP3: s.loop = true
	elif s is AudioStreamWAV: s.loop_mode = AudioStreamWAV.LOOP_FORWARD; s.loop_end = int(s.get_length() * s.mix_rate)
	var p := AudioStreamPlayer.new(); p.stream = s; p.volume_db = -80; add_child(p)
	_players[name] = p
	return p

## 兼容旧调用：直接指定曲目（选曲每帧会覆盖，一般不用）
func play_bgm(_key: String, _vol_db := -6.0) -> void: pass

## 原版 qiheSoundscape
func soundscape() -> Array:
	match G.mode:
		"battle":
			if battle_obj == null or battle_settled: return ["", 1.0]
			return ["bgm_qh_battle_v2", 0.8 if battle_bg == "bb_qh_training_v1" else 1.0]
		"cultivation": return ["bgm_qh_cultivation_v5_short", 1.0]
		"scene":
			if G.S == null: return ["", 1.0]
			var stage = G.S.get("qiheChapter", {}).get("stage") if G.S.get("qiheChapter") else null
			if World.cur_id == "qh_mountain" and stage == "cultivation": return ["bgm_qh_cultivation_v5_short", 1.0]
			if G.S.get("prologue", {}).get("ending") or stage in ["fire", "escape", "refuge", "mountain", "ended"]: return ["", 1.0]
			var id := World.cur_id
			if id.begins_with("qihe_") or id.begins_with("qh_") or id.begins_with("prologue_"): return ["bgm_qh_daily_v2", 1.0]
	return ["", 1.0]

func _process(delta: float) -> void:
	var dt: float = min(0.1, delta)
	var sel := soundscape()
	target = sel[0]
	# 新战斗：战斗曲归零
	if G.mode == "battle" and battle_obj != null and battle_obj != _last_battle:
		_last_battle = battle_obj
		var bp := _player("bgm_qh_battle_v2")
		if bp: bp.stop(); bp.stream_paused = false
	if not started or muted:
		for p in _players.values():
			if p: p.stream_paused = true
		level = 0; return
	if target != playing:
		var t_out := 0.6 if "battle" in target else 0.8
		level -= dt / t_out
		var old: AudioStreamPlayer = _players.get(playing)
		if level > 0 and old != null:
			old.volume_db = linear_to_db(max(0.0001, VOL.bgm * level * cur_gain))
			return
		level = 0
		if old != null: old.stream_paused = true
		playing = target
	var p: AudioStreamPlayer = _player(playing) if playing != "" else null
	if p == null: return
	var t_in := 0.2 if "battle" in playing else 1.2
	level = min(1.0, level + dt / t_in)
	# 压低：对白框或面板打开时 ×0.708
	var k := 0.708 if (Dialog.visible_now() or UI.panel_open()) else 1.0
	var tg: float = sel[1] * k
	cur_gain = move_toward(cur_gain, tg, dt * 3)
	if not p.playing: p.play(0.0)
	p.stream_paused = false
	var t := p.get_playback_position(); var dur := p.stream.get_length()
	var edge: float = clamp(min(t / 0.06, (dur - t) / 0.06), 0, 1) if dur > 0 else 1.0
	p.volume_db = linear_to_db(max(0.0001, clamp(VOL.bgm * level * cur_gain * edge, 0, 1)))
	# 银两减少：coin
	if G.S != null:
		var s = G.S.get("silver", 0)
		if _last_silver != null and s < _last_silver: sfx("coin")
		_last_silver = s
