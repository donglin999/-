// 风起栖河 · 问船家（归烬堂支线·灯一之二，可选）
// 地点：东埠小码头（地图可交互物稿 E1）　在场：船家、萧白
// 戏眼：萧白想问出黑衣人的来路；船家怕惹事。散场时萧白知道他打汉皋坐下水船来、天亮上后山、天黑回船上睡。
// 2026-10-23 剧本三新写（归烬堂支线·蔺管事线，设计稿 xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三～七节；戏眼卡 xiaojianghu/docs/design/scripts/briefs/guijintang-lin-sideline-brief.json）。2026-10-27 用户授权 Claude 代审，已冷读、批准（--approve）。；JS 未接（接口见共用笔记 42-剧本三.md）。
//   门槛：records.lamp.met（接过算命先生的托付）。时限半日 0～2。说话人“船家”待登记 bible/人物/船家.md（地图稿 E1 已获准上图，人物页尚未建）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-三方.ink

=== qh_lamp_boatman ===
萧白：船家，跟您打听个人。那个穿黑衣的客人，是坐哪条船来的？ #id:L2-01
船家：问他做啥？欠你钱了？ #id:L2-02
萧白：他给药摊递过字条，我想知道是什么人。 #id:L2-03
船家：下水船，打汉皋那头来的。船钱给的汉皋银票，我这小码头找都找不开。 #id:L2-04
船家：天不亮就往北路上后山，天黑才回船上睡。别的我可不晓得。 #id:L2-05
~ set_flag("qiheChapter.records.lamp.boatman", true)
-> END
