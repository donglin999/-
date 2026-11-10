extends RefCounted
## 行记页（任务 / 人物图鉴）。对应原版 js/qihe-journal-ui.js（QiheJournalUI.render / renderTask / renderPerson / relation / face）
## 与 js/qihe-jianghu-ui.js 的 questPage 及 click 分支 quest / questFilter / journalTab / journalPerson / journalCollapse /
## journalTask / journalPaper / journalAction / questTrack / chapter* / journal。
## 样式照 js/qihe-journal.css；1280 宽时取 ≤1350px 媒体查询值（pagebar 57、任务侧栏 208、图鉴立绘栏 225、h2 31px）。

const K := preload("res://scripts/menu/kit.gd")
const Q := preload("res://scripts/menu/quest.gd")
const INK := Color("#29291f")
const MUTED := Color("#7c6f58")
const GREEN := Color("#8a4a32")   # 强调色：11-09 第四十八轮由墨绿改成和装备、武学页同一套的褐红（名字沿用）
const LINE := Color("#d9ccb0")
const WASH := Color("#efe5cc")
const GOLD := Color("#957950")
const SHORT := {"一封未落款的拜帖": "未落款的拜帖", "三份来件与第十七号底单": "三份来件对证", "学习丙级《护路棍法》": "护路棍法"}

static func short(t: String) -> String:
	if SHORT.has(t): return SHORT[t]
	return RegEx.create_from_string("^(开始|培养|游历|终局|序章|第.+?章)\\s*·\\s*").sub(t, "")

## 正文用无衬线（PingFang / 微软雅黑）；标题用宋体
static func t(text: String, size := 18, col := INK, bold := false) -> Label:
	return K.lab(text, size, col, bold, 0, true)

static func tp(text: String, size := 18, col := INK, lh := 1.65) -> Label:
	var l := K.para(text, size, col, lh)
	l.add_theme_font_override("font", UI.sans)
	return l

## badge(i)：icons-atlas 4×4 第 i 格
static func badge(i: int, sz := 35.0) -> Control:
	return K.icon_rect(K.atlas_cell(K.ICON_ATLAS, 4, 4, i % 4, i / 4), sz)

## face(p, size)：有 art 时圆形头像（整幅立绘取头部；小头像铺满），否则 badge4
static func face(p: Dictionary, sz := 48.0) -> Control:
	var art = p.get("art")
	if not art: return badge(4, 26.0 if sz <= 38 else 35.0)
	var tex := Assets.tex(str(art))
	var c := Control.new()
	c.custom_minimum_size = Vector2(sz, sz)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	c.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST if not p.get("full") else CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	var full: bool = true if p.get("full") else false
	var ye: bool = p.get("id") == "ye"
	c.draw.connect(func():
		var ctr := Vector2(sz, sz) / 2
		c.draw_circle(ctr, sz / 2, Color("#ece2c9"))
		if tex:
			var src: Rect2
			if full:
				# img 宽 184（ye 190）、水平居中、top -2（ye -15）：按 48px 圆换算到源图
				var iw := (190.0 if ye else 184.0) * sz / 48.0
				var k := tex.get_width() / iw
				var top := (-15.0 if ye else -2.0) * sz / 48.0
				src = Rect2((iw - sz) / 2 * k, -top * k, sz * k, sz * k)
			else:
				var m := minf(tex.get_width(), tex.get_height())
				src = Rect2((tex.get_width() - m) / 2, (tex.get_height() - m) / 2, m, m)
			var pts := PackedVector2Array(); var uvs := PackedVector2Array()
			for i in 32:
				var a := TAU * i / 32.0
				var pt := ctr + Vector2(cos(a), sin(a)) * (sz / 2 - 1)
				pts.append(pt); uvs.append((src.position + pt / sz * src.size) / tex.get_size())
			c.draw_colored_polygon(pts, Color.WHITE, uvs, tex)
		c.draw_arc(ctr, sz / 2, 0, TAU, 40, Color("#cdbd98"), 1.0, true))
	return c

