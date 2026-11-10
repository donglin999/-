extends Node2D
## 单个战斗单位的绘制。对应原版 js/bfx.js drawOne / rings / trail / shadow / blit / foeDeath / snap。
## 本节点画脚下阴影与光环（无着色）；子节点 trail 画冲刺残影、spr 画精灵（都挂 battle_tint 着色器）。

const PX := 3.0
const TINT := preload("res://shaders/battle_tint.gdshader")
const FL := 260.0

var bt
var u: Dictionary
var o := {"x": 0.0, "gy": 0.0, "lift": 0.0}
var t := 0.0
var fr := {}
var spr: Node2D
var trail: Node2D
var mat_s: ShaderMaterial
var mat_t: ShaderMaterial
var _draw_spr := {}   # 本帧精灵绘制参数
var _death := []      # 碎散块绘制

static var _shadow_tex: GradientTexture2D

func _init(b, unit: Dictionary) -> void:
	bt = b; u = unit
	trail = Node2D.new(); add_child(trail)
	spr = Node2D.new(); add_child(spr)
	mat_s = ShaderMaterial.new(); mat_s.shader = TINT; spr.material = mat_s
	mat_t = ShaderMaterial.new(); mat_t.shader = TINT; trail.material = mat_t
	mat_t.set_shader_parameter("white", 0.85)
	mat_t.set_shader_parameter("wc", Color("#ff8a70") if u.side == "foe" else Color("#8fd0ff"))
	for n in [spr, trail]: n.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	spr.draw.connect(_draw_sprite)
	trail.draw.connect(_draw_trail)

static func shadow_tex() -> GradientTexture2D:
	if _shadow_tex == null:
		var g := Gradient.new()
		g.offsets = PackedFloat32Array([0.0, 0.55, 1.0])
		var c := Color8(8, 5, 3)
		g.colors = PackedColorArray([Color(c, 0.55), Color(c, 0.32), Color(c, 0.0)])
		_shadow_tex = GradientTexture2D.new()
		_shadow_tex.gradient = g; _shadow_tex.fill = GradientTexture2D.FILL_RADIAL
		_shadow_tex.fill_from = Vector2(0.5, 0.5); _shadow_tex.fill_to = Vector2(1.0, 0.5)
		_shadow_tex.width = 64; _shadow_tex.height = 64
	return _shadow_tex

func mo(): return bt.rules.mo
static func sn(v: float) -> float: return roundf(v / PX) * PX

## 每帧由 view.gd 调用：状态跃迁与本帧着色参数（bfx.js drawOne 前半）
func tick(now: float) -> void:
	t = now
	o = mo().off_of(u, t)
	var h: float = bt.rules.unit_h(u)
	if u.hp <= 0:
		if u.get("_dT") == null: u._dT = t; u.anim = null; u.dashing = false
	elif u.get("_dT") != null: u._dT = null; u._blk = null; u._gone = false
	if u.get("broken") and not u.get("_bk"): u._bk = true; u._bT = t
	elif not u.get("broken") and u.get("_bk"):
		u._bk = false
		if u.hp > 0: u._shT = t
	if u.get("charging") and not u.get("_ch"): u._ch = true; u._cT = t
	elif not u.get("charging"): u._ch = false
	var gx: float = u.x + o.x; var gy: float = u.y + o.gy
	u.ox = o.x; u.oy = o.gy - o.lift; u.goy = o.gy
	_draw_spr = {}; _death = []
	fr = mo().frame_of(u, t, h)
	if u.hp <= 0 and u.side == "foe": _foe_death(gx, gy, h)
	else: _prepare(gx, gy, h)
	_trail_step(gx, gy - o.lift)
	queue_redraw(); spr.queue_redraw(); trail.queue_redraw()

