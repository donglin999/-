extends Control
## 挂轴式商店（原版 js/qihe-gift-ui.js shop()，样式 qihe-gift-ui.css .qs2*）。
## 原版按 1920×1080 写、整块 scale(.83334) 缩到 1600×900；这里同样在 1920 坐标里画，再把本节点缩 0.83334。
## opts：{list:[{id,price}], buys:{物品id:收价}, off:{物品id:折后价}, offNote, say}；返回时已结算（银两、行囊都在这里改）。
const K := preload("res://scripts/npc/gift_kit.gd")
const U := preload("res://scripts/npc/util.gd")
const SU := preload("res://scripts/npc/scroll_ui.gd")

signal done(v)
var ui; var p: Dictionary; var n; var opts: Dictionary
var _done := false
var tab := "buy"
var focus := 0
var msg := ""
var conf = null        # {k, n, i}
var list: Array = []
var buys = null
var off: Dictionary = {}
var scroll := 0        # 行列表首行（原版 overflow:auto + scrollIntoView）
var hits: Array = []   # [Rect2, kind, data]

const C := {"paper1": "#3a2b1f", "paper2": "#241a11", "row1": "#3f2e20", "row2": "#2b2016", "line": "#4e3a26", "gold": "#d9b46a", "gold2": "#ffe7b0",
	"txt": "#efe2c2", "dim": "#a8957a", "mute": "#7d6a52", "g-d": "#e3cc94", "g-c": "#6fd0b4", "g-b": "#c9a0f0", "g-m": "#e9dfc8", "bad": "#e8735a",
	"blue1": "#4f97c9", "blue2": "#255d86", "org1": "#d4774a", "org2": "#8d3f1f"}
const TITLE := {"buy": "买入", "buy5": "买入", "wear": "买下并装上", "sell": "出售", "sellall": "全部出售"}
const ROWS_Y := 150 + 84
const ROW_H := 100
const ROW_GAP := 10
const VIS := 6

func _init() -> void:
	size = Vector2(1920, 1080); scale = Vector2(0.83334, 0.83334); mouse_filter = Control.MOUSE_FILTER_STOP

func start() -> void:
	for x in opts.get("list", []):
		if DB.ITEMS.has(x.id): list.append(x)
	buys = opts.get("buys")
	off = opts.get("off", {}) if opts.get("off") is Dictionary else {}
	queue_redraw()

func _exit_tree() -> void: finish("closed")

func finish(v) -> void:
	if _done: return
	_done = true
	done.emit(v)

func he() -> String: return "她" if U.t(p.get("she")) else "他"
func silver() -> int: return int(U.num(G.S.get("silver")))
func have(id: String) -> int: return int(U.num(G.S.get("bag", {}).get(id)))
func price_of(x: Dictionary) -> int: return int(off[x.id]) if off.has(x.id) and off[x.id] != null else int(x.price)
func sell_list() -> Array:
	var a := []
	if buys is Dictionary:
		for id in buys:
			if DB.ITEMS.has(id) and have(id) > 0: a.append({"id": id, "price": buys[id]})
	return a
func rows() -> Array: return list if tab == "buy" else sell_list()

static func slot_of(k: String) -> String: return QJModel.mn_slot(k)
static func stackable(k: String) -> bool: return slot_of(k) == "" and not U.t(DB.ITEMS.get(k, {}).get("key"))
## QC：物品名颜色档
static func qc(k: String) -> String:
	var q := int(U.num(DB.ITEMS.get(k, {}).get("q")))
	return "g-b" if q >= 2 else ("g-c" if q == 1 else ("g-d" if slot_of(k) != "" else "g-m"))
## QN：品级 · 类别
static func qn(k: String) -> String:
	var a := []
	if slot_of(k) != "": a.append(str(QJModel.mn_q(k)[0]))
	a.append(QJModel.category(k))
	return " · ".join(a.filter(func(s): return s != ""))

