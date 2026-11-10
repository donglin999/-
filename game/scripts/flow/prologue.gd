extends Node
## 序章：开局、后山相遇、递水 CG、遇狼、进村第一夜。
## 对应原版 js/qihe-map-trial.js（start/goLocal/人物节点）、prologue-arrival.js、prologue-backhill.js、prologue-water.js、
## prologue-dog.js、qihe-prologue-actions.js。台词全部来自 ink（Story.play），这里只有游戏函数实现。

const W := 960.0
const H := 540.0
var K := 1.0 / (5.0 / 6.0)        # 原版 k=1/ZOOM：后山按画面坐标摆位
var D: Dictionary                  # QIHE_MAP_DATA
var R: Dictionary                  # QIHE_ROOMS
var arrival_running := false
var completion = null

# 后山（prologue-backhill.js）
const POSES := {"encounter": {"hero": [490, 330], "ye": [620, 315]}, "dog": {"hero": [300, 262], "ye": [405, 275], "dog": [610, 235], "dog2": [640, 365]}}
const STICK_RECT := [424, 348, 92, 42]
const STICK_COVER := [540, 348]
var bh_locked := false
var bh_pose := "encounter"
var dog_visible := false
var ye_visible := true
var clinic_cast = null

func _ready() -> void:
	D = DB.g("QIHE_MAP_DATA")
	R = DB.g("QIHE_ROOMS")
	_install()

# ─────────────────────── 状态 ───────────────────────
func fresh() -> Dictionary:
	return {"version": 2, "errands": {"bowls": "none", "cloth": "none", "medicine": "none"}, "carry": {}, "heard": {}, "relicSeen": false, "rested": false, "ending": false, "yeHousePermission": false,
		"arrival": {"version": 1, "stage": "encounter", "borrowed": false, "originExpression": null, "dogResult": null, "greeted": {}}}

func state() -> Dictionary:
	if not G.S.has("prologue"): G.S.prologue = fresh()
	var s: Dictionary = G.S.prologue
	if not s.has("arrival"): _fill_old(s)
	return s

## 2026-11-05 存档回归查出：旧的培养模式存档里 prologue 只有 {"version": 2}。原版（JS）读不到的字段当“否”，
## Godot 读不到字段会报错并中断进场。补上缺的字段；主线已经开始的档，序章、第一夜都按已经过完算。
func _fill_old(s: Dictionary) -> void:
	var past: bool = G.S.has("qiheChapter") or G.S.get("currentMode") == "cultivation"
	var f := fresh()
	for k in f:
		if not s.has(k): s[k] = f[k]
	if past:
		s.arrival.stage = "done"; s.arrival.borrowed = true
		s.relicSeen = true; s.rested = true

func arrival() -> Dictionary:
	return state().arrival

func checkpoint() -> void:
	G.S.x = World.player.x; G.S.y = World.player.y; G.save(); UI.hud()

func modern() -> bool:
	return G.S != null and G.S.get("prologue", {}).get("version") == 2 and not state().arrival.borrowed

## 原版 OpeningCharacters.applyScene：主角地图精灵按是否换了村里衣服
func apply_scene(sc: Dictionary) -> void:
	if sc.is_empty() or G.S == null or G.S.get("prologue", {}).get("version") != 2: return
	sc.playerSp = "opening_hero_modern" if modern() else "qh_hero_initial"

func point(scene: String, key: String) -> Array:
	if scene == "village": return D.anchors[key]
	return R[scene].anchors[key]

func go_local(scene: String, key := "") -> void:
	if key == "": key = "start" if scene == "village" else "entry"
	var id := "qihe_trial" if scene == "village" else "prologue_" + scene
	var p := point(scene, key)
	await World.go_scene(id, [p[0] / World.TS, p[1] / World.TS])
	checkpoint()

## 原版 story(knot, externals, vars)
func story(knot: String, ext: Dictionary = {}, vars: Dictionary = {}) -> void:
	var e := {
		"checkpoint": func(): checkpoint(),
		"toast_for": func(t, ms): UI.toast(t, int(ms)),
		"carry": func(k, n): state().carry[k] = n,
		"uncarry": func(k): state().carry.erase(k),
		"go_scene": func(scene, anchor): await go_local(String(scene).trim_prefix("prologue_"), anchor),
	}
	for k in ext: e[k] = ext[k]
	await Story.play(knot, {"line": func(_id, w, t, _o = null): await Dialog.say(w, t), "vars": vars, "externals": e})

