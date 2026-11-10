class_name CuCore
extends RefCounted
## 原版 js/qh-mode-cultivation-core.js（CultivationCore）：无界面的养成状态机；活动扣费、恢复和结算只经过这里。
## 原版 throw Error → CuDB.fail(msg) 并返回 null；调用方查 CuDB.error。

static func D() -> Dictionary: return CuDB.t("CultivationData")
static func actions() -> Array: return D().actions

## 原版 MOOD_DELTA：练功与杂活磨心情，生产、写信、出去走走提心情
const MOOD_DELTA := {"basic": -5, "chores": -7, "skill": -4, "production": 4, "arts": 2, "mail": 4, "stroll": 4}
const ENERGY_CAP := {1: 10}
const REPS := {"xu": "xulingyi", "cen": "censhuang", "shen": "shenyanhui"}
const NEIGHBOR := {"bookhouse": 1, "bookhouse_inside": 1, "terraces": 1, "watermill": 1}
const PLACES4 := ["gate", "street", "alley", "ferry"]
const CULT_GIFTS := ["gy_wood_bird", "gy_hand_cloth", "gy_wrist_guard", "gy_wood_bird_sale", "pei_lens", "needles", "wood"]

static func moodState(s: Dictionary) -> Dictionary: return CuBalance.mood(s)
static func MOOD_STATES() -> Array: return CuBalance.moods()
static func clampMood(v) -> int: return int(max(0, min(100, v)))
static func period(s: Dictionary) -> int: return CuDB.period(s)

## 原版 nominalCost(a)
static func nominalCost(a: Dictionary):
	var n = a.get("costOverride")
	if n == null:
		var c = CuDB.find_by(D().categories, "id", a.category)
		n = c.cost if c != null else null
	if not CuDB.is_int(n) or n < 1 or n > D().energyPerPeriod: return CuDB.fail("活动费用配置不正确。")
	return int(n)

## 原版 actionCost(a)：剧情、闲逛地点不耗体力
static func actionCost(a) -> int:
	if a == null: return 0
	if a.get("strollPlace"): return 0
	if a.get("once") or a.get("auto") or a.get("visitor") or a.get("household") or a.id == "QH01": return 0
	var n = nominalCost(a)
	return n if n != null else 0

## 原版 initial()
static func initial() -> Dictionary:
	return {"version": 1, "preHangao": {"version": 1}, "balanceVersion": 2, "martialXp": {}, "economyVersion": D().economyVersion, "route": "mountain", "month": 1, "phase": 0, "energy": D().energyPerPeriod, "mood": 60, "mode": "home", "joined": false, "learned": {}, "progress": {}, "resources": {"grain": 2, "cloth": 2, "herb": 0, "food": 0, "pouch": 0}, "facts": {}, "quotas": {}, "history": [], "letters": [], "pending": null, "summary": null, "sequence": 0, "relations": {}, "selection": {"category": "basic", "action": "B03"}, "journey": null, "screen": "hub"}

static func _economy_of(v) -> int: return 1 if v == null else int(v)
static func _known_economy(v) -> bool: return v == null or (CuDB.is_int(v) and v >= 1 and v <= D().economyVersion)
static func energyCap(v) -> int:
	return D().energyPerPeriod if _economy_of(v) == D().economyVersion else ENERGY_CAP.get(_economy_of(v), D().energyPerPeriod)

