// 第一夜 · 灯下的字条与过夜（P-05）
// 地点：陈伯家空客房 → 叶家门厅 → 陈伯家空客房　在场：萧白、叶蘅、周婶、陈伯
// 戏眼：叶蘅想弄清是谁说她家要卖东西——门缝里的字条把“卖几只破药罐”传成了“卖旧物”，却没有落款，谁也说不准；萧白把今晚在村里听来的话（按实际旁听）说给她。散场时叶蘅收起字条，决定明早自己去问药商，请萧白陪她。
//   睡前心里话按递水时的回答三选一；第一夜到此结束，交接给次日的村中走访。
//   2026-10-20 用户同意：结尾字幕不写固定环节名，改为记入江湖经历（P-05-14）。
// 2026-10-18 第 2 期：从 js/qihe-map-trial.js rest() 原样搬运，台词不改；编号按 night-script.md 的 P-05 句号对齐，
//   设计稿里没有的句子加后缀（规则见更新记录）。已经在风起栖河里的过夜（rested 且章节已加载）仍由 JS 直接转去 QiheChapter.begin()。
//   （2026-10-23 起删去：旁听追问的三种“查证后”说法 Q1-letter／Q2-account／Q3-ledger，原读风起栖河外来者任务的进度。）
// 2026-10-19 剧情三道关改造（戏眼卡 FN-night、FN-guest）：萧白在客房选了睡觉，为什么又到叶家——改为陈伯隔门喊他帮着把扎箱子的绳送去（P-05-call）；
//   周婶不再替在场的陈伯报到；萧白不再替叶蘅拿主意（P-05-04 改问“会不会是药商塞的”，加陈伯 P-05-04a），叶蘅问他“听见什么没有”才有来由；
//   未办完的小事改成萧白心里想得到的说法（碗还没送、竹篮还没还……）；Q302 周婶就在场，改为叶蘅当面叮嘱她；
//   手机电量接进村时“还剩一半”，改为“省着点用”；收尾由陈伯招呼萧白一起回去。三种“查证后”说法属风起栖河状态，未改。选项、标记、交接不变。
//   冷读审读后：陈伯不论萧白旁听与否都主动说周砚要来（P-05-04b/04c），萧白只补“功法”；“那个药商”改“买罐子那个药商”；周婶补“没留意门缝”“没听谁说过”“我守着”；睡前加想家一句（P-05-12a）。
// 2026-10-23 剧本二（opening-errands-rework.md 0.1、0.4 第 4 处，戏眼卡 zhoushen-errand-round-brief.json ZR-night-all）：
//   三方跑腿第一夜接不到了，删去 Q1-letter、Q2-account、Q3-ledger 三支（连同错位的“旧谱登记”与陈伯称徐令仪为“他”），只留旁听版本；
//   三处旁听都说给叶蘅的，追问完多一个小分支：叶蘅自己说出三拨人都冲她家来（P-05-all-01/02）。只听到一两处的照旧。
//   冷读后：没旁听的玩家不知道“行舟／温家”，陈伯对阿蘅改说“你爹”（P-05-03、P-05-04b）；追问第二次起改问“还有呢？”（P-05-05b）；“那人”点明是征药的随从（P-05-Q301）；
//   萧白心里话不再复述叶蘅的话，改想到门缝里的字条（P-05-all-02）；没办完周婶的事的，周婶在叶家说一句明儿再说（P-05-10a）。
INCLUDE ../_共用/externals.ink

VAR resuming = false // 参数：读档时正处在过夜途中（rest(true)），跳过“回屋睡觉”的确认
VAR asked_skill = false
VAR asked_box = false
VAR asked_inspection = false

