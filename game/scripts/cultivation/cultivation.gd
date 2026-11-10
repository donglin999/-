extends Node
## 培养模式（自动加载 Cultivation）。原版 js/qh-mode-cultivation.js（window.Cultivation）
## 与 js/qihe-cultivation-bridge.js（QiheCultivationBridge.enter/migrate/openMartial/openJianghu）。
## 接口：await Cultivation.enter(opts := {})；Cultivation.debug_start(arg)。
## 界面层：CanvasLayer → root（1920×1080，缩放 0.5），每次 render 整层重建（同原版 root.innerHTML）。
## 部件在 CuHub / CuHubViews / CuStory；按钮统一回调 on_cu(data-cu, data-id)。

signal left_cultivation

var layer: CanvasLayer
var root: Control
var view = null            # 原版 view
var message := ""          # 原版 message
var gift := "food"
var recipient := ""
var broken = null          # 原版 broken：{error}
var fighting := false
var ui := {}               # base() 返回的部件
var _active := false
var _tick_busy := false

const CLIP_FALLBACK := "B01"

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	if "--cultivation=coverage" in OS.get_cmdline_user_args():
		await get_tree().process_frame
		CuCoverage.run(get_tree())
		return
	if "--cultivation=selftest" in OS.get_cmdline_user_args():
		await get_tree().process_frame
		CuSelftest.run(get_tree())
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--cultivation=random"):
			await get_tree().process_frame
			for sd in a.trim_prefix("--cultivation=random").split(","): CuSelftest.random(get_tree(), int(sd))
			get_tree().quit()
		if a.begins_with("--cultivation=uitest"):
			await get_tree().create_timer(1.0).timeout
			CuUITest.run(self, int(a.trim_prefix("--cultivation=uitest")))

func state() -> Dictionary: return G.S.cultivation

# ───────── 进入 / 退出 ─────────

## 原版 QiheCultivationBridge.migrate()：旧版 S.qiheCultivation 导入（Godot 端没有旧版培养，只保留补 joined/qhOrigin/护路棍法）
func migrate() -> void:
	var S: Dictionary = G.S
	var c = S.get("cultivation")
	if c is Dictionary and c.get("qhImported"): return
	var s: Dictionary = c if c is Dictionary else CuCore.initial()
	s.qhImported = true
	var ch: Dictionary = S.get("qiheChapter", {})
	s.qhOrigin = {"rescue": ch.get("rescue"), "chenCare": ch.get("chenCare"), "supplies": ch.get("supplies"), "coreOwner": "叶蘅"}
	s.joined = true
	s.facts.joined = true
	if S.get("skills", {}).get("qh_hulu_staff"): s.learned.qh_hulu_staff = {"source": "陆衡·栖河第一章", "period": -1}
	S.cultivation = s

## 原版 QiheCultivationBridge.enter()：从开始部分结束进入培养模式
func enter(opts := {}) -> void:
	var S: Dictionary = G.S
	if not S.get("cultivation", {}).get("qhImported") and S.has("qiheCultivation"):
		UI.toast("旧版培养进度导入失败：Godot 版不含旧版培养。原记录保留未动。", 5000)
	migrate()
	if not S.has("qiheChapter"): S.qiheChapter = {}
	S.qiheChapter.stage = "cultivation"
	S.chapter = max(2, int(S.get("chapter", 1)))
	S.sect = "guiyun"
	G.checkpoint() if World.player != null else G.save()
	start({"inherit": opts.get("inherit", true)})
	await left_cultivation

