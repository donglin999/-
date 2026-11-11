extends Node
## 三方跑腿（原版 js/qihe-outsiders.js）：徐令仪的拜帖、岑霜的旧罐与玉匣、沈雁回的药单。
## 台词在 ink 剧本 story/01-开始/三方-跑腿-*.ink（qihe_errand_<键>_<段>）：offer 托付、wait 提醒、check 核对、witness 差役作证、turnin 回话、done 办完后。
## 这里只留任务名、行程说明、给多少路费和办完后的摘要。存档 S.prologue.outsiders。

var side: Node

const DEFS := {
	"letter": {"name": "一封未落款的拜帖", "owner": "徐令仪", "flag": "skill", "reward": 6,
		"steps": {"accepted": "去村子东北的陈伯家，请陈伯看看拜帖该给谁。", "checked": "回南村口联络院门前，把陈伯的话带给徐令仪。"},
		"summary": "徐令仪托你送一封空着收帖人的拜帖。陈伯看出帖上写着“旧谱登记”，让你带话：东西有主人，要问就问叶蘅本人。"},
	"account": {"name": "旧罐与玉匣", "owner": "岑霜", "flag": "box", "reward": 8,
		"steps": {"accepted": "去南村口药摊，问药商那笔账到底买的是什么。", "checked": "回东埠装卸路，把药商的话带给岑霜。"},
		"summary": "岑霜托你核乌魁带回的旧货账：药商只卖过六只旧药罐，玉匣他连见都没见过。"},
	"ledger": {"name": "药单上的两道数", "owner": "沈雁回", "flag": "inspection", "reward": 6,
		"steps": {"accepted": "去村子东边的药棚，问周婶那几篓药各是什么。", "checked": "回东埠核货点，请差役一起看看验收栏，再回话给沈雁回。", "witnessed": "回东埠核货点，把核对的结果告诉沈雁回。"},
		"summary": "沈雁回托你核药单：两篓货药、一篓病人药包分开记；“已验”那栏没人签字，采办报的数还要再查。"}}
## 2026-10-23：徐令仪的拜帖在第二天白天（半日 2～3），岑霜、沈雁回的在第三天（半日 4～5）
const OPENS := {"letter": 2, "account": 4, "ledger": 4}
const DEADLINES := {"letter": 4, "account": 6, "ledger": 6}
const DEADLINE_LABELS := {4: "第二天傍晚前", 6: "第三天傍晚前"}
const REPRESENTATIVES := {"xulingyi": "letter", "censhuang": "account", "shenyanhui": "ledger"}
const CHECKS := {"陈伯": ["letter"], "药商": ["account"], "周婶": ["ledger"], "差役": ["ledger"]}
const SPRITES := {"萧白": "c_hero", "陈伯": "c_opening_chen", "药商": "c_opening_apothecary", "周婶": "c_opening_aunt", "差役": "c_opening_bailiff",
	"徐令仪": "c_qh_xulingyi_story", "岑霜": "c_qh_censhuang_story", "沈雁回": "c_qh_shenyanhui_story"}
var running := false

func _ready() -> void:
	_install()

func quest_open(k: String) -> bool:
	var p = side.CP()
	if p == null: return false
	var h: int = int(p.get("halfDay", 0))
	return h >= OPENS[k] and h < DEADLINES[k]

func appeared(id: String) -> bool:
	var p = side.CP()
	return p != null and p.get("events", {}).get("xu-meeting" if id == "xulingyi" else "three-meeting", false)

## 2026-11-11 清掉旧 id（steward／wukui／procurement）：三方委托只由三位代表对接，handles()、key_for() 一并删了
func representative_key(id: String): return REPRESENTATIVES.get(id)

func available() -> bool:
	if G.S == null: return false
	var pr = G.S.get("prologue")
	if not (pr is Dictionary): return false
	var p = side.CP()
	return pr.get("arrival", {}).get("stage") == "done" and not pr.get("ending") and (p == null or p.stage in ["opening", "days"])

func store() -> Dictionary:
	if not G.S.prologue.has("outsiders"): G.S.prologue.outsiders = {"version": 1, "quests": {}}
	if not G.S.prologue.outsiders.has("quests"): G.S.prologue.outsiders.quests = {}
	return G.S.prologue.outsiders

func get_q(k: String) -> Dictionary:
	var q: Dictionary = store().quests
	if not q.has(k): q[k] = {"stage": "none", "choice": null, "rewarded": false}
	return q[k]

func contact_state() -> Dictionary:
	var s := store()
	if not s.has("contacts"): s.contacts = {"stage": "opening", "events": {}, "questions": {}}
	return s.contacts