## 这一行能做的事：[{k,label,cls,n}]，第一个是主操作（Enter）
func acts(x: Dictionary) -> Array:
	if tab == "sell":
		var hn := have(x.id)
		if not hn: return [{"k": "none", "label": "没有", "cls": "gr"}]
		var o := [{"k": "sell", "label": "出售", "cls": "bl", "n": 1}]
		if hn > 1: o.append({"k": "sellall", "label": "全部", "cls": "og", "n": hn})
		return o
	var pr := price_of(x)
	if pr > silver(): return [{"k": "none", "label": "不足", "cls": "gr"}]
	var o2 := [{"k": "buy", "label": "买入", "cls": "bl", "n": 1}]
	if slot_of(x.id) != "": o2.append({"k": "wear", "label": "装上", "cls": "og", "n": 1})
	elif stackable(x.id) and pr * 5 <= silver(): o2.append({"k": "buy5", "label": "买五", "cls": "og", "n": 5})
	return o2

func set_tab(t: String) -> void:
	if t == tab or (t == "sell" and buys == null): return
	tab = t; focus = 0; scroll = 0; msg = ""; conf = null; queue_redraw()

func ask(k: String) -> void:
	var rs := rows()
	if focus >= rs.size(): return
	var x: Dictionary = rs[focus]
	var al := acts(x)
	var a: Dictionary = al[0]
	for y in al:
		if y.k == k: a = y; break
	if a.k == "none":
		msg = "银两不够。" if tab == "buy" else "你身上没有这样东西。"
		queue_redraw(); return
	conf = {"k": a.k, "n": a.get("n", 1), "i": focus}
	queue_redraw()

## mnEquip('hero',k)：主角装备直接挂在 G.S 上；换下的放回行囊
static func equip_hero(k: String) -> void:
	var sl := slot_of(k)
	if sl == "" or int(U.num(G.S.bag.get(k))) <= 0: return
	var cur = G.S.get(sl)
	if cur: G.S.bag[cur] = int(U.num(G.S.bag.get(cur))) + 1
	G.S[sl] = k
	G.S.bag[k] = int(G.S.bag[k]) - 1

func deal() -> void:
	var rs := rows()
	var x: Dictionary = rs[conf.i]
	var it: Dictionary = DB.ITEMS[x.id]
	var nn := int(conf.n); var k: String = conf.k
	conf = null
	if tab == "buy":
		var tot := price_of(x) * nn
		if tot > silver(): msg = "银两不够。"; queue_redraw(); return
		G.S.silver = silver() - tot
		if not G.S.has("bag"): G.S.bag = {}
		G.S.bag[x.id] = have(x.id) + nn
		if k == "wear":
			equip_hero(x.id); msg = "%s，穿戴好了。" % it.name
		else: msg = "%s%s，您拿好。" % [it.name, (" %d 份" % nn) if nn > 1 else ""]
	else:
		var m := mini(nn, have(x.id))
		if not m: queue_redraw(); return
		G.S.bag[x.id] = have(x.id) - m
		G.S.silver = silver() + int(x.price) * m
		msg = "%s%s收下了，%d 两。" % [it.name, (" %d 件" % m) if m > 1 else "", int(x.price) * m]
	var pro = Flow.prologue() if Flow.has_method("prologue") else null
	if pro and pro.has_method("checkpoint"): pro.checkpoint()
	queue_redraw()

func on_key(k: String) -> void:
	var nn := rows().size()
	if conf != null:
		if k == "escape": conf = null; queue_redraw(); return
		if k in ["enter", " ", "e"]: deal()
		return
	if k == "escape": finish("done"); return
	if k in ["q", "e", "1", "2"]:
		if buys != null: set_tab("buy" if k in ["1", "q"] else "sell")
		return
	if k in ["arrowdown", "s"]: focus = (focus + 1) % maxi(1, nn)
	elif k in ["arrowup", "w"]: focus = (focus - 1 + nn) % maxi(1, nn)
	elif k in ["enter", " "]:
		var rs := rows()
		ask(acts(rs[focus])[0].k if focus < rs.size() else "")
		return
	queue_redraw()

