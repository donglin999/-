# 路线：fq_main_pre（01-开始/风起-主线找人.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 12 条路线。

## 路线 1：basket=false，is_ye=false，选：【主线】（先去后山倒木旁一趟）

- 陆衡：车还没装完，有事你先去。
  ▶ 选：【主线】（先去后山倒木旁一趟）
  〔fq_answer("main")〕
  〔fq_track("stranger")〕
- 萧白：（宋先生说过，还在倒木旁等我。）

## 路线 2：basket=false，is_ye=false，选：“陆大哥，教我两手。”

- 陆衡：车还没装完，有事你先去。
  ▶ 选：“陆大哥，教我两手。”
  〔fq_answer("normal")〕

## 路线 3：basket=false，is_ye=false，选：“没事，你忙。”

- 陆衡：车还没装完，有事你先去。
  ▶ 选：“没事，你忙。”
  〔fq_answer("none")〕

## 路线 4：basket=false，is_ye=true，选：【主线】（先去后山倒木旁一趟）

- 叶蘅：药我分好了。你要是有事，先去忙。
  ▶ 选：【主线】（先去后山倒木旁一趟）
  〔fq_answer("main")〕
  〔fq_track("stranger")〕
- 萧白：（宋先生说过，还在倒木旁等我。）

## 路线 5：basket=false，is_ye=true，选：“药棚有什么要帮忙的？”

- 叶蘅：药我分好了。你要是有事，先去忙。
  ▶ 选：“药棚有什么要帮忙的？”
  〔fq_answer("normal")〕

## 路线 6：basket=false，is_ye=true，选：“没事，你忙。”

- 叶蘅：药我分好了。你要是有事，先去忙。
  ▶ 选：“没事，你忙。”
  〔fq_answer("none")〕

## 路线 7：basket=true，is_ye=false，选：【主线】“我这就去后山取竹匾。”

- 陆衡：车还没装完，有事你先去。
  ▶ 选：【主线】“我这就去后山取竹匾。”
  〔fq_answer("main")〕
  〔fq_track("stranger")〕
- 萧白：（竹匾在后山采药路的倒木旁。）

## 路线 8：basket=true，is_ye=false，选：“陆大哥，教我两手。”

- 陆衡：车还没装完，有事你先去。
  ▶ 选：“陆大哥，教我两手。”
  〔fq_answer("normal")〕

## 路线 9：basket=true，is_ye=false，选：“没事，你忙。”

- 陆衡：车还没装完，有事你先去。
  ▶ 选：“没事，你忙。”
  〔fq_answer("none")〕

## 路线 10：basket=true，is_ye=true，选：【主线】“我这就去后山取竹匾。”

- 叶蘅：周婶托你的竹匾，拿回来没有？她又问了。
  ▶ 选：【主线】“我这就去后山取竹匾。”
  〔fq_answer("main")〕
  〔fq_track("stranger")〕
- 萧白：（竹匾在后山采药路的倒木旁。）

## 路线 11：basket=true，is_ye=true，选：“药棚有什么要帮忙的？”

- 叶蘅：周婶托你的竹匾，拿回来没有？她又问了。
  ▶ 选：“药棚有什么要帮忙的？”
  〔fq_answer("normal")〕

## 路线 12：basket=true，is_ye=true，选：“没事，你忙。”

- 叶蘅：周婶托你的竹匾，拿回来没有？她又问了。
  ▶ 选：“没事，你忙。”
  〔fq_answer("none")〕
