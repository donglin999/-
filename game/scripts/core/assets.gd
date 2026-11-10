extends Node
## 素材表（对应原版 core.js 的 IMG/loadAll/loadOpt 与 production-assets.js 的键→路径表）
## 与原版的差别：不在首屏一次性下载全部 550 张图；按场景需要用后台线程加载（ResourceLoader 多线程），
## Web 版另按“素材包”分批下载（见 packs.gd），首屏只等标题与序章用到的图。

var paths := {}          # 键 → res:// 路径
var audio_paths := {}
var _cache := {}         # 键 → Texture2D
var _pending := {}       # 路径 → true（已发出后台加载请求）

func _ready() -> void:
	var f := FileAccess.open("res://data/js/production-assets.json", FileAccess.READ)
	var d: Dictionary = JSON.parse_string(f.get_as_text())
	for k in d.PRODUCTION_ASSET_PATHS:
		paths[k] = "res://" + String(d.PRODUCTION_ASSET_PATHS[k])
	for k in d.PRODUCTION_AUDIO_PATHS:
		audio_paths[k] = "res://" + String(d.PRODUCTION_AUDIO_PATHS[k])

## 键 → 路径：先查正式素材表，再按原版约定 assets/<键>.webp
func path_of(key: String) -> String:
	if paths.has(key):
		return paths[key]
	if key.begins_with("res://"):
		return key
	if key.begins_with("assets/"):
		return "res://" + key
	for ext in [".webp", ".png", ".jpg"]:
		var p: String = "res://assets/" + key + ext
		if ResourceLoader.exists(p):
			return p
	return ""

func has(key: String) -> bool:
	return _cache.has(key) or path_of(key) != ""

## 同步取图（已在后台加载完的直接返回；没加载的会阻塞读取，场景切换时应先 preload_keys）
func tex(key: String) -> Texture2D:
	if _cache.has(key):
		return _cache[key]
	var p := path_of(key)
	if p == "":
		return null
	var t: Texture2D
	if _pending.has(p):
		t = ResourceLoader.load_threaded_get(p)
		_pending.erase(p)
	else:
		t = load(p)
	_cache[key] = t
	return t

## 只在已就绪时返回，不阻塞（绘制循环里用）
func tex_ready(key: String) -> Texture2D:
	if _cache.has(key):
		return _cache[key]
	var p := path_of(key)
	if p == "":
		return null
	if not Packs.ready_for(p):
		Packs.ensure(Packs.pack_of(p))
		return null
	if not _pending.has(p):
		ResourceLoader.load_threaded_request(p, "", true)
		_pending[p] = true
		return null
	if ResourceLoader.load_threaded_get_status(p) == ResourceLoader.THREAD_LOAD_LOADED:
		return tex(key)
	return null

## 后台批量加载，返回进度 0..1 的 await 接口
func preload_keys(keys: Array, progress: Callable = Callable()) -> void:
	await Packs.ensure_paths(keys.map(func(k): return path_of(k)))
	var todo := []
	for k in keys:
		if _cache.has(k):
			continue
		var p: String = path_of(k)
		if p == "":
			continue
		if not _pending.has(p):
			ResourceLoader.load_threaded_request(p, "", true)
			_pending[p] = true
		todo.append(k)
	var total := todo.size()
	while true:
		var done := 0
		for k in todo:
			var p: String = path_of(k)
			if _cache.has(k) or ResourceLoader.load_threaded_get_status(p) != ResourceLoader.THREAD_LOAD_IN_PROGRESS:
				done += 1
		if progress.is_valid():
			progress.call(1.0 if total == 0 else float(done) / total)
		if done >= total:
			break
		await get_tree().process_frame
	for k in todo:
		tex(k)

func audio(key: String) -> AudioStream:
	var p: String = str(audio_paths.get(key, "res://assets/audio/%s.mp3" % key))
	if not ResourceLoader.exists(p):
		return null
	return load(p)
