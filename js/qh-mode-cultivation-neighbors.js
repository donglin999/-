/* 谷中人家（2026-10-11）：归云谷院墙之外、山谷之内的三处——溪东半亩书屋（裴述、裴知古）、谷口梯田人家、溪上水碓房。
   设定见文档库 companions/pei-zhigu-valley.md；实现说明见 guiyun-household.md“谷中人家”一节。
   这些是“串门”：和门派里的闲逛分开算，每个时段另可遇一段（neighbor:true），不占门派闲逛的节奏。
   只遇一次；由 CultivationHousehold 合并进剧情引擎。佃农与守碓婆婆是普通人，不入队、不结缘、不做专属动作；需要时用现成的“乡邻”立绘说话（2026-10-21《替人写家书》的佃户老伯）。 */
(function(root){'use strict';
const lm=(speaker,text,mood,scene)=>({speaker,text,...(mood?{mood}:{}),...(scene||{})});
const card=(text,scene)=>({speaker:'title',text,...(scene||{})});
const D=(id,place,time,window,name,teacher,actor,cast,gain,amount,extra={})=>({id,place,time,window,name,teacher,actor,cast,gain,amount,neighbor:true,...extra});
const IN={place:'bookhouse_inside',time:'day'},OUT={place:'bookhouse',time:'day'},NIGHT={place:'bookhouse',time:'night'};

const definitions=[
 // —— 进城前（第一年正月–四月）：四段主干 ——
 D('gn_lamp','bookhouse','day',[4,11],'隔溪的灯','裴知古','pei',['pei','hero'],'observation',3,{notice:'夜里溪对岸有一盏灯亮到很晚。师母说，那是溪东裴先生家。'}),
 // 2026-10-21 按新人设重做的进城前知古线（人物卡第〇、三节）：书上的泉→照着书做的饭→替人写家书→六十年前的汉皋（gn_depart）。
 D('gn_spring','terraces','day',[5,11],'书上的泉','裴知古','pei',['pei','hero','goose'],'observation',3,{factRequires:['gn_lamp_seen'],factHint:'先去溪东认识裴家的人。'}),
 D('gn_cook','bookhouse_inside','day',[10,11],'照着书做的饭','裴知古','pei',['pei','hero','peishu'],'understanding',3,{factRequires:['gn_lamp_seen'],factHint:'先去溪东认识裴家的人。'}),
 D('gn_letter','terraces','day',[13,14],'替人写家书','裴知古','pei',['pei','hero','neighbor'],'understanding',3,{factRequires:['gn_lamp_seen'],factHint:'先去溪东认识裴家的人。'}),
 D('gn_depart','courtyard','day',[19,19],'六十年前的汉皋','裴知古','pei',['zhou','peishu','pei','hero','yin','shimu'],'understanding',2,{auto:true,neighbor:false,notice:'溪东裴家的姑娘要进城交抄稿，裴先生托师父路上照应。'}),
  // —— 进城之后（六–九月、十一–十二月）——
 D('gn_ye_ink','bookhouse_inside','day',[26,36],'方子上的字','叶蘅','ye',['ye','pei','hero'],'medical_notes',3,{quiet:true,requires:['joined','ye'],factRequires:['met_pei']}),
 D('gn_yin_book','bookhouse','day',[30,42],'借书的人','殷红缨','yin',['yin','pei','hero'],'observation',3,{quiet:true,factRequires:['gy_night_return_seen','met_pei']}),
 D('gn_eyes','bookhouse','night',[36,44],'父亲的眼睛','裴知古','pei',['pei','hero'],'understanding',4,{quiet:true,factRequires:['met_pei'],bottleneck:'裴知古'}),
 D('gn_winter','bookhouse_inside','day',[50,58],'抄完的那一卷','裴知古','pei',['pei','peishu','hero'],'understanding',3,{quiet:true,factRequires:['met_pei']}),
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
 // 2026-10-21 起新场次只在这里挂选项编号（结算见 bonds），台词唯一来源是文档库 chapter-two-dialogue.json 的 preHangao（编译为 qh-pre-hangao-data.js）。
 gn_spring:c=>({intro:[card('谷口',{place:'terraces',time:'day'})],choices:[{key:'old',text:'“一百多年了，干了也不奇怪。”',lines:[]},{key:'look',text:'伸手试试水',lines:[]}],closing:[]}),
 gn_cook:c=>({intro:[card('晌午 · 溪东',IN)],choices:[{key:'together',text:'“别倒，咱们一起把它救回来。”',lines:[]},{key:'teach',text:'“先搁着。我做一道，你看着。”',lines:[]}],closing:[]}),
 gn_letter:c=>({intro:[card('谷口 · 梯田',{place:'terraces',time:'day'})],choices:[{key:'ask',text:'“老伯，您想跟他说什么？”',lines:[]},{key:'plain',text:'“他识字吗？信是念给谁听的？”',lines:[]}],closing:[]}),
 gn_depart:c=>({
  intro:[card('四月底 · 出发前'),lm('peishu','周掌门，小女头一回出远门，路上劳烦照应。','worry'),lm('zhou','裴兄放心。跟着萧白他们走，路上有人。','smile'),
   lm('peishu','知古，抄稿交给东街的书铺，拿了钱先去配镜子，别又钻进旧书堆里出不来。','serious'),lm('pei','知道了。','normal'),
   lm('peishu','你方才答应的时候，眼睛在看萧白背上的包袱。','normal'),lm('pei','……他包袱上的结打得很怪。我在想是哪里的打法。','serious'),lm('hero','（那是鞋带结。）','worry')],
  choices:[{key:'linear',text:'',auto:true,lines:[lm('pei','我带了一本空册子。','normal'),lm('hero','记什么？','normal'),
   lm('pei',(c.pei?.chests==='own')?'记“后来呢”。从这一趟开始记。':'记路上看见的。书上没有的那些。','smile'),
   lm('peishu','……去吧。','smile')]}],
  closing:[lm('pei','萧白。我跟着你们走，不会添乱——大概不会。','normal'),lm('hero','添了再说。走吧。','smile')]}),
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
const bonds={gn_lamp:{wade:[['裴知古',5]],count:[['裴知古',5]]},gn_spring:{old:[['裴知古',5]],look:[['裴知古',5]]},gn_cook:{together:[['裴知古',5]],teach:[['裴知古',5]]},gn_letter:{ask:[['裴知古',5]],plain:[['裴知古',5]]},gn_depart:{linear:[['裴知古',4]]},
 gn_ye_ink:{both:[['裴知古',3],['叶蘅',3]],careful:[['裴知古',4],['叶蘅',3]]},gn_yin_book:{mediate:[['裴知古',3],['殷红缨',2]],watch:[['裴知古',3],['殷红缨',3]]},gn_eyes:{tell:[['裴知古',7]],wait:[['裴知古',7]]},gn_winter:{celebrate:[['裴知古',4]],ask_pei:[['裴知古',5]]}};
const API={definitions,scripts,bonds,actors:{pei:'裴知古',peishu:'裴述'},moods:{pei:['normal','smile','serious','surprise','worry','sad','fun'],peishu:['normal','smile','serious','surprise','worry','sad','fun']}};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationNeighbors=API;
})(typeof globalThis!=='undefined'?globalThis:this);
