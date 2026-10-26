# 路线：qihe_errand_elder（01-开始/第一夜-送药.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 5 条路线。

## 路线 1：prologue.errands.medicine="none"

- 村口老人：哪家的孩子？面生得很。天黑道儿不好走，当心些。

## 路线 2：prologue.errands.medicine="accepted"，选：在一旁听一会儿

- 村口老人：差爷，下午那征药的随从说，叶家的药早验过了，要装车拉走？
- 萧白：（老人家在跟门外的差役说话……）
  ▶ 选：在一旁听一会儿
- 差役：没人画押，作不得数。
- 村口老人：他下午还站在我门口问药棚怎么走呢，验的哪门子药？
- 村口老人：我这把老骨头，全指着药棚那点药哩。
- 萧白：（连药棚都没找着，就说验过了？）
  〔set_flag("prologue.heard.inspection", true)〕
- 萧白：老人家，周婶让我给您送药来。
- 村口老人：又劳烦她了……小哥面生得很，是哪家的？
- 萧白：我叫萧白，今天刚到，借住在陈伯家。
- 村口老人：篮子搁门后头呢，提手我给绑牢实了。莫装太满，当心又松了。
- 萧白：知道了，我轻着点拿。您歇着。
  〔set_flag("prologue.errands.medicine", "delivered")〕
  〔uncarry("medicine")〕
  〔carry("basket", 1)〕
  〔checkpoint()〕
  〔toast_for("带回竹篮", 1500)〕

## 路线 3：prologue.errands.medicine="accepted"，选：上前把药递过去

- 村口老人：差爷，下午那征药的随从说，叶家的药早验过了，要装车拉走？
- 萧白：（老人家在跟门外的差役说话……）
  ▶ 选：上前把药递过去
- 萧白：老人家，周婶让我给您送药来。
- 村口老人：又劳烦她了……小哥面生得很，是哪家的？
- 萧白：我叫萧白，今天刚到，借住在陈伯家。
- 村口老人：篮子搁门后头呢，提手我给绑牢实了。莫装太满，当心又松了。
- 萧白：知道了，我轻着点拿。您歇着。
  〔set_flag("prologue.errands.medicine", "delivered")〕
  〔uncarry("medicine")〕
  〔carry("basket", 1)〕
  〔checkpoint()〕
  〔toast_for("带回竹篮", 1500)〕

## 路线 4：prologue.errands.medicine="delivered"

- 村口老人：回去替我谢谢周婶。

## 路线 5：prologue.errands.medicine="done"

- 村口老人：回去替我谢谢周婶。
