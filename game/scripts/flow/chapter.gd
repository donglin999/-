extends Node
## 开始部分主线“风起栖河”：自由探索 → 三方 → 起火 → 撤离 → 邻村对证 → 上山 → 培养。
## 对应原版 js/qihe-chapter.js（流程与存档）、qihe-expansion.js（野外区域、出入口、人物站位、起火画面）、
## qihe-representatives.js（三方剧本入口）、qihe-staging.js（站位表）、qihe-fire-cinematic.js（插画）。
## 台词全部在 ink（story/01-开始/风起-*.ink、三方-*.ink），这里只有流程与游戏函数。

const IDS := {"central": "qihe_trial", "south": "qh_south", "east": "qh_east", "west": "qh_west", "north": "qh_north", "refuge": "qh_refuge", "mountain": "qh_mountain"}
const ACTIVITIES := [["clinic", "药棚帮忙", "central", 4], ["transport", "修车认路", "west", 4], ["practice", "学习丙级《护路棍法》", "west", 4], ["market", "集市帮忙", "south", 5]]
const DEADLINE_LABELS := {2: "第一天傍晚前", 4: "第二天傍晚前", 5: "第三天收拾药箱前"}
const STRANGER := [["c1-00b", 0], ["c1-s1", 2], ["c1-s2", 4]]
const SONG_KNOTS := {"c1-00b": "fq_song_basket", "c1-s1": "fq_song_report", "c1-s2": "fq_song_departure"}
const SONG_GIFTS := {"c1-00b": [30, {"pill": 2}], "c1-s1": [null, {"qh_song_coat": 1}], "c1-s2": [50, {"qh_song_abacus": 1}]}
const ACTIVITY_KNOTS := {"practice": "fq_act_practice", "transport": "fq_act_transport", "clinic": "fq_act_clinic", "market": "fq_act_market"}
const STARTER_STOCK := ["club", "cloth", "needles", "charm", "knife", "mianjia"]
const MAIN_STEPS := [
	{"to": 2, "npc": "ye", "who": "叶蘅", "title": "去药棚见来客", "where": "村中药棚（周婶那里）", "scene": "prologue_clinic_interior"},
	{"to": 4, "npc": "ye", "who": "叶蘅", "title": "陪叶蘅去东埠送药", "where": "东埠装卸路", "scene": "qh_east"},
	{"to": 5, "npc": "ye", "who": "叶蘅", "title": "回叶家收拾药箱", "where": "村西北 · 叶家", "scene": "prologue_ye_house"},
	{"to": 6, "npc": "luheng", "who": "陆衡", "title": "傍晚随药车离村", "where": "西田埂", "scene": "qh_west"}]
const CAST_ALIAS := {"蔺管事": "算命先生", "阿炭": "新来的"}
const REP_SPRITES := {"徐令仪": "c_qh_xulingyi_story", "岑霜": "c_qh_censhuang_story", "沈雁回": "c_qh_shenyanhui_story"}
const REP_NAMES := {"xulingyi": "徐令仪", "censhuang": "岑霜", "shenyanhui": "沈雁回"}
const SHOTS := {"lamp_blade": ["cg_qh_lamp_blade_20261031", 2], "cave": ["cg_qh_north_cave_20261028", 1], "cen": ["cg_qh_cen_night_20261014", 1], "shen": ["cg_qh_shen_night_20261014", 1],
	"xu": ["cg_qh_xu_responsibility_v1", 2], "ignition": ["cg_qh_ignition_night_20261014", 1], "evacuation": ["cg_qh_evacuation_night_20261014", 2], "relics": ["cg_qh_relics_lining_v1", 2], "rope": ["cg_qh_backhill_rope_v4_20261026", 2]}

var castSprites := {"新来的": "c_qh_atan", "阿炭": "c_qh_atan", "帮众": "c_qh_bandit", "采办随从": "c_opening_procurement_aide", "差役": "c_opening_bailiff", "叶蘅": "c_ye", "周砚": "c_opening_zhouyan", "陆衡": "c_opening_luheng", "周婶": "c_opening_aunt", "陈伯": "c_opening_chen", "药商": "c_opening_apothecary", "管事": "c_opening_steward", "护院": "c_opening_retainer", "乌魁": "c_opening_wukui", "采办使": "c_opening_procurement", "店家": "c_qh_merchant", "村口老人": "c_qh_oldman", "宋先生": "c_qh_song_story", "算命先生": "c_qh_linhuizhi", "蔺管事": "c_qh_linhuizhi", "船家": "c_qh_chuanjia", "货郎": "c_qh_huolang", "小耗子": "c_qh_aqi", "阿七": "c_qh_aqi", "阿栓": "c_qh_ashuan", "小禾": "c_qh_xiaohe"}
var D: Dictionary          # QIHE_EXPANSION
var running := false
var offstage := {}         # 画外音的人（window.QiheOffstage）
## 2026-11-10 用户：“对话闲谈的时候出现那两个人，日常就看不到消失了”。剧情站位或台词临时摆出来的人，
## 如果此刻地图上本来没有他，记一笔（人物行踪检查用：tools/cast_schedule.py；测试报告里叫 popins）
var popins: Array = []
func _log_popin(name: String, via: String, key := "") -> void:
	for n in (World.npcs_of(World.cur) if not World.cur.is_empty() else []):
		if not n.get("cast") and _named(n, name): return
	var p = CP()
	var stage := ("%s/%s" % [p.stage, p.get("halfDay", "-")]) if p != null else ("序章/" + str(G.S.get("prologue", {}).get("arrival", {}).get("stage", "-")) if G.S else "-")
	popins.append({"name": name, "scene": World.cur_id, "stage": stage, "via": via, "key": key, "knot": Story._knot, "gather": _gathering() or (key != "" and not (key in DAILY))})
var P: Node                # 序章模块

func _ready() -> void:
	D = DB.g("QIHE_EXPANSION")
	P = get_parent().get_node("Prologue")
	for k in REP_SPRITES: castSprites[k] = REP_SPRITES[k]
	# 原版在本文件里追加的物品与武学（qihe-chapter.js）
	DB.SKILLS.qh_hulu_staff = {"name": "横杆护身", "grade": "丙", "kind": "棍", "key": "str", "req": {"str": 3}, "needWeapon": "棍", "shape": "single", "mp": 3, "pow": 1.1, "desc": "护路棍法第一式。单体棍击，弱点削盾1；至下次本人行动前减伤15%。BP只提高本次伤害。"}
	DB.ITEMS.qh_practice_staff = {"name": "练习棍", "q": 0, "weapon": {"kind": "棍", "atk": 1}, "desc": "陆衡教学赠送的普通木棍。"}
	DB.ITEMS.qh_staff_notes = {"name": "护路棍法笔记", "key": 1, "desc": "萧白亲记，丙级功法第一层，陆衡指正。"}
	DB.ITEMS.qh_song_coat = {"name": "青绫行衣", "desc": "护具。青色细绫面、絮了里子的行路长衣，跑账人常穿，厚实挡风。衣襟内有一段细密的回纹缝记。", "armor": 12, "fx": {"mhp": 20}, "price": 120, "q": 2}
	DB.ITEMS.qh_song_abacus = {"name": "乌木算珠", "desc": "佩饰。一串磨得油亮的乌木算珠，正中一颗青玉珠。", "acc": 1, "fx": {"wil": 1, "wis": 1, "mmp": 15}, "price": 90, "q": 2}
	_install_expansion()
	_install_staging()
	_install_main_enter()

# ─────────────────────── 状态 ───────────────────────
## JS 真值判断（null、false、0、"" 为假）
static func truthy(v) -> bool:
	return not (v == null or (v is bool and not v) or ((v is int or v is float) and v == 0) or (v is String and v == ""))

func CP():
	return G.S.get("qiheChapter") if G.S != null else null

func initial() -> Dictionary:
	var q = G.S.get("prologue", {}).get("outsiders", {}).get("contacts", {}).get("questions", {})
	return {"version": 2, "storyRevision": 2, "stage": "opening", "halfDay": 0, "choices": {}, "events": {}, "consent": {}, "questions": q.duplicate() if q is Dictionary else {}, "coreOwner": "叶蘅", "coreIntact": true, "chenCare": null, "roadResult": null, "granted": false}