## 原版 start(options)
func start(options := {}) -> void:
	_ensure_root()
	var S: Dictionary = G.S
	if S.get("origin") != "prologue" and not options.get("inherit"):
		S.origin = "prologue"
	broken = null
	var notice := ""
	if not S.get("cultivation"):
		S.cultivation = CuCore.initial()
	else:
		var r: Dictionary = CuCore.recover(S.cultivation)
		if r.state == null:
			push_error("培养存档无法读取：" + str(r.error))
			broken = {"error": r.error}
			_show(); view = null; render(); return
		if r.repairs.size():
			_quarantine(S.cultivation, r.error, r.repairs)
			notice = "培养存档有失效内容，已修复：" + "；".join(r.repairs) + "。原数据已另存。"
		S.cultivation = r.state
	var s := state()
	var p = s.get("pending")
	var act = CuDB.action(p.action) if p is Dictionary else null
	# 已付费的旧版事件：把未选的选择移进对白
	if p is Dictionary and not p.get("story") and act != null and act.get("once"):
		p.story = true
		p.storyStep = 0 if p.get("animation") and not p.animation.done else 1
		p.erase("animation")
		if p.stage != "result": p.stage = "choice"
	p = s.get("pending")
	if p is Dictionary and not p.get("story") and p.stage != "result" and not p.get("animation"): CuCore.beginAnimation(s)
	if p is Dictionary and p.get("animation") and not p.animation.done: p.animation.presented = false
	CuCore.syncNotices(s)
	CuCore.reconcileWorld(S)
	var d := G.derived(S) if S.has("st") and S.st.has("con") else {}
	if d.has("mhp"):
		S.hp = max(1, min(int(S.get("hp", d.mhp)) if S.get("hp") else d.mhp, d.mhp))
		S.mp = min(int(S.get("mp", d.mmp)) if S.get("mp") else d.mmp, d.mmp)
	_show()
	view = null; recipient = ""; message = notice
	persist()
	if s.get("screen") == "world": s.screen = "hub"; persist()
	render()

func _show() -> void:
	G.mode = "cultivation"
	World.active = false
	World.busy = false
	World.keys = {}
	UI.prompt_hide()
	layer.visible = true
	_active = true
	UI.hud()

func _hide() -> void:
	layer.visible = false
	_active = false

## 离开培养模式（返回标题等）
func leave() -> void:
	_hide()
	left_cultivation.emit()

## 原版 persist()
func persist() -> void:
	G.S.currentMode = "scene" if state().get("screen") == "world" else "cultivation"
	G.save()

## 原版 quarantine(raw, error, repairs)：原数据整份另存，最多 3 份
func _quarantine(raw, error, repairs) -> void:
	var list: Array = G.S.get("cultivationQuarantine", []) if G.S.get("cultivationQuarantine") is Array else []
	list.append({"at": Time.get_datetime_string_from_system(true), "error": error, "repairs": repairs, "original": CuDB.copy(raw)})
	G.S.cultivationQuarantine = list.slice(max(0, list.size() - 3))

func _ensure_root() -> void:
	if layer != null: return
	layer = CanvasLayer.new()
	layer.layer = 20
	layer.visible = false
	add_child(layer)
	root = Control.new()
	root.name = "cultivation"
	root.size = Vector2(CuUI.W, CuUI.H)
	root.scale = Vector2(960.0 / CuUI.W, 540.0 / CuUI.H)
	root.clip_contents = true
	root.theme = Theme.new()
	root.theme.default_font = UI.kai
	layer.add_child(root)

## 原版 perform(fn)：快照 → 执行 → reconcileWorld → persist；出错整份回滚
func perform(fn: Callable, focus = null) -> void:
	var before = G.S.duplicate(true)
	CuDB.clear()
	message = ""
	fn.call()
	if CuDB.error != "":
		var err := CuDB.error
		CuDB.clear()
		G.S = before
		announce("操作未保存，已还原：" + err)
	else:
		CuCore.reconcileWorld(G.S)
		persist()
	render(focus)

## 原版 announce(t)：写进状态栏；下次 render 时以 .cu-message 显示
func announce(t: String) -> void:
	message = t

# ───────── 原版小工具 ─────────

func category() -> Dictionary: return CuDB.find_by(CuCore.D().categories, "id", state().selection.category)
func selected(): return CuDB.action(state().selection.get("action"))
## 原版 why(a)
func why(a: Dictionary) -> String:
	var o := {"gift": gift, "recipient": recipient if recipient != "" else null} if a.id == "C02" else {}
	return str(CuCore.availability(state(), a, o))
