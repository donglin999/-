extends Node
## 存档状态 S 与读写（对应原版 core.js 的 newState/save/loadSave、qihe-saves.js、qihe-startup.js 的旅程键）
## 原版存在浏览器 localStorage：键 xjh.qihe-prologue.v2（原有进度）与 xjh.qihe-prologue.v2.run.<id>（新旅程），
## 最近一次写到 xjh.qihe-prologue.latest.v1。这里同样分旅程保存，写到 user://saves/<键>.json（Web 版落到浏览器 IndexedDB）。

const ORIGINAL := "xjh.qihe-prologue.v2"
const LATEST := "xjh.qihe-prologue.latest.v1"
const CHARACTER_LEVEL_CAP := 100
const SAVE_DIR := "user://saves"

var S = null               # 当前存档（Dictionary）；null 表示未开始
var save_key := ""         # 当前旅程的存档键
var mode := "title"        # title / scene / battle / cultivation / end

func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(SAVE_DIR)
	var t := Timer.new(); t.wait_time = 5.0; t.autostart = true
	t.timeout.connect(func():
		if S != null and mode == "scene" and not World.busy: save())
	add_child(t)

func new_state() -> Dictionary:
	return {"name": "无名", "origin": "orphan", "lv": 1, "exp": 0, "pts": 0,
		"st": {"str": 3, "con": 3, "agi": 3, "wil": 3, "wis": 3}, "moral": 10, "hp": 1, "mp": 1, "silver": 0, "atkBonus": 0, "mpBonus": 0,
		"skills": {"fist": 1}, "weapon": null, "armor": null, "bag": {"bun": 2}, "party": [], "pet": null, "pets": {}, "flags": {},
		"scene": "temple", "x": 480, "unlocked": {"temple": 1}}

func has_flag(f: String) -> bool:
	return S != null and S.flags.has(f) and S.flags[f]

func set_flag(f: String, v = 1) -> void:
	S.flags[f] = v

## 派生属性：优先用战斗子任务的 Stats.derived（含装备与词条）；还没有时用原版 core.js 的基础公式
func derived(u: Dictionary) -> Dictionary:
	var stats = load("res://scripts/battle/stats.gd") if ResourceLoader.exists("res://scripts/battle/stats.gd") else null
	if stats != null and stats.has_method("derived"): return stats.derived(u)
	var s: Dictionary = u.st
	return {"mhp": 60 + s.con * 14 + u.lv * 12, "mmp": 30 + s.wil * 7 + s.wis * 2 + u.lv * 5 + int(u.get("mpBonus", 0)),
		"atk": 8 + s.str * 3 + u.lv * 2 + int(u.get("atkBonus", 0)), "def": s.con + s.wil * 2, "spd": s.agi, "crit": 5 + s.wis * 2, "dodge": round(s.agi * 1.5), "move": 2 + floor(s.agi / 5.0)}

## 主角当前地图精灵（原版由各场景 playerSp 或换装后 qh_hero_initial 决定）
func player_sp() -> String:
	if S != null and S.get("playerSp"): return S.playerSp
	return "qh_hero_initial"

func _path(key: String) -> String:
	return "%s/%s.json" % [SAVE_DIR, key]

func journey_key(id: String) -> String:
	return ORIGINAL + ".run." + id if id != "" else ORIGINAL

func new_journey_key() -> String:
	var id := ""
	while true:
		id = String.num_int64(Time.get_unix_time_from_system() * 1000, 36) + "-" + str(randi() % 0x7fffffff).sha1_text().substr(0, 8)
		if not FileAccess.file_exists(_path(journey_key(id))): break
	return journey_key(id)

func save() -> void:
	if S == null or save_key == "": return
	var normal: bool = S.get("prologue", {}).get("version") == 2
	if normal:
		if not S.has("qiheSave"): S.qiheSave = {}
		S.qiheSave.savedAt = Time.get_datetime_string_from_system(true)
	var f := FileAccess.open(_path(save_key), FileAccess.WRITE)
	if f == null:
		UI.save_warning("进度未能保存：%s。下次保存成功前的进度可能丢失。" % error_string(FileAccess.get_open_error()))
		return
	f.store_string(JSON.stringify(S))
	f.close()
	UI.save_warning("")
	# “最近一次”只记正式旅程；自动测试、调试用的存档（walkthrough、selftest_*、debug）不碰它，免得标题页“继续进度”读到测试档
	if normal and is_journey(save_key):
		var l := FileAccess.open(_path(LATEST), FileAccess.WRITE)
		if l: l.store_string(save_key)

