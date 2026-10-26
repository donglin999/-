// 第一夜 · 周婶托付（药棚里跟周婶说话：接下「替周婶跑一圈」、回来交差）
// 地点：[[栖河·药棚]]　在场：萧白、周婶
// 戏眼：萧白吃完饭说过“明儿有什么活，您叫我”，想还人情；周婶本想让他歇着，可手头三样顺手事正好都在他要认的路上。散场时他一口接下「替周婶跑一圈」（或先去转转）；跑完回来交差，周婶问一句路上听着什么，给一盒金创药抹手上的擦伤。整件可不做。
// 2026-10-18 第 2 期：从 js/qihe-map-trial.js aunt() 原样搬运，台词不改。原台词没有编号：
//   周婶开口与收尾句记 P-S0-*；每件小事的交代、交还按设计稿 errands-script.md 的 P-S1/P-S2/P-S3 句号对齐（规则见更新记录）。
//   选项顺序与原 JS 一致：先列未接的小事（还碗、取布、送药），再列可交还的（布、竹篮），最后“我先四处转转”。
// 2026-10-19 剧情三道关改造（戏眼卡 FN-aunt）：开口接上进村时那句“明儿有什么活，您叫我”，先把三件事报出来再让他挑（原选项里的事周婶从没提过）；
//   第一次搭话前会先播寒暄（第一夜-问候.ink qihe_greet_aunt），开口不再重复“锅里还有粥”；再来时改说 P-S0-01b。
//   竹篮为什么在老人家：周婶的篮子放在那儿让老人帮着修提手（接 P-S3-07、P-S3-13）。选项结构、接取与交还不变。
// 2026-10-23 剧本二（opening-errands-rework.md 0.1 乙-1，戏眼卡 xiaojianghu/docs/design/scripts/briefs/zhoushen-errand-round-brief.json ZR-aunt-offer、ZR-aunt-return）：
//   三件合成一件：周婶一次报三处，萧白一句接下，三个键同时记成 accepted；不再分别接、分别交还。三处做完（碗送到、布取到、药送到篮子带回）回药棚交差。
//   交差：任何一处旁听过，周婶顺口问一句“听着什么了”（不追问）；给一盒金创药（prologue.errandGift=true，由 js/qihe-map-trial.js 发 ITEMS.pill，只发一次）。
//   旧档：三件分开接过、还有没接的，进来时把没接的补成已接（不另说台词），按一条任务走完。
INCLUDE ../_共用/externals.ink

=== qihe_errand_aunt ===
#cast:萧白
{ flag("prologue.rested"):
    周婶：都收拾完啦，你也早点歇着。 #id:P-S0-rested
    -> END
}
{ round_ready():
    -> hand_in
}
{ flag("prologue.errands.bowls") == "done" and flag("prologue.errands.cloth") == "done" and flag("prologue.errands.medicine") == "done":
    周婶：今儿多亏你了，早点歇着。 #id:P-S0-done
    -> END
}
{ flag("prologue.errands.bowls") == "none" and flag("prologue.errands.cloth") == "none" and flag("prologue.errands.medicine") == "none":
    -> offer
}
-> aunt_catch_up ->
周婶：回来啦？剩下的不急，累了就歇着。 #id:P-S0-01b
-> END

= offer
周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。 #id:P-S0-01
周婶：陈伯的碗该还了，客栈的布该取了，老人家的药也包好了。都在村里，跑一圈认认路。 #id:P-S0-01a
+ [“三样都交给我，我跑一趟。”] -> take
+ [“我先四处转转。”] -> END

= take
周婶：碗在灶台边，搁陈伯桌上就成；布跟掌柜提我一声，他自然给你。 #id:P-S1-01
周婶：送完药，我那只竹篮在老人家修提手，顺手捎回来。都办完了再来找我。 #id:P-S3-01
~ set_flag("prologue.errands.bowls", "accepted")
~ carry("bowls", 2)
~ set_flag("prologue.errands.cloth", "accepted")
~ set_flag("prologue.errands.medicine", "accepted")
~ carry("medicine", 1)
~ checkpoint()
~ toast_for("已接：替周婶跑一圈", 1600)
-> END

= hand_in
萧白：碗送到了，布和竹篮都带回来了。 #id:P-S0-ret-01
周婶：手脚倒快。布搁那边高架上，篮子搁门边就成。 #id:P-S0-ret-02
{ flag("prologue.heard.skill") or flag("prologue.heard.box") or flag("prologue.heard.inspection"):
    周婶：路上听着什么了？眉头皱成那样。 #id:P-S0-ret-03
    萧白：听见几句闲话，还没听全……回头再说吧。 #id:P-S0-ret-04
}
周婶：给，这个抹手上那道口子，别沾了水。 #id:P-S0-ret-05
萧白：谢谢周婶。 #id:P-S0-ret-06
~ set_flag("prologue.errands.cloth", "done")
~ set_flag("prologue.errands.medicine", "done")
~ uncarry("cloth")
~ uncarry("basket")
~ set_flag("prologue.errandGift", true)
~ checkpoint()
~ toast_for("替周婶跑一圈 · 办完了", 1400)
-> END

// 旧档：三件分开接过、还有没接的，补成已接，按一条任务走
=== aunt_catch_up ===
{ flag("prologue.errands.bowls") == "none":
    ~ set_flag("prologue.errands.bowls", "accepted")
    ~ carry("bowls", 2)
}
{ flag("prologue.errands.cloth") == "none":
    ~ set_flag("prologue.errands.cloth", "accepted")
}
{ flag("prologue.errands.medicine") == "none":
    ~ set_flag("prologue.errands.medicine", "accepted")
    ~ carry("medicine", 1)
}
->->

// 三处都办完、还没交差：碗已送到，布已取到，药已送到（竹篮在手上）；旧档里布或篮子先交过一样的也算
=== function round_ready() ===
~ return flag("prologue.errands.bowls") == "done" and (flag("prologue.errands.cloth") == "collected" or flag("prologue.errands.cloth") == "done") and (flag("prologue.errands.medicine") == "delivered" or flag("prologue.errands.medicine") == "done") and not (flag("prologue.errands.cloth") == "done" and flag("prologue.errands.medicine") == "done")