func walk_reviewed() -> bool: return CuCore.hasActivityInPeriod(state(), "W04")
## 原版 trainingHint(a)
func training_hint(a: Dictionary) -> String:
	return " · " + str(CuBalance.courseHint(state(), a)) + "；" + str(CuGrowth.hints(state(), a.get("gain"), CuCore.actions()))
## 原版 availableActions(cat)
func available_actions(cat: Dictionary) -> Array:
	var s := state()
	var out := []
	for a in CuCore.actions():
		if a.category != cat.id: continue
		if cat.id == "skill":
			if a.get("learn") and s.learned.get(a.learn): out.append(a)
		elif cat.id == "stroll":
			if a.get("strollPlace"):
				if not a.get("gated") or CuCore.strollPool(s, a.place).size() > 0: out.append(a)
			elif a.id == "W04": out.append(a)
		else:
			if a.get("auto") or a.get("hidden"): continue
			if a.get("sceneTaught") and not s.learned.get(a.learn): continue
			if a.get("visitor"):
				var per := CuCore.period(s)
				if not (per >= int(a.window[0]) - 2 and per <= int(a.window[1]) and not s.facts.get(a.once)): continue
			out.append(a)
	return out
## 原版 offerAvailable()
func offer_available() -> bool:
	var s := state()
	if not (s.mode == "home" and s.joined and s.learned.get("stance")): return false
	if s.facts.get("weapon_offer_period") == CuCore.period(s): return false
	for a in CuCore.actions():
		if a.category == "skill" and a.get("learn") and a.id != "QH01" and not s.learned.get(a.learn) and str(CuCore.availability(s, a)) == "": return true
	return false
func _notices_due() -> bool:
	var s := state()
	for l in s.letters:
		if str(l.id).begins_with("notice-") and not l.get("read") and int(l.due) <= CuCore.period(s): return true
	return false
## 原版 directPracticeResult()：CultivationRigTrial.enabled
func direct_result() -> bool: return bool(CuDB.t("CultivationRigTrial").get("enabled", true))
## 原版 storyText(id, fallback)
func story_text(id: String, fallback: String) -> String:
	return str(CuDB.t("CultivationDialogue").get("ui", {}).get(id, fallback))
## 原版 applyScene(scene)：换背景，返回 CultivationScenes.resolve
func apply_scene(scene):
	var r := CuScenes.resolve(scene, CuHub.season(state()))
	if ui.has("bg") and ui.bg != null: ui.bg.texture = CuUI.tex(r.src)
	return r
## 原版 lineScene(x, a)
func line_scene(x, a: Dictionary) -> Dictionary:
	var xd: Dictionary = x if x is Dictionary else {}
	return {"place": xd.place if xd.has("place") else a.get("place"), "time": xd.time if xd.has("time") else a.get("time")}

# ───────── render ─────────

const PICKER_VIEWS := ["picker", "gift-npc", "letter-npc", "mail-inbox"]

