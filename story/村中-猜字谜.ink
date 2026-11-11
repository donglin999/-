// 2026-11-11 审读修订（余项）：听了提示才答对的题不算赢（side_town.gd 只数全对），收尾“没猜全”改成说清“要三题都自己猜中才算赢”，免得每题都听到“对的”却被说没猜全。
// 2026-11-11 从原版 xiaojianghu-legacy-prologue/story/01-开始/村中-猜字谜.ink 搬到 Godot 版（原版不再更新）；此后以本文件为准，由 tools/build_story.cjs 编译。
// 风起栖河 · 古井东侧草地：阿栓、小禾出字谜（地图可交互物稿 5.3、C2）
// 地点：中央村落古井东侧草地　在场：萧白、阿栓、小禾
// 戏眼：孩子想难住这个大哥哥；萧白陪他们玩。每题：孩子出谜面，四个候选字，可以“再想想”听一句提示（这题只算半对），答错孩子当场揭底。
// 2026-10-27 主会话写：谜底是公版字谜，谜面改成孩子口吻；阿栓爱出带刀、马、王的江湖味字谜，小禾爱出花草、天气的。三档各六题（第一天易、第二天中、第三天难），JS（js/qihe-town.js RIDDLES）按天取、不重复。
// 每题用 fq_answer 交回 "right"（全对）／"half"（用了提示）／"wrong"。
// 2026-10-29 逻辑排查（评审台，用户授权 Claude 代评剧情）：在村里一题没猜过的，撤离后不出“最后一题”，改说一句闲话（qh_kids_refuge_idle，QK-l-idle）。
INCLUDE _共用/externals.ink
INCLUDE _共用/externals-风起主线.ink

VAR result = "" // 参数：这一局输赢，"win"／"lose"
VAR all = false // 参数：三档都赢过、头一回
VAR many = false // 参数：邻村时，之前赢过两档以上

=== qh_kids_open ===
阿栓：站住！考你三道江湖字谜，猜不出，不许走！ #id:QK-o-01
小禾：一局三题……猜错了也不要紧。 #id:QK-o-02
-> END

=== qh_kids_end ===
{
- result == "win":
    阿栓：这回算你厉害，在下认栽！下回再比个高低！ #id:QK-e-win
- result == "lose":
    小禾：要三题都自己猜中才算赢……不要紧，下回再来。 #id:QK-e-lose1v2
    阿栓：嘿嘿，大哥哥的江湖功夫，还得再练练！ #id:QK-e-lose2
}
{ all:
    小禾：这块扁石子给你……河边捡的。 #id:QK-e-all
}
-> END

=== qh_kids_played ===
阿栓：这会儿比过了！回头再来，我准备新的。 #id:QK-played
-> END

=== qh_kids_last ===
阿栓：……村里烧了，大人不让回去。大哥哥，再出最后一题，就一题。 #id:QK-l-01
{ many:
    阿栓：等回了村，还找你猜。 #id:QK-l-many
- else:
    小禾：回了村……我再教你猜。 #id:QK-l-few
}
-> END

=== qh_kids_refuge_idle ===
小禾：村里烧了，大人不让回去……我们就在这儿玩。 #id:QK-l-idle
-> END

=== qh_kids_last_done ===
阿栓：最后一题出完了，不许再问了。 #id:QK-l-done
-> END

=== qh_riddle_gao ===
阿栓：一口咬掉牛尾巴——打一个字！ #id:QK-gao-q
* [“牛”] -> no
* [“舌”] -> no
* [“告”] -> ok
* [“吉”] -> no
* [再想想] -> hint

= hint
小禾：牛的尾巴没了，底下多一张嘴。 #id:QK-gao-h
* [“牛”] -> no
* [“舌”] -> no
* [“告”] -> okh
* [“吉”] -> no

= ok
小禾：对的。 #id:QK-gao-r
~ fq_answer("right")
-> END
= okh
小禾：对的。 #id:QK-gao-rh
~ fq_answer("half")
-> END
= no
阿栓：牛字去了尾巴，底下一个口——告！ #id:QK-gao-x
~ fq_answer("wrong")
-> END

=== qh_riddle_zhong ===
小禾：千里相逢。打一个字。 #id:QK-zhong-q
* [“童”] -> no
* [“重”] -> ok
* [“量”] -> no
* [“里”] -> no
* [再想想] -> hint

