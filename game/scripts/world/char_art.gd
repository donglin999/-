extends Node
## 人物帧表（对应原版 core.js 的 sliceSheets/WALK/RUN/IDLE/FIDGET 与 scene.js 的 drawChar）
## 帧的切片坐标、轮廓（charBounds）都由工具离线导出：data/runtime/img.json、bounds.json、reg.json、art.json。

const CYCLE4 := [1, 2, 3, 2]
const SIZE := {"hero": 1, "monk": 1.02, "soldier": 1, "gossip": 1, "oldman": .98, "smith": 1.03, "lady": 1, "beggar": 1, "boatman": 1, "bandit": 1, "chief": 1.07,
	"villager": 1, "child": .75, "merchant": 1, "dog": .6, "rooster": .5, "snake": .8, "wolf": .7, "suzhi": 1, "ye": 1, "liu": 1.02, "zhou": 1, "langli": 1}

var ART := {}
var IMG := {}          # 键 → {sheet,r} 或 {src,w,h}
var BOUNDS := {}
var REG := {}          # WALK/RUN/IDLE/FIDGET
var OPT_CHARS := ["suzhi"]
var still := {}

func _ready() -> void:
	ART = Data.json("res://data/runtime/art.json")
	IMG = Data.json("res://data/runtime/img.json")
	BOUNDS = Data.json("res://data/runtime/bounds.json")
	REG = Data.json("res://data/runtime/reg.json")

func scale_of(k: String) -> float:
	var a = ART.scale.get(k)
	if a: return float(a)
	return float(SIZE.get(k, 1))

func frames_of(k: String) -> int:
	return int(ART.frames.get(k, 0))

## 图片键是否存在（对应 ok(IMG[key])；贴图未下载完时也算不在）
func has_img(key: String) -> bool:
	return IMG.has(key)

## 取帧：返回 [Texture2D, Rect2 源矩形, 键]；贴图还没就绪返回 null
func frame(key: String):
	var e = IMG.get(key)
	if e == null: return null
	var path: String = e.get("sheet", e.get("src", ""))
	var t := Assets.tex_ready(path)
	if t == null: return null
	if e.has("r"):
		return [t, Rect2(e.r[0], e.r[1], e.r[2], e.r[3]), key]
	return [t, Rect2(0, 0, t.get_width(), t.get_height()), key]

## 预载一组角色的全部表（进场前调用，避免绘制时缺帧）
func sheet_paths(chars: Array) -> Array:
	var out := {}
	for k in IMG:
		var parts: PackedStringArray = k.split("_", false, 1)
		if parts.size() < 2: continue
		for c in chars:
			if parts[1].begins_with(c + "_"):
				var e = IMG[k]
				out[e.get("sheet", e.get("src", ""))] = true
	return out.keys()

func _char_img(k: String, dir: String, f: int):
	var n := frames_of(k)
	if n > 0:
		var im = frame("c_%s_%s_%d" % [k, dir, f if f < n else 0])
		if im != null: return im
		var i0 = frame("c_%s_%s_0" % [k, dir])
		if i0 != null: return i0
	return frame("c_%s_%s" % [k, dir])

func _reg_frame(pre: String, k: String, dir: String, fi: int) -> Array:
	var im = frame("%s_%s_%s_%d" % [pre, k, dir, fi])
	if im != null: return [im, false]
	if dir == "l" or dir == "r":
		im = frame("%s_%s_%s_%d" % [pre, k, "r" if dir == "l" else "l", fi])
		if im != null: return [im, true]
	return []

