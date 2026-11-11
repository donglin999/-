// 2026-11-11 审读修订：招呼的价钱跟后面一致（QF-T00 原说“两个铜板”，后面报价和实际扣的都是二两）。
// 2026-11-11 从原版 xiaojianghu-legacy-prologue/story/01-开始/人物-算命先生.ink 搬到 Godot 版（原版不再更新）；此后以本文件为准，由 tools/build_story.cjs 编译。
// 风起栖河 · 北路算命摊：算命先生（蔺晦之乔装）平日的开口与测字
// 地点：中央村落北路西侧、叶家东墙外（地图可交互物稿 C3）　在场：萧白、算命先生
// 戏眼：萧白想求个吉利；先生算不准命、看得准人，看出他身上的事却从不说破。散场时萧白多一种吉兆，心里多一分提防。
// 2026-10-27 主会话写（qihe-map-interactables.md 5.5、qihe-mojiao-observer-sideline.md 第六节）；头一回见面是《支线-蔺管事-测字》（qh_lamp_meet），本文件只管之后。
// 调用：js/qihe-lamp-watcher.js fortuneTalk()。qh_fortune_talk 用 fq_answer 交回选了什么；测字每个时段一次、两个铜板（界面写 2 两；2026-10-28 用户第二十三轮第 4 题同意口语保留铜板），由 JS 判。
// 2026-10-29 逻辑排查（评审台，你答过的题由 Claude 落实）：测字收费跟界面的“两”走，扣钱不变。
INCLUDE _共用/externals.ink
INCLUDE _共用/externals-三方.ink
INCLUDE _共用/externals-风起主线.ink

VAR can_report1 = false // 参数：船家问过、还没回话
VAR can_report2 = false // 参数：第三天上午，可以交代灯四
VAR first = false // 参数：头一回来摊上（错过了第一天的测字托付）

=== qh_fortune_talk ===
{ first:
    算命先生：小兄弟，测个字？二两。 #id:QF-T00
- else:
    算命先生：又来了？今天想问什么。 #id:QF-T01
}
+ {can_report1} [“船家那边，我问到了。”]
    ~ fq_answer("report1")
+ {can_report2} [“托我看的事，我有数了。”]
    ~ fq_answer("report2")
+ [“测个字。”]
    ~ fq_answer("read")
+ [“没事，路过。”]
- -> END

=== qh_fortune_reading ===
算命先生：测一字，二两。三个字，挑一个。 #id:QF-R01
+ [“行。”] -> xing
+ [“安。”] -> an
+ [“归。”] -> gui

= xing
算命先生：行，走路的行。你鞋帮磨得发白，走过的路比这村里谁都远。 #id:QF-R-xing1
算命先生：接着往前走吧。这两天跟人过招，不吃亏。 #id:QF-R-xing2
~ fortune_omen("行")
-> END

= an
算命先生：安，屋底下一个女子。……你眼睛总往叶家那边瞟。 #id:QF-R-an1
萧白：……我是替她担心。 #id:QF-R-an2
算命先生：担心就好。心里挂着人的，磕了碰了也好得快。 #id:QF-R-an3
~ fortune_omen("安")
-> END

= gui
算命先生：归，回去的归。你这双手没干过粗活，倒在这儿搬药扛箱。 #id:QF-R-gui1
算命先生：哪儿是归处，你自个儿心里也没底吧。 #id:QF-R-gui2
萧白：（他看出什么了？……不，他什么也不知道。） #id:QF-R-gui3
算命先生：没底不要紧。这两天跟人好好处，人家记你的好。 #id:QF-R-gui4
~ fortune_omen("归")
-> END

=== qh_fortune_busy ===
算命先生：刚测过一个。一阵儿里问两回，字就不灵了，晚些再来。 #id:QF-B01
-> END

=== qh_fortune_poor ===
算命先生：二两都摸不出来？那这字先欠着，等你手头宽了再说。 #id:QF-P01
-> END