# ─────────────────────── 新开局（qiheTrialStart） ───────────────────────
func start(force := false, old = null) -> void:
	var s = old if (not force and old != null) else G.new_state()
	G.S = s
	G.S.name = "萧白"
	if old == null or force:
		G.S.prologue = fresh(); G.S.scene = "prologue_backhill"; G.S.party = []; G.S.pet = null; G.S.unlocked = {}
		var d := G.derived(G.S)
		G.S.hp = d.mhp; G.S.mp = d.mmp
	state()
	G.mode = "scene"
	var sid: String = G.S.scene if World.scenes.has(G.S.scene) else "qihe_trial"
	await Assets.preload_keys(World.scene_asset_keys(sid) + _backhill_assets())
	World.enter_scene_now(sid)
	if old != null and not force and G.S.get("x") != null:
		World.player.x = float(G.S.x); World.player.y = float(G.S.y); World.place_fix(); World.snap_cam()
	World.player.dir = "d"
	World.cur.dark = "rgba(13,22,32,.32)" if state().rested else null
	apply_scene(World.cur)
	UI.hud(); UI.place_name(World.cur.name)
	Flow.restore_scene()
	checkpoint()
	if arrival().stage != "done":
		await play_arrival()
	elif state().ending:
		World.busy = true
		await rest(true)
		World.busy = false; UI.hud()
	else:
		UI.toast("WASD / 方向键移动 · Shift 切换走跑 · E 交谈或进门 · I 江湖 · J 行程", 2600)

# ─────────────────────── 后山（prologue-backhill.js） ───────────────────────
func _backhill_assets() -> Array:
	var bart: Dictionary = DB.g("BART")
	return ["m_prologue_backhill_v1", "m_prologue_backhill_props", bart.wolf.file, DB.g("PROLOGUE_MODERN_ART").battle.file]

func _at(p: Array) -> Array:
	return [p[0] * K / World.TS, p[1] * K / World.TS]

func fixed_scene() -> bool:
	if bh_locked or World.cur_id == "prologue_backhill": return true
	return G.S != null and String(G.S.get("scene", "")).begins_with("prologue_") and G.S.get("prologue", {}).get("arrival", {}).get("borrowed") == false and G.S.prologue.arrival.stage != "done"

func fixed() -> void:
	World.keys = {}; var p := World.player
	p.path = null; p.goal = null; p.talk_to = null; p.vx = 0; p.vy = 0; p.walk = 0; p.moving = false; p.running = false; p.run_k = 0

func camera() -> void:
	if World.cur_id != "prologue_backhill": return
	World.cam = Vector2.ZERO; World.camC = Vector2(W * K / 2, H * K / 2)

## 从战斗灰狼表第 0 帧裁出不透明范围（四周留 2px）做静态站姿（原版 registerStaticWolf）
func _register_static_wolf() -> void:
	if CharArt.IMG.has("c_backhill_wolf_r"): return
	var A: Dictionary = DB.g("BART").wolf
	var path := Assets.path_of(A.file)
	var tex := Assets.tex(A.file)
	if tex == null: return
	var cw: int = A.cell[0]; var ch: int = A.cell[1]
	var img := tex.get_image()
	if img.is_compressed(): img.decompress()
	var x0 := cw; var y0 := ch; var x1 := 0; var y1 := 0
	for y in ch:
		for x in cw:
			if img.get_pixel(x, y).a * 255 >= 48:
				x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
	if x1 < x0: x0 = 0; y0 = 0; x1 = cw - 1; y1 = ch - 1
	x0 = max(0, x0 - 2); y0 = max(0, y0 - 2); x1 = min(cw - 1, x1 + 2)
	var rel := path.trim_prefix("res://")
	CharArt.IMG["c_backhill_wolf_r"] = {"sheet": rel, "r": [x0, y0, x1 - x0 + 1, y1 - y0 + 1]}

