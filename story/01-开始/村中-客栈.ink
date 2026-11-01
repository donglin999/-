// 风起栖河 · 客栈（地图可交互物稿 5.4，方案 A）：店家回柜台、帮众坐饮酒桌；Q3 三天酒钱；住客簿、后厨灶台、墙边箱笼；外院菜牌
// 地点：客栈室内／南村口　在场：萧白、店家、帮众（岑霜一段在东埠或南村口）
// 戏眼：怕事的店家最怕的不是被赖账，是要账要出事。萧白可以找管束帮众的岑霜、当面去要、或自己垫上；店家三种反应不同。散场时账了结，灶上热汤免费，里间旧物让萧白挑一样。
// 2026-10-27 主会话：戏眼卡 ../xiaojianghu/docs/design/scripts/briefs/qihe-town-interactables-brief.json（T-tab-*、T-soup、T-book、T-chest、T-menu），MiniMax-M3 演员法每句三备选，主会话挑选剪辑（店家称“客官”，不叫萧白名字；岑霜不叫“萧公子”）。
// 调用：js/qihe-town.js。选项结果用 fq_answer 交回；酒钱数额、汤钱、箱笼给什么都在 JS。
// 2026-10-29 逻辑排查（评审台，你答过的题由 Claude 落实）：QI-f-03 不再反问帮众没说过的话；QI-d-cen 银子是管事给的，店家改怕“记恨到小店头上”；热汤按界面的“两”改成一两（代码汤价改 1）。
// 2026-10-30 加 qh_inn_rumor：照八方旅人，偷窃失手攒下的风声可以找店家花钱压下去（用户评审台第三十轮第 3 题：按实际去改，汉皋先不管）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

VAR can_cen = false // 参数：岑霜已在装卸路正式登场
VAR can_pay = false // 参数：萧白身上的钱够垫这笔账
VAR via = "" // 参数：酒钱怎么了结的，"cen"／"face"／"pay"
VAR free = false // 参数：酒钱了结过，汤不收钱
VAR fee = "" // 参数：压风声要多少两
VAR can_fee = false // 参数：钱够不够

=== qh_inn_tab_offer ===
店家：嗐……客官，那桌又赊下酒了，小店实在不敢去催。 #id:QI-o-01
萧白：掌柜的，怎么回事？ #id:QI-o-02
店家：那桌人连喝三天，账都赊着，说堂里的人会来结。我……不敢开口。 #id:QI-o-03
店家：他们堂里的人……小店惹不起啊。 #id:QI-o-04
+ {can_cen} [“我去找他们管事的。”]
    店家：管事的？那……那您可当心。 #id:QI-o-cen
    ~ fq_answer("cen")
+ [“我去跟他们说。”]
    店家：客官，您可当心…… #id:QI-o-face
    ~ fq_answer("face")
+ {can_pay} [“这账我先替他们结了。”]
    ~ fq_answer("pay")
+ [“我再想想。”]
- -> END

=== qh_inn_tab_again ===
店家：客官，那桌的账……还挂着呢。 #id:QI-a-01
+ {can_pay} [“这账我替他们结了。”]
    ~ fq_answer("pay")
+ [“再说吧。”]
- -> END

=== qh_inn_tab_pay ===
店家：哎呀，这怎么使得！客官快把钱收回去。 #id:QI-p-01
萧白：就当图个清静。 #id:QI-p-02
店家：那……那我就收下了。多谢客官。 #id:QI-p-03
-> END

=== qh_inn_tab_face_ask ===
萧白：（就是这桌欠着掌柜的酒钱。） #id:QI-fa-01
* [替掌柜的要账]
    ~ fq_answer("face")
* [算了]
- -> END

=== qh_inn_tab_face ===
萧白：这三天的酒钱，该结了。 #id:QI-f-01
帮众：你算哪根葱？一个外乡人，也敢替人出头？ #id:QI-f-02
萧白：说是堂里来结——那我去找你们管事的，就说你们在这儿白喝了三天。 #id:QI-f-03
帮众：……行，行！钱拿去，少多事！ #id:QI-f-04
店家：客官，您可真敢说……往后他们再来，小店可怎么办哟。 #id:QI-f-05
-> END

=== qh_inn_tab_cen_ask ===
萧白：（客栈那桌是她的人……酒钱的事，跟她提一句？） #id:QI-ca-01
* [跟她说酒钱的事]
    ~ fq_answer("tab")
* [先说别的]
- -> END

=== qh_inn_tab_cen ===
萧白：你手下的人在客栈喝了三天酒没给钱，掌柜的不敢去要。 #id:QI-c-01
岑霜：……倒是个热心人。这事跟你有什么干系？ #id:QI-c-02
萧白：没什么干系，就是看不过去。 #id:QI-c-03
岑霜：银子你带去。账我结，人……我回头收拾。 #id:QI-c-04
-> END

=== qh_inn_tab_done ===
{
- via == "cen":
    店家：是他们管事拿的银子？……那桌人回头挨了收拾，就怕记恨到小店头上。 #id:QI-d-cen
- via == "face":
    店家：多谢客官。只是往后他们来了……唉，您多担待些。 #id:QI-d-face
- via == "pay":
    店家：客官替小店垫的账……实在过意不去。 #id:QI-d-pay
}
店家：灶上的热汤往后不收您钱。墙边箱笼里有几样客人落下的旧物，您挑一样。 #id:QI-d-02
-> END

=== qh_inn_soup ===
{ free:
    店家：还提什么钱，灶上热着呢，这就给您舀。 #id:QI-s-free
- else:
    店家：热汤一碗，算您一两，连壶茶。 #id:QI-s-pay
}
萧白：（热汤下肚，身上松快了些。） #id:QI-s-02
-> END

=== qh_inn_soup_full ===
店家：客官刚喝过一碗，再喝可就撑着了。 #id:QI-s-full
-> END

=== qh_inn_soup_poor ===
店家：客官，一两……您先凑凑？ #id:QI-s-poor
-> END

=== qh_inn_book ===
萧白：（“客二，佩刀，账记堂上”；“采办随从一位，问路”。） #id:QI-b-01
萧白：（账记在“堂上”——他们是等着堂里来付。） #id:QI-b-02
-> END

=== qh_inn_chest_locked ===
萧白：（墙边的箱笼上着锁。） #id:QI-k-lock
-> END

=== qh_inn_chest ===
店家：箱里都是客人落下没回来取的，您挑一样。 #id:QI-k-01
* [火折子]
    ~ fq_answer("tinder")
* [旧斗笠]
    ~ fq_answer("hat")
* [先不挑]
- -> END

=== qh_inn_chest_empty ===
店家：剩下的都是些不值钱的了。 #id:QI-k-empty
-> END

=== qh_inn_menu ===
萧白：（笼饼、热汤、竹叶青……兜里这点钱，够吃哪样？） #id:QI-m-01
-> END

=== qh_inn_rumor ===
店家：客官，这两天外头有人嚼舌头，说您手脚不大干净…… #id:QI-r-01
店家：来往的人都在小店歇脚，话是从这儿传的。{fee} 两，我替您压一压。 #id:QI-r-02
+ {can_fee} [“劳烦掌柜的。”]
    店家：您放心，再有人提，我就说他喝多了。 #id:QI-r-pay
    ~ fq_answer("pay")
+ [“不必了。”]
- -> END