func errand_label(id: String) -> String:
	var k: String = representative_key(id); var n: String = DEFS[k].name
	var q = G.S.prologue.get("outsiders", {}).get("quests", {}).get(k)
	if q is Dictionary and q.get("stage") == "done": return "“上回「" + n + "」那件事……”"
	if not (q is Dictionary) or q.get("stage") == "none": return "“有什么要我帮忙的吗？”"
	return "“「" + n + "」的事，我来回话。”"

func location(id: String) -> String:
	if id == "xulingyi": return "南村口 · 联络院门前"
	if id == "shenyanhui": return "东埠 · 采办核货点"
	return "东埠 · 装卸路" if side.half() >= 4 else "南村口 · 车道旁"

## 行记“三方对接”条目（contactRecords）
func contact_records() -> Array:
	if not available(): return []
	var p = side.CP()
	var questions = p.get("questions") if p != null else G.S.prologue.get("outsiders", {}).get("contacts", {}).get("questions", {})
	if questions == null: questions = {}
	var out := []
	for id in REPRESENTATIVES:
		if not appeared(id): continue
		var k: String = REPRESENTATIVES[id]
		out.append({"t": {"xulingyi": "正道盟", "censhuang": "归烬堂", "shenyanhui": "巡江司"}[id] + "对接 · " + DEFS[k].owner, "group": "三方对接",
			"d": "找" + DEFS[k].owner + "聊聊：问问她是什么人、来村里做什么，或者帮她跑跑腿。", "where": location(id) + " · " + DEFS[k].owner, "chapterNpc": id, "done": side.C.truthy(questions.get(id + "-dispute", false))})
	return out

func cast(who: String) -> Array:
	var c := [{"who": G.S.get("name", "萧白"), "sp": "c_hero", "slot": "left"}]
	if SPRITES.has(who) and who != "萧白": c.append({"who": who, "sp": SPRITES[who], "slot": "right"})
	return c

## lines(rows)：outsider-scene 站位（不摆地图临时站位）
func lines(rows: Array) -> void:
	var names := []
	for r in rows:
		if r[0] != "萧白" and SPRITES.has(r[0]) and not names.has(r[0]): names.append(r[0])
	var c := [{"who": G.S.get("name", "萧白"), "sp": "c_hero", "slot": "left"}]
	for w in names: c.append({"who": w, "sp": SPRITES[w]})
	await Dialog.with_cast("outsider-scene", c, func():
		for r in rows: await Dialog.say(r[0], r[1]))

func ask(who: String, text: String, options: Array) -> int:
	return await Dialog.with_cast("outsider-choice", cast(who), func(): return await Dialog.choose(who, text, options))

## story(k, part)：QiheRepresentatives.play 的写法（reps_beat 分段，选项先把攒下的台词演完），但用本模块的 lines / ask
func story(k: String, part: String, externals: Dictionary = {}, vars: Dictionary = {}) -> void:
	var buf := []
	var cg := {"shot": null, "rows": []}
	var flush := func():
		if buf.is_empty(): return
		var rows := buf.duplicate(); buf.clear()
		await lines(rows)
	var ext := {"reps_beat": flush}
	for key in externals:
		var fn: Callable = externals[key]
		ext[key] = func(a = null, b = null):
			await flush.call()
			return await fn.callv([a, b].filter(func(x): return x != null))
	ext.cg_begin = func(shot): await flush.call(); cg.shot = shot; cg.rows = []
	ext.cg_end = func():
		var shot = cg.shot; var rows: Array = cg.rows
		cg.shot = null; cg.rows = []
		await side.C.cg_play(shot, rows)
	await Story.play("qihe_errand_%s_%s" % [k, part], {"vars": vars, "externals": ext,
		"line": func(_id, who, text, _o = {}): (cg.rows if cg.shot != null else buf).append([who, text]),
		"choose": func(w, t, opts): await flush.call(); return await ask(w, t, opts)})
	await flush.call()

func guarded(fn: Callable):
	if running: return null
	running = true
	var was := World.busy
	World.busy = true; World.keys = {}; World.player.path = null
	var r = await fn.call()
	running = false; World.busy = was; World.keys = {}
	side.save()
	return r

