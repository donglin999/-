extends GdUnitTestSuite
## 分支覆盖第 1 层：结构检查（docs/branch-coverage.md 第二节）。只看数据，不跑游戏。
## 每条检查把所有问题收齐再一起报，方便一次改完。

const SPECIAL_REQUIRES := ["joined", "ye", "lu", "village_visit"]

func _scripts() -> Dictionary:
	return CuDB.fix(Data.json("res://data/cultivation/scripts.json"))

func _actions() -> Array:
	return CuDB.t("CultivationData").actions

func _fail_if(problems: Array, what: String) -> void:
	assert_array(problems).override_failure_message("%s（%d 处）：\n%s" % [what, problems.size(), "\n".join(problems.slice(0, 40))]).is_empty()

## 一个变量有几种取值（数值阈值按档数）
static func _n_values(v: Dictionary) -> int:
	return (v.num as Array).size() if v.has("num") else (v.values as Array).size()

## 所有取值组合的表格键，如 "0,1,2"
static func combos(e: Dictionary) -> Array:
	var out := [""]
	for v in e.vars:
		var nxt := []
		for prefix in out:
			for i in _n_values(v): nxt.append(str(i) if prefix == "" else prefix + "," + str(i))
		out = nxt
	return out

func test_1_组合表无漏格() -> void:
	var bad := []
	for id in _scripts():
		var e: Dictionary = _scripts()[id]
		if (e.get("vars", []) as Array).is_empty(): continue
		for key in combos(e):
			if not e.table.has(key): bad.append("%s：组合 %s 没有对应版本" % [id, key])
			elif int(e.table[key]) < 0 or int(e.table[key]) >= (e.scripts as Array).size(): bad.append("%s：组合 %s 指向不存在的版本 %s" % [id, key, e.table[key]])
	_fail_if(bad, "剧本分支表有漏格")

func test_2_每个版本都有人用() -> void:
	var bad := []
	for id in _scripts():
		var e: Dictionary = _scripts()[id]
		var used := {}
		if (e.get("vars", []) as Array).is_empty(): used[0] = true
		for key in e.get("table", {}): used[int(e.table[key])] = true
		for i in (e.scripts as Array).size():
			if not used.has(i): bad.append("%s：第 %d 版没有任何组合指到（写了看不到）" % [id, i])
	_fail_if(bad, "剧本有死版本")

func test_3_版本不空_选项有字_台词编号不重复() -> void:
	var bad := []
	for id in _scripts():
		var e: Dictionary = _scripts()[id]
		for i in (e.scripts as Array).size():
			var sc: Dictionary = e.scripts[i]
			var lines: Array = sc.get("intro", []) + sc.get("closing", [])
			for c in sc.get("choices", []): lines += c.get("lines", [])
			if lines.is_empty(): bad.append("%s 第 %d 版：一句台词都没有" % [id, i])
			if (sc.get("choices", []) as Array).is_empty(): bad.append("%s 第 %d 版：没有选项（至少要一个自动选项）" % [id, i])
			for c in sc.get("choices", []):
				# 战斗事件的 win／lose 由战斗结果决定，不显示文字
				if str(c.get("text", "")) == "" and not c.get("auto") and not str(c.get("key")) in ["win", "lose"] and (sc.choices as Array).size() > 1: bad.append("%s 第 %d 版：选项 %s 没有文字" % [id, i, c.get("key")])
			var seen := {}
			for l in sc.get("intro", []) + sc.get("closing", []):
				var lid := str(l.get("id", ""))
				if lid != "" and seen.has(lid): bad.append("%s 第 %d 版：台词编号 %s 重复" % [id, i, lid])
				seen[lid] = true
				if str(l.get("text", "")).strip_edges() == "": bad.append("%s 第 %d 版：%s 是空台词" % [id, i, lid])
	_fail_if(bad, "剧本内容有缺")

func test_4_剧本和事件对得上() -> void:
	var bad := []
	var ids := {}
	for a in _actions(): ids[a.id] = a
	for a in _actions():
		if a.get("visitor") and not _scripts().has(a.id): bad.append("事件 %s「%s」是来访剧情，但没有剧本" % [a.id, a.get("name", "")])
	for id in _scripts():
		if not ids.has(id) and CuVisitors.find(id) == null: bad.append("剧本 %s 没有对应事件（已下架的应移到 _attic/）" % id)
	_fail_if(bad, "剧本和事件对不上")

