extends RefCounted
## 我方回合（bui.js allyTurn：指令菜单 → 武学 / 道具 → 目标选择 → 出手；蓄势投入；教学钩子；自动战斗绑定）。
## 原版用闭包，这里把闭包状态放在实例成员里（同一时刻只有一个角色在选指令）。

signal resolved(r)

const BD := preload("res://scripts/battle/bdraw.gd")

var bt
var u: Dictionary
var committed := false
var m := {}          # 当前菜单 {title, rows, back, on_sel, sel}
var tg := {}         # 当前目标选择 {side, all, list, back, go, desc}

func _init(b) -> void: bt = b

var B: Dictionary:
	get: return bt.B
func _L(): return B.opt.get("storyLesson")
func _hint(v) -> void: bt.panel.hint(v)

## 返回 "flee" 或 null
func ally_turn(unit: Dictionary):
	u = unit; committed = false; m = {}; tg = {}
	B.bpUse = 0
	_main()
	if bt.auto.allowed():
		bt.auto.bind(u, func(a: Dictionary):
			B.bpUse = a.bp
			if a.kind == "skill": _done(func(bp): await bt.rules.do_skill(u, a.skill, a.targets, bp))
			else: _done(func(bp): await bt.rules.do_attack(u, a.targets[0], bp)))
	var r = await resolved
	return r

## done(fn, nob)：收起菜单，扣蓄势，执行，教学 afterAction
func _done(fn: Callable, nob := false) -> void:
	if committed: return
	committed = true
	bt.auto.clear()
	bt.panel.hide_cmd()
	B.key = Callable(); B.click = Callable(); B.pickCard = Callable(); B.redraw = Callable(); B.tgtList = null; B.pv = Callable()
	_hint("")
	if nob: B.bpUse = 0
	var use := clampi(B.bpUse, 0, mini(3, u.bp))
	if use: u.bp -= use; u.boosted = true
	B.bpUse = use; bt.panel.render_cards()
	var r = await fn.call(use)
	var L = _L()
	if L: L.after_action(u, use)
	B.bpUse = 0
	resolved.emit(r)

func _set_bp(d: int) -> void:
	var n := clampi(B.bpUse + d, 0, mini(3, u.bp))
	if n != B.bpUse:
		B.bpUse = n; bt.sfx("select", 0.6, 1 + n * 0.15); bt.panel.render_cards()
		if B.redraw.is_valid(): B.redraw.call()

# ── 通用菜单 ──
func _menu(title: String, rows: Array, back: Callable, on_sel: Callable) -> void:
	var sel := 0
	if not _L():
		for i in rows.size():
			if not rows[i].get("dis"): sel = i; break
	m = {"title": title, "rows": rows, "back": back, "on_sel": on_sel, "sel": sel}
	B.redraw = _menu_draw
	_menu_draw()
	B.key = _menu_key

func _menu_draw() -> void:
	var rows: Array = m.rows
	bt.panel.show_menu(u, m.title, rows, m.sel, m.title != "道具", {
		"pick": _pick, "hover": _hover, "bp": _set_bp, "pip": _pip})
	var r = rows[m.sel] if m.sel < rows.size() else null
	_hint(r.desc if r != null and r.get("desc", "") != "" else "")
	var L = _L()
	if L: L.on_menu(u, m.title, rows, m.sel)

func _hover(i: int) -> void:
	if i != m.sel and (not m.rows[i].get("dis") or _L()):
		m.sel = i; _menu_draw()

## 铜钱按钮：点第 i 枚 = 从这枚起投入（再点同一档取消）
func _pip(i: int) -> void:
	if i >= u.bp: return
	var want: int = u.bp - i
	_set_bp((0 if want == B.bpUse else want) - B.bpUse)

func _pick(i: int, source := "keyboard") -> void:
	var rows: Array = m.rows
	var L = _L()
	if rows[i].get("dis"):
		bt.sfx("menu_close", 0.5)
		if L: L.wrong(u, rows[i])
		return
	if L: L.confirm(u, rows[i].val, source)
	bt.sfx("select")
	m.on_sel.call(rows[i].val)

func _menu_key(k: String) -> void:
	var rows: Array = m.rows
	if k == "up" or k == "down":
		var d := -1 if k == "up" else 1
		var i: int = m.sel
		for n in rows.size():
			i = (i + d + rows.size()) % rows.size()
			if not rows[i].get("dis") or _L(): break
		m.sel = i; _menu_draw(); bt.sfx("blip", 0.6)
	elif k == "ok": _pick(m.sel)
	elif k == "back" and m.back.is_valid(): bt.sfx("menu_close", 0.6); m.back.call()
	elif k == "left" or k == "bm": _set_bp(-1)
	elif k == "right" or k == "bp": _set_bp(1)
	elif k[0] == "n":
		var j := int(k.substr(1)) - 1
		if j < rows.size() and (not rows[j].get("dis") or _L()): m.sel = j; _menu_draw(); _pick(j)

