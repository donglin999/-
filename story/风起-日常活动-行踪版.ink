// 2026-11-11 审读修订：
//   学棍：陆衡转达叶蘅的话不再说“早上托我捎句话：练完回去吃饭”（萧白是当场才求教的，她早上不可能预知），改成她提过萧白手上的口子。
//   修车认路：第二个选择由“送老人去邻村”改成“探去邻村的路”。原来第一天上午就送老人去邻村，可撤去邻村是第二天傍晚才提出来的（R2-P2、R2-P3），
//   而且送走的老人后面还在村里说话（小耗子挂药、第三夜沈雁回叫他、邻村差役说是他接出来的）。现在老人一直在村里，和行踪表一致；探过的路是后来撤离走的西田埂。
// 风起栖河 · 村中三件日常活动（行踪版，2026-11-10，替换原版《风起-学棍》《风起-集市帮忙》《风起-修车认路》里的同名 knot）
// 用户：“为了避免人物和剧情地点对不上……对话闲谈的时候就出现那两个人，日常就看不到消失了”。
// 人物行踪表（docs/cast-schedule.md）查出：这三件活动是玩家自己挑时候做的，戏里说话的人此刻却站在别处——
//   学棍：叶蘅在药棚（或东埠）分药，却在西田埂练场说“我去分药”；
//   集市帮忙：店家在客栈，却在南村口药摊旁请萧白搭把手；
//   修车认路：陈伯在自家门厅、村口老人在村南，却在西田埂药车旁说话。
// 改法：只让此刻真在场的人开口——叶蘅的话由陆衡转达；集市由南村口的药商自己请人帮忙；修车由陆衡带着修，
//   送老人那一支改成陆衡让萧白去村南把老人扶来（老人之后不在村里，和行踪表一致）。戏眼和奖励不变。
// 剧情由主会话代评（10-29 授权）。
EXTERNAL flag(path)
EXTERNAL set_flag(path, value)
EXTERNAL fq_lesson_battle()
EXTERNAL fq_grant_lesson()

=== fq_act_practice ===
萧白：山上那回，我拿着木头，除了往前挡，什么都不会。 #id:C1-A-practice-01
陆衡：能挡住一次是运气。下次还想护着人，就得知道什么时候伸，什么时候收。 #id:C1-A-practice-02
萧白：你能教我吗？ #id:C1-A-practice-03
陆衡：护路用的棍法，不是什么秘传。肯用心练，我从头教。 #id:C1-A-practice-04
陆衡：叶姑娘跟我提过，你手上那道口子还没收口。磨起泡了别瞒着她。 #id:C1-A-practice-05v3
陆衡：来，跟我慢慢过一轮。棍打出去，别忘了收。 #id:C1-A-practice-07
* [“来吧！”]
    ~ fq_lesson_battle()
* [“我先把招式记熟。”]
- ~ fq_grant_lesson()
~ set_flag("qiheChapter.choices.practice", "learned")
陆衡：这根棍你带着，早晚各比划几遍。 #id:C1-A-practice-08
-> END

=== fq_act_market ===
药商：这几天乱糟糟的，摊子都快让人挤翻了，能搭把手吗？ #id:C1-A-market-01v2
* [“我帮您收拾货。”]
    ~ set_flag("qiheChapter.choices.market", "help")
    药商：这几捆麻绳堆着也是堆着，你给陈伯带去，他正愁没绳子捆车呢。 #id:C1-A-market-A1v2
    萧白：谢了，正好用得上。 #id:C1-A-market-A2v2
* [“先跟您打听个人。”]
    ~ set_flag("qiheChapter.choices.market", "rumor")
    药商：那个黑衣人先问罐底的款，又问叶家住哪儿。名字？没提。 #id:C1-A-market-B1
    萧白：好，我知道了。 #id:C1-A-market-B2
- -> END

=== fq_act_transport ===
陆衡：药车有根轴销松了。去邻村拉药材的那条田埂路，前些天雨后塌过一段，也得有人去看看。你帮哪头？ #id:C1-A-transport-01v3
* [“我来帮你修车。”]
    ~ set_flag("qiheChapter.choices.transport", "cart")
    陆衡：别使蛮劲，先把轮垫住。 #id:C1-A-transport-A1v2
    陆衡：行了，推着顺手。能坐人，也能捆几件家当。 #id:C1-A-transport-A2v2
* [“我去看看那条路。”]
    ~ set_flag("qiheChapter.choices.transport", "road")
    陆衡：顺着西田埂往外走，过了窄口就是。看车轮过不过得去，别光看人能不能走。 #id:C1-A-transport-B1v3
    萧白：窄口那段两边是水田，塌的地方垫了石头，车能过。 #id:C1-A-transport-B2v3
    陆衡：记住这条路。村里真有急事，就走它。 #id:C1-A-transport-B3v3
- -> END
