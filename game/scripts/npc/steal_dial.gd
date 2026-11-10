extends Control
## 袖里一按（原版 js/qihe-steal-ui.js minigame()，第 6 节；图 02）。
## 一定以 "fail"｜"ok"｜"great" 之一结束；Esc 缩手算失手；无论怎么结束都先给反馈、再收起。
## 纯计算 zones/judge/combine/params 照抄原版（可单独测）。
const U := preload("res://scripts/npc/util.gd")
const DIAL := {"k": "ui_qh_steal_dial_20261027", "w": 1536.0, "cx": 767.7, "cy": 833.8, "r": 640.0}
const NEEDLE := "ui_qh_steal_needle_20261027"
const R := 200.0
const A0 := 188.0
const A1 := 352.0

signal done(v)
var ui
var P: Dictionary
var item: Dictionary
var chance_value := 0.0
var tier: Dictionary
var opts: Dictionary
var cx := 0.0; var cy := 0.0; var B := 1.0
var hand := 0
var running := false
var t0 := 0.0
var z: Dictionary = {}
var results: Array = []
var beats: Array = ["", ""]   # 每手结果
var settling := false
var final0 := "fail"
var _done := false
var timers: Array = []        # [到点毫秒, Callable]
var needle_p := 0.0
var flash := ["", 0.0]        # [hit-great/ok/fail, 开始毫秒]
var verdict_at := -1.0
var esc_rect := Rect2()

# ───── 纯计算 ─────
## 金区、朱心按一趟行程的比例给（0＝起，1＝止）
static func zones(gold_ratio: float, red_ratio: float, rnd := -1.0) -> Dictionary:
	if rnd < 0: rnd = randf()
	var w := clampf(gold_ratio, 0, 1)
	var g0 := (1 - w) * clampf(rnd, 0, 1)
	var rw := w * clampf(red_ratio, 0, 1)
	var r0 := g0 + (w - rw) / 2
	return {"g0": g0, "g1": g0 + w, "r0": r0, "r1": r0 + rw}

## 落针位置 p（0～1）→ great／ok／fail；p 为空（没按）算失手
static func judge(p, zz: Dictionary) -> String:
	if p == null or is_nan(p) or p < 0 or p > 1: return "fail"
	var e := 1e-9
	if zz.r1 > zz.r0 and p >= zz.r0 - e and p <= zz.r1 + e: return "great"
	if p >= zz.g0 - e and p <= zz.g1 + e: return "ok"
	return "fail"

static func combine(rs: Array) -> String:
	if rs.is_empty() or rs.has("fail"): return "fail"
	return "great" if rs.all(func(r): return r == "great") else "ok"

## 几手、金区宽、朱心宽、针速；数值由 steal.gd minigame 算
static func params(st, chance_v: float, tr: Dictionary, perks: Array) -> Dictionary:
	var base = st.minigame(chance_v, tr, perks) if st else null
	var hands := int(base.hands if base else U.nz(tr.get("hands"), 1))
	var gold: float = base.goldRatio if base else (chance_v / 100.0 if hands == 1 else pow(chance_v / 100.0, 1.0 / hands))
	var nd := maxf(0.6, U.num(base.needle if base else U.nz(tr.get("needle"), 2.5)))
	if nd == 0: nd = 2.5
	return {"hands": hands, "goldRatio": clampf(gold, 0, 1), "redRatio": base.redRatio if base else 0.25, "needle": nd}

# ───── 画面与时序 ─────
func _init() -> void:
	size = Vector2(1600, 900); mouse_filter = Control.MOUSE_FILTER_STOP

static func now() -> float: return Time.get_ticks_msec()
func later(f: Callable, ms: float) -> void: timers.append([now() + ms, f])
func ang(p: float) -> float: return A0 + (A1 - A0) * p
func pt(r: float, d: float) -> Vector2: return Vector2(cx + r * cos(deg_to_rad(d)), cy + r * sin(deg_to_rad(d)))

func setup(A: Dictionary) -> void:
	B = ui.boost()
	cx = clampf(((A.x + A.px) / 2.0) if A.get("px") != null else A.x, (R + 90) * B, 1600 - (R + 90) * B)
	cy = clampf(maxf(A.y, U.nz(A.get("py"), A.y)) + 30, (R + 110) * B, 900 - 160 * B)
	ui.key_fn = on_key
	ui.closer = func(): end("fail")
	start_hand()
	later(func(): end(final0 if settling else "fail"), P.hands * (P.needle * 1000 + 900) + 2600)   # 看门狗

