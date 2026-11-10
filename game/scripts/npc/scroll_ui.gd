extends Control
## 卷：请教（图 05b）、切磋（npc-spar 图 01）、切磋结果（原版 js/qihe-npc-ui.js scrollBox/twoButtons/teach/spar/result，
## 样式 qihe-npc-ui.css .qn-scroll/.qn-btn/.qn-result）。坐标为 1600×900 设计尺寸。await done → true/false。
signal done(v)
const Seal := preload("res://scripts/npc/seal.gd")
const U := preload("res://scripts/npc/util.gd")
const INK := Color("#1f1c16")
const GRADE := {"甲": "#a0642a", "乙": "#5a4f8a", "丙": "#3d6f62", "丁": "#6d6656", "绝": "#8a2a2a", "常识": "#6d6656"}
## clip-path 纸边（百分比）
const EDGE := [[0.6, 3], [4, 1.2], [9, 2.4], [15, 0.6], [22, 2], [30, 0.8], [38, 2.2], [46, 0.4], [55, 1.8], [63, 0.6], [72, 2.4], [80, 0.8], [88, 2], [95, 0.6], [99.4, 3], [98.6, 12], [99.6, 22], [98.4, 34], [99.8, 46], [98.6, 58], [99.6, 70], [98.2, 82], [99.4, 92], [98.8, 97.6], [92, 99.2], [84, 98], [76, 99.6], [67, 98.2], [58, 99.4], [49, 98], [40, 99.6], [31, 98.4], [22, 99.8], [13, 98.2], [5, 99.4], [0.8, 97.4], [1.6, 88], [0.4, 76], [1.8, 64], [0.6, 52], [1.6, 40], [0.2, 28], [1.4, 16]]

var host: Node
var paper := Rect2()
var dim := false
var focus_pt := Vector2(800, 450)
var t := 0.0
var body: VBoxContainer
var btns: Array = []        # [{ch, st, text, rect}]
var fi := 0
var _done := false
var result_mode := false
var bg: Texture2D

func _init() -> void:
	size = Vector2(1600, 900)
	mouse_filter = Control.MOUSE_FILTER_STOP
	bg = load("res://assets/ui/jianghu-v4/background.webp") if ResourceLoader.exists("res://assets/ui/jianghu-v4/background.webp") else null

## 原版 scrollBox(npc,w,h,html,prefer)：卷放在人物另一侧，不遮主角与对方
func box(h_: Node, npc: Dictionary, w: float, h: float, pad: Array, prefer := "") -> VBoxContainer:
	host = h_
	var a: Dictionary = host.anchor_of(npc)
	dim = true; focus_pt = Vector2(a.cx, a.cy)
	var right: bool = (prefer == "right") if prefer != "" else a.px >= a.cx
	var left: float = a.cx + 150 if right else a.cx - 150 - w
	left = maxf(40, minf(1600 - 40 - w, left))
	var top: float = maxf(40, minf(900 - 40 - h, a.cy - h / 2))
	paper = Rect2(left, top, w, h)
	body = VBoxContainer.new()
	body.position = Vector2(left + pad[3], top + pad[0])
	body.size = Vector2(w - pad[1] - pad[3], 0)
	body.add_theme_constant_override("separation", 0)
	body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(body)
	return body

func _process(dt: float) -> void:
	t += dt
	var k := clampf(t / 0.16, 0, 1)
	if body: body.modulate.a = k
	queue_redraw()

