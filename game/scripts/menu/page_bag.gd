extends RefCounted
## 行囊页。对应原版 js/qihe-jianghu-ui.js 的 bagPage / inventory / renderGrid / renderItemAction / showItemDetails / chooseSlot，
## click 分支 category / slotFilter / resetFilter / item / itemDetail / itemCommit / learn，以及 onKey 方向键分支。
## 样式照 qihe-jianghu-ui.css 的 .qj-inventory、.qj-bag-tools、.qj-grid-scroll、.qj-item、.qj-item-action。
## 原版网格是虚拟滚动（只渲染可见行）；这里物品数有限，直接全部生成，格高、列数公式照抄。

const K := preload("res://scripts/menu/kit.gd")
const PS := preload("res://scripts/menu/page_skill.gd")
const CATS := ["全部", "装备", "秘籍", "药食", "材料", "要物", "其他"]
const SUBS := [[null, "全部"], ["weapon", "兵器"], ["armor", "护具"], ["acc", "佩饰"]]
const SLOT_LABEL := {"weapon": "兵器", "armor": "护具", "acc": "佩饰"}
const CELL := 92
const INNER_W := 690.0    # 2026-11-06：左「行囊」面板网格可用宽（队员列 + 右详情栏之后）

## inventory()：category = s.slot || s.category
static func items(m) -> Array:
	return QJModel.inventory(QJModel.current(), {"category": m.s.slot if m.s.slot != null else m.s.category, "search": m.s.search, "sort": m.s.sort})

static func cols() -> int:
	return clampi(floori(INNER_W / CELL), 3, 12)

static func build(m, _v: Dictionary) -> Control:
	var list := items(m)
	if m.s.selected != null and not list.any(func(i): return i.id == m.s.selected): m.s.selected = null
	# 2026-11-06 重设计（preview-v3 行囊页）：左「行囊 · N 种」（工具条、分类、网格），右「器物详情」（说明、效果、操作、银两）；
	# 使用对象就是外壳左列选中的人（原工具条的“使用对象”下拉去掉）
	var root := K.margin(10, 24, 30, 14)
	var row := K.hbox(16)
	root.add_child(row)
	var col := K.vbox(0)
	var left := K.titled("行囊 · %d 种" % list.size(), col); K.expand(left, 64, true, true)
	row.add_child(left)
	col.add_child(_tools(m, list.size()))
	var cats := K.hbox(4)
	var cw := K.margin(0, 8, 0, 8); cw.add_child(cats)
	for c in CATS:
		var cb := K.btn(c, "category", {"id": c}, "cat_on" if m.s.category == c else "cat", 14, [10, 5, 10, 5], 36)
		cb.custom_minimum_size.x = 52
		cats.add_child(cb)
	col.add_child(cw)
	if m.s.category == "装备":
		var sub := K.hbox(8)
		var sw := K.margin(0, 0, 0, 8); sw.add_child(sub)
		for t in SUBS: sub.add_child(K.btn(t[1], "slotFilter", {"id": t[0] if t[0] else ""}, "on" if m.s.slot == t[0] else "", 12, [12, 3, 12, 3], 32))
		col.add_child(sw)
	col.add_child(_grid(m, list))
	var right := K.titled("器物详情", _detail(m)); K.expand(right, 36, true, true)
	row.add_child(right)
	return root