# ── 目标选择 ──
func _target(side: String, all: bool, back: Callable, go: Callable, desc: String) -> void:
	var list: Array = bt.rules.alive_of(side)
	if list.is_empty(): back.call(); return
	bt.panel.hide_cmd()
	B.tgtList = list; B.tgtAll = all
	B.tsel = 0 if side == "foe" else maxi(0, bt.rules.idx(list, u))
	tg = {"side": side, "all": all, "list": list, "back": back, "go": go, "desc": desc}
	B.redraw = _info
	_info()
	B.key = _tgt_key
	B.click = func(x, y):
		var hit = bt.rules.unit_at(x, y)
		if hit != null and bt.rules.has(list, hit):
			if all or is_same(list[B.tsel], hit): _ok2("mouse")
			else: B.tsel = bt.rules.idx(list, hit); _info()
	B.pickCard = func(hit):
		if all or is_same(list[B.tsel], hit): _ok2("mouse")
		else: B.tsel = bt.rules.idx(list, hit); _info()

func _fin() -> Array:
	var tl: Array = B.tgtList
	B.tgtList = null; B.click = Callable(); B.pickCard = Callable(); B.pv = Callable()
	return tl

func _info() -> void:
	var list: Array = tg.list; var t: Dictionary = list[B.tsel]
	var HL := Color("#f3d58e"); var DM := Color("#a8987c"); var TX := Color("#f0e2c4")
	var s := [[tg.desc, HL, 17, BD.fb()], ["·", DM, 12]]
	if tg.all: s.append(["全体敌人" if tg.side == "foe" else "全体同伴", TX, 14])
	else:
		s.append([str(t.name), TX, 14])
		if tg.side == "foe":
			var ws := []
			for w in t.weak: ws.append(w if t.known.has(w) else "?")
			s.append([" ", TX, 14]); s.append(["", TX, 14, null, ws])
	if tg.side == "foe" and B.pv is Callable and B.pv.is_valid():
		var v = B.pv.call(B.bpUse)
		var ts: Array = list if tg.all else [t]
		if v != null:
			var lo := 1 << 30; var hi := 0; var wk := false
			for x in ts:
				var e := Stats.est_dmg(u, x, v); lo = mini(lo, e); hi = maxi(hi, e)
				if Stats.hits_weak(x, v): wk = true
			s.append(["·", DM, 12])
			s.append(["预计 %d%s%s" % [lo, ("~" + str(hi)) if hi != lo else "", (" ×" + str(v.hits)) if v.hits > 1 else ""], Color("#fff3e0"), 14])
			if wk: s.append([" 弱点！", Color("#ffe25a"), 14, null, "blink"])
		else: s.append([" · 辅助 · 不造成伤害", DM, 12])
	s.append([" · 蓄势 %d" % B.bpUse, DM, 12])
	if _L(): s.append([" · Enter 确认 / Esc 返回", TX, 14])
	_hint(s)
	bt.panel.render_cards()
	var L = _L()
	if L: L.on_target(u, t)

func _ok2(source := "keyboard") -> void:
	var tl := _fin()
	var L = _L()
	if L: L.confirm(u, "target", source)
	bt.sfx("select")
	tg.go.call(tl if tg.all else [tl[B.tsel]])

func _tgt_key(k: String) -> void:
	var list: Array = tg.list
	if k == "left" or k == "up":
		if not tg.all: B.tsel = (B.tsel - 1 + list.size()) % list.size(); bt.sfx("blip", 0.6)
		_info()
	elif k == "right" or k == "down":
		if not tg.all: B.tsel = (B.tsel + 1) % list.size(); bt.sfx("blip", 0.6)
		_info()
	elif k == "ok": _ok2()
	elif k == "back": _fin(); bt.sfx("menu_close", 0.6); tg.back.call()
	elif k == "bm": _set_bp(-1)
	elif k == "bp": _set_bp(1)

