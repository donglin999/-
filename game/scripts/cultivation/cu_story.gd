class_name CuStory
extends RefCounted
## 剧情对白舞台（原版 js/qh-mode-cultivation-story.js 的 CultivationStory，样式 -story.css 与 -actors.css）。
## render(host, opts) 返回整层 Control（原版 section.cu-story-scene）；next()/answer() 生成按钮（原版返回 HTML 串）。

const LEFT_READY := ["pei", "peishu", "zhou", "yin", "mo_songnian", "meng_zhiwei", "zhaochuan_courier", "xu", "cen", "shen"]
const MOTIONS := ["knock", "flee", "startle", "step", "drag", "shake", "slump", "nod", "enter"]
const STAGE_BOTTOM := 0.15   # .cu-visitor-story .cu-story-stage inset 0 0 15%
const VER := "?v=20261012-performance1"

static var _layout := {}
static var _last_duo := {"event": null, "src": null, "cast": null}
static var _motion_line := ""

static func portraits() -> Dictionary:
	var p: Dictionary = CuDB.copy(CuDB.t("CultivationStory").portraits)
	p.merge(CuHousehold.portraits(), true)
	return p

## 原版 labels（含 household.actors）
static func labels() -> Dictionary:
	var l := {"hero": "萧白", "zhou": "周砚", "ye": "叶蘅", "lu": "陆衡", "neighbor": "乡邻", "mo_songnian": "莫松年", "meng_zhiwei": "孟知微", "zhaochuan_courier": "照川来客", "narrator": "旁白"}
	l.merge(CuHousehold.actors(), true)
	return l

static func _st():
	return G.S.get("cultivation") if G.S is Dictionary else null

## 原版 actorSrc0 / actorSrc
static func actor_src0(id: String, mood) -> String:
	if id == "hero": return CuHousehold.heroPortrait(_st(), mood)
	if CuHousehold.MOODS().has(id): return CuHousehold.portraitFor(id, mood)
	return str(portraits().get(id, ""))

static func actor_src(id: String, mood, right: bool) -> String:
	var src := actor_src0(id, mood)
	if right and id in LEFT_READY and src != "": return src.trim_suffix(".png") + "_left.png"
	return src

static func is_hero(a) -> bool: return str(a) == "hero" or str(a).begins_with("hero_")

static func hero_first(list: Array, hero_side) -> Array:
	var h := []; var o := []
	for a in list: (h if is_hero(a) else o).append(a)
	return o + h if hero_side == "right" else h + o

## 原版 composition(cast, speaker, primary, heroSide)
static func composition(cast: Array, speaker, primary, hero_side) -> Dictionary:
	var uniq := []
	for a in cast: if not a in uniq: uniq.append(a)
	var all := hero_first(uniq, hero_side)
	if portraits().has(speaker) and not speaker in all: all.append(speaker)
	if all.size() <= 3: return {"foreground": hero_first(all, hero_side), "roster": []}
	var chosen := []
	var hero = null
	for a in all: if is_hero(a): hero = a; break
	for a in [speaker, hero, primary]:
		if a != null and a in all and not a in chosen: chosen.append(a)
	for a in all:
		if chosen.size() == 3: break
		if not a in chosen: chosen.append(a)
	var fg := []; var rs := []
	for a in all: (fg if a in chosen else rs).append(a)
	return {"foreground": hero_first(fg, hero_side), "roster": rs}

## 原版 motionOf(line, speaker)
static func motion_of(line, speaker) -> Variant:
	if not (line is Dictionary) or not line.get("motion"): return null
	var m = line.motion
	var o: Dictionary = {"move": m} if m is String else m
	if not o.get("move") in MOTIONS: return null
	return {"who": o.get("who", speaker), "move": o.move}

## 站位表（docs/specs/cultivation/52、53 节 → data/cultivation/actor_layout.json）
static func layout(cls: String, mood: String, left: bool) -> Dictionary:
	if _layout.is_empty():
		var f := FileAccess.open("res://data/cultivation/actor_layout.json", FileAccess.READ)
		if f: _layout = JSON.parse_string(f.get_as_text())
	var out := {}
	for key in [cls + "|*|", cls + "|" + mood + "|", cls + "|" + mood + "|L" if left else ""]:
		if key == "" or not _layout.has(key): continue
		var r: Dictionary = _layout[key]
		for k in r:
			var v = r[k]
			if v is Array:
				var cur: Array = out.get(k, [null, null]).duplicate()
				for i in v.size(): if v[i] != null: cur[i] = v[i]
				out[k] = cur
			elif v != null: out[k] = v
	return out

