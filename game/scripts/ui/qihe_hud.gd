extends Control
## 栖河探索 HUD 扩展。对应原版 js/qihe-hud.js（hud 包裹）与 js/qihe-hud.css；小地图对应 js/qihe-navigation.js render/bind/toggle，
## 样式取 js/qihe-chapter-presentation.css 的 .qh-minimap 一节。坐标按 1280×720 #game 换算（百分比照抄）。
## 由主会话挂到 hud.gd 下：add_child(preload("res://scripts/ui/qihe_hud.gd").new())，并在 hud.refresh() 里调 refresh()。
## 挂上后 hud.gd 原有的地名题签与「江湖」按钮应隐藏（原版 #hud.qh-hud 整体替换 hud 内容）。

const W := 1280.0
const H := 720.0
const MAX_TRACK := 4   # 左侧最多列出的非主线追踪条数
const ATLAS := "res://assets/ui/jianghu-v5/icons-atlas.png"
## 图集格各图标包围盒中心（background-position 百分比，background-size 435.42%）
const POSITIONS := {"party": [2.17, 33.75], "bag": [65.94, 2.64], "skill": [34.01, 2.64], "quest": [34.01, 33.8], "sys": [65.89, 33.8], "map": [2.12, 94.67]}
## 11-10 试玩审查：名字和顺序跟江湖菜单的页签对齐（队伍、武学、行囊、行记……）；原来第一个叫“江湖”、行囊武学前后对调
const NAV := [["party", "队伍", "I"], ["skill", "武学", "K"], ["bag", "行囊", "B"], ["quest", "行记", "L"], ["map", "地图", "M"], ["sys", "设置", "Esc"]]
const TEXT := Color("#f2e5c9")
const GOLD := Color("#bea36a")
const TRACK_BG := [Color("#121a16e6"), Color("#121a1699")]   # 底加深，右端不再全透
const TRACK_HOV := [Color("#121a16f2"), Color("#121a16b8")]
const TW := 232.0   # 追踪栏宽（11-09 第四十八轮：字放大一档，框随之放宽）

var map_open := false        # QiheNavigation mapOpen
var _status: Button
var _face: Control
var _name: Label
var _chapter: Label
var _hp: Control
var _mp: Control
var _nav: Control
var _loc: Label
var _tracker: VBoxContainer
var _map: Control
var _map_canvas: Control
var _controls: Control
var _thumb_key := ""
var _thumb: Texture2D
var _tick := 0.0

func _init() -> void:
	size = Vector2(W, H)
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func _ready() -> void:
	_build_status()
	_build_nav()
	_loc = _label("", 16, TEXT, 0.12)
	# 11-09 第四十八轮：地名压在画面上看不清，加半透明深底
	var lsb := StyleBoxFlat.new(); lsb.bg_color = Color("#121b16b0")
	lsb.content_margin_left = 10; lsb.content_margin_right = 10; lsb.content_margin_top = 2; lsb.content_margin_bottom = 3
	lsb.set_corner_radius_all(2)
	_loc.add_theme_stylebox_override("normal", lsb)
	_loc.position = Vector2(0, H * 0.17)
	add_child(_loc)
	_tracker = VBoxContainer.new()
	_tracker.add_theme_constant_override("separation", 4)
	_tracker.position = Vector2(W * 0.025, H * 0.24)
	_tracker.custom_minimum_size.x = TW
	_tracker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_tracker)
	_build_map()
	_build_controls()

func _label(t: String, sz: int, col: Color, sp := 0.0, font: Font = null) -> Label:
	return Paint.label(t, font if font else UI.serif, sz, col, sp, Color(0, 0, 0, 1), 3)