static func build(m, _v: Dictionary) -> Control:
	var s: Dictionary = m.s
	var rows_all := Q.entries()
	var people := Q.people(G.S)
	var ph := Q.phase(G.S)
	if s.journalView != "people": s.journalView = "tasks"
	s.questFilter = "done" if s.questFilter == "done" else "active"
	var rows := rows_all.filter(func(x): return x.status == s.questFilter)
	var q = null
	for x in rows:
		if x.id == s.questId: q = x
	if q == null and rows.size(): q = rows[0]
	var p = null
	for x in people:
		if x.id == s.journalPersonId: p = x
	if p == null and people.size(): p = people[0]
	s.questId = q.id if q else null
	s.journalPersonId = p.id if p else null
	# 实测 menu-quest.json（页面区 y65～691，底 .qjc --paper #f6f3e9）：pagebar 27,65 → 1227×54；工作区 y135 高 545；
	# 目录栏宽 209（内容 194）；阅读区 x256
	# 2026-11-06 重设计（preview-v3 行记页）：页签条下三块题签面板（目录 / 详情 / 相关人物）；没有队员列
	var root := K.margin(30, 6, 30, 14)
	var col := K.vbox(0)
	root.add_child(col)
	col.add_child(_pagebar(s, ph))
	col.add_child(K.spacer(24))
	var ws := K.hbox(16)
	K.expand(ws, 1, true, true)
	col.add_child(ws)
	var dt := K.titled("已识人物" if s.journalView == "people" else "任务目录", _directory(s, rows_all, rows, people, q, p))
	ws.add_child(dt)
	if s.journalView == "people":
		var reader := K.scroll()
		var rpad := K.margin(0, 0, 10, 0); K.expand(rpad)
		reader.add_child(rpad)
		rpad.add_child(_person(p, people, rows_all))
		var rt := K.titled("人物图鉴", reader); K.expand(rt, 1, true, true)
		ws.add_child(rt)
	else:
		var lay := _task(q, people); K.expand(lay, 1, true, true)
		ws.add_child(lay)
	return root

## pagebar：页签「任务」「人物图鉴」+ 右侧章名与日期
static func _pagebar(s: Dictionary, ph: Dictionary) -> Control:
	var bar := K.panel(Color(0, 0, 0, 0), LINE, [0, 0, 0, 1])
	bar.custom_minimum_size.y = 44
	var row := K.hbox(28)
	bar.add_child(row)
	for tb in [["tasks", "任务", 5], ["people", "人物图鉴", 4]]:
		var on: bool = s.journalView == tb[0]
		var b := K.card("journalTab", {"id": tb[0]}, false, 6, K.sb(Color(0, 0, 0, 0), GREEN if on else Color(0, 0, 0, 0), [0, 0, 0, 3]),
			K.sb(Color(0, 0, 0, 0), GREEN if on else LINE, [0, 0, 0, 3]), null, [0, 0, 0, 3])
		K.content(b).add_child(badge(tb[2], 26))
		K.content(b).add_child(t(tb[1], 16, GREEN if on else INK, on))   # 11-09：页签和其他页同号
		row.add_child(b)
	row.add_child(K.expand(K.spacer()))
	var ch := K.hbox(20)
	ch.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	ch.add_child(t(ph.chapter, 15, GREEN))
	var d := t(ph.date, 14, MUTED); d.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	ch.add_child(d)
	row.add_child(ch)
	return bar

