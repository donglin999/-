extends RefCounted
## 原版 js/faction-fx/wuxia-fx.js 的 class WuxiaFX（交锋只用 overlay 模式：new WuxiaFX(null,{overlay:true})）。
## 640×360 特效像素空间；overlay 四周留白 M={200,120}。原版先画到 back/front/ui 三张离屏 canvas 和 1/4 分辨率辉光层 gC，
## 再由 drawBackInto/drawFrontInto 贴进战斗画面。这里 render() 把同样的绘制调用记成指令表 ops，由 fx_layer.gd 逐条画出
## （globalCompositeOperation 'lighter' → CanvasItemMaterial.BLEND_MODE_ADD，'source-over' → BLEND_MODE_MIX）。
## 未移植（交锋不走到）：composite / drawChars（非 overlay 舞台）、drawNums（交锋 quiet=true 从不压入浮字）、beam、bpCharge/bpAura（bp 恒 0）。

const U := preload("res://scripts/battle/fx_util.gd")
const Store := preload("res://scripts/battle/fx_store.gd")
const Atlas := preload("res://scripts/battle/fx_atlas.gd")
const Lib := preload("res://scripts/battle/fx_lib.gd")

const W := 640.0
const H := 360.0
const GS := 4.0
## 评审舞台群体演示：第 2、3 名敌人相对主目标的偏移（特效像素）
const GROUP := [[-92, -20], [-70, 26]]

var overlay := false
var M := {"x": 0.0, "y": 0.0}
var glow_on := true
var atlas = Atlas.new()
## 锚点：hand 施法手、target 目标胸口、ground 目标脚下、foot 施法者脚下
var A := {"hand": {"x": 429.0, "y": 171.0}, "target": {"x": 184.0, "y": 208.0}, "ground": {"x": 184.0, "y": 271.0}, "foot": {"x": 505.0, "y": 271.0}}
var T = null            # 实际目标 [{x,y,gx,gy}]，null＝评审舞台默认
var AL = null           # 我方锚点
var group := 0
var bp := 0
var quiet := false
var low := false
## 交锋层写入：pred 预判命中（null＝原版 undefined）；outcome 真实结算；await_outcome＝原版 fx.outcome===null
var pred = null
var outcome = null
var await_outcome := false
var actual_bp = null    # 原版 fx.actualBP（am_s2 用 ?? 3）

var skill = null
var name := ""
var t := 0.0
var parts := []
var nums := []
var fired := {}
var s := {}
var shake_amt := 0.0
var fl = null
var hit_until := -1.0
var hit_mode := ""
var used := 0
var dropped := 0
var peak := 0
var budget := 1e9
var rand: Callable
var tint = null
var vig := 0.0
var zoom = null
## render() 的输出：每层一张指令表
var ops := {"back": [], "front": [], "glow": [], "ui": []}

## constructor(out,{overlay})
func _init(is_overlay := false) -> void:
	overlay = is_overlay
	M = {"x": 200.0, "y": 120.0} if overlay else {"x": 0.0, "y": 0.0}
	reset()

func reset() -> void:
	skill = null; t = 0.0; parts = []; nums = []; fired = {}; s = {}; shake_amt = 0.0; fl = null; hit_until = -1.0; used = 0; dropped = 0; peak = 0

## play(name,seed,{bp})
func play(nm: String, seed := 7, bp_in := 0) -> void:
	var sk = Store.SKILLS.get(nm)
	if sk == null: push_error("WuxiaFX: unknown skill " + nm); return
	reset(); skill = sk; name = nm
	bp = clampi(bp_in, 0, 3)
	budget = float(sk.get("budget", 1e9)) * (1 + 0.2 * bp)
	rand = U.rng(seed)
	if sk.get("init") is Callable: sk.init.call(self)

## targets()：战斗中由交锋层写入 T；评审舞台按 group 生成演示目标
func targets() -> Array:
	if T != null and T.size(): return T
	var t0 := {"x": A.target.x + 5, "y": A.target.y - 8, "gx": A.ground.x, "gy": A.ground.y}
	var out := [t0]
	for i in range(0, mini(GROUP.size(), maxi(0, group - 1))):
		var d: Array = GROUP[i]
		out.append({"x": t0.x + d[0], "y": t0.y + d[1], "gx": t0.gx + d[0], "gy": t0.gy + d[1]})
	return out

