class_name CuHub
extends RefCounted
## 培养主界面各部件（原版 js/qh-mode-cultivation.js 的 render 模板、footer、board、panel、story 等，
## 样式照 qh-mode-cultivation.css；数值见 docs/specs/cultivation/03-主界面布局.md）。
## 所有函数往 root（1920×1080）里加节点；按钮命令统一走 Cultivation.on_cu(data-cu, data-id)。

const MONTHS := ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]
const YEARS := ["一", "二", "三"]
const SEASONS := ["spring", "summer", "autumn", "winter"]
## 原版 names 短名表（qh-mode-cultivation.js 第 10 行）
const NAMES := {"B03": "站桩", "B02": "步法", "B01": "吐纳", "B04": "协调", "B05": "听声", "B06": "察势", "P01": "照料药圃", "P02": "制干粮", "P03": "缝布包", "A01": "武学复盘", "A02": "医案记录", "A03": "辨药", "A04": "行路常识", "A05": "炊事", "A06": "缝补", "D01": "挑水", "D02": "扫院", "D03": "整理晾架", "D04": "磨墨", "D05": "补竹篓", "C01": "送信", "C02": "送物", "W01": "院内", "W02": "药签", "W03": "来信", "W04": "溪畔", "W05": "承诺", "W06": "复盘", "W07": "出行", "visitor_songfeng_route": "路况", "visitor_whiteheron_records": "交接", "visitor_zhaochuan_greeting": "来帖", "gy_ledger": "对账", "gy_goose_steps": "追鹅", "gy_ye_mother": "旧伤", "gy_dou_runaway": "山口", "gy_shimu_birthday": "生辰"}

static func D() -> Dictionary: return CuCore.D()
static func name_of(a: Dictionary) -> String: return NAMES.get(a.id, a.get("name", ""))
static func season(s: Dictionary) -> String: return SEASONS[floori(((int(s.month) - 1) % 12) / 3.0)]
## 原版 date(s)
static func date(s: Dictionary) -> String:
	return "第%s年%d月%s" % [YEARS[floori((int(s.month) - 1) / 12.0)], (int(s.month) - 1) % 12 + 1, D().phases[int(s.phase)]]
## 原版 nextDate(s)
static func next_date(s: Dictionary) -> String:
	if s.month == 36 and s.phase == 4: return "三年修习收束"
	return date({"month": s.month + 1 if s.phase == 4 else s.month, "phase": 0 if s.phase == 4 else s.phase + 1})
## 原版 categoryFee(cat)
static func category_fee(cat: Dictionary) -> String:
	var lo := 999; var hi := -1
	for a in D().actions:
		if a.category != cat.id: continue
		var c := int(CuCore.actionCost(a))
		lo = min(lo, c); hi = max(hi, c)
	return "体力 %d" % lo if lo == hi else "体力 %d–%d" % [lo, hi]
static func unread(s: Dictionary) -> int:
	var n := 0
	for l in s.letters:
		if not str(l.id).begins_with("notice-") and not l.get("read") and int(l.due) <= CuCore.period(s): n += 1
	return n

