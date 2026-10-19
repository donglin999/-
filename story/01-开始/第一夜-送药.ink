// 第一夜 · 送药与还篮（P-S3）
// 地点：村南老人家门口　在场：萧白、村口老人（门外土路上有差役、采办随从）
// 戏眼：萧白想把药送到、把周婶的竹篮带回去；老人难得有人来，想留他说说话，也担心药都被征走、自己往后吃什么。散场时药送到、竹篮带回；若他坐下陪老人，就听说有个征药的随从连药棚在哪儿都还在问路，就说叶家的药“早验过了”，差役不肯替他画押。旁听与否只记 prologue.heard.inspection。
// 2026-10-18 第 2 期：从 js/qihe-prologue-actions.js elder() 与 js/qihe-map-trial.js 的门外两句原样搬运，台词不改；
//   编号按 errands-script.md 的 P-S3 句号对齐，设计稿里没有的句子加字母后缀（规则见更新记录）。
// 2026-10-19 剧情三道关改造（戏眼卡 FN-elder）：老人不认得萧白，改为萧白先说来意、报名字（P-S3-06 挪到 P-S3-05a 前，加 P-S3-06a）；
//   篮子在老人家是因为他帮周婶绑提手（接 P-S3-13“提手修过”）；老人说起征药的事是因为担心自己的药，长句拆成两句（加 P-S3-09a）；
//   没接送药时老人不再提篮子（他不知道萧白是谁），药送到后再搭话改说 P-S3-idle-done。选项与旁听标记不变。
//   冷读审读后：老人听到传话改为随从在他门口问路时说的（腿脚不便，不去桥头）；删“翻名册”；点明“验过的药就要拉走”；随从不再自报“征药的公差”。
INCLUDE ../_共用/externals.ink

=== qihe_errand_elder ===
#cast:萧白
{ flag("prologue.errands.medicine") != "accepted":
    { flag("prologue.errands.medicine") == "delivered" or flag("prologue.errands.medicine") == "done":
        村口老人：回去替我谢谢周婶。 #id:P-S3-idle-done
    - else:
        村口老人：哪家的孩子？面生得很。天黑道儿不好走，当心些。 #id:P-S3-idle
    }
    -> END
}
萧白：老人家，周婶让我给您送药来。 #id:P-S3-06
村口老人：又劳烦她了……小哥面生得很，是哪家的？ #id:P-S3-05a
萧白：我叫萧白，今天刚到，借住在陈伯家。 #id:P-S3-06a
村口老人：篮子搁门后呢，提手我给绑了几道，牢实着。别忘了带。 #id:P-S3-07
村口老人：不急着走吧？坐会儿。腿脚不利索，难得有人来说说话。 #id:P-S3-08
* [“那我陪您坐会儿。”] -> chat
* [“不了，我拿了篮子就回。”] -> basket

= chat
村口老人：下午有个随从在我门口问路，问药棚在哪儿。转头又跟差役说，叶家的药早验过了。 #id:P-S3-09
村口老人：验过的药就要装车拉走……我这把老骨头，全指着药棚那点药哩。 #id:P-S3-09a
萧白：连药棚都没找着，就说验过了？ #id:P-S3-10
村口老人：谁说不是呢。差役不肯替他画押，两人在我门口磨了半天。 #id:P-S3-11
~ set_flag("prologue.heard.inspection", true)
-> basket

= basket
村口老人：篮子莫装太满，当心又松了。 #id:P-S3-13
萧白：知道了，我轻着点拿。您歇着。 #id:P-S3-14
~ set_flag("prologue.errands.medicine", "delivered")
~ uncarry("medicine")
~ carry("basket", 1)
~ checkpoint()
~ toast_for("带回竹篮 · 回药棚归还", 1800)
-> END

// 老人家门外土路上的两个人（随时可搭话的一句）
=== qihe_village_bailiff ===
#cast:萧白
差役：小兄弟，老人家腿脚不便，门口让一让。 #id:P-S3-bailiff
-> END

=== qihe_village_aide ===
#cast:萧白
采办随从：让开让开，赶着办事！ #id:P-S3-aide
-> END
