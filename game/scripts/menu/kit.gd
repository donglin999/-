class_name QJKit
extends RefCounted
## 江湖菜单的界面零件：按原版 js/qihe-jianghu-ui.css 的样式造 Godot 控件。
## 颜色、字号、内边距照抄 CSS（以 1312×774 视口命中 max-height:790px 媒体查询后的最终值为准）。
## 物品/武学/心法图标查找顺序照 js/menu.js mnIco / mnSkIco / mnXfIco（v4 图集 → 旧图集 → 墨迹单字）。

const INK := Color("#29291f")
const RULE := Color(22 / 255.0, 22 / 255.0, 19 / 255.0, 0.5)     # --qj-rule
const PANEL_BG := Color("#faf7eeed")
const ICON_ATLAS := "assets/ui/jianghu-v5/icons-atlas.png"
const STAT_ATLAS_SRC := "assets/production/icons-and-props/i_equipment_stats_v1.webp"
const ART_ICON_INDEX := {"nav": {"attr": 0, "skill": 1, "bag": 2, "equip": 3, "party": 4, "quest": 5, "sys": 6, "pet": 7},
	"stat": {"str": 8, "con": 9, "agi": 10, "wil": 11, "wis": 12}, "slot": {"weapon": 13, "armor": 14, "acc": 15}}
const STAT_ATLAS := {"hp": 0, "mp": 1, "atk": 2, "def": 3, "mhp": 0, "mmp": 1, "crit": 4, "dodge": 5, "spd": 6, "block": 7,
	"str": 8, "con": 9, "agi": 10, "wil": 11, "wis": 12, "刀": 13, "剑": 14, "拳": 15, "棍": 16, "暗器": 17, "音律": 18, "yi": 19, "du": 20, "shi": 21, "virtue": 23}
const ICON_ALIAS := {"qh_practice_staff": "club", "qh_staff_notes": "bf_note"}

# ───────── 文字 ─────────
## 标签：size 字号 px；spacing 字距 px（CSS letter-spacing）
static func lab(text: String, size := 16, col := INK, bold := false, spacing := 0.0, sans := false) -> Label:
	var base: Font = (UI.sans_bold if bold else UI.sans) if sans else (UI.song_bold if bold else UI.song)
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", Paint.font(base, size, spacing / float(size)) if spacing != 0.0 else base)
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l

## 多行自动换行的段落；max_lines>0 时截断（CSS -webkit-line-clamp）
static func para(text: String, size := 15, col := INK, line_h := 1.8, max_lines := 0) -> Label:
	var l := lab(text, size, col)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART   # 11-10 第四十九轮：按词折行，句号不单独掉行
	l.add_theme_constant_override("line_spacing", int(size * (line_h - 1.35)))
	l.custom_minimum_size.x = 10
	if max_lines > 0:
		l.max_lines_visible = max_lines
		l.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	return l

# ───────── 样式盒 ─────────
static func sb(bg: Color, border := Color(0, 0, 0, 0), bw := [0, 0, 0, 0], radius := 0, pad := [0, 0, 0, 0]) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.border_width_left = bw[0]; s.border_width_top = bw[1]; s.border_width_right = bw[2]; s.border_width_bottom = bw[3]
	s.set_corner_radius_all(radius)
	s.content_margin_left = pad[0]; s.content_margin_top = pad[1]; s.content_margin_right = pad[2]; s.content_margin_bottom = pad[3]
	s.anti_aliasing = radius > 0
	return s

## 2026-11-06 菜单重设计（docs/review/menu-redesign-preview-v3）：茶白纸面板 + 墨色细框 + 四角折线 + 顶部居中题签
const FRAME_BG := Color("#f8f3e7ec")
const FRAME_LINE := Color("#8d7a55")
const PLAQUE_BG := Color("#efe4c8")
## 方案二：选中人物的主色（和队员头像底色同一套）；a=0 表示不染色
static var accent := Color(0, 0, 0, 0)
const ACCENTS := {"hero": "#55697d", "ye": "#5f8a6e", "suzhi": "#4f8274", "yinhongying": "#a8453a", "peizhigu": "#a57b3a", "censhuang": "#6e4a72"}
static func accent_of(id: String) -> Color:
	return Color(ACCENTS[id]) if ACCENTS.has(id) else Color(0, 0, 0, 0)
static func line_col() -> Color:
	return FRAME_LINE.lerp(accent, 0.6) if accent.a > 0 else FRAME_LINE
## 图片四边淡出成透明（大立绘直接站在纸上用）
static var _fade_mat: ShaderMaterial
static func fade_mat() -> ShaderMaterial:
	if _fade_mat == null:
		var sh := Shader.new()
		sh.code = """shader_type canvas_item;
uniform float ex = 0.24;
uniform float ey = 0.12;
void fragment() {
	vec4 c = texture(TEXTURE, UV) * COLOR;
	c.a *= smoothstep(0.0, ex, UV.x) * smoothstep(0.0, ex, 1.0 - UV.x) * smoothstep(0.0, ey, UV.y) * smoothstep(0.0, ey, 1.0 - UV.y);
	COLOR = c;
}"""
		_fade_mat = ShaderMaterial.new(); _fade_mat.shader = sh
	return _fade_mat