## 原版 validate(s,options)
static func validate(s, options := {}):
	if not (s is Dictionary) or s.get("version") != 1 or not _known_economy(s.get("economyVersion")) or (options.get("strict") and not s.get("pending") and s.get("economyVersion") != D().economyVersion) or s.get("route") != "mountain" or not CuDB.is_int(s.get("month")) or s.month < 1 or s.month > 36 or not CuDB.is_int(s.get("phase")) or s.phase < 0 or s.phase > 4 or not CuDB.is_int(s.get("energy")) or s.energy < 0 or s.energy > energyCap(s.get("economyVersion")) or not s.get("mode") in ["home", "story", "journey_ready", "journey", "complete"]:
		return CuDB.fail("养成存档格式不正确。")
	const F := "养成存档字段不完整。"
	if not CuDB.is_int(s.get("mood")) or s.mood < 0 or s.mood > 100 or not (s.get("joined") is bool) or not CuDB.is_int(s.get("sequence")) or s.sequence < 0 or not s.get("screen") in ["hub", "world"]: return CuDB.fail(F)
	for k in ["learned", "progress", "resources", "facts", "quotas", "selection"]:
		if not (s.get(k) is Dictionary): return CuDB.fail(F)
	for k in ["history", "letters"]:
		if not (s.get(k) is Array): return CuDB.fail(F)
	if not CuDB.has_by(D().categories, "id", s.selection.get("category")) or (s.selection.get("action") != null and CuDB.action(s.selection.action) == null): return CuDB.fail(F)
	for k in D().resources:
		if not CuDB.is_int(s.resources.get(k)) or s.resources[k] < 0: return CuDB.fail(F)
	var dl = s.get("dialogue")
	if dl != null and (not (dl is Dictionary) or not dl.get("id") in ["weapon-offer", "delivery"] or (dl.id == "weapon-offer" and (not CuDB.is_int(dl.get("period")) or dl.period < 0 or dl.period > 179))): return CuDB.fail(F)
	if s.has("relations") and s.relations != null:
		if not (s.relations is Dictionary): return CuDB.fail(F)
		var ids := []
		for n in CuRelations.profiles(): ids.append(CuRelations.profiles()[n].id)
		for id in s.relations:
			var r = s.relations[id]
			if not id in ids or not (r is Dictionary) or not CuDB.is_int(r.get("score")) or r.score < 0 or r.score > 100 or not (r.get("interactions") is Array) or not (r.get("returnOffered") is bool): return CuDB.fail(F)
	var p = s.get("pending")
	if p:
		if not (p is Dictionary) or not _known_economy(p.get("economyVersion")) or CuDB.action(p.get("action")) == null or not p.get("stage") in ["choice", "ready", "result"] or not CuDB.is_int(p.get("period")) or p.period < 0 or p.period > 179 or (p.stage == "result" and not (p.get("result") is Dictionary)): return CuDB.fail(F)
		var an = p.get("animation")
		if an and (not (an is Dictionary) or not (an.get("startedAt") is int or an.get("startedAt") is float) or an.startedAt < 0 or an.get("duration") != 2000 or not (an.get("done") is bool)): return CuDB.fail(F)
		if p.has("story") and (p.story != true or not CuDB.action(p.action).get("once") or not p.get("storyStep") in [0, 1] or (p.has("storyLine") and (not CuDB.is_int(p.storyLine) or p.storyLine < 0 or p.storyLine > 9)) or an): return CuDB.fail(F)
		var pa = CuDB.action(p.action)
		if pa.get("visitor") and not p.get("visitor"): return CuDB.fail(F)
		if p.get("visitor"):
			if not pa.get("visitor") or not p.get("story"): return CuDB.fail(F)
			if CuVisitors.validate(p) == null: return null
	if s.mode == "journey":
		var j = s.get("journey")
		if not (j is Dictionary) or j.get("month") != s.month or j.get("returnMonth") != s.month + 1 or j.get("returnRoute") != s.route or not (j.get("visited") is Array): return CuDB.fail(F)
		for id in j.visited:
			if not id in PLACES4: return CuDB.fail(F)
	if s.mode == "complete" and (s.month != 36 or s.phase != 4 or s.energy != 0): return CuDB.fail(F)
	return s

## 原版 migrateEconomy(s)：旧经济存档补差体力
static func migrateEconomy(s: Dictionary) -> bool:
	if s.get("economyVersion") == D().economyVersion or s.get("pending"): return false
	var free: bool = s.mode == "home" and not s.month in D().journeyMonths and not (s.month == 3 and s.phase == 2)
	if free: s.energy = min(D().energyPerPeriod, s.energy + max(0, D().energyPerPeriod - energyCap(s.get("economyVersion"))))
	s.economyVersion = D().economyVersion
	return free

## 原版 restore(s)
static func restore(s):
	var restored = validate(CuDB.copy(s))
	if restored == null: return null
	if not s.get("preHangao") and s.month >= 5: restored.preHangao = {"version": 1, "legacyFirstCity": true}
	migrateEconomy(restored)
	if validate(restored, {"strict": true}) == null: return null
	CuGrowth.ensure(restored, actions())
	return restored

## 原版 recover(raw)：返回 {state,repairs,error}
static func recover(raw) -> Dictionary:
	CuDB.clear()
	var st = restore(raw)
	if st != null: return {"state": st, "repairs": [], "error": null}
	var first := CuDB.error
	CuDB.clear()
	var repairs := []
	if not (raw is Dictionary): return {"state": null, "repairs": repairs, "error": first}
	var s: Dictionary = CuDB.copy(raw)
	var sel = s.get("selection")
	if not (sel is Dictionary) or not CuDB.has_by(D().categories, "id", sel.get("category")) or (sel.get("action") != null and CuDB.action(sel.action) == null):
		s.selection = initial().selection; repairs.append("培养栏目选择已失效，已重置为默认")
	if s.get("relations") is Dictionary:
		var ids := []
		for n in CuRelations.profiles(): ids.append(CuRelations.profiles()[n].id)
		for id in s.relations.keys():
			if not id in ids:
				s.relations.erase(id); repairs.append("已删除失效的关系人物：" + id)
	var j = s.get("journey")
	if j is Dictionary and j.get("visited") is Array:
		var ok := []
		var bad := []
		for id in j.visited: (ok if id in PLACES4 else bad).append(id)
		if bad.size() > 0:
			repairs.append("已去掉历练中失效的地点：" + "、".join(bad))
			j.visited = ok
			if j.get("place") and not j.place in ok: j.place = null
	var p = s.get("pending")
	if p and (not (p is Dictionary) or CuDB.action(p.get("action")) == null):
		repairs.append("进行中的活动" + (("（" + str(p.action) + "）") if p is Dictionary and p.get("action") else "") + "已失效，已清除（未退回体力）")
		s.pending = null
	if repairs.is_empty(): return {"state": null, "repairs": repairs, "error": first}
	var st2 = restore(s)
	if st2 != null: return {"state": st2, "repairs": repairs, "error": first}
	var e := CuDB.error
	CuDB.clear()
	return {"state": null, "repairs": repairs, "error": e}

