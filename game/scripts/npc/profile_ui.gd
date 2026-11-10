extends Control
## 查看页（原版 js/qihe-npc-ui.js profile()/powerHTML/equipHTML/artsHTML/radar/portraitHTML/paintScene/factionRowHTML，
## 样式 qihe-npc-ui.css .qn-page）。坐标为 1600×900 设计尺寸。await done → {act, p, npc} 或 null（Esc 返回）。
signal done(v)
const Seal := preload("res://scripts/npc/seal.gd")
const SU := preload("res://scripts/npc/scroll_ui.gd")
const U := preload("res://scripts/npc/util.gd")
const INK := Color("#1f1c16")
const DIMC := Color("#7d735f")   # 11-09 第四十八轮：原 #9a917e 太淡
const GREY := Color("#7a7060")
const KEYS := ["str", "con", "agi", "wil", "wis"]
const KN := ["臂力", "根骨", "身法", "定力", "悟性"]

var host: Node
var Q
var p: Dictionary
var npc: Dictionary
var acts: Array = []
var act_rects: Array = []
var fi := -1
var t := 0.0
var _done := false
var bg: Texture2D
var content: Control
var nudge := {}
var scene_tex: Texture2D = null   # 取景（地图截图）

func setup(h: Node, person: Dictionary, n: Dictionary) -> void:
	host = h; Q = h.core; p = person; npc = n
	size = Vector2(1600, 900)
	mouse_filter = Control.MOUSE_FILTER_STOP
	bg = load("res://assets/ui/jianghu-v4/background.webp") if ResourceLoader.exists("res://assets/ui/jianghu-v4/background.webp") else null
	render()
	host.capture_keys(_on_key)

func _on_key(k: String) -> void:
	if k in ["escape", "x", "backspace", "q"]: finish(null)
	elif k == "z": swap(-1)
	elif k == "c": swap(1)
	elif k in ["a", "arrowleft", "w", "arrowup"]: focus_act(-1)
	elif k in ["d", "arrowright", "s", "arrowdown"]: focus_act(1)
	elif k in ["e", "enter", " "]:
		if fi >= 0: choose(fi)
		else: focus_act(1)

func choose(i: int) -> void:
	if i < 0 or i >= acts.size(): return
	var a: Dictionary = acts[i]
	if a.st == "off" and a.get("say"):
		var c := a.duplicate(); c.run = "say"; finish({"act": c, "p": p, "npc": npc}); return
	if a.st == "off": nudge[i] = t; return
	finish({"act": a, "p": p, "npc": npc})

func focus_act(d: int) -> void:
	var n := acts.size()
	if n == 0: return
	fi = (fi + d + n) % n

## 原版 nearbyPeople：身边 320 以内、人物表里的人
func nearby() -> Array:
	var out: Array = []
	for n in World.npcs:
		var pp = Q.person_for(n)
		if pp == null: continue
		if Vector2(n.x * World.TS - World.player.x, n.y * World.TS - World.player.y).length() > 320: continue
		if out.any(func(o): return o.p == pp): continue
		out.append({"npc": n, "p": pp})
	return out

func swap(d: int) -> void:
	var list := nearby()
	if list.size() < 2: return
	var i := list.find_custom(func(o): return o.p == p)
	var o: Dictionary = list[(i + d + list.size()) % list.size()]
	p = o.p; npc = o.npc
	render()

func finish(v) -> void:
	if _done: return
	_done = true
	host.capture_keys(Callable())
	done.emit(v)

func _process(dt: float) -> void:
	t += dt
	modulate.a = clampf(t / 0.16, 0, 1)
	queue_redraw()

func _gui_input(e: InputEvent) -> void:
	if _done: return
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		if Rect2(1600 - 60 - 90, 34, 90, 44).has_point(e.position): finish(null)
		for i in act_rects.size():
			if act_rects[i].has_point(e.position): choose(i)
	accept_event()

