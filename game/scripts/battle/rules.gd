extends RefCounted
## 回合规则与出手结算。
## 对应原版：battle.js（aliveOf/newJit/calcOrder/battleLoop/endCheck/tickBuffs/planIntent/intentLabel/reveal/strike/floatTxt/bigText）、
## bfx.js 覆盖版（foeAct/doAttack/doSkill/hurt/heal/doBreak/boostFx/playAttackPose）、bstage.js（layoutUnits/unitH）。
## 时序（毫秒）、公式、颜色照抄原版。

const Motion := preload("res://scripts/battle/motion.gd")
const Turn := preload("res://scripts/battle/turn.gd")

var bt
var mo: Motion
var turn: Turn

func _init(b) -> void:
	bt = b
	mo = Motion.new(b)
	turn = Turn.new(b)

var B: Dictionary:
	get: return bt.B

static func D() -> Dictionary: return Stats.defs()
static func rnd(a: float, b: float) -> float: return a + randf() * (b - a)
static func ri(a: int, b: int) -> int: return a + randi() % (b - a + 1)
static func chance(p: float) -> bool: return randf() * 100 < p

func alive_of(side := "") -> Array:
	var out := []
	for u in B.units:
		if u.hp > 0 and (side == "" or u.side == side): out.append(u)
	return out

func new_jit() -> void:
	B.jit = {}
	for u in B.units: B.jit[u.id] = rnd(0, 3)

func _ord_key(u) -> float: return (100.0 if u.get("prio") else 0.0) + u.spd + B.jit.get(u.id, 0.0)

func calc_order() -> Array:
	var l := alive_of()
	l.sort_custom(func(a, b): return _ord_key(a) > _ord_key(b))
	return l

# ── 站位（bstage.js layoutUnits）──
func stg_depth(u: Dictionary) -> void:
	var s: Dictionary = D().STG
	u.depth = clampf((u.y - s.Y_BACK) / float(s.Y_FRONT - s.Y_BACK), 0, 1)
	u.dscale = 0.84 + 0.16 * u.depth

func layout_units(allies: Array, foes: Array, opt: Dictionary) -> void:
	var AL: Dictionary = D().AL
	var as_: Array = AL.get(str(mini(4, allies.size())), AL["4"])
	for i in allies.size():
		var s = as_[i] if i < as_.size() else [560 - i * 20, 420]
		allies[i].x = float(s[0]); allies[i].y = float(s[1])
	if opt.get("boss"):
		var rest: Array = D().BOSS_REST
		for i in foes.size():
			if i == 0: foes[i].bossy = true; foes[i].x = 230.0; foes[i].y = 430.0
			else:
				var s = rest[i - 1] if i - 1 < rest.size() else [60 + i * 30, 440]
				foes[i].x = float(s[0]); foes[i].y = float(s[1])
	else:
		var FL: Dictionary = D().FL
		var fs: Array = FL.get(str(mini(5, foes.size())), FL["5"])
		for i in foes.size():
			var s = fs[i] if i < fs.size() else [60 + i * 40, 440]
			foes[i].x = float(s[0]); foes[i].y = float(s[1])
		if foes.size() == 1 and not foes[0].bossy: foes[0].tierHint = "elite"
	for u in allies + foes:
		stg_depth(u); u.bx = u.x; u.stepO = 0.0
	# 开场镜头：先推近敌阵，再拉回全景
	if foes.size():
		var fx := 0.0; var fy := 0.0
		for u in foes: fx += u.x; fy += u.y
		bt.cam.snap()
		bt.cam.focus(fx / foes.size(), fy / foes.size() - 60, 1.22, 0)
		bt.get_tree().create_timer(0.38).timeout.connect(func(): if bt.B != null: bt.cam.reset(1100))

# ── 身高（bstage.js unitH：可见身体高度）──
func unit_h(u: Dictionary) -> float:
	var depth: float = u.get("dscale", 1.0)
	var art: String = u.get("art", "")
	var d := D()
	if d.BATTLE_ADULT.has(art):
		var ratio: float = d.BATTLE_ADULT_RATIO.get(art, 1.0)
		var boss: float = d.BATTLE_BOSS_RATIO.get(art, 1.0) if u.side == "foe" and u.get("bossy") else 1.0
		return d.BATTLE_ADULT_H * ratio * boss * depth
	if art == "chief": return d.BATTLE_ADULT_H * (d.BATTLE_BOSS_RATIO.chief if u.get("bossy") else 1.14) * depth
	if d.BATTLE_BEAST_H.has(art): return d.BATTLE_BEAST_H[art] * depth
	return d.BATTLE_ADULT_H * clampf(u.get("h", 170) / 170.0, 0.8, 1.2) * depth

# ───────── 回合 ─────────
func _lesson():
	return B.opt.get("storyLesson")

func _order_list() -> Array:
	var L = _lesson()
	if L and L.has_order(): return L.order()
	if B.opt.get("training"): return B.allies + B.foes
	return calc_order()

