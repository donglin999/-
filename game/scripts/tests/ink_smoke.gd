extends SceneTree
func _initialize():
	print("start")
	var InkStory = load("res://addons/inkgd/runtime/ink_story.gd")
	var f = FileAccess.open("res://data/story/prologue_water.json", FileAccess.READ)
	var t0 = Time.get_ticks_msec()
	var st = InkStory.new(f.get_as_text())
	print("parse ms ", Time.get_ticks_msec()-t0)
	for e in ["water_scene","hide_water_cg","water_branch","carry","uncarry","night_falls","hand_off_first_night","flag","set_flag","toast","mark","checkpoint"]:
		st.bind_external_function(e, func(a=null,b=null,c=null): print("  EXT ",e," ",a," ",b); return 0, true)
	st.choose_path_string("prologue_water")
	var n = 0
	while n < 40:
		while st.can_continue:
			print(st.continue_story().strip_edges(), " ", st.current_tags)
		if st.current_choices.size() == 0: break
		print("  choices: ", st.current_choices.map(func(c): return c.text))
		st.choose_choice_index(0); n += 1
	quit()
