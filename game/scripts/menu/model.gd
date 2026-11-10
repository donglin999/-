class_name QJModel
extends RefCounted
## 江湖菜单的数据权威（对应原版 js/qihe-ui-model.js，window.QiheUIModel）。
## 原则照原版：界面只读快照；所有改档都走 command()；预览绝不改 G.S，都在 normalize(G.S) 的深拷贝上算。
## 规则层常量与小函数对应 js/menu.js 的 MN_* / mn*（mnSlot、mnFx、mnDef、mnQ、mnHuo、mnLvM、mnProfNeed、mnZyUp……）。
## 培养模式（CultivationBalance / CultivationCore / GuiyunHero）相关分支在栖河试玩前段不会走到，这里按“未开培养”处理。

const NAMES := {"weapon": "兵器", "armor": "护具", "acc": "佩饰"}
const KEYS := ["str", "con", "agi", "wil", "wis"]
const MN_DK := ["atk", "def", "mhp", "mmp", "crit", "dodge", "spd", "block"]
const MN_FXN := {"block": "格挡", "atk": "攻击", "def": "防御", "crit": "暴击", "dodge": "闪避", "mhp": "气血", "mmp": "内力", "spd": "身速", "str": "臂力", "con": "根骨", "agi": "身法", "wil": "定力", "wis": "悟性"}
const MN_PCT := {"crit": 1, "dodge": 1, "block": 1}
const MN_ZY := ["刀", "剑", "拳", "棍", "暗器", "音律"]
const MN_ZY0 := {"orphan": {"拳": 5}, "beggar": {"拳": 10}, "shepherd": {"棍": 10}, "suzhi": {"暗器": 30}, "dog": {"刀": 20}}
const MN_JI0 := {"orphan": {"shi": 10}, "suzhi": {"yi": 40, "du": 15, "shi": 10}}
const MN_JI := {"yi": "医术", "du": "毒术", "shi": "武学常识"}
const MN_Q := [["丁级", "#6f6250"], ["丙级", "#2f6b45"], ["乙级", "#2d5a86"], ["甲级", "#6b3d8a"], ["绝级", "#b3561e"]]
const MN_SECT := {"yuquan": "玉泉寺", "gaibang": "丐帮", "lumen": "鹿门书院", "taihe": "太和观", "yiyong": "京湖义勇", "chuanbang": "汉江船帮", "baixian": "白鹇谷", "guiyun": "归云谷"}
const MN_XF_EB := 0.03
const MN_XF_SWAP := 3
const MN_KCOL := {"拳": "#b8612c", "掌": "#a0522d", "剑": "#2f6f8f", "刀": "#6b6356", "棍": "#8a6a3a", "鞭": "#7a5a2a", "腿": "#9a4a2a", "暗器": "#4f5f78", "内": "#3a4f8a", "医": "#2f6b45", "咬": "#6b4a3a"}
const FIELD_MATS := ["qh_dry_branch", "qh_wild_herb", "qh_river_reed"]

static var _xinfa := {}
static var _pet := {}
static var _grades := {}
static var writing := false

# ───────── 数据表 ─────────
static func _json(path: String):
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null: return {}
	var d = JSON.parse_string(f.get_as_text())
	return d if d != null else {}

static func XINFA() -> Dictionary:
	if _xinfa.is_empty():
		_xinfa = _json("res://data/menu/xinfa.json")
		# 2026-11-06：培养模式学会的内功（归云谷、师承、秘籍）也要在江湖菜单里认得，否则只显示编号、不能设主修
		var lib = DB.g("CultivationLibrary")
		if lib is Dictionary and lib.get("hearts") is Dictionary:
			for k in lib.hearts:
				if not _xinfa.has(k): _xinfa[k] = lib.hearts[k]
	return _xinfa

static func PET_DEF() -> Dictionary:
	if _pet.is_empty(): _pet = _json("res://data/menu/pet_def.json")
	return _pet

## qihe-grades.js：武学品阶与改写后的说明
static func grades() -> Dictionary:
	if _grades.is_empty(): _grades = _json("res://data/menu/grades.json")
	return _grades

static func skill_grade(k: String) -> String:
	var g: Dictionary = grades().get("skills", {})
	for gr in g:
		if (g[gr] as Array).has(k): return gr
	return ""

static func skill_desc(k: String) -> String:
	var d: Dictionary = grades().get("desc", {})
	if d.has(k): return d[k]
	return str(DB.SKILLS.get(k, {}).get("desc", ""))

static func copy(x):
	return x.duplicate(true) if (x is Dictionary or x is Array) else x

static func human(id: String) -> bool:
	return id == "hero" or (DB.PARTY_DEF.has(id) and not PET_DEF().has(id))

static func rec(s: Dictionary, id: String):
	return s if id == "hero" else s.get("mates", {}).get(id)

static func eq(s: Dictionary, id: String):
	return s if id == "hero" else rec(s, id).get("equip", {})

static func num(v, d := 0) -> int:
	return int(v) if v != null and typeof(v) in [TYPE_INT, TYPE_FLOAT] else d

# ───────── menu.js 规则层 ─────────
## mnDef：成员规则（MN_MEM）
static func mn_def(w: String) -> Dictionary:
	var m = DB.g("MN_MEM")
	if m != null and m.has(w): return m[w]
	return {"wk": null, "slots": ["weapon", "armor", "acc"], "learn": [], "role": "同伴"}

## mnSlot
static func mn_slot(k) -> String:
	if k == null: return ""
	var it = DB.ITEMS.get(k)
	if it == null: return ""
	if it.get("weapon"): return "weapon"
	if it.get("acc"): return "acc"
	if typeof(it.get("armor")) in [TYPE_INT, TYPE_FLOAT]: return "armor"
	return ""

## mnQ：装备品质（名称、颜色）
static func mn_q(k) -> Array:
	var q := num(DB.ITEMS.get(k, {}).get("q"), 0)
	return MN_Q[clampi(q, 0, MN_Q.size() - 1)]

## mnHuo：重数火候（at5/at10）
static func mn_huo(k: String, n: int) -> Dictionary:
	var sk: Dictionary = DB.SKILLS.get(k, {})
	var o := {"mp": 0.0, "pow": 0.0, "reveal": 0.0}
	for pair in [["at5", 5], ["at10", 10]]:
		if n >= pair[1] and sk.get(pair[0]):
			for x in o: o[x] += float(sk[pair[0]].get(x, 0))
	return o

static func mn_lv_m(n: int) -> float:
	return 1.0 + 0.15 * mini(n - 1, 3) + 0.08 * maxi(0, n - 4)

static func mn_prof_need(n: int, _k := "") -> int:
	return 6 * n * n

static func mn_zy_up(n: int) -> int:
	return 6 * (n - 1)

static func stat_name(a: String) -> String:
	var st = DB.g("STATN")
	return str(st.get(a, a)) if st else a

