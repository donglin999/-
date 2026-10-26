// 风起栖河 · 渡口留话（归烬堂支线·结局 2 的 2b／2c／2d）
// 地点：邻村渡口　在场：蔺管事、萧白（2d：只有萧白，挑夫传话）
// 戏眼：蔺管事晚了一步，想把欠萧白的人情结了；被说出去的那支他已经走了。散场时萧白拿到书、路费，或只听到一句话。
// 2026-10-23 剧本三新写（归烬堂支线·蔺管事线，设计稿 xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三～七节；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json）。待用户过目，未 --approve；JS 未接（接口见共用笔记 42-剧本三.md）。
//   参数 exposed：他被说出去了（lamp.sold 有值，或交付选了“告诉岑姑娘”；结局 2d）——当天收摊撤走，只托挑夫带一句话，不给东西。
//   读 lamp.briefed：没回过话的只知道他是“算命先生”；读 lamp.seal：看过封皮的给《薪火功》，否则给路费（支线稿第五节结局 2 奖励档位）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink
VAR exposed = false // 参数

=== qh_lamp_end_note ===
{ exposed:
    萧白：（东埠那个挑夫拦住我——是算命先生的人。他只带了一句话：） #id:L8-01
    萧白：（“我只跟你一个人说过。”） #id:L8-02
    -> END
}
【邻村 · 渡口】 #id:L8-00
{ not flag("qiheChapter.records.lamp.briefed"):
    算命先生：托你的事，不用再跑了。这点路费拿着。 #id:L8-06
    ~ lamp_reward("fare")
    -> END
}
蔺管事：我傍晚上了后山，倒木已经空了。晚了一步。 #id:L8-03
{ flag("qiheChapter.records.lamp.seal") == "seen":
    蔺管事：拿着——堂里打底的旧本子，外人练了也不打紧。你替我跑的腿，算这个。 #id:L8-04
    ~ lamp_reward("book")
- else:
    蔺管事：这点路费拿着。你替我跑的腿，我记着。 #id:L8-05
    ~ lamp_reward("fare")
}
-> END
