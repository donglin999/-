class_name CuScenes
extends RefCounted
## 原版 js/qh-mode-cultivation-scenes.js（CultivationScenes）：剧情场景总表（地点＋时间 → 背景图、地点牌）。

const DIR := "assets/production/cultivation/"

static func TIMES() -> Dictionary: return CuDB.t("CultivationScenes").TIMES
static func PLACES() -> Dictionary: return CuDB.t("CultivationScenes").PLACES

static var _alias := {}
static func _aliases() -> Dictionary:
	if _alias.is_empty():
		var P := PLACES()
		for k in P:
			_alias[k] = k
			for a in P[k].aliases: _alias[a] = k
	return _alias

## 原版 placeKey(place)：对不上的地名归到庭院
static func placeKey(place) -> String:
	return _aliases().get(place, "courtyard") if place != null else "courtyard"

static func known(place) -> bool:
	return _aliases().has(place)

## 原版 resolve(scene,season)
static func resolve(scene, season = null) -> Dictionary:
	var key := placeKey(scene.get("place") if scene is Dictionary else null)
	var p: Dictionary = PLACES()[key]
	var t = scene.get("time") if scene is Dictionary else null
	var time: String = t if t != null and TIMES().has(t) else "day"
	var use := time if p.bg.has(time) else "day"
	var file: String = p.bg[use]
	var src := DIR + "bg_mountain_%s_v1.png" % (season if season else "spring") if file == "season" else DIR + file
	return {"place": key, "time": time, "shown": use, "src": src, "alt": ("夜里的" + p.alt) if use == "night" else p.alt, "name": p.name, "timeName": "" if time == "day" else TIMES()[time]}

## 原版 carry(prev,line)
static func carry(prev: Dictionary, line: Dictionary) -> Dictionary:
	return {"place": line.place if line.has("place") else prev.get("place"), "time": line.time if line.has("time") else prev.get("time")}
