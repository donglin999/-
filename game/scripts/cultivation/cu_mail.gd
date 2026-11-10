class_name CuMail
extends RefCounted
## 邮箱界面（原版 js/qh-mode-cultivation-mail.js 的 CultivationMail，样式 -mail.css；规格 docs/specs/cultivation/32）。
## h 为 Cultivation 节点；kind：mail / gift / letter / inbox / motion / result。

const BASE := "assets/production/cultivation/mail-classic/"
const PORTRAITS := {
	"zhou": {"file": BASE + "portraits/zhou-menu-inkcloud.png", "avatar": [350, 30, 320, 330]},
	"ye": {"file": BASE + "portraits/ye-menu.webp", "avatar": [395, 55, 335, 355]},
	"lu": {"file": BASE + "portraits/lu-menu.png", "avatar": [356, 95, 320, 330]},
	"neighbor": {"file": BASE + "portraits/neighbor-menu.png", "avatar": [419, 130, 320, 340]},
	"shimu": {"file": BASE + "portraits/shimu-menu.png", "avatar": [220, 90, 320, 330]},
	"yin": {"file": BASE + "portraits/yin-menu.png", "avatar": [280, 10, 320, 330]},
	"zhong": {"file": BASE + "portraits/zhong-menu.png", "avatar": [336, 40, 320, 330]},
	"fang": {"file": BASE + "portraits/fang-menu.png", "avatar": [352, 30, 320, 330]},
	"dou": {"file": BASE + "portraits/dou-menu.png", "avatar": [371, 10, 320, 330]},
	"man": {"file": BASE + "portraits/man-menu.png", "avatar": [326, 75, 320, 330]},
	"xu": {"file": "assets/production/portraits/p_qh_xulingyi_story_hd_20261017.webp", "avatar": [280, 60, 320, 330]},
	"cen": {"file": "assets/production/portraits/p_qh_censhuang_story_hd_20261017.webp", "avatar": [290, 70, 320, 330]},
	"shen": {"file": "assets/production/portraits/p_qh_shenyanhui_story_hd_20261017.webp", "avatar": [340, 60, 320, 330]}}
const CATEGORIES := ["全部", "可赠送", "兵器", "护具", "佩饰", "药食", "杂物", "要物"]
const GIFT_KEYS := ["food", "herb", "pouch"]
const PAGE_SIZE := 36

static var opened := false
static var query := ""
static var filter := "全部"
static var page := 0
static var _kind := "mail"
static var _bag: Control = null
static var _shell: Control = null

static func cost(id: String) -> int: return int(CuCore.actionCost(CuDB.action(id)))

## 原版 itemCategory(it)
static func item_category(it: Dictionary) -> String:
	if it.get("weapon"): return "兵器"
	if it.get("armor") is int or it.get("armor") is float: return "护具"
	if it.get("acc"): return "佩饰"
	if it.get("key"): return "要物"
	if it.get("heal") or it.get("mp"): return "药食"
	return "杂物"

## 原版 inventory(s, world, definitions)
static func inventory(s: Dictionary, world: Dictionary) -> Array:
	var res: Dictionary = CuCore.D().resources
	var rows := []
	for id in GIFT_KEYS:
		rows.append({"id": id, "key": "resource:" + id, "name": res[id], "qty": int(s.resources.get(id, 0)), "cat": "药食" if id == "food" else "杂物", "gift": true, "image": "assets/production/cultivation/mail-v7/%s.png" % id})
	for id in ["grain", "cloth"]:
		if int(s.resources.get(id, 0)) > 0: rows.append({"id": id, "key": "resource:" + id, "name": res[id], "qty": int(s.resources[id]), "cat": "药食" if id == "grain" else "杂物", "gift": false})
	for id in world.get("bag", {}):
		var q = world.bag[id]
		if not CuDB.is_int(q) or int(q) <= 0 or not DB.ITEMS.has(id): continue
		var it: Dictionary = DB.ITEMS[id]
		rows.append({"id": id, "key": "world:" + id, "name": it.get("name", id), "qty": int(q), "cat": item_category(it), "gift": false})
	return rows

## 原版 bagPage(rows, query, category, page)
static func bag_page(rows: Array, q: String, cat: String, pg: int) -> Dictionary:
	var ql := q.strip_edges().to_lower()
	var f := []
	for i in rows:
		if ql != "" and not str(i.name).to_lower().contains(ql): continue
		if cat == "全部" or (cat == "可赠送" and i.gift and i.qty > 0) or i.cat == cat: f.append(i)
	var pages: int = max(1, ceili(f.size() / float(PAGE_SIZE)))
	var idx: int = clamp(pg, 0, pages - 1)
	return {"total": f.size(), "pages": pages, "page": idx, "visible": f.slice(idx * PAGE_SIZE, (idx + 1) * PAGE_SIZE)}

