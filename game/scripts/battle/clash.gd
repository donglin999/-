extends "res://scripts/battle/lesson.gd"
## 领队交锋（原版 js/qihe-faction-clash.js）：章节「起火」前的 NPC 旁观演出，玩家不操作，不改存档。
## 作为 storyLesson 交给 battle.gd 的剧情战斗流程（原版 battle({factionClash, storyLesson:{allies,foes,mount,run,clear}})）。
## 规则见 clash_rules.gd；喊话台词取自原版数据 QiheClashData.dialogue（原版即如此，不在 ink 里）。
## 专属招式特效 WuxiaFX（faction-fx/wuxia-fx.js + fx-am.js + fx-qihe-clash-v2.js）见 fx_wuxia.gd / fx_am.gd / fx_clash_v2.gd，
## 接线照原版 startFx / tick / paint（back 层在背景之后、单位之前；front 层在特效层之后）。

const R := preload("res://scripts/battle/clash_rules.gd")
const BD := preload("res://scripts/battle/bdraw.gd")
const WuxiaFX := preload("res://scripts/battle/fx_wuxia.gd")
const FxStore := preload("res://scripts/battle/fx_store.gd")
const FxLayer := preload("res://scripts/battle/fx_layer.gd")
const PORTRAIT := {"xu": "p_qh_xulingyi_story", "cen": "p_qh_censhuang_story", "shen": "p_qh_shenyanhui_story"}
const BG := "bb_qh_faction_clash_20261012"
const OWN_FX := ["am_s3", "cs_whip_s1", "cs_whip_s2"]
## 原版 ready()：await Promise.all(['am_v1','kit_v1','clash_v2'].map(k=>WuxiaFX.load(QiheClashFxRoot+k+'/')))
const FX_DIRS := ["am_v1", "kit_v1", "clash_v2"]
static var _fx_loaded := false

var state = null
var caption = null          # {who, text, key}
var overlay: Control
var mark_seen := {}
var mark_flash := []
## 原版 fx / active / last
var fx = null
var active = null
var last := 0.0
var fx_back: Node2D
var fx_front: Node2D

func _init() -> void:
	mounted = false

# ── storyLesson 接口 ──
func allies() -> Array: return state.units.values().filter(func(u): return u.side == "ally")
func has_foes() -> bool: return true
func foes() -> Array: return state.units.values().filter(func(u): return u.side == "foe")
func has_run() -> bool: return true
func has_plan_intent() -> bool: return false

## play()：原版 battle({factionClash:true, storyLesson, foes:[], bg, allowAuto:false, noLose, noFlee})；结束后核对玩家状态没被改动
static func play(bt) -> String:
	_fx_ready()
	var L = load("res://scripts/battle/clash.gd").new()
	L.state = R.create()
	for u in L.state.units.values(): u._buiHov = false
	# 先刷一次 HUD：HUD 会惰性补全 questTrack 等字段（不是演出改的），放在快照之前，免得误报
	UI.hud()
	var snap: Dictionary = G.S.duplicate(true) if G.S != null else {}
	var keys := []
	for u in L.state.units.values(): keys.append(u.art)
	var ports: Array = PORTRAIT.values()
	var r: String = await bt.start({"factionClash": true, "storyLesson": L, "foes": [], "bg": BG, "allowAuto": false, "noLose": true, "noFlee": true,
		"preloadArts": keys, "preloadPorts": ports})
	if G.S != null:
		var diff := []
		for k in G.S:
			if not snap.has(k) or JSON.stringify(G.S[k]) != JSON.stringify(snap[k]): diff.append(k)
		if diff.size(): push_error("旁观演出意外改动了玩家状态：" + ",".join(diff))
	return r

## ready() 的特效部分：三套素材各读一次 manifest（所有实例共用），并注册各门派编排（原版由 index.html 的 script 标签注册）
static func _fx_ready() -> void:
	if _fx_loaded: return
	for k in FX_DIRS: FxStore.load_dir(FxStore.CLASH_FX_ROOT + k + "/")
	preload("res://scripts/battle/fx_am.gd").register()
	preload("res://scripts/battle/fx_gj.gd").register()
	preload("res://scripts/battle/fx_clash_v2.gd").register()
	_fx_loaded = true

