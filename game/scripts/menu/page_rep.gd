extends RefCounted
## 「关系」页：门派关系与声誉。对应原版 js/qihe-jianghu-rep-ui.js（window.QiheJianghuRepUI，第三版，2026-10-27 整改）
## 与 js/qihe-jianghu-rep-ui.css。数值规则读人物交互子任务的 scripts/npc/rep.gd（Npc.rep，即原版 window.QiheJianghu），
## 本页只读，不改存档。实测排版：docs/specs/layout/menu-rep.json（1280×720，页面区 y 83～690）。
## 选中的势力记在 m.s.repSel（原版 s.repSel）；页内状态（折叠的门类、近事展开）记在 m.s.repUi（原版闭包 ui）。

const K := preload("res://scripts/menu/kit.gd")
const Quest := preload("res://scripts/menu/quest.gd")

## :root --qjr-*
const TC := {"chou": Color("#2f2925"), "yan": Color("#4c3f36"), "leng": Color("#6d5f51"), "chu": Color("#857865"),
	"shu": Color("#9a6a3c"), "xin": Color("#a24a30"), "tuo": Color("#a8352a")}
const INK := Color("#2e2a25")
const RED := Color("#a8352a")
const PAPER := Color("#f7f1e3")
const LINE := Color("#cdb98f")
const MUTED := Color("#8a7f6a")
const FAINT := Color("#a89b85")
const SUB_LINE := Color("#e3d6ba")

## 原版 JOURNAL_ID / BOND_KEY / BOND_FALLBACK / SPRITE_NAME
const JOURNAL_ID := {"innkeeper": "merchant", "aide": "procurement_aide", "guanshi": "steward", "caibanshi": "procurement"}
const BOND_KEY := {"托付": "tuo", "信赖": "xin", "熟络": "shu", "初识": "chu", "冷淡": "leng", "厌恶": "yan", "仇视": "chou"}
const BOND_FALLBACK := [{"min": 80, "name": "托付"}, {"min": 50, "name": "信赖"}, {"min": 20, "name": "熟络"}, {"min": 0, "name": "初识"},
	{"min": -19, "name": "冷淡"}, {"min": -49, "name": "厌恶"}, {"min": -100, "name": "仇视"}]
const NAME_FALLBACK := {"guanshi": "管事", "wukui": "乌魁", "caibanshi": "采办使"}

static func J():
	return Npc.rep if Npc and Npc.get("rep") != null else null

static func D() -> Dictionary:
	var j = J()
	if j: return j.D
	var d = DB.g("QiheJianghuData")
	return d if d is Dictionary else {}

static func _num(x) -> float:
	if x is Dictionary: x = x.get("score")
	if x is int or x is float: return float(x)
	if x is String and x.is_valid_float(): return float(x)
	return 0.0

## sg(v)：+5 / −5 / 0（负号用全角减号 U+2212）
static func sg(v) -> String:
	var n := int(round(_num(v)))
	return "+" + str(n) if n > 0 else ("−" + str(absi(n)) if n < 0 else str(n))

static func tc(k) -> Color: return TC.get(str(k), TC.chu)

static func ui(m) -> Dictionary:
	if not (m.s.get("repUi") is Dictionary): m.s.repUi = {"closed": {}, "logAll": false}
	return m.s.repUi

static func part() -> String:
	var j = J()
	if j: return j.part()
	var S: Dictionary = G.S
	var p = S.get("prologue", {}).get("part") if S.get("prologue") is Dictionary else null
	return str(p) if p else str(S.get("part", "kaishi"))

static func people() -> Dictionary:
	var n = DB.g("QIHE_NPC_DATA")
	return n.get("PEOPLE", {}) if n is Dictionary else {}

static func _dig(d, path: String):
	for k in path.split("."):
		if not (d is Dictionary): return null
		d = d.get(k)
	return d

# ───── groups()：见过（faction[id].met）的势力，本门置顶，组内按分数高低；四个门类 sect/town/guan/other ─────
static func groups(m) -> Array:
	var j = J()
	if j == null: return []
	var st_all: Dictionary = j.ensure().faction
	var d := D()
	var list: Array = []
	var idx := 0
	for id in d.get("FACTIONS", {}):
		# 2026-11-09 试玩审查：见过徐令仪（主线会面）却没列出正道盟。“见过”原来只在声誉变动时记，现在见过这一方的任何一个人也算
		if not (st_all.get(id) is Dictionary and st_all[id].get("met")) and not members(id).any(func(x): return x.met): continue
		var def: Dictionary = d.FACTIONS[id]
		var st: Dictionary = j.stage(id)
		list.append({"id": id, "n": def.name, "g": def.get("glyph", ""), "c": Color(def.get("color", "#7a5a44")), "v": st.score,
			"t": st.name, "tk": st.id, "grp": def.get("group", "other"), "tag": def.get("tag", ""), "pin": def.get("pin") == true, "i": idx})
		idx += 1
	# 原版 sort：(b.pin?1:0)-(a.pin?1:0) || b.v-a.v（JS 稳定排序，用原序 i 兜底）
	list.sort_custom(func(a, b):
		if a.pin != b.pin: return a.pin
		if a.v != b.v: return a.v > b.v
		return a.i < b.i)
	var closed: Dictionary = ui(m).closed
	var out: Array = []
	for k in ["sect", "town", "guan", "other"]:
		out.append({"k": k, "n": d.get("GROUP_NAME", {}).get(k, k), "open": not closed.get(k, false),
			"items": list.filter(func(x): return x.grp == k)})
	return out

# ───── 见过谁：只读现成记录（原版 metCtx / metOf） ─────
static func met_ctx() -> Dictionary:
	var jm = Quest.knowledge(G.S).get("met", {})
	return {"jm": jm if jm is Dictionary else {}}

