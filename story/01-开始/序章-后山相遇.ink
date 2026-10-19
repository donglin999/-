// 序章 · 后山相遇（P-01 开头与收尾；中间的递水另见 序章-递水.ink）
// 地点：栖河村后山　在场：萧白、叶蘅
// 戏眼：来历不明的萧白在后山醒来，被叶蘅喝住、带下山。
// 2026-10-18 第 2 期：从 js/prologue-arrival.js encounter() 原样搬运。
// 2026-10-19 剧情三道关改造：戏眼卡 xiaojianghu/docs/design/scripts/briefs/prologue-actors-brief.json（P1-encounter、P1-walk），MiniMax 演员法起草、主会话剪辑。删去 P-01-07；来历只在递水时问一次。
INCLUDE ../_共用/externals.ink

=== prologue_encounter ===
#cast:萧白,叶蘅
~ backhill_show("encounter")
萧白：（头好沉……这是哪儿？） #id:P-01-01
萧白：有人吗？ #id:P-01-02
叶蘅：哎！莫往那走！ #id:P-01-03
叶蘅：那坡全是碎石头，踩上去就滑！ #id:P-01-04
萧白：你好……这是哪儿？ #id:P-01-05
叶蘅：栖河村后山。……你这穿的是什么？ #id:P-01-06
萧白：（手机……没信号。） #id:P-01-06b
叶蘅：先坐下，你晃成这样了。我这儿有水。 #id:P-01-06c
~ water_scene()
萧白：好，我跟着你。 #id:P-01-N03
叶蘅：跟紧了，脚底下看路。 #id:P-01-N04
萧白：（她放慢了脚步……是在等我。） #id:P-01-17
~ set_flag("prologue.arrival.stage", "dog")
~ checkpoint()
-> END
