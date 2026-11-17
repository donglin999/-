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
	h.write_report(args.get("out", "user://sweep_npc.json"), {"talks": talks, "stats": stats, "done": done_list, "entered_cultivation": entered_cultivation, "from": args.get("sweep-npc", ""), "stage": _stage(), "presence": presence, "offstage": offstage})
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
	if args.has("cast-run"):
		await _cast_run(); return
	if args.has("stage-run"):
		# 走位连拍与黑场断言（2026-11-13，见 stage_run.gd）
		var sr = load("res://scripts/tests/stage_run.gd").new()
		await sr.run(self); return
	if args.has("talk-audit"):
		await _talk_audit(base, scenes); return
	if args.has("cast-audit"):
		for sid in scenes:
			await _reset(base, sid)
			_cast_check("%s / %s" % [_stage(), sid])
		return
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
	# 2026-11-13 跟在主角身后的人不能同时站在别处：每进一个场景按当时的状态查一遍
	for sid in scenes:
		await _reset(base, sid)
		_cast_check("%s / %s" % [_stage(), sid])
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

# ─────────────────────── “谈”专项（2026-11-13） ───────────────────────
## 用户试玩：对着叶蘅点“谈”没东西；村口老人点“谈”先黑一下屏才开口。上面的“没反馈”只看有没有任何台词或选项，
## 一上来就弹“行程：药棚帮忙。现在开始／再想想”也算有反馈，所以一直没查出来。这里只做“谈”，标准收紧：
## - 谈为空：整段没有一句是人说的（“行程”“主线”“获得”这类系统框不算），也没开面板、没换场景；
## - 先弹选项：第一个选项弹出来之前没有人开口（玩家看到的就是“点了谈，没人说话，只问我做不做事”）；
## - 谈前黑场：第一句话出来之前画面先黑了一下（普通搭话不该有转场）；
## - 能看见的人墨印上没有“谈”、或“谈”是灰的，单独列出来（不算问题，供人看）。
## 用法：godot --headless --path game -- --sweep-npc=<进度点.json> --talk-audit [--pick=first|last] --out=<报告.json>
## 选项默认选最后一个（多半是“再想想”，不推进主线）；--pick=first 选第一个。
const SYSTEM_BOX := ["", "旁白", "？？？", "获得", "行程", "主线", "路牌", "对证记录", "栖河对证记录"]
## 点“谈”就跳时间／换地点的人：这种黑场是有意的转场，不算“谈前黑场”。新加一条要写明是哪场戏、字幕是哪句。
## 2026-11-13 起站位戏开场一律走位、不黑场（chapter.gd 的 _apply 不再调 UI.fade），“把众人聚到一处”不再是留白名单的理由。
## 剩下这一条是时间跳转：邻村找周砚开三方对证，evidence_body 先 go("refuge", "zhouyan") 重进场景（黑场），
## 第一句就是时间字幕“【次日清晨 · 邻村】”（R4-01）。同一人的“商量去处”不跳时间，实测没有黑场。
const EVENT_TALK := {"qh_refuge/zhouyan": "三方对证：隔夜跳到次日清晨，有时间字幕 R4-01"}
var talks: Array = []

