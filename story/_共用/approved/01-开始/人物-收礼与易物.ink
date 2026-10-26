// 风起栖河 · 人物交互：赠礼／赔礼的收礼反应、易物时对方看秤说的话（每次一句，放进面板气泡，不演出）
// 地点：栖河村里任一处（玩家在墨印菜单点“礼”“易”）　在场：萧白、对方
// 戏眼：萧白想跟这个人处好关系、或换到要的东西；对方收不收、高不高兴看东西合不合心意，易物看秤上两边轻重。散场时：关系涨了或没涨、东西换了或没换。
// 2026-10-26 开发二：照 ../xiaojianghu/docs/design/npc-gifts-and-inventory.md 第 3.3、3.6.1 节与第 6.2 节逐人喜好；戏眼卡 ../xiaojianghu/docs/design/scripts/briefs/qihe-gift-trade-lines-brief.json，
//   MiniMax 演员法每句三备选（MiniMax-M3），主会话挑选剪辑：去掉点名具体物件的说法（送的东西不固定）、易物气泡里的心里话改成说出口的话；“ask”两句是主会话补写。2026-10-27 用户授权 Claude 代审，已冷读、批准（--approve）。
// 2026-10-27 冷读后改：连送、赔礼收／不收三句由通用句改为逐人（R-剧情-06）；去掉“药棚”“修完车”等绑死时间地点的说法；差役两句撞句、帮众口吻、岑霜称呼、老人“不喜欢”看不出、两处“无功不受禄”撞句。多类喜好的人的“喜”句不点名东西；只喜欢一类的人点名那一类（对得上）。
// 调用：js/qihe-gift.js QiheGift.lineFor('qh_gift_line', {pid, kind})；kind＝xi 喜｜ke 可收｜meh 不喜欢（收下不加分）｜no 婉拒｜again 连送同一样｜amend-ok／amend-no 赔礼收／不收。
INCLUDE ../_共用/externals.ink

VAR pid = "" // 参数：人物 id（js/qihe-npc-data.js PEOPLE 的键）
VAR kind = "" // 参数：反应
VAR who = "" // 参数：说话人的名字（2026-10-27 起通用三句改为逐人，已不用；保留声明免得旧调用报错）

