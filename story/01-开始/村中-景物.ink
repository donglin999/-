// 风起栖河 · 村中景物（地图可交互物稿 C1 古井、C5 粮仓、C6 告示招工、W1 晒谷场、W3/S2 木桶）：萧白看见什么就说什么（心里话），不用旁白
// 地点：中央村落、西田埂、南村口　在场：萧白
// 戏眼：多走几步，村子是活的：井有年头、粮有人看、谷要趁太阳翻。散场时萧白顺手得一点小东西（碎钱、麻绳、炒米），或歇口气。
// 2026-10-27 主会话：戏眼卡 qihe-town-interactables-brief.json（T-barrel、T-notice、T-grain、T-granary、T-well），MiniMax-M3 演员法起草，主会话剪辑。
// 调用：js/qihe-town.js。打水回多少、丢钱扣多少、奖励给什么都在 JS。
// 2026-10-29 逻辑排查（评审台，你答过的题由 Claude 落实）：木桶给 5 两，台词改“一小块碎银”。
// 2026-10-30 删 qh_granary：用户说粮仓没剧情就清掉（评审台第二十四轮第 3 题）。
// 2026-11-02 删 qh_notice_work、qh_grain_turn、qh_grain_idle：用户说晒谷竹席“这玩意直接去掉”。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

VAR kind = "" // 参数：木桶里翻到什么，"silver"／"rope"
VAR drank = false // 参数：这个时段已经打过水

=== qh_barrel ===
萧白：（桶底压着个什么东西。） #id:QX-br-01
{
- kind == "silver":
    萧白：（一小块碎银，不知谁掉进去的。） #id:QX-br-silver
- kind == "rope":
    萧白：（一捆旧麻绳，还结实。） #id:QX-br-rope
}
-> END

=== qh_barrel_empty ===
萧白：（桶里空了。） #id:QX-br-empty
-> END

=== qh_well ===
萧白：（村心的老井，井沿磨得发亮。） #id:QX-w-01
+ [看看井沿的刻痕]
    萧白：（井壁上刻着几道水痕，最底下那道旁边刻着“大旱”。） #id:QX-w-look
+ {not drank} [打口水喝]
    萧白：（井水凉得扎牙，喝下去人清醒了些。） #id:QX-w-drink
    ~ fq_answer("drink")
+ [丢颗石子下去]
    ~ fq_answer("coin")
+ [走开]
- -> END

=== qh_well_coin ===
萧白：（石子落下去好一会儿才听见响，这井比看着深。） #id:QX-w-coin
-> END