func _prepare(gx: float, gy: float, h: float) -> void:
	var y: float = gy - o.lift
	var st: Dictionary = fr.st; var k: String = st.k; var e: float = t - st.t0; var dir: float = mo().face(u)
	var rot := 0.0; var dx := 0.0; var sxs := 1.0; var sys := 1.0; var up := 0.0
	var op := {"white": 0.0, "wc": Color.WHITE, "grey": 0.0, "dark": 0.0, "dc": Color.BLACK}
	var has_k: bool = fr.get("sheet", false) and mo().has_a(fr.A, k)
	if not has_k:
		if k == "idle" and not fr.get("sheet", false): sys = 1 + sin(t / 420 + u.id * 9) * 0.012
		elif k == "dash": rot = 0.1 * dir
		elif k == "atk" or k == "atk2":
			var im: float = mo().impact_ms(u, k)
			if e < im: dx = -5 * dir * e / im; rot = -0.05 * dir
			else:
				var q := maxf(0, 1 - (e - im) / 250); dx = 10 * dir * q; sxs = 1 + 0.06 * q; rot = 0.06 * dir * q
		elif k == "hurt": rot = -0.12 * dir * maxf(0, 1 - e / 300)
		elif k == "cast": up = 3 * minf(1, e / 120); op.white = 0.1 + 0.06 * sin(t / 60); op.wc = Color("#fff4c0")
		elif k == "dead": rot = -0.32 * dir
	if u.get("broken") and u.hp > 0:
		if fr.get("sheet", false) and mo().has_a(fr.A, "brk"): op.grey = 0.25
		else: op.grey = 0.7; op.dark = 0.22; rot += -0.08 * dir
	if u.hp <= 0: op.grey = 0.45; op.dark = 0.45
	var B = bt.B
	if B.tgtList != null and u.hp > 0 and not is_same(u, B.cur):
		var on: bool = bt.rules.has(B.tgtList, u) and (B.tgtAll or is_same(B.tgtList[B.tsel], u))
		if on: op.white = maxf(op.white, 0.1 + 0.08 * sin(t / 110)); op.wc = Color("#fff4d8")
		else: op.dark = maxf(op.dark, 0.38); op.dc = Color("#05030a")
	if u.get("_boT") != null:
		var kb: float = (t - u._boT) / (760 + u._boL * 120)
		if kb >= 0 and kb < 1: op.white = (0.06 + 0.05 * u._boL) * sin(kb * PI); op.wc = Color("#ffd070")
	if u.get("charging") and u.hp > 0: op.white = 0.07 + 0.06 * sin(t / 70); op.wc = Color("#ff3020")
	if u.get("_hlT") != null and t - u._hlT < 320: op.white = 0.35 * (1 - (t - u._hlT) / 320); op.wc = Color("#b0ffc8")
	if u.get("_shT") != null and t - u._shT < 300: op.white = 0.7 * (1 - (t - u._shT) / 300); op.wc = Color("#bfe6ff")
	if u.get("_flT") != null:
		var f: float = t - u._flT
		if f < 70 or (f >= 120 and f < 190): op.white = 1.0 if f < 70 else 0.7; op.wc = Color.WHITE
	if u.get("_tapT") != null and t - u._tapT < 120: op.white = maxf(op.white, float(u.get("_tapPower", 0.5)) * (1 - (t - u._tapT) / 120)); op.wc = Color("#fff2d4")
	if u.hp <= 0 and u.get("_dT") != null and t - u._dT < 160: op.white = 0.8; op.wc = Color.WHITE
	_draw_spr = {"x": gx + dx, "y": y - up, "rot": rot, "sx": sxs, "sy": sys, "op": op, "alpha": 0.9 if u.hp <= 0 else 1.0, "gx": gx, "gy": gy, "h": h}

## 冲刺残影采样（bfx.js trail：每 38ms 记一帧，最多 3 个）
func _trail_step(x: float, y: float) -> void:
	if u.get("dashing") and not fr.get("none", false):
		if u.get("_tr") == null: u._tr = []
		var l = u._tr[0] if u._tr.size() else null
		if l == null or t - l.t >= 38:
			u._tr.push_front({"x": x, "y": y, "fr": fr, "t": t})
			if u._tr.size() > 3: u._tr.resize(3)
	if u.get("_tr") and not u.get("dashing"):
		var old := true
		for s in u._tr: if t - s.t <= 260: old = false
		if old: u._tr = []

## bfx.js foeDeath：闪红白 → 自上而下像素碎散
func _foe_death(x: float, y: float, h: float) -> void:
	if u.get("_gone"): return
	var e: float = t - u._dT
	if e < FL:
		var ph := int(e / 65) % 2
		_draw_spr = {"x": x + sin(e * 0.9) * 2, "y": y, "rot": 0.0, "sx": 1.0, "sy": 1.0, "alpha": 1.0, "gx": x, "gy": y, "h": h,
			"op": {"white": 0.88, "wc": Color("#ff3a2a") if ph else Color.WHITE, "grey": 0.0, "dark": 0.0, "dc": Color.BLACK}}
		return
	if u.get("_blk") == null: u._blk = _snap(fr)
	var E := e - FL
	if not u._blk:
		var a := 1 - E / 600
		if a <= 0: u._gone = true; return
		_draw_spr = {"x": x, "y": y, "rot": 0.0, "sx": 1.0, "sy": 1.0, "alpha": a, "gx": x, "gy": y, "h": h, "noshadow": true,
			"op": {"white": 0.4, "wc": Color("#ff6040"), "grey": 0.0, "dark": 0.0, "dc": Color.BLACK}}
		return
	_draw_spr = {"shadow_only": true, "gx": x, "gy": y, "h": h, "sa": maxf(0, 1 - E / 600)}
	var S: float = u._blk.s; var alive := 0
	for b in u._blk.b:
		if E < b.rel: _death.append([Rect2(roundf(x + b.x), roundf(y + b.y), S, S), Color.WHITE if E > b.rel - 70 else b.c]); alive += 1
	for b in u._blk.b:
		var a: float = E - b.rel
		if a < 0 or a > b.life: continue
		alive += 1
		var k: float = a / b.life
		var px: float = x + b.x + b.vx * a; var py: float = y + b.y + b.vy * a - 0.00006 * a * a
		var c: Color = Color("#fff4e0") if k < 0.1 else b.cs[mini(4, 1 + int(k * 4))]
		c.a = 1.0 if k < 0.1 else 1 - k
		var s := maxf(2, S - 1) if k > 0.55 else S
		_death.append([Rect2(sn(px), sn(py), s, s), c])
	if not alive: u._gone = true

