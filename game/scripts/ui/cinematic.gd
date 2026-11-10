extends Node
## 全屏 CG（原版 #prologue-cg：inset:0，背景色 + contain 居中；.qh-fire-cg 火灾插画另有转场）
## CG 画在界面层里、对白框之下（原版 z-index 50/55 < 对白 60/65）。

func show_cg(path: String, bg := Color("#181c1a")) -> Control:
	var c := Control.new(); c.size = Vector2(1280, 720); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var r := ColorRect.new(); r.color = bg; r.size = c.size; r.mouse_filter = Control.MOUSE_FILTER_IGNORE; c.add_child(r)
	var tex := Assets.tex(path)
	if tex:
		var tr := TextureRect.new(); tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; tr.texture = tex; tr.size = c.size
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS; tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		c.add_child(tr)
	UI.root.add_child(c)
	UI.root.move_child(c, Dialog.root.get_index())
	UI.hud_node.visible = false
	return c

func hide_cg(c: Control) -> void:
	if is_instance_valid(c):
		c.queue_free()
	UI.hud()
