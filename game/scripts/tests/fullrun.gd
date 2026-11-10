class_name FullRun
extends RefCounted
## 全程测试的培养部分（2026-11-08）：接着自动通关进入培养后，照玩家的方式点培养界面上的按钮，
## 一直推进到汉皋城门（“这一程，到这里”）。战斗由 walkthrough 的 _drive_battle 托管真打。
## 用法：godot --headless --path game -- --walkthrough --fast --fullrun --report=<json>

## 有事要处理时按这个顺序点（剧情、结果、谷中消息、出发……）
const ORDER := ["visitor-fight", "visitor-training", "visitor-next", "visitor-choice", "lesson-next", "activity-story-next", "story-result-close",
	"result-close", "resolve", "summary-close", "notice-close", "arrival-next", "offer-next", "delivery-next", "teach", "story-complete", "depart", "return-confirm"]
## 平时练什么：先基本功，再学武，再闲逛（闲逛才遇得到三位前辈和三方代表）
const PLAN := ["B03", "B02", "B01", "P01", "A01", "D01", "K01", "K02"]
const CATS := ["stroll", "skill", "basic", "craft", "mail"]

var w            # walkthrough 节点
var clicks := 0
var cat_i := 0
var last_key := ""
var same_n := 0
var seen := {}   # 播过的事件 id
var tried := {}  # 本期点过、没起作用的练习／闲逛地点（换期清空）
var tried_per := -1

func _buttons(n: Node, out: Array) -> void:
	if n is Button and n.has_meta("cu") and str(n.get_meta("cu")) != "" and not n.disabled and n.is_visible_in_tree(): out.append(n)
	for c in n.get_children(): _buttons(c, out)

func _press(b: Button) -> void:
	clicks += 1
	w.note("（培养）点「%s」%s" % [b.text.strip_edges().replace("\n", " ") if b.text != "" else str(b.get_meta("cu")), (" " + str(b.get_meta("id"))) if str(b.get_meta("id", "")) != "" else ""])
	b.pressed.emit()
	w.h.progress()

func run(walk) -> void:
	w = walk
	var C = Cultivation
	var t0 := Time.get_ticks_msec()
	w.note("（培养）开始：%d 月 %d 期" % [C.state().month, C.state().phase])
	while true:
		await w.get_tree().create_timer(0.05).timeout
		if Battle.B != null: continue   # 战斗中：walkthrough 托管
		if Dialog.visible_now() or Dialog.busy: continue
		var s: Dictionary = C.state()
		if s.get("pending") is Dictionary and s.pending.get("action"): seen[s.pending.action] = true
		var per: int = (int(s.month) - 1) * 5 + int(s.phase)
		if s.mode == "complete" or seen.has("hg_gate") and s.mode != "journey_ready" and not s.get("pending"):
			w.note("（培养）到汉皋城门：%d 月 %d 期，模式 %s" % [s.month, s.phase, s.mode]); break
		if per > 24:
			w.h.issue("培养没停在城门", "已到第 %d 期还没见《城门在眼前》" % per); break
		if Time.get_ticks_msec() - t0 > 1500 * 1000:
			w.h.issue("培养部分超时", "25 分钟没走完，停在 %d 月 %d 期" % [s.month, s.phase]); break
		if C.root == null: continue
		var bs: Array = []
		_buttons(C.root, bs)
		if bs.is_empty(): continue
		var key := "%d|%d|%s|%s|%s" % [s.month, s.phase, s.mode, str(s.get("pending", {}).get("action", "")) if s.get("pending") is Dictionary else "", ",".join(bs.map(func(b): return str(b.get_meta("cu")) + ":" + str(b.get_meta("id"))))]
		if key == last_key:
			same_n += 1
			if same_n > 400:
				w.h.issue("培养界面卡住", "同一画面点了 20 秒没变化", key.left(300)); break
		else: same_n = 0; last_key = key
		if per != tried_per: tried = {}; tried_per = per
		var b := _pick(bs, s)
		if b != null:
			if str(b.get_meta("cu")) == "practice": tried[str(b.get_meta("id"))] = true
			_press(b)
			await w.get_tree().create_timer(0.12).timeout
	w.note("（培养）结束：点了 %d 次，播过 %d 个事件" % [clicks, seen.size()])

func _by(bs: Array, cmd: String) -> Array:
	return bs.filter(func(b): return str(b.get_meta("cu")) == cmd)

func _pick(bs: Array, s: Dictionary) -> Button:
	for cmd in ORDER:
		var l := _by(bs, cmd)
		if l.is_empty(): continue
		if cmd == "visitor-choice": return l[w.pick(l.size())]   # 选项照自动通关的选法（默认第一个）
		return l[0]
	# 关掉打开着的子画面（复盘、休息说明等）
	var pr := _by(bs, "practice").filter(func(b): var a = CuDB.action(str(b.get_meta("id"))); return a != null and Cultivation.why(a) == "" and not tried.has(str(b.get_meta("id"))))
	if not pr.is_empty():
		for id in PLAN:
			for b in pr:
				if str(b.get_meta("id")) == id: return b
		return pr[0]
	for c in ["rest-confirm"]:
		var l2 := _by(bs, c)
		if not l2.is_empty(): return l2[0]
	var cats := _by(bs, "category")
	if not cats.is_empty():
		# 轮着看各栏；某栏没东西可练就会回到这里换下一栏，一圈都没有就休息
		for i in CATS.size():
			var want: String = CATS[(cat_i + i) % CATS.size()]
			for b in cats:
				if str(b.get_meta("id")) == want:
					cat_i = (cat_i + i + 1) % CATS.size()
					if cat_i == 0: return _rest_or(bs, b)
					return b
		return cats[0]
	var cl := _by(bs, "close")
	if not cl.is_empty(): return cl[0]
	var rest := _by(bs, "rest")
	if not rest.is_empty(): return rest[0]
	return null

func _rest_or(bs: Array, fallback: Button) -> Button:
	var rest := _by(bs, "rest")
	return rest[0] if not rest.is_empty() else fallback