func end(r: String) -> void:
	if _done: return
	_done = true; running = false; timers = []
	ui.key_fn = Callable(); ui.closer = Callable()
	done.emit(r if r in ["great", "ok"] else "fail")

## 被外部清掉（读档、切图、别的界面 ensure）也按失手结束，免得等待方卡住
func _exit_tree() -> void: end(final0 if settling else "fail")

func start_hand() -> void:
	if _done or settling: return
	z = zones(P.goldRatio, P.redRatio)
	needle_p = 0.0; flash = ["", 0.0]
	later(func():
		if _done or settling: return
		t0 = now(); running = true, 420 if hand == 0 else 160)

func press(src: String) -> void:
	if not running or _done or settling: return
	running = false
	var p = null if src == "timeout" else clampf((now() - t0) / (P.needle * 1000), 0, 1)
	if p != null: needle_p = p
	var r := judge(p, z)
	results.append(r)
	beats[hand] = r
	flash = ["hit-" + r, now()]
	if r == "fail" or hand >= P.hands - 1:
		later(func(): settle(combine(results)), 120 if r == "fail" else 200)
		return
	hand += 1
	later(start_hand, 300 + 200)   # 两手间隔 0.3 秒（加 0.2 秒看清第一手的落点）

func settle(final: String) -> void:
	settling = true; final0 = final
	ui.key_fn = func(k):
		if k in ["escape", "e", " ", "enter"]: end(final)
	ui.closer = func(): end(final)
	verdict_at = now()
	later(func(): end(final), 760 if final == "fail" else 820)

func cancel() -> void:
	if _done or settling: return
	running = false
	results.append("fail"); beats[hand] = "fail"
	settle("fail")

func on_key(k: String) -> void:
	if k in ["e", " ", "enter"]: press("key")
	elif k == "escape": cancel()

func _gui_input(e: InputEvent) -> void:
	if _done: return
	if e is InputEventMouseButton and e.pressed and e.button_index != MOUSE_BUTTON_RIGHT:
		if settling: end(final0)
		else:
			var q: Vector2 = Vector2(cx, cy) + (e.position - Vector2(cx, cy)) / B
			if esc_rect.has_point(q): cancel()
			else: press("mouse")
	accept_event()

func _process(_d: float) -> void:
	if _done: return
	var t := now()
	var due := timers.filter(func(x): return x[0] <= t)
	timers = timers.filter(func(x): return x[0] > t)
	for x in due:
		if _done: break
		x[1].call()
	if running:
		var p: float = (now() - t0) / (P.needle * 1000)
		if p >= 1: needle_p = 1.0; press("timeout")
		else: needle_p = p
	queue_redraw()

func _halo(r: Rect2) -> void:
	var sb := StyleBoxFlat.new(); sb.bg_color = Color(12 / 255.0, 14 / 255.0, 12 / 255.0, 0.62); sb.set_corner_radius_all(40)
	sb.shadow_color = Color(12 / 255.0, 14 / 255.0, 12 / 255.0, 0.3); sb.shadow_size = 10
	draw_style_box(sb, r)

func _ctext(f: Font, s: String, c: Vector2, px: float, col: Color) -> void:
	var w: float = ui.tw(f, s, px)
	ui.stext(self, f, Vector2(c.x - w / 2, c.y + px * 0.36), s, px, col)