=== qihe_first_night ===
#cast:萧白
{ flag("prologue.rested"):
    【第一夜 · 完。进度已保存。】 #id:P-05-done
    -> END
}
{ not flag("prologue.relicSeen"):
    萧白：（还睡不着……叶蘅说有事去找她，去她家看一眼吧。） #id:P-05-wait
    -> END
}
{ resuming:
    -> first_night_hall
}
{ has_pending():
    萧白：（{pending_names()}……现在睡下，只能明早再跟周婶说了。） #id:P-05-ask-pending
- else:
    萧白：（天黑透了……睡吧？） #id:P-05-ask
}
* [“躺下睡觉。”]
    ~ set_flag("prologue.ending", true)
    ~ checkpoint()
    -> first_night_hall
* [“再出去转转。”]
    -> END

// 周婶托的小事里，已接但还没交还的（顺序：还碗、取布、送药与还篮），按萧白心里想得到的说法列出
=== function is_pending(state) ===
~ return state == "accepted" or state == "collected" or state == "delivered"

=== function has_pending() ===
~ return is_pending(flag("prologue.errands.bowls")) or is_pending(flag("prologue.errands.cloth")) or is_pending(flag("prologue.errands.medicine"))

=== function pending_names() ===
~ temp names = ""
{ is_pending(flag("prologue.errands.bowls")):
    ~ names = join_name(names, "碗还没送")
}
{ flag("prologue.errands.cloth") == "accepted":
    ~ names = join_name(names, "布还没取")
}
{ flag("prologue.errands.cloth") == "collected":
    ~ names = join_name(names, "布还没交给周婶")
}
{ flag("prologue.errands.medicine") == "accepted":
    ~ names = join_name(names, "药还没送")
}
{ flag("prologue.errands.medicine") == "delivered":
    ~ names = join_name(names, "竹篮还没还")
}
~ return names

=== function join_name(names, name) ===
{ names == "":
    ~ return name
}
~ return names + "，" + name

// 陈伯喊萧白送绳；叶家：周婶送热水；门缝里的字条；按实际旁听追问
=== first_night_hall ===
陈伯：还没睡吧？跟我走一趟，帮我把这捆绳扛到阿蘅那儿，她捆药筛要用。 #id:P-05-call
~ go_scene("prologue_ye_house", "entry")
周婶：阿蘅，热水给你搁门边了，趁热用。 #id:P-05-00
叶蘅：哎？门缝里夹着张纸……「闻家中有旧物可售，明日愿来一看。」 #id:P-05-01
周婶：我刚才进门，都没留意。 #id:P-05-01a
叶蘅：旧物？我就托陈伯卖了几只破药罐。剩下就那只药箱，谁说要卖了？ #id:P-05-02
陈伯：我在你这儿修屋那天，买罐子的药商来过，盯着罐底的款，问是不是你爹留下的。 #id:P-05-03
萧白：会不会就是那个买罐子的药商塞的？ #id:P-05-04
陈伯：没落款，说不准。这两天村里生人多。 #id:P-05-04a
陈伯：还有，今晚我那儿来了个外乡客，说是你爹早年的朋友，明儿来看你。 #id:P-05-04b
叶蘅：……他明儿真会来？ #id:P-05-04c
-> ask

= ask
{ (flag("prologue.heard.skill") and not asked_skill) or (flag("prologue.heard.box") and not asked_box) or (flag("prologue.heard.inspection") and not asked_inspection):
    -> menu
}
{ asked_skill and asked_box and asked_inspection:
    -> all_three
}
-> wrap_up

= menu
{ asked_skill or asked_box or asked_inspection:
    叶蘅：还有呢？ #id:P-05-05b
- else:
    叶蘅：你今晚在外头，碰见什么人、听见什么话没有？ #id:P-05-05
}
+ {flag("prologue.heard.skill") and not asked_skill} [“对了，有人在打听你父亲的功法。”]
    ~ asked_skill = true
    -> q_skill
+ {flag("prologue.heard.box") and not asked_box} [“客栈里有人说，你家要卖一只玉匣。”]
    ~ asked_box = true
    -> q_box
