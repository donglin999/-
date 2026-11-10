class_name CuPreHangao
extends RefCounted
## 原版 js/qh-pre-hangao.js（PreHangao）：第一年赴汉皋前的剧本与交易。数据 PreHangaoData（qh-pre-hangao-data.js）。
## apply()/definitions() 的结果已在决策表与导出的定义里，这里只移植运行时要用的函数。

static func data() -> Dictionary: return CuDB.t("PreHangaoData")

static func has(id) -> bool:
	return CuDB.has_by(data().scenes, "id", id)

## 原版 extra(s)
static func extra(s: Dictionary) -> Dictionary:
	var f: Dictionary = s.get("facts", {})
	var ph = s.get("preHangao")
	ph = ph if ph is Dictionary else {}
	var pei := "close" if f.get("gn_letter_seen") else ("known" if f.get("gn_lamp_seen") else "new")
	# needle：没学剑拳、只学了师母针路（2026-11-08，《带得走的本事》按针路说话）
	var route := "sword" if s.learned.get("sword") else ("fist" if s.learned.get("fist") else "life")
	return {"preHangao": {"facts": f.duplicate(true), "weapon": ph.get("weapon"), "pei": pei, "participants": (ph.get("participants", []) as Array).duplicate(true) if ph.get("participants") is Array else [], "route": route, "needle": route == "life" and (s.learned.has("art_jc_n1") or s.learned.has("art_jc_n2") or s.learned.has("art_jc_n3"))}}

## 原版 effects(s,p,key)
static func effects(s: Dictionary, p: Dictionary, key) -> void:
	var f: Dictionary = s.facts
	match p.action:
		"gy_m07":
			f.xiangyang_invitation = true; f.hangao_invitation = true
		"gy_m08":
			f.departure_goals = true
		"gn_depart":
			if not f.get("gy_pei_join"): f.gy_pei_join = {"period": p.period}
			f.pei_party_preference = "roster" if key == "roster" else "join"
			f["hg.pre.farewell_seen"] = true
		"hg_aftercare":
			f["hg.pre.qihe_letters_read"] = true
		"hg_trace_reply":
			f["hg.pre.inquiry_contact"] = "hangao_clinic"
		"hg_pack_review":
			f["hg.pre.loadout_checked"] = true
			var ph = p.visitor.context.get("preHangao")
			if ph is Dictionary and ph.get("route") == "sword" and not ph.get("weapon"): f["hg.pre.loan_request"] = true
		"hg_road":
			f["hg.pre.road_help"] = key
			var ph2 := CuDB.dict_of(s, "preHangao")
			var c = p.visitor.context.get("preHangao")
			ph2.roadParticipants = (c.get("participants", []) as Array).duplicate(true) if c is Dictionary and c.get("participants") is Array else []
		"hg_gate":
			f["hg.pre.gate_handoff"] = true

## 原版 due(s,actions,availability)：前五个月的日历剧情（含主线逾期补播）
static func due(s: Dictionary, actions: Array, availability: Callable):
	if not s.joined or s.get("pending") or s.get("summary") or s.month > 5: return null
	var slot := CuDB.period(s)
	for a in actions:
		if not a.get("auto") or a.get("hidden"): continue
		if a.id == "gy_m05" and s.facts.get("first_delivery"): continue
		if s.facts.get(a.once): continue
		if slot < a.window[0]: continue
		if not a.get("main") and slot > a.window[1]: continue
		var b: Dictionary = a.duplicate()
		b.erase("window")
		if availability.call(s, b, {}) != "": continue
		return a
	return null

## 原版 advanceGate
static func advanceGate(s: Dictionary, actions: Array, availability: Callable) -> String:
	var d = due(s, actions, availability)
	return "先完成" + d.name + "，再结束本期。" if d != null else ""

const LESSON_IDS := {"B03": "lesson_stance", "K01": "lesson_sword", "K02": "lesson_fist", "B01": "lesson_breath", "B02": "lesson_footwork", "A03": "lesson_notes"}

## 原版 lesson(s,a,first,before,after)
static func lesson(s: Dictionary, a: Dictionary, first: bool, _before: Dictionary, after: Dictionary):
	var id = LESSON_IDS.get(a.id)
	var l = CuDB.find_by(data().lessons, "id", id) if id != null else null
	if l == null: return null
	var flags := CuDB.dict_of(CuDB.dict_of(s, "preHangao"), "lessonMilestones")
	var milestone := false
	var m: Dictionary = after.get("martial", {})
	match a.id:
		"B03": milestone = s.progress.get("foundation", 0) >= 160
		"B02": milestone = s.progress.get("footwork", 0) >= 300
		"A03":
			var n := 0
			for h in s.history: if h.get("action") == "A03": n += 1
			milestone = n >= 3 and CuDB.truthy(s.facts.get("herb_labels"))
		"K01": milestone = (m.get("sword", {}).get("level", 0)) >= 2
		"K02": milestone = (m.get("fist", {}).get("level", 0)) >= 2
		_: milestone = (m.get("breathing", {}).get("level", 0)) >= 2
	var kind := "first" if first else ("milestone" if milestone and not flags.get(id) else "repeat")
	if kind == "milestone": flags[id] = true
	return {"id": id, "kind": kind, "lines": CuDB.copy(l[kind]), "speaker": l.actor}

## 原版 data.scenes.some(x=>x.id===id&&x.status==='新增候选')
static func is_new_candidate(id) -> bool:
	var sc = CuDB.find_by(data().scenes, "id", id)
	return sc != null and sc.get("status") == "新增候选"
