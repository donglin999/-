## 小游戏候选试玩（原版 js/qh-mode-cultivation-minigames.js）
## 状态与主存档隔离，未接入剧情，不授予养成奖励。
## 样式照 qh-mode-cultivation.css 的 .mg-* / .cu-game-host 规则。
class_name CuMinigames
extends VBoxContainer

## 原版 catalog
const CATALOG := [
	{"id": "stance", "code": "MG01", "name": "站位踏步", "category": "basic", "tip": "用方向键移动到脚印，按回车站稳。完成五次落脚；没有限时。"},
	{"id": "moves", "code": "MG02", "name": "招式拆解", "category": "skill", "tip": "把起势、转身、出手、收势排好。可点击或拖入；排错可以撤回。"},
	{"id": "sort", "code": "MG03", "name": "材料整理", "category": "production", "tip": "按形状把六份练习材料归入叶、籽、根三篮。点材料，再点竹篮；数字1—3选篮。"},
	{"id": "trail", "code": "MG04", "name": "行路观察", "category": "stroll", "tip": "从左上角沿浅色石路走到渡口，途经两个歇脚点。方向键或点相邻格；走入泥地可重试。"},
]
const KINDS := ["leaf", "seed", "root"]
const NAMES := {"leaf": "叶", "seed": "籽", "root": "根"}
const MOVE_NAMES := ["起势", "转身", "出手", "收势"]
const TARGETS := [4, 3, 6, 7, 4]
const ROAD := [0, 1, 5, 9, 10, 14, 15]
const PAINTED := ["basic", "skill", "production", "arts", "chores", "mail", "stroll", "rest"]
## 主体字号（.cu-game-host 继承面板 p 字号；试玩中 .86em）
const EM_LIST := 24.0
const EM_PLAY := 20.64

var game = null
var box: Control = null
var em := EM_LIST

## 原版 initial(id)
static func initial(id: String) -> Dictionary:
	if not CATALOG.any(func(g): return g.id == id): push_error("没有这个小游戏")
	return {"id": id, "status": "playing", "position": 0 if id == "trail" else 4, "step": 0, "misses": 0,
		"order": [], "sorted": [], "selected": 0, "visited": [0], "message": ""}

## 原版 act(s,type,value)
static func act(s: Dictionary, type: String, value) -> Dictionary:
	if s.status != "playing": return s
	if s.id == "stance":
		if type == "move":
			var n: int = s.position + int({"left": -1, "right": 1, "up": -3, "down": 3}.get(value, 0))
			if n >= 0 and n < 9 and (value != "left" or s.position % 3 > 0) and (value != "right" or s.position % 3 < 2): s.position = n
		if type == "confirm":
			if s.position == TARGETS[s.step]:
				s.step += 1; s.message = "这一步站稳了。"
				if s.step == TARGETS.size(): s.status = "won"
			else:
				s.misses += 1; s.message = "重心还没落在脚印上，移动后再试。"
	if s.id == "moves":
		if type == "add" and value is int and value >= 0 and value < 4 and not s.order.has(value): s.order.append(value)
		if type == "undo" and s.order.size(): s.order.pop_back()
		if type == "check":
			if s.order == [0, 1, 2, 3]: s.status = "won"
			else:
				s.misses += 1
				s.message = "先把四步排齐。" if s.order.size() < 4 else "动作没接上，撤回后重新排一排。"
	if s.id == "sort":
		if type == "select" and value is int and value >= 0 and value < 6 and not s.sorted.has(value): s.selected = value
		if type == "bin" and KINDS.has(value):
			if KINDS[posmod(s.selected, 3)] == value:
				if not s.sorted.has(s.selected): s.sorted.append(s.selected)
				s.selected = -1
				for i in 6:
					if not s.sorted.has(i): s.selected = i; break
				s.message = "这一份归好了。"
				if s.sorted.size() == 6: s.status = "won"
			else:
				s.misses += 1; s.message = "看一看材料形状，再选竹篮。"
	if s.id == "trail" and type == "move":
		var n: int = value if value is int else s.position + int({"left": -1, "right": 1, "up": -4, "down": 4}.get(value, 0))
		var adjacent: bool = n >= 0 and n < 16 and (absi(n - s.position) == 4 or (floori(n / 4.0) == floori(s.position / 4.0) and absi(n - s.position) == 1))
		if adjacent:
			s.position = n
			if not ROAD.has(n):
				s.status = "lost"; s.message = "踩进泥地了。观察浅色石路，再试一次。"
			else:
				if not s.visited.has(n): s.visited.append(n)
				if n == 15:
					if s.visited.has(5) and s.visited.has(10): s.status = "won"
					else: s.message = "先途经两个歇脚点。"
	return s

