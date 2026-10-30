// 风起栖河 · 人物交互：新上图六人的收礼反应、货郎易物时看秤说的话（每次一句，放进面板气泡，不演出）
// 地点：栖河村里任一处（玩家在墨印菜单点“礼”“易”）　在场：萧白、对方
// 戏眼：同《人物-收礼与易物》（已批准，不动）；这里只补那份剧本里没有的人：船家、货郎、小耗子、阿栓、小禾、算命先生（用户第二十轮 19：“礼”能用，气泡是空的）。
// 2026-10-27 我写，等剧情评审。调用：js/qihe-gift.js lineFor 先查 qh_gift_line／qh_trade_line，那里没有这句再查这里。
// 2026-10-29 逻辑排查（评审台，你答过的题由 Claude 落实）：算命先生赔礼被拒，主语改“我心里还没过去”。
INCLUDE ../_共用/externals.ink

VAR pid = "" // 参数：人物 id
VAR kind = "" // 参数：反应
VAR why = "" // 参数：婉拒原因（这里不用，声明了免得报错）
VAR who = "" // 参数：说话人的名字（赠礼面板照旧会传，这里不用，声明了免得报错）

=== qh_gift_line_more ===
{
- pid == "boatman" && kind == "xi":
    船家：酒好。夜里撑船，喝一口身上就暖了。 #id:QG-boatman-xi
- pid == "boatman" && kind == "ke":
    船家：收下了。哪天要过河，招呼一声。 #id:QG-boatman-ke
- pid == "boatman" && kind == "meh":
    船家：行，搁船舱里吧。 #id:QG-boatman-meh
- pid == "boatman" && kind == "no":
    船家：这个你留着，船上用不上。 #id:QG-boatman-no
- pid == "boatman" && kind == "again":
    船家：上回那份还没动呢，别再拿了。 #id:QG-boatman-again
- pid == "boatman" && kind == "amend-ok":
    船家：东西收了。那事，我就当没瞧见。 #id:QG-boatman-amendok
- pid == "boatman" && kind == "amend-no":
    船家：东西拿回去。那事我瞧得清清楚楚。 #id:QG-boatman-amendno
- pid == "peddler" && kind == "xi":
    货郎：好东西！这个我转手就能卖出去，承你情了。 #id:QG-peddler-xi
- pid == "peddler" && kind == "ke":
    货郎：成，收下了，下回进货给你留着好的。 #id:QG-peddler-ke
- pid == "peddler" && kind == "meh":
    货郎：嗐，这玩意儿不好出手，我先替你揣着。 #id:QG-peddler-meh
- pid == "peddler" && kind == "no":
    货郎：这个我收了也卖不掉，你拿回去吧。 #id:QG-peddler-no
- pid == "peddler" && kind == "again":
    货郎：又来？你这是要跟我抢生意啊。 #id:QG-peddler-again
- pid == "peddler" && kind == "amend-ok":
    货郎：行行，东西我收了，先前那档子事翻篇。 #id:QG-peddler-amendok
- pid == "peddler" && kind == "amend-no":
    货郎：先别。那事没说清，东西我不能要。 #id:QG-peddler-amendno
- pid == "aqi" && kind == "xi":
    小耗子：吃的！够意思，今晚不用饿着了。 #id:QG-aqi-xi
- pid == "aqi" && kind == "ke":
    小耗子：给我的？那我收着了，回头还你个人情。 #id:QG-aqi-ke
- pid == "aqi" && kind == "meh":
    小耗子：这玩意儿……行吧，换俩铜板也成。 #id:QG-aqi-meh
- pid == "aqi" && kind == "no":
    小耗子：别，这我拿着烫手。 #id:QG-aqi-no
- pid == "aqi" && kind == "again":
    小耗子：上回的还没吃完呢，你自个儿留着。 #id:QG-aqi-again
- pid == "aqi" && kind == "amend-ok":
    小耗子：成，这事就算了，往后别再来这一手。 #id:QG-aqi-amendok
- pid == "aqi" && kind == "amend-no":
    小耗子：东西收回去，我还没消气。 #id:QG-aqi-amendno
- pid == "ashuan" && kind == "xi":
    阿栓：吃的！嘿嘿，我分小禾一半。 #id:QG-ashuan-xi
- pid == "ashuan" && kind == "ke":
    阿栓：给我的？那我收着当宝贝！ #id:QG-ashuan-ke
- pid == "ashuan" && kind == "meh":
    阿栓：这个……好吧，我拿去给我爹。 #id:QG-ashuan-meh
- pid == "ashuan" && kind == "no":
    阿栓：我爹不让我要大人的东西。 #id:QG-ashuan-no
- pid == "ashuan" && kind == "again":
    阿栓：你又给我？我爹知道了要骂的。 #id:QG-ashuan-again
- pid == "ashuan" && kind == "amend-ok":
    阿栓：那……那我就不跟你计较了！ #id:QG-ashuan-amendok
- pid == "ashuan" && kind == "amend-no":
    阿栓：哼，我还生气呢，不要！ #id:QG-ashuan-amendno
- pid == "xiaohe" && kind == "xi":
    小禾：真好看！我要戴给外婆瞧。 #id:QG-xiaohe-xi
- pid == "xiaohe" && kind == "ke":
    小禾：谢谢哥哥，我收起来。 #id:QG-xiaohe-ke
- pid == "xiaohe" && kind == "meh":
    小禾：嗯……那我收下吧。 #id:QG-xiaohe-meh
- pid == "xiaohe" && kind == "no":
    小禾：外婆说不能乱要别人的东西。 #id:QG-xiaohe-no
- pid == "xiaohe" && kind == "again":
    小禾：上回的我还藏着呢，不用再给啦。 #id:QG-xiaohe-again
- pid == "xiaohe" && kind == "amend-ok":
    小禾：那好吧，我不生你气了。 #id:QG-xiaohe-amendok
- pid == "xiaohe" && kind == "amend-no":
    小禾：我还没消气，你拿回去。 #id:QG-xiaohe-amendno
- pid == "fortune" && kind == "xi":
    算命先生：书？好，夜里收了摊，正好有个伴。 #id:QG-fortune-xi
- pid == "fortune" && kind == "ke":
    算命先生：小兄弟有心，老朽收下了。 #id:QG-fortune-ke
- pid == "fortune" && kind == "meh":
    算命先生：收下了。东西不打紧，心意老朽记着。 #id:QG-fortune-meh
- pid == "fortune" && kind == "no":
    算命先生：这个太重，老朽受不起。 #id:QG-fortune-no
- pid == "fortune" && kind == "again":
    算命先生：上回那份还在褡裢里，够了。 #id:QG-fortune-again
- pid == "fortune" && kind == "amend-ok":
    算命先生：罢了，这一页翻过去。 #id:QG-fortune-amendok
- pid == "fortune" && kind == "amend-no":
    算命先生：东西留着。那件事，我心里还没过去。 #id:QG-fortune-amendno
}
-> END

=== qh_trade_line_more ===
{
- pid == "peddler" && kind == "look":
    货郎：都摊开了，瞧上哪样？咱换着来。 #id:QT-peddler-look
- pid == "peddler" && kind == "ask":
    货郎：你想拿什么换？摆上来我掂掂。 #id:QT-peddler-ask
- pid == "peddler" && kind == "want":
    货郎：我的货上秤了，你那头也得放点东西呀。 #id:QT-peddler-want
- pid == "peddler" && kind == "far":
    货郎：差得远哩，这点东西换不走。 #id:QT-peddler-far
- pid == "peddler" && kind == "near":
    货郎：再添一点，就够数了。 #id:QT-peddler-near
- pid == "peddler" && kind == "ok":
    货郎：两头齐了，成交！ #id:QT-peddler-ok
- pid == "peddler" && kind == "over":
    货郎：你这头沉了，多出来的我可不找。 #id:QT-peddler-over
- pid == "peddler" && kind == "done":
    货郎：拿好，下回再来照顾生意。 #id:QT-peddler-done
}
-> END