=== qh_gift_line ===
{
- pid == "ye" && kind == "xi":
    叶蘅：哎呀，正是药材！正缺这个，我先收下了。 #id:QG-ye-xi
- pid == "ye" && kind == "ke":
    叶蘅：这个我用得上，便收下了，多谢。 #id:QG-ye-ke
- pid == "ye" && kind == "meh":
    叶蘅：行，那我收下，回头总有用处。 #id:QG-ye-meh
- pid == "ye" && kind == "no":
    叶蘅：你收回去吧，这份礼我不收。 #id:QG-ye-no
- pid == "aunt" && kind == "xi":
    周婶：这物件正合我意，正好拿来做活使。 #id:QG-aunt-xi
- pid == "aunt" && kind == "ke":
    周婶：那我就收下了，家里使得着。 #id:QG-aunt-ke
- pid == "aunt" && kind == "meh":
    周婶：既是你的心意，我便收下，先搁着。 #id:QG-aunt-meh
- pid == "aunt" && kind == "no":
    周婶：你自个儿留着使吧，这份礼我可不收。 #id:QG-aunt-no
- pid == "chen" && kind == "xi":
    陈伯：好酒！正合我意，晚上我开它两盅。 #id:QG-chen-xi
- pid == "chen" && kind == "ke":
    陈伯：东西我收下了，往后有什么家什坏了，尽管来找我。 #id:QG-chen-ke
- pid == "chen" && kind == "meh":
    陈伯：行吧，我收下，搁屋里就是。 #id:QG-chen-meh
- pid == "chen" && kind == "no":
    陈伯：你拿回去罢，我一个老头子，戴这个做什么。 #id:QG-chen-no
- pid == "elder" && kind == "xi":
    村口老人：哎呀，是吃食！这正合我心意，我留着慢慢吃。 #id:QG-elder-xi
- pid == "elder" && kind == "ke":
    村口老人：正是眼下用得着的，我就收下了，年轻人有心了。 #id:QG-elder-ke
- pid == "elder" && kind == "meh":
    村口老人：啊，收下了……老头子怕是用不上，先搁着罢。 #id:QG-elder-meh
- pid == "elder" && kind == "no":
    村口老人：这份礼我不能收，你拿回去吧，心意我领了。 #id:QG-elder-no
- pid == "innkeeper" && kind == "xi":
    店家：这柴草正合我用，暖灶烧水都省得多些。 #id:QG-innkeeper-xi
- pid == "innkeeper" && kind == "ke":
    店家：客官有心了，既用得着，我便收下，多谢。 #id:QG-innkeeper-ke
- pid == "innkeeper" && kind == "meh":
    店家：客官既然送来，我便收下，权作个心意。 #id:QG-innkeeper-meh
- pid == "innkeeper" && kind == "no":
    店家：客官，这兵甲小店向来不收，您还是带回去吧。 #id:QG-innkeeper-no
- pid == "apothecary" && kind == "xi":
    药商：哎哟，正是药材！这东西我正缺，收下了！ #id:QG-apothecary-xi
- pid == "apothecary" && kind == "ke":
    药商：那我就收下了，正巧用得着。 #id:QG-apothecary-ke
- pid == "apothecary" && kind == "meh":
    药商：东西我收下了，搁摊上吧。 #id:QG-apothecary-meh
- pid == "apothecary" && kind == "no":
    药商：摊上不收吃食，你拿回去吧！ #id:QG-apothecary-no
- pid == "aide" && kind == "xi":
    采办随从：酒！正合我意，拿来请弟兄们喝一杯。 #id:QG-aide-xi
- pid == "aide" && kind == "ke":
    采办随从：那我便收下了，多谢。 #id:QG-aide-ke
- pid == "aide" && kind == "meh":
    采办随从：既是你的好意，我就收下了。 #id:QG-aide-meh
- pid == "aide" && kind == "no":
    采办随从：这东西我不收，你拿回去吧。 #id:QG-aide-no
- pid == "bailiff" && kind == "xi":
    差役：这酒好，夜里巡路正拿它提神。 #id:QG-bailiff-xi
- pid == "bailiff" && kind == "ke":
    差役：那我就收下了，多谢你。 #id:QG-bailiff-ke
- pid == "bailiff" && kind == "meh":
    差役：行吧，搁这儿，我先收着。 #id:QG-bailiff-meh
- pid == "bailiff" && kind == "no":
    差役：这个我不能收，我给公家守路，不能收旁人的东西。 #id:QG-bailiff-no
- pid == "retainer" && kind == "xi":
    护院：正用得上，我收下了，多谢。 #id:QG-retainer-xi
- pid == "retainer" && kind == "ke":
    护院：这东西正用得上，我便收下了，多谢。 #id:QG-retainer-ke
- pid == "retainer" && kind == "meh":
    护院：东西我收下了，你有心了。 #id:QG-retainer-meh
- pid == "retainer" && kind == "no":
    护院：这个不能收，当差之人不收旁人赠物。 #id:QG-retainer-no
- pid == "bandit" && kind == "xi":
    帮众：好！这酒够劲，今夜就开封！ #id:QG-bandit-xi
- pid == "bandit" && kind == "ke":
    帮众：成，俺收下了，算你懂事。 #id:QG-bandit-ke
- pid == "bandit" && kind == "meh":
    帮众：成，这情俺领了，搁这儿就成。 #id:QG-bandit-meh
- pid == "bandit" && kind == "no":
    帮众：药材我不要，少拿草糊弄我！ #id:QG-bandit-no
- pid == "xulingyi" && kind == "xi":
    徐令仪：难得你肯费心，正合我意，这份礼我收下了。 #id:QG-xulingyi-xi
- pid == "xulingyi" && kind == "ke":
    徐令仪：既是合用的，我便收下了，多谢。 #id:QG-xulingyi-ke
- pid == "xulingyi" && kind == "meh":
    徐令仪：既如此，我便收下，先放着了。 #id:QG-xulingyi-meh
- pid == "xulingyi" && kind == "no":
    徐令仪：办差不饮，这个你拿回去吧。 #id:QG-xulingyi-no
- pid == "censhuang" && kind == "xi":
    岑霜：这东西……倒合我意，我便收下了。 #id:QG-censhuang-xi
- pid == "censhuang" && kind == "ke":
    岑霜：既是你送的，我便收下了——有心。 #id:QG-censhuang-ke
- pid == "censhuang" && kind == "meh":
    岑霜：哦？既是你一番心意，我便笑纳了。 #id:QG-censhuang-meh
- pid == "censhuang" && kind == "no":
    岑霜：客气了，只是这份礼不合规矩，你拿回去吧。 #id:QG-censhuang-no
- pid == "shenyanhui" && kind == "xi":
    沈雁回：好药材，正缺这个，我收下了。 #id:QG-shenyanhui-xi
- pid == "shenyanhui" && kind == "ke":
    沈雁回：东西我收下了，正用得上，多谢。 #id:QG-shenyanhui-ke
- pid == "shenyanhui" && kind == "meh":
    沈雁回：行，那我就收下了，用不用得上再说。 #id:QG-shenyanhui-meh
- pid == "shenyanhui" && kind == "no":
    沈雁回：不收，饰物戴着碍事。 #id:QG-shenyanhui-no
- pid == "luheng" && kind == "xi":
    陆衡：这正是我爱吃的，路上带着垫肚子，我收下了。 #id:QG-luheng-xi
- pid == "luheng" && kind == "ke":
    陆衡：既是正用得上，我便收下，多谢。 #id:QG-luheng-ke
- pid == "luheng" && kind == "meh":
    陆衡：多谢，我收下了，眼下倒用不上。 #id:QG-luheng-meh
- pid == "luheng" && kind == "no":
    陆衡：东西你收回，收了就得多揽一趟。 #id:QG-luheng-no
- pid == "zhouyan" && kind == "xi":
    周砚：这东西正合我用，我便收下了。 #id:QG-zhouyan-xi
- pid == "zhouyan" && kind == "ke":
    周砚：有心了，这份我收下，倒还合用。 #id:QG-zhouyan-ke
- pid == "zhouyan" && kind == "meh":
    周砚：收下了，多谢。 #id:QG-zhouyan-meh
- pid == "zhouyan" && kind == "no":
    周砚：晚辈不必破费，这份心意我领了，东西你留着。 #id:QG-zhouyan-no
- pid == "song" && kind == "xi":
    宋先生：小兄弟好眼力，正合我意，收下了。 #id:QG-song-xi
- pid == "song" && kind == "ke":
    宋先生：小哥有心了，这东西我正好用得上，便收下了。 #id:QG-song-ke
- pid == "song" && kind == "meh":
    宋先生：好，收下了，多谢你想着我。 #id:QG-song-meh
- pid == "song" && kind == "no":
    宋先生：小哥这份心意我领了，只是无功不受禄，这份礼我不能收。 #id:QG-song-no
- pid == "ye" && kind == "again":
    叶蘅：又送？上回那份还没用上呢，别再破费了。 #id:QG-ye-again
- pid == "ye" && kind == "amend-ok":
    叶蘅：……东西我收下。那件事，往后再说。 #id:QG-ye-amendok
- pid == "ye" && kind == "amend-no":
    叶蘅：这会儿别送东西，我还没消气。 #id:QG-ye-amendno
- pid == "aunt" && kind == "again":
    周婶：哎哟，又拿东西来，婶子这儿都快堆不下了。 #id:QG-aunt-again
- pid == "aunt" && kind == "amend-ok":
    周婶：行，婶子收下了。那事咱先揭过去一半。 #id:QG-aunt-amendok
- pid == "aunt" && kind == "amend-no":
    周婶：先别忙着送，那事婶子还记着呢。 #id:QG-aunt-amendno
- pid == "chen" && kind == "again":
    陈伯：又来？上回那份还没动呢，留着自己使。 #id:QG-chen-again
- pid == "chen" && kind == "amend-ok":
    陈伯：嗯，搁下吧。那事我记着，往后慢慢看你。 #id:QG-chen-amendok
- pid == "chen" && kind == "amend-no":
    陈伯：拿回去。老头子不吃这一套。 #id:QG-chen-amendno
- pid == "elder" && kind == "again":
    村口老人：又给我带东西？上回的还搁着呢，可别再花钱了。 #id:QG-elder-again
- pid == "elder" && kind == "amend-ok":
    村口老人：好，好，收下了。那事就算了罢。 #id:QG-elder-amendok
- pid == "elder" && kind == "amend-no":
    村口老人：孩子，东西拿回去，那事我心里还堵着。 #id:QG-elder-amendno
- pid == "innkeeper" && kind == "again":
    店家：客官又来破费，上回那份小店还没用完呢。 #id:QG-innkeeper-again
- pid == "innkeeper" && kind == "amend-ok":
    店家：客官这么讲究，那桩事小店就不提了。 #id:QG-innkeeper-amendok
- pid == "innkeeper" && kind == "amend-no":
    店家：客官，那桩事还没了结，东西您先收着。 #id:QG-innkeeper-amendno
- pid == "apothecary" && kind == "again":
    药商：又送？上回那份还在摊上搁着呢！ #id:QG-apothecary-again
- pid == "apothecary" && kind == "amend-ok":
    药商：行吧行吧，收下了，那事算翻过去一半。 #id:QG-apothecary-amendok
- pid == "apothecary" && kind == "amend-no":
    药商：那事还没完呢，东西拿走！ #id:QG-apothecary-amendno
- pid == "aide" && kind == "again":
    采办随从：又送？上回那份弟兄们还没分完呢。 #id:QG-aide-again
- pid == "aide" && kind == "amend-ok":
    采办随从：成，收下了。那事就先不计较。 #id:QG-aide-amendok
- pid == "aide" && kind == "amend-no":
    采办随从：少来这套，那事我还记着。 #id:QG-aide-amendno
- pid == "bailiff" && kind == "again":
    差役：上回的还没用完，别再送了，叫人看见不好。 #id:QG-bailiff-again
- pid == "bailiff" && kind == "amend-ok":
    差役：收下了。那事我就当没见着。 #id:QG-bailiff-amendok
- pid == "bailiff" && kind == "amend-no":
    差役：拿回去。那事还没过去，收你东西说不清。 #id:QG-bailiff-amendno
- pid == "retainer" && kind == "again":
    护院：上回那份还在，不必再送。 #id:QG-retainer-again
- pid == "retainer" && kind == "amend-ok":
    护院：东西收下。那事，我不再追究。 #id:QG-retainer-amendok
- pid == "retainer" && kind == "amend-no":
    护院：那件事没完，东西请拿回。 #id:QG-retainer-amendno
- pid == "bandit" && kind == "again":
    帮众：又来？上回那份俺还没动呢！ #id:QG-bandit-again
- pid == "bandit" && kind == "amend-ok":
    帮众：嘿，这还像句话。那事俺先不跟你计较。 #id:QG-bandit-amendok
- pid == "bandit" && kind == "amend-no":
    帮众：少来！那笔账俺还没跟你算呢！ #id:QG-bandit-amendno
- pid == "xulingyi" && kind == "again":
    徐令仪：上回那份我还收着，不必再送了。 #id:QG-xulingyi-again
- pid == "xulingyi" && kind == "amend-ok":
    徐令仪：东西我收下。先前的事，查清了再论。 #id:QG-xulingyi-amendok
- pid == "xulingyi" && kind == "amend-no":
    徐令仪：先前的事还没说清，这份礼我不能收。 #id:QG-xulingyi-amendno
- pid == "censhuang" && kind == "again":
    岑霜：又送？上回那件我还没腻呢。 #id:QG-censhuang-again
- pid == "censhuang" && kind == "amend-ok":
    岑霜：哟，赔礼来了？行，收下。那笔账，我先挂着。 #id:QG-censhuang-amendok
- pid == "censhuang" && kind == "amend-no":
    岑霜：拿回去。那事还没完，一件东西就想抹平？ #id:QG-censhuang-amendno
- pid == "shenyanhui" && kind == "again":
    沈雁回：上回的还没用完，别送了。 #id:QG-shenyanhui-again
- pid == "shenyanhui" && kind == "amend-ok":
    沈雁回：收下了。那事我记着，但不揪着。 #id:QG-shenyanhui-amendok
- pid == "shenyanhui" && kind == "amend-no":
    沈雁回：不收。先把那事说清楚。 #id:QG-shenyanhui-amendno
- pid == "luheng" && kind == "again":
    陆衡：上回那份还没用完，别再破费了。 #id:QG-luheng-again
- pid == "luheng" && kind == "amend-ok":
    陆衡：东西我收了。那事过去就过去了。 #id:QG-luheng-amendok
- pid == "luheng" && kind == "amend-no":
    陆衡：东西你留着，那事我还没想通。 #id:QG-luheng-amendno
- pid == "zhouyan" && kind == "again":
    周砚：上回那份尚在，不必再送了。 #id:QG-zhouyan-again
- pid == "zhouyan" && kind == "amend-ok":
    周砚：嗯，收下了。先前的事，不必再提。 #id:QG-zhouyan-amendok
- pid == "zhouyan" && kind == "amend-no":
    周砚：东西留着吧。先前的事，你自己先想想。 #id:QG-zhouyan-amendno
- pid == "song" && kind == "again":
    宋先生：哎，上回那份我还揣着呢，小哥别再破费。 #id:QG-song-again
- pid == "song" && kind == "amend-ok":
    宋先生：小哥客气，那事就揭过去了。 #id:QG-song-amendok
- pid == "song" && kind == "amend-no":
    宋先生：小哥，那事还没过去，东西先收回吧。 #id:QG-song-amendno
}
-> END