# ───── 渲染（重建内容节点；底、立绘、印在 _draw 里画） ─────
func render() -> void:
	if content: content.queue_free()
	content = Control.new(); content.size = size; content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(content)
	var v: Dictionary = Q.view(p)
	acts = Q.menu_for(p, npc).filter(func(x): return x.id != "guan")
	fi = -1
	scene_tex = null
	if not U.t(p.get("portrait")): scene_tex = host.grab_scene(npc)
	# 竖排名 .namecol（left 40 top 110）
	var nc := HBoxContainer.new(); nc.position = Vector2(40, 110); nc.add_theme_constant_override("separation", 10); nc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	nc.add_child(_vert(str(p.name), UI.song_bold, 54, Color("#1b1a16"), 14))
	var idt := MarginContainer.new(); idt.mouse_filter = Control.MOUSE_FILTER_IGNORE
	idt.add_theme_constant_override("margin_top", 10 + 10)
	idt.add_child(_vert(str(p.get("faction", "")) + " · " + str(p.get("role", "")), UI.song, 16, Color("#4c463a"), 6))
	nc.add_child(idt)
	content.add_child(nc)
	# 顶栏 .topbar（left 620 top 40）
	var tb := SU.row([SU.span("查看", UI.song_bold, 34, INK, 14), SU.span(str(World.cur.get("name", "")), UI.song, 15, GREY, 4)], 22)
	tb.get_child(1).size_flags_vertical = Control.SIZE_SHRINK_END
	tb.position = Vector2(620, 40); content.add_child(tb)
	# Esc（right 60 top 34）
	var el := SU.span("Esc", UI.song, 14, GREY, 2); el.position = Vector2(1600 - 60 - 30, 34 + 12); content.add_child(el)
	# 中栏
	var mid := VBoxContainer.new(); mid.position = Vector2(620, 118); mid.custom_minimum_size.x = 400; mid.size.x = 400
	mid.add_theme_constant_override("separation", 0); mid.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mid.add_child(_power(v))
	var fr = _faction_row()
	if fr: mid.add_child(fr)
	mid.add_child(_h3("装备", "随时看得见", 400))
	mid.add_child(_equip(v))
	mid.add_child(SU.gap(22))
	var sm := _stat_mode(v)
	mid.add_child(_h3("根基", "" if U.t(v.get("civil")) else ("未登记" if sm == "none" else str(v.tier.statNote)), 400))
	var rd := _radar(v); var rm := MarginContainer.new(); rm.add_theme_constant_override("margin_left", 50); rm.add_child(rd); rm.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mid.add_child(rm)
	content.add_child(mid)
	# 右栏
	var right := VBoxContainer.new(); right.position = Vector2(1090, 118); right.size.x = 460
	right.add_theme_constant_override("separation", 0); right.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var art := _arts(v)
	right.add_child(_h3("武学", art.note, 460))
	right.add_child(art.node)
	right.add_child(SU.gap(18))
	right.add_child(_h3("随身物品", "看得见的都列出", 460))
	var bag: Array = Q.bag_of(p, v)
	if bag.size():
		var fl := HFlowContainer.new(); fl.add_theme_constant_override("h_separation", 8); fl.add_theme_constant_override("v_separation", 14)
		fl.custom_minimum_size.x = 458; fl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		for it in bag: fl.add_child(_slot(it))
		var bm := MarginContainer.new(); bm.add_theme_constant_override("margin_left", 2); bm.add_child(fl); bm.mouse_filter = Control.MOUSE_FILTER_IGNORE
		right.add_child(bm)
	else: right.add_child(_empty("身上没带什么"))
	content.add_child(right)
	# 底部交互印 .acts（left 620 bottom 44，gap 22；印 46，gap 8；al 16px 字距 4，i 11.5px）
	act_rects = []
	var x := 620.0
	var cy := 900.0 - 44 - 23
	for i in acts.size():
		var a: Dictionary = acts[i]
		var lab := SU.span(str(a.lab), UI.song, 16, DIMC if a.st == "off" else INK, 4)
		var col := VBoxContainer.new(); col.add_theme_constant_override("separation", 0); col.mouse_filter = Control.MOUSE_FILTER_IGNORE
		content.add_child(col)
		col.add_child(_fixh(lab, 22))
		var w2 := lab.get_combined_minimum_size().x
		if a.st != "normal" and U.t(a.get("note")):
			# .al i：11.5px 字距 1，max-width 120，超出省略号（行高照原版实测 16）
			var nl := SU.span(str(a.note), UI.song, 11.5, GREY, 1)
			var nb := _fixh(Paint.frac(nl, 11.5), 16)
			var nw := nl.get_combined_minimum_size().x * Paint.fk(11.5)
			if nw > 120:
				nl.clip_text = true; nl.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
				nw = 120; nb.custom_minimum_size.x = 120
			col.add_child(nb)
			w2 = maxf(w2, nw)
		var cs := col.get_combined_minimum_size()
		col.position = Vector2(x + 46 + 8, cy - cs.y / 2); col.size = Vector2(w2, cs.y)
		act_rects.append(Rect2(x, cy - 23, 46 + 8 + w2, 46))
		x += 46 + 8 + w2 + 22
	var sw := SU.span("A / D 选印 · E 确定 · Z / C 换人（只列身边的人）· Esc 返回", UI.song, 13, GREY, 1)
	content.add_child(sw)
	sw.position = Vector2(x - 22 + 18 + 22, cy - sw.get_minimum_size().y / 2)

func _vert(s: String, f: Font, px: int, col: Color, sp: float) -> Control:
	# writing-mode:vertical-rl：逐字竖排，字距作为行距
	var c := Control.new(); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var step := px + sp
	c.custom_minimum_size = Vector2(px * 1.1, step * s.length())
	var glow := Color("#f6f0e2")
	c.draw.connect(func():
		for i in s.length():
			var ch := s[i]
			if ch == " ": continue
			var w := f.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
			var pos := Vector2((px * 1.1 - w) / 2, i * step + f.get_ascent(px))
			if ch == "·": pos.x = (px * 1.1 - w) / 2
			for d in [Vector2(-2, 0), Vector2(2, 0), Vector2(0, -2), Vector2(0, 2)]:
				c.draw_string(f, pos + d, ch, HORIZONTAL_ALIGNMENT_LEFT, -1, px, Color(glow, 0.5))
			c.draw_string(f, pos, ch, HORIZONTAL_ALIGNMENT_LEFT, -1, px, col))
	return c

