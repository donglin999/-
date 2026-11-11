extends Node
## 开始部分的可选内容与村镇杂项（挂到地图人物上的逻辑）。
## 子模块按原版 index.html 的脚本顺序装载（后装的包裹前面装的 act）：
##   qihe-outsiders.js → qihe-lamp-watcher.js → qihe-town.js → qihe-treasure.js → qihe-aqi.js → qihe-resources.js → qihe-hidden.js
## 本文件：共用工具（原版各模块里重复的 guarded/gain/play/node）、江湖经历（qihe-milestones.js）、行程追踪（qihe-navigation.js），
## 以及 chapter.gd 调用的接口（aqi_pending、lamp_settle_ending、outsiders_talk……）。
## 闲话（qihe-banter.js）规则在 side_banter.gd。台词全在 ink，这里只管站位、开放时段、存档、奖励与选项回传。

const IDS := {"central": "qihe_trial", "south": "qh_south", "east": "qh_east", "west": "qh_west", "north": "qh_north", "refuge": "qh_refuge", "mountain": "qh_mountain"}
const SUBS := [["Outsiders", "res://scripts/flow/side_outsiders.gd"], ["Lamp", "res://scripts/flow/side_lamp.gd"], ["Town", "res://scripts/flow/side_town.gd"],
	["Treasure", "res://scripts/flow/side_treasure.gd"], ["Aqi", "res://scripts/flow/side_aqi.gd"], ["Resources", "res://scripts/flow/side_resources.gd"],
	["Hidden", "res://scripts/flow/side_hidden.gd"]]
const Banter = preload("res://scripts/flow/side_banter.gd")

var C: Node   # 主线模块（QiheChapter / QiheExpansion）
var P: Node   # 序章模块（QihePrologue）
var town: Node
var lamp: Node
var aqi: Node
var outsiders: Node
var treasure: Node
var resources: Node
var hidden: Node
var AQI_STEP: Dictionary = {}

func _ready() -> void:
	C = get_parent().get_node("Chapter")
	P = get_parent().get_node("Prologue")
	for s in SUBS:
		var node: Node = load(s[1]).new()
		node.name = s[0]
		node.set("side", self)
		add_child(node)   # 子模块 _ready 里挂 Callable，顺序即原版装载顺序
	outsiders = get_node("Outsiders"); lamp = get_node("Lamp"); town = get_node("Town"); treasure = get_node("Treasure")
	aqi = get_node("Aqi"); resources = get_node("Resources"); hidden = get_node("Hidden")
	AQI_STEP = aqi.AQI_STEP

# ─────────────────────── 共用工具 ───────────────────────
func CP():
	return G.S.get("qiheChapter") if G.S != null else null

func days() -> bool:
	var p = CP()
	return p != null and p.stage == "days"

func half() -> int:
	var p = CP()
	return int(p.get("halfDay", 0)) if p != null else 0

## 原版 qihe-town.js / qihe-hidden.js 的 beforeFire：!CP()||['opening','days'].includes(CP().stage)（与 chapter.gd 的 before_fire 不同，不含 fire）
func before_fire() -> bool:
	var p = CP()
	return p == null or p.stage in ["opening", "days"]

func save() -> void: P.checkpoint()

func bag() -> Dictionary:
	if not G.S.has("bag") or not (G.S.bag is Dictionary): G.S.bag = {}
	return G.S.bag

func has(id: String) -> bool: return int(bag().get(id, 0)) > 0

func silver() -> int: return int(G.S.get("silver", 0))

func item_name(id: String) -> String: return str(DB.ITEMS.get(id, {}).get("name", id))

## 原版各模块的 guarded：主线剧情运行中不进；只占住 busy；结束存档并刷新（X.refresh）
func guarded(fn: Callable):
	if C.running: return null
	var was := World.busy
	World.busy = true; World.keys = {}; World.player.path = null
	var r = await fn.call()
	World.busy = was; World.keys = {}
	save(); C.refresh()
	return r

## QiheChapter.play(knot, externals, vars)
func play(knot: String, ext: Dictionary = {}, vars: Dictionary = {}):
	return await C.play(knot, ext, vars)

