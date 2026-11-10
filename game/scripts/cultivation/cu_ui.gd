class_name CuUI
extends RefCounted
## 培养界面公用控件（代替原版 qh-mode-cultivation.css 里的通用样式）。
## 坐标系：培养层是 1920×1080 的 Control，缩放 0.5 铺满 960×540 视口；原版 cqw = 1920/100 = 19.2px。
## 原版字体为楷体（"Kaiti SC"），工程里没有楷体，统一用 UI.kai（已知差异，见 cultivation-notes.md）。

const W := 1920.0
const H := 1080.0
const CQW := 19.2
const BASE := "assets/production/cultivation/"

static var _tex := {}

## 按原版相对路径取图（assets/...）；没有文件返回 null（对应原版 img onerror → 隐藏）
static func tex(path) -> Texture2D:
	if path == null or str(path) == "": return null
	var p := str(path).split("?")[0]
	if not p.begins_with("res://"): p = "res://" + p
	if _tex.has(p): return _tex[p]
	var t: Texture2D = load(p) if ResourceLoader.exists(p) else null
	_tex[p] = t
	return t

## 原版 cqw → 像素
static func cq(v: float) -> float: return v * CQW

## 原版 CSS px → 培养层像素。对照基准是 1280×720 窗口（cqw = 12.8px），培养层 1920 宽，故 1px = 1.5。
const PX := 1.5

## 原版 clamp(lo, v cqw, hi)；lo/hi 是原版 CSS px，按 PX 换算
static func fs(lo: float, v_cqw: float, hi: float) -> int: return int(round(clamp(v_cqw * CQW, lo * PX, hi * PX)))

## 原版 line-height：把 Label 的行距调成 line_h 像素（Godot 行高 = 字体高 + line_spacing）。
## 返回 CSS 行盒与 Godot 字形起点之差 (line_h - 字体高) / 2，绝对定位的标签可据此下移。
static func lh(l: Label, line_h: float) -> float:
	var f: Font = l.get_theme_font("font")
	var size := l.get_theme_font_size("font_size")
	var fh := f.get_height(size) if f != null else size * 1.448
	l.add_theme_constant_override("line_spacing", int(round(line_h - fh)))
	return (line_h - fh) / 2.0

## 竖排文字（writing-mode: vertical-rl; text-orientation: upright）：每字前进 1em + letter-spacing
static func vlabel(text: String, size: int, col: Color, bold := false, spacing_em := 0.0) -> Label:
	var l := lbl(vtext(text), size, col, bold, HORIZONTAL_ALIGNMENT_CENTER)
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lh(l, size * (1.0 + spacing_em))
	return l

## 原版 .cu-ornament 的宿主：框 w×h，花饰是边长 w×art 的正方形，居中（可溢出框外），i 为图集格
static func orn_box(i: int, w: float, h: float, art := 1.0) -> Control:
	var c := Control.new()
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size = Vector2(w, h)
	var o := ornament(i)
	var side := w * art
	place(o, (w - side) / 2, (h - side) / 2, side, side)
	c.add_child(o)
	return c

static func font(bold := false) -> Font:
	return UI.kai_bold if bold else UI.kai

## 纯色/描边面板样式
static func box(bg: Color, border := Color(0, 0, 0, 0), bw := 0, radius := 0, pad := 0.0) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.set_border_width_all(bw)
	sb.set_corner_radius_all(radius)
	sb.set_content_margin_all(pad)
	sb.anti_aliasing = true
	return sb

## 面板（PanelContainer 带样式）
static func panel_box(sb: StyleBox) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", sb)
	return p

## 定位
static func place(c: Control, l: float, t: float, w: float, h: float) -> Control:
	c.position = Vector2(l, t)
	c.size = Vector2(w, h)
	return c

static func lbl(text: String, size: int, col: Color, bold := false, align := HORIZONTAL_ALIGNMENT_LEFT) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", font(bold))
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	l.horizontal_alignment = align
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l

## 自动换行段落
static func para(text: String, size: int, col: Color, width := 0.0, bold := false) -> Label:
	var l := lbl(text, size, col, bold)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART   # 11-10：按词折行，标点不单独掉行
	if width > 0: l.custom_minimum_size = Vector2(width, 0)
	return l

## 竖排文字（原版 writing-mode: vertical-rl）：逐字换行
static func vtext(t: String) -> String:
	var out := []
	for ch in t: out.append(ch)
	return "\n".join(out)

static func _flat(b: Button, sb: StyleBox) -> void:
	for k in ["normal", "hover", "pressed", "focus", "disabled"]: b.add_theme_stylebox_override(k, sb)