## 原版全局 kbd 样式：底 #2a2119、1px #a38a5e 边、圆角、下方 2px #0008 硬阴影、字 #f3d58e
func _kbd(t: String, fs: int, radius: int) -> PanelContainer:
	var p := PanelContainer.new()
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var st := StyleBoxFlat.new()
	st.bg_color = Color(42 / 255.0, 33 / 255.0, 25 / 255.0)
	st.border_color = Color("#a38a5e"); st.set_border_width_all(1); st.set_corner_radius_all(radius)
	st.shadow_color = Color(0, 0, 0, 0.533); st.shadow_size = 0; st.shadow_offset = Vector2(0, 2)
	st.content_margin_left = 2; st.content_margin_right = 2; st.content_margin_top = 0; st.content_margin_bottom = 0
	p.add_theme_stylebox_override("panel", st)
	var l := Label.new(); l.text = t
	l.add_theme_font_override("font", UI.sans); l.add_theme_font_size_override("font_size", fs)
	l.add_theme_color_override("font_color", Color("#f3d58e"))
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.custom_minimum_size = Vector2(maxf(0, (16.0 if fs >= 10 else 12.0) - 6), 14.0 if fs >= 10 else 13.0)
	l.add_theme_constant_override("line_spacing", 0)
	p.add_child(l)
	return p

func _flat(b: Button) -> Button:
	b.flat = true
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	var e := StyleBoxEmpty.new()
	for k in ["normal", "hover", "pressed", "focus", "disabled"]: b.add_theme_stylebox_override(k, e)
	return b

func _can_open() -> bool:
	return G.S != null and G.mode == "scene" and not World.busy and not Dialog.busy and not UI.panel_open()

# ───────── 左上状态牌 .qh-status ─────────
func _build_status() -> void:
	_status = _flat(Button.new())
	_status.position = Vector2(W * 0.02, H * 0.03)
	_status.size = Vector2(64 + 12 + 190, 75)
	_status.tooltip_text = "查看萧白属性"
	_status.pressed.connect(func(): if _can_open(): Menu.open("party", "hero"))
	_status.draw.connect(func():
		Paint.grad(_status, Rect2(Vector2.ZERO, _status.size), [[0, Color("#171d1bed")], [1, Color(0x17 / 255.0, 0x1d / 255.0, 0x1b / 255.0, 0)]]))
	add_child(_status)
	_face = Control.new()
	_face.size = Vector2(64, 75)
	_face.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_face.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	_face.draw.connect(_draw_face)
	_status.add_child(_face)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 2)
	v.position = Vector2(76, 0); v.size = Vector2(175, 75)
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var top := HBoxContainer.new(); top.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_name = _label("", 18, TEXT)
	_name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	# 11-09 第四十八轮：时段小字原在名字右边、伸出牌外压在地图上，挪进牌里、名字下面一行
	_chapter = _label("", 11, Color("#d8c9a4"))
	top.add_child(_name)
	v.add_child(top)
	v.add_child(_chapter)
	_hp = _meter([Color("#833930"), Color("#b77c59")])
	_mp = _meter([Color("#2c6269"), Color("#7da1a4")])
	v.add_child(_hp); v.add_child(_mp)
	_status.add_child(v)

## .qh-face：六边形裁切（clip-path 50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%），img 高 180% 顶对齐
func _draw_face() -> void:
	var w := 64.0; var h := 75.0
	var pts := PackedVector2Array([Vector2(w / 2, 0), Vector2(w, h * 0.25), Vector2(w, h * 0.75), Vector2(w / 2, h), Vector2(0, h * 0.75), Vector2(0, h * 0.25)])
	_face.draw_colored_polygon(pts, Color("#c3c0a2"))
	var borrowed: bool = true if G.S != null and G.S.get("prologue", {}).get("arrival", {}).get("borrowed") else false
	var tex := Assets.tex("assets/p_" + ("opening_hero_village" if borrowed else "opening_hero_modern") + ".webp")
	if tex:
		# object-fit:cover 到 64×135，object-position:top
		var bw := w; var bh := h * 1.8
		var k := maxf(bw / tex.get_width(), bh / tex.get_height())
		var sw := bw / k; var sh := bh / k
		var src := Rect2((tex.get_width() - sw) / 2, 0, sw, sh)
		var uvs := PackedVector2Array()
		for p in pts: uvs.append((src.position + Vector2(p.x / bw * sw, p.y / bh * sh)) / tex.get_size())
		_face.draw_colored_polygon(pts, Color.WHITE, uvs, tex)
	var loop := pts.duplicate(); loop.append(pts[0])
	_face.draw_polyline(loop, Color("#c0ac78"), 1.0, true)

