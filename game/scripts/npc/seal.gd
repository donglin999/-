extends RefCounted
## 墨印界面共用绘制（原版 js/qihe-npc-ui.js 的 edge/sealEl/plaque 与 qihe-npc-ui.css 的 .qn-seal/.qn-name）。
## 坐标一律用原版设计尺寸 1600×900（#qn-layer 的 zoom 基准），由 npc.gd 的图层统一缩到 960×540。

const ROT := [-3, 2, -1.5, 3, -2, 1, -2.5, 2.5]

## 原版 edge(seed,amp)：每枚印的外沿与内框各取一组固定小缺口（按字与序号定）。返回 0..1 的多边形
static func edge(seed: int, amp: float) -> PackedVector2Array:
	var s := float(seed * 9301 + 49297)
	var pts := PackedVector2Array()
	var rnd := func() -> float:
		s = fmod(s * 9301.0 + 49297.0, 233280.0)
		return s / 233280.0
	var side := func(x0: float, y0: float, x1: float, y1: float):
		for i in 4:
			var t := i / 4.0
			var j: float = (rnd.call() - 0.5) * amp
			var k: float = amp * 1.6 if rnd.call() < 0.25 else 0.0
			var x := x0 + (x1 - x0) * t; var y := y0 + (y1 - y0) * t
			var px := x + (0.0 if y0 == y1 else (1.0 if x0 < 50 else -1.0) * (j + k))
			var py := y + (0.0 if x0 == x1 else (1.0 if y0 < 50 else -1.0) * (j + k))
			pts.append(Vector2(snappedf(clampf(px, 0, 100), 0.1) / 100.0, snappedf(clampf(py, 0, 100), 0.1) / 100.0))
	side.call(0, 0, 100, 0); side.call(100, 0, 100, 100); side.call(100, 100, 0, 100); side.call(0, 100, 0, 0)
	return pts

static var _edges := {}
static func _edge_cached(seed: int, amp: float) -> PackedVector2Array:
	var k := "%d|%s" % [seed, amp]
	if not _edges.has(k): _edges[k] = edge(seed, amp)
	return _edges[k]

static func _map(poly: PackedVector2Array, r: Rect2) -> PackedVector2Array:
	var out := PackedVector2Array()
	for p in poly: out.append(r.position + p * r.size)
	return out

## 画一枚印。c：中心；sz：边长（36／焦点 48／页内 44、46）；st：normal|story|off；
## opt：focus、alpha、scale、t（秒，呼吸框用）、fs（字号）、nudge（左右抖的像素）、ring（页内焦点的红描边 box-shadow）
static func draw(ci: CanvasItem, c: Vector2, sz: float, ch: String, st: String, i: int, opt: Dictionary = {}) -> void:
	var focus: bool = opt.get("focus", false)
	var a: float = opt.get("alpha", 1.0)
	var sc: float = opt.get("scale", 1.0)
	var rot: float = deg_to_rad(ROT[i % 8]) if opt.get("rotate", true) else 0.0
	var seed := ch.unicode_at(0) + i * 7 if ch != "" else i * 7
	c.x += float(opt.get("nudge", 0.0))
	ci.draw_set_transform(c, rot, Vector2(sc, sc))
	var r := Rect2(-sz / 2, -sz / 2, sz, sz)
	var outer := _map(_edge_cached(seed, 5), r)
	var off := st == "off"
	# 阴影 drop-shadow(0 2px 1.5px rgba(0,0,0,.55))（off 无阴影）
	if not off:
		var sh := PackedVector2Array()
		for p in outer: sh.append(p + Vector2(0, 2))
		ci.draw_colored_polygon(sh, Color(0, 0, 0, 0.42 * a))
	if focus:
		# 焦点光晕 drop-shadow(0 0 6px rgba(239,206,131,.65))
		for k in [6.0, 4.0, 2.0]:
			var g := _map(_edge_cached(seed, 5), r.grow(k))
			ci.draw_colored_polygon(g, Color(239 / 255.0, 206 / 255.0, 131 / 255.0, (0.12 if not off else 0.1) * a))
	var face := Color("#1e231f")
	if st == "story": face = Color("#96302a")
	if off: face = Color(244 / 255.0, 236 / 255.0, 216 / 255.0, 0.3)
	face.a *= a
	ci.draw_colored_polygon(outer, face)
	if not off:
		# 左上微光 radial-gradient(circle at 30% 25%, rgba(255,255,255,.07))
		ci.draw_circle(r.position + r.size * Vector2(0.3, 0.25), sz * 0.25, Color(1, 1, 1, (0.07 if st != "story" else 0.1) * a))
		ci.draw_circle(r.position + r.size * Vector2(0.7, 0.8), sz * 0.3, Color(0, 0, 0, 0.12 * a))
	else:
		# inset 0 0 0 2.4px rgba(24,28,24,.86)
		var ol := outer.duplicate(); ol.append(outer[0])
		ci.draw_polyline(ol, Color(24 / 255.0, 28 / 255.0, 24 / 255.0, 0.86 * a), 2.4)
	# 内框 inset 3.5px，1px，按 edge2 剪
	var inner := _map(_edge_cached(seed + 3, 2.5), r.grow(-3.5))
	var il := inner.duplicate(); il.append(inner[0])
	var ic := Color("#c4aa76"); ic.a = 0.9
	if st == "story": ic = Color("#f3e6cc")
	if off: ic = Color(30 / 255.0, 34 / 255.0, 30 / 255.0, 0.55)
	ic.a *= a
	ci.draw_polyline(il, ic, 1.0)
	# 字：原版 .qn-seal 用 "Weibei SC","Weibei TC","STKaiti","Kaiti SC","Songti SC"（UI.weibei，系统没有时依次回落）
	var fs: int = int(opt.get("fs", 21 if sz < 40 else 28))
	var col := Color("#f1e3c2")
	if st == "story": col = Color("#fbefd6")
	if off: col = Color(30 / 255.0, 34 / 255.0, 30 / 255.0, 0.78)
	col.a *= a
	var f: Font = UI.weibei
	var w := f.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
	var base := Vector2(-w / 2, fs * 0.36 + 1)
	if off:
		for d in [Vector2(-1, 0), Vector2(1, 0), Vector2(0, -1), Vector2(0, 1)]:
			ci.draw_string(f, base + d, ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color(244 / 255.0, 234 / 255.0, 210 / 255.0, 0.6 * a))
	else:
		ci.draw_string(f, base + Vector2(0, 0.6), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color(0, 0, 0, 0.5 * a))
	ci.draw_string(f, base, ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, col)
	# 焦点框：inset:-6px，1.5px #c4553d 圆角 4，呼吸 1.6s（.7↔.5）；off 时虚线
	if focus and opt.get("frame", true):
		var tt: float = opt.get("t", 0.0)
		var br := 0.6 + 0.1 * cos(tt / 1.6 * TAU)
		var fr := r.grow(6)
		var fc := Color("#c4553d") if not off else Color(196 / 255.0, 85 / 255.0, 61 / 255.0, 0.9)
		fc.a *= br * a / 0.7 * 0.7 / 0.7
		if off:
			var corners := [fr.position, Vector2(fr.end.x, fr.position.y), fr.end, Vector2(fr.position.x, fr.end.y), fr.position]
			for q in 4: ci.draw_dashed_line(corners[q], corners[q + 1], fc, 1.5, 4.0)
		else:
			ci.draw_rect(fr.grow(1), Color(239 / 255.0, 206 / 255.0, 131 / 255.0, 0.25 * br * a), false, 2.0)
			ci.draw_rect(fr, fc, false, 1.5)
	if opt.get("ring", false):
		# 页内、卷上按钮的焦点：box-shadow 0 0 0 2px rgba(196,85,61,.9), 0 0 8px rgba(239,206,131,.6)
		ci.draw_rect(r.grow(5), Color(239 / 255.0, 206 / 255.0, 131 / 255.0, 0.25 * a), false, 4.0)
		ci.draw_rect(r.grow(1), Color(196 / 255.0, 85 / 255.0, 61 / 255.0, 0.9 * a), false, 2.0)
	ci.draw_set_transform(Vector2.ZERO)

