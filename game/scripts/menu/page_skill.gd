extends RefCounted
## 武学页。对应原版 js/qihe-jianghu-ui.js 的 martialPage / martialCatalog / martialName / martialInnerOverview /
## renderMartialReader / skillDetail / innerDetail / renderPractice / rosterStrip / itemDetails，
## click 分支 skillTab / catalogSkill / basicAttack / innerOverview / skillConditions / skillBP / innerMain / innerSub。
## 样式照 qihe-jianghu-ui.css 的 .qj-martial-v9（三栏 30fr / 43fr / 27fr，gap 12px，padding 22px 3.5%）。

const K := preload("res://scripts/menu/kit.gd")
const SLOT_LABEL := {"weapon": "兵器", "armor": "护具", "acc": "佩饰"}
const SMALL := Color("#403a30")

## martialName
static func martial_name(k: Dictionary) -> String:
	var art = DB.SKILLS.get(k.id, {}).get("artName")
	if art: return str(art) + " · " + str(k.name)
	return "护路棍法" if k.id == "qh_hulu_staff" else str(k.get("name", k.id))

## martialCatalog(v)：外功 / 内功 / 常驻效果，按页签与搜索过滤
static func catalog(m, v: Dictionary) -> Array:
	var outer := []
	for k in v.skills:
		if k.id == "fist": continue
		var x: Dictionary = k.duplicate(); x.catalogKind = "active"; x.displayName = martial_name(k)
		outer.append(x)
	var inner := []
	var xf := QJModel.XINFA()
	if v.inner.get("open"):
		for id in v.inner.get("lv", {}):
			if int(v.inner.lv[id]) > 0 and v.inner.get("known", []).has(id):
				var nm := str(xf.get(id, {}).get("name", id))
				inner.append({"id": id, "name": nm, "displayName": nm, "grade": xf.get(id, {}).get("grade", ""), "level": v.inner.lv[id], "catalogKind": "inner"})
	var passive := []
	for slot in v.equipment:
		var id = v.equipment[slot]
		if id:
			var nm := str(DB.ITEMS.get(id, {}).get("name", id))
			passive.append({"id": id, "name": nm, "displayName": nm, "catalogKind": "passive", "slot": slot})
	if v.inner.get("open"):
		for k in inner:
			if v.inner.get("main") == k.id or v.inner.get("subs", []).has(k.id): passive.append(k)
	var tab: String = m.s.skillTab
	# 功法分外功、内功、轻功三种（用户 11-09）：身法类招式（kind 为“身”）归轻功，战斗用法不变
	var list: Array = passive if tab == "passive" else (outer + inner).filter(func(k):
		if tab == "all": return true
		if tab == "light": return k.catalogKind == "active" and is_light(k.id)
		if tab == "active": return k.catalogKind == "active" and not is_light(k.id)
		return k.catalogKind == tab)
	var q: String = str(m.s.skillSearch).strip_edges().to_lower()
	if q == "": return list
	return list.filter(func(k): return ("%s %s %s" % [k.displayName, k.name, "横杆护身" if k.id == "qh_hulu_staff" else ""]).to_lower().contains(q))

## 轻功：身法类招式（回岚步、倦鸟知还……），按招式类别“身”判断
static func is_light(id: String) -> bool:
	return str(DB.SKILLS.get(id, {}).get("kind", "")) == "身"

static func _learned_count(v: Dictionary) -> int:
	var n := 0
	for k in v.skills:
		if k.id != "fist": n += 1
	if v.inner.get("open"):
		for x in v.inner.get("lv", {}).values():
			if int(x) > 0: n += 1
	return n

static func build(m, v: Dictionary) -> Control:
	var list := catalog(m, v)
	if m.s.skillId != "fist" or m.s.skillKind != "basic":
		var found := false
		for k in list:
			if k.id == m.s.skillId and k.catalogKind == m.s.skillKind: found = true
		if not found:
			m.s.skillId = list[0].id if list.size() else null
			m.s.skillKind = list[0].catalogKind if list.size() else null
			m.s.bp = 0
	# 2026-11-06 重设计（preview-v3 武学页）：左「已学武学」列表，右「武学详解」＋「内功运转」；人物切换在外壳左列
	var root := K.margin(10, 24, 30, 14)
	var row := K.hbox(16)
	root.add_child(row)
	var left := K.titled("已学武学 · %d 门" % _learned_count(v), _main(m, v, list)); K.expand(left, 46, true, true); row.add_child(left)
	var right := K.vbox(18); K.expand(right, 54, true, true); row.add_child(right)
	var rd := K.titled("武学详解", _reader(m, v, list)); K.expand(rd, 1, false, true); right.add_child(rd)
	right.add_child(K.titled("内功运转", _inner_overview(v)))
	return root