static func reset() -> void:
	opened = false; query = ""; filter = "全部"; page = 0; _bag = null; _shell = null

static func _is_letter(h: Node) -> bool:
	var p = h.state().get("pending")
	return _kind == "letter" or (p is Dictionary and p.get("action") == "C01")
static func recipients(h: Node) -> Array:
	return CuCore.letterRecipients(h.state()) if _is_letter(h) else CuCore.giftRecipients(h.state())
static func _recipient(h: Node) -> String:
	var p = h.state().get("pending")
	if p is Dictionary and p.get("recipient"): return str(p.recipient)
	return h.recipient
static func person(h: Node):
	return CuDB.find_by(recipients(h), "name", _recipient(h))

static func is_bag_open(_h: Node) -> bool: return opened

## 原版 canSendLetter()
static func can_send_letter(h: Node) -> bool:
	var who = person(h)
	return _kind == "letter" and not opened and not h.state().get("pending") and who != null and str(CuCore.availability(h.state(), CuDB.action("C01"), {"recipient": who.name})) == ""

## 原版 reason(i)
static func reason(h: Node, i: Dictionary) -> String:
	if not i.qty: return "无库存"
	if not i.gift: return "不可赠送"
	var who = person(h)
	return str(CuCore.availability(h.state(), CuDB.action("C02"), {"gift": i.id, "recipient": who.name if who else null}))

## 原版 canGift(id, key)
static func can_gift(h: Node, id: String) -> bool:
	if _kind != "gift" or not opened or person(h) == null: return false
	for i in inventory(h.state(), G.S):
		if i.id == id and i.key == "resource:" + id and i.gift and reason(h, i) == "": return true
	return false

## 原版 handleAction(action)
static func handle_action(h: Node, a: String, _id: String) -> bool:
	if a == "mail-open-bag": open_bag(h); return true
	if not opened: return false
	match a:
		"mail-bag-close": close_bag(h); return true
		"mail-bag-clear": query = ""; filter = "全部"; page = 0; refresh_bag(h); return true
		"mail-bag-prev": page -= 1; refresh_bag(h); return true
		"mail-bag-next": page += 1; refresh_bag(h); return true
	return false

## 原版 closeBag()
static func close_bag(_h: Node, _focus := true) -> bool:
	if not opened: return false
	opened = false
	if is_instance_valid(_bag): _bag.queue_free()
	_bag = null
	if is_instance_valid(_shell): _shell.process_mode = Node.PROCESS_MODE_INHERIT; _set_inert(_shell, false)
	return true

static func _set_inert(n: Node, on: bool) -> void:
	if n is Button: n.disabled = on if on else n.get_meta("was_disabled", false)
	for c in n.get_children(): _set_inert(c, on)

## 邮箱内按钮：无边框透明，焦点 2px #587478
static func _plain(b: Button) -> Button:
	var e := StyleBoxEmpty.new()
	var f := CuUI.box(Color(0, 0, 0, 0), Color("#587478"), 2)
	for k in ["normal", "hover", "pressed", "disabled"]: b.add_theme_stylebox_override(k, e)
	b.add_theme_stylebox_override("focus", f)
	return b

static func _at(n: Control, l: float, t: float, w: float, hh: float) -> Control:
	return CuUI.place(n, CuUI.W * l / 100, CuUI.H * t / 100, CuUI.W * w / 100, CuUI.H * hh / 100)

