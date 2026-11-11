extends Node
## 剧情截图（2026-11-11）：读进度点 → 进场景 → 点指定的人（或物）→ 自动推进到含指定文字的那句 → 截图。改完台词后看画面用。
## 用法：tools/gd_bg.sh --resolution 1280x720 -- --story-snap=<清单.json> --out=<目录>
## 清单：[{"name":"图名","save":"tests/saves/progress/05-morning.json","scene":"qh_west","npc":"人物 id 或名字里的字",
##        "item":"交谈"（墨印上的项，缺省直接交互或第一项）,"patch":{"qiheChapter.talkCycle":2},"picks":["选项里的字"],"until":"台词里的字"}]
## 找不到人时会把这个场景里的人都打印出来。战斗一律跳过（同自动通关）。

const H := preload("res://scripts/tests/harness.gd")
var args := {}
var h: Node

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	h = H.new(); h.driving = false; add_child(h)
	await get_tree().process_frame
	var steps = JSON.parse_string(FileAccess.get_file_as_string(args.get("story-snap", "")))
	var out: String = args.get("out", "user://story_snap")
	DirAccess.make_dir_recursive_absolute(out)
	var bad := 0
	for st in steps:
		var ok: bool = await _one(st, out)
		print("剧情截图：%s %s" % [st.name, "好了" if ok else "【没截到】"])
		if not ok: bad += 1
	get_tree().quit(1 if bad else 0)

func _put(path: String, val) -> void:
	var cur = G.S
	var ks := path.split(".")
	for i in ks.size() - 1:
		if not (cur.get(ks[i]) is Dictionary): cur[ks[i]] = {}
		cur = cur[ks[i]]
	cur[ks[ks.size() - 1]] = val

func _find(key: String):
	for n in World.npcs:
		if str(n.get("id", "")) == key: return n
	for n in World.npcs:
		if key in str(n.get("name", "")) or key in str(n.get("id", "")): return n
	return null

func _one(st: Dictionary, out: String) -> bool:
	await h.unstick()
	var snap = JSON.parse_string(FileAccess.get_file_as_string(ProjectSettings.globalize_path("res://").path_join("..").path_join(st.save)))
	if not (snap is Dictionary): print("  读不出进度点 ", st.save); return false
	h.driving = true
	var loaded: bool = await h.load_state(snap, "selftest_story_snap")
	h.driving = false
	if not loaded: print("  读档后动不了"); return false
	for k in st.get("patch", {}): _put(k, st.patch[k])
	var sid: String = st.get("scene", World.cur_id)
	G.mode = "scene"
	await Assets.preload_keys(World.scene_asset_keys(sid))
	World.enter_scene_now(sid)
	Flow.prologue().apply_scene(World.cur)
	World.npcs = World.npcs_of(World.cur)
	UI.hud()
	await get_tree().create_timer(0.5).timeout
	var n = _find(st.npc)
	if n == null:
		print("  %s 里找不到「%s」，这里有：%s" % [sid, st.npc, ", ".join(World.npcs.map(func(x): return "%s(%s)" % [x.get("name", ""), x.get("id", "")]))])
		return false
	# 站到这个人旁边再开口，画面才对
	World.player.x = (float(n.get("x", 0)) + 1.0) * World.TS; World.player.y = float(n.get("y", 0)) * World.TS
	await get_tree().process_frame
	var p = Npc.person_for(n)
	var runner := func():
		if p == null: await Npc.run_act(n); return
		var items: Array = Npc.menu_for(p, n)
		var it = null
		for x in items:
			if x.get("st") != "off" and (not st.has("item") or str(st.item) in str(x.lab)) and it == null: it = x
		if it == null: print("  墨印上没有「%s」，有：%s" % [st.get("item", ""), ", ".join(items.map(func(x): return str(x.lab) + ("（关）" if x.get("st") == "off" else "")))]); return
		var r = await Npc.execute(it, p, n)
		while r is Dictionary and r.has("switch"):
			r = await Npc.execute(r.switch.act, r.switch.p, r.switch.npc)
	runner.call()
	var picks: Array = st.get("picks", []).duplicate()
	var t0 := Time.get_ticks_msec()
	var last := ""
	while Time.get_ticks_msec() - t0 < int(st.get("timeout", 60)) * 1000:
		await get_tree().create_timer(0.12).timeout
		if not Dialog.visible_now():
			var kf: Callable = h.key_receiver()
			if kf.is_valid() and Time.get_ticks_msec() - t0 > 1500: kf.call("escape")
			continue
		var cur := str(Dialog._full) if Dialog._full != "" else str(Dialog.txt.text)
		if cur != last: last = cur; print("    ", str(Dialog._cur.get("who", "")) if Dialog.get("_cur") is Dictionary else "", "：", cur.substr(0, 60))
		if str(st.until) in cur or str(st.until) in str(Dialog.txt.text):
			await get_tree().create_timer(1.6).timeout
			await RenderingServer.frame_post_draw
			get_viewport().get_texture().get_image().save_png(out.path_join(str(st.name) + ".png"))
			# 截完把这一场走完（选项一律选最后一个，多半是“再想想”），免得没播完的剧情串到下一张
			h.choice_policy = func(k: int, _q: String) -> int: return k - 1
			h.driving = true
			await h.idle(90)
			h.driving = false
			return true
		if Dialog._go.is_valid(): Dialog._go.call()
		elif Dialog._choice_cb.is_valid():
			var idx := 0
			if picks.size():
				for i in Dialog._choice_buttons.size():
					if str(picks[0]) in Dialog._choice_buttons[i].text: idx = i; picks.pop_front(); break
			Dialog._choice_cb.call(idx)
	print("  等了 %d 秒没等到「%s」，最后一句：%s" % [int(st.get("timeout", 60)), st.until, last.substr(0, 60)])
	return false