# ───────── 工具条：搜索 | 排序 | 使用对象 | N 类器物 ─────────
static func _tools(m, _n: int) -> Control:
	var p := K.panel(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.4), [0, 0, 0, 1], [0, 0, 0, 8])
	var row := K.hbox(18)
	p.add_child(row)
	var search := LineEdit.new()
	search.name = "qj-search"
	search.placeholder_text = "查找器物"
	search.text = m.s.search
	search.custom_minimum_size = Vector2(200, 34)
	K.expand(search)
	_style_input(search)
	# .qj-search 前置「⌕」24px，输入框自 x+24 起
	var sst := K.sb(Color("#f8f2df88"), Color("#8e7f60"), [0, 0, 0, 1], 0, [24, 7, 7, 7])
	for k in ["normal", "focus"]: search.add_theme_stylebox_override(k, sst)
	var glass := K.lab("⌕", 24, K.INK); glass.position = Vector2(0, -1)
	search.add_child(glass)
	search.text_changed.connect(func(t):
		m.s.search = t; m.s.selected = null; m.s.scroll = 0; m.s["_refocus"] = "qj-search"
		m.draw.call_deferred())
	row.add_child(search)
	var sort := OptionButton.new()
	var sorts := [["name", "名称"], ["count", "数量"], ["category", "类别"]]
	for i in sorts.size():
		sort.add_item(sorts[i][1], i)
		if m.s.sort == sorts[i][0]: sort.select(i)
	sort.item_selected.connect(func(i): m.s.sort = sorts[i][0]; m.s.scroll = 0; m.draw())
	row.add_child(_labeled("排序", sort))
	return p

static func _style_input(c: Control) -> void:
	c.add_theme_font_override("font", UI.song); c.add_theme_font_size_override("font_size", 13)
	var st := K.sb(Color("#f8f2df88"), Color("#8e7f60"), [0, 0, 0, 1], 0, [7, 7, 7, 7])
	for k in ["normal", "focus", "hover", "pressed"]: c.add_theme_stylebox_override(k, st)
	for k in ["font_color", "font_hover_color", "font_focus_color", "font_pressed_color"]: c.add_theme_color_override(k, Color("#413b2e"))
	if c is LineEdit: c.add_theme_color_override("font_placeholder_color", Color("#8b8170"))

static func _labeled(t: String, c: Control) -> Control:
	var h := K.hbox(8)
	var l := K.lab(t, 12); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(l)
	_style_input(c)
	c.custom_minimum_size = Vector2(maxf(0, (84.0 if t == "排序" else 108.0) - 32), 31)
	h.add_child(c)
	return h

# ───────── 网格 .qj-grid-scroll / .qj-item ─────────
static func _grid(m, list: Array) -> Control:
	var wrap := K.panel(Color(0, 0, 0, 0))
	K.expand(wrap, 1, true, true)
	if list.is_empty():
		var e := K.vbox(10); e.alignment = BoxContainer.ALIGNMENT_CENTER
		var t := K.lab("没有匹配的器物", 15, Color("#6d6251")); t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		e.add_child(t)
		var r := K.hbox(0); r.alignment = BoxContainer.ALIGNMENT_CENTER
		r.add_child(K.btn("清空筛选", "resetFilter"))
		e.add_child(r)
		wrap.add_child(e)
		return wrap
	var sc := K.scroll()
	sc.name = "qj-grid-scroll"
	wrap.add_child(sc)
	var n := cols()
	var g := K.grid(n, 0, 0)
	K.expand(g)
	sc.add_child(g)
	sc.set_meta("cols", n)
	for i in list.size(): g.add_child(_cell(m, list[i], i))
	sc.ready.connect(func(): sc.scroll_vertical = int(m.s.scroll))
	sc.get_v_scroll_bar().value_changed.connect(func(x): m.s.scroll = x)
	return wrap

static func _cell(m, it: Dictionary, i: int) -> Control:
	var holder := K.margin(3, 0, 3, 6)
	K.expand(holder)
	var on: bool = it.id == m.s.selected
	var c := K.card("item", {"id": it.id, "index": i, "tip": "item:" + it.id}, true, 2,
		K.sb(Color("#fbf8eff0"), Color(K.FRAME_LINE, 0.45), [1, 1, 1, 1], 3), K.sb(Color("#efe4c9"), Color("#967439"), [1, 1, 1, 1], 3),
		K.sb(Color("#f6e3d8"), Color("#b0443a"), [2, 2, 2, 2], 3), [4, 6, 4, 4])
	c.on = on
	c.custom_minimum_size.y = 86
	var box := K.content(c)
	if it.known:
		box.add_child(K.item_icon(it.id, 48))
	else:
		var q := K.lab("?", 30, Color("#6d6251")); q.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		box.add_child(q)
	var nm := K.lab(str(it.name) if it.known else "暂无法识别", 12, K.INK)
	nm.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; nm.clip_text = true; nm.custom_minimum_size.x = 10
	box.add_child(nm)
	var cnt := K.lab(str(it.count), 12, Color("#524831"), true)
	c.add_child(cnt)
	c.resized.connect(func(): cnt.reset_size(); cnt.position = Vector2(c.size.x - cnt.size.x - 6, 4))
	holder.add_child(c)
	return holder

