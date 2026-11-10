extends Node2D
## 战斗舞台（layer 10，世界坐标 = 960×540 画布坐标，镜头＋震屏作用于本节点变换）。
## 对应原版 battle.js drawBattle 的世界层部分：bstage.js drawBg/stageActive/drawFront/gradeWorld/vignette、
## bui.js drawIntentLines/drawUnitUI/drawShieldRow/drawFloats、bfx.js drawAll/drawParts/drawBreakFlash、vfx.js draw 的合成。
## 子节点顺序即绘制顺序：bg → units → fx（压暗＋像素层）→ glow（加色光源层）→ top（粒子、前景、调色、单位 UI、浮字、破势闪）。

const W := 960.0
const H := 540.0
const PX := 3.0
const BLEED := 28.0
const UnitNode := preload("res://scripts/battle/unit_node.gd")
const BD := preload("res://scripts/battle/bdraw.gd")

var bt
var bg_node: Node2D
var units_node: Node2D
var fx_node: Node2D
var glow_node: Node2D
var top_node: Node2D
var grade_node: Node2D  # bstage.js gradeWorld 的 soft-light 调色（屏幕纹理着色器）
var ui_node: Node2D     # 暗角、单位 UI、浮字、破势闪与小印
var nodes := {}       # u.id → UnitNode
var _shake_last := 0.0
var _st_t := 0.0
var _pacc := 0.0
var _plast := 0.0
# 前景（bstage.js drawFront）
var fparts := []
var f_last := 0.0
var mist_tex: ImageTexture
var _atmo = null

static func D() -> Dictionary: return Stats.defs()
static func bb_name(k) -> String:
	var s := str(k if k != null else "")
	var re := RegEx.new(); re.compile("^(bb|bg|m)_")
	s = re.sub(s, "")
	var re2 := RegEx.new(); re2.compile("_v\\d+$")
	return re2.sub(s, "")
## bstage.js assetFor：剧情传的背景键 → 氛围版文件
static func asset_for(bg) -> String: return str(D().BB_ASSET.get(bb_name(bg), ""))

func scene_of() -> String:
	var n := bb_name(bt.B.bg if bt.B else "")
	if n == "" and G.S: n = bb_name(G.S.get("scene", ""))
	return n if n != "" else "fallback"
func cfg() -> Dictionary:
	var sc: Dictionary = D().STAGE_SC
	return sc.get(scene_of(), sc.fallback)
func atmo(): return _atmo

func _ready() -> void:
	bg_node = Node2D.new(); add_child(bg_node); bg_node.draw.connect(_draw_bg)
	bg_node.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	units_node = Node2D.new(); add_child(units_node)
	fx_node = Node2D.new(); add_child(fx_node); fx_node.draw.connect(_draw_fx)
	glow_node = Node2D.new(); add_child(glow_node); glow_node.draw.connect(_draw_glow)
	var m := CanvasItemMaterial.new(); m.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD; glow_node.material = m
	top_node = Node2D.new(); add_child(top_node); top_node.draw.connect(_draw_top)
	grade_node = Node2D.new(); add_child(grade_node); grade_node.draw.connect(_draw_grade)
	var gm := ShaderMaterial.new(); gm.shader = preload("res://shaders/battle_grade.gdshader"); grade_node.material = gm
	ui_node = Node2D.new(); add_child(ui_node); ui_node.draw.connect(_draw_ui)
	top_node.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST; ui_node.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	for u in bt.B.units:
		var n := UnitNode.new(bt, u); nodes[u.id] = n; units_node.add_child(n)
	_build_mist()

func _process(_d: float) -> void:
	var B = bt.B
	if B == null: return
	var now: float = bt.pn()
	bt.cam.update(now)
	# 震屏（battle.js shakeStep：镜头变换之后平移）
	var dt := clampf(now - _shake_last, 0, 100) if _shake_last else 1000.0 / 60
	_shake_last = now
	var sh := Vector2.ZERO
	if B.shake > 0:
		var s := now / 1000.0
		sh = Vector2(B.shake * sin(s * PI * 2 * 29), B.shake * 0.6 * sin(s * PI * 2 * 21 + 1.3))
		B.shake *= pow(0.85, dt / (1000.0 / 60))
		if B.shake < 0.5: B.shake = 0.0
	transform = bt.cam.xform() * Transform2D(0, sh)
	_stage_active(now)
	var key := asset_for(B.bg)
	_atmo = cfg().get("atmo") if key != "" and key.contains("_atmo_") and Assets.tex_ready(key) != null else null
	# 单位：按「站位 y + 位移 y」排序（bfx.js drawAll）
	var t: float = bt.bt_now()
	var L := []
	for u in B.units:
		var n = nodes.get(u.id)
		if n == null: continue
		n.tick(t); L.append(n)
	L.sort_custom(func(a, b): return a.u.y + a.o.gy < b.u.y + b.o.gy)
	for i in L.size(): units_node.move_child(L[i], i)
	bt.vfx.step()
	_hover_pick()
	bg_node.queue_redraw(); fx_node.queue_redraw(); glow_node.queue_redraw(); top_node.queue_redraw(); grade_node.queue_redraw(); ui_node.queue_redraw()

