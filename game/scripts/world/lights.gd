extends CanvasLayer
## 夜色与光源（原版 scene.js drawLights）：屏幕空间铺 cur.dark 暗色，按光源与主角 heroLight 挖出光池，再以 lighter 叠暖光。
## 用着色器一次画完：最多 16 个光源。
const MAXL := 16
var rect: ColorRect
var mat: ShaderMaterial
var vig: ColorRect

func _ready() -> void:
	layer = 4
	rect = ColorRect.new(); rect.size = Vector2(960, 540); rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mat = ShaderMaterial.new(); mat.shader = load("res://shaders/lights.gdshader"); rect.material = mat
	rect.visible = false
	add_child(rect)
	vig = ColorRect.new(); vig.size = Vector2(960, 540); vig.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var vm := ShaderMaterial.new(); vm.shader = load("res://shaders/vignette.gdshader"); vig.material = vm
	vig.visible = false
	add_child(vig)

## 暗角：探索 .18（明亮画风忽略 tint），标题／结局等 .55
func vignette(on: bool, strength := 0.18) -> void:
	vig.visible = on
	(vig.material as ShaderMaterial).set_shader_parameter("strength", strength)

func update_from(W) -> void:
	var cur: Dictionary = W.cur
	var L: Array = cur.get("lights", []) if cur.get("lights") is Array else []
	var dark = cur.get("dark")
	vig.visible = W.active and G.mode == "scene"
	var on: bool = (dark is String and dark != "") or L.size() > 0
	rect.visible = on and W.active
	if not rect.visible: return
	var t: float = W._t
	var Z: float = W.ZOOM
	var pos := PackedVector3Array(); var cols := PackedColorArray()
	for i in min(L.size(), MAXL):
		var l: Array = L[i]
		var fl: float = l[4] if l.size() > 4 and l[4] != null else 1.0
		var r: float = l[2] * (1 + sin(t / 90 + i * 2.1) * 0.03 * fl + sin(t / 37 + i) * 0.02 * fl) * Z
		pos.append(Vector3((l[0] - W.cam.x) * Z, (l[1] - W.cam.y) * Z, r))
		var cs: String = l[3] if l.size() > 3 and l[3] else "255,150,60"
		var p := cs.split(",")
		cols.append(Color(float(p[0]) / 255, float(p[1]) / 255, float(p[2]) / 255))
	mat.set_shader_parameter("n", pos.size())
	mat.set_shader_parameter("lights", pos)
	mat.set_shader_parameter("colors", cols)
	mat.set_shader_parameter("dark_on", dark is String and dark != "")
	if dark is String and dark != "": mat.set_shader_parameter("dark", Css.color(dark))
	var hl: float = cur.get("heroLight", 110) if cur.get("heroLight") else 110.0
	mat.set_shader_parameter("hero", Vector3((W.player.x - W.cam.x) * Z, (W.player.y - 40 - W.cam.y) * Z, hl * Z))