## 背景板虚化＋四边淡出（景深：人物清楚、背景退后）
static var _fade_blur_mat: ShaderMaterial
static func fade_blur_mat() -> ShaderMaterial:
	if _fade_blur_mat == null:
		var sh := Shader.new()
		sh.code = """shader_type canvas_item;
uniform float ex = 0.24;
uniform float ey = 0.12;
uniform float r = 0.0045;
void fragment() {
	vec4 c = vec4(0.0);
	float w = 0.0;
	for (int i = -3; i <= 3; i++) { for (int j = -3; j <= 3; j++) {
		float k = exp(-float(i * i + j * j) / 6.0);
		c += texture(TEXTURE, UV + vec2(float(i), float(j)) * r) * k; w += k; } }
	c = c / w * COLOR;
	c.rgb = mix(c.rgb, vec3(0.93, 0.93, 0.91), 0.12);
	c.a *= smoothstep(0.0, ex, UV.x) * smoothstep(0.0, ex, 1.0 - UV.x) * smoothstep(0.0, ey, UV.y) * smoothstep(0.0, ey, 1.0 - UV.y);
	COLOR = c;
}"""
		_fade_blur_mat = ShaderMaterial.new(); _fade_blur_mat.shader = sh
	return _fade_blur_mat
## 人物剪影外扩成一圈柔光（轮廓光，叠在人物身后）
static var _rim_mat: ShaderMaterial
static func rim_mat() -> ShaderMaterial:
	if _rim_mat == null:
		var sh := Shader.new()
		sh.code = """shader_type canvas_item;
uniform vec4 tint : source_color = vec4(1.0, 0.99, 0.94, 0.9);
uniform float r = 0.006;
void fragment() {
	float a = 0.0;
	for (int i = 0; i < 16; i++) {
		float t = 6.2831853 * float(i) / 16.0;
		a = max(a, texture(TEXTURE, UV + vec2(cos(t), sin(t)) * r).a);
		a = max(a, texture(TEXTURE, UV + vec2(cos(t), sin(t)) * r * 0.5).a * 0.9);
	}
	COLOR = vec4(tint.rgb, tint.a * a);
}"""
		_rim_mat = ShaderMaterial.new(); _rim_mat.shader = sh
	return _rim_mat
static func titled(title: String, child: Control = null, pad := [16, 30, 16, 14]) -> PanelContainer:
	var fbg := Color(FRAME_BG, 0.8) if Menu.PAGE_BG == "glass" else FRAME_BG   # 整页底“面板微透”方案（待选）
	var fl := line_col()
	var p := panel(fbg, Color(fl, 0.7), [1, 1, 1, 1], pad if title != "" else [pad[0], pad[3], pad[2], pad[3]])
	p.draw.connect(func():
		var r := Rect2(Vector2.ZERO, p.size)
		var k := 9.0
		for c in [[r.position, Vector2(1, 1)], [Vector2(r.end.x, r.position.y), Vector2(-1, 1)], [Vector2(r.position.x, r.end.y), Vector2(1, -1)], [r.end, Vector2(-1, -1)]]:
			var o: Vector2 = c[0] + c[1] * 4
			p.draw_line(o, o + Vector2(c[1].x * k, 0), fl, 1.0)
			p.draw_line(o, o + Vector2(0, c[1].y * k), fl, 1.0)
		if title == "": return
		# 11-10 第五十轮第 1 题选 B（册页题跋）：题签改成靠左的朱印式小匾（淡墨一抹作底、朱红双线框、朱红字），各页统一
		seal_plaque(p, Vector2(14, -14), title, 16))
	if child: p.add_child(child)
	return p

## 朱印式题签：后面一抹淡墨，前面米白底、朱红双线框、朱红宋体字（第五十轮 B 版）。pos 是框左上角
const SEAL_RED := Color("#a8352a")
static func seal_plaque(ci: CanvasItem, pos: Vector2, text: String, fs := 16, filled := false) -> Vector2:
	var tw := 0.0
	for ch in text: tw += UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 3
	tw -= 3
	var r := Rect2(pos, Vector2(tw + 26, fs + 14))
	var wash := _tex(KIT_DIR + "wash.png")
	if wash: ci.draw_texture_rect(wash, Rect2(r.position + Vector2(r.size.x * 0.35, -2), Vector2(r.size.x * 1.4, r.size.y + 4)), false, Color(0.72, 0.68, 0.64, 0.9) if filled else Color(1, 1, 1, 0.7))
	# filled：朱红实底、米白字（预览图 B 的“人物”）；否则米白底朱红双线框（“武学与状态”）
	ci.draw_rect(r, SEAL_RED if filled else Color("#f6eedb"))
	ci.draw_rect(r, SEAL_RED, false, 1.6)
	ci.draw_rect(r.grow(-3), Color("#f3d9c8", 0.8) if filled else Color(SEAL_RED, 0.75), false, 0.8)
	var x := r.position.x + 13
	for ch in text:
		ci.draw_string(UI.song_bold, Vector2(x, r.get_center().y + fs * 0.36), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color("#fbeee2") if filled else SEAL_RED)
		x += UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 3
	return r.size

## 朱印式题签作为一个控件（栏首用）
static func seal_title(text: String, fs := 16, filled := false) -> Control:
	var c := Control.new(); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.custom_minimum_size = Vector2(0, fs + 22)
	c.draw.connect(func(): seal_plaque(c, Vector2(2, 3), text, fs, filled))
	return c

## 圆角木签（第五十轮 B 版：内功、外功、轻功这类竖排小类名）
static func tag_v(text: String, fs := 13) -> Control:
	var p := panel(Color("#ecdfbf"), Color("#b89a66"), [1, 1, 1, 1], [5, 6, 5, 6])
	p.add_theme_stylebox_override("panel", sb(Color("#ecdfbf"), Color("#b89a66"), [1, 1, 1, 1], 7, [5, 7, 5, 7]))
	var v := vbox(0)
	for ch in text:
		var l := lab(ch, fs, Color("#4a3a26"), true); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; v.add_child(l)
	p.add_child(v)
	return p

