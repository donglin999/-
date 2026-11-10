extends RefCounted
## 正道盟逐招专属特效（原版 js/faction-fx/fx-am.js）：am_s1 短锋相照、am_s2 同担一线。
## am_s3 明约合锋原版已改播 am_s3_v2（见 fx_clash_v2.gd），本文件不含旧版。

const U := preload("res://scripts/battle/fx_util.gd")
const Store := preload("res://scripts/battle/fx_store.gd")
const L := preload("res://scripts/battle/fx_lib.gd")

static var _inst = null

static func register() -> void:
	if _inst != null: return
	_inst = new()
	Store.define("am_s1", {"grade": "丙", "name": "短锋相照", "dur": 950, "budget": 520, "ramp": "wind", "lead": 150, "hitAt": 330, "boost": 1.2,
		"init": _inst.s1_init, "update": _inst.s1_update, "draw": _inst.s1_draw}, _inst)
	Store.define("am_s2", {"grade": "乙", "name": "同担一线", "dur": 1250, "budget": 600, "ramp": "gold", "lead": 200, "hitAt": 700, "side": "ally", "boost": 1.5,
		"noBoost": ["am_flow_ribbon", "kit_rise", "kit_ring", "kit_qi"],
		"init": _inst.s2_init, "update": _inst.s2_update, "draw": _inst.s2_draw}, _inst)

static func _w(t, a, b) -> float: return U.win(t, a, b)
static func _rnd(fx) -> float: return fx.rand.call()

# ───────── 丙 · 短锋相照 am_s1 ─────────
func s1_init(fx) -> void:
	var H: Dictionary = fx.A.hand; var C := L.chest(fx)
	fx.s.p = L.quad([H.x - 8, H.y], [(H.x + C.x) / 2, C.y - 4], [C.x + 14, C.y])

func s1_update(fx, t: float, dt: float) -> void:
	var C := L.chest(fx); var H: Dictionary = fx.A.hand; var P: Dictionary = fx.allies()[0]
	if t < 160 and _rnd(fx) < dt / 9: L.converge(fx, {"x": H.x - 8, "y": H.y}, "wind", 1, {"r0": 10, "r1": 24, "F": 240, "swirl": 60, "life": 240})
	var k := _w(t, 150, 330)
	if k > 0 and k < 1:
		var p: Array = fx.s.p.call(U.accel(k))
		L.shed(fx, p[0], p[1], p[2], "wind", 2, {"sp": 60, "life": 280})
	fx.once("h", t >= 330, func():
		fx.pop("am_stab_mark", C.x + 2, C.y, {"life": 560, "sc": [0.9, 1.75], "a": [1, 0]})
		L.hurt(fx, C.x, C.y, 30, "wind", {"sc": 0.75, "shake": 3, "hit": 80})
		for i in 16:
			var u := PI + (_rnd(fx) - 0.5) * 1.4
			fx.spawn({"x": C.x, "y": C.y + (_rnd(fx) - 0.5) * 14, "vx": cos(u) * (120 + _rnd(fx) * 160), "vy": sin(u) * (60 + _rnd(fx) * 70), "drag": 2.4, "life": 380, "kind": "streak", "len": 0.05, "ramp": "wind"}))
	fx.once("g", t >= 380, func():
		fx.pop(L.tinted("kit_ring", "wind"), P.gx - 6, P.gy - 4, {"life": 520, "sc": [0.4, 1.15], "a": [0.9, 0], "layer": "back"})
		L.motes(fx, P.x - 26, P.y, 10, 46, "wind", 14, {"vy": -22, "life": 520}))
	if t > 380 and t < 760 and _rnd(fx) < dt / 16: L.motes(fx, P.x - 28, P.y, 8, 50, "wind", 1, {"vy": -18, "life": 460})

