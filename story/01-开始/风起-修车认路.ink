// 风起栖河 · 村中活动：修车认路（C1-A-transport）
// 地点：西田埂药车停靠处　在场：陆衡、萧白；陈伯或村口老人
// 戏眼：药车轴销松了，老人家也要先送走，陆衡一个人顾不过来。散场时车修好了，或几位老人先去了邻村。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody('transport') 搬入。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：村口老人那句“药不用一次带齐”不像临走的老人会说，改成惦记家里没锁的门。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_act_transport ===
陆衡：药车有根轴销松了，几位老人家也得先送走。你帮哪头？ #id:C1-A-transport-01
* [“我去帮陈伯修车。”]
    ~ set_flag("qiheChapter.choices.transport", "cart")
    陈伯：别使蛮劲，先把轮垫住。 #id:C1-A-transport-A1
    陈伯：行了，推着顺手。能坐人，也能捆几件家当。 #id:C1-A-transport-A2
* [“我先送老人家去邻村。”]
    ~ set_flag("qiheChapter.choices.transport", "elders")
    陆衡：老人家，慢点上车。到了邻村记得留个名字和住处，家里人好找。 #id:C1-A-transport-B1
    村口老人：哎，家里那门好像没锁……咳，算了，也没什么好偷的。 #id:C1-A-transport-B2
- -> END
