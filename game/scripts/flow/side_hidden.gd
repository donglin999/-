extends Node
## 栖河隐藏奇遇（原版 js/qihe-hidden.js）：H1 北坡石洞（原版 CAVE_ON=false，暂不启动）、H2 村口老人（老更夫）、H3 帮众挑衅（与阿炭比划）、H7 认得全村的人。
## 台词全在 ink：story/01-开始/奇遇-*.ink；这里只管入口、条件、存档与奖励。不进任务栏、不靠好感数值。存档 S.qiheHidden。

var side: Node

## 2026-10-28 原版：石洞剧情先不启动，打开即恢复
const CAVE_ON := false

func _ready() -> void:
	DB.ITEMS.mj_art_jh_jh = {"name": "《金虺剑法》", "desc": "丙级剑法秘籍，江湖散学。北坡石洞石匣里的旧书，纸边发黄。入谷培养后，身法练到 6 可在背包里参悟。", "key": 1, "q": 1, "manual": "art_jh_jh"}
	DB.ITEMS.mj_art_gj_h1 = {"name": "《扬灰手》", "desc": "丁级暗器秘籍，归烬堂给新人的入门功夫：抓一把冷灰扬出去。本是客栈里那个新来的少年的，比划输了被帮众扔给你；边角翻得起毛。入谷培养后可在背包里参悟。", "key": 1, "q": 0, "manual": "art_gj_h1"}
	DB.ITEMS.qh_huiwen_cloth = {"name": "回纹布角", "desc": "北坡石洞里拾到的一角深蓝布，边上缝着一圈回纹针脚。", "key": 1, "q": 0}
	DB.ITEMS.qh_nanchuang_xf = {"name": "《南窗心法》", "desc": "丙级心法，只是开头几层。村口老人手抄的一页：当年汉皋府牢里一个穿了琵琶骨的小伙学自同牢的大哥，雪夜躲进更房时传给了他。伤得越重，这口气越稳。入谷培养后可在背包里参悟。", "key": 1, "q": 1, "manual": "xf_nanchuang"}
	DB.ITEMS.qh_baijia_charm = {"name": "百家平安符", "desc": "佩饰。一村人一人缝一针缝成的平安符。挨上致命一击时保住 1 点气血，每场一次。", "acc": 1, "fx": {}, "func": {"lastStand": 1}, "q": 0}
	_install()

func state() -> Dictionary:
	if not (G.S.get("qiheHidden") is Dictionary): G.S.qiheHidden = {"version": 1}
	var h: Dictionary = G.S.qiheHidden
	for k in ["cave", "elder", "village", "flags"]:
		if not (h.get(k) is Dictionary): h[k] = {}
	if not (h.get("bandit") is Dictionary): h.bandit = {"talks": 0}
	return h

func days() -> bool: return side.days()
func half() -> int: return side.half()
func play(knot: String, vars: Dictionary = {}): return await side.play(knot, {}, vars)
func has(id: String) -> bool: return side.has(id)

## 原版 exp(n)：CharacterGrowth.awardBattle(S, n, [], settle)
func exp(n: int) -> void:
	G.S.exp = int(G.S.get("exp", 0)) + n
	side.C.settle_levels(G.S)

## 包一层人物的“谈”：pick() 返回要接管时的处理函数，否则照旧
func wrap_talk(scene: String, id: String, pick: Callable) -> void:
	var n: Dictionary = side.npc(scene, id)
	if n.is_empty(): return
	var base: Callable = side.act_of(n)
	n.act = func(x = null):
		var f = pick.call()
		if f is Callable: await side.guarded(f)
		else: await base.call(x)

func _take(id: String) -> void:
	var b: Dictionary = side.bag()
	b[id] = int(b.get(id, 0)) - 1
	if int(b[id]) <= 0: b.erase(id)

# ─────────────────────── H1、H2 村口老人 ───────────────────────
func cave() -> Dictionary: return state().cave
func elder() -> Dictionary: return state().elder

