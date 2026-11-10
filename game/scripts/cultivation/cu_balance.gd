class_name CuBalance
extends RefCounted
## 原版 js/qh-mode-cultivation-balance.js（CultivationBalance，CH2-BALANCE-2）。
## 曲线、心情、规则、武学等级与学习效率。install() 的改写在导出时已应用到 globals.json，这里不再执行。

const version := 2

static func T(): return CuDB.t("CultivationBalance")
static func curves() -> Dictionary: return T().curves
static func moods() -> Array: return T().moods
static func rules() -> Dictionary: return T().rules
static func legacyScale() -> Dictionary: return T().legacyScale
static func arts() -> Array: return CuDB.t("CultivationLibrary").arts

const STAT_NAMES := {"str": "臂力", "con": "根骨", "agi": "身法", "wil": "定力", "wis": "悟性"}

## 原版 artById
static func artById(id):
	return CuDB.find_by(arts(), "id", id)

## 原版 artForAction(a)：a 可以是动作 id 或动作字典
static func artForAction(a):
	var id = a if a is String else (a.get("id") if a is Dictionary else null)
	return CuDB.find_by(arts(), "action", id)

## 原版 artForSkill
static func artForSkill(id):
	for a in arts():
		if a.type == "external":
			for m in a.moves:
				if m.id == id: return a
	return null

## 原版 mood(s)
static func mood(s: Dictionary) -> Dictionary:
	var v = s.get("mood", 60)
	if v == null: v = 60
	for m in moods():
		if v >= m.min: return m
	return moods()[-1]

## 原版 thresholds(a)
static func thresholds(a: Dictionary) -> Array:
	var c: Array = curves()[a.curve]
	return [c[0], c[2], c[4], c[6], c[9]] if a.type == "inner" else c

## 原版 cap(s,a)
static func cap(s: Dictionary, a: Dictionary) -> int:
	var inner: bool = a.type == "inner"
	if a.get("earlyCap") and s.month <= 5:
		return (2 if inner else 3) if a.get("grade") == "丁" else int(a.earlyCap)
	var lc = s.get("balanceLegacyCaps")
	if lc is Dictionary and lc.get(a.id):
		return max(int(lc[a.id]), (2 if inner else 3) if s.month <= 5 else (5 if inner else 10))
	if a.get("grade") == "丁" and s.month <= 5: return 2 if inner else 3
	return 5 if inner else 10

## 原版 level(s,a)
static func level(s: Dictionary, a: Dictionary) -> int:
	var mx = s.get("martialXp")
	var xp = mx.get(a.id, 0) if mx is Dictionary else 0
	var t := thresholds(a)
	var n := 0
	for i in range(1, t.size()):
		if xp >= t[i]: n += 1
	return min(cap(s, a), 1 + n)

## 原版 stats(s)
static func stats(s: Dictionary) -> Dictionary:
	var p: Dictionary = s.get("progress", {}) if s.get("progress") is Dictionary else {}
	var b = s.get("trainingBaseStats")
	if not (b is Dictionary): b = {"str": 3, "con": 3, "agi": 3, "wil": 3, "wis": 3}
	var v := {"str": min(9, floori(float(p.get("sword", 0) + p.get("fist", 0)) / 750.0)), "con": 0, "agi": 0, "wil": 0, "wis": 0}
	var R := rules()
	for k in R:
		for tg in R[k].targets:
			if tg[0] == "stats":
				v[tg[1]] += min(int(tg[3]), floori(float(p.get(k, 0)) / float(tg[2])))
	var out := {}
	var bl = s.get("balanceLegacy")
	var bls = bl.get("stats", {}) if bl is Dictionary else {}
	for k in v:
		var base = b.get(k, 3)
		if base == null: base = 3
		out[k] = base + max(v[k], bls.get(k, 0) if bls is Dictionary else 0)
	return out

## 原版 efficiency(s)
static func efficiency(s: Dictionary) -> int:
	var p = s.get("progress", {})
	var u = p.get("understanding", 0) if p is Dictionary else 0
	return min(10, int(stats(s).wis)) + min(10, floori(float(min(200, u)) / 20.0)) + int(mood(s).index)

## 原版 preview(s,a,first,fg)
static func preview(s: Dictionary, a: Dictionary, first := false, fg = null) -> Dictionary:
	var e := efficiency(s)
	var key = fg.gain if fg is Dictionary and fg.get("gain") else a.get("gain")
	var art = artForAction(a)
	var gain := 0
	var coefficient := 0.0
	var cat = a.get("category")
	if a.get("once") or a.get("visitor") or a.get("auto"):
		gain = roundi(fg.amount * legacyScale().get(key, 1)) if fg is Dictionary else int(a.get("amount", 0))
	elif a.id == "QH01":
		coefficient = 0.4; gain = roundi(e * 2)
	elif a.id == "W04":
		coefficient = 1.4; gain = roundi(e * 7)
	elif cat == "basic":
		coefficient = 1.6 if a.id in ["B03", "B04"] else (1.0 if (a.id == "B01" or (art != null and art.type == "inner")) else 2.0)
		gain = roundi(5 * e * coefficient)
	elif cat == "skill":
		coefficient = 1; gain = 5 * e
	elif cat == "arts":
		coefficient = 1; gain = e
	elif cat == "production":
		coefficient = 0.7; gain = roundi(e * 0.7)
	elif cat == "chores":
		coefficient = 0.2 if a.id == "D01" else 0.4; gain = roundi(e * coefficient)
	var xp = 0
	if art != null and not first: xp = gain if a.id == "QH01" else 5 * e
	return {"gain": gain, "key": key, "efficiency": e, "mood": mood(s), "coefficient": coefficient, "artId": art.id if art != null else null, "xp": xp}