# ───────── normalize：规范化深拷贝（qihe-ui-model.js normalize） ─────────
static func normalize(source: Dictionary) -> Dictionary:
	var s: Dictionary = copy(source)
	if s.get("party") == null: s.party = []
	if s.get("mates") == null: s.mates = {}
	if s.get("bag") == null: s.bag = {}
	if s.get("skills") == null: s.skills = {"fist": 1}
	if not s.get("pts"): s.pts = 0
	var old = s.get("qiheRoster")
	var all: Array = ["hero"]
	for id in (old.get("members", []) if old else []) + s.party:
		if not all.has(id): all.append(id)
	var c = s.get("qiheChapter")
	if c and c.get("stage") != "opening" and not all.has("ye"): all.append("ye")
	s.qiheRoster = {"version": 1, "members": all, "availability": (old.get("availability", {}) if old else {}).duplicate(),
		"revision": num(old.get("revision") if old else 0), "commands": (old.get("commands", []) if old else []).duplicate()}
	if not old and s.party.has("dog") and not s.get("pet"): s.pet = "dog"
	_normalize_pet(s)
	var party := []
	for id in s.party:
		if human(id) and id != "hero" and str(s.qiheRoster.availability.get(id, "present")) == "present" and not party.has(id): party.append(id)
	s.party = party.slice(0, 3)
	if c and c.get("stage") != "opening" and not old and not s.party.has("ye") and s.party.size() < 3: s.party.append("ye")
	if c and c.get("stage") == "cultivation":
		s.chapter = maxi(2, num(s.get("chapter"), 1))
		if not s.get("sect"): s.sect = "guiyun"
	for id in all:
		if not human(id): continue
		if id != "hero" and not s.mates.has(id):
			var p: Dictionary = DB.PARTY_DEF[id]
			var sk := {}
			for k in p.get("skills", []): sk[k] = 1
			s.mates[id] = {"st": p.st.duplicate(), "pts": 0, "lv": 3 if id == "ye" else num(p.get("initialLevel"), 1), "exp": 0, "lvSeen": 1,
				"equip": {"weapon": null, "armor": null, "acc": null}, "skills": sk, "hp": null, "mp": null, "mpBonus": 0}
		var r: Dictionary = rec(s, id)
		if id != "hero" and r.get("equip") == null: r.equip = {"weapon": null, "armor": null, "acc": null}
		if r.get("st") == null: r.st = {"str": 3, "con": 3, "agi": 3, "wil": 3, "wis": 3}
		if r.get("skills") == null: r.skills = {}
		if r.get("prof") == null: r.prof = {}
		if not r.get("pts"): r.pts = 0
		var origin: String = str(s.get("origin", "")) if id == "hero" else id
		if r.get("zy") == null:
			r.zy = {}
			for k in MN_ZY: r.zy[k] = num(MN_ZY0.get(origin, {}).get(k), 0)
		if r.get("ji") == null:
			r.ji = {"yi": 0, "du": 0, "shi": 0}
			r.ji.merge(MN_JI0.get(origin, {}), true)
		if r.get("xinfa") == null: r.xinfa = {}
		var x: Dictionary = r.xinfa
		if not x.get("main"): x.main = null
		if x.get("subs") == null: x.subs = []
		if x.get("known") == null: x.known = []
		if x.get("lv") == null: x.lv = {}
		if x.get("prog") == null: x.prog = {}
		if not x.get("unstable"): x.unstable = 0
		if num(s.get("chapter"), 1) >= 2 and not mn_def(id).get("noXf") and not (id == "hero" and not _learned_breathing(s)):
			for k in ["tuna"] + (["bx_xin"] if id == "suzhi" else []):
				if not x.known.has(k): x.known.append(k)
				if not x.lv.get(k): x.lv[k] = 1
			if not x.main: x.main = "bx_xin" if id == "suzhi" else "tuna"
	insight_sync(s)
	if s.get("virtue") == null: s.virtue = {"ren": num(s.get("moral"), 10) - 10, "yi": 0, "xin": 0, "yong": 0}
	return s

static func _learned_breathing(s: Dictionary) -> bool:
	var c = s.get("cultivation")
	# 原版 JS 只看真假（learned.breathing 存的可能是记录而不是 true）；GDScript 的 bool() 不收字典和 null，会报错中断菜单
	if not (c is Dictionary) or not (c.get("learned") is Dictionary): return false
	return preload("res://scripts/npc/util.gd").t(c.learned.get("breathing"))

static func _normalize_pet(s: Dictionary) -> void:
	var pk = s.get("pet")
	if pk == null or not PET_DEF().has(pk): return
	if s.get("pets") == null: s.pets = {}
	var prior = s.mates.get(pk)
	var def: Dictionary = DB.PARTY_DEF.get(pk, {})
	if not s.pets.has(pk):
		s.pets[pk] = {"st": (prior.st if prior else def.get("st", {})).duplicate(), "lvSeen": num(prior.get("lvSeen") if prior else 1, 1),
			"hp": prior.get("hp") if prior else null, "mp": prior.get("mp") if prior else null,
			"equip": {"acc": prior.get("equip", {}).get("acc") if prior else null}}
	var p: Dictionary = s.pets[pk]
	var lv := num(s.get("lv"), 1)
	var gained := maxi(0, lv - num(p.get("lvSeen"), 1))
	var points := num(prior.get("pts") if prior else 0) + gained * 3
	var growth: Array = PET_DEF()[pk].growth
	for i in points:
		var g: String = growth[i % growth.size()]
		p.st[g] = num(p.st.get(g)) + 1
	p.lvSeen = maxi(num(p.get("lvSeen"), 1), lv)
	if gained:
		p.hp = null; p.mp = null
	s.mates.erase(pk)

# ───────── 在场与派生属性 ─────────
static func availability(s: Dictionary, id: String) -> String:
	return str(s.qiheRoster.availability.get(id, "present"))

static func available(s: Dictionary, id: String) -> bool:
	return human(id) and s.qiheRoster.members.has(id) and availability(s, id) == "present"

static func level_of(s: Dictionary, id: String) -> int:
	return maxi(1, num(s.get("lv") if id == "hero" else rec(s, id).get("lv"), 1))

