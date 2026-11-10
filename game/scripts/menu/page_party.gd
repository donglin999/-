extends RefCounted
## 队伍页（原属性页并入）。对应原版 js/qihe-jianghu-ui.js 的 partyPage / summary / statIcons / attributes /
## formation / formationRender / pointsRender / insightPanel / insightPreview / petDetail，
## 以及 click 分支 actor / attributes / statDetail / formation* / candidate / allocate / point* / insight* / pet*。
## 页面排版 2026-11-06 起按 docs/review/menu-redesign-preview-v3 重做；抽屉（编成、加点、历练、宠物）仍照原版。

const K := preload("res://scripts/menu/kit.gd")
const PAGES_SKILL := preload("res://scripts/menu/page_skill.gd")
const DERIVED_LABEL := {"atk": "攻击", "def": "防御", "mhp": "气血上限", "mmp": "内力上限", "crit": "暴击", "dodge": "闪避", "spd": "身速", "block": "格挡"}
const COND_LABEL := {"mhp": "气血上限", "mmp": "内力上限", "atk": "攻击", "spd": "速度", "def": "防御"}

## 11-10 第五十轮第 1 题选 B「册页题跋」：整页像翻开的人物画册——三栏不再是方框，
## 中间立绘装裱成一幅画（锦纹上下边、绢色画心），左右两栏像画前画后的题跋，栏与栏之间是竖的锦纹隔水；
## 栏题是朱印式小匾；四角点几笔淡墨梅竹。老布局（非 BIG_FIG）照旧
static func build(m, v: Dictionary) -> Control:
	if not m.BIG_FIG: return _build_old(m, v)
	if m.album(): return _build_album(m, v)
	var root := Control.new(); root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_deco(root, "bamboo.png", Control.PRESET_TOP_RIGHT, Vector2(110, 180), Vector2(-24, 18), 0.35, true)
	_deco(root, "plum.png", Control.PRESET_TOP_LEFT, Vector2(220, 68), Vector2(-20, -88), 0.8)
	_deco(root, "plum.png", Control.PRESET_BOTTOM_RIGHT, Vector2(150, 46), Vector2(-4, 10), 0.7, true)
	var mg := K.margin(10, 14, 22, 10); mg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(mg)
	var col := K.vbox(0); mg.add_child(col)
	col.add_child(K.brocade(false, 12))
	var top := K.hbox(0); K.expand(top, 1, true, true)
	col.add_child(top)
	col.add_child(K.brocade(false, 12))
	var a := _paper(); a.custom_minimum_size.x = 345
	var av := K.vbox(4); a.add_child(av)
	av.add_child(K.seal_title("人物")); var pp := _person(m, v); K.expand(pp, 1, true, true); av.add_child(pp)
	top.add_child(a)
	top.add_child(K.brocade(true, 14))
	var mid := K.panel(Color("#f6efdd"), Color(0, 0, 0, 0), [0, 0, 0, 0], [14, 12, 14, 12]); K.expand(mid, 1, true, true)
	mid.add_child(_figure_big(m, v))
	top.add_child(mid)
	top.add_child(K.brocade(true, 14))
	var c := _paper(); c.custom_minimum_size.x = 345
	var cv := K.vbox(4); c.add_child(cv)
	cv.add_child(K.seal_title("武学与状态")); var mm := _martial(m, v); K.expand(mm, 1, true, true); cv.add_child(mm)
	top.add_child(c)
	return root

## 11-10 第五十轮 B 版验收“继续改”（用户：“不还是很多样式不一样和背景不一样嘛，你不能说看起来差不多就行”）：
## 照预览图 B 逐处对齐——整页一张旧册页纸（菜单外壳画），三栏不再是方框、栏间没有空隙；
## 人物栏、武学栏直接写在纸上；立绘栏两边是金色锦纹竖条，画心上下青灰锦边贴着页眉、页脚的金边，撑满整栏高；
## 左下一丛竹石、右上竹、右下梅（页眉的梅枝、远山在外壳里画）
static func _build_album(m, v: Dictionary) -> Control:
	var root := Control.new(); root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	# 素材都压在字下面（栏是透明的，先加的先画）；左下竹石画在头像列里（menu.gd _rail），不然会盖住头像列的按钮
	_deco(root, "bamboo.png", Control.PRESET_TOP_RIGHT, Vector2(120, 196), Vector2(-6, 4), 0.55, true, false)
	_deco(root, "plum.png", Control.PRESET_BOTTOM_RIGHT, Vector2(170, 52), Vector2(2, 2), 0.85, true, false)
	var top := K.hbox(0); top.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(top)
	var a := K.margin(14, 10, 16, 8); a.custom_minimum_size.x = 352
	var av := K.vbox(4); a.add_child(av)
	av.add_child(K.seal_title("人物", 16, true)); var pp := _person(m, v); K.expand(pp, 1, true, true); av.add_child(pp)
	top.add_child(a)
	top.add_child(K.album_strip())
	var mid := _art_stage(m, v, "assets/ui/jianghu-v4/%s/%s.webp" % [m.FIG_DIR, K.portrait_key(v.id)])
	K.expand(mid, 1, true, true)
	top.add_child(mid)
	top.add_child(K.album_strip())
	var c := K.margin(18, 10, 16, 8); c.custom_minimum_size.x = 352
	var cv := K.vbox(4); c.add_child(cv)
	cv.add_child(K.seal_title("武学与状态")); var mm := _martial(m, v); K.expand(mm, 1, true, true); cv.add_child(mm)
	top.add_child(c)
	return root

## 角落的淡墨梅竹（生图素材，压在纸底上、文字下面）
static func _deco(root: Control, file: String, preset: int, sz: Vector2, off: Vector2, alpha: float, flip := false, front := true) -> void:
	var t := TextureRect.new(); t.texture = K._tex(K.KIT_DIR + file)
	if t.texture == null: return
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; t.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT
	t.flip_h = flip; t.modulate = Color(1, 1, 1, alpha); t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var right := preset in [Control.PRESET_BOTTOM_RIGHT, Control.PRESET_TOP_RIGHT]
	var bottom := preset in [Control.PRESET_BOTTOM_LEFT, Control.PRESET_BOTTOM_RIGHT]
	t.anchor_left = 1.0 if right else 0.0; t.anchor_right = t.anchor_left
	t.anchor_top = 1.0 if bottom else 0.0; t.anchor_bottom = t.anchor_top
	t.offset_left = (-sz.x if right else 0.0) + off.x; t.offset_right = t.offset_left + sz.x
	t.offset_top = (-sz.y if bottom else 0.0) + off.y; t.offset_bottom = t.offset_top + sz.y
	t.z_index = 1 if front else 0   # 压在栏纸底上面、字的下面看不出差别：素材很淡，放在最上层也不挡点击
	root.add_child(t)

## 题跋栏的纸底：素净米白，不透出菜单底图的柳枝山水（B 版是干净的纸）
static func _paper() -> PanelContainer:
	return K.panel(Color("#f6efdd"), Color(0, 0, 0, 0), [0, 0, 0, 0], [14, 10, 14, 6])

static func _build_old(m, v: Dictionary) -> Control:
	var root := K.margin(10, 24, 30, 12)
	var col := K.vbox(16)
	root.add_child(col)
	var top := K.hbox(16)
	K.expand(top, 1, true, true)
	col.add_child(top)
	var a := K.titled("人物", _person(m, v)); a.custom_minimum_size.x = 345
	top.add_child(a)
	var b := K.titled("立绘", _figure(m, v)); K.expand(b, 1, true, true)
	top.add_child(b)
	var c := K.titled("武学与状态", _martial(m, v)); c.custom_minimum_size.x = 345
	top.add_child(c)
	col.add_child(_tray(m))
	return root