## 原版 render(focus)
func render(focus = null) -> void:
	if root == null or not _active: return
	for c in root.get_children():
		root.remove_child(c)
		c.queue_free()
	ui = {}
	if broken != null:
		CuHubViews.broken(self); return
	var s := state()
	var mandatory: bool = s.get("pending") != null or s.get("summary") != null or s.mode != "home" or not s.joined
	var locked: bool = mandatory or view != null
	var mail_active: bool = s.selection.category == "mail" and (view in PICKER_VIEWS or s.get("pending") != null)
	ui = CuHub.base(root, s, mandatory, locked, mail_active)
	# 到期剧情自动开场（无 pending、无 view、无未读谷中消息）
	if not s.get("pending") and view == null and not _notices_due():
		var auto = CuCore.dueStory(s)
		if auto != null:
			CuDB.clear()
			CuCore.start(s, auto.id, {"story": true})
			if CuDB.error != "": announce(CuDB.error); CuDB.clear()
			else: persist()
	var V := CuHubViews
	if s.get("pending"): V.pending(self)
	elif s.get("summary"): V.summary(self)
	elif s.mode == "story": V.delivery(self)
	elif s.mode == "journey_ready": V.departure(self)
	elif s.mode == "journey": V.travel(self)
	elif s.mode == "complete": V.completion(self)
	elif not s.joined: V.arrival(self)
	elif view == null and _notices_due(): V.notices(self)
	elif view == null and offer_available(): V.offer(self)
	elif view in PICKER_VIEWS: V.picker(self)
	elif view == "walk-review": V.walk_review(self)
	elif view == "rest": V.rest(self)
	elif view == "settings": V.settings(self)
	elif view == "games": V.games(self)
	elif view == "training-record": CuHub.panel(self, "修习成果", CuHub.record(s))
	if not mandatory and view == null and CuHubViews.debug_schedule and _dialog() == null and not state().get("pending"): CuHubViews.bulletin(self)
	if message != "": CuHub.message(self, message)
	# 有对话框、pending、非 home 或 picker 时栏目全部禁用
	var modal := _dialog()
	if ui.has("bottom"):
		for b in ui.bottom.nav.get_children():
			var dis: bool = modal != null or s.get("pending") != null or s.mode != "home" or view == "picker"
			b.disabled = dis
			b.modulate.a = 0.48 if dis else 1.0
	if ui.has("settings"): ui.settings.disabled = modal != null or s.get("pending") != null or s.mode != "home"
	_focus(focus, modal)

func _dialog() -> Control:
	for c in root.get_children():
		if c.has_meta("dialog"): return c
	return null

func _focus(focus, modal) -> void:
	await get_tree().process_frame
	if root == null: return
	var target: Button = null
	if focus is String: target = _find_btn(root, focus)
	if target == null and modal != null: target = _first_btn(modal)
	if target != null and not target.disabled and target.is_inside_tree(): target.grab_focus()

func _find_btn(n: Node, cmd: String) -> Button:
	if n is Button and n.get_meta("cu", "") == cmd and not n.disabled: return n
	for c in n.get_children():
		var r := _find_btn(c, cmd)
		if r != null: return r
	return null

func _first_btn(n: Node) -> Button:
	if n is Button and not n.disabled and n.visible: return n
	for c in n.get_children():
		var r := _first_btn(c)
		if r != null: return r
	return null

# ───────── tick（原版 P.mount(root,tick) 每帧调用） ─────────

func _process(_d: float) -> void:
	if not _active or broken != null or fighting or _tick_busy: return
	var s := state()
	var p = s.get("pending")
	if not (p is Dictionary) or p.get("story"): return
	var now := CuDB.now_ms()
	var an = p.get("animation")
	if an is Dictionary and not an.done and not an.get("presented"):
		var b = ui.get("board")
		if b == null or not is_instance_valid(b): return
		an.startedAt = now
		an.presented = true
		var c = b.get_meta("clip") if b.has_meta("clip") else null
		if c != null: c.started_at = Time.get_ticks_msec()
		persist()
	if an is Dictionary and not an.done and now - float(an.startedAt) >= float(an.duration):
		perform(func():
			CuCore.finishAnimation(state(), now)
			if state().pending.stage == "ready" or direct_result():
				CuCore.resolve(state(), null, {"directResult": direct_result()})
				apply_world_learning())
		return
	# 旧存档停在已删除的课程选择上：动画后照常结算，不代选、不重复扣费
	if direct_result() and p.stage == "choice" and (not an or an.done):
		perform(func(): CuCore.resolve(state(), null, {"directResult": true}); apply_world_learning())
		return
	var a = CuDB.action(p.action)
	var r = p.get("result")
	if p.stage == "result" and not (a and a.get("mail")) and r is Dictionary and not r.get("courseBeat") and not r.get("lesson") and not r.get("trainingChanged") and now - float(p.get("resolvedAt", 0)) >= 1000:
		finish_result()

## 原版 finishResult()
func finish_result() -> void:
	var p = state().get("pending")
	if not (p is Dictionary) or p.stage != "result": return
	perform(func():
		var teach = state().pending.result.get("first")
		CuCore.closeResult(state())
		view = null if teach and offer_available() else "picker")