## mount()：body.qh-faction-clash 隐藏 #bt-auto/#bt-cmd/#bt-help/#toast；加「侧口交锋 · 旁观」标题与喊话框
func mount(b) -> void:
	bt = b
	overlay = Control.new()
	overlay.size = Vector2(960, 540); overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	overlay.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	overlay.draw.connect(_draw_overlay)
	bt.layer_ui.add_child(overlay)
	# 原版 ready()：fx=new WuxiaFX(null,{overlay:true}); fx.quiet=true
	# 原版改写 drawBattleBg（originalBg → tick → paint('back')）与 VFX.draw（originalFx → paint('front') → drawMarks）
	fx = WuxiaFX.new(true); fx.quiet = true
	var v = bt.view
	fx_back = FxLayer.new(); fx_back.tick = _tick
	fx_back.source = func(): return _paint("back")
	v.add_child(fx_back); v.move_child(fx_back, v.bg_node.get_index() + 1)
	fx_front = FxLayer.new(); fx_front.source = func(): return _paint("front")
	v.add_child(fx_front); v.move_child(fx_front, v.fx_node.get_index() + 1)

func clear() -> void:
	mark_flash.clear(); mark_seen.clear(); caption = null
	active = null
	if fx != null: fx.reset()
	for n in [fx_back, fx_front]:
		if is_instance_valid(n): n.queue_free()
	fx_back = null; fx_front = null
	if is_instance_valid(overlay): overlay.queue_free()
	overlay = null

## 调试：-- --clash-timeline 时打印每句喊话、每一步开始的时刻（以第一句喊话为零点，毫秒），与原版 tools/clash_timeline_web.cjs 对照节奏
var _tl0 := -1
func _timeline(what: String) -> void:
	if not "--clash-timeline" in OS.get_cmdline_user_args(): return
	if _tl0 < 0:
		_tl0 = Time.get_ticks_msec()
		# 无头不限帧时约 144 帧，每次等待几乎不超时；原版浏览器 60 帧下每次等待要晚 3–30ms（常见约 10ms）。按 60 帧测才和实际游玩、原版同口径
		if Engine.max_fps == 0: Engine.max_fps = 60
	print("[clash-t] %6d %s" % [Time.get_ticks_msec() - _tl0, what])

## run()
func run() -> String:
	var B = bt.B
	B.round = 0; B.order = []; B.next = []
	var D := R.data()
	for line in D.dialogue.opening: await speak(line[0], line[1], line[2], float(line[3]) if line.size() > 3 else 2100.0)
	for step in D.sequence: await do_step(step)
	active = null; B.banner = null
	for u in B.units: u.anim = null; u.mv = null
	for line in D.dialogue.stopping:
		if line[2] in ["xu", "cen"]: bt.rules.mo.act(state.units[line[2]], "win", true)
		await speak(line[0], line[1], line[2], float(line[3]) if line.size() > 3 else 2100.0)
	return "stopped"

# ── 喊话（speak：至少显示 250ms 后可用点击／空格／回车／Z 跳过；否则等 ms）──
func speak(who: String, text: String, key, ms := 2100.0) -> void:
	_timeline("喊 " + who)
	caption = {"who": who, "text": text, "key": key}
	if overlay: overlay.queue_redraw()
	var t0: float = bt.pn()
	var skipped := [false]
	var kf := func(k: String):
		if (k == "ok" or k == "click") and bt.pn() - t0 >= 250: skipped[0] = true
	bt.any_key.connect(kf)
	var end: float = bt.bt_now() + ms
	while not skipped[0] and bt.bt_now() < end and bt.B != null:
		await bt.get_tree().process_frame
	bt.any_key.disconnect(kf)
	caption = null
	if overlay: overlay.queue_redraw()

