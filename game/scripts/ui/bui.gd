extends Node
## 原版程序化水墨纹理（js/bui.js：swash 墨迹横扫、paper 宣纸、enso 圆相、rod 卷轴、seal 印章、blot 墨点字、coin 铜钱……）。
## 原版用固定种子逐像素生成；这里用 tools/bake_bui.cjs 从原版页面按实际参数导出的 PNG（2 倍像素密度），按同样规则拼键查表，逐像素一致。
## 用法：Bui.tex("swash", [236, 58, {"seed": 11, "rev": 1, ...}]) → Texture2D（逻辑尺寸见 Bui.size(...)）；参数写法照抄原版调用。

var index := {}
var _cache := {}
var _by_fn := {}

func _ready() -> void:
	var f := FileAccess.open("res://data/bui/index.json", FileAccess.READ)
	if f == null: return
	index = JSON.parse_string(f.get_as_text())
	for k in index:
		var fn: String = k.split("|")[0]
		if not _by_fn.has(fn): _by_fn[fn] = []
		_by_fn[fn].append(k)

## 与 tools/bake_bui.cjs 的 canon() 相同：对象键排序、数字按 JS 的 String(n)
static func canon(v) -> String:
	if v is Array:
		return "[" + ",".join(v.map(func(x): return canon(x))) + "]"
	if v is Dictionary:
		var ks: Array = v.keys(); ks.sort()
		return "{" + ",".join(ks.map(func(k): return JSON.stringify(str(k)) + ":" + canon(v[k]))) + "}"
	if v is bool: return "true" if v else "false"
	if v is int: return str(v)
	if v is float:
		if v == floor(v) and abs(v) < 1e15: return str(int(v))
		var s := String.num(v, 6)
		while s.contains(".") and s.ends_with("0"): s = s.substr(0, s.length() - 1)
		return s
	if v == null: return "null"
	return JSON.stringify(str(v))

func key_of(fn: String, args: Array) -> String:
	return fn + "|" + canon(args)

func has(fn: String, args: Array) -> bool:
	return index.has(key_of(fn, args))

## 取图；精确参数没烘到时，取同一函数、其余参数相同、尺寸最接近的一张（拉伸使用）
func tex(fn: String, args: Array) -> Texture2D:
	var k := key_of(fn, args)
	if not index.has(k): k = _nearest(fn, args)
	if k == "": return null
	if not _cache.has(k):
		var img := Image.load_from_file("res://data/bui/" + index[k].f) if not ResourceLoader.exists("res://data/bui/" + index[k].f) else null
		var t: Texture2D = load("res://data/bui/" + index[k].f) if img == null else ImageTexture.create_from_image(img)
		_cache[k] = t
	return _cache[k]

## 逻辑尺寸（原版 c.lw / c.lh）
func size(fn: String, args: Array) -> Vector2:
	var k := key_of(fn, args)
	if not index.has(k): k = _nearest(fn, args)
	if k == "": return Vector2.ZERO
	return Vector2(index[k].lw, index[k].lh)

func _nearest(fn: String, args: Array) -> String:
	var rest := canon(args.slice(2)) if args.size() > 2 else ""
	var best := ""; var bd := 1e18
	for k in _by_fn.get(fn, []):
		var a = JSON.parse_string(k.substr(fn.length() + 1))
		if not (a is Array): continue
		if args.size() > 2 and canon(a.slice(2)) != rest: continue
		var d := 0.0
		for i in min(2, min(a.size(), args.size())):
			if (a[i] is float or a[i] is int) and (args[i] is float or args[i] is int): d += abs(float(a[i]) - float(args[i]))
			elif a[i] != args[i]: d += 1e6
		if d < bd: bd = d; best = k
	return best

## 画到 CanvasItem 上（逻辑尺寸矩形）
func draw(ci: CanvasItem, fn: String, args: Array, r: Rect2, mod := Color.WHITE) -> void:
	var t := tex(fn, args)
	if t: ci.draw_texture_rect(t, r, false, mod)