func _actors() -> void:
	var sc: Dictionary = World.scenes.prologue_backhill
	var p: Dictionary = POSES[bh_pose]
	var n := []
	if ye_visible:
		var a := _at(p.ye)
		n.append({"id": "pb_ye", "name": "叶蘅", "sp": "c_ye", "x": a[0], "y": a[1], "dir": "r" if bh_pose == "dog" else "l", "fixed": true, "staticScene": true, "act": func(_n): pass})
	if dog_visible:
		var spk := "c_backhill_wolf" if CharArt.IMG.has("c_backhill_wolf_r") else "c_wolf"
		for key in ["dog", "dog2"]:
			var a2 := _at(p[key])
			n.append({"id": "pb_wilddog" if key == "dog" else "pb_wolf2", "name": "受惊灰狼", "sp": spk, "x": a2[0], "y": a2[1], "h": 52, "dir": "l", "fixed": true, "staticScene": true, "act": func(_n): pass})
	sc.npcs = n
	if World.cur_id == "prologue_backhill": World.npcs = World.npcs_of(sc)

func bh_show(next := "encounter", dog = null, rod := false, transition := true) -> void:
	if dog == null: dog = next == "dog"
	bh_locked = true; fixed()
	_register_static_wolf()
	bh_pose = next; dog_visible = dog; World.scenes.prologue_backhill.holdingRod = rod; ye_visible = next != "encounter"
	_actors()
	var hero: Array = POSES[bh_pose].hero
	if World.cur_id != "prologue_backhill":
		await World.go_scene("prologue_backhill", _at(hero), "r"); World.busy = true
	elif transition:
		await UI.fade(func(): World.player.x = hero[0] * K; World.player.y = hero[1] * K)
	World.player.x = hero[0] * K; World.player.y = hero[1] * K
	World.player.dir = "r" if dog else "l"
	World.player.alpha = 1
	fixed(); camera()

func bh_guard(value := true) -> void:
	World.scenes.prologue_backhill.holdingRod = value
	World.player.alpha = 0.0 if value else 1.0
	fixed()

func bh_show_ye() -> void:
	ye_visible = true; _actors(); World.player.dir = "r"; fixed()

func bh_retreat() -> void:
	if World.cur_id != "prologue_backhill": return
	await UI.fade(func(): dog_visible = false; _actors())
	World.busy = true; fixed(); camera()

func bh_release() -> void:
	bh_locked = false
	World.scenes.prologue_backhill.holdingRod = false
	World.player.alpha = 1; fixed()

## 持棍：用战斗持棍站姿第 0 帧；先用旁边土路盖住底图里那根木杆（原版 drawHoldingRod）
func _draw_holding_rod(ci: CanvasItem, _t: float) -> void:
	var sc: Dictionary = World.scenes.prologue_backhill
	if not sc.get("holdingRod"): return
	var bg := Assets.tex_ready("m_prologue_backhill_v1")
	if bg != null:
		var kk := W * K / bg.get_width()
		ci.draw_texture_rect_region(bg, Rect2(STICK_RECT[0] * kk, STICK_RECT[1] * kk, STICK_RECT[2] * kk, STICK_RECT[3] * kk), Rect2(STICK_COVER[0], STICK_COVER[1], STICK_RECT[2], STICK_RECT[3]))
	# 2026-11-08 起用专门画的地图持棍小人（评审台第四十二轮选甲：双手横握挡在身前），脚底对齐人物站点
	var hold := Assets.tex("assets/production/characters/s_opening_hero_staff_hold_20261108.webp")
	if hold != null:
		var hs := (58 * K) / float(hold.get_height())
		ci.draw_set_transform(Vector2(World.player.x, World.player.y), 0, Vector2(hs, hs))
		ci.draw_texture(hold, Vector2(-hold.get_width() * 0.42, -hold.get_height()))
		ci.draw_set_transform(Vector2.ZERO)
		return
	var A: Dictionary = DB.g("PROLOGUE_MODERN_ART").battle
	var im := Assets.tex_ready(A.file)
	if im == null: return
	var cw: float = A.cell[0]; var ch: float = A.cell[1]
	var s := (58 * K) / 188.0
	var ax: float = A.anchor[0]; var ay: float = A.anchor[1]
	ci.draw_set_transform(Vector2(World.player.x, World.player.y), 0, Vector2(-s, s))
	ci.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	ci.draw_texture_rect_region(im, Rect2(-ax, -ay, cw, ch), Rect2(0, 0, cw, ch))
	ci.texture_filter = CanvasItem.TEXTURE_FILTER_PARENT_NODE
	ci.draw_set_transform(Vector2.ZERO)