## battle.js drawBattle 末尾：悬停选择目标
func _hover_pick() -> void:
	var B = bt.B
	if B.tgtList != null and B.hover != null and not B.tgtAll and B.hover != B.get("lastHover"):
		B.lastHover = B.hover
		var h = bt.rules.unit_at(B.hover.x, B.hover.y)
		if h != null and bt.rules.has(B.tgtList, h) and not is_same(B.tgtList[B.tsel], h):
			B.tsel = bt.rules.idx(B.tgtList, h)
			if B.redraw.is_valid(): B.redraw.call()

## bstage.js stageActive：当前行动者向敌方跨出一步（stepO → -30）
func _stage_active(now: float) -> void:
	var B = bt.B
	var dt := minf(50, now - (_st_t if _st_t else now)); _st_t = now
	for u in B.allies:
		if u.get("bx") == null: continue
		var want := -30.0 if is_same(B.cur, u) and u.hp > 0 and not u.get("stationarySkill") else 0.0
		u.stepO += (want - u.stepO) * minf(1, dt / 90)
		if absf(want - u.stepO) < 0.3: u.stepO = want
		u.x = u.bx + u.stepO

# ── 背景（bstage.js build/drawBg：氛围版只叠上下压暗与左右框景；回退图另压暗、薄雾带）──
func _draw_bg() -> void:
	var B = bt.B
	if B == null: return
	var C := cfg()
	var key := asset_for(B.bg)
	var tex: Texture2D = Assets.tex_ready(key) if key != "" else null
	var fb := tex == null
	if fb: tex = Assets.tex_ready(B.bg) if Assets.has(B.bg) else null
	var r := Rect2(-BLEED, -BLEED, W + BLEED * 2, H + BLEED * 2)
	if tex: bg_node.draw_texture_rect(tex, r, false)
	else: bg_node.draw_rect(r, Color("#1d1812"))
	var is_atmo := not fb and key.contains("_atmo_")
	if fb: bg_node.draw_rect(r, Color(10 / 255.0, 8 / 255.0, 14 / 255.0, C.dark))
	var tn: Array = C.tint
	bg_node.draw_rect(r, Color8(tn[0], tn[1], tn[2], int(tn[3] * 255 * 0.5)))
	var d := Color(6 / 255.0, 4 / 255.0, 10 / 255.0)
	Paint.grad(bg_node, r, [[0.0, Color(d, 0.3)], [0.25, Color(d, 0.06)], [0.55, Color(d, 0)], [0.8, Color(d, 0.04)], [1.0, Color(d, 0.32)]], false)
	if not is_atmo:
		var hz: float = -BLEED + BLEED + H * float(C.get("hz", 0.57))
		var mc: Array = C.mist; var m := Color8(mc[0], mc[1], mc[2])
		Paint.grad(bg_node, Rect2(-BLEED, hz - 70, r.size.x, 110), [[0.0, Color(m, 0)], [0.62 * 110 / 110.0, Color(m, 0.16)], [1.0, Color(m, 0)]], false)
	var s2 := Color(4 / 255.0, 3 / 255.0, 8 / 255.0)
	Paint.grad(bg_node, r, [[0.0, Color(s2, 0.3)], [0.12, Color(s2, 0)], [0.88, Color(s2, 0)], [1.0, Color(s2, 0.3)]], true)
	if _atmo == null: _draw_pools(C)
	_draw_active_glow()
	_draw_intent_lines()

## 角色脚下柔和光斑（叠加提亮；原版 lighter 合成，这里用半透明近似）
func _draw_pools(C: Dictionary) -> void:
	var pc: Array = C.pool; var col := Color8(pc[0], pc[1], pc[2])
	for u in bt.B.units:
		if u.hp <= 0 and u.side == "foe": continue
		var h: float = bt.rules.unit_h(u); var w := maxf(110, h * 0.9) * (1.0 if u.hp > 0 else 0.7)
		var a: float = (1.0 if u.hp > 0 else 0.4) * (0.75 + 0.25 * float(u.get("depth", 1.0)))
		_soft_ellipse(bg_node, Vector2(u.x, u.y), w / 2, w * 0.15, [[0.0, Color(col, 0.34 * a)], [0.45, Color(col, 0.14 * a)], [1.0, Color(col, 0)]])

## 径向渐变椭圆（多圈同心近似）
func _soft_ellipse(ci: CanvasItem, c: Vector2, rx: float, ry: float, stops: Array) -> void:
	var n := 14
	for i in range(n, 0, -1):
		var k := float(i) / n
		var col: Color = stops[0][1]
		for j in stops.size() - 1:
			if k >= stops[j][0] and k <= stops[j + 1][0]:
				var f: float = (k - stops[j][0]) / maxf(0.0001, stops[j + 1][0] - stops[j][0])
				col = stops[j][1].lerp(stops[j + 1][1], f)
		var pts := PackedVector2Array()
		for q in 24: pts.append(c + Vector2(cos(q / 24.0 * TAU) * rx * k, sin(q / 24.0 * TAU) * ry * k))
		ci.draw_colored_polygon(pts, Color(col, col.a / n * 2.2))