## 原版 mount(host)：host 为面板 body；box 为面板外框（用于 :has(.mg-play) 的位置切换）
static func mount(host: Control, panel_box: Control = null) -> CuMinigames:
	var m := CuMinigames.new()
	m.box = panel_box
	m.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	m.size_flags_vertical = Control.SIZE_EXPAND_FILL
	m.add_theme_constant_override("separation", 10)
	host.add_child(m)
	m.render()
	return m

## 原版 mount 返回的 state()
func state():
	return null if game == null else game.duplicate(true)

func _px(v: float) -> int: return int(round(v * em))

## 原版 painted(cat)：ui/dock_icons_v2.png 4 列 2 行
func _painted(cat: String, w_em: float) -> TextureRect:
	var i := PAINTED.find(cat)
	var t := CuUI.tex(CuUI.BASE + "ui/dock_icons_v2.png")
	var r: TextureRect
	if t != null:
		var w := t.get_width() / 4.0
		var h := t.get_height() / 2.0
		r = CuUI.atlas_img(CuUI.BASE + "ui/dock_icons_v2.png", [(i % 4) * w, floori(i / 4.0) * h, w, h])
	else:
		r = CuUI.img(null)
	r.custom_minimum_size = Vector2(_px(w_em), _px(w_em))
	r.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	return r

## 带子节点的按钮（原版 <button> 内含图与文字）
func _cbtn(type: String, value, kids: Array, min_size: Vector2, primary := false) -> Button:
	var b := CuUI.btn("", "", "", primary)
	b.custom_minimum_size = min_size
	b.set_meta("mg", type); b.set_meta("value", value)
	var v := VBoxContainer.new()
	CuUI.fill(v)
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.add_theme_constant_override("separation", _px(0.3))
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for k in kids:
		_ignore(k)
		v.add_child(k)
	b.add_child(v)
	b.pressed.connect(func(): if not b.disabled: _input_cmd(type, value))
	return b

func _ignore(n: Node) -> void:
	if n is Control: (n as Control).mouse_filter = Control.MOUSE_FILTER_IGNORE
	for c in n.get_children(): _ignore(c)

## 文字按钮
func _tbtn(text: String, type: String, value = null, primary := false, size_em := 1.0) -> Button:
	var b := CuUI.btn(text, "", "", primary)
	b.add_theme_font_size_override("font_size", _px(size_em))
	b.set_meta("mg", type); b.set_meta("value", value)
	b.pressed.connect(func(): if not b.disabled: _input_cmd(type, value))
	return b

func _label(text: String, size_em: float, col: Color, bold := false, align := HORIZONTAL_ALIGNMENT_LEFT) -> Label:
	var l := CuUI.lbl(text, _px(size_em), col, bold, align)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l

func _wrap(l: Label, width: float) -> Label:
	l.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY
	l.custom_minimum_size.x = width
	return l

func _host_width() -> float:
	var w := size.x
	if w < 10 and box != null: w = box.size.x - CuUI.W * 0.03 - 12
	return max(w, 400.0)

## 原版 :has(.cu-game-host) top:27% bottom:21% left/right 8%；:has(.mg-play) top:22% bottom:20%
func _place_box() -> void:
	if box == null: return
	var t := 22.0 if game != null else 27.0
	var bt := 20.0 if game != null else 21.0
	CuUI.place(box, CuUI.W * 0.08, CuUI.H * t / 100.0, CuUI.W * 0.84, CuUI.H * (1.0 - (t + bt) / 100.0))

