// 2026-11-13 新写（用户试玩：药棚里对叶蘅点“谈”没东西）。原来叶蘅、陆衡、药商在村中日常里点“谈”，
//   直接弹“行程：药棚帮忙。现在开始／再想想”，没人说话；活动办过或过了时候，只有萧白一句心里话。
//   现在对方先开口说一句眼下的事，活动还能做的再弹行程（chapter.gd activity_body 的 talker）。
// 风起栖河 · 村中日常：找叶蘅、陆衡、药商搭话时对方先说的一句
// 地点：药棚（叶蘅，或她此刻所在处）、西田埂（陆衡）、南村口药摊（药商）　在场：说话的人、萧白
// 戏眼：萧白走过来搭话，对方手上有活，先说自己眼下在忙什么；能搭手的事由后面的行程选项接。散场时什么都不变。
// 口吻（bible/人物）：叶蘅先问具体伤处和去路、直爽心软；陆衡话短实在；药商嗓门高、急着撇清。
// 不新编设定：萧白手上的口子见 C1-A-practice-05v3；药包与送药见 fq_act_clinic；护身的棍见 fq_act_practice。
// 剧情由主会话代评（10-29 授权）。
INCLUDE _共用/externals.ink
INCLUDE _共用/externals-风起主线.ink
VAR state = "open" // 参数：open 活动还能做／done 办过了／late 过了时候／away 人不在做这件事的地方（只有叶蘅用）

=== fq_talk_ye ===
{ state:
- "open":
    叶蘅：你来得正好。药包还没分完，还有几家的药要送。 #id:C1-T-ye-open
- "done":
    叶蘅：药都理清了。你手上的口子，记得别沾水。 #id:C1-T-ye-done
- "late":
    叶蘅：这边不用帮了。你手上的口子要是还疼，就来找我。 #id:C1-T-ye-late
- else:
    叶蘅：我这边还走不开。你有事先去忙，不用等我。 #id:C1-T-ye-away
}
-> END

=== fq_talk_luheng ===
{ state:
- "open":
    陆衡：练场空着。想学两手护身的，现在就能教。 #id:C1-T-lu-open
- "done":
    陆衡：棍别搁生了。早晚各比划几遍。 #id:C1-T-lu-done
- else:
    陆衡：眼下得先顾车。教棍的事，往后再说。 #id:C1-T-lu-late
}
-> END

=== fq_talk_merchant ===
{ state:
- "open":
    药商：买药？今儿没好货！可别说我藏着不卖！ #id:C1-T-merchant-open
- "done":
    药商：摊子收拾利索了，多亏你搭手。 #id:C1-T-merchant-done
- else:
    药商：不用帮了，我这就收摊！出了事可别找我！ #id:C1-T-merchant-late
}
-> END