## 药棚里的过场站位（原版 clinic）
func clinic() -> void:
	if World.cur.is_empty() or clinic_cast != null: return
	var m: Dictionary = DB.g("CHAPTER1_V2_MAPS").clinic_interior
	var ws = m.get("worldSize")
	var scale: float = (ws[0] if ws is Array else 1536 * 0.72) / 1536.0
	var foot := [m.anchors.cot_side[0] * 3, m.anchors.cot_side[1] * 3]
	clinic_cast = {"scene": World.cur, "npcs": World.cur.npcs}
	World.player.x = foot[0]; World.player.y = foot[1]; World.player.dir = "r"; fixed()
	var npcs: Array = World.cur.npcs.duplicate()
	npcs.append({"id": "pa_clinic_ye", "name": "叶蘅", "sp": "c_ye", "x": 400 * scale / World.TS, "y": 600 * scale / World.TS, "dir": "u", "fixed": true, "staticScene": true, "act": func(_n): pass})
	npcs.append({"id": "pa_clinic_chen", "name": "陈伯", "sp": "c_opening_chen", "x": 650 * scale / World.TS, "y": 670 * scale / World.TS, "dir": "l", "fixed": true, "staticScene": true, "act": func(_n): pass})
	World.cur.npcs = npcs
	World.npcs = World.npcs_of(World.cur); World.snap_cam()

func clear_clinic() -> void:
	if clinic_cast == null: return
	var c: Dictionary = clinic_cast; clinic_cast = null
	c.scene.npcs = c.npcs

# ─────────────────────── 递水 CG（prologue-water.js） ───────────────────────
func play_water() -> Dictionary:
	World.busy = true; World.keys = {}
	var cg := [Cinematic.show_cg("res://assets/production/shared/cg_p_water_v1.webp", Color("#181c1a"))]
	Dialog.cg_suppress = true; Dialog.cg_style = "cg-story"
	var branch := [-1]
	var hide := func():
		if cg[0] != null: Cinematic.hide_cg(cg[0]); cg[0] = null
		Dialog.cg_suppress = false; Dialog.cg_style = ""
	await Story.play("prologue_water", {"line": func(_id, w, t, _o = null): await Dialog.say(w, t), "externals": {
		"mark": func(_id): pass,
		"hide_water_cg": hide,
		"water_branch": func(b): branch[0] = ["A", "B", "C"].find(b),
	}})
	hide.call()
	return {"branch": branch[0]}

# ─────────────────────── 后山开场（prologue-arrival.js） ───────────────────────
func _backhill_ext() -> Dictionary:
	return {
		"backhill_show": func(shot): await bh_show(String(shot)),
		"backhill_guard": func(on): bh_guard(preload("res://scripts/npc/util.gd").t(on)),
		"backhill_ye": func(): bh_show_ye(),
		"backhill_retreat": func(): await bh_retreat(),
		"mark": func(_id): pass,
		"checkpoint": func(): checkpoint(),
	}