## 背景 + 顶栏 + 心情 + 设置 + 底栏（原版 render 里 root.innerHTML 那一段）
static func base(root: Control, s: Dictionary, mandatory: bool, locked: bool, mail_active: bool) -> Dictionary:
	var out := {}
	var bg := CuUI.img("assets/production/cultivation/bg_mountain_%s_v1.png" % season(s), TextureRect.STRETCH_KEEP_ASPECT_COVERED)
	CuUI.fill(bg)
	bg.name = "cu-background"
	if mail_active: bg.modulate = Color(0.55, 0.55, 0.55)   # 原版 saturate(.55) brightness(.55) 近似
	root.add_child(bg)
	out.bg = bg
	if mail_active: return out   # 邮箱打开时隐藏日期/体力/心情/设置/底栏
	# 日期牌 .cu-calendar：left -3.7cqw top .2cqw 14cqw 方
	var cal := CuUI.ornament(0)
	CuUI.place(cal, CuUI.cq(-3.7), CuUI.cq(0.2), CuUI.cq(14), CuUI.cq(14))
	root.add_child(cal)
	# .cu-calendar-copy：inset 23% 41% 26%，flex row-reverse 居中，gap .16em，700 .95cqw/1.12；span 竖排 letter-spacing .05em
	var cs := int(round(CuUI.cq(0.95)))
	var col1 := CuUI.vlabel("第%s年" % YEARS[floori((int(s.month) - 1) / 12.0)], cs, Color("#362b1c"), true, 0.05)
	var ph: String = "初" if s.phase == 0 else ("底" if s.phase == 4 else D().phases[int(s.phase)])
	var col2 := CuUI.vlabel("%s月%s" % [MONTHS[(int(s.month) - 1) % 12], ph], cs, Color("#362b1c"), true, 0.05)
	# 竖排列宽 = line-height 1.12em；两列加间隙在 18% 宽的框里水平居中，第一年在右
	var cw := CuUI.cq(0.95) * 1.12
	var gap := CuUI.cq(0.95) * 0.16
	var x0 := CuUI.cq(14) * 0.41 + (CuUI.cq(14) * 0.18 - cw * 2 - gap) / 2
	CuUI.place(col2, x0, CuUI.cq(14) * 0.23, cw, CuUI.cq(14) * 0.51)
	CuUI.place(col1, x0 + cw + gap, CuUI.cq(14) * 0.23, cw, CuUI.cq(14) * 0.51)
	for l in [col1, col2]: cal.add_child(l)
	# 体力葫芦 .cu-energy：left 5.4cqw top 3.1cqw 6.5cqw 方
	var en := CuUI.ornament(1)
	CuUI.place(en, CuUI.cq(5.4), CuUI.cq(3.1), CuUI.cq(6.5), CuUI.cq(6.5))
	root.add_child(en)
	var num := CuUI.lbl(str(s.energy), int(round(CuUI.cq(1.5))), Color("#362b1c"), true, HORIZONTAL_ALIGNMENT_CENTER)
	num.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	CuUI.place(num, en.size.x * 0.47 - 40, en.size.y * 0.66 - 24, 80, 48)
	en.add_child(num)
	# .cu-energy-label：left 6% top 90% 82%×28%；花饰 --cu-art-size 100% → 宽×宽的正方形居中（溢出框外，实测 74,92 68×68）
	var tag := CuUI.orn_box(7, en.size.x * 0.82, en.size.y * 0.28)
	tag.position = Vector2(en.size.x * 0.06, en.size.y * 0.9)
	en.add_child(tag)
	var tl := CuUI.lbl("体力", int(round(CuUI.cq(0.65))), Color("#fff1ce"), true, HORIZONTAL_ALIGNMENT_CENTER)
	tl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	tl.add_theme_color_override("font_shadow_color", Color("#21150a")); tl.add_theme_constant_override("shadow_offset_y", 1)
	# inset 0 + padding-top .14cqw，grid 居中
	CuUI.place(tl, 0, CuUI.cq(0.14), tag.size.x, tag.size.y - CuUI.cq(0.14)); tag.add_child(tl)
	_mood(root, s, mandatory)
	# 设置钮：right .5% top .4% 宽 max(44px,4.3%)
	var sw: float = max(44.0, CuUI.W * 0.043)
	var sb := CuUI.hot("settings")
	CuUI.place(sb, CuUI.W * 0.995 - sw, CuUI.H * 0.004, sw, sw)
	sb.disabled = mandatory
	sb.tooltip_text = "养成设置"
	var so := CuUI.ornament(6)
	CuUI.place(so, (sw - CuUI.cq(3.6)) / 2, (sw - CuUI.cq(3.6)) / 2, CuUI.cq(3.6), CuUI.cq(3.6))
	sb.add_child(so)
	root.add_child(sb)
	out.settings = sb
	out.bottom = _bottom(root, s, locked)
	return out

## 右上心情头像 .cu-mood（cu-mood-v2）：right 4.3% top .4cqw 10cqw 方，--ring 6.6cqw
static func _mood(root: Control, s: Dictionary, mandatory: bool) -> void:
	var info: Dictionary = CuCore.moodState(s)
	var mood: String = "calm" if info.id == "comfortable" else info.id
	var sz := CuUI.cq(10)
	var ring := CuUI.cq(6.6)
	var m := Control.new()
	m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.place(m, CuUI.W * (1 - 0.043) - sz, CuUI.cq(0.4), sz, sz)
	root.add_child(m)
	# 名牌 .cu-mood-name：left -57% top 44% w69% h29%，在下层；花饰为宽×宽正方形居中（实测 1024,36 88×88）
	var nm := CuUI.orn_box(7, sz * 0.69, sz * 0.29)
	nm.position = Vector2(sz * -0.57, sz * 0.44)
	m.add_child(nm)
	var nl := CuUI.lbl("萧白", int(round(CuUI.cq(0.86))), Color("#fff1ce"), true, HORIZONTAL_ALIGNMENT_CENTER)
	nl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	nl.add_theme_color_override("font_shadow_color", Color("#21150a")); nl.add_theme_constant_override("shadow_offset_y", 1)
	# .cu-mood-name>span：inset 0，padding .18cqw 6% 0 0，grid 居中
	CuUI.place(nl, 0, CuUI.cq(0.18), nm.size.x * 0.94, nm.size.y - CuUI.cq(0.18)); nm.add_child(nl)
	# 圆环
	var c := Vector2(sz * 0.5, sz * 0.52)
	var rg := Control.new()
	rg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.fill(rg)
	rg.draw.connect(func():
		rg.draw_circle(c + Vector2(0, CuUI.cq(0.2)), ring / 2 + CuUI.cq(0.3), Color("#1c120a55"))
		rg.draw_circle(c, ring / 2 + CuUI.cq(0.26), Color("#7a5a2e66"))
		rg.draw_circle(c, ring / 2 + CuUI.cq(0.14), Color("#e3c98acc"))
		rg.draw_circle(c, ring / 2, Color("#2a1d1299"))
		rg.draw_circle(c, ring * 0.35, Color("#3a2a1a8c")))
	m.add_child(rg)
	# 头像与特效：宽高 ring×1.32，translate(-50%,-60.6%)；遮罩：上 60.6% 全显示，下部只露圆内（着色器 cult_mood_mask）
	var fs := ring * 1.32
	var face := Control.new()
	face.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.place(face, c.x - fs / 2, c.y - fs * 0.606, fs, fs)
	face.pivot_offset = Vector2(fs * 0.5, fs * 0.78)
	m.add_child(face)
	var mat := ShaderMaterial.new()
	mat.shader = load("res://shaders/cult_mood_mask.gdshader")
	mat.set_shader_parameter("radius", (ring * 0.49) / fs)
	for k in ["", "_fx"]:
		var im := CuUI.img("assets/production/cultivation/mood-avatars-v1/%s%s.png" % [mood, k], TextureRect.STRETCH_SCALE)
		CuUI.fill(im)
		im.material = mat
		im.pivot_offset = Vector2(fs * 0.5, fs * 0.78)
		face.add_child(im)
		_mood_loop(im, mood, k == "_fx")
	# 心情签 .cu-mood-tag：left -13.5% top 84% 5.5cqw 方，ornament(4)，竖排心情名
	var tg := CuUI.ornament(4)
	CuUI.place(tg, sz * -0.135, sz * 0.84, CuUI.cq(5.5), CuUI.cq(5.5))
	m.add_child(tg)
	# .cu-mood-copy：inset 21% 41% 37% 40%，grid 居中；span 竖排 500 .76cqw/1.05，letter-spacing .05em
	var tx := CuUI.vlabel(str(info.name), int(round(CuUI.cq(0.76))), Color("#44301b"), false, 0.05)
	var tw := CuUI.cq(0.76) * 1.05
	CuUI.place(tx, tg.size.x * (0.40 + 0.19 / 2) - tw / 2, tg.size.y * 0.21, tw, tg.size.y * 0.42)
	tg.add_child(tx)
	# 透明按钮盖在圆环上 → 江湖页
	var b := CuUI.hot("jianghu")
	CuUI.place(b, c.x - ring / 2, c.y - ring / 2, ring, ring)
	b.disabled = mandatory
	b.tooltip_text = "心情：%s（学习效率 %s）" % [info.name, str(CuBalance.efficiency(s))]
	m.add_child(b)

