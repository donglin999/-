# 路线：qihe_errand_cloth（01-开始/第一夜-取布.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 5 条路线。

## 路线 1：prologue.errands.cloth="none"

- 店家：客官住店？对不住，满了。

## 路线 2：prologue.errands.cloth="accepted"，选：“不急，您慢慢包。”

- 萧白：掌柜的，我替周婶取布。
- 店家：刚收下来，就搁那条凳上。我去拿块布给你包上——
- 萧白：（那人要拖凳子……布！）
- 店家：客官，那凳子上搁着东西呢！
- 帮众：拿开不就得了？再给爷上两壶茶！
- 店家：……还好没沾地。这几天客人多，乱糟糟的，见笑。我这就给你包。
  ▶ 选：“不急，您慢慢包。”
- 帮众：掌柜的，打听个事——姓叶的那家怎么走？听说她家有只旧玉匣要卖。
- 店家：这位爷，小的真不知道。您明儿白天问问旁人吧。
- 帮众：少拿话搪塞我！满村都传遍了，她家缺钱，肯卖——你会不知道？
- 萧白：（姓叶的……是叶蘅家？）
  〔set_flag("prologue.heard.box", true)〕
- 店家：拿好。劳烦跟周婶说一声，今儿迟了，多包涵。
  〔set_flag("prologue.errands.cloth", "collected")〕
  〔carry("cloth", 1)〕
  〔checkpoint()〕
  〔toast_for("拿到受托布包 · 回药棚交给周婶", 1800)〕

## 路线 3：prologue.errands.cloth="accepted"，选：“不用包了，我直接拿走。”

- 萧白：掌柜的，我替周婶取布。
- 店家：刚收下来，就搁那条凳上。我去拿块布给你包上——
- 萧白：（那人要拖凳子……布！）
- 店家：客官，那凳子上搁着东西呢！
- 帮众：拿开不就得了？再给爷上两壶茶！
- 店家：……还好没沾地。这几天客人多，乱糟糟的，见笑。我这就给你包。
  ▶ 选：“不用包了，我直接拿走。”
- 店家：拿好。劳烦跟周婶说一声，今儿迟了，多包涵。
  〔set_flag("prologue.errands.cloth", "collected")〕
  〔carry("cloth", 1)〕
  〔checkpoint()〕
  〔toast_for("拿到受托布包 · 回药棚交给周婶", 1800)〕

## 路线 4：prologue.errands.cloth="collected"

- 店家：布不是给你了？还有事？

## 路线 5：prologue.errands.cloth="done"

- 店家：布不是给你了？还有事？
