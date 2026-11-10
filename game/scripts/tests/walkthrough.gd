extends Node
## 自动通关测试：开新档，对白自动推进，按主线顺序与关键人物交互，记录每一步的阶段与报错；可选每步截图。
## 用法：godot --path game -- --walkthrough [--fast] [--shots=目录] [--choice=first|last|alt|rand:种子] [--player] [--snap=目录] [--report=文件] [--tag=名]
## - 默认（选项选第一个、直接调流程函数）：与原版 tools_scene/qihe/verify_chapter.cjs 一样，对白逐句与原版比对；
## - --choice：换选项策略（last 最后一个、alt 轮流、rand:7 按种子随机），把其他分支也走到；
## - --player：像玩家一样走——沿出口一路走到目标场景（不瞬移），目标人物此刻必须看得见才去交互；到不了、人不在都记问题；
## - --snap=目录：每一步后把进度存一份（全人物扫荡、存档回归用）；
## - 每一步都有看门狗：25 秒没有新台词也没结束记“卡住”；台词里出现“尚未移植”、游戏报错，都记问题；
## - 报告 JSON 写到 --report（缺省 user://walkthrough_<tag>.json）；有问题时退出码 1。

const H := preload("res://scripts/tests/harness.gd")
var h: Node
var log_lines: Array = []
var shots := ""
var snap_dir := ""
var step_n := 0
var snap_n := 0
var args := {}
var player_mode := false
var policy := "first"
var rng := RandomNumberGenerator.new()
var alt_i := 0
var tag := ""
var force_first := false

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	shots = args.get("shots", "")
	snap_dir = args.get("snap", "")
	player_mode = args.has("player")
	policy = args.get("choice", "first")
	if policy.begins_with("rand:"): rng.seed = int(policy.get_slice(":", 1))
	tag = args.get("tag", policy.replace(":", "") + ("-player" if player_mode else ""))
	Flow.skip_battles = true
	if shots != "": DirAccess.make_dir_recursive_absolute(shots)
	if snap_dir != "": DirAccess.make_dir_recursive_absolute(snap_dir)
	h = H.new(); h.driving = false; add_child(h)   # 只用它收报错、看门狗；推进对白、记台词仍在这里（与原版比对的格式不变）
	# 全程测试（2026-11-08）：--battles 开始部分的战斗真打（托管）；--fullrun 进培养后照玩家点按钮推进到汉皋城门
	if args.has("battles") or args.has("fullrun"): Flow.skip_battles = false
	if args.has("fullrun"): set_process_mode(Node.PROCESS_MODE_ALWAYS)
	_auto(15 if args.has("fast") else 120)
	var hook: Callable = Story.play_hook
	Story.play_hook = func(knot, inner):
		knots.append(knot)
		if hook.is_valid(): await hook.call(knot, inner)
		else: await inner.call()
	await run()

var lines: Array = []
var knots: Array = []

var _bkey_t := 0
func _process(_d: float) -> void:
	if not Flow.skip_battles and Battle.B != null:
		if not Battle.B.get("ended", false): _drive_battle()
		elif Time.get_ticks_msec() - _bkey_t > 600:
			# 胜利结算面板等按键：像玩家一样按一下确认
			_bkey_t = Time.get_ticks_msec(); Battle.any_key.emit("ok"); h.progress()
	# 对白框里的内容一出现就记一次（打字机完成前也能拿到全文 Dialog._full）
	if Dialog.visible_now():
		var k: String = (Dialog._cur.get("who", "") + "：" + (Dialog._full if Dialog._full != "" else Dialog.txt.text))
		if Dialog._choice_buttons.size():
			k = "【选项】" + Dialog.txt.text + " → " + "／".join(Dialog._choice_buttons.map(func(b): return b.text.substr(b.text.find(" ")).strip_edges()))
		if lines.is_empty() or lines[lines.size() - 1] != k:
			lines.append(k); h.progress()
			if "尚未移植" in k: h.issue("尚未移植", k)

