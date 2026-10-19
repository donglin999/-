// 风起栖河 · 村中活动：集市帮忙（C1-A-market）
// 地点：南村口外院　在场：店家或药商、萧白
// 戏眼：村里一下子来了这么多外人，店家忙不过来；萧白也想顺便问出递字条的黑衣人。散场时多了几捆捆车的麻绳，或知道黑衣人问过叶家住哪儿。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody('market') 搬入。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：帮店家收拾货后，麻绳改由店家送（原来是萧白自己拿走店家的绳）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_act_market ===
店家：这几天乱糟糟的，能搭把手吗？ #id:C1-A-market-01
* [“我帮您收拾货。”]
    ~ set_flag("qiheChapter.choices.market", "help")
    店家：这几捆麻绳堆着也是堆着，你给陈伯带去，他正愁没绳子捆车呢。 #id:C1-A-market-A1
    萧白：谢谢掌柜的，正好用得上。 #id:C1-A-market-A2
* [“我再去问问药商。”]
    ~ set_flag("qiheChapter.choices.market", "rumor")
    药商：那个黑衣人先问罐底的款，又问叶家住哪儿。名字？没提。 #id:C1-A-market-B1
    萧白：好，我知道了。 #id:C1-A-market-B2
- -> END