## 原版 mount(container, {kind, s, world, items, recipient, date, art})
static func mount(h: Node, kind: String) -> void:
	_kind = kind
	var was_open := opened
	opened = false
	var s: Dictionary = h.state()
	var p = s.get("pending")
	var incoming := kind == "inbox"
	var gift := kind == "gift"
	var letter := kind == "letter"
	var picker := gift or letter
	var locked: bool = p != null
	var sel = person(h)
	var shell := Control.new()
	shell.name = "cu-mail-shell"
	CuUI.fill(shell)
	h.root.add_child(shell)
	_shell = shell
	var paper := CuUI.img(BASE + "paper-panel.png", TextureRect.STRETCH_SCALE)
	_at(paper, 7, 7.2, 87, 85.6)
	shell.add_child(paper)
	# 头部：标题“往来”、日期、×
	var head := HBoxContainer.new()
	_at(head, 10, 10.2, 81.8, 5)
	var t := CuUI.lbl("往来", int(CuUI.cq(1.95)), Color("#5a4d35"))
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(t)
	head.add_child(CuUI.lbl(CuHub.date(s), int(CuUI.cq(1.0)), Color("#8a7958")))
	var x := _plain(CuUI.btn("×", "close"))
	x.add_theme_font_size_override("font_size", int(CuUI.cq(2)))
	x.disabled = locked
	x.set_meta("cu", "mail-close")
	head.add_child(x)
	shell.add_child(head)
	# 竖签：送物 / 送信 / 回信 N
	var tabs := VBoxContainer.new()
	tabs.add_theme_constant_override("separation", int(CuUI.cq(0.7)))
	_at(tabs, 4.9, 17, 4.6, 60)
	var pa = p.get("action") if p is Dictionary else null
	var tab_defs := [["送物", "mail-select", "C02", gift or pa == "C02"], ["送信", "mail-select", "C01", letter or pa == "C01"], ["回信 %d" % CuHub.unread(s), "mail-inbox", "", incoming]]
	for d in tab_defs:
		var b := CuUI.btn("", d[1], d[2])
		b.custom_minimum_size = Vector2(0, CuUI.cq(7.3))
		var on: bool = d[3]
		var sb := CuUI.box(Color("#6a8670") if on else Color("#dccca6"), Color("#8b7956"), 1, 3)
		for k in ["normal", "hover", "pressed", "disabled", "focus"]: b.add_theme_stylebox_override(k, sb)
		var l := CuUI.lbl(CuUI.vtext(str(d[0]).replace(" ", "")), int(CuUI.cq(1.6) * 0.9), Color("#f3e4bf") if on else Color("#4b3b25"), false, HORIZONTAL_ALIGNMENT_CENTER)
		l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		CuUI.fill(l); b.add_child(l)
		b.disabled = locked
		tabs.add_child(b)
	shell.add_child(tabs)
	if kind == "mail":
		# .cu-mail-illustration：left 21% top 20% 宽 45% 高 62%，object-fit:cover，object-position 25% 50%，四边羽化，saturate(.7)
		var il := CuUI.img(BASE + "mail-brush.png", TextureRect.STRETCH_SCALE)
		_at(il, 21, 20, 45, 62)
		var tw: float = il.texture.get_width(); var th: float = il.texture.get_height()
		var box := Vector2(CuUI.W * 0.45, CuUI.H * 0.62)
		var k: float = max(box.x / tw, box.y / th)
		var vis := Vector2(box.x / (tw * k), box.y / (th * k))
		var m := ShaderMaterial.new(); m.shader = load("res://shaders/cult_mail_feather.gdshader")
		m.set_shader_parameter("left", 0.06); m.set_shader_parameter("right", 0.14)
		m.set_shader_parameter("top", 0.08); m.set_shader_parameter("bottom", 0.08); m.set_shader_parameter("sat", 0.7)
		m.set_shader_parameter("crop_size", vis); m.set_shader_parameter("crop_pos", Vector2((1.0 - vis.x) * 0.25, (1.0 - vis.y) * 0.5))
		il.material = m
		shell.add_child(il)
	elif not incoming: _roster(h, shell, locked)
	if picker:
		if sel != null:
			var spec: Dictionary = PORTRAITS.get(sel.id, {})
			var vh := CuUI.H * 0.76
			var vw := CuUI.W * 0.30
			var ph: float = min(vh, vw * 1.5)
			var pt := CuUI.img(spec.get("file"), TextureRect.STRETCH_KEEP_ASPECT_COVERED)
			pt.material = _feather()
			pt.modulate = Color(0.95, 0.95, 0.95)
			CuUI.place(pt, CuUI.W * 0.28 + (vw - ph * 2 / 3) / 2, CuUI.H * 0.127 + (vh - ph) / 2, ph * 2 / 3, ph)
			shell.add_child(pt)
			var nm := CuUI.lbl(CuUI.vtext(str(sel.name)), int(CuUI.cq(2.55)), Color("#5c4931"))
			nm.position = Vector2(CuUI.W * 0.222, CuUI.H * 0.23)
			shell.add_child(nm)
		else:
			var e := CuUI.lbl("请选择可接信人物" if letter else "请选择左侧人物", int(CuUI.cq(1.3)), Color("#8b7753"), false, HORIZONTAL_ALIGNMENT_CENTER)
			e.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			_at(e, 28, 12.7, 30, 76)
			shell.add_child(e)
	if incoming: _inbox(h, shell, s)
	else: _controls(h, shell, locked, sel)
	if picker and sel != null:
		var r: Dictionary = CuCore.relationship(s, sel.name)
		var sb2 := CuUI.box(Color("#f8f1dfd9"), Color(0, 0, 0, 0), 0, 0, 10)
		sb2.border_color = Color("#b6a484"); sb2.border_width_top = 1
		var box := CuUI.panel_box(sb2)
		var rl := CuUI.para("%s · %s / %s\n%s%s" % [r.stage, str(r.score), str(r.cap), "关系暂止于此阶段。" if r.get("atCap") else "下一阶段条件：", str(r.get("requirement", ""))], int(CuUI.cq(1.05)), Color("#5c4931"), CuUI.W * 0.25 - 20)
		rl.add_theme_constant_override("line_spacing", int(CuUI.cq(1.05) * 0.7))
		box.add_child(rl)
		box.position = Vector2(CuUI.W * 0.64, CuUI.H * 0.68)
		shell.add_child(box)
	if gift and sel != null and not locked:
		var cr := str(CuCore.contactReason(s, "C02", sel.name))
		if cr != "" and cr != "<null>":
			var w := CuUI.para(cr, int(CuUI.cq(1.0)), Color("#996647"), CuUI.W * 0.18)
			w.position = Vector2(CuUI.W * 0.69, CuUI.H * 0.66)
			shell.add_child(w)
	if kind == "motion": _motion(h, shell, p)
	if kind == "result": _receipt(h, shell, s, p)
	for b in _buttons(shell): b.set_meta("was_disabled", b.disabled)
	if was_open and gift and sel != null and not locked: open_bag(h)

