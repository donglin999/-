extends RefCounted
## 原版 WuxiaFX.lib 组合件（js/faction-fx/wuxia-fx.js「组合件」一节与 hurt / leadAura）。fx 参数为 fx_wuxia.gd 实例。
## 只移植交锋招式用到的：chest、quad、fly、shed、strike、drawHits、motes、converge、hurt、leadAura、tinted。

const U := preload("res://scripts/battle/fx_util.gd")
const Store := preload("res://scripts/battle/fx_store.gd")
const Atlas := preload("res://scripts/battle/fx_atlas.gd")

static func chest(fx) -> Dictionary: return fx.targets()[0]

## quad(p0,p1,p2)：二次贝塞尔，返回 u→[x,y,切线角]
static func quad(p0: Array, p1: Array, p2: Array) -> Callable:
	return func(u: float) -> Array:
		var v := 1.0 - u
		return [v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1],
			atan2(2 * v * (p1[1] - p0[1]) + 2 * u * (p2[1] - p1[1]), 2 * v * (p1[0] - p0[0]) + 2 * u * (p2[0] - p1[0]))]

## fly：沿路径飞行的素材（素材朝左为前进方向），带残影
static func fly(fx, layer: String, id: String, path: Callable, k: float, o := {}) -> void:
	var sc: float = o.get("sc", 1.0); var echo: int = o.get("echo", 2); var gap: float = o.get("gap", 0.06); var a: float = o.get("a", 1.0); var ax: float = o.get("ax", 0.5)
	for i in range(echo, -1, -1):
		var kk := k - i * gap
		if kk < 0: continue
		var p: Array = path.call(kk)
		fx.img(layer, id, p[0], p[1], {"a": a * (0.38 / i if i else 1.0), "rot": p[2] - PI, "sx": sc, "sy": sc, "ax": ax})

## shed：沿运动反方向甩出的碎光
static func shed(fx, x: float, y: float, ang: float, ramp: String, n0: int, o := {}) -> void:
	var R: Callable = fx.rand
	var sp: float = o.get("sp", 60.0); var life: float = o.get("life", 420.0); var layer: String = o.get("layer", "front"); var bk: float = o.get("back", 1.0)
	for i in n0 * 2:
		var u: float = ang + PI * bk + (R.call() - 0.5) * 1.6
		var v: float = sp * (0.3 + R.call())
		fx.spawn({"x": x + (R.call() - 0.5) * 6, "y": y + (R.call() - 0.5) * 6, "vx": cos(u) * v, "vy": sin(u) * v - 10, "drag": 2, "life": life * (0.6 + R.call() * 0.8), "ramp": ramp, "layer": layer, "size": 2 if R.call() < 0.2 else 1, "glow": 5 if R.call() < 0.15 else 0})

