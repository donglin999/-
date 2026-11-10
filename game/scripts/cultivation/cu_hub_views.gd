class_name CuHubViews
extends RefCounted
## 培养主界面各分支画面（原版 js/qh-mode-cultivation.js 的 renderPending/renderActivityStory/renderVisitorStory/
## renderArrival/renderOffer/renderDelivery/renderNotices/renderRest/renderSummary/renderDeparture/renderTravel/
## renderCompletion/renderSettings/renderGames/renderPicker/renderWalkReview/renderBroken/visitorBulletin）。
## h 为 Cultivation 自动加载节点。

## 原版 debugSchedule()（localStorage cu.debugSchedule，缺省开）
static var debug_schedule := true

static func _q_next(cmd: String, label := "继续对白") -> Button: return CuStory.next(cmd, label)
static func _q_answer(cmd: String, id: String, label: String, cost = null) -> Button: return CuStory.answer(cmd, id, label, cost)

## 原版 renderBroken()
static func broken(h: Node) -> void:
	var bg := CuUI.img("assets/production/cultivation/bg_mountain_spring_v1.png", TextureRect.STRETCH_KEEP_ASPECT_COVERED)
	CuUI.fill(bg); h.root.add_child(bg)
	CuHub.panel(h, "培养存档无法读取", [
		CuHub.p("这份培养进度与当前版本不兼容，无法自动修复：" + str(h.broken.error)),
		CuHub.p("选择「以新的培养进度继续」时，原进度会先整份另存在存档里，不会删除；也可以先返回首页，用其他存档继续。"),
		CuHub.row([CuUI.btn("以新的培养进度继续", "recovery-restart"), CuUI.btn("返回首页", "recovery-title")])], false)

## 原版 renderPending()
static func pending(h: Node) -> void:
	var s: Dictionary = h.state()
	var lp: Dictionary = s.pending
	var r = lp.get("result")
	if lp.stage == "result" and r is Dictionary and r.get("lesson"):
		var ls: Array = r.lesson.lines
		var at: int = min(int(lp.get("lessonCursor", 0)), ls.size() - 1)
		var l: Array = ls[at]
		var la: Dictionary = CuDB.action(lp.action)
		var el := CuStory.render(h.root, {"title": la.name, "text": l[1], "speaker": l[0], "cast": ["hero", r.lesson.speaker], "buttons": [_q_next("result-close" if at == ls.size() - 1 else "lesson-next")]})
		h.apply_scene(la)
		el.set_meta("lesson", r.lesson.get("kind"))
		return
	var p: Dictionary = s.pending
	var a: Dictionary = CuDB.action(p.action)
	var playing: bool = p.get("animation") is Dictionary and not p.animation.done
	if p.get("story"): activity_story(h, a, p); return
	if a.get("mail"): CuMail.mount(h, "result" if p.stage == "result" else "motion"); return
	h.apply_scene(a)
	CuHub.footer(h, h.ui, h.available_actions(h.category()), true)
	h.ui.board = CuHub.board(h, {"guidance": not not p.get("guidance"), "teacher": a.get("teacher"), "action": a, "playing": playing})
	if p.stage == "result":
		var rr: Dictionary = p.result
		var nodes := [CuHub.gain_title(str(rr.get("feedback", "")) if a.get("mail") else CuHub.gain_summary(rr))]
		var res: Dictionary = CuCore.D().resources
		for k in rr.get("outputs", {}): nodes.append(CuHub.small("%s +%s" % [res.get(k, k), str(rr.outputs[k])]))
		nodes.append_array(CuHub.training_result(rr))
		nodes.append(CuUI.btn("继续培养", "result-close"))
		CuHub.gain_box(h, nodes)
		return
	if not playing and p.stage == "choice" and not h.direct_result():
		var btns := []
		var ch: Array = a.get("choice", [])
		for i in ch.size(): btns.append(CuUI.btn(str(ch[i]), "resolve", str(i)))
		var rw := CuHub.row(btns)
		rw.set_meta("dialog", true)
		CuUI.place(rw, CuUI.W * 0.29, CuUI.H * 0.68, CuUI.W * 0.42, 60)
		h.root.add_child(rw)

