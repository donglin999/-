class_name Stats
extends RefCounted
## 人物数值与战斗单位构造。
## 对应原版：menu.js derived/mnFx/mkHero/mkAlly、battle.js statUnit/mkFoe、core.js settleCharacterLevels、
## character-growth-state.js CharacterGrowth.awardBattle / CharacterCondition.apply、qihe-ui-model.js skillCost/skillWhy/skillEffects。
## 单位是 Dictionary（键名与原版 JS 对象一致：hp/mhp/atk/def/spd/crit/dodge/bp/boosted/buffs/...）。

const STAT_KEYS := ["str", "con", "agi", "wil", "wis"]
const CHARACTER_LEVEL_CAP := 100

static var _defs: Dictionary = {}

## 战斗常量表（data/battle/defs.json）
static func defs() -> Dictionary:
	if _defs.is_empty():
		var f := FileAccess.open("res://data/battle/defs.json", FileAccess.READ)
		if f: _defs = JSON.parse_string(f.get_as_text())
	return _defs

## 招式表：原版 battle.js 用 Object.assign 给 SKILLS 补了 jinzhen/huichun/baicao/dingshen/sniff 的缺省
static func skill(k) -> Dictionary:
	if k == null: return {}
	if DB.SKILLS.has(k): return DB.SKILLS[k]
	return defs().SKILL_DEFAULTS.get(k, {})

static func has_skill(k) -> bool:
	return not skill(k).is_empty()

static func bsk(k) -> Dictionary:
	if k == null: return {}
	if defs().BSK.has(k): return defs().BSK[k]
	# 培养部分的师承招式：战斗定义在 CultivationLibrary.moves[k].b（类型、属性、目标、段数、冷却、效果表）
	if lib_move(k):
		var b: Dictionary = DB.g("CultivationLibrary").moves[k].get("b", {})
		if k == "gy_p5b" and b.get("tgt") != "allies": b.tgt = "allies"   # 原版：自动护住两名同伴，没有双目标选择
		return b
	return {}

static func lib_move(k) -> bool:
	var lib = DB.g("CultivationLibrary")
	return k != null and lib is Dictionary and lib.get("moves", {}).has(k)

## 不造成伤害的师承招式（卸力、守势、援护）：原版以第一档段数为 0 判断
static func support(k) -> bool:
	if not lib_move(k): return false
	var bp = bsk(k).get("bp")
	return bp is Array and bp.size() > 0 and bp[0] is Array and int(bp[0][1]) == 0

## 师承招式的效果表（取第一档，各档相同；BP 档另由 bp 字段给威力）
static func move_ef(k, bp := 0) -> Array:
	var ef = bsk(k).get("ef")
	if not (ef is Array) or ef.is_empty(): return []
	var t = ef[clampi(bp, 0, ef.size() - 1)]
	return t if t is Array else []

static func item(k) -> Dictionary:
	if k == null or not (k is String): return {}
	return DB.ITEMS.get(k, {})

## menu.js mnWeaponType：琴箫笛归音律
static func weapon_type(t) -> String:
	if t == null: return ""
	return "音律" if ["琴", "箫", "笛", "音律"].has(t) else str(t)

## menu.js mnFx：兵器 atk/crit、护具 armor→def、物品 fx 词条
static func item_fx(k) -> Dictionary:
	var it := item(k)
	if it.is_empty(): return {}
	var o: Dictionary = it.get("fx", {}).duplicate()
	if it.get("weapon"):
		o["atk"] = o.get("atk", 0) + it.weapon.get("atk", 0)
		if it.weapon.get("crit"): o["crit"] = o.get("crit", 0) + it.weapon.crit
	if typeof(it.get("armor")) in [TYPE_INT, TYPE_FLOAT]:
		o["def"] = o.get("def", 0) + it.armor
	return o