func state() -> Dictionary:
	if not G.S.has("qiheChapter"): G.S.qiheChapter = initial()
	var p: Dictionary = G.S.qiheChapter
	for k in ["events", "questions", "choices"]:
		if not p.has(k): p[k] = {}
	return p

func before_fire() -> bool:
	var p = CP()
	return p == null or p.stage in ["opening", "days", "fire"]

func save_point() -> void: P.checkpoint()

func records() -> Dictionary:
	var p := state()
	if not p.has("records"): p.records = {}
	return p.records

# ─────────────────────── 剧情演出：攒句、站位、选项 ───────────────────────
func sprite_of(name: String) -> String:
	var p = CP()
	if name == "陈伯" and p != null and p.stage in ["refuge", "mountain", "ended", "cultivation"]: return "c_qh_chen_rest_story"
	return castSprites.get(name, "")

func participants(rows: Array) -> Array:
	var names := []
	for r in rows:
		var w: String = String(r[0]).split(" · ")[0]
		if (w == "萧白" or castSprites.has(w)) and not names.has(w): names.append(w)
	if names.is_empty(): return []
	var out := [{"who": G.S.get("name", "萧白"), "sp": "c_hero", "slot": "left"}]
	for w in names:
		if w != "萧白": out.append({"who": w, "sp": sprite_of(w)})
	return out

func line(w: String, t: String) -> void:
	await Dialog.with_cast("qh-line", participants([[w, t]]), func(): await Dialog.say(w, t))

func ask(w: String, t: String, opts: Array) -> int:
	return await Dialog.with_cast("qh-choice", participants([[w, t]]), func(): return await Dialog.choose(w, t, opts))

## 剧情临时站位：最多五人，就近摆在主角周围（原版 placeCast）
func place_cast(names: Array) -> Callable:
	if staging_active != null: return func(): pass
	var sc: Dictionary = World.cur
	var original: Array = sc.npcs
	var cast := []
	for n in names:
		if castSprites.has(n) and not offstage.has(n) and not cast.has(n): cast.append(n)
	cast = cast.slice(0, 5)
	var others := original.filter(func(n): return not n.get("sp") or not cast.any(func(c): return n.name == c or n.name == CAST_ALIAS.get(c, "")))
	var placed := []
	var offsets := [[-110, -25], [110, -30], [-190, 70], [180, 75], [0, -125], [-80, 110], [90, 120], [-210, -100], [210, -90]]
	var TS: float = World.TS
	for name in cast:
		var old = null
		for n in original:
			if (n.name == name or n.name == CAST_ALIAS.get(name, "")) and (not (n.get("show") is Callable) or n.show.call()):
				old = n; break
		if old == null:
			# 2026-11-10：主线大事（开场把人带过去、众人聚齐那种）以外，不在场的人不再临时摆出来
			if not _gathering(): continue
			_log_popin(name, "台词临时摆人")
		var pos = null
		if old != null and Vector2(old.x * TS - World.player.x, old.y * TS - World.player.y).length() < 250: pos = [old.x * TS, old.y * TS]
		if pos == null:
			for o in offsets:
				var a := [World.player.x + o[0], World.player.y + o[1]]
				if World.stand_ok(a[0], a[1]) and placed.all(func(n): return Vector2(n.x * TS - a[0], n.y * TS - a[1]).length() > 55):
					pos = a; break
		if pos != null:
			placed.append({"id": "staged-" + name, "name": name, "sp": old.sp if (name == "宋先生" and old != null) else sprite_of(name), "x": pos[0] / TS, "y": pos[1] / TS, "dir": "r" if pos[0] < World.player.x else "l", "fixed": true, "idle": false, "cast": true, "act": func(_n): pass})
	sc.npcs = others + placed
	World.npcs = World.npcs_of(sc)
	return func(): sc.npcs = original; World.npcs = World.npcs_of(sc)

func say_all(rows: Array) -> void:
	var restore := place_cast(rows.map(func(r): return String(r[0]).split(" · ")[0]))
	await Dialog.with_cast("qh-scene", participants(rows), func():
		for r in rows:
			await Dialog.say(r[0], r[1], r[2] if r.size() > 2 else ""))
	restore.call()

func sprite_with_mood(who: String, mood: String) -> String:
	if mood != "" and castSprites.has(who): return castSprites[who] + ":" + mood
	return ""

## 原版 play(knot, externals, vars)：台词按段攒起来，遇到动作、选项或结束先演完；返回剧本里 fq_answer 交回的值
func play(knot: String, externals: Dictionary = {}, vars: Dictionary = {}):
	var buf := []
	var cg := {"shot": null, "rows": []}
	var answer := [null]
	var flush := func():
		if buf.is_empty(): return
		var rows := buf.duplicate(); buf.clear()
		await say_all(rows)
	var base := {
		"fq_beat": func(): pass,
		"fq_go_area": func(key, anchor = null): await go(key, anchor if anchor else "entry"),
		"fq_go_local": func(place, anchor = null):
			if anchor: await P.go_local(place, anchor)
			else: await P.go_local(place),
		"fq_cg_begin": func(shot): cg.shot = shot; cg.rows = [],
		"fq_cg_end": func():
			var shot = cg.shot; var rows: Array = cg.rows
			cg.shot = null; cg.rows = []
			await cg_play(shot, rows),
		"checkpoint": func(): save_point(),
	}
	for k in externals: base[k] = externals[k]
	var ext := {"fq_answer": func(v): answer[0] = v, "mark": func(_id): pass}
	for k in base:
		var fn: Callable = base[k]
		ext[k] = func(a = null, b = null):
			await flush.call()
			var args := [a, b].filter(func(x): return x != null)
			return await fn.callv(args)
	var declared := FileAccess.get_file_as_string("res://data/story/%s.json" % Story._index.get(knot, ""))
	var v2 := {}
	for k in vars:
		if declared.contains("\"VAR=\":\"%s\"" % k): v2[k] = vars[k]
	await Story.play(knot, {"vars": v2, "externals": ext,
		"line": func(_id, who, text, o = {}):
			(cg.rows if cg.shot != null else buf).append([who, text, sprite_with_mood(who, o.get("mood", "")) if o is Dictionary else ""]),
		"choose": func(w, t, opts):
			await flush.call()
			return await Dialog.with_cast("qh-choice", participants([[w, t]]), func(): return await Dialog.choose(w, t, opts))})
	await flush.call()
	return answer[0]

## 三方剧本（qihe-representatives.js play）：reps_beat 分段，cg_begin/cg_end 之间进插画
func reps_play(knot: String, externals: Dictionary = {}, vars: Dictionary = {}) -> void:
	var buf := []
	var cg := {"shot": null, "rows": []}
	var flush := func():
		if buf.is_empty(): return
		var rows := buf.duplicate(); buf.clear()
		await say_all(rows)
	var ext := {"reps_beat": flush}
	for k in externals:
		var fn: Callable = externals[k]
		ext[k] = func(a = null, b = null):
			await flush.call()
			return await fn.callv([a, b].filter(func(x): return x != null))
	ext.cg_begin = func(shot): await flush.call(); cg.shot = shot; cg.rows = []
	ext.cg_end = func():
		var shot = cg.shot; var rows: Array = cg.rows
		cg.shot = null; cg.rows = []
		await cg_play(shot, rows)
	await Story.play(knot, {"vars": vars, "externals": ext,
		"line": func(_id, who, text, _o = {}): (cg.rows if cg.shot != null else buf).append([who, text]),
		"choose": func(w, t, opts): await flush.call(); return await ask(w, t, opts)})
	await flush.call()

## 起火等插画（qihe-fire-cinematic.js）：全屏 contain，背景 #101514，0.5s 入场；对白框换成 CG 样式、不显示立绘
func cg_play(id, rows: Array) -> void:
	var shot: Array = SHOTS.get(id, [])
	if shot.is_empty():
		push_error("Unknown CG shot: %s" % id); return
	var path := Assets.path_of(shot[0])
	var el := Cinematic.show_cg(path, Color("#101514"))
	el.modulate.a = 0; create_tween().tween_property(el, "modulate:a", 1.0, 0.5)
	Dialog.cg_suppress = true; Dialog.cg_style = "qh-cg"
	World.keys = {}; World.player.path = null
	for r in rows: await Dialog.say(r[0], r[1])
	Cinematic.hide_cg(el)
	Dialog.cg_suppress = false; Dialog.cg_style = ""