# ───────── 中栏 .qj-martial-main：目录 ─────────
static func _main(m, v: Dictionary, list: Array) -> Control:
	# 标题在题签上；搜索高 35、分类签 13px 高 38，下面一行一门武学
	var col := K.vbox(10)
	var p := col
	var search := LineEdit.new()
	search.name = "qj-skill-search"
	search.placeholder_text = "搜索功法或招式"
	search.text = m.s.skillSearch
	search.add_theme_font_override("font", UI.song); search.add_theme_font_size_override("font_size", 13)
	search.custom_minimum_size.y = 35
	# 11-10 试玩审查：和装备页“搜索装备”统一成一条下划线
	search.add_theme_stylebox_override("normal", K.sb(Color("#f8f2df88"), Color("#8e7f60"), [0, 0, 0, 1], 0, [26, 5, 8, 5]))
	search.add_theme_stylebox_override("focus", K.sb(Color("#fbf8ef"), Color("#a88a4e"), [0, 0, 0, 1], 0, [26, 5, 8, 5]))
	search.add_theme_color_override("font_color", K.INK)
	search.add_theme_color_override("font_placeholder_color", Color("#8b8170"))
	var glass := K.lab("⌕", 24, K.INK); glass.position = Vector2(2, -2)
	search.add_child(glass)
	search.text_changed.connect(func(t):
		m.s.skillSearch = t; m.s.skillId = null; m.s.skillKind = null; m.s["_refocus"] = "qj-skill-search"
		m.draw.call_deferred())
	col.add_child(search)
	var cats := K.hbox(4)
	for t in [["all", "全部"], ["active", "外功"], ["inner", "内功"], ["light", "轻功"], ["passive", "常驻效果"]]:
		cats.add_child(K.btn(t[1], "skillTab", {"id": t[0]}, "cat_on" if m.s.skillTab == t[0] else "cat", 13, [8, 5, 8, 5], 40))
	col.add_child(cats)
	var sc := K.scroll()
	K.expand(sc, 1, true, true)
	col.add_child(sc)
	var g := K.vbox(0)
	K.expand(g)
	sc.add_child(g)
	for k in list: g.add_child(_card(m, v, k))
	if list.is_empty():
		var e := K.lab("没有匹配的武学" if m.s.skillSearch != "" else ("内功修习暂未开放" if m.s.skillTab == "inner" and not v.inner.get("open") else "此分类暂无已学武学"), 15, Color("#736c56"))
		e.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; e.custom_minimum_size = Vector2(0, 97); e.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		g.add_child(e)
	col.add_child(_practice(m, v))
	if v.get("basicAttack"):
		var bl := K.btn("基础操作 · " + str(v.basicAttack.name), "basicAttack", {}, "link", 13, [6, 6, 6, 6], 42)
		bl.alignment = HORIZONTAL_ALIGNMENT_LEFT
		col.add_child(K.rule()); col.add_child(bl)
	return p

