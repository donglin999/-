extends RefCounted
## 战斗界面绘制小工具。对应原版 js/bui.js 的 BUI.text / blot / pointer / coin / seal / swash（墨迹）等。
## 原版这些是程序生成的离屏画布（毛笔噪声边缘）；现在优先用 Bui（data/bui 按原版参数烘焙的图，逐像素一致）绘制，
## 参数写法照抄 bui.js 的调用；带字的 seal/blot 只有烘到同一个字才用图，否则回落到同尺寸的矢量近似。
## 字体：FB/FC（Ma Shan Zheng / Zhi Mang Xing → 回落 ZCOOL XiaoWei）用 UI.brush；FS（Noto Serif SC）用 UI.serif。

const CINNABAR := Color("#b3261e")

static func fb() -> Font: return UI.mashan if UI.mashan else (UI.brush if UI.brush else ThemeDB.fallback_font)   # 原版 FB：Ma Shan Zheng 优先
static func fs() -> Font: return UI.serif if UI.serif else ThemeDB.fallback_font

static func lum(c: Color) -> float: return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b
static func mix(a: Color, b: Color, k: float) -> Color: return a.lerp(b, k)

## BUI.text：带描边的文字，居中绘于 (cx,cy)；sc 为缩放
static func text_c(ci: CanvasItem, s: String, cx: float, cy: float, col: Color, size: int, font: Font = null, edge := Color(0.05, 0.03, 0.02, 0.9), sc := 1.0, alpha := 1.0) -> Vector2:
	if font == null: font = fb()
	var fsz := maxi(1, roundi(size * sc))
	var w := font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz).x
	var asc := font.get_ascent(fsz); var dsc := font.get_descent(fsz)
	var pos := Vector2(cx - w / 2, cy + (asc - dsc) / 2)
	if edge.a > 0: ci.draw_string_outline(font, pos, s, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz, maxi(2, roundi(fsz * 0.14)), Color(edge, edge.a * alpha))
	ci.draw_string(font, pos, s, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz, Color(col, col.a * alpha))
	return Vector2(w, asc + dsc)

static func text_w(s: String, size: int, font: Font = null) -> float:
	if font == null: font = fb()
	return font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x

## BUI.blot：墨点字徽（圆底径向渐变 + 描边 + 字）
## o：原版 blot 的第 4 个参数（{fg, ring} 等，字符串照抄）；烘到同字同参的直接用图
static func blot_o(ci: CanvasItem, ch: String, col: String, x: float, y: float, sz: float, o := {}, alpha := 1.0) -> void:
	var r := Rect2(x, y, sz, sz)
	var isz := roundi(sz)
	if bui(ci, "blot", [ch, col, isz, o], r, alpha, true): return
	if o.is_empty() and bui(ci, "blot", [ch, col, isz], r, alpha, true): return
	var fg = Color(o.fg) if o.has("fg") else null
	var ring = _css_col(o.ring) if o.has("ring") else null
	_blot_vec(ci, ch, Color(col), x, y, sz, fg, ring, alpha)
static func blot(ci: CanvasItem, ch: String, col: Color, x: float, y: float, sz: float, fg = null, ring = null, alpha := 1.0) -> void:
	if fg == null and ring == null: blot_o(ci, ch, hex(col), x, y, sz, {}, alpha); return
	_blot_vec(ci, ch, col, x, y, sz, fg, ring, alpha)
## "rgba(200,170,120,.7)" / "#rrggbb" → Color
static func _css_col(s: String) -> Color:
	if s.begins_with("rgba(") or s.begins_with("rgb("):
		var p := s.substr(s.find("(") + 1).trim_suffix(")").split(",")
		return Color(float(p[0]) / 255.0, float(p[1]) / 255.0, float(p[2]) / 255.0, float(p[3]) if p.size() > 3 else 1.0)
	return Color(s)
static func _blot_vec(ci: CanvasItem, ch: String, col: Color, x: float, y: float, sz: float, fg, ring, alpha: float) -> void:
	var r := sz / 2 - 0.8; var c := Vector2(x + sz / 2, y + sz / 2)
	ci.draw_circle(c, r, Color(col.darkened(0.3), alpha))
	ci.draw_circle(c, r * 0.88, Color(col, alpha))
	ci.draw_circle(c - Vector2(r * 0.3, r * 0.3), r * 0.35, Color(col.lightened(0.18), 0.6 * alpha))
	ci.draw_arc(c, r, 0, TAU, 32, Color(ring if ring != null else Color(12 / 255.0, 7 / 255.0, 4 / 255.0, 0.85), alpha), maxf(0.8, sz * 0.05), true)
	if ch != "":
		var f: Color = fg if fg != null else (Color("#1a0f08") if lum(col) > 0.5 else Color("#f6ead2"))
		text_c(ci, ch, c.x, c.y + sz * 0.05, f, roundi(sz * 0.68), fb(), Color(0, 0, 0, 0), 1.0, alpha)

