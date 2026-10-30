// 风起栖河 · 偷窃失手：被偷的人当场发觉时的一句话（npc-steal.md 第 8.2 节；js/qihe-steal-data.js OUTCOME_RULES 的 say 效果，knot 名 <人物 id>_steal_caught）
// 戏眼：手刚伸过去就被发觉，各按各的性子反应；散场时对方起了戒心、关系变差（扣多少在 JS）。
// 2026-10-27 主会话：戏眼卡 ../xiaojianghu/docs/design/scripts/briefs/qihe-steal-caught-brief.json，MiniMax-M3 演员法每句三备选，主会话挑选剪辑（R-剧情-06 不同的人不说同一句；不认识萧白的人不叫他名字）。
// 2026-10-30 补阿炭、小禾两句（用户第十九轮第 8 题：“后续所有新加角色都得加对应的内容”，写进 npc-steal.md 第 8.2 节，tests/qihe-steal-caught-lines.test.cjs 检查）。阿炭按认没认识（qiheHidden.bandit.decided 为 return 时报过名）分两版。
INCLUDE ../_共用/externals.ink

=== ye_steal_caught ===
叶蘅：萧白？你的手……这是做什么？ #id:QS-ye
-> END

=== aunt_steal_caught ===
周婶：哎哟！我当你是个老实孩子，手往婶子兜里伸？ #id:QS-aunt
-> END

=== chen_steal_caught ===
陈伯：住手！我留你住下，你就干这个？ #id:QS-chen
-> END

=== elder_steal_caught ===
村口老人：哎……年轻人，我身上能有什么值钱的。 #id:QS-elder
-> END

=== innkeeper_steal_caught ===
店家：客、客官，您这手往哪儿伸啊？ #id:QS-innkeeper
-> END

=== ashuan_steal_caught ===
阿栓：我的糖！你、你……偷小孩糖，羞不羞！ #id:QS-ashuan
-> END

=== apothecary_steal_caught ===
药商：谁！手拿开！我这摊子本来就够倒霉的了！ #id:QS-apothecary
-> END

=== aide_steal_caught ===
采办随从：好大的胆子！公事在身的人你也敢摸？ #id:QS-aide
-> END

=== bailiff_steal_caught ===
差役：当着官差的面下手？找打！ #id:QS-bailiff
-> END

=== retainer_steal_caught ===
护院：放手。再动，休怪我不客气。 #id:QS-retainer
-> END

=== bandit_steal_caught ===
帮众：好小子，摸到老子身上来了！ #id:QS-bandit
-> END

=== xulingyi_steal_caught ===
徐令仪：……请自重。这一下，我记住了。 #id:QS-xulingyi
-> END

=== censhuang_steal_caught ===
岑霜：这只手伸得有些快啊。……想要什么，不如开口。 #id:QS-censhuang
-> END

=== shenyanhui_steal_caught ===
沈雁回：手拿开。我是查人的，不是让人查的。 #id:QS-shenyanhui
-> END

=== luheng_steal_caught ===
陆衡：……你缺什么跟我说，别干这个。 #id:QS-luheng
-> END

=== zhouyan_steal_caught ===
周砚：年纪轻轻，手倒快。收回去。 #id:QS-zhouyan
-> END

=== song_steal_caught ===
宋先生：小哥这手……咱们的账，就到这儿吧。 #id:QS-song
-> END

=== fortune_steal_caught ===
算命先生：手伸得倒快。替你测一个字——窃。 #id:QS-fortune
-> END

=== boatman_steal_caught ===
船家：嘿！手往哪儿伸？ #id:QS-boatman
-> END

=== peddler_steal_caught ===
货郎：好家伙，偷到货郎头上来了！ #id:QS-peddler
-> END

=== aqi_steal_caught ===
小耗子：嘿，摸到我身上来了？手还嫩着呢！ #id:QS-aqi
-> END

=== atan_steal_caught ===
{ flag("qiheHidden.bandit.decided") == "return":
    阿炭：……你也来这一手？我身上就剩这点了。 #id:QS-atan-named
- else:
    新来的：手拿开！堂里的人你也敢摸？ #id:QS-atan
}
-> END

=== xiaohe_steal_caught ===
小禾：那是我捡的扁石子！……我去告诉外婆。 #id:QS-xiaohe
-> END