static func _buttons(n: Node) -> Array:
	var out := []
	if n is Button: out.append(n)
	for c in n.get_children(): out.append_array(_buttons(c))
	return out

static var _fmat: ShaderMaterial
static func _feather() -> ShaderMaterial:
	if _fmat == null:
		_fmat = ShaderMaterial.new()
		_fmat.shader = load("res://shaders/cult_mail_feather.gdshader")
	return _fmat

## 原版 roster(locked)：左列花名册
static func _roster(h: Node, shell: Control, locked: bool) -> void:
	var letter := _is_letter(h)
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_at(sc, 10.2, 19, 8.3, 66)
	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sc.add_child(col)
	var line := ColorRect.new(); line.color = Color("#ad9b73"); line.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_at(line, 18.5, 19, 0.06, 66)
	shell.add_child(line)
	var cur := _recipient(h)
	for n in recipients(h):
		var b := _plain(CuUI.btn("", "letter-npc" if letter else "gift-npc", n.name))
		b.custom_minimum_size = Vector2(0, CuUI.cq(6.35))
		b.disabled = locked
		var av := Control.new()
		av.mouse_filter = Control.MOUSE_FILTER_IGNORE
		av.clip_contents = true
		var asz := CuUI.cq(4.15)
		av.size = Vector2(asz, asz)
		av.position = Vector2((CuUI.W * 0.083 - asz) / 2, 4)
		var on: bool = cur == n.name
		var frame := CuUI.panel_box(CuUI.box(Color("#d6c49d"), Color("#65795d") if on else Color("#9c8761"), 2 if on else 1, 2))
		frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
		CuUI.fill(frame); av.add_child(frame)
		var spec: Dictionary = PORTRAITS.get(n.id, {})
		if spec.has("avatar"):
			var im := CuUI.atlas_img(spec.file, spec.avatar)
			CuUI.fill(im); av.add_child(im)
		b.add_child(av)
		var nl := CuUI.lbl(str(n.name), int(CuUI.cq(1.05)), Color("#4b3b25"), on, HORIZONTAL_ALIGNMENT_CENTER)
		CuUI.place(nl, 0, asz + 6, CuUI.W * 0.083, CuUI.cq(1.5))
		b.add_child(nl)
		col.add_child(b)
	shell.add_child(sc)