## aside.directory：标题 + 收起钮、筛选、条目列表、说明
static func _directory(s: Dictionary, all: Array, rows: Array, people: Array, q, p) -> Control:
	var col_w := 72 if s.journalCollapsed else 300
	var pane := K.panel(Color(0, 0, 0, 0))
	pane.custom_minimum_size.x = col_w
	var col := K.vbox(6)
	pane.add_child(col)
	var head := K.hbox(6)
	head.custom_minimum_size.y = 30
	if not s.journalCollapsed:
		var ttl := t(("共 %d 人" % people.size()) if s.journalView == "people" else ("共 %d 件" % all.size()), 14, MUTED)
		ttl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		head.add_child(K.expand(ttl))
	else: head.add_child(K.expand(K.spacer()))
	var cb := K.btn("›" if s.journalCollapsed else "‹", "journalCollapse", {}, "flat", 28, [0, -6, 0, 0], 30)
	cb.custom_minimum_size = Vector2(30, 30)
	cb.add_theme_stylebox_override("normal", K.sb(Color(0, 0, 0, 0), LINE, [1, 1, 1, 1], 15))
	head.add_child(cb)
	col.add_child(head)
	if s.journalView == "tasks" and not s.journalCollapsed:
		var f := K.hbox(12)
		for x in [["active", "正在进行"], ["done", "已完成"]]:
			var on: bool = s.questFilter == x[0]
			var n := all.filter(func(r): return r.status == x[0]).size()
			var b := K.card("questFilter", {"id": x[0]}, false, 4, null, K.sb(Color(0, 0, 0, 0)), null, [2, 4, 2, 4])
			K.content(b).add_child(t(x[1], 15, GREEN if on else INK, on))
			K.content(b).add_child(t(str(n), 12, GREEN if on else MUTED, true))
			f.add_child(b)
		col.add_child(f)
	var sc := K.scroll()
	K.expand(sc, 1, true, true)
	var list := K.vbox(0)
	K.expand(list)
	sc.add_child(list)
	if s.journalView == "people":
		for x in people: list.add_child(_entry("journalPerson", x.id, face(x), x.name, x.faction, p != null and x.id == p.id, s.journalCollapsed))
	else:
		for x in rows: list.add_child(_entry("quest", x.id, badge(12 if x.status == "done" else 5, 39), short(x.title), x.kind, q != null and x.id == q.id, s.journalCollapsed))
	if list.get_child_count() == 0: list.add_child(t("暂无条目", 14, MUTED))
	col.add_child(sc)
	if not s.journalCollapsed:
		# 原版说明紧跟在列表后面，不贴底
		var gap := Control.new(); gap.custom_minimum_size.y = 14; list.add_child(gap)
		var note := tp("相识后记录，随经历补充。" if s.journalView == "people" else "只收录已承办的事项。", 13, MUTED)
		list.add_child(note)
	return pane

static func _entry(act: String, id: String, icon: Control, title: String, sub: String, on: bool, collapsed: bool) -> Control:
	var b := K.card(act, {"id": id}, false, 10, K.sb(Color(0, 0, 0, 0), Color("#e2d7bd"), [3, 0, 0, 1]),
		K.sb(Color(WASH, 0.6), Color("#e2d7bd"), [3, 0, 0, 1]), K.sb(WASH, GREEN, [3, 0, 0, 1]), [7, 10, 7, 10])
	b.custom_minimum_size.y = 73
	b.on = on
	b.tooltip_text = title
	var box := K.content(b)
	box.alignment = BoxContainer.ALIGNMENT_BEGIN
	box.add_child(icon)
	if not collapsed:
		var c := K.vbox(2); K.expand(c); c.alignment = BoxContainer.ALIGNMENT_CENTER
		var a := t(title, 17); a.clip_text = true
		c.add_child(a)
		var z := t(sub, 13, MUTED); z.clip_text = true
		c.add_child(z)
		box.add_child(c)
	return b

## .qjc-pin：13×17 描边水滴（右下尖角）旋转 -45°，中间 3px 小圈；按钮内 11×14
static func pin(col: Color, small := false) -> Control:
	var w := 11.0 if small else 13.0
	var h := 14.0 if small else 17.0
	var c := Control.new()
	c.custom_minimum_size = Vector2(w + 6, h + 4)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	c.draw.connect(func():
		var ctr := Vector2(w / 2 + 3, h / 2 + 1)
		c.draw_set_transform(ctr, -PI / 4, Vector2.ONE)
		var r := w / 2
		var pts := PackedVector2Array()
		for i in 25:
			var a := PI + PI * i / 24.0
			pts.append(Vector2(cos(a) * r, -h / 2 + r + sin(a) * r))
		pts.append(Vector2(r, h / 2 - r)); pts.append(Vector2(-r, h / 2)); pts.append(Vector2(-r, -h / 2 + r))
		c.draw_polyline(pts, col, 2.0, true)
		c.draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
		c.draw_arc(ctr + Vector2(-1, -1), 2, 0, TAU, 12, col, 1.0, true))
	return c