func play_arrival() -> bool:
	if arrival_running or Dialog.busy or G.mode != "scene" or arrival().stage == "done": return false
	arrival_running = true
	World.busy = true; World.keys = {}
	var cast := [{"who": G.S.get("name", "萧白"), "sp": "c_hero", "slot": "left"}]
	if arrival().stage != "encounter": cast.append({"who": "叶蘅", "sp": "c_ye", "slot": "right"})
	var token := Dialog.begin("prologue-arrival", cast)
	if arrival().stage == "encounter":
		var ext := _backhill_ext()
		ext["water_scene"] = func():
			var r := await play_water()
			arrival().originExpression = ["A", "B", "C"][r.branch] if r.branch >= 0 else null
		await Story.play("prologue_encounter", {"line": func(_id, w, t, _o = null): await Dialog.say(w, t), "externals": ext})
	if arrival().stage == "dog":
		var ext2 := _backhill_ext()
		ext2["wolf_battle"] = func():
			while true:
				var result: String = await Flow.run_battle({"preset": "backhill_wolf"})
				if result == "win": return
				var text := "两人暂时退开，重新稳住脚步。可以重试，不损失物品。" if result == "lose" else "战斗未能完成，重新挑战可恢复到开战前。"
				if await Dialog.choose("", text, ["重新挑战", "稍后再试"]) == 1: return
		await Story.play("prologue_dog", {"line": func(_id, w, t, _o = null): await Dialog.say(w, t), "externals": ext2})
	if arrival().stage == "lodging":
		await Story.play("qihe_lodging", {"line": func(_id, w, t, _o = null): await Dialog.say(w, t), "externals": {
			"go_scene": func():
				var m: Dictionary = DB.g("CHAPTER1_V2_MAPS").clinic_interior
				var a: Array = m.anchors.entry_front
				await World.go_scene("prologue_clinic_interior", [a[0] * 3 / World.TS, a[1] * 3 / World.TS]); World.busy = true,
			"clinic_stage": func(): clinic(); World.player.alpha = 1; apply_scene(World.cur),
			"mark": func(_id): pass,
			"change_into_village_clothes": func():
				await UI.fade(func(): arrival().borrowed = true; apply_scene(World.cur); bh_release(); World.player.alpha = 1; checkpoint()),
			"checkpoint": func(): checkpoint(),
			"toast": func(t): UI.toast(t, 2800),
		}})
	Dialog.end(token)
	clear_clinic(); bh_release(); World.player.alpha = 1; apply_scene(World.cur)
	World.keys = {}; World.busy = false; arrival_running = false; UI.hud()
	return true

# ─────────────────────── 第一夜：村里与室内（qihe-map-trial.js） ───────────────────────
func pending() -> Array:
	var out := []
	for k in state().errands:
		if state().errands[k] in ["accepted", "collected", "delivered"]: out.append(k)
	return out

func round_state() -> String:
	var e: Dictionary = state().errands; var v := e.values()
	if v.all(func(x): return x == "none"): return "none"
	if v.all(func(x): return x == "done"): return "done"
	if v.all(func(x): return x in ["done", "closed", "none"]): return "partial" if v.has("done") else "closed"
	if e.bowls == "done" and e.cloth in ["collected", "done"] and e.medicine in ["delivered", "done"]: return "return"
	return "taken"

func invite_home() -> void: await story("qihe_ye_invite")

func aunt() -> void:
	await story("qihe_errand_aunt")
	var p := state()
	if p.get("errandGift") == true and not p.get("errandGiftPaid"):
		p.errandGiftPaid = true; DB.give_item("pill", 1); checkpoint()

func rest(resuming := false) -> void:
	var p := state()
	if p.rested and Flow.has_node("Chapter"):
		await Flow.get_node("Chapter").begin(); return
	await story("qihe_first_night", {
		"go_scene": func(scene, anchor): await go_local(String(scene).trim_prefix("prologue_"), anchor); World.busy = true,
		"night_falls": func(): await UI.fade(func(): World.cur.dark = "rgba(13,22,32,.32)"),
		"hand_off_first_night": func():
			p.carry = {}
			p.handoff = {"chapter": "风起栖河", "origin": p.arrival.originExpression, "heard": p.heard.duplicate(), "noteOwner": "叶蘅", "relicOwner": "叶蘅", "lodging": "陈伯独立客房"},
	}, {"resuming": resuming})

## 原版 wrap_act(name, fn)：开场登记萧白（与叶蘅），结束后存档
func wrap_act(name: String, fn: Callable) -> Callable:
	return func(n = null):
		var cast := [{"who": "萧白", "sp": "c_hero", "slot": "left"}]
		if name == "叶蘅": cast.append({"who": "叶蘅", "sp": "c_ye", "slot": "right"})
		var tk := Dialog.begin("qihe:" + name, cast)
		await fn.call()
		Dialog.end(tk); World.keys = {}; checkpoint()

