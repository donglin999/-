extends RefCounted
## 赠礼／易物／商店面板共用零件（原版 qihe-gift-ui.css 的 .qg-pn/.x/.ttl/.qg-it/.qg-sl/.av/.qg-keys 等）。坐标为 1600×900 设计尺寸。
const SU := preload("res://scripts/npc/scroll_ui.gd")
const U := preload("res://scripts/npc/util.gd")
const TIER_Q := {0: "#8b8a78", 1: "#5f9a78", 2: "#5d86b8"}

static func tier_cls(t: int) -> int: return 2 if t >= 3 else (1 if t >= 2 else 0)

## .qg-pn：深底（或 wood）、内框、檐、底座、阴影
static func panel(ci: CanvasItem, r: Rect2, wood := false) -> void:
	for g in [18.0, 12.0, 6.0]:
		ci.draw_rect(Rect2(r.position + Vector2(-g / 3, 10 - g / 3), r.size + Vector2(g, g) * 2 / 3), Color(0, 0, 0, 0.12))
	var c0 := Color(64 / 255.0, 48 / 255.0, 34 / 255.0, 0.98) if wood else Color(40 / 255.0, 31 / 255.0, 23 / 255.0, 0.98)
	var c1 := Color(44 / 255.0, 34 / 255.0, 25 / 255.0, 0.98) if wood else Color(27 / 255.0, 22 / 255.0, 17 / 255.0, 0.98)
	Paint.grad(ci, r, [[0.0, c0], [1.0, c1]], false)
	ci.draw_rect(r.grow(-9), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.3), false, 1)
	# 檐：left/right -18，top -14，高 18，上圆角 9
	var e := Rect2(r.position.x - 18, r.position.y - 14, r.size.x + 36, 18)
	var sb := StyleBoxFlat.new(); sb.corner_radius_top_left = 9; sb.corner_radius_top_right = 9; sb.corner_radius_bottom_left = 3; sb.corner_radius_bottom_right = 3
	sb.bg_color = Color("#3f2a18"); ci.draw_style_box(sb, e)
	Paint.grad(ci, Rect2(e.position + Vector2(4, 2), e.size - Vector2(8, 4)), [[0.0, Color("#5b3d24")], [1.0, Color("#2a1b0f")]], false)
	# 檐角翘起（border-top 3px 弧）
	for sd in [-1, 1]:
		var x0 := e.position.x - 6 if sd < 0 else e.end.x + 6 - 26
		var pts := PackedVector2Array()
		for k in 9:
			var tt := k / 8.0
			pts.append(Vector2(x0 + 26 * tt + (6 if sd < 0 else -6) * (1 - tt), e.position.y - 6 + 12 * pow(2 * tt - 1, 2) * 0.6))
		ci.draw_polyline(pts, Color("#5b3d24"), 3, true)
	# 底座：left/right -10，bottom -8，高 10，圆角 5
	var f := Rect2(r.position.x - 10, r.end.y - 2, r.size.x + 20, 10)
	var sb2 := StyleBoxFlat.new(); sb2.set_corner_radius_all(5); sb2.bg_color = Color("#3a2716")
	ci.draw_style_box(sb2, f)

## 关闭钮 .x：34 圆，红底，金描边 1.5
static func close_btn(ci: CanvasItem, c: Vector2) -> void:
	ci.draw_circle(c + Vector2(0, 2), 18, Color(0, 0, 0, 0.45))
	ci.draw_circle(c, 17 + 1.5, Color("#e2c27c"))
	ci.draw_circle(c, 17, Color("#6e2419"))
	ci.draw_circle(c, 17 * 0.6, Color("#9b3b2e"))
	var w := UI.song_bold.get_string_size("×", HORIZONTAL_ALIGNMENT_LEFT, -1, 22).x
	ci.draw_string(UI.song_bold, c + Vector2(-w / 2, 8), "×", HORIZONTAL_ALIGNMENT_LEFT, -1, 22, Color("#f3e6c8"))

