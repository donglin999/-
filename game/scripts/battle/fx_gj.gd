extends RefCounted
## 归烬堂逐招专属特效（原版 js/faction-fx/fx-gj.js）：gj_s1 藏锋短刺、gj_s2 燃隙刀。
## 原版 index.html 加载本文件并注册这两招，但领队交锋只加载 am_v1 / kit_v1 / clash_v2 素材、只播 am_s1/am_s2/am_s3_v2/cs_whip_*_v2，
## 不播归烬堂招式；这里照样注册，交锋流程不调用（素材 gj_v1 需另行 Store.load_dir 才能显示）。

const U := preload("res://scripts/battle/fx_util.gd")
const Store := preload("res://scripts/battle/fx_store.gd")
const L := preload("res://scripts/battle/fx_lib.gd")

static var _inst = null

static func register() -> void:
	if _inst != null: return
	_inst = new()
	Store.define("gj_s1", {"grade": "丁", "name": "藏锋短刺", "dur": 600, "budget": 160, "ramp": "plain", "lead": 100, "hitAt": 260, "leadAura": false, "boost": 1.15,
		"update": _inst.s1_update, "draw": _inst.s1_draw}, _inst)
	Store.define("gj_s2", {"grade": "丙", "name": "燃隙刀", "dur": 900, "budget": 300, "ramp": "fire", "lead": 150, "hitAt": 380, "leadAura": false, "boost": 1.1,
		"update": _inst.s2_update, "draw": _inst.s2_draw}, _inst)

static func _w(t, a, b) -> float: return U.win(t, a, b)
static func _rnd(fx) -> float: return fx.rand.call()
static func me(fx) -> Dictionary: return {"x": fx.A.hand.x + 20, "y": fx.A.hand.y + 20, "gx": fx.A.foot.x, "gy": fx.A.foot.y}

## embers：余烬飞溅
static func embers(fx, x: float, y: float, n: int, o := {}) -> void:
	var ramp: String = o.get("ramp", "fire"); var sp: float = o.get("sp", 150.0); var ay: float = o.get("ay", 90.0); var life: float = o.get("life", 900.0); var dir: float = o.get("dir", 0.0)
	for i in n:
		var u: float = dir + (_rnd(fx) - 0.5) * 1.2 if dir else -PI * (0.1 + _rnd(fx) * 0.8)
		var sg := 1.0 if dir else (-1.0 if _rnd(fx) < 0.5 else 1.0)
		fx.spawn({"x": x + (_rnd(fx) - 0.5) * 20, "y": y + (_rnd(fx) - 0.5) * 20, "vx": cos(u) * (50 + _rnd(fx) * sp) * sg, "vy": sin(u) * (50 + _rnd(fx) * sp * 0.8), "ay": ay, "drag": 1.2, "life": life * (0.6 + _rnd(fx) * 0.6), "ramp": ramp, "tone": 4, "glow": 3 if _rnd(fx) < 0.25 else 0})

# 丁 · 藏锋短刺：施法者身前折角阴影 → 目标身侧也翻出折角阴影，短锋从中偏斜刺出
func s1_update(fx, t: float, _dt: float) -> void:
	var C := L.chest(fx)
	fx.once("h", t >= 260, func():
		fx.pop("gj_stab_burst", C.x - 2, C.y + 12, {"life": 380, "sc": [0.6, 1.3], "a": [1, 0]})
		L.hurt(fx, C.x, C.y + 10, 26, "plain", {"status": "流血", "sc": 0.7, "shake": 0, "hit": 70})
		for i in 2:
			fx.spawn({"x": C.x, "y": C.y + 12, "vx": -30 - _rnd(fx) * 40, "vy": -20 - _rnd(fx) * 30, "ay": 160, "life": 500, "ramp": "red", "tone": 3, "size": 2}))

func s1_draw(fx, t: float) -> void:
	var C := L.chest(fx); var H: Dictionary = fx.A.hand
	var r := _w(t, 0, 60) * (1 - _w(t, 150, 260))
	if r > 0:
		fx.gdot(H.x, H.y, 10, Color("#c8423a"), 0.8 * r)
		fx.img("front", "gj_fold_shade", H.x - 18, H.y + 6, {"a": 0.9 * r, "sx": 0.7, "sy": 0.7})
	var sa := _w(t, 90, 160) * (1 - _w(t, 420, 600)); var sx: float = C.x + 40; var sy: float = C.y + 4
	if sa > 0:
		var g := 0.6 + 0.5 * U.out3(_w(t, 90, 180))
		fx.img("back", "gj_fold_shade", sx, sy, {"a": 0.92 * sa, "sx": g, "sy": g})
	var k := _w(t, 140, 260); var rt := _w(t, 330, 520)
	if k > 0 and rt < 1:
		var tip := lerpf(sx, C.x - 6, U.accel(k)) + rt * 40
		fx.img("front", "gj_short_stab", tip, lerpf(sy, C.y + 12, U.accel(k)), {"a": 1 - rt, "ax": 0, "clip": [0, minf(1, 0.25 + k)]})
	L.draw_hits(fx, "front")

# 丙 · 燃隙刀：护身气环敞开缺口（暴露）→ 加粗铜红斩弧劈落 → 尾部断两截余烬
func s2_update(fx, t: float, dt: float) -> void:
	var C := L.chest(fx); var H: Dictionary = fx.A.hand
	if t < 380 and _rnd(fx) < dt / 7: fx.spawn({"x": H.x + 4 + (_rnd(fx) - 0.5) * 14, "y": H.y - 12 - _rnd(fx) * 20, "vx": (_rnd(fx) - 0.5) * 14, "vy": -50 - _rnd(fx) * 40, "life": 420, "ramp": "fire", "tone": 4})
	fx.once("h", t >= 380, func():
		L.hurt(fx, C.x, C.y, 48, "fire", {"sc": 0.95, "shake": 3, "hit": 110, "ang": -2.3})
		embers(fx, C.x, C.y, 12)
		fx.pop("gj_ember_halves", C.x - 26, C.y + 44, {"life": 520, "delay": 120, "sc": [1, 1], "a": [1, 0], "vy": 30, "ease": func(k): return k}))

func s2_draw(fx, t: float) -> void:
	var C := L.chest(fx); var Me := me(fx)
	var ea := _w(t, 80, 180) * (1 - _w(t, 520, 800))
	if ea > 0:
		var g := 1 + 0.25 * (1 - U.out3(_w(t, 80, 260)))
		fx.img("front", "gj_expose", Me.x, Me.y - 6, {"a": ea, "sx": g, "sy": g})
	var k := _w(t, 150, 380); var f := 1 - _w(t, 460, 760)
	if k > 0 and f > 0: fx.img("front", "gj_thick_arc", C.x + 10, C.y - 4, {"a": f, "clip": [1 - U.inout(k), 1], "sx": 1, "sy": 1})
	L.draw_hits(fx, "front")
