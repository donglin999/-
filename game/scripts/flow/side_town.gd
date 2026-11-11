extends Node
## 栖河地图可交互物（原版 js/qihe-town.js）：客栈几件、菜牌、木桶、古井、货郎（买卖、断扁担、以物换话）、孩子猜字谜、算命摊、东埠摆设。
## 台词全在 ink：story/01-开始/村中-*.ink；这里只管站位、开放时段、存档、奖励与选项回传（fq_answer）。
## 道具绘制与挡路已在 world_draw / World.stand_ok 里按 n.prop、n.block 做了；这里只把 show/act/mark 挂上。
## 存档 S.qiheTown：tab 三天酒钱、pole 断扁担、riddle 猜字谜、well 古井、searched 木桶与箱笼、gossipAt 以物换话。

var side: Node

const TAB_FEE := 24   # 帮众三天的酒钱（原版 TAB_FEE）
const GOODS := ["qh_rope", "qh_tinder", "qh_sewing_kit", "qh_fried_rice", "qh_candy"]
const BUYS := {"qh_dry_branch": 2, "qh_river_reed": 2, "qh_wild_herb": 3}
const SELL_TO := {"peddler": BUYS, "apothecary": {"qh_wild_herb": 3, "qh_river_reed": 2}}
const SHOP_SAY := {"innkeeper": "客官要点什么？", "apothecary": "金疮药，治外伤最灵。", "peddler": "针头线脑、火折子，要啥有啥！"}
## 题在 story/01-开始/村中-猜字谜.ink
const RIDDLES := {1: ["gao", "zhong", "ka", "na", "si", "cha"], 2: ["pang", "nai", "lv", "ming", "hao", "zao"], 3: ["she", "tun", "fen", "yan", "qing", "chuang"]}
const PROP_LOAD := "prop_qh_peddler_load_fit_20261027"
const PROP_LOAD_BROKEN := "prop_qh_peddler_load_broken_fit_20261027"

func _ready() -> void:
	# ── 新物品（原版 Object.assign(ITEMS,…)）──
	DB.ITEMS.qh_rope = {"name": "麻绳", "desc": "一捆结实的麻绳，捆东西、拴行李都用得着。", "price": 4, "q": 0}
	DB.ITEMS.qh_tinder = {"name": "火折子", "desc": "竹筒里卷着易燃的纸芯，拔开吹一口就着。", "price": 6, "q": 0}
	DB.ITEMS.qh_sewing_kit = {"name": "针线包", "desc": "针、线、顶针缝在一块布里，补衣裳够用。", "price": 8, "q": 0}
	DB.ITEMS.qh_candy = {"name": "糖块", "desc": "麦芽熬的糖块，孩子最爱。", "price": 2, "q": 0, "heal": 5}
	DB.ITEMS.qh_fried_rice = {"name": "炒米", "desc": "一袋炒熟的米，干嚼也行，泡水也行。路上的干粮。", "price": 3, "q": 0, "heal": 30}
	DB.ITEMS.qh_old_hat = {"name": "旧斗笠", "desc": "客人落下的旧斗笠，帽檐有点破，遮雨挡太阳还使得。", "price": 3, "q": 0}
	DB.ITEMS.qh_flat_stone = {"name": "扁石子", "desc": "小禾在河边捡的扁石子，磨得光溜溜的。纪念物。", "key": 1, "q": 1}
	_install_inn()
	_install_village()
	_install_peddler()
	_install_kids()

# ─────────────────────── 状态 ───────────────────────
## 原版 town()：缺字段就补
func town() -> Dictionary:
	if not G.S.has("qiheTown") or not (G.S.qiheTown is Dictionary): G.S.qiheTown = {"version": 1}
	var t: Dictionary = G.S.qiheTown
	if not (t.get("tab") is Dictionary): t.tab = {"stage": "none"}
	if not (t.get("grain") is Dictionary): t.grain = {}
	if not (t.get("pole") is Dictionary): t.pole = {"stage": "none"}
	if not (t.get("riddle") is Dictionary): t.riddle = {"wins": {}, "used": []}
	if not t.riddle.has("wins"): t.riddle.wins = {}
	if not t.riddle.has("used"): t.riddle.used = []
	if not (t.get("well") is Dictionary): t.well = {}
	if not (t.get("searched") is Dictionary): t.searched = {}
	return t

