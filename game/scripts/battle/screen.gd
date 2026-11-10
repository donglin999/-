extends Node2D
## 屏幕层（layer 11，不随镜头）：顺序条、招式名横幅、胜败大字。
## 对应原版 bui.js（v4 覆盖版）drawOrderBar/buiDia/face/drawBanner/drawBig；bposhi.js banner/drawOne（破势演出，世界坐标，由 view 调 draw_world_banners）。

const W := 960.0
const H := 540.0
const BD := preload("res://scripts/battle/bdraw.gd")
const Motion := preload("res://scripts/battle/motion.gd")

var bt

func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS

func _process(_d: float) -> void:
	queue_redraw()

func _draw() -> void:
	if bt == null or bt.B == null: return
	var now: float = bt.pn()
	_draw_vignette()
	_draw_order_bar(now)
	_draw_banner(now)
	_draw_big(now)

## core.js vignette()（battle.js drawBattle 在 g.restore() 后、顺序条前调用，屏幕坐标）：
## 中心 (W/2,H/2)，半径 H*.35 处透明 → H*.95 处 rgba(0,0,0,.55)；战斗时 mode 不是 'scene'，故用 .55 而非明亮版 .18。
## 圆外（四角）保持 .55。
var _vig_tex: GradientTexture2D
func _draw_vignette() -> void:
	if _vig_tex == null:
		var gr := Gradient.new()
		var r0 := H * 0.35; var r1 := H * 0.95
		var R := Vector2(W / 2, H / 2).length() + 2
		gr.offsets = PackedFloat32Array([r0 / R, r1 / R, 1.0])
		gr.colors = PackedColorArray([Color(0, 0, 0, 0), Color(0, 0, 0, 0.55), Color(0, 0, 0, 0.55)])
		_vig_tex = GradientTexture2D.new(); _vig_tex.gradient = gr; _vig_tex.width = 512; _vig_tex.height = 512
		_vig_tex.fill = GradientTexture2D.FILL_RADIAL; _vig_tex.fill_from = Vector2(0.5, 0.5); _vig_tex.fill_to = Vector2(1.0, 0.5)
	var Rr := Vector2(W / 2, H / 2).length() + 2
	draw_texture_rect(_vig_tex, Rect2(W / 2 - Rr, H / 2 - Rr, Rr * 2, Rr * 2), false)

# ── 立绘裁脸（bui.js FACE/faceBox/porKey/faceSrc/spriteHead）──
const FACE := {"hero": [0.61, 0.2], "hero_hurt": [0.62, 0.2], "hero_smile": [0.6, 0.195], "suzhi": [0.53, 0.2], "suzhi_shy": [0.53, 0.2], "bandit": [0.56, 0.155], "chief": [0.55, 0.17], "lady": [0.58, 0.16], "monk": [0.52, 0.14],
	"beggar": [0.58, 0.18], "soldier": [0.52, 0.18], "boatman": [0.57, 0.12], "oldman": [0.56, 0.15], "smith": [0.52, 0.17], "gossip": [0.47, 0.19]}
const EXPR := {"hero": ["smile", "angry", "surprise", "think", "hurt", "battle"], "suzhi": ["smile", "shy", "angry", "worry", "surprise", "battle"], "ye": ["smile", "shy", "angry", "worry", "surprise", "battle", "hurt"]}
static var _spr_box := {}

static func _ok(k: String) -> bool: return Assets.has(k) and Assets.tex_ready(k) != null

## battle.js porKey：按血量选表情差分
static func por_key(u: Dictionary, story := false) -> String:
	var por: String = str(u.get("por", ""))
	var low: bool = u.hp < u.mhp * 0.3
	if story and u.get("isHero") and por == "opening_hero_modern":
		var k := por + ("_hurt" if low else "_guard")
		if _ok("p_" + k): return k
	if not EXPR.has(por): return por
	var e: Array = EXPR[por]
	var w := ("hurt" if e.has("hurt") else "worry") if low else "battle"
	return por + "_" + w if _ok("p_%s_%s" % [por, w]) else por