func checkpoint() -> void:
	if S != null:
		S.x = World.player.x; S.y = World.player.y
		save()

func read(key: String):
	if key == "" or not FileAccess.file_exists(_path(key)): return null
	var d = JSON.parse_string(FileAccess.get_file_as_string(_path(key)))
	if not (d is Dictionary): return null
	if d.get("prologue", {}).get("version") != 2: return null
	if not World.scenes.has(d.get("scene", "")): return null
	if d.get("qiheSave", {}).get("archivedAt"): return null
	return _fix_numbers(d)

## JSON 读回来的整数全是浮点；把看起来是整数的数转回 int，避免界面显示 “3.0”
func _fix_numbers(v):
	if v is Dictionary:
		for k in v: v[k] = _fix_numbers(v[k])
		return v
	if v is Array:
		for i in v.size(): v[i] = _fix_numbers(v[i])
		return v
	if v is float and v == floor(v) and abs(v) < 1e15:
		return int(v)
	return v

## 标题页列出的旅程：最近一次、当前、原有进度（去重，读得出来的才列）
func runs() -> Array:
	var recent := ""
	if FileAccess.file_exists(_path(LATEST)): recent = FileAccess.get_file_as_string(_path(LATEST)).strip_edges()
	var keys := []
	for k in [recent, ORIGINAL]:
		if k != "" and not keys.has(k): keys.append(k)
	var out := []
	for k in keys:
		var s = read(k)
		if s != null: out.append({"key": k, "state": s})
	return out

func normalize_level(s: Dictionary) -> Dictionary:
	if s.lv > CHARACTER_LEVEL_CAP:
		if not s.has("levelCapMigration"): s.levelCapMigration = {"previousLevel": s.lv, "previousExp": s.exp, "cap": CHARACTER_LEVEL_CAP}
		s.lv = CHARACTER_LEVEL_CAP
	if s.lv >= CHARACTER_LEVEL_CAP: s.exp = 0
	return s

# ───────── 存档管理（原版 js/qihe-saves.js QiheSaves：旅程 + 手动存档、重命名、回收站、载入） ─────────
const SLOT_PREFIX := ORIGINAL + ".slot."

func is_journey(key: String) -> bool:
	return key == ORIGINAL or RegEx.create_from_string("^xjh\\.qihe-prologue\\.v2\\.run\\.[a-z0-9-]{8,64}$").search(key) != null

func is_slot(key: String) -> bool:
	return RegEx.create_from_string("^xjh\\.qihe-prologue\\.v2\\.slot\\.[a-z0-9-]{8,64}$").search(key) != null

## read(key)：不过滤回收站（列表要显示回收站里的）；读不出来返回 null
func _read_any(key: String):
	if not (is_journey(key) or is_slot(key)) or not FileAccess.file_exists(_path(key)): return null
	var d = JSON.parse_string(FileAccess.get_file_as_string(_path(key)))
	if not (d is Dictionary) or d.get("prologue", {}).get("version") != 2 or not World.scenes.has(d.get("scene", "")): return null
	return _fix_numbers(d)

func save_label(key: String, s = null) -> String:
	if s is Dictionary and s.get("qiheSave") is Dictionary and s.qiheSave.get("name"): return str(s.qiheSave.name)
	if key == ORIGINAL: return "原有旅程"
	if is_slot(key): return "手动存档"
	return "旅程 " + key.get_slice(".", key.get_slice_count(".") - 1).substr(0, 8)

## list()：当前旅程在前，其余按保存时间新到旧
func save_list() -> Array:
	var rows := []
	for f in DirAccess.get_files_at(SAVE_DIR):
		if not f.ends_with(".json"): continue
		var key := f.trim_suffix(".json")
		if not (is_journey(key) or is_slot(key)): continue
		var st = S if key == save_key and S != null else _read_any(key)
		if st == null:
			rows.append({"key": key, "name": save_label(key), "invalid": true, "current": key == save_key})
			continue
		var meta: Dictionary = st.get("qiheSave", {}) if st.get("qiheSave") is Dictionary else {}
		rows.append({"key": key, "state": st, "name": save_label(key, st), "manual": is_slot(key), "current": key == save_key,
			"archived": meta.get("archivedAt") != null and str(meta.get("archivedAt", "")) != "", "savedAt": meta.get("savedAt")})
	rows.sort_custom(func(a, b):
		if a.current != b.current: return a.current
		var ta := str(a.get("savedAt", "")); var tb := str(b.get("savedAt", ""))
		if ta != tb: return ta > tb
		return a.key < b.key)
	return rows

