class_name CuGrowth
extends RefCounted
## 原版 js/qh-mode-cultivation-growth.js（CultivationGrowth，CH2-GROWTH-1）：绝对进度账本，主角、菜单、战斗共用。

static func T(): return CuDB.t("CultivationGrowth")
static func labels() -> Dictionary: return T().labels
static func courses() -> Dictionary: return T().courses
static func rules() -> Dictionary: return CuBalance.rules()

## 原版 legacyRules（旧经济的换算，仅迁移旧档用）
const LEGACY_RULES := {
	"foundation": [["bonuses", "mhp", 4, 120], ["stats", "con", 40, 5]],
	"coordination": [["bonuses", "dodge", 16, 8]],
	"footwork": [["bonuses", "spd", 12, 12], ["stats", "agi", 48, 5]],
	"breathing": [["bonuses", "mmp", 4, 80], ["stats", "wil", 48, 5]],
	"observation": [["bonuses", "crit", 20, 10], ["bonuses", "dodge", 20, 10]],
	"sword": [["zy", "剑", 1, 200]], "fist": [["zy", "拳", 1, 200]],
	"understanding": [["ji", "shi", 1, 200], ["stats", "wis", 48, 5]],
	"medical_notes": [["medicine", "yi", 2, 100]], "herbs": [["medicine", "yi", 3, 100]],
	"cooking": [["craft", "food", 40, 2]], "sewing": [["craft", "pouch", 40, 2]],
	"travel": [["bonuses", "spd", 40, 3]], "correspondence": [], "qh_staff": [],
}

static func _num(v) -> float:
	if v is int or v is float: return float(v)
	if v is String and v.is_valid_float(): return v.to_float()
	return 0.0

## 原版 counters(s,actions)
static func counters(s: Dictionary, actions: Array = []) -> Dictionary:
	var values: Dictionary = (s.get("progress", {}) as Dictionary).duplicate() if s.get("progress") is Dictionary else {}
	var seen := {}
	var from_history := {}
	for h in s.get("history", []):
		if not h.get("id") or seen.has(h.id): continue
		seen[h.id] = true
		var key = h.get("gainKey")
		if not key:
			var a = CuDB.find_by(actions, "id", h.get("action"))
			key = a.get("gain") if a else null
		var g = h.get("gain")
		if not key or not (g is int or g is float) or g < 0: continue
		from_history[key] = from_history.get(key, 0) + g
	for k in from_history:
		if not values.has(k): values[k] = from_history[k]
	var out := {}
	for k in values: out[k] = CuDB.fix(max(0.0, _num(values[k])))
	return out

## 原版 progress(s,actions)
static func progress(s: Dictionary, actions: Array = []) -> Dictionary:
	var v := counters(s, actions)
	v["observation"] = v.get("observation", 0) + v.get("listening", 0)
	return v

static func _blank(ver: int) -> Dictionary:
	return {"version": ver, "counts": {}, "progress": {}, "stats": {"str": 0, "con": 0, "agi": 0, "wil": 0, "wis": 0}, "bonuses": {"mhp": 0, "mmp": 0, "atk": 0, "spd": 0, "crit": 0, "dodge": 0}, "ji": {"yi": 0, "shi": 0}, "zy": {"剑": 0, "拳": 0, "棍": 0, "暗器": 0} if ver == 2 else {"剑": 0, "拳": 0}, "craft": {"food": 0, "pouch": 0}, "medicine": {"yi": 0}, "martial": {}}

static func _count(s: Dictionary, g: Dictionary) -> void:
	var seen := {}
	for h in s.get("history", []):
		if not h.get("id") or seen.has(h.id) or h.get("period", 0) < 0: continue
		seen[h.id] = true
		var ak = str(h.get("action")) if h.get("action") != null else "undefined"
		g.counts[ak] = g.counts.get(ak, 0) + 1

## 原版 legacyGrowth
static func legacyGrowth(s: Dictionary, actions: Array = []) -> Dictionary:
	var p := progress(s, actions)
	var g := _blank(1)
	g.progress = p
	_count(s, g)
	for k in LEGACY_RULES:
		for tg in LEGACY_RULES[k]:
			g[tg[0]][tg[1]] = g[tg[0]].get(tg[1], 0) + min(tg[3], floori(float(p.get(k, 0)) / tg[2]))
	g.ji.yi = min(100, g.medicine.yi)
	g.stats.str = min(5, floori(float(p.get("sword", 0) + p.get("fist", 0)) / 48.0))
	var C := courses()
	for key in C:
		if not s.get("learned", {}).get(key): continue
		var c: Dictionary = C[key]
		var cp := 2 if key == "breathing" else 3
		var maximum := 75 if cp == 2 else 125
		var xp = min(maximum, max(0, roundi((p.get(key, 0) - 8) * 25.0 / 8.0)))
		var legacy_xp = min(maximum, max(0, g.counts.get(c.action, 0) - 1) * 25)
		var eff = max(xp, legacy_xp)
		var m := c.duplicate()
		m.xp = eff
		m.level = (2 if eff >= 75 else 1) if cp == 2 else (3 if eff >= 125 else (2 if eff >= 50 else 1))
		m.cap = cp
		g.martial[key] = m
	return g

