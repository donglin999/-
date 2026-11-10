extends RefCounted
## 偷窃系统·核心管线（原版 js/qihe-steal.js，window.QiheSteal）：下手把握、列表、成功率、结算。
## 数据：QIHE_STEAL_DATA（js/qihe-steal-data.js）。存档 S.steal = {version, lv, exp, taken, alert, caught, rumor}
const U := preload("res://scripts/npc/util.gd")

var npc: Node
var D: Dictionary = {}

func _init(owner: Node) -> void:
	npc = owner
	var d = DB.g("QIHE_STEAL_DATA")
	if not (d is Dictionary): push_error("偷窃数据表未加载：QIHE_STEAL_DATA"); d = {}
	D = d

func Q(): return npc.core

# ───── 存档 ─────
func state() -> Dictionary:
	var s: Dictionary = U.sub(G.S, "steal", {"version": 1})
	if not U.t(s.get("lv")): s.lv = 1
	if not U.t(s.get("exp")): s.exp = 0
	for k in ["taken", "alert", "caught", "rumor"]:
		if not U.t(s.get(k)): s[k] = {}
	return s

## 窃术等级（第 5 节）
func steal_lv() -> int:
	var ex := U.num(state().exp)
	for i in range(D.SKILL.size() - 1, -1, -1):
		if ex >= U.num(D.SKILL[i].exp): return int(D.SKILL[i].lv)
	return 1

## 原版 addExp：beforeLv 用 find（第一个 exp≤before 的档，照抄）
func add_exp(n) -> Dictionary:
	var s := state()
	var before := U.num(s.exp)
	s.exp = before + U.num(n)
	var before_lv := 1
	for sk in D.SKILL:
		if before >= U.num(sk.exp): before_lv = int(sk.lv); break
	var after_lv := steal_lv()
	if after_lv > before_lv: return {"levelUp": true, "lv": after_lv}
	return {"levelUp": false}

# ── 警觉、风声（第 8.1 节）
func is_alert(npc_id: String) -> bool:
	var rec = state().alert.get(npc_id)
	if not U.t(rec): return false
	var cp = G.S.get("qiheChapter")
	if not U.t(cp): return false
	var seg := U.num(cp.get("halfDay"))
	return rec.get("until") == "nextSegment" and U.num(rec.get("at")) == seg

func set_alert(npc_id: String) -> void:
	var cp = G.S.get("qiheChapter")
	if not U.t(cp): return
	state().alert[npc_id] = {"until": "nextSegment", "at": U.num(cp.get("halfDay"))}

func rumor(map_id) -> float: return U.num(state().rumor.get(map_id))

func add_rumor(map_id, delta: float) -> void:
	var s := state()
	s.rumor[map_id] = clampf(U.num(s.rumor.get(map_id)) + delta, 0, 3)

# ── 条件匹配（第 11.2 节）。JS 的 === 与比较：类型不同时为假，undefined 比大小为假
static func _num(v) -> bool: return typeof(v) in [TYPE_INT, TYPE_FLOAT]
static func _eq(a, b) -> bool:
	if _num(a) and _num(b): return float(a) == float(b)
	if typeof(a) != typeof(b):
		if (a is String or a is StringName) and (b is String or b is StringName): return str(a) == str(b)
		return false
	return a == b
static func _in(a, b) -> bool:
	if not (b is Array): return false
	for x in b:
		if _eq(a, x): return true
	return false
static func cmp(op: String, a, b) -> bool:
	match op:
		"eq": return _eq(a, b)
		"in": return _in(a, b)
		"notIn": return not _in(a, b)
		"gte": return _num(a) and _num(b) and a >= b
		"lte": return _num(a) and _num(b) and a <= b
		"not": return not _eq(a, b)
	return false