## 原版 hasActivityInPeriod
static func hasActivityInPeriod(s: Dictionary, id, slot = null) -> bool:
	if slot == null: slot = period(s)
	for h in s.history:
		if h.get("period") == slot and h.get("action") == id: return true
	return false

static func growth(s: Dictionary) -> Dictionary: return CuGrowth.growth(s, actions())

## 原版 syncNotices(s)：到期的谷中消息放进信件
static func syncNotices(s: Dictionary) -> void:
	for n in D().get("notices", []):
		if n.slot > period(s) or s.facts.get(n.id): continue
		if n.id == "escort_return" and not s.facts.get("first_delivery"): continue
		s.facts[n.id] = {"period": n.slot}
		s.letters.append({"id": "notice-" + n.id, "recipient": "谷中消息", "theme": "日程", "due": n.slot, "read": CuDB.truthy(n.get("silent")), "body": n.text})

static func _cult_gift_when(id: String, f: Dictionary) -> bool:
	match id:
		"gy_wood_bird": return CuDB.truthy(f.get("gy_ledger_seen"))
		"gy_hand_cloth": return f.get("gy_fist_or_sword_choice") == "sword"
		"gy_wrist_guard": return CuDB.truthy(f.get("gy_zhong_kit_seen"))
		"gy_wood_bird_sale": return CuDB.truthy(f.get("hg_pack_review_seen"))
		"pei_lens": return CuDB.truthy(f.get("gn_depart_seen"))
		"needles": return CuDB.truthy(f.get("ms_thread_seen"))
		"wood": return CuDB.truthy(f.get("my_twig_seen"))
	return false

## 原版 reconcileWorld(world)：养成结果同步到大地图存档
static func reconcileWorld(world: Dictionary) -> void:
	CuPei.sync(world)
	var s = world.get("cultivation")
	if not (s is Dictionary): return
	var g := growth(s)
	CuDB.dict_of(world, "skills")
	var cg := CuDB.dict_of(world, "cultGifts")
	var bag := CuDB.dict_of(world, "bag")
	for id in CULT_GIFTS:
		if not cg.get(id) and _cult_gift_when(id, s.get("facts", {})):
			cg[id] = true; bag[id] = bag.get(id, 0) + 1
	CuGrowth.reconcile(world, actions())
	if s.facts.get("gy_yin_recruit"):
		var r := CuPei._roster(world)
		if not "yinhongying" in r.members: r.members.append("yinhongying")
		var party := CuDB.arr_of(world, "party")
		if not "yinhongying" in party and party.size() < 3 and not s.facts.get("gy_yin_party_offered"): party.append("yinhongying")
		if not s.facts.get("gy_yin_party_offered"): s.facts.gy_yin_party_offered = true
	world.qiheRoutes = CuHousehold.routes(s)
	if g.martial.has("breathing"):
		var x := CuDB.dict_of(world, "xinfa")
		if x.is_empty(): x.merge({"known": [], "lv": {}, "prog": {}, "main": null, "subs": []})
		var known := CuDB.arr_of(x, "known")
		var lv := CuDB.dict_of(x, "lv")
		if not "tuna" in known: known.append("tuna")
		lv.tuna = max(lv.get("tuna", 0), g.martial.breathing.level)
		if not x.get("main"): x.main = "tuna"

## 原版 syncMode(s)
static func syncMode(s: Dictionary) -> void:
	s.screen = "hub"
	s.economyVersion = D().economyVersion
	if s.month in D().journeyMonths:
		s.mode = "journey_ready"; s.energy = 0
	elif s.month == 3 and s.phase == 2:
		s.mode = "story"; s.energy = 0
	else:
		s.mode = "home"; s.energy = D().energyPerPeriod
	s.quotas = {}
	syncNotices(s)

## 原版 join(s)
static func join(s: Dictionary):
	if s.mode != "home" or s.get("pending"): return CuDB.fail("当前不能拜师。")
	s.joined = true; s.facts.joined = true
	syncNotices(s)
	return s

static func _hostile(rep_id: String) -> bool:
	var qb = G.S.get("qiheBond")
	return qb is Dictionary and qb.get(rep_id) is Dictionary and CuDB.truthy(qb[rep_id].get("hostile"))

