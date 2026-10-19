// 风起栖河 · 找三方代表说话（可选，随时可找）
// 地点：三人各自的落脚处（联络院门前、南村车道旁／东埠装卸路、采办核货点；撤离后在邻村）　在场：萧白与其中一人
// 戏眼：萧白想弄清这几个外来人到底要叶家什么、是什么人；对方各有立场、只肯说到自己知道的那一步；散场时萧白多知道一点她们的来意或为人（问过“要什么”记为已谈过）。
// 2026-10-19 三方批次：从 js/qihe-representatives.js interact()（chats、firstContact、开口招呼）搬入，并按剧情三道关改写
//   （戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-reps-actors-brief.json 场 S5-*）：少复述案情，每人“你是什么人”一问各露一句性格。
//   参数 after：对证之后（撤离到邻村且 evidence-v2 已演）；refuge：已撤离到邻村；met：已在主线见过她（徐令仪看 xu-meeting，另两人看 three-meeting）；
//   errand_new／errand_active／errand_done：三方跑腿（js/qihe-outsiders.js）可接、在办、已办完——只在跑腿还开放时有其一为真。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink
VAR after = false // 参数
VAR refuge = false // 参数
VAR met = false // 参数
VAR errand_new = false // 参数
VAR errand_active = false // 参数
VAR errand_done = false // 参数

=== qihe_reps_talk_xulingyi ===
{
- after:
    徐令仪：伤者都安顿下来了。……你来，是为附页的事？ #id:R5-xu-g3
- refuge:
    徐令仪：三张附页都摊在桌上了。你也来过个目？ #id:R5-xu-g2
- else:
    徐令仪：叶家的事还没个结果，我暂且留在村里。……找我有事？ #id:R5-xu-g1
}
* {not after} [“你们到底要叶家什么？”]
    ~ reps_note("xulingyi-dispute", true)
    { met:
        徐令仪：委托在盟里确实登了记。可原件，我还没见着。 #id:R5-xu-b1
        萧白：登了记，就能替人家答应？ #id:R5-xu-b2
        徐令仪：……不能。所以我还在查。病人照常出入；叶姑娘要离村，劳烦先知会一声。 #id:R5-xu-b3
    - else:
        徐令仪：这位是叶家的客人？正道盟文议执事，徐令仪。 #id:R5-xu-f1
        徐令仪：盟里接了托付，替叶家保管旧物——只是原件我还没过目。有话要转，找我便是。 #id:R5-xu-f2
        萧白：委托上写了，不等于叶家答应了。 #id:R5-xu-f3
        徐令仪：……在理。依例，该当面问叶姑娘本人。我亲自去。 #id:R5-xu-f4
    }
* {after} [“附页的事，查得怎么样了？”]
    ~ reps_note("xulingyi-dispute", true)
    徐令仪：原委托上没有叶家的签字。同一张收货单，被人改成了三样东西。 #id:R5-xu-a1
    徐令仪：我得一环一环往回查，看是谁转的。护院拔刀那笔账，我不推。 #id:R5-xu-a2
* [“你是什么人？”]
    { not met and not after:
        徐令仪：正道盟文议执事，徐令仪。叶家这桩事，落在我手上。 #id:R5-xu-p0
    - else:
        徐令仪：文议执事，管盟里的文书往来、核验凭据，各派起了纠纷，也由我们调停。 #id:R5-xu-p1
        徐令仪：……这回，是我把一张纸，当成了人家的意思。 #id:R5-xu-p2
    }
* {refuge and not after} [“把三张附页放一起对一对吧。”]
    ~ reps_evidence()
* {errand_new} [“有什么要我帮忙的吗？”]
    ~ reps_errand()
* {errand_active} [“「一封未落款的拜帖」的事，我来回话。”]
    ~ reps_errand()
* {errand_done} [“上回「一封未落款的拜帖」那件事……”]
    ~ reps_errand()
* [“没事，打扰了。”]
-
-> END

=== qihe_reps_talk_censhuang ===
{
- after:
    岑霜：火是灭了，账还没算完。……找我？ #id:R5-cen-g3
- refuge:
    岑霜：一夜没合眼，脸色怕是不能看了。……有话就说。 #id:R5-cen-g2
- else:
    岑霜：哟，陈伯家的客人。……这身衣裳倒合身，借谁的？ #id:R5-cen-g1
}
* {not after} [“你们到底要叶家什么？”]
    ~ reps_note("censhuang-dispute", true)
    { met:
        岑霜：传讯说，玉匣是我们堂里的旧物，正道盟还要趁夜接走。 #id:R5-cen-b1
        岑霜：叶姑娘说她没答应过……我听见了。消息打哪儿来，我自会去问。 #id:R5-cen-b2
        萧白：问清之前，别让乌魁动手抢。 #id:R5-cen-b3
        岑霜：路是我让他看的，可没让他伤人。他敢动手，不用你来，我自己收拾。 #id:R5-cen-b4
    - else:
        岑霜：既然问了……归烬堂，岑霜。来取回自家的东西罢了。 #id:R5-cen-f1
        岑霜：乌魁带回一张旧货账，堂里又催着收回一只旧玉匣……这风声打哪儿来的，我倒也想知道。 #id:R5-cen-f2
        萧白：叶家卖过什么，得问卖的人。 #id:R5-cen-f3
        岑霜：那就去问。乌魁是我的人，我来管；真要谈，我自己找叶姑娘。 #id:R5-cen-f4
    }