static func _speech_box() -> StyleBoxFlat:
	# .cu-story-scene .cu-speech：border 2px，圆角 2.4cqw，阴影 0 2px 2px #33200d22
	var sb := CuUI.box(Color("#faf0d9"), Color("#493322"), int(2 * CuUI.PX), int(CuUI.cq(2.4)))
	sb.shadow_color = Color("#33200d22"); sb.shadow_size = int(2 * CuUI.PX); sb.shadow_offset = Vector2(0, 2 * CuUI.PX)
	return sb

## 原版 next(action, label='继续对白')：整只气泡都是热区，右下角 ▾
static func next(action: String, label := "继续对白") -> Button:
	var b := CuUI.hot(action)
	b.tooltip_text = label
	b.set_meta("next", true)
	return b

## 原版 answer(action, id, label, cost)
static func answer(action: String, id: String, label: String, cost = null) -> Button:
	var t := label
	if cost != null and int(cost) != 0: t += "　体力 %d" % int(cost)
	var b := CuUI.btn(t, action, id)
	var n := CuUI.box(Color("#d3cab28c"), Color(0, 0, 0, 0), 0, 4)
	n.content_margin_left = 16; n.content_margin_right = 16; n.content_margin_top = 8; n.content_margin_bottom = 8
	var hv: StyleBoxFlat = n.duplicate(); hv.bg_color = Color("#f5eac7"); hv.border_color = Color("#658373"); hv.set_border_width_all(3)
	for k in ["normal", "disabled"]: b.add_theme_stylebox_override(k, n)
	for k in ["hover", "pressed", "focus"]: b.add_theme_stylebox_override(k, hv)
	b.add_theme_font_size_override("font_size", CuUI.fs(12, 1.55, 29))
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY
	b.set_meta("answer", true)
	return b

static var _fade_mat: ShaderMaterial
## 立绘下沿渐隐（半身立绘的截口不露硬边）
static func _foot_fade() -> ShaderMaterial:
	if _fade_mat == null:
		var sh := Shader.new()
		sh.code = "shader_type canvas_item;\nvoid fragment(){ vec4 c = texture(TEXTURE, UV) * COLOR; c.a *= 1.0 - smoothstep(0.84, 1.0, UV.y); COLOR = c; }"
		_fade_mat = ShaderMaterial.new(); _fade_mat.shader = sh
	return _fade_mat

## 人物立绘水平锚点（-actors.css：1–2 人 28%+i×44%；3 人 21%+i×29%；4 人 13%+i×24.6%；单人 50%；只有萧白 28%）
static func _anchor(i: int, n: int, solo_hero: bool) -> float:
	if solo_hero: return 28.0
	if n == 1: return 50.0
	if n == 2: return 28.0 + i * 44.0
	if n == 3: return 21.0 + i * 29.0
	return 13.0 + i * 24.6