## 原版 giftRecipients(s)
static func giftRecipients(s: Dictionary) -> Array:
	var f: Dictionary = s.facts
	var out := []
	for n in D().giftRecipients:
		var id: String = n.id
		if id == "zhou" and not s.joined: continue
		if id == "ye" and s.month > 12: continue
		if id == "neighbor" and period(s) < 2: continue
		if id == "shimu" and not f.get("gy_noodles_seen"): continue
		if id == "yin" and not f.get("gy_night_return_seen"): continue
		if id == "pei" and not (f.get("met_pei") or f.get("gn_lamp_seen")): continue
		if id == "zhong" and not (f.get("gy_prelude_tour_seen") or f.get("gy_noodles_seen")): continue
		if id == "fang" and not f.get("gy_fang_back_seen"): continue
		if id in ["dou", "man"] and not f.get("gy_noodles_seen"): continue
		if REPS.has(id) and not (f.get("hg_aftercare_seen") and not _hostile(REPS[id])): continue
		out.append(n)
	return out

## 原版 letterRecipients(s)：书信只寄给不在谷里的人
static func letterRecipients(s: Dictionary) -> Array:
	var out := []
	for n in giftRecipients(s):
		if n.id in ["lu", "neighbor", "pei", "xu", "cen", "shen"] or (n.id == "fang" and s.facts.get("gy_fang_leaves_seen") and not s.facts.get("gy_brother_hurt_seen")): out.append(n)
	return out

## 原版 contactReason(s,id,recipient)
static func contactReason(s: Dictionary, id, recipient) -> String:
	if recipient == null: return ""
	if not CuDB.has_by(letterRecipients(s) if id == "C01" else giftRecipients(s), "name", recipient): return "尚未认识或不能投递给这位收件人。"
	for h in s.history:
		if h.get("period") == period(s) and h.get("action") == id:
			var who = h.get("recipient")
			if not who:
				var l = CuDB.find_by(s.letters, "id", h.get("id"))
				who = l.get("recipient") if l != null and l.get("recipient") else "陆衡"
			if who == recipient:
				return "%s本期已%s，下期再%s。" % [recipient, "收到一封近况信" if id == "C01" else "收到一份礼物", "寄信" if id == "C01" else "赠送"]
	return ""

## 原版 grudge(a)：好感底线，开始部分已敌对的人不触发可选剧情
static func grudge(a: Dictionary) -> String:
	if a.get("auto") or a.get("main"): return ""
	var nd = DB.g("QIHE_NPC_DATA")
	var P = nd.get("PEOPLE") if nd is Dictionary else null
	var B = G.S.get("qiheBond")
	if not (P is Dictionary) or not (B is Dictionary): return ""
	var who := {}
	for k in [a.get("teacher"), a.get("heart"), a.get("personal"), a.get("bottleneck")] + (a.get("cast", []) if a.get("cast") is Array else []):
		if k: who[k] = true
	for id in P:
		var p = P[id]
		if (who.has(p.name) or who.has(id)) and B.get(id) is Dictionary and B[id].get("hostile"): return p.name
	return ""

## 原版 availability(s,a,options)：空串表示可以进行，否则是原因
static func availability(s: Dictionary, a, options := {}) -> String:
	if a is Dictionary and a.get("id") == "C02" and options.get("gift"):
		if not options.gift in ["food", "herb", "pouch"]: return "此物品不能投递。"
		a = a.duplicate(); a.inputs = {options.gift: 1}
	if a == null: return "没有这个培养项目。"
	if s.get("pending"): return "请先完成或关闭当前活动结果。"
	if s.mode != "home" and not (a.get("storyMode") and a.storyMode == s.mode): return "三年培养已结束。" if s.mode == "complete" else "本期用于行程，不能领取据点体力。"
	if a.get("locked"): return a.locked
	var bg := CuBalance.gate(s, a)
	if bg != "": return bg
	if a.get("learn") in ["sword", "fist"] and not s.learned.get(a.learn) and s.learned.get("fist" if a.learn == "sword" else "sword"): return "先练好已学的基础功法；交叉修习需要另一次传艺，目前尚未开放。"
	var foe := grudge(a)
	if foe != "": return "和" + foe + "闹翻了，这段不会发生。"
	for k in a.get("requires", []) if a.get("requires") is Array else []:
		if k == "joined" and not s.joined: return "先与周砚正式拜师，再接受武学指导。"
		if k == "ye" and s.month > 12: return "叶蘅第二年的学习日程尚待剧情编排。"
		if k == "lu" and not ((s.month == 2 and s.phase >= 3) or (s.month == 3 and s.phase <= 1)): return "陆衡尚未到谷；来访窗口为二月下旬至三月上旬。"
		if k == "village_visit" and period(s) < 2: return "一月中旬收到乡邻近况后开放读信。"
		if not k in ["joined", "ye", "lu", "village_visit"] and not s.learned.get(k): return "尚未受过前置指导，请查看学艺或基本功课程。"
	var w = a.get("window")
	if w is Array and (period(s) < w[0] or (period(s) > w[1] and not (a.get("main") and s.month <= 5))): return "此邀约的可参与窗口已注明，当前不在窗口内。"
	for key in a.get("factRequires", []) if a.get("factRequires") is Array else []:
		if not s.facts.get(key): return a.get("factHint") if a.get("factHint") else "先完成相关行程或收到邀请。"
	var hg := CuHousehold.gate(s, a)
	if hg != "": return hg
	if a.get("adultOnly") and s.month < 13: return "萧白满十八岁（第二年正月初一）后才会出现。"
	if a.get("artNeed") is Dictionary:
		var need = CuBalance.artById(a.artNeed.id)
		if need == null or not s.learned.get(need.key) or CuBalance.level(s, need) < a.artNeed.level:
			return "先把《%s》练到%s%s。" % [need.name if need else "undefined", str(a.artNeed.level), "层" if need and need.type == "inner" else "重"]
	if a.get("relNeed") is Dictionary:
		var rs = s.get("relations", {}).get(a.relNeed.id) if s.get("relations") is Dictionary else null
		if (rs.get("score", 0) if rs is Dictionary else 0) < a.relNeed.min:
			return "与" + str(a.get("bottleneck") if a.get("bottleneck") else (a.get("heart") if a.get("heart") else a.get("teacher"))) + "的关系还不够。"
	if a.get("once") and s.facts.get(a.once): return "这段经历已完成，不能重复触发。"
	if a.get("quota") and (s.quotas.get(a.id) or (a.id == "W04" and hasActivityInPeriod(s, a.id))): return a.get("quotaMessage") if a.get("quotaMessage") else "本期可采份额已用完；下期再来。"
	if a.get("mail") and period(s) >= 179: return "三年修习即将收束，本期没有下一期投递窗口。"
	if a.get("mail"):
		var why := contactReason(s, a.id, options.get("recipient"))
		if why != "": return why
	var inp = a.get("inputs", {})
	for k in (inp if inp is Dictionary else {}):
		if s.resources.get(k, 0) < inp[k]: return "缺少" + D().resources[k] + " " + str(inp[k] - s.resources.get(k, 0)) + "份。"
	var c := actionCost(a)
	if s.energy < c: return "还差" + str(c - s.energy) + "点体力。"
	return ""

