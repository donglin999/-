extends RefCounted
## 第一章尾声「领队交锋」三招特效 v2（原版 js/faction-fx/fx-qihe-clash-v2.js）：am_s3_v2 明约合锋、cs_whip_s1_v2 缠腕短打、cs_whip_s2_v2 回身掠影。
## 素材负责主形，程序只负责显隐、运动、节奏、少量粒子点缀与压暗。特效空间里施者在右、目标在左（岑霜为敌方，交锋层整体水平镜像）。
## 接入约定：fx.T 实际目标、fx.pred 预判命中（决定压身/擦过）、fx.outcome 真实结算；主声、轻震、顿帧由交锋层每组合并一次。

const U := preload("res://scripts/battle/fx_util.gd")
const Store := preload("res://scripts/battle/fx_store.gd")
const L := preload("res://scripts/battle/fx_lib.gd")

## 长鞭大弧纵向放开，接近概念图 cs_whip_s2_b-2 的椭圆开口
const ARC_SY := 1.35

static var _inst = null

static func register() -> void:
	if _inst != null: return
	_inst = new()
	Store.define("am_s3_v2", {"grade": "甲", "name": "明约合锋", "dur": 1250, "budget": 90, "ramp": "jiangqing", "lead": 260, "hitAt": 520, "leadAura": false, "group": true,
		"init": _inst.am3_init, "update": _inst.am3_update, "draw": _inst.am3_draw}, _inst)
	Store.define("cs_whip_s1_v2", {"grade": "乙", "name": "缠腕短打", "dur": 900, "budget": 60, "ramp": "inkp", "lead": 150, "hitAt": 300, "leadAura": false,
		"init": _inst.cs1_init, "update": _inst.cs1_update, "draw": _inst.cs1_draw}, _inst)
	Store.define("cs_whip_s2_v2", {"grade": "甲", "name": "回身掠影", "dur": 1250, "budget": 90, "ramp": "inkp", "lead": 240, "hitAt": 520, "leadAura": false, "group": true,
		"init": _inst.cs2_init, "update": _inst.cs2_update, "draw": _inst.cs2_draw}, _inst)

static func _w(t, a, b) -> float: return U.win(t, a, b)
static func _rnd(fx) -> float: return fx.rand.call()
## res(fx,'pred')：未给预判时视作全部命中
static func res_pred(fx) -> Array:
	if fx.pred == null: return fx.targets().map(func(_p): return true)
	return fx.pred
## outOf：真实结算优先，其次命中瞬间记下的结果，再其次预判
static func out_of(fx) -> Array:
	if fx.outcome != null: return fx.outcome
	if fx.s.has("out"): return fx.s.out
	return res_pred(fx)
static func IW(id: String) -> float: return Store.IMG[id].w if Store.IMG.has(id) else 1.0
static func IH(id: String) -> float: return Store.IMG[id].h if Store.IMG.has(id) else 1.0
static func centroid(T: Array) -> Dictionary:
	var x := 0.0; var y := 0.0
	for p in T: x += p.x / T.size(); y += p.y / T.size()
	return {"x": x, "y": y}

# ───────── 甲 · 明约合锋 v2 ─────────
# 0–260 剑身金芒由柄向尖显出＋绛青气流向左铺开作扇根；260–520 绛青扇面锋向全部实际目标展开，金白前缘弧锋滞后一拍；
# 520 仅实际命中者出交叉剑痕光爆＋金白作用点，闪避者只有锋线擦过的几道白芒；520–1000 前送少许后消退；1000–1250 收尽。粒子≤90。
func am3_init(fx) -> void:
	var H: Dictionary = fx.A.hand; var T: Array = fx.targets(); var P := res_pred(fx)
	var O := {"x": H.x - 6, "y": H.y - 2}; fx.s.O = O
	var m := centroid(T); var ang := atan2(m.y - O.y, m.x - O.x)
	fx.s.ang = ang; fx.s.fang = ang + 0.14   # 扇面中线比目标中心方向向上偏约 8°
	# 扇面长度：到最远目标再多 46px；扇面张开高度覆盖目标纵向分布并高出头顶
	var far := 0.0; var spread := 0.0
	for p in T:
		far = maxf(far, Vector2(p.x - O.x, p.y - O.y).length())
		spread = maxf(spread, absf(-(p.x - O.x) * sin(ang) + (p.y - O.y) * cos(ang)))
	fx.s.len = far + 46
	var fanH := maxf(150, spread * 2 + 150)
	fx.s.sx = fx.s.len / (IW("am3_fan_jiangqing") * 0.97); fx.s.sy = fanH / (IH("am3_fan_jiangqing") * 0.55)
	var miss := []
	for i in T.size(): miss.append(not P[i])
	fx.s.miss = miss