## 武学行（2026-11-06）：图标 36 ＋ 名 ＋ 品级框 ＋ 类型 ＋ 重数（内功写层，常驻写部位）；选中左侧朱红竖条加浅底（11-10）
static func _card(m, v: Dictionary, k: Dictionary) -> Control:
	var kind: String = k.catalogKind
	var on: bool = k.id == m.s.skillId and kind == m.s.skillKind
	var tipk: String = "inner" if kind == "inner" else ("item" if kind == "passive" else "skill")
	var c := K.card("catalogSkill", {"id": k.id, "kind": kind, "tip": tipk + ":" + k.id}, false, 12,
		K.sb(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.3), [0, 0, 0, 1]), K.sb(Color("#efe4c9aa"), Color(K.FRAME_LINE, 0.3), [0, 0, 0, 1]),
		K.sb(Color("#efe4c9"), Color("#a8352a"), [3, 0, 0, 1]), [8, 6, 12, 6])   # 11-10 试玩审查：选中改成和行记目录一样的左竖条加浅底
	c.on = on
	K.expand(c)
	var box := K.content(c)
	box.alignment = BoxContainer.ALIGNMENT_BEGIN
	box.add_child(K.item_icon(k.id, 36) if kind == "passive" else (K.xinfa_icon(k.id, 36) if kind == "inner" else K.skill_icon(k.id, 36)))
	var nm := K.lab(k.displayName, 15, K.INK, true); nm.clip_text = true
	K.expand(nm, 3); nm.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	box.add_child(nm)
	var gw := Control.new(); gw.custom_minimum_size.x = 30; gw.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if k.get("grade"):
		var gt := K.grade_tag(str(k.grade), 14); gw.add_child(gt); gt.position = Vector2(0, 8)
	box.add_child(gw)
	var kd: String = (str(k.kind) if k.get("kind") else "外功") if kind == "active" else ("内功" if kind == "inner" else SLOT_LABEL.get(k.get("slot", ""), "常驻"))
	if kind == "active" and k.id == "qh_hulu_staff": kd = "棍"
	if kind == "active" and is_light(k.id): kd = "轻功"
	var kl := K.lab(kd, 13, Color("#5d5340")); K.expand(kl, 1.4); kl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	box.add_child(kl)
	var lv: String
	if kind == "active": lv = ("%s 重" % k.get("level", 1)) + ("" if k.get("available") != false else " · 条件不足")
	elif kind == "inner": lv = "%s 层 · %s" % [k.get("level", 1), "主修" if v.inner.get("main") == k.id else ("辅修" if v.inner.get("subs", []).has(k.id) else "未运转")]
	else: lv = "已装备"
	var ll := K.lab(lv, 13, K.INK); ll.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT; ll.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	ll.custom_minimum_size.x = 64
	box.add_child(ll)
	return c

## renderPractice(v)：当前修习
static func _practice(m, v: Dictionary) -> Control:
	var p := K.panel(Color(0, 0, 0, 0), Color("#88775366"), [0, 1, 0, 0], [0, 10, 0, 0])
	var col := K.vbox(4)
	p.add_child(col)
	var k = null
	for x in v.skills:
		if x.id == m.s.skillId: k = x
	if m.s.skillKind == "active" and k != null:
		var h := K.hbox(6)
		h.add_child(K.expand(K.lab("当前修习 · " + martial_name(k), 14)))
		var need = k.profNeed if k.get("profNeed") else 6
		h.add_child(K.lab("%s / %s" % [k.get("prof", 0), need], 12))
		col.add_child(h)
		var bar := Control.new(); bar.custom_minimum_size.y = 6; bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var ratio := clampf(float(k.get("prof", 0)) / maxf(1, float(need)), 0, 1)
		bar.draw.connect(func():
			bar.draw_rect(Rect2(Vector2.ZERO, bar.size), Color("#ddd3bb"))
			bar.draw_rect(Rect2(0, 0, bar.size.x * ratio, bar.size.y), Color("#827047")))
		col.add_child(bar)
		var r := K.hbox(0); r.alignment = BoxContainer.ALIGNMENT_END
		r.add_child(K.btn("提升条件", "skillConditions", {"id": k.id}, "", 11, [8, 2, 8, 2], 26))
		col.add_child(r)
	elif m.s.skillKind == "inner":
		var info = QJModel.inspect_inner(QJModel.current(), v.id, str(m.s.skillId))
		if info == null: info = {}
		col.add_child(K.lab("当前修习 · %s · %s 层" % [info.get("name", m.s.skillId), info.get("level", 1) if info.get("level") else 1], 12))
		var need = info.get("progressNeed")
		col.add_child(K.lab("内功进度 %s / %s · %s" % [info.get("progress", 0), need if need else "当前已满", "运转中" if info.get("active") else "尚未运转"], 11, SMALL))
		if info.get("learningHint"): col.add_child(K.lab(info.learningHint, 13, SMALL))
	else:
		col.add_child(K.lab("选择已学武学，查看当前修习进度", 12, K.INK))
	return p

