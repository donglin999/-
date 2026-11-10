extends Node
## 江湖菜单扫荡（2026-11-10 用户：“看下各个页面是否仍有 bug 或者显示交互问题”）。
## 载入一份进度点存档，七个页签（队伍、武学、行囊、装备、行记、关系、设置）×每个结伴的人：
## - 页面上每一个可点的东西（带 meta "qj" 的按钮、卡片）都从干净的页面点一次，点完记录：报错、“点了什么都没变”；
## - 每一个带浮签的东西（meta "tip"）都悬停一次，浮签内容为空记“浮签空”；
## - Q / E 翻页、Z / C 换人、Esc 各按一次；
## - 每页查“越界”：可见文字有一半以上跑出 1280×720 画面、或伸出所在面板（被裁掉）。
## 用法：godot --headless --path game -- --menu-sweep=<进度点.json> --out=<报告.json>

const H := preload("res://scripts/tests/harness.gd")
var h: Node
var args := {}
var stats := {"pages": 0, "clicks": 0, "tips": 0, "keys": 0}
var quiet: Array = []    # 点了什么都没变的（不一定是错：比如点的是已选中的页签），单列备查

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	h = H.new(); add_child(h)
	h.driving = false
	await get_tree().process_frame
	await run()
	h.write_report(args.get("out", "user://menu_sweep.json"), {"stats": stats, "quiet": quiet})
	await get_tree().create_timer(0.3).timeout
	get_tree().quit(1 if h.issues.size() else 0)

func run() -> void:
	var snap = JSON.parse_string(FileAccess.get_file_as_string(args.get("menu-sweep", "")))
	if not (snap is Dictionary):
		h.issue("读档失败", "进度点读不出来", args.get("menu-sweep", "")); return
	if not await h.load_state(snap, "selftest_menu"):
		h.issue("卡住", "读档后动不了", ""); return
	h.flush_errors()
	var base: Dictionary = h.snapshot()
	var actors: Array = Menu.roster().map(func(r): return str(r.id))
	for page in Menu.PAGES.keys():
		var who_list: Array = actors if page in Menu.RAIL_PAGES else [""]
		for who in who_list:
			await _page(base, page, who)

func _reset(base: Dictionary, page: String, who: String) -> void:
	if Menu.s.get("open"): Menu.s.draft = null; Menu.s.points = null; Menu.close()
	await get_tree().process_frame
	G.S = G._fix_numbers(base.duplicate(true))
	G.mode = "scene"
	World.busy = false; Dialog.busy = false
	Menu.open(page, who)
	await get_tree().process_frame
	await get_tree().process_frame

func _sig() -> String:
	# 菜单此刻的“样子”：页、人、选中、详情、确认框、浮层、各种页内状态，外加页面里可见文字的拼接
	var st := {}
	for k in Menu.s: if not (Menu.s[k] is Callable): st[k] = str(Menu.s[k])
	var txt := ""
	if Menu.panel:
		for n in Menu.panel.find_children("*", "Label", true, false):
			if n.is_visible_in_tree(): txt += n.text + "|"
	return str(st) + str(Menu.overlay.visible if Menu.overlay else false) + str(UI.panel_open()) + str(G.mode) + txt.md5_text()

func _clickables() -> Array:
	var out := []
	if Menu.panel == null: return out
	for n in Menu.panel.find_children("*", "", true, false):
		if n is Control and n.has_meta("qj") and n.is_visible_in_tree(): out.append(n)
	return out

func _page(base: Dictionary, page: String, who: String) -> void:
	var where := "%s%s" % [page, ("·" + who) if who != "" else ""]
	h.ctx("菜单 " + where)
	await _reset(base, page, who)
	if not Menu.s.get("open"):
		h.issue("打不开", "菜单页打不开", where); return
	stats.pages += 1
	_overflow(where)
	h.flush_errors()
	# 浮签
	for n in Menu.panel.find_children("*", "", true, false):
		if n is Control and n.has_meta("tip") and n.is_visible_in_tree():
			var key := str(n.get_meta("tip"))
			var body = Menu.tip_content(key)
			stats.tips += 1
			if body == null: h.issue("浮签空", "悬停没有说明（%s）" % key, where)
			elif body is Node: body.queue_free()
	h.flush_errors()
	# 每个可点的东西
	var n0 := _clickables().size()
	for i in n0:
		await _reset(base, page, who)
		var cs := _clickables()
		if i >= cs.size(): break
		var node: Control = cs[i]
		var act := str(node.get_meta("qj"))
		var nid := str(node.get_meta("id", ""))
		var label := "%s 第%d个「%s」%s" % [where, i + 1, act, ("(" + str(node.get_meta("id")) + ")") if node.has_meta("id") else ""]
		h.ctx(label)
		var before := _sig()
		node.pressed.emit()
		for _f in 4: await get_tree().process_frame
		stats.clicks += 1
		h.flush_errors()
		if _sig() == before and not (act == "page" and nid == page):
			quiet.append(label)
		if Menu.s.get("open") and Menu.panel: _overflow(label)
	# 按键
	for k in [KEY_Q, KEY_E, KEY_Z, KEY_C, KEY_ESCAPE]:
		await _reset(base, page, who)
		h.ctx("%s 按键 %s" % [where, OS.get_keycode_string(k)])
		for pressed in [true, false]:
			var e := InputEventKey.new(); e.keycode = k; e.physical_keycode = k; e.pressed = pressed
			Input.parse_input_event(e)
		for _f in 4: await get_tree().process_frame
		stats.keys += 1
		h.flush_errors()

## 越界：可见文字有一半以上出了画面，或伸出最近一个裁剪容器（ScrollContainer / clip_contents）
func _overflow(where: String) -> void:
	var view := Rect2(0, 0, 1280, 720)
	var inv := Menu.panel.get_global_transform().affine_inverse()
	for n in Menu.panel.find_children("*", "Label", true, false):
		var l: Label = n
		if not l.is_visible_in_tree() or l.text.strip_edges() == "" or l.modulate.a < 0.05: continue
		var r := l.get_global_rect()
		var rr := Rect2(inv * r.position, r.size)
		# 在滚动区里的：只要滚动区本身在画面里就算正常（往下滚才看得到）
		var sc_anc := false
		var q := l.get_parent()
		while q and q != Menu.panel:
			if q is ScrollContainer: sc_anc = true; break
			q = q.get_parent()
		if sc_anc: continue
		if rr.size.x <= 0 or rr.size.y <= 0: continue
		var inside := rr.intersection(view)
		if inside.get_area() < rr.get_area() * 0.5:
			h.issue("越界", "文字「%s」跑出画面" % l.text.substr(0, 16), where); continue
		var p := l.get_parent()
		while p and p is Control and p != Menu.panel:
			if (p as Control).clip_contents or p is ScrollContainer:
				var pr := (p as Control).get_global_rect()
				if r.intersection(pr).get_area() < r.get_area() * 0.5 and not (p is ScrollContainer):
					h.issue("越界", "文字「%s」被裁掉一半以上" % l.text.substr(0, 16), where)
				break
			p = p.get_parent()