## 原版 addXp(s,id,raw)
static func addXp(s: Dictionary, id, raw):
	var a = artById(id)
	if a == null or not s.get("learned", {}).get(a.key) or raw == null or raw < 0: return null
	if not (s.get("martialXp") is Dictionary): s.martialXp = {}
	var prior = s.martialXp.get(id, 0)
	var before := level(s, a)
	var maximum = thresholds(a)[cap(s, a) - 1]
	s.martialXp[id] = CuDB.fix(min(maximum, round((prior + raw) * 10.0) / 10.0))
	return {"id": id, "before": before, "after": level(s, a), "gain": s.martialXp[id] - prior}

## 原版 grantLevel(s,id)
static func grantLevel(s: Dictionary, id):
	var a = artById(id)
	if a == null: return null
	var n := level(s, a)
	if n >= cap(s, a): return null
	if not (s.get("martialXp") is Dictionary): s.martialXp = {}
	return addXp(s, id, thresholds(a)[n] - s.martialXp.get(id, 0))

## 原版 gate(s,a)
static func gate(s: Dictionary, a: Dictionary) -> String:
	var art = artForAction(a)
	if a.id == "QH01":
		var cur := (int(s.month) - 1) * 5 + int(s.phase)
		for h in s.history:
			if h.get("period") == cur and h.get("action") == "QH01": return "本期笔记已复盘，下期再来。"
	if art == null or s.learned.get(art.key): return ""
	# 2026-11-06 开始部分拿到的秘籍：在江湖菜单背包里参悟后才能独练
	if art.get("manual"): return "先在背包里参悟《%s》，才能照书独练。" % art.name
	if art.get("sceneTaught"): return "《%s》要%s亲自教，闲逛时去找%s。" % [art.name, art.get("teacherCall"), art.get("teacherCall")]
	if s.month < art.month: return "《%s》最早在第%d个月传授。" % [art.name, art.month]
	var major = s.facts.get("gy_martial_major")
	var mpath = major.get("path") if major is Dictionary else null
	if art.type == "external" and art.grade != "丁" and art.id != "qh_hulu_staff" and mpath != ("sword" if art.path == "剑" else "fist"):
		return "须先选定对应主修路线。"
	if art.get("prerequisite") is Dictionary:
		var pre = art.prerequisite
		var p = artById(pre.art_id)
		if p == null or not s.learned.get(p.key) or level(s, p) < pre.level:
			return "先把《%s》练到%d%s。" % [p.name if p else "undefined", pre.level, "层" if p and p.type == "inner" else "重"]
	if art.grade == "乙" and not s.facts.get("gy_year_exam_seen"): return "先完成第一年的师门考校。"
	var st := stats(s)
	var req = art.get("learn_req", {})
	if req is Dictionary:
		for k in req:
			if st.get(k, 0) < req[k]:
				return "根基不足：%s需%s，当前%s。" % [STAT_NAMES.get(k, k), str(req[k]), str(st.get(k, 0))]
	return ""

## 原版 courseHint(s,a)
static func courseHint(s: Dictionary, a: Dictionary) -> String:
	var r := preview(s, a, a.get("learn") != null and not s.learned.get(a.learn))
	var art = artForAction(a)
	var rn = rules().get(r.key, {}).get("name", "成果") if r.key != null else "成果"
	var text := "本次%s +%d（学习效率%d）" % [rn, r.gain, r.efficiency]
	if art != null:
		var unit := "层" if art.type == "inner" else "重"
		if not s.learned.get(art.key): return text + "；首次传授学会《%s》一%s" % [art.name, unit]
		var n := level(s, art)
		var t := thresholds(art)
		var xp = s.get("martialXp", {}).get(art.id, 0)
		var c := cap(s, art)
		text += "；《%s》%d%s，熟练%s/%s" % [art.name, n, unit, CuDB.num(xp), CuDB.num(t[c - 1])]
		if n < c:
			text += "；距下一%s%s经验，按当前效率约%d次" % [unit, CuDB.num(max(0, round((t[n] - xp) * 10.0) / 10.0)), ceili(float(t[n] - xp) / float(max(1, r.xp)))]
		else:
			text += "；当前授课已满，六月后继续" if c < t.size() else "；已练满，根基训练仍有效"
	return text

## 原版 mastery(k,n)
static func mastery(k, n) -> Dictionary:
	var a = artForSkill(k)
	if n >= 10 and a != null and a.get("mastery") is Dictionary and k in a.mastery.get("move_ids", []): return a.mastery.effect
	return {}

## 原版 upgradeReason(s,id)
static func upgradeReason(s: Dictionary, id) -> String:
	var a = artById(id)
	if a == null: a = artForSkill(id)
	if a == null or not s.get("learned", {}).get(a.key): return "尚未受教"
	var n := level(s, a)
	if n >= cap(s, a):
		return "已达当前授课上限，六月后继续修习" if cap(s, a) < thresholds(a).size() else "已练满"
	return ""
