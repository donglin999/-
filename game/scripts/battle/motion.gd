extends RefCounted
## 战斗演出：动作、位移、镜头编排。对应原版 js/bfx.js 的 BFXI（动作数据、frameOf、位移 offOf/moveTo、dashTo/hopBack、victoryPose）
## 与 playAttackPose。一切时间走战斗时钟 BT（bt.bt_now），顿帧时整体冻结。绘制在 unit_node.gd。

var bt
func _init(b) -> void: bt = b

func now() -> float: return bt.bt_now()
static func face(u: Dictionary) -> int: return 1 if u.side == "foe" else -1
static func cl01(v: float) -> float: return clampf(v, 0.0, 1.0)

# ── 动作数据（bfx.js HERO_LEGACY / FALL / STATIC_DUR）──
const HERO_LEGACY := {"file": "s_hero_battle", "cell": [147, 141], "cols": 11, "facing": "l", "legacy": 1, "anim": {
	"idle": {"f": [0, 1, 2, 1, 0, 3], "ms": 170, "loop": true}, "dash": {"f": [5], "ms": 200},
	"atk": {"f": [4, 5, 6, 7, 8], "ms": [70, 70, 160, 80, 80], "hit": 2}, "atk2": {"f": [5, 6, 7], "ms": [50, 100, 70], "hit": 1},
	"hurt": {"f": [9], "ms": 300}, "cast": {"f": [10], "ms": 420}}}
const FALL := {"dash": ["idle"], "atk2": ["atk", "idle"], "brk": ["hurt", "idle"], "dead": ["hurt", "idle"], "win": ["idle"], "hurt": ["idle"], "cast": ["idle"], "atk": ["idle"]}
const STATIC_DUR := {"atk": 380, "atk2": 220, "hurt": 300, "cast": 420, "win": 700, "dash": 200}

static func has_a(A, k: String) -> bool:
	return A != null and A.has("anim") and A.anim.has(k) and A.anim[k].has("f") and A.anim[k].f.size() > 0

static func bart() -> Dictionary:
	var b = DB.g("BART")
	return b if b is Dictionary else {}

## bfx.js artOf：BART 条目且精灵表已载入；主角缺表时用旧动作表
func art_of(u: Dictionary):
	var A = bart().get(u.get("art", ""))
	if A is Dictionary and A.has("file") and A.has("cell") and A.has("anim") and Assets.tex_ready(A.file) != null: return A
	if u.get("isHero") and Assets.has("s_hero_battle") and Assets.tex_ready("s_hero_battle") != null: return HERO_LEGACY
	return null

static func spec(A, k: String) -> Dictionary:
	if has_a(A, k): return A.anim[k]
	for f in FALL.get(k, []):
		if has_a(A, f): return A.anim[f]
	return A.anim.idle if has_a(A, "idle") else {"f": [0], "ms": 200, "loop": true}

static func ms_arr(s: Dictionary) -> Array:
	if s.ms is Array: return s.ms
	var out := []
	for _f in s.f: out.append(float(s.ms) if s.get("ms") else 120.0)
	return out

static func dur_of(s: Dictionary) -> float:
	var t := 0.0
	for m in ms_arr(s): t += float(m)
	return t

static func fidx(s: Dictionary, e: float, loop: bool) -> int:
	var m := ms_arr(s); var T := dur_of(s)
	if T <= 0: T = 1
	if loop: e = fposmod(e, T)
	elif e >= T: return int(s.f[s.f.size() - 1])
	var a := 0.0
	for i in m.size():
		a += float(m[i])
		if e < a: return int(s.f[i])
	return int(s.f[s.f.size() - 1])

func _sum_to(m: Array, n: int) -> float:
	var t := 0.0
	for i in mini(n, m.size()): t += float(m[i])
	return t

## 出招 → 命中毫秒（bfx.js projectile/impactMs/recoveryMs/contacts）
func projectile(u: Dictionary, k: String):
	var A = art_of(u)
	if A == null: return null
	var s := spec(A, k)
	if not s.has("projectile"): return null
	var p: Dictionary = s.projectile.duplicate()
	p.releaseMs = _sum_to(ms_arr(s), int(p.release))
	return p

func impact_ms(u: Dictionary, k: String) -> float:
	var p = projectile(u, k)
	if p != null: return p.releaseMs + float(p.flightMs)
	var A = art_of(u)
	if A == null: return 50.0 if k == "atk2" else 90.0
	var s := spec(A, k); var m := ms_arr(s)
	var hi: int = int(s.hit) if s.get("hit") != null else mini(s.f.size() - 1, floori(s.f.size() * 0.5))
	return maxf(40, _sum_to(m, hi))

func recovery_ms(u: Dictionary, k: String, fb: float) -> float:
	var A = art_of(u)
	if A == null: return fb
	var s := spec(A, k)
	return maxf(fb, dur_of(s) - impact_ms(u, k)) if s.get("complete") else fb

