extends Node
## 江湖菜单（自动加载 Menu）。对应原版 js/qihe-jianghu-ui.js（window.QiheJianghuUI）与 qihe-jianghu-ui.css。
## 接口：Menu.open(tab := "", who := "")、Menu.close()、Menu.toggle()、Menu.debug_start(tab)；
## 供 HUD / 通知用：tracked_quests()、main_tracked()、new_quests()、set_tracked()、open_quest(key)、open_person(id)。
## 界面只读 QJModel 快照，所有改档都经 commit() → QJModel.command()（与原版一致）。
## 各页的内容在 page_*.gd 里（build 造节点、handle 处理点击）。

const K := preload("res://scripts/menu/kit.gd")
const PAGES := {
	"party": preload("res://scripts/menu/page_party.gd"), "skill": preload("res://scripts/menu/page_skill.gd"),
	"bag": preload("res://scripts/menu/page_bag.gd"), "equip": preload("res://scripts/menu/page_equip.gd"),
	"quest": preload("res://scripts/menu/page_quest.gd"), "rep": preload("res://scripts/menu/page_rep.gd"),
	"sys": preload("res://scripts/menu/page_sys.gd")}
const Quest := preload("res://scripts/menu/quest.gd")
## TABS_UI：[id, 名称, 图标键]；原版 window.QiheJianghuRepUI 存在时插入「关系」（page_rep.gd）
const TABS_UI := [["party", "队伍", "party"], ["skill", "武学", "skill"], ["bag", "行囊", "bag"], ["equip", "装备", "equip"], ["quest", "行记", "quest"], ["rep", "关系", "rep"], ["sys", "设置", "sys"]]
## 「关系」页签图：PRODUCTION_ASSET_PATHS.ui_qj_nav_rep_20261027
const REP_ICON := "assets/production/ui/jianghu-rep-icon-20261027/ui_qj_nav_rep_20261027.webp"
const STAT_LABEL := {"str": "臂力", "con": "根骨", "agi": "身法", "wil": "定力", "wis": "悟性"}
const STAT_HELP := {"str": "影响攻击强度与兵器使用要求", "con": "影响气血与防御", "agi": "影响身速、暴击与闪避", "wil": "影响内力与格挡", "wis": "影响武学学习与熟练成长"}
const SLOT_LABEL := {"weapon": "兵器", "armor": "护具", "acc": "佩饰"}
## 2026-11-06 重设计（docs/review/menu-redesign-preview-v3，第四十轮第 2 题通过）：七页统一头部 78、页脚 30；
## 队伍、武学、行囊、装备四页左边一列队员头像（RAIL_W 宽），行记、关系、设置三页讲整个江湖，不放
const H_HEAD := 78.0
const H_FOOT := 30.0
const RAIL_W := 118.0
const RAIL_PAGES := ["party", "skill", "bag", "equip"]
## 队员列头像外形：scroll 小挂轴 / chamfer 切角印框 / tag 腰牌（2026-11-06 用户说不要圆形）
var RAIL_STYLE := "chamfer"
## 菜单观感方案（2026-11-06）：每个方案是一组开关，apply_look 切换；默认方案一（用户：“带背景版＋雾调薄存为一个方案先”）
const LOOKS := {
	"plain": {"fig": "none", "page": "fog"},   # 原样：抠图立绘、整页白雾
	"look1": {"fig": "art", "page": "thin"},   # 方案一：有带背景版的人整张显示，整页雾调薄
	"look2": {"fig": "art", "page": "thin", "tint": true, "fill": true, "big": true},   # 方案二：方案一＋人物主色、空白处放人物内容、去掉立绘框做大立绘
	# 定稿（11-06 用户：确定去掉“立绘”框）。11-09 起人物背景换成带意象的整张图（第四十五轮），用 art 整张显示，立绘撑满中栏（第四十七轮 A）
	"main": {"fig": "art", "page": "album", "big": true},
}
var TINT := false      # 页面框线、题签、底雾带选中人物的主色
var FILL := false      # 空白处放人物自己的内容（性情面板题词、行囊概览）
var BIG_FIG := true    # 队伍页去掉“立绘”框，人物大图直接站在纸上
var FIG_DIR := "portraits/bg"   # 带背景版立绘目录（assets/ui/jianghu-v4/ 下）；试背景风格时调试切到 portraits/bgtest/<方案>
var LOOK := "main"
## 立绘面板："none" 抠图立绘 / "plate" 抠图叠在本人背景板上（定稿） / "art" 有带背景版的人整张显示 / "ink" 人物水墨意境底
var FIG_BG := "art"
## 整页底："fog" 白雾 / "thin" 雾调薄、山水透出 / "glass" 再加面板微透 /
## "album" 旧册页纸（11-10 第五十轮 B 版验收“继续改”：用户说实机背景和预览图不一样——预览是整张暖色旧纸，不透山水）
var PAGE_BG := "album"
const ALBUM_PAPER := "assets/production/ui/qj-kit-v1/album_paper.webp"
func album() -> bool: return PAGE_BG == "album"
## 背景板目录（assets/ui/jianghu-v4/ 下）；试加深版时调试切到 figplate-test/<档>
var FIG_PLATE := "figplate"
## 大立绘提神效果（11-08 用户在评审台第四十一轮选中档＋脚影、背光、虚化，设为默认）：shadow 脚下投影 / halo 身后背光 / rim 人物轮廓微光 / dof 背景虚化 / breath 呼吸起伏
var FIG_FX: Array = ["shadow", "halo", "dof"]

func apply_look(id: String) -> void:
	if not LOOKS.has(id): return
	LOOK = id; FIG_BG = LOOKS[id].fig; PAGE_BG = LOOKS[id].page
	TINT = LOOKS[id].get("tint", false); FILL = LOOKS[id].get("fill", false); BIG_FIG = LOOKS[id].get("big", false)
var _bg_art: QJFitTex
var _bg_fog: Control
const HINTS := {"quest": "悬停查看 · 点击选择 · Q / E 翻页 · Esc 返回游戏",   # 11-10：各页提示统一，本页特有的加在后面
	 "rep": "悬停查看 · 点击选择 · Q / E 翻页 · Esc 返回", "sys": "悬停查看 · 点击选择 · Q / E 翻页 · Esc 返回"}
