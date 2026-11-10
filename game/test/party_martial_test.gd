extends GdUnitTestSuite
## 队伍页右栏「武学与状态」（2026-11-09，评审台第四十六、四十七轮）：功法分内功、外功、轻功；
## 招式、功法、状态三种悬停说明都要生成得出来

const PS := preload("res://scripts/menu/page_skill.gd")
const PP := preload("res://scripts/menu/page_party.gd")

func test_身法归轻功() -> void:
	assert_bool(PS.is_light("gy_p2")).is_true()    # 回岚步
	assert_bool(PS.is_light("yh_b1")).is_true()    # 倦鸟知还
	assert_bool(PS.is_light("gy_s2")).is_false()   # 拨云回锋
	assert_str(PP.kind_name("剑")).is_equal("剑法")
	assert_str(PP.kind_name("身")).is_equal("身法")

func test_招式能找到所属功法() -> void:
	var a = PP.art_of("gy_s2")
	assert_object(a).is_not_null()
	assert_str(str(a.name)).is_equal("拨云剑法")

func test_悬停说明都生成得出来() -> void:
	Menu.debug_start("party")
	await get_tree().process_frame
	var v = Menu.actor()
	assert_object(v).is_not_null()
	assert_bool(v.skills.size() > 0).is_true()
	_check(Menu.tip_content("skill:" + str(v.skills[0].id)))
	var arts: Array = PP.arts_of(v)
	assert_bool(arts.size() > 0).is_true()
	_check(Menu.tip_content("art:" + str(arts[0].id)))
	# 给主角挂一个“疲惫”，状态栏要列出来，悬停说明要有
	var r: Dictionary = QJModel.rec(G.S, "hero")
	r.conditions = [{"id": "fatigue"}, {"id": "rested"}]
	v = Menu.actor()
	var st: Array = PP.states(v)
	var ids: Array = st.map(func(x): return x.id)
	assert_bool(ids.has("fatigue") and ids.has("rested")).is_true()
	for x in st:
		if x.id == "fatigue": assert_bool(x.good).is_false()
		if x.id == "rested": assert_bool(x.good).is_true()
	_check(Menu.tip_content("cond:fatigue"))
	r.conditions = []
	Menu.close()
	await get_tree().process_frame

## 说明卡要生成得出来；查完就释放，免得留下孤儿节点
func _check(c) -> void:
	assert_object(c).is_not_null()
	if c is Node: c.free()