func _draw() -> void:
	if dim:
		# .qn-catch.dim：radial-gradient(ellipse at 人物, 透明 26% → rgba(10,12,10,.34) 80%)
		var steps := 24
		for i in steps:
			var r0 := float(i) / steps
			var al := clampf((r0 - 0.26) / (0.80 - 0.26), 0, 1) * 0.34 / steps * 2.2
			if al <= 0: continue
			var rr := Vector2(1600, 900) * (1.0 - r0) * 1.15
			_ellipse_hole(focus_pt, rr, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, al))
	if paper.size.x <= 0: return
	var k := clampf(t / 0.16, 0, 1)
	var sx := 0.96 + 0.04 * k
	var c := paper.get_center()
	draw_set_transform(Vector2(c.x * (1 - sx), 0), 0, Vector2(sx, 1))
	var pts := PackedVector2Array(); var uvs := PackedVector2Array(); var sh := PackedVector2Array()
	for e in EDGE:
		var q := paper.position + paper.size * Vector2(e[0] / 100.0, e[1] / 100.0)
		pts.append(q); sh.append(q + Vector2(0, 6))
		uvs.append(Vector2(e[0] / 100.0, e[1] / 100.0))
	for g in [10.0, 6.0, 3.0]:
		var s2 := PackedVector2Array()
		for q in sh: s2.append(c + (q - c) * (1 + g / paper.size.x))
		draw_colored_polygon(s2, Color(0, 0, 0, 0.09 * k))
	draw_colored_polygon(pts, Color(Color("#f4ecd8"), k))
	if bg:
		# background.webp center/cover
		var tsz := bg.get_size(); var sc := maxf(paper.size.x / tsz.x, paper.size.y / tsz.y)
		var uv2 := PackedVector2Array()
		for u in uvs:
			var px := (u - Vector2(0.5, 0.5)) * paper.size / sc / tsz + Vector2(0.5, 0.5)
			uv2.append(px)
		draw_colored_polygon(pts, Color(1, 1, 1, k), uv2, bg)
	var cols := PackedColorArray()
	for u in uvs: cols.append(Color(246 / 255.0, 240 / 255.0, 226 / 255.0, 0.9 * k).lerp(Color(240 / 255.0, 232 / 255.0, 212 / 255.0, 0.92 * k), u.y))
	draw_polygon(pts, cols)
	# radial-gradient(ellipse at 6% 40%, rgba(60,56,48,.22), transparent 26%)
	var lc := paper.position + paper.size * Vector2(0.06, 0.4)
	for i in 10:
		var f := 1.0 - i / 10.0
		draw_set_transform(Vector2(c.x * (1 - sx), 0) + lc * Vector2(sx, 1), 0, Vector2(sx * paper.size.x * 0.26 * f, paper.size.y * 0.26 * f))
		draw_circle(Vector2.ZERO, 1.0, Color(60 / 255.0, 56 / 255.0, 48 / 255.0, 0.022 * k))
	draw_set_transform(Vector2(c.x * (1 - sx), 0), 0, Vector2(sx, 1))
	for i in btns.size(): _draw_btn(i, k)
	draw_set_transform(Vector2.ZERO)

func _ellipse_hole(c: Vector2, r: Vector2, col: Color) -> void:
	# 整屏减去一个椭圆：用 64 段环带近似
	var outer := PackedVector2Array([Vector2(-10, -10), Vector2(1610, -10), Vector2(1610, 910), Vector2(-10, 910)])
	var n := 48
	var ring := PackedVector2Array()
	for i in n + 1:
		var ang := TAU * i / n
		ring.append(c + Vector2(cos(ang) * r.x, sin(ang) * r.y))
	var poly := PackedVector2Array([outer[0], outer[1], outer[2], outer[3], outer[0]])
	poly.append_array(ring)
	var tri := Geometry2D.triangulate_polygon(poly)
	if tri.is_empty(): return
	var tp := PackedVector2Array()
	for idx in tri: tp.append(poly[idx])
	for i in range(0, tp.size(), 3):
		draw_colored_polygon(PackedVector2Array([tp[i], tp[i + 1], tp[i + 2]]), col)

# ───── 内容拼装工具 ─────
## 小数字号（12.5px 等）按四舍五入的整数字号 ip 排字，字距与最小宽都折到 ip 的尺度；
## 要照原版字号显示，调用处把它套进 Paint.frac(l, px) 再放进容器
static func span(s: String, f: Font, px: float, col := INK, sp := 0.0) -> Label:
	var l := Label.new(); l.text = s
	var ip := int(round(px))
	var ff: Font = Paint.font(f, ip, sp / maxf(px, 1)) if sp != 0.0 else f
	l.add_theme_font_override("font", ff)
	l.add_theme_font_size_override("font_size", ip)
	l.add_theme_color_override("font_color", col)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	# CSS letter-spacing 每个字后面都加（含末字），Godot 的 Label 量宽不算末字那一份；单行字照 CSS 量出宽度作最小宽
	if sp != 0.0 and s != "" and not "\n" in s:
		l.custom_minimum_size.x = ceilf(f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, ip).x + s.length() * (ff as FontVariation).spacing_glyph)
	return l

static func para(s: String, px: float, col: Color, max_w: float, lh: float, sp := 0.0, f: Font = null) -> Label:
	var l := span(s, f if f else UI.song, px, col, sp)
	l.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY
	var ip := round(px)
	l.custom_minimum_size.x = max_w * ip / px
	l.add_theme_constant_override("line_spacing", int(round(ip * (lh - 1.3))))
	return l

