extends Node
## Web 版素材分包（对应原版“按场景加载”，但不再在首屏等 550 张图）：
## 主包只带代码、数据、字体、标题与序章后山用的图；其余按区域分成几个 .pck，进游戏后在后台按顺序下载、挂载；
## 换场前 Assets.preload_keys 会先等目标图所在的包到位（带“载入地图中……”提示）。macOS 版全部打在一个包里，这里什么都不做。
## 分包清单由 tools/export.py 生成到 res://data/packs.json：{"order":[包名…], "files":{包名:[res路径…]}}

signal pack_ready(name)
var manifest := {}
var _owner := {}         # res 路径 → 包名
var loaded := {}         # 包名 → true
var _downloading := {}
var enabled := false

func _ready() -> void:
	enabled = OS.has_feature("web") and FileAccess.file_exists("res://data/packs.json")
	if not enabled: return
	manifest = JSON.parse_string(FileAccess.get_file_as_string("res://data/packs.json"))
	for name in manifest.files:
		for p in manifest.files[name]: _owner[p] = name
	_background()

func pack_of(path: String) -> String:
	return _owner.get(path, "")

## 某个路径所在的包是否已挂载（不在任何包里＝在主包，视为就绪）
func ready_for(path: String) -> bool:
	if not enabled: return true
	var n := pack_of(path)
	return n == "" or loaded.has(n)

func ensure(name: String) -> void:
	if not enabled or name == "" or loaded.has(name): return
	if not _downloading.has(name): _download(name)
	while not loaded.has(name): await pack_ready

func ensure_paths(paths: Array) -> void:
	var need := {}
	for p in paths:
		var n := pack_of(p)
		if n != "" and not loaded.has(n): need[n] = true
	if need.is_empty(): return
	var slow := get_tree().create_timer(0.5)
	slow.timeout.connect(func(): if not need.keys().all(func(n): return loaded.has(n)): UI.toast("载入地图中……", 1600))
	for n in need: await ensure(n)

func _background() -> void:
	await get_tree().create_timer(1.5).timeout
	for name in manifest.order:
		await ensure(name)

var _js_cbs := {}

## 用浏览器原生 fetch 下载（Godot 的 HTTPRequest 在 Web 单线程版里逐帧读块，几十 MB 要很久），
## 取回 ArrayBuffer 后转成 PackedByteArray 写进 user://，再挂载。失败按 1、2、4 秒退避重试（同原版 ensureAsset）。
func _download(name: String) -> void:
	_downloading[name] = true
	var dest := "user://packs/%s.pck" % name
	DirAccess.make_dir_recursive_absolute("user://packs")
	var tries := 0
	while tries < 4:
		var t0 := Time.get_ticks_msec()
		var box := {"done": false, "buf": null, "err": ""}
		var ok_cb := JavaScriptBridge.create_callback(func(args): box.buf = args[0]; box.done = true)
		var err_cb := JavaScriptBridge.create_callback(func(args): box.err = str(args[0]); box.done = true)
		_js_cbs[name] = [ok_cb, err_cb]
		var win = JavaScriptBridge.get_interface("window")
		JavaScriptBridge.eval("window.__xjhFetch=(u,ok,bad)=>fetch(u).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(b=>ok(new Uint8Array(b))).catch(e=>bad(String(e)))", true)
		var base := str(JavaScriptBridge.eval("location.href.replace(/[^/]*([?#].*)?$/, '')", true))
		win.__xjhFetch(base + "packs/%s.pck?v=%s" % [name, str(manifest.get("ver", ""))], ok_cb, err_cb)
		while not box.done: await get_tree().process_frame
		if box.buf != null:
			var bytes := JavaScriptBridge.js_buffer_to_packed_byte_array(box.buf)
			var f := FileAccess.open(dest, FileAccess.WRITE)
			if f: f.store_buffer(bytes); f.close()
			if ProjectSettings.load_resource_pack(dest, false):
				print("素材包 %s：%.1f MB，%d ms" % [name, bytes.size() / 1e6, Time.get_ticks_msec() - t0])
				loaded[name] = true; pack_ready.emit(name); return
		push_warning("素材包 %s 下载或挂载失败：%s" % [name, box.err])
		tries += 1
		await get_tree().create_timer(pow(2, tries - 1)).timeout
	_downloading.erase(name)
	push_error("素材包下载失败：" + name)