func pick(n: int) -> int:
	# “进入下一时段”的确认总选“开始”：选“再等等”主线就不动，那是设计如此，不算分支
	if "进入下一时段" in Dialog.txt.text or force_first: return 0
	match policy:
		"last": return n - 1
		"alt": alt_i += 1; return alt_i % n
		"first": return 0
	return rng.randi_range(0, n - 1)

func note(t: String) -> void:
	var p = G.S.get("qiheChapter") if G.S else null
	var s := "[%6.1fs] %s ｜ 场景 %s ｜ 序章 %s ｜ 主线 %s 半日 %s" % [Time.get_ticks_msec() / 1000.0, t, World.cur_id, G.S.prologue.arrival.stage if G.S else "-", p.stage if p else "-", p.halfDay if p else "-"]
	print(s); log_lines.append(s)
	h.ctx(t)

func shot(name: String) -> void:
	h.flush_errors()
	if snap_dir != "" and G.S != null and G.mode == "scene":
		snap_n += 1
		var f := FileAccess.open("%s/%02d-%s.json" % [snap_dir, snap_n, name], FileAccess.WRITE)
		f.store_string(JSON.stringify(h.snapshot())); f.close()
	if shots == "" or DisplayServer.get_name() == "headless": return
	step_n += 1
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png("%s/%02d-%s.png" % [shots, step_n, name])

func _auto(ms: int) -> void:
	while true:
		await get_tree().create_timer(ms / 1000.0).timeout
		if Dialog.visible_now():
			if Dialog._go.is_valid(): Dialog._go.call()
			elif Dialog._choice_cb.is_valid():
				_process(0)   # 先记下选项再选
				Dialog._choice_cb.call(clampi(pick(Dialog._choice_buttons.size()), 0, maxi(0, Dialog._choice_buttons.size() - 1)))
		elif h.key_receiver().is_valid():
			h.key_receiver().call("escape")

func idle() -> void:
	if not await h.idle(90): h.issue("卡住", "做完后玩家动不了", log_lines[log_lines.size() - 1] if log_lines.size() else "")

func npc(scene: String, id: String) -> Dictionary:
	for n in World.scenes[scene].npcs:
		if str(n.get("id")) == id: return n
	return {}

## 去场景 scene 找人物 id：默认直接换场；--player 时沿出口走过去，人得看得见
func goto_npc(scene: String, id: String, who := "") -> Dictionary:
	if World.cur_id != scene:
		note("（%s %s）" % ["走到" if player_mode else "换到", scene])
		if player_mode:
			if not await h.walk_to(scene):
				h.issue("到不了", "从 %s 沿出口走不到 %s" % [World.cur_id, scene], "要去找 " + id); return {}
		elif not await h.guard("换场 " + scene, func(): await World.go_scene(scene)): return {}
	var n := npc(scene, id)
	if n.is_empty() and who != "":
		# 主线步骤写的是人物（如 ye），场景里对应的是 daily-ye 这类站位：按名字找此刻看得见的那个
		for x in World.npcs_of(World.scenes[scene]):
			if String(x.get("name", "")).split(" · ")[0] == who: n = x; break
	if n.is_empty():
		h.issue("找不到人", "%s/%s" % [scene, id]); return {}
	if player_mode and not World.npcs_of(World.cur).has(n):
		h.issue("人不在场", "%s/%s「%s」此刻看不见" % [scene, id, n.get("name", "")]); return {}
	return n

func act(scene: String, id: String) -> void:
	var n := await goto_npc(scene, id)
	if n.is_empty(): return
	note("交互 %s/%s「%s」" % [scene, id, n.get("name", "")])
	# 直接触发“谈”（与原版对照脚本一致，不经墨印菜单）
	World.busy = true
	if n.get("act") is Callable: await h.guard("交互 " + id, func(): await n.act.call(n))
	World.busy = false
	await idle()

