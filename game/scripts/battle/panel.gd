extends Control
## 战斗 DOM 界面（layer 12）。原版 #bt 是 960×540 的绝对定位层，这里同样按 960 坐标立即绘制，数值照抄 bui.js 的 CSS
## （battleCSS ink 主题 + bui-compact + 布局 v4 覆盖），以及 battle-auto.js 的 #bt-auto、prologue-story-battle.js 的教学指引。
## 墨迹签条、铜钱、朱印、宣纸、木轴用 Bui（原版参数烘焙图，见 bdraw.gd 的 SW_* / sw_row 等）。
## 对外：render_cards / hint / hide_cmd / show_menu / cmd_hide / show_win / set_auto / teach_*。

const BD := preload("res://scripts/battle/bdraw.gd")
const Screen := preload("res://scripts/battle/screen.gd")
const W := 960.0
const H := 540.0
const PAPER := Color("#e9dcc0")

var bt
var _hint = null          # String 或 [[文字, 颜色, 字号, 字体?]...]
var cmd = null            # 当前指令菜单 {u,title,rows,sel,ft,x,y,w,t0}
var win = null            # 胜利结算 {growth,sil,drops,t0}
var auto_btn := {"show": false, "on": false, "text": ""}
var teach := {"on": false, "guide": null, "toggle": "关闭指引", "target": null, "focus_row": -1, "focus_card": -1}
var _card_rects := []
var _row_rects := []
var _pip_rects := []
var _btn_rects := {}
var _hover_row := -1

func _ready() -> void:
	size = Vector2(W, H)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS

func _process(_d: float) -> void:
	queue_redraw()

func render_cards() -> void:
	# bui.js renderCards 开头：当前行动者切换 → 通知演出层
	var B = bt.B
	if B == null: return
	if not is_same(B.cur, B.get("_buiCur")):
		B._buiCur = B.cur
		if B.cur != null: bt.rules.mo.on_turn_start(B.cur)
	queue_redraw()

func hint(v) -> void:
	_hint = v if (v is Array and v.size()) or (v is String and v != "") else null

func hide_cmd() -> void:
	cmd = null

func _draw() -> void:
	if bt == null or bt.B == null: return
	var now: float = bt.pn()
	_draw_cards(now)
	_draw_hint()
	_draw_cmd(now)
	_draw_auto()
	_draw_teach(now)
	if win != null: _draw_win(now)

## 文字小工具：在 (x, 基线 y) 绘制，返回宽度
func _txt(s: String, x: float, y: float, sz: int, col: Color, font: Font = null, shadow := true) -> float:
	if font == null: font = BD.fs()
	if shadow: draw_string(font, Vector2(x, y + 1), s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, Color(0, 0, 0, 0.75 * col.a))
	draw_string(font, Vector2(x, y), s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, col)
	return font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x
func _tw(s: String, sz: int, font: Font = null) -> float:
	if font == null: font = BD.fs()
	return font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x

## bui.js pips：5 枚铜钱，前 n 枚亮，最后 use 枚为「投入」
func _pips(x: float, y: float, n: int, use: int, sz: float, gap := 1.0, rects = null, alpha := 1.0) -> float:
	for i in 5:
		var st := "off"
		if i < n: st = "use" if i >= n - use else "on"
		BD.coin(self, st, x + i * (sz + gap), y, sz, alpha)
		if rects != null: rects.append([Rect2(x + i * (sz + gap), y, sz, sz), i])
	return 5 * (sz + gap) - gap

# ── 队伍状态条（bui.js renderCards + bui-compact + 布局 v4 覆盖；实测见 docs/specs/layout/battle-ye.json）──
# 卡：top6 right44 宽206 高54 间距2；当前行动者左移 10（compact .cur translateX(-10px) 优先级高于 v4 的 transform:none）。
# .inf left26 right8 top2 bottom3，子项水平居中（compact 留下的 align-items:center）：
#   名字行 16 高：名字 15px + 5 枚 8px 铜钱（gap1）；
#   血/内两行（column-reverse）：数字在上、毛笔线在下，线宽 = 数字宽；左侧 18px 处写「血」「内」（12px/14px）。
const STAT := {"防御": ["防", "#2f5f8a"], "护主": ["护", "#2f7a55"], "定神": ["定", "#a8781a"], "眩晕": ["晕", "#6a3a9a"], "中毒": ["毒", "#2f7a3a"], "倒下": ["倒", "#5a1a10"]}

