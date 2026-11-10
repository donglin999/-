class_name CuCoverage
extends RefCounted
## 分支覆盖第 3、4 层：可达性与组合（docs/branch-coverage.md 第四节）。只跑逻辑，不画界面、不打战斗（战斗选项按选法选赢或输）。
## 用法：godot --headless --path game -- --cultivation=coverage [--out=目录]
## 每一局按“学艺路线 × 闲逛偏好 × 剧情选法 × 开始部分带来的东西”跑到汉皋城门（第 20 期），记下播过的事件和选过的选项，
## 最后检查汉皋前的每个事件至少有一局走得到；报告写到 <out>/report.json、report.md。

const GATE := 20
const BASE := ["B03", "B02", "B01", "B04", "B05", "B06", "P01", "P02", "A01", "A02", "D01", "D02"]
const ROUTES := {
	"剑": ["K01", "TR_art_gy_s2", "TR_art_gy_s3", "TR_system_gy_s", "TR_art_yh_s1", "TR_art_yh_s2", "TR_xf_guiyun", "TR_xf_guanlan"],
	"拳": ["K02", "TR_art_gy_p2", "TR_art_gy_p3", "TR_system_gy_p", "TR_art_zz_p1", "TR_art_zz_p2", "TR_xf_guiyun", "TR_xf_danxue"],
	# 专练前辈功法：后教的排前面，教了下一门就先练下一门
	"针（师母）": ["TR_art_jc_n3", "TR_art_jc_n2", "TR_art_jc_n1", "TR_xf_danxue"],
	"拳（二师叔）": ["TR_art_zz_p2", "TR_art_zz_p1", "K02", "TR_xf_danxue"],
	"剑（小师叔）": ["TR_art_yh_s2", "TR_art_yh_s1", "TR_art_yh_b1", "K01"],
	"基本功": [],
}
const STROLLS := ["多逛", "少逛"]
const CHOICES := ["选第一个", "选最后一个", "随机1", "随机2"]
const CARRY := ["空手", "带秘籍"]
const MANUALS := ["mj_art_gj_h1", "mj_art_jh_jh", "qh_nanchuang_xf", "qh_xinhuo_gong", "qh_shouzhu_jing"]

static var _rng := RandomNumberGenerator.new()

static func run(tree: SceneTree) -> void:
	var out := "res://../build/coverage"
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(out) if out.begins_with("res://") else out)
	var t0 := Time.get_ticks_msec()
	var runs := []
	var played := {}    # 事件 id → 局数
	var picked := {}    # "事件:选项" → 局数
	for route in ROUTES:
		for st in STROLLS:
			for ch in CHOICES:
				for carry in CARRY:
					var r := play(route, st, ch, carry)
					runs.append(r)
					for id in r.played: played[id] = played.get(id, 0) + 1
					for k in r.picked: picked[k] = picked.get(k, 0) + 1
	var rep := report(runs, played, picked)
	rep.seconds = (Time.get_ticks_msec() - t0) / 1000.0
	var dir := ProjectSettings.globalize_path(out) if out.begins_with("res://") else out
	var f := FileAccess.open(dir.path_join("report.json"), FileAccess.WRITE)
	f.store_string(JSON.stringify(rep, " ")); f.close()
	var m := FileAccess.open(dir.path_join("report.md"), FileAccess.WRITE)
	m.store_string(markdown(rep)); m.close()
	print("分支覆盖：%d 局，汉皋前事件 %d 个，走到 %d 个，走不到 %d 个（豁免 %d）；选项 %d／%d；出错或卡住的局 %d；%.1f 秒 → %s" % [runs.size(), rep.events_total, rep.events_reached, rep.unreachable.size(), rep.exempted.size(), rep.choices_reached, rep.choices_total, rep.bad_runs.size(), rep.seconds, dir])
	tree.quit(0 if rep.ok else 1)

