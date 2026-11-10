extends RefCounted
## 行记数据源与任务追踪。
## 对应原版 js/qihe-journal.js（QiheJournal：phase / knowledge / tasks / people / recordEncounter）
## 与 js/qihe-jianghu-ui.js 的 questEntriesUI / trackState / isTracked / trackedQuests / newQuests / mainTracked / setTracked。
## 人物底表、委托定义、山居人物从原版字面量抽成 res://data/menu/journal.json（文案未改）。
## 除 record_encounter 与追踪写入外都是纯函数，每次重算。

## 11-10 第四十九轮：主线标题不再一律叫“眼下”，跟着当前这一段走（MAIN_TITLES）；“眼下”留着认旧存档里的追踪开关
const MAIN_TITLES := ["初到栖河", "村中走访", "正道盟上门", "三方来人", "撤离栖河", "邻村对证", "山居"]
const MAIN_QUEST_RE := "^((眼下|初到栖河|村中走访|正道盟上门|三方来人|撤离栖河|邻村对证|山居)$|(开始|培养|游历|终局|序章|第.+章)\\s*·)"
const IDENT_RE := {"xulingyi": "文议|正道盟|核办", "censhuang": "归烬堂|交涉", "shenyanhui": "委办|程巡检|跑商路"}
const OWN := {"xulingyi": "letter", "censhuang": "account", "shenyanhui": "ledger"}
static var _data := {}
static var _re_main: RegEx

static func data() -> Dictionary:
	if _data.is_empty():
		_data = QJModel._json("res://data/menu/journal.json")
		var paths = DB.g("PRODUCTION_ASSET_PATHS")
		if paths == null: paths = {}
		for id in _data.cast:
			var a = _data.cast[id].get("art")
			if a is String and a.begins_with("@portrait:"):
				var k: String = a.substr(10)
				_data.cast[id].art = str(paths.get(k, "assets/production/portraits/" + k + ".webp"))
	return _data

static func CAST() -> Dictionary: return data().cast
static func QDEF() -> Dictionary: return data().questDef

static func name_id(n: String):
	for id in CAST():
		if CAST()[id].name == n: return id
	return null

static func _st(x, k: String):
	return x.get(k) if x is Dictionary else null

static func later(c) -> bool: return c is Dictionary and c.get("stage") in ["fire", "escape", "refuge", "mountain", "ended", "cultivation"]
static func departed(c) -> bool: return c is Dictionary and not (c.get("stage") in ["opening", "days"])
static func evidence(c) -> bool: return c is Dictionary and bool(c.get("events", {}).get("evidence-v2") or c.get("evidenceReviewed"))
static func seen_quest(q) -> bool: return q is Dictionary and q.get("stage") != null and q.get("stage") != "none"

static func _side():
	return Flow.get_node_or_null("Side")

static func _chapter():
	return Flow.get_node_or_null("Chapter")

## QiheMilestones.latest(s) || '江湖行卷'
static func chapter_title(s) -> String:
	var side = _side()
	if side and side.has_method("milestone_last"):
		var m = side.milestone_last(s)
		if m: return str(m)
	return "江湖行卷"

## phase(s) → {chapter, date}
static func phase(s) -> Dictionary:
	var c = _st(s, "qiheChapter")
	var chapter := chapter_title(s)
	if not (c is Dictionary): return {"chapter": chapter, "date": "初到栖河"}
	if c.stage in ["mountain", "ended", "cultivation"]: return {"chapter": chapter, "date": "山居"}
	if c.stage in ["refuge", "escape", "fire"]: return {"chapter": chapter, "date": "邻村接应" if c.stage == "refuge" else "离村途中"}
	return {"chapter": chapter, "date": {0: "第一日", 2: "第一日傍晚", 4: "第二日傍晚", 5: "第三日", 6: "第三日傍晚"}.get(int(c.get("halfDay", -1)), "村中行程")}