## 原版 applyWorldLearning()
func apply_world_learning(_x = null) -> void:
	CuCore.reconcileWorld(G.S)

## 原版 begin(id, teaching)
func begin(id: String, teaching := false) -> void:
	if id == "QH01":
		perform(func():
			CuCore.start(state(), id, {"directResult": true})
			if CuDB.error == "": CuCore.resolve(state(), 0)
			apply_world_learning(); view = null)
		return
	var a = CuDB.action(id)
	if a == null: return
	if a.category == "skill" and a.get("learn") and not state().learned.get(a.learn) and not teaching:
		announce("请先完成师父的传艺，再来练习。"); render(); return
	# 去的地方此刻没事：留在闲逛条上，显示“没遇到什么”的那句话
	if a.get("strollPlace"):
		var idle := [""]
		perform(func():
			var r = CuCore.stroll(state(), id)
			if r == null: return
			idle[0] = "" if r.get("story") else str(r.get("text", ""))
			view = null if r.get("story") else "picker")
		if idle[0] != "":
			message = idle[0]
			render("practice")
		return
	if a.get("once"):
		perform(func(): CuCore.start(state(), id, {"story": true}); view = null)
		return
	perform(func():
		var guidance: bool = (a.get("learn") and not state().learned.get(a.learn)) or (a.get("once") and a.get("teacher") in ["周砚", "叶蘅"])
		CuCore.start(state(), id, {"theme": "近况", "recipient": recipient if a.get("mail") else null, "gift": gift if id == "C02" else null, "animate": true, "directResult": direct_result()})
		if CuDB.error != "": return
		state().pending.guidance = guidance
		state().pending.animation.presented = false
		view = null)

## 原版 closeView()
func close_view() -> void:
	if CuMail.close_bag(self): return
	var previous = view
	var picker: bool = previous in ["gift-npc", "letter-npc"]
	message = ""
	view = "picker" if picker or previous == "walk-review" else null
	recipient = ""
	render("walk-review" if previous == "walk-review" else ("mail-select" if picker else "category"))

## 原版 runFight(s)：切磋与实战进真实战斗，胜负各接一段对白（choices 的 win／lose）
func run_fight() -> void:
	var s := state()
	var d = CuDB.action(s.pending.get("action")) if s.get("pending") else null
	if fighting or d == null or not d.get("fight") or s.pending.visitor.phase != "choice": return
	fighting = true
	var result := "lose"
	var practice_weapon = G.S.get("weapon")
	apply_world_learning()
	_hide()
	var options: Dictionary = CuHousehold.fightOptions(d)
	options.guiyunHero = true
	options.heroPor = "gy_hero_long"
	if d.id == "gy_bamboo_wolves": options.temporaryDou = true
	result = await Battle.start(options)
	G.S.weapon = practice_weapon
	_show()
	fighting = false
	perform(func(): CuCore.visitorChoose(state(), 0 if result == "win" else 1))

## 原版 GuiyunCombat.trainingOptions(route)（guiyun-combat-runtime.js）
func training_options(route) -> Dictionary:
	return {"solo": true, "noLose": true, "noFlee": true, "bg": "bb_qh_training_v1", "training": {"route": route, "actions": [], "result": null},
		"foes": [{"name": "周砚 · 示范与叫停", "sp": "c_gy_zhouyan", "weapon": "iron", "lv": 88, "st": {"str": 9, "con": 10, "agi": 10, "wil": 10, "wis": 10}, "skills": {"gy_zhou_teaching": 1}, "hpMul": 1, "atkMul": 0, "shield": 99, "weak": [], "exp": 0, "silver": 0, "drops": {}}]}