## 原版 renderActivityStory(a, p)
static func activity_story(h: Node, a: Dictionary, p: Dictionary) -> void:
	if a.get("visitor"): visitor_story(h, a, p); return
	var s: Dictionary = h.state()
	var labels := {"zhou": "周砚", "ye": "叶蘅", "lu": "陆衡"}
	var person := "neighbor"
	for id in labels: if labels[id] == a.get("teacher"): person = id
	var choice: bool = p.stage == "choice" and int(p.get("storyStep", 0)) == 1
	var result: bool = p.stage == "result"
	var fd = s.facts.get("first_delivery")
	var lines = null
	if a.get("introByDelivery") is Dictionary and fd is Dictionary: lines = a.introByDelivery.get(fd.get("method"))
	if lines == null: lines = a.get("introLines")
	if lines == null: lines = [{"speaker": person, "text": a.get("task", "")}]
	var line: Dictionary = lines[min(int(p.get("storyLine", 0)), lines.size() - 1)]
	var text: String = str(a.get("resultLine", a.get("feedback", ""))) if result else ("我想先……" if choice else str(line.text))
	var speaker: String = person if result else ("hero" if choice else str(line.speaker))
	var buttons := []
	if result: buttons = [_q_next("story-result-close", "结束这段剧情")]
	elif choice:
		var ch: Array = a.get("choice", [])
		for i in ch.size(): buttons.append(_q_answer("resolve", str(i), str(ch[i])))
	else: buttons = [_q_next("activity-story-next")]
	var sc = h.apply_scene(a)
	var cast = line.get("cast", a.get("cast", ["hero", person]))
	var el := CuStory.render(h.root, {"title": CuHub.name_of(a), "text": text, "speaker": speaker, "cast": cast, "choice": choice, "buttons": buttons, "night": sc.shown == "night"})
	CuHubPlace.tag(el, sc)

## 原版 renderVisitorStory(a, p)
static func visitor_story(h: Node, a: Dictionary, p: Dictionary) -> void:
	var x: Dictionary = CuDB.copy(CuVisitors.current(p))
	var result: bool = p.stage == "result"
	var choice: bool = x.get("choices") != null and not result
	var sc = h.apply_scene(h.line_scene(x, a))
	if x.get("speaker") == "title" and not result:
		CuHubPlace.time_card(h.root, str(x.text), _q_next("visitor-next", "继续"))
		return
	var buttons := []
	if result: buttons = [_q_next("story-result-close", "结束这段剧情" if a.get("household") else "结束来访，继续培养")]
	elif choice:
		var ph = p.visitor.get("context", {}).get("preHangao")
		if a.get("training") and not (ph is Dictionary and ph.get("route") == "life"): buttons = [_q_answer("visitor-training", "", "开始考校：按师父口令收招")]
		elif a.get("fight"): buttons = [_q_answer("visitor-fight", "", "开始切磋" if a.get("sparWith") else "迎战")]
		else:
			var cs: Array = x.choices
			for i in cs.size(): buttons.append(_q_answer("visitor-choice", str(i), str(cs[i].text)))
	else: buttons = [_q_next("visitor-next")]
	if choice and a.get("fight"): x.text = "（摆开架势。）" if a.get("sparWith") else "（握紧手里的家伙。）"
	var cast = x.get("cast") if x.get("cast") != null else a.get("cast")
	var line = {"speaker": x.get("speaker"), "text": x.get("text"), "duo": x.get("duo"), "duoCast": x.get("duoCast")} if result else x
	var el := CuStory.render(h.root, {"title": a.name, "text": x.get("text", ""), "speaker": x.get("speaker", "narrator"), "cast": cast, "choice": choice, "buttons": buttons, "event": a.id, "line": line, "night": sc.shown == "night"})
	CuHubPlace.tag(el, sc)
	if x.get("letterAuthor"):
		# 原版 .cu-letter-scene：说话人标题改为“{作者} · 署名信件”
		var lb := _find_title(el, CuStory.labels().get(x.speaker, x.speaker))
		if lb != null: lb.text = str(x.letterAuthor) + " · 署名信件"
	var rr = p.get("result")
	if result and rr is Dictionary and (rr.get("gain") or rr.get("taught") or (rr.get("relationshipChanges") is Array and rr.relationshipChanges.size())):
		var nodes := []
		if rr.get("gain"): nodes.append(CuUI.para("✦ " + CuHub.gain_summary(rr), CuUI.fs(12, 1.1, 22), Color("#f4e8c8"), 0, true))
		for n in CuHub.training_result(rr):
			if n is Label: n.add_theme_color_override("font_color", Color("#f4e8c8"))
			nodes.append(n)
		var box := CuUI.panel_box(CuUI.box(Color("#334638d9"), Color(0, 0, 0, 0), 0, 22, 16))
		var col := VBoxContainer.new()
		for n in nodes:
			if n is Label: n.custom_minimum_size.x = CuUI.W * 0.3
			col.add_child(n)
		box.add_child(col)
		el.add_child(box)
		box.resized.connect(func(): box.position = Vector2(CuUI.W * 0.97 - box.size.x, CuUI.H * 0.81 - box.size.y))