## 庭院背景卡（courtyard）：只当场景卡，立绘照常
func courtyard(fn: Callable) -> void:
	var el := Cinematic.show_cg("res://assets/production/cultivation/bg_mountain_spring_v1.png", Color("#101514"))
	World.keys = {}; World.player.path = null
	await fn.call()
	Cinematic.hide_cg(el)

## 只取出没有选项与动作的剧本台词（linesOf）
func lines_of(knot: String) -> Array:
	var rows := []
	await Story.play(knot, {"line": func(_id, w, t, _o = {}): rows.append([w, t])})
	return rows

# ─────────────────────── 守卫：剧情运行中不重入，出错记录 ───────────────────────
func story_failed(e) -> void:
	var p = CP() if CP() != null else {}
	var key = p.get("pendingEvent", p.get("stage", "主线开始前"))
	var count: int = (p.storyError.count if p.get("storyError", {}).get("key") == key else 0) + 1
	p.storyError = {"key": key, "count": count, "message": str(e)}
	UI.toast("剧情续接出错（%s，连续第 %d 次）：%s。进度停在出错前，可稍后重试；反复出现请反馈。" % [key, count, str(e)], 6000)

func guarded(fn: Callable):
	if running: return
	running = true
	var was_busy := World.busy
	World.busy = true; World.keys = {}; World.player.path = null
	var token := Dialog.begin("qh-chapter", [])
	var result = await fn.call()
	Dialog.end(token)
	running = false; World.busy = was_busy; World.keys = {}
	save_point(); refresh()
	return result

# ─────────────────────── 野外区域（qihe-expansion.js） ───────────────────────
func refresh() -> void:
	if World.cur.is_empty(): return
	sync_fire(); World.npcs = World.npcs_of(World.cur); World.spawn_wanderers(); UI.hud()

func go(key: String, anchor := "entry") -> void:
	var m: Dictionary = D[key]
	if anchor == "entry" and not m.anchors.has("entry"): anchor = "start"
	var p: Array = m.anchors[anchor].duplicate()
	var TS: float = World.TS
	for n in World.scenes[IDS[key]].npcs:
		if n.get("sp") and (not (n.get("show") is Callable) or n.show.call()) and Vector2(n.x * TS - p[0], n.y * TS - p[1]).length() < 30:
			p[1] += 45; break
	await World.go_scene(IDS[key], [p[0] / TS, p[1] / TS])
	World.cur.dark = null
	P.checkpoint()

func _npc(scene: String, id: String) -> Dictionary:
	for n in World.scenes[scene].npcs:
		if str(n.get("id")) == id: return n
	return {}

## 把导出数据里的节点挂上逻辑（原版 node()：开场登记萧白与对方，结束存档、刷新）
func _node(key: String, id: String, act: Callable, show = null) -> Dictionary:
	var n := _npc(IDS[key], id)
	if n.is_empty(): return n
	n.act = func(_n = null):
		var cast := [{"who": "萧白", "sp": "c_hero", "slot": "left"}]
		if n.get("sp"): cast.append({"who": n.name, "sp": n.sp, "slot": "right"})
		var tk := Dialog.begin("qihe-exp:" + id, cast)
		await act.call()
		Dialog.end(tk); World.keys = {}; P.checkpoint(); refresh()
	if show is Callable: n.show = show
	return n

func speak(knot: String) -> void:
	await Story.play(knot, {"line": func(_id, w, t, _o = {}): await Dialog.say(w, t)})

func act_of(id: String) -> Callable:
	return func(): await interact(id)

func _install_expansion() -> void:
	var sc: Dictionary = World.scenes
	# 区域之间的出入口（portal）
	var pairs := [["central", "north", "north", "south", "后山采药路"], ["central", "south", "south", "north", "南村口"], ["central", "west", "west", "east", "西田埂 / 练场"], ["central", "east", "east", "west", "栖河东埠"], ["south", "east", "east", "south", "沿河装卸路"], ["south", "west", "west", "south", "田埂药车道"]]
	for r in pairs:
		_portal(r[0], r[1], r[2], r[3]); _portal(r[2], r[3], r[0], r[1])
	_portal("refuge", "east", "west", "west"); _portal("refuge", "north", "mountain", "south"); _portal("refuge", "south", "west", "west"); _portal("mountain", "south", "refuge", "north")
	_npc("qh_refuge", "exit-north").act = func(_n = null): await routes()
	# 宋先生
	var song := _node("north", "stranger", act_of("stranger"), func(): return stranger_visible())
	song.mark = func(): return stranger_pending() != null
	_node("north", "stranger-basket", act_of("stranger-basket"), func(): var p = CP(); return p != null and p.stage == "days" and p.halfDay == 0 and not p.events.get("c1-00b"))
	_node("north", "tracks", func(): await speak("fq_x_tracks"))
	_node("south", "merchant", act_of("apothecary"), before_fire)
	_node("south", "retainer", func(): await speak("fq_x_retainer"), before_fire)
	_node("east", "aide", act_of("aide"), before_fire)
	_node("east", "bailiff", func(): await speak("fq_x_bailiff"), before_fire)
	var met_xu := func(): var p = CP(); return p != null and p.events.get("xu-meeting", false)
	var met3 := func(): var p = CP(); return p != null and p.events.get("three-meeting", false)
	_node("south", "xulingyi", act_of("xulingyi"), func(): return before_fire() and met_xu.call())
	_node("south", "censhuang", act_of("censhuang"), func(): return before_fire() and met3.call() and CP().halfDay < 4)
	_node("east", "shenyanhui", act_of("shenyanhui"), func(): return before_fire() and met3.call())
	_node("east", "censhuang", act_of("censhuang"), func(): return before_fire() and met3.call() and CP().halfDay >= 4)
	_node("west", "luheng", act_of("luheng"), func(): var p = CP(); return before_fire() and not (p != null and p.stage == "days" and p.halfDay == 4))
	_node("west", "zhouyan", act_of("zhouyan"), func(): return zhou_at_west())
	_node("west", "training", act_of("lesson"), before_fire)
	_node("west", "cart", act_of("cart"), before_fire)
	_node("west", "refuge-road", func():
		var p = CP()
		if p != null and p.stage == "escape": await resume(); return
		await speak("fq_x_westroad"))
	var at_refuge := func(): var p = CP(); return p != null and p.stage == "refuge"
	for k in ["aunt", "chen", "zhouyan", "luheng", "ye", "xulingyi", "censhuang", "shenyanhui", "evidence"]:
		_node("refuge", k, act_of(k), at_refuge)
	_node("refuge", "elder", func(): await speak("fq_x_elder"), at_refuge)
	# 2026-11-04 所有人都有“谈”：邻村站岗的护院、差役（原版站位只给交互框架、没有台词；Godot 版新写 story/人物-接应院站岗.ink）。出现条件仍按站位表 when
	_node("refuge", "retainer-refuge", func(): await speak("npc_retainer_talk"))
	_node("refuge", "bailiff-refuge", func(): await speak("npc_bailiff_talk"))
	var at_mountain := func(): var p = CP(); return p != null and p.stage in ["mountain", "ended", "cultivation"]
	_node("mountain", "zhouyan", act_of("zhouyan"), at_mountain)
	_node("mountain", "ye", act_of("ye"), at_mountain)
	# 2026-11-10 人物行踪：还在邻村接应时山上客院是空的——客房、厨房、饭桌、练场要等真搬上山才有（原来叶蘅人在邻村，却在山上客房里答话）
	_node("mountain", "xiao-room", func(): G.S.qiheRoomReturn = {"key": "mountain", "anchor": "xiao_door"}; await P.go_local("chen_guest"), at_mountain)
	_node("mountain", "ye-room", func(): await speak("fq_x_yeroom"), at_mountain)
	_node("mountain", "kitchen", act_of("cultivate"), at_mountain)
	_node("mountain", "meal", act_of("meal"), at_mountain)
	_node("mountain", "practice", act_of("cultivate"), at_mountain)
	_node("east", "daily-ye", act_of("ye"), func(): return ye_location() == "east")
	var cy := _npc("prologue_clinic_interior", "daily-ye")
	# 2026-11-05 全人物扫荡查出：原来这两句写在一行，GDScript 会把分号后的赋值算进前一个单行 lambda（还排在 return 后面），
	# act 从没挂上，药棚里点叶蘅“谈”只出“（这段交互尚未移植）”。分开写。
	cy.show = func(): return ye_location() == "clinic"
	cy.act = func(_n = null): await interact("ye")
	# 叶家门、家里的叶蘅、门厅的周砚与陈伯
	# 2026-11-09 用户试玩：在药棚见到叶蘅，转身进叶家她已经在屋里（瞬移）。原因是村中日常时没看过旧物也会挂“应邀帮忙收药箱”的门，
	# 进门就演叶家那场戏。应邀只在第一夜（还没进村中日常）；村中日常里这扇门只在“回叶家收拾药箱”那一步开，那时叶蘅确实在家
	_npc("qihe_trial", "ye-door").show = func(): var p = CP(); return before_fire() and ((p == null and not P.state().relicSeen) or (p != null and p.stage == "days" and main_step() != null and main_step().get("to") == 5))
	# 2026-11-05 自动测试（玩家模式）查出：主线“回叶家收拾药箱”时这扇门专为这一步重新出现，但门上的交互还是第一夜的邀请剧本，
	# 过夜后只会说“屋里灯灭了……明早再来吧”，进不了门，这一步就推不动（原版同样如此）。这一步时直接进叶家，进门后照常问“进入下一时段”。
	var ye_door := _npc("qihe_trial", "ye-door")
	var ye_door_act: Callable = ye_door.act
	ye_door.act = func(n = null):
		var p = CP()
		if p != null and p.stage == "days" and main_step() != null and main_step().get("to") == 5:
			await P.go_local("ye_house"); return
		await ye_door_act.call(n)
	var home_ye := _npc("prologue_ye_house", "ye")
	home_ye.show = func(): return ye_location() == "house"
	var old_ye: Callable = home_ye.act
	home_ye.act = func(n = null):
		var p = CP()
		if p != null and p.stage == "days": await interact("ye")
		else: await old_ye.call(n)
	var hz := _npc("prologue_chen_hall", "zhouyan")
	var old_z: Callable = hz.act; var zshow = hz.get("show")
	hz.show = func(): return (not (zshow is Callable) or zshow.call()) and not zhou_at_west()
	hz.act = func(n = null):
		var p = CP()
		if p != null and p.stage == "days": await interact("zhouyan")
		else: await old_z.call(n)
	var hc := _npc("prologue_chen_hall", "chen")
	var old_c: Callable = hc.act; var cmark = hc.get("mark")
	hc.mark = func(): return club_pending() or (cmark is Callable and cmark.call())
	hc.act = func(n = null):
		if club_pending(): await interact("chen-club")
		else: await old_c.call(n)
	var elder := _npc("qihe_trial", "elder")
	elder.show = func(): var p = CP(); return before_fire() and not (p != null and p.choices.get("transport") == "elders")
	var counter := _npc("prologue_inn_interior", "innkeeper")
	if not counter.is_empty():
		counter.act = func(_n = null): await speak("fq_x_counter")
	_npc("prologue_chen_guest", "guest-out").act = func(_n = null):
		if G.S.get("qiheRoomReturn"): await go(G.S.qiheRoomReturn.key, G.S.qiheRoomReturn.anchor)
		else: await P.go_local("chen_hall", "guest_door")
	_npc("prologue_chen_guest", "rest").act = func(_n = null):
		if CP() != null: await rest()
		else: await P.rest()
	# 村中与三间屋里：起火后都不再显示
	for id in ["qihe_trial", "prologue_clinic_interior", "prologue_chen_hall", "prologue_ye_house"]:
		for n in sc[id].npcs:
			var original = n.get("show")
			n.show = func(): return before_fire() and (not (original is Callable) or original.call())
	sc.qh_east.over = func(ci, t): _draw_fire(ci, t)

