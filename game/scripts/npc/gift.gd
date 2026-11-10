extends RefCounted
## 赠礼、赔礼、易物的规则引擎（原版 js/qihe-gift.js，window.QiheGift）。界面在 gift_ui.gd，台词在 ink（qh_gift_line / qh_trade_line）。
## 存档：S.qiheGift = {version, slots:{}, given:{<人>:{<物品>:次数}}, known:{<人>:{<类别>:'xi'|'ke'|'meh'|'no'}}, returned:{<人>:true}, stock:{<人>:{<物品>:数}}, stockVer:2}
const U := preload("res://scripts/npc/util.gd")

var npc: Node
var GOODS: Dictionary = {}     # 物品的类别与价值档（赠礼稿第 3.3、3.5 节）
var LIKES: Dictionary = {}     # 逐人喜好（赠礼稿第 6.2 节）
var TIER_NAME: Array = ["", "寻常", "像样", "厚礼"]
const TIER_SCORE := [0, 2, 4, 6]
var UNLOCK_HINT: Dictionary = {}
var BOND_NOTE: Dictionary = {}
const STOCK_VER := 2   # 2026-10-27：v1 存档里店家的秤上混着商店货，换版重算

func _init(owner: Node) -> void:
	npc = owner
	var src = DB.g("QiheGift")
	GOODS = src.get("GOODS", {}) if src else {}
	LIKES = src.get("LIKES", {}) if src else {}
	if src and src.get("TIER_NAME"): TIER_NAME = src.TIER_NAME
	var ex: Dictionary = Data.json("res://data/npc/extra.json")
	UNLOCK_HINT = ex.get("UNLOCK_HINT", {})
	BOND_NOTE = ex.get("BOND_NOTE", {})

func Q(): return npc.core

func price_of(id: String) -> float:
	var g = GOODS.get(id)
	if g and g.get("value") != null: return float(g.value)
	var it = DB.ITEMS.get(id)
	if it and it.get("price") != null: return float(it.price)
	return 1.0

func tier_of(id: String) -> int:
	var it = DB.ITEMS.get(id)
	var p := price_of(id)
	if it and (U.t(it.get("weapon")) or U.t(it.get("armor")) or U.t(it.get("acc"))):
		var gr := str(U.nz(it.get("grade"), ""))
		for c in ["丙", "乙", "甲", "绝"]:
			if gr.contains(c): return 3
	if GOODS.get(id, {}).get("value") != null: return 1
	return 3 if p >= 50 else (2 if p >= 20 else 1)

func state() -> Dictionary:
	var g: Dictionary = U.sub(G.S, "qiheGift", {"version": 1})
	for k in ["slots", "given", "known", "returned", "stock"]: U.sub(g, k, {})
	return g

func pronoun(p: Dictionary) -> String: return "她" if U.t(p.get("she")) else "他"

## 行囊里能送的东西（数量、类别、价值档、对这个人已知的态度）
func bag_for(p: Dictionary) -> Array:
	var g := state()
	var known: Dictionary = g.known.get(p.id, {})
	var out := []
	for id in G.S.get("bag", {}):
		var n := int(U.num(G.S.bag[id]))
		if n <= 0 or not GOODS.has(id) or not DB.ITEMS.has(id): continue
		out.append({"id": id, "n": n, "name": DB.ITEMS[id].name, "tag": GOODS[id].tag, "tier": tier_of(id), "known": known.get(GOODS[id].tag)})
	# JS sort：喜欢的在前，再按档位从高到低（稳定排序）
	var idx := {}
	for i in out.size(): idx[out[i].id] = i
	out.sort_custom(func(a, b):
		var ax := 1 if a.known == "xi" else 0
		var bx := 1 if b.known == "xi" else 0
		if ax != bx: return ax > bx
		if a.tier != b.tier: return a.tier > b.tier
		return idx[a.id] < idx[b.id])
	return out

func _likes(pid: String) -> Dictionary:
	return LIKES.get(pid, {"xi": [], "ke": "all", "no": []})

func _ke(L: Dictionary, tag: String) -> bool:
	return L.get("ke") is String and L.ke == "all" or (L.get("ke") is Array and L.ke.has(tag))