func s1_draw(fx, t: float) -> void:
	var H: Dictionary = fx.A.hand; var P: Dictionary = fx.allies()[0]; var C := L.chest(fx); var k := _w(t, 150, 330)
	if k > 0 and k < 1: L.fly(fx, "front", "am_short_thrust", fx.s.p, U.accel(k), {"sc": 1.6, "echo": 3, "gap": 0.07})
	# 残锋：刺到位后留在目标身前，随后收回
	var r := _w(t, 330, 620)
	if r > 0 and r < 1:
		var b := U.out3(_w(t, 460, 620))
		fx.img("front", "am_short_thrust", lerpf(C.x + 24, H.x - 40, b), lerpf(C.y, H.y, b), {"a": 0.9 * (1 - r), "sx": 1.5 - 0.6 * _w(t, 460, 620), "sy": 1.4})
	var m := U.out3(_w(t, 150, 330))
	var cx := lerpf(H.x + 8, P.x - 30, m); var cy := lerpf(H.y - 36, P.y + 2, m)
	var flash := _w(t, 330, 390) * (1 - _w(t, 390, 560))
	var ga := _w(t, 0, 150) * (1.0 if t < 560 else lerpf(1, 0.45, _w(t, 560, 720))) * (1 - _w(t, 850, 950))
	fx.img("front", "am_guard_crescent", cx, cy, {"a": ga + flash * 0.5, "sx": 0.95 + 0.18 * flash, "sy": 0.95 + 0.18 * flash})
	if t >= 330:
		var e := _w(t, 330, 700)
		if e < 1: fx.img("back", "am_guard_crescent", cx - 10 - e * 14, cy, {"a": 0.5 * (1 - e), "sx": 1.05 + 0.2 * e, "sy": 1.05 + 0.2 * e})
	var W4: Color = Store.ramp("wind")[4]
	if flash > 0: fx.gdot(cx, cy, 30, W4, 0.7 * flash)
	if t < 160: fx.gdot(H.x - 6, H.y, 12, W4, 0.8 * _w(t, 0, 80))
	L.draw_hits(fx, "front")

# ───────── 乙 · 同担一线 am_s2 ─────────
static func inout_k(k: float) -> float: return 2 * k * k if k < 0.5 else 1 - pow(-2 * k + 2, 2) / 2

func s2_init(fx) -> void:
	var H: Dictionary = fx.A.hand; var P: Dictionary = fx.allies()[0]
	var O := {"x": H.x + 12, "y": H.y + 8}
	var d := Vector2(P.x - O.x, P.y - O.y).length()
	fx.s.O = O; fx.s.near = d < 50
	if fx.s.near: fx.s.path = L.quad([O.x, O.y], [O.x - 20, O.y - 80], [P.x - 12, P.y - 6])
	else: fx.s.path = L.quad([O.x, O.y], [(O.x + P.x) / 2, minf(O.y, P.y) - 40], [P.x - 12, P.y - 6])

func _abp(fx) -> int: return 3 if fx.actual_bp == null else int(fx.actual_bp)

