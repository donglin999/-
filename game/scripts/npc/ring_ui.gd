extends Control
## 贴身墨印菜单（原版 js/qihe-npc-ui.js ring()，样式 qihe-npc-ui.css .qn-ring/.qn-seal/.qn-lab/.qn-keys/.qn-name）。
## 坐标为 1600×900 设计尺寸。打开后 await done，得到选中的项（Dictionary）或 null（Esc 收起）。
signal done(v)
const Seal := preload("res://scripts/npc/seal.gd")
## 印多的时候弧放大（11-10 第四十九轮：护院有六枚印，下面两枚挤在一起、压着圆弧）
var R := 96.0
var R2 := 122.0
const STEP := 29.0
const GOLD := Color("#e2c27c")

var host: Node
var items: Array = []
var p: Dictionary
var a: Dictionary          # anchorOf
var side := "left"
var angles: Array = []
var fi := 0
var t := 0.0               # 打开后秒数
var closing := -1.0
var _done := false
var press := -1            # 正按下的印
var nudge := {}            # 印序号 → 开始时间
var size_k: Array = []     # 每枚印当前大小（.1s 过渡）
var lab_rect := Rect2()     # 当前项标签（「交谈」那块）的范围：点它等于点当前印（2026-11-09 用户点标签没反应）

## 原版 ringGeom(n, side)
static func ring_geom(n: int, sd: String) -> Array:
	var step := minf(STEP, 135.0 / (n - 1)) if n > 1 else 0.0
	var top := minf(220.0, 160.0 + (n - 1) * step / 2)
	var left: Array = []
	for i in n: left.append(top - i * step)
	return left if sd == "left" else left.map(func(g): return 180.0 - g)

func pos(ang: float) -> Vector2:
	return Vector2(a.cx + R * cos(deg_to_rad(ang)), a.cy + R * sin(deg_to_rad(ang)))

func setup(h: Node, npc: Dictionary, person: Dictionary, list: Array, focus_id) -> void:
	host = h; p = person; items = list
	a = host.anchor_of(npc)
	R = 96.0 + maxf(0, items.size() - 4) * 14.0; R2 = R + 26.0
	# 2026-10-27：人在画面左右三成（480）以内时弧朝画面里展开
	side = "left" if a.cx > 1600 - 480 else ("right" if a.cx < 480 else ("left" if a.px >= a.cx else "right"))
	angles = ring_geom(items.size(), side)
	if angles.any(func(g): var x := pos(g).x; return x < 70 or x > 1530):
		side = "right" if side == "left" else "left"
		angles = ring_geom(items.size(), side)
	fi = maxi(0, items.find_custom(func(x): return x.id == focus_id))
	if focus_id == null:
		var s := items.find_custom(func(x): return x.st == "story")
		fi = s if s >= 0 else maxi(0, items.find_custom(func(x): return x.st != "off"))
	for i in items.size(): size_k.append(48.0 if i == fi else 36.0)
	size = Vector2(1600, 900)
	mouse_filter = Control.MOUSE_FILTER_STOP
	host.capture_keys(_on_key)

func _on_key(k: String) -> void:
	if k in ["w", "arrowup", "a", "arrowleft"]: move(-1)
	elif k in ["s", "arrowdown", "d", "arrowright"]: move(1)
	elif k in ["e", "enter", " "]: pick()
	elif k in ["escape", "q", "x", "backspace"]: finish(null)

func move(d: int) -> void:
	fi = (fi + d + items.size()) % items.size()

func pick() -> void:
	if _done or closing >= 0: return
	var it: Dictionary = items[fi]
	if it.st == "off" and it.get("say"):
		var c := it.duplicate(); c.run = "say"; finish(c); return
	if it.st == "off":
		nudge[fi] = t; return
	press = fi
	await get_tree().create_timer(0.1).timeout
	finish(it)

func finish(v) -> void:
	if _done: return
	_done = true
	host.capture_keys(Callable())
	closing = t
	await get_tree().create_timer(0.12 if v != null else 0.15).timeout
	done.emit(v)

func _hit(pt: Vector2) -> int:
	# 印画成方块，按方块范围算（原来按圆算，四个角点不中）
	for i in items.size():
		var d := (pt - pos(angles[i])).abs()
		if maxf(d.x, d.y) <= size_k[i] / 2 + 4: return i
	if lab_rect.has_point(pt): return fi
	return -1

func _gui_input(e: InputEvent) -> void:
	if _done: return
	if e is InputEventMouseMotion:
		var i := _hit(e.position)
		if i >= 0: fi = i
	elif e is InputEventMouseButton and e.pressed:
		if e.button_index == MOUSE_BUTTON_WHEEL_DOWN: move(1)
		elif e.button_index == MOUSE_BUTTON_WHEEL_UP: move(-1)
		elif e.button_index == MOUSE_BUTTON_LEFT:
			var i := _hit(e.position)
			if i >= 0: fi = i; pick()
			else: finish(null)   # .qn-catch 点空处收起
	accept_event()

