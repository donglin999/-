extends Node
## 原版运行时的全部数据表（tools/dump_runtime.cjs 从 8792 原版导出到 data/runtime/globals.json）。
## 用法：DB.ITEMS["pill"].name、DB.SKILLS、DB.g("QiheClashData") 等。函数位置记为 {"__fn": 名字}。
var G_ := {}
var ITEMS := {}
var SKILLS := {}
var PARTY_DEF := {}

func _ready() -> void:
	G_ = Data.json("res://data/runtime/globals.json")
	ITEMS = G_.get("ITEMS", {})
	SKILLS = G_.get("SKILLS", {})
	PARTY_DEF = G_.get("PARTY_DEF", {})

func g(name: String):
	return G_.get(name)

## 原版 ui.js giveItem / learn / gain
func give_item(k: String, n := 1) -> void:
	var bag: Dictionary = G.S.bag
	bag[k] = int(bag.get(k, 0)) + n
	var nm: String = ITEMS.get(k, {}).get("name", k)
	UI.toast("获得 %s%s" % [nm, " ×%d" % n if n > 1 else ""], 1200)

func take_item(k: String, n := 1) -> bool:
	var bag: Dictionary = G.S.bag
	if int(bag.get(k, 0)) < n: return false
	bag[k] = int(bag[k]) - n
	if bag[k] <= 0: bag.erase(k)
	return true

func count(k: String) -> int:
	return int(G.S.bag.get(k, 0))

func learn(k: String) -> void:
	if G.S.skills.has(k): return
	G.S.skills[k] = 1
	UI.toast("习得武学「%s」" % SKILLS.get(k, {}).get("name", k), 1600)

func gain(txt: String) -> void:
	UI.toast(txt, 1200)
