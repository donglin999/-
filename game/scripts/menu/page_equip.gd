extends RefCounted
## 装备页。对应原版 js/qihe-jianghu-ui.js 的 equipPage / equipNumbers / equipList / renderEquipList / bindEquipment /
## wearEquipment / doubleClick，click 分支 equipSlot / equipPick / equipCategory / equipRemove，onKey 的 Enter 穿戴。
## 样式照 qihe-jianghu-ui.css 的 .qj-equip-v3（三栏 29fr / 31fr / 40fr，gap 18px，padding 16px 2.5%）。

const K := preload("res://scripts/menu/kit.gd")
const PS := preload("res://scripts/menu/page_skill.gd")
const PB := preload("res://scripts/menu/page_bag.gd")
const PP := preload("res://scripts/menu/page_party.gd")
const SLOT_LABEL := {"weapon": "兵器", "armor": "护具", "acc": "佩饰"}
const TYPES := ["all", "刀", "剑", "拳", "棍", "暗器", "音律"]

## equipList()
static func equip_list(m) -> Array:
	var list := QJModel.inventory(QJModel.current(), {"category": "装备", "search": m.s.equipSearch, "sort": m.s.equipSort})
	if m.s.equipCategory != "all": list = list.filter(func(k): return k.slot == m.s.equipCategory)
	if m.s.equipType != "all":
		list = list.filter(func(k):
			var w = DB.ITEMS.get(k.id, {}).get("weapon")
			return w != null and Stats.weapon_type(w.get("kind")) == m.s.equipType)
	return list

static func build(m, v: Dictionary) -> Control:
	if m.s.slot == null: m.s.slot = "weapon"
	# 2026-11-06 重设计（preview-v3 装备页）：人物数值 / 穿戴 / 包裹装备 三块题签面板；人物切换在外壳左列
	var root := K.margin(10, 24, 30, 14)
	var row := K.hbox(16)
	root.add_child(row)
	var a := K.titled("人物数值", _numbers(m, v)); K.expand(a, 330, true, true); row.add_child(a)
	var b := K.titled("穿戴", _person(m, v)); K.expand(b, 330, true, true); row.add_child(b)
	var c := K.titled("包裹装备", _bench(m)); K.expand(c, 470, true, true); row.add_child(c)
	return root

# ───────── 左栏 .qj-equip-numbers ─────────
static func _numbers(m, v: Dictionary) -> Control:
	var sc := K.scroll()
	var col := K.vbox(4)
	K.expand(col)
	sc.add_child(col)
	var h := K.hbox(10)
	h.add_child(K.lab(v.name, 24, K.INK, true, 4))
	var lv := K.lab("%s级 · %s" % [v.level if v.level else 1, v.role if v.role else "江湖同伴"], 13, Color("#5d5340")); lv.size_flags_vertical = Control.SIZE_SHRINK_END
	h.add_child(lv)
	col.add_child(h)
	var vt := K.vitals(v, true, 13); vt.add_theme_constant_override("separation", 5)
	var vm := K.margin(0, 4, 10, 4); vm.add_child(vt)
	col.add_child(vm)
	if v.get("relationship"):
		col.add_child(K.lab("♡ %s %s/100  当前阶段上限 %s" % [v.relationship.stage, v.relationship.score, v.relationship.get("cap", "")], 13))
	var st: Dictionary = v.derived.get("st", v.stats) if v.derived.get("st") else v.stats
	var main_rows := []
	for k in PP.DERIVED_LABEL: main_rows.append([k, PP.DERIVED_LABEL[k], v.derived.get(k, 0)])
	for k in m.STAT_LABEL: main_rows.append([k, m.STAT_LABEL[k], st.get(k, 0)])
	col.add_child(_grid(main_rows))
	col.add_child(_sec("兵器专精"))
	var zy := []
	for k in ["刀", "剑", "拳", "棍", "暗器", "音律"]: zy.append([k, k, v.zy.get(k, 0)])
	col.add_child(_grid(zy, 3))
	col.add_child(_sec("技艺"))
	col.add_child(_grid([["yi", "医术", v.ji.get("yi", 0)], ["du", "毒术", v.ji.get("du", 0)], ["shi", "武学常识", v.ji.get("shi", 0)]]))
	return sc

