extends Node
## 野外物资点（原版 js/qihe-resources.js）：枯枝、野草药、芦苇；固定点位、每点一次，不刷新，不耗半日。
## 采集节点已在 sc.json（n.resource、n.kind、n.amount；绘制在 world_draw._draw_resource）；这里挂 show/act、交付配方与“野外行囊”面板。
## 存档 S.qiheResources：nodes 已取的点、exchanges 交付次数。
## 注：原版 qihe-hud.css 把“野外行囊 · B”按钮隐藏了，B 键也因 QiheJianghuUI 存在而不响应，面板实际进不去；这里照移植面板，入口留给 side.resource_inventory()。

var side: Node

const KINDS := {
	"branch": {"item": "qh_dry_branch", "name": "枯枝", "verb": "拾取", "use": "捡地上的落枝，不砍树。2份可在南村口店家、接应院周婶或山居厨房换1份干粮。"},
	"herb": {"item": "qh_wild_herb", "name": "野草药", "verb": "采集", "use": "只采散生的小丛，留根。2份可交南村口药商辨收，换4两；不是可直接服用的药品。"},
	"reed": {"item": "qh_river_reed", "name": "芦苇", "verb": "采集", "use": "河岸少量取秆，留根。2份可交南村口药商作包装垫料，换2两。"}}
## 店家 2026-10-27 搬进客栈柜台
const RECIPES := [
	{"id": "fuel", "kind": "branch", "cost": 2, "item": "bun", "amount": 1, "text": "交枯枝 2 → 干粮 1", "receivers": [["prologue_inn_interior", "innkeeper"], ["refuge", "aunt"], ["mountain", "kitchen"]]},
	{"id": "medicine", "kind": "herb", "cost": 2, "silver": 4, "text": "交野草药 2 → 4两", "receivers": [["south", "merchant"]]},
	{"id": "packing", "kind": "reed", "cost": 2, "silver": 2, "text": "交芦苇 2 → 2两", "receivers": [["south", "merchant"]]}]

var nodes: Array = []

func _ready() -> void:
	for k in KINDS:
		DB.ITEMS[KINDS[k].item] = {"name": KINDS[k].name, "desc": KINDS[k].use}
	for scene in World.scenes:
		for n in World.scenes[scene].get("npcs", []):
			if n.get("resource"):
				n.scene = scene
				var node: Dictionary = n
				n.show = func(): return remaining(node)
				n.act = func(_x = null): collect(node)
				nodes.append(n)

func store() -> Dictionary:
	if not (G.S.get("qiheResources") is Dictionary): G.S.qiheResources = {"version": 1, "nodes": {}}
	var s: Dictionary = G.S.qiheResources
	if not (s.get("nodes") is Dictionary): s.nodes = {}
	return s

func taken(id: String) -> bool:
	return G.S != null and side.C.truthy(G.S.get("qiheResources", {}).get("nodes", {}).get(id, false))

func safe_phase() -> bool:
	var p = G.S.get("qiheChapter") if G.S != null else null
	return not (p is Dictionary and p.get("stage") in ["fire", "escape"])

func remaining(n: Dictionary) -> bool: return G.S != null and not taken(n.id) and safe_phase()

func _dist(n: Dictionary) -> float:
	return Vector2(World.player.x - n.x * World.TS, World.player.y - n.y * World.TS).length()

## 收货人按对话距离算、不看视线（客栈店家隔着柜台）
func near_talk(n: Dictionary, scene: String) -> bool:
	return World.cur_id == scene and _dist(n) < max(110.0, float(n.get("talkR", 0)))

## 2026-11-09 自动查“没反馈”查出：提示里已经出现“采集 · 芦苇”，按下去却因为要 80 像素内且视线不被挡（芦苇长在水边）而什么都不发生。
## 距离和墨印、交谈一样按 130 算，不再要求视线
func near(n: Dictionary) -> bool:
	return World.cur_id == n.scene and _dist(n) < 130