func battle_loop() -> String:
	while true:
		B.round += 1; B.done = []
		for u in B.allies:
			if u.hp > 0:
				if B.round > 1 and not u.boosted: u.bp = mini(5, u.bp + 1)
				u.boosted = false
		for u in B.foes:
			if u.get("broken") and B.round > u.brokenUntil:
				u.broken = false; u.shield = u.maxShield; float_txt(u, "护盾恢复", Color("#9fd4ee"), 18)
		B.order = _order_list()
		for u in B.order: u.prio = false
		new_jit()
		B.next = _order_list()
		for u in B.foes:
			if u.hp > 0:
				var L = _lesson()
				if L and L.has_plan_intent(): L.plan_intent(u)
				else: plan_intent(u)
		bt.panel.render_cards(); bt.auto.sync()
		await bt.wait(250)
		for u in B.order:
			if bt.B == null: return "lose"
			if u.hp <= 0: B.done.append(u.id); continue
			var r := end_check()
			if r != "": return r
			B.cur = u; mo.on_turn_start(u); bt.panel.render_cards()
			if u.side == "foe":
				if u.get("broken") or u.get("stun"):
					float_txt(u, "破势中" if u.get("broken") else "眩晕", Color("#aaa") if u.get("broken") else Color("#e0c0ff"), 18)
					u.stun = false; await bt.wait(450)
				elif int(u.get("dazzleN", 0)) > 0 and chance(25):
					# 目眩（status-effects.md）：敌方整次落空
					u.intent = null; float_txt(u, "目眩 · 落空", Color("#d9d9d9"), 20); await bt.wait(450)
				else:
					var L = _lesson()
					if L: await L.before_foe(u)
					await foe_act(u)
					if L: await L.after_foe(u)
					if u.get("bossy") and u.hp > 0 and u.hp < u.mhp * 0.5 and not u.get("broken") and end_check() == "":
						plan_intent(u); await bt.wait(300); await foe_act(u)
			else:
				u.defend = false; u.buffs.erase("qhGuard")
				if u.get("stun"):
					u.stun = false; float_txt(u, "眩晕", Color("#e0c0ff"), 20); await bt.wait(600)
				else:
					var r2 = await turn.ally_turn(u)
					if r2 == "flee": return "flee"
			tick_buffs(u); B.done.append(u.id); B.cur = null; bt.panel.render_cards()
			var r3 := end_check()
			if r3 != "": return r3
			await bt.wait(160)
		B.cur = null
	return "lose"

## 切磋（qihe-npc-core.js runSpar）原版临时换掉 window.endCheck；这里由 opt.endCheck(B) 代替，返回 "draw" 时按脱身处理
func end_check() -> String:
	var ec = B.opt.get("endCheck")
	if ec is Callable and ec.is_valid(): return str(ec.call(B))
	if alive_of("foe").is_empty(): return "win"
	if alive_of("ally").is_empty(): return "lose"
	return ""

func tick_buffs(u: Dictionary) -> void:
	_tick_martial(u)
	_tick_hearts(u)
	if u.buffs.get("ding"):
		u.buffs.ding -= 1
		if u.buffs.ding <= 0: u.buffs.erase("ding")
	if u.get("bleedN", 0) > 0 and u.hp > 0:
		var d := maxi(1, roundi(u.mhp * 0.06))
		u.hp = maxi(0, u.hp - d); u.bleedN -= 1; float_txt(u, "毒 " + str(d), Color("#86d65e"), 20)

# ───────── 敌人 AI（出手意图预告） ─────────
func plan_intent(u: Dictionary) -> void:
	var al := alive_of("ally")
	if al.is_empty(): return
	if u.get("charging"): u.intent = {"sk": "ghost", "all": true}; return
	if u.skills.has("ghost") and not u.get("broken") and B.round > 1 and randf() < (0.5 if u.hp < u.mhp * 0.6 else 0.3):
		u.intent = {"charge": true}; return
	var sks := []
	for k in u.skills: if k != "ghost": sks.append(k)
	var sk: String = sks[ri(0, sks.size() - 1)] if sks.size() else "blade"
	var tgt
	if u.art == "wolf" or Stats.bsk(sk).get("stun"):
		var l := al.duplicate(); l.sort_custom(func(a, b): return float(a.hp) / a.mhp < float(b.hp) / b.mhp); tgt = l[0]
	else: tgt = al[ri(0, al.size() - 1)]
	if u.art == "wolf" and randf() < 0.4: tgt = al[ri(0, al.size() - 1)]
	u.intent = {"sk": sk, "tgt": tgt}

func intent_label(u: Dictionary) -> String:
	var it = u.get("intent")
	if it == null: return ""
	if it.get("charge"): return "蓄力中 · 下回合全体攻击"
	var n: String = Stats.skill(it.get("sk")).get("name", "攻击")
	if it.get("all"): return "‼ %s · 全体" % n
	return "%s → %s" % [n, it.tgt.name if it.get("tgt") else ""]

## 按引用找下标（Godot 的 Dictionary == 是按值比较，单位身份要用 is_same）
static func idx(list: Array, u) -> int:
	for i in list.size():
		if is_same(list[i], u): return i
	return -1
static func has(list, u) -> bool: return list != null and idx(list, u) >= 0

