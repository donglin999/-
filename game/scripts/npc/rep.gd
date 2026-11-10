extends RefCounted
## 门派关系与声誉（原版 js/qihe-jianghu-rep.js，window.QiheJianghu）＋ 地图提示（js/qihe-jianghu-slips.js，QiheJianghuSlips）。
## 存档：S.jianghu = {ver:2, fame, faction:{<门派>:{score,met,hostile,greetSeg,mendSeg}}, bossHit, fameOnce, log:[]}
const U := preload("res://scripts/npc/util.gd")

var npc: Node
var D: Dictionary = {}
var listeners := {}     # type → Array[Callable]

func _init(owner: Node) -> void:
	npc = owner
	var d = DB.g("QiheJianghuData")
	D = d if d is Dictionary else {}
	# 原版文件末尾：on('steal_caught',p=>settle('steal_caught',p))
	on("steal_caught", func(p): settle("steal_caught", p))

func _clamp(n, lo: float, hi: float) -> int:
	return int(maxf(lo, minf(hi, U.jround(U.num(n)))))

func seg() -> String:
	var S: Dictionary = G.S
	for v in [S.get("segmentId"), U.dig(S, "prologue.segment"), S.get("scene")]:
		if U.t(v): return U.js(v)
	return "kaishi"

func part() -> String:
	var S: Dictionary = G.S
	for v in [U.dig(S, "prologue.part"), S.get("part")]:
		if U.t(v): return str(v)
	return "kaishi"

func ensure() -> Dictionary:
	var S: Dictionary = G.S
	if not (S.get("jianghu") is Dictionary): S.jianghu = {}
	var j: Dictionary = S.jianghu
	if not U.t(j.get("ver")) or U.num(j.get("ver")) < 2:
		if j.get("fame") == null: j.fame = _clamp(U.num(j.get("xia")) - U.num(j.get("e")), -100, 100)
		j.ver = 2
	if not (j.get("faction") is Dictionary): j.faction = {}
	for id in D.get("FACTIONS", {}):
		var f: Dictionary = j.faction.get(id) if j.faction.get(id) is Dictionary else {}
		j.faction[id] = {"score": _clamp(U.nz(f.get("score"), 0), -100, 100), "met": U.t(f.get("met")), "hostile": U.t(f.get("hostile")),
			"greetSeg": f.get("greetSeg") if U.t(f.get("greetSeg")) else null, "mendSeg": f.get("mendSeg") if U.t(f.get("mendSeg")) else null}
	j.fame = _clamp(U.nz(j.get("fame"), 0), -100, 100)
	if not (j.get("bossHit") is Dictionary): j.bossHit = {}
	if not (j.get("fameOnce") is Dictionary): j.fameOnce = {}
	var lg: Array = j.log if j.get("log") is Array else []
	j.log = lg.slice(maxi(0, lg.size() - 60))
	return j

func on(type: String, fn: Callable) -> Callable:
	if not listeners.has(type): listeners[type] = []
	listeners[type].append(fn)
	return func(): listeners[type].erase(fn)

func emit(type: String, payload: Dictionary = {}) -> void:
	for fn in listeners.get(type, []).duplicate(): fn.call(payload)

func _toast(text: String) -> void: UI.toast(text, 2100)

func _log(kind: String, id: String, delta: int, reason, n) -> void:
	var j := ensure()
	if delta == 0: return
	j.log.append({"seg": seg(), "kind": kind, "id": id, "delta": delta, "reason": "" if reason == null else str(reason), "npc": n if U.t(n) else null})
	j.log = j.log.slice(maxi(0, j.log.size() - 60))

func _limits(kind: String) -> Array:
	var l = D.PART_LIMITS.get(part(), {}).get(kind) if D.PART_LIMITS.get(part()) is Dictionary else null
	return l if l is Array else [-100, 100]

func bound_for_faction(id: String) -> Array:
	var lim := _limits("faction")
	var fl = D.FACTIONS.get(id, {}).get("floor")
	return [maxf(lim[0], U.num(fl, -100) if fl != null else -100.0), lim[1]]

func amount_of(spec, p: Dictionary) -> float:
	if typeof(spec) in [TYPE_INT, TYPE_FLOAT]: return float(spec)
	if spec is Dictionary:
		if U.t(spec.get("from")): return U.num(p.get(spec.from))
		if U.t(spec.get("by")):
			var key = p.get(spec.by)
			var ks := "undefined" if key == null else (U.js(key) if typeof(key) != TYPE_BOOL else ("true" if key else "false"))
			return U.num(spec.get("map", {}).get(ks))
	return 0.0