# ───────── 操作条 renderItemAction() ─────────
static func commit_label(m, it: Dictionary, drawer := false) -> String:
	var nm: String = m.actor().name
	if it.action == "equip": return "装备给" + nm
	if it.action == "learnFromItem" or it.action == "learnManual": return "参悟秘籍" if drawer else "由%s参悟" % nm
	return "对%s使用 1 份" % nm

## 方案二：没选器物时，右栏显示行囊概览（各类几种几件、可给当前人物用的药食），点了直接跳分类或选中
static func _overview(m) -> Control:
	var b := K.vbox(8)
	var who: String = m.actor().name
	b.add_child(K.lab("行囊概览", 17, K.INK, true, 3))
	var g := K.grid(2, 10, 6)
	for c in CATS.slice(1):
		var l: Array = QJModel.inventory(QJModel.current(), {"category": c, "search": "", "sort": "count"})
		var n := 0
		for it in l: n += int(it.get("count", 0))
		var card := K.card("category", {"id": c}, false, 6, K.sb(Color("#f3ecd9b0"), Color(K.line_col(), 0.35), [1, 1, 1, 1], 3), null, null, [10, 5, 10, 5])
		K.expand(card)
		var box := K.content(card)
		box.add_child(K.expand(K.lab(c, 14, K.INK)))
		box.add_child(K.lab("%d 种 · %d 件" % [l.size(), n] if l.size() else "无", 13, Color("#5d4a2c") if l.size() else Color("#a39a86"), true))
		g.add_child(card)
	b.add_child(g)
	b.add_child(K.rule(Color(K.line_col(), 0.4)))
	b.add_child(K.lab("可给%s用的药食" % who, 14, K.INK, true, 2))
	var row := K.hbox(6)
	var shown := 0
	for it in QJModel.inventory(QJModel.current(), {"category": "药食", "search": "", "sort": "count"}):
		if shown >= 5: break
		shown += 1
		var c := K.card("item", {"id": it.id, "tip": "item:" + it.id}, true, 2, null, null, null, [3, 3, 3, 3])
		c.custom_minimum_size.x = 60
		var bx := K.content(c)
		bx.add_child(K.item_icon(it.id, 40))
		var nl := K.lab("%s ×%s" % [it.name, it.count], 11); nl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; nl.clip_text = true; nl.custom_minimum_size.x = 58
		bx.add_child(nl)
		row.add_child(c)
	if shown == 0: b.add_child(K.lab("暂无药食", 13, Color("#8b8170")))
	else: b.add_child(row)
	b.add_child(K.expand(K.spacer(), 1, false, true))
	var tip := K.lab("点左侧器物看详情", 12, Color("#8b8170")); tip.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.add_child(tip)
	K.expand(b, 1, false, true)
	return b