func _hh() -> float: return H_HEAD
func _hf() -> float: return H_FOOT
func has_rail() -> bool: return RAIL_PAGES.has(s.get("page"))

## 界面态（不入存档），字段同原版 s
var s := {}
var from_cultivation := false   # 从培养模式打开（Esc、齿轮、江湖按钮）：设置页多几项培养专有的
var layer: CanvasLayer
var panel: Control        # #panel.qj（1280×720）
var main: Control
var live: Label
var overlay: Control
var tip: PanelContainer
var debug := false
var _focus_before: Control
var _op_seq := 0
var _hover_timer: SceneTreeTimer
var _tracked_seen := {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	s = _fresh_state()

func _fresh_state() -> Dictionary:
	return {"open": false, "page": "party", "actor": "hero", "category": "全部", "search": "", "sort": "name", "slot": null, "selected": null,
		"stack": [], "draft": null, "points": null, "detail": null, "confirm": null, "skillTab": "all", "skillSearch": "", "skillKind": null, "skillId": null,
		"bp": 0, "equipCategory": "all", "equipSearch": "", "equipType": "all", "equipSort": "name", "equipScroll": 0, "questFilter": "active", "questId": null,
		"journalView": "tasks", "journalPersonId": null, "journalCollapsed": false, "busy": false, "revision": 0, "scroll": 0, "candidate": null, "insightDraft": null}

func is_open() -> bool:
	return s.open

# ───────── 打开 / 关闭 ─────────
func can_open() -> bool:
	if debug: return G.S is Dictionary
	# 从培养模式打开：地图此时没在跑，地图、对白的忙碌标记与菜单无关，不拿它们挡（预防性：进培养模式那段主线流程不返回，标记有可能残留）
	if from_cultivation: return G.S is Dictionary and not s.open
	return G.S is Dictionary and G.mode == "scene" and not World.busy and not Dialog.busy and (not UI.panel_open() or s.open)

func toggle() -> void:
	if s.open: back()
	else: open()

func open(tab := "", who := "") -> void:
	if s.open:
		if tab != "": go(tab)
		return
	if not can_open(): return
	_focus_before = get_viewport().gui_get_focus_owner()
	s.open = true
	if tab == "attr": tab = "party"
	if _tab_index(tab) >= 0: s.page = tab
	if who != "": s.actor = who
	for k in ["stack"]: s[k] = []
	for k in ["detail", "confirm", "draft", "points", "selected"]: s[k] = null
	World.keys = {}
	if World.player:
		World.player.path = null; World.player.goal = null; World.player.vx = 0; World.player.vy = 0
	_build_shell()
	UI.push_panel(panel)
	draw()
	_focus_tab()

func close() -> void:
	if not s.open: return
	s.open = false
	for k in ["detail", "confirm", "draft", "points"]: s[k] = null
	World.keys = {}
	if panel:
		UI.pop_panel(panel)
		layer.queue_free()
		layer = null; panel = null; main = null; overlay = null; tip = null; live = null
	if is_instance_valid(_focus_before): _focus_before.grab_focus()
	UI.hud()

## back：确认框 → 抽屉 → 返回栈 → 关闭（逐层）
func back() -> void:
	if s.confirm != null:
		s.confirm = null; _render_overlay(); return
	if s.detail != null:
		if dirty(): guard(func(): s.detail = null; draw())
		else:
			s.detail = null; s.candidate = null; _render_overlay()
		return
	if s.stack.size():
		var st: Dictionary = s.stack.pop_back()
		for k in st: s[k] = st[k]
		draw(); return
	guard(close)

func go(page: String) -> void:
	if page == "attr": page = "party"
	guard(func():
		s.detail = null; s.selected = null; s.slot = null; s.stack = []; s.scroll = 0
		s.page = page
		draw()
		_focus_tab())

## dirty：编成草稿与当前出战不同，或加点草稿有非零
func dirty() -> bool:
	if s.draft != null and str(s.draft) != str(QJModel.active()): return true
	if s.points != null:
		for v in s.points.values():
			if v: return true
	return false

func guard(fn: Callable) -> void:
	if not dirty():
		s.draft = null; s.points = null
		fn.call(); return
	s.guard = fn
	detail("尚有未应用的调整", func(_m): return K.para("应用更改后离开，或放弃本次草稿。"),
		[["应用并继续", "guardApply", {}, "primary"], ["放弃更改", "guardDiscard", {}, ""], ["继续编辑", "guardContinue", {}, ""]])

func _tab_index(id: String) -> int:
	for i in TABS_UI.size():
		if TABS_UI[i][0] == id: return i
	return -1

# ───────── 名单 ─────────
func roster() -> Array:
	return QJModel.snapshot().roster

func active() -> Array:
	return QJModel.active()

func actor(id := ""):
	return QJModel.view(id if id != "" else s.actor)

# ───────── 提交与播报 ─────────
func commit(type: String, payload := {}, after := Callable()) -> void:
	if s.busy: return
	_op_seq += 1
	var c := {"type": type, "actorId": s.actor, "expectedRevision": s.revision, "commandId": "ui-%d-%d" % [Time.get_ticks_msec(), _op_seq]}
	c.merge(payload, true)
	var r := QJModel.command(c)
	if r.ok:
		s.detail = null; s.confirm = null
		_read_revision()
		if after.is_valid(): after.call()
		if s.selected != null and int(G.S.bag.get(s.selected, 0)) <= 0: s.selected = null
		draw()
		notify(r.get("message", "已完成"))
	else:
		s.confirm = null
		_read_revision()
		if s.detail != null: _render_overlay()
		notify(r.get("reason", "当前不可操作"))

func _read_revision() -> void:
	s.revision = int(QJModel.snapshot().revision)

## notify：写入抽屉状态行与页脚 .qj-live；菜单不在时退化为 toast
func notify(t: String) -> void:
	if live == null:
		UI.toast(t, 1400); return
	live.text = t
	if overlay and overlay.visible:
		var st := overlay.find_child("qj-detail-status", true, false) as Label
		if st: st.text = t; st.visible = true

# ───────── 抽屉 / 确认框 ─────────
## detail(标题, 正文构造器 func(menu)->Control, 按钮 [[文字, 动作, 数据, 样式]...])
func detail(title: String, body: Callable, actions := [], opts := {}) -> void:
	s.detail = {"title": title, "body": body, "actions": actions}
	s.detail.merge(opts)
	_render_overlay()

func confirm(text: String, run: Callable) -> void:
	s.confirm = {"text": text, "run": run}
	_render_overlay()

func push_stack() -> void:
	s.stack.append({"page": s.page, "actor": s.actor, "category": s.category, "scroll": s.scroll, "slot": s.slot, "search": s.search, "sort": s.sort})

# ───────── 外壳（#panel.qj：背景、头部、主区、页脚、浮签、弹层） ─────────
func _build_shell() -> void:
	layer = CanvasLayer.new()
	layer.layer = 40
	add_child(layer)
	panel = Control.new()
	panel.name = "qj"
	panel.size = Vector2(1280, 720)
	panel.scale = Vector2(0.75, 0.75)
	Paint.crisp(panel)   # 字按实际显示大小光栅，缩 0.75 不丢横笔（见 ui.gd）
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(panel)
	# .qj-backdrop：背景画 cover + 白雾 linear-gradient(90deg,#f6f1e8f5,#f6f1e8df 50%,#f6f1e8f0)
	var bg := ColorRect.new(); bg.color = Color("#e9e5d7"); bg.size = panel.size; bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(bg)
	var art := QJFitTex.new(); art.cover = true; art.size = panel.size
	art.set_tex(Assets.tex("assets/ui/jianghu-v4/background.webp"))
	panel.add_child(art)
	_bg_art = art
	var fog := Control.new(); fog.size = panel.size; fog.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fog.draw.connect(func():
		if album(): return   # 旧册页纸：不加雾
		if PAGE_BG != "fog":   # 雾调薄：底图山水透出来，左右略浓；方案二再带一点人物主色
			var fc := Color("#f6f1e8").lerp(K.accent, 0.13) if K.accent.a > 0 else Color("#f6f1e8")
			Paint.grad(fog, Rect2(Vector2.ZERO, fog.size), [[0, Color(fc, 0.78)], [0.5, Color(fc, 0.58)], [1, Color(fc, 0.75)]])
		else:
			Paint.grad(fog, Rect2(Vector2.ZERO, fog.size), [[0, Color("#f6f1e8f5")], [0.5, Color("#f6f1e8df")], [1, Color("#f6f1e8f0")]]))
	panel.add_child(fog)
	_bg_fog = fog

func _refresh_backdrop() -> void:
	if _bg_art == null: return
	var want := ALBUM_PAPER if album() else "assets/ui/jianghu-v4/background.webp"
	if _bg_art.get_meta("src", "") != want:
		_bg_art.set_tex(Assets.tex(want)); _bg_art.set_meta("src", want)
	_bg_fog.queue_redraw()

func draw() -> void:
	if not s.open or panel == null: return
	var ids: Array = roster().map(func(r): return r.id)
	if not ids.has(s.actor): s.actor = active()[0] if active().size() else "hero"
	if s.page == "party" and not active().has(s.actor): s.actor = active()[0] if active().size() else "hero"
	_read_revision()
	_refresh_backdrop()
	hide_tip()
	for c in panel.get_children().slice(3): c.queue_free()
	var v = actor()
	if v == null:
		var e := K.vbox(12); e.position = Vector2(560, 320)
		e.add_child(K.lab("人物状态暂不可用", 15, Color("#736c56")))
		e.add_child(K.btn("返回", "close"))
		panel.add_child(e); wire(e); return
	K.accent = K.accent_of(v.id) if TINT and has_rail() else Color(0, 0, 0, 0)
	if _bg_fog: _bg_fog.queue_redraw()
	panel.add_child(_header())
	var rx := RAIL_W if has_rail() else 0.0
	if has_rail(): panel.add_child(_rail())
	main = Control.new()
	main.name = "main"
	main.position = Vector2(rx, _hh()); main.size = Vector2(1280 - rx, 720 - _hh() - _hf())
	main.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(main)
	var page: Control = PAGES[s.page].build(self, v)
	page.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	main.add_child(page)
	panel.add_child(_footer(v))
	overlay = Control.new(); overlay.size = panel.size; overlay.visible = false; overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	panel.add_child(overlay)
	tip = PanelContainer.new(); tip.visible = false; tip.mouse_filter = Control.MOUSE_FILTER_IGNORE; tip.z_index = 5
	tip.add_theme_stylebox_override("panel", K.sb(Color("#2b2b22f2"), Color("#b4975c"), [1, 1, 1, 1], 5, [18, 16, 18, 16]))
	tip.custom_minimum_size.x = 280
	panel.add_child(tip)
	wire(panel)
	if s.detail != null or s.confirm != null: _render_overlay()
	if PAGES[s.page].has_method("after_draw"): PAGES[s.page].after_draw(self)

## 头部（2026-11-06 重设计）：左上当前页名（毛笔字 32px）；居中七个导航，每个 70×66（图标 38 + 名 14px），
## 当前页古铜细框 + 浅底 + 下方小三角；右上「返回 Esc」。七页同一个头部（行记页不再单独收紧）。
func _header() -> Control:
	var hh := _hh()
	var head := Control.new()
	head.size = Vector2(1280, hh)
	head.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var BAND := 12.0 if album() else 0.0
	head.draw.connect(func():
		if album():
			# 册页：页眉就是纸，右上一抹淡墨远山、左上一枝梅（预览图 B），下沿一道金色锦边
			var ls := K._tex(K.KIT_DIR + "landscape.png")
			if ls: head.draw_texture_rect(ls, Rect2(1280 - 330, 2, 300, 300.0 * ls.get_height() / ls.get_width()), false, Color(1, 1, 1, 0.55))
			# 11-10 用户圈了左上角：预览图是左边缘一截老梅树干、题字右边一枝梅从上边垂下、花开得密；
			# 生图 album_corner.png 照预览这块画（docs/review/party-b-kit2/corner.txt），题字压在树干和梅枝之间
			var cn := K._tex(K.KIT_DIR + "album_corner.png")
			if cn: head.draw_texture_rect(cn, Rect2(0, 0, 300, 300.0 * cn.get_height() / cn.get_width()), false, Color(0.96, 0.9, 0.84))   # 梅红压一点，贴近预览的旧色
			K.album_band(head, hh - BAND, BAND)
			return
		head.draw_rect(Rect2(0, 0, 1280, hh), Color(246 / 255.0, 241 / 255.0, 232 / 255.0, 0.88))
		head.draw_rect(Rect2(1280 * 0.03, hh - 1, 1280 * 0.94, 1), Color(K.FRAME_LINE, 0.6)))
	var title := ""
	for t in TABS_UI:
		if t[0] == s.page: title = t[1]
	var brand := K.lab(title, 32, K.INK, false, 6)
	brand.add_theme_font_override("font", Paint.font(UI.brush, 32, 6 / 32.0))
	brand.position = Vector2(34, (hh - BAND - 44) / 2); brand.size = Vector2(160, 44)
	if album():   # 册页：照预览图写成粗黑楷体，放在老梅树干右边
		brand.add_theme_font_override("font", UI.kai_bold); brand.add_theme_font_size_override("font_size", 36)
		brand.add_theme_color_override("font_color", Color("#16110c"))
		brand.add_theme_color_override("font_outline_color", Color("#16110c")); brand.add_theme_constant_override("outline_size", 2)   # 预览图笔画更粗
		brand.position = Vector2(44, (hh - BAND - 50) / 2); brand.size = Vector2(140, 50)
	head.add_child(brand)
	var nav := K.hbox(18)
	nav.alignment = BoxContainer.ALIGNMENT_CENTER
	nav.position = Vector2(200, 0); nav.size = Vector2(880, hh - BAND)
	head.add_child(nav)
	for i in TABS_UI.size():
		var t: Array = TABS_UI[i]
		var on: bool = s.page == t[0]
		var b := K.card("page", {"id": t[0]}, true, 2, null, K.sb(Color("#ede0bf55"), Color(0, 0, 0, 0), [0, 0, 0, 0], 3),
			K.sb(Color("#f3e8cf"), Color("#ae8842"), [1, 1, 1, 1], 3), [0, 5, 0, 4])
		b.on = on
		b.custom_minimum_size = Vector2(70, 60 if album() else 66)   # 册页：页签框不顶到画面上沿
		b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var box := K.content(b)
		box.alignment = BoxContainer.ALIGNMENT_CENTER
		var ic: Control
		if t[2] == "rep": ic = K.icon_rect(K._tex(REP_ICON), 38.0, true)
		else: ic = K.painted("nav", t[2], 38.0)
		ic.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		box.add_child(ic)
		var nm := K.lab(t[1], 14, Color("#785123") if on else Color("#403321"), on, 3)
		nm.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		box.add_child(nm)
		if on:
			b.under.append(func(ci: CanvasItem, r: Rect2):
				var cx := r.size.x / 2
				ci.draw_colored_polygon(PackedVector2Array([Vector2(cx - 6, r.size.y + 3), Vector2(cx + 6, r.size.y + 3), Vector2(cx, r.size.y + 9)]), Color("#ae8842")))
		nav.add_child(b)
	var exit := K.btn("", "back", {}, "", 16, [16, 4, 10, 4], 40)
	exit.custom_minimum_size.x = 92
	exit.position = Vector2(1280 - 34 - 92, (hh - BAND - 40) / 2)
	var eh := K.hbox(4); eh.mouse_filter = Control.MOUSE_FILTER_IGNORE
	eh.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); eh.alignment = BoxContainer.ALIGNMENT_CENTER
	var e1 := K.lab("‹ 返回" if album() else "返回", 16, K.INK, false, 2); e1.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var e2 := K.lab("Esc", 11); e2.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	eh.add_child(e1)
	if not album(): eh.add_child(e2)   # 册页：照预览图只写“‹ 返回”，Esc 写在页脚提示里
	exit.add_child(eh)
	head.add_child(exit)
	return head