## BUI.pointer：墨色指示箭头，dir d/r/l
static func pointer(ci: CanvasItem, col: Color, x: float, y: float, sz: float, dir := "d") -> void:
	var rot: float = {"d": 0.0, "r": -PI / 2, "l": PI / 2}[dir]
	var c := Vector2(x + sz / 2, y + sz / 2)
	var pts := PackedVector2Array()
	for p in [Vector2(-0.42, -0.34), Vector2(0, -0.2), Vector2(0.42, -0.36), Vector2(0.1, 0), Vector2(0, 0.42), Vector2(-0.12, 0)]:
		pts.append(c + (p * sz).rotated(rot))
	ci.draw_colored_polygon(pts, col)
	pts.append(pts[0])
	ci.draw_polyline(pts, Color(10 / 255.0, 6 / 255.0, 4 / 255.0, 0.9), 1.2, true)

## BUI.coin：蓄势铜钱 off/on/use。原版 CSS 一律用 coin(st,28) 的图缩放到格子大小（bui.js battleDom --co-*）
static func coin(ci: CanvasItem, st: String, x: float, y: float, sz: float, alpha := 1.0) -> void:
	var t: Texture2D = Bui.tex("coin", [st, 28])
	if t: ci.draw_texture_rect(t, Rect2(x, y, sz, sz), false, Color(1, 1, 1, alpha)); return
	var c := Vector2(x + sz / 2, y + sz / 2); var R := sz / 2 - 0.6
	var face := Color("#4a3a26") if st == "off" else (Color("#ffd86a") if st == "use" else Color("#d8a848"))
	ci.draw_circle(c, R, Color("#1a120a", alpha))
	ci.draw_circle(c, R * 0.86, Color(face, alpha))
	var h := R * 0.32
	ci.draw_rect(Rect2(c.x - h, c.y - h, h * 2, h * 2), Color("#1a120a", alpha))
	if st == "use": ci.draw_arc(c, R + 0.6, 0, TAU, 24, Color("#fff4c0", 0.8 * alpha), 1.0, true)

static func hex(c: Color) -> String: return "#" + c.to_html(false)

## 按原版参数取 Bui 图画到矩形；exact=true 时只接受精确烘到的键（带字的图）
static func bui(ci: CanvasItem, fn: String, args: Array, r: Rect2, alpha := 1.0, exact := false) -> bool:
	if exact and not Bui.has(fn, args): return false
	var t: Texture2D = Bui.tex(fn, args)
	if t == null: return false
	ci.draw_texture_rect(t, r, false, Color(1, 1, 1, alpha))
	return true

## swash 图的一部分：src 为源图的 0..1 归一化矩形（原版 drawImageAsset 9 参数裁切，如胜字墨带自左展开、招式横幅自中间展开）
static func bui_region(ci: CanvasItem, fn: String, args: Array, r: Rect2, src: Rect2, alpha := 1.0) -> void:
	if src.size.x <= 0 or src.size.y <= 0: return
	var t: Texture2D = Bui.tex(fn, args)
	if t == null:
		if fn == "swash": sw(ci, args, r, alpha)
		return
	var ts := t.get_size()
	ci.draw_texture_rect_region(t, r, Rect2(src.position * ts, src.size * ts), Color(1, 1, 1, alpha))

## BUI.seal：朱印（方框 + 字，竖排）。seal(t,w,h,{col}) 烘到的直接用图（w/h 为原版调用的逻辑尺寸，画到 r）
static func seal_r(ci: CanvasItem, t: String, w: int, h: int, col: Color, r: Rect2, alpha := 1.0) -> void:
	if bui(ci, "seal", [t, w, h, {"col": hex(col)}], r, alpha, true): return
	_seal_vec(ci, t, r.position.x, r.position.y, r.size.x, r.size.y, col, alpha)
static func seal(ci: CanvasItem, t: String, x: float, y: float, w: float, h: float, col := CINNABAR, alpha := 1.0) -> void:
	seal_r(ci, t, roundi(w), roundi(h), col, Rect2(x, y, w, h), alpha)
static func _seal_vec(ci: CanvasItem, t: String, x: float, y: float, w: float, h: float, col: Color, alpha: float) -> void:
	ci.draw_rect(Rect2(x, y, w, h), Color(col, 0.92 * alpha))
	ci.draw_rect(Rect2(x + 1.5, y + 1.5, w - 3, h - 3), Color("#f6e6c8", 0.5 * alpha), false, 1.0)
	var n := t.length()
	var fsz := minf(w * 0.78, h / n * 0.86)
	for i in n:
		text_c(ci, t[i], x + w / 2, y + h * (i + 0.5) / n, Color("#f8ead0", alpha), roundi(fsz), fb(), Color(0, 0, 0, 0))