func _draw_cards(now: float) -> void:
	var B = bt.B
	_card_rects = []
	for i in B.allies.size():
		var u: Dictionary = B.allies[i]
		var cur: bool = is_same(B.cur, u)
		var r := Rect2(W - 44 - 206 - (10.0 if cur else 0.0), 6 + i * 56, 206, 54)
		_card_rects.append([r, u])
		var tg: bool = B.tgtList != null and bt.rules.has(B.tgtList, u) and (B.tgtAll or is_same(B.tgtList[B.tsel], u))
		var dead: bool = u.hp <= 0
		# ::before 背景：270deg 线性渐变（右深左透）
		var ink := Color(6 / 255.0, 4 / 255.0, 10 / 255.0)
		if tg: Paint.grad(self, r, [[0.0, Color(20 / 255.0, 60 / 255.0, 36 / 255.0, 0)], [1.0, Color(20 / 255.0, 60 / 255.0, 36 / 255.0, 0.85)]], true)
		elif cur: Paint.grad(self, r, [[0.0, Color(40 / 255.0, 26 / 255.0, 8 / 255.0, 0)], [0.4, Color(40 / 255.0, 26 / 255.0, 8 / 255.0, 0.6)], [1.0, Color(60 / 255.0, 40 / 255.0, 12 / 255.0, 0.85)]], true)
		else: Paint.grad(self, r, [[0.0, Color(ink, 0)], [0.45, Color(ink, 0.55)], [1.0, Color(ink, 0.78)]], true)
		if cur: draw_rect(Rect2(r.end.x - 2, r.position.y, 2, r.size.y), Color("#f0c878"))
		if teach.on and teach.focus_card == i: draw_rect(r.grow(3), Color("#f1d07b"), false, 2)
		# dead：grayscale(1) brightness(.62) → 文字与线条用灰度压暗
		var gk := 0.62 if dead else 1.0
		var cx := r.position.x + 26 + (206 - 26 - 8) / 2.0
		var top := r.position.y + 2
		# 名字 + 蓄势铜钱
		var ncol := _dg(Color("#ffe2a0") if cur else Color("#f2e4c4"), dead, gk)
		var nm := str(u.name)
		var nw := _tw(nm, 15, BD.fb())
		var rw := nw + 44
		var nx := cx - rw / 2
		_txt(nm, nx, top + 13, 15, ncol, BD.fb())
		var use: int = B.bpUse if cur else 0
		_pips(nx + nw, top + 4, int(u.get("bp", 0)), use, 8, 1.0, null, 1.0 if not dead else 0.62)
		# 血
		var low: bool = u.hp < u.mhp * 0.3
		_stat_line(cx, r.position.y + 17.5, "血", str(u.hp), "/" + str(u.mhp), 15, 11, _dg(Color("#ff8a6a") if low else Color("#f6dcc4"), dead, gk), _dg(Color("#b8ab90"), dead, gk), 3.0,
			float(u.hp) / u.mhp, float(u.get("gh", u.hp)) / u.mhp, "low" if low else "hp", gk)
		# 内
		_stat_line(cx, r.position.y + 36.5, "内", str(u.mp), "/" + str(u.mmp), 12, 10, _dg(Color("#a8d8e4"), dead, gk), _dg(Color("#90a8b4"), dead, gk), 2.0,
			float(u.mp) / maxf(1, u.mmp), -1.0, "mp", gk)
		# 状态印（.st left2 top4，竖排 18px 朱印）
		var sts := []
		if dead: sts.append(["倒下", 0])
		else:
			if u.get("defend"): sts.append(["防御", 0])
			if u.get("guardBy") != null and u.guardBy.hp > 0 and u.get("guardUntil", -1) >= B.round: sts.append(["护主", 0])
			if u.buffs.get("ding"): sts.append(["定神", u.buffs.ding])
			if u.get("stun"): sts.append(["眩晕", 0])
			if u.get("bleedN", 0) > 0: sts.append(["中毒", 0])
		for j in sts.size():
			var s: Array = STAT[sts[j][0]]
			BD.seal(self, s[0], r.position.x + 2, r.position.y + 4 + j * 20, 18, 18, Color(s[1]))
			if sts[j][1]: _txt(str(sts[j][1]), r.position.x + 21, r.position.y + 4 + j * 20 + 13, 11, Color("#f3d58e"))
		# 目标指针 .tp（left:-16 top:18，tpb 动画 0.6s 往复左移 4px）
		if tg: BD.pointer(self, Color("#8fe0a8"), r.position.x - 16 - 4 * absf(sin(now / 600.0 * PI / 2)), r.position.y + 18, 16, "r")

