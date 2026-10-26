# 路线：qh_lamp_end_note（01-开始/支线-蔺管事-留话.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 5 条路线。

## 路线 1：exposed=false，qiheChapter.records.lamp.briefed=true，qiheChapter.records.lamp.seal=null

- 【邻村 · 渡口】
- 蔺管事：我傍晚上了后山，倒木已经空了。晚了一步。
- 蔺管事：这点路费拿着。你替我跑的腿，我记着。
  〔lamp_reward("fare")〕

## 路线 2：exposed=false，qiheChapter.records.lamp.briefed=true，qiheChapter.records.lamp.seal="seen"

- 【邻村 · 渡口】
- 蔺管事：我傍晚上了后山，倒木已经空了。晚了一步。
- 蔺管事：拿着——堂里打底的旧本子，外人练了也不打紧。你替我跑的腿，算这个。
  〔lamp_reward("book")〕

## 路线 3：exposed=false，qiheChapter.records.lamp.briefed=true，qiheChapter.records.lamp.seal="asked_openly"

- 【邻村 · 渡口】
- 蔺管事：我傍晚上了后山，倒木已经空了。晚了一步。
- 蔺管事：这点路费拿着。你替我跑的腿，我记着。
  〔lamp_reward("fare")〕

## 路线 4：exposed=false，qiheChapter.records.lamp.briefed=false

- 【邻村 · 渡口】
- 算命先生：托你的事，不用再跑了。这点路费拿着。
  〔lamp_reward("fare")〕

## 路线 5：exposed=true

- 萧白：（东埠那个挑夫拦住我——是算命先生的人。他只带了一句话：）
- 萧白：（“我只跟你一个人说过。”）
