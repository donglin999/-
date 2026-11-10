extends Node
## 归烬堂支线·蔺管事线（原版 js/qihe-lamp-watcher.js）。
## 台词全在 ink：支线-蔺管事-*.ink（灯一～灯四、留话、赏书）、人物-算命先生.ink、人物-船家.ink。
## 本文件只管：算命先生、船家上图，各场入口与时限，第三天上午“后山／跟脚夫”二选一，被说出去后撤摊，结局判定，结局场与奖励，行记条目。
## 存档：剧本用 set_flag 写 S.qiheChapter.records.lamp.*；本文件另记 meetPlayed、report1Done、report2Done、endPlayed、rewards。

var side: Node

## 吉利话（2026-10-27 用户：吉兆删掉，只记一句、弹一行提示，不给真实加成）
const LUCK := {"行": "先生说：这两天跟人过招，不吃亏", "安": "先生说：磕了碰了也好得快", "归": "先生说：这两天跟人好好处，人家记你的好"}
const REWARD := {"blade": {"items": {"qh_shouzhu_jing": 1, "qh_copper_lamp_tag": 1}, "exp": 60}, "book": {"items": {"qh_xinhuo_gong": 1}}, "fare": {"silver": 10}}
const STEPS := [["灯一 · 测字", "在北路算命摊测个字，接下他的托付。", "met"], ["问船家", "去东埠码头问船家：黑衣脚夫坐哪条船、打哪儿来。", "boatman"], ["回话", "把船家的话带回算命摊。", "report1Done"],
	["看封皮", "设法看一眼岑霜那封传讯的封皮。", "seal"], ["天亮的脚夫", "第三天上午：去后山，或从东埠跟着那个脚夫。", "t3|porter_seen"], ["灯四 · 交代", "回算命摊，说说谁在牵线、交给谁。", "report2Done"]]

func _ready() -> void:
	DB.ITEMS.qh_shouzhu_jing = {"name": "《守烛心经》", "desc": "甲级内功秘籍。蔺管事私藏的抄本，不属归烬堂传承。要定力 12、悟性 9、根骨 8，并有一门乙级内功练到五层，才参悟得了。", "key": 1, "q": 4, "manual": "xf_shouzhu"}
	DB.ITEMS.qh_xinhuo_gong = {"name": "《薪火功》", "desc": "丙级内功秘籍，归烬堂堂众常练的一门，蔺管事以个人名义相授。入谷培养后可在背包里参悟。", "key": 1, "q": 2, "manual": "xf_cunjin"}
	DB.ITEMS.qh_copper_lamp_tag = {"name": "铜灯牌", "desc": "信物。一块巴掌大的铜牌，刻着一盏小灯。", "key": 1, "q": 3}
	# ── 上图 ──（船家 2026-10-27 挪到码头入口的开阔草地）
	var f: Dictionary = side.node("qihe_trial", "fortune", func(): await fortune_talk(), func(): return fortune_here())
	f.mark = func(): return open_meet() or open_report1() or open_report2()
	var b: Dictionary = side.node("qh_east", "boatman", func(): await boatman_talk(), func(): return boatman_here())
	b.mark = func(): return open_boatman() or open_tail()

## 只读：不顺手建对象
func lamp() -> Dictionary:
	var p = side.CP()
	if p == null: return {}
	var l = p.get("records", {}).get("lamp")
	return l if l is Dictionary else {}

func lamp_w() -> Dictionary:
	var p = side.CP()
	if not p.has("records"): p.records = {}
	if not p.records.has("lamp"): p.records.lamp = {}
	return p.records.lamp

func rec() -> Dictionary:
	var p = side.CP()
	return p.get("records", {}) if p != null else {}

func dealt() -> bool: return rec().get("stranger_deal") in ["accepted", "asked_first"]

## 被说出去（宋先生那里说出算命先生，或灯二对岑霜说出有人托付，或交付时去告诉岑霜）：当天撤摊，灯四关闭
func exposed() -> bool:
	var l := lamp()
	return side.C.truthy(l.get("sold")) or l.get("handoff") == "cen"