## 原版 controls(locked)：右侧操作钮
static func _controls(h: Node, shell: Control, locked: bool, sel) -> void:
	var s: Dictionary = h.state()
	var letter := _is_letter(h)
	var p = s.get("pending")
	var picker: bool = _kind == "gift" or (p is Dictionary and p.get("action") == "C02")
	var why := ""
	var b: Button
	var pic: Control
	var title: String
	var sub: String
	var act: String
	var fee: String
	if letter:
		why = str(CuCore.availability(s, CuDB.action("C01"), {"recipient": sel.name if sel else null}))
		b = CuUI.btn("", "mail-send", "")
		b.disabled = locked or sel == null or why != ""
		pic = CuUI.icon(5)
		title = "送信"; sub = ("寄给 %s 的近况信" % sel.name) if sel else "请选择左侧可接信人物"; act = "确认寄出"; fee = "确认寄出 · 记入本期往来"
	else:
		b = CuUI.btn("", "mail-open-bag" if picker else "mail-select", "C02")
		b.disabled = locked or (picker and sel == null)
		pic = CuUI.img("assets/production/cultivation/mail-v7/pouch.png")
		title = "送物"; sub = "从包裹中挑选一份物品" if picker else "选择一位往来人物"; act = "选择物品" if picker else "选择人物"
		fee = "赠送一份物品" if picker else "自由往来 · 寄信或送物"
	_plain(b)
	_at(b, 69, 23, 18, 35)
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	CuUI.fill(col)
	pic.custom_minimum_size = Vector2(CuUI.cq(7.3), CuUI.cq(7.3))
	col.add_child(pic)
	col.add_child(CuUI.lbl(title, int(CuUI.cq(1.7)), Color("#4b3b25"), true, HORIZONTAL_ALIGNMENT_CENTER))
	col.add_child(CuUI.lbl(sub, int(CuUI.cq(1.0)), Color("#8b7753"), false, HORIZONTAL_ALIGNMENT_CENTER))
	var ab := CuUI.panel_box(CuUI.box(Color("#7c9478"), Color(0, 0, 0, 0), 0, int(CuUI.cq(0.6)), 8))
	ab.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ab.add_child(CuUI.lbl(act, int(CuUI.cq(1.3)), Color("#fff0c6"), true, HORIZONTAL_ALIGNMENT_CENTER))
	col.add_child(ab)
	b.add_child(col)
	if b.disabled: b.modulate.a = 0.55
	shell.add_child(b)
	var fl := CuUI.lbl(fee, int(CuUI.cq(0.96)), Color("#8a7754"), false, HORIZONTAL_ALIGNMENT_CENTER)
	_at(fl, 69, 61, 18, 3)
	shell.add_child(fl)
	if letter and not locked and why != "":
		var w := CuUI.para(why, int(CuUI.cq(1.0)), Color("#996647"), CuUI.W * 0.18)
		w.position = Vector2(CuUI.W * 0.69, CuUI.H * 0.66)
		shell.add_child(w)

## 原版 inbox(s)：回信收件箱（倒序）
static func _inbox(_h: Node, shell: Control, s: Dictionary) -> void:
	var res: Dictionary = CuCore.D().resources
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_at(sc, 13, 24, 77, 61)
	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	col.add_theme_constant_override("separation", 12)
	sc.add_child(col)
	col.add_child(CuUI.lbl("回信与回物", int(CuUI.cq(1.8)), Color("#4b3b25"), true))
	var letters := []
	for l in s.letters: if not str(l.id).begins_with("notice-"): letters.append(l)
	letters.reverse()
	var w := CuUI.W * 0.77 - 40
	var fs := int(CuUI.cq(1.15))
	if letters.is_empty(): col.add_child(CuUI.para("暂时没有往来回信。寄信或送物后，下一期到达。", fs, Color("#5c4931"), w))
	for l in letters:
		var due: bool = int(l.due) <= CuCore.period(s)
		var box := CuUI.panel_box(CuUI.box(Color("#faf4e7e8"), Color("#c3b293"), 1, 2, 14))
		var c2 := VBoxContainer.new()
		box.add_child(c2)
		var hd := HBoxContainer.new()
		var who := CuUI.lbl("%s · %s" % [str(l.get("author")) if l.get("author") else str(l.get("recipient")), ("已读" if l.get("read") else "新回信") if due else "在途"], fs, Color("#4b3b25"), true)
		who.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hd.add_child(who)
		hd.add_child(CuUI.lbl(str(res.get(l.gift, l.gift)) if l.get("gift") else "近况信", fs, Color("#8b7753")))
		c2.add_child(hd)
		if due:
			var body := CuUI.para(str(l.get("body", "")), fs, Color("#3f3020"), w - 30)
			body.add_theme_constant_override("line_spacing", int(fs * 0.8))
			c2.add_child(body)
			var rets: Dictionary = l.get("returnItems", {}) if l.get("returnItems") is Dictionary else {}
			if rets.size():
				var parts := []
				for k in rets: parts.append("%s ×%s" % [res.get(k, k), str(rets[k])])
				c2.add_child(CuUI.para(("已收下" if l.get("returnClaimed") else "随信附") + "：" + "、".join(parts), fs, Color("#3d6a46"), w - 30))
			if not l.get("read") or (rets.size() and not l.get("returnClaimed")):
				var b := CuUI.btn("阅读并收下回物" if rets.size() else "阅读回信", "mail-read", l.id)
				b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
				c2.add_child(b)
		else:
			c2.add_child(CuUI.para("下一期送达；还不能阅读或领取。", fs, Color("#8b7753"), w - 30))
		col.add_child(box)
	shell.add_child(sc)