func contacts(u: Dictionary, k: String) -> Array:
	var A = art_of(u)
	var s = spec(A, k) if A != null else null
	if s == null or not s.has("contacts"): return [{"ms": impact_ms(u, k), "resolve": true}]
	var m := ms_arr(s); var out := []
	for c in s.contacts:
		var c2: Dictionary = c.duplicate(); c2.ms = _sum_to(m, int(c.frame)); out.append(c2)
	return out

func act(u: Dictionary, k: String, hold := false) -> void:
	u.anim = {"k": k, "t0": now(), "hold": hold}

## bfx.js stateOf
func state_of(u: Dictionary, t: float) -> Dictionary:
	if u.hp <= 0: return {"k": "dead", "t0": u.get("_dT") if u.get("_dT") != null else t, "hold": true}
	var a = u.get("anim")
	if a != null:
		if a.get("hold"): return a
		var A = art_of(u)
		var d: float = dur_of(spec(A, a.k)) if A != null else float(STATIC_DUR.get(a.k, 300))
		if t - a.t0 < d: return a
		u.anim = null
	if u.get("broken"): return {"k": "brk", "t0": u.get("_bT", 0.0), "loop": true}
	if u.get("charging"): return {"k": "cast", "t0": u.get("_cT", 0.0), "hold": true}
	return {"k": "idle", "t0": -fmod(u.id * 7919.0, 1.0) * 4000.0, "loop": true}

# ── 身体范围（bstage.js battleBodyBounds：只量第 0 帧横向 24%–76%，alpha≥48）──
static var _bounds := {}
static var _images := {}
static func image_of(key: String) -> Image:
	if _images.has(key): return _images[key]
	var t := Assets.tex(key)
	var im: Image = t.get_image() if t else null
	if im and im.is_compressed(): im.decompress()
	_images[key] = im
	return im

static func body_bounds(A) -> Dictionary:
	if A == null: return {"height": 1.0, "bottom": 1.0}
	var cw := int(A.cell[0]); var ch := int(A.cell[1])
	if _bounds.has(A.file): return _bounds[A.file]
	var im := image_of(A.file)
	if im == null: return {"height": float(ch), "bottom": float(ch)}
	var left := floori(cw * 0.24); var right := ceili(cw * 0.76)
	var top := ch; var bottom := 0
	for y in mini(ch, im.get_height()):
		for x in range(left, mini(right, im.get_width())):
			if im.get_pixel(x, y).a8 >= 48:
				if y < top: top = y
				if y + 1 > bottom: bottom = y + 1
				break
	var r := {"height": float(bottom - top) if bottom > top else float(ch), "bottom": float(bottom) if bottom else float(ch)}
	_bounds[A.file] = r
	return r

## bfx.js frameOf：返回绘制所需的源矩形与尺寸
func frame_of(u: Dictionary, t: float, h: float) -> Dictionary:
	var st := state_of(u, t)
	var want := "r" if u.side == "foe" else "l"
	var A = art_of(u)
	if A != null:
		var tex := Assets.tex(A.file)
		var s := spec(A, st.k)
		var cw := float(A.cell[0]); var ch := float(A.cell[1])
		var cols: int = int(A.cols) if A.get("cols") else maxi(1, floori(tex.get_width() / cw))
		var fi := fidx(s, t - st.t0, (st.get("loop", false) or s.get("loop", false)) and not st.get("hold", false))
		var body := body_bounds(A)
		var dh: float = h * ch / body.height
		return {"tex": tex, "src": Rect2((fi % cols) * cw, floori(fi / cols) * ch, cw, ch), "dh": dh, "dw": dh * cw / ch,
			"originX": A.anchor[0] * dh / ch if A.has("anchor") else null, "foot": (ch - body.bottom) * dh / ch,
			"flip": A.get("facing", want) != want, "sheet": true, "st": st, "A": A, "legacy": A.get("legacy", 0) == 1}
	# 无动作表：场景小人静态帧（battle.js unitImg）
	var k: String = u.get("art", "")
	var key := ""
	for n in ["c_%s_%s_0" % [k, want], "c_%s_%s" % [k, want], "c_%s_%s_0" % [k, "r" if want == "l" else "l"], "c_%s_d_0" % k]:
		if Assets.has(n): key = n; break
	if key == "": return {"st": st, "none": true, "dh": h, "dw": h * 0.4}
	var fr = CharArt.frame(key) if CharArt.has_method("frame") else null
	var tex2: Texture2D = fr[0] if fr else Assets.tex(key)
	var src: Rect2 = fr[1] if fr else Rect2(0, 0, tex2.get_width(), tex2.get_height())
	var dh2 := h * 1.1
	return {"tex": tex2, "src": src, "dh": dh2, "dw": dh2 * src.size.x / src.size.y, "originX": null, "foot": 0.0,
		"flip": key.begins_with("c_%s_%s" % [k, "r" if want == "l" else "l"]), "sheet": false, "st": st, "A": null}