# ───────── 敌人出手（bfx.js foeAct） ─────────
func foe_act(u: Dictionary) -> void:
	var it: Dictionary = u.get("intent") if u.get("intent") else {}
	u.intent = null
	if it.get("charge"):
		u.charging = true; float_txt(u, "蓄力！", Color("#ffe25a"), 24); bt.sfx("whoosh", 0.8, 0.7); mo.act(u, "cast")
		await bt.wait(700); u.intent = {"sk": "ghost", "all": true}; return
	u.charging = false
	var skk = it.get("sk")
	var sk: Dictionary = Stats.skill(skk) if Stats.has_skill(skk) else Stats.skill("blade")
	var info: Dictionary = Stats.bsk(skk) if not Stats.bsk(skk).is_empty() else {"t": "刀"}
	var al := alive_of("ally")
	if al.is_empty(): return
	var all_: bool = it.get("all", false)
	var tg: Array = al if all_ else [it.tgt if it.get("tgt") and it.tgt.hp > 0 else al[ri(0, al.size() - 1)]]
	show_name(u, sk.get("name", "攻击"))
	var near: Dictionary = tg[0]
	for t in tg: if absf(t.x - u.x) < absf(near.x - u.x): near = t
	mo.cam_on([u, near if all_ else tg[0]], 1.08 if all_ else 1.16)
	var basic: bool = not all_ and (sk.get("basicAttack") == true or D().BASIC_FOE_SKILLS.has(skk if skk else "blade"))
	if basic: u.stationarySkill = false; await mo.dash_to(u, tg[0])
	else:
		mo.begin_skill_pose(u); await bt.vfx.cast(u, skk, tg, 0); await bt.bw(180)
	var hits: int = int(info.get("hits", 1))
	for h in hits:
		var a := "atk2" if h else "atk"
		if basic: mo.act(u, a); await bt.bw(mo.impact_ms(u, a))
		for t0 in tg:
			var t: Dictionary = t0
			if t.hp <= 0: continue
			var red := float(t.get("cuInterceptReduction", 0.25))
			var ib = intercept_of(t) if not all_ else null
			if ib != null:
				t = ib; t.cuInterceptRound = B.round
				_add_guard(t)
				float_txt(t, "援护", Color("#bfd4b1"), 20)
			if not all_ and ib == null and chance(t.dodge * 0.6):
				float_txt(t, "闪", Color("#bcd"), 24); t.dgT = bt.bt_now(); continue
			var dmg: float = (u.atk * float(sk.get("pow", 1) if sk.get("pow") else 1) * (0.65 if hits > 1 else 1.0) * (0.85 if all_ else 1.0)) - t.def * 0.5
			if t.buffs.get("ding"): dmg *= 0.8
			if t.get("defend"): dmg *= 0.5
			if ib != null: dmg *= 1.0 - red
			dmg *= taken_mul(t)
			var di := maxi(1, roundi(dmg * rnd(0.9, 1.1)))
			hurt(t, di, Color("#ff9c80")); bt.vfx.hit(u, t, info.get("t"), skk, 0)
			if ib != null:
				strike(t, u, {"pow": _p4_counter(), "t": "拳"})
			elif not all_ and float(t.get("cuCounter", 0)) > 0 and t.hp > 0:
				var cv := float(t.cuCounter); t.cuCounter = 0.0
				float_txt(t, "反击", Color("#ffcf73"), 18)
				strike(t, u, {"pow": cv, "t": "拳"})
			if info.get("stun") and t.hp > 0 and chance(float(sk.get("stun", 25))):
				t.stun = true; float_txt(t, "眩晕", Color("#e0c0ff"), 20)
		bt.panel.render_cards()
		await bt.bw(mo.recovery_ms(u, a, 260) if basic else 260.0)
	mo.cam_reset()
	if basic: await mo.hop_back(u)
	else: u.anim = null
	await bt.wait(100)

# ───────── 我方出手（bfx.js doAttack/doSkill） ─────────
func do_attack(u: Dictionary, t: Dictionary, bp: int) -> void:
	u.stationarySkill = false
	_start_action(u); u.cuPreviousGuard = false
	var nb = u.get("cuNextBoost")
	if nb is Dictionary and nb.system == null: u._atkBonus = 1.0 + float(nb.ratio); u.erase("cuNextBoost")
	_arm_next_atk(u)
	var hits := 1 + bp
	if bp: await boost_fx(u, bp)
	var ranged: bool = mo.projectile(u, "atk") != null
	show_name(u, u.atkName + (" ×%d" % hits if hits > 1 else ""))
	mo.cam_on([u, t], 1.18)
	if ranged: mo.act(u, "dash", true); await mo.step_fwd(u, 18)
	else: await mo.dash_to(u, t)
	for h in hits:
		if t.hp <= 0: break
		var a := "atk2" if h else "atk"
		await mo.play_attack_pose(u, a, [t], u.atkType, null, bp, func(x): strike(u, x, {"pow": 1.0, "t": u.atkType}), 150.0 if hits > 1 else 230.0)
	mo.cam_reset()
	u.erase("_atkBonus")
	if ranged: u.anim = null; await mo.step_back(u)
	else: await mo.hop_back(u)
	await bt.wait(120)

