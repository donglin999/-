extends GdUnitTestSuite
## 2026-11-06 汉皋前时间线整改：秘籍背包参悟、培养开头过渡戏后挪、整月外出第 13 月、《底布上的印子》。

const MANUALS := {"mj_art_gj_h1": "art_gj_h1", "mj_art_jh_jh": "art_jh_jh", "qh_nanchuang_xf": "xf_nanchuang", "qh_xinhuo_gong": "xf_cunjin", "qh_shouzhu_jing": "xf_shouzhu"}

func _act(id: String):
	return CuDB.action(id)

func _world(bag: Dictionary) -> Dictionary:
	var cs := CuCore.initial()
	cs.joined = true; cs.facts.joined = true
	cs.learned.stance = {"source": "test", "period": 0}
	var w := {"chapter": 2, "sect": "guiyun", "bag": bag, "cultivation": cs, "skills": {"fist": 1}, "party": []}
	return QJModel.normalize(w)

func test_五本秘籍都登记了功法和学艺条目() -> void:
	for k in MANUALS:
		var a = CuBalance.artById(MANUALS[k])
		assert_object(a).override_failure_message("缺功法 " + MANUALS[k]).is_not_null()
		assert_object(_act(a.action)).override_failure_message("缺学艺条目 " + str(a.action)).is_not_null()
		if a.type == "inner": assert_bool(QJModel.XINFA().has(a.id)).override_failure_message("江湖菜单不认得内功 " + a.id).is_true()
		else:
			for mv in a.moves: assert_bool(DB.SKILLS.has(mv.id)).override_failure_message("缺招式 " + mv.id).is_true()

func test_培养学会的内功江湖菜单都认得() -> void:
	for a in CuBalance.arts():
		if a.type == "inner" and a.id != "tuna": assert_bool(QJModel.XINFA().has(a.id)).override_failure_message(a.id).is_true()

func test_满足条件就能参悟_学会后能照书独练() -> void:
	var w := _world({"mj_art_gj_h1": 1, "qh_shouzhu_jing": 1})
	var cs: Dictionary = w.cultivation
	var tr = _act("TR_art_gj_h1")
	assert_str(CuBalance.gate(cs, tr)).contains("背包")
	assert_str(QJModel.manual_why(w, "hero", "mj_art_gj_h1")).is_equal("")
	assert_str(QJModel.manual_why(w, "hero", "qh_shouzhu_jing")).contains("需")
	QJModel.learn_manual(w, "mj_art_gj_h1")
	assert_bool(cs.learned.has("art_gj_h1")).is_true()
	assert_int(int(w.skills.get("gj_h1", 0))).is_equal(1)
	assert_str(CuBalance.gate(cs, tr)).is_equal("")
	assert_int(int(w.bag.mj_art_gj_h1)).is_equal(1)
	assert_str(QJModel.manual_why(w, "hero", "mj_art_gj_h1")).contains("已经参悟")

func test_开始部分还不能参悟() -> void:
	var w := _world({"qh_nanchuang_xf": 1})
	w.chapter = 1
	assert_str(QJModel.manual_why(w, "hero", "qh_nanchuang_xf")).contains("入谷")

func test_过渡戏按日历后挪() -> void:
	assert_array(_act("gy_prelude_xinfa").window).is_equal([5, 5])
	assert_array(_act("gy_prelude_hair").window).is_equal([10, 10])
	assert_array(_act("B01").factRequires).contains(["gy_prelude_xinfa_seen"])

func test_整月外出第十三月() -> void:
	var jm: Array = CuDB.t("CultivationData").journeyMonths
	assert_bool(jm.has(13)).is_true()
	assert_bool(jm.has(16)).is_false()

func test_底布上的印子() -> void:
	var a = _act("ys_box_mark")
	assert_object(a).is_not_null()
	assert_object(CuVisitors.find("ys_box_mark")).is_not_null()
	var p := CuVisitors.init(CuCore.initial(), "ys_box_mark")
	assert_int((p.scriptSnapshot.choices as Array).size()).is_equal(2)
