extends RefCounted
## 智能托管（battle-auto.js BattleAuto）：只读取公开战况，通过原指令提交入口出招。

var bt
var _serial := 0

func _init(b) -> void: bt = b

var B:
	get: return bt.B

func allowed() -> bool:
	return B != null and (not B.opt.get("storyLesson") or B.opt.get("allowAuto") == true)

func choose(u: Dictionary):
	var R = bt.rules
	var allies: Array = R.alive_of("ally"); var foes: Array = R.alive_of("foe")
	if foes.is_empty(): return null
	var usable := []
	for k in u.get("skills", []):
		if Stats.has_skill(k) and Stats.skill_why(u, k) == "": usable.append(k)
	var maxBP := mini(3, int(u.get("bp", 0)))
	var choices := []
	# 救急优先；只治疗存活角色，不消耗背包药品
	for k in usable:
		var sk := Stats.skill(k); var bi := Stats.bsk(k)
		if not sk.get("heal"): continue
		var groups := []
		if bi.get("tgt") == "self": groups = [[u]]
		elif bi.get("tgt") == "allies": groups = [allies]
		else:
			for t in allies: groups.append([t])
		for targets in groups:
			for bp in maxBP + 1:
				var emergency := false
				for t in targets: if float(t.hp) / t.mhp < 0.45: emergency = true
				if not emergency: continue
				var amount: float = sk.heal * (1 + 0.15 * (int(u.get("skLv", {}).get(k, 1)) - 1)) * (1 + bp * 0.5)
				var gain := 0.0
				for t in targets: gain += minf(t.mhp - t.hp, t.mhp * amount) * (2.0 if float(t.hp) / t.mhp < 0.3 else 1.0)
				choices.append({"kind": "skill", "skill": k, "targets": targets, "bp": bp, "score": 1000 + gain - bp * 20 - sk.get("mp", 0) * 2, "reason": "救急治疗"})
	if choices.size(): return _best(choices)
	for k in [null] + usable:
		var sk: Dictionary = Stats.skill(k) if k != null else {}
		var bi: Dictionary = Stats.bsk(k) if k != null else {}
		if not sk.is_empty() and (sk.get("heal") or bi.get("buff") or bi.get("heart") or Stats.support(k)): continue
		var groups := []
		if bi.get("tgt") == "foes": groups = [foes]
		else:
			for t in foes: groups.append([t])
		for targets in groups:
			for bp in maxBP + 1:
				var v = Stats.skill_pv(u, k, bp) if k != null else {"t": u.atkType, "pow": 1, "hits": 1 + bp}
				if v == null: continue
				var score := 0.0; var breaking := false; var any_broken := false
				for t in targets:
					var damage: float = Stats.est_dmg(u, t, v) * v.hits
					score += minf(t.hp, damage)
					if damage >= t.hp: score += 50
					if Stats.hits_weak(t, v) and not t.get("broken"):
						score += mini(t.shield, v.hits) * 22
						if v.hits >= t.shield:
							var ch: bool = t.get("charging", false) or (t.get("intent") != null and t.intent.get("charge", false))
							score += 85 + (60 if ch else 0); breaking = true
					if bi.get("reveal") and t.known.size() < t.weak.size(): score += 18
					if t.get("broken"): any_broken = true
				# 为破势、收尾或破势期间爆发投入 BP，其余时候积攒
				score -= bp * (10 if any_broken else (25 if breaking else 32)) + sk.get("mp", 0) * 2
				var reason := "弱点破势" if breaking else ("破势追击" if any_broken else ("群攻压制" if targets.size() > 1 else "集中攻击"))
				choices.append({"kind": "skill" if k != null else "attack", "skill": k, "targets": targets, "bp": bp, "score": score, "reason": reason})
	return _best(choices) if choices.size() else null

static func _best(choices: Array) -> Dictionary:
	var b: Dictionary = choices[0]
	for c in choices: if c.score > b.score: b = c
	return b

func sync() -> void:
	if bt.panel == null: return
	var show: bool = B != null and B.round >= 1 and not B.ended and allowed()
	bt.panel.set_auto(show, B != null and B.auto)

func toggle() -> void:
	if B == null or B.ended or B.round < 1 or not allowed(): return
	B.auto = not B.auto
	if B.auto:
		if B.get("autoPending") is Callable and B.autoPending.is_valid(): B.autoPending.call()
	else: _serial += 1
	sync()

## bind：450ms 后若仍在托管且仍轮到该角色，则选一招提交
func bind(u: Dictionary, submit: Callable) -> void:
	var state = B
	var req := func(): _fire(state, u, submit)
	state.autoPending = req
	sync()
	if state.auto: req.call()

func _fire(state, u: Dictionary, submit: Callable) -> void:
	_serial += 1
	var my := _serial
	await bt.get_tree().create_timer(0.45).timeout
	if my != _serial or not is_same(B, state) or not state.auto or state.ended or not is_same(state.cur, u): return
	var action = choose(u)
	if action != null:
		bt.panel.hint("自动 · " + action.reason)
		submit.call(action)

func clear() -> void:
	if B == null: return
	_serial += 1; B.autoPending = Callable()

func finish() -> void:
	if B == null: return
	clear(); B.auto = false; B.ended = true; sync()