static func _dg(c: Color, dead: bool, k: float) -> Color:
	if not dead: return c
	var l := BD.lum(c) * k
	return Color(l, l, l, c.a)

## 一行数值：「血」标签在左（ln padding-left 18），数字 + 「/上限」在上，毛笔线（宽 = 数字宽）在下；整行以 cx 居中
func _stat_line(cx: float, y: float, lab: String, v: String, mx: String, vs: int, ms: int, vc: Color, mc: Color, bh: float, k: float, gk2: float, kind: String, dimk: float) -> void:
	var vw := _tw(v, vs, BD.fb()); var mw := _tw(mx, ms, BD.fb())
	var tw := vw + 1 + mw
	var x0 := cx - (18 + tw) / 2
	_txt(lab, x0, y + 11, 12, Color(Color("#d8cbb0") * Color(dimk, dimk, dimk, 1)))
	var bx := x0 + 18
	var by := y + roundf(vs * 0.85)
	_txt(v, bx, by, vs, vc, BD.fb())
	_txt(mx, bx + vw + 1, by, ms, mc, BD.fb())
	_bar(Rect2(bx, y + vs + 1, tw, bh), k, gk2, kind, dimk)

## 毛笔血线（buiBars(122)）：底轨 tr 拉满整条；实条与残血用同一张图按 162px 宽铺在左端、被条宽裁切（background-size:162px），
## 右端 7px 渐隐（mask linear-gradient）。
func _bar(r: Rect2, k: float, gk: float, kind: String, dimk := 1.0) -> void:
	var m := Color(dimk, dimk, dimk, 1)
	var t: Texture2D = Bui.tex("swash", BD.bar_args("tr"))
	if t: draw_texture_rect(t, r, false, m)
	if gk > k: _bar_fill(r, clampf(gk, 0, 1), "gh", m)
	_bar_fill(r, clampf(k, 0, 1), kind, m)

func _bar_fill(r: Rect2, k: float, kind: String, m: Color) -> void:
	var w := r.size.x * k
	if w <= 0: return
	var t: Texture2D = Bui.tex("swash", BD.bar_args(kind))
	if t == null: draw_rect(Rect2(r.position, Vector2(w, r.size.y)), Color("#d63a22")); return
	var ts := t.get_size()
	var fx := ts.x / 162.0
	var solid := maxf(0, w - 7)
	if solid > 0: draw_texture_rect_region(t, Rect2(r.position, Vector2(solid, r.size.y)), Rect2(0, 0, solid * fx, ts.y), m)
	var x := solid
	while x < w:
		var sw := minf(1.0, w - x)
		var a := 1.0 - (x - (w - 7)) / 7.0 if w > 7 else 1.0
		draw_texture_rect_region(t, Rect2(r.position.x + x, r.position.y, sw, r.size.y), Rect2(x * fx, 0, sw * fx, ts.y), Color(m, clampf(a, 0, 1)))
		x += sw

# ── 说明条（#bt-hint：top82 居中，ink 墨带 padding 5px 34px，14px）──
func _draw_hint() -> void:
	if _hint == null: return
	var segs: Array = _hint if _hint is Array else [[_hint, Color("#f0e2c4"), 14]]
	var tw := 0.0
	for s in segs:
		if s.size() > 4 and s[4] is Array: tw += 20 * s[4].size()
		else: tw += _tw(str(s[0]), s[2] if s.size() > 2 else 14, s[3] if s.size() > 3 else null)
	var teaching: bool = teach.on
	var maxw := 870.0 - 68
	var lines := 1
	if teaching and tw > maxw: lines = ceili(tw / maxw)
	var w := minf(tw, maxw) + 68; var h := (22.0 if teaching else 24.0) * lines + 10
	var x := W / 2 - w / 2; var y := 82.0
	BD.sw(self, BD.SW_HINT, Rect2(x, y, w, h))
	var cx := x + 34; var by := y + 5 + 17; var lx := cx
	for s in segs:
		var sz: int = s[2] if s.size() > 2 else 14
		var f: Font = s[3] if s.size() > 3 else null
		var col: Color = s[1]
		if s.size() > 4 and s[4] is String and s[4] == "blink": col.a = 0.45 + 0.55 * (0.5 + 0.5 * sin(bt.pn() / 350.0 * PI))
		if s.size() > 4 and s[4] is Array:
			for wk in s[4]:
				BD.icon(self, wk, lx, by - 14, 18); lx += 20
			continue
		for ch in str(s[0]):
			var cw := _tw(ch, sz, f)
			if lines > 1 and lx + cw > cx + maxw: lx = cx; by += 22
			_txt(ch, lx, by, sz, col, f); lx += cw