func apply_fame(delta: float, reason, n) -> int:
	var j := ensure()
	var before: int = j.fame
	var lim := _limits("fame")
	j.fame = _clamp(before + delta, lim[0], lim[1])
	var actual: int = j.fame - before
	_log("fame", "fame", actual, reason, n)
	return actual

func apply_faction(id, delta: float, reason, n) -> int:
	if id == null or not D.FACTIONS.has(str(id)): return 0
	var j := ensure()
	var f: Dictionary = j.faction[id]
	var before: int = f.score
	var lim := bound_for_faction(id)
	f.score = _clamp(before + delta, lim[0], lim[1])
	f.met = true
	f.hostile = f.score <= -11
	var actual: int = f.score - before
	_log("faction", id, actual, reason, n)
	return actual

## 个人好感折算到门派：按职级权重相除
func fold(npc_id, delta: float, reason) -> int:
	var m = D.MEMBERS.get(npc_id)
	if not (m is Dictionary) or not U.t(m.get("faction")): return 0
	if U.t(m.get("hidden")) and not U.t(U.dig(G.S, "flags.jianghuLinguanshiRevealed")): return 0
	var weight := U.num(D.RANK_WEIGHT.get(m.get("rank")), 0)
	if weight == 0: weight = 10
	var a := absf(delta) / weight
	if delta > 0 and a < 1: return 0
	var n := int(signf(delta)) * U.jround(a)
	if delta < 0 and n == 0: n = -1
	if n != 0: apply_faction(m.faction, n, reason, npc_id)
	return n

## 牵连掌门：同一段只算一次（once==='segment'）
func implicate(npc_id, delta: float, reason, once) -> int:
	var m = D.MEMBERS.get(npc_id)
	if not (m is Dictionary): return 0
	var boss = m.boss if m.has("boss") else D.FACTIONS.get(m.get("faction"), {}).get("boss")
	if not U.t(boss) or not U.t(m.get("faction")): return 0
	var id: String = str(m.faction) + ":" + seg()
	if once == "segment" and ensure().bossHit.get(id) == seg(): return 0
	if once == "segment": ensure().bossHit[id] = seg()
	return apply_faction(m.faction, delta, reason, boss)

func run_op(op: Dictionary, p: Dictionary) -> int:
	var npc_id = p.get("npcId") if U.t(p.get("npcId")) else p.get("id")
	var reason = p.get("reason") if U.t(p.get("reason")) else p.get("type")
	var delta := amount_of(op.get("amount"), p)
	match op.get("op"):
		"fame": return apply_fame(delta, reason, npc_id)
		"faction":
			var fid = D.MEMBERS.get(npc_id, {}).get("faction") if D.MEMBERS.get(npc_id) is Dictionary else null
			return apply_faction(fid if U.t(fid) else p.get("faction"), delta, reason, npc_id)
		"fold": return fold(npc_id, delta, reason)
		"implicate": return implicate(npc_id, delta, reason, op.get("once"))
		"bond":
			emit("bond_change", {"npcId": npc_id, "delta": delta, "reason": op.get("reason") if U.t(op.get("reason")) else reason})
			return 0
		"factionSet":
			var id = p.get("faction") if U.t(p.get("faction")) else p.get("id")
			if id == null or not D.FACTIONS.has(str(id)): return 0
			var cur_sc = ensure().faction.get(id, {}).get("score", 0)
			return apply_faction(id, U.num(op.get("value")) - U.num(cur_sc), reason, npc_id)
		"factionMany":
			var sum := 0
			var many = p.get(op.get("from"))
			if many is Dictionary:
				for id in many: sum += apply_faction(id, U.num(many[id]), reason, npc_id)
			return sum
	return 0

func settle(type: String, payload: Dictionary = {}) -> Dictionary:
	var rules = D.EVENT_RULES.get(type)
	if not (rules is Array): return {"ok": false, "changed": 0}
	var j := ensure()
	var changed := 0
	var mark: int = j.log.size()
	var before := {}
	for id in D.FACTIONS:
		var st = stage(id)
		before[id] = st.name if st else null
	var fame_before: String = fame_level().name
	for op in rules:
		var key := type + ":" + (str(payload.get("npcId")) if U.t(payload.get("npcId")) else "")
		if op.get("once") == "npc" and U.t(j.fameOnce.get(key)): continue
		var p := U.copy(payload); p.type = type
		var result := run_op(op, p)
		if op.get("once") == "npc": j.fameOnce[key] = true
		changed += result
	var fresh: Array = j.log.slice(mini(mark, j.log.size()))
	if fresh.size(): notify(fresh, before, fame_before)
	return {"ok": true, "changed": changed, "jianghu": j}

