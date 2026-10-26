// 风起栖河 · 算命摊测字（归烬堂支线·灯一，可选）
// 地点：中央北路西侧算命摊（地图可交互物稿 C3）　在场：算命先生（蔺晦之乔装）、萧白
// 戏眼：蔺管事想找一双能在村里走动的眼睛；萧白是生人，可能已经在替别人看着。散场时萧白接下“去河埠问黑衣脚夫的来路”（或只测了个字），答应过宋先生的还听到“站位谁问都别给”。
// 2026-10-23 剧本三新写（归烬堂支线·蔺管事线，设计稿 xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三～七节；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json）。2026-10-27 用户授权 Claude 代审，已冷读、批准（--approve）。；JS 未接（接口见共用笔记 42-剧本三.md）。
//   时限：半日 0～1。只在头一回测字时播本场；之后测字走地图稿第 5.5 节的普通测字。
//   读 records.stranger_deal：答应过宋先生的（accepted／asked_first），他看出萧白在替人数人（支线稿交叉点 X1）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink

=== qh_lamp_meet ===
算命先生：小兄弟，测个字？今天你头一个，不收钱。 #id:L1-01
萧白：那就测个“回”字。回家的回。 #id:L1-02
算命先生：回——口里套着个口。心里揣着一件事，嘴上又裹着一件。这字挑得准。 #id:L1-03
萧白：……您怎么看出来的？我身上又没写字。 #id:L1-04
~ lamp_omen()
{ flag("qiheChapter.records.stranger_deal") == "accepted" or flag("qiheChapter.records.stranger_deal") == "asked_first":
    -> counted
}
算命先生：你跟着叶家姑娘进进出出，是想替她做点什么吧。 #id:L1-05c
-> ask

= counted
算命先生：你从后山下来，怀里揣着药包，眼睛把我这摊子数了一遍。谁托你看人？ #id:L1-05
* [“后山一位姓宋的账房。”]
    算命先生：后山……账房。 #id:L1-05a
* [“没谁，随便看看。”]
    算命先生：随便看看，也看得这么细。 #id:L1-05b
- -> ask

= ask
算命先生：托你件事。有个穿黑衣的脚夫，天不亮就打我这摊子前头上后山。 #id:L1-06
算命先生：你去东埠码头问问船家，他坐哪条船来的，打哪儿来。 #id:L1-06b
萧白：黑衣……药摊的药商说，给他递字条的人也穿黑衣。 #id:L1-07
算命先生：那就更该问问。跟叶家的事有没有干系，我也想知道。 #id:L1-08
* [“行，我去问问。”]
    ~ set_flag("qiheChapter.records.lamp.met", true)
    { flag("qiheChapter.records.stranger_deal") == "accepted" or flag("qiheChapter.records.stranger_deal") == "asked_first":
        算命先生：还有一句。你在路口看见谁站在哪，谁问都别给。 #id:L1-09
        萧白：……为什么？ #id:L1-09b
        算命先生：站位这东西，是能要人命的。 #id:L1-09c
        ~ set_flag("qiheChapter.records.lamp.warned", true)
    }
* [“我就是来测个字的。”]
    算命先生：也好。字测完了，路上当心。 #id:L1-10
- -> END
