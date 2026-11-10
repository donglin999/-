extends Node2D
## WuxiaFX 叠加层的绘制节点（原版 qihe-faction-clash.js paint(layer) + WuxiaFX.drawBackInto / drawFrontInto）。
## 挂在战斗 view 下（继承镜头与震屏）：back 实例放在背景之后、单位之前；front 实例放在特效层之后。
## 指令表按「混合方式＋是否平滑」切成连续段，每段一个子节点：'lighter' → CanvasItemMaterial.BLEND_MODE_ADD，
## 'source-over' → BLEND_MODE_MIX；像素层 imageSmoothingEnabled=false → 最近邻。
## 辉光层照原版：data.glow 的指令先叠加画进 1/4 分辨率离屏层（SubViewport，黑底，等价于 gC 的 'lighter'），
## 再在 glowtex 占位处整张贴回，贴回时用 shaders/fx_glow_blur.gdshader 做 blur(8px)。

## 每帧取指令表的回调：() -> {"ops": Array, "xf": Transform2D}；返回空字典表示不画
var source: Callable
## 只有 back 实例带：每帧先推进特效时钟（原版 tick() 在 drawBattleBg 里调用）
var tick: Callable

static var _mat_add: CanvasItemMaterial
static var _mat_mix: CanvasItemMaterial
static var _dot: Texture2D
static var _blur_shader: Shader
var _runs: Array = []
var _gvp: SubViewport
var _grun: Node2D
var _gmat: ShaderMaterial
var _glow_rect := Rect2()

class Run extends Node2D:
	var ops: Array = []
	var xf := Transform2D.IDENTITY
	var dot: Texture2D
	func _draw() -> void:
		for op in ops:
			match op[0]:
				"tex":
					draw_set_transform_matrix(xf * op[4])
					draw_texture_rect_region(op[3], op[5], op[6], op[7])
				"rect":
					draw_set_transform_matrix(xf)
					draw_rect(op[3], op[4])
				"gdot":
					draw_set_transform_matrix(xf)
					var c: Vector2 = op[3]; var r: float = op[4]
					draw_texture_rect(dot, Rect2(c - Vector2(r, r), Vector2(r, r) * 2), false, op[5])
				"gline":
					draw_set_transform_matrix(xf)
					draw_polyline(op[3], op[5], op[4], true)
				"arc":
					draw_set_transform_matrix(xf)
					draw_arc(op[3], op[4], op[5], op[6], 32, op[8], op[7], true)
				"glowtex":
					draw_set_transform_matrix(xf)
					draw_texture_rect(op[3], op[4], false)
		draw_set_transform_matrix(Transform2D.IDENTITY)

## 原版 gdot：createRadialGradient(中心 col → 边缘透明)
static func dot_tex() -> Texture2D:
	if _dot == null:
		var g := Gradient.new()
		g.set_color(0, Color(1, 1, 1, 1)); g.set_color(1, Color(1, 1, 1, 0))
		var gt := GradientTexture2D.new()
		gt.gradient = g; gt.fill = GradientTexture2D.FILL_RADIAL
		gt.fill_from = Vector2(0.5, 0.5); gt.fill_to = Vector2(1.0, 0.5)
		gt.width = 64; gt.height = 64
		_dot = gt
	return _dot

static func _mat(add: bool) -> CanvasItemMaterial:
	if _mat_add == null:
		_mat_add = CanvasItemMaterial.new(); _mat_add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		_mat_mix = CanvasItemMaterial.new(); _mat_mix.blend_mode = CanvasItemMaterial.BLEND_MODE_MIX
	return _mat_add if add else _mat_mix

## 辉光离屏层：(W+2M.x)/GS × (H+2M.y)/GS 格，原点平移 M/GS，按 1/GS 缩放
func _glow_pass(data: Dictionary) -> void:
	var gops: Array = data.get("glow", [])
	var on := not gops.is_empty()
	if _gvp == null:
		if not on: return
		var m: Dictionary = data.get("M", {"x": 0.0, "y": 0.0})
		var GS := 4.0
		_glow_rect = Rect2(-m.x, -m.y, 640.0 + 2 * m.x, 360.0 + 2 * m.y)
		_gvp = SubViewport.new()
		_gvp.size = Vector2i(int(_glow_rect.size.x / GS), int(_glow_rect.size.y / GS))
		_gvp.transparent_bg = false
		_gvp.disable_3d = true
		_gvp.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
		add_child(_gvp)
		var bg := ColorRect.new(); bg.color = Color.BLACK; bg.size = Vector2(_gvp.size); _gvp.add_child(bg)
		var r := Run.new(); r.material = _mat(true); r.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		r.xf = Transform2D(0, Vector2(1 / GS, 1 / GS), 0, Vector2(m.x / GS, m.y / GS))
		_gvp.add_child(r); _grun = r
		if _blur_shader == null: _blur_shader = load("res://shaders/fx_glow_blur.gdshader")
		_gmat = ShaderMaterial.new(); _gmat.shader = _blur_shader
		_gmat.set_shader_parameter("glow_tex", _gvp.get_texture())
	_gvp.render_target_update_mode = SubViewport.UPDATE_ALWAYS if on else SubViewport.UPDATE_DISABLED
	_grun.ops = gops; _grun.dot = dot_tex(); _grun.queue_redraw()
	# blur(8px) 在 960 画布像素里量，不随镜头缩放：折成辉光格 8 ÷ (1.5 × scale × 4)
	_gmat.set_shader_parameter("sigma", 8.0 / (1.5 * float(data.get("scale", 1.0)) * 4.0))

func _process(_d: float) -> void:
	if tick.is_valid(): tick.call()
	var data: Dictionary = source.call() if source.is_valid() else {}
	var ops: Array = data.get("ops", [])
	var xf: Transform2D = data.get("xf", Transform2D.IDENTITY)
	if data.has("glow") or _gvp != null: _glow_pass(data)
	# 切段：相邻且混合方式、平滑方式相同的指令画在同一个子节点里
	var segs := []
	for op in ops:
		# glowtex 单独成段（要换材质）
		if segs.is_empty() or segs[-1].add != op[1] or segs[-1].smooth != op[2] or op[0] == "glowtex" or segs[-1].ops[0][0] == "glowtex":
			segs.append({"add": op[1], "smooth": op[2], "ops": []})
		segs[-1].ops.append(op)
	while _runs.size() < segs.size():
		var r := Run.new(); add_child(r); _runs.append(r)
	for i in _runs.size():
		var r: Run = _runs[i]
		if i < segs.size():
			r.visible = true; r.ops = segs[i].ops; r.xf = xf; r.dot = dot_tex()
			r.material = _mat(segs[i].add)
			if segs[i].ops[0][0] == "glowtex":
				r.material = _gmat
				segs[i].ops = [["glowtex", true, true, _gvp.get_texture(), _glow_rect]]
				r.ops = segs[i].ops
			r.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR if segs[i].smooth else CanvasItem.TEXTURE_FILTER_NEAREST
		else:
			r.visible = false; r.ops = []
		r.queue_redraw()