func _gui_input(e: InputEvent) -> void:
	if _done: return
	if e is InputEventMouseButton and e.pressed:
		if e.button_index == MOUSE_BUTTON_WHEEL_DOWN: scroll = mini(scroll + 1, maxi(0, rows().size() - VIS)); queue_redraw()
		elif e.button_index == MOUSE_BUTTON_WHEEL_UP: scroll = maxi(0, scroll - 1); queue_redraw()
		elif e.button_index == MOUSE_BUTTON_LEFT:
			for i in range(hits.size() - 1, -1, -1):
				var h: Array = hits[i]
				if not h[0].has_point(e.position): continue
				match h[1]:
					"close": finish("done")
					"tab": set_tab(h[2])
					"row": focus = h[2]; queue_redraw()
					"act": focus = h[2][0]; ask(h[2][1])
					"cf": if h[2] == "ok": deal()
					"cfno": conf = null; queue_redraw()
				break
	accept_event()

# ──────── 画面 ────────
func col(k: String) -> Color: return Color(C[k])

func _t(s: String, pos: Vector2, px: float, c: Color, sp := 0.0, f: Font = null) -> float:
	var ff := Paint.font(f if f else UI.song, px, sp / px)
	draw_string(ff, pos, s, HORIZONTAL_ALIGNMENT_LEFT, -1, px, c)
	return ff.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
func _tw(s: String, px: float, sp := 0.0) -> float:
	return Paint.font(UI.song, px, sp / px).get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
func _tc(s: String, cx: float, y: float, px: float, c: Color, sp := 0.0) -> void:
	_t(s, Vector2(cx - _tw(s, px, sp) / 2, y), px, c, sp)

## .bt：蓝／橙／灰按钮
func _bt(r: Rect2, label: String, cls: String, dis := false) -> void:
	draw_rect(Rect2(r.position + Vector2(0, 2), r.size), Color.BLACK)
	var a: Color; var b: Color
	if cls == "gr" or dis: a = Color("#5a5248"); b = Color("#3a342e")
	elif cls == "og": a = col("org1"); b = col("org2")
	else: a = col("blue1"); b = col("blue2")
	Paint.grad(self, r, [[0.0, a], [1.0, b]], false)
	draw_rect(r, Color(0, 0, 0, 0.53), false, 2)
	draw_line(r.position + Vector2(2, 3), Vector2(r.end.x - 2, r.position.y + 3), Color(1, 1, 1, 0.16), 2)
	_tc(label, r.get_center().x + 1.5, r.get_center().y + 8, 22, Color("#a59a88") if (cls == "gr" or dis) else Color("#f6f0e0"), 3)

func _ic(r: Rect2, id: String, q: String, sz: float) -> void:
	Paint.grad(self, r, [[0.0, Color("#3a2b1e")], [1.0, Color("#17110b")]], false)
	draw_rect(r.grow(-2.5), Color.BLACK, false, 2)
	draw_rect(r, Color("#3f9a80") if q == "g-c" else (Color("#8a64b8") if q == "g-b" else Color("#7a5a32")), false, 3)
	K.item(self, r, id, sz)

func _rod(y: float) -> void:
	var r := Rect2(640, y, 1140, 30)
	draw_rect(Rect2(r.position + Vector2(0, 6), r.size), Color(0, 0, 0, 0.3))
	var sb := StyleBoxFlat.new(); sb.set_corner_radius_all(15); sb.bg_color = Color("#4a2e1a"); draw_style_box(sb, r)
	Paint.grad(self, r.grow_individual(-6, -2, -6, -2), [[0.0, Color("#7a5030")], [0.45, Color("#4a2e1a")], [1.0, Color("#24150b")]], false)
	for x in [640 - 22, 1780 + 22 - 34]:
		var e := Rect2(x, y - 6, 34, 42)
		var s2 := StyleBoxFlat.new(); s2.set_corner_radius_all(8); s2.bg_color = Color("#d8bd7c"); s2.border_color = Color("#4e3a16"); s2.set_border_width_all(2)
		draw_style_box(s2, e)