static func _sec(t: String) -> Control:
	var p := K.panel(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.4), [0, 1, 0, 0], [0, 8, 0, 2])
	p.add_child(K.lab(t, 14, K.INK, true, 2))
	return p

## 小图标数值表：图标 24、文字 13
static func _grid(rows: Array, cols := 2) -> Control:
	var g := K.grid(cols, 14, 3)
	for r in rows:
		var line := K.hbox(5)
		line.custom_minimum_size.y = 26
		K.expand(line)
		line.add_child(K.numeric(r[0], 24))
		var l := K.lab(r[1], 13); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		line.add_child(K.expand(l))
		var n := K.lab(str(r[2]) + ("%" if r[0] in ["crit", "dodge", "block"] else ""), 13, K.INK, true)
		n.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		line.add_child(n)
		g.add_child(line)
	return g

# ───────── 中栏 .qj-equip-person：立绘 + 三部位 + rosterStrip ─────────
static func _person(m, v: Dictionary) -> Control:
	var col := K.vbox(0)
	var art := K.portrait_view(v.id)
	K.expand(art, 1, true, true)
	art.clip_contents = true
	col.add_child(art)
	col.add_child(K.rule())
	var slots := K.hbox(8)
	var sw := K.margin(0, 12, 0, 12); sw.add_child(slots)
	for key in SLOT_LABEL:
		var id = v.equipment.get(key)
		var c := K.card("equipSlot", {"slot": key, "tip": ("item:" + id) if id else "slot:" + key}, true, 4, null, null,
			K.sb(Color("#ede0bf77"), Color("#94733e"), [0, 0, 0, 2]), [2, 6, 2, 6])
		c.on = key == m.s.slot
		K.expand(c)
		var box := K.content(c)
		box.add_child(K.item_icon(id, 56) if id else K.painted("slot", key, 56))
		var a := K.lab(SLOT_LABEL[key], 13); a.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; box.add_child(a)
		var b := K.lab(str(DB.ITEMS.get(id, {}).get("name", id)) if id else "未装备", 11, Color("#5d5340"))
		b.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; b.clip_text = true
		box.add_child(b)
		slots.add_child(c)
	col.add_child(sw)
	return col