func run() -> void:
	var P: Node = Flow.prologue(); var C: Node = Flow.get_node("Chapter")
	G.save_key = "walkthrough" if tag == "first" else "walkthrough_" + tag
	note("开始：从头开始")
	P.start(true)
	await get_tree().create_timer(1.0).timeout
	await idle(); await shot("prologue-done")
	note("序章结束")
	await act("qihe_trial", "ye-door"); await shot("ye-invite")
	await act("prologue_ye_house", "ye"); await shot("relic")
	await act("prologue_chen_guest", "rest"); await shot("first-night")
	note("第一夜结束")
	if player_mode:
		# 玩家：过夜后再点一次借宿榻进入第二天（原版 rest() 里 rested 时转去主线 begin）
		await act("prologue_chen_guest", "rest")
		if C.CP() == null: h.issue("进不了第二天", "过夜后再点借宿榻，主线没有开始")
	else:
		await h.guard("次日开始", func(): await C.begin())
	await idle(); await shot("morning")
	var guard := 0
	while C.state().stage == "days" and guard < 12:
		guard += 1
		var m = C.main_step()
		if m == null: break
		note("主线一步：%s" % m.get("title", ""))
		if m.get("aqi"):
			# 小耗子“窃”的一课要操作墨印与偷窃小游戏，自动通关里两边都直接记为学过（原版 verify_route_sweep.cjs 同样做法）
			G.S.aqiTeach = {"wage": 1}
			continue
		if player_mode:
			# 玩家走到该去的地方：一进场景就会问“进入下一时段”（自动选第一个“开始”），那就不必再找人
			var hd0: int = C.state().halfDay
			if World.cur_id != m.scene:
				note("（走到 %s）" % m.scene)
				if not await h.walk_to(m.scene):
					await idle()
					# 半路剧情已经往下走了（如出村时起火），不算走不到
					if C.state().halfDay == hd0 and C.state().stage == "days":
						h.issue("到不了", "从 %s 走不到「%s」要去的 %s" % [World.cur_id, m.get("title", ""), m.scene])
						break
			await idle()
			if C.state().halfDay != hd0 or C.state().stage != "days": await shot("main-%s" % m.get("to", 0)); continue
			var n := await goto_npc(m.scene, m.npc, str(m.get("who", "")))
			if n.is_empty(): break
		await h.guard("主线 " + str(m.get("title", "")), func(): await C.interact(m.npc)); await idle(); await shot("main-%s" % m.get("to", 0))
		if C.main_step() == m and C.state().stage == "days" and policy != "first":
			# 换了选项策略可能是选了“先不去”一类：按第一个选项再来一次
			note("（按第一个选项重试）")
			force_first = true
			await h.guard("主线重试 " + str(m.get("title", "")), func(): await C.interact(m.npc)); await idle()
			force_first = false
		if C.main_step() == m and C.state().stage == "days":
			h.issue("主线没推进", "做完「%s」后还停在这一步" % m.get("title", "")); break
	note("离村后：" + C.state().stage)
	await idle()
	if C.state().stage == "refuge":
		await act("qh_refuge", "evidence"); await shot("evidence")
		# 商量去处 → 上山 → 拜师 → 进入培养模式（培养界面接管，不再返回）：只触发，等模式切到 cultivation
		var z := await goto_npc("qh_refuge", "zhouyan")
		for attempt in 2:
			if z.is_empty() or G.mode == "cultivation": break
			force_first = attempt > 0
			note("交互 qh_refuge/zhouyan「周砚」（直到进入培养模式）" + ("（按第一个选项重试）" if attempt > 0 else ""))
			z.act.call(z)
			var t0 := Time.get_ticks_msec(); var free_since := 0
			h.progress()
			while G.mode != "cultivation" and Time.get_ticks_msec() - t0 < 180000:
				await get_tree().create_timer(0.1).timeout
				# 选了“我再想想”之类：回到地图能走动了，说明这次没上山
				if h.free_now() and G.mode == "scene":
					if free_since == 0: free_since = Time.get_ticks_msec()
					elif Time.get_ticks_msec() - free_since > 2000: break
				else: free_since = 0
				if Time.get_ticks_msec() - h._last_progress > h.stall_s * 1000:
					h.issue("卡住", "去培养模式的路上", "场景 %s，最后一句：%s" % [World.cur_id, lines[lines.size() - 1] if lines.size() else "-"]); break
		force_first = false
		await get_tree().create_timer(1.5).timeout
		await shot("cultivation")
		if args.has("fullrun") and G.mode == "cultivation": await FullRun.new().run(self)
	else:
		h.issue("没走到邻村", "离村后阶段是 " + C.state().stage)
	if G.mode != "cultivation": h.issue("没进培养模式", "结束时模式 " + G.mode)
	note("结束：主线阶段 " + C.state().stage + "，模式 " + G.mode)
	var sfx := "" if tag == "first" else "_" + tag
	var f := FileAccess.open("user://walkthrough%s.log" % sfx, FileAccess.WRITE)
	f.store_string("\n".join(log_lines)); f.close()
	var f2 := FileAccess.open("user://walkthrough%s_lines.txt" % sfx, FileAccess.WRITE)
	f2.store_string("\n".join(lines)); f2.close()
	print("对白行数 ", lines.size())
	var f3 := FileAccess.open("user://walkthrough%s_knots.txt" % sfx, FileAccess.WRITE)
	f3.store_string("\n".join(knots)); f3.close()
	h.write_report(args.get("report", "user://walkthrough%s.json" % sfx), {"lines": lines.size(), "tag": tag, "policy": policy, "player": player_mode, "steps": log_lines.size(), "mode": G.mode})
	await get_tree().create_timer(0.5).timeout
	get_tree().quit(1 if h.issues.size() else 0)