## 名牌：乌木描金挂匾（含红绳），104×44，左上角 p
static func plaque(ci: CanvasItem, p: Vector2, name: String, a := 1.0) -> void:
	ci.draw_set_transform(p + Vector2(0, 2))
	ci.draw_rect(Rect2(3, 13, 98, 29), Color(0, 0, 0, 0.35 * a))
	ci.draw_set_transform(p)
	ci.draw_polyline(PackedVector2Array([Vector2(38, 14), Vector2(52, 2), Vector2(66, 14)]), Color("#9e2d22", a), 1.6)
	ci.draw_circle(Vector2(52, 3), 2.2, Color("#b8382b", a))
	_rrect(ci, Rect2(3, 13, 98, 29), 3, Color("#1a120e", a), Color("#b8975a", a), 1.2)
	var inner := Rect2(7, 16.5, 90, 22)
	Paint.grad(ci, inner, [[0.0, Color("#33241b", a)], [1.0, Color("#170f0b", a)]], false)
	ci.draw_rect(inner, Color("#8c6f3e", a), false, 0.7)
	ci.draw_circle(Vector2(11, 27.5), 1.3, Color("#c9a865", a))
	ci.draw_circle(Vector2(93, 27.5), 1.3, Color("#c9a865", a))
	# b：top 19、15px 粗、字距 5、padding-left 5、#efd9a6、阴影 0 1px #000
	var f := Paint.font(UI.song_bold, 15, 5.0 / 15)
	var w := f.get_string_size(name, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
	var x := 5 + (104 - 5 - w) / 2 + 2.5
	ci.draw_string(f, Vector2(x, 19 + 15 + 1), name, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color(0, 0, 0, a))
	ci.draw_string(f, Vector2(x, 19 + 15), name, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("#efd9a6", a))
	ci.draw_set_transform(Vector2.ZERO)

static func _rrect(ci: CanvasItem, r: Rect2, rad: float, fill: Color, stroke: Color, w: float) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = fill; sb.border_color = stroke; sb.set_border_width_all(int(ceil(w))); sb.set_corner_radius_all(int(rad))
	sb.anti_aliasing = true
	ci.draw_style_box(sb, r)

## 文字工具：字号 px、字距 px，返回宽度
static func tw(f: Font, s: String, px: int, sp := 0.0) -> float:
	return Paint.font(f, px, sp / px).get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x if sp != 0.0 else f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x

## 在 (x, 行顶 top) 写字，行高按 px*lh；返回宽度
static func text(ci: CanvasItem, f: Font, s: String, x: float, top: float, px: int, col: Color, sp := 0.0, lh := 1.3) -> float:
	var ff: Font = Paint.font(f, px, sp / px) if sp != 0.0 else f
	var asc := ff.get_ascent(px); var desc := ff.get_descent(px)
	var y := top + (px * lh - (asc + desc)) / 2 + asc
	ci.draw_string(ff, Vector2(x, y), s, HORIZONTAL_ALIGNMENT_LEFT, -1, px, col)
	return ff.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