# ── 指令菜单（#bt-cmd，ink 主题 + bui-compact：宽 140、表头 23、行高 21、选中左移 7、蓄势栏 27）──
## rows：[{label,val,ico:[类型…] 或 item:键, right, right_col, why, dis, desc}]；cb：{pick(i,src), hover(i), bp(d), pip(i)}
func show_menu(u: Dictionary, title: String, rows: Array, sel: int, ft: bool, cb: Dictionary) -> void:
	var opening: bool = cmd == null
	cmd = {"u": u, "title": title, "rows": rows, "sel": sel, "ft": ft, "cb": cb, "t0": bt.pn() if opening else (cmd.t0 if cmd else bt.pn())}
	_fit_cmd()

func _cmd_dims() -> Vector2:
	var teaching: bool = teach.on
	var w := 220.0 if teaching else 140.0
	var rh := 27.0 if teaching else 21.0
	var h: float = 23 + 1 + cmd.rows.size() * rh + (29.0 if cmd.ft else 0.0)
	return Vector2(w, h)

## bui.js allyTurn 覆盖版 fit：右侧 / 左侧 / 头顶三个候选，按遮挡评分取最小（同分优先右侧）
func _fit_cmd() -> void:
	var B = bt.B
	if cmd == null or B == null: return
	var u: Dictionary = cmd.u
	var d := _cmd_dims(); var w := d.x; var h := d.y
	var uh: float = bt.rules.unit_h(u)
	var p0: Vector2 = bt.cam.to_screen(u.x, u.y)
	var ux := p0.x; var uy := p0.y
	var cands := [[ux + uh * 0.26 + 8, uy - uh * 0.95], [ux - uh * 0.26 - 8 - w, uy - uh * 0.95], [ux - w * 0.5, uy - uh - h - 8]]
	var sr := Rect2(W - 44 - 206, 6, 206, B.allies.size() * 56 - 2)
	var best := Vector2(cands[0][0], cands[0][1]); var bs := 1e12
	for i in cands.size():
		var x0 := clampf(cands[i][0], 8, 952 - w); var y0 := clampf(cands[i][1], 70, 540 - 8 - h)
		var a := Rect2(x0, y0, w, h)
		var sc := i * 50.0
		for v in B.units:
			if is_same(v, u) or v.hp <= 0: continue
			var vh: float = bt.rules.unit_h(v); var vw := vh * 0.5
			var vp: Vector2 = bt.cam.to_screen(v.x, v.y)
			sc += _ov(a, Rect2(vp.x - vw / 2, vp.y - vh, vw, vh)) * (3.0 if v.side == "ally" else 1.0)
		sc += _ov(a, sr) * 2
		sc += _ov(a, Rect2(ux - uh * 0.25, uy - uh, uh * 0.5, uh)) * 4
		if sc < bs: bs = sc; best = Vector2(x0, y0)
	cmd.x = roundf(best.x); cmd.y = roundf(best.y); cmd.w = w

static func _ov(a: Rect2, b: Rect2) -> float:
	var r := a.intersection(b)
	return r.get_area() if a.intersects(b) else 0.0

