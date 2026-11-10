extends Node
## 对话框（对应原版 ui.js say/choose/dlgSetup + dialogue-stage.js 立绘站位 + index.html #dlg 样式）
## 尺寸按 1280×720 基准（UI.root 已缩放到视口）。立绘取景、眼线对齐、下沿渐隐、发言压暗都照原版公式。

const PAUSE := {"，": 90, "、": 80, "；": 120, "：": 90, "。": 220, "！": 220, "？": 220, "…": 110, "—": 60, "\n": 160}
const EYE_M := 98.0
const EYE_F := 118.0
const FACE_M := 52.0
const FACE_F := 47.0
const BW := 1280.0
const BH := 720.0

var FRAMES := {"opening_hero_village": [108, 160, "m"], "opening_hero_modern": [108, 160, "m"], "ye": [120, 171, "f"], "opening_zhouyan": [104, 160, "m"], "opening_luheng": [106, 160, "m"],
	"opening_chengduo": [106, 161, "m"], "opening_wukui": [104, 160, "m"], "qh_shenyanhui_story": [120, 170, "f"], "qh_xulingyi_story": [116, 168, "f"], "qh_censhuang_story": [100, 150, "f"], "qh_song_story": [106, 162, "m"],
	"qh_oldman": [128, 181, "m"], "opening_aunt": [105, 159, "f"], "opening_chen": [121, 176, "m"], "qh_chen_rest_story": [121, 176, "m"], "qh_merchant": [116, 171, "m"], "opening_apothecary": [120, 176, "m"], "opening_retainer": [141, 196, "m"], "qh_bandit": [105, 160, "m"], "opening_bailiff": [114, 169, "m"], "opening_procurement_aide": [114, 169, "m"],
	"qh_atan": [112, 166, "m"], "qh_aqi": [100, 155, "m"], "qh_ashuan": [157, 205, "m"], "qh_xiaohe": [172, 222, "f"], "qh_huolang": [127, 172, "m"], "qh_chuanjia": [127, 172, "m"], "qh_linhuizhi": [120, 160, "m"]}

var DLG := {}
var busy := false            # 原版 dlgBusy
var feedback := 0            # 测试用：说过的台词、弹过的选项计数（扫荡查“点了没反应”，2026-11-09）
var cg_suppress := false     # 全屏 CG 时不显示立绘（OpeningCharacters.fullscreenCGActive）
var cg_style := ""           # "" / "cg-story"（递水 CG）/ "qh-cg"（火灾 CG）

var root: Control
var box: Control
var who_box: Control
var who_label: Label
var txt: Label
var more: Label
var choices_box: VBoxContainer
var portraits: Control
var mini: Control
var blur: ColorRect
var _blur_amt := 0.0
var _shader_portrait: Shader

var _state := {"actors": [], "active": null, "scope": null}
var _serial := 0
var _cur := {}               # 当前一句的显示状态
var _typing := false
var _full := ""
var _go: Callable = Callable()
var _choice_cb: Callable = Callable()
var _choice_buttons: Array = []
var _focus := 0
var _accept_after := 0

signal advanced

func _ready() -> void:
	DLG = Data.json("res://data/runtime/dlg.json")
	_shader_portrait = load("res://shaders/portrait.gdshader")
	# 背景虚化层：在地图之上、界面之下
	var bl := CanvasLayer.new(); bl.layer = 5; add_child(bl)
	blur = ColorRect.new(); blur.size = Vector2(960, 540); blur.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var sm := ShaderMaterial.new(); sm.shader = load("res://shaders/dim_blur.gdshader"); blur.material = sm
	blur.visible = false
	bl.add_child(blur)
	call_deferred("_build")

