extends RefCounted
## WuxiaFX 的共享表（原版 js/faction-fx/wuxia-fx.js 闭包里的 RAMP、IMG、SKILLS，以及 static load()、tinted()、WuxiaFX.define）。
## 原版所有 WuxiaFX 实例共用一份 IMG / SKILLS；这里用静态变量保存。

## 原版 window.QiheClashFxRoot（js/qihe-faction-clash-art.js 第 6 行）
const CLASH_FX_ROOT := "res://assets/production/fx/qihe-clash/"

## 六阶色带：0 描边暗 → 5 白芯（原版 RAMP；jiangqing/inkp/darkred/copper 由 fx-am.js、fx-qihe-clash-v2.js 补登记，这里一并写入）
const RAMP_HEX := {
	"jade": ["#0c2e2e", "#175450", "#2f8f7a", "#58c9a4", "#a6f0d2", "#effff8"],
	"sky": ["#121f3c", "#24497a", "#3f7fbf", "#78bfe8", "#c2eaff", "#ffffff"],
	"gold": ["#2e1608", "#7a4218", "#c47a26", "#eeb64e", "#ffe39a", "#fffbea"],
	"mist": ["#3d4f5c", "#6c8494", "#9db4c2", "#cddde5", "#eef6f8", "#ffffff"],
	"dust": ["#221e1c", "#3e3832", "#5e564c", "#857a6c", "#b0a492", "#d6cbb8"],
	"red": ["#3a0c10", "#7a1e22", "#b8352e", "#e05a4a", "#f59a7a", "#ffd0c0"],
	"white": ["#40506a", "#8a9ab8", "#c8d4ea", "#e8f0fa", "#f8fbff", "#ffffff"],
	"fire": ["#5a1606", "#9a2c14", "#d8482a", "#ff6a3d", "#ffb08a", "#fff0e6"],
	"frost": ["#0e2a44", "#1e4f78", "#4c94c8", "#8fd8ff", "#ccefff", "#ffffff"],
	"thunder": ["#3a1a5a", "#6a3a8a", "#c79a3a", "#ffe25a", "#fff0a8", "#fffbe8"],
	"wind": ["#0f3a2a", "#1f6a4c", "#3fae84", "#7fe3b5", "#c2f5dd", "#f2fff8"],
	"sun": ["#5a3200", "#8a5410", "#d89a32", "#ffc35a", "#ffe3a6", "#fffbea"],
	"yin": ["#24184a", "#43307a", "#7a62c8", "#b79cff", "#dccfff", "#f6f2ff"],
	"heal": ["#0e3a22", "#1f6a40", "#46b070", "#7fe0a0", "#c4f4d4", "#f2fff6"],
	"plain": ["#3a2a1a", "#6a5638", "#b8a888", "#fff3e0", "#fffaf0", "#ffffff"],
	# fx-am.js / fx-qihe-clash-v2.js
	"jiangqing": ["#1a0c1e", "#3a1a3a", "#2c5a78", "#4f9ab8", "#a8dcec", "#f0fbff"],
	"inkp": ["#0d0612", "#24102c", "#43204d", "#6a3a76", "#a675b0", "#e2cbe6"],
	"darkred": ["#160305", "#3a0a10", "#62161f", "#8c2733", "#b85660", "#e2a4a6"],
	"copper": ["#24100a", "#552a14", "#86481f", "#b9733a", "#e2a866", "#f7dcb2"],
}
## 异常状态颜色（原版 STC）
const STC := {"中毒": "#8BD45E", "流血": "#C8423A", "内伤": "#C98A4B", "封穴": "#6C7BFF", "眩晕": "#E0C0FF", "目眩": "#D9D9D9", "心乱": "#E58CD6", "惊惧": "#8FA3B8", "迟滞": "#9BB8B0"}

static var _ramp := {}
## 生成素材：id → {tex, w, h, add}
static var IMG := {}
## 招式编排：id → 定义字典（dur、budget、ramp、lead、hitAt、boost、noBoost、leadAura、group、side、set、init/update/draw 回调）
static var SKILLS := {}
## 持有各编排文件实例，保证回调 Callable 的对象存活
static var _owners := []

static func ramp(n: String) -> Array:
	if _ramp.is_empty():
		for k in RAMP_HEX: _ramp[k] = RAMP_HEX[k].map(func(h): return Color(h))
	return _ramp.get(n, _ramp.get("white"))

static func has_ramp(n: String) -> bool: return RAMP_HEX.has(n)

## 原版 WuxiaFX.define(id, def)：SKILLS[id]={set:'v4',...def}
static func define(id: String, def: Dictionary, owner = null) -> void:
	var d := {"set": "v4"}
	d.merge(def, true)
	SKILLS[id] = d
	if owner != null and not _owners.has(owner): _owners.append(owner)

## 原版 static async load(base)：读 manifest.json，逐项加载贴图；IMG[id]={img,w,h,add:blend==='add'}
static func load_dir(base: String) -> int:
	var f := FileAccess.open(base + "manifest.json", FileAccess.READ)
	if f == null: push_error("素材加载失败 " + base + "manifest.json"); return IMG.size()
	var m = JSON.parse_string(f.get_as_text())
	if typeof(m) != TYPE_DICTIONARY: push_error("素材清单格式错误 " + base); return IMG.size()
	for id in m:
		var e: Dictionary = m[id]
		var tex = load(base + str(e.file))
		if tex == null: push_error("素材加载失败 " + str(e.file)); continue
		IMG[id] = {"tex": tex, "w": float(e.w), "h": float(e.h), "add": str(e.get("blend", "")) == "add"}
	return IMG.size()

## 原版 tinted(id,ramp)：中性白光组件按素材亮度渐变映射到色带（0 描边暗 … 5 白芯），结果以 “id@色带” 缓存进 IMG
static func tinted(id: String, ramp_name: String) -> String:
	var key := id + "@" + ramp_name
	if IMG.has(key): return key
	var s = IMG.get(id)
	if s == null: return id
	var im: Image = s.tex.get_image()
	if im == null: return id
	im = im.duplicate()
	if im.is_compressed(): im.decompress()
	im.convert(Image.FORMAT_RGBA8)
	var R: Array = ramp(ramp_name if has_ramp(ramp_name) else "white")
	for y in im.get_height():
		for x in im.get_width():
			var c := im.get_pixel(x, y)
			var a8 := c.a8
			if a8 == 0: continue
			var v := minf(4.999, maxf(c.r8, maxf(c.g8, c.b8)) / 255.0 * sqrt(a8 / 255.0) * 5)
			var j := int(floor(v)); var fr := v - j
			var c0: Color = R[j]; var c1: Color = R[j + 1]
			var r8 := roundi(c0.r8 + (c1.r8 - c0.r8) * fr)
			var g8 := roundi(c0.g8 + (c1.g8 - c0.g8) * fr)
			var b8 := roundi(c0.b8 + (c1.b8 - c0.b8) * fr)
			im.set_pixel(x, y, Color8(r8, g8, b8, a8))
	IMG[key] = {"tex": ImageTexture.create_from_image(im), "w": s.w, "h": s.h, "add": s.add}
	return key
