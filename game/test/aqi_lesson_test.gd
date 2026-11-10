extends GdUnitTestSuite
## 小耗子的一课二版（2026-11-09 用户试玩意见）：不去摸随从钱袋；第 4 步用“窃”印上课；旧存档步骤换算；
## 货郎扁担进行记；墨印点标签等于点当前印

func _side() -> Node: return Flow.get_node_or_null("Side")

func _days_state() -> void:
	Menu.debug_start("party")   # 借菜单的调试存档：序章做完、村中日常
	await get_tree().process_frame
	G.S.qiheChapter = {"stage": "days", "halfDay": 0, "events": {}, "choices": {}, "records": {}}

func test_第四步窃印亮着且走小耗子的课() -> void:
	await _days_state()
	G.S.aqiTeach = {"step": 4, "wage": null, "v": 2, "called": true}
	var p = DB.g("QIHE_NPC_DATA").PEOPLE.aqi
	var items: Array = Npc.core.menu_for(p, {"id": "aqi", "name": "小耗子"})
	var qie = null
	for it in items:
		if it.id == "qie": qie = it
	assert_object(qie).override_failure_message("第 4 步墨印里没有“窃”").is_not_null()
	assert_str(str(qie.run)).is_equal("aqi_lesson")
	assert_str(str(qie.st)).is_equal("story")

func test_没到第四步窃印不亮() -> void:
	await _days_state()
	G.S.aqiTeach = {"step": 1, "wage": null, "v": 2, "called": true}
	G.S.erase("steal")
	if G.S.get("qiheNpc") is Dictionary and G.S.qiheNpc.get("skills") is Dictionary: G.S.qiheNpc.skills.erase("steal")
	var p = DB.g("QIHE_NPC_DATA").PEOPLE.aqi
	for it in Npc.core.menu_for(p, {"id": "aqi", "name": "小耗子"}):
		if it.id == "qie": assert_str(str(it.st)).is_equal("off")

func test_旧存档步骤换算() -> void:
	await _days_state()
	var a = _side().aqi
	for pair in [[1, 1], [2, 1], [3, 2], [4, 3]]:
		G.S.aqiTeach = {"step": pair[0], "wage": null}
		assert_int(a.step()).override_failure_message("旧 %d" % pair[0]).is_equal(pair[1])
	G.S.aqiTeach = {"wage": 1}
	assert_bool(a.learned()).is_true()

func test_货郎扁担接了就进行记() -> void:
	await _days_state()
	var t = _side().town
	t.pole().stage = "carry"
	var rows := []
	_side().journal_extras(func(r): rows.append(r), func(a, b, c = true): return {"t": a, "d": b, "done": c})
	assert_bool(rows.any(func(r): return r.id == "side:pole")).is_true()
	t.pole().stage = "none"
	Menu.close()
	await get_tree().process_frame