## 原版 start(s,id,options)：开始一个活动（扣体力与材料，生成 pending）
static func start(s: Dictionary, id: String, options := {}):
	CuGrowth.ensure(s, actions())
	var a = CuDB.action(id)
	options = options.duplicate()
	if a != null and a.get("mail") and options.get("recipient") == null: options.recipient = "陆衡"
	var why := availability(s, a, options)
	if why != "": return CuDB.fail(why)
	if options.get("story") and not a.get("once"): return CuDB.fail("此项目不是独立剧情。")
	if a.get("mail") and not options.get("theme") in ["近况", "问候乡邻", "外出准备"]: return CuDB.fail("请选择信件主题。")
	var cost := actionCost(a)
	var inputs: Dictionary = {options.gift: 1} if a.id == "C02" and options.get("gift") else (a.get("inputs", {}) if a.get("inputs") is Dictionary else {})
	s.energy -= cost
	for k in inputs: s.resources[k] -= inputs[k]
	var needs_choice: bool = not options.get("directResult") and a.get("choice") is Array and (not a.get("learn") or not s.learned.get(a.learn))
	s.sequence += 1
	s.pending = {"id": "cultivation-" + str(s.sequence), "economyVersion": D().economyVersion, "action": id, "period": period(s), "cost": cost, "energyBefore": s.energy + cost, "moodBefore": s.mood, "balanceVersion": CuBalance.version, "stage": "choice" if needs_choice else "ready", "theme": options.get("theme") if options.get("theme") else null, "recipient": options.get("recipient") if options.get("recipient") else null, "gift": options.get("gift") if options.get("gift") else null, "inputs": inputs, "result": null}
	if options.get("story") or a.get("visitor"):
		s.pending.story = true; s.pending.storyStep = 0
	if a.get("visitor"): s.pending.visitor = CuVisitors.init(s, id)
	s.selection = {"category": a.category, "action": id}
	if options.get("animate"): beginAnimation(s, options.get("now"))
	return s.pending

static func _place_of(a: Dictionary) -> String: return CuScenes.placeKey(a.get("place"))
static func _door_of(k: String) -> String: return "bookhouse" if k == "bookhouse_inside" else k
static func _met_key(k: String) -> String: return "visit_met" if NEIGHBOR.has(k) else "stroll_met"

## 原版 strollPool(s,place)：该地点此刻可遇的支线
static func strollPool(s: Dictionary, place) -> Array:
	var key := CuScenes.placeKey(place)
	var out := []
	for a in actions():
		if a.category != "stroll" or not a.get("once") or a.get("auto") or a.get("hidden") or a.get("strollPlace"): continue
		if _door_of(_place_of(a)) != key: continue
		if s.facts.get("mentor_met" if a.get("mentor") else _met_key(key)) == period(s): continue
		if availability(s, a) != "": continue
		out.append(a)
	return out