## 原版 runTraining(s)：周砚考校
func run_training() -> void:
	var s := state()
	if fighting or not s.get("pending") or s.pending.get("action") != "gy_zhou_test" or s.pending.visitor.phase != "choice": return
	fighting = true
	var opt := training_options(s.pending.visitor.context.preHangao.route)
	var weapon = G.S.get("weapon")
	opt.guiyunHero = true
	opt.heroPor = "gy_hero_long"
	apply_world_learning()
	var item = DB.ITEMS.get(str(G.S.get("weapon")), {}) if G.S.get("weapon") else {}
	if opt.training.route == "sword" and str(item.get("weapon", {}).get("kind", "")) != "剑":
		announce("考校未完成：剑路考校请先装备已领取或已有的剑")
	else:
		_hide()
		await Battle.start(opt)
		_show()
		var key: String = str(opt.training.get("result")) if opt.training.get("result") else "hasty"
		var idx := -1
		var ch: Array = CuVisitors.eventScript(state().pending).get("choices", [])
		for i in ch.size(): if ch[i].get("key") == key: idx = i
		CuDB.clear()
		if idx < 0: announce("考校未完成：考校结果无法接续")
		else:
			CuCore.visitorChoose(state(), idx)
			if CuDB.error != "": announce("考校未完成：" + CuDB.error); CuDB.clear()
	G.S.weapon = weapon
	fighting = false
	perform(func(): pass)

## 原版 openMartial / openJianghu：暂时收起培养界面，打开江湖页，关闭后回到培养
## 2026-11-05 用户：“第一章和第二章的 esc 弹出来的菜单是不一样的，这肯定要统一”。
## 培养模式里 Esc、右上角齿轮、“江湖”按钮都打开同一个江湖菜单（设置页里另有培养模式专有的几项，见 page_sys.gd）。
var after_menu := ""   # 在设置页点了“修习成果”“小游戏试玩”：回到培养界面后打开它

func open_jianghu(tab := "party") -> void:
	_hide()
	G.mode = "scene"
	Menu.from_cultivation = true
	Menu.open(tab, "hero")
	while Menu.s.open: await get_tree().process_frame
	Menu.from_cultivation = false
	await get_tree().process_frame   # “返回首页”“载入存档”是延后一帧才回标题的，等它
	if G.S == null or G.mode == "title": after_menu = ""; return   # 已经回标题了，不再把培养界面盖回去
	G.mode = "cultivation"
	start({"inherit": true})
	if after_menu != "":
		view = after_menu; after_menu = ""; render()

# ───────── 按钮（原版 onClick，data-cu / data-id） ─────────

