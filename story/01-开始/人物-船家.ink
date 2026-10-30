// 风起栖河 · 东埠小码头：船家的开口与渡口闲话
// 地点：东埠小码头（地图可交互物稿 E1）　在场：萧白、船家
// 戏眼：船家每天看着谁上船、谁下船，嘴不严也不碎；萧白想打听事，他只说自己亲眼见的。散场时萧白知道码头上来往的人不寻常。
// 2026-10-27 主会话写（qihe-map-interactables.md 第 6 节；F-0045 周砚第一晚借宿船家）。问黑衣脚夫一场是《支线-蔺管事-问船家》（qh_lamp_boatman），跟脚夫是《支线-蔺管事-跟脚夫》。
// 调用：js/qihe-lamp-watcher.js boatmanTalk()，qh_boatman_talk 用 fq_answer 交回选了什么。
// 2026-10-29 逻辑排查（评审台，用户授权 Claude 代评剧情）：QB-I02 方向说法改“上游下来的船多，下船的人”。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

VAR can_ask = false // 参数：接过算命先生的托付、还没问船家
VAR can_tail = false // 参数：第三天上午、能跟黑衣脚夫

=== qh_boatman_talk ===
船家：过河还是问事？今儿水平，船也稳。 #id:QB-T01
+ {can_ask} [“跟您打听个人，穿黑衣的脚夫。”]
    ~ fq_answer("ask")
+ {can_tail} [“那个黑衣脚夫往哪去了？”]
    ~ fq_answer("tail")
+ [“随便聊聊。”] -> qh_boatman_idle
+ [“不过河，路过。”]
- -> END

=== qh_boatman_idle ===
船家：这几天有个背剑的客人在我这儿借过宿。话少，给钱爽快。 #id:QB-I01
船家：这几天上游下来的船多，下船的人都不像来买药的。 #id:QB-I02
-> END