func _build() -> void:
	root = Control.new(); root.size = Vector2(BW, BH); root.mouse_filter = Control.MOUSE_FILTER_STOP; root.visible = false
	UI.root.add_child(root)
	UI.root.move_child(root, UI._toast.get_index())
	root.gui_input.connect(_on_click)
	root.draw.connect(_draw_root)
	portraits = Control.new(); portraits.size = root.size; portraits.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(portraits)
	box = Control.new(); box.mouse_filter = Control.MOUSE_FILTER_IGNORE; root.add_child(box)
	box.draw.connect(_draw_box)
	mini = Control.new(); mini.mouse_filter = Control.MOUSE_FILTER_IGNORE; mini.visible = false; box.add_child(mini)
	mini.draw.connect(_draw_mini)
	who_box = Control.new(); who_box.mouse_filter = Control.MOUSE_FILTER_IGNORE; box.add_child(who_box)
	who_box.draw.connect(_draw_who)
	who_label = Paint.label("", UI.serif, 19, UI.HI, 0.12)
	who_box.add_child(who_label)
	txt = Label.new(); txt.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY; txt.mouse_filter = Control.MOUSE_FILTER_IGNORE
	box.add_child(txt)
	more = Paint.label("▼", UI.serif, 15, UI.GOLD, 0)
	box.add_child(more)
	choices_box = VBoxContainer.new(); choices_box.add_theme_constant_override("separation", 2)
	box.add_child(choices_box)

func visible_now() -> bool:
	return root != null and root.visible

# ─────────────────────── 说话人 → 立绘 ───────────────────────
func dialogue_sprite(who: String, sp) -> String:
	var s := "" if sp == null else str(sp)
	if G.S == null or G.S.get("prologue", {}).get("version") != 2: return s
	if who.begins_with("叶蘅 ·"): return "c_ye"
	if who == G.S.get("name", "萧白"):
		var arr = G.S.prologue.get("arrival")
		var modern: bool = arr is Dictionary and not arr.get("borrowed")
		return "c_opening_hero_modern" if modern else "c_opening_hero_village"
	return DLG.names.get(who, s)

func face_path(sp: String) -> String:
	if sp == "": return ""
	var parts := sp.trim_prefix("c_").split(":")
	var k := parts[0]
	var e := parts[1] if parts.size() > 1 else ""
	var faces: Dictionary = DLG.faces
	if e == "neutral": e = ""
	if e == "firm" and not (DLG.expr.get(k, []) as Array).has("firm"): e = "angry"
	if e != "" and faces.has("c_%s:%s" % [k, e]): return faces["c_%s:%s" % [k, e]]
	return faces.get("c_" + k, "")

func who_type(who: String, sp: String) -> String:
	if who == "": return "narr"
	var k := sp.trim_prefix("c_")
	var u := k.find("_"); var c := k.find(":")
	var cut := k.length()
	if u >= 0: cut = min(cut, u)
	if c >= 0: cut = min(cut, c)
	k = k.substr(0, cut)
	if k == "hero" or (G.S != null and who == G.S.get("name", "")): return "hero"
	if k in DLG.foes: return "foe"
	if sp == "": return "thing"
	return "npc"

# ─────────────────────── 立绘站位（dialogue-stage.js） ───────────────────────
func _identity(who: String, sp: String) -> String:
	var k := sp.trim_prefix("c_").split(":")[0]
	var re := RegEx.create_from_string("^(?:opening_)?hero(?:_|$)")
	if re.search(k): return "hero"
	return k if k != "" else who

func _add(who: String, sp: String, slot := ""):
	sp = dialogue_sprite(who, sp) if sp != "" or who != "" else sp
	if sp == "" or face_path(sp) == "": return null
	var id := _identity(who, sp)
	for a in _state.actors:
		if a.id == id:
			a.who = who; a.sp = sp; return a
	var used := {}
	for a in _state.actors: used[a.slot] = true
	if slot == "":
		var scope = _state.scope
		if id == "hero" and not used.has("left"): slot = "left"
		elif _state.actors.is_empty() and not (scope is Dictionary and scope.hasHero): slot = "left"
		elif not used.has("right"): slot = "right"
		elif not used.has("left"): slot = "left"
		elif not used.has("center"): slot = "center"
		else: slot = "rail"
	var actor := {"id": id, "who": who, "sp": sp, "slot": slot}
	_state.actors.append(actor)
	return actor