## h3：22px 粗 字距 10，两端对齐；hs 12.5px；下接 .brush（margin 4 0 10，高 9）
## 行高照原版实测：h3 高 32，hs 盒高 17、顶在 h3 下 10（基线对齐的结果）
func _h3(title: String, hs: String, w: float) -> Control:
	var v := VBoxContainer.new(); v.add_theme_constant_override("separation", 0); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var r := Control.new(); r.mouse_filter = Control.MOUSE_FILTER_IGNORE; r.custom_minimum_size = Vector2(w, 32)
	r.add_child(_fixh(SU.span(title, UI.song_bold, 22, INK, 10), 32))
	var hl := SU.span(hs, UI.song, 12.5, GREY, 2); hl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	var hb := _fixh(Paint.frac(hl, 12.5), 17); r.add_child(hb)
	hb.custom_minimum_size.x = w; hb.size.x = w; hb.position = Vector2(0, 10)
	v.add_child(r)
	var br := Control.new(); br.custom_minimum_size = Vector2(w, 4 + 9 + 10); br.mouse_filter = Control.MOUSE_FILTER_IGNORE
	br.draw.connect(func():
		var poly := [[0, 40], [8, 20], [30, 30], [60, 18], [85, 35], [100, 50], [82, 70], [55, 78], [25, 70], [4, 80]]
		var pts := PackedVector2Array(); var cols := PackedColorArray()
		for q in poly:
			pts.append(Vector2(w * q[0] / 100.0, 4 + 9 * q[1] / 100.0))
			var x: float = q[0] / 100.0
			var al := 0.62 + (0.45 - 0.62) * x / 0.35 if x < 0.35 else (0.45 + (0.28 - 0.45) * (x - 0.35) / 0.4 if x < 0.75 else 0.28 * (1 - (x - 0.75) / 0.25))
			cols.append(Color(30 / 255.0, 30 / 255.0, 26 / 255.0, al))
		br.draw_polygon(pts, cols))
	v.add_child(br)
	return v

## 定行高：CSS line-height normal 比 Godot Label 的字高矮 1～3px，逐行累计会把下面整栏推低；
## 把控件放进定高盒（高度取原版实测）里垂直居中
func _fixh(l: Control, h: float) -> Control:
	var c := Control.new(); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.custom_minimum_size = Vector2(l.get_combined_minimum_size().x, h)
	c.size = c.custom_minimum_size
	c.size_flags_horizontal = l.size_flags_horizontal; c.size_flags_vertical = l.size_flags_vertical
	# 铺满定高盒、上下对称撑开（字高大于盒高时居中溢出）
	l.set_anchors_preset(Control.PRESET_FULL_RECT); l.grow_vertical = Control.GROW_DIRECTION_BOTH
	if l is Label: l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	elif l is Paint.FracBox: l.label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	c.add_child(l)
	return c

func _empty(s: String) -> Control:
	var m := MarginContainer.new(); m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for k in ["top", "bottom"]: m.add_theme_constant_override("margin_" + k, 10)
	for k in ["left", "right"]: m.add_theme_constant_override("margin_" + k, 4)
	m.add_child(SU.span(s, UI.song, 14, DIMC, 2))
	return m

# ───── 战力印 powerHTML ─────
func _power(v: Dictionary) -> Control:
	var D: Dictionary = Q.D
	var seal: String; var cls := ""; var pl: String; var sub: String; var eye := false
	if U.t(v.get("civil")):
		seal = "常人"; cls = "civil"; pl = "不习武"; sub = "看不出武功，本就不会"
	else:
		var hero := int(U.num(G.S.get("lv"), 1)) if U.t(G.S.get("lv")) else 1
		var tt: Dictionary = v.tier
		seal = str(tt.seal); eye = U.t(v.get("eye"))
		if U.t(p.get("disguised")): pl = str(D.TIER_TEXT.abyss); sub = "你 %d 级 · 看不透" % hero
		elif U.t(v.get("party")): pl = "等级 " + U.js(v.battle.lv); sub = "同伴 · 一眼看穿"
		else:
			pl = ("等级 " + U.js(v.battle.lv)) if tt.lv == "exact" else str(D.TIER_TEXT.get(tt.lv, ""))
			var d := int(U.num(v.d))
			sub = "你 %d 级 · %s：%s" % [hero, ("差 %d 级" % d) if d > 0 else (("低你 %d 级" % -d) if d < 0 else "同级"),
				{"clear": "一眼看穿", "see": "看得出", "rough": "看个大概", "opaque": "看不透"}.get(tt.id, "")]
	var e := Control.new(); e.custom_minimum_size = Vector2(62, 62); e.mouse_filter = Control.MOUSE_FILTER_IGNORE
	e.draw.connect(func():
		var c := Vector2(31, 31)
		var civil := cls == "civil"
		e.draw_circle(c + Vector2(0, 2), 32, Color(0, 0, 0, 0.12))
		e.draw_circle(c, 31 + 3, Color("#3a3d38") if civil else Color("#8f3a2c"))
		for i in 8:
			var k := 1.0 - i / 8.0
			e.draw_circle(c + Vector2(-0.1, -0.15) * 62 * (1 - k), 31 * k, (Color("#4a4e48") if civil else Color("#a8473a")).lerp(Color("#2a2d29") if civil else Color("#7c2a20"), k))
		e.draw_arc(c, 30, 0, TAU, 48, Color(246 / 255.0, 236 / 255.0, 214 / 255.0, 0.5 if civil else 0.6), 2, true)
		# 竖排两字 19px 粗
		var f: Font = UI.song_bold
		var n := seal.length()
		for i in n:
			var w := f.get_string_size(seal[i], HORIZONTAL_ALIGNMENT_LEFT, -1, 19).x
			e.draw_string(f, Vector2(31 - w / 2, 31 - n * 19 / 2.0 + i * 19 + 16), seal[i], HORIZONTAL_ALIGNMENT_LEFT, -1, 19, Color("#f6ecd6"))
		if eye:
			var ec := Vector2(62 + 8 - 10, -6 + 10)
			e.draw_circle(ec, 10, Color("#2f5a4f"))
			var w2 := UI.song.get_string_size("眼", HORIZONTAL_ALIGNMENT_LEFT, -1, 12).x
			e.draw_string(UI.song, ec + Vector2(-w2 / 2, 4.5), "眼", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color("#f6ecd6")))
	var col := VBoxContainer.new(); col.add_theme_constant_override("separation", 0); col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	col.add_child(_fixh(SU.span(pl, UI.song_bold, 24, INK, 4), 33)); col.add_child(_fixh(SU.span(sub, UI.song, 13, GREY, 1), 17))
	col.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var r := SU.row([e, col], 16)
	var v2 := VBoxContainer.new(); v2.add_theme_constant_override("separation", 0); v2.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v2.add_child(r); v2.add_child(SU.gap(22))
	return v2

