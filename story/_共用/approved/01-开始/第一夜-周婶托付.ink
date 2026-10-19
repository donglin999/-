// 第一夜 · 周婶托付（药棚里跟周婶说话：接三件可选小事、交还布包和竹篮）
// 地点：[[栖河·药棚]]　在场：萧白、周婶
// 戏眼：萧白吃完饭说过“明儿有什么活，您叫我”，想还人情；周婶本想让他歇着，可手头正好有三件走不开的顺手事。散场时他接下（或不接）还碗、取布、送药；三件都可不做，做了也不给钱物。
// 2026-10-18 第 2 期：从 js/qihe-map-trial.js aunt() 原样搬运，台词不改。原台词没有编号：
//   周婶开口与收尾句记 P-S0-*；每件小事的交代、交还按设计稿 errands-script.md 的 P-S1/P-S2/P-S3 句号对齐（规则见更新记录）。
//   选项顺序与原 JS 一致：先列未接的小事（还碗、取布、送药），再列可交还的（布、竹篮），最后“我先四处转转”。
// 2026-10-19 剧情三道关改造（戏眼卡 FN-aunt）：开口接上进村时那句“明儿有什么活，您叫我”，先把三件事报出来再让他挑（原选项里的事周婶从没提过）；
//   第一次搭话前会先播寒暄（第一夜-问候.ink qihe_greet_aunt），开口不再重复“锅里还有粥”；再来时改说 P-S0-01b。
//   竹篮为什么在老人家：周婶的篮子放在那儿让老人帮着修提手（接 P-S3-07、P-S3-13）。选项结构、接取与交还不变。
INCLUDE ../_共用/externals.ink

=== qihe_errand_aunt ===
#cast:萧白
{ flag("prologue.rested"):
    周婶：都收拾完啦，你也早点歇着。 #id:P-S0-rested
    -> END
}
{ flag("prologue.errands.bowls") == "none" and flag("prologue.errands.cloth") == "none" and flag("prologue.errands.medicine") == "none":
    周婶：你不是说有活就叫你？用不着等明儿，眼下就有几样顺手的。 #id:P-S0-01
    周婶：陈伯家的碗该还了，托客栈晾的布该收了，村南老人家的药也包好了。累了就歇着。 #id:P-S0-01a
- else:
    周婶：回来啦？剩下的不急，累了就歇着。 #id:P-S0-01b
}
+ {flag("prologue.errands.bowls") == "none"} [“陈伯家的碗，我帮您送回去。”] -> offer_bowls
+ {flag("prologue.errands.cloth") == "none"} [“客栈的布，我去取。”] -> offer_cloth
+ {flag("prologue.errands.medicine") == "none"} [“老人家的药，我去送。”] -> offer_medicine
+ {flag("prologue.errands.cloth") == "collected"} [“周婶，布取回来了。”] -> return_cloth
+ {flag("prologue.errands.medicine") == "delivered"} [“竹篮带回来了。”] -> return_basket
+ [“我先四处转转。”] -> END

= offer_bowls
周婶：就灶台边那两只，借了好几天了。搁他桌上就行。 #id:P-S1-01
+ [“好，我这就去。”]
    ~ set_flag("prologue.errands.bowls", "accepted")
    ~ carry("bowls", 2)
    ~ checkpoint()
    ~ toast_for("已接：还碗", 1600)
    -> END
+ [“我等会儿再去。”] -> END

= offer_cloth
周婶：药棚院子晒不下，托掌柜在客栈晾着。跟他说是我让你来取的，拿回来别沾了水。 #id:P-S2-01
+ [“好，我这就去。”]
    ~ set_flag("prologue.errands.cloth", "accepted")
    ~ checkpoint()
    ~ toast_for("已接：取布", 1600)
    -> END
+ [“我等会儿再去。”] -> END

= offer_medicine
周婶：老人家腿脚不好，药你给送过去。我那只竹篮在他那儿修提手，回来顺手带上。 #id:P-S3-01
+ [“好，我这就去。”]
    ~ set_flag("prologue.errands.medicine", "accepted")
    ~ carry("medicine", 1)
    ~ checkpoint()
    ~ toast_for("已接：送药与还篮", 1600)
    -> END
+ [“我等会儿再去。”] -> END

= return_cloth
萧白：掌柜的说店里忙，耽搁了一会儿。 #id:P-S2-15
周婶：辛苦你了，搁那边高架上吧。 #id:P-S2-16
~ set_flag("prologue.errands.cloth", "done")
~ uncarry("cloth")
~ checkpoint()
~ toast_for("取布完成", 1200)
-> END

= return_basket
周婶：老人家怎么样？ #id:P-S3-16
萧白：精神还好，就是腿脚不太灵便。 #id:P-S3-17
周婶：那就好。篮子搁门边吧。 #id:P-S3-18
~ set_flag("prologue.errands.medicine", "done")
~ uncarry("basket")
~ checkpoint()
~ toast_for("竹篮已归还", 1200)
-> END