func _elder_pick():
	if not days(): return null
	var e := elder()
	if CAVE_ON and not cave().get("heard"):
		return func(): await play("qh_hid_elder_cave"); cave().heard = true; e.at = half()
	if G.S.get("prologue", {}).get("errands", {}).get("medicine") != "done" or e.get("taught") or e.get("at") == half(): return null
	# 推辞也记下这个半日，同一个半日再进门不再马上又问
	if not e.get("veg"):
		return func():
			if await play("qh_hid_elder_veg") == "help": e.veg = true
			e.at = half()
	if half() < 3: return null
	return func():
		if await play("qh_hid_elder_watch") != "stay":
			e.at = half(); return
		await play("qh_hid_elder_night")
		e.taught = true
		await side.gain_short({"qh_nanchuang_xf": 1})

func _install_cave() -> void:
	wrap_talk("prologue_chen_hall", "chen", func():
		if not (days() and cave().get("heard") and not cave().get("done") and not cave().get("rope") and not has("qh_rope")): return null
		return func():
			var a = await play("qh_hid_chen_rope")
			cave().rope = true; cave().told = a == "told"
			await side.gain_short({"qh_rope": 1}))
	var light := func(): return has("qh_tinder") or has("qh_storm_lantern")
	var n := {"id": "hid-cave", "name": "北坡石洞", "sp": null, "x": 640 / World.TS, "y": 205 / World.TS, "dir": "d", "fixed": true, "idle": false, "verb": "进入 / 查看",
		"prop": "prop_qh_north_cave_mouth_20261028", "block": [56, 22]}
	World.scenes[side.IDS.north].npcs.append(n)
	side.node(side.IDS.north, "hid-cave", func(): await side.guarded(func():
		var c := cave()
		if c.get("done") or not c.get("heard"): await play("qh_hid_cave_look"); return
		if not has("qh_rope") or not light.call():
			await play("qh_hid_cave_need", {"need_rope": not has("qh_rope"), "need_light": not light.call()}); return
		var a = await play("qh_hid_cave", {"told": side.C.truthy(c.get("told")), "coat": side.C.owns("qh_song_coat")})
		if a == "leave": return
		c.done = true; c.cubs = "scare" if a == "scare" else "around"; state().flags.hint_huiwen_cave = true
		exp(40)
		await side.gain_short({"mj_art_jh_jh": 1, "qh_huiwen_cloth": 1})), func(): return side.before_fire())

# ─────────────────────── H3 帮众的挑衅（与阿炭比划） ───────────────────────
func bandit() -> Dictionary: return state().bandit
## 正在谈酒钱时不插进来（side_town.gd）
func tab_busy() -> bool: return G.S.get("qiheTown", {}).get("tab", {}).get("stage") == "offered"
func book_state() -> String:
	var b := bandit()
	if b.get("decided") == "give": return "sell"
	if b.get("decided"): return str(b.decided)
	return "won" if b.get("won") else ""

func bond(id: String, d: int) -> void: side.bond(id, d, {"story": true, "reason": "story"})

## 对手档：和萧白差不多弱，数值随萧白等级；战斗图沿用归烬堂帮众
func atan_foe() -> Dictionary:
	return {"name": "新来的 · 比划", "sp": "c_qh_raider_front_v1", "lv": max(1, int(G.S.get("lv", 1))), "st": {"str": 3, "con": 3, "agi": 3, "wil": 2, "wis": 2},
		"skills": {"fist": 1}, "hpMul": 0.8, "atkMul": 0.55, "shield": 2, "weak": ["棍", "刀", "剑"], "h": 150, "exp": 20, "silver": 0, "drops": {}}

func bandit_fight() -> void:
	var r = await Flow.run_battle({"allowAuto": true, "solo": true, "noLose": true, "foes": [atan_foe()]})
	if r != "win": await play("qh_hid_bandit_lose"); return
	bandit().won = true
	await play("qh_hid_bandit_win")
	await side.gain_short({"mj_art_gj_h1": 1})

func _bandit_pick():
	var b := bandit()
	if tab_busy() or not side.before_fire(): return null
	if b.get("won"): return func(): await play("qh_hid_bandit_done")
	if int(b.get("talks", 0)) < 1:
		b.talks = 1; return null   # 原来那句“看什么看？滚远点。”
	if int(b.talks) < 2: return func(): b.talks = 2; await play("qh_hid_bandit_2")
	return func():
		if await play("qh_hid_bandit_3") == "fight": await bandit_fight()