## 锦纹带（装裱用，生图素材 brocade.png 平铺）；vertical 为竖条（隔水）
static func brocade(vertical := false, th := 10.0) -> TextureRect:
	var t := TextureRect.new()
	t.texture = _tex(KIT_DIR + ("brocade_v.png" if vertical else ("brocade_thin.png" if th < 14 else "brocade.png")))
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	t.stretch_mode = TextureRect.STRETCH_TILE
	t.custom_minimum_size = Vector2(th, 0) if vertical else Vector2(0, th)
	t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return t

## 册页金色锦边（11-10 第五十轮 B 版“继续改”：从预览图 B 上裁下来的那道页眉、页脚横边），平铺画在 y 处、高 h
static func album_band(ci: CanvasItem, y: float, h := 13.0, x0 := 0.0, x1 := 1280.0) -> void:
	var t := _tex(KIT_DIR + "album_band_h.png")
	if t == null: return
	var w := t.get_width() * h / t.get_height()
	var x := x0
	while x < x1:
		var ww := minf(w, x1 - x)
		ci.draw_texture_rect_region(t, Rect2(x, y, ww, h), Rect2(0, 0, t.get_width() * ww / w, t.get_height()))
		x += w

## 册页竖隔水（同上，预览图 B 左右两条金色锦纹竖条），拉满所在高度
static func album_strip(w := 14.0) -> TextureRect:
	var t := TextureRect.new(); t.texture = _tex(KIT_DIR + "album_strip_v.png")
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; t.stretch_mode = TextureRect.STRETCH_SCALE
	t.custom_minimum_size = Vector2(w, 0); t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return t

## 横卷轴：纸面（上下两道细边），左右两根木轴（比纸面高出一截、两头圆钮）；文字居中
const SCROLL_PAPER := Color("#f1e6c8")
const SCROLL_EDGE := Color("#c9b386")
const SCROLL_ROD := Color("#6b4a2b")
const SCROLL_ROD_HI := Color("#9a7047")
static func hscroll(ci: CanvasItem, r: Rect2, text: String, fs: int, col := INK) -> void:
	var paper := Rect2(r.position.x + 7, r.position.y + 2, r.size.x - 14, r.size.y - 4)
	ci.draw_rect(Rect2(paper.position + Vector2(1, 2), paper.size), Color(0, 0, 0, 0.12))
	ci.draw_rect(paper, SCROLL_PAPER)
	ci.draw_rect(Rect2(paper.position, Vector2(paper.size.x, 2)), SCROLL_EDGE)
	ci.draw_rect(Rect2(paper.position.x, paper.end.y - 2, paper.size.x, 2), SCROLL_EDGE)
	for x in [r.position.x + 3, r.end.x - 9]:
		var rod := Rect2(x, r.position.y - 3, 6, r.size.y + 6)
		ci.draw_rect(rod, SCROLL_ROD)
		ci.draw_rect(Rect2(rod.position.x + 1, rod.position.y, 2, rod.size.y), SCROLL_ROD_HI)
		ci.draw_circle(Vector2(rod.get_center().x, rod.position.y), 3.5, SCROLL_ROD)
		ci.draw_circle(Vector2(rod.get_center().x, rod.end.y), 3.5, SCROLL_ROD)
	var tw := 0.0
	for ch in text: tw += UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 4
	tw -= 4
	var x := r.get_center().x - tw / 2
	for ch in text:
		ci.draw_string(UI.song_bold, Vector2(x, r.get_center().y + fs * 0.36), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, col)
		x += UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 4

## 竖卷轴小签：上下两根横木轴（两头圆钮），中间竖条纸面，字竖排
static func vscroll(text: String, fs := 13, col := Color("#4a3a26")) -> Control:
	var c := Control.new(); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var lh := fs + 3.0
	c.custom_minimum_size = Vector2(fs + 14, lh * text.length() + 16)
	c.draw.connect(func():
		var w := c.size.x; var h := c.size.y
		var paper := Rect2(3, 5, w - 6, h - 10)
		c.draw_rect(Rect2(paper.position + Vector2(1, 1), paper.size), Color(0, 0, 0, 0.12))
		c.draw_rect(paper, SCROLL_PAPER)
		c.draw_rect(Rect2(paper.position, Vector2(1.5, paper.size.y)), SCROLL_EDGE)
		c.draw_rect(Rect2(paper.end.x - 1.5, paper.position.y, 1.5, paper.size.y), SCROLL_EDGE)
		for y in [1.0, h - 5.0]:
			c.draw_rect(Rect2(0, y, w, 4), SCROLL_ROD)
			c.draw_rect(Rect2(0, y, w, 1.5), SCROLL_ROD_HI)
			c.draw_circle(Vector2(0, y + 2), 2.5, SCROLL_ROD); c.draw_circle(Vector2(w, y + 2), 2.5, SCROLL_ROD)
		var yy := 8.0 + fs * 0.9
		for ch in text:
			var cw := UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
			c.draw_string(UI.song_bold, Vector2((w - cw) / 2, yy), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, col)
			yy += lh)
	return c

## 横卷轴小标题（栏内分节用）：整行宽，卷轴按字数定宽靠左
static func scroll_head(text: String, fs := 14) -> Control:
	var c := Control.new(); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.custom_minimum_size = Vector2(0, fs + 14)
	c.draw.connect(func():
		var tw := 0.0
		for ch in text: tw += UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 4
		hscroll(c, Rect2(0, 4, tw + 44, fs + 8), text, fs)
		c.draw_line(Vector2(tw + 52, c.size.y / 2 + 2), Vector2(c.size.x, c.size.y / 2 + 2), Color(FRAME_LINE, 0.3), 1.0))
	return c

