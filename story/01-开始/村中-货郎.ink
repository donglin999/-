// 风起栖河 · 村心货郎担（地图可交互物稿 5.6、C4、Q6）：卖杂货、收山货、断扁担、以物换话
// 地点：中央村落村心草地西头、古井西侧；断扁担一段在陈伯家门厅　在场：萧白、货郎（陈伯）
// 戏眼：货郎走村串巷靠记性——记得每家缺什么。扁担断了他挑不动，托萧白找个会木活的；陈伯一边修一边数落他挑得太重。散场时萧白得个针线包，往后能拿山货换句村里的闲话（只是生活气，不给主线答案）。
// 2026-10-27 主会话：戏眼卡 qihe-town-interactables-brief.json（T-peddler、T-pole、T-pole-chen、T-pole-done、T-gossip），MiniMax-M3 演员法起草，主会话剪辑（货郎不知道萧白的名字，叫“小兄弟”）。
// 调用：js/qihe-town.js。买卖价目、收购价、谢礼都在 JS（界面文字）；qh_peddler_talk 用 fq_answer 交回选了什么。
// 2026-10-29 逻辑排查（评审台，用户授权 Claude 代评剧情）：担子在古井边，删“在村口”；对借住客房的萧白改说“总算又住上人了”。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

VAR pole_new = false // 参数：扁担断了、还没托人
VAR pole_wait = false // 参数：已托萧白去找陈伯
VAR gossip = false // 参数：扁担修好后、本时段还没换过闲话、身上有山货
VAR kind = "" // 参数：拿来换闲话的山货，"branch"／"reed"／"herb"

=== qh_peddler_talk ===
货郎：小兄弟，过来瞧瞧！麻绳、火折子、针线包，糖块干粮也齐全！ #id:QP-t-01
+ [买点东西]
    ~ fq_answer("buy")
+ [卖点山货]
    ~ fq_answer("sell")
+ {pole_new} [“你这担子怎么撂地上了？”]
    ~ fq_answer("pole")
+ {pole_wait} [“扁担还在陈伯那儿修着。”]
    货郎：不急不急，我这两筐货又跑不了。 #id:QP-t-wait
+ {gossip} [拿样山货换句闲话]
    ~ fq_answer("gossip")
+ [走开]
- -> END

=== qh_peddler_pole ===
货郎：唉，扁担压断了，两筐货挑不动，生意也做不成喽！ #id:QP-p-01
货郎：小兄弟，劳驾替我跑一趟村东北陈伯家，请他给看看？ #id:QP-p-02
* [“行，我拿去给陈伯看看。”]
    货郎：那敢情好！ #id:QP-p-03
    ~ fq_answer("take")
* [“我帮不上。”]
- -> END

=== qh_pole_chen ===
萧白：陈伯，货郎的扁担断了，麻烦您帮着看看。 #id:QP-c-01
陈伯：拿来我瞧瞧！……断口都劈了。挑得这么重，扁担能不断吗？ #id:QP-c-02
陈伯：修了半辈子扁担，还没见过挑这么狠的。我在裂口上加两道箍，凑合使吧。 #id:QP-c-03
陈伯：喏，好了。替我告诉那货郎，往后少挑些！ #id:QP-c-04
-> END

=== qh_peddler_pole_done ===
货郎：这扁担修得真稳！针线包你拿着，算我谢你。 #id:QP-d-01
货郎：往后有山里捡的东西拿来，我收；顺带跟你说说村里的新鲜事。 #id:QP-d-02
-> END

=== qh_peddler_gossip ===
{
- kind == "branch":
    货郎：成，这捆枯枝成色不赖。陈伯家那间客房，总算又住上人了。 #id:QP-g-branch
- kind == "reed":
    货郎：芦苇收下！小禾爱跟着阿栓玩，一个闷声不响，一个闹腾得很。 #id:QP-g-reed
- kind == "herb":
    货郎：野草药？成，收下了！村口那老人家腿脚不便，糖块都让孩子替他买。 #id:QP-g-herb
}
-> END
