// 风起栖河 · 侧口起火（C1-04、C1-05）
// 地点：药棚装卸侧口　在场：叶蘅、萧白、周砚、陆衡、陈伯；三方（台词在三方批次的剧本里）
// 戏眼：三家对峙、交锋时灯台被撞歪，晾布起火；萧白和叶蘅只想把人和药箱弄出去。散场时火起来了，萧白选去救陈伯或护车，众人从西边撤出。
// 2026-10-19 风起主线批次：fq_fire_before／fq_fire_ignition 从 js/qihe-faction-clash-data.js dialogue.before/ignition/afterIgnition 搬入；
// 冷读审读后：早上告诉过宋先生“今晚走”的，在起火前多一句心里话（C1-04-00）。
//   fq_rescue_choice／fq_rescue／fq_evacuation 从 js/qihe-chapter.js fireBody() 搬入。三方的对峙与下令救人由 QiheRepresentatives 播放（不在本文件）。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：灯芯先落在晾布上冒烟（交锋前），交锋中沈雁回喊“布棚着了”，交锋后插画里才烧起来；周砚改喊挪开堵门的架子（原来火还没起就喊背病人、跟沈姑娘出去，与三方下令救人重复）；救人前叶蘅只问一句（三方剧本末句已说过陈伯和车）；撤离时萧白“数过了”回扣替宋先生数人；护车一支去掉对仗句。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink
VAR told_departure = false // 参数：早上告诉过宋先生今晚就走（records.stranger_told_departure）

=== fq_fire_before ===
{ told_departure:
    萧白：（午后补来的附页，约的都是今晚、侧口……我早上才跟宋先生说过今晚走。） #id:C1-04-00
}
萧白：（灯台被撞歪了……灯芯掉在晾布上，冒烟了！） #id:C1-04-01
萧白：叶蘅！箱子先放车上，别跟他们抢！ #id:C1-04-02
周砚：屋里还有病人！萧白，先把门口那架子挪开！ #id:C1-04-03
-> END

=== fq_fire_ignition ===
~ fq_cg_begin("ignition")
叶蘅：着火了——！ #id:C1-04-04
~ fq_cg_end()
萧白：油罐倒了，火顺着油窜过来了！陈伯——！ #id:C1-04-05
-> END

=== fq_rescue_choice ===
叶蘅：我去陈伯那儿！你呢？ #id:C1-05-01
* [“我跟你去救陈伯！”]
    ~ set_flag("qiheChapter.rescue", "chen")
* [“我去帮陆大哥护车！”]
    ~ set_flag("qiheChapter.rescue", "cart")
- -> END

=== fq_rescue ===
{ flag("qiheChapter.rescue") == "chen":
    萧白：架子我来挪——陈伯，搭着我肩膀！ #id:C1-05-A1
    叶蘅：陈伯，这只手先别使劲……血止住了。 #id:C1-05-A2
    周砚：人交给我，你们从西田埂走。 #id:C1-05-A3
- else:
    陆衡：我卸筐，你顶住车辕！ #id:C1-05-B1
    萧白：顶住了——走！ #id:C1-05-B2
    周砚：陈伯伤了腿，我扶他从那边出去。 #id:C1-05-B3
    陆衡：车出来了！……人都出来了？ #id:C1-05-B4
}
-> END

=== fq_evacuation ===
{ flag("qiheChapter.rescue") == "chen":
    陆衡：药包我收齐了，大家从西边走！ #id:C1-05-A5
- else:
    叶蘅：陈伯的腿我待会儿再看，先出去！ #id:C1-05-B5
}
~ fq_cg_begin("evacuation")
叶蘅：药箱在我这里。人齐了吗？ #id:C1-05-06
萧白：数过了，都在。走，我看着后面。 #id:C1-05-07
~ fq_cg_end()
陆衡：……前头有人拦车！ #id:C1-05-08
-> END
