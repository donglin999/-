extends Node
## 自动测试公共底座（2026-11-05）：自动通关、全人物扫荡、存档回归共用。
## - 收报错：挂一个 Logger，游戏里所有 push_error、脚本运行错误都记下来（带当时在做的事）；
## - 自动推进：对白自动点过，选项按策略选；人物交互的面板（查看、赠礼、交易、偷窃、教、切磋卷）稍等后按 Esc 收起；
## - 卡关检测：一件事做了很久既没有新台词也没结束，或做完后玩家仍动不了，记为“卡住”；
## - 查“尚未移植”：台词里出现这几个字就记一条；
## - 结果：issues 列表，write_report() 写成 JSON，供 tools/selftest.sh 汇总。

class ErrLog extends Logger:
	var items: Array = []
	var ctx := ""
	var mu := Mutex.new()
	func _log_error(_fn: String, file: String, line: int, code: String, rationale: String, _notify: bool, type: int, _bt: Array) -> void:
		if type == ERROR_TYPE_WARNING: return
		var msg := code if rationale == "" else rationale + "｜" + code
		# 引擎退出时的资源泄漏提示不算游戏错误
		if "still in use at exit" in msg or "leaked at exit" in msg: return
		# 无头模式的空渲染器（servers/rendering/dummy）偶尔报纹理参数为空：只在无头模式出现，真实渲染（截图那次）从没出现过，不是游戏的错
		if "servers/rendering/dummy/" in file: return
		mu.lock(); items.append({"msg": msg, "at": "%s:%d" % [file, line], "ctx": ctx}); mu.unlock()
	func _log_message(_m: String, _e: bool) -> void: pass

var elog := ErrLog.new()
var issues: Array = []          # {kind, what, detail, ctx}
var lines: Array = []           # 对白与选项记录（与 walkthrough 同格式）
var speech: Array = []          # 每句台词的说话人和当时所在场景 {who, scene}（2026-11-10 人物行踪检查用）
var choice_policy: Callable = func(_n: int, _q: String) -> int: return 0
var tick_ms := 15
var panel_wait_ms := 250        # 面板打开后多久按 Esc
var stall_s := 25.0             # 多少秒没进展算卡住
var _last_progress := 0
var _panel_since := 0
var _seen_err := 0
var driving := true
var max_choices := 0        # 这段时间里遇到的最多选项数（扫荡按它决定要不要把别的选项也走一遍）

func _ready() -> void:
	OS.add_logger(elog)
	Flow.skip_battles = true
	_last_progress = Time.get_ticks_msec()
	_drive()

func _exit_tree() -> void:
	OS.remove_logger(elog)

func ctx(t: String) -> void:
	elog.ctx = t

func issue(kind: String, what: String, detail := "") -> void:
	var it := {"kind": kind, "what": what, "detail": detail, "ctx": elog.ctx}
	issues.append(it)
	print("【问题】%s｜%s｜%s" % [kind, what, detail])

## 把这段时间新增的报错转成问题
func flush_errors() -> void:
	elog.mu.lock()
	var news: Array = elog.items.slice(_seen_err)
	_seen_err = elog.items.size()
	elog.mu.unlock()
	for e in news: issue("报错", e.msg, e.at)

func progress() -> void:
	_last_progress = Time.get_ticks_msec()

func _record_line() -> void:
	if not Dialog.visible_now(): return
	var k: String = str(Dialog._cur.get("who", "")) + "：" + (Dialog._full if Dialog._full != "" else Dialog.txt.text)
	if Dialog._choice_buttons.size():
		k = "【选项】" + Dialog.txt.text + " → " + "／".join(Dialog._choice_buttons.map(func(b): return b.text.substr(b.text.find(" ")).strip_edges()))
	if lines.is_empty() or lines[lines.size() - 1] != k:
		lines.append(k); progress()
		if not Dialog._choice_buttons.size():
			var ch := Flow.get_node_or_null("Chapter")
			speech.append({"who": str(Dialog._cur.get("who", "")), "scene": World.cur_id, "gather": ch != null and ch.has_method("_gathering") and ch._gathering(), "knot": Story._knot})
		if "尚未移植" in k: issue("尚未移植", k)

