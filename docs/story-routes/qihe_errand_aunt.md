# 路线：qihe_errand_aunt（01-开始/第一夜-周婶托付.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 153 条路线。

## 路线 1：prologue.rested=true

- 周婶：都收拾完啦，你也早点歇着。

## 路线 2：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 3：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 4：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 5：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 6：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 7：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 8：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。
- 周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 9：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 10：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 11：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 12：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 13：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 14：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 15：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 16：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 17：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 18：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 19：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 20：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 21：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 22：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 23：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 24：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 25：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 26：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 27：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 28：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 29：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 30：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 31：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 32：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 33：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 34：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 35：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 36：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 37：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 38：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 39：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 40：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 41：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 42：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 43：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 44：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 45：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 46：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 47：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 48：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 49：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 50：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 51：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 52：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 53：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 54：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 55：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 56：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 57：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 58：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 59：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 60：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 61：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 62：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 63：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 64：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 65：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 66：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 67：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 68：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 69：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 70：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 71：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.bowls", "accepted")〕
  〔carry("bowls", 2)〕
  〔checkpoint()〕
  〔toast_for("已接：还碗", 1600)〕

## 路线 72：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“陈伯家的碗，我帮您送回去。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“陈伯家的碗，我帮您送回去。”
- 周婶：就灶台边那两只，借了好几天了。搁他桌上就行。
  ▶ 选：“我等会儿再去。”

## 路线 73：prologue.rested=false，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 74：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 75：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 76：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 77：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 78：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 79：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 80：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 81：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 82：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 83：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 84：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 85：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 86：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 87：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 88：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 89：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 90：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 91：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 92：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 93：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 94：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 95：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 96：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 97：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 98：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 99：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 100：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 101：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 102：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 103：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 104：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 105：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 106：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 107：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 108：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 109：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 110：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 111：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 112：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 113：prologue.rested=false，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 114：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 115：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 116：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 117：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 118：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 119：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 120：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 121：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 122：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 123：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 124：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 125：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 126：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“客栈的布，我去取。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.cloth", "accepted")〕
  〔checkpoint()〕
  〔toast_for("已接：取布", 1600)〕

## 路线 127：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“客栈的布，我去取。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“客栈的布，我去取。”
- 周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。
  ▶ 选：“我等会儿再去。”

## 路线 128：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 129：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 130：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 131：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 132：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 133：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 134：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 135：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 136：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 137：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 138：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 139：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 140：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 141：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 142：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 143：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 144：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 145：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“周婶，布取回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“周婶，布取回来了。”
- 萧白：掌柜的说店里忙，耽搁了一会儿。
- 周婶：辛苦你了，搁那边高架上吧。
  〔set_flag("prologue.errands.cloth", "done")〕
  〔uncarry("cloth")〕
  〔checkpoint()〕
  〔toast_for("取布完成", 1200)〕

## 路线 146：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 147：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“好，我这就去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“好，我这就去。”
  〔set_flag("prologue.errands.medicine", "accepted")〕
  〔carry("medicine", 1)〕
  〔checkpoint()〕
  〔toast_for("已接：送药与还篮", 1600)〕

## 路线 148：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“老人家的药，我去送。”，选：“我等会儿再去。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“老人家的药，我去送。”
- 周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。
  ▶ 选：“我等会儿再去。”

## 路线 149：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 150：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 151：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“竹篮带回来了。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“竹篮带回来了。”
- 周婶：老人家怎么样？
- 萧白：精神还好，就是腿脚不太灵便。
- 周婶：那就好。篮子搁门边吧。
  〔set_flag("prologue.errands.medicine", "done")〕
  〔uncarry("basket")〕
  〔checkpoint()〕
  〔toast_for("竹篮已归还", 1200)〕

## 路线 152：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”

## 路线 153：prologue.rested=false，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“我先四处转转。”

- 周婶：回来啦？剩下的不急，累了就歇着。
  ▶ 选：“我先四处转转。”
