// 风起栖河 · 跟着脚夫（归烬堂支线·灯三的另一种做法，可选）
// 地点：东埠 → 后山倒木 → 三家落脚处外头　在场：萧白；护院、帮众、采办随从
// 戏眼：萧白想看脚夫天亮去见谁；脚夫下山后走的都是有人的地方。散场时萧白看见倒木上的账房递给他一个油纸包，三家的人也都看见了萧白。
// 2026-10-23 剧本三新写（归烬堂支线·蔺管事线，设计稿 xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三～七节；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json）。待用户过目，未 --approve；JS 未接（接口见共用笔记 42-剧本三.md）。
//   门槛：records.lamp.briefed。只在半日 4（第三天上午）开放，与“去后山赴宋先生的约”二选一（支线稿交叉点 X5，JS 互斥锁）。播完记 lamp.noticed=tailed（JS）。
//   参数 knows_song：竹匾那场见过宋先生（records.stranger_deal 有值，答应或拒绝都算）的认得他；从没碰到过的只认出“账房模样的人”。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink
VAR knows_song = false // 参数

=== qh_lamp_tail ===
【第三日清早 · 东埠】 #id:L5-00
萧白：（黑衣脚夫下了船，往北路去了。我隔着一段跟着。） #id:L5-01
{ knows_song:
    萧白：（后山倒木……他见的是宋先生。宋先生递给他一个油纸包。） #id:L5-02
- else:
    萧白：（后山倒木上坐着个账房模样的人，递给他一个油纸包。） #id:L5-02b
}
~ set_flag("qiheChapter.records.lamp.porter_seen", true)
~ set_flag("qiheChapter.records.lamp.t3", "tail")
萧白：（下了山，他没回船上，在三家落脚的地方外头各转了一圈，像在认门。） #id:L5-03
护院：站住！跟了一路了，你到底想干什么？ #id:L5-04
帮众：看什么看？滚远点。 #id:L5-05
采办随从：核货点，闲人别凑！公事！ #id:L5-06
萧白：（完了，这下三家都认得我的脸了。） #id:L5-07
-> END