func _draw() -> void:
	hits = []
	var rs := rows()
	focus = clampi(focus, 0, maxi(0, rs.size() - 1))
	if focus < scroll: scroll = focus
	if focus >= scroll + VIS: scroll = focus - VIS + 1
	var cur = rs[focus] if focus < rs.size() else null
	var px := not U.t(p.get("portrait"))
	# .qs2-dim
	draw_rect(Rect2(0, 0, 1920, 1080), Color(4 / 255.0, 3 / 255.0, 2 / 255.0, 0.9))
	draw_circle(Vector2(1056, 540), 700, Color(16 / 255.0, 11 / 255.0, 7 / 255.0, 0.35))
	# 挂绳、木轴、纸面
	for x in [700, 1720]: draw_rect(Rect2(x, 0, 2, 136), Color("#8a6a3a"))
	var pr := Rect2(668, 150, 1084, 796)
	draw_rect(pr.grow_individual(6, 0, 6, 0), Color("#1c130b"))
	draw_rect(pr, col("paper2")); draw_circle(pr.position + pr.size * Vector2(0.5, 0.45), 430, col("paper1").lerp(col("paper2"), 0.3))
	draw_arc(pr.position + pr.size * Vector2(0.5, 0.48), 245, 0, TAU, 96, Color(1, 1, 1, 0.02), 30)
	_rod(132); _rod(940)
	# 页签（竖排木牌）
	var tabs := [["buy", "买入"]]
	if buys != null: tabs.append(["sell", "卖出"])
	for j in tabs.size():
		var sel: bool = tab == tabs[j][0]
		var r := Rect2(720 + j * (58 + 16), 8, 58, 112 if sel else 100)
		draw_rect(Rect2(r.position + Vector2(0, 6), r.size), Color(0, 0, 0, 0.4))
		Paint.grad(self, r, [[0.0, Color("#3a2616")], [0.5, Color("#5a3a22")], [1.0, Color("#3a2616")]], true)
		draw_rect(r, col("gold") if sel else Color("#7a5a32"), false, 2)
		draw_rect(Rect2(r.get_center().x - 3, r.end.y, 6, 12), Color("#a8874a"))
		for c in tabs[j][1].length():
			_tc(tabs[j][1][c], r.get_center().x, r.position.y + 12 + 22 + c * 28, 22, col("gold2") if sel else col("dim"))
		hits.append([r, "tab", tabs[j][0]])
	# 表头
	var th := Rect2(668 + 28, 150 + 22, 1028, 48)
	Paint.grad(self, th, [[0.0, Color("#4a3624")], [1.0, Color("#33251a")]], false); draw_rect(th, Color("#6a4e2e"), false, 1)
	var cx := [th.position.x, th.end.x - 300 - 120 - 170, th.end.x - 300 - 120, th.end.x - 300, th.end.x]
	var heads := ["名称", "价格", "持有" if tab == "buy" else "数量", ""]
	for c in 4:
		_tc(heads[c], (cx[c] + cx[c + 1]) / 2, th.position.y + 31, 19, col("dim"), 4)
		if c < 3: draw_line(Vector2(cx[c + 1], th.position.y + 6), Vector2(cx[c + 1], th.end.y - 6), Color("#6a4e2e", 0.53), 1)
	# 行
	for vi in range(scroll, mini(rs.size(), scroll + VIS)):
		_row(rs[vi], vi, Rect2(th.position.x, ROWS_Y + (vi - scroll) * (ROW_H + ROW_GAP), 1028, ROW_H), cx)
	if rs.size() < 5:
		var er := Rect2(th.position.x, ROWS_Y + (rs.size() - scroll) * (ROW_H + ROW_GAP), 1028, 92)
		Paint.grad(self, er, [[0.0, Color("#33261a")], [1.0, Color("#261c13")]], false); draw_rect(er, Color("#3e2e1e"), false, 1)
		var et := "暂时没有别的货"
		if tab == "sell":
			var nm := []
			for id in buys: if DB.ITEMS.has(id): nm.append(DB.ITEMS[id].name)
			et = "%s收%s，你身上%s" % [he(), "、".join(nm), "别的没有了" if rs.size() else "暂时没有"]
		_tc(et, er.get_center().x, er.get_center().y + 7, 18, col("mute"))
	# 关闭 ✕（right -14 top -30，46px 红）
	var xr := Rect2(668 + 1084 + 14 - 54, 150 - 30, 54, 54)
	_tc("✕", xr.get_center().x, xr.position.y + 44, 46, Color("#b8402c"))
	hits.append([xr, "close", null])
	# 钱串、灯笼
	for i in 3: draw_circle(Vector2(1806, 182 + i * 36), 16, Color("#9a7a40")); draw_circle(Vector2(1806, 182 + i * 36), 3, Color("#1c130b"))
	draw_rect(Rect2(1803, 166 + 3 * 36, 6, 110), Color("#4a3220"))
	var lr := Rect2(1820, 760, 64, 100)
	Paint.grad(self, lr, [[0.0, Color("#b8a77c")], [0.5, Color("#e8dcb4")], [1.0, Color("#b8a77c")]], true); draw_rect(lr, Color("#2e1c0e"), false, 3)
	_portrait(px)
	_say()
	if cur != null and conf == null: _tip(cur, px)
	_bottom()
	if conf != null: _conf_box()