static func met_of(id: String, ctx: Dictionary) -> bool:
	var S: Dictionary = G.S
	if (S.get("party", []) as Array).has(id): return true
	var ro = _dig(S, "qiheRoster.members")
	if ro is Array and ro.has(id): return true
	if ctx.jm.get(JOURNAL_ID.get(id, id)): return true
	var b = _dig(S, "qiheBond." + id)
	if b is Dictionary and (_num(b.get("score")) != 0 or (b.get("gifts") is Array and b.gifts.size()) or b.get("unlocked") or b.get("bonus")): return true
	var n = S.get("qiheNpc")
	if n is Dictionary:
		var sp = _dig(n, "spar." + id)
		if sp is Dictionary and (sp.get("count") or sp.get("first")): return true
		if _dig(n, "teach." + id): return true
	var g = S.get("qiheGift")
	if g is Dictionary:
		for k in ["given", "known"]:
			var e = _dig(g, k + "." + id)
			if e is Dictionary and e.size(): return true
		if _dig(g, "returned." + id): return true
	var t = S.get("qiheTown")
	if t is Dictionary:
		var pole = _dig(t, "pole.stage"); var tab = _dig(t, "tab.stage")
		if id == "peddler" and pole and pole != "none": return true
		if id == "innkeeper" and tab and tab != "none": return true
	var enc = S.get("encounteredNpcs")
	if enc is Array and enc.has(id): return true
	var qe = _dig(S, "qiheEncountered." + id)
	return qe != null and qe != false and qe != 0 and qe != ""

## 个人关系档位：赠礼稿的个人关系轴 QIHE_NPC_DATA.BOND.stages（从高到低）
static func member_stage(v: float) -> Dictionary:
	var src = _dig(DB.g("QIHE_NPC_DATA"), "BOND.stages")
	var T: Array = (src if src is Array else BOND_FALLBACK).duplicate()
	T.sort_custom(func(a, b): return a.min > b.min)
	var st: Dictionary = T[T.size() - 1]
	for x in T:
		if v >= x.min: st = x; break
	return {"n": st.name, "k": BOND_KEY.get(st.name, "chu")}

static func revealed() -> bool: return _dig(G.S, "flags.jianghuLinguanshiRevealed") == true

static func members(fid: String) -> Array:
	var d := D()
	var ctx := met_ctx()
	var fac: Dictionary = d.get("FACTIONS", {}).get(fid, {})
	var grp: String = fac.get("group", "sect")
	var RN: Dictionary = d.get("RANK_NAME", {}).get(grp, d.get("RANK_NAME", {}).get("sect", {}))
	var S: Dictionary = G.S
	var out: Array = []
	for id in d.get("MEMBERS", {}):
		var def: Dictionary = d.MEMBERS[id]
		if not (def.get("faction") == fid or def.get("shownIn") == fid): continue
		if def.get("hidden") and not revealed(): continue
		var P: Dictionary = people().get(id, {})
		var raw = _dig(S, "bond." + id)
		if raw == null: raw = _dig(S, "qiheBond." + id)
		var v := _num(raw)
		var st := member_stage(v)
		var rank: String = str(def.get("title")) if def.get("title") else str(RN.get(def.get("rank", ""), ""))
		var role: String = "" if (P.get("disguised") and def.get("hidden") and not revealed()) else str(P.get("role", ""))
		var r := " · ".join(PackedStringArray([rank, role].filter(func(x): return x != "")))
		out.append({"id": id, "n": P.get("name", NAME_FALLBACK.get(id, id)), "r": r, "v": v, "st": st.n, "stk": st.k,
			"boss": fac.get("boss") == id, "met": met_of(id, ctx), "por": P.get("portrait")})
	return out

# ───── 声誉秤杆：七段等宽，左恶右侠；刻度、段名、标记、上下限都走 fame_pos（原版 FAME_ASC / famePos） ─────
static func fame_asc() -> Array:
	var A: Array = (D().get("FAME_STAGES", []) as Array).duplicate()
	A.sort_custom(func(a, b): return a.min < b.min)
	var out: Array = []
	for k in A.size():
		var z: Dictionary = A[k].duplicate()
		z.lo = z.min
		z.hi = A[k + 1].min - 1 if k < A.size() - 1 else 100
		out.append(z)
	return out

## 分数 → 0～100；edge "lo"/"hi" 取格子左缘/右缘，否则取中点
static func fame_pos(v: float, edge := "") -> float:
	var A := fame_asc()
	var n := A.size()
	var k := 0
	for i in n:
		if v >= A[i].lo and v <= A[i].hi: k = i; break
	var z: Dictionary = A[k]
	var span: float = z.hi - z.lo + 1
	var off := 0.0 if edge == "lo" else (1.0 if edge == "hi" else 0.5)
	return (k + (v - z.lo + off) / span) / n * 100.0

# ───── 「眼下／再升／再落」三句：从档位效果表 GATE 生成（原版 gateText / outlook） ─────
static func gate_text(id: String, grp: String) -> String:
	var g: Dictionary = D().get("GATE", {}).get(id, {})
	var who := "乡里人" if grp == "town" else ("公人" if grp == "guan" else "门人")
	var out: PackedStringArray = []
	if g.get("trade"): out.append(who + "不肯交易、请教、切磋、托事")
	if g.get("priceMul"):
		var pm: float = g.priceMul
		if pm > 1: out.append("买卖贵一成")
		else:
			var nm := "九折" if is_equal_approx(pm, 0.9) else ("八五折" if is_equal_approx(pm, 0.85) else str(int(round(pm * 100))) + "%")
			out.append("买卖" + nm)
	if g.get("firstMeet"): out.append(who + "初见 " + sg(g.firstMeet))
	return "，".join(out) + "。" if out.size() else who + "初见照常，买卖原价。"