# 各场开放条件（时限按支线稿第六节；半日 5 起收摊离村）
func open_meet() -> bool: return side.days() and side.half() <= 1 and not lamp().get("meetPlayed")
func open_boatman() -> bool: return side.days() and side.half() <= 2 and side.C.truthy(lamp().get("met")) and not lamp().get("boatman")
func open_report1() -> bool: return side.days() and side.half() <= 4 and side.C.truthy(lamp().get("boatman")) and not lamp().get("report1Done") and not exposed()
func open_seal() -> bool:
	var p = side.CP()
	return side.days() and side.half() >= 3 and side.half() <= 4 and side.C.truthy(lamp().get("briefed")) and not lamp().get("seal") and p != null and p.get("events", {}).get("three-meeting", false)
func open_tail() -> bool:
	var p = side.CP()
	return side.days() and side.half() == 4 and side.C.truthy(lamp().get("briefed")) and not lamp().get("t3") and not (p != null and p.get("events", {}).get("c1-s2", false))
func open_report2() -> bool: return side.days() and side.half() == 4 and side.C.truthy(lamp().get("report1Done")) and not lamp().get("report2Done") and not exposed()

func fortune_here() -> bool: return side.days() and side.half() <= 4 and not exposed()
## 地图稿 E1：第一天白天～第三天下午
func boatman_here() -> bool: return side.days() and side.half() <= 5

func give_omen(k) -> void:
	if not LUCK.has(k): return
	var l := lamp_w()
	if not l.has("luck"): l.luck = []
	l.luck.append({"k": k, "at": side.half()})
	UI.toast("得了一句吉利话 · " + LUCK[k], 2200)

## 奖励（支线稿第五节）：只发一次
func reward(kind) -> void:
	var r = REWARD.get(kind)
	var l := lamp_w()
	if not l.has("rewards"): l.rewards = {}
	if r == null or l.rewards.get(kind): return
	l.rewards[kind] = true
	var b: Dictionary = side.bag()
	var items: Dictionary = r.get("items", {})
	for id in items: b[id] = int(b.get(id, 0)) + items[id]
	if r.has("silver"): G.S.silver = side.silver() + r.silver
	var lvl := []
	if r.has("exp"):
		G.S.exp = int(G.S.get("exp", 0)) + r.exp
		lvl = side.C.settle_levels(G.S)
	var parts := []
	for id in items: parts.append(side.item_name(id) + " ×%d" % items[id])
	if r.has("silver"): parts.append("银两 %d" % r.silver)
	if r.has("exp"): parts.append("已满级" if int(G.S.lv) >= G.CHARACTER_LEVEL_CAP else "修为 +%d" % r.exp)
	side.save()
	await Dialog.say("获得", " · ".join(parts) + (" · 江湖→行囊查看" if r.has("items") else ""))
	for n in lvl: await Dialog.say("", "境界突破 · 第 %d 层 · 属性点 +3" % n)

func ext() -> Dictionary:
	return {"lamp_omen": func(): give_omen("归"), "fortune_omen": func(k): give_omen(k), "lamp_reward": func(kind): await reward(kind)}

func play(knot: String, vars: Dictionary = {}):
	return await side.play(knot, ext(), vars)

## 算命摊：头一回是灯一（测字＋托付）；之后“谈”：开口与选项在 ink（qh_fortune_talk），交回选了哪一项
func fortune_talk() -> void:
	if not fortune_here(): return
	if open_meet():
		await side.guarded(func(): lamp_w().meetPlayed = true; await play("qh_lamp_meet")); return
	await side.guarded(func():
		var pick = await play("qh_fortune_talk", {"can_report1": open_report1(), "can_report2": open_report2(), "first": not lamp().get("meetPlayed") and not lamp().get("talked")})
		lamp_w().talked = true
		if pick == "report1":
			await play("qh_lamp_report1"); lamp_w().report1Done = true
		elif pick == "report2":
			await play("qh_lamp_report2"); lamp_w().report2Done = true
		elif pick == "read":
			var l := lamp_w()
			if l.get("readAt") == side.half(): await play("qh_fortune_busy"); return
			if side.silver() < 2: await play("qh_fortune_poor"); return
			G.S.silver = side.silver() - 2; l.readAt = side.half()
			await play("qh_fortune_reading"))