## knowledge(s)：met / identity
static func knowledge(s: Dictionary) -> Dictionary:
	var p: Dictionary = s.get("prologue") if s.get("prologue") is Dictionary else {}
	var c = s.get("qiheChapter")
	var out_s = p.get("outsiders") if p.get("outsiders") is Dictionary else {}
	var q: Dictionary = out_s.get("quests", {}) if out_s.get("quests") is Dictionary else {}
	var questions := {}
	if out_s.get("contacts") is Dictionary and out_s.contacts.get("questions") is Dictionary: questions.merge(out_s.contacts.questions, true)
	if c is Dictionary and c.get("questions") is Dictionary: questions.merge(c.questions, true)
	var arr: Dictionary = p.get("arrival") if p.get("arrival") is Dictionary else {}
	var g: Dictionary = arr.get("greeted", {}) if arr.get("greeted") is Dictionary else {}
	var record: Dictionary = s.get("qiheCodex", {}).get("people", {}) if s.get("qiheCodex") is Dictionary else {}
	var ev: Dictionary = c.get("events", {}) if c is Dictionary else {}
	var ch: Dictionary = c.get("choices", {}) if c is Dictionary else {}
	var er: Dictionary = p.get("errands", {}) if p.get("errands") is Dictionary else {}
	var met := {}
	for id in record:
		if CAST().has(id): met[id] = true
	for n in g:
		if g[n] and name_id(n) != null: met[name_id(n)] = true
	if arr.get("stage") == "done" or p.get("relicSeen") or c: met.ye = true
	if p.get("rested") or c or er.get("bowls") == "done": met.chen = true
	if c and c.get("stage") != "opening":
		met.apothecary = true; met.luheng = true
	var any_errand := false
	for v in er.values():
		if v != "none" and v != "closed": any_errand = true
	if any_errand or c: met.aunt = true
	if er.get("cloth") in ["collected", "done"]: met.merchant = true
	if er.get("medicine") in ["delivered", "done"]: met.elder = true
	if er.get("bowls") == "done" or ev.get("xu-meeting") or ev.get("steward") or later(c): met.zhouyan = true
	if (c is Dictionary and c.get("granted")) or ch.get("transport") or ch.get("practice") or later(c): met.luheng = true
	if ev.get("c1-00b"): met.song = true
	if ev.get("fire-start"):
		met.wukui = true; met.retainer = true; met.procurement_aide = true
	if ev.get("road-intro"): met.bandit = true
	var xu := bool(ev.get("xu-meeting") or (later(c) and ev.get("steward")))
	var three := bool(ev.get("three-meeting") or (later(c) and ev.get("medicine")))
	for key in QDEF():
		var d: Dictionary = QDEF()[key]
		if seen_quest(q.get(key)) or questions.get(d.owner + "-dispute") or (xu if d.owner == "xulingyi" else three): met[d.owner] = true
	if _st(q.get("account"), "stage") in ["checked", "done"]: met.apothecary = true
	if _st(q.get("ledger"), "stage") in ["checked", "witnessed", "done"]: met.aunt = true
	if _st(q.get("ledger"), "stage") in ["witnessed", "done"]: met.bailiff = true
	if _st(q.get("letter"), "stage") in ["checked", "done"]: met.chen = true
	var identity := {}
	for id in CAST():
		var r = record.get(id)
		identity[id] = bool((r is Dictionary and r.get("identity")) or not (id in ["xulingyi", "censhuang", "shenyanhui"]) or questions.get(id + "-dispute")
			or seen_quest(q.get(OWN.get(id, ""))) or (xu if id == "xulingyi" else three))
	return {"met": met, "identity": identity, "record": record, "q": q, "p": p, "c": c, "questions": questions, "xu": xu, "three": three}

static func step(title: String, detail: String, done := true) -> Dictionary:
	return {"title": title, "detail": detail, "done": done}

## add(r)：补齐兼容字段 t / d / done / group / giver
static func _add(rows: Array, r: Dictionary) -> void:
	var x := r.duplicate()
	x.t = r.title; x.d = r.get("origin", "") if r.get("origin") else ""; x.done = r.status == "done"
	x.group = r.kind if r.get("kind") else "支线"
	x.giver = CAST().get(r.owner, {}).get("name") if r.get("owner") else null
	for k in ["people", "progress"]:
		if not x.has(k): x[k] = []
	if not x.has("action"): x.action = null
	if not x.has("where"): x.where = ""
	rows.append(x)

