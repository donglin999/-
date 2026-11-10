extends Node
## 赠礼／赔礼面板、易物面板、买卖挂轴商店（原版 js/qihe-gift-ui.js，window.QiheGiftUI；样式 qihe-gift-ui.css）。
## 画面按 1600×900 写（#qg-layer z-index 60），整层缩到 960×540。规则在 gift.gd，台词在 ink（qh_gift_line、qh_trade_line、qh_trade_hero）。
const K := preload("res://scripts/npc/gift_kit.gd")
const SU := preload("res://scripts/npc/scroll_ui.gd")
const U := preload("res://scripts/npc/util.gd")
const ShopUI := preload("res://scripts/npc/shop_ui.gd")
const TradeUI := preload("res://scripts/npc/trade_ui.gd")

var cl: CanvasLayer
var layer: Control
var key_fn: Callable = Callable()
var opened_at := 0.0
var active: Callable = Callable()   # 当前这一轮面板的收尾函数

func _ready() -> void:
	cl = CanvasLayer.new(); cl.layer = 31; add_child(cl)
	layer = Control.new(); layer.name = "qg-layer"; layer.size = Vector2(1600, 900); layer.scale = Vector2(0.6, 0.6)
	layer.mouse_filter = Control.MOUSE_FILTER_IGNORE; layer.visible = false
	cl.add_child(layer)

func G(): return get_parent().gift
func Q(): return get_parent().core

func now_ms() -> float: return Time.get_ticks_msec()

func ensure() -> Control:
	for c in layer.get_children(): c.queue_free()
	layer.visible = true
	return layer

func shut() -> void:
	active = Callable()
	for c in layer.get_children(): c.queue_free()
	layer.visible = false
	key_fn = Callable()

func close() -> void:
	if active.is_valid():
		var f := active; active = Callable(); f.call("closed"); return
	shut()

var is_open: bool:
	get: return key_fn.is_valid()

## 拦下整次按键；忽略长按自动重复；打开 0.2 秒内不收确认键（墨印上按住 E 会误送）
func _input(e: InputEvent) -> void:
	if not key_fn.is_valid(): return
	if e is InputEventKey:
		get_viewport().set_input_as_handled()
		if not e.pressed or e.echo: return
		var k: String = get_parent().KEYMAP.get(e.keycode, OS.get_keycode_string(e.keycode).to_lower())
		if k in ["e", "enter", " "] and now_ms() - opened_at < 200: return
		key_fn.call(k)

# ════════ 赠礼／赔礼 ════════
func gift(n: Dictionary, p: Dictionary):
	var L := ensure()
	var pn := GiftPanel.new()
	pn.ui = self; pn.p = p; pn.n = n
	L.add_child(pn)
	UI.push_panel(pn)
	active = pn.finish
	opened_at = now_ms()
	key_fn = pn.on_key
	pn.redraw()
	var v = await pn.done
	UI.pop_panel(pn)
	shut()
	await get_tree().process_frame   # 等这次按键分发完再交回
	return v