## 剧情开场时登记在场人物（DialogueStage.begin/withCast）
func begin(id: String, cast: Array) -> int:
	_serial += 1
	var prev := _state
	var has_hero := false
	for a in cast:
		if _identity(a.who, dialogue_sprite(a.who, a.get("sp", ""))) == "hero": has_hero = true
	_state = {"actors": [], "active": null, "scope": {"id": id, "token": _serial, "previous": prev, "hasHero": has_hero}}
	for a in cast: _add(a.who, a.get("sp", ""), a.get("slot", ""))
	return _serial

func end(token: int) -> void:
	if _state.scope is Dictionary and _state.scope.token == token:
		_state = _state.scope.previous

func with_cast(id: String, cast: Array, fn: Callable):
	var tk := begin(id, cast)
	var r = await fn.call()
	end(tk)
	return r

func _enter(who: String, sp: String) -> void:
	if not (_state.scope is Dictionary):
		_state = {"actors": [], "active": null, "scope": null}
		if who != "": _add(G.S.get("name", "萧白") if G.S else "萧白", "c_hero", "left")
	var actor = _add(who, sp) if who != "" else null
	_state.active = actor.id if actor != null else null

func _layout() -> Array:
	var active = null; var center = null
	for a in _state.actors:
		if a.id == _state.active: active = a
		if a.slot == "center": center = a
	var middle = active if (active != null and active.slot == "rail") else center
	var out := []
	for a in _state.actors:
		var ds: String = a.slot if (a.slot == "left" or a.slot == "right") else ("center" if a == middle else "rail")
		out.append({"id": a.id, "who": a.who, "sp": dialogue_sprite(a.who, a.sp), "slot": a.slot, "displaySlot": ds, "active": a.id == _state.active})
	return out

func _frame_of(sp: String):
	var key := sp.trim_prefix("c_").split(":")[0]
	if not FRAMES.has(key): return null
	var f: Array = FRAMES[key]; var fem: bool = f[2] == "f"
	return {"eye": float(f[0]), "line": EYE_F if fem else EYE_M, "k": (FACE_F if fem else FACE_M) / (float(f[1]) - f[0])}

# ─────────────────────── 对白一句 ───────────────────────
func _setup(who: String, sp: String, choose_mode: bool) -> void:
	sp = dialogue_sprite(who, sp)
	_enter(who, sp)
	var speakerless: bool = who != "" and _state.active == null and _identity(who, sp) != "hero"
	var actors := _layout()
	var hidden: bool = cg_suppress or who == "" or speakerless
	var big := []; var small := []
	if not hidden:
		for a in actors:
			if a.displaySlot != "rail": big.append(a)
			else: small.append(a)
	var f := "" if cg_suppress else face_path(sp)
	var has_face := big.size() > 0
	var ty := who_type(who, sp)
	var ms_sp := sp.split(":")[0] if (not cg_suppress and f == "" and sp != "") else ""
	_cur = {"who": who, "sp": sp, "type": ty, "face": has_face, "mini": ms_sp, "choose": choose_mode, "big": big, "small": small}
	root.visible = true
	_layout_box()
	_render_portraits(big)
	more.visible = not choose_mode
	for c in choices_box.get_children(): c.queue_free()
	_choice_buttons.clear()
	_set_blur(has_face)

