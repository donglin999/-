extends RefCounted
## 原版 js/faction-fx/wuxia-fx.js 的 class Atlas 与形状函数 SH（只移植交锋三招实际用到的：glow、star、bake + SH.shard / SH.slash）。
## 原版 paint() 逐像素写不透明色到小 canvas；这里写进 Image 再转 ImageTexture，按同样的键缓存。
## 未移植：SH.arc / leaf / sword、Atlas.smoke / ring / cloud / mountain / peak（交锋三招与 am_s1/am_s2 都不走到；ring 仅 BP≥2 的 ripple 用到，交锋 bp 恒为 0）。

const U := preload("res://scripts/battle/fx_util.gd")
const ANG := 48

var cache := {}

## 原版 Atlas.get(key, make)
func get_or(key: String, make: Callable) -> Dictionary:
	var s = cache.get(key)
	if s == null:
		s = make.call(); cache[key] = s
	return s

## 原版 paint(w,h,fn)：fn(set) 里调用 set.call(px,py,color)；越界忽略
static func paint(w: int, h: int, fn: Callable) -> ImageTexture:
	w = maxi(1, w); h = maxi(1, h)
	var im := Image.create(w, h, false, Image.FORMAT_RGBA8)
	var setter := func(px: int, py: int, col: Color) -> void:
		if px < 0 or py < 0 or px >= w or py >= h: return
		im.set_pixel(px, py, col)
	fn.call(setter)
	return ImageTexture.create_from_image(im)

## 原版 Atlas.bake(key,ramp,e,ang,fn)：预旋转烘焙，角度量化到 48 个方向；fn(lx,ly,X,Y) 返回色阶 0–5 或 -1
func bake(key: String, ramp: Array, ramp_name: String, e: float, ang: float, fn: Callable) -> Dictionary:
	var b := ((U.jround(ang / TAU * ANG) % ANG) + ANG) % ANG
	return get_or(key + "|" + ramp_name + "@" + str(b), func() -> Dictionary:
		var a := float(b) / ANG * TAU
		var c := cos(a); var s := sin(a)
		var S := int(ceil(e)) * 2 + 3
		var h := S >> 1
		var tex := paint(S, S, func(set_px: Callable) -> void:
			for Y in S:
				for X in S:
					var px := X - h; var py := Y - h
					var t: int = fn.call(px * c + py * s, -px * s + py * c, X, Y)
					if t >= 0: set_px.call(X, Y, ramp[t]))
		return {"tex": tex, "ax": h, "ay": h})

## 原版 Atlas.glow(ramp,r)：抖动圆形光团
func glow(ramp: Array, ramp_name: String, r: float) -> Dictionary:
	var ri := maxi(2, U.jround(r))
	return get_or("glow" + ramp_name + str(ri), func() -> Dictionary:
		var S := ri * 2 + 1
		var tex := paint(S, S, func(set_px: Callable) -> void:
			for y in S:
				for x in S:
					var d := Vector2(x - ri, y - ri).length() / ri
					if d >= 1: continue
					var v := pow(1 - d, 1.6)
					if v < U.dth(x, y) * 0.9: continue
					set_px.call(x, y, ramp[5 if v > 0.7 else 4 if v > 0.42 else 3 if v > 0.2 else 2]))
		return {"tex": tex, "ax": ri, "ay": ri})

## 原版 Atlas.star(ramp,s)：十字星芒＋斜向短芒＋（s≥4）中心白点
func star(ramp: Array, ramp_name: String, sv: float) -> Dictionary:
	var s := maxi(1, U.jround(sv))
	return get_or("star" + ramp_name + str(s), func() -> Dictionary:
		var S := s * 2 + 1
		var tex := paint(S, S, func(set_px: Callable) -> void:
			for i in range(-s, s + 1):
				var k := absf(i) / s
				var t := 5 if k < 0.25 else 4 if k < 0.6 else 3
				set_px.call(s + i, s, ramp[t]); set_px.call(s, s + i, ramp[t])
			var d := U.jround(s * 0.4)
			for i in range(1, d + 1):
				for ab in [[1, 1], [1, -1], [-1, 1], [-1, -1]]:
					set_px.call(s + ab[0] * i, s + ab[1] * i, ramp[4 if i < 2 else 2])
			if s >= 4:
				for ab in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
					set_px.call(s + ab[0], s + ab[1], ramp[5]))
		return {"tex": tex, "ax": s, "ay": s})

# ───────── 形状函数（原版 SH）：局部坐标朝 +x，返回色阶 0–5 或 -1 ─────────

## SH.shard(L,w)：菱形碎片
static func sh_shard(L: float, w: float) -> Callable:
	return func(lx: float, ly: float, _X: int, _Y: int) -> int:
		var v := absf(lx) / L + absf(ly) / w
		return 5 if v < 0.4 else 4 if v < 0.75 else 2 if v < 1 else -1

## SH.slash(L,w,gap,side)：两头尖的楔形剑痕，中心白芯、外侧暗描边；gap 中段留白；side 只取半截
static func sh_slash(L: float, w: float, gap := 0.0, side := 0) -> Callable:
	return func(lx: float, ly: float, _X: int, _Y: int) -> int:
		var u := lx / (L / 2)
		if absf(u) >= 1 or (gap != 0 and absf(u) < gap) or (side != 0 and u * side < 0): return -1
		var hw := w * pow(1 - u * u, 0.8)
		var f := absf(ly) / maxf(0.5, hw)
		if f > 1: return 1 if f < 1 + 1.2 / hw and hw > 1.8 else -1
		if f > 0.4 and U.hash2(U.jround(ly * 1.5), int(floor(lx / 5))) < 0.25 * f: return -1
		return 5 if f < 0.22 else 4 if f < 0.5 else 3 if f < 0.8 else 2