## BUI.swash(w,h,o) 原样取图（args = [w, h, {o}]，o 的键值照抄 bui.js）
## 同参数（除宽高外）一张都没烘到时，回落到矢量墨带（颜色、透明度、晕色取自 o）
static func sw(ci: CanvasItem, args: Array, r: Rect2, alpha := 1.0) -> void:
	if bui(ci, "swash", args, r, alpha): return
	var o: Dictionary = args[2] if args.size() > 2 else {}
	swash(ci, r, Color(o.get("col", "#0d0806")), float(o.get("a", 0.86)) * alpha, Color(o.halo) if o.has("halo") else null, float(o.get("haloA", 0.3)) * alpha)

## 旧的矢量近似（仅在没有对应原版参数时使用）：横向墨带（中间实、两端渐淡），halo 为外沿晕色
static func swash(ci: CanvasItem, r: Rect2, col := Color("#0d0806"), a := 0.86, halo = null, halo_a := 0.3) -> void:
	if halo != null:
		Paint.grad(ci, Rect2(r.position - Vector2(0, 2), r.size + Vector2(0, 4)), [[0.0, Color(halo, 0)], [0.1, Color(halo, halo_a)], [0.85, Color(halo, halo_a)], [1.0, Color(halo, 0)]], true)
	Paint.grad(ci, r, [[0.0, Color(col, 0)], [0.06, Color(col, a)], [0.8, Color(col, a)], [1.0, Color(col, 0)]], true)

## BUI.icon：属性/兵刃字徽（GL 取字、colOf 取色）；name 为「?」时灰底问号
const GL := {"刀": "刀", "剑": "剑", "拳": "拳", "棍": "棍", "暗器": "暗", "阳": "阳", "阴": "阴", "毒": "毒", "雷": "雷", "医": "医", "内": "内", "武": "武", "药": "药", "守": "守", "走": "走"}
const GC := {"武": "#d9b36c", "药": "#86c79a", "守": "#8bb8e0", "走": "#b8ae9e", "医": "#6ccf8a", "内": "#e8c070"}
static func col_of(t: String) -> Color:
	var wc: Dictionary = Stats.defs().get("WCOL", {})
	return Color(wc.get(t, GC.get(t, "#b0a490")))
static func icon(ci: CanvasItem, name: String, x: float, y: float, sz: float, dim := false) -> void:
	var a := 0.45 if dim else 1.0
	if name == "?": blot(ci, "?", Color("#5a524a"), x, y, sz, Color("#d8ccb0"), null, a); return
	blot(ci, GL.get(name, name.substr(0, 1)), col_of(name), x, y, sz, null, null, a)