func _layout_box() -> void:
	var narr: bool = _cur.type == "narr"
	var has_face: bool = _cur.face
	var has_mini: bool = _cur.mini != "" and CharArt.has_img(_cur.mini.trim_prefix("c_") if false else "c_%s_d" % _cur.mini.trim_prefix("c_"))
	_cur.has_mini = has_mini and not has_face
	var fs := 18.5 if has_face else 20.5
	var col := Color("#e6d6b3") if narr else UI.PAPER
	# 20.5／18.5px 是小数字号：按 21／19 排字，整个文字标签缩 fk 倍（宽度、行距都在 21／19 的尺度里设）
	var n := Paint.fsize(fs); var k := Paint.fk(fs)
	txt.scale = Vector2(k, k)
	txt.add_theme_font_override("font", Paint.font(UI.serif, n, 0.14 if narr else 0.055))
	txt.add_theme_font_size_override("font_size", n)
	txt.add_theme_color_override("font_color", col)
	# CSS line-height（有立绘 1.45，否则 1.5）＝字体自身行高＋额外行距
	var fnt: Font = Paint.font(UI.serif, n, 0.055)
	txt.add_theme_constant_override("line_spacing", int(round(fs * (1.45 if has_face else 1.5) / k - fnt.get_height(n))))
	if has_face:
		txt.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.85)); txt.add_theme_constant_override("shadow_outline_size", 4)
	else:
		txt.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0)); txt.add_theme_constant_override("shadow_outline_size", 0)
	txt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER if narr else HORIZONTAL_ALIGNMENT_LEFT
	var em := 17.0
	var l: float; var r: float; var pad: Array
	if narr:
		l = BW * 0.012; r = BW * 0.012; pad = [1.6 * em, 2.2 * em, 1.0 * em, 2.2 * em]
	else:
		l = BW * 0.02; r = BW * 0.02
		pad = [1.2 * em, 2.2 * em, 0.7 * em, 2.2 * em] if has_face else [1.1 * em, 1.6 * em, 1.2 * em, 1.6 * em]
	if _cur.has_mini: pad[3] = 7.8 * em
	if cg_style == "qh-cg":
		l = BW * 0.04; r = BW * 0.04; pad = [14.0, 24.0, 14.0, 24.0]
	var w := BW - l - r
	var tw: float = w - pad[1] - pad[3]
	if not narr and not has_face: tw = min(tw, 58 * fs)
	if narr: tw = min(tw, 40 * fs)
	txt.size = Vector2(tw / txt.scale.x, 0)
	txt.position = Vector2(pad[3] + (0.0 if not narr else (w - pad[1] - pad[3] - tw) / 2), pad[0])
	box.set_meta("pad", pad)
	box.set_meta("narr", narr)
	box.position.x = l; box.size.x = w
	# 名牌
	who_label.text = _cur.who
	var wc := {"hero": Color("#a9d8b5"), "foe": Color("#f08a6e"), "npc": UI.HI, "thing": UI.DIM}.get(_cur.type, UI.HI)
	who_label.add_theme_color_override("font_color", wc)
	who_label.reset_size()
	who_box.visible = _cur.who != ""
	# 实测：名牌高 39（19.04px×1.5 行高＋上下 .27em），左侧 3px 朱砂竖条后不留内边距，右边 .7em
	who_box.size = Vector2(3 + who_label.get_minimum_size().x + 0.7 * 19.04, 39)
	who_label.position = Vector2(3, (39 - who_label.get_minimum_size().y) / 2)
	mini.visible = _cur.has_mini
	_relayout_height()

