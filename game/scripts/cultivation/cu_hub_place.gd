class_name CuHubPlace
extends RefCounted
## 地点牌与时间卡（原版 qh-mode-cultivation.js sceneTag、renderVisitorStory 的 .cu-time-card；样式 -story.css）

## 原版 sceneTag(el, r)：.cu-place-tag left 10.5cqw top 2.2cqw，padding .25em .65em .3em，#1d1812c4 底，左边 3px #a8402e，
## 600 clamp(11px,1.35cqw,24px)/1.3，letter-spacing .08em；small 另起一行（display:block）margin-top .15em，.82em，字距 .3em，#e0c48f。
## 实测 cult-hub.json：134,28 137×32。
static func tag(el: Control, r) -> void:
	if el == null or not (r is Dictionary): return
	var fs := CuUI.fs(11, 1.35, 24)
	var sb := CuUI.box(Color("#1d1812c4"), Color(0, 0, 0, 0), 0, 0, 0)
	sb.border_color = Color("#a8402e"); sb.border_width_left = int(3 * CuUI.PX)
	sb.content_margin_left = 3 * CuUI.PX + fs * 0.65; sb.content_margin_right = fs * 0.65
	sb.content_margin_top = fs * 0.25; sb.content_margin_bottom = fs * 0.3
	var box := CuUI.panel_box(sb)
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var hb := VBoxContainer.new()
	hb.add_theme_constant_override("separation", int(round(fs * 0.82 * 0.15)))
	var nl := CuUI.lbl(str(r.name), fs, Color("#f1e6cc"), true)
	var nf := FontVariation.new(); nf.base_font = UI.kai_bold; nf.spacing_glyph = int(round(fs * 0.08))
	nl.add_theme_font_override("font", nf)
	hb.add_child(CuTextBox.wrap(nl, fs * 1.3))
	if r.get("timeName"):
		var tl := CuUI.lbl(str(r.timeName), int(fs * 0.82), Color("#e0c48f"))
		var tf := FontVariation.new(); tf.base_font = UI.kai_bold; tf.spacing_glyph = int(fs * 0.82 * 0.3)
		tl.add_theme_font_override("font", tf)
		hb.add_child(CuTextBox.wrap(tl, fs * 0.82 * 1.3))
	box.add_child(hb)
	box.position = Vector2(CuUI.cq(10.5), CuUI.cq(2.2))
	el.add_child(box)

## 时间过场卡 .cu-time-card：全屏 z40，径向渐变，字 600 clamp(26px,4.2cqw,68px) 字距 .45em，0.6s 淡入；整卡为继续
static func time_card(root: Control, text: String, nxt: Button) -> Control:
	var el := Control.new()
	el.name = "cu-time-card"
	el.set_meta("dialog", true)
	CuUI.fill(el)
	el.z_index = 40
	el.draw.connect(func():
		var c := el.size / 2
		var steps := 24
		el.draw_rect(Rect2(Vector2.ZERO, el.size), Color("#14110dfa"))
		for i in steps:
			var t := 1.0 - float(i) / steps
			var col := Color("#2a2620f0").lerp(Color("#14110dfa"), clamp(t / 0.7, 0.0, 1.0))
			el.draw_set_transform(c, 0, Vector2(el.size.x / el.size.y, 1))
			el.draw_circle(Vector2.ZERO, el.size.y * 0.75 * t, col)
		el.draw_set_transform(Vector2.ZERO))
	var fs := CuUI.fs(26, 4.2, 68)
	var l := CuUI.lbl(text, fs, Color("#efe4cb"), true, HORIZONTAL_ALIGNMENT_CENTER)
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	var f := FontVariation.new(); f.base_font = UI.kai_bold; f.spacing_glyph = int(fs * 0.45)
	l.add_theme_font_override("font", f)
	CuUI.fill(l)
	el.add_child(l)
	CuUI.fill(nxt)
	nxt.modulate.a = 0.75
	el.add_child(nxt)
	el.set_meta("next", nxt)
	root.add_child(el)
	el.modulate.a = 0.0
	el.create_tween().tween_property(el, "modulate:a", 1.0, 0.6).set_ease(Tween.EASE_OUT)
	return el