## .qs2-r 一行货：图标＋名字｜价格｜持有｜按钮
func _row(x: Dictionary, i: int, r: Rect2, cx: Array) -> void:
	var it: Dictionary = DB.ITEMS[x.id]
	var pr := price_of(x) if tab == "buy" else int(x.price)
	var cut: bool = tab == "buy" and off.has(x.id)
	var bad: bool = tab == "buy" and pr > silver()
	var sel := i == focus
	draw_rect(Rect2(r.position + Vector2(0, 3), r.size), Color(0, 0, 0, 0.5))
	Paint.grad(self, r, [[0.0, col("row1")], [1.0, col("row2")]], false)
	if sel:
		draw_rect(r.grow(2), Color(col("gold"), 0.27), false, 4)
		draw_rect(r, col("gold"), false, 2)
	else: draw_rect(r, col("line"), false, 1)
	hits.append([r, "row", i])
	var a := 0.6 if bad else 1.0
	var q := qc(x.id)
	_ic(Rect2(r.position.x + 16, r.position.y + 10, 80, 80), x.id, q, 68)
	var nx := r.position.x + 16 + 80 + 16
	var nc := col(q); nc.a = a
	var sub := qn(x.id)
	_t(str(it.name), Vector2(nx, r.position.y + (44 if sub != "" else 60)), 26, nc, 2)
	if sub != "": _t(sub, Vector2(nx, r.position.y + 72), 14, Color(col("dim"), a), 1)
	# 价格：铜钱 + （原价删除线）+ 价
	var pc := col("bad") if bad else col("gold2")
	var ps := str(pr)
	var w := 28 + 8 + _tw(ps, 26) + ((_tw(str(x.price), 16) + 8) if cut else 0.0)
	var px0: float = (cx[1] + cx[2]) / 2 - w / 2
	var cc := Vector2(px0 + 14, r.get_center().y)
	draw_circle(cc, 14, Color("#5e421a")); draw_circle(cc, 12, Color("#c89a48")); draw_circle(cc + Vector2(-3, -3), 6, Color("#e6c87a", 0.6)); draw_circle(cc, 4, Color("#2a1a0a"))
	var tx := px0 + 36
	if cut:
		var ow := _t(str(x.price), Vector2(tx, r.get_center().y + 6), 16, col("mute"))
		draw_line(Vector2(tx, r.get_center().y + 1), Vector2(tx + ow, r.get_center().y + 1), col("mute"), 1)
		tx += ow + 8
	_t(ps, Vector2(tx, r.get_center().y + 9), 26, pc)
	var qt := (("持 %d" % have(x.id)) if have(x.id) else "—") if tab == "buy" else ("×%d" % have(x.id))
	_tc(qt, (cx[2] + cx[3]) / 2, r.get_center().y + 7, 21, Color(col("txt"), a))
	# 按钮（倒序排，右对齐，右留 20，gap 12）
	var bx: float = r.end.x - 20
	for ac in acts(x):
		var bw := maxf(110, _tw(ac.label, 22, 3) + 28)
		var br := Rect2(bx - bw, r.get_center().y - 26, bw, 52)
		_bt(br, ac.label, ac.cls, ac.k == "none")
		if ac.k != "none": hits.append([br, "act", [i, ac.k]])
		bx -= bw + 12

