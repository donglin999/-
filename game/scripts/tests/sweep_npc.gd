extends Node
## 全人物扫荡（2026-11-05）：载入一份存档（自动通关沿途留的进度点），把此刻沿出口走得到的每个场景里、每个看得见的人，
## 墨印上出现的每一项都执行一遍（选项多的把每个选项都走一遍，最多 4 个）；没有人物表的人直接“谈”（act）。
## 每做完一项回到做之前的进度，互不影响。记下：报错、“尚未移植”、卡住（25 秒没进展）、做完后玩家动不了。
## 用法：godot --headless --path game -- --sweep-npc=<进度点.json> --out=<报告.json> [--only=<场景id>]

const H := preload("res://scripts/tests/harness.gd")
## 有名有姓、同一时刻只该在一处的人（地图门牌、物件名不算）
const WHO_ONE_PLACE := ["叶蘅", "周婶", "陈伯", "周砚", "陆衡", "小耗子", "货郎", "店家", "药商", "徐令仪", "岑霜", "沈雁回", "乌魁", "蔺管事", "算命先生", "船家", "村口老人", "阿栓", "小禾", "阿炭"]
var h: Node
var args := {}
var stats := {"scenes": 0, "people": 0, "items": 0, "runs": 0, "skipped_off": 0}
var done_list: Array = []
var key := "selftest_sweep"
var entered_cultivation: Array = []   # 做了就进培养模式的（周砚商量去处等），记下来不算问题
## 2026-11-10 用户：村口老人那几个人，闲谈时出现、日常看不到。记下每个场景此刻站着谁（人物行踪表的原始数据），
## 以及“说话的人不在这个场景的地图上”（对话里临时冒出来的人）
var presence := {}      # 场景 id → [{name, id, x, y}]
var offstage: Array = []   # {who, scene, label}
## 隔着门、墙答话（人就在门里、隔壁，剧本里交代过），不算“隔空说话”。knot → 说话人。新加一条要写明人在哪
const THROUGH_DOOR := {
	"qihe_ye_invite": ["叶蘅"],          # 叶家门口：叶蘅在屋里隔门问话（10-28 用户通过的“隔门问话”）
	"qihe_first_night": ["陈伯"],        # 陈家客房歇息：陈伯在隔壁门厅招呼一声
	"@prologue_inn_interior": ["小耗子"], # 客栈：小耗子就坐在门外台阶上（站位在客栈门口），和店家隔门对嘴（fq_aqi_hint_name）
}
## 不算“人物”的说话人：主角、旁白、无名的声音
const SPEAKER_SKIP := ["", "萧白", "旁白", "？？？", "众人", "门外", "远处", "获得", "行程", "路牌", "对证记录"]

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	Engine.time_scale = 3.0   # 淡入淡出、打字机都快放，逻辑不变
	key = "selftest_sweep_" + str(args.get("sweep-npc", "").hash() & 0xffffff)
	h = H.new(); add_child(h)
	await get_tree().process_frame
	await run()
	h.write_report(args.get("out", "user://sweep_npc.json"), {"stats": stats, "done": done_list, "entered_cultivation": entered_cultivation, "from": args.get("sweep-npc", ""), "stage": _stage(), "presence": presence, "offstage": offstage})
	DirAccess.remove_absolute(ProjectSettings.globalize_path("user://saves/%s.json" % key))
	await get_tree().create_timer(0.3).timeout
	get_tree().quit(1 if h.issues.size() else 0)

