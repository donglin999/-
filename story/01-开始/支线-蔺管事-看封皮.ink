// 风起栖河 · 看一眼封皮（归烬堂支线·灯二，可选）
// 地点：岑霜的落脚处（东埠装卸路／南村口）　在场：岑霜、萧白
// 戏眼：萧白想看一眼岑霜那封传讯的封皮；岑霜不会随便给外人看堂里的讯。散场时萧白看到汉皋的戳和压过两回的火漆，或者被回绝，或者说漏了算命先生。
// 2026-10-23 剧本三新写（归烬堂支线稿第三节灯二、交叉点 X4；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json 场 L4-seal）。待用户过目，未 --approve；JS 未接。
//   入口：和岑霜交谈时多一项“你那封传讯，能给我看一眼吗？”（records.lamp.briefed 为真、lamp.seal 为空、已在装卸路见过她、还没撤到邻村）。
//   单写成一场，不改已批准的《三方-找人交谈》（那场路线已到遍历上限）；入口文字由 JS 加在岑霜的交谈选项里。
//   被回绝（随口一问）不记标记，可以再来。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink

=== qh_lamp_seal ===
萧白：你那封传讯，能给我看一眼吗？ #id:L4-01
* [“叶姑娘想知道，上头写的旧物是哪年的。”]
    岑霜：哪年的？……没写。喏，自己看，别上手。 #id:L4-A1
    萧白：（汉皋的戳，火漆还封了两回……这信被拆过？） #id:L4-A2
    ~ set_flag("qiheChapter.records.lamp.seal", "seen")
* [“就是好奇，想看看。”]
    岑霜：堂里的讯，给你看着玩？……好奇心收一收。 #id:L4-B1
* [“有人托我来看的。”]
    岑霜：谁？ #id:L4-C1
    萧白：北路摆摊的算命先生。 #id:L4-C2
    岑霜：算命的？……什么样的算命先生？ #id:L4-C3
    萧白：腰上挂着盏不点的小铜灯。 #id:L4-C4
    岑霜：……管船的，管到我头上来了。 #id:L4-C5
    ~ set_flag("qiheChapter.records.lamp.seal", "asked_openly")
    ~ set_flag("qiheChapter.records.lamp.sold", "cen")
- -> END