## 节标题：badge 27 + 文字
static func _section(title: String, i: int, right := "") -> Control:
	var h := K.hbox(8)
	h.add_child(badge(i, 27))
	var l := t(title, 18, GREEN, true); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(K.expand(l))
	if right != "": h.add_child(t(right, 13, MUTED))
	return h

## relation(p, caption)：face.sm + 名 + 说明 + ›
static func relation(p: Dictionary, caption: String) -> Control:
	var b := K.card("journalPerson", {"id": p.id}, false, 8, K.sb(Color(0, 0, 0, 0), LINE, [0, 0, 0, 1]), K.sb(Color(WASH, 0.7), LINE, [0, 0, 0, 1]), null, [4, 6, 4, 6])
	b.custom_minimum_size.x = 138
	var box := K.content(b)
	box.alignment = BoxContainer.ALIGNMENT_BEGIN
	box.add_child(face(p, 38))
	var c := K.vbox(0); K.expand(c)
	c.add_child(t(p.name, 16, INK, true))
	var z := t(caption, 13, MUTED); z.clip_text = true
	c.add_child(z)
	box.add_child(c)
	box.add_child(t("›", 18, MUTED))
	return b

# ───────── 任务详情 renderTask(q, people, tracked) ─────────
static func _task(q, people: Array) -> Control:
	if q == null:
		var e := K.vbox(10)
		e.add_child(K.lab("此类暂无任务", 24, INK, true)); e.add_child(tp("已承办和完成的事项会记在行记里。", 16, MUTED))
		var et := K.titled("任务详情", e); var w := K.hbox(0); K.expand(et, 1, true, true); w.add_child(et)
		return w
	var done: bool = q.status == "done"
	var tracked := Q.is_tracked(q)
	var lay := K.hbox(16)
	var main := K.vbox(8)
	K.expand(main)
	var msc := K.scroll(); msc.add_child(main)
	var mt := K.titled("任务详情", msc); K.expand(mt, 1, true, true)
	lay.add_child(mt)
	var eb := K.hbox(6)
	eb.add_child(badge(12 if done else 5, 26)); var ek := t(q.kind, 14, MUTED); ek.size_flags_vertical = Control.SIZE_SHRINK_CENTER; eb.add_child(ek)
	main.add_child(eb)
	main.add_child(K.lab(short(q.title), 24, INK, true))
	var meta := K.hbox(16)
	var st := t("● " + ("已完成" if done else "正在进行"), 15, GREEN); st.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	meta.add_child(st)
	if not done:
		var tb := K.btn("◆ 已追踪" if tracked else "◇ 追踪任务", "questTrack", {"id": q.id}, "flat", 13, [8, 0, 8, 0], 20)
		tb.add_theme_font_override("font", UI.sans)
		for k in ["font_color", "font_hover_color", "font_focus_color"]: tb.add_theme_color_override(k, GREEN)
		meta.add_child(tb)
	main.add_child(meta)
	var obj := K.panel(Color("#ede0bfb3"), GREEN, [3, 0, 0, 0], [17, 14, 17, 14])
	var oc := K.vbox(8); obj.add_child(oc)
	oc.add_child(t("事项结果" if done else "下一步", 15, GREEN, true))
	oc.add_child(tp(q.objective, 16, INK, 1.5))
	var orow := K.hbox(10)
	var wh := K.hbox(4); K.expand(wh)
	if q.where:
		wh.add_child(pin(GREEN))
		var wl := t(q.where, 15, MUTED); wl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		wh.add_child(wl)
	orow.add_child(wh)
	if q.action:
		var ab := K.btn(str(q.action.label), "journalAction", {"id": q.id}, "primary", 16, [16, 6, 16, 6], 42)
		ab.custom_minimum_size.x = 123
		var ai: Control = pin(Color("#f4f0e6"), true) if q.action.type == "npc" else badge(5, 26)
		ab.add_child(ai); ai.position = Vector2(4, 8)
		ab.add_theme_constant_override("h_separation", 0)
		ab.alignment = HORIZONTAL_ALIGNMENT_RIGHT
		ab.add_theme_font_override("font", UI.sans)
		ab.add_theme_stylebox_override("normal", K.sb(GREEN, GREEN, [1, 1, 1, 1], 3, [16, 6, 16, 6]))
		ab.add_theme_stylebox_override("hover", K.sb(Color("#a05a40"), GREEN, [1, 1, 1, 1], 3, [16, 6, 16, 6]))
		orow.add_child(ab)
	oc.add_child(orow)
	main.add_child(obj)
	main.add_child(_section("事情缘起", 12))
	main.add_child(tp(q.origin, 15, INK, 1.6))
	var prog: Array = q.progress
	main.add_child(_section("进展记录", 5, "%d / %d" % [prog.filter(func(x): return x.done).size(), prog.size()]))
	# 原版 .task-progress 两列网格
	var pg := GridContainer.new(); pg.columns = 2
	pg.add_theme_constant_override("h_separation", 22); pg.add_theme_constant_override("v_separation", 4)
	main.add_child(pg)
	for x in prog:
		var li := K.panel(Color(0, 0, 0, 0), LINE, [0, 0, 0, 1], [0, 8, 0, 8])
		li.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var r := K.hbox(10); li.add_child(r)
		var ck := Control.new(); ck.custom_minimum_size = Vector2(23, 23); ck.mouse_filter = Control.MOUSE_FILTER_IGNORE
		ck.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		var dn: bool = x.done
		ck.draw.connect(func():
			if dn: ck.draw_circle(Vector2(11.5, 11.5), 11.5, Color("#eedfc6"))
			else: ck.draw_arc(Vector2(11.5, 11.5), 11, 0, TAU, 32, Color("#c4a982"), 1.0, true)
			if dn: ck.draw_string(UI.sans, Vector2(5, 17), "✓", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, GREEN))
		r.add_child(ck)
		var c := K.vbox(2); K.expand(c)
		c.add_child(tp(x.title, 16, INK if dn else MUTED))
		c.add_child(tp(x.detail, 13, MUTED))
		r.add_child(c)
		pg.add_child(li)
	# aside.task-side（宽 208）
	var sv := K.vbox(18)
	var side := K.titled("相关人物", sv)
	side.custom_minimum_size.x = 300
	var pc := K.vbox(6)
	var n := 0
	for id in q.people:
		for p in people:
			if p.id == id:
				pc.add_child(relation(p, str(p.role).split(" · ")[0])); n += 1
	if n == 0: pc.add_child(tp("尚无已识人物记录。", 14, MUTED))
	sv.add_child(pc)
	if q.get("paper"):
		var paper: Dictionary = q.paper
		var pp := K.vbox(6)
		pp.add_child(_section("已见文书", 1))
		var card := K.card("journalPaper", {"id": q.id}, true, 8, K.sb(Color(236 / 255.0, 229 / 255.0, 211 / 255.0, 0.5), Color("#c2b498"), [0, 2, 0, 0]),
			K.sb(Color(236 / 255.0, 229 / 255.0, 211 / 255.0, 0.85), Color("#c2b498"), [0, 2, 0, 0]), null, [12, 14, 12, 14])
		var cb := K.content(card)
		var ph := K.hbox(6); ph.add_child(badge(1, 35)); var pt := t(paper.title, 16, INK, true); pt.size_flags_vertical = Control.SIZE_SHRINK_CENTER; ph.add_child(pt)
		cb.add_child(ph)
		for fld in paper.fields:
			var fr := K.panel(Color(0, 0, 0, 0), Color("#d8d1be"), [0, 1, 0, 0], [0, 4, 0, 2])
			var fh := K.hbox(6); fr.add_child(fh)
			var fl := t(fld[0], 14, MUTED); fl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
			fh.add_child(K.expand(fl)); fh.add_child(K.lab(fld[1], 22, GOLD, true))
			cb.add_child(fr)
		var foot := K.hbox(6); foot.add_child(K.expand(t("摘录", 13, MUTED))); foot.add_child(t("展开 ›", 13, GREEN))
		cb.add_child(foot)
		pp.add_child(card)
		pp.add_child(tp(paper.note, 13, MUTED))
		sv.add_child(pp)
	if q.get("reward"):
		var rw := K.vbox(4)
		rw.add_child(_section("已领取", 2))
		var rr := K.hbox(8); rr.add_child(K.lab("%s 文" % q.reward, 20, GOLD, true)); var rs := t("委托路费", 13, MUTED); rs.size_flags_vertical = Control.SIZE_SHRINK_END; rr.add_child(rs)
		rw.add_child(rr)
		sv.add_child(rw)
	lay.add_child(side)
	return lay

