extends RefCounted
## 人物交互框架·规则引擎（原版 js/qihe-npc-core.js，window.QiheNpc）。
## 读 QIHE_NPC_DATA 的表，算墨印菜单每一项的状态与原因、查看页的可见度档位、请教与切磋的条件和收益、关系轴的读写。
## 存档：S.qiheNpc = {version, seed, skills:{spar}, spar:{<人>:{count,first,firstWin,stage,slots:{}}}, slots:{<时段>:次数}, teach:{<人>:true}}
##       S.qiheBond = {<人>:{score,gifts:[],unlocked,hostile,bonus}, known:{<物品>:true}, rolled:{<物品>:悟性}}
const U := preload("res://scripts/npc/util.gd")

var npc: Node            # 自动加载 Npc（取 gift / steal / rep 等兄弟模块）
var D: Dictionary = {}   # QIHE_NPC_DATA
var EXTRA: Dictionary = {}
var SHE: Array = []
var by_name := {}

func _init(owner: Node) -> void:
	npc = owner
	var d = DB.g("QIHE_NPC_DATA")
	if d == null: push_error("人物交互数据表未加载：QIHE_NPC_DATA"); d = {}
	D = d
	EXTRA = Data.json("res://data/npc/extra.json")
	SHE = EXTRA.get("SHE", [])
	# 认人：地图 NPC → 人物表（原版文件末尾 byName）
	for id in D.get("PEOPLE", {}):
		var p: Dictionary = D.PEOPLE[id]
		p.id = id
		if SHE.has(p.get("name", "")): p.she = true
		for n in p.get("npc", []): by_name[n] = id

func CP(): return G.S.get("qiheChapter") if G.S != null else null
func chapter() -> Node: return Flow.get_node_or_null("Chapter")
func side() -> Node: return Flow.get_node_or_null("Side")
func people() -> Dictionary: return D.get("PEOPLE", {})

# ───── 存档 ─────
func state() -> Dictionary:
	var s: Dictionary = U.sub(G.S, "qiheNpc", {"version": 1})
	for k in ["skills", "spar", "slots", "teach"]: U.sub(s, k, {})
	if not U.t(s.get("seed")): s.seed = maxi(1, int(floor(randf() * 2147483648.0)))
	return s

func bonds() -> Dictionary:
	var b: Dictionary = U.sub(G.S, "qiheBond", {})
	U.sub(b, "known", {}); U.sub(b, "rolled", {})
	return b

# ───── 条件 ─────
## 原版 has：行囊、主角三格、同伴三格里有这件
func has(id: String) -> bool:
	var S: Dictionary = G.S
	if int(U.num(S.get("bag", {}).get(id))) > 0: return true
	if S.get("weapon") == id or S.get("armor") == id or S.get("acc") == id: return true
	for m in S.get("mates", {}).values():
		if m is Dictionary and (m.get("weapon") == id or m.get("armor") == id or m.get("acc") == id): return true
	return false

func errand_stage(k: String) -> String:
	var q = U.dig(G.S, "prologue.outsiders.quests." + k + ".stage")
	return str(q) if U.t(q) else "none"

var _re_half := RegEx.create_from_string("^halfDay(<|>=)(\\d+)$")
var _re_bond := RegEx.create_from_string("^bond:(\\w+)>=(-?\\d+)$")

func test1(tok: String) -> bool:
	if tok == "": return true
	var neg := tok[0] == "!"
	if neg: tok = tok.substr(1)
	var ok := false
	var cp = CP()
	var m := _re_half.search(tok)
	if m:
		var h := int(U.num(cp.get("halfDay") if cp else 0))
		ok = h < int(m.get_string(2)) if m.get_string(1) == "<" else h >= int(m.get_string(2))
	else:
		m = _re_bond.search(tok)
		if m: ok = int(bond_get(m.get_string(1)).score) >= int(m.get_string(2))
		else:
			var i := tok.find(":")
			var k := tok if i < 0 else tok.substr(0, i)
			var a := "" if i < 0 else tok.substr(i + 1)
			match k:
				"event": ok = cp != null and U.t(cp.get("events", {}).get(a))
				"stage": ok = cp != null and Array(a.split("|")).has(str(cp.get("stage")))
				"choice": ok = cp != null and U.t(cp.get("choices", {}).get(a))
				"learned": ok = U.t(G.S.get("skills", {}).get(a))
				"has": ok = has(a)
				"errand":
					var pr := a.split(":")
					ok = errand_stage(pr[0]) == (pr[1] if pr.size() > 1 else "")
				"prologueErrand": ok = U.dig(G.S, "prologue.errands." + a) == "done"
				"sparred": ok = U.t(state().spar.get(a, {}).get("first"))
				"skill": ok = U.t(state().skills.get(a))
				"chapter": ok = cp != null
				"never": ok = false
				_: push_error("人物交互条件写错了：" + tok)
	return not ok if neg else ok

