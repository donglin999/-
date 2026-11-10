extends RefCounted
## 设置页。对应原版 js/qihe-jianghu-ui.js sysPage()、saveManager()、click 分支 mute / theme / save / saves / saveList / home / controls。
## 样式照 js/qihe-jianghu-ui.css「Six settings entries」一节：padding 20px 4%、h1 26px、三列网格 gap 16、
## 按钮 min-height 145 / padding 16 10 / 背景 #faf7eef5（悬停 #e9dec4）/ 底线 1px、图标 54、strong 18、说明 12。

const K := preload("res://scripts/menu/kit.gd")

static func _muted() -> bool:
	return true if Audio.get("muted") else false

## BUI.theme：Godot 版战斗界面无主题切换，固定按「墨迹题签」显示（见 menu-notes.md）
static func _theme() -> String:
	var bui = Engine.get_singleton("BUI") if Engine.has_singleton("BUI") else null
	return "卷轴木牌" if bui and bui.get("theme") == "scroll" else "墨迹题签"

## 2026-11-06 重设计（preview-v3 设置页，第四十轮第 2 题整改）：左「行路与声画」三组设置项，每项右边直接是开关或按钮；
## 右「键位一览」。存档不放页里，点「存档管理」弹居中窗口。没有队员列。
static func build(m, _v: Dictionary) -> Control:
	var root := K.margin(30, 24, 30, 14)
	var row := K.hbox(16)
	root.add_child(row)
	var col := K.vbox(8)
	var sc := K.scroll(); sc.add_child(col); K.expand(col)
	# 11-10 第四十九轮：下面是声画、存档、其他三组，题签改“设置”
	var main := K.titled("设置", sc); K.expand(main, 64, true, true)
	row.add_child(main)
	var head := K.hbox(10)
	head.add_child(K.expand(K.lab("归云谷 · 培养" if m.from_cultivation else "栖河试玩 · 四向地图版", 15, Color("#5d5340"))))
	var side := Flow.get_node_or_null("Side")
	if side and side.has_method("milestone_latest"): head.add_child(K.lab("当前进度：" + str(side.milestone_latest(G.S)), 13, Color("#7c6543")))
	col.add_child(head)
	col.add_child(_group("声画", [
		["mute", "sys", "声音", "开启或关闭全部声音", _switch(not _muted())]]))
	# 11-10 菜单扫荡查出：“战斗界面 · 指令样式”点了没有任何反应——Godot 版战斗只有一套样式，这一项撤掉
	col.add_child(_group("存档", [
		["save", "bag", "快速保存", "覆盖保存当前进度", _value("保存")],
		["saves", "quest", "存档管理", "新建、载入、整理手动存档", _value("打开…")]]))
	var other := [["controls", "attr", "操作说明", "键盘 · 鼠标 · 触摸", _value("查看…")],
		["home", "party", "返回首页", "保存后回到开始界面", _value("返回首页", true)]]
	# 2026-11-05 统一 Esc 菜单：培养模式原来的“养成设置”小面板并进这里，培养专有的几项只在培养模式出现
	if m.from_cultivation:
		other += [["cu-record", "skill", "修习成果", "历次修习的记录", _value("查看…")], ["cu-games", "bag", "小游戏试玩", "候选试玩，不推进行程", _value("打开…")]]
		if OS.is_debug_build(): other.append(["cu-schedule", "quest", "调试：谷中日程", "只在调试版出现", _switch(CuHubViews.debug_schedule)])
	col.add_child(_group("其他", other))
	var keys := K.titled("键位一览", _kbd_list()); keys.custom_minimum_size.x = 380
	row.add_child(keys)
	return root

