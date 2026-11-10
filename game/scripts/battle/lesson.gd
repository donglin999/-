extends RefCounted
## 剧情教学战斗（prologue-story-battle.js makeLesson/play、qihe-chapter.js storyBattle 的 lesson/road）。
## 实例即原版 storyLesson 对象；battle.gd/rules.gd/turn.gd/panel.gd 通过下列方法回调。
## 指引文案逐字照抄原版。

var bt
var normal_combat := true
var guidance := true
var mounted := true         # 原版 storyBattle 把 mount 换成空函数：不显示指引 UI
var silent_show := false    # storyBattle 把 show 换成只记 uiStep、onTarget 换成空函数
var hide_guide_on_menu := false
var action = null
var actions := []
var events := []
var ui_step := ""
var hp_before := []
var _allies_fn: Callable

func record(type: String, data := {}) -> void:
	var e := {"type": type}; e.merge(data); events.append(e)

# ── battle.gd 接口 ──
func allies() -> Array: return _allies_fn.call()
func has_foes() -> bool: return false
func foes() -> Array: return []
func has_run() -> bool: return false
func run() -> String: return "lose"
func has_order() -> bool: return false
func order() -> Array: return []
func has_plan_intent() -> bool: return true

## 第 1 回合：第 i 只狼指向第 i 个同伴
func plan_intent(u: Dictionary) -> void:
	bt.rules.plan_intent(u)
	var B = bt.B
	if B.round == 1 and u.get("intent") != null and not u.intent.get("all"):
		u.intent.tgt = B.allies[bt.rules.idx(B.foes, u) % B.allies.size()]

func mount(b) -> void:
	bt = b
	if mounted: bt.panel.teach_mount()

func toggle_guidance() -> void:
	guidance = not guidance
	bt.panel.teach.toggle = "关闭指引" if guidance else "显示指引"
	if not guidance: bt.panel.teach_show(null, null, false)
	else: bt.panel.teach.guide = _last_guide
	if bt.B.redraw.is_valid(): bt.B.redraw.call()

var _last_guide = null
func show(step: String, text: String, u, target = null) -> void:
	ui_step = step
	if silent_show: return
	record("guide", {"step": step, "actor": u.name if u != null else null})
	if not mounted: return
	_last_guide = {"title": "第 %d 回合 · %s" % [bt.B.round, u.name if u != null else ""], "text": text}
	bt.panel.teach_show(_last_guide, target, guidance)
	bt.panel.teach.focus_card = bt.rules.idx(bt.B.allies, u) if u != null and u.side == "ally" else -1
	bt.panel.teach.focus_row = -1

func on_menu(u: Dictionary, title: String, rows: Array, selected: int) -> void:
	var first := true
	for a in actions: if a.actor == u.name: first = false
	var foes_alive: Array = bt.rules.alive_of("foe")
	var dog = foes_alive[0] if foes_alive.size() else null
	var expected = "atk" if u.get("isHero") else "sk"
	var text := ""; var step := ""
	if title == "武学":
		step = "skill-menu"; expected = "jinzhen"; text = "选择叶蘅已经会的「金针刺穴」，再选目标；会消耗内力并造成真实伤害。Esc 可返回。"
	elif title == "道具":
		step = "item-menu"; expected = null
		for r in rows: if not r.get("dis"): expected = r.val; break
		text = "选择行囊中的补给，再选择使用对象。数量与回复效果遵循正式战斗规则。"
	elif first:
		step = "attack-menu" if u.get("isHero") else "ye-turn"
		text = "轮到萧白。选择「攻击」，再确认灰狼目标；↑↓ / W、S 选择，Enter / 空格确认，也可点击。未习武时武学自然不可用。" if u.get("isHero") else "轮到叶蘅。可用「攻击」飞针，或选择「武学 → 金针刺穴」并确认目标。看顶部行动顺序，两个角色由你分别操作。"
	elif dog != null and dog.get("broken"):
		step = "boost"; expected = "atk"; text = "灰狼已破势：暂时不能行动、受到伤害提高。按 E / → 投入 BP，Q / ← 减少；普攻增加连击，招式提高效果，再选目标确认。"
	else:
		step = "tactics"
		expected = "def" if dog != null and dog.get("intent") != null and is_same(dog.intent.get("tgt"), u) else "atk"
		text = "看灰狼头顶的攻击意图。「防御」让本回合受伤减半；也可攻击弱点削盾、使用武学或道具。BP 每回合积累，按 E 投入。所有可用指令都能正常使用。"
	show(step, text, u)
	if guidance and mounted and not silent_show:
		for i in rows.size(): if rows[i].val == expected: bt.panel.teach.focus_row = i; break
	record("selection", {"actor": u.name, "title": title, "value": rows[selected].val if selected < rows.size() else null})
	if hide_guide_on_menu: bt.panel.teach_show(null, null, false)