static func match_when(when: Dictionary, ctx) -> bool:
	for path in when:
		var want = when[path]
		var op := "eq"; var arg = want
		if want is Dictionary and want.size():
			op = want.keys()[0]; arg = want[op]
		if not cmp(op, U.dig(ctx, path), arg): return false
	return true

# ── 取值函数登记表（第 11.2 节）
func term(t: Dictionary, c) -> float:
	match t.op:
		"const": return U.num(t.v)
		"table":
			var arr = D.get(t.table)
			if not (arr is Array): return 0.0
			var idx := int(U.num(U.dig(c, t.key))) - 1
			if idx < 0 or idx >= arr.size(): return 0.0
			return U.num(arr[idx].get(t.field))
		"linear": return U.num(t.k) * (U.num(U.dig(c, t.src)) + U.num(t.offset))
		"diff": return clampf(U.num(U.dig(c, t.a)) - U.num(U.dig(c, t.b)), t.min, t.max)
		"pick":
			if t.get("mute") and match_when(t.mute, c): return 0.0
			var k = U.dig(c, t.src)
			return U.num(t.map.get(U.js(k))) if k != null else 0.0
		"flag": return U.num(t.v) if U.t(U.dig(c, t.src)) else 0.0
		"step":
			var v = U.dig(c, t.src)
			return U.num(t.v) if _num(v) and v >= t.gte else 0.0
	return 0.0

# ── 差距系数（第 4.2 节）
func gap_factor(ctx) -> float:
	var d := U.num(U.dig(ctx, "target.lv")) - U.num(U.dig(ctx, "hero.lv"))
	if d <= 0: return 1.0
	var s := U.num(D.GAP.scaleBase) + U.num(D.GAP.scalePerLv) * U.num(U.dig(ctx, "hero.stealLv"))
	return 1.0 / (1.0 + pow(d / s, 2))

# ── 下手把握（第 4.1 节）
func grip(ctx) -> int:
	var base := 0.0
	for t in D.GRIP_TERMS: base += term(t, ctx)
	return int(clampf(U.jround(base * gap_factor(ctx)), D.GAP.clamp[0], D.GAP.clamp[1]))

func _perks() -> Array:
	var lv := steal_lv()
	for sk in D.SKILL:
		if int(sk.lv) == lv: return sk.get("perks", [])
	return []

# ── 物品列表（第 7、10 节）：读原始随身物品表（n、c、diff、money 数额），再按偷窃过滤规则筛
func list_items(npc_id: String, target: Dictionary) -> Array:
	if U.t(target.get("noSteal")): return []
	var bag: Array = []
	for x in target.get("bag", []):
		var it := U.copy(x)
		if not U.t(it.get("n")): it.n = "钱袋" if U.t(it.get("money")) else "？"
		bag.append(it)
	if bag.is_empty(): return []
	var s := state()
	var perks := _perks()
	var show_hidden := perks.any(func(p): return p.op == "showHidden")
	var show_precious := perks.any(func(p): return p.op == "showPrecious")
	return bag.filter(func(it):
		if it.get("c") == "剧" and not U.t(it.get("stealable")): return false   # 剧情物默认不可窃，除非标 stealable
		if U.t(it.get("look")) or U.t(it.get("worn")): return false             # 只可见、已穿戴的不进列表
		if it.get("c") == "贴" and not show_hidden: return false                # 贴身物窃术 5 级起才显示
		if it.get("c") == "贵" and not show_precious and not (it.has("gate") and _eq(it.gate, 0)): return false  # 贵重物 7 级起；gate:0 的可试
		var key = it.get("id") if U.t(it.get("id")) else it.n
		if U.t(s.taken.get(npc_id, {}).get(key)): return false                  # 已偷过的不再出现
		if U.t(it.get("when")) or U.t(it.get("until")):
			if not Q().test(it.get("when")): return false
			if U.t(it.get("until")) and Q().test(it.until): return false
		return true)

