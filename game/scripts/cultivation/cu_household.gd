class_name CuHousehold
extends RefCounted
## 原版 js/qh-mode-cultivation-household.js（CultivationHousehold）：归云谷一家的师门剧情定义、结算效果、立绘表情。
## 定义、对白、bonds、MOODS、TONE、portraits 取导出的运行时数据（已合并 side/neighbors/mentors 与 PreHangao.definitions）；
## 对白脚本见 CuVisitors.script（决策表）。

const ART := "assets/production/cultivation/household-v1/"

static func T(): return CuDB.t("CultivationHousehold")
static func definitions() -> Array: return T().definitions
static func actions() -> Array: return T().actions
static func notices() -> Array: return T().notices
static func actors() -> Dictionary: return T().actors
static func portraits() -> Dictionary: return T().portraits
static func bonds() -> Dictionary: return T().bonds
static func MOODS() -> Dictionary: return T().MOODS
static func TONE() -> Dictionary: return T().TONE

static func has(id) -> bool:
	return CuDB.has_by(definitions(), "id", id)

static func relationScore(s: Dictionary, id: String) -> int:
	var r = s.get("relations", {}).get(id) if s.get("relations") is Dictionary else null
	return int(r.get("score", 0)) if r is Dictionary else 0

## 原版 gate(s,a)：过招要先学会一门招式
static func gate(s: Dictionary, a: Dictionary) -> String:
	if a.get("needSkill") and not s.learned.get("sword") and not s.learned.get("fist"): return "先学会一门招式（入门剑式或粗浅拳脚）。"
	return ""

## 原版 fightGain(s,d,key)
static func fightGain(s: Dictionary, d: Dictionary, key) -> Dictionary:
	var w = "sword" if s.learned.get("sword") else ("fist" if s.learned.get("fist") else null)
	if w == null: return {"gain": d.get("gain"), "amount": d.get("amount")}
	return {"gain": w, "amount": 6 if key == "win" else 3}

## 原版 fightOptions(d)：传给战斗的参数
static func fightOptions(d: Dictionary) -> Dictionary:
	var foes := []
	for f in CuDB.copy(d.fight.foes):
		var x := {"exp": 0, "silver": 0, "drops": {}}
		x.merge(f, true)
		if d.id == "gy_fang_spar": x.guiyunGuardOnly = true
		foes.append(x)
	return {"solo": true, "noLose": true, "noFlee": true, "spar": CuDB.truthy(d.get("sparWith")), "bg": d.fight.bg, "foes": foes}

## 原版 routes(s)：入队／if 线／基础事实汇总
static func routes(s: Dictionary) -> Dictionary:
	var f: Dictionary = s.facts
	var lu := []
	if f.get("promise_scope"): lu.append("话别说得太满")
	if f.get("gy_l02_seen"): lu.append("说早了的日子")
	if f.get("first_delivery"): lu.append("首季护送")
	return {"yin": {"type": "direct", "joined": CuDB.truthy(f.get("gy_yin_recruit")), "if": f.get("if_yin"), "personal": CuDB.truthy(f.get("gy_yin_past_seen")), "bond": CuDB.truthy(f.get("gy_bond_yin"))}, "ye": {"type": "initial", "joined": true, "trust": CuDB.truthy(f.get("gy_ye_lamp_seen"))}, "lu": {"type": "groundwork", "groundwork": lu}}

## 原版 extra(s)
static func extra(s: Dictionary) -> Dictionary:
	var qo = s.get("qhOrigin")
	var chen = qo.get("chenCare") if qo is Dictionary else null
	var rel := {}
	if s.get("relations") is Dictionary:
		for k in s.relations: rel[k] = s.relations[k].get("score", 0)
	var f: Dictionary = s.facts
	var fd = f.get("first_delivery")
	var major = f.get("gy_martial_major").get("path") if f.get("gy_martial_major") is Dictionary else null
	if not major:
		if s.learned.get("sword") and not s.learned.get("fist"): major = "sword"
		elif s.learned.get("fist") and not s.learned.get("sword"): major = "fist"
		else: major = f.get("gy_fist_or_sword_choice")
	if not major: major = null
	var sl = f.get("spar_log")
	var out := CuPreHangao.extra(s)
	out.merge({"rel": rel, "adult": s.month >= 13, "pei": {"chests": f.get("gn_chests_choice") if f.get("gn_chests_choice") else null}, "yinJoined": CuDB.truthy(f.get("gy_yin_recruit")), "sparWins": sl.get("wins", 0) if sl is Dictionary else 0,
		"learned": {"footwork": CuDB.truthy(s.learned.get("footwork")), "fist": CuDB.truthy(s.learned.get("fist")), "sword": CuDB.truthy(s.learned.get("sword"))},
		"opening": {"chen_injury": "light" if chen == "擦伤已照护" else ("rest" if chen == "腿伤待照护" else "unknown")},
		"first_delivery": {"method": fd.get("method") if fd is Dictionary and fd.get("method") else null},
		"facts": {"pre_departure_talk_seen": CuDB.truthy(f.get("departure_goals")), "first_ye_work_seen": CuDB.truthy(f.get("herb_labels"))},
		"yinScore": relationScore(s, "yin"), "major": major, "go": f.get("gy_go_in_stead_choice") if f.get("gy_go_in_stead_choice") else null,
		"footwork": CuDB.truthy(s.learned.get("footwork")), "ledger": CuDB.truthy(f.get("gy_ledger_seen"))}, true)
	return out

