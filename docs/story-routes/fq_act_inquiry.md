# 路线：fq_act_inquiry（01-开始/风起-村口问讯.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 12 条路线。

## 路线 1：shen_open=false，zhou_west=false，met_zhou=false，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
  〔fq_go_local("chen_hall", "")〕
- 周砚：你是叶姑娘吧？我早年认得你父亲温行舟，来问问他的消息——不是来收箱子的。
- 叶蘅：要是有他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 2：shen_open=false，zhou_west=false，met_zhou=true，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
  〔fq_go_local("chen_hall", "")〕
- 叶蘅：周先生，您上回说认得我父亲。您最后一回见他，或是收到他的信，是什么时候？
- 周砚：我也好些年没他的信了。这回来，就是想问他回来过没有。
- 叶蘅：……要是有了他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 3：shen_open=false，zhou_west=true，met_zhou=false，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
- 周砚：你是叶姑娘吧？我早年认得你父亲温行舟，来问问他的消息——不是来收箱子的。
- 叶蘅：要是有他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 4：shen_open=false，zhou_west=true，met_zhou=true，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
- 叶蘅：周先生，您上回说认得我父亲。您最后一回见他，或是收到他的信，是什么时候？
- 周砚：我也好些年没他的信了。这回来，就是想问他回来过没有。
- 叶蘅：……要是有了他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 5：shen_open=true，zhou_west=false，met_zhou=false，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
  〔fq_go_local("chen_hall", "")〕
- 周砚：你是叶姑娘吧？我早年认得你父亲温行舟，来问问他的消息——不是来收箱子的。
- 叶蘅：要是有他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 6：shen_open=true，zhou_west=false，met_zhou=false，选：“去问问查药的沈姑娘。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问查药的沈姑娘。”
  〔set_flag("qiheChapter.choices.inquiry", "court")〕
  〔fq_go_area("east", "chengduo")〕
- 沈雁回：我替程巡检查这趟药。可采办那张单子说药早验过了，还说叶家答应交样——我正要找当初看药的大夫对一对。
- 叶蘅：这几天没有查药的人来过药棚，怎么就验过了？我也没答应过什么。
- 沈雁回：好，我记下了。病人的药先放行，单子的事我再查。

## 路线 7：shen_open=true，zhou_west=false，met_zhou=true，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
  〔fq_go_local("chen_hall", "")〕
- 叶蘅：周先生，您上回说认得我父亲。您最后一回见他，或是收到他的信，是什么时候？
- 周砚：我也好些年没他的信了。这回来，就是想问他回来过没有。
- 叶蘅：……要是有了他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 8：shen_open=true，zhou_west=false，met_zhou=true，选：“去问问查药的沈姑娘。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问查药的沈姑娘。”
  〔set_flag("qiheChapter.choices.inquiry", "court")〕
  〔fq_go_area("east", "chengduo")〕
- 沈雁回：我替程巡检查这趟药。可采办那张单子说药早验过了，还说叶家答应交样——我正要找当初看药的大夫对一对。
- 叶蘅：这几天没有查药的人来过药棚，怎么就验过了？我也没答应过什么。
- 沈雁回：好，我记下了。病人的药先放行，单子的事我再查。

## 路线 9：shen_open=true，zhou_west=true，met_zhou=false，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
- 周砚：你是叶姑娘吧？我早年认得你父亲温行舟，来问问他的消息——不是来收箱子的。
- 叶蘅：要是有他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 10：shen_open=true，zhou_west=true，met_zhou=false，选：“去问问查药的沈姑娘。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问查药的沈姑娘。”
  〔set_flag("qiheChapter.choices.inquiry", "court")〕
  〔fq_go_area("east", "chengduo")〕
- 沈雁回：我替程巡检查这趟药。可采办那张单子说药早验过了，还说叶家答应交样——我正要找当初看药的大夫对一对。
- 叶蘅：这几天没有查药的人来过药棚，怎么就验过了？我也没答应过什么。
- 沈雁回：好，我记下了。病人的药先放行，单子的事我再查。

## 路线 11：shen_open=true，zhou_west=true，met_zhou=true，选：“去问问周先生。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问周先生。”
  〔set_flag("qiheChapter.choices.inquiry", "friend")〕
- 叶蘅：周先生，您上回说认得我父亲。您最后一回见他，或是收到他的信，是什么时候？
- 周砚：我也好些年没他的信了。这回来，就是想问他回来过没有。
- 叶蘅：……要是有了他的消息，请先告诉我。
- 周砚：那是自然。

## 路线 12：shen_open=true，zhou_west=true，met_zhou=true，选：“去问问查药的沈姑娘。”

- 萧白：（叶蘅家的事，先去问谁好？）
  ▶ 选：“去问问查药的沈姑娘。”
  〔set_flag("qiheChapter.choices.inquiry", "court")〕
  〔fq_go_area("east", "chengduo")〕
- 沈雁回：我替程巡检查这趟药。可采办那张单子说药早验过了，还说叶家答应交样——我正要找当初看药的大夫对一对。
- 叶蘅：这几天没有查药的人来过药棚，怎么就验过了？我也没答应过什么。
- 沈雁回：好，我记下了。病人的药先放行，单子的事我再查。
