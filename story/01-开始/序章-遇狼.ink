// 序章 · 遇狼（P-02）
// 地点：栖河村后山采药路　在场：萧白、叶蘅、两只狼
// 戏眼：狼本在北坡，却被山里的生人撵到采药路上；萧白抄起木杆第一次上阵，叶蘅护着他退回村里。
// 2026-10-18 第 2 期：从 js/prologue-arrival.js dog() 原样搬运。
// 2026-10-19 剧情三道关改造（戏眼卡 P2-wolves、P2-after）：战前只下命令、分活；靴印与有人撵狼挪到战后。删去 P-02-thought1、P-02-N01。战斗与重试提示仍是游戏界面（wolf_battle）。
INCLUDE ../_共用/externals.ink

=== prologue_dog ===
#cast:萧白,叶蘅
~ backhill_show("dog")
叶蘅：嘘……有狼。 #id:P-02-01
叶蘅：站我身后，别跑！ #id:P-02-02
~ backhill_guard(true)
萧白：（脚边有根棍子！） #id:P-02-03
萧白：它们在往两边绕！ #id:P-02-04
叶蘅：棍子横在胸前，守住你自己，别往前冲！右边那只我来。 #id:P-02-05
~ mark("P-02-06")
// 每次开打记 P-02-07；输了可重试，选“稍后再试”则本段中止、留在开战前的存档点
~ wolf_battle()
叶蘅：退了……先别动，等等看。 #id:P-02-08
~ backhill_retreat()
萧白：（……就这么走了？） #id:P-02-09
叶蘅：撒手，让我看看你伤着没有。 #id:P-02-10
萧白：手上擦破点皮……你怎么一点都不怕？ #id:P-02-11
~ backhill_guard(false)
萧白：（手还在抖……） #id:P-02-12
叶蘅：怕啊，腿到现在还软着。……这么多人的脚印，都往北坡去了。 #id:P-02-traces
~ set_flag("prologue.wolf_disturbance_observed", true)
萧白：这山里的狼，平常也这样？ #id:P-02-13a
叶蘅：平常不下这条路。……听，狗叫。有人在山上撵狼，它们还会往这边跑。快回村。 #id:P-02-13
~ set_flag("prologue.arrival.dogResult", "win")
~ set_flag("prologue.arrival.stage", "lodging")
~ checkpoint()
-> END
