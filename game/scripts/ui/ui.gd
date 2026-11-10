extends CanvasLayer
## 全局界面层（对应原版 index.html 的 #place #toast #prompt #fade #hud #tpad #loading 与 core.js 的 fade/placeName/toast）
## 界面按原版“游戏区宽 1280”基准排版：根节点 1280×720，缩放 0.75 铺满 960×540 视口（canvas_items 拉伸下文字仍按实际分辨率栅格化）。

const PAPER := Color("#e9dcc0")
const GOLD := Color("#e0bf78")
const HI := Color("#f3d58e")
const BZ := Color("#6e5a3e")
const BZ2 := Color("#a38a5e")
const RED := Color("#d9553a")
const DIM := Color("#9c8b70")

var serif: Font
var serif_bold: Font
var sans: Font
var sans_medium: Font
var sans_bold: Font
var brush: Font
var mashan: Font      # 马善政（战斗界面毛笔字，原版 bui.js FB）
var zhimang: Font     # 志莽行（原版 bui.js FC）
# 原版用到的苹果系统字体（不可随包分发）：本机装了就用系统字体，否则同原版在其他系统上的表现，回落宋体
var kai: Font         # "Kaiti SC","STKaiti","KaiTi"（培养模式、关系页、人物交互）
var kai_bold: Font
var song: Font        # 原版江湖菜单 #panel、人物交互、赠礼、偷窃层首选 "Songti SC"（没有时 Noto Serif SC）
var song_bold: Font
var weibei: Font      # "Weibei SC"（人物交互标题牌、印字），没有时按原版写法退到楷体再退到宋体

var root: Control
var _place: Control
var _place_label: Label
var _toast: Control
var _toast_label: Label
var _prompt: Control
var _prompt_label: Label
var _fade: ColorRect
var _warn: Label
var hud_node: Control
var tpad: Control
var _toasts: Array = []
var _place_serial := 0
var _toast_showing := false
var _panels: Array = []   # 打开中的面板（菜单、商店……）；非空时冻结探索

signal menu_requested

func _ready() -> void:
	layer = 20
	serif = load("res://fonts/NotoSerifSC-Medium.ttf")
	serif_bold = load("res://fonts/NotoSerifSC-Bold.ttf")
	sans = load("res://fonts/NotoSansSC-Regular.ttf")
	sans_medium = load("res://fonts/NotoSansSC-Medium.ttf")
	sans_bold = load("res://fonts/NotoSansSC-Bold.ttf")
	brush = load("res://fonts/ZCOOLXiaoWei-Regular.ttf")
	mashan = load("res://fonts/MaShanZheng-Regular.ttf")
	zhimang = load("res://fonts/ZhiMangXing-Regular.ttf")
	# 引擎的 SystemFont 只会取 .ttc 集合里的第一个字重（Songti.ttc 第一个是“黑”），所以按 PostScript 名取出浏览器会用的那个字重
	kai = _ttc_face("Kaiti SC", 400, "STKaitiSC-Regular", serif)
	kai_bold = _ttc_face("Kaiti SC", 700, "STKaitiSC-Bold", serif_bold)
	weibei = _sys_font(["Weibei SC", "Weibei TC"], 700, kai_bold)
	song = _ttc_face("Songti SC", 400, "STSongti-SC-Regular", serif)
	# 11-10 试玩审查：宋体常规体笔画细，十二三号字在深底上“一”这类单横笔淡得像缺字（“选 件送她”“键位 览”）；轻微加粗
	if song is FontFile:
		var sv := FontVariation.new(); sv.base_font = song; sv.variation_embolden = 0.35
		song = sv
	song_bold = _ttc_face("Songti SC", 700, "STSongti-SC-Bold", serif_bold)
	if song_bold is FontFile:   # 栏题朱印里的“一”同样发虚
		var bv := FontVariation.new(); bv.base_font = song_bold; bv.variation_embolden = 0.25
		song_bold = bv
	root = Control.new()
	root.size = Vector2(1280, 720); root.scale = Vector2(0.75, 0.75)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)
	_build_hud(); _build_place(); _build_prompt(); _build_toast(); _build_tpad(); _build_warn()
	_fade = ColorRect.new(); _fade.color = Color.BLACK; _fade.size = Vector2(1280, 720); _fade.modulate.a = 0
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	# 黑场在最上层（原版 z-index 9；载入层 10）
	var top := CanvasLayer.new(); top.layer = 90; add_child(top)
	var froot := Control.new(); froot.scale = Vector2(0.75, 0.75); froot.mouse_filter = Control.MOUSE_FILTER_IGNORE; top.add_child(froot)
	froot.add_child(_fade)

