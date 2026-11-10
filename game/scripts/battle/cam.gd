extends RefCounted
## 2D 镜头（bstage.js CAM）：世界坐标即 960×540 画布坐标；视图中心 (cx,cy)、缩放 z（1..1.25）；
## apply = translate(W/2,H/2)·scale(z)·translate(-cx,-cy)；时间用真实时间 performance.now。

const ZMIN := 1.0
const ZMAX := 1.25
const W := 960.0
const H := 540.0

var bt
var cx := W / 2; var cy := H / 2; var z := 1.0
var bx := W / 2; var by := H / 2; var bz := 1.0
var tw = null
var pu = null

func _init(b) -> void: bt = b

static func cam_ease(k: float) -> float:
	return 4 * k * k * k if k < 0.5 else 1 - pow(-2 * k + 2, 3) / 2

func clamp_z(v: float) -> float: return clampf(v, ZMIN, ZMAX)
func clamp_c(x: float, y: float, zz: float) -> Vector2:
	var hw := W / 2 / zz; var hh := H / 2 / zz
	return Vector2(clampf(x, hw, W - hw), clampf(y, hh, H - hh))

func update(now: float) -> void:
	if tw != null:
		var k: float = minf(1.0, (now - tw.t0) / tw.ms) if tw.ms > 0 else 1.0
		var e := cam_ease(k)
		bz = tw.z0 + (tw.z1 - tw.z0) * e; bx = tw.x0 + (tw.x1 - tw.x0) * e; by = tw.y0 + (tw.y1 - tw.y0) * e
		if k >= 1: tw = null
	var pz := 0.0
	if pu != null:
		var k: float = (now - pu.t0) / pu.ms
		if k >= 1: pu = null
		else:
			var a: float = k / 0.18 if k < 0.18 else pow(1 - (k - 0.18) / 0.82, 2)
			pz = pu.a * (sin(a * PI / 2) if k < 0.18 else a)
	z = clamp_z(bz * (1 + pz))
	var c := clamp_c(bx, by, z); cx = c.x; cy = c.y

## 世界 → 屏幕的变换（含镜头，不含震屏）
func xform() -> Transform2D:
	return Transform2D(0, Vector2(z, z), 0, Vector2(W / 2 - cx * z, H / 2 - cy * z))

func to_world(x: float, y: float) -> Vector2: return Vector2((x - W / 2) / z + cx, (y - H / 2) / z + cy)
func to_screen(x: float, y: float) -> Vector2: return Vector2((x - cx) * z + W / 2, (y - cy) * z + H / 2)

func focus(x: float, y: float, zoom := 1.12, ms := 380.0) -> void:
	var t0: float = bt.pn(); update(t0)
	var z1 := clamp_z(zoom); var c := clamp_c(x, y, z1)
	tw = {"t0": t0, "ms": maxf(0, ms), "x0": bx, "y0": by, "z0": bz, "x1": c.x, "y1": c.y, "z1": z1}

func focus_unit(u: Dictionary, zoom := 1.15, ms := 380.0) -> void:
	focus(u.x, u.y - bt.rules.unit_h(u) * 0.45, zoom, ms)

func punch(zoom := 1.08, ms := 320.0) -> void:
	pu = {"t0": bt.pn(), "ms": maxf(60, ms), "a": clampf(zoom - 1, -0.2, 0.25)}

func reset(ms := 420.0) -> void: focus(W / 2, H / 2, 1, ms)

func snap() -> void:
	cx = W / 2; bx = cx; cy = H / 2; by = cy; z = 1; bz = 1; tw = null; pu = null