## 对方怎么反应（赠礼稿第 3.3 节四种反应＋连送递减＋负向只收赔礼）
func judge(p: Dictionary, id: String) -> Dictionary:
	var L := _likes(p.id)
	var tag: String = GOODS[id].tag
	var tier := tier_of(id)
	var b: Dictionary = Q().bond_get(p.id)
	var times := int(U.num(state().given.get(p.id, {}).get(id)))
	var amends: bool = b.score < 0
	if b.hostile or b.stage == "仇视": return {"kind": "hostile", "score": 0, "keep": true}
	if L.no.has(tag) or (U.t(L.get("noHeavy")) and tier == 3):
		return {"kind": "amend-no" if amends else "no", "score": 0, "keep": true, "why": "no" if L.no.has(tag) else "heavy"}
	var xi: bool = L.xi.has(tag)
	var ke := _ke(L, tag)
	if amends and not (xi or tier == 3): return {"kind": "amend-no", "score": 0, "keep": true, "why": "cheap"}
	var s: float = TIER_SCORE[tier] * (2 if xi else (1 if ke else 0))
	if ke and tier == 3 and U.t(L.get("heavyBonus")): s += float(L.heavyBonus)
	var decay := 1.0 if times == 0 else (0.5 if times == 1 else 0.0)
	s = U.jround(s * decay)
	var kind := "amend-ok" if amends else ("again" if times >= 2 else ("xi" if xi else ("ke" if ke else "meh")))
	# 2026-10-29：重复送的东西退回行囊、不扣（和婉拒一样）
	return {"kind": kind, "score": int(s), "keep": kind == "again", "xi": xi, "ke": ke, "tag": tag, "tier": tier, "amends": amends}

## 只预告已知他喜欢的这一类
func preview(p: Dictionary, id: String):
	var tag: String = GOODS[id].tag
	if state().known.get(p.id, {}).get(tag) != "xi": return null
	var j := judge(p, id)
	if j.keep: return null
	var b: Dictionary = Q().bond_get(p.id)
	if j.get("amends"): return {"text": "%s %d → 约 %d" % [b.stage, b.score, mini(0, b.score + j.score)]}
	return {"text": "送了好感约 ＋%d" % j.score}

## 送出：扣行囊、加关系、记次数与已知态度；不收的不扣
func give(p: Dictionary, id: String) -> Dictionary:
	var j := judge(p, id)
	var g := state()
	if not j.keep:
		G.S.bag[id] = int(G.S.bag[id]) - 1
		if G.S.bag[id] <= 0: G.S.bag.erase(id)
		var gv: Dictionary = U.sub(g.given, p.id, {})
		gv[id] = int(U.num(gv.get(id))) + 1
	var tag: String = GOODS[id].tag
	var known: Dictionary = U.sub(g.known, p.id, {})
	var first_known: bool = not U.t(known.get(tag)) and (j.kind == "xi" or j.kind == "no")
	if j.kind == "xi" or (j.kind == "amend-ok" and j.get("xi")): known[tag] = "xi"
	elif j.kind == "no" or (j.kind == "amend-no" and j.get("why") == "no"): known[tag] = "no"
	elif not j.keep and not U.t(known.get(tag)): known[tag] = "ke" if j.get("ke") else "meh"
	var before: Dictionary = Q().bond_get(p.id)
	var r := {"before": before.score, "after": before.score, "stage": before.stage}
	if j.score > 0: r = Q().bond_add(p.id, j.score, {"amends": U.t(j.get("amends")), "reason": "amends" if j.get("amends") else "gift"})
	# 熟络后第一次收礼回赠一件随身物（第 3.7 节；宋先生没有回礼）
	var ret = null
	if not j.keep and r.after >= 20 and not U.t(g.returned.get(p.id)) and not U.t(LIKES.get(p.id, {}).get("noReturn")):
		ret = _return_gift(p)
		if ret: g.returned[p.id] = true
	Q().save()
	var out := j.duplicate()
	out.merge({"id": id, "name": DB.ITEMS[id].name, "before": r.before, "after": r.after, "stageBefore": before.stage, "stage": r.stage, "firstKnown": tag if first_known else null, "returned": ret}, true)
	return out

func given_to(p: Dictionary) -> int:
	var n := 0
	for v in state().given.get(p.id, {}).values(): n += int(v)
	return n

