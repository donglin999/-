// 风起栖河 · 主线找人（C1-M）：找到叶蘅或陆衡，由对方先开口，选【主线】才往下走
// 地点：村中药棚／东埠／西田埂　在场：叶蘅或陆衡、萧白
// 戏眼：对方手上正有一件急事要萧白一起去；萧白可以先应下，也可以先帮点小忙。散场时（选主线）进入下一阶段确认。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js MAIN_STEPS 的 greet/label 与 interact() 搬入；“即将进入下一阶段”确认框是游戏界面，留在 JS。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：C1-M-5-01 不再说“邻村回话了”（收拾药箱时陆衡才来报信，原来说了两遍）；C1-M-6-01 改成天擦黑从装卸侧口走（原写“天黑前出村”，接着却是第三夜在侧口）；C1-M-pre-01 改成叶蘅替周婶问竹匾（周婶已当面托过）。
// 2026-10-19 冷读审读后再改：不走主线的两个选项改成接得上对方的话（先把手上的活做完／你先去）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink
VAR basket = false // 参数：下一步是去后山取竹匾（宋先生第一段）
VAR is_ye = false // 参数：找的是叶蘅（否则是陆衡）
VAR title = ""
VAR where = ""
VAR who = ""

=== fq_main_pre ===
{ is_ye:
    { basket:
        叶蘅：周婶托你的竹匾，拿回来没有？她又问了。 #id:C1-M-pre-01
    - else:
        叶蘅：药我分好了。你要是有事，先去忙。 #id:C1-M-pre-02
    }
- else:
    陆衡：车还没装完，有事你先去。 #id:C1-M-pre-03
}
+ {basket} [【主线】“我这就去后山取竹匾。”]
    ~ fq_answer("main")
    ~ fq_track("stranger")
    萧白：（竹匾在后山采药路的倒木旁。） #id:C1-M-pre-04
+ {not basket} [【主线】（先去后山倒木旁一趟）]
    ~ fq_answer("main")
    ~ fq_track("stranger")
    萧白：（宋先生说过，还在倒木旁等我。） #id:C1-M-pre-05
+ {is_ye} [“药棚有什么要帮忙的？”]
    ~ fq_answer("normal")
+ {not is_ye} [“陆大哥，教我两手。”]
    ~ fq_answer("normal")
+ [“没事，你忙。”]
    ~ fq_answer("none")
- -> END

=== fq_main_2 ===
叶蘅：你来得正好。药棚门口来了几个生人，说是正道盟的，指名要见我。 #id:C1-M-2-01
+ [【主线】“我陪你过去看看。”]
    ~ fq_answer("main")
+ [“药棚还有活，我先帮你干完。”]
    ~ fq_answer("normal")
+ [“你先去，我随后就到。”]
    ~ fq_answer("none")
- -> END

=== fq_main_4 ===
叶蘅：这包药得送到东埠的病人家里。听周婶说，那边又来了两拨人…… #id:C1-M-4-01
+ [【主线】“我跟你一起送。”]
    ~ fq_answer("main")
+ [“药棚还有活，我先帮你干完。”]
    ~ fq_answer("normal")
+ [“你先去，我随后就到。”]
    ~ fq_answer("none")
- -> END

=== fq_main_5 ===
叶蘅：萧白，陪我回家一趟。走之前，我得把药箱收拾出来。 #id:C1-M-5-01
+ [【主线】“我帮你收拾。”]
    ~ fq_answer("main")
+ [“药棚还有活，我先帮你干完。”]
    ~ fq_answer("normal")
+ [“你先去，我随后就到。”]
    ~ fq_answer("none")
- -> END

=== fq_main_6 ===
陆衡：最后一车药装好就走。天一擦黑，从装卸侧口出村，你跟着车。 #id:C1-M-6-01
+ [【主线】“走吧，我跟车。”]
    ~ fq_answer("main")
+ [“走前再教我两手？”]
    ~ fq_answer("normal")
+ [“你先装车，我随后就到。”]
    ~ fq_answer("none")
- -> END

=== fq_rest_hint ===
萧白：（天还亮着，躺不住。{title}——得去{where}找{who}。） #id:C1-M-rest
-> END
