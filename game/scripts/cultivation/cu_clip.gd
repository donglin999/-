class_name CuClip
extends Control
## 修习六帧动画画布（对应原版 qh-mode-cultivation-presentation.js 的 draw/loopPhase/fitLoop，
## 以及 <canvas data-art="action" data-action=clip>）。片段表来自 CultivationActionArt（已含 rig-trial、activity 替换）。

const DURATIONS := [280, 220, 240, 340, 420, 500]

var clip_id := "B01"
var clip: Dictionary = {}
var tex: Texture2D
## 原版 .cu-training-frame.cu-playing / .cu-story-frame：循环播放
var playing := false
## 原版 data-finished="true"：播完后停在收势帧
var finished := false
## 播放起点（毫秒，Time.get_ticks_msec）；<0 表示首次绘制时取当前
var started_at := -1
var frame := -1

static func clips() -> Dictionary: return CuDB.t("CultivationActionArt")

func setup(id: String) -> CuClip:
	clip_id = id
	clip = clips().get(id, {})
	tex = CuUI.tex(clip.get("file", ""))
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	return self

func has_art() -> bool: return tex != null

## 原版 loopPhase(elapsed, clip)
static func loop_phase(elapsed: float, c: Dictionary) -> Dictionary:
	var ms: Array = c.get("durations", DURATIONS)
	var total := 0.0
	for m in ms: total += m
	var t := fposmod(elapsed, total)
	var order = c.get("order")
	for i in ms.size():
		if t < ms[i]: return {"frame": order[i] if order != null else i, "beat": i, "mix": t / ms[i]}
		t -= ms[i]
	var last: int = ms.size() - 1
	return {"frame": order[last] if order != null else last, "beat": last, "mix": 0.0}

func _process(_d: float) -> void:
	if tex == null: return
	var now := Time.get_ticks_msec()
	if started_at < 0: started_at = now
	var f := 0
	if playing: f = int(loop_phase(now - started_at, clip).frame)
	elif finished: f = int(clip.get("restFrame", 5))
	if f != frame:
		frame = f
		queue_redraw()

## 原版 fitLoop(ctx, im, clip, frame, w, h)
func _draw() -> void:
	if tex == null: return
	var cols := int(clip.get("columns", 3))
	var rows := int(clip.get("rows", 2))
	var sw := tex.get_width() / float(cols)
	var sh := tex.get_height() / float(rows)
	var f: int = max(frame, 0)
	var src := Rect2((f % cols) * sw, floori(f / float(cols)) * sh, sw, sh)
	var w := size.x
	var h := size.y
	var reg = clip.get("registration")
	var off = reg.frames[f] if reg != null and f < reg.frames.size() else null
	var dst: Rect2
	if clip.get("presentation") == null:
		var sc := float(reg.commonScale) if reg != null else 1.0
		var unit: float = min(w / sw, h / sh)
		var k := unit * sc
		var dx := float(off.dx) if off != null else 0.0
		var dy := float(off.dy) if off != null else 0.0
		dst = Rect2((w - sw * k) / 2 + dx * unit, (h - sh * k) / 2 + dy * unit, sw * k, sh * k)
	else:
		var b: Array = clip.presentation.bounds
		var unit: float = min(w / float(b[2]), h / float(b[3]))
		var sc := float(reg.commonScale)
		var k := unit * sc
		dst = Rect2((w - b[2] * unit) / 2 - b[0] * unit + (sw - sw * sc) / 2 * unit + float(off.dx) * unit,
			(h - b[3] * unit) / 2 - b[1] * unit + (sh - sh * sc) / 2 * unit + float(off.dy) * unit, sw * k, sh * k)
	draw_texture_rect_region(tex, dst, src)