func am3_update(fx, t: float, dt: float) -> void:
	var O: Dictionary = fx.s.O; var T: Array = fx.targets(); var low: bool = fx.low
	if t < 240 and _rnd(fx) < dt / (40.0 if low else 20.0): L.converge(fx, {"x": O.x - 14, "y": O.y}, "gold", 1, {"r0": 8, "r1": 22, "F": 220, "swirl": 40, "life": 220})
	# 扇面推进时前缘掉落少量金白/绛青碎光
	var k := U.accel(_w(t, 260, 520))
	if k > 0.1 and t < 540 and _rnd(fx) < dt / (30.0 if low else 15.0):
		var Lf: float = fx.s.len * k; var u: float = fx.s.ang + (_rnd(fx) - 0.5) * 1.1
		fx.spawn({"x": O.x + cos(u) * Lf, "y": O.y + sin(u) * Lf * 1.1, "vx": (_rnd(fx) - 0.5) * 24, "vy": (_rnd(fx) - 0.5) * 24, "life": 320, "ramp": "gold" if _rnd(fx) < 0.5 else "jiangqing", "tone": 5, "size": 2 if _rnd(fx) < 0.2 else 1})
	var out: Array = fx.outcome if fx.outcome != null else res_pred(fx)
	fx.once("h", t >= 520, func():
		fx.s.hitT = t; fx.s.out = out.duplicate()
		for i in T.size():
			var p: Dictionary = T[i]
			if not out[i]:
				for q in (2 if low else 3):
					fx.spawn({"x": p.x - 6, "y": p.y - 30 + (_rnd(fx) - 0.5) * 6, "vx": -130 - _rnd(fx) * 80, "vy": -26 + (_rnd(fx) - 0.5) * 20, "drag": 3, "life": 240, "kind": "streak", "len": 0.04, "ramp": "white"})
				continue
			fx.pop("am3_cross_hit", p.x, p.y, {"life": 480, "sc": [0.8, 1.6], "a": [1, 0]})
			fx.pop(L.tinted("kit_burst", "gold"), p.x, p.y, {"life": 260, "sc": [0.3, 0.7], "a": [0.9, 0]})
			for q in (4 if low else 9):
				var u: float = (-0.9 if q % 2 else 0.9) + (_rnd(fx) - 0.5) * 0.6 + (0.0 if _rnd(fx) < 0.5 else PI)
				fx.spawn({"x": p.x, "y": p.y, "vx": cos(u) * (70 + _rnd(fx) * 90), "vy": sin(u) * (60 + _rnd(fx) * 70), "drag": 3, "life": 240 + _rnd(fx) * 180, "kind": "streak" if q % 3 else "px", "len": 0.03, "ramp": "gold", "tone": 5}))