static func row(kids: Array, gap: int, align := BoxContainer.ALIGNMENT_BEGIN) -> HBoxContainer:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", gap)
	h.alignment = align
	h.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for k in kids: h.add_child(k)
	return h

static func gap(px: float) -> Control:
	var c := Control.new(); c.custom_minimum_size.y = px; c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return c

## .grade：12px，padding 1px 6px，1px 边框同字色，margin-left 6px
static func grade(g: String) -> Control:
	var col := Color(GRADE.get(g, "#6d6656"))
	var pc := PanelContainer.new(); pc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var sb := StyleBoxFlat.new(); sb.bg_color = Color(0, 0, 0, 0); sb.border_color = col; sb.set_border_width_all(1)
	sb.content_margin_left = 6; sb.content_margin_right = 6; sb.content_margin_top = 1; sb.content_margin_bottom = 1
	pc.add_theme_stylebox_override("panel", sb)
	pc.add_child(span(g, UI.song, 12, col, 1))
	var m := MarginContainer.new(); m.add_theme_constant_override("margin_left", 6); m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	m.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	m.add_child(pc)
	return m

# ───── 底部两按钮（.foot：left 58 right 52 bottom 30，gap 22；.qn-btn gap 10，16px 字距 4；.tip 右对齐 12.5px） ─────
var foot_tip := ""
var foot_l := 58.0
func set_foot(b: Array, tip: String, fl := 58.0) -> void:
	foot_l = fl
	foot_tip = tip
	var x := paper.position.x + fl
	var y := paper.end.y - 30 - 36
	btns = []
	for q in b:
		var w := 36 + 10 + Seal.tw(UI.song, q[2], 16, 4)
		btns.append({"ch": q[0], "st": q[1], "text": q[2], "rect": Rect2(x, y, w, 36)})
		x += w + 22
	if tip != "":
		var lines := tip.split("\n")
		var lh := 12.5 * 1.6
		var tb := VBoxContainer.new(); tb.add_theme_constant_override("separation", 0); tb.mouse_filter = Control.MOUSE_FILTER_IGNORE
		for ln in lines:
			var l := span(ln, UI.song, 12.5, Color("#7a7060"), 1)
			l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
			l.custom_minimum_size.y = lh / Paint.fk(12.5)
			tb.add_child(Paint.frac(l, 12.5))
		add_child(tb)
		var sz := tb.get_combined_minimum_size()
		tb.size = sz
		tb.position = Vector2(paper.end.x - 52 - sz.x, y + 18 - sz.y / 2)

func _draw_btn(i: int, k: float) -> void:
	var b: Dictionary = btns[i]
	var r: Rect2 = b.rect
	Seal.draw(self, r.position + Vector2(18, 18), 36, b.ch, b.st, i, {"alpha": k, "fs": 20, "rotate": true, "ring": i == fi})
	Seal.text(self, UI.song, b.text, r.position.x + 46, r.position.y, 16, Color(INK, k), 4, 36.0 / 16)

func two_buttons(h_: Node) -> void:
	host = h_
	fi = 0
	host.capture_keys(func(k):
		if k in ["a", "arrowleft", "w", "arrowup"]: fi = 0
		elif k in ["d", "arrowright", "s", "arrowdown"]: fi = 1
		elif k in ["e", "enter", " "]: finish(fi == 0)
		elif k in ["escape", "x", "backspace", "q"]: finish(false))

func finish(v) -> void:
	if _done: return
	_done = true
	host.capture_keys(Callable())
	done.emit(v)

func _gui_input(e: InputEvent) -> void:
	if _done: return
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		if result_mode: finish(true); accept_event(); return
		for i in btns.size():
			if btns[i].rect.grow(2).has_point(e.position): finish(i == 0); accept_event(); return
		if not paper.has_point(e.position): finish(false)
	elif e is InputEventMouseMotion:
		for i in btns.size():
			if btns[i].rect.has_point(e.position): fi = i
	accept_event()

## .ph：b 28px 字距 12；span 13px #7a7060 字距 2；baseline 对齐，gap 16
static func ph(title: String, sub: String) -> Control:
	var b := span(title, UI.song_bold, 28, INK, 12)
	var s := span(sub, UI.song, 13, Color("#7a7060"), 2)
	s.size_flags_vertical = Control.SIZE_SHRINK_END
	var r := row([b, s], 16)
	return r