## 品级小方框（丁 / 丙 / 乙 / 甲 / 绝；丙及以上朱红）
static func grade_tag(g: String, fs := 13) -> Control:
	var hi := g in ["丙", "乙", "甲", "绝"]
	var col := Color("#a8352a") if hi else Color("#6d5a3a")
	var p := panel(Color("#f3e9d2") if not hi else Color("#f6e1d6"), Color(col, 0.7), [1, 1, 1, 1], [4, 0, 4, 0])
	p.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	p.add_child(lab(g, fs, col, true))
	return p

## 面板底（带背景色、可选边线）
static func panel(bg: Color, border := Color(0, 0, 0, 0), bw := [0, 0, 0, 0], pad := [0, 0, 0, 0]) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", sb(bg, border, bw, 0, pad))
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return p

# ───────── 按钮 ─────────
## cls：""（.qj-button）、"primary"、"on"、"cat"（分类签）、"cat_on"、"flat"（透明无框）、"link"
static func btn(text: String, action: String, data := {}, cls := "", size := 16, pad := [18, 8, 18, 8], min_h := 44) -> Button:
	var b := Button.new()
	b.text = text
	b.set_meta("qj", action)
	for k in data: b.set_meta(k, data[k])
	b.add_theme_font_override("font", UI.song)
	b.add_theme_font_size_override("font_size", size)
	b.custom_minimum_size.y = min_h
	b.focus_mode = Control.FOCUS_ALL
	style_btn(b, cls, pad)
	return b

static func style_btn(b: Button, cls: String, pad := [18, 8, 18, 8]) -> void:
	var n: StyleBoxFlat; var h: StyleBoxFlat; var f: StyleBoxFlat
	var fc := INK; var hc := Color("#514329")
	match cls:
		"primary":
			n = sb(Color("#6c5838"), Color("#9d814e"), [1, 1, 1, 1], 3, pad)
			h = sb(Color("#8a7045"), Color("#9d814e"), [1, 1, 1, 1], 3, pad)
			f = sb(Color("#826940"), Color("#9d814e"), [1, 1, 1, 1], 3, pad)
			fc = Color("#fff5d9"); hc = Color("#fff5d9")
		"on":
			n = sb(Color("#ded0a6"), Color("#8d794f80"), [1, 1, 1, 1], 3, pad)
			h = sb(Color("#ebe0c1"), Color("#a88a4e"), [1, 1, 1, 1], 3, pad)
			f = sb(Color("#eee3c5"), Color("#a88a4e"), [1, 1, 1, 1], 3, pad)
			fc = Color("#5c451c")
		"cat", "cat_on":
			var on := cls == "cat_on"
			n = sb(Color("#ccb57866") if on else Color(0, 0, 0, 0), Color("#886329") if on else Color(0, 0, 0, 0), [0, 0, 0, 2], 0, pad)
			h = sb(Color("#ccb57866") if on else Color("#ebe0c180"), Color("#886329") if on else Color("#a88a4e"), [0, 0, 0, 2], 0, pad)
			f = h
			fc = Color("#64491c") if on else INK
		"flat", "link":
			n = sb(Color(0, 0, 0, 0), Color(0, 0, 0, 0), [0, 0, 0, 0], 0, pad)
			h = sb(Color("#ede0bf77"), Color(0, 0, 0, 0), [0, 0, 0, 0], 0, pad)
			f = h
		_:
			n = sb(Color("#f7f2dfb8"), Color("#8d794f80"), [1, 1, 1, 1], 3, pad)
			h = sb(Color("#ebe0c1"), Color("#a88a4e"), [1, 1, 1, 1], 3, pad)
			f = sb(Color("#eee3c5"), Color("#a88a4e"), [1, 1, 1, 1], 3, pad)
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", h)
	b.add_theme_stylebox_override("focus", _focus_ring())
	b.add_theme_stylebox_override("hover_pressed", h)
	b.add_theme_stylebox_override("disabled", n)
	b.add_theme_color_override("font_color", fc)
	b.add_theme_color_override("font_hover_color", hc)
	b.add_theme_color_override("font_pressed_color", hc)
	b.add_theme_color_override("font_focus_color", fc)
	b.add_theme_color_override("font_hover_pressed_color", hc)

## 键盘焦点环（CSS :focus-visible outline）
static func _focus_ring() -> StyleBoxFlat:
	var s := sb(Color(0, 0, 0, 0), Color("#a88a4e"), [2, 2, 2, 2], 3)
	s.draw_center = false
	s.expand_margin_left = 2; s.expand_margin_right = 2; s.expand_margin_top = 2; s.expand_margin_bottom = 2
	return s

## 卡片按钮（内含图标与多行文字）：返回 QJCard，内容放进 content(card)
static func card(action: String, data := {}, vertical := true, sep := 4, normal: StyleBox = null, hover: StyleBox = null, on: StyleBox = null, pad := [0, 0, 0, 0]) -> QJCard:
	var b := QJCard.new()
	b.set_meta("qj", action)
	for k in data: b.set_meta(k, data[k])
	b.pad = pad
	b.st_normal = normal
	b.st_hover = hover if hover else sb(Color("#ede0bf77"))
	b.st_on = on
	var c: BoxContainer = VBoxContainer.new() if vertical else HBoxContainer.new()
	c.add_theme_constant_override("separation", sep)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.alignment = BoxContainer.ALIGNMENT_CENTER
	c.name = "box"
	b.add_child(c)
	return b

static func content(b: Control) -> BoxContainer:
	return b.get_node("box")

