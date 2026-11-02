/* 师承线（2026-11-02）：师母、二师叔、小师叔在闲逛里亲授独门功法，练到程度才开下一场。设计与数值见文档库 cultivation-mentor-lines.md。
   mentor:true 另算额度（core 的 mentor_met），不占闲逛和串门；teaches 写学会哪门，artNeed 写要练到几重。
   后三段（ys_*）是普通闲逛，走 stroll_met。台词经戏眼卡、演员法起草后剪辑（R-剧情-01）。 */
(function(root){'use strict';
const B=()=>typeof module==='object'&&module.exports?require('./qh-mode-cultivation-balance.js'):root.CultivationBalance; // 页面里本文件先于数值模块加载，用时再取
const lm=(speaker,text,mood,moods)=>({speaker,text,...(mood?{mood}:{}),...(moods?{moods}:{})});
const card=(text,scene)=>({speaker:'title',text,...(scene||{})});
const M=(id,place,time,window,name,teacher,actor,cast,gain,amount,extra={})=>({id,place,time,window,name,teacher,actor,cast,gain,amount,mentor:true,...extra});
const S=(id,place,time,window,name,teacher,actor,cast,gain,amount,extra={})=>({id,place,time,window,name,teacher,actor,cast,gain,amount,quiet:true,side:true,...extra});

const definitions=[
 // —— 师母 · 针路 ——
 M('ms_thread','courtyard','day',[3,44],'穿不过的针眼','江采薇','shimu',['hero','shimu','goose'],'observation',2,{teaches:'art_jc_n1',factRequires:['gy_noodles_seen'],notice:'师母说你的练功服又磨破了，叫你得空去院里拿。'}),
 M('ms_hand','kitchen','dusk',[3,44],'手上的口子','江采薇','shimu',['hero','shimu'],'observation',2,{teaches:'art_jc_n2',artNeed:{id:'art_jc_n1',level:3}}),
 M('ms_sleeve','kitchen','night',[15,19],'掩袖','江采薇','shimu',['hero','shimu'],'understanding',3,{teaches:'art_jc_n3',artNeed:{id:'art_jc_n2',level:3},relNeed:{id:'shimu',min:15},factRequires:['xiangyang_invitation']}),
 // —— 二师叔 · 桩路 ——
 M('mz_bucket','training_ground','day',[5,44],'先挑水','钟拙','zhong',['hero','zhong'],'foundation',4,{teaches:'art_zz_p1',factRequires:['gy_fist_or_sword_seen'],notice:'二师叔在练武场挪木桩，嗓门隔着两道院墙都听得见。'}),
 M('mz_dummy','training_ground','day',[5,44],'听响','钟拙','zhong',['hero','zhong','dou'],'foundation',4,{teaches:'art_zz_p2',artNeed:{id:'art_zz_p1',level:3}}),
 M('mz_notch','courtyard','dusk',[15,19],'扁担上的刻痕','钟拙','zhong',['hero','zhong'],'breathing',4,{teaches:'xf_danxue',artNeed:{id:'art_zz_p2',level:3},relNeed:{id:'zhong',min:10},factRequires:['xiangyang_invitation']}),
 // —— 小师叔 · 剑步 ——
 M('my_twig','bamboo_path','night',[6,44],'碰一下袖子','殷红缨','yin',['hero','yin'],'footwork',3,{teaches:'art_yh_s1',factRequires:['gy_night_return_seen','gy_fist_or_sword_seen'],notice:'小师叔这些天夜里总往竹径去，师母的酒又少了一坛。'}),
 M('my_wrist','bamboo_path','day',[6,44],'换手','殷红缨','yin',['hero','yin'],'footwork',3,{teaches:'art_yh_s2',artNeed:{id:'art_yh_s1',level:3}}),
 M('my_step','courtyard','night',[15,19],'学会走','殷红缨','yin',['hero','yin'],'footwork',3,{teaches:'art_yh_b1',artNeed:{id:'art_yh_s2',level:3},relNeed:{id:'yin',min:15},factRequires:['xiangyang_invitation']}),
 // —— 普通闲逛：可入队角色 ——
 S('ys_two_needles','herb_garden','day',[13,19],'两种针','叶蘅','ye',['hero','ye'],'medical_notes',3,{requires:['joined','ye'],factRequires:['ms_thread_seen'],afterMentor:true}),
 S('ys_lu_rope','courtyard','day',[8,11],'捆行李','陆衡','lu',['hero','lu'],'travel',4,{requires:['joined','lu']}),
 S('ys_wine','market_town','day',[6,11],'赊酒','殷红缨','yin',['hero','yin'],'observation',2,{factRequires:['gy_night_return_seen']})
];

// —— 三方代表当面戏（2026-11-02）：开始部分已认识的徐令仪、岑霜、沈雁回，汉皋前各两段；和师承共用“另算”的额度。比对侠客事件表后定的次数，见设计文档第三点五节。
// Q 版立绘 2026-11-02 评审台通过并采用（art_sources/qihe-reps-q-20261102）。
const REPS_ART_READY=true;
const repDefinitions=[
 M('rep_shen_stall','market_town','day',[6,16],'摊上的药','沈雁回','shen',['hero','shen'],'observation',2,{notice:'山下药摊这几天来了个查药的姑娘，一包一包地闻。'}),
 M('rep_shen_sign','herb_garden','day',[15,19],'回条','沈雁回','shen',['hero','shen','ye'],'medical_notes',3,{requires:['joined','ye'],factRequires:['rep_shen_stall_seen','xiangyang_invitation']}),
 M('rep_cen_pay','terraces','day',[9,16],'照价赔','岑霜','cen',['hero','cen','shimu'],'understanding',2,{factRequires:['hg_aftercare_seen'],notice:'小豆说谷口有个拿折扇的女人，问她什么都笑，就是不进门。'}),
 M('rep_cen_gate','terraces','dusk',[15,19],'别报名字','岑霜','cen',['hero','cen'],'observation',2,{factRequires:['rep_cen_pay_seen','xiangyang_invitation']}),
 M('rep_xu_note','reception','day',[10,16],'一张改过的单子','徐令仪','xu',['hero','xu','zhou','ye'],'understanding',2,{requires:['joined','ye'],factRequires:['hg_aftercare_seen'],notice:'正道盟的徐执事递了帖子，说要进谷见师父一面。'}),
 M('rep_xu_speak','reception','day',[15,19],'说不清','徐令仪','xu',['hero','xu'],'understanding',2,{factRequires:['rep_xu_note_seen','xiangyang_invitation']})
];
if(REPS_ART_READY)definitions.push(...repDefinitions);

const scripts={
 ms_thread:c=>({
  intro:[lm('hero','师母救命，将军又奔我来了！','worry',{goose:'fun'}),lm('shimu','跑什么，鹅钉住了。过来，把胳膊伸直，比比袖子。','normal'),lm('hero','师母，刚才那针是您甩的？鹅怎么连血都没见？','surprise'),lm('shimu','缝衣裳的针，顺手罢了。胳膊抬起来，这袖口又让你磨穿了。'),lm('hero','师母，这一手能教我吗？我肯下功夫！'),lm('shimu','补完这袖子就开饭。喏，针线拿着，穿过去再说。'),lm('hero','师母稍等……这线头，它自己往旁边拐。','worry'),lm('shimu','将军那两只脚蹼都比你这手灵便。','fun')],
  choices:[{key:'try',text:'憋住气，自己再穿',lines:[lm('hero','（憋住气，手别抖……再穿一回。）'),lm('hero','师母，您瞧，穿过去了！'),lm('shimu','一根线，够我纳半只鞋底了。手酸不酸？')]},
   {key:'ask',text:'请师母慢慢穿一回',lines:[lm('hero','师母，这线我穿七八回了都不进……您慢些穿一回给我瞧瞧？'),lm('shimu','肯问，倒比你师父强，他从来不问。看好我手指头，别盯那针眼。'),lm('hero','进了！师母您瞧，真进了。','surprise')]}],
  closing:[lm('shimu','走镖那几年，头一手学的是点腕子，叫人手里东西落地。'),lm('shimu','拿着，七根。只许扎后院那根桩子，少一根，记你账上。'),lm('shimu','你师父问起，就说帮我穿线。敢拿将军试针，晚饭没你的份。','fun'),lm('hero','记下了。师母，这事怎么还得瞒着师父？','surprise'),lm('shimu','问那么多做什么。鹅该喂了，去把将军放了。')]}),
 ms_hand:c=>({
  intro:[lm('hero','师母，这把菜我来摘。针我打得准些了，下一手能教我了吗？','smile'),lm('shimu','缠布条那只手，伸过来。','serious'),lm('hero','没事没事，练针蹭破一点小口子，过两天就好了。','awkward'),lm('shimu','几天了？受了伤先报给我，这话你吃面那天就听过。这笔账还上，再说下一手。')],
  choices:[{key:'own',text:'认了，破了三天',lines:[lm('hero','是我错了，手破了三天，没敢说……怕您就不教了。','sad'),lm('shimu','傻小子。伤了不报，我才不教。胳膊伸过来，别动。')]},
   {key:'argue',text:'争一句：小师叔也没报',lines:[lm('hero','就破了点皮，也算伤？小师叔手上那道口子，也没见谁记上啊。'),lm('shimu','红缨那笔我另记着呢。怎么，你也想上我这本账？'),lm('hero','别记别记……师母，手在这儿，您看吧。','awkward')]}],
  closing:[lm('shimu','见过衣裳锁边没有？一针咬一针，不许断线，这手就这么来。'),lm('shimu','灶台上这三颗豆，一口气打完，中间不许换气。'),lm('hero','师母，头一颗要是打偏了，后两颗还接着打吗？'),lm('shimu','打完再去捡。自个儿捡回来的针，比谁都认得路。'),lm('hero','（偏一针也得自己捡回来，师母这账，一文都不抹。）')]}),
 ms_sleeve:c=>({
  intro:[lm('shimu','三更了还不睡？你那针扎木头的声儿，我隔着墙都听得见。','serious'),lm('hero','吵着您了。要出门了，想多扎几回……您这针，怎么平日只拿来缝补？','normal'),lm('shimu','过来，把胳膊抬起来。这件夹袄我放了一寸，看看肩上紧不紧。'),lm('hero','正合身。师母，那针您怎么从来不对人用？'),lm('shimu','……针出了手，就已经有人要见血了。','sad')],
  choices:[{key:'stop',text:'不再追问，把针收起',lines:[lm('hero','那我不问了，这针……我先收起来。'),lm('shimu','知道收手，比你二师叔强。')]},
   {key:'ask',text:'问她当年护的是谁',lines:[lm('hero','师母，当年那会儿，您护着的是谁？'),lm('shimu','一车药，一个趟子手。药护住了，人没护住。别问了。','sad')]}],
  closing:[lm('shimu','下山打谁我管不着。这一手是挡在人前头的，袖子遮来路，针攥手里。'),lm('shimu','同行的人，饭得一桌回来吃，谁也别少。'),lm('hero','师母，针一直攥着不发，那到什么时候才能发？'),lm('shimu','能不发就别发。真发了，回来跟我报账，一根一根数。'),lm('shimu','袖口给你缝厚了，拿着。回去睡，明早误了饭可没人给你留。')]}),
 mz_bucket:c=>({
  intro:[lm('zhong','哈！瞧见没？这桩子我亲手埋的，三尺深，一掌就给它挪了窝！','fun'),lm('hero',c.learned?.sword?'二师叔，这一掌……我这练剑的，也能学吗？':'二师叔，这一掌能教我吗？','surprise'),lm('zhong','哈！学剑学拳，脚底下都归你二师叔管！先把那口缸挑满，洒一滴重来！'),lm('hero','（又挑水……洒一滴就重来，这比那一掌还狠。）','worry'),lm('hero','二师叔，挑水跟这一掌有什么相干？'),lm('zhong','哈！你二师叔当年挑断三根扁担，枣木的！你这根还新着呢。','fun')],
  choices:[{key:'carry',text:'老老实实挑满',lines:[card('一个时辰后'),lm('hero','呼……脚底下踩实了……这水，就不晃了。'),lm('zhong','哈！这就对了！挑了这些天，总算有一回没光使肩膀！')]},
   {key:'shim',text:'削块木片垫在扁担下',lines:[lm('hero','垫块木片在底下，挑起来兴许晃得小些。'),lm('zhong','这片削得跟狗啃似的！回头师叔给你削片好的，水照样你挑。','fun')]}],
  closing:[lm('zhong','过来，站桩前头。脚钉住，别往前冲，肘沉下去，拳出半尺就够。'),lm('hero','嘶——疼疼疼！师叔，这桩怕不是铁打的吧？','worry'),lm('zhong','哈！一天打它一百下，打到它先晃了再来喊疼！','fun'),lm('zhong','你小师叔那套花架子，练三年也打不出这半尺劲！')]}),
 mz_dummy:c=>({
  intro:[lm('zhong','萧白，来，打一拳！别管桩，我做的桩你打不散，我就听个响！','smile'),lm('hero','这一拳我沉了肘，您听着，力是从哪儿来的？','normal'),lm('zhong','就一声闷响，全是肩膀硬扛的！真打对了，我这桩该响三声。'),lm('zhong','哈！肩、肘、掌三截，你二师叔当年三天就练齐了！','fun'),lm('dou','嘿，三天？师父跟我讲的可是三年，您这一嘴少了好几百天！','fun'),lm('zhong','三天三年，不都带个三字，你懂个啥！喂鹅去！','angry')],
  choices:[{key:'again',text:'闭上眼，再打一拳',lines:[lm('hero','好像……是两声。','surprise'),lm('zhong','再来。肘……慢半拍。')]},
   {key:'ask',text:'问怎么知道肘慢没慢',lines:[lm('hero','师叔，我这肘到底慢没慢，自己怎么觉不出来？'),lm('zhong','别琢磨，我手搭这儿。你那只手，叫它晚半拍再走。')]}],
  closing:[lm('zhong','哈！三声！听见没有，三声一声不少！','fun'),lm('dou','才几天就三声了？我当年……哼，准是这桩子好打。'),lm('zhong','记住了，这手叫三响拳，我起的名！比我师兄那些酸名字响亮多了！')]}),
 mz_notch:c=>({
  intro:[lm('hero','二师叔，工棚我替您收拾了。这旧扁担上一道一道的，刻的是什么？','normal'),lm('zhong','扫帚把子罢了，记什么数……扫你的地去。','normal'),lm('hero','（扁担说成扫帚把子……换平时，他能吹上半个时辰。）','surprise'),lm('hero','一道挨一道刻得这么齐，瞧着真像在记数。'),lm('zhong','……一道一天。三千多天，别数了。','sad')],
  choices:[{key:'wait',text:'不接话，接着收拾凿子',lines:[lm('hero','这把刃口卷了，明早得先磨。'),lm('zhong','你师父三天就使顺的掌法，我练了三年。练成了也没敢停。','sad')]},
   {key:'tease',text:'“不是挑断了三根吗？”',lines:[lm('hero','咦，不是说挑断了三根扁担么？'),lm('zhong','哈……就这一根，从没断过。你师父三天学会的，我三年才摸着门，往后也没敢停。','sad')]}],
  closing:[lm('zhong','我这脑子转不快，除了死练，也没别的招。'),lm('zhong','挑水时怎么换气，我自个儿琢磨的……没人稀罕学，你要不要？'),lm('hero','要！您别收回去，我这就学。'),lm('zhong','我原叫它挑水诀，你师父嫌难听，说这叫担雪诀。哈！名字是他的，法子是我的！','fun')]}),
 my_twig:c=>({
  intro:[card('夜 · 竹径'),lm('yin','小白脸，回什么屋？接着。','fun'),lm('hero','（又是一身酒气……）'),lm('hero','小师叔，这剑怎么缺了个口？谁的？','surprise'),lm('yin','你二师叔削废的，我打柴堆里捡来。碰着我袖子，就算你赢。'),lm('hero','呼……再来，您这袖子是长了眼睛吧？','worry'),lm('yin','你这一剑捅灶膛呢？火都让你捅灭了。','fun')],
  choices:[{key:'push',text:'咬牙再刺',lines:[lm('hero','嘶——手腕！','worry'),lm('yin','竹枝敲的，轻的。挨这一下，看清我从哪儿进的没？')]},
   {key:'watch',text:'停手，站着看她的脚',lines:[lm('hero','等等……您每回都往我左手边绕。'),lm('yin','哟，小白脸这双眼睛，倒不是全白长的。','surprise')]}],
  closing:[lm('yin','先挡，别急着往里钻。等他手过去了，从外头绕一圈，点他腕子。'),lm('hero','咦……碰着了？我真点到您袖子了？','surprise'),lm('yin','美什么，我让的。这手叫绕岚，留着往后保命使。'),lm('yin','教你一手，换你一双瞎眼。今晚这壶酒，你没瞧见。','fun'),lm('hero','记住了。那……师母要是问起来，我怎么说？'),lm('yin','就说你起夜去了，反正你半夜乱晃也不是头一回。','fun')]}),
 my_wrist:c=>({
  intro:[lm('yin','小白脸，绕岚出来瞧瞧，别留力。碰着我一片衣角，算你赢。','smile'),lm('hero','弟子得罪了——','serious'),lm('hero','（她右手刚才没握紧……后半截怎么换成左手了？）','surprise'),lm('hero','小师叔，您方才后半招……是换了左手吧？'),lm('yin','哟，小白脸剑没长进，眼睛倒先学会使了。晌午饭吃了没？','fun')],
  choices:[{key:'skip',text:'不提手，请她教那一下',lines:[lm('hero','那一下换手，能不能再教我一遍？我想慢慢练。'),lm('yin','啧，你这张嘴倒比你的剑会拐弯。')]},
   {key:'care',text:'问手要不要让叶蘅看看',lines:[lm('hero','您这手……要不要让叶蘅给瞧瞧？','worry'),lm('yin','不用，看过了。再多问一句，我拿酒葫芦敲你。')]}],
  closing:[lm('yin','看好了。有阵子右边使不上，琢磨出这个：两下换边点，别使力，要快。'),lm('hero','哎……手一快，剑倒先跑了。我捡回来，再来一遍。','awkward'),lm('yin','哪只手都攥得住才叫会，这会儿顶多算你会扔。','fun')]}),
 my_step:c=>({
  intro:[card('夜 · 庭院'),lm('yin','小白脸，别急着回屋，出门前还差一样没教你：怎么跑。','fun'),lm('hero','小师叔又拿我寻开心，别人都教怎么打，您倒教跑？','smile'),lm('yin','打赢的我没见过几个，活着回来吃饭的，倒认识一大桌。'),lm('hero','那您常年不在谷里，也是打不过，跑的？'),lm('yin','……')],
  choices:[{key:'back',text:'“是我嘴快。”',lines:[lm('hero','是我嘴快瞎说的，小师叔您接着教。','awkward'),lm('yin','行啊，问出去还知道往回撤半步，这步法倒比你的剑好。')]},
   {key:'wait',text:'不说话，等她开口',lines:[lm('hero','（……不急，等她开口。）'),lm('yin','有些家啊，待久了，倒怕哪天待不下去。','sad')]}],
  closing:[lm('yin','先让半步，身子侧过去，退也得退到同伴边上，自个儿跑的那叫逃。'),lm('hero','那要是身边一个自己人都没有呢？'),lm('yin','那就往家的方向退。谷门朝哪边开，你总不会忘吧？'),lm('yin','去吧。萧白，走得掉，才回得来。')]}),
 ys_two_needles:c=>({
  intro:[lm('ye','手别缩，伸过来。虎口这几个针眼，哪来的？','serious'),lm('hero','嗯……是我自己扎的，缝衣裳，手笨。','awkward'),lm('ye','这针尖磨得这么利，缝衣裳用不着，你拿它扎什么了？'),lm('hero','是师母的针……她在教我，说别声张。您就当没瞧见吧。','awkward')],
  choices:[{key:'ask',text:'问她治病的针怎么拿',lines:[lm('hero','你那治病的针，也是这么捏着下的吗？'),lm('ye','不一样。我下针慢，进一分问一句疼不疼；三根手指捏稳了，腕子不许抖。')]},
   {key:'match',text:'“要不比一比准头？”',lines:[lm('hero','要不比一比？看谁扎得准些。'),lm('ye','你扎的是桩子，我扎的是人，有什么好比的。喏，药匾上那粒种子，扎吧。')]}],
  closing:[lm('ye','这儿别扎，扎深了这只手就废了。师母既教你点手腕，这个你得知道。'),lm('hero','记下了。这腕子上，还有哪处是碰不得的？'),lm('ye','还多着，改天我把图拿来给你看。你先把手上这口子养好。')]}),
 ys_lu_rope:c=>({
  intro:[lm('hero','陆大哥，那套棍法我记了几处没弄懂，您得空帮我瞧瞧？','normal'),lm('lu','下回送药走几里？几个人跟？','normal'),lm('hero','这……还没问过，我光顾着琢磨棍法了。','awkward'),lm('lu','笔记先揣着，过来按住这头，把这根绳捆紧了再说。')],
  choices:[{key:'tie',text:'照他的样子捆',lines:[lm('hero','照您那样捆的，一提箱子就松了……是我扣打反了？','worry'),lm('lu','你绳走的箱腰，一提就溜。兜着箱底过，拆了重捆。')]},
   {key:'why',text:'问捆绳和棍法有什么相干',lines:[lm('hero','学棍法，怎么倒先学捆绳了？这俩有什么相干？'),lm('lu','路上箱子一散，棍使得再漂亮，也得回头一件件捡。')]}],
  closing:[lm('lu','笔记拿来。这儿记岔了，棍横起来是替人挡的，别拿它抡。'),lm('hero','记下了，回头就改。走之前，能让我横着再练一回吗？'),lm('lu','能。先把路记上，走几里，护几个人。')]}),
 rep_shen_stall:c=>({
  intro:[lm('shen','脚挪开，踩着我单子了。……萧白？你哪天从山里下来的？','surprise'),lm('hero','对不住。今早刚下来的。沈姑娘，你这是在配药？','normal'),lm('shen','查药，不是配。你闻闻，单子上写的甘草，这是甘草吗？','serious'),lm('hero','我闻不出来……这个怕是得问叶蘅。'),lm('shen','……叶姑娘这阵子，还给人看病么？','normal')],
  choices:[{key:'self',text:'“你自己进谷问她。”',lines:[lm('hero','叶蘅就在谷里住着，要问你自己去问，谷里不拦人。','normal'),lm('shen','去是要去的。哪天……还没算好。','worry')]},
   {key:'tell',text:'说说叶蘅的近况',lines:[lm('hero','看的，天天守着药圃，气色不差，账记得比谁都细。','normal'),lm('shen','那就好。……罢了，这也是听来的，做不得数。','normal')]}],
  closing:[...(root.S?.qiheChapter?.records?.told_about_stranger?[lm('shen','你说的那个姓宋的账房，后山我去了两趟，没见着人。','serious')]:[]),lm('shen','叶蘅的药箱是我扣的，这种话托不得人带，我自己去。','serious'),lm('hero','那您打算哪天上山？'),lm('shen','等这包甘草里掺的东西查清了，我拿着去。空手不上山。')]}),
 rep_shen_sign:c=>({
  intro:[lm('shen','叶姑娘，这会儿得空么？我能进圃里说句话不？','worry'),lm('ye','能进，先把脚挪开，那垄薄荷才冒头。','normal'),lm('shen','哦，对不住。条子你看，程巡检批了，扣箱那回记我的错。','serious'),lm('ye','条子先搁着。掺假那批甘草，有几个人吃过？现在都怎么样了？','serious')],
  choices:[{key:'hold',text:'把条子接过来',lines:[lm('hero','条子我先替你收着，你们说。','normal'),lm('shen','好。你问的这个……我还没问。我这就记下。','sad')]},
   {key:'wait',text:'不插手，看她怎么答',lines:[lm('hero','（她先问病人……这回沈姑娘怎么说？）','normal'),lm('shen','这个……我还没问。','sad')]}],
  closing:[lm('shen','叶姑娘，这一条我不会写。你说，我记。','serious'),lm('ye','写吃过药的人家住哪儿，隔几天再去看一回。条子搁那儿吧。','normal'),lm('shen','住哪儿、隔几天，记下了。这回是我亲耳听你说的，错不了。','smile'),lm('ye','下回沾药的事先来问我，别等写完了再改。'),lm('shen','记下了。今儿四月初几？头一行先写上。')]}),
 rep_cen_pay:c=>({
  intro:[lm('cen','小兄弟，劳驾。烧了谁家的，都在这儿了，替我转交。','smile'),lm('hero','岑姑娘，您怎么不进去坐坐？','surprise'),lm('cen','我这一脚迈进去，明日江上就该有人说两家结了盟了。','smile'),lm('shimu','门不进由你，这杯茶得喝。喝完了再算你的账。','serious'),lm('cen','……这位想必是师母。这一杯喝下去，闲话怕是比我先到山下。','normal')],
  choices:[{key:'count',text:'当面把银子点一遍',lines:[lm('hero','那我当着几位的面点一遍，若是少了，也好当场说清。','normal'),lm('cen','这才像个办事的样子。点吧，少一文，我来补。','smile')]},
   {key:'wukui',text:'“那个乌魁呢？”',lines:[lm('hero','那个乌魁呢，后来怎样了？','serious'),lm('cen','在船上扛包呢，我管着。他再进一回村，你来找我。','serious')]}],
  closing:[lm('shimu','茶凉了也是我倒的。闲话我担着，归云谷的门口，还轮不到旁人嚼舌头。','serious'),lm('cen','好茶。……请我喝茶还不朝我要点什么的，您算头一个。','normal'),lm('shimu','钱到了谁手上，回头给你写张收条。','normal'),lm('cen','小兄弟，收条捎到船上。写岑霜二字，总有人送到。','smile')]}),
 rep_cen_gate:c=>({
  intro:[card('傍晚 · 谷口'),lm('cen','小兄弟这是要进城了？走着去，还是……坐船？','smile'),lm('hero','岑姑娘在这儿等了多久？总不是专程来问我怎么走的吧。','normal'),lm('cen','等你？我路过罢了。船上听了一耳朵，汉皋有人在打听栖河那场火。','normal'),lm('hero','什么人在打听？','serious'),lm('cen','不知道。知道了，我还站这儿吹风？','serious')],
  choices:[{key:'why',text:'“为何告诉我？”',lines:[lm('hero','这些话，你为何要同我说？','normal'),lm('cen','栖河那笔账还没清呢。你要是折在汉皋，我找谁对账去？','smile')]},
   {key:'thanks',text:'“多谢岑姑娘。”',lines:[lm('hero','岑姑娘，多谢了。','normal'),lm('cen','别谢。你一谢，我就得琢磨你拿什么来还了。','smile')]}],
  closing:[lm('cen','进了汉皋碰上难处，别报归烬堂……报我岑霜的名字。','serious'),lm('hero','报了您的名字，那边真有人认？','normal'),lm('cen','有时管用，有时更糟。看人下菜，会吧？','smile')]}),
 rep_xu_note:c=>({
  intro:[lm('xu','晚辈徐令仪，见过周前辈。这趟进谷，是为栖河的事来交代的。','serious'),lm('zhou','要交代的人就在廊那头，你自己过去说罢。','normal'),lm('ye','徐姑娘这回带了几个护院？路又要守到哪儿？','serious'),lm('xu','一个也没带。上回带的够多了，够我记好些年。','sad')],
  choices:[{key:'ease',text:'“先坐下说吧。”',lines:[lm('hero','徐姑娘，先坐下说吧，师母的茶放凉了，回头要找我算账的。','normal'),lm('xu','多谢萧公子，茶我记着。只是这几句话，我得站着说完。','normal')]},
   {key:'quiet',text:'不插话',lines:[lm('hero','（她俩的事，我站远些，别出声。）','normal')]}],
  closing:[lm('xu','这页是盟里保管册的抄页，叶家那条我已经划掉了，底下署的是我的名。','serious'),lm('ye','这一划，能保多久？换个人来，还作不作数？','serious'),lm('xu','保不了多久，只保得住经我手的这一路不再来。那张附页，查到第三手就断了。','sad'),lm('ye','行，这页给我，我收着。'),lm('xu','萧公子，她问得在理。我能还她的，还是只有一页字。','normal')]}),
 rep_xu_speak:c=>({
  intro:[lm('xu','到了汉皋，盟里有人会按规矩问栖河的事。我先替他们走一遍：第三日戌时，你在何处？','serious'),lm('hero','戌时……在、在村里帮着提水吧？这也得记时辰？','worry'),lm('xu','要记。再答一遍：先报时辰，再报地方，别带“好像”。'),lm('hero','（站一个时辰的桩，也没出过这么多汗。）','worry')],
  choices:[{key:'recite',text:'照她教的背一遍',lines:[lm('hero','戌时，弟子萧白，在栖河村……村中，提水救火，不敢有误。','awkward'),lm('xu','停。字句太齐，一听便知是旁人拟的。','normal')]},
   {key:'plain',text:'“我就记得这些。”',lines:[lm('hero','火很大，人也多，别的真记不清了，我就记得这些。','normal'),lm('xu','上回我若肯听这样的话，也不至于在栖河丢那个脸。','sad')]}],
  closing:[lm('xu','罢了，别背了。说不清的就说不清，背得太齐整，倒像那张附页。','normal'),lm('hero','那问话的人不会揪着这个往下追吧？','normal'),lm('xu','问话的人也怕录错。你只记一句：没亲眼见的，就说没见。','serious'),lm('xu','这话，当初在栖河该有人先跟我讲一遍。','smile')]}),
 ys_wine:c=>({
  intro:[lm('yin','哎，小白脸！别装没看见，过来，师叔有桩好事便宜你。','fun'),lm('hero','小师叔也下山了？我是来给师母买盐的。','surprise'),lm('yin','想赊两角酒，这掌柜非说我上回的还没清。'),lm('yin','兜里的钱先匀师叔几文，回山一准还你，可别让师母知道。')],
  choices:[{key:'keep',text:'不给，这是买盐钱',lines:[lm('hero','这是师母给的买盐钱，少一文她回头就晓得。'),lm('yin','唉，也是。收好吧，我可不想看师母摸针。','worry')]},
   {key:'own',text:'掏自己攒的几文',lines:[lm('hero','盐钱可动不得。喏，我这儿攒了几文，你先拿去。'),lm('yin','啧，就这几文，够半壶的……行，这半壶师叔记下了。')]}],
  closing:[lm('yin','行了，买你的盐去。今儿你没见过我。'),lm('hero','那您上回赊的，还差多少？'),lm('yin','记不清。掌柜记得就行。','fun')]})
};

const bonds={ms_thread:{try:['江采薇',6],ask:['江采薇',6]},ms_hand:{own:['江采薇',7],argue:['江采薇',5]},ms_sleeve:{stop:['江采薇',8],ask:['江采薇',8]},
 mz_bucket:{carry:['钟拙',6],shim:['钟拙',6]},mz_dummy:{again:['钟拙',6],ask:['钟拙',6]},mz_notch:{wait:['钟拙',10],tease:['钟拙',8]},
 my_twig:{push:['殷红缨',5],watch:['殷红缨',6]},my_wrist:{skip:['殷红缨',6],care:['殷红缨',4]},my_step:{back:['殷红缨',5],wait:['殷红缨',8]},
 rep_shen_stall:{self:[['沈雁回',5]],tell:[['沈雁回',6]]},rep_shen_sign:{hold:[['沈雁回',6],['叶蘅',2]],wait:[['沈雁回',6]]},rep_cen_pay:{count:[['岑霜',6]],wukui:[['岑霜',5]]},rep_cen_gate:{why:[['岑霜',6]],thanks:[['岑霜',5]]},rep_xu_note:{ease:[['徐令仪',5]],quiet:[['徐令仪',5]]},rep_xu_speak:{recite:[['徐令仪',5]],plain:[['徐令仪',7]]},
 ys_two_needles:{ask:[['叶蘅',4]],match:[['叶蘅',3]]},ys_lu_rope:{tie:[['陆衡',3]],why:[['陆衡',3]]},ys_wine:{keep:[['殷红缨',2]],own:[['殷红缨',4]]}};

// 亲授：学会一门，结果面板写明去哪儿练。陆衡改过笔记，学过棍法的多一点熟练。
function effects(s,p){const d=definitions.find(x=>x.id===p.action);if(!d)return;
 if(d.teaches){const a=B().artById(d.teaches);s.learned[a.key]||={source:p.action,period:p.period};p.taught=a.name;}
 if(p.action==='ys_lu_rope'&&s.learned.qh_hulu_staff)B().addXp(s,'qh_hulu_staff',25);}

const API={definitions,repDefinitions,REPS_ART_READY,scripts,bonds,effects,actors:{xu:'徐令仪',cen:'岑霜',shen:'沈雁回'},moods:{xu:['normal','smile','serious','worry','sad','surprise'],cen:['normal','smile','serious','worry','sad','surprise'],shen:['normal','smile','serious','worry','sad','surprise']}};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationMentors=API;
})(typeof globalThis!=='undefined'?globalThis:this);