static func _find_title(n: Node, text) -> Label:
	if n is Label and n.text == str(text): return n
	for c in n.get_children():
		var r := _find_title(c, text)
		if r != null: return r
	return null

## 原版 renderArrival()
static func arrival(h: Node) -> void:
	CuStory.render(h.root, {"title": "归云谷 · 正式入门", "text": h.story_text("arrival", "既入了门，就安心留下。\n明早来练场，我教你站桩和调息。"), "buttons": [_q_next("arrival-next")], "moods": {"hero": "serious", "zhou": "serious"}})

## 原版 renderOffer()
static func offer(h: Node) -> void:
	var s: Dictionary = h.state()
	var skills := []
	var advanced := false
	for a in CuCore.actions():
		if a.category == "skill" and a.get("learn") and not s.learned.get(a.learn) and str(CuCore.availability(s, a)) == "":
			skills.append(a)
			if str(a.id).begins_with("TR_"): advanced = true
	var dlg = s.get("dialogue")
	var choice: bool = dlg is Dictionary and dlg.get("id") == "weapon-offer" and dlg.get("period") == CuCore.period(s)
	var text: String
	if advanced: text = "我想请教……" if choice else "旧课练得如何，我都看过了。\n今天可以往下学了，选好一门，我带你练。"
	else: text = h.story_text("offer-choice", "师父，我想学……") if choice else h.story_text("offer", "今天的新课已经可以开始了。\n选好要学的，我带你拆开练。")
	var buttons := []
	if choice:
		for a in skills: buttons.append(_q_answer("teach", a.id, CuHub.name_of(a), CuCore.actionCost(a)))
		buttons.append(_q_answer("offer-later", "", "改日受教"))
	else: buttons = [_q_next("offer-next")]
	CuStory.render(h.root, {"title": "周砚传艺", "text": text, "speaker": "hero" if choice else "zhou", "choice": choice, "moods": {"hero": "serious", "zhou": "serious"}, "buttons": buttons})