## .qh-meter：高 15、skewX(-12deg)、底 #141a18d9、下边 1px #ae9760；文字 10px 居中
func _meter(cols: Array) -> Control:
	var m := Control.new()
	m.custom_minimum_size = Vector2(175, 15)
	m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	m.set_meta("ratio", 0.0); m.set_meta("text", "")
	m.draw.connect(func():
		var sk := 15.0 * tan(deg_to_rad(12))
		var w := m.size.x
		var poly := func(x0: float, x1: float) -> PackedVector2Array:
			return PackedVector2Array([Vector2(x0 + sk / 2, 0), Vector2(x1 + sk / 2, 0), Vector2(x1 - sk / 2, 15), Vector2(x0 - sk / 2, 15)])
		m.draw_colored_polygon(poly.call(0.0, w), Color("#141a18d9"))
		var fw: float = w * float(m.get_meta("ratio"))
		if fw > 0:
			var pp: PackedVector2Array = poly.call(0.0, fw)
			var cc := PackedColorArray([cols[0], cols[1], cols[1], cols[0]])
			if fw < w:
				cc = PackedColorArray([cols[0], cols[0].lerp(cols[1], fw / w), cols[0].lerp(cols[1], fw / w), cols[0]])
			m.draw_polygon(pp, cc)
		m.draw_line(Vector2(-sk / 2, 14.5), Vector2(w - sk / 2, 14.5), Color("#ae9760"), 1.0)
		var t: String = m.get_meta("text")
		var f: Font = UI.sans
		var tw := f.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x
		m.draw_string(f, Vector2((w - tw) / 2 + 1, 12), t, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0, 0, 0, 0.8))
		m.draw_string(f, Vector2((w - tw) / 2, 11), t, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, TEXT))
	return m

# ───────── 右上导航 .qh-nav ─────────
func _build_nav() -> void:
	_nav = Control.new()
	_nav.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for e in NAV:
		row.add_child(_nav_button(e[0], e[1], e[2]))
	_nav.add_child(row)
	row.position = Vector2(30, 0)
	# 11-09 第四十八轮：建行时子项还没量好尺寸，最右的“设置”被屏幕边切掉；改成量好后再靠右摆，右边距同左边状态牌
	var place := func():
		var sz := row.get_combined_minimum_size()
		_nav.size = Vector2(sz.x + 30 + 12, sz.y + 6)
		_nav.position = Vector2(W - W * 0.02 - _nav.size.x, H * 0.03)
		_nav.queue_redraw()
	row.minimum_size_changed.connect(place)
	place.call()
	_nav.draw.connect(func():
		Paint.grad(_nav, Rect2(Vector2.ZERO, _nav.size), [[0, Color(0x18 / 255.0, 0x20 / 255.0, 0x1d / 255.0, 0)], [1, Color("#18201dd9")]]))
	add_child(_nav)