func am3_draw(fx, t: float) -> void:
	var O: Dictionary = fx.s.O; var ang: float = fx.s.ang; var end := 1 - _w(t, 1000, 1250)
	var G: Array = Store.ramp("gold")
	fx.tint = [Color("#0a0c14"), 0.22 * minf(_w(t, 0, 200), end)]
	# 起手：剑身金芒（右端＝柄，锋尖朝左）自柄向尖显出；绛青气流在人物后层向左铺开作扇根
	var c := U.out3(_w(t, 0, 220)); var cf := 1 - _w(t, 300, 460)
	if c > 0 and cf > 0:
		fx.img("front", "am3_blade_glint", O.x + 6, O.y, {"a": cf, "ax": 1, "ay": 0.5, "rot": ang - PI, "sx": 1.1, "sy": 1.1, "clip": [1 - c, 1]})
		fx.gdot(O.x - 30 * c, O.y, 10 + 10 * c, G[4], 0.55 * c * cf)
	var rb := U.out3(_w(t, 60, 320)); var ra := 0.7 * (1 - _w(t, 360, 620))
	if rb > 0 and ra > 0: fx.img("back", "am_flow_ribbon", O.x - 60 * rb, O.y + 16, {"a": ra, "ax": 0.75, "ay": 0.5, "rot": ang - PI + 0.12, "sx": 0.75, "sy": 0.8, "clip": [1 - rb, 1]})
	# 扇面：锚在扇根（素材右端），向左显出；520 后前送少许、淡出
	var k := U.accel(_w(t, 260, 520)); var fade := 1 - _w(t, 600, 1000); var push := U.out3(_w(t, 520, 1000))
	if k > 0 and fade > 0:
		var sx: float = fx.s.sx * (1 + 0.06 * push)
		var sy: float = fx.s.sy * (0.55 + 0.45 * U.out3(minf(1, k * 1.3))) * (1 + 0.05 * push)
		fx.img("back", "am3_fan_jiangqing", O.x, O.y, {"a": fade, "ax": 0.98, "ay": 0.536, "rot": fx.s.fang - PI, "sx": sx, "sy": sy, "clip": [1 - k, 1]})
		fx.img("front", "am3_fan_jiangqing", O.x, O.y, {"a": 0.3 * fade, "ax": 0.98, "ay": 0.536, "rot": fx.s.fang - PI, "sx": sx, "sy": sy, "clip": [1 - k, 1]})
	# 前缘弧锋：随扇面前缘推进（滞后一拍），高度随扇面张开；命中后再前送 18px 淡出
	var ke := U.accel(_w(t, 300, 520)); var ea := minf(1, ke * 2.5) * (1 - _w(t, 560, 900))
	if ke > 0.08 and ea > 0:
		var fa: float = fx.s.fang; var Lf: float = fx.s.len * (ke * 0.97 + 0.03) + 18 * push
		var x: float = O.x + cos(fa) * Lf; var y: float = O.y + sin(fa) * Lf
		var s2: float = fx.s.sy * IH("am3_fan_jiangqing") * 0.55 / IH("am3_edge_arc") * (0.5 + 0.5 * ke)
		fx.img("front", "am3_edge_arc", x, y, {"a": ea, "ax": 0.12, "ay": 0.5, "rot": fa - PI, "sx": s2 * 0.9, "sy": s2})
		fx.img("front", "am3_edge_arc", x, y, {"a": 0.5 * ea, "ax": 0.12, "ay": 0.5, "rot": fa - PI, "sx": s2 * 0.9, "sy": s2})   # 叠一层提亮
		fx.gdot(x, y, 26, G[4], 0.35 * ea)
	# 命中者的金白作用点辉光
	if fx.s.has("hitT"):
		var e: float = t - fx.s.hitT; var T: Array = fx.targets(); var oo := out_of(fx)
		for i in T.size():
			if oo[i]: fx.gdot(T[i].x, T[i].y, 18, G[5], 0.8 * (1 - _w(e, 0, 220)))
	L.draw_hits(fx, "front")

# ───────── 乙 · 缠腕短打 v2 ─────────
# 0–150 手边墨紫内息微聚 → 150–300 缠腕鞭影自施者一侧甩入（横向显隐「梢先到」）→ 300 命中：缠环收紧＋铜色作用点；闪避：鞭影抬到头侧擦过
# → 360–900 来路自柄端收回、缠环淡出。粒子≤60。
func cs1_init(fx) -> void:
	var p: Dictionary = fx.targets()[0]; var hit: bool = res_pred(fx)[0]
	fx.s.W = {"x": p.x + 16, "y": p.y + 14} if hit else {"x": p.x + 4, "y": p.y - 30}
	fx.s.hitP = hit

func cs1_update(fx, t: float, dt: float) -> void:
	var Hd: Dictionary = fx.A.hand; var Wr: Dictionary = fx.s.W; var low: bool = fx.low
	if t < 140 and _rnd(fx) < dt / (40.0 if low else 20.0): L.converge(fx, Hd, "inkp", 1, {"r0": 8, "r1": 20, "F": 200, "swirl": -60, "life": 220})
	var out: Array = fx.outcome if fx.outcome != null else res_pred(fx)
	fx.once("h", t >= 300, func():
		fx.s.hitT = t; fx.s.hit = preload("res://scripts/npc/util.gd").t(out[0])
		if fx.s.hit:
			fx.pop("cs_copper_point", Wr.x, Wr.y, {"life": 360, "sc": [0.7, 1.4], "a": [1, 0]})
			for i in (5 if low else 10):
				var u := _rnd(fx) * TAU; var v := 40 + _rnd(fx) * 80
				fx.spawn({"x": Wr.x, "y": Wr.y, "vx": cos(u) * v, "vy": sin(u) * v - 20, "ay": 120, "drag": 2.2, "life": 260 + _rnd(fx) * 200, "ramp": "copper", "tone": 5, "size": 2 if _rnd(fx) < 0.25 else 1})
		else:
			for i in (2 if low else 4):
				fx.spawn({"x": Wr.x - 10, "y": Wr.y, "vx": -90 - _rnd(fx) * 60, "vy": (_rnd(fx) - 0.5) * 30, "drag": 3, "life": 220, "kind": "streak", "len": 0.04, "ramp": "inkp", "tone": 4}))