* {after} [“附页的事，查得怎么样了？”]
    ~ reps_note("censhuang-dispute", true)
    岑霜：乌魁我让人看着了。传讯回去查，乡亲们的损失先照单赔。 #id:R5-cen-a1
    岑霜：扇子只拦了他的手，可没替他抹掉抢箱子的事。 #id:R5-cen-a2
    岑霜：匣子不在叶家，那它在哪儿？谁先知道它“该”在那儿？……这才有意思。 #id:R5-cen-a3
* [“你是什么人？”]
    岑霜：归烬堂，岑霜。专管抛头露面、跟外人打交道的事。 #id:R5-cen-p1
    岑霜：……板着脸作甚。归烬堂又不吃人。 #id:R5-cen-p2
* {refuge and not after} [“把三张附页放一起对一对吧。”]
    ~ reps_evidence()
* {after} [“往后你们去哪儿？”]
    岑霜：想查外头的传讯？门路我有。等我把堂里这笔账理清，再来找我。 #id:R5-cen-r1
* {errand_new} [“有什么要我帮忙的吗？”]
    ~ reps_errand()
* {errand_active} [“「旧罐与玉匣」的事，我来回话。”]
    ~ reps_errand()
* {errand_done} [“上回「旧罐与玉匣」那件事……”]
    ~ reps_errand()
* [“没事，打扰了。”]
-
-> END

=== qihe_reps_talk_shenyanhui ===
{
- after:
    沈雁回：人都送出来了。你找我什么事？ #id:R5-shen-g3
- refuge:
    沈雁回：我在等原件。有事快说。 #id:R5-shen-g2
- else:
    沈雁回：药单我还在对。有话说快些。 #id:R5-shen-g1
}
* {not after} [“你们到底要叶家什么？”]
    ~ reps_note("shenyanhui-dispute", true)
    { met:
        沈雁回：单子上写药验过了、叶家答应交样——连个大夫签字都没有。 #id:R5-shen-b1
        萧白：那你为什么先扣住整只箱子？ #id:R5-shen-b2
        沈雁回：怕东西被人带走。原件对不上，我马上放手。病人的药，我一根指头没动。 #id:R5-shen-b3
    - else:
        沈雁回：替巡江司程巡检查这趟药的，沈雁回。 #id:R5-shen-f1
        沈雁回：采办队转来药单和一张附页。药名、数目、谁签的字，我一样一样对。 #id:R5-shen-f2
        萧白：药验没验过，得问当初看药的大夫吧？ #id:R5-shen-f3
        沈雁回：对。所以要原话——我不想听点篓子的随从替大夫说话。 #id:R5-shen-f4
    }
* {after} [“附页的事，查得怎么样了？”]
    ~ reps_note("shenyanhui-dispute", true)
    沈雁回：药签还给叶姑娘了。转来的那张我留着，带回去给程巡检。 #id:R5-shen-a1
    沈雁回：先扣整只箱子，是我想岔了。 #id:R5-shen-a2
    沈雁回：续脉散既然没验过，我就顺着那张附页往回查，看是谁写的。 #id:R5-shen-a3
* [“你是什么人？”]
    沈雁回：沈雁回。早年跟商队跑药材，药和关卡都熟。还有什么？ #id:R5-shen-p1
    沈雁回：——哎，这会儿什么时辰了？未时过了没有？程巡检还等我回话。 #id:R5-shen-p2
* {refuge and not after} [“把三张附页放一起对一对吧。”]
    ~ reps_evidence()
* {after} [“往后你们去哪儿？”]
    沈雁回：巡江司那边，我去跟程巡检说。眼下不是时候，过些日子再来找我。 #id:R5-shen-r1
* {errand_new} [“有什么要我帮忙的吗？”]
    ~ reps_errand()
* {errand_active} [“「药单上的两道数」的事，我来回话。”]
    ~ reps_errand()
* {errand_done} [“上回「药单上的两道数」那件事……”]
    ~ reps_errand()
* [“没事，打扰了。”]
-
-> END