## character-growth-state.js CharacterCondition.inspect
static func conditions_of(record) -> Array:
	var out := []
	if not (record is Dictionary): return out
	var defs_c: Dictionary = DB.g("CharacterCondition").get("definitions", {}) if DB.g("CharacterCondition") else {}
	for c in record.get("conditions", []):
		var d = defs_c.get(c.get("id", ""))
		if d == null: continue
		var mul: Dictionary = d.get("mul", {})
		if d.has("stages"):
			var st: Array = d.stages
			mul = st[clampi(int(c.get("stage", 0)), 0, st.size() - 1)].get("mul", {})
		out.append({"id": c.id, "mul": mul})
	return out

## CharacterCondition.apply：同类乘数取最小（减益）与最大（增益），取整、下限 1（内力下限 0）
static func apply_conditions(d: Dictionary, record) -> Dictionary:
	var out := d.duplicate()
	var low := {}
	var high := {}
	for c in conditions_of(record):
		for k in c.mul:
			var v: float = c.mul[k]
			if v < 1: low[k] = minf(low.get(k, 1.0), v)
			else: high[k] = maxf(high.get(k, 1.0), v)
	var keys := {}
	for k in low: keys[k] = true
	for k in high: keys[k] = true
	for k in keys:
		if out.has(k) and typeof(out[k]) in [TYPE_INT, TYPE_FLOAT]:
			out[k] = maxi(0 if k == "mmp" else 1, roundi(out[k] * low.get(k, 1.0) * high.get(k, 1.0)))
	return out

## menu.js derived（覆盖 core.js）：三件装备词条累加、五维加成、派生公式，再套 CharacterCondition
## u 为 {st, lv, weapon, armor, acc, atkBonus, mpBonus, conditions}；不传时取主角 G.S
static func derived(u = null) -> Dictionary:
	if u == null: u = G.S
	var b := {}
	for k in [u.get("weapon"), u.get("armor"), u.get("acc")]:
		if k != null and DB.ITEMS.has(k):
			var fx := item_fx(k)
			for a in fx: b[a] = b.get(a, 0) + fx[a]
	var s := {}
	var st: Dictionary = u.get("st", {})
	for k in STAT_KEYS: s[k] = int(st.get(k, 0)) + int(b.get(k, 0))
	var lv := int(u.get("lv", 1)) if u.get("lv") else 1
	var d := {
		"mhp": 60 + s.con * 14 + lv * 12 + int(b.get("mhp", 0)),
		"mmp": 30 + s.wil * 7 + s.wis * 2 + lv * 5 + int(u.get("mpBonus", 0) if u.get("mpBonus") else 0) + int(b.get("mmp", 0)),
		"atk": 8 + s.str * 3 + lv * 2 + int(b.get("atk", 0)) + int(u.get("atkBonus", 0) if u.get("atkBonus") else 0),
		"def": s.con + s.wil * 2 + int(b.get("def", 0)),
		"spd": s.agi + int(b.get("spd", 0)),
		"crit": 5 + s.wis * 2 + int(b.get("crit", 0)),
		"dodge": roundi(s.agi * 1.5) + int(b.get("dodge", 0)),
		"block": mini(30, s.con + int(b.get("block", 0))),
		"move": 2 + floori(s.agi / 5.0), "st": s, "fx": b}
	return apply_conditions(d, u)

## battle.js statUnit
static func stat_unit(src: Dictionary, side: String) -> Dictionary:
	var d := derived({"st": src.get("st", {}), "lv": src.get("lv", 1) if src.get("lv") else 1, "weapon": src.get("weapon"), "armor": src.get("armor"),
		"atkBonus": src.get("atkBonus", 0), "mpBonus": src.get("mpBonus", 0), "conditions": src.get("conditions", [])})
	var conds := []
	for c in src.get("conditions", []): conds.append(c.duplicate())
	return {"side": side, "name": src.get("name", ""), "conditions": conds, "lv": src.get("lv", 1) if src.get("lv") else 1,
		"mhp": d.mhp, "mmp": d.mmp, "atk": d.atk, "def": d.def, "spd": d.spd, "crit": d.crit, "dodge": d.dodge,
		"bp": 1, "boosted": false, "buffs": {}, "alpha": 1.0, "id": randf(), "skills": [], "skLv": {}, "hp": d.mhp, "mp": d.mmp}