func cs1_draw(fx, t: float) -> void:
	var Wr: Dictionary = fx.s.W; var Hd: Dictionary = fx.A.hand
	var IK: Array = Store.ramp("inkp"); var CP: Array = Store.ramp("copper")
	var g := _w(t, 0, 120) * (1 - _w(t, 150, 260))
	if g > 0: fx.gdot(Hd.x, Hd.y, 10, IK[4], 0.7 * g)
	# 素材：来路在右上（朝施者），缠环在左下；clip 自右向左显出＝鞭梢从施者一侧甩入
	var k := U.accel(_w(t, 150, 300)); var bk := U.out3(_w(t, 380, 760)); var a := 1 - _w(t, 640, 880)
	if k > 0 and a > 0:
		var has_hit: bool = fx.s.has("hitT")
		var hit_now: bool = has_hit and bool(fx.outcome[0] if fx.outcome != null else fx.s.hit)
		var e: float = t - fx.s.hitT if has_hit else 0.0
		var tight := lerpf(1.18, 1, U.out3(_w(e, 0, 140))) if hit_now else 1.0
		fx.img("front", "cs1_wrist_lash", Wr.x, Wr.y, {"a": a, "ax": 0.39, "ay": 0.69, "sx": tight, "sy": tight, "clip": [1 - k, 1 - 0.62 * bk]})
		if t < 330: fx.gdot(lerpf(Wr.x + 60, Wr.x, k), lerpf(Wr.y - 50, Wr.y, k), 8, IK[5], 0.6)
		if hit_now: fx.gdot(Wr.x, Wr.y, 12, CP[4], 0.7 * (1 - _w(e, 0, 240)))
	L.draw_hits(fx, "front")

# ───────── 甲 · 回身掠影 v2 ─────────
# 0–240 施者身周墨紫丝缕微旋聚起 → 240–520 墨紫长鞭大弧在敌阵上方自近侧向远侧展开，下缘压过每个实际目标（全闪避时整体略高）；两道暗红残影滞后展开
# → 520 实际命中者出铜色碎点＋铜色作用点 → 520–920 大弧自梢回卷到约三成、施者胸前一次局部「破绽」缺环 → 920–1250 收尽。粒子≤90。
func cs2_init(fx) -> void:
	var T: Array = fx.targets(); var P := res_pred(fx); var Hd: Dictionary = fx.A.hand
	fx.s.me = {"x": Hd.x + 14, "y": Hd.y + 4}; fx.s.body = {"x": fx.A.foot.x, "y": Hd.y + 6}
	var minx := INF; var maxx := -INF; var maxy := -INF
	for p in T: minx = minf(minx, p.x); maxx = maxf(maxx, p.x); maxy = maxf(maxy, p.y)
	var c := centroid(T); var spread := maxf(80, maxx - minx)
	var all_miss := true
	for v in P:
		if v: all_miss = false
	# 大弧宽度≈目标横向分布的 2.05 倍，下缘落在目标胸口一线；中心偏向施者
	var Wa := maxf(300, spread * 2.05); var sc := Wa / IW("cs2_whip_arc")
	fx.s.arc = {"x": c.x + Wa * 0.16, "y": maxy - IH("cs2_whip_arc") * sc * ARC_SY * 0.36 - (26 if all_miss else 0), "s": sc}

func cs2_update(fx, t: float, dt: float) -> void:
	var Hd: Dictionary = fx.A.hand; var T: Array = fx.targets(); var low: bool = fx.low; var A: Dictionary = fx.s.arc
	if t < 220 and _rnd(fx) < dt / (36.0 if low else 18.0): L.converge(fx, Hd, "inkp", 1, {"r0": 8, "r1": 22, "F": 200, "swirl": -60, "life": 220})
	var k := U.accel(_w(t, 240, 520))
	if k > 0.05 and t < 520 and _rnd(fx) < dt / (40.0 if low else 20.0):
		var w: float = IW("cs2_whip_arc") * A.s
		var x: float = A.x + w / 2 - w * k; var y: float = A.y + (_rnd(fx) - 0.3) * IH("cs2_whip_arc") * A.s * 0.6
		fx.spawn({"x": x, "y": y, "vx": (_rnd(fx) - 0.5) * 20, "vy": (_rnd(fx) - 0.5) * 20, "life": 260, "ramp": "inkp" if _rnd(fx) < 0.6 else "darkred", "tone": 4})
	var out: Array = fx.outcome if fx.outcome != null else res_pred(fx)
	fx.once("h", t >= 520, func():
		fx.s.hitT = t; fx.s.out = out.duplicate()
		for i in T.size():
			if not out[i]: continue
			var p: Dictionary = T[i]
			fx.pop("cs_copper_sparks", p.x, p.y + 2, {"life": 460, "sc": [1, 1.6], "a": [1, 0], "flip": true})
			fx.pop("cs_copper_point", p.x, p.y + 2, {"life": 320, "sc": [0.9, 1.6], "a": [1, 0]})
			for q in (3 if low else 6):
				var u := _rnd(fx) * TAU; var v := 40 + _rnd(fx) * 90
				fx.spawn({"x": p.x, "y": p.y + 2, "vx": cos(u) * v, "vy": sin(u) * v - 20, "ay": 120, "drag": 2.2, "life": 260 + _rnd(fx) * 200, "ramp": "copper", "tone": 5, "size": 2 if _rnd(fx) < 0.25 else 1}))