class GiftPanel extends Control:
	signal done(v)
	var ui; var p: Dictionary; var n
	var focus := 0
	var logs: Array = []
	var bubble := ""
	var busy := false
	var delta := 0
	var _done := false
	var confirm = null      # {text, cb}
	var cells: Array = []   # Rect2
	var dyn: Control
	var log_serial := 0

	func _init() -> void:
		size = Vector2(1600, 900); mouse_filter = Control.MOUSE_FILTER_STOP

	func _exit_tree() -> void: finish("closed")

	func finish(v) -> void:
		if _done: return
		_done = true
		done.emit(v)

	func he() -> String: return "她" if U.t(p.get("she")) else "他"

	func bag() -> Array: return ui.G().bag_for(p)

	func on_key(k: String) -> void:
		if confirm != null:
			if k == "escape": _end_confirm(false)
			elif k in ["e", "enter", " "]: _end_confirm(true)
			return
		var nn := bag().size()
		if k == "escape": finish("again"); return
		if nn == 0: return
		var mv = {"arrowleft": -1, "arrowright": 1, "arrowup": -5, "arrowdown": 5, "a": -1, "d": 1, "w": -5, "s": 5}.get(k)
		if mv != null: focus = clampi(focus + mv, 0, nn - 1); redraw(); return
		if k in ["e", "enter", " "]: pick(focus)

	func _end_confirm(v: bool) -> void:
		var cb: Callable = confirm.cb
		confirm = null
		ui.opened_at = ui.now_ms()
		cb.call(v)

	func pick(i: int) -> void:
		if busy: return
		var list := bag()
		if i < 0 or i >= list.size(): return
		var it: Dictionary = list[i]
		var b: Dictionary = ui.Q().bond_get(p.id)
		if b.stage == "仇视": return
		if it.tier >= 3:
			var ok = await _confirm_box("真要把%s%s给%s？" % [it.name, "赔" if b.score < 0 else "送", he()])
			if not ok: redraw(); return
		busy = true
		var r: Dictionary = ui.G().give(p, it.id)
		var kind: String = r.kind
		var ln = await ui.G().line_for("qh_gift_line", {"pid": p.id, "kind": kind, "why": U.nz(r.get("why"), ""), "who": p.name})
		bubble = ln.text if ln else ""
		if not r.keep:
			logs.append("失去 1 个[color=#efce83]%s[/color]" % SU.esc(r.name))
			var d: int = int(r.after) - int(r.before)
			if d != 0: logs.append("与%s关系%s [color=%s]%d[/color] 点" % [SU.esc(p.name), "提升" if d > 0 else "下降", "#8fd19a" if d > 0 else "#f0a18a", absi(d)])
			if r.stage != r.stageBefore: logs.append("与%s关系到了[color=#efce83]%s[/color]" % [SU.esc(p.name), r.stage])
			if U.t(r.get("firstKnown")) and r.kind == "xi": logs.append("摸清了：%s喜欢[color=#efce83]%s[/color]" % [SU.esc(p.name), SU.esc(r.firstKnown)])
			if r.get("returned"): logs.append("%s回赠你 1 个[color=#efce83]%s[/color]" % [SU.esc(p.name), SU.esc(r.returned.name)])
			delta = d
		elif U.t(r.get("firstKnown")):
			logs.append("摸清了：%s不收[color=#efce83]%s[/color]" % [SU.esc(p.name), SU.esc(r.firstKnown)])
		logs = logs.slice(maxi(0, logs.size() - 4))
		busy = false
		redraw()
		log_serial += 1
		var my := log_serial
		await get_tree().create_timer(3.2).timeout
		if my == log_serial and not _done: logs = []; redraw()

	func _confirm_box(text: String):
		var res := [null]
		confirm = {"text": text, "cb": func(v): res[0] = v}
		ui.opened_at = ui.now_ms()
		redraw()
		while res[0] == null and not _done: await get_tree().process_frame
		return res[0] == true

	func _gui_input(e: InputEvent) -> void:
		if _done: return
		if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
			if confirm != null:
				if Rect2(confirm_rect.ok).has_point(e.position): _end_confirm(true)
				elif Rect2(confirm_rect.no).has_point(e.position): _end_confirm(false)
			elif e.position.distance_to(Vector2(300 + 1120 + 12 - 17, 150 - 26 + 17)) < 18: finish("again")
			else:
				for i in cells.size():
					if cells[i].has_point(e.position): pick(i)
		elif e is InputEventMouseMotion and confirm == null:
			for i in cells.size():
				if cells[i].has_point(e.position) and i != focus: focus = i; redraw()
		accept_event()

	var confirm_rect := {"ok": Rect2(), "no": Rect2()}

	## 重建文字层（Label/RichText），图形在 _draw 里画
	func redraw() -> void:
		if dyn: dyn.queue_free()
		dyn = Control.new(); dyn.size = size; dyn.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(dyn)
		var G = ui.G()
		var b: Dictionary = ui.Q().bond_get(p.id)
		var neg: bool = b.score < 0
		var given: int = G.given_to(p)
		var list: Array = bag()
		var h := he()
		focus = clampi(focus, 0, maxi(0, list.size() - 1))
		# 人物卡 .qg-card（left 340 top 190，网格 96 + 1fr，gap 6 18）；.kv 四列 auto 1fr auto 1fr、gap 9 12、宽 426；
		# index.html .kv>div（nm、likes）：flex 两端对齐、底 var(--well)、padding .3em .8em、左边 2px var(--bz)。行高照原版实测：nm 42、关系 22、喜好 34
		var KX := 340.0 + 96 + 18
		var place := func(l: Control, x: float, cy: float, right := false) -> void:
			dyn.add_child(l)
			var ms := l.get_combined_minimum_size()
			l.size = ms
			l.position = Vector2(x - ms.x if right else x, roundf(cy - ms.y / 2))
		place.call(SU.span(str(p.name), UI.song_bold, 21, Color("#efd9a6"), 5), KX + 2 + 16.8, 190 + 21)
		place.call(SU.span(str(p.get("role", "")), UI.song, 13, Color("#b9ab8a"), 2), KX + 426 - 16.8 + 2, 190 + 22, true)
		var cw := (426.0 - 32 * 2 - 12 * 3) / 2
		var r1y := 190.0 + 42 + 9 + 11
		place.call(SU.span("关系", UI.song, 14, Color("#b9ab8a"), 2), KX, r1y)
		var stg := "[color=%s]%s　%d[/color]" % ["#f0a18a" if neg else "#efce83", b.stage, b.score]
		if delta != 0: stg += "[b][color=%s]%s%d[/color][/b]" % ["#f0a18a" if delta < 0 else "#8fd19a", "　＋" if delta > 0 else "　", delta]
		place.call(SU.rich(stg, 16, Color("#f2e5c9"), cw, 1.3, 1), KX + 32 + 12, r1y)
		place.call(SU.span("送过", UI.song, 14, Color("#b9ab8a"), 2), KX + 32 + 12 + cw + 12, r1y)
		place.call(SU.span(("%d 件" % given) if given else "还没送过", UI.song, 16, Color("#f2e5c9") if given else Color("#8d846f"), 1), KX + 32 * 2 + 12 * 3 + cw, r1y)
		place.call(SU.span("喜好", UI.song, 14, Color("#b9ab8a"), 2), KX, r1y + 11 + 9 + 17)
		_kv_well = [Rect2(KX, 190, 426, 42), Rect2(KX + 32 + 12, r1y + 11 + 9, cw, 34)]
		_likes_pos = Vector2(KX + 32 + 12 + 2 + 12.8, r1y + 11 + 9 + 5)
		_likes_step = (cw - 2 - 12.8 * 2 - 24) / 2
		# 气泡 .qg-say（left 340 top 300）
		if bubble != "":
			var bl := SU.para(bubble, 15, Color("#1d1a15"), 0, 1.5, 1)
			bl.custom_minimum_size.x = 0; bl.autowrap_mode = TextServer.AUTOWRAP_OFF
			var bw := minf(bl.get_minimum_size().x, 520 - 28)
			bl.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY; bl.custom_minimum_size.x = bw
			var bp := PanelContainer.new(); bp.position = Vector2(340, 300); bp.mouse_filter = Control.MOUSE_FILTER_IGNORE; bp.z_index = 4
			var bsb := StyleBoxFlat.new(); bsb.bg_color = Color("#f3e9d2"); bsb.set_corner_radius_all(4); bsb.shadow_color = Color(0, 0, 0, 0.45); bsb.shadow_size = 3; bsb.shadow_offset = Vector2(0, 2)
			bsb.content_margin_left = 14; bsb.content_margin_right = 14; bsb.content_margin_top = 7; bsb.content_margin_bottom = 7
			bp.add_theme_stylebox_override("panel", bsb); bp.add_child(bl); dyn.add_child(bp)
		# 关系能换来 .qg-perks（left 340 top 360，宽 520，gap 8）
		var pk := VBoxContainer.new(); pk.position = Vector2(340, 360); pk.custom_minimum_size.x = 520; pk.add_theme_constant_override("separation", 8); pk.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var cap := SU.span("你们现在是“%s”%s" % [b.stage, "，关系能换来这些" if b.score >= 0 else ""], UI.song, 14.5, Color("#cdbf9c"), 1.5)
		var capm := Control.new(); capm.custom_minimum_size = Vector2(520, 21 + 2); capm.add_child(cap); capm.mouse_filter = Control.MOUSE_FILTER_IGNORE
		# 14.5px：按 15 排字再缩回
		cap.scale = Vector2.ONE * Paint.fk(14.5)
		cap.position.y = roundf((21 - cap.get_combined_minimum_size().y * Paint.fk(14.5)) / 2)
		pk.add_child(capm)
		_perk_rows = []
		for row in G.perks(p):
			var on: bool = b.score >= row.min and (row.get("max") == null or b.score <= row.max)
			var st := ("bad" if row.min < 0 else "on") if on else ""
			var pr := Control.new(); pr.custom_minimum_size = Vector2(520, 42); pr.mouse_filter = Control.MOUSE_FILTER_IGNORE
			var tc := Color("#e8f1e4") if st == "on" else (Color("#f6d9cf") if st == "bad" else Color("#8d846f"))
			var tl := SU.span(str(row.text), UI.song, 15, tc, 1); tl.position = Vector2(3 + 14 + 24 + 10, 0); tl.size.y = 42; tl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			var tt := SU.span(str(row.tier), UI.song, 14, Color("#9fd3b2") if st == "on" else (Color("#f0a18a") if st == "bad" else Color("#8d846f")), 3)
			tt.size.y = 42; tt.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			pr.add_child(tl); pr.add_child(tt)
			tt.position.x = 0; tt.size.x = 520 - 14 + 3; tt.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
			var stc := st
			pr.draw.connect(func():
				var bg := Color(61 / 255.0, 111 / 255.0, 98 / 255.0, 0.28) if stc == "on" else (Color(155 / 255.0, 59 / 255.0, 46 / 255.0, 0.22) if stc == "bad" else Color(14 / 255.0, 16 / 255.0, 14 / 255.0, 0.55))
				var bl2 := Color("#6fae8f") if stc == "on" else (Color("#c4553d") if stc == "bad" else Color(120 / 255.0, 110 / 255.0, 90 / 255.0, 0.5))
				pr.draw_rect(Rect2(0, 0, 520, 42), bg); pr.draw_rect(Rect2(0, 0, 3, 42), bl2)
				var lc := (Color("#f0a18a") if stc == "bad" else Color("#8fd19a")) if stc != "" else Color("#6d665a")
				_lock(pr, Vector2(3 + 14, 11), stc != "", lc))
			pk.add_child(pr)
		var hint: String = G.hint(p)
		if hint != "":
			var hm := MarginContainer.new(); hm.add_theme_constant_override("margin_top", 6 - 8); hm.mouse_filter = Control.MOUSE_FILTER_IGNORE
			hm.add_child(SU.span(hint, UI.song, 14, Color("#f0b6a2") if neg else Color("#efce83"), 1.5)); pk.add_child(hm)
		dyn.add_child(pk)
		# 右侧标题 .qg-rhead（left 900 top 190）
		var rh := SU.row([SU.span(("选一件赔给" + h) if neg else ("选一件送" + h), UI.song, 15, Color("#e7d7b4"), 2),
			SU.span((h + "只收厚礼或" + h + "喜欢的") if neg else "点一下就送出 · 停在上面看详情", UI.song, 13, Color("#a99d82"), 1)], 8)
		rh.get_child(1).size_flags_vertical = Control.SIZE_SHRINK_END
		rh.position = Vector2(900, 190); dyn.add_child(rh)
		# 格子（left 904 top 232，5 列 74，gap 16）
		cells = []
		for i in list.size(): cells.append(Rect2(904 + (i % 5) * 90, 232 + int(i / 5) * 90, 74, 74))
		# 详情 .qg-tip
		var mask := ""
		if b.stage == "仇视": mask = h + "不收你的东西了，要请中人说和"
		elif list.is_empty(): mask = "行囊里没有能送的东西"
		_mask = mask
		if mask == "" and list.size():
			var fo: Dictionary = list[focus]
			var pv = G.preview(p, fo.id)
			var tip := PanelContainer.new(); tip.z_index = 5; tip.mouse_filter = Control.MOUSE_FILTER_IGNORE
			tip.position = Vector2(880 if 1000 + (focus % 5) * 90 > 1180 else 1000, 300 + int(focus / 5) * 90)
			var tsb := StyleBoxFlat.new(); tsb.bg_color = Color(18 / 255.0, 16 / 255.0, 13 / 255.0, 0.97); tsb.border_color = Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.7); tsb.set_border_width_all(1)
			tsb.content_margin_left = 14; tsb.content_margin_right = 14; tsb.content_margin_top = 12; tsb.content_margin_bottom = 12
			tsb.shadow_color = Color(0, 0, 0, 0.6); tsb.shadow_size = 7; tsb.shadow_offset = Vector2(0, 6)
			tip.add_theme_stylebox_override("panel", tsb)
			var tv := VBoxContainer.new(); tv.add_theme_constant_override("separation", 6); tv.custom_minimum_size.x = 250 - 28; tv.mouse_filter = Control.MOUSE_FILTER_IGNORE
			var h4 := SU.row([SU.span(str(fo.name), UI.song, 18, Color("#efd9a6"), 3), SU.span("%s · %s" % [G.TIER_NAME[fo.tier], fo.tag], UI.song, 13, Color("#b9ab8a"), 1)], 10)
			h4.get_child(1).size_flags_vertical = Control.SIZE_SHRINK_END
			tv.add_child(h4)
			tv.add_child(Paint.frac(SU.para(str(DB.ITEMS.get(fo.id, {}).get("desc", "")), 13.5, Color("#d9ccad"), 250 - 28, 1.6, 1), 13.5))
			var pvl := SU.para((h + "喜欢的：" + str(pv.text)) if pv else ("送了才知道" + h + "喜不喜欢"), 14, Color("#9fd3b2") if pv else Color("#b9ab8a"), 250 - 28, 1.3)
			var pvc := MarginContainer.new(); pvc.add_theme_constant_override("margin_top", 8); pvc.add_child(pvl); pvc.mouse_filter = Control.MOUSE_FILTER_IGNORE
			pvc.draw.connect(func():
				pvc.draw_dashed_line(Vector2(0, 0), Vector2(250 - 28, 0), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.4), 1, 3))
			tv.add_child(pvc)
			tip.add_child(tv); dyn.add_child(tip)
		# 日志 .qg-log（left 24 top 560，gap 5）
		var lg := VBoxContainer.new(); lg.position = Vector2(24, 560); lg.add_theme_constant_override("separation", 5); lg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		for i in logs.size():
			var lp := PanelContainer.new(); lp.mouse_filter = Control.MOUSE_FILTER_IGNORE
			lp.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
			var lsb := StyleBoxTexture.new()
			lsb.texture = _fade_tex(); lsb.content_margin_left = 12; lsb.content_margin_right = 18; lsb.content_margin_top = 4; lsb.content_margin_bottom = 4
			lp.add_theme_stylebox_override("panel", lsb)
			var rt := SU.rich(logs[i], 15, Color("#f2e5c9"), 0, 1.3, 1)
			rt.autowrap_mode = TextServer.AUTOWRAP_OFF; rt.fit_content = true; rt.custom_minimum_size.x = 0
			lp.add_child(rt)
			if i < logs.size() - 1: lp.modulate.a = 0.6
			lg.add_child(lp)
		dyn.add_child(lg)
		if confirm != null: _build_confirm()
		queue_redraw()

	var _likes_pos := Vector2.ZERO
	var _likes_step := 30.0
	var _kv_well: Array = []
	var _perk_rows: Array = []
	var _mask := ""

	static var _ft: Texture2D = null
	static func _fade_tex() -> Texture2D:
		if _ft == null:
			var g := Gradient.new(); g.set_color(0, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.85)); g.set_color(1, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0))
			var gt := GradientTexture2D.new(); gt.gradient = g; gt.width = 64; gt.height = 4
			_ft = gt
		return _ft

	## .qg-lock：锁（开/关）20×20
	static func _lock(ci: CanvasItem, o: Vector2, open: bool, c: Color) -> void:
		var pts := PackedVector2Array()
		if open:
			for k in 13:
				var a := PI + k * (PI * 0.62) / 12
				pts.append(o + Vector2(10, 6) + Vector2(cos(a), sin(a)) * 4)
			pts.insert(0, o + Vector2(6, 9))
		else:
			pts.append(o + Vector2(6, 9))
			for k in 13:
				var a := PI + k * PI / 12
				pts.append(o + Vector2(10, 6) + Vector2(cos(a), sin(a)) * 4)
			pts.append(o + Vector2(14, 9))
		ci.draw_polyline(pts, c, 2, true)
		var sb := StyleBoxFlat.new(); sb.bg_color = c; sb.set_corner_radius_all(2)
		ci.draw_style_box(sb, Rect2(o + Vector2(3.5, 9), Vector2(13, 9)))

	## 图形层：遮罩、面板、标题、头像、喜好三格、物品格、遮罩条、键位条（原版 gift() 里 draw 的 HTML 结构）
	func _draw() -> void:
		var G = ui.G()
		var b: Dictionary = ui.Q().bond_get(p.id)
		var neg: bool = b.score < 0
		var list: Array = bag()
		draw_rect(Rect2(0, 0, 1600, 900), Color(8 / 255.0, 10 / 255.0, 9 / 255.0, 0.5))   # .qg-catch
		K.panel(self, Rect2(300, 150, 1120, 600))
		K.close_btn(self, Vector2(300 + 1120 + 12 - 17, 150 - 26 + 17))
		K.title(self, 860, 150 - 34, "赔礼" if neg else "赠礼")
		K.avatar(self, Rect2(340, 190, 96, 96), p, n)
		# 喜好三格 .likes b（24×24，gap 6）：摸清的喜（红底）／不收（灰底划线）／未知（虚线框 ？）
		var known: Dictionary = G.state().get("known", {}).get(p.id, {})
		var likes: Array = []
		for k in known:
			if known[k] == "xi" or known[k] == "no": likes.append([str(k), known[k]])
		likes = likes.slice(0, 3)
		while likes.size() < 3: likes.append(null)
		for wr in _kv_well:
			draw_rect(wr, Color(0, 0, 0, 0.28)); draw_rect(Rect2(wr.position, Vector2(2, wr.size.y)), Color("#6e5a3e"))
		var ly := _likes_pos.y
		for i in 3:
			var r := Rect2(_likes_pos.x + i * _likes_step, ly, 24, 24)
			var x = likes[i]
			var ch := "？"; var fc := Color("#8d846f")
			if x == null:
				draw_dashed_line(r.position, Vector2(r.end.x, r.position.y), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.5), 1, 3)
				draw_dashed_line(Vector2(r.position.x, r.end.y), r.end, Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.5), 1, 3)
				draw_dashed_line(r.position, Vector2(r.position.x, r.end.y), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.5), 1, 3)
				draw_dashed_line(Vector2(r.end.x, r.position.y), r.end, Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.5), 1, 3)
			else:
				var sb := StyleBoxFlat.new(); sb.set_corner_radius_all(3)
				sb.bg_color = Color("#3a3631") if x[1] == "no" else Color("#9b3b2e")
				draw_style_box(sb, r)
				ch = x[0].substr(0, 1); fc = Color("#c9bfa8") if x[1] == "no" else Color("#fbefd6")
			var w := UI.song_bold.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x
			draw_string(UI.song_bold, Vector2(r.get_center().x - w / 2, r.get_center().y + 5), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, fc)
			if x != null and x[1] == "no": draw_line(Vector2(r.get_center().x - w / 2, r.get_center().y), Vector2(r.get_center().x + w / 2, r.get_center().y), fc, 1)
		# 物品格 .qg-it（74，圆角 12）
		for i in list.size():
			var it: Dictionary = list[i]
			var r: Rect2 = cells[i] if i < cells.size() else Rect2()
			var off := false
			if neg: off = U.t(G.judge(p, it.id).get("keep"))
			else: off = it.get("known") == "no"
			K.paper_cell(self, r, K.tier_cls(int(it.tier)), i == focus)
			K.item(self, Rect2(r.position, Vector2(r.size.x, r.size.y - 14)), str(it.id), 44, off)
			if it.get("known") == "xi":
				var lc := r.position + Vector2(-6 + 10, -6 + 10)
				draw_circle(lc, 10 + 1.5, Color("#f4ecd8")); draw_circle(lc, 10, Color("#8f2a1e")); draw_circle(lc + Vector2(-1, -1.5), 6, Color("#d4553f"))
				var lw := UI.song_bold.get_string_size("喜", HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
				draw_string(UI.song_bold, lc + Vector2(-lw / 2, 4), "喜", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#fbefd6"))
			K.paper_text(self, r, str(it.id), str(it.n))
			if off: K.why(self, r, "不收")
		for i in range(list.size(), 15):
			K.paper_cell(self, Rect2(904 + (i % 5) * 90, 232 + int(i / 5) * 90, 74, 74), 0, false, true)
		if _mask != "":
			draw_rect(Rect2(892, 222, 470, 374), Color(14 / 255.0, 14 / 255.0, 12 / 255.0, 0.6))
			var f := Paint.font(UI.song, 17, 3.0 / 17)
			var mw := f.get_string_size(_mask, HORIZONTAL_ALIGNMENT_LEFT, -1, 17).x
			draw_string(f, Vector2(892 + 235 - mw / 2, 222 + 187 + 6), _mask, HORIZONTAL_ALIGNMENT_LEFT, -1, 17, Color("#e7d7b4"))
		var act := "赔上" if neg else "送出"
		K.keys(self, [["↑↓←→", "选"], ["E", act], ["Esc", "关"], ["", "鼠标：点一下" + act + " · 停在上面看详情"]])

	## 确认框 .qg-confirm（left 600 top 360 宽 400，padding 22 24）
	func _build_confirm() -> void:
		var box := Control.new(); box.position = Vector2(600, 360); box.size = Vector2(400, 22 + 17 * 1.4 + 16 + 34 + 22); box.z_index = 8; box.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var txt: String = confirm.text
		var lbl := SU.span(txt, UI.song, 17, Color("#f2e5c9"), 2)
		lbl.position = Vector2(24, 22); lbl.size = Vector2(400 - 48, 24); lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		box.add_child(lbl)
		var bw := 4 * 16 + 4 * 4 + 44.0
		var bw2 := 2 * 16 + 2 * 4 + 44.0
		var x0 := 200 - (bw2 + 16 + bw2) / 2
		confirm_rect.ok = Rect2(600 + x0, 360 + 22 + 24 + 16, bw2, 34)
		confirm_rect.no = Rect2(600 + x0 + bw2 + 16, 360 + 22 + 24 + 16, bw2, 34)
		box.draw.connect(func():
			box.draw_rect(Rect2(Vector2(0, 10), box.size), Color(0, 0, 0, 0.35))
			box.draw_rect(Rect2(Vector2.ZERO, box.size), Color(18 / 255.0, 16 / 255.0, 13 / 255.0, 0.98))
			box.draw_rect(Rect2(Vector2.ZERO, box.size), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.7), false, 1)
			for j in 2:
				var rr: Rect2 = confirm_rect.ok if j == 0 else confirm_rect.no
				rr.position -= Vector2(600, 360)
				var sb := StyleBoxFlat.new(); sb.set_corner_radius_all(4); sb.set_border_width_all(1)
				sb.bg_color = Color("#8a3428") if j == 0 else Color("#2a211a")
				sb.border_color = Color("#e2c27c") if j == 0 else Color(215 / 255.0, 184 / 255.0, 116 / 255.0, 0.6)
				box.draw_style_box(sb, rr)
				var s := "送" if j == 0 else "算了"
				var f := Paint.font(UI.song, 16, 4.0 / 16)
				var w := f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x
				box.draw_string(f, Vector2(rr.get_center().x - w / 2, rr.get_center().y + 6), s, HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("#f2e5c9")))
		dyn.add_child(box)

# ════════ 易印（原版 yi）：寻常人直接上秤；功能人物先选“以物易物／买卖” ════════
func yi(npc: Dictionary, p: Dictionary):
	var bs: Dictionary = G().barter_state(p)
	if not U.t(p.get("shop")):
		if U.t(bs.get("off")) or U.t(bs.get("hidden")): return "again"
		return await trade(npc, p)
	var i = await Dialog.choose("", "跟" + str(p.name) + "以物易物，还是买卖？", ["以物易物", "买卖", "算了"], "", 2)
	if i == 0: return "again" if U.t(bs.get("off")) else await trade(npc, p)
	if i == 1:
		var side = Flow.get_node_or_null("Side")   # 原版 window.QiheTown.shop
		var shops = DB.g("QIHE_NPC_ITEMS").get("SHOPS", {}) if DB.g("QIHE_NPC_ITEMS") is Dictionary else {}
		if side and side.has_method("shop") and shops.has(p.id):
			await side.shop(p.id)
			return "again"
		return "buy"
	return "again"

## 易物秤（原版 trade），界面在 trade_ui.gd
func trade(npc: Dictionary, p: Dictionary):
	var L := ensure()
	var pn = TradeUI.new()
	pn.ui = self; pn.p = p; pn.n = npc
	L.add_child(pn)
	UI.push_panel(pn)
	active = pn.finish
	opened_at = now_ms()
	key_fn = pn.on_key
	pn.start()
	var v = await pn.done
	UI.pop_panel(pn)
	shut()
	await get_tree().process_frame
	return v

## 挂轴商店（原版 shop），opts：{list:[{id,price}], buys, off, offNote, say}；界面在 shop_ui.gd
func shop(npc, p: Dictionary, opts: Dictionary):
	var L := ensure()
	var pn = ShopUI.new()
	pn.ui = self; pn.p = p; pn.n = npc; pn.opts = opts
	L.add_child(pn)
	UI.push_panel(pn)
	active = pn.finish
	opened_at = now_ms()
	key_fn = pn.on_key
	pn.start()
	var v = await pn.done
	UI.pop_panel(pn)
	shut()
	await get_tree().process_frame
	return v