# ── 戒心：被你偷走过、失手被发觉过的人会警惕起来，成功率逐级打折（D.WARY）
func wary(npc_id: String) -> Dictionary:
	var s := state()
	var W: Dictionary = D.get("WARY", {"perTaken": 1, "perCaught": 2, "mult": 0.85, "max": 6})
	var taken: int = (s.taken.get(npc_id, {}) as Dictionary).size()
	var caught := int(U.num(s.caught.get(npc_id, {}).get("count")))
	var lv := minf(W.max, taken * W.perTaken + caught * W.perCaught)
	return {"lv": lv, "taken": taken, "caught": caught, "mult": pow(W.mult, lv)}

# ── 单件成功率与门槛（第 4.3、4.4 节）
func chance(npc_id: String, item: Dictionary, grip_value: float, target: Dictionary) -> Dictionary:
	var ov = D.OVERRIDES.get(npc_id + "_" + U.js(item.get("id")))
	if U.t(ov): return {"chance": ov.chance, "gate": 0, "ruleset": ov.get("ruleset", "main")}
	var tier = D.TIERS.get(item.get("g") if U.t(item.get("g")) else "none")
	if not U.t(tier): return {"chance": 1, "gate": 1, "ruleset": "main"}
	var diff = item.get("diff") if U.t(item.get("diff")) else 1
	var coef := U.num(D.DIFFICULTY.get(U.js(diff)), 0)
	if coef == 0: coef = 1
	var w := wary(npc_id)
	var ch := int(clampf(U.jround(grip_value * coef * w.mult), D.GAP.clamp[0], D.GAP.clamp[1]))
	var gate = U.nz(item.get("gate"), U.nz(target.get("gate"), tier.gate))
	return {"chance": ch, "gate": gate, "ruleset": "main"}

# ── 小游戏参数（第 6 节）
func minigame(chance_value: float, tier: Dictionary, perks: Array) -> Dictionary:
	var hands := int(tier.hands)
	if hands == 2 and perks.any(func(p): return p.op == "hands" and p.get("tier") == "甲" and _eq(p.get("set"), 1)): hands = 1
	var gold := chance_value / 100.0 if hands == 1 else pow(chance_value / 100.0, 1.0 / hands)
	var red = null
	for p in perks:
		if p.op == "redCore": red = p; break
	return {"hands": hands, "goldRatio": gold, "redRatio": red.ratio if red else 0.25, "needle": tier.needle}

# ── 效果登记表（第 11 节）
func _path_obj(path: String) -> Array:
	var parts := path.split(".")
	var obj: Dictionary = G.S
	for i in parts.size() - 1:
		if not U.t(obj.get(parts[i])): obj[parts[i]] = {}
		obj = obj[parts[i]]
	return [obj, parts[parts.size() - 1]]

## 原版 ui.js moral(d)：S.moral=clamp(S.moral+d,0,30)；gain(`道德 ±d`)
func _moral(d) -> void:
	var v := int(U.num(d))
	G.S.moral = clampi(int(U.num(G.S.get("moral"))) + v, 0, 30)
	DB.gain("道德 %s%d" % ["+" if v > 0 else "", v])