## .qh-nav button：图标 42×42（图集 435.42% 缩放后按百分比取位）+ 13px 标签 + 右上 10px 键位
func _nav_button(id: String, label: String, key: String) -> Button:
	var b := _flat(Button.new())
	b.custom_minimum_size = Vector2(46, 42 + 2 + 18 + 4)
	b.tooltip_text = label + (" · " + key if key else "")
	var ic := Control.new()
	ic.size = Vector2(42, 42); ic.position = Vector2(2, 2)
	ic.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ic.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	var tex: Texture2D = load(ATLAS)
	ic.draw.connect(func():
		if tex == null: return
		var sw := tex.get_width() / 4.3542; var sh := tex.get_height() / 4.3542
		var p: Array = POSITIONS[id]
		var src := Rect2((tex.get_width() - sw) * p[0] / 100.0, (tex.get_height() - sh) * p[1] / 100.0, sw, sh)
		# filter:drop-shadow(0 2px 2px #0009)；悬停 drop-shadow(0 0 5px #edc66b) 并上移 1px
		var hov := b.is_hovered()
		var off := Vector2(0, -1) if hov else Vector2.ZERO
		ic.draw_texture_rect_region(tex, Rect2(Vector2(0, 2) + off, ic.size), src, Color(0, 0, 0, 0.35))
		if hov: ic.draw_texture_rect_region(tex, Rect2(off - Vector2(1, 1), ic.size + Vector2(2, 2)), src, Color("#edc66b80"))
		ic.draw_texture_rect_region(tex, Rect2(off, ic.size), src))
	b.mouse_entered.connect(ic.queue_redraw); b.mouse_exited.connect(ic.queue_redraw)
	b.add_child(ic)
	var l := _label(label, 13, TEXT)
	l.position = Vector2(0, 46); l.size = Vector2(46, 18)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.add_child(l)
	# 实测 hud.json：kbd 15×15（Esc 25、M 17）、10px、字 #f3d58e、底 rgb(42,33,25)、1px #a38a5e、圆角 3、阴影 0 2px #0008、opacity .8，
	# 右缘与按钮右缘齐、顶齐（窗口 px ÷ 0.95 换回游戏框 1280 基准）
	var k := _kbd(key, 10, 3)
	k.modulate.a = 0.8
	b.add_child(k)
	k.reset_size(); k.position = Vector2(46 - k.get_combined_minimum_size().x, 0)
	b.pressed.connect(func():
		if not _can_open(): return
		if id == "map": toggle()
		else: Menu.open(id))
	return b

# ───────── 小地图 .qh-minimap（qihe-navigation.js render，150ms 刷新） ─────────
func _build_map() -> void:
	var w := 286.0                       # clamp(178px, 24vw, 286px) @1280
	var cw := w - 14 - 2; var ch := cw * 220.0 / 328.0
	_map = Panel.new()
	var sb := StyleBoxFlat.new(); sb.bg_color = Color("#14201be6"); sb.border_color = Color("#9c8960"); sb.set_border_width_all(1)
	_map.add_theme_stylebox_override("panel", sb)
	_map.size = Vector2(w, 1 + 7 + 17 + 5 + ch + 5 + 14 + 7 + 1)
	_map.position = Vector2(W * 0.975 - w, H * 0.23)
	_map.visible = false
	add_child(_map)
	var hd := _label("区域舆图 · 北 ↑", 11, Color("#e9d9b4"))
	hd.position = Vector2(8, 8)
	_map.add_child(hd)
	var x := _flat(Button.new())
	x.text = "×"; x.tooltip_text = "收起地图 · M / Esc"
	x.add_theme_font_size_override("font_size", 16)
	x.add_theme_color_override("font_color", TEXT); x.add_theme_color_override("font_hover_color", Color("#fff1c7"))
	x.size = Vector2(20, 18); x.position = Vector2(w - 8 - 20, 6)
	x.pressed.connect(func(): toggle(false))
	_map.add_child(x)
	_map_canvas = Control.new()
	_map_canvas.position = Vector2(8, 8 + 17 + 5); _map_canvas.size = Vector2(cw, ch)
	_map_canvas.mouse_default_cursor_shape = Control.CURSOR_CROSS
	_map_canvas.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	_map_canvas.draw.connect(_draw_map)
	_map_canvas.gui_input.connect(_map_click)
	_map.add_child(_map_canvas)
	var ft := _label("白 · 本人　青 · 交互　金 · 目标", 10, Color("#c2cdb8"), 0.0, UI.sans)
	ft.position = Vector2(8, _map_canvas.position.y + ch + 5)
	_map.add_child(ft)