## 一组设置：小题签 + 一行一项（整行可点）
static func _group(title: String, rows: Array) -> Control:
	var box := K.vbox(0)
	var tag := K.panel(Color("#efe4c8"), Color(K.FRAME_LINE, 0.7), [1, 1, 1, 1], [12, 1, 12, 2])
	tag.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tag.add_child(K.lab(title, 14, K.INK, true, 3))
	box.add_child(tag)
	var list := K.panel(Color("#fbf7ee88"), Color(K.FRAME_LINE, 0.35), [1, 1, 1, 1], [10, 2, 10, 2])
	var v := K.vbox(0); list.add_child(v)
	for i in rows.size():
		var e: Array = rows[i]
		var c := K.card(e[0], {}, false, 14, K.sb(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.25), [0, 0, 0, 0 if i == rows.size() - 1 else 1]),
			K.sb(Color("#efe4c9aa"), Color(K.FRAME_LINE, 0.25), [0, 0, 0, 0 if i == rows.size() - 1 else 1]), null, [8, 4, 6, 4])
		K.expand(c)
		var b := K.content(c)
		b.alignment = BoxContainer.ALIGNMENT_BEGIN
		b.add_child(K.painted("nav", e[1], 36))
		var t := K.vbox(1); K.expand(t); t.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		t.add_child(K.lab(e[2], 17, K.INK, true, 3))
		t.add_child(K.lab(e[3], 12, Color("#6d6251")))
		b.add_child(t)
		var ctl: Control = e[4]; ctl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		b.add_child(ctl)
		v.add_child(c)
	box.add_child(list)
	return box

## 「开｜关」两段显示（整行点击切换）
static func _switch(on: bool) -> Control:
	var h := K.hbox(0)
	for x in [["开", true], ["关", false]]:
		var sel: bool = x[1] == on
		var p := K.panel(Color("#b0443a") if sel else Color("#f7f2e3"), Color("#a08a5c"), [1, 1, 1 if not x[1] else 0, 1], [16, 2, 16, 3])
		p.add_child(K.lab(x[0], 14, Color("#fbf3e2") if sel else Color("#6d6251"), sel))
		h.add_child(p)
	return h

## 右侧按钮样的值（整行点击触发；red 为朱红细框）
static func _value(text: String, red := false) -> Control:
	var p := K.panel(Color("#f8e9e2") if red else Color("#f7f2df"), Color("#b0443a") if red else Color("#a08a5c"), [1, 1, 1, 1], [14, 3, 14, 4])
	p.custom_minimum_size.x = 150
	var l := K.lab(text, 14, Color("#a8352a") if red else K.INK); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	p.add_child(l)
	return p

## 键位一览：两列（键框 + 说明）
static func _kbd_list() -> Control:
	var v := K.vbox(0)
	for r in CONTROLS:
		var row := K.panel(Color(0, 0, 0, 0), Color(K.FRAME_LINE, 0.25), [0, 0, 0, 1], [4, 6, 4, 6])
		var h := K.hbox(12); row.add_child(h)
		var kb := K.panel(Color("#f8f3e6"), Color("#a38e58"), [1, 1, 1, 2], [6, 0, 6, 1])
		kb.custom_minimum_size.x = 96; kb.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		var kl := K.lab(r[0], 12, K.INK, true, 0, true); kl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		kb.add_child(kl)
		h.add_child(kb)
		var l := K.lab(r[1], 13); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER; l.clip_text = true; K.expand(l)
		h.add_child(l)
		v.add_child(row)
	return v

const CONTROLS := [["I", "队伍 / 返回"], ["K", "武学"], ["B", "行囊"], ["L", "行记"], ["J", "行记 · 看当前一件"], ["M", "地图开关（探索时）"],
	["Q / E", "翻页"], ["Z / C", "切换人物"], ["Tab / 方向键", "移动焦点"], ["Enter", "选择"], ["Esc", "逐层返回 · 探索和培养时打开设置"]]