func do_skill(u: Dictionary, k: String, tgs: Array, bp: int) -> void:
	var sk := Stats.skill(k); var bi := Stats.bsk(k)
	if u.side == "ally" and Stats.skill_why(u, k) != "": return
	if Stats.lib_move(k):
		await _do_lib_skill(u, k, tgs, bp)
		await bt.wait(150)
		return
	_start_action(u)
	mo.begin_skill_pose(u)
	u.mp -= Stats.skill_cost(u, k); bt.panel.render_cards()
	if bp: await boost_fx(u, bp)
	show_name(u, sk.name)
	var effect := Stats.skill_effects(u, k, bp)
	mo.act(u, "cast", true); mo.cam_on([u] + tgs, 1.08 if tgs.size() > 1 else 1.12)
	await bt.vfx.cast(u, k, tgs, bp)
	if sk.get("heal"):
		for t in tgs:
			if t.hp > 0: heal(t, roundi(t.mhp * effect.heal))
		await bt.bw(280)
	elif bi.get("buff"):
		for t in tgs: t.buffs.ding = effect.duration; float_txt(t, "定神 · 攻防提升", Color("#ffe7a0"), 20)
		bt.panel.render_cards(); await bt.bw(280)
	elif bi.get("heart"):
		await _heart_active(u, k)
	else:
		_arm_next_atk(u)
		var hits: int = effect.hits; var pw: float = effect.power
		await bt.bw(180)
		for h in hits:
			for t in tgs:
				if t.hp <= 0: continue
				strike(u, t, {"pow": pw, "t": bi.get("t"), "e": bi.get("e")})
				if h == 0 and bi.get("reveal") and t.hp > 0: reveal(t, int(bi.reveal) + (1 if bp else 0))
				if bi.get("bleed") and t.hp > 0: t.bleedN = 3
				if bi.get("dazzle") and t.hp > 0 and chance(float(bi.dazzle)):
					t.dazzleN = 3; float_txt(t, "目眩", Color("#d9d9d9"), 18)
				if bi.get("stun") and t.hp > 0 and not t.get("broken") and chance(float(sk.get("stun", 25))):
					t.stun = true; t.intent = null; float_txt(t, "眩晕 · 失去行动", Color("#e0c0ff"), 18)
				bt.vfx.hit(u, t, bi.get("t"), k, bp)
			await bt.bw(200 if hits > 1 else 300)
		if k == "qh_hulu_staff":
			u.buffs.qhGuard = true; float_txt(u, "护身 · 减伤15%", Color("#d8e6b3"), 18)
		u.erase("_atkBonus")
	u.anim = null; mo.cam_reset()
	await bt.wait(150)

# ───────── 内功：暴露、减伤、主动招（2026-11-08；设计见 CultivationLibrary.hearts 与 status-effects.md，数值待评审）─────────
## 我方出手的伤害倍率：存烬 +35%、守烛蓄的下一击 +20%、薪火（自身暴露时）、观岚（目标已被看破）
func deal_mul(u: Dictionary, t: Dictionary) -> float:
	var m := 1.0
	if int(u.get("cunjinN", 0)) > 0: m *= 1.35
	m *= float(u.get("_atkBonus", 1.0))
	if int(u.get("exposeN", 0)) > 0: m *= 1.0 + Stats.hv(u, "exposed_damage")
	m *= 1.0 + _observed(u, t)
	return m

## 我方受伤倍率：暴露 +10%；守烛心经（未暴露时）、南窗心法（气血低于三成时）减伤；卸力只卸一次
func taken_mul(t: Dictionary) -> float:
	if t.side != "ally": return 1.0
	var m := 1.0
	if int(t.get("exposeN", 0)) > 0: m *= 1.1
	else: m *= 1.0 - Stats.hv(t, "unexposed_reduce")
	if t.hp < t.mhp * 0.3: m *= 1.0 - Stats.hv(t, "low_hp_reduce")
	if float(t.get("cuUnload", 0)) > 0:
		m *= 1.0 - float(t.cuUnload)
		t.cuUnload = 0.0
		float_txt(t, "卸力", Color("#d8e6b3"), 18)
	return m

func _arm_next_atk(u: Dictionary) -> void:
	if float(u.get("nextAtkV", 0)) > 0:
		u._atkBonus = 1.0 + float(u.nextAtkV)
		u.nextAtkV = 0.0

func _expose(u: Dictionary, n: int) -> void:
	u.exposeN = maxi(int(u.get("exposeN", 0)), n)
	float_txt(u, "暴露 · 受伤+10%", Color("#e8a070"), 18)

## 解除暴露（守烛心经五层：每战第一次解除时回 8% 内力）
func _unexpose(u: Dictionary) -> bool:
	if int(u.get("exposeN", 0)) <= 0: return false
	u.exposeN = 0
	float_txt(u, "暴露解除", Color("#d8e6b3"), 18)
	if Stats.heart_lv(u, "xf_shouzhu") >= 5 and not u.get("_szMpDone"):
		u._szMpDone = true
		var g := roundi(u.mmp * 0.08)
		u.mp = mini(u.mmp, u.mp + g)
		float_txt(u, "守烛 · 内力+%d" % g, Color("#8cc8ff"), 18)
	return true