= hint
阿栓：挑担子最怕它，压肩膀！ #id:QK-zhong-h
* [“童”] -> no
* [“重”] -> okh
* [“量”] -> no
* [“里”] -> no

= ok
阿栓：哼，蒙对的吧？ #id:QK-zhong-r
~ fq_answer("right")
-> END
= okh
阿栓：哼，蒙对的吧？ #id:QK-zhong-rh
~ fq_answer("half")
-> END
= no
小禾：千字压着里字，是重。 #id:QK-zhong-x
~ fq_answer("wrong")
-> END

=== qh_riddle_ka ===
阿栓：上下一体——江湖上没几个人猜得出！ #id:QK-ka-q
* [“下”] -> no
* [“止”] -> no
* [“卡”] -> ok
* [“正”] -> no
* [再想想] -> hint

= hint
小禾：夹住了，上不去也下不来。 #id:QK-ka-h
* [“下”] -> no
* [“止”] -> no
* [“卡”] -> okh
* [“正”] -> no

= ok
阿栓：行啊，有两下子！ #id:QK-ka-r
~ fq_answer("right")
-> END
= okh
阿栓：行啊，有两下子！ #id:QK-ka-rh
~ fq_answer("half")
-> END
= no
阿栓：上头一个上，底下一个下——卡！ #id:QK-ka-x
~ fq_answer("wrong")
-> END

=== qh_riddle_na ===
阿栓：一人一张口，口下长只手。 #id:QK-na-q
* [“拾”] -> no
* [“合”] -> no
* [“哈”] -> no
* [“拿”] -> ok
* [再想想] -> hint

= hint
小禾：就是伸手去取。 #id:QK-na-h
* [“拾”] -> no
* [“合”] -> no
* [“哈”] -> no
* [“拿”] -> okh

= ok
小禾：猜对了。 #id:QK-na-r
~ fq_answer("right")
-> END
= okh
小禾：猜对了。 #id:QK-na-rh
~ fq_answer("half")
-> END
= no
阿栓：人一口手，拿！这都不会？ #id:QK-na-x
~ fq_answer("wrong")
-> END

=== qh_riddle_si ===
小禾：十张口，一颗心。 #id:QK-si-q
* [“古”] -> no
* [“思”] -> ok
* [“田”] -> no
* [“忠”] -> no
* [再想想] -> hint

= hint
阿栓：上头一块地，底下揣着一颗心！ #id:QK-si-h
* [“古”] -> no
* [“思”] -> okh
* [“田”] -> no
* [“忠”] -> no

= ok
阿栓：嘁，这题太简单了。 #id:QK-si-r
~ fq_answer("right")
-> END
= okh
阿栓：嘁，这题太简单了。 #id:QK-si-rh
~ fq_answer("half")
-> END
= no
小禾：田字底下一个心，是思。 #id:QK-si-x
~ fq_answer("wrong")
-> END

=== qh_riddle_cha ===
小禾：人在草木中。 #id:QK-cha-q
* [“菜”] -> no
* [“花”] -> no
* [“莲”] -> no
* [“茶”] -> ok
* [再想想] -> hint

= hint
阿栓：我爹天天给客人倒的！ #id:QK-cha-h
* [“菜”] -> no
* [“花”] -> no
* [“莲”] -> no
* [“茶”] -> okh

= ok
小禾：嗯，对的。 #id:QK-cha-r
~ fq_answer("right")
-> END
= okh
小禾：嗯，对的。 #id:QK-cha-rh
~ fq_answer("half")
-> END
= no
小禾：草、人、木，是茶。 #id:QK-cha-x
~ fq_answer("wrong")
-> END

=== qh_riddle_pang ===
阿栓：半个月亮——打一字，快说！ #id:QK-pang-q
* [“胆”] -> no
* [“胖”] -> ok
* [“肝”] -> no
* [“朋”] -> no
* [再想想] -> hint

= hint
小禾：说人长得圆滚滚。 #id:QK-pang-h
* [“胆”] -> no
* [“胖”] -> okh
* [“肝”] -> no
* [“朋”] -> no

= ok
小禾：对了。 #id:QK-pang-r
~ fq_answer("right")
-> END
= okh
小禾：对了。 #id:QK-pang-rh
~ fq_answer("half")
-> END
= no
阿栓：月加半，胖！跟我爹似的。 #id:QK-pang-x
~ fq_answer("wrong")
-> END