# ───────── 布局 ─────────
static func vbox(sep := 0) -> VBoxContainer:
	var v := VBoxContainer.new(); v.add_theme_constant_override("separation", sep); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return v

static func hbox(sep := 0) -> HBoxContainer:
	var h := HBoxContainer.new(); h.add_theme_constant_override("separation", sep); h.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return h

static func margin(l := 0, t := 0, r := 0, b := 0) -> MarginContainer:
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", l); m.add_theme_constant_override("margin_top", t)
	m.add_theme_constant_override("margin_right", r); m.add_theme_constant_override("margin_bottom", b)
	m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return m

static func grid(cols: int, hsep := 0, vsep := 0) -> GridContainer:
	var g := GridContainer.new(); g.columns = cols
	g.add_theme_constant_override("h_separation", hsep); g.add_theme_constant_override("v_separation", vsep)
	g.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return g

## 细滚动区（CSS scrollbar-width:thin，滑块 #a18752 / 槽 #e7d9b8）
static func scroll(horizontal := false) -> ScrollContainer:
	var s := ScrollContainer.new()
	s.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO if horizontal else ScrollContainer.SCROLL_MODE_DISABLED
	s.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED if horizontal else ScrollContainer.SCROLL_MODE_AUTO
	var bar: ScrollBar = s.get_h_scroll_bar() if horizontal else s.get_v_scroll_bar()
	bar.add_theme_stylebox_override("scroll", sb(Color("#e7d9b8"), Color(0, 0, 0, 0), [0, 0, 0, 0], 3, [3, 3, 3, 3]))
	bar.add_theme_stylebox_override("grabber", sb(Color("#a18752"), Color(0, 0, 0, 0), [0, 0, 0, 0], 3))
	bar.add_theme_stylebox_override("grabber_highlight", sb(Color("#8d7341"), Color(0, 0, 0, 0), [0, 0, 0, 0], 3))
	bar.add_theme_stylebox_override("grabber_pressed", sb(Color("#8d7341"), Color(0, 0, 0, 0), [0, 0, 0, 0], 3))
	bar.custom_minimum_size = Vector2(6, 6)
	return s

## 1px 细分隔线（--qj-rule）
## 分隔线：11-10 第四十七轮第四次意见“不要用简单的线条样式，隔开的竖线横线也要改”——
## 换成生图的一笔水墨分隔线（起笔重、收笔飞白，正中一个小云纹结；assets/production/ui/qj-kit-v1/），竖线用同一笔转 90 度。
## col 的透明度决定深浅
const KIT_DIR := "assets/production/ui/qj-kit-v1/"
static func rule(col := RULE, vertical := false, w := 1) -> Control:
	var r := TextureRect.new()
	r.texture = _tex(KIT_DIR + ("divider_v.png" if vertical else "divider.png"))
	r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	r.stretch_mode = TextureRect.STRETCH_SCALE
	r.modulate = Color(1, 1, 1, clampf(col.a * 1.8, 0.35, 1.0))
	var th := maxf(6.0, w * 4.0)
	r.custom_minimum_size = Vector2(th, 0) if vertical else Vector2(0, th)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return r

## 竹简小签：竖排类别名写在一片旧竹简上（生图素材 slip.png）
static func slip(text: String, fs := 13, col := Color("#3a2c1a")) -> Control:
	var c := Control.new(); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var lh := fs + 3.0
	c.custom_minimum_size = Vector2(fs + 12, lh * text.length() + 22)
	var t := TextureRect.new(); t.texture = _tex(KIT_DIR + "slip.png")
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; t.stretch_mode = TextureRect.STRETCH_SCALE
	t.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(t)
	var v := vbox(int(lh - fs - 3)); v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for ch in text:
		var l := lab(ch, fs, col, true); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		v.add_child(l)
	c.add_child(v)
	return c

## 栏内小标题：字压在一笔淡墨横扫上（生图素材 wash.png），后面接一笔水墨分隔线
static func wash_head(text: String, fs := 15) -> Control:
	var row := hbox(8); row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var hold := Control.new(); hold.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var tw := 0.0
	for ch in text: tw += UI.song.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 3
	hold.custom_minimum_size = Vector2(tw + 34, fs + 14)
	var t := TextureRect.new(); t.texture = _tex(KIT_DIR + "wash.png")
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; t.stretch_mode = TextureRect.STRETCH_SCALE
	t.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	t.modulate = Color(0.74, 0.71, 0.67)   # 11-10：原色太浅，压在米黄纸上看不出；按预览图 B 加深成一抹中灰
	hold.add_child(t)
	var l := lab(text, fs, Color("#231a12"), true, 3); l.position = Vector2(10, 4)
	hold.add_child(l)
	row.add_child(hold)
	var r := rule(Color(FRAME_LINE, 0.4)); r.size_flags_vertical = Control.SIZE_SHRINK_CENTER; expand(r)
	row.add_child(r)
	return row

static func spacer(h := 0, w := 0) -> Control:
	var c := Control.new(); c.custom_minimum_size = Vector2(w, h); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return c

static func expand(c: Control, ratio := 1.0, h := true, v := false) -> Control:
	if h: c.size_flags_horizontal = Control.SIZE_EXPAND_FILL; c.size_flags_stretch_ratio = ratio
	if v: c.size_flags_vertical = Control.SIZE_EXPAND_FILL
	if v and not h: c.size_flags_stretch_ratio = ratio
	return c

# ───────── 图标 ─────────
static var _atlas_cache := {}

static func _tex(path: String) -> Texture2D:
	return Assets.tex(path) if path != "" else null

