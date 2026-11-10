extends GdUnitTestSuite
## 墨印“互”“谈”的数据约定（R-交互-01，2026-11-04）：托／回整个换成“互”；有名字的人都有“谈”

func _json(p: String) -> Variant:
	return JSON.parse_string(FileAccess.get_file_as_string(p))

func _npc_data() -> Dictionary:
	return _json("res://data/js/qihe-npc-data.json").QIHE_NPC_DATA

func test_第一枚印是互() -> void:
	var m: Array = _npc_data().MENU
	assert_str(m[0].id).is_equal("tuo")
	assert_str(m[0].ch).is_equal("互")
	assert_str(m[0].lab).is_equal("互动")

func test_墨印里不再有托和回() -> void:
	for d in [_npc_data(), _json("res://data/runtime/globals.json")]:
		for M in _find_menus(d):
			for it in M:
				assert_bool(it.ch in ["托", "回"]).override_failure_message("还有旧印：" + str(it)).is_false()

func _find_menus(d) -> Array:
	var out := []
	if d is Dictionary:
		if d.has("MENU") and d.MENU is Array: out.append(d.MENU)
		for v in d.values(): out.append_array(_find_menus(v))
	return out

func test_剧情钩子标签都叫互动() -> void:
	var st: Dictionary = _npc_data().STORY
	for k in st:
		for f in ["lab", "labActive"]:
			if st[k] is Dictionary and st[k].has(f):
				assert_str(st[k][f]).override_failure_message("%s.%s" % [k, f]).is_equal("互动")

func test_场景里没有人被关掉谈() -> void:
	var sc: Dictionary = _json("res://data/runtime/sc.json")
	var n := 0
	for key in sc:
		for x in sc[key].get("npcs", []):
			n += 1
			assert_bool(x.get("talk") == false).override_failure_message("%s/%s 关了谈" % [key, x.get("id")]).is_false()
	assert_int(n).is_greater(100)

func test_站岗的人没有关掉谈() -> void:
	for s in _npc_data().STATIONS:
		assert_bool(s.get("talk") == false).override_failure_message(s.id).is_false()

func test_站岗两人的谈话剧本已登记() -> void:
	var idx: Dictionary = _json("res://data/story/index.json").knots
	for k in ["npc_retainer_talk", "npc_bailiff_talk"]:
		assert_bool(idx.has(k)).override_failure_message(k).is_true()
		assert_bool(FileAccess.file_exists("res://data/story/%s.json" % idx[k])).is_true()
