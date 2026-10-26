# 路线：fq_song_departure（01-开始/风起-后山回话二.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 24 条路线。

## 路线 1：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=true，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 2：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=true，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 3：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=true，选：“今晚就走。”，qiheChapter.records.lamp.met=false

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 4：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=true，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 5：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=true，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 6：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=true，选：“还没定。”，qiheChapter.records.lamp.met=false

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 7：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=false，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 8：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=false，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 9：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=false，选：“今晚就走。”，qiheChapter.records.lamp.met=false

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 10：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=false，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 11：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=false，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 12：qiheChapter.records.lamp.boatman=true，qiheChapter.records.song_watched=false，选：“还没定。”，qiheChapter.records.lamp.met=false

- 萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。）
- 萧白：（倒木上，只坐着宋先生一个人。）
  〔set_flag("qiheChapter.records.lamp.porter_seen", true)〕
  〔set_flag("qiheChapter.records.lamp.t3", "hill")〕
- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 13：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=true，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 14：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=true，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 15：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=true，选：“今晚就走。”，qiheChapter.records.lamp.met=false

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 16：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=true，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 17：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=true，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 18：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=true，选：“还没定。”，qiheChapter.records.lamp.met=false

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。
- 萧白：（他半天没说话。）
- 宋先生：她们疑你？……那就更不敢先动了。
- 萧白：不敢动不好吗？
- 宋先生：好，当然好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 19：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=false，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 20：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=false，选：“今晚就走。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 21：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=false，选：“今晚就走。”，qiheChapter.records.lamp.met=false

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“今晚就走。”
  〔set_flag("qiheChapter.records.stranger_told_departure", true)〕
- 萧白：陆大哥一早去邻村催车了，说最快今晚走。
- 宋先生：今晚……好。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 22：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=false，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“没有了。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“没有了。”
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 23：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=false，选：“还没定。”，qiheChapter.records.lamp.met=true，选：“北路有个算命先生，也在看人。”

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：这村里头，除了你，还有谁在留意进出的人？
  ▶ 选：“北路有个算命先生，也在看人。”
  〔set_flag("qiheChapter.records.lamp.sold", "song")〕
- 宋先生：算命的……知道了。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）

## 路线 24：qiheChapter.records.lamp.boatman=false，qiheChapter.records.song_watched=false，选：“还没定。”，qiheChapter.records.lamp.met=false

- 萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。
- 宋先生：动手了没有？
- 萧白：没有。我在药车边帮着搬药，谁也没留意我。
- 宋先生：没留意你……那就好。
- 宋先生：叶家今晚是不是要从装卸侧口走？
  〔set_flag("qiheChapter.records.song_asked_side", true)〕
- 萧白：侧口？
- 萧白：（我可没跟他提过侧口……）
- 宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。
- 宋先生：到底走不走？
  ▶ 选：“还没定。”
  〔set_flag("qiheChapter.records.stranger_told_departure", false)〕
- 萧白：车不够，病人也没安顿好。
- 宋先生：不急。迟早要走的。
  〔fq_beat()〕
- 宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。
- 萧白：谁？
- 宋先生：明早，还在这儿等你。
- 宋先生：这串算珠拿着，数人头用得着。别弄丢了。
  〔fq_song_gift("c1-s2")〕
- 萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。）
- 萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？）