## 一局
static func play(route: String, stroll: String, choice: String, carry: String) -> Dictionary:
	var tag := "%s·%s·%s·%s" % [route, stroll, choice, carry]
	_rng.seed = hash(tag)
	var s := CuCore.initial()
	var bag := {}
	if carry == "带秘籍":
		for k in MANUALS: bag[k] = 1
	G.S = QJModel.normalize({"chapter": 2, "sect": "guiyun", "bag": bag, "cultivation": s, "skills": {"fist": 1, "qh_hulu_staff": 1} if carry == "带秘籍" else {"fist": 1}, "party": [], "st": {}, "flags": {}})
	s = G.S.cultivation
	CuCore.syncMode(s)
	CuCore.join(s)
	var plan: Array = ROUTES[route] + BASE
	var res := {"tag": tag, "played": {}, "picked": {}, "error": "", "stuck": "", "end": "", "n_practice": 0, "n_stroll": 0, "n_advance": 0, "why": {}}
	var strolled := -1
	var steps := 0
	var last := ""
	var same := 0
	while steps < 4000:
		steps += 1
		CuDB.clear()
		var per := CuCore.period(s)
		if res.played.has("hg_gate") and not s.get("pending"): break
		if per > GATE or s.mode == "complete": break
		var sig := "%d|%s|%s|%s" % [per, s.mode, str(s.get("pending", {}).get("action")) if s.get("pending") is Dictionary else "", str(s.get("pending", {}).get("stage")) if s.get("pending") is Dictionary else ""]
		if s.get("pending") is Dictionary and s.pending.get("visitor"): sig += "|%s|%s" % [s.pending.visitor.get("phase"), s.pending.visitor.get("cursor")]
		if sig == last:
			same += 1
			if same > 200: res.stuck = sig; break
		else: same = 0; last = sig
		if s.get("pending") is Dictionary:
			var p: Dictionary = s.pending
			res.played[p.action] = true
			if p.stage == "result": CuCore.closeResult(s)
			elif p.get("visitor"):
				if p.visitor.phase == "choice":
					var cs: Array = p.visitor.scriptSnapshot.get("choices", [])
					var i := _pick(choice, cs.size())
					if i < cs.size(): res.picked["%s:%s" % [p.action, cs[i].get("key")]] = true
					CuCore.visitorChoose(s, i)
				else: CuCore.visitorNext(s)
			else:
				CuCore.resolve(s, 0 if p.stage == "choice" else null)
		elif s.get("summary"):
			s.summary = null   # 月末总结：界面上玩家先点关闭
		elif s.mode == "journey_ready":
			if not res.has("gate_why"): res.gate_why = "期 %d：hg_road %s；facts farewell=%s road_help=%s" % [per, CuCore.availability(s, CuDB.action("hg_road")), s.facts.get("hg.pre.farewell_seen"), s.facts.get("hg.pre.road_help")]
			var d = CuCore.dueStory(s)
			if d != null: CuCore.start(s, d.id, {"story": true})
			else: CuCore.depart(s)
		elif s.mode == "journey":
			CuCore.returnJourney(s)
		elif s.mode == "story":
			var d2 = CuCore.dueStory(s)
			if d2 != null: CuCore.start(s, d2.id, {"story": true})
			else: CuCore.completeStory(s, "协同行路")
		else:
			s.summary = null
			var d3 = CuCore.dueStory(s)
			if d3 != null:
				CuCore.start(s, d3.id, {"story": true})
			else:
				if carry == "带秘籍":
					for k in MANUALS:
						if QJModel.manual_why(G.S, "hero", k) == "": QJModel.learn_manual(G.S, k)
				var done := _open_event(s)   # 列表里看得见的单独事件（来客、串门、师门小事）：玩家看见就会点
				# 闲逛：多逛每期先逛一处；少逛只在没东西可练时逛
				if not done and stroll == "多逛" and strolled != per:
					strolled = per
					done = _stroll(s)
					if done: res.n_stroll += 1
				if not done:
					for id in plan:
						var a = CuDB.action(id)
						var why := CuCore.availability(s, a) if a != null else "没有"
						if why == "":
							CuCore.start(s, id, {}); done = true; res.n_practice += 1; break
						res.why[id] = why
				if not done and stroll == "少逛" and strolled != per:
					strolled = per
					done = _stroll(s)
				if not done: CuCore.advance(s); res.n_advance += 1
		if CuDB.error != "":
			res.error = "%d 月 %d 期：%s" % [s.month, s.phase, CuDB.error]; break
		CuCore.reconcileWorld(G.S)
	res.end = "%d 月 %d 期 %s" % [s.month, s.phase, s.mode]
	var lv := {}
	for art in ["art_jc_n1", "art_jc_n2", "art_zz_p1", "art_zz_p2", "art_yh_s1", "art_yh_s2"]:
		var ad = CuBalance.artById(art)
		if ad != null and s.learned.get(ad.key): lv[art] = CuBalance.level(s, ad)
	var rel := {}
	for k in s.get("relations", {}): rel[k] = s.relations[k].get("score", 0) if s.relations[k] is Dictionary else s.relations[k]
	res.state = {"levels": lv, "rel": rel, "invite": s.facts.get("xiangyang_invitation", false)}
	if res.error == "" and res.stuck == "" and not res.played.has("hg_gate"): res.stuck = "没走到《城门在眼前》，停在 " + res.end
	return res

