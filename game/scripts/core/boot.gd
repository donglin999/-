extends Node
var title: Node = null
## 启动：读命令行（测试与截图用），否则进标题页。
## 测试参数（-- 之后）：--scene=<场景id> [--at=x,y] [--capture=毫秒,毫秒 --out=目录] [--quit-after=毫秒]

func _ready() -> void:
	# 后台测试（tools/gd_bg.sh）要求窗口开在虚拟屏上：不在就立刻退出，免得在用户的实际屏幕上跑
	# 只管带窗口的运行：无头的测试与截图并行时也会读到同一份 override.cfg，它们本来就不开窗口
	if ProjectSettings.has_setting("selftest/expect_screen") and DisplayServer.get_name() != "headless":
		var want := int(ProjectSettings.get_setting("selftest/expect_screen"))
		var sc := DisplayServer.window_get_current_screen()
		var sz := DisplayServer.screen_get_size(sc)
		var want_sz := str(ProjectSettings.get_setting("selftest/expect_screen_size", ""))
		if sc != want or (want_sz != "" and "%dx%d" % [sz.x, sz.y] != want_sz):
			printerr("【gd_bg】窗口没在虚拟屏上（在第 %d 块屏 %s，应在第 %d 块 %s），不跑了" % [sc, sz, want, want_sz])
			get_tree().quit(3); return
		print("【gd_bg】窗口在虚拟屏上：第 %d 块屏 %s" % [sc, sz])
	await get_tree().process_frame   # 等流程模块装好（Flow 延后安装）
	var args := {}
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	await run(args)

## 按测试参数进入对应画面（也给批量截图 tests/shots.gd 逐步调用）
func run(args: Dictionary) -> void:
	if args.has("checkall"):
		add_child(load("res://scripts/tests/check_all.gd").new())
		return
	if args.has("shots"):
		var r: Node = load("res://scripts/tests/shots.gd").new()
		r.boot = self; r.list_path = args.shots
		add_child(r)
		return
	if args.has("savecheck"):
		add_child(load("res://scripts/tests/savecheck.gd").new())
		return
	if args.has("menu-sweep"):
		add_child(load("res://scripts/tests/menu_sweep.gd").new())
		return
	if args.has("sweep-npc"):
		add_child(load("res://scripts/tests/sweep_npc.gd").new())
		return
	if args.has("walkthrough"):
		add_child(load("res://scripts/tests/walkthrough.gd").new())
		return
	if args.has("scene"):
		G.S = G.new_state()
		G.S.prologue = Flow.prologue().fresh()
		G.S.name = "萧白"; G.S.party = []; G.S.unlocked = {}
		var d0 := G.derived(G.S); G.S.hp = d0.mhp; G.S.mp = d0.mmp
		if args.has("stage"):
			# 调试：--stage=done 表示序章已过；--chapter=<stage>,<halfDay> 造出主线状态
			G.S.prologue.arrival.stage = args.stage; G.S.prologue.arrival.borrowed = args.stage == "done"
		if args.has("chapter"):
			var c: PackedStringArray = args.chapter.split(",")
			G.S.qiheChapter = Flow.get_node("Chapter").initial(); G.S.qiheChapter.stage = c[0]
			if c.size() > 1: G.S.qiheChapter.halfDay = int(c[1])
		G.save_key = "debug"
		G.mode = "scene"
		await Assets.preload_keys(World.scene_asset_keys(args.scene))
		World.enter_scene_now(args.scene)
		if args.has("at"):
			var p: PackedStringArray = args.at.split(",")
			World.player.x = float(p[0]); World.player.y = float(p[1]); World.snap_cam()
		if args.has("dir"): World.player.dir = args.dir
		if args.has("dark"): World.cur.dark = "rgba(13,22,32,.32)"
		if args.has("rod"): World.cur.holdingRod = true; World.player.alpha = 0   # 截图用（2026-11-08）：后山持棍小人
		if args.has("hide-player"): World.player.alpha = 0   # 试玩审查铺图用（2026-11-09）：镜头跟着主角走，主角会被放到屋顶、柱头上，截图时藏起来
		if args.has("no-npcs"):
			World.cur.npcs = []; World.npcs = []; World.wanderers = []
		UI.hud()
	elif args.has("state"):
		# 对照用：载入从原版页面导出的存档（tools/capture_web.cjs --state=文件），再打开指定界面
		G.S = G._fix_numbers(JSON.parse_string(FileAccess.get_file_as_string(args.state)))
		G.save_key = G.new_journey_key() if args.has("savetest") else "debug"; G.mode = "scene"
		await Assets.preload_keys(World.scene_asset_keys(G.S.scene))
		World.enter_scene_now(G.S.scene)
		World.player.x = float(G.S.x); World.player.y = float(G.S.y); World.snap_cam()
		Flow.prologue().apply_scene(World.cur)
		UI.hud()
		if args.has("savetest"): add_child(load("res://scripts/tests/save_test.gd").new())
		if args.has("open"):
			await get_tree().create_timer(0.5).timeout
			get_node("/root/Menu").open(args.open, "hero")
	elif args.has("battle") or args.has("menu") or args.has("cultivation") or args.has("npc"):
		# 子系统单独调试入口：--battle=<预设> / --menu=<页> / --cultivation=<场景> / --npc=<人物>
		for k in ["battle", "menu", "cultivation", "npc"]:
			if args.has(k):
				var node: Node = {"battle": Battle, "menu": Menu, "cultivation": Cultivation, "npc": Npc}[k]
				node.debug_start(args[k])
	else:
		# 标题页挂在根节点下，启动节点留着（测试用的截图、自动推进协程在这里跑）
		var t: Node = load("res://scenes/title.tscn").instantiate()
		get_tree().root.add_child.call_deferred(t)
		title = t
	if args.has("press-enter"):
		_press_enter()
	if args.has("autoplay"):
		_autoplay(int(args.autoplay) if args.autoplay != "1" else 700)
	if args.has("click-new"):
		await get_tree().create_timer(float(args["click-new"]) / 1000.0).timeout
		if is_instance_valid(title): title._new_journey()
	if args.has("until"):
		_until(args.until, args.get("out", "user://cap"))
	if args.has("capture"):
		_capture(args.capture.split(","), args.get("out", "user://cap"))
	if args.has("pathbench"):
		# 寻路耗时：从当前位置到地图各处随机点
		var ms := []
		for i in 20:
			var tx := randf_range(40, World.WW - 40); var ty := randf_range(40, World.WH - 40)
			var t0 := Time.get_ticks_usec(); var p = World.find_path(tx, ty)
			ms.append((Time.get_ticks_usec() - t0) / 1000.0)
		ms.sort(); print("寻路 20 次：中位 %.1f ms，最慢 %.1f ms" % [ms[10], ms[19]])
		get_tree().quit()
	if args.has("fps"):
		# 帧率测试：关垂直同步，统计 5 秒内的平均帧时与最慢帧
		DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
		await get_tree().create_timer(2.0).timeout
		var times := []; var t0 := Time.get_ticks_usec(); var last := t0
		while Time.get_ticks_usec() - t0 < 5_000_000:
			await get_tree().process_frame
			var now := Time.get_ticks_usec(); times.append(now - last); last = now
			if args.fps == "walk": World.keys = {"right": 1} if (now / 1_000_000) % 2 == 0 else {"left": 1}
		times.sort()
		var avg := 0.0
		for t in times: avg += t
		avg /= times.size()
		print("帧数 %d，平均 %.2f ms（%.0f FPS），中位 %.2f ms，最慢 1%% %.2f ms" % [times.size(), avg / 1000.0, 1e6 / avg, times[times.size() / 2] / 1000.0, times[int(times.size() * 0.99)] / 1000.0])
		get_tree().quit()
	if args.has("quit-after"):
		await get_tree().create_timer(float(args["quit-after"]) / 1000.0).timeout
		get_tree().quit()