# ── 一个动作（原版 action(step)；基类已有 action 成员，改名 do_step）──
func do_step(step: Dictionary) -> void:
	_timeline("步 " + str(step.skill) + " " + str(step.get("actor", "")))
	var B = bt.B
	var mo = bt.rules.mo
	var D := R.data()
	var pred = predict(step) if OWN_FX.has(step.skill) else null
	var a := R.begin(state, step)
	if a.has("err"): push_error("领队交锋：" + str(a.err)); return
	var u: Dictionary = a.u; var t: Dictionary = a.target
	var skill: String = step.skill
	var sk = D.skills.get(skill)
	u.stationarySkill = sk != null
	if u.stationarySkill:
		u.stepO = 0.0
		if u.get("bx") != null: u.x = u.bx
	B.cur = u; bt.panel.render_cards()
	bt.rules.show_name(u, str(sk.name) if sk != null else ("稳住阵脚" if skill == "defend" else "护卫交手"))
	if skill == "defend":
		mo.act(u, "cast"); R.impact(a); show_result(a.record); await bt.bw(450)
	elif sk != null:
		var pres = D.presentation.get(skill)
		if pres == null: push_error("缺少招式动作合同：" + skill); return
		mo.act(u, str(pres.motion), true)
		var def = DB.g("WuxiaSkills").get(pres.fxId) if pres.get("fxId") else pres
		if def == null: push_error("已登记特效未加载：" + str(pres.fxId)); return
		# 缺专属特效时原版也不补模板或刀光
		if pres.get("fxId"):
			var support = state.units.get(step.get("support")) if step.get("support") != null else null
			var own = null
			if OWN_FX.has(skill):
				own = pred
				if own == null: own = a.targets.map(func(_v): return true)
			start_fx(u, str(pres.fxId), t, support, mini(2, 5 - int(t.bp)) if skill == "am_s2" else 0, a.targets, own)
		await bt.bw(float(def.hitAt)); R.impact(a)
		if active != null and fx.await_outcome:
			fx.outcome = a.targets.map(func(v): return a.record.hits.any(func(h): return h.target == v.key and not h.get("miss")))
			fx.await_outcome = false
		show_result(a.record)
		await bt.bw(float(def.dur) - float(def.hitAt) + 120); u.anim = null; active = null
	else:
		await mo.dash_to(u, t); mo.act(u, "atk"); await bt.bw(mo.impact_ms(u, "atk")); R.impact(a)
		# 一次完整的蓄势普攻是一个规则动作；真实的各段命中逐段演出
		var hits: Array = a.record.hits.duplicate()
		t.hp = a.record.before.hp
		for i in hits.size():
			if i:
				mo.act(u, "atk2"); await bt.bw(mo.impact_ms(u, "atk2"))
			var one: Dictionary = a.record.duplicate(); one.hits = [hits[i]]; one.effects = []
			show_result(one)
			await bt.bw(170 if i == hits.size() - 1 else 180)
		await mo.hop_back(u)
	B.cur = null; bt.panel.render_cards(); await bt.bw(240)

# ── 专属特效接线（原版 qihe-faction-clash.js predict / point / startFx / tick / paint）──

## predict(step)：群攻/缠腕的专属特效需在出手前知道每个目标是否命中——在状态副本上跑同一确定性规则，只读结果
func predict(step: Dictionary):
	var c: Dictionary = state.duplicate(true)
	var p := R.begin(c, step)
	if p.has("err"): return null
	var r := R.impact(p)
	return p.targets.map(func(tt): return r.hits.any(func(h): return h.target == tt.key and not h.get("miss")))

## point(u,mirror)：单位胸口与脚下 → 特效像素（960 画布 ÷1.5；镜像时水平翻转）
func point(u: Dictionary, mirror: bool) -> Dictionary:
	var x: float = u.x + u.get("ox", 0.0); var y: float = u.y + u.get("oy", 0.0)
	var mx := (960 - x if mirror else x) / 1.5
	return {"x": mx, "y": (y - bt.rules.unit_h(u) * 0.55) / 1.5, "gx": mx, "gy": y / 1.5}