## qihe-town.js gain：名字 ×n（总写数量）
func gain(items: Dictionary = {}, sv := 0) -> void:
	var parts := _give(items, sv, true)
	save()
	await Dialog.say("获得", " · ".join(parts))

## qihe-treasure.js / qihe-hidden.js gain：只有多于一件才写 ×n
func gain_short(items: Dictionary = {}, sv := 0) -> void:
	var parts := _give(items, sv, false)
	save()
	await Dialog.say("获得", " · ".join(parts))

func _give(items: Dictionary, sv: int, always_n: bool) -> Array:
	var b := bag(); var parts := []
	for id in items:
		b[id] = int(b.get(id, 0)) + int(items[id])
		parts.append(item_name(id) + (" ×%d" % int(items[id]) if always_n or int(items[id]) > 1 else ""))
	if sv:
		G.S.silver = silver() + sv
		parts.append("银两 %d" % sv)
	return parts

func pay(n: int) -> bool:
	if silver() < n: return false
	G.S.silver = silver() - n
	return true

func npc(scene: String, id: String) -> Dictionary:
	if not World.scenes.has(scene): return {}
	for n in World.scenes[scene].get("npcs", []):
		if str(n.get("id")) == id: return n
	return {}

## 原版 QiheExpansion.node 的 act 外壳：开场登记萧白与对方，结束清按键、存档、刷新
func node(scene: String, id: String, act: Callable, show = null) -> Dictionary:
	var n := npc(scene, id)
	if n.is_empty():
		push_warning("side：场景 %s 找不到节点 %s" % [scene, id]); return n
	n.act = func(_n = null):
		var cast := [{"who": "萧白", "sp": "c_hero", "slot": "left"}]
		if n.get("sp"): cast.append({"who": n.name, "sp": n.sp, "slot": "right"})
		var tk := Dialog.begin("qihe-exp:" + id, cast)
		var r = await act.call()
		Dialog.end(tk); World.keys = {}; save(); C.refresh()
		return r
	if show is Callable: n.show = show
	return n

## 取节点当前的 act（导出占位时退回缺省交互），用来包一层
func act_of(n: Dictionary) -> Callable:
	var a = n.get("act")
	if a is Callable: return a
	return func(_n = null): await Flow.default_act(World.cur, n)

func show_of(n: Dictionary) -> bool:
	var s = n.get("show")
	return not (s is Callable) or s.call()

func mark_of(n: Dictionary) -> bool:
	var m = n.get("mark")
	return m is Callable and m.call()

## 好感（QiheNpc.bond.add）：人物交互子任务提供 _mod("Npc").bond_add(id, d, opt)
func bond(id: String, d: int, opt: Dictionary = {}) -> void:
	if _mod("Npc").has_method("bond_add"): _mod("Npc").bond_add(id, d, opt)

## 派生属性（core.js derived）
func derived() -> Dictionary:
	if not G.S.has("st"): return {}
	return G.derived(G.S)

# ─────────────────────── chapter.gd 调用的接口 ───────────────────────
func aqi_pending() -> bool: return aqi.pending()
func aqi_call() -> void: await aqi.call_out()
func lamp_settle_ending(): return lamp.settle_ending()
func lamp_end_scene() -> void: await lamp.end_scene()
func outsiders_handles(id: String) -> bool: return outsiders.handles(id)
func outsiders_available() -> bool: return outsiders.available()
func outsiders_talk(id: String) -> void: await outsiders.talk(id)
func outsiders_rep_key(id: String): return outsiders.representative_key(id)
func outsiders_quest_open(key: String) -> bool: return outsiders.quest_open(key)
## qihe-representatives.js interact：灯二看封皮（QiheLamp.sealOffer）或三天酒钱找管事（QiheTown.cenOffer）
func cen_offer() -> bool:
	if await lamp.seal_offer(): return true
	return await town.cen_offer()

## 其他模块可用的入口（原版 QiheTown.shop）
func shop(pid: String) -> void: await guarded(func(): await town.open_shop(pid))

## 行记附加条目（window.QiheJournalExtras）：add(条目字典)、step(标题, 说明, 是否完成) -> 进度行
func journal_extras(add: Callable, step: Callable) -> void:
	aqi.journal_extra(add, step)
	lamp.journal_extra(add, step)
	town.journal_extra(add, step)   # 2026-11-09 用户：接了货郎的扁担活，行记里看不到

