extends Node
## 批量截图：一个进程按清单依次进入各画面截图，全部截完退出（不必每张图重启一次 Godot、不在桌面反复弹窗）。
## 用法：tools/gd_bg.sh --resolution 1280x720 -- --shots=<清单.json>
## 清单：[{"args": {与命令行同名的测试参数，如 "scene":"qihe_trial","at":"1200,800"}, "out": "png 路径", "ms": 等待毫秒}, …]
## 培养模式截图（"cultivation":"shot:p3"）等 cu_shot 就绪标记，不按毫秒；人物交互、菜单按 ms 等。
## 顺序注意：人物交互（"npc"）要排在菜单（"state"+"open"）之前——菜单步骤留下的状态会让叶家站位不出人；战斗类放最后。

var boot: Node
var list_path := ""

func _ready() -> void:
	var steps = JSON.parse_string(FileAccess.get_file_as_string(list_path))
	if not (steps is Array):
		push_error("批量截图：清单读不出来 " + list_path); get_tree().quit(1); return
	await get_tree().process_frame
	var sc := DisplayServer.window_get_current_screen()
	print("批量截图：窗口位置 %s，在第 %d 块屏（%s，屏幕原点 %s）" % [DisplayServer.window_get_position(), sc, DisplayServer.screen_get_size(sc), DisplayServer.screen_get_position(sc)])
	var t0 := Time.get_ticks_msec()
	var ok := 0
	for st in steps:
		await _reset()
		var args: Dictionary = st.get("args", {})
		seed(str(st.get("out", "")).get_file().hash())   # 截图对比要可重复：闲逛路人、粒子这些随机量每张固定种子
		boot.run(args)   # 不 await：战斗等协程会一直跑到结束，这里只等画面就绪
		if args.has("cultivation") and str(args.cultivation).begins_with("shot:"):
			var w := 0.0
			while str(Cultivation.get_meta("shot_ready", "")) == "" and w < 90.0:
				await get_tree().create_timer(0.2).timeout; w += 0.2
		if st.has("times"):
			# 同一场演出按时间点连拍（如领队交锋）：out 里的 {t} 换成毫秒；放在清单最后，演出没法中途收起
			# "zero":"clash_caption" 从第一句喊话出现起计时（原版 tools/capture_web_clash.cjs 同样以喊话框出现为零点），载入与入场时长不计
			if st.get("zero", "") == "clash_caption":
				var w2 := 0.0
				while w2 < 60.0 and not (Battle.B != null and Battle.B.opt.get("storyLesson") != null and Battle.B.opt.storyLesson.caption != null):
					await get_tree().process_frame; w2 += get_process_delta_time()
			var s0 := Time.get_ticks_msec()
			var tasks := []
			for t in st.times:
				var wait := float(int(t) - (Time.get_ticks_msec() - s0)) / 1000.0
				if wait > 0: await get_tree().create_timer(wait).timeout
				await RenderingServer.frame_post_draw
				# 连拍时 PNG 编码放到后台线程：主线程卡 0.2 秒以上，战斗时钟（每帧最多走 50ms）就会被拖慢，后面几张越拍越晚
				var img := get_viewport().get_texture().get_image()
				var path := str(st.out).replace("{t}", str(int(t)))
				DirAccess.make_dir_recursive_absolute(path.get_base_dir())
				tasks.append(WorkerThreadPool.add_task(func(): img.save_png(path)))
				ok += 1
				print("连拍 %d 毫秒：实际 %d，帧率 %d" % [int(t), Time.get_ticks_msec() - s0, Engine.get_frames_per_second()])
			for id in tasks: WorkerThreadPool.wait_for_task_completion(id)
			continue
		await get_tree().create_timer(float(st.get("ms", 1500)) / 1000.0).timeout
		# "keys": ["escape"]：截图前先按这些键（每个隔 0.5 秒），看按键弹出的界面
		for kname in st.get("keys", []):
			var kc := OS.find_keycode_from_string(str(kname))
			for pressed in [true, false]:
				var e := InputEventKey.new(); e.keycode = kc; e.physical_keycode = kc; e.pressed = pressed
				Input.parse_input_event(e)
			await get_tree().create_timer(0.5).timeout
		if st.has("keys"): await get_tree().create_timer(0.6).timeout
		await RenderingServer.frame_post_draw
		if _save(str(st.out)): ok += 1
		print("批量截图 %d/%d %s" % [ok, steps.size(), st.out])
	print("批量截图完成：%d 张，用时 %.1f 秒" % [ok, (Time.get_ticks_msec() - t0) / 1000.0])
	get_tree().quit()

func _save(path: String) -> bool:
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	return get_viewport().get_texture().get_image().save_png(path) == OK

## 收起上一张的画面：菜单、人物交互、培养、标题页；地图停用，存档清空
func _reset() -> void:
	var m = get_node_or_null("/root/Menu")
	if m and m.has_method("close"): m.close()
	var n = get_node_or_null("/root/Npc")
	if n and n.has_method("close_panels"): n.close_panels()
	if Cultivation.get("layer") != null and Cultivation.layer.visible: Cultivation.leave()
	Cultivation.set_meta("shot_ready", "")
	for c in get_tree().root.get_children():
		if c == boot or c.get_parent() != get_tree().root: continue
		if c.scene_file_path.ends_with("title.tscn"):
			c.queue_free()
			Lights.vignette(false)   # 标题页开的暗角，正常“从头开始”会关；这里直接收起也要关，否则后面各张都被压暗
	# 人物交互等界面关掉后可能还挂在 UI 面板栈里，菜单会以为有面板开着而不打开
	for pn in UI._panels.duplicate():
		if is_instance_valid(pn) and pn.is_inside_tree(): pn.queue_free()
	UI._panels.clear()
	Dialog.busy = false
	World.active = false; World.busy = false
	G.S = null; G.mode = "title"
	UI.hud()
	await get_tree().create_timer(0.3).timeout