## 返回 [[键, 文字, 附注, 是否再落]]
static func outlook(fid: String, st: Dictionary, lock) -> Array:
	var d := D()
	var grp: String = d.FACTIONS[fid].get("group", "sect")
	var S: Array = d.get("STAGES", [])
	var i := -1
	for x in S.size():
		if S[x].id == st.id: i = x; break
	var L = d.get("PART_LIMITS", {}).get(lock, {}).get("faction") if lock else null
	var out: Array = [["眼下", gate_text(st.id, grp), "", false]]
	if i > 0:
		var up: Dictionary = S[i - 1]
		var capped: bool = L != null and up.min > L[1]
		out.append(["再升", "到「%s」（%s）：%s" % [up.name, sg(up.min), gate_text(up.id, grp)],
			"开始部分最高到 %s，这一档要到培养才开。" % sg(L[1]) if capped else "", false])
	if i >= 0 and i + 1 < S.size():
		var dn: Dictionary = S[i + 1]
		var floor_v: float = maxf(L[0] if L != null else -100.0, float(d.FACTIONS[fid].get("floor", -100)))
		var dmax: float = -1.0 if (st.score >= 0 and st.id == "chu") else float(S[i].get("min", 0)) - 1.0
		out.append(["再落", "到「%s」（%s）：%s" % [dn.name, sg(dmax), gate_text(dn.id, grp)],
			"开始部分最低到 %s，落不到这一档。" % sg(floor_v) if dmax < floor_v else "", true])
	return out

## 近事：倒序，收起 2 条、展开 8 条；返回 {rows:[[名, 变化, 原因]], more:bool}
static func recent(m) -> Dictionary:
	var j = J()
	var lg: Array = (j.ensure().log as Array).duplicate() if j else []
	lg.reverse()
	var n := 8 if ui(m).logAll else 2
	var d := D()
	var rows: Array = []
	for x in lg.slice(0, n):
		var nm: String = "声誉" if x.get("kind") == "fame" else str(d.get("FACTIONS", {}).get(x.get("id"), {}).get("name", "关系"))
		rows.append([nm, sg(x.get("delta")), str(d.get("REASON_TEXT", {}).get(x.get("reason"), "其他"))])
	return {"rows": rows, "more": lg.size() > 2}

# ───────── 画法小件 ─────────
## 'KaiTi','STKaiti'（UI.kai_bold：本机有楷体就用，否则回落宋体）；Songti SC 用 UI.song
static func kai(text: String, fs: int, col: Color, ls := 0.0) -> Label:
	var l := K.lab(text, fs, col, true, ls)
	l.add_theme_font_override("font", Paint.font(UI.kai_bold, fs, ls / float(fs)) if ls != 0.0 else UI.kai_bold)
	return l
static func song(text: String, fs: int, col: Color, ls := 0.0, bold := false) -> Label: return K.lab(text, fs, col, bold, ls)

## 文字绘制（自绘层里用）：x 为左缘，y 为行框顶，按 CSS 行高 1.5 居中基线
static func text_at(ci: CanvasItem, t: String, x: float, y: float, fs: int, col: Color, bold := false, center := false) -> void:
	var f: Font = UI.song_bold if bold else UI.song
	var w := f.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
	var asc := f.get_ascent(fs); var dsc := f.get_descent(fs)
	ci.draw_string(f, Vector2(x - (w / 2 if center else 0.0), y + fs * 0.75 + (asc - dsc) / 2), t, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, col)

## .qjr-seal：方形石印，势力色底、圆角、内阴影 inset 0 0 0 2px #0000002e + inset 0 0 10px #00000045、外影 0 1px 2px #0003，字 #f8efdc
static func seal(ch: String, fc: Color, sz: float, fs: int, radius := 4) -> Control:
	var c := Control.new()
	c.custom_minimum_size = Vector2(sz, sz)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	c.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	c.draw.connect(func():
		var r := Rect2(Vector2.ZERO, Vector2(sz, sz))
		c.draw_style_box(K.sb(Color(0, 0, 0, 0.2), Color(0, 0, 0, 0), [0, 0, 0, 0], radius), Rect2(Vector2(0, 1), r.size))
		c.draw_style_box(K.sb(fc, Color(0, 0, 0, 0.18), [2, 2, 2, 2], radius), r)
		for i in 4:
			var g := 2.0 + i * 2.0
			c.draw_rect(r.grow(-g), Color(0, 0, 0, 0.27 * (1.0 - i / 4.0) * 0.35), false, 2.0)
		text_at(c, ch, sz / 2, (sz - fs * 1.5) / 2, fs, Color("#f8efdc"), true, true))
	return c

## .qjr-aside / .qjr-main：#fbf7ee 底、1px #cdb98f 框、inset 3px #f2e8d3、外影 0 1px 3px #0000001a
static func sheet(pos: Vector2, sz: Vector2, title := "") -> Control:
	# 11-09 第四十八轮：原来是双线框、无题签，和其他页不一样；改用各页通用的菱形题签框（K.titled），内容由框自动排进内边距
	var c := K.titled(title, null, [12, 24, 12, 10])
	c.position = pos; c.size = sz; c.custom_minimum_size = sz
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return c

## .qjr-ring：62×62 圆环 3px #2f2a2640，内衬 6px #f7f1e3 与 1px #2f2a2626
static func ring() -> Control:
	var c := Control.new()
	c.custom_minimum_size = Vector2(59, 59)
	c.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.draw.connect(func():
		var o := Vector2(29.5, 29.5)
		c.draw_arc(o, 28, 0, TAU, 64, Color(47 / 255.0, 42 / 255.0, 38 / 255.0, 0.25), 3.0, true)
		c.draw_arc(o, 26.5 - 6.5, 0, TAU, 64, Color(47 / 255.0, 42 / 255.0, 38 / 255.0, 0.15), 1.0, true))
	return c