## renderPerson(p, people, tasks)：人物图鉴。≤1350px 时立绘栏 225 宽、间距 18
static func _person(p, people: Array, tasks: Array) -> Control:
	if p == null:
		var es := K.margin(20, 30, 20, 30)
		var ev := K.vbox(18); es.add_child(ev)
		ev.add_child(K.lab("人物图鉴", 31, INK, true))
		ev.add_child(tp("相识的人物会记在这里，经历随行程补充。", 17, MUTED, 1.8))
		return es
	var links: Array = []
	for id in p.tasks:
		for x in tasks:
			if x.id == id: links.append(x)
	links.sort_custom(func(a, b): return str(a.id).begins_with("out:") and not str(b.id).begins_with("out:"))
	links = links.slice(0, 3)
	var lay := K.hbox(18)
	# figure.portrait-pane
	var fig := K.vbox(0)
	fig.custom_minimum_size.x = 225
	var full: bool = true if (p.get("full") and p.get("art")) else false
	if full:
		var art := QJFitTex.new()
		art.set_tex(Assets.tex(str(p.art)))
		art.custom_minimum_size = Vector2(225, 470)
		art.max_h = 535
		fig.add_child(art)
	else:
		fig.add_child(K.spacer(94))
		var fc := CenterContainer.new(); fc.add_child(face(p, 120)); fig.add_child(fc)
		fig.add_child(K.spacer(20))
	var cap := K.hbox(8); cap.custom_minimum_size.y = 38; cap.alignment = BoxContainer.ALIGNMENT_CENTER
	cap.add_child(badge(4, 26))
	var cl := t("人物图鉴 · " + str(p.name), 13, MUTED); cl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	cap.add_child(cl)
	fig.add_child(cap)
	lay.add_child(fig)
	# .dossier
	var d := K.vbox(0); K.expand(d)
	d.add_child(K.spacer(1))
	d.add_child(t("人物档案 ／ 江湖相识", 14, MUTED))
	d.add_child(K.spacer(5))
	var pt := K.hbox(20)
	pt.add_child(K.lab(str(p.name), 31, INK, true))
	var fch := t(str(p.get("faction", "")), 15, GREEN); fch.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	pt.add_child(fch)
	d.add_child(pt)
	d.add_child(K.spacer(9))
	d.add_child(t(str(p.get("role", "")), 18, GREEN))
	var af = p.get("affection")
	if af is Dictionary and not af.is_empty():
		d.add_child(K.spacer(12))
		d.add_child(_affection(af, str(p.name)))
	d.add_child(K.spacer(12))
	var fr := K.hbox(6)
	fr.add_child(pin(GREEN))
	var fs := t("初识", 13, MUTED); fs.size_flags_vertical = Control.SIZE_SHRINK_CENTER; fr.add_child(fs)
	var fv := t(str(p.get("first", "")), 16, INK); fv.size_flags_vertical = Control.SIZE_SHRINK_CENTER; fr.add_child(fv)
	d.add_child(fr)
	d.add_child(K.spacer(25))
	d.add_child(_section("人物小传", 12))
	d.add_child(tp(str(p.get("bio", "")), 17, INK, 1.6))
	d.add_child(K.spacer(12))
	d.add_child(_section("已知经历", 5))
	d.add_child(_timeline(p.get("events", [])))
	d.add_child(K.spacer(12))
	var cx := K.hbox(14)
	var rel := K.vbox(6); K.expand(rel)
	rel.add_child(_section("相关人物", 4))
	var rg := HFlowContainer.new()
	var n := 0
	for pair in p.get("relations", []):
		for o in people:
			if o.id == pair[0]:
				var rb := relation(o, str(pair[1])); rb.custom_minimum_size.x = maxf(rb.custom_minimum_size.x, 128)
				rg.add_child(rb); n += 1
	rel.add_child(rg if n else tp("尚无已记录的往来人物。", 14, MUTED))
	cx.add_child(rel)
	var lk := K.vbox(6); K.expand(lk)
	lk.add_child(_section("关联任务", 1))
	for x in links:
		lk.add_child(_related(x))
	if links.is_empty(): lk.add_child(tp("暂无已承办的关联任务。", 14, MUTED))
	cx.add_child(lk)
	d.add_child(cx)
	lay.add_child(d)
	return lay