func test(expr) -> bool:
	if not U.t(expr): return true
	for t in str(expr).split(" ", false):
		if not test1(t): return false
	return true

# ───── 关系轴（赠礼稿第 2 节） ─────
func stage_of(score: float) -> String:
	for s in D.BOND.stages:
		if score >= float(s.min): return s.name
	return "仇视"

func bond_raw(id: String) -> Dictionary:
	var b := bonds()
	if not (b.get(id) is Dictionary): b[id] = {"score": 0, "gifts": [], "unlocked": false, "hostile": false}
	return b[id]

func bond_cap(id: String) -> int:
	var p = people().get(id)
	if p == null or not U.t(p.get("special")): return int(D.BOND.openingCap)
	return int(D.BOND.openingCap) if U.t(bond_raw(id).get("unlocked")) else int(D.BOND.lockedCap)

func bond_floor(id: String) -> int:
	var p = people().get(id, {})
	return int(U.nz(p.get("bondFloor") if p else null, D.BOND.floor))

func bond_get(id: String) -> Dictionary:
	var r := bond_raw(id)
	var sc := int(U.num(r.get("score")))
	return {"score": sc, "stage": stage_of(sc), "cap": bond_cap(id), "unlocked": U.t(r.get("unlocked")), "hostile": U.t(r.get("hostile"))}

## delta 可正可负。opts.story：剧情做事的加分；opts.amends：赔礼（最多回到 0）；opts.quiet：不弹头顶小签
func bond_add(id: String, delta: float, opts: Dictionary = {}) -> Dictionary:
	if not people().has(id): push_error("没有这个人物：" + id); return {}
	var r := bond_raw(id)
	var before := int(U.num(r.get("score")))
	var v := float(before) + delta
	if delta > 0:
		var cap := bond_cap(id)
		if U.t(opts.get("amends")): v = minf(v, maxf(before, 0))
		v = minf(v, maxf(cap, before))
	var vi := int(maxf(bond_floor(id), minf(100, U.jround(v))))
	r.score = vi
	r.hostile = vi <= int(D.BOND.hostileAt)
	if vi != before and not U.t(opts.get("quiet")):
		var rp = npc.rep
		var txt: String = rp.sign(vi - before) + (" 牵连" if opts.get("reason") == "steal_caught_kin" else " " + stage_of(vi))
		rp.head(id, txt, "neg" if vi < before else "pos")   # 2026-10-27 头顶小签
	if vi != before: npc.rep.settle("bond", {"npcId": id, "delta": vi - before, "reason": opts.get("reason", "bond")})
	return {"before": before, "after": vi, "stage": stage_of(vi)}

func bond_unlock(id: String) -> bool:
	var r := bond_raw(id)
	if U.t(r.get("unlocked")): return false
	r.unlocked = true
	return true

## 特殊人物做完解锁小事：放开到熟络并另加 +8（一次）。在打开菜单、查看页时补算
func sync_unlocks() -> void:
	if G.S == null: return
	for id in people():
		var p: Dictionary = people()[id]
		if not U.t(p.get("special")) or not U.t(p.get("unlock")) or p.unlock == "never": continue
		var r := bond_raw(id)
		if U.t(r.get("bonus")): continue
		if not test(p.unlock): continue
		bond_unlock(id); r.bonus = true
		bond_add(id, D.BOND.unlockBonus, {"story": true})

# ───── 战斗档与可见度（主稿第 3 节、切磋稿第 3 节） ─────
func _clash(): return DB.g("QiheClashData")
func clash_art(id): return _clash().get("arts", {}).get(id) if _clash() else null
func clash_skill(id): return _clash().get("skills", {}).get(id) if _clash() else null

