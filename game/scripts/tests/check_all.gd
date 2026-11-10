extends Node
## 编译检查（-- --checkall，配 --headless）：在游戏里（全局单例都在）逐个载入 scripts/ 下的脚本和 shaders/ 下的着色器，
## 打印编译不过的文件，最后一行“检查完毕 脚本 N 个 失败 M 个”，然后退出。
## 单独 `godot -s` 跑不了，因为那样没有全局单例，凡是引用 UI、G、DB 的脚本都会报找不到。

func _walk(p: String, ext: String, out: Array) -> void:
	for f in DirAccess.get_files_at(p):
		if f.ends_with(ext): out.append(p.path_join(f))
	for d in DirAccess.get_directories_at(p): _walk(p.path_join(d), ext, out)

func _ready() -> void:
	var scripts := []; _walk("res://scripts", ".gd", scripts)
	var shaders := []; _walk("res://shaders", ".gdshader", shaders)
	var bad := 0
	for f in scripts:
		var s = load(f)
		if s == null or not s.can_instantiate(): bad += 1; print("编译失败 ", f)
	for f in shaders:
		if load(f) == null: bad += 1; print("编译失败 ", f)
	print("检查完毕 脚本 %d 个 着色器 %d 个 失败 %d 个" % [scripts.size(), shaders.size(), bad])
	get_tree().quit(1 if bad else 0)
