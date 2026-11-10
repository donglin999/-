extends RefCounted
## 人物交互模块共用的小工具：把原版 JS 的真值、取整、字符串拼接语义照搬过来。

## JS 的真值（{} 与 [] 在 JS 里为真，GDScript 的 if 会判成假，这里按 JS 算）
static func t(v) -> bool:
	if v == null: return false
	match typeof(v):
		TYPE_BOOL: return v
		TYPE_INT, TYPE_FLOAT: return v != 0
		TYPE_STRING, TYPE_STRING_NAME: return String(v) != ""
	return true

## JS Math.round（.5 一律向上）
static func jround(v: float) -> int:
	return int(floor(v + 0.5))

## JS 数字转字符串：整数不带小数点
static func js(v) -> String:
	if typeof(v) == TYPE_FLOAT and is_finite(v) and v == floor(v): return str(int(v))
	if v == null: return "undefined"
	return str(v)

## 按点号路径取值（原版 qihe-steal.js get）
static func dig(obj, path: String):
	var v = obj
	for k in path.split("."):
		if v == null: return null
		if v is Dictionary: v = v.get(k)
		elif v is Object: v = v.get(k)
		else: return null
	return v

## 字典取子字典，没有就建（JS 的 a.b ||= {}）
static func sub(d: Dictionary, k: String, def = null):
	if not d.has(k) or d[k] == null or (def is Dictionary and not (d[k] is Dictionary)) or (def is Array and not (d[k] is Array)):
		d[k] = {} if def == null else def
	return d[k]

static func num(v, def := 0.0) -> float:
	if v == null: return def
	if typeof(v) in [TYPE_INT, TYPE_FLOAT]: return float(v)
	if typeof(v) == TYPE_BOOL: return 1.0 if v else 0.0
	if typeof(v) == TYPE_STRING and String(v).is_valid_float(): return float(v)
	return def

## JS 的 ?? ：null 才取后者
static func nz(a, b):
	return b if a == null else a

## 浅拷贝（JS 的 {...o}）
static func copy(d) -> Dictionary:
	return (d as Dictionary).duplicate(false) if d is Dictionary else {}

## 中文数字（偷窃界面 cn）
const CN := ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
static func cn(n) -> String:
	var i := int(n)
	return CN[i - 1] if i >= 1 and i <= 10 else str(i)
