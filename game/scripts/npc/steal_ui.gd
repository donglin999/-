extends Node
## 偷窃界面：物品扇与袖里一按（原版 js/qihe-steal-ui.js，window.QiheStealUI；样式 qihe-steal-ui.css，#qs-layer z-index 62）。
## 画面按 1600×900 写，整层缩 0.6；窄窗口放大系数 boost＝clamp(.72/Z,1,1.45)，Z＝0.6 时为 1.2（同原版）。
## 小游戏画面在 steal_dial.gd，物品扇在本文件的 Fan 类。
const U := preload("res://scripts/npc/util.gd")
const SU := preload("res://scripts/npc/scroll_ui.gd")
const Dial := preload("res://scripts/npc/steal_dial.gd")
const CN := ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
const IMG_POUCH := "assets/production/cultivation/mail-v7/pouch.png"
const COIN := "ui_qh_steal_coin_20261027"

var cl: CanvasLayer
var layer: Control
var key_fn: Callable = Callable()
var closer: Callable = Callable()
var armed_at := 0.0

func _ready() -> void:
	cl = CanvasLayer.new(); cl.layer = 32; add_child(cl)
	layer = Control.new(); layer.name = "qs-layer"; layer.size = Vector2(1600, 900); layer.scale = Vector2(0.6, 0.6)
	Paint.crisp(layer)   # 字按实际显示大小光栅（见 ui.gd）
	layer.mouse_filter = Control.MOUSE_FILTER_IGNORE; layer.visible = false
	cl.add_child(layer)

func ST(): return get_parent().steal
func Q(): return get_parent().core
func D() -> Dictionary: return get_parent().steal.D
static func cn(n) -> String: return CN[int(n) - 1] if int(n) >= 1 and int(n) <= 10 else str(n)
static func now() -> float: return Time.get_ticks_msec()
static func boost() -> float: return clampf(0.72 / 0.6, 1, 1.45)

func ensure() -> Control:
	for c in layer.get_children(): c.queue_free()
	layer.visible = true
	return layer

func shut() -> void:
	key_fn = Callable(); closer = Callable()
	for c in layer.get_children(): c.queue_free()
	layer.visible = false

## 别的流程要强行收起时（读档、切图）：正在进行的扇子或小游戏按“罢手／失手”结束
func close() -> void:
	var c := closer; closer = Callable()
	if c.is_valid(): c.call()
	else: shut()

func arm() -> void: armed_at = now() + 180

var active: bool:
	get: return key_fn.is_valid() or layer.visible

## 拦下整次按键；长按自动重复不算；刚打开 0.18 秒内不收确认键
func _input(e: InputEvent) -> void:
	if not key_fn.is_valid() or not (e is InputEventKey): return
	get_viewport().set_input_as_handled()
	if not e.pressed: return
	var k: String = get_parent().KEYMAP.get(e.keycode, OS.get_keycode_string(e.keycode).to_lower())
	if e.echo and k in ["e", " ", "enter", "escape"]: return
	if now() < armed_at and k in ["e", " ", "enter"]: return
	key_fn.call(k)

# ───── 坐标（原版 anchorOf／heroAnchor）─────
func anchor_of(n) -> Dictionary:
	if not (n is Dictionary) or not n.has("x") or World.player == null: return {}
	var h: float = World.npc_h(n)
	var x := float(n.x) * World.TS; var y := float(n.y) * World.TS
	var P = get_parent()
	var c: Vector2 = P.to_design(x, y - h * 0.55)
	var hy: float = P.to_design(x, y - h).y
	var pp: Vector2 = P.to_design(World.player.x, World.player.y - 20)
	return {"x": c.x, "y": c.y, "headY": hy, "px": pp.x, "py": pp.y}

func hero_anchor() -> Dictionary:
	if World.player == null: return {}
	var pp: Vector2 = get_parent().to_design(World.player.x, World.player.y - 20)
	return {"x": pp.x, "y": pp.y, "headY": pp.y - 40, "px": pp.x, "py": pp.y}

# ───── 物品显示（第 7 节）─────
func display(it: Dictionary, target: Dictionary) -> Dictionary:
	var tier: Dictionary = D().TIERS.get(it.get("g") if U.t(it.get("g")) else "none", D().TIERS.none)
	if U.t(it.get("money")): return {"kind": "money", "name": U.nz(it.get("n"), "钱袋")}
	if U.t(target.get("disguised")) or target.get("conceal") == "allButMoney": return {"kind": "unseen", "name": "看不清的一件"}
	if U.t(tier.get("precious")):
		if not Q().recognize(str(U.nz(it.get("key"), it.get("n"))), it.get("g")): return {"kind": "unknown", "name": "未知物品"}
	return {"kind": "name", "name": U.nz(it.get("n"), "？")}