## 原版通用按钮 #cultivation button：min-height 44px，padding .4em .8em，2px #967448 边，圆角 2px，
## #eee0bd 底、#392918 字，字号继承 #cultivation clamp(14px,1.35cqw,26px)/1.45；.cu-primary 绿底
static func btn(text: String, cmd: String, id := "", primary := false, size := 0) -> Button:
	var b := Button.new()
	b.text = text
	var fz := size if size > 0 else fs(14, 1.35, 26)
	b.custom_minimum_size = Vector2(0, 44 * PX)
	var bg := Color("#536942") if primary else Color("#eee0bd")
	var bd := Color("#88965e") if primary else Color("#967448")
	var sb := box(bg, bd, int(2 * PX), int(2 * PX), 0)
	sb.content_margin_left = fz * 0.8; sb.content_margin_right = fz * 0.8
	sb.content_margin_top = fz * 0.4; sb.content_margin_bottom = fz * 0.4
	sb.shadow_color = Color("#30231133"); sb.shadow_size = int(2 * PX); sb.shadow_offset = Vector2(0, 2 * PX)
	var hv: StyleBoxFlat = sb.duplicate(); hv.bg_color = bg.lightened(0.08)
	var fc: StyleBoxFlat = sb.duplicate(); fc.border_color = Color("#d18d39"); fc.set_border_width_all(int(3 * PX))
	b.add_theme_stylebox_override("normal", sb)
	b.add_theme_stylebox_override("hover", hv)
	b.add_theme_stylebox_override("pressed", hv)
	b.add_theme_stylebox_override("focus", fc)
	b.add_theme_stylebox_override("disabled", sb)
	# letter-spacing .02em
	var bf := FontVariation.new(); bf.base_font = UI.kai; bf.spacing_glyph = int(round(fz * 0.02))
	b.add_theme_font_override("font", bf)
	b.add_theme_font_size_override("font_size", fz)
	var fg := Color("#fff1c8") if primary else Color("#392918")
	for k in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color", "font_hover_pressed_color"]: b.add_theme_color_override(k, fg)
	b.add_theme_color_override("font_disabled_color", Color(fg, 0.48))
	set_cmd(b, cmd, id)
	return b

## 透明按钮（盖在图上的热区）
static func hot(cmd: String, id := "") -> Button:
	var b := Button.new()
	b.flat = true
	_flat(b, StyleBoxEmpty.new())
	set_cmd(b, cmd, id)
	return b

## 记下按钮命令（原版 data-cu / data-id），点击统一交给 Cultivation.on_cu
static func set_cmd(b: Button, cmd: String, id := "") -> void:
	b.set_meta("cu", cmd)
	b.set_meta("id", id)
	if cmd != "":
		b.pressed.connect(func(): Cultivation.on_cu(cmd, id, b))

static func _atlas(t: Texture2D, r: Rect2) -> AtlasTexture:
	var a := AtlasTexture.new()
	a.atlas = t
	a.region = r
	return a

## 原版 ornament(i)：ui/ornaments_v3.png 4 列 2 行
static func ornament(i: int) -> TextureRect:
	var r := img(null)
	var t := tex(BASE + "ui/ornaments_v3.png")
	if t != null:
		var w := t.get_width() / 4.0
		var h := t.get_height() / 2.0
		r.texture = _atlas(t, Rect2((i % 4) * w, floori(i / 4.0) * h, w, h))
	return r

## 图片（原版 <img>，object-fit: contain）
static func img(path, mode := TextureRect.STRETCH_KEEP_ASPECT_CENTERED) -> TextureRect:
	var r := TextureRect.new()
	r.texture = tex(path)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	r.stretch_mode = mode
	r.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	return r

## 图集区域（原版 canvas 画 rect 子图）
static func atlas_img(path, rect: Array) -> TextureRect:
	var r := img(null)
	var t := tex(path)
	if t != null: r.texture = _atlas(t, Rect2(rect[0], rect[1], rect[2], rect[3]))
	return r

## 栏目图标：ui/dock_icons_v3.png 按 CultivationMotion.iconRects[n]
static func icon(n: int) -> TextureRect:
	var rects: Array = CuDB.t("CultivationMotion").iconRects
	return atlas_img(BASE + "ui/dock_icons_v3.png", rects[clamp(n, 0, rects.size() - 1)])

## 铺满父控件
static func fill(c: Control) -> Control:
	c.set_anchors_preset(Control.PRESET_FULL_RECT)
	c.offset_left = 0; c.offset_top = 0; c.offset_right = 0; c.offset_bottom = 0
	return c

## 按父尺寸百分比定位（left/top/width/height 都是 0..100）
static func pct(c: Control, l: float, t: float, w: float, h: float) -> Control:
	c.anchor_left = l / 100.0; c.anchor_top = t / 100.0
	c.anchor_right = (l + w) / 100.0; c.anchor_bottom = (t + h) / 100.0
	c.offset_left = 0; c.offset_top = 0; c.offset_right = 0; c.offset_bottom = 0
	return c