## 图集取一格：cols×rows 均分（CSS background-size N00% M00%）
static func atlas_cell(path: String, cols: int, rows: int, cx: int, cy: int) -> Texture2D:
	var key := "%s|%d|%d" % [path, cx, cy]
	if _atlas_cache.has(key): return _atlas_cache[key]
	var t := _tex(path)
	if t == null: return null
	var a := AtlasTexture.new()
	a.atlas = t
	var w := t.get_width() / float(cols); var h := t.get_height() / float(rows)
	a.region = Rect2(cx * w, cy * h, w, h)
	_atlas_cache[key] = a
	return a

static func icon_rect(t: Texture2D, sz: float, shadow := false) -> Control:
	var r := TextureRect.new()
	r.texture = t
	r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	r.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	r.custom_minimum_size = Vector2(sz, sz)
	r.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	r.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	r.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	if shadow:
		# CSS filter: drop-shadow(0 2px 2px #382b1940)：下方叠一层半透明暗影
		var holder := Control.new()
		holder.custom_minimum_size = Vector2(sz, sz)
		holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
		holder.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		holder.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var sh := r.duplicate() as TextureRect
		sh.modulate = Color(0.22, 0.17, 0.1, 0.25)
		sh.position = Vector2(0, 2); sh.size = Vector2(sz, sz)
		r.position = Vector2.ZERO; r.size = Vector2(sz, sz)
		holder.add_child(sh); holder.add_child(r)
		return holder
	return r

## paintedIcon(kind,key)：assets/ui/jianghu-v5/icons-atlas.png 4×4
static func painted(kind: String, key: String, sz := 64.0) -> Control:
	var i: int = ART_ICON_INDEX.get(kind, {}).get(key, 2)
	return icon_rect(atlas_cell(ICON_ATLAS, 4, 4, i % 4, i / 4), sz, true)

## numericIcon(k)：i_equipment_stats_v1.webp 6×4，28×28
static func numeric(k: String, sz := 28.0) -> Control:
	var n: int = STAT_ATLAS.get(k, 23)
	return icon_rect(atlas_cell(STAT_ATLAS_SRC, 6, 4, n % 6, n / 6), sz)

## mnIco：v4 物品图集 → 旧图集 MENU_ICONS.item → 墨迹单字
static func item_tex(k: String) -> Texture2D:
	var v4 = DB.g("ITEM_ICONS_V4")
	# 新图集里有本名就用本名（护路棍法笔记原先被别名带到旧图集的 bf_note，11-07 修）
	if not (v4 and v4.item.has(k)): k = ICON_ALIAS.get(k, k)
	if v4 and v4.item.has(k):
		var c: Array = v4.item[k]
		return atlas_cell(v4.src, int(v4.cols), int(v4.rows), int(c[0]), int(c[1]))
	return _menu_icon("item", k)

static func _menu_icon(kind: String, k: String) -> Texture2D:
	var a = DB.g("MENU_ICONS")
	if a and a.get(kind, {}).has(k):
		var c: Array = a[kind][k]
		return atlas_cell("assets/production/icons-and-props/i_jianghu.webp", int(a.cols), int(a.rows), int(c[0]), int(c[1]))
	return null

static func item_icon(k: String, sz := 56.0) -> Control:
	var t := item_tex(k)
	if t: return icon_rect(t, sz)
	var it: Dictionary = DB.ITEMS.get(k, {})
	var q := QJModel.mn_q(k)
	return blot(str(it.get("name", "?")).substr(0, 1), Color(q[1]), sz)

## mnSkIco：新画风图标（assets/ui/skill-icons-v5）→ 墨迹字（武学名首字，MN_KCOL[kind] 色）
## 新画风武学图标（逸剑式手绘，2026-11-07 起取代旧菜单图集里的招式、心法图标）
static func _v5_icon(k: String) -> Texture2D:
	var p := "assets/ui/skill-icons-v5/%s.webp" % k
	return Assets.tex(p) if ResourceLoader.exists("res://" + p) else null

static func skill_icon(k: String, sz := 64.0) -> Control:
	var t := _v5_icon(k)
	if t: return icon_rect(t, sz)
	# 旧菜单图集的招式图标已停用（11-07 用户：换成新画风），没有新图的显示墨迹字
	var sk: Dictionary = DB.SKILLS.get(k, {})
	return blot(str(sk.get("name", "武")).substr(0, 1), Color(QJModel.MN_KCOL.get(sk.get("kind", ""), "#3b2c1b")), sz)

## mnXfIco：新画风图标 → 墨迹字「心」#3a4f8a
static func xinfa_icon(k: String, sz := 64.0) -> Control:
	var t := _v5_icon(k)
	if t: return icon_rect(t, sz)
	# 旧菜单图集的心法图标已停用，同上
	return blot("心", Color("#3a4f8a"), sz)

## mnBlot：墨迹单字（原版 BUI.blot 程序生成；这里用圆形淡墨底 + 书法字代替，见 menu-notes.md）
static func blot(ch: String, col: Color, sz := 30.0) -> Control:
	var c := Control.new()
	c.custom_minimum_size = Vector2(sz, sz)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	c.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	c.draw.connect(func():
		c.draw_circle(Vector2(sz, sz) / 2, sz * 0.46, Color(col, 0.16))
		c.draw_arc(Vector2(sz, sz) / 2, sz * 0.46, 0, TAU, 32, Color(col, 0.45), 1.5, true)
		var f: Font = UI.brush
		var fs := int(sz * 0.6)
		var w := f.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
		c.draw_string(f, Vector2((sz - w) / 2, sz / 2 + fs * 0.36), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, col))
	return c

# ───────── 立绘 ─────────
static var _manifest := {}