## 心情循环动画（原版 cuMoodLaugh/Breathe/Droop/Fume 与特效 Twinkle/Drift）
static func _mood_loop(n: Control, mood: String, fx: bool) -> void:
	var tw := n.create_tween().set_loops()
	var h := n.size.y if n.size.y > 0 else 160.0
	var go := func(p0: Vector2, r0: float, s0: Vector2, p1: Vector2, r1: float, s1: Vector2, d: float, trans := Tween.TRANS_SINE):
		n.position = p0; n.rotation_degrees = r0; n.scale = s0
		tw.tween_property(n, "position", p1, d).set_trans(trans).set_ease(Tween.EASE_IN_OUT)
		tw.parallel().tween_property(n, "rotation_degrees", r1, d).set_trans(trans).set_ease(Tween.EASE_IN_OUT)
		tw.parallel().tween_property(n, "scale", s1, d).set_trans(trans).set_ease(Tween.EASE_IN_OUT)
		tw.tween_property(n, "position", p0, d).set_trans(trans).set_ease(Tween.EASE_IN_OUT)
		tw.parallel().tween_property(n, "rotation_degrees", r0, d).set_trans(trans).set_ease(Tween.EASE_IN_OUT)
		tw.parallel().tween_property(n, "scale", s0, d).set_trans(trans).set_ease(Tween.EASE_IN_OUT)
	var y := func(p: float) -> Vector2: return Vector2(0, h * p / 100.0)
	match mood:
		"happy":
			if fx: go.call(Vector2.ZERO, -8, Vector2.ONE * 0.82, Vector2.ZERO, 8, Vector2.ONE * 1.12, 0.9)
			else: go.call(y.call(1.2), -2.4, Vector2.ONE, y.call(-1.6), 2.4, Vector2.ONE, 0.62)
		"calm":
			if fx: n.visible = false; tw.kill(); return
			go.call(y.call(0.5), 0, Vector2.ONE * 0.992, y.call(-0.7), 0, Vector2.ONE * 1.008, 3.4)
		"low":
			if fx: go.call(Vector2(-h * 0.015, h * 0.005), 0, Vector2.ONE, Vector2(h * 0.02, -h * 0.008), 0, Vector2.ONE, 3.0)
			else: go.call(y.call(-0.4), 0.6, Vector2.ONE, y.call(2.2), -2.2, Vector2.ONE, 4.2)
		"annoyed":
			# cuMoodFume 1.5s linear：0/55/100% 原位，60% (-1.3%,.3%) rot -1.2°，66% (1.3%,-.2%) rot 1.2°（特效反向）
			var sg := -1.0 if fx else 1.0
			n.position = Vector2.ZERO
			tw.tween_interval(0.825)
			tw.tween_property(n, "position", Vector2(-h * 0.013 * sg, h * 0.003), 0.075)
			tw.parallel().tween_property(n, "rotation_degrees", -1.2 * sg, 0.075)
			tw.tween_property(n, "position", Vector2(h * 0.013 * sg, -h * 0.002), 0.09)
			tw.parallel().tween_property(n, "rotation_degrees", 1.2 * sg, 0.09)
			tw.tween_property(n, "position", Vector2.ZERO, 0.51)
			tw.parallel().tween_property(n, "rotation_degrees", 0.0, 0.51)
		_:
			tw.kill()