=== qh_riddle_nai ===
小禾：一大二小。 #id:QK-nai-q
* [“示”] -> no
* [“奈”] -> ok
* [“尖”] -> no
* [“奔”] -> no
* [再想想] -> hint

= hint
阿栓：无可～何的那个字！ #id:QK-nai-h
* [“示”] -> no
* [“奈”] -> okh
* [“尖”] -> no
* [“奔”] -> no

= ok
阿栓：这题我也会。 #id:QK-nai-r
~ fq_answer("right")
-> END
= okh
阿栓：这题我也会。 #id:QK-nai-rh
~ fq_answer("half")
-> END
= no
小禾：大、二、小，是奈。 #id:QK-nai-x
~ fq_answer("wrong")
-> END

=== qh_riddle_lv ===
阿栓：两张口摞一块儿——打一字！ #id:QK-lv-q
* [“吕”] -> ok
* [“品”] -> no
* [“日”] -> no
* [“回”] -> no
* [再想想] -> hint

= hint
小禾：一张在上头，一张在底下。 #id:QK-lv-h
* [“吕”] -> okh
* [“品”] -> no
* [“日”] -> no
* [“回”] -> no

= ok
阿栓：好家伙，猜着了。 #id:QK-lv-r
~ fq_answer("right")
-> END
= okh
阿栓：好家伙，猜着了。 #id:QK-lv-rh
~ fq_answer("half")
-> END
= no
阿栓：口上摞个口——吕！ #id:QK-lv-x
~ fq_answer("wrong")
-> END

=== qh_riddle_ming ===
小禾：日月一块儿亮。 #id:QK-ming-q
* [“晶”] -> no
* [“昌”] -> no
* [“明”] -> ok
* [“朋”] -> no
* [再想想] -> hint

= hint
阿栓：太阳月亮挨着站！ #id:QK-ming-h
* [“晶”] -> no
* [“昌”] -> no
* [“明”] -> okh
* [“朋”] -> no

= ok
小禾：对。 #id:QK-ming-r
~ fq_answer("right")
-> END
= okh
小禾：对。 #id:QK-ming-rh
~ fq_answer("half")
-> END
= no
小禾：日和月，是明。 #id:QK-ming-x
~ fq_answer("wrong")
-> END

=== qh_riddle_hao ===
小禾：一个女孩，一个小子，凑一块儿。 #id:QK-hao-q
* [“字”] -> no
* [“好”] -> ok
* [“孙”] -> no
* [“妈”] -> no
* [再想想] -> hint

= hint
阿栓：坏的反面！ #id:QK-hao-h
* [“字”] -> no
* [“好”] -> okh
* [“孙”] -> no
* [“妈”] -> no

= ok
阿栓：这都让你猜着了。 #id:QK-hao-r
~ fq_answer("right")
-> END
= okh
阿栓：这都让你猜着了。 #id:QK-hao-rh
~ fq_answer("half")
-> END
= no
小禾：女加子，是好。 #id:QK-hao-x
~ fq_answer("wrong")
-> END

=== qh_riddle_zao ===
小禾：太阳落在十字坡上。 #id:QK-zao-q
* [“旱”] -> no
* [“卓”] -> no
* [“草”] -> no
* [“早”] -> ok
* [再想想] -> hint

= hint
阿栓：太阳刚冒头的时候。 #id:QK-zao-h
* [“旱”] -> no
* [“卓”] -> no
* [“草”] -> no
* [“早”] -> okh

= ok
小禾：嗯，答对了。 #id:QK-zao-r
~ fq_answer("right")
-> END
= okh
小禾：嗯，答对了。 #id:QK-zao-rh
~ fq_answer("half")
-> END
= no
小禾：日下一个十，是早。 #id:QK-zao-x
~ fq_answer("wrong")
-> END

=== qh_riddle_she ===
阿栓：千张口，就一个字！ #id:QK-she-q
* [“吕”] -> no
* [“舌”] -> ok
* [“古”] -> no
* [“唐”] -> no
* [再想想] -> hint

= hint
小禾：在嘴里头，说话全靠它。 #id:QK-she-h
* [“吕”] -> no
* [“舌”] -> okh
* [“古”] -> no
* [“唐”] -> no

