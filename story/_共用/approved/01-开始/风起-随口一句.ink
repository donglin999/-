// 风起栖河 · 随口一句：村里站着的人、邻村院子里的乡亲、做不了的事
// 地点：随所在处　在场：说话的人、萧白
// 戏眼：萧白找人搭话，对方手上有事，只回一句眼下最要紧的话；邻村院子里，大家各说各的伤和药箱。散场时什么都不变。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js interact()、activityBody()、evidenceBody() 的单句台词搬入。
// 2026-10-19 用户指出“三个女主的小弟台词一模一样”：帮众、乌魁、采办随从、管事、采办使改为按说话次数轮换 2～3 句（共用标记 qiheChapter.talkCycle），各方口吻拉开；药商不再与陆衡同句。
// 2026-10-19 三道关改写：单句搭话未走演员法，由编剧直接改；C1-X-zhou 按沈雁回到没到分两句（新增 C1-X-zhou-b），C1-R-ye-settled 不再第三次说写信。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink
VAR late = false // 参数：第二天下午起（halfDay>=4）
VAR chen_ok = false // 参数：陈伯只是擦伤、已照护（p.chenCare）
VAR evidence_done = false // 参数：对证已做完
VAR shen_open = false // 参数：第二天起（halfDay>=2）沈雁回已到东埠

=== fq_act_busy ===
萧白：（眼下还有正事，回头再说。） #id:C1-X-busy
-> END

=== fq_act_done ===
萧白：（这件事已经办过了。） #id:C1-X-done
-> END

=== fq_inn ===
店家：客官，要买点路上用的家当？还是……来帮把手？ #id:C1-X-inn-01
+ [“我看看有什么。”]
    ~ fq_answer("shop")
+ [“我来帮忙。”]
    ~ fq_answer("help")
+ [“随便看看。”]
- -> END

=== fq_zhou_after_inquiry ===
{ shen_open:
    周砚：出村的路我替你们看着。想问查药的事，沈姑娘在东埠。 #id:C1-X-zhou
- else:
    周砚：出村的路我替你们看着。她父亲的事，有了信我先告诉她。 #id:C1-X-zhou-b
}
-> END

=== fq_bandit ===
{ flag("qiheChapter.talkCycle"):
- 0:
    { late:
        帮众：看什么看？有事找我们岑姑娘去，她在东埠装卸路。 #id:C1-X-bandit-late
    - else:
        帮众：看什么看？有事找我们岑姑娘去，她就在南村车道旁。 #id:C1-X-bandit
    }
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    帮众：别在这儿晃。岑姑娘交代过，不许跟村里人起冲突——你别逼我。 #id:C1-X-bandit-2
    ~ set_flag("qiheChapter.talkCycle", 2)
- else:
    帮众：这破村子，连口像样的酒都没有。……你也是来打听那只匣子的？ #id:C1-X-bandit-3
    ~ set_flag("qiheChapter.talkCycle", 0)
}
-> END

=== fq_aide ===
{ flag("qiheChapter.talkCycle"):
- 0:
    采办随从：我就是个点篓子的。药单的事，你问沈姑娘去。 #id:C1-X-aide
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    采办随从：三篓、两篓……别跟我说话，一打岔又数乱了。 #id:C1-X-aide-2
    ~ set_flag("qiheChapter.talkCycle", 2)
- else:
    采办随从：上头只说来收药，谁知道一来就撞上这么多事。 #id:C1-X-aide-3
    ~ set_flag("qiheChapter.talkCycle", 0)
}
-> END

=== fq_late_lu ===
陆衡：天不早了，有话明早再说吧。 #id:C1-X-late-lu
-> END

=== fq_late_merchant ===
药商：天快黑了，我得收摊。有事明儿再来。 #id:C1-X-late-merchant
-> END

=== fq_steward ===
{ flag("qiheChapter.talkCycle"):
- 0:
    管事：盟里的事，不便跟外人说。 #id:C1-X-steward
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    管事：执事在里头。有事，候着。 #id:C1-X-steward-2
    ~ set_flag("qiheChapter.talkCycle", 2)
}
-> END

=== fq_wukui ===
{ flag("qiheChapter.talkCycle"):
- 0:
    乌魁：瞅什么？没见过人？ #id:C1-X-wukui
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    乌魁：滚远点！老子这会儿没空跟你磨牙。 #id:C1-X-wukui-2
    ~ set_flag("qiheChapter.talkCycle", 2)
- else:
    乌魁：哼，上回那笔账还没算完……你又替谁跑腿？ #id:C1-X-wukui-3
    ~ set_flag("qiheChapter.talkCycle", 0)
}
-> END

=== fq_procurement ===
{ flag("qiheChapter.talkCycle"):
- 0:
    采办使：征药是公事，闲人别凑过来。 #id:C1-X-procurement
    ~ set_flag("qiheChapter.talkCycle", 1)
- 1:
    采办使：账还没对完，回头再说。 #id:C1-X-procurement-2
    ~ set_flag("qiheChapter.talkCycle", 2)
}
-> END

=== fq_evidence_wait ===
萧白：（先把伤者安顿好，那几张纸的事，到了邻村再说。） #id:C1-X-evidence-wait
-> END

=== fq_refuge_ye ===
叶蘅：病人都交给邻村大夫了。……我这才算松了口气。 #id:C1-R-ye-01
+ [“陈伯的伤怎么样了？”]
    { chen_ok:
        叶蘅：擦伤包好了，周婶在旁边盯着呢。就怕他闲不住，又要去搬东西。 #id:C1-R-ye-chen-a
    - else:
        叶蘅：腿伤得重新包，邻村大夫接手了。缺的布我记着。 #id:C1-R-ye-chen-b
    }
+ [“药箱还好吧？”]
    { evidence_done:
        叶蘅：药签、笔记都拿回来了。她们要找的东西本来就不在我这儿……可昨夜的事，不能就这么算了。 #id:C1-R-ye-box-a
    - else:
        叶蘅：都在我手里。她们三家各说我答应了一件事——我倒要看看，那纸上是怎么写的。 #id:C1-R-ye-box-b
    }
+ [“你先歇会儿。”]
- -> END

=== fq_refuge_chen ===
陈伯：别光看我，我好着呢。……那张卖罐子的底单还在我布包里，用得着就说。 #id:C1-R-chen
-> END

=== fq_refuge_luheng ===
陆衡：车先留给伤者用。你们要走，上山那段我送。 #id:C1-R-luheng
-> END

=== fq_refuge_aunt ===
周婶：大夫接手了，缺什么我会说。你们先坐下歇歇。 #id:C1-R-aunt
-> END

=== fq_refuge_other ===
叶蘅：邻村的大夫接手了。你先歇会儿，别又逞强。 #id:C1-R-other
-> END

=== fq_ye_settled ===
叶蘅：总算能住下来了。……药圃我明天一早就去看。 #id:C1-R-ye-settled
-> END

=== fq_tonight ===
萧白：（今晚先歇着吧，明早再说。） #id:C1-X-tonight
-> END