## 原版 kind==='motion'：.cu-training-frame.cu-mail-motion（left 27% top 23% w33% h58%）
static func _motion(h: Node, shell: Control, p: Dictionary) -> void:
	var fr := CuUI.panel_box(CuUI.box(Color("#eadbb6cc"), Color("#aa9264"), 1))
	fr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_at(fr, 27, 23, 33, 58)
	shell.add_child(fr)
	var area := Control.new()
	area.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fr.add_child(area)
	var clip := CuClip.new().setup(str(p.action))
	var an = p.get("animation")
	clip.playing = an is Dictionary and not an.done
	clip.finished = an is Dictionary and an.done
	var sz := fr.size
	CuUI.place(clip, sz.x * 0.2, sz.y * 0.08, sz.x * 0.6, sz.y * 0.72)
	area.add_child(clip)
	var l := CuUI.lbl("封好近况信" if p.action == "C01" else "包扎赠送物品", int(CuUI.cq(1.2)), Color("#5c4931"), false, HORIZONTAL_ALIGNMENT_CENTER)
	CuUI.place(l, 0, sz.y * 0.84, sz.x, CuUI.cq(1.8))
	area.add_child(l)
	var board := Control.new()
	board.set_meta("clip", clip)
	h.ui.board = board
	shell.add_child(board)

## 原版 kind==='result'：.cu-mail-receipt 回执
static func _receipt(_h: Node, shell: Control, s: Dictionary, p: Dictionary) -> void:
	var r: Dictionary = p.result
	var g: bool = p.action == "C02"
	var res: Dictionary = CuCore.D().resources
	var box := CuUI.panel_box(CuUI.box(Color("#f6ecd5f2"), Color("#b6a07a"), 1, 4, 24))
	_at(box, 27, 20, 33, 65)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	box.add_child(col)
	var seal := CuUI.panel_box(CuUI.box(Color("#a8402e"), Color(0, 0, 0, 0), 0, 4, 6))
	seal.add_child(CuUI.lbl("托送" if g else "寄出", int(CuUI.cq(1.1)), Color("#fff1d8"), true))
	seal.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	col.add_child(seal)
	var fs := int(CuUI.cq(1.05))
	var w := CuUI.W * 0.33 - 60
	col.add_child(CuUI.para(str(r.get("feedback", "")) if g else "信已寄出", int(CuUI.cq(1.8)), Color("#4b3b25"), w, true))
	if g:
		var n := int(s.resources.get(r.gift, 0))
		col.add_child(CuUI.para("%s %d → %d" % [res.get(r.gift, r.gift), n + 1, n], fs, Color("#8b7450"), w))
	else:
		col.add_child(CuUI.para("近况信已寄给%s。" % str(r.get("recipient") if r.get("recipient") else (p.get("recipient") if p.get("recipient") else "陆衡")), fs, Color("#8b7450"), w))
	col.add_child(CuUI.para(("本期通信成果 +" + str(r.gain)) if r.get("gain") else "本期通信成果已记录", fs, Color("#8b7450"), w))
	var rel = r.get("relationship")
	if rel is Dictionary:
		var rr: Dictionary = rel.relation
		col.add_child(CuUI.para("关系 +%s · %s %s / %s" % [str(rel.delta), rr.stage, str(rr.score), str(rr.cap)], fs, Color("#8b7450"), w))
		col.add_child(CuUI.para("%s · %s" % [str(rel.get("reason")) if rel.get("reason") else "日常往来已记录", str(rr.get("requirement", ""))], fs, Color("#8b7450"), w))
	var has_ret: bool = rel is Dictionary and rel.get("returns") is Dictionary and rel.returns.size() > 0
	col.add_child(CuUI.para("下一期查看对方回信%s。" % ("与回物" if has_ret else ""), fs, Color("#8b7450"), w))
	var b := CuUI.btn("继续", "result-close")
	var gb := CuUI.box(Color("#7d9375"), Color("#697f63"), 1, 4)
	gb.content_margin_left = 24; gb.content_margin_right = 24; gb.content_margin_top = 8; gb.content_margin_bottom = 8
	for k in ["normal", "hover", "pressed"]: b.add_theme_stylebox_override(k, gb)
	for k in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]: b.add_theme_color_override(k, Color("#fff0c6"))
	b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	col.add_child(b)
	shell.add_child(box)