## allies()：评审舞台默认我方＝施法者身体
func allies() -> Array:
	if AL != null and AL.size(): return AL
	return [{"x": A.foot.x, "y": A.hand.y + 14, "gx": A.foot.x, "gy": A.foot.y}]

func done() -> bool: return skill == null or t >= float(skill.dur)

func once(key: String, cond: bool, fn: Callable) -> void:
	if cond and not fired.has(key):
		fired[key] = true; fn.call()

func hit(mode: String, ms: float) -> void: hit_mode = mode; hit_until = t + ms
func flash(col: Color, a: float, ms: float) -> void: fl = {"col": col, "a": a, "t0": t, "ms": ms}
func shake(n: float) -> void: shake_amt = maxf(shake_amt, n)
func num(text: String, x: float, y: float, o := {}) -> void:
	if quiet: return
	var n := {"text": text, "x": x, "y": y, "scale": 1, "ramp": "gold", "age": 0.0, "life": 1100.0}; n.merge(o, true); nums.append(n)
func label(text: String, x: float, y: float, col, o := {}) -> void:
	if quiet: return
	var n := {"label": text, "col": col, "x": x, "y": y, "age": 0.0, "life": 900.0, "px": 11}; n.merge(o, true); nums.append(n)

## spawn(o)：超出预算丢弃；默认值照原版
func spawn(o: Dictionary) -> void:
	if used >= budget: dropped += 1; return
	used += 1
	var p := {"x": 0.0, "y": 0.0, "vx": 0.0, "vy": 0.0, "ax": 0.0, "ay": 0.0, "drag": 0.0, "age": 0.0, "life": 500.0, "kind": "px", "layer": "front", "add": true, "ramp": "gold", "size": 1, "rot": 0.0, "spin": 0.0, "alpha": 1.0, "seed": rand.call() * 99}
	p.merge(o, true)
	parts.append(p)

## update(dt)
func update(dt: float) -> void:
	if skill == null: return
	t += dt
	if skill.get("update") is Callable: skill.update.call(self, t, dt)
	var sec := dt / 1000.0
	var keep := []
	for p in parts:
		p.age += dt
		if p.age >= p.life: continue
		p.px = p.x; p.py = p.y
		if p.has("pull"):
			var dx: float = p.pull.x - p.x; var dy: float = p.pull.y - p.y
			var d := Vector2(dx, dy).length()
			if d == 0: d = 1
			if d < 2 and p.get("kill") != false: continue
			var sw: float = p.get("swirl", 0.0)
			p.vx += (dx / d * p.pullF - dy / d * sw) * sec
			p.vy += (dy / d * p.pullF + dx / d * sw) * sec
		p.vx += p.ax * sec; p.vy += p.ay * sec
		var k := exp(-p.drag * sec)
		p.vx *= k; p.vy *= k
		p.x += p.vx * sec; p.y += p.vy * sec; p.rot += p.spin * sec
		keep.append(p)
	parts = keep
	peak = maxi(peak, parts.size())
	for n in nums: n.age += dt
	nums = nums.filter(func(n): return n.age < n.life)
	shake_amt = maxf(0, shake_amt - dt * 0.03)

# ── 绘制原语（记入 ops）──
# 指令格式：["tex", add, smooth, Texture2D, Transform2D, dest Rect2, src Rect2, modulate Color]
#           ["rect", add, smooth, Rect2, Color]；["gdot", true, true, 中心 Vector2, 半径, Color]；["gline", true, true, 点列, 线宽, Color]

## img(layer,id,x,y,{a,add,rot,sx,sy,ax,ay,clip})：(x,y) 为锚点；boost 为逐招主体放大，noBoost 内的素材不放大
func img(layer: String, id: String, x: float, y: float, o := {}) -> void:
	var sp = Store.IMG.get(id)
	var a: float = o.get("a", 1.0)
	var sx: float = o.get("sx", 1.0); var sy: float = o.get("sy", 1.0)
	var bo := 1.0
	if skill != null and skill.get("boost") and not (skill.has("noBoost") and skill.noBoost.has(id.split("@")[0])): bo = skill.boost
	sx *= bo; sy *= bo
	if sp == null or a <= 0.01 or sx == 0 or sy == 0: return
	var add = o.get("add")
	if add == null: add = sp.add
	var w: float = sp.w; var h: float = sp.h
	var ax: float = o.get("ax", 0.5); var ay: float = o.get("ay", 0.5)
	var u0 := 0.0; var u1 := w
	var clip = o.get("clip")
	if clip != null:
		u0 = clampf(clip[0] * w, 0, w); u1 = clampf(clip[1] * w, 0, w)
		if u1 <= u0: return
	var tex: Texture2D = sp.tex
	var ts := tex.get_size()
	var xf := Transform2D(float(o.get("rot", 0.0)), Vector2(sx, sy), 0.0, Vector2(U.jround(x), U.jround(y)))
	var dest := Rect2(-w * ax + u0, -h * ay, u1 - u0, h)
	var src := Rect2(u0 * ts.x / w, 0, (u1 - u0) * ts.x / w, ts.y)
	ops[layer].append(["tex", preload("res://scripts/npc/util.gd").t(add), false, tex, xf, dest, src, Color(1, 1, 1, minf(1, a))])