## 原版 ensure(s,actions)：旧平衡版本的存档迁移到 CH2-BALANCE-2
static func ensure(s: Dictionary, actions: Array = []) -> Dictionary:
	if s.get("balanceVersion") == CuBalance.version: return s
	if s.get("pending") is Dictionary and not s.pending.get("balanceVersion"): s.pending.legacyBalance = true
	var old := legacyGrowth(s, actions)
	var has := (s.get("history", []) as Array).size() > 0
	if not has and s.get("progress") is Dictionary:
		for v in s.progress.values():
			if _num(v) > 0: has = true
	s.balanceLegacy = {"stats": old.stats, "bonuses": old.bonuses, "ji": old.ji, "zy": old.zy, "craft": old.craft} if has else null
	var c := counters(s, actions)
	var np := {}
	for k in c: np[k] = roundi(c[k] * CuBalance.legacyScale().get(k, 1))
	s.progress = np
	for k in rules():
		if not s.progress.has(k) or s.progress[k] == null: s.progress[k] = 0
	CuDB.dict_of(s, "martialXp")
	for key in old.martial:
		var a = CuDB.find_by(CuBalance.arts(), "key", key)
		s.martialXp[a.id] = max(s.martialXp.get(a.id, 0), CuBalance.thresholds(a)[old.martial[key].level - 1])
	s.balanceVersion = CuBalance.version
	return s

## 原版 growth(source,actions)
static func growth(source: Dictionary, actions: Array = []) -> Dictionary:
	var s := source if source.get("balanceVersion") == CuBalance.version else ensure(source.duplicate(true), actions)
	var p := progress(s, actions)
	var g := _blank(2)
	g.progress = p
	_count(s, g)
	var R := rules()
	for k in R:
		for tg in R[k].targets:
			g[tg[0]][tg[1]] = g[tg[0]].get(tg[1], 0) + min(tg[3], floori(float(p.get(k, 0)) / tg[2]))
	g.ji.yi = min(100, g.medicine.yi)
	g.stats.str = min(9, floori(float(p.get("sword", 0) + p.get("fist", 0)) / 750.0))
	var bl = s.get("balanceLegacy")
	if bl is Dictionary:
		for group in ["stats", "bonuses", "ji", "zy", "craft"]:
			var src = bl.get(group, {})
			if src is Dictionary:
				for k in src: g[group][k] = max(g[group].get(k, 0), src[k])
	for a in CuBalance.arts():
		if not s.get("learned", {}).get(a.key): continue
		var lv := CuBalance.level(s, a)
		var cp := CuBalance.cap(s, a)
		var xp = s.get("martialXp", {}).get(a.id, 0)
		var t := CuBalance.thresholds(a)
		var m: Dictionary = a.duplicate(true)
		m.skillId = a.moves[0].id if a.moves.size() > 0 else a.id
		m.systemId = a.id
		m.xp = xp
		m.level = lv
		m.cap = cp
		m.prof = max(0, xp - t[lv - 1])
		m.maximum = t[cp - 1]
		g.martial[a.key] = m
	return g

