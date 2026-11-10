class_name QJCard
extends Container
## 可点击的“卡片按钮”：原版大量 <button> 内含图标 + 多行文字（物品格、武学卡、人物头像、页签）。
## 照 Button 的行为：可获得焦点、点击发 pressed、双击发 double；样式 normal / hover / focus / on（选中）由调用方给。

signal pressed
signal double

var pad := [0, 0, 0, 0]
var st_normal: StyleBox
var st_hover: StyleBox
var st_on: StyleBox
var on := false
var _hover := false
var under: Array = []   # 叠在选中样式之上的附加绘制（Callable(ci, rect)）
var last_pos := Vector2(-1, -1)   # 最近一次鼠标按下的本地坐标；键盘触发时为 (-1,-1)（立绘像素命中 portraitHit 用）

func _init() -> void:
	focus_mode = Control.FOCUS_ALL
	mouse_filter = Control.MOUSE_FILTER_STOP
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	mouse_entered.connect(func(): _hover = true; queue_redraw())
	mouse_exited.connect(func(): _hover = false; queue_redraw())
	focus_entered.connect(queue_redraw)
	focus_exited.connect(queue_redraw)

func set_on(v: bool) -> void:
	on = v; queue_redraw()

func _get_minimum_size() -> Vector2:
	var m := Vector2.ZERO
	for c in get_children():
		if c is Control and c.visible and not c.top_level and c.name == "box":
			m = m.max(c.get_combined_minimum_size())
	return m + Vector2(pad[0] + pad[2], pad[1] + pad[3])

func _notification(what: int) -> void:
	if what == NOTIFICATION_SORT_CHILDREN:
		var r := Rect2(Vector2(pad[0], pad[1]), size - Vector2(pad[0] + pad[2], pad[1] + pad[3]))
		for c in get_children():
			if not (c is Control) or c.top_level: continue
			# 内容盒 box 撑满；其他子节点（角标、编号等）保持自身位置，只取最小尺寸
			if c.name == "box": fit_child_in_rect(c, r)
			else: c.size = c.get_combined_minimum_size()

func _draw() -> void:
	var st: StyleBox = st_normal
	if on and st_on: st = st_on
	elif (_hover or has_focus()) and st_hover: st = st_hover
	if st: draw_style_box(st, Rect2(Vector2.ZERO, size))
	for f in under: f.call(self, Rect2(Vector2.ZERO, size))
	if has_focus() and get_viewport().gui_get_focus_owner() == self and not _hover:
		var ring := StyleBoxFlat.new(); ring.draw_center = false; ring.border_color = Color("#a88a4e")
		ring.set_border_width_all(2); ring.set_corner_radius_all(3)
		draw_style_box(ring, Rect2(Vector2(-2, -2), size + Vector2(4, 4)))

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.button_index == MOUSE_BUTTON_LEFT and ev.pressed:
		last_pos = ev.position
		grab_focus()
		if ev.double_click: double.emit()
		else: pressed.emit()
		accept_event()
		last_pos = Vector2(-1, -1)
