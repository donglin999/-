extends Control
## 易物秤（原版 js/qihe-gift-ui.js trade()，样式 qihe-gift-ui.css .qg-paper/.qg-scale/.qg-zone/.qg-sl/.qg-head/.qg-deal）。
## 画面 1600×900；秤为线描四件（stand/beam/panL/panR），秤杆按两边价值轻斜，弹簧阻尼缓缓到位；托区挂在秤盘下面跟着走。
const K := preload("res://scripts/npc/gift_kit.gd")
const U := preload("res://scripts/npc/util.gd")

signal done(v)
var ui; var p: Dictionary; var n
var _done := false
var put := [{}, {}]          # 原版 put[0]/put[1]（Map，保留放入顺序）
const MAX := 6
var say := ""
var say_kind := ""
var hero_say := ""
var full_until := 0.0        # .qg-full 显示到何时（1200ms）
var hits: Array = []         # [Rect2, side, where, id, ok]
var deal_rect := Rect2(715, 676, 170, 52)
const X_C := Vector2(1600 - 52 - 17, 96 + 17)   # .qg-x：right 52 top 96

# 秤（原版常量照抄）
const S0 := 0.86
const OX := (720 - 768 * S0) / 2
const OY := 44.0
const PV := Vector2(385, 117.5)
const HK := [Vector2(155, 129), Vector2(612.5, 129)]
const TH := 6 * PI / 180
var beam := {"th": 0.0, "w": 0.0}
var art := {}
var dys := [0.0, 0.0]

# 按住连放：350ms 后每 90ms 一次，松手停（原版 hold/stopHold）
var hold_fn: Callable = Callable()
var hold_next := 0.0

func _init() -> void:
	size = Vector2(1600, 900); mouse_filter = Control.MOUSE_FILTER_STOP

func gf(): return ui.G()
func he() -> String: return "她" if U.t(p.get("she")) else "他"

func _exit_tree() -> void: finish("closed")

func finish(v) -> void:
	if _done: return
	_done = true
	hold_fn = Callable()
	set_process(false)
	done.emit(v)

func start() -> void:
	var keys := {"stand": "ui_qh_trade_scale_stand", "beam": "ui_qh_trade_scale_beam", "panL": "ui_qh_trade_scale_panL", "panR": "ui_qh_trade_scale_panR"}
	for k in keys: art[k] = Assets.tex(keys[k]) if Assets.has(keys[k]) else null
	var ln = await gf().line_for("qh_trade_hero", {})   # 台词在 story/01-开始/人物-易物开口.ink
	hero_say = ln.text if ln else ""
	_update_say()
	queue_redraw()

func on_key(k: String) -> void:
	if k == "escape": finish("again")

func mine() -> Array:
	var a := []
	for id in put[0]: a.append([id, put[0][id]])
	return a
func theirs() -> Array:
	var a := []
	for id in put[1]: a.append([id, put[1][id]])
	return a

func my_goods() -> Array:
	var a := []
	var bag: Dictionary = G.S.get("bag", {})
	for id in bag:
		if int(bag[id]) > 0 and gf().GOODS.has(id) and DB.ITEMS.has(id):
			a.append({"id": id, "n": int(bag[id]), "tier": gf().tier_of(id), "ok": gf().accepts(p, id)})
	return a
func their_goods() -> Array:
	var a := []
	var st: Dictionary = gf().stock_of(p)
	for id in st:
		if int(st[id]) > 0 and DB.ITEMS.has(id): a.append({"id": id, "n": int(st[id]), "tier": gf().tier_of(id), "ok": true})
	return a

## 原版 updateSay：心情变了才换一句
func _update_say() -> void:
	var k: String = gf().mood(p, mine(), theirs())
	if k == say_kind: return
	say_kind = k
	var ln = await gf().line_for("qh_trade_line", {"pid": p.id, "kind": k})
	if _done: return
	say = ln.text if ln else ""
	queue_redraw()

func add(id: String, side: int) -> bool:
	var avail := int(U.num(gf().stock_of(p).get(id))) if side else int(U.num(G.S.get("bag", {}).get(id)))
	var m: Dictionary = put[side]
	var k := int(m.get(id, 0))
	if k >= avail: return false
	if not m.has(id) and m.size() >= MAX:
		full_until = Time.get_ticks_msec() + 1200; queue_redraw(); return false
	m[id] = k + 1
	beam.w += (1 if side else -1) * 0.06
	_changed(); return true

func sub(id: String, side: int) -> bool:
	var m: Dictionary = put[side]
	var k := int(m.get(id, 0))
	if not k: return false
	if k == 1: m.erase(id)
	else: m[id] = k - 1
	beam.w -= (1 if side else -1) * 0.06
	_changed(); return k > 1

func _changed() -> void:
	queue_redraw(); _update_say()

## 原版 onDeal
func on_deal() -> void:
	if not gf().deal(p, mine(), theirs()): return
	put[0].clear(); put[1].clear()
	say_kind = "done"
	var ln = await gf().line_for("qh_trade_line", {"pid": p.id, "kind": "done"})
	say = ln.text if ln else ""
	say_kind = "done"
	queue_redraw()