## 原版 strollPick(s,place)：确定性随机（FNV-1a），快到期的权重高
static func strollPick(s: Dictionary, place):
	var pool := strollPool(s, place)
	if pool.is_empty(): return null
	var now := period(s)
	var w := []
	var total := 0
	for a in pool:
		var x := 3 if a.get("window") is Array and a.window[1] - now <= 5 else 1
		w.append(x); total += x
	var h := 2166136261
	var seed_s := "%d|%s|%d|%d" % [now, str(place), s.sequence, s.history.size()]
	for i in seed_s.length():
		h = h ^ (seed_s.unicode_at(i) & 0xFFFF)
		h = (h * 16777619) & 0xFFFFFFFF
	var r := h % total
	for i in pool.size():
		if r < w[i]: return pool[i]
		r -= w[i]
	return pool[0]

## 原版 stroll(s,id)：去某地闲逛
static func stroll(s: Dictionary, id: String):
	var a = CuDB.action(id)
	if a == null or not a.get("strollPlace"): return CuDB.fail("没有这个闲逛地点。")
	if s.get("pending"): return CuDB.fail("请先完成或关闭当前活动结果。")
	if s.mode != "home": return CuDB.fail("本期用于行程，不能闲逛。")
	if not s.joined: return CuDB.fail("先与周砚正式拜师。")
	var pick = strollPick(s, a.place)
	if pick != null:
		if start(s, pick.id, {"story": true}) == null: return null
		s.facts["mentor_met" if pick.get("mentor") else _met_key(CuScenes.placeKey(a.place))] = period(s)
		return {"story": pick.id}
	s.selection = {"category": "stroll", "action": id}
	return {"story": null, "text": a.get("idle")}

## 原版 beginAnimation(s,now)
static func beginAnimation(s: Dictionary, now = null):
	var p = s.get("pending")
	if not p or p.get("story") or p.stage == "result": return false
	if now == null: now = CuDB.now_ms()
	if now < 0: return CuDB.fail("动作时间不正确。")
	if not p.get("animation"): p.animation = {"startedAt": now, "duration": 2000, "done": false}
	return p.animation

## 原版 finishAnimation(s,now)
static func finishAnimation(s: Dictionary, now = null) -> bool:
	var p = s.get("pending")
	var an = p.get("animation") if p is Dictionary else null
	if not an: return true
	if an.done: return true
	if now == null: now = CuDB.now_ms()
	if now - an.startedAt < an.duration: return false
	an.done = true
	return true

static func _round_js(x: float) -> int:
	return floori(x + 0.5)