## 分支覆盖检查用（docs/branch-coverage.md 第二节 8、9 条）：战斗里已经接上的效果名。数据里出现不在清单里的，结构检查会报“效果没接”。
const HEART_KEYS := ["exposed_damage", "guard_bonus", "guard_cap", "guard_on_defend", "low_hp_reduce", "unexposed_reduce",
	"per.revealed_damage", "t5.first_reveal_mp", "top.t3.postHp", "top.t3.postMp", "top.t5.postHp", "top.t5.postMp"]
## 有意没接的，写原因
const HEART_KEYS_TODO := {"guard_choice_reduction": "万壑归元诀“消耗守势时二选一（加伤或减伤）”：原版同样只做了加伤，二选一界面待做"}
const MOVE_EF := ["conditional_damage:consume_one_self_guard_token", "conditional_damage:previous_self_guard", "conditional_damage:target_broken",
	"counter_power:after_actual_intercept", "counter_power:first_single_hit_received_before_next_self_action", "extra_shield_damage:consume_one_self_guard_token",
	"guard_token:self_max_one", "intercept:next_single_ally_hit", "last_hit_bonus:actual_intercept_damage_this_round", "last_hit_bonus:consume_one_guard_token",
	"last_hit_bonus:target_broken_before_hit", "next_attack_bonus:next_same_art_move_once", "next_attack_bonus:next_self_attack_once",
	"unload:next_received_hit", "unload:one_hit_each_of_two_selected_allies", "unload:self_next_received_hit"]

# ───────── 内功在战斗里的特殊效果（2026-11-08 接线；数值照 CultivationLibrary.hearts 的 v3n，待评审）─────────
## 单位的内功：主修＋辅修，[{id, lv, f, main}]；记录取 G.S（主角）或 S.mates[key]
static func hearts_of(rec) -> Array:
	var out := []
	if not (rec is Dictionary): return out
	var x = rec.get("xinfa")
	if not (x is Dictionary): return out
	var lib = DB.g("CultivationLibrary")
	var H: Dictionary = lib.get("hearts", {}) if lib is Dictionary else {}
	var list: Array = [x.get("main")] + (x.get("subs", []) if x.get("subs") is Array else [])
	for k in list:
		if k == null or not H.has(k): continue
		var lv := clampi(int(x.get("lv", {}).get(k, 1)) if x.get("lv") is Dictionary else 1, 1, 5)
		out.append({"id": k, "lv": lv, "f": H[k], "main": k == x.get("main")})
	return out

## 某项特殊效果的当前值：v3n 里数组按层取、per 按层乘、t3/t5 到层才有
static func hv(u: Dictionary, key: String) -> float:
	var v := 0.0
	for h in u.get("hearts", []):
		var n: Dictionary = h.f.get("v3n", {})
		var lv: int = h.lv
		if n.get(key) is Array and n[key].size(): v += float(n[key][mini(lv, n[key].size()) - 1])
		elif n.get(key) is float or n.get(key) is int: v += float(n[key])
		if n.get("per", {}).get(key) != null: v += float(n.per[key]) * lv
		# 五层效果同名时取代三层（担雪诀：三层战后回 10%，五层回 20%）
		var t5: Dictionary = n.get("t5", {}).merged(h.f.get("t5", {}))
		var t3: Dictionary = n.get("t3", {}).merged(h.f.get("t3", {}))
		if lv >= 5 and t5.get(key) != null: v += float(t5[key])
		elif lv >= 3 and t3.get(key) != null: v += float(t3[key])
	return v

## 某门内功的层数（没修为 0）
static func heart_lv(u: Dictionary, id: String) -> int:
	for h in u.get("hearts", []):
		if h.id == id: return h.lv
	return 0