func _process(dt: float) -> void:
	dt = minf(0.033, dt)
	var a: float = gf().value_of(mine())
	var b: float = gf().value_of(theirs(), gf().trade_rate(p))
	var t := TH * tanh((b - a) / maxf(4, (a + b) * 0.35)) if a + b else 0.0
	beam.w += (3.2 * 3.2 * (t - beam.th) - 2 * 0.55 * 3.2 * beam.w) * dt
	beam.th += beam.w * dt
	for i in 2: dys[i] = (HK[i].x - PV.x) * S0 * sin(beam.th)
	if hold_fn.is_valid() and Time.get_ticks_msec() >= hold_next:
		hold_next += 90
		if hold_fn.call() == false: hold_fn = Callable()
	queue_redraw()

func _gui_input(e: InputEvent) -> void:
	if _done: return
	if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
		if not e.pressed: hold_fn = Callable(); accept_event(); return
		if e.position.distance_to(X_C) < 18: finish("again"); accept_event(); return
		if deal_rect.has_point(e.position):
			if gf().deal_ok(p, mine(), theirs()): on_deal()
			accept_event(); return
		for h in hits:
			if h[0].has_point(e.position):
				if not h[4]: break
				var fn: Callable = (func(): return add(h[3], h[1])) if h[2] == "inv" else (func(): return sub(h[3], h[1]))
				hold_fn = Callable()
				fn.call()
				hold_fn = fn; hold_next = Time.get_ticks_msec() + 350
				break
	accept_event()

## .qg-sl 物品格（72 或托区 66，圆角 6，wood 底）；记入点击区
func _slot(r: Rect2, g: Dictionary, cnt: String, side: int, where: String) -> void:
	K.cell(self, r, K.tier_cls(int(g.tier)), 6, r.has_point(get_local_mouse_position()) and g.ok, false, true)
	K.item(self, r, str(g.id), 56, not g.ok)
	if cnt != "": K.count(self, r, cnt)
	if not g.ok: K.why(self, r, he() + "不收")
	hits.append([r, side, where, str(g.id), g.ok])