func _drive() -> void:
	while is_inside_tree():
		await get_tree().create_timer(tick_ms / 1000.0).timeout
		if not driving: continue
		_record_line()
		if Dialog.visible_now():
			_panel_since = 0
			if Dialog._go.is_valid(): Dialog._go.call(); progress()
			elif Dialog._choice_cb.is_valid():
				var n := Dialog._choice_buttons.size()
				max_choices = maxi(max_choices, n)
				var i: int = clampi(choice_policy.call(n, Dialog.txt.text), 0, maxi(0, n - 1))
				Dialog._choice_cb.call(i); progress()
			continue
		var kf := key_receiver()
		if kf.is_valid():
			# 人物交互的面板在等按键：稍等让它画完，再按 Esc 收起
			if _panel_since == 0: _panel_since = Time.get_ticks_msec()
			elif Time.get_ticks_msec() - _panel_since > panel_wait_ms:
				_panel_since = 0
				kf.call("escape"); progress()
			continue
		_panel_since = 0

## 正在等按键的面板（墨印／查看／卷 用 Npc.key_handler；赠礼、交易、商店用 gift_ui.key_fn；偷窃用 steal_ui.key_fn）
func key_receiver() -> Callable:
	for h in [Npc.gift_ui, Npc.steal_ui]:
		if h != null and h.key_fn.is_valid(): return h.key_fn
	return Npc.key_handler

## 玩家现在能不能自由走动
func free_now() -> bool:
	var ch = Flow.get_node_or_null("Chapter")
	var pr = Flow.prologue()
	return not (World.busy or Dialog.busy or (ch != null and ch.running) or (pr != null and pr.arrival_running) or UI.panel_open() or key_receiver().is_valid())

## 等到能自由走动；超时返回 false
func idle(limit_s := 30.0) -> bool:
	await get_tree().process_frame
	var t0 := Time.get_ticks_msec()
	while not free_now():
		if Time.get_ticks_msec() - t0 > limit_s * 1000: return false
		await get_tree().create_timer(0.05).timeout
	return true

## 带看门狗执行一个协程：done 返回 true；超过 stall_s 秒没有新台词也没结束，返回 false（协程留着不管，调用方负责收拾）
func guard(what: String, fn: Callable, hard_s := 240.0, ok_when: Callable = Callable()) -> bool:
	var st := {"done": false}
	var runner := func():
		await fn.call()
		st.done = true
	runner.call()
	progress()
	var t0 := Time.get_ticks_msec()
	while not st.done:
		await get_tree().create_timer(0.05).timeout
		if ok_when.is_valid() and ok_when.call(): return true   # 例如进了培养模式：另一套界面接管，不会回来，算做完
		var now := Time.get_ticks_msec()
		if now - _last_progress > stall_s * 1000 or now - t0 > hard_s * 1000:
			issue("卡住", what, "%.0f 秒没有进展；场景 %s，对白 %s，地图忙 %s，面板 %s，最后一句：%s" % [
				(now - _last_progress) / 1000.0, World.cur_id, Dialog.busy, World.busy, UI.panel_open(), lines[lines.size() - 1] if lines.size() else "-"])
			return false
	return true

## 收拾残局：卡住或做完后把面板、对白、忙碌标记清掉
func unstick() -> void:
	if Cultivation.get("_active"): Cultivation.leave()
	Npc.close_panels(); Npc.capture_keys(Callable())
	for pn in UI._panels.duplicate():
		if is_instance_valid(pn) and pn.is_inside_tree(): pn.queue_free()
	UI._panels.clear()
	Dialog.busy = false; World.busy = false
	var ch = Flow.get_node_or_null("Chapter")
	if ch: ch.running = false
	var pr = Flow.prologue()
	if pr: pr.arrival_running = false
	await get_tree().process_frame

## 载入一份存档字典，走和标题页“继续进度”一样的路
func load_state(s: Dictionary, key := "selftest") -> bool:
	G.save_key = key
	var st = G._fix_numbers(s.duplicate(true))
	var ok := await guard("读档进场 " + str(st.get("scene")), func(): await Flow.prologue().start(false, st), 120)
	if not ok: return false
	return await idle(60)

func snapshot() -> Dictionary:
	if G.S == null: return {}
	G.S.x = World.player.x; G.S.y = World.player.y; G.S.scene = World.cur_id
	return JSON.parse_string(JSON.stringify(G.S))