## 右栏「器物详情」：选中器物的说明、效果、原因，操作按钮在下；底部银两
static func _detail(m) -> Control:
	var col := K.vbox(10)
	var body := K.vbox(10); K.expand(body, 1, false, true)
	col.add_child(body)
	if m.s.selected == null and m.FILL:
		body.add_child(_overview(m))
	elif m.s.selected == null:
		var l := K.lab("选择器物查看详情", 15, Color("#6d6251")); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.size_flags_vertical = Control.SIZE_EXPAND_FILL; l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		body.add_child(l)
	else:
		var it := QJModel.inspect(QJModel.current(), m.s.actor, str(m.s.selected))
		var hd := K.hbox(12)
		var ib := K.panel(Color("#fbf8ef"), Color(K.FRAME_LINE, 0.5), [1, 1, 1, 1], [6, 6, 6, 6]); ib.add_child(K.item_icon(it.id, 72))
		hd.add_child(ib)
		var ht := K.vbox(4); ht.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		ht.add_child(K.lab(it.name, 21, K.INK, true, 2))
		ht.add_child(K.lab("%s%s · 持有 %s" % [it.category if it.get("category") else "器物", (" · " + str(it.grade)) if it.get("grade") else "", it.get("count", 0)], 12, Color("#7d6440"), false, 1))
		hd.add_child(ht)
		body.add_child(hd)
		body.add_child(K.rule(Color(K.FRAME_LINE, 0.4)))
		body.add_child(K.para(it.desc if it.get("desc") else "暂无详细记录", 14, K.INK, 1.65))
		if it.action == "useItem" and not DB.ITEMS.get(it.id, {}).get("gall") and (it.get("heal") or it.get("mp")):
			body.add_child(K.lab("效果：气血 +%s · 内力 +%s" % [it.get("heal", 0) if it.get("heal") else 0, it.get("mp", 0) if it.get("mp") else 0], 14, Color("#a8352a"), true))
		var ds: Array = it.get("deltas", []).filter(func(x): return x.delta)
		for x in ds:
			var r := K.hbox(8)
			r.add_child(K.expand(K.lab(x.name, 13)))
			r.add_child(K.lab("%s → %s" % [x.before, x.after], 13, K.INK, true))
			r.add_child(K.lab(("▲" if x.delta > 0 else "▼") + str(absi(int(x.delta))), 13, Color("#347153") if x.delta > 0 else Color("#9a483d"), true))
			body.add_child(r)
		if not it.allowed and it.reason: body.add_child(K.para(it.reason, 13, Color("#a2402f"), 1.6))
		var acts := K.hbox(10); acts.alignment = BoxContainer.ALIGNMENT_END
		if it.action:
			var b := K.btn(commit_label(m, it), "itemCommit", {}, "primary", 14, [16, 6, 16, 6], 38)
			if not it.allowed: b.modulate.a = 0.55
			b.disabled = m.s.busy
			acts.add_child(b)
		acts.add_child(K.btn("查看详情", "itemDetail", {"id": it.id}, "", 14, [14, 6, 14, 6], 38))
		col.add_child(acts)
	var foot := K.panel(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.4), [0, 1, 0, 0], [0, 8, 0, 0])
	var fr := K.hbox(8); foot.add_child(fr)
	fr.add_child(K.lab("银两", 14, Color("#5d5340")))
	fr.add_child(K.lab("%d 两" % int(G.S.get("silver", 0)), 15, K.INK, true))
	col.add_child(foot)
	return col

## showItemDetails(id, touch)：抽屉；touch 时页脚附执行按钮
static func show_details(m, id: String, touch := false) -> void:
	var it := QJModel.inspect(QJModel.current(), m.s.actor, id)
	var acts := []
	if touch and it.action: acts.append([commit_label(m, it, true), "itemCommit", {}, "primary"])
	m.detail(it.name, func(_mm): return PS.item_details(it), acts)

## chooseSlot(slot)：压栈后切到行囊「装备」分类、该部位
static func choose_slot(m, slot: String) -> void:
	m.push_stack()
	m.s.detail = null; m.s.page = "bag"; m.s.category = "装备"; m.s.search = ""; m.s.slot = slot; m.s.selected = null; m.s.scroll = 0
	m.draw()
	m.notify("为%s选择%s" % [m.actor().name, SLOT_LABEL[slot]])

