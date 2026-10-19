// 风起栖河 · 村中活动：整理旧屋（C1-A-relic）
// 地点：叶家　在场：叶蘅、萧白
// 戏眼：叶蘅要把父母的旧东西收拾好随身带，却不放心交给外人碰。散场时萧白只帮着抄或包，箱子仍在她手里。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody('relic_help') 搬入。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：去掉“不是防你——”的纠正句，改说这几天谁都盯着箱子。
// 2026-10-19 冷读审读后再改：两个选项各有一句萧白自己的反应（抄竖排字眼花／包母亲的旧物），收尾改成捆绳。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_act_relic ===
叶蘅：父亲的笔记，这一页你可以看。帮我抄一份，还是帮我把母亲的东西包好？ #id:C1-A-relic-01
* [“我来抄。”]
    ~ set_flag("qiheChapter.choices.relic_help", "copy")
    萧白：（竖着写的字，还没标点……抄得我眼都花了。） #id:C1-A-relic-A1
* [“我帮你包。”]
    ~ set_flag("qiheChapter.choices.relic_help", "pack")
    萧白：（一包旧帕子、一把木梳……都是她娘留下的。我手轻点。） #id:C1-A-relic-B1
- 叶蘅：箱子我自己带，这几天谁都盯着它。 #id:C1-A-relic-02
萧白：嗯。绳头给我，我帮你捆紧。 #id:C1-A-relic-03
-> END