## 寄傲、存烬、守烛
func _heart_active(u: Dictionary, k: String) -> void:
	match k:
		"xfa_jiao":
			heal(u, roundi(u.mhp * 0.1))
			if int(u.get("bleedN", 0)) > 0:
				u.bleedN = 0
				float_txt(u, "毒解", Color("#d8e6b3"), 18)
			elif int(u.get("dazzleN", 0)) > 0:
				u.dazzleN = 0
				float_txt(u, "目眩解除", Color("#d8e6b3"), 18)
			else:
				_unexpose(u)
		"xfa_cunjin":
			u.cunjinN = 3
			float_txt(u, "存烬 · 攻击+35%", Color("#f0a868"), 20)
			_expose(u, 3)
		"xfa_shouzhu":
			_unexpose(u)
			u.cuUnload = 0.3
			u.nextAtkV = maxf(float(u.get("nextAtkV", 0)), 0.2)
			float_txt(u, "守烛 · 卸力30%，下一击+20%", Color("#ffe7a0"), 18)
	if not (u.get("cd") is Dictionary): u.cd = {}
	u.cd[k] = int(Stats.skill(k).get("cd", 3)) + 1   # 本次行动结束时先扣一次
	if bt.panel: bt.panel.render_cards()
	await bt.bw(320)

## 每次自身行动结束：冷却、暴露、存烬、目眩计数；薪火五层、南窗五层
func _tick_hearts(u: Dictionary) -> void:
	if u.get("cd") is Dictionary:
		for k in u.cd.keys():
			u.cd[k] = int(u.cd[k]) - 1
			if u.cd[k] <= 0: u.cd.erase(k)
	if int(u.get("cunjinN", 0)) > 0: u.cunjinN -= 1
	if int(u.get("dazzleN", 0)) > 0: u.dazzleN -= 1
	if int(u.get("exposeN", 0)) > 0:
		u.exposeN -= 1
		if u.exposeN == 0 and u.hp > 0:
			float_txt(u, "暴露结束", Color("#d8e6b3"), 16)
			if Stats.heart_lv(u, "xf_cunjin") >= 5 and not u.get("_cjMpDone"):
				u._cjMpDone = true
				var g := roundi(u.mmp * 0.05)
				u.mp = mini(u.mmp, u.mp + g)
				float_txt(u, "薪火 · 内力+%d" % g, Color("#8cc8ff"), 18)
	if u.side == "ally" and u.hp > 0 and u.hp < u.mhp * 0.3 and Stats.heart_lv(u, "xf_nanchuang") >= 5:
		heal(u, maxi(1, roundi(u.mhp * 0.03)))

# ───────── 师承招式（照原版 js/qh-mode-cultivation-martial.js 逐条移植，2026-11-08）─────────
## 原版 heart(u)：单位的心法记录
func _xf(u: Dictionary):
	var S = G.S
	if not (S is Dictionary): return null
	var r = S if u.get("mw") == "hero" else (S.get("mates", {}).get(str(u.get("mw", ""))) if S.get("mates") is Dictionary else null)
	return r.get("xinfa") if r is Dictionary else null

## 原版 token(u,n)：守势上限 1，万壑归元诀五层 2
func _token(u: Dictionary, n := 1) -> void:
	var x = _xf(u)
	var cap := 2 if x is Dictionary and x.get("main") == "xf_wanhe" and not x.get("unstable") and int(x.get("lv", {}).get("xf_wanhe", 1)) >= 5 else 1
	u.cuTokens = mini(cap, int(u.get("cuTokens", 0)) + n)
	float_txt(u, "守势 ×%d" % u.cuTokens, Color("#cfe3b8"), 16)

## 原版 startAction(u)：自己出手（或防御）时，上一轮的卸力、反击、援护都作废
func _start_action(u: Dictionary) -> void:
	u.cuUnload = 0.0
	u.cuCounter = 0.0
	for t in B.get("allies", []):
		if is_same(t.get("cuIntercept"), u): t.cuIntercept = null

## 原版 mainBonus(u)：消耗守势时主修心法的加成（出岫心经 8%～16%、万壑归元诀 15%）
func _main_bonus(u: Dictionary) -> float:
	var x = _xf(u)
	if not (x is Dictionary) or int(x.get("unstable", 0)) > 0: return 0.0
	var n := int(x.get("lv", {}).get(x.get("main"), 1))
	if x.get("main") == "xf_guiyun": return [0.08, 0.08, 0.12, 0.12, 0.16][clampi(n, 1, 5) - 1]
	if x.get("main") == "xf_wanhe": return 0.15
	return 0.0

## 原版 addGuard(u)：主修出岫心经或万壑归元诀，防御或援护得一枚守势
func _add_guard(u: Dictionary) -> void:
	var x = _xf(u)
	if x is Dictionary and not x.get("unstable") and x.get("main") in ["xf_guiyun", "xf_wanhe"]: _token(u)

