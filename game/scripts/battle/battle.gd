extends Node
## 战斗入口（自动加载 Battle）。接口：await Battle.start(opt) -> "win"/"lose"/"flee"
## 对应原版：js/battle.js battle()/battleStoryLesson()、prologue-story-battle.js play()、qihe-chapter.js storyBattle()、vfx.js BT。
## 状态 B 与原版同名同键（Dictionary）；规则在 rules.gd，画布在 view.gd/screen.gd，DOM 界面在 panel.gd。

const W := 960.0
const H := 540.0
const Rules := preload("res://scripts/battle/rules.gd")
const View := preload("res://scripts/battle/view.gd")
const Screen := preload("res://scripts/battle/screen.gd")
const BPanel := preload("res://scripts/battle/panel.gd")
const Lesson := preload("res://scripts/battle/lesson.gd")
const Auto := preload("res://scripts/battle/auto.gd")
const Vfx := preload("res://scripts/battle/vfx.gd")
const Cam := preload("res://scripts/battle/cam.gd")

var B = null                 # 原版全局 B；null 表示不在战斗中
var rules: Rules
var auto: Auto
var cam: Cam
var vfx: Vfx
var layer_world: CanvasLayer # layer 10：舞台（镜头＋震屏）
var layer_screen: CanvasLayer # layer 11：顺序条、横幅、大字
var layer_ui: CanvasLayer    # layer 12：#bt DOM 界面
var view: View
var screen: Screen
var panel: BPanel

# ── 战斗时钟 BT（vfx.js window.BT）：now() 扣除顿帧；stop(ms) 冻结 ──
var _fz := 0.0
var _s0 := 0.0
var _s1 := 0.0

func pn() -> float: return Time.get_ticks_usec() / 1000.0
func _settle(r: float) -> void:
	if _s1 > 0 and r >= _s1:
		_fz += _s1 - _s0; _s0 = 0; _s1 = 0
func bt_now() -> float:
	var r := pn(); _settle(r)
	return (_s0 if _s1 > 0 else r) - _fz
func bt_stop(ms: float) -> void:
	var r := pn(); _settle(r)
	if not (ms > 0): return
	if _s1 > 0: _s1 = maxf(_s1, r + ms)
	else: _s0 = r; _s1 = r + ms
func bt_frozen() -> bool:
	_settle(pn()); return _s1 > 0

## 原版 wait(ms)：真实时间
func wait(ms: float) -> void:
	if ms <= 0: await get_tree().process_frame; return
	await get_tree().create_timer(ms / 1000.0).timeout

## VFX.btWait(ms)：按战斗时钟等待（顿帧期间不前进）
func bw(ms: float) -> void:
	var end := bt_now() + maxf(0.0, ms)
	await get_tree().process_frame
	while bt_now() < end:
		await get_tree().process_frame

## 原版 bsfx(名, 音量 0..1, 速率)：Audio.sfx 已按原版音量比例与播放速率实现
func sfx(n: String, v := 1.0, rate := 1.0) -> void:
	Audio.sfx(n, v, rate)

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