## 闲逛：每期换一个起点轮着逛，碰到事就停（玩家不会每期都只去院子）
static func _stroll(s: Dictionary) -> bool:
	var places := CuCore.actions().filter(func(a): return a.get("strollPlace"))
	var n := places.size()
	var start := (CuCore.period(s) * 3 + _rng.randi_range(0, n - 1)) % n
	for i in n:
		var a = places[(start + i) % n]
		if CuCore.availability(s, a) != "": continue
		var r = CuCore.stroll(s, a.id)
		CuDB.clear()
		if r is Dictionary and r.get("story"): return true
	return false

## 单独事件：不是自动开场、不是闲逛池里的，玩家在列表里看得见、点了就播
static func _open_event(s: Dictionary) -> bool:
	for a in CuCore.actions():
		if not a.get("once") or a.get("auto") or a.get("hidden") or a.get("strollPlace"): continue
		if a.category == "stroll" and not a.get("visitor"): continue
		if CuCore.availability(s, a) != "": continue
		CuCore.start(s, a.id, {"story": true})
		if CuDB.error == "": return true
		CuDB.clear()
	return false

static func _pick(choice: String, n: int) -> int:
	if n <= 0: return 0
	match choice:
		"选第一个": return 0
		"选最后一个": return n - 1
		_: return _rng.randi_range(0, n - 1)

## 汉皋前要走得到的事件：窗口起点在城门之前；没窗口的闲逛支线（有 once）也算
static func pre_gate_events() -> Array:
	var out := []
	for a in CuCore.actions():
		if a.get("hidden") or not a.get("once"): continue
		var w = a.get("window")
		if w is Array:
			if int(w[0]) <= GATE: out.append(a)
		elif a.category == "stroll" and not a.get("strollPlace") and not a.get("adultOnly"):
			out.append(a)
	return out