## calc：派生属性（装备词条 + 五维公式 + 心法 + CharacterCondition）
static func calc(s: Dictionary, id: String) -> Dictionary:
	var r: Dictionary = rec(s, id)
	var e: Dictionary = eq(s, id)
	var b := {}
	for k in [e.get("weapon"), e.get("armor"), e.get("acc")]:
		var fx := Stats.item_fx(k)
		for a in fx: b[a] = b.get(a, 0) + fx[a]
	var st := {}
	for k in KEYS: st[k] = num(r.st.get(k)) + num(b.get(k))
	var lv := level_of(s, id)
	var d := {"mhp": 60 + st.con * 14 + lv * 12 + num(b.get("mhp")),
		"mmp": 30 + st.wil * 7 + st.wis * 2 + lv * 5 + num(r.get("mpBonus")) + num(b.get("mmp")),
		"atk": 8 + st.str * 3 + lv * 2 + num(b.get("atk")) + (num(s.get("atkBonus")) if id == "hero" else 0),
		"def": st.con + st.wil * 2 + num(b.get("def")), "spd": st.agi + num(b.get("spd")),
		"crit": 5 + st.wis * 2 + num(b.get("crit")), "dodge": roundi(st.agi * 1.5) + num(b.get("dodge")),
		"block": mini(30, st.con + num(b.get("block"))), "move": 2 + floori(st.agi / 5.0), "st": st}
	var ie := inner_effects(s, id)
	for k in MN_DK:
		if ie.add.get(k) or ie.pct.get(k):
			d[k] = roundi((d[k] + ie.add.get(k, 0)) * (1 + ie.pct.get(k, 0)))
	return Stats.apply_conditions(d, r)

## innerEffects：心法加成
static func inner_effects(s: Dictionary, id: String) -> Dictionary:
	var o := {"add": {}, "pct": {}, "eb": {}, "heal": 0.0}
	var r = rec(s, id)
	var x = r.get("xinfa") if r else null
	if num(s.get("chapter"), 1) < 2 or x == null or mn_def(id).get("noXf"): return o
	var list: Array = [x.get("main")] + x.get("subs", [])
	for k in list:
		if k == null or not XINFA().has(k): continue
		var f: Dictionary = XINFA()[k]
		var n := num(x.lv.get(k), 1)
		var unstable: bool = k == x.main and num(x.get("unstable")) > 0
		var m := 0.5 if unstable else 1.0
		for a in ["add", "pct"]:
			var per: Dictionary = f.get("per", {}).get(a, {})
			for t in per: o[a][t] = o[a].get(t, 0) + float(per[t]) * n * m
		o.heal += float(f.get("per", {}).get("heal", 0)) * n * m
		if k == x.main:
			for el in f.get("e", []): o.eb[el] = o.eb.get(el, 0) + MN_XF_EB * n * m
		if not unstable:
			for pair in [["t3", 3], ["t5", 5]]:
				if n >= pair[1]:
					var add: Dictionary = f.get(pair[0], {}).get("add", {}) if f.get(pair[0]) is Dictionary else {}
					for a in add: o.add[a] = o.add.get(a, 0) + add[a]
	return o

static func health(s: Dictionary, id: String) -> Dictionary:
	var r: Dictionary = rec(s, id)
	var d := calc(s, id)
	return {"hp": d.mhp if r.get("hp") == null else clampi(int(r.hp), 0, d.mhp),
		"mp": d.mmp if r.get("mp") == null else clampi(int(r.mp), 0, d.mmp), "d": d}

static func clamp_health(s: Dictionary, id: String) -> void:
	var h := health(s, id)
	var r: Dictionary = rec(s, id)
	r.hp = h.hp; r.mp = h.mp

# ───────── 人物视图（actor） ─────────
## portrait：小立绘路径（HUD 头像、头像缩略）
static func portrait(id: String) -> String:
	var paths = DB.g("PRODUCTION_ASSET_PATHS")
	if paths == null: paths = {}
	var k: String
	if id == "hero":
		k = "p_" + ("opening_hero_village" if _borrowed() else "opening_hero_modern")
	else:
		var por: Array = DB.PARTY_DEF.get(id, {}).get("por", [])
		k = "p_" + (por[0] if por.size() else id)
	return str(paths.get(k, "assets/" + k + ".webp"))

static func _borrowed() -> bool:
	if not (G.S is Dictionary): return false
	var pr = G.S.get("prologue")
	if not (pr is Dictionary) or not (pr.get("arrival") is Dictionary): return false
	return preload("res://scripts/npc/util.gd").t(pr.arrival.get("borrowed", false))

static func actor_name(s: Dictionary, id: String) -> String:
	return str(s.get("name", "")) if id == "hero" else str(DB.PARTY_DEF.get(id, {}).get("name", id))

static func actor(s: Dictionary, id: String):
	if not human(id) or not s.qiheRoster.members.has(id): return null
	var r: Dictionary = rec(s, id)
	var h := health(s, id)
	var e: Dictionary = eq(s, id)
	var equipment := {}
	for k in NAMES: equipment[k] = e.get(k)
	var wit: Dictionary = DB.ITEMS.get(equipment.weapon, {}) if equipment.weapon != null else {}
	var pd: Dictionary = DB.PARTY_DEF.get(id, {})
	var lv := level_of(s, id)
	var skills := []
	var shi := num(r.ji.get("shi"))
	for k in r.skills:
		if k == "fist" or not DB.SKILLS.has(k): continue
		skills.append(skill_view(s, id, k))
		shi += 5 + 2 * (num(r.skills[k], 1) - 1)
	var ji: Dictionary = r.ji.duplicate(); ji.shi = shi
	var members_h := 0
	for m in s.qiheRoster.members:
		if human(m): members_h += 1
	var aff_sum := 0
	for v in s.get("aff", {}).values(): aff_sum += num(v)
	var virtue: Dictionary = s.virtue.duplicate()
	virtue.yi = num(virtue.get("yi")) + 2 * (members_h - 1) + floori(aff_sum / 3.0)
	var inner: Dictionary = r.xinfa.duplicate(true)
	var cap := 0
	for n in [13, 25, 39]:
		if lv >= n: cap += 1
	inner.capacity = cap
	inner.open = num(s.get("chapter"), 1) >= 2
	return {"id": id, "name": actor_name(s, id), "relationship": null, "training": null,
		"role": "异乡来客" if id == "hero" else str(mn_def(id).get("role", "同伴")), "portrait": portrait(id),
		"active": id == "hero" or s.party.has(id), "available": available(s, id), "availability": availability(s, id),
		"locked": id == "hero", "lockReason": "主角承担当前剧情视点" if id == "hero" else null,
		"stats": r.st.duplicate(), "derived": h.d, "hp": h.hp, "mp": h.mp,
		"basicAttack": {"id": "fist", "name": wit.get("name", pd.get("atkName") if pd.get("atkName") else "拳脚"),
			"kind": wit.get("weapon", {}).get("kind") if wit.get("weapon") else (pd.get("atkType") if pd.get("atkType") else "拳"),
			"description": "基本攻击，不消耗内力；BP每级增加一次攻击。"},
		"conditions": Stats.conditions_of(r), "level": lv, "exp": num(r.get("exp")), "expMax": lv * 100, "points": num(r.get("pts")),
		"equipment": equipment, "skills": skills, "inner": inner, "zy": r.zy, "ji": ji, "virtue": virtue}