## 左侧队员列（队伍、武学、行囊、装备四页）：结伴人物圆头像 74 + 名，选中朱红圈与朱红名签；不足 4 位补空圈
func _rail() -> Control:
	var rail := Control.new()
	rail.position = Vector2(0, _hh()); rail.size = Vector2(RAIL_W, 720 - _hh() - _hf())
	rail.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rail.draw.connect(func():
		if album():   # 册页：头像列和人物栏之间一道通到顶的细褐线（预览图 B）；队伍页左下一丛淡墨竹石，压在按钮和字下面
			if s.page == "party":
				var bb := K._tex(K.KIT_DIR + "bamboo.png")
				if bb: rail.draw_texture_rect(bb, Rect2(0, rail.size.y - 300, 186, 300), false, Color(1, 1, 1, 0.6))
			rail.draw_rect(Rect2(RAIL_W - 4, 0, 1.5, rail.size.y), Color("#b4925f", 0.8)); return
		rail.draw_rect(Rect2(RAIL_W - 6, 18, 1, rail.size.y - 36), Color(K.FRAME_LINE, 0.35)))
	var col := K.vbox(10)
	col.position = Vector2(14, 20); col.size = Vector2(RAIL_W - 28, rail.size.y - 40)
	rail.add_child(col)
	var ids: Array = roster().map(func(r): return r.id)
	var party: bool = s.page == "party"
	# 11-09 第四十七轮 A：队伍页这列列出全部结伴人物（出战的在前、头像角上盖朱红“战”字）；
	# 第四十八轮：行囊、武学、装备几页也用同一列（同样的顺序、格数、“战”字），底下两个按钮仍只在队伍页
	var act: Array = active()
	ids = act.duplicate() + ids.filter(func(x): return not act.has(x))
	var w := 78.0; var h := 96.0 if RAIL_STYLE != "tag" else 104.0
	var slots := clampi(ids.size() + 1, 1, 4)   # 空位只留一个“＋”（队伍页底下还要放两个按钮）
	if album(): slots = clampi(ids.size(), 1, 4)   # 册页：预览图 B 没有空位框，编成走底下“调整编成”
	for i in slots:
		var a = actor(ids[i]) if i < ids.size() else null
		var on: bool = a != null and a.id == s.actor
		var b := K.card("actor" if a else "formation", {"id": a.id, "tip": "actor:" + a.id} if a else {}, true, 5, null, K.sb(Color(0, 0, 0, 0)), null, [0, 0, 0, 0])
		b.custom_minimum_size = Vector2(RAIL_W - 28, h + (24 if a else 0))
		var box := K.content(b)
		box.alignment = BoxContainer.ALIGNMENT_BEGIN
		box.add_child(K.rail_face(a.id if a else "", RAIL_STYLE, w, h, on, str(a.name).substr(0, 1) if a else "", "战" if a and act.has(a.id) else ""))
		if a:
			var nm := K.lab(a.name, 15, Color("#a8352a") if on else K.INK, on, 4)
			nm.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			box.add_child(nm)
		col.add_child(b)
	if party:
		col.add_child(K.expand(K.spacer(), 1, false, true))
		var fb := K.btn("调整编成", "formation", {}, "", 12, [6, 4, 6, 4], 32)
		col.add_child(fb)
		var pet := K.card("pet", {}, false, 4, K.sb(Color("#f7f2dfb8"), Color("#8d794f80"), [1, 1, 1, 1], 3), null, null, [6, 2, 6, 2])
		pet.custom_minimum_size = Vector2(0, 32)
		K.content(pet).add_child(K.painted("nav", "pet", 24))
		K.content(pet).add_child(K.lab("同行宠物", 12))
		col.add_child(pet)
	return rail