# ───────── 右栏 .qj-equip-workbench ─────────
static func _bench(m) -> Control:
	# 实测：底 rgba(250,247,238,.93)，内容 x791（左 16）；标题 21px 高 30；搜索 y137 高 35；分类行 y181 高 64（签 47×40 12px）；
	# 筛选 y252 高 25；候选 y286；说明 y641 高 34
	var col := K.vbox(8)
	var p := col
	var search := LineEdit.new()
	search.name = "qj-equip-search"
	search.placeholder_text = "搜索装备"
	search.text = m.s.equipSearch
	search.add_theme_font_override("font", UI.song); search.add_theme_font_size_override("font_size", 13)
	search.custom_minimum_size.y = 35
	search.add_theme_stylebox_override("normal", K.sb(Color("#f8f2df88"), Color("#8e7f60"), [0, 0, 0, 1], 0, [24, 5, 8, 5]))
	search.add_theme_stylebox_override("focus", K.sb(Color("#fbf8ef"), Color("#a88a4e"), [0, 0, 0, 1], 0, [24, 5, 8, 5]))
	search.add_theme_color_override("font_color", K.INK)
	search.add_theme_color_override("font_placeholder_color", Color("#8b8170"))
	var glass := K.lab("⌕", 24, K.INK); glass.position = Vector2(0, -1)
	search.add_child(glass)
	search.text_changed.connect(func(t):
		m.s.equipSearch = t; m.s.selected = null; m.s.equipScroll = 0; m.hide_tip(); m.s["_refocus"] = "qj-equip-search"
		m.draw.call_deferred())
	col.add_child(search)
	var cats := K.hbox(5)
	for t in [["all", "全部"], ["weapon", "兵器"], ["armor", "护具"], ["acc", "佩饰"]]:
		var cb := K.btn(t[1], "equipCategory", {"id": t[0]}, "cat_on" if m.s.equipCategory == t[0] else "cat", 12, [10, 6, 10, 6], 40)
		cb.custom_minimum_size.x = 47
		cats.add_child(cb)
	var cm := K.margin(0, 0, 0, 2); cm.add_child(cats)
	col.add_child(cm)
	var f := K.hbox(10)
	var ty := OptionButton.new()
	for i in TYPES.size():
		ty.add_item("全部" if TYPES[i] == "all" else TYPES[i], i)
		if m.s.equipType == TYPES[i]: ty.select(i)
	ty.item_selected.connect(func(i): m.s.equipType = TYPES[i]; m.s.selected = null; m.s.equipScroll = 0; m.draw())
	f.add_child(_sel("兵器类型", ty))
	var so := OptionButton.new()
	var sorts := [["name", "名称"], ["count", "数量"]]
	for i in sorts.size():
		so.add_item(sorts[i][1], i)
		if m.s.equipSort == sorts[i][0]: so.select(i)
	so.item_selected.connect(func(i): m.s.equipSort = sorts[i][0]; m.s.equipScroll = 0; m.draw())
	f.add_child(_sel("排序", so))
	col.add_child(f)
	var sc := K.scroll()
	K.expand(sc, 1, true, true)
	col.add_child(sc)
	var list := equip_list(m)
	var g := K.vbox(0)
	K.expand(g)
	sc.add_child(g)
	for k in list: g.add_child(_tile(m, k))
	if list.is_empty():
		var e := K.lab("没有匹配的装备", 15, Color("#736c56"))
		e.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; e.vertical_alignment = VERTICAL_ALIGNMENT_CENTER; e.custom_minimum_size = Vector2(0, 97)
		g.add_child(e)
	sc.ready.connect(func(): sc.scroll_vertical = int(m.s.equipScroll))
	sc.get_v_scroll_bar().value_changed.connect(func(x): m.s.equipScroll = x)
	var help := K.panel(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.4), [0, 1, 0, 0], [0, 7, 0, 0])
	var hl := K.lab("悬停查看 · 双击穿戴 · Enter 穿戴", 12, Color("#72674e")); hl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	help.add_child(hl)
	col.add_child(help)
	return p

static func _sel(label: String, c: OptionButton) -> Control:
	var h := K.hbox(6)
	var l := K.lab(label, 11); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(l)
	c.add_theme_font_override("font", UI.song); c.add_theme_font_size_override("font_size", 11)
	var st := K.sb(Color("#fbf8ed"), Color("#a49a7e"), [1, 1, 1, 1], 0, [4, 4, 4, 4])
	for k in ["normal", "focus", "hover", "pressed"]: c.add_theme_stylebox_override(k, st)
	for k in ["font_color", "font_hover_color", "font_focus_color", "font_pressed_color"]: c.add_theme_color_override(k, Color("#403c2c"))
	c.custom_minimum_size.x = 68
	h.add_child(c)
	return h

