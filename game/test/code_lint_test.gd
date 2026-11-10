extends GdUnitTestSuite
## 代码写法检查（2026-11-05）：全人物扫荡查出过的坑，写成静态检查，免得再犯。
## 坑：GDScript 单行 lambda 的冒号后面整行都算 lambda 体。`a.show = func(): return x; a.act = func(): …`
## 第二句被吞进第一个 lambda、还排在 return 后面，永远执行不到（药棚叶蘅“谈”因此只出“尚未移植”）。

func _gd_files(dir: String, out: Array) -> void:
	for f in DirAccess.get_files_at(dir):
		if f.ends_with(".gd"): out.append(dir.path_join(f))
	for d in DirAccess.get_directories_at(dir):
		_gd_files(dir.path_join(d), out)

## 取单行 lambda 的体（遇到不成对的右括号就停：lambda 在调用参数里时，右括号后面不算它）
func _body(line: String) -> String:
	var re := RegEx.create_from_string("func\\s*\\([^)]*\\)[^:]*:\\s*(.*)$")
	var m := re.search(line)
	if m == null: return ""
	var b := m.get_string(1)
	var depth := 0
	for i in b.length():
		var c := b[i]
		if c in "([{": depth += 1
		elif c in ")]}":
			if depth == 0: return b.substr(0, i)
			depth -= 1
	return b

func test_单行lambda里return后面没有别的语句() -> void:
	var files := []
	_gd_files("res://scripts", files)
	var bad := []
	for p in files:
		var lines := FileAccess.get_file_as_string(p).split("\n")
		for i in lines.size():
			var s := lines[i].strip_edges()
			if s.begins_with("#"): continue
			var parts := _body(s).split(";")
			for k in parts.size() - 1:
				if parts[k].strip_edges().begins_with("return") and parts[k + 1].strip_edges() != "":
					bad.append("%s:%d  %s" % [p, i + 1, s.substr(0, 120)])
	assert_array(bad).override_failure_message("单行 lambda 的 return 后面还有语句（执行不到）：\n" + "\n".join(bad)).is_empty()

func test_同一行不连着给两个lambda赋值() -> void:
	var files := []
	_gd_files("res://scripts", files)
	var re := RegEx.create_from_string("= func\\([^)]*\\)[^;]*;.*= func\\(")
	var bad := []
	for p in files:
		var lines := FileAccess.get_file_as_string(p).split("\n")
		for i in lines.size():
			if not lines[i].strip_edges().begins_with("#") and re.search(lines[i]) != null:
				bad.append("%s:%d" % [p, i + 1])
	assert_array(bad).override_failure_message("同一行连着赋两个 lambda，后一个会被吞进前一个：\n" + "\n".join(bad)).is_empty()

## 坑：GDScript 的 bool() 只收真假和数字，收到 null、字符串、字典、数组就报错并中断（培养模式打开江湖菜单时 bool(learned.breathing) 因此出错）。
## 原版 JS 一律按真假算：用 preload("res://scripts/npc/util.gd").t(x)。bool(a or b) 这种本来就是真假值的可以。
func test_不用bool构造接可能为空的值() -> void:
	var files := []
	_gd_files("res://scripts", files)
	var re := RegEx.create_from_string("(?<![A-Za-z_.])bool\\(([^()]*(\\([^()]*\\))?[^()]*)\\)")
	var bad := []
	for p in files:
		if "/tests/" in p: continue
		var lines := FileAccess.get_file_as_string(p).split("\n")
		for i in lines.size():
			var s := lines[i].strip_edges()
			if s.begins_with("#") or s.begins_with("func ") or s.begins_with("static func "): continue
			for m in re.search_all(s):
				var inner := m.get_string(1)
				if " or " in inner or " and " in inner or inner.begins_with("not ") or " == " in inner or " != " in inner: continue
				bad.append("%s:%d  %s" % [p, i + 1, s.substr(0, 120)])
	assert_array(bad).override_failure_message("bool() 可能收到空值或字典（会报错），改用 util.gd 的 t()：\n" + "\n".join(bad)).is_empty()