static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	match act:
		"mute":
			m.commit("setMute")
		"theme":
			# 原版 commit('setTheme') 切换 BUI.theme；Godot 版尚无战斗界面主题（需核心接口），此处不改状态
			var bui = Engine.get_singleton("BUI") if Engine.has_singleton("BUI") else null
			if bui and bui.has_method("set_theme"):
				bui.set_theme("ink" if bui.get("theme") == "scroll" else "scroll"); m.draw()
		"save":
			var ok := [false]
			m.commit("save", {}, func(): ok[0] = true)
			if ok[0]: m.notify("已保存当前进度")
		"saves":
			_save_manager(m, "active")
		"saveList":
			_save_manager(m, "trash" if id == "trash" else "active")
		"saveNew":
			_name_form(m, null)
		"saveRename":
			_name_form(m, id)
		"saveNameApply":
			var e = m.s.get("saveNameEdit")
			_apply_name(m, e.text if is_instance_valid(e) else "")
		"saveLoad":
			m.confirm("保存当前进度并载入这份存档？手动存档原件会保留。", func(): _cmd(m, "load", [id]))
		"saveArchive":
			m.confirm("将这份存档移入回收站？可随时在回收站恢复。", func(): _cmd(m, "archive", [id]))
		"saveRestore":
			_cmd(m, "archive", [id, true])
		"home":
			m.guard(func(): m.confirm("保存当前进度并返回首页？之后可选择继续进度。", func(): _home(m)))
		"cu-record", "cu-games":
			Cultivation.after_menu = "training-record" if act == "cu-record" else "games"
			m.close()
		"cu-schedule":
			CuHubViews.debug_schedule = not CuHubViews.debug_schedule
			m.draw()
		"controls":
			m.detail("操作说明", func(_mm):
				var v := K.vbox(12)
				v.add_child(_kbd_grid())
				v.add_child(K.para("触摸屏点击图标查看，再点确认执行。", 13, K.INK, 1.6))
				return v)
		_:
			return false
	return true

## .qj-data-grid 两列：kbd + 说明
static func _kbd_grid() -> Control:
	var p := K.panel(Color("#a38e5833"), Color("#a38e5833"), [1, 1, 1, 1])
	var g := K.grid(2, 1, 1); p.add_child(g)
	for r in CONTROLS:
		var cell := K.panel(Color("#eee7d4"), Color(0, 0, 0, 0), [0, 0, 0, 0], [12, 10, 12, 10])
		K.expand(cell)
		var h := K.hbox(10); cell.add_child(h)
		var kb := K.panel(Color("#f8f3e6"), Color("#a38e58"), [1, 1, 1, 2], [6, 1, 6, 1])
		kb.add_child(K.lab(r[0], 12, K.INK, true, 0, true))
		h.add_child(kb)
		var l := K.lab(r[1], 13); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		h.add_child(l)
		g.add_child(cell)
	return p

## saveCommand(type,args,refresh)：调 G.save_command（对应原版 QiheSaves.command），成功后刷新列表，失败只提示原因
static func _cmd(m, type: String, args := [], refresh := true) -> Dictionary:
	var r: Dictionary = G.save_command(type, args)
	if r.ok and not r.get("navigating", false) and refresh:
		_save_manager(m, "active" if type == "create" else str(m.s.get("saveView", "active")))
	if r.get("navigating", false): m.close()
	m.notify(str(r.get("message", r.get("reason", ""))))
	return r

## saveManager(view)：存档 / 回收站两栏，每行“载入 · 重命名 · 移入回收站”或“恢复”
static func _save_manager(m, view: String) -> void:
	m.s.saveView = view
	var rows: Array = []
	for r in G.save_list():
		if (view == "trash") == preload("res://scripts/npc/util.gd").t(r.get("archived", false)): rows.append(r)
	m.detail("存档管理", func(_mm):
		var v := K.vbox(10)
		v.add_child(K.para("手动存档保留当前节点，载入后另开旅程继续。存档保存在本机。", 13, K.INK, 1.6))
		var bar := K.hbox(8)
		bar.add_child(K.btn("存档", "saveList", {"id": "active"}, "on" if view == "active" else "", 14, [14, 4, 14, 4], 34))
		bar.add_child(K.btn("回收站", "saveList", {"id": "trash"}, "on" if view == "trash" else "", 14, [14, 4, 14, 4], 34))
		bar.add_child(K.expand(K.spacer()))
		bar.add_child(K.btn("新建存档", "saveNew", {}, "primary", 14, [14, 4, 14, 4], 34))
		v.add_child(bar)
		for r in rows:
			v.add_child(_save_row(r, view))
		if rows.is_empty():
			v.add_child(K.lab("回收站为空" if view == "trash" else "暂无存档，可新建保存当前进度", 13, Color("#6f6553")))
		return v, [], {"modal": true, "back_label": "回到设置"})

## 原版 date(t)：new Date(t).toLocaleString('zh-CN',{hour12:false})，本地时间，形如 2026/11/3 06:57:12
static func _date(at) -> String:
	if at == null or str(at) == "": return "旧存档，时间未记录"
	var u := Time.get_unix_time_from_datetime_string(str(at).replace("Z", ""))
	if u <= 0: return "旧存档，时间未记录"
	var d := Time.get_datetime_dict_from_unix_time(int(u) + Time.get_time_zone_from_system().bias * 60)
	return "%d/%d/%d %02d:%02d:%02d" % [d.year, d.month, d.day, d.hour, d.minute, d.second]