func _return_gift(p: Dictionary):
	var ok := func(it):
		return not (not U.t(it.get("id")) or (U.t(it.get("c")) and it.c != "普") or U.t(it.get("money")) or it.get("use") == "任" or not DB.ITEMS.has(it.id) or not live(it))
	var it = null
	for x in p.get("bag", []):
		if U.t(x.get("ret")) and ok.call(x): it = x; break
	if it == null:
		for x in p.get("bag", []):
			if ok.call(x): it = x; break
	if it == null: return null
	G.S.bag[it.id] = int(U.num(G.S.bag.get(it.id))) + 1
	return {"id": it.id, "name": DB.ITEMS[it.id].name}

## 人物卡上“关系能换来什么”（赠礼稿第 2.2、3.7 节）
func perks(p: Dictionary) -> Array:
	var sp: Dictionary = Q().spar_state(p)
	var can_teach := U.t(p.get("teach"))
	var can_spar := U.t(p.get("spar")) or p.get("spar") is Dictionary
	can_spar = can_spar and not U.t(p.get("civilian")) and not sp.get("hidden", false)
	var trade := U.t(p.get("trade"))
	var verbs := []
	if trade: verbs.append("易物")
	if can_teach: verbs.append("请教")
	if can_spar: verbs.append("切磋")
	var he := pronoun(p)
	var rows := []
	rows.append({"tier": "初识", "min": 0, "text": ("照常跟" + he + "、".join(verbs)) if verbs.size() else "照常收礼、托事"})
	if trade: rows.append({"tier": "熟络", "min": 20, "text": "易物九折"})
	elif U.t(p.get("barter")): rows.append({"tier": "熟络", "min": 20, "text": "肯拿身上的东西跟你换"})
	if not U.t(LIKES.get(p.id, {}).get("noReturn")): rows.append({"tier": "熟络", "min": 20, "text": he + "回赠一件随身带的东西（只一次）"})
	var cold := []
	if trade: cold.append("易物贵两成")
	if can_teach: cold.append("不肯指点你")
	rows.append({"tier": "冷淡", "min": -19, "max": -1, "text": "，".join(cold) if cold.size() else "收礼照常，话少了"})
	var bad := []
	if trade: bad.append("不跟你换东西")
	if can_spar: bad.append("不切磋")
	bad.append("也不托你办事")
	rows.append({"tier": "厌恶", "min": -49, "max": -20, "text": "、".join(bad).replace("、也", "，也")})
	return rows

func hint(p: Dictionary) -> String:
	var b: Dictionary = Q().bond_get(p.id)
	if b.score < 0: return "要请中人说和" if b.stage == "仇视" else "赔礼最多回到 0（初识）"
	if U.t(p.get("special")) and not b.unlocked and b.score >= 19 and UNLOCK_HINT.has(p.id): return "再要熟络：" + str(UNLOCK_HINT[p.id])
	return ""

# ── 易物（定稿做法照大侠立志传：两边放东西，秤按价值倾斜，对方一句心情话，不报数）
func live(it: Dictionary) -> bool:
	return (not U.t(it.get("when")) or Q().test(it.when)) and not (U.t(it.get("until")) and Q().test(it.until))

func shop_ids(p: Dictionary) -> Array:
	if not U.t(p.get("shop")): return []
	var shops = DB.g("QIHE_NPC_ITEMS")
	var out := []
	if shops:
		for x in shops.get("SHOPS", {}).get(p.id, []): out.append(x.id)
	return out

## 能不能拿来换：普通随身物、有运行时物品、不是钱、不是任务用具、没标 swap:false、不是他自己店里卖的货
func can_swap(p: Dictionary, it) -> bool:
	return it is Dictionary and U.t(it.get("id")) and not U.t(it.get("money")) and (not U.t(it.get("c")) or it.c == "普") and it.get("use") != "任" \
		and it.get("swap") != false and DB.ITEMS.has(it.id) and not shop_ids(p).has(it.id)

func stolen(p: Dictionary, it: Dictionary) -> bool:
	return U.t(U.dig(G.S, "steal.taken")) and U.t(G.S.steal.taken.get(p.id, {}).get(U.nz(it.get("id"), it.get("n"))))