## 原版 renderDelivery()
static func delivery(h: Node) -> void:
	var s: Dictionary = h.state()
	var dlg = s.get("dialogue")
	var choice: bool = dlg is Dictionary and dlg.get("id") == "delivery"
	var text: String
	if choice: text = h.story_text("delivery-choice", "这段路，我想……")
	elif s.learned.get("footwork"): text = h.story_text("delivery-trained", "你练过落脚，前面那段跟我走。别光盯着脚下，也看看同伴在哪儿。")
	else: text = h.story_text("delivery-untrained", "步法还没练过，就先帮着分包。路上拿不准，叫我一声，别硬撑。")
	var buttons: Array = [_q_answer("story-complete", "协同行路", "留意落脚，协同行路"), _q_answer("story-complete", "请陆衡指导", "请陆衡指出稳妥的路")] if choice else [_q_next("delivery-next")]
	CuStory.render(h.root, {"title": "三月中旬 · 同行送药", "text": text, "speaker": "hero" if choice else "lu", "cast": ["hero", "ye", "lu"], "choice": choice, "buttons": buttons})

## 原版 renderNotices()
static func notices(h: Node) -> void:
	var s: Dictionary = h.state()
	var body := []
	for l in s.letters:
		if str(l.id).begins_with("notice-") and not l.get("read") and int(l.due) <= CuCore.period(s): body.append(CuHub.p(str(l.body)))
	body.append(CuUI.btn("知道了 · 继续培养", "notice-close"))
	CuHub.panel(h, "谷中消息", body, false, [27.0, 25.0, 27.0, 27.0], true)

## 原版 renderRest()
static func rest(h: Node) -> void:
	var s: Dictionary = h.state()
	CuHub.panel(h, "结束本期", [CuHub.p("结束本期，自由安排下期活动。"), CuHub.p("下一阶段：" + CuHub.next_date(s)),
		_left(CuUI.btn("继续安排", "close")), _left(CuUI.btn("确认休息", "rest-confirm"))])

## .cu-panel-body 是 flex 列、align-items:flex-start：按钮各占一行、按内容收宽
static func _left(b: Control) -> Control:
	b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	return b

## 原版 renderSummary()
static func summary(h: Node) -> void:
	var s: Dictionary = h.state()
	var t: Dictionary = s.summary
	var body := [CuHub.p("完成%d次活动或行程。" % t.entries.size())]
	body.append_array(CuHub.record(s))
	body.append(CuUI.btn("继续", "summary-close"))
	CuHub.panel(h, "第%d月 · 月底小结" % int(t.month), body, false)

## 原版 renderDeparture()
static func departure(h: Node) -> void:
	CuHub.panel(h, "整月历练", [CuHub.p("本月用于自由探索，占用整月五期；谷中活动暂停。"), CuHub.p("返程后直接进入第 %d 月月初。" % (int(h.state().month) + 1)), CuUI.btn("出发", "depart", "", true)], false)

## 原版 renderTravel()
static func travel(h: Node) -> void:
	var s: Dictionary = h.state()
	if s.journey.get("kind") == "hangao_gate":
		h.apply_scene({"place": "hangao_gate", "time": "day"})
		CuHub.panel(h, "汉皋 · 南门", [CuHub.p("这一程，到这里。未完待续。"), CuHub.p("同行之人、行囊与一路见闻都已记下。"),
			CuHub.row([CuUI.btn("查看行记", "jianghu"), CuUI.btn("返回标题 · 已保存", "gate-title")])], false)
		return
	var btns: Array = [CuUI.btn("确认返程 · 进入下月", "return-confirm", "", true), CuUI.btn("继续探索", "return-cancel")] if h.view == "return-preview" else [CuUI.btn("准备返程", "return-preview")]
	CuHub.panel(h, "本月行程", [CuHub.p("本月整月在外历练。提前返程仍占整月。"), CuHub.row(btns)], false, [15.0, 19.0, 15.0, 25.0])

## 原版 renderCompletion()
static func completion(h: Node) -> void:
	var body := [CuHub.p("36个月已经走完。学习来源、生活材料与实际经历均已保留。"), CuHub.p("正式出师剧情与后续章节仍待补充。"), CuUI.btn("查看修习成果", "completion-record")]
	if h.view == "completion-record": body.append_array(CuHub.record(h.state()))
	CuHub.panel(h, "三年修习收束", body, false)

