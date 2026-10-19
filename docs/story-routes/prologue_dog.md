# 路线：prologue_dog（01-开始/序章-遇狼.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 1 条路线。

## 路线 1：（无分支）

  〔backhill_show("dog")〕
- 叶蘅：嘘……有狼。
- 叶蘅：站我身后，别跑！
  〔backhill_guard(true)〕
- 萧白：（脚边有根棍子！）
- 萧白：它们在往两边绕！
- 叶蘅：棍子横在胸前，守住你自己，别往前冲！右边那只我来。
  〔mark("P-02-06")〕
  〔wolf_battle()〕
- 叶蘅：退了……先别动，等等看。
  〔backhill_retreat()〕
- 萧白：（……就这么走了？）
- 叶蘅：撒手，让我看看你伤着没有。
- 萧白：手上擦破点皮……你怎么一点都不怕？
  〔backhill_guard(false)〕
- 萧白：（手还在抖……）
- 叶蘅：怕啊，腿到现在还软着。……这么多人的脚印，都往北坡去了。
  〔set_flag("prologue.wolf_disturbance_observed", true)〕
- 萧白：这山里的狼，平常也这样？
- 叶蘅：平常不下这条路。……听，狗叫。有人在山上撵狼，它们还会往这边跑。快回村。
  〔set_flag("prologue.arrival.dogResult", "win")〕
  〔set_flag("prologue.arrival.stage", "lodging")〕
  〔checkpoint()〕