## 原版 battleOf(p)
func battle_of(p: Dictionary):
	var b = p.get("battle")
	if not U.t(b) or U.t(p.get("civilian")): return null
	if U.t(b.get("clash")):
		var pr = _clash().get("profiles", {}).get(b.clash)
		if pr == null: push_error("战斗档缺：" + str(b.clash)); return null
		var arts := []
		var sl: Dictionary = pr.get("skillLevels", {})
		for aid in pr.get("artLevels", {}):
			var a = clash_art(aid)
			if a == null: a = {}
			var moves := []
			for s in a.get("skill_ids", []):
				if int(U.num(sl.get(s))) > 0:
					var cs = clash_skill(s)
					moves.append(cs.name if cs and cs.get("name") else s)
			arts.append({"name": a.get("name", aid), "grade": a.get("grade", ""), "lv": pr.artLevels[aid], "moves": moves})
		var w: Dictionary = pr.weapon
		return {"lv": pr.lv, "st": pr.st, "weapon": {"id": w.get("id"), "name": U.nz(b.get("weaponName"), w.get("name")), "kind": w.get("kind"), "atk": w.get("atk"), "crit": w.get("crit")},
			"acc": {"name": b.acc} if U.t(b.get("acc")) else null, "arts": arts, "inner": null,
			"spec": {"name": p.name, "sp": b.art if U.t(b.get("art")) else "c_qh_clash_guard", "lv": pr.lv, "st": pr.st.duplicate(), "weapon": w.duplicate(),
				"skills": sl.duplicate() if sl.size() else {"blade": 1}, "weak": Stats.weak_by_weapon(str(w.get("kind", "刀"))), "shield": 3, "h": 170}}
	if U.t(b.get("spar")):
		var f = DB.g("QiheSparFoes").get(b.spar) if DB.g("QiheSparFoes") else null
		if f == null: push_error("切磋档缺：" + str(b.spar)); return null
		var fw: Dictionary = f.weapon
		return {"lv": f.lv, "st": f.st, "weapon": {"id": fw.get("id"), "name": fw.get("name"), "kind": fw.get("kind"), "atk": fw.get("atk"), "crit": fw.get("crit")}, "arts": b.get("arts", []), "inner": null, "spec": f.duplicate(true)}
	if U.t(b.get("party")):
		# 同伴读她自己的成长记录（五维、身上兵器）
		var P = DB.PARTY_DEF.get(b.party)
		var m = G.S.get("mates", {}).get(b.party)
		var wid = U.dig(m, "equip.weapon") if m else null
		var it = DB.ITEMS.get(wid) if U.t(wid) else null
		var lv = U.dig(G.S, "mates." + str(b.party) + ".lv")
		if not U.t(lv): lv = 3 if b.party == "ye" else U.nz(U.dig(G.S, "mates." + str(b.party) + ".lvSeen"), 1)   # CharacterGrowth.level
		var st = m.get("st") if m and m.get("st") else (P.get("st") if P else null)
		return {"lv": lv, "st": st, "weapon": {"id": wid, "name": it.name, "kind": U.nz(U.dig(it, "weapon.kind"), ""), "atk": U.dig(it, "weapon.atk"), "crit": U.nz(U.dig(it, "weapon.crit"), 0)} if it else null,
			"arts": b.get("arts", []), "inner": null, "party": true}
	return {"lv": b.get("lv"), "st": null, "weapon": {"name": b.weapon, "grade": b.get("weaponGrade", "")} if U.t(b.get("weapon")) else null,
		"acc": {"name": b.acc, "grade": b.get("accGrade", "")} if U.t(b.get("acc")) else null, "arts": b.get("arts", []), "inner": null}

func tier_index(d) -> int:
	var T: Array = D.TIERS
	for i in T.size():
		if T[i].max == null or d <= float(T[i].max): return i
	return T.size() - 1

func hero_wis() -> int:
	var d = G.derived(G.S)
	if d and d.get("st"): return int(d.st.wis)
	return int(U.num(U.dig(G.S, "st.wis")))

func insight_k(wis: float) -> int:
	for r in D.INSIGHT:
		if r.min == null or wis >= float(r.min): return int(r.k)
	return 0

func hero_lv() -> int: return maxi(1, int(U.num(G.S.get("lv"), 1)))

## 穿戴装备（赠礼稿第 11 节）：p.gear 为准；习武的人没写兵器、佩饰时取战斗档
func _gear_cell(x, fb):
	var c = x if U.t(x) else fb
	if not U.t(c): return null
	var it = DB.ITEMS.get(c.get("id")) if U.t(c.get("id")) else null
	var nm = U.nz(c.get("n"), c.get("name"))
	var atk = U.dig(it, "weapon.atk") if it else null
	if atk == null: atk = c.get("atk")
	var arm = it.get("armor") if it else null
	return {"name": nm, "id": c.get("id"), "grade": U.nz(c.get("g"), U.nz(c.get("grade"), "")), "glyph": c.get("glyph") if U.t(c.get("glyph")) else (str(nm) if U.t(nm) else "？").substr(0, 1),
		"look": U.t(c.get("look")), "atk": atk, "def": arm if (arm is int or arm is float) and not (arm is bool) else null}