# ───── 门派一栏 factionRowHTML ─────
func _faction_row():
	var JD = DB.g("QiheJianghuData")
	var m = JD.get("MEMBERS", {}).get(p.id) if JD is Dictionary else null
	if not (m is Dictionary) or not U.t(m.get("faction")): return null
	if U.t(m.get("hidden")) and not U.t(U.dig(G.S, "flags.jianghuLinguanshiRevealed")): return null
	var f = JD.FACTIONS.get(m.faction); var st = host.rep.stage(m.faction)
	if not (f is Dictionary) or st == null: return null
	var g: Dictionary = JD.GATE.get(st.id, {}) if JD.GATE.get(st.id) is Dictionary else {}
	var eff := ""
	if st.hostile or U.t(g.get("trade")): eff = "不肯和你换东西、指点、过招"
	else:
		var parts: Array = []
		if U.t(g.get("firstMeet")): parts.append("门人初见 %s%d" % ["+" if g.firstMeet > 0 else "−", absi(int(g.firstMeet))])
		if U.t(g.get("priceMul")):
			var pm: float = g.priceMul
			var hk := U.jround(absf(pm - 1) * 20) / 2.0
			var word = {1.0: "一", 1.5: "一成半", 2.0: "两"}.get(hk)
			parts.append("买卖%s%s%s" % ["贵" if pm > 1 else "便宜", word if word != null else str(U.jround(absf(pm - 1) * 10)), "" if hk == 1.5 else "成"])
		eff = " · ".join(parts)
		if eff == "": eff = "还没有什么来往"
	var fg := Control.new(); fg.custom_minimum_size = Vector2(44, 44); fg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var fcol := Color(str(f.color)); var glyph := str(f.glyph)
	fg.draw.connect(func():
		var sb := StyleBoxFlat.new(); sb.bg_color = fcol; sb.set_corner_radius_all(3); sb.border_color = Color(1, 1, 1, 0.18); sb.set_border_width_all(2)
		fg.draw_style_box(sb, Rect2(0, 0, 44, 44))
		var w := UI.song.get_string_size(glyph, HORIZONTAL_ALIGNMENT_LEFT, -1, 24).x
		fg.draw_string(UI.song, Vector2(22 - w / 2, 22 + 8.5), glyph, HORIZONTAL_ALIGNMENT_LEFT, -1, 24, Color("#f2e9d4")))
	var fl := SU.row([SU.span(str(f.name), UI.song_bold, 22, INK, 4), SU.span(str(st.name), UI.song, 20, Color("#a3392b") if st.score < 0 else Color("#3f6a45"), 3),
		SU.span(("+" if st.score > 0 else ("−" if st.score < 0 else "")) + str(absi(int(st.score))), UI.song, 16, Color("#6b6152"))], 12)
	for c in fl.get_children(): c.size_flags_vertical = Control.SIZE_SHRINK_END
	if m.get("rank") == "boss":
		var bp := PanelContainer.new(); bp.mouse_filter = Control.MOUSE_FILTER_IGNORE; bp.size_flags_vertical = Control.SIZE_SHRINK_END
		var bsb := StyleBoxFlat.new(); bsb.bg_color = Color("#9b2f25"); bsb.content_margin_left = 8; bsb.content_margin_right = 8; bsb.content_margin_top = 1; bsb.content_margin_bottom = 1
		bp.add_theme_stylebox_override("panel", bsb); bp.add_child(SU.span("此行主事", UI.song, 13, Color("#f6e8d6"), 2)); fl.add_child(bp)
	var col := VBoxContainer.new(); col.add_theme_constant_override("separation", 0); col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	col.add_child(_fixh(fl, 32)); col.add_child(_fixh(SU.span(eff, UI.song, 13, GREY, 1), 17))
	var r := SU.row([fg, col], 14); col.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var m2 := MarginContainer.new(); m2.add_theme_constant_override("margin_top", -8); m2.add_theme_constant_override("margin_bottom", 18); m2.mouse_filter = Control.MOUSE_FILTER_IGNORE
	m2.add_child(r)
	return m2