# ───────── 右栏 .qj-martial-reader：详解 + 内功运转概览 ─────────
static func _reader(m, v: Dictionary, list: Array) -> Control:
	var col := K.vbox(10)
	var p := col
	var sc := K.scroll()
	K.expand(sc, 1, true, true)
	col.add_child(sc)
	var d := K.vbox(10)
	K.expand(d)
	sc.add_child(d)
	var body: Array = []   # [节点..., 底部按钮]
	if m.s.skillId == "fist" and m.s.skillKind == "basic": body = _basic(m, v)
	elif m.s.skillKind == "active": body = _skill_detail(m, v, str(m.s.skillId))
	elif m.s.skillKind == "inner": body = _inner_detail(m, v, str(m.s.skillId))
	elif m.s.skillKind == "passive": body = [item_details(QJModel.inspect(QJModel.current(), m.s.actor, str(m.s.skillId)), 20)]
	else:
		body = [K.lab("武学典藏", 20), K.para("习得的功法与心法会记录在这里。", 13, K.INK, 1.65)]
	for n in body: d.add_child(n)
	return p

## itemDetails(it)：名、「分类 · 持有 N」、描述、数值变化、原因（武学页常驻效果与行囊/装备抽屉共用）
static func item_details(it: Dictionary, h2 := 23) -> Control:
	var b := K.vbox(8)
	b.add_child(K.lab(it.name, h2))
	b.add_child(K.lab("%s · 持有 %s" % [it.category if it.get("category") else "器物", it.get("count", 0)], 12, Color("#7d6440"), false, 1.5))
	b.add_child(K.para(it.desc if it.get("desc") else "暂无详细记录", 14, K.INK, 1.65))
	var ds: Array = it.get("deltas", []).filter(func(x): return x.delta)
	if ds.size():
		var g := K.vbox(4)
		for x in ds:
			var r := K.hbox(8)
			r.add_child(K.expand(K.lab(x.name, 13)))
			r.add_child(K.lab("%s → %s" % [x.before, x.after], 13, K.INK, true))
			r.add_child(K.lab(("+" if x.delta > 0 else "") + str(x.delta), 13, Color("#347153") if x.delta > 0 else Color("#9a483d")))
			g.add_child(r)
		b.add_child(g)
	if it.get("reason"): b.add_child(K.para(it.reason, 13, Color("#a2402f"), 1.6))
	return b

static func _bp_tabs(m, id: String) -> Control:
	var r := K.hbox(4)
	for bp in 4: r.add_child(K.btn("BP %d" % bp, "skillBP", {"id": id, "bp": bp}, "cat_on" if int(m.s.bp) == bp else "cat", 11, [8, 5, 8, 5], 28))
	return r

## 基本攻击（fist）
static func _basic(m, v: Dictionary) -> Array:
	var w = v.equipment.get("weapon")
	return [K.item_icon(w, 58) if w else K.skill_icon("fist", 58), K.lab(v.basicAttack.name, 20), K.para(v.basicAttack.description, 14, K.INK, 1.65),
		_bp_tabs(m, "fist"), K.para("%d 次攻击 · 内力消耗 0" % (1 + int(m.s.bp)), 14, K.INK, 1.65)]