func gear_of(p: Dictionary, b) -> Dictionary:
	var g: Dictionary = p.get("gear") if p.get("gear") is Dictionary else {}
	var bw = {"n": b.weapon.get("name"), "id": b.weapon.get("id"), "g": b.weapon.get("grade"), "atk": b.weapon.get("atk")} if b and U.t(b.get("weapon")) else null
	var ba = {"n": b.acc.get("name"), "g": b.acc.get("grade")} if b and U.t(b.get("acc")) else null
	return {"weapon": _gear_cell(g.get("weapon"), bw), "armor": _gear_cell(g.get("armor"), null), "acc": _gear_cell(g.get("acc"), ba)}

func view(p: Dictionary) -> Dictionary:
	var v := _view0(p)
	v.gear = gear_of(p, v.get("battle"))
	return v

func _view0(p: Dictionary) -> Dictionary:
	var b = battle_of(p)
	if b == null: return {"civil": true}
	var party: bool = G.S.get("party", []).has(U.dig(p, "battle.party"))
	if U.t(p.get("disguised")): return {"tier": D.TIERS[3], "index": 3, "d": null, "battle": b, "eye": false}
	if party: return {"tier": D.TIERS[0], "index": 0, "d": float(U.num(b.lv)) - hero_lv(), "battle": b, "eye": false, "party": true}
	var d := float(U.num(b.lv)) - hero_lv()
	var base := tier_index(d)
	var k := insight_k(hero_wis())
	var adj := maxi(tier_index(d - k), base - 1)
	var i := mini(base, adj)
	return {"tier": D.TIERS[i], "index": i, "d": d, "battle": b, "eye": i < base, "k": k}

# ───── 随身物品（赠礼稿第 4、5 节） ─────
## 贵重（甲、绝）显示“未知物品”；认不认得出只看悟性：概率＝悟性÷认出线，第一次看到判一次，悟性涨了再判；种子固定
func _hash(s: String) -> float:
	var h := 2166136261
	for ch in _u16(s):
		h = (h ^ ch) & 0xFFFFFFFF
		h = (h * 16777619) & 0xFFFFFFFF
	return float(h) / 4294967296.0

## JS charCodeAt 的 UTF-16 码元序列
func _u16(s: String) -> Array:
	var out := []
	var buf := s.to_utf16_buffer()
	for i in range(0, buf.size(), 2): out.append(buf[i] | (buf[i + 1] << 8))
	return out

func recognize(key: String, grade) -> bool:
	var b := bonds()
	if U.t(b.known.get(key)): return true
	var r = EXTRA.RECOG.get(str(grade))
	if r == null: return true
	var wis := hero_wis()
	if b.rolled.has(key) and float(b.rolled[key]) >= wis: return false
	b.rolled[key] = wis
	var seed_s := U.js(state().seed)
	if wis >= float(r.line) or _hash(seed_s + ":" + key + ":" + str(wis)) < float(wis) / float(r.line):
		b.known[key] = true; return true
	return false

## 原版 bagOf(p,v)：查看页“随身物品”格
func bag_of(p: Dictionary, v = null) -> Array:
	var out := []
	var opaque: bool = v != null and not U.t(v.get("civil")) and int(v.get("index", -1)) == 3
	for it in p.get("bag", []):
		if U.t(it.get("when")) and not test(it.when): continue
		if U.t(it.get("until")) and test(it.until): continue
		if U.t(it.get("money")) and not U.t(it.get("n")):
			out.append({"name": "银两", "glyph": "银", "qty": U.js(it.money) + " 两", "money": true}); continue
		var c = it.get("c")
		if c == "贴":
			if U.t(p.get("disguised")) and opaque and not out.any(func(x): return x.get("close")):
				out.append({"name": "贴身收着一件", "glyph": "？", "close": true, "dim": true})
			continue
		if c == "锁": out.append({"name": "未知物品", "glyph": "？", "dim": true, "locked": true}); continue
		var q := ("×" + U.js(it.q)) if U.num(it.get("q")) > 1 else ""
		if c == "贵":
			var key: String = str(U.nz(it.get("key"), it.n))
			var known := recognize(key, it.get("g"))
			var wis := hero_wis()
			if known: out.append({"name": it.n, "id": it.get("id"), "glyph": U.nz(it.get("glyph"), str(it.n).substr(0, 1)), "grade": it.get("g"), "qty": q, "valuable": true})
			else: out.append({"name": "未知物品", "glyph": "？", "dim": true, "grade": it.g if wis >= float(EXTRA.RECOG[str(it.g)].grade) else "", "qty": q})
			continue
		out.append({"name": it.n, "id": it.get("id"), "glyph": U.nz(it.get("glyph"), str(it.n).substr(0, 1)), "grade": U.nz(it.get("g"), ""),
			"qty": (U.js(it.money) + " 两") if U.t(it.get("money")) else q, "story": c == "剧", "look": U.t(it.get("look")), "use": U.nz(it.get("use"), ""),
			"swap": npc.gift.can_swap(p, it)})   # swap：肯拿来以物易物（随身物品 v2）
	return out