## 调试入口：godot --path game -- --battle=backhill_wolf
func debug_start(arg: String) -> void:
	if G.S == null:
		G.S = G.new_state()
		G.S.name = "萧白"
		var d := Stats.derived(G.S)
		G.S.hp = d.mhp; G.S.mp = d.mmp
	G.mode = "scene"
	await get_tree().process_frame
	if arg == "clash_sim":
		# 自检：与原版 node -e "require('./js/qihe-faction-clash-rules.js').simulate()" 的结果逐项对照
		var s := Clash.R.simulate()
		var a := []
		for u in s.units.values(): a.append([u.key, u.hp, u.mp, u.bp, u.shield, preload("res://scripts/npc/util.gd").t(u.get("broken", false))])
		print("[battle] clash_sim ", JSON.stringify(a), " ", JSON.stringify(s.log.map(func(r): return r.hits.map(func(h): return h.damage))))
		return
	if arg == "hits":
		# 截图用（2026-11-08）：开一场战斗，2.5 秒后每 0.9 秒放一种通用命中（棍、拳、剑、暗器由主角打山贼；刀、咬、啄、毒由山贼打主角）
		var f := {"name": "山贼", "sp": "c_bandit", "lv": 3, "st": {"str": 5, "con": 9, "agi": 4, "wil": 3, "wis": 3}, "skills": {"blade": 1}, "hpMul": 9}
		start({"foes": [f], "solo": true, "noLose": true})
		await get_tree().create_timer(2.5).timeout
		for ty in ["棍", "拳", "剑", "暗器", "刀", "咬", "啄", "毒"]:
			if B == null: return
			var hero: Dictionary = B.allies[0]; var foe: Dictionary = B.foes[0]
			var mine: bool = ty in ["棍", "拳", "剑", "暗器"]
			print("[battle] hits %d %s" % [Time.get_ticks_msec(), ty])
			vfx.hit(hero if mine else foe, foe if mine else hero, ty, null, 0)
			await get_tree().create_timer(0.9).timeout
		return
	if arg.begins_with("skills"):
		# 截图用（2026-11-10 第二批招式特效概念图）：萧白、叶蘅、苏芷、殷红缨对山贼头目和山贼，按清单依次真放一招（走 rules.do_skill，人物出手帧、现有特效都是游戏里的样子）。
		# --battle=skills:fuhu,liuye 只放这几招；每招之间隔 2.4 秒，开场 2.5 秒后放第一招（连拍按这个时间表取帧）
		var S: Dictionary = G.S
		S.lv = 8; S.st = {"str": 9, "con": 9, "agi": 30, "wil": 9, "wis": 9}
		S.skills = {"fuhu": 1, "qh_hulu_staff": 1}
		S.party = ["ye", "suzhi", "yinhongying"]
		var solo := arg.contains("solo")   # skills_solo：只有萧白（现行游戏里的战斗都是单人），后山背景
		var d := Stats.derived(S)
		S.hp = d.mhp; S.mp = d.mmp
		var chief := {"name": "山贼头目", "sp": "c_chief", "kind": "chief", "lv": 3, "st": {"str": 5, "con": 9, "agi": 1, "wil": 3, "wis": 3}, "skills": {"ghost": 1}, "hpMul": 20}
		var band := {"name": "山贼", "sp": "c_bandit", "lv": 3, "st": {"str": 5, "con": 9, "agi": 1, "wil": 3, "wis": 3}, "skills": {"blade": 1}, "hpMul": 20, "shield": 9}   # 护盾厚：截图时不被打破，看清招式本身
		start({"foes": [band] if solo else [chief, band], "noLose": true, "solo": solo, "bg": "bb_prologue_backhill_v1" if solo else ""})
		await get_tree().create_timer(2.5).timeout
		# 招式 → 谁放、打谁（ally 打敌人一个／全体；sup 给己方）
		var plan := [["fuhu", 0, "foe1"], ["qh_hulu_staff", 0, "foe1"], ["liuye", 3, "foes"], ["jinzhen", 2, "foe1"], ["dingshen", 2, "ally0"],
			["huichun", 1, "ally0"], ["baicao", 1, "allies"], ["ghost", -1, "allies"]]
		var only := arg.get_slice(":", 1).split(",", false) if arg.contains(":") else []
		for p in plan:
			if B == null: return
			if only.size() and not (p[0] in only): continue
			var u: Dictionary = B.foes[0] if p[1] < 0 else B.allies[mini(p[1], B.allies.size() - 1)]
			var tg: Array = {"foe1": [B.foes[0]], "foes": B.foes.duplicate(), "ally0": [B.allies[0]], "allies": B.allies.duplicate()}[p[2]]
			u.mp = 999
			var side: String = u.side
			if u.side == "ally" and Stats.skill_why(u, p[0]) != "":
				print("[battle] skills 条件不足照放：%s %s" % [p[0], Stats.skill_why(u, p[0])]); u.side = "debug"
			print("[battle] skills %d %s %s" % [Time.get_ticks_msec(), p[0], u.name])
			panel.hide_cmd(); panel.hint("")   # 截参考图：指令菜单不挡画面
			rules.do_skill(u, p[0], tg, 0)
			await get_tree().create_timer(2.4).timeout
			u.side = side
		return
	if arg == "xf":
		# 试玩（2026-11-08）：带内功和师承招式打一场山贼，看暴露、卸力、守势、援护、目眩这些效果
		var S: Dictionary = G.S
		S.lv = 8; S.st = {"str": 8, "con": 8, "agi": 8, "wil": 12, "wis": 9}
		S.skills = {"gy_s3": 1, "gy_s4b": 1, "gy_s5b": 1, "gy_p4": 1, "jc_n3": 1, "gj_h1": 1}
		S.xinfa = {"main": "xf_cunjin", "subs": ["xf_guanlan"], "known": ["xf_cunjin", "xf_guanlan"], "lv": {"xf_cunjin": 5, "xf_guanlan": 5}, "prog": {}}
		S.weapon = "iron"   # 铁剑：剑招能用
		S.party = ["ye"]
		var d := Stats.derived(S)
		S.hp = d.mhp; S.mp = d.mmp
		var f := {"name": "山贼", "sp": "c_bandit", "lv": 6, "st": {"str": 7, "con": 7, "agi": 6, "wil": 4, "wis": 4}, "skills": {"blade": 1}, "hpMul": 0.9}
		var r0: String = await start({"foes": [f, f.duplicate(), f.duplicate()], "allowAuto": true})
		print("[battle] 调试战斗结束：xf → ", r0)
		return
	while true:
		var r: String = await clash_play() if arg == "clash" else await start(Lesson.debug_opt(arg))
		print("[battle] 调试战斗结束：", arg, " → ", r)
		if not OS.get_cmdline_user_args().has("--loop"): break