## skillDetail(id)
static func _skill_detail(m, v: Dictionary, id: String) -> Array:
	var k = null
	for x in v.skills:
		if x.id == id: k = x
	if k == null: return []
	var info = QJModel.inspect_skill(v.id, id, int(m.s.bp))
	if info == null: info = k
	var hd := K.hbox(12)
	hd.add_child(K.skill_icon(id, 58))
	var ht := K.vbox(4); ht.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var hn := K.hbox(8)
	hn.add_child(K.lab(martial_name(k), 22, K.INK, true, 2))
	if k.get("grade"): hn.add_child(K.grade_tag(str(k.grade), 14))
	ht.add_child(hn)
	ht.add_child(K.lab("招式 · 横杆护身" if id == "qh_hulu_staff" else "%s · %s 重" % [k.kind if k.get("kind") else "招式", k.get("level", 1)], 12, Color("#7d6440"), false, 1.5))
	hd.add_child(ht)
	var out := [hd]
	var facts := K.panel(Color(0, 0, 0, 0), K.RULE, [0, 1, 0, 1], [0, 12, 0, 12])
	var fr := K.hbox(8); facts.add_child(fr)
	for f in [["功法", "%s级 · %s · %s 重" % [k.get("grade", ""), k.kind if k.get("kind") else "招式", k.get("level", 1)]], ["内力消耗", str(k.get("mp", 0))], ["兵器条件", str(info.needWeapon) if info.get("needWeapon") else "不限"]]:
		var c := K.vbox(2); K.expand(c)
		c.add_child(K.lab(f[0], 12, SMALL)); var bl := K.lab(f[1], 14, K.INK, true); bl.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY; c.add_child(bl)
		fr.add_child(c)
	out.append(facts)
	var desc = k.get("description", k.get("desc", DB.SKILLS.get(id, {}).get("desc", "")))
	out.append(K.para(str(desc), 14, K.INK, 1.65))
	if info.get("reason"): out.append(K.para(info.reason, 14, Color("#a2402f"), 1.6))
	out.append(_bp_tabs(m, id))
	var line := "按战斗规则强化"
	if info.get("bpDescription"): line = info.bpDescription
	elif info.get("bp") and info.bp.size() > int(m.s.bp):
		var b: Dictionary = info.bp[int(m.s.bp)]
		line = "威力 %.2f · %s 段%s%s" % [float(b.get("power", 0)), b.get("hits", 1) if b.get("hits") else 1, " · 恢复 " + str(b.heal) if b.get("heal") else "", " · 持续 %s 回合" % b.duration if b.get("duration") else ""]
	out.append(K.para(line, 14, K.INK, 1.65))
	out.append(K.lab("仅预览，不消耗 BP 或内力。", 13, SMALL))
	return out

## innerDetail(id)
static func _inner_detail(m, v: Dictionary, id: String) -> Array:
	var info = QJModel.inspect_inner(QJModel.current(), v.id, id)
	if info == null: return []
	var out := [K.xinfa_icon(id, 58), K.lab(info.name, 20),
		K.para("%s级 · %s · %s 层 · %s" % [info.grade, "主修心法" if info.type == "main" else "辅修心法", info.level, info.xing if info.xing else "中性"], 12, K.INK, 1.65),
		K.para(info.description, 14, K.INK, 1.65)]
	for t in info.traits:
		out.append(K.para("%s 层 · %s%s" % [t.level, t.description, "（尚未生效）" if t.get("implemented") == false else ""], 12, K.INK, 1.65))
	var why: String = info.mainReason if info.type == "main" else info.subReason
	if why != "": out.append(K.para(why, 14, Color("#a2402f"), 1.6))
	var b: Button
	if info.type == "main": b = K.btn("当前主修" if info.active else "设为主修", "innerMain", {"id": id}, "", 13, [12, 5, 12, 5], 34)
	else: b = K.btn("停止辅修" if info.active else "设为辅修", "innerSub", {"id": id}, "", 13, [12, 5, 12, 5], 34)
	if (info.type == "main" and not info.canMain) or (info.type != "main" and not info.active and not info.canSub): b.modulate.a = 0.55
	var r := K.hbox(0); r.add_child(b)
	out.append(r)
	return out

## martialInnerOverview(v)
static func _inner_overview(v: Dictionary) -> Control:
	var inner: Dictionary = v.inner
	var b := K.vbox(6)
	if not inner.get("open"):
		b.add_child(K.lab("暂未开放修习与主辅配置", 12, Color("#7d6440"), false, 1.5)); return b
	var entry := func(id, label: String) -> Control:
		if id == null or id == "":
			var r := K.hbox(4); r.add_child(K.lab(label, 12, SMALL)); r.add_child(K.lab("· 尚未配置", 13)); return r
		var c := K.card("innerOverview", {"id": id}, false, 8, K.sb(Color("#eee6d3"), Color("#9d8d6866"), [1, 1, 1, 1]), null, null, [4, 7, 4, 7])
		var box := K.content(c)
		box.add_child(K.lab(label, 12, SMALL))
		box.add_child(K.expand(K.lab(str(QJModel.XINFA().get(id, {}).get("name", id)), 14, K.INK, true)))
		box.add_child(K.lab("%s 层" % inner.get("lv", {}).get(id, 1), 13))
		return c
	b.add_child(entry.call(inner.get("main"), "主修"))
	var subs: Array = inner.get("subs", [])
	for id in subs: b.add_child(entry.call(id, "辅修"))
	if subs.is_empty(): b.add_child(K.lab("尚未运转辅修心法", 13))
	var cap := int(inner.get("capacity", 0))
	b.add_child(K.lab("辅修 %d / %d%s%s" % [subs.size(), cap, " · 13级开启首位" if cap == 0 else "", " · 气脉未稳 %s 场" % inner.unstable if inner.get("unstable") else ""], 11, SMALL))
	return b

