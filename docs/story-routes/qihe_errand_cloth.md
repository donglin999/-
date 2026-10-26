# 路线：qihe_errand_cloth（01-开始/第一夜-取布.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 5 条路线。

## 路线 1：prologue.errands.cloth="none"

- 店家：客官住店？对不住，满了。

## 路线 2：prologue.errands.cloth="accepted"，选：在门口听一会儿

- 帮众：掌柜的，姓叶的那家怎么走？说利索点！
- 店家：小的真不清楚，您明儿白天问问旁人吧。
  ▶ 选：在门口听一会儿
- 帮众：少糊弄！满村都传遍了，叶家缺钱，有只旧玉匣肯卖——你会不晓得？
- 萧白：（姓叶的……是叶蘅家？）
  〔set_flag("prologue.heard.box", true)〕
- 萧白：掌柜的，周婶让我来取布。
- 店家：好好好，布在这儿。劳驾跟周婶说声，布今儿收迟了。
  〔set_flag("prologue.errands.cloth", "collected")〕
  〔carry("cloth", 1)〕
  〔checkpoint()〕
  〔toast_for("拿到布包", 1500)〕

## 路线 3：prologue.errands.cloth="accepted"，选：上前找掌柜取布

- 帮众：掌柜的，姓叶的那家怎么走？说利索点！
- 店家：小的真不清楚，您明儿白天问问旁人吧。
  ▶ 选：上前找掌柜取布
- 萧白：掌柜的，我替周婶取布。
- 帮众：哪儿来的小子，没瞧见爷正问话么？
- 店家：好好好，布在这儿。劳驾跟周婶说声，布今儿收迟了。
  〔set_flag("prologue.errands.cloth", "collected")〕
  〔carry("cloth", 1)〕
  〔checkpoint()〕
  〔toast_for("拿到布包", 1500)〕

## 路线 4：prologue.errands.cloth="collected"

- 店家：布不是给你了？还有事？

## 路线 5：prologue.errands.cloth="done"

- 店家：布不是给你了？还有事？