func _draw() -> void:
	var t := now()
	ui.dim(self, Vector2(cx, cy - 40))
	var o := Vector2(cx, cy)
	var shake := 0.0
	var miss := settling and final0 == "fail"
	var fl_age: float = t - flash[1]
	if (miss and t - verdict_at < 260) or (flash[0] == "hit-fail" and fl_age < 260):
		var a := (t - verdict_at) if miss else fl_age
		shake = -5.0 if fmod(a, 130) < 65 else 5.0
	draw_set_transform(o - o * B + Vector2(shake * B, 0), 0, Vector2(B, B))
	# 弧框图
	var DK: float = R / DIAL.r
	var dt: Texture2D = Assets.tex(DIAL.k)
	if dt:
		var w: float = DIAL.w * DK
		var h := w * dt.get_height() / dt.get_width()
		var pos := Vector2(cx - DIAL.cx * DK, cy - DIAL.cy * DK)
		draw_texture_rect(dt, Rect2(pos + Vector2(0, 3), Vector2(w, h)), false, Color(0, 0, 0, 0.4))
		draw_texture_rect(dt, Rect2(pos, Vector2(w, h)), false)
	# 金段、朱心（画在弧框的槽里，槽宽约 10）
	if not z.is_empty():
		var br := 0.0
		if flash[0] in ["hit-great", "hit-ok"] and fl_age < 300: br = 1.0 - fl_age / 300.0
		var g0 := ang(z.g0); var g1 := maxf(ang(z.g1), g0 + 0.8)
		var r0 := ang(z.r0); var r1 := maxf(ang(z.r1), r0 + 0.6)
		var gc := Color(236 / 255.0, 196 / 255.0, 104 / 255.0, 0.95).lerp(Color("#fff7d8"), br * 0.6)
		draw_arc(o, R, deg_to_rad(g0), deg_to_rad(g1), 48, gc, 9, true)
		draw_arc(o, R, deg_to_rad(g0), deg_to_rad(g1), 48, Color(1, 244 / 255.0, 210 / 255.0, 0.7), 1.5, true)
		if z.r1 > z.r0:
			draw_arc(o, R, deg_to_rad(r0), deg_to_rad(r1), 16, Color("#c23b26").lerp(Color("#ff9a80"), br * 0.6), 10, true)
			draw_arc(o, R, deg_to_rad(r0), deg_to_rad(r1), 16, Color(1, 214 / 255.0, 190 / 255.0, 0.7), 1.2, true)
		var gw := g1 - g0; var rm := (r0 + r1) / 2
		var lf := Paint.font(UI.song, 14, 2.0 / 14)
		if gw >= 34:
			_ctext(lf, "金区", pt(R - 34, g0 + minf(10, gw * 0.2)), 14, Color("#efd9a6"))
			if z.r1 > z.r0: _ctext(lf, "朱心", pt(R - 34, rm + (4 if rm - g0 > 22 else 0)), 14, Color("#f0b8a6"))
		elif gw >= 10: _ctext(lf, "金区", pt(R - 34, (g0 + g1) / 2), 14, Color("#efd9a6"))
	var ef := Paint.font(UI.song, 14, 2.0 / 14)
	_ctext(ef, "起", pt(R - 28, A0), 14, Color("#cdbf9c"))
	_ctext(ef, "止", pt(R - 28, A1), 14, Color("#cdbf9c"))
	# 银针残影与针
	var d := ang(clampf(needle_p, 0, 1))
	for k in range(1, 5):
		var dd := d - k * 3
		if dd < A0 - 2: break
		draw_line(pt(R - 7, dd), pt(R + 7, dd), Color(235 / 255.0, 238 / 255.0, 240 / 255.0, 0.4 - k * 0.08), 3 - k * 0.5, true)
	var nt: Texture2D = Assets.tex(NEEDLE)
	if nt:
		var nh := 74.0; var nw := nt.get_width() * nh / nt.get_height()
		var c := pt(R, d)
		draw_set_transform(o - o * B + Vector2(shake * B, 0) + c * B, deg_to_rad(d + 90), Vector2(B, B))
		draw_texture_rect(nt, Rect2(-nw / 2, -nh / 2, nw, nh), false)
		draw_set_transform(o - o * B + Vector2(shake * B, 0), 0, Vector2(B, B))
	_title(t)
	_under()
	_verdict(t)
	draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