## skillMultiplier
static func skill_multiplier(s: Dictionary, id: String, k: String) -> float:
	var r: Dictionary = rec(s, id)
	var sk: Dictionary = DB.SKILLS.get(k, {})
	var n := num(r.skills.get(k), 1)
	var bi := Stats.bsk(k)
	var x := inner_effects(s, id)
	var xing = XINFA().get(r.xinfa.get("main"), {}).get("xing") if num(s.get("chapter"), 1) >= 2 and r.xinfa.get("main") != null else null
	var bonus: float = mn_huo(k, n).pow + float(x.eb.get(bi.get("e"), 0)) + (float(x.heal) if sk.get("heal") else 0.0)
	if (xing == "阳" and bi.get("e") == "阴") or (xing == "阴" and bi.get("e") == "阳"): bonus -= 0.1
	var effective := maxf(0.1, roundf((1 + (mn_lv_m(n) * (1 + bonus) - 1) / 0.15) * 1e4) / 1e4)
	return 1 + 0.15 * (effective - 1)

## skillView：武学卡与详解用
static func skill_view(s: Dictionary, id: String, k: String, bp := 0) -> Dictionary:
	var r: Dictionary = rec(s, id)
	var sk: Dictionary = DB.SKILLS.get(k, {})
	var n := num(r.skills.get(k), 1)
	var mp := maxi(0, num(sk.get("mp")) + int(mn_huo(k, n).mp))
	var d := calc(s, id)
	var e: Dictionary = eq(s, id)
	var wk = DB.ITEMS.get(e.get("weapon"), {}).get("weapon", {}).get("kind") if e.get("weapon") != null and DB.ITEMS.get(e.weapon, {}).get("weapon") else ("拳" if id == "hero" else DB.PARTY_DEF.get(id, {}).get("atkType"))
	var bi := Stats.bsk(k)
	var reason := ""
	if not available(s, id): reason = "角色不在场"
	elif sk.get("needWeapon") and Stats.weapon_type(wk) != Stats.weapon_type(sk.needWeapon): reason = "需装备" + str(sk.needWeapon)
	for a in sk.get("req", {}):
		if num(d.st.get(a)) < num(sk.req[a]): reason = "需" + stat_name(a) + " " + str(sk.req[a])
	if reason == "" and health(s, id).mp < mp: reason = "内力不足"
	var desc := skill_desc(k)
	var mult := skill_multiplier(s, id, k)
	var boost := clampi(bp, 0, 3)
	var description: String
	if sk.get("heal"): description = "恢复目标气血上限的 %d%%" % roundi(float(sk.heal) * mult * (1 + boost * 0.5) * 100)
	elif bi.get("buff"): description = "定神持续 %d 回合" % (2 + boost)
	else:
		var hits := num(bi.get("hits"))
		var pw := float(sk.get("pow", 1) if sk.get("pow") else 1) * mult * (1.0 / sqrt(hits) if hits else 1.0) * (1.0 if hits else 1 + boost * 0.8)
		description = "威力 %.2f · %d 段" % [pw, (hits if hits else 1) + (boost if hits else 0)]
		if k == "qh_hulu_staff": description += "；护身减伤15%，至下次本人行动前"
	var bps := []
	for v in 4: bps.append(Stats.skill_effects({"skLv": {k: 1 + (mult - 1) / 0.15}}, k, v))
	return {"id": k, "bpDescription": description, "name": sk.get("name", k), "kind": sk.get("kind"), "level": n, "grade": skill_grade(k),
		"mp": mp, "description": desc, "desc": desc, "available": reason == "", "reason": reason, "prof": r.prof.get(k, 0),
		"profNeed": mn_prof_need(n, k), "needWeapon": sk.get("needWeapon"), "bp": bps}

# ───────── 物品 ─────────
static func category(k: String) -> String:
	var it = DB.ITEMS.get(k)
	if it == null: return "其他"
	if mn_slot(k) != "": return "装备"
	if it.get("book") or it.get("xfbook") or it.get("manual"): return "秘籍"
	if it.get("heal") or it.get("mp") or it.get("gall"): return "药食"
	if it.get("mat") or FIELD_MATS.has(k): return "材料"
	if it.get("key"): return "要物"
	return "其他"

static func item(s: Dictionary, k: String) -> Dictionary:
	var it = DB.ITEMS.get(k)
	var slot := mn_slot(k)
	return {"id": k, "name": it.get("name", "暂无法识别") if it else "暂无法识别", "desc": it.get("desc", k) if it else k,
		"count": num(s.bag.get(k)), "category": category(k), "grade": mn_q(k)[0] if slot != "" else "", "slot": slot, "known": it != null}

## inventory({category, search, sort})
static func inventory(s: Dictionary, query := {}) -> Array:
	var a := []
	for k in s.bag:
		if num(s.bag[k]) > 0: a.append(item(s, k))
	var c = query.get("category")
	if c and c != "全部":
		a = a.filter(func(i): return i.category == c or NAMES.get(i.slot, "") == c or i.slot == c)
	if query.get("search"):
		var t: String = str(query.search).to_lower()
		a = a.filter(func(i): return (i.name + i.desc).to_lower().contains(t))
	var by_count: bool = query.get("sort") == "count"
	a.sort_custom(func(x, y):
		if by_count and x.count != y.count: return x.count > y.count
		if not by_count and x.name != y.name: return x.name < y.name
		return x.id < y.id)
	return a

static func equip_why(s: Dictionary, id: String, k: String) -> String:
	var it: Dictionary = DB.ITEMS.get(k, {})
	var slot := mn_slot(k)
	var def := mn_def(id)
	if not available(s, id): return "角色不在场"
	if slot == "": return "不可装备"
	if not def.get("slots", []).has(slot): return "无法装备此部位"
	if slot == "weapon" and def.get("wk") != null:
		var wk: Array = def.wk.map(func(t): return Stats.weapon_type(t))
		if not wk.has(Stats.weapon_type(it.weapon.kind)): return "此角色不使" + str(it.weapon.kind)
	for a in it.get("req", {}):
		if num(rec(s, id).st.get(a)) < num(it.req[a]): return "需" + stat_name(a) + " " + str(it.req[a])
	return ""

static func upgrade_why(s: Dictionary, id: String, k: String) -> String:
	var sk = DB.SKILLS.get(k)
	var r: Dictionary = rec(s, id)
	var n := num(r.skills.get(k))
	var cap: int = [0, 4, 6, 7, 8, 9, 10][mini(6, num(s.get("chapter"), 1))]
	if sk == null or not n or k == "fist": return "尚未习得"
	if n >= cap: return "已达本章重数上限"
	var a: String = sk.get("key", "wis") if sk.get("key") else "wis"
	var v := maxi(3, num(sk.get("req", {}).get(a))) + floori(1.5 * n)
	if num(calc(s, id).st.get(a)) < v: return "需" + stat_name(a) + " " + str(v)
	var t = Stats.bsk(k).get("t")
	if MN_ZY.has(t) and num(r.zy.get(t)) < mn_zy_up(n + 1): return "兵刃造诣不足"
	return ""