## 返回 {tex, src:Rect2, bg:Color} 或 null
func face_src(u: Dictionary):
	var pk = null
	if u.side == "ally": pk = por_key(u, bt.B.opt.get("storyLesson") != null)
	elif _ok("p_" + str(u.art)): pk = u.art
	if pk != null and pk != "" and _ok("p_" + pk):
		var t: Texture2D = Assets.tex_ready("p_" + pk)
		var fb: Array = FACE.get(pk, FACE.get(pk.split("_")[0], [0.55, 0.17]))
		var s := t.get_height() * 0.235
		return {"tex": t, "src": Rect2(fb[0] * t.get_width() - s / 2, fb[1] * t.get_height() - s / 2, s, s), "bg": Color("#efe4cc")}
	return _sprite_head(u)

func _sprite_head(u: Dictionary):
	var A = Motion.bart().get(u.get("art", ""))
	if A is Dictionary and A.has("file") and A.has("cell") and _ok(A.file):
		var t: Texture2D = Assets.tex_ready(A.file)
		if A.has("faceCrop"):
			var fc: Array = A.faceCrop
			return {"tex": t, "src": Rect2(fc[0], fc[1], fc[2], fc[3]), "bg": Color("#2a211a")}
		var cw := int(A.cell[0]); var ch := int(A.cell[1])
		var bb: Array = _spr_box.get(u.art, [])
		if bb.is_empty():
			bb = [0, 0, cw, ch, cw / 2.0, 0]
			var im: Image = Motion.image_of(A.file)
			if im:
				var x0 := cw; var x1 := 0; var y0 := ch; var y1 := 0
				for y in mini(ch, im.get_height()):
					for i in mini(cw, im.get_width()):
						if im.get_pixel(i, y).a > 60 / 255.0:
							x0 = mini(x0, i); x1 = maxi(x1, i); y0 = mini(y0, y); y1 = maxi(y1, y)
				if x1 > x0:
					var hx := 0.0; var hn := 0
					for y in range(y0, int(y0 + (y1 - y0) * 0.14)):
						for i in range(x0, x1 + 1):
							if im.get_pixel(i, y).a > 60 / 255.0: hx += i; hn += 1
					var left: bool = A.get("facing", "r") == "l"
					var ew := (x1 - x0) * 0.22; var ty := -1
					for y in range(y0, y1 + 1):
						if ty >= 0: break
						for i in range(roundi(x0 if left else x1 - ew), int(x0 + ew if left else x1) + 1):
							if im.get_pixel(i, y).a > 60 / 255.0: ty = y; break
					bb = [x0, y0, x1, y1, hx / hn if hn else (x0 + x1) / 2.0, y0 if ty < 0 else ty]
			_spr_box[u.art] = bb
		var H0: float = bb[3] - bb[1]
		var beast := RegEx.create_from_string("dog|wolf|snake|rooster").search(str(u.art)) != null
		if beast:
			var s := minf(H0 * 0.7, bb[2] - bb[0]); var lf: bool = A.get("facing", "r") == "l"
			return {"tex": t, "src": Rect2(bb[0] - s * 0.04 if lf else bb[2] - s * 0.96, bb[5] - s * 0.12, s, s), "bg": Color("#2a211a")}
		var s2 := H0 * 0.3
		return {"tex": t, "src": Rect2(bb[4] - s2 / 2, bb[1] - s2 * 0.12, s2, s2), "bg": Color("#2a211a")}
	var side := "r" if u.side == "foe" else "l"
	for k in ["c_%s_d_0" % u.art, "c_%s_d" % u.art, "c_%s_%s_0" % [u.art, side]]:
		if _ok(k):
			var t2: Texture2D = Assets.tex_ready(k)
			var iw := t2.get_width(); var ih := t2.get_height()
			var bst := RegEx.create_from_string("dog|wolf|snake|rooster").search(str(u.art)) != null
			var cs := minf(iw, ih * 0.55) * (1.0 if bst else 0.62)
			return {"tex": t2, "src": Rect2((iw - cs) / 2, ih * 0.2 if bst else ih * 0.02, cs, cs), "bg": Color("#2a211a")}
	return null

