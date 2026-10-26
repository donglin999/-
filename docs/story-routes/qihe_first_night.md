# 路线：qihe_first_night（01-开始/第一夜-过夜.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 148 条路线。

## 路线 1：resuming=false，prologue.rested=true

- 【第一夜 · 完。进度已保存。】

## 路线 2：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 3：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 4：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 5：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 6：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 7：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 8：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 9：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 10：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 11：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 12：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（布还没取，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 13：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（布还没取，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 14：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（布还没取，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 15：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（布还没取，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 16：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 17：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 18：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 19：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 20：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 21：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（布还没交给周婶，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 22：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 23：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（布还没交给周婶，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 24：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 25：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 26：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 27：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 28：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 29：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 30：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 31：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 32：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 33：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 34：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 35：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 36：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（碗还没送，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 37：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（碗还没送，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 38：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（碗还没送，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 39：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（碗还没送，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 40：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 41：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 42：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 43：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（碗还没送，布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 44：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没取，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 45：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（碗还没送，布还没取，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 46：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没取，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 47：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（碗还没送，布还没取，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 48：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 49：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（碗还没送，布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 50：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 51：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（碗还没送，布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 52：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没交给周婶，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 53：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（碗还没送，布还没交给周婶，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 54：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没交给周婶，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 55：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（碗还没送，布还没交给周婶，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 56：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（碗还没送，布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 57：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（碗还没送，布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 58：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 59：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 60：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（碗还没送，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 61：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（碗还没送，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 62：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（碗还没送，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 63：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（碗还没送，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 64：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 65：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（碗还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 66：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 67：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 68：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 69：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 70：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 71：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 72：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 73：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 74：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 75：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 76：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（布还没取，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 77：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（布还没取，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 78：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（布还没取，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 79：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（布还没取，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 80：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 81：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（布还没取……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 82：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 83：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 84：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 85：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（布还没交给周婶，药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 86：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 87：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（布还没交给周婶，竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 88：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 89：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（布还没交给周婶……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 90：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 91：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 92：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“躺下睡觉。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 93：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"，选：“再出去转转。”

- 萧白：（药还没送……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 94：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“躺下睡觉。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 95：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"，选：“再出去转转。”

- 萧白：（竹篮还没还……现在睡下，只能明早再跟周婶说了。）
  ▶ 选：“再出去转转。”

## 路线 96：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“躺下睡觉。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“躺下睡觉。”
  〔set_flag("prologue.ending", true)〕
  〔checkpoint()〕
- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 97：resuming=false，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="done"，选：“再出去转转。”

- 萧白：（天黑透了……睡吧？）
  ▶ 选：“再出去转转。”

## 路线 98：resuming=false，prologue.rested=false，prologue.relicSeen=false

- 萧白：（还睡不着……叶蘅说有事去找她，去她家看一眼吧。）

## 路线 99：resuming=true，prologue.rested=true

- 【第一夜 · 完。进度已保存。】

## 路线 100：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 101：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 102：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 103：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="none"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 104：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 105：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 106：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 107：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 108：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 109：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 110：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 111：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 112：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 113：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 114：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 115：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="none"，prologue.errands.cloth="done"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 116：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 117：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 118：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 119：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="none"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 120：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 121：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 122：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 123：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 124：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 125：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 126：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 127：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 128：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 129：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 130：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 131：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="accepted"，prologue.errands.cloth="done"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.bowls", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 132：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 133：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 134：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 135：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="none"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 136：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 137：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 138：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 139：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="accepted"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 140：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 141：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 142：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 143：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="collected"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.cloth", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 144：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="none"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 145：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="accepted"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 146：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="delivered"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 周婶：托你的那几样，没办完的明儿再说，不急。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.errands.medicine", "closed")〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 147：resuming=true，prologue.rested=false，prologue.relicSeen=true，prologue.errands.bowls="done"，prologue.errands.cloth="done"，prologue.errands.medicine="done"

- 陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。
  〔go_scene("prologue_ye_house", "entry")〕
- 周婶：阿蘅，热水给你搁门边了，趁热用。
- 叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」
- 周婶：我刚才进门，都没留意。
- 叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？
- 陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。
- 萧白：会不会就是那个买罐子的药商塞的？
- 陈伯：没落款，说不准。这两天村里生人多。
- 陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。
- 叶蘅：……他明儿真会来？
- 叶蘅：这张纸我收着。
- 叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。
- 萧白：好，我陪你去。
- 周婶：灯别点太久，费油。明早还有粥。
- 萧白：知道了，您也早些歇。
- 陈伯：走，跟我回去睡吧。
  〔go_scene("prologue_chen_guest", "entry")〕
- 萧白：（手机还是没信号……关了吧，剩下这点电省着点用。）
- 萧白：（家里这会儿，该急疯了吧。）
- 萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。）
  〔night_falls()〕
  〔set_flag("prologue.rested", true)〕
  〔set_flag("prologue.ending", false)〕
  〔hand_off_first_night()〕
  〔checkpoint()〕
- 【江湖经历记下一笔：栖河第一夜。进度已保存。】

## 路线 148：resuming=true，prologue.rested=false，prologue.relicSeen=false

- 萧白：（还睡不着……叶蘅说有事去找她，去她家看一眼吧。）
