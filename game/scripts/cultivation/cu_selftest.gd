class_name CuSelftest
extends RefCounted
## 培养模式逻辑自检（无界面）：godot --headless --path game -- --cultivation=selftest
## 从拜师开始，每期优先播到期剧情（自动选第一个选项），否则练一项，一直推进，检查不报错。

static func run(tree: SceneTree) -> void:
	var G_ = G
	G_.S = {"bag": {}, "skills": {}, "st": {}, "flags": {}}
	var s := CuCore.initial()
	G_.S.cultivation = s
	CuCore.syncMode(s)
	CuCore.join(s)
	var plan := ["B03", "B02", "B01", "P01", "A01", "D01", "K01"]
	var steps := 0
	var stories := 0
	while s.mode != "complete" and steps < 4000:
		steps += 1
		if steps % 50 == 0: print("步", steps, " ", s.month, "/", s.phase, " ", s.mode, " ", s.pending.action if s.pending else "")
		CuDB.clear()
		if s.pending:
			var p: Dictionary = s.pending
			if p.stage == "result":
				CuCore.closeResult(s)
			elif p.get("visitor"):
				if p.visitor.phase == "choice": CuCore.visitorChoose(s, 0)
				else: CuCore.visitorNext(s)
			else:
				CuCore.resolve(s, 0 if p.stage == "choice" else null)
		elif s.mode == "journey_ready":
			var d = CuCore.dueStory(s)
			if d != null: CuCore.start(s, d.id, {"story": true}); stories += 1
			else: CuCore.depart(s)
		elif s.mode == "journey":
			CuCore.returnJourney(s)
		elif s.mode == "story":
			var d2 = CuCore.dueStory(s)
			if d2 != null: CuCore.start(s, d2.id, {"story": true}); stories += 1
			else: CuCore.completeStory(s, "协同行路")
		else:
			s.summary = null
			var d3 = CuCore.dueStory(s)
			if d3 != null:
				CuCore.start(s, d3.id, {"story": true}); stories += 1
			else:
				var done := false
				for id in plan:
					if CuCore.availability(s, CuDB.action(id)) == "":
						CuCore.start(s, id, {}); done = true; break
				if not done: CuCore.advance(s)
		if CuDB.error != "":
			print("错误 第%d步 %d月%d期：%s" % [steps, s.month, s.phase, CuDB.error])
			break
		CuCore.reconcileWorld(G_.S)
	print("结束：步数=%d 月=%d 期=%d 模式=%s 剧情=%d 关系=%s" % [steps, s.month, s.phase, s.mode, stories, str(s.relations.keys())])
	print("进度：", s.progress)
	# 2026-11-06：几场按日历排的戏实际在第几期播（期 =（月−1）×5＋时段）
	var at := {}
	for h in s.history:
		if h.get("action") in ["gy_prelude_stance", "gy_prelude_xinfa", "gy_prelude_hair", "ys_box_mark", "hg_trace_reply", "gy_m07"]: at[h.action] = h.get("period")
	print("关键剧情期：", at)
	print("st=", G_.S.st, " party=", G_.S.get("party"))
	tree.quit()

## 随机策略（与 data/cultivation/_gen/simr.cjs 同一随机数与同一顺序），整份存档写到 /tmp/cu_godot_<seed>.json 供对照
static var _seed := 1
static func _r(n: int) -> int:
	_seed = (_seed * 48271) % 2147483647
	return floori(float(_seed) / 2147483647.0 * n)
static func _pick(arr: Array): return arr[_r(arr.size())]