func _draw_cmd(now: float) -> void:
	_row_rects = []; _pip_rects = []; _btn_rects = {}
	if cmd == null: return
	_fit_cmd()
	var B = bt.B
	var u: Dictionary = cmd.u
	var teaching: bool = teach.on
	var d := _cmd_dims(); var w := d.x
	var rh := 27.0 if teaching else 21.0
	var e: float = now - cmd.t0
	var k := clampf(e / 220.0, 0, 1)
	var ox: float = 14 * (1 - k); var a := k
	var x: float = cmd.x + ox; var y: float = cmd.y
	# 表头：深红墨带，名字 14px + 标题 11px
	BD.sw(self, BD.SW_HD, Rect2(x, y, w, 23), a)
	_txt(str(u.name), x + 14, y + 16, 14, Color("#f6e0b0", a), BD.fb())
	var tt: String = cmd.title
	_txt(tt, x + w - 7 - _tw(tt, 11, BD.fb()), y + 16, 11, Color("#e0b8a0", a), BD.fb(), false)
	y += 24
	for i in cmd.rows.size():
		var r: Dictionary = cmd.rows[i]
		var sel: bool = i == cmd.sel
		var rx := x - (7.0 if sel else 0.0)
		var rr := Rect2(rx, y, w, rh)
		_row_rects.append([Rect2(x - 7, y, w + 7, rh), i])
		# .row 背景 var(--sw) = swRow(i%4)；选中换 swSel（bui.js 428、302）
		BD.sw(self, BD.SW_SEL if sel else BD.sw_row(i % 4), rr, a)
		if teaching and teach.focus_row == i: draw_rect(rr.grow(3), Color("#f1d07b", a), false, 2)
		var dis: bool = r.get("dis", false)
		var col := Color("#6d5f4b") if dis else (Color("#ffe6a8") if sel else Color("#e8d8b8"))
		var mid := y + rh / 2
		if sel: BD.pointer(self, Color("#e0402a"), rx + 1, mid - 8, 16, "r")
		var cx := rx + 14
		if i < 9: _txt(str(i + 1), cx, mid + 4, 9, Color(col, 0.7 * a), null, false)
		cx += 8 + 4
		var icw := 0.0
		for ic in r.get("ico", []):
			BD.icon(self, ic, cx + icw, mid - 9, 18, dis); icw += 19
		if r.has("item"): BD.item_icon(self, str(r.item), cx, mid - 9, 18, dis); icw = 19
		cx += maxf(18, icw - 1) + 4
		var lsz := 15 if teaching else 13
		var right: String = str(r.get("right", ""))
		var rw := _tw(right, 10) if right != "" else 0.0
		var lw := _txt(str(r.label), cx, mid + 5, lsz, Color(col, a), BD.fb())
		if r.get("why", "") != "": _txt(str(r.why), cx + lw + 2, mid + 4, 10, Color("#e0806a", a), null, false)
		if right != "":
			var rc: Color = r.get("right_col", Color("#b8a888"))
			_txt(right, rx + w - 7 - rw, mid + 4, 10, Color(rc, a))
		y += rh
	if cmd.ft:
		y += 2
		var fr := Rect2(x, y, w, 27)
		BD.sw(self, BD.sw_row(4), fr, a)
		var fx := x + 14; var mid2 := y + 13.5
		_btn(fx, mid2 - 8.5, "Q", "bm"); fx += 17 + 3
		var pw := _pips(fx, mid2 - 5, int(u.bp), int(B.bpUse), 10, 1, _pip_rects); fx += pw + 3
		_btn(fx, mid2 - 8.5, "E", "bp")
		var n := str(B.bpUse)
		_txt(n, x + w - 7 - _tw(n, 13, BD.fb()), mid2 + 5, 13, Color("#ffcf73", a), BD.fb())

func _btn(x: float, y: float, s: String, key: String) -> void:
	var c := Vector2(x + 8.5, y + 8.5)
	draw_circle(c, 8.5, Color("#7a6344")); draw_circle(c, 7.5, Color("#20150d"))
	_txt(s, c.x - _tw(s, 11) / 2, c.y + 4, 11, Color("#f3d58e"), null, false)
	_btn_rects[key] = Rect2(x, y, 17, 17)

# ── 智能自动战斗按钮（battle-auto.js #bt-auto：right44 bottom18 min-width150 padding 9×16，16px）──
func set_auto(show: bool, on: bool) -> void:
	auto_btn.show = show; auto_btn.on = on
	auto_btn.text = "暂停自动 · 手动接管" if on else "智能自动战斗"

func _auto_rect() -> Rect2:
	var w := maxf(150, _tw(auto_btn.text, 16) * 1.0 + auto_btn.text.length() * 16 * 0.08 + 32)
	var h := 16 + 18.0 + 2
	return Rect2(W - 44 - w, H - 18 - h, w, h)

