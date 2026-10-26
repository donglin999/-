# 路线：qihe_errand_aunt（01-开始/第一夜-周婶托付.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 71 条路线。

## 路线 1：prologue.rested=true

- 周婶：都收拾完啦，你也早点歇着。

## 路线 2：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“三样都交给我，我跑一趟。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯的碗该还了，客栈的布该取了，老人家的药也包好了。都在村里，跑一圈认认路。
  ▶ 选：“三样都交给我，我跑一趟。”
- 周婶：碗在灶台边，搁陈伯桌上就成；布跟掌柜提我一声，他自然给你。
- 周婶：送完药，我那只竹篮在老人家修提手，顺手捎回来。都办完了再来找我。
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：替周婶跑一圈", 1600)〕

## 路线 3：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯的碗该还了，客栈的布该取了，老人家的药也包好了。都在村里，跑一圈认认路。
  ▶ 选：“我先四处转转。”

## 路线 4：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 5：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 6：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 7：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 8：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 9：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 10：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 11：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 12：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 13：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 14：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 15：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 16：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 17：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 18：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"

  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 19：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 20：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"

  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 21：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"

  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 22：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"

  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 23：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 24：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 25：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 26：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 27：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 28：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 29：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 30：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 31：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 32：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 33：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 34：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="done"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 35：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 36：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"

  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 37：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"

  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 38：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"

  〔set_flag("prologue.errands.cloth", "accepted")〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 39：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 40：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 41：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 42：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 43：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 44：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 45：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=true，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 46：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=true，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 47：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=false，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 48：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=false，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 49：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=true，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 50：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=true，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 51：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=false，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 52：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=false，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 53：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=true，prologue.heard.box=true，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 54：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=true，prologue.heard.box=true，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 55：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=true，prologue.heard.box=false，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 56：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=true，prologue.heard.box=false，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 57：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=false，prologue.heard.box=true，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 58：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=false，prologue.heard.box=true，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 59：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=false，prologue.heard.box=false，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 60：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，prologue.heard.skill=false，prologue.heard.box=false，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 61：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"

  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 62：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"

- 周婶：回来啦？剩下的不急，累了就歇着。

## 路线 63：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=true，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 64：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=true，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 65：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=false，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 66：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=true，prologue.heard.box=false，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 67：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=true，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 68：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=true，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 69：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=false，prologue.heard.inspection=true

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：路上听着什么了？眉头皱成那样。
- 萧白：听见几句闲话，还没听全……回头再说吧。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 70：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，prologue.heard.skill=false，prologue.heard.box=false，prologue.heard.inspection=false

- 萧白：碗送到了，布和竹篮都带回来了。
- 周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。
- 周婶：给，这个抹手上那道口子，别沾了水。
- 萧白：谢谢周婶。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("cloth")〕
  〔uncarry("basket")〕
  〔set_flag("prologue.errandGift", true)〕
  〔checkpoint()〕
  〔toast_for("替周婶跑一圈 · 办完了", 1400)〕

## 路线 71：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="done"

- 周婶：今儿多亏你了，早点歇着。
