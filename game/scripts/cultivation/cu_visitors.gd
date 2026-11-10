class_name CuVisitors
extends RefCounted
## 原版 js/qh-mode-cultivation-visitors.js（CultivationVisitors）：来客与师门剧情共用的对白引擎。
## script(id,c) 原版是 JS 函数；这里查 data/cultivation/scripts.json（_gen/gen_scripts.cjs 由原版函数生成的决策表）。

static var _scripts := {}

static func T(): return CuDB.t("CultivationVisitors")
static func definitions() -> Array: return T().definitions

## 原版 all()：来客定义＋师门定义
static func all() -> Array:
	return definitions() + CuHousehold.definitions()

static func find(id):
	return CuDB.find_by(all(), "id", id)

## 原版 snapshot(s)
static func snapshot(s: Dictionary) -> Dictionary:
	var fd = s.facts.get("first_delivery")
	var m = fd.get("method") if fd is Dictionary else null
	return {"footwork": CuDB.truthy(s.learned.get("footwork")), "fist": CuDB.truthy(s.learned.get("fist")), "sword": CuDB.truthy(s.learned.get("sword")), "delivery": m if m in ["guided_footwork", "assisted_carry", "asked_for_guidance"] else null}

static func _table() -> Dictionary:
	if _scripts.is_empty():
		_scripts = CuDB.fix(Data.json("res://data/cultivation/scripts.json"))
	return _scripts

static func _get_path(c: Dictionary, path: String):
	var cur = c
	for k in path.split("."):
		if not (cur is Dictionary): return null
		cur = cur.get(k)
	return cur

## 原版 script(id,c)：按 context 查决策表
static func script(id: String, c: Dictionary):
	var e = _table().get(id)
	if e == null: return CuDB.fail("没有这段来访剧情。")
	var idx := []
	for v in e.vars:
		var val = _get_path(c, v.path)
		if v.has("num"):
			var n: float = float(val) if (val is int or val is float) else 0.0
			var best := 0
			for i in v.num.size():
				if v.num[i] <= n: best = i
			idx.append(str(best))
		else:
			var vals: Array = v.values
			var hit := -1
			for i in vals.size():
				var w = vals[i]
				if w is String and w == "__undef":
					continue
				if w is bool:
					if CuDB.truthy(val) == w: hit = i; break
				elif w == null:
					if val == null: hit = i; break
				elif val is String and val == w:
					hit = i; break
			if hit < 0:
				var ui := vals.find("__undef")
				if CuDB.truthy(val) and vals.has(true): hit = vals.find(true)
				elif ui >= 0 and not CuDB.truthy(val): hit = ui
				elif ui >= 0: hit = ui
				else: hit = 0
			idx.append(str(hit))
	var key := ",".join(idx)
	var n = e.table.get(key, 0)
	return CuDB.copy(e.scripts[int(n)])

## 原版 init(s,id)
static func init(s: Dictionary, id: String) -> Dictionary:
	var context := snapshot(s)
	if CuHousehold.has(id): context.merge(CuHousehold.extra(s), true)
	return {"version": 2, "phase": "intro", "cursor": 0, "selected": null, "context": context, "scriptSnapshot": script(id, context)}

## 原版 eventScript(p)
static func eventScript(p: Dictionary):
	var v: Dictionary = p.visitor
	if v.get("scriptSnapshot") is Dictionary: return v.scriptSnapshot
	return script(p.action, v.context)

static func _scene_of(l) -> Dictionary:
	if l is Dictionary and l.has("place"): return {"place": l.place, "time": l.get("time")}
	return {}

## 原版 current(p)：当前一句（或选择）
static func current(p: Dictionary) -> Dictionary:
	var v: Dictionary = p.visitor
	var x = eventScript(p)
	if v.phase == "choice":
		var last = x.intro[-1] if x.intro.size() > 0 else null
		var cast = last.get("cast") if last is Dictionary and last.get("cast") else find(p.action).cast
		var sp = "hero"
		for a in cast:
			if str(a).begins_with("hero"): sp = a; break
		var r := {"speaker": sp, "text": "这次我想……", "choices": x.choices, "cast": cast}
		r.merge(_scene_of(last), true)
		return r
	var lines: Array
	if v.phase == "branch": lines = x.choices[v.selected].lines
	elif v.phase in ["closing", "commit"]: lines = x.closing
	else: lines = x.intro
	var value = (lines[min(v.cursor, lines.size() - 1)] as Dictionary).duplicate() if lines.size() > 0 else {}
	if lines.size() > 0 and v.phase in ["closing", "commit"]:
		var sel = v.get("selected")
		var br: Array = x.choices[sel].lines if sel != null and sel < x.choices.size() else []
		var c := _scene_of(br[-1] if br.size() > 0 else (x.intro[-1] if x.intro.size() > 0 else null))
		for i in range(0, min(v.cursor, lines.size() - 1) + 1):
			var l: Dictionary = x.closing[i]
			c = {"place": l.place if l.has("place") else c.get("place"), "time": l.time if l.has("time") else c.get("time")}
		value.merge(c, true)
	value["choices"] = null
	if not value.get("cast"): value["cast"] = find(p.action).cast
	return value

