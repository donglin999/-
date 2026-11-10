class_name QJFitTex
extends Control
## 等比包含绘制一张图（对应 CSS object-fit:contain + 底对齐 / SVG preserveAspectRatio xMidYMax meet）。
## region 为裁切区（立绘按包围盒外扩 8px，见原版 qihe-jianghu-ui.js image()）；valign 0 顶、0.5 中、1 底。
## cover 为 true 时按 object-fit:cover 铺满（HUD 头像、背景画）。

var tex: Texture2D
var region := Rect2()
var valign := 1.0
var halign := 0.5
var cover := false
var max_h := 0.0
var modulate_col := Color.WHITE

func _init() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS

func set_tex(t: Texture2D, r := Rect2()) -> void:
	tex = t
	region = r if r.size != Vector2.ZERO or t == null else Rect2(Vector2.ZERO, t.get_size())
	queue_redraw()

## 立绘绘制后的实际矩形（命中测试用）
func drawn_rect() -> Rect2:
	if tex == null or region.size.x <= 0: return Rect2()
	var box := size
	if max_h > 0 and box.y > max_h: box.y = max_h
	var k: float
	if cover: k = maxf(size.x / region.size.x, size.y / region.size.y)
	else: k = minf(box.x / region.size.x, box.y / region.size.y)
	var ds := region.size * k
	return Rect2(Vector2((size.x - ds.x) * halign, (size.y - ds.y) * valign), ds)

func _draw() -> void:
	if tex == null: return
	var r := drawn_rect()
	if cover:
		# 裁到控件范围内
		var src := region
		var k := r.size.x / region.size.x
		var vis := r.intersection(Rect2(Vector2.ZERO, size))
		src = Rect2(region.position + (vis.position - r.position) / k, vis.size / k)
		draw_texture_rect_region(tex, vis, src, modulate_col)
	else:
		draw_texture_rect_region(tex, r, region, modulate_col)

## 像素级命中（原版 portraitHit：只有点在不透明处才算选中）
func hit(p: Vector2) -> bool:
	var r := drawn_rect()
	if not r.has_point(p): return false
	var img := tex.get_image() if tex else null
	if img == null: return true
	if img.is_compressed(): img.decompress()
	var u := region.position + (p - r.position) / r.size * region.size
	var x := clampi(int(u.x * img.get_width() / tex.get_width()), 0, img.get_width() - 1)
	var y := clampi(int(u.y * img.get_height() / tex.get_height()), 0, img.get_height() - 1)
	return img.get_pixel(x, y).a > 0.1