static func _rr(a: float, b: float) -> float: return a + randf() * (b - a)

func _snap(f: Dictionary):
	if f.get("none", false) or f.get("tex") == null: return false
	var im: Image = mo().image_of(f.A.file) if f.get("A") != null else null
	if im == null: return false
	var src: Rect2 = f.src; var w := int(src.size.x); var hh := int(src.size.y)
	var bs := maxi(1, roundi(hh / 44.0)); var k2: float = f.dh / hh
	var out := []; var y0 := 1e9; var y1 := -1e9
	var origin: float = (f.dw - (f.originX if f.originX != null else f.dw / 2)) if f.flip else (f.originX if f.originX != null else f.dw / 2)
	var by := 0
	while by < hh:
		var bx := 0
		while bx < w:
			var px := mini(w - 1, bx + (bs >> 1)); var py := mini(hh - 1, by + (bs >> 1))
			var c := im.get_pixel(int(src.position.x) + px, int(src.position.y) + py)
			if c.a8 >= 110:
				var lx := (w - bx - bs) if f.flip else bx
				out.append({"x": lx * k2 - origin, "y": (by - hh) * k2, "c": Color(c, 1.0), "by": by}); y0 = minf(y0, by); y1 = maxf(y1, by)
			bx += bs
		by += bs
	for b in out:
		var n: float = (b.by - y0) / maxf(1, y1 - y0)
		b.rel = n * 560 + randf() * 110; b.vx = (b.x / maxf(1, f.dw / 2)) * 0.05 + _rr(-0.03, 0.03); b.vy = -_rr(0.03, 0.09); b.life = _rr(420, 720)
		var cs := []
		for j in 5:
			var m := j / 4.0
			cs.append(Color(b.c.r + (1 - b.c.r) * minf(1, m * 1.6), b.c.g + (170 / 255.0 - b.c.g) * m, b.c.b + (90 / 255.0 - b.c.b) * m))
		b.cs = cs
	return {"b": out, "s": maxf(2, ceilf(bs * k2))}

# ── 绘制 ──
func px_ellipse(cx: float, cy: float, rx: float, ry: float, c: Color, a := 1.0, gap := 0.0, rot := 0.0) -> void:
	if a <= 0: return
	var n := maxi(12, ceili((rx + ry) * PI / PX * 1.4)); var seen := {}
	var cc := Color(c, minf(1, a))
	for i in n:
		var an := float(i) / n * TAU
		if gap and (floori((an + rot) / gap) & 1): continue
		var x := roundi((cx + cos(an) * rx) / PX); var y := roundi((cy + sin(an) * ry) / PX); var k := x * 9999 + y
		if seen.has(k): continue
		seen[k] = true; draw_rect(Rect2(x * PX, y * PX, PX, PX), cc)

func _shadow(x: float, y: float, h: float, lift: float, a := 1.0) -> void:
	var rx := maxf(15, h * 0.19) * (1 - minf(0.45, lift / 110)); var ry := maxf(4, h * 0.042)
	if bt.view.atmo() != null:
		var k := 1 - minf(0.5, lift / 140); var R := rx * 1.45
		draw_texture_rect(shadow_tex(), Rect2(x - R, y - ry * 1.6, R * 2, ry * 3.2), false, Color(1, 1, 1, a * k))
		return
	var cc := Color(0, 0, 0, 0.34 * a * (1 - minf(0.5, lift / 140)))
	var yy := -ry
	while yy <= ry:
		var w := rx * sqrt(maxf(0, 1 - pow(yy / ry, 2)))
		var x0 := sn(x - w); var x1 := sn(x + w)
		if x1 > x0: draw_rect(Rect2(x0, sn(y - 2 + yy), x1 - x0, PX), cc)
		yy += PX