func _writable() -> String:
	if not is_journey(save_key): return "评审入口不能修改正式存档，请从首页进入游戏"
	if S == null or S.get("prologue", {}).get("version") != 2: return "当前进度尚未就绪"
	if mode != "scene" or Dialog.busy: return "当前剧情或战斗进行中，请结束后再操作"
	return ""

func _new_key(prefix: String) -> String:
	var k := ""
	while k == "" or FileAccess.file_exists(_path(k)):
		k = prefix + String.num_int64(int(Time.get_unix_time_from_system() * 1000), 36) + "-" + str(randi()).sha1_text().substr(0, 8)
	return k

func _write(key: String, st: Dictionary) -> String:
	DirAccess.make_dir_recursive_absolute(SAVE_DIR)
	var f := FileAccess.open(_path(key), FileAccess.WRITE)
	if f == null: return "本地存储写入失败，请重试"
	f.store_string(JSON.stringify(st)); f.close()
	return ""

func _save_name(text: String) -> String:
	return text.strip_edges()

## command(type, ...)：失败不报成功、不跳转；返回 {ok, message} 或 {ok:false, reason}
func save_command(type: String, args := []) -> Dictionary:
	var err := _writable()
	if err == "": err = _do_save_command(type, args)
	if err.begins_with("OK:"): return {"ok": true, "message": err.substr(3)}
	if err.begins_with("NAV:"): return {"ok": true, "navigating": true, "message": err.substr(4)}
	return {"ok": false, "reason": "操作未完成：" + err}

func _do_save_command(type: String, args: Array) -> String:
	if S != null and World.player != null: S.x = World.player.x; S.y = World.player.y
	match type:
		"save":
			save(); return "OK:已保存当前进度"
		"create":
			var n := _save_name(str(args[0]) if args.size() > 0 else "")
			if n == "" or n.length() > 24: return "请输入1至24字的存档名称"
			var st: Dictionary = S.duplicate(true)
			var now := Time.get_datetime_string_from_system(true)
			st.qiheSave = {"name": n, "createdAt": now, "savedAt": now}
			var e := _write(_new_key(SLOT_PREFIX), st)
			return e if e != "" else "OK:新存档已保存，原进度保留"
		"rename":
			var key := str(args[0]); var n := _save_name(str(args[1]) if args.size() > 1 else "")
			if n == "" or n.length() > 24: return "请输入1至24字的存档名称"
			var st = S if key == save_key else _read_any(key)
			if st == null: return "存档无法读取，原记录已保留"
			if not (st.get("qiheSave") is Dictionary): st.qiheSave = {}
			st.qiheSave.name = n
			var e := _write(key, st)
			return e if e != "" else "OK:存档已重命名"
		"archive":
			var key := str(args[0]); var restore: bool = args.size() > 1 and args[1]
			if key == save_key: return "当前旅程不能移入回收站"
			var st = _read_any(key)
			if st == null: return "存档无法读取，原记录已保留"
			if not (st.get("qiheSave") is Dictionary): st.qiheSave = {}
			if restore: st.qiheSave.erase("archivedAt")
			else: st.qiheSave.archivedAt = Time.get_datetime_string_from_system(true)
			var e := _write(key, st)
			return e if e != "" else ("OK:存档已恢复" if restore else "OK:已移入回收站，可随时恢复")
		"load":
			var key := str(args[0])
			var st = _read_any(key)
			if st == null: return "存档无法读取，原记录已保留"
			if st.get("qiheSave") is Dictionary and st.qiheSave.get("archivedAt"): return "请先在回收站恢复这份存档"
			if key == save_key: return "OK:正在游玩此旅程"
			save()
			var dest := key
			if is_slot(key):
				# 手动存档原件不动，另开一条旅程续玩
				dest = _new_key(ORIGINAL + ".run.")
				st.qiheSave = {"name": save_label(key, st).substr(0, 19) + " · 续玩", "savedAt": Time.get_datetime_string_from_system(true)}
				var e := _write(dest, st)
				if e != "": return e
			_enter_journey.call_deferred(dest)
			return "NAV:正在载入存档"
		"home":
			save(); Flow.to_title.call_deferred()
			return "NAV:进度已保存，返回首页"
	return "未知存档操作"

## 原版 location.assign(QiheEntry.url(key))：整页重开进入那条旅程。这里拆掉当前地图后由标题页的“继续”流程进入
func _enter_journey(key: String) -> void:
	Flow.to_title()
	await get_tree().process_frame
	for n in get_tree().root.get_children():
		if n.has_method("_continue"):
			n._continue(key); return