## spr(layer,s,x,y,{a,add,sx,sy})：图集精灵，整数像素落点
func spr(layer: String, sp, x: float, y: float, o := {}) -> void:
	var a: float = o.get("a", 1.0)
	if a <= 0.01 or sp == null: return
	var sx: float = o.get("sx", 1.0); var sy: float = o.get("sy", 1.0)
	var tex: Texture2D = sp.tex
	var ts := tex.get_size()
	var dest := Rect2(U.jround(x - sp.ax * sx), U.jround(y - sp.ay * sy), U.jround(ts.x * sx), U.jround(ts.y * sy))
	ops[layer].append(["tex", preload("res://scripts/npc/util.gd").t(o.get("add", false)), false, tex, Transform2D.IDENTITY, dest, Rect2(Vector2.ZERO, ts), Color(1, 1, 1, minf(1, a))])

func rect(layer: String, x: float, y: float, w: float, h: float, col: Color, a := 1.0, add := false) -> void:
	if a <= 0.01: return
	ops[layer].append(["rect", add, false, Rect2(U.jround(x), U.jround(y), maxi(1, U.jround(w)), maxi(1, U.jround(h))), Color(col, minf(1, a))])

## line：逐像素 1×1 方块（原版 fillRect 循环）
func line(layer: String, x0: float, y0: float, x1: float, y1: float, col: Color, a := 1.0, add := true) -> void:
	if a <= 0.01: return
	var n := maxi(1, int(ceil(maxf(absf(x1 - x0), absf(y1 - y0)))))
	var c := Color(col, minf(1, a))
	for i in n + 1:
		ops[layer].append(["rect", add, false, Rect2(U.jround(lerpf(x0, x1, float(i) / n)), U.jround(lerpf(y0, y1, float(i) / n)), 1, 1), c])

## gdot：辉光层径向渐变点（原版画在 1/4 分辨率层，半径下限 .8 格＝3.2 特效像素）
func gdot(x: float, y: float, r: float, col: Color, a := 1.0) -> void:
	if a <= 0.01: return
	ops.glow.append(["gdot", true, true, Vector2(x, y), maxf(0.8, r / GS) * GS, Color(col, minf(1, a))])

## gline：辉光层圆头折线（线宽下限 .5 格＝2 特效像素）
func gline(pts: Array, w: float, col: Color, a := 1.0) -> void:
	if a <= 0.01 or pts.size() < 2: return
	var pv := PackedVector2Array()
	for p in pts: pv.append(Vector2(p[0], p[1]))
	ops.glow.append(["gline", true, true, pv, maxf(0.5, w / GS) * GS, Color(col, minf(1, a))])

func grect(x: float, y: float, w: float, h: float, col: Color, a := 1.0) -> void:
	if a <= 0.01: return
	ops.glow.append(["rect", true, true, Rect2(x, y, w, h), Color(col, minf(1, a))])

## pop(id,x,y,{life,delay,sc,a,layer,add,rot,spin,vx,vy,ax,ay,flip,ease})：短时素材实例
func pop(id: String, x: float, y: float, o := {}) -> void:
	if not s.has("pops"): s.pops = []
	var p := {"id": id, "x": x, "y": y, "t0": t + float(o.get("delay", 0.0)), "life": 400.0, "sc": [1.0, 1.0], "a": [1.0, 0.0], "layer": "front", "add": null, "rot": 0.0, "spin": 0.0, "vx": 0.0, "vy": 0.0, "ax": 0.5, "ay": 0.5, "flip": false, "ease": null}
	p.merge(o, true)
	s.pops.append(p)