# ───── 头像：有立绘的裁脸（原版 faceCrop / placeFace：立绘 960×1280，按 alpha 找头顶与头部中线，取 400 见方窗口）；
## 没有立绘的用姓氏印（原版中间一档 miniSprite 像素小人未移植，见 menu-notes.md） ─────
static var _crop := {}
static func face_crop(t: Texture2D) -> Vector2:
	var key := t.get_rid().get_id()
	if _crop.has(key): return _crop[key]
	var res := Vector2(0.5, 0.2)
	var im := t.get_image()
	if im:
		if im.is_compressed(): im.decompress()
		im = im.duplicate(); im.resize(120, 160, Image.INTERPOLATE_BILINEAR)
		var top := 0
		for j in 160:
			var n := 0
			for i in 120:
				if im.get_pixel(i, j).a * 255.0 > 110: n += 1
			if n >= 3: top = j; break
		var xs: Array = []
		for j in range(top, mini(160, top + 22)):
			for i in 120:
				if im.get_pixel(i, j).a * 255.0 > 110: xs.append(i)
		xs.sort()
		res = Vector2((xs[xs.size() >> 1] if xs.size() else 60) / 120.0, (top + 24) / 160.0)
	_crop[key] = res
	return res

## .qjr-av：56×56、1px #cdb98f 框、#efe5cf 底、inset 2px #fffaf0
static func avatar(mb: Dictionary, unknown := false) -> Control:
	var c := Control.new()
	c.custom_minimum_size = Vector2(56, 56)
	c.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.clip_contents = true
	var t: Texture2D = null
	if not unknown and mb.get("por"):
		# 11-09：按素材登记表取路径（徐令仪等立绘文件名带日期后缀，硬拼“portraits/键名.webp”会找不到）
		var pk := str(mb.por)
		var pp := "assets/production/portraits/" + pk + ".webp"
		t = K._tex(pp) if ResourceLoader.exists("res://" + pp) else Assets.tex(pk)
	c.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	c.draw.connect(func():
		var r := Rect2(0, 0, 56, 56)
		if unknown:
			c.draw_rect(r, Color("#ece3d0"))
			text_at(c, "？", 28, 28 - 16.5, 22, FAINT, false, true)
			for i in range(0, 56, 6):
				for e in [[Vector2(i, 0), Vector2(i + 3, 0)], [Vector2(i, 55.5), Vector2(i + 3, 55.5)], [Vector2(0.5, i), Vector2(0.5, i + 3)], [Vector2(55.5, i), Vector2(55.5, i + 3)]]:
					c.draw_line(e[0], e[1], LINE, 1.0)
			return
		if t:
			c.draw_rect(r, Color("#ece2cb"))
			var f := face_crop(t)
			var sc := 56.0 / 400.0 * (960.0 / t.get_width())
			var W := t.get_width() * sc; var H := t.get_height() * sc
			c.draw_texture_rect(t, Rect2(28 - f.x * W, 28 - f.y * H, W, H), false)
		else:
			c.draw_rect(r, Color("#6f5a45"))
			text_at(c, str(mb.n).substr(0, 1), 28, 28 - 18, 24, Color("#f6ecd6"), true, true)
		c.draw_rect(r.grow(-2), Color("#fffaf0"), false, 2.0)
		c.draw_rect(Rect2(0.5, 0.5, 55, 55), LINE, false, 1.0))
	return c

# ───────── 页面（原版 render(sel)）：.qjr-rep 网格 padding 8 20 12、列 36% / 1fr、间距 12 16 ─────────
static func build(m, _v: Dictionary) -> Control:
	var root := Control.new()
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var j = J()
	if j == null:
		var e := song("关系数据暂不可用", 13, MUTED); e.position = Vector2(560, 280); root.add_child(e)
		return root
	var fl: Dictionary = j.fame_level()
	var gs := groups(m)
	var lock = "kaishi" if part() == "kaishi" else null
	var met: Array = []
	for g in gs: met.append_array(g.items)
	var sel = m.s.get("repSel")
	if not sel or not met.any(func(f): return f.id == sel):
		sel = null
		for g in gs:
			if g.open and g.items.size(): sel = g.items[0].id; break
		if sel == null:
			for g in gs:
				if g.items.size(): sel = g.items[0].id; break
	m.s.repSel = sel
	m.s.repAny = met.size() > 0
	root.add_child(_fame_row(fl.score, lock))
	root.add_child(_aside(m, gs, sel, lock, met.size()))
	root.add_child(_main(m, sel, lock))
	return root

## .qjr-fame（实测 19,7 → 1242×62）：名印 42 ＋「声誉 · 江湖人称 / 档名 分数」＋ 恶印 ＋ 秤杆 ＋ 侠印 ＋ 说明
static func _fame_row(score: int, lock) -> Control:
	var A := fame_asc()
	var cur: Dictionary = A[0]
	for z in A:
		if score >= z.lo and score <= z.hi: cur = z; break
	var row := Control.new()
	row.position = Vector2(30, 7); row.size = Vector2(1220, 62)   # 11-10：左右边距和行记页一样 30
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.draw.connect(func(): row.draw_rect(Rect2(0, 61, 1242, 1), LINE))
	var s1 := seal("名", RED, 42, 25); s1.position = Vector2(4, 9); row.add_child(s1)
	var sm := song("声誉 · 江湖人称", 13, MUTED, 2); sm.position = Vector2(55, 6); row.add_child(sm)
	var bh := K.hbox(6); bh.position = Vector2(55, 22); bh.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var bn := kai(str(cur.name), 21, RED, 3)
	var be := kai(sg(score), 14, Color("#6f6655")); be.size_flags_vertical = Control.SIZE_SHRINK_END
	bh.add_child(bn); bh.add_child(be); row.add_child(bh)
	var s2 := seal("恶", Color("#2f2a26"), 25, 15, 3); s2.position = Vector2(171, 17); row.add_child(s2)
	var s3 := seal("侠", RED, 25, 15, 3); s3.position = Vector2(974, 17); row.add_child(s3)
	row.add_child(_scale(Vector2(204, 4), Vector2(763, 51), score, cur, lock))
	var note := Control.new(); note.position = Vector2(1020, 13); note.size = Vector2(219, 33)
	note.mouse_filter = Control.MOUSE_FILTER_IGNORE
	note.draw.connect(func(): note.draw_rect(Rect2(0, 0, 1, 33), LINE))
	var nt := K.para("声誉只记被人看见的事；门派、村镇各记各的账。", 13, MUTED, 1.6)
	nt.position = Vector2(14, 0); nt.size = Vector2(205, 33); note.add_child(nt)
	row.add_child(note)
	return row