# ───── 时段（切磋、请教共用；切磋稿 2.5） ─────
func slot() -> String:
	var p = CP()
	if p == null: return "night"
	if p.get("stage") == "days": return "d" + U.js(U.nz(p.get("halfDay"), 0))
	return str(p.get("stage"))

func pronoun(p: Dictionary) -> String: return "她" if U.t(p.get("she")) else "他"

# ───── 菜单项状态 ─────
func outsiders() -> Node:
	var s := side()
	return s.outsiders if s and "outsiders" in s else null

func story_hook(p: Dictionary, n) -> Variant:
	var ch := chapter()
	var os := outsiders()
	for h in p.get("story", []):
		var def: Dictionary = D.STORY[h]
		if h == "main":
			var m = ch.main_step() if ch and ch.has_method("main_step") else null
			if U.t(p.get("chapter")) and m != null and m.get("npc") == p.chapter: return {"hook": h, "lab": def.lab, "note": m.title, "run": "act"}
		if h == "errand" and os and os.available():
			var k = os.representative_key(str(p.get("chapter", "")))
			if U.t(k) and os.quest_open(k):
				var st := errand_stage(k)
				if st != "done":
					var nm: String = os.DEFS[k].name
					var bst: String = bond_get(p.id).stage
					if st == "none" and bst in ["厌恶", "仇视"]: return {"hook": h, "lab": def.lab, "note": D.BOND.effects[bst].tuo, "off": true}
					# 2026-11-04 托／回并成一枚“互”：标签都写“互动”，接手还是回话放进小注
					var en: String = def.get("notes", {}).get(k, nm)
					return {"hook": h, "lab": def.lab if st == "none" else def.labActive, "note": ("接手 · " if st == "none" else "回话 · ") + en, "run": "errand"}
		if h == "errandCheck" and os and os.available():
			var ks: Array = os.pending_for(str(n.get("name")) if n is Dictionary and n.get("name") else str(p.name))
			if ks.size(): return {"hook": h, "lab": def.lab, "note": "问「" + str(os.DEFS[ks[0]].name) + "」", "run": "act"}
		if h == "stranger" and ch and ch.has_method("stranger_pending") and U.t(ch.stranger_pending()): return {"hook": h, "lab": def.lab, "note": def.note, "run": "act"}
	return null

func teach_state(p: Dictionary):
	var t = D.TEACH.get(p.get("teach", ""))
	if t == null: return null
	var s := state()
	if U.t(s.teach.get(p.id)) or (U.t(t.get("skill")) and U.t(G.S.get("skills", {}).get(t.skill))): return {"off": true, "note": U.nz(t.get("closedNote"), "已请教过"), "t": t}
	var neg = D.BOND.effects.get(bond_get(p.id).stage, {}).get("jiao")
	if U.t(neg): return {"off": true, "note": neg, "t": t}
	for r in t.req:
		if not test(r[0]): return {"off": true, "note": r[2] if r.size() > 2 and U.t(r[2]) else r[1], "t": t, "miss": r}
	return {"off": false, "note": str(t.title) + " · " + str(t.grade), "t": t}

