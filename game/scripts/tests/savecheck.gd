extends Node
## 旧存档回归（2026-11-05）：拿一份冻结下来的存档（tests/saves/ 下：用户实际玩过的档、自动通关沿途的进度点），
## 走和标题页“继续进度”一样的路读进来，然后查：
## 1. 读档本身不报错、不卡住；2. 人没站在走不了的地方；3. 场景里有路可走（有门或出口，固定场景除外）；
## 4. 主线能往下走一步（像玩家那样走到该去的地方、找该找的人）；5. 再存一次能原样读回。
## 用法：godot --headless --path game -- --savecheck=<存档.json> --out=<报告.json>   有问题退出码 1

const H := preload("res://scripts/tests/harness.gd")
var h: Node
var args := {}
var result := {}
var key := "selftest_save"   # 每个进程各用一个存档名（并行跑时互不覆盖）

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	Engine.time_scale = 3.0
	key = "selftest_save_" + str(args.get("savecheck", "").hash() & 0xffffff)
	h = H.new(); add_child(h)
	await get_tree().process_frame
	await run()
	h.write_report(args.get("out", "user://savecheck.json"), {"save": args.get("savecheck", ""), "result": result})
	DirAccess.remove_absolute(ProjectSettings.globalize_path("user://saves/%s.json" % key))
	await get_tree().create_timer(0.3).timeout
	get_tree().quit(1 if h.issues.size() else 0)

func _progress_key() -> String:
	if G.S == null: return "-"
	var c = G.S.get("qiheChapter")
	var pr: Dictionary = G.S.get("prologue", {})
	# 第一夜还没进主线：看叶家允许进门、看过遗物、过了夜这几个标记
	var night := "%s%s%s" % [int(bool(pr.get("yeHousePermission", false))), int(bool(pr.get("relicSeen", false))), int(bool(pr.get("rested", false)))]
	return "%s|%s|%s|%s|%s|%d" % [pr.get("arrival", {}).get("stage", "-"), night, c.stage if c else "-", c.get("halfDay", "-") if c else "-", G.mode,
		(c.get("events", {}) as Dictionary).size() if c else (pr.get("heard", {}) as Dictionary).size()]

func run() -> void:
	var path: String = args.get("savecheck", "")
	var s = JSON.parse_string(FileAccess.get_file_as_string(path))
	if not (s is Dictionary):
		h.issue("读档失败", "存档读不出来", path); return
	if not World.scenes.has(s.get("scene", "")):
		h.issue("读档失败", "存档里的场景已经不存在", str(s.get("scene"))); return
	h.ctx("读档 " + path.get_file())
	# 1. 读档：和标题页“继续进度”同一条路（序章、主线、培养模式各自接着往下）
	var st: Dictionary = s.duplicate(true)
	G.save_key = key
	var loaded: bool = await h.guard("读档进场", func(): await Flow.prologue().start(false, G._fix_numbers(st)), 120, func(): return G.mode == "cultivation")
	if loaded and G.mode == "scene": loaded = await h.idle(60)
	result.loaded = loaded; result.mode = G.mode; result.scene = World.cur_id; result.before = _progress_key()
	if not loaded:
		h.issue("卡住", "读档后动不了", "场景 %s" % World.cur_id); return
	await get_tree().create_timer(1.0).timeout
	h.flush_errors()
	# 培养模式的档：读进来先回到地图，过一会儿才切进培养模式，等它切好再查 Esc
	if s.get("currentMode") == "cultivation":
		for i in 100:
			if G.mode == "cultivation" and Cultivation.get("_active"): break
			await get_tree().create_timer(0.1).timeout
		await get_tree().create_timer(1.0).timeout
	await _esc_check()
	if G.mode == "cultivation":
		# 培养模式的档：界面起来了、几秒内不报错就算过（培养模式自己的流程由 --cultivation=random 测）
		result.cultivation_active = Cultivation.get("_active")
		if not Cultivation.get("_active"): h.issue("读档失败", "培养模式的档读进来，培养界面没起来")
		await _roundtrip()
		await _home_from_cultivation(); return
	# 2. 站的位置
	if not World.stand_ok(World.player.x, World.player.y):
		h.issue("站位", "读档后人站在走不了的地方", "%s (%.0f, %.0f)" % [World.cur_id, World.player.x, World.player.y])
	# 3. 有路可走
	var doors: Dictionary = h.doors_here(World.cur_id)
	result.doors = doors.keys()
	if doors.is_empty() and not Flow.scene_frozen() and not _story_scene():
		h.issue("无路可走", "%s 里一个门、出口都看不见" % World.cur_id)
	# 4. 主线往下走一步
	await _advance()
	result.after = _progress_key()
	if G.mode == "cultivation" and result.get("esc", "").begins_with("scene"):
		# 往下走一步进了培养模式（如邻村上山）：培养模式这一侧也查一次
		await get_tree().create_timer(1.5).timeout
		var first: String = result.esc
		await _esc_check()
		result.esc = first + "；" + str(result.esc)
	if result.after == result.before and not result.get("no_step", false):
		h.issue("主线推不动", "读档后照着主线做了一步，进度没变", "%s → %s" % [result.before, result.after])
	await _roundtrip()
	if G.mode == "cultivation": await _home_from_cultivation()