# ── 主菜单 / 武学 / 道具 ──
func _main() -> void:
	B.tgtList = null
	var opt: Dictionary = B.opt
	var flee: bool = not opt.get("boss") and not opt.get("tutorial") and not opt.get("noFlee")
	var inv := []
	var bag: Dictionary = G.S.get("bag", {})
	for k in bag:
		var it := Stats.item(k)
		if bag[k] > 0 and not it.is_empty() and (it.get("heal") or it.get("mp")): inv.append([k, bag[k]])
	var rows := [
		{"label": "攻击", "val": "atk", "ico": [u.atkType] if u.get("atkType") else [], "right": u.atkName,
			"desc": "以%s出手%s· 蓄势可连击 %d 次" % [u.atkName, ("（" + u.atkType + "）") if u.get("atkType") else "", 1 + B.bpUse]},
		{"label": "武学", "val": "sk", "ico": ["武"], "dis": u.skills.is_empty(), "desc": "施展所学武功"},
		{"label": "道具", "val": "it", "ico": ["药"], "dis": inv.is_empty(), "desc": "使用行囊中的药物"},
		{"label": "防御", "val": "def", "ico": ["守"], "desc": "本回合受伤减半，下回合率先行动"}]
	if flee: rows.append({"label": "逃跑", "val": "run", "ico": ["走"], "desc": "试图脱离战斗"})
	_menu("第 %d 回合" % B.round, rows, Callable(), _main_sel.bind(inv))

func _main_sel(v: String, inv: Array) -> void:
	if v == "atk":
		B.pv = func(bp): return {"t": u.atkType, "pow": 1, "hits": 1 + bp}
		_target("foe", false, _main, func(t): _done(func(bp): return await bt.rules.do_attack(u, t[0], bp)), u.atkName + ((" ×%d" % (1 + B.bpUse)) if B.bpUse else ""))
	elif v == "sk": _skills()
	elif v == "it": _items(inv)
	elif v == "def": _done(_defend, true)
	elif v == "run": _done(_run, true)

func _defend(_bp):
	u.defend = true; u.prio = true; bt.rules.float_txt(u, "防御", Color("#9fd4ee"), 22)
	await bt.wait(450)
	return null

func _run(_bp):
	var fs: Array = bt.rules.alive_of("foe"); var ps: Array = bt.rules.alive_of("ally")
	var p := clampf(55 + (_avg(ps, "spd") - _avg(fs, "spd")) * 6, 20, 90)
	if randf() * 100 < p: bt.sfx("whoosh"); return "flee"
	bt.rules.float_txt(u, "逃跑失败", Color("#aaa"), 22)
	await bt.wait(600)
	return null

static func _avg(l: Array, k: String) -> float:
	if l.is_empty(): return 0.0
	var s := 0.0
	for x in l: s += float(x.get(k, 0))
	return s / l.size()

func _skills() -> void:
	var rows := []
	for k in u.skills:
		var sk := Stats.skill(k); var bi := Stats.bsk(k)
		var need := Stats.skill_why(u, k)
		var cost := Stats.skill_cost(u, k); var lack: bool = u.mp < cost
		var ico := [bi.get("t") if bi.get("t") else ("医" if sk.get("heal") or bi.get("buff") else "内")]
		if bi.get("e"): ico.append(bi.e)
		rows.append({"label": sk.get("name", k), "val": k, "ico": ico, "right": ("%d内" % cost) if cost else "", "right_col": Color("#e0604a") if lack else Color("#8cc8ff"),
			"why": need if need != "" else ("内力不足" if lack else ""), "dis": lack or need != "", "desc": str(sk.get("desc", "")) + (("（%s）" % need) if need != "" else "")})
	_menu("武学", rows, _main, func(k):
		var bi := Stats.bsk(k)
		var t: String = bi.get("tgt", "ally" if Stats.skill(k).get("heal") else "foe")
		var go := func(ts): _done(func(bp): await bt.rules.do_skill(u, k, ts, bp))
		B.pv = func(bp): return Stats.skill_pv(u, k, bp)
		if t == "self": go.call([u])
		else: _target("foe" if t == "foe" or t == "foes" else "ally", t == "foes" or t == "allies", _skills, go, Stats.skill(k).get("name", k)))

func _items(inv: Array) -> void:
	var rows := []
	for e in inv:
		var it := Stats.item(e[0])
		rows.append({"label": it.get("name", e[0]), "val": e[0], "item": e[0], "right": "×" + str(e[1]), "desc": it.get("desc", "")})
	_menu("道具", rows, _main, func(k):
		_target("ally", false, func(): _items(inv), func(t): _done(func(_bp): await _use_item(k, t[0]), true), Stats.item(k).get("name", k)))

func _use_item(k: String, x: Dictionary):
	var it := Stats.item(k)
	G.S.bag[k] = int(G.S.bag[k]) - 1
	await bt.rules.mo.lunge(u, x, 0.3)
	if it.get("heal"): bt.rules.heal(x, Stats.acc_heal("hero" if x.get("isHero") else str(x.get("key", "")), int(it.heal)))
	if it.get("mp"):
		x.mp = mini(x.mmp, x.mp + int(it.mp)); bt.rules.float_txt(x, "内力+" + str(it.mp), Color("#8cf"), 22)
	bt.panel.render_cards()
	await bt.wait(500)
	return null