func pole() -> Dictionary: return town().pole

func days() -> bool: return side.days()
func half() -> int: return side.half()

func play(knot: String, vars: Dictionary = {}, ext: Dictionary = {}):
	return await side.play(knot, ext, vars)

## 原版 restore(kind, ratio)：按上限比例回气血或内力
func restore(kind: String, ratio: float) -> void:
	var d: Dictionary = side.derived()
	if d.is_empty(): return
	if kind == "hp": G.S.hp = min(int(d.get("mhp", 0)), int(G.S.get("hp", 0)) + int(round(d.get("mhp", 0) * ratio)))
	else: G.S.mp = min(int(d.get("mmp", 0)), int(G.S.get("mp", 0)) + int(round(d.get("mmp", 0) * ratio)))

func three_meeting() -> bool:
	var p = side.CP()
	return p != null and p.get("events", {}).get("three-meeting", false)

# ─────────────────────── 客栈（方案 A，5.4） ───────────────────────
func tab_open() -> bool: return days() and half() <= 3 and town().tab.stage != "done"
func bandit_in() -> bool: return side.before_fire() and not (side.CP() != null and half() >= 4)

func _install_inn() -> void:
	var INN := "prologue_inn_interior"
	var inn: Dictionary = side.node(INN, "innkeeper", func(): await innkeeper_act(), func(): return side.before_fire())
	inn.mark = func():
		var t: Dictionary = town().tab
		return (tab_open() and bandit_in() and t.stage == "none") or (t.stage == "done" and not t.get("thanked"))
	side.node(INN, "bandit", func(): await bandit_act(), func(): return bandit_in())
	side.node(INN, "inn-book", func(): await side.guarded(func(): await play("qh_inn_book")), func(): return side.CP() != null)
	side.node(INN, "inn-stove", func(): await side.guarded(stove), func(): return side.CP() != null and side.before_fire())
	side.node(INN, "inn-chest", func(): await side.guarded(inn_chest), func(): return side.CP() != null)

func innkeeper_act() -> void:
	if side.CP() == null:
		await side.P.story("qihe_errand_cloth"); return   # 原版 QihePrologue.actions.cloth()
	var t: Dictionary = town().tab
	if t.stage == "done" and not t.get("thanked"):
		await side.guarded(func(): t.thanked = true; await play("qh_inn_tab_done", {"via": t.get("via")})); return
	if tab_open() and bandit_in() and t.stage == "none":
		await side.guarded(func():
			t.stage = "offered"
			var pick = await play("qh_inn_tab_offer", {"can_cen": three_meeting(), "can_pay": side.silver() >= TAB_FEE})
			if pick == "pay": await tab_pay())
		return
	# 每个时段提一次，不选结账就收住
	if tab_open() and t.stage == "offered" and side.silver() >= TAB_FEE and t.get("againAt") != half():
		await side.guarded(func():
			t.againAt = half()
			if await play("qh_inn_tab_again") == "pay": await tab_pay())
		return
	# 风声（偷窃失手累计）可以在客栈花钱压下去，每级 10 两；每个时段问一次
	var st = G.S.get("steal")
	var lv := 0
	if st is Dictionary:
		for k in st.get("rumor", {}): lv += int(st.rumor[k])
	if lv > 0 and t.get("rumorAt") != half():
		await side.guarded(func():
			t.rumorAt = half()
			var fee: int = min(lv, 3) * 10
			if await play("qh_inn_rumor", {"fee": str(fee), "can_fee": side.silver() >= fee}) == "pay" and side.pay(fee):
				st.rumor = {}; UI.toast("风声压下去了", 1400); side.save())
		return
	await side.C.interact("innkeeper")