func _relayout_height() -> void:
	var pad: Array = box.get_meta("pad")
	var narr: bool = box.get_meta("narr")
	var em := 17.0
	var lh: float = (18.5 * 1.45) if _cur.face else (20.5 * 1.5)
	var content_h: float = 0.0
	if txt.text != "":
		content_h = max(lh, txt.get_line_count() * lh)
	if _choice_buttons.size():
		var mt: float = (0.3 if _cur.face else 0.35) * em
		choices_box.add_theme_constant_override("separation", 0 if _cur.face else 2)
		choices_box.position = Vector2(pad[3], pad[0] + content_h + mt)
		choices_box.size.x = min(box.size.x - pad[1] - pad[3], 32 * 19.2)
		content_h += mt + choices_box.get_combined_minimum_size().y
	var h: float = pad[0] + content_h + pad[2]
	if narr: h = BH * 0.27
	else:
		h = max(h, BH * (0.15 if _cur.face else 0.19))
		if cg_style == "cg-story": h = max(h, BH * (0.34 if _cur.choose else 0.2))
		h = min(h, BH * (0.75 if _cur.choose else 0.4))
	if cg_style == "qh-cg": h = min(max(pad[0] + content_h + pad[2], 0.0), BH * 0.25)
	box.size.y = h
	box.position.y = BH * (0.97 if cg_style == "qh-cg" else 0.98) - h
	if narr: txt.position.y = (h - content_h) / 2
	who_box.position = Vector2(6.9 * em if _cur.get("has_mini") else 1.6 * em, -who_box.size.y - 0.35 * em)
	more.position = Vector2(box.size.x - 1.6 * em - 12, h - 0.6 * em - 20)
	mini.position = Vector2(1.3 * em, h / 2 - 5.4 * em / 2); mini.size = Vector2(5.4 * em, 5.4 * em)
	box.queue_redraw(); who_box.queue_redraw(); mini.queue_redraw(); root.queue_redraw()

func _render_portraits(big: Array) -> void:
	for c in portraits.get_children(): c.queue_free()
	if big.is_empty(): return
	var speaker = null
	for a in big:
		if a.active: speaker = a
	if speaker == null: speaker = big[0]
	var order := big.filter(func(a): return a != speaker)
	order.append(speaker)   # 发言人画在最上
	var box_bottom := 98.0
	for a in order:
		var width := 29.0 if big.size() > 2 else 28.0
		var center: float = 1.5 + width / 2 if a.displaySlot == "left" else (100 - width / 2 - 1.5 if a.displaySlot == "right" else 50.0)
		var f = _frame_of(a.sp)
		var k: float = f.k if f != null else 1.0
		var h := 72 * k
		var top: float = 28 + 72 * (f.line - k * f.eye) / 640 if f != null else 28.0
		var path := face_path(a.sp)
		var tex := Assets.tex_ready(path)
		if tex == null: tex = Assets.tex(path)
		if tex == null: continue
		var ph := BH * h / 100
		var pw := ph * tex.get_width() / tex.get_height()
		var tr := TextureRect.new()
		tr.texture = tex; tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; tr.stretch_mode = TextureRect.STRETCH_SCALE
		tr.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
		tr.size = Vector2(pw, ph); tr.position = Vector2(BW * center / 100 - pw / 2, BH * top / 100)
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var fade_end: float = min(100.0, (box_bottom - top) / h * 100) / 100
		var fade_start: float = max(0.0, fade_end - 14 / h)
		var sm := ShaderMaterial.new(); sm.shader = _shader_portrait
		sm.set_shader_parameter("fade_start", fade_start); sm.set_shader_parameter("fade_end", fade_end)
		sm.set_shader_parameter("bright", 1.0 if a.active else 0.72)
		sm.set_shader_parameter("outline", 1.0 if a.active else 0.0)
		sm.set_shader_parameter("px", Vector2(1.0 / pw, 1.0 / ph))
		tr.material = sm
		portraits.add_child(tr)

var _blur_tw: Tween
var _blur_off_serial := 0
func _set_blur(on: bool) -> void:
	# 两句之间对白框会短暂隐藏：延后 80ms 再撤虚化，下一句接上就不闪
	_blur_off_serial += 1
	if not on:
		var my := _blur_off_serial
		await get_tree().create_timer(0.08).timeout
		if my != _blur_off_serial or visible_now(): return
	var target := 1.0 if on else 0.0
	if on: blur.visible = true
	if _blur_tw: _blur_tw.kill()
	var tw := create_tween(); _blur_tw = tw
	tw.tween_method(func(v): _blur_amt = v; (blur.material as ShaderMaterial).set_shader_parameter("amount", v), _blur_amt, target, 0.22)
	if not on: tw.tween_callback(func(): if _blur_amt <= 0.001: blur.visible = false)
	if UI.hud_node: UI.hud_node.modulate.a = 0.35 if on else 1.0