## 页脚：居中操作提示，右侧 .qj-live 播报
func _footer(_v: Dictionary) -> Control:
	var f := Control.new()
	f.position = Vector2(0, 720 - _hf()); f.size = Vector2(1280, _hf())
	f.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var BAND := 12.0 if album() else 0.0
	f.draw.connect(func():
		if album(): K.album_band(f, 0, BAND); return   # 册页：页脚也是纸，上沿一道金色锦边
		f.draw_rect(Rect2(Vector2.ZERO, f.size), Color("#ebe3cfd8"))
		f.draw_rect(Rect2(0, 0, 1280, 1), Color(K.FRAME_LINE, 0.45)))
	var b := K.lab(HINTS.get(s.page, "悬停查看 · 点击选择 · Q / E 翻页 · Z / C 切人 · Esc 返回"), 13, Color("#51412b"), false, 2)
	b.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; b.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	b.position = Vector2(0, BAND); b.size = Vector2(1280, _hf() - BAND)
	f.add_child(b)
	live = K.lab("", 12, Color("#785622"), true)
	live.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT; live.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	live.clip_text = true
	live.position = Vector2(1280 - 34 - 380, BAND); live.size = Vector2(380, _hf() - BAND)
	f.add_child(live)
	return f

func _focus_tab() -> void:
	if panel == null: return
	for n in panel.find_children("*", "QJCard", true, false):
		if n.get_meta("qj", "") == "page" and n.get_meta("id", "") == s.page:
			n.grab_focus(); return

