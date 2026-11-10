class_name WorldDraw
extends RefCounted
## 场景绘制：移植原版 scene.js drawScene 及其挂件（idle.js 待机、qihe-town 道具、qihe-treasure 宝箱、qihe-resources 物资点）。
## 全部在 World 节点的 _draw 里按世界坐标画；顺序与原版一致。

const SPARK := [[0, 0, 4], [-9, 6, 2], [8, -7, 2]]
const PROP_K := 0.78125
const GLOW_NEAR := 190.0
const OCC := {"alpha": 0.5, "minCover": 0.04, "maxActors": 16, "bodyW": 0.36, "cell": 6.0}

static var _idle := {}

static func ellipse(ci: CanvasItem, c: Vector2, rx: float, ry: float, col: Color, segs := 24) -> void:
	var pts := PackedVector2Array()
	for i in segs:
		var a := TAU * i / segs
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	ci.draw_colored_polygon(pts, col)

static func ellipse_line(ci: CanvasItem, c: Vector2, rx: float, ry: float, col: Color, w: float, segs := 28) -> void:
	var pts := PackedVector2Array()
	for i in segs + 1:
		var a := TAU * i / segs
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	ci.draw_polyline(pts, col, w)

## 原版 label()：18px Noto Serif SC，深色描边 3.5
static func label(ci: CanvasItem, txt: String, x: float, y: float, col := Color("#f3e2b8"), size := 18) -> void:
	var f: Font = UI.serif
	var w := f.get_string_size(txt, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var p := Vector2(x - w / 2, y)
	ci.draw_string_outline(f, p, txt, HORIZONTAL_ALIGNMENT_LEFT, -1, size, 4, Color(10 / 255.0, 6 / 255.0, 2 / 255.0, 0.85))
	ci.draw_string(f, p, txt, HORIZONTAL_ALIGNMENT_LEFT, -1, size, col)

static func draw_scene(W, t: float, fdt: float) -> void:
	var cur: Dictionary = W.cur
	var ci: CanvasItem = W
	if cur.get("under") is Callable: cur.under.call(ci, t, fdt)
	var bg := Assets.tex_ready(cur.bg) if cur.get("bg") else null
	if bg != null:
		ci.draw_texture_rect(bg, Rect2(0, 0, W.WW, W.WH), false)
	elif not cur.get("under"):
		ci.draw_rect(Rect2(0, 0, W.WW, W.WH), Color("#1d1812"))
	if cur.get("fx") is Callable: cur.fx.call(ci, t)
	draw_water(W, t, fdt)
	draw_ducks(W, t, fdt)
	draw_exits(W, t, 0)
	draw_marker(W, t)
	var near = W.nearest()
	var DL := []
	for n in W.npcs: DL.append([n.y * W.TS, 0, n])
	for w in W.wanderers: DL.append([w.y, 1, w])
	for f in W.followers: DL.append([f.y, 2, f])
	DL.append([W.player.y, 3, W.player])
	var cam: Vector2 = W.cam
	var fgi := Assets.tex_ready(cur.fg) if cur.get("fg") else null
	if fgi != null and cur.get("fgp"):
		for q in cur.fgp:
			if q[0] < cam.x + W.VW and q[0] + q[2] > cam.x and q[1] < cam.y + W.VH and q[1] + q[3] > cam.y:
				DL.append([q[4], 4, q])
	var pim := Assets.tex_ready(cur.propImg) if cur.get("propImg") else null
	var pk: float = cur.get("propK", 3) if cur.get("propK") else 3.0
	if pim != null and cur.get("props"):
		for q in cur.props:
			if q[4] < cam.x + W.VW and q[4] + q[2] * pk > cam.x and q[5] < cam.y + W.VH and q[5] + q[3] * pk > cam.y:
				DL.append([q[6], 6, q])
	DL.sort_custom(func(a, b): return a[0] < b[0])
	var occ_on: bool = cur.get("revealPlayer") == true or cur.get("occlusion") is Dictionary
	var actors := []   # 记录人形框，用于遮挡半透明
	var pa: float = W.player.alpha
	for i in DL.size():
		var e: Array = DL[i]; var o = e[2]
		match e[1]:
			0:
				var info = draw_npc(W, o, t, near)
				if info != null: actors.append(info)
			1:
				CharArt.draw_char(ci, o.sp, o.x, o.y, o.dir, o.walk, t, {"moving": o.moving, "ph": o.ph})
				actors.append(_actor(W, o.sp, o.x, o.y, o.dir, o.walk, 0.0, o.moving, false, o.ph, 1.0))
			2:
				CharArt.draw_char(ci, o.m, o.x, o.y, o.dir, o.walk, t, {"moving": o.moving, "running": o.running, "ph": o.ph, "alpha": pa})
				actors.append(_actor(W, o.m, o.x, o.y, o.dir, o.walk, 0.0, o.moving, o.running, o.ph, pa))
			3:
				if pa <= 0: continue
				var psp: String = cur.get("playerSp", "hero") if cur.get("playerSp") else G.player_sp()
				CharArt.draw_char(ci, psp, o.x, o.y, o.dir, o.walk, t, {"moving": o.moving, "running": o.running, "alpha": pa})
				actors.append(_actor(W, psp, o.x, o.y, o.dir, o.walk, 0.0, o.moving, o.running, 0.0, pa))
			4:
				draw_fg(W, fgi, o)
				if occ_on: _occ_hit(W, actors, 4, o, fgi, 0.0)
			6:
				draw_prop(ci, pim, o, pk)
				if occ_on: _occ_hit(W, actors, 6, o, pim, pk)
	if fgi != null and not cur.get("fgp"):
		draw_fg(W, fgi, [0, 0, W.WW, W.WH])
	if occ_on: _occ_ghosts(W, actors, t)
	if cur.get("over") is Callable: cur.over.call(ci, t)
	draw_exits(W, t, 1)
	W.upd_particles(t)
	draw_particles(W, t)
	draw_birds(W, t, fdt)
	draw_bubbles(W, fdt)

static func draw_prop(ci: CanvasItem, im: Texture2D, q: Array, k: float) -> void:
	ci.draw_texture_rect_region(im, Rect2(q[4], q[5], q[2] * k, q[3] * k), Rect2(q[0], q[1], q[2], q[3]))

static func draw_fg(W, im: Texture2D, q: Array) -> void:
	var k: float = im.get_width() / W.WW
	(W as CanvasItem).draw_texture_rect_region(im, Rect2(q[0], q[1], q[2], q[3]), Rect2(q[0] * k, q[1] * k, q[2] * k, q[3] * k))

# ── NPC（含道具、宝箱、物资点、木桶） ──
static func draw_npc(W, n: Dictionary, t: float, near):
	var ci: CanvasItem = W
	var TS: float = W.TS
	var x: float = n.x * TS; var y: float = n.y * TS
	if n.get("resource"):
		_draw_resource(W, n, t, near); return null
	if n.get("barrel"):
		if not n.barrel.call() and Vector2(W.player.x - x, W.player.y - y).length() < GLOW_NEAR: glint(ci, x, y - 10, t)
		if near == n: label(ci, n.name, x, y - 24)
		return null
	var chest = n.get("chest")
	if chest is Dictionary:
		var done: bool = Flow.chest_opened(chest.id)
		if chest.type == "hidden":
			if Vector2(W.player.x - x, W.player.y - y).length() < GLOW_NEAR: glint(ci, x, y - 10, t)
			if near == n: label(ci, n.name, x, y - 24)
			return null
		n.prop = "prop_qh_chest_%s_%s_20261102" % [chest.type, "open" if done else "closed"]
		var top := _draw_town_prop(W, n, near)
		if not done:
			var im := Assets.tex_ready(n.prop)
			glint(ci, x, y - ((im.get_height() if im else 50) * PROP_K) * 0.72, t)
		return null
	if n.get("prop"):
		_draw_town_prop(W, n, near)
		if not n.get("sp"): return null
	if n.get("sp"):
		var h: float = W.npc_h(n)
		var id = npc_idle(W, n, t, near)
		var dx: float = x + (id.dx if id else 0.0); var dy: float = y + (id.dy if id else 0.0)
		var dd: String = id.dir if id else n.get("dir", "d")
		var dw: float = id.walk if id else 0.0
		var dm: bool = id.moving if id else false
		CharArt.draw_char(ci, n.sp, dx, dy, dd, dw, t, {"h": h, "moving": dm, "ph": n.x * 1.7})
		if id: npc_idle_fx(W, n, t, x, y, h, near, id)
		var ty: float = y - (h * 0.42 if W.sp_key(n.sp) == "zhou" else h) - 8
		# 11-10 第四十九轮：墨印环开着时只认环上那块名牌，旁边人的头顶名字不再叠上去
		if near == n and not Npc.is_open: label(ci, n.name, x, ty)
		elif n.get("mark") is Callable and n.mark.call():
			var b := sin(t / 200) * 2
			ci.draw_circle(Vector2(x, ty - 6 + b), 10, Color("#e9a23b"))
			ci.draw_arc(Vector2(x, ty - 6 + b), 10, 0, TAU, 24, Color("#2a1a0a"), 2)
			ci.draw_string(UI.serif_bold, Vector2(x - 4, ty + b), "!", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("#2a1a0a"))
		if n.get("occlusion") == false: return null
		return _actor(W, n.sp, dx, dy, dd, dw, h, dm, false, n.x * 1.7, 1.0)
	var a := 0.45 + sin(t / 260 + n.x) * 0.4
	var col := Color(1, 226 / 255.0, 140 / 255.0, a)
	for s in SPARK:
		ci.draw_rect(Rect2(x + s[0] - s[2] / 2.0, y + s[1] - s[2] * 2, s[2], s[2] * 4), col)
		ci.draw_rect(Rect2(x + s[0] - s[2] * 2, y + s[1] - s[2] / 2.0, s[2] * 4, s[2]), col)
	if near == n: label(ci, n.name, x, y - 22)
	return null

static func _draw_town_prop(W, n: Dictionary, near) -> float:
	var ci: CanvasItem = W
	var x: float = n.x * W.TS; var y: float = n.y * W.TS; var top := y
	var im := Assets.tex_ready(n.prop)
	if im != null:
		var w := im.get_width() * PROP_K; var h := im.get_height() * PROP_K
		top = y if n.get("propTop") else y - h
		if not n.get("propTop"):
			ellipse(ci, Vector2(x, y - 2), w * 0.46, max(5.0, h * 0.07), Color(28 / 255.0, 24 / 255.0, 12 / 255.0, 0.28))
		ci.draw_texture_rect(im, Rect2(round(x - w / 2), round(top), round(w), round(h)), false)
	if not n.get("sp") and near == n: label(ci, n.name, x, top - 8)
	return top

static func glint(ci: CanvasItem, x: float, y: float, t: float) -> void:
	var a := 0.5 + sin(t / 300 + x) * 0.38
	var col := Color(150 / 255.0, 215 / 255.0, 1, a)
	for s in [[0, 0, 4], [-10, 7, 2], [9, -8, 2]]:
		ci.draw_rect(Rect2(x + s[0] - s[2] / 2.0, y + s[1] - s[2] * 2, s[2], s[2] * 4), col)
		ci.draw_rect(Rect2(x + s[0] - s[2] * 2, y + s[1] - s[2] / 2.0, s[2] * 4, s[2]), col)

static func _draw_resource(W, n: Dictionary, t: float, near) -> void:
	var ci: CanvasItem = W
	var im := Assets.tex_ready("r_qh_%s_v1" % n.kind)
	if im == null: return
	var x: float = n.x * W.TS; var y: float = n.y * W.TS
	ci.draw_texture_rect(im, Rect2(round(x - 32), round(y - 60), 64, 64), false)
	if near == n:
		label(ci, "%s ×%d" % [n.name, n.amount], x, min(y - 64, W.player.y - W.CHAR_H - 16), Color("#e7e2b5"))
	elif Vector2(W.player.x - x, W.player.y - y).length() < 220:
		ci.draw_rect(Rect2(x + 12, y - 30, 3, 3), Color("#e4d9a3", 0.35 + 0.15 * sin(t / 650)))

# ── 待机活动（idle.js） ──
const IDLE_ROLE := {
	"smith": {"act": "hammer", "emo": ["嘿哈！", "好铁！"], "w": {"look": 1, "step": 0, "nod": 0, "emo": 1}},
	"lady": {"act": "steam", "emo": ["♪", "来碗茶？", "雨前龙井～"], "w": {"look": 2, "step": 1, "nod": 1, "emo": 2}},
	"oldman": {"act": "tell", "emo": ["话说……", "啪！", "且听下回"], "w": {"look": 1, "step": 0, "nod": 2, "emo": 2}},
	"monk": {"act": "bead", "emo": ["阿弥陀佛", "……"], "w": {"look": 1, "step": 0, "nod": 3, "emo": 1}},
	"gossip": {"act": "fan", "emo": ["嘿嘿", "听说了没？", "嘘——"], "w": {"look": 4, "step": 1, "nod": 0, "emo": 2}},
	"beggar": {"act": "doze", "emo": ["Zz…", "咕……"], "w": {"look": 1, "step": 0, "nod": 1, "emo": 2}},
	"boatman": {"act": "sway", "emo": ["哎——嗨——", "起风喽"], "w": {"look": 2, "step": 0, "nod": 1, "emo": 1}},
	"soldier": {"act": "guard", "emo": ["……", "站好了！"], "w": {"look": 3, "step": 1, "nod": 0, "emo": 1}},
	"bandit": {"act": "none", "emo": ["哼", "看什么看"], "w": {"look": 3, "step": 2, "nod": 0, "emo": 1}},
	"suzhi": {"act": "none", "emo": ["……", "嗯"], "w": {"look": 2, "step": 1, "nod": 1, "emo": 1}},
	"villager": {"act": "none", "emo": ["唉……", "……水"], "w": {"look": 1, "step": 0, "nod": 1, "emo": 1}},
	"_": {"act": "none", "emo": ["……"], "w": {"look": 2, "step": 1, "nod": 1, "emo": 1}}}
const NOIDLE := ["snake", "rooster", "dog", "chief", "wolf"]

static func _idle_of(n: Dictionary, k: String) -> Dictionary:
	var id: String = str(n.get("id", n.get("name", k)))
	if not _idle.has(id):
		_idle[id] = {"k": k, "role": IDLE_ROLE.get(k, IDLE_ROLE._), "act": null, "t0": 0.0, "next": Time.get_ticks_msec() + randf_range(800, 3000), "dir": null, "parts": [], "emo": null, "lastT": 0.0, "cycle": randf_range(0, 1400), "dur": 0.0}
	return _idle[id]

static func _pick_w(w: Dictionary) -> String:
	var tot := 0.0
	for k in w: tot += w[k]
	var r := randf() * tot
	for k in w:
		r -= w[k]
		if r < 0: return k
	return w.keys()[0]

static func npc_idle(W, n: Dictionary, t: float, near):
	if n.get("staticScene"): return null   # 后山等定镜场景不做待机（prologue-backhill.js）
	var k: String = W.sp_key(n.sp)
	var s := _idle_of(n, k)
	if k in NOIDLE: return null
	var base: String = n.get("dir", "d") if n.get("dir") else "d"
	var x: float = n.x * W.TS; var y: float = n.y * W.TS
	var pd := Vector2(W.player.x - x, W.player.y - y).length()
	var r := {"dir": s.dir if s.dir else base, "dx": 0.0, "dy": 0.0, "moving": false, "walk": 0.0}
	if pd < 110 or near == n:
		s.act = null; s.dir = null; r.dir = W.face_to(W.player.x - x, W.player.y - y); return r
	if s.act == null and t > s.next:
		s.act = _pick_w(s.role.w); s.t0 = t
		if s.act == "look":
			var side := ["l", "r", "d"].filter(func(d): return d != base)
			s.dir = side[randi_range(0, side.size() - 1)]; s.dur = randf_range(1200, 2400)
		elif s.act == "step": s.dur = 560
		elif s.act == "nod": s.dur = 700
		elif s.act == "emo":
			s.emo = {"txt": s.role.emo[randi_range(0, s.role.emo.size() - 1)], "t0": t}; s.dur = 10
	var e: float = t - s.t0
	if s.act == "step":
		r.moving = true; r.walk = e * 0.09
	elif s.act == "nod":
		r.dy = max(0.0, sin(e / 700 * PI * 2)) * 3
	if s.act != null and e > s.dur:
		s.act = null; s.dir = null; s.next = t + randf_range(2500, 6000)
	r.dir = s.dir if s.dir else base
	var a: String = s.role.act; var cy := fmod(t + s.cycle, 1400.0)
	if a == "hammer" and cy < 140: r.dy = 3
	elif a == "bead": r.dy += 2 if sin(t / 900) > 0.6 else 0
	elif a == "doze": r.dy += 1.5 if sin(t / 1100) > 0 else 0.0
	elif a == "sway": r.dx = round(sin(t / 800) * 2)
	elif a == "tell" and fmod(t + s.cycle, 4200.0) < 160: r.dy = 2
	return r

static func _ipx(ci: CanvasItem, x: float, y: float, col: Color, a := 1.0) -> void:
	ci.draw_rect(Rect2(round(x / 3) * 3, round(y / 3) * 3, 3, 3), Color(col, a))

static func npc_idle_fx(W, n: Dictionary, t: float, x: float, y: float, h: float, near, id) -> void:
	var ci: CanvasItem = W
	var s := _idle_of(n, W.sp_key(n.sp))
	if s.k in NOIDLE: return
	var dt: float = min(50.0, t - s.lastT if s.lastT else 16.0); s.lastT = t
	var dir: String = id.dir if id else n.get("dir", "d")
	var fx := -1.0 if dir == "l" else (1.0 if dir == "r" else 0.0)
	var a: String = s.role.act; var cy := fmod(t + s.cycle, 1400.0)
	if a == "hammer" and cy < dt + 1:
		for i in 7:
			s.parts.append({"x": x + fx * h * 0.28, "y": y - h * 0.3, "vx": (fx if fx != 0 else 1.0) * randf_range(-0.5, 2.5) * (-1 if randf() < 0.5 else 1), "vy": -randf_range(1.5, 3.5), "g": 0.18, "life": randf_range(260, 480), "age": 0.0, "c": [Color("#fff4c0"), Color("#ffc050"), Color("#ff7a2a")], "soft": false, "ph": 0.0})
	if a == "steam" and randf() < dt / 260:
		s.parts.append({"x": x + (fx if fx != 0 else 0.6) * h * 0.22 + randf_range(-4, 4), "y": y - h * 0.42, "vx": 0.0, "vy": -0.35, "g": 0.0, "life": randf_range(1200, 1800), "age": 0.0, "c": [Color.WHITE], "soft": true, "ph": randf_range(0, 6)})
	if a == "doze" and s.emo == null and fmod(t + s.cycle, 5200.0) < dt + 1: s.emo = {"txt": "Zz…", "t0": t}
	if a == "tell" and s.emo == null and fmod(t + s.cycle, 4200.0) < dt + 1: s.emo = {"txt": "啪！" if randf() < 0.5 else "话说……", "t0": t}
	for p in s.parts:
		p.age += dt; var k: float = p.age / p.life
		p.vy += p.g * dt / 16; p.x += p.vx * dt / 16 + (sin(p.age / 300 + p.ph) * 0.3 if p.soft else 0.0); p.y += p.vy * dt / 16
		if p.soft: _ipx(ci, p.x, p.y, Color.WHITE, 0.35 * (1 - k))
		else: _ipx(ci, p.x, p.y, p.c[min(p.c.size() - 1, int(k * p.c.size()))], 1 - k * 0.5)
	s.parts = s.parts.filter(func(p): return p.age < p.life)
	if s.emo != null:
		var e: float = t - s.emo.t0; var D := 1900.0
		# 11-10 第四十九轮：墨印环开着时不冒闲聊气泡（环旁边多出一个小框，像能点的按钮）
		if e > D or near == n or Npc.is_open or str(s.emo.txt).replace("…", "").strip_edges() == "" or (n.get("mark") is Callable and n.mark.call()):
			s.emo = null
		else:
			var al: float = e / 150 if e < 150 else ((D - e) / 300 if e > D - 300 else 1.0)
			var by: float = y - h - 16 - min(e, 200.0) / 200 * 6
			var f: Font = UI.serif
			var tw := f.get_string_size(s.emo.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x + 14
			var box := Rect2(x - tw / 2, by - 18, tw, 22)
			ci.draw_rect(box, Color(250 / 255.0, 244 / 255.0, 228 / 255.0, 0.94 * al))
			ci.draw_rect(box, Color("#3a2a1a", al), false, 2)
			ci.draw_colored_polygon(PackedVector2Array([Vector2(x - 4, by + 4), Vector2(x + 4, by + 4), Vector2(x, by + 10)]), Color(250 / 255.0, 244 / 255.0, 228 / 255.0, 0.94 * al))
			var sw := f.get_string_size(s.emo.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
			ci.draw_string(f, Vector2(x - sw / 2, by - 2), s.emo.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("#2a1a0a", al))

# ── 遮挡半透明（scene.js occNote/occHit/occGhosts） ──
## 做法：被物件盖住的角色在帧末整身再画一遍半透明。未被盖住的部分与原像素同色叠加，颜色不变；
## 被盖住的部分就成了半透明人形——与原版“只补画被挡部分”的结果一致。排在它后面、未被挡住的角色再盖回去。
static func _actor(W, sp: String, x: float, y: float, dir: String, walk: float, h: float, moving: bool, running: bool, ph: float, alpha: float):
	if h <= 0: h = W.char_h(sp)
	var cam: Vector2 = W.cam
	if x + h < cam.x or x - h > cam.x + W.VW or y < cam.y or y - h * 1.2 > cam.y + W.VH: return null
	var bw: float = h * OCC.bodyW
	return {"sp": sp, "x": x, "y": y, "dir": dir, "walk": walk, "h": h, "moving": moving, "running": running, "ph": ph, "alpha": alpha,
		"l": x - bw / 2, "r": x + bw / 2, "t": y - h, "b": y - 2, "cover": 0.0, "hit": false}

static func _occ_hit(W, actors: Array, kind: int, q: Array, im: Texture2D, k: float) -> void:
	var L: float; var T: float; var R: float; var B: float
	if kind == 6:
		L = q[4]; T = q[5]; R = L + q[2] * k; B = T + q[3] * k
	else:
		L = q[0]; T = q[1]; R = L + q[2]; B = T + q[3]
	for a in actors:
		if a == null or a.r <= L or a.l >= R or a.b <= T or a.t >= B: continue
		var grid = OccGrid.of(W, kind, q, im, k, L, T, R, B)
		var cell: float = OCC.cell
		var x0: float = max(a.l, L); var x1: float = min(a.r, R); var y0: float = max(a.t, T); var y1: float = min(a.b, B)
		var tot: float = max(1.0, ceil((a.r - a.l) / cell) * ceil((a.b - a.t) / cell))
		var cov := 0.0
		if grid == null:
			cov = (x1 - x0) * (y1 - y0) / ((a.r - a.l) * (a.b - a.t))
		else:
			var gw: int = grid.gw; var gh: int = grid.gh; var bits: PackedByteArray = grid.bits
			var c0 := int(floor((x0 - L) / cell)); var c1: int = min(gw - 1, int(floor((x1 - L - 0.01) / cell)))
			var r0 := int(floor((y0 - T) / cell)); var r1: int = min(gh - 1, int(floor((y1 - T - 0.01) / cell)))
			var nn := 0
			for r in range(r0, r1 + 1):
				for c in range(c0, c1 + 1):
					nn += bits[r * gw + c]
			cov = nn / tot
		if cov > 0:
			a.cover += cov; a.hit = true

static func _occ_ghosts(W, actors: Array, t: float) -> void:
	var ci: CanvasItem = W
	var n := 0
	for i in actors.size():
		var a = actors[i]
		if a == null or not a.hit or a.cover < OCC.minCover or a.alpha <= 0: continue
		if n >= OCC.maxActors: break
		n += 1
		CharArt.draw_char(ci, a.sp, a.x, a.y, a.dir, a.walk, t, {"h": a.h, "moving": a.moving, "running": a.running, "ph": a.ph, "noShadow": true, "alpha": OCC.alpha * a.alpha})
		for j in range(i + 1, actors.size()):
			var b = actors[j]
			if b == null or b.hit: continue
			if b.x + b.h * 0.5 < a.x - a.h * 0.5 or b.x - b.h * 0.5 > a.x + a.h * 0.5 or b.y < a.y - a.h * 1.2 or b.y - b.h * 1.2 > a.y + 4: continue
			CharArt.draw_char(ci, b.sp, b.x, b.y, b.dir, b.walk, t, {"h": b.h, "moving": b.moving, "running": b.running, "ph": b.ph, "noShadow": true, "alpha": b.alpha})

# ── 出口、点击目标、水面、鸭、鸟、粒子、气泡 ──
static func draw_marker(W, t: float) -> void:
	var gl = W.player.goal
	if gl == null: return
	var ci: CanvasItem = W
	var a: float = min(1.0, gl.t / 120); var p: float = fmod(gl.t, 900.0) / 900
	var c := Color("#ffe2a0")
	ellipse_line(ci, Vector2(gl.x, gl.y), 14 - p * 6, 5.5 - p * 2.3, Color(c, 0.85 * a), 2)
	ellipse_line(ci, Vector2(gl.x, gl.y), 8 + p * 14, 3 + p * 5.5, Color(c, (1 - p) * 0.6 * a), 2)
	var b := sin(t / 160) * 3
	ci.draw_colored_polygon(PackedVector2Array([Vector2(gl.x - 6, gl.y - 22 + b), Vector2(gl.x + 6, gl.y - 22 + b), Vector2(gl.x, gl.y - 13 + b)]), Color(c, 0.9 * a))

static func draw_exits(W, t: float, pass_i: int) -> void:
	var ci: CanvasItem = W
	var TS: float = W.TS
	var seen := {}
	var a := 0.3 + sin(t / 300) * 0.2
	var cx: float = W.cam.x + W.VW / 2; var cy: float = W.cam.y + W.VH / 2
	for e in W.exits_of(W.cur):
		var R: Array = e.r
		if pass_i == 0:
			ci.draw_rect(Rect2(R[0] * TS, R[1] * TS, (R[2] - R[0] + 1) * TS, (R[3] - R[1] + 1) * TS), Color(236 / 255.0, 200 / 255.0, 120 / 255.0, a * 0.3))
			continue
		var k := "%s|%s" % [e.to, e.get("label", "")]
		var px: float = clamp(cx, R[0] * TS, (R[2] + 1) * TS); var py: float = clamp(cy, R[1] * TS, (R[3] + 1) * TS)
		var d := Vector2(px - cx, py - cy).length()
		if not seen.has(k) or d < seen[k].d: seen[k] = {"e": e, "px": px, "py": py, "d": d}
	for k in seen:
		var e: Dictionary = seen[k].e; var R2: Array = e.r
		var dir: String = W.exit_dir(e)
		var side := dir == "l" or dir == "r"
		var x: float = (W.cam.x + 62 if dir == "l" else W.cam.x + W.VW - 62) if side else clamp(seen[k].px, W.cam.x + 80, W.cam.x + W.VW - 80)
		var y: float = clamp((R2[3] + 1) * TS - 24 if side else (seen[k].py - 36 if dir == "d" else seen[k].py + 44), W.cam.y + 50, W.cam.y + W.VH - 40)
		var lbl: String = e.get("label", "")
		var tw := UI.serif.get_string_size(lbl, HORIZONTAL_ALIGNMENT_LEFT, -1, 18).x
		var ax := x - tw / 2 - 14; var ay := y - 6; var b := sin(t / 220) * 2.5
		label(ci, lbl, x + 8, y, Color("#ffe2a0"))
		var rot: float = {"d": 0.0, "u": PI, "l": PI / 2, "r": -PI / 2}[dir]
		var xf := Transform2D(rot, Vector2(round(ax), round(ay))) * Transform2D(0, Vector2(0, b))
		ci.draw_set_transform_matrix(xf)
		ci.draw_colored_polygon(PackedVector2Array([Vector2(-8, -6), Vector2(8, -6), Vector2(0, 7)]), Color(10 / 255.0, 6 / 255.0, 2 / 255.0, 0.85))
		ci.draw_colored_polygon(PackedVector2Array([Vector2(-5, -4), Vector2(5, -4), Vector2(0, 3)]), Color("#ffe2a0"))
		ci.draw_set_transform(Vector2.ZERO)

static func draw_water(W, t: float, dt: float) -> void:
	if not (W.cur.get("water") is Array) or W.cur.water.is_empty(): return
	var ci: CanvasItem = W
	var sp: Array = W.amb.sparks
	for i in sp.size():
		var s: Dictionary = sp[i]
		s.t += s.d * dt
		if s.t >= 1:
			sp[i] = W.new_spark(0); continue
		var a := sin(s.t * PI)
		var w: float = round(s.w * (0.5 + a * 0.5))
		ci.draw_rect(Rect2(round(s.x - w / 2), round(s.y), w, 2), Color(1, 233 / 255.0, 192 / 255.0, a * 0.55))

static func draw_ducks(W, t: float, dt: float) -> void:
	var ci: CanvasItem = W
	for d in W.amb.ducks:
		d.x += d.v * dt
		if d.x < d.x0 or d.x > d.x1:
			d.v = -d.v; d.x = clamp(d.x, d.x0, d.x1)
		var x: float = round(d.x); var y: float = round(d.y + sin(t / 400 + d.ph) * 1.2); var f := 1.0 if d.v > 0 else -1.0
		var k := fmod(t / 900 + d.ph, 1.0)
		ellipse_line(ci, Vector2(x - f * 4, y + 3), 8 + k * 16, 2 + k * 4, Color(1, 235 / 255.0, 200 / 255.0, 0.35 * (1 - k)), 1.5)
		ci.draw_set_transform(Vector2(x, y), 0, Vector2(f * 3, 3))
		for r in [[-6, -3, 11, 5, "#1e160e"], [2, -8, 4, 6, "#1e160e"], [-5, -2, 9, 3, "#4a3a26"], [-4, -3, 6, 2, "#7a6444"], [-6, -3, 2, 2, "#3a2c1c"], [3, -7, 2, 4, "#2f5a3a"], [3, -3, 2, 1, "#d8d0b8"], [5, -6, 2, 1, "#d09038"], [4, -6, 1, 1, "#0c0a08"]]:
			ci.draw_rect(Rect2(r[0], r[1], r[2], r[3]), Color(r[4]))
		ci.draw_set_transform(Vector2.ZERO)

static func draw_birds(W, t: float, dt: float) -> void:
	if not W.cur.get("birds"): return
	var ci: CanvasItem = W
	W.amb.bt -= dt
	if W.amb.bt <= 0:
		W.amb.bt = randf_range(7000, 15000)
		var dir := 1.0 if randf() < 0.5 else -1.0
		var y: float = W.cam.y + randf_range(40, W.VH * 0.5); var n := randi_range(3, 5)
		for i in n:
			W.amb.birds.append({"x": W.cam.x - 40 - i * randf_range(18, 30) if dir > 0 else W.cam.x + W.VW + 40 + i * randf_range(18, 30), "y": y + randf_range(-24, 24) + i * 6, "v": dir * randf_range(0.14, 0.18), "vy": randf_range(-0.02, 0.01), "ph": randf() * 9})
	for b in W.amb.birds:
		b.x += b.v * dt; b.y += b.vy * dt
		var fl := sin(t / 70 + b.ph); var x: float = round(b.x); var y2: float = round(b.y)
		ci.draw_rect(Rect2(x - 4, y2 + 120, 8, 2), Color(0, 0, 0, 0.14))
		var c := Color("#2a2018"); var wy: float = round(fl * 4)
		ci.draw_rect(Rect2(x - 1, y2 - 1, 3, 3), c); ci.draw_rect(Rect2(x - 6, y2 - 1 - wy, 5, 2), c); ci.draw_rect(Rect2(x + 3, y2 - 1 - wy, 5, 2), c)
	W.amb.birds = W.amb.birds.filter(func(b): return b.x > W.cam.x - 400 and b.x < W.cam.x + W.VW + 400)

static func draw_particles(W, t: float) -> void:
	var ci: CanvasItem = W
	for p in W.particles:
		var a: float = max(0.0, float(p.life) / p.max)
		var c: Color = p.c
		match int(p.kind):
			2:
				ci.draw_circle(Vector2(p.x, p.y), p.s, Color(c, c.a * min(1.0, a * 1.6) * (1 - a * 0.3)))
			4:
				ci.draw_rect(Rect2(round(p.x), round(p.y), 2, 2), Color(c, (0.5 + 0.5 * sin(t / 180 + p.ph)) * min(1.0, a * 3)))
			3:
				var w: float = abs(sin(t / 260 + p.ph)) * 4 + 1
				ci.draw_rect(Rect2(round(p.x), round(p.y), round(w), 3), Color(c, min(1.0, a * 4)))
			1:
				var s: float = p.s + (1 - a) * 3
				ci.draw_rect(Rect2(round(p.x - s / 2), round(p.y - s / 2), round(s), round(s)), Color(c, c.a * a))
			_:
				ci.draw_rect(Rect2(p.x, p.y, p.s, p.s), Color(c, c.a * a))

static func draw_bubbles(W, dt: float) -> void:
	var ci: CanvasItem = W
	var f: Font = UI.serif
	for i in range(W.bubbles.size() - 1, -1, -1):
		var b: Dictionary = W.bubbles[i]
		b.t += dt
		if b.t > b.dur or not W.wanderers.has(b.w):
			W.bubbles.remove_at(i); continue
		var a: float = min(1.0, min(b.t / 180, (b.dur - b.t) / 300))
		var h: float = W.char_h(b.w.sp)
		var tw: float = ceil(f.get_string_size(b.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x) + 18; var th := 26.0
		var x: float = round(clamp(b.w.x, W.cam.x + tw / 2 + 6, W.cam.x + W.VW - tw / 2 - 6))
		var y: float = round(b.w.y - h - 24 - (1 - min(1.0, b.t / 180)) * 6)
		var x0: float = round(x - tw / 2); var y0 := y - th / 2
		var dk := Color("#1b130c", a); var lt := Color("#efe2c4", a)
		ci.draw_rect(Rect2(x0 - 2, y0, tw + 4, th), dk); ci.draw_rect(Rect2(x0, y0 - 2, tw, th + 4), dk)
		ci.draw_rect(Rect2(x0, y0, tw, th), lt); ci.draw_rect(Rect2(x0, y0 + th - 3, tw, 3), Color("#d8c7a2", a))
		var tx: float = round(clamp(b.w.x, x0 + 10, x0 + tw - 10))
		ci.draw_rect(Rect2(tx - 5, y0 + th + 2, 10, 2), dk); ci.draw_rect(Rect2(tx - 3, y0 + th + 4, 6, 2), dk); ci.draw_rect(Rect2(tx - 1, y0 + th + 6, 2, 2), dk)
		ci.draw_rect(Rect2(tx - 3, y0 + th, 6, 2), lt); ci.draw_rect(Rect2(tx - 1, y0 + th + 2, 2, 2), lt)
		var sw := f.get_string_size(b.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
		ci.draw_string(f, Vector2(x - sw / 2, y + 6), b.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("#3a2616", a))