# ── 位移（相对站位的偏移，bfx.js EASE/mvPos/moveTo/kbCurve/offOf）──
static func ease_fn(n: String, k: float) -> float:
	match n:
		"io": return 2 * k * k if k < 0.5 else 1 - pow(-2 * k + 2, 2) / 2
		"lin": return k
		"in": return k * k
	return 1 - pow(1 - k, 3)

func mv_pos(u: Dictionary, t: float) -> Vector2:
	var m = u.get("mv")
	if m == null: return Vector2.ZERO
	var e := ease_fn(m.get("ease", "out"), cl01((t - m.t0) / m.dur))
	return Vector2(m.x0 + (m.x1 - m.x0) * e, m.y0 + (m.y1 - m.y0) * e)

func move_to(u: Dictionary, x1: float, y1: float, dur: float, arc := 0.0, ease := "out") -> void:
	var t := now(); var p := mv_pos(u, t)
	u.mv = {"x0": p.x, "y0": p.y, "x1": x1, "y1": y1, "t0": t, "dur": dur, "arc": arc, "ease": ease}
	await bt.bw(dur)

static func kb_curve(e: float) -> float:
	return ease_fn("out", e / 40) if e < 40 else 1 - ease_fn("io", (e - 40) / 220)

## 返回 {x, gy, lift}
func off_of(u: Dictionary, t: float) -> Dictionary:
	var x := 0.0; var y := 0.0; var lift := 0.0
	var m = u.get("mv")
	if m != null:
		var k := cl01((t - m.t0) / m.dur); var e := ease_fn(m.get("ease", "out"), k)
		x = m.x0 + (m.x1 - m.x0) * e; y = m.y0 + (m.y1 - m.y0) * e; lift = m.arc * 4 * k * (1 - k)
		if k >= 1 and not m.x1 and not m.y1: u.mv = null
	if u.get("kbT") != null:
		var e2: float = t - u.kbT
		if e2 < 260 and e2 >= 0: x += (-1 if u.side == "foe" else 1) * float(u.get("_kbAmt", 12)) * kb_curve(e2)
		elif e2 >= 260: u.kbT = null
	if u.get("dgT") != null:
		var k2: float = (t - u.dgT) / 340.0
		if k2 < 1 and k2 >= 0:
			var s := sin(k2 * PI); x += (-1 if u.side == "foe" else 1) * 34 * s; lift += 12 * s
		elif k2 >= 1: u.dgT = null
	return {"x": x, "gy": y, "lift": lift}

func _uh(u) -> float: return bt.rules.unit_h(u)

## bfx.js dashTo：冲刺到目标前方（dash 帧 + 残影）
func dash_to(u: Dictionary, t, k := "atk") -> void:
	if t == null or is_same(t, u): return
	var dir := signf(t.x - u.x)
	if dir == 0: dir = face(u)
	var hu := _uh(u); var ht := _uh(t)
	var A = art_of(u)
	var src_reach = contacts(u, k)[0].get("reach", A.get("contactReach") if A != null else null)
	var reach: float = float(src_reach) * hu / body_bounds(A).height if src_reach != null and A != null else 0.0
	var gap := maxf(ht * 0.2 + hu * 0.16 + 14, reach)
	var tx: float = t.x - dir * gap - u.x
	if tx * dir < 0: tx = 0
	var ty: float = (t.y + 4) - u.y
	act(u, "dash", true); u.dashing = true; u._tr = []; bt.sfx("whoosh", 0.45, 1.35)
	await move_to(u, tx, ty, roundf(170 + minf(110, absf(tx) * 0.18)), 0, "out")
	u.dashing = false

func aim_reach(u: Dictionary, t, c: Dictionary, lead: float) -> void:
	var A = art_of(u)
	if A == null or c.get("reach") == null or t == null: return
	var dir := signf(t.x - u.x)
	if dir == 0: dir = face(u)
	var gap := maxf(_uh(t) * 0.2 + _uh(u) * 0.16 + 14, float(c.reach) * _uh(u) / body_bounds(A).height)
	var p := mv_pos(u, now())
	u.mv = {"x0": p.x, "y0": p.y, "x1": t.x - dir * gap - u.x, "y1": t.y + 4 - u.y, "t0": now(), "dur": maxf(1, minf(120, lead)), "arc": 0.0, "ease": "io"}

## 出手点（世界坐标）
func tip_point(u: Dictionary, point):
	var A = art_of(u)
	if A == null or point == null: return null
	var o := off_of(u, now()); var s = _uh(u) / body_bounds(A).height
	return Vector2(u.x + o.x + (point[0] - A.anchor[0]) * s * face(u) * -1, u.y + o.gy - o.lift + (point[1] - A.anchor[1]) * s)