func _process(dt: float) -> void:
	t += dt
	for i in size_k.size():
		var want := 48.0 if i == fi else 36.0
		size_k[i] = move_toward(size_k[i], want, 12.0 * dt / 0.1)
	queue_redraw()

# ───── 弧线（原版 arcSVG） ─────
func _arc_pts(r: float, s: float, e: float) -> PackedVector2Array:
	var pts := PackedVector2Array()
	var n := maxi(2, int(ceil(absf(e - s))) + 1)
	for k in n:
		var d := s + (e - s) * k / (n - 1)
		pts.append(Vector2(a.cx + r * cos(deg_to_rad(d)), a.cy + r * sin(deg_to_rad(d))))
	return pts

func _dia(r: float, d: float, s: float, col: Color) -> void:
	var c := Vector2(a.cx + r * cos(deg_to_rad(d)), a.cy + r * sin(deg_to_rad(d)))
	draw_set_transform(c, deg_to_rad(d + 45))
	draw_rect(Rect2(-s / 2, -s / 2, s, s), col)
	draw_set_transform(Vector2.ZERO)

func _draw_arc(alpha: float) -> void:
	var fa: float = angles[fi]
	var ext := 24.0
	var a0: float = angles.min() - ext
	var a1: float = angles.max() + ext
	var segs: Array = []
	var c = null
	var d := a0 - 6
	while d <= a1 + 6:
		var ok := absf(d - fa) > 14
		if ok and c == null: c = d
		if not ok and c != null: segs.append([c, d - 1]); c = null
		d += 1
	if c != null: segs.append([c, a1 + 6])
	var ticks: Array = []
	var td := ceilf((a0 - 6) / 5) * 5
	while td <= a1 + 6:
		if absf(td - fa) > 14: ticks.append(td)
		td += 5
	var dark := Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.5 * alpha)
	draw_polyline(_arc_pts(R, a0, a1), dark, 3.4, true)
	for sg in segs: draw_polyline(_arc_pts(R2, sg[0], sg[1]), dark, 3.4, true)
	var tick_line := func(dd: float, col: Color, w: float):
		var L := 6.0 if int(absf(dd)) % 15 == 0 else 3.0
		var A := Vector2(a.cx + R2 * cos(deg_to_rad(dd)), a.cy + R2 * sin(deg_to_rad(dd)))
		var B := Vector2(a.cx + (R2 - L) * cos(deg_to_rad(dd)), a.cy + (R2 - L) * sin(deg_to_rad(dd)))
		draw_line(A, B, col, w, true)
	for dd in ticks: tick_line.call(dd, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.55 * alpha), 3.0)
	# 内弧金线：打开时 .2s 由起点画出（qn-draw ease-out）
	var k := clampf(t / 0.2, 0, 1); k = 1 - pow(1 - k, 2)
	if k > 0: draw_polyline(_arc_pts(R, a0, a0 + (a1 - a0) * k), Color(GOLD, alpha), 1.3, true)
	for sg in segs: draw_polyline(_arc_pts(R2, sg[0], sg[1]), Color(GOLD, 0.85 * alpha), 0.9, true)
	for dd in ticks: tick_line.call(dd, Color(GOLD, alpha), 1.0)
	for q in [[R2, a0 - 6], [R2, a1 + 6], [R, a0], [R, a1]]:
		_dia(q[0], q[1], 8, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.6 * alpha))
		_dia(q[0], q[1], 5, Color(GOLD, alpha))

func _draw() -> void:
	var alpha := 1.0
	if closing >= 0: alpha = clampf(1.0 - (t - closing) / 0.15, 0, 1)
	# 名牌：挂在头顶上方（top=headY-2-44）
	Seal.plaque(self, Vector2(a.cx - 52, a.headY - 2 - 44), str(p.get("name", "")), alpha)
	_draw_arc(alpha)
	# 印：qn-stamp .12s，延迟 i*30ms，从 1.15 倍淡入
	for i in items.size():
		var it: Dictionary = items[i]
		var lt := t - i * 0.03
		if lt < 0: continue
		var k := clampf(lt / 0.12, 0, 1)
		var sc := 1.15 - 0.15 * k
		if press == i: sc *= 0.92
		var nx := 0.0
		if nudge.has(i):
			var nt: float = (t - nudge[i]) / 0.22
			if nt < 1: nx = -3.0 * sin(nt * TAU)
		var sz: float = size_k[i]
		Seal.draw(self, pos(angles[i]), sz, it.ch, it.st, i,
			{"focus": i == fi, "alpha": k * alpha, "scale": sc, "t": t, "fs": int(round(21 + (sz - 36) / 12.0 * 7)), "nudge": nx})
	_draw_lab(alpha)
	_draw_keys(alpha)

