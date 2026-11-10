extends GdUnitTestSuite
## 分支覆盖第 2 层：逐分支测试（docs/branch-coverage.md 第三节）。用例从 scripts.json 自动枚举，新剧情不用改测试。
## - 每个版本：枚举分支变量的每个取值，查到的版本必须是表里那一格，台词的 when 标注要和取值一致。
## - 每个选项：每段剧本的每个版本、每个选项，按玩家点法推进到结果，不能报错，要能收尾，once 标记要设上。

const Static := preload("res://test/branch_static_test.gd")

static func _exempt() -> Dictionary:
	return Data.json("res://data/cultivation/coverage_exempt.json")

func _scripts() -> Dictionary:
	return CuDB.fix(Data.json("res://data/cultivation/scripts.json"))

func _fail_if(problems: Array, what: String, cases: int) -> void:
	print("%s：%d 个用例，%d 处问题" % [what, cases, problems.size()])
	assert_array(problems).override_failure_message("%s（%d 个用例里 %d 处问题）：\n%s" % [what, cases, problems.size(), "\n".join(problems.slice(0, 40))]).is_empty()

## 按路径写进嵌套字典，如 preHangao.route
static func _put(c: Dictionary, path: String, val) -> void:
	var cur := c
	var ks := path.split(".")
	for i in ks.size() - 1:
		if not (cur.get(ks[i]) is Dictionary): cur[ks[i]] = {}
		cur = cur[ks[i]]
	cur[ks[ks.size() - 1]] = val

## 一个组合键对应的上下文和取值表
static func _ctx(e: Dictionary, key: String) -> Array:
	var c := {}
	var vals := {}
	var idx := key.split(",") if key != "" else PackedStringArray()
	for i in (e.vars as Array).size():
		var v: Dictionary = e.vars[i]
		var j := int(idx[i])
		var val
		if v.has("num"): val = v.num[j]
		else:
			val = v.values[j]
			if val is String and val == "__undef": val = null
		_put(c, v.path, val)
		vals[str(v.path)] = val
	return [c, vals]

## when 标注里的写法和变量取值对照（"missing" 就是没有；列表是“其中之一”）
static func _when_ok(want, got) -> bool:
	if want is Array:
		for w in want:
			if _when_ok(w, got): return true
		return false
	if want is String and want == "missing": return got == null or (got is bool and got == false)
	if want is bool: return CuDB.truthy(got) == want
	return str(want) == str(got)

func test_每个版本都选得对_标注一致() -> void:
	var bad := []
	var cases := 0
	var S := _scripts()
	for id in S:
		var e: Dictionary = S[id]
		if (e.get("vars", []) as Array).is_empty(): continue
		for key in Static.combos(e):
			cases += 1
			var cv := _ctx(e, key)
			var expect: Dictionary = e.scripts[int(e.table[key])]
			CuDB.clear()
			var got = CuVisitors.script(id, cv[0])
			if CuDB.error != "" or not (got is Dictionary):
				bad.append("%s 组合 %s：查版本报错 %s" % [id, key, CuDB.error]); continue
			if JSON.stringify(got) != JSON.stringify(expect):
				bad.append("%s 组合 %s：应播第 %s 版，实际播了别的版本" % [id, key, e.table[key]])
			var lines: Array = got.get("intro", []) + got.get("closing", [])
			for c in got.get("choices", []): lines += c.get("lines", [])
			for l in lines:
				var w = l.get("when")
				if not (w is Dictionary): continue
				for k in w:
					# 标注名对应的变量：路径最后一段同名，或路径里含这个名字（delivery 优先、退到 first_delivery.method）
					var cand := []
					for p in cv[1]:
						if str(p).get_slice(".", str(p).get_slice_count(".") - 1) == k or k in str(p): cand.append(p)
					if cand.is_empty(): continue
					var ok := false
					for p in cand:
						if _when_ok(w[k], cv[1][p]): ok = true
					if not ok: bad.append("%s 组合 %s：台词 %s 标注 %s=%s，但这一格的取值是 %s" % [id, key, l.get("id"), k, w[k], str(cand.map(func(p): return cv[1][p]))])
	_fail_if(bad, "版本选择", cases)

## 造一个“正在播这段剧情、播的是第 i 版”的状态
func _playing(id: String, version: Dictionary) -> Dictionary:
	var s := CuCore.initial()
	s.joined = true; s.facts.joined = true
	CuGrowth.ensure(s, CuCore.actions())
	s.pending = {"id": "test", "economyVersion": CuCore.D().economyVersion, "action": id, "period": CuCore.period(s), "cost": 0, "energyBefore": s.energy, "moodBefore": s.mood,
		"balanceVersion": CuBalance.version, "stage": "ready", "theme": null, "recipient": null, "gift": null, "inputs": {}, "result": null, "story": true, "storyStep": 0}
	s.pending.visitor = CuVisitors.init(s, id)
	s.pending.visitor.scriptSnapshot = CuDB.copy(version)
	return s

func test_每个选项都能播完() -> void:
	var bad := []
	var cases := 0
	var S := _scripts()
	for id in S:
		var a = CuDB.action(id)
		if a == null or not a.get("visitor"): continue
		var e: Dictionary = S[id]
		for vi in (e.scripts as Array).size():
			var version: Dictionary = e.scripts[vi]
			var n: int = maxi(1, (version.get("choices", []) as Array).size())
			for ci in n:
				cases += 1
				var s := _playing(id, version)
				CuDB.clear()
				var steps := 0
				var chose := false
				while s.get("pending") is Dictionary and s.pending.stage != "result" and steps < 300:
					steps += 1
					if s.pending.visitor.phase == "choice" and not chose:
						CuCore.visitorChoose(s, ci); chose = true
					else: CuCore.visitorNext(s)
					if CuDB.error != "": break
				var tag := "%s「%s」第 %d 版选项 %d" % [id, a.get("name", ""), vi, ci]
				if CuDB.error != "": bad.append(tag + "：报错 " + CuDB.error); continue
				if not (s.get("pending") is Dictionary) or s.pending.stage != "result": bad.append(tag + "：%d 步后还没播完" % steps); continue
				CuCore.closeResult(s)
				if CuDB.error != "": bad.append(tag + "：收尾报错 " + CuDB.error); continue
				var ck := "%s:%s" % [id, str((version.get("choices", []) as Array)[ci].get("key")) if ci < (version.get("choices", []) as Array).size() else ""]
				if a.get("once") and not s.facts.get(a.once) and not _exempt().get("repeatable", {}).has(ck): bad.append(tag + "：播完没设上 " + str(a.once) + "（会重复触发、后续前置接不上）")
	_fail_if(bad, "选项播放", cases)
