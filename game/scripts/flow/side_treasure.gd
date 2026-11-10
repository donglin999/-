extends Node
## 栖河地图物资点（原版 js/qihe-treasure.js）：普通箱、铁箍箱、隐藏点三档；所有宝箱都不要钥匙（2026-11-02 用户）。
## 台词全在 ink：story/01-开始/村中-宝箱.ink；这里只管开放时段、存档与奖励。绘制（换开箱图、淡蓝闪光）已在 world_draw 按 n.chest 做了。
## 规则：活动不耗时；起火后村子关闭；奖励固定、一次领取，不随机。
## 存档：原版是 S.qiheTown.chests；Flow.chest_opened 读的是 S.qiheTown.opened，两处同时写（见 docs/review/side-notes.md）。

var side: Node

## 原版 POINTS（与 sc.json 里 n.chest 一致；refuge 一处另有 show=atRefuge）
const POINTS := [
	{"id": "yehou", "key": "central", "type": "hidden", "silver": 8},
	{"id": "chenyard", "key": "central", "type": "crate", "items": {"qh_sewing_kit": 1, "qh_tinder": 1}},
	{"id": "alley", "key": "central", "type": "hidden", "items": {"wine": 1}},
	{"id": "drift", "key": "central", "type": "drift", "silver": 12},
	{"id": "tree", "key": "north", "type": "iron", "items": {"mianjia": 1, "pill": 2}},
	{"id": "nook", "key": "north", "type": "hidden", "items": {"pill": 1}},
	{"id": "east-crate", "key": "east", "type": "crate", "items": {"qh_fried_rice": 2}},
	{"id": "hat", "key": "east", "type": "hidden", "items": {"qh_old_hat": 1}, "silver": 6},
	{"id": "sunk", "key": "east", "type": "iron", "items": {"charm": 1}, "silver": 30},
	{"id": "wall", "key": "west", "type": "hidden", "silver": 10},
	{"id": "field", "key": "west", "type": "basket", "items": {"qh_hand_wrap": 1}},
	{"id": "south-crate", "key": "south", "type": "crate", "items": {"pill": 1}},
	{"id": "candy", "key": "south", "type": "hidden", "items": {"qh_candy": 2}},
	{"id": "refuge", "key": "refuge", "type": "basket", "items": {"bun": 2, "pill": 1}, "refuge": true}]
const BLOCK := {"crate": [24, 9], "basket": [24, 9], "iron": [34, 12], "drift": [24, 8]}

func _ready() -> void:
	for p in POINTS: _install(p)

func in_village() -> bool:
	var c = side.CP()
	return c != null and c.stage in ["opening", "days"]

func at_refuge() -> bool:
	var c = side.CP()
	return c != null and c.stage == "refuge"

func opened() -> Dictionary:
	if not G.S.has("qiheTown") or not (G.S.qiheTown is Dictionary): G.S.qiheTown = {"version": 1}
	var t: Dictionary = G.S.qiheTown
	if not (t.get("chests") is Dictionary): t.chests = {}
	return t.chests

func is_open(id: String) -> bool:
	return G.S != null and (side.C.truthy(G.S.get("qiheTown", {}).get("chests", {}).get(id, false)) or Flow.chest_opened(id))

func _mark_open(id: String) -> void:
	opened()[id] = true
	var t: Dictionary = G.S.qiheTown
	if not (t.get("opened") is Dictionary): t.opened = {}
	t.opened[id] = true

func _install(p: Dictionary) -> void:
	var id: String = p.id
	var show := func(): return at_refuge() if p.get("refuge") else in_village()
	var vis: Callable = (func(): return show.call() and not is_open(id)) if p.type == "hidden" else show
	var n: Dictionary = side.node(side.IDS[p.key], "chest-" + id, func(): await side.guarded(func():
		if is_open(id): await side.play("qh_tr_empty"); return
		_mark_open(id)
		await side.play("qh_tr_" + id.replace("-", "_"))
		await side.gain_short(p.get("items", {}), int(p.get("silver", 0)))), vis)
	if n.is_empty(): return
	if p.type != "hidden":
		n.prop = "prop_qh_chest_%s_closed_20261102" % p.type
		n.block = BLOCK[p.type]