func owner(k: String) -> void:
	var d: Dictionary = DEFS[k]; var q := get_q(k)
	if q.stage == "done": await story(k, "done"); return
	if not quest_open(k): return
	if k == "ledger" and q.stage == "checked": await check(k, "差役", true)
	if q.stage == "none":
		var taken := [false]
		await story(k, "offer", {"errand_accept": func(): taken[0] = true; q.stage = "accepted"; side.save()})
		if taken[0]: UI.toast("已接：" + d.name, 1600)
		return
	var ready := "witnessed" if k == "ledger" else "checked"
	if q.stage != ready:
		await story(k, "wait", {}, {"checked": q.stage == "checked"} if k == "ledger" else {}); return
	var choice := [0]
	await story(k, "turnin", {"errand_choice": func(n): choice[0] = n})
	q.choice = choice[0]; q.stage = "done"
	if not q.get("rewarded"):
		G.S.silver = side.silver() + int(d.reward); q.rewarded = true
	side.save()
	UI.toast(d.name + " · 已完成 · 路费 %d 文" % int(d.reward), 2000)

func check(k: String, role: String, from_owner := false) -> void:
	var q := get_q(k); var d: Dictionary = DEFS[k]
	if not quest_open(k): return
	if not G.S.prologue.has("heard"): G.S.prologue.heard = {}
	if role == "差役":
		if q.stage != "checked": return
		await story(k, "witness", {}, {"from_owner": from_owner})
		q.stage = "witnessed"; G.S.prologue.heard.inspection = true
	else:
		if q.stage != "accepted": return
		await story(k, "check")
		q.stage = "checked"
		if k != "ledger": G.S.prologue.heard[d.flag] = true
	q.evidence = "周婶说一篓是病人药包，且无人查验；还需向差役核实签字。" if (k == "ledger" and q.stage == "checked") else d.summary
	side.save()
	UI.toast("行程已更新：" + d.name, 1500)

func talk(id: String) -> void:
	var k = representative_key(id)
	if k != null and available(): await guarded(func(): await owner(k))

func pending_for(who: String) -> Array:
	var out := []
	for k in CHECKS.get(who, []):
		if quest_open(k) and get_q(k).stage == ("checked" if who == "差役" else "accepted"): out.append(k)
	return out

## 给陈伯、药商、周婶、差役原有的交互加一支“我来问问……”，原来的事照旧可办
func _install() -> void:
	var re := RegEx.create_from_string("^(qh_|qihe_|prologue_)")
	for sid in World.scenes:
		if re.search(sid) == null: continue
		for n in World.scenes[sid].get("npcs", []):
			if not CHECKS.has(n.get("name")) or n.get("act") == null: continue
			_wrap(n)

func _wrap(n: Dictionary) -> void:
	var original: Callable = side.act_of(n)
	n.act = func(a = null):
		if not available(): return await original.call(a)
		var pending := pending_for(n.name)
		if pending.is_empty(): return await original.call(a)
		var tk := Dialog.begin("outsider-npc:" + str(n.id), cast(n.name))
		var opts := pending.map(func(k): return "“我来问问「" + DEFS[k].name + "」的事。”")
		opts.append("“没别的，就来看看。”"); opts.append("“打扰了。”")
		var i := await ask(n.name, "找我有事？", opts)
		var r = null
		if i < pending.size(): r = await guarded(func(): await check(pending[i], n.name))
		elif i == pending.size(): r = await original.call(a)
		Dialog.end(tk)
		return r

## 行记“委托”条目（原版包裹 mnQuests 追加的部分）
func quest_records() -> Array:
	if G.S == null or not (G.S.get("prologue") is Dictionary): return []
	var out := []
	var p = side.CP()
	for k in DEFS:
		var d: Dictionary = DEFS[k]
		var q = G.S.prologue.get("outsiders", {}).get("quests", {}).get(k)
		if not (q is Dictionary) or q.get("stage") == "none": continue
		var left: bool = p != null and not (p.stage in ["opening", "days"])
		var closed: bool = q.stage != "done" and (left or not quest_open(k))
		var id := ""
		for r in REPRESENTATIVES:
			if REPRESENTATIVES[r] == k: id = r
		var target = {"letter": "chen-door", "account": "merchant", "ledger": "clinic-door"}[k] if q.stage == "accepted" else id
		var desc: String
		if q.stage == "done": desc = d.summary
		elif closed: desc = "随撤离中止；已知线索保留，不影响主线。" if left else "过了时限没办成；已知线索保留，不影响主线。"
		else: desc = str(d.steps.get(q.stage, "")) + "（时限：" + DEADLINE_LABELS[DEADLINES[k]] + "）"
		var where: String
		if q.stage == "accepted": where = {"letter": "村内东北 · 陈伯家门厅", "account": "南村口 · 药商", "ledger": "村内东侧 · 药棚"}[k]
		elif closed or q.stage == "done": where = "栖河 · 委托记录"
		else: where = location(id) + " · " + d.owner
		out.append({"t": d.name, "d": desc, "giver": d.owner, "where": where, "chapterNpc": null if (closed or q.stage == "done") else target, "done": q.stage == "done", "closed": closed})
	return out