func cs2_draw(fx, t: float) -> void:
	var A: Dictionary = fx.s.arc; var me: Dictionary = fx.s.me; var B: Dictionary = fx.s.body; var low: bool = fx.low
	fx.tint = [Color("#0c0610"), 0.2 * minf(_w(t, 0, 200), 1 - _w(t, 950, 1250))]
	# 蓄势丝缕：身周、在人物后层为主，前层淡一层；240 后散开淡出
	var wa := _w(t, 0, 180) * (1 - _w(t, 260, 480)); var wg := U.out3(_w(t, 0, 240))
	if wa > 0:
		var s := 0.8 + 0.14 * wg + 0.12 * _w(t, 240, 480)
		fx.img("back", "cs2_wisps", B.x, B.y, {"a": wa, "sx": -s, "sy": s})
		fx.img("front", "cs2_wisps", B.x, B.y, {"a": 0.35 * wa, "sx": -s, "sy": s})
	# 大弧：素材左＝柄（翻转后在特效空间右侧），clip [0,head] 自柄向梢显出；520–920 回卷到三成；920–1250 收尽
	var k := U.accel(_w(t, 240, 520))
	var head := k if t < 520 else (1 - 0.7 * U.out3(_w(t, 520, 920)) if t < 920 else 0.3 * (1 - U.out3(_w(t, 920, 1230))))
	var a := 1 - 0.3 * _w(t, 600, 920) if t < 920 else 0.7 * (1 - _w(t, 980, 1240))
	# 暗红残影：滞后、错位，在人物后层
	var ghosts := [[0.14, 10, 0.7]] if low else [[0.1, 8, 0.75], [0.22, 22, 0.5]]
	for gh in ghosts:
		var lag: float = gh[0]; var dy: float = gh[1]; var ga: float = gh[2]
		var h := maxf(0, k - lag) if t < 520 else maxf(0, head - lag * 0.6)
		var gA := ga * (1 - _w(t, 520, 880))
		if h > 0 and gA > 0:
			var s2: float = A.s * 1.05
			fx.img("back", "cs2_ghost_red", A.x - 4, A.y + IH("cs2_whip_arc") * A.s * 0.18 + dy, {"a": gA, "sx": -s2, "sy": s2 * 0.9, "clip": [0, h]})
	if head > 0 and a > 0: fx.img("front", "cs2_whip_arc", A.x, A.y, {"a": a, "sx": -A.s, "sy": A.s * ARC_SY, "clip": [0, head]})
	var CP: Array = Store.ramp("copper"); var DR: Array = Store.ramp("darkred")
	if fx.s.has("hitT"):
		var e: float = t - fx.s.hitT; var T: Array = fx.targets(); var oo := out_of(fx)
		for i in T.size():
			if oo[i]: fx.gdot(T[i].x, T[i].y + 2, 14, CP[4], 0.7 * (1 - _w(e, 0, 220)))
	# 破绽：施者胸前一次局部缺环（暗红带缺口），不追加伤害
	var ex := _w(t, 600, 700) * (1 - _w(t, 860, 1000))
	if ex > 0:
		var s3 := lerpf(1.3, 1, U.out3(_w(t, 600, 720)))
		for cr in [[DR[1], 13], [DR[4], 12]]:
			fx.arc_stroke("front", Vector2(me.x, me.y), cr[1] * s3, -PI * 0.15, PI * 1.35, 2.0, Color(cr[0], ex))
		fx.gdot(me.x - 10, me.y - 6, 8, DR[4], 0.6 * ex)
	L.draw_hits(fx, "front")
