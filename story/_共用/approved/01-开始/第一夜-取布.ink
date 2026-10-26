// 第一夜 · 取布（P-S2）
// 地点：客栈　在场：萧白、店家、帮众
// 戏眼：帮众想打听叶家住哪儿，拦着掌柜逼问；掌柜怕事、只想脱身；萧白进门正撞上，选听下去还是上前取布。散场时萧白拿到布；听了的，知道有人说叶家缺钱、肯卖旧玉匣（乌魁手下的帮众只会复述，不知道是谁散的话）。旁听与否只记 prologue.heard.box。
// 2026-10-18 第 2 期：从 js/qihe-prologue-actions.js cloth() 原样搬运，台词不改；编号按 errands-script.md 的 P-S2 句号对齐。
// 2026-10-19 剧情三道关改造（戏眼卡 FN-cloth）：掌柜先说布搁在凳上、再去拿包布，萧白那声“布要掉了”才有来由；
//   选项改成“等他包好／不用包”，旁听是因为多等了一会儿（原选项“扶好篮子”里的篮子没人提过）；旁听后萧白心里对上“姓叶的”（P-S2-12a）；
//   交布时掌柜托话（P-S2-13，设计稿原有），接回药棚萧白那句转达。选项与旁听标记不变。
//   冷读审读后：交代布为什么在客栈（P-S2-01）；交布句不再说“包好了”（选“不用包”时也成立）；店家借口改“明儿白天问旁人”；水改茶。
// 2026-10-23 剧本二（opening-errands-rework.md 0.1 乙-1，戏眼卡 zhoushen-errand-round-brief.json ZR-cloth）：旁听前置——进门时帮众正在饮酒桌边逼问掌柜，
//   选“在门口听一会儿／上前找掌柜取布”，不再要“等他包好”；删去拖凳子那段（P-S2-05～09 原句不再用，P-S2-08 改作被打断时的一句）。布交给萧白后，交还在《周婶托付》的交差里。
INCLUDE ../_共用/externals.ink

=== qihe_errand_cloth ===
#cast:萧白
{ flag("prologue.errands.cloth") != "accepted":
    { flag("prologue.errands.cloth") == "none":
        店家：客官住店？对不住，满了。 #id:P-S2-idle
    - else:
        店家：布不是给你了？还有事？ #id:P-S2-idle-taken
    }
    -> END
}
帮众：掌柜的，姓叶的那家怎么走？说利索点！ #id:P-S2-10
店家：小的真不清楚，您明儿白天问问旁人吧。 #id:P-S2-11
* [在门口听一会儿] -> overhear
* [上前找掌柜取布] -> cut_in

= overhear
帮众：少糊弄！满村都传遍了，叶家缺钱，有只旧玉匣肯卖——你会不晓得？ #id:P-S2-12
萧白：（姓叶的……是叶蘅家？） #id:P-S2-12a
~ set_flag("prologue.heard.box", true)
萧白：掌柜的，周婶让我来取布。 #id:P-S2-04b
-> collect

= cut_in
萧白：掌柜的，我替周婶取布。 #id:P-S2-04
帮众：哪儿来的小子，没瞧见爷正问话么？ #id:P-S2-08
-> collect

= collect
店家：好好好，布在这儿。劳驾跟周婶说声，布今儿收迟了。 #id:P-S2-13
~ set_flag("prologue.errands.cloth", "collected")
~ carry("cloth", 1)
~ checkpoint()
~ toast_for("拿到布包", 1500)
-> END

// 客栈里的帮众（随时可搭话的一句）
=== qihe_inn_bandit ===
#cast:萧白
帮众：看什么看！ #id:P-S2-bandit
-> END