## 棋盘格底色（#cultivation .mg-board button / .mg-target / .mg-road / .mg-mud / .mg-current）
func _cell_box(kind: String, current: bool) -> StyleBoxFlat:
	var bg := Color("#a5996f")
	if kind == "target": bg = Color("#cfbb74")
	elif kind == "road": bg = Color("#d6c190")
	elif kind == "mud": bg = Color("#7a6c47")
	var sb := CuUI.box(bg, Color("#716345"), 2, 2, 0)
	if kind == "target": sb.border_color = Color("#e9b32f"); sb.set_border_width_all(3)
	if current: sb.border_color = Color("#517641"); sb.set_border_width_all(3)
	return sb

## 格子按钮：内容为玩家（action_stroll_v2 首帧）、脚印或文字
func _cell(type: String, i: int, kind: String, current: bool, mark: String, side: float) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(side, max(side, 44.0))
	for k in ["normal", "hover", "pressed", "disabled"]: b.add_theme_stylebox_override(k, _cell_box(kind, current))
	var fc := _cell_box(kind, current); fc.border_color = Color("#d18d39"); fc.set_border_width_all(3)
	b.add_theme_stylebox_override("focus", fc)
	b.add_theme_font_override("font", UI.kai)
	var col := Color("#bcb290") if kind == "mud" else Color("#392918")
	if current: col = Color("#fff4bd")
	b.add_theme_font_size_override("font_size", _px(1.3 if current else 1.0))
	for k in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color", "font_disabled_color"]: b.add_theme_color_override(k, col)
	b.set_meta("mg", type); b.set_meta("value", i)
	if current:
		var t := CuUI.tex(CuUI.BASE + "animations/action_stroll_v2.png")
		var p := CuUI.img(null)
		if t != null: p.texture = CuUI._atlas(t, Rect2(0, 0, t.get_width() / 2.0, t.get_height() / 2.0))
		var s := float(_px(2.25))
		p.size = Vector2(s, s); p.position = Vector2((side - s) / 2.0, (max(side, 44.0) - s) / 2.0)
		b.add_child(p)
	elif mark == "foot":
		for j in 2:
			var f := Panel.new()
			var fsb := CuUI.box(Color("#574329"))
			fsb.corner_radius_top_left = 8; fsb.corner_radius_top_right = 10; fsb.corner_radius_bottom_left = 6; fsb.corner_radius_bottom_right = 6
			f.add_theme_stylebox_override("panel", fsb)
			f.mouse_filter = Control.MOUSE_FILTER_IGNORE
			f.size = Vector2(_px(0.55), _px(1.1))
			f.pivot_offset = f.size / 2.0
			f.rotation_degrees = -15
			f.position = Vector2(side / 2.0 - _px(0.5) + j * _px(0.5), max(side, 44.0) / 2.0 - _px(0.55) + j * _px(0.2))
			b.add_child(f)
	else:
		b.text = mark
	b.pressed.connect(func(): if not b.disabled: _input_cmd(type, i))
	return b

func _grid(cols: int, width_em: float) -> GridContainer:
	var g := GridContainer.new()
	g.columns = cols
	g.add_theme_constant_override("h_separation", 5); g.add_theme_constant_override("v_separation", 5)
	g.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	g.custom_minimum_size.x = _px(width_em)
	return g

## 材料形状（.mg-material.mg-leaf/.mg-seed/.mg-root）
func _material(kind: String) -> Control:
	var holder := Control.new()
	holder.custom_minimum_size = Vector2(_px(1.4), _px(1.9))
	var p := Panel.new()
	var sb := CuUI.box(Color("#80924f"), Color("#506c3d"), 2)
	var sz := Vector2(_px(1.0), _px(1.8))
	var rot := 0.0
	if kind == "leaf":
		sb.corner_radius_top_left = _px(0.9); sb.corner_radius_top_right = 1; sb.corner_radius_bottom_right = _px(0.85); sb.corner_radius_bottom_left = 2
		rot = 30
	elif kind == "seed":
		sb.bg_color = Color("#aa8958"); sb.border_color = Color("#876b40")
		sz = Vector2(_px(1.3), _px(1.3)); sb.set_corner_radius_all(_px(0.65))
	else:
		sb.bg_color = Color("#bc9c62"); sb.border_color = Color("#977546")
		sz = Vector2(_px(0.7), _px(1.8))
		sb.corner_radius_top_left = 4; sb.corner_radius_top_right = 7; sb.corner_radius_bottom_right = 12; sb.corner_radius_bottom_left = 15
		rot = -15
	sb.shadow_color = Color("#33333377"); sb.shadow_size = 2; sb.shadow_offset = Vector2(1, 3)
	p.add_theme_stylebox_override("panel", sb)
	p.size = sz; p.pivot_offset = sz / 2.0; p.rotation_degrees = rot
	p.position = (holder.custom_minimum_size - sz) / 2.0
	holder.add_child(p)
	return holder