## bstage.js stageActive 后半：我方当前行动者脚下金色光
func _draw_active_glow() -> void:
	var a = bt.B.cur
	if a == null or a.side != "ally" or a.hp <= 0: return
	var r: float = bt.rules.unit_h(a) * 0.42; var p := 0.75 + 0.25 * sin(bt.pn() / 260)
	_soft_ellipse(bg_node, Vector2(a.x, a.y), r, r * 0.28, [[0.0, Color(1, 214 / 255.0, 120 / 255.0, 0.42 * p)], [0.6, Color(1, 180 / 255.0, 70 / 255.0, 0.16 * p)], [1.0, Color(1, 160 / 255.0, 60 / 255.0, 0)]])

## bui.js drawIntentLines：朱砂虚线（当前选中目标的敌人 / 悬停的敌人 / 全体攻击）
func _draw_intent_lines() -> void:
	var B = bt.B
	if B.cur == null or B.cur.side != "ally": return
	var now: float = bt.pn()
	for f in B.foes:
		var it = f.get("intent")
		if it == null or f.hp <= 0 or f.get("broken") or it.get("charge"): continue
		var sel: bool = B.tgtList != null and bt.rules.has(B.tgtList, f) and (B.tgtAll or is_same(B.tgtList[B.tsel], f))
		if not it.get("all") and not sel and not f.get("_buiHov"): continue
		var ts: Array = bt.rules.alive_of("ally") if it.get("all") else ([it.tgt] if it.get("tgt") and it.tgt.hp > 0 else [])
		for t in ts:
			var p0 := Vector2(f.x, f.y - bt.rules.unit_h(f) * 0.95); var p1 := Vector2(t.x, t.y - bt.rules.unit_h(t) * 0.95)
			var m := Vector2((p0.x + p1.x) / 2, minf(p0.y, p1.y) - 60)
			var col := Color(214 / 255.0, 58 / 255.0, 34 / 255.0, 0.5) if it.get("all") else Color(230 / 255.0, 110 / 255.0, 80 / 255.0, 0.42)
			_dash_quad(bg_node, p0, m, p1, col, now)

## 二次曲线虚线：线段 3、间隔 7，dashOffset=-now/40
func _dash_quad(ci: CanvasItem, a: Vector2, c: Vector2, b: Vector2, col: Color, now: float) -> void:
	var pts := []
	var n := 48
	for i in n + 1:
		var t := float(i) / n
		pts.append(a * (1 - t) * (1 - t) + c * 2 * t * (1 - t) + b * t * t)
	var dist := fposmod(now / 40.0, 10.0)
	for i in n:
		var p: Vector2 = pts[i]; var q: Vector2 = pts[i + 1]; var l := p.distance_to(q)
		var s := 0.0
		while s < l:
			var ph := fposmod(dist + s, 10.0)
			var run := (3.0 - ph) if ph < 3 else (10.0 - ph)
			var e := minf(l, s + run)
			if ph < 3: ci.draw_line(p.lerp(q, s / l), p.lerp(q, e / l), col, 2.0, true)
			s = e + 0.0001
		dist += l

# ── 特效层（vfx.js draw 的合成：压暗 → 像素层；光源层另走加色节点）──
func _draw_fx() -> void:
	var vf = bt.vfx
	if vf.dim_a > 0: fx_node.draw_rect(Rect2(-W, -H, W * 3, H * 3), Color(6 / 255.0, 3 / 255.0, 12 / 255.0, vf.dim_a))
	var q: float = vf.Q
	for e in vf.buf_px: fx_node.draw_rect(Rect2(e[0].x * q, e[0].y * q, q, q), e[1])
	for e in vf.buf_sp:
		var r: Rect2 = e[1]
		fx_node.draw_texture_rect_region(e[0], Rect2(r.position * q, r.size * q), e[2], Color(1, 1, 1, e[3]))
	# qihe-faction-clash.js：VFX.draw 之后画交锋状态标记
	var L = bt.B.opt.get("storyLesson") if bt.B else null
	if L != null and L.has_method("draw_marks"): L.draw_marks(fx_node)

func _draw_glow() -> void:
	var vf = bt.vfx
	var q: float = vf.Q
	# 像素层的辉光：同色块放大 3 倍、低透明（近似原版 1/8 分辨率模糊层 ×.78）
	for e in vf.buf_px:
		var c: Color = e[1]
		glow_node.draw_rect(Rect2((e[0].x - 1) * q, (e[0].y - 1) * q, q * 3, q * 3), Color(c, 0.12))
	for e in vf.buf_gl:
		var r: Rect2 = e[0]
		glow_node.draw_rect(Rect2(r.position * q, r.size * q), Color(e[1], e[1].a * 0.75))

# ── 顶层：旧粒子、前景、调色、单位 UI、浮字、破势闪 ──
func _draw_top() -> void:
	var B = bt.B
	if B == null: return
	var vf = bt.vfx
	if vf.flash.a > 0.005: top_node.draw_rect(Rect2(-W, -H, W * 3, H * 3), Color(vf.flash.c, vf.flash.a))
	_draw_parts()
	_draw_front(bt.pn())

## bstage.js gradeWorld 第一步：cfg().tint 以 soft-light、alpha .8 叠满全场（着色器见 battle_grade.gdshader）
func _draw_grade() -> void:
	if bt.B == null: return
	var t: Array = cfg().tint
	grade_node.draw_rect(Rect2(-W, -H, W * 3, H * 3), Color8(t[0], t[1], t[2], int(clampf(t[3] * 0.8, 0, 1) * 255)))

