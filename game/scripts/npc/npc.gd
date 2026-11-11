extends Node
## 人物交互（自动加载 Npc）入口：原版 js/qihe-npc-ui.js 的 QiheNpcUI（图层、键位接管、session/execute、install），
## 并作为 QiheNpc / QiheGift / QiheSteal / QiheJianghu 等兄弟模块的门面。
## 主入口：await Npc.open_seal_menu(n)（n 为场景 NPC 字典）。World.interact_hook 已在 _ready 里挂上（原版 install 包裹 interact）。
const CoreS := preload("res://scripts/npc/core.gd")
const GiftS := preload("res://scripts/npc/gift.gd")
const RepS := preload("res://scripts/npc/rep.gd")
const StealS := preload("res://scripts/npc/steal.gd")
const RingUI := preload("res://scripts/npc/ring_ui.gd")
const ScrollUI := preload("res://scripts/npc/scroll_ui.gd")
const ProfileUI := preload("res://scripts/npc/profile_ui.gd")
const Seal := preload("res://scripts/npc/seal.gd")
const U := preload("res://scripts/npc/util.gd")
const GiftUI := preload("res://scripts/npc/gift_ui.gd")
const StealUI := preload("res://scripts/npc/steal_ui.gd")

var core
var gift
var rep
var steal
var gift_ui: Node = null    # gift_ui.gd（赠礼、易物、商店）
var steal_ui: Node = null   # steal_ui.gd（物品扇、袖里一按）

## 图层：#qn-layer（z-index 58，设计尺寸 1600×900，zoom 到游戏区）。Godot：CanvasLayer 30，根 Control 1600×900 缩 0.6 到 960×540
var layer_cl: CanvasLayer
var layer: Control
var key_handler: Callable = Callable()
var enabled := true

func _ready() -> void:
	core = CoreS.new(self)
	gift = GiftS.new(self)
	rep = RepS.new(self)
	steal = StealS.new(self)
	layer_cl = CanvasLayer.new(); layer_cl.layer = 30; add_child(layer_cl)
	layer = Control.new(); layer.name = "qn-layer"
	layer.size = Vector2(1600, 900); layer.scale = Vector2(0.6, 0.6)
	Paint.crisp(layer)   # 字按实际显示大小光栅，缩 0.6 不丢横笔（见 ui.gd）
	layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.visible = false
	layer_cl.add_child(layer)
	for pair in [["gift_ui", "res://scripts/npc/gift_ui.gd"], ["steal_ui", "res://scripts/npc/steal_ui.gd"]]:
		if ResourceLoader.exists(pair[1]):
			var n: Node = load(pair[1]).new()
			n.name = pair[0]
			add_child(n)
			set(pair[0], n)
	# 原版 install()：包一层 interact
	World.interact_hook = func(n): return await _interact(n)
	# 原版 qihe-jianghu-rep：bond_change 事件（hostile_win 扣个人好感）
	rep.on("bond_change", func(pl):
		if U.t(pl.get("npcId")) and core.people().has(pl.npcId): core.bond_add(pl.npcId, U.num(pl.get("delta")), {"reason": pl.get("reason")}))

# ───── 图层与键位 ─────
func ensure() -> Control:
	layer.visible = true
	return layer

func clear() -> void:
	for c in layer.get_children(): c.queue_free()
	layer.visible = false

## 原版 captureKeys(fn)：接管键盘（捕获阶段拦下，不让地图/对白再收到）
func capture_keys(fn: Callable) -> void:
	key_handler = fn

const KEYMAP := {KEY_ESCAPE: "escape", KEY_ENTER: "enter", KEY_KP_ENTER: "enter", KEY_SPACE: " ", KEY_BACKSPACE: "backspace",
	KEY_UP: "arrowup", KEY_DOWN: "arrowdown", KEY_LEFT: "arrowleft", KEY_RIGHT: "arrowright", KEY_SHIFT: "shift"}