## 横排等分网格（grid-template-columns:repeat(n,1fr)）
func _hgrid(n: int, width: float, gap: float) -> GridContainer:
	var g := GridContainer.new()
	g.columns = n
	g.add_theme_constant_override("h_separation", int(gap)); g.add_theme_constant_override("v_separation", int(gap))
	g.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	g.custom_minimum_size.x = width
	return g

## 原版 render(focus)
func render(focus := "") -> void:
	if not is_inside_tree(): return
	for c in get_children():
		remove_child(c); c.queue_free()
	em = EM_PLAY if game != null else EM_LIST
	_place_box()
	var w := _host_width()
	var ink := Color("#362b1c")
	if game == null:
		add_child(_wrap(_label("四个候选，先试玩再决定。", 1.0, ink, false, HORIZONTAL_ALIGNMENT_CENTER), w))
		var gap := _px(0.6)
		var cw := (w - gap * 3) / 4.0
		var cat := _hgrid(4, w, gap)
		for g in CATALOG:
			var strong := _label(g.name, 1.2, ink, true, HORIZONTAL_ALIGNMENT_CENTER)
			var small := _wrap(_label(g.code + " · " + g.tip, 0.75, Color("#5d4a2e")), cw - 40)
			var b := _cbtn("launch", g.id, [_painted(g.category, 4.0), strong, small], Vector2(cw, 0))
			b.custom_minimum_size.y = _px(4.0) + _px(1.2) * 1.4 + _px(0.75) * 1.5 * 5 + 40
			cat.add_child(b)
		add_child(cat)
		add_child(_wrap(_label("试玩不消耗体力，不写入行卷，也不决定剧情走向。", 0.8, Color("#7d6c4b"), false, HORIZONTAL_ALIGNMENT_CENTER), w))
		_focus_first("")
		return
	var g: Dictionary = {}
	for x in CATALOG:
		if x.id == game.id: g = x
	# .mg-top
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", _px(1.0))
	var tv := VBoxContainer.new()
	tv.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var progress := ""
	if game.id == "stance": progress = str(game.step) + " / 5步"
	elif game.id == "sort": progress = str(game.sorted.size()) + " / 6份"
	elif game.id == "trail":
		var n := 0
		for i in [5, 10]: if game.visited.has(i): n += 1
		progress = str(n) + " / 2处歇脚"
	var h3 := HBoxContainer.new()
	h3.add_theme_constant_override("separation", _px(1.0))
	h3.add_child(_label(g.name, 1.1, ink, true))
	if progress != "":
		var cnt := _label(progress, 0.88, Color("#79633d"))
		cnt.size_flags_vertical = Control.SIZE_SHRINK_END
		h3.add_child(cnt)
	tv.add_child(h3)
	tv.add_child(_wrap(_label(g.tip, max(14.0, 0.84 * em) / em, Color("#5d4a2e")), w * 0.75))
	top.add_child(tv)
	var back := _tbtn("返回候选", "back", null, false, 0.8)
	back.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	top.add_child(back)
	add_child(top)
	# .mg-play
	var play := VBoxContainer.new()
	play.alignment = BoxContainer.ALIGNMENT_CENTER
	play.add_theme_constant_override("separation", _px(0.35))
	play.size_flags_vertical = Control.SIZE_EXPAND_FILL
	add_child(play)
	_board(play, w)
	# .mg-footer
	var line := ColorRect.new(); line.color = Color("#b9a573"); line.custom_minimum_size = Vector2(0, 1)
	add_child(line)
	var foot := HBoxContainer.new()
	foot.custom_minimum_size.y = 44
	foot.add_theme_constant_override("separation", _px(1.0))
	var ended: bool = game.status != "playing"
	var msg: String = game.message
	if ended and game.status == "won": msg = "完成了！本次只作试玩记录。"
	if game.misses: msg += " · 可继续尝试"
	var st := _label(msg, 0.82, ink)
	st.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	st.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY
	foot.add_child(st)
	foot.add_child(_tbtn("重新试玩", "retry", null, false, 0.82 * 0.9))
	var fbg := PanelContainer.new()
	fbg.add_theme_stylebox_override("panel", CuUI.box(Color("#ebddb9")))
	fbg.add_child(foot)
	add_child(fbg)
	if ended:
		for b in _buttons(play): b.disabled = true
	var sel := focus
	if sel == "":
		if ended: sel = "retry"
		elif game.id == "sort": sel = "select:" + str(game.selected)
		else: sel = "confirm" if game.id == "stance" else ("add" if game.id == "moves" else "trail-cell")
	_focus_first(sel)