func _talk_audit(base: Dictionary, scenes: Array) -> void:
	var pick_first: bool = args.get("pick", "last") == "first"
	for sid in scenes:
		stats.scenes += 1
		await _reset(base, sid)
		var ids := []
		for n in World.npcs:
			if Npc.person_for(n) != null: ids.append(str(n.get("id", n.get("name", ""))))
		for nid in ids:
			await _reset(base, sid)
			var n = _find(nid)
			if n == null: continue
			var p = Npc.person_for(n)
			if p == null: continue
			stats.people += 1
			var row := {"scene": sid, "id": nid, "name": str(n.get("name", "")), "stage": _stage()}
			var it = null
			for x in Npc.menu_for(p, n):
				if x.id == "tan": it = x
			if it == null:
				row["result"] = "墨印上没有谈"; talks.append(row); continue
			if it.get("st") == "off":
				row["result"] = "谈是灰的：" + str(it.get("note", "")); talks.append(row); continue
			World.player.x = float(n.x) * World.TS - 48; World.player.y = float(n.y) * World.TS
			World.snap_cam()
			var label := "%s / %s 谈" % [sid, row.name]
			h.ctx(label)
			h.choice_policy = func(cnt: int, _q: String) -> int: return 0 if pick_first else cnt - 1
			World.busy = true; UI.prompt_hide()
			h.lines.append("—— " + label)   # 隔一行：底座遇到和上一条相同的台词不重复记，两个人说同一句（阿栓、小禾）会被当成没说
			var l0: int = h.lines.size()
			var ch_node := Flow.get_node("Chapter")
			var f0: int = ch_node.fades.size()
			var t_wait := Time.get_ticks_msec()
			while UI._fade.modulate.a > 0.02 and Time.get_ticks_msec() - t_wait < 3000: await get_tree().process_frame   # 等上一轮的黑场淡完
			var choice_who := {}   # 选项题面是谁说的（底座的记录里选项不带说话人）
			var px0: float = World.player.x; var py0: float = World.player.y
			# 黑场采样：UI._fade 的不透明度；记下第一次变黑时已经出过几句
			var fade := {"on": true, "peak": 0.0, "at": -1}
			var sampler := func():
				while fade.on:
					var a: float = UI._fade.modulate.a
					if a > fade.peak: fade.peak = a
					if a > 0.3 and fade.at < 0: fade.at = h.lines.size() - l0
					if Dialog.visible_now() and Dialog._choice_buttons.size(): choice_who[str(Dialog.txt.text)] = str(Dialog._cur.get("who", ""))
					await get_tree().process_frame
			sampler.call()
			var ok: bool = await h.guard(label, func(): await Npc.execute(it, p, n), 240.0, func(): return G.mode == "cultivation")
			fade.on = false
			var said: Array = h.lines.slice(l0)
			var human := 0; var human_before_choice := 0; var seen_choice := false; var target := 0
			var first_sys := -1; var li := -1   # 第一个“行程／主线”选项是第几行
			var base_name: String = row.name.split(" · ")[0]
			for l in said:
				li += 1
				var s := str(l)
				var who := s.get_slice("：", 0).split(" · ")[0]
				if s.begins_with("【选项】"):
					# 题面由人说出来的（“货郎：小兄弟，过来瞧瞧！”＋选项）算人开了口；“行程”“主线”框问的不算
					who = str(choice_who.get(s.trim_prefix("【选项】").get_slice(" → ", 0), "")).split(" · ")[0]
					if who in SYSTEM_BOX:
						if first_sys < 0: first_sys = li
						seen_choice = true; continue
				if who in SYSTEM_BOX: continue
				human += 1
				if not seen_choice: human_before_choice += 1
				if who == base_name or who == Flow.get_node("Chapter").CAST_ALIAS.get(base_name, "") or Flow.get_node("Chapter").CAST_ALIAS.get(who, "") == base_name: target += 1
			var moved: bool = World.cur_id != sid or G.mode != "scene" or UI.panel_open()
			row["lines"] = said
			row["staged_fade"] = ch_node.fades.slice(f0)
			row["fade_peak"] = snappedf(fade.peak, 0.01)
			row["jump"] = snappedf(Vector2(World.player.x - px0, World.player.y - py0).length(), 1.0) if World.cur_id == sid else -1.0
			var res := "好"
			if not ok: res = "卡住"
			elif human == 0 and not moved: res = "谈为空"
			elif seen_choice and human_before_choice == 0: res = "先弹选项"
			# 开口前黑场一律算；选最后一项（不答应做事）时，说到一半黑场挪人也算——普通搭话从头到尾不该有转场
			elif not moved and not EVENT_TALK.has(sid + "/" + nid) and (fade.at == 0 or (not pick_first and fade.at > 0 and (first_sys < 0 or fade.at <= first_sys))): res = "谈前黑场"
			elif target == 0 and not moved: res = "对方没开口"
			row["result"] = res
			if res in ["谈为空", "先弹选项", "谈前黑场"]: h.issue(res, "%s（%s）点“谈”：%s" % [row.name, sid, " / ".join(said.slice(0, 3)) if said.size() else "什么也没有"], _stage())
			talks.append(row)
			if G.mode == "cultivation": await h.unstick()
			Npc.capture_keys(Callable()); Npc.clear()
			World.busy = false
			await h.idle(20)
			h.flush_errors()
			stats.runs += 1
	h.choice_policy = func(_c: int, _q: String) -> int: return 0