## 原版 render(host, {title,text,speaker,cast,buttons,choice,event,line,moods})
## buttons 为 Button 数组（next() 或 answer()）
static func render(host: Control, o: Dictionary) -> Control:
	# 11-10 第四十九轮：对话时收起底部行动栏，不再压住人物下半身（下次重画主界面时自然回来）
	var bot := host.find_child("cu-bottom", true, false)
	if bot: bot.visible = false
	var title: String = o.get("title", "")
	var text: String = str(o.get("text", ""))
	var speaker: String = str(o.get("speaker", "zhou"))
	var cast: Array = o.get("cast", ["hero", "zhou"]) if o.get("cast") != null else ["hero", "zhou"]
	var buttons: Array = o.get("buttons", [])
	var choice: bool = o.get("choice", false)
	var event = o.get("event")
	var line = o.get("line")
	var st = _st()
	var pend = st.get("pending") if st is Dictionary else null
	var encounter = (pend.get("id") if pend is Dictionary and pend.get("id") != null else null)
	if encounter == null: encounter = event if event != null else title
	var signature := "%s|%s|%s" % [encounter, speaker, text]
	var mood: Dictionary = o.get("moods") if o.get("moods") != null else CuHousehold.moodsFor(event, line if line != null else {"speaker": speaker, "text": text}, cast)
	# 双人图 duo（只写 duo＝整句只显示这张图；再写 duoCast＝这张图只占一个站位）
	var duo = line.get("duo") if line is Dictionary and line.get("duo") else (_last_duo.src if choice and _last_duo.event == encounter else null)
	var duo_cast = null
	if duo != null: duo_cast = (line.get("duoCast") if line is Dictionary and line.get("duo") else _last_duo.cast)
	_last_duo = {"event": encounter, "src": duo, "cast": duo_cast} if duo != null else {"event": null, "src": null, "cast": null}
	var slotted: bool = duo != null and duo_cast is Array and duo_cast.size() > 0
	var full_duo: bool = duo != null and not slotted
	var as_ := func(a): return "duo" if slotted and a in duo_cast else a
	var def = CuDB.find_by(CuHousehold.definitions(), "id", event) if event != null else null
	var ccast := cast
	if slotted:
		ccast = []
		for a in cast: if not a in duo_cast: ccast.append(a)
		ccast.append("duo")
	var comp := composition(ccast, as_.call(speaker), as_.call(def.get("actor")) if def else null, def.get("heroSide") if def else null)
	var fg: Array = comp.foreground
	var roster: Array = comp.roster
	var el := Control.new()
	el.name = "cu-story-scene"
	CuUI.fill(el)
	el.set_meta("dialog", true)
	el.set_meta("speaker", speaker)
	host.add_child(el)
	# 舞台
	var stage := Control.new()
	stage.clip_contents = true
	stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.place(stage, 0, 0, CuUI.W, CuUI.H * (1.0 - STAGE_BOTTOM))
	el.add_child(stage)
	var sh := stage.size.y
	var solo_hero: bool = not full_duo and fg.size() == 1 and is_hero(fg[0])
	var actors := []
	var form := CuHousehold.heroForm(st)
	if full_duo:
		var d := CuUI.img(duo)
		d.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		CuUI.place(d, CuUI.W * 0.14, sh * 0.18, CuUI.W * 0.72, sh * 0.82)
		stage.add_child(d)
	else:
		for i in fg.size():
			var id: String = fg[i]
			var n := fg.size()
			var left: bool = n > 1 and i == n - 1 and id in LEFT_READY
			var src: String = str(duo) if id == "duo" else actor_src(id, mood.get(id), left)
			var t := CuUI.tex(src)
			var cls := id
			if id == "duo": cls = str(duo).get_file().get_basename()
			elif id == "hero": cls = "hero_" + form
			var res_mood = CuHousehold.resolveMood(cls if id == "hero" else id, str(mood.get(id, "normal")).trim_prefix("hurt_")) if id != "duo" else null
			var mk: String = str(res_mood) if res_mood != null else str(mood.get(id, ""))
			var L := layout(cls, mk, left)
			var tp: Array = (L.get("c") if choice and L.get("c", [null])[0] != null else L.get("n", [33, 80]))
			var top := float(tp[0] if tp[0] != null else 33.0) / 100.0 * sh
			var hh := float(tp[1] if tp[1] != null else 80.0) / 100.0 * sh
			var ww := hh * (float(t.get_width()) / t.get_height()) if t != null else hh * 0.6
			var cx := _anchor(i, n, solo_hero) / 100.0 * CuUI.W
			var dx := float(L.get("dx", 0.0)) / 100.0 * ww
			var r := CuUI.img(src, TextureRect.STRETCH_SCALE)
			CuUI.place(r, cx - ww / 2 + dx, top, ww, hh)
			r.set_meta("character", id)
			r.material = _foot_fade()   # 11-10 试玩审查：底栏收起后半身立绘下沿一刀齐平，像浮在半空；下沿一成五渐隐进地面
			if o.get("night"): r.modulate = Color(0.84, 0.82, 0.8)
			stage.add_child(r)
			actors.append(r)
	# 其他在场人物头像条
	if not full_duo and roster.size() > 0:
		var bar := HBoxContainer.new()
		bar.add_theme_constant_override("separation", int(CuUI.cq(0.9)))
		var pb := CuUI.panel_box(CuUI.box(Color("#273128a6"), Color("#e8d3a944"), 1, int(CuUI.cq(0.7)), 8))
		pb.add_child(bar)
		for id in roster:
			var cell := VBoxContainer.new()
			var av := Control.new()
			av.custom_minimum_size = Vector2.ONE * CuUI.cq(3.6)
			av.clip_contents = true
			var ring := CuUI.panel_box(CuUI.box(Color("#3c403acc"), Color("#e8d3a988"), 2, int(CuUI.cq(1.8))))
			CuUI.fill(ring); av.add_child(ring)
			var cls2: String = "hero_" + form if id == "hero" else id
			var L2 := layout(cls2, str(mood.get(id, "")), false)
			var avh: Array = L2.get("av", [500, -110])
			var asz := CuUI.cq(3.6)
			var ai := CuUI.img(actor_src(id, mood.get(id), false), TextureRect.STRETCH_KEEP_ASPECT_CENTERED)
			var ah := asz * float(avh[0] if avh[0] != null else 500) / 100.0
			CuUI.place(ai, (asz - ah) / 2 + float(L2.get("dx", 0)) / 100.0 * ah, asz * float(avh[1] if avh[1] != null else -110) / 100.0, ah, ah)
			av.add_child(ai)
			cell.add_child(av)
			cell.add_child(CuUI.lbl(str(labels().get(id, id)), CuUI.fs(10, 0.95, 18), Color("#f4e8cc"), false, HORIZONTAL_ALIGNMENT_CENTER))
			bar.add_child(cell)
		el.add_child(pb)
		pb.position = Vector2(0, 0)
		pb.ready.connect(func(): pb.position = Vector2((CuUI.W - pb.size.x) / 2, CuUI.H * (1 - 0.175) - pb.size.y))
	# 气泡
	var pos := fg.find(as_.call(speaker))
	var tail := "center" if full_duo else ("left" if pos == 0 else ("right" if pos == fg.size() - 1 else "center"))
	_speech(el, title, speaker, text, buttons, choice, tail)
	# 立绘动作（选项画面不播；同一句重绘不重播）
	var mo = null if choice else motion_of(line, speaker)
	if mo != null and mo.who != "duo": mo.who = as_.call(mo.who)
	if mo != null and signature != _motion_line:
		_motion_line = signature
		var target = null
		for a in actors: if a.get_meta("character") == mo.who: target = a
		if target != null: CuMotionFx.play(target, mo.move, actors.find(target), actors.size())
	return el