## 调色之后：暗角 → 单位 UI → 浮字 → 破势闪（battle.js drawBattle 顺序）
func _draw_ui() -> void:
	var B = bt.B
	if B == null: return
	if _atmo != null: _vignette(float(_atmo.get("vig", 0.0)))
	var now: float = bt.pn()
	for u in B.units:
		_ghost_tick(u, now)
		if u.hp > 0: _draw_unit_ui(u, now)
	_draw_floats(now)
	_draw_break_flash()

## bui.js ghostTick：残血条
func _ghost_tick(u: Dictionary, now: float) -> void:
	if u.get("gh") == null or u.gh < u.hp: u.gh = float(u.hp)
	if u.gh > u.hp and now - u.get("ghT", 0.0) > 400: u.gh = maxf(u.hp, u.gh - u.mhp * 0.012)

## bfx.js drawParts：B.parts（破势碎片、治疗光点）像素块，步进走 BT
func _draw_parts() -> void:
	var B = bt.B
	var t: float = bt.bt_now()
	var dt := clampf(t - _plast, 0, 50) if _plast else 16.0
	_plast = t; _pacc += dt
	var n := floori(_pacc / (1000.0 / 60)); _pacc -= n * (1000.0 / 60)
	if n > 3: n = 3; _pacc = 0
	for p in B.parts:
		for s in n:
			p.x += p.vx; p.y += p.vy; p.vy += 0.0 if p.get("glow") else 0.25; p.life -= 1; p.rot = p.get("rot", 0.0) + p.get("vr", 0.0)
	for p in B.parts:
		var a := minf(1, p.life / 25.0)
		if a <= 0: continue
		var x := snappedf(p.x, PX); var y := snappedf(p.y, PX); var c: Color = p.c
		if p.get("glow"):
			top_node.draw_rect(Rect2(x - PX, y - PX, PX * 3, PX * 3), Color(c, a * 0.3))
			top_node.draw_rect(Rect2(x, y, PX, PX), Color(c, a))
			if p.r > 3: top_node.draw_rect(Rect2(x, y - PX, PX, PX), Color(c, a))
		else:
			var big: bool = p.r > 5
			top_node.draw_rect(Rect2(x - 1, y - 1, (PX * 2 if big else PX) + 2, PX + 2), Color(10 / 255.0, 16 / 255.0, 30 / 255.0, 0.8 * a))
			top_node.draw_rect(Rect2(x, y, PX * 2 if big else PX, PX), Color(c, a))
			var cr := cos(p.get("rot", 0.0))
			top_node.draw_rect(Rect2(x + (PX * 2 if big else PX) if cr > 0 else x - PX, y - PX if cr > 0 else y + PX, PX, PX), Color(c, a))
	B.parts = B.parts.filter(func(p): return p.life > 0)

# ── 前景（bstage.js spawn/resetFx/mist/drawFront）──
const LWF := W / PX
const LHF := H / PX
func _spawn(type: String, init: bool) -> Dictionary:
	var R := func(a: float, b: float) -> float: return a + randf() * (b - a)
	var p := {"type": type, "x": R.call(-10, LWF + 10), "y": 0.0, "vx": 0.0, "vy": 0.0, "ph": R.call(0, 6.28), "life": R.call(6, 14)}
	if type == "ember":
		p.y = R.call(LHF * 0.3, LHF) if init else LHF + R.call(0, 6); p.vx = R.call(-0.8, 1.6); p.vy = -R.call(2.5, 6); p.c = Color8(255, 190, 90) if randf() < 0.5 else Color8(255, 120, 50)
	elif type == "leaf":
		p.y = R.call(0, LHF) if init else -R.call(2, 10); p.x = p.x if init else R.call(-40, LWF); p.vx = R.call(3, 7); p.vy = R.call(2, 4.5)
		p.c = [Color8(196, 120, 50), Color8(160, 90, 40), Color8(210, 160, 70)][randi() % 3]
	elif type == "fly":
		p.y = R.call(LHF * 0.45, LHF * 0.95); p.vx = R.call(-1.5, 1.5); p.vy = R.call(-1, 1); p.c = Color8(210, 255, 150)
	else:
		p.y = R.call(LHF * 0.2, LHF); p.vx = R.call(-1.2, 1.2) + 0.8; p.vy = R.call(-0.6, 0.4); p.c = Color8(235, 220, 190)
	return p

func _build_mist() -> void:
	var mc: Array = cfg().mist
	var w := int(LWF * 2); var h := 40
	var im := Image.create(w, h, false, Image.FORMAT_RGBA8)
	for j in h:
		for i in w:
			var a := float(i) / w * TAU
			var n := 0.5 + 0.25 * sin(a * 3 + j * 0.15) + 0.15 * sin(a * 7 - j * 0.3 + 1.3) + 0.1 * sin(a * 13 + j * 0.5 + 2.1)
			var v := pow(sin(PI * j / h), 1.4) * n
			var q := minf(1, v * 1.25); var lvl := roundf(q * 4) / 4
			im.set_pixel(i, j, Color8(mc[0], mc[1], mc[2], int(lvl * 100)))
	mist_tex = ImageTexture.create_from_image(im)
	fparts = []
	var f: Array = cfg().fx
	for i in 34: fparts.append(_spawn(f[i % f.size()] if f.size() else "dust", true))

