class_name CuPei
extends RefCounted
## 原版 js/pei-companion.js（PeiCompanion）：裴知古的书卷成长、入队与见证记录。
## 战斗内技能（cast/consumeIncoming/defend/expire/actionStart）也一并移植，供战斗模块调用。

const id := "peizhigu"
const ALLOWED := ["hg.pre.road_help", "hg.m01", "hg.m03", "hg.m05", "hg.m06", "hg.m07", "hg.m08"]
const skills := {
	"pei_zhi": {"name": "指瑕", "mp": 4, "tgt": "foe", "desc": "揭示一个未知弱点；下次受击伤害增加10%至25%，不造成伤害或削盾。"},
	"pei_wen": {"name": "温故", "mp": 6, "tgt": "foe", "desc": "查看并锁定下一条尚未公开意图；曾见敌类下次伤害减少10%至25%。"},
	"pei_shen": {"name": "慎行", "mp": 6, "tgt": "ally", "desc": "同伴下次受击减伤20%至35%，免疫一次位移。"},
	"pei_jiao": {"name": "校雠", "mp": 10, "tgt": "foes", "desc": "各揭示一个未知弱点；全弱点已知者受一次破绽，冷却两次自身行动。"},
}

## 原版 fresh()
static func fresh() -> Dictionary:
	return {"st": {"str": 1, "con": 3, "agi": 3, "wil": 5, "wis": 7}, "lv": 3, "exp": 0, "pts": 0, "skills": {"pei_zhi": 1}, "weapon": "pei_sujian", "armor": null,
		"equip": {"weapon": "pei_sujian", "armor": null, "acc": null}, "load": ["pei_zhi"], "xinfa": {"known": ["tuna"], "lv": {"tuna": 1}, "prog": {}, "main": "tuna", "subs": []},
		"growthMode": "witness", "witness": {}, "book": {"id": "pei_sujian", "grade": "丁", "witnessCount": 0}, "peiVersion": 1}

## 原版 ensure(world)
static func ensure(world: Dictionary) -> Dictionary:
	var mates := CuDB.dict_of(world, "mates")
	if not (mates.get(id) is Dictionary): mates[id] = fresh()
	var m: Dictionary = mates[id]
	if not m.get("peiVersion"): m.peiVersion = 1
	m.growthMode = "witness"
	var w := CuDB.dict_of(m, "witness")
	if not (m.get("book") is Dictionary): m.book = {"id": "pei_sujian", "grade": "丁", "witnessCount": w.size()}
	m.weapon = "pei_sujian"
	if not (m.get("equip") is Dictionary): m.equip = {"weapon": "pei_sujian", "armor": null, "acc": null}
	m.equip.weapon = "pei_sujian"
	if not (m.get("load") is Array) or (m.load as Array).is_empty(): m.load = ["pei_zhi"]
	if not (m.get("skills") is Dictionary): m.skills = {"pei_zhi": 1}
	if not m.skills.get("pei_zhi"): m.skills.pei_zhi = 1
	return m

static func _roster(world: Dictionary) -> Dictionary:
	if not (world.get("qiheRoster") is Dictionary):
		world.qiheRoster = {"version": 1, "members": ["hero"] + (world.get("party", []) as Array), "availability": {}, "revision": 0, "commands": []}
	return world.qiheRoster

## 原版 recruit(world,preference)
static func recruit(world: Dictionary, preference := "join") -> Dictionary:
	var m := ensure(world)
	var r := _roster(world)
	if not id in r.members:
		r.members.append(id); r.revision += 1
	var party := CuDB.arr_of(world, "party")
	if not m.get("partyChoiceApplied"):
		if preference == "join" and not id in party and party.size() < 3: party.append(id)
		m.partyChoiceApplied = true
	return {"id": id, "level": m.lv, "inParty": id in party, "full": party.size() >= 3 and not id in party}

## 原版 witness(world,event,opts)
static func witness(world: Dictionary, event: String, opts := {}) -> bool:
	var participants: Array = opts.get("participants", []) if opts.get("participants") is Array else []
	var completed: bool = opts.get("completed", true)
	var m = world.get("mates", {}).get(id) if world.get("mates") is Dictionary else null
	if m == null or not completed or not event in ALLOWED or not id in participants or not id in world.get("party", []) or m.witness.get(event): return false
	m.witness[event] = {"version": 1, "completedAt": CuDB.now_ms(), "outcome": opts.get("outcome"), "note": opts.get("note", "")}
	var n: int = m.witness.size()
	m.book.witnessCount = n
	m.lv = max(m.lv, min(100, 3 + floori(n / 3.0)))
	if n >= 10 and m.witness.get("hg.m08"):
		m.book.grade = "丙"; m.skills.pei_wen = 1
	var cu = world.get("cultivation")
	if n >= 30 and cu is Dictionary and cu.get("mode") == "complete":
		m.book.grade = "乙"; m.skills.pei_shen = 1
	if n >= 60 and world.get("flags", {}).get("pei_three_descendants"):
		m.book.grade = "甲"; m.skills.pei_jiao = 1
	return true

static func _is_sword(k) -> bool:
	var it = DB.ITEMS.get(k) if k != null else null
	return it is Dictionary and it.get("weapon") is Dictionary and it.weapon.get("kind") == "剑"