# ─────────────────────── 绘制：对白框、名牌、小像 ───────────────────────
func _draw_root() -> void:
	if _cur.get("face") and cg_style == "":
		var r := Rect2(0, BH * 0.2, BW, BH * 0.8)
		var c := Color(10 / 255.0, 8 / 255.0, 6 / 255.0, 0.24)
		Paint.grad(root, r, [[0, c], [0.32, Color(c, 0)], [0.68, Color(c, 0)], [1, c]])

func _draw_box() -> void:
	var r := Rect2(Vector2.ZERO, box.size)
	if box.get_meta("narr", false):
		var c := Color(14 / 255.0, 10 / 255.0, 7 / 255.0, 0.95)
		Paint.grad(box, r, [[0, Color(c, 0)], [0.15, c], [0.85, c], [1, Color(c, 0)]])
		Paint.fade_line(box, r.size.x * 0.15, r.size.x * 0.85, 0, UI.BZ2, 1, 0.5)
		Paint.fade_line(box, r.size.x * 0.15, r.size.x * 0.85, r.size.y - 1, UI.BZ2, 1, 0.5)
		return
	if cg_style == "qh-cg":
		Paint.grad(box, r, [[0, Color("#101817e8")], [1, Color("#101817bc")]])
		box.draw_rect(Rect2(0, 0, 2, r.size.y), Color("#d0a66d"))
		return
	if _cur.get("face"):
		var e := 2.2 * 17
		Paint.grad(box, r, [[0, Color(14 / 255.0, 10 / 255.0, 7 / 255.0, 0)], [min(1.0, e / r.size.y), Color(14 / 255.0, 10 / 255.0, 7 / 255.0, 0.55)], [1, Color(12 / 255.0, 9 / 255.0, 6 / 255.0, 0.78)]], false)
		Paint.fade_line(box, 0, r.size.x, 0, Color(224 / 255.0, 191 / 255.0, 120 / 255.0, 0.45), 1, -1, 0.1, 0.8)
	else:
		for i in 6:
			box.draw_rect(r.grow(4 + i * 3).intersection(Rect2(-40, 2, r.size.x + 80, r.size.y + 26)), Color(0, 0, 0, 0.06))
		Paint.grad(box, r, [[0, Color(32 / 255.0, 23 / 255.0, 16 / 255.0, 0.96)], [1, Color(13 / 255.0, 10 / 255.0, 8 / 255.0, 0.98)]], false)
		Paint.fade_line(box, 0, r.size.x, 0, Color(224 / 255.0, 191 / 255.0, 120 / 255.0, 0.75), 2, -1, 0.08, 0.85)

func _draw_who() -> void:
	var r := Rect2(Vector2.ZERO, who_box.size)
	if _cur.get("face"):
		Paint.grad(who_box, r, [[0, Color(14 / 255.0, 10 / 255.0, 7 / 255.0, 0.85)], [1, Color(14 / 255.0, 10 / 255.0, 7 / 255.0, 0.55)]])
	else:
		var c := Color(30 / 255.0, 20 / 255.0, 14 / 255.0, 0.98)
		Paint.grad(who_box, r, [[0, c], [0.78, Color(c, 0.74)], [1, Color(c, 0)]])
	who_box.draw_rect(Rect2(0, 0, 3, r.size.y), UI.RED)

func _draw_mini() -> void:
	var r := Rect2(Vector2.ZERO, mini.size)
	Paint.frame(mini, r)
	var k: String = _cur.get("mini", "").trim_prefix("c_")
	var fr = CharArt.frame("c_%s_d" % k)
	if fr == null: fr = CharArt.frame("c_%s_d_0" % k)
	if fr == null: return
	var bx = CharArt.BOUNDS.get(fr[2])
	var src: Rect2 = fr[1]
	if bx != null:
		src = Rect2(src.position + Vector2(bx[2], bx[0]), Vector2(bx[3] - bx[2], bx[1] - bx[0]))
	var inner := r.size.x - 0.6 * 17
	var s: float = min(min(84.0 / src.size.x, 88.0 / src.size.y), 2.4) * inner / 96
	var dw := src.size.x * s; var dh := src.size.y * s
	mini.draw_texture_rect_region(fr[0], Rect2(r.size.x / 2 - dw / 2, r.size.y - 0.3 * 17 - dh - 2, dw, dh), src)

