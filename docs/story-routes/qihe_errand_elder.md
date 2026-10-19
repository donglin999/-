# 路线：qihe_errand_elder（01-开始/第一夜-送药.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 5 条路线。

## 路线 1：prologue.errands.medicine="none"

- 村口老人：哪家的孩子？面生得很。天黑道儿不好走，当心些。

## 路线 2：prologue.errands.medicine="accepted"，选：“那我陪您坐会儿。”

- 萧白：老人家，周婶让我给您送药来。
- 村口老人：又劳烦她了……小哥面生得很，是哪家的？
- 萧白：我叫萧白，今天刚到，借住在陈伯家。
- 村口老人：篮子搁门后呢，提手我给绑了几道，牢实着。别忘了带。
- 村口老人：不急着走吧？坐会儿。腿脚不利索，难得有人来说说话。
  ▶ 选：“那我陪您坐会儿。”
- 村口老人：下午有个随从在我门口问路，问药棚在哪儿。转头又跟差役说，叶家的药早验过了。
- 村口老人：验过的药就要装车拉走……我这把老骨头，全指着药棚那点药哩。
- 萧白：连药棚都没找着，就说验过了？
- 村口老人：谁说不是呢。差役不肯替他画押，两人在我门口磨了半天。
  〔set_flag("prologue.heard.inspection", true)〕
- 村口老人：篮子莫装太满，当心又松了。
- 萧白：知道了，我轻着点拿。您歇着。
  〔set_flag("prologue.errands.medicine", "delivered")〕
  〔uncarry("medicine")〕
  〔carry("basket", 1)〕
  〔checkpoint()〕
  〔toast_for("带回竹篮 · 回药棚归还", 1800)〕

## 路线 3：prologue.errands.medicine="accepted"，选：“不了，我拿了篮子就回。”

- 萧白：老人家，周婶让我给您送药来。
- 村口老人：又劳烦她了……小哥面生得很，是哪家的？
- 萧白：我叫萧白，今天刚到，借住在陈伯家。
- 村口老人：篮子搁门后呢，提手我给绑了几道，牢实着。别忘了带。
- 村口老人：不急着走吧？坐会儿。腿脚不利索，难得有人来说说话。
  ▶ 选：“不了，我拿了篮子就回。”
- 村口老人：篮子莫装太满，当心又松了。
- 萧白：知道了，我轻着点拿。您歇着。
  〔set_flag("prologue.errands.medicine", "delivered")〕
  〔uncarry("medicine")〕
  〔carry("basket", 1)〕
  〔checkpoint()〕
  〔toast_for("带回竹篮 · 回药棚归还", 1800)〕

## 路线 4：prologue.errands.medicine="delivered"

- 村口老人：回去替我谢谢周婶。

## 路线 5：prologue.errands.medicine="done"

- 村口老人：回去替我谢谢周婶。