## image(v)：菜单全身立绘键（主角按借衣与否选 hero-village/hero-modern；同伴用 id）
static func portrait_key(id: String) -> String:
	if id == "hero": return "hero-village" if QJModel._borrowed() else "hero-modern"
	return id

## 返回 [纹理, 裁切区]；清单无此人时退回小立绘 p_{por}
static func portrait_tex(id: String) -> Array:
	if _manifest.is_empty(): _manifest = QJModel._json("res://data/menu/portraits.json")
	var key := portrait_key(id)
	var m = _manifest.get(key)
	if m:
		var t := _tex(m.file)
		if t:
			var b: Array = m.b
			var r := Rect2(maxf(0, b[0] - 8), maxf(0, b[1] - 8), 0, 0)
			r.end = Vector2(minf(m.w, b[2] + 8), minf(m.h, b[3] + 8))
			var k := t.get_width() / float(m.w)
			return [t, Rect2(r.position * k, r.size * k)]
	var p := _tex(QJModel.portrait(id))
	return [p, Rect2(Vector2.ZERO, p.get_size()) if p else Rect2()]

## 可见包围盒宽高比（队伍页立绘列宽权重）
static func portrait_weight(id: String) -> float:
	if _manifest.is_empty(): _manifest = QJModel._json("res://data/menu/portraits.json")
	var m = _manifest.get(portrait_key(id))
	if m == null: return 0.45
	var b: Array = m.b
	return (minf(m.w, b[2] + 8) - maxf(0, b[0] - 8)) / (minf(m.h, b[3] + 8) - maxf(0, b[1] - 8))

static func portrait_view(id: String) -> QJFitTex:
	var f := QJFitTex.new()
	var pt := portrait_tex(id)
	f.set_tex(pt[0], pt[1])
	return f

## 头像（mnFace 72px 程序头像的替代：取小立绘上部，圆形裁切）
static func face(id: String, sz := 38.0, ring := Color("#9e8c61"), ring2 := Color(0, 0, 0, 0)) -> Control:
	var t := rail_icon(id)   # 有专属胸像就用它（画风统一，2026-11-06），没有再退回小立绘
	var bust := t != null
	if not bust: t = _tex(QJModel.portrait(id))
	var c := Control.new()
	c.custom_minimum_size = Vector2(sz, sz)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	c.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	c.draw.connect(func():
		var ctr := Vector2(sz, sz) / 2
		if ring2.a > 0: c.draw_circle(ctr, sz / 2 + 2, ring2)
		c.draw_circle(ctr, sz / 2, Color("#ded0ad"))
		if t:
			# 头部：取图宽中间 46%、顶端起的正方形
			# 专属胸像：取宽中间 64%、顶端 6% 起的正方形
			var w := t.get_width() * (0.64 if bust else 0.46)
			var src := Rect2((t.get_width() - w) / 2, t.get_height() * (0.06 if bust else 0.04), w, w)
			var pts := PackedVector2Array(); var uvs := PackedVector2Array()
			for i in 32:
				var a := TAU * i / 32.0
				var p := ctr + Vector2(cos(a), sin(a)) * (sz / 2 - 1)
				pts.append(p)
				uvs.append((src.position + (p / sz) * src.size) / t.get_size())
			c.draw_colored_polygon(pts, Color.WHITE, uvs, t)
		c.draw_arc(ctr, sz / 2, 0, TAU, 40, ring, 1.0 if ring2.a == 0 else 2.0, true))
	return c

## 队员列头像（2026-11-06，不用圆形）：shape = "scroll" 小挂轴 / "chamfer" 切角印框 / "tag" 腰牌；id 为空画空位。
## 取小立绘上部（宽 60%），按外形多边形裁切；选中朱红框 + 右上小朱印。
static func rail_shape(shape: String, w: float, h: float) -> PackedVector2Array:
	match shape:
		"chamfer":
			var c := 12.0
			return PackedVector2Array([Vector2(c, 0), Vector2(w - c, 0), Vector2(w, c), Vector2(w, h - c), Vector2(w - c, h), Vector2(c, h), Vector2(0, h - c), Vector2(0, c)])
		"tag":
			var c := 9.0; var tip := 16.0
			return PackedVector2Array([Vector2(c, 0), Vector2(w - c, 0), Vector2(w, c), Vector2(w, h - tip), Vector2(w / 2, h), Vector2(0, h - tip), Vector2(0, c)])
		_:
			return PackedVector2Array([Vector2(0, 0), Vector2(w, 0), Vector2(w, h), Vector2(0, h)])

## 专属头像（2026-11-06，gpt-image-2.6 出图，docs/review/menu-rail-icons-v1）：assets/ui/jianghu-v4/rail/<立绘键>.webp，
## 4:5 胸像带淡墨底；没有专属头像的人退回小立绘上部裁切
static func rail_icon(id: String) -> Texture2D:
	if id == "": return null
	var p := "assets/ui/jianghu-v4/rail/%s.webp" % portrait_key(id)
	return _tex(p) if ResourceLoader.exists("res://" + p) else null