func _input(e: InputEvent) -> void:
	if not key_handler.is_valid(): return
	if e is InputEventKey:
		get_viewport().set_input_as_handled()
		if not e.pressed: return
		var k: String = KEYMAP.get(e.keycode, OS.get_keycode_string(e.keycode).to_lower())
		if e.echo and k in ["e", "enter", " ", "escape"]: return
		key_handler.call(k)

## 世界坐标 → 设计坐标（1600×900）
func to_design(wx: float, wy: float) -> Vector2:
	var p: Vector2 = World.get_global_transform() * Vector2(wx, wy)   # 960×540 逻辑
	return p / 0.6

func npc_pos(n: Dictionary) -> Vector2:
	return Vector2(float(n.x) * World.TS, float(n.y) * World.TS)

## 原版 anchorOf(npc)
func anchor_of(n: Dictionary) -> Dictionary:
	var h: float = World.npc_h(n)
	var x: float = float(n.x) * World.TS; var y: float = float(n.y) * World.TS
	var c := to_design(x, y - h * 0.5)
	var hy := to_design(x, y - (h * 0.42 if World.sp_key(str(n.get("sp", ""))) == "zhou" else h)).y
	return {"cx": c.x, "cy": c.y, "headY": hy, "px": to_design(World.player.x, World.player.y).x}

## 查看页取景：截下当前画面里人物所在的一块（世界 210×260，脚下偏下三分之一）
func grab_scene(n: Dictionary) -> Texture2D:
	if n == null or World.cur.is_empty(): return null
	var img := get_viewport().get_texture().get_image()
	if img == null: return null
	var vs := Vector2(img.get_size())
	var pos := npc_pos(n)
	var a: Vector2 = World.get_global_transform() * Vector2(pos.x - 105, pos.y - 260 * 0.72)
	var b: Vector2 = World.get_global_transform() * Vector2(pos.x + 105, pos.y - 260 * 0.72 + 260)
	var k := vs.x / 960.0
	var r := Rect2i(Vector2i(a * k), Vector2i((b - a) * k))
	var full := Rect2i(Vector2i.ZERO, Vector2i(vs))
	r = r.intersection(full)
	if r.size.x <= 2 or r.size.y <= 2: return null
	var sub := img.get_region(r)
	return ImageTexture.create_from_image(sub)

# ───── 墨印菜单、查看页、卷（原版 ring/profile/teach/spar/result） ─────
func ring(n: Dictionary, p: Dictionary, items: Array, focus_id):
	var L := ensure()
	for c in L.get_children(): c.queue_free()
	var r: Control = RingUI.new()
	L.add_child(r)
	r.setup(self, n, p, items, focus_id)
	var v = await r.done
	r.queue_free()
	return v

func profile(p: Dictionary, n: Dictionary):
	var L := ensure()
	for c in L.get_children(): c.queue_free()
	var pg: Control = ProfileUI.new()
	L.add_child(pg)
	pg.setup(self, p, n)
	UI.push_panel(pg)
	var v = await pg.done
	UI.pop_panel(pg)
	pg.queue_free()
	clear()
	return v

func _scroll(s: Control) -> bool:
	var L := ensure()
	for c in L.get_children(): if c != s: c.queue_free()
	if s.get_parent() == null: L.add_child(s)
	var v = await s.done
	s.queue_free()
	clear()
	return v == true

func teach(n: Dictionary, p: Dictionary) -> bool: return await _scroll(ScrollUI.build_teach(self, n, p))
func spar(n: Dictionary, p: Dictionary) -> bool: return await _scroll(ScrollUI.build_spar(self, n, p))
func result(p: Dictionary, r: Dictionary) -> void: await _scroll(ScrollUI.build_result(self, p, r))

# ───── 流程（原版 runAct / canReopen / execute / session / install） ─────
func _visible(n: Dictionary) -> bool:
	var sh = n.get("show")
	if sh is Callable and not sh.call(): return false
	return World.npcs.has(n)