## 底栏 .cu-bottom（卷轴）：bottom 0 高 17%，padding 1% 7% .8%，背景 dock_scroll_v2 上下外扩 33%
static func _bottom(root: Control, s: Dictionary, locked: bool) -> Dictionary:
	var bh := CuUI.H * 0.17
	var bot := Control.new()
	bot.name = "cu-bottom"
	bot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.place(bot, 0, CuUI.H - bh, CuUI.W, bh)
	root.add_child(bot)
	var scroll := CuUI.img("assets/production/cultivation/ui/dock_scroll_v2.png", TextureRect.STRETCH_SCALE)
	CuUI.place(scroll, 0, -bh * 0.33, CuUI.W, bh * 1.66)
	bot.add_child(scroll)
	var inner := Control.new()
	inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.place(inner, CuUI.W * 0.07, CuUI.W * 0.01, CuUI.W * 0.86, bh - CuUI.W * 0.018)
	bot.add_child(inner)
	var nav := HBoxContainer.new()
	nav.add_theme_constant_override("separation", int(round(inner.size.x * 0.015)))
	CuUI.fill(nav)
	inner.add_child(nav)
	var cats: Array = D().categories
	var n_unread := unread(s)
	for i in cats.size() + 1:
		var rest := i == cats.size()
		var cat: Dictionary = {} if rest else cats[i]
		var b := CuUI.hot("rest" if rest else "category", "" if rest else cat.id)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.disabled = locked
		b.tooltip_text = "休息，结束本期" if rest else ("邮箱" if cat.id == "mail" else cat.name) + "，" + category_fee(cat)
		nav.add_child(b)
		var ic := CuUI.icon(i)
		b.add_child(ic)
		var label: String = "休息" if rest else (("邮箱" + (" · %d" % n_unread if n_unread else "")) if cat.id == "mail" else cat.name)
		b.resized.connect(func():
			var s6 := CuUI.cq(6.2)
			CuUI.place(ic, b.size.x * 0.2, (b.size.y - s6) / 2, s6, s6))
		b.add_child(ink_label(label, b))
		if locked: b.modulate.a = 0.48
	return {"node": bot, "nav": nav, "inner": inner}

## 墨签 .cu-ink-label：竖排，#211c16 底 #fff2d6 字 1.05cqw/1.12。
## 原版启用 rig-trial-v1（data-cultivation-motion）时：top 50% translateY(-50%)，高度随字，padding .3em .18em，letter-spacing .06em
## （实测 cult-hub.json：三字 20×51、两字 20×37）；未启用时 top 12% 高 76%，padding .35em .22em，letter-spacing .08em。
static func ink_label(text: String, host: Control) -> Control:
	var em := CuUI.cq(1.3)   # 11-10 第四十九轮：竖排小字太小太淡，放大一档
	var fs := int(round(em))
	var rig := preload("res://scripts/npc/util.gd").t(CuDB.t("CultivationRigTrial").get("enabled", true))
	var pad_y := em * (0.3 if rig else 0.35)
	var pad_x := em * (0.18 if rig else 0.22)
	var ls := 0.06 if rig else 0.08
	var p := CuUI.panel_box(CuUI.box(Color("#211c16"), Color(0, 0, 0, 0), 0, 0, 0))
	var sb: StyleBoxFlat = p.get_theme_stylebox("panel")
	sb.content_margin_left = pad_x; sb.content_margin_right = pad_x; sb.content_margin_top = pad_y; sb.content_margin_bottom = pad_y
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var chars := text.replace(" · ", "·")
	var l := CuUI.vlabel(chars, fs, Color("#fff2d6"), false, ls)
	# 竖排列宽 = line-height 1.12em；每字前进 1em + letter-spacing
	var col_w := em * 1.12
	var nat_h := chars.length() * em * (1.0 + ls)
	l.custom_minimum_size = Vector2(col_w, nat_h)
	var tb := CuTextBox.wrap(l, em * (1.0 + ls))
	tb.custom_minimum_size = Vector2(col_w, nat_h)
	p.add_child(tb)
	var w := col_w + pad_x * 2
	var lay := func():
		if rig:
			var hh := nat_h + pad_y * 2
			p.position = Vector2(0, (host.size.y - hh) / 2)
			p.size = Vector2(w, hh)
		else:
			p.position = Vector2(0, host.size.y * 0.12)
			p.size = Vector2(w, host.size.y * 0.76)
	host.resized.connect(lay)
	p.ready.connect(lay)
	return p

## 子页每格宽（占底栏内框宽的比例）。11-10 第四十九轮：0.076 太挤、右半空着，放宽
const CELL_W := 0.105