## 战斗真打：能托管的开托管；教学战斗不能托管，就像玩家一样连按确认（卡住时换一项再确认）
var _bstuck := 0
var battles := 0
var _bsig := ""
var _bsig_t := 0
func _drive_battle() -> void:
	var B: Dictionary = Battle.B
	if not B.has("_fr_noted"):
		B._fr_noted = true
		var names := []
		for f in B.get("foes", []): names.append(str(f.get("name", "?")))
		battles += 1
		note("（战斗）第 %d 场：%s%s" % [battles, "、".join(names), "（教学）" if B.opt.get("storyLesson") else ""])
	# 战斗在推进（回合或血量变了）就算有进展，免得托管打得久被看门狗当成卡住
	var sig := str(B.get("round", 0))
	for u in B.get("units", []): sig += "," + str(u.get("hp", 0))
	if sig != _bsig: _bsig = sig; _bsig_t = Time.get_ticks_msec(); h.progress()
	elif Time.get_ticks_msec() - _bsig_t > 20000 and _bsig_t > 0:
		_bsig_t = 0
		var cur = B.get("cur")
		h.issue("战斗卡住", "20 秒没有变化", "回合 %s，轮到 %s，托管 %s/%s，按键 %s，对白 %s，结束 %s，模式 %s，暂停 %s" % [B.get("round"), cur.get("name") if cur is Dictionary else "-", Battle.auto.allowed(), B.get("auto"), B.get("key") is Callable and B.key.is_valid(), Dialog.busy, B.get("ended"), G.mode, get_tree().paused])
	if Battle.auto.allowed():
		if not B.get("auto", false) and int(B.get("round", 0)) >= 1: Battle.auto.toggle(); h.progress()
		return
	var now := Time.get_ticks_msec()
	if Dialog.busy or now - _bkey_t < 350: return
	if B.get("key") is Callable and B.key.is_valid():
		_bkey_t = now
		_bstuck += 1
		if _bstuck % 7 == 0: B.key.call("down")
		B.key.call("ok"); h.progress()
	else: _bstuck = 0