## bui.js buiDia：菱形头像（转 45° 的方块裁出脸，边框按阵营着色；破势敌人右下盖小印）
func dia(u: Dictionary, cx: float, cy: float, s: float, dim: bool, big: bool) -> void:
	var hd := s / 2.0
	var P := PackedVector2Array([Vector2(cx, cy - hd), Vector2(cx + hd, cy), Vector2(cx, cy + hd), Vector2(cx - hd, cy)])
	draw_colored_polygon(P, Color(64 / 255.0, 18 / 255.0, 16 / 255.0, 0.92) if u.side == "foe" else Color(16 / 255.0, 38 / 255.0, 56 / 255.0, 0.92))
	var f = face_src(u)
	if f != null:
		draw_colored_polygon(P, f.bg)
		var r0 := Vector2(cx - s * 0.55, cy - s * 0.52); var fs := s * 1.1
		var ts := Vector2(f.tex.get_width(), f.tex.get_height())
		var uv := PackedVector2Array()
		for p in P: uv.append((f.src.position + (p - r0) / fs * f.src.size) / ts)
		draw_polygon(P, PackedColorArray([Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE]), uv, f.tex)
	else:
		BD.text_c(self, str(u.name).substr(0, 1), cx, cy, Color("#ddd"), roundi(s * 0.4), BD.fs(), Color(0, 0, 0, 0))
	if dim: draw_colored_polygon(P, Color(0, 0, 0, 0.5))
	var Pc := P.duplicate(); Pc.append(P[0])
	draw_polyline(Pc, Color("#f4e2b0") if big else (Color("#e08a74") if u.side == "foe" else Color("#9fd0e8")), 2.0 if big else 1.2, true)
	if big:
		var o := (s / sqrt(2.0) + 10) / sqrt(2.0)
		draw_polyline(PackedVector2Array([Vector2(cx, cy - o), Vector2(cx + o, cy), Vector2(cx, cy + o), Vector2(cx - o, cy), Vector2(cx, cy - o)]), Color(244 / 255.0, 226 / 255.0, 176 / 255.0, 0.45), 1.0, true)
	if u.side == "foe" and u.get("broken"): poshi_seal(self, cx - s * 0.1, cy + s * 0.02, s * 0.46)

## bui.js poshiSeal：「破」小印（fx_poshi_seal_s；缺图时朱底白字）
static func poshi_seal(ci: CanvasItem, x: float, y: float, sz: float, a := 1.0) -> void:
	var t: Texture2D = Assets.tex_ready("fx_poshi_seal_s") if Assets.has("fx_poshi_seal_s") else null
	if t: ci.draw_texture_rect(t, Rect2(x, y, sz, sz), false, Color(1, 1, 1, a)); return
	BD.seal(ci, "破", x, y, sz, sz, BD.CINNABAR, a)

