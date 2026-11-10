extends Node
## 主线流程与场景逻辑的总入口（对应原版 qihe-chapter / prologue-* / qihe-town / qihe-expansion 等挂在 SC 上的 show/act/enter）。
## 各段流程脚本在 _ready 里把 Callable 挂到 World.scenes 的 NPC 与场景上；这里给出未挂逻辑时的缺省行为。

var modules := []

func _ready() -> void:
	call_deferred("_install")

## 模块按原版脚本加载顺序装：后装的包裹前面装的 act（与原版 index.html 顺序一致）
const MODULES := [["Prologue", "res://scripts/flow/prologue.gd"], ["Chapter", "res://scripts/flow/chapter.gd"], ["Side", "res://scripts/flow/side.gd"]]

func _install() -> void:
	for m in MODULES:
		if ResourceLoader.exists(m[1]):
			var sc = load(m[1])
			if sc == null or not sc.can_instantiate():
				push_error("流程模块加载失败：" + m[1]); continue
			var node: Node = sc.new()
			node.name = m[0]
			add_child(node)
			modules.append(node)

func prologue() -> Node:
	return get_node_or_null("Prologue")

func scene_frozen() -> bool:
	var p := prologue()
	return p != null and G.S != null and G.mode == "scene" and p.fixed_scene()

func frozen_camera() -> void:
	var p := prologue()
	if p: p.fixed(); p.camera()

## 读档进场时的主线场景修正（原版 QiheChapter.restoreScene）
func restore_scene() -> void:
	var c := get_node_or_null("Chapter")
	if c and c.has_method("restore_scene"): c.restore_scene()

func default_show(_sc: Dictionary, _n: Dictionary) -> bool:
	return true

func default_act(_sc: Dictionary, n: Dictionary) -> void:
	await Dialog.say(n.get("name", ""), "（这段交互尚未移植）", n.get("sp", ""))

func chest_opened(id: String) -> bool:
	return G.S != null and G.S.get("qiheTown", {}).get("chests", {}).get(id, false)   # 原版 qihe-treasure.js opened()

## 标题页“继续进度”下面那行：最近一条江湖经历（原版 QiheMilestones.latest）
func milestone_latest(s: Dictionary) -> String:
	var side := get_node_or_null("Side")
	if side and side.has_method("milestone_latest"): return side.milestone_latest(s)
	return "初到栖河"

## 剧情战斗统一入口：测试时（--walkthrough）跳过战斗按胜利处理，与原版对照脚本一致
var skip_battles := false
func run_battle(opt: Dictionary) -> String:
	var b = get_node_or_null("/root/Battle")
	if skip_battles or b == null or not b.has_method("start"): return "win"
	return await b.start(opt)

## 回到标题（菜单“返回首页”、培养模式“回到标题”调用）：先存档，清掉地图与界面，再挂标题页
func to_title() -> void:
	G.save()
	# 从培养模式的江湖菜单里点“返回首页”“载入存档”：培养界面一并收起（2026-11-05 统一 Esc 菜单后）
	if Cultivation.get("_active"): Cultivation.leave()
	World.active = false; World.cur = {}; World.cur_id = ""; World.npcs = []; World.busy = false
	G.mode = "title"; G.S = null
	var m = get_node_or_null("/root/Menu")
	if m and m.has_method("close"): m.close()
	UI.hud()
	get_tree().root.add_child(load("res://scenes/title.tscn").instantiate())