## strike：剑痕＋白闪＋碎光／碎片／星芒＋局部光爆＋数字
static func strike(fx, x: float, y: float, ang: float, o := {}) -> void:
	var ramp: String = o.get("ramp", "jade"); var L: float = o.get("L", 40.0); var w: float = o.get("w", 4.0); var P: float = o.get("power", 1.0)
	var R: Callable = fx.rand
	if not fx.s.has("marks"): fx.s.marks = []
	if not fx.s.has("bursts"): fx.s.bursts = []
	fx.s.marks.append({"x": x, "y": y, "ang": ang, "L": L, "w": w, "ramp": ramp, "gap": o.get("gap", 0.0), "split": o.get("split", false), "life": o.get("life", 320.0), "t0": fx.t})
	fx.s.bursts.append({"x": x, "y": y, "r": 9 + P * 5, "ramp": ramp, "t0": fx.t})
	fx.hit("white", U.jround(float(o.get("hit", 90)) * 0.6)); fx.shake(o.get("shake", 2.0))
	var flash: float = o.get("flash", 0.0)
	if flash: fx.flash(Store.ramp(ramp)[4], flash, 140)
	var num: String = o.get("num", "")
	if num != "": fx.num(num, x + (R.call() - 0.5) * 14, y - 38 - R.call() * 10, {"scale": o.get("scale", 1), "ramp": ramp if ramp in ["sky", "jade"] else "gold"})
	for i in range(0, int(ceil(20 * P))):
		var u: float = ang + (0.0 if R.call() < 0.5 else PI) + (R.call() - 0.5) * 0.7
		var v: float = 90 + R.call() * 220 * sqrt(P)
		fx.spawn({"x": x, "y": y, "vx": cos(u) * v, "vy": sin(u) * v, "drag": 3.2, "life": 200 + R.call() * 300, "kind": "streak", "len": 0.028, "ramp": ramp})
	for i in range(0, int(ceil(16 * P))):
		var u: float = R.call() * TAU; var v: float = 30 + R.call() * 150
		fx.spawn({"x": x, "y": y, "vx": cos(u) * v, "vy": sin(u) * v - 20, "ay": 60, "drag": 2, "life": 300 + R.call() * 500, "ramp": ramp, "size": 2 if R.call() < 0.25 else 1, "glow": 5 if R.call() < 0.2 else 0})
	for i in range(0, int(ceil(6 * P))):
		var u: float = ang + (R.call() - 0.5) * 1.2 + (0.0 if R.call() < 0.5 else PI); var v: float = 60 + R.call() * 160
		fx.spawn({"x": x, "y": y, "vx": cos(u) * v, "vy": sin(u) * v, "ay": 120, "drag": 1.5, "life": 350 + R.call() * 400, "kind": "shard", "size": 3 + U.jround(R.call() * 3), "rot": R.call() * TAU, "spin": (R.call() - 0.5) * 18, "ramp": ramp})
	for i in range(0, int(ceil(P * 2.5))):
		fx.spawn({"x": x + (R.call() - 0.5) * 36, "y": y + (R.call() - 0.5) * 24, "life": 250 + R.call() * 300, "kind": "star", "size": 2 + U.jround(R.call() * 2 * P), "ramp": ramp})

## drawHits(fx,layer)：光爆（160ms）、剑痕（L 在 45ms 内伸满，按 4 像素量化）
static func draw_hits(fx, layer: String) -> void:
	var t: float = fx.t
	for b in fx.s.get("bursts", []):
		var a: float = t - b.t0
		if a < 0 or a > 160: continue
		var k := a / 160.0
		var R: Array = Store.ramp(b.ramp)
		fx.spr(layer, fx.atlas.glow(R, b.ramp, b.r * (1 - k * 0.4)), b.x, b.y, {"a": 0.8 * (1 - k), "add": true})
		fx.gdot(b.x, b.y, b.r * 3, R[3], 0.8 * (1 - k))
	for m in fx.s.get("marks", []):
		var a: float = t - m.t0
		if a < 0 or a > m.life: continue
		var k: float = a / m.life
		var L := maxf(8, U.jround(m.L * minf(1, a / 45) / 4) * 4)
		var w := maxf(1.5, U.jround(m.w * (1 - k * 0.6) * 2) / 2.0)
		var al := 1 - k * k
		var R: Array = Store.ramp(m.ramp)
		if m.split and a > 120:
			var sv := (a - 120) * 0.06
			for side in [-1, 1]:
				fx.spr(layer, fx.atlas.bake("sl%s_%s_%s_%s" % [L, w, m.gap, side], R, m.ramp, L / 2 + 3, m.ang, Atlas.sh_slash(L, w, m.gap, side)), m.x + cos(m.ang) * side * sv, m.y + sin(m.ang) * side * sv, {"a": al})
		else:
			fx.spr(layer, fx.atlas.bake("sl%s_%s_%s" % [L, w, m.gap], R, m.ramp, L / 2 + 3, m.ang, Atlas.sh_slash(L, w, m.gap)), m.x, m.y, {"a": al})
		if a < 90:
			fx.gline([[m.x - cos(m.ang) * L / 2, m.y - sin(m.ang) * L / 2], [m.x + cos(m.ang) * L / 2, m.y + sin(m.ang) * L / 2]], m.w * 3, R[4], 1 - a / 90)
	# ripples（BP≥2 才有，交锋不产生）未移植