func on_cu(a: String, id := "", _b = null) -> void:
	if not _active: return
	if broken != null:
		if a == "recovery-title": to_title()
		elif a == "recovery-restart":
			_quarantine(G.S.cultivation, broken.error, [])
			G.S.erase("cultivation")
			broken = null
			migrate()
			start({"inherit": true})
		return
	if CuMail.is_bag_open(self) and not a.begins_with("mail-bag") and a != "gift-item" and a != "close": return
	if CuMail.handle_action(self, a, id): return
	var s := state()
	if s.get("pending"):
		var p: Dictionary = s.pending
		if a == "lesson-next":
			perform(func(): state().pending.lessonCursor = int(state().pending.get("lessonCursor", 0)) + 1); return
		if a == "visitor-next":
			var linear: bool = CuDB.action(p.action).get("linear", false)
			perform(func():
				CuCore.visitorNext(state())
				apply_world_learning()
				if linear and state().get("pending") and state().pending.stage == "result":
					CuCore.closeResult(state()); view = null)
			return
		if a == "visitor-choice": perform(func(): CuCore.visitorChoose(state(), int(id))); return
		if a == "visitor-fight": run_fight(); return
		if a == "visitor-training": run_training(); return
		if p.get("animation") and not p.animation.done: return
		if p.get("story") and a == "activity-story-next":
			var x = CuDB.action(p.action)
			var lines = (x.get("introByDelivery", {}) if x.get("introByDelivery") is Dictionary else {}).get(str(s.facts.get("first_delivery", {}).get("method") if s.facts.get("first_delivery") is Dictionary else ""))
			if lines == null: lines = x.get("introLines", [])
			var n: int = lines.size()
			var at := int(p.get("storyLine", 0))
			perform(func():
				if at + 1 < n: state().pending.storyLine = at + 1
				else: state().pending.storyStep = 1)
			return
		if p.get("story") and a == "story-result-close":
			var auto: bool = CuDB.action(p.action).get("auto", false)
			perform(func(): CuCore.closeResult(state()); view = null if auto else "picker"); return
		if a == "result-close" and p.stage == "result": finish_result(); return
		if a == "resolve": perform(func(): CuCore.resolve(state(), int(id)); apply_world_learning())
		return
	match a:
		"category":
			var cat = CuDB.find_by(CuCore.D().categories, "id", id)
			if cat == null or s.mode != "home": return
			var list := available_actions(cat)
			var first = list[0].id if list.size() else CuDB.find_by(CuCore.actions(), "category", id).id
			s.selection = {"category": id, "action": null if id == "skill" else first}
			view = "picker"; message = ""
			render("mail-close" if id == "mail" else "close")
		"walk-review":
			if s.selection.category != "stroll" or not walk_reviewed(): return
			view = "walk-review"; message = ""; render("close")
		"practice":
			var act = CuDB.action(id)
			var reason := why(act)
			if reason != "": announce(reason); render(); return
			s.selection.action = id
			begin(id)
		"mail-select":
			if s.selection.category != "mail" or not id in ["C01", "C02"]: return
			s.selection.action = id; message = ""; recipient = ""
			view = "letter-npc" if id == "C01" else "gift-npc"
			render()
		"gift-npc":
			if view != "gift-npc" or not CuDB.has_by(CuCore.giftRecipients(s), "name", id): return
			recipient = id; render("mail-open-bag")
		"letter-npc":
			if view != "letter-npc" or not CuDB.has_by(CuCore.letterRecipients(s), "name", id): return
			recipient = id; render("mail-send")
		"mail-inbox":
			if s.selection.category != "mail": return
			view = "mail-inbox"; render()
		"mail-read":
			if view != "mail-inbox": return
			perform(func():
				var l = CuCore.readLetter(state(), id)
				if l == null: return
				message = "回信已读，回物已收进培养包裹。" if (l.get("returnItems", {}) as Dictionary).size() else "回信已读。")
		"mail-send":
			if view != "letter-npc" or not CuMail.can_send_letter(self): return
			begin("C01")
		"gift-item":
			if view != "gift-npc" or not CuMail.can_gift(self, id): return
			CuMail.close_bag(self, false)
			gift = id; begin("C02")
		"close": close_view()
		"martial-menu": open_jianghu("skill")
		"settings": open_jianghu("sys")
		"debug-schedule":
			CuHubViews.debug_schedule = not CuHubViews.debug_schedule
			render("debug-schedule")
		"jianghu":
			if s.get("pending") or view != null: return
			open_jianghu()
		"notice-close":
			perform(func():
				for l in state().letters:
					if str(l.id).begins_with("notice-") and int(l.due) <= CuCore.period(state()): l.read = true
				view = null)
		"arrival-next": perform(func(): CuCore.join(state()); view = null)
		"offer-next": perform(func(): state().dialogue = {"id": "weapon-offer", "period": CuCore.period(state())})
		"delivery-next": perform(func(): state().dialogue = {"id": "delivery"})
		"teach":
			perform(func(): state().facts.weapon_offer_period = CuCore.period(state()); state().dialogue = null)
			state().selection = {"category": "skill", "action": id}
			begin(id, true)
		"offer-later": perform(func(): state().facts.weapon_offer_period = CuCore.period(state()); state().dialogue = null; view = null)
		"rest", "games", "training-record", "return-preview", "completion-record":
			view = a; message = ""; render()
		"return-cancel": view = null; render()
		"sound":
			AudioServer.set_bus_mute(0, not AudioServer.is_bus_mute(0)); render("sound")
		"rest-confirm": perform(func(): CuCore.advance(state()); view = null)
		"summary-close": perform(func(): state().summary = null; view = null)
		"story-complete": perform(func(): CuCore.completeStory(state(), id); state().dialogue = null; view = null)
		"depart": perform(func(): CuCore.depart(state()); view = null)
		"gate-title": persist(); to_title()
		"return-confirm": perform(func(): CuPei.returnLoan(G.S); CuCore.returnJourney(state()); view = null)