func _portal(key: String, anchor: String, to: String, dest: String) -> void:
	_node(key, "exit-" + anchor, func():
		if key == "mountain" and to == "refuge": await speak("fq_x_portal_mountain"); return
		if key == "refuge" and to != "mountain": await speak("fq_x_portal_refuge"); return
		if not before_fire() and not (key in ["refuge", "mountain"]): await resume(); return
		await go(to, dest))

func ye_location() -> String:
	var p = CP()
	if p == null: return "house"
	if p.stage != "days": return "none"
	for m in MAIN_STEPS:
		if m.to > p.get("halfDay", 0):
			return "east" if m.to == 4 else ("house" if m.to == 5 else "clinic")
	return "clinic"

## 起火后东埠药棚的火与碰撞（syncFire / SC.qh_east.over）
var _fire_state = null
var _fire_since := 0.0
func sync_fire() -> void:
	var sc: Dictionary = World.scenes.qh_east
	if not sc.has("_m") or sc._m.is_empty(): return
	var lit: bool = CP() != null and CP().get("fireLit", false)
	if _fire_state == lit: return
	if not sc.has("_clean"): sc._clean = sc._m.duplicate()
	var m: PackedByteArray = sc._clean.duplicate()
	if lit:
		_fire_since = World._t
		var w: int = sc.mask.w
		for y in range(478, 642, 2):
			for x in range(925, 1192, 2):
				m[int(y / 2) * w + int(x / 2)] = 0
	sc._m = m
	if World.cur_id == "qh_east": World._mask = m
	_fire_state = lit
	if World.cur_id == "qh_east": World._nav = {}

func _draw_fire(ci: CanvasItem, t: float) -> void:
	var p = CP()
	if p == null or not p.get("fireLit"): return
	var growth: float = clamp((t - (_fire_since if _fire_since > 0 else t - 1800)) / 1800, 0.18, 1)
	for i in 10:
		var k := i / 10.0
		WorldDraw.ellipse(ci, Vector2(1060, 580), 210 * (1 - k), 210 * (1 - k), Color(237 / 255.0, 138 / 255.0, 53 / 255.0, 0.22 * 0.1))
	for i in 28:
		var x := 945 + i * 9.0; var base := 615.0; var phase := t / 160 + i * 1.9
		var h := (32 + (sin(phase) + 1) * 18) * growth
		var col := Color("#d46b32") if i % 2 else Color("#efa649")
		var pts := PackedVector2Array()
		for s in 9:
			var u := s / 8.0
			var a := Vector2(x - 7, base).lerp(Vector2(x - 12, base - h * 0.4), u).lerp(Vector2(x - 12, base - h * 0.4).lerp(Vector2(x + sin(phase) * 9, base - h), u), u)
			pts.append(a)
		for s in 9:
			var u2 := s / 8.0
			var b := Vector2(x + sin(phase) * 9, base - h).lerp(Vector2(x + 7, base - h * 0.5), u2).lerp(Vector2(x + 7, base - h * 0.5).lerp(Vector2(x + 7, base), u2), u2)
			pts.append(b)
		ci.draw_colored_polygon(pts, Color(col, 0.84 * growth))
		ci.draw_rect(Rect2(x - 3, base - 10, 5, 10), Color("#ffdf91", 0.84 * growth))
		if i % 3 == 0:
			var rise := fmod(t / 50 + i * 19, 145.0)
			WorldDraw.ellipse(ci, Vector2(x + rise * 0.28, 550 - rise), 13 + rise * 0.08, 12 + rise * 0.1, Color("#454941", 0.24 * (1 - rise / 200) * growth))
		if i % 4 == 0:
			ci.draw_rect(Rect2(x + sin(phase) * 12, 560 - fmod(t / 35 + i * 11, 110.0), 2, 3), Color("#f5bb68", 0.6))

# ─────────────────────── 站位表（qihe-staging.js） ───────────────────────
var T: Dictionary
var key_of := {}
var staging_active = null
var staging_pending = null
var _last_go := 0
var _muted := 0
const STAGE_ALIAS := {"蔺管事": "算命先生", "算命先生": "蔺管事", "阿炭": "新来的", "新来的": "阿炭"}

