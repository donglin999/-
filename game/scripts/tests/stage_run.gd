extends RefCounted
## 走位连拍与黑场断言（2026-11-13）。用户：“闪屏的问题要处理，看下别人是如何解决的，不然太生硬了”——
## 开戏前、散场时不再全屏黑场瞬移，改成人物走位（World.stage_walk／World.ghost，chapter.gd 的 _apply／_disperse）。
## 这里把几场戏各演一遍，每帧采样全屏黑场的不透明度（UI._fade），并在“开场前／走位中／开讲／散场中／散场后”各拍一张：
##   - 整段没有换场景的戏：黑场不透明度必须始终为 0；
##   - 中途换场景的戏：只许在换场景那一下变黑，别的时候变黑就记“无故黑场”；
##   - 开讲时主角和戏里的人都要已经在站位上（走位记录里 kind 不是 stay 的，离站位不到 2 像素）。
## 用法：tools/gd_bg.sh --resolution 1280x720 -- --sweep-npc=tests/saves/progress/01-prologue-done.json --stage-run --snap-dir=<目录> --out=<报告.json>
##（无头也能跑，只是不截图）。入口挂在 sweep_npc.gd 的 run() 里（boot.gd 不用改）。

var S: Node          # sweep_npc 节点（借它的 h、_find、读档）
var h: Node
var ch: Node
var rows: Array = []
var _samples: Array = []   # {t, a, scene, go}
var _sampling := false
var _dir := ""

func run(sweep: Node) -> void:
	S = sweep; h = S.h; ch = Flow.get_node("Chapter")
	_dir = str(S.args.get("snap-dir", ""))
	Engine.time_scale = 1.0
	World.stage_speed = 1.0    # 连拍要看真实速度（无头时底座会调成 4 倍）
	var dirp: String = str(S.args.get("sweep-npc", "")).get_base_dir()
	# 第一夜三件差事：主角站远一点再搭话
	await _talk("A-村口老人", dirp.path_join("01-prologue-done.json"), "qihe_trial", "elder", {"prologue.errands.medicine": "accepted"}, "elder_door", 260.0)
	await _talk("A2-村口老人-很远", dirp.path_join("01-prologue-done.json"), "qihe_trial", "elder", {"prologue.errands.medicine": "accepted"}, "elder_door", 760.0)
	await _talk("B-陈家还碗", dirp.path_join("01-prologue-done.json"), "prologue_chen_hall", "chen", {"prologue.errands.bowls": "accepted"}, "chen_hall", 200.0)
	await _talk("C-客栈取布", dirp.path_join("01-prologue-done.json"), "prologue_inn_interior", "innkeeper", {"prologue.errands.cloth": "accepted"}, "inn_cloth", 230.0)
	# 次日药摊（开场换场景到南村口，演完散场）→ 见来客（进药棚后换到村心演，演完散场）
	if await _load(dirp.path_join("04-first-night.json")):
		await _event("D-次日药摊", "morning", func(): await ch.begin())
		G.S.aqiTeach = {"wage": 1}   # 小耗子那一课算上过了（同行踪连演），主线轮到“去药棚见来客”
		await h.guard("去村心", func(): await World.go_scene("qihe_trial"), 120); await h.idle(60)
		await _event("E-见来客", "xu_visit", func(): await World.go_scene("prologue_clinic_interior"))
	# 日常活动：学棍（叶蘅从身后走到戏里站位，演完走回身后）
	if await _load(dirp.path_join("05-morning.json")):
		await h.guard("去西田埂", func(): await World.go_scene("qh_west"), 120); await h.idle(60)
		var lu = S._find("luheng")
		if lu != null:
			World.player.x = float(lu.x) * World.TS + 150; World.player.y = float(lu.y) * World.TS + 60; World.place_fix()
			h.choice_policy = func(_n: int, _q: String) -> int: return 0
			await _event("F-学棍", "practice", func(): await ch.interact("luheng"))
	if _dir != "":
		DirAccess.make_dir_recursive_absolute(_dir)
		var f := FileAccess.open(_dir.path_join("stage_run.json"), FileAccess.WRITE)
		if f: f.store_string(JSON.stringify(rows, " ")); f.close()
	for r in rows:
		print("走位连演：%s｜黑场峰值 %.2f｜无故黑场 %d 段｜换场黑场 %d 段｜走位 %s｜用时 %d 毫秒" % [r.name, r.peak, r.bad_black, r.go_black, JSON.stringify(r.walks), r.ms])

