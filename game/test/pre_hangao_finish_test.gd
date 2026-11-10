extends GdUnitTestSuite
## 2026-11-08 汉皋前收尾：旧场下架、《带得走的本事》针路、内功战斗效果（暴露、减伤、寄傲／存烬／守烛、战后回复）、扬灰目眩。

const Rules := preload("res://scripts/battle/rules.gd")

func _unit(side := "ally", heart := "", lv := 1) -> Dictionary:
	var u := {"side": side, "name": "测试", "art": "hero", "dscale": 1.0, "x": 300.0, "y": 420.0, "hp": 100, "mhp": 100, "mp": 50, "mmp": 100,
		"atk": 20, "def": 0, "crit": 0, "dodge": 0, "buffs": {}, "skills": [], "skLv": {}, "known": {}, "weak": []}
	if heart != "":
		Stats._attach_hearts(u, {"xinfa": {"main": heart, "subs": [], "known": [heart], "lv": {heart: lv}, "prog": {}}})
	else:
		u.hearts = []; u.cd = {}
	return u

func _rules() -> Rules:
	Battle.B = {"fx": [], "units": [], "parts": [], "round": 1, "shake": 0.0}
	return Rules.new(Battle)

var _old_s = null

func after_test() -> void:
	Battle.B = null
	if _old_s != null: G.S = _old_s; _old_s = null

func test_城门还在前面已下架() -> void:
	assert_object(CuDB.action("gy_m09")).is_null()
	assert_object(CuDB.action("hg_road")).is_not_null()

func test_带得走的本事_只学针路走针路台词() -> void:
	var s := CuCore.initial()
	s.joined = true
	s.learned.art_jc_n1 = {"source": "test", "period": 6}
	var ctx := CuPreHangao.extra(s)
	assert_bool(ctx.preHangao.needle).is_true()
	var sc = CuVisitors.script("hg_pack_review", ctx)
	var ids := []
	for ln in sc.intro: ids.append(ln.id)
	assert_array(ids).contains(["hg_pack_review:opening:r14"])
	assert_array(ids).not_contains(["hg_pack_review:opening:r11"])
	# 学了剑的人仍走剑路
	s.learned.sword = {"source": "test", "period": 3}
	ctx = CuPreHangao.extra(s)
	assert_bool(ctx.preHangao.needle).is_false()

func test_主修内功带主动招() -> void:
	var u := _unit("ally", "xf_cunjin", 1)
	assert_array(u.skills).contains(["xfa_cunjin"])
	assert_array(_unit("ally", "tuna", 3).skills).not_contains(["xfa_cunjin", "xfa_jiao", "xfa_shouzhu"])

func test_存烬_攻击加成与暴露_冷却() -> void:
	var r := _rules()
	var u := _unit("ally", "xf_cunjin", 2)
	var foe := _unit("foe")
	await r._heart_active(u, "xfa_cunjin")
	assert_int(int(u.exposeN)).is_equal(3)
	# 存烬 1.35 × 薪火二层（暴露时 +8%）
	assert_float(r.deal_mul(u, foe)).is_equal_approx(1.35 * 1.08, 0.001)
	assert_float(r.taken_mul(u)).is_equal_approx(1.1, 0.001)
	assert_str(Stats.skill_why(u, "xfa_cunjin")).contains("调息")
	for i in 3: r.tick_buffs(u)
	assert_int(int(u.get("exposeN", 0))).is_equal(0)
	assert_float(r.deal_mul(u, foe)).is_equal_approx(1.0, 0.001)
	r.tick_buffs(u)
	assert_str(Stats.skill_why(u, "xfa_cunjin")).is_equal("")

func test_守烛_解暴露_卸力一次_下一击加成() -> void:
	var r := _rules()
	var u := _unit("ally", "xf_shouzhu", 5)
	u.exposeN = 2
	await r._heart_active(u, "xfa_shouzhu")
	assert_int(int(u.exposeN)).is_equal(0)
	assert_int(int(u.mp)).is_equal(58)   # 五层：第一次解除暴露回 8% 内力
	# 未暴露减伤 10% 与卸力 30% 叠乘，卸力只一次
	assert_float(r.taken_mul(u)).is_equal_approx(0.9 * 0.7, 0.001)   # 守烛：卸力 30%
	assert_float(r.taken_mul(u)).is_equal_approx(0.9, 0.001)
	r._arm_next_atk(u)
	assert_float(r.deal_mul(u, _unit("foe"))).is_equal_approx(1.2, 0.001)

func test_寄傲_回血解异常() -> void:
	var r := _rules()
	var u := _unit("ally", "xf_nanchuang", 1)
	u.hp = 50; u.bleedN = 2
	await r._heart_active(u, "xfa_jiao")
	assert_int(int(u.hp)).is_equal(60)
	assert_int(int(u.bleedN)).is_equal(0)

func test_南窗_低血减伤() -> void:
	var r := _rules()
	var u := _unit("ally", "xf_nanchuang", 5)
	assert_float(r.taken_mul(u)).is_equal_approx(1.0, 0.001)
	u.hp = 20
	assert_float(r.taken_mul(u)).is_equal_approx(0.9, 0.001)

func test_战后回复取层数() -> void:
	assert_float(Stats.hv(_unit("ally", "xf_danxue", 3), "postHp")).is_equal_approx(0.1, 0.001)
	assert_float(Stats.hv(_unit("ally", "xf_danxue", 5), "postHp")).is_equal_approx(0.2, 0.001)
	assert_float(Stats.hv(_unit("ally", "tuna", 2), "postMp")).is_equal_approx(0.0, 0.001)
	assert_float(Stats.hv(_unit("ally", "tuna", 3), "postMp")).is_equal_approx(0.1, 0.001)