# ── 顺序条（bui.js v4 drawOrderBar）──
func _draw_order_bar(now: float) -> void:
	var B = bt.B
	if not B.round: return
	var y := 44.0; var x0 := 46.0
	var cur = B.cur if B.cur != null and B.cur.hp > 0 else null
	var rest := []
	for u in B.order:
		if u.hp > 0 and not B.done.has(u.id) and not is_same(u, cur): rest.append(u)
	var nxt := []
	for u in B.next:
		if u.hp > 0 and not (u.side == "foe" and u.get("broken") and u.get("brokenUntil", 0) >= B.round + 1): nxt.append(u)
	var xe := x0 + 46 + rest.size() * 32 + 30 + nxt.size() * 28 + 12
	draw_polyline_colors(PackedVector2Array([Vector2(x0 + 30, y + 0.5), Vector2(xe, y + 0.5)]), PackedColorArray([Color(240 / 255.0, 228 / 255.0, 200 / 255.0, 0.75 - 0.63 * 30 / maxf(1, xe - x0)), Color(240 / 255.0, 228 / 255.0, 200 / 255.0, 0.12)]), 1.0)
	if cur != null: dia(cur, x0, y, 58 + sin(now / 300) * 1.5, false, true)
	var x := x0 + 48
	for u in rest: dia(u, x, y, 28, false, false); x += 32
	x += 4
	var sf := BD.fs()
	draw_string(sf, Vector2(x + 6 - BD.text_w("››", 14, sf) / 2, y + 5), "››", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(240 / 255.0, 228 / 255.0, 200 / 255.0, 0.7))
	x += 24
	if nxt.size():
		draw_string(sf, Vector2(x - 12, y - 22), "下一回合", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(240 / 255.0, 228 / 255.0, 200 / 255.0, 0.75))
		draw_line(Vector2(x - 12, y - 17.5), Vector2(x + nxt.size() * 28, y - 17.5), Color(240 / 255.0, 228 / 255.0, 200 / 255.0, 0.45), 1.0)
	for u in nxt: dia(u, x, y, 24, true, false); x += 28

# ── 招式名横幅（bui.js drawBanner，ink 主题：墨迹题签 + 「煞」/「招」朱印）──
func _draw_banner(now: float) -> void:
	var B = bt.B
	if B.banner == null: return
	var b: Dictionary = B.banner
	var k: float = (now - b.t0) / 1100.0
	if k >= 1: B.banner = null; return
	var fo: bool = b.side == "foe"
	var tw := ceilf(BD.text_w(b.t, 26))
	var w := tw + 140; var h := 48.0
	var grow := minf(1, k / 0.08); var a := (1 - k) / 0.18 if k > 0.82 else 1.0
	var dw := w * grow; var x := W / 2 - dw / 2; var y := 78.0
	# 原版先画进 w×48 缓存画布（墨迹在 y=4 高 40），再自中间按 grow 裁切展开
	BD.bui_region(self, "swash", BD.sw_banner(int(w), str(b.t).length(), fo), Rect2(x, y + 4, dw, 40), Rect2((1 - grow) / 2, 0, grow, 1), a)
	if dw > tw: BD.text_c(self, b.t, W / 2, y + 24, Color("#ffb49a") if fo else Color("#f6dca0"), 26, BD.fb(), Color("#140905"), 1.0, a)
	if grow >= 1: BD.seal(self, "煞" if fo else "招", W / 2 + tw / 2 + 10, y + 14, 20, 20, BD.CINNABAR, a)

# ── 胜 / 败 / 脱身（bui.js drawBig：满宽墨带 + 书法大字 + 「小江湖」朱印砸入）──
func _draw_big(now: float) -> void:
	var B = bt.B
	if B.big == null: return
	var bg: Dictionary = B.big
	var k: float = (now - bg.t0) / bg.ms
	if k >= 1.4: return
	var e: float = now - bg.t0
	var a := minf(1, k * 5) * (maxf(0, (1.4 - k) / 0.4) if k > 1 else 1.0)
	var c: Color = bg.c; var cy := H / 2
	var gw := minf(1, e / 180)
	# 满宽墨带自左向右展开：取源图左侧 gw 部分（drawImageAsset 9 参数裁切）
	BD.bui_region(self, "swash", BD.SW_BIG, Rect2(0, cy - 85, W * gw, 170), Rect2(0, 0, gw, 1), a)
	var sc := 1.6 if e < 90 else (1.18 if e < 150 else (0.96 if e < 200 else 1.0))
	var fsz := 112 if str(bg.t).length() > 1 else 136
	var tw := BD.text_w(bg.t, fsz)
	BD.text_c(self, bg.t, W / 2, cy, c.lerp(Color("#fff4e0"), 0.25), fsz, BD.fb(), Color("#0d0604"), sc, a)
	if e < 120: BD.text_c(self, bg.t, W / 2, cy, Color.WHITE, fsz, BD.fb(), Color(0, 0, 0, 0), sc, a * (1 - e / 120))
	if e > 260:
		var ss := minf(1, (e - 260) / 140); var s2 := 1.7 - 0.7 * ss
		draw_set_transform(Vector2(W / 2 + tw / 2 + 14, cy + 4), 0.06, Vector2.ONE)
		BD.seal_r(self, "小江湖", 26, 70, BD.CINNABAR, Rect2(-13 * s2, -35 * s2, 26 * s2, 70 * s2), a * ss)
		draw_set_transform(Vector2.ZERO)