## 行囊“野外行囊”面板（QiheResources.inventory）与交付（exchange）
func resource_inventory() -> void: await resources.inventory()

# ─────────────────────── 江湖经历（qihe-milestones.js） ───────────────────────
func _after(c, sts: Array) -> bool: return c is Dictionary and c.get("stage") in sts

func milestone_list(s = null) -> Array:
	if s == null: s = G.S
	var out := []
	if not (s is Dictionary): return out
	var p = s.get("prologue"); var c = s.get("qiheChapter")
	if not (p is Dictionary): return out
	var ev: Dictionary = c.get("events", {}) if c is Dictionary else {}
	if p.get("arrival", {}).get("stage") == "done" or p.get("rested") or c != null: out.append({"t": "后山遇狼", "d": "在后山被狼逼到采药路上，和叶蘅一起把它赶走，随她下山进村。"})
	if p.get("rested") or c != null: out.append({"t": "栖河第一夜", "d": "在陈伯家的客房借宿，在栖河度过了第一夜。"})
	if ev.get("xu-meeting"): out.append({"t": "正道盟上门要谱", "d": "徐令仪拿着委托上门要谱，叶蘅当面说自己从没托过人。"})
	if ev.get("three-meeting"): out.append({"t": "玉匣与药样", "d": "岑霜说叶家愿还玉匣，沈雁回要查验药样，叶蘅都没答应过。"})
	if _after(c, ["fire", "escape", "refuge", "mountain", "ended", "cultivation"]): out.append({"t": "栖河起火", "d": "第三夜村里起了火。"})
	if _after(c, ["refuge", "mountain", "ended", "cultivation"]): out.append({"t": "护送乡邻离村", "d": "随乡邻与药车撤出栖河，到邻村落脚。"})
	if ev.get("evidence-v2") or (c is Dictionary and c.get("evidenceReviewed")): out.append({"t": "对证三张附页", "d": "陈伯拿出原底单，只有六只旧药罐；三家各自认了错。"})
	if _after(c, ["mountain", "ended", "cultivation"]): out.append({"t": "山居安身", "d": "乡邻得到接应，随周砚上山暂住。"})
	return out

## 原版 latest(s)：没有经历时返回 null（江湖菜单标题用“江湖行卷”兜底）
func milestone_last(s = null):
	var l := milestone_list(s)
	return l[l.size() - 1].t if l.size() else null

## 标题页存档栏（qihe-startup.js description）：latest(s)||'初到栖河'
func milestone_latest(s) -> String:
	var m = milestone_last(s)
	return m if m != null else "初到栖河"

# ─────────────────────── 行程追踪（qihe-navigation.js） ───────────────────────
## 小地图画面归 HUD；这里移植目标选择（guide / targetNode / trackNpc / trackActivity）
const NAV_GRAPH := {"central": ["north", "south", "west", "east"], "north": ["central"], "south": ["central", "east", "west"], "east": ["central", "south"], "west": ["central", "south"], "refuge": ["west"]}
const NAV_EXITS := {"central": {"north": "north", "south": "south", "west": "west", "east": "east"}, "south": {"central": "north", "east": "east", "west": "west"}, "east": {"central": "west", "south": "south"}, "west": {"central": "east", "south": "south"}, "north": {"central": "south"}, "refuge": {"west": "east"}}
const NAV_SUGGEST := [["practice", "west", "luheng", "找陆衡学习护路棍法", "西田埂 · 陆衡"], ["clinic", "central", "clinic-door", "帮叶蘅整理药包", "村中药棚"], ["transport", "west", "cart", "整备药车，探邻村的路", "西田埂 · 药车"], ["market", "south", "cloth", "去集市搭把手", "南村口 · 店家"]]
var nav_selected = null
var _nav_last_half = null