## .qjr-fscale：杆 top 23 高 6（五段渐变）、刻度 top 20 高 12、段名 top 34 11px、雾 top 21 高 10、上下限字 top 2 10px、菱形标记中心 y 26
static func _scale(pos: Vector2, sz: Vector2, score: int, cur: Dictionary, lock) -> Control:
	var A := fame_asc(); var n := A.size()
	var c := Control.new(); c.position = pos; c.size = sz
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var L = D().get("PART_LIMITS", {}).get(lock, {}).get("fame") if lock else null
	c.draw.connect(func():
		var w := sz.x
		Paint.grad(c, Rect2(0, 23, w, 6), [[0, Color("#2f2a26")], [0.3, Color("#8a7a66")], [0.5, Color("#c9b48c")], [0.7, Color("#b8754e")], [1, RED]])
		c.draw_rect(Rect2(0, 23, w, 1), Color(0, 0, 0, 0.25))
		for k in range(1, n): c.draw_rect(Rect2(k * w / n - 0.5, 20, 1, 12), Color("#6f6655"))
		for k in n:
			var z: Dictionary = A[k]
			text_at(c, str(z.name), (k + 0.5) / n * w, 34, 13, RED if z.id == cur.id else MUTED, z.id == cur.id, true)
		if L != null:
			var a := fame_pos(L[0], "lo") / 100.0 * w; var b := fame_pos(L[1], "hi") / 100.0 * w
			if a > 0:
				_fog(c, Rect2(0, 21, a, 10))
				var t := "◂ 开始部分到此"
				text_at(c, t, a - 4 - UI.song.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x - 6, 2, 10, RED)
			if b < w:
				_fog(c, Rect2(b, 21, w - b, 10))
				text_at(c, "到此 ▸", b + 4, 2, 10, RED)
		var mx := fame_pos(score) / 100.0 * w
		var dia := func(h: float, col: Color):
			c.draw_colored_polygon(PackedVector2Array([Vector2(mx, 26 - h), Vector2(mx + h, 26), Vector2(mx, 26 + h), Vector2(mx - h, 26)]), col)
		dia.call(10.0 * 1.414 + 1.5, Color(0, 0, 0, 0.25))
		dia.call(10.0 * 1.414, Color("#6b2018"))
		dia.call(9.0 * 1.414, PAPER)
		dia.call(7.0 * 1.414, RED))
	return c

## .qjr-fog：repeating-linear-gradient(135deg, #f7f1e3d9 0 3px, transparent 3px 6px)
static func _fog(ci: CanvasItem, r: Rect2) -> void:
	var col := Color(247 / 255.0, 241 / 255.0, 227 / 255.0, 0.85)
	var x := r.position.x - r.size.y
	while x < r.end.x:
		var p0 := Vector2(x, r.end.y); var p1 := Vector2(x + r.size.y, r.position.y)
		var a := maxf(0.0, r.position.x - p0.x); var b := maxf(0.0, p1.x - r.end.x)
		ci.draw_line(p0 + Vector2(a, -a), p1 - Vector2(b, -b), col, 2.1)
		x += 6.0 * 1.414

## .qjr-aside（实测 19,80 → 447×515，padding 10 12）：标题「势力」、门类跳转、势力列表；无势力时空状态
static func _aside(m, gs: Array, sel, lock, total: int) -> Control:
	var box := sheet(Vector2(30, 84), Vector2(440, 511), "势力")
	var col := K.vbox(0)
	col.position = Vector2(12, 10); col.size = Vector2(423, 495)
	box.add_child(col)
	var ah := K.hbox(10); ah.custom_minimum_size.y = 31
	var t2box := K.margin(0, 4, 0, 0)
	t2box.add_child(song("见过才列出 · 组内按关系高低", 13, MUTED))
	ah.add_child(t2box)
	ah.draw.connect(func(): ah.draw_rect(Rect2(0, ah.size.y - 1, ah.size.x, 1), SUB_LINE))
	col.add_child(ah)
	if total == 0:
		var e := K.vbox(8); e.alignment = BoxContainer.ALIGNMENT_CENTER; K.expand(e, 1, true, true)
		e.add_child(ring())
		var p := song("还没有和哪一方打过交道。", 14, Color("#3d3429"), 1); p.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		e.add_child(K.spacer(6)); e.add_child(p)
		var sm := K.para("在江湖上见过的门派、村镇、官府会列在这里；和其中的人往来、结怨，都会记到这一方头上。", 14, MUTED, 1.7)
		sm.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		sm.custom_minimum_size.x = 230; sm.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		e.add_child(sm)
		col.add_child(e)
		return box
	col.add_child(_jumps(gs, total))
	var sc := K.scroll(); K.expand(sc, 1, true, true)
	var pl := K.vbox(0); K.expand(pl)
	sc.add_child(pl); col.add_child(sc)
	for g in gs:
		pl.add_child(_grp_row(g))
		if not g.open: continue
		for f in g.items: pl.add_child(_faction_row(f, f.id == sel, lock))
	return box