# ─────────────────────── 人物行踪：一人一处、跟随者不站在别处（2026-11-13） ───────────────────────
## 按此刻的进度和主角所在场景，把走得到的场景里看得见的有名有姓的人数一遍（各场景的出现条件都按“主角在这儿”算）：
## 一个人不能出现在两个场景；跟在主角身后的人不能同时站在任何场景里；同一个场景里一个人不能有两个。
## 用法：godot --headless --path game -- --sweep-npc=<进度点.json> --cast-audit（逐个可到的场景查）；全人物扫荡每次也会查
func _cast_check(label: String) -> Dictionary:
	var where := {}      # 名字 → [场景 id…]（同场景重复也记）
	for sid in h.reachable(World.cur_id):   # 只数此刻沿出口走得到的场景（邻村、山上这些没到的地方不算）
		for n in World.npcs_of(World.scenes[sid]):
			var nm := str(n.get("name", ""))
			if nm == "" or Npc.person_for(n) == null: continue
			if not where.has(nm): where[nm] = []
			where[nm].append(sid)
	World.npcs = World.npcs_of(World.cur)
	for nm in where:
		if where[nm].size() > 1: h.issue("一人两处", "%s 同时出现在 %s" % [nm, "、".join(where[nm])], label)
	var fol := _followers()
	for nm in fol:
		if where.has(nm): h.issue("跟随者又站在别处", "%s 跟在主角身后，同时站在 %s" % [nm, "、".join(where[nm])], label)
	return {"where": where, "followers": fol}

## 连着演一遍“借宿 → 出药棚 → 叶家；次日药摊 → 村心 → 药棚见来客 → 东埠送药 → 叶家收药箱 → 出门”，每一步查叶蘅在哪。
## 用法：tools/gd_bg.sh --resolution 1280x720 -- --sweep-npc=tests/saves/progress/01-prologue-done.json --cast-run --snap-dir=<目录>
##（无头也能跑，只是不截图）。第二段读同目录下的 04-first-night.json
var _run_log: Array = []
func _cast_step(name: String, want: String) -> void:
	await get_tree().create_timer(0.6).timeout
	var r := _cast_check(name)
	var ye: Array = r.where.get("叶蘅", [])
	var got := ("跟随" if "叶蘅" in r.followers else "") + ("+" if ("叶蘅" in r.followers and ye.size()) else "") + "、".join(ye)
	if got == "": got = "不在"
	var extra := []
	for n in World.npcs:
		if str(n.get("id", "")).begins_with("staged-") or str(n.get("id", "")).begins_with("pa_"): extra.append(str(n.id))
	if extra.size(): h.issue("戏演完人没撤", "%s 里还留着 %s" % [World.cur_id, ", ".join(extra)], name)
	if got != want: h.issue("叶蘅位置不对", "应是「%s」，实际「%s」" % [want, got], name)
	var f = World.followers[0] if World.followers.size() else null
	var line := "%s｜主角在 %s (%.0f,%.0f)｜叶蘅：%s%s｜%s" % [name, World.cur_id, World.player.x, World.player.y, got,
		("（身后 %.0f 像素）" % Vector2(f.x - World.player.x, f.y - World.player.y).length()) if f != null else "", "对" if got == want else "【不对，应是 %s】" % want]
	print("行踪连演：", line); _run_log.append(line)
	if args.has("snap-dir") and DisplayServer.get_name() != "headless":
		Engine.time_scale = 1.0
		await get_tree().create_timer(0.5).timeout
		await RenderingServer.frame_post_draw
		DirAccess.make_dir_recursive_absolute(args["snap-dir"])
		get_viewport().get_texture().get_image().save_png(str(args["snap-dir"]).path_join(name + ".png"))
		Engine.time_scale = 3.0

func _cast_go(sid: String, at = null) -> void:
	await h.guard("去 " + sid, func(): await World.go_scene(sid, at), 120)
	await h.idle(90)

## 让主角朝一个方向走一段（按住方向键），好看出身后的人跟着走
func _cast_walk(dir: String, secs: float) -> void:
	World.keys = {dir: 1}
	await get_tree().create_timer(secs).timeout
	World.keys = {}
	await get_tree().process_frame