+ {flag("prologue.heard.inspection") and not asked_inspection} [“听说有人讲你家的药验过了。”]
    ~ asked_inspection = true
    -> q_inspection
+ [“没什么了。”]
    -> wrap_up

= q_skill
叶蘅：功法？谁说的？ #id:P-05-Q102
萧白：就是陈伯家那位客人。他说路上听人讲，你家还留着一部功法。 #id:P-05-Q103
叶蘅：……父亲就留了几页笔记，哪来的功法。 #id:P-05-Q103a
陈伯：这话我本不想提。明儿他来了先问清楚，别由着人翻箱子。 #id:P-05-Q104
-> ask

= q_box
叶蘅：玉匣？我见都没见过。 #id:P-05-Q200
萧白：那人还说你家缺钱，肯卖。 #id:P-05-Q201
叶蘅：我家缺不缺钱，轮得到他们说？ #id:P-05-Q202
萧白：他说满村都传遍了，可也没说是谁讲的。 #id:P-05-Q203
周婶：我天天在村里走动，可没听谁说过。 #id:P-05-Q203a
-> ask

= q_inspection
叶蘅：验过了？谁验的？ #id:P-05-Q300
萧白：说这话的是个征药的随从，下午连药棚在哪儿都还在问路。 #id:P-05-Q301
叶蘅：根本没人来验过！……周婶，明早药棚给病人的药，先别让人搬。 #id:P-05-Q302
周婶：放心，我守着。 #id:P-05-Q302a
-> ask

// 三处听来的都说了：叶蘅自己把三件事并到一处
= all_three
叶蘅：打听我父亲功法的、要买匣子的、说药验过的……三拨人，全冲我家来。 #id:P-05-all-01
萧白：（再加上门缝里这张纸……） #id:P-05-all-02
-> wrap_up

= wrap_up
叶蘅：这张纸我收着。 #id:P-05-06
叶蘅：明早我去找那个药商。你要是缓过来了，跟我走一趟？多个人听着，他不敢瞎扯。 #id:P-05-07
萧白：好，我陪你去。 #id:P-05-08
周婶：灯别点太久，费油。明早还有粥。 #id:P-05-10
{ has_pending():
    周婶：托你的那几样，没办完的明儿再说，不急。 #id:P-05-10a
}
萧白：知道了，您也早些歇。 #id:P-05-11
陈伯：走，跟我回去睡吧。 #id:P-05-11a
-> first_night_guest

// 陈伯家空客房：关手机，按递水时的回答想一句，熄灯
=== first_night_guest ===
~ go_scene("prologue_chen_guest", "entry")
萧白：（手机还是没信号……关了吧，剩下这点电省着点用。） #id:P-05-12
萧白：（家里这会儿，该急疯了吧。） #id:P-05-12a
{ flag("prologue.arrival.originExpression"):
- "B":
    萧白：（说不清的事就先放着……睡吧，明早还得陪她去找药商。） #id:P-05-B01
- "C":
    萧白：（临安、建康……还真是南宋啊。……先睡吧，明早还得陪她去找药商。） #id:P-05-C01
- else:
    萧白：（明明还在城里……怎么一睁眼就到了这儿？想不通。先睡，明天还得陪她去找药商。） #id:P-05-A01
}
~ night_falls()
{ flag("prologue.errands.bowls") != "done":
    ~ set_flag("prologue.errands.bowls", "closed")
}
{ flag("prologue.errands.cloth") != "done":
    ~ set_flag("prologue.errands.cloth", "closed")
}
{ flag("prologue.errands.medicine") != "done":
    ~ set_flag("prologue.errands.medicine", "closed")
}
~ set_flag("prologue.rested", true)
~ set_flag("prologue.ending", false)
~ hand_off_first_night()
~ checkpoint()
【江湖经历记下一笔：栖河第一夜。进度已保存。】 #id:P-05-14
-> END