## 主修内功带的主动招（寄傲、存烬、守烛）加进武学列表
static func _attach_hearts(u: Dictionary, rec) -> void:
	u.hearts = hearts_of(rec); u.cd = {}
	for h in u.hearts:
		var a = h.f.get("active")
		if h.main and a is Dictionary and a.get("skill") and has_skill(a.skill) and not u.skills.has(a.skill): u.skills.append(a.skill)

## 主角已装配的武学（menu.js mkHero：S.load 过滤；qihe-ui-model.js 覆盖为 S.skills 中除 fist 外全部）
static func _hero_skills(S: Dictionary) -> Array:
	var out := []
	for k in S.get("skills", {}):
		if k != "fist" and has_skill(k): out.append(k)
	return out

## menu.js mkHero（经 qihe-ui-model.js 覆盖：武学取 S.skills 的键）
static func mk_hero() -> Dictionary:
	var S: Dictionary = G.S
	var u := stat_unit({"st": S.st, "lv": S.lv, "weapon": S.get("weapon"), "armor": S.get("armor"), "atkBonus": S.get("atkBonus", 0), "mpBonus": S.get("mpBonus", 0), "conditions": S.get("conditions", []), "name": S.name}, "ally")
	var d := derived({"st": S.st, "lv": S.lv, "weapon": S.get("weapon"), "armor": S.get("armor"), "acc": S.get("acc"), "atkBonus": S.get("atkBonus", 0), "mpBonus": S.get("mpBonus", 0), "conditions": S.get("conditions", [])})
	for k in ["mhp", "mmp", "atk", "def", "spd", "crit", "dodge", "block"]: u[k] = d[k]
	u.hp = clampi(int(S.get("hp", 1)), 1, u.mhp)
	u.mp = clampi(int(S.get("mp", 0)), 0, u.mmp)
	u.isHero = true
	u.art = "hero"
	u.por = "hero"
	var w = item(S.get("weapon")).get("weapon")
	u.atkType = weapon_type(w.kind) if w else "拳"
	u.atkName = item(S.weapon).name if w else "拳脚"
	u.skills = _hero_skills(S)
	u.skLv = S.get("skills", {}).duplicate()
	u.mw = "hero"
	_attach_hearts(u, S)
	return u

## menu.js mkAlly：有 S.mates 记录用其加点/等级/装备/持久气血，否则用 PARTY_DEF（叶蘅 3 级）
static func mk_ally(key: String):
	var P = DB.PARTY_DEF.get(key)
	if P == null: return null
	var S: Dictionary = G.S
	var m = S.get("mates", {}).get(key) if S.get("mates") else null
	var u: Dictionary
	if m == null:
		u = stat_unit({"name": P.name, "st": P.st, "lv": maxi(1, 3 if key == "ye" else int(P.get("initialLevel", 1)))}, "ally")
		u.hp = u.mhp; u.mp = u.mmp
		u.atkType = P.atkType; u.atkName = P.atkName
		u.skills = P.skills.duplicate(); u.skLv = {}
	else:
		var eq: Dictionary = m.get("equip", {})
		u = stat_unit({"name": P.name, "st": m.st, "conditions": m.get("conditions", []), "lv": maxi(1, int(m.get("lv", 1)))}, "ally")
		var d := derived({"st": m.st, "lv": maxi(1, int(m.get("lv", 1))), "weapon": eq.get("weapon"), "armor": eq.get("armor"), "acc": eq.get("acc"), "mpBonus": m.get("mpBonus", 0), "conditions": m.get("conditions", [])})
		for k in ["mhp", "mmp", "atk", "def", "spd", "crit", "dodge", "block"]: u[k] = d[k]
		u.hp = u.mhp if m.get("hp") == null else clampi(int(m.hp), 1, u.mhp)
		u.mp = u.mmp if m.get("mp") == null else clampi(int(m.mp), 0, u.mmp)
		var w = item(eq.get("weapon")).get("weapon")
		u.atkType = weapon_type(w.kind) if w else P.atkType
		u.atkName = item(eq.weapon).name if w else P.atkName
		u.skills = []
		for k in m.get("skills", {}):
			if k != "fist" and has_skill(k): u.skills.append(k)
		u.skLv = m.get("skills", {}).duplicate()
		u.mw = key
	u.art = P.art[0]
	u.por = P.por[0]
	u.key = key
	if not u.has("hearts"): _attach_hearts(u, m)
	return u

