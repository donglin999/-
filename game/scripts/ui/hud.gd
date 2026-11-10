extends Control
## 探索 HUD：左上地名题签（墨底渐隐 + 左侧金线），右上“江湖”菜单按钮（书法体，底部金线）。
## 对应原版 #hud .loc / #hud .menu.frame；栖河任务提示等由 qihe_hud.gd 叠加。

var loc: Label
var menu_btn: Button

func _init() -> void:
	size = Vector2(1280, 720)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false

var qh: Control = null   # 栖河 HUD（menu 子任务移植的 qihe-hud.js）

func _ready() -> void:
	if ResourceLoader.exists("res://scripts/ui/qihe_hud.gd"):
		var sc = load("res://scripts/ui/qihe_hud.gd")
		if sc != null and sc.can_instantiate():
			qh = sc.new(); add_child(qh)
	loc = Paint.label("", UI.serif, 18, UI.PAPER, 0.15, Color(0, 0, 0, 1), 4)
	loc.position = Vector2(1280 * 0.012 + 0.55 * 18, 720 * 0.016 + 0.12 * 18)
	add_child(loc)
	menu_btn = Button.new()
	menu_btn.flat = true
	menu_btn.text = "江湖"
	menu_btn.add_theme_font_override("font", Paint.font(UI.brush, 20, 0.28))
	menu_btn.add_theme_font_size_override("font_size", 20)
	menu_btn.add_theme_color_override("font_color", UI.PAPER)
	menu_btn.add_theme_color_override("font_hover_color", UI.HI)
	menu_btn.focus_mode = Control.FOCUS_NONE
	menu_btn.pressed.connect(func(): UI.toggle_menu())
	add_child(menu_btn)
	draw.connect(_draw_bg)

func refresh() -> void:
	# 序章定镜场景隐藏 HUD（原版 body.prologue-fixed-scene #hud{visibility:hidden}）
	visible = G.mode == "scene" and G.S != null and not Flow.scene_frozen()
	if not visible: return
	if qh != null:
		# 栖河版用 qihe_hud（状态牌、导航按钮、追踪、小地图、操作提示），旧题签与“江湖”按钮不显示
		loc.visible = false; menu_btn.visible = false
		qh.refresh(); queue_redraw(); return
	loc.text = World.cur.get("name", "")
	loc.reset_size()
	menu_btn.reset_size()
	menu_btn.size = Vector2(menu_btn.get_minimum_size().x + 2.2 * 20, 20 * 1.9)
	menu_btn.position = Vector2(1280 * 0.988 - menu_btn.size.x, 720 * 0.016)
	queue_redraw()

func _process(_d: float) -> void:
	if visible and Flow.scene_frozen(): visible = false

func _draw_bg() -> void:
	if qh != null: return
	var r := Rect2(loc.position - Vector2(0.55 * 18, 0.12 * 18), loc.size + Vector2(1.65 * 18, 0.32 * 18))
	var c := Color(13 / 255.0, 10 / 255.0, 8 / 255.0, 0.78)
	Paint.grad(self, r, [[0, c], [1, Color(c, 0)]])
	draw_rect(Rect2(r.position, Vector2(2, r.size.y)), Color(224 / 255.0, 191 / 255.0, 120 / 255.0, 0.8))
	var b := Rect2(menu_btn.position, menu_btn.size)
	var center := b.get_center()
	for i in 12:
		var k := 1.0 - i / 12.0
		draw_rect(Rect2(center - b.size * k / 2, b.size * k), Color(13 / 255.0, 10 / 255.0, 8 / 255.0, 0.08 + 0.07 * (1 - k)))
	Paint.fade_line(self, b.position.x, b.end.x, b.end.y - 2, Color(224 / 255.0, 191 / 255.0, 120 / 255.0, 0.9), 2, 0.25)