# ── bui.js battleCSS 里的具名纹理（参数逐字照抄 bui.js 212–222、buiBars）──
static func sw_card(i: int) -> Array: return [236, 58, {"seed": 11 + i * 7, "rev": 1, "halo": "#d8c49a", "haloA": 0.34, "a": 0.9, "dry": 0.38, "head": 0.1, "tail": 0.5, "tip": 0.55, "thick": 0.8, "wave": 0.06}]
const SW_CUR := [250, 60, {"seed": 5, "rev": 1, "halo": "#f0c070", "haloA": 0.5, "a": 0.96, "dry": 0.3, "head": 0.1, "tail": 0.45, "tip": 0.5, "thick": 0.86, "wave": 0.05}]
const SW_TGT := [250, 60, {"seed": 6, "rev": 1, "halo": "#8fe0a8", "haloA": 0.45, "col": "#0e2a20", "a": 0.94, "dry": 0.32, "head": 0.1, "tail": 0.45, "thick": 0.86, "wave": 0.05}]
static func sw_row(i: int) -> Array: return [200, 30, {"seed": 31 + i * 5, "rev": 1, "halo": "#d8c49a", "haloA": 0.3, "a": 0.86, "dry": 0.42, "head": 0.08, "tail": 0.42, "thick": 0.78, "wave": 0.08}]
const SW_SEL := [214, 32, {"seed": 40, "rev": 1, "halo": "#f0c070", "haloA": 0.55, "a": 0.97, "dry": 0.3, "head": 0.08, "tail": 0.42, "thick": 0.86, "wave": 0.06}]
const SW_HD := [210, 34, {"seed": 47, "rev": 1, "halo": "#e07050", "haloA": 0.35, "col": "#2a0c08", "a": 0.92, "dry": 0.4, "head": 0.08, "tail": 0.5, "thick": 0.82}]
const SW_HINT := [420, 34, {"seed": 52, "halo": "#d8c49a", "haloA": 0.3, "a": 0.88, "dry": 0.42, "head": 0.05, "tail": 0.22, "thick": 0.9, "wave": 0.05}]
const SW_RED := [190, 30, {"seed": 61, "rev": 1, "col": "#a8281a", "a": 0.85, "dry": 0.45, "head": 0.06, "tail": 0.45, "thick": 0.8}]
const SW_LV := [320, 34, {"seed": 66, "col": "#9a2216", "a": 0.9, "dry": 0.4, "head": 0.05, "tail": 0.3, "thick": 0.86}]
const PAP_M := [220, 300, {"seed": 3}]
const PAP_H := [420, 40, {"seed": 9, "edge": 6}]
const PAP_W := [360, 320, {"seed": 13}]
const ROD_H := [232, 12]
const ROD_W := [392, 16]
const ROD_S := [48, 10]
const ENSO_N := [60, {"col": "#e3d3b0", "seed": 3}]
const ENSO_C := [60, {"col": "#d8402a", "seed": 4, "th": 6}]
const ENSO_T := [60, {"col": "#8fe0a8", "seed": 8, "th": 6}]
## 胜/败大字满宽墨带（drawBig）
const SW_BIG := [960, 170, {"seed": 33, "halo": "#d8c49a", "haloA": 0.3, "a": 0.86, "dry": 0.5, "head": 0.03, "tail": 0.28, "thick": 0.8, "wave": 0.05, "pr": 1}]
## 招式名横幅（drawBanner ink）
static func sw_banner(w: int, n: int, fo: bool) -> Array:
	return [w, 40, {"seed": (n * 13) % 50 + 3, "halo": "#e07050" if fo else "#d8c49a", "haloA": 0.38, "col": "#2e0806" if fo else "#0d0806", "a": 0.92, "dry": 0.42, "head": 0.05, "tail": 0.3, "thick": 0.86}]
## 敌方意图签条（drawIntent，bui.js 581）
static func sw_intent(w: int, hot: bool) -> Array:
	return [w, 26, {"seed": 91, "halo": "#e07050" if hot else "#d8c49a", "haloA": 0.3, "col": "#3a0a06" if hot else "#0d0806", "a": 0.86, "dry": 0.35, "head": 0.06, "tail": 0.25, "thick": 0.86, "pr": 1}]
## buiBars(w)：毛笔血线 tr/hp/low/mp/gh（renderCards 用 w=122）
static func bar_args(kind: String, w := 122) -> Array:
	var o := {"rev": 0, "dry": 0.3, "head": 0.12, "tail": 0.3, "tip": 0.6, "thick": 0.9, "wave": 0.12, "a": 1}
	match kind:
		"tr": o.seed = 71; o.col = "#e9dcc0"; o.a = 0.16; o.dry = 0.5
		"hp": o.seed = 72; o.col = "#d63a22"
		"low": o.seed = 72; o.col = "#ff5a2a"
		"mp": o.seed = 73; o.col = "#4aa0b8"
		"gh": o.seed = 72; o.col = "#f3e0b0"; o.a = 0.85
	return [w, 9, o]

## bui.js buiItem(k,s)：先查 ITEM_ICONS_V4（8×8 手绘图集，按格取），没有再查 ART.icons（i_icons.webp 的 [x,y,w,h]），都没有画「药」字徽
static func item_icon(ci: CanvasItem, k: String, x: float, y: float, s: float, dim := false) -> void:
	var r := Rect2(x, y, s, s)
	var mod := Color(0.55, 0.55, 0.55, 1) if dim else Color.WHITE
	var v4 = DB.g("ITEM_ICONS_V4")
	if v4 is Dictionary and v4.item.has(k):
		var t: Texture2D = Assets.tex_ready(str(v4.src)) if Assets.has(str(v4.src)) else null
		if t:
			var c: Array = v4.item[k]; var cw: float = t.get_width() / float(v4.cols); var chh: float = t.get_height() / float(v4.rows)
			ci.draw_texture_rect_region(t, r, Rect2(float(c[0]) * cw, float(c[1]) * chh, cw, chh), mod)
			return
	var art = DB.g("ART")
	var ic = art.get("icons", {}).get(k) if art is Dictionary else null
	if ic != null:
		var t2: Texture2D = Assets.tex_ready("assets/production/icons-and-props/i_icons.webp")
		if t2:
			ci.draw_texture_rect_region(t2, r, Rect2(ic[0], ic[1], ic[2], ic[3]), mod)
			return
	icon(ci, "药", x, y, 20, dim)
