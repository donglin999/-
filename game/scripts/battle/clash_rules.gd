extends RefCounted
## 领队交锋规则（原版 js/qihe-faction-clash-rules.js，逐函数移植）。只有 NPC，不碰玩家存档、奖励和界面。
## 数据：DB.g("QiheClashData")（profiles / skills / sequence / dialogue / presentation）。
## 与原版的差别：known 用 Dictionary 当集合（与 stats.gd mk_foe 一致）；抛错改为返回 {"err": 文字}。

static func data() -> Dictionary: return DB.g("QiheClashData")

## stats(p)
static func stats(p: Dictionary) -> Dictionary:
	var s: Dictionary = p.st
	var lv := int(p.lv); var wp: Dictionary = p.weapon
	return {"mhp": 60 + int(s.con) * 14 + lv * 12, "mmp": 30 + int(s.wil) * 7 + int(s.wis) * 2 + lv * 5,
		"atk": 8 + int(s.str) * 3 + lv * 2 + int(wp.atk), "def": int(s.con) + int(s.wil) * 2, "spd": int(s.agi),
		"crit": 5 + int(s.wis) * 2 + int(wp.get("crit", 0)), "dodge": roundi(int(s.agi) * 1.5)}

## create()：units 的插入顺序即 profiles 顺序（xu、guard_front、guard_rear、cen、wu、adept）
static func create() -> Dictionary:
	var units := {}
	var D := data()
	for key in D.profiles:
		var p: Dictionary = D.profiles[key]
		var d := stats(p)
		var u := d.duplicate()
		var por = p.get("portrait")
		u.merge({"key": key, "name": p.name, "art": p.art, "por": str(por).trim_prefix("p_") if por != null else null, "side": p.side, "lv": int(p.lv),
			"hp": d.mhp, "mp": d.mmp, "bp": 1, "actionN": 0, "cooldowns": {}, "buffs": {}, "skills": p.skillLevels.keys(), "skLv": p.skillLevels.duplicate(),
			"artLv": p.artLevels.duplicate() if p.get("artLevels") != null else {}, "atkType": p.weapon.kind, "atkName": p.weapon.name,
			"weak": ["剑", "棍"], "maxShield": 4, "shield": 4, "known": {}, "id": units.size() / 10.0 + 0.1, "alpha": 1.0, "bleed": 0,
			"conditions": [], "boosted": false})
		units[key] = u
	return {"units": units, "log": [], "round": 1}

## cost(u,k)
static func cost(u: Dictionary, k: String) -> int:
	var sk = data().skills.get(k)
	if sk == null: return 0
	var c: Dictionary = sk.combat
	var extra := 0
	if int(u.skLv.get(k, 1)) >= 10:
		var mb = c.get("mastery_bonus")
		var bm = mb.get("mp") if mb is Dictionary else null
		extra = int(bm) if bm else (-1 if k in ["am_s1", "am_s2"] else 0)
	return maxi(0, int(c.mp) + extra)

## targets(state,u,skill,primary)
static func targets(state: Dictionary, u: Dictionary, skill: String, primary: Dictionary) -> Array:
	var sk = data().skills.get(skill)
	if sk != null and sk.combat.target == "all_foes":
		var out := []
		for t in state.units.values():
			if t.side != u.side and t.hp > 0: out.append(t)
		return out
	return [primary]