# ─────────────────────── say / choose ───────────────────────
var before_say: Callable = Callable()   # 站位表：萧白转向说话人（原版 qihe-staging.js 包裹 say）

## Web 分包：立绘所在的包没到就先等（一般后台早已下完）
func _ensure_faces(who: String, sp) -> void:
	if not Packs.enabled: return
	var paths := ["res://" + face_path(dialogue_sprite(who, "" if sp == null else str(sp)))]
	for a in _state.actors: paths.append("res://" + face_path(a.sp))
	await Packs.ensure_paths(paths)

var _quest_script = null   # 江湖·行记的人物图鉴：说话时记“初识”（原版 qihe-jianghu-ui 包裹 say）
func say(who: String, text, sp = "") -> void:
	feedback += 1
	if before_say.is_valid(): before_say.call(who)
	if _quest_script == null and ResourceLoader.exists("res://scripts/menu/quest.gd"): _quest_script = load("res://scripts/menu/quest.gd")
	if _quest_script != null and G.S != null and who != "": _quest_script.record_encounter(who, str(text))
	await _ensure_faces(who, sp)
	busy = true
	_setup(who, "" if sp == null else str(sp), false)
	_full = str(text)
	txt.text = ""
	more.visible = true; more.modulate.a = 0
	_typing = true
	_relayout_height()
	var done := [false]
	_go = func():
		if _typing:
			_typing = false; txt.text = _full; more.modulate.a = 1; _relayout_height(); return
		done[0] = true
	_accept_after = Time.get_ticks_msec() + 50
	_type_out()
	while not done[0]:
		await get_tree().process_frame
	Audio.sfx("advance")
	_go = Callable()
	root.visible = false
	busy = false
	_set_blur(false)
	advanced.emit()

func _type_out() -> void:
	await get_tree().create_timer(0.04).timeout
	var i := 0
	while _typing:
		i += 1
		txt.text = _full.substr(0, i)
		if i % 2 == 0: Audio.sfx("blip", 1.0, randf_range(0.95, 1.10))
		if i % 6 == 0 or i >= _full.length(): _relayout_height()
		if i >= _full.length():
			_typing = false; more.modulate.a = 1; _relayout_height(); return
		var prev := _full[i - 1]
		await get_tree().create_timer((26 + PAUSE.get(prev, 0)) / 1000.0).timeout

func narr(text) -> void:
	await say("", text)

## 选项：返回所选下标；esc_index 指定 Esc 对应的选项
func choose(who: String, text, opts: Array, sp = "", esc_index = null) -> int:
	feedback += 1
	await _ensure_faces(who, sp)
	busy = true
	_full = ""
	_setup(who, "" if sp == null else str(sp), true)
	txt.text = str(text) if text != null else ""
	var result := [-1]
	var fs := 17 if _cur.face else 19
	for i in opts.size():
		var b := _choice_button(i, str(opts[i]), fs)
		var idx := i
		b.pressed.connect(func(): result[0] = idx)
		b.mouse_entered.connect(func(): _focus_choice(idx))
		choices_box.add_child(b)
		_choice_buttons.append(b)
	_relayout_height()
	_focus_choice(0)
	_choice_cb = func(i): result[0] = i
	set_meta("esc", esc_index)
	while result[0] < 0:
		await get_tree().process_frame
	Audio.sfx("select")
	_choice_cb = Callable()
	root.visible = false
	busy = false
	_set_blur(false)
	return result[0]