## 序章后山、过夜这些场景本来就锁在剧情里，没有门是对的
func _story_scene() -> bool:
	return World.cur_id in ["prologue_backhill", "qh_mountain"] or G.S.get("prologue", {}).get("arrival", {}).get("stage", "done") != "done"

func _advance() -> void:
	var P: Node = Flow.prologue(); var C: Node = Flow.get_node("Chapter")
	var a: String = G.S.get("prologue", {}).get("arrival", {}).get("stage", "done")
	if a != "done":
		# 序章：读档时会接着演；没演完的话再走一遍开场流程（与“继续进度”一样，start 会接着 play_arrival）
		h.ctx("序章接着演")
		await h.guard("序章", func(): await P.play_arrival(), 240)
		await h.idle(60); return
	var c = G.S.get("qiheChapter")
	if c == null:
		# 第一夜：找叶家门 → 叶蘅 → 借宿榻（看此刻哪一个能做）
		h.ctx("第一夜")
		for step in [["qihe_trial", "ye-door"], ["prologue_ye_house", "ye"], ["prologue_chen_guest", "rest"]]:
			var k0 := _progress_key()
			if not await h.walk_to(step[0]): continue
			var n = h._npc_by_id(step[1])
			if n == null: continue
			# 叶蘅这类有人物表的人按 E 先弹墨印，这里和自动通关一样直接触发她的“谈”
			World.busy = true
			await h.guard("第一夜 " + step[1], func(): await n.act.call(n), 240)
			World.busy = false
			await h.idle(60)
			if _progress_key() != k0 or G.S.get("qiheChapter") != null: return
		return
	match str(c.stage):
		"days":
			var m = C.main_step()
			if m == null: result.no_step = true; return
			if m.get("aqi"): result.no_step = true; return   # 小耗子的一课要玩偷窃小游戏，人物扫荡测
			h.ctx("主线：" + str(m.title))
			var hd0: int = c.halfDay
			var k0 := _progress_key()
			if not await h.walk_to(m.scene):
				await h.idle(60)
				if _progress_key() == k0: h.issue("到不了", "读档后走不到「%s」要去的 %s" % [m.title, m.scene])
				return   # 半路剧情已经往下走了（如出村时起火），算推进了
			await h.idle(60)
			if G.S.qiheChapter.halfDay != hd0: return
			var n = null
			for x in World.npcs_of(World.cur):
				if String(x.get("name", "")).split(" · ")[0] == str(m.who): n = x
			if n == null: h.issue("人不在场", "「%s」要找的%s不在 %s" % [m.title, m.who, m.scene]); return
			await h.guard("主线 " + str(m.title), func(): await C.interact(m.npc), 240)
			await h.idle(60)
		"refuge":
			var ev: bool = c.get("events", {}).get("evidence-v2", false)
			var id := "zhouyan" if ev else "evidence"
			var n = h._npc_by_id(id)
			if n == null: h.issue("人不在场", "邻村找不到 " + id); return
			await h.guard("邻村 " + id, func(): await n.act.call(n), 240, func(): return G.mode == "cultivation")
			if G.mode == "scene": await h.idle(60)
		_:
			h.ctx("恢复主线 " + str(c.stage))
			await h.guard("恢复主线", func(): await C.resume(), 240, func(): return G.mode == "cultivation")
			if G.mode == "scene": await h.idle(60)

