extends RefCounted
## 战斗像素特效。对应原版 js/vfx.js 的 VFX（低分辨率 640×360 像素层，Q=1.5；等级预算 VFX_TIER；命中/招式特效；覆盖层）
## 与 bfx.js 的 overlay（蓄势光柱、头目蓄力、破势星、回盾）。
## 画法：每帧把像素点收进 buf_px（实心层）与 buf_gl（纯光源层），由 view.gd 在世界坐标按 Q 放大绘制；光源层用加色混合。
## 差异：原版另有 1/8 分辨率模糊辉光层，这里以光源层加色近似（见 battle-notes.md）。

const LW := 640.0
const LH := 360.0
const Q := 1.5
const Z := 2.0
const STEP := 1000.0 / 60.0
## 评审截图开关：-- --fx-off 时特效照常计时，但不画（特效路线比对拿干净底图用，2026-11-05）
static var FX_OFF: bool = "--fx-off" in OS.get_cmdline_user_args()
const BY := [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

var bt
var list := []
var parts := []
var clock := 0.0
var last := 0.0
var acc := 0.0
var dim_a := 0.0
var flash := {"a": 0.0, "c": Color.WHITE}
var buf_px := []   # [Vector2(低分辨率), Color]
var buf_gl := []   # [Rect2(低分辨率), Color]
var buf_sp := []   # 烘焙特效贴图：[Texture2D, Rect2(低分辨率目标), Rect2(源区域), alpha]（2026-11-08 起，通用命中走关键帧条成品）
var PAL := {}
var _cc := {}

func _init(b) -> void:
	bt = b
	var d: Dictionary = Stats.defs()
	for k in d.PAL: PAL[k] = d.PAL[k]
	PAL["啄"] = PAL["刀"]

func col(c) -> Color:
	if c is Color: return c
	if not _cc.has(c): _cc[c] = Color(c)
	return _cc[c]

static func pc(p: Array, k: float): return p[clampi(floori(k * p.size()), 0, p.size() - 1)]
static func L(v: float) -> float: return v / Q
static func R(a: float, b: float) -> float: return a + randf() * (b - a)
func uh(u) -> float: return bt.rules.unit_h(u)
func ctr(u) -> Vector2: return Vector2(L(u.x + u.get("ox", 0.0)), L(u.y + u.get("oy", 0.0) - uh(u) * 0.5))
func foot(u) -> Vector2: return Vector2(L(u.x + u.get("ox", 0.0)), L(u.y + u.get("oy", 0.0)))

# ── 像素图元（低分辨率坐标；淡出用 Bayer 抖动）──
func P(x: float, y: float, c, a := 1.0) -> void:
	if a <= 0: return
	var xi := roundi(x); var yi := roundi(y)
	if a < 1 and (BY[(yi & 3) * 4 + (xi & 3)] + 0.5) / 16.0 > a: return
	buf_px.append([Vector2(xi, yi), col(c)])

func Ln(x0: float, y0: float, x1: float, y1: float, c, a := 1.0, w := 1) -> void:
	var n := maxi(1, ceili(maxf(absf(x1 - x0), absf(y1 - y0))))
	var nx := -(y1 - y0); var ny := x1 - x0; var nl := sqrt(nx * nx + ny * ny)
	if nl == 0: nl = 1
	for i in n + 1:
		var t := float(i) / n; var x := x0 + (x1 - x0) * t; var y := y0 + (y1 - y0) * t
		for j in w:
			var o := j - (w - 1) / 2.0
			P(x + nx / nl * o, y + ny / nl * o, c, a)

func ring(cx: float, cy: float, rx: float, ry: float, c, a := 1.0, gap := 0.0, rot := 0.0, w := 1) -> void:
	for j in w:
		var r2 := rx - j; var ry2 := ry - j * ry / maxf(rx, 1)
		if r2 <= 0: break
		var n := maxi(8, ceili(r2 * 7)); var seen := {}
		for i in n:
			var an := float(i) / n * TAU
			if gap and (floori((an + rot) / gap) & 1): continue
			var x := roundi(cx + cos(an) * r2); var y := roundi(cy + sin(an) * ry2); var k := x * 999 + y
			if seen.has(k): continue
			seen[k] = true; P(x, y, c, a)

func crescent(cx: float, cy: float, Rr: float, dir: float, span: float, th: float, pal: Array, a := 1.0, sweep := 1.0) -> void:
	var R2 := ceili(Rr + 1)
	for y in range(-R2, R2 + 1):
		for x in range(-R2, R2 + 1):
			var r := sqrt(x * x + y * y)
			if r > Rr + 0.6 or r < Rr - th - 0.5: continue
			var an := atan2(y, x) - dir; an = atan2(sin(an), cos(an))
			var f := an / span
			if absf(f) > 0.5 or f > sweep - 0.5: continue
			var w := th * (1 - absf(f) * 2) + 0.5
			if r < Rr - w: continue
			P(cx + x, cy + y, pal[0] if r > Rr - 1.2 else (pal[1] if r > Rr - w * 0.55 else pal[2]), a)

func bolt(x0: float, y0: float, x1: float, y1: float, seed: int, c, a := 1.0, w := 2) -> void:
	var s := seed
	var px := x0; var py := y0; var n := 9
	for i in range(1, n + 1):
		s = (s * 9301 + 49297) % 233280
		var t := float(i) / n
		var nx := x0 + (x1 - x0) * t + ((float(s) / 233280 - 0.5) * 14 if i < n else 0.0); var ny := y0 + (y1 - y0) * t
		Ln(px, py, nx, ny, c, a, w); px = nx; py = ny

## 纯光源层块（bfx.js overlay 用）
func PG(x: float, y: float, w: float, h: float, c, a: float) -> void:
	if a <= 0: return
	buf_gl.append([Rect2(roundf(x), roundf(y), maxf(1, roundf(w)), maxf(1, roundf(h))), Color(col(c), minf(1, a))])

# ── 实例与预算（vfx.js budget/inst/shake/doFlash/doDim/hitStop/emit）──
func mp_of(k) -> int: return int(Stats.skill(k).get("mp", 0)) if k != null and Stats.has_skill(k) else 0
static func tier_cap(mp: int, boss) -> int:
	return mini(3, (0 if not mp else (1 if mp <= 7 else (2 if mp <= 12 else 3))) + (1 if boss else 0))

func budget(key, mp: int, bp: int) -> Dictionary:
	var D: Dictionary = Stats.defs()
	var fx: Dictionary = D.FXDEF
	var d: Dictionary = fx.get(key, fx._atk) if key != null else fx._atk
	var grade = Stats.skill(key).get("grade") if key != null and Stats.has_skill(key) else null
	var cap: int = {"丁": 1, "丙": 2, "乙": 3, "甲": 3, "绝": 3}.get(grade, 3)
	var ti: int
	if key == "_break": ti = 3
	else: ti = mini(int(d.tier), mini(cap + (1 if d.get("boss") else 0), tier_cap(mp, d.get("boss"))))
	var T: Dictionary = D.VFX_TIER[ti]
	var mps = [[0, 0], [1, 7], [8, 12], [13, 30]][ti]
	var frac := clampf((mp - mps[0]) / float(mps[1] - mps[0]), 0, 1) if mps[1] > mps[0] else 1.0
	var s := minf(1, (0.62 + 0.3 * frac) * (1 + 0.08 * bp))
	return {"T": T, "d": d, "s": s, "parts": roundi(T.parts * s)}

func inst(key, mp: int, bp: int, dur := 0.0, fn = null) -> Dictionary:
	var b := budget(key, mp, bp)
	var it := {"key": key, "T": b.T, "s": b.s, "left": b.parts, "t0": clock, "dur": minf(dur if dur else float(b.T.ms), float(b.T.ms)), "fn": fn}
	list.append(it)
	return it

func shake(it: Dictionary, v: float) -> void:
	if bt.B != null: bt.B.shake = maxf(bt.B.shake, minf(v, it.T.shake) * it.s)
func do_flash(it: Dictionary, a: float, c := "#fff") -> void:
	a = minf(a, it.T.flash)
	if a > flash.a: flash.a = a; flash.c = col(c)
func do_dim(it: Dictionary, a: float) -> void: dim_a = maxf(dim_a, minf(a, it.T.dim))
func hit_stop(it: Dictionary, ms: float) -> void: bt.bt_stop(minf(ms, it.T.stop))

func emit(it: Dictionary, n: int, f: Callable) -> void:
	n = mini(n, it.left); it.left -= n
	for i in n:
		var p := {"age": 0, "g": 0.0, "drag": 0.9, "life": 12}
		p.merge(f.call(i, n), true)
		parts.append(p)

func sparks(it: Dictionary, x: float, y: float, n: int, pal: Array, sp := [1.5, 4.5], up := 0.0, dir := 0.0, spread := TAU) -> void:
	emit(it, n, func(_i, _n):
		var a := dir + (randf() - 0.5) * spread; var s := R(sp[0], sp[1]) * 1.4
		return {"k": "spark", "x": x, "y": y, "vx": cos(a) * s, "vy": sin(a) * s - up, "g": 0.16, "life": int(R(10, 20)), "pal": pal})

func motes(it: Dictionary, x: float, y: float, n: int, pal: Array, rad := 8.0) -> void:
	emit(it, n, func(_i, _n): return {"k": "mote", "x": x + R(-rad, rad) * Z, "y": y + R(-3, 3), "vx": R(-0.1, 0.1), "vy": -R(0.4, 1), "drag": 1.0, "life": int(R(20, 34)), "pal": pal})

# ── 烘焙的通用命中（R-特效-01 优化路线：关键帧条 → 锁色 → 12fps 持帧 → 精灵表＋JSON，Godot 直接播）──
## data/battle/fx_hits.json：每种命中一条 {sheet, fw, fh, n, anchor:[[x,y]…], keys:[[t0,t1,帧,a0,a1]…], dur, dir, stop, shake}
static var _hits := {}
static var _hit_tex := {}
static func hit_def(ty: String):
	if _hits.is_empty():
		var f := FileAccess.open("res://data/battle/fx_hits.json", FileAccess.READ)
		_hits = JSON.parse_string(f.get_as_text()) if f else {}
		if not (_hits is Dictionary): _hits = {"_": {}}
	return _hits.get(ty)

## 精灵表（原向、镜像各一份；镜像后帧序倒过来）
static func _hit_sheet(d: Dictionary, flip: bool) -> Texture2D:
	var key := str(d.sheet) + ("|f" if flip else "")
	if not _hit_tex.has(key):
		var im := Image.load_from_file(ProjectSettings.globalize_path("res://" + str(d.sheet))) if not ResourceLoader.exists("res://" + str(d.sheet)) else (load("res://" + str(d.sheet)) as Texture2D).get_image()
		if flip: im.flip_x()
		_hit_tex[key] = ImageTexture.create_from_image(im)
	return _hit_tex[key]

## 烘焙的招式命中（11-10 第二批：伏虎拳、横杆护身；docs/review/vfx-skill-final-v1/bake_skills.py 生成 data/battle/fx_skills.json，格式同 fx_hits）
static var _skills := {}
static func skill_def(key):
	if _skills.is_empty():
		var f := FileAccess.open("res://data/battle/fx_skills.json", FileAccess.READ)
		_skills = JSON.parse_string(f.get_as_text()) if f else {}
		if not (_skills is Dictionary): _skills = {"_": {}}
	return _skills.get(str(key))

func baked_hit(it: Dictionary, t: Dictionary, ty: String, side: float) -> bool:
	var d = hit_def(ty)
	if not (d is Dictionary) or d.is_empty(): return false
	return baked_play(it, t, d, side)

func baked_play(it: Dictionary, t: Dictionary, d: Dictionary, side: float) -> bool:
	var p := ctr(t)
	p.y += L(uh(t)) * float(d.get("oy", 0))   # 接触点往下挪（啄在膝、毒在腰胯）
	var flip := side * float(d.get("dir", 1)) < 0
	var tex := _hit_sheet(d, flip)
	var fw := float(d.fw); var fh := float(d.fh); var n := int(d.n)
	var dur := float(d.dur)
	it.dur = dur * 1000.0
	it.fn = func(k):
		var ts: float = float(k) * dur
		for key in d.keys:
			if ts < float(key[0]) or ts >= float(key[1]): continue
			var f := int(key[2])
			var q: float = (ts - float(key[0])) / maxf(0.001, float(key[1]) - float(key[0]))
			var a := lerpf(float(key[3]), float(key[4]), q)
			var an: Array = d.anchor[f]
			var ax := fw - float(an[0]) if flip else float(an[0])
			var col := (n - 1 - f) if flip else f
			buf_sp.append([tex, Rect2(roundf(p.x - ax), roundf(p.y - float(an[1])), fw, fh), Rect2(col * fw, 0, fw, fh), a])
			break
	shake(it, float(d.get("shake", 0))); hit_stop(it, float(d.get("stop", 0)))
	return true

# ── 普攻 / 通用命中（vfx.js hitFx：按兵刃/内劲类型）──
func hit_fx(it: Dictionary, t: Dictionary, ty: String, side: float) -> void:
	if baked_hit(it, t, ty, side): return
	var p := ctr(t); var pal: Array = PAL.get(ty, PAL["拳"]); var dir := side
	if ty == "刀" or ty == "啄":
		it.fn = func(k): crescent(p.x + dir * 5 * Z, p.y, 11 * Z, PI * 0.15 if dir > 0 else PI * 0.85, PI * 1.1, 3.5 * Z, pal, 1 - k * 0.9, minf(1, k * 3))
		sparks(it, p.x, p.y, 10, pal)
	elif ty == "剑":
		var an := -0.4 * dir
		it.fn = func(k):
			var g := minf(1, k * 4); var w := maxf(0, 1 - k * 1.3); var L2 := 17 * Z; var dx := cos(an) * L2; var dy := sin(an) * L2
			for pr in [[2, 5], [1, 3], [0, 1]]: Ln(p.x - dx, p.y - dy, p.x - dx + 2 * dx * g, p.y - dy + 2 * dy * g, pal[pr[0]], w, pr[1])
			if k < 0.4:
				var r = 4 * Z * (1 - k / 0.4); Ln(p.x - r, p.y, p.x + r, p.y, pal[0], 1, 2); Ln(p.x, p.y - r, p.x, p.y + r, pal[0], 1, 2)
		sparks(it, p.x, p.y, 8, pal)
	elif ty == "棍":
		it.fn = func(k):
			ring(p.x, p.y + 6, (4 + k * 13) * Z, (2 + k * 4) * Z, pal[1], 1 - k, 0, 0, 2); ring(p.x, p.y + 6, (2 + k * 8) * Z, (1 + k * 2.5) * Z, pal[0], (1 - k) * 0.8, 0, 0, 2)
		var f := foot(t)
		emit(it, 8, func(_i, _n): return {"k": "dust", "x": f.x + R(-8, 8), "y": f.y, "vx": R(-1.4, 1.4), "vy": -R(0.2, 0.6), "life": int(R(12, 22)), "pal": ["#e8dcc8", "#b8a898", "#887868"]})
		sparks(it, p.x, p.y, 6, pal)
	elif ty == "音律":
		it.fn = func(k):
			for i in 3:
				var q := maxf(0, 1 - k - i * 0.15); ring(p.x, p.y, (4 + k * 14 + i * 3) * Z, (2 + k * 6 + i) * Z, pal[i % 2 + 1], q, 0.55, 0, 1)
		sparks(it, p.x, p.y, 6, pal, [0.5, 1.5])
	elif ty == "暗器":
		it.fn = func(k):
			for i in [-1, 0, 1]:
				var q := maxf(0, 1 - k * 2); var x = p.x + i * 4; var y = p.y + i * 6
				if q > 0: Ln(x - 5, y - 5, x + 5, y + 5, pal[2], q, 3); Ln(x - 5, y - 5, x + 5, y + 5, pal[0], q, 1); Ln(x - 3, y + 3, x + 3, y - 3, pal[1], q, 1)
		sparks(it, p.x, p.y, 6, pal, [1, 3])
	elif ty == "咬":
		it.fn = func(k):
			var g := minf(1, k * 3); var o := 6 * Z * (1 - g)
			for i in range(-2, 3):
				var x := p.x + i * 3 * Z; Ln(x, p.y - 7 * Z - o, x, p.y - 3 * Z - o, pal[0], 1 - k, 2); Ln(x, p.y + 7 * Z + o, x, p.y + 3 * Z + o, pal[0], 1 - k, 2)
		sparks(it, p.x, p.y, 8, PAL["血"])
	elif ty == "毒":
		it.fn = func(k):
			ring(p.x, p.y, (3 + k * 9) * Z, (3 + k * 9) * Z, pal[2], 1 - k, 0.6, k * 4, 2); ring(p.x, p.y, (1 + k * 5) * Z, (1 + k * 5) * Z, pal[1], (1 - k) * 0.8, 0, 0, 2)
		motes(it, p.x, p.y, 8, pal, 5)
	else:
		it.fn = func(k):
			var r = (2 + k * 10) * Z; ring(p.x, p.y, r, r, pal[2], 1 - k, 0, 0, 3); ring(p.x, p.y, r - 1, r - 1, pal[0], 1 - k)
			if k < 0.5:
				for i in 8:
					var a := i / 8.0 * TAU + 0.3; var r0 = (3 + k * 9) * Z; var r1 = r0 + 5 * Z * (1 - k * 2)
					Ln(p.x + cos(a) * r0, p.y + sin(a) * r0, p.x + cos(a) * r1, p.y + sin(a) * r1, pal[1], 1 - k * 1.5, 2)
		sparks(it, p.x, p.y, 10, pal)
	shake(it, it.T.shake); hit_stop(it, it.T.stop)

# ── 招式特效（vfx.js SK：cast 返回前摇毫秒；hit 每次命中）──
const SK_CAST := ["qh_hulu_staff", "bianfa", "jinzhen", "liuye", "guafeng", "ghost", "jingxin", "huichun", "lick", "baicao", "dingshen"]
const SK_HIT := ["fuhu", "shuaibei", "bianfa", "jinzhen", "sniff", "liuye", "lianhua", "guafeng", "ghost"]

func sk_cast(key: String, it: Dictionary, u: Dictionary, tgs: Array) -> float:
	var a := ctr(u)
	match key:
		"qh_hulu_staff":
			var f := foot(u); var pal: Array = PAL["棍"]
			it.fn = func(k): ring(f.x, f.y - 3, (8 + k * 3) * Z, (3 + k) * Z, pal[1], (1 - k) * 0.6, 0.7, 0, 1); ring(f.x, f.y - 8, 6 * Z, 3 * Z, pal[2], (1 - k) * 0.5, 0.7, 0, 1)
			return 160
		"bianfa":
			var far: Dictionary = tgs[0]
			for t in tgs: if absf(t.x - u.x) > absf(far.x - u.x): far = t
			var b := ctr(far)
			it.fn = func(k):
				var g := minf(1, k * 2.2); var px := a.x; var py := a.y
				for i in range(1, 31):
					var t := i / 30.0 * g; var x := a.x + (b.x - a.x) * t; var y := a.y + (b.y - a.y) * t + sin(t * 14 - k * 20) * 6 * (1 - t * 0.5)
					Ln(px, py, x, y, "#ffffff" if i == 30 else PAL["棍"][1], 1 - maxf(0, k - 0.6) * 2.5, 2); px = x; py = y
			return 240
		"jinzhen":
			var b := ctr(tgs[0])
			it.fn = func(k):
				var g := minf(1, k * 3.2)
				if g < 1:
					for i in [-1, 0, 1]:
						var x := a.x + (b.x - a.x) * g; var y = a.y + (b.y - a.y) * g + i * 7
						Ln(x, y, x + (a.x - b.x) * 0.14, y, PAL["暗器"][2], 0.8, 1); Ln(x, y, x + (a.x - b.x) * 0.07, y, "#ffffff", 1, 1)
						P(x, y - 2, "#ffffff"); P(x, y + 2, "#ffffff"); P(x - 2, y, "#fff4c0")
			return 200
		"liuye":
			do_dim(it, 0.25)
			var min_x := 1e9
			for t in tgs: min_x = minf(min_x, ctr(t).x)
			min_x -= 16
			var lv := []
			for i in 11: lv.append({"y": a.y - 14 * Z + i * 2.6 * Z + R(-2, 2), "d": R(0, 0.25), "ph": R(0, 6)})
			it.fn = func(k):
				for l in lv:
					var g := clampf((k - l.d) * 2.2, 0, 1)
					if g <= 0 or g >= 1: continue
					var x := a.x + (min_x - a.x) * g; var y: float = l.y + sin(g * 9 + l.ph) * 5
					Ln(x, y, x + 8, y - 3, "#62b884", 1, 3); Ln(x, y, x + 8, y - 3, "#c8f8d0", 1, 1); P(x, y, "#ffffff"); Ln(x + 9, y - 3, x + 16, y - 5, "#9ae0a0", 0.5, 1)
			return 330
		"guafeng":
			do_dim(it, 0.3)
			it.fn = func(k):
				for i in 3:
					var g := minf(1, maxf(0, k * 2 - i * 0.2))
					if g <= 0 or g >= 1: continue
					crescent(a.x - g * 130, a.y - 6 * Z + i * 6 * Z, 11 * Z, PI, PI * 1.2, 2.5 * Z, PAL["雷"], 1 - g * 0.8)
			return 300
		"ghost":
			do_dim(it, 0.5)
			it.fn = func(k):
				var r = (6 + k * 14) * Z; ring(a.x, a.y, r, r, PAL["血"][2], 1 - k, 0, 0, 3); ring(a.x, a.y, r * 0.5, r * 0.5, PAL["血"][1], 0.8, 0, 0, 2)
			emit(it, 24, func(_i, _n): return {"k": "mote", "x": a.x + R(-16, 16) * Z, "y": a.y + R(-12, 12) * Z, "vx": 0.0, "vy": -R(0.4, 1), "drag": 1.0, "life": int(R(12, 22)), "pal": PAL["血"]})
			return 380
		"jingxin":
			var f := foot(u); var pal: Array = PAL["剑"]
			it.fn = func(k):
				var q = 1.0 if k < 0.8 else (1 - k) * 5
				ring(f.x, f.y, 11 * Z, 3 * Z, pal[2], q, 0, 0, 2); ring(f.x, f.y, 8 * Z, 2.2 * Z, pal[1], q, 0.5, k * 8, 2)
				var y := f.y
				while y > a.y - 14 * Z:
					if randf() < 0.3: P(f.x + R(-5, 5) * Z, y, pal[1], 0.5 * q)
					y -= 1
			motes(it, f.x, f.y - 2, 24, pal, 9)
			return 300
		"huichun", "lick":
			for t in tgs:
				var f := foot(t)
				emit(it, 16, func(i, _n): return {"k": "leaf", "x": f.x + cos(i) * 9 * Z, "y": f.y - 2, "vx": -sin(i) * 0.8, "vy": -R(0.6, 1.3), "drag": 1.0, "life": int(R(22, 32)), "pal": PAL["医"]})
			it.fn = func(k):
				for t in tgs:
					var p := ctr(t)
					if k < 0.75:
						for i in 2:
							var x := p.x + sin(k * 9 + i * 3) * 9 * Z; var y = p.y + 12 * Z - k * 30 * Z + i * 7 * Z
							Ln(x - 3, y, x + 3, y, "#d8ffe0", 1, 2); Ln(x, y - 3, x, y + 3, "#d8ffe0", 1, 2)
			return 260
		"baicao":
			do_dim(it, 0.18)
			for t in tgs:
				var p := ctr(t)
				emit(it, 14, func(_i, _n): return {"k": "drop", "x": p.x + R(-12, 12) * Z, "y": p.y - R(25, 50) * Z, "vx": 0.0, "vy": R(2, 3), "g": 0.1, "drag": 1.0, "life": int(R(16, 24)), "pal": PAL["医"]})
			it.fn = func(k):
				for t in tgs:
					var f := foot(t); ring(f.x, f.y, (4 + k * 11) * Z, (1.5 + k * 3) * Z, PAL["医"][2], 1 - k, 0, 0, 2)
			return 380
		"dingshen":
			var t: Dictionary = tgs[0]; var f := foot(t); var top := ctr(t).y - 16 * Z
			it.fn = func(k):
				var y := f.y + (top - f.y) * minf(1, k * 1.4)
				ring(f.x, y, 10 * Z, 2.8 * Z, "#ffe7a0", 1 - maxf(0, k - 0.7) * 3, 0, 0, 2); ring(f.x, y, 7 * Z, 1.8 * Z, "#ffffff", (1 - k) * 0.8, 0, 0, 1)
			motes(it, f.x, f.y - 4, 14, ["#ffffff", "#fff0b0", "#ffd060", "#a07020"], 8)
			return 300
	return 0.0

func sk_hit(key: String, it: Dictionary, u: Dictionary, t: Dictionary) -> void:
	var p := ctr(t)
	var d := signf(t.x - u.x)
	match key:
		"fuhu":
			var pal: Array = PAL["阳"]
			if d == 0: d = -1
			it.fn = func(k):
				var r = (3 + k * 14) * Z
				ring(p.x, p.y, r, r * 0.9, pal[2], 1 - k, 0, 0, 3); ring(p.x, p.y, r * 0.6, r * 0.55, pal[0], (1 - k) * 0.8, 0, 0, 2)
				if k < 0.65:
					for i in [-1, 0, 1]:
						var g := minf(1, k * 4)
						Ln(p.x - 7 * Z * d + i * 5 * Z, p.y - 9 * Z, p.x - 7 * Z * d + i * 5 * Z + 12 * Z * d * g, p.y - 9 * Z + 16 * Z * g, "#ffffff" if i == 0 else pal[1], 1 - k * 1.3, 3)
			sparks(it, p.x, p.y, 16, pal); shake(it, 5); hit_stop(it, 50); do_flash(it, 0.08, "#ffd8a0")
		"shuaibei":
			var f := foot(t); var pal: Array = PAL["阴"]
			var cr := []
			for i in 6: cr.append(R(0, TAU))
			it.fn = func(k):
				ring(f.x, f.y, (3 + k * 16) * Z, (1 + k * 4) * Z, pal[2], 1 - k, 0, 0, 2)
				var g := minf(1, k * 3)
				for a in cr: Ln(f.x, f.y, f.x + cos(a) * 13 * Z * g, f.y + sin(a) * 3.5 * Z * g, pal[1], 1 - k, 2)
				if k < 0.3: ring(p.x, p.y - 8 * Z + k * 20 * Z, 7 * Z, 2.5 * Z, pal[0], 1 - k / 0.3, 0, 0, 2)
				if k > 0.35:
					for i in 3:
						var a := clock / 120 + i * 2.1; var sx := p.x + cos(a) * 7 * Z; var sy := p.y - 13 * Z + sin(a) * 2 * Z
						Ln(sx - 2, sy, sx + 2, sy, "#fff6a0", 1 - k, 1); Ln(sx, sy - 2, sx, sy + 2, "#fff6a0", 1 - k, 1)
			sparks(it, f.x, f.y, 12, pal, [1.5, 4], 1.6, -PI / 2, 2.4); shake(it, 5); hit_stop(it, 50)
		"bianfa": hit_fx(it, t, "棍", d)
		"sniff": hit_fx(it, t, "咬", d)
		"jinzhen":
			it.fn = func(k):
				var r = 7 * Z * (1 - k)
				Ln(p.x - r, p.y, p.x + r, p.y, "#fff4c0", 1 - k, 2); Ln(p.x, p.y - r, p.x, p.y + r, "#fff4c0", 1 - k, 2)
				ring(p.x, p.y, (2 + k * 7) * Z, (2 + k * 7) * Z, PAL["暗器"][2], 1 - k, 0, 0, 2)
			sparks(it, p.x, p.y, 10, PAL["暗器"], [1, 3]); shake(it, 5); hit_stop(it, 45)
		"liuye":
			it.fn = func(k):
				var g := minf(1, k * 4); var w = 1 - k; var x0 := p.x + 16 * Z; var y0 := p.y - 11 * Z; var dx := -32 * Z * g; var dy := 22 * Z * g
				Ln(x0, y0, x0 + dx, y0 + dy, "#62b884", w, 6); Ln(x0, y0, x0 + dx, y0 + dy, "#7ad0ff", w, 4); Ln(x0, y0, x0 + dx, y0 + dy, "#ffffff", w, 2)
			emit(it, 8, func(_i, _n): return {"k": "leaf", "x": p.x, "y": p.y, "vx": R(-2.4, 2.4), "vy": R(-2.6, 0.4), "g": 0.06, "life": int(R(16, 26)), "pal": ["#e0ffe0", "#9ae0a0", "#62b884"]})
			sparks(it, p.x, p.y, 8, PAL["剑"]); shake(it, 8); hit_stop(it, 60)
		"lianhua":
			var pal: Array = PAL["毒"]; do_dim(it, 0.18)
			it.fn = func(k):
				var g := minf(1, k * 2.5); var q := 1 - maxf(0, k - 0.5) * 2
				for i in 8:
					var a = i / 8.0 * TAU + k * 0.8; var r := (3 + g * 10) * Z; var ca := cos(a); var sa := sin(a)
					for j in 7:
						var rr := r - j * 1.6; var wv := 1 if j < 2 or j > 5 else 2
						for o in range(-wv, wv + 1):
							P(p.x + ca * rr - sa * o, p.y + (sa * rr + ca * o) * 0.8, "#ffe8f6" if j == 0 else ("#ff9ad0" if j < 3 else ("#e060a8" if j < 5 else pal[2])), q)
				ring(p.x, p.y, 3 * Z, 3 * Z, "#ffe25a", q, 0, 0, 2); P(p.x, p.y, "#fff", q)
			emit(it, 18, func(_i, _n): return {"k": "bubble", "x": p.x + R(-10, 10) * Z, "y": p.y + R(-2, 8), "vx": R(-0.2, 0.2), "vy": -R(0.4, 1), "drag": 1.0, "life": int(R(20, 32)), "pal": pal})
			shake(it, 8); hit_stop(it, 60)
		"guafeng":
			var seed := randi() % 100000
			it.fn = func(k):
				if k < 0.55 and (int(clock / 50) & 1) == 0:
					bolt(p.x + R(-3, 3), -2, p.x, p.y, seed, PAL["雷"][2], 1, 4); bolt(p.x, -2, p.x, p.y, seed, "#ffffff", 1, 2)
				ring(p.x, p.y, (2 + k * 11) * Z, (2 + k * 10) * Z, PAL["雷"][2], 1 - k, 0, 0, 2)
			sparks(it, p.x, p.y, 14, PAL["雷"], [2, 5]); do_flash(it, 0.2, "#fff8c0"); shake(it, 8); hit_stop(it, 70)
		"ghost":
			it.fn = func(k): crescent(p.x + 12 * Z, p.y, 24 * Z, 0, PI * 1.3, 6 * Z, PAL["血"], 1 - k * 0.9, minf(1, k * 3))
			sparks(it, p.x, p.y, 28, PAL["血"], [2.5, 6]); do_flash(it, 0.35, "#ffd0c0"); shake(it, 12); hit_stop(it, 110)

## 辅助招式施法者脚下法阵（vfx.js sigil）
const SIGIL_PAL := {"dingshen": "金", "huichun": "医", "lick": "医", "baicao": "医"}
func sigil(key, u: Dictionary, bp: int) -> void:
	var d = Stats.defs().FXDEF.get(key) if key != null else null
	if d == null or d.get("cls", "sup" if key in ["dingshen", "huichun", "lick", "jingxin", "baicao"] else "dmg") != "sup" or int(d.tier) < 1 or key == "jingxin": return
	var it := inst(key, mp_of(key), bp)
	var pal: Array = PAL[SIGIL_PAL.get(key, "医")]; var f := foot(u); var rx: float = (8 + d.tier * 2.5) * Z * it.s
	it.fn = func(k):
		var g := minf(1, k * 4); var q = 1.0 if k < 0.75 else (1 - k) * 4; var rx2 := rx * g
		ring(f.x, f.y, rx2, rx2 * 0.3, pal[2], q, 0, 0, 2); ring(f.x, f.y, rx2 * 0.72, rx2 * 0.22, pal[1], q * 0.9, 0.45, -k * 7, 1)
		for i in 6:
			var a = i / 6.0 * TAU + k * 3
			P(f.x + cos(a) * rx2 * 0.86, f.y + sin(a) * rx2 * 0.26, pal[0], q); P(f.x + cos(a) * rx2 * 0.86, f.y + sin(a) * rx2 * 0.26 - 1, pal[1], q * 0.7)

# ── 对外接口（rules.gd / motion.gd 调用）──
func hit(u: Dictionary, t: Dictionary, ty, key, bp: int) -> void:
	if "--fx-log" in OS.get_cmdline_user_args(): print("[fx-log] hit %d %s %s" % [Time.get_ticks_msec(), str(ty), str(key)])
	var sd = skill_def(key) if key != null else null
	if sd is Dictionary and not sd.is_empty():
		baked_play(inst(key, mp_of(key), bp), t, sd, signf(t.x - u.x) if t.x != u.x else 1.0)
	elif key != null and key in SK_HIT:
		sk_hit(key, inst(key, mp_of(key), bp), u, t)
	else:
		var fx: Dictionary = Stats.defs().FXDEF
		var k0 = key if key != null and fx.has(key) else "_atk"
		var hk: String = fx[k0].get("hit", ty if ty else "拳")
		var it := inst(k0, mp_of(k0), bp)
		hit_fx(it, t, hk, signf(t.x - u.x) if t.x != u.x else 1.0)
		# 暗器成品自带“一针一线”的飞行轨迹，有成品时不再叠旧的三道程序轨迹
		if hk == "暗器" and not is_same(u, t) and not (hit_def("暗器") is Dictionary): needle_streak(u, t, bp)

func touch(u: Dictionary, t: Dictionary, point, firm := false) -> void:
	var it := inst("_atk", 0, 0, 210.0 if firm else 170.0)
	var p: Vector2 = Vector2(L(point.x), L(point.y)) if point != null else ctr(t)
	var pal: Array = PAL["棍"]
	it.fn = func(k): ring(p.x, p.y, (1 + k * (9 if firm else 6)) * Z, (1 + k * (5 if firm else 3)) * Z, pal[1], (1 - k) * 0.85, 0, 0, 1)
	sparks(it, p.x, p.y, 8 if firm else 4, pal, [1.5, 3.5] if firm else [0.8, 2])
	shake(it, 3 if firm else 1.5); hit_stop(it, 30 if firm else 18)

func needle_streak(u: Dictionary, t: Dictionary, bp: int) -> void:
	var it := inst("_atk", 0, bp, 180)
	var a := ctr(u); var b := ctr(t); a.y -= 4
	it.fn = func(k):
		for i in [-1, 0, 1]:
			var g := minf(1, k * 2.2 + 0.15); var x := a.x + (b.x - a.x) * g; var y = a.y + (b.y - a.y) * g + i * 7; var tl = 0.16 * (1 - k)
			var tx = x + (a.x - b.x) * tl; var ty = y + (a.y - b.y) * tl
			Ln(tx, ty, x, y, PAL["暗器"][2], (1 - k * 0.6) * 0.7, 1); Ln(tx + (x - tx) * 0.5, ty + (y - ty) * 0.5, x, y, "#ffffff", 1 - k * 0.4, 1)
			if k < 0.7:
				P(x, y - 1, "#ffffff"); P(x, y + 1, "#ffffff"); P(x + 1, y, "#fff4c0")

func needle_flight(hand, t: Dictionary, ms: float, bp: int) -> void:
	if hand == null: return
	var it := inst("_atk", 0, bp, ms)
	var a := Vector2(L(hand.x), L(hand.y)); var b := ctr(t)
	it.fn = func(k):
		var x = a.x + (b.x - a.x) * k; var y = a.y + (b.y - a.y) * k; var dx := b.x - a.x; var dy := b.y - a.y; var n := sqrt(dx * dx + dy * dy)
		if n == 0: n = 1
		Ln(x - dx / n * 7, y - dy / n * 7, x, y, "#bfe6ef", 0.9, 1); P(x, y, "#ffffff", 1)

func needle_impact(t: Dictionary, key, bp: int) -> void:
	var fx: Dictionary = Stats.defs().FXDEF
	var it := inst(key if key != null and fx.has(key) else "_atk", mp_of(key), bp, 180)
	var p := ctr(t); var pal := ["#ffffff", "#d5edf0", "#a2c4ce", "#6e9cae", "#395964"]
	it.fn = func(k): ring(p.x, p.y, 1 + k * 5, 1 + k * 3, pal[1], 1 - k, 0, 0, 1)
	sparks(it, p.x, p.y, 7 if key else 4, pal, [0.7, 1.8]); shake(it, 2 if key else 1); hit_stop(it, 35 if key else 20)

func cast(u: Dictionary, key, tgs: Array, bp: int) -> void:
	sigil(key, u, bp)
	if key == null or not (key in SK_CAST): return
	var it := inst(key, mp_of(key), bp)
	var lead := sk_cast(key, it, u, tgs)
	if lead > 0: await bt.bw(lead)

func brk(t: Dictionary) -> void:
	var it := inst("_break", 0, 0)
	var p := ctr(t)
	it.fn = func(k):
		var r = (4 + k * 26) * Z
		ring(p.x, p.y, r, r * 0.8, PAL["冰"][3], 1 - k, 0, 0, 3); ring(p.x, p.y, r * 0.7, r * 0.56, "#ffffff", (1 - k) * 0.9, 0.35, k * 3, 2)
	emit(it, 40, func(_i, _n):
		var a := R(0, TAU); var s := R(1.5, 6)
		return {"k": "shard", "x": p.x, "y": p.y, "vx": cos(a) * s, "vy": sin(a) * s - 1, "g": 0.1, "life": int(R(16, 28)), "pal": PAL["冰"]})
	do_flash(it, 0.12, "#e0f4ff"); hit_stop(it, 100)

func reset() -> void:
	list = []; parts = []; dim_a = 0; flash.a = 0; last = 0; acc = 0

# ── 每帧计算（vfx.js draw 的前半：时钟、实例、覆盖层、粒子）；返回是否处于顿帧 ──
func step() -> bool:
	var now: float = bt.bt_now()
	var dt := clampf(now - last, 0, 50) if last else 16.0
	last = now; clock += dt
	acc += dt
	var steps := floori(acc / STEP); acc -= steps * STEP
	if steps > 3: steps = 3; acc = 0
	var stopped := dt == 0
	buf_px.clear(); buf_gl.clear(); buf_sp.clear()
	for it in list:
		var k: float = (clock - it.t0) / it.dur
		if k >= 0 and k < 1 and it.fn is Callable: it.fn.call(k)
	list = list.filter(func(it): return clock - it.t0 < it.dur)
	overlay(now)
	for p in parts:
		for s in steps:
			p.age += 1; p.vy += p.g; p.vx *= p.drag; p.vy *= 1.0 if p.drag == 1 else p.drag; p.x += p.vx; p.y += p.vy
			if p.k == "mote" or p.k == "bubble": p.x += sin(p.age * 0.3) * 0.15
		var k: float = float(p.age) / p.life
		var c = pc(p.pal, k)
		match p.k:
			"spark": Ln(p.x, p.y, p.x - p.vx * 1.4, p.y - p.vy * 1.4, c, 1 - k * 0.5, 2 if k < 0.4 else 1)
			"bubble":
				if k < 0.85:
					P(p.x, p.y - 1, c); P(p.x - 1, p.y, c); P(p.x + 1, p.y, c); P(p.x, p.y + 1, c); P(p.x, p.y, "#ffffff")
				else: ring(p.x, p.y, 3, 3, p.pal[1], 0.8)
			"leaf":
				var f := (int(p.age) >> 2) & 1
				Ln(p.x - 2, p.y + f, p.x + 2, p.y - f, c, 1, 2)
			"drop":
				P(p.x, p.y, "#ffffff"); P(p.x, p.y - 1, c); P(p.x, p.y - 2, c, 0.5); P(p.x - 1, p.y, c, 0.7); P(p.x + 1, p.y, c, 0.7)
			"dust":
				for i in 4: P(p.x + (i & 1), p.y - (i >> 1), c, 1 - k)
			"shard":
				P(p.x, p.y, c); P(p.x + 1, p.y, c); P(p.x, p.y + 1, c, 0.7); P(p.x - 1, p.y - 1, c, 0.5)
			_:
				if (int(p.age) >> 1) % 3 != 2 or k < 0.5:
					P(p.x, p.y, c); P(p.x + 1, p.y, c, 0.6); P(p.x, p.y + 1, c, 0.6)
	parts = parts.filter(func(p): return p.age < p.life)
	if FX_OFF:
		# 评审截图用（--fx-off）：照常推进顿帧与震屏，只不画特效，拿干净底图
		buf_px.clear(); buf_gl.clear(); buf_sp.clear(); flash.a = 0; dim_a = 0
	if not stopped:
		if flash.a > 0.005: flash.a *= pow(0.8, maxi(1, steps))
		dim_a = dim_a if list.size() else dim_a * pow(0.85, maxi(1, steps))
		if dim_a < 0.01: dim_a = 0
	return stopped

# ── bfx.js 覆盖层：蓄势光柱、蓄势预览、头目蓄力、破势星、回盾 ──
static func hsh(i: float, s := 1.0) -> float:
	var v := sin(i * 127.1 + s * 311.7) * 43758.5453
	return v - floor(v)

func streaks(fx: float, fy: float, n: int, bw: float, ht: float, pal: Array, q: float, spd: float, ln: float) -> void:
	for i in n:
		var ph := fmod(clock / spd + hsh(i, 3), 1.0); var xo := (hsh(i, 1) - 0.5) * 2 * bw; var yy := fy - ph * ht; var l := ln + hsh(i, 2) * 4; var a := q * (1 - ph * 0.75)
		Ln(fx + xo, yy, fx + xo, yy + l, pal[2], a * 0.8, 1); P(fx + xo, yy, pal[0], a); P(fx + xo, yy + 1, pal[1], a)

func motes_up(fx: float, fy: float, n: int, bw: float, ht: float, pal: Array, q: float, spd: float) -> void:
	for i in n:
		var ph := fmod(clock / spd + hsh(i, 7), 1.0); var x := fx + (hsh(i, 5) - 0.5) * 2 * bw + sin(clock / 200 + i) * 1.5; var y := fy - ph * ht
		P(x, y, pc(pal, ph), q * (1 - ph))

func pillar(fx: float, fy: float, bw: float, ht: float, c, q: float) -> void:
	if ht < 1 or q <= 0: return
	var n := ceili(bw)
	for x in range(-n, n + 1):
		var e := 1 - pow(x / (bw + 0.5), 2)
		if e <= 0: continue
		var y := 0
		while y < ht:
			var v := y / ht; var a := q * e * (1 - v) * (1 - v * 0.4)
			if a > 0.02: PG(fx + x, fy - y - 2, 1, 2, c, a)
			y += 2

func aura(u: Dictionary, lv: int, k: float, pre: bool) -> void:
	var pal: Array = PAL["金"]; var s := sqrt(uh(u) / 150); var fx := L(u.x + u.get("ox", 0.0)); var fy := L(u.y + u.get("goy", 0.0)); var hh := L(uh(u))
	var q: float = 0.55 + 0.15 * sin(clock / 160) if pre else (k / 0.1 if k < 0.1 else ((1 - k) / 0.28 if k > 0.72 else 1.0))
	var rx := (9 + lv * 3.5) * s; var ry := rx * 0.3
	ring(fx, fy, rx, ry, pal[2], q, 0, 0, 2 if lv > 1 else 1); ring(fx, fy, rx - 1, ry - 0.4, pal[0], q * 0.8, 0, 0, 1)
	if lv >= 2: ring(fx, fy, rx * 0.7, ry * 0.7, pal[1], q, 0.5, clock / 260, 1)
	if lv >= 3: ring(fx, fy, rx * 1.3, ry * 1.3, pal[3], q * 0.9, 0.35, -clock / 300, 1)
	var grow := 1.0 if pre else minf(1, k * 5); var ht := hh * (0.55 + 0.28 * lv) * grow * (0.8 if pre else 1.0); var bw := hh * (0.14 + 0.04 * lv)
	pillar(fx, fy, bw * 1.1, ht, pal[2], q * ((0.14 + 0.05 * lv) if pre else (0.14 + 0.1 * lv)))
	pillar(fx, fy, bw * 0.45, ht * 0.9, pal[1], q * ((0.08 + 0.04 * lv) if pre else (0.1 + 0.07 * lv)))
	streaks(fx, fy, (2 if pre else 3) + lv * (2 if pre else 4), bw * 1.15, ht, pal, q, maxf(340, 760 - lv * 120), 4 + lv * 3)
	motes_up(fx, fy, 4 + lv * 4, bw * 1.5, ht * 1.15, pal, q, 560 - lv * 60)
	if not pre and lv >= 3 and k < 0.5:
		var kk := k / 0.5
		ring(fx, fy, rx * (1 + kk * 3.6), ry * (1 + kk * 3.6), pal[1], 1 - kk, 0, 0, 2); ring(fx, fy, rx * (1 + kk * 3.6) - 1, ry * (1 + kk * 3.6) - 0.4, "#ffffff", (1 - kk) * 0.8, 0, 0, 1)
		if kk > 0.2:
			var k2 := (kk - 0.2) / 0.8; ring(fx, fy, rx * (1 + k2 * 2.4), ry * (1 + k2 * 2.4), pal[0], (1 - k2) * 0.8, 0.4, 0, 1)
	if pre and u.get("_pvT") != null:
		var kk: float = (bt.bt_now() - u._pvT) / 320.0
		if kk >= 0 and kk < 1:
			ring(fx, fy, rx * (1 + kk * 0.9), ry * (1 + kk * 0.9), pal[0], 1 - kk, 0, 0, 1 + (1 if lv > 2 else 0)); pillar(fx, fy, bw, ht, "#ffffff", 0.3 * (1 - kk))

func charge_aura(u: Dictionary) -> void:
	var pal: Array = PAL["血"]; var s := sqrt(uh(u) / 150); var fx := L(u.x + u.get("ox", 0.0)); var fy := L(u.y + u.get("goy", 0.0)); var hh := L(uh(u)); var q := 0.6 + 0.25 * sin(clock / 90)
	var rx := 14 * s; var ry := rx * 0.3
	pillar(fx, fy, hh * 0.2, hh * 0.95, pal[2], q * 0.2); ring(fx, fy, rx, ry, pal[2], q, 0, 0, 2); ring(fx, fy, rx * 0.72, ry * 0.72, pal[1], q * 0.8, 0.5, -clock / 200, 1)
	streaks(fx, fy, 7, hh * 0.2, hh * 0.9, pal, q * 0.85, 520, 6); motes_up(fx, fy, 8, hh * 0.24, hh, pal, q, 640)

func stars(u: Dictionary) -> void:
	var s := sqrt(uh(u) / 150); var cx := L(u.x + u.get("ox", 0.0)); var cy := L(u.y + u.get("oy", 0.0) - uh(u)) - 2
	for i in 3:
		var a := clock / 300 + i * 2.1; var sx := cx + cos(a) * 8 * s; var sy := cy + sin(a) * 2.2; var q := 0.55 if sin(a) < 0 else 1.0
		P(sx, sy, "#ffffff", q); P(sx - 1, sy, "#ffe25a", q); P(sx + 1, sy, "#ffe25a", q); P(sx, sy - 1, "#ffe25a", q); P(sx, sy + 1, "#ffe25a", q)

func shield_back(u: Dictionary, e: float) -> void:
	var kk := e / 620; var s := sqrt(uh(u) / 150); var cx := L(u.x + u.get("ox", 0.0)); var cy := L(u.y + u.get("oy", 0.0) - uh(u) * 0.5); var r := (6 + kk * 16) * s
	ring(cx, cy, r, r * 0.95, PAL["冰"][2], 1 - kk, 0, 0, 2); ring(cx, cy, r * 0.6, r * 0.57, "#ffffff", (1 - kk) * 0.8, 0.5, kk * 4, 1)
	for i in 8:
		var a := i / 8.0 * TAU + kk * 2; var rr := r * (1.05 + hsh(i, 9) * 0.3)
		P(cx + cos(a) * rr, cy + sin(a) * rr, PAL["冰"][i & 1], 1 - kk)

func overlay(t: float) -> void:
	var B = bt.B
	if B == null: return
	for u in B.units:
		if u.hp <= 0: continue
		if u.get("_boT") != null:
			var d: float = 760 + u._boL * 120; var k: float = (t - u._boT) / d
			if k >= 0 and k < 1: aura(u, u._boL, k, false); continue
		if u.side == "ally":
			if is_same(B.cur, u) and B.bpUse > 0:
				if u.get("_pvL", 0) != B.bpUse:
					if B.bpUse > u.get("_pvL", 0): u._pvT = t
					u._pvL = B.bpUse
				aura(u, mini(3, B.bpUse), 0, true)
			else: u._pvL = 0
		if u.get("charging"): charge_aura(u)
		if u.get("broken"): stars(u)
		if u.get("_shT") != null and t - u._shT < 620: shield_back(u, t - u._shT)
