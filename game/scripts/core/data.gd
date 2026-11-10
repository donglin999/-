extends Node
## 读 JSON 数据（带缓存）
var _cache := {}

func json(path: String):
	if _cache.has(path): return _cache[path]
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("读不到数据 " + path); return {}
	var d = JSON.parse_string(f.get_as_text())
	_cache[path] = d
	return d