= ok
阿栓：服了服了。 #id:QK-she-r
~ fq_answer("right")
-> END
= okh
阿栓：服了服了。 #id:QK-she-rh
~ fq_answer("half")
-> END
= no
阿栓：千加口——舌！说话全靠它。 #id:QK-she-x
~ fq_answer("wrong")
-> END

=== qh_riddle_tun ===
阿栓：天底下一张口，什么都吃！ #id:QK-tun-q
* [“吾”] -> no
* [“吴”] -> no
* [“吞”] -> ok
* [“杏”] -> no
* [再想想] -> hint

= hint
小禾：一口咽下去。 #id:QK-tun-h
* [“吾”] -> no
* [“吴”] -> no
* [“吞”] -> okh
* [“杏”] -> no

= ok
小禾：猜得真快。 #id:QK-tun-r
~ fq_answer("right")
-> END
= okh
小禾：猜得真快。 #id:QK-tun-rh
~ fq_answer("half")
-> END
= no
阿栓：天口——吞！ #id:QK-tun-x
~ fq_answer("wrong")
-> END

=== qh_riddle_fen ===
阿栓：八把刀，一刀两断！ #id:QK-fen-q
* [“分”] -> ok
* [“公”] -> no
* [“召”] -> no
* [“切”] -> no
* [再想想] -> hint

= hint
小禾：切开了，一人一半。 #id:QK-fen-h
* [“分”] -> okh
* [“公”] -> no
* [“召”] -> no
* [“切”] -> no

= ok
阿栓：嘿，算你厉害。 #id:QK-fen-r
~ fq_answer("right")
-> END
= okh
阿栓：嘿，算你厉害。 #id:QK-fen-rh
~ fq_answer("half")
-> END
= no
阿栓：八刀——分！这可是刀客的字。 #id:QK-fen-x
~ fq_answer("wrong")
-> END

=== qh_riddle_yan ===
小禾：两个火，叠起来。 #id:QK-yan-q
* [“炎”] -> ok
* [“灭”] -> no
* [“焱”] -> no
* [“灶”] -> no
* [再想想] -> hint

= hint
阿栓：热得冒火的那种热！ #id:QK-yan-h
* [“炎”] -> okh
* [“灭”] -> no
* [“焱”] -> no
* [“灶”] -> no

= ok
小禾：对了。 #id:QK-yan-r
~ fq_answer("right")
-> END
= okh
小禾：对了。 #id:QK-yan-rh
~ fq_answer("half")
-> END
= no
小禾：两个火叠着，是炎。 #id:QK-yan-x
~ fq_answer("wrong")
-> END

=== qh_riddle_qing ===
小禾：太阳出来，天是青的。 #id:QK-qing-q
* [“情”] -> no
* [“睛”] -> no
* [“清”] -> no
* [“晴”] -> ok
* [再想想] -> hint

= hint
阿栓：下雨的反面！ #id:QK-qing-h
* [“情”] -> no
* [“睛”] -> no
* [“清”] -> no
* [“晴”] -> okh

= ok
小禾：嗯。 #id:QK-qing-r
~ fq_answer("right")
-> END
= okh
小禾：嗯。 #id:QK-qing-rh
~ fq_answer("half")
-> END
= no
小禾：日加青，是晴。 #id:QK-qing-x
~ fq_answer("wrong")
-> END

=== qh_riddle_chuang ===
阿栓：一匹马冲进了门——打一字！ #id:QK-chuang-q
* [“闯”] -> ok
* [“驰”] -> no
* [“闷”] -> no
* [“问”] -> no
* [再想想] -> hint

= hint
小禾：不敲门就往里冲。 #id:QK-chuang-h
* [“闯”] -> okh
* [“驰”] -> no
* [“闷”] -> no
* [“问”] -> no

= ok
阿栓：行，你能闯江湖了。 #id:QK-chuang-r
~ fq_answer("right")
-> END
= okh
阿栓：行，你能闯江湖了。 #id:QK-chuang-rh
~ fq_answer("half")
-> END
= no
阿栓：门里有马——闯！闯江湖的闯！ #id:QK-chuang-x
~ fq_answer("wrong")
-> END

=== qh_riddle_last ===
小禾：大口套着小口。 #id:QK-last-q
* [“吕”] -> no
* [“回”] -> ok
* [“品”] -> no
* [“日”] -> no

= ok
小禾：……是回。回家的回。 #id:QK-last-r
-> END
= no
小禾：是回。大口里头套个小口……回家的回。 #id:QK-last-x
-> END