## 装备行（2026-11-06）：图标 34 ＋ 名 ＋ 品级 ＋ 数量 ＋ 与当前所穿比较（绿升红降，取第一项有变化的数值）
static func _tile(m, k: Dictionary) -> Control:
	var c := K.card("equipPick", {"id": k.id, "tip": "item:" + k.id}, false, 10,
		K.sb(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.3), [0, 0, 0, 1]), K.sb(Color("#efe4c9aa"), Color(K.FRAME_LINE, 0.3), [0, 0, 0, 1]),
		K.sb(Color("#ede2c9"), Color("#96783e"), [1, 1, 1, 1], 3), [6, 5, 10, 5])
	c.on = m.s.selected == k.id
	K.expand(c)
	var box := K.content(c)
	box.alignment = BoxContainer.ALIGNMENT_BEGIN
	box.add_child(K.item_icon(k.id, 34))
	var n := K.lab(k.name, 14, K.INK, true); n.clip_text = true; K.expand(n, 2.2); n.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	box.add_child(n)
	var q := QJModel.mn_q(k.id)
	var gt := K.lab(str(k.grade), 14, Color(q[1]) if q.size() > 1 else Color("#5d5340"), true); gt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	gt.custom_minimum_size.x = 34
	box.add_child(gt)
	var it := QJModel.inspect(QJModel.current(), m.s.actor, str(k.id))
	var cmp := ""; var up := true
	for x in it.get("deltas", []):
		if x.delta:
			cmp = "%s %s%s" % [x.name, "▲" if x.delta > 0 else "▼", absi(int(x.delta))]; up = x.delta > 0; break
	var cl := K.lab(cmp if cmp != "" else ("已穿戴" if it.get("count", 0) == 0 or m.actor().equipment.values().has(k.id) else "—"), 13,
		(Color("#347153") if up else Color("#9a483d")) if cmp != "" else Color("#8b8170"), cmp != "")
	K.expand(cl, 1.6); cl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT; cl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	box.add_child(cl)
	var ct := K.lab("×%d" % k.count, 12, Color("#5d5340")); ct.size_flags_vertical = Control.SIZE_SHRINK_CENTER; ct.custom_minimum_size.x = 30
	ct.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	box.add_child(ct)
	return c

# ───────── 点击 / 双击 / Enter ─────────
static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	match act:
		"equipSlot":
			var slot: String = node.get_meta("slot")
			m.s.slot = slot
			var k = m.actor().equipment.get(slot)
			if k:
				var it := QJModel.inspect(QJModel.current(), m.s.actor, k)
				m.detail(SLOT_LABEL[slot], func(_mm): return PS.item_details(it), [["卸下当前装备", "equipRemove", {"slot": slot}, ""]])
			else:
				for x in m.panel.find_children("*", "QJCard", true, false):
					if x.get_meta("qj", "") == "equipSlot": x.set_on(x.get_meta("slot") == slot)
				m.notify("此部位尚未装备")
		"equipPick":
			m.s.selected = id
			for x in m.panel.find_children("*", "QJCard", true, false):
				if x.get_meta("qj", "") == "equipPick": x.set_on(x.get_meta("id") == id)
		"equipCategory":
			m.s.equipCategory = id
			if id in ["armor", "acc"]: m.s.equipType = "all"
			m.s.selected = null; m.s.equipScroll = 0; m.draw()
		"equipRemove":
			var slot: String = node.get_meta("slot")
			m.confirm("卸下%s的%s？" % [m.actor().name, SLOT_LABEL[slot]], func(): m.commit("unequip", {"slot": slot}))
		# 旧属性页装备栏（原版 slot / slotReplace / unequip 分支；本移植的队伍页不显示，仅保留以对齐原版）
		"slot":
			var slot: String = node.get_meta("slot")
			var k = m.actor().equipment.get(slot)
			if k:
				var it := QJModel.inspect(QJModel.current(), m.s.actor, k)
				m.detail(SLOT_LABEL[slot], func(_mm): return PS.item_details(it), [["更换", "slotReplace", {"slot": slot}, ""], ["卸下", "unequip", {"slot": slot}, ""]])
			else: PB.choose_slot(m, slot)
		"slotReplace": PB.choose_slot(m, node.get_meta("slot"))
		"unequip": m.commit("unequip", {"slot": node.get_meta("slot")})
		_: return false
	return true

static func double(m, node: Control) -> void:
	if node.get_meta("qj", "") == "equipPick": wear(m, node.get_meta("id"))
	elif node.get_meta("qj", "") == "item": PB.show_details(m, node.get_meta("id"))

## wearEquipment(id)：已穿戴提示；不可装备提示原因；否则直接 commit('equip')（无确认框）
static func wear(m, id) -> void:
	if m.s.page != "equip" or m.s.busy or id == null: return
	var it := QJModel.inspect(QJModel.current(), m.s.actor, str(id))
	if m.actor().equipment.get(it.slot) == id:
		m.notify("已装备此物"); return
	if it.action != "equip" or not it.allowed:
		m.notify(it.reason if it.reason else "当前无法装备"); return
	m.s.selected = id
	m.commit("equip", {"itemId": id})

static func after_draw(m) -> void:
	PS.after_draw(m)
