class_name CuShot
extends RefCounted
## 调试：--cultivation=shot:<状态>[:dump]，供主会话与原版截图并排对照（正式流程不调用）。
## 存档同 --cultivation=1（刚进入培养模式：第一年一月初，体力 12，谷中消息弹窗）。
## 状态：entry = 谷中消息弹窗；hub = 点“知道了 · 继续培养”后；p0…p7 = 再点底栏第 N 个（基本功、招式、生产、学艺、打杂、邮箱、闲逛、休息）。
## 原版实测（docs/specs/layout/cult-*.json）：关掉弹窗后师门剧情自动开场，底栏全部禁用，p0…p7 与 hub 相同；这里同样按真实按钮点击，禁用就不响应。
## 带 :dump 时把可见元素换算成 1280×720 窗口坐标打印（与 layout JSON 同口径），便于 headless 下逐项比对。

const STATES := ["entry", "hub", "hub2", "p0", "p1", "p2", "p3", "p4", "p5", "p6", "p7"]

static func _wait(h: Node, sec: float) -> void:
	await h.get_tree().create_timer(sec, true, false, true).timeout

static func _find(n: Node, cmd: String) -> Button:
	for c in n.get_children():
		if c is Button and str(c.get_meta("cu", "")) == cmd and (c as Button).is_visible_in_tree(): return c
		var r := _find(c, cmd)
		if r != null: return r
	return null

## 模拟一次真实点击：按钮不存在或禁用时不响应（同原版 disabled）
static func _click(b: Button) -> bool:
	if b == null or b.disabled: return false
	b.pressed.emit()
	return true

static func run(h: Node, arg: String) -> void:
	h.set_meta("shot_ready", "")
	var parts := arg.trim_prefix("shot:").split(":")
	var st := parts[0] if parts.size() else "entry"
	if not (st in STATES): print("shot: 未知状态 ", st, "，可选 ", STATES); st = "entry"
	await _wait(h, 0.6)
	if st != "entry":
		var ok := _click(_find(h.root, "notice-close"))
		print("shot: 关闭谷中消息 ", ok)
		await _wait(h, 0.6)
	if st == "hub2" or st.begins_with("p"):
		await _advance(h)
	if st.begins_with("p"):
		var i := int(st.substr(1))
		var nav: Node = _nav(h)
		var b: Button = nav.get_child(i) if nav != null and i < nav.get_child_count() else null
		print("shot: 点底栏 ", i, " → ", "已响应" if _click(b) else "按钮禁用或不存在，未响应")
		await _wait(h, 0.6)
	# line=<事件 id>,<台词片段>：直接把这场戏的这一句摆上对白画面（11-10 核对动作差分用；只截图，不推进剧情）
	for p in parts:
		if p.begins_with("line="):
			var ev := p.trim_prefix("line=").get_slice(",", 0); var frag := p.trim_prefix("line=").get_slice(",", 1)
			var sc = JSON.parse_string(FileAccess.get_file_as_string("res://data/cultivation/scripts.json")).get(ev, {})
			var found = null
			for blk in sc.get("scripts", []):
				for k in blk:
					if blk[k] is Array:
						for l in blk[k]:
							if l is Dictionary and str(l.get("text", "")).contains(frag) and found == null: found = l
			if found == null: print("shot: 找不到台词 ", ev, " ", frag)
			else:
				var def = CuDB.find_by(CuHousehold.definitions(), "id", ev)
				CuStory.render(h.root, {"title": def.get("name", ev) if def else ev, "text": found.text, "speaker": found.get("speaker", "narrator"), "cast": found.get("cast", ["hero", found.get("speaker")]), "event": ev, "line": found})
				await _wait(h, 0.6)
	print("shot: 就绪 ", st)
	h.set_meta("shot_ready", st)   # 批量截图（tests/shots.gd）等这个标记
	for p in parts:
		if p.begins_with("out="):
			await h.get_tree().process_frame; await h.get_tree().process_frame
			h.get_viewport().get_texture().get_image().save_png(p.trim_prefix("out="))
			print("shot: 已存 ", p.trim_prefix("out="))
			h.get_tree().quit()
	if "dump" in parts:
		await h.get_tree().process_frame
		dump(h.root)
		h.get_tree().quit()

## 打印可见元素：类型 名称 x y w h [字号] [文字]（1280 窗口像素）
static func dump(root: Control) -> void:
	var k := 1280.0 / root.get_viewport_rect().size.x
	var stack: Array = [root]
	while stack.size():
		var n: Node = stack.pop_front()
		if n is CanvasItem and not (n as CanvasItem).visible: continue
		if n is Control:
			var c := n as Control
			var r := c.get_global_rect()
			var line := "%s %s %d %d %d %d" % [c.get_class(), c.name, round(r.position.x * k), round(r.position.y * k), round(r.size.x * k), round(r.size.y * k)]
			if c is Label or c is Button:
				var fz: int = c.get_theme_font_size("font_size")
				line += " fs=%.2f %s" % [fz * c.get_global_transform().get_scale().x * k, str(c.text).replace("\n", "/").left(24)]
			if c is TextureRect:
				var t: Texture2D = (c as TextureRect).texture
				line += " tex=" + ("无" if t == null else (t.atlas.resource_path.get_file() if t is AtlasTexture else t.resource_path.get_file()))
			if c is Label or c is Button or c is TextureRect or c is PanelContainer: print("dump ", line)
		stack.append_array(n.get_children())


## 与 tools/capture_cult_panels.cjs 同样推进师门开场：点对白“下一句”，遇选项选最后一项（改日受教），
## 再点“知道了 / 继续”类按钮，直到底栏至少 4 个可点
static func _nav(h: Node) -> Node:
	if h.ui is Dictionary and h.ui.has("bottom") and h.ui.bottom is Dictionary and is_instance_valid(h.ui.bottom.get("nav")): return h.ui.bottom.nav
	return null

static func _advance(h: Node) -> void:
	var idle := 0
	for i in 800:
		var nav := _nav(h)
		if nav != null and nav.is_visible_in_tree():
			var en := 0
			for c in nav.get_children():
				if c is Button and not c.disabled: en += 1
			if en >= 4:
				print("shot: 底栏可点 ", i); return
		var vis: Array = []
		_collect(h.root, vis)
		var pick: Button = null
		var answers := vis.filter(func(b): return b.has_meta("answer"))
		for b in vis:
			if b.has_meta("next"): pick = b; break
		if pick == null and answers.size(): pick = answers[-1]
		if pick == null:
			for b in vis:
				if "知道了" in b.text or "继续" in b.text: pick = b; break
		if pick != null:
			idle = 0; pick.pressed.emit(); await _wait(h, 0.12)
		else:
			idle += 1
			if idle > 60: print("shot: 推进停住"); return
			await _wait(h, 0.4)

static func _collect(n: Node, out: Array) -> void:
	for c in n.get_children():
		if c is Button and (c as Button).is_visible_in_tree() and not (c as Button).disabled: out.append(c)
		_collect(c, out)