func s2_update(fx, t: float, dt: float) -> void:
	var O: Dictionary = fx.s.O; var P: Dictionary = fx.allies()[0]
	if t < 240 and _rnd(fx) < dt / 7: L.converge(fx, O, "gold", 1, {"r0": 14, "r1": 34, "F": 240, "swirl": 70, "life": 300})
	fx.once("o", t >= 200, func():
		for i in 12:
			var u := _rnd(fx) * TAU
			fx.spawn({"x": O.x, "y": O.y, "vx": cos(u) * 46, "vy": sin(u) * 40, "drag": 2.4, "life": 420, "ramp": "gold", "tone": 5, "glow": 3 if _rnd(fx) < 0.3 else 0}))
	var k := _w(t, 250, 700)
	if k > 0 and k < 1:
		var p: Array = fx.s.path.call(inout_k(k)); var x: float = p[0]; var y: float = p[1]
		if _rnd(fx) < dt / 5: fx.spawn({"x": x + (_rnd(fx) - 0.5) * 8, "y": y + (_rnd(fx) - 0.5) * 8, "vx": (_rnd(fx) - 0.5) * 14, "vy": (_rnd(fx) - 0.5) * 14 + 6, "life": 520, "ramp": "jiangqing", "tone": 4, "glow": 3 if _rnd(fx) < 0.2 else 0})
		if _rnd(fx) < dt / 9: fx.spawn({"x": x, "y": y, "vx": (_rnd(fx) - 0.5) * 20, "vy": -10 - _rnd(fx) * 20, "life": 420, "ramp": "gold", "tone": 5, "kind": "star" if _rnd(fx) < 0.3 else "px", "size": 1})
	fx.once("h", t >= 700, func():
		fx.s.hit = t
		fx.pop(L.tinted("kit_ring", "gold"), P.x - 12, P.y - 6, {"life": 560, "sc": [0.3, 1], "a": [0.9, 0]})
		fx.pop(L.tinted("kit_ring", "gold"), P.gx, P.gy - 2, {"life": 700, "sc": [0.5, 1.5], "a": [0.8, 0], "layer": "back"})
		for i in 26:
			var u := _rnd(fx) * TAU
			fx.spawn({"x": P.x - 12, "y": P.y - 6, "vx": cos(u) * 60, "vy": sin(u) * 50 - 20, "drag": 1.8, "life": 700, "ramp": "gold", "tone": 5, "glow": 3 if _rnd(fx) < 0.3 else 0}))
	for i in mini(3, _abp(fx)):
		fx.once("pip" + str(i), t >= 760 + i * 80, func():
			for q in 6:
				fx.spawn({"x": P.x - 22 + i * 22 + (_rnd(fx) - 0.5) * 6, "y": P.y - 74 + (_rnd(fx) - 0.5) * 6, "vx": (_rnd(fx) - 0.5) * 40, "vy": -20 - _rnd(fx) * 30, "drag": 2, "life": 420, "ramp": "gold", "tone": 5, "kind": "px" if q else "star", "size": 1 if q else 2}))
	if fx.s.get("hit") and t < fx.s.hit + 420 and _rnd(fx) < dt / 7:
		fx.spawn({"x": P.gx + (_rnd(fx) - 0.5) * 40, "y": P.gy - _rnd(fx) * 20, "vx": (_rnd(fx) - 0.5) * 8, "vy": -60 - _rnd(fx) * 50, "life": 640, "ramp": "gold", "tone": 5, "fadeIn": 60, "glow": 3 if _rnd(fx) < 0.25 else 0})
	fx.once("br", t >= 900, func():
		var E: Array = fx.s.path.call(1.0)
		var Mx: float = (O.x + E[0]) / 2; var My: float = (O.y + E[1]) / 2
		for i in 10:
			fx.spawn({"x": Mx + (_rnd(fx) - 0.5) * 20, "y": My + (_rnd(fx) - 0.5) * 14, "vx": (_rnd(fx) - 0.5) * 80, "vy": (_rnd(fx) - 0.5) * 30, "drag": 2, "life": 420, "ramp": "jiangqing", "tone": 5}))

