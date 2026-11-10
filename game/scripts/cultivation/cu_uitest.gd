## 调试用界面巡检（仅 --cultivation=uitest<N> 时运行，正式流程不调用）
## 先依次打开各栏目、设置、小游戏并玩完四个候选，再随机点击可用按钮 N 步，供 headless 抓运行时报错。
class_name CuUITest

const SKIP := ["gate-title", "recovery-title", "martial-menu", "jianghu", "visitor-fight", "visitor-training", "sound"]

static func _wait(h: Node, sec: float) -> void:
	await h.get_tree().create_timer(sec, true, false, true).timeout

static func _buttons(n: Node, out: Array) -> Array:
	for c in n.get_children():
		if c is Button and (c as Button).is_visible_in_tree() and not (c as Button).disabled: out.append(c)
		_buttons(c, out)
	return out

static func _games(h: Node) -> CuMinigames:
	var stack := [h.root]
	while stack.size():
		var n: Node = stack.pop_back()
		if n is CuMinigames: return n
		stack.append_array(n.get_children())
	return null

## 用原版正确解法玩完四个小游戏
static func _play_games(h: Node) -> void:
	h.on_cu("games"); await _wait(h, 0.2)
	var m := _games(h)
	if m == null: print("uitest: 找不到小游戏面板"); return
	var plans := {
		"stance": [["move", "left"], ["confirm", null], ["move", "right"], ["confirm", null], ["move", "left"], ["confirm", null], ["move", "down"], ["confirm", null], ["move", "right"], ["confirm", null], ["move", "up"], ["confirm", null]],
		"moves": [["add", 1], ["check", null], ["undo", null], ["add", 0], ["add", 1], ["add", 2], ["add", 3], ["check", null]],
		"sort": [["bin", "seed"], ["bin", "leaf"], ["select", 2], ["bin", "root"], ["bin", "seed"], ["bin", "leaf"], ["bin", "seed"], ["bin", "root"]],
		"trail": [["trail-cell", 1], ["trail-cell", 5], ["trail-cell", 9], ["trail-cell", 10], ["trail-cell", 14], ["trail-cell", 15]],
	}
	for id in plans:
		m._input_cmd("launch", id); await _wait(h, 0.05)
		for st in plans[id]:
			m._input_cmd(st[0], st[1]); await _wait(h, 0.02)
		print("uitest 小游戏 ", id, " → ", m.game.status, " 失误=", m.game.misses)
		m._input_cmd("back"); await _wait(h, 0.05)
	m._input_cmd("launch", "trail"); m._input_cmd("trail-cell", 4)
	print("uitest 小游戏 trail 踩泥 → ", m.game.status, " ", m.game.message)
	h.on_cu("close"); await _wait(h, 0.1)

static func run(h: Node, steps: int) -> void:
	await _wait(h, 0.5)
	for cat in CuCore.D().categories:
		h.on_cu("category", cat.id); await _wait(h, 0.15)
		h.on_cu("close"); await _wait(h, 0.1)
	for v in ["settings", "rest", "training-record"]:
		h.on_cu(v); await _wait(h, 0.15)
		h.on_cu("close"); await _wait(h, 0.1)
	await _play_games(h)
	var rng := RandomNumberGenerator.new(); rng.seed = 7
	var last := ""
	for i in steps:
		var bs := _buttons(h.root, []).filter(func(b): return not (str(b.get_meta("cu", "")) in SKIP))
		if bs.is_empty(): await _wait(h, 0.3); continue
		var pref := bs.filter(func(b): return not (str(b.get_meta("cu", "")) in ["close", "return-cancel", "offer-later", "mail-close", "debug-schedule", "settings", "games", "training-record", "", "rest", "category"]))
		if pref.size() and rng.randf() < 0.8: bs = pref
		var b: Button = bs[rng.randi() % bs.size()]
		last = str(b.get_meta("cu", b.get_meta("mg", "?"))) + ":" + str(b.get_meta("id", ""))
		b.pressed.emit()
		await _wait(h, 0.06)
		if i % 25 == 0:
			var s: Dictionary = h.state()
			print("uitest 步", i, " 月=", CuCore.period(s), " 模式=", s.mode, " view=", h.view, " 最后=", last)
	print("uitest 结束")
	h.get_tree().quit()
