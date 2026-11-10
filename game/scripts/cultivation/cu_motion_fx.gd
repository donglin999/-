class_name CuMotionFx
extends RefCounted
## 立绘动作（原版 qh-mode-cultivation-story.js applyMotion + -story.css 的 @keyframes cuActor*）。
## 平移按立绘自身宽高的百分比；--away：单人 0、最左 -1、最右 1、中间按半边；--toward = -away。

## 关键帧 [时刻0..1, dx%, dy%, 旋转度, 缩放x, 缩放y, 不透明]；away/toward 在 play 里乘进去
static func _frames(move: String, away: float) -> Array:
	var tw := -away
	match move:
		"knock": return [[0, 0, 0, 0, 1, 1, 1], [0.14, away * 16, 1.2, away * 7, 1, 1, 1], [0.30, away * 13, 0, away * 3, 1, 1, 1], [1, 0, 0, 0, 1, 1, 1]]
		"flee": return [[0, 0, 0, 0, 1, 1, 1], [0.12, tw * 3, 0, tw * 2, 1, 1, 1], [1, away * 28, 0, away * 4, 1, 1, 1]]
		"startle": return [[0, 0, 0, 0, 1, 1, 1], [0.35, 0, -5, 0, 1.03, 0.97, 1], [0.70, 0, 0, 0, 0.98, 1.02, 1], [1, 0, 0, 0, 1, 1, 1]]
		"step": return [[0, 0, 0, 0, 1, 1, 1], [0.6, tw * 7, -1, 0, 1, 1, 1], [1, tw * 6, 0, 0, 1, 1, 1]]
		"drag": return [[0, 0, 0, 0, 1, 1, 1], [0.15, away * -2, 0, away * -6, 1, 1, 1], [1, away * 70, 9, away * -14, 1, 1, 0]]
		"shake": return [[0, 0, 0, 0, 1, 1, 1], [0.15, -1.6, 0, 0, 1, 1, 1], [0.30, 1.6, 0, 0, 1, 1, 1], [0.45, -1.2, 0, 0, 1, 1, 1], [0.60, 1.2, 0, 0, 1, 1, 1], [0.75, -0.6, 0, 0, 1, 1, 1], [0.90, 0.6, 0, 0, 1, 1, 1], [1, 0, 0, 0, 1, 1, 1]]
		"slump": return [[0, 0, 0, 0, 1, 1, 1], [1, 0, 3, 0, 1, 0.975, 1]]
		"nod": return [[0, 0, 0, 0, 1, 1, 1], [0.3, 0, 1.6, 0, 1, 1, 1], [0.6, 0, -0.4, 0, 1, 1, 1], [1, 0, 0, 0, 1, 1, 1]]
		"enter": return [[0, away * 45, 0, 0, 1, 1, 0], [1, 0, 0, 0, 1, 1, 1]]
	return []

const DUR := {"knock": 0.62, "flee": 0.5, "startle": 0.42, "step": 0.38, "drag": 0.9, "shake": 0.4, "slump": 0.7, "nod": 0.5, "enter": 0.45}

## 缓动：原版 cubic-bezier 近似
static func _ease(move: String) -> Array:
	match move:
		"knock", "startle", "step", "enter": return [Tween.TRANS_CUBIC, Tween.EASE_OUT]
		"flee", "drag": return [Tween.TRANS_CUBIC, Tween.EASE_IN_OUT]
		"shake": return [Tween.TRANS_LINEAR, Tween.EASE_IN_OUT]
		"slump": return [Tween.TRANS_QUAD, Tween.EASE_OUT]
	return [Tween.TRANS_SINE, Tween.EASE_IN_OUT]

static func play(node: Control, move: String, i: int, n: int) -> void:
	var away := 0.0
	if n > 1: away = -1.0 if i == 0 else (1.0 if i == n - 1 else (-1.0 if i < (n - 1) / 2.0 else 1.0))
	var fr := _frames(move, away)
	if fr.is_empty(): return
	var base := node.position
	var sz := node.size
	node.pivot_offset = Vector2(sz.x / 2, sz.y)
	var apply := func(k: Array):
		node.position = base + Vector2(sz.x * k[1] / 100.0, sz.y * k[2] / 100.0)
		node.rotation_degrees = k[3]
		node.scale = Vector2(k[4], k[5])
		node.modulate.a = k[6]
	apply.call(fr[0])
	var tw := node.create_tween()
	var e := _ease(move)
	var total: float = DUR[move]
	for j in range(1, fr.size()):
		var a: Array = fr[j - 1]
		var b: Array = fr[j]
		var d: float = (b[0] - a[0]) * total
		tw.tween_method(func(t: float):
			var k := []
			for q in 7: k.append(lerp(float(a[q]), float(b[q]), t))
			apply.call(k), 0.0, 1.0, d).set_trans(e[0]).set_ease(e[1])