## tasks(s, {mainLine})
static func tasks(s, main_line := "") -> Array:
	if not (s is Dictionary) or not (s.get("prologue") is Dictionary): return []
	var p: Dictionary = s.prologue
	var c = s.get("qiheChapter")
	var rows := []
	var k := knowledge(s)
	var re := RegEx.create_from_string("\\s*·\\s*J\\s*[^·]*")
	var line := re.sub(main_line, "", true).strip_edges()
	var prologue_done := bool(p.get("rested") or c)
	var side = _side()
	var ms_list: Array = side.milestone_list(s) if side and side.has_method("milestone_list") else []
	for i in ms_list.size():
		var m: Dictionary = ms_list[i]
		_add(rows, {"id": "ev:%d" % i, "title": m.t, "kind": "江湖经历", "status": "done", "origin": m.d, "objective": m.d, "where": "", "people": [], "action": null, "progress": [step(m.t, m.d)]})
	if not prologue_done:
		var arr = p.get("arrival")
		var prog := []
		if _st(arr, "stage") == "done": prog.append(step("进入栖河村", "与叶蘅相识，一同下山。"))
		if p.get("relicSeen"): prog.append(step("帮忙收好药箱", "叶蘅自己保管旧物。"))
		prog.append(step("继续村中行程", "准备好后收拾歇息。", false))
		_add(rows, {"id": "main:prologue", "title": "初到栖河", "kind": "主线", "status": "active", "origin": "初到栖河，在山村歇脚。帮忙与问话都是行路中相识的开始。",
			"objective": line if line != "" else "沿路下山，进入栖河村。", "where": "栖河村", "people": ["ye", "chen", "aunt"], "action": {"type": "resume", "label": "继续游玩"}, "progress": prog})
	if c is Dictionary:
		var done: bool = c.stage in ["ended", "cultivation"]
		var progress := []
		var chap = _chapter()
		var ms = chap.main_step(c) if chap and chap.has_method("main_step") else null
		if c.stage != "opening": progress.append(step("进村走访", "在栖河自由走访。"))
		if k.xu: progress.append(step("与徐令仪正式会面", "叶蘅说自己从没托人保管什么医武谱。"))
		if k.three: progress.append(step("与岑霜、沈雁回会面", "叶蘅说自己从没答应交匣子、交药样。"))
		if c.stage in ["escape", "refuge", "mountain", "ended", "cultivation"]: progress.append(step("从村中撤离", "随乡邻与药车离村。"))
		if evidence(c): progress.append(step("对一对三张附页", "陈伯拿出了原底单，三家各自认了错。"))
		if done: progress.append(step("山居安顿", "乡邻得到接应，赴山居暂住。"))
		# 11-10：叶蘅第一天早上就结伴（进了队伍），白天她先走一步、在地点等；原来写“到某处找叶蘅”读着像人丢了
		else: progress.append(step("当前行程", (str(ms.title) + "（" + str(ms.who) + "在" + str(ms.where) + "等你）") if ms else (line if line != "" else "准备好后继续当前剧情。"), false))
		if not done:
			var ppl := ["ye"]
			if k.xu: ppl.append("xulingyi")
			if k.three: ppl.append_array(["censhuang", "shenyanhui"])
			var mt := "邻村对证" if c.stage in ["refuge", "mountain"] else ("撤离栖河" if c.stage in ["fire", "escape"] else ("三方来人" if k.three else ("正道盟上门" if k.xu else "村中走访")))
			_add(rows, {"id": "main:qihe", "title": mt, "kind": "主线", "status": "active",
				"origin": "正道盟的徐令仪拿着委托上门，叶蘅却说自己从没托过人。村里来的人越来越多，说法也越来越乱。" if k.xu else "在栖河继续走访，照应乡邻，了解村里的日常与来人的消息。",
				"objective": (str(ms.title) + "：" + str(ms.who) + "先去了" + str(ms.where) + "，到那里会合。") if ms else (line if line != "" else "在村中走访，准备好后继续主线。"),
				"where": str(ms.where) if ms else phase(s).date, "people": ppl,
				"action": {"type": "npc", "id": ms.npc, "label": "去会合"} if ms else {"type": "continue", "label": "继续主线"}, "progress": progress})
		if c.stage == "cultivation":
			_add(rows, {"id": "main:cultivation", "title": "山居", "kind": "主线", "status": "active", "origin": "在归云谷安顿下来，学习与日常往来从这里继续。",
				"objective": line if line != "" else "在山居继续当前行程。", "people": ["ye", "zhouyan"], "where": "归云谷", "action": {"type": "continue", "label": "继续当前行程"},
				"progress": [step("到达山居", "已经安顿。"), step("当前行程", line if line != "" else "按当前行程继续。", false)]})
	_errand(rows, p)
	_outsider_quests(rows, k, c)
	if side and side.has_method("journal_extras"):
		side.journal_extras(func(r): _add(rows, r), func(t, d, dn = true): return step(t, d, dn))
	var acts := {"clinic": ["药棚帮忙", "帮叶蘅处理普通药包与送药。", ["ye"], "已照应药棚的事情。"],
		"transport": ["修车认路", "帮陆衡照应药车与乡邻出入。", ["luheng", "chen"], "已经整备药车或护送老人。"],
		"practice": ["学习丙级《护路棍法》", "向陆衡学习护路棍法第一层。", ["luheng"], "已学横杆护身，收到练习棍与本人笔记。"],
		"market": ["集市帮忙", "在集市照应普通家当与传话。", ["merchant"] + (["apothecary"] if _st(_st(c, "choices"), "market") == "rumor" else []), "已办过集市的事情。"]}
	for id in acts:
		var a: Array = acts[id]
		if _st(_st(c, "choices"), id) or (id == "practice" and _st(c, "granted")):
			_add(rows, {"id": "activity:" + id, "title": a[0], "kind": "村中活动", "status": "done", "origin": a[1], "objective": a[3], "where": "栖河 · 活动记录", "people": a[2], "progress": [step("已完成", a[3])]})
	if c is Dictionary and c.stage in ["refuge", "mountain", "ended", "cultivation"]:
		var e := evidence(c)
		_add(rows, {"id": "main:evidence", "title": "三张附页与第十七号底单" if e else "三张附页对质", "kind": "主线 · 对证", "status": "done" if e else "active",
			"origin": "安置伤者后，一同核对三方附页与叶家的原始记录。",
			"objective": "对质的结果：原底单上只有六只旧药罐，三张附页却分别写成交谱、还匣、交样。三家各自认了错，背后是谁还不知道。" if e else "先安顿伤者，再把三张附页摊开来对一对。",
			"where": "邻村接应院 · 核对点", "people": ["ye", "zhouyan", "chen", "xulingyi", "censhuang", "shenyanhui"], "action": {"type": "evidence", "label": "查看对证记录" if e else "对一对附页"},
			"chapterEvidence": true, "progress": [step("到达接应院", "乡邻已得到接应。"), step("附页对过了" if e else "核对原底单", "原记录与三份附页已逐项对照。" if e else "不以交出遗物或完成可选跑腿为条件。", e)]})
	return rows

