class_name OccGrid
extends RefCounted
## 遮挡不透明格：离线由 tools/occ_grids.py 生成（data/runtime/occ.json），按场景与物件下标取
static var _data := {}
static var _decoded := {}

static func of(W, kind: int, q: Array, _im, _k, _L, _T, _R, _B):
	if _data.is_empty(): _data = Data.json("res://data/runtime/occ.json")
	var sc: Dictionary = _data.get(W.cur_id, {})
	var key := "props" if kind == 6 else "fgp"
	var list: Array = sc.get(key, [])
	var src: Array = W.cur.get(key, [])
	var i := src.find(q)
	if i < 0 or i >= list.size(): return null
	var ck := "%s/%s/%d" % [W.cur_id, key, i]
	if not _decoded.has(ck):
		var e: Array = list[i]
		_decoded[ck] = {"gw": int(e[0]), "gh": int(e[1]), "bits": Marshalls.base64_to_raw(e[2])}
	return _decoded[ck]
