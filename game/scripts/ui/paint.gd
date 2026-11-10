class_name Paint
extends RefCounted
## 把原版 CSS 里常用的写法换成 Godot 绘制：多段线性渐变、细金线、描边框四角纹、字距字体。

## 多段渐变矩形：stops = [[位置0..1, Color], ...]；horizontal 为 true 时沿 x 方向
static func grad(ci: CanvasItem, r: Rect2, stops: Array, horizontal := true) -> void:
	if stops.size() < 2:
		if stops.size() == 1: ci.draw_rect(r, stops[0][1])
		return
	for i in stops.size() - 1:
		var a: Array = stops[i]; var b: Array = stops[i + 1]
		var p0: float = a[0]; var p1: float = b[0]
		if p1 <= p0: continue
		var pts: PackedVector2Array
		if horizontal:
			var x0 := r.position.x + r.size.x * p0; var x1 := r.position.x + r.size.x * p1
			pts = PackedVector2Array([Vector2(x0, r.position.y), Vector2(x1, r.position.y), Vector2(x1, r.end.y), Vector2(x0, r.end.y)])
			ci.draw_polygon(pts, PackedColorArray([a[1], b[1], b[1], a[1]]))
		else:
			var y0 := r.position.y + r.size.y * p0; var y1 := r.position.y + r.size.y * p1
			pts = PackedVector2Array([Vector2(r.position.x, y0), Vector2(r.end.x, y0), Vector2(r.end.x, y1), Vector2(r.position.x, y1)])
			ci.draw_polygon(pts, PackedColorArray([a[1], a[1], b[1], b[1]]))

## 横向“两头透明、中间实”的细线（CSS 里大量的金线、分隔线）
static func fade_line(ci: CanvasItem, x0: float, x1: float, y: float, col: Color, h := 1.0, edge := 0.5, mid_lo := -1.0, mid_hi := -1.0) -> void:
	var lo := edge if mid_lo < 0 else mid_lo
	var hi := 1.0 - edge if mid_hi < 0 else mid_hi
	var c0 := Color(col, 0)
	if lo >= hi:
		grad(ci, Rect2(x0, y, x1 - x0, h), [[0, c0], [0.5, col], [1, c0]])
	else:
		grad(ci, Rect2(x0, y, x1 - x0, h), [[0, c0], [lo, col], [hi, col], [1, c0]])

## 原版 .frame：底色 + 1px 边 + 内阴影两圈 + 四角短线
static func frame(ci: CanvasItem, r: Rect2, bg := Color(22 / 255.0, 17 / 255.0, 13 / 255.0, 0.93), bz := Color("#6e5a3e"), corner := Color("#a38a5e"), l := 12.0) -> void:
	ci.draw_rect(r, bg)
	ci.draw_rect(r.grow(-1.5), Color(0, 0, 0, 0.55), false, 2)
	ci.draw_rect(r.grow(-3), Color(163 / 255.0, 138 / 255.0, 94 / 255.0, 0.22), false, 1)
	ci.draw_rect(r, bz, false, 1)
	var q := r.grow(-3)
	for c in [[q.position, Vector2(1, 1)], [Vector2(q.end.x, q.position.y), Vector2(-1, 1)], [Vector2(q.position.x, q.end.y), Vector2(1, -1)], [q.end, Vector2(-1, -1)]]:
		var p: Vector2 = c[0]; var s: Vector2 = c[1]
		ci.draw_line(p, p + Vector2(l * s.x, 0), corner, 1)
		ci.draw_line(p, p + Vector2(0, l * s.y), corner, 1)

## 带字距的字体（CSS letter-spacing: em 值 × 字号）。小数字号按 fsize 排字，字距也按 fsize 算（缩回原字号后正好是 CSS 值）
static var _fv := {}
static func font(base: Font, size: float, spacing_em: float) -> Font:
	var n := fsize(size)
	var k := "%s|%d|%.3f" % [base.get_rid(), n, spacing_em]
	if _fv.has(k): return _fv[k]
	var fv := FontVariation.new()
	fv.base_font = base
	fv.spacing_glyph = int(round(n * spacing_em))
	_fv[k] = fv
	return fv

## 小数字号（原版 CSS 13.5px、14.5px 之类）：引擎字号只能是整数，就按向上取整的字号排字，再整体缩 fk 倍到原字号
static func fsize(px: float) -> int: return int(ceil(px - 0.001))
static func fk(px: float) -> float: return px / fsize(px)

## 量宽（小数字号已折算）
static func text_w(f: Font, s: String, px: float) -> float:
	return f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize(px)).x * fk(px)

## draw_string 的小数字号版：pos 是基线起点。xf 是调用处当前的自定义绘制变换（引擎读不到它，要调用处传进来），画完复原成 xf
static func draw_text(ci: CanvasItem, f: Font, pos: Vector2, s: String, px: float, col: Color, xf := Transform2D.IDENTITY) -> void:
	var k := fk(px)
	if k == 1.0:
		ci.draw_string(f, pos, s, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize(px), col); return
	ci.draw_set_transform_matrix(xf * Transform2D(0, Vector2(k, k), 0, pos))
	ci.draw_string(f, Vector2.ZERO, s, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize(px), col)
	ci.draw_set_transform_matrix(xf)

## 容器里的小数字号标签：Label 按整数字号排字（字号、字距、宽度都在那个尺度里设好），外面套 FracBox 缩回原字号 px，
## 并把缩后的大小报给父容器。字号相同时原样返回 Label
static func frac(l: Label, px: float) -> Control:
	var n := float(l.get_theme_font_size("font_size"))
	if n <= 0 or is_equal_approx(n, px): return l
	var b := FracBox.new(); b.k = px / n; b.label = l
	b.size_flags_horizontal = l.size_flags_horizontal; b.size_flags_vertical = l.size_flags_vertical
	b.mouse_filter = Control.MOUSE_FILTER_IGNORE
	l.scale = Vector2(b.k, b.k)
	b.add_child(l)
	return b

class FracBox extends Container:
	var k := 1.0
	var label: Label
	func _get_minimum_size() -> Vector2:
		return label.get_combined_minimum_size() * k if label else Vector2.ZERO
	func _notification(what: int) -> void:
		if what == NOTIFICATION_SORT_CHILDREN and label:
			label.position = Vector2.ZERO; label.size = size / k

## 生成一个带字距与阴影的 Label
static func label(text: String, base: Font, size: int, col: Color, spacing_em := 0.04, shadow := Color(0, 0, 0, 0), shadow_size := 0) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", font(base, size, spacing_em))
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	if shadow.a > 0:
		l.add_theme_color_override("font_shadow_color", shadow)
		l.add_theme_constant_override("shadow_offset_x", 0)
		l.add_theme_constant_override("shadow_offset_y", 1)
		l.add_theme_constant_override("shadow_outline_size", shadow_size)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l
