class_name Css
extends RefCounted
## 解析原版 CSS 颜色字符串：#rgb/#rrggbb/#rrggbbaa、rgb()、rgba()
static func color(s: String) -> Color:
	s = s.strip_edges()
	if s.begins_with("#"): return Color(s)
	var m := RegEx.create_from_string("rgba?\\(([^)]*)\\)").search(s)
	if m:
		var p := m.get_string(1).split(",")
		var a := float(p[3]) if p.size() > 3 else 1.0
		return Color(float(p[0]) / 255, float(p[1]) / 255, float(p[2]) / 255, a)
	return Color.BLACK