func hop_back(u: Dictionary) -> void:
	u.anim = null; u.dashing = false
	await move_to(u, 0, 0, 300, 30, "io")
func step_fwd(u: Dictionary, px := 28.0) -> void: await move_to(u, face(u) * px, 0, 170, 0, "out")
func step_back(u: Dictionary) -> void: await move_to(u, 0, 0, 220, 0, "io")

func cam_on(us: Array, z := 1.08, ms := 260.0) -> void:
	var v := us.filter(func(x): return x != null)
	if v.is_empty(): return
	var x := 0.0; var y := 0.0
	for u in v: x += u.x; y += u.y - _uh(u) * 0.45
	bt.cam.focus(x / v.size(), y / v.size(), z, ms)
func cam_reset(ms := 380.0) -> void: bt.cam.reset(ms)

func begin_skill_pose(u: Dictionary) -> void:
	u.stationarySkill = true; u.stepO = 0.0
	if u.get("bx") != null: u.x = u.bx
	act(u, "cast", true)

## bfx.js lunge：k<1 为前踏半步（道具），否则冲刺后自动回位
func lunge(u: Dictionary, t, k := 1.0) -> void:
	u._mvTok = int(u.get("_mvTok", 0)) + 1
	var tok: int = u._mvTok
	if k < 1:
		act(u, "cast"); step_fwd(u, minf(34, 110 * k)); await bt.bw(230)
		_lunge_back(u, tok, 240, false)
		return
	await dash_to(u, t)
	_lunge_back(u, tok, 200, true)

func _lunge_back(u: Dictionary, tok: int, ms: float, hop: bool) -> void:
	await bt.bw(ms)
	if u.get("_mvTok") == tok:
		if hop: hop_back(u)
		else: u.anim = null; step_back(u)

## bfx.js onTurnStart：回合开始的扩散强调
func on_turn_start(u) -> void:
	if u == null: return
	var t := now()
	if not (u.get("_tT") != null and t - u._tT < 250 and t >= u._tT): u._tT = t

func victory_pose() -> void:
	if bt.B == null: return
	var al: Array = bt.rules.alive_of("ally")
	if al.is_empty(): return
	cam_on(al, 1.2, 450)
	for i in al.size(): _win_one(al[i], i)
	await bt.bw(900)

func _win_one(u: Dictionary, i: int) -> void:
	await bt.bw(i * 90)
	var A = bart().get(u.get("art", ""))
	if A != null and has_a(A, "win") and art_of(u) == A: act(u, "win", true)
	else:
		act(u, "cast", true); await move_to(u, 0, 0, 340, 26, "lin"); await move_to(u, 0, 0, 240, 12, "lin"); u.anim = null

## bfx.js playAttackPose：出招帧与命中对齐；飞针在出手帧放出、到达时结算
func play_attack_pose(u: Dictionary, a: String, tgs: Array, ty, key, bp: int, resolve: Callable, fallback: float) -> void:
	act(u, a)
	var proj = projectile(u, a)
	if proj != null:
		await bt.bw(proj.releaseMs)
		var alive := tgs.filter(func(t): return t.hp > 0)
		var hand = tip_point(u, proj.get("hand"))
		if alive.size():
			bt.sfx("needle_release_20261012", 0.45, 1)
			for t in alive: bt.vfx.needle_flight(hand, t, proj.flightMs, bp)
		await bt.bw(proj.flightMs)
		for t in alive:
			if t.hp > 0: resolve.call(t); bt.vfx.needle_impact(t, key, bp)
		await bt.bw(recovery_ms(u, a, fallback))
		return
	var elapsed := 0.0
	var cs := contacts(u, a)
	for c in cs:
		var alive := tgs.filter(func(t): return t.hp > 0)
		if alive.is_empty(): break
		var lead: float = c.ms - elapsed
		aim_reach(u, alive[0], c, lead); await bt.bw(lead); elapsed = c.ms
		for t in alive:
			if c.get("resolve"): resolve.call(t); bt.vfx.hit(u, t, ty, key, bp)
			else:
				var firm: bool = c.get("weight") == "firm"
				act(t, "hurt"); t.kbT = now(); t._kbAmt = 14 if firm else 6; t._tapT = now(); t._tapPower = 0.85 if firm else 0.45
				bt.vfx.touch(u, t, tip_point(u, c.get("point")), firm); bt.sfx("staff_hit_20261010", 1.05 if firm else 0.65, 1 if firm else 1.15)
				if firm: bt.cam.punch(1.045, 130)
		if c.get("resolve") and cs.size() > 1: bt.cam.punch(1.035, 150)
	await bt.bw(recovery_ms(u, a, fallback))