func _draw_auto() -> void:
	if not auto_btn.show: return
	var r := _auto_rect()
	var hov := r.has_point(get_local_mouse_position())
	var on: bool = auto_btn.on
	if on: Paint.grad(self, r, [[0.0, Color(0x50 / 255.0, 0x35 / 255.0, 0x1d / 255.0, 0.92)], [1.0, Color(0x1c / 255.0, 0x17 / 255.0, 0x14 / 255.0, 0.96)]], true)
	else: Paint.grad(self, r, [[0.0, Color(30 / 255.0, 23 / 255.0, 16 / 255.0, 0.96)], [1.0, Color(8 / 255.0, 8 / 255.0, 12 / 255.0, 0.92)]], true)
	draw_rect(r.grow(-1.5), Color("#30281d"), false, 2)
	draw_rect(r, Color("#d9ac57") if on else (Color("#eac582") if hov else Color("#967746")), false, 1)
	var col := Color("#ffe1a0") if on else (Color("#ffe5ad") if hov else Color("#e9d8b4"))
	var f := Paint.font(BD.fs(), 16, 0.08)
	var tw := f.get_string_size(auto_btn.text, HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x
	draw_string(f, Vector2(r.position.x + (r.size.x - tw) / 2, r.position.y + 24), auto_btn.text, HORIZONTAL_ALIGNMENT_LEFT, -1, 16, col)

# ── 教学指引（prologue-story-battle.js：#bt-teaching-guide left18 top132 宽360；#bt-teaching-toggle left18 top92；#bt-teaching-target）──
func teach_mount() -> void:
	teach.on = true; teach.toggle = "关闭指引"
func teach_clear() -> void:
	teach = {"on": false, "guide": null, "toggle": "关闭指引", "target": null, "focus_row": -1, "focus_card": -1}
## guide = {title, text} 或 null；target = 单位或 null
func teach_show(guide, target, visible: bool) -> void:
	teach.guide = guide if visible else null
	teach.target = target if visible else null

func _toggle_rect() -> Rect2:
	return Rect2(18, 92, _tw(teach.toggle, 13) + 20 + 2, 13 + 10 + 6)

func _draw_teach(_now: float) -> void:
	if not teach.on: return
	var tr := _toggle_rect()
	draw_rect(tr, Color(19 / 255.0, 24 / 255.0, 22 / 255.0, 0.82)); draw_rect(tr, Color("#8d7b58"), false, 1)
	_txt(teach.toggle, tr.position.x + 11, tr.position.y + 19, 13, Color("#e7d5b3"), null, false)
	if teach.guide != null:
		var g: Dictionary = teach.guide
		var lines := _wrap(str(g.text), 15, 360 - 32 - 2)
		var h := 12 + 24 + 4 + lines.size() * 24 + 12 + 2.0
		var r := Rect2(18, 132, 360, h)
		draw_rect(r, Color(19 / 255.0, 24 / 255.0, 22 / 255.0, 0.91)); draw_rect(r, Color("#bfa16b"), false, 1)
		_txt(str(g.title), r.position.x + 17, r.position.y + 13 + 18, 17, Color("#f1d07b"), null, false)
		var y := r.position.y + 13 + 28 + 17
		for l in lines:
			_txt(l, r.position.x + 17, y, 15, Color("#fff0ca"), null, false); y += 24
	if teach.target != null and bt.B != null:
		var t: Dictionary = teach.target
		var h2: float = bt.rules.unit_h(t); var half := maxf(40, h2 * 0.32)
		var a: Vector2 = bt.cam.to_screen(t.x - half, t.y - h2); var b: Vector2 = bt.cam.to_screen(t.x + half, t.y + 30)
		var rr := Rect2(a, b - a)
		draw_rect(rr.grow(4), Color(0xf1 / 255.0, 0xd0 / 255.0, 0x7b / 255.0, 0.15), false, 6)
		draw_rect(rr, Color("#f1d07b"), false, 2)

func _wrap(s: String, sz: int, maxw: float) -> Array:
	var out := []; var line := ""
	for ch in s:
		if _tw(line + ch, sz) > maxw: out.append(line); line = ch
		else: line += ch
	if line != "": out.append(line)
	return out

# ── 胜利结算（bui.js victory 后半：#bt-win 宣纸卷轴 宽372，padding 16/30/14；「胜」92px +「大捷」朱印盖章；三行 + 同伴 + 突破）──
signal win_closed
func show_win(growth: Dictionary, sil: int, drops: Dictionary) -> void:
	var S: Dictionary = G.S
	var rows := []
	var cap: bool = int(S.get("lv", 1)) >= Stats.CHARACTER_LEVEL_CAP
	rows.append({"ico": ["修", "#6ccf8a"], "k": "修为 · 历练领悟", "cnt": 0 if cap else int(growth.hero.amount), "pre": "+", "suf": "", "fixed": "已满级" if cap else ""})
	rows.append({"ico": ["钱", "#c8d0dc"], "k": "铜钱", "cnt": sil, "pre": "+", "suf": " 文", "fixed": ""})
	var dr := []
	for k in drops: dr.append(str(Stats.item(k).get("name", k)) + "×" + str(drops[k]))
	rows.append({"ico": ["物", "#d9b36c"], "k": "战利品", "fixed": "、".join(dr) if dr.size() else "—", "items": drops})
	var pdef = DB.g("PARTY_DEF")
	for row in growth.mates:
		var nm: String = str(pdef.get(row.id, {}).get("name", row.id)) if pdef is Dictionary else str(row.id)
		rows.append({"k": nm, "fixed": "修为 +%d%s" % [row.amount, " · 共同研习" if row.factor > 1 else ""]})
	win = {"rows": rows, "lv": growth.hero.levels, "t0": bt.pn()}
	await bt.wait(350)
	var B = bt.B
	B.click = func(_x, _y): win_closed.emit()
	var kf := func(k: String): if k == "ok" or k == "back" or k == "click": win_closed.emit()
	bt.any_key.connect(kf)
	await win_closed
	bt.any_key.disconnect(kf)
	if bt.B: bt.B.click = Callable()
	bt.sfx("select")
	win = null

func _draw_win(now: float) -> void:
	var e: float = now - win.t0
	var rows: Array = win.rows
	var w := 372.0
	var h: float = 16 + 92 + 4 + rows.size() * 34.0 + win.lv.size() * 40.0 + 8 + 18 + 14
	var x := W / 2 - w / 2; var y := H / 2 - h / 2
	# 展开：.45s 从中线向上下展开
	var k := clampf(e / 450.0, 0, 1)
	var vis := h * k
	var cy := y + h / 2
	var clip := Rect2(x - 20, cy - vis / 2 - 10, w + 40, vis + 20)
	# box-shadow 0 12px 30px rgba(0,0,0,.65) 近似为偏移暗块；宣纸 papW 拉满（background 100% 100%），按展开裁切
	var pr := Rect2(x, y, w, h)
	var sh := Rect2(x + 4, y + 12, w, h).intersection(clip)
	if sh.size.y > 0: draw_rect(sh, Color(0, 0, 0, 0.35))
	var vr := pr.intersection(clip)
	if vr.size.y > 0:
		BD.bui_region(self, "paper", BD.PAP_W, vr, Rect2((vr.position - pr.position) / pr.size, vr.size / pr.size))
	# ::before / ::after 木轴 rodW（left/right -16，高 16，上下各 -8），drop-shadow 0 3px 3px
	for ry in [cy - vis / 2 - 8, cy + vis / 2 - 8]:
		var rr := Rect2(x - 16, ry, w + 32, 16)
		BD.bui(self, "rod", BD.ROD_W, Rect2(rr.position + Vector2(0, 3), rr.size), 0.45)
		BD.bui(self, "rod", BD.ROD_W, rr)
	if k < 1: return
	var yy := y + 16
	# 「胜」
	var f := BD.fb()
	var tw := _tw("胜", 92, f)
	draw_string(f, Vector2(W / 2 - tw / 2, yy + 78), "胜", HORIZONTAL_ALIGNMENT_LEFT, -1, 92, Color("#140a05"))
	if e > 350:
		var q := clampf((e - 350) / 350.0, 0, 1)
		var s := 1.8 - 0.8 * (1 - pow(1 - q, 3))
		draw_set_transform(Vector2(x + w - 30 - 62 - 15, yy + 14 + 15), deg_to_rad(6), Vector2(s, s))
		BD.seal_r(self, "大捷", 30, 30, BD.CINNABAR, Rect2(-15, -15, 30, 30), q)
		draw_set_transform(Vector2.ZERO)
	yy += 96
	var rk := clampf(e / 500.0, 0, 1)
	for r in rows:
		var lx := x + 30 + 4
		var mid := yy + 17
		if r.has("ico"): BD.blot_o(self, str(r.ico[0]), str(r.ico[1]), lx, mid - 11, 22); lx += 30
		_txt(str(r.k), lx, mid + 6, 18, Color("#3a2412"), f, false)
		var val: String
		if r.get("fixed", "") != "": val = str(r.fixed)
		else: val = str(r.pre) + str(roundi(r.cnt * rk)) + str(r.suf)
		if r.has("items") and val != "—":
			# bui.js renderWin：每件 .it = buiItem(k,24) + 名称×数，gap 2px，13px；整行右对齐（inline-flex 之间按空白约 4px）
			var parts: Array = []
			var tot := 0.0
			for ik in r.items:
				var nm := str(Stats.item(ik).get("name", ik)) + "×" + str(r.items[ik])
				parts.append([str(ik), nm]); tot += 24 + 2 + _tw(nm, 13) + 4
			var ix := x + w - 34 - (tot - 4)
			for pt in parts:
				BD.item_icon(self, pt[0], ix, mid - 12, 24)
				ix += 26
				ix += _txt(pt[1], ix, mid + 5, 13, Color("#1a0f08"), null, false) + 4
		else:
			var vs := 19
			_txt(val, x + w - 34 - _tw(val, vs, f), mid + 6, vs, Color("#1a0f08"), f, false)
		Paint.fade_line(self, x + 34, x + w - 34, yy + 33, Color(60 / 255.0, 36 / 255.0, 18 / 255.0, 0.45), 1.0, 0.1)
		yy += 34
	for l in win.lv:
		var lr := Rect2(x + 30 - 12, yy + 8, w - 60 + 24, 32)
		BD.sw(self, BD.SW_LV, lr)
		var s1 := "境界突破 · 第 %d 层" % l; var s2 := "属性点 +3"
		var w1 := _tw(s1, 20, f) + 6 + _tw(s2, 12)
		var sx := W / 2 - w1 / 2
		sx += _txt(s1, sx, lr.position.y + 23, 20, Color("#fff0d8"), f) + 6
		_txt(s2, sx, lr.position.y + 22, 12, Color("#ffe0c0"))
		yy += 40
	var go := "点击或按 Enter 继续"
	_txt(go, W / 2 - _tw(go, 12) / 2, yy + 8 + 13, 12, Color("#6a5236", 0.45 + 0.55 * (0.5 + 0.5 * sin(now / 700.0 * PI))), null, false)

# ── 鼠标（DOM 元素先于画布拦截：卡片、菜单行、铜钱、按钮、自动、指引开关）──
func _input(ev: InputEvent) -> void:
	if bt == null or bt.B == null or win != null: return
	var B = bt.B
	if ev is InputEventMouseMotion:
		var p := _local(ev.position)
		if cmd != null:
			for rr in _row_rects:
				if rr[0].has_point(p):
					if rr[1] != cmd.sel and cmd.cb.has("hover"): cmd.cb.hover.call(rr[1])
					break
		return
	if not (ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT): return
	var p2 := _local(ev.position)
	var hit := false
	if auto_btn.show and _auto_rect().has_point(p2): bt.auto.toggle(); hit = true
	elif teach.on and _toggle_rect().has_point(p2):
		var L = B.opt.get("storyLesson")
		if L: L.toggle_guidance()
		hit = true
	elif cmd != null:
		for key in _btn_rects:
			if _btn_rects[key].has_point(p2): cmd.cb.bp.call(-1 if key == "bm" else 1); hit = true
		if not hit:
			for pr in _pip_rects:
				if pr[0].has_point(p2): cmd.cb.pip.call(pr[1]); hit = true; break
		if not hit:
			for rr in _row_rects:
				if rr[0].has_point(p2): cmd.cb.pick.call(rr[1], "mouse"); hit = true; break
	if not hit:
		for cr in _card_rects:
			if cr[0].has_point(p2):
				hit = true
				if B.tgtList != null and bt.rules.has(B.tgtList, cr[1]) and B.pickCard.is_valid(): B.pickCard.call(cr[1])
				break
	if hit: get_viewport().set_input_as_handled()

## 视口坐标 → 本层 960 坐标（CanvasLayer 无变换，视口即 960×540 基准）
func _local(p: Vector2) -> Vector2:
	return get_global_transform_with_canvas().affine_inverse() * p