func _side() -> Node:
	return Flow.get_node_or_null("Side")

func _draw_map() -> void:
	if G.S == null or World.cur.is_empty(): return
	var c := _map_canvas
	var k := c.size.x / 328.0             # canvas 328×220 按 CSS 宽度缩放显示
	var w := 328.0; var h := 220.0
	var gw: float = float(World.cur.get("gw", 48)) * World.TS; var gh: float = float(World.cur.get("gh", 27)) * World.TS
	var bg_key := str(World.cur.get("bg", ""))
	if _thumb_key != bg_key:
		_thumb_key = bg_key; _thumb = Assets.tex(bg_key) if bg_key != "" else null
	c.draw_rect(Rect2(Vector2.ZERO, c.size), Color("#283d31"))
	if _thumb: c.draw_texture_rect(_thumb, Rect2(Vector2.ZERO, c.size), false)
	c.draw_rect(Rect2(Vector2.ZERO, c.size), Color("#10171177"))
	var sd := _side()
	var target = sd.nav_target_node(sd.nav_guide().get("target")) if sd else null
	for n in World.npcs_of(World.cur):
		var px: float = float(n.x) * World.TS / gw * w; var py: float = float(n.y) * World.TS / gh * h
		c.draw_rect(Rect2((px - 1.5) * k, (py - 1.5) * k, 3 * k, 3 * k), Color("#7bdac7") if n.get("sp") else Color("#d4c5a1"))
	if target is Dictionary:
		c.draw_arc(Vector2(float(target.x) * World.TS / gw * w, float(target.y) * World.TS / gh * h) * k, 6 * k, 0, TAU, 32, Color("#ffdb73"), 2 * k, true)
	var pp := Vector2(World.player.x / gw * w, World.player.y / gh * h) * k
	c.draw_circle(pp, 3.5 * k + k, Color("#182b24"))
	c.draw_circle(pp, 3.5 * k, Color.WHITE)

## bind：点击画布，选最近的 NPC（距离 < max(gw,gh)·TS·0.08）作为追踪目标
func _map_click(ev: InputEvent) -> void:
	if not (ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT): return
	if World.busy or Dialog.busy: return
	var gw: float = float(World.cur.get("gw", 48)) * World.TS; var gh: float = float(World.cur.get("gh", 27)) * World.TS
	var x: float = ev.position.x / _map_canvas.size.x * gw; var y: float = ev.position.y / _map_canvas.size.y * gh
	var best = null; var bd := INF
	for n in World.npcs_of(World.cur):
		var d := Vector2(float(n.x) * World.TS - x, float(n.y) * World.TS - y).length()
		if d < bd: bd = d; best = n
	if best != null and bd < maxf(gw, gh) * 0.08:
		var sd := _side()
		if sd: sd.nav_selected = {"scene": G.S.get("scene", World.cur_id), "id": best.id, "name": best.get("name", "")}
		UI.hud()

## QiheNavigation.toggle(force)
func toggle(force = null) -> void:
	if not (G.S != null and G.mode == "scene" and not World.busy and not Dialog.busy and not UI.panel_open()): return
	map_open = (not map_open) if force == null else preload("res://scripts/npc/util.gd").t(force)
	UI.hud()

## 原版 keydown 捕获阶段：M 开关地图，地图开着时 Esc 收起
func _input(ev: InputEvent) -> void:
	if not is_visible_in_tree() or not (ev is InputEventKey) or not ev.pressed or ev.echo: return
	var k := ev as InputEventKey
	if k.ctrl_pressed or k.meta_pressed or k.alt_pressed: return
	if k.keycode == KEY_M or (k.keycode == KEY_ESCAPE and map_open):
		if not (G.S != null and G.mode == "scene" and not World.busy and not Dialog.busy and not UI.panel_open()): return
		get_viewport().set_input_as_handled()
		toggle(null if k.keycode == KEY_M else false)