func spar_state(p: Dictionary) -> Dictionary:
	var sp = p.get("spar")
	if sp == null or U.t(p.get("civilian")): return {"hidden": true}
	if sp.get("deny") == "companion": return {"hidden": true}
	if sp.get("deny") == "disguised": return {"off": true, "note": pronoun(p) + "推说不会这个"}
	var s := state()
	var rec: Dictionary = s.spar.get(p.id, {})
	if U.t(sp.get("first")) and not U.t(rec.get("first")) and test(sp.get("firstWhen")) and test("stage:refuge"): return {"story": true, "first": true, "note": sp.firstNote}
	if not U.t(s.skills.get("spar")): return {"off": true, "note": "还不懂讨教的规矩"}
	if U.t(sp.get("noProfile")): return {"off": true, "note": "战斗档待补"}
	var ch := chapter()
	if (CP() and U.t(CP().get("pendingEvent"))) or (ch and ch.running): return {"off": true, "note": "有事在身"}
	var neg = D.BOND.effects.get(bond_get(p.id).stage, {}).get("bi")
	if U.t(neg): return {"off": true, "note": neg}
	var b = battle_of(p)
	var d := float(U.num(b.lv)) - hero_lv()
	if d >= float(D.SPAR.refuseStrong): return {"off": true, "note": "差距过大 · " + pronoun(p) + "不接"}
	if d <= float(D.SPAR.refuseWeak): return {"off": true, "note": "你太强 · " + pronoun(p) + "不接"}
	var sl := slot()
	if int(U.num(rec.get("slots", {}).get(sl))) >= int(D.SPAR.perPersonPerSlot): return {"off": true, "note": "这个时段打过了"}
	if int(U.num(s.slots.get(sl))) >= int(D.SPAR.perSlot): return {"off": true, "note": "这个时段打够了"}
	var mhp := float(G.derived(G.S).get("mhp", 0))
	if mhp > 0 and float(U.num(G.S.get("hp"))) < mhp * float(D.SPAR.hurtBelow): return {"off": true, "note": "你带着伤"}
	return {"off": false, "note": "点到为止"}

## 2026-10-27 门派厌恶以下：易、教、比关印；“托”挂着主线与跑腿，不受门派门槛
const FACTION_ACT := {"yi": "trade", "jiao": "teach", "bi": "spar"}
func faction_off(p: Dictionary, id: String):
	var act = FACTION_ACT.get(id)
	if act == null: return null
	var g: Dictionary = npc.rep.gate(p.id, act)
	if g.ok or str(U.nz(g.why, "")).begins_with("bond_"): return null
	return "门派敌对" if g.why == "faction_hostile" else "门派不睦"

func steal_state(p: Dictionary) -> Dictionary:
	var ST = npc.steal
	var s := state()
	# 2026-11-09 小耗子的一课二版：他让萧白“用窃”从他身上摸一枚铜钱，这时还没学会也亮着
	if p.get("id") == "aqi":
		var sd = Flow.get_node_or_null("Side")
		if sd != null and sd.get("aqi") != null and sd.aqi.has_method("lesson_pending") and sd.aqi.lesson_pending():
			return {"off": false, "note": "照他说的，摸一枚铜钱", "lesson": true}
	if not U.t(s.skills.get("steal")): return {"off": true, "note": "还不会偷窃"}
	if ST.is_alert(p.id): return {"off": true, "note": "他正盯着你"}
	if ST.list_items(p.id, p).is_empty(): return {"off": true, "note": "身上没什么可窃的了"}
	return {"off": false, "note": "下手把握与可窃物品"}