func nav_guide() -> Dictionary:
	var p = CP()
	if nav_selected != null and (p == null or p.stage == "opening") and outsiders.available():
		return {"title": "前往 " + nav_selected.name, "detail": "三方接洽", "target": nav_selected}
	if p == null: return {"title": C.quest_line(), "detail": "J 看当前一件 · L 打开行记", "target": null}
	if p.stage == "days":
		if _nav_last_half != p.halfDay: nav_selected = null; _nav_last_half = p.halfDay
		var a = null
		for x in NAV_SUGGEST:
			if not p.choices.get(x[0]) and C.activity_open(x[0]): a = x; break
		var h: int = int(p.halfDay)
		var phase := "村中日常" if h < 2 else ("来客施压" if h < 4 else ("药车受阻" if h < 5 else "整备撤离"))
		if nav_selected != null:
			var re := RegEx.create_from_string("^(前往|返回)\\s*·\\s*")
			return {"title": "前往 " + re.sub(String(nav_selected.name), ""), "detail": phase, "target": nav_selected}
		if a != null: return {"title": a[3], "detail": a[4] + " · " + phase, "target": {"scene": IDS[a[1]], "id": a[2]}}
		return {"title": "准备好后继续主线", "detail": phase, "target": null}
	var ev: Dictionary = p.get("events", {})
	var titles := {"opening": "与药商核对传话", "fire": "救援撤离 · J 继续", "escape": "护住车道 · J 继续", "refuge": "与周砚商量去处" if ev.get("evidence-v2") else "安顿好伤者后，对一对三张附页", "mountain": "安顿行李，吃饭休息", "ended": "次日拜入归云谷", "cultivation": "归云谷 · 培养"}
	return {"title": titles.get(p.stage, C.quest_line()), "detail": "J 继续" if p.stage == "ended" else "",
		"target": {"scene": IDS.refuge, "id": "zhouyan" if ev.get("evidence-v2") else "evidence"} if p.stage == "refuge" else null}

func _key_of(scene_id: String) -> String:
	for k in IDS:
		if IDS[k] == scene_id: return k
	return ""

func _find(ns: Array, pred: Callable):
	for n in ns:
		if pred.call(n): return n
	return null

func nav_target_node(goal):
	if goal == null: return null
	var ns: Array = World.npcs_of(World.cur)
	var here := World.cur_id
	if goal.scene == here:
		var r = _find(ns, func(n): return str(n.get("id")) == str(goal.get("id")))
		if r == null and goal.has("name"): r = _find(ns, func(n): return n.get("name") == goal.name)
		return r
	if here == "prologue_clinic_interior" and goal.get("id") == "clinic-door": return _find(ns, func(n): return n.get("id") == "daily-ye")
	if here == "prologue_ye_house" and goal.get("id") == "ye-door": return _find(ns, func(n): return n.get("id") == "ye")
	var from := _key_of(here); var to := _key_of(goal.scene)
	if from == "" or to == "":
		return _find(ns, func(n): return not n.get("sp") and (str(n.get("id")).contains("out") or str(n.get("id")).contains("exit")))
	var queue := [[from]]; var seen := {from: true}; var next = null
	while queue.size():
		var route: Array = queue.pop_front(); var at: String = route[route.size() - 1]
		if at == to:
			next = route[1] if route.size() > 1 else null; break
		for k in NAV_GRAPH.get(at, []):
			if not seen.has(k):
				seen[k] = true; queue.append(route + [k])
	var ex = NAV_EXITS.get(from, {}).get(next) if next != null else null
	return _find(ns, func(n): return ex != null and str(n.get("id")) == "exit-" + str(ex))

func nav_track_activity(id: String) -> void:
	for a in NAV_SUGGEST:
		if a[0] == id:
			nav_selected = {"scene": IDS[a[1]], "id": a[2], "name": a[4]}; UI.hud(); return

func nav_track_npc(id: String) -> bool:
	for scene in World.scenes:
		var sc: Dictionary = World.scenes[scene]
		if sc.get("region") != "qihe_trial": continue
		for n in World.npcs_of(sc):
			if str(n.get("id")) == id or str(n.get("id")) == "daily-" + id:
				nav_selected = {"scene": scene, "id": n.id, "name": n.name}
				var p = CP(); _nav_last_half = p.halfDay if p != null else null
				UI.hud(); return true
	UI.toast("此刻不在这里，查看当前行程。", 1800)
	return false


## 运行时找其他模块（模块编译失败时不连累本文件）
func _mod(n: String) -> Object:
	var m = get_node_or_null("/root/" + n)
	return m if m != null else Object.new()   # 空对象：has_method 一律为假