## 2026-10-27 右上纸签：同一下的变化按势力合并，跨档加朱印；没有纸签模块时退回一行 toast
func notify(fresh: Array, before: Dictionary, fame_before: String) -> void:
	var order: Array = []
	var sum := {}
	for e in fresh:
		var k: String = "fame" if e.kind == "fame" else str(e.id)
		if not sum.has(k): sum[k] = {"delta": 0, "reason": e.reason}; order.append(k)
		sum[k].delta += int(e.delta)
	var rows: Array = []
	for k in order:
		var o: Dictionary = sum[k]
		if o.delta == 0: continue
		var fame: bool = k == "fame"
		var f = D.FACTIONS.get(k)
		var now = fame_level().name if fame else (stage(k).name if stage(k) else null)
		var was = fame_before if fame else before.get(k)
		var cross := ""
		if U.t(now) and U.t(was) and now != was: cross = ("落入" if o.delta < 0 else "升至") + str(now)
		rows.append({"glyph": "名" if fame else (f.get("glyph", "？") if f is Dictionary else "？"),
			"name": "声誉" if fame else (f.get("name", "关系") if f is Dictionary else "关系"),
			"delta": o.delta, "reason": str(D.get("REASON_TEXT", {}).get(o.reason, "")), "cross": cross,
			"color": "#3a3a32" if fame else (f.get("color") if f is Dictionary else null)})
	if rows.is_empty(): return
	slips(rows)

func stage(fid):
	var f = ensure().faction.get(fid)
	if not (f is Dictionary): return null
	for st in D.STAGES:
		if f.score >= st.min:
			return {"id": st.id, "name": st.name, "score": f.score, "hostile": U.t(st.get("hostile")), "met": f.met}
	return null

func fame_level() -> Dictionary:
	var score: int = ensure().fame
	for st in D.FAME_STAGES:
		if score >= st.min: return {"id": st.id, "name": st.name, "score": score, "abs": absi(score)}
	return {"id": "", "name": "", "score": score, "abs": absi(score)}

## 个人好感（S.bond 或 S.qiheBond，数或 {score}）
func _personal(npc_id) -> float:
	var v = U.dig(G.S, "bond." + str(npc_id))
	if v == null: v = U.dig(G.S, "qiheBond." + str(npc_id))
	if v is Dictionary: v = v.get("score")
	return U.num(v)

func gate(npc_id, act: String) -> Dictionary:
	var m = D.MEMBERS.get(npc_id)
	if not (m is Dictionary): return {"ok": true, "why": null}
	var fs = stage(m.faction) if U.t(m.get("faction")) else null
	var fg = D.GATE.get(fs.id, {}).get(act) if fs and D.GATE.get(fs.id) is Dictionary else null
	if U.t(fg): return {"ok": false, "why": fg}
	var personal := _personal(npc_id)
	if personal <= -50: return {"ok": false, "why": "bond_hostile"}
	if personal <= -20: return {"ok": false, "why": "bond_hate"}
	return {"ok": true, "why": null}

## 价钱倍率：门派档、个人好感、声誉三者取最大；都没有返回 null
func price_mul(npc_id):
	var m = D.MEMBERS.get(npc_id)
	var f = stage(m.faction) if m is Dictionary and U.t(m.get("faction")) else null
	var p := _personal(npc_id)
	var cands: Array = [
		D.GATE.get(f.id, {}).get("priceMul") if f and D.GATE.get(f.id) is Dictionary else null,
		1.1 if p <= -20 else (0.85 if p >= 80 else (0.9 if p >= 50 else null)),
		D.FAME_GATE.get(fame_level().id, {}).get("priceMul") if D.FAME_GATE.get(fame_level().id) is Dictionary else null]
	var best = null
	for x in cands:
		if typeof(x) in [TYPE_INT, TYPE_FLOAT] and is_finite(x): best = float(x) if best == null else maxf(best, x)
	return best

