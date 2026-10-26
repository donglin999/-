// 风起栖河 · 算命摊回话（一）（归烬堂支线·灯一收尾，可选）
// 地点：北路算命摊　在场：算命先生（蔺晦之）、萧白
// 戏眼：蔺管事要黑衣人的来路，也要看萧白靠不靠得住；萧白想知道他到底在找什么。散场时他说出自己是归烬堂管船的，托萧白看岑霜那封讯的封皮、等几拨人到齐跟脚夫一回；答应过宋先生的还学到“别站路口”。
// 2026-10-23 剧本三新写（归烬堂支线·蔺管事线，设计稿 xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三～七节；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json）。2026-10-27 用户授权 Claude 代审，已冷读、批准（--approve）。；JS 未接（接口见共用笔记 42-剧本三.md）。
//   门槛：records.lamp.boatman。完美路线要求本场在半日 3（装卸路）之前做完（支线稿第三节条件 2）。
//   从本场起名条由“算命先生”换成“蔺管事”（同一人，bible/人物/蔺晦之.md 名牌别称）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink

=== qh_lamp_report1 ===
萧白：问过船家了。那人打汉皋坐下水船来，天亮上后山，天黑回船上睡。 #id:L3-01
算命先生：汉皋……又是汉皋。 #id:L3-02
萧白：您到底在找什么？ #id:L3-03
算命先生：我姓蔺，归烬堂管船的。算命是幌子。 #id:L3-04
蔺管事：堂里有封讯，没走我管的船递，是从汉皋那头递过去的。 #id:L3-05
萧白：归烬堂？那个乌魁…… #id:L3-06
蔺管事：乌魁的上头，岑管事，这两天就到。讯在她手上。 #id:L3-06b
蔺管事：她认得我，我不能露面。你替我看一眼那封讯的封皮。 #id:L3-07
蔺管事：就说替叶姑娘问问，传讯上写的旧物是哪年的。 #id:L3-07b
{ flag("qiheChapter.records.stranger_deal") == "accepted" or flag("qiheChapter.records.stranger_deal") == "asked_first":
    蔺管事：还有，你在路口杵了半天，谁都瞧得见。药车边搭把手，一样看得准。 #id:L3-08
    ~ set_flag("qiheChapter.records.lamp.taught", true)
}
蔺管事：那脚夫，等那几拨人都到齐了，挑一天一早跟他一回。看他见谁、拿走什么。 #id:L3-09
萧白：这些……要瞒着叶姑娘吗？ #id:L3-10
蔺管事：那是她家的事，不必瞒。 #id:L3-11
~ set_flag("qiheChapter.records.lamp.briefed", true)
-> END