static func random(tree: SceneTree, seed0: int) -> void:
	_seed = seed0
	G.S = {"bag": {}, "skills": {}, "st": {}, "flags": {}}
	var s := CuCore.initial()
	G.S.cultivation = s
	CuCore.syncMode(s)
	CuCore.join(s)
	var acts: Array = CuCore.actions()
	var steps := 0
	while s.mode != "complete" and steps < 6000:
		steps += 1
		CuDB.clear()
		if s.pending:
			var p: Dictionary = s.pending
			if p.stage == "result": CuCore.closeResult(s)
			elif p.get("visitor"):
				if p.visitor.phase == "choice": CuCore.visitorChoose(s, _r(CuVisitors.current(p).choices.size()))
				else: CuCore.visitorNext(s)
			else:
				var a = CuDB.action(p.action)
				CuCore.resolve(s, _r(a.choice.size()) if p.stage == "choice" else null)
		elif s.mode == "journey_ready":
			var d = CuCore.dueStory(s)
			if d != null: CuCore.start(s, d.id, {"story": true})
			else: CuCore.depart(s)
		elif s.mode == "journey":
			if _r(2): CuCore.visit(s, _pick(["gate", "street", "alley", "ferry"]))
			CuCore.returnJourney(s)
		elif s.mode == "story":
			var d2 = CuCore.dueStory(s)
			if d2 != null: CuCore.start(s, d2.id, {"story": true})
			else: CuCore.completeStory(s, _pick(["协同行路", "请陆衡指导"]))
		else:
			s.summary = null
			var d3 = CuCore.dueStory(s)
			if d3 != null:
				CuCore.start(s, d3.id, {"story": true})
				if _chk(s, steps): break
				continue
			var un := []
			for l in s.letters:
				if not l.read and l.due <= CuCore.period(s): un.append(l)
			if un.size() > 0 and _r(2):
				CuCore.readLetter(s, un[0].id)
				if _chk(s, steps): break
				continue
			var r := _r(10)
			var did := false
			if r < 2:
				var pl := []
				for a in acts: if a.get("strollPlace"): pl.append(a)
				var res = CuCore.stroll(s, _pick(pl).id)
				if res != null and res.story == null and _r(3) == 0: CuCore.advance(s)
				did = true
			if not did and r == 2:
				var rs := CuCore.letterRecipients(s)
				if rs.size() > 0:
					var o := {"theme": _pick(["近况", "问候乡邻", "外出准备"]), "recipient": _pick(rs).name}
					if CuCore.availability(s, CuDB.action("C01"), o) == "": CuCore.start(s, "C01", o); did = true
			if not did and r == 3:
				var rs2 := CuCore.giftRecipients(s)
				if rs2.size() > 0:
					var o2 := {"theme": "近况", "gift": _pick(["food", "herb", "pouch"]), "recipient": _pick(rs2).name}
					if CuCore.availability(s, CuDB.action("C02"), o2) == "": CuCore.start(s, "C02", o2); did = true
			if not did:
				var av := []
				for a in acts:
					if not a.get("once") and not a.get("strollPlace") and not a.get("mail") and not a.get("visitor") and CuCore.availability(s, a) == "": av.append(a)
				if av.size() > 0 and _r(5): CuCore.start(s, _pick(av).id, {})
				else: CuCore.advance(s)
		if _chk(s, steps): break
		CuCore.reconcileWorld(G.S)
	var f := FileAccess.open("/tmp/cu_godot_%d.json" % seed0, FileAccess.WRITE)
	f.store_string(JSON.stringify({"steps": steps, "S": G.S}))
	f.close()
	print("godot seed %d steps %d %d %d %s %d" % [seed0, steps, s.month, s.phase, s.mode, s.facts.size()])

static func _chk(s: Dictionary, steps: int) -> bool:
	if CuDB.error != "":
		print("错误 第%d步 %d月%d期：%s" % [steps, s.month, s.phase, CuDB.error])
		return true
	return false

## 调试快进：用 run 的固定策略推进到第 target 月月初（供 --cultivation=monthN 截图）
static func fast_forward(s: Dictionary, target: int) -> void:
	var plan := ["B03", "B02", "B01", "P01", "A01", "D01", "K01"]
	var steps := 0
	while s.month < target and s.mode != "complete" and steps < 4000:
		steps += 1
		CuDB.clear()
		if s.pending:
			var p: Dictionary = s.pending
			if p.stage == "result": CuCore.closeResult(s)
			elif p.get("visitor"):
				if p.visitor.phase == "choice": CuCore.visitorChoose(s, 0)
				else: CuCore.visitorNext(s)
			else: CuCore.resolve(s, 0 if p.stage == "choice" else null)
		elif s.mode == "journey_ready":
			var d = CuCore.dueStory(s)
			if d != null: CuCore.start(s, d.id, {"story": true})
			else: CuCore.depart(s)
		elif s.mode == "journey": CuCore.returnJourney(s)
		elif s.mode == "story":
			var d2 = CuCore.dueStory(s)
			if d2 != null: CuCore.start(s, d2.id, {"story": true})
			else: CuCore.completeStory(s, "协同行路")
		else:
			s.summary = null
			var d3 = CuCore.dueStory(s)
			if d3 != null: CuCore.start(s, d3.id, {"story": true})
			else:
				var done := false
				for id in plan:
					if CuCore.availability(s, CuDB.action(id)) == "":
						CuCore.start(s, id, {}); done = true; break
				if not done: CuCore.advance(s)
		if CuDB.error != "": push_error("快进出错：" + CuDB.error); CuDB.clear(); break
		CuCore.reconcileWorld(G.S)
	s.summary = null
