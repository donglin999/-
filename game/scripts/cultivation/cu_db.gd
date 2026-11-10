class_name CuDB
extends RefCounted
## 培养模式公用小工具（各 cu_*.gd 共用；约定见 docs/review/cultivation-notes.md）。
## - 数据表：CuDB.t("CultivationData") 取 globals.json 里的表，已把整数浮点转回 int；缓存只读，要改先 CuDB.copy。
## - 异常：原版 throw Error(msg) 一律改成 `return CuDB.fail(msg)`；调用方用 `if CuDB.error != "": return null` 向上传递。
##   Cultivation.perform 开头 CuDB.clear()，结束检查 CuDB.error，非空就整份回滚（对应原版 perform 的 try/catch）。

static var _tables := {}
static var error := ""

## 取原版数据表（只读）
static func t(name: String):
	if not _tables.has(name):
		var v = DB.g(name)
		_tables[name] = fix(copy(v)) if v != null else null
	return _tables[name]

## 原版 JSON.parse(JSON.stringify(x))
static func copy(x):
	if x is Dictionary or x is Array: return x.duplicate(true)
	return x

## 把看起来是整数的浮点转回 int（与 G._fix_numbers 相同）
static func fix(v):
	if v is Dictionary:
		for k in v: v[k] = fix(v[k])
		return v
	if v is Array:
		for i in v.size(): v[i] = fix(v[i])
		return v
	if v is float and v == floor(v) and abs(v) < 1e15:
		return int(v)
	return v

## 原版 throw Error(msg)：记下第一条错误，返回 null
static func fail(msg: String):
	if error == "": error = msg
	return null

static func clear() -> void:
	error = ""

## 原版 Date.now()（写进存档的时间戳用 Unix 毫秒）
static func now_ms() -> int:
	return int(Time.get_unix_time_from_system() * 1000.0)

## 原版 Number.isInteger
static func is_int(v) -> bool:
	return v is int or (v is float and v == floor(v))

## 原版 period(s) = (month-1)*5+phase
static func period(s: Dictionary) -> int:
	return (int(s.month) - 1) * 5 + int(s.phase)

## 原版 arr.find(x=>x[key]===val)
static func find_by(arr: Array, key: String, val):
	for x in arr:
		if x is Dictionary and x.get(key) == val: return x
	return null

## 原版 JS 数字转字符串（整数不带 .0）
static func num(v) -> String:
	if v is float and v == floor(v) and abs(v) < 1e15: return str(int(v))
	return str(v)

## 原版 arr.some(x=>x[key]===val)
static func has_by(arr: Array, key: String, val) -> bool:
	return find_by(arr, key, val) != null

## 原版 D.actions.find(a=>a.id===id)
static func action(id):
	return find_by(t("CultivationData").actions, "id", id)

## 原版 x||{}：取字典字段，不存在或不是字典时新建并挂上
static func dict_of(d: Dictionary, k: String) -> Dictionary:
	if not (d.get(k) is Dictionary): d[k] = {}
	return d[k]

## 原版 x||[]
static func arr_of(d: Dictionary, k: String) -> Array:
	if not (d.get(k) is Array): d[k] = []
	return d[k]

## JS 真值
static func truthy(v) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int or v is float: return v != 0
	if v is String: return v != ""
	return true