## .qjc-affection：好感阶段、分数、进度条、上限与最近记录
static func _affection(af: Dictionary, _name: String) -> Control:
	var box := K.panel(Color("#ebe0bb70"), Color("#a88a4e"), [2, 0, 0, 0], [14, 10, 14, 10])
	box.get_theme_stylebox("panel").set("corner_radius_top_right", 3)
	var v := K.vbox(4); box.add_child(v)
	var hr := K.hbox(8)
	hr.add_child(K.expand(t("♡ " + str(af.get("stage", "")), 16, INK, true)))
	hr.add_child(t("%d / 100" % int(af.get("score", 0)), 15, GREEN, true))
	v.add_child(hr)
	var bar := ProgressBar.new()
	bar.max_value = 100; bar.value = float(af.get("score", 0)); bar.show_percentage = false
	bar.custom_minimum_size.y = 6
	bar.add_theme_stylebox_override("background", K.sb(Color("#dfd3b8"), Color(0, 0, 0, 0), [0, 0, 0, 0], 3))
	bar.add_theme_stylebox_override("fill", K.sb(GREEN, Color(0, 0, 0, 0), [0, 0, 0, 0], 3))
	v.add_child(bar)
	v.add_child(t("当前阶段上限 %s%s" % [str(af.get("cap", "")), " · 需要新的共同经历" if af.get("atCap") else ""], 13, MUTED))
	var recent: Array = af.get("recent", [])
	if recent.is_empty():
		v.add_child(t("刚相识，往后的经历会记在这里。", 13, MUTED))
	for e in recent:
		var r := K.hbox(6)
		r.add_child(t(str(e.get("source", "")), 14, INK))
		var dl: int = int(e.get("delta", 0))
		r.add_child(t("＋%d" % dl if dl else "关系未增加", 14, GREEN, true))
		v.add_child(r)
	return box