## 原版 location.href=location.pathname（回到首页）：收起培养层，挂标题页（同 boot.gd 的做法）
func to_title() -> void:
	leave()
	G.mode = "title"
	var t: Node = load("res://scenes/title.tscn").instantiate()
	get_tree().root.add_child(t)

# ───────── 键盘（原版 keydown 捕获） ─────────

func _input(ev: InputEvent) -> void:
	if not _active or G.mode != "cultivation" or broken != null or fighting: return
	if not (ev is InputEventKey) or not ev.pressed: return
	var k := ev as InputEventKey
	var s := state()
	var modal := _dialog()
	if view == "games" and k.keycode != KEY_ESCAPE: return
	if k.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		if CuMail.is_bag_open(self): CuMail.close_bag(self); return
		if not s.get("pending") and not s.get("summary") and view in ["picker", "gift-npc", "letter-npc", "mail-inbox", "walk-review", "rest", "settings", "games", "training-record"]: close_view(); return
		# 什么都没开着：和探索地图时一样，Esc 打开江湖菜单的设置页
		if not s.get("pending") and not s.get("summary") and modal == null and view == null and s.mode == "home": open_jianghu("sys")
		return
	# 对白有 ▾ 时，空格／回车直接推进
	if k.keycode in [KEY_SPACE, KEY_ENTER, KEY_KP_ENTER] and not k.echo:
		var host: Control = modal if modal != null else null
		if host != null and host.has_meta("next"):
			var nx: Button = host.get_meta("next")
			var at := get_viewport().gui_get_focus_owner()
			if is_instance_valid(nx) and (at == nx or at == null or not (at is Button)):
				get_viewport().set_input_as_handled()
				nx.pressed.emit()
				return
	if not s.get("pending") and modal == null and s.mode == "home":
		if k.keycode == KEY_R:
			get_viewport().set_input_as_handled(); view = "rest"; render(); return
		if k.keycode >= KEY_1 and k.keycode <= KEY_7:
			get_viewport().set_input_as_handled()
			var cat: Dictionary = CuCore.D().categories[k.keycode - KEY_1]
			var list := available_actions(cat)
			s.selection = {"category": cat.id, "action": list[0].id if list.size() else CuDB.find_by(CuCore.actions(), "category", cat.id).id}
			view = "picker"
			render("mail-close" if cat.id == "mail" else "close")
			return

# ───────── 调试入口 ─────────

## godot --path game -- --cultivation=1：造一份“刚进入培养模式”的 G.S 并直接进入
## 参数：1 = 真实进入时的状态（同 bridge.enter：已入门，第 1 月月初）；arrival = 未入门（入门对白）；monthN = 用自检策略快进到第 N 月
## shot:<entry|hub|p0…p7>[:dump] = 同 1，再推进到对照截图的界面状态（见 cu_shot.gd）
func debug_start(arg: String) -> void:
	if arg == "selftest" or arg == "coverage" or arg.begins_with("random"): return
	var shot := ""
	if arg.begins_with("shot:"): shot = arg; arg = "1"
	if arg.begins_with("uitest"): arg = "1"
	var S := G.new_state()
	S.name = "萧白"; S.origin = "prologue"; S.skills = {}; S.bag = {}; S.weapon = null; S.armor = null; S.party = []; S.pet = null; S.pets = {}
	S.scene = "qh_mountain"
	S.qiheChapter = {"stage": "ended", "rescue": null, "chenCare": null, "supplies": null}
	S.prologue = {"version": 2}
	G.S = S
	if G.save_key == "": G.save_key = G.new_journey_key()
	var s := CuCore.initial()
	CuCore.syncMode(s)
	S.cultivation = s
	migrate()
	s = S.cultivation
	if arg == "arrival": s.joined = false; s.facts.erase("joined")
	elif arg.begins_with("month"):
		var target := int(arg.trim_prefix("month"))
		CuSelftest.fast_forward(s, target)
	await get_tree().process_frame
	if shot != "": CuShot.run(self, shot)
	enter({"inherit": false})