## 5. 再存一次能原样读回
func _roundtrip() -> void:
	h.ctx("存档往返")
	G.save_key = key
	G.save()
	var back = G.read(key)
	if back == null: h.issue("存档往返", "存下去的档读不回来"); return
	if str(back.get("scene")) != str(G.S.get("scene")): h.issue("存档往返", "读回来的场景不一样", "%s ≠ %s" % [back.get("scene"), G.S.get("scene")])
	h.flush_errors()

## Esc 菜单统一（2026-11-05 用户：“esc 弹出来的菜单是不一样的，这肯定要统一”）：
## 探索地图和培养模式里，没开着别的东西时按 Esc 都要打开同一个江湖菜单的设置页；关掉后回到原来的模式
func _esc_check() -> void:
	var mode0 := G.mode
	if mode0 == "cultivation":
		var cs: Dictionary = Cultivation.state()
		if cs.get("pending") or cs.get("summary") or Cultivation.view != null or cs.get("mode") != "home" or Cultivation._dialog() != null:
			result.esc = "cultivation：正有对白或小窗，Esc 不该弹菜单，跳过"; return
	elif mode0 != "scene" or not h.free_now():
		result.esc = "此刻不能自由走动，跳过"; return
	h.ctx("Esc 菜单（%s）" % mode0)
	var e := InputEventKey.new(); e.keycode = KEY_ESCAPE; e.physical_keycode = KEY_ESCAPE; e.pressed = true
	if mode0 == "cultivation": Cultivation._input(e)
	else: Menu._unhandled_input(e)
	await get_tree().process_frame
	if not Menu.s.open:
		result.esc_state = {"active": Cultivation.get("_active"), "mode": G.mode, "view": Cultivation.view, "modal": Cultivation._dialog() != null, "fighting": Cultivation.fighting,
			"broken": Cultivation.broken != null, "cmode": Cultivation.state().get("mode") if G.S else null, "world_busy": World.busy, "dlg_busy": Dialog.busy, "panel": UI.panel_open()}
		h.issue("Esc 菜单", "%s里按 Esc 没打开江湖菜单" % ("培养模式" if mode0 == "cultivation" else "探索地图")); result.esc = "没打开"; return
	if str(Menu.s.page) != "sys":
		h.issue("Esc 菜单", "%s里按 Esc 打开的不是设置页（是 %s）" % [mode0, Menu.s.page])
	result.esc = "%s → 江湖菜单 %s 页" % [mode0, Menu.s.page]
	Menu.close()
	for i in 30:
		await get_tree().process_frame
		if G.mode == mode0: break
	if G.mode != mode0: h.issue("Esc 菜单", "关掉菜单后没回到%s（现在是 %s）" % [mode0, G.mode])
	await h.idle(10)

## 培养模式里 Esc → 江湖菜单 → 返回首页：要真回到标题，培养界面不能再盖回来
func _home_from_cultivation() -> void:
	var cs: Dictionary = Cultivation.state()
	if cs.get("pending") or cs.get("summary") or Cultivation.view != null or cs.get("mode") != "home" or Cultivation._dialog() != null:
		result.home = "正有对白或小窗，跳过"; return
	h.ctx("培养模式返回首页")
	var e := InputEventKey.new(); e.keycode = KEY_ESCAPE; e.physical_keycode = KEY_ESCAPE; e.pressed = true
	Cultivation._input(e)
	await get_tree().process_frame
	if not Menu.s.open: h.issue("返回首页", "培养模式里 Esc 没打开菜单"); return
	# 菜单“返回首页”在正式旅程里走 G.save_command("home")：存档、下一帧 Flow.to_title，然后关菜单。
	# 测试存档名不是正式旅程，那条命令会被挡（不许改正式存档，这是对的），这里照它通过后的顺序重放
	G.save(); Flow.to_title.call_deferred(); Menu.close()
	for i in 40: await get_tree().process_frame
	var title := false
	for c in get_tree().root.get_children():
		if c.scene_file_path.ends_with("title.tscn"): title = true
	result.home = "标题页 %s，模式 %s，培养界面 %s" % [title, G.mode, Cultivation.get("_active")]
	if not title or G.mode != "title" or Cultivation.get("_active"):
		h.issue("返回首页", "培养模式里从江湖菜单返回首页后没干净地回到标题", result.home)