## 气泡 .cu-story-scene .cu-speech（水平居中，宽 fit-content，最小 22% 最大 46%，选项 56%；top 3%/选项 2%；
## padding .8% 1.8% 1.1%（百分比按宽 1920 计），border 2px；h2 700 clamp(11px,1.25cqw,24px)/1.2 下距 .3em；
## p 500 clamp(12px,1.4cqw,26px)/1.4，左右内距 .5em/.8em）。实测 cult-hub.json：框 346,22 589×102，h2 371,34，p 371,58，▾ 884,84。
static func _speech(el: Control, _title: String, speaker: String, text: String, buttons: Array, choice: bool, tail: String) -> void:
	var h2s := CuUI.fs(11, 1.25, 24)
	var ps := CuUI.fs(12, 1.4, 26)
	var pad_x := CuUI.W * 0.018
	var bdw := 2 * CuUI.PX
	var f := CuUI.font()
	var tw := 0.0
	for ln in text.split("\n"): tw = max(tw, f.get_string_size(ln, HORIZONTAL_ALIGNMENT_LEFT, -1, ps).x)
	var w: float = CuUI.W * 0.56 if choice else clamp(tw + ps * 1.3 + (pad_x + bdw) * 2 + 2, CuUI.W * 0.22, CuUI.W * 0.46)
	var sb := _speech_box()
	sb.content_margin_left = pad_x + bdw; sb.content_margin_right = pad_x + bdw
	sb.content_margin_top = CuUI.W * 0.008 + bdw; sb.content_margin_bottom = CuUI.W * 0.011 + bdw
	var box := CuUI.panel_box(sb)
	box.position = Vector2((CuUI.W - w) / 2, CuUI.H * (0.02 if choice else 0.03))
	box.size = Vector2(w, 0)
	box.custom_minimum_size = Vector2(w, 0)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", int(round(h2s * 0.3)))
	box.add_child(col)
	var labs := labels()
	col.add_child(CuTextBox.wrap(CuUI.lbl(str(labs.get(speaker, speaker)), h2s, Color("#302415"), true), h2s * 1.2))
	var inner_w := w - (pad_x + bdw) * 2
	var p := CuUI.para(text, ps, Color("#302415"), inner_w - ps * 1.3)
	p.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var pm := MarginContainer.new()
	pm.mouse_filter = Control.MOUSE_FILTER_IGNORE
	pm.add_theme_constant_override("margin_left", int(round(ps * 0.5)))
	pm.add_theme_constant_override("margin_right", int(round(ps * 0.8)))
	pm.add_child(CuTextBox.wrap(p, ps * 1.4))
	col.add_child(pm)
	var nxt: Button = null
	var answers := []
	for b in buttons:
		if b.has_meta("next"): nxt = b
		else: answers.append(b)
	if answers.size() > 0:
		var grid := GridContainer.new()
		grid.columns = answers.size()
		grid.add_theme_constant_override("h_separation", int(ps * 0.4))
		grid.add_theme_constant_override("v_separation", int(ps * 0.4))
		for b in answers: grid.add_child(b)
		col.add_child(grid)
	el.add_child(box)
	if nxt != null:
		# .cu-dialogue-next：inset 0（盖住气泡内框），▾ 在右下角 right 5% bottom 9%，700 2.3cqw/1 sans-serif，#3d9dd1
		el.add_child(nxt)
		var arrow := CuUI.lbl("▾", int(CuUI.cq(2.3)), Color("#3d9dd1"), true)
		arrow.add_theme_color_override("font_shadow_color", Color("#286c92"))
		arrow.add_theme_constant_override("shadow_offset_y", 1)
		arrow.add_theme_font_override("font", ThemeDB.fallback_font)
		arrow.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		nxt.add_child(arrow)
		var lay_next := func():
			# 对话框重绘得快时，延迟调用到这里它可能已被销毁（2026-11-08 全程测试发现）
			if not (is_instance_valid(nxt) and is_instance_valid(box) and is_instance_valid(arrow)): return
			nxt.position = box.position + Vector2(bdw, bdw)
			nxt.size = box.size - Vector2(bdw, bdw) * 2
			# 行高 1 → 行盒高 2.3cqw；Label 框比行盒高，按中心对齐
			var ab := CuUI.cq(2.3)
			arrow.position = Vector2(nxt.size.x * 0.95 - arrow.size.x, nxt.size.y * 0.91 - ab - (arrow.size.y - ab) / 2)
		box.resized.connect(lay_next)
		box.sort_children.connect(lay_next)
		box.draw.connect(lay_next, CONNECT_ONE_SHOT)   # 原为 call_deferred：对话框先被销毁时会访问空对象
		el.set_meta("next", nxt)
	# 尾巴（旁白不显示）
	if speaker != "narrator":
		var tl := Control.new()
		tl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var tw2 := CuUI.cq(2.8)
		var th := CuUI.cq(3.0)
		tl.size = Vector2(tw2, th)
		tl.draw.connect(func():
			# 原版：底同气泡、右/下边 3px #493322、左下圆角 100% 再 skew；这里画成一只弯尾（left 版水平翻转）
			var flip := tail == "left"
			var tip := Vector2(tw2 * (0.05 if not flip else 0.95), th)
			var edge := PackedVector2Array()
			for i in 9:
				var t := i / 8.0
				var x0 := tw2 * (1.0 - t * 0.95)
				edge.append(Vector2(tw2 - x0 if flip else x0, th * t * t))
			var fill_pts := PackedVector2Array([Vector2(tw2 if flip else 0.0, 0)])
			fill_pts.append_array(edge)
			fill_pts.append(tip)
			tl.draw_colored_polygon(fill_pts, Color("#faf0d9"))
			tl.draw_polyline(edge, Color("#493322"), 3.0, true)
			tl.draw_line(Vector2(tw2 if flip else 0.0, 0), tip, Color("#493322"), 2.0, true))
		el.add_child(tl)
		box.resized.connect(func():
			var bx := box.position.x
			var x: float
			if tail == "left": x = bx + box.size.x * 0.17
			elif tail == "right": x = bx + box.size.x * 0.82 - tw2
			else: x = bx + box.size.x * 0.52 - tw2
			# top: calc(100% - 2px)，相对气泡内框（边框以内）
			tl.position = Vector2(x, box.position.y + box.size.y - bdw - 2 * CuUI.PX))