func run() -> void:
	var snap = JSON.parse_string(FileAccess.get_file_as_string(args.get("sweep-npc", "")))
	if not (snap is Dictionary):
		h.issue("读档失败", "进度点读不出来", args.get("sweep-npc", "")); return
	h.ctx("读档")
	if not await h.load_state(snap, key):
		h.issue("卡住", "读档后动不了", str(snap.get("scene"))); return
	h.flush_errors()
	var base: Dictionary = h.snapshot()
	var scenes: Array = h.reachable(World.cur_id)
	if args.has("only"): scenes = [args.only]
	if args.has("selfcheck"):
		# 测试的测试：在当前场景塞三个假人——没接交互的（应报“尚未移植”）、一做就报错的、做了就卡住不动的，扫荡必须把三样都查出来
		scenes = [World.cur_id]
		var px: float = World.player.x / World.TS; var py: float = World.player.y / World.TS
		var fake := [{"id": "selfcheck-unported", "name": "自检·未移植", "x": px + 2, "y": py},
			{"id": "selfcheck-error", "name": "自检·报错", "x": px + 3, "y": py, "act": func(_n = null): push_error("自检：故意的报错")},
			{"id": "selfcheck-hang", "name": "自检·卡住", "x": px + 4, "y": py, "act": func(_n = null): await get_tree().create_timer(9999).timeout}]
		World.cur.npcs.append_array(fake)
		base = h.snapshot()
		h.stall_s = 4.0
		for sid in scenes:
			await _reset(base, sid)
			for f in fake: await _sweep_npc(base, sid, f.id)
		for f in fake: World.cur.npcs.erase(f)
		var kinds := {}
		for it in h.issues: kinds[it.kind] = true
		var ok := kinds.has("尚未移植") and kinds.has("报错") and kinds.has("卡住")
		print("自检：%s（查出 %s）" % ["通过" if ok else "没通过", ", ".join(kinds.keys())])
		h.issues = [] if ok else [{"kind": "自检没通过", "what": "扫荡没查出故意放的问题", "detail": str(kinds.keys()), "ctx": ""}]
		return
	print("扫荡：进度 %s，可走到的场景 %d 个：%s" % [_stage(), scenes.size(), ", ".join(scenes)])
	for sid in scenes: print("  %s 的门：%s" % [sid, h.doors_here(sid)])
	if args.has("list"):
		await _reset(base, args.list)
		for n in World.scenes[args.list].npcs: print("  场景数据 id=%s act=%s %s" % [n.get("id"), typeof(n.get("act")), n.get("act") if n.get("act") is Dictionary else ""])
		for n in World.npcs: print("  人物 id=%s 名=%s act=%s 墨印=%s" % [n.get("id"), n.get("name"), typeof(n.get("act")), Npc.person_for(n) != null])
		return
	if args.has("doors-only"): return
	if args.has("walk"):   # 调试：从进度点像玩家那样走到某场景，打印沿途台词
		var ok: bool = await h.walk_to(args.walk)
		print("走到 %s：%s，现在在 %s；主线 %s" % [args.walk, ok, World.cur_id, G.S.get("qiheChapter", {}).get("stage", "未开始") if G.S.get("qiheChapter") is Dictionary else "未开始"])
		for l in h.lines: print("  ", l)
		return
	# 2026-11-09 用户试玩：叶蘅在药棚，进叶家她又已经在屋里。同一进度下，有名有姓的人不能同时出现在两个场景
	var where := {}
	for sid in scenes:
		await _reset(base, sid)
		presence[sid] = []
		for n in World.npcs:
			if str(n.get("name", "")) != "" and Npc.person_for(n) != null:
				presence[sid].append({"name": str(n.name), "id": str(n.get("id", "")), "x": snappedf(float(n.x), 0.01), "y": snappedf(float(n.y), 0.01)})
			var nm := str(n.get("name", ""))
			# 2026-11-10：凡是有人物表的人（差役、采办随从这些也是具体某个人）都只该在一处；WHO_ONE_PLACE 留作说明
			if nm in WHO_ONE_PLACE or (nm != "" and Npc.person_for(n) != null):
				if not where.has(nm): where[nm] = []
				if not (sid in where[nm]): where[nm].append(sid)
	for nm in where:
		if where[nm].size() > 1: h.issue("一人两处", "%s 同时出现在 %s" % [nm, "、".join(where[nm])], _stage())
	for sid in scenes:
		stats.scenes += 1
		await _reset(base, sid)
		var ids := []
		for n in World.npcs: ids.append(str(n.get("id", n.get("name", ""))))
		for nid in ids:
			await _sweep_npc(base, sid, nid)

## 跟在主角身后的同伴（他们在哪个场景都算在场）
func _followers() -> Array:
	var out := []
	if G.S == null: return out
	for id in World.party_here():
		out.append(str(DB.PARTY_DEF.get(id, {}).get("name", id)))
	return out

const QUEST := preload("res://scripts/menu/quest.gd")
## 行记快照：每条 id 与当前目标
func _journal() -> Dictionary:
	var o := {}
	if G.S == null: return o
	for r in QUEST.tasks(G.S): o[str(r.get("id"))] = str(r.get("objective", "")) + "|" + str(r.get("status", ""))
	return o

func _stage() -> String:
	var c = G.S.get("qiheChapter") if G.S else null
	return "%s/%s 序章 %s" % [c.stage if c else "-", c.get("halfDay", "-") if c else "-", G.S.prologue.arrival.stage if G.S else "-"]

## 回到基准进度，切到场景 sid（不触发进场剧情，那部分由自动通关测）
func _reset(base: Dictionary, sid: String) -> void:
	await h.unstick()
	G.S = G._fix_numbers(base.duplicate(true))
	G.save_key = key
	G.mode = "scene"
	await Assets.preload_keys(World.scene_asset_keys(sid))
	World.enter_scene_now(sid)
	Flow.prologue().apply_scene(World.cur)
	World.npcs = World.npcs_of(World.cur)
	UI.hud()
	await get_tree().process_frame

func _find(nid: String):
	for n in World.npcs:
		if str(n.get("id", n.get("name", ""))) == nid: return n
	return null