## 原版 sync(world)
static func sync(world: Dictionary) -> void:
	var s = world.get("cultivation")
	if not (s is Dictionary): return
	if not (s.get("preHangao") is Dictionary): s.preHangao = {"version": 1}
	s.preHangao.weapon = world.get("weapon") if _is_sword(world.get("weapon")) else null
	if s.facts.get("hg.pre.loan_request") and not s.facts.get("hg.pre.loan_committed"):
		var bag := CuDB.dict_of(world, "bag")
		if not world.get("weapon") or not _is_sword(world.get("weapon")):
			bag.guiyun_wood_loan = bag.get("guiyun_wood_loan", 0) + 1
			world.weapon = "guiyun_wood_loan"
			CuDB.dict_of(world, "equipmentLoans").guiyun_wood_loan = {"owner": "guiyun", "event": "hg_pack_review"}
		s.facts["hg.pre.loan_committed"] = true
		s.preHangao.weapon = world.weapon
	if s.facts.get("gy_pei_join"): recruit(world, s.facts.get("pei_party_preference") if s.facts.get("pei_party_preference") else "roster")
	s.preHangao.participants = (world.get("party", []) as Array).duplicate()
	var rh = s.facts.get("hg.pre.road_help")
	if rh:
		witness(world, "hg.pre.road_help", {"participants": s.preHangao.get("roadParticipants", []), "outcome": rh, "note": "绳子比我以为的要紧。" if rh == "bind" else "接书的人先站稳了脚。"})

## 原版 returnLoan(world)
static func returnLoan(world: Dictionary) -> bool:
	if not (world.get("equipmentLoans") is Dictionary) or not world.equipmentLoans.get("guiyun_wood_loan"): return false
	if world.get("bag") is Dictionary: world.bag.erase("guiyun_wood_loan")
	if world.get("weapon") == "guiyun_wood_loan": world.weapon = null
	world.equipmentLoans.erase("guiyun_wood_loan")
	return true

## 原版 reveal(target)：target.known 为 Dictionary（原版 Set）
static func reveal(target: Dictionary):
	for k in target.get("weak", []):
		if not target.known.has(k):
			target.known[k] = true
			return k
	return null

## 原版 cast(u,key,targets,bp,opts)
static func cast(u: Dictionary, key: String, targets: Array, bp := 0, opts := {}):
	var sk = skills.get(key)
	var b = max(0, min(3, bp))
	var turn: int = opts.get("turn", 0)
	if sk == null or not key in u.get("skills", []) or u.mp < sk.mp: return CuDB.fail("知古此时不能施放该技能。")
	var cd := CuDB.dict_of(u, "peiCooldown")
	if cd.get(key, 0) > turn: return CuDB.fail("校雠尚未恢复。")
	var forecasts := []
	if key == "pei_wen":
		var li = opts.get("lockIntent")
		for t in targets: forecasts.append(li.call(t) if li is Callable else null)
		for f in forecasts:
			if not f: return CuDB.fail("没有可预告的下一条意图。")
	u.mp -= sk.mp
	var result := []
	for i in targets.size():
		var t: Dictionary = targets[i]
		var until: int = t.get("peiActionSerial", 0) + 1
		var buffs := CuDB.dict_of(t, "buffs")
		match key:
			"pei_zhi":
				var weak = reveal(t)
				buffs.peiFlaw = {"mul": 1.1 + b * 0.05, "until": until, "boundary": "end"}
				result.append({"weak": weak})
			"pei_wen":
				buffs.peiForecast = forecasts[i]
				if t.get("key", t.get("name")) in u.get("seenEnemyTypes", []): buffs.peiWeaken = {"mul": 0.9 - b * 0.05, "until": until, "boundary": "end"}
				result.append({"intent": forecasts[i]})
			"pei_shen":
				buffs.peiCare = {"mul": 0.8 - b * 0.05, "displacement": true, "until": until, "boundary": "end"}
				result.append({"guard": true})
			"pei_jiao":
				var weak2 = reveal(t)
				if weak2 == null: buffs.peiFlaw = {"mul": 1.1 + b * 0.05, "until": until, "boundary": "end"}
				result.append({"weak": weak2})
	if key == "pei_jiao": cd[key] = turn + 3
	return result

## 原版 consumeIncoming(t,damage)
static func consumeIncoming(t: Dictionary, damage: float) -> int:
	var mul := 1.0
	for k in ["peiCover", "peiCare", "peiFlaw"]:
		var e = t.get("buffs", {}).get(k)
		if e:
			if e.until >= t.get("peiActionSerial", 0): mul *= e.mul
			t.buffs.erase(k)
	return max(1, roundi(damage * mul))

static func defend(u: Dictionary) -> void:
	CuDB.dict_of(u, "buffs").peiCover = {"mul": 0.75, "until": u.get("peiActionSerial", 0) + 1, "boundary": "start"}

static func expire(u: Dictionary, _unused = null, boundary := "end") -> void:
	var buffs = u.get("buffs", {})
	for k in buffs.keys():
		var e = buffs[k]
		if str(k).begins_with("pei") and e is Dictionary and e.get("boundary") == boundary and e.until <= u.get("peiActionSerial", 0): buffs.erase(k)

static func actionStart(u: Dictionary) -> void:
	u.peiActionSerial = u.get("peiActionSerial", 0) + 1
	expire(u, null, "start")