func _install_staging() -> void:
	T = DB.g("QIHE_STAGING")
	for key in T.scenes:
		for k in T.scenes[key].knots: key_of[k] = key
	Story.play_hook = func(knot, inner):
		var key = key_of.get(knot)
		if key != null:
			await _within(key, inner)
		elif knot in T.offstage:
			_muted += 1; await inner.call(); _muted -= 1
		else:
			await inner.call()
	World.go_before = func(): _restore()
	World.go_after = func():
		_last_go = Time.get_ticks_msec()
		if staging_pending != null and T.scenes[staging_pending].at == G.S.scene: await _apply(staging_pending)
	Dialog.before_say = func(who): _look(who)
	World.npcs_hook = func(sc): _apply_rest(sc)

func _named(n: Dictionary, name: String) -> bool:
	return n.get("name") == name or n.get("name") == STAGE_ALIAS.get(name, "")

func _mount(name: String) -> void:
	var e: Dictionary = staging_active
	var v = e.entry.cast.get(name)
	if v == null or e.placed.has(name) or offstage.has(name): return
	e.placed[name] = true
	_log_popin(name, "站位表", str(e.key))
	var TS: float = World.TS
	var node := {"id": "staged-" + name, "name": name, "sp": sprite_of(name), "x": v[0] / TS, "y": v[1] / TS, "dir": v[2], "fixed": true, "idle": false, "cast": true, "act": func(_n): pass}
	e.sc.npcs = e.sc.npcs.filter(func(n): return not n.get("sp") or not _named(n, name)) + [node]
	World.npcs = World.npcs_of(e.sc)

func _restore() -> void:
	var e = staging_active
	if e == null: return
	staging_active = null
	e.sc.npcs = e.original
	if World.cur == e.sc: World.npcs = World.npcs_of(e.sc)

func _apply(key: String) -> void:
	var entry: Dictionary = T.scenes[key]
	_restore()
	var sc: Dictionary = World.cur
	var hero = entry.get("hero")
	var far: bool = hero != null and Vector2(hero[0] - World.player.x, hero[1] - World.player.y).length() > 70 and Time.get_ticks_msec() - _last_go > 900
	var put := func():
		staging_active = {"key": key, "entry": entry, "sc": sc, "original": sc.npcs, "placed": {}}
		for name in entry.cast:
			var v: Array = entry.cast[name]
			if key in DAILY and not _on_map(sc, name): continue
			if v.size() < 4 or v[3] != "late": _mount(name)
		if hero != null:
			World.player.x = hero[0]; World.player.y = hero[1]; World.player.dir = hero[2]
			World.player.path = null; World.player.goal = null; World.player.talk_to = null
			World.snap_cam()
	if far: await UI.fade(put)
	else: put.call()

## 2026-11-10 人物行踪：第一夜的差事戏（送药、还碗、取布）只在第一夜摆站位；进了村中日常再和老人、陈伯、店家搭话，
## 不再把差役、采办随从、周砚这些此刻在别处的人拉过来站着（用户：“闲谈时出现那两个人，日常就看不到”）
const FIRST_NIGHT_ONLY := ["elder_door", "chen_hall", "inn_cloth", "lodging", "first_night_hall"]
## 日常戏（玩家自己挑时候做的活动、搭话）：只把此刻已经站在这个场景地图上的人挪到站位；不在场的人一律不摆，
## 真要说话也只闻其声——由人物行踪检查（tools/cast_schedule.py）把“隔空说话”挑出来，改台词
const DAILY := ["inn_tab_face", "inn_atan", "market", "practice", "transport"]

func _within(key: String, fn: Callable) -> void:
	var entry: Dictionary = T.scenes[key]
	if key in FIRST_NIGHT_ONLY and CP() != null:
		await fn.call(); return
	var was = staging_active.key if staging_active != null else null
	if was == key:
		await fn.call(); return
	var outer = staging_pending
	staging_pending = key
	if G.S.scene == entry.at: await _apply(key)
	await fn.call()
	if staging_pending == key: staging_pending = outer
	if staging_active != null and staging_active.key == key: _restore()

## 正在演主线大事（event() 里，或非日常的站位戏）：这时候众人聚到一处是剧情交代过的
func _gathering() -> bool:
	var p = CP()
	if p != null and p.get("pendingEvent"): return true
	if p != null and p.get("stage") in ["fire", "escape"]: return true
	return staging_active != null and not (staging_active.key in DAILY)

func _on_map(sc: Dictionary, name: String) -> bool:
	for n in sc.npcs:
		if not n.get("cast") and _named(n, name) and (not (n.get("show") is Callable) or n.show.call()): return true
	return false

func _look(who: String) -> void:
	if who == "" or World.cur.is_empty() or who == G.S.get("name", "萧白"): return
	var base := who.split(" · ")[0]
	if staging_active != null and staging_active.entry.cast.has(base) and not staging_active.placed.has(base) \
		and not (staging_active.key in DAILY and not _on_map(staging_active.sc, base)): _mount(base)
	if _muted: return
	var TS: float = World.TS
	for n in World.npcs:
		if n.get("sp") and _named(n, base) and Vector2(n.x * TS - World.player.x, n.y * TS - World.player.y).length() < 420:
			World.player.dir = World.face_to(n.x * TS - World.player.x, n.y * TS - World.player.y); return

func _rule_for(id: String, nid: String):
	for r in T.rest:
		if r.at == id and r.id == nid and (not r.has("when") or (r.when == "firstNight" and CP() == null)): return r
	return null

func _apply_rest(sc: Dictionary) -> void:
	var id := ""
	for k in World.scenes:
		if World.scenes[k] == sc: id = k; break
	if id == "": return
	var has_rules: bool = T.rest.any(func(r): return r.at == id)
	if not has_rules: return
	for n in sc.get("npcs", []):
		var nid := str(n.get("id", ""))
		if nid.begins_with("staged-"): continue
		if not n.has("_rested") and not T.rest.any(func(r): return r.at == id and r.id == nid): continue
		if not n.has("_rested"):
			var b := {"x": n.x, "y": n.y, "dir": n.get("dir", "d"), "show": n.get("show")}
			n._rested = b
			n.show = func():
				var r = _rule_for(id, nid)
				return not (r != null and r.get("hide")) and (not (b.show is Callable) or b.show.call())
		var r2 = _rule_for(id, nid)
		var bb: Dictionary = n._rested
		var TS: float = World.TS
		n.x = r2.x / TS if (r2 != null and r2.get("x") != null) else bb.x
		n.y = r2.y / TS if (r2 != null and r2.get("y") != null) else bb.y
		n.dir = r2.dir if (r2 != null and r2.get("dir")) else bb.dir
		if r2 != null and r2.get("talkR"): n.talkR = r2.talkR

# ─────────────────────── 主线流程（qihe-chapter.js） ───────────────────────
func learned() -> bool:
	return G.S.get("skills", {}).has("qh_hulu_staff")

func activity_open(id: String) -> bool:
	var p = CP()
	for a in ACTIVITIES:
		if a[0] == id: return p != null and p.stage == "days" and p.get("halfDay", 0) < a[3]
	return false

func activity_deadline(id: String) -> String:
	for a in ACTIVITIES:
		if a[0] == id: return DEADLINE_LABELS.get(a[3], "")
	return ""

func stranger_accepted(p = null) -> bool:
	if p == null: p = CP()
	return p != null and p.get("records", {}).get("stranger_deal") in ["accepted", "asked_first"]

func song_broken() -> bool:
	return G.S != null and G.S.get("qiheSong", {}).get("broken", false)

func stranger_pending():
	var p = CP()
	if p == null or p.stage != "days": return null
	for row in STRANGER:
		var id: String = row[0]
		if p.halfDay == row[1] and not p.events.get(id) and (id == "c1-00b" or stranger_accepted(p)) and not song_broken() and not (id == "c1-s2" and p.get("records", {}).get("lamp", {}).get("t3") == "tail"):
			return id
	return null

func stranger_visible() -> bool:
	var p = CP()
	if p == null or p.stage != "days" or p.halfDay >= 5: return false
	if p.events.get("c1-s2") or song_broken() or (p.halfDay == 4 and p.get("records", {}).get("lamp", {}).get("t3") == "tail"): return false
	return p.halfDay == 0 or stranger_accepted(p)