## 面板一「人物」：名、身份 · 等级、气血内力修为、五维（小图标）、八项战斗数值、按钮
static func _person(m, v: Dictionary) -> Control:
	var b := K.vbox(3)
	# 11-10 B 版“继续改”：照预览图字更大更黑（名字粗黑、说明不再用灰字）
	b.add_child(K.lab(v.name, 32, Color("#231a12"), true, 6))
	b.add_child(K.lab("%s · %s级" % [v.role if v.role else "江湖同伴", v.level], 15, Color("#3d3326"), false, 2))
	if v.get("relationship"):
		b.add_child(K.lab("♡ %s %s/100" % [v.relationship.stage, v.relationship.score], 13))
	b.add_child(K.spacer(2))
	b.add_child(K.vitals(v, false, 14, true))   # B 版：修为也画成一条
	if v.level >= 100: b.add_child(K.lab("已满级 · 100级", 12, Color("#7c6543")))
	# 状态 11-09 起放在右栏「获得状态」
	b.add_child(K.rule(Color(K.FRAME_LINE, 0.4)))
	var stats := K.hbox(2)
	stats.alignment = BoxContainer.ALIGNMENT_CENTER
	for k in m.STAT_LABEL:
		var st := K.card("statDetail", {"id": k, "tip": "stat:" + k}, true, 1, null, null, null, [2, 2, 2, 2])
		st.custom_minimum_size.x = 60
		var box := K.content(st)
		box.add_child(K.painted("stat", k, 32))
		var l := K.lab("%s %d" % [m.STAT_LABEL[k], int(v.stats.get(k, 0))], 13, Color("#2f2519"))
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		box.add_child(l)
		stats.add_child(st)
	b.add_child(stats)
	# 11-10：装备改横排后左栏放不下底部那排按钮，“属性详情”“江湖历练”挪到属性点这一行左边
	var pr := K.hbox(6)
	var pool := 0
	var ins = QJModel.insight()
	if ins: pool = int(ins.get("balance", 0))
	pr.add_child(_pbtn(K.btn("属性详情", "attributes", {}, "", 13, [8, 1, 8, 1], 26)))
	pr.add_child(_pbtn(K.btn("江湖历练 %d" % pool, "insight", {}, "", 13, [8, 1, 8, 1], 26)))
	pr.add_child(K.expand(K.spacer()))
	if v.points:
		var pl := K.lab("剩余属性点 %d" % v.points, 13, Color("#a8352a")); pl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		pr.add_child(pl)
		pr.add_child(_pbtn(K.btn("分配", "allocate", {}, "", 13, [8, 1, 8, 1], 26)))
	b.add_child(pr)
	b.add_child(K.rule(Color(K.FRAME_LINE, 0.4)))
	var g := K.grid(2, 22, 5)
	for k in DERIVED_LABEL:
		var r := K.hbox(4); K.expand(r)
		r.add_child(K.expand(K.lab(DERIVED_LABEL[k], 14, Color("#2f2519"))))
		r.add_child(K.lab(str(v.derived.get(k, 0)) + ("%" if k in ["crit", "dodge", "block"] else ""), 14, Color("#231a12")))
		g.add_child(r)
	b.add_child(g)
	if m.BIG_FIG:   # 11-09 第四十七轮验收：装备从立绘右下角挪到这里（属性下面原先空着）
		b.add_child(K.rule(Color(K.FRAME_LINE, 0.4)))
		b.add_child(_equip_list(m, v))
	b.add_child(K.expand(K.spacer(), 1, false, true))
	return b

## 面板二「立绘」：当前人物全身立绘 + 名签 + 三件装备（点了去装备页对应部位）
static func _figure(m, v: Dictionary) -> Control:
	var b := K.vbox(6)
	var art := K.portrait_view(v.id)
	var stage := _figure_stage(m, v.id, art)
	K.expand(stage, 1, true, true)
	stage.clip_contents = true
	b.add_child(stage)
	var cap := K.lab("%s · %s" % [v.name, "出战" if m.active().has(v.id) else "候补"], 15, Color("#30291f"), false, 3)
	cap.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.add_child(cap)
	var line := K.rule(Color("#ae8842"), false, 2); line.custom_minimum_size.x = 160; line.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	b.add_child(line)
	b.add_child(K.spacer(2))
	var slots := K.hbox(6)
	for key in m.SLOT_LABEL:
		var id = v.equipment.get(key)
		var c := K.card("goEquip", {"slot": key, "tip": ("item:" + id) if id else "slot:" + key}, false, 6, null, null, null, [4, 3, 4, 3])
		K.expand(c)
		var box := K.content(c)
		box.alignment = BoxContainer.ALIGNMENT_BEGIN
		box.add_child(K.item_icon(id, 36) if id else K.painted("slot", key, 36))
		var t := K.vbox(0); K.expand(t)
		t.add_child(K.lab(m.SLOT_LABEL[key], 11, Color("#6d5a3a")))
		var n := K.lab(str(DB.ITEMS.get(id, {}).get("name", id)) if id else "未装备", 13, K.INK if id else Color("#8b8170"))
		n.clip_text = true
		t.add_child(n)
		box.add_child(t)
		slots.add_child(c)
	b.add_child(slots)
	return b

## 立绘面板：art 有带背景版的人整张显示（四边化进纸色），ink 抠图立绘叠在人物水墨意境底上
static func _figure_stage(m, id: String, art: Control) -> Control:
	var st := Control.new()
	var key := K.portrait_key(id)
	var paper := Color("#f8f3e7")
	if m.FIG_BG == "art" and ResourceLoader.exists("res://assets/ui/jianghu-v4/portraits/bg/%s.webp" % key):
		var full := QJFitTex.new(); full.valign = 0.5
		full.set_tex(Assets.tex("assets/ui/jianghu-v4/portraits/bg/%s.webp" % key))
		full.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		st.add_child(full)
		var edge := Control.new(); edge.mouse_filter = Control.MOUSE_FILTER_IGNORE
		edge.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		edge.draw.connect(func():
			var r := full.drawn_rect(); var e := 26.0
			Paint.grad(edge, Rect2(r.position, Vector2(e, r.size.y)), [[0, paper], [1, Color(paper, 0)]])
			Paint.grad(edge, Rect2(Vector2(r.end.x - e, r.position.y), Vector2(e, r.size.y)), [[0, Color(paper, 0)], [1, paper]])
			Paint.grad(edge, Rect2(r.position, Vector2(r.size.x, e)), [[0, paper], [1, Color(paper, 0)]], false)
			Paint.grad(edge, Rect2(Vector2(r.position.x, r.end.y - e), Vector2(r.size.x, e)), [[0, Color(paper, 0)], [1, paper]], false))
		st.add_child(edge)
		return st
	if m.FIG_BG == "ink" and ResourceLoader.exists("res://assets/ui/jianghu-v4/figbg/%s.webp" % key):
		var bg := QJFitTex.new(); bg.cover = true; bg.set_tex(Assets.tex("assets/ui/jianghu-v4/figbg/%s.webp" % key))
		bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		st.add_child(bg)
		var fog := Control.new(); fog.mouse_filter = Control.MOUSE_FILTER_IGNORE
		fog.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		fog.draw.connect(func():
			var r := Rect2(Vector2.ZERO, fog.size); var e := 46.0
			Paint.grad(fog, Rect2(r.position, Vector2(e, r.size.y)), [[0, paper], [1, Color(paper, 0)]])
			Paint.grad(fog, Rect2(Vector2(r.end.x - e, 0), Vector2(e, r.size.y)), [[0, Color(paper, 0)], [1, paper]])
			Paint.grad(fog, Rect2(r.position, Vector2(r.size.x, e)), [[0, paper], [1, Color(paper, 0)]], false)
			Paint.grad(fog, Rect2(Vector2(0, r.end.y - e * 1.4), Vector2(r.size.x, e * 1.4)), [[0, Color(paper, 0)], [1, paper]], false))
		st.add_child(fog)
	art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	st.add_child(art)
	return st