## startFx(u,k,t,ally,amount,group,pred)
func start_fx(u: Dictionary, k: String, tg: Dictionary, ally, amount: int, grp: Array, pr) -> void:
	var mirror: bool = u.side == "foe"
	var a := point(u, mirror); var target := point(tg, mirror); var friend := point(ally if ally != null else u, mirror)
	var scale := 0.8
	var pivot := {"x": (a.x + target.x) / 2, "y": (a.gy + target.gy) / 2 - 40}
	var tf := func(p: Dictionary) -> Dictionary:
		return {"x": pivot.x + (p.x - pivot.x) / scale, "y": pivot.y + (p.y - pivot.y) / scale, "gx": pivot.x + (p.gx - pivot.x) / scale, "gy": pivot.y + (p.gy - pivot.y) / scale}
	var A: Dictionary = tf.call(a); var T: Dictionary = tf.call(target); var AL: Dictionary = tf.call(friend)
	fx.A.hand = {"x": A.x - 14, "y": A.y - 4}; fx.A.foot = {"x": A.gx, "y": A.gy}
	if grp.size() > 1: fx.T = grp.map(func(v): return tf.call(point(v, mirror)))
	else: fx.T = [T]
	fx.AL = [AL]
	fx.A.target = {"x": T.x - 5, "y": T.y + 8}; fx.A.ground = {"x": T.gx, "y": T.gy}
	if k == "am_s2": fx.T = null; fx.AL = [T]
	# pred 只决定轨迹压在身上还是擦过；outcome 在真实结算后写入，命中反馈以它为准
	fx.low = false   # 原版 prefers-reduced-motion
	if pr != null: fx.pred = pr; fx.outcome = null; fx.await_outcome = true
	else: fx.pred = null; fx.outcome = null; fx.await_outcome = false
	fx.play(k, 1210 + state.log.size(), 0)
	fx.actual_bp = amount
	last = bt.bt_now()
	active = {"mirror": mirror, "scale": scale, "pivot": pivot, "skill": k}

## tick()：按战斗时钟推进（单帧最多 50ms），渲染指令表；放完即停
func _tick() -> void:
	if active == null or bt.B == null: return
	var now: float = bt.bt_now()
	fx.update(minf(50, maxf(0, now - last))); last = now
	fx.render()
	if fx.done(): active = null

## paint(layer)：g.save；镜像 translate(960,0) scale(-1,1)；以 pivot×1.5 为中心缩放 scale；再按 960/640 贴入
func _paint(layer: String) -> Dictionary:
	if active == null or bt.B == null: return {}
	if "--fx-off" in OS.get_cmdline_user_args(): return {}   # 评审截图用：特效照常计时，只不画
	var v: Dictionary = active
	var pv := Vector2(v.pivot.x * 1.5, v.pivot.y * 1.5)
	var xf := Transform2D(Vector2(-1, 0), Vector2(0, 1), Vector2(960, 0)) if v.mirror else Transform2D.IDENTITY
	xf = xf * Transform2D(0, pv) * Transform2D(0, Vector2(v.scale, v.scale), 0, Vector2.ZERO) * Transform2D(0, -pv)
	xf = xf * Transform2D(0, Vector2(1.5, 1.5), 0, Vector2.ZERO)
	if layer == "back": return {"ops": fx.back_ops(), "xf": xf}
	return {"ops": fx.front_ops(), "xf": xf, "glow": fx.ops.glow, "M": fx.M, "scale": float(v.scale)}

## showResult(record)
func show_result(record: Dictionary) -> void:
	var B = bt.B
	var rl = bt.rules
	var any_hit := false
	for hit in record.hits:
		var t: Dictionary = state.units[hit.target]
		if hit.get("miss"):
			rl.float_txt(t, "闪避", Color("#ddd"), 18); continue
		any_hit = true
		t.hp = hit.hp; rl.mo.act(t, "hurt"); t.flash = bt.pn(); t.ghT = bt.pn()
		rl.float_txt(t, str(hit.damage), Color("#f1d8b5"), 23)
	var skill: String = record.skill
	# 只用现有的刀剑命中声，同一组同时命中只放一次；鞭声未制作
	if any_hit and not skill.begins_with("cs_whip"): bt.sfx("clash_blade_hit_20261012", 0.6, 1)
	# 多目标同帧命中只合并一次轻震（≤3 画布像素）与一次顿帧（≤60ms）；鞭类以 whoosh 提速代替鞭梢声
	if OWN_FX.has(skill) and any_hit:
		var jia := skill != "cs_whip_s1"
		B.shake = maxf(B.shake, 2.5 if jia else 1.5); bt.bt_stop(50 if jia else 35)
		if skill.begins_with("cs_whip"): bt.sfx("whoosh", 0.8 if jia else 0.55, 1.9 if jia else 2.2)
	for e in record.effects:
		if e.kind == "followUsed": mark_flash.append({"unit": e.unit, "t0": bt.bt_now()})
	var FT := {"unload": ["援护", "#9ecfd0"], "exposure": ["破绽", "#dd996d"], "defend": ["防御", "#9ecfd0"], "blunted": ["制势", "#bda3c7"], "follow": ["接应", "#dcc68e"], "followUsed": ["合锋接应", "#dcc68e"]}
	for e in record.effects:
		var u: Dictionary = state.units[e.unit]
		if e.kind == "bp":
			rl.float_txt(u, "蓄势 +" + str(e.value), Color("#f2ce6f"), 20); bt.sfx("clash_qi_transfer_20261012", 0.55, 1)
		elif FT.has(e.kind): rl.float_txt(u, FT[e.kind][0], Color(FT[e.kind][1]), 18)
	bt.panel.render_cards()