func run_act(n: Dictionary) -> void:
	var pos := npc_pos(n)
	World.player.dir = World.face_to(pos.x - World.player.x, pos.y - World.player.y)
	var act = n.get("act")
	if act is Callable: await act.call(n)
	else: await Flow.default_act(World.cur, n)

func can_reopen(n: Dictionary, scene) -> bool:
	var ch = Flow.get_node_or_null("Chapter")
	return G.mode == "scene" and not Dialog.busy and G.S.get("scene") == scene \
		and not U.t(U.dig(G.S, "qiheChapter.pendingEvent")) and not (ch != null and ch.running) \
		and not UI.panel_open() and _visible(n) \
		and Vector2(n.x * World.TS - World.player.x, n.y * World.TS - World.player.y).length() < 130

## 执行一项；返回 "again" 表示回到墨印（谈完、查看页 Esc、卷上作罢），{switch} 表示查看页换了人，其余结束
func execute(it: Dictionary, p: Dictionary, n: Dictionary):
	var scene = G.S.get("scene")
	match it.get("run"):
		"say":   # 门派不睦时点灰印：门人一句拒绝
			clear()
			var ch = Flow.get_node_or_null("Chapter")
			if ch: await ch.play(it.say)
			else: await Story.play(it.say)
			return "again" if can_reopen(n, scene) else "end"
		"act":
			await run_act(n)
			if not World.cur.is_empty(): World.npcs = World.npcs_of(World.cur)
			return "again" if it.id == "tan" and can_reopen(n, scene) else "end"
		"errand":
			var os = core.outsiders()
			if os: await os.talk(str(p.chapter))
			return "end"
		"profile":
			var r = await profile(p, n)
			if r == null: return "again"
			if r.p != p: return {"switch": r}
			return await execute(r.act, p, n)
		"teach":
			if not await teach(n, p): return "again"
			await core.do_teach(p)
			return "end"
		"spar":
			if not await spar(n, p): return "again"
			clear()
			var r := await core.run_spar(p) as Dictionary
			await result(p, r)
			return "end"
		"gift":   # 2026-10-26 开发二
			clear()
			if gift_ui: await gift_ui.gift(n, p)
			return "again" if can_reopen(n, scene) else "end"
		"yi":
			clear()
			var r = await gift_ui.yi(n, p) if gift_ui else null
			if r == "buy": await run_act(n); return "end"
			return "again" if can_reopen(n, scene) else "end"
		"aqi_lesson":   # 小耗子的一课：用“窃”从他身上摸一枚铜钱（side_aqi.seal_lesson）
			clear()
			var sd = Flow.get_node_or_null("Side")
			if sd != null and sd.get("aqi") != null: await sd.aqi.seal_lesson()
			return "end"
		"steal":
			if steal_ui == null: push_warning("偷窃界面未加载"); return "end"
			clear()
			var r = await steal_ui.steal(str(p.id), p, n)
			if not U.t(r): return "again" if can_reopen(n, scene) else "end"
			return "end"
	return "end"

func session(n: Dictionary, p: Dictionary) -> void:
	var focus = null
	for guard in 40:
		var items: Array = core.menu_for(p, n)
		if items.is_empty(): await run_act(n); return
		var it = await ring(n, p, items, focus)
		if it == null: return
		focus = it.id
		var r = await execute(it, p, n)
		while r is Dictionary and r.has("switch"):
			p = r.switch.p; n = r.switch.npc; focus = null
			r = await execute(r.switch.act, p, n)
		if r != "again": return
		await get_tree().process_frame

## 原版 install() 包裹的 interact：靠近人物表里的人按 E 先弹墨印
func _interact(n: Dictionary) -> bool:
	if not enabled or World.busy or Dialog.busy or G.mode != "scene": return false
	if n.get("loot") or core.person_for(n) == null: return false
	await open_seal_menu(n)
	return true

