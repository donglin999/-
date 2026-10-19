// 风起栖河 · 村中活动：学《护路棍法》（C1-A-practice）
// 地点：西田埂练场　在场：陆衡、萧白；叶蘅（路过）
// 戏眼：萧白在后山只会拿木头往前挡，想学点能护人的本事；陆衡肯教，但要他先学会收。散场时萧白学会第一式，带着练习棍。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody('practice') 搬入；对练失败后的再来一次见 fq_lesson_retry。“已学”提示是游戏界面，留在 JS。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：删去 C1-A-practice-06 的动作讲解（与 07 重复“打出去再收”），07 缩成一句。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_act_practice ===
萧白：山上那回，我拿着木头，除了往前挡，什么都不会。 #id:C1-A-practice-01
陆衡：能挡住一次是运气。下次还想护着人，就得知道什么时候伸，什么时候收。 #id:C1-A-practice-02
萧白：你能教我吗？ #id:C1-A-practice-03
陆衡：护路用的棍法，不是什么秘传。肯用心练，我从头教。 #id:C1-A-practice-04
叶蘅：我去分药。练完来吃饭——手磨起泡了别瞒着我。 #id:C1-A-practice-05
陆衡：来，跟我慢慢过一轮。棍打出去，别忘了收。 #id:C1-A-practice-07
* [“来吧！”]
    ~ fq_lesson_battle()
* [“我先把招式记熟。”]
- ~ fq_grant_lesson()
~ set_flag("qiheChapter.choices.practice", "learned")
陆衡：这根棍你带着，早晚各比划几遍。 #id:C1-A-practice-08
-> END

=== fq_lesson_retry ===
陆衡：慢下来，再看一遍起手。 #id:C1-A-practice-retry
* [“再来一次。”]
    ~ fq_answer("again")
* [“今天先到这儿。”]
    ~ fq_answer("stop")
- -> END