static func _save_row(r: Dictionary, view: String) -> Control:
	var cur: bool = r.get("current", false)
	var p := K.panel(Color("#f3ead6") if cur else Color("#faf7ee"), K.RULE, [0, 0, 0, 1], [12, 10, 12, 10])
	var row := K.hbox(12); p.add_child(row)
	# 地点缩略图：存档所在场景的底图（2026-11-06 弹窗版新加）
	var stt = r.get("state")
	var bgk = World.scenes.get(stt.get("scene", ""), {}).get("bg") if stt is Dictionary else null
	var th := QJFitTex.new(); th.cover = true
	th.custom_minimum_size = Vector2(120, 68); th.clip_contents = true
	if bgk is String: th.set_tex(Assets.tex(bgk))
	th.draw.connect(func(): th.draw_rect(Rect2(Vector2.ZERO, th.size), Color(K.FRAME_LINE, 0.8), false, 1.0))
	row.add_child(th)
	var v := K.vbox(4); K.expand(v); row.add_child(v)
	var h := K.hbox(8)
	h.add_child(K.lab(str(r.name), 16, K.INK, true))
	if cur: h.add_child(K.lab("当前", 12, Color("#8d6d33")))
	v.add_child(h)
	var st = r.get("state")
	var desc := "记录损坏，原件已保留"
	if st is Dictionary:
		var ms: String = Flow.milestone_latest(st) if Flow.has_method("milestone_latest") else "初到栖河"
		desc = ms + " · " + str(World.scenes.get(st.get("scene", ""), {}).get("name", ""))
	v.add_child(K.lab(desc, 13))
	v.add_child(K.lab(("手动存档" if r.get("manual", false) else "自动进度") + " · " + _date(r.get("savedAt")), 12, Color("#6f6553")))
	if r.get("invalid", false): return p
	var acts := K.hbox(6); acts.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	if view == "trash":
		acts.add_child(K.btn("恢复", "saveRestore", {"id": r.key}, "", 13, [10, 3, 10, 3], 30))
	else:
		if not cur: acts.add_child(K.btn("载入", "saveLoad", {"id": r.key}, "", 13, [10, 3, 10, 3], 30))
		acts.add_child(K.btn("重命名", "saveRename", {"id": r.key}, "", 13, [10, 3, 10, 3], 30))
		if not cur: acts.add_child(K.btn("移入回收站", "saveArchive", {"id": r.key}, "", 13, [10, 3, 10, 3], 30))
	row.add_child(acts)
	return p

## saveNameForm(key)：新建 / 重命名的名称输入
static func _name_form(m, key) -> void:
	m.s.saveEdit = key
	var cur_name := ""
	if key != null:
		for r in G.save_list():
			if r.key == key: cur_name = str(r.name)
	var acts := [["确认重命名" if key != null else "保存为新存档", "saveNameApply", {}, "primary"], ["回到存档列表", "saves"]]
	m.detail("重命名存档" if key != null else "新建存档", func(_mm):
		var v := K.vbox(10)
		v.add_child(K.lab("存档名称", 14, K.INK, true))
		var e := LineEdit.new(); e.name = "SaveName"; e.max_length = 24; e.text = cur_name; e.placeholder_text = "例如：入谷前"
		e.add_theme_font_override("font", UI.song); e.add_theme_font_size_override("font_size", 16)
		e.custom_minimum_size = Vector2(320, 38)
		e.text_submitted.connect(func(_t): _apply_name(m, e.text))
		v.add_child(e)
		m.s.saveNameEdit = e
		e.call_deferred("grab_focus")
		v.add_child(K.para("修改名称不会改变剧情进度。" if key != null else "保存完整当前进度，已有存档保留。", 13, K.INK, 1.6))
		return v
	, acts, {"modal": true})

static func _apply_name(m, text: String) -> void:
	var key = m.s.get("saveEdit")
	if key != null: _cmd(m, "rename", [key, text])
	else: _cmd(m, "create", [text])

static func _home(m) -> void:
	_cmd(m, "home", [], false)
