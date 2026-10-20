/* 谷中人家（2026-10-11）：归云谷院墙之外、山谷之内的三处——溪东半亩书屋（裴述、裴知古）、谷口梯田人家、溪上水碓房。
   设定见文档库 companions/pei-zhigu-valley.md；实现说明见 guiyun-household.md“谷中人家”一节。
   这些是“串门”：和门派里的闲逛分开算，每个时段另可遇一段（neighbor:true），不占门派闲逛的节奏。
   只遇一次；由 CultivationHousehold 合并进剧情引擎。佃农与守碓婆婆是普通人，不上场说话。 */
(function(root){'use strict';
const lm=(speaker,text,mood,scene)=>({speaker,text,...(mood?{mood}:{}),...(scene||{})});
const card=(text,scene)=>({speaker:'title',text,...(scene||{})});
const D=(id,place,time,window,name,teacher,actor,cast,gain,amount,extra={})=>({id,place,time,window,name,teacher,actor,cast,gain,amount,neighbor:true,...extra});
const IN={place:'bookhouse_inside',time:'day'},OUT={place:'bookhouse',time:'day'},NIGHT={place:'bookhouse',time:'night'};

const definitions=[
 // —— 进城前（第一年正月–四月）：四段主干 ——
 D('gn_lamp','bookhouse','day',[4,11],'隔溪的灯','裴知古','pei',['pei','hero'],'observation',3,{notice:'夜里溪对岸有一盏灯亮到很晚。师母说，那是溪东裴先生家。'}),
 D('gn_words','bookhouse_inside','day',[7,11],'认字','裴述','peishu',['peishu','hero','pei'],'understanding',4,{factRequires:['gn_lamp_seen'],factHint:'先去溪东认识裴家的人。',notice:'师母说你看帖子太慢，让你去溪东裴先生那里补几天字。'}),
 D('gn_chests','bookhouse_inside','day',[13,18],'两箱残稿','裴知古','pei',['pei','hero'],'understanding',4,{factRequires:['gn_words_seen'],factHint:'先在裴家把字补上。',bottleneck:'裴知古'}),
 D('gn_depart','courtyard','day',[19,19],'托你带一句话','裴知古','pei',['zhou','peishu','pei','hero'],'understanding',2,{auto:true,neighbor:false,notice:'溪东裴家的姑娘要进城交抄稿，裴先生托师父路上照应。'}),
 // —— 进城前：串门小事 ——
 D('gn_dou_copy','bookhouse_inside','day',[8,11],'罚抄','卢小豆','dou',['dou','pei','hero'],'observation',3,{quiet:true,factRequires:['gn_lamp_seen']}),
 D('gn_terraces','terraces','day',[6,11],'田头的账','裴知古','pei',['shimu','pei','hero'],'observation',3,{quiet:true,factRequires:['gn_lamp_seen']}),
 D('gn_mill','watermill','day',[13,18],'水碓房','裴知古','pei',['pei','hero'],'observation',3,{quiet:true,factRequires:['gn_lamp_seen']}),
 // —— 进城之后（六–九月、十一–十二月）——
 D('gn_ye_ink','bookhouse_inside','day',[26,36],'方子上的字','叶蘅','ye',['ye','pei','hero'],'medical_notes',3,{quiet:true,requires:['joined','ye'],factRequires:['gn_words_seen']}),
 D('gn_yin_book','bookhouse','day',[30,42],'借书的人','殷红缨','yin',['yin','pei','hero'],'observation',3,{quiet:true,factRequires:['gy_night_return_seen','gn_lamp_seen']}),
 D('gn_eyes','bookhouse','night',[36,44],'父亲的眼睛','裴知古','pei',['pei','hero'],'understanding',4,{quiet:true,factRequires:['gn_chests_seen'],bottleneck:'裴知古'}),
 D('gn_winter','bookhouse_inside','day',[50,58],'抄完的那一卷','裴知古','pei',['pei','peishu','hero'],'understanding',3,{quiet:true,factRequires:['gn_chests_seen']}),
];

const scripts={
 gn_lamp:c=>({
  intro:[card('夜 · 溪边',NIGHT),lm('hero','（溪对岸那盏灯，三更了还亮着。）','normal',NIGHT),card('第二天',OUT),
   lm('pei','别动、别动——那一页别踩！','surprise',OUT),lm('hero','……我没动。是风。','surprise'),
   lm('pei','啊。又吹下去两张。','sad'),lm('hero','溪里那些白的，都是你晾的？','normal'),
   lm('pei','是前年受潮的抄本。我想着今天日头好……然后看到第三页有个字不对，就看进去了。','normal')],
  choices:[{key:'wade',text:'卷起裤腿下水去捞',lines:[lm('hero','你在岸上接，我下去。','serious'),lm('pei','水凉——哦，你已经下去了。','surprise'),lm('hero','左边这张字还在。右边这张糊了。','normal'),lm('pei','糊了的也给我。糊成什么样，本身也是一条记录。','serious')]},
   {key:'count',text:'先帮她把岸上的压住，再点一点少了几页',lines:[lm('hero','先别管水里的。岸上这些拿石头压住，再数缺了第几页。','serious'),lm('pei','……对。先知道丢了什么。','normal'),lm('hero','十七、十八、二十一。缺十九和二十。','normal'),lm('pei','十九在那块石头底下，二十漂到下游了。——你数得比我快。','smile')]}],
  closing:[lm('pei','你是归云谷新来的那个。小豆说过，说你写字很怪。','normal'),lm('hero','……他怎么什么都往外说。','worry'),
   lm('pei','方才你替我记页码的那张纸，我看了。横着写，字还缺笔画。','serious'),lm('hero','（糟了。）','worry'),
   lm('pei','像是从一本我没读过的书里抄下来的。——我叫裴知古。那本书，哪天借我看看。','smile')]}),
 gn_words:c=>({
  intro:[lm('peishu','江夫人说，你看一张帖子要小半个时辰。','normal',IN),lm('hero','竖着排的字，我总是看串行。','sad'),
   lm('peishu','不妨事。眼睛看串了，就用手指着读。我如今也是这么读的。','smile'),lm('pei','爹，那是因为您眼睛不好。','normal'),
   lm('peishu','所以我才知道这法子管用。来，从这一行起。','normal'),card('半个时辰后'),
   lm('hero','“……民夫三百，筑堤七里，凡四十日。”——先生，这三百个人，后来呢？','normal'),lm('peishu','后来？','surprise'),
   lm('pei','……','surprise')],
  choices:[{key:'ask_on',text:'“书上没写他们后来怎样？”',lines:[lm('hero','堤修完了，这些人回家了吗？工钱给了没有？','normal'),lm('peishu','书上只记到“凡四十日”。写书的人，写到这里就停了。','serious'),lm('pei','爹，这句话我也问过您。','normal'),lm('peishu','……是。你问过。我那时也是这么答的。','sad')]},
   {key:'read_on',text:'低头接着往下读',lines:[lm('hero','……我多嘴了。接着读。','worry'),lm('pei','不多。','serious'),lm('hero','嗯？','surprise'),lm('pei','这句话不多。读书的人里，十个有九个不问这一句。','normal')]}],
  closing:[lm('peishu','今天就到这里。明日再来，带上你自己写的字，我看看怪在哪里。','smile'),lm('hero','（最好别看。）','worry'),
   lm('pei','我送你到溪边。……“后来呢”这三个字，你往后要是还想问，来问我。我也想知道。','smile')]}),
 gn_chests:c=>({
  intro:[lm('pei','这两口箱子，是我爹背进谷的。那年我六岁，坐在箱子上被他一起背着。','normal',IN),lm('hero','里面是什么？','normal'),
   lm('pei','一部书的残稿。我高祖写的，叫《江汉旧闻》。有名有姓，有据才录——这是他定的规矩。','serious'),
   lm('pei','书里记了一家大族占了民田，又把民夫修的堤报成自家的功劳。后来那一族得了势，告他“谤讪”。书版劈了，学生散了。','sad'),
   lm('hero','他改了吗？','normal'),lm('pei','一个字没改。三年后过世的。','serious'),
   lm('pei','后头三代人，就在补这部书。我爹补到眼睛坏了，现在是我。','normal')],
  choices:[{key:'restore',text:'“那就把它补完。”',lines:[lm('hero','那就把它补完。缺哪一卷，我认得的字不多，可我能替你数页码。','serious'),lm('pei','……数页码的人，我正好缺一个。','smile'),lm('pei','可是补完了，也只是他当年写下的那些。','normal')]},
   {key:'own',text:'“你自己想写什么？”',lines:[lm('hero','这是你高祖的书。你自己想写什么？','normal'),lm('pei','……','surprise'),lm('pei','没人这么问过我。我爹没有，我自己也没有。','normal'),lm('pei','我想写——那三百个人，后来呢。可这得出谷才知道。','serious')]}],
  closing:[lm('pei','这话你别同我爹说。他只盼着把原书补齐。','worry'),lm('hero','不说。','normal'),
   lm('pei','四月底我要进一趟城，去书铺交抄稿。听说你们也是那时候走。','normal'),lm('hero','那就一道。','smile'),lm('pei','我走路慢，会看着路边的碑就站住。先同你说一声。','smile')]}),
 gn_depart:c=>({
  intro:[card('四月底 · 出发前'),lm('peishu','周掌门，小女头一回出远门，路上劳烦照应。','worry'),lm('zhou','裴兄放心。跟着萧白他们走，路上有人。','smile'),
   lm('peishu','知古，抄稿交给东街的书铺，拿了钱先去配镜子，别又钻进旧书堆里出不来。','serious'),lm('pei','知道了。','normal'),
   lm('peishu','你方才答应的时候，眼睛在看萧白背上的包袱。','normal'),lm('pei','……他包袱上的结打得很怪。我在想是哪里的打法。','serious'),lm('hero','（那是鞋带结。）','worry')],
  choices:[{key:'linear',text:'',auto:true,lines:[lm('pei','我带了一本空册子。','normal'),lm('hero','记什么？','normal'),
   lm('pei',(c.pei?.chests==='own')?'记“后来呢”。从这一趟开始记。':'记路上看见的。书上没有的那些。','smile'),
   lm('peishu','……去吧。','smile')]}],
  closing:[lm('pei','萧白。我跟着你们走，不会添乱——大概不会。','normal'),lm('hero','添了再说。走吧。','smile')]}),
 gn_dou_copy:c=>({
  intro:[lm('dou','萧白！你也是被罚来的？','surprise',IN),lm('hero','我是路过。你呢？','normal'),
   lm('dou','师母让我把《千字文》抄三遍。裴姐姐盯着，一个错字加抄一行。','sad'),lm('pei','“寒来暑往”的“暑”，你写成了“署”。加一行。','normal'),
   lm('dou','差不多嘛！','angry'),lm('pei','一个是天热，一个是衙门。你想在衙门里过夏天？','serious')],
  choices:[{key:'help',text:'坐下来替小豆研墨',lines:[lm('hero','我替你研墨，你快点抄。','smile'),lm('dou','还是师弟好！','smile'),lm('pei','研墨可以。替他写不行——你的字我认得出来。','normal'),lm('hero','……这么明显？','worry')]},
   {key:'tease',text:'凑过去数他一共错了几个',lines:[lm('hero','我数数。一、二……七个。','fun'),lm('dou','你到底是哪边的！','angry'),lm('pei','八个。第四行那个你也看漏了。','normal'),lm('dou','你们俩合起伙来欺负师兄！','sad')]}],
  closing:[lm('pei','小豆的字是我爹教的，如今我来查。他认字其实很快，就是坐不住。','smile'),lm('dou','我听见了！这句是夸我！','fun')]}),
 gn_terraces:c=>({
  intro:[lm('shimu','今年春上借出去的谷种，一共是多少？','normal',{place:'terraces',time:'day'}),lm('pei','两户合起来四石三斗。东头那家多借了两斗，说好秋后还。','normal'),
   lm('shimu','你记在哪儿了？','normal'),lm('pei','记在……我记在一张纸上。纸夹在一本书里。','worry'),lm('shimu','哪本书？','serious'),
   lm('pei','这个我得回去想。','sad'),lm('hero','（原来她也会被师母问住。）','fun')],
  choices:[{key:'recall',text:'帮她想：那天她手里拿的是什么书',lines:[lm('hero','借谷种那天是初七。初七你在晾哪一箱书？','normal'),lm('pei','初七……晾的是第二箱。地理志那几册。','surprise'),lm('pei','想起来了。夹在《水经》第三册，讲汉水的那一页。','smile'),lm('shimu','往后账归账、书归书。萧白，你盯着她点。','smile')]},
   {key:'recount',text:'提议直接去田头再问一遍两户人家',lines:[lm('hero','纸找不着，人还在。去田头当面再问一遍，两边对上就行。','serious'),lm('shimu','这话在理。','smile'),lm('pei','……问人。我总是先想着找纸。','normal'),lm('hero','纸会夹错书，人不会。','smile')]}],
  closing:[lm('shimu','知古心细，就是心不在一处。归云谷的账要她记，也得有人替她记着她把账放哪儿了。','smile'),lm('pei','师母，这句我记下了。……记在哪儿，回头告诉您。','worry')]}),
 gn_mill:c=>({
  intro:[lm('pei','帮我扶一下这袋。守碓的婆婆腰不好，我替她搬进去。','normal',{place:'watermill',time:'day'}),lm('hero','你常来？','normal'),
   lm('pei','常来。婆婆记得你们师祖年轻时候的事，我一边搬米一边听。','smile'),lm('hero','她说什么了？','normal'),
   lm('pei','说师祖当年进谷，只带了一把剑和一口锅。锅先坏的。','normal'),lm('hero','……这也记？','surprise')],
  choices:[{key:'listen',text:'让她接着讲',lines:[lm('pei','记。剑的事谁都记，锅的事只有婆婆记得。','serious'),lm('pei','后来是我爹替师祖抄剑谱，师祖管我们家的米。这座水碓，就是那时候修的。','normal'),lm('hero','所以你家的米也是这里舂的。','normal'),lm('pei','十四年了。','smile')]},
   {key:'doubt',text:'问她：婆婆记的就一定对吗',lines:[lm('hero','隔了这么多年，婆婆要是记错了呢？','normal'),lm('pei','会错。所以我写的是“守碓人某说”，不写“师祖如何如何”。','serious'),lm('pei','谁说的、哪年说的、当时在场还有谁。这三样写清楚，错了也查得回去。','normal'),lm('hero','（她平时迷糊，说到这个一点不迷糊。）','smile')]}],
  closing:[lm('pei','米舂好了。你扛那袋轻的。','normal'),lm('hero','为什么你扛重的？','surprise'),lm('pei','我扛惯了。两箱书比这沉。','smile')]}),
 gn_ye_ink:c=>({
  intro:[lm('ye','裴姑娘，想请你看一个字。','normal',IN),lm('pei','哪一个？','normal'),
   lm('ye','我娘留下的方子。这一味药的名字，墨洇开了，我认不出是“苓”还是“芩”。','serious'),lm('pei','……给我。别对着光，侧过来。','serious'),
   lm('pei','洇开之前，这一笔是往左收的。草头底下是“今”，不是“令”。','normal'),lm('ye','黄芩。','surprise'),lm('pei','你是大夫，这味药放在这个方子里通不通，你比我清楚。字我只能认到这里。','normal')],
  choices:[{key:'both',text:'说：一个认字，一个认药，正好',lines:[lm('hero','一个认字，一个认药。方子这不就对上了。','smile'),lm('ye','通的。和下面两味是一路。','smile'),lm('pei','那就不是我猜的了，是两头都对得上。','smile')]},
   {key:'careful',text:'提醒：只凭一笔，要不要再找别的方子对一对',lines:[lm('hero','只凭一笔的走向，稳吗？要不要找她娘别的方子对一对笔迹。','serious'),lm('pei','该对。我方才说得太快了。','worry'),lm('ye','箱子里还有三张。我去拿。','normal'),lm('pei','……三张里都是往左收。现在可以写“确认”了。','smile')]}],
  closing:[lm('ye','谢谢。往后还有认不出的，我再来。','smile'),lm('pei','来。你娘的字很好认，一笔是一笔。……写这种字的人，开方子也不会含糊。','normal'),lm('ye','……嗯。','smile')]}),
 gn_yin_book:c=>({
  intro:[lm('yin','知古！上回借的那本游记，下册呢？','fun',OUT),lm('pei','小师叔，您上册还没还。','normal'),
   lm('yin','上册我带出谷去了，落在江陵一家客店里。','fun'),lm('pei','……那是孤本。','sad'),lm('yin','咳。所以我这不是来赔罪了——酒，你爹能喝的那种。','worry'),
   lm('hero','（原来小师叔也有理亏的时候。）','fun')],
  choices:[{key:'mediate',text:'打圆场：问清是哪家客店，下回托人取回来',lines:[lm('hero','哪家客店？记下名字，下回有人去江陵，托他取回来。','normal'),lm('yin','城南，门口有棵歪脖子槐树。','normal'),lm('pei','城南、歪脖槐。我记下了。——小师叔，这回我写在您手背上。','serious'),lm('yin','……这丫头长大了，会治我了。','smile')]},
   {key:'watch',text:'不插话，看她们俩怎么了结',lines:[lm('pei','酒我替我爹收下。书的事另算。','normal'),lm('yin','怎么算？','worry'),lm('pei','您把那一路上看见的，讲给我听。讲够一册的量。','serious'),lm('yin','……成交。比赔书容易。','smile')]}],
  closing:[lm('yin','我走那年她才这么高，抱着一本比她脸还大的书，坐在门槛上不让我过。','smile'),lm('pei','因为您踩了我晾的纸。','normal'),lm('yin','十几年了还记着！','surprise'),lm('pei','有据才录。','smile')]}),
 gn_eyes:c=>({
  intro:[card('夜 · 溪东',NIGHT),lm('hero','这么晚了，灯还亮着。','normal',NIGHT),lm('pei','我爹睡了。我把他今天口授的那一段誊出来。','normal'),
   lm('hero','他自己不写了？','normal'),lm('pei','小字看不见了。他说一句，我写一句。写错了他也看不出来。','sad'),
   lm('pei','所以我不能写错。','serious'),lm('hero','从城里回来以后，你那本册子写了多少？','normal'),
   lm('pei','十一页。……比这部书我今年补的还多。我没敢让他知道。','worry')],
  choices:[{key:'tell',text:'“告诉他吧。他教你有据才录，不是教你瞒着。”',lines:[lm('hero','告诉他吧。他教你有据才录，没教你瞒着。','serious'),lm('pei','……他会觉得我不想补了。','sad'),lm('hero','你想补吗？','normal'),lm('pei','想。两样都想。我只是头一回，有一样是我自己的。','normal')]},
   {key:'wait',text:'“不急。等你写满一册，拿给他看。”',lines:[lm('hero','不急。等你写满一册，整本拿给他看。','normal'),lm('pei','整本。','surprise'),lm('hero','十一页是心思，一整册是东西。他是读书人，看东西。','smile'),lm('pei','……你有时候说话，像是比我大。','smile')]}],
  closing:[lm('pei','你过溪的时候踩第三块石头，那块不晃。','normal'),lm('hero','你怎么知道我每次都踩第二块。','surprise'),lm('pei','看的。我看人过溪，看了十四年。','smile'),lm('pei','明晚灯还亮着。你要是练功回来路过，喊一声。','normal')]}),
 gn_winter:c=>({
  intro:[lm('pei','萧白，来得正好。卷七，今天补完了。','smile',IN),lm('peishu','是她补完的。我只说了个大概，缺的那三处是她从别的书里对出来的。','smile'),
   lm('hero','补一卷要多久？','normal'),lm('pei','这一卷是两年四个月。','normal'),lm('hero','……全书多少卷？','surprise'),lm('pei','二十四卷。还差九卷。','normal'),
   lm('peishu','我这辈子是看不到了。她或许能。','normal')],
  choices:[{key:'celebrate',text:'“今天不算还差多少。今天算补完了一卷。”',lines:[lm('hero','今天不算还差多少。今天只算补完了一卷。','smile'),lm('peishu','这话说得好。知古，去把那坛子打开。','smile'),lm('pei','爹，那是小师叔赔书的酒。','normal'),lm('peishu','赔的就是这种时候喝的。','fun')]},
   {key:'ask_pei',text:'转头问她：你那本册子呢，今年写了多少',lines:[lm('hero','那你自己那本呢？','normal'),lm('pei','……','surprise'),lm('peishu','她那本我知道。夜里誊完我的，她还要再写半个时辰。','smile'),lm('pei','您知道？','surprise'),lm('peishu','我眼睛坏了，耳朵没坏。翻的不是同一本册子，纸声不一样。','smile')]}],
  closing:[lm('peishu','萧白，明年你们还出门的话，带上她。','normal'),lm('pei','爹——','worry'),lm('peishu','书在箱子里跑不了。人得出去走。这句是你高祖说的，我今天才算听懂。','smile'),lm('pei','……好。','smile')]}),
};
// 关系加成（剧情 id → 选项 → [[人名, 数值]…]）
const bonds={gn_lamp:{wade:[['裴知古',5]],count:[['裴知古',5]]},gn_words:{ask_on:[['裴知古',5]],read_on:[['裴知古',4]]},gn_chests:{restore:[['裴知古',6]],own:[['裴知古',7]]},gn_depart:{linear:[['裴知古',4]]},
 gn_dou_copy:{help:[['卢小豆',3],['裴知古',2]],tease:[['裴知古',3],['卢小豆',1]]},gn_terraces:{recall:[['裴知古',4],['江采薇',2]],recount:[['江采薇',3],['裴知古',3]]},gn_mill:{listen:[['裴知古',4]],doubt:[['裴知古',4]]},
 gn_ye_ink:{both:[['裴知古',3],['叶蘅',3]],careful:[['裴知古',4],['叶蘅',3]]},gn_yin_book:{mediate:[['裴知古',3],['殷红缨',2]],watch:[['裴知古',3],['殷红缨',3]]},gn_eyes:{tell:[['裴知古',7]],wait:[['裴知古',7]]},gn_winter:{celebrate:[['裴知古',4]],ask_pei:[['裴知古',5]]}};
const API={definitions,scripts,bonds,actors:{pei:'裴知古',peishu:'裴述'},moods:{pei:['normal','smile','serious','surprise','worry','sad','fun'],peishu:['normal','smile','serious','surprise','worry','sad','fun']}};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationNeighbors=API;
})(typeof globalThis!=='undefined'?globalThis:this);