# ───── 装备 equipHTML ─────
func _equip(v: Dictionary) -> Control:
	var g: Dictionary = v.get("gear", {})
	var bw = U.dig(v, "battle.weapon")
	var rows: Array = []
	var w = g.get("weapon")
	if w:
		var kind = bw.get("kind") if bw is Dictionary and w.name == bw.get("name") else null
		var kmap := {"剑": "剑", "刀": "刀", "棍": "棍", "鞭": "鞭"}
		var sub := ""
		if w.get("atk") != null:
			sub = (((("长兵" if kind == "棍" else str(kind)) + " · ") if kind else "") + "攻击 " + U.js(w.atk)
				+ ((" · 暴击 " + U.js(bw.crit) + "%") if kind and U.t(bw.get("crit")) else ""))
		elif kind: sub = "数值待登记"
		rows.append({"slot": "兵器", "name": w.name, "id": w.get("id"), "glyph": kmap.get(kind, w.get("glyph") if U.t(w.get("glyph")) else "兵") if kind else (w.get("glyph") if U.t(w.get("glyph")) else "兵"), "grade": U.nz(w.get("grade"), ""), "look": w.get("look"), "sub": sub})
	elif U.t(p.get("tools")): rows.append({"slot": "兵器", "name": p.tools, "glyph": "具", "sub": ""})
	else: rows.append({"slot": "兵器", "name": "空手", "glyph": "—", "dim": true})   # 11-09 第四十八轮：三格空着时都写一个词（空手／常服／未戴）
	var ar = g.get("armor")
	rows.append({"slot": "护具", "name": ar.name, "id": ar.get("id"), "glyph": ar.get("glyph") if U.t(ar.get("glyph")) else "护", "grade": U.nz(ar.get("grade"), ""), "look": ar.get("look"), "sub": ("防御 " + U.js(ar.def)) if ar.get("def") != null else ""} if ar else {"slot": "护具", "name": "常服", "glyph": "—", "dim": true})
	var ac = g.get("acc")
	rows.append({"slot": "佩饰", "name": ac.name, "id": ac.get("id"), "glyph": ac.get("glyph") if U.t(ac.get("glyph")) else "饰", "grade": U.nz(ac.get("grade"), ""), "look": ac.get("look")} if ac else {"slot": "佩饰", "name": "未戴", "glyph": "—", "dim": true})
	# 11-09 第四十八轮：部位小字原为浅灰 GREY，看不清，改深一档 #5d5340
	var r := HBoxContainer.new(); r.add_theme_constant_override("separation", 26); r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for row in rows:
		var it: Dictionary = row.duplicate()
		if not DB.ITEMS.has(str(it.get("id"))): it.id = null
		var eq := VBoxContainer.new(); eq.custom_minimum_size.x = (400.0 - 4 - 26 * 2) / 3; eq.add_theme_constant_override("separation", 0); eq.mouse_filter = Control.MOUSE_FILTER_IGNORE
		eq.alignment = BoxContainer.ALIGNMENT_BEGIN
		var s := _slot(it); s.size_flags_horizontal = Control.SIZE_SHRINK_CENTER; eq.add_child(s)
		var sl := SU.span(row.slot, UI.song, 12, Color("#5d5340"), 3); eq.add_child(SU.gap(1)); var slw := _fixh(sl, 17); slw.size_flags_horizontal = Control.SIZE_SHRINK_CENTER; eq.add_child(slw)
		r.add_child(eq)
	var m := MarginContainer.new(); m.add_theme_constant_override("margin_left", 4); m.add_child(r); m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return m