static func rail_face(id: String, shape: String, w: float, h: float, on: bool, seal := "", badge := "") -> Control:
	var icon := rail_icon(id)
	var t := icon if icon else (_tex(QJModel.portrait(id)) if id != "" else null)
	var c := Control.new()
	c.custom_minimum_size = Vector2(w, h)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	c.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	var red := Color("#b0443a"); var ink := Color("#6f5a38")
	c.draw.connect(func():
		var inset := 4.0 if shape == "scroll" else 0.0
		var pts := rail_shape(shape, w - inset * 2, h - inset * 2)
		for i in pts.size(): pts[i] += Vector2(inset, inset)
		var outer := rail_shape(shape, w, h)
		if shape == "scroll":
			# 挂轴：外层纸框 + 上下两道轴杆
			c.draw_colored_polygon(outer, Color("#f3ead6"))
			c.draw_rect(Rect2(-3, -2, w + 6, 3), Color("#7a5a36"))
			c.draw_rect(Rect2(-3, h - 1, w + 6, 3), Color("#7a5a36"))
		var fill := Color("#e7dcc2") if id != "" else Color("#efe6d1aa")
		c.draw_colored_polygon(pts, fill)
		if t:
			var sw := t.get_width() * (1.0 if icon else 0.62)
			var sh := sw * (h - inset * 2) / (w - inset * 2)
			if icon and sh > t.get_height():
				sh = t.get_height(); sw = sh * (w - inset * 2) / (h - inset * 2)
			var src := Rect2((t.get_width() - sw) / 2, 0.0 if icon else t.get_height() * 0.03, sw, minf(sh, t.get_height() * (1.0 if icon else 0.97)))
			var uvs := PackedVector2Array()
			for p in pts: uvs.append((src.position + (p - Vector2(inset, inset)) / Vector2(w - inset * 2, h - inset * 2) * src.size) / t.get_size())
			c.draw_colored_polygon(pts, Color.WHITE, uvs, t)
		var line := pts.duplicate(); line.append(pts[0])
		var col := red if on else (ink if id != "" else Color("#cdbb94"))
		c.draw_polyline(line, col, 2.0 if on else 1.0, true)
		if shape == "scroll" or shape == "chamfer":
			var o := outer.duplicate(); o.append(outer[0])
			if shape == "chamfer":
				for i in o.size(): o[i] = o[i] + (o[i] - Vector2(w, h) / 2).normalized() * 3
			c.draw_polyline(o, Color(col, 0.55), 1.0, true)
		if shape == "tag":
			c.draw_circle(Vector2(w / 2, 9), 3.5, Color("#f3ead6"))
			c.draw_arc(Vector2(w / 2, 9), 3.5, 0, TAU, 16, col, 1.0, true)
		if on and seal != "":
			# 右上小朱印（姓）
			var r := Rect2(w - 16, -6, 21, 21)
			c.draw_rect(r, red)
			c.draw_rect(r.grow(-2), Color("#f3d9c9"), false, 1.0)
			c.draw_string(UI.song_bold, Vector2(r.position.x + 3.5, r.position.y + 16), seal, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("#fbf0e2"))
		if badge != "":
			# 右下小朱印（出战“战”，11-09 队伍页底部出战条挪到这里）
			var r2 := Rect2(w - 17, h - 17, 19, 19)
			c.draw_rect(r2, red)
			c.draw_rect(r2.grow(-2), Color("#f3d9c9"), false, 1.0)
			c.draw_string(UI.song_bold, Vector2(r2.position.x + 2.5, r2.position.y + 15), badge, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("#fbf0e2")))
	return c

# ───────── 气血 / 内力条 vitals() ─────────
## 每条一行「标签 当前 / 上限」，下方 7px 圆角条：气血 #ad5042、内力 #4c768c
static func vitals(v: Dictionary, icons := false, fs := 14, with_exp := false) -> VBoxContainer:
	var box := vbox(6)
	box.custom_minimum_size.x = 10
	var rows := [["hp", "气血", v.hp, v.derived.mhp, Color("#ad5042")], ["mp", "内力", v.mp, v.derived.mmp, Color("#4c768c")]]
	if with_exp and int(v.level) < 100: rows.append(["exp", "修为", v.exp, v.expMax if v.expMax else 100, Color("#8d8a7c")])
	for row in rows:
		var line := hbox(6)
		if icons and row[0] != "exp": line.add_child(numeric(row[0], 23))
		line.add_child(expand(lab(row[1], fs)))
		line.add_child(lab("%d / %d" % [row[2], row[3]], fs - 1, INK, true))
		box.add_child(line)
		var bar := Control.new()
		bar.custom_minimum_size = Vector2(0, 7)
		bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var ratio := clampf(float(row[2]) / maxf(1, row[3]), 0, 1)
		var col: Color = row[4]
		bar.draw.connect(func():
			var r := Rect2(Vector2.ZERO, bar.size)
			bar.draw_style_box(sb(Color("#352f2522"), Color("#5b524b44"), [1, 1, 1, 1], 6), r)
			if ratio > 0: bar.draw_style_box(sb(col, Color(0, 0, 0, 0), [0, 0, 0, 0], 6), Rect2(r.position + Vector2(1, 1), Vector2((r.size.x - 2) * ratio, r.size.y - 2)))
			bar.draw_line(Vector2(3, r.size.y + 0.5), Vector2(r.size.x - 3, r.size.y + 0.5), Color(1, 1, 1, 0.53)))
		box.add_child(bar)
	return box

## 两列数据格 .qj-data-grid：格子 #eee7d4、间隔 1px 线 #a38e5833
static func data_grid(rows: Array, cols := 2) -> PanelContainer:
	var p := panel(Color("#a38e5833"), Color("#a38e5833"), [1, 1, 1, 1])
	var g := grid(cols, 1, 1)
	p.add_child(g)
	for row in rows:
		var cell := panel(Color("#eee7d4"), Color(0, 0, 0, 0), [0, 0, 0, 0], [12, 12, 12, 12])
		expand(cell)
		var h := hbox(8)
		cell.add_child(h)
		h.add_child(expand(lab(str(row[0]), 13)))
		var val := lab(str(row[1]), 13, INK, true)
		val.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		h.add_child(val)
		g.add_child(cell)
	return p
