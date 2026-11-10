extends Node
## ink 剧本运行时（对应原版 js/story-runtime.js）
## 用法：await Story.play("qihe_lodging", {"line": Callable, "externals": {...}, "vars": {...}})
##   line(id, who, text, opts)：场景自己的台词函数；不给时用 Dialog.say。
##   externals：本场用到的游戏函数（Callable，可 await）；未给的通用函数用默认实现。
## ink 的外部函数是同步调用：有副作用的动作先排队，台词显示前按顺序 await，保证“换场→台词”先后与剧本一致。

const InkStory = preload("res://addons/inkgd/runtime/ink_story.gd")

var _index := {}          # knot → 文件名
var _externals_all: Array = []
var _json_cache := {}     # 文件名 → JSON 文本
var early := {}           # 主线开始前写入的 qiheChapter.* 标记

func _ready() -> void:
	var f := FileAccess.open("res://data/story/index.json", FileAccess.READ)
	var d: Dictionary = JSON.parse_string(f.get_as_text())
	_index = d.knots
	_externals_all = d.externals

func has(knot: String) -> bool:
	return _index.has(knot)

func _json_for(knot: String) -> String:
	var file: String = _index[knot]
	if not _json_cache.has(file):
		_json_cache[file] = FileAccess.open("res://data/story/%s.json" % file, FileAccess.READ).get_as_text()
	return _json_cache[file]

# ── 存档标记路径 "prologue.arrival.borrowed" → G.S.prologue.arrival.borrowed ──
func _is_early(p: String) -> bool:
	return p.begins_with("qiheChapter.") and G.S != null and not G.S.has("qiheChapter")

func get_path_value(p: String):
	if _is_early(p):
		return early.get(p)
	var o = G.S
	for k in p.split("."):
		if o == null or not (o is Dictionary):
			return null
		o = o.get(k)
	return o

func set_path_value(p: String, v) -> void:
	if _is_early(p):
		early[p] = v
		return
	var ks := p.split(".")
	var last := ks[ks.size() - 1]
	var o: Dictionary = G.S
	for i in ks.size() - 1:
		var k := ks[i]
		if not (o.get(k) is Dictionary):
			o[k] = {}
		o = o[k]
	o[last] = v

func _default(name: String) -> Callable:
	match name:
		"flag": return func(p): var v = get_path_value(p); return false if v == null else v
		"set_flag": return func(p, v): set_path_value(p, v)
		"checkpoint": return func(): G.checkpoint()
		"toast": return func(t): UI.toast(t, 2800)
		"toast_for": return func(t, ms): UI.toast(t, int(ms))
		"mark": return func(_id = null): pass
	return Callable()

class _Binder extends RefCounted:
	var rt
	var name: String
	func call_ext(a = null, b = null, c = null, d = null):
		var args := [a, b, c, d]
		while args.size() and args[args.size() - 1] == null:
			args.pop_back()
		return rt._ext(name, args)

var _queue: Array = []
var _pending := {}
var _impl := {}
var _knot := ""

func _ext(name: String, args: Array):
	if name == "flag":
		if _pending.has(args[0]):
			var v = _pending[args[0]]
			return false if v == null else v
		var r = _impl.flag.callv(args)
		return false if r == null else r
	if name == "set_flag":
		_pending[args[0]] = args[1]
		_queue.push_back(func():
			await _impl.set_flag.callv(args)
			if _pending.get(args[0]) == args[1]:
				_pending.erase(args[0]))
		return null
	if not _impl.has(name):
		push_error("剧本 %s 调用了本场没有提供的游戏函数 %s" % [_knot, name])
		return null
	# 剧本传的参数比接的函数多时（如 go_scene("场景", "入口") 接到不收参数的函数），callv 会静默不执行，整段戏就留在原地演完；多的参数截掉
	var f: Callable = _impl[name]
	var n := f.get_argument_count()
	var a := args if n < 0 or n >= args.size() else args.slice(0, n)
	_queue.push_back(func(): return await f.callv(a))
	return null

static func parse_line(text: String, tags: Array) -> Dictionary:
	var t := text.strip_edges()
	var who := ""
	var body := t
	var idx := t.find("：")
	if idx > 0 and idx <= 12:
		var head := t.substr(0, idx)
		if not ("【" in head or "（" in head):
			who = head
			body = t.substr(idx + 1)
	if who == "":
		body = t.trim_prefix("【").trim_suffix("】")
	var tag := func(k: String) -> String:
		for x in tags:
			if String(x).begins_with(k + ":"):
				return String(x).substr(k.length() + 1).strip_edges()
		return ""
	return {"who": who, "text": body, "id": tag.call("id"), "mood": tag.call("mood")}

func _flush() -> void:
	while _queue.size():
		var f: Callable = _queue.pop_front()
		await f.call()

## 站位表等模块包裹整场剧本（原版 qihe-staging.js 替换 StoryRuntime.play）：hook(knot, inner) 里 await inner.call()
var play_hook: Callable = Callable()

func play(knot: String, opts: Dictionary = {}) -> void:
	if play_hook.is_valid():
		await play_hook.call(knot, func(): await _play(knot, opts))
	else:
		await _play(knot, opts)

func _play(knot: String, opts: Dictionary = {}) -> void:
	if not has(knot):
		push_error("剧本未编译或未加载：" + knot)
		return
	var story = InkStory.new(_json_for(knot))
	# 嵌套 play（剧本里的外部函数又开一场戏）时保留外层状态
	var saved := [_queue, _pending, _impl, _knot]
	_queue = []; _pending = {}; _knot = knot
	_impl = {}
	for n in ["flag", "set_flag", "checkpoint", "toast", "toast_for", "mark"]:
		_impl[n] = _default(n)
	var ext: Dictionary = opts.get("externals", {})
	for k in ext:
		_impl[k] = ext[k]
	for k in opts.get("vars", {}):
		story.variables_state.set_variable(k, opts.vars[k])
	var binders := []
	for n in _externals_all + _impl.keys():
		if binders.any(func(b): return b.name == n):
			continue
		var b := _Binder.new(); b.rt = self; b.name = n
		binders.append(b)
		story.bind_external_function(n, b, "call_ext", n == "flag")
	var line: Callable = opts.get("line", Callable())
	var chooser: Callable = opts.get("choose", Callable())   # 场景自己的选项框（原版 qihe-chapter 临时替换 window.choose）
	if not chooser.is_valid(): chooser = func(w, t, o): return await Dialog.choose(w, t, o)
	story.choose_path_string(knot)
	while true:
		while story.can_continue:
			var text: String = story.continue_story()
			await _flush()
			if text.strip_edges() == "":
				continue
			var l := parse_line(text, story.current_tags if story.current_tags else [])
			if not story.can_continue and story.current_choices.size():
				if l.id != "":
					_impl.mark.call(l.id)
				var i: int = await chooser.call(l.who, l.text, story.current_choices.map(func(c): return c.text))
				story.choose_choice_index(i)
				continue
			if line.is_valid():
				await line.call(l.id, l.who, l.text, {"mood": l.mood})
			else:
				await Dialog.say(l.who, l.text)
		await _flush()
		if story.current_choices.size() == 0:
			break
		story.choose_choice_index(await chooser.call("", " ", story.current_choices.map(func(c): return c.text)))
	_queue = saved[0]; _pending = saved[1]; _impl = saved[2]; _knot = saved[3]
