extends Node
## 小耗子（阿七）的一课（原版 js/qihe-aqi.js）：固定剧情，主线必经；剧本 story/01-开始/风起-小耗子.ink。
## 2026-11-09 二版（剧本 xiaojianghu-godot/story/风起-小耗子-二版.ink）：他在客栈门口喊一声 → 讨羊肉笼饼（给他：他对萧白好感加；被抢：萧白声誉加）
## → 托萧白拿他攒的钱去南村口药摊买药 → 挂到村南老人家门上 → 回客栈门口，他说两条规矩，让萧白用“窃”印从他身上摸一枚铜钱 → 报本名，学会“窃”。
## 不再去东埠摸采办随从的钱袋。步骤 S.aqiTeach.step：0 未开始、1 去买药、2 去挂药、3 挂好了回去找他、4 等萧白用“窃”；wage 为真时这一课结束。
## 旧存档（v 不是 2）按旧步骤换算：旧 1、2 → 1（去买药），旧 3 → 2，旧 4 → 3。

var side: Node

## 教学手：门口一手 70%、失手不罚再来；摸钱袋固定 100%
const STEP_AFTER := {}
const LESSON := {"aqi_lesson_coin": {"n": "铜钱", "rate": 70}, "aqi_lesson_purse": {"n": "钱袋", "rate": 100}}
## 保底：三次失手小耗子自己把门道说了，算教会；头一回就成，他对萧白好感 +5
const PITY_AFTER := 3
const QUICK_BOND := 5
## 讨饼：给他，他对萧白好感 +8；被他抢去，萧白声誉 +2（用户定）
const BUN_BOND := 8
const GRAB_FAME := 2
## 第一天白天主线：一课没上完前指向客栈门口（chapter.gd main_step 用）
const AQI_STEP := {"aqi": true, "npc": "aqi", "who": "小耗子", "title": "客栈门口的小耗子在喊你", "where": "中央村落 · 客栈门口", "scene": null}

func _ready() -> void:
	_install()

func teach() -> Dictionary:
	if not (G.S.get("aqiTeach") is Dictionary): G.S.aqiTeach = {"step": 0, "wage": null, "v": 2}
	var t: Dictionary = G.S.aqiTeach
	if int(t.get("v", 1)) != 2:
		var old := int(t.get("step", 0)) if t.get("step") != null else 0
		if not side.C.truthy(t.get("wage")): t.step = {0: 0, 1: 1, 2: 1, 3: 2, 4: 3}.get(old, 0)
		t.v = 2
	return t

func step() -> int:
	if G.S == null or not (G.S.get("aqiTeach") is Dictionary): return 0
	var t := teach()
	return int(t.get("step", 0)) if t.get("step") != null else 0

func learned() -> bool:
	var t = G.S.get("aqiTeach") if G.S != null else null
	return t is Dictionary and side.C.truthy(t.get("wage"))

func days() -> bool: return side.days()
func half() -> int: return side.half()

## 窃术状态（原版 qihe-steal.js state）
func steal_state() -> Dictionary:
	if not (G.S.get("steal") is Dictionary): G.S.steal = {"version": 1}
	var s: Dictionary = G.S.steal
	if not s.get("lv"): s.lv = 1
	if not s.get("exp"): s.exp = 0
	for k in ["taken", "alert", "caught", "rumor"]:
		if not (s.get(k) is Dictionary): s[k] = {}
	return s

## 原版 QiheSteal.teach(key, result)：teach 规则集成功时 advanceQuest aqiTeach.step +1、窃术经验 +1
func steal_teach(_key: String, result: String) -> void:
	if result != "ok" and result != "great": return
	teach().step = step() + 1
	steal_state().exp = int(steal_state().exp) + 1