# ───────── 事件接线：带 meta "qj" 的按钮 / 卡片 → click()；带 meta "tip" 的 → 浮签 ─────────
func wire(root: Node) -> void:
	for n in [root] + root.find_children("*", "", true, false):
		if n.has_meta("qj") and not n.has_meta("_wired"):
			n.set_meta("_wired", true)
			var node: Control = n
			node.pressed.connect(func(): click(node))
			if n is QJCard: n.double.connect(func(): double_click(node))
		if n.has_meta("tip") and not n.has_meta("_tipwired"):
			n.set_meta("_tipwired", true)
			var node2: Control = n
			node2.mouse_entered.connect(func(): hover(node2, 0.18))
			node2.mouse_exited.connect(func(): leave())
			node2.focus_entered.connect(func(): hover(node2, 0.0))
			node2.focus_exited.connect(func(): leave())

func click(node: Control) -> void:
	var act: String = node.get_meta("qj")
	match act:
		"page": go(node.get_meta("id")); return
		"back": back(); return
		"close": close(); return
		"detailClose": back(); return
		"confirmCancel":
			s.confirm = null; _render_overlay(); return
		"confirmOk":
			var run: Callable = s.confirm.run
			s.confirm = null
			run.call(); return
		"guardApply":
			var fn: Callable = s.get("guard", Callable())
			if s.draft != null: commit("applyFormation", {"active": s.draft}, func(): s.draft = null; if fn.is_valid(): fn.call())
			elif s.points != null: commit("allocateStats", {"stats": s.points}, func(): s.points = null; if fn.is_valid(): fn.call())
			return
		"guardDiscard":
			var fn2: Callable = s.get("guard", Callable())
			s.draft = null; s.points = null; s.detail = null
			if fn2.is_valid(): fn2.call()
			else: draw()
			return
	var mod = PAGES.get(s.page)
	if mod and mod.handle(self, act, node): return
	for k in PAGES:
		if PAGES[k] != mod and PAGES[k].handle(self, act, node): return

func double_click(node: Control) -> void:
	var mod = PAGES.get(s.page)
	if mod and mod.has_method("double"): mod.double(self, node)

