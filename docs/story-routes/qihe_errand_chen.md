# 路线：qihe_errand_chen（01-开始/第一夜-还碗.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 4 条路线。

## 路线 1：prologue.errands.bowls="none"

- 陈伯：被褥给你铺好了，夜里冷就再加一床。

## 路线 2：prologue.errands.bowls="accepted"，选：“这位客人是……？”

- 萧白：陈伯，周婶让我把碗送回来。
- 陈伯：哎哎，碗搁桌上，别踩那块松木板！
- 周砚：你们先忙，我不急。
  〔set_flag("prologue.errands.bowls", "done")〕
  〔uncarry("bowls")〕
  〔checkpoint()〕
  〔toast_for("还碗完成", 1300)〕
- 陈伯：碗我收下了。跟周婶说，往后要用尽管来拿。还有事？
  ▶ 选：“这位客人是……？”
- 陈伯：路上来的客，打听行舟的。——您方才说找行舟，什么事？
- 周砚：我是行舟早年的朋友。路上听人说温家还留着一部功法，想问问，他回来过没有。
- 陈伯：您来晚了。他出门好些年，再没回来过，家里就剩阿蘅一个。
- 萧白：（阿蘅……是叶蘅？）
- 周砚：阿蘅是他女儿？人在哪儿？
- 陈伯：阿蘅随她娘姓叶，她娘前些年病没了。天晚了，有啥话明儿当面问她。
- 周砚：也好。我在河埠船家借了个铺，明日再登门。
  〔set_flag("prologue.heard.skill", true)〕
  〔checkpoint()〕
- 陈伯：跟周婶说一声，明儿我去给她修药架。

## 路线 3：prologue.errands.bowls="accepted"，选：“没了，我回药棚了。”

- 萧白：陈伯，周婶让我把碗送回来。
- 陈伯：哎哎，碗搁桌上，别踩那块松木板！
- 周砚：你们先忙，我不急。
  〔set_flag("prologue.errands.bowls", "done")〕
  〔uncarry("bowls")〕
  〔checkpoint()〕
  〔toast_for("还碗完成", 1300)〕
- 陈伯：碗我收下了。跟周婶说，往后要用尽管来拿。还有事？
  ▶ 选：“没了，我回药棚了。”
- 陈伯：跟周婶说一声，明儿我去给她修药架。

## 路线 4：prologue.errands.bowls="done"

- 陈伯：被褥给你铺好了，夜里冷就再加一床。