func _load(path: String) -> bool:
	var snap = JSON.parse_string(FileAccess.get_file_as_string(path))
	if not (snap is Dictionary): h.issue("读档失败", "读不出 " + path, ""); return false
	await h.unstick()
	if not await h.load_state(snap, S.key): h.issue("卡住", "读档后动不了", path); return false
	return true

func _put(path: String, val) -> void:
	var cur = G.S
	var ks := path.split(".")
	for i in ks.size() - 1:
		if not (cur.get(ks[i]) is Dictionary): cur[ks[i]] = {}
		cur = cur[ks[i]]
	cur[ks[ks.size() - 1]] = val

func _shot(name: String, hold := 0.0) -> void:
	if _dir == "" or DisplayServer.get_name() == "headless": return
	var was: bool = h.driving
	h.driving = false
	if hold > 0: await S.get_tree().create_timer(hold).timeout
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute(_dir)
	S.get_viewport().get_texture().get_image().save_png(_dir.path_join(name + ".png"))
	h.driving = was

## 每帧采样黑场
func _sample_start() -> void:
	_samples = []; _sampling = true
	var loop := func():
		while _sampling:
			_samples.append({"t": Time.get_ticks_msec(), "a": float(UI._fade.modulate.a), "scene": World.cur_id, "go": int(ch._last_go)})
			await S.get_tree().process_frame
	loop.call()

## 把采样切成一段段黑场：这一段里换过场景（场景 id 变了，或 go_scene 刚完成）算“换场黑场”，否则算“无故黑场”
func _sample_end() -> Dictionary:
	_sampling = false
	var peak := 0.0; var bad := 0; var ok := 0
	var i := 0
	while i < _samples.size():
		if _samples[i].a <= 0.004: i += 1; continue
		var j := i
		while j + 1 < _samples.size() and _samples[j + 1].a > 0.004: j += 1
		var a0: Dictionary = _samples[max(0, i - 1)]; var a1: Dictionary = _samples[min(_samples.size() - 1, j + 1)]
		var went: bool = a0.scene != a1.scene or a0.go != a1.go
		for k in range(i, j + 1): peak = max(peak, _samples[k].a)
		if went: ok += 1
		else: bad += 1
		i = j + 1
	return {"peak": peak, "bad": bad, "go": ok}

## 开讲时各人是否到位：主角（走位记录不是 stay 的）离站位表的主角位、戏里已摆出的人离各自站位，都不超过 2 像素；没有影子人还在走
func _check_in_place(name: String, key: String) -> void:
	var e = ch.staging_active
	if e == null or e.key != key: return
	var hero = e.entry.get("hero")
	var mine: Array = ch.walks.filter(func(w): return w.key == key and w.who == "萧白")
	var kind: String = mine[mine.size() - 1].kind if mine.size() else "?"
	if hero != null and kind != "stay":
		var d := Vector2(hero[0] - World.player.x, hero[1] - World.player.y).length()
		if d > 2: h.issue("走位没到位", "%s 开讲时主角离站位 %.0f 像素（%s）" % [name, d, kind], key)
	if World.player.alpha < 0.99: h.issue("走位没到位", "%s 开讲时主角还是半透明 %.2f" % [name, World.player.alpha], key)
	var walking: Array = World.ghosts.filter(func(g): return g.tag == "in")
	# 说到才上场的人（late）边走边说是有意的；开场的人必须已经站定
	for n in World.npcs:
		if n.get("cast") and n.get("hid"):
			var v = e.entry.cast.get(str(n.name))
			if v is Array and (v.size() < 4 or v[3] != "late"): h.issue("走位没到位", "%s 开讲时 %s 还在路上（影子人 %d 个）" % [name, n.name, walking.size()], key)