## motes：飘浮微光
static func motes(fx, cx: float, cy: float, rx: float, ry: float, ramp: String, n: int, o := {}) -> void:
	var R: Callable = fx.rand
	var vy: float = o.get("vy", -14.0); var life: float = o.get("life", 900.0); var layer: String = o.get("layer", "front")
	for i in n:
		fx.spawn({"x": cx + (R.call() - 0.5) * rx * 2, "y": cy + (R.call() - 0.5) * ry * 2, "vx": (R.call() - 0.5) * 8, "vy": vy * (0.5 + R.call()), "life": life * (0.6 + R.call() * 0.8), "ramp": ramp, "layer": layer, "tone": 4, "fadeIn": 150, "glow": 4 if R.call() < 0.25 else 0, "kind": "star" if R.call() < 0.12 else "px", "size": 2 if R.call() < 0.12 else 1})

## converge：向 C 收拢旋入的聚气粒子
static func converge(fx, C: Dictionary, ramp: String, n: int, o := {}) -> void:
	var R: Callable = fx.rand
	var r0: float = o.get("r0", 50.0); var r1: float = o.get("r1", 110.0)
	for i in n:
		var u: float = R.call() * TAU; var d: float = r0 + R.call() * (r1 - r0)
		fx.spawn({"x": C.x + cos(u) * d, "y": C.y + sin(u) * d * 0.7, "pull": C, "pullF": o.get("F", 300.0), "swirl": o.get("swirl", 90.0), "life": o.get("life", 700.0), "ramp": ramp, "tone": 4, "glow": 4 if R.call() < 0.2 else 0})

## hurt：命中套件（strike＋数字＋异常名）；数字与异常名在 quiet 下不出
static func hurt(fx, x: float, y: float, num: float, ramp: String, o := {}) -> void:
	var K: float = 1 + 0.15 * fx.bp
	var sc: float = o.get("sc", 0.9)
	var id = o.get("id")
	if id != null: fx.pop(id, x, y, {"life": 420, "sc": [sc * 0.45, sc * 1.1], "a": [1, 0]})
	strike(fx, x, y, o.get("ang", PI), {"ramp": ramp, "L": 40 * sc, "w": 3.5, "power": 1.2 * sc * K, "hit": o.get("hit", 90), "shake": float(o.get("shake", 2)) * K, "flash": o.get("flash", 0.0)})
	fx.num(str(U.jround(num * (1 + 0.25 * fx.bp))), x + (fx.rand.call() - 0.5) * 10, y - 40, {"scale": o.get("scale", 2), "ramp": ramp})
	var st = o.get("status")
	if st != null: fx.label(st, x, y - 58, Store.STC.get(st), {"life": 1000})

## leadAura：起手窗口内施法者手部一团主色内息（kit_qi 按招式色带着色，临时关闭 boost）
static func lead_aura(fx, t: float) -> void:
	var sk: Dictionary = fx.skill
	var lead: float = sk.get("lead", 0)
	if not lead or t > lead + 120 or not Store.IMG.has("kit_qi"): return
	var a := U.win(t, 0, minf(160, lead * 0.5)) * (1 - U.win(t, lead - 40, lead + 120))
	if a <= 0.01: return
	var H: Dictionary = fx.A.hand
	var b = sk.get("boost"); sk.boost = 1
	var sc := 0.55 + 0.25 * U.win(t, 0, lead)
	fx.img("front", tinted("kit_qi", sk.get("ramp", "white")), H.x, H.y, {"a": 0.9 * a, "rot": t * 0.008, "sx": sc, "sy": sc})
	if b == null: sk.erase("boost")
	else: sk.boost = b

static func tinted(id: String, ramp: String) -> String: return Store.tinted(id, ramp)