func collect(n: Dictionary) -> bool:
	if not (n in nodes) or G.mode != "scene" or Dialog.busy or UI.panel_open() or not remaining(n): return false
	if not near(n):
		UI.toast("离得远了，够不着", 1400); return false
	var v: Dictionary = KINDS[n.kind]
	var bag: Dictionary = side.bag()
	bag[v.item] = int(bag.get(v.item, 0)) + int(n.amount)
	var s := store(); s.version = 1; s.nodes[n.id] = true
	G.S.scene = World.cur_id; G.S.x = World.player.x; G.S.y = World.player.y
	G.save()
	World.npcs = World.npcs_of(World.cur); World.player.path = null
	UI.toast("获得 %s ×%d · B 查看野外行囊" % [v.name, n.amount], 2200); UI.hud()
	return true

func receiver(r: Dictionary):
	if not safe_phase(): return null
	for pair in r.receivers:
		var scene: String = side.IDS.get(pair[0], pair[0])
		var n: Dictionary = side.npc(scene, pair[1])
		if not n.is_empty() and side.show_of(n) and near_talk(n, scene): return n
	return null

func exchange(id: String) -> bool:
	var r = null
	for x in RECIPES:
		if x.id == id: r = x
	if r == null or G.mode != "scene" or G.S == null or receiver(r) == null: return false
	var item: String = KINDS[r.kind].item
	var bag: Dictionary = side.bag()
	if int(bag.get(item, 0)) < r.cost: return false
	bag[item] = int(bag[item]) - r.cost
	if r.has("item"): bag[r.item] = int(bag.get(r.item, 0)) + r.amount
	var s := store(); s.version = 1; s.exchanges = int(s.get("exchanges", 0)) + 1
	G.S.silver = side.silver() + int(r.get("silver", 0))
	G.save()
	UI.toast(r.text + " · 已存档", 1600); UI.hud()
	return true

# ─────────────────────── 野外行囊面板（.panel.qh-resource-panel） ───────────────────────
var _panel: Control = null

func inventory() -> void:
	if G.S == null or World.busy or Dialog.busy or G.mode != "scene" or UI.panel_open(): return
	World.busy = true; World.keys = {}; World.player.path = null
	_panel = _build()
	UI.root.add_child(_panel); UI.push_panel(_panel)
	_render()
	await _panel.tree_exited
	World.busy = false; World.keys = {}; UI.hud()

func close() -> void:
	if _panel and is_instance_valid(_panel):
		UI.pop_panel(_panel); _panel.queue_free()
	_panel = null

func _unhandled_input(e: InputEvent) -> void:
	if _panel and is_instance_valid(_panel) and e is InputEventKey and e.pressed and not e.echo and e.keycode in [KEY_ESCAPE, KEY_B] and not Dialog.busy:
		get_viewport().set_input_as_handled(); close()

const FS := 18   # clamp(14px,1.4vw,20px)，按 1280 宽取 18px
var _list: VBoxContainer

func _build() -> Control:
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT); dim.size = Vector2(1280, 720)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	# inset:8% 17%，padding 1.25em 1.6em，边框 1px #8f8056
	var box := PanelContainer.new()
	box.position = Vector2(1280 * 0.17, 720 * 0.08); box.size = Vector2(1280 * 0.66, 720 * 0.84)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(10 / 255.0, 8 / 255.0, 6 / 255.0, 0.84); sb.border_color = Color("#8f8056"); sb.set_border_width_all(1)
	sb.content_margin_left = FS * 1.6; sb.content_margin_right = FS * 1.6; sb.content_margin_top = FS * 1.25; sb.content_margin_bottom = FS * 1.25
	box.add_theme_stylebox_override("panel", sb)
	dim.add_child(box)
	var col := VBoxContainer.new(); box.add_child(col)
	var head := HBoxContainer.new(); col.add_child(head)
	var h2 := _text("野外行囊", int(FS * 1.5), UI.PAPER, UI.serif_bold); h2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(h2)
	var close_btn := _button("返回 · Esc", true); close_btn.pressed.connect(close); head.add_child(close_btn)
	col.add_child(_text("少量取用，留根留苗。采集不耗半日或培养体力；本段不刷新。", FS, UI.DIM, UI.sans))
	var scroll := ScrollContainer.new(); scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	col.add_child(scroll)
	_list = VBoxContainer.new(); _list.size_flags_horizontal = Control.SIZE_EXPAND_FILL; scroll.add_child(_list)
	return dim