## 对外主入口：打开该 NPC 的墨印菜单并走完整个交互（原版 interact 包裹里 busy=true … finally 的部分）
func open_seal_menu(n: Dictionary) -> void:
	var p = core.person_for(n)
	if p == null: await run_act(n); return
	World.busy = true; UI.prompt_hide()
	World.player.path = null; World.player.goal = null; World.player.talk_to = null; World.keys = {}
	var pos := npc_pos(n)
	World.player.dir = World.face_to(pos.x - World.player.x, pos.y - World.player.y)
	await session(n, p)
	capture_keys(Callable()); clear()
	World.busy = false; World.keys = {}
	if not World.cur.is_empty(): World.npcs = World.npcs_of(World.cur)
	UI.hud()

var is_open: bool:
	get: return key_handler.is_valid()

# ───── 对外接口（原版 window.QiheNpc / QiheGiftUI / QiheStealUI / QiheJianghuRep 上别的模块会调的，改 snake_case）─────
## QiheNpc.bond.get / bond.add
func bond_get(id: String) -> Dictionary: return core.bond_get(id)
func bond_add(id: String, d: float, opt: Dictionary = {}) -> Dictionary: return core.bond_add(id, d, opt)
## QiheNpc.personFor / menuFor / view / bagOf / recognize
func person_for(n): return core.person_for(n)
func menu_for(p: Dictionary, n) -> Array: return core.menu_for(p, n)
func view(p: Dictionary) -> Dictionary: return core.view(p)
func bag_of(p: Dictionary, v = null) -> Array: return core.bag_of(p, v)
func recognize(key: String, grade) -> bool: return core.recognize(key, grade)
## QiheJianghuRep：阵营声望分、结算、事件
func rep_score(f: String) -> float: return U.num(U.dig(rep.ensure(), "faction." + f + ".score"))
func rep_settle() -> void: rep.settle()
func rep_emit(ev: String, payload: Dictionary = {}) -> void: rep.emit(ev, payload)
## QiheGiftUI.shop / gift / yi / close
func shop(n, p: Dictionary, opts: Dictionary):
	if gift_ui == null: return null
	return await gift_ui.shop(n, p, opts)
func close_panels() -> void:
	if gift_ui: gift_ui.close()
	if steal_ui: steal_ui.close()
	clear()
## QiheStealUI.minigame（小耗子的一课 js/qihe-aqi.js 用）：返回 "ok"/"great"/"fail"
func steal_minigame(npc_id: String, item: Dictionary, rate: float, tier_key = "none", perks: Array = [], opts: Dictionary = {}) -> String:
	if steal_ui == null: return "ok" if randf() * 100 < rate else "fail"
	var T: Dictionary = steal.D.TIERS
	var tier: Dictionary = tier_key if tier_key is Dictionary else T.get(str(tier_key), T.none)
	return await steal_ui.minigame(npc_id, item, rate, tier, perks, opts)
## QiheSteal.teach（小耗子三道关结算）
func steal_teach(step, result: String) -> void: steal.teach(step, result)