## 替周婶跑一圈（errands 三键推导）
static func _errand(rows: Array, p: Dictionary) -> void:
	var e: Dictionary = p.get("errands", {}) if p.get("errands") is Dictionary else {}
	var vals := ["bowls", "cloth", "medicine"].map(func(x): return e.get(x))
	if not vals.any(func(v): return v and not (v in ["none", "closed"])): return
	var sent := func(x): return e.get(x) in ["done", "collected", "delivered"]
	var done: bool = vals.all(func(v): return v == "done")
	var nxt: Array
	if not sent.call("bowls"): nxt = ["chen-door", "村内东北 · 陈伯家门厅", "把碗送到陈伯家门厅。"]
	elif not sent.call("cloth"): nxt = ["inn-door", "南村口 · 客栈", "找客栈店家取布。"]
	elif not sent.call("medicine"): nxt = ["elder", "南村口 · 老人家", "把药送到村口老人家门前，带回竹篮。"]
	else: nxt = ["clinic-door", "村内东侧 · 药棚", "回药棚找周婶交差。"]
	_add(rows, {"id": "errand:round", "title": "替周婶跑一圈", "kind": "支线 · 周婶", "status": "done" if done else "active", "owner": "aunt",
		"origin": "周婶托你顺路跑一圈：陈伯家还碗、客栈取布、村南老人家送药并带回竹篮，办完回药棚交差。",
		"objective": "三处都办完，已回药棚交差。" if done else nxt[2], "people": ["aunt", "chen", "merchant", "elder"],
		"where": "栖河 · 帮过的忙" if done else nxt[1], "chapterNpc": null if done else nxt[0], "action": null if done else {"type": "npc", "id": nxt[0], "label": "标记地点"},
		"progress": [step("陈伯家还碗", "碗送到陈伯家门厅。", sent.call("bowls")), step("客栈取布", "从店家手里取到布包。", sent.call("cloth")),
			step("村南送药", "药送到老人家，带回竹篮。", sent.call("medicine")), step("回药棚交差", "把布和竹篮交给周婶。", done)]})

