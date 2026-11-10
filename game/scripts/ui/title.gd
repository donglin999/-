extends Control
## 标题页与选档（原版 qihe-startup.js render + index.html .tt + qihe-startup.css；背景 bg_title + 暗角 .55）
## “从头开始”另开新旅程（不覆盖旧进度）；已有旅程列成“继续进度 / 继续原有进度 / 继续另一旅程”。

var _menu: VBoxContainer
var _buttons: Array = []

func _ready() -> void:
	G.mode = "title"
	World.active = false
	Lights.vignette(true, 0.55)
	UI.hud()
	size = Vector2(1280, 720); scale = Vector2(0.75, 0.75)
	var bg := TextureRect.new(); bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; bg.texture = Assets.tex("bg_title"); bg.size = Vector2(1280, 720)
	bg.stretch_mode = TextureRect.STRETCH_SCALE
	add_child(bg)
	var vg := Control.new(); vg.size = size; vg.mouse_filter = Control.MOUSE_FILTER_IGNORE; add_child(vg)
	vg.draw.connect(func():
		var c := Color(8 / 255.0, 6 / 255.0, 4 / 255.0)
		Paint.grad(vg, Rect2(Vector2.ZERO, size), [[0, Color(c, 0.72)], [0.55, Color(c, 0.25)], [1, Color(c, 0)]]))
	# 位置与字号取自原版页面实测（1280×720 游戏区）：logo 85px 书法体、字距 17px，左 102、上 227；
	# 版本行 12.58px、说明 15.3px 用 Noto Sans；按钮 238×60、衬线 18.7px、字距 .5em；页脚 12.24px
	var logo := Paint.label("小江湖", UI.brush, 85, Color("#f1e4c6"), 0.2, Color(0, 0, 0, 0.55), 8)
	logo.position = Vector2(102, 227 + 6); add_child(logo)
	var ver := Paint.label("栖河试玩 · 四向地图版", UI.sans, 13, UI.GOLD, 0.12)
	ver.position = Vector2(102, 325 + 3); add_child(ver)
	var note := Paint.label("从后山初遇，走入栖河与归云谷。", UI.sans, 15, UI.PAPER, 0.04)
	note.position = Vector2(102, 361 + 2); add_child(note)
	_menu = VBoxContainer.new(); _menu.add_theme_constant_override("separation", int(0.55 * 17))
	_menu.position = Vector2(102, 433); _menu.size = Vector2(238, 0)
	add_child(_menu)
	_add_button("从头开始", "", func(): _new_journey())
	var runs := G.runs()
	for i in runs.size():
		var r: Dictionary = runs[i]
		var t := "继续进度" if i == 0 else ("继续原有进度" if r.key == G.ORIGINAL else "继续另一旅程")
		_add_button(t, _desc(r.state), func(): _continue(r.key))
	var foot := Paint.label("从头开始保留现有进度 · 新旅程自动保存", UI.sans, 12, UI.DIM, 0.1, Color(0, 0, 0, 1), 3)
	foot.position = Vector2(115, 667 + 3)
	add_child(foot)
	# 原版 logo 2.2s 淡入、菜单延后 1.3s 上浮
	logo.modulate.a = 0; var tw := create_tween(); tw.tween_property(logo, "modulate:a", 1.0, 2.2)
	_menu.modulate.a = 0; var tw2 := create_tween(); tw2.tween_interval(1.3); tw2.tween_property(_menu, "modulate:a", 1.0, 1.0)

func _desc(s: Dictionary) -> String:
	var m: String = Flow.milestone_latest(s) if Flow.has_method("milestone_latest") else "初到栖河"
	return m + " · " + World.scenes.get(s.scene, {}).get("name", "")

func _add_button(text: String, small: String, cb: Callable) -> void:
	var b := Button.new(); b.focus_mode = Control.FOCUS_ALL
	b.alignment = HORIZONTAL_ALIGNMENT_LEFT
	b.text = text + ("\n" + small if small != "" else "")
	b.add_theme_font_override("font", Paint.font(UI.serif, 19, 0.5))
	b.add_theme_font_size_override("font_size", 19)
	b.custom_minimum_size = Vector2(238, 60)
	b.add_theme_color_override("font_color", UI.PAPER)
	b.add_theme_color_override("font_hover_color", UI.HI)
	b.add_theme_color_override("font_focus_color", UI.PAPER)
	var sb := StyleBoxFlat.new(); sb.bg_color = Color(20 / 255.0, 15 / 255.0, 11 / 255.0, 0.78); sb.border_color = UI.BZ; sb.set_border_width_all(1)
	sb.content_margin_left = 17; sb.content_margin_right = 17; sb.content_margin_top = 0.6 * 19; sb.content_margin_bottom = 0.6 * 19
	var sh := sb.duplicate(); sh.border_color = UI.GOLD
	b.add_theme_stylebox_override("normal", sb); b.add_theme_stylebox_override("hover", sh); b.add_theme_stylebox_override("pressed", sh); b.add_theme_stylebox_override("focus", sh)
	b.pressed.connect(cb)
	_menu.add_child(b); _buttons.append(b)
	if _buttons.size() == 1: b.call_deferred("grab_focus")

func _new_journey() -> void:
	G.save_key = G.new_journey_key()
	await _enter(null)

func _continue(key: String) -> void:
	G.save_key = key
	await _enter(G.read(key))

func _enter(old) -> void:
	for b in _buttons: b.disabled = true
	await UI.black(true, 0.45)
	Lights.vignette(false)
	visible = false
	var p: Node = Flow.prologue()
	p.start(old == null, old)   # 协程，不等它结束（开场剧情在里面跑）
	await UI.black(false, 0.3)
	queue_free()