func _sweep_npc(base: Dictionary, sid: String, nid: String) -> void:
	await _reset(base, sid)
	var n = _find(nid)
	if n == null: return
	stats.people += 1
	var p = Npc.person_for(n)
	if p == null:
		await _run_variants(base, sid, nid, "（直接交互）", func(nn, _pp): await Npc.run_act(nn))
		return
	var items: Array = Npc.menu_for(p, n)
	for it in items:
		if it.get("st") == "off":
			stats.skipped_off += 1; continue
		stats.items += 1
		var iid: String = it.id
		await _run_variants(base, sid, nid, "%s「%s」" % [it.ch, it.lab], func(nn, pp):
			var cur_it = null
			for x in Npc.menu_for(pp, nn):
				if x.id == iid: cur_it = x
			if cur_it == null: h.issue("墨印变了", "重进后找不到这一项", iid); return
			var r = await Npc.execute(cur_it, pp, nn)
			while r is Dictionary and r.has("switch"):
				r = await Npc.execute(r.switch.act, r.switch.p, r.switch.npc))

## 同一项按选项走几遍：第一遍都选第一个，遇到几个选项就再把第 2、3、4 个各走一遍
func _run_variants(base: Dictionary, sid: String, nid: String, what: String, fn: Callable) -> void:
	var k := 0
	var kmax := 1
	while k < kmax:
		await _reset(base, sid)
		var n = _find(nid)
		if n == null: return
		var p = Npc.person_for(n)
		World.player.x = float(n.x) * World.TS - 48; World.player.y = float(n.y) * World.TS
		World.snap_cam()
		var label := "%s / %s %s 选项%d" % [sid, n.get("name", nid), what, k + 1]
		h.ctx(label)
		h.max_choices = 0
		var kk := k
		h.choice_policy = func(cnt: int, _q: String) -> int: return kk if kk < cnt else 0
		World.busy = true; UI.prompt_hide()
		var fb0: int = Dialog.feedback
		var tl0: int = UI.toast_log.size()
		var jr0 := _journal()
		var ui0: bool = UI.panel_open()
		var sp0: int = h.speech.size()
		var ch := Flow.get_node_or_null("Chapter")
		var pi0: int = ch.popins.size() if ch else 0
		var here0 := {}
		for x in World.npcs: here0[str(x.get("name", ""))] = true
		for x in _followers(): here0[x] = true
		var ok: bool = await h.guard(label, func(): await fn.call(n, p), 240.0, func(): return G.mode == "cultivation")
		# 2026-11-09 用户试玩：点“谈”什么都没发生。“谈”和直接交互做完既没台词、没选项、没提示，也没打开面板、没换场景、没进培养，就算“没反馈”
		if ok and Dialog.feedback == fb0 and not ui0 and not UI.panel_open() and G.mode == "scene" and World.cur_id == sid and (what.begins_with("谈") or what == "（直接交互）") and float(n.get("talkR", 0)) >= 0:
			h.issue("没反馈", "做完什么也没发生", label)
		# T8 任务没登记（docs/playtest-review.md）：弹了“已接：…”，行记里要多一条或某条的当前目标变了
		var acc := UI.toast_log.slice(tl0).filter(func(x): return str(x).begins_with("已接"))
		if ok and acc.size() and G.S != null and _journal() == jr0:
			h.issue("任务没登记", "提示了“%s”，行记里没变化" % acc[0], label)
		# 说话的人不在这个场景的地图上：对话里临时冒出来、平时又看不到的人（只看还在本场景时说的话）
		var seen := {}
		for sp in h.speech.slice(sp0):
			var who := str(sp.who)
			if sp.scene != sid or who in SPEAKER_SKIP or here0.has(who) or seen.has(who) or sp.get("gather"): continue
			if who in THROUGH_DOOR.get(str(sp.get("knot", "")), []) or who in THROUGH_DOOR.get("@" + sid, []): continue
			seen[who] = true
			offstage.append({"who": who, "scene": sid, "label": label, "knot": str(sp.get("knot", ""))})
			h.issue("隔空说话", "%s 不在这个场景的地图上却开口说话" % who, label)
		if ch:
			for i in range(pi0, ch.popins.size()):
				ch.popins[i]["label"] = label
				if not ch.popins[i].get("gather"): h.issue("临时出场", "%s 平时不在这里，搭话时被临时摆了出来" % ch.popins[i].name, label)
		if G.mode == "cultivation": entered_cultivation.append(label); await h.unstick()
		Npc.capture_keys(Callable()); Npc.clear()
		World.busy = false
		if ok and not await h.idle(20):
			h.issue("卡住", "做完后玩家动不了", label)
		h.flush_errors()
		stats.runs += 1
		done_list.append(label)
		if k == 0: kmax = clampi(h.max_choices, 1, 4)
		k += 1
	h.choice_policy = func(_c: int, _q: String) -> int: return 0