func _process(d: float) -> void:
	_tick += d
	if _tick < 0.15: return
	_tick = 0.0
	if _map.visible: _map_canvas.queue_redraw()
	# 对话中：追踪、操作提示、地图隐藏，按钮半透明不可点（#game:has(#dlg:not([hidden]))）
	# 11-09 第四十八轮：人物交互（赠礼、偷窃、查看）开着时，地图的追踪栏和操作提示也收起
	var talking: bool = Dialog.busy or Npc.is_open \
		or (Npc.gift_ui != null and Npc.gift_ui.is_open) or (Npc.steal_ui != null and "is_open" in Npc.steal_ui and Npc.steal_ui.is_open)
	_tracker.visible = not talking
	_controls.visible = not talking
	_loc.visible = not talking
	_map.visible = map_open and not talking
	for b in [_status, _nav]:
		b.modulate.a = 0.55 if talking else 1.0
	# 11-10 第四十九轮：主角或地图上的人走到追踪栏、右上菜单底下时，这两块变淡（三成），走开再恢复
	if not talking:
		var under := _people_rects()
		# 11-10 试玩审查：三成太淡，字读不出；改五成五
		_tracker.modulate.a = 0.55 if _hits(_tracker.get_global_rect(), under) else 1.0
		_nav.modulate.a = 0.55 if _hits(_nav.get_global_rect(), under) else 1.0
	_status.mouse_filter = Control.MOUSE_FILTER_IGNORE if talking else Control.MOUSE_FILTER_STOP
	_nav.process_mode = Node.PROCESS_MODE_DISABLED if talking else Node.PROCESS_MODE_INHERIT

## 主角和地图上的人在屏幕上大致占的框（脚底往上一人高），HUD 坐标
func _people_rects() -> Array:
	var out := []
	if G.mode != "scene" or World.cur.is_empty() or World.player == null: return out
	var pts := [Vector2(World.player.x, World.player.y)]
	for n in World.npcs:
		if Npc.person_for(n) != null: pts.append(Vector2(float(n.x) * World.TS, float(n.y) * World.TS))
	for p in pts:
		var sx: float = (p.x - World.cam.x) / World.VW * W; var sy: float = (p.y - World.cam.y) / World.VH * H
		out.append(Rect2(sx - 18, sy - 74, 36, 74))
	return out

func _hits(r: Rect2, rects: Array) -> bool:
	for x in rects:
		if r.intersects(x): return true
	return false

# ───────── 底部操作提示 .qh-controls ─────────
func _build_controls() -> void:
	_controls = PanelContainer.new()
	var sb := StyleBoxFlat.new(); sb.bg_color = Color("#121b16c8")   # 11-09 第四十八轮：底太透，加深
	sb.content_margin_left = 9; sb.content_margin_right = 9; sb.content_margin_top = 4; sb.content_margin_bottom = 4
	_controls.add_theme_stylebox_override("panel", sb)
	_controls.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_controls.add_child(_label("WASD 移动  ·  Shift 走跑  ·  E 交谈  ·  M 地图", 11, Color("#e5d8b9"), 0.08))
	add_child(_controls)
	_controls.reset_size()
	_controls.position = Vector2(W * 0.02, H * 0.97 - _controls.get_combined_minimum_size().y)