## 推进到含指定文字的台词，等 2.5 秒截图后退出
func _until(text: String, out: String) -> void:
	DirAccess.make_dir_recursive_absolute(out)
	while true:
		await get_tree().create_timer(0.25).timeout
		if Dialog.visible_now() and text in Dialog._full or (Dialog.visible_now() and text in Dialog.txt.text):
			break
		if Dialog.visible_now():
			if Dialog._go.is_valid(): Dialog._go.call()
			elif Dialog._choice_cb.is_valid(): Dialog._choice_cb.call(0)
	await get_tree().create_timer(2.5).timeout
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(out + "/line.png")
	get_tree().quit()

## 测试：战斗中每 0.3 秒按一次回车（选默认指令、确认目标），检查战斗能从头打到结算
func _press_enter() -> void:
	while true:
		await get_tree().create_timer(0.3).timeout
		if G.mode == "battle" or Dialog.visible_now():
			for pressed in [true, false]:
				var e := InputEventKey.new(); e.keycode = KEY_ENTER; e.physical_keycode = KEY_ENTER; e.pressed = pressed
				Input.parse_input_event(e)

## 测试用自动推进：对白每隔 ms 推进一次，选项选第一个
func _autoplay(ms: int) -> void:
	while true:
		await get_tree().create_timer(ms / 1000.0).timeout
		if Dialog.visible_now():
			if Dialog._go.is_valid(): Dialog._go.call()
			elif Dialog._choice_cb.is_valid(): Dialog._choice_cb.call(0)

func _capture(times: PackedStringArray, out: String) -> void:
	DirAccess.make_dir_recursive_absolute(out)
	var t0 := Time.get_ticks_msec()
	for t in times:
		var ms := int(t)
		while Time.get_ticks_msec() - t0 < ms: await get_tree().process_frame
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png("%s/cap_%05d.png" % [out, ms])
	get_tree().quit()