## 灰项原因的短句：取第一个分句（到“；，。”为止），给卡片底下那一行用
static func short_reason(r: String) -> String:
	var cut := r.length()
	for ch in ["；", "，", "。", ";"]:
		var i := r.find(ch)
		if i > 0 and i < cut: cut = i
	var head := r.substr(0, cut)
	# 11-10 试玩审查：“陆衡尚未到谷”看不出什么时候能做；后半句写了时候（“来访窗口为二月下旬”）就带上
	var rest := r.substr(cut + 1)
	var re := RegEx.create_from_string("([正一二三四五六七八九十腊冬]+月[上中下]旬|[正一二三四五六七八九十腊冬]+月)")
	var m := re.search(rest)
	if m: head += "\n%s起" % m.get_string(1)
	return head

## 卡片缩略图 thumbnail(a)：icon → storyPortrait → 动作画布
static func thumbnail(a: Dictionary) -> Control:
	if a.get("icon"):
		var im := CuUI.img(a.icon, TextureRect.STRETCH_KEEP_ASPECT_COVERED)
		im.material = _round_mask()
		return im
	if a.get("storyPortrait"): return CuUI.img(a.storyPortrait)
	var c := CuClip.new().setup(str(a.get("artAlias", a.id)))
	if c.has_art(): return c
	var atl: Dictionary = CuDB.t("CultivationPresentation").atlas
	if atl.has(a.id): return CuUI.atlas_img(atl[a.id].file, atl[a.id].rect)
	return c

static var _rmask: ShaderMaterial
static func _round_mask() -> ShaderMaterial:
	if _rmask == null:
		_rmask = ShaderMaterial.new()
		_rmask.shader = load("res://shaders/cult_place_icon.gdshader")
	return _rmask

## 原版 footer(title, actions, locked)：隐藏栏目，换成子菜单 .cu-submenu
static func footer(h: Node, ui: Dictionary, actions: Array, locked := false) -> HBoxContainer:
	var s: Dictionary = h.state()
	var bot: Dictionary = ui.bottom
	bot.nav.visible = false
	var sc := ScrollContainer.new()
	sc.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	CuUI.fill(sc)
	bot.inner.add_child(sc)
	var row := HBoxContainer.new()
	var iw: float = bot.inner.size.x
	var ih: float = bot.inner.size.y
	row.add_theme_constant_override("separation", int(iw * 0.006))
	row.custom_minimum_size = Vector2(0, ih)
	sc.add_child(row)
	# 返回 .cu-back：mail-v7/return.png，宽 10.3%
	var back := CuUI.hot("close")
	back.custom_minimum_size = Vector2(iw * 0.103, ih)
	back.disabled = locked
	back.tooltip_text = "返回谷中"
	var ri := CuUI.img("assets/production/cultivation/mail-v7/return.png")
	CuUI.place(ri, iw * 0.103 * 0.2, (ih - CuUI.cq(6.2)) / 2, CuUI.cq(6.2), CuUI.cq(6.2))
	back.add_child(ri)
	back.add_child(ink_label("返回", back))
	row.add_child(back)
	if locked: back.modulate.a = 0.48
	for a in actions:
		var review: bool = a.id == "W04" and h.walk_reviewed()
		var reason: String = "" if review or a.get("mail") else h.why(a)
		var cost: int = 0 if review else int(CuCore.actionCost(a))
		var hint: String
		if review: hint = "本期观察已记录 · 免费查看"
		elif reason != "": hint = reason
		elif a.get("strollPlace"): hint = str(a.get("task", ""))
		else: hint = name_of(a) + (" · 体力 %d" % cost if cost else "") + h.training_hint(a)
		var dot: bool = a.get("strollPlace") and reason == "" and CuCore.strollPool(s, a.place).size() > 0
		var cmd := "walk-review" if review else ("mail-select" if a.get("mail") else "practice")
		var b := CuUI.hot(cmd, a.id)
		b.custom_minimum_size = Vector2(iw * CELL_W, ih)
		b.disabled = locked
		b.tooltip_text = name_of(a) + "\n" + hint
		var pic: Control
		if a.id == "C01": pic = CuUI.icon(5)
		elif a.id == "C02": pic = CuUI.img("assets/production/cultivation/mail-v7/pouch.png")
		else: pic = thumbnail(a)
		var ps := ih * 0.62
		CuUI.place(pic, (iw * CELL_W - ps) / 2, ih * 0.1, ps, ps)
		if reason != "": pic.modulate = Color(0.6, 0.6, 0.6, 0.5)
		b.add_child(pic)
		var nm := CuUI.lbl(name_of(a), int(CuUI.cq(0.95)), Color("#3b2a17"), true, HORIZONTAL_ALIGNMENT_CENTER)
		nm.add_theme_color_override("font_outline_color", Color("#f4e8cc")); nm.add_theme_constant_override("outline_size", 6)
		nm.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
		CuUI.place(nm, 0, ih * 0.64, iw * CELL_W, CuUI.cq(1.4))
		if reason != "": nm.modulate.a = 0.6
		b.add_child(nm)
		if reason != "":
			# 11-09 第四十八轮：灰掉的项只在悬停里有原因，看不出为什么点不了；卡片下面直接写一句短的（全文仍在悬停里）
			var why := CuUI.lbl(short_reason(reason), int(CuUI.cq(0.8)), Color("#fff2d6"), true, HORIZONTAL_ALIGNMENT_CENTER)
			why.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY; why.max_lines_visible = 2
			var wb := CuUI.panel_box(CuUI.box(Color("#5a2a1ee6"), Color(0, 0, 0, 0), 0, 3, 2))
			wb.add_child(why)
			wb.custom_minimum_size.x = iw * CELL_W * 0.9
			CuUI.place(wb, iw * CELL_W * 0.05, ih * 0.16, iw * CELL_W * 0.9, 0)   # 压在图标上，两行也不盖住下面的名字
			b.add_child(wb)
		if cost and not review and reason == "":   # 灰项只写原因，不再叠体力角标
			var cb := CuUI.panel_box(CuUI.box(Color("#3b2a17d9"), Color(0, 0, 0, 0), 0, int(CuUI.cq(0.78) * 0.7), 2))
			# 11-10 第四十九轮：角标原来只写个数字，看不出是什么；写明“体力 3”
			var cl := CuUI.lbl("体力 %d" % cost, int(CuUI.cq(0.72)), Color("#fff2d6"), true, HORIZONTAL_ALIGNMENT_CENTER)
			cl.custom_minimum_size = Vector2(CuUI.cq(0.72) * 3.4, 0)
			cb.add_child(cl)
			cb.position = Vector2(iw * CELL_W * 0.5 + ps * 0.12, ih * 0.1 + ps * 0.62)   # 压在图标右下角
			b.add_child(cb)
		if dot:
			var d := Control.new()
			var r: float = max(6.0, CuUI.cq(0.62)) / 2
			d.mouse_filter = Control.MOUSE_FILTER_IGNORE
			d.draw.connect(func(): d.draw_circle(Vector2(r, r), r + 1.5, Color("#f6ecd3")); d.draw_circle(Vector2(r, r), r, Color("#c8371f")))
			d.position = Vector2(iw * CELL_W * 0.76 - r * 2, ih * 0.17)
			b.add_child(d)
		if s.get("pending") and s.pending.get("action") == a.id or (s.selection.get("action") == a.id and h.view == "picker"):
			_underline(b)
		if locked: b.modulate.a = 0.48
		b.mouse_entered.connect(func(): if not b.disabled: _underline(b))
		row.add_child(b)
	return row

