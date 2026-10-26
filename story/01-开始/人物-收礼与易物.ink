// 风起栖河 · 人物交互：赠礼／赔礼的收礼反应、易物时对方看秤说的话（每次一句，放进面板气泡，不演出）
// 地点：栖河村里任一处（玩家在墨印菜单点“礼”“易”）　在场：萧白、对方
// 戏眼：萧白想跟这个人处好关系、或换到要的东西；对方收不收、高不高兴看东西合不合心意，易物看秤上两边轻重。散场时：关系涨了或没涨、东西换了或没换。
// 2026-10-26 开发二：照 ../xiaojianghu/docs/design/npc-gifts-and-inventory.md 第 3.3、3.6.1 节与第 6.2 节逐人喜好；戏眼卡 ../xiaojianghu/docs/design/scripts/briefs/qihe-gift-trade-lines-brief.json，
//   MiniMax 演员法每句三备选（MiniMax-M3），主会话挑选剪辑：去掉点名具体物件的说法（送的东西不固定）、易物气泡里的心里话改成说出口的话；“ask”两句是主会话补写。待用户过目，未 --approve。
// 调用：js/qihe-gift.js QiheGift.lineFor('qh_gift_line', {pid, kind})；kind＝xi 喜｜ke 可收｜meh 不喜欢（收下不加分）｜no 婉拒｜again 连送同一样｜amend-ok／amend-no 赔礼收／不收。
INCLUDE ../_共用/externals.ink

VAR pid = "" // 参数：人物 id（js/qihe-npc-data.js PEOPLE 的键）
VAR kind = "" // 参数：反应
VAR who = "" // 参数：说话人的名字（三句通用句用）

=== qh_gift_line ===
{
- pid == "ye" && kind == "xi":
    叶蘅：哎呀，正是药材！药棚正缺，我先收下了。 #id:QG-ye-xi
- pid == "ye" && kind == "ke":
    叶蘅：这个我用得上，便收下了，多谢。 #id:QG-ye-ke
- pid == "ye" && kind == "meh":
    叶蘅：行，那我收下，搁在药棚里吧。 #id:QG-ye-meh
- pid == "ye" && kind == "no":
    叶蘅：你收回去吧，这份礼我不收。 #id:QG-ye-no
- pid == "aunt" && kind == "xi":
    周婶：这物件正合我意，收下正拿来做活使。 #id:QG-aunt-xi
- pid == "aunt" && kind == "ke":
    周婶：那我就收下了，搁在药棚里也使得。 #id:QG-aunt-ke
- pid == "aunt" && kind == "meh":
    周婶：既是你的心意，我便收下，先搁在药棚里。 #id:QG-aunt-meh
- pid == "aunt" && kind == "no":
    周婶：你自个儿留着使吧，这份礼我可不收。 #id:QG-aunt-no
- pid == "chen" && kind == "xi":
    陈伯：好酒！正合我意，修完车我开它两盅。 #id:QG-chen-xi
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
    村口老人：啊，收下了。你吃了饭再走罢。 #id:QG-elder-meh
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
    采办随从：无功不受禄，这礼我不能收。 #id:QG-aide-no
- pid == "bailiff" && kind == "xi":
    差役：这酒好，夜里巡路正拿它提神。 #id:QG-bailiff-xi
- pid == "bailiff" && kind == "ke":
    差役：那我就收下了，多谢你。 #id:QG-bailiff-ke
- pid == "bailiff" && kind == "meh":
    差役：那我就收下了，多谢你。 #id:QG-bailiff-meh
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
    帮众：既是你的心意，我便收下了。 #id:QG-bandit-ke
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
    岑霜：这物件……正合我意，留着赏玩也解闷，我便收下了。 #id:QG-censhuang-xi
- pid == "censhuang" && kind == "ke":
    岑霜：既是你送的，我便收下了——萧公子有心。 #id:QG-censhuang-ke
- pid == "censhuang" && kind == "meh":
    岑霜：哦？既是你一番心意，我便笑纳了。 #id:QG-censhuang-meh
- pid == "censhuang" && kind == "no":
    岑霜：萧公子客气了，只是这份礼不合规矩，你拿回去吧。 #id:QG-censhuang-no
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
- kind == "again":
    {who}：上回送的还没用完呢，这回可别再破费了。 #id:QG-any-again
- kind == "amend-ok":
    {who}：这份我收下。之前的事，容后再说。 #id:QG-any-amendok
- kind == "amend-no":
    {who}：上回的事我还没忘，这东西你拿回去吧。 #id:QG-any-amendno
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