## .qjr-jumps：门类跳转小签 12px（padding 2 8、1px #cdb98f、#fffaf0；空门类 opacity .45）＋「共 N 方」
static func _jumps(gs: Array, total: int) -> Control:
	var mg := K.margin(0, 8, 0, 6)
	var row := K.hbox(6); mg.add_child(row)
	for g in gs:
		var on: bool = g.items.size() > 0
		# 11-10 第四十九轮：和装备、武学页的分类页签同一套——无边框，底色加下划线
		var n := K.sb(Color(0, 0, 0, 0), Color(0, 0, 0, 0), [0, 0, 0, 2], 0, [8, 4, 8, 4])
		var hv := K.sb(Color("#ede0bf77"), Color("#94733e"), [0, 0, 0, 2], 0, [8, 4, 8, 4])
		var b := K.card("repJump", {"id": g.k}, false, 2, n, hv if on else n, null, [8, 4, 8, 4])
		if not on: b.modulate.a = 0.45; b.mouse_filter = Control.MOUSE_FILTER_IGNORE; b.focus_mode = Control.FOCUS_NONE
		var box := K.content(b)
		box.add_child(song(str(g.n), 14, Color("#3d3429")))
		var em := song(str(g.items.size()), 12, MUTED); em.size_flags_vertical = Control.SIZE_SHRINK_END
		box.add_child(em)
		row.add_child(b)
	var sp := Control.new(); K.expand(sp); sp.mouse_filter = Control.MOUSE_FILTER_IGNORE; row.add_child(sp)
	var tl := song("共 %d 方" % total, 13, MUTED); tl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(tl)
	return mg

## .qjr-grp：门类行（padding 7 2；斜方块 18 #2f2a26 里「−／+」；名 14px 字距 3；数目 11px #a89b85）
static func _grp_row(g: Dictionary) -> Control:
	var b := K.card("repGroup", {"id": g.k}, false, 8, K.sb(Color(0, 0, 0, 0)), K.sb(Color(0, 0, 0, 0)), null, [2, 7, 2, 7])
	var box := K.content(b); box.alignment = BoxContainer.ALIGNMENT_BEGIN
	var pm := Control.new(); pm.custom_minimum_size = Vector2(18, 18); pm.mouse_filter = Control.MOUSE_FILTER_IGNORE
	pm.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var open: bool = g.open
	pm.draw.connect(func():
		var o := Vector2(9, 9); var h := 9.0 * 1.414
		pm.draw_colored_polygon(PackedVector2Array([o + Vector2(0, -h), o + Vector2(h, 0), o + Vector2(0, h), o + Vector2(-h, 0)]), Color("#2f2a26"))
		text_at(pm, "−" if open else "+", 9, 9 - 9.75, 13, PAPER, true, true))
	box.add_child(K.spacer(0, 2)); box.add_child(pm)
	box.add_child(song(str(g.n), 14, INK, 3, true))
	box.add_child(song(str(g.items.size()), 13, FAINT))
	if g.items.is_empty():
		box.add_child(song("帮会、山寨、江湖散人（尚无）" if g.k == "other" else "尚无", 13, FAINT))
	return b

## .qjr-row：margin 2 0 6 18、padding 8 10、#fffdf7 / 1px #e6dac0；选中 #fff8e6 / #c9a45c 并在左侧 -16 画朱色小菱形
static func _faction_row(f: Dictionary, on: bool, lock) -> Control:
	var mg := K.margin(18, 2, 0, 6)
	var n := K.sb(Color("#fffdf7"), Color("#e6dac0"), [1, 1, 1, 1], 0, [10, 8, 10, 8])
	var hv := K.sb(Color("#fffdf7"), LINE, [1, 1, 1, 1], 0, [10, 8, 10, 8])
	var sl := K.sb(Color("#fff8e6"), Color("#c9a45c"), [1, 1, 1, 1], 0, [10, 8, 10, 8])
	sl.expand_margin_left = 1; sl.expand_margin_right = 1; sl.expand_margin_top = 1; sl.expand_margin_bottom = 1
	var b := K.card("repFaction", {"id": f.id}, false, 10, sl if on else n, sl if on else hv, null, [10, 8, 10, 8])
	if on:
		b.under.append(func(ci: CanvasItem, r: Rect2):
			var o := Vector2(-12, r.size.y / 2); var h := 4.0 * 1.414
			ci.draw_colored_polygon(PackedVector2Array([o + Vector2(0, -h), o + Vector2(h, 0), o + Vector2(0, h), o + Vector2(-h, 0)]), RED))
	var box := K.content(b)
	box.add_child(seal(str(f.g), f.c, 38, 21))
	var nm := K.vbox(6); K.expand(nm); nm.alignment = BoxContainer.ALIGNMENT_CENTER
	var l1 := K.hbox(6)
	l1.add_child(song(str(f.n), 15, INK, 2, true))
	if f.pin:
		var tg := K.panel(Color("#d4c5a8"), Color(0, 0, 0, 0), [0, 0, 0, 0], [4, 0, 4, 0])
		tg.add_child(song("本门", 12, Color("#3d3429"))); tg.size_flags_vertical = Control.SIZE_SHRINK_END
		l1.add_child(tg)
	elif f.tag:
		var sb2 := song(str(f.tag), 12, MUTED); sb2.size_flags_vertical = Control.SIZE_SHRINK_END; l1.add_child(sb2)
	var sp := Control.new(); K.expand(sp); sp.mouse_filter = Control.MOUSE_FILTER_IGNORE; l1.add_child(sp)
	l1.add_child(_tier(str(f.t), f.v, tc(f.tk), 12))
	nm.add_child(l1)
	nm.add_child(_rbar(f.v, lock))
	box.add_child(nm)
	mg.add_child(b)
	return mg

## 档名＋（分数）：分数部分 opacity .75
static func _tier(t: String, v, col: Color, fs: int) -> Control:
	var h := K.hbox(0); h.size_flags_vertical = Control.SIZE_SHRINK_END
	h.add_child(song(t, fs, col))
	var c2 := col; c2.a = 0.75
	h.add_child(song("（%s）" % sg(v), fs, c2))
	return h

