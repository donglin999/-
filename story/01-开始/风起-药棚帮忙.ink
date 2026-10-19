// 风起栖河 · 村中活动：药棚帮忙（C1-A-clinic）
// 地点：村中药棚　在场：叶蘅、萧白
// 戏眼：叶蘅手边两件事忙不过来，萧白想帮又不懂医。散场时药包扎好了，或病人家的药送到了。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody('clinic') 搬入。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_act_clinic ===
叶蘅：今天手边有两件事，你挑一件？ #id:C1-A-clinic-01
* [“我帮你分药包。”]
    ~ set_flag("qiheChapter.choices.clinic", "pack")
    叶蘅：照着签子扎紧，放架子边上，走的时候好拿。 #id:C1-A-clinic-A1
    叶蘅：那个小纸包是母亲的旧东西，别跟急用药混在一起。 #id:C1-A-clinic-A2
* [“我陪你去送药。”]
    ~ set_flag("qiheChapter.choices.clinic", "visits")
    叶蘅：你帮我记门牌、拎药包就行，看病的事我来。 #id:C1-A-clinic-B1
    叶蘅：先问哪里难受，再问什么时候开始的。别替人家猜。 #id:C1-A-clinic-B2
- -> END