## 场景之间怎么走：门和出口在游戏里是“人物”（按 E 进门、走出口），去向写在流程脚本里。这里照脚本抄一份连通表：
## 村里四扇门（prologue.gd _bind）、室内回村的门、陈家客房门，和区域出入口（chapter.gd _install_expansion 的 _portal）。
const DOORS := {
	"qihe_trial": {"ye-door": "prologue_ye_house", "chen-door": "prologue_chen_hall", "clinic-door": "prologue_clinic_interior", "inn-door": "prologue_inn_interior"},
	"prologue_clinic_interior": {"clinic_interior-out": "qihe_trial"}, "prologue_ye_house": {"ye_house-out": "qihe_trial"},
	"prologue_inn_interior": {"inn_interior-out": "qihe_trial"}, "prologue_chen_hall": {"chen_hall-out": "qihe_trial", "guest-door": "prologue_chen_guest"},
	"prologue_chen_guest": {"guest-out": "prologue_chen_hall"}}
const PORTALS := [["central", "north", "north", "south"], ["central", "south", "south", "north"], ["central", "west", "west", "east"], ["central", "east", "east", "west"],
	["south", "east", "east", "south"], ["south", "west", "west", "south"]]

func links_of(id: String) -> Dictionary:
	var out: Dictionary = DOORS.get(id, {}).duplicate()
	var ids: Dictionary = Flow.get_node("Chapter").IDS
	for r in PORTALS:
		if ids[r[0]] == id: out["exit-" + r[1]] = ids[r[2]]
		if ids[r[2]] == id: out["exit-" + r[3]] = ids[r[0]]
	if id == ids.refuge: out.merge({"exit-east": ids.west, "exit-south": ids.west, "exit-north": ids.mountain})
	if id == ids.mountain: out["exit-south"] = ids.refuge
	return out

## 此刻看得见的门：{门 id: 去向}
func doors_here(id: String) -> Dictionary:
	var out := {}
	var l := links_of(id)
	for n in World.npcs_of(World.scenes[id]):
		var nid := str(n.get("id", ""))
		if l.has(nid) and World.scenes.has(l[nid]): out[nid] = l[nid]
	return out

## 从 from 出发、按此刻看得见的门能走到的场景
func reachable(from: String) -> Array:
	var seen := {from: true}; var q := [from]
	while q.size():
		var id: String = q.pop_front()
		var d := doors_here(id)
		for k in d:
			if not seen.has(d[k]): seen[d[k]] = true; q.append(d[k])
	return seen.keys()

func _npc_by_id(id: String):
	for n in World.npcs_of(World.cur):
		if str(n.get("id", "")) == id: return n
	return null

## 像玩家那样一扇门一扇门走到目标场景：门要看得见、走得到门口，按 E 进门后要真到了那边；到不了返回 false
func walk_to(target: String, depth := 0) -> bool:
	if World.cur_id == target: return true
	if depth > 6: return false
	var prev := {World.cur_id: null}; var q := [World.cur_id]
	while q.size() and not prev.has(target):
		var id: String = q.pop_front()
		var d := doors_here(id)
		for k in d:
			if not prev.has(d[k]): prev[d[k]] = [id, k]; q.append(d[k])
	if not prev.has(target): return false
	var chain := []
	var c = target
	while prev[c] != null:
		chain.push_front(prev[c]); c = prev[c][0]
	for hop in chain:
		var n = _npc_by_id(hop[1])
		if n == null: issue("门不在", "%s 里看不见 %s" % [World.cur_id, hop[1]]); return false
		if World.find_path(float(n.x) * World.TS, float(n.y) * World.TS) == null and Vector2(float(n.x) * World.TS - World.player.x, float(n.y) * World.TS - World.player.y).length() > 90:
			issue("走不到门口", "%s 里从玩家位置走不到 %s" % [World.cur_id, hop[1]])
		var want: String = links_of(World.cur_id)[hop[1]]
		if not await guard("进门 %s → %s" % [hop[1], want], func(): await World.interact(n), 120): return false
		if not await idle(90): issue("卡住", "进门后动不了", hop[1]); return false
		if World.cur_id != want:
			# 门先演了一段戏（如第一次去叶家）没换场：再找一次路
			return await walk_to(target, depth + 1)
	return World.cur_id == target

func write_report(path: String, extra := {}) -> void:
	flush_errors()
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	var d := {"issues": issues, "lines": lines.size()}
	var ch := Flow.get_node_or_null("Chapter")
	if ch != null and "popins" in ch: d["popins"] = ch.popins
	d.merge(extra, true)
	var f := FileAccess.open(path, FileAccess.WRITE)
	f.store_string(JSON.stringify(d, " ")); f.close()
	print("测试报告 → ", path, "（问题 ", issues.size(), " 条）")
