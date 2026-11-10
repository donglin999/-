class_name CuRelations
extends RefCounted
## 原版 js/qh-mode-cultivation-relations.js（CultivationRelations）：角色往来与剧情瓶颈。
## profiles 取 globals.json（已含 CultivationDialogue.relations 替换后的文本）；gates 原版是函数，这里按人物 id 实现。

const STAGES := ["初识", "熟络", "信赖", "托付"]

static func profiles() -> Dictionary: return CuDB.t("CultivationRelations").profiles

static func _f(s: Dictionary, k: String): return s.facts.get(k)

## 原版各 profile.gates[i](s)
static func _gate(id: String, i: int, s: Dictionary):
	var f: Dictionary = s.facts
	match id:
		"zhou": return [s.joined, s.learned.get("breathing") and f.get("first_delivery")][i]
		"ye": return [f.get("herb_labels"), f.get("first_delivery") and f.get("visitor_whiteheron_records_seen"), f.get("gy_ye_lamp_seen")][i]
		"lu": return [f.get("promise_scope"), f.get("first_delivery")][i]
		"neighbor": return [f.get("visit_neighbors"), f.get("first_delivery")][i]
		"shimu": return [f.get("gy_noodles_seen"), f.get("gy_ledger_seen") and (f.get("gy_ye_mother_seen") or f.get("ms_sleeve_seen"))][i]
		"pei": return [f.get("met_pei") or f.get("gn_lamp_seen"), f.get("gn_letter_seen") or f.get("gn_chests_seen"), f.get("gn_eyes_seen")][i]
		"yin": return [f.get("gy_night_return_seen"), f.get("gy_goose_steps_seen") and f.get("gy_go_in_stead_choice") == "go_with_yin", f.get("gy_mid_autumn_choice") == "moon_yin"][i]
		"zhong": return [f.get("gy_prelude_tour_seen"), f.get("gy_zhong_kit_seen") and (f.get("gs_bandit_truth_seen") or f.get("mz_notch_seen")), false][i]
		"fang": return [f.get("gy_fang_back_seen"), f.get("gy_brother_hurt_seen") and f.get("gs_fang_rehab_seen"), false][i]
		"dou": return [f.get("gy_noodles_seen"), f.get("gy_dou_runaway_seen") and f.get("gs_dou_letter_seen"), false][i]
		"man": return [f.get("gy_man_herbs_seen"), f.get("gy_shimu_birthday_seen"), false][i]
		"xu": return [f.get("hg_aftercare_seen"), f.get("rep_xu_speak_seen"), false][i]
		"cen": return [f.get("hg_aftercare_seen"), f.get("rep_cen_gate_seen"), false][i]
		"shen": return [f.get("hg_aftercare_seen"), f.get("rep_shen_sign_seen"), false][i]
	return false

static func _truthy(v) -> bool: return CuDB.truthy(v)

## 原版 profile(name)
static func profile(name):
	var p = profiles().get(name)
	if p == null: return CuDB.fail("此人物尚无往来设计。")
	return p

## 原版 id → 名字
static func name_of(id) -> String:
	var P := profiles()
	for n in P:
		if P[n].id == id: return n
	return ""

## 原版 inspect(s,name)
static func inspect(s: Dictionary, name):
	var p = profile(name)
	if p == null: return null
	var rels = s.get("relations")
	var r = rels.get(p.id) if rels is Dictionary else null
	var score = r.score if r is Dictionary else 0
	var gate := 0
	while gate < p.gates.size() and gate < 3 and _truthy(_gate(p.id, gate, s)): gate += 1
	var cp: int = [19, 49, 79, 100][gate]
	var stage := 0 if score < 20 else (1 if score < 50 else (2 if score < 80 else 3))
	var missed = p.get("missed")
	var mg = missed[gate] if missed is Array and gate < missed.size() else null
	var is_missed: bool = mg is Dictionary and CuDB.period(s) > mg.until
	return {"id": p.id, "name": name, "score": score, "cap": cp, "stage": STAGES[stage], "atCap": score >= cp, "requirement": mg.text if is_missed else p.hints[gate], "missed": is_missed}

static func _rel(s: Dictionary, id: String) -> Dictionary:
	var rels := CuDB.dict_of(s, "relations")
	if not (rels.get(id) is Dictionary): rels[id] = {"score": 0, "interactions": [], "returnOffered": false}
	return rels[id]

## 原版 record(s,pending)：书信或送礼
static func record(s: Dictionary, pending: Dictionary):
	var p = profile(pending.recipient)
	if p == null: return null
	var id = pending.id
	var kind := "gift" if pending.action == "C02" else "letter"
	var gift = (pending.get("gift") if pending.get("gift") else "food") if kind == "gift" else null
	var r := _rel(s, p.id)
	var old = CuDB.find_by(r.interactions, "id", id)
	if old != null: return old
	var month := floori(pending.period / 5.0)
	var monthly := 0
	var repeat := 0
	for x in r.interactions:
		if floori(x.period / 5.0) == month and x.kind == kind: monthly += x.delta
		if kind == "gift" and x.kind == "gift" and x.gift == gift and x.period >= pending.period - 5: repeat += 1
	var requested := 1 if kind == "letter" else (0 if repeat >= 2 else (1 if repeat == 1 else (3 if gift == p.fav else 1)))
	var remaining = max(0, (4 if kind == "gift" else 2) - monthly)
	var before = inspect(s, pending.recipient)
	var delta = min(requested, remaining, max(0, before.cap - r.score))
	r.score += delta
	var relation = inspect(s, pending.recipient)
	var reason := "需关键剧情突破" if before.atCap else ("本月日常往来贡献已达上限" if remaining == 0 else ("近期重复送同类物品" if requested == 0 else ("达到当前阶段上限" if delta < requested else "")))
	var returns := {}
	if kind == "gift" and gift == p.fav and repeat == 0 and not r.returnOffered: returns = p.returns.duplicate()
	if returns.size() > 0: r.returnOffered = true
	var base_body = null
	if kind == "letter":
		if p.get("letters") is Array:
			var n := 0
			for x in r.interactions: if x.kind == "letter": n += 1
			base_body = p.letters[min(p.letters.size() - 1, n)]
		else: base_body = p.get("letter")
	else:
		base_body = p.repeat if repeat > 0 else p.gifts.get(gift)
	if not base_body: return CuDB.fail("此礼物尚无人物反馈。")
	var body: String = base_body + ("\n" + p.returnText if returns.size() > 0 else "")
	var author = (("周婶" if gift == "pouch" or repeat > 0 else "陈伯") if p.id == "neighbor" else pending.recipient)
	var event := {"id": id, "period": pending.period, "kind": kind, "gift": gift, "delta": delta, "relation": relation, "reason": reason, "author": author, "body": body, "returns": returns}
	r.interactions.append(event)
	return event

## 原版 story(s,name,amount,id)：剧情推动关系，同一事件只记一次
static func story(s: Dictionary, name, amount, id):
	var p = profile(name)
	if p == null: return null
	var r := _rel(s, p.id)
	var old = CuDB.find_by(r.interactions, "id", id)
	if old != null: return old
	var before = inspect(s, name)
	var delta = max(0, min(amount, before.cap - r.score))
	r.score += delta
	var event := {"id": id, "period": CuDB.period(s), "kind": "story", "gift": null, "delta": delta, "relation": inspect(s, name), "reason": "达到当前阶段上限" if delta < amount else "", "author": name, "body": "", "returns": {}}
	r.interactions.append(event)
	return event