## .qn-ico 78×78：墨圈（5px，上右深、左浅、下中），中间物品图标或字
static func ico(item_id, glyph: String, rot_deg := -20.0, dim_ := false) -> Control:
	var c := Control.new(); c.custom_minimum_size = Vector2(78, 78); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var tex: Texture2D = item_tex(item_id)
	# 11-10 第四十九轮：银两原来只写一个“银”字，换成手绘银两图标（和物品图标同一画风）
	if tex == null and glyph == "银": tex = Assets.tex("assets/production/icons-and-props/i_qh_silver_20261110.png")
	c.draw.connect(func():
		var cc := Vector2(39, 39)
		var rr := 39.0 - 4 - 2.5
		var segs := [[-45, 45, 0.5], [45, 135, 0.38], [135, 225, 0.16], [225, 315, 0.5]]
		for sg in segs:
			c.draw_arc(cc, rr, deg_to_rad(sg[0] - 90 + rot_deg), deg_to_rad(sg[1] - 90 + rot_deg), 24, Color(34 / 255.0, 32 / 255.0, 28 / 255.0, sg[2]), 5, true)
		if tex:
			var s := 54.0 / maxf(tex.get_width(), tex.get_height())
			var sz := tex.get_size() * s
			c.draw_texture_rect(tex, Rect2(cc - sz / 2, sz), false)
		else:
			var col := Color("#9a917e") if dim_ else Color("#3b352a")
			var w := UI.song_bold.get_string_size(glyph, HORIZONTAL_ALIGNMENT_LEFT, -1, 26).x
			c.draw_string(UI.song_bold, Vector2(39 - w / 2, 39 + 9), glyph, HORIZONTAL_ALIGNMENT_LEFT, -1, 26, col))
	return c

## 物品图标（原版 mnIco）：借用江湖菜单的 QJKit.item_tex（运行时取，避免编译期依赖菜单子任务）
static var _kit = null
static func item_tex(item_id) -> Texture2D:
	if item_id == null or not DB.ITEMS.has(item_id): return null
	if _kit == null and ResourceLoader.exists("res://scripts/menu/kit.gd"): _kit = load("res://scripts/menu/kit.gd")
	if _kit and _kit.has_method("item_tex"): return _kit.item_tex(str(item_id))
	return null

## 混排文字（原版的 <b>、<span class="ok/no">）：用 BBCode
static func rich(bb: String, px: float, col: Color, max_w: float, lh: float, sp := 0.0) -> RichTextLabel:
	var r := RichTextLabel.new()
	r.bbcode_enabled = true; r.fit_content = true; r.scroll_active = false
	r.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY
	r.custom_minimum_size.x = max_w
	var ip := int(round(px))
	r.add_theme_font_override("normal_font", Paint.font(UI.song, ip, sp / px) if sp != 0.0 else UI.song)
	r.add_theme_font_override("bold_font", Paint.font(UI.song_bold, ip, sp / px) if sp != 0.0 else UI.song_bold)
	r.add_theme_font_size_override("normal_font_size", ip); r.add_theme_font_size_override("bold_font_size", ip)
	r.add_theme_color_override("default_color", col)
	r.add_theme_constant_override("line_separation", int(round(px * (lh - 1.3))))
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	r.text = bb
	return r

static func esc(s) -> String: return str(s).replace("[", "[lb]")
const OK_BB := "[b][color=#2f5a4f] 够[/color][/b]"
const NO_BB := "[b][color=#8a3a2b] 未够[/color][/b]"