## 图标：[贴图或 null, 字形, 是否像素, 是否暗]
func icon_of(it: Dictionary, disp: Dictionary) -> Array:
	if disp.kind == "unknown": return [Assets.tex("r_qh_song_bundle_v1"), "", true, false]
	if disp.kind == "unseen": return [null, "？", false, true]
	if disp.kind == "money" and not U.t(it.get("silverBar")): return [Assets.tex(IMG_POUCH), "", false, false]
	if U.t(it.get("id")) and DB.ITEMS.has(it.id):
		var t := SU.item_tex(it.id)
		if t: return [t, "", false, false]
	return [null, str(U.nz(it.get("glyph"), str(U.nz(it.get("n"), "？")).substr(0, 1))), false, false]

static func qty_text(it: Dictionary, disp: Dictionary) -> String:
	if disp.kind in ["unseen", "unknown"]: return ""
	if U.t(it.get("money")): return "一枚" if U.t(it.get("silverBar")) else "银两 %s" % U.jround(it.money)
	return ("%s 份" % U.jround(it.q)) if U.num(it.get("q")) > 1 else "一件"

# ───── 下手语境（物品扇与结算共用一份）─────
func context(npc_id: String, target: Dictionary) -> Dictionary:
	var st_lv: int = ST().steal_lv()
	var perks: Array = []
	for sk in D().SKILL:
		if int(sk.lv) == st_lv: perks = sk.get("perks", []); break
	var hero := {"lv": U.nz(G.S.get("lv"), 1), "agi": U.nz(G.S.get("agi"), 4), "stealLv": st_lv, "perks": U.dig(G.S, "steal.perks") if U.dig(G.S, "steal.perks") is Dictionary else {}}
	var bt = target.get("battle")
	var tgt := {"lv": bt.get("lv", 0) if bt is Dictionary else U.nz(target.get("stealLv"), 0), "state": "normal", "fighter": bt is Dictionary,
		"villain": U.t(target.get("villain")), "flags": target.get("flags", {}) if target.get("flags") is Dictionary else {}, "patron": target.get("patron")}
	var bond: Dictionary = Q().bond_get(npc_id) if Q().people().has(npc_id) else {}
	var ctx := {"hero": hero, "target": tgt, "bond": bond, "rumor": {"here": ST().rumor(U.nz(G.S.get("scene"), "m_qh_central"))}}
	return {"stLv": st_lv, "perks": perks, "hero": hero, "tgt": tgt, "bond": bond, "ctx": ctx, "grip": ST().grip(ctx)}

# ───── 物品扇（第 4.5、7 节）─────
func pick(npc_id: String, target: Dictionary, npc, X = null):
	if X == null: X = context(npc_id, target)
	var items: Array = ST().list_items(npc_id, target)
	if items.is_empty(): return null
	var L := ensure(); arm()
	var A := anchor_of(npc)
	if A.is_empty(): A = {"x": 900, "y": 430, "headY": 380, "px": 820, "py": 450}
	var rows: Array = []
	for it in items:
		var ch: Dictionary = ST().chance(npc_id, it, X.grip, target)
		var disp := display(it, target)
		rows.append({"it": it, "ch": ch, "disp": disp, "icon": icon_of(it, disp), "off": U.num(ch.get("gate")) > X.stLv})
	var fan := Fan.new()
	fan.ui = self; fan.rows = rows; fan.A = A; fan.X = X; fan.wary = ST().wary(npc_id)
	L.add_child(fan)
	fan.layout()
	key_fn = fan.on_key
	closer = func(): fan.finish(null)
	var v = await fan.done
	shut()
	return v