# ── 破势演出（bposhi.js banner/drawOne：贴在被破敌人身上，世界坐标；由 view._draw_break_flash 调用）──
const Q := 1.5
const DUR := 1150.0
const T_POP := 40.0
const T_SET := 130.0
const T_SEAL := 190.0
const T_OUT := 880.0
var active := []
static var _small := {}

static func _cl(v: float) -> float: return clampf(v, 0, 1)
static func _eo(k: float) -> float: return 1 - pow(1 - k, 3)
static func _ei(k: float) -> float: return k * k * k
static func _hs(i: int, s: float) -> float:
	var v := sin(i * 127.1 + s * 311.7) * 43758.5453
	return v - floorf(v)

func break_banner(u: Dictionary) -> void:
	if bt.B == null or u == null: return
	var t: float = bt.pn()
	u._psT = t + DUR - 120
	active = active.filter(func(S): return not is_same(S.u, u))
	active.append({"u": u, "t0": t, "seed": randi() % 10000, "shk": false})
	bt.sfx("whoosh", 0.8, 1.4)

## bposhi.js outline + shrink：素材描边一圈 → 平滑缩到美术像素宽 art → alpha 二值化（<110 透明）
static func _shrink(key: String, art: int, edge: Color) -> ImageTexture:
	var ck := key + "@" + str(art)
	if _small.has(ck): return _small[ck]
	var src: Image = Motion.image_of(key)
	if src == null: return null
	src = src.duplicate(); src.convert(Image.FORMAT_RGBA8)
	var w := src.get_width(); var h := src.get_height()
	var o := Image.create(w + 2, h + 2, false, Image.FORMAT_RGBA8)
	for y in h:
		for x in w:
			var a := src.get_pixel(x, y).a
			if a <= 0: continue
			for d in [[0, 1], [2, 1], [1, 0], [1, 2], [0, 0], [2, 0], [0, 2], [2, 2]]:
				var px := o.get_pixel(x + d[0], y + d[1])
				if px.a < a: o.set_pixel(x + d[0], y + d[1], Color(edge, maxf(px.a, a)))
	o.blend_rect(src, Rect2i(0, 0, w, h), Vector2i(1, 1))
	o.resize(maxi(1, art), maxi(1, roundi(art * float(h + 2) / (w + 2))), Image.INTERPOLATE_LANCZOS)
	for y in o.get_height():
		for x in o.get_width():
			var c := o.get_pixel(x, y)
			o.set_pixel(x, y, Color(c, 0.0 if c.a < 110 / 255.0 else 1.0))
	var tex := ImageTexture.create_from_image(o)
	_small[ck] = tex
	return tex

func _px(ci: CanvasItem, x: float, y: float, col: Color) -> void:
	ci.draw_rect(Rect2(roundf(x / Q) * Q, roundf(y / Q) * Q, Q, Q), col)

func draw_world_banners(ci: CanvasItem, t: float) -> void:
	var B = bt.B
	var keep := []
	for S in active:
		if _draw_one(ci, S, t): keep.append(S)
	active = keep