# ───────── 左侧追踪 .qh-tracker ─────────
## 当前行程 .qh-objective：padding 8 14、左线 2px #bea36a、底 #141d19bf→透明；标题 12px #d3bd88，正文 14px 至多 3 行
func _objective(guide: Dictionary) -> Button:
	var b := _flat(Button.new())
	b.tooltip_text = "J 看当前一件 · L 打开行记"
	var v := VBoxContainer.new(); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_theme_constant_override("separation", 0)
	var hr := HBoxContainer.new(); hr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_theme_constant_override("separation", 3)
	# 字号按原版页面实测（1280 宽）：标题行 9px、正文 11px（行高 16）、说明 9px #cabb96；框 200 宽，左右内边距 9、上下 6
	# 11-09 第四十八轮：字小色淡看不清，全体大一档；J 键收进标题行右端
	# 11-10 试玩审查：标题写“行记”、角标却是 J，和右上“行记 L”对不上；J 看的是眼下这一件，标题改“当前行程”
	var hl := _label("当前行程", 11, Color("#e0cb94")); hl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var jk := _kbd("J", 9, 2); jk.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	hr.add_child(hl); hr.add_child(jk)
	v.add_child(hr)
	var t := _label(str(guide.get("title", "")) if guide.get("title") else "随处走走", 13, TEXT)
	t.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; t.max_lines_visible = 3   # 11-10 第四十九轮：按词折行，标点不放行首
	t.add_theme_constant_override("line_spacing", 19 - int(UI.serif.get_height(13)))
	v.add_child(t)
	var dl := _label(str(guide.get("detail", "")), 11, Color("#d6c8a4"))
	dl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dl.visible = dl.text != ""
	v.add_child(dl)
	b.add_child(v)
	_fit(b, v, 9, 6, [GOLD, 2], TRACK_BG, TRACK_HOV)
	b.pressed.connect(func():
		if not _can_open(): return
		var pr := Flow.get_node_or_null("Prologue")
		if pr and pr.has_method("journal"): pr.journal()       # QihePrologue.journal()
		else: Menu.open("quest"))
	return b

## 按钮内容自适应：按钮宽 200，左右 padding，画左线与渐变底
func _fit(b: Button, v: Control, px: float, py: float, line: Array, bg: Array, hov: Array) -> void:
	v.position = Vector2(px + line[1], py)
	v.size.x = TW - px * 2 - line[1]
	for c in v.get_children(): if c is Label or c is HBoxContainer: (c as Control).custom_minimum_size.x = v.size.x
	var hh: float = v.get_combined_minimum_size().y
	b.custom_minimum_size = Vector2(TW, hh + py * 2)
	b.draw.connect(func():
		var r := Rect2(Vector2.ZERO, b.size)
		var g: Array = hov if b.is_hovered() else bg
		Paint.grad(b, r, [[0, g[0]], [1, g[1]]])
		b.draw_rect(Rect2(0, 0, line[1], r.size.y), line[0]))
	b.mouse_entered.connect(b.queue_redraw); b.mouse_exited.connect(b.queue_redraw)

## .qh-track：padding 4 9、左线 2px #bea36a80；「◆ 」8px 金 + 11px 标题（至多 2 行），地点 9px #cabb96
func _track(r: Dictionary) -> Button:
	var b := _flat(Button.new())
	b.tooltip_text = "在小地图标出" if (r.get("activity") or r.get("npc")) else "查看任务"
	var v := VBoxContainer.new(); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_theme_constant_override("separation", 3)
	# 2026-11-09 用户：任务样式一大一小。和“当前行程”统一：同样的小标题行、内边距、左线和底色
	v.add_child(_label("追踪任务", 11, Color("#e0cb94")))
	var t := RichTextLabel.new()
	t.bbcode_enabled = true; t.fit_content = true; t.scroll_active = false
	t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	t.add_theme_font_override("normal_font", UI.serif)
	t.add_theme_font_size_override("normal_font_size", 13)
	t.add_theme_color_override("default_color", TEXT)
	t.add_theme_color_override("font_shadow_color", Color.BLACK); t.add_theme_constant_override("shadow_offset_y", 1)
	t.text = "[color=#bea36a][font_size=10]◆ [/font_size][/color]" + str(r.title).replace("[", "[lb]")
	t.custom_minimum_size.x = TW - 18 - 2
	v.add_child(t)
	if r.get("where"):
		var w := _label(str(r.where), 11, Color("#d6c8a4"))
		w.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS; w.clip_text = true
		v.add_child(w)
	b.add_child(v)
	_fit(b, v, 9, 6, [GOLD, 2], TRACK_BG, TRACK_HOV)
	var key: String = r.key
	b.pressed.connect(func():
		if not _can_open(): return
		var row = null
		for x in Menu.tracked_quests():
			if x.key == key: row = x
		var sd := _side()
		if row and row.get("activity") and sd: sd.nav_track_activity(str(row.activity))
		elif row and row.get("npc") and sd: sd.nav_track_npc(str(row.npc))
		else: Menu.open_quest(key))
	return b