## 方案二大立绘：有带背景版就整张显示（四边淡出到透明），否则抠图立绘；下面毛笔名、题签、三件装备
static func _figure_big(m, v: Dictionary) -> Control:
	var b := K.vbox(4)
	var key := K.portrait_key(v.id)
	var bgp := "assets/ui/jianghu-v4/%s/%s.webp" % [m.FIG_DIR, key]
	var stage: Control
	var plp := "assets/ui/jianghu-v4/%s/%s.webp" % [m.FIG_PLATE, key]
	if not ResourceLoader.exists("res://" + plp): plp = "assets/ui/jianghu-v4/figplate/%s.webp" % key
	if m.FIG_BG == "plate" and ResourceLoader.exists("res://" + plp):
		# 背景板（同菜单底图山水风格，每人一张）四边淡出，原抠图立绘叠在上面，人物不重画也不淡出
		stage = Control.new()
		var fx: Array = m.FIG_FX
		var pl := QJFitTex.new(); pl.cover = true; pl.set_tex(Assets.tex(plp))
		pl.material = K.fade_blur_mat() if fx.has("dof") else K.fade_mat()
		pl.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		stage.add_child(pl)
		var fig := K.portrait_view(v.id)
		fig.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		fig.offset_top = 6; fig.offset_bottom = -10
		if fx.has("halo") or fx.has("shadow"):
			# 身后背光（上半身一团暖白光）、脚下投影（压实地面），按立绘实际绘制范围定位
			var under := Control.new(); under.mouse_filter = Control.MOUSE_FILTER_IGNORE
			under.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
			under.draw.connect(func():
				var r: Rect2 = fig.drawn_rect(); r.position += fig.position
				if r.size.x <= 0: return
				var cx := r.get_center().x
				if fx.has("halo"):
					var c := Vector2(cx, r.position.y + r.size.y * 0.32)
					var rad := r.size.y * 0.42
					for i in 24:
						var t := 1.0 - i / 24.0
						under.draw_circle(c, rad * t, Color(1.0, 0.985, 0.93, 0.05))
				if fx.has("shadow"):
					var fy := r.end.y - r.size.y * 0.012
					for i in 14:
						var t := 1.0 - i / 14.0
						var w := r.size.x * 0.42 * t; var h := r.size.y * 0.028 * t
						under.draw_set_transform(Vector2(cx, fy), 0, Vector2(1, h / w))
						under.draw_circle(Vector2.ZERO, w, Color(0.16, 0.15, 0.13, 0.045))
						under.draw_set_transform(Vector2.ZERO)
			)
			fig.resized.connect(under.queue_redraw)
			stage.add_child(under)
		if fx.has("rim"):
			var rim := K.portrait_view(v.id); rim.material = K.rim_mat()
			rim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
			rim.offset_top = 6; rim.offset_bottom = -10
			stage.add_child(rim)
		stage.add_child(fig)
		if fx.has("breath"):
			# 呼吸：以脚为轴极轻地起伏，4 秒一次
			fig.resized.connect(func(): fig.pivot_offset = Vector2(fig.size.x / 2, fig.size.y))
			fig.tree_entered.connect(func():
				var tw := fig.create_tween().set_loops()
				tw.tween_property(fig, "scale", Vector2(1.0, 1.008), 2.0).set_trans(Tween.TRANS_SINE)
				tw.tween_property(fig, "scale", Vector2.ONE, 2.0).set_trans(Tween.TRANS_SINE), CONNECT_ONE_SHOT)
	elif ResourceLoader.exists("res://" + bgp):
		return _art_stage(m, v, bgp)
	else:
		stage = K.portrait_view(v.id)
	K.expand(stage, 1, true, true)
	b.add_child(stage)
	var nm := K.lab(v.name, 30, K.INK)
	nm.add_theme_font_override("font", Paint.font(UI.brush, 30, 6 / 30.0))
	nm.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.add_child(nm)
	var tag := K.lab("%s · %s" % [v.role if v.role else "江湖同伴", "出战" if m.active().has(v.id) else "候补"], 13, K.line_col().darkened(0.25), false, 3)
	tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.add_child(tag)
	b.add_child(K.spacer(4))
	var slots := K.hbox(6)
	for k in m.SLOT_LABEL:
		var id = v.equipment.get(k)
		var c := K.card("goEquip", {"slot": k, "tip": ("item:" + id) if id else "slot:" + k}, false, 6, K.sb(Color("#f8f3e7d0"), Color(K.line_col(), 0.45), [1, 1, 1, 1], 3), null, null, [4, 3, 4, 3])
		K.expand(c)
		var box := K.content(c)
		box.alignment = BoxContainer.ALIGNMENT_BEGIN
		box.add_child(K.item_icon(id, 36) if id else K.painted("slot", k, 36))
		var t := K.vbox(0); K.expand(t)
		t.add_child(K.lab(m.SLOT_LABEL[k], 11, Color("#6d5a3a")))
		var n := K.lab(str(DB.ITEMS.get(id, {}).get("name", id)) if id else "未装备", 13, K.INK if id else Color("#8b8170"))
		n.clip_text = true
		t.add_child(n)
		box.add_child(t)
		slots.add_child(c)
	b.add_child(slots)
	return b

## 立绘撑满中栏（11-09 第四十七轮 A）：带意象背景的整张图按高度铺满、两侧裁掉、四边淡出；
## 名字竖排（宋体加粗）压在左上，身份竖排在旁（悬停看简介）；装备在左边人物栏
static func _art_stage(m, v: Dictionary, bgp: String) -> Control:
	# B 版：立绘装裱成一幅画——上下锦纹边、中间绢色画心；名字写成竖排题签，下面一方朱红名章。
	# 册页（album）：画框不再另加米白纸边、四周不留空，上下青灰锦边贴着页眉页脚，左右是金色隔水（预览图 B）
	var al: bool = m.album()
	var st := Control.new()
	K.expand(st, 1, true, true)
	st.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var PAD := 0.0 if al else 9.0
	var BAND := 24.0 if al else 22.0
	if not al:
		st.draw.connect(func():
			var r := Rect2(Vector2.ZERO, st.size)
			st.draw_rect(Rect2(r.position + Vector2(3, 4), r.size), Color(0, 0, 0, 0.10))
			st.draw_rect(r, Color("#efe6cf"))
			st.draw_rect(r, Color("#b9a578"), false, 1.0)
			st.draw_rect(r.grow(-5), Color("#cdbb8f"), false, 1.0))
	var inner := Control.new(); inner.mouse_filter = Control.MOUSE_FILTER_IGNORE; inner.clip_contents = true
	inner.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	inner.offset_left = PAD; inner.offset_right = -PAD; inner.offset_top = PAD + BAND; inner.offset_bottom = -PAD - BAND
	st.add_child(inner)
	var full := QJFitTex.new(); full.cover = true; full.set_tex(Assets.tex(bgp))
	full.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	full.modulate = Color(1.0, 0.96, 0.88) if al else Color(1.0, 0.97, 0.9)   # 绢色（册页再暖一点，和纸色一致）
	inner.add_child(full)
	for top in [true, false]:
		var bd: Control
		if al:
			var t := TextureRect.new(); t.texture = K._tex(K.KIT_DIR + ("album_mount_top.png" if top else "album_mount_bot.png"))
			t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; t.stretch_mode = TextureRect.STRETCH_SCALE; t.mouse_filter = Control.MOUSE_FILTER_IGNORE
			bd = t
		else:
			bd = K.brocade(false, BAND)
		bd.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE if top else Control.PRESET_BOTTOM_WIDE)
		bd.offset_left = PAD; bd.offset_right = -PAD
		if top: bd.offset_top = PAD; bd.offset_bottom = PAD + BAND
		else: bd.offset_top = -PAD - BAND; bd.offset_bottom = -PAD
		st.add_child(bd)
	var slip: Control = _slip_album(v) if al else _slip_old(v)
	slip.tooltip_text = _intro(v)
	slip.mouse_filter = Control.MOUSE_FILTER_PASS
	slip.position = Vector2(18, PAD + BAND + (16 if al else 12))
	st.add_child(slip)
	# 朱红名章（出战的人章上多一个“战”字边款不做，出战标记在左边头像列）
	var seal := Control.new(); seal.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var nm := str(v.name)
	seal.custom_minimum_size = Vector2(26, 14 * nm.length() + 10)
	seal.size = seal.custom_minimum_size
	seal.draw.connect(func():
		var r := Rect2(Vector2.ZERO, seal.size)
		seal.draw_rect(r, Color("#b23a2c"))
		seal.draw_rect(r.grow(-2), Color("#f3d9c8"), false, 1.0)
		var y := 6.0 + 12
		for ch in nm:
			var cw := UI.song_bold.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x
			seal.draw_string(UI.song_bold, Vector2((r.size.x - cw) / 2, y), ch, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color("#fbeee2"))
			y += 14)
	slip.resized.connect(func(): seal.position = slip.position + Vector2((slip.size.x - seal.size.x) / 2, slip.size.y + 8))
	st.add_child(seal)
	return st