## battle.js mkFoe：hpMul 缺省 .45、×1.8；atkMul 缺省 .62；盾/弱点取模板或 FOE_DEF
static func mk_foe(t: Dictionary, _i := 0) -> Dictionary:
	var k := str(t.get("sp", "")).trim_prefix("c_")
	var D: Dictionary = defs().FOE_DEF.get(k, {})
	var u := stat_unit(t, "foe")
	u.mhp = roundi(u.mhp * float(t.get("hpMul", 0.45) if t.get("hpMul") else 0.45) * 1.8)
	u.hp = u.mhp
	u.atk = roundi(u.atk * float(t.get("atkMul", 0.62) if t.get("atkMul") != null else 0.62))
	u.art = k
	u.key = k
	u.maxShield = int(t.get("shield")) if t.get("shield") else int(D.get("shield", 3))
	u.shield = u.maxShield
	u.weak = (t.get("weak") if t.get("weak") != null else D.get("weak", ["拳", "刀"])).duplicate()
	u.known = {}
	u.skills = []
	for s in t.get("skills", {"blade": 1}):
		if has_skill(s): u.skills.append(s)
	u.drops = t.get("drops") if t.get("drops") != null else D.get("drops", {})
	u.exp = int(t.get("exp")) if t.get("exp") != null else int(u.lv) * 20
	u.silver = int(t.get("silver", 0))
	u.bossy = preload("res://scripts/npc/util.gd").t(t.get("boss", false)) or k == "chief"
	u.h = int(t.get("h", 160)) if t.get("h") else 160
	return u

## qihe-ui-model.js skillCost（心法与熟练度对内力的修正属于培养系统，这里取 SKILLS.mp）
static func skill_cost(_u: Dictionary, k) -> int:
	return int(skill(k).get("mp", 0))

## qihe-ui-model.js skillWhy：未学 / 兵器不符 / 属性门槛 / 内力不足
static func skill_why(u: Dictionary, k) -> String:
	var sk := skill(k)
	if sk.is_empty() or not u.get("skills", []).has(k): return "尚未习得"
	if sk.get("needWeapon") and weapon_type(u.get("atkType")) != weapon_type(sk.needWeapon): return "需装备" + sk.needWeapon
	if u.get("mw"):
		var S: Dictionary = G.S
		var rec = S if u.mw == "hero" else S.get("mates", {}).get(u.mw)
		if rec != null:
			var eq: Dictionary = rec if u.mw == "hero" else rec.get("equip", {})
			var d := derived({"st": rec.st, "lv": rec.get("lv", 1), "weapon": eq.get("weapon"), "armor": eq.get("armor"), "acc": eq.get("acc")})
			var statn = DB.g("STATN")
			for a in sk.get("req", {}):
				if d.st.get(a, 0) < sk.req[a]: return "需" + str(statn.get(a, a) if statn else a) + " " + str(sk.req[a])
	# 原版 battleWhy：防御强化不能主动用；冷却；绝招要 3 点蓄势、用后下一次行动须调息
	if lib_move(k) and bsk(k).get("def"): return "装配后选择防御时自动触发"
	if int(u.get("cd", {}).get(k, 0)) > 0: return "调息中（还要 %d 次行动）" % int(u.cd[k])
	if lib_move(k) and bsk(k).get("ult"):
		if int(u.get("cuUltRest", 0)) > 0: return "本次行动须先调息"
		var use := 0
		var bt = Battle if Engine.get_main_loop() else null
		if bt != null and bt.B != null and is_same(bt.B.get("cur"), u): use = int(bt.B.get("bpUse", 0))
		if int(u.get("bp", 0)) + use < 3: return "绝招需要3点蓄势"
	if u.mp < skill_cost(u, k): return "内力不足"
	return ""