## begin(state,step)：校验并开始一个动作，返回动作对象 a；失败时 {"err": ...}
static func begin(state: Dictionary, step: Dictionary) -> Dictionary:
	var D := data()
	var u = state.units.get(step.actor); var target = state.units.get(step.target); var sk = D.skills.get(step.skill)
	if u == null or target == null or u.hp <= 0 or target.hp <= 0: return {"err": "交锋目标不存在或已离场"}
	var bp := int(step.get("bp", 0)); var nxt: int = u.actionN + 1
	if bp < 0 or bp > 3 or bp > u.bp: return {"err": "蓄势不足"}
	var skill: String = step.skill
	if sk != null:
		if not u.skills.has(skill): return {"err": "未掌握此招"}
		var unlock := int(sk.art_unlock_level) if sk.get("art_unlock_level") else 1
		var al = u.artLv.get(sk.get("system_id", ""))
		if al == null: al = u.skLv.get(skill, 1)
		if int(u.skLv.get(skill, 1)) < unlock or int(al) < unlock: return {"err": "功法重数不足，招式尚未开启"}
		if u.mp < cost(u, skill): return {"err": "内力不足"}
		if nxt < int(u.cooldowns.get(skill, 0)): return {"err": "招式尚在冷却"}
		if skill == "am_s2" and (is_same(target, u) or target.side != u.side or u.get("receivedBPRound") == state.round): return {"err": "不能自赠、赠敌或本回合再转赠"}
		if skill == "am_s1":
			var sp = state.units.get(step.get("support", ""))
			if sp == null or is_same(sp, u) or sp.side != u.side or sp.hp <= 0: return {"err": "缺少另一名受护同伴"}
	elif not skill in ["attack", "defend"]: return {"err": "未知交锋动作"}
	if skill == "defend" and not is_same(target, u): return {"err": "防御只能作用于自己"}
	if not skill in ["am_s2", "defend"] and target.side == u.side: return {"err": "攻击不能指向同伴"}
	var victims := targets(state, u, skill, target)
	if victims.is_empty(): return {"err": "没有合法目标"}
	u.actionN = nxt; u.defend = false
	if u.get("clashExposureUntil") and u.clashExposureUntil <= nxt: u.erase("clashExposure"); u.erase("clashExposureUntil")
	var outgoing_down: float = u.get("clashBlunted", 0.0); u.erase("clashBlunted")
	for t in state.units.values():
		if t.get("clashUnload") != null and t.clashUnload.caster == u.key and t.clashUnload.expires <= nxt: t.erase("clashUnload")
		if t.get("clashFollow") != null and t.clashFollow.expiresRound < state.round: t.erase("clashFollow")
	var mp := cost(u, skill); u.mp -= mp; u.bp -= bp
	if sk != null and sk.combat.get("cooldown_self_actions"): u.cooldowns[skill] = nxt + int(sk.combat.cooldown_self_actions) + 1
	var thp := {}
	for t in victims: thp[t.key] = t.hp
	var record := {"actor": u.key, "skill": skill, "target": target.key, "targets": victims.map(func(t): return t.key), "support": step.get("support"),
		"bp": bp, "mp": mp, "hits": [], "effects": [], "before": {"hp": target.hp, "mp": u.mp, "bp": target.bp, "targetHp": thp}, "applied": false}
	state.log.append(record)
	return {"state": state, "step": step, "u": u, "target": target, "targets": victims, "sk": sk, "bp": bp, "record": record, "outgoingDown": outgoing_down}