func first_meet(npc_id) -> int:
	var m = D.MEMBERS.get(npc_id)
	var f = stage(m.faction) if m is Dictionary and U.t(m.get("faction")) else null
	var a := U.num(D.GATE.get(f.id, {}).get("firstMeet") if f and D.GATE.get(f.id) is Dictionary else 0)
	var g = D.FAME_GATE.get(fame_level().id)
	var b := U.num(g.get("firstMeet") if g is Dictionary else 0)
	return _clamp(a + b, -10, 10)

func migrate() -> Dictionary: return ensure()

# ════════ 地图提示（js/qihe-jianghu-slips.js） ════════
func sign(n) -> String: return ("+" if n > 0 else "−") + str(absi(int(n)))

var _box: Control = null
func _slip_box() -> Control:
	if _box == null or not is_instance_valid(_box):
		_box = Control.new(); _box.name = "qj-slips"
		_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_box.z_index = 40
		UI.root.add_child(_box)
	return _box

## 右上纸签排版：#qj-slips{right:3.2%;top:22%;flex-direction:column;align-items:flex-end;gap:8px}
func _slip_layout() -> void:
	if _box == null or not is_instance_valid(_box): return
	var y := 720.0 * 0.22
	for el in _box.get_children():
		var sz: Vector2 = el.get_combined_minimum_size()
		el.size = sz
		el.position = Vector2(1280.0 * (1 - 0.032) - sz.x + float(el.get_meta("shift", 0.0)), y)
		y += sz.y + 8

func _lbl(t: String, f: Font, px: int, col: Color, sp_px := 1.0) -> Label:
	var l := Label.new(); l.text = t
	l.add_theme_font_override("font", Paint.font(f, px, sp_px / px))
	l.add_theme_font_size_override("font_size", px)
	l.add_theme_color_override("font_color", col)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l

## 右上纸签：rows=[{glyph,name,delta,reason,cross,color}]；滑入 .3s，停 4 秒，收起 .4s；最多留 4 条
func slips(rows: Array) -> void:
	if UI.root == null or rows.is_empty(): return
	var b := _slip_box()
	for r in rows:
		var el := MarginContainer.new()
		el.mouse_filter = Control.MOUSE_FILTER_IGNORE
		for s in [["left", 8], ["right", 30], ["top", 7], ["bottom", 7]]: el.add_theme_constant_override("margin_" + s[0], s[1])
		# 底：横向渐变纸 + 右端燕尾缺口（clip-path）＋ 阴影 0 2px 6px
		el.draw.connect(func():
			var w := el.size.x; var h := el.size.y
			var pts := PackedVector2Array([Vector2(0, 0), Vector2(w, 0), Vector2(w - 14, h / 2), Vector2(w, h), Vector2(0, h)])
			el.draw_colored_polygon(PackedVector2Array([Vector2(0, 2), Vector2(w, 2), Vector2(w - 14, h / 2 + 2), Vector2(w, h + 2), Vector2(0, h + 2)]), Color(0, 0, 0, 0.18))
			var c0 := Color(244 / 255.0, 236 / 255.0, 218 / 255.0, 0.97); var c1 := Color(234 / 255.0, 224 / 255.0, 200 / 255.0, 0.95)
			el.draw_polygon(pts, PackedColorArray([c0, c1, c1.lerp(c0, 14.0 / maxf(w, 1)), c1, c0])))
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		row.alignment = BoxContainer.ALIGNMENT_BEGIN
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		el.add_child(row)
		# .qj-g 30×30 色块门派字
		var g := Panel.new(); g.custom_minimum_size = Vector2(30, 30); g.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var sb := StyleBoxFlat.new(); sb.bg_color = Color(str(r.get("color") if r.get("color") else "#3a3a32"))
		sb.set_corner_radius_all(2); sb.border_color = Color(1, 1, 1, 0.18); sb.set_border_width_all(2)
		g.add_theme_stylebox_override("panel", sb)
		var gl := _lbl(str(r.glyph), UI.song, 17, Color("#f3ead4"))
		gl.set_anchors_preset(Control.PRESET_FULL_RECT)
		gl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; gl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		g.add_child(gl); row.add_child(g)
		row.add_child(_lbl(str(r.name), UI.song_bold, 19, Color("#2b2620"), 3))
		row.add_child(_lbl(sign(r.delta), UI.song_bold, 18, Color("#a3392b") if r.delta < 0 else Color("#3f6a45")))
		# span：13px 灰字，左侧 1px 竖线，padding-left 9px
		var sp := MarginContainer.new(); sp.add_theme_constant_override("margin_left", 9); sp.mouse_filter = Control.MOUSE_FILTER_IGNORE
		sp.add_child(_lbl(str(r.get("reason", "")), UI.song, 13, Color("#6b6152")))
		sp.draw.connect(func(): sp.draw_line(Vector2(0.5, 0), Vector2(0.5, sp.size.y), Color(80 / 255.0, 70 / 255.0, 55 / 255.0, 0.35), 1))
		row.add_child(sp)
		if U.t(r.get("cross")):
			# u：朱印，宽 2.4em、旋转 -6°
			var u := PanelContainer.new(); u.mouse_filter = Control.MOUSE_FILTER_IGNORE
			var us := StyleBoxFlat.new(); us.bg_color = Color("#9b2f25"); us.border_color = Color("#f0d9c2"); us.set_border_width_all(1)
			us.set_content_margin_all(3); u.add_theme_stylebox_override("panel", us)
			var ul := _lbl(str(r.cross), UI.song, 13, Color("#f6e8d6"))
			ul.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY; ul.custom_minimum_size.x = 13 * 2.4 - 6
			ul.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			u.add_child(ul); u.rotation = deg_to_rad(-6)
			row.add_child(u)
		el.modulate.a = 0; el.set_meta("shift", 40.0)
		b.add_child(el)
		var tw := el.create_tween().set_parallel().set_ease(Tween.EASE_IN_OUT).set_trans(Tween.TRANS_CUBIC)
		tw.tween_property(el, "modulate:a", 1.0, 0.3)
		tw.tween_method(func(v): el.set_meta("shift", v); _slip_layout(), 40.0, 0.0, 0.3)
		var out := el.create_tween()
		out.tween_interval(4.0)
		out.tween_property(el, "modulate:a", 0.0, 0.3)
		out.parallel().tween_method(func(v): if is_instance_valid(el): el.set_meta("shift", v); _slip_layout(), 0.0, 30.0, 0.3)
		out.tween_interval(0.1)
		out.tween_callback(func(): el.queue_free(); _slip_layout.call_deferred())
	while b.get_child_count() > 4:
		var c := b.get_child(0); b.remove_child(c); c.queue_free()
	_slip_layout.call_deferred()