# ───── 调试入口：--npc=<人物id>[:seal|view|gift] ─────
## --npc=ye:seal / ye:view / ye:gift：照原版实测排版（docs/specs/layout/npc-*.json，tools/dump_layout.cjs）的存档——
## 新开局、序章已过并换了村里衣服（arrival done、borrowed），进叶家（prologue_ye_house），叶蘅按站位表站原位，
## 主角站她左下方（−52, +57：由 npc-seal.json 的名牌与印位置反推，锚点 cx=872、cy=372 设计像素），直接打开墨印环／查看页／赠礼面板（赠礼焦点在第一件，等于悬停第一件）。
## 不带“:”的旧用法（--npc=peddler 等）：造一份中段存档进栖河村，直接开墨印。
func debug_start(arg: String) -> void:
	var parts := arg.split(":", true, 1)
	var pid := parts[0]
	var mode := parts[1] if parts.size() > 1 else ""
	# --npc=<人物>@<场景>：在指定场景里找这个人（如 retainer@qh_refuge 看邻村站岗护院；对证已过）
	var sc := "qihe_trial"
	if "@" in pid: sc = pid.get_slice("@", 1); pid = pid.get_slice("@", 0)
	if sc == "qihe_trial" and (mode != "" or pid == "ye"):
		await _debug_ye_house(pid if pid != "" and pid != "1" else "ye", mode if mode != "" else "seal")
		return
	var people: Dictionary = core.people()
	if not people.has(pid): pid = "ye" if people.has("ye") else str(people.keys()[0])
	var p: Dictionary = people[pid]
	G.S = G.new_state()
	G.S.name = "萧白"; G.S.lv = 3; G.S.silver = 46
	G.S.qiheChapter = {"stage": "refuge", "halfDay": 2, "events": {"evidence-v2": true} if sc == "qh_refuge" else {}, "choices": {}, "records": {}}
	G.S.bag = {"bun": 3, "pill": 2, "wine": 1, "qh_candy": 2, "qh_wild_herb": 4, "qh_dry_branch": 2, "qh_river_reed": 2, "cloth": 1, "charm": 1}
	G.S.skills = {"fist": 1, "fuhu": 2}
	G.S.qiheNpc = {"version": 1, "bonds": {}, "skills": {"spar": true}}
	G.S.steal = {"version": 1, "lv": 1, "exp": 0, "taken": {}, "alert": {}, "caught": {}, "rumor": {}}
	if steal.D.SKILL.size() > 1: G.S.steal.exp = steal.D.SKILL[1].exp   # 窃术二级，扇子里能看到成功率与门槛两种格
	var d := Stats.derived(G.S)
	G.S.hp = d.mhp; G.S.mp = d.mmp
	G.S.scene = sc
	G.save_key = "debug"
	G.mode = "scene"
	await get_tree().process_frame
	var n = null
	if World.scenes.has(sc) and World.has_method("enter_scene_now"):
		await Assets.preload_keys(World.scene_asset_keys(sc))
		World.enter_scene_now(sc)
		for x in World.npcs_of(World.cur):
			if x.get("name") in p.get("npc", [p.name]): n = x; break
	if n == null:
		# 场景里没有这个人：铺一张空白背景，假一个站在玩家右侧的 NPC
		var bg := CanvasLayer.new(); bg.layer = 5; add_child(bg)
		var cr := ColorRect.new(); cr.color = Color("#2b2a24"); cr.size = Vector2(960, 540); bg.add_child(cr)
		var px: float = World.player.x if World.player else 480.0
		var py: float = World.player.y if World.player else 300.0
		n = {"name": p.get("npc", [p.name])[0], "sp": str(p.get("sp", "")), "x": (px + 60) / World.TS, "y": py / World.TS}
	else:
		World.player.x = float(n.x) * World.TS - 48; World.player.y = float(n.y) * World.TS
		if World.has_method("snap_cam"): World.snap_cam()
	UI.hud()
	await get_tree().process_frame
	if mode == "tan":   # 直接执行“谈”，看交谈台词
		var it = core.menu_for(p, n).filter(func(x): return x.id == "tan")
		if it.size(): await execute(it[0], p, n); return
	await open_seal_menu(n)