## impact(a, rolls)：默认 rolls {hit:.01, crit:.99}（原版交锋演出就用默认值，结果确定：必中、不暴击）
static func impact(a: Dictionary, rolls = {"hit": 0.01, "crit": 0.99, "status": 0.99}) -> Dictionary:
	var r: Dictionary = a.record
	if r.applied: return {"err": "同一动作不可重复结算"}
	r.applied = true
	var state: Dictionary = a.state; var step: Dictionary = a.step; var u: Dictionary = a.u; var target: Dictionary = a.target; var sk = a.sk; var bp: int = a.bp
	var skill: String = step.skill
	if skill == "defend":
		u.defend = true; r.effects.append({"kind": "defend", "unit": u.key}); return r
	if skill == "am_s2":
		var eff := {}
		for x in sk.combat.bp[bp].effects:
			if x.type == "bp_transfer": eff = x; break
		var gain := mini(5 - int(target.bp), int(eff.value))
		target.bp += gain; target.receivedBPRound = state.round
		r.effects.append({"kind": "bp", "unit": target.key, "value": gain}); return r
	var c = sk.combat if sk != null else null
	var level := int(u.skLv.get(skill, 1))
	var n: int = int(c.bp[bp].hits) if c != null else 1 + bp
	var power := 1.0
	if c != null:
		var mb = c.get("mastery_bonus")
		var dmg_b: float = float(mb.damage) if mb is Dictionary and mb.get("damage") else 0.0
		power = float(c.bp[bp].total_power) * (1 + (level - 1) * float(c.mastery_per_level)) * ((1 + dmg_b) if level >= 10 else 1.0)
	var type: String = sk.weapon if sk != null else u.atkType
	var acc: float = float(c.accuracy) if c != null and c.get("accuracy") != null else 1.0
	for t in a.targets:
		if t.hp <= 0: continue
		var mark = t.get("clashFollow")
		var follow: float = float(mark.value) if mark != null and mark.side == u.side and mark.caster != u.key and mark.expiresRound >= state.round else 0.0
		var mark_used := false
		for i in n:
			if t.hp <= 0: break
			var roll: Dictionary = rolls.call(t, i) if rolls is Callable else rolls
			var hit: bool = roll.hit < acc - t.dodge / 100.0
			if not hit:
				r.hits.append({"target": t.key, "damage": 0, "miss": true}); continue
			var weak: bool = t.weak.has(type); var critical: bool = roll.crit < u.crit / 100.0
			var damage: float = maxf(1, u.atk * (power / n if c != null else power) - t.def * 0.5) * (1 - a.outgoingDown)
			if follow:
				damage *= 1 + follow
				if not mark_used:
					t.erase("clashFollow"); mark_used = true; r.effects.append({"kind": "followUsed", "unit": t.key, "value": follow})
			if weak: damage *= 1.25
			if critical: damage *= 1.5
			if t.get("broken"): damage *= 2
			if t.get("defend"): damage *= 0.5
			if t.get("clashUnload") != null:
				damage *= 1 - float(t.clashUnload.value); t.erase("clashUnload")
			if t.get("clashExposure"):
				damage *= 1 + float(t.clashExposure); t.erase("clashExposure"); t.erase("clashExposureUntil")
			var dmg := maxi(1, roundi(damage)); t.hp = maxi(0, t.hp - dmg)
			if weak and not t.get("broken"):
				t.known[type] = true; t.shield = maxi(0, t.shield - 1)
				if not t.shield: t.broken = true; t.brokenUntil = state.round + 1
			r.hits.append({"target": t.key, "damage": dmg, "weak": weak, "critical": critical, "hp": t.hp})
		var landed := false
		for h in r.hits:
			if h.target == t.key and not h.get("miss"): landed = true
		if skill == "cs_whip_s1" and landed:
			t.clashBlunted = 0.1; r.effects.append({"kind": "blunted", "unit": t.key, "value": 0.1})
		if skill == "am_s3" and landed:
			var value := 0.0
			for e in c.bp[bp].effects:
				if e.type == "next_ally_same_target_damage": value = float(e.value); break
			t.clashFollow = {"value": value, "caster": u.key, "side": u.side, "expiresRound": state.round + 1}
			r.effects.append({"kind": "follow", "unit": t.key, "value": value})
	if skill == "am_s1":
		var other: Dictionary = state.units[step.support]
		other.clashUnload = {"value": 0.1, "caster": u.key, "expires": u.actionN + 1}; r.effects.append({"kind": "unload", "unit": other.key, "value": 0.1})
	if skill == "cs_whip_s2":
		u.clashExposure = 0.1; u.clashExposureUntil = u.actionN + 1; r.effects.append({"kind": "exposure", "unit": u.key, "value": 0.1})
	return r

## simulate()：按 sequence 跑完整段（自检用）
static func simulate() -> Dictionary:
	var s := create()
	for step in data().sequence: impact(begin(s, step))
	return s