## 原版 resolve(s,choice,options)：结算当前活动
static func resolve(s: Dictionary, choice = null, options := {}):
	var p = s.get("pending")
	if not p: return null
	if p.stage == "result": return p.result
	if p.get("animation") and not p.animation.done: return CuDB.fail("请等待本次动作完成。")
	var a = CuDB.action(p.action)
	var before := growth(s)
	var relations_before := {}
	for k in s.get("relations", {}): relations_before[k] = s.relations[k].score
	if a.get("visitor"):
		if CuVisitors.validate(p) == null: return null
		if p.visitor.phase != "commit": return CuDB.fail("请先完成来访对白与选择。")
		choice = p.visitor.selected
	if not a.get("visitor") and p.stage == "choice" and not options.get("directResult") and (not CuDB.is_int(choice) or choice < 0 or choice >= a.choice.size()): return CuDB.fail("请先作出本课选择。")
	var first: bool = a.get("learn") != null and not s.learned.get(a.learn)
	if first:
		s.learned[a.learn] = {"source": a.id, "period": p.period}
		if a.learn in ["sword", "fist"] and not s.facts.get("gy_martial_major"): s.facts.gy_martial_major = {"path": a.learn, "source": a.id, "period": p.period}
	var gain_multiplier := 1
	var fg = CuHousehold.fightGain(s, a, CuVisitors.selectedKey(s, p)) if a.get("fight") and a.get("visitor") else null
	var learning: Dictionary
	if p.get("legacyBalance"):
		learning = CuBalance.preview(s, a, first, fg)
		var lg = a.get("legacyGain") if a.get("legacyGain") else a.get("gain")
		learning.key = lg
		var amt = fg.amount if fg is Dictionary and fg.get("amount") != null else a.get("legacyAmount", 0)
		var mm := 1.0 if a.get("fixedGain") else (1.15 if s.mood >= 75 else (1.0 if s.mood >= 45 else (0.9 if s.mood >= 20 else 0.75)))
		learning.gain = CuDB.fix(_round_js((amt if amt else 0) * mm) * CuBalance.legacyScale().get(lg, 1))
		learning.xp = 0 if first else 25
	else:
		learning = CuBalance.preview(s, a, first, fg)
	var gain_key = learning.key
	var gain = learning.gain
	s.progress = CuGrowth.counters(s, actions())
	if gain_key and gain: s.progress[gain_key] = s.progress.get(gain_key, 0) + gain
	if learning.get("artId"): CuBalance.addXp(s, learning.artId, learning.xp)
	var outputs: Dictionary = (a.get("outputs", {}) as Dictionary).duplicate() if a.get("outputs") is Dictionary else {}
	if a.id == "P02": outputs.food = outputs.get("food", 0) + growth(s).craft.food
	if a.id == "P03": outputs.pouch = outputs.get("pouch", 0) + growth(s).craft.pouch
	for k in outputs: s.resources[k] = s.resources.get(k, 0) + outputs[k]
	if a.get("once"): s.facts[a.once] = {"period": p.period, "choice": choice}
	if a.get("visitor"): CuVisitors.effects(s, p)
	if a.get("quota"): s.quotas[a.id] = true
	if a.get("mail"):
		if not p.get("recipient"): p.recipient = "陆衡"
		var event = CuRelations.record(s, p)
		if event == null: return null
		p.relationship = event
		s.letters.append({"id": p.id, "theme": p.theme, "recipient": p.recipient, "author": event.author, "gift": p.get("gift"), "due": p.period + 1, "read": false, "body": event.body, "returnItems": event.returns, "returnClaimed": false})
	s.mood = clampMood(s.mood + (0 if CuPreHangao.is_new_candidate(a.id) else MOOD_DELTA.get(a.category, 0)))
	p.stage = "result"
	p.resolvedAt = CuDB.now_ms()
	var feedback = ("给%s的%s已交给捎物人，下一期查看回复。" % [p.recipient, D().resources[p.gift if p.get("gift") else "food"]]) if a.id == "C02" else a.get("feedback")
	p.result = {"id": p.id, "taught": p.get("taught"), "name": a.name, "feedback": feedback, "relationship": p.get("relationship"), "recipient": (p.recipient if p.get("recipient") else "陆衡") if a.get("mail") else null, "gift": (p.gift if p.get("gift") else "food") if a.id == "C02" else null, "gain": gain, "gainName": D().progressNames.get(gain_key) if gain_key else null, "first": first, "cost": p.cost, "energyBefore": p.energyBefore, "energyAfter": s.energy, "moodBefore": p.get("moodBefore", s.mood), "moodAfter": s.mood, "moodMultiplier": gain_multiplier, "learning": learning, "outputs": outputs, "choice": choice}
	var hist := {"id": p.id, "balanceVersion": CuBalance.version, "artXp": learning.xp, "artId": learning.get("artId"), "action": a.id, "name": a.name, "period": p.period, "cost": p.cost, "freePractice": p.cost == 0, "nominalCost": nominalCost(a), "gain": gain, "gainKey": gain_key, "skillId": CuGrowth.courses().get(a.get("learn"), {}).get("skillId") if a.get("learn") else null, "systemId": CuGrowth.courses().get(a.get("learn"), {}).get("systemId") if a.get("learn") else null, "choice": choice}
	if a.get("mail"):
		hist.recipient = p.recipient if p.get("recipient") else "陆衡"; hist.gift = p.get("gift")
	s.history.append(hist)
	var after := growth(s)
	p.result.training = {"before": before, "after": after}
	p.result.gainKey = gain_key
	p.result.effectChanges = CuGrowth.outcome(before, after)
	p.result.nextEffect = CuGrowth.hints(s, gain_key, actions()) + (("；" + CuBalance.courseHint(s, a)) if learning.get("artId") else "")
	var rc := []
	for k in s.get("relations", {}):
		var v: Dictionary = s.relations[k]
		var touched := false
		for e in v.get("interactions", []):
			if e.get("id") == p.id: touched = true
		if v.score != relations_before.get(k, 0) or touched:
			var nm := CuRelations.name_of(k)
			var ev = CuDB.find_by(v.interactions, "id", p.id)
			rc.append({"id": k, "name": nm, "before": relations_before.get(k, 0), "after": v.score, "delta": v.score - relations_before.get(k, 0), "reason": ev.get("reason", "") if ev != null else "", "stage": CuRelations.inspect(s, nm).stage})
	p.result.relationshipChanges = rc
	var beats = a.get("beats")
	p.result.courseBeat = beats[0 if first else min(1, beats.size() - 1)] if beats is Array and beats.size() > 0 else null
	p.result.lesson = CuPreHangao.lesson(s, a, first, before, after)
	return p.result

## 原版 readLetter(s,id)
static func readLetter(s: Dictionary, id):
	if s.get("pending"): return CuDB.fail("请先结束当前活动。")
	var l = CuDB.find_by(s.letters, "id", id)
	if l == null: return CuDB.fail("没有这封来信。")
	if l.due > period(s): return CuDB.fail("来信尚未送达。")
	if not l.get("returnClaimed"):
		var ri = l.get("returnItems", {})
		ri = ri if ri is Dictionary else {}
		for k in ri:
			if not D().resources.has(k) or not CuDB.is_int(ri[k]) or ri[k] < 1: return CuDB.fail("回物记录不正确。")
		for k in ri: s.resources[k] = s.resources.get(k, 0) + ri[k]
		l.returnClaimed = true
	l.read = true
	return l