## ol.timeline：左侧竖线 + 绿点；small 为阶段
static func _timeline(events: Array) -> Control:
	var v := K.vbox(0)
	v.add_child(K.spacer(8))
	for i in events.size():
		var e: Dictionary = events[i]
		var last: bool = i == events.size() - 1
		var li := K.margin(29, 0, 0, 0 if last else 7)
		var c := K.vbox(2); li.add_child(c)
		c.add_child(t(str(e.get("phase", "")), 13, MUTED))
		c.add_child(tp(str(e.get("text", "")), 16, INK, 1.5))
		li.draw.connect(func():
			if not last: li.draw_line(Vector2(7.5, 0), Vector2(7.5, li.size.y), Color("#d4c4a0"), 1.0)
			li.draw_circle(Vector2(7.5, 11.5), 3.5, GREEN))
		v.add_child(li)
	return v

## button.related-task：badge5 + 标题/类别 + 状态
static func _related(x) -> Control:
	var n := K.sb(Color("#ede0bf8c"), Color("#b89a66"), [2, 0, 0, 0], 0, [10, 10, 10, 10])
	var hv := K.sb(Color("#ede0bfd9"), Color("#b89a66"), [2, 0, 0, 0], 0, [10, 10, 10, 10])
	var b := K.card("journalTask", {"id": x.id}, false, 8, n, hv, null, [10, 10, 10, 10])
	var row := K.content(b)
	row.add_child(badge(5, 27))
	var c := K.vbox(4); K.expand(c)
	c.add_child(t(short(str(x.title)), 16, INK))
	c.add_child(t(str(x.kind), 13, MUTED))
	row.add_child(c)
	var st := t("✓ 已完成" if x.status == "done" else "正在进行", 12, GREEN); st.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(st)
	var wrap := K.margin(0, 6, 0, 0); wrap.add_child(b)
	return wrap