## 标题牌 .ttl：居中、top -34，红底六角，Weibei 26px 字距 14
static func title(ci: CanvasItem, cx: float, top: float, s: String) -> void:
	var f := Paint.font(UI.weibei, 26, 14.0 / 26)
	var w := f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, 26).x + 14 + 52
	var h := 26 * 1.25 + 9
	var x := cx - w / 2
	var poly := PackedVector2Array([Vector2(x + w * 0.06, top), Vector2(x + w * 0.94, top), Vector2(x + w, top + h / 2), Vector2(x + w * 0.94, top + h), Vector2(x + w * 0.06, top + h), Vector2(x, top + h / 2)])
	ci.draw_polygon(poly, PackedColorArray([Color("#9b3b2e"), Color("#9b3b2e"), Color("#84302a"), Color("#6e2419"), Color("#6e2419"), Color("#84302a")]))
	ci.draw_string(f, Vector2(x + 26 + 14, top + 4 + 26), s, HORIZONTAL_ALIGNMENT_LEFT, -1, 26, Color("#f6ecd6"))

## 头像 .av：圆角框，金边 2 + 暗边 4；有立绘取上部，没有取地图小人（miniSprite）
static func avatar(ci: CanvasItem, r: Rect2, p: Dictionary, n, rad := 10) -> void:
	var sb := StyleBoxFlat.new(); sb.set_corner_radius_all(rad + 4); sb.bg_color = Color(10 / 255.0, 10 / 255.0, 8 / 255.0, 0.7)
	ci.draw_style_box(sb, r.grow(4))
	var sb2 := StyleBoxFlat.new(); sb2.set_corner_radius_all(rad + 2); sb2.bg_color = Color("#c79b55")
	ci.draw_style_box(sb2, r.grow(2))
	var sb3 := StyleBoxFlat.new(); sb3.set_corner_radius_all(rad); sb3.bg_color = Color("#15100c")
	ci.draw_style_box(sb3, r)
	ci.draw_circle(r.position + r.size * Vector2(0.5, 0.7), r.size.x * 0.4, Color("#3a2d1f", 0.8))
	var por: Texture2D = Assets.tex(str(p.portrait)) if U.t(p.get("portrait")) else null
	if por:
		# img：left 50% top 0，高 125%，水平居中；裁进框
		var h := r.size.y * 1.25
		var s := h / por.get_height()
		var w := por.get_width() * s
		var src_w := minf(por.get_width(), r.size.x / s)
		var src := Rect2((por.get_width() - src_w) / 2, 0, src_w, r.size.y / s)
		ci.draw_texture_rect_region(por, Rect2(r.position.x + (r.size.x - src_w * s) / 2, r.position.y, src_w * s, r.size.y), src)
	elif n is Dictionary and U.t(n.get("sp")):
		var key: String = str(n.sp).split(":")[0]
		var fr = null
		for k in [key + "_d", key + "_d_0", key]:
			fr = CharArt.frame(k)
			if fr: break
		if fr:
			# 像素小人：高 170%，top 6%，最近邻
			var rr: Rect2 = fr[1]
			var s2: float = minf(84.0 / rr.size.x, minf(88.0 / rr.size.y, 2.4)) * r.size.x / 96.0 * 1.7
			var dw: float = rr.size.x * s2; var dh: float = rr.size.y * s2
			var top := r.position.y + r.size.y * 0.06
			var vis_h := minf(dh, r.end.y - top)
			ci.draw_texture_rect_region(fr[0], Rect2(r.position.x + (r.size.x - dw) / 2, top, dw, vis_h), Rect2(rr.position, Vector2(rr.size.x, rr.size.y * vis_h / dh)))