## .qg-head：头像 62 + 名字 + 气泡（右侧镜像）
func _head(pos: Vector2, right: bool, who: Dictionary, nn, name_s: String, say_s: String) -> void:
	var av := Rect2(pos.x + (220 + 12 if right else 0), pos.y, 62, 62)
	K.avatar(self, av, who, nn, 8)
	var fx := av.position.x - 12 if right else av.end.x + 12
	var f := Paint.font(UI.song_bold, 16, 3.0 / 16)
	var nw := f.get_string_size(name_s, HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x
	var ty := pos.y + 4
	draw_string(f, Vector2(fx - nw if right else fx, ty + 16), name_s, HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("#efd9a6"))
	if say_s == "": return
	var sf := Paint.font(UI.song, 14.5, 1.0 / 14.5)
	var lines := _wrap(sf, say_s, 14.5, 220 - 24)
	var bw := 0.0
	for l in lines: bw = maxf(bw, Paint.text_w(sf, l, 14.5))
	var bh := lines.size() * 14.5 * 1.45 + 10
	var bx := fx - (bw + 24) if right else fx
	var br := Rect2(bx, ty + 16 + 4 + 4, bw + 24, bh)
	draw_rect(Rect2(br.position + Vector2(0, 2), br.size), Color(0, 0, 0, 0.45))
	var sb := StyleBoxFlat.new(); sb.bg_color = Color("#f3e9d2"); sb.set_corner_radius_all(3); draw_style_box(sb, br)
	for i in lines.size():
		Paint.draw_text(self, sf, Vector2(br.position.x + 12, br.position.y + 5 + 14.5 * 1.45 * i + 15), lines[i], 14.5, Color("#1d1a15"))

static func _wrap(f: Font, s: String, px: float, w: float) -> Array:
	var out := []; var cur := ""
	for ch in s:
		if cur != "" and Paint.text_w(f, cur + ch, px) > w: out.append(cur); cur = ""
		cur += ch
	if cur != "": out.append(cur)
	return out

func _ctext(s: String, cx: float, y: float, px: float, col: Color, f: Font, sp := 0.0) -> void:
	var ff := Paint.font(f, px, sp / px)
	var w := Paint.text_w(ff, s, px)
	Paint.draw_text(self, ff, Vector2(cx - w / 2, y), s, px, col)

func _draw() -> void:
	hits = []
	draw_rect(Rect2(0, 0, 1600, 900), Color(8 / 255.0, 10 / 255.0, 9 / 255.0, 0.5))   # .qg-catch
	# 左：我方木板 + 行囊
	K.panel(self, Rect2(80, 120, 330, 640), true)
	_head(Vector2(104, 146), false, {"portrait": "p_opening_hero_village"}, null, str(G.S.get("name", "萧白")), hero_say)
	var left := my_goods()
	for i in maxi(12, left.size()):
		var r := Rect2(126 + (i % 3) * 84, 246 + int(i / 3) * 84, 72, 72)
		if i < left.size():
			var g: Dictionary = left[i]; var k := int(put[0].get(g.id, 0))
			_slot(r, g, str(g.n - k) if g.n - k > 0 else "", 0, "inv")
		else: K.cell(self, r, 0, 6, false, true, true)
	# 中：纸面 + 秤
	var pr := Rect2(440, 120, 720, 640)
	draw_rect(pr.grow(6), Color(20 / 255.0, 14 / 255.0, 8 / 255.0, 0.8)); draw_rect(pr.grow(3), Color("#7a5a3a"))
	var sb := StyleBoxFlat.new(); sb.bg_color = Color("#efe5cd"); sb.set_corner_radius_all(3); draw_style_box(sb, pr)
	_ctext("易物", 800 + 5, 120 + 14 + 26, 24, Color("#7a6a50"), UI.song_bold, 10)
	var w := 768 * S0; var h := 512 * S0
	var o := Vector2(440 + OX, 120 + OY)
	var mod := Color(1, 1, 1, 0.5)
	if art.get("stand"): draw_texture_rect(art.stand, Rect2(o, Vector2(w, h)), false, mod)
	if art.get("beam"):
		var pv := o + PV * S0
		draw_set_transform(pv, beam.th, Vector2.ONE)
		draw_texture_rect(art.beam, Rect2(o - pv, Vector2(w, h)), false, mod)
		draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
	for i in 2:
		var im = art.get("panR" if i else "panL")
		if im: draw_texture_rect(im, Rect2(o + Vector2(0, dys[i]), Vector2(w, h)), false, mod)
	# 托区 .qg-zone：262×176，挂在秤盘下面
	for i in 2:
		var zp := Vector2(440 + OX + HK[i].x * S0 - 131, 120 + OY + 322 * S0 + dys[i])
		draw_rect(Rect2(zp + Vector2(0, 3), Vector2(262, 176)), Color(80 / 255.0, 60 / 255.0, 30 / 255.0, 0.18))
		var zs := StyleBoxFlat.new(); zs.bg_color = Color("#ddd0b3"); zs.set_corner_radius_all(12); zs.set_border_width_all(2); zs.border_color = Color(150 / 255.0, 132 / 255.0, 100 / 255.0, 0.75)
		draw_style_box(zs, Rect2(zp, Vector2(262, 176)))
		var j := 0
		for id in put[i]:
			var r := Rect2(zp + Vector2(16 + (j % 3) * 80, 14 + int(j / 3) * 78), Vector2(66, 66))
			_slot(r, {"id": id, "tier": gf().tier_of(id), "ok": true}, str(put[i][id]), i, "pan")
			j += 1
	if Time.get_ticks_msec() < full_until: _ctext("放不下了", 800, 600 + 18, 14.5, Color("#9b3b2e"), UI.song, 2)
	var tip := "提示：按住图标可以快速增减数量"
	var tf := Paint.font(UI.song, 14.5, 1.5 / 14.5)
	var tw := Paint.text_w(tf, tip, 14.5) + 36
	var ts := StyleBoxFlat.new(); ts.draw_center = false; ts.set_border_width_all(2); ts.border_color = Color(150 / 255.0, 132 / 255.0, 100 / 255.0, 0.6); ts.set_corner_radius_all(4)
	draw_style_box(ts, Rect2(800 - tw / 2, 626, tw, 27))
	_ctext(tip, 800, 626 + 19, 14.5, Color("#7a6a50"), UI.song, 1.5)
	# 成交钮 .qg-deal
	var ok: bool = gf().deal_ok(p, mine(), theirs())
	draw_rect(deal_rect.grow(4), Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.35)); draw_rect(deal_rect.grow(2), Color("#1d3c47"))
	Paint.grad(self, deal_rect, [[0.0, Color("#3d7a8c")], [1.0, Color("#2a5868")]], false)
	_ctext("成交", 800 + 6, 676 + 35, 24, Color("#f6ecd6"), UI.song, 12)
	if not ok: draw_rect(deal_rect.grow(4), Color(0.3, 0.3, 0.3, 0.55))
	# 右：对方木板 + 随身物
	K.panel(self, Rect2(1190, 120, 330, 640), true)
	_head(Vector2(1214, 146), true, p, n, str(p.name), say)
	var right := their_goods()
	if right.is_empty(): _ctext(he() + "身上没有肯换的东西了", 1236 + 120, 246 + 24, 18, Color("#7a6a52"), UI.song)
	var y0 := 246 + (42 if right.is_empty() else 0)
	for i in maxi(12, right.size()):
		var r := Rect2(1236 + (i % 3) * 84, y0 + int(i / 3) * 84, 72, 72)
		if i < right.size():
			var g: Dictionary = right[i]; var k := int(put[1].get(g.id, 0))
			_slot(r, g, str(g.n - k) if g.n - k > 0 else "", 1, "inv")
		else: K.cell(self, r, 0, 6, false, true, true)
	K.close_btn(self, X_C)
	K.keys(self, [["", "点一下放上秤一件 · 按住连放 · 点托区里的东西拿回一件"], ["Esc", "不换了"]])