func tab_pay() -> void:
	if not side.pay(TAB_FEE): return
	await play("qh_inn_tab_pay")
	tab_done("pay")

func tab_done(via: String) -> void:
	var t: Dictionary = town().tab
	t.stage = "done"; t.via = via
	side.save(); UI.toast("三天酒钱 · 已了结", 1600)

func bandit_act() -> void:
	if tab_open() and town().tab.stage == "offered":
		await side.guarded(func():
			if await play("qh_inn_tab_face_ask") != "face":
				await side.C.interact("bandit"); return
			await play("qh_inn_tab_face"); tab_done("face"))
		return
	await side.C.interact("bandit")

## 后厨灶台：了结酒钱后白喝，否则一两一碗（原版 2026-10-29：汤价按“一两”台词改 1）
func stove() -> void:
	var t := town(); var free: bool = t.tab.stage == "done"
	if t.get("soupAt") == half(): await play("qh_inn_soup_full"); return
	if not free and not side.pay(1): await play("qh_inn_soup_poor"); return
	t.soupAt = half()
	await play("qh_inn_soup", {"free": free})
	restore("mp", 0.2)

## 2026-11-11 审读修订（余项）：箱笼要等店家当面说过“您挑一样”（thanked）才开；原来账一结就能开，
## 在东埠找岑霜结账的人还没回柜台，就先从箱里拿了东西，再听店家请他挑。旧存档里已经挑过的照旧。
func inn_chest() -> void:
	var t := town()
	if t.searched.get("chest"): await play("qh_inn_chest_empty"); return
	if not t.tab.get("thanked"): await play("qh_inn_chest_locked"); return
	var pick = await play("qh_inn_chest")
	if not pick: return
	t.searched.chest = pick
	await side.gain({("qh_tinder" if pick == "tinder" else "qh_old_hat"): 1})

## 岑霜那头：找她结账（第二天傍晚登场后才开；三方代表交谈前调用）
func cen_offer() -> bool:
	if not (tab_open() and town().tab.stage == "offered" and three_meeting()): return false
	if await play("qh_inn_tab_cen_ask") != "tab": return false
	await play("qh_inn_tab_cen")
	tab_done("cen")
	return true

# ─────────────────────── 菜牌、木桶、古井、算命摊、东埠摆设 ───────────────────────
func _install_village() -> void:
	var V := "qihe_trial"
	side.node(V, "inn-menu", func(): await side.guarded(func(): await play("qh_inn_menu")), func(): return side.CP() != null and side.before_fire())
	# 木桶（W3、S2）：每处只能翻一次
	_barrel("qh_west", "barrel-west", {"kind": "silver", "silver": 5})
	_barrel("qh_south", "barrel-south", {"kind": "rope", "items": {"qh_rope": 1}})
	# 古井（C1）：看刻痕、打水喝（每时段一次，回少量气血）、丢颗石子听响
	side.node(V, "well", func(): await side.guarded(func():
		var w: Dictionary = town().well
		var pick = await play("qh_well", {"drank": w.get("drinkAt") == half()})
		if pick == "drink":
			w.drinkAt = half(); restore("hp", 0.15)
		elif pick == "coin": await play("qh_well_coin")), func(): return side.before_fire())
	# 算命摊：摆在算命先生身前（side_lamp.gd 的 fortune 站在摊后）
	side.node(V, "fortune-stall", func(): await side.lamp.fortune_talk(), func(): return days() and half() <= 4 and not side.lamp.exposed())
	# 东埠药棚库棚与待装的货：只摆着，不能交谈（talkR 负值让 nearest 选不到）
	for id in ["east-store", "east-crates", "east-cart"]:
		var n: Dictionary = side.node("qh_east", id, func(): pass)
		if not n.is_empty(): n.talkR = -1000