# ── 状态标记（drawMarks，世界坐标；由 view._draw_fx 调用）：明约合锋的金白「接应缺口」、缠腕短打的墨紫「制势」腕环 ──
func draw_marks(ci: CanvasItem) -> void:
	if overlay: overlay.queue_redraw()
	if state == null: return
	var now: float = bt.bt_now()
	var rl = bt.rules
	for u in state.units.values():
		var h: float = rl.unit_h(u); var dir := 1.0 if u.side == "foe" else -1.0
		var x: float = u.x + u.get("ox", 0.0); var y: float = u.y + u.get("oy", 0.0)
		if u.hp > 0 and u.get("clashFollow") != null:
			if not mark_seen.has("f" + u.key): mark_seen["f" + u.key] = now
			var t0: float = mark_seen["f" + u.key]
			_notch(ci, x + dir * h * 0.2, y - h * 0.66, minf(1, (now - t0) / 220) * (0.78 + 0.22 * sin((now - t0) / 240)), 1)
		else: mark_seen.erase("f" + u.key)
		if u.hp > 0 and u.get("clashBlunted"):
			if not mark_seen.has("b" + u.key): mark_seen["b" + u.key] = now
			var t1: float = mark_seen["b" + u.key]
			var a := minf(1, (now - t1) / 260) * 0.85
			var cx := x + dir * h * 0.2; var cy := y - h * 0.42
			_ell(ci, Vector2(cx, cy + 1), -0.35 * dir, Color("#24102c", a), 3)
			_ell(ci, Vector2(cx, cy), -0.35 * dir, Color("#a675b0", a), 1.6)
		else: mark_seen.erase("b" + u.key)
	for i in range(mark_flash.size() - 1, -1, -1):
		var m: Dictionary = mark_flash[i]; var e: float = now - m.t0; var u = state.units.get(m.unit)
		if e > 360 or u == null: mark_flash.remove_at(i); continue
		var h2: float = rl.unit_h(u); var d2 := 1.0 if u.side == "foe" else -1.0
		_notch(ci, u.x + u.get("ox", 0.0) + d2 * h2 * 0.2, u.y + u.get("oy", 0.0) - h2 * 0.66, 1 - e / 360, 1 + 0.8 * minf(1, e / 120))

## 椭圆弧 ellipse(cx,cy,10,5,rot,.5,5.9)
static func _ell(ci: CanvasItem, c: Vector2, rot: float, col: Color, w: float) -> void:
	var pts := PackedVector2Array()
	for i in 25:
		var t := 0.5 + (5.9 - 0.5) * i / 24.0
		pts.append(c + Vector2(cos(t) * 10, sin(t) * 5).rotated(rot))
	ci.draw_polyline(pts, col, w, true)

## notch：金色 V 形缺口（shadowBlur 8s 的 #ffe39a 辉光用外扩淡线近似）
static func _notch(ci: CanvasItem, x: float, y: float, a: float, s: float) -> void:
	if a <= 0.01: return
	var segs := [[Vector2(x - 6 * s, y - 6 * s), Vector2(x - 1.5 * s, y + 5 * s)], [Vector2(x + 1.5 * s, y + 5 * s), Vector2(x + 6 * s, y - 6 * s)]]
	for sg in segs: ci.draw_line(sg[0], sg[1], Color("#ffe39a", a * 0.3), 8 * s, true)
	for cw in [[Color("#7a4218"), 4 * s], [Color("#fff3c8"), 2 * s]]:
		for sg in segs:
			ci.draw_line(sg[0], sg[1], Color(cw[0], a), cw[1], true)
			ci.draw_circle(sg[0], cw[1] / 2, Color(cw[0], a)); ci.draw_circle(sg[1], cw[1] / 2, Color(cw[0], a))