## bstage.js drawFront：两层反向滚动的薄雾带 + 像素粒子（ember/leaf/fly/dust），按秒推进
func _draw_front(now: float) -> void:
	var dt := minf(0.05, maxf(0, (now - f_last) / 1000.0)) if f_last else 0.0
	f_last = now
	var f: Array = cfg().fx
	var ci := top_node
	if mist_tex:
		var mw := mist_tex.get_width() * PX; var mh := mist_tex.get_height() * PX
		for L in [[6.0, H - mh * 0.75, 0.55], [-9.0, H - mh * 0.45, 0.4]]:
			var off := fposmod(now / 1000.0 * L[0], mw)
			var ox := roundf(-off / PX) * PX; var y := roundf(L[1])
			ci.draw_texture_rect(mist_tex, Rect2(ox, y, mw, mh), false, Color(1, 1, 1, L[2]))
			ci.draw_texture_rect(mist_tex, Rect2(ox + mw, y, mw, mh), false, Color(1, 1, 1, L[2]))
	for i in fparts.size():
		var p: Dictionary = fparts[i]
		p.ph += dt * 2; p.life -= dt
		match p.type:
			"leaf": p.x += (p.vx + sin(p.ph) * 3) * dt; p.y += p.vy * dt
			"ember": p.x += (p.vx + sin(p.ph * 1.7) * 1.2) * dt; p.y += p.vy * dt
			"fly": p.x += (p.vx + sin(p.ph * 0.8) * 1.5) * dt; p.y += (p.vy + cos(p.ph * 0.6) * 1) * dt
			_: p.x += (p.vx + sin(p.ph * 0.5) * 0.6) * dt; p.y += (p.vy + cos(p.ph * 0.4) * 0.4) * dt
		if p.life <= 0 or p.y < -4 or p.y > LHF + 12 or p.x < -50 or p.x > LWF + 50:
			fparts[i] = _spawn(f[i % f.size()] if f.size() else "dust", false); continue
		var X := roundf(p.x) * PX; var Y := roundf(p.y) * PX; var fade := minf(1, p.life / 2)
		var c: Color = p.c
		match p.type:
			"ember":
				var fl := 0.55 + 0.45 * sin(p.ph * 9)
				ci.draw_rect(Rect2(X, Y, PX, PX), Color(c, fade * fl))
				ci.draw_rect(Rect2(X, Y + PX, PX, PX), Color(c, fade * fl * 0.35))
			"leaf":
				var s := sin(p.ph * 2) > 0
				ci.draw_rect(Rect2(X, Y, PX * (2 if s else 1), PX), Color(c, fade * 0.85))
				if not s: ci.draw_rect(Rect2(X, Y + PX, PX, PX), Color(c, fade * 0.85))
			"fly":
				var fl2 := maxf(0, sin(p.ph * 2.3))
				ci.draw_rect(Rect2(X, Y, PX, PX), Color(c, fade * fl2))
				ci.draw_rect(Rect2(X - PX, Y, PX * 3, PX), Color(c, fade * fl2 * 0.25))
				ci.draw_rect(Rect2(X, Y - PX, PX, PX * 3), Color(c, fade * fl2 * 0.25))
			_:
				ci.draw_rect(Rect2(X, Y, PX, PX), Color(c, fade * (0.25 + 0.2 * sin(p.ph))))

## bstage.js vignette：径向暗角，中心在视野 55% 高处；0.45r 处透明 → 1.05r 处 rgba(6,4,8,s)
var _vig_tex: GradientTexture2D
func _vignette(s: float) -> void:
	if s <= 0: return
	if _vig_tex == null:
		var gr := Gradient.new()
		gr.offsets = PackedFloat32Array([0.45 / 1.05, 1.0])
		gr.colors = PackedColorArray([Color(6 / 255.0, 4 / 255.0, 8 / 255.0, 0), Color(6 / 255.0, 4 / 255.0, 8 / 255.0, 1)])
		_vig_tex = GradientTexture2D.new(); _vig_tex.gradient = gr; _vig_tex.width = 256; _vig_tex.height = 256
		_vig_tex.fill = GradientTexture2D.FILL_RADIAL; _vig_tex.fill_from = Vector2(0.5, 0.5); _vig_tex.fill_to = Vector2(1.0, 0.5)
	var p0: Vector2 = bt.cam.to_world(0, 0); var p1: Vector2 = bt.cam.to_world(W, H)
	var c := Vector2((p0.x + p1.x) / 2, p0.y + (p1.y - p0.y) * 0.55)
	var R := (p1 - p0).length() / 2 * 1.05
	ui_node.draw_texture_rect(_vig_tex, Rect2(c.x - R, c.y - R, R * 2, R * 2), false, Color(1, 1, 1, s))

# ── 单位 UI（bui.js drawUnitUI + v4 drawShieldRow）──
func _is_tg(u: Dictionary) -> bool:
	var B = bt.B
	return B.tgtList != null and bt.rules.has(B.tgtList, u) and (B.tgtAll or is_same(B.tgtList[B.tsel], u))