## 原版 effects(s,p,key)：剧情结算（关系、入队、切磋记录、src 剧本的 effects、入谷过渡学会的功夫）
static func effects(s: Dictionary, p: Dictionary, key) -> void:
	var pair = [["裴知古", 4]] if p.action == "gn_depart" and key in ["join", "roster"] else bonds().get(p.action, {}).get(key)
	var list := []
	if pair is Array and pair.size() > 0:
		list = pair if pair[0] is Array else [pair]
	for e in list: CuRelations.story(s, e[0], e[1], p.id)
	var f: Dictionary = s.facts
	if p.action == "gy_go_in_stead" and key == "go_with_yin" and not f.get("gy_yin_recruit"): f.gy_yin_recruit = {"period": p.period, "source": p.action}
	if p.action == "gy_new_year" and not f.get("gy_yin_recruit"):
		if relationScore(s, "yin") >= 40: f.gy_yin_recruit = {"period": p.period, "source": p.action}
		elif not f.get("if_yin"): f.if_yin = {"missed": "没有同行，且第一年除夕时关系不足 40", "period": p.period}
	if p.action == "gn_depart" and not f.get("gy_pei_join"): f.gy_pei_join = {"period": p.period}
	var fd = CuDB.find_by(definitions(), "id", p.action)
	if fd != null and fd.get("fight"):
		if not (f.get("spar_log") is Dictionary): f.spar_log = {"wins": 0, "fights": 0}
		f.spar_log.fights += 1
		if key == "win": f.spar_log.wins += 1
		if fd.get("sparWith"):
			var k: String = "spar_first_" + fd.sparWith
			if key == "win" and not f.get(k):
				f[k] = {"period": p.period}
				s.resources.food = s.resources.get("food", 0) + 1
	if p.action == "gy_yin_bond" and key == "bond_yin": f.gy_bond_yin = {"period": p.period}
	if p.action == "gy_yin_bond" and key == "not_yet": f.erase("gy_yin_bond_seen")
	if fd != null and fd.get("src"):
		var x = CuVisitors.eventScript(p)
		var ch = CuDB.find_by(x.choices, "key", key)
		var effs = ch.get("effects") if ch != null else null
		for e in (effs if effs is Array else []):
			var kv: PackedStringArray = str(e).split("=", true, 1)
			var v = kv[1] if kv.size() > 1 else ""
			if kv[0] == "first_delivery.method": f.first_delivery = {"choice": "请陆衡指导" if key == "guidance" else "协同行路", "month": s.month, "method": v, "source": p.action}
			else: f[kv[0]] = true if v == "true" else v
	if p.action == "gy_prelude_stance" and not s.learned.get("stance"): s.learned.stance = {"source": p.action, "period": p.period}
	if p.action == "gy_prelude_xinfa" and not s.learned.get("breathing"): s.learned.breathing = {"source": p.action, "period": p.period}
	if p.action == "gy_prelude_hair": f.gy_hair_long = {"period": p.period}
	# 2026-11-06《底布上的印子》：三件遗产的头一条实证（夹层照一只四脚方匣改过），带去汉皋问
	if p.action == "ys_box_mark": f.ye_box_mark = {"choice": key, "period": p.period}
	_mentor_effects(s, p)
	CuPreHangao.effects(s, p, key)

## 原版 qh-mode-cultivation-mentors.js effects(s,p)：师承剧情传授功法
static func _mentor_effects(s: Dictionary, p: Dictionary) -> void:
	var d = CuDB.find_by(CuDB.t("CultivationMentors").definitions, "id", p.action)
	if d == null: return
	if d.get("teaches"):
		var a = CuBalance.artById(d.teaches)
		if not s.learned.get(a.key): s.learned[a.key] = {"source": p.action, "period": p.period}
		p.taught = a.name
	if p.action == "ys_lu_rope" and s.learned.get("qh_hulu_staff"): CuBalance.addXp(s, "qh_hulu_staff", 25)

## 原版 due(s,availability)：当前时段应自动开场的日历剧情
static func due(s: Dictionary, availability: Callable):
	var pre = CuPreHangao.due(s, actions(), availability)
	if pre != null: return pre
	var now := CuDB.period(s)
	for a in actions():
		if a.get("auto") and now >= a.window[0] and now <= a.window[1] and not s.facts.get(a.once) and availability.call(s, a, {}) == "": return a
	return null

## 原版 upcoming(s)
static func upcoming(s: Dictionary) -> Array:
	var now := CuDB.period(s)
	var out := []
	for d in definitions():
		if not d.get("prelude") and not s.facts.get(d.id + "_seen") and d.window[1] >= now and d.window[0] <= now + 5: out.append(d)
	return out