## .qs2-por：立绘（left 40 bottom 0，660×900，cover 顶对齐，下 20% 渐隐）；没有立绘放大地图小人
func _portrait(px: bool) -> void:
	if not px:
		var tex: Texture2D = Assets.tex(str(p.portrait))
		if tex == null: return
		var box := Rect2(40, 180, 660, 900)
		var s := maxf(box.size.x / tex.get_width(), box.size.y / tex.get_height())
		var src_w := box.size.x / s
		var sx := (tex.get_width() - src_w) / 2
		var steps := 24
		for k in steps:
			var y0 := box.size.y * k / steps
			var y1 := box.size.y * (k + 1) / steps
			var al := 1.0 if y1 <= box.size.y * 0.8 else clampf(1.0 - (y0 - box.size.y * 0.8) / (box.size.y * 0.2), 0, 1)
			draw_texture_rect_region(tex, Rect2(box.position.x, box.position.y + y0, box.size.x, y1 - y0), Rect2(sx, y0 / s, src_w, (y1 - y0) / s), Color(0.95, 0.93, 0.88, al))
		return
	if not (n is Dictionary and U.t(n.get("sp"))): return
	var key: String = str(n.sp).split(":")[0]
	for k in [key + "_d", key + "_d_0", key]:
		var fr = CharArt.frame(k)
		if fr:
			var rr: Rect2 = fr[1]
			var w := 300.0; var h := rr.size.y * w / rr.size.x
			draw_texture_rect_region(fr[0], Rect2(40 + 170, 1080 - 150 - h, w, h), rr)
			return

## .qs2-say：店主对话框（left 100 top 150，宽 460）
func _say() -> void:
	var s: String = msg if msg != "" else str(opts.get("say", ""))
	var f := Paint.font(UI.song, 21, 0)
	var lines := _wrap(f, s, 21, 460 - 40)
	var h := 14 + 16 * 1.7 + lines.size() * 21 * 1.7 + 14
	var r := Rect2(100, 150, 460, h)
	draw_rect(Rect2(r.position + Vector2(0, 6), r.size), Color(0, 0, 0, 0.35))
	var sb := StyleBoxFlat.new(); sb.bg_color = Color("#efe6cf", 0.95); sb.border_color = Color("#a88c58"); sb.set_border_width_all(1); sb.set_corner_radius_all(6)
	draw_style_box(sb, r)
	var tip := Vector2(r.position.x + 250, r.end.y)
	draw_colored_polygon(PackedVector2Array([tip + Vector2(-10, -1), tip + Vector2(10, -1), tip + Vector2(0, 10)]), Color("#efe6cf"))
	_t(str(p.name), Vector2(120, 150 + 14 + 21), 16, Color("#7a5a2a"), 4)
	for i in lines.size(): _t(lines[i], Vector2(120, 150 + 14 + 16 * 1.7 + i * 21 * 1.7 + 25), 21, Color("#2c2216"))