func effect(e: Dictionary, c: Dictionary) -> void:
	var S: Dictionary = G.S
	match e.op:
		"take":
			var s := state()
			U.sub(s.taken, c.npcId, {})
			var key = c.item.get("id") if U.t(c.item.get("id")) else c.item.get("n")
			s.taken[c.npcId][key] = true
			if U.t(c.item.get("id")):
				U.sub(S, "bag", {})
				S.bag[c.item.id] = int(U.num(S.bag.get(c.item.id))) + int(U.num(c.item.get("q"), 1) if U.t(c.item.get("q")) else 1)
			elif U.t(c.item.get("money")):
				S.silver = int(U.num(S.get("silver"))) + int(U.num(c.item.money))
		"moral":
			_moral(U.dig(c, e.from) if U.t(e.get("from")) else e.get("v"))
		"exp":
			add_exp(U.dig(c, e.from) if U.t(e.get("from")) else e.get("v"))
		"expBonus":
			if e.get("when") and not match_when(e.when, c): return
			add_exp(e.v)
		"firstFrom", "stamp":
			pass   # 原版：首次偷到奖励、妙手印记“待主会话接入”，空函数
		"advanceQuest":
			var po := _path_obj(e.key)
			po[0][po[1]] = int(U.num(po[0].get(po[1]))) + 1
		"say":
			# 走主线 play（站位、等播完）；剧本没有就不说
			var knot: String = str(e.knot).replace("{npc}", c.npcId)
			var ch = Flow.get_node_or_null("Chapter")
			if Story.has(knot) and ch: await ch.play(knot)
		"alert":
			set_alert(c.npcId)
			var s := state()
			U.sub(s.caught, c.npcId, {"count": 0})
			s.caught[c.npcId].count = int(U.num(s.caught[c.npcId].get("count"))) + 1
		"bond":
			var tgt = U.dig(c, e.target) if U.t(e.get("target")) else c.npcId
			if not U.t(tgt): return
			var v = e.get("v")
			if U.t(e.get("table")):
				v = D[e.table].get("1" if _eq(c.caught.get("count"), 1) else "more")
			Q().bond_add(str(tgt), U.num(v), {"reason": e.reason} if U.t(e.get("reason")) else {})
		"rumor":
			var map_id = U.dig(c, "ctx.mapId")
			if not U.t(map_id): return
			add_rumor(map_id, 999 if U.t(e.get("setMax")) else U.num(e.v))
		"emit":
			npc.rep.emit(e.event, {"npcId": c.npcId, "mapId": U.dig(c, "ctx.mapId"), "tier": c.tier,
				"repeat": U.num(c.caught.get("count")) > 1, "victimIsVillain": c.target.get("villain")})
		"set":
			var po := _path_obj(e.path)
			po[0][po[1]] = e.v
		"copy":
			var v = U.dig(S, e.from)
			var po := _path_obj(e.to)
			po[0][po[1]] = v
		"fight":
			var p = Q().people().get(c.npcId)
			if not (p is Dictionary) or not U.t(p.get("battle")): return
			var b = Q().battle_of(p)
			if not U.t(b): return
			var spec := U.copy(b.spec)
			spec.name = str(p.name) + " · 失手被发现"; spec.exp = 0; spec.silver = 0; spec.drops = {}
			var result = await Battle.start({"allowAuto": false, "solo": true, "heroArt": "hero_village", "heroPor": "opening_hero_village", "foes": [spec]})
			if result == "lose":
				S.hp = maxi(1, int(floor(U.num(S.get("mhp"), 20) * 0.3) if U.t(S.get("mhp")) else 6))
				S.silver = int(floor(U.num(S.get("silver")) * 0.9))
		"markHostile":
			var s := state()
			U.sub(s.caught, c.npcId, {})
			s.caught[c.npcId].hostile = true

# ── 结算（第 8、11 节）
func resolve(ctx: Dictionary) -> void:
	var queue: Array = []
	for r in D.OUTCOME_RULES:
		if r.set != ctx.get("ruleset") or not match_when(r.when, ctx): continue
		queue.append_array(r.effects)
		if U.t(r.get("final")): break
	for e in queue:
		if e.get("skipWhen") and match_when(e.skipWhen, ctx): continue
		await effect(e, ctx)

# ── 教学接口（第 3.3 节）：小耗子三道关固定成功率，按教学规则结算（不扣关系、不发事件）
func teach(_step, result: String) -> void:
	var ctx := {"result": result, "ruleset": "teach", "npcId": "aqi", "item": {"n": "教学道具"}, "target": {}, "ctx": {}, "bond": {}, "tier": D.TIERS.none, "caught": {}}
	resolve(ctx)