## 原版 menuFor(p,npc)：墨印菜单各项 {id,ch,lab,note,st:'normal'|'story'|'off',run,say}
func menu_for(p: Dictionary, n) -> Array:
	sync_unlocks()
	var out := []
	var bst: String = bond_get(p.id).stage
	var neg: Dictionary = D.BOND.effects.get(bst, {})
	for M in D.MENU:
		if U.t(M.get("reserved")): continue
		var it: Dictionary = M.duplicate()
		it.st = "normal"; it.note = M.get("note", "")
		match M.id:
			"tuo":
				var h = story_hook(p, n)
				if h == null: continue
				it.st = "off" if h.get("off") else "story"; it.lab = h.lab; it.note = h.note; it.run = h.get("run")
			"tan":
				if n is Dictionary and n.get("talk") == false: continue
				it.run = "act"
			"guan": it.run = "profile"
			"li":   # 2026-10-26 开发二：赠礼／赔礼面板
				var b := bond_get(p.id)
				if b.stage == "仇视": it.st = "off"; it.note = "要请中人说和"
				else:
					it.run = "gift"; it.lab = "赔礼" if b.score < 0 else "赠礼"
					it.note = ("只收厚礼或" + pronoun(p) + "喜欢的") if b.score < 0 else ""
			"jiao":
				var t = teach_state(p)
				if t == null: continue
				it.st = "off" if t.off else "normal"; it.note = t.note; it.run = "teach"
			"bi":
				var s := spar_state(p)
				if s.get("hidden"): continue
				it.st = "story" if s.get("story") else ("off" if s.get("off") else "normal"); it.note = s.note; it.run = "spar"
			"qie":
				var s := steal_state(p)
				if s.get("hidden"): continue
				it.st = "off" if s.get("off") else ("story" if s.get("lesson") else "normal"); it.note = s.note; it.run = "aqi_lesson" if s.get("lesson") else "steal"
			"yi":   # 2026-10-27 随身物品 v2：寻常人熟络后也肯以物易物
				if not U.t(p.get("trade")) and not U.t(p.get("barter")): continue
				var bs: Dictionary = npc.gift.barter_state(p)
				if bs.get("hidden"): continue
				if U.t(neg.get("yi")): it.st = "off"; it.note = neg.yi
				elif bs.get("off") and not U.t(p.get("trade")): it.st = "off"; it.note = bs.get("note", "")
				else:
					it.run = "yi"; it.note = "以物易物 · 买卖" if U.t(p.get("trade")) else "以物易物"
		# 2026-10-27 印是灰的，点了由门人说一句为什么不肯
		var f = faction_off(p, M.id) if it.st != "off" else null
		if f != null:
			it.st = "off"; it.note = f
			var k := "npc_" + str(p.id) + "_faction_no"
			if Story.has(k): it.say = k
		out.append(it)
	return out

# ───── 请教、切磋的执行 ─────
func save() -> void:
	var pr = Flow.prologue()
	if pr and pr.has_method("checkpoint"): pr.checkpoint()
	else: G.checkpoint()

func do_teach(p: Dictionary) -> bool:
	var t = teach_state(p)
	if t == null or t.off: return false
	var fx: Dictionary = t.t.fx
	if U.t(fx.get("activity")):
		var ch := chapter()
		if ch: await ch.guarded(func(): await ch.activity_body(fx.activity))
		return true
	if U.t(fx.get("zy")):
		var zy: Dictionary = U.sub(G.S, "zy", {})
		zy[fx.zy] = mini(200, int(U.num(zy.get(fx.zy))) + int(fx.n))
		state().teach[p.id] = true; save(); UI.toast(t.t.gain, 2200)
		return true
	return false

func _round5(v: float) -> float: return U.jround(v / float(D.SPAR.insight.round)) * float(D.SPAR.insight.round)

func spar_quote(p: Dictionary) -> Dictionary:
	var b = battle_of(p)
	var s := state()
	var rec: Dictionary = s.spar.get(p.id, {})
	var lv := float(U.num(b.lv))
	var d := lv - hero_lv()
	var E: Dictionary = D.SPAR.exp
	var base: float = float(E.base) + float(E.perLv) * lv
	var weak := maxf(0, 1 + d / 10.0) if d < 0 else 1.0
	var decay: float = float(E.decay[mini(E.decay.size() - 1, int(U.num(rec.get("count"))))])
	var one := func(r): return U.jround(base * float(E.result[r]) * weak * decay * 1.2)   # 主角“历练领悟 +20%”只作显示
	var I: Dictionary = D.SPAR.insight
	var first_win := maxf(float(I.firstWinMin), _round5(lv / float(I.firstWinDiv)))
	return {"lv": b.lv, "d": d, "base": base, "weak": weak, "decay": decay,
		"exp": {"win": one.call("win"), "draw": one.call("draw"), "lose": one.call("lose")},
		"raw": func(r): return base * float(E.result[r]) * weak * decay,
		"insight": {"first": 0 if U.t(rec.get("first")) else int(I.first), "firstWin": 0 if U.t(rec.get("firstWin")) else int(first_win)},
		"spent": decay == 0, "story": U.t(U.dig(p, "spar.first")) and not U.t(rec.get("first")),
		"left": maxi(0, int(D.SPAR.perSlot) - int(U.num(s.slots.get(slot()))))}

## SharedInsightPool.state(S)（shared-insight-pool.js）
func insight_pool() -> Dictionary:
	var p: Dictionary = U.sub(G.S, "jianghuInsight", {"version": 1, "balance": 0, "earned": 0, "spent": 0, "receipts": {}, "ledger": []})
	return p