static func _wrap(f: Font, s: String, px: float, w: float) -> Array:
	var out := []; var cur := ""
	for ch in s:
		if cur != "" and f.get_string_size(cur + ch, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x > w: out.append(cur); cur = ""
		cur += ch
	if cur != "": out.append(cur)
	return out

## mnCmp('hero',{eq:{slot:id}})：换上这件后派生属性的变化 [[键, 旧, 新, 差], ...]
static func cmp_wear(id: String) -> Array:
	var sl := slot_of(id)
	if sl == "": return []
	var a: Dictionary = G.derived(G.S)
	var s2: Dictionary = G.S.duplicate(true); s2[sl] = id
	var b: Dictionary = G.derived(s2)
	var out := []
	for k in QJModel.MN_DK:
		var d = U.num(b.get(k)) - U.num(a.get(k))
		out.append([k, U.num(a.get(k)), U.num(b.get(k)), d])
	return out

## .qs2-tip：停在一行上的详情（left 330 top 560；无立绘 top 330）
func _tip(x: Dictionary, px: bool) -> void:
	var it: Dictionary = DB.ITEMS[x.id]
	var lines: Array = []   # [文字, 字号, 颜色]
	if U.t(it.get("desc")):
		for l in _wrap(Paint.font(UI.song, 16, 0), str(it.desc), 16, 330 - 36): lines.append([l, 16, col("dim")])
	if slot_of(x.id) != "":
		var cs := cmp_wear(x.id).filter(func(r): return r[3] != 0).slice(0, 3)
		if cs.is_empty(): lines.append(["与现在用的持平", 18, col("mute")])
		for r in cs:
			lines.append(["%s %s→%s %s%s" % [QJModel.MN_FXN.get(r[0], r[0]), U.jround(r[1]), U.jround(r[2]), "▲" if r[3] > 0 else "▼", U.jround(absf(r[3]))], 18, Color("#8fd19a") if r[3] > 0 else col("bad")])
	var prs := ""
	if tab == "buy":
		prs = ("售价 %d 两（原价 %d，%s）" % [price_of(x), int(x.price), str(opts.get("offNote", "")) if U.t(opts.get("offNote")) else "优惠"]) if off.has(x.id) else ("售价 %d 两" % int(x.price))
	else: prs = "收价 %d 两 · 你有 %d" % [int(x.price), have(x.id)]
	for l in _wrap(Paint.font(UI.song, 17, 0), prs, 17, 330 - 36): lines.append([l, 17, col("gold2")])
	var h := 14 + 22 * 1.4 + 6.0
	for l in lines: h += l[1] * 1.6
	h += 14 + 4
	var r := Rect2(330, 330 if px else 560, 330, h)
	draw_rect(Rect2(r.position + Vector2(0, 8), r.size), Color(0, 0, 0, 0.5))
	var sb := StyleBoxFlat.new(); sb.bg_color = Color("#14100b", 0.95); sb.border_color = col("gold"); sb.set_border_width_all(1); sb.set_corner_radius_all(4)
	draw_style_box(sb, r)
	var y := r.position.y + 14 + 22
	var nw := _t(str(it.name), Vector2(r.position.x + 18, y), 22, col(qc(x.id)), 2)
	if qn(x.id) != "": _t(qn(x.id), Vector2(r.position.x + 18 + nw + 10, y), 15, col("dim"))
	y += 6 + 4
	for l in lines:
		y += l[1] * 1.6
		_t(l[0], Vector2(r.position.x + 18, y - l[1] * 0.4), l[1], l[2])

## 下方：持有银两木牌、关系横幅、键位
func _bottom() -> void:
	var ms := "萧白持有银两：%d" % silver()
	var mw := _tw(ms, 24) + 48
	var mr := Rect2(96, 1080 - 40 - 52, mw, 52)
	draw_rect(mr.grow(4), Color(0, 0, 0, 0.4)); draw_rect(Rect2(mr.position + Vector2(0, 4), mr.size), Color.BLACK)
	Paint.grad(self, mr, [[0.0, Color("#e2d4ae")], [1.0, Color("#c4b07c")]], false); draw_rect(mr, Color("#5a3e22"), false, 2)
	_t(ms, Vector2(mr.position.x + 24, mr.position.y + 35), 24, Color("#2a1d10"))
	# 关系横幅 .rel（left 800 top 984 宽 880 高 48）
	var rr := Rect2(800, 984, 880, 48)
	Paint.grad(self, rr, [[0.0, Color("#22170e", 0)], [0.12, Color("#22170e", 0.93)], [0.88, Color("#22170e", 0.93)], [1.0, Color("#22170e", 0)]], true)
	draw_line(rr.position, Vector2(rr.end.x, rr.position.y), Color("#6a4e2e", 0.53), 1); draw_line(Vector2(rr.position.x, rr.end.y), rr.end, Color("#6a4e2e", 0.53), 1)
	var parts := []   # [文字, 颜色]
	var b: Dictionary = ui.Q().bond_get(p.id)
	parts.append_array([["与%s的关系：" % p.name, col("dim")], [str(b.stage), col("g-c")], ["（好感 %d）" % int(b.score), col("dim")]])
	if U.t(opts.get("offNote")): parts.append_array([["　|　", Color("#6a4e2e")], [str(opts.offNote), Color("#9fdc8e")]])
	var tw := 0.0
	for q in parts: tw += _tw(q[0], 18)
	var x := 1240 - tw / 2
	for q in parts: x += _t(q[0], Vector2(x, 984 + 31), 18, q[1])
	# 键位 .keys（top 1040，15px，u 色 dim）
	var ks := [["↑↓", "选"], ["Enter", "买入" if tab == "buy" else "出售"]]
	if buys != null: ks.append(["Q E", "换页"])
	ks.append(["Esc", "离开"])
	var kw := 0.0
	for k in ks: kw += _tw(k[0], 15) + 6 + _tw(k[1], 15)
	kw += 26 * (ks.size() - 1)
	var kx := 1240 - kw / 2
	for k in ks:
		kx += _t(k[0], Vector2(kx, 1040 + 16), 15, col("dim")) + 6
		kx += _t(k[1], Vector2(kx, 1040 + 16), 15, col("mute")) + 26

## .qs2-cf：花钱先过确认层
func _conf_box() -> void:
	var rs := rows()
	if conf.i >= rs.size(): conf = null; return
	var x: Dictionary = rs[conf.i]
	var it: Dictionary = DB.ITEMS[x.id]
	var nn := int(conf.n)
	var unit := price_of(x) if tab == "buy" else int(x.price)
	var tot := unit * nn
	var swap := ""
	if conf.k == "wear":
		var cur = G.S.get(slot_of(x.id))
		swap = ("替下「%s」，放回行囊" % DB.ITEMS[cur].name) if cur and DB.ITEMS.has(cur) else "这一格现在空着"
	var title: String = TITLE[conf.k]
	draw_rect(Rect2(0, 0, 1920, 1080), Color(0, 0, 0, 0.67))
	hits.append([Rect2(0, 0, 1920, 1080), "cfbg", null])
	var h := 70 + 80 + 16 + 32 + (16 + 26 if swap != "" else 0) + 16 + 10 + 52 + 34.0
	var r := Rect2(960 - 310, 540 - h / 2, 620, h)
	draw_rect(r.grow(4), Color.BLACK); draw_rect(Rect2(r.position + Vector2(0, 18), r.size), Color(0, 0, 0, 0.5))
	Paint.grad(self, r, [[0.0, Color("#2e2218")], [1.0, Color("#1b130c")]], false); draw_rect(r, Color("#8a6a3a"), false, 2)
	var pw := _tw(title, 28, 10) + 88
	var pl := Rect2(960 - pw / 2, r.position.y - 26, pw, 54)
	draw_rect(pl.grow(3), Color.BLACK)
	Paint.grad(self, pl, [[0.0, Color("#3a2616")], [1.0, Color("#22160c")]], false); draw_rect(pl, Color("#8a6a3a"), false, 2)
	_tc(title, 960 + 5, pl.position.y + 38, 28, col("gold2"), 10)
	var y := r.position.y + 70
	var q := qc(x.id)
	_ic(Rect2(r.position.x + 44, y, 80, 80), x.id, q, 56)
	var nw := _t(str(it.name), Vector2(r.position.x + 44 + 80 + 14, y + 48), 22, col(q))
	if nn > 1: _t(" ×%d" % nn, Vector2(r.position.x + 44 + 80 + 14 + nw, y + 48), 22, col("txt"))
	y += 80 + 16
	var xx := r.position.x + 44
	xx += _t("共需 " if tab == "buy" else "可得 ", Vector2(xx, y + 24), 22, col("txt"))
	xx += _t(str(tot), Vector2(xx, y + 24), 26, col("gold2"))
	var after := silver() - tot if tab == "buy" else silver() + tot
	_t(" 两　·　%s %d 两" % ["剩" if tab == "buy" else "之后有", after], Vector2(xx, y + 24), 22, col("txt"))
	y += 32
	if swap != "": y += 16; _t(swap, Vector2(r.position.x + 44, y + 20), 18, col("dim")); y += 26
	y += 16 + 10
	var okw := maxf(110, _tw(title, 22, 3) + 28)
	var okr := Rect2(r.end.x - 44 - okw, y, okw, 52)
	var nor := Rect2(okr.position.x - 16 - 110, y, 110, 52)
	_bt(nor, "再想想", "gr"); _bt(okr, title, "og" if conf.k == "wear" else "bl")
	hits.append([nor, "cfno", null]); hits.append([okr, "cf", "ok"])