# ───── 小游戏：袖里一按（第 6 节；图 02）─────
## 一定返回 "fail"｜"ok"｜"great"；opts：{npc（地图上的人，用来定位）, disp, icon}；不给就围着萧白摆
func minigame(npc_id: String, item: Dictionary, chance_value: float, tier: Dictionary, perks: Array, opts: Dictionary = {}) -> String:
	if closer.is_valid(): close()
	var P := Dial.params(ST(), chance_value, tier if tier else {}, perks if perks else [])
	var L := ensure(); arm()
	var A := anchor_of(opts.get("npc")) if opts.get("npc") != null else {}
	if A.is_empty(): A = hero_anchor()
	if A.is_empty(): A = {"x": 800, "y": 450, "headY": 400, "px": 800, "py": 450}
	var d := Dial.new()
	d.ui = self; d.P = P; d.item = item; d.chance_value = chance_value; d.tier = tier if tier else {}; d.opts = opts
	L.add_child(d)
	d.setup(A)
	var r: String = await d.done
	shut()
	return r

# ───── 主入口 ─────
## 原版 QiheStealUI.steal(npcId, target, npc)：挑件 → 袖里一按 → 收起界面 → 结算（失手台词、敌对开战）→ 提示、存档
func steal(npc_id: String, target: Dictionary, npc = null):
	var X := context(npc_id, target)
	var item = await pick(npc_id, target, npc, X)
	if not U.t(item): return null
	X = context(npc_id, target)
	var ch: Dictionary = ST().chance(npc_id, item, X.grip, target)
	var tier: Dictionary = D().TIERS.get(item.get("g") if U.t(item.get("g")) else "none", D().TIERS.none)
	var disp := display(item, target)
	var result := await minigame(npc_id, item, ch.chance, tier, X.perks, {"npc": npc, "disp": disp, "icon": icon_of(item, disp)})
	shut()
	var s: Dictionary = ST().state()
	var res_ctx := {"npcId": npc_id, "item": item, "target": X.tgt, "result": result, "ruleset": ch.ruleset,
		"ctx": {"phase": "opening", "mapId": U.nz(G.S.get("scene"), "m_qh_central"), "fixedScene": false},
		"bond": Q().bond_get(npc_id) if Q().people().has(npc_id) else X.bond, "tier": tier,
		"caught": {"count": int(U.num(s.caught.get(npc_id, {}).get("count"))) + 1}}
	await ST().resolve(res_ctx)   # 先收起界面，再等结算演完
	if result != "fail":
		var it: Dictionary = res_ctx.item
		UI.toast("得手 · " + (("银两 " + U.js(it.money)) if U.t(it.get("money")) else (str(DB.ITEMS.get(it.get("id"), {}).get("name", it.get("n"))) + ((" ×" + U.js(it.q)) if U.num(it.get("q")) > 1 else ""))), 1800)
	var pro = Flow.prologue()
	if pro and pro.has_method("checkpoint"): pro.checkpoint()
	return {"item": item, "result": result}

# ───── 共用画法 ─────
static var _dim_tex: Texture2D = null
## .qs-dim：以 c 为心的径向暗角（130px 内透明，300px .36，640px 外 .55）
static func dim(ci: CanvasItem, c: Vector2) -> void:
	if _dim_tex == null:
		var g := Gradient.new()
		g.offsets = PackedFloat32Array([0.0, 130.0 / 640, 300.0 / 640, 1.0])
		g.colors = PackedColorArray([Color(8 / 255.0, 10 / 255.0, 8 / 255.0, 0), Color(8 / 255.0, 10 / 255.0, 8 / 255.0, 0), Color(8 / 255.0, 10 / 255.0, 8 / 255.0, 0.36), Color(8 / 255.0, 10 / 255.0, 8 / 255.0, 0.55)])
		var gt := GradientTexture2D.new(); gt.gradient = g; gt.fill = GradientTexture2D.FILL_RADIAL
		gt.fill_from = Vector2(0.5, 0.5); gt.fill_to = Vector2(1, 0.5); gt.width = 256; gt.height = 256
		_dim_tex = gt
	var r := Rect2(c - Vector2(640, 640), Vector2(1280, 1280))
	ci.draw_texture_rect(_dim_tex, r, false)
	var o := Color(8 / 255.0, 10 / 255.0, 8 / 255.0, 0.55)
	var full := Rect2(-400, -400, 2400, 1700)
	ci.draw_rect(Rect2(full.position, Vector2(full.size.x, maxf(0, r.position.y - full.position.y))), o)
	ci.draw_rect(Rect2(full.position.x, r.end.y, full.size.x, maxf(0, full.end.y - r.end.y)), o)
	ci.draw_rect(Rect2(full.position.x, r.position.y, maxf(0, r.position.x - full.position.x), r.size.y), o)
	ci.draw_rect(Rect2(r.end.x, r.position.y, maxf(0, full.end.x - r.end.x), r.size.y), o)

