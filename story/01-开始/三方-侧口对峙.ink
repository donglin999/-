// 风起栖河 · 第三夜侧口（三方之三）：三家撞到一处、起火后各自下令救人
// 地点：药棚装卸侧口　在场：叶蘅、徐令仪、岑霜、沈雁回、乌魁、护院、采办随从、周砚、萧白
// 戏眼：叶蘅只想装完最后一车药带伤者走；三家偏偏同一时辰在同一个侧口出现，各说各的约定；散场时（交锋、起火之后）三人各自收手救人，叶蘅叫萧白去救陈伯或护车。
// 2026-10-19 三方批次：从 js/qihe-representatives.js rows.fireDemand、rows.fireCollision、rescueOrders() 搬入，并按剧情三道关改写
//   （戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-reps-actors-brief.json 场 S3-fire、S3-collision、S3-rescue；危急时只下命令）。
//   前两段由主线 qihe-chapter.js 通过 QiheRepresentatives.rows.fireDemand / fireCollision 取用（接口不变），中间是交锋与起火（主线负责）。
//   参数 clash：交锋打过（p.clashVersion）时，徐令仪和萧白的说法不同。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink
VAR clash = false // 参数

=== qihe_reps_fire_demand ===
【第三夜 · 药棚装卸侧口】 #id:R3-01
叶蘅：最后一车了，装完就走——你们怎么都来了？ #id:R3-02
徐令仪：午后盟里又补来一张附页，约今晚戌时在此交谱。 #id:R3-03
徐令仪：叶姑娘说过不交，我记着——所以亲自来当面问。问清之前，箱子先留步。 #id:R3-03b
岑霜：……巧了。我的传讯也是午后到的，也约今晚、这里——写的却是还匣。 #id:R3-04
岑霜：徐执事，你接谱，我接匣……叶姑娘一口箱子，装得下两样？ #id:R3-04b
沈雁回：我这张也是午后补的，说叶家要从这儿避开查验。验药记录还没到，箱子不能走！ #id:R3-05
叶蘅：交书、还匣、验药——我一件都没答应过！ #id:R3-06
-> END

=== qihe_reps_fire_collision ===
乌魁：闪开！让老子看看箱子里装的什么！ #id:R3-C1
护院：箱子留下！ #id:R3-C2
采办随从：让开让开！车先别过！ #id:R3-C3
叶蘅：这是我娘的箱子，谁都不许碰！ #id:R3-C4
萧白：（刀都拔出来了……车尾也被架子堵死了！） #id:R3-C5
-> END

=== qihe_reps_rescue ===
{ clash:
    徐令仪：护院，撑住这根梁！前面的人别往回挤！ #id:R3-R1b
- else:
    徐令仪：护院，收兵器！沿前路护住乡邻，先救人！ #id:R3-R1
}
周砚：我去前头接人！ #id:R3-R2
{ clash:
    ~ reps_beat()
    萧白：（乌魁还要去抓箱带——这时候还想着箱子！） #id:R3-R3
}
~ cg_begin("cen")
岑霜：乌魁，手不想要了？ #id:R3-R4
~ cg_end()
萧白：（她那把窄面折扇横在乌魁手腕前，乌魁的手硬是缩回去了。） #id:R3-R5
岑霜：看住他。其余人把空架挪到河边，别再堵门！ #id:R3-R6
沈雁回：箱子不扣了！差役，去西边接人——门口那位老人家，跟我走！ #id:R3-R7
~ cg_begin("shen")
沈雁回：老人家，跟着我，脚下慢点。 #id:R3-R8
~ cg_end()
叶蘅：萧白！陈伯倒在药架边，车也卡住了—— #id:R3-R10
-> END
