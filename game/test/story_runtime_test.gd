extends GdUnitTestSuite
## 剧本运行器：外部函数排队与参数截断（2026-11-04 卡关：go_scene("场景","入口") 接到不收参数的函数时 callv 静默不执行）

const RT := preload("res://scripts/core/story_runtime.gd")

var rt: Node

func before_test() -> void:
	rt = auto_free(RT.new())   # 不进场景树，不读索引，只测排队逻辑

func test_多余参数被截掉_不收参数的函数照样执行() -> void:
	var hit := [0]
	rt._impl = {"go": func(): hit[0] += 1}
	rt._ext("go", ["prologue_backhill", "入口"])
	await rt._flush()
	assert_int(hit[0]).is_equal(1)

func test_参数多一个时只传前面的() -> void:
	var got := []
	rt._impl = {"go": func(s): got.append(s)}
	rt._ext("go", ["药棚", "门口"])
	await rt._flush()
	assert_array(got).contains_exactly(["药棚"])

func test_参数刚好时原样传() -> void:
	var got := []
	rt._impl = {"go": func(s, e): got.append_array([s, e])}
	rt._ext("go", ["药棚", "门口"])
	await rt._flush()
	assert_array(got).contains_exactly(["药棚", "门口"])

func test_外部函数按剧本顺序执行() -> void:
	var order := []
	rt._impl = {"a": func(): order.append("a"), "b": func(x): order.append(x)}
	rt._ext("a", [])
	rt._ext("b", ["b1"])
	rt._ext("a", ["多余"])
	await rt._flush()
	assert_array(order).contains_exactly(["a", "b1", "a"])

func test_台词行解析_说话人与标签() -> void:
	var l := RT.parse_line("护院：有事说。", ["id:QT-retainer-01", "mood:calm"])
	assert_str(l.who).is_equal("护院")
	assert_str(l.text).is_equal("有事说。")
	assert_str(l.id).is_equal("QT-retainer-01")
	assert_str(l.mood).is_equal("calm")