# ── 黑场：fade(fn)：变黑 460ms → fn → 60ms → 变亮 300ms（CSS transition .45s） ──
func fade(fn: Callable = Callable()) -> void:
	if G.mode == "scene": Audio.sfx("whoosh")
	var tw := create_tween(); tw.tween_property(_fade, "modulate:a", 1.0, 0.45)
	await get_tree().create_timer(0.46).timeout
	if fn.is_valid(): await fn.call()
	await get_tree().create_timer(0.06).timeout
	var tw2 := create_tween(); tw2.tween_property(_fade, "modulate:a", 0.0, 0.45)
	await get_tree().create_timer(0.3).timeout

func black(on: bool, secs := 0.45) -> void:
	var tw := create_tween(); tw.tween_property(_fade, "modulate:a", 1.0 if on else 0.0, secs)
	await tw.finished

# ── 地名：书法体 40px，上下各一道金线，淡入 .9s，2.2 秒后淡出 ──
func _build_place() -> void:
	_place = Control.new(); _place.mouse_filter = Control.MOUSE_FILTER_IGNORE; _place.modulate.a = 0
	root.add_child(_place)
	_place_label = Paint.label("", brush, 40, PAPER, 0.35, Color(0, 0, 0, 0.9), 6)
	_place.add_child(_place_label)
	_place.draw.connect(func():
		var w := 9 * 24.0
		var cx := 640.0
		var y0 := _place_label.position.y - 4; var y1 := _place_label.position.y + _place_label.size.y + 4
		Paint.fade_line(_place, cx - w / 2, cx + w / 2, y0, GOLD, 1, 0.5)
		Paint.fade_line(_place, cx - w / 2, cx + w / 2, y1, GOLD, 1, 0.5))

func place_name(t: String) -> void:
	_place_label.text = t
	_place_label.reset_size()
	# 去掉末尾字距造成的偏右
	var w := _place_label.get_minimum_size().x - 40 * 0.35
	_place_label.position = Vector2(640 - w / 2, 720 * 0.22 - _place_label.size.y / 2)
	_place.queue_redraw()
	_place_serial += 1
	var my := _place_serial
	var tw := create_tween(); tw.tween_property(_place, "modulate:a", 1.0, 0.9)
	await get_tree().create_timer(2.2).timeout
	if my != _place_serial: return   # 以最后一次调用为准
	var tw2 := create_tween(); tw2.tween_property(_place, "modulate:a", 0.0, 0.9)

# ── 提示条：顺序播放，不阻塞剧情 ──
func _build_toast() -> void:
	_toast = Control.new(); _toast.mouse_filter = Control.MOUSE_FILTER_IGNORE; _toast.modulate.a = 0
	root.add_child(_toast)
	_toast_label = Paint.label("", serif, 18, HI, 0.2)
	_toast.add_child(_toast_label)
	_toast.draw.connect(func():
		var r := Rect2(Vector2.ZERO, _toast.size)
		var bg := Color(16 / 255.0, 12 / 255.0, 9 / 255.0, 0.92)
		Paint.grad(_toast, r, [[0, Color(bg, 0)], [0.18, bg], [0.82, bg], [1, Color(bg, 0)]])
		Paint.fade_line(_toast, 0, r.size.x, 0, BZ2, 1, 0.5)
		Paint.fade_line(_toast, 0, r.size.x, r.size.y - 1, BZ2, 1, 0.5))

var toast_log: Array = []   # 测试用：弹过的提示原文（扫荡查“已接”有没有进行记，2026-11-09）
func toast(t, ms := 1400) -> void:
	Dialog.feedback += 1   # 测试用计数，见 dialog.gd
	toast_log.append(str(t)); if toast_log.size() > 50: toast_log.pop_front()
	if not str(t).begins_with("购得"): Audio.sfx("chime")
	_toasts.append([str(t), max(0, int(ms))])
	if not _toast_showing: _next_toast()

func _next_toast() -> void:
	if _toasts.is_empty():
		_toast_showing = false; return
	_toast_showing = true
	var e: Array = _toasts.pop_front()
	_toast_label.text = e[0]; _toast_label.reset_size()
	var pad := Vector2(2.4 * 18, 0.45 * 18)
	var lw := _toast_label.get_minimum_size()
	_toast.size = Vector2(lw.x + pad.x * 2, lw.y + pad.y * 2)
	_toast_label.position = pad
	var top: float = 720 * (0.032 if _panels.any(func(p): return p.get_meta("shop", false)) else 0.17)
	_toast.position = Vector2(640 - _toast.size.x / 2, top - 0.6 * 17)
	_toast.queue_redraw()
	var tw := create_tween().set_parallel()
	tw.tween_property(_toast, "modulate:a", 1.0, 0.35); tw.tween_property(_toast, "position:y", top, 0.35)
	await get_tree().create_timer(e[1] / 1000.0).timeout
	var tw2 := create_tween().set_parallel()
	tw2.tween_property(_toast, "modulate:a", 0.0, 0.35); tw2.tween_property(_toast, "position:y", top - 0.6 * 17, 0.35)
	await get_tree().create_timer(0.18).timeout
	_next_toast()