# ───────── 弹层：抽屉 .qj-drawer 与确认框 .qj-confirm ─────────
func _render_overlay() -> void:
	if overlay == null: return
	for c in overlay.get_children(): c.queue_free()
	overlay.visible = s.detail != null or s.confirm != null
	if not overlay.visible: return
	hide_tip()
	var dim := ColorRect.new(); dim.color = Color("#24291e4a"); dim.size = overlay.size; dim.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.add_child(dim)
	var first: Control = null
	if s.detail != null:
		var d: Dictionary = s.detail
		var modal: bool = d.get("modal", false)
		var w := 560.0
		var drawer: PanelContainer
		var col := K.vbox(0)
		if modal:
			# 居中弹窗（存档管理等）：题签在框顶，右上角 ×
			dim.color = Color("#1e1a1366")
			drawer = K.titled(d.title, null, [6, 26, 6, 4])
			(drawer.get_theme_stylebox("panel") as StyleBoxFlat).bg_color = Color("#f6f0e2")
			drawer.position = Vector2(270, 82); drawer.size = Vector2(740, 590)
			drawer.mouse_filter = Control.MOUSE_FILTER_STOP
			overlay.add_child(drawer)
			drawer.add_child(col)
			var xr := K.hbox(0); xr.alignment = BoxContainer.ALIGNMENT_END
			xr.add_child(K.btn("×", "detailClose", {}, "", 20, [8, 0, 8, 0], 32))
			col.add_child(xr)
		else:
			drawer = K.panel(Color("#f0ecdf"), K.RULE, [1, 0, 0, 0])
			drawer.position = Vector2(1280 - w, 0); drawer.size = Vector2(w, 720)
			drawer.mouse_filter = Control.MOUSE_FILTER_STOP
			overlay.add_child(drawer)
			drawer.add_child(col)
			var head := K.margin(25, 20, 25, 20)
			var hrow := K.hbox(10)
			head.add_child(hrow)
			hrow.add_child(K.expand(K.lab(d.title, 21, K.INK, false, 3)))
			var x := K.btn("×", "detailClose", {}, "flat", 25, [8, 0, 8, 0], 36)
			hrow.add_child(x)
			col.add_child(head)
			col.add_child(K.rule())
		var sc := K.scroll()
		K.expand(sc, 1, true, true)
		col.add_child(sc)
		var body := K.margin(25, 25, 25, 25)
		K.expand(body)
		sc.add_child(body)
		var inner := K.vbox(12)
		body.add_child(inner)
		var built = d.body.call(self)
		if built is Control: inner.add_child(built)
		var status := K.lab("", 13, Color("#785622"))
		status.name = "qj-detail-status"; status.visible = false
		inner.add_child(status)
		var foot := K.margin(24, 18, 24, 18)
		var frow := K.hbox(10)
		frow.alignment = BoxContainer.ALIGNMENT_END
		foot.add_child(frow)
		for a in d.actions:
			var b := K.btn(a[0], a[1], a[2] if a.size() > 2 else {}, a[3] if a.size() > 3 else "")
			if a.size() > 4 and a[4]: b.set_meta("disabled_reason", a[4])
			frow.add_child(b)
			if first == null: first = b
		var ret := K.btn(d.get("back_label", "返回"), "detailClose")
		frow.add_child(ret)
		if first == null: first = ret
		col.add_child(foot)
	if s.confirm != null:
		var box := K.panel(Color("#f0ecdf"), Color(0, 0, 0, 0), [0, 0, 0, 0], [30, 30, 30, 30])
		box.custom_minimum_size = Vector2(520, 0)
		box.mouse_filter = Control.MOUSE_FILTER_STOP
		var v := K.vbox(20)
		box.add_child(v)
		v.add_child(K.lab("确认操作", 23))
		var p := K.para(s.confirm.text, 16)
		p.custom_minimum_size.x = 460
		v.add_child(p)
		var row := K.hbox(10); row.alignment = BoxContainer.ALIGNMENT_END
		var cancel := K.btn("取消", "confirmCancel")
		row.add_child(cancel); row.add_child(K.btn("确认", "confirmOk", {}, "primary"))
		v.add_child(K.spacer(10)); v.add_child(row)
		overlay.add_child(box)
		box.reset_size()
		box.position = (Vector2(1280, 720) - box.get_combined_minimum_size()) / 2
		first = cancel
	wire(overlay)
	if first: first.call_deferred("grab_focus")

# ───────── 浮签 hover / leave / tipContent ─────────
func hover(node: Control, delay: float) -> void:
	if s.detail != null or s.confirm != null or tip == null: return
	var key: String = node.get_meta("tip")
	_hover_timer = get_tree().create_timer(delay) if delay > 0 else null
	if _hover_timer:
		var t := _hover_timer
		await t.timeout
		if t != _hover_timer or not is_instance_valid(node) or tip == null: return
	for c in tip.get_children(): c.queue_free()
	var body = tip_content(key)
	if body == null: return
	tip.add_child(body)
	tip.visible = true
	tip.reset_size()
	var r := node.get_global_rect()
	var inv := panel.get_global_transform().affine_inverse()
	var tl: Vector2 = inv * r.position
	var br: Vector2 = inv * r.end
	var w := maxf(280, tip.get_combined_minimum_size().x); var h := tip.get_combined_minimum_size().y
	var x := br.x + 12
	if x + w > 1280 - 12: x = tl.x - w - 12
	tip.position = Vector2(clampf(x, 12, 1280 - w - 12), clampf(tl.y, 12, 720 - h - 12))

func leave() -> void:
	_hover_timer = null
	var t := get_tree().create_timer(0.12)
	await t.timeout
	if _hover_timer == null: hide_tip()

func hide_tip() -> void:
	if tip: tip.visible = false