func _more(n: int) -> Button:
	var b := _flat(Button.new())
	var v := VBoxContainer.new(); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(_label("另有 %d 项追踪 · L 管理" % n, 11, Color("#d6c8a4")))
	b.add_child(v)
	_fit(b, v, 9, 4, [Color("#bea36a80"), 2], [Color("#15201cd9"), Color("#15201c66")], [Color("#141d19df"), Color(0x14 / 255.0, 0x1d / 255.0, 0x19 / 255.0, 0)])
	b.pressed.connect(func(): if _can_open(): Menu.open("quest"))
	return b

# ───────── 刷新（原版 hud() 每次重绘） ─────────
func refresh() -> void:
	visible = G.mode == "scene" and G.S != null and not UI.panel_open()
	if not visible: return
	var S: Dictionary = G.S
	var d := Stats.derived()
	var hp: int = maxi(0, int(S.get("hp", 0))); var mp: int = maxi(0, int(S.get("mp", 0)))
	var mhp: int = maxi(1, int(d.get("mhp", 1))); var mmp: int = maxi(1, int(d.get("mmp", 1)))
	_name.text = str(S.get("name", ""))
	# 11-10 第四十九轮：原来显示最近一件大事（如“栖河第一夜”），白天看像在说时辰；改显示行程日期，大事留在行记里。
	# 没有昼夜交替（时间方案 A），日期里不带“傍晚”
	_chapter.text = str(preload("res://scripts/menu/quest.gd").phase(S).date).replace("傍晚", "")
	_hp.set_meta("ratio", clampf(float(hp) / mhp, 0, 1)); _hp.set_meta("text", "气血 %d / %d" % [hp, mhp]); _hp.queue_redraw()
	_mp.set_meta("ratio", clampf(float(mp) / mmp, 0, 1)); _mp.set_meta("text", "内力 %d / %d" % [mp, mmp]); _mp.queue_redraw()
	_face.queue_redraw()
	_loc.text = str(World.cur.get("name", ""))
	_loc.reset_size()
	_loc.position.x = W * 0.97 - _loc.get_combined_minimum_size().x
	var sd := _side()
	var guide: Dictionary = sd.nav_guide() if sd else {}
	if guide.is_empty(): guide = {"title": "", "detail": "J 看当前一件 · L 打开行记"}
	var rows: Array = Menu.tracked_quests()
	var side := rows.filter(func(r): return not r.get("main"))
	var fresh: Array = Menu.new_quests()
	if fresh.size(): UI.toast("新任务 · " + "、".join(PackedStringArray(fresh)) + " · 已加入左侧追踪", 3000)
	for c in _tracker.get_children(): c.queue_free()
	if Menu.main_tracked() != false: _tracker.add_child(_objective(guide))
	for r in side.slice(0, MAX_TRACK): _tracker.add_child(_track(r))
	if side.size() > MAX_TRACK: _tracker.add_child(_more(side.size() - MAX_TRACK))
	_map.visible = map_open and not Dialog.busy
	if _map.visible: _map_canvas.queue_redraw()