## 原版 openBag()：包裹弹窗（left 7% top 20% w87% h59.2%）
static func open_bag(h: Node) -> bool:
	var who = person(h)
	if _kind != "gift" or who == null or opened or h.state().get("pending"): return false
	opened = true; query = ""; filter = "全部"; page = 0
	if is_instance_valid(_shell): _set_inert(_shell, true)
	var bag := Control.new()
	bag.name = "cu-mail-bag"
	bag.set_meta("dialog", true)
	CuUI.fill(bag)
	h.root.add_child(bag)
	_bag = bag
	var back := ColorRect.new()
	back.color = Color("#312d236e")
	CuUI.fill(back)
	back.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: close_bag(h))
	bag.add_child(back)
	var paper := CuUI.img(BASE + "paper-panel.png", TextureRect.STRETCH_SCALE)
	_at(paper, 7, 20, 87, 59.2)
	paper.mouse_filter = Control.MOUSE_FILTER_STOP
	bag.add_child(paper)
	var body := Control.new()
	body.name = "body"
	body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_at(body, 7, 20, 87, 59.2)
	bag.add_child(body)
	var bw := body.size.x
	var bh := body.size.y
	var head := HBoxContainer.new()
	CuUI.place(head, bw * 0.05, bh * 0.04, bw * 0.9, bh * 0.12)
	head.add_theme_constant_override("separation", 20)
	head.add_child(CuUI.lbl("包裹", int(CuUI.cq(2)), Color("#4b3b25"), true))
	var sub := CuUI.lbl("赠予 · " + str(who.name), int(CuUI.cq(1.1)), Color("#8b7753"))
	sub.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(sub)
	head.add_child(_plain(CuUI.btn("×", "mail-bag-close")))
	body.add_child(head)
	var tools := HBoxContainer.new()
	tools.add_theme_constant_override("separation", 18)
	CuUI.place(tools, bw * 0.05, bh * 0.18, bw * 0.9, bh * 0.085)
	tools.add_child(CuUI.lbl("搜索", int(CuUI.cq(1.0)), Color("#5c4931")))
	var inp := LineEdit.new()
	inp.placeholder_text = "输入物品名称"
	inp.max_length = 80
	inp.custom_minimum_size = Vector2(CuUI.cq(22), CuUI.cq(2.35))
	inp.add_theme_stylebox_override("normal", CuUI.box(Color("#f4e9cf"), Color("#b7a176"), 1, 2, 6))
	inp.add_theme_color_override("font_color", Color("#3f3020"))
	inp.text_changed.connect(func(t: String): query = t.substr(0, 80); page = 0; refresh_bag(h))
	tools.add_child(inp)
	tools.add_child(CuUI.lbl("分类", int(CuUI.cq(1.0)), Color("#5c4931")))
	var sel := OptionButton.new()
	for c in CATEGORIES: sel.add_item(c)
	sel.custom_minimum_size = Vector2(CuUI.cq(10), CuUI.cq(2.35))
	sel.item_selected.connect(func(i: int): filter = CATEGORIES[i]; page = 0; refresh_bag(h))
	tools.add_child(sel)
	var cnt := CuUI.lbl("", int(CuUI.cq(1.0)), Color("#8b7753"))
	cnt.name = "count"
	tools.add_child(cnt)
	body.add_child(tools)
	var grid := GridContainer.new()
	grid.name = "grid"
	grid.columns = 12
	grid.add_theme_constant_override("h_separation", int(CuUI.cq(0.55)))
	grid.add_theme_constant_override("v_separation", int(CuUI.cq(0.55)))
	CuUI.place(grid, bw * 0.05, bh * 0.29, bw * 0.9, bh * 0.55)
	body.add_child(grid)
	var empty := VBoxContainer.new()
	empty.name = "empty"
	CuUI.place(empty, bw * 0.05, bh * 0.45, bw * 0.9, bh * 0.2)
	body.add_child(empty)
	var foot := HBoxContainer.new()
	CuUI.place(foot, bw * 0.05, bh * 0.88, bw * 0.9, bh * 0.07)
	var s: Dictionary = h.state()
	var cr := str(CuCore.contactReason(s, "C02", who.name))
	var tip := cr if cr != "" and cr != "<null>" else ("体力不足 · 当前%d / 需要%d" % [int(s.energy), cost("C02")] if int(s.energy) < cost("C02") else "点击赠送1份；卡片显示实际关系增量，达到瓶颈时不会提升")
	var tl := CuUI.lbl(tip, int(CuUI.cq(0.95)), Color("#8b7753"))
	tl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	foot.add_child(tl)
	var pager := HBoxContainer.new()
	pager.name = "pager"
	foot.add_child(pager)
	foot.add_child(CuUI.btn("取消", "mail-bag-close"))
	body.add_child(foot)
	refresh_bag(h)
	inp.grab_focus.call_deferred()
	return true