func lesson(key: String) -> void:
	var L = LESSON.get(key)
	var fails := 0
	while true:
		var r := "ok"
		# 偷窃小游戏归人物交互子任务（原版 QiheStealUI.minigame）；没有时按成功处理（与原版 UI 未加载时一致）
		if _mod("Npc").has_method("steal_minigame") and L != null:
			r = str(await _mod("Npc").steal_minigame("aqi", {"n": L.n}, L.rate, "none", []))
		if r != "ok" and r != "great": r = "fail"
		if r != "fail":
			steal_state().exp = int(steal_state().exp) + 1
			if not fails:
				await side.C.play("fq_aqi_quick")
				side.bond("aqi", QUICK_BOND, {"reason": "bond"})
			else: await side.C.play("fq_aqi_got")
			break
		fails += 1
		if fails >= PITY_AFTER:
			await side.C.play("fq_aqi_pity"); break
		await side.C.play("fq_aqi_again")
	side.save()

## 墨印“窃”点小耗子（第 4 步）：门口那一手，摸着了报本名、学会“窃”
func seal_lesson() -> void:
	await side.guarded(func():
		await lesson("aqi_lesson_coin")
		await play("fq_aqi_learned"))

func lesson_pending() -> bool: return G.S != null and days() and not learned() and step() == 4

## 讨饼
func has_bun() -> bool: return int(side.bag().get("bun", 0)) > 0
func bun(mode: String) -> void:
	var bag: Dictionary = side.bag()
	if int(bag.get("bun", 0)) > 0: bag["bun"] = int(bag.bun) - 1
	if mode == "give":
		side.bond("aqi", BUN_BOND, {"reason": "bond"})
		UI.toast("羊肉笼饼 −1 · 小耗子好感 +%d" % BUN_BOND, 1800)
	else:
		var n = _mod("Npc")
		if n.get("rep") != null: n.rep.apply_fame(GRAB_FAME, "aqi_grab", null)
		UI.toast("羊肉笼饼 −1 · 声誉 +%d" % GRAB_FAME, 1800)
	teach().bun = mode
	side.save()

func learn() -> void:
	var t := teach()
	var s := steal_state()
	s.lv = max(1, int(s.get("lv", 1))); s.exp = int(s.get("exp", 0)) + 3
	if not (G.S.get("skills") is Dictionary): G.S.skills = {}
	G.S.skills.steal = true
	# “窃”印读人物交互模块的 skills（原版 qihe-npc-core.js stealState）
	var ns = G.S.get("qiheNpc")
	if ns is Dictionary:
		if not (ns.get("skills") is Dictionary): ns.skills = {}
		ns.skills.steal = true
	t.learnedAt = half(); t.wage = "done"; side.save()
	UI.toast("学会“窃” · 窃术一级 · 墨印菜单第八枚印已开", 2400)

func ext() -> Dictionary:
	return {"fq_aqi_steal": func(key): await lesson(str(key)), "fq_aqi_learn": func(): learn(),
		"fq_aqi_has_bun": func(): return has_bun(), "fq_aqi_bun": func(mode): bun(str(mode))}

func play(knot: String, vars: Dictionary = {}):
	return await side.play(knot, ext(), vars)

## 画外音：这几个人这一段只闻其声（chapter.gd place_cast 跳过 offstage 里的人）
func offstage(names: Array, fn: Callable):
	for n in names: side.C.offstage[n] = true
	var r = await fn.call()
	for n in names: side.C.offstage.erase(n)
	return r