func zhou_at_west() -> bool:
	var p = CP()
	return p != null and p.stage == "days" and p.halfDay in [2, 4]

func owns(id: String) -> bool:
	if int(G.S.get("bag", {}).get(id, 0)) > 0 or id in [G.S.get("weapon"), G.S.get("armor"), G.S.get("acc")]: return true
	for m in G.S.get("mates", {}).values():
		if m.get("equip", {}).values().has(id): return true
	return false

func settle_levels(s: Dictionary) -> Array:
	G.normalize_level(s)
	var lv := []
	while s.lv < G.CHARACTER_LEVEL_CAP and s.exp >= s.lv * 100:
		s.exp -= s.lv * 100; s.lv += 1; s.pts = int(s.get("pts", 0)) + 3
		var d := G.derived(s); s.hp = d.mhp; s.mp = d.mmp; lv.append(s.lv)
	if s.lv >= G.CHARACTER_LEVEL_CAP: s.exp = 0
	return lv

func stranger_gift(key: String, exp: int, items: Dictionary = {}) -> Array:
	var r := records()
	if not r.has("stranger_gifts"): r.stranger_gifts = {}
	if r.stranger_gifts.has(key): return []
	for id in items: G.S.bag[id] = int(G.S.bag.get(id, 0)) + items[id]
	G.S.exp = int(G.S.get("exp", 0)) + exp
	var lvl := settle_levels(G.S)
	r.stranger_gifts[key] = {"exp": exp, "items": items.duplicate(), "levels": lvl}
	save_point()
	var got := []
	for id in items: got.append("%s ×%d" % [DB.ITEMS[id].name, items[id]])
	got.append("已满级" if G.S.lv >= G.CHARACTER_LEVEL_CAP else "修为 +%d" % exp)
	await line("获得", " · ".join(got) + (" · 江湖→装备／行囊查看" if items.size() else ""))
	for l in lvl: await line("", "境界突破 · 第 %d 层 · 属性点 +3" % l)
	return lvl

func song_gift(key: String) -> void:
	var g: Array = SONG_GIFTS[key]
	var exp = g[0] if g[0] != null else (30 if records().get("stranger_report") == "partial" else 40)
	await stranger_gift(key, exp, g[1])

func stranger_scene(id: String) -> void:
	var p := state()
	await play(SONG_KNOTS[id], {"fq_song_gift": func(k): await song_gift(k)})
	p.events[id] = true; save_point(); refresh()

func stranger_talk() -> void:
	var pend = stranger_pending()
	if pend != null: await stranger_scene(pend); return
	if not stranger_visible(): return
	await play("fq_song_idle", {}, {"first_day": state().halfDay == 0, "declined": records().get("stranger_deal") == "declined"})

func grant_lesson() -> bool:
	var p := state()
	if p.granted: return false
	if not G.S.has("skills"): G.S.skills = {}
	G.S.skills.qh_hulu_staff = max(1, int(G.S.skills.get("qh_hulu_staff", 0)))
	G.S.bag.qh_practice_staff = int(G.S.bag.get("qh_practice_staff", 0)) + 1
	G.S.bag.qh_staff_notes = int(G.S.bag.get("qh_staff_notes", 0)) + 1
	if not G.S.get("weapon"):
		G.S.weapon = "qh_practice_staff"; G.S.bag.qh_practice_staff -= 1
	p.granted = true; p.skillSource = "陆衡·栖河西田埂"; save_point()
	return true

func club_pending() -> bool:
	var p = CP()
	return p != null and p.stage == "days" and p.choices.get("transport") and not p.get("equipmentRewards", {}).get("transport")

func grant_starter_equipment(opt: Dictionary = {}) -> Array:
	var p := state()
	if p.stage != "days": return []
	var rows := [["arrival", "cloth", true], ["transport", "club", truthy(p.choices.get("transport")) and opt.get("club", false)], ["clinic", "needles", truthy(p.choices.get("clinic"))]]
	if not p.has("equipmentRewards"): p.equipmentRewards = {}
	rows = rows.filter(func(r): return r[2] and not p.equipmentRewards.has(r[0]))
	var gained := []
	for r in rows:
		var owned := owns(r[1])
		if not owned:
			G.S.bag[r[1]] = int(G.S.bag.get(r[1], 0)) + 1; gained.append(r[1])
		p.equipmentRewards[r[0]] = {"item": r[1], "status": "already-owned" if owned else "granted"}
	if gained.size(): G.save()
	return gained

func equipment_shop() -> void:
	var rows := STARTER_STOCK.map(func(id): return "%s · %d 文" % [DB.ITEMS[id].name, DB.ITEMS[id].price])
	var n := await ask("店家", "都是行路能用的普通家当。你身上有 %d 文；看清兵器和根基要求，再决定。" % int(G.S.get("silver", 0)), rows + ["先不买"])
	if n >= STARTER_STOCK.size(): return
	var id: String = STARTER_STOCK[n]; var it: Dictionary = DB.ITEMS[id]
	if await ask("店家", "%s：%s\n花 %d 文买一件？" % [it.name, it.desc, it.price], ["买一件", "再看看"]) != 0: return
	var ok := false; var reason := ""
	if int(G.S.get("silver", 0)) < it.price: reason = "铜钱不足，需要 %d 文" % it.price
	else:
		G.S.silver -= it.price; G.S.bag[id] = int(G.S.bag.get(id, 0)) + 1; G.save(); ok = true
	await line("店家", "收好了。买来先放包裹，合不合身、使不使得动，还要你自己挑。" if ok else reason)
	if ok: await line("获得", "%s ×1 · 花费 %d 文。江湖→装备，双击穿戴。" % [it.name, it.price])

func main_step(p = null):
	if p == null: p = CP()
	if p == null or p.stage != "days": return null
	var aqi := get_parent().get_node_or_null("Side")
	if aqi and aqi.has_method("aqi_pending") and aqi.aqi_pending(): return aqi.AQI_STEP
	for m in MAIN_STEPS:
		if m.to > p.get("halfDay", 0): return m
	return null

func main_offer(m: Dictionary) -> bool:
	var p := state()
	if await ask("主线", "进入下一时段：%s。%s" % [m.title, "离村后就不能再回村里了。" if m.to == 6 else ""], ["开始", "再等等"]) != 0:
		p.mainDismissed = p.halfDay; save_point(); return false
	p.erase("mainDismissed"); p.halfDay = m.to; save_point()
	await advance_events()
	return true

func arrive(id: String) -> void:
	var p = CP()
	if running or p == null or p.stage != "days" or p.get("mainDismissed") == p.halfDay: return
	var m = main_step(p)
	if m == null or m.get("scene") != id: return
	await guarded(func(): await main_offer(m))

func _install_main_enter() -> void:
	for m in MAIN_STEPS:
		var id: String = m.scene
		var sc: Dictionary = World.scenes[id]
		if sc.get("_arriveHooked"): continue
		sc._arriveHooked = true
		var old = sc.get("enter")
		sc.enter = func():
			if old is Callable: await old.call()
			await arrive(id)

func event(id: String, fn: Callable) -> void:
	var p := state()
	if p.events.get(id): return
	p.pendingEvent = id; save_point()
	await fn.call()
	p.events[id] = true; p.erase("pendingEvent"); save_point()

func rep_ctx() -> Dictionary:
	return {"p": state()}

func begin_body() -> void:
	var p := state()
	if p.stage != "opening": await resume_body(); return
	await play("fq_morning", {
		"fq_days_begin": func(): p.stage = "days",
		"fq_starter_gear": func():
			var starter := grant_starter_equipment()
			if starter.size(): await line("获得", "、".join(starter.map(func(id): return DB.ITEMS[id].name + " ×1")) + " · 江湖→装备，双击穿戴。")
			if not G.S.has("party"): G.S.party = []
			if not G.S.party.has("ye") and G.S.party.size() < 3: G.S.party.append("ye")
			if G.S.get("qiheRoster") and not G.S.qiheRoster.members.has("ye"): G.S.qiheRoster.members.append("ye")
			save_point()})
	var side := get_parent().get_node_or_null("Side")
	if side and side.has_method("aqi_call"): await side.aqi_call()
	await line("", "可以在村里自由走动、帮忙和问话。主线的下一步写在左上角行程里；想学武，去西田埂找陆衡。")