## 第一次搭话的寒暄（bindGreetings）
const GREET := {"周婶": "qihe_greet_aunt", "陈伯": "qihe_greet_chen", "叶蘅": "qihe_greet_ye"}
func _greeting(npc: Dictionary, act: Callable) -> Callable:
	var name: String = String(npc.name).split(" · ")[0]
	return func(n = null):
		var p := arrival()
		if p.stage == "done" and not p.greeted.get(name) and not p.get("legacy") and not p.get("bypassed"):
			var cast := [{"who": G.S.get("name", "萧白"), "sp": "c_hero", "slot": "left"}]
			if npc.get("sp"): cast.append({"who": name, "sp": npc.sp, "slot": "right"})
			var tk := Dialog.begin("arrival-greeting:" + str(npc.id), cast)
			await Story.play(GREET[name], {"line": func(_id, w, t, _o = null): await Dialog.say(w, t), "externals": {"checkpoint": func(): checkpoint()}})
			Dialog.end(tk)
		await act.call(n)

func _npc(scene: String, id: String) -> Dictionary:
	for n in World.scenes[scene].npcs:
		if str(n.get("id")) == id: return n
	return {}

func _bind(scene: String, id: String, act: Callable, show = null, mark = null) -> void:
	var n := _npc(scene, id)
	if n.is_empty(): return
	n.act = act
	if show is Callable: n.show = show
	if mark is Callable: n.mark = mark

func _install() -> void:
	var sc: Dictionary = World.scenes
	# 后山：定镜、木杆
	var bh: Dictionary = sc.prologue_backhill
	bh.fx = func(ci, t): _draw_holding_rod(ci, t)
	bh.erase("under")
	# 村中（原版 SC.qihe_trial 的前 10 个节点）
	var v := "qihe_trial"
	_bind(v, "ye-door", wrap_act("叶家", invite_home), null, func(): return not state().relicSeen)
	_bind(v, "chen-door", wrap_act("陈家", func(): await go_local("chen_hall")))
	_bind(v, "clinic-door", wrap_act("药棚", func(): await go_local("clinic_interior")))
	_bind(v, "inn-door", wrap_act("客栈", func(): await go_local("inn_interior")))
	_bind(v, "elder", wrap_act("村口老人", func(): await story("qihe_errand_elder")), null, func(): return state().errands.medicine == "accepted")
	_bind(v, "notice", wrap_act("村中路牌", func(): await story("qihe_look_sign")))
	_bind(v, "rack", wrap_act("客栈晒架", func(): await story("qihe_look_rack")))
	_bind(v, "herbs", wrap_act("药棚晒药处", func(): await story("qihe_look_herbs")))
	_bind(v, "bailiff", wrap_act("差役", func(): await story("qihe_village_bailiff")))
	_bind(v, "procurement-aide", wrap_act("采办随从", func(): await story("qihe_village_aide")))
	# 室内
	var out := func(key: String, dest: String): return wrap_act(key, func(): await go_local("village", dest))
	_bind("prologue_clinic_interior", "clinic_interior-out", out.call("clinic_interior", "clinic"))
	_bind("prologue_clinic_interior", "aunt", wrap_act("周婶", aunt), null, func(): return pending().size() > 0)
	_bind("prologue_clinic_interior", "work", wrap_act("备药案", func(): await story("qihe_look_work")))
	_bind("prologue_ye_house", "ye_house-out", out.call("ye_house", "ye-home"))
	_bind("prologue_ye_house", "ye", wrap_act("叶蘅", func(): await story("qihe_relic")), null, func(): return not state().relicSeen)
	for id in ["night-chen", "night-aunt"]:
		_bind("prologue_ye_house", id, wrap_act(id, func(): pass), func(): return state().ending)
	_bind("prologue_inn_interior", "inn_interior-out", out.call("inn_interior", "inn"))
	_bind("prologue_inn_interior", "innkeeper", wrap_act("店家", func(): await story("qihe_errand_cloth")), null, func(): return state().errands.cloth == "accepted")
	_bind("prologue_inn_interior", "bandit", wrap_act("帮众", func(): await story("qihe_inn_bandit")))
	_bind("prologue_chen_hall", "chen_hall-out", out.call("chen_hall", "chen-home"))
	_bind("prologue_chen_hall", "chen", wrap_act("陈伯", func(): await story("qihe_errand_chen")), null, func(): return state().errands.bowls == "accepted")
	_bind("prologue_chen_hall", "guest-door", wrap_act("客房门", func(): await go_local("chen_guest")))
	_bind("prologue_chen_hall", "zhouyan", wrap_act("周砚", func(): await story("qihe_chen_zhouyan")), func(): return not (state().errands.bowls in ["done", "closed"]))
	_bind("prologue_chen_guest", "guest-out", wrap_act("回门厅", func(): await go_local("chen_hall", "guest_door")))
	# 2026-11-05 存档回归查出：原版 node(...,act,mark) 最后这个条件是任务标记（mark），不是显示条件；移植时放进了 show，
	# 过夜后借宿榻就消失了，再也没法“再躺一次”进入第二天（rest() 里 rested 时转去主线 begin），整局卡在第一夜。改回标记。
	_bind("prologue_chen_guest", "rest", wrap_act("借宿榻", func(): await rest()), null, func(): return state().relicSeen and not state().rested)
	_bind("prologue_chen_guest", "phone", wrap_act("衣包", func(): await story("qihe_look_phone")))
	# 第一次搭话寒暄
	for id in sc:
		if not String(id).begins_with("prologue_"): continue
		for n in sc[id].get("npcs", []):
			var name: String = String(n.get("name", "")).split(" · ")[0]
			if GREET.has(name) and n.get("act") is Callable:
				n.act = _greeting(n, n.act)