## .qs-seal／.qs-sl：方印。style：zhu 朱底／ink 墨底／hol 空心
static func seal(ci: CanvasItem, r: Rect2, ch: String, fs: float, style := "zhu", thin := false) -> void:
	ci.draw_rect(Rect2(r.position + Vector2(0, 2), r.size), Color(0, 0, 0, 0.4))
	var fc := Color("#fbefd6")
	match style:
		"ink":
			ci.draw_rect(r, Color("#1e231f")); ci.draw_rect(r.grow(-4), Color("#c4aa76"), false, 1); fc = Color("#f1e3c2")
		"hol":
			ci.draw_rect(r, Color(244 / 255.0, 236 / 255.0, 216 / 255.0, 0.45)); ci.draw_rect(r.grow(-1.2), Color(24 / 255.0, 28 / 255.0, 24 / 255.0, 0.88), false, 2.4); fc = Color("#2a2620")
		_:
			ci.draw_rect(r, Color("#96302a"))
			ci.draw_circle(r.position + r.size * Vector2(0.3, 0.25), r.size.x * 0.3, Color(1, 230 / 255.0, 200 / 255.0, 0.08))
			ci.draw_rect(r.grow(-0.5 if thin else -2.5), Color("#f3e6cc"), false, 1)
	var w := UI.weibei.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, int(fs)).x
	ci.draw_string(UI.weibei, Vector2(r.get_center().x - w / 2, r.get_center().y + fs * 0.36), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, int(fs), fc)

## 描黑边的字（text-shadow:0 0 3px #000）。小数字号照原版（Paint.draw_text；不在单位变换下画时传 xf）
static func stext(ci: CanvasItem, f: Font, pos: Vector2, s: String, px: float, c: Color, xf := Transform2D.IDENTITY) -> float:
	for d in [Vector2(-1, 0), Vector2(1, 0), Vector2(0, -1), Vector2(0, 1), Vector2(0, 1.5)]:
		Paint.draw_text(ci, f, pos + d, s, px, Color(0, 0, 0, 0.75), xf)
	Paint.draw_text(ci, f, pos, s, px, c, xf)
	return tw(f, s, px)

static func tw(f: Font, s: String, px: float) -> float: return Paint.text_w(f, s, px)

## 图标（icon_of 的结果）画进方框
static func draw_icon(ci: CanvasItem, ic: Array, c: Vector2, sz: float, gray := false) -> void:
	var mod := Color(0.55, 0.55, 0.55, 1) if gray else Color.WHITE
	if ic[0]:
		var t: Texture2D = ic[0]
		var s2: float = (sz * (30.0 / 38.0) if ic[2] else sz) / maxf(t.get_width(), t.get_height())
		ci.draw_texture_rect(t, Rect2(c - t.get_size() * s2 / 2, t.get_size() * s2), false, mod)
	else:
		var px := sz * 22.0 / 38.0
		var w := tw(UI.weibei, ic[1], px)
		ci.draw_string(UI.weibei, Vector2(c.x - w / 2, c.y + px * 0.36), ic[1], HORIZONTAL_ALIGNMENT_LEFT, -1, int(px), Color("#9a917e") if ic[3] else Color("#efce83"))