## 原版 refreshBag()：格子、计数、空提示、翻页
static func refresh_bag(h: Node) -> void:
	if not is_instance_valid(_bag): return
	var body: Control = _bag.get_node("body")
	var rows := inventory(h.state(), G.S)
	var c := bag_page(rows, query, filter, page)
	page = c.page
	var grid: GridContainer = body.get_node("grid")
	for n in grid.get_children(): n.queue_free()
	var who = person(h)
	var cw := (grid.size.x - CuUI.cq(0.55) * 11) / 12.0
	var ch := (grid.size.y - CuUI.cq(0.55) * 2) / 3.0
	for i in c.visible:
		var why := reason(h, i)
		var est = CuCore.giftPreview(h.state(), who.name, i.id) if i.gift and who != null else null
		var b := CuUI.btn("", "gift-item", i.id)
		b.custom_minimum_size = Vector2(cw, ch)
		var sb := CuUI.box(Color("#f8efdbcc"), Color("#c3b293"), 1, 3)
		for k in ["normal", "hover", "pressed", "disabled", "focus"]: b.add_theme_stylebox_override(k, sb)
		b.disabled = why != ""
		b.tooltip_text = str(i.name) + ("：" + why if why != "" else "")
		if i.has("image"):
			var im := CuUI.img(i.image)
			CuUI.place(im, (cw - CuUI.cq(3.35)) / 2, ch * 0.08, CuUI.cq(3.35), CuUI.cq(3.35))
			b.add_child(im)
		var nl := CuUI.lbl(str(i.name), int(CuUI.cq(0.85)), Color("#4b3b25"), false, HORIZONTAL_ALIGNMENT_CENTER)
		nl.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
		CuUI.place(nl, 2, ch * 0.7, cw - 4, CuUI.cq(1.2))
		b.add_child(nl)
		var ql := CuUI.lbl(str(i.qty) + (" · 关系 +%s" % str(est.delta) if est is Dictionary and est.has("delta") else ""), int(CuUI.cq(0.7)), Color("#6b5a40"), false, HORIZONTAL_ALIGNMENT_RIGHT)
		CuUI.place(ql, 2, 2, cw - 6, CuUI.cq(1.0))
		b.add_child(ql)
		if why != "": b.modulate.a = 0.55
		grid.add_child(b)
	for _j in PAGE_SIZE - c.visible.size():
		var e := Panel.new()
		e.add_theme_stylebox_override("panel", CuUI.box(Color("#efe4c866"), Color("#d4c4a0"), 1, 3))
		e.custom_minimum_size = Vector2(cw, ch)
		e.mouse_filter = Control.MOUSE_FILTER_IGNORE
		grid.add_child(e)
	var cnt: Label = body.get_node("tools/count") if body.has_node("tools/count") else _find(body, "count")
	if cnt: cnt.text = "%d 件 · 每页36格" % c.total
	var empty: VBoxContainer = body.get_node("empty")
	for n in empty.get_children(): n.queue_free()
	var stocked := false
	for i in rows: if i.qty > 0: stocked = true
	empty.visible = not (c.total > 0 and stocked)
	if empty.visible:
		empty.add_child(CuUI.lbl("没有匹配的物品" if stocked else "包裹里没有物品", int(CuUI.cq(1.1)), Color("#8b7753"), false, HORIZONTAL_ALIGNMENT_CENTER))
		if stocked:
			var cb := CuUI.btn("清空条件", "mail-bag-clear")
			cb.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
			empty.add_child(cb)
	var pager: HBoxContainer = _find(body, "pager")
	for n in pager.get_children(): n.queue_free()
	pager.visible = c.pages > 1
	var pv := _plain(CuUI.btn("‹", "mail-bag-prev")); pv.disabled = c.page == 0
	var nx := _plain(CuUI.btn("›", "mail-bag-next")); nx.disabled = c.page == c.pages - 1
	pager.add_child(pv)
	pager.add_child(CuUI.lbl("%d / %d" % [c.page + 1, c.pages], int(CuUI.cq(1.0)), Color("#5c4931")))
	pager.add_child(nx)

static func _find(n: Node, nm: String) -> Node:
	if n.name == nm: return n
	for c in n.get_children():
		var r := _find(c, nm)
		if r != null: return r
	return null