func talk_atan() -> void:
	var b := bandit(); var st := book_state()
	var a = await play("qh_hid_atan", {"book": st, "named": b.get("decided") == "return"})
	if st != "won": return
	if a == "return" and has("mj_art_gj_h1"):
		_take("mj_art_gj_h1"); b.decided = "return"; state().flags.qh_recruit_returned = true
		bond("atan", 8); UI.toast("《扬灰手》还给了阿炭", 1500)
	elif a == "keep":
		b.decided = "keep"; bond("atan", -5)

## 赢了册子、还没处置时去找岑霜：卖回给她（银两 +20，岑霜好感 −5，归烬堂声望 −3，阿炭 −10）；“不卖”不算处置，只问这一回
func _cen_pick():
	if not (book_state() == "won" and has("mj_art_gj_h1") and not bandit().get("cenAsked")): return null
	return func():
		var a = await play("qh_hid_cen_book")
		bandit().cenAsked = true
		if a == "sell":
			_take("mj_art_gj_h1"); G.S.silver = side.silver() + 20; bandit().decided = "sell"; UI.toast("银两 +20", 1400)
			bond("censhuang", -5); bond("atan", -10)
			if _mod("Menu").has_method("jianghu_settle"): _mod("Menu").jianghu_settle("story", {"faction": {"guijintang": -3}, "fame": 0})

# ─────────────────────── H7 认得全村的人 ───────────────────────
func _stage_of(k: String):
	return G.S.get("prologue", {}).get("outsiders", {}).get("quests", {}).get(k, {}).get("stage")

func _past(k: String, not_in: Array = []) -> bool:
	var s = _stage_of(k)
	return s != null and s != "" and not (s in ["none", "offered", "accepted"] + not_in)

func village_deeds() -> Dictionary:
	var e: Dictionary = G.S.get("prologue", {}).get("errands", {})
	var p = side.CP()
	var c: Dictionary = p.get("choices", {}) if p != null else {}
	var t: Dictionary = G.S.get("qiheTown", {})
	var any_done := false
	for k in ["bowls", "cloth", "medicine"]:
		if e.get(k) == "done": any_done = true
	return {"周婶": any_done or side.C.truthy(c.get("clinic")),
		"陈伯": e.get("bowls") == "done" or t.get("pole", {}).get("stage") == "done" or _past("letter"),
		"店家": e.get("cloth") == "done" or t.get("tab", {}).get("stage") == "done",
		"药商": side.C.truthy(c.get("market")) or _past("account"),
		"村口老人": e.get("medicine") == "done",
		"差役": _past("ledger", ["checked"])}

func _install() -> void:
	wrap_talk("qihe_trial", "elder", _elder_pick)
	if CAVE_ON: _install_cave()
	wrap_talk("prologue_inn_interior", "bandit", _bandit_pick)
	# 新来的（阿炭）站在帮众旁边；起火前都在客栈（节点已在 sc.json；名字随处置变：还了书叫阿炭）
	var at: Dictionary = side.npc("prologue_inn_interior", "atan")
	if not at.is_empty():
		at.act = func(_x = null): await side.guarded(talk_atan)
		at.show = func():
			at.name = "阿炭" if G.S != null and G.S.get("qiheHidden", {}).get("bandit", {}).get("decided") == "return" else "新来的"
			return side.before_fire()
	for sc in ["qh_south", "qh_east", "qh_refuge"]: wrap_talk(sc, "censhuang", _cen_pick)
	wrap_talk("qh_refuge", "aunt", func():
		var v: Dictionary = state().village
		if v.get("given"): return null
		for ok in village_deeds().values():
			if not ok: return null
		return func():
			await play("qh_hid_village_charm"); v.given = true
			await side.gain_short({"qh_baijia_charm": 1}))


## 运行时找其他模块（模块编译失败时不连累本文件）
func _mod(n: String) -> Object:
	var m = get_node_or_null("/root/" + n)
	return m if m != null else Object.new()   # 空对象：has_method 一律为假