func _install() -> void:
	var V := "qihe_trial"
	var a: Dictionary = side.node(V, "aqi", func(): await side.guarded(func():
		var s := step()
		if not learned():
			if s == 0:
				await play("fq_aqi_meet"); teach().step = 1; side.save()
				UI.toast("已接：替小耗子买药", 1600)
			elif s == 3:
				await play("fq_aqi_back"); teach().step = 4; side.save()
				UI.toast("小耗子身上的墨印“窃”亮了 · 走近按 E 选“窃”", 2600)
			else: await play("fq_aqi_wait")
			return
		var t := teach()
		if half() >= 2 and not t.get("hintReturn"):
			t.hintReturn = true; await play("fq_aqi_hint_return"); return
		await play("fq_aqi_idle")), func(): return days())
	a.mark = func(): return days() and ((not learned() and step() in [0, 3, 4]) or (half() >= 2 and not (G.S.get("aqiTeach") is Dictionary and G.S.aqiTeach.get("hintReturn"))))
	# 南村口药商：拿小耗子攒的钱买药
	_wrap("qh_south", "merchant", func(): return days() and step() == 1, func(): await side.guarded(func():
		await play("fq_aqi_buy"); teach().step = 2; side.save()))
	# 挂药这一步老人在屋里（剧本：隔着门问“谁呀”），门口那个常驻的老人先不站
	var elder: Dictionary = side.npc(V, "elder")
	if not elder.is_empty():
		var old_show = elder.get("show")
		elder.show = func(): return not (days() and step() == 2) and (not (old_show is Callable) or old_show.call())
	# 村南老人家门口：把药包挂上门环
	var door: Dictionary = side.node(V, "aqi-door", func(): await side.guarded(func():
		await offstage(["村口老人"], func(): await play("fq_aqi_door")); teach().step = 3; side.save()), func(): return days() and step() == 2)
	if not door.is_empty(): door.mark = func(): return true
	# 第二天客栈里：柜上少了钱，店家先看向小耗子（伏笔点 2，随口话，一次）
	var inn: Dictionary = side.npc("prologue_inn_interior", "innkeeper")
	if not inn.is_empty():
		var old: Callable = side.act_of(inn)
		inn.act = func(n = null):
			if days() and half() >= 2 and learned() and not teach().get("hintName"):
				teach().hintName = true
				await side.guarded(func(): await play("fq_aqi_hint_name"))
			await old.call(n)

## 包一层：cond 成立时接管，否则走原来的 act；mark 叠加
func _wrap(scene: String, id: String, cond: Callable, fn: Callable) -> void:
	var n: Dictionary = side.npc(scene, id)
	if n.is_empty(): return
	var old: Callable = side.act_of(n); var old_mark = n.get("mark")
	n.act = func(x = null):
		if cond.call(): await fn.call(); return
		await old.call(x)
	n.mark = func(): return cond.call() or (old_mark is Callable and old_mark.call())

## 《次日药摊》散场后他先喊一声（R-主线-01：对方先开口）；远远喊一声，不摆到萧白身边
func call_out() -> void:
	if learned() or step() > 0 or teach().get("called"): return
	teach().called = true
	await offstage(["小耗子"], func(): await play("fq_aqi_call"))
	side.save()

func pending() -> bool: return days() and half() == 0 and not learned()

## 行记（QiheJournalExtras）
func journal_extra(add: Callable, step_row: Callable) -> void:
	var t = G.S.get("aqiTeach")
	if not (t is Dictionary and t.get("called")) and not step(): return
	var s := step(); var done := learned()
	var objs := ["去客栈门口找小耗子。", "拿小耗子攒的钱，去南村口药摊买一包治老寒腿的药。", "把药包挂到村南老人家门环上，别敲门。", "回客栈门口找小耗子。", "照他说的，用“窃”从他身上摸一枚铜钱。"]
	add.call({"id": "main:aqi", "title": "小耗子的一课", "kind": "主线", "status": "done" if done else "active", "owner": null,
		"origin": "客栈门口那个叫小耗子的外乡少年，讨了你的饼，要拿手上的功夫还这个人情。",
		"objective": "学会了“窃”。他本名叫阿七。" if done else objs[min(s, 4)], "where": "栖河 · 客栈门口", "people": [], "action": null,
		"progress": [step_row.call("讨饼", "客栈门口。", s >= 1 or done), step_row.call("买药", "南村口药摊。", s >= 2 or done),
			step_row.call("挂药", "村南老人家门口。", s >= 3 or done), step_row.call("学手艺", "用“窃”从他身上摸一枚铜钱。", done)]})


## 运行时找其他模块（模块编译失败时不连累本文件）
func _mod(n: String) -> Object:
	var m = get_node_or_null("/root/" + n)
	return m if m != null else Object.new()   # 空对象：has_method 一律为假