## .qjr-rbar：高 5、#ece3d0；中线 0（上下各出 3px）；正值朱 #a8352a 往右、负值墨 #2f2a26 往左；开始部分上下限画虚线
static func _rbar(v: float, lock) -> Control:
	var c := Control.new(); c.custom_minimum_size = Vector2(0, 5); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var L = D().get("PART_LIMITS", {}).get(lock, {}).get("faction") if lock else null
	c.draw.connect(func():
		var w := c.size.x
		c.draw_style_box(K.sb(Color("#ece3d0"), Color(0, 0, 0, 0), [0, 0, 0, 0], 2), Rect2(0, 0, w, 5))
		var px := func(x: float) -> float: return (50.0 + x / 2.0) / 100.0 * w
		if v >= 0: c.draw_style_box(K.sb(RED, Color(0, 0, 0, 0), [0, 0, 0, 0], 2), Rect2(w / 2, 0, v / 200.0 * w, 5))
		else: c.draw_style_box(K.sb(Color("#2f2a26"), Color(0, 0, 0, 0), [0, 0, 0, 0], 2), Rect2(px.call(v), 0, -v / 200.0 * w, 5))
		c.draw_rect(Rect2(w / 2, -3, 1, 11), Color("#6f6655"))
		if L != null:
			for lv in [L[0], L[1]]:
				var x: float = px.call(float(lv))
				c.draw_dashed_line(Vector2(x + 0.5, -4), Vector2(x + 0.5, 9), MUTED, 1.0, 2.0))
	return c

## .qjr-main（实测 481,80 → 780×515，padding 12 14，纵向间距 10）
static func _main(m, sel, lock) -> Control:
	var box := sheet(Vector2(484, 84), Vector2(766, 511), "关系")
	var col := K.vbox(10)
	col.position = Vector2(15, 13); col.size = Vector2(751, 489)
	box.add_child(col)
	var d := D()
	if sel and d.get("FACTIONS", {}).has(sel):
		var f: Dictionary = d.FACTIONS[sel]
		var st: Dictionary = J().stage(sel)
		col.add_child(_title(f, st))
		var ol := K.vbox(5)
		for r in outlook(sel, st, lock): ol.add_child(_ol_row(r))
		var olm := K.margin(2, 2, 2, 8); olm.add_child(ol)
		olm.draw.connect(func(): olm.draw_rect(Rect2(0, olm.size.y - 1, olm.size.x, 1), SUB_LINE))
		col.add_child(olm)
		var mh := K.hbox(10)
		mh.add_child(song("村中人物" if f.group == "town" else ("司中人物" if f.group == "guan" else "门中人物"), 14, INK, 3, true))
		var mhs := song("各人和你的私交另算；只列见过的人", 13, MUTED); mhs.size_flags_vertical = Control.SIZE_SHRINK_END
		mh.add_child(mhs)
		col.add_child(mh)
		var sc := K.scroll(); K.expand(sc, 1, true, true)
		var gr := _mcards(members(sel)); K.expand(gr)
		sc.add_child(gr); col.add_child(sc)
	else:
		var e := K.vbox(12); e.alignment = BoxContainer.ALIGNMENT_CENTER; K.expand(e, 1, true, true)
		e.add_child(ring())
		var p := song("选一方势力，看门中人物和你的关系" if m.s.get("repAny") else "见过哪一方的人，这里就能看到他们和你的关系", 13, MUTED, 1); p.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		e.add_child(p)
		col.add_child(e)
	col.add_child(_recent(m))
	return box

## .qjr-title：深色斜切题条（clip-path 右下收 4%）、大印 50、名 22px 字距 6、副行 11px；右侧 66 圆章「档名 / 分数」
static func _title(f: Dictionary, st: Dictionary) -> Control:
	var d := D()
	var c := Control.new(); c.custom_minimum_size = Vector2(0, 66); c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.draw.connect(func():
		var w := c.size.x; var h := c.size.y
		var pts := PackedVector2Array([Vector2(0, 0), Vector2(w, 0), Vector2(w * 0.96, h), Vector2(0, h)])
		var cols := PackedColorArray()
		for p in pts:
			var t := p.x / w
			cols.append(Color("#2b2925").lerp(Color("#3a3631"), clampf(t / 0.7, 0, 1)) if t <= 0.7 else Color("#3a3631").lerp(Color("#2b2925"), (t - 0.7) / 0.3))
		c.draw_polygon(pts, cols))
	var row := K.hbox(14); row.position = Vector2(12, 8); row.size = Vector2(600, 50); c.add_child(row)
	row.add_child(seal(str(f.get("glyph", "")), Color(f.get("color", "#7a5a44")), 50, 28))
	var tt := K.vbox(2); tt.alignment = BoxContainer.ALIGNMENT_CENTER
	tt.add_child(kai(str(f.name), 22, Color("#f6ecd6"), 6))
	var sub := PackedStringArray([d.get("GROUP_NAME", {}).get(f.get("group"), ""), f.get("tag", ""), d.get("REGION_NAME", {}).get(f.get("region"), "")].filter(func(x): return x != null and x != ""))
	tt.add_child(song(" · ".join(sub), 13, Color("#cbbd9d"), 1))
	row.add_child(tt)
	var big := Control.new(); big.size = Vector2(66, 66); big.mouse_filter = Control.MOUSE_FILTER_IGNORE
	big.set_anchors_preset(Control.PRESET_CENTER_RIGHT)
	c.add_child(big)
	c.resized.connect(func(): big.position = Vector2(c.size.x - 16 - 66, (c.size.y - 66) / 2))
	var tcol := tc(st.id)
	big.draw.connect(func():
		var o := Vector2(33, 33)
		big.draw_circle(o + Vector2(0, 2), 36, Color(0, 0, 0, 0.25))
		big.draw_circle(o, 35, Color(43 / 255.0, 41 / 255.0, 37 / 255.0, 0.5))
		big.draw_circle(o, 33, Color("#c9a45c"))
		for i in 8:
			big.draw_circle(o, 30 - i * 30.0 / 8.0, Color("#5c4730").lerp(Color("#8a6d47"), i / 7.0))
		text_at(big, str(st.name), 33, 33 - 24 - 1, 16, Color("#fbefd3"), true, true)
		text_at(big, sg(st.score), 33, 33 + 1, 11, Color("#f0d9a7"), false, true)
		big.draw_arc(o, 30, 0, TAU, 48, tcol.lerp(Color("#c9a45c"), 0.85), 1.0, true))
	return c