func _cast_run() -> void:
	var ch: Node = Flow.get_node("Chapter"); var P: Node = Flow.prologue()
	h.choice_policy = func(_n: int, _q: String) -> int: return 0
	# 一、借宿那晚：回到“下山进村、到药棚”那一步重演
	G.S.prologue.arrival.stage = "lodging"; G.S.prologue.arrival.greeted = {}
	G.S.prologue.erase("yeHold")
	h.ctx("借宿")
	await h.guard("借宿", func(): await P.play_arrival(), 240)
	await h.idle(60)
	await _cast_step("A1-借宿演完-还在药棚", "prologue_clinic_interior")
	var cy = _find("daily-ye")
	if cy != null:
		World.player.x = float(cy.x) * World.TS - 50; World.player.y = float(cy.y) * World.TS + 6
		var sp0: int = h.speech.size()
		await h.guard("药棚里和叶蘅搭话", func(): await ch.interact("ye"), 60)
		await h.idle(30)
		var said: Array = h.speech.slice(sp0).map(func(x): return str(x.who))
		print("行踪连演：药棚里搭话，开口的人 ", said)
		if not ("叶蘅" in said): h.issue("谈为空", "借宿后在药棚和叶蘅搭话，她没开口", "借宿")
	await _cast_go("qihe_trial")
	await _cast_step("A2-出了药棚-她回家", "prologue_ye_house")
	await _cast_go("prologue_ye_house")
	await _cast_step("A3-进叶家-她在屋里", "prologue_ye_house")
	# 二、次日起：读“第一夜过完”的进度点
	var f2: String = str(args.get("sweep-npc", "")).get_base_dir().path_join("04-first-night.json")
	var snap = JSON.parse_string(FileAccess.get_file_as_string(f2))
	if not (snap is Dictionary): h.issue("读档失败", "读不出 " + f2, ""); return
	await h.unstick()
	if not await h.load_state(snap, key): h.issue("卡住", "读档后动不了", f2); return
	h.ctx("次日药摊")
	await h.guard("次日药摊", func(): await ch.begin(), 240)
	await h.idle(90)
	await _cast_step("B1-药摊演完-跟在身后", "跟随")
	await _cast_walk("right", 1.2)
	await _cast_step("B2-南村口走一段-跟着走", "跟随")
	var fo = World.followers[0] if World.followers.size() else null
	if fo != null and fo.npc is Dictionary:
		var near = World.nearest()
		print("行踪连演：身后的叶蘅能不能搭话 ", near != null and near.get("id") == "follow-ye" or Npc.person_for(fo.npc) != null)
		var sp1: int = h.speech.size()
		await h.guard("和身后的叶蘅搭话", func(): await ch.interact("ye"), 60)
		await h.idle(30)
		var said2: Array = h.speech.slice(sp1).map(func(x): return str(x.who))
		print("行踪连演：路上搭话，开口的人 ", said2)
		if not ("叶蘅" in said2): h.issue("谈为空", "和身后的叶蘅搭话，她没开口", "次日")
	else: h.issue("跟随者不能搭话", "身后的叶蘅没有人物字典", "次日")
	await _cast_go("qihe_trial")
	await _cast_step("B3-村心-跟在身后", "跟随")
	G.S.aqiTeach = {"wage": 1}   # 小耗子那一课算上过了（同自动通关的做法），主线轮到“去药棚见来客”
	await _cast_go("prologue_inn_interior")
	await _cast_step("B4-进客栈-她在门外等", "不在")
	await _cast_go("qihe_trial")
	# 进药棚：到地方站定，进门就问“去药棚见来客”，选“开始” → 徐令仪上门（村心）
	await _cast_go("prologue_clinic_interior")
	await _cast_step("B5-见来客演完-村心-跟在身后", "跟随")
	await _cast_go("qh_east")
	await _cast_step("B6-东埠送药演完-跟在身后", "跟随")
	await _cast_go("qihe_trial")
	await _cast_step("B7-回村心-跟在身后", "跟随")
	await _cast_go("prologue_ye_house")
	await _cast_step("B8-收拾药箱演完-她还在屋里", "prologue_ye_house")
	await _cast_go("qihe_trial")
	await _cast_step("B9-出了叶家-她去药棚", "prologue_clinic_interior")
	await _cast_go("prologue_clinic_interior")
	await _cast_step("B10-药棚-她在这儿", "prologue_clinic_interior")
	if args.has("snap-dir"):
		var fa := FileAccess.open(str(args["snap-dir"]).path_join("run.txt"), FileAccess.WRITE)
		if fa: fa.store_string("\n".join(_run_log) + "\n")
