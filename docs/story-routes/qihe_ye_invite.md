# 路线：qihe_ye_invite（01-开始/第一夜-问候.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 6 条路线。

## 路线 1：prologue.rested=true

- 萧白：（屋里灯灭了，她已经歇下了。明早再来吧。）

## 路线 2：prologue.rested=false，prologue.yeHousePermission=true

  〔go_scene("prologue_ye_house", "entry")〕

## 路线 3：prologue.rested=false，prologue.yeHousePermission=false，prologue.arrival.greeted.叶蘅=true，选：“好，我来。”

- 萧白：叶蘅，是我，萧白。
  〔set_flag("prologue.arrival.greeted.叶蘅", true)〕
- 叶蘅：来得正好，进来帮我一把！我在收药箱，门一开，风把纸吹得满屋跑。
  ▶ 选：“好，我来。”
  〔set_flag("prologue.yeHousePermission", true)〕
  〔checkpoint()〕
  〔go_scene("prologue_ye_house", "entry")〕

## 路线 4：prologue.rested=false，prologue.yeHousePermission=false，prologue.arrival.greeted.叶蘅=true，选：“我晚点再来。”

- 萧白：叶蘅，是我，萧白。
  〔set_flag("prologue.arrival.greeted.叶蘅", true)〕
- 叶蘅：来得正好，进来帮我一把！我在收药箱，门一开，风把纸吹得满屋跑。
  ▶ 选：“我晚点再来。”

## 路线 5：prologue.rested=false，prologue.yeHousePermission=false，prologue.arrival.greeted.叶蘅=false，选：“好，我来。”

- 萧白：叶蘅，是我，萧白。
- 叶蘅：你怎么来了？头还晕不晕？
- 萧白：好多了。想在村里转转认认路，结果连东南西北都没分清。
  〔set_flag("prologue.arrival.greeted.叶蘅", true)〕
- 叶蘅：来得正好，进来帮我一把！我在收药箱，门一开，风把纸吹得满屋跑。
  ▶ 选：“好，我来。”
  〔set_flag("prologue.yeHousePermission", true)〕
  〔checkpoint()〕
  〔go_scene("prologue_ye_house", "entry")〕

## 路线 6：prologue.rested=false，prologue.yeHousePermission=false，prologue.arrival.greeted.叶蘅=false，选：“我晚点再来。”

- 萧白：叶蘅，是我，萧白。
- 叶蘅：你怎么来了？头还晕不晕？
- 萧白：好多了。想在村里转转认认路，结果连东南西北都没分清。
  〔set_flag("prologue.arrival.greeted.叶蘅", true)〕
- 叶蘅：来得正好，进来帮我一把！我在收药箱，门一开，风把纸吹得满屋跑。
  ▶ 选：“我晚点再来。”