## 一场戏：start 是开演的协程。按状态自动抓拍五张
func _play(name: String, key: String, start: Callable) -> void:
	h.ctx(name)
	var w0: int = ch.walks.size()
	var t_wait := Time.get_ticks_msec()
	while UI._fade.modulate.a > 0.004 and Time.get_ticks_msec() - t_wait < 3000: await S.get_tree().process_frame
	await _shot(name + "-1开场前")
	_sample_start()
	var st := {"walk": false, "talk": false, "out": false, "done": false}
	var watcher := func():
		while not st.done:
			await S.get_tree().process_frame
			var e = ch.staging_active
			var on: bool = e != null and e.key == key
			if on and not st.walk and (World.player.mv != null or World.ghosts.size()):
				st.walk = true
				await _shot(name + "-2走位中", 0.3)
			if on and not st.talk and Dialog.visible_now() and World.player.mv == null:
				st.talk = true
				_check_in_place(name, key)
				await _shot(name + "-3开讲", 0.25)
			if st.talk and not on and not st.out and e == null:
				st.out = true
				await _shot(name + "-4散场中", 0.4)
	watcher.call()
	var t0 := Time.get_ticks_msec()
	h.choice_policy = func(_n: int, _q: String) -> int: return 0
	await h.guard(name, start, 240.0, func(): return G.mode == "cultivation")
	await h.idle(60)
	var ms := Time.get_ticks_msec() - t0
	# 散场后：主角应当马上能动（不用等走开的人）
	var free_at_end: bool = h.free_now()
	var t1 := Time.get_ticks_msec()
	while not st.out and Time.get_ticks_msec() - t1 < 800: await S.get_tree().process_frame
	await S.get_tree().create_timer(2.8).timeout
	st.done = true
	var res := _sample_end()
	await _shot(name + "-5散场后")
	if World.ghosts.size(): h.issue("影子人没收", "%s 演完 3 秒后还有 %d 个影子人" % [name, World.ghosts.size()], key)
	for n in World.npcs:
		if n.get("hid") or n.get("away"): h.issue("影子人没收", "%s 演完后 %s 还是隐藏状态" % [name, n.get("name", "")], key)
	if not st.talk: h.issue("站位戏没开演", "%s 没等到站位戏 %s 开讲" % [name, key], key)
	if res.bad > 0: h.issue("无故黑场", "%s 整段里有 %d 段不是换场景的全屏黑场（峰值 %.2f）" % [name, res.bad, res.peak], key)
	if not free_at_end: h.issue("散场后不能动", "%s 演完主角不能马上走动" % name, key)
	if ch.fades.size(): h.issue("无故黑场", "%s chapter.fades 有记录（开场黑场）" % name, key)
	rows.append({"name": name, "key": key, "peak": snappedf(res.peak, 0.001), "bad_black": res.bad, "go_black": res.go, "ms": ms,
		"walks": ch.walks.slice(w0).map(func(w): return "%s:%s:%d" % [w.who, w.kind, int(w.d)]), "phases": st})
	h.flush_errors()

## 搭话开演的戏：读档 → 进场景 → 主角站到离主角站位 dist 远的地方 → 点“谈”
func _talk(name: String, save: String, sid: String, nid: String, patch: Dictionary, key: String, dist: float) -> void:
	if not await _load(save): return
	for k in patch: _put(k, patch[k])
	if World.cur_id != sid:
		await h.guard("去 " + sid, func(): await World.go_scene(sid), 120); await h.idle(60)
	Flow.prologue().apply_scene(World.cur)
	World.npcs = World.npcs_of(World.cur)
	var n = S._find(nid)
	if n == null: h.issue("找不到人", "%s 里没有 %s" % [sid, nid], name); return
	var hero: Array = ch.T.scenes[key].hero
	var to := Vector2(hero[0], hero[1])
	# 找一个站得住、走得到、离主角站位约 dist 的点
	var best = null; var bd := 1e9
	for deg in range(0, 360, 20):
		var c: Vector2 = to + Vector2(dist, 0).rotated(deg_to_rad(deg))
		if not World.stand_ok(c.x, c.y) or World.npc_block(c.x, c.y): continue
		var p = World.stage_path(c, to, false)
		if p == null: continue
		var L: float = World._path_len(c, p)
		if abs(L - dist) < bd: bd = abs(L - dist); best = c
	if best == null: h.issue("找不到起点", "%s 周围 %d 像素没有站得住的点" % [name, int(dist)], key); return
	World.player.x = best.x; World.player.y = best.y; World.player.dir = "d"; World.player.trail = []
	World.snap_cam()
	await S.get_tree().create_timer(1.2).timeout   # 过了“刚换完场景”的 0.9 秒：这之后开戏才走位
	var p2 = Npc.person_for(n)
	var it = null
	if p2 != null:
		for x in Npc.menu_for(p2, n):
			if x.id == "tan": it = x
	World.busy = true; UI.prompt_hide()
	await _play(name, key, func():
		if it != null: await Npc.execute(it, p2, n)
		else: await Npc.run_act(n)
		Npc.capture_keys(Callable()); Npc.clear()
		World.busy = false)

func _event(name: String, key: String, start: Callable) -> void:
	await _play(name, key, start)