func wrong(u: Dictionary, row: Dictionary) -> void:
	record("unavailable", {"actor": u.name, "value": row.val})
	if not mounted or silent_show: return
	var t: String = "萧白尚未习武，可以用木杆攻击或选择防御。" if u.get("isHero") and row.val == "sk" else (row.get("desc", "") if row.get("desc", "") != "" else (row.get("why", "") if row.get("why", "") != "" else "当前条件不足。"))
	_last_guide = {"title": "当前不可用", "text": t}
	bt.panel.teach_show(_last_guide, null, guidance)

func confirm(u: Dictionary, value, source: String) -> void:
	if value != "target": action = value
	record("confirm", {"actor": u.name, "value": value, "source": source})

func on_target(u: Dictionary, target: Dictionary) -> void:
	if silent_show: return
	show("target", "选择灰狼并确认。命中「棍 / 暗器」弱点会削减盾值；盾归零即破势。Esc 返回，E / Q 调整 BP。" if target.side == "foe" else "选择需要补给的角色，再按 Enter / 空格确认。Esc 返回。", u, target)
	record("target", {"target": target.name})

func after_action(u: Dictionary, bp: int) -> void:
	var f: Dictionary = bt.B.foes[0]
	var entry := {"actor": u.name, "action": action, "bp": bp, "enemyHP": f.hp, "shield": f.shield, "broken": f.get("broken", false), "mp": u.mp}
	actions.append(entry); record("action", entry)

func before_foe(dog: Dictionary) -> void:
	hp_before = []
	for u in bt.B.allies: hp_before.append(u.hp)
	show("enemy-intent", "轮到灰狼。观察它的攻击目标、动作以及气血变化；防御减伤、弱点破势都使用正常规则。", dog, dog)

func after_foe(_u) -> void:
	var vals := []
	for i in bt.B.allies.size(): vals.append(hp_before[i] - bt.B.allies[i].hp if i < hp_before.size() else 0)
	record("enemy-damage", {"values": vals})

func clear() -> void:
	if bt and bt.panel: bt.panel.teach_clear()

# ───────── 预设 ─────────
const SELF := preload("res://scripts/battle/lesson.gd")

static func _clamp_hp(v, mhp: int) -> int:
	return clampi(int(v) if v != null else mhp, 1, mhp)

## prologue-story-battle.js makeLesson().allies
static func _prologue_allies() -> Array:
	var S: Dictionary = G.S
	var hero := Stats.stat_unit({"name": S.get("name", "萧白") if S.get("name") else "萧白", "lv": 1, "st": {"str": 4, "con": 4, "agi": 4, "wil": 4, "wis": 4}}, "ally")
	hero.merge({"hp": _clamp_hp(S.get("hp"), hero.mhp), "mp": 0, "isHero": true, "art": "hero_modern", "por": "opening_hero_modern", "atkType": "棍", "atkName": "木杆",
		"skills": [], "skLv": {}, "dodge": 0, "crit": 0, "block": 0}, true)
	var ye := Stats.stat_unit({"name": "叶蘅", "lv": 3, "st": {"str": 3, "con": 4, "agi": 5, "wil": 4, "wis": 5}}, "ally")
	ye.merge({"hp": ye.mhp, "mp": ye.mmp, "art": "ye_initial", "por": "ye", "key": "ye", "storyYe": true, "atkType": "暗器", "atkName": "飞针",
		"skills": ["jinzhen"], "skLv": {"jinzhen": 1}, "dodge": 0, "crit": 0, "block": 0}, true)
	return [hero, ye]

static func make_lesson() -> RefCounted:
	var L = SELF.new()
	L._allies_fn = _prologue_allies
	return L