func _barrel(scene: String, id: String, loot: Dictionary) -> void:
	var n: Dictionary = side.node(scene, id, func(): await side.guarded(func():
		var t := town()
		if t.searched.get(id): await play("qh_barrel_empty"); return
		t.searched[id] = true
		await play("qh_barrel", {"kind": loot.kind})
		await side.gain(loot.get("items", {}), int(loot.get("silver", 0)))), func(): return side.CP() != null and side.before_fire())
	# 翻过就不闪（原版 qihe-treasure.js 的木桶提示；world_draw 读 n.barrel）
	if not n.is_empty(): n.barrel = func(): return G.S != null and side.C.truthy(G.S.get("qiheTown", {}).get("searched", {}).get(id, false))

# ─────────────────────── 货郎（C4、Q6） ───────────────────────
func peddler_here() -> bool: return days() and half() <= 5

func _has_buys() -> bool:
	for id in BUYS:
		if side.has(id): return true
	return false

func _install_peddler() -> void:
	var V := "qihe_trial"
	var p: Dictionary = side.node(V, "peddler", func(): await side.guarded(peddler_talk), func(): return peddler_here())
	p.mark = func(): return pole().stage == "fixed" or (pole().stage == "none" and days() and half() <= 4)
	# 货郎担：扁担修好前是断扁担的样子；跟货郎并排、挡路（原版用 getter，这里在 show 里同步 prop）
	var load: Dictionary = side.node(V, "peddler-load", func(): await side.npc(V, "peddler").act.call(), func():
		var ld: Dictionary = side.npc(V, "peddler-load")
		ld.prop = PROP_LOAD if G.S != null and pole().stage in ["fixed", "done"] else PROP_LOAD_BROKEN
		return peddler_here())
	if not load.is_empty(): load.prop = PROP_LOAD_BROKEN
	# 陈伯门厅：带着断扁担去找他（陈伯的门厅交互已由前面的模块包过，这里再包一层）
	var chen: Dictionary = side.npc("prologue_chen_hall", "chen")
	if not chen.is_empty():
		var old: Callable = side.act_of(chen); var old_mark = chen.get("mark")
		chen.act = func(n = null):
			if pole().stage == "carry" and days():
				await side.guarded(func():
					await play("qh_pole_chen"); pole().stage = "fixed"; side.save()
					UI.toast("扁担修好了 · 回村心交给货郎", 1600))
				return
			await old.call(n)
		chen.mark = func(): return (pole().stage == "carry" and days()) or (old_mark is Callable and old_mark.call())

func peddler_talk() -> void:
	var p := pole(); var t := town()
	if p.stage == "fixed": await pole_paid(); return
	var pick = await play("qh_peddler_talk", {"pole_new": p.stage == "none" and half() <= 4, "pole_wait": p.stage == "carry",
		"gossip": p.stage == "done" and t.get("gossipAt") != half() and _has_buys()})
	if pick == "buy": await open_shop("peddler"); return
	if pick == "sell": await sell_to(BUYS); return
	if pick == "pole":
		if await play("qh_peddler_pole") == "take":
			p.stage = "carry"; side.save(); UI.toast("已接：断了的扁担", 1600)
		return
	if pick == "gossip": await gossip()

## 行记：货郎断扁担（接了才出现；修好交还后算办完）
func journal_extra(add: Callable, step_row: Callable) -> void:
	if G.S == null: return
	var st: String = str(pole().get("stage", "none"))
	if st == "none": return
	var done := st == "done"
	add.call({"id": "side:pole", "title": "断了的扁担", "kind": "支线 · 货郎", "status": "done" if done else "active", "owner": null,
		"origin": "货郎的扁担断了，担子挑不走。他托你拿去给会修的人看看。",
		"objective": "扁担修好交还，货郎送了针线包。" if done else ("拿着断扁担去陈伯家门厅，请陈伯修。" if st == "carry" else "扁担修好了，回村心交给货郎。"),
		"where": "栖河 · 帮过的忙" if done else ("村内东北 · 陈伯家门厅" if st == "carry" else "村心 · 货郎担子旁"), "people": [], "action": null,
		"progress": [step_row.call("接下扁担", "从货郎手里接过断扁担。", true), step_row.call("请陈伯修", "陈伯家门厅。", st in ["fixed", "done"]),
			step_row.call("交还货郎", "村心货郎担子旁。", done)]})