=== qh_trade_line ===
{
- pid == "innkeeper" && kind == "look":
    店家：客官，货都摆开了，您先看，咱按秤说话。 #id:QT-innkeeper-look
- pid == "innkeeper" && kind == "ask":
    店家：客官想换哪样？挑好了放上来。 #id:QT-innkeeper-ask
- pid == "innkeeper" && kind == "want":
    店家：客官，货都上秤了，您那边总不能空着吧？ #id:QT-innkeeper-want
- pid == "innkeeper" && kind == "far":
    店家：客官，您这些东西，可换不起我这些货。 #id:QT-innkeeper-far
- pid == "innkeeper" && kind == "near":
    店家：客官再添一件，这买卖就成。 #id:QT-innkeeper-near
- pid == "innkeeper" && kind == "ok":
    店家：两边差不多，这桩买卖成。 #id:QT-innkeeper-ok
- pid == "innkeeper" && kind == "over":
    店家：秤杆都偏您那边了，我可不找补。 #id:QT-innkeeper-over
- pid == "innkeeper" && kind == "done":
    店家：成，东西您拿好。 #id:QT-innkeeper-done
- pid == "apothecary" && kind == "look":
    药商：小哥先瞧货，等你那边上了秤，咱们再算。 #id:QT-apothecary-look
- pid == "apothecary" && kind == "ask":
    药商：想要哪样药？挑一件放上秤。 #id:QT-apothecary-ask
- pid == "apothecary" && kind == "want":
    药商：货都让你挑了，你那头还空着呢，先把东西放上来！ #id:QT-apothecary-want
- pid == "apothecary" && kind == "far":
    药商：这成色也配换我的药？差得忒远了。 #id:QT-apothecary-far
- pid == "apothecary" && kind == "near":
    药商：还差一点，再添些就成。 #id:QT-apothecary-near
- pid == "apothecary" && kind == "ok":
    药商：秤上两边差不多，这买卖做得成。 #id:QT-apothecary-ok
- pid == "apothecary" && kind == "over":
    药商：你放多了，多出来的我可不给补！ #id:QT-apothecary-over
- pid == "apothecary" && kind == "done":
    药商：秤平了，货你带走，两清。 #id:QT-apothecary-done
}
-> END