## 领队交锋（qihe-faction-clash.js QiheFactionClash.play）：主线起火前调用，演完返回 "stopped"
const Clash := preload("res://scripts/battle/clash.gd")
func clash_play() -> String:
	if B != null: push_error("已有战斗正在进行"); return ""
	return await Clash.play(self)

# ───────── 开始 ─────────
func start(opt: Dictionary) -> String:
	if B != null: push_error("已有战斗正在进行"); return "lose"
	var snapshot = null
	if opt.has("preset"):
		# prologue-story-battle.js / qihe-chapter.js：剧情战斗不改存档，结束后还原
		snapshot = G.S.duplicate(true) if G.S != null else null
		opt = Lesson.build(opt.preset, opt)
		if opt.is_empty(): return "lose"
	var prev_mode: String = G.mode
	var prev_world: bool = World.active if "active" in World else true
	var result := "lose"
	await _preload(opt)
	if opt.get("storyLesson"): result = await _story_lesson(opt, prev_mode)
	else: result = await _normal(opt, prev_mode)
	if "active" in World: World.active = prev_world
	if snapshot != null:
		G.S = snapshot
		G.mode = prev_mode if prev_mode != "battle" else "scene"
		if G.S != null and G.mode == "scene": G.save()
	return result

## 开战前载入背景、精灵表、立绘（battle.js battle() 开头 / prologue-story-battle.js preload）
func _preload(opt: Dictionary) -> void:
	var keys := []
	var bg: String = opt.get("bg", "")
	if bg != "": keys.append(bg)
	var ab := View.asset_for(bg)
	if ab != "": keys.append(ab)
	var arts := [opt.get("heroArt", "hero")]
	for f in opt.get("foes", []): arts.append(str(f.get("sp", "")).trim_prefix("c_"))
	arts.append_array(opt.get("preloadArts", []))
	var bart = DB.g("BART")
	for a in arts:
		if bart and bart.has(a): keys.append(bart[a].file)
	for p in opt.get("preloadPorts", []): keys.append(p)
	var have := []
	for k in keys:
		if Assets.has(k) and not have.has(k): have.append(k)
	await Assets.preload_keys(have)

func _mount(opt: Dictionary, allies: Array, foes: Array) -> void:
	B = {"opt": opt, "allies": allies, "foes": foes, "units": allies + foes, "bg": opt.get("bg", ""), "round": 0, "fx": [], "parts": [], "shake": 0.0,
		"cur": null, "order": [], "next": [], "done": [], "bpUse": 0, "jit": {}, "key": Callable(), "click": Callable(), "pickCard": Callable(), "redraw": Callable(),
		"hover": null, "tgtList": null, "tgtAll": false, "tsel": 0, "t0": pn(), "banner": null, "big": null, "pv": Callable(), "auto": false, "ended": false}
	_fz = 0; _s0 = 0; _s1 = 0
	rules = Rules.new(self)
	auto = Auto.new(self)
	if "--auto" in OS.get_cmdline_user_args() and opt.get("allowAuto"): B.auto = true   # 评审截图用：调试战斗一开局就托管
	cam = Cam.new(self)
	vfx = Vfx.new(self)
	layer_world = CanvasLayer.new(); layer_world.layer = 10; add_child(layer_world)
	layer_screen = CanvasLayer.new(); layer_screen.layer = 11; add_child(layer_screen)
	layer_ui = CanvasLayer.new(); layer_ui.layer = 12; add_child(layer_ui)
	view = View.new(); view.bt = self; layer_world.add_child(view)
	screen = Screen.new(); screen.bt = self; layer_screen.add_child(screen)
	panel = BPanel.new(); panel.bt = self; layer_ui.add_child(panel)
	rules.layout_units(allies, foes, opt)
	# audio.js qiheSoundscape：新的 B → 战斗曲从头放；battleLoop 结束（settledBattle）后停
	Audio.battle_obj = B; Audio.battle_bg = str(B.bg); Audio.battle_settled = false
	G.mode = "battle"
	if "active" in World: World.active = false
	UI.prompt_hide()
	if UI.hud_node: UI.hud_node.visible = false
	if UI.tpad: UI.tpad.visible = false