## 原版 support(u,k,list,bp)：卸力、守势、下一击加成、反击、援护
func _support(u: Dictionary, k: String, list: Array, bp: int) -> void:
	var es: Array = Stats.move_ef(k, bp)
	var find := func(t: String):
		for e in es:
			if e[0] == t: return e
		return null
	var un = find.call("unload")
	if un != null:
		for t in list:
			t.cuUnload = float(un[1]); float_txt(t, "卸力 %d%%" % roundi(float(un[1]) * 100), Color("#d8e6b3"), 16)
	var gt = find.call("guard_token")
	if gt != null: _token(u, int(gt[1]))
	var nx = find.call("next_attack_bonus")
	if nx != null: u.cuNextBoost = {"ratio": float(nx[1]), "system": Stats.skill(k).get("systemId") if nx[2] == "next_same_art_move_once" else null}
	var cp = find.call("counter_power")
	if cp != null: u.cuCounter = float(cp[1])
	if find.call("intercept") != null:
		u.cuCounter = 0.0
		for t in list:
			if not is_same(t, u):
				t.cuIntercept = u; t.cuInterceptReduction = 0.25 + 0.05 * bp
				float_txt(t, "%s 护住" % u.name, Color("#cfe3b8"), 16)

## 原版 doSkill（师承招式分支）
func _do_lib_skill(u: Dictionary, k: String, tgs: Array, bp: int) -> void:
	var b := Stats.bsk(k)
	if b.get("ult") and bp != 3: return
	_start_action(u)
	mo.begin_skill_pose(u)
	if not (u.get("cd") is Dictionary): u.cd = {}
	if b.get("cd"): u.cd[k] = int(b.cd) + 1
	if b.get("ult"): u.cuUltRest = 2
	var e := Stats.skill_effects(u, k, bp)
	var list := tgs.filter(func(t): return t.hp > 0)
	var effects: Array = Stats.move_ef(k, int(e.bp))
	var has := func(type: String):
		for x in effects:
			if x[0] == type: return x
		return null
	u.mp -= Stats.skill_cost(u, k)
	if bt.panel: bt.panel.render_cards()
	if bp: await boost_fx(u, bp)
	show_name(u, Stats.skill(k).get("name", k))
	mo.act(u, "cast", true)
	await bt.vfx.cast(u, k, list, bp)
	if int(e.hits) == 0:
		var targets: Array = list
		if k == "gy_p5b":
			targets = list.filter(func(t): return not is_same(t, u)) + list.filter(func(t): return is_same(t, u))
			targets = targets.slice(0, 2)
		_support(u, k, targets, bp)
		u.cuPreviousGuard = false
		await bt.wait(400)
		if bt.panel: bt.panel.render_cards()
		return
	var extra := 0.0
	var cond = has.call("conditional_damage")
	if cond != null:
		if cond[2] == "previous_self_guard" and u.get("cuPreviousGuard"): extra += float(cond[1])
		if cond[2] == "consume_one_self_guard_token" and int(u.get("cuTokens", 0)) > 0:
			u.cuTokens -= 1; extra += float(cond[1]) + _main_bonus(u)
	var nb = u.get("cuNextBoost")
	if nb is Dictionary and (nb.system == null or nb.system == Stats.skill(k).get("systemId")):
		extra += float(nb.ratio); u.erase("cuNextBoost")
	var shb = has.call("extra_shield_damage")
	var extra_shield := 0
	if shb != null and int(u.get("cuTokens", 0)) > 0:
		u.cuTokens -= 1; extra_shield = int(shb[1]); extra += _main_bonus(u)
	var last = has.call("last_hit_bonus")
	var last_guard := false
	if last != null and last[2] == "consume_one_guard_token" and int(u.get("cuTokens", 0)) > 0:
		u.cuTokens -= 1; last_guard = true; extra += _main_bonus(u)
	if list.size(): mo.cam_on([u] + list, 1.08 if list.size() > 1 else 1.16)
	await bt.bw(180)
	for h in int(e.hits):
		var alive := list.filter(func(t): return t.hp > 0)
		if alive.is_empty(): break
		for t in alive:
			var bonus := extra
			if cond != null and cond[2] == "target_broken" and t.get("broken"): bonus += float(cond[1])
			if last != null and h == int(e.hits) - 1 and ((last[2] == "target_broken_before_hit" and t.get("broken")) or (last[2] == "actual_intercept_damage_this_round" and int(u.get("cuInterceptRound", -1)) == int(B.round)) or (last[2] == "consume_one_guard_token" and last_guard)):
				bonus += float(last[1])
			strike(u, t, {"pow": float(e.power) * (1.0 + bonus), "t": b.get("t"), "e": b.get("e")})
			if h == 0 and extra_shield > 0 and int(t.get("shield", 0)) > 0:
				t.shield = maxi(0, int(t.shield) - extra_shield)
				if t.shield == 0 and not t.get("broken"): do_break(t)
			if h == 0 and b.get("reveal") and t.hp > 0: reveal(t, int(b.reveal))
			if h == 0 and k == "gy_p5a" and t.hp > 0 and not t.get("bossy") and (t.get("broken") or chance(35 + 10 * bp)):
				t.stun = true; t.intent = null; float_txt(t, "眩晕 · 失去行动", Color("#e0c0ff"), 18)
			bt.vfx.hit(u, t, b.get("t"), k, bp)
		await bt.bw(200 if int(e.hits) > 1 else 300)
	u.anim = null; mo.cam_reset()
	u.cuPreviousGuard = false
	if bt.panel: bt.panel.render_cards()

