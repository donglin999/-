extends Node2D
## 探索地图引擎：逐段移植原版 js/scene.js（移动、碰撞、A* 寻路、镜头、出入口、路人、跟随者、深度排序、遮挡半透明、氛围）。
## 坐标与原版一致：世界像素，格 TS=40；屏幕 = 世界 × ZOOM（5/6）。时间单位毫秒，固定 1000/60 小步推进。
## 场景数据来自 data/runtime/sc.json（原版运行时导出）；NPC 的 show/act、场景 enter/fx/over 等逻辑由流程脚本挂成 Callable。

const TS := 40.0
const ZOOM := 5.0 / 6.0
const VW := 960.0 / ZOOM
const VH := 540.0 / ZOOM
const CHAR_H := 92.0
const SPEED := 0.27
const FOLLOW_GAP := 52.0
const RUN_MUL := 1.88
const RUN_PATH := 8.0 * 40
const RUN_PATH_TOUCH := 5.0 * 40
const FOOT_X := 7.0
const EXIT_WALK := 44.0
const ENTER_WALK := 52.0
const DV := {"u": Vector2(0, -1), "d": Vector2(0, 1), "l": Vector2(-1, 0), "r": Vector2(1, 0)}
const OPP := {"u": "d", "d": "u", "l": "r", "r": "l"}
const NB8 := [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
const SCENE_STEP := 1000.0 / 60.0

class Actor:
	var x := 0.0
	var y := 0.0
	var dir := "d"
	var walk := 0.0
	var vx := 0.0
	var vy := 0.0
	var moving := false
	var running := false
	var path = null          # Array[Vector2] 或 null
	var goal = null          # {x,y,t}
	var trail: Array = []    # [[x,y,dir]]
	var talk_to = null
	var run_path := false
	var run_k := 0.0
	var alpha := 1.0
	var anim = null
	var step := -1
	# 路人/跟随者用
	var sp := ""
	var m := ""
	var mode := ""
	var source = null
	var box = null
	var pts = null
	var pi := 0
	var face := ""
	var tx = null
	var ty := 0.0
	var wait := 0.0
	var ph := 0.0
	var barks = null
	var bt := 0.0
	var spd := 0.06
	var hx = null
	var hy := 0.0
	var idle := 0.0
	var talk := 0

var scenes := {}            # 全部场景（Dictionary）
var cur: Dictionary = {}
var cur_id := ""
var GW := 48.0
var GH := 27.0
var WW := 1920.0
var WH := 1080.0
var player := Actor.new()
var keys := {}
var particles: Array = []
var cam := Vector2.ZERO
var camC := Vector2.ZERO
var cam_intro = null
var wanderers: Array = []
var followers: Array = []
var bubbles: Array = []
var amb := {"sparks": [], "ducks": [], "birds": [], "bt": 0.0}
var busy := false
var walk_run_toggle := false
var npcs: Array = []        # 当前可见 NPC（npcsOf）
var _mask := PackedByteArray()
var _mask_w := 0
var _mask_h := 0
var _ms := 1.0
var _grid := PackedByteArray()
var _nav := {}
var _elapsed := 0.0
var _t := 0.0                # 绘制时间（毫秒，原版 rAF 的 t）
var _last_draw := 0.0
var _fdt := 16.0
var nav_data := {}
var occ_grids := {}
var still := {}              # 角色键 → 开始站着的时刻
var active := false          # mode=='scene'

signal scene_entered(id)

func _ready() -> void:
	scenes = Data.json("res://data/runtime/sc.json")
	nav_data = Data.json("res://data/runtime/nav.json")
	set_process(true)

# ─────────────────────── 场景尺寸、mask、可站判定 ───────────────────────
func set_dims(sc: Dictionary) -> void:
	GW = float(sc.get("gw", 48) if sc.get("gw") != null else 48)
	GH = float(sc.get("gh", 27) if sc.get("gh") != null else 27)
	WW = GW * TS
	WH = GH * TS

func _in_r(c: int, r: int, R: Array) -> bool:
	return c >= R[0] and c <= R[2] and r >= R[1] and r <= R[3]

func build_grid(sc: Dictionary) -> void:
	set_dims(sc)
	if sc.has("_m"):
		_mask = sc._m; _mask_w = sc.mask.w; _mask_h = sc.mask.h; _ms = WW / _mask_w; _grid = sc._grid
		return
	var gw := int(ceil(GW)); var gh := int(ceil(GH))
	var grid := PackedByteArray(); grid.resize(gw * gh)
	if sc.get("mask") is Dictionary:
		var M: Dictionary = sc.mask
		var b := Marshalls.base64_to_raw(M.d)
		var a := PackedByteArray(); a.resize(int(M.w) * int(M.h))
		for i in a.size():
			a[i] = (b[i >> 3] >> (7 - (i & 7))) & 1
		sc._m = a
		_mask = a; _mask_w = int(M.w); _mask_h = int(M.h); _ms = WW / _mask_w
		for r in gh:
			for c in gw:
				grid[r * gw + c] = 1 if _m_ok(c * TS + TS / 2, r * TS + TS / 2) else 0
	else:
		sc._m = PackedByteArray()
		_mask = sc._m; _mask_w = 0
		for r in gh:
			for c in gw:
				var w := false
				for R in sc.get("walk", []):
					if _in_r(c, r, R): w = true; break
				for R in sc.get("block", []):
					if _in_r(c, r, R): w = false; break
				grid[r * gw + c] = 1 if w else 0
	sc._grid = grid
	_grid = grid

func _m_ok(x: float, y: float) -> bool:
	var c := int(floor(x / _ms)); var r := int(floor(y / _ms))
	return c >= 0 and r >= 0 and c < _mask_w and r < _mask_h and _mask[r * _mask_w + c] == 1

func cell_ok(c: int, r: int) -> bool:
	var gw := int(ceil(GW))
	return c >= 0 and r >= 0 and c < GW and r < GH and _grid[r * gw + c] == 1

func pt_ok(x: float, y: float) -> bool:
	if _mask_w > 0:
		if not _m_ok(x, y): return false
	elif not cell_ok(int(floor(x / TS)), int(floor(y / TS))):
		return false
	# 宝箱、道具占地（qihe-town.js：脚下椭圆，中心在底边上方 block[1]*0.6）
	for n in _blockers:
		var bl: Array = n.block
		var dx: float = (x - n.x * TS) / bl[0]; var dy: float = (y - (n.y * TS - bl[1] * 0.6)) / bl[1]
		if dx * dx + dy * dy < 1: return false
	return true

var _blockers: Array = []
func _refresh_blockers() -> void:
	_blockers = npcs.filter(func(n): return n.get("block") is Array and n.block.size() == 2 and n.get("prop"))

func stand_ok(x: float, y: float) -> bool:
	var half: float = cur.get("footX", FOOT_X) if cur.get("footX") != null else FOOT_X
	return pt_ok(x, y) and pt_ok(x - half, y) and pt_ok(x + half, y) and pt_ok(x, y + 3) and pt_ok(x, y - 5)

static func sp_key(sp: String) -> String:
	return sp.trim_prefix("c_")

func char_h(sp: String) -> float:
	return CHAR_H * CharArt.scale_of(sp_key(sp))

func npc_h(n: Dictionary) -> float:
	if n.get("sp"):
		return n.get("h") if n.get("h") else char_h(n.sp)
	return 24.0

func npc_block(px: float, py: float, self_obj = null) -> bool:
	for n in npcs:
		if not n.get("sp") or (self_obj is Dictionary and n == self_obj): continue
		var r: float = max(12.0, npc_h(n) * 0.15)
		var dx: float = n.x * TS - px
		var dy: float = (n.y * TS - py) * 1.8
		if dx * dx + dy * dy < r * r:
			if self_obj == null or self_obj == player:
				var ex: float = n.x * TS - player.x
				var ey: float = (n.y * TS - player.y) * 1.8
				if ex * ex + ey * ey < r * r and dx * dx + dy * dy >= ex * ex + ey * ey: continue
			return true
	if self_obj != null and self_obj != player:
		for w in wanderers:
			if w.mode != "stand" or w == self_obj: continue
			var dx2: float = w.x - px; var dy2: float = (w.y - py) * 1.8
			if dx2 * dx2 + dy2 * dy2 < 18 * 18: return true
	return false

func walkable(px: float, py: float, self_obj = null) -> bool:
	return stand_ok(px, py) and not npc_block(px, py, self_obj)

var npcs_hook: Callable = Callable()      # 平时站位规则（qihe-staging.js 包裹 npcsOf）
var go_before: Callable = Callable()      # 换场前（站位复原）
var go_after: Callable = Callable()       # 换场后（续摆站位）

func npcs_of(sc: Dictionary) -> Array:
	if npcs_hook.is_valid(): npcs_hook.call(sc)
	var out := []
	if sc == cur: call_deferred("_refresh_blockers")
	for n in sc.get("npcs", []):
		var sh = n.get("show")
		if sh is Callable and not sh.call(): continue
		if sh is Dictionary and sh.has("__fn") and not Flow.default_show(sc, n): continue
		out.append(n)
	return out

func exits_of(sc: Dictionary) -> Array:
	var out := []
	for e in sc.get("exits", []):
		var sh = e.get("show")
		if sh is Callable and not sh.call(): continue
		out.append(e)
	return out

func nearest():
	var best = null; var bd := 80.0
	for n in npcs:
		var d: float = Vector2(n.x * TS - player.x, n.y * TS - player.y).length() - (float(n.talkR) - 80.0 if n.get("talkR") else 0.0)
		if d < bd:
			bd = d; best = n
	return best

func occupied(x: float, y: float, self_obj, rad: float) -> bool:
	if Vector2(player.x - x, (player.y - y) * 1.6).length() < rad + 12: return true
	for n in npcs:
		if n.get("sp") and Vector2(n.x * TS - x, (n.y * TS - y) * 1.6).length() < rad + 12: return true
	for w in wanderers:
		if w != self_obj and Vector2(w.x - x, (w.y - y) * 1.6).length() < rad + 8: return true
	for f in followers:
		if Vector2(f.x - x, (f.y - y) * 1.6).length() < rad: return true
	return false

# ─────────────────────── 进场与站位修正 ───────────────────────
func place_fix() -> void:
	if G.S == null or cur.is_empty(): return
	if not G.S.has("mapv"): G.S.mapv = {}
	if cur.get("mapv") and G.S.mapv.get(cur_id) != cur.mapv:
		G.S.mapv[cur_id] = cur.mapv
	player.x = clamp(player.x, 8, WW - 8); player.y = clamp(player.y, 8, WH - 8)
	var in_ex := func(x: float, y: float) -> bool:
		for e in exits_of(cur):
			if _in_r(int(floor(x / TS)), int(floor(y / TS)), e.r): return true
		return false
	if stand_ok(player.x, player.y) and not in_ex.call(player.x, player.y): return
	var best = null; var bd := 1e18
	var y := 4.0
	while y < WH:
		var x := 4.0
		while x < WW:
			var d := (x - player.x) ** 2 + (y - player.y) ** 2
			if d < bd and stand_ok(x, y) and not in_ex.call(x, y):
				bd = d; best = Vector2(x, y)
			x += 8
		y += 8
	if best != null:
		player.x = best.x; player.y = best.y

func spawn_wanderers() -> void:
	place_fix()
	npcs = npcs_of(cur)
	wanderers = []; bubbles.clear(); amb_init()
	for e in cur.get("extras", []):
		var sh = e.get("show")
		if sh is Callable and not sh.call(): continue
		var w := Actor.new()
		w.sp = e.sp; w.source = e; w.mode = e.get("mode", "wander"); w.box = e.get("box"); w.pts = e.get("pts")
		w.dir = e.get("dir", "d"); w.face = e.get("dir", ""); w.wait = randf_range(300, 2500); w.ph = randf() * 9
		w.barks = e.get("barks"); w.bt = randf_range(1500, 6000)
		w.spd = 0.13 if w.mode == "run" else (0.05 if w.mode == "patrol" else 0.06)
		if e.get("x") != null:
			w.x = e.x * TS; w.y = e.y * TS
		elif w.pts:
			w.x = w.pts[0][0] * TS; w.y = w.pts[0][1] * TS; w.pi = 1
		else:
			var B: Array = w.box
			for k in 30:
				w.x = (B[0] + 0.5 + randf() * (B[2] - B[0])) * TS; w.y = (B[1] + 0.5 + randf() * (B[3] - B[1])) * TS
				if stand_ok(w.x, w.y) and not occupied(w.x, w.y, w, 26): break
			if not e.get("dir"): w.dir = "dlru"[randi_range(0, 3)]
		wanderers.append(w)
	reset_followers()

func party_here() -> Array:
	if cur.get("noFollow") or G.S == null: return []
	var people := []
	for k in G.S.get("party", []):
		if k != G.S.get("pet") and people.size() < 3: people.append(k)
	if G.S.get("pet"): people.append(G.S.pet)
	return people

func reset_followers() -> void:
	followers = []
	var party := party_here()
	if party.is_empty(): return
	seed_trail(FOLLOW_GAP * (party.size() + 1))
	for i in party.size():
		var f := Actor.new(); var p := trail_at(FOLLOW_GAP * (i + 1))
		f.m = party[i]; f.x = p.x; f.y = p.y; f.dir = player.dir; f.ph = i * 2.3
		followers.append(f)

func seed_trail(length: float) -> void:
	if player.trail.size() > 2: return
	var back: Vector2 = {"d": Vector2(0, -1), "u": Vector2(0, 1), "l": Vector2(1, 0), "r": Vector2(-1, 0)}.get(player.dir, Vector2(0, -1))
	player.trail = [[player.x, player.y, player.dir]]
	var s := 4.0
	while s <= length:
		var nx := player.x + back.x * s; var ny := player.y + back.y * s
		if not stand_ok(nx, ny): break
		player.trail.append([nx, ny, player.dir]); s += 4

func trail_at(want: float) -> Vector2:
	var tr := player.trail
	if tr.is_empty(): return Vector2(player.x, player.y)
	var acc := Vector2(player.x - tr[0][0], player.y - tr[0][1]).length()
	if acc >= want: return Vector2(tr[0][0], tr[0][1])
	for k in tr.size() - 1:
		var a: Array = tr[k]; var b: Array = tr[k + 1]
		var seg := Vector2(a[0] - b[0], a[1] - b[1]).length()
		if acc + seg >= want:
			var u := (want - acc) / (seg if seg != 0 else 1.0)
			return Vector2(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)
		acc += seg
	var l: Array = tr[tr.size() - 1]
	return Vector2(l[0], l[1])

# ─────────────────────── 场景切换 ───────────────────────
func exit_dir(e: Dictionary, sc: Dictionary = cur) -> String:
	if e.get("dir"): return e.dir
	var R: Array = e.r; var gw: float = sc.get("gw", 48); var gh: float = sc.get("gh", 27)
	if R[0] <= 0: return "l"
	if R[2] >= gw - 1: return "r"
	if R[3] >= gh - 1: return "d"
	return "u"

func entry_dir(sc: Dictionary, at: Array, d: String) -> String:
	if d != "": return d
	var best = null; var bd := 1e9
	for e in sc.get("exits", []):
		if e.get("to") == "map":
			var R: Array = e.r
			var dd := Vector2(clamp(at[0], R[0], R[2] + 1) - at[0], clamp(at[1], R[1], R[3] + 1) - at[1]).length()
			if dd < bd: bd = dd; best = e
	return OPP[exit_dir(best, sc)] if best != null else sc.get("startDir", "u")

## 主角脚本行走（无视碰撞/出口判定，busy 期间推进）
func start_anim(dx: float, dy: float, ms: float, a0: float, a1: float) -> void:
	player.anim = {"x0": player.x, "y0": player.y, "dx": dx, "dy": dy, "ms": ms, "t": 0.0, "a0": a0, "a1": a1, "done": false}

func anim_walk(dx: float, dy: float, ms: float, a0: float, a1: float) -> void:
	start_anim(dx, dy, ms, a0, a1)
	var A = player.anim
	while not A.done:
		await get_tree().process_frame

func step_anim(dt: float) -> bool:
	var A = player.anim
	if A == null: return false
	A.t = min(A.ms, A.t + dt)
	var k: float = A.t / A.ms
	var ox := player.x; var oy := player.y
	player.x = A.x0 + A.dx * k; player.y = A.y0 + A.dy * k; player.alpha = A.a0 + (A.a1 - A.a0) * k
	var md := Vector2(player.x - ox, player.y - oy).length()
	player.moving = md > 0; player.walk += md
	if md > 0:
		foot_dust(player, "hero")
		_push_trail()
	if A.t >= A.ms:
		player.anim = null; player.moving = false; player.walk = 0; A.done = true
	return true

func _push_trail() -> void:
	var t0 = player.trail[0] if player.trail.size() else null
	if t0 == null or Vector2(t0[0] - player.x, t0[1] - player.y).length() >= 4:
		player.trail.push_front([player.x, player.y, player.dir])
		if player.trail.size() > 90: player.trail.pop_back()

func go_scene(id: String, at = null, d: String = "") -> void:
	if not scenes.has(id):
		push_error("没有场景 " + id); return
	if go_before.is_valid(): go_before.call()
	await _go_scene(id, at, d)
	if go_after.is_valid(): await go_after.call()

func _go_scene(id: String, at = null, d: String = "") -> void:
	await Assets.preload_keys(scene_asset_keys(id))
	var enter = null
	await UI.fade(func():
		enter_scene_now(id, at, d)
		if at != null and cur.get("arrivalWalk") != false:
			var v: Vector2 = DV[player.dir]
			var tx := player.x; var ty := player.y
			player.x = tx - v.x * ENTER_WALK; player.y = ty - v.y * ENTER_WALK; player.alpha = 0
			start_anim(v.x * ENTER_WALK, v.y * ENTER_WALK, 520, 0, 1); enter = true
			camC = Vector2(tx, ty - CHAR_H * 0.45)
			cam = Vector2(clamp(camC.x - VW / 2, 0, max(0.0, WW - VW)), clamp(camC.y - VH / 2, 0, max(0.0, WH - VH)))
		G.save())
	if enter != null:
		busy = true
		while player.anim != null: await get_tree().process_frame
		busy = false
	player.alpha = 1
	UI.place_name(cur.name)
	UI.hud()
	scene_entered.emit(id)
	if cur.get("enter") is Callable:
		busy = true
		await cur.enter.call()
		busy = false
		UI.hud()

## 立即切到场景（不淡入淡出），读档、首次进入用
func enter_scene_now(id: String, at = null, d: String = "") -> void:
	cur_id = id; cur = scenes[id]
	build_grid(cur)
	_nav = {}
	G.S.scene = id
	if cur.get("mapv"):
		if not G.S.has("mapv"): G.S.mapv = {}
		G.S.mapv[id] = cur.mapv
	var p: Array = at if at != null else cur.start
	var dd: String = entry_dir(cur, p, d) if at != null else String(cur.get("startDir", player.dir))
	player.dir = dd
	player.x = p[0] * TS; player.y = p[1] * TS; player.vx = 0; player.vy = 0
	player.path = null; player.goal = null; player.trail = []; player.anim = null
	particles = []
	spawn_wanderers()
	if not G.S.has("unlocked"): G.S.unlocked = {}
	G.S.unlocked[cur.get("region", id) if cur.get("region") else id] = 1
	snap_cam()
	G.S.x = player.x; G.S.y = player.y
	active = true

func scene_asset_keys(id: String) -> Array:
	var sc: Dictionary = scenes.get(id, {})
	var out := []
	for k in ["bg", "fg", "propImg", "under"]:
		if sc.get(k) is String: out.append(sc[k])
	return out

static func face_to(dx: float, dy: float) -> String:
	if abs(dx) > abs(dy): return "r" if dx > 0 else "l"
	return "d" if dy > 0 else "u"

## 人物交互模块（墨印菜单）接管入口：返回 true 表示已处理（原版 qihe-npc-ui.js 包裹 interact）
var interact_hook: Callable = Callable()

func interact(target = null) -> void:
	if busy or Dialog.busy or not active or UI.panel_open(): return
	var n = target if target != null else nearest()
	if n == null: return
	if interact_hook.is_valid() and not n.get("loot"):
		if await interact_hook.call(n): return
	busy = true; UI.prompt_hide()
	player.path = null; player.goal = null; player.talk_to = null
	var dx: float = n.x * TS - player.x; var dy: float = n.y * TS - player.y
	player.dir = face_to(dx, dy)
	if n.get("sp") and not n.get("seated"):
		if not n.get("dir0"): n.dir0 = n.get("dir", "d")
		n.dir = face_to(-dx, -dy)
	var act = n.get("act")
	if act is Callable:
		await act.call(n)
	else:
		await Flow.default_act(cur, n)
	busy = false
	if n.get("dir0"): n.dir = n.dir0
	if not cur.is_empty(): npcs = npcs_of(cur)
	UI.hud()

func take_exit(e: Dictionary) -> void:
	busy = true; player.path = null; player.goal = null; player.vx = 0; player.vy = 0; keys = {}; UI.prompt_hide()
	var d := exit_dir(e); var v: Vector2 = DV[d]; player.dir = d
	await anim_walk(v.x * EXIT_WALK, v.y * EXIT_WALK, 300, 1, 0)
	await go_scene(e.to, e.get("at"), d)
	player.alpha = 1; busy = false; UI.hud()

# ─────────────────────── 寻路 ───────────────────────
func line_ok(x0: float, y0: float, x1: float, y1: float) -> bool:
	var d := Vector2(x1 - x0, y1 - y0).length()
	var n := int(ceil(d / (2.0 if cur.get("preciseNav") else 8.0)))
	for i in range(1, n + 1):
		var t := float(i) / n
		if not stand_ok(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t): return false
	return true

func path_line_ok(x0: float, y0: float, x1: float, y1: float) -> bool:
	if not line_ok(x0, y0, x1, y1): return false
	if not cur.get("preciseNav"): return true
	var n: int = max(1, int(ceil(Vector2(x1 - x0, y1 - y0).length() / 2)))
	var pk = cur.get("previewKey")
	for i in range(1, n + 1):
		var x := x0 + (x1 - x0) * i / n; var y := y0 + (y1 - y0) * i / n
		if npc_block(x, y): return false
		if pk and (not stand_ok(x - 1, y) or not stand_ok(x + 1, y) or not stand_ok(x, y - 1) or not stand_ok(x, y + 1)): return false
	return true

func nav_of() -> Dictionary:
	if not _nav.is_empty(): return _nav
	var d: Dictionary = nav_data[cur_id]
	var raw := Marshalls.base64_to_raw(d.ok)
	var codes := PackedInt32Array(); codes.resize(int(d.nw) * int(d.nh))
	for i in codes.size():
		codes[i] = raw[i * 2] | (raw[i * 2 + 1] << 8)
	# 搜索交给引擎的 AStarGrid2D：8 邻接、禁止斜穿墙角（ONLY_IF_NO_OBSTACLES）、启发＝欧氏距离，与原版 findPath 相同
	var astar := AStarGrid2D.new()
	astar.region = Rect2i(0, 0, int(d.nw), int(d.nh)); astar.cell_size = Vector2(1, 1)
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	astar.default_compute_heuristic = AStarGrid2D.HEURISTIC_EUCLIDEAN; astar.default_estimate_heuristic = AStarGrid2D.HEURISTIC_EUCLIDEAN
	astar.update()
	for i in codes.size():
		if (codes[i] & 1) == 0: astar.set_point_solid(Vector2i(i % int(d.nw), i / int(d.nw)), true)
	_nav = {"NS": float(d.NS), "nw": int(d.nw), "nh": int(d.nh), "code": codes, "precise": d.precise, "astar": astar}
	return _nav

func find_path(tx: float, ty: float):
	var N := nav_of()
	var NS: float = N.NS; var nw: int = N.nw; var nh: int = N.nh
	var code: PackedInt32Array = N.code.duplicate()
	var precise: bool = N.precise
	var npc_cells := []
	# 站立的剧情 NPC 视为障碍
	for n in npcs:
		if not n.get("sp"): continue
		var r: float = max(12.0, npc_h(n) * 0.15) + 8
		var nx: float = n.x * TS; var ny: float = n.y * TS
		if not precise:
			if Vector2(nx - tx, ny - ty).length() < r + NS: continue
			if Vector2(nx - player.x, ny - player.y).length() < r + 2: continue
		for yy in range(int(floor((ny - r / 1.8) / NS)), int(floor((ny + r / 1.8) / NS)) + 1):
			for xx in range(int(floor((nx - r) / NS)), int(floor((nx + r) / NS)) + 1):
				if xx >= 0 and yy >= 0 and xx < nw and yy < nh and (not precise or npc_block(xx * NS + NS / 2, yy * NS + NS / 2)):
					if code[yy * nw + xx] & 1: npc_cells.append(yy * nw + xx)
					code[yy * nw + xx] = 0
	var okc := func(c: int, r: int) -> bool: return c >= 0 and r >= 0 and c < nw and r < nh and (code[r * nw + c] & 1) == 1
	var sc := int(floor(player.x / NS)); var sr := int(floor(player.y / NS))
	var tc := int(floor(tx / NS)); var tr := int(floor(ty / NS))
	if not okc.call(sc, sr):
		var b = _near(code, nw, nh, sc, sr)
		if b != null: sc = b.x; sr = b.y
	if not okc.call(tc, tr):
		var b2 = _near(code, nw, nh, tc, tr)
		if b2 == null: return null
		tc = b2.x; tr = b2.y; tx = tc * NS + NS / 2; ty = tr * NS + NS / 2
	if not stand_ok(tx, ty):
		tx = tc * NS + NS / 2; ty = tr * NS + NS / 2
	var astar: AStarGrid2D = N.astar
	var changed := npc_cells
	for i in changed: astar.set_point_solid(Vector2i(i % nw, i / nw), true)
	var ids := astar.get_id_path(Vector2i(sc, sr), Vector2i(tc, tr))
	for i in changed: astar.set_point_solid(Vector2i(i % nw, i / nw), false)
	if ids.is_empty(): return null
	var cells := []
	for v in ids.slice(1): cells.append(v.y * nw + v.x)
	var pts := []
	for k in cells: pts.append(Vector2((k % nw) * NS + NS / 2, (k / nw) * NS + NS / 2))
	if pts.size(): pts[pts.size() - 1] = Vector2(tx, ty)
	else: pts.append(Vector2(tx, ty))
	# 拉直：从当前点尽量跳到最远的可直达路点（同样避开剧情 NPC）
	var base: PackedInt32Array = N.code
	var lineN := func(x0: float, y0: float, x1: float, y1: float) -> bool:
		if not path_line_ok(x0, y0, x1, y1): return false
		var d := Vector2(x1 - x0, y1 - y0).length(); var n := int(ceil(d / 8))
		for i in range(1, n):
			var t := float(i) / n
			var cc := int(floor((x0 + (x1 - x0) * t) / NS)); var rr := int(floor((y0 + (y1 - y0) * t) / NS))
			if cc >= 0 and rr >= 0 and cc < nw and rr < nh and not okc.call(cc, rr) and (base[rr * nw + cc] & 1) == 1: return false
		return true
	var out := []
	var px := player.x; var py := player.y; var i := 0
	while i < pts.size():
		var j := pts.size() - 1
		while j > i and not lineN.call(px, py, pts[j].x, pts[j].y): j -= 1
		out.append(pts[j]); px = pts[j].x; py = pts[j].y; i = j + 1
	return out

func _near(code: PackedInt32Array, nw: int, nh: int, c0: int, r0: int):
	var best = null; var bd := 1e9
	for r in nh:
		for c in nw:
			if code[r * nw + c] & 1:
				var d := (c - c0) * (c - c0) + (r - r0) * (r - r0)
				if d < bd: bd = d; best = Vector2i(c, r)
	return best

func _hpush(heap: PackedInt32Array, hf: PackedFloat32Array, k: int, f: float) -> void:
	heap.push_back(k); hf.push_back(f)
	var i := heap.size() - 1
	while i > 0:
		var p := (i - 1) >> 1
		if hf[p] <= hf[i]: break
		var tk := heap[p]; heap[p] = heap[i]; heap[i] = tk
		var tf := hf[p]; hf[p] = hf[i]; hf[i] = tf
		i = p

func _hpop(heap: PackedInt32Array, hf: PackedFloat32Array) -> int:
	var k := heap[0]
	var lk := heap[heap.size() - 1]; var lf := hf[hf.size() - 1]
	heap.resize(heap.size() - 1); hf.resize(hf.size() - 1)
	if heap.size():
		heap[0] = lk; hf[0] = lf
		var i := 0
		while true:
			var l := i * 2 + 1; var r := l + 1; var m := i
			if l < heap.size() and hf[l] < hf[m]: m = l
			if r < heap.size() and hf[r] < hf[m]: m = r
			if m == i: break
			var tk := heap[m]; heap[m] = heap[i]; heap[i] = tk
			var tf := hf[m]; hf[m] = hf[i]; hf[i] = tf
			i = m
	return k

func set_path(tx: float, ty: float, run = null):
	if Flow.scene_frozen(): return null
	var p = find_path(tx, ty)
	player.path = p
	player.goal = {"x": p[p.size() - 1].x, "y": p[p.size() - 1].y, "t": 0.0} if p != null else null
	if p != null:
		var L := 0.0; var px := player.x; var py := player.y
		for q in p:
			L += Vector2(q.x - px, q.y - py).length(); px = q.x; py = q.y
		player.run_path = run == true or L > (RUN_PATH_TOUCH if run == "touch" else RUN_PATH)
	return p

static func dir_of(vx: float, vy: float, d: String) -> String:
	var ax: float = abs(vx); var ay: float = abs(vy)
	if ax < 1e-4 and ay < 1e-4: return d
	var m := Vector2(vx, vy).length()
	if (d == "l" and vx < -0.38 * m) or (d == "r" and vx > 0.38 * m) or (d == "u" and vy < -0.38 * m) or (d == "d" and vy > 0.38 * m): return d
	if ax > ay: return "r" if vx > 0 else "l"
	return "d" if vy > 0 else "u"

# ─────────────────────── 镜头 ───────────────────────
func cam_focus_y() -> float:
	return player.y - CHAR_H * 0.45

func _clamp_cam() -> void:
	cam.x = clamp(camC.x - VW / 2, 0, max(0.0, WW - VW))
	cam.y = clamp(camC.y - VH / 2, 0, max(0.0, WH - VH))

func snap_cam() -> void:
	camC = Vector2(player.x, cam_focus_y())
	var I = cur.get("intro")
	cam_intro = null
	if I is Dictionary and (not (I.get("when") is Callable) or I.when.call()):
		cam_intro = {"x": I.at[0], "y": I.at[1], "t": 0.0, "hold": I.get("hold", 1500), "pan": I.get("pan", 2500)}
		camC = Vector2(I.at[0], I.at[1])
	_clamp_cam()

func update_cam(dt: float) -> void:
	if cam_intro != null:
		var I = cam_intro
		I.t += dt
		var u: float = clamp((I.t - I.hold) / I.pan, 0, 1)
		var k: float = 2 * u * u if u < 0.5 else 1 - pow(-2 * u + 2, 2) / 2
		camC.x = I.x + (player.x - I.x) * k; camC.y = I.y + (cam_focus_y() - I.y) * k
		_clamp_cam()
		if u >= 1 or player.moving: cam_intro = null
		return
	var DZX := VW * 0.07; var DZY := VH * 0.06
	var fx := player.x + player.vx * 260; var fy := cam_focus_y() + player.vy * 200
	var tx := camC.x; var ty := camC.y
	if fx - tx > DZX: tx = fx - DZX
	elif tx - fx > DZX: tx = fx + DZX
	if fy - ty > DZY: ty = fy - DZY
	elif ty - fy > DZY: ty = fy + DZY
	var k := 1 - exp(-dt / 170)
	camC.x += (tx - camC.x) * k; camC.y += (ty - camC.y) * k
	_clamp_cam()

# ─────────────────────── 路人与跟随者 ───────────────────────
func update_wanderers(dt: float) -> void:
	for i in range(wanderers.size() - 1, -1, -1):
		var e = wanderers[i].source
		if e is Dictionary and e.get("show") is Callable and not e.show.call(): wanderers.remove_at(i)
	for w in wanderers:
		upd_bark(w, dt)
		if w.mode == "stand":
			if w.hx == null: w.hx = w.x; w.hy = w.y
			var d := Vector2(w.x - player.x, w.y - player.y).length()
			w.dir = face_to(player.x - w.x, player.y - w.y) if d < 90 else (w.face if w.face != "" else w.dir)
			w.moving = false
			var px: float = w.x - player.x; var py: float = (w.y - player.y) * 1.6; var pd := Vector2(px, py).length()
			if pd < 26:
				var ux: float = px / pd if pd > 0.5 else (1.0 if w.x >= player.x else -1.0)
				var uy: float = py / pd * 0.6 if pd > 0.5 else 0.0
				var st := dt * 0.12; var nx: float = w.x + ux * st; var ny: float = w.y + uy * st
				if Vector2(nx - w.hx, ny - w.hy).length() < 26 and stand_ok(nx, ny): w.x = nx; w.y = ny
			elif pd > 60:
				var bx: float = w.hx - w.x; var by: float = w.hy - w.y; var bd := Vector2(bx, by).length()
				if bd > 0.5:
					var st2: float = min(bd, dt * 0.03); w.x += bx / bd * st2; w.y += by / bd * st2
			continue
		var px2: float = w.x - player.x; var py2: float = (w.y - player.y) * 1.6; var pd2 := Vector2(px2, py2).length()
		if pd2 < 34 and pd2 > 0:
			var nx2: float = w.x + px2 / pd2 * dt * 0.07; var ny2: float = w.y + py2 / pd2 * dt * 0.05
			if stand_ok(nx2, ny2):
				w.walk += Vector2(nx2 - w.x, ny2 - w.y).length(); foot_dust(w, w.sp)
				w.x = nx2; w.y = ny2; w.moving = true; w.dir = dir_of(px2, py2, w.dir); w.tx = null; w.wait = randf_range(600, 1500); continue
		if w.tx == null:
			w.wait -= dt; w.moving = false
			if w.wait <= 0:
				if w.pts:
					var p: Array = w.pts[w.pi]; w.pi = (w.pi + 1) % w.pts.size(); w.tx = p[0] * TS; w.ty = p[1] * TS
				else:
					var B: Array = w.box
					var tx: float = (B[0] + 0.5 + randf() * (B[2] - B[0])) * TS; var ty: float = (B[1] + 0.5 + randf() * (B[3] - B[1])) * TS
					if stand_ok(tx, ty) and line_ok(w.x, w.y, tx, ty): w.tx = tx; w.ty = ty
					else: w.wait = 250
			continue
		var dx: float = w.tx - w.x; var dy: float = w.ty - w.y; var dd := Vector2(dx, dy).length()
		if dd < 2:
			w.tx = null
			w.wait = randf_range(200, 900) if w.mode == "run" else (randf_range(1800, 3200) if w.pts else randf_range(1500, 4500))
			w.moving = false
			if w.pts and w.mode == "patrol": w.dir = "dlru"[randi_range(0, 3)]
			continue
		var s: float = min(dd, dt * w.spd); var nx3: float = w.x + dx / dd * s; var ny3: float = w.y + dy / dd * s
		if stand_ok(nx3, ny3) and not occupied(nx3 + dx / dd * 10, ny3 + dy / dd * 10, w, 22):
			w.x = nx3; w.y = ny3; w.walk += s; foot_dust(w, w.sp); w.moving = true; w.dir = dir_of(dx, dy, w.dir)
		else:
			w.tx = null; w.wait = randf_range(500, 1400); w.moving = false
			if w.pts: w.pi = (w.pi + w.pts.size() - 1) % w.pts.size()

func update_followers(dt: float) -> void:
	var party := party_here()
	var same := followers.size() == party.size()
	if same:
		for i in party.size():
			if followers[i].m != party[i]: same = false
	if not same: reset_followers()
	for i in followers.size():
		var f: Actor = followers[i]
		if f.talk:
			f.moving = false; continue
		var t := trail_at(FOLLOW_GAP * (i + 1))
		var dx := t.x - f.x; var dy := t.y - f.y; var d := Vector2(dx, dy).length()
		if d > 400:
			f.x = t.x; f.y = t.y; f.moving = false; continue
		if d > 1.5:
			var lead := player.running or d > FOLLOW_GAP * 0.9
			var cap := SPEED * (RUN_MUL * 1.08 if lead else 1.05)
			var sp: float = min(d, dt * min(cap, SPEED * (0.3 + d / 14)))
			f.x += dx / d * sp; f.y += dy / d * sp; f.walk += sp; f.running = sp > dt * SPEED * 1.25
			foot_dust(f, f.m); f.dir = dir_of(dx, dy, f.dir); f.moving = sp > dt * 0.02; f.idle = 0
		else:
			f.moving = false; f.running = false; f.idle += dt
			if f.idle > 350 and not player.moving:
				var hx := player.x - f.x; var hy := player.y - f.y
				f.dir = face_to(hx, hy) if Vector2(hx, hy).length() > 6 else player.dir
		if not f.moving: f.walk = 0

# ─────────────────────── 每帧更新 ───────────────────────
func update_scene(dt: float) -> void:
	set_dims(cur)
	# 定镜场景（序章后山）：冻结移动、镜头固定（原版 prologue-backhill.js 包裹 updateScene/setPath）
	if Flow.scene_frozen():
		var was := busy
		busy = true; keys = {}; player.path = null; player.goal = null; player.vx = 0; player.vy = 0
		_update_scene(dt)
		busy = was; Flow.frozen_camera()
		return
	_update_scene(dt)

func _update_scene(dt: float) -> void:
	npcs = npcs_of(cur)
	var anim := step_anim(dt)
	update_wanderers(dt); update_followers(dt); update_cam(dt)
	if anim: return
	if player.goal != null: player.goal.t += dt
	var frozen := busy or Dialog.busy or UI.panel_open()
	var ix := 0.0; var iy := 0.0; var arrive := 1.0
	if not frozen:
		ix = float(keys.get("right", 0)) - float(keys.get("left", 0)); iy = float(keys.get("down", 0)) - float(keys.get("up", 0))
		if ix != 0 or iy != 0:
			player.path = null; player.goal = null; player.talk_to = null
		elif player.path != null and player.path.size():
			var tp: Vector2 = player.path[0]
			var dx := tp.x - player.x; var dy := tp.y - player.y; var d := Vector2(dx, dy).length(); var last: bool = player.path.size() == 1
			if d < (2.0 if last else (0.5 if cur.get("preciseNav") else 10.0)):
				if cur.get("preciseNav") and path_line_ok(player.x, player.y, tp.x, tp.y):
					player.x = tp.x; player.y = tp.y
				player.path.pop_front()
				if player.path.is_empty(): end_path()
			else:
				ix = dx / d; iy = dy / d
				if last or cur.get("preciseNav"): arrive = min(1.0, d / 28 + 0.15)
	var kbd: bool = not frozen and (keys.get("left") or keys.get("right") or keys.get("up") or keys.get("down"))
	var want_run: bool = false
	if not frozen:
		if kbd: want_run = walk_run_toggle or preload("res://scripts/npc/util.gd").t(keys.get("run"))
		else: want_run = player.path != null and (walk_run_toggle or player.run_path)
	player.run_k += ((1.0 if want_run else 0.0) - player.run_k) * (1 - exp(-dt / (220.0 if want_run else 160.0)))
	var spd := SPEED * (1 + (RUN_MUL - 1) * player.run_k)
	var l := Vector2(ix, iy).length()
	var tvx := ix / l * spd * arrive if l > 0 else 0.0
	var tvy := iy / l * spd * arrive if l > 0 else 0.0
	var k := 1 - exp(-dt / (70.0 if l > 0 else 45.0))
	if cur.get("preciseNav") and player.path != null:
		player.vx = tvx; player.vy = tvy
	else:
		player.vx += (tvx - player.vx) * k; player.vy += (tvy - player.vy) * k
	if Vector2(player.vx, player.vy).length() < 0.004:
		player.vx = 0; player.vy = 0
	var ox := player.x; var oy := player.y
	if player.vx != 0 or player.vy != 0:
		var waypoint = player.path[0] if (cur.get("preciseNav") and player.path != null and player.path.size()) else null
		var reach: bool = waypoint != null and Vector2(waypoint.x - player.x, waypoint.y - player.y).length() <= Vector2(player.vx, player.vy).length() * dt
		var nx: float = waypoint.x if reach else player.x + player.vx * dt
		var ny: float = waypoint.y if reach else player.y + player.vy * dt
		var stuck := not stand_ok(player.x, player.y)
		if stuck or _can_move(nx, ny):
			player.x = nx; player.y = ny
		else:
			var moved := false
			if abs(player.vx) > 0.01 and _can_move(nx, player.y):
				player.x = nx; player.vy *= 0.5; moved = true
			elif abs(player.vy) > 0.01 and _can_move(player.x, ny):
				player.y = ny; player.vx *= 0.5; moved = true
			if not moved:
				player.vx = 0; player.vy = 0
				if player.path != null:
					var tt = player.talk_to
					end_path(tt != null and Vector2(tt.x * TS - player.x, tt.y * TS - player.y).length() < 110)
	var md := Vector2(player.x - ox, player.y - oy).length()
	player.moving = md > dt * 0.015; player.running = player.moving and md > dt * SPEED * 1.3
	if md > 0:
		player.walk += md; foot_dust(player, "hero")
		if l > 0: player.dir = dir_of(ix if ix != 0 else player.vx, iy if iy != 0 else player.vy, player.dir)
		_push_trail()
	if not player.moving and ix == 0 and iy == 0:
		player.walk = 0; player.running = false
	if frozen: return
	var c := int(floor(player.x / TS)); var r := int(floor(player.y / TS))
	for e in exits_of(cur):
		if _in_r(c, r, e.r):
			take_exit(e); return
	var n = nearest()
	if n != null:
		UI.prompt_show("%s · %s" % [n.get("verb", "交谈") if n.get("verb") else "交谈", n.name])
	else:
		UI.prompt_hide()

func _can_move(x: float, y: float) -> bool:
	if not cur.get("preciseNav"): return walkable(x, y, player)
	var steps: int = max(1, int(ceil(Vector2(x - player.x, y - player.y).length() / 2)))
	for i in range(1, steps + 1):
		if not walkable(player.x + (x - player.x) * i / steps, player.y + (y - player.y) * i / steps, player): return false
	return true

func end_path(talk := true) -> void:
	if cur.get("preciseNav"): player.vx = 0; player.vy = 0
	player.path = null; player.goal = null
	var t = player.talk_to; player.talk_to = null
	if t != null and talk: interact(t)

func _process(delta: float) -> void:
	if not active or cur.is_empty(): return
	var elapsed: float = delta * 1000.0
	_t += elapsed
	_elapsed += clamp(elapsed, 0, 250)
	var sc_now := cur
	while _elapsed + 1e-7 >= SCENE_STEP and active and cur == sc_now:
		_elapsed = max(0.0, _elapsed - SCENE_STEP)
		update_scene(SCENE_STEP)
	if not active or cur != sc_now: _elapsed = 0
	if G.S != null:
		G.S.x = player.x; G.S.y = player.y
	_fdt = min(50.0, _t - _last_draw if _last_draw > 0 else 16.0); _last_draw = _t
	var cx: float = round(cam.x * ZOOM) / ZOOM; var cy: float = round(cam.y * ZOOM) / ZOOM
	position = Vector2(-cx * ZOOM, -cy * ZOOM)
	scale = Vector2(ZOOM, ZOOM)
	queue_redraw()
	Lights.update_from(self)

# ─────────────────────── 输入（对应 main.js） ───────────────────────
const KM := {KEY_A: "left", KEY_LEFT: "left", KEY_D: "right", KEY_RIGHT: "right", KEY_W: "up", KEY_UP: "up", KEY_S: "down", KEY_DOWN: "down"}
var _tap_dir := ""
var _tap_t := 0.0
var _last_click := 0.0
var _last_cpos := Vector2.ZERO

func _unhandled_input(ev: InputEvent) -> void:
	if not active: return
	if ev is InputEventKey:
		var k: int = ev.keycode
		if ev.pressed:
			if k == KEY_SHIFT and not ev.echo and not busy and not Dialog.busy and not UI.panel_open():
				walk_run_toggle = not walk_run_toggle
				UI.toast("步法：跑步" if walk_run_toggle else "步法：步行", 850)
			if KM.has(k):
				var key: String = KM[k]
				if not ev.echo and not keys.get(key):
					var now := Time.get_ticks_msec()
					if _tap_dir == key and now - _tap_t < 280: keys.run = 1
					_tap_dir = key; _tap_t = now
				keys[key] = 1
				get_viewport().set_input_as_handled()
			if (k == KEY_E or k == KEY_SPACE) and not Dialog.busy and not UI.panel_open():
				get_viewport().set_input_as_handled(); interact()
			if k == KEY_I and not Dialog.busy and not busy and not ev.echo:
				UI.toggle_menu()
			if k == KEY_J and not Dialog.busy and not busy and not ev.echo and not UI.panel_open():
				Flow.prologue().journal()
		else:
			if KM.has(k):
				keys[KM[k]] = 0
				if not keys.get("left") and not keys.get("right") and not keys.get("up") and not keys.get("down"): keys.run = 0
	elif ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		if busy or Dialog.busy or UI.panel_open(): return
		_click(ev.position, false)
	elif ev is InputEventScreenTouch and ev.pressed:
		if busy or Dialog.busy or UI.panel_open(): return
		_click(ev.position, true)

func _click(screen: Vector2, touch: bool) -> void:
	# 视口坐标 → 960×540 逻辑坐标 → 世界坐标
	var p := get_viewport().get_canvas_transform().affine_inverse() * screen
	var local := get_global_transform().affine_inverse() * p
	var x := local.x; var y := local.y
	for n in npcs:
		if n.get("loot"): continue
		var h: float = npc_h(n) if n.get("sp") else (60.0 if n.get("resource") else 30.0)
		var hw: float = max(20.0, h * 0.28) if n.get("sp") else (32.0 if n.get("resource") else 24.0)
		var nx: float = n.x * TS; var ny: float = n.y * TS
		if abs(nx - x) < hw and y < ny + 10 and y > ny - h:
			if Vector2(nx - player.x, ny - player.y).length() < 80:
				interact(n); return
			var side := -1.0 if player.x < nx else 1.0
			var off: float = max(34.0, npc_h(n) * 0.4) if n.get("sp") else 20.0
			var path = null
			for c in [Vector2(nx + side * off, ny + 2), Vector2(nx - side * off, ny + 2), Vector2(nx, ny + off * 0.8), Vector2(nx, ny - off * 0.6)]:
				if stand_ok(c.x, c.y) and not npc_block(c.x, c.y):
					path = set_path(c.x, c.y)
					if path != null: break
			if path == null: path = set_path(nx, ny + 40)
			player.talk_to = n if path != null else null
			return
	player.talk_to = null
	var now := Time.get_ticks_msec()
	var dbl := now - _last_click < 320 and screen.distance_to(_last_cpos) < 60
	_last_click = now; _last_cpos = screen
	set_path(x, y, true if dbl else ("touch" if touch else null))

# ─────────────────────── 氛围 ───────────────────────
func amb_init() -> void:
	amb = {"sparks": [], "ducks": [], "birds": [], "bt": randf_range(2000, 6000)}
	for d in cur.get("ducks", []):
		amb.ducks.append({"x": d[0], "y": d[1], "x0": d[2], "x1": d[3], "v": randf_range(0.012, 0.025) * (-1 if randf() < 0.5 else 1), "ph": randf() * 9})
	if cur.get("water") is Array and cur.water.size():
		for i in 46: amb.sparks.append(new_spark(randf()))

func new_spark(t0: float) -> Dictionary:
	var R: Array = cur.water[randi_range(0, cur.water.size() - 1)]
	return {"x": (R[0] + randf() * (R[2] - R[0] + 1)) * TS, "y": (R[1] + randf() * (R[3] - R[1] + 1)) * TS, "w": randi_range(2, 6) * 3, "t": t0, "d": randf_range(0.0006, 0.0012)}

func on_dirt(x: float, y: float) -> bool:
	var d = cur.get("dust")
	if not d: return false
	if d is bool: return d
	var c := int(floor(x / TS)); var r := int(floor(y / TS))
	for R in d:
		if _in_r(c, r, R): return true
	return false

func foot_dust(o: Actor, sp: String) -> void:
	var h := char_h(sp if sp != "" else "hero")
	var i := int(floor(o.walk / (h * 0.34)))
	if i == o.step: return
	o.step = i
	if not on_dirt(o.x, o.y) or particles.size() > 260: return
	for k in 2:
		particles.append({"x": o.x + randf_range(-8, 8), "y": o.y - randf_range(0, 3), "vx": randf_range(-0.25, 0.25), "vy": randf_range(-0.25, -0.05), "life": 28, "max": 28, "s": 3.0, "c": Color(cur.get("dustC", "#d6be8c")) if cur.get("dustC") else Color(214 / 255.0, 190 / 255.0, 140 / 255.0, 0.55), "kind": 1})

func embers(x: float, y: float, c := Color("#ffb050")) -> void:
	if randf() < 0.5:
		particles.append({"x": x + randf_range(-12, 12), "y": y, "vx": randf_range(-0.3, 0.3), "vy": randf_range(-1.1, -0.4), "life": 50, "max": 50, "s": randf_range(2, 3), "c": c, "kind": 0})

func smoke_at(x: float, y: float) -> void:
	if randf() < 0.08:
		particles.append({"x": x + randf_range(-6, 6), "y": y, "vx": randf_range(-0.05, 0.2), "vy": randf_range(-0.5, -0.3), "life": 150, "max": 150, "s": randf_range(5, 8), "c": Color(150 / 255.0, 140 / 255.0, 130 / 255.0, 0.16), "kind": 2})

func leaves() -> void:
	if randf() < 0.05:
		particles.append({"x": cam.x + randf_range(-100, VW), "y": cam.y - 10, "vx": randf_range(0.3, 0.7), "vy": randf_range(0.35, 0.6), "life": 520, "max": 520, "s": 3.0, "c": Color(["#c8742c", "#a4501e", "#d99a3c", "#7d6a2a"][randi_range(0, 3)]), "kind": 3, "ph": randf() * 9})

func fireflies() -> void:
	if randf() < 0.03:
		particles.append({"x": cam.x + randf_range(0, VW), "y": cam.y + randf_range(VH * 0.3, VH), "vx": randf_range(-0.15, 0.15), "vy": randf_range(-0.15, 0.05), "life": 260, "max": 260, "s": 2.0, "c": Color("#e8f59a"), "kind": 4, "ph": randf() * 9})

func upd_particles(t: float) -> void:
	var any_dead := false
	for p in particles:
		p.life -= 1
		if p.kind == 3:
			p.x += p.vx + sin(t / 500 + p.ph) * 0.6; p.y += p.vy
		elif p.kind == 4:
			p.x += p.vx + sin(t / 700 + p.ph) * 0.2; p.y += p.vy + cos(t / 900 + p.ph) * 0.2
		else:
			p.x += p.vx; p.y += p.vy
			if p.kind == 2: p.s += 0.08; p.vx += 0.002
		if p.life <= 0: any_dead = true
	if any_dead: particles = particles.filter(func(p): return p.life > 0)

func upd_bark(w: Actor, dt: float) -> void:
	if not w.barks or w.barks.is_empty(): return
	w.bt -= dt
	if w.bt > 0: return
	var d := Vector2(w.x - player.x, w.y - player.y).length()
	if d > 230 or bubbles.size() >= 2 or busy or Dialog.busy or Npc.is_open:
		w.bt = randf_range(600, 1500); return
	var txt: String = w.barks[randi_range(0, w.barks.size() - 1)]
	# 11-10 试玩审查：只有“……”的气泡看着像空白小框，不冒
	if txt.replace("…", "").replace(".", "").strip_edges() == "": w.bt = randf_range(9000, 16000); return
	bubbles.append({"w": w, "txt": txt, "t": 0.0, "dur": 3400.0})
	w.bt = randf_range(9000, 16000)

# ─────────────────────── 绘制 ───────────────────────
func _draw() -> void:
	if cur.is_empty(): return
	WorldDraw.draw_scene(self, _t, _fdt)