func _unmount(prev_mode: String) -> void:
	if B != null:
		B.key = Callable(); B.click = Callable(); B.pickCard = Callable(); B.redraw = Callable(); B.tgtList = null
	for n in [layer_world, layer_screen, layer_ui]:
		if is_instance_valid(n): n.queue_free()
	layer_world = null; layer_screen = null; layer_ui = null; view = null; screen = null; panel = null
	B = null
	G.mode = "scene" if prev_mode == "map" or prev_mode == "battle" else prev_mode
	if UI.tpad: UI.tpad.visible = UI.touch_mode()
	UI.hud()

# ───────── 普通战斗（battle.js battle()） ─────────
func _normal(opt: Dictionary, prev_mode: String) -> String:
	var S: Dictionary = G.S
	var hp_before = S.get("hp"); var mp_before = S.get("mp"); var bag_before: Dictionary = S.get("bag", {}).duplicate()
	await UI.fade(func():
		var allies := [Stats.mk_hero()]
		if opt.get("heroArt"): allies[0].art = opt.heroArt
		if opt.get("heroPor"): allies[0].por = opt.heroPor
		if not opt.get("tutorial") and not opt.get("solo"):
			for k in S.get("party", []).slice(0, 3):
				var a = Stats.mk_ally(k)
				if a != null:
					if opt.get("allyArts", {}).has(k): a.art = opt.allyArts[k]
					if opt.get("allyPorts", {}).has(k): a.por = opt.allyPorts[k]
					allies.append(a)
		var foes := []
		var i := 0
		for f in opt.get("foes", []): foes.append(Stats.mk_foe(f, i)); i += 1
		_mount(opt, allies, foes)
		rules.new_jit(); panel.render_cards())
	sfx("whoosh")
	for l in opt.get("intro", []):
		if l is Callable: await l.call()
		else: await Dialog.say("", l)
	if opt.get("tutorial"):
		await Dialog.say("", "【教学】敌人脚下的格子是它的「弱点」，初时显示为「？」。用对应的兵刃或内劲击中弱点，便会削去一层护盾。")
		await Dialog.say("", "护盾削光即「破势」：敌人本回合与下回合无法行动，且受到双倍伤害。")
		await Dialog.say("", "每回合积攒一点「蓄势」（菱形）。出招前按 E / → 或点「＋」投入蓄势：普攻变为连击，武学威力大增。")
	var result: String = await rules.battle_loop()
	Audio.battle_settled = true   # audio.js wrap('battleLoop') finally：settledBattle = B
	auto.finish()
	# 结算
	var hero: Dictionary = B.allies[0]
	var d := Stats.derived(S)
	if opt.get("training"):
		S.hp = hp_before; S.mp = mp_before; S.bag = bag_before
	else:
		S.hp = clampi(hero.hp, 1, d.mhp); S.mp = clampi(hero.mp, 0, d.mmp)
	panel.hide_cmd(); panel.hint("")
	if result == "win" and not opt.get("training"):
		# 内功战后回复（吐故纳新篇三层回内力、五层回气血；担雪诀三／五层回气血）
		var ph := Stats.hv(hero, "postHp")
		var pm := Stats.hv(hero, "postMp")
		if ph > 0: S.hp = mini(d.mhp, int(S.hp) + roundi(d.mhp * ph))
		if pm > 0: S.mp = mini(d.mmp, int(S.mp) + roundi(d.mmp * pm))
	if result == "win":
		var vc = opt.get("victory")
		if vc is Callable and vc.is_valid(): await vc.call()
		else: await victory()
	elif result == "lose":
		await big_text("败", Color("#d9553a"), 1100)
		S.hp = maxi(int(S.hp), roundi(d.mhp * 0.3))
	else: await big_text("脱身", Color("#9fd4ee"), 900)
	await UI.fade(func(): _unmount(prev_mode))
	return result