static func _find(id) -> Variant:
	for x in Q.entries():
		if x.id == id: return x
	return null

## 原版 qihe-jianghu-ui.js click：行记相关分支
static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	var s: Dictionary = m.s
	match act:
		"quest":
			s.journalView = "tasks"; s.questId = id; m.draw()
		"questFilter":
			s.journalView = "tasks"; s.questFilter = "done" if id == "done" else "active"; s.questId = null; m.draw()
		"journalTab":
			s.journalView = "people" if id == "people" else "tasks"; m.draw()
		"journalPerson":
			s.journalView = "people"; s.journalPersonId = id; m.draw()
		"journalCollapse":
			s.journalCollapsed = not s.journalCollapsed; m.draw()
		"journalTask":
			var q = _find(id)
			if q: s.journalView = "tasks"; s.questId = id; s.questFilter = q.status; m.draw()
		"journalPaper":
			var q = _find(id)
			if q and q.get("paper"):
				var paper: Dictionary = q.paper
				m.detail(str(paper.title), func(_mm):
					var v := K.vbox(10)
					v.add_child(K.lab(str(paper.title), 24, INK, true))
					v.add_child(tp(str(paper.get("body", "")), 16, INK))
					v.add_child(tp(str(paper.get("note", "")), 13, MUTED))
					return v)
		"journalAction":
			var q = _find(id)
			var a = q.get("action") if q else null
			if not a: return true
			m.close()
			match str(a.type):
				"continue": _chapter("rest")
				"npc": _side_npc(str(a.id))
				"evidence": _chapter("evidence")
		"questTrack":
			var q = _find(id)
			if q: m.set_tracked(Q.q_key(q), not Q.is_tracked(q)); m.draw()
		"chapterNpc":
			m.close(); _side_npc(str(id))
		"chapterEvidence":
			m.close(); _chapter("evidence")
		"chapterContinue":
			m.close(); _chapter("rest")
		"chapterTrack":
			m.close()
			var sd := Flow.get_node_or_null("Side")
			if sd: sd.nav_track_activity(str(id))
		_:
			return false
	return true

## QiheChapter.rest / evidence；Godot 版 evidence 无公开入口，用 guarded(evidence_body) 等价调用
static func _chapter(kind: String) -> void:
	var ch := Flow.get_node_or_null("Chapter")
	if ch == null: return
	if kind == "rest": ch.rest()
	elif ch.has_method("evidence"): ch.evidence()
	else: ch.guarded(ch.evidence_body)

static func _side_npc(id: String) -> void:
	var sd := Flow.get_node_or_null("Side")
	if sd: sd.nav_track_npc(id)