## 原版 hurt 包装里的援护：敌人单体打到被护住的同伴，改打护卫者（减伤 25%＋每档蓄势 5%），之后护卫者反击
func intercept_of(t: Dictionary):
	var u = t.get("cuIntercept")
	if u is Dictionary and u.hp > 0 and not is_same(t, u):
		t.cuIntercept = null
		return u
	return null

## 原版 tickBuffs 包装：冷却、绝招调息；本次是防御则触发防御强化、得守势
func _tick_martial(u: Dictionary) -> void:
	if int(u.get("cuUltRest", 0)) > 0: u.cuUltRest -= 1
	if u.get("defend"):
		_start_action(u)
		u.cuPreviousGuard = true
		var guards := (u.get("skills", []) as Array).filter(func(k): return Stats.bsk(k).get("def"))
		var gives := false
		for k in guards:
			_support(u, k, [u], 0)
			for e in Stats.move_ef(k, 0):
				if e[0] == "guard_token": gives = true
		if not gives: _add_guard(u)
	else:
		u.cuPreviousGuard = false

## 原版 firstReveal：观岚诀（辅修）五层，每战第一次看破回 2 内力
func _first_reveal(u, t: Dictionary, prior: int) -> void:
	if not (u is Dictionary) or u.get("cuFirstReveal"): return
	var x = _xf(u)
	if t.get("known", {}).size() > prior and x is Dictionary and (x.get("subs", []) as Array).has("xf_guanlan") and int(x.get("lv", {}).get("xf_guanlan", 1)) >= 5:
		u.cuFirstReveal = true
		u.mp = mini(u.mmp, u.mp + 2)
		float_txt(u, "观岚 · 内力+2", Color("#8cc8ff"), 18)

## 原版 strike 包装：下一击加成（普攻用）＋观岚诀辅修对已看破的敌人每层 +2%（与招式加成相加）
func _observed(u: Dictionary, t: Dictionary) -> float:
	var x = _xf(u)
	if t.get("known", {}).size() > 0 and x is Dictionary and (x.get("subs", []) as Array).has("xf_guanlan"):
		return 0.02 * int(x.get("lv", {}).get("xf_guanlan", 1))
	return 0.0

## 原版援护反击用抱山还岳第一档的 counter_power
func _p4_counter() -> float:
	for e in Stats.move_ef("gy_p4", 0):
		if e[0] == "counter_power": return float(e[1])
	return 0.6

# ───────── 结算（battle.js reveal/strike；bfx.js hurt/heal/doBreak/boostFx） ─────────
func reveal(t: Dictionary, n: int) -> void:
	var hid := []
	for w in t.weak: if not t.known.has(w): hid.append(w)
	for i in n:
		if hid.is_empty(): break
		var w = hid.pop_at(ri(0, hid.size() - 1))
		t.known[w] = true
		float_txt(t, "看破：" + w, Color(D().WCOL.get(w, "#ccc")), 20, true)
		if B.cur is Dictionary and B.cur.get("side") == "ally": _first_reveal(B.cur, t, t.known.size() - 1)

func strike(u: Dictionary, t: Dictionary, v: Dictionary) -> void:
	var ty = v.get("t"); var e = v.get("e")
	var weak_hit := false
	if t.side == "foe":
		for w in [ty, e]:
			if w and t.weak.has(w):
				weak_hit = true
				if not t.known.has(w): t.known[w] = true; t.revealT = bt.pn(); _first_reveal(u, t, t.known.size() - 1)
	var dmg: float = u.atk * v.pow * (1.3 if u.buffs.get("ding") else 1.0) - t.def * 0.5
	if u.side == "ally": dmg *= deal_mul(u, t) * float(v.get("mul", 1.0))
	if weak_hit: dmg *= 1.25
	if t.get("broken"): dmg *= 2
	var cr := chance(u.crit)
	if cr: dmg *= 1.5
	var di := maxi(1, roundi(dmg * rnd(0.92, 1.08)))
	if weak_hit:
		bpop(t, "WEAK", Color("#ffe25a"))
		if not t.get("broken") and t.shield > 0:
			t.shield -= 1; t.shieldHit = bt.pn()
			if t.shield == 0: do_break(t)
	var impact := "needle_hit_20261012" if u.art == "ye_initial" and ty == "暗器" else ("staff_hit_20261010" if ty == "棍" else "advance")
	hurt(t, di, Color("#ffd24a") if cr else (Color("#ff6a4a") if t.get("broken") else Color("#fff3e0")), cr, impact)

func do_break(t: Dictionary) -> void:
	bt.vfx.brk(t)
	t.broken = true; t.brokenUntil = B.round + 1; t.charging = false; t.intent = null; t.breakT = bt.pn()
	B.shake = 14.0; bt.sfx("whoosh", 1, 0.6)
	bt.screen.break_banner(t)
	for i in 26:
		var a := rnd(0, TAU); var s := rnd(2, 7)
		B.parts.append({"x": t.x, "y": t.y - unit_h(t) * 0.55, "vx": cos(a) * s, "vy": sin(a) * s - 2, "r": rnd(3, 9), "rot": rnd(0, 6), "vr": rnd(-0.3, 0.3), "life": rnd(40, 70), "c": Color("#bfe6ff") if randf() < 0.5 else Color("#ffe7a0"), "glow": false})
	t._brkFx = bt.bt_now(); t._bnr = false
	bt.bt_stop(250); bt.cam.punch(1.12, 320)