static func _underline(b: Control) -> void:
	if b.has_node("u"): return
	var u := ColorRect.new()
	u.name = "u"
	u.color = Color("#b55032")
	u.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(u)
	var f := func(): CuUI.place(u, b.size.x * 0.06, b.size.y * 0.87 - 2, b.size.x * 0.88, 2)
	f.call()
	b.resized.connect(f)

## 原版 board({guidance,teacher,action,playing,story})：.cu-training-frame（木框 + 六帧动作）
static func board(h: Node, o: Dictionary) -> Control:
	var s: Dictionary = h.state()
	var guidance: bool = o.get("guidance", false)
	var a = o.get("action")
	var story: bool = o.get("story", false)
	var el := Control.new()
	el.name = "cu-training-frame"
	el.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if story: CuUI.place(el, CuUI.W * 0.29, CuUI.H * 0.14, CuUI.W * 0.40, CuUI.H * 0.48)
	else: CuUI.place(el, CuUI.W * 0.337, CuUI.H * 0.187, CuUI.W * 0.326, CuUI.H * 0.492)
	h.root.add_child(el)
	if a is Dictionary and a.id == "QH01":
		var im := CuUI.img(a.storyPortrait)
		CuUI.fill(im); el.add_child(im)
		return el
	var clip_id: String
	if a is Dictionary and a.get("artAlias"): clip_id = a.artAlias
	elif guidance: clip_id = (a.get("artAlias", a.id) if a is Dictionary and a.get("once") else ("G02" if o.get("teacher") == "叶蘅" else "G01"))
	elif a is Dictionary: clip_id = a.id
	else: clip_id = "B01"
	var bgc := ColorRect.new(); bgc.color = Color("#eadbb8"); CuUI.fill(bgc); bgc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	el.add_child(bgc)
	var fr: Dictionary = CuDB.t("CultivationPresentation").atlas.frame
	var frame := CuUI.atlas_img(fr.file, fr.rect)
	frame.stretch_mode = TextureRect.STRETCH_SCALE
	CuUI.fill(frame); el.add_child(frame)
	var ill := CuClip.new().setup(clip_id)
	# .cu-illustration 居中 56.25%×66.18%；rig-trial 的 G01/G02/D01 改为 inset 6%
	if clip_id in ["G01", "G02", "D01"]: CuUI.place(ill, el.size.x * 0.06, el.size.y * 0.06, el.size.x * 0.88, el.size.y * 0.88)
	else: CuUI.place(ill, el.size.x * (1 - 0.5625) / 2, el.size.y * (1 - 0.6618) / 2, el.size.x * 0.5625, el.size.y * 0.6618)
	var p = s.get("pending")
	ill.finished = p is Dictionary and p.get("animation") is Dictionary and p.animation.done
	ill.playing = o.get("playing", false) or story
	if o.get("playing") and p.animation.get("presented"): ill.started_at = Time.get_ticks_msec() - int(CuDB.now_ms() - float(p.animation.startedAt))
	el.add_child(ill)
	el.set_meta("clip", ill)
	return el

