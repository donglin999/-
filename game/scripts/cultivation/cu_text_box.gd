class_name CuTextBox
extends Container
## 让文字盒高按原版 CSS line-height 计（精修用）。
## Godot Label 每行高 = 字体高 + line_spacing，首行不留半行距；CSS 每行高 = line-height，字形在行盒内居中。
## 本容器把 line_spacing 设成 (lh - 字体高)，盒高减去多出的一份，再把 Label 上移半份，字形位置即与 CSS 一致。

var label: Label
var trim := 0.0

## 包一层：l 为已设好字体字号的 Label，line_h 为原版 line-height（培养层像素）
static func wrap(l: Label, line_h: float) -> CuTextBox:
	var c := CuTextBox.new()
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.label = l
	var f: Font = l.get_theme_font("font")
	var sz := l.get_theme_font_size("font_size")
	var fh: float = f.get_height(sz) if f != null else sz * 1.448
	var ls := int(round(line_h - fh))
	l.add_theme_constant_override("line_spacing", ls)
	c.trim = -float(ls)
	c.size_flags_horizontal = l.size_flags_horizontal
	c.size_flags_vertical = l.size_flags_vertical
	c.custom_minimum_size.x = l.custom_minimum_size.x
	c.add_child(l)
	l.minimum_size_changed.connect(c.update_minimum_size)
	return c

func _get_minimum_size() -> Vector2:
	if label == null: return Vector2.ZERO
	var m := label.get_combined_minimum_size()
	return Vector2(m.x, max(0.0, m.y - trim))

func _notification(what: int) -> void:
	if what == NOTIFICATION_SORT_CHILDREN and label != null:
		var m := label.get_combined_minimum_size()
		fit_child_in_rect(label, Rect2(0, -trim / 2.0, size.x, m.y))