# ───────── 剧情教学战斗（battle.js battleStoryLesson：不结算，调用方还原存档） ─────────
func _story_lesson(opt: Dictionary, prev_mode: String) -> String:
	var lesson: Lesson = opt.storyLesson
	var result := "lose"
	await UI.fade(func():
		var allies: Array = lesson.allies()
		var foes := []
		if lesson.has_foes(): foes = lesson.foes()
		else:
			var i := 0
			for f in opt.get("foes", []): foes.append(Stats.mk_foe(f, i)); i += 1
		_mount(opt, allies, foes)
		lesson.mount(self)
		rules.new_jit(); panel.render_cards())
	sfx("whoosh")
	for l in opt.get("intro", []): await Dialog.say("", l)
	if lesson.has_run(): result = await lesson.run()
	else:
		result = await rules.battle_loop()
		Audio.battle_settled = true
	if result == "win":
		var has_ye := false
		for u in B.allies: if u.art == "ye_initial": has_ye = true
		if has_ye: await rules.victory_pose()
		sfx("chime"); await big_text("胜", Color("#f3d58e"), 900)
	elif result == "lose": await big_text("败", Color("#d9553a"), 900)
	lesson.clear()
	auto.finish()
	await UI.fade(func(): _unmount(prev_mode))
	return result

func big_text(t: String, c: Color, ms: float) -> void:
	if B.opt.get("bigTextMap", {}).has(t): t = str(B.opt.bigTextMap[t])   # 切磋：「脱身」改「平」（qihe-npc-core.js）
	B.big = {"t": t, "c": c, "t0": pn(), "ms": ms}
	await wait(ms)

## 胜利结算（bui.js victory：先 victoryPose，再大字、修为铜钱掉落、结算卷轴）
func victory() -> void:
	await rules.victory_pose()
	sfx("chime"); await big_text("胜", Color("#f3d58e"), 900)
	var S: Dictionary = G.S
	var exp := 0; var sil := 0; var drops := {}
	for f in B.foes:
		exp += int(f.exp); sil += int(f.silver)
		for k in f.get("drops", {}):
			if DB.ITEMS.has(k) and randf() * 100 < Stats.acc_drop(float(f.drops[k])): drops[k] = drops.get(k, 0) + 1
	exp = roundi(exp * (0.5 if B.opt.get("tutorial") else 1.0))
	sil = Stats.acc_silver(sil)
	S.silver = int(S.get("silver", 0)) + sil
	if not S.has("bag"): S.bag = {}
	for k in drops: S.bag[k] = int(S.bag.get(k, 0)) + drops[k]
	var ids := []
	for u in B.allies: if not u.get("isHero"): ids.append(u.get("key"))
	var growth := Stats.award_battle(S, exp, ids)
	for row in growth.mates:
		if row.levels.size():
			for u in B.allies: if u.get("key") == row.id: u.levelUpThisBattle = true
	if sil: sfx("coin")
	await panel.show_win(growth, sil, drops)
	sfx("select")

# ───────── 输入（battle.js keydown；main.js 画布点击） ─────────
const KEYMAP := {KEY_UP: "up", KEY_W: "up", KEY_DOWN: "down", KEY_S: "down", KEY_LEFT: "left", KEY_A: "left", KEY_RIGHT: "right", KEY_D: "right",
	KEY_ENTER: "ok", KEY_KP_ENTER: "ok", KEY_SPACE: "ok", KEY_Z: "ok", KEY_J: "ok", KEY_ESCAPE: "back", KEY_X: "back", KEY_BACKSPACE: "back", KEY_K: "back",
	KEY_Q: "bm", KEY_E: "bp", KEY_PAGEUP: "bm", KEY_PAGEDOWN: "bp", KEY_1: "n1", KEY_2: "n2", KEY_3: "n3", KEY_4: "n4", KEY_5: "n5", KEY_6: "n6", KEY_7: "n7", KEY_8: "n8", KEY_9: "n9"}

signal any_key(k: String)

func _unhandled_input(e: InputEvent) -> void:
	if B == null or G.mode != "battle": return
	if e is InputEventKey and e.pressed:
		var m: String = KEYMAP.get(e.keycode, "")
		if m == "": return
		get_viewport().set_input_as_handled()
		any_key.emit(m)
		if Dialog.busy or not B.key.is_valid(): return
		if e.echo and (m == "ok" or m == "back"): return
		B.key.call(m)
	elif e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		any_key.emit("click")
		if B.click.is_valid():
			var p := cam.to_world(e.position.x, e.position.y)
			B.click.call(p.x, p.y)
	elif e is InputEventMouseMotion:
		B.hover = cam.to_world(e.position.x, e.position.y)