func _draw_one(ci: CanvasItem, S: Dictionary, t: float) -> bool:
	var e: float = t - S.t0; var u: Dictionary = S.u
	if e >= DUR or bt.B == null: return false
	var h: float = bt.rules.unit_h(u)
	var cx: float = u.x + u.get("ox", 0.0); var top: float = u.y + u.get("oy", 0.0) - h
	var size := maxf(54, minf(96, h * 0.34))
	var cy := maxf(78 + size / 2, top + h * 0.42)
	var fo := 1.0 if e < T_OUT else ceilf((1 - _cl((e - T_OUT) / (DUR - T_OUT))) * 4) / 4
	if e >= T_POP and not S.shk:
		S.shk = true; bt.B.shake = maxf(bt.B.shake, 5); bt.sfx("advance", 0.9, 0.5)
	# 局部刀光：斜向划过（100ms 划出，再 140ms 收尾）
	if e < 240:
		var L := maxf(90, size * 1.6); var ang := -0.42; var dx := cos(ang); var dy := sin(ang)
		var head := _eo(_cl(e / 100)) * 2 * L
		var tail := 0.0 if e < 100 else minf(head, (e - 100) / 140 * 2 * L)
		var s2 := tail
		while s2 <= head:
			var x := cx - dx * L + dx * s2; var y := cy + 6 - dy * L + dy * s2
			var f := (s2 - tail) / maxf(1, head - tail)
			var w := maxi(1, roundi(2 * sin(PI * minf(1, f * 1.05))))
			for j in range(-w, w + 1): _px(ci, x, y + j * Q, Color("#ffb448") if absi(j) == w else Color("#fff4c8"))
			s2 += Q
	# 「破」砸入：1.5× → 1.0，闪白，回弹
	if e >= T_POP:
		var po := _shrink("fx_poshi_po", roundi(size / Q), Color("#d9ccae"))
		if po:
			var sc: float
			var k := (e - T_POP) / (T_SET - T_POP)
			if k < 1: sc = 1.5 - 0.5 * _ei(_cl(k))
			else:
				var q := e - T_SET
				sc = 1 + 0.07 * sin(q / 70 * PI) if q < 70 else 1.0
			var w2 := roundf(po.get_width() * Q * sc); var hh := roundf(po.get_height() * Q * sc)
			var x2 := roundf(cx - w2 / 2 - size * 0.12); var y2 := roundf(cy - hh / 2)
			ci.draw_texture_rect(po, Rect2(x2 + Q, y2 + Q, w2, hh), false, Color(0.1, 0.06, 0.05, fo * 0.5))
			ci.draw_texture_rect(po, Rect2(x2, y2, w2, hh), false, Color(1, 1, 1, fo))
			if e < T_POP + 70:
				var fl := fo * (1 - (e - T_POP) / 70)
				ci.draw_texture_rect(po, Rect2(x2, y2, w2, hh), false, Color(3, 3, 3, fl))
			for i in 6:
				var a2 := _hs(i, S.seed) * 6.28
				var d := size * (0.45 + 0.35 * _hs(i, S.seed + 1)) * _eo(_cl((e - T_POP) / 150))
				var x3 := cx + cos(a2) * d * 1.2; var y3 := cy + sin(a2) * d * 0.7
				if fo >= 0.5 or i % 2 == 0:
					_px(ci, x3, y3, Color(Color("#b0241a") if i == 1 else Color("#1a0e08"), fo))
					if i % 3 == 0: _px(ci, x3 + Q, y3, Color(Color("#1a0e08"), fo))
	# 朱印「势」：右下角盖章 1.4× → 1.0
	if e >= T_SEAL:
		var q2 := e - T_SEAL
		var sl := _shrink("fx_poshi_seal", roundi(size * 0.5 / Q), Color("#1a0806"))
		if sl:
			var sc2 := 1.4 - 0.4 * _ei(q2 / 70) if q2 < 70 else 1.0
			var w3 := roundf(sl.get_width() * Q * sc2); var h3 := roundf(sl.get_height() * Q * sc2)
			ci.draw_texture_rect(sl, Rect2(roundf(cx + size * 0.3 - w3 / 2), roundf(cy + size * 0.32 - h3 / 2), w3, h3), false, Color(1, 1, 1, fo * (0.6 + q2 / 175 if q2 < 70 else 1.0)))
	return true