func begin() -> void: await guarded(begin_body)

func story_battle(kind: String) -> String:
	var snapshot: Dictionary = G.S.duplicate(true)
	var result: String = await Flow.run_battle({"preset": kind, "learned": learned()})
	# 战斗不改存档（原版 PrologueStoryBattle.restore）
	G.S = snapshot; G.mode = "scene"; World.keys = {}; UI.hud(); G.save()
	return result

func lesson_battle() -> void:
	while await story_battle("lesson") != "win":
		if await play("fq_lesson_retry") == "stop": break

func activity_body(id: String) -> void:
	var p := state()
	if p.stage != "days": await play("fq_act_busy"); return
	if p.choices.get(id): await play("fq_act_done"); return
	var a = null
	for x in ACTIVITIES:
		if x[0] == id: a = x
	if a == null: return
	if not activity_open(id): await play("fq_act_late"); return
	if await ask("行程", a[1] + "。" + ("陆衡会传授第一层，赠送练习棍与本人笔记。" if id == "practice" else ""), ["现在开始", "再想想"]) != 0: return
	await play(ACTIVITY_KNOTS[id], {"fq_lesson_battle": func(): await lesson_battle(), "fq_grant_lesson": func(): grant_lesson()})
	if id == "practice": await line("", "已学：丙级《护路棍法》第一层 · 横杆护身。守路战及后续招式培养可使用。")
	var rewards := grant_starter_equipment()
	if id == "transport" and club_pending(): await line("行程", "陈伯托人带话：得空去他家门厅一趟。")
	if rewards.has("needles"):
		await play("fq_gift_needles"); await line("获得", "铜针囊 ×1 · 装备页切换人物，再双击穿戴。")
	save_point(); await line("行程", "这件事办完了。")

func club_gift() -> void:
	if not club_pending(): return
	await play("fq_gift_club")
	var got := grant_starter_equipment({"club": true})
	if got.has("club"): await line("获得", "枣木短棍 ×1 · 可替换练习棍，仍可施展横杆护身。")
	save_point()

func advance_events() -> void:
	var p := state()
	if p.halfDay >= 2:
		await event("xu-meeting", func():
			await P.go_local("village", "clinic")
			await reps_play("qihe_reps_xu", {"reps_note": func(k, v): p.questions[k] = v})
			p.events.steward = true)
	if p.halfDay >= 4:
		await event("three-meeting", func():
			await go("east", "loading")
			await reps_play("qihe_reps_medicine", {}, {"watched": stranger_accepted(p) and not song_broken()})
			G.S.prologue.wolf_cause_testimony_heard = true; G.S.prologue.wolf_testimony_source = "陆衡转述北坡车夫见闻"; p.events.medicine = true)
	if p.halfDay >= 5:
		await event("packing", func():
			await P.go_local("ye_house"); await P.go_local("ye_house"); await play("fq_packing"))
	if p.halfDay >= 6:
		p.stage = "fire"; save_point(); await fire_body(); return
	await line("行程", "可以继续在村里走动。主线的下一步写在左上角行程里。")

func fire_body() -> void:
	var p := state()
	await go("east", "loading")
	await event("fire-start", func():
		if not p.get("fireLit") and not p.get("clashVersion"):
			await _within("fire", func():
				await say_all(await lines_of("qihe_reps_fire_demand"))
				await say_all(await lines_of("qihe_reps_fire_collision")))
			await play("fq_fire_before", {}, {"told_departure": records().get("stranger_told_departure", false)})
			var bt = get_node_or_null("/root/Battle")
			if bt != null and bt.has_method("clash_play") and not Flow.skip_battles: await bt.clash_play()
			p.clashVersion = int(DB.g("QiheClashData").get("runtimeCheckpoint", 1)); save_point()
		if not p.get("fireLit"):
			await play("fq_fire_ignition"); p.fireLit = true; sync_fire(); save_point()
		await reps_play("qihe_reps_rescue", {}, {"clash": truthy(p.get("clashVersion"))}))
	await event("rescue", func():
		await play("fq_rescue")
		if not p.get("rescue"): p.rescue = "chen"
		if not p.get("chenCare"): p.chenCare = "擦伤已照护")
	await event("fire-evacuation-cg", func(): await play("fq_evacuation"))
	p.stage = "escape"; save_point()
	await escape_body()

func escape_body() -> void:
	var p := state()
	await go("west", "guard")
	await event("road-intro", func(): await play("fq_road_intro", {}, {"clash": truthy(p.get("clashVersion")), "learned": learned()}))
	while p.get("roadResult") != "win":
		var result := await story_battle("road")
		if result == "win":
			p = state(); p.roadResult = "win"; save_point(); break
		if await play("fq_road_retry") == "stop": return
	p = state()
	p.stage = "refuge"; save_point()
	await go("refuge")
	await event("arrival", func(): await play("fq_refuge_arrival"))

func evidence_body() -> void:
	var p := state()
	if p.events.get("evidence-v2"): return
	if p.stage != "refuge": await play("fq_evidence_wait"); return
	await event("evidence-v2", func():
		await go("refuge", "zhouyan")
		var side := get_parent().get_node_or_null("Side")
		if side and side.has_method("lamp_settle_ending"): side.lamp_settle_ending()
		var kept := ["qh_song_coat", "qh_song_abacus"].filter(owns).map(func(id): return DB.ITEMS[id].name)
		var vars := {"has_roster": int(G.S.bag.get("qh_song_roster", 0)) > 0, "met": p.events.get("three-meeting", false), "watched": stranger_accepted(p), "clash": truthy(p.get("clashVersion")), "has_coat": kept.has("青绫行衣"), "has_abacus": kept.has("乌木算珠")}
		for f in ["alliance", "guijintang", "patrol"]:
			var npc = get_node_or_null("/root/Npc")
			vars["cold_" + f] = npc != null and npc.has_method("rep_score") and npc.rep_score(f) < 0
		await reps_play("qihe_reps_evidence", {
			"reps_told": func(told): records().told_about_stranger = told,
			"reps_stranger_gift": func(): await stranger_gift("c1-07", 50),
			"reps_hand_roster": func():
				if int(G.S.bag.get("qh_song_roster", 0)) > 0: G.S.bag.qh_song_roster -= 1
				records().roster_given = true}, vars)
		p.evidence = {"version": 2, "receipt": "旧药罐六只", "number": 17, "authorization": false, "forgerySuspected": true, "mastermindKnown": false, "relicsAbsent": true, "strangerNamed": records().get("told_about_stranger", false), "originalsReturned": true, "responsible": ["徐令仪", "岑霜", "沈雁回"]})
	p.storyRevision = 2; save_point()

func routes() -> void: await guarded(routes_body)

func routes_body() -> void:
	var p := state()
	if not (p.stage in ["refuge", "mountain"]): return
	if p.stage == "refuge": await evidence_body()
	var side := get_parent().get_node_or_null("Side")
	if side and side.has_method("lamp_end_scene"): await side.lamp_end_scene()
	if await play("fq_routes") != "go": return
	p.consent = {"xiao": true, "ye": true}; p.route = "mountain"; save_point()
	await event("farewell-v2", func(): await play("fq_farewell"))
	p.stage = "mountain"; save_point()
	await mountain_end()

func mountain_end() -> void:
	var p := state()
	if p.stage == "mountain":
		if stranger_accepted(p): await event("backhill-rope", func(): await play("fq_rope", {}, {"told": records().get("told_about_stranger", false), "broken": song_broken()}))
		await courtyard(func():
			await event("settle", func(): await play("fq_settle"))
			await event("meal", func(): await play("fq_meal", {}, {"learned": learned()}))
			p.stage = "ended"; p.chapter2Ready = true; save_point()
			await line("", "江湖经历记下一笔：山居安身。进度已保存。"))
	await cultivation_begin()

func cultivation_begin() -> void:
	var p := state()
	if p.stage == "cultivation":
		await _enter_cultivation(); return
	await courtyard(func(): await event("apprenticeship", func():
		var rows: Array = DB.g("CultivationDialogue").get("apprenticeship", [])
		await say_all(rows)))
	p.stage = "cultivation"
	G.S.chapter = max(2, int(G.S.get("chapter", 1))); G.S.sect = "guiyun"; save_point()
	await _enter_cultivation()

