extends Node
## 战斗指令菜单截图（2026-11-13）：依次开几场人数不同的战斗，轮到我方每个人时截主菜单，再截武学、道具、选目标。
## 用法：tools/gd_bg.sh --resolution 1280x720 -- --battle=uisnap:<输出目录>（由 battle.gd debug_start 挂上本节点）
## 每张图同时打印菜单矩形与它压到的东西（panel.cmd_report），画面之外再有一份数字可核对。
## 只开指定的场次：--battle=uisnap:<目录>:wolf,party4

var out := "user://battle_snap"
var only := []
var bad := 0

func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(out)
	await get_tree().create_timer(0.5).timeout
	for c in _cases():
		if only.size() and not (c.name in only): continue
		await _case(c)
	print("战斗截图完成：%s，菜单压到东西的有 %d 张" % [out, bad])
	get_tree().quit()

func _cases() -> Array:
	var band := {"name": "山贼", "sp": "c_bandit", "lv": 3, "st": {"str": 5, "con": 9, "agi": 1, "wil": 3, "wis": 3}, "skills": {"blade": 1}, "hpMul": 20, "shield": 9}
	var chief := {"name": "山贼头目", "sp": "c_chief", "kind": "chief", "lv": 3, "st": {"str": 5, "con": 9, "agi": 1, "wil": 3, "wis": 3}, "skills": {"ghost": 1}, "hpMul": 20}
	var b := func(n: int) -> Array:
		var a := []
		for i in n: a.append(band.duplicate(true))
		return a
	return [
		{"name": "wolf", "opt": {"preset": "backhill_wolf"}, "sub": true},                       # 开始部分第一战：萧白、叶蘅对两狼，带指引
		{"name": "road", "opt": {"preset": "road", "learned": true}, "sub": false},              # 开始部分：萧白、陆衡对两名帮众，不带指引
		{"name": "solo", "opt": {"foes": b.call(1), "solo": true, "noLose": true}, "party": [], "sub": true},   # 单人（培养部分切磋同此）
		{"name": "party3", "opt": {"foes": b.call(3), "noLose": true}, "party": ["ye", "suzhi"], "sub": false},
		{"name": "party4", "opt": {"foes": b.call(5), "noLose": true}, "party": ["ye", "suzhi", "yinhongying"], "sub": true},
		{"name": "boss", "opt": {"foes": [chief] + b.call(2), "noLose": true, "boss": true}, "party": ["ye", "suzhi", "yinhongying"], "sub": false},
	]

func _case(c: Dictionary) -> void:
	var S: Dictionary = G.new_state()
	S.name = "萧白"
	S.lv = 8; S.st = {"str": 9, "con": 9, "agi": 30, "wil": 9, "wis": 9}
	S.skills = {"fuhu": 1, "qh_hulu_staff": 1}
	S.party = c.get("party", [])
	S.bag = {"pill": 3}
	G.S = S
	var d := Stats.derived(S)
	S.hp = d.mhp; S.mp = d.mmp
	G.mode = "scene"
	seed(c.name.hash())
	Battle.start(c.opt)   # 不 await：战斗协程一直跑到结束
	var seen := {}
	var subbed := false
	var guard := 0
	while guard < 14:
		guard += 1
		if not await _wait_menu(): break
		var u: Dictionary = Battle.panel.cmd.u
		var idx: int = Battle.rules.idx(Battle.B.allies, u)
		if seen.has(idx):
			if seen.size() >= Battle.B.allies.size(): break
			await _key("n4"); await _gone(); continue   # 防御，等下一个人
		seen[idx] = true
		await _shot("%s-%d-%s-main" % [c.name, idx, u.name])
		if c.sub and not subbed and not u.skills.is_empty():
			subbed = true
			await _key("n2"); await _shot("%s-%d-%s-skills" % [c.name, idx, u.name])
			await _key("back")
			if not Battle.panel.cmd.rows[2].get("dis"):
				await _key("n3"); await _shot("%s-%d-%s-items" % [c.name, idx, u.name])
				await _key("ok"); await _shot("%s-%d-%s-item-target" % [c.name, idx, u.name])
				await _key("back"); await _key("back")
		if c.sub and seen.size() == 1:
			await _key("n1"); await _shot("%s-%d-%s-target" % [c.name, idx, u.name])
			await _key("back")
		if seen.size() >= Battle.B.allies.size(): break
		await _key("n4"); await _gone()
	# 收场：当前这个人“脱身”，等战斗卸下
	if Battle.B != null:
		if Battle.panel != null and Battle.panel.cmd != null: Battle.rules.turn.resolved.emit("flee")
		var w := 0.0
		while Battle.B != null and w < 20.0:
			await get_tree().create_timer(0.2).timeout; w += 0.2
	await get_tree().create_timer(0.4).timeout

func _wait_menu() -> bool:
	var w := 0.0
	while w < 40.0:
		if Battle.B != null and Battle.panel != null and Battle.panel.cmd != null and Battle.B.key.is_valid() and Battle.cam.tw == null and not Dialog.busy:
			await get_tree().create_timer(0.7).timeout   # 菜单滑入、出手人跨步都停稳
			if Battle.panel != null and Battle.panel.cmd != null: return true
		await get_tree().create_timer(0.1).timeout; w += 0.1
	print("  等不到指令菜单"); return false

func _gone() -> void:
	var w := 0.0
	while w < 5.0 and Battle.panel != null and Battle.panel.cmd != null:
		await get_tree().create_timer(0.1).timeout; w += 0.1

func _key(k: String) -> void:
	if Battle.B != null and Battle.B.key.is_valid(): Battle.B.key.call(k)
	await get_tree().create_timer(0.55).timeout

func _shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	var p := out.path_join(name + ".png")
	get_viewport().get_texture().get_image().save_png(p)
	var rep := ""
	if Battle.panel != null and Battle.panel.has_method("cmd_report"):
		rep = Battle.panel.cmd_report()
		if "压到" in rep: bad += 1
	print("战斗截图 %s %s" % [name, rep])