static func wshort(w: String) -> String: return "暗" if w == "暗器" else w

func _draw_unit_ui(u: Dictionary, now: float) -> void:
	var B = bt.B; var ci := ui_node
	var h: float = bt.rules.unit_h(u); var x: float = u.x; var y: float = u.y
	var tg := _is_tg(u)
	u._buiHov = B.hover != null and is_same(bt.rules.unit_at(B.hover.x, B.hover.y), u)
	var top := y - h
	if u.side == "foe" and u.hp > 0:
		_shield_row(u, now)
		var it = u.get("intent")
		if it != null and not u.get("broken"):
			var hot: bool = it.get("charge", false) or it.get("all", false)
			var bs := 22.0 if hot else 19.0
			var iy := roundf(maxf(96, y - h - bs - 8)); top = iy
			var ix := roundf(x - bs / 2)
			if hot: ci.draw_circle(Vector2(ix + bs / 2, iy + bs / 2), bs / 2 + 4, Color(1, 80 / 255.0, 40 / 255.0, 0.22))
			if it.get("charge"): BD.blot(ci, "蓄", Color("#e0402a") if int(now / 220) % 2 else Color("#b3261e"), ix, iy, bs)
			elif it.get("all"): BD.blot(ci, "群", Color("#b3261e"), ix, iy, bs)
			else:
				var wt: String = Stats.bsk(it.get("sk", "")).get("t", "刀")
				var ch := "扑" if B.opt.get("storyLesson") and u.art == "wilddog" else wshort(wt if wt != "" else "刀")
				BD.blot_o(ci, ch, "#2a1d14", ix, iy, bs, {"fg": "#eadcbc", "ring": "rgba(200,170,120,.7)"})
			# 悬停或被选为目标时显示意图墨签
			if tg or u._buiHov:
				var lab: String = bt.rules.intent_label(u)
				var tw := BD.text_w(lab, 14, BD.fs()) + 26
				var ly := iy - 30 if iy - 30 >= 90 else iy + bs + 4
				if ly < iy: top = ly
				var bw := roundf(tw / 2) * 2
				BD.sw(ci, BD.sw_intent(int(bw), hot), Rect2(roundf(x - bw / 2), ly, bw, 26))
				BD.text_c(ci, lab, x, ly + 13, Color("#ffc8b0") if hot else Color("#eee2c6"), 14, BD.fs(), Color("#0d0806"))
	if tg:
		var fo: bool = u.side == "foe"
		var col := Color("#e8402a") if fo else Color("#8fe0a8")
		var bob := (int(now / 180) % 2) * 3
		var by := roundf(top - 6 - 22 - bob)
		if fo and by < 86: BD.pointer(ci, col, roundf(x - 24 - 22 - bob), roundf(top + 10), 22, "r")
		else: BD.pointer(ci, col, roundf(x - 11), maxf(70, by), 22, "d")

func _shield_row(u: Dictionary, t: float) -> void:
	var B = bt.B; var ci := ui_node
	var n: int = u.weak.size(); var cs := 15.0; var gap := 3.0
	var x: float = u.x; var y: float = u.y + 8
	var tg := _is_tg(u)
	var pv = null
	if B.pv is Callable and B.pv.is_valid() and bt.rules.has(B.tgtList, u): pv = B.pv.call(B.bpUse)
	var w := n * (cs + gap) - gap
	var bx := roundf(x - w / 2 + 10); var by := y + 14
	var broken: bool = u.get("broken", false)
	# 盾牌
	var sx := bx - 20; var sy := by - 4
	var hit := maxf(0, 1 - (t - u.shieldHit) / 300) if u.get("shieldHit") else 0.0
	var sc := (1 + hit * 0.35) * 1.3
	ci.draw_set_transform(Vector2(sx + 6, sy + 8), 0, Vector2(sc, sc))
	var pts := PackedVector2Array([Vector2(-9, -10), Vector2(9, -10), Vector2(9, 1)])
	for i in range(1, 7): pts.append(_quad(Vector2(9, 1), Vector2(9, 8), Vector2(0, 12), i / 6.0))
	for i in range(1, 7): pts.append(_quad(Vector2(0, 12), Vector2(-9, 8), Vector2(-9, 1), i / 6.0))
	ci.draw_colored_polygon(pts, Color(80 / 255.0, 70 / 255.0, 70 / 255.0, 0.8) if broken else Color(40 / 255.0, 84 / 255.0, 130 / 255.0, 0.82))
	pts.append(pts[0])
	ci.draw_polyline(pts, Color("#aaa") if broken else Color(200 / 255.0, 232 / 255.0, 1, 0.9), 1.2, true)
	var sf := UI.serif_bold if "serif_bold" in UI and UI.serif_bold else BD.fs()
	var st := "破" if broken else str(u.shield)
	ci.draw_string(sf, Vector2(-BD.text_w(st, 12, sf) / 2, 4), st, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color.WHITE)
	ci.draw_set_transform(Vector2.ZERO)
	# 「弱点」
	ci.draw_string(BD.fs(), Vector2(bx + 1, by - 3), "弱点", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0, 0, 0, 0.6))
	ci.draw_string(BD.fs(), Vector2(bx, by - 4), "弱点", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(240 / 255.0, 230 / 255.0, 210 / 255.0, 0.9))
	var wcol: Dictionary = D().WCOL
	for i in n:
		var wk: String = u.weak[i]
		var cx := bx + i * (cs + gap)
		var kn: bool = u.known.has(wk)
		var hot: bool = kn and pv != null and (pv.get("t") == wk or pv.get("e") == wk)
		ci.draw_rect(Rect2(cx, by, cs, cs), Color(40 / 255.0, 40 / 255.0, 40 / 255.0, 0.75) if broken else Color(14 / 255.0, 12 / 255.0, 18 / 255.0, 0.78))
		var sc2: Color
		if hot: sc2 = Color(1, 226 / 255.0, 90 / 255.0, 0.6 + 0.4 * sin(t / 110))
		elif kn: sc2 = Color(wcol.get(wk, "#ccc"))
		else: sc2 = Color(200 / 255.0, 200 / 255.0, 200 / 255.0, 0.55)
		var lw := 2.0 if hot else 1.0
		ci.draw_rect(Rect2(cx + lw / 2, by + lw / 2, cs - lw, cs - lw), sc2, false, lw)
		if kn: BD.icon(ci, wk if D().WTYPES.has(wk) else "?", cx + 1, by + 1, cs - 2)
		else:
			var f := ThemeDB.fallback_font
			ci.draw_string(f, Vector2(cx + cs / 2 - BD.text_w("?", 11, f) / 2, by + 11.5), "?", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(230 / 255.0, 230 / 255.0, 230 / 255.0, 0.85))
	var recent: bool = u.get("ghT") != null and u.ghT and t - u.ghT < 1500
	if tg or recent or u.get("_buiHov"):
		ci.draw_rect(Rect2(bx, by + cs + 3, w, 3), Color(0, 0, 0, 0.7))
		ci.draw_rect(Rect2(bx, by + cs + 3, w * float(u.hp) / u.mhp, 3), Color("#d0402c"))