## 头顶小签：跟着人物在画面上的位置（人物站着不走，取一次位置即可）。2.6s 后淡出
func head(npc_id: String, text: String, kind: String = "") -> void:
	if UI.root == null or World.cur.is_empty(): return
	var names: Array = DB.g("QIHE_NPC_DATA").get("PEOPLE", {}).get(npc_id, {}).get("npc", [])
	var n = null
	for x in World.npcs:
		if x.get("id") == npc_id or names.has(x.get("name")): n = x; break
	if n == null: return
	var h: float = World.npc_h(n)
	var wp := Vector2(float(n.x) * World.TS, float(n.y) * World.TS - h)
	var sp: Vector2 = World.get_global_transform() * wp / 0.75   # 960 逻辑 → 1280 界面
	var el := PanelContainer.new(); el.mouse_filter = Control.MOUSE_FILTER_IGNORE; el.z_index = 39
	var sb := StyleBoxFlat.new(); sb.bg_color = Color(22 / 255.0, 24 / 255.0, 20 / 255.0, 0.86)
	sb.border_color = Color(226 / 255.0, 194 / 255.0, 124 / 255.0, 0.65); sb.set_border_width_all(1)
	sb.content_margin_left = 8; sb.content_margin_right = 8; sb.content_margin_top = 2; sb.content_margin_bottom = 2
	el.add_theme_stylebox_override("panel", sb)
	var col := Color("#ffd5c8") if kind == "neg" else (Color("#d8f0c8") if kind == "pos" else Color("#f1e6cf"))
	el.add_child(_lbl(text, UI.song, 14, col))
	UI.root.add_child(el)
	var sz := el.get_combined_minimum_size(); el.size = sz
	var y0 := sp.y - 18 - 6
	el.position = Vector2(sp.x - sz.x / 2, y0); el.modulate.a = 0
	var tw := el.create_tween().set_parallel()
	tw.tween_property(el, "modulate:a", 1.0, 0.25)
	tw.tween_property(el, "position:y", y0 - 8, 0.25)
	var out := el.create_tween()
	out.tween_interval(2.6)
	out.tween_property(el, "modulate:a", 0.0, 0.25)
	out.parallel().tween_property(el, "position:y", y0, 0.25)
	out.tween_interval(0.15)
	out.tween_callback(el.queue_free)