func test_5_窗口合理() -> void:
	var bad := []
	for a in _actions():
		var w = a.get("window")
		if w == null: continue
		if not (w is Array) or w.size() != 2 or int(w[0]) > int(w[1]) or int(w[0]) < 0 or int(w[1]) > 179:
			bad.append("%s「%s」窗口 %s 不合理" % [a.id, a.get("name", ""), str(w)])
	_fail_if(bad, "事件窗口有误")

## 所有能设上事实的地方：事件 once 标记、剧本选项效果、培养代码里出现的字符串
func _fact_sources() -> Dictionary:
	var src := {}
	for a in _actions():
		if a.get("once"): src[str(a.once)] = true
	for id in _scripts():
		for sc in _scripts()[id].scripts:
			for c in sc.get("choices", []):
				for ef in c.get("effects", []):
					src[str(ef).get_slice("=", 0).get_slice(".", 0)] = true
	return src

func _code() -> String:
	var t := ""
	for d in ["res://scripts/cultivation/", "res://scripts/flow/"]:
		for f in DirAccess.get_files_at(d):
			if f.ends_with(".gd"): t += FileAccess.get_file_as_string(d + f)
	return t

func test_6_前置事实有来源() -> void:
	var src := _fact_sources()
	var code := _code()
	var bad := []
	for a in _actions():
		for k in a.get("factRequires", []) if a.get("factRequires") is Array else []:
			var key := str(k)
			if src.has(key) or ('"%s"' % key) in code or ("'%s'" % key) in code or (".%s =" % key) in code: continue
			# 动态拼出来的事实（如 journey_ + 月份）：代码里有前缀拼接就算
			var prefix := key.rstrip("0123456789")
			if prefix != key and ('"%s" +' % prefix) in code: continue
			bad.append("%s「%s」要求事实 %s，但找不到哪里会设上它（这个事件永远打不开）" % [a.id, a.get("name", ""), key])
	_fail_if(bad, "前置事实没有来源")

func test_7_前置学艺有来源() -> void:
	var learns := {}
	for a in _actions():
		if a.get("learn"): learns[str(a.learn)] = true
	var bad := []
	for a in _actions():
		for k in a.get("requires", []) if a.get("requires") is Array else []:
			if not k in SPECIAL_REQUIRES and not learns.has(str(k)): bad.append("%s「%s」要求先学 %s，但没有哪个学艺事件教它" % [a.id, a.get("name", ""), k])
	_fail_if(bad, "前置学艺没有来源")

func test_8_内功特殊效果都接了() -> void:
	var bad := []
	var lib = DB.g("CultivationLibrary")
	for k in lib.hearts:
		var h: Dictionary = lib.hearts[k]
		var names := []
		var n: Dictionary = h.get("v3n", {})
		for key in n:
			if key in ["per", "t3", "t5"]:
				for x in n[key]: names.append("%s.%s" % [key, x])
			else: names.append(key)
		for t in ["t3", "t5"]:
			for x in h.get(t, {}): names.append("top.%s.%s" % [t, x])
		for nm in names:
			if not nm in Stats.HEART_KEYS and not Stats.HEART_KEYS_TODO.has(nm): bad.append("内功 %s「%s」的效果 %s 战斗里没接" % [k, h.get("name", ""), nm])
		var act = h.get("active")
		if act is Dictionary and not Stats.has_skill(act.get("skill")): bad.append("内功 %s 的主动招「%s」没有登记成战斗招式" % [k, act.get("name", "")])
	_fail_if(bad, "内功效果没接")

func test_9_招式效果表都接了() -> void:
	var bad := []
	var lib = DB.g("CultivationLibrary")
	for k in lib.moves:
		for tier in lib.moves[k].get("b", {}).get("ef", []):
			for e in tier:
				var nm := "%s:%s" % [e[0], e[2]]
				if not nm in Stats.MOVE_EF: bad.append("招式 %s 的效果 %s 战斗里没接" % [k, nm])
	_fail_if(bad, "招式效果没接")