## Battle.start({"preset": ...}) 的配置；返回空字典表示未知预设
static func build(preset: String, opt: Dictionary) -> Dictionary:
	match preset:
		"backhill_wolf":
			# prologue-story-battle.js play()
			var L = make_lesson()
			var foes := []
			for i in 2:
				foes.append({"name": "受惊灰狼·后侧" if i else "受惊灰狼·前侧", "sp": "c_wolf", "lv": 1, "st": {"str": 4, "con": 4, "agi": 1, "wil": 2, "wis": 2}, "skills": {"bite": 1},
					"hpMul": 0.43, "atkMul": 0.36, "shield": 2, "weak": ["棍", "刀", "暗器", "阳"], "exp": 0, "silver": 0, "drops": {}, "h": 95})
			return {"storyLesson": L, "allowAuto": opt.get("allowAuto", false), "solo": true, "noLose": true, "noFlee": true, "bg": "bb_prologue_backhill_v1", "foes": foes}
		"lesson", "road":
			return _chapter(preset, preload("res://scripts/npc/util.gd").t(opt.get("learned", false)))
		"bailiff":
			# qihe-battle-review.js bailiff：差役战斗形象验收（普通战斗）
			var foe = DB.g("QiheSparFoes")
			var bga = DB.g("QiheChapterBattleArt")
			return {"allowAuto": true, "solo": true, "noLose": true, "noFlee": true, "heroArt": "hero_village", "heroPor": "opening_hero_village",
				"bg": bga.backgrounds.road if bga else "", "foes": [foe.bailiff.duplicate(true)] if foe else []}
	return {}

## qihe-chapter.js storyBattle(kind)
static func _chapter(kind: String, learned: bool) -> Dictionary:
	var L = make_lesson()
	L.guidance = false; L.mounted = false; L.silent_show = true; L.hide_guide_on_menu = true
	var base: Callable = L._allies_fn
	L._allies_fn = func():
		var a: Array = base.call()
		var h: Dictionary = a[0]
		h.art = "hero_village"; h.por = "opening_hero_village"; h.hp = h.mhp; h.mp = h.mmp
		h.skills = ["qh_hulu_staff"] if learned or kind == "lesson" else []
		h.skLv = {"qh_hulu_staff": int(G.S.get("skills", {}).get("qh_hulu_staff", 1))}
		h.atkName = "练习棍" if kind == "lesson" else "木棍"
		if kind == "lesson": return [h]
		var lu := Stats.stat_unit({"name": "陆衡", "lv": 2, "st": {"str": 5, "con": 6, "agi": 4, "wil": 5, "wis": 4}}, "ally")
		lu.merge({"art": "qh_luheng_v1", "por": "opening_luheng", "hp": lu.mhp, "mp": lu.mmp, "skills": ["qh_hulu_staff"], "skLv": {"qh_hulu_staff": 1}, "atkType": "棍", "atkName": "护路棍", "dodge": 0, "crit": 0, "block": 0}, true)
		return [h, lu]
	var enemy: Dictionary
	if kind == "lesson":
		enemy = {"name": "陆衡 · 收力对练", "sp": "c_qh_luheng_v1", "lv": 1, "st": {"str": 3, "con": 3, "agi": 2, "wil": 2, "wis": 2}, "skills": {"staff": 1}, "hpMul": 0.45, "atkMul": 0.22, "shield": 2, "weak": ["棍"], "h": 170}
	else:
		enemy = {"name": "拦路帮众", "sp": "c_qh_raider_front_v1", "lv": 1, "st": {"str": 4, "con": 4, "agi": 3, "wil": 2, "wis": 2}, "skills": {"blade": 1}, "hpMul": 0.7, "atkMul": 0.5, "shield": 2, "weak": ["棍", "拳", "暗器"], "h": 150}
	var foes := [enemy]
	if kind != "lesson":
		var e2 := enemy.duplicate(true); e2.sp = "c_qh_raider_rear_v1"; e2.name = "拦路帮众·后侧"; foes.append(e2)
	var bga = DB.g("QiheChapterBattleArt")
	return {"storyLesson": L, "allowAuto": kind == "road", "solo": true, "noLose": true, "noFlee": true,
		"bg": bga.backgrounds.get(kind, "") if bga else "", "foes": foes, "preloadPorts": ["p_opening_hero_village", "p_opening_luheng"], "preloadArts": ["qh_luheng_v1", "hero_village"]}

## 调试预设（godot --path game -- --battle=名字）。clash 由 battle.gd 直接走 clash_play()（领队交锋，clash.gd）
static func debug_opt(arg: String) -> Dictionary:
	match arg:
		"backhill_wolf", "ye": return {"preset": "backhill_wolf", "allowAuto": arg == "ye"}
		"lesson": return {"preset": "lesson", "learned": true}
		"road": return {"preset": "road", "learned": true}
		"bailiff": return {"preset": "bailiff"}
	return {"preset": "backhill_wolf"}