# ── 界面（#qh-clash-label 与 #qh-clash-caption 的 CSS 照抄，960 坐标）──
func _draw_overlay() -> void:
	if not is_instance_valid(overlay): return
	var ci := overlay
	var f := BD.fs()
	# #qh-clash-label：top17 居中，17px，#efe0b5，letter-spacing 3px，text-shadow 0 2px 4px #000
	var lab := "侧口交锋 · 旁观"
	var lw := _spaced_w(lab, 17, 3.0, f)
	_spaced(ci, lab, 480 - lw / 2, 17 + 17, 17, 3.0, Color("#efe0b5"), f, Color(0, 0, 0, 0.8), 2)
	if caption == null: return
	# #qh-clash-caption：left160 right199.7 top64，min-height 70，padding 9×20，gap 14；
	# 底色 linear-gradient(90deg, transparent, #211c16e8 12% 88%, transparent)
	var x := 160.0; var w := 960.0 - 160.0 - 199.7; var y := 64.0
	var has_img: bool = caption.key != null and PORTRAIT.has(caption.key)
	var tx := x + 20 + (64 + 14.0 if has_img else 0.0)
	var tw := x + w - 20 - tx
	var lines: Array = _wrap(str(caption.text), 18, tw, f)
	var th := 15 * 1.2 + 3 + lines.size() * 18 * 1.55 + 3
	var ch := maxf(70.02, maxf(76.03 if has_img else 0.0, th) + 18)
	var bgc := Color(0x21 / 255.0, 0x1c / 255.0, 0x16 / 255.0, 0xe8 / 255.0)
	Paint.grad(ci, Rect2(x, y, w, ch), [[0.0, Color(bgc, 0)], [0.12, bgc], [0.88, bgc], [1.0, Color(bgc, 0)]], true)
	if has_img:
		# img 64×76，object-fit:cover，object-position 50% 12%
		var key: String = PORTRAIT[caption.key]
		var tex: Texture2D = Assets.tex_ready(key) if Assets.has(key) else null
		if tex:
			var ts := tex.get_size(); var dw := 64.0; var dh := 76.03
			var sc := maxf(dw / ts.x, dh / ts.y)
			var sw := dw / sc; var sh := dh / sc
			var src := Rect2((ts.x - sw) * 0.5, (ts.y - sh) * 0.12, sw, sh)
			ci.draw_texture_rect_region(tex, Rect2(x + 20, y + ch / 2 - dh / 2, dw, dh), src)
	var ty := y + ch / 2 - th / 2
	ci.draw_string(f, Vector2(tx, ty + 15), str(caption.who), HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("#ddbc7f"))
	ty += 15 * 1.2 + 3
	for ln in lines:
		ci.draw_string(f, Vector2(tx, ty + 18 * 1.55 / 2 + 6.5), ln, HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color("#f4e7c6"))
		ty += 18 * 1.55
	# 「点击／空格 继续」原版字号 .1216px，实际不可见，不画

static func _spaced_w(s: String, sz: int, ls: float, f: Font) -> float:
	var w := 0.0
	for c in s: w += f.get_string_size(c, HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x + ls
	return w

static func _spaced(ci: CanvasItem, s: String, x: float, y: float, sz: int, ls: float, col: Color, f: Font, sh: Color, sy: float) -> void:
	for c in s:
		ci.draw_string(f, Vector2(x, y + sy), c, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, sh)
		ci.draw_string(f, Vector2(x, y), c, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, col)
		x += f.get_string_size(c, HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x + ls

static func _wrap(s: String, sz: int, maxw: float, f: Font) -> Array:
	var out := []; var line := ""
	for c in s:
		if f.get_string_size(line + c, HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x > maxw and line != "": out.append(line); line = c
		else: line += c
	if line != "": out.append(line)
	return out