func _rings(x: float, y: float, h: float) -> void:
	var rx := maxf(30, h * 0.24); var ry := rx * 0.28
	if u.hp > 0 and is_same(bt.B.cur, u):
		var c := Color("#ff7a5a") if u.side == "foe" else Color("#ffd24a"); var p := 0.62 + 0.22 * sin(t / 220)
		px_ellipse(x, y, rx, ry, c, p); px_ellipse(x, y, rx * 0.78, ry * 0.78, c, p * 0.45, 0.5, t / 500)
	if u.get("_tT") != null:
		var k: float = (t - u._tT) / 560
		if k >= 0 and k < 1:
			var r := 1 + k * 1.2
			px_ellipse(x, y, rx * r, ry * r, Color("#ffb09a") if u.side == "foe" else Color("#fff0b8"), (1 - k) * 0.95)
			if k < 0.5: px_ellipse(x, y, rx * r * 0.7, ry * r * 0.7, Color.WHITE, (1 - k * 2) * 0.6)

func _draw() -> void:
	if bt.B == null or _draw_spr.is_empty(): return
	var d := _draw_spr
	if d.get("shadow_only"): _shadow(d.gx, d.gy, d.h, 0, d.sa); return
	if d.get("noshadow"): return
	_shadow(d.gx, d.gy, d.h, o.lift if u.hp > 0 or u.side != "foe" else 0.0)
	if u.hp > 0 or u.side != "foe": _rings(d.gx, d.gy, d.h)

func _blit(ci: CanvasItem, f: Dictionary, x: float, y: float, rot := 0.0, sx := 1.0, sy := 1.0, alpha := 1.0) -> void:
	if f.get("none", false) or f.get("tex") == null: return
	var dw := roundf(f.dw); var dh := roundf(f.dh)
	ci.draw_set_transform(Vector2(roundf(x), roundf(y + f.get("foot", 0.0))), rot, Vector2((-1.0 if f.flip else 1.0) * sx, sy))
	var ox: float = roundf(f.originX if f.originX != null else dw / 2)
	ci.draw_texture_rect_region(f.tex, Rect2(-ox, -dh, dw, dh), f.src, Color(1, 1, 1, alpha))
	ci.draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

func _draw_sprite() -> void:
	if bt.B == null: return
	for r in _death: spr.draw_rect(r[0], r[1])
	var d := _draw_spr
	if d.is_empty() or d.get("shadow_only"):
		mat_s.set_shader_parameter("white", 0.0); mat_s.set_shader_parameter("grey", 0.0); mat_s.set_shader_parameter("dark", 0.0); mat_s.set_shader_parameter("rim_on", 0.0)
		return
	var op: Dictionary = d.op
	mat_s.set_shader_parameter("white", op.white); mat_s.set_shader_parameter("wc", op.wc)
	mat_s.set_shader_parameter("grey", op.grey); mat_s.set_shader_parameter("dark", op.dark); mat_s.set_shader_parameter("dc", op.dc)
	var at = bt.view.atmo()
	var rim_on: bool = at != null and at.has("rim") and fr.get("sheet", false) and op.white <= 0 and op.grey <= 0 and op.dark <= 0
	mat_s.set_shader_parameter("rim_on", 1.0 if rim_on else 0.0)
	if rim_on:
		var rc: Array = at.rim; var k := float(fr.A.get("pixelScale", 1)) if fr.get("A") else 1.0
		mat_s.set_shader_parameter("rim", Color8(rc[0], rc[1], rc[2]))
		var ts: Vector2 = fr.tex.get_size()
		mat_s.set_shader_parameter("rim_step", Vector2((1.0 if fr.flip else -1.0) * k / ts.x, -k / ts.y))
	if fr.get("none", false):
		var y: float = d.y; var h: float = d.h
		spr.draw_set_transform(Vector2(d.gx, y - h * 0.35), 0, Vector2(h * 0.18, h * 0.35))
		spr.draw_circle(Vector2.ZERO, 1.0, Color(Color("#0b0806"), 0.9))
		spr.draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
		spr.draw_circle(Vector2(d.gx, y - h * 0.82), h * 0.12, Color(Color("#0b0806"), 0.9))
		return
	_blit(spr, fr, d.x, d.y, d.rot, d.sx, d.sy, d.alpha)

func _draw_trail() -> void:
	if bt.B == null or not u.get("_tr"): return
	var A := [0.5, 0.34, 0.2]
	for i in range(u._tr.size() - 1, -1, -1):
		var s: Dictionary = u._tr[i]
		var age: float = t - s.t; var f := clampf(1 - (age - 110) / 150, 0, 1)
		if f <= 0 or (absf(s.x - (u.x + o.x)) < 6 and not u.get("dashing")): continue
		_blit(trail, s.fr, s.x, s.y, 0, 1, 1, A[i] * f)