func tip_content(key: String):
	var i := key.find(":")
	var kind := key.substr(0, i); var id := key.substr(i + 1)
	var v := K.vbox(4)
	var title := func(t): v.add_child(K.lab(t, 17, Color("#ecd49a")))
	var para := func(t): var l := K.para(t, 13, Color("#efe6cc"), 1.65, 3); l.custom_minimum_size.x = 244; v.add_child(l)
	var small := func(t): v.add_child(K.lab(t, 12, Color("#d0b989")))
	match kind:
		"actor":
			var a = actor(id)
			if a == null: return null
			title.call(a.name); para.call(a.role if a.role else "江湖同伴")
			small.call(("已出战" if a.active else "候补") + (" · " + str(a.lockReason if a.lockReason else "剧情同行") if a.locked else ""))
		"stat":
			title.call("%s %d" % [STAT_LABEL[id], actor().stats[id]]); para.call(STAT_HELP[id])
		"item":
			var it := QJModel.inspect(QJModel.current(), s.actor, id)
			title.call(it.name + (" · " + it.grade if it.grade else ""))
			para.call(it.desc if it.desc else it.category)
			var n := 0
			for x in it.deltas:
				if x.delta and n < 3:
					n += 1
					v.add_child(K.lab("%s %s → %s (%s%s)" % [x.name, x.before, x.after, "+" if x.delta > 0 else "", x.delta], 13, Color("#efe6cc")))
			if it.reason: small.call(it.reason)
		"slot":
			title.call(SLOT_LABEL[id]); para.call("未装备 · 点击挑选器物")
		"inner":
			var k = QJModel.inspect_inner(QJModel.current(), s.actor, id)
			if k == null: return null
			title.call("%s · %s级" % [k.name, k.grade]); para.call(k.description)
			small.call("%d 层 · %s" % [k.level, "运转中" if k.active else "未运转"])
		"skill":
			# 招式说明卡（11-09 借逸剑风云决）：名字、第几重；◆ 招式描述；朱红类别、青绿数值与功法加成、描述
			var a = actor()
			var k = a.basicAttack if id == "fist" else null
			for x in a.skills:
				if x.id == id: k = x
			if k == null: return null
			title.call("护路棍法 · 横杆护身" if id == "qh_hulu_staff" else k.name)
			if id != "fist":
				small.call("第%s重%s" % [k.get("level", 1), (" · " + str(k.grade) + "级") if k.get("grade") else ""])
				v.add_child(K.lab("◆ 招式描述", 13, Color("#ecd49a")))
				var light: bool = PAGES.skill.is_light(id)
				v.add_child(K.lab("%s · %s" % ["轻功" if light else "外功", PAGES.party.kind_name(str(k.get("kind", "")))], 13, Color("#f0a08c")))
				var nums := []
				if not light: nums.append("耗内力 %d" % int(k.get("mp", 0)))
				if k.get("bpDescription") and not light: nums.append(str(k.bpDescription))
				if nums.size(): v.add_child(K.lab("　".join(nums), 13, Color("#a8d8b0")))
				var art = PAGES.party.art_of(id)
				if art and art.get("mastery") and art.mastery.get("description"):
					var ml := K.para("%s第%s层：%s" % [art.name, art.mastery.get("level", 10), art.mastery.description], 13, Color("#a8d8b0"), 1.5); ml.custom_minimum_size.x = 244; v.add_child(ml)
			para.call(k.get("description", k.get("desc", "")) if k.get("description", k.get("desc", "")) else "点击查看招式详情")
		"art":
			var art = PAGES.party.art_by_id(id)
			if art == null: return null
			title.call("%s · %s级" % [art.name, art.get("grade", "")] if art.get("grade") else str(art.name))
			small.call(("轻功" if art.get("light") else "外功") + " · " + PAGES.party.kind_name(str(art.get("path", ""))))
			var names: Array = art.get("moves", []).map(func(x): return str(x.get("name", "")))
			if names.size(): para.call("招式：" + "、".join(names))
			if art.get("mastery") and art.mastery.get("description"):
				v.add_child(K.lab("第%s层：%s" % [art.mastery.get("level", 10), art.mastery.description], 13, Color("#a8d8b0")))
			small.call("点击看这门功法的招式")
		"cond":
			# 获得状态（11-09 照大侠立志传「获得状态」）：名字、效果、来源、怎么解除
			var c = PAGES.party.state_by_id(actor(), id)
			if c == null: return null
			v.add_child(K.lab(("↑ " if c.good else "↓ ") + str(c.name), 17, Color("#a8d8b0") if c.good else Color("#e2a6c4")))
			if c.effect != "": v.add_child(K.lab(c.effect, 13, Color("#efe6cc")))
			if c.source != "": small.call("来源：" + c.source)
			if c.recovery != "": small.call("持续：" + c.recovery)
		_:
			return null
	return v

# ───────── 键位 onKey ─────────
## 菜单打开时在 _input 里先吃掉按键（原版捕获阶段 + stopImmediatePropagation）
func _input(ev: InputEvent) -> void:
	if not s.open or panel == null: return
	if not (ev is InputEventKey): return
	var vp := get_viewport()
	if not ev.pressed:
		if ev.keycode in [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_W, KEY_A, KEY_S, KEY_D, KEY_SHIFT]:
			World.keys = {}; vp.set_input_as_handled()
		return
	if ev.ctrl_pressed or ev.meta_pressed or ev.alt_pressed: return
	var k: int = ev.keycode
	var fo := vp.gui_get_focus_owner()
	if fo is LineEdit or fo is SpinBox or (fo and fo.get_parent() is SpinBox):
		if k == KEY_ESCAPE:
			vp.set_input_as_handled(); fo.release_focus(); _focus_tab()
		return
	if k == KEY_TAB: return   # 交给 Godot 的焦点循环
	vp.set_input_as_handled()
	if k == KEY_ESCAPE or k == KEY_I:
		if not ev.echo: back()
		return
	if s.detail != null or s.confirm != null:
		if s.draft != null or s.points != null:
			if k == KEY_Q or k == KEY_E: _flip(-1 if k == KEY_Q else 1)
			elif k == KEY_Z or k == KEY_C:
				var ids: Array = roster().map(func(r): return r.id)
				var at := ids.find(s.actor)
				guard(func(): s.actor = ids[(at + (-1 if k == KEY_Z else 1) + ids.size()) % ids.size()]; s.detail = null; draw())
		elif k in [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN]: _arrow_focus(k, overlay)
		elif k == KEY_ENTER or k == KEY_KP_ENTER or k == KEY_SPACE: _accept(fo)
		return
	if k == KEY_Q or k == KEY_E:
		_flip(-1 if k == KEY_Q else 1); return
	if k >= KEY_1 and k <= KEY_9:
		var i := k - KEY_1
		if i < TABS_UI.size(): go(TABS_UI[i][0])
		return
	if k == KEY_Z or k == KEY_C:
		var list: Array = active() if s.page == "party" else roster().map(func(r): return r.id)
		var i := list.find(s.actor)
		guard(func(): s.actor = list[(i + (-1 if k == KEY_Z else 1) + list.size()) % list.size()]; s.selected = null; draw())
		return
	if k == KEY_B or k == KEY_K or k == KEY_L:
		go({KEY_B: "bag", KEY_K: "skill", KEY_L: "quest"}[k]); return
	if k in [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN]:
		var mod = PAGES[s.page]
		if mod.has_method("arrow") and mod.arrow(self, fo, k): return
		_arrow_focus(k, panel); return
	if (k == KEY_ENTER or k == KEY_KP_ENTER) and s.page == "equip" and fo and fo.get_meta("qj", "") == "equipPick":
		if not ev.echo: PAGES.equip.wear(self, fo.get_meta("id"))
		return
	if k == KEY_F1 and fo:
		var mod2 = PAGES[s.page]
		if mod2.has_method("f1"): mod2.f1(self, fo)
		return
	if k == KEY_ENTER or k == KEY_KP_ENTER or k == KEY_SPACE: _accept(fo)

func _accept(fo: Control) -> void:
	if fo is QJCard: fo.pressed.emit()
	elif fo is BaseButton: fo.pressed.emit()

func _flip(d: int) -> void:
	var at := _tab_index(s.page)
	go(TABS_UI[(at + d + TABS_UI.size()) % TABS_UI.size()][0])

## 方向键：在可见按钮间前后移动（左/上 -1，右/下 +1，循环）
func _arrow_focus(k: int, scope: Control) -> void:
	var list := []
	for n in scope.find_children("*", "", true, false):
		if (n is BaseButton or n is QJCard) and n.is_visible_in_tree() and n.focus_mode != Control.FOCUS_NONE: list.append(n)
	if list.is_empty(): return
	var at := list.find(get_viewport().gui_get_focus_owner())
	var d := -1 if k in [KEY_LEFT, KEY_UP] else 1
	(list[(at + d + list.size()) % list.size()] as Control).grab_focus()