# ───────── 点击 ─────────
static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	match act:
		"skillTab":
			m.s.skillTab = id; m.s.skillId = null; m.s.skillKind = null; m.s.bp = 0; m.draw()
		"catalogSkill":
			m.s.bp = 0; m.s.skillId = id; m.s.skillKind = node.get_meta("kind"); _redraw(m, node)
		"basicAttack":
			m.s.skillId = "fist"; m.s.skillKind = "basic"; m.s.bp = 0; _redraw(m, node)
		"innerOverview":
			m.s.skillTab = "inner"; m.s.skillSearch = ""; m.s.skillId = id; m.s.skillKind = "inner"; m.s.bp = 0; m.draw()
		"skillConditions":
			var k = null
			for x in m.actor().skills:
				if x.id == id: k = x
			if k == null: return true
			var why := QJModel.upgrade_why(QJModel.current(), m.s.actor, id)
			m.detail("提升条件", func(_mm):
				var b := K.vbox(10)
				b.add_child(K.lab("%s · %s 重" % [martial_name(k), k.get("level", 1)], 23))
				b.add_child(K.para("熟练 %s / %s" % [k.get("prof", 0), k.profNeed if k.get("profNeed") else 6]))
				b.add_child(K.para(why if why != "" else "熟练积累到门槛后自动提升。"))
				b.add_child(K.lab("实战、秘籍或师父指点可积累熟练；不消耗资源进行预览。", 14, SMALL))
				return b)
		"skillBP":
			m.s.bp = int(node.get_meta("bp")); _redraw(m, node)
		"innerMain":
			var info = QJModel.inspect_inner(QJModel.current(), m.s.actor, id)
			if info == null: return true
			if not info.canMain:
				m.notify(info.mainReason); return true
			var text: String = ("改修主修心法将清空内力，并有 %s 场气脉不稳。确认改修？" % info.swapCost.unstableBattles) if info.swapCost else "设「%s」为主修？" % info.name
			m.confirm(text, func(): m.commit("setMainInner", {"innerId": id, "confirmCost": true}))
		"innerSub":
			var info = QJModel.inspect_inner(QJModel.current(), m.s.actor, id)
			if info == null: return true
			if not info.active and not info.canSub:
				m.notify(info.subReason); return true
			m.commit("setSubInner", {"innerId": id})
		_: return false
	return true

## 原版只重绘详解栏并保留焦点；这里整页重绘后把焦点还给同一按钮
static func _redraw(m, node: Control) -> void:
	var key := {"qj": node.get_meta("qj")}
	for k in ["id", "kind", "bp"]:
		if node.has_meta(k): key[k] = node.get_meta(k)
	m.s["_refocus"] = key
	m.draw()

## 重绘后恢复焦点（搜索框或之前按下的按钮）
static func after_draw(m) -> void:
	var want = m.s.get("_refocus")
	m.s.erase("_refocus")
	if want == null: return
	if want is String:
		var n = m.panel.find_child(want, true, false)
		if n is LineEdit:
			n.grab_focus.call_deferred(); n.caret_column = n.text.length()
		return
	for n in m.panel.find_children("*", "", true, false):
		if not n.has_meta("qj"): continue
		var ok := true
		for k in want:
			if not n.has_meta(k) or str(n.get_meta(k)) != str(want[k]): ok = false
		if ok:
			n.grab_focus.call_deferred(); return
