// 风起栖河 · 后山回话（二）（C1-S2）
// 地点：后山采药路倒木旁　在场：宋先生（站着等）、萧白
// 戏眼：宋先生要知道叶家今晚走不走、从哪走；萧白发现他知道自己从没说过的“侧口”。散场时萧白拿了乌木算珠，青玉珠让他起疑，宋先生进了林子。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js strangerScene('c1-s2') 搬入。宋先生的身份不点破（F-0004）。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：补播旁白改成萧白心里话；给算盘与末句心里话按演员稿缩短。疑点（失神、侧口、青玉珠）原样保留。
// 2026-10-19 冷读审读后再改：“今晚就走”交代昨晚为什么没走；“我没跟您说过”改成先反问、再在心里嘀咕（不替玩家点破）；算盘统一叫算珠。
// 2026-10-21 用户改定：宋先生线改为可选、可拒绝，不再挡主线、不再补播（opening-pei-disguise.md）。去掉补播的 auto 参数与开头心里话；只有答应过宋先生才会出现。
// 2026-10-23 剧本三（归烬堂支线，支线稿第三节宋四／交叉点 X5、X6，第七节）：
//   ① 问过船家、知道脚夫天亮上后山的（records.lamp.boatman），开场撞见脚夫揣着油纸包下山（心里话），记 lamp.porter_seen、lamp.t3=hill；
//   ② C1-S2-03 按装卸路“在路口数人”是否真的播过（records.song_watched）分两版：没被注意的走 03h／05h，宋先生不再“半天没说话”；
//   ③ 认识蔺管事的（records.lamp.met），宋先生多问一句“还有谁在看”（不说／说出算命先生，后者记 lamp.sold=song，结局 2d）；
//   ④ 问侧口时记 records.song_asked_side（对证、灯四读）。疑点（侧口、青玉珠、进林子）原样保留。2026-10-27 用户授权 Claude 代审，已冷读、批准（--approve）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_song_departure ===
{ flag("qiheChapter.records.lamp.boatman"):
    萧白：（天刚亮，一个黑衣人从倒木那边下来，怀里揣着个油纸包。……是那个脚夫。） #id:C1-S2-P1
    萧白：（倒木上，只坐着宋先生一个人。） #id:C1-S2-P1b
    ~ set_flag("qiheChapter.records.lamp.porter_seen", true)
    ~ set_flag("qiheChapter.records.lamp.t3", "hill")
}
萧白：昨天归烬堂和巡江司都来了。一个要玉匣，一个要查药，还差点在路上吵起来。 #id:C1-S2-01
宋先生：动手了没有？ #id:C1-S2-02 #mood:firm
{ flag("qiheChapter.records.song_watched"):
    萧白：没有。倒是她们都在猜我是谁的人——岑姑娘说我是正道盟的眼线，沈姑娘当我是归烬堂的。 #id:C1-S2-03
    萧白：（他半天没说话。） #id:C1-S2-04
    宋先生：她们疑你？……那就更不敢先动了。 #id:C1-S2-05 #mood:worry
    萧白：不敢动不好吗？ #id:C1-S2-06
    宋先生：好，当然好。 #id:C1-S2-07 #mood:worry
- else:
    萧白：没有。我在药车边帮着搬药，谁也没留意我。 #id:C1-S2-03h
    宋先生：没留意你……那就好。 #id:C1-S2-05h
}
宋先生：叶家今晚是不是要从装卸侧口走？ #id:C1-S2-08 #mood:firm
~ set_flag("qiheChapter.records.song_asked_side", true)
萧白：侧口？ #id:C1-S2-09
萧白：（我可没跟他提过侧口……） #id:C1-S2-09b
宋先生：那几拨人在路上嚷嚷，跑账的谁听不见。 #id:C1-S2-10
宋先生：到底走不走？ #id:C1-S2-11 #mood:firm
* [“今晚就走。”]
    ~ set_flag("qiheChapter.records.stranger_told_departure", true)
    萧白：陆大哥一早去邻村催车了，说最快今晚走。 #id:C1-S2-A1
    宋先生：今晚……好。 #id:C1-S2-A2 #mood:worry
* [“还没定。”]
    ~ set_flag("qiheChapter.records.stranger_told_departure", false)
    萧白：车不够，病人也没安顿好。 #id:C1-S2-B1
    宋先生：不急。迟早要走的。 #id:C1-S2-B2
- ~ fq_beat()
{ flag("qiheChapter.records.lamp.met"):
    -> who_else
}
-> rest

= who_else
宋先生：这村里头，除了你，还有谁在留意进出的人？ #id:C1-S2-L1 #mood:firm
* [“没有了。”]
* [“北路有个算命先生，也在看人。”]
    ~ set_flag("qiheChapter.records.lamp.sold", "song")
    宋先生：算命的……知道了。 #id:C1-S2-L2
- ~ fq_beat()
-> rest

= rest
宋先生：今夜别离她太远。真要乱起来，会有人来收拾的。 #id:C1-S2-12
萧白：谁？ #id:C1-S2-13
宋先生：明早，还在这儿等你。 #id:C1-S2-14
宋先生：这串算珠拿着，数人头用得着。别弄丢了。 #id:C1-S2-15
~ fq_song_gift("c1-s2")
萧白：（算珠中间这颗是青玉的……他领口那根红绳底下，好像也坠着这么一块。） #id:C1-S2-16
萧白：（他头也不回地进了林子。……他到底是什么人？今晚又会出什么事？） #id:C1-S2-17
-> END