## 请教卷（580×330，padding 44 52 0 58）
static func build_teach(host: Node, npc: Dictionary, p: Dictionary) -> Control:
	var Q = host.core
	var ts = Q.teach_state(p)
	var t: Dictionary = ts.t
	var sk = DB.SKILLS.get(t.skill) if U.t(t.get("skill")) else null
	var KEYS := ["str", "con", "agi", "wil", "wis"]; var KN := ["臂力", "根骨", "身法", "定力", "悟性"]
	var req_rows: Array = []
	var re := RegEx.create_from_string("^(stage|halfDay)")
	for r in t.get("req", []):
		if re.search(str(r[0])) and Q.test(r[0]): continue   # 时限类条件满足时不写，卷上只留要紧的
		req_rows.append(esc(r[1]) + (OK_BB if Q.test(r[0]) else NO_BB))
	if sk is Dictionary and sk.get("req") is Dictionary:
		var st: Dictionary = G.derived(G.S).get("st", G.S.get("st", {}))
		var pre: Array = []
		for k in sk.req:
			var have := int(U.num(st.get(k)))
			pre.append("%s %d / 需 %s%s" % [KN[KEYS.find(k)], have, U.js(sk.req[k]), OK_BB if have >= U.num(sk.req[k]) else NO_BB])
		pre.reverse()
		for x in pre: req_rows.push_front(x)
	if U.t(t.get("info")): req_rows.append(esc(t.info))
	var S = new()
	var b: VBoxContainer = S.box(host, npc, 580, 330, [44, 52, 0, 58])
	b.add_child(ph("请教", str(p.name) + "肯教你的"))
	b.add_child(gap(16))
	var col := VBoxContainer.new(); col.add_theme_constant_override("separation", 0); col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var t1 := row([span(str(t.title), UI.song_bold, 21, INK, 3), grade(str(t.get("grade", "")))], 0)
	var sm := span(str(t.get("sub", "")), UI.song, 14, Color("#4c463a"), 2); sm.size_flags_vertical = Control.SIZE_SHRINK_END
	var smm := MarginContainer.new(); smm.add_theme_constant_override("margin_left", 8); smm.add_child(sm); smm.mouse_filter = Control.MOUSE_FILTER_IGNORE
	t1.add_child(smm)
	col.add_child(t1)
	var d := ""
	if sk is Dictionary:
		d = str(sk.get("desc", ""))
		d = RegEx.create_from_string("BP.*$").sub(d, "")
		d = RegEx.create_from_string("^[^。]*第一式。").sub(d, "")
	else: d = str(t.get("line", ""))
	col.add_child(gap(4)); col.add_child(para(d, 14, Color("#3b352a"), 390, 1.7))
	col.add_child(gap(8)); col.add_child(rich("　·　".join(req_rows), 14, INK, 580 - 58 - 52 - 78 - 18, 1.9, 1))
	var gain := str(t.get("gain", ""))
	col.add_child(gap(2)); col.add_child(span(gain if gain.begins_with("学会得") else "学会得：" + gain, UI.song, 14, INK, 1))
	b.add_child(row([ico("qh_staff_notes" if U.t(t.get("skill")) else null, str(t.title).substr(0, 1)), col], 18))
	S.set_foot([["学", "story", "拜请指点"], ["罢", "normal", "作罢"]], str(t.get("tip")) if U.t(t.get("tip")) else "每人只教一次\n请教不耗时")
	S.two_buttons(host)
	return S

