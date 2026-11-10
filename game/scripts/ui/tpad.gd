extends Control
## 触屏方向键与交互键（原版 #tpad：左下 3×2 方向键，右下“互动”键；按钮直径 max(44px,3.4em)，圆形半透明）

func _init() -> void:
	size = Vector2(1280, 720)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false

func _ready() -> void:
	var s := 58.0
	var base := Vector2(1280 * 0.02, 720 * 0.96 - s * 2 - 3)
	for d in [["up", "▲", 1, 0], ["left", "◀", 0, 1], ["down", "▼", 1, 1], ["right", "▶", 2, 1]]:
		var b := _btn(d[1], s)
		b.position = base + Vector2(d[2] * (s + 3), d[3] * (s + 3))
		var key: String = d[0]
		b.button_down.connect(func(): World.keys[key] = 1)
		b.button_up.connect(func(): World.keys[key] = 0)
	var e := _btn("互动", s)
	e.position = Vector2(1280 * 0.98 - s, 720 * 0.96 - s)
	e.pressed.connect(func(): World.interact())

func _btn(t: String, s: float) -> Button:
	var b := Button.new()
	b.text = t; b.size = Vector2(s, s); b.focus_mode = Control.FOCUS_NONE
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(20 / 255.0, 15 / 255.0, 11 / 255.0, 0.7); sb.set_corner_radius_all(int(s / 2))
	sb.border_color = UI.BZ; sb.set_border_width_all(1)
	var sp := sb.duplicate(); sp.bg_color = Color("#4a3a28"); sp.border_color = UI.GOLD
	b.add_theme_stylebox_override("normal", sb); b.add_theme_stylebox_override("hover", sb); b.add_theme_stylebox_override("pressed", sp)
	b.add_theme_font_override("font", UI.serif); b.add_theme_font_size_override("font_size", 18)
	b.modulate.a = 0.75
	add_child(b)
	return b