# ───────── 点击 ─────────
static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	match act:
		"category":
			m.s.category = id; m.s.slot = null; m.s.selected = null; m.s.scroll = 0; m.draw()
		"slotFilter":
			m.s.slot = id if id else null; m.s.selected = null; m.s.scroll = 0; m.draw()
		"resetFilter":
			m.s.category = "全部"; m.s.slot = null; m.s.search = ""; m.s.scroll = 0; m.draw()
		"item":
			m.s.selected = id
			m.s["_refocus"] = {"qj": "item", "id": id}
			m.draw()
		"itemDetail":
			if m.s.page == "skill":
				m.s.skillId = id; m.draw()
			else: show_details(m, id)
		"itemCommit": item_commit(m)
		"learn":
			var it := QJModel.inspect(QJModel.current(), m.s.actor, str(m.s.selected))
			var target = null
			for k in it.learnTargets:
				if k is Dictionary and k.get("id") == id: target = k
			if target and target.get("reason"):
				m.notify(target.reason); return true
			m.confirm("消耗一份%s，由%s参悟？" % [it.name, m.actor().name], func(): m.commit("learnFromItem", {"itemId": m.s.selected, "skillId": id}))
		_: return false
	return true

## itemCommit：不可用提示；秘籍弹「选择参悟招式」；其余确认后 commit(action)
static func item_commit(m) -> void:
	if m.s.selected == null: return
	var it := QJModel.inspect(QJModel.current(), m.s.actor, str(m.s.selected))
	if not it.allowed:
		m.notify(it.reason if it.reason else "当前不可使用"); return
	if it.action == "learnFromItem":
		var list: Array = it.learnTargets
		m.detail("选择参悟招式", func(_mm):
			var b := K.vbox(8)
			for k in list:
				var kid: String = k.id if k is Dictionary else str(k)
				var nm: String = str(k.get("name", kid)) if k is Dictionary else kid
				var why: String = str(k.get("reason", "")) if k is Dictionary and k.get("reason") else ""
				var bt := K.btn(nm + ("  " + why if why != "" else ""), "learn", {"id": kid}, "", 15)
				bt.alignment = HORIZONTAL_ALIGNMENT_LEFT
				if why != "": bt.modulate.a = 0.55
				b.add_child(bt)
			if list.is_empty(): b.add_child(K.para("没有符合条件的招式。"))
			return b)
		return
	var tail := ""
	if it.action == "useItem":
		tail = "，消耗 1 份" + ("（实际恢复气血 %s、内力 %s）" % [it.get("heal", 0) if it.get("heal") else 0, it.get("mp", 0) if it.get("mp") else 0] if it.get("heal") or it.get("mp") else "")
	var sel: String = m.s.selected
	if it.action == "learnManual":
		m.confirm("由%s参悟《%s》？书不会消失，学会后去学艺里照书独练。" % [m.actor().name, str(it.name).trim_prefix("《").trim_suffix("》")], func(): m.commit("learnManual", {"itemId": sel}))
		return
	m.confirm("%s「%s」给%s%s？" % ["装备" if it.action == "equip" else "使用", it.name, m.actor().name, tail], func(): m.commit(it.action, {"itemId": sel}))

## 方向键：焦点在物品格时左右 ±1、上下 ±cols
static func arrow(m, fo: Control, k: int) -> bool:
	if fo == null or not fo.has_meta("qj") or fo.get_meta("qj") != "item": return false
	var n := items(m).size()
	if n == 0: return true
	var c := cols()
	var at := int(fo.get_meta("index"))
	var d: int = {KEY_LEFT: -1, KEY_RIGHT: 1, KEY_UP: -c, KEY_DOWN: c}[k]
	var nxt := clampi(at + d, 0, n - 1)
	for x in m.panel.find_children("*", "QJCard", true, false):
		if x.get_meta("qj", "") == "item" and int(x.get_meta("index", -1)) == nxt:
			x.grab_focus()
			var sc = m.panel.find_child("qj-grid-scroll", true, false)
			if sc: sc.ensure_control_visible(x)
	return true

static func after_draw(m) -> void:
	PS.after_draw(m)