## 画人物（ci 为 CanvasItem，当前变换为世界坐标）。opts: h, moving, running, ph, noShadow, alpha
func draw_char(ci: CanvasItem, sp: String, x: float, y: float, dir: String, walk: float, t: float, opts: Dictionary = {}) -> void:
	var k := sp.trim_prefix("c_")
	var h: float = opts.get("h", 0.0) if opts.get("h") else 92.0 * scale_of(k)
	var n := frames_of(k)
	var moving: bool = opts.get("moving", walk > 0)
	var alpha: float = opts.get("alpha", 1.0)
	var im = null; var flip := false
	var R: Dictionary = REG.RUN.get(k, {}) if opts.get("running") else {}
	var Wk: Dictionary = R if not R.is_empty() else REG.WALK.get(k, {})
	var pre := "r" if not R.is_empty() else "w"
	var st := 0.0
	if not Wk.is_empty():
		st = (Wk.stride if Wk.get("stride") else (0.24 if not R.is_empty() else 0.16)) * (1.2 if (opts.get("running") and R.is_empty()) else 1.0)
	if moving and not Wk.is_empty() and Wk.order.size():
		var i := int(floor(walk / (h * st)))
		var wf: int = Wk.order[i % Wk.order.size()]
		var got = _reg_frame(pre, k, dir, wf)
		if not got.is_empty(): im = got[0]; flip = got[1]
	if moving or not still.has(k): still[k] = t
	var F: Dictionary = REG.FIDGET.get(k, {})
	if not moving and not F.is_empty() and F.order.size():
		var ms: Array = F.ms if F.get("ms") else F.order.map(func(_x): return 120)
		var D := 0.0
		for v in ms: D += v
		var A: float = F.after if F.get("after") else 6000.0
		var Gp: float = F.gap if F.get("gap") else 9000.0
		var stt: float = t - still[k]
		if stt >= A:
			var phs: float = fmod(stt - A, D + Gp)
			if phs < D:
				var j := 0
				while j < ms.size() - 1 and phs >= ms[j]:
					phs -= ms[j]; j += 1
				var got2 = _reg_frame("f", k, dir, F.order[j % F.order.size()])
				if not got2.is_empty(): im = got2[0]; flip = got2[1]
	var I: Dictionary = REG.IDLE.get(k, {})
	if im == null and not moving and not I.is_empty() and I.order.size():
		var ms2: Array = I.ms if I.get("ms") else [200]
		var T := 0.0
		for v in ms2: T += v
		var tt: float = fposmod(t + float(opts.get("ph", 0.0)) * 400, T)
		var j2 := 0
		while j2 < ms2.size() - 1 and tt >= ms2[j2]:
			tt -= ms2[j2]; j2 += 1
		var got3 = _reg_frame("i", k, dir, I.order[j2 % I.order.size()])
		if not got3.is_empty(): im = got3[0]; flip = got3[1]
	if im == null:
		var f := 0
		if moving and n > 1:
			var i2 := int(floor(walk / (h * 0.17)))
			f = CYCLE4[i2 & 3] if n == 4 else 1 + i2 % (n - 1)
		im = _char_img(k, dir, f); flip = false
		if im == null and (dir == "l" or dir == "r"):
			im = _char_img(k, "r" if dir == "l" else "l", f); flip = im != null
		if im == null: im = _char_img(k, "d", 0)
	if im == null: return
	var box = BOUNDS.get(im[2])
	var src: Rect2 = im[1]
	var iw := src.size.x; var ih := src.size.y
	var prone := k == "zhou"
	var bh: float = (box[1] - box[0]) if box != null else ih
	var upright: bool = box != null and bh > ih * 0.62 and not (k in ["dog", "wolf", "rooster", "snake"])
	var anchor = ART.get("motionAnchor", {}).get(k)
	var draw_h: float
	if anchor != null: draw_h = h * ih / anchor.body
	elif box != null and prone: draw_h = h * 1.02 * ih / max(1.0, box[3] - box[2])
	elif upright: draw_h = h * ih / bh
	else: draw_h = h
	var w := draw_h * iw / ih
	if not opts.get("noShadow"):
		var rx: float = draw_h * (box[3] - box[2]) / ih * 0.5 if (prone and box != null) else min(w * 0.42, h * 0.3)
		WorldDraw.ellipse(ci, Vector2(x, y), rx, h * 0.07, Color(0, 0, 0, 0.3 * alpha))
	var bob := 0.0; var sy := 1.0; var sx := 1.0
	if moving:
		if n <= 1 and Wk.is_empty():
			var ph2 := walk / (h * 0.1)
			bob = abs(sin(ph2)) * h * 0.035; sy = 1 + sin(ph2 * 2) * 0.015; sx = 1 / sy
	elif I.is_empty():
		var b := sin(t / 650 + float(opts.get("ph", 0.0)))
		sy = 1 + b * 0.012; sx = 1 - b * 0.005
	if flip: sx = -sx
	ci.draw_set_transform(Vector2(x, y), 0, Vector2(sx, sy))
	if moving and (k == "suzhi" or (k == "ye" and REG.WALK.get("ye", {}).is_empty())):
		_draw_legs(ci, k, dir, walk, h)
	var foot_pad := 0.0
	if anchor != null: foot_pad = (ih - anchor.foot) * draw_h / ih
	elif box != null: foot_pad = (ih - box[1]) * draw_h / ih
	var col := Color(1, 1, 1, alpha)
	if box != null and box[4] == 1:
		var sh: Rect2 = Rect2(src.position, Vector2(iw, box[1]))
		ci.draw_texture_rect_region(im[0], Rect2(-w / 2, -draw_h + foot_pad - bob, w, draw_h * box[1] / ih), sh, col)
	else:
		ci.draw_texture_rect_region(im[0], Rect2(-w / 2, -draw_h + foot_pad - bob, w, draw_h), src, col)
	ci.draw_set_transform(Vector2.ZERO)

func _draw_legs(ci: CanvasItem, k: String, dir: String, walk: float, h: float) -> void:
	var phase := int(floor(walk / (h * 0.23))) & 1
	var leg := h / 92.0
	var side := dir == "l" or dir == "r"
	var cloth := Color("#46443f") if k == "suzhi" else Color("#514b47")
	var boot := Color("#302d2e")
	var R := func(x, y, w, hh, c): ci.draw_rect(Rect2(x * leg, y * leg, w * leg, hh * leg), c)
	if side:
		var lead := (-1 if dir == "l" else 1) * (-1 if phase else 1)
		R.call(lead * 3 - 4, -18, 8, 8, cloth); R.call(lead * 7 - 3, -12, 7, 6, cloth); R.call(lead * 8 - 3, -8, 6, 6, cloth)
		R.call(-lead * 3 - 4, -17, 8, 7, cloth); R.call(-lead * 8 - 3, -12, 7, 5, cloth)
		R.call(lead * 8 - 4, -4, 8, 4, boot); R.call(lead * 8 - 6, -3, 12, 3, boot); R.call(-lead * 11 - 4, -9, 9, 3, boot)
	else:
		var lead2 := -1 if phase else 1
		R.call(lead2 * 6 - 4, -18, 8, 18, cloth); R.call(-lead2 * 6 - 4, -17, 8, 10, cloth)
		R.call(lead2 * 6 - 5, -4, 10, 4, boot); R.call(-lead2 * 6 - 5, -9, 10, 3, boot)