## 物品格（.qg-it 74 圆角 12 / .qg-sl 72 圆角 6 / 托区 66）
static func cell(ci: CanvasItem, r: Rect2, tier_q: int, rad: int, hov := false, empty := false, wood := false) -> void:
	var q := Color(TIER_Q.get(tier_q, "#8b8a78"))
	if empty:
		var sbe := StyleBoxFlat.new(); sbe.set_corner_radius_all(rad)
		sbe.bg_color = Color(20 / 255.0, 18 / 255.0, 15 / 255.0, 0.6) if not wood else Color(20 / 255.0, 16 / 255.0, 12 / 255.0, 0.55)
		sbe.border_color = Color(120 / 255.0, 110 / 255.0, 90 / 255.0, 0.35); sbe.set_border_width_all(2); sbe.expand_margin_left = 2; sbe.expand_margin_right = 2; sbe.expand_margin_top = 2; sbe.expand_margin_bottom = 2
		ci.draw_style_box(sbe, r); return
	if hov:
		for g in [10.0, 6.0]:
			var sg := StyleBoxFlat.new(); sg.set_corner_radius_all(rad + int(g)); sg.bg_color = Color(239 / 255.0, 206 / 255.0, 131 / 255.0, 0.12)
			ci.draw_style_box(sg, r.grow(g))
	var o := StyleBoxFlat.new(); o.set_corner_radius_all(rad + 4); o.bg_color = Color(10 / 255.0, 10 / 255.0, 8 / 255.0, 0.7)
	ci.draw_style_box(o, r.grow(4))
	var b := StyleBoxFlat.new(); b.set_corner_radius_all(rad + 2); b.bg_color = Color("#efce83") if hov else q
	ci.draw_style_box(b, r.grow(2))
	var i := StyleBoxFlat.new(); i.set_corner_radius_all(rad)
	i.bg_color = Color(24 / 255.0, 22 / 255.0, 18 / 255.0, 0.95) if not wood else Color("#2a241d")
	ci.draw_style_box(i, r)
	ci.draw_circle(r.position + r.size * Vector2(0.5, 0.45), r.size.x * 0.36, Color(56 / 255.0, 50 / 255.0, 40 / 255.0, 0.55) if not wood else Color("#4a4034", 0.6))

## 行囊式物品卡（11-10 第四十九轮：赠礼选物和行囊页同一套——米白纸底、古铜细边、品级色的底线，名字写在卡下半）
static func paper_cell(ci: CanvasItem, r: Rect2, tier_q: int, hov := false, empty := false) -> void:
	var sb := StyleBoxFlat.new(); sb.set_corner_radius_all(3)
	if empty:
		sb.bg_color = Color("#f3ead4", 0.10); sb.border_color = Color("#cdbd98", 0.25); sb.set_border_width_all(1)
		ci.draw_style_box(sb, r); return
	if hov:
		var g := StyleBoxFlat.new(); g.set_corner_radius_all(6); g.bg_color = Color(239 / 255.0, 206 / 255.0, 131 / 255.0, 0.35)
		ci.draw_style_box(g, r.grow(4))
	sb.bg_color = Color("#f8f2e2"); sb.border_color = Color("#a8352a") if hov else Color("#b8a47c"); sb.set_border_width_all(2 if hov else 1)
	ci.draw_style_box(sb, r)
	ci.draw_rect(Rect2(r.position.x + 3, r.end.y - 4, r.size.x - 6, 2), Color(TIER_Q.get(tier_q, "#8b8a78")))