## .qjr-ol：「眼下／再升」朱签、「再落」墨签（11px 字距 2，padding 0 6），说明 12px，附注 11px #8a7f6a
static func _ol_row(r: Array) -> Control:
	var h := K.hbox(10)
	var k := K.panel(Color("#2f2a26") if r[3] else RED, Color(0, 0, 0, 0), [0, 0, 0, 0], [6, 0, 6, 0])
	k.add_child(song(r[0], 13, Color("#fbefd3"), 2)); k.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	h.add_child(k)
	var t := K.para(r[1] + ("　" + r[2] if r[2] != "" else ""), 14, INK, 1.5)
	K.expand(t); h.add_child(t)
	return h

## .qjr-members：三列网格间距 8；卡 padding 6 8、#fffdf7 / 1px #e6dac0；未识者虚线框「另有 N 人 / 还未相识」
static func _mcards(list: Array) -> Control:
	var seen := list.filter(func(x): return x.met)
	var unk := list.size() - seen.size()
	if seen.is_empty() and unk == 0:
		var e := song("还没有见过这里的人", 13, FAINT); e.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		var mg := K.margin(0, 12, 0, 12); mg.add_child(e); return mg
	var g := K.grid(3, 8, 8)
	for mb in seen: g.add_child(_mcard(mb, false))
	if unk: g.add_child(_mcard({"n": "另有 %d 人" % unk, "r": "还未相识"}, true))
	return g

static func _mcard(mb: Dictionary, unknown: bool) -> Control:
	var p := Control.new(); p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	K.expand(p); p.custom_minimum_size = Vector2(0, 70)
	p.draw.connect(func():
		var r := Rect2(Vector2.ZERO, p.size)
		if unknown: p.draw_dashed_line(Vector2(0.5, 0.5), Vector2(r.end.x - 0.5, 0.5), Color("#e6dac0"), 1, 3); p.draw_dashed_line(Vector2(0.5, r.end.y - 0.5), Vector2(r.end.x - 0.5, r.end.y - 0.5), Color("#e6dac0"), 1, 3); p.draw_dashed_line(Vector2(0.5, 0), Vector2(0.5, r.end.y), Color("#e6dac0"), 1, 3); p.draw_dashed_line(Vector2(r.end.x - 0.5, 0), Vector2(r.end.x - 0.5, r.end.y), Color("#e6dac0"), 1, 3)
		else: p.draw_style_box(K.sb(Color("#fffdf7"), Color("#e6dac0"), [1, 1, 1, 1]), r))
	var h := K.hbox(10); h.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	h.offset_left = 9; h.offset_top = 7; h.offset_right = -9; h.offset_bottom = -7
	p.add_child(h)
	h.add_child(avatar(mb, unknown))
	var mi := K.vbox(2); mi.alignment = BoxContainer.ALIGNMENT_CENTER; K.expand(mi)
	mi.add_child(song(str(mb.n), 15, MUTED if unknown else INK, 2, true))
	var rl := song(str(mb.r), 13, MUTED); rl.clip_text = true; rl.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	mi.add_child(rl)
	if not unknown: mi.add_child(_tier(str(mb.st), mb.v, tc(mb.stk), 12))
	h.add_child(mi)
	if mb.get("boss"):
		var bs := K.panel(RED, Color(0, 0, 0, 0), [0, 0, 0, 0], [4, 1, 4, 1])
		bs.add_child(song("主事", 12, Color("#fbefd3"), 1))
		bs.set_anchors_preset(Control.PRESET_TOP_RIGHT)
		p.add_child(bs)
		p.resized.connect(func(): bs.position = Vector2(p.size.x - 4 - bs.size.x, 4))
	return p

## .qjr-recent（实测 496,557 → 751×26）：上线 1px #e3d6ba、padding-top 8；「近事」朱字 12px 粗、各条 #6f6655 其中「名 ±n」#3d3429 粗；…全部/收起
static func _recent(m) -> Control:
	var r := recent(m)
	var mg := K.margin(0, 9, 0, 0)
	mg.draw.connect(func(): mg.draw_rect(Rect2(0, 0, mg.size.x, 1), SUB_LINE))
	var h := K.hbox(16); mg.add_child(h)
	h.add_child(song("近事", 14, RED, 2, true))
	if r.rows.is_empty(): h.add_child(song("尚无近事", 14, FAINT))
	for x in r.rows:
		var e := K.hbox(4)
		e.add_child(song("%s %s" % [x[0], x[1]], 12, Color("#3d3429"), 0, true))
		e.add_child(song(x[2], 14, Color("#6f6655")))
		h.add_child(e)
	if r.more:
		var sp := Control.new(); K.expand(sp); sp.mouse_filter = Control.MOUSE_FILTER_IGNORE; h.add_child(sp)
		var b := K.card("repLog", {}, false, 0, K.sb(Color(0, 0, 0, 0)), K.sb(Color(0, 0, 0, 0)))
		K.content(b).add_child(song("收起" if ui(m).logAll else "…全部", 13, MUTED))
		h.add_child(b)
	return mg

## 原版 handleClick：faction 选中、group 折叠、jump 展开并选该组第一个、log 近事展开
static func handle(m, act: String, node: Control) -> bool:
	var id = node.get_meta("id") if node.has_meta("id") else null
	match act:
		"repFaction": m.s.repSel = id
		"repGroup": ui(m).closed[id] = not ui(m).closed.get(id, false)
		"repJump":
			ui(m).closed[id] = false
			for g in groups(m):
				if g.k == id and g.items.size(): m.s.repSel = g.items[0].id
		"repLog": ui(m).logAll = not ui(m).logAll
		_: return false
	m.draw()
	return true