## 原版 renderSettings()
static func settings(h: Node) -> void:
	var muted := AudioServer.is_bus_mute(0)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 8)
	for b in [CuUI.btn("开启声音" if muted else "关闭声音", "sound"), CuUI.btn("武学与装备", "martial-menu"),
		CuUI.btn("调试：谷中日程 " + ("开" if debug_schedule else "关"), "debug-schedule"), CuUI.btn("查看修习成果", "training-record"), CuUI.btn("小游戏候选试玩", "games")]:
		col.add_child(b)
	CuHub.panel(h, "养成设置", [col, CuHub.small("候选试玩不推进行程，不计入剧情与修习成果。", Color("#765e3e"))])

## 原版 renderGames()
static func games(h: Node) -> void:
	var r := CuHub.panel(h, "小游戏候选试玩", [], true, [10.0, 22.0, 10.0, 25.0])
	CuMinigames.mount(r.body, r.box)

## 原版 renderPicker()
static func picker(h: Node) -> void:
	var cat: Dictionary = h.category()
	if cat.id == "mail":
		var kind := "inbox" if h.view == "mail-inbox" else ("gift" if h.view == "gift-npc" else ("letter" if h.view == "letter-npc" else "mail"))
		CuMail.mount(h, kind); return
	var list: Array = h.available_actions(cat)
	CuHub.footer(h, h.ui, list)
	if list.is_empty():
		var e := CuUI.lbl("尚未学会招式，受教后在此练习。", CuUI.fs(14, 1.6, 28), Color("#765e3e"))
		e.position = Vector2(CuUI.W * 0.3, CuUI.H - CuUI.H * 0.17 + CuUI.H * 0.06)
		h.root.add_child(e)

## 原版 renderWalkReview()
static func walk_review(h: Node) -> void:
	var s: Dictionary = h.state()
	var a: Dictionary = CuDB.action("W04")
	h.apply_scene(a)
	CuHub.footer(h, h.ui, h.available_actions(h.category()), true)
	h.ui.board = CuHub.board(h, {"action": a})
	var hist = null
	for x in s.history:
		if x.get("period") == CuCore.period(s) and x.get("action") == "W04": hist = x
	CuHub.gain_box(h, [CuHub.gain_title("本期溪畔观察"), CuHub.small(str(a.get("feedback", ""))),
		CuHub.small("已记录成果＋%s · 本次查看免费" % str(hist.get("gain", 0) if hist else 0)), CuUI.btn("返回", "close")])

## 原版 strollPlaceName(d)
static func _stroll_place_name(d: Dictionary) -> String:
	return str(CuScenes.PLACES()[CuScenes.placeKey(d.get("place"))].name).replace("归云谷 · ", "")

## 原版 householdLines(s)：返回 [标题, 说明] 列表
static func _household_lines(s: Dictionary) -> Array:
	var out := []
	for d in CuHousehold.upcoming(s):
		if d.get("quiet"): continue
		if (d.get("heart") or d.get("bottleneck") or d.get("mentor")) and str(CuCore.availability(s, CuDB.action(d.id))) != "": continue
		var t: String
		if d.get("heart"): t = "心意 · " + str(d.heart) + " · " + str(d.name)
		elif d.get("auto"): t = "师门 · " + str(d.name)
		else: t = "师门支线 · " + str(d.name)
		var w: String
		if d.get("auto"): w = "到期自动开场"
		elif d.get("heart"): w = "闲逛" + _stroll_place_name(d) + ("（夜）" if d.get("time") == "night" else "") + " · 随时可去，不会过期"
		else: w = "闲逛" + _stroll_place_name(d) + " · 至" + CuHub.date({"month": floori(int(d.window[1]) / 5.0) + 1, "phase": int(d.window[1]) % 5})
		out.append([t, w])
	return out