## qihe-ui-model.js skillEffects（CultivationBalance 无 skillEffects 时的回退公式）
static func skill_effects(u: Dictionary, k, bp := 0) -> Dictionary:
	if lib_move(k):
		# 原版 CultivationBalance.skillEffects（qh-mode-cultivation-martial.js）：按蓄势档取 [总威力, 段数, 削盾, …]，威力按段数平分
		var b: Dictionary = bsk(k)
		var v := clampi(int(bp), 0, 3)
		var row = b.get("bp", [])[v] if b.get("bp") is Array and v < b.bp.size() else null
		var r: Array = row if row is Array else [0, 0, 0, 1]
		var lm := 1.0 + 0.15 * (int(u.get("skLv", {}).get(k, 1)) - 1)
		return {"bp": v, "t": b.get("t"), "e": b.get("e"), "power": float(r[0]) * lm / maxf(1.0, float(r[1])), "hits": int(r[1]), "shield": r[2], "restricted": row == null, "multiplier": lm, "heal": null, "duration": null}
	var sk := skill(k)
	var bi := bsk(k)
	var lvM := 1.0 + 0.15 * (int(u.get("skLv", {}).get(k, 1)) - 1)
	var v := clampi(int(bp), 0, 3)
	var hits0 := int(bi.get("hits", 0))
	return {"bp": v, "t": bi.get("t"), "e": bi.get("e"),
		"power": float(sk.get("pow", 1) if sk.get("pow") else 1) * lvM * (1.0 / sqrt(hits0) if hits0 else 1.0) * (1.0 if hits0 else 1.0 + v * 0.8),
		"hits": (hits0 if hits0 else 1) + (v if hits0 else 0),
		"heal": float(sk.heal) * lvM * (1 + v * 0.5) if sk.get("heal") else null,
		"duration": 2 + v if bi.get("buff") else null}

## battle.js skillPv：治疗/增益返回 null
static func skill_pv(u: Dictionary, k, bp: int):
	var sk := skill(k)
	if sk.get("heal") or bsk(k).get("buff") or bsk(k).get("heart") or support(k): return null
	var e := skill_effects(u, k, bp)
	return {"t": e.t, "e": e.e, "hits": e.hits, "pow": e.power}

## battle.js hitsWeak：命中且已揭示的弱点
## 人形对手按兵器定弱点（2026-11-10 敌人弱点正式设计，docs/design/enemy-weakness.md 第三节）：
## 用刀的怕棍和暗器，用剑的怕拳和棍，用棍的怕刀和暗器，空手的怕刀和剑
const WEAK_BY_WEAPON := {"刀": ["棍", "暗器"], "剑": ["拳", "棍"], "棍": ["刀", "暗器"], "拳": ["刀", "剑"], "掌": ["刀", "剑"]}
static func weak_by_weapon(kind: String) -> Array:
	return (WEAK_BY_WEAPON.get(kind, WEAK_BY_WEAPON["刀"]) as Array).duplicate()

static func hits_weak(t: Dictionary, v) -> bool:
	if v == null or not t.has("weak"): return false
	for w in [v.get("t"), v.get("e")]:
		if w and t.weak.has(w) and t.known.has(w): return true
	return false

## battle.js estDmg：与 strike 同公式，不含暴击与浮动
static func est_dmg(u: Dictionary, t: Dictionary, v) -> int:
	if v == null: return 0
	var d: float = u.atk * v.pow * (1.3 if u.buffs.get("ding") else 1.0) - t.def * 0.5
	if hits_weak(t, v): d *= 1.25
	if t.get("broken"): d *= 2
	return maxi(1, roundi(d))