## 东埠船家：灯一托付后问船；第三天上午可从这里跟脚夫（与后山回话二只能选一边）
func boatman_talk() -> void:
	await side.guarded(func():
		var pick = await play("qh_boatman_talk", {"can_ask": open_boatman(), "can_tail": open_tail()})
		if pick == "ask": await play("qh_lamp_boatman"); return
		if pick == "tail":
			if dealt() and await Dialog.choose("行程", "这件事只能选一边：跟了脚夫，就赶不上后山宋先生那头。", ["跟上去", "再想想"]) != 0: return
			await play("qh_lamp_tail", {"knows_song": dealt()}))

## 灯二：岑霜交谈前多一问；问不问在 ink（qh_lamp_seal_ask）
func seal_offer() -> bool:
	if not open_seal() or lamp().get("sealAskAt") == side.half(): return false
	lamp_w().sealAskAt = side.half()
	if await play("qh_lamp_seal_ask") != "seal": return false
	await play("qh_lamp_seal")
	return true

## 结局判定（支线稿第三节“完美路线的判定条件”，对证开场前写；次序 3＞2＞1）
func _perfect() -> bool:
	var l := lamp()
	return dealt() and side.C.truthy(l.get("met")) and rec().get("stranger_report") != "full" and side.C.truthy(l.get("hidden_watch")) and l.get("seal") == "seen" \
		and side.C.truthy(l.get("porter_seen")) and not (l.get("sold") in ["song", "cen"]) and l.get("deduce") == "ok" and l.get("handoff") == "blade_order"

func settle_ending():
	if side.CP() == null: return null
	var l := lamp_w()
	var touched: bool = dealt() or side.C.truthy(l.get("met"))
	l.ending = "blade" if _perfect() else ("noticed" if touched else "zhou")
	var h = l.get("handoff")
	if l.get("t3") == "tail": l.noticed = "tailed"
	elif l.get("sold") == "song" or h == "cen" or (h and h != "blade_order") or l.get("deduce") == "fail": l.noticed = "rumored"
	else: l.noticed = null
	# 两条线都没碰过：留空，对证走原基线
	if not l.get("met") and not rec().get("stranger_deal"): l.ending = null
	return l.ending

## 对证后、去处确认前插结局场（结局 3 赏书；结局 2 且认识蔺管事的留话）
func end_scene() -> void:
	var p = side.CP()
	if p == null or not p.get("records", {}).has("lamp"): return
	var l := lamp()
	if l.get("endPlayed") or not (p.stage in ["refuge", "mountain"]): return
	l.endPlayed = true
	if l.get("ending") == "blade": await play("qh_lamp_end_blade")
	elif l.get("ending") == "noticed" and l.get("met"): await play("qh_lamp_end_note", {"exposed": exposed()})

func _done_step(l: Dictionary, key: String) -> bool:
	for k in key.split("|"):
		if l.get(k): return true
	return false

## 行记（QiheJournalExtras）
func journal_extra(add: Callable, step: Callable) -> void:
	var l := lamp()
	if not l.get("met"): return
	var over: bool = not side.days() or side.half() > 4
	var done: bool = side.C.truthy(l.get("report2Done")) or side.C.truthy(l.get("ending"))
	var objective: String
	if exposed(): objective = "算命摊收了，先生不知去向。"
	elif over: objective = "过了时限；已知的线索保留，不影响主线。"
	else:
		objective = STEPS[5][1]
		for s in STEPS:
			if not _done_step(l, s[2]): objective = s[1]; break
	add.call({"id": "side:lamp", "title": "摆字摊的先生", "kind": "支线 · 算命先生", "status": "done" if (done or over or exposed()) else "active", "owner": null,
		"origin": "北路摆测字摊的算命先生，托你打听一个天不亮就上后山的黑衣脚夫。", "objective": objective, "where": "栖河 · 北路算命摊", "people": [], "action": null,
		"progress": STEPS.map(func(s): return step.call(s[0], s[1], _done_step(l, s[2])))})