# ───── 物品扇画面 ─────
class Fan extends Control:
	signal done(v)
	var ui; var rows: Array; var A: Dictionary; var X: Dictionary; var wary: Dictionary
	var side := "right"; var dir := 1
	var pts: Array = []
	var cy := 0.0
	var B := 1.0
	var focus := 0
	var tip := ""
	var nudge_at := -1.0
	var _done := false
	var born := 0.0
	var hits: Array = []    # [Rect2(未缩放坐标), kind, i]

	func _init() -> void:
		size = Vector2(1600, 900); mouse_filter = Control.MOUSE_FILTER_STOP

	func finish(v) -> void:
		if _done: return
		_done = true; done.emit(v)

	func layout() -> void:
		born = Time.get_ticks_msec()
		B = ui.boost()
		var need := 470 * B
		side = "left" if A.get("px") != null and A.px > A.x else "right"
		if side == "right" and A.x + need > 1600: side = "left"
		elif side == "left" and A.x - need < 0: side = "right"
		dir = -1 if side == "left" else 1
		var n := rows.size()
		var GAP := 62.0; var OFF := 92.0
		var R := maxf(150, ((n - 1) * GAP / 2) / sin(deg_to_rad(50)))
		cy = clampf(A.y, 120 + (n - 1) * GAP / 2 * B, 780 - (n - 1) * GAP / 2 * B)
		pts = []
		for i in n:
			var dy := (i - (n - 1) / 2.0) * GAP
			var t := asin(clampf(dy / R, -1, 1))
			pts.append(Vector2(A.x + dir * (OFF + R * (1 - cos(t)) * 0.6), cy + dy))
		focus = 0
		for i in n:
			if not rows[i].off: focus = i; break
		set_process(true)

	func _process(_d: float) -> void: queue_redraw()

	func _exit_tree() -> void: finish(null)

	func move(d: int) -> void:
		focus = (focus + d + rows.size()) % rows.size(); tip = ""; queue_redraw()

	func go() -> void:
		if focus >= rows.size(): return
		var r: Dictionary = rows[focus]
		if r.off:
			nudge_at = Time.get_ticks_msec()
			tip = "这一件要窃术%s级才下得了手" % ui.cn(r.ch.gate)
			return
		finish(r.it)

	func on_key(k: String) -> void:
		if k in ["w", "arrowup"]: move(-1)
		elif k in ["s", "arrowdown"]: move(1)
		elif k in ["e", " ", "enter"]: go()
		elif k in ["escape", "q"]: finish(null)

	## 屏幕点 → 未放大的扇子坐标（.qs-fan 以 (A.x, cy) 为原点放大 B 倍）
	func unscale(p: Vector2) -> Vector2: return Vector2(A.x, cy) + (p - Vector2(A.x, cy)) / B

	func _gui_input(e: InputEvent) -> void:
		if _done: return
		if e is InputEventMouseMotion:
			var p := unscale(e.position)
			for h in hits:
				if h[1] == "it" and h[0].has_point(p) and focus != h[2]: focus = h[2]; tip = ""
		elif e is InputEventMouseButton and e.pressed:
			if e.button_index == MOUSE_BUTTON_RIGHT: finish(null)
			elif e.button_index == MOUSE_BUTTON_LEFT:
				var p := unscale(e.position)
				for h in hits:
					if not h[0].has_point(p): continue
					if h[1] == "it": focus = h[2]; go()
					elif h[1] == "go": go()
					elif h[1] == "esc": finish(null)
					break
		accept_event()

	## 一行多段字（[文字, 颜色, 字体, 字号, 是否键框]）；right=true 时右对齐到 x
	func segs(parts: Array, x: float, y: float, right: bool) -> Array:
		var total := 0.0
		for q in parts: total += ui.tw(q[2], q[0], q[3]) + (14.0 if q[4] else 0.0)
		var cx := x - total if right else x
		var spans := []
		for q in parts:
			var w: float = ui.tw(q[2], q[0], q[3])
			if q[4]:
				var kr := Rect2(cx + 3, y - 14, maxf(18, w + 8), 18)
				draw_rect(kr, Color(16 / 255.0, 22 / 255.0, 19 / 255.0, 0.72)); draw_rect(kr, Color(215 / 255.0, 184 / 255.0, 116 / 255.0, 0.8), false, 1)
				draw_string(q[2], Vector2(kr.get_center().x - w / 2, y), q[0], HORIZONTAL_ALIGNMENT_LEFT, -1, int(q[3]), q[1])
				spans.append([cx, cx + kr.size.x + 6]); cx += kr.size.x + 6
			else:
				ui.stext(self, q[2], Vector2(cx, y), q[0], q[3], q[1])
				spans.append([cx, cx + w]); cx += w
		return spans

	func halo(r: Rect2) -> void:
		var sb := StyleBoxFlat.new(); sb.bg_color = Color(12 / 255.0, 14 / 255.0, 12 / 255.0, 0.62); sb.set_corner_radius_all(40)
		sb.shadow_color = Color(12 / 255.0, 14 / 255.0, 12 / 255.0, 0.3); sb.shadow_size = 10
		draw_style_box(sb, r)

	func _draw() -> void:
		hits = []
		ui.dim(self, Vector2(A.x, A.y))
		var o := Vector2(A.x, cy)
		draw_set_transform(o - o * B, 0, Vector2(B, B))
		var n := rows.size()
		var t_ms := Time.get_ticks_msec()
		var right := side == "left"   # 左侧时整列右对齐、行反向
		# 金线刻度弧（二次贝塞尔）＋两端菱形
		var GAP := 62.0
		var ax := func(i): return pts[i].x - dir * 36
		var top: float = pts[0].y - GAP * 0.5
		var bot: float = pts[n - 1].y + GAP * 0.5
		var mid: float = A.x + dir * (92 - 36 - maxf(150, ((n - 1) * GAP / 2) / sin(deg_to_rad(50))) * 0.12)
		var P0 := Vector2(ax.call(0), top); var P1 := Vector2(mid, cy); var P2 := Vector2(ax.call(n - 1), bot)
		var curve := PackedVector2Array()
		for k in 33:
			var tt := k / 32.0
			curve.append(P0 * (1 - tt) * (1 - tt) + P1 * 2 * (1 - tt) * tt + P2 * tt * tt)
		draw_polyline(curve, Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.55), 3.4, true)
		draw_polyline(curve, Color("#e2c27c"), 1.2, true)
		for d in [P0, P2]:
			draw_colored_polygon(PackedVector2Array([d + Vector2(0, -5.7), d + Vector2(5.7, 0), d + Vector2(0, 5.7), d + Vector2(-5.7, 0)]), Color(10 / 255.0, 12 / 255.0, 10 / 255.0, 0.6))
			draw_colored_polygon(PackedVector2Array([d + Vector2(0, -3.5), d + Vector2(3.5, 0), d + Vector2(0, 3.5), d + Vector2(-3.5, 0)]), Color("#e2c27c"))
		# 各件
		for i in n:
			var r: Dictionary = rows[i]
			var p: Vector2 = pts[i]
			var fo := i == focus
			var age := (t_ms - born) / 1000.0 - 0.02 * maxi(0, i - 0)
			var al := clampf(age / 0.16, 0, 1)
			var yo := (1 - al) * 6
			var nx := 0.0
			if r.off and fo and nudge_at > 0 and t_ms - nudge_at < 260: nx = sin((t_ms - nudge_at) / 260.0 * TAU * 2) * 5
			var c := p + Vector2(nx, yo)
			var cs := 60.0 if fo else 52.0
			var coin: Texture2D = Assets.tex(ui.COIN)
			var mod := Color(0.62, 0.62, 0.62, al) if r.off else Color(1, 1, 1, al)
			draw_circle(c + Vector2(0, 2), cs / 2, Color(0, 0, 0, 0.3 * al))
			if fo: draw_circle(c, cs / 2 + 7, Color(239 / 255.0, 206 / 255.0, 131 / 255.0, 0.18 * al))
			if coin: draw_texture_rect(coin, Rect2(c - Vector2(cs, cs) / 2, Vector2(cs, cs)), false, mod)
			ui.draw_icon(self, r.icon, c, 38, r.off)
			if fo:
				var br := 0.775 + 0.225 * cos(t_ms / 1600.0 * TAU)
				draw_arc(c, cs / 2 + 6, 0, TAU, 48, Color(196 / 255.0, 85 / 255.0, 61 / 255.0, br * al), 1.5, true)
			hits.append([Rect2(p.x - 28 - (360 if right else 0), p.y - 28, 388, 56), "it", i])
			# 成功率／门槛
			var x0 := c.x + (-1 if right else 1) * (28 + 10)
			var pw := 62.0
			if r.off:
				var s := "窃术%s级" % ui.cn(r.ch.gate)
				var px := 15.0 if fo else 14.0
				var w: float = ui.tw(UI.song, s, px); pw = maxf(62, w)
				ui.stext(self, UI.song, Vector2(x0 - w if right else x0, c.y + 5), s, px, Color("#f0b8a6") if fo else Color("#e2d4b2"))
			else:
				var px2 := 32.0 if fo else 26.0
				var s1 := str(r.ch.chance)
				var w1: float = ui.tw(UI.song_bold, s1, px2); var w2: float = ui.tw(UI.song_bold, "%", 14)
				pw = maxf(62, w1 + w2 + 1)
				var sx := x0 - (w1 + w2 + 1) if right else x0
				var col := Color("#ffe7a8") if fo else Color("#f3dfa6")
				ui.stext(self, UI.song_bold, Vector2(sx, c.y + px2 * 0.36), s1, px2, col)
				ui.stext(self, UI.song_bold, Vector2(sx + w1 + 1, c.y + px2 * 0.36), "%", 14, col)
			_slip(r, fo, c.y, x0 + (-1 if right else 1) * (pw + 10), right, al)
		draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
		draw_set_transform(o - o * B, 0, Vector2(B, B))
		_head_foot(right)
		draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

	## .qs-slip 宣纸小签：名字、品级、难度、数量
	func _slip(r: Dictionary, fo: bool, yc: float, x_edge: float, right: bool, al: float) -> void:
		var it: Dictionary = r.it
		var disp: Dictionary = r.disp
		var h := 42.0 if fo else 38.0
		var name_px := 20.0 if fo else 18.0
		var parts: Array = []   # [kind, text, w]
		var nm := str(disp.name)
		var nf := Paint.font(UI.song_bold, int(name_px), (2.0 if disp.kind in ["unseen", "unknown"] else 3.0) / name_px)
		parts.append(["b", nm, nf.get_string_size(nm, HORIZONTAL_ALIGNMENT_LEFT, -1, int(name_px)).x])
		if disp.kind == "unknown": parts.append(["gq", "？", ui.tw(UI.song, "？", 12) + 10])
		elif disp.kind != "unseen" and U.t(it.get("g")): parts.append(["g", str(it.g), ui.tw(UI.song, str(it.g), 12) + 10])
		var diff := int(U.nz(it.get("diff"), 1))
		var ds: String = "难" + ui.cn(diff)
		parts.append(["d%d" % diff, ds, ui.tw(UI.song, ds, 12) + 10])
		var q: String = ui.qty_text(it, disp)
		if q != "": parts.append(["em", q, ui.tw(Paint.font(UI.song, 12.5, 1.0 / 12.5), q, 12.5) + 9 + 1])
		var w := 16.0 + 14
		for i in parts.size(): w += parts[i][2] + (9 if i > 0 else 0)
		var x := x_edge - w if right else x_edge
		var rr := Rect2(x, yc - h / 2, w, h)
		var poly := PackedVector2Array([Vector2(0, 0.04), Vector2(0.03, 0), Vector2(0.98, 0.06), Vector2(1, 0.5), Vector2(0.97, 1), Vector2(0.02, 0.96), Vector2(0, 0.5)])
		var pp := PackedVector2Array()
		for v in poly: pp.append(rr.position + v * rr.size)
		var sh := PackedVector2Array()
		for v in pp: sh.append(v + Vector2(0, 2))
		draw_colored_polygon(sh, Color(0, 0, 0, 0.35 * al))
		draw_colored_polygon(pp, Color(243 / 255.0, 234 / 255.0, 211 / 255.0, 0.97 * al))
		var bx := rr.position.x if right else rr.end.x - 4
		draw_rect(Rect2(bx, rr.position.y + h * 0.05, 4, h * 0.9), Color(163 / 255.0, 63 / 255.0, 47 / 255.0, al))
		var cx := x + 16
		var ink := Color("#5a5244") if disp.kind in ["unseen", "unknown"] else Color("#1d1a15")
		for i in parts.size():
			var pt: Array = parts[i]
			if i > 0: cx += 9
			match pt[0]:
				"b": draw_string(nf, Vector2(cx, yc + name_px * 0.36), pt[1], HORIZONTAL_ALIGNMENT_LEFT, -1, int(name_px), Color(ink, al))
				"g", "gq":
					var gc := Color("#8a3a2b") if pt[0] == "gq" else Color("#3d6f62")
					draw_rect(Rect2(cx, yc - 9, pt[2] - 2, 18), Color(gc, al), false, 1)
					draw_string(UI.song, Vector2(cx + 4, yc + 4.5), pt[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(gc, al))
				"em":
					draw_line(Vector2(cx, yc - 8), Vector2(cx, yc + 8), Color(107 / 255.0, 97 / 255.0, 80 / 255.0, 0.45 * al), 1)
					# .qs-slip em 12.5px 字距 1；此时在扇面变换 (o - o×B, ×B) 下
					var o := Vector2(A.x, cy)
					Paint.draw_text(self, Paint.font(UI.song, 12.5, 1.0 / 12.5), Vector2(cx + 9, yc + 4.5), pt[1], 12.5, Color(Color("#6b6150"), al), Transform2D(0, Vector2(B, B), 0, o - o * B))
				_:
					var bg := Color("#7d7464") if diff <= 2 else (Color("#5e1c14") if diff >= 6 else Color("#8a3a2b"))
					var dr := Rect2(cx, yc - 9, pt[2], 18)
					draw_rect(dr, Color(bg, al))
					if diff >= 6: draw_rect(dr.grow(1), Color(Color("#e2c27c"), al), false, 1)
					draw_string(UI.song, Vector2(cx + 5, yc + 4.5), pt[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(Color("#fff3dc"), al))
			cx += pt[2]

	## 原版 Math.round(mult*100)/10 的 JS 数字转字
	static func _zhe(m: float) -> String:
		var v := roundi(m * 100)
		return str(v / 10) if v % 10 == 0 else "%d.%d" % [v / 10, v % 10]

	## 扇头（窃印＋“挑一件下手”）与扇脚（下手把握、戒心、键位、提示）
	func _head_foot(right: bool) -> void:
		var n := rows.size()
		var p0: Vector2 = pts[0]; var p1: Vector2 = pts[n - 1]
		# 扇头 .qs-fanhead（padding 6 20）
		var ht := "挑一件下手"
		var hf := Paint.font(UI.song, 16, 3.0 / 16)
		var hw := 24 + 8 + hf.get_string_size(ht, HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x + 40
		var hx := p0.x + 28 - hw if right else p0.x - 28
		var hy := p0.y - 28 - 44
		halo(Rect2(hx, hy, hw, 36))
		var sr := Rect2(hx + 20 if not right else hx + hw - 20 - 24, hy + 6, 24, 24)
		ui.seal(self, sr, "窃", 14, "zhu", true)
		var tx := sr.end.x + 8 if not right else sr.position.x - 8 - hf.get_string_size(ht, HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x
		ui.stext(self, hf, Vector2(tx, hy + 24), ht, 16, Color("#efd9a6"))
		# 扇脚 .qs-fanfoot（15px，行高 2）
		var f := Paint.font(UI.song, 15, 1.5 / 15)
		var fb := Paint.font(UI.song_bold, 15, 1.5 / 15)
		var fx := p1.x + 28 - 26 if right else p1.x - 28 + 26
		var fy := p1.y + 28 + 16 + 6
		var lines: Array = []
		var tc := Color("#e9dcbc"); var gc := Color("#efce83")
		var info := [["下手把握 ", tc, f, 15, false], ["%s%%" % X.grip, gc, fb, 15, false], [" · 窃术 ", tc, f, 15, false], ["%s级" % ui.cn(X.stLv), gc, fb, 15, false],
			[" · 身法 ", tc, f, 15, false], [str(U.jround(X.hero.agi)), gc, fb, 15, false]]
		var lv_gap := maxf(0, U.num(X.tgt.lv) - U.num(X.hero.lv))
		if lv_gap: info.append_array([[" · 他高你 ", tc, f, 15, false], [str(U.jround(lv_gap)), gc, fb, 15, false], [" 级", tc, f, 15, false]])
		lines.append(info)
		if wary.get("lv", 0):
			var ws := "他起了戒心%s · 成功率打 %s 折" % [("（被你失手惊动过 %d 回）" % wary.caught) if wary.caught else ("（被你得手过 %d 回）" % wary.taken), _zhe(wary.mult)]
			lines.append([[ws, Color("#f0b8a6"), Paint.font(UI.song, 14, 1.0 / 14), 14, false]])
		var keys := [["W", gc, f, 13, true], ["S", gc, f, 13, true], ["选 · ", tc, f, 15, false], ["E", gc, f, 13, true], ["下手", tc, f, 15, false], [" · ", tc, f, 15, false], ["Esc", gc, f, 13, true], ["罢手", tc, f, 15, false]]
		lines.append(keys)
		if tip != "": lines.append([[tip, Color("#f0b8a6"), f, 15, false]])
		var maxw := 0.0
		for ln in lines:
			var w := 0.0
			for q in ln: w += ui.tw(q[2], q[0], q[3]) + (14.0 if q[4] else 0.0)
			maxw = maxf(maxw, w)
		halo(Rect2((fx - maxw - 26) if right else (fx - 26), fy - 6, maxw + 52, lines.size() * 30 + 12))
		for li in lines.size():
			var spans := segs(lines[li], fx, fy + li * 30 + 20, right)
			if lines[li] == keys:
				hits.append([Rect2(spans[3][0], fy + li * 30, spans[4][1] - spans[3][0], 30), "go", -1])
				hits.append([Rect2(spans[6][0], fy + li * 30, spans[7][1] - spans[6][0], 30), "esc", -1])