static func _quad(a: Vector2, c: Vector2, b: Vector2, k: float) -> Vector2:
	return a.lerp(c, k).lerp(c.lerp(b, k), k)

# ── 浮字（bui.js drawFloats）──
const BO := [0, -12, -20, -24, -22, -20]
var _re_num: RegEx
var _re_bp: RegEx
func _draw_floats(now: float) -> void:
	var B = bt.B; var ci := ui_node
	if _re_num == null:
		_re_num = RegEx.new(); _re_num.compile("^\\+?\\d+$")
		_re_bp = RegEx.new(); _re_bp.compile("^蓄势\\s*(◆+)$")
	for f in B.fx:
		var k: float = (now - f.t0) / f.life
		if k >= 1: continue
		var e: float = now - f.t0
		var fade := (1 - k) / 0.28 if k > 0.72 else 1.0
		var c: Color = f.c if f.c is Color else Color("#f3e6c8")
		if f.get("kind") == "weak":
			var y: float = f.y - minf(k * 3, 1) * 16
			var sc := 1.35 - e / 90 * 0.35 if e < 90 else 1.0
			if e < 260: ci.draw_arc(Vector2(f.x, y), 16 + e / 7, 0, TAU, 40, Color(1, 226 / 255.0, 90 / 255.0, 0.55 * (1 - e / 260) * fade), 2, true)
			BD.text_c(ci, "弱点", f.x, y, Color("#ffe25a"), 30, BD.fb(), Color("#5a1606"), sc, fade)
			continue
		var bm := _re_bp.search(str(f.t))
		if bm:
			var y2: float = f.y - k * 30
			var sz: int = f.size
			var tw := BD.text_w("蓄势", sz); var nn := bm.get_string(1).length(); var cs := 18.0
			var w := tw + 4 + nn * (cs + 2)
			BD.text_c(ci, "蓄势", f.x - w / 2 + tw / 2, y2, Color("#ffcf73"), sz, BD.fb(), Color(0.05, 0.03, 0.02, 0.9), 1.0, fade)
			for i in nn:
				_coin_a(ci, f.x - w / 2 + tw + 4 + i * (cs + 2), y2 - cs / 2, cs, fade)
			continue
		if _re_num.search(str(f.t)):
			var y3: float = f.y + (BO[mini(5, int(e / 50))] if e < 300 else -20 - (e - 300) * 0.025)
			var big: bool = f.size >= 34
			var sc3 := 1.3 if e < 70 else 1.0
			var white := e < 90 and int(e / 30) % 2 == 0
			BD.text_c(ci, str(f.t), f.x, y3, Color.WHITE if white else (f.c if f.c is Color else Color("#fff3e0")), 44 if big else 34, BD.fb(), Color(0.05, 0.03, 0.02, 0.9), sc3, fade)
			continue
		var y4: float = f.y - k * 30; var sc4 := 1.0
		if f.get("pop"):
			y4 = f.y - minf(k * 3, 1) * 16
			sc4 = 0.6 + k / 0.15 * 0.6 if k < 0.15 else 1.2 - minf(0.2, k - 0.15)
		BD.text_c(ci, str(f.t), f.x, y4, c, roundi(f.size * 1.05), BD.fb(), Color(0.05, 0.03, 0.02, 0.9), sc4, fade)
	B.fx = B.fx.filter(func(f): return now - f.t0 < f.life)