## inspect：物品对某人物的动作（equip / learnFromItem / useItem）与可否
static func inspect(s: Dictionary, id: String, k: String) -> Dictionary:
	var v := item(s, k)
	var it = DB.ITEMS.get(k)
	var a = actor(s, id)
	if it == null or a == null:
		v.merge({"allowed": false, "reason": "物品或角色不可用", "deltas": [], "learnTargets": [], "action": null, "heal": 0, "mp": 0}, true)
		return v
	var action = null
	var reason := "角色不在场" if not available(s, id) else ("数量不足" if v.count < 1 else "")
	var deltas := []
	var targets := []
	var heal := 0
	var mp := 0
	if v.slot != "":
		action = "equip"
		if reason == "": reason = equip_why(s, id, k)
		var nxt: Dictionary = copy(s)
		var before := calc(s, id)
		eq(nxt, id)[v.slot] = k
		var after := calc(nxt, id)
		for key in MN_DK:
			if after[key] != before[key]:
				deltas.append({"key": key, "name": MN_FXN[key], "before": before[key], "after": after[key], "delta": after[key] - before[key]})
	elif it.get("manual"):
		action = "learnManual"
		if reason == "": reason = manual_why(s, id, k)
	elif it.get("book") or it.get("xfbook"):
		action = "learnFromItem"
		var r: Dictionary = rec(s, id)
		if it.get("book"):
			for sk in r.skills:
				if sk != "fist" and DB.SKILLS.has(sk): targets.append({"id": sk, "name": DB.SKILLS[sk].name, "reason": upgrade_why(s, id, sk)})
		elif num(s.get("chapter"), 1) < 2:
			if reason == "": reason = "入谷培养后开启"
		else:
			for xk in r.xinfa.known:
				targets.append({"id": xk, "name": XINFA().get(xk, {}).get("name", xk), "reason": "已达五层" if num(r.xinfa.lv.get(xk), 1) >= 5 else ""})
		if not targets.any(func(t): return t.reason == "") and reason == "": reason = "暂无可参悟武学"
	elif it.get("heal") or it.get("mp") or it.get("gall"):
		action = "useItem"
		var h := health(s, id)
		var yi := 0
		for w in ["hero"] + s.party:
			var rr = rec(s, w)
			if rr: yi = maxi(yi, num(rr.get("ji", {}).get("yi")))
		heal = mini(h.d.mhp - h.hp, roundi(num(it.get("heal")) * (1 + mini(yi, 200) / 200.0)))
		mp = mini(h.d.mmp - h.mp, num(it.get("mp")))
		if not it.get("gall") and not heal and not mp and reason == "": reason = "气血内力已满"
	elif reason == "":
		reason = "此物品需在剧情或指定地点使用"
	v.merge({"allowed": reason == "", "reason": reason, "action": action, "deltas": deltas, "heal": heal, "mp": mp, "learnTargets": targets}, true)
	return v

## 2026-11-06 开始部分拿到的整本秘籍（物品带 manual＝功法 id）：满足条件就能在背包里参悟，学会后进培养的学艺菜单照书独练；书不消失
static func manual_art(k: String):
	var it = DB.ITEMS.get(k)
	return CuBalance.artById(it.manual) if it is Dictionary and it.get("manual") else null

static func manual_why(s: Dictionary, id: String, k: String) -> String:
	var a = manual_art(k)
	if a == null: return "这本秘籍的功法数据还没登记"
	if id != "hero": return "这本秘籍目前只有萧白能参悟"
	var cs = s.get("cultivation")
	if num(s.get("chapter"), 1) < 2 or not (cs is Dictionary) or not cs.get("joined"): return "入谷培养后才能参悟"
	if cs.get("learned", {}).get(a.key): return "已经参悟过了，去学艺里照书独练"
	var req: Dictionary = a.get("manualReq", {})
	var st: Dictionary = calc(s, "hero").st
	for x in req.get("stats", {}):
		if num(st.get(x)) < int(req.stats[x]): return "需%s %d" % [stat_name(x), int(req.stats[x])]
	if req.get("innerGrade"):
		var ok := false
		for b in CuBalance.arts():
			if b.type == "inner" and b.grade == req.innerGrade and cs.get("learned", {}).get(b.key) and CuBalance.level(cs, b) >= int(req.get("innerLevel", 1)): ok = true
		if not ok: return "需一门%s级内功练到%d层" % [req.innerGrade, int(req.get("innerLevel", 1))]
	return ""

static func learn_manual(s: Dictionary, k: String) -> void:
	var a = manual_art(k)
	var cs: Dictionary = s.cultivation
	cs.learned[a.key] = {"source": "秘籍·" + k, "period": CuDB.period(cs)}
	var mx := CuDB.dict_of(cs, "martialXp")
	mx[a.id] = int(mx.get(a.id, 0))
	if a.type == "inner":
		var x := CuDB.dict_of(s, "xinfa")
		if x.is_empty(): x.merge({"known": [], "lv": {}, "prog": {}, "main": null, "subs": []})
		var known := CuDB.arr_of(x, "known")
		if not a.id in known: known.append(a.id)
		CuDB.dict_of(x, "lv")[a.id] = max(1, num(x.lv.get(a.id), 1))
		CuDB.dict_of(x, "prog")[a.id] = 0
	else:
		var sk := CuDB.dict_of(s, "skills")
		for mv in a.moves: sk[mv.id] = max(1, num(sk.get(mv.id)))

## innerWhy：心法能否运转
static func inner_why(s: Dictionary, id: String, k: String, slot: String) -> String:
	var r: Dictionary = rec(s, id)
	var x: Dictionary = r.xinfa
	var f = XINFA().get(k)
	if num(s.get("chapter"), 1) < 2: return "暂未开放"
	if mn_def(id).get("noXf"): return "此角色不修心法"
	if f == null or not x.known.has(k): return "尚未习得"
	if f.slot != slot: return "心法类型不符"
	if slot == "main" and f.get("sect") and f.sect != (s.get("sect") if id == "hero" else mn_def(id).get("sect")): return "门派不符"
	if slot == "sub":
		var lv := level_of(s, id)
		var cap := 3 if lv >= 39 else (2 if lv >= 25 else (1 if lv >= 13 else 0))
		if not x.subs.has(k) and x.subs.size() >= cap: return "辅修位置尚未开放或已满"
	for a in f.get("req", {}):
		if num(calc(s, id).st.get(a)) < num(f.req[a]): return "根基不足"
	var others: Array = ([] if slot == "main" else [x.main]) + x.subs.filter(func(t): return t != k)
	if f.xing != "中":
		for t in others:
			if t != null and XINFA().has(t) and XINFA()[t].xing != "中" and XINFA()[t].xing != f.xing: return "阴阳相冲"
	return ""