## 三个委托 out:{letter|account|ledger}
static func _outsider_quests(rows: Array, k: Dictionary, c) -> void:
	var side = _side()
	for key in QDEF():
		var d: Dictionary = QDEF()[key]
		var q = k.q.get(key)
		var closed: bool = departed(c) or (side != null and side.has_method("outsiders_quest_open") and not side.outsiders_quest_open(key))
		if not seen_quest(q) or (closed and q.stage != "done"): continue
		var done: bool = q.stage == "done"
		var checked: bool = q.stage in ["checked", "witnessed", "done"]
		var witnessed: bool = q.stage in ["witnessed", "done"]
		var target: String = d.target if q.stage == "accepted" else ("bailiff" if key == "ledger" and q.stage == "checked" else d.owner)
		var location: String
		if target == "bailiff": location = "东埠 · 现场差役"
		elif target == d.owner:
			if d.owner == "xulingyi": location = "南村口 · 联络院门前"
			elif d.owner == "shenyanhui": location = "东埠 · 采办核货点"
			else: location = "东埠 · 装卸路" if int(_st(c, "halfDay") if _st(c, "halfDay") != null else 0) >= 4 else "南村口 · 车道旁"
		else: location = d.place
		var owner_name: String = CAST()[d.owner].name
		var objective: String = d.summary if done else (d.first if q.stage == "accepted" else ("到东埠找差役，核实验收签记。" if key == "ledger" and q.stage == "checked" else "把核实口信带回" + owner_name + "。"))
		var paper: Dictionary
		if key == "ledger":
			paper = {"id": "out:ledger", "title": "采办药单", "fields": [["货药", "两篓"], ["病人药包", "一篓"]] if checked else [["册载", "三篓"], ["东埠实见", "两篓"]],
				"note": "数量待核 · 沈雁回出示" if not checked else ("用途已核 · 签记待核" if not witnessed else "签记已核 · 保留未验注明"),
				"body": "收验册记三篓，东埠实见两篓。数量、用途与原始签押尚待核实。" if not checked else ("周婶说明：两篓货药，一篓是已分给病人的药包；她说无人查验，签字仍需向差役核实。" if not witnessed else "差役说明“已验”栏没有签名，不能当成验收。两篓货药与一篓病人药包应分栏记录。")}
		elif key == "letter":
			paper = {"id": "out:letter", "title": "未落款的拜帖", "fields": [["来件", "联络院"], ["受帖人", "未填"]], "note": "口信已核 · 陈伯提醒主人意愿" if checked else "来处待辨 · 徐令仪出示",
				"body": ("陈伯提醒，登记与保管不能代替旧物主人同意。" + ("口信已带回徐令仪。" if done else "口信尚待带回。")) if checked else "联络院递出的拜帖未填受帖人，徐令仪托萧白找陈伯辨认来处。"}
		else:
			paper = {"id": "out:account", "title": "旧货账条", "fields": [["旧罐", "六只"], ["货款", "结清"]] if checked else [["来件", "乌魁"], ["买卖", "待核"]], "note": "账目已核 · 玉匣传讯另查" if checked else "药商账目待核",
				"body": "药商说六只旧药罐的钱早已结清。玉匣的传闻不是叶家答应交物的凭据。" if checked else "乌魁带来的旧货账尚待药商核对。收钱、卖货与玉匣传闻不能混为一事。"}
		var ppl: Array = [d.owner] + {"letter": ["chen"], "account": ["apothecary"], "ledger": ["aunt"] + (["bailiff"] if witnessed else [])}[key]
		var prog := [step("答应帮忙", "册载三篓，东埠实见两篓。" if key == "ledger" else "已接下核实口信。"),
			step("已向当事人核实" if checked else "向当事人核实", ({"ledger": "周婶已说明药物用途。", "account": "药商已说明旧罐买卖。"}.get(key, "陈伯已说明拜帖来处。")) if checked else d.first, checked)]
		if key == "ledger":
			prog.append(step("已核实现场签记" if witnessed else "核实现场签记", "差役确认“已验”没有签名。" if witnessed else ("去东埠请差役核对签押。" if checked else "先问清是几篓、做什么用的，再看是谁签的字。"), witnessed))
		prog.append(step("口信已交回" if done else "交回核实口信", d.summary if done else "带回原始说明，不替主人作主。", done))
		_add(rows, {"id": "out:" + key, "title": d.title, "kind": "支线 · " + owner_name, "status": "done" if done else "active", "owner": d.owner, "origin": d.origin,
			"objective": objective, "where": "栖河 · 帮过的忙" if done else location, "chapterNpc": null if done else target,
			"action": null if done else {"type": "npc", "id": target, "label": "标记地点"}, "people": ppl, "paper": paper,
			"reward": d.reward if done and q.get("rewarded") else null, "progress": prog})