func test_扬灰带目眩() -> void:
	var b := Stats.bsk("gj_h1")
	assert_str(str(b.get("t"))).is_equal("暗器")
	assert_str(str(b.get("tgt"))).is_equal("foes")
	assert_int(int(b.get("dazzle", 0))).is_equal(25)

func test_师承招式读得到战斗定义() -> void:
	assert_str(str(Stats.bsk("gy_s3").get("t"))).is_equal("剑")
	assert_str(str(Stats.bsk("gy_s3").get("e"))).is_equal("风")
	assert_int(int(Stats.bsk("jc_n2").get("hits"))).is_equal(3)
	assert_str(str(Stats.bsk("gy_s5b").get("tgt"))).is_equal("foes")
	assert_bool(Stats.support("gy_p4")).is_true()
	assert_bool(Stats.support("gy_s3")).is_false()
	assert_object(Stats.skill_pv(_unit(), "gy_s4b", 0)).is_null()

func _guiyun_hero(main: String, lv: int, subs := []) -> Dictionary:
	if _old_s == null: _old_s = G.S
	G.S = {"st": {"str": 9, "con": 9, "agi": 9, "wil": 9, "wis": 9}, "lv": 5, "xinfa": {"main": main, "subs": subs, "lv": {main: lv, "xf_guanlan": lv}, "known": [main]}}
	var u := _unit()
	u.mw = "hero"
	return u

func test_防御强化_卸力守势下一击() -> void:
	var r := _rules()
	var u := _guiyun_hero("xf_guiyun", 1)
	u.skills = ["gy_s4b"]; u.defend = true
	r._tick_martial(u)
	assert_float(float(u.cuUnload)).is_equal_approx(0.4, 0.001)
	assert_int(int(u.cuTokens)).is_equal(1)
	assert_float(float(u.cuNextBoost.ratio)).is_equal_approx(0.3, 0.001)
	assert_bool(u.cuPreviousGuard).is_true()
	assert_str(Stats.skill_why(u, "gy_s4b")).contains("防御")

func test_出岫心经_防御得守势() -> void:
	var r := _rules()
	var u := _guiyun_hero("xf_guiyun", 1)
	u.defend = true
	r._tick_martial(u)
	assert_int(int(u.cuTokens)).is_equal(1)
	r._tick_martial(u)
	assert_int(int(u.cuTokens)).is_equal(1)   # 上限 1
	var w := _guiyun_hero("xf_wanhe", 5)
	w.defend = true
	r._tick_martial(w); r._tick_martial(w)
	assert_int(int(w.cuTokens)).is_equal(2)   # 万壑归元诀五层 2 枚

func test_主修守势加成() -> void:
	var r := _rules()
	assert_float(r._main_bonus(_guiyun_hero("xf_guiyun", 3))).is_equal_approx(0.12, 0.001)
	assert_float(r._main_bonus(_guiyun_hero("xf_wanhe", 1))).is_equal_approx(0.15, 0.001)
	assert_float(r._main_bonus(_guiyun_hero("tuna", 5))).is_equal_approx(0.0, 0.001)

func test_效果按蓄势分档() -> void:
	assert_float(float(Stats.move_ef("gy_s4b", 0)[0][1])).is_equal_approx(0.4, 0.001)
	assert_float(float(Stats.move_ef("gy_s4b", 3)[0][1])).is_equal_approx(0.55, 0.001)
	assert_array(Stats.move_ef("gy_s5", 0)).is_empty()
	assert_str(str(Stats.move_ef("gy_s5", 3)[0][2])).is_equal("consume_one_guard_token")
	var e := Stats.skill_effects(_unit(), "gy_p3", 0)
	assert_int(int(e.hits)).is_equal(2)
	assert_float(float(e.power)).is_equal_approx(1.26 / 2.0, 0.001)

func test_援护_蓄势加减伤_只护一次() -> void:
	var r := _rules()
	var u := _unit(); u.name = "萧白"
	var mate := _unit()
	r._support(u, "gy_p4", [mate], 2)
	assert_float(float(mate.cuInterceptReduction)).is_equal_approx(0.35, 0.001)
	assert_bool(is_same(r.intercept_of(mate), u)).is_true()
	assert_object(r.intercept_of(mate)).is_null()
	assert_float(r._p4_counter()).is_equal_approx(0.6, 0.001)

func test_自己出手时上一轮的卸力和援护作废() -> void:
	var r := _rules()
	var u := _unit(); u.name = "萧白"
	var mate := _unit()
	Battle.B.allies = [u, mate]
	r._support(u, "gy_p4", [mate], 0)
	u.cuUnload = 0.4
	r._start_action(u)
	assert_float(float(u.cuUnload)).is_equal_approx(0.0, 0.001)
	assert_object(mate.cuIntercept).is_null()

func test_观岚辅修() -> void:
	var r := _rules()
	var u := _guiyun_hero("xf_guiyun", 5, ["xf_guanlan"])
	var foe := _unit("foe")
	assert_float(r._observed(u, foe)).is_equal_approx(0.0, 0.001)
	foe.known = {"剑": true}
	assert_float(r._observed(u, foe)).is_equal_approx(0.1, 0.001)
	r._first_reveal(u, foe, 0)
	assert_int(int(u.mp)).is_equal(52)

func test_绝招要三点蓄势() -> void:
	var u := _unit()
	u.skills = ["gy_s5"]; u.bp = 2; u.mp = 99; u.atkType = "剑"
	assert_str(Stats.skill_why(u, "gy_s5")).contains("蓄势")
	u.bp = 3
	assert_str(Stats.skill_why(u, "gy_s5")).is_equal("")
	u.cuUltRest = 1
	assert_str(Stats.skill_why(u, "gy_s5")).contains("调息")