## 切磋卷（640×410，padding 42 54 0 60）
static func build_spar(host: Node, npc: Dictionary, p: Dictionary) -> Control:
	var Q = host.core
	var D: Dictionary = Q.D
	var q: Dictionary = Q.spar_quote(p)
	var v: Dictionary = Q.view(p)
	var hero := int(U.num(G.S.get("lv"), 1)) if U.t(G.S.get("lv")) else 1
	var tier = v.get("tier")
	var tid = tier.get("id") if tier is Dictionary else null
	var tier_txt: String = {"clear": "一眼看穿", "see": "看得出", "rough": "看个大概", "opaque": "看不透"}.get(tid, "")
	var exact: bool = tier is Dictionary and tier.get("lv") == "exact"
	var lv_txt := U.js(q.lv) + " 级" if exact else str(D.TIER_TEXT.get(tier.get("lv") if tier is Dictionary else "", ""))
	var she: String = Q.pronoun(p)
	var dd := int(q.d)
	var rel := ""
	if exact: rel = ("%s高你 %d 级" % [she, dd]) if dd > 0 else (("你高%s %d 级" % [she, -dd]) if dd < 0 else "同级")
	var exp_bb := ("%s已摸透你的路数，这一场没有收益" % she) if q.spent else "胜 [b][color=#1d1a15]%d[/color][/b]　·　平 [b][color=#1d1a15]%d[/color][/b]　·　败 [b][color=#1d1a15]%d[/color][/b]" % [q.exp.win, q.exp.draw, q.exp.lose]
	var ins: Array = []
	if q.insight.first: ins.append("初次与%s切磋 [b][color=#1d1a15]+%d[/color][/b]" % [she, q.insight.first])
	if q.insight.firstWin: ins.append("第一次赢%s再 [b][color=#1d1a15]+%d[/color][/b]" % [she, q.insight.firstWin])
	var ins_bb := "　·　".join(ins) if ins.size() else "已领过"
	var tip := ("%s · 本场不占次数\n本时段还可切磋 %d 次" % [str(U.dig(p, "spar.firstNote")) if U.t(U.dig(p, "spar.firstNote")) else "", q.left]) if q.story else "本时段还可切磋 %d 次" % q.left
	var S = new()
	var b: VBoxContainer = S.box(host, npc, 640, 410, [42, 54, 0, 60])
	b.add_child(ph("切磋", "点到为止 · 不伤和气"))
	b.add_child(gap(14))
	var fac := str(p.get("faction", ""))
	var nm := (fac if fac != "" and fac.length() <= 4 and not str(p.name).contains(fac) else "") + str(p.name)
	var who := row([span(nm, UI.song_bold, 19, INK, 4), span(lv_txt, UI.song, 15, INK, 1.5)], 14)
	who.alignment = BoxContainer.ALIGNMENT_BEGIN
	var tg := PanelContainer.new(); tg.mouse_filter = Control.MOUSE_FILTER_IGNORE; tg.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var tsb := StyleBoxFlat.new(); tsb.bg_color = Color(0, 0, 0, 0); tsb.border_color = Color("#3d6f62"); tsb.set_border_width_all(1)
	tsb.content_margin_left = 7; tsb.content_margin_right = 7; tsb.content_margin_top = 1; tsb.content_margin_bottom = 1
	tg.add_theme_stylebox_override("panel", tsb); tg.add_child(span(tier_txt, UI.song, 12, Color("#3d6f62"), 2))
	if tier_txt != "": who.add_child(tg)
	who.add_child(span("你 %d 级%s" % [hero, (" · " + rel) if rel != "" else ""], UI.song, 13, Color("#7a7060"), 1.5))
	for c in who.get_children(): c.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	b.add_child(who)
	b.add_child(gap(10))
	b.add_child(Paint.frac(para("单人上场。谁先掉到三成气血、或打满八回合，就收手。打完气血内力复原，用掉的药不还；不掉对方物品。", 13.5, Color("#3b352a"), 520, 1.75), 13.5))
	b.add_child(gap(10))
	var grid := GridContainer.new(); grid.columns = 2; grid.add_theme_constant_override("v_separation", 4); grid.add_theme_constant_override("h_separation", 0)
	grid.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for pr in [["经验", exp_bb], ["江湖历练", ins_bb]]:
		var dt := span(pr[0], UI.song, 14, Color("#7a7060"), 1); dt.custom_minimum_size.x = 86
		grid.add_child(dt); grid.add_child(rich(pr[1], 14, INK, 640 - 60 - 54 - 86, 1.3, 1))
	b.add_child(grid)
	if q.story and not U.t(Q.state().skills.get("spar")):
		b.add_child(gap(10)); b.add_child(span("打完这一场，学会「切磋」：此后可向大多数习武的人讨教。", UI.song_bold, 14, Color("#8a3a2b"), 1))
	S.set_foot([["比", "story" if q.story else "normal", "抱拳请教"], ["罢", "normal", "作罢"]], tip)
	S.two_buttons(host)
	return S

## 结果小卷 .qn-result（居中 top 38%，宽 420，padding 30 44 26）
static func build_result(host: Node, p: Dictionary, r: Dictionary) -> Control:
	var S = new()
	S.host = host
	S.result_mode = true
	var b := VBoxContainer.new(); b.add_theme_constant_override("separation", 0); b.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(span({"win": "胜", "draw": "平", "lose": "败"}.get(r.result, ""), UI.song_bold, 30, INK, 14))
	b.add_child(gap(10))
	b.add_child(para("与%s切磋 · 经验 +%s%s" % [p.name, U.js(r.exp), (" · 江湖历练 +" + U.js(r.insight)) if U.t(r.get("insight")) else ""], 15, INK, 420 - 88, 1.8, 1))
	if U.t(r.get("learned")):
		b.add_child(gap(10)); b.add_child(para("学会「切磋」：此后可向大多数习武的人讨教。", 15, Color("#8a3a2b"), 420 - 88, 1.8, 1, UI.song_bold))
	b.add_child(gap(12)); b.add_child(span("按 E 或点击继续", UI.song, 12, Color("#7a7060"), 2))
	S.add_child(b)
	var h := b.get_combined_minimum_size().y + 30 + 26
	S.paper = Rect2(800 - 210, 900 * 0.38, 420, h)
	b.position = S.paper.position + Vector2(44, 30); b.size.x = 420 - 88
	S.body = b
	host.capture_keys(func(k): if k in ["e", "enter", " ", "escape"]: S.finish(true))
	return S