static func inspect_inner(s: Dictionary, id: String, k: String):
	var f = XINFA().get(k)
	if actor(s, id) == null or f == null: return null
	var x: Dictionary = rec(s, id).xinfa
	var mr := inner_why(s, id, k, "main")
	var sr := inner_why(s, id, k, "sub")
	var lv := num(x.lv.get(k), 0)
	return {"id": k, "name": f.name, "grade": f.get("grade", ""), "effects": f.get("per", {}), "slot": f.slot, "progress": x.prog.get(k, 0),
		"progressNeed": 0.8 * maxi(1, lv), "learningHint": "", "unstable": x.unstable, "reason": mr if f.slot == "main" else sr,
		"description": f.get("desc", ""), "type": f.slot, "level": lv, "known": x.known.has(k), "active": x.main == k or x.subs.has(k),
		"xing": f.get("xing"), "canMain": mr == "", "canSub": sr == "", "mainReason": mr, "subReason": sr,
		"swapCost": {"mp": "全部", "unstableBattles": MN_XF_SWAP} if x.main and x.main != k else null,
		"traits": [{"level": 3, "description": f.get("d3", ""), "implemented": true}, {"level": 5, "description": f.get("d5", ""), "implemented": true}]}

## previewStats：加点预览（不改档）
static func preview_stats(s: Dictionary, id: String, delta: Dictionary):
	var before = actor(s, id)
	if before == null: return null
	var r: Dictionary = rec(s, id)
	var cap := 8 + level_of(s, id)
	var spent := 0
	var reason := ""
	for k in delta:
		var v = delta[k]
		if not KEYS.has(k) or typeof(v) != TYPE_INT or v < 0 or num(r.st.get(k)) + v > cap:
			reason = "加点超出上限"; break
		r.st[k] = num(r.st.get(k)) + v
		spent += v
	if spent > num(r.pts): reason = "可分配点数不足"
	return {"allowed": reason == "", "reason": reason, "cap": cap, "spent": spent, "remaining": num(r.pts) - spent,
		"before": before.derived, "after": before.derived if reason != "" else calc(s, id), "stats": before.stats if reason != "" else r.st.duplicate()}

static func pet_view(s: Dictionary):
	if not s.get("pet"): return null
	var p = s.get("pets", {}).get(s.pet)
	if p == null: return null
	var d := Stats.derived({"st": p.st, "lv": s.get("lv", 1), "acc": p.get("equip", {}).get("acc")})
	return {"id": s.pet, "name": DB.PARTY_DEF.get(s.pet, {}).get("name", s.pet), "portrait": "assets/p_" + str(s.pet) + ".webp",
		"hp": d.mhp if p.get("hp") == null else p.hp, "mp": d.mmp if p.get("mp") == null else p.mp, "derived": d,
		"equipment": p.get("equip", {}), "description": "自动参战，固定队尾；主角气血不高于一半时优先护主。"}

# ───────── 共享历练池（js/shared-insight-pool.js） ─────────
const INSIGHT_ITEMS := {"qh_escort_notes": [360, "走镖手札"]}
const INSIGHT_EVENTS := {"rescue": [80, "栖河救援"], "evidence-v2": [80, "邻村对证"], "settle": [40, "归云谷安顿"], "apprenticeship": [100, "正式拜师"]}

static func insight_rewards(s: Dictionary) -> Array:
	var rows := []
	var errands = s.get("prologue", {}).get("errands", {}) if s.get("prologue") is Dictionary else {}
	for pair in [["bowls", "送碗"], ["cloth", "备布"], ["medicine", "送药"]]:
		if errands is Dictionary and errands.get(pair[0]) == "done": rows.append({"id": "errand:" + pair[0], "amount": 20, "name": pair[1]})
	for k in INSIGHT_ITEMS:
		if s.get("itemInsight", {}).get(k) == true: rows.append({"id": "item:" + k, "amount": INSIGHT_ITEMS[k][0], "name": INSIGHT_ITEMS[k][1]})
	var ev = s.get("qiheChapter", {}).get("events", {}) if s.get("qiheChapter") is Dictionary else {}
	for k in INSIGHT_EVENTS:
		if ev is Dictionary and ev.get(k) == true: rows.append({"id": "story:" + k, "amount": INSIGHT_EVENTS[k][0], "name": INSIGHT_EVENTS[k][1]})
	return rows

static func insight_state(s: Dictionary) -> Dictionary:
	if s.get("jianghuInsight") == null:
		s.jianghuInsight = {"version": 1, "balance": 0, "earned": 0, "spent": 0, "receipts": {}, "ledger": []}
	var p: Dictionary = s.jianghuInsight
	for k in ["balance", "earned", "spent"]: p[k] = num(p.get(k))
	return p

static func insight_sync(s: Dictionary) -> Array:
	var p := insight_state(s)
	var grants := []
	for row in insight_rewards(s):
		if not p.receipts.has(row.id):
			p.receipts[row.id] = row.amount
			p.balance += row.amount; p.earned += row.amount
			var l: Dictionary = row.duplicate(); l.kind = "gain"
			p.ledger.append(l); grants.append(row)
	p.ledger = p.ledger.slice(-100)
	return grants

static func insight_debit(s: Dictionary, amount: int, detail: Dictionary) -> String:
	var p := insight_state(s)
	if amount < 1 or amount > p.balance: return "历练不足或消耗不正确"
	p.balance -= amount; p.spent += amount
	var l := {"kind": "spend", "amount": amount}; l.merge(detail)
	p.ledger.append(l); p.ledger = p.ledger.slice(-100)
	return ""

static func level_need(lv: int, exp := 0) -> int:
	if lv >= 100: return 0
	return maxi(0, 50 * (100 * 99 - lv * (lv - 1)) - exp)

static func pool_options(s: Dictionary, id: String) -> Array:
	if not available(s, id): return []
	var r: Dictionary = rec(s, id)
	var out := []
	var seen := {}
	if not ["pei", "peizhigu"].has(id) and r.get("growthMode") != "witness": out.append({"key": "level", "label": "人物等级", "kind": "level"})
	for k in r.skills:
		if k == "fist" or not DB.SKILLS.has(k): continue
		var key: String = "skill:" + k
		if not seen.has(key):
			seen[key] = 1
			var sk: Dictionary = DB.SKILLS[k]
			out.append({"key": key, "label": sk.get("artName") if sk.get("artName") else sk.name, "kind": "skill", "id": k})
	for k in r.xinfa.get("known", []):
		if not XINFA().has(k): continue
		var key: String = "inner:" + k
		if not seen.has(key):
			seen[key] = 1
			out.append({"key": key, "label": XINFA()[k].name, "kind": "inner", "id": k})
	return out