## 原版 validate(p)
static func validate(p: Dictionary):
	var v = p.get("visitor")
	var ok: bool = v is Dictionary and v.get("version") in [1, 2] and v.get("phase") in ["intro", "choice", "branch", "closing", "commit"] and CuDB.is_int(v.get("cursor")) and v.cursor >= 0 and v.get("context") is Dictionary
	if ok:
		for k in ["footwork", "fist", "sword"]:
			if not (v.context.get(k) is bool): ok = false
		if not v.context.get("delivery") in [null, "guided_footwork", "assisted_carry", "asked_for_guidance"]: ok = false
	if not ok: return CuDB.fail("来访剧情存档格式不正确。")
	var x = eventScript(p)
	if x == null: return null
	if v.selected != null and (not CuDB.is_int(v.selected) or v.selected < 0 or v.selected >= x.choices.size()): return CuDB.fail("来访选择不正确。")
	if v.phase in ["branch", "closing", "commit"] and v.selected == null: return CuDB.fail("缺少来访选择。")
	var n := 1
	if v.phase == "branch": n = x.choices[v.selected].lines.size()
	elif v.phase in ["closing", "commit"]: n = x.closing.size()
	elif v.phase == "intro": n = x.intro.size()
	if v.cursor >= n: return CuDB.fail("来访对白位置不正确。")
	return v

## 原版 next(p)：返回 true 表示对白走完（进入 commit）
static func next(p: Dictionary) -> bool:
	if validate(p) == null: return false
	var v: Dictionary = p.visitor
	var x = eventScript(p)
	if v.phase in ["choice", "commit"]:
		CuDB.fail("请先选择或结束当前剧情。"); return false
	var lines: Array = x.intro if v.phase == "intro" else (x.choices[v.selected].lines if v.phase == "branch" else x.closing)
	if v.cursor + 1 < lines.size(): v.cursor += 1
	elif v.phase == "intro":
		if x.choices.size() == 1 and x.choices[0].get("auto"):
			v.selected = 0; v.phase = "branch"
		else: v.phase = "choice"
		v.cursor = 0
	elif v.phase == "branch":
		v.phase = "closing"; v.cursor = 0
	else:
		v.phase = "commit"; return true
	return false

## 原版 choose(p,index)
static func choose(p: Dictionary, index) -> void:
	if validate(p) == null: return
	var v: Dictionary = p.visitor
	if v.phase != "choice" or not CuDB.is_int(index) or index < 0 or index >= eventScript(p).choices.size():
		CuDB.fail("请选择当前可用的回答。"); return
	v.selected = int(index); v.phase = "branch"; v.cursor = 0

## 原版 effects(s,p)
static func effects(s: Dictionary, p: Dictionary) -> void:
	var v: Dictionary = p.visitor
	var x = eventScript(p)
	var key = x.choices[v.selected].key
	s.facts[p.action + "_choice"] = key
	var speakers := {}
	for l in x.intro + x.choices[v.selected].lines + x.closing: speakers[l.speaker] = true
	for actor in speakers:
		if not str(actor).begins_with("hero") and not actor in ["title", "narrator"]:
			if not s.facts.get("met_" + actor): s.facts["met_" + actor] = {"source": p.action, "period": p.period}
	if CuHousehold.has(p.action): CuHousehold.effects(s, p, key)

## 原版 status(s,d)
static func status(s: Dictionary, d: Dictionary) -> String:
	var now := CuDB.period(s)
	if s.facts.get(d.id + "_seen"): return "已相识"
	if now < d.window[0]: return "即将来访"
	if now > d.window[1]: return "已离谷"
	return "正在来访"

## 原版 selectedKey(s,p)
static func selectedKey(_s: Dictionary, p: Dictionary):
	var sel = p.visitor.get("selected")
	var x = eventScript(p)
	if sel == null or sel >= x.choices.size(): return null
	return x.choices[sel].key