func rest() -> void:
	await guarded(func():
		var p := state()
		if p.get("pendingEvent"): await resume_body(); return
		if p.stage == "mountain": await mountain_end(); return
		if p.stage == "ended": await cultivation_begin(); return
		if p.stage == "cultivation": await _enter_cultivation(); return
		if p.stage == "days":
			var m = main_step(p)
			if m != null:
				await play("fq_rest_hint", {}, {"title": m.title, "where": m.where, "who": m.who})
			return
		await resume_body())

func interact(id: String) -> void:
	var side := get_parent().get_node_or_null("Side")
	if side and side.has_method("outsiders_handles") and side.outsiders_handles(id) and side.outsiders_available():
		await side.outsiders_talk(id); return
	await guarded(func():
		var p = CP()
		if id == "bandit": await play("fq_bandit", {}, {"late": p != null and p.halfDay >= 4}); return
		if id == "aide": await play("fq_aide"); return
		if p == null:
			# 2026-11-10 人物行踪：原来除了陆衡一律放药商那句“我得收摊”，西田埂的练场、药车也冒出药商的声音。
			# 西田埂的几处都是陆衡答，南村口的药商自己答；别处没人答就不出声
			if id in ["luheng", "lesson", "cart"]: await play("fq_late_lu")
			elif id == "apothecary": await play("fq_late_merchant")
			else: await line("", "天色晚了，这里没人。")
			return
		if p.stage == "opening": await begin_body(); return
		if p.stage in ["fire", "escape"]: await resume_body(); return
		if p.stage in ["ended", "cultivation"] and id in ["zhouyan", "cultivate", "meal"]:
			if p.stage == "ended": await cultivation_begin()
			else: await _enter_cultivation()
			return
		if p.stage == "mountain" and id == "meal": await mountain_end(); return
		if REP_NAMES.has(id): await reps_interact(id); return
		if id == "stranger" or id == "stranger-basket": await stranger_talk(); return
		if p.stage == "refuge":
			if id == "evidence":
				if not p.events.get("evidence-v2"): await evidence_body(); return
				await line("对证记录", "原底单只有六只旧药罐。三张附页引同一张单子，约同一个时辰、同一个口子；写附页的人，" + ("沈雁回要去后山找那位宋姓账房问。" if records().get("told_about_stranger") else "还没查出来。"))
				return
			if id == "zhouyan": await routes_body(); return
			if id == "ye": await play("fq_refuge_ye", {}, {"evidence_done": p.events.get("evidence-v2", false)}); return
			await play({"aunt": "fq_refuge_aunt", "chen": "fq_refuge_chen", "luheng": "fq_refuge_luheng"}.get(id, "fq_refuge_other")); return
		if p.stage == "days":
			if id == "chen-club": await club_gift(); return
			var m = main_step(p)
			if m != null and not m.get("aqi") and m.npc == id:
				await play("fq_main_%d" % m.to)
				if await main_offer(m): return
				var rel := "clinic" if id == "ye" else "practice"
				if activity_open(rel) and not p.choices.get(rel): await activity_body(rel)
				return
			var amap := {"luheng": "practice", "lesson": "practice", "cart": "transport", "apothecary": "market"}
			if amap.has(id): await activity_body(amap[id]); return
			if id == "innkeeper":
				var n = await play("fq_inn")
				if n == "shop": await equipment_shop()
				elif n == "help": await activity_body("market")
				return
			if id == "zhouyan": await play("fq_zhou_idle", {}, {"shen_open": p.halfDay >= 2, "met_zhou": p.events.get("xu-meeting", false)}); return
			if id == "ye": await activity_body("clinic"); return
			await play({"wukui": "fq_wukui", "steward": "fq_steward"}.get(id, "fq_procurement")); return
		if id == "ye": await play("fq_ye_settled"); return
		await play("fq_tonight"))

## 找三方代表说话（QiheRepresentatives.interact）
func reps_interact(id: String) -> void:
	var p := state()
	var side := get_parent().get_node_or_null("Side")
	if id == "censhuang" and side and side.has_method("cen_offer") and await side.cen_offer(): return
	var after: bool = p.stage == "refuge" and p.events.get("evidence-v2", false)
	var errand_key = side.outsiders_rep_key(id) if side and side.has_method("outsiders_rep_key") else null
	var errand: bool = errand_key != null and side.outsiders_available()
	var q = G.S.prologue.get("outsiders", {}).get("quests", {}).get(errand_key, {}) if errand else {}
	var stage: String = q.get("stage", "none") if q is Dictionary else "none"
	var open: bool = errand and side.outsiders_quest_open(errand_key)
	await reps_play("qihe_reps_talk_" + id, {
		"reps_note": func(k, v): p.questions[k] = v,
		"reps_errand": func(): await side.outsiders_talk(id),
		"reps_evidence": func(): await evidence_body()}, {
		"after": after, "refuge": p.stage == "refuge", "met": p.events.get("xu-meeting" if id == "xulingyi" else "three-meeting", false),
		"errand_new": open and stage == "none", "errand_active": open and stage != "none" and stage != "done", "errand_done": errand and stage == "done"})

func resume() -> void: await guarded(resume_body)

func resume_body() -> void:
	var p := state()
	match p.stage:
		"opening": await begin_body()
		"days": grant_starter_equipment(); await advance_events()
		"fire": await fire_body()
		"escape": await escape_body()
		"refuge":
			await go("refuge"); await evidence_body(); await routes_body()
		"mountain": await mountain_end()
		"ended": await cultivation_begin()
		"cultivation": await _enter_cultivation()
		_:
			var back := "days" if p.get("halfDay", 0) > 0 or p.events.size() else "opening"
			UI.toast("主线进度阶段「%s」无法识别，已回到%s。" % [p.stage, "自由探索" if back == "days" else "开场"], 4000)
			p.stage = back; save_point(); await resume_body()

func restore_scene() -> void:
	sync_fire()
	if CP() == null: return
	state()
	var gained := grant_starter_equipment()
	if gained.size(): UI.toast("补领初始装备：" + "、".join(gained.map(func(id): return DB.ITEMS[id].name)) + " · 装备页双击穿戴", 3600)
	World.cur.dark = null
	if state().stage in ["fire", "escape"]: UI.toast("行程中可继续撤离片段。", 2400)
	if not World.stand_ok(World.player.x, World.player.y):
		var s: Array = World.cur.start
		World.player.x = s[0] * World.TS; World.player.y = s[1] * World.TS; World.snap_cam()
	if state().stage in ["mountain", "ended"]:
		await get_tree().create_timer(0.4).timeout
		await resume()

## 左上角行程（questLine）
func quest_line() -> String:
	var p = CP()
	if p == null: return P.quest_line()
	var m = main_step(p)
	match p.stage:
		"days": return ("主线 · %s · %s在%s等你" % [m.title, m.who, m.where]) if m != null else "自由探索"   # 11-10：叶蘅已结伴，不写“找”
		"refuge": return "对证已记 · 与周砚商量去处" if p.events.get("evidence-v2") else "安置伤者后 · 核对三份来件"
		"ended": return "J 继续上山"
		"cultivation": return "自由练习与交谈"
	return "J 继续当前剧情"

func _enter_cultivation() -> void:
	var c = get_node_or_null("/root/Cultivation")
	if c != null and c.has_method("enter"): await c.enter({"inherit": true})

## 对证（原版 QiheChapter.evidence，公开入口）
func evidence() -> void:
	await guarded(func():
		var p := state()
		if p.stage == "refuge" and not p.events.get("evidence-v2"):
			await evidence_body(); return
		await line("栖河对证记录", "三张附页：都引第十七号单，都约第三夜戌时、装卸侧口。一张写交谱，一张写还匣，一张写交样。")
		await line("栖河对证记录", "陈伯的底单：旧药罐六只，别无他物。")
		await line("栖河对证记录", "萧白说出了后山的宋姓账房，沈雁回要去找他问。是谁拼的消息，还不知道。" if records().get("told_about_stranger") else "是谁拼的消息，还不知道。")
		p.evidenceReviewed = true; save_point())