## 各小游戏棋盘
func _board(play: VBoxContainer, w: float) -> void:
	var ink := Color("#362b1c")
	if game.id == "stance":
		var grid := _grid(3, 10.0)
		var side := (_px(10.0) - 10) / 3.0
		for i in 9:
			var tgt: bool = TARGETS[min(game.step, TARGETS.size() - 1)] == i and game.step < TARGETS.size()
			grid.add_child(_cell("stance-cell", i, "target" if tgt else "", game.position == i, "foot" if tgt else "", side))
		play.add_child(grid)
		var c := _tbtn("站稳 · 回车", "confirm", null, true)
		c.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		play.add_child(c)
	elif game.id == "moves":
		var pw := w * 0.9
		var gap := _px(0.7)
		var pool := _hgrid(4, pw, gap)
		var cw := (pw - gap * 3) / 4.0
		for i in [2, 0, 3, 1]:
			var b := _cbtn("add", i, [_painted("skill", 2.8), _label(MOVE_NAMES[i], 1.0, ink, false, HORIZONTAL_ALIGNMENT_CENTER)], Vector2(cw, _px(2.8) + _px(1.0) * 1.5 + 30))
			b.disabled = game.order.has(i)
			pool.add_child(b)
		play.add_child(pool)
		var tray_box := PanelContainer.new()
		var tsb := CuUI.box(Color(0, 0, 0, 0), Color("#977947"), 2, 0, _px(0.5))
		tray_box.add_theme_stylebox_override("panel", tsb)
		tray_box.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		tray_box.custom_minimum_size = Vector2(pw, _px(3.0))
		var tg := _px(0.4)
		var tray := _hgrid(4, pw - _px(1.0) - 4, tg)
		for i in 4:
			var cell := PanelContainer.new()
			var csb := CuUI.box(Color("#aa955b38"), Color(0, 0, 0, 0), 0, 0, _px(0.2))
			cell.add_theme_stylebox_override("panel", csb)
			cell.custom_minimum_size = Vector2((pw - _px(1.0) - 4 - tg * 3) / 4.0, _px(1.8))
			var t: String = str(i + 1) if i >= game.order.size() else MOVE_NAMES[game.order[i]]
			var l := _label(t, 1.0, ink, false, HORIZONTAL_ALIGNMENT_CENTER)
			l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			cell.add_child(l)
			tray.add_child(cell)
		tray_box.add_child(tray)
		play.add_child(tray_box)
		var bs := HBoxContainer.new()
		bs.alignment = BoxContainer.ALIGNMENT_CENTER
		bs.add_theme_constant_override("separation", _px(0.7))
		bs.add_child(_tbtn("撤回一步", "undo"))
		bs.add_child(_tbtn("演练这一套", "check", null, true))
		play.add_child(bs)
	elif game.id == "sort":
		var mw := w * 0.95
		var gap := _px(0.5)
		var mats := _hgrid(6, mw, gap)
		var cw := (mw - gap * 5) / 6.0
		for i in 6:
			var k: String = KINDS[i % 3]
			var b := _cbtn("select", i, [_material(k), _label(NAMES[k] + "形", 0.8, ink, false, HORIZONTAL_ALIGNMENT_CENTER)], Vector2(cw, _px(1.9) + _px(0.8) * 1.5 + 30))
			b.disabled = game.sorted.has(i)
			if game.selected == i:
				var on: StyleBoxFlat = (b.get_theme_stylebox("normal") as StyleBoxFlat).duplicate()
				on.border_color = Color("#668248"); on.set_border_width_all(3)
				b.add_theme_stylebox_override("normal", on); b.add_theme_stylebox_override("hover", on)
			mats.add_child(b)
		play.add_child(mats)
		var bw := w * 0.8
		var bg := _px(1.0)
		var baskets := _hgrid(3, bw, bg)
		for i in 3:
			var k: String = KINDS[i]
			baskets.add_child(_cbtn("bin", k, [_painted("production", 3.0), _label(NAMES[k] + "篮 · " + str(i + 1), 1.0, ink, false, HORIZONTAL_ALIGNMENT_CENTER)], Vector2((bw - bg * 2) / 3.0, _px(3.0) + _px(1.0) * 1.5 + 30)))
		play.add_child(baskets)
	elif game.id == "trail":
		var grid := _grid(4, 11.0)
		var side := (_px(11.0) - 15) / 4.0
		for i in 16:
			var mark := "渡" if i == 15 else ("歇" if i == 5 or i == 10 else "")
			grid.add_child(_cell("trail-cell", i, "road" if ROAD.has(i) else "mud", game.position == i, mark, side))
		play.add_child(grid)