## 叶家对照存档（与 boot.gd --scene 的新开局一致，再按 dump_layout.cjs 把 arrival 设为 done、borrowed）
func _debug_ye_house(pid: String, mode: String) -> void:
	G.S = G.new_state()
	G.S.prologue = Flow.prologue().fresh()
	G.S.name = "萧白"; G.S.party = []; G.S.unlocked = {}
	G.S.prologue.arrival.stage = "done"; G.S.prologue.arrival.borrowed = true
	var d0 := G.derived(G.S); G.S.hp = d0.mhp; G.S.mp = d0.mmp
	G.S.scene = "prologue_ye_house"
	G.save_key = "debug"
	G.mode = "scene"
	await get_tree().process_frame
	await Assets.preload_keys(World.scene_asset_keys("prologue_ye_house"))
	World.enter_scene_now("prologue_ye_house")
	Flow.prologue().apply_scene(World.cur)
	World.npcs = World.npcs_of(World.cur)
	var n = null
	for x in World.npcs:
		if x.get("id") == pid or core.person_for(x) != null and str(core.person_for(x).get("id", "")) == pid: n = x; break
	if n == null:
		push_warning("叶家里找不到人物 " + pid); UI.hud(); return
	World.player.x = float(n.x) * World.TS - 52; World.player.y = float(n.y) * World.TS + 57
	World.player.dir = World.face_to(float(n.x) * World.TS - World.player.x, float(n.y) * World.TS - World.player.y)
	World.snap_cam()
	UI.hud()
	await get_tree().create_timer(0.3).timeout
	_layout_dump()
	if mode == "seal":
		await open_seal_menu(n); return
	# view / gift：先执行对应的印（观 guan／礼 li），关掉后回到墨印环（与原版按 E → 选印的流程一样）；
	# 其余直接写印的 id（spar 比、yi 易、steal 窃……），墨印环里没有这枚印时只开墨印环
	var p = core.person_for(n)
	var want: String = {"view": "guan", "gift": "li"}.get(mode, mode)
	var it = null
	for x in core.menu_for(p, n):
		if x.id == want: it = x; break
	if it == null: await open_seal_menu(n); return
	World.busy = true; UI.prompt_hide()
	var r = await execute(it, p, n)
	while r is Dictionary and r.has("switch"):
		p = r.switch.p; n = r.switch.npc
		r = await execute(r.switch.act, p, n)
	capture_keys(Callable()); clear()
	World.busy = false
	if r == "again": await open_seal_menu(n)
	UI.hud()

## 调试：--layout-dump=<文件> 时，打开界面 1.2 秒后把人物交互层里所有带字的控件（设计坐标 1600×900）写成 JSON 行，供与 npc-*.json 数值比对
func _layout_dump() -> void:
	var path := ""
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--layout-dump="): path = a.trim_prefix("--layout-dump=")
	if path == "": return
	await get_tree().create_timer(1.2).timeout
	var out: Array = []
	var roots: Array = [layer]
	if gift_ui: roots.append(gift_ui.layer)
	for r in roots:
		var inv: Transform2D = (r as Control).get_global_transform().affine_inverse()
		var stack: Array = [r]
		while stack.size():
			var nd = stack.pop_back()
			for c in nd.get_children(): stack.append(c)
			if not (nd is Control) or not nd.is_visible_in_tree(): continue
			var tx := ""
			if nd is Label: tx = nd.text
			elif nd is RichTextLabel: tx = nd.get_parsed_text()
			var p0: Vector2 = inv * nd.global_position
			var p1: Vector2 = inv * (nd.global_position + nd.get_global_transform().basis_xform(nd.size))
			var o := {"cls": nd.get_class(), "x": roundi(p0.x), "y": roundi(p0.y), "w": roundi(p1.x - p0.x), "h": roundi(p1.y - p0.y)}
			if tx != "":
				o.text = tx.substr(0, 30)
				o.fs = nd.get_theme_font_size("font_size") if nd is Label else nd.get_theme_font_size("normal_font_size")
			out.append(o)
			if nd.get("angles") is Array and nd.get("a") is Dictionary and not nd.a.is_empty():
				out.append({"ring": nd.a, "angles": nd.angles, "side": nd.side, "fi": nd.fi})
	var f := FileAccess.open(path, FileAccess.WRITE)
	for o in out: f.store_line(JSON.stringify(o))
	f.close()
	print("布局导出 ", out.size(), " → ", path)
	get_tree().quit()