## 带透明度的铜钱：原版浮字「蓄势◆」用 coin('use',18)（cs=18）
func _coin_a(ci: CanvasItem, x: float, y: float, sz: float, a: float) -> void:
	if BD.bui(ci, "coin", ["use", roundi(sz)], Rect2(x, y, sz, sz), a): return
	BD.coin(ci, "use", x, y, sz, a)

# ── 破势（bfx.js drawBreakFlash / shieldShatter；bposhi.js drawSeals）──
const SHIELD := ["01111111110", "11111111111", "11111111111", "11111111111", "11111111111", "11111111111", "01111111110", "00111111100", "00011111000", "00001110000", "00000100000"]
const CRACK := [[5, 0], [5, 1], [4, 2], [5, 3], [6, 4], [5, 5], [4, 6], [5, 7], [5, 8]]

func _draw_break_flash() -> void:
	var B = bt.B; var ci := ui_node
	var t: float = bt.bt_now(); var rt: float = bt.pn()
	for u in B.foes:
		if u.get("breakT") and rt - u.breakT < 300:
			ci.draw_rect(Rect2(-W, -H, W * 3, H * 3), Color(1, 244 / 255.0, 214 / 255.0, 0.22 * (1 - (rt - u.breakT) / 300)))
	for u in B.foes:
		if u.get("_brkFx") == null: continue
		var e: float = t - u._brkFx
		if e < 0: continue
		if e < 760: _shield_shatter(u, e)
		if e > 1300: u._brkFx = null
	_draw_seals(rt)
	if bt.screen: bt.screen.draw_world_banners(ci, rt)

static func _edge(r: int, c: int) -> bool:
	for d in [[0, 1], [0, -1], [1, 0], [-1, 0]]:
		var rr: int = r + d[0]; var cc: int = c + d[1]
		if rr < 0 or rr > 10 or cc < 0 or cc > 10 or SHIELD[rr][cc] != "1": return true
	return false

func _shield_shatter(u: Dictionary, e: float) -> void:
	var ci := ui_node; var s := 4.0
	var cx: float = u.x + u.get("ox", 0.0); var cy: float = u.y + u.get("oy", 0.0) - bt.rules.unit_h(u) * 0.62
	var sp := 1 + 0.25 * (1 - e / 90) if e < 90 else 1.0
	for r in 11:
		for c in 11:
			if SHIELD[r][c] != "1": continue
			var col: Color
			if e < 50: col = Color.WHITE
			elif _edge(r, c): col = Color("#bfe6ff")
			elif r < 4 and c < 5: col = Color("#7ab8e8")
			else: col = Color("#3a78b0")
			if e >= 40 and CRACK.has([c, r]): col = Color("#0a1a2a")
			var x := (c - 5.5) * s * sp; var y := (r - 5.5) * s * sp; var a := 1.0
			if e >= 110:
				var k := e - 110; var qx := -1.0 if c < 5.5 else 1.0; var qy := -1.0 if r < 5 else 1.0
				x += qx * (0.1 + 0.06 * (r % 3)) * k; y += qy * 0.05 * k - 0.12 * k + 0.00045 * k * k
				a = clampf(1 - (k - 260) / 220, 0, 1)
			if a <= 0: continue
			ci.draw_rect(Rect2(roundf(cx + x) - 1, roundf(cy + y) - 1, s + 2, s + 2), Color("#08101c", a))
			ci.draw_rect(Rect2(roundf(cx + x), roundf(cy + y), s, s), Color(col, a))

## bposhi.js drawSeals：破势期间头顶「破」小印（24px，出现时 1.6× 收回，之后 400ms 一跳）
func _draw_seals(t: float) -> void:
	var B = bt.B; var ci := ui_node
	var tex: Texture2D = Assets.tex_ready("fx_poshi_seal_s")
	for u in B.foes:
		if not u.get("broken") or u.hp <= 0 or u.get("_gone"): continue
		var st: float = u.get("_psT", 0.0)
		if t < st: continue
		var q := t - st
		var h: float = bt.rules.unit_h(u)
		var S0 := 24.0
		var sc := 1.6 - 0.6 * pow(q / 110, 3) if q < 110 else 1.0
		var bob := (int(t / 400) % 2) * 2
		var x: float = u.x + u.get("ox", 0.0)
		var y: float = maxf(76, u.y + u.get("oy", 0.0) - h - 22) + bob
		var w := roundf(S0 * sc)
		var a := 0.6 + q / 275 if q < 110 else 1.0
		var r := Rect2(roundf(x - w / 2), roundf(y - w / 2), w, w)
		ci.draw_rect(Rect2(r.position + Vector2(2, 2), r.size), Color(8 / 255.0, 4 / 255.0, 2 / 255.0, 0.55 * a))
		if tex: ci.draw_texture_rect(tex, r, false, Color(1, 1, 1, a))
		else:
			var rr := maxf(1, floorf(w / 16))
			ci.draw_rect(r, Color("#8a1a14", a)); ci.draw_rect(r.grow(-rr), Color("#c4261c", a))
			BD.text_c(ci, "破", r.get_center().x, r.position.y + w * 0.54, Color("#ffecd6"), roundi(w * 0.72), BD.fb(), Color(0, 0, 0, 0), 1.0, a)