## 原版 panel(title, body, close)：.cu-overlay（left/right 27% top 25% bottom 27%，#f0e1be，6px ridge #96703d）
## body 为节点数组（Label/Button/HBox…）；返回 {el, body}
## 原版 .cu-overlay：left/right 27% top 25% bottom 27%，padding 1.5%，#f0e1be 底，6px ridge #96703d，阴影 0 4px 10px #201a1366；
## header：flex 两端对齐、align-items center、gap 1em，padding-bottom .5em + 1px #bda577 底线；h2 clamp(16px,1.7cqw,32px)/1.45；
## .cu-panel-body：padding-top .6em，column、align-items flex-start、gap .7em（em 取 #cultivation 字号 clamp(14px,1.35cqw,26px)）。
## 实测 cult-entry.json：框 346,180 589×346；标题 371,205；首段 371,257；按钮 371,356 170×44（左对齐、按字宽）。
static func panel(h: Node, title: String, body: Array, close := true, rect := [27.0, 25.0, 27.0, 27.0], fit := false) -> Dictionary:
	var el := Control.new()
	el.name = "cu-overlay"
	el.set_meta("dialog", true)
	CuUI.fill(el)
	h.root.add_child(el)
	var bw0 := 6 * CuUI.PX
	var sb := CuUI.box(Color("#f0e1be"), Color("#96703d"), int(bw0), 0, bw0 + CuUI.W * 0.015)
	sb.shadow_color = Color("#201a1366"); sb.shadow_size = int(10 * CuUI.PX); sb.shadow_offset = Vector2(0, 4 * CuUI.PX)
	var box := CuUI.panel_box(sb)
	CuUI.place(box, CuUI.W * rect[0] / 100, CuUI.H * rect[1] / 100, CuUI.W * (1 - (rect[0] + rect[2]) / 100), CuUI.H * (1 - (rect[1] + rect[3]) / 100))
	el.add_child(box)
	var em := float(CuUI.fs(14, 1.35, 26))
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 0)
	box.add_child(col)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", int(em))
	var tfs := CuUI.fs(16, 1.7, 32)
	var t := CuUI.lbl(title, tfs, Color("#362b1c"), true)
	var tb := CuTextBox.wrap(t, tfs * 1.45)
	tb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	tb.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	head.add_child(tb)
	if close:
		var cb := CuUI.btn("返回 · Esc", "close", "", false, CuUI.fs(14, 1.2, 23))
		cb.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		head.add_child(cb)
	col.add_child(head)
	var gap_h := Control.new(); gap_h.custom_minimum_size = Vector2(0, em * 0.5); gap_h.mouse_filter = Control.MOUSE_FILTER_IGNORE
	col.add_child(gap_h)
	var line := ColorRect.new(); line.color = Color("#bda577"); line.custom_minimum_size = Vector2(0, CuUI.PX)
	col.add_child(line)
	var gap_b := Control.new(); gap_b.custom_minimum_size = Vector2(0, em * 0.6); gap_b.mouse_filter = Control.MOUSE_FILTER_IGNORE
	col.add_child(gap_b)
	var sc := ScrollContainer.new()
	sc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	col.add_child(sc)
	var bd := VBoxContainer.new()
	bd.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bd.add_theme_constant_override("separation", int(round(em * 0.7)))
	sc.add_child(bd)
	var bw: float = box.size.x - (bw0 + CuUI.W * 0.015) * 2
	for n in body:
		var node: Control = n
		if n is Label and n.autowrap_mode != TextServer.AUTOWRAP_OFF: n.custom_minimum_size.x = bw
		if n is Label and n.has_meta("lh"): node = CuTextBox.wrap(n, float(n.get_meta("lh")))
		# align-items: flex-start：按钮按自身宽度靠左
		if n is Button: n.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		bd.add_child(node)
	if fit:
		# 11-10 第四十九轮：内容少时弹窗下半截空着——高度跟着内容走（最多到原来的大小），竖直居中
		var max_h := box.size.y
		var fitf := func():
			sc.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
			sc.custom_minimum_size.y = bd.get_combined_minimum_size().y
			var need: float = col.get_combined_minimum_size().y + (bw0 + CuUI.W * 0.015) * 2
			box.size.y = minf(max_h, need)
			box.position.y = (CuUI.H - box.size.y) / 2
		fitf.call_deferred()
	return {"el": el, "body": bd, "box": box}

## 段落 .cu-panel-body p（clamp(14px,1.3cqw,24px)/1.5）；行高由 panel() 用 CuTextBox 落实
static func p(text: String, col := Color("#362b1c")) -> Label:
	var sz := CuUI.fs(14, 1.3, 24)
	var l := CuUI.para(text, sz, col)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	CuUI.lh(l, sz * 1.5)
	l.set_meta("lh", sz * 1.5)
	return l