# ───── 物品格 slotHTML（.it 宽 96；.qn-ico 78；nm 14px；sb 12px #8f3a2c；qty/mk/sw 角标） ─────
func _slot(it: Dictionary) -> Control:
	var v := VBoxContainer.new(); v.custom_minimum_size.x = 96; v.add_theme_constant_override("separation", 0); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var nm := str(it.get("name", ""))
	var rot := float((nm.unicode_at(0) % 60) - 30) if nm != "" else -20.0
	var ic := SU.ico(it.get("id"), str(it.get("glyph", "？")) if U.t(it.get("glyph")) else "？", rot, U.t(it.get("dim")))
	ic.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var qty := str(it.get("qty", "")) if U.t(it.get("qty")) else ""
	var mk := "剧情" if U.t(it.get("story")) else ("只可见" if U.t(it.get("look")) else "")
	var swp := U.t(it.get("swap"))
	ic.draw.connect(func():
		if qty != "":
			var w := UI.song.get_string_size(qty, HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x + 6
			var sb := StyleBoxFlat.new(); sb.bg_color = Color(246 / 255.0, 240 / 255.0, 226 / 255.0, 0.85); sb.set_corner_radius_all(6)
			var r := Rect2(78 - w, 78 - 2 - 18, w, 18)
			ic.draw_style_box(sb, r)
			ic.draw_string(UI.song, r.position + Vector2(3, 14), qty, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, INK)
		if mk == "剧情":
			ic.draw_set_transform(Vector2(-4 + 15, -2 + 15), deg_to_rad(-12))
			ic.draw_circle(Vector2.ZERO, 15, Color("#8f3a2c"))
			var w2 := UI.song.get_string_size(mk, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
			ic.draw_string(UI.song, Vector2(-w2 / 2, 4), mk, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#f6ecd6"))
			ic.draw_set_transform(Vector2.ZERO)
		elif mk == "只可见":
			var w3 := UI.song.get_string_size(mk, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x + 12
			ic.draw_set_transform(Vector2(-10, 0), deg_to_rad(-8))
			var sb2 := StyleBoxFlat.new(); sb2.bg_color = Color("#4c463a"); sb2.set_corner_radius_all(9)
			ic.draw_style_box(sb2, Rect2(0, 0, w3, 18))
			ic.draw_string(UI.song, Vector2(6, 13), mk, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color("#f6ecd6"))
			ic.draw_set_transform(Vector2.ZERO)
		if swp:
			var w4 := UI.song.get_string_size("可换", HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x + 10 + 1
			ic.draw_set_transform(Vector2(78 + 8 - w4, -4), deg_to_rad(6))
			var sb3 := StyleBoxFlat.new(); sb3.bg_color = Color("#2f5a4f"); sb3.set_corner_radius_all(9)
			ic.draw_style_box(sb3, Rect2(0, 0, w4, 18))
			ic.draw_string(UI.song, Vector2(5, 13), "可换", HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color("#f6ecd6"))
			ic.draw_set_transform(Vector2.ZERO))
	v.add_child(ic)
	var nr := HBoxContainer.new(); nr.add_theme_constant_override("separation", 0); nr.alignment = BoxContainer.ALIGNMENT_CENTER; nr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	nr.add_child(_fixh(SU.span(nm, UI.song, 14, DIMC if U.t(it.get("dim")) else INK, 1), 20))
	if U.t(it.get("grade")): nr.add_child(SU.grade(str(it.grade)))
	var nm_m := MarginContainer.new(); nm_m.add_theme_constant_override("margin_top", 2); nm_m.add_child(nr); nm_m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(nm_m)
	if U.t(it.get("sub")):
		var sl := SU.span(str(it.sub), UI.song, 12, Color("#8f3a2c"), 1); sl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		v.add_child(sl)
	return v

# ───── 雷达图 radar(v)：300×262，中心 (150,128)，RR 92 ─────
func _stat_mode(v: Dictionary) -> String:
	if U.t(v.get("civil")): return "civil"
	if not U.t(U.dig(v, "battle.st")): return "none"
	return str(v.tier.stats)

func _radar(v: Dictionary) -> Control:
	var D: Dictionary = Q.D
	var mode := _stat_mode(v)
	var st = U.dig(v, "battle.st")
	var c := Control.new(); c.custom_minimum_size = Vector2(300, 262); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var tri := func(x) -> String:
		for pr in D.STAT_TRI:
			if pr[0] == null or U.num(x) <= U.num(pr[0]): return str(pr[1])
		return "高"
	var band := func(x) -> String: return "%s～%s" % [U.js(maxf(0, U.num(x) - D.STAT_BAND)), U.js(U.num(x) + D.STAT_BAND)]
	var pt := func(i: int, r: float) -> Vector2:
		var a := deg_to_rad(-90 + i * 72)
		return Vector2(150 + r * cos(a), 128 + r * sin(a))
	c.draw.connect(func():
		var RR := 92.0
		for k in [0.33, 0.66, 1.0]:
			var g := PackedVector2Array()
			for i in 6: g.append(pt.call(i % 5, RR * k))
			c.draw_polyline(g, Color(31 / 255.0, 28 / 255.0, 22 / 255.0, 0.22), 1, true)
		var shape := PackedVector2Array()
		if mode in ["exact", "band2"]:
			for i in 5: shape.append(pt.call(i, RR * minf(1, U.num(st.get(KEYS[i])) / 14.0)))
		elif mode == "tri":
			var mm := {"低": 0.35, "中": 0.62, "高": 0.9}
			for i in 5: shape.append(pt.call(i, RR * mm[tri.call(st.get(KEYS[i]))]))
		if mode == "exact":
			c.draw_colored_polygon(shape, Color(61 / 255.0, 111 / 255.0, 98 / 255.0, 0.28))
			var ol := shape.duplicate(); ol.append(shape[0])
			c.draw_polyline(ol, Color("#2f5a4f"), 2.4, true)
		elif mode == "band2" or mode == "tri":
			# 模糊描边（feGaussianBlur 3）：多层半透明粗线近似
			var fillc := Color(31 / 255.0, 28 / 255.0, 22 / 255.0, 0.14 if mode == "band2" else 0.16)
			var lc := Color(47 / 255.0, 90 / 255.0, 79 / 255.0, 0.45) if mode == "band2" else Color(31 / 255.0, 28 / 255.0, 22 / 255.0, 0.35)
			var lw := 6.0 if mode == "band2" else 9.0
			c.draw_colored_polygon(shape, fillc)
			var ol2 := shape.duplicate(); ol2.append(shape[0])
			for k in [2.0, 1.4, 1.0]:
				c.draw_polyline(ol2, Color(lc, lc.a * 0.4), lw * k, true)
		else:
			for i in 14:
				var k := 1.0 - i / 14.0
				c.draw_circle(Vector2(150, 128), 58 * (0.6 + 0.6 * k), Color(31 / 255.0, 28 / 255.0, 22 / 255.0, 0.13 / 7.0))
		var exact := mode == "exact"
		for i in 5:
			var q: Vector2 = pt.call(i, RR + 24)
			var val := "—" if mode == "civil" else ("？" if mode in ["none", "hidden"] else (U.js(st.get(KEYS[i])) if mode == "exact" else (band.call(st.get(KEYS[i])) if mode == "band2" else tri.call(st.get(KEYS[i])))))
			var n1: String = KN[i] + " "
			var w1 := UI.song.get_string_size(n1, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
			var w2 := UI.song_bold.get_string_size(val, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
			var x0 := q.x - (w1 + w2) / 2
			c.draw_string(UI.song, Vector2(x0, q.y + 5.5), n1, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, INK)
			c.draw_string(UI.song_bold, Vector2(x0 + w1, q.y + 5.5), val, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("#2f5a4f") if exact else Color("#7a7060")))
	return c

# ───── 武学 artsHTML ─────
func _arts(v: Dictionary) -> Dictionary:
	var box := VBoxContainer.new(); box.add_theme_constant_override("separation", 14); box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var m := MarginContainer.new(); m.add_theme_constant_override("margin_left", 6); m.add_child(box); m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if U.t(v.get("civil")):
		box.add_child(_empty("不习武")); return {"note": "", "node": m}
	var tt: Dictionary = v.tier
	if tt.art == "hidden":
		box.add_child(_art("武学", "", "看不透", true, "", false, true))
		box.add_child(_art("内功", "", "看不透", true, "", false, true))
		return {"note": str(tt.artNote), "node": m}
	var CNS := ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
	var arts: Array = U.dig(v, "battle.arts") if U.dig(v, "battle.arts") is Array else []
	for a in arts:
		var lv_txt: String = "重数未登记" if a.get("lv") == null else CNS[int(a.lv)] + "重"
		var lv: String; var mv := ""; var lvd := false; var mvd := false
		if tt.art == "full":
			lv = lv_txt; lvd = a.get("lv") == null
			if a.get("moves") is Array and a.moves.size(): mv = "招式：" + " · ".join(a.moves)
		elif tt.art == "grade":
			lv = lv_txt; lvd = a.get("lv") == null; mv = "招式看不出"; mvd = true
		else:
			lv = "几重 ？"; lvd = true; mv = "招式看不出"; mvd = true
		box.add_child(_art(str(a.name), str(a.get("grade", "")) if U.t(a.get("grade")) else "", lv, lvd, mv, mvd, false))
	if arts.is_empty(): box.add_child(_empty("外功未登记"))
	var inner_hidden: bool = tt.inner == "hidden"
	box.add_child(_art("内功", "", "看不出" if inner_hidden else "未登记", true, "" if inner_hidden else "战斗档里还没有登记内功", true, false))
	return {"note": str(tt.artNote), "node": m}

## .art .an：b 19px 字距 3，grade，lv 靠右 15px 字距 2；mv 13.5px #4c463a margin-top 3
func _art(name: String, gr: String, lv: String, lv_dim: bool, mv: String, mv_dim: bool, name_dim: bool) -> Control:
	var v := VBoxContainer.new(); v.add_theme_constant_override("separation", 3); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var an := HBoxContainer.new(); an.add_theme_constant_override("separation", 8); an.mouse_filter = Control.MOUSE_FILTER_IGNORE
	an.custom_minimum_size.x = 454
	an.add_child(SU.span(name, UI.song_bold, 19, DIMC if name_dim else INK, 3))
	if gr != "": an.add_child(SU.grade(gr))
	var sp := Control.new(); sp.size_flags_horizontal = Control.SIZE_EXPAND_FILL; sp.mouse_filter = Control.MOUSE_FILTER_IGNORE; an.add_child(sp)
	an.add_child(SU.span(lv, UI.song, 15, DIMC if lv_dim else INK, 2))
	v.add_child(_fixh(an, 26))
	if mv != "":
		var mm := MarginContainer.new(); mm.add_theme_constant_override("margin_left", 2); mm.mouse_filter = Control.MOUSE_FILTER_IGNORE
		mm.add_child(_fixh(Paint.frac(SU.para(mv, 13.5, DIMC if mv_dim else Color("#4c463a"), 450, 1.3, 1), 13.5), 18))
		v.add_child(mm)
	return v

# ───── 底、立绘、取景、底部印 ─────
func _draw() -> void:
	# .qn-page 背景：background.webp cover + rgba(246,240,226,.8)
	draw_rect(Rect2(Vector2.ZERO, size), Color("#f3ecdc"))
	if bg:
		var ts := bg.get_size(); var sc := maxf(1600 / ts.x, 900 / ts.y)
		var sz := ts * sc
		draw_texture_rect(bg, Rect2((size - sz) / 2, sz), false)
	draw_rect(Rect2(Vector2.ZERO, size), Color(246 / 255.0, 240 / 255.0, 226 / 255.0, 0.8))
	# .wash：left -80 top 560，720×260，透明度 .35，radial at 40% 60%
	for i in 12:
		var k := 1.0 - i / 12.0
		var c := Vector2(-80 + 720 * 0.4, 560 + 260 * 0.6)
		draw_set_transform(c, 0, Vector2(360 * 0.62 * k, 130 * 0.62 * k) * 1.4)
		draw_circle(Vector2.ZERO, 1.0, Color(40 / 255.0, 44 / 255.0, 40 / 255.0, 0.55 * 0.35 / 12.0 * 1.6))
	draw_set_transform(Vector2.ZERO)
	var por: Texture2D = Assets.tex(str(p.portrait)) if U.t(p.get("portrait")) else null
	if por:
		# .por：left 40 top -10，675×900，contain；下方 66%→86% 渐隐
		var ts2 := por.get_size(); var s2 := minf(675 / ts2.x, 900 / ts2.y)
		var sz2 := ts2 * s2
		var r := Rect2(Vector2(40 + (675 - sz2.x) / 2, -10 + (900 - sz2.y) / 2), sz2)
		_draw_masked(por, r, -10 + 900 * 0.66, -10 + 900 * 0.86)
	elif scene_tex:
		# .por-scene：left 150 top 170，420×520；椭圆晕边 58%→72%(.6)→92%
		var r3 := Rect2(150, 170, 420, 520)
		_draw_vignette(scene_tex, r3)
	if not por:
		# 朱印 .mark：52×52，right 34 bottom 58（相对取景框）
		var mc := Vector2(150 + 420 - 34 - 26, 170 + 520 - 58 - 26)
		draw_set_transform(mc, deg_to_rad(-6))
		var sb := StyleBoxFlat.new(); sb.bg_color = Color("#8f3a2c", 0.92); sb.set_corner_radius_all(5)
		draw_style_box(sb, Rect2(-26, -26, 52, 52))
		draw_rect(Rect2(-21, -21, 42, 42), Color(246 / 255.0, 236 / 255.0, 214 / 255.0, 0.7 * 0.92), false, 2)
		var ch := str(p.get("name", "？")).substr(0, 1)
		var w := UI.song_bold.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, 32).x
		draw_string(UI.song_bold, Vector2(-w / 2, 11), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, 32, Color("#f6ecd6", 0.92))
		draw_set_transform(Vector2.ZERO)
	# Esc 印（44，字 19）
	Seal.draw(self, Vector2(1600 - 60 - 30 - 10 - 22, 34 + 22), 44, "返", "normal", 0, {"fs": 19})
	# 底部交互印
	for i in act_rects.size():
		var a: Dictionary = acts[i]
		var nx := 0.0
		if nudge.has(i):
			var nt: float = (t - nudge[i]) / 0.22
			if nt < 1: nx = -3.0 * sin(nt * TAU)
		Seal.draw(self, act_rects[i].position + Vector2(23, 23), 46, a.ch, a.st, i, {"fs": 25, "ring": i == fi, "nudge": nx})

func _draw_masked(tex: Texture2D, r: Rect2, y0: float, y1: float) -> void:
	# 竖向分条绘制，按 y 渐隐（mask-image linear-gradient）
	var n := 40
	var ts := tex.get_size()
	for i in n:
		var a0 := float(i) / n; var a1 := float(i + 1) / n
		var yy := r.position.y + r.size.y * (a0 + a1) / 2
		var al := 1.0 if yy <= y0 else (0.0 if yy >= y1 else 1.0 - (yy - y0) / (y1 - y0))
		if al <= 0: continue
		var dst := Rect2(r.position.x, r.position.y + r.size.y * a0, r.size.x, r.size.y / n + 0.5)
		var src := Rect2(0, ts.y * a0, ts.x, ts.y / n)
		draw_texture_rect_region(tex, dst, src, Color(1, 1, 1, al))

func _draw_vignette(tex: Texture2D, r: Rect2) -> void:
	# 椭圆晕边：同心椭圆环用 UV 多边形逐层画（58% 全显、72% .6、92% 透明）；sepia(.18) saturate(.9) 近似为偏暖调色
	var c := r.get_center()
	var rings := [[0.0, 1.0], [0.58, 1.0], [0.72, 0.6], [0.92, 0.0]]
	var seg := 40
	var tint := Color(1.0, 0.97, 0.9)
	for k in rings.size() - 1:
		var ra: float = rings[k][0]; var rb: float = rings[k + 1][0]
		var aa: float = rings[k][1]; var ab: float = rings[k + 1][1]
		for s in seg:
			var t0 := TAU * s / seg; var t1 := TAU * (s + 1) / seg
			var pts := PackedVector2Array(); var uvs := PackedVector2Array(); var cols := PackedColorArray()
			for q in [[ra, t0, aa], [ra, t1, aa], [rb, t1, ab], [rb, t0, ab]]:
				var off: Vector2 = Vector2(cos(q[1]), sin(q[1])) * r.size / 2 * q[0]
				pts.append(c + off)
				uvs.append((c + off - r.position) / r.size)
				cols.append(Color(tint, q[2]))
			if ra == 0.0:
				pts = PackedVector2Array([c, pts[2], pts[3]]); uvs = PackedVector2Array([Vector2(0.5, 0.5), uvs[2], uvs[3]]); cols = PackedColorArray([Color(tint, 1), cols[2], cols[3]])
			draw_polygon(pts, cols, uvs, tex)