## 原版 reconcile(world,actions)：把养成结果同步到大地图存档 S（st/ji/zy/skills/prof/xinfa）
static func reconcile(world: Dictionary, actions: Array = []):
	var s = world.get("cultivation")
	if not (s is Dictionary): return null
	ensure(s, actions)
	var applied = world.get("cultivationGrowthApplied")
	if not (applied is Dictionary): applied = {"stats": {}, "ji": {}, "zy": {}}
	var st = world.get("st", {})
	var ap_st = applied.get("stats", {})
	var tb := {}
	for k in ["str", "con", "agi", "wil", "wis"]:
		var v = st.get(k) if st is Dictionary else null
		tb[k] = (3 if v == null else v) - ap_st.get(k, 0)
	s.trainingBaseStats = tb
	var skills := CuDB.dict_of(world, "skills")
	if skills.has("guiyun_sword"):
		var old = skills.guiyun_sword
		skills.gy_s1 = max(skills.get("gy_s1", 0), old)
		for field in ["prof", "profNote"]:
			if world.get(field) is Dictionary and world[field].has("guiyun_sword"):
				world[field].gy_s1 = max(world[field].get("gy_s1", 0), world[field].guiyun_sword)
				world[field].erase("guiyun_sword")
		for field in ["load", "skSeen"]:
			if world.get(field) is Array:
				var seen := []
				for k in world[field]:
					var nk = "gy_s1" if k == "guiyun_sword" else k
					if not nk in seen: seen.append(nk)
				world[field] = seen
		skills.erase("guiyun_sword")
	if not s.get("balanceWorldImported"):
		CuDB.dict_of(s, "martialXp")
		for a in CuBalance.arts():
			if not s.learned.get(a.key): continue
			var n := 1
			if a.type == "inner":
				var xf = world.get("xinfa", {})
				n = xf.get("lv", {}).get(a.id, 1) if xf is Dictionary and xf.get("lv") is Dictionary else 1
				if not n: n = 1
			else:
				for m in a.moves: n = max(n, skills.get(m.id, 1) if skills.get(m.id) else 1)
			if a.key == "fist" and growth(s, actions).counts.get("K02"): n = max(n, min(3, skills.get("fist", 1) if skills.get("fist") else 1))
			if n > CuBalance.cap(s, a):
				CuDB.dict_of(s, "balanceLegacyCaps")[a.id] = min(CuBalance.thresholds(a).size(), n)
			n = min(CuBalance.cap(s, a), n)
			var t := CuBalance.thresholds(a)
			var old_prof := 0
			if a.type != "inner":
				for m in a.moves: old_prof = max(old_prof, world.get("prof", {}).get(m.id, 0) if world.get("prof") is Dictionary else 0)
			s.martialXp[a.id] = min(t[CuBalance.cap(s, a) - 1], max(s.martialXp.get(a.id, 0), t[n - 1] + old_prof))
		s.balanceWorldImported = true
	var g := growth(s, actions)
	for pair in [["stats", "st"], ["ji", "ji"], ["zy", "zy"]]:
		var group: String = pair[0]
		var dst := CuDB.dict_of(world, pair[1])
		var ap = applied.get(group, {})
		for k in g[group]:
			var cur = dst.get(k)
			if cur == null: cur = 3 if group == "stats" else 0
			dst[k] = cur + g[group][k] - (ap.get(k, 0) if ap is Dictionary else 0)
	world.cultivationGrowthApplied = {"version": 2, "stats": g.stats.duplicate(), "ji": g.ji.duplicate(), "zy": g.zy.duplicate()}
	var prof := CuDB.dict_of(world, "prof")
	for key in g.martial:
		var m: Dictionary = g.martial[key]
		if not (s.learned.get(key) is Dictionary): s.learned[key] = {"source": "旧存档教学记录"}
		s.learned[key].skillId = m.skillId
		s.learned[key].systemId = m.systemId
		if m.type == "inner":
			var x := CuDB.dict_of(world, "xinfa")
			if x.is_empty(): x.merge({"known": [], "lv": {}, "prog": {}, "main": null, "subs": []})
			var known := CuDB.arr_of(x, "known")
			if not m.id in known: known.append(m.id)
			CuDB.dict_of(x, "lv")[m.id] = m.level
			CuDB.dict_of(x, "prog")[m.id] = m.prof
			if not x.get("main") and m.id == "tuna": x.main = "tuna"
			continue
		for mv in m.moves:
			if m.level >= mv.unlock_level:
				skills[mv.id] = m.level
				prof[mv.id] = m.prof
	return g

## 原版 hints(s,key,actions)
static func hints(s: Dictionary, key, actions: Array = []) -> String:
	var g := growth(s, actions)
	var r = rules().get(key) if key != null else null
	if r == null: return ""
	var value = g.progress.get(key, 0)
	var L := labels()
	var segs := []
	var exp_keys := ["foundation", "coordination", "footwork", "breathing", "observation", "sword", "fist"]
	for tg in r.targets:
		var own = min(tg[3], floori(float(value) / tg[2]))
		if own >= tg[3]: segs.append(str(L.get(tg[1], tg[1])) + "培养已满")
		else: segs.append("再积累%s%s，%s+1%s" % [CuDB.num(tg[2] - fmod(value, tg[2])), "经验" if key in exp_keys else "点", L.get(tg[1], tg[1]), "%" if tg[1] in ["crit", "dodge"] else ""])
	if key in ["sword", "fist"]:
		var total = g.progress.get("sword", 0) + g.progress.get("fist", 0)
		segs.append("臂力培养已满" if total >= 6750 else "剑拳合计再积累%s经验，臂力+1（攻击+3）" % CuDB.num(750 - fmod(total, 750)))
	return "；".join(segs) if segs.size() > 0 else r.use

## 原版 outcome(before,after)
static func outcome(before: Dictionary, after: Dictionary) -> Array:
	var out := []
	for group in ["stats", "bonuses", "ji", "zy", "craft"]:
		var ag = after.get(group, {})
		for k in ag:
			var old = before.get(group, {}).get(k, 0)
			if ag[k] != old:
				out.append({"group": group, "key": k, "name": labels().get(k, k), "before": old, "after": ag[k], "delta": ag[k] - old, "unit": "%" if k in ["crit", "dodge"] else ""})
	return out