## 按钮一行
static func row(btns: Array) -> HFlowContainer:
	var r := HFlowContainer.new()
	r.add_theme_constant_override("h_separation", 12)
	r.add_theme_constant_override("v_separation", 8)
	for b in btns: r.add_child(b)
	return r

## .cu-gain 结果条（left/right 32% bottom 26%；rig-trial 下 top 70%）
static func gain_box(h: Node, nodes: Array) -> Control:
	var sb := CuUI.box(Color("#f4e8cb"), Color("#a47c45"), 2, 0, 14)
	var box := CuUI.panel_box(sb)
	box.name = "cu-gain"
	box.position = Vector2(CuUI.W * 0.32, CuUI.H * 0.70)
	box.custom_minimum_size = Vector2(CuUI.W * 0.36, 0)
	box.size = Vector2(CuUI.W * 0.36, 0)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 4)
	box.add_child(col)
	for n in nodes:
		if n is Label: n.custom_minimum_size.x = CuUI.W * 0.36 - 32
		col.add_child(n)
	h.root.add_child(box)
	return box

static func gain_title(text: String) -> Label: return CuUI.para(text, CuUI.fs(14, 1.3, 24), Color("#56763d"), 0, true)
static func small(text: String, col := Color("#5c4a32")) -> Label: return CuUI.para(text, CuUI.fs(12, 1.05, 20), col)

## .cu-message：left/right 25% bottom 26%，#f4e5c5，2px #9b7645，居中
static func message(h: Node, text: String) -> void:
	var box := CuUI.panel_box(CuUI.box(Color("#f4e5c5"), Color("#9b7645"), 2, 0, 12))
	box.name = "cu-message"
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var l := CuUI.para(text, CuUI.fs(14, 1.3, 24), Color("#362b1c"), CuUI.W * 0.5 - 24)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(l)
	box.position = Vector2(CuUI.W * 0.25, CuUI.H * 0.74)
	box.custom_minimum_size = Vector2(CuUI.W * 0.5, 0)
	h.root.add_child(box)
	box.resized.connect(func(): box.position.y = CuUI.H * 0.74 - box.size.y)

## 原版 gainSummary(r)
static func gain_summary(r: Dictionary) -> String:
	var g = r.get("gainKey")
	var t = r.get("training")
	var b := int(t.before.progress.get(g, 0)) if t is Dictionary and g != null else 0
	var a := int(t.after.progress.get(g, 0)) if t is Dictionary and g != null else 0
	var out := str(r.get("gainName")) if r.get("gainName") else "修习"
	if r.get("gain"): out += " +%s（累计 %d → %d）" % [str(r.gain), b, a]
	return out

## 原版 trainingResult(r)：返回节点数组，同时写 r.trainingChanged
static func training_result(r: Dictionary) -> Array:
	var t = r.get("training")
	if not (t is Dictionary): return []
	var out := []
	var changes: Array = CuGrowth.outcome(t.before, t.after)
	r.trainingChanged = changes.size() > 0 or not not r.get("nextEffect") or (r.get("relationshipChanges") is Array and r.relationshipChanges.size() > 0)
	if r.get("courseBeat"): out.append(p(str(r.courseBeat)))
	for x in changes: out.append(small("%s +%s%s（培养累计 %s → %s）" % [x.name, str(x.delta), x.unit, str(x.before), str(x.after)]))
	if r.get("nextEffect"): out.append(small(str(r.nextEffect), Color("#7a6a50")))
	var bm: Dictionary = t.before.get("martial", {})
	for k in t.after.get("martial", {}):
		var v: Dictionary = t.after.martial[k]
		var lv0 := int(bm[k].level) if bm.has(k) else 0
		if int(v.level) == lv0: continue
		var unit := "层" if v.get("type") == "inner" else "重"
		var tail := "" if bm.has(k) else ("，去基本功栏修习" if v.get("type") == "inner" else "，去招式栏修习")
		out.append(small("《%s》 %d → %d%s%s" % [v.name, lv0, int(v.level), unit, tail]))
	for x in r.get("relationshipChanges", []):
		out.append(small("♡ %s %s → %s（%s%s）" % [x.name, str(x.before), str(x.after), x.stage, (" · " + str(x.reason)) if x.get("reason") else ""]))
	return out

## 原版 record()：.cu-record
static func record(s: Dictionary) -> Array:
	var out := training_result({"training": {"before": CuCore.growth(CuCore.initial()), "after": CuCore.growth(s)}})
	var names: Dictionary = D().progressNames
	var rules: Dictionary = CuGrowth.rules()
	if s.progress.is_empty(): out.append(p("本次以休养为主。"))
	for k in s.progress:
		var use: String = rules[k].get("use", "已记录的经历") if rules.has(k) else "已记录的经历"
		var hb := HBoxContainer.new()
		var l := p(str(names.get(k, k)))
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hb.add_child(l)
		hb.add_child(CuUI.lbl(str(s.progress[k]), CuUI.fs(14, 1.3, 24), Color("#362b1c"), true))
		out.append(hb)
		out.append(small(use + " · " + str(CuGrowth.hints(s, k, D().actions)), Color("#7a6a50")))
	return out