static func report(runs: Array, played: Dictionary, picked: Dictionary) -> Dictionary:
	var ex: Dictionary = Data.json("res://data/cultivation/coverage_exempt.json").get("unreachable", {})
	var events := pre_gate_events()
	var unreachable := []
	var exempted := []
	var rows := []
	for a in events:
		var n := int(played.get(a.id, 0))
		rows.append({"id": a.id, "name": a.get("name", ""), "window": a.get("window"), "runs": n})
		if n == 0:
			if ex.has(a.id): exempted.append({"id": a.id, "name": a.get("name", ""), "why": ex[a.id]})
			else: unreachable.append({"id": a.id, "name": a.get("name", ""), "window": a.get("window"), "needs": _needs(a)})
	# 选项覆盖：汉皋前事件里有剧本的，每个选项
	var S: Dictionary = CuDB.fix(Data.json("res://data/cultivation/scripts.json"))
	var total := 0
	var hit := 0
	var missed := []
	for a in events:
		if not S.has(a.id): continue
		var keys := {}
		for sc in S[a.id].scripts:
			for c in sc.get("choices", []): keys[str(c.get("key"))] = true
		for k in keys:
			total += 1
			if picked.has("%s:%s" % [a.id, k]) or (k == "linear" and played.has(a.id)): hit += 1   # 自动一句：播了就算
			else: missed.append("%s「%s」:%s" % [a.id, a.get("name", ""), k])
	var bad := []
	for r in runs:
		if r.error != "" or r.stuck != "": bad.append({"tag": r.tag, "error": r.error, "stuck": r.stuck})
	rows.sort_custom(func(x, y): return x.runs < y.runs)
	return {"ok": unreachable.is_empty() and bad.is_empty(), "runs": runs.size(), "events_total": events.size(), "events_reached": events.size() - unreachable.size() - exempted.size(),
		"unreachable": unreachable, "exempted": exempted, "choices_total": total, "choices_reached": hit, "choices_missed": missed, "bad_runs": bad, "events": rows,
		"run_ends": runs.map(func(r): return {"tag": r.tag, "end": r.end, "events": r.played.size(), "practice": r.n_practice, "stroll": r.n_stroll, "advance": r.n_advance, "why": r.why, "gate": r.get("gate_why", "没进出发期"), "state": r.get("state", {})})}

## 走不到时提示它要什么
static func _needs(a: Dictionary) -> String:
	var t := []
	if a.get("window"): t.append("窗口 %s" % str(a.window))
	if a.get("factRequires"): t.append("前置事实 %s" % ", ".join(a.factRequires))
	if a.get("requires"): t.append("先学 %s" % ", ".join(a.requires))
	if a.get("relNeed"): t.append("关系 %s≥%s" % [a.relNeed.id, a.relNeed.min])
	if a.get("artNeed"): t.append("功法 %s %s 重" % [a.artNeed.id, a.artNeed.level])
	return "；".join(t)

static func markdown(r: Dictionary) -> String:
	var L := ["# 分支覆盖报告（第 3、4 层）", "", "%d 局。汉皋前事件 %d 个，走到 %d 个，走不到 %d 个，豁免 %d 个。选项覆盖 %d／%d。出错或卡住的局 %d。" % [r.runs, r.events_total, r.events_reached, r.unreachable.size(), r.exempted.size(), r.choices_reached, r.choices_total, r.bad_runs.size()], ""]
	if r.unreachable.size():
		L.append("## 走不到（要修，或登记进 coverage_exempt.json）"); L.append("")
		for u in r.unreachable: L.append("- %s「%s」：%s" % [u.id, u.name, u.needs])
		L.append("")
	if r.bad_runs.size():
		L.append("## 出错或卡住的局"); L.append("")
		for b in r.bad_runs: L.append("- %s：%s%s" % [b.tag, b.error, b.stuck])
		L.append("")
	if r.exempted.size():
		L.append("## 豁免"); L.append("")
		for e in r.exempted: L.append("- %s「%s」：%s" % [e.id, e.name, e.why])
		L.append("")
	L.append("## 没选到过的选项（提示，不算失败）"); L.append("")
	for m in r.choices_missed: L.append("- " + m)
	L.append(""); L.append("## 各事件被几局走到（少的在前）"); L.append("")
	L.append("| 事件 | 名字 | 窗口 | 局数 |"); L.append("| --- | --- | --- | --- |")
	for e in r.events: L.append("| %s | %s | %s | %d |" % [e.id, e.name, str(e.window) if e.window else "—", e.runs])
	return "\n".join(L) + "\n"