func hurt(t: Dictionary, dmg: int, col: Color, big := false, impact := "advance") -> void:
	if t.buffs.get("qhGuard"): dmg = maxi(1, roundi(dmg * 0.85))
	# qihe-acc-fx.js lastStand：百家平安符，致命一击保 1 点（每场一次）
	dmg = _last_stand(t, dmg)
	t.hp = maxi(0, t.hp - dmg); t.flash = bt.pn(); t.ghT = bt.pn()
	if t.side == "ally" and t.hp > 0 and t.hp < t.mhp * 0.3 and not t.get("_lowMpDone") and Stats.heart_lv(t, "xf_nanchuang") >= 3:
		t._lowMpDone = true; var g := roundi(t.mmp * 0.05); t.mp = mini(t.mmp, t.mp + g); float_txt(t, "南窗 · 内力+%d" % g, Color("#8cc8ff"), 18)
	if t.hp > 0: mo.act(t, "hurt")
	t.kbT = bt.bt_now() - 30
	var needle := impact == "needle_hit_20261012"
	t._kbAmt = 6 if needle else 12; t._flT = bt.bt_now()
	B.shake = maxf(B.shake, (3 if big else 2) if needle else (5 if big else 2))
	bt.sfx(impact, 0.65 if needle else 0.9)
	float_txt(t, str(dmg), col, 34 if big else 28)
	if t.hp <= 0:
		t.dieT = bt.pn(); t.intent = null
		if t.side == "ally": t.bp = 0; t.defend = false; t.stun = false
	bt.panel.render_cards()

func _last_stand(u: Dictionary, dmg: int) -> int:
	if u.side != "ally" or u.get("lastStood") or dmg < u.hp or u.hp <= 1: return dmg
	var S: Dictionary = G.S
	var eq: Dictionary = S if u.get("isHero") else S.get("mates", {}).get(u.get("key", ""), {}).get("equip", {})
	var on := false
	for k in [eq.get("weapon"), eq.get("acc")]:
		if Stats.item(k).get("func", {}).get("lastStand"): on = true
	if not on: return dmg
	u.lastStood = true; float_txt(u, "平安符", Color("#f3d58e"), 20)
	return u.hp - 1

func heal(t: Dictionary, n: int) -> void:
	var h := mini(n, t.mhp - t.hp)
	t.hp += h; float_txt(t, "+" + str(h), Color("#7fe0a0"), 28); t._hlT = bt.bt_now()
	for i in 10:
		B.parts.append({"x": t.x + rnd(-25, 25), "y": t.y - rnd(10, 80), "vx": 0.0, "vy": -rnd(0.6, 1.6), "r": rnd(2, 4), "life": rnd(30, 50), "c": Color("#9ff0b0"), "glow": true})
	bt.sfx("chime", 0.5)
	if bt.panel: bt.panel.render_cards()

func boost_fx(u: Dictionary, bp: int) -> void:
	B.boostT = bt.pn(); B.boostU = u
	float_txt(u, "蓄势 " + "◆".repeat(bp), Color("#ffcf73"), 22); bt.sfx("chime", 0.6, 1 + bp * 0.1)
	u._boT = bt.bt_now(); u._boL = mini(3, bp); mo.act(u, "cast")
	if bp >= 3: B.shake = maxf(B.shake, 4); bt.cam.punch(1.04, 220)
	await bt.bw(380 + mini(3, bp) * 70)

func show_name(u: Dictionary, n: String) -> void:
	B.banner = {"t": n, "side": u.side, "t0": bt.pn()}

## bui.js floatTxt：同一单位 300ms 内的浮字逐行上移 22
func float_txt(u: Dictionary, t: String, c: Color, size := 26, slow := false) -> void:
	var now: float = bt.pn(); var n := 0
	for f in B.fx: if is_same(f.u, u) and now - f.t0 < 300: n += 1
	B.fx.append({"x": u.x + rnd(-14, 14), "y": u.y - unit_h(u) * 0.7 - n * 22, "t": t, "c": c, "size": size, "t0": now, "life": 1500.0 if slow else 1000.0, "u": u, "pop": false, "kind": ""})

## bui.js bpop：「破势」类转横幅，其余弹字（WEAK 显示为「弱点」）
func bpop(u: Dictionary, t: String, c: Color, big := false) -> void:
	B.fx.append({"x": u.x, "y": u.y - unit_h(u) * (0.5 if big else 1.12), "t": t, "c": c, "size": 38 if big else 22, "t0": bt.pn(), "life": 1300.0 if big else 800.0, "pop": true, "u": u, "kind": "weak" if t == "WEAK" else ""})

func victory_pose() -> void:
	await mo.victory_pose()

## battle.js unitAt：半宽 max(40,h*.32)，上沿 y-h，下沿 y+30，取最靠前者
func unit_at(x: float, y: float):
	var best = null
	for u in alive_of():
		var h := unit_h(u); var w := maxf(40, h * 0.32)
		if absf(x - u.x) < w and y < u.y + 30 and y > u.y - h:
			if best == null or u.y > best.y: best = u
	return best