## “易”能不能用：功能人物（trade）初识就换；寻常人（barter）熟络才换；厌恶以下不换
func barter_state(p: Dictionary) -> Dictionary:
	if not U.t(p.get("trade")) and not U.t(p.get("barter")): return {"hidden": true}
	var b: Dictionary = Q().bond_get(p.id)
	if b.stage in ["厌恶", "仇视"]: return {"off": true, "note": BOND_NOTE[b.stage]}
	if not U.t(p.get("trade")) and b.score < 20: return {"off": true, "note": "熟络之后才肯换"}
	return {"off": false}

func stock_of(p: Dictionary) -> Dictionary:
	var g := state()
	if g.get("stockVer") != STOCK_VER and int(U.num(g.get("stockVer"))) != STOCK_VER: g.stock = {}; g.stockVer = STOCK_VER
	if not (g.stock.get(p.id) is Dictionary):
		var s := {}
		for it in p.get("bag", []):
			if not can_swap(p, it) or not live(it) or stolen(p, it): continue
			s[it.id] = int(U.num(s.get(it.id))) + int(U.num(it.get("q"), 1))
		g.stock[p.id] = s
	return g.stock[p.id]

## 九折只算功能人物；寻常人熟络才肯换，不另打折；2026-10-27 个人、门派、声誉取较差一档
func trade_rate(p: Dictionary) -> float:
	var st: String = Q().bond_get(p.id).stage
	var own := 1.2 if st == "冷淡" else (0.9 if U.t(p.get("trade")) and st in ["熟络", "信赖", "托付"] else 1.0)
	var pm = npc.rep.price_mul(p.id)
	return maxf(own, pm if pm != null else own)

func accepts(p: Dictionary, id: String) -> bool:
	if not GOODS.has(id) and not DB.ITEMS.has(id): return false
	var L = LIKES.get(p.id)
	var tag = GOODS.get(id, {}).get("tag")
	return not (L and tag and L.no.has(tag))

## list：[[id, 数], ...]
func value_of(list: Array, mult := 1.0) -> float:
	var a := 0.0
	for x in list: a += price_of(x[0]) * int(x[1]) * mult
	return a

func mood(p: Dictionary, mine: Array, theirs: Array) -> String:
	var a := value_of(mine)
	var b := value_of(theirs, trade_rate(p))
	if a == 0 and b == 0: return "look"
	if b == 0: return "ask"
	if a == 0: return "want"
	if a >= b * 1.25: return "over"
	if a >= b * 0.95: return "ok"
	if a >= b * 0.7: return "near"
	return "far"

func deal_ok(p: Dictionary, mine: Array, theirs: Array) -> bool:
	var a := value_of(mine)
	var b := value_of(theirs, trade_rate(p))
	return a > 0 and b > 0 and a >= b * 0.95

func deal(p: Dictionary, mine: Array, theirs: Array) -> bool:
	if not deal_ok(p, mine, theirs): return false
	var s := stock_of(p)
	for x in mine:
		var id: String = x[0]; var k := int(x[1])
		G.S.bag[id] = int(G.S.bag[id]) - k
		if G.S.bag[id] <= 0: G.S.bag.erase(id)
		s[id] = int(U.num(s.get(id))) + k
	for x in theirs:
		var id: String = x[0]; var k := int(x[1])
		s[id] = int(U.num(s.get(id))) - k
		if s[id] <= 0:
			s.erase(id)
			for it in p.get("bag", []):
				if it.get("id") == id:   # 换光了的随身物，偷窃清单里也不再有
					var st: Dictionary = U.sub(G.S, "steal", {"version": 1})
					U.sub(U.sub(st, "taken", {}), p.id, {})[id] = true
					break
		G.S.bag[id] = int(U.num(G.S.bag.get(id))) + k
	Q().save()
	return true

## 台词：从 ink 里取一句（不演出，只拿文字放进面板气泡）；没有这个人的句子再查 knot_more
func line_for(knot: String, vars: Dictionary):
	for k in [knot, knot + "_more"]:
		if not Story.has(k): continue
		var got := [null]
		await Story.play(k, {"vars": vars, "line": func(id, who, text, _o = null):
			if got[0] == null: got[0] = {"id": id, "who": who, "text": text}})
		if got[0] != null: return got[0]
	return null