## 行囊式物品卡里的名字和数量（深色字）
static func paper_text(ci: CanvasItem, r: Rect2, id: String, n: String) -> void:
	var nm := str(DB.ITEMS.get(id, {}).get("name", id))
	var fs := 11
	while fs > 9 and UI.song.get_string_size(nm, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x > r.size.x - 6: fs -= 1
	var w := UI.song.get_string_size(nm, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
	# 11-10 试玩审查：九号字还比格子宽时，居中起点跑到格子左边外，“羊肉笼饼”的“羊”被裁成“丫”；改成拆两行
	if w > r.size.x - 6 and nm.length() > 2:
		var half := (nm.length() + 1) / 2
		for li in 2:
			var part := nm.substr(0, half) if li == 0 else nm.substr(half)
			var pw := UI.song.get_string_size(part, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
			ci.draw_string(UI.song, Vector2(r.get_center().x - pw / 2, r.end.y - 8 - (1 - li) * (fs + 2)), part, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color("#3b3024"))
	else:
		ci.draw_string(UI.song, Vector2(r.get_center().x - w / 2, r.end.y - 8), nm, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color("#3b3024"))
	if n != "" and n != "1":
		var cw := UI.song_bold.get_string_size(n, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
		ci.draw_string(UI.song_bold, Vector2(r.end.x - 4 - cw, r.position.y + 12), n, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#5d5340"))

## 物品图标（mnIco）画在 r 内；没有图标时写首字（.qg-gl Weibei 28px #e9d7ad）
static func item(ci: CanvasItem, r: Rect2, id: String, sz: float, dim := false) -> void:
	var tex := SU.item_tex(id)
	var mod := Color(1, 1, 1, 0.28) if dim else Color.WHITE
	if tex:
		var s := sz / maxf(tex.get_width(), tex.get_height())
		var d := tex.get_size() * s
		ci.draw_texture_rect(tex, Rect2(r.get_center() - d / 2, d), false, mod)
	else:
		var g := str(DB.ITEMS.get(id, {}).get("name", "？")).substr(0, 1)
		var w := UI.weibei.get_string_size(g, HORIZONTAL_ALIGNMENT_LEFT, -1, 28).x
		ci.draw_string(UI.weibei, r.get_center() + Vector2(-w / 2, 10), g, HORIZONTAL_ALIGNMENT_LEFT, -1, 28, Color("#e9d7ad", mod.a))

## 角标数量 .n：右 5 下 2，14px 粗，黑描边
static func count(ci: CanvasItem, r: Rect2, s: String) -> void:
	var w := UI.song_bold.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x
	var p := Vector2(r.end.x - 5 - w, r.end.y - 2 - 3)
	for d in [Vector2(-1, 0), Vector2(1, 0), Vector2(0, -1), Vector2(0, 1)]:
		ci.draw_string(UI.song_bold, p + d, s, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0, 0, 0, 0.8))
	ci.draw_string(UI.song_bold, p, s, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("#f4ecd8"))

## 格下小字 .why：居中、bottom -18，11px #e9a78f
static func why(ci: CanvasItem, r: Rect2, s: String) -> void:
	var f := Paint.font(UI.song, 11, 1.0 / 11)
	var w := f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
	ci.draw_string(f, Vector2(r.get_center().x - w / 2, r.end.y + 18 - 3), s, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#e9a78f"))

## 键位条 .qg-keys：底 44，居中，gap 26，14px；u 框
static func keys(ci: CanvasItem, parts: Array, bottom := 44.0) -> void:
	var f := Paint.font(UI.song, 14, 1.5 / 14)
	var total := 0.0
	var ws: Array = []
	for q in parts:
		var kw := 0.0
		if q[0] != "": kw = maxf(22, f.get_string_size(q[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x + 10) + 6
		var tw := f.get_string_size(q[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x
		ws.append([kw, tw]); total += kw + tw
	total += 26 * (parts.size() - 1)
	var x := 800 - total / 2
	var y := 900 - bottom - 8
	for i in parts.size():
		var q: Array = parts[i]
		if q[0] != "":
			var kr := Rect2(x, y - 15, ws[i][0] - 6, 21)
			ci.draw_rect(kr, Color(215 / 255.0, 184 / 255.0, 116 / 255.0, 0.75), false, 1)
			var kw2 := f.get_string_size(q[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x
			ci.draw_string(f, Vector2(kr.get_center().x - kw2 / 2, y), q[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("#efce83"))
			x += ws[i][0]
		ci.draw_string(f, Vector2(x, y), q[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("#e2d3b0"))
		x += ws[i][1] + 26