## .qs-title：物件图标＋名字＋“一手 · 成功率”
func _title(t: float) -> void:
	var disp: Dictionary = opts.get("disp", {"name": U.nz(item.get("n"), "？")})
	var title := str(U.nz(disp.get("name"), U.nz(item.get("n"), "？")))
	var sub := []
	if U.t(tier.get("precious")): sub.append("甲级以上贵重")
	sub.append("两手" if P.hands > 1 else "一手")
	sub.append("成功率 %d%%" % U.jround(chance_value))
	var ss := " · ".join(sub)
	var bf := Paint.font(UI.song, 20, 4.0 / 20)
	var sf := Paint.font(UI.song, 13.5, 2.0 / 13.5)
	var w: float = 44 + 10 + ui.tw(bf, title, 20) + 10 + ui.tw(sf, ss, 13.5)
	var x := cx - w / 2 - 26
	var y := cy - R - 80
	_halo(Rect2(x, y, w + 52, 56))
	var ic := Vector2(x + 26 + 22, y + 28)
	var a := 1.0; var sc := 1.0; var dy := 0.0
	if settling and final0 != "fail":
		var k := clampf((t - verdict_at) / 320.0, 0, 1)
		k = k * k   # ease-in
		dy = 190 * k; sc = 1 - 0.7 * k; a = 1 - k
	var icp := ic + Vector2(0, dy)
	draw_circle(icp, 22 * sc, Color(30 / 255.0, 35 / 255.0, 31 / 255.0, 0.94 * a))
	draw_arc(icp, 22 * sc - 0.5, 0, TAU, 40, Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.8 * a), 1, true)
	var icon = opts.get("icon")
	if a > 0.02:
		if icon is Array: ui.draw_icon(self, icon, icp, 32 * sc)
		else: ui.draw_icon(self, [null, str(U.nz(item.get("n"), "？")).substr(0, 1), false, false], icp, 32 * sc)
	var tx := x + 26 + 44 + 10
	tx += ui.stext(self, bf, Vector2(tx, y + 35), title, 20, Color("#f3e3b8")) + 10
	ui.stext(self, sf, Vector2(tx, y + 34), ss, 13.5, Color("#e2d4b2"))

## .qs-under：两手进度、规则、图例、键位（居中一列，gap 10）
func _under() -> void:
	var y := cy + 48 + 6
	var f15 := Paint.font(UI.song, 15, 1.0 / 15)
	var f145 := Paint.font(UI.song, 14.5, 1.0 / 14.5)
	var fb := Paint.font(UI.song_bold, 14.5, 1.0 / 14.5)
	var rule := "墨针从“起”扫到“止”，只扫一趟。看准时机按下去"
	var rule_b := "连按两手都中" if P.hands > 1 else ""
	var legend := [["落在金色段：", "得手", "，东西到手", Color("#e2c27c")], ["金段正中的红点：", "妙手", "，到手，窃术经验多 1", Color("#b5432f")], ["落在金段外或没按：", "失手", "，被他发觉", null]]
	var lw := 0.0
	for l in legend: lw = maxf(lw, 22 + ui.tw(f145, l[0] + l[2], 14.5) + ui.tw(fb, l[1], 14.5))
	var rw: float = ui.tw(f15, rule + ("，" + rule_b + "才到手" if rule_b != "" else "") + "：", 15)
	var kw := 420.0
	var bw := maxf(maxf(lw, rw), kw)
	var h := (42 + 10 if P.hands > 1 else 0) + 22 + 10 + 3 * 21 + 12 + 10 + 22
	_halo(Rect2(cx - bw / 2 - 26, y - 6, bw + 52, h + 12))
	if P.hands > 1:
		var bx := cx - (2 * 110 + 18) / 2.0
		for i in 2:
			var r: String = beats[i]
			var cur := r == "" and i == hand and not settling
			var sz := 42.0 if cur else 36.0
			var sr := Rect2(bx + i * 128, y + (42 - sz) / 2, sz, sz)
			var style := "ink"
			if r in ["great", "ok"]: style = "zhu"
			elif r == "fail": style = "hol"
			ui.seal(self, sr, ["伸", "收"][i], 24 if cur else 19, style)
			if cur: draw_rect(sr.grow(5.5), Color("#c4553d"), false, 1.5)
			var lx := sr.end.x + 7
			lx += ui.stext(self, Paint.font(UI.song, 15, 2.0 / 15), Vector2(lx, y + 26), ["伸", "收"][i] + "手", 15, Color("#efd9a6") if cur else Color("#cdbf9c"))
			if r != "": ui.stext(self, UI.song, Vector2(lx + 4, y + 26), {"great": "妙手", "ok": "得手", "fail": "失手"}[r], 12, Color("#f0a18a") if r == "fail" else Color("#e8c27a"))
		y += 42 + 10
	# 规则
	var x := cx - rw / 2
	x += ui.stext(self, f15, Vector2(x, y + 16), rule, 15, Color("#f3e3b8"))
	if rule_b != "":
		x += ui.stext(self, f15, Vector2(x, y + 16), "，", 15, Color("#f3e3b8"))
		x += ui.stext(self, Paint.font(UI.song_bold, 15, 1.0 / 15), Vector2(x, y + 16), rule_b, 15, Color("#ffd9a0"))
		x += ui.stext(self, f15, Vector2(x, y + 16), "才到手", 15, Color("#f3e3b8"))
	ui.stext(self, f15, Vector2(x, y + 16), "：", 15, Color("#f3e3b8"))
	y += 22 + 10
	# 图例（左对齐，gap 6）
	var lx0 := cx - lw / 2
	for l in legend:
		var sw := Rect2(lx0, y + 5, 16, 8)
		draw_rect(sw.grow(1), Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.7))
		if l[3] != null: draw_rect(sw, l[3])
		else: draw_rect(sw, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.7)); draw_rect(sw.grow(1), Color("#e2c27c"), false, 1)
		var xx := lx0 + 22
		xx += ui.stext(self, f145, Vector2(xx, y + 14), l[0], 14.5, Color("#e9dcbc"))
		xx += ui.stext(self, fb, Vector2(xx, y + 14), l[1], 14.5, Color("#f3e3b8"))
		ui.stext(self, f145, Vector2(xx, y + 14), l[2], 14.5, Color("#e9dcbc"))
		y += 21
	y += 12 + 10 - 6
	# 键位
	var parts := [["E", true], ["／", false], ["空格", true], ["／点击 落手 · ", false], ["Esc", true], [" 缩手（算失手）", false]]
	var kf := Paint.font(UI.song, 14.5, 2.0 / 14.5)
	var tot := 0.0
	for q in parts: tot += ui.tw(kf, q[0], 14.5) + (14.0 if q[1] else 0.0)
	var kx := cx - tot / 2
	for i in parts.size():
		var q: Array = parts[i]
		var w: float = ui.tw(kf, q[0], 14.5)
		if q[1]:
			var kr := Rect2(kx + 3, y + 2, maxf(18, w + 8), 18)
			draw_rect(kr, Color(16 / 255.0, 22 / 255.0, 19 / 255.0, 0.72)); draw_rect(kr, Color(215 / 255.0, 184 / 255.0, 116 / 255.0, 0.8), false, 1)
			Paint.draw_text(self, kf, Vector2(kr.get_center().x - w / 2, y + 16), q[0], 14.5, Color("#efce83"))
			if i == 4: esc_rect = Rect2(kx, y, kr.size.x + 6 + ui.tw(kf, parts[5][0], 14.5), 22)
			kx += kr.size.x + 6
		else:
			kx += ui.stext(self, kf, Vector2(kx, y + 16), q[0], 14.5, Color("#e9dcbc"))

