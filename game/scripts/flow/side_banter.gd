extends RefCounted
## 闲话与交情（原版 js/qihe-banter.js）。闲话只在汉皋城和大地图自由模式里出现（原版这两处尚未做，只提供规则与数据）；培养模式不用。
## 交情是同伴与同伴之间的，只靠一起打过的仗增长。数据（list、NAMES、STAGES）在 data/npc/banter.json，与原版字面量一致。
## 全部是静态函数，world 即存档字典（原版 S）。

const REL := {"ye": "ye", "yinhongying": "yin"}
static var _d: Dictionary = {}

static func data() -> Dictionary:
	if _d.is_empty():
		_d = JSON.parse_string(FileAccess.get_file_as_string("res://data/npc/banter.json"))
	return _d

static func list() -> Array: return data().list
static func names() -> Dictionary: return data().NAMES
static func stages() -> Array: return data().STAGES

static func pair_key(a: String, b: String) -> String:
	var p := [a, b]; p.sort()
	return "|".join(p)

static func by_id(id: String):
	for b in list():
		if b.id == id: return b
	return null

## 一起打完一场（赢或输都算；逃跑、单人战、教学战不算），在场的同伴两两各记一场
static func fought(world, opt: Dictionary = {}, result = null) -> int:
	if not (world is Dictionary) or opt.get("solo") or opt.get("tutorial") or opt.get("storyLesson") or result == "flee": return 0
	var who: Array = world.get("party", []).filter(func(k): return names().has(k))
	if not (world.get("kinship") is Dictionary): world.kinship = {}
	var n := 0
	for i in who.size():
		for j in range(i + 1, who.size()):
			var k := pair_key(who[i], who[j])
			world.kinship[k] = int(world.kinship.get(k, 0)) + 1; n += 1
	return n

static func kinship(world, a: String, b: String) -> Dictionary:
	var battles := 0
	if world is Dictionary: battles = int(world.get("kinship", {}).get(pair_key(a, b), 0))
	var stage := 0
	var st := stages()
	for i in st.size():
		if battles >= st[i].at: stage = i
	return {"battles": battles, "stage": stage, "name": st[stage].name, "next": st[stage + 1].at if stage + 1 < st.size() else null}

static func relation(world, id: String) -> int:
	if not (world is Dictionary): return 0
	return int(world.get("cultivation", {}).get("relations", {}).get(REL.get(id, ""), {}).get("score", 0))

static func _here(world: Dictionary, p: String) -> bool: return p == "hero" or world.get("party", []).has(p)

## 为什么现在不出现（空字符串＝可以出现）
static func blocked(world: Dictionary, b: Dictionary, venue: String) -> String:
	if not b.venues.has(venue): return "地方不对"
	for p in b.pair:
		if not _here(world, p): return "人不在"
	if world.get("banter", {}).get("offered", {}).has(b.id): return "已出现过"
	if b.has("kin") and kinship(world, b.pair[0], b.pair[1]).stage < b.kin: return "交情未到"
	if b.has("rel"):
		var other: String = b.pair[1] if b.pair[0] == "hero" else b.pair[0]
		if relation(world, other) < b.rel: return "关系未到"
	if b.has("fact") and not world.get("cultivation", {}).get("facts", {}).get(b.fact): return "事情还没发生"
	if b.get("adult") and int(world.get("cultivation", {}).get("month", 0)) < 13: return "萧白未满十八"
	return ""

## 某处现在该提示的一条：没有就返回 null
static func due(world, venue: String):
	if not (world is Dictionary): return null
	for b in list():
		if blocked(world, b, venue) == "": return b
	return null

static func offer(world: Dictionary, b: Dictionary) -> Dictionary:
	if not (world.get("banter") is Dictionary): world.banter = {"offered": {}, "seen": {}}
	if not world.banter.offered.has(b.id): world.banter.offered[b.id] = world.banter.offered.size() + 1
	return b

static func finish(world: Dictionary, id: String) -> bool:
	if by_id(id) == null: push_error("没有这条闲话。"); return false
	if not world.get("banter", {}).get("offered", {}).has(id): push_error("这条闲话还没出现过。"); return false
	world.banter.seen[id] = true
	return true

static func book(world) -> Array:
	var st: Dictionary = world.get("banter", {}) if world is Dictionary else {}
	var off: Dictionary = st.get("offered", {})
	var ids: Array = off.keys().filter(func(id): return by_id(id) != null)
	ids.sort_custom(func(a, b): return off[a] < off[b])
	return ids.map(func(id):
		var b: Dictionary = by_id(id)
		return {"id": id, "title": b.title, "names": b.pair.map(func(p): return names()[p]), "read": st.get("seen", {}).get(id) == true})

static func script(id: String):
	var b = by_id(id)
	return {"id": id, "title": b.title, "cast": b.pair, "lines": b.lines} if b != null else null

static func prompt(b: Dictionary) -> String:
	var a: String = b.pair[0]; var c: String = b.pair[1]
	return "%s有话跟你说" % names()[c] if a == "hero" else "%s和%s在说话" % [names()[a], names()[c]]