## people(s) → 图鉴人物（CAST 顺序；山居人物附在后）
static func people(s) -> Array:
	if not (s is Dictionary): return []
	var k := knowledge(s)
	var all_tasks := tasks(s)
	var out := []
	var qq: Dictionary = k.q
	var c = k.c
	for id in data().cast_order:
		if not k.met.get(id): continue
		var base: Dictionary = CAST()[id]
		var identity: bool = k.identity[id]
		var r = k.record.get(id)
		var events := []
		var relations := []
		var bio: String = base.get("bio", "")
		var role: String = base.role
		var faction: String = base.faction
		if not identity:
			role = "栖河相识的来客"; faction = "身份未记"; bio = "在栖河相识的来客，目前已记下姓名。"
		elif id == "xulingyi": bio = "正道盟派来的文议执事，说话有条有理，习惯先信文书。这回是拿着一封委托，来封存叶家的医武谱。"
		elif id == "censhuang": bio = "归烬堂管对外事务的人，说话带笑，护短却也认账。这回是为一只“玉匣”来的。"
		elif id == "shenyanhui": bio = "受程巡检委办，核药名、数量与原始签记。她主张分清每项记录，不把未经核实的附页当作验收。"
		elif id == "ye": bio = "在村外与萧白相识，随后一同进入栖河。她照料药棚病人，村里的送药和收拾也常有她的身影。" + ("父亲留下的笔记和母亲的药箱由她自己保管。" if k.p.get("relicSeen") else "")
		if id == "zhouyan" and (k.xu or later(c)): bio = "温行舟的旧友，听到叶家出让旧物的传闻后到栖河问讯。他来问人的消息，并不索取叶家的药箱。"
		events.append({"phase": r.firstPhase if r is Dictionary and r.get("firstPhase") else "栖河相识", "text": ("已记下" + base.name + "的身份与往来。") if identity else "与这位来客相识。"})
		if id == "ye" and k.p.get("relicSeen"): events.append({"phase": "初到栖河", "text": "亲手收好父亲笔记和母亲药箱。"})
		if id == "xulingyi" and k.xu: events.append({"phase": "第一日傍晚", "text": "要把叶家的医武谱封存带回盟里，叶蘅当面拒绝了。"})
		if id in ["censhuang", "shenyanhui"] and k.three:
			events.append({"phase": "第二日傍晚", "text": "当面交涉玉匣，叶蘅否认曾答应交出。" if id == "censhuang" else "来查叶家的药，叶蘅说自己没答应交药样。"})
		if _st(c, "clashVersion") and id in ["xulingyi", "censhuang", "shenyanhui"]:
			events.append({"phase": "第三夜 · 侧口", "text": {"xulingyi": "与岑霜短暂交锋，以短剑出手并护住同伴；听见火警后停手，命护院让路。", "censhuang": "为护住堂众，以短刀与徐令仪交手；听见火警后停手，命堂众退往侧门。", "shenyanhui": "护送患者穿过窄口后发现烟火，叫停双方，转身组织救援。"}[id]})
		var own = OWN.get(id)
		if own and _st(qq.get(own), "stage") == "done": events.append({"phase": "事情办完", "text": QDEF()[own].summary})
		var ls = _st(qq.get("letter"), "stage"); var gs = _st(qq.get("ledger"), "stage"); var acs = _st(qq.get("account"), "stage")
		if id == "chen" and ls in ["checked", "done"]: events.append({"phase": "拜帖口信", "text": "提醒旧物有主人，登记与保管不能代替叶蘅同意。"})
		if id == "aunt" and gs in ["checked", "witnessed", "done"]: events.append({"phase": "药单核实", "text": "说明两篓是货药，一篓是分给病人的药包。"})
		if id == "bailiff" and gs in ["witnessed", "done"]: events.append({"phase": "现场签记", "text": "确认“已验”栏没有签名，应分栏记药物用途。"})
		if id == "luheng" and _st(c, "granted"): events.append({"phase": "护路棍法", "text": "传授第一层横杆护身，赠送练习棍与本人笔记。"})
		if id == "song" and _st(_st(c, "events"), "c1-s2"): events.append({"phase": "第三日", "text": "问起装卸侧口；萧白此前未向他提过这个位置。"})
		if evidence(c) and id in ["xulingyi", "censhuang", "shenyanhui"]:
			events.append({"phase": "邻村对证", "text": {"xulingyi": "收回了封存的要求，回去查是谁转来的委托。", "censhuang": "签赔偿清单、看管乌魁，回查堂内传讯。", "shenyanhui": "撤销扣箱，记下查验限制，交程铎复核。"}[id]})
		if id == "xulingyi" and (k.xu or ls in ["checked", "done"]): relations.append(["ye", "旧物主人"])
		if id in ["xulingyi", "chen"] and ls in ["checked", "done"]: relations.append(["xulingyi" if id == "chen" else "chen", "托你送拜帖的人" if id == "chen" else "拜帖收信人"])
		if id == "shenyanhui" and seen_quest(qq.get("ledger")): relations.append(["aunt", "药棚核数人"])
		if id == "aunt" and gs in ["checked", "witnessed", "done"]: relations.append(["shenyanhui", "托你核药单的人"])
		if id == "censhuang" and acs in ["checked", "done"]: relations.append(["apothecary", "旧货账见证人"])
		if id == "ye" and k.xu: relations.append(["xulingyi", "归烬堂管事"])
		if id in ["ye", "aunt"] and c: relations.append(["aunt" if id == "ye" else "ye", "药棚照料相关"])
		if id == "luheng" and _st(_st(c, "choices"), "transport"): relations.append(["chen", "药车整备"])
		var item := base.duplicate()
		item.merge({"id": id, "role": role, "faction": faction, "bio": bio, "identity": identity,
			"first": r.firstPlace if r is Dictionary and r.get("firstPlace") else "栖河（旧档未记录地点）",
			"firstPhase": r.firstPhase if r is Dictionary and r.get("firstPhase") else "旧档相识记录", "events": events,
			"relations": relations.filter(func(x): return k.met.get(x[0])),
			"tasks": all_tasks.filter(func(t): return t.people.has(id)).map(func(t): return t.id)}, true)
		out.append(item)
	_mountain(s, out)
	return out