static func pool_training_cost(need: float, request: int, balance: int) -> int:
	var total := ceili(need * 5 - 1e-8)
	var budget := mini(request, balance)
	return total if budget >= total else floori(budget / 5.0) * 5

## poolApply：在 s 上直接执行（预览时传拷贝）；失败返回 {allowed:false, reason}
static func pool_apply(s: Dictionary, id: String, key: String, request) -> Dictionary:
	var fail := func(t): return {"allowed": false, "reason": t}
	if not available(s, id): return fail.call("角色不在场或尚未结伴")
	var option = null
	for o in pool_options(s, id):
		if o.key == key: option = o
	if option == null: return fail.call("尚未习得，或此人物不使用该成长方式")
	if typeof(request) != TYPE_INT or request < 1 or request > 1000000: return fail.call("请输入1至1000000的整数历练")
	var r: Dictionary = rec(s, id)
	var p := insight_state(s)
	var bh := health(s, id)
	var before_stats: Dictionary = bh.d.duplicate()
	var cost := 0
	var before = 0
	var after = 0
	var gain := 0.0
	if option.kind == "level":
		var lv := level_of(s, id)
		var ex := num(r.get("exp"))
		if request < 1: return fail.call("请输入正整数历练")
		cost = mini(request, mini(p.balance, level_need(lv, ex)))
		if not cost: return fail.call("已满级" if lv >= 100 else "历练不足")
		var a := lv
		var remaining := ex + cost
		while a < 100 and remaining >= a * 100:
			remaining -= a * 100; a += 1
		if a == 100: remaining = 0
		before = lv; after = a
		if id == "hero": s.lv = a
		else: r.lv = a
		r.exp = remaining
		r.pts = num(r.get("pts")) + (a - lv) * 3
		if a == 100: r.xpFraction = 0
		gain = cost
	elif option.kind == "skill":
		var k: String = option.id
		var why := upgrade_why(s, id, k)
		if why != "": return fail.call(why)
		before = num(r.skills[k])
		var need := maxf(0, 6 * before * before - float(r.prof.get(k, 0)))
		if not need: return fail.call("熟练已足，请按原突破条件完成进阶")
		cost = pool_training_cost(need, request, p.balance)
		if cost < 1: return fail.call("至少需要5点历练，或结清最后不足1点的熟练")
		gain = minf(need, cost / 5.0)
		r.prof[k] = float(r.prof.get(k, 0)) + gain
		if r.prof[k] >= 6 * before * before:
			r.prof[k] -= 6 * before * before
			r.skills[k] = num(r.skills[k]) + 1
		after = r.skills[k]
	else:
		var k: String = option.id
		var x: Dictionary = r.xinfa
		if num(s.get("chapter"), 1) < 2 or mn_def(id).get("noXf"): return fail.call("尚未开放心法修习")
		before = num(x.lv.get(k), 1)
		if before >= 5: return fail.call("心法已练满")
		var need := maxf(0, (0.8 * before - float(x.prog.get(k, 0))) * 100)
		if not need: return fail.call("已达突破条件")
		cost = pool_training_cost(need, request, p.balance)
		if cost < 1: return fail.call("至少需要5点历练，或结清最后不足1点的熟练")
		gain = minf(need, cost / 5.0)
		x.prog[k] = float(x.prog.get(k, 0)) + gain / 100.0
		if x.prog[k] + 1e-9 >= 0.8 * before:
			x.lv[k] = before + 1; x.prog[k] = 0
		after = x.lv.get(k, before)
	var err := insight_debit(s, cost, {"actor": id, "target": key, "name": option.label})
	if err != "": return fail.call(err)
	var after_stats := calc(s, id)
	r.hp = mini(bh.hp, after_stats.mhp); r.mp = mini(bh.mp, after_stats.mmp)
	return {"allowed": true, "actor": id, "name": actor_name(s, id), "target": key, "label": option.label, "kind": option.kind,
		"cost": cost, "balanceAfter": p.balance, "before": before, "after": after, "gain": gain, "experienceAfter": num(r.get("exp")),
		"beforeStats": before_stats, "afterStats": after_stats}

# ───────── 读接口（QiheUIModel 导出对象） ─────────
static func current() -> Dictionary:
	return normalize(G.S) if G.S is Dictionary else {}

static func snapshot() -> Dictionary:
	var s := current()
	return {"revision": s.qiheRoster.revision, "active": ["hero"] + s.party, "roster": roster_of(s), "pet": s.get("pet"), "chapter": num(s.get("chapter"), 1), "silver": num(s.get("silver"))}

static func roster_of(s: Dictionary) -> Array:
	var out := []
	for id in s.qiheRoster.members:
		if human(id): out.append(actor(s, id))
	return out

static func active() -> Array:
	return ["hero"] + current().party

static func view(id: String):
	return actor(current(), id)

static func insight() -> Dictionary:
	var s := current()
	var p: Dictionary = copy(insight_state(s))
	var actors := []
	for id in s.qiheRoster.members:
		if available(s, id): actors.append({"id": id, "name": actor_name(s, id), "options": pool_options(s, id)})
	p.actors = actors
	return p

static func insight_quote(id: String, key: String, request) -> Dictionary:
	return pool_apply(current(), id, key, request)

static func inspect_skill(id: String, k: String, bp := 0):
	var s := current()
	if actor(s, id) == null or not DB.SKILLS.has(k) or not rec(s, id).skills.get(k): return null
	return skill_view(s, id, k, bp)

# ───────── command：唯一的写入口 ─────────
static func _fail(reason: String) -> Dictionary:
	var rv := 0
	if G.S is Dictionary and G.S.get("qiheRoster") is Dictionary: rv = num(G.S.qiheRoster.get("revision"))
	return {"ok": false, "reason": reason, "revision": rv}

static func command(c: Dictionary) -> Dictionary:
	if writing: return _fail("正在保存，请稍候")
	if not (G.S is Dictionary): return _fail("人物尚未初始化")
	if c.get("cancel"): return _fail("已取消")
	if c.type == "setMute":
		var v: bool = (not Audio.get("muted")) if c.get("value") == null else preload("res://scripts/npc/util.gd").t(c.value)
		if Audio.has_method("set_mute"): Audio.set_mute(v)
		else: return _fail("声音尚未就绪")
		return {"ok": true, "revision": num(G.S.get("qiheRoster", {}).get("revision"))}
	if G.mode == "battle" or Dialog.busy: return _fail("当前剧情或战斗进行中")
	writing = true
	var res := _command(c)
	writing = false
	return res