# ── 交互提示：底部居中描边框，“E 交谈 · 叶蘅” ──
func _build_prompt() -> void:
	_prompt = Control.new(); _prompt.mouse_filter = Control.MOUSE_FILTER_IGNORE; _prompt.visible = false
	root.add_child(_prompt)
	_prompt_label = Paint.label("", serif, 17, PAPER, 0.12)
	_prompt.add_child(_prompt_label)
	_prompt.draw.connect(func():
		Paint.frame(_prompt, Rect2(Vector2.ZERO, _prompt.size))
		if not touch_mode():
			var kb := Rect2(0.8 * 17, (_prompt.size.y - 21) / 2, 23, 21)
			_prompt.draw_rect(Rect2(kb.position + Vector2(0, 2), kb.size), Color(0, 0, 0, 0.53))
			_prompt.draw_rect(kb, Color("#2a2119"))
			_prompt.draw_rect(kb, BZ2, false, 1)
			_prompt.draw_string(sans_medium, kb.position + Vector2(6, 15), "E", HORIZONTAL_ALIGNMENT_LEFT, -1, 13, HI))

var _prompt_text := ""
func prompt_show(t: String) -> void:
	if Dialog.visible_now() or panel_open():
		prompt_hide(); return
	if _prompt.visible and _prompt_text == t: return
	_prompt_text = t
	_prompt_label.text = t; _prompt_label.reset_size()
	var kbw := 0.0 if touch_mode() else 23 + 0.55 * 17
	var lw := _prompt_label.get_minimum_size()
	_prompt.size = Vector2(0.8 * 17 + kbw + lw.x + 1.3 * 17, lw.y + 0.8 * 17)
	_prompt_label.position = Vector2(0.8 * 17 + kbw, 0.4 * 17)
	var y := 720 * 0.13 if touch_mode() else 720 * 0.95 - _prompt.size.y
	_prompt.position = Vector2(640 - _prompt.size.x / 2, y)
	_prompt.visible = true
	_prompt.queue_redraw()

func prompt_hide() -> void:
	_prompt.visible = false; _prompt_text = ""

# ── HUD（地名题签 + 江湖菜单按钮；细节由 hud.gd 补全） ──
func _build_hud() -> void:
	hud_node = load("res://scripts/ui/hud.gd").new()
	root.add_child(hud_node)

func hud() -> void:
	if hud_node: hud_node.refresh()

func toggle_menu() -> void:
	menu_requested.emit()
	var m = get_node_or_null("/root/Menu")   # 运行时查找：菜单模块编译失败时不连累核心
	if m == null: return
	if m.has_method("toggle"): m.toggle()
	elif m.has_method("open"): m.open()

# ── 面板（菜单、商店等）登记：打开时冻结探索 ──
func panel_open() -> bool:
	return not _panels.is_empty()

func push_panel(p: Node) -> void:
	if _panels.is_empty(): Audio.sfx("menu_open")
	_panels.append(p)
	prompt_hide()

func pop_panel(p: Node) -> void:
	var was := not _panels.is_empty()
	_panels.erase(p)
	if was and _panels.is_empty(): Audio.sfx("menu_close")

# ── 触屏方向键（原版 (pointer:coarse) 时显示） ──
func touch_mode() -> bool:
	return OS.has_feature("mobile") or OS.has_feature("web_android") or OS.has_feature("web_ios")

func _build_tpad() -> void:
	tpad = load("res://scripts/ui/tpad.gd").new()
	root.add_child(tpad)

func _build_warn() -> void:
	# 写档失败常驻提示（原版 #save-warning：暗红底、#e0a080 边、圆角 6、15px）
	_warn = Paint.label("", sans, 15, Color("#fbe9dc"))
	var sb := StyleBoxFlat.new(); sb.bg_color = Color(80 / 255.0, 24 / 255.0, 20 / 255.0, 0.94); sb.border_color = Color("#e0a080")
	sb.set_border_width_all(1); sb.set_corner_radius_all(6); sb.content_margin_left = 14; sb.content_margin_right = 14; sb.content_margin_top = 8; sb.content_margin_bottom = 8
	_warn.add_theme_stylebox_override("normal", sb)
	_warn.visible = false
	root.add_child(_warn)