## 山居人物（有 s.cultivation 时）。原版另用 CultivationVisitors 的拜访记录判定相识与经历、CultivationRelations 给关系；
## 这两项归培养子任务，这里只按 facts.met_* 与 joined 判定，经历只保留旧条目（见 menu-notes.md）。
static func _mountain(s: Dictionary, out: Array) -> void:
	var cu = s.get("cultivation")
	if not (cu is Dictionary): return
	var facts: Dictionary = cu.get("facts", {}) if cu.get("facts") is Dictionary else {}
	for id in data().mountainPeople:
		var p: Dictionary = data().mountainPeople[id]
		if not (facts.get("met_" + p.actor) or (p.actor == "zhou" and cu.get("joined"))): continue
		var old = null
		for x in out:
			if x.id == id: old = x
		var bio: String = p.bio
		if p.actor == "fang" and not facts.get("gy_brother_hurt_seen"): bio = "大师兄，练功和办事都稳妥，愿意陪新师弟过招。常在谷外历练，回来会问萧白功课。"
		elif p.actor == "pei" and not (facts.get("gn_letter_seen") or facts.get("gn_chests_seen")): bio = "住在溪东书屋，读书认真；讲起旧书会忘了时辰。与萧白相识后，常把书里的疑处拿来一起想。"
		var item: Dictionary = old.duplicate() if old else {}
		item.merge({"id": id, "portraitActor": p.actor, "name": p.name, "role": p.role, "faction": "溪东书屋" if p.actor == "pei" else "归云谷", "bio": bio,
			"art": old.get("art") if old else null, "full": false, "identity": true, "first": "溪东书屋" if p.actor == "pei" else "归云谷",
			"events": (old.events if old else []).slice(-10), "relations": old.relations if old else [], "tasks": old.tasks if old else []}, true)
		if old: old.merge(item, true)
		else: out.append(item)