func draw_pops(layer: String) -> void:
	for p in s.get("pops", []):
		if p.layer != layer: continue
		var e: float = t - p.t0
		if e < 0 or e > p.life: continue
		var k: float = e / p.life
		var q: float = p.ease.call(k) if p.ease is Callable else U.out3(k)
		var sc := lerpf(p.sc[0], p.sc[1], q); var al := lerpf(p.a[0], p.a[1], k); var sec := e / 1000.0
		img(layer, p.id, p.x + p.vx * sec, p.y + p.vy * sec, {"a": al, "add": p.add, "rot": p.rot + p.spin * sec, "sx": sc * (-1 if p.flip else 1), "sy": sc, "ax": p.ax, "ay": p.ay})

## drawParts(layer)：tone 随寿命从 tone(默认 5) 降到 1；透明度 = alpha × 淡入 × (1-k^fade)
func draw_parts(layer: String) -> void:
	for p in parts:
		if p.layer != layer: continue
		var k: float = p.age / p.life
		var R: Array = Store.ramp(p.ramp)
		var tone := clampi(U.jround(lerpf(float(p.get("tone", 5)), 1.0, pow(k, 1.3))), 1, 5)
		var fade_in: float = p.get("fadeIn", 0.0)
		var a: float = p.alpha * (minf(1, p.age / fade_in) if fade_in else 1.0) * (1 - pow(k, float(p.get("fade", 1.4))))
		match p.kind:
			"streak":
				var ln: float = p.get("len", 0.03)
				line(layer, p.x - p.vx * ln, p.y - p.vy * ln, p.x, p.y, R[tone], a, p.add)
			"star":
				var tw := 0.55 + 0.45 * sin(p.age * 0.03 + p.seed)
				spr(layer, atlas.star(R, p.ramp, maxf(1, p.size * tw * (1 - k * 0.5))), p.x, p.y, {"a": a, "add": true})
			"shard":
				var sz: float = p.size
				spr(layer, atlas.bake("sh" + str(sz), R, p.ramp, sz + 1, p.rot, Atlas.sh_shard(sz, maxf(1, sz * 0.28))), p.x, p.y, {"a": a, "add": p.add})
			"orb":
				spr(layer, atlas.glow(R, p.ramp, p.size), p.x, p.y, {"a": a, "add": true})
			_:
				rect(layer, p.x, p.y, p.size, p.size, R[tone], a, p.add)
		if p.get("glow", 0): gdot(p.x, p.y, p.glow, R[3], a * 0.6)

## render()：清空各层 → skill.draw → leadAura（v4 且未关）→ pops → 粒子
func render() -> void:
	for k in ops: ops[k] = []
	tint = null; vig = 0.0; zoom = null
	if skill != null:
		if skill.get("draw") is Callable: skill.draw.call(self, t)
		if skill.get("set") == "v4" and skill.get("leadAura", true) != false: Lib.lead_aura(self, t)
	draw_pops("back"); draw_pops("front"); draw_parts("back"); draw_parts("front")

## drawBackInto(o,ow,oh)：先铺压暗（tint 透明度减半，铺满 ow*7×oh*7），再贴 back 层。坐标为特效像素（960 画布 ÷1.5）
func back_ops() -> Array:
	var out := []
	if tint != null:
		out.append(["rect", false, false, Rect2(-W * 3, -H * 3, W * 7, H * 7), Color(tint[0], tint[1] * 0.5)])
	out.append_array(ops.back)
	return out

## drawFrontInto(o,ow,oh)：front 层 → 辉光层（lighter、平滑、blur 8px）→ ui 层 → 闪白（lighter，a×.6×(1-k)）
## 辉光层只放一条 glowtex 占位：ops.glow 由 fx_layer.gd 画进 1/4 分辨率离屏层，模糊后在这里贴回
func front_ops() -> Array:
	var out: Array = ops.front.duplicate()
	if glow_on and not ops.glow.is_empty(): out.append(["glowtex", true, true])
	out.append_array(ops.ui)
	if fl != null:
		var k: float = (t - fl.t0) / fl.ms
		if k < 1: out.append(["rect", true, false, Rect2(-W * 3, -H * 3, W * 7, H * 7), Color(fl.col, fl.a * 0.6 * (1 - k))])
	return out

## 原版 cs_whip_s2_v2 直接在 fx.cx.front 上 arc()+stroke()（source-over，线宽 2）
func arc_stroke(layer: String, c: Vector2, r: float, a0: float, a1: float, w: float, col: Color) -> void:
	if col.a <= 0.01: return
	ops[layer].append(["arc", false, true, c, r, a0, a1, w, col])
