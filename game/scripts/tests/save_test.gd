extends Node
## 存档管理自测：--state=<存档> --savetest。新建 → 重命名 → 移入回收站 → 恢复 → 载入（另开旅程）→ 列表，打印每步结果，最后删掉测试产生的文件。
## 加 --savetest=shot 时停在存档管理抽屉，供截图。

func _ready() -> void:
	await get_tree().create_timer(1.0).timeout
	var made := [G.save_key]
	G.save()
	var r := G.save_command("create", ["入谷前"]); print("新建：", r)
	var slot := ""
	for x in G.save_list():
		if x.get("manual", false) and x.name == "入谷前": slot = x.key
	made.append(slot)
	print("空名：", G.save_command("create", ["  "]))
	print("重命名：", G.save_command("rename", [slot, "试剑石下"]))
	print("当前进回收站：", G.save_command("archive", [G.save_key]))
	print("移入回收站：", G.save_command("archive", [slot]))
	print("回收站里载入：", G.save_command("load", [slot]))
	print("恢复：", G.save_command("archive", [slot, true]))
	for x in G.save_list(): print("  列表 ", x.name, " 当前=", x.current, " 手动=", x.get("manual", false), " 回收=", x.get("archived", false))
	if str(OS.get_cmdline_user_args()).contains("savetest=shot"):
		Menu.open("sys", "hero")
		await get_tree().process_frame
		var m = Menu
		load("res://scripts/menu/page_sys.gd")._save_manager(m, "active")
		return
	var before := G.save_key
	print("载入手动存档：", G.save_command("load", [slot]))
	await get_tree().create_timer(3.0).timeout
	print("载入后旅程：", G.save_key, " 不同于原旅程=", G.save_key != before, " 名称=", G.save_label(G.save_key, G.S), " 场景=", World.cur_id, " 模式=", G.mode)
	made.append(G.save_key)
	for k in made:
		if k != "": DirAccess.remove_absolute(ProjectSettings.globalize_path("user://saves/%s.json" % k))
	print("存档自测结束")
	get_tree().quit()