func pole_paid() -> void:
	pole().stage = "done"
	await play("qh_peddler_pole_done")
	await side.gain({"qh_sewing_kit": 1})

func gossip() -> void:
	var have := BUYS.keys().filter(func(id): return side.has(id))
	var n := await Dialog.choose("", "拿哪样换句闲话？", have.map(func(id): return side.item_name(id)) + ["算了"], "", have.size())
	if n < 0 or n >= have.size(): return
	var id: String = have[n]
	side.bag()[id] = int(side.bag()[id]) - 1
	town().gossipAt = half()
	await play("qh_peddler_gossip", {"kind": {"qh_dry_branch": "branch", "qh_river_reed": "reed", "qh_wild_herb": "herb"}[id]})

# ─────────────────────── 商店（openShop / sellTo） ───────────────────────
func price_of(x: Dictionary) -> int:
	if x.has("price") and x.price != null: return int(x.price)
	return int(DB.ITEMS.get(x.id, {}).get("price", 1))

func is_gear(id: String) -> bool:
	var it: Dictionary = DB.ITEMS.get(id, {})
	return not it.is_empty() and (it.get("weapon") or it.get("armor") or it.get("acc"))

## 行商牙牌（原版 qihe-acc-fx.js team('buy')）：队里各人兵器、佩饰两格 func.buy 取最高
func team_buy() -> float:
	var best := 0.0
	var members := [G.S]
	for k in G.S.get("party", []):
		var m = G.S.get("mates", {}).get(k)
		if m is Dictionary and m.get("equip") is Dictionary: members.append(m.equip)
	for e in members:
		var s := 0.0
		for slot in ["weapon", "acc"]:
			var k = e.get(slot)
			if k != null: s += float(DB.ITEMS.get(str(k), {}).get("func", {}).get("buy", 0))
		best = max(best, s)
	return best

func fx_buy(price: int) -> int:
	var d := team_buy()
	return max(1, int(round(price * (1 - d)))) if d else price

func discount_for(pid: String, list: Array) -> Dictionary:
	var tab: bool = pid == "innkeeper" and town().tab.stage == "done"
	var o := {}
	for x in list:
		var pr: int = price_of(x)
		if tab and is_gear(x.id): pr = max(1, int(round(pr * 0.9)))
		pr = fx_buy(pr)
		if pr != price_of(x): o[x.id] = pr
	return o

func off_note(pid: String) -> String:
	var parts := []
	if pid == "innkeeper" and town().tab.stage == "done": parts.append("了结酒钱的谢礼 · 九折")
	if team_buy() > 0: parts.append("行商牙牌 · 买价 −12%")
	return "　".join(parts)

## 买卖：有交易面板（人物交互子任务的 Npc.shop）就用面板，否则退回原版旧的选项框
func open_shop(pid: String) -> void:
	var shops = DB.g("QIHE_NPC_ITEMS").get("SHOPS", {})
	var src: Array = shops.get(pid, GOODS.map(func(id): return {"id": id}))
	var list := []
	for x in src:
		if DB.ITEMS.has(x.id): list.append({"id": x.id, "price": price_of(x)})
	var buys = SELL_TO.get(pid)
	var p = DB.g("QIHE_NPC_DATA").get("PEOPLE", {}).get(pid)
	if p is Dictionary and _mod("Npc").has_method("shop"):
		var names: Array = p.get("npc", [p.name])
		var npc = null
		for n in World.npcs_of(World.cur):
			if n.get("name") in names: npc = n; break
		var off := discount_for(pid, list)
		await _mod("Npc").shop(npc, p, {"list": list, "buys": buys, "off": off, "offNote": off_note(pid) if off.size() else "", "say": SHOP_SAY.get(pid, "")})
		side.save(); return
	while true:
		var rows := list.map(func(x): return "%s · %d 两" % [side.item_name(x.id), fx_buy(x.price)])
		var opts: Array = rows + (["卖点山货"] if buys else []) + ["不买了"]
		var n := await Dialog.choose("", "你身上有银两 %d。买哪样？" % side.silver(), opts, "", opts.size() - 1)
		if n >= 0 and n < list.size():
			var x: Dictionary = list[n]
			if not side.pay(fx_buy(x.price)):
				UI.toast("银两不够", 1500); continue
			await side.gain({x.id: 1}); continue
		if buys and n == list.size():
			await sell_to(buys); continue
		return