## recordEncounter(who, text)：对白首次遇见时写入 S.qiheCodex（供 Dialog 调用；不主动存盘）
static func record_encounter(who: String, text := "") -> bool:
	if not (G.S is Dictionary) or not (G.S.get("prologue") is Dictionary): return false
	var id = name_id(who.split(" · ")[0])
	if id == null: return false
	if not (G.S.get("qiheCodex") is Dictionary): G.S.qiheCodex = {"version": 1, "people": {}}
	var store: Dictionary = G.S.qiheCodex
	if not (store.get("people") is Dictionary): store.people = {}
	var r = store.people.get(id)
	var changed := false
	if r == null:
		var place := "栖河"
		if World.get("cur") and World.cur.get("name"): place = str(World.cur.name)
		r = {"firstScene": G.S.get("scene"), "firstPlace": place, "firstPhase": phase(G.S).date, "identity": not (id in ["xulingyi", "censhuang", "shenyanhui"])}
		store.people[id] = r; changed = true
	if not r.identity and IDENT_RE.has(id) and RegEx.create_from_string(IDENT_RE[id]).search(text):
		r.identity = true; changed = true
	return changed

# ───────── 任务追踪（qihe-jianghu-ui.js） ─────────
static func is_main(key: String) -> bool:
	if _re_main == null: _re_main = RegEx.create_from_string(MAIN_QUEST_RE)
	return _re_main.search(key) != null

## questEntriesUI()：tasks(S, {mainLine: questLine()})
static func entries() -> Array:
	var chap = _chapter()
	var line := ""
	if chap and chap.has_method("quest_line"): line = str(chap.quest_line())
	return tasks(G.S, line)

static func q_key(q: Dictionary) -> String:
	return str(q.get("t", q.get("name", "")))

static func track_state() -> Dictionary:
	if not (G.S is Dictionary): return {"off": {}, "seen": {}}
	if not (G.S.get("questTrack") is Dictionary): G.S.questTrack = {}
	var t: Dictionary = G.S.questTrack
	if not (t.get("off") is Dictionary): t.off = {}
	if not (t.get("seen") is Dictionary): t.seen = {}
	return t

static func is_tracked(q: Dictionary) -> bool:
	if q.status != "active": return false
	var t = G.S.get("questTrack") if G.S is Dictionary else null
	return not (t is Dictionary and t.get("off") is Dictionary and t.off.get(q_key(q)))

static func tracked_quests() -> Array:
	return entries().filter(is_tracked).map(func(q): return {"key": q_key(q), "title": q_key(q), "where": q.get("where", ""), "main": is_main(q_key(q)),
		"activity": q.get("chapterActivity"), "npc": q.get("chapterNpc")})

## newQuests()：首次只记 seen 返回 []；之后返回新出现且未取消追踪的进行中任务键
static func new_quests() -> Array:
	if not (G.S is Dictionary): return []
	var t := track_state()
	var keys: Array = entries().filter(func(q): return q.status == "active").map(q_key)
	var first: bool = not t.get("init")
	t.init = true
	var fresh := keys.filter(func(k): return not t.seen.get(k))
	for k in fresh: t.seen[k] = 1
	return [] if first else fresh.filter(func(k): return not t.off.get(k))

static func main_tracked() -> bool:
	var off: Dictionary = track_state().off
	return not entries().any(func(q): return q.status == "active" and is_main(q_key(q)) and off.get(q_key(q)))

static func set_tracked(key: String, on: bool) -> void:
	var t := track_state()
	if on: t.off.erase(key)
	else: t.off[key] = 1

static func find_task(key: String):
	for q in entries():
		if q_key(q) == key: return q
	return null