## .qs-verdict：结果印（妙／得／失），落下时 0.18 秒由 1.5 倍缩回
func _verdict(t: float) -> void:
	if verdict_at < 0: return
	var m: Array = {"great": ["妙", "妙手", "zhu", "到手 · 窃术经验多 1"], "ok": ["得", "得手", "ink", "东西到手"], "fail": ["失", "失手", "hol", "被他发觉了"]}[final0]
	var k := clampf((t - verdict_at) / 180.0, 0, 1)
	var sc := 1.5 - 0.5 * k
	var c := Vector2(cx, cy - R * 0.45)
	var bf := Paint.font(UI.song, 26, 8.0 / 26)
	var ef := Paint.font(UI.song, 16, 2.0 / 16)
	var w: float = 60 + 12 + ui.tw(bf, m[1], 26) + 12 + ui.tw(ef, m[3], 16)
	var base := Transform2D(0, Vector2(B, B), 0, Vector2(cx, cy) - Vector2(cx, cy) * B)
	draw_set_transform_matrix(base * Transform2D(0, Vector2(sc, sc), 0, c - c * sc))
	var r := Rect2(c.x - w / 2 - 22, c.y - 40, w + 56, 80)
	var sb := StyleBoxFlat.new(); sb.bg_color = Color(12 / 255.0, 14 / 255.0, 12 / 255.0, 0.7 * k); sb.set_corner_radius_all(50)
	sb.shadow_color = Color(12 / 255.0, 14 / 255.0, 12 / 255.0, 0.35 * k); sb.shadow_size = 12
	draw_style_box(sb, r)
	var x := c.x - w / 2
	var sr := Rect2(x, c.y - 30, 60, 60)
	ui.seal(self, sr, m[0], 36, m[2])
	x += 60 + 12
	x += ui.stext(self, bf, Vector2(x, c.y + 9), m[1], 26, Color("#f0b8a6") if m[2] == "hol" else Color("#f3e3b8")) + 12
	ui.stext(self, ef, Vector2(x, c.y + 6), m[3], 16, Color("#e9dcbc"))
	draw_set_transform_matrix(base)