## 旧题签：米白纸条、细双线框，名字一列、身份等级另起一列
static func _slip_old(v: Dictionary) -> Control:
	var slip := PanelContainer.new()
	slip.add_theme_stylebox_override("panel", K.sb(Color("#f4ecd8ee"), Color("#8a6a3a"), [1, 1, 1, 1], 0, [6, 8, 6, 8]))
	var sv := K.hbox(2)
	var nc := K.vbox(-2)
	for ch in str(v.name):
		var l := K.lab(ch, 24, K.INK); l.add_theme_font_override("font", UI.song_bold); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		nc.add_child(l)
	sv.add_child(nc)
	var tc := K.vbox(-2)
	tc.add_child(K.spacer(6))
	for ch in "%s·%s级" % [v.role if v.role else "江湖同伴", v.level]:
		var l := K.lab(ch, 12, Color("#5d5340")); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		tc.add_child(l)
	sv.add_child(tc)
	slip.add_child(sv)
	return slip

## 册页题签（预览图 B）：一根竖条——名字大字在上，身份等级小字接在下面同一列；框是双线，四角各一个回纹小钩
static func _slip_album(v: Dictionary) -> Control:
	var slip := PanelContainer.new()
	slip.add_theme_stylebox_override("panel", K.sb(Color("#f3e7cfe8"), Color(0, 0, 0, 0), [0, 0, 0, 0], 0, [8, 12, 8, 12]))
	var col := K.vbox(-3)
	for ch in str(v.name):
		var l := K.lab(ch, 28, Color("#231a12")); l.add_theme_font_override("font", UI.song_bold); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		col.add_child(l)
	col.add_child(K.spacer(6))
	for ch in "%s·%s级" % [v.role if v.role else "江湖同伴", v.level]:
		var l := K.lab(ch, 13, Color("#3d3326")); l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		col.add_child(l)
	slip.add_child(col)
	slip.draw.connect(func():
		var r := Rect2(Vector2.ZERO, slip.size)
		var ink := Color("#6b5131")
		slip.draw_rect(r, ink, false, 1.4)
		slip.draw_rect(r.grow(-3.5), Color(ink, 0.7), false, 0.8)
		# 四角回纹小钩：角上一个小方折
		for c in [[r.position, 1, 1], [Vector2(r.end.x, r.position.y), -1, 1], [Vector2(r.position.x, r.end.y), 1, -1], [r.end, -1, -1]]:
			var o: Vector2 = c[0]; var sx: float = c[1]; var sy: float = c[2]
			var k := 7.0
			slip.draw_polyline(PackedVector2Array([o + Vector2(sx * -3, sy * k), o + Vector2(sx * -3, sy * -3), o + Vector2(sx * k, sy * -3)]), ink, 1.4)
			slip.draw_rect(Rect2(o + Vector2(minf(0, sx * 4) , minf(0, sy * 4)), Vector2(4, 4)), ink, false, 1.0))
	return slip

## 人物栏里的三件装备：横排三格（图标在上，部位、名称在下），点了去装备页对应部位
## （11-10 第四十七轮第四次意见：竖排太占高度，属性放不全，改横排）
static func _equip_list(m, v: Dictionary) -> Control:
	var eq := K.hbox(6)
	for k in m.SLOT_LABEL:
		var id = v.equipment.get(k)
		var c := K.card("goEquip", {"slot": k, "tip": ("item:" + id) if id else "slot:" + k}, true, 1, K.sb(Color(0, 0, 0, 0)), K.sb(Color("#efe4c966"), Color(0, 0, 0, 0), [0, 0, 0, 0], 4), null, [2, 2, 2, 2])
		K.expand(c)
		var box := K.content(c)
		box.alignment = BoxContainer.ALIGNMENT_CENTER
		var ic := K.item_icon(id, 28) if id else K.painted("slot", k, 28)
		ic.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		box.add_child(ic)
		var n := K.lab("%s · %s" % [m.SLOT_LABEL[k], str(DB.ITEMS.get(id, {}).get("name", id)) if id else "未装备"], 13, Color("#2f2519") if id else Color("#5d5340"))
		n.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; n.clip_text = true
		box.add_child(n)
		eq.add_child(c)
	return eq

## 册页按钮：米黄实底、褐边、小圆角（预览图 B 的“属性详情”“分配”）
static func _pbtn(b: Button) -> Button:
	for st in ["normal", "hover", "pressed", "focus"]:
		var fill := Color("#efe0c0") if st == "normal" else (Color("#f5e9cf") if st == "hover" else Color("#e6d3ab"))
		b.add_theme_stylebox_override(st, K.sb(fill, Color("#a8875a"), [1, 1, 1, 1], 4, [8, 1, 8, 1]))
	b.add_theme_color_override("font_color", Color("#2f2519")); b.add_theme_color_override("font_hover_color", Color("#231a12"))
	return b

## 人物简介（原“武学与性情”栏底部那段，11-09 挪到名字的悬停里）
static func _intro(v: Dictionary) -> String:
	var intro := str(v.role if v.role else "江湖同伴") + "。"
	if v.id == "hero":
		var sd := Flow.get_node_or_null("Side")
		var ml: Array = sd.milestone_list(G.S) if sd and sd.has_method("milestone_list") else []
		if ml.size(): intro = str(ml[ml.size() - 1].d)
	elif QJModel.mn_def(v.id).get("desc"): intro = str(QJModel.mn_def(v.id).desc)
	return intro

## 方案二：性情面板底部的人物题词（台词＋性情标签），数据在 data/menu/figure_lines.json
static var _lines := {}
static func _signature(v: Dictionary) -> Control:
	if _lines.is_empty(): _lines = QJModel._json("res://data/menu/figure_lines.json")
	var d: Dictionary = _lines.get(K.portrait_key(v.id), _lines.get(v.id, {}))
	if d.is_empty(): return null
	var b := K.vbox(6)
	b.add_child(K.expand(K.spacer(), 1, false, true))
	if d.get("line"):
		var q := K.para("「%s」" % d.line, 17, K.INK.lerp(K.line_col(), 0.25), 1.7, 4)
		q.add_theme_font_override("font", UI.kai_bold)
		b.add_child(q)
	var row := K.hbox(6); row.alignment = BoxContainer.ALIGNMENT_END
	var line := K.rule(Color(K.line_col(), 0.6)); line.custom_minimum_size.x = 40; line.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(line)
	row.add_child(K.lab(str(d.tag), 13, K.line_col().darkened(0.2), false, 2))
	b.add_child(row)
	return b

## 面板三「武学与状态」（11-09 第四十六、四十七轮）：武学借逸剑风云决——内功、外功、轻功三行图标格，
## 格子底色按品级；点一门功法，下面显示它的招式；悬停招式出说明卡。下面「获得状态」照大侠立志传：增益青绿↑、减益紫红↓词签，悬停看效果和持续
const GRADE_BG := {"丁": Color("#ebe6da"), "丙": Color("#dbe8e5"), "乙": Color("#dde2ea"), "甲": Color("#efe0bc"), "绝": Color("#f1d6cc")}
const KIND_NAME := {"剑": "剑法", "拳": "拳掌", "拳掌": "拳掌", "掌": "拳掌", "棍": "棍法", "刀": "刀法", "暗器": "暗器", "针": "暗器", "身": "身法", "内功": "内功"}
const GRADE_RANK := {"丁": 1, "丙": 2, "乙": 3, "甲": 4, "绝": 5}

static func kind_name(k: String) -> String:
	return KIND_NAME.get(k, (k + "法") if k != "" and k.length() == 1 else k)

## 招式所属功法（CultivationLibrary.arts 里 moves 含此招式的那门）；没有的退回 SKILLS.artName
static var _arts := {}
static func _art_index() -> Dictionary:
	if _arts.is_empty():
		var lib = DB.g("CultivationLibrary")
		if lib is Dictionary:
			for a in lib.get("arts", []):
				for mv in a.get("moves", []): _arts[str(mv.get("id"))] = a
	return _arts

static func art_of(move_id: String):
	return _art_index().get(move_id)

