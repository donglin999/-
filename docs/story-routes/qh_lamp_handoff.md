# 路线：qh_lamp_handoff（01-开始/支线-蔺管事-灯四.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 13 条路线。

## 路线 1：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=true，选：“先拿东埠的船，再上后山。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“先拿东埠的船，再上后山。”
  〔set_flag("qiheChapter.records.lamp.handoff", "blade_order")〕
- 萧白：他今早让脚夫带走一包东西。脚夫天黑才回东埠的船——先拿船，再上山。
- 蔺管事：船是我的本行。……这事，你别再沾手了。

## 路线 2：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=true，选：“您现在就上后山。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“您现在就上后山。”
  〔set_flag("qiheChapter.records.lamp.handoff", "blade_direct")〕
- 蔺管事：白天上山？他坐在高处，看得见路。……也罢，我去看看。

## 路线 3：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=true，选：“我自己去问他。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“我自己去问他。”
  〔set_flag("qiheChapter.records.lamp.handoff", "confront")〕
- 蔺管事：你一问，他就知道有人在查了。……随你。
- 【后山 · 倒木】
- 萧白：（倒木上没有人。……他不在。）

## 路线 4：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=true，选：“这事该告诉岑姑娘。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“这事该告诉岑姑娘。”
  〔set_flag("qiheChapter.records.lamp.handoff", "cen")〕
- 蔺管事：告诉她？她不会认我这份情。……你要去，就去吧。
- 【东埠】
- 萧白：后山倒木有个账房，在三家中间牵线。
- 萧白：是北路摆摊的算命先生查出来的，腰上挂着盏小铜灯的那位。
- 岑霜：……管船的。我的差事，轮不到他来查。
- 岑霜：乌魁，带两个人上后山看看。
- 乌魁：你一个借住的，怎么知道后山有人？
- 萧白：（她没谢我。乌魁那双眼睛，倒是盯上我了。）

## 路线 5：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=false，选：“您现在就上后山。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“您现在就上后山。”
  〔set_flag("qiheChapter.records.lamp.handoff", "blade_direct")〕
- 蔺管事：白天上山？他坐在高处，看得见路。……也罢，我去看看。

## 路线 6：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=false，选：“我自己去问他。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“我自己去问他。”
  〔set_flag("qiheChapter.records.lamp.handoff", "confront")〕
- 蔺管事：你一问，他就知道有人在查了。……随你。
- 【后山 · 倒木】
- 萧白：（倒木上没有人。……他不在。）

## 路线 7：qiheChapter.records.lamp.boatman=true，qiheChapter.records.lamp.porter_seen=false，选：“这事该告诉岑姑娘。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“这事该告诉岑姑娘。”
  〔set_flag("qiheChapter.records.lamp.handoff", "cen")〕
- 蔺管事：告诉她？她不会认我这份情。……你要去，就去吧。
- 【东埠】
- 萧白：后山倒木有个账房，在三家中间牵线。
- 萧白：是北路摆摊的算命先生查出来的，腰上挂着盏小铜灯的那位。
- 岑霜：……管船的。我的差事，轮不到他来查。
- 岑霜：乌魁，带两个人上后山看看。
- 乌魁：你一个借住的，怎么知道后山有人？
- 萧白：（她没谢我。乌魁那双眼睛，倒是盯上我了。）

## 路线 8：qiheChapter.records.lamp.boatman=false，qiheChapter.records.lamp.porter_seen=true，选：“您现在就上后山。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“您现在就上后山。”
  〔set_flag("qiheChapter.records.lamp.handoff", "blade_direct")〕
- 蔺管事：白天上山？他坐在高处，看得见路。……也罢，我去看看。

## 路线 9：qiheChapter.records.lamp.boatman=false，qiheChapter.records.lamp.porter_seen=true，选：“我自己去问他。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“我自己去问他。”
  〔set_flag("qiheChapter.records.lamp.handoff", "confront")〕
- 蔺管事：你一问，他就知道有人在查了。……随你。
- 【后山 · 倒木】
- 萧白：（倒木上没有人。……他不在。）

## 路线 10：qiheChapter.records.lamp.boatman=false，qiheChapter.records.lamp.porter_seen=true，选：“这事该告诉岑姑娘。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“这事该告诉岑姑娘。”
  〔set_flag("qiheChapter.records.lamp.handoff", "cen")〕
- 蔺管事：告诉她？她不会认我这份情。……你要去，就去吧。
- 【东埠】
- 萧白：后山倒木有个账房，在三家中间牵线。
- 萧白：是北路摆摊的算命先生查出来的，腰上挂着盏小铜灯的那位。
- 岑霜：……管船的。我的差事，轮不到他来查。
- 岑霜：乌魁，带两个人上后山看看。
- 乌魁：你一个借住的，怎么知道后山有人？
- 萧白：（她没谢我。乌魁那双眼睛，倒是盯上我了。）

## 路线 11：qiheChapter.records.lamp.boatman=false，qiheChapter.records.lamp.porter_seen=false，选：“您现在就上后山。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“您现在就上后山。”
  〔set_flag("qiheChapter.records.lamp.handoff", "blade_direct")〕
- 蔺管事：白天上山？他坐在高处，看得见路。……也罢，我去看看。

## 路线 12：qiheChapter.records.lamp.boatman=false，qiheChapter.records.lamp.porter_seen=false，选：“我自己去问他。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“我自己去问他。”
  〔set_flag("qiheChapter.records.lamp.handoff", "confront")〕
- 蔺管事：你一问，他就知道有人在查了。……随你。
- 【后山 · 倒木】
- 萧白：（倒木上没有人。……他不在。）

## 路线 13：qiheChapter.records.lamp.boatman=false，qiheChapter.records.lamp.porter_seen=false，选：“这事该告诉岑姑娘。”

- 蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？
  ▶ 选：“这事该告诉岑姑娘。”
  〔set_flag("qiheChapter.records.lamp.handoff", "cen")〕
- 蔺管事：告诉她？她不会认我这份情。……你要去，就去吧。
- 【东埠】
- 萧白：后山倒木有个账房，在三家中间牵线。
- 萧白：是北路摆摊的算命先生查出来的，腰上挂着盏小铜灯的那位。
- 岑霜：……管船的。我的差事，轮不到他来查。
- 岑霜：乌魁，带两个人上后山看看。
- 乌魁：你一个借住的，怎么知道后山有人？
- 萧白：（她没谢我。乌魁那双眼睛，倒是盯上我了。）