func save_warning(t: String) -> void:
	_warn.visible = t != ""
	_warn.text = t
	_warn.reset_size()
	_warn.position = Vector2(640 - _warn.size.x / 2, 12)

func _process(_d: float) -> void:
	var dlg := Dialog.visible_now()
	if tpad: tpad.visible = touch_mode() and G.mode == "scene" and not dlg and not panel_open() and hud_node.visible
	if dlg and _prompt.visible: prompt_hide()


## 从系统字体集合里取一个字重（原版 CSS font-family 写的苹果字体，浏览器按字重选集合里的那一个）。
## 取出的单字重字体缓存到 user://fontcache/，下次直接载入；不打进安装包。Web 与没有该字体的系统用 fallback
func _ttc_face(family: String, weight: int, ps_name: String, fallback: Font) -> Font:
	if OS.has_feature("web"): return fallback
	var cache := "user://fontcache/%s.ttf" % ps_name
	if not FileAccess.file_exists(cache):
		var src := OS.get_system_font_path(family, weight)
		if src == "": return fallback
		var data := _ttc_extract(src, ps_name)
		if data.is_empty(): return fallback
		DirAccess.make_dir_recursive_absolute("user://fontcache")
		var w := FileAccess.open(cache, FileAccess.WRITE)
		if w == null: return fallback
		w.store_buffer(data); w.close()
	var f := FontFile.new()
	if f.load_dynamic_font(cache) != OK: return fallback
	# 11-10 试玩审查：宋体小字号的“一”只有一根细横笔，轻度微调会把它摊到两行像素上，淡得像缺字；改完整微调让横笔对齐整像素
	f.hinting = TextServer.HINTING_NORMAL
	f.fallbacks = [fallback]
	return f

## 按 PostScript 名（name 表 6 号）在 .ttc/.otf 里找到那个字重，重排表目录拼成独立字体文件
static func _ttc_extract(path: String, ps_name: String) -> PackedByteArray:
	var fa := FileAccess.open(path, FileAccess.READ)
	if fa == null: return PackedByteArray()
	fa.big_endian = true
	var dirs := [0]
	if fa.get_buffer(4).get_string_from_ascii() == "ttcf":
		fa.get_32()
		var n := fa.get_32()
		dirs = []
		for i in n: dirs.append(fa.get_32())
	for off in dirs:
		fa.seek(off + 4)
		var nt := fa.get_16()
		var recs := []
		for k in nt:
			fa.seek(off + 12 + 16 * k)
			recs.append({"tag": fa.get_buffer(4), "cs": fa.get_32(), "off": fa.get_32(), "len": fa.get_32()})
		var name_rec = null
		for r in recs:
			if r.tag.get_string_from_ascii() == "name": name_rec = r
		if name_rec == null or _ps_name(fa, name_rec.off) != ps_name: continue
		var out := StreamPeerBuffer.new(); out.big_endian = true
		fa.seek(off); out.put_data(fa.get_buffer(12))
		var pos := 12 + 16 * nt
		for r in recs:
			out.put_data(r.tag); out.put_u32(r.cs); out.put_u32(pos); out.put_u32(r.len)
			pos += (r.len + 3) & ~3
		for r in recs:
			fa.seek(r.off); out.put_data(fa.get_buffer(r.len))
			for _p in ((r.len + 3) & ~3) - r.len: out.put_u8(0)
		return out.data_array
	return PackedByteArray()

static func _ps_name(fa: FileAccess, off: int) -> String:
	fa.seek(off + 2)
	var count := fa.get_16(); var str_off := fa.get_16()
	for i in count:
		fa.seek(off + 6 + 12 * i)
		var plat := fa.get_16(); fa.get_16(); fa.get_16()
		var id := fa.get_16(); var ln := fa.get_16(); var so := fa.get_16()
		if id != 6: continue
		fa.seek(off + str_off + so)
		var b := fa.get_buffer(ln)
		if plat == 3 or plat == 0:
			var s := ""
			for j in range(0, ln - 1, 2): s += char((b[j] << 8) | b[j + 1])
			return s
		return b.get_string_from_ascii()
	return ""

## 系统字体：按名字找，找到就用（缺字时退到项目内宋体）；一个都没有（Web、非苹果系统）就直接用 fallback
func _sys_font(names: Array, weight: int, fallback: Font) -> Font:
	if OS.has_feature("web"): return fallback
	for n in names:
		if OS.get_system_font_path(n, weight) != "":
			var f := SystemFont.new()
			f.font_names = PackedStringArray(names)
			f.font_weight = weight
			f.fallbacks = [fallback]
			return f
	return fallback