# ───── 标签 .qn-lab：高 34，padding 0 14 0 12，gap 9；b 18px 粗 字距 5；i 12.5px 字距 1.5 左竖线 padding-left 9 ─────
func _draw_lab(alpha: float) -> void:
	var it: Dictionary = items[fi]
	var lab := str(it.get("lab", ""))
	var note := str(it.get("note", "")) if it.get("note") else ""
	var bw := Seal.tw(UI.song_bold, lab, 18, 5)
	var iw := Seal.tw(UI.song, note, 13, 1.5) + 10 if note != "" else 0.0
	var w := 12 + bw + (9 + iw if note != "" else 0.0) + 14
	var c := pos(angles[fi])
	var x := c.x - 24 - 14 - w if side == "left" else c.x + 24 + 14
	var y := c.y - 17
	var h := 34.0
	lab_rect = Rect2(x, y, w, h)
	var poly := PackedVector2Array([Vector2(0, 0.08), Vector2(0.03, 0), Vector2(0.97, 0.04), Vector2(1, 0.5), Vector2(0.97, 0.96), Vector2(0.02, 1), Vector2(0, 0.92)])
	var pts := PackedVector2Array(); var sh := PackedVector2Array()
	for q in poly: pts.append(Vector2(x + q.x * w, y + q.y * h)); sh.append(Vector2(x + q.x * w, y + q.y * h + 2))
	draw_colored_polygon(sh, Color(0, 0, 0, 0.32 * alpha))
	var c0 := Color(247 / 255.0, 239 / 255.0, 220 / 255.0, 0.97 * alpha); var c1 := Color(240 / 255.0, 229 / 255.0, 203 / 255.0, 0.97 * alpha)
	var cols := PackedColorArray()
	for q in poly: cols.append(c0.lerp(c1, q.x))
	draw_polygon(pts, cols)
	# 红边 4px：l 在右、r 在左（剪进多边形内）
	var bx := x + w - 4 - w * 0.015 if side == "left" else x + w * 0.005
	draw_rect(Rect2(bx, y + h * 0.06, 4, h * 0.88), Color("#a33f2f", alpha))
	var bc := Color("#8a3a2b") if it.st == "off" else Color("#1d1a15")
	Seal.text(self, UI.song_bold, lab, x + 12, y, 18, Color(bc, alpha), 5, h / 18.0)
	if note != "":
		var ix := x + 12 + bw + 9
		draw_line(Vector2(ix + 0.5, y + 10), Vector2(ix + 0.5, y + h - 10), Color(107 / 255.0, 97 / 255.0, 80 / 255.0, 0.45 * alpha), 1)
		Seal.text(self, UI.song, note, ix + 10, y, 13, Color("#6b6150", alpha), 1.5, h / 13.0)

# ───── 键位提示 .qn-keys ─────
func _draw_keys(alpha: float) -> void:
	var xs: Array = angles.map(func(g): return pos(g).x)
	var ys: Array = angles.map(func(g): return pos(g).y)
	var mx: float = xs.min() - 10 if side == "left" else xs.max() + 10
	var top: float = ys.max() + 44
	var parts := [["k", "W"], ["k", "S"], ["t", "转 · "], ["k", "E"], ["t", "定 · "], ["k", "Esc"], ["t", "收"]]
	var w := 9.0
	for q in parts: w += (_kbd_w(q[1]) if q[0] == "k" else Seal.tw(UI.song, q[1], 14, 1)) + 6
	w += 9 - 6
	var left: float = mx - 10 if side == "left" else mx - w
	var h := 28.0   # 11-10 试玩审查：字太小糊成一团，大两号
	var r := Rect2(left, top, w, h)
	draw_rect(r.grow(1), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.35 * alpha), false, 1)
	draw_rect(r, Color(14 / 255.0, 17 / 255.0, 15 / 255.0, 0.86 * alpha))
	var x := left + 9
	for q in parts:
		if q[0] == "k":
			var kw := _kbd_w(q[1])
			var kr := Rect2(x, top + 4, kw, 20)
			draw_rect(kr, Color(16 / 255.0, 20 / 255.0, 17 / 255.0, 0.72 * alpha))
			draw_rect(kr, Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.7 * alpha), false, 1)
			var tw := Seal.tw(UI.song, q[1], 13, 1)
			Seal.text(self, UI.song, q[1], x + (kw - tw) / 2, top + 4, 13, Color("#efd9a6", alpha), 1, 20.0 / 13)
			x += kw + 6
		else:
			x += Seal.text(self, UI.song, q[1], x, top, 14, Color("#f2e5c9", alpha), 1, h / 14.0) + 6

func _kbd_w(s: String) -> float:
	return maxf(20.0, Seal.tw(UI.song, s, 13, 1) + 10 + 2)