## core.js settleCharacterLevels：每层需 lv*100 修为，升层属性点 +3、气血内力回满
static func settle_levels(s: Dictionary, id: String) -> Array:
	var levels := []
	s.lv = clampi(int(s.get("lv", 1)), 1, CHARACTER_LEVEL_CAP)
	while s.lv < CHARACTER_LEVEL_CAP and s.get("exp", 0) >= s.lv * 100:
		s.exp -= s.lv * 100; s.lv += 1; s.pts = int(s.get("pts", 0)) + 3
		var eq: Dictionary = s if id == "hero" else s.get("equip", {})
		var d := derived({"st": s.st, "lv": s.lv, "weapon": eq.get("weapon"), "armor": eq.get("armor"), "acc": eq.get("acc"), "mpBonus": s.get("mpBonus", 0), "atkBonus": s.get("atkBonus", 0) if id == "hero" else 0, "conditions": s.get("conditions", [])})
		s.hp = d.mhp; s.mp = d.mmp
		levels.append(s.lv)
	if s.lv >= CHARACTER_LEVEL_CAP: s.exp = 0
	return levels

## character-growth-state.js CharacterGrowth.awardBattle
static func award_battle(world: Dictionary, base: float, ids: Array) -> Dictionary:
	var mates: Dictionary = world.get("mates", {})
	var parts := []
	for id in ids:
		if id == null or parts.has(id): continue
		if mates.has(id) and not ["dog", "pei", "peizhigu"].has(id) and mates[id].get("growthMode") != "witness": parts.append(id)
	var before := int(world.lv)
	var report := {"hero": null, "mates": []}
	for id in ["hero"] + parts:
		var r: Dictionary = world if id == "hero" else mates[id]
		if id != "hero":
			r.lv = maxi(3 if id == "ye" else 1, int(r.get("lv", 1)))
			r.exp = maxi(0, int(r.get("exp", 0)))
		var lv_of := int(r.lv)
		var factor := 1.2 if id == "hero" or before - lv_of >= 5 else 1.0
		var row: Dictionary
		if r.lv >= CHARACTER_LEVEL_CAP:
			r.exp = 0; r.xpFraction = 0
			row = {"id": id, "amount": 0, "factor": factor, "levels": []}
		else:
			var raw: float = base * factor + float(r.get("xpFraction", 0))
			var amount := floori(raw + 1e-9)
			r.xpFraction = maxf(0.0, raw - amount)
			r.exp = int(r.get("exp", 0)) + amount
			var levels := settle_levels(r, id)
			if r.lv >= CHARACTER_LEVEL_CAP: r.xpFraction = 0
			row = {"id": id, "amount": amount, "factor": factor, "levels": levels}
		if id == "hero": report.hero = row
		else: report.mates.append(row)
	return report

# ───────── qihe-acc-fx.js QiheAccFx（物品 func 字段：兵器、佩饰两格相加）─────────
static func acc_of(w: String) -> Dictionary:
	var S: Dictionary = G.S if G.S != null else {}
	var eq: Dictionary = S if w == "hero" else S.get("mates", {}).get(w, {}).get("equip", {})
	var o := {}
	for k in [eq.get("weapon"), eq.get("acc")]:
		var f: Dictionary = item(k).get("func", {})
		for n in f: o[n] = o.get(n, 0) + f[n]
	return o
static func acc_team(key: String) -> float:
	var S: Dictionary = G.S if G.S != null else {}
	var m := 0.0
	for w in ["hero"] + Array(S.get("party", [])):
		m = maxf(m, float(acc_of(str(w)).get(key, 0)))
	return m
static func acc_silver(n: int) -> int: return roundi(n * (1 + acc_team("silver"))) if n > 0 else n
static func acc_drop(p: float) -> float: return minf(100, p * (1 + acc_team("drop")))
static func acc_heal(w: String, n: int) -> int: return roundi(n * (1 + float(acc_of(w).get("heal", 0)))) if n > 0 else n
static func acc_skill_heal(w: String, n: int) -> int: return roundi(n * (1 + float(acc_of(w).get("skillHeal", 0)))) if n > 0 else n
