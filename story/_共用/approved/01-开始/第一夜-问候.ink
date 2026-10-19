// 第一夜 · 问候（进村第一夜之后，第一次跟周婶、陈伯、叶蘅说话时的两三句寒暄）＋ 叶家门口的收药箱邀请
// 地点：栖河村（药棚、陈伯家门厅、叶家门口）　在场：萧白与被搭话的人
// 戏眼：吃饱换好衣裳后，村里人各自照应这个生人（周婶看他手上的伤、陈伯说客房腾好了并惦记狼的事）；萧白去叶家找叶蘅，她正一个人压不住满桌的纸，请他进门搭把手（P-04 的入口）。
// 2026-10-18 第 2 期：寒暄从 js/prologue-arrival.js 的 greetings 表、邀请从 js/qihe-map-trial.js inviteHome() 原样搬运，台词不改。
//   原台词没有编号，按“P-03-greet-<人>-序号”“P-04-00（邀请）”补编（规则见 docs/updates/2026-10-18-ink-phase2.md）。
//   叶蘅的两句寒暄在两处共用（直接搭话、门口邀请），写成隧道 greet_ye_lines，只存一份。
// 2026-10-19 剧情三道关改造（戏眼卡 xiaojianghu/docs/design/scripts/briefs/firstnight-actors-brief.json FN-aunt、FN-chen、FN-relic）：
//   周婶寒暄接上进村时没再看的擦伤；陈伯寒暄接上“客房腾好了”和村里对狼的反应；叶家门口先由萧白敲门报名；
//   已寒暄过就不再重复寒暄；邀请改成说明她在收药箱，进屋后 P-04-01 不再重复“压布”的请求。寒暄紧接着周婶托付（同一次搭话）播出，见第一夜-周婶托付.ink。
//   冷读审读后：删掉陈伯寒暄里的鞋（后面没有下文）。
INCLUDE ../_共用/externals.ink

=== qihe_greet_aunt ===
#cast:萧白,周婶
周婶：吃饱了没？手伸过来我瞧瞧——蹭破皮也不吭一声，闷葫芦。 #id:P-03-greet-aunt-01
萧白：小伤，不耽误干活。 #id:P-03-greet-aunt-02
~ set_flag("prologue.arrival.greeted.周婶", true)
~ checkpoint()
-> END

=== qihe_greet_chen ===
#cast:萧白,陈伯
陈伯：客房腾出来了，绳挪到墙角了。……后山真下来狼了？ #id:P-03-greet-chen-01
萧白：真的，两只，叶蘅打跑的。 #id:P-03-greet-chen-02
陈伯：明儿我跟大伙说一声，那条路先别走了。……你小子也算命大。 #id:P-03-greet-chen-03
~ set_flag("prologue.arrival.greeted.陈伯", true)
~ checkpoint()
-> END

=== qihe_greet_ye ===
#cast:萧白,叶蘅
-> greet_ye_lines ->
~ set_flag("prologue.arrival.greeted.叶蘅", true)
~ checkpoint()
-> END

=== greet_ye_lines ===
叶蘅：你怎么来了？头还晕不晕？ #id:P-03-greet-ye-01
萧白：好多了。想在村里转转认认路，结果连东南西北都没分清。 #id:P-03-greet-ye-02
->->

// 叶家门口：应邀帮忙收药箱（已答应过就直接进门；第一夜结束后屋里灯灭）
=== qihe_ye_invite ===
#cast:萧白
{ flag("prologue.rested"):
    萧白：（屋里灯灭了，她已经歇下了。明早再来吧。） #id:P-04-invite-closed
    -> END
}
{ not flag("prologue.yeHousePermission"):
    -> ask
}
-> enter

= ask
萧白：叶蘅，是我，萧白。 #id:P-04-invite-knock
{ not flag("prologue.arrival.greeted.叶蘅"):
    -> greet_ye_lines ->
}
~ set_flag("prologue.arrival.greeted.叶蘅", true)
叶蘅：来得正好，进来帮我一把！我在收药箱，门一开，风把纸吹得满屋跑。 #id:P-04-00
* [“好，我来。”]
    ~ set_flag("prologue.yeHousePermission", true)
    ~ checkpoint()
    -> enter
* [“我晚点再来。”]
    -> END

= enter
~ go_scene("prologue_ye_house", "entry")
-> END