func _buttons(n: Node) -> Array:
	var out := []
	for c in n.get_children():
		if c is Button: out.append(c)
		out.append_array(_buttons(c))
	return out

## 原版焦点：selector 为 "类型" 或 "类型:值"，找不到时取第一个可用按钮
func _focus_first(sel: String) -> void:
	var all := _buttons(self)
	var pick: Button = null
	if sel != "":
		var parts := sel.split(":")
		for b: Button in all:
			if b.disabled or b.get_meta("mg", "") != parts[0]: continue
			if parts.size() > 1 and str(b.get_meta("value")) != parts[1]: continue
			pick = b; break
	if pick == null:
		for b: Button in all:
			if not b.disabled: pick = b; break
	if pick != null: pick.call_deferred("grab_focus")

## 原版 input(type,value)
func _input_cmd(type: String, value = null) -> void:
	if type == "launch": game = initial(value); render(); return
	if type == "back": game = null; render(); return
	if type == "retry": game = initial(game.id); render(); return
	if game == null: return
	if type == "stance-cell":
		var v: int = value
		if absi(v - game.position) == 3 or (floori(v / 3.0) == floori(game.position / 3.0) and absi(v - game.position) == 1): game.position = v
	else:
		act(game, "move" if type == "trail-cell" else type, value)
	render()

## 原版 host.onkeydown：方向键（站位、行路）、回车（站位）、1—3（材料）
func _input(ev: InputEvent) -> void:
	if game == null or not is_visible_in_tree(): return
	if not (ev is InputEventKey) or not ev.pressed: return
	var k := ev as InputEventKey
	var dir: String = {KEY_LEFT: "left", KEY_RIGHT: "right", KEY_UP: "up", KEY_DOWN: "down"}.get(k.keycode, "")
	if dir != "" and game.id in ["stance", "trail"]:
		get_viewport().set_input_as_handled()
		act(game, "move", dir); render()
	elif k.keycode in [KEY_ENTER, KEY_KP_ENTER] and game.id == "stance":
		get_viewport().set_input_as_handled()
		_input_cmd("confirm")
	elif game.id == "sort" and k.keycode >= KEY_1 and k.keycode <= KEY_3:
		get_viewport().set_input_as_handled()
		_input_cmd("bin", KINDS[k.keycode - KEY_1])
