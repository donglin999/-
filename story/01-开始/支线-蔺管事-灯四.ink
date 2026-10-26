// 风起栖河 · 算命摊回话（二）：谁在牵线（归烬堂支线·灯四，可选）
// 地点：北路算命摊　在场：蔺管事、萧白（交付“告诉岑姑娘”时转到东埠：岑霜、乌魁）
// 戏眼：蔺管事要知道是谁在三家中间牵线、人在哪；萧白手里的东西有真有假。散场时推断成立或不成立，交给谁、怎么拿定下来。
// 2026-10-23 剧本三新写（归烬堂支线·蔺管事线，设计稿 xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三～七节；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json）。待用户过目，未 --approve；JS 未接（接口见共用笔记 42-剧本三.md）。
//   门槛：records.lamp.met，且他没被说出去（lamp.sold 为空；JS）。时限半日 4，在“后山／跟脚夫”之后。
//   推断两步（支线稿第四节，第十三轮写定）：先指人，再拿一条凭据；凭据只列萧白真拿到的。
//   F-0027 已于 2026-10-23 经用户确认放宽：这里萧白只点破“侧口”一条、只说到“在牵线”，不说宋先生是谁；红绳、回纹针脚、青玉算珠等身份疑点不作凭据、不解释。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink

=== qh_lamp_report2 ===
蔺管事：回来了。这几天在三家中间牵线的，你看是什么人？ #id:L6-01
* [“乌魁。”]
    蔺管事：乌魁？他那是把锤子，使不来针线。 #id:L6-02
    -> again
* [“卖罐子的药商。”]
    蔺管事：药商只卖过罐子，连字条都是别人递给他的。 #id:L6-03
    -> again
* [“后山倒木那个账房。”]
    -> proof
* [“我说不准。”]
    -> unsure

= again
* [“后山倒木那个账房。”]
    -> proof
* [“我说不准。”]
    -> unsure

= proof
蔺管事：凭什么？ #id:L6-04
- (ev)
* {flag("qiheChapter.records.song_asked_side")} [“他问起装卸侧口。”]
    萧白：他问我叶家是不是从装卸侧口走。侧口，我从没跟他提过。 #id:L6-05
    -> ok
* {flag("qiheChapter.records.lamp.porter_seen")} [“脚夫天亮去见他。”]
    萧白：今早那脚夫从倒木下来，揣着个油纸包。倒木上就他一个人。 #id:L6-06
    -> ok
* {flag("qiheChapter.records.lamp.seal") == "seen"} [“封皮在汉皋拆过。”]
    蔺管事：这只说明讯在汉皋被动过，说明不了是他。 #id:L6-07
    -> ev
* [“……我说不上来。”]
    -> unsure

= ok
~ set_flag("qiheChapter.records.lamp.deduce", "ok")
蔺管事：准。 #id:L6-08
-> qh_lamp_handoff

= unsure
~ set_flag("qiheChapter.records.lamp.deduce", "fail")
~ set_flag("qiheChapter.records.lamp.handoff", "unsure")
蔺管事：那我自己去后山转转。 #id:L6-14
-> END

=== qh_lamp_handoff ===
// 交付（交叉点 X7）：只在推断成立后接着演；单列一个 knot 只为路线遍历不超上限。
蔺管事：人在后山，脚夫在外头跑。你说，怎么拿？ #id:L6-08b
* {flag("qiheChapter.records.lamp.boatman") and flag("qiheChapter.records.lamp.porter_seen")} [“先拿东埠的船，再上后山。”]
    ~ set_flag("qiheChapter.records.lamp.handoff", "blade_order")
    萧白：他今早让脚夫带走一包东西。脚夫天黑才回东埠的船——先拿船，再上山。 #id:L6-09
    蔺管事：船是我的本行。……这事，你别再沾手了。 #id:L6-10
* [“您现在就上后山。”]
    ~ set_flag("qiheChapter.records.lamp.handoff", "blade_direct")
    蔺管事：白天上山？他坐在高处，看得见路。……也罢，我去看看。 #id:L6-11
* [“我自己去问他。”]
    ~ set_flag("qiheChapter.records.lamp.handoff", "confront")
    蔺管事：你一问，他就知道有人在查了。……随你。 #id:L6-12
    【后山 · 倒木】 #id:L6-12b
    萧白：（倒木上没有人。……他不在。） #id:L6-12c
* [“这事该告诉岑姑娘。”]
    ~ set_flag("qiheChapter.records.lamp.handoff", "cen")
    蔺管事：告诉她？她不会认我这份情。……你要去，就去吧。 #id:L6-13
    -> tell_cen
- -> END

= tell_cen
【东埠】 #id:L6-C0
萧白：后山倒木有个账房，在三家中间牵线。 #id:L6-C1
萧白：是北路摆摊的算命先生查出来的，腰上挂着盏小铜灯的那位。 #id:L6-C1b
岑霜：……管船的。我的差事，轮不到他来查。 #id:L6-C2
岑霜：乌魁，带两个人上后山看看。 #id:L6-C3
乌魁：你一个借住的，怎么知道后山有人？ #id:L6-C4
萧白：（她没谢我。乌魁那双眼睛，倒是盯上我了。） #id:L6-C5
-> END