func sell_to(buys: Dictionary) -> void:
	var have := buys.keys().filter(func(id): return side.has(id))
	if have.is_empty(): UI.toast("身上没有他收的山货", 1800); return
	var rows := have.map(func(id): return "%s · %d 两（有 %d）" % [side.item_name(id), buys[id], int(side.bag()[id])])
	var n := await Dialog.choose("", "卖哪样？（一次卖一件）", rows + ["不卖了"], "", have.size())
	if n < 0 or n >= have.size(): return
	var id: String = have[n]
	side.bag()[id] = int(side.bag()[id]) - 1
	G.S.silver = side.silver() + int(buys[id])
	side.save(); UI.toast("卖了 %s · 银两 +%d" % [side.item_name(id), buys[id]], 1500)

# ─────────────────────── 孩子猜字谜（C2、R1，5.3） ───────────────────────
## 每个时段一局三题；谜题按天分三档，同一题不重复
func kids() -> bool: return days() and half() <= 4
func tier_now() -> int: return 1 if half() <= 1 else (2 if half() <= 3 else 3)

## 存档的键可能是字符串（JSON 读回）也可能是整数，统一按字符串存
func _win(r: Dictionary, k: int) -> int: return int(r.wins.get(str(k), r.wins.get(k, 0)))

func riddle_round() -> void:
	var r: Dictionary = town().riddle
	if r.get("playedAt") == half(): await play("qh_kids_played"); return
	r.playedAt = half()
	await play("qh_kids_open")
	var tier := tier_now()
	var pool: Array = RIDDLES[tier].filter(func(id): return not (id in r.used))
	var full := 0
	for id in pool.slice(0, 3):
		r.used.append(id)
		if await play("qh_riddle_" + id) == "right": full += 1
	var win: bool = full >= 3 and pool.size() >= 3
	var first: bool = win and not _win(r, tier)
	if win: r.wins[str(tier)] = _win(r, tier) + 1
	var all := true
	for k in [1, 2, 3]:
		if not _win(r, k): all = false
	await play("qh_kids_end", {"result": "win" if win else "lose", "all": all and not r.get("stone")})
	if first: await side.gain({"qh_candy": 1} if tier == 1 else {}, 0 if tier == 1 else 1)
	if all and not r.get("stone"):
		r.stone = true; await side.gain({"qh_flat_stone": 1})

## 在村里一题都没猜过的，撤离后孩子不来要“最后一题”，只说一句闲话
func last_riddle() -> void:
	await side.guarded(func():
		var r: Dictionary = town().riddle
		if r.used.is_empty(): await play("qh_kids_refuge_idle"); return
		if r.get("last"): await play("qh_kids_last_done"); return
		r.last = true
		var wins := 0
		for k in [1, 2, 3]:
			if _win(r, k): wins += 1
		await play("qh_kids_last", {"many": wins >= 2})
		await play("qh_riddle_last"))

func _install_kids() -> void:
	for id in ["ashuan", "xiaohe"]:
		side.node("qihe_trial", id, func(): await side.guarded(riddle_round), func(): return kids())
		side.node("qh_refuge", id, func(): await last_riddle(), func(): var p = side.CP(); return p != null and p.stage == "refuge")


## 运行时找其他模块（模块编译失败时不连累本文件）
func _mod(n: String) -> Object:
	var m = get_node_or_null("/root/" + n)
	return m if m != null else Object.new()   # 空对象：has_method 一律为假