func grant_insight(id: String, amount: int, nm: String) -> int:
	if amount == 0: return 0
	var pool := insight_pool()
	if pool.receipts.has(id): return 0
	pool.receipts[id] = amount
	pool.balance = int(pool.balance) + amount; pool.earned = int(pool.earned) + amount
	pool.ledger.append({"id": id, "amount": amount, "name": nm, "kind": "gain"})
	if pool.ledger.size() > 100: pool.ledger = pool.ledger.slice(-100)
	return amount

## 点到为止：任一方掉到三成或打满八回合收手（切磋稿 2.4）。
## 原版临时替换 window.endCheck / victory / bigText；Godot 版经 opt 交给 Battle：endCheck(B)->String、victory()、bigTextMap
func run_spar(p: Dictionary) -> Dictionary:
	var q := spar_quote(p)
	var b = battle_of(p)
	var s := state()
	var sl := slot()
	var before := {"hp": G.S.get("hp"), "mp": G.S.get("mp")}
	var spec: Dictionary = b.spec.duplicate(true)
	var fac := str(p.get("faction", ""))
	spec.name = (fac if fac != "" and not str(b.spec.name).contains(fac) else "") + str(p.name) + " · 切磋"
	spec.exp = 0; spec.silver = 0; spec.drops = {}
	var SP: Dictionary = D.SPAR
	var end_check := func(B: Dictionary) -> String:
		var alive := func(side): return B.units.filter(func(u): return u.hp > 0 and u.side == side)
		if alive.call("foe").is_empty(): return "win"
		if B.foes.all(func(u): return u.hp <= u.mhp * float(SP.stopAt)): return "win"
		if B.allies.any(func(u): return u.get("isHero") and u.hp <= u.mhp * float(SP.stopAt)): return "lose"
		if alive.call("ally").is_empty(): return "lose"
		if int(B.round) > int(SP.maxRounds): return "draw"
		return ""
	var victory := func():   # 不弹经验战利品结算，收益在切磋卷上另算
		await Battle.rules.victory_pose()
		await Battle.big_text("胜", Color("#f3d58e"), 900)
	var bga = DB.g("QiheChapterBattleArt")
	var result = await Battle.start({"allowAuto": true, "solo": true, "heroArt": "hero_village", "heroPor": "opening_hero_village",
		"bg": U.dig(bga, "backgrounds.road") if bga else null, "foes": [spec],
		"endCheck": end_check, "victory": victory, "bigTextMap": {"脱身": "平"}, "spar": true})
	G.S.hp = before.hp; G.S.mp = before.mp
	var r := "win" if result == "win" else ("lose" if result == "lose" else "draw")
	if not (s.spar.get(p.id) is Dictionary): s.spar[p.id] = {"count": 0, "first": false, "firstWin": false, "stage": "opening", "slots": {}}
	var rec: Dictionary = s.spar[p.id]
	U.sub(rec, "slots", {})
	var exp := 0
	var raw := U.jround(q.raw.call(r))
	if raw > 0:
		var g := Stats.award_battle(G.S, raw, [])
		exp = int(U.num(U.dig(g, "hero.amount")))
		rec.count = int(U.num(rec.get("count"))) + 1
	var ins := 0
	if not U.t(rec.get("first")): ins += grant_insight("spar:" + str(p.id) + ":first:" + str(rec.stage), int(D.SPAR.insight.first), "初次切磋 · " + str(p.name))
	if r == "win" and not U.t(rec.get("firstWin")):
		ins += grant_insight("spar:" + str(p.id) + ":firstWin:" + str(rec.stage), int(q.insight.firstWin), "首胜 · " + str(p.name)); rec.firstWin = true
		if float(U.num(battle_of(p).lv)) >= hero_lv(): npc.rep.settle("spar_first_win", {"npcId": p.id})   # 首胜且对手不比自己低：声誉 +1
	var learned: bool = q.story and not U.t(s.skills.get("spar"))
	rec.first = true
	if q.story: s.skills.spar = true
	else:
		rec.slots[sl] = int(U.num(rec.slots.get(sl))) + 1
		s.slots[sl] = int(U.num(s.slots.get(sl))) + 1
	save()
	return {"result": r, "exp": exp, "insight": ins, "learned": learned}

# ───── 认人：地图 NPC → 人物表 ─────
func person_for(n):
	if not (n is Dictionary) or U.t(n.get("resource")) or U.t(n.get("loot")) or not U.t(n.get("sp")): return null
	var id = n.get("person") if U.t(n.get("person")) else by_name.get(n.get("name"))
	return people().get(id) if id != null else null