## 原版 heroForm(s)：短发／半长／长发
static func heroForm(s) -> String:
	if s == null or s.get("facts", {}).get("gy_hair_long"): return "long"
	if not (s.month == 1 and s.phase == 0): return "long"
	return "mid" if s.get("facts", {}).get("gy_prelude_stance_seen") else "short"

static func heroPortrait(s, mood) -> String:
	return portraitFor("hero_" + heroForm(s), mood)

const FALLBACK := {"hurt_worry": ["hurt_sad", "hurt_normal"], "hurt_angry": ["hurt_serious", "hurt_normal"], "hurt_surprise": ["hurt_normal"], "hurt_fun": ["hurt_smile", "hurt_normal"], "hurt_smile": ["hurt_normal"], "hurt_serious": ["hurt_normal"], "hurt_sad": ["hurt_normal"], "hurt_normal": [], "sleep": ["normal"], "serious": ["normal"], "worry": ["sad", "serious", "normal"], "angry": ["serious", "normal"], "sad": ["worry", "normal"], "surprise": ["normal"], "smile": ["normal"], "fun": ["laugh", "smile", "normal"], "laugh": ["fun", "smile", "normal"], "awkward": ["worry", "normal"], "normal": []}
const ALIAS := {"recipient": "neighbor"}

## 原版 resolveMood(id,mood)
static func resolveMood(id: String, mood: String):
	var M := MOODS()
	var list = M.get(id)
	if id == "recipient": list = M.get("neighbor")
	if list == null: return null
	var last := "hurt_normal" if mood.begins_with("hurt_") and "hurt_normal" in list else "normal"
	for m in [mood] + FALLBACK.get(mood, []) + [last]:
		if m in list: return m
	return list[0]

## 原版 portraitFor(id,mood)
static func portraitFor(id: String, mood) -> String:
	var m = resolveMood(id, mood if mood else "normal")
	if m == null: return str(portraits().get(id, ""))
	id = ALIAS.get(id, id)
	if id in ["hero_short", "hero_mid", "hero_long"]:
		var st: String = {"angry": "serious", "awkward": "worry", "laugh": "smile", "fun": "smile"}.get(m, m)
		if id != "hero_long" and st in ["hurt", "sleep"]: st = "worry" if st == "hurt" else "normal"
		return "assets/production/cultivation/hero-empty/" + id + "_empty_" + st + ".png"
	if m == "fun" and not id.begins_with("hero_"): return str(portraits().get(id, ""))
	return ART + id + "_" + m + ".png"

## 原版 moodsFor 的保持状态
## 11-10 动作差分（R-画风-06，三方代表：递纸、点人、捧茶、展扇、托药包、执笔）也算强：说到那一句就换，不等两句
const STRONG := ["surprise", "angry", "sad", "fun", "laugh", "awkward", "paper", "point", "tea", "fan", "herb", "note"]
static var HOLD := {"event": null, "key": null, "held": {}, "since": {}, "n": 0}

static func _base_id(id: String) -> String:
	return "hero" if id == "hero" or id.begins_with("hero_") else id

## 原版 moodsFor(eventId,line,cast)：同屏每人的表情
static func moodsFor(event_id, line, cast) -> Dictionary:
	var tone: Dictionary = TONE().get(event_id, {}) if event_id != null else {}
	var sp: String = str(line.get("speaker", "")) if line is Dictionary and line.get("speaker") else ""
	var tx: String = str(line.get("text", "")) if line is Dictionary and line.get("text") else ""
	var key := sp + "|" + tx
	if HOLD.event != event_id: HOLD = {"event": event_id, "key": null, "held": {}, "since": {}, "n": 0}
	if HOLD.key != key:
		HOLD.key = key; HOLD.n += 1
		var n: int = HOLD.n
		var want := {}
		if line is Dictionary and line.get("mood") and sp != "" and sp != "narrator": want[_base_id(sp)] = line.mood
		if line is Dictionary and line.get("moods") is Dictionary:
			for k in line.moods: want[_base_id(k)] = line.moods[k]
		var ids := {}
		for b in HOLD.held: ids[b] = true
		for b in want: ids[b] = true
		for b in ids:
			var cur = HOLD.held.get(b, tone.get(b, "normal"))
			var w = want.get(b)
			var last = HOLD.since.get(b, -9)
			if w and w != cur and (w in STRONG or cur in STRONG or n - last >= 2):
				HOLD.held[b] = w; HOLD.since[b] = n
			elif not w and cur in STRONG and n - last >= 2:
				HOLD.held[b] = tone.get(b, "normal"); HOLD.since[b] = n
	var out := {}
	for id in (cast if cast is Array else []):
		var b := _base_id(id)
		out[id] = HOLD.held.get(b, tone.get(b, "normal"))
	var d = CuDB.find_by(definitions(), "id", event_id)
	var st = d.get("state") if d != null else null
	if st is Dictionary:
		for id in out:
			var k = st.get(_base_id(id))
			if k and not (str(out[id]).begins_with("hurt_") or out[id] == "sleep"): out[id] = k + "_" + out[id]
	return out

static func resetMoods() -> void:
	HOLD = {"event": null, "key": null, "held": {}, "since": {}, "n": 0}