## 队伍页上的“功法”：按所属功法把已学招式归组；key 为功法 id（没有登记的用招式 id）
static func arts_of(v: Dictionary) -> Array:
	var out := []
	var at := {}
	for k in v.skills:
		var a = art_of(k.id)
		var key: String = str(a.id) if a else ("solo_" + str(k.id))
		if not at.has(key):
			var nm: String = str(a.name) if a else (str(DB.SKILLS.get(k.id, {}).get("artName", "")) if DB.SKILLS.get(k.id, {}).get("artName") else ("护路棍法" if k.id == "qh_hulu_staff" else str(k.name)))
			at[key] = {"id": key, "name": nm, "grade": str(a.get("grade", "")) if a else str(k.get("grade", "")), "path": str(a.get("path", "")) if a else str(k.get("kind", "")),
				"mastery": a.get("mastery") if a else null, "moves": [], "level": 0, "light": PAGES_SKILL.is_light(k.id)}
			out.append(at[key])
		at[key].moves.append(k)
		at[key].level = maxi(int(at[key].level), int(k.get("level", 1)))
		if GRADE_RANK.get(str(k.get("grade", "")), 0) > GRADE_RANK.get(at[key].grade, 0): at[key].grade = str(k.grade)
	return out

static func art_by_id(id: String):
	var v = Menu.actor()
	if v == null: return null
	for a in arts_of(v):
		if a.id == id: return a
	return null

static func _martial(m, v: Dictionary) -> Control:
	var b := K.vbox(4)
	var inner: Dictionary = v.inner
	var itiles := []
	if inner.get("open"):
		for id in inner.get("lv", {}):
			if int(inner.lv[id]) > 0 and inner.get("known", []).has(id):
				var xf: Dictionary = QJModel.XINFA().get(id, {})
				var seal := "主" if inner.get("main") == id else ("辅" if inner.get("subs", []).has(id) else "")
				itiles.append(_tile("goInner", {"id": id, "tip": "inner:" + id}, K.xinfa_icon(id, 40), str(xf.get("name", id)), str(xf.get("grade", "")), false, seal))
	b.add_child(_mrow("内功", itiles, "暂未开放" if not inner.get("open") else "尚未修习内功"))
	var arts := arts_of(v)
	var sel = m.s.get("partyArt")
	var found = null
	for a in arts:
		if a.id == sel: found = a
	if found == null:
		for a in arts:
			if not a.light and found == null: found = a
		if found == null and arts.size(): found = arts[0]
	for light in [false, true]:
		var tiles := []
		for a in arts:
			if a.light != light: continue
			tiles.append(_tile("partyArt", {"id": a.id, "tip": "art:" + a.id}, K.skill_icon(a.moves[0].id, 40), a.name, a.grade, found != null and a.id == found.id))
		b.add_child(_mrow("轻功" if light else "外功", tiles, "尚未习得轻功" if light else "尚未习得外功"))
	# 11-10 第四十七轮第三次意见：固定布局——武学三行、招式一段、获得状态一块，各占固定高度，不因为没有状态就缩成一行小字
	b.add_child(K.spacer(4))
	b.add_child(K.wash_head(("%s · 招式" % found.name) if found else "招式"))
	var mr := K.hbox(6); mr.custom_minimum_size.y = 74
	if found:
		for k in found.moves:
			mr.add_child(_tile("goSkill", {"id": k.id, "tip": "skill:" + k.id}, K.skill_icon(k.id, 40), str(k.name), str(k.get("grade", "")), false))
	else:
		var e := K.lab("点上面的外功、轻功，这里列出它的招式", 12, Color("#8b8170")); e.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		mr.add_child(e)
	b.add_child(mr)
	if m.album():
		# 册页（预览图 B）：获得状态紧跟招式，框往下撑到栏底
		var sb := _states_block(v); K.expand(sb, 1, false, true); b.add_child(sb)
		return b
	b.add_child(K.expand(K.spacer(), 1, false, true))
	b.add_child(_states_block(v))
	return b

## 一行：左边竖挂的小卷轴写类别名，右边一排圆形武学图标；行高固定
static func _mrow(label: String, tiles: Array, empty: String) -> Control:
	var r := K.hbox(10)
	r.custom_minimum_size.y = 70
	var tag := K.tag_v(label, 14); tag.size_flags_vertical = Control.SIZE_SHRINK_CENTER   # B 版：圆角木签
	r.add_child(tag)
	if tiles.is_empty():
		var e := K.lab(empty, 13, Color("#5d5340")); e.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		r.add_child(e)
	for t in tiles: r.add_child(t)
	var w := K.vbox(0)
	w.add_child(r)
	w.add_child(K.rule(Color(K.FRAME_LINE, 0.22)))
	return w