func s2_draw(fx, t: float) -> void:
	var O: Dictionary = fx.s.O; var P: Dictionary = fx.allies()[0]; var end := 1 - _w(t, 1000, 1250)
	fx.tint = [Color("#0a0c14"), 0.26 * minf(_w(t, 0, 200), end)]
	fx.vig = 0.2 * minf(_w(t, 0, 250), end)
	# 劲流：一条绛青丝带从施法者铺向同伴（自施法者端显现），收势从中间断开：左右两半各自向两端退开淡出
	var k := _w(t, 200, 620); var br := _w(t, 900, 1150)
	var E: Array = fx.s.path.call(1.0)
	var A := {"x": O.x, "y": O.y}; var B := {"x": E[0], "y": E[1]}
	if k > 0:
		if fx.s.near:
			if Store.IMG.has("am_flow_ribbon"):
				var hk := U.out3(k)
				for row in [[0, 0.95, 1.4], [22, 0.45, 1.0]]:
					var dy: float = row[0]; var al: float = row[1]; var sy: float = row[2]
					if br <= 0: fx.img("back", "am_flow_ribbon", O.x - 30, O.y - 92 + dy, {"a": al, "sx": 1, "sy": sy, "clip": [1 - hk, 1]})
					else:
						fx.img("back", "am_flow_ribbon", O.x - 30 - 14 * br, O.y - 92 + dy, {"a": al * (1 - br), "sx": 1, "sy": sy, "clip": [0, 0.5 - 0.3 * br]})
						fx.img("back", "am_flow_ribbon", O.x - 30 + 14 * br, O.y - 92 + dy, {"a": al * (1 - br), "sx": 1, "sy": sy, "clip": [0.5 + 0.3 * br, 1]})
		elif br <= 0:
			span(fx, "back", "am_flow_ribbon", A, B, {"al": 0.95, "k": k, "sy": 1.3})
			span(fx, "back", "am_flow_ribbon", {"x": A.x, "y": A.y + 18}, {"x": B.x, "y": B.y + 18}, {"al": 0.4, "k": k, "sy": 0.9})
		else:
			var Mx: float = (A.x + B.x) / 2; var My: float = (A.y + B.y) / 2; var d := br * 0.3
			span(fx, "back", "am_flow_ribbon", {"x": lerpf(Mx, B.x, d), "y": lerpf(My, B.y, d)}, B, {"al": 1 - br, "sy": 1.3})
			span(fx, "back", "am_flow_ribbon", A, {"x": lerpf(Mx, A.x, d), "y": lerpf(My, A.y, d)}, {"al": 1 - br, "sy": 1.3})
	var m := _w(t, 250, 700)
	var G: Array = Store.ramp("gold")
	if t < 720:
		var xy: Array = fx.s.path.call(inout_k(m)) if m > 0 else [O.x, O.y]
		var g := _w(t, 0, 200)
		fx.img("front", L.tinted("kit_qi", "gold"), xy[0], xy[1], {"a": 0.8 * g * (1 - _w(t, 640, 720)), "rot": t * 0.01, "sx": 0.8 + 0.2 * g, "sy": 0.8 + 0.2 * g})
		fx.img("front", "am_power_orb", xy[0], xy[1], {"a": minf(1, g * 1.5), "sx": 0.9 + 0.6 * g, "sy": 0.9 + 0.6 * g})
		fx.gdot(xy[0], xy[1], 20, G[4], 0.6 * g)
	if t >= 700:
		var g2 := _w(t, 700, 800) * (1 - _w(t, 800, 1000))
		fx.gdot(P.x - 12, P.y - 6, 24, G[4], 0.8 * g2)
		var up := U.out3(_w(t, 700, 900)); var ra := 1 - _w(t, 960, 1180)
		if ra > 0: fx.img("back", L.tinted("kit_rise", "gold"), P.gx, P.gy + 2, {"a": 0.85 * ra, "ay": 1, "sx": 1.1, "sy": 0.4 + 0.5 * up})
		var p := _w(t, 720, 960)
		fx.img("front", "am_bp_pips", P.x, P.y - 74, {"a": 1 - _w(t, 1120, 1250), "clip": [0, minf(_abp(fx) / 3.0, 0.05 + p)], "sx": 1.5, "sy": 1.5})
	L.draw_hits(fx, "front")

## span：把一张朝左的横向素材铺在 a→b 两点之间（尖端落在 b），clip 自 a 端向 b 端显现
static func span(fx, layer: String, id: String, a: Dictionary, b: Dictionary, o := {}) -> void:
	var sp = Store.IMG.get(id)
	if sp == null: return
	var d := Vector2(b.x - a.x, b.y - a.y).length(); var ang := atan2(b.y - a.y, b.x - a.x)
	fx.img(layer, id, (a.x + b.x) / 2, (a.y + b.y) / 2, {"a": o.get("al", 1.0), "rot": ang - PI, "sx": d / sp.w, "sy": o.get("sy", 1.0), "clip": [1 - U.out3(o.get("k", 1.0)), 1]})