func _choice_button(i: int, text: String, fs: int) -> Button:
	var b := Button.new()
	b.flat = true; b.alignment = HORIZONTAL_ALIGNMENT_LEFT; b.focus_mode = Control.FOCUS_NONE
	b.text = "%d   %s" % [i + 1, text]
	b.add_theme_font_override("font", Paint.font(UI.serif, fs, 0.04))
	b.add_theme_font_size_override("font_size", fs)
	b.add_theme_color_override("font_color", UI.PAPER)
	b.add_theme_color_override("font_hover_color", UI.HI)
	b.add_theme_color_override("font_pressed_color", UI.HI)
	var empty := StyleBoxEmpty.new()
	empty.content_margin_left = 1.2 * fs + (0.4 * fs if _cur.face else 0.0); empty.content_margin_top = 0.18 * fs; empty.content_margin_bottom = 0.18 * fs
	for s in ["normal", "hover", "pressed", "focus", "hover_pressed"]: b.add_theme_stylebox_override(s, empty)
	b.custom_minimum_size = Vector2(0, (1.75 if _cur.face else 2.0) * fs)
	b.set_meta("i", i)
	b.draw.connect(func():
		if b.get_meta("focused", false):
			Paint.grad(b, Rect2(Vector2.ZERO, b.size), [[0, Color(224 / 255.0, 191 / 255.0, 120 / 255.0, 0.2)], [1, Color(224 / 255.0, 191 / 255.0, 120 / 255.0, 0)]])
			var cy := b.size.y / 2; var s := 0.35 * fs
			b.draw_colored_polygon(PackedVector2Array([Vector2(0.2 * fs, cy - s), Vector2(0.2 * fs + s, cy), Vector2(0.2 * fs, cy + s)]), UI.GOLD)
		# 序号金色小一号：原版 <span class="n">
		)
	return b

func _focus_choice(i: int) -> void:
	_focus = i
	for b in _choice_buttons:
		var f: bool = b.get_meta("i") == i
		b.set_meta("focused", f)
		b.add_theme_color_override("font_color", UI.HI if f else UI.PAPER)
		b.queue_redraw()

func _on_click(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		if _go.is_valid(): _go.call()
	elif ev is InputEventScreenTouch and ev.pressed:
		if _go.is_valid(): _go.call()

func _unhandled_input(ev: InputEvent) -> void:
	if not visible_now(): return
	if not (ev is InputEventKey) or not ev.pressed or ev.echo: return
	var k: int = ev.keycode
	if _go.is_valid():
		if Time.get_ticks_msec() < _accept_after: return
		if k in [KEY_SPACE, KEY_ENTER, KEY_KP_ENTER, KEY_E]:
			get_viewport().set_input_as_handled(); _go.call()
		return
	if _choice_cb.is_valid():
		var n := k - KEY_0
		if n >= 1 and n <= _choice_buttons.size():
			get_viewport().set_input_as_handled(); _choice_cb.call(n - 1); return
		if k == KEY_ESCAPE and get_meta("esc") != null:
			get_viewport().set_input_as_handled(); _choice_cb.call(int(get_meta("esc"))); return
		if k == KEY_DOWN or k == KEY_S:
			_focus_choice((_focus + 1) % _choice_buttons.size()); get_viewport().set_input_as_handled()
		elif k == KEY_UP or k == KEY_W:
			_focus_choice((_focus - 1 + _choice_buttons.size()) % _choice_buttons.size()); get_viewport().set_input_as_handled()
		elif k in [KEY_SPACE, KEY_E, KEY_ENTER, KEY_KP_ENTER]:
			get_viewport().set_input_as_handled(); _choice_cb.call(_focus)

func _process(delta: float) -> void:
	if more and more.visible and more.modulate.a > 0:
		var t := Time.get_ticks_msec() / 1000.0
		var base := box.size.y - 0.6 * 17 - 20
		more.position.y = base + (sin(t * TAU) * 0.5 + 0.5) * 0.25 * 15
