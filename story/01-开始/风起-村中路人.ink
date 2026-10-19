// 风起栖河 · 村中路人与查看（场景里站着的人、路口、痕迹）
// 地点：后山、南村口、东埠、西田埂、邻村院子、归云谷客院　在场：说话的人、萧白
// 戏眼：守门的、让路的、坐着歇脚的人各有一句眼下的话；萧白在后山看见靴印。散场时只有“看见靴印”记一笔。
// 2026-10-19 风起主线批次：从 js/qihe-expansion.js 的单句台词搬入。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_x_portal_mountain ===
萧白：（先安顿好今晚。回村看乡亲的事，等来了信再说。） #id:QX-portal-mountain
-> END

=== fq_x_portal_refuge ===
萧白：（大家都撤回院子里了。先看看伤者，再去找周先生商量往后的事。） #id:QX-portal-refuge
-> END

=== fq_x_wait ===
萧白：（这边有人在等着，先别过去。） #id:QX-wait
-> END

=== fq_x_tracks ===
萧白：（泥里有靴印，不是草鞋……枝子刚折断。远处还有狗叫？） #id:QX-tracks
~ set_flag("prologue.wolf_disturbance_observed", true)
-> END

=== fq_x_retainer ===
{ flag("qiheChapter.talkCycle"):
- 0:
    护院：有事找我们徐执事，她就在门口。车道别堵着。 #id:QX-retainer
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    护院：执事吩咐过，不许为难村里人。小兄弟请绕一步。 #id:QX-retainer-2
    ~ set_flag("qiheChapter.talkCycle", 2)
- else:
    护院：当着差，不便闲谈，见谅。 #id:QX-retainer-3
    ~ set_flag("qiheChapter.talkCycle", 0)
}
-> END

=== fq_x_bailiff ===
{ flag("qiheChapter.talkCycle"):
- 0:
    差役：药车要从河埠过，门口这条路让一让。 #id:QX-bailiff
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    差役：这两天来的人比赶集还多，我一个人哪看得过来。 #id:QX-bailiff-2
    ~ set_flag("qiheChapter.talkCycle", 2)
- else:
    差役：签字的事别找我，我只管守路。 #id:QX-bailiff-3
    ~ set_flag("qiheChapter.talkCycle", 0)
}
-> END

=== fq_x_westroad ===
陆衡：往邻村走西边这条田埂，药车过得去。走之前，先把村里的事交代好。 #id:QX-westroad
-> END

=== fq_x_elder ===
村口老人：人都到齐了就好……你们也坐下歇歇。 #id:QX-elder
-> END

=== fq_x_yeroom ===
叶蘅：我先把药箱收好。明天想给周婶写封信，报个平安。 #id:QX-yeroom
-> END

=== fq_x_counter ===
萧白：（掌柜不在。柜台上留了字：在南村口外院收布巾。） #id:QX-counter
-> END