## 序章行程提示（原版 qihe-map-trial.js questLine；后山定镜时用 prologue-backhill.js 的两句）
const ROUND_STEPS := [["bowls", "陈伯家还碗", {"accepted": "碗还没送"}], ["cloth", "客栈取布", {"accepted": "布还没取"}], ["medicine", "村南老人家送药、带回竹篮", {"accepted": "药还没送"}]]
func round_left() -> Array:
	var e: Dictionary = state().errands; var out := []
	for r in ROUND_STEPS:
		if r[2].has(e[r[0]]): out.append(r[2][e[r[0]]])
	return out

func quest_line() -> String:
	if World.cur_id == "prologue_backhill":
		return "与叶蘅配合，观察狼的行动意图。" if bh_pose == "dog" else "先站稳，跟叶姑娘说话。"
	var p := state()
	if p.rested: return "回陈伯家客房歇息，第二天在村里走访"
	if p.arrival.stage != "done": return "与叶蘅一起下山，到村里歇脚"
	if p.ending: return "与叶蘅道别，回陈伯客房过夜"
	var r := round_state()
	if not p.relicSeen:
		var tail := "替周婶跑一圈（可不做）" if r == "none" else ("替周婶跑一圈：回药棚交差" if r == "return" else ("替周婶跑一圈：" + "，".join(round_left()) if pending().size() else "替周婶跑一圈已办完"))
		return "去西北叶家帮忙收药箱 · " + tail
	if r == "return": return "回药棚找周婶交差，或回陈伯独立客房歇息"
	if pending().size(): return "替周婶跑一圈：" + "，".join(round_left()) + " · 也可回陈伯客房歇息"
	return "回东北陈伯家，经门厅东侧进客房歇息"

## 行程（J 键；原版 QihePrologue.journal，主线开始后由 qihe-chapter.js 改成打开江湖·行记）
func journal() -> void:
	if World.busy or Dialog.busy or G.mode != "scene": return
	var side := get_parent().get_node_or_null("Side")
	if G.S.get("qiheChapter") != null or (side and side.has_method("outsiders_available") and side.outsiders_available()):
		if UI.panel_open(): return
		var m = get_node_or_null("/root/Menu")
		if m: m.open("quest")
		return
	World.busy = true; World.keys = {}; World.player.path = null
	var c := get_parent().get_node("Chapter")
	var text := quest_line()
	var i := await Dialog.choose("行程", text, ["继续游玩", "保存进度", "从头重新开始"])
	if i == 1:
		checkpoint(); UI.toast("进度已保存", 1200)
	elif i == 2 and await Dialog.choose("", "重新开始会覆盖这条分支的进度。", ["保留进度", "重新开始"]) == 1:
		World.busy = false
		await start(true); return
	World.busy = false; World.keys = {}; UI.hud()