## 武学图标：圆形（按品级的淡底色），外面一圈墨笔圈；品级是右下角的小朱印，主／辅是左上角的小印；选中时墨圈换朱红、下面一个小三角
## （11-10 第四十七轮第三次意见：方格太“四四方方”，改成有侠气的圆印式）
static func _tile(action: String, data: Dictionary, icon: Control, name: String, grade: String, on: bool, seal := "") -> Control:
	var c := K.card(action, data, true, 2, K.sb(Color(0, 0, 0, 0)), K.sb(Color("#efe4c955"), Color(0, 0, 0, 0), [0, 0, 0, 0], 26), null, [2, 2, 2, 2])
	c.custom_minimum_size.x = 72
	var box := K.content(c)
	var D := 52.0
	var holder := Control.new(); holder.custom_minimum_size = Vector2(D, D); holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	holder.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var bg: Color = GRADE_BG.get(grade, Color("#ebe6da"))
	var mask := Control.new(); mask.size = Vector2(D, D); mask.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mask.clip_children = CanvasItem.CLIP_CHILDREN_AND_DRAW
	mask.draw.connect(func(): mask.draw_circle(Vector2(D, D) / 2, D / 2 - 3, bg))
	icon.position = Vector2(6, 6); icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mask.add_child(icon)
	holder.add_child(mask)
	var ring := Control.new(); ring.size = Vector2(D, D); ring.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ring.draw.connect(func():
		var ctr := Vector2(D, D) / 2
		var ink := Color("#a8352a") if on else Color("#3b2f22", 0.75)
		# 墨笔圈：一粗一细两道、起笔落笔错开，像毛笔一笔画成
		ring.draw_arc(ctr, D / 2 - 2.5, -2.6, 3.4, 40, ink, 3.0 if on else 2.2, true)
		ring.draw_arc(ctr + Vector2(0.6, -0.4), D / 2 - 1.5, 3.2, 5.6, 16, Color(ink, ink.a * 0.55), 1.2, true)
		if grade != "":
			var gc := Vector2(D - 8, D - 8)
			ring.draw_circle(gc, 8.5, Color("#a8352a") if GRADE_RANK.get(grade, 0) >= 2 else Color("#7a5a3a"))
			var gw := UI.song_bold.get_string_size(grade, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
			ring.draw_string(UI.song_bold, Vector2(gc.x - gw / 2, gc.y + 4), grade, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#fbf0e2"))
		if seal != "":
			var sc := Vector2(8, 8)
			ring.draw_circle(sc, 8.5, Color("#b0443a") if seal == "主" else Color("#8a7a5a"))
			var sw := UI.song_bold.get_string_size(seal, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
			ring.draw_string(UI.song_bold, Vector2(sc.x - sw / 2, sc.y + 4), seal, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#fbf0e2")))
	holder.add_child(ring)
	box.add_child(holder)
	var n := K.lab(name, 13, Color("#a8352a") if on else Color("#231a12"), on); n.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; n.clip_text = true; n.custom_minimum_size.x = 68
	box.add_child(n)
	if on:
		var tri := Control.new(); tri.custom_minimum_size = Vector2(0, 6); tri.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tri.draw.connect(func():
			var cx := tri.size.x / 2
			tri.draw_colored_polygon(PackedVector2Array([Vector2(cx - 5, 0), Vector2(cx + 5, 0), Vector2(cx, 6)]), Color("#a8352a")))
		box.add_child(tri)
	return c

## 获得状态：人物状态（疲惫、轻伤、休整充足、旧伤……）＋主角在培养模式里的心境（高兴时修炼收获多、低落时少）
static func states(v: Dictionary) -> Array:
	var out := []
	var defs: Dictionary = DB.g("CharacterCondition").get("definitions", {}) if DB.g("CharacterCondition") else {}
	for c in v.get("conditions", []):
		var d: Dictionary = defs.get(c.get("id", ""), {})
		if d.is_empty(): continue
		var name := str(d.get("name", c.id))
		for st in d.get("stages", []):
			if st.get("mul", {}) == c.get("mul"): name = str(st.get("name", name))
		var parts := []
		for k in c.get("mul", {}): parts.append("%s ×%s" % [COND_LABEL.get(k, k), str(snappedf(float(c.mul[k]), 0.01))])
		out.append({"id": str(c.id), "name": name, "good": not d.get("negative", false), "effect": "、".join(parts), "source": str(d.get("source", "")), "recovery": str(d.get("recovery", ""))})
	if v.id == "hero" and G.S is Dictionary and G.S.get("cultivation") is Dictionary and G.S.cultivation.has("mood"):
		var mood := int(G.S.cultivation.mood)
		var mult := 1.15 if mood >= 75 else (1.0 if mood >= 45 else (0.9 if mood >= 20 else 0.75))
		if mult != 1.0:
			var mname := "心境"
			var ms = DB.g("CultivationBalance")
			if ms is Dictionary:
				for x in ms.get("moods", []):
					if mood >= int(x.get("min", 0)): mname = "心境" + str(x.get("name", "")); break
			out.append({"id": "mood", "name": mname, "good": mult > 1.0, "effect": "修炼收获 ×%s" % str(mult), "source": "培养模式里的心境", "recovery": "心境变了就随之改变"})
	return out

static func state_by_id(v, id: String):
	if v == null: return null
	for x in states(v):
		if x.id == id: return x
	return null

static func _states_block(v: Dictionary) -> Control:
	# 固定高度的一块：卷轴小标题＋淡纸底框，没有状态也占满这块，写明这里会出现什么
	var b := K.vbox(6)
	b.add_child(K.wash_head("获得状态"))
	var area := K.panel(Color("#ebdcc0b0"), Color("#b4925f", 0.55), [1, 1, 1, 1], [10, 8, 10, 8])
	area.custom_minimum_size.y = 92
	# B 版：框底一抹淡墨远山（生图素材）
	var ls := K._tex(K.KIT_DIR + "landscape.png")
	if ls: area.draw.connect(func():
		var w := area.size.x - 4; var h := w * ls.get_height() / ls.get_width()
		area.draw_texture_rect(ls, Rect2(2, area.size.y - h - 2, w, h), false, Color(1, 1, 1, 0.55)))
	K.expand(area, 1, false, true)
	b.add_child(area)
	var list := states(v)
	if list.is_empty():
		var e := K.vbox(4); e.alignment = BoxContainer.ALIGNMENT_CENTER
		# 11-10 B 版“继续改”：照预览图只写“暂无状态”，说明挪到悬停
		var t1 := K.lab("暂无状态", 16, Color("#5d4a30"), false, 4); t1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		e.add_child(t1)
		area.tooltip_text = "疲惫、轻伤、休整充足、心境好坏，都会记在这里"
		area.add_child(e)
		return b
	var f := HFlowContainer.new()
	f.add_theme_constant_override("h_separation", 6); f.add_theme_constant_override("v_separation", 6)
	for x in list:
		var col := Color("#3f7d5a") if x.good else Color("#7d3f63")
		var c := K.card("stateTag", {"id": x.id, "tip": "cond:" + x.id}, false, 0,
			K.sb(Color("#e3f0e6") if x.good else Color("#f0e1ea"), Color(col, 0.7), [1, 1, 1, 1], 4), K.sb(Color("#d6eadb") if x.good else Color("#ead2df"), col, [1, 1, 1, 1], 4), null, [8, 2, 8, 2])
		K.content(c).add_child(K.lab(("↑ " if x.good else "↓ ") + str(x.name), 12, col, true))
		f.add_child(c)
	area.add_child(f)
	return b

## 状态异常 <details>：摘要「图标 名」，展开来源 / 倍率 / 恢复方式
static func _condition(c: Dictionary) -> Control:
	var box := K.vbox(4)
	var head := Button.new()
	head.text = "▸ %s %s" % [c.get("icon", ""), c.get("name", "")]
	K.style_btn(head, "flat", [4, 4, 4, 4])
	head.add_theme_font_override("font", UI.song); head.add_theme_font_size_override("font_size", 14)
	head.alignment = HORIZONTAL_ALIGNMENT_LEFT
	box.add_child(head)
	var body := K.vbox(4); body.visible = false
	var parts := []
	for k in c.get("mul", {}): parts.append("%s %d%%" % [COND_LABEL.get(k, k), roundi(float(c.mul[k]) * 100)])
	for t in [str(c.get("source", "")), " · ".join(parts), str(c.get("recovery", ""))]:
		body.add_child(K.para(t, 13, Color("#5b4a33"), 1.6))
	box.add_child(body)
	head.pressed.connect(func():
		body.visible = not body.visible
		head.text = ("▾ " if body.visible else "▸ ") + "%s %s" % [c.get("icon", ""), c.get("name", "")])
	box.add_child(K.spacer(6))
	return box

# ───────── 底栏 .qj-party-bottom：出战编成托盘 ─────────
static func _tray(m) -> Control:
	# 实测：底 rgba(250,247,238,.93)；「出战编成」12px x52；头像位 41（步距 50）；「出战 1 / 4」13px；按钮 12px 高 36
	var row := K.hbox(14)
	var p := K.titled("", row, [22, 10, 18, 10])
	p.custom_minimum_size.y = 76
	var l := K.lab("出战编成", 12, Color("#69512e"), false, 3); l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(l)
	var ids: Array = m.active()
	var slots := K.hbox(9)
	for i in 4:
		var a = m.actor(ids[i]) if i < ids.size() else null
		slots.add_child(_mini(m, a, i))
	row.add_child(slots)
	var n := K.lab("出战 %d / 4" % ids.size(), 13, Color("#78623c")); n.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(n)
	var fb := K.btn("调整编成", "formation", {}, "", 12, [12, 5, 12, 5], 36); fb.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(fb)
	row.add_child(K.expand(K.spacer()))
	var pet := K.card("pet", {}, false, 6, K.sb(Color("#f7f2dfb8"), Color("#8d794f80"), [1, 1, 1, 1], 3), null, null, [12, 2, 14, 2])
	pet.custom_minimum_size = Vector2(115, 36); pet.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	K.content(pet).add_child(K.painted("nav", "pet", 32))
	K.content(pet).add_child(K.lab("同行宠物", 12))
	row.add_child(pet)
	return p

## .qj-mini：54×54 圆位，有人显示头像 + 下方名字；空位「＋」打开编成
static func _mini(m, a, _i: int) -> Control:
	var sz := 41.0
	var on: bool = a != null and a.id == m.s.actor
	var b := K.card("actor" if a else "formation", {"id": a.id} if a else {}, true, 0, null, K.sb(Color(0, 0, 0, 0)))
	b.custom_minimum_size = Vector2(sz, sz)
	b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	if a:
		K.content(b).add_child(K.face(a.id, sz - 4, Color("#ad8c4e"), Color("#fbefb9") if on else Color("#f1e1b9")))
		var nm := K.lab(a.name, 9, K.INK)
		nm.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		nm.top_level = false
		b.add_child(nm)
		nm.position = Vector2(-10, sz - 2); nm.size = Vector2(sz + 20, 14)
		if on:
			b.under.append(func(ci: CanvasItem, r: Rect2):
				for k in 6: ci.draw_circle(r.get_center(), r.size.x / 2 + 3 + k * 1.6, Color(161 / 255.0, 129 / 255.0, 59 / 255.0, 0.07)))
	else:
		b.under.append(func(ci: CanvasItem, r: Rect2):
			var c := r.get_center()
			ci.draw_circle(c, sz / 2 + 2, Color("#f1e1b9"))
			ci.draw_circle(c, sz / 2, Color("#ad8c4e"))
			ci.draw_circle(c, sz / 2 - 2, Color("#ded0ad")))
		var plus := K.lab("＋", 28, Color("#9b926e")); plus.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		K.content(b).add_child(plus)
	return b

## 立绘按钮的像素命中（原版 portraitHit）：键盘触发 last_pos 为 (-1,-1) 时一律放行
static func _hit(node: Control) -> bool:
	if not node.has_meta("cast") or not (node is QJCard): return true
	var p: Vector2 = node.last_pos
	if p.x < 0: return true
	var art: QJFitTex = node.get_meta("art")
	if p.y > node.size.y - 34: return true
	return art.hit(p - art.position)

# ───────── 点击 ─────────
static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	match act:
		"actor":
			if not _hit(node): return true
			m.guard(func(): m.s.actor = id; m.s.selected = null; m.s.skillId = null; m.s.bp = 0; m.s.detail = null; m.draw())
		"attributes": attributes(m)
		"goEquip":
			var slot: String = node.get_meta("slot")
			m.go("equip")
			if m.s.page == "equip":
				m.s.slot = slot; m.draw()
		"goSkill":
			m.s.skillTab = "all"; m.s.skillSearch = ""; m.s.skillId = id; m.s.skillKind = "active"; m.go("skill")
		"goInner":
			m.s.skillTab = "inner"; m.s.skillSearch = ""; m.s.skillId = id; m.s.skillKind = "inner"; m.go("skill")
		"partyArt":
			m.s.partyArt = id; m.draw()
		"stateTag": pass   # 只看悬停说明
		"statDetail":
			m.detail(m.STAT_LABEL[id], func(mm):
				var b := K.vbox(10)
				b.add_child(K.lab("%s %d" % [mm.STAT_LABEL[id], mm.actor().stats[id]], 23))
				b.add_child(K.para(mm.STAT_HELP[id]))
				return b)
		"formation":
			m.s.draft = m.active().duplicate(); m.s.candidate = null; formation_render(m)
		"candidate":
			var v = m.actor(id)
			if v.available == false:
				m.notify(v.lockReason if v.lockReason else "该人物不在场"); return true
			m.s.candidate = id; formation_render(m)
		"formationSlot": _formation_slot(m, int(node.get_meta("index")))
		"formationRemove":
			var i := int(node.get_meta("index"))
			var a = m.actor(m.s.draft[i])
			if a and a.locked:
				m.notify("剧情人物不能换下"); return true
			m.s.draft.remove_at(i); formation_render(m)
		"formationApply": m.commit("applyFormation", {"active": m.s.draft}, func(): m.s.draft = null)
		"guardContinue":
			m.s.erase("guard")
			if m.s.draft != null: formation_render(m)
			else: points_render(m)
		"allocate":
			m.s.points = {}; points_render(m)
		"pointPlus":
			var nxt: Dictionary = m.s.points.duplicate()
			nxt[id] = int(nxt.get(id, 0)) + 1
			var t = QJModel.preview_stats(QJModel.current(), m.s.actor, nxt)
			if t == null or not t.allowed:
				m.notify(t.reason if t else "当前不可操作"); return true
			m.s.points = nxt; points_render(m)
		"pointMinus":
			m.s.points[id] = maxi(0, int(m.s.points.get(id, 0)) - 1); points_render(m)
		"pointReset":
			m.s.points = {}; points_render(m)
		"pointApply": m.commit("allocateStats", {"stats": m.s.points}, func(): m.s.points = null)
		"insight":
			m.s.insightDraft = {"actorId": m.s.actor, "target": "level", "amount": 100}; insight_panel(m)
		"insightPreset":
			m.s.insightDraft.amount = int(id); insight_panel(m)
		"insightApply":
			var d: Dictionary = m.s.insightDraft.duplicate()
			var q := QJModel.insight_quote(d.actorId, d.target, d.amount)
			if not q.allowed:
				m.notify(q.reason); return true
			m.confirm("为%s投入%d点历练，培养「%s」（%s→%s），剩余%d点？" % [q.name, q.cost, q.label, q.before, q.after, q.balanceAfter],
				func(): m.commit("spendInsight", {"actorId": d.actorId, "target": d.target, "amount": d.amount, "expectedCost": q.cost}, func(): m.s.insightDraft = null))
		"pet": pet_detail(m)
		"petFeed": m.confirm("消耗 1 个馒头喂食同行宠物？", func(): m.commit("feedPet", {"itemId": "bun"}))
		"petEquip": m.commit("equipPet", {"itemId": "collar"})
		"petUnequip": m.commit("equipPet", {"itemId": null})
		_: return false
	return true

## formationSlot：候选编入指定位（锁定规则、互换、压缩空位）
static func _formation_slot(m, i: int) -> void:
	var cand = m.s.candidate
	var draft: Array = m.s.draft
	if cand != null and m.actor(cand) and m.actor(cand).locked and draft.find(cand) != i:
		m.notify("剧情锁定人物必须保留当前位置"); return
	if cand == null:
		m.notify("先选择要编入的人物"); return
	var old = draft[i] if i < draft.size() else null
	if old != null and m.actor(old) and m.actor(old).locked and old != cand:
		var oa = m.actor(old)
		m.notify(oa.lockReason if oa.lockReason else "剧情需要此人同行"); return
	var prev := draft.find(cand)
	while draft.size() <= i: draft.append(null)
	if prev >= 0: draft[prev] = old
	draft[i] = cand
	m.s.draft = draft.filter(func(x): return x != null)
	m.s.candidate = null
	formation_render(m)

# ───────── 抽屉：人物详情 attributes() ─────────
static func attributes(m) -> void:
	m.detail("人物详情", func(mm):
		var v = mm.actor()
		var b := K.vbox(12)
		b.add_child(K.lab(v.name, 23))
		if v.get("relationship"):
			b.add_child(K.lab("♡ %s %s/100  当前阶段上限 %s" % [v.relationship.stage, v.relationship.score, v.relationship.get("cap", "")], 15))
		var rows := []
		for k in DERIVED_LABEL:
			rows.append([DERIVED_LABEL[k], str(v.derived.get(k, 0)) + ("%" if k in ["crit", "dodge", "block"] else "")])
		b.add_child(K.data_grid(rows))
		var groups := [["兵刃造诣", v.zy, {}], ["技艺", v.ji, {"shi": "武学常识", "yi": "医术", "du": "毒术"}], ["品德", v.virtue, {"yi": "义气", "ren": "仁德", "xin": "信用", "yong": "勇气"}]]
		for g in groups:
			b.add_child(K.lab(g[0], 17))
			var r2 := []
			for k in g[1]: r2.append([g[2].get(k, k), str(g[1][k])])
			b.add_child(K.data_grid(r2))
		return b)

# ───────── 抽屉：调整编成 formationRender() ─────────
static func formation_render(m) -> void:
	m.detail("调整编成", func(mm):
		var b := K.vbox(14)
		b.add_child(K.para("选择候补，再点要替换的位置；应用后才改变出战名单。"))
		var g := K.grid(4, 8, 8)
		for i in 4:
			var id = mm.s.draft[i] if i < mm.s.draft.size() else null
			var v = mm.actor(id) if id != null else null
			var cell := K.vbox(4)
			var c := K.card("formationSlot", {"index": i}, true, 4, K.sb(Color("#f7f2dfb8"), Color("#8d794f80"), [1, 1, 1, 1], 3), null, null, [6, 10, 6, 10])
			c.custom_minimum_size = Vector2(110, 112)
			var box := K.content(c)
			if v:
				box.add_child(K.face(v.id, 50))
				var n := K.lab(v.name, 14, K.INK, true); n.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; box.add_child(n)
				var t := K.lab("剧情锁定" if v.locked else "第%d位" % (i + 1), 11, Color("#6d6251")); t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; box.add_child(t)
			else:
				var e := K.lab("＋ 空位", 14, Color("#6d6251")); e.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; box.add_child(e)
			cell.add_child(c)
			if v and not v.locked: cell.add_child(K.btn("换下", "formationRemove", {"index": i}, "", 13, [8, 3, 8, 3], 32))
			g.add_child(cell)
		b.add_child(g)
		b.add_child(K.lab("已结伴人物", 17))
		var f := HFlowContainer.new()
		f.add_theme_constant_override("h_separation", 8); f.add_theme_constant_override("v_separation", 8)
		for r in mm.roster():
			var v = mm.actor(r.id)
			if v == null: continue
			var on: bool = mm.s.candidate == v.id
			var c := K.card("candidate", {"id": v.id}, true, 4, K.sb(Color("#f7f2dfb8"), Color("#8d794f80"), [1, 1, 1, 1], 3),
				null, K.sb(Color("#ded0a6"), Color("#a88a4e"), [1, 1, 1, 1], 3), [12, 12, 12, 12])
			c.on = on
			c.custom_minimum_size.x = 90
			var box := K.content(c)
			box.add_child(K.face(v.id, 54))
			var n := K.lab(v.name, 14); n.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; box.add_child(n)
			var t := K.lab("已编入" if mm.s.draft.has(v.id) else ("不在场" if v.available == false else "可编入"), 11, Color("#6d6251"))
			t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; box.add_child(t)
			f.add_child(c)
		b.add_child(f)
		return b, [["应用编成", "formationApply", {}, "primary"]])

# ───────── 抽屉：分配根基 pointsRender() ─────────
static func points_render(m) -> void:
	m.detail("分配根基", func(mm):
		var v = mm.actor()
		var pv = QJModel.preview_stats(QJModel.current(), mm.s.actor, mm.s.points)
		var used := 0
		for x in mm.s.points.values(): used += int(x)
		var b := K.vbox(8)
		b.add_child(K.para("剩余 %d 点" % (v.points - used)))
		for k in mm.STAT_LABEL:
			var r := K.hbox(10)
			r.add_child(K.expand(K.lab(mm.STAT_LABEL[k], 16)))
			r.add_child(K.btn("－", "pointMinus", {"id": k}, "", 16, [12, 2, 12, 2], 36))
			var n := K.lab(str(int(v.stats[k]) + int(mm.s.points.get(k, 0))), 16, K.INK, true)
			n.custom_minimum_size.x = 30; n.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			r.add_child(n)
			r.add_child(K.btn("＋", "pointPlus", {"id": k}, "", 16, [12, 2, 12, 2], 36))
			var wrap := K.margin(0, 10, 0, 10); wrap.add_child(r)
			b.add_child(wrap)
		var rows := []
		for p in [["atk", "攻击"], ["def", "防御"], ["mhp", "气血上限"], ["mmp", "内力上限"]]:
			rows.append([p[1], "%s → %s" % [pv.before.get(p[0], 0), pv.after.get(p[0], 0)] if pv else "-"])
		b.add_child(K.data_grid(rows))
		return b, [["重置", "pointReset", {}, ""], ["确认分配", "pointApply", {}, "primary"]])

# ───────── 抽屉：江湖历练 insightPanel() / insightPreview() ─────────
static func insight_panel(m) -> void:
	var pool := QJModel.insight()
	if m.s.insightDraft == null: m.s.insightDraft = {"actorId": m.s.actor, "target": "level", "amount": 100}
	var d: Dictionary = m.s.insightDraft
	var sel = null
	for a in pool.actors:
		if a.id == d.actorId: sel = a
	if sel == null and pool.actors.size(): sel = pool.actors[0]
	if sel == null: return
	d.actorId = sel.id
	var keys: Array = sel.options.map(func(o): return o.key)
	if not keys.has(d.target): d.target = keys[0] if keys.size() else ""
	m.detail("江湖历练", func(mm):
		var b := K.vbox(12)
		b.add_child(K.lab("全队共享 · 可用 %d 点" % pool.balance, 12, Color("#7d6440"), false, 1.5))
		b.add_child(K.para("历练来自已完成的差事、剧情和月度修习。1点兑换1修为；5点兑换1功法熟练，不叠战斗经验加成。"))
		var form := K.grid(2, 12, 10)
		var who := OptionButton.new()
		for i in pool.actors.size():
			who.add_item(pool.actors[i].name, i)
			if pool.actors[i].id == d.actorId: who.select(i)
		who.item_selected.connect(func(i): d.actorId = pool.actors[i].id; d.target = "level"; insight_panel(mm))
		form.add_child(_field("培养人物", who))
		var what := OptionButton.new()
		for i in sel.options.size():
			what.add_item(sel.options[i].label, i)
			if sel.options[i].key == d.target: what.select(i)
		what.item_selected.connect(func(i): d.target = sel.options[i].key; insight_panel(mm))
		form.add_child(_field("培养内容", what))
		var amt := SpinBox.new()
		amt.min_value = 1; amt.max_value = 1000000; amt.step = 1; amt.value = float(d.amount)
		amt.value_changed.connect(func(x): d.amount = int(x); insight_panel(mm))
		form.add_child(_field("计划投入", amt))
		b.add_child(form)
		var pre := K.hbox(8)
		for n in [100, 500, 1000]: pre.add_child(K.btn(str(n), "insightPreset", {"id": n}, "cat", 14, [12, 4, 12, 4], 34))
		b.add_child(pre)
		b.add_child(_preview(d))
		var led := K.vbox(4)
		var head := Button.new()
		head.text = "▸ 收支记录 · 累计获得 %d / 使用 %d" % [pool.earned, pool.spent]
		K.style_btn(head, "flat", [4, 4, 4, 4]); head.alignment = HORIZONTAL_ALIGNMENT_LEFT
		head.add_theme_font_override("font", UI.song); head.add_theme_font_size_override("font_size", 14)
		led.add_child(head)
		var body := K.vbox(4); body.visible = false
		var list: Array = pool.ledger.slice(-10); list.reverse()
		for x in list: body.add_child(K.lab("%s%s · %s" % ["+" if x.kind == "gain" else "−", x.amount, x.get("name") if x.get("name") else "修习"], 14))
		if list.is_empty(): body.add_child(K.para("完成栖河差事、救援或每月修习后会记录在这里。", 14))
		led.add_child(body)
		head.pressed.connect(func(): body.visible = not body.visible; head.text = ("▾" if body.visible else "▸") + head.text.substr(1))
		b.add_child(led)
		return b, [["确认投入", "insightApply", {}, "primary"]])

static func _field(label: String, c: Control) -> Control:
	var v := K.vbox(4)
	v.add_child(K.lab(label, 13, Color("#6d6251")))
	c.add_theme_font_override("font", UI.song); c.add_theme_font_size_override("font_size", 15)
	c.custom_minimum_size = Vector2(200, 36)
	v.add_child(c)
	return v

static func _preview(d: Dictionary) -> Control:
	var q := QJModel.insight_quote(d.actorId, d.target, d.amount)
	if not q.allowed: return K.para(str(q.reason), 14, Color("#8a4a2c"))
	var lv: bool = q.kind == "level"
	var rows := [["实际消耗", "%d 点" % q.cost], ["剩余历练", "%d 点" % q.balanceAfter], [q.label, "%s → %s%s" % [q.before, q.after, "级" if lv else "重"]],
		["获得" + ("修为" if lv else "熟练"), "+" + str(roundf(float(q.gain) * 10) / 10)]]
	if lv: rows.append(["投入后修为", "已满级" if int(q.after) == 100 else "%s / %d" % [q.experienceAfter, int(q.after) * 100]])
	for p in [["atk", "攻击"], ["def", "防御"], ["mhp", "气血上限"], ["mmp", "内力上限"]]:
		rows.append([p[1], "%s → %s" % [q.beforeStats.get(p[0], 0), q.afterStats.get(p[0], 0)]])
	var b := K.vbox(8)
	b.add_child(K.data_grid(rows))
	b.add_child(K.para("按实际可吸收数量扣除；不自动补血、疗伤或传授新功法。", 14))
	return b

# ───────── 抽屉：同行宠物 petDetail() ─────────
static func pet_detail(m) -> void:
	var p = QJModel.pet_view(QJModel.current())
	if p == null:
		m.detail("同行宠物", func(_mm):
			var b := K.vbox(10); b.alignment = BoxContainer.ALIGNMENT_CENTER
			b.add_child(K.painted("nav", "pet", 96))
			var t := K.lab("尚未结伴", 23); t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; b.add_child(t)
			var d := K.para("宠物跟在队伍末尾，自主行动。"); d.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; b.add_child(d)
			return b)
		return
	m.detail(p.name if p.name else "同行宠物", func(_mm):
		var b := K.vbox(10)
		var art := QJFitTex.new()
		art.custom_minimum_size = Vector2(0, 260)
		art.set_tex(Assets.tex(p.portrait))
		b.add_child(art)
		b.add_child(K.lab(p.name, 23))
		b.add_child(K.vitals(p))
		b.add_child(K.para("自动参战 · 不占人类出战位"))
		b.add_child(K.para(p.description if p.description else "跟在队尾，自主行动。"))
		var acc = p.equipment.get("acc")
		b.add_child(K.para("佩饰：" + (str(DB.ITEMS.get(acc, {}).get("name", acc)) if acc else "未装备")))
		return b, [["喂食馒头", "petFeed", {}, ""], ["戴上项圈", "petEquip", {}, ""], ["卸下项圈", "petUnequip", {}, ""]])