static func _command(c: Dictionary) -> Dictionary:
	var s := current()
	var q: Dictionary = s.qiheRoster
	if c.get("commandId") and q.commands.has(c.commandId): return {"ok": true, "duplicate": true, "revision": q.revision}
	if c.get("expectedRevision") != null and int(c.expectedRevision) != q.revision: return _fail("状态已变化，请重新确认")
	var id: String = c.get("actorId") if c.get("actorId") else "hero"
	var k = c.get("itemId")
	var needs := ["equip", "unequip", "useItem", "learnFromItem", "learnManual", "allocateStats", "setMainInner", "setSubInner", "spendInsight"]
	if needs.has(c.type) and not available(s, id): return _fail("角色不在场或尚未结伴")
	match c.type:
		"save", "migrate": pass
		"spendInsight":
			var quoted := pool_apply(s, id, str(c.get("target", "")), c.get("amount"))
			if not quoted.allowed: return _fail(quoted.reason)
			if c.get("expectedCost") != null and quoted.cost != int(c.expectedCost): return _fail("实际消耗已变化，请重新预览")
		"applyFormation":
			var ids: Array = c.get("active", [])
			var uniq := {}
			for w in ids: uniq[w] = 1
			if ids.size() < 1 or ids.size() > 4 or uniq.size() != ids.size(): return _fail("出战需为1至4名不同角色")
			if ids[0] != "hero": return _fail("萧白须留在首位承担当前剧情视点")
			for w in ids:
				if not available(s, w): return _fail("角色不在场或尚未结伴：" + str(w))
			s.party = ids.filter(func(w): return w != "hero")
		"equip":
			var v := inspect(s, id, k)
			if v.action != "equip" or not v.allowed: return _fail(v.reason if v.reason != "" else "不可装备")
			var e: Dictionary = eq(s, id)
			if e.get(v.slot): s.bag[e[v.slot]] = num(s.bag.get(e[v.slot])) + 1
			e[v.slot] = k
			s.bag[k] = num(s.bag[k]) - 1
			clamp_health(s, id)
		"unequip":
			var slot = c.get("slot")
			if not NAMES.has(slot): return _fail("未知装备位")
			var e: Dictionary = eq(s, id)
			if not e.get(slot): return _fail("此位置为空")
			s.bag[e[slot]] = num(s.bag.get(e[slot])) + 1
			e[slot] = null
			clamp_health(s, id)
		"useItem":
			var v := inspect(s, id, k)
			if v.action != "useItem" or not v.allowed: return _fail(v.reason if v.reason != "" else "不可使用")
			if c.get("quantity") != null and int(c.quantity) != 1: return _fail("当前每次使用一份")
			var r: Dictionary = rec(s, id)
			var h := health(s, id)
			if DB.ITEMS[k].get("gall"): r.mpBonus = num(r.get("mpBonus")) + 30
			else:
				r.hp = h.hp + v.heal; r.mp = h.mp + v.mp
			s.bag[k] = num(s.bag[k]) - 1
		"learnManual":
			var v := inspect(s, id, k)
			if v.action != "learnManual" or not v.allowed: return _fail(v.reason if v.reason != "" else "现在参悟不了")
			learn_manual(s, k)
		"learnFromItem":
			var v := inspect(s, id, k)
			var tid = c.get("skillId") if c.get("skillId") else c.get("innerId")
			var target = null
			for t in v.learnTargets:
				if t.id == tid: target = t
			if not v.allowed or target == null or target.reason != "":
				return _fail(target.reason if target and target.reason != "" else (v.reason if v.reason != "" else "请选择参悟对象"))
			var r: Dictionary = rec(s, id)
			if DB.ITEMS[k].get("book"): r.skills[target.id] = num(r.skills[target.id]) + 1
			else:
				r.xinfa.lv[target.id] = num(r.xinfa.lv.get(target.id), 1) + 1
				r.xinfa.prog[target.id] = 0
			s.bag[k] = num(s.bag[k]) - 1
		"allocateStats":
			var r: Dictionary = rec(s, id)
			var a: Dictionary = c.get("stats", {})
			var used := 0
			for x in a.values(): used += int(x)
			if not used or used > num(r.pts): return _fail("可分配点数不足")
			for x in a:
				var v = a[x]
				if not KEYS.has(x) or typeof(v) != TYPE_INT or v < 0 or num(r.st.get(x)) + v > 8 + level_of(s, id): return _fail("加点超出上限")
				r.st[x] = num(r.st.get(x)) + v
			r.pts = num(r.pts) - used
			clamp_health(s, id)
		"setMainInner", "setSubInner":
			var slot := "main" if c.type == "setMainInner" else "sub"
			var ik: String = str(c.get("innerId", ""))
			var x: Dictionary = rec(s, id).xinfa
			if slot == "sub" and x.subs.has(ik):
				x.subs.erase(ik); clamp_health(s, id)
			else:
				var why := inner_why(s, id, ik, slot)
				if why != "": return _fail(why)
				if slot == "main":
					if x.main != ik and x.main:
						if not c.get("confirmCost"): return _fail("改修需确认内力清空和气脉不稳")
						rec(s, id).mp = 0; x.unstable = MN_XF_SWAP
					x.main = ik
				else: x.subs.append(ik)
				clamp_health(s, id)
		"feedPet", "equipPet":
			var p = s.get("pets", {}).get(s.get("pet"))
			if p == null: return _fail("尚未结伴宠物")
			var item_id = k if k else "bun"
			if c.type == "feedPet":
				if item_id != "bun" or not num(s.bag.get("bun")) > 0: return _fail("需要馒头")
				var d := Stats.derived({"st": p.st, "lv": s.get("lv", 1), "acc": p.get("equip", {}).get("acc")})
				var cur_hp: int = d.mhp if p.get("hp") == null else int(p.hp)
				if cur_hp >= d.mhp: return _fail("宠物气血已满")
				p.hp = mini(d.mhp, cur_hp + 40)
				s.bag.bun = num(s.bag.bun) - 1
			else:
				if k and k != "collar": return _fail("宠物仅可装备项圈")
				if k and not num(s.bag.get(k)) > 0: return _fail("数量不足")
				if p.get("equip") == null: p.equip = {"acc": null}
				if p.equip.get("acc"): s.bag[p.equip.acc] = num(s.bag.get(p.equip.acc)) + 1
				p.equip.acc = k if k else null
				if k: s.bag[k] = num(s.bag[k]) - 1
		_:
			return _fail("暂未支持此操作")
	q.revision += 1
	if c.get("commandId"):
		q.commands.append(c.commandId)
		q.commands = q.commands.slice(-32)
	_persist(s)
	return {"ok": true, "revision": q.revision}

## persistState：先存盘再替换内存；原地替换 G.S 的内容，保留其他模块持有的引用
static func _persist(s: Dictionary) -> void:
	for k in s.bag.keys():
		if num(s.bag[k]) <= 0: s.bag.erase(k)
	G.S.clear()
	G.S.merge(s, true)
	G.save()