## 菜单未开时的热键：B 行囊、K 武学、L 行记、Esc 设置（I 由 World 经 UI.toggle_menu 进来）
func _unhandled_input(ev: InputEvent) -> void:
	if s.open or not (ev is InputEventKey) or not ev.pressed or ev.echo: return
	if ev.ctrl_pressed or ev.meta_pressed or ev.alt_pressed: return
	var hot := {KEY_B: "bag", KEY_K: "skill", KEY_L: "quest", KEY_ESCAPE: "sys"}
	if not hot.has(ev.keycode) or not can_open() or UI.panel_open(): return
	get_viewport().set_input_as_handled()
	open(hot[ev.keycode])

# ───────── 任务追踪（HUD 与通知用；原版 trackedQuests / newQuests / mainTracked / setTracked / openQuest） ─────────
func tracked_quests() -> Array:
	return Quest.tracked_quests()

func main_tracked() -> bool:
	return Quest.main_tracked()

func new_quests() -> Array:
	return Quest.new_quests()

func set_tracked(key: String, on: bool) -> void:
	Quest.set_tracked(key, on)
	G.save(); UI.hud()

func open_quest(key: String) -> void:
	var t = Quest.find_task(key)
	if t != null:
		s.journalView = "tasks"; s.questId = t.id; s.questFilter = t.status
	if s.open: go("quest")
	else: open("quest")

func open_person(id: String) -> void:
	s.journalView = "people"; s.journalPersonId = id
	if s.open: go("quest")
	else: open("quest")

# ───────── 调试入口：godot --path game -- --menu=<页> ─────────
## 造一份开始部分中段的状态（第二日、叶蘅同行、行囊有药食与装备、学过护路棍法），直接打开对应页
func debug_start(tab: String) -> void:
	debug = true
	if tab.contains("%"):   # 试提神效果：--menu=party-suzhi%shadow+halo
		FIG_FX = Array(tab.get_slice("%", 1).split("+", false)); tab = tab.get_slice("%", 0)
	if tab.contains("&"):   # 试加深背景板：--menu=party-suzhi&mid 读 figplate-test/mid/
		FIG_PLATE = "figplate-test/" + tab.get_slice("&", 1); tab = tab.get_slice("&", 0)
	if tab.contains("^"):   # 试立绘背景风格：--menu=party-suzhi^B 读 portraits/bgtest/B/
		FIG_DIR = "portraits/bgtest/" + tab.get_slice("^", 1); tab = tab.get_slice("^", 0)
	if tab.contains("!"):   # 截图比整套方案：--menu=party!plain / !look1
		apply_look(tab.get_slice("!", 1)); tab = tab.get_slice("!", 0)
	if tab.contains("~"):   # 截图比整页底：--menu=party~thin / ~glass
		PAGE_BG = tab.get_slice("~", 1); tab = tab.get_slice("~", 0)
	if tab.contains("#"):   # 截图比立绘面板：--menu=party#art / #ink
		FIG_BG = tab.get_slice("#", 1); tab = tab.get_slice("#", 0)
	if tab.contains("@"):   # 截图比样式：--menu=party@tag
		RAIL_STYLE = tab.get_slice("@", 1); tab = tab.get_slice("@", 0)
	G.S = G.new_state()
	G.S.name = "萧白"
	G.S.origin = "orphan"
	G.S.lv = 3; G.S.exp = 140; G.S.pts = 3
	G.S.silver = 46
	G.S.prologue = {"version": 2, "errands": {"bowls": "done", "cloth": "done", "medicine": "done"}, "carry": {}, "heard": {}, "relicSeen": true, "rested": true, "ending": false,
		"yeHousePermission": true, "arrival": {"version": 1, "stage": "done", "borrowed": true, "originExpression": null, "dogResult": null, "greeted": {"叶蘅": true, "陈伯": true, "周婶": true}}}
	var ch := Flow.get_node_or_null("Chapter")
	G.S.qiheChapter = ch.initial() if ch and ch.has_method("initial") else {"stage": "days", "halfDay": 2, "events": {}, "choices": {}, "records": {}}
	G.S.qiheChapter.stage = "days"
	G.S.qiheChapter.halfDay = 2
	G.S.qiheChapter.events["xu-meeting"] = true
	G.S.qiheChapter.choices["practice"] = true
	G.S.qiheChapter.granted = true
	G.S.party = ["ye"]
	G.S.skills = {"fist": 1, "qh_hulu_staff": 1, "fuhu": 2}
	G.S.bag = {"bun": 3, "pill": 2, "wine": 1, "qh_candy": 2, "book": 1, "gall": 1, "club": 1, "cloth": 1, "charm": 1, "qh_herb_pouch": 1,
		"qh_hidden_dagger": 1, "qh_wild_herb": 4, "qh_dry_branch": 2, "qh_staff_notes": 1, "shovel": 1}
	G.S.weapon = "qh_practice_staff"; G.S.armor = null; G.S.acc = null
	var d := Stats.derived(G.S)
	G.S.hp = d.mhp - 37; G.S.mp = d.mmp
	G.S.scene = "qihe_trial"
	G.save_key = "debug"
	G.mode = "scene"
	await get_tree().process_frame
	if World.scenes.has("qihe_trial") and World.has_method("enter_scene_now"):
		await Assets.preload_keys(World.scene_asset_keys("qihe_trial"))
		World.enter_scene_now("qihe_trial")
	UI.hud()
	if tab == "saves":   # 截图用：设置页上直接弹出存档管理
		open("sys"); PAGES.sys._save_manager(self, "active"); return
	if tab == "bag-pick":   # 截图用：行囊选中金疮药，看右侧详情
		open("bag"); s.selected = "pill"; draw(); return
	if tab.begins_with("party-"):   # 截图用：--menu=party-peizhigu 让此人同行并选中，看头像和立绘
		var who := tab.trim_prefix("party-")
		G.S.party = ["ye"] if who == "ye" else ["ye", who]; open("party"); s.actor = who; draw(); return
	open(tab if tab != "" and tab != "1" else "party")
