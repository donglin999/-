# 路线：qihe_lodging（01-开始/序章-进村第一夜.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 2 条路线。

## 路线 1：prologue.arrival.borrowed=true

  〔go_scene("prologue_clinic_interior", "entry_front")〕
  〔clinic_stage()〕
- 周婶：夜里别乱跑，外头停的那些车，别往跟前凑。
- 周婶：给蘅丫头留的饭，先分你一半。快吃。
- 萧白：谢谢周婶。……明儿有什么活，您叫我。
- 叶蘅：我收完药就回家，村西北那家就是。有事来找我。
  〔set_flag("prologue.arrival.stage", "done")〕
  〔checkpoint()〕
  〔toast("可以在附近走走，或经邀请去叶家帮叶蘅收药箱。")〕

## 路线 2：prologue.arrival.borrowed=false

  〔go_scene("prologue_clinic_interior", "entry_front")〕
  〔clinic_stage()〕
- 周婶：死丫头，又野到这时候才回来！——哟，这是打哪儿来的小哥？
- 叶蘅：周婶，后山有狼下到采药路上了！还碰上了他，头晕得厉害。
- 周婶：狼？！伤着没有？
- 叶蘅：没事，打跑了。明儿得跟村里说一声。
- 萧白：我叫萧白……给您添麻烦了。
- 周婶：这两天村里生人多，客店都住满了。……老陈，你家那间空客房还空着吧？
- 陈伯：空着，堆了两捆绳，我回去拾掇。
- 周婶：这穿的什么呀？没见过这料子……脏成这样。等着，我给你找身衣裳。
- 萧白：我……身上没钱。
- 周婶：一碗饭，值当什么钱。别碰着我那药盘子就成。
  〔mark("P-03-12")〕
  〔change_into_village_clothes()〕
- 萧白：（手机还剩一半电……先跟原来那身衣服包在一起。）
- 周婶：夜里别乱跑，外头停的那些车，别往跟前凑。
- 周婶：给蘅丫头留的饭，先分你一半。快吃。
- 萧白：谢谢周婶。……明儿有什么活，您叫我。
- 叶蘅：我收完药就回家，村西北那家就是。有事来找我。
  〔set_flag("prologue.arrival.stage", "done")〕
  〔checkpoint()〕
  〔toast("可以在附近走走，或经邀请去叶家帮叶蘅收药箱。")〕