## 原版 visitorBulletin()：调试用谷中日程（top 24% left 3% max-width 30%）
static func bulletin(h: Node) -> void:
	var s: Dictionary = h.state()
	if s.mode != "home": return
	var now := CuCore.period(s)
	var rows := _household_lines(s)
	for d in CuVisitors.definitions():
		if not (now >= int(d.window[0]) - 2 and now <= int(d.window[1]) + 1): continue
		var w: String
		if s.facts.get(d.id + "_seen"): w = "交谈已完成，相遇已记录"
		elif now > int(d.window[1]): w = str(d.get("expired", ""))
		elif now < int(d.window[0]): w = str(d.get("notice", ""))
		else: w = "在接待廊参与交谈"
		rows.append([str(d.teacher) + " · " + str(CuVisitors.status(s, d)), w])
	if rows.is_empty(): return
	# .cu-visitor-bulletin：font-size clamp(11px,1.1cqw,20px)，padding .7em 1em，宽度随内容、最多 30%；
	# strong 本字号加粗（家务行 #2f5a44），span .86em、上距 .3em，段距 .6em；调试签 .8em、透明 .6、字距 .1em
	var fs := CuUI.fs(11, 1.1, 20)
	var sb := CuUI.box(Color("#f5eddae8"), Color("#ae9368"), int(CuUI.PX), int(6 * CuUI.PX))
	sb.content_margin_left = fs; sb.content_margin_right = fs; sb.content_margin_top = fs * 0.7; sb.content_margin_bottom = fs * 0.7
	sb.shadow_color = Color("#241b1522"); sb.shadow_size = int(8 * CuUI.PX); sb.shadow_offset = Vector2(0, 2 * CuUI.PX)
	var box := CuUI.panel_box(sb)
	box.name = "cu-visitor-bulletin"
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 0)
	box.add_child(col)
	var tag := CuUI.lbl("调 试 · 谷 中 日 程", int(round(fs * 0.8)), Color("#433623"))
	tag.modulate.a = 0.6
	col.add_child(_line_box(tag, fs * 0.8 * 1.45))
	var gap := Control.new(); gap.custom_minimum_size.y = fs * 0.3; col.add_child(gap)
	var max_w := CuUI.W * 0.3 - 2 * fs
	var nh := _household_lines(s).size()
	for i in rows.size():
		var r: Array = rows[i]
		var head := CuUI.lbl(r[0], fs, Color("#2f5a44") if i < nh else Color("#433623"), true)
		var sub := CuUI.lbl(r[1], int(round(fs * 0.86)), Color("#433623"))
		for l in [head, sub]:
			if l.get_minimum_size().x > max_w: l.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY; l.custom_minimum_size.x = max_w
		col.add_child(_line_box(head, fs * 1.45))
		var g1 := Control.new(); g1.custom_minimum_size.y = fs * 0.86 * 0.3; col.add_child(g1)
		col.add_child(_line_box(sub, fs * 0.86 * 1.45))
		# 家务行是 div（无段距）；来客行是 p，段距 .6em
		if i < rows.size() - 1 and i >= nh:
			var g2 := Control.new(); g2.custom_minimum_size.y = fs * 0.6; col.add_child(g2)
	box.position = Vector2(CuUI.W * 0.03, CuUI.H * 0.24)
	h.root.add_child(box)


## 单行标签按 CSS 行高（normal ≈ 1.45em）定高：Godot 的宋体字高比浏览器行盒高，逐行累加会把整栏撑长
static func _line_box(l: Label, line_h: float) -> Control:
	if l.autowrap_mode != TextServer.AUTOWRAP_OFF: return l
	var c := Control.new()
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var f: Font = l.get_theme_font("font")
	var sz: int = l.get_theme_font_size("font_size")
	var fh: float = f.get_height(sz)
	c.custom_minimum_size = Vector2(f.get_string_size(l.text, HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x + 2, line_h)
	l.position = Vector2(0, (line_h - fh) / 2.0)
	c.add_child(l)
	return c