func _text(t: String, size: int, c: Color, f: Font) -> Label:
	var l := Label.new(); l.text = t
	l.add_theme_font_override("font", f); l.add_theme_font_size_override("font_size", size); l.add_theme_color_override("font_color", c)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	return l

func _button(t: String, enabled: bool) -> Button:
	var b := Button.new(); b.text = t; b.disabled = not enabled
	b.custom_minimum_size = Vector2(0, 40)
	b.add_theme_font_override("font", UI.sans); b.add_theme_font_size_override("font_size", FS)
	var n := StyleBoxFlat.new(); n.bg_color = Color(34 / 255.0, 27 / 255.0, 20 / 255.0, 0.95); n.border_color = UI.BZ; n.set_border_width_all(1)
	n.content_margin_left = FS; n.content_margin_right = FS; n.content_margin_top = FS * 0.35; n.content_margin_bottom = FS * 0.35
	var h := n.duplicate(); h.bg_color = Color("#2e2419"); h.border_color = UI.GOLD
	b.add_theme_stylebox_override("normal", n); b.add_theme_stylebox_override("hover", h); b.add_theme_stylebox_override("focus", h)
	b.add_theme_stylebox_override("pressed", h); b.add_theme_stylebox_override("disabled", n)
	b.add_theme_color_override("font_color", UI.PAPER); b.add_theme_color_override("font_hover_color", UI.HI)
	b.add_theme_color_override("font_disabled_color", Color(UI.PAPER, 0.38))
	if not enabled: b.modulate.a = 0.38
	return b

func _render() -> void:
	if _list == null: return
	for c in _list.get_children(): c.queue_free()
	var bag: Dictionary = side.bag()
	for k in KINDS:
		var v: Dictionary = KINDS[k]
		var row := HBoxContainer.new(); row.add_theme_constant_override("separation", FS)
		var img := TextureRect.new(); img.custom_minimum_size = Vector2(64, 64); img.texture = Assets.tex_ready("r_qh_%s_v1" % k)
		img.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST; img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		row.add_child(img)
		var txt := VBoxContainer.new(); txt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		txt.add_child(_text("%s ×%d" % [v.name, int(bag.get(v.item, 0))], int(FS * 1.17), UI.PAPER, UI.serif_bold))
		txt.add_child(_text(v.use, FS, UI.DIM, UI.sans))
		row.add_child(txt); _list.add_child(row)
		var line := ColorRect.new(); line.color = Color("#78684555"); line.custom_minimum_size = Vector2(0, 1); _list.add_child(line)
	_list.add_child(_text("就近交付", int(FS * 1.17), UI.PAPER, UI.serif_bold))
	_list.add_child(_text("到收取者身旁再交付。干粮 ×%d · 银钱 %d两" % [int(bag.get("bun", 0)), side.silver()], FS, UI.DIM, UI.sans))
	for r in RECIPES:
		var n = receiver(r)
		var enough: bool = int(bag.get(KINDS[r.kind].item, 0)) >= r.cost
		var row := HBoxContainer.new(); row.add_theme_constant_override("separation", FS)
		var b := _button(r.text, n != null and enough)
		var rid: String = r.id
		b.pressed.connect(func(): if exchange(rid): _render())
		row.add_child(b)
		var why: String = ("前往：南村口店家 / 接应院周婶 / 山居厨房" if r.id == "fuel" else "前往：南村口药商") if n == null else ("材料不足" if not enough else "交给：" + str(n.name))
		row.add_child(_text(why, int(FS * 0.85), UI.DIM, UI.sans))
		_list.add_child(row)