static func relationship(s: Dictionary, name): return CuRelations.inspect(s, name)

## 原版 giftPreview(s,name,gift)
static func giftPreview(s: Dictionary, name, gift):
	return CuRelations.record(CuDB.copy(s), {"id": "gift-preview", "action": "C02", "period": period(s), "recipient": name, "gift": gift})

## 原版 closeResult(s)：占整期的剧情收尾后推进；赴城转场收尾后出发
static func closeResult(s: Dictionary) -> bool:
	var p = s.get("pending")
	if not p or p.stage != "result": return false
	var a = CuDB.action(p.action)
	s.pending = null
	migrateEconomy(s)
	if a != null and a.get("storyMode") == "story" and s.mode == "story":
		s.history.append({"id": "story-delivery", "name": "首次同行送药", "period": period(s), "cost": 0, "gain": 0})
		s.phase += 1
		syncMode(s)
	elif a != null and a.get("storyMode") == "journey_ready" and s.mode == "journey_ready" and not a.id in ["hg_road", "gy_new_year_dawn"]:
		depart(s)
	return true

static func _avail_callable() -> Callable:
	return func(st, ac, op := {}): return availability(st, ac, op)

## 原版 advance(s)：结束本期
static func advance(s: Dictionary):
	var waiting := CuPreHangao.advanceGate(s, CuHousehold.actions(), _avail_callable())
	if waiting != "": return CuDB.fail(waiting)
	if s.get("pending"): return CuDB.fail("请先结束当前活动。")
	if s.mode != "home": return CuDB.fail("请先完成本期行程。")
	var old: int = s.month
	var remaining: int = s.energy
	s.mood = clampMood(s.mood + (6 if remaining >= 6 else (3 if remaining >= 3 else (1 if remaining > 0 else 0))))
	if s.phase == 4:
		var entries := []
		for h in s.history:
			if floori(h.period / 5.0) + 1 == old: entries.append(h)
		s.summary = {"month": old, "entries": entries, "remaining": remaining}
		if s.month == 36:
			s.mode = "complete"; s.energy = 0
			return s
		s.month += 1; s.phase = 0
	else:
		s.phase += 1
	syncMode(s)
	return s

## 原版 completeStory(s,choice)
static func completeStory(s: Dictionary, choice):
	if s.mode != "story" or s.get("pending"): return CuDB.fail("当前不是送药行程。")
	if not choice in ["协同行路", "请陆衡指导"]: return CuDB.fail("请选择行路方式。")
	s.facts.first_delivery = {"choice": choice, "month": s.month, "method": ("guided_footwork" if s.learned.get("footwork") else "assisted_carry") if choice == "协同行路" else "asked_for_guidance", "training": growth(s)}
	s.history.append({"id": "story-delivery", "name": "首次同行送药", "period": period(s), "cost": 0, "gain": 0})
	s.phase += 1
	syncMode(s)
	return s

## 原版 depart(s)
static func depart(s: Dictionary):
	if s.mode != "journey_ready" or s.get("pending"): return CuDB.fail("当前不能出发。")
	s.mode = "journey"; s.energy = 0
	s.journey = {"month": s.month, "returnMonth": s.month + 1, "returnRoute": s.route, "visited": [], "place": null}
	if s.month == 5 and s.facts.get("hg.pre.gate_handoff"): s.journey.kind = "hangao_gate"
	return s

## 原版 visit(s,id)
static func visit(s: Dictionary, id):
	if s.mode != "journey" or not id in PLACES4: return CuDB.fail("当前地点不可前往。")
	if not id in s.journey.visited: s.journey.visited.append(id)
	s.journey.place = id; s.screen = "world"
	return s

## 原版 returnJourney(s)
static func returnJourney(s: Dictionary):
	if s.mode != "journey": return CuDB.fail("当前没有历练。")
	s.facts["journey_" + str(s.month)] = {"visited": (s.journey.visited as Array).duplicate(), "returnRoute": s.journey.returnRoute}
	s.history.append({"id": "journey-" + str(s.month), "name": "整月历练", "period": (s.month - 1) * 5, "cost": 0, "gain": 0})
	s.month += 1; s.phase = 0; s.journey = null
	syncMode(s)
	return s

## 原版 dueStory(s)：当前应自动开场的剧情
static func dueStory(s: Dictionary):
	if not s.mode in ["home", "story", "journey_ready"] or s.get("pending") or s.get("summary") or not s.joined: return null
	return CuHousehold.due(s, _avail_callable())

## 原版 visitorNext(s)
static func visitorNext(s: Dictionary):
	var p = s.get("pending")
	if not p or not p.get("visitor") or p.stage == "result": return null
	return resolve(s, p.visitor.selected) if CuVisitors.next(p) else null

## 原版 visitorChoose(s,index)
static func visitorChoose(s: Dictionary, index) -> void:
	var p = s.get("pending")
	if not p or not p.get("visitor") or p.stage == "result":
		CuDB.fail("当前没有可选择的来访剧情。"); return
	CuVisitors.choose(p, index)
