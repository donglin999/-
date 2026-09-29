'use strict';
// ───────────────────────── 第一章：场景与剧情 ─────────────────────────
const MONK={name:'老僧',sp:'c_monk'};
// 旧档坐标迁移：取离旧坐标最近的旧地标 [旧c,旧r,新c,新r]，换到新地图同一地标（之后 placeFix 再吸附到可站点）
function nearMap(x,y,A){let b=A[0],bd=1e9;for(const a of A){const d=Math.hypot(a[0]*TS-x,a[1]*TS-y);if(d<bd){bd=d;b=a}}return[b[2]*TS,b[3]*TS]}
// v2（2026-09 S1，docs/design/02 §4.1）：48×27 格程序排布（tools_scene/build_scene.py temple）。坐北朝南：北墙神龛羊祜像、殿中篝火、南墙正中庙门；
// 主角在篝火西侧草铺上醒来。旧整图 m_temple 的存档坐标经 migrate 换算（mapv 1）。
SC.temple={name:'羊太傅庙',bg:'m_temple_v2',start:[17.25,19.3],startDir:'r',mapv:1,walk:[[1,9,46,25]],block:[],tint:'rgba(20,20,60,.12)',
  // 新开局也会走一次迁移（newState 没有 mapv）：起点草铺映射到自身
  migrate(x,y){return nearMap(x,y,[[17.25,19.3,17.25,19.3],[24,20.5,24,21.2],[23.5,19,22.2,20.6],[24,13.6,24,14],[24,24,24,24],[10,20,17.25,19.3],[38,20,33,20.6]])},
  fx(){embers(960,760)},
  npcs:[{id:'fire',name:'篝火',sp:null,x:24,y:20.1,verb:'烤火',async act(){await narr('火光跳动，暖意驱散了夜里的寒气。');const d=derived();S.hp=Math.max(S.hp,Math.round(d.mhp*.6))}},
    {id:'altar',name:'羊太傅神像',sp:null,x:24,y:13.8,verb:'参拜',async act(){
      if(hasFlag('pray')){await narr('神像默然。');return}setFlag('pray');
      await narr('这是纪念西晋名将羊祜的古庙。传说他镇守襄阳时，与敌将陆抗互赠药酒，为一时佳话。');
      const c=await choose('','要不要上一炷香？',['恭恭敬敬拜三拜','摸走供桌上的铜钱']);
      if(c===0){await moral(1)}else{S.silver+=8;await gain('银两 +8');await moral(-1)}}}],
  exits:[{r:[22,25,25,26],label:'出庙',to:'temple_out',at:[27,13.95],dir:'d',show:()=>hasFlag('awake')}],
  async enter(){if(hasFlag('awake'))return;setFlag('awake');
    await narr('南宋，景定元年。蒙古大军屯兵汉水之北，荆襄一带烽烟将起。');
    await narr('襄阳城外，一座破败的羊太傅庙里，篝火噼啪作响。');
    await say(S.name,'……又梦见那条青色的龙了。',HE('think'));
    await say('','庙外传来一声咳嗽——是收留你的老僧，他似乎在等你。')}};

// v2（2026-09 S1，docs/design/02 §4.1b）：54×30 格。岘山北麓：上方正中庙门台阶（回庙），西古井菜畦，东老僧药炉，石径向下出图（大地图）
SC.temple_out={name:'庙外空地',bg:'m_temple_out_v2',start:[27,13.95],startDir:'d',gw:54,gh:30,mapv:1,mapIn:[27.15,28.3],walk:[[1,10,52,29]],block:[],region:'temple',
  migrate(x,y){return nearMap(x,y,[[23.5,12,27,13.95],[14,17.8,14.7,19.2],[27,15.5,36,17.6],[24,24.5,27.15,28.3],[35,20,40,20],[10,22,12,22]])},
  fx(){smokeAt(1356,560)},
  npcs:[{id:'well',name:'古井',sp:null,x:14.7,y:18.45,verb:'探查',async act(){
      if(hasFlag('well')){await narr('井水幽深，再没什么了。');return}
      const c=await choose('','古井深不见底，井壁上长满青苔。隐约可见井底有金属反光。',['攀着井壁下去看看','算了']);
      if(c)return;
      if(S.st.agi>=6){setFlag('well');await narr('你手脚并用，轻巧地落到井底，摸到一柄锈迹斑斑的长剑。');await giveItem('rusty')}
      else{await narr('刚下去几尺，手一滑险些摔下去。（需要身法 6）');S.hp=Math.max(1,S.hp-10)}}},
    {id:'monk',...MONK,x:38.2,y:16.45,dir:'l',mark:()=>!hasFlag('spar'),async act(n){
    if(!hasFlag('spar')){
      await talk(n,`${S.name}，你在庙里住了也有些日子了。`,'老衲年轻时也算半个江湖人。今日便看看你的筋骨，来，与老衲过两招。');
      const r=await battle({bg:'bg_temple_out',foes:[{name:'老僧',sp:'c_monk',lv:3,st:{str:3,con:6,agi:3,wil:8,wis:6},skills:{palm_m:1},h:170}],tutorial:true,noLose:true});
      setFlag('spar');
      await talk(n,r==='win'?'好！好！后生可畏。':'不错，挨了老衲这几掌还能站着。','你既有这份根骨，老衲便传你一门功夫防身。');
      const c=await choose(n.name,'你想学拳，还是学剑？',['伏虎拳（拳法，连击率高）','柳叶剑法（剑法，需装备剑，可穿透）'],n.sp);
      await learn(c?'liuye':'fuhu');
      await talk(n,'这本残页也拿去，参悟透了，武功自会精进。');await giveItem('book');
      await talk(n,'山下便是襄阳城。如今城里不太平，听说黑风寨的强人连江上的渡船都敢劫。','你若要闯荡江湖，就从那里开始吧。记住——拳脚是用来护人的，不是用来欺人的。');
      S.unlocked.xiangyang=1;await toast('大地图已开启 · 可前往「襄阳城」',1800);return}
    const c=await choose(n.name,'阿弥陀佛。还有什么事？',['请大师为我疗伤','告辞'],n.sp);
    if(c===0){const d=derived();S.hp=d.mhp;S.mp=d.mmp;await talk(n,'（老僧为你推宫过血，你只觉浑身舒泰。）')}}}],
  exits:[{r:[25,10,28,11],label:'回庙',to:'temple',at:[24,24],dir:'u'},{r:[25,29,28,29],label:'下山 · 大地图',to:'map',dir:'d',show:()=>hasFlag('spar')}]};

// 襄阳城门
// 城门＝襄阳南门（城外一侧，城在画面北方）：从大地图（南来）向上走进门洞进城；从街市南大街向下出城即到此处门洞口（docs/design/02 §4.3）
// v2（2026-09 S1，docs/design/02 §4.3）：60×36 格。上方南门城楼（外侧）+ 城墙，门前窄坪；护城河横贯、吊桥居中；桥南头设卡盘查；官道向南、东西大路通左右
SC.gate={name:'襄阳城 · 南门',bg:'m_gate_v2',start:[30,33.5],startDir:'u',gw:60,gh:36,mapv:1,mapIn:[30,33.5],walk:[[0,15,59,35]],block:[],region:'xiangyang',
  migrate(x,y){return nearMap(x,y,[[23.5,14.2,30,16.65],[27,15.6,31,27.2],[23.5,24.5,30,33.5],[2,21,3,30.5],[45,21,57,30.5],[12,20,20,30.5],[35,20,42,30.5]])},
  npcs:[{id:'soldier',name:'守门军士',sp:'c_soldier',x:31.95,y:26.3,dir:'d',mark:()=>!hasFlag('gate_ok'),async act(n){
    if(hasFlag('gate_ok')){await talk(n,'进去吧，别惹事。');return}
    await talk(n,'站住！蒙古探子最近混进城里好几个，进城都得盘查。','你是哪里来的？');
    const c=await choose(n.name,'守卫上下打量着你。',['如实相告：住在城外羊太傅庙','塞给他 5 两银子','“军爷，蒙古人打来，你这样盘查挡得住吗？”'],n.sp);
    if(c===0){await talk(n,'羊太傅庙那个老和尚？他当年在城头救过不少弟兄。进去吧。');await moral(1)}
    else if(c===1){if(S.silver<5){await talk(n,'……你是来消遣我的？');return}S.silver-=5;await talk(n,'嘿，懂事。进去进去。');await moral(-1)}
    else{await talk(n,'……你这小子说话倒有几分道理。守城靠的是上下一心。','行了，进去吧。');S.st.wis++;await gain('悟性 +1')}
    setFlag('gate_ok')}}],
  exits:[{r:[27,35,32,35],label:'出城 · 大地图',to:'map',dir:'d'},{r:[0,29,0,32],label:'出城 · 大地图',to:'map',dir:'l'},{r:[59,29,59,32],label:'出城 · 大地图',to:'map',dir:'r'},{r:[29,14,30,15],label:'进城',to:'street',at:[22.5,37.2],dir:'u',show:()=>hasFlag('gate_ok')}]};

// 襄阳街市
// [上联, 正解下联, 干扰1, 干扰2, 三娘点评]
const COUPLETS=[['日月同辉照襄阳','山河共饮汉江水','一二三四五六七','风花雪月四时春','日月对山河，照襄阳对饮汉水，有气象！'],
  ['烟锁池塘柳','炮镇海城楼','花开满园香','雨打芭蕉响','五字偏旁暗藏金木水火土，这副古对你也对得上！'],
  ['二人土上坐','一月日边明','三水共成淼','四口合成田','拆字对拆字——「坐」对「明」，好心思。'],
  ['画上荷花和尚画','书临汉字翰林书','吃饭喝茶看戏台','上山打虎下海龙','倒着念也一样，回文对回文，妙极！']];
// 说书老伯：先讲一段，再问一题
const SHUSHU=[
  {title:'羊公镇襄阳',story:'三国末年，晋将羊祜都督荆州，坐镇襄阳。他与江对岸的吴将陆抗对峙多年，却彼此敬重。\n陆抗送来的酒，他举杯便饮，从不疑有毒；陆抗病了，他又差人送去良药。两军交界，竟成了一段佳话。',
   q:'这位坐镇襄阳、与陆抗互赠酒药的名将是谁？',opts:['羊祜','关羽','岳飞'],a:0,ok:'正是羊叔子！城南那座羊太傅庙，供的就是他老人家。',ng:'关、岳二位虽也与襄阳有缘，与陆抗互赠酒药的却是羊公。'},
  {title:'岘山堕泪',story:'羊公生前最爱登城南岘山，置酒吟咏，曾对僚属叹道：自有宇宙便有此山，登临者不知凡几，都湮没无闻了。\n他去世后，襄阳百姓在岘山上为他立碑，逢年过节来拜，望碑无不落泪。',
   q:'后人给岘山上这块碑起了个什么名儿？',opts:['无字碑','功德碑','堕泪碑'],a:2,ok:'对喽！堕泪碑——杜预取的名。百姓的眼泪，比碑还重。',ng:'见碑者无不落泪，所以叫堕泪碑。'},
  {title:'一江隔两城',story:'襄阳城北有条大江，自西北秦岭而来，绕城东去，到汉口汇进长江。南来的米粮、北来的皮货，全靠它一船一船地运。\n江北便是樊城，两城隔水相望，唇齿相依——樊城一失，襄阳也就难守了。',
   q:'把襄阳与樊城隔开的这条江，叫什么？',opts:['淮河','汉水','湘江'],a:1,ok:'不错！汉水汤汤，襄阳人喝着它长大。',ng:'淮河在北，湘江在南，绕着襄阳的是汉水。'}];
// 包打听的消息
const RUMORS=[
  {id:'heifeng',t:'黑风寨近况',p:10,tag:'要闻',tease:'城外山贼闹得凶，官府都头疼……想知道底细？',unlock:'大地图新增 · 东津渡',
   txt:'黑风寨寨主「独眼阎罗」近来劫了东津渡好几条商船，连官府的军粮都敢动。渡口有人替他接赃货，去东津渡或许能摸到他们的底。',
   on(){setFlag('rumor');S.unlocked.ferry=1}},
  {id:'fancheng',t:'樊城的探马',p:5,tag:'城防',tease:'城头的兵为何夜里也不下城墙？',
   txt:'北边的探马这个月已经三回摸到樊城外头。城防营正四处收铁器、招壮丁，街上铁匠铺的生意因此好得很——那老铁匠嘴上不说，心里乐着呢。'},
  {id:'yangmiao',t:'羊太傅庙的怪事',p:5,tag:'奇闻',tease:'城南那座破庙，半夜有人点灯……',
   txt:'城南羊太傅庙香火早断了，可近来总有人看见半夜庙里亮着火。有人说是守庙的老和尚念经，也有人说是游方的江湖客在那儿歇脚养伤。'},
  {id:'gaibang',t:'偏巷里的老叫化',p:5,tag:'江湖',tease:'偏巷那个讨饭的，可不是一般人。',
   txt:'偏巷里那个讨饭的老头，眼睛亮得吓人，巷里的地痞见了他都绕道走。据说是丐帮的一位长老——你若有心，拿个羊肉馒头去试试他的脾气。'}];
// v2（2026-09）：66×39 格（2640×1560 世界像素）程序排布地图，底图/素材图集/mask/props 由 tools_scene/build_scene.py 生成（见文件末 <scene:street> 块）。
// 北侧城墙 + 城门楼（门洞 = 去城门的出口），门内石板广场，东西大街（东端 = 偏巷），南排店铺 + 后巷。
// v3（2026-09，docs/design/02 §4.2）：画面北侧是北门与汉水（北门本章不开放，军士把守），南大街向下出图通南门（城门场景）
SC.street={name:'襄阳城 · 街市',bg:'m_street_v2',start:[22.5,37.2],startDir:'u',gw:66,gh:39,mapv:3,
  // 粗格仅作兜底；实际碰撞由精细 mask 决定
  walk:[[0,22,65,25]],block:[],region:'xiangyang',
  // 旧档（48×27 旧街市）坐标迁移：取最近的旧地标，换算到新地图同一地标旁（之后 placeFix 再吸附到可站点）
  migrate(x,y,v){if(v===2)return[x,y];   // v2→v3 只改了北门门洞与南大街出口，原地保留，由 placeFix 吸附
    const A=[[23.5,21,22.5,37.2],[34.1,17.9,61.5,24.8],[4.7,20.35,15.6,21.4],[26.35,15.05,49.6,24],[18.75,16.7,30,21.6],[21.1,19.3,33.9,19.2],[45.8,21.3,64,24],[23.4,25,22.5,37.2],[12,21,20,23.6],[38,21,50,23.6]];
    let b=A[0],bd=1e9;for(const a of A){const d=Math.hypot(a[0]*TS-x,a[1]*TS-y);if(d<bd){bd=d;b=a}}return[b[2]*TS,b[3]*TS]},
  fx(){motes()},
  npcs:[{id:'gossip',name:'包打听',sp:'c_gossip',x:61.5,y:23.85,dir:'l',verb:'打听',mark:()=>!hasFlag('rumor'),async act(n){
      S.rumors=S.rumors||{};if(hasFlag('rumor'))S.rumors.heifeng=1;
      if(!hasFlag('gossip_met')){setFlag('gossip_met');await talk(n,'哟，小兄弟面生得很，第一次进城？','我包打听的名号，襄阳城里谁人不知？江湖上的消息，只要你给得起价钱……')}
      else await talk(n,RUMORS.every(r=>S.rumors[r.id])?'我肚子里的货都倒给你啦，过些日子再来。':'又来照顾生意了？今儿个的消息，新鲜着呢。');
      const got=await rumorBroker(n,RUMORS);
      if(got.includes('heifeng'))await talk(n,'你要真有本事，去东津渡看看。路上当心野狼。');
      else if(got.length)await talk(n,'这消息可只卖给你一个人，嘘——');
      else if(!S.rumors.heifeng&&S.silver<10)await talk(n,'没钱？那就先去巷子里转转吧，听说丐帮的长老在那儿呢。');
      else await talk(n,'不买？那就回头再来，消息可不等人。')}},
    {id:'oldman',name:'说书老伯',sp:'c_oldman',x:15.6,y:20.05,dir:'d',verb:'听书',mark:()=>!hasFlag('quiz'),async act(n){
      if(hasFlag('quiz')){await talk(n,'呵呵，年轻人，多读书总没坏处。今儿讲的是岘山的故事，坐下听听？');return}
      await talk(n,'（醒木一拍）列位看官！今日老汉不讲那刀光剑影，讲讲咱襄阳的旧事。','这位小哥听得入神，老汉每讲一段便问你一句，答得上来，有赏！');
      await storyQuiz(n,SHUSHU,right=>{setFlag('quiz');const items=[];
        if(right===3){S.st.wis++;S.bag.book=(S.bag.book||0)+1;items.push('悟性 +1','武学残页 ×1');return{line:'好好好！全对！这卷残页是老汉年轻时的心得，送你了。',items}}
        if(right===2){S.bag.pill=(S.bag.pill||0)+1;items.push('金创药 ×1');return{line:'答对两题，不赖。这瓶金创药拿去，行走江湖用得着。',items}}
        return{line:`答对了 ${right} 题。回去多听听书吧，襄阳的故事，一辈子也讲不完。`,items}});
      }},
    {id:'smith',name:'铁匠',sp:'c_smith',x:49.65,y:22.9,dir:'d',verb:'买卖',async act(n){
      const first=!hasFlag('smith_met');setFlag('smith_met');
      await talk(n,first?'哟，生面孔！俺这铺子打了三十年铁，襄阳城里数一数二。':'又来啦？炉子正旺着呢，看看有啥合用的。',first?'刀剑、护甲、伤药，要啥有啥。旧东西也收，给你半价！':'');
      const r=await shop(n,['wood','iron','cloth','vest','shovel','pill','wine','bun']);
      const b=r.bought.map(k=>ITEMS[k]);
      if(b.some(i=>i.weapon))await talk(n,'好眼力！这口剑俺淬了七遍火，出去可别给俺丢人。');
      else if(b.some(i=>i.armor))await talk(n,'穿上它，寻常刀枪可伤不着你。');
      else if(r.bought.includes('shovel'))await talk(n,'铁铲拿好。城里城外，闪光的地方挖挖看，说不定有好东西。');
      else if(b.length)await talk(n,'拿好喽。路上当心，黑风寨的人可不讲理。');
      else if(r.sold.length)await talk(n,`这些旧货俺收了，回炉还能打几颗钉子。${r.earned} 两，一文不少。`);
      else await talk(n,'不买也来看看，俺这炉火不收钱。')}},
    {id:'lady',name:'柳三娘',sp:'c_lady',x:31.05,y:19.7,dir:'l',verb:'对对子',mark:()=>!hasFlag('couplet'),async act(n){
      if(hasFlag('couplet')){await talk(n,'哎哟，才子又来啦？三娘这儿的馒头管够！');return}
      await talk(n,'瞧你眉清目秀的，读过书没有？','三娘出四副上联，你都对得上，这笼羊肉馒头就送你！');
      await coupletGame(n,COUPLETS,right=>{setFlag('couplet');
        if(right>=3){S.bag.bun=(S.bag.bun||0)+5;return{line:'哎呀，是个才子！这笼馒头拿好，趁热吃！',items:['羊肉馒头 ×5']}}
        S.bag.bun=(S.bag.bun||0)+1;return{line:`对上 ${right} 副，差了点火候。给你一个尝尝吧。`,items:['羊肉馒头 ×1']}});
      }}],
  exits:[{r:[20,38,24,38],label:'南门',to:'gate',at:[30,16.65],dir:'d'},{r:[65,22,65,25],label:'偏巷',to:'alley',at:[1.6,20.4],dir:'r'}],
};

// 功能分区：西口—公井与大黄—吴长老；柴角、围栏鸡场、土地龛为短支路。
// 说书匣的泼皮在柴角，消息铺的藏银仍在土地龛（docs/design/xiangyang-alley.md）。
SC.alley={name:'襄阳城 · 偏巷',bg:'m_alley_v2',start:[1.6,20.4],startDir:'r',gw:60,gh:33,mapv:4,walk:[[0,19,59,23]],block:[],region:'xiangyang',tint:'rgba(80,40,0,.08)',
  migrate(x,y,v){if(v===4)return[x,y];
    if(v>=2&&y/TS>=19&&y/TS<=22.8)return[x,y];
    const A=[[23,24,1.6,20.4],[34.12,10.45,48.6,17.77],[37.65,17.85,30.3,17.77],[33,27,34.2,27.75],
      [3,29.4,6.97,28.73],[54.4,19.3,53.85,28.27],[17,14,48.6,17.77],[19,10.5,21.52,18.23],[31,24.5,34.2,27.75]];
    let b=A[0],bd=1e9;for(const a of A){const d=Math.hypot(a[0]*TS-x,a[1]*TS-y);if(d<bd){bd=d;b=a}}return[b[2]*TS,b[3]*TS]},
  npcs:[{id:'beggar',name:'丐帮 吴长老',sp:'c_beggar',x:48.6,y:17.77,dir:'l',async act(n){
      if(hasFlag('beggar_win')){await talk(n,'嘿嘿，小兄弟，丐帮荆襄分舵随时欢迎你。');return}
      await talk(n,'讨口饭吃哟～好心人赏几个铜板？');
      const c=await choose(n.name,'老乞丐伸出一只脏兮兮的手，眼神却精光四射。',['给他 5 两银子','给他一个羊肉馒头','“看你眼神不像乞丐，敢不敢比划比划？”','走开'],n.sp);
      if(c===0){if(S.silver<5)return talk(n,'你比我还穷啊！');S.silver-=5;await moral(1);await talk(n,'好心人！老叫化记住你了。')}
      else if(c===1){if(!S.bag.bun)return talk(n,'馒头呢？');S.bag.bun--;await moral(1);await talk(n,'香！好心有好报，教你一招保命的！');await learn('lianhua');setFlag('beggar_win')}
      else if(c===2){await talk(n,'哈哈哈，好小子，有胆色！');
        const r=await battle({bg:'bb_alley_v3',foes:[{name:'吴长老',sp:'c_beggar',lv:5,st:{str:6,con:6,agi:6,wil:6,wis:5},skills:{staff:1},h:170}],noLose:true});
        if(r==='win'){setFlag('beggar_win');await talk(n,'哎哟哟，老骨头要散了！这招「莲花落」教给你，算老叫化认栽。');await learn('lianhua')}
        else await talk(n,'嘿嘿，再练几年吧！')}}},
    {id:'rooster',name:'红冠将军',sp:'c_rooster',x:34.2,y:27.75,dir:'l',verb:'招惹',show:()=>!hasFlag('rooster'),async act(n){
      await narr('竹篱围出一方小鸡场，饲料篓倒在一边。红冠将军昂首守在鸡舍前，街坊们只敢从栏外看。');
      const c=await choose('','这鸡看起来……很不好惹。',['上前抓它','溜了溜了']);if(c)return;
      const r=await battle({bg:'bb_alley_v3',foes:[{name:'红冠将军',sp:'c_rooster',lv:6,st:{str:8,con:5,agi:12,wil:4,wis:6},skills:{peck:1},h:115}],noLose:true});
      if(r==='win'){setFlag('rooster');await narr('你按住了红冠将军！观它扑腾时的腿法，你竟若有所悟。');S.atkBonus+=5;await gain('攻击 +5（永久）');await learn('guafeng')}
      else await narr('你被啄得满头包，落荒而逃……')}},
    {id:'dog',name:'大黄狗',sp:'c_dog',x:30.3,y:17.77,dir:'l',verb:'喂食',show:()=>{petEnsure();return S.pet!=='dog'},async act(n){
      await narr('大黄蜷在井边屋檐下，身旁的水钵刚添过水。它望了望你手里的吃食，又退回阴影里。');
      if(!S.bag.bun){await narr('它嗅了嗅你，失望地耷拉下耳朵。（也许它想吃点什么）');return}
      const c=await choose('','要把羊肉馒头分给它吗？',['喂它一个羊肉馒头','算了']);if(c)return;
      S.bag.bun--;adoptPet('dog');await narr('大黄狗狼吞虎咽地吃完，摇着尾巴蹭你的腿，从此跟定了你。');await toast('大黄 成为同行宠物',1600)}},
    {id:'water_neighbor',name:'汲水妇人',sp:'c_lady',x:21.52,y:18.23,dir:'r',verb:'交谈',async act(n){
      const book=typeof QAPI!=='undefined'&&QAPI.get('q_book');
      if(book&&book.stage===1&&!book.done){await talk(n,'追书匣的？那歪帽泼皮从井旁跑过去，拐进西边柴角了。','我这桶水搁在道边，他差点一脚踢翻。');return}
      if(S.pet==='dog'){await talk(n,'大黄跟了你？这狗认人。井边那只水钵，我还给它留着。');return}
      await talk(n,'这口公井是几户人家一起用的。大黄常在檐下等着，谁有口余食便分它一点。','我给它添了水，光喝水终究填不饱肚子。') }},
    digSpot('alley1',6.97,28.73,async()=>{await narr('柴垛旁的土松了一块。你挖出一个小布包！');S.silver+=30;await gain('银两 +30')})],
  exits:[{r:[0,19,0,22],label:'街市',to:'street',at:[64.2,24],dir:'l'}]};

// 东津渡
// v2（2026-09）：60×33 格程序排布地图（tools_scene/build_scene.py ferry）：江面 + 码头 + 两条栈桥，西口土路接大地图
// 东津渡（原"东津渡"，docs/design/01 §5.3 #1、02 §4.5）：城东汉水渡头，江面在画面北侧，西口土路回城/大地图；场景 id 仍为 ferry
SC.ferry={name:'东津渡',bg:'m_ferry_v2',start:[1.65,25],startDir:'r',gw:60,gh:33,mapv:2,walk:[[0,16,59,30]],block:[],region:'ferry',tint:'rgba(120,50,0,.1)',
  migrate(x,y){const A=[[3,24.5,1.65,25],[20.5,11,19.65,6.4],[34,21,21.15,17.8],[30,17,30,17.6],[40,24,40,26]];
    let b=A[0],bd=1e9;for(const a of A){const d=Math.hypot(a[0]*TS-x,a[1]*TS-y);if(d<bd){bd=d;b=a}}return[b[2]*TS,b[3]*TS]},
  // 老船夫 = 汤老舵（喽啰事件后自报姓名）：渡江入口（01 §5.5 节拍 1）；支线「竹片暗记」「一船盐」由 quests.js 包装本 act
  npcs:[{id:'boatman',get name(){return hasFlag('ferry_ev')?'汤老舵':'老船夫'},sp:'c_boatman',x:19.65,y:5.3,dir:'d',mark:()=>hasFlag('ferry_ev')&&!hasFlag('bf_east')&&!hasFlag('chief_dead'),async act(n){
      if(!hasFlag('ferry_ev')){await talk(n,'唉……又来了，又来了。');return}
      if(hasFlag('chief_dead')){await talk(n,'恩公！江上太平了，老汉这条船随时载你！');return}
      if(hasFlag('bf_back')){await talk(n,S.unlocked.bandit?'寨子在城西南山里，从城外绕过去。恩公当心。':'……');
        const c=await choose(n.name,'还要过江？',['「再去一趟东岸。」','「不必了。」'],n.sp);if(c===0)await boardFerry();return}
      // 旧档（改版前喽啰事件即开放黑风寨、老船夫当面给过令牌与暗号）：不强制渡江，只提供过江
      if(S.unlocked.bandit&&!hasFlag('bf_east')&&!hasFlag('tang_told')){setFlag('tang_told');
        await talk(n,'寨子在城西南山里，暗号「风起云涌」，恩公记着。','对了——对岸芦苇荡里还有他们一个窝子，收钱、放哨的，管事的叫浪里鳅。恩公若想去看看，老汉载你。')}
      if(!hasFlag('tang_told'))await tangTell(n);
      const c=await choose(n.name,hasFlag('ferry_split')?'（汤老舵攥着船篙，不敢看你）……这就走？':'风大，坐稳了。这就走？',['「走，过江。」','「等我准备一下。」'],n.sp);
      if(c===0)await boardFerry();else await talk(n,'老汉就在船上等着。')}},
    {id:'bandits',name:'黑风寨喽啰',sp:'c_bandit',x:21.15,y:16.95,dir:'u',mark:()=>1,show:()=>!hasFlag('ferry_ev'),async act(n){
      await talk(n,'老东西，这个月的「过江钱」该交了！交不出来就把船拆了当柴烧！');
      await say('老船夫','好汉饶命！这月真没生意啊……','c_boatman');
      const c=await choose('','喽啰举起了刀。',['“住手！”（出手相助）','上前搭话：“这位大哥，分我一份如何？”','事不关己，走开']);
      // 01 §5.3 #15 / 05 §9.7：码头不出狼——喽啰×2 + 黑风水匪
      if(c===0){await talk(n,'哪来的愣头青？一起砍了！');
        const r=await battle({bg:'bb_ferry',foes:[mk('bandit'),mk('bandit'),mk('pirate')]});if(r!=='win')return;
        setFlag('ferry_ev');await moral(2);await say('老船夫','恩公！多谢恩公！','c_boatman');await giveItem('pill',2)}
      else if(c===1){setFlag('ferry_ev');setFlag('ferry_split');await moral(-3);S.silver+=40;await talk(n,'嘿，识相！这 40 两算你的。','这块令牌拿着——想吃这碗饭，过江找浪里鳅哥，他管着东岸的窝子。');await giveItem('token');
        await talk(n,'老东西，送这位兄弟过江！敢耍花样，拆你的船！');await say('老船夫','（老船夫绝望地看着你……）','c_boatman')}
      else{await narr('你转身离开，身后传来老人的哀求声……');await moral(-1);return}
      await tangTell(SC.ferry.npcs[0]);hud()}}],
  exits:[{r:[0,23,0,26],label:'大地图',to:'map',dir:'l'}],
  async enter(){if(!hasFlag('ferry_in')){setFlag('ferry_in');await narr('江风夹着水腥味扑面而来。码头上冷冷清清，只有一条渡船孤零零地靠在栈桥边。')}}};

// 黑风寨
// v2（2026-09 S1，docs/design/02 §4.6）：54×30 格。上方木寨墙 + 寨门（两座望楼夹门），门前夯土场（火盆、拒马），山道折向左下出图
SC.bgate={name:'黑风寨 · 寨门',bg:'m_bgate_v2',start:[15.9,28.05],startDir:'u',gw:54,gh:30,mapv:1,mapIn:[15.9,28.05],walk:[[1,11,52,29]],block:[],region:'bandit',tint:'rgba(0,10,30,.18)',
  migrate(x,y){return nearMap(x,y,[[12,24.5,15.9,28.05],[24,15,27.15,15.6],[8,21,11.6,22.4],[30,20,30,20],[20,17,22,17.5]])},
  // 寨门判定（01 §5.5 / §5.3 #16）：暗号+令牌 → 放行；只有令牌 → 放行；只有暗号 → "令牌呢？"硬闯；都没有 → 硬闯（守寨喽啰×2 + 寨犬×2）
  npcs:[{id:'guard',name:'守寨喽啰',sp:'c_bandit',x:28.8,y:14.7,dir:'d',mark:()=>1,show:()=>!hasFlag('gate_pass'),async act(n){
      await talk(n,'站住！什么人？！');
      const code=bfCode(),tok=!!S.bag.token,opts=[];
      if(code)opts.push('“风起云涌，自己人。”');if(tok)opts.push('亮出黑风令牌');opts.push('硬闯！');
      const c=await choose(n.name,'喽啰握紧了刀。',opts,n.sp);const o=opts[c];
      if(o.startsWith('“风起')){
        if(tok){await talk(n,'风起云涌……牌子呢？','（你亮出黑风令牌。喽啰凑到火盆边看了看令牌背面的浪纹。）','原来是自家兄弟，进去吧。');setFlag('gate_pass');return}
        await talk(n,'暗号倒是对的……令牌呢？','没令牌？东岸来的消息，最近有生面孔打听寨子——给我拿下！')}
      else if(o==='亮出黑风令牌'){await talk(n,'……浪里鳅那边的牌子？',code?'行，进去吧。':'暗号都不会对，令牌倒是真的。哼，进去吧，别乱走。');setFlag('gate_pass');return}
      const r=await battle({bg:'bg_bandit_gate',foes:[Object.assign(mk('bandit'),{name:'守寨喽啰',lv:5}),Object.assign(mk('bandit'),{name:'守寨喽啰',lv:5}),mk('gatedog'),mk('gatedog')]});if(r==='win')setFlag('gate_pass')}},
    digSpot('bgate1',10.8,22.5,async()=>{await narr('挖出了一坛埋着的好酒！');await giveItem('wine',2)})],
  exits:[{r:[13,29,17,29],label:'下山 · 大地图',to:'map',dir:'d'},{r:[26,11,27,12],label:'进寨',to:'cave',at:[27,27],dir:'u',show:()=>hasFlag('gate_pass')}]};

// v2（2026-09 S1，docs/design/02 §4.7）：54×30 格。北壁正中虎皮交椅高台（头目站位，台前空场作头目战区域），西聚饮长桌，东赃物 + 账桌 + 山川图，西南洞角巨蟒守箱，下方正中洞口
SC.cave={name:'黑风寨 · 山洞',bg:'m_cave_v2',start:[27,27],startDir:'u',gw:54,gh:30,mapv:1,walk:[[1,9,52,29]],block:[],region:'bandit',tint:'rgba(0,0,0,.15)',
  migrate(x,y){return nearMap(x,y,[[25.5,21.5,27,27],[24,15.2,27,15.4],[12,21,10.4,23.4],[35,16,40,16.5],[10,16,11,19.2]])},
  npcs:[{id:'snake',name:'青鳞巨蟒',sp:'c_snake',x:8.7,y:22.8,dir:'r',verb:'挑战',show:()=>!hasFlag('snake'),async act(){
      await narr('洞角盘着一条水桶粗的青鳞巨蟒，腥风扑面。它身后似乎有个箱子。');
      const c=await choose('','要惊动它吗？',['拔剑相向','悄悄退开']);if(c)return;
      const r=await battle({bg:'bg_bandit_cave',foes:[mk('snake')]});if(r!=='win')return;
      setFlag('snake');await narr('巨蟒轰然倒地。你剖出一枚墨绿色的蛇胆。');await giveItem('gall');await narr('箱子里还有一卷武学残页。');await giveItem('book')}},
    {id:'chief',name:'独眼阎罗',sp:'c_chief',x:27,y:14.25,dir:'d',mark:()=>1,show:()=>!hasFlag('chief_dead')&&!hasFlag('join_bandit'),async act(n){
      const evil=S.moral<=8;
      await talk(n,S.flags.xiangyang_slice?'哼，哪里来的外乡人，敢闯我黑风寨？':'哼，哪里来的小崽子，敢闯我黑风寨？');
      if(evil){const c=await choose(n.name,S.flags.xiangyang_slice?'……等等，你身上有股狠劲，老子喜欢。入伙如何？货路分你一份。':'……等等，你身上有股狠劲，老子喜欢。入伙如何？事成之后兵书的秘密分你一半。',['“好，我入伙。”','“我是来取你狗命的。”'],n.sp);
        if(c===0){setFlag('join_bandit');await moral(-5);await talk(n,'哈哈哈！好兄弟！先喝了这碗酒！');await ending('evil');return}}
      await talk(n,'不知死活！老子这把鬼头刀，今天又要见血了！');
      const r=await battle({bg:'bg_bandit_cave',foes:[mk('chief'),mk('bandit'),mk('bandit')],boss:true});if(r!=='win')return;
      setFlag('chief_dead');await talk(n,'你……你到底是什么人……');
      await narr(S.flags.xiangyang_slice?'独眼阎罗倒下时，一叠潮湿的货签从他怀中滑落。几张印着青虫纹样，记着渡口交货的日子。':'独眼阎罗倒下时，一卷泛黄的羊皮从他怀中滑落——上面画着一条盘踞的苍龙，与一只展翅的白鸟。');
      await giveItem('book');S.silver+=150;await gain('银两 +150');await ending('good')}}],
  exits:[{r:[25,29,28,29],label:'寨门',to:'bgate',at:[27.15,15.4],dir:'d'}]};

// ───────────────────────── 渡江：西岸码头 → 渡船 crossing → 东岸芦苇荡 ferry_e → 渡回（docs/design/01 §5.5，工作流 F）─────────────────────────
// 标记：ferry_ev 码头喽啰事件已了 · ferry_split 分赃 · tang_told 汤老舵说出暗桩 · tang_story 汤老舵讲过"斥候"往事 · cross_fight 江心截船已打（或亮令牌放行）
//       bf_east 东岸结果 fight 硬闯 | trick 智取 | spare 放过 | join 分赃者亮令牌入伙 · bf_code 知道暗号 · bf_trick 已冒充送例钱（可偷令牌）
//       bf_back 已从东岸渡回西岸 → 黑风寨在大地图开放（旧档：S.unlocked.bandit 已有则保持）
ASSETS.push('m_crossing_v2','m_crossing_v2_props','m_crossing_far','m_ferry_e_v2','m_ferry_e_v2_props');
Object.assign(ITEMS.token,{name:'黑风令牌',desc:'乌木腰牌，正面烙着「黑风」二字，背面刻一道浪纹。黑风寨的通行令牌——寨门只认牌子。'});
ITEMS.bf_note=ITEMS.bf_note||{name:'暗号纸条',desc:'从浪里鳅身上搜出的油纸条，歪歪扭扭写着四个字：风起云涌。背面画着一道浪纹。',key:1};
SKILLS.fanjiang=SKILLS.fanjiang||{name:'翻江刺',kind:'刀',mp:8,pow:1.3,range:1,shape:'single',combo:0,desc:'浪里鳅的分水刺，贴身连扎。'};
const TANG={name:'汤老舵',sp:'c_boatman'},LANGLI={name:'浪里鳅',sp:'c_langli'};
// 旧档：老船夫曾当面告诉过暗号（改版前 ferry_ev 即开放黑风寨），视为已知暗号
const bfCode=()=>hasFlag('bf_code')||(!!S.unlocked.bandit&&!hasFlag('bf_east')&&hasFlag('ferry_ev'));
const saltOn=()=>{const q=window.QAPI&&QAPI.get('q_salt');return!!q&&q.stage===1&&!q.done};
const needRaid=()=>!hasFlag('cross_fight')||saltOn();
const inParty=id=>(S.party||[]).includes(id)||(S.pet===id);
async function tangTell(n){if(hasFlag('tang_told'))return;setFlag('tang_told');n=n||TANG;
  if(hasFlag('ferry_split')){await say(TANG.name,'……是，是。老汉姓汤，码头上都叫我汤老舵。这就送、这就送。',TANG.sp);
    await narr('他们收的「过江钱」不往山里送——对岸芦苇荡里有个窝子，管事的就是那喽啰说的浪里鳅。');return}
  await say(TANG.name,'恩公……老汉姓汤，码头上都叫我汤老舵。',TANG.sp);
  await say(TANG.name,'这帮人收的「过江钱」，不往山里送。对岸芦苇荡里有他们的窝子——收例钱、接赃货、放哨，管事的叫浪里鳅。',TANG.sp);
  await say(TANG.name,'铁臂帮每月初一送来的钱，也是交到那儿。寨子的令牌、上山的暗号，都在浪里鳅手里。',TANG.sp);
  await say(TANG.name,'恩公要找黑风寨，得先过江。老汉这条船……豁出去了，送你过去。',TANG.sp);
  await toast('新目标 · 随汤老舵渡江，探东岸暗桩',1500);hud()}
async function boardFerry(){await narr('你跳上渡船。汤老舵一篙点开栈桥，船身一晃，离了岸。');
  await goScene('crossing',SC.crossing.start,'r')}
async function arriveEast(){await narr('芦苇越来越近，船底「沙」地擦上了泥滩。汤老舵把船拴在一截朽栈桥上。');
  await goScene('ferry_e',[23.2,7.2],'d')}
async function backWest(){await narr('汤老舵一篙撑开，渡船顺着风，一炷香工夫就回了西岸。');
  await goScene('ferry',[21.8,5.1],'r');busy=true;
  if(hasFlag('bf_east')&&!hasFlag('bf_back')){setFlag('bf_back');
    await say(TANG.name,'到了。寨子在城西南山里，从城外绕过去。恩公……当心。',TANG.sp);
    if(!S.unlocked.bandit){S.unlocked.bandit=1;await toast('大地图新增 · 黑风寨',1600)}
    await toast('新目标 · 前往黑风寨',1400)}
  hud();save()}

// ── 渡船 · 江心（crossing）：一屏短场景；底图只有船（江面透明），江面/远岸/水痕/快船由 under() 程序绘制，向西卷动（船在向东走）──
SC.crossing={name:'汉水 · 渡船',bg:'m_crossing_v2',start:[16.5,11.25],startDir:'r',gw:30,gh:18,mapv:1,walk:[[13,10,21,11]],block:[],region:'ferry',noFollow:true,tint:'rgba(150,70,30,.10)',birds:true,
  npcs:[{id:'boatman',...TANG,x:13.1,y:10.85,dir:'r',fixed:true,mark:()=>!hasFlag('tang_story'),async act(n){
      if(!hasFlag('tang_story')){setFlag('tang_story');
        await talk(n,'恩公头一回过江吧？这汉水看着平，底下的暗流能把人卷到樊城去。','老汉在这渡口撑了四十年船……二十年前，也是这么个起风的天，载过一个后生。');
        await talk(n,'披着蓑衣，腰里别着短刀，一路上一句话也不说。那双眼睛——像刀子，看你一眼，你心里就发毛。','到了对岸，他塞给老汉一锭银子，说：「今天没人过江。」老汉就当没人过江。');
        const c=await choose(S.name,'（汤老舵眯眼望着江北）',['「后来呢？」','「他是什么人？」']);
        if(c===0)await talk(n,'后来？后来江北打了好几年仗，老汉再没见过他。','只记得他站在船头看江的样子——不像看江，倒像在看一张图。');
        else await talk(n,'斥候吧。那年月，两边的斥候都在江上跑。','……恩公站船头那个架势，嘿，老汉眼花了。');
        if(needRaid()){await raid();return}return}
      if(needRaid()){await talk(n,'江心到了。……不对，芦苇湾里有动静。');await raid();return}
      await talk(n,hasFlag('cross_fight')?'水匪跑了。前头就是东岸，恩公到船头看看。':'快到了。')}},
    {id:'suzhi',get name(){return '苏芷'},get sp(){return SUZHI_SP()},x:20.6,y:10.6,dir:'u',show:()=>inParty('suzhi'),async act(){
      const L=hasFlag('cross_fight')?['……你肩膀绷得太紧。刚才那一下，差点扭了。','水匪的刀上没毒。还好。','（她望着东岸的芦苇）……像我小时候住的地方。']:['江上风大。站稳。','（她一只手按着药囊，指节发白）……我没事。','汤老舵的船，补过很多回。'];
      const i=(S.flags.sz_boat=(S.flags.sz_boat||0)+1)%L.length;await say(SZ.name,L[i],SZ.sp)}},
    {id:'dog',get name(){return typeof DOG!=='undefined'?DOG.name:'大黄'},sp:'c_dog',x:19,y:11.8,dir:'r',show:()=>inParty('dog'),async act(){
      await narr(hasFlag('cross_fight')?'大黄冲着北边的江面低低呜了一声，尾巴夹得紧紧的。':'大黄趴在船板上，耳朵贴着，一动不动。它不喜欢水。')}},
    {id:'merchant',name:'盐商',sp:'c_merchant',x:14.3,y:11.75,dir:'r',show:()=>saltOn(),async act(n){
      await talk(n,'几包盐压在舱里，一家老小的口粮全指着它了。好汉，江心那段，全靠你了！')}},
    {id:'bow',name:'船头',sp:null,x:21.3,y:11,verb:'靠岸',show:()=>!needRaid(),async act(){
      const c=await choose('','东岸的芦苇荡就在眼前。',['靠岸（上东岸）','再在船上待一会儿']);if(c===0)await arriveEast()}}],
  exits:[],
  async enter(){this._wait=0;this._raid=null;
    if(!hasFlag('cross_in')){setFlag('cross_in');await narr('船到江心，西岸的城墙渐渐只剩一道灰线。江风大了，浪头一下下拍着船帮。')}
    else await narr(saltOn()?'盐包压在舱里，船吃水深了一截。汤老舵的篙撑得格外小心。':'江面上风平浪静。')},
  // 未与汤老舵搭话、在船上待满 RAID_MS 也会遇截船（不让玩家卡在船上）；对话/菜单/战斗中不计时
  fx(t){const dt=Math.min(50,this._lt?t-this._lt:16);this._lt=t;
    if(needRaid()&&!this._raid&&mode==='scene'&&!busy&&!dlgBusy&&$('panel').hidden){this._wait=(this._wait||0)+dt;if(this._wait>30000){busy=true;raid().finally(()=>{busy=false;hud()})}}},
  under(t,dt){const F=this.far,im=F&&IMG[F.img],k=(F&&F.k)||3;this._ox=(this._ox||0)+dt*.055;this._fx=(this._fx||0)+dt*.012;
    g.fillStyle='#5c7a78';g.fillRect(0,0,WW,WH);if(!ok(im))return;g.imageSmoothingEnabled=false;
    const[wx,wy,ww,wh]=F.water,TW=ww*k,TH=wh*k,ox=-(this._ox%TW);
    for(let y=0;y<WH;y+=TH)for(let x=ox;x<WW;x+=TW)g.drawImage(im,wx,wy,ww,wh,Math.round(x),y,TW,TH);
    const[sx,sy,sw,sh]=F.strip,SW=sw*k,SH=sh*k,fo=-(this._fx%SW),hz=g.createLinearGradient(0,0,0,SH*.7);
    hz.addColorStop(0,'#c9b89a');hz.addColorStop(1,'#a8a89a');g.fillStyle=hz;g.fillRect(0,0,WW,SH*.7);
    for(let x=fo;x<WW;x+=SW)g.drawImage(im,sx,sy,sw,sh,Math.round(x),0,SW,SH);
    // 船影 + 船尾拖出的水痕（船向东走，水痕留在西边）
    const[bx,by,bw,bh]=this.boat||[210,348,780,186];g.fillStyle='rgba(20,34,40,.28)';g.beginPath();g.ellipse(bx+bw*.55,by+bh*.92,bw*.48,bh*.18,0,0,7);g.fill();
    g.fillStyle='rgba(235,242,236,.55)';for(let i=0;i<14;i++){const u=((t*.00018+i/14)%1),x=bx+bw*.14-u*420,y=by+bh*(.7+((i*37)%9)/40)+Math.sin(u*9+i)*3,w=Math.round((1-u)*30+6);
      g.globalAlpha=(1-u)*.7;g.fillRect(Math.round(x/3)*3,Math.round(y/3)*3,w,3)}g.globalAlpha=1;
    for(let i=0;i<6;i++){const y=by+bh*(.35+i*.1),x=bx+bw*.97+((t*.05+i*23)%18);g.globalAlpha=.45;g.fillRect(Math.round(x/3)*3,Math.round(y/3)*3,9,3)}g.globalAlpha=1;
    // 截船：两条快船从东北芦苇湾斜插过来，船上站着水匪
    const R=this._raid;if(R){R.t+=dt;const e=Math.min(1,R.t/2600),q=1-(1-e)*(1-e),[kx,ky,kw,kh]=F.skiffL,SKW=kw*k,SKH=kh*k;
      [[bx+bw*.62,by-SKH*.55,0],[bx+bw*.95,by-SKH*.15,500]].forEach(([tx,ty,d],j)=>{const ee=Math.max(0,Math.min(1,(R.t-d)/2600)),qq=1-(1-ee)*(1-ee),
        x=WW+80+(tx-WW-80)*qq,y=ty-160*(1-qq)+Math.sin(t/300+j)*3;g.drawImage(im,kx,ky,kw,kh,Math.round(x-SKW/2),Math.round(y-SKH/2),SKW,SKH);
        drawChar('c_bandit',x-SKW*.12,y+SKH*.18,'l',0,t,{moving:false});drawChar('c_bandit',x+SKW*.16,y+SKH*.12,'l',0,t,{moving:false})})}}};
async function raid(){const C=SC.crossing,salt=saltOn(),first=!hasFlag('cross_fight');C._raid={t:0};
  await narr('北边芦苇湾里，两条快船贴着水皮窜了出来，直奔渡船！');
  await say(TANG.name,'是黑风寨的水匪！……坐稳了！',TANG.sp);
  await wait(1800);
  if(first&&!salt&&hasFlag('ferry_split')&&S.bag.token){
    await say('水匪','哪条道上的？把船停——',LANGLI.sp);await narr('你把黑风令牌举过头顶。快船上的水匪愣了愣，骂骂咧咧地掉头钻回了芦苇。');
    setFlag('cross_fight');C._raid=null;await say(TANG.name,'……',TANG.sp);return}
  if(salt)await say('盐商','盐！他们是冲着盐来的！',SC.crossing.npcs.find(n=>n.id==='merchant').sp);
  const foes=first?[mk('pirate'),mk('pirate'),mk('pirate')]:[mk('pirate'),mk('pirate')];
  const r=await battle({bg:'bb_river',foes,noLose:true,intro:salt?'水匪跳上船，直扑舱里的盐包！':'水匪跳上了渡船！'});C._raid=null;
  if(r!=='win'){await narr('一篙子扫过来，你一头栽进江里。汤老舵拼死把你捞上船，掉头撑回了西岸。');const d=derived();S.hp=Math.max(S.hp,Math.round(d.mhp*.6));
    await goScene('ferry',[21.8,5.1],'r');return}
  setFlag('cross_fight');
  await say(TANG.name,first?'好、好身手！……这帮水匪，就是浪里鳅手底下的。东岸那窝子，快到了。':'又是他们。……恩公，谢了。',TANG.sp);
  if(salt&&window.onSaltEscort)await window.onSaltEscort();
  await toast('船头 · 可以靠岸了',1200)}

// ── 东津渡 · 东岸芦苇荡（ferry_e）：黑风暗桩。三种解法：硬闯 / 智取（持铁臂帮账簿）/ 放过（偷听暗号）；分赃者另可亮令牌"入伙" ──
async function fightLangli(n){
  await say(LANGLI.name,'找死！兄弟们，抄家伙！',LANGLI.sp);
  const r=await battle({bg:'bb_ferry',foes:[mk('langli'),mk('pirate'),mk('pirate')],noLose:true,intro:'浪里鳅抽出一对分水刺，水匪从芦苇里围了上来！'});
  if(r!=='win'){await narr('你被逼进了芦苇丛，泥水灌了一靴子。水匪没追进来——他们不知道你还有多少人。');const d=derived();S.hp=Math.max(S.hp,Math.round(d.mhp*.6));hud();return false}
  await narr('浪里鳅跪倒在泥里，分水刺扎进了烂泥。你从他腰间解下一块乌木腰牌，怀里还掉出一张油纸条。');
  if(!S.bag.token)await giveItem('token');await giveItem('bf_note');
  await narr('纸条上歪歪扭扭四个字：风起云涌。背面画着一道浪纹——和令牌背面的一样。');
  setFlag('bf_code');const was=S.flags.bf_east;setFlag('bf_east','fight');if(was!=='fight')await moral(1);
  await say(LANGLI.name,'你……你上了山也是送死……',LANGLI.sp);
  if(inParty('suzhi'))await say(SZ.name,'他的船，是新的。三条都是。',SZ.sp);
  await toast('新目标 · 回西岸（栈桥找汤老舵）',1500);hud();return true}
async function trickLangli(n){
  await say(LANGLI.name,'铁臂帮的？疤脸刘那厮怎么没来？',LANGLI.sp);
  const a=await choose(S.name,'（浪里鳅上下打量着你）',['「刘爷让城防营盯上了，这月我替他跑腿。」','「刘爷吃坏了肚子，拉得起不来。」']);
  if(a===0&&S.flags.xq_fate==='guard')await say(LANGLI.name,'……城防营？怪不得这几天没他的信儿。',LANGLI.sp);
  else if(a===1)await say(LANGLI.name,'哼，那厮嘴馋，活该。',LANGLI.sp);
  await say(LANGLI.name,'账呢？',LANGLI.sp);
  await narr('你把铁臂帮账簿递过去。浪里鳅翻了两页，粗手指在「例钱三成」那一行上点了点。');
  await say(LANGLI.name,'数是对的。钱呢？',LANGLI.sp);
  const opts=[];if(S.silver>=20)opts.push('如数奉上 20 两例钱');opts.push('「钱记在账上，下月初一一并送来。」（凭悟性糊弄）','「……钱在路上，让江上的水匪劫了。」');
  const c=await choose(S.name,'（得把这一关糊弄过去）',opts),o=opts[c];
  let ok2=false;
  if(o.startsWith('如数')){S.silver-=20;await gain('银两 -20');ok2=true}
  else if(o.startsWith('「钱记')){if(S.st.wis>=5){await say(LANGLI.name,'……账上倒是一笔一笔记着。疤脸刘这厮，倒会找人。',LANGLI.sp);ok2=true}}
  if(!ok2){await say(LANGLI.name,o.startsWith('「……钱在')?'劫了？江上的水匪就是老子的人！':'糊弄老子？！',LANGLI.sp);setFlag('bf_trick_fail');return fightLangli(n)}
  setFlag('bf_trick');setFlag('bf_code');
  await say(LANGLI.name,'行了，自家人。来，喝一碗！',LANGLI.sp);
  await narr('几碗烧酒下肚，浪里鳅的舌头就大了。');
  await say(LANGLI.name,'下回……下回上山交钱，别走错门。寨门口报「风起云涌」，再亮令牌——那帮看门狗，只认牌子……',LANGLI.sp);
  await say(LANGLI.name,'令牌？嘿……老子那块挂在棚里，谁敢偷……呼……',LANGLI.sp);
  await narr('他抱着酒坛子歪到了火塘边。窝棚的门帘半掀着。');
  if(inParty('suzhi'))await say(SZ.name,'……你演得太像了。',SE('angry'));
  await toast('窝棚 · 可以动手了',1200);hud()}
SC.ferry_e={name:'东津渡 · 东岸芦苇荡',bg:'m_ferry_e_v2',start:[23.5,7.4],startDir:'d',gw:54,gh:30,mapv:1,walk:[[1,8,52,11]],block:[],region:'ferry',tint:'rgba(150,70,30,.12)',
  dust:[[28,14,52,25]],dustC:'rgba(150,130,100,.5)',water:[[0,0,53,5]],birds:true,
  lights:[[1680,880,170,'255,140,50',2]],
  npcs:[{id:'boatman_e',...TANG,x:23.85,y:4.95,dir:'d',mark:()=>hasFlag('bf_east')&&!hasFlag('bf_back'),async act(n){
      const e=S.flags.bf_east;
      if(!e){const c=await choose(n.name,'恩公，事办完了？令牌、暗号都没到手，上了山也是白送命。',['「先回西岸。」','「再等等。」'],n.sp);if(c)return;await backWest();return}
      await talk(n,{fight:'恩公真把浪里鳅那伙人打散了？……东岸的渔户，往后能睡个安稳觉了。',trick:'令牌到手了？嘿，恩公这张嘴，比老汉的篙还灵。',
        spare:'只听了个暗号？……也罢，寨门那边，恩公多加小心。',join:'……（汤老舵一言不发，攥着船篙等你上船）'}[e]||'回吧。');
      const c=await choose(n.name,'回西岸？',['「回西岸。」','「再等等。」'],n.sp);if(c===0)await backWest()}},
    {id:'langli',...LANGLI,x:39,y:17.85,dir:'d',verb:'交谈',mark:()=>!hasFlag('bf_east')&&!hasFlag('bf_trick'),show:()=>S.flags.bf_east!=='fight'&&!hasFlag('bf_trick'),async act(n){
      const e=S.flags.bf_east;
      if(e==='join'){await talk(n,'兄弟，上了山替我给大当家带个好！');return}
      if(e==='spare'){const c=await choose(n.name,'……又是你？在芦苇里转悠什么？',['「来端你的窝。」（动手）','「走错路了。」'],n.sp);if(c===0)await fightLangli(n);return}
      await talk(n,'站住！哪条道上的？这芦苇荡不是你来的地方。');
      const opts=['「来端你的窝。」（动手）'];
      if(S.bag.ledger&&!hasFlag('bf_trick_fail'))opts.push('「铁臂帮的。给浪里鳅哥送例钱。」（冒充）');
      if(S.bag.token)opts.push('（亮出黑风令牌）「山上新入伙的兄弟。」');
      opts.push('「……走错路了。」');
      const c=await choose(n.name,'浪里鳅把一对分水刺在手里掂了掂。',opts,n.sp),o=opts[c];
      if(o.startsWith('「来端'))return fightLangli(n);
      if(o.startsWith('「铁臂帮'))return trickLangli(n);
      if(o.startsWith('（亮出')){await talk(n,'哈！寨里的新兄弟？……牌子是真的。','上山报「风起云涌」，再亮这块牌子，就没人拦你。');
        setFlag('bf_code');setFlag('bf_east','join');await moral(-1);await toast('新目标 · 回西岸（栈桥找汤老舵）',1500);hud();return}
      await talk(n,'走错了就滚远点！')}},
    {id:'langli_drunk',name:'浪里鳅（醉）',sp:'c_langli',x:40.5,y:23.85,dir:'l',verb:'查看',show:()=>hasFlag('bf_trick'),async act(){await narr('浪里鳅抱着酒坛子打呼噜，口水淌了一胡子。')}},
    {id:'eaves',name:'窝棚后墙',sp:null,x:39,y:11.4,verb:'偷听',show:()=>!hasFlag('bf_east')&&!hasFlag('bf_code'),async act(){
      await narr('你猫着腰贴到窝棚后墙，芦苇杆缝里透出火光和酒气。');
      await say('棚里的水匪','——明儿上山交货，暗号还是那句？','c_bandit');
      await say(LANGLI.name,'「风起云涌」。记住喽，光报暗号不顶用，还得亮令牌——寨门那帮狗东西，只认牌子。',LANGLI.sp);
      await say('棚里的水匪','令牌不就您手上那一块……',LANGLI.sp);await say(LANGLI.name,'少废话，喝酒！',LANGLI.sp);
      setFlag('bf_code');await toast('得知暗号 · 风起云涌',1400);
      const c=await choose(S.name,'（暗号到手了。令牌在浪里鳅身上——）',['悄悄退走，不惊动他们','绕到正面去，端了这窝子']);
      if(c===0){setFlag('bf_east','spare');await narr('你退回泥滩。棚里的笑骂声一点没停。');if(inParty('suzhi'))await say(SZ.name,'……他们明天还会收钱。',SZ.sp);
        await toast('新目标 · 回西岸（栈桥找汤老舵）',1500);hud();return}
      await fightLangli(SC.ferry_e.npcs.find(n=>n.id==='langli'))}},
    {id:'steal',name:'窝棚',sp:null,x:39.15,y:17.4,verb:'潜入',show:()=>hasFlag('bf_trick')&&!hasFlag('bf_east'),async act(){
      await narr('棚里一股鱼腥酒气。竹墙上挂着渔网、蓑衣，还有一块乌木腰牌，拴在一根红绳上。');
      const c=await choose('','（火塘边的呼噜声没停）',['摘下令牌，揣进怀里','算了']);if(c)return;
      if(!S.bag.token)await giveItem('token');setFlag('bf_east','trick');await toast('新目标 · 回西岸（栈桥找汤老舵）',1500);hud()}},
    {id:'loot_e',name:'赃货堆',sp:null,x:48.6,y:19.4,verb:'查看',async act(){
      await narr('油布底下是成捆的绸缎、几坛官窑酒，箱子上还贴着半张撕破的封条——是劫来的客货。浪里鳅攒够一船，夜里用快船偷运过江，再走陆路进山。')}}],
  exits:[],
  async enter(){if(!hasFlag('east_in')){setFlag('east_in');await narr('东岸的芦苇比人还高。泥滩上一串串脚印，都通往芦苇深处。');
    if(inParty('suzhi'))await say(SZ.name,'有烟。往里走。',SZ.sp)}},
  extras:[
    {sp:'bandit',mode:'stand',x:35.85,y:22.65,dir:'r',show:()=>S.flags.bf_east!=='fight',barks:['这月铁臂帮的钱又晚了。','火添旺点，冻死了。']},
    {sp:'bandit',mode:'stand',x:45.3,y:22.2,dir:'l',show:()=>S.flags.bf_east!=='fight',barks:['明儿夜里走一船货。','浪里鳅哥说了，生面孔一律扣下。']},
    {sp:'bandit',mode:'patrol',pts:[[45,11.4],[49.5,11.4]],show:()=>S.flags.bf_east!=='fight'&&!hasFlag('bf_trick'),barks:['江上没动静。','那条渡船怎么靠过来了？']}]};
SC.ferry_e.fx=function(){embers(1680,885);smokeAt(1680,860)};

function mk(k){const T={
  bandit:{name:'黑风喽啰',sp:'c_bandit',lv:3,st:{str:6,con:4,agi:4,wil:3,wis:3},skills:{blade:1},h:170,exp:25,silver:12},
  wolf:{name:'野狼',sp:'c_wolf',lv:3,st:{str:5,con:3,agi:8,wil:2,wis:3},skills:{bite:1},h:95,exp:18,silver:0},
  // 渡江（05 §9.7）：黑风水匪（bandit 精灵，身法高、盾 2，怕拳/棍/雷）、浪里鳅（东岸暗桩头目，精英）、寨犬（wolf 精灵）。数值沿用现行 mkFoe 公式，目标值见 05 §9.7  // TODO 数值待定（08）
  pirate:{name:'黑风水匪',sp:'c_bandit',lv:4,st:{str:5,con:4,agi:9,wil:3,wis:3},skills:{blade:1},h:170,exp:30,silver:8,shield:2,weak:['拳','棍','雷'],drops:{wine:15}},
  langli:{name:'浪里鳅',sp:'c_langli',lv:5,st:{str:8,con:7,agi:9,wil:4,wis:4},skills:{blade:1,fanjiang:1},h:180,hpMul:.6,exp:90,silver:24,shield:4,weak:['拳','棍','暗器','雷'],drops:{pill:100}},
  gatedog:{name:'寨犬',sp:'c_wolf',lv:5,st:{str:6,con:4,agi:10,wil:2,wis:3},skills:{bite:1},h:95,exp:22,silver:0,shield:2,weak:['棍','拳','阳']},
  snake:{name:'青鳞巨蟒',sp:'c_snake',lv:8,st:{str:10,con:12,agi:5,wil:6,wis:4},skills:{coil:1,bite:1},h:140,hpMul:.55,exp:120,silver:0},
  thug:{name:'铁臂帮打手',sp:'c_bandit',lv:2,st:{str:5,con:4,agi:3,wil:2,wis:2},skills:{blade:1},h:170,exp:20,silver:10},
  scarliu:{name:'疤脸刘',sp:'c_liu',lv:4,st:{str:8,con:6,agi:4,wil:4,wis:3},skills:{blade:1,ghost:1},h:180,hpMul:.6,exp:70,silver:30},
  chief:{name:'独眼阎罗',sp:'c_chief',lv:9,st:{str:12,con:11,agi:6,wil:8,wis:6},skills:{blade:1,ghost:1},h:200,hpMul:.6,exp:200,silver:0}}[k];return JSON.parse(JSON.stringify(T))}

async function ending(kind){
  await fade(async()=>{mode='end'});
  const p=$('panel');p.hidden=false;
  p.innerHTML=kind==='good'?`<h2>第一章 · 襄阳风云 · 完</h2><p>黑风寨一夜覆灭，东津渡重归太平。</p><p>那卷画着苍龙与白鸟的羊皮地图，将把你引向更广阔的江湖……</p><p style="color:var(--dim)">等级 ${S.lv} · 道德 ${S.moral} · 习得武学 ${Object.keys(S.skills).length} 门 · 同伴 ${S.party.length?S.party.map(m=>m==='suzhi'?'苏芷':m).join('、'):'无'} · 宠物 ${S.pet==='dog'?DOG.name:'无'}</p><button id="again">再入江湖</button>`
    :`<h2>第一章 · 落草 · 完</h2><p>你成了黑风寨的二当家。东津渡的百姓从此又多了一个要提防的名字。</p><p>羊皮地图上的苍龙与白鸟，在火把下显得格外刺眼……</p><button id="again">再入江湖</button>`;
  try{localStorage.removeItem('xjh.save')}catch(e){}
  $('again').onclick=()=>location.reload()}


// ───────────────────────── 场景氛围布置（路人 / 光源 / 粒子；纯表现，不影响剧情） ─────────────────────────
const B_XY=['听说蒙古人的探马都到樊城了……','襄阳城墙再厚，也得有人守啊。','吕制置的兵还守着城头呢。','今年的米价又涨了三文。','江湖上最近不太平，出门当心些。'];
Object.assign(SC.street,{
  // 光源（世界像素）：铁匠炉火 / 门内灯笼柱 / 酒楼灯笼
  lights:[[2034,830,190,'255,120,40',2.5],[936,606,70,'255,90,60'],[1704,606,70,'255,90,60'],[1110,1190,80,'255,100,60'],[1560,1190,80,'255,100,60']],
  fx(){motes();smokeAt(2046,560);embers(2034,830)},
  water:[[0,3,65,7]],birds:true,
  // 后院晾晒的布（[x,y,w,h,色,底边y] 世界像素；在大街南沿院墙以南，不会盖住街上的人）
  cloths:[[372,1062,22,40,'#3d4f7a',1116],[400,1062,22,40,'#a8452f',1116],[428,1062,22,40,'#e6dcc2',1116],[2382,1064,22,36,'#5e7a4a',1116],[2410,1064,22,36,'#c9a24a',1116]],
  extras:[
    // 守门的兵
    // 北门：两侧拒马当中留一条盘查通道，两名军士把着（北门外即汉水码头，本章不开放）
    {sp:'soldier',mode:'stand',x:31.9,y:15.4,dir:'d',barks:['北门只放码头挑夫和军需车。','蒙古探子，一个也别想混进来。']},
    {sp:'soldier',mode:'stand',x:34.1,y:15.4,dir:'d'},
    // 围着说书老伯听书的
    {sp:'villager',mode:'stand',x:13.5,y:22.3,dir:'u',barks:['后来呢？后来那羊太傅怎样了？','老伯，再讲一段！']},
    {sp:'child',mode:'stand',x:17.7,y:22.3,dir:'u',barks:['老伯，再讲一段羊太傅的故事！']},
    // 铁匠铺前的主顾
    {sp:'merchant',mode:'stand',x:48,y:23.5,dir:'u',barks:['这口刀，能便宜些不？','听说城防营在收铁器。']},
    // 菜摊 / 果摊的小贩
    {sp:'merchant',mode:'stand',x:38.85,y:16.7,dir:'d',barks:['新摘的菘菜，水灵着呢！']},
    // 茶棚的茶客 / 井边闲汉
    {sp:'villager',mode:'stand',x:23.8,y:20.8,dir:'r',barks:['三娘，再续一壶！','这茶，比樊城的香。']},
    // 巡街的兵
    {sp:'soldier',mode:'patrol',pts:[[5,24],[33,24],[63.5,24],[33,24]],barks:['都散开些，莫挡了道！','天黑前各自回家。']},
    // 跑来跑去的孩子
    {sp:'child',mode:'run',box:[26,16,42,21],barks:['嘿嘿，抓不着我！']},
    // 来往的行人
    {sp:'villager',mode:'wander',box:[24,15,42,21],barks:B_XY},
    {sp:'villager',mode:'wander',box:[4,23,62,24.6],barks:B_XY},
    {sp:'lady',mode:'wander',box:[30,36.8,60,37.6],barks:['胭脂铺今儿进了新货。','酒楼的桂花糕，一日只卖三十块。']}]});
// 场景互动点：北门、城门榜文；偏巷公井与土地龛。
SC.alley.npcs.push(
  {id:'well',name:'公井',sp:null,x:24.82,y:17.48,verb:'查看',async act(){await narr('井沿被水桶磨得发亮，旁边有一只旧水钵。街坊取水时顺手给大黄也添一瓢。')}},
  {id:'shrine',name:'土地龛',sp:null,x:53.85,y:28.27,verb:'查看',async act(){await narr('院墙边嵌着一方小小的土地龛，香炉里插着几根新香。街坊路过时会顺手添一炷。')}});
SC.street.npcs.push(
  {id:'north_gate',name:'北门',sp:null,x:33,y:14.4,verb:'查看',async act(){await narr('北门外就是汉水码头，对岸便是樊城。军士把着门洞，只放挂着号牌的挑夫和军需车出入。')}},
  {id:'notice',name:'城门榜文',sp:null,x:38.4,y:15.9,verb:'细看',async act(){await narr('榜文墨迹未干：「北岸游骑出没，凡生面孔入城，须验路引。有能告发细作者，赏钱五十贯。」')}});
// S1 重建场景的互动点（纯查看，不涉任务；02 §4.1/4.1b/4.3/4.7）
SC.temple.npcs.push(
  {id:'monk_chest',name:'旧木箱',sp:null,x:37.3,y:17.3,verb:'查看',async act(){await narr('矮几旁一只旧木箱，箱盖上压着几卷经书，箱角露出一截发黄的绢。老和尚从不让人碰这只箱子。')}});
SC.temple_out.npcs.push(
  {id:'stove',name:'药炉',sp:null,x:33.9,y:16.85,verb:'查看',async act(){await narr('炉上煨着一罐药，苦味里夹着一丝说不清的腥气。老和尚说是治咳嗽的老方子，一喝就是好些年。')}});
SC.gate.npcs.push(
  {id:'gate_arch',name:'城门洞',sp:null,x:30,y:16.2,verb:'查看',show:()=>!hasFlag('gate_ok'),async act(){await narr('门洞里的军士把长枪一横：“进城的，先到桥头验过路引！”')}},
  {id:'gate_notice',name:'城门榜文',sp:null,x:21.45,y:29.45,verb:'细看',async act(){await narr('榜上是制置司的军令：「战备期间，城门卯开酉闭；入城者须验路引、搜夹带。有能告发细作者，赏钱五十贯。」')}});
SC.cave.npcs.push(
  {id:'ledger',name:'账桌',sp:null,x:39.75,y:18.65,verb:'翻看',async act(){await narr('一本油腻的流水账：某日劫东津渡客船，某日截军粮三十石……每一笔后面都记着「柜上收」。收货的是谁，账上一个字没提。')}},
  {id:'hidemap',name:'山川图',sp:null,x:46.95,y:20.15,verb:'细看',async act(){await narr('木架上绷着一张牛皮，墨线勾着汉水两岸的渡口与小路，东津渡上画了个圈——这是他们劫船的路数。')}});
Object.assign(SC.alley,{
  birds:true,dust:[[0,18,59,23],[2,24,16,30]],
  fx(){motes()},
  extras:[
    {sp:'child',mode:'run',box:[27,19,35,22],barks:['大黄，来喝水！','娘，我去井边玩会儿。']},
    {sp:'villager',mode:'wander',box:[3,19.5,55,22],barks:['井边有人打水，慢些走。','吴老叫化又在檐下歇着呢。']}]});
Object.assign(SC.gate,{
  // v2（02 §4.3）：护城河（水面粼光 + 水鸭）、官道起尘；军士两人守门洞、两人在桥南头设卡；候验盐商与脚夫在路西，茶棚在路东
  dust:[[0,29,59,32],[27,25,32,35],[0,15,59,18]],water:[[0,19,59,24]],ducks:[[520,880,120,1000],[1760,900,1400,2300]],birds:true,
  extras:[
    {sp:'soldier',mode:'stand',x:27.9,y:16.65,dir:'d',barks:['进城的排好队！','蒙古探子，一个也别想混进去。']},
    {sp:'soldier',mode:'stand',x:32.1,y:16.65,dir:'d'},
    {sp:'soldier',mode:'stand',x:28.05,y:26.3,dir:'r',barks:['路引拿出来！','车上盖的什么？掀开看看。']},
    {sp:'soldier',mode:'patrol',pts:[[5,30.6],[24,30.6]],barks:['城头的弩都上好弦了。']},
    {sp:'merchant',mode:'stand',x:16.95,y:29.7,dir:'r',barks:['这一车盐，可别让山贼劫了去。','验个路引，排了半个时辰。']},
    {sp:'villager',mode:'stand',x:18.75,y:29.55,dir:'l',barks:['听说北边又在打仗……','进城要查路引，麻烦得很。']},
    {sp:'oldman',mode:'stand',x:44.7,y:29.75,dir:'l',barks:['候验的客官，喝碗凉茶吧。']},
    {sp:'villager',mode:'patrol',pts:[[30.2,28.4],[30.2,18],[30.2,28.4],[40,30.8]],barks:B_XY},
    {sp:'villager',mode:'wander',box:[36,29.6,56,31.8],barks:B_XY},
    {sp:'child',mode:'run',box:[40,33,52,34.3]}]});
Object.assign(SC.ferry,{
  tint:'rgba(150,60,20,.12)',dust:[[0,17,59,30]],water:[[0,2,59,14]],birds:true,
  ducks:[[600,420,200,700],[1200,560,900,1300],[1900,300,1450,2250]],
  extras:[
    {sp:'villager',mode:'stand',x:48.8,y:23.9,dir:'r',barks:['这批货得赶在天黑前装船。','嘿——哟！再加把劲！']},
    {sp:'merchant',mode:'stand',x:50.8,y:23.9,dir:'l',barks:['船钱又涨了，这世道……','黑风寨的人一来，谁还敢出船？']},
    {sp:'villager',mode:'patrol',pts:[[3,25],[20,20.5],[33,17.5],[44,17.6],[33,17.5],[20,20.5]],barks:['扛完这趟就能吃饭了。']},
    {sp:'oldman',mode:'stand',x:32.8,y:24.9,dir:'l',barks:['喝口茶再赶路吧。']},   // 茶棚老汉：站在棚子东侧炉边，不站进桌凳里
    {sp:'child',mode:'run',box:[8,22,24,28],barks:['快看，江里有鸭子！']}]});
Object.assign(SC.bgate,{
  // v2（02 §4.6）：夜；两只火盆夹着寨门，场东草棚里的喽啰偷喝酒，巡哨沿寨墙走
  dark:'rgba(8,10,28,.54)',tint:null,dust:[[11,12,44,20],[13,17,30,29]],birds:true,dustC:'rgba(190,170,120,.5)',
  lights:[[954,500,220,'255,140,50',2],[1212,500,220,'255,140,50',2],[1566,610,110,'255,160,80',.6]],
  fx(){embers(954,490);embers(1212,490);smokeAt(954,470)},
  extras:[
    {sp:'bandit',mode:'stand',x:36.6,y:17.4,dir:'l',show:()=>!hasFlag('gate_pass'),barks:['这火盆再不添柴就灭了。','大当家今晚又要喝酒。']},
    {sp:'bandit',mode:'patrol',pts:[[18,15.8],[24,16.2],[18,15.8],[14,17]],show:()=>!hasFlag('gate_pass'),barks:['哪来的毛头小子？滚远点！','渡口那批货，油水不少。']}]});
Object.assign(SC.cave,{
  // v2（02 §4.7）：交椅两侧火盆是主光源，洞口透进一点月光；喽啰在西边长桌喝酒、东边看着赃物
  dark:'rgba(0,0,6,.58)',tint:null,dust:true,dustC:'rgba(160,140,110,.45)',heroLight:170,
  lights:[[876,450,310,'255,140,50',2],[1284,450,310,'255,140,50',2],[372,585,120,'255,190,110',.5],[696,860,220,'255,140,50',2],[1080,1170,170,'140,160,255',0]],
  fx(){embers(876,440,'#ff9040');embers(1284,440,'#ff9040');embers(696,850);smokeAt(696,790)},
  extras:[
    {sp:'bandit',mode:'stand',x:7.2,y:18.3,dir:'u',show:()=>!hasFlag('chief_dead'),barks:['再满上！今儿个痛快！','嘘……大当家在歇着。']},
    {sp:'bandit',mode:'stand',x:11.7,y:18.3,dir:'u',show:()=>!hasFlag('chief_dead')},
    {sp:'bandit',mode:'stand',x:40.5,y:14.8,dir:'l',show:()=>!hasFlag('chief_dead'),barks:['这些箱子里可都是好东西。']},
    {sp:'bandit',mode:'patrol',pts:[[34,21],[42,23.5]],show:()=>!hasFlag('chief_dead'),barks:['听说洞里那条蟒又饿了……']}]});
Object.assign(SC.temple,{
  // v2（02 §4.1）：夜。篝火是主光源；北墙两扇破棂窗、东北角屋顶漏洞、南面庙门透进冷色月光；老僧矮几上一盏油灯
  dark:'rgba(8,10,34,.62)',tint:null,heroLight:100,
  lights:[[960,735,500,'255,140,50',2.5],[1392,606,90,'255,190,110',.8],[1668,470,170,'150,170,255',0],[504,440,130,'150,170,255',0],[1413,440,130,'150,170,255',0],[960,1050,150,'150,170,255',0]],
  fx(){embers(960,700);smokeAt(960,640)},
  // 序章首屏（02 §4.1）：新开局镜头先停在神龛（火光映着羊公像），旁白后缓缓下移到篝火边醒来的主角
  intro:{at:[960,470],hold:2200,pan:2600,when:()=>!hasFlag('awake')}});
Object.assign(SC.temple_out,{
  // v2（02 §4.1b）：夜。庙门里透出篝火光，老僧药炉的炭火、石径两侧石灯；落叶、萤火
  dark:'rgba(12,16,48,.46)',dust:[[8,12,46,22],[25,22,29,29]],leaves:true,
  lights:[[1356,612,170,'255,140,50',2],[954,846,80,'255,200,120',.4],[1212,846,80,'255,200,120',.4],[1080,400,150,'255,150,60',1.5]],
  fx(){embers(1356,600);smokeAt(1356,580);leaves();fireflies()}});


// ───────────────────────── 街市剧情：青蚨散（苏芷入队） ─────────────────────────
// 阶段 S.flags.xq：0 未触发 · 1 查访 · 2 可对质 · 3 已夺解药 · 4 已救人待定去留 · 5 苏芷同行
// 线索 xq_c_gossip / xq_c_lady / xq_c_oldman（任二即可对质）；xq_pay 替三娘交钱 · xq_fate spare|guard|rob · xq_decline 婉拒同行
// 好感 S.aff.suzhi（旧存档缺省按 0 起算）
Object.assign(ITEMS,{
  jieyao:{name:'青蚨散解药',desc:'从疤脸刘怀里搜出的小瓷瓶，瓶底刻着一只青虫。',key:1},
  ledger:{name:'铁臂帮账簿',desc:'「例钱三成，每月初一送东津渡，交黑风寨」——字迹潦草，油渍斑斑。',key:1}});
window.COMPANIONS=Object.assign(window.COMPANIONS||{},{suzhi:{name:'苏芷',sp:'c_suzhi',role:'医师'}});
const SUZHI_SP=()=>ok(IMG.c_suzhi_d)||ok(IMG.c_suzhi_d_0)?'c_suzhi':'c_lady';
const XQ=()=>+(S.flags.xq||0);
const xqSet=v=>{if(XQ()<v)S.flags.xq=v};
const clues=()=>['gossip','lady','oldman'].filter(k=>hasFlag('xq_c_'+k)).length;
function affOf(id){S.aff=S.aff||{};return S.aff[id]||0}
function aff(d,id='suzhi'){S.aff=S.aff||{};S.aff[id]=clamp((S.aff[id]||0)+d,-10,20);return gain(`苏芷 好感 ${d>0?'+':''}${d}`)}
const SZ={get name(){return '苏芷'},get sp(){return SUZHI_SP()}};
const SE=e=>SZ.sp+':'+e,HE=e=>'c_hero:'+e;   // 带表情的立绘 sp
const LIU={name:'疤脸刘',sp:'c_liu'},ZHOU={name:'老周',sp:'c_zhou'};
async function clueGot(k,txt){setFlag('xq_c_'+k);await toast(`线索 · ${txt}`,1500);
  if(clues()>=2&&XQ()<2){xqSet(2);await narr('线索已经够了。疤脸刘每到申时，都会去柳三娘的茶摊「收例钱」。');await toast('新目标 · 去茶摊找疤脸刘',1500)}
  hud()}

// 任务提示：HUD 左上 & 江湖 · 任务
function questLine(){if(!S)return'';if(S.flags.xiangyang_slice&&hasFlag('join_bandit'))return'';const x=XQ();
  if(x===0)return'街心似乎出了什么事，去看看';
  if(x===1)return`查访毒的来历（线索 ${clues()}/2）`;
  if(x===2)return hasFlag('xq_c_smith')||S.weapon?'去柳三娘茶摊，找疤脸刘对质':'去柳三娘茶摊找疤脸刘（可先去铁匠铺备些行头）';
  if(x===3)return'把解药交给苏芷';
  if(x===4&&!hasFlag('xq_decline'))return'（可选）再去和苏芷说说话';
  if(hasFlag('chief_dead'))return'';
  // 渡江（01 §5.5）
  if(hasFlag('bf_back')||(S.unlocked.bandit&&hasFlag('ferry_ev')))return S.scene==='bgate'||S.scene==='cave'?'闯黑风寨，找独眼阎罗':'前往黑风寨（城西南山中）';
  if(hasFlag('bf_east'))return'回西岸（东岸栈桥找汤老舵）';
  if(S.scene==='ferry_e')return'探黑风暗桩：拿到令牌与暗号';
  if(S.scene==='crossing')return'渡江：随汤老舵去东岸';
  if(hasFlag('ferry_ev'))return'找汤老舵渡江，去东岸芦苇荡';
  if(S.scene==='street'||S.scene==='alley'||S.scene==='gate')return'出城，前往东津渡';
  if(S.scene==='ferry')return'码头上好像有人在闹事';
  return'追查铁臂帮与黑风寨的勾连';}
function questLog(){const x=XQ(),L=[];const it=(done,t,d)=>L.push({done,t,d});
  if(!x)return[{done:false,t:'襄阳街市',d:'街心围了一圈人，不知出了什么事。'}];
  it(x>=2,'青蚨散',`挑夫老周当街中毒倒地，一位游方女医替他施针续命。毒名「青蚨散」，寻常人弄不到。`);
  const c=[['gossip','包打听：老周不肯给铁臂帮交例钱'],['lady','柳三娘：疤脸刘碰过老周的茶碗'],['oldman','说书老伯：下毒的人，解药多半随身带着']];
  it(x>=2,'查访线索',c.map(([k,t])=>(hasFlag('xq_c_'+k)?'✔ ':'· ')+(hasFlag('xq_c_'+k)?t:'？？？')).join('<br>'));
  if(x>=2)it(x>=3,'茶摊对质','疤脸刘申时会去柳三娘的茶摊收钱。解药多半在他身上。');
  if(x>=3)it(x>=4,'救人',`夺回了解药${S.flags.xq_fate==='guard'?'，疤脸刘被押去了城防营':S.flags.xq_fate==='rob'?'，顺手摸走了他的钱袋':'，放了疤脸刘一条生路'}。把药交给苏芷。`);
  if(x>=4)it(x>=5,'同行',x>=5?'苏芷答应与你同行。她认得青蚨散的气味，却不肯说从何处认得。':'苏芷还留在街心照看老周。');
  if(x>=5)it(hasFlag('chief_dead'),'顺藤摸瓜','账簿上写着：例钱三成，每月初一送东津渡，交黑风寨。');
  // 渡江（01 §5.5）
  if(hasFlag('ferry_ev')){it(hasFlag('bf_east'),'过江',hasFlag('ferry_split')?'分了喽啰的「过江钱」，喽啰叫汤老舵送你过江找浪里鳅。':'汤老舵说：收钱的不在寨里，在东岸芦苇荡的暗桩，管事的叫浪里鳅。寨子的令牌、上山的暗号，都在他手里。');
    if(hasFlag('bf_east'))it(hasFlag('bf_back'),'东岸暗桩',{fight:'打散了浪里鳅一伙，搜出黑风令牌和写着暗号的纸条。',trick:'冒充铁臂帮送例钱，灌醉浪里鳅，摸走了令牌，也套出了暗号。',
      spare:'躲在窝棚后听到了暗号「风起云涌」，没有惊动他们。令牌还在浪里鳅手里。',join:'亮出令牌，浪里鳅当你是新入伙的兄弟，告诉了你暗号。'}[S.flags.bf_east]||'');
    if(hasFlag('bf_back')||S.unlocked.bandit)it(hasFlag('chief_dead'),'黑风寨',`寨子在城西南山里。${S.bag.token?'令牌在手':'没有令牌'}，${bfCode()?'知道暗号「风起云涌」':'不知道暗号'}。`)}
  return L}
window.questLine=questLine;window.questLog=questLog;

// 街心：倒地的老周 + 苏芷
SC.street.npcs.push(
  {id:'zhou',name:'倒地的挑夫',sp:'c_zhou',x:33.9,y:17.85,dir:'l',verb:'查看',show:()=>XQ()<4,mark:()=>XQ()===0,async act(n){
    if(XQ()===0){
      await narr('人群让开一道缝。一个挑夫打扮的汉子倒在地上，嘴唇乌青，手指抽搐。');
      await say('围观的闲汉','刚才还好好的，喝完茶走到这儿就栽了！','c_merchant');
      await say('素衣女子','让一让。',SZ.sp);
      await narr('一旁的素衣女子一言不发地蹲下身，三根金针无声落进汉子颈侧。汉子喉头一松，吐出一口黑水。');
      const c=await choose(S.name,'（她手很稳。你——）',['蹲下帮她按住挑夫','问她：「他还有救吗？」','「别是讹人的吧……」']);
      if(c===0){await say(SZ.name,'按住肩。别松。',SZ.sp);await aff(2);await moral(1)}
      else if(c===1)await say(SZ.name,'有。半日。',SZ.sp);
      else{await say(SZ.name,'讹人不会吐黑水。',SE('angry'));await say('围观的闲汉','噗——','c_merchant');await aff(-1)}
      await say(SZ.name,'青蚨散。',SZ.sp);
      await say(S.name,'那是什么毒？',HE('think'));
      await say(SZ.name,'……街上买不到的毒。',SE('worry'));
      await narr('她抬眼看了你片刻，像在掂量什么。');
      await say(SZ.name,'针只能压半日。解药，得找下毒的人要。',SE('worry'));
      await say(SZ.name,'我叫苏芷。你若肯帮，就去问问——他是谁，得罪了谁。',SE('smile'));
      xqSet(1);setFlag('suzhi_met');await toast('新目标 · 查访毒的来历',1500);hud();return}
    if(XQ()>=3){await say(ZHOU.name,'……水……',ZHOU.sp);await narr('他还醒不过来。苏芷在等你的药。');return}
    await narr('挑夫双目紧闭，胸口起伏微弱。颈侧的金针随呼吸轻轻颤动。');}},
  {id:'suzhi',get name(){return XQ()?'苏芷':'素衣女子'},get sp(){return SUZHI_SP()},x:32.25,y:17.7,dir:'r',verb:'交谈',show:()=>XQ()<5,mark:()=>XQ()===3||XQ()===4,async act(n){
    const x=XQ();
    if(x===0){await say('素衣女子','……',SZ.sp);await narr('她正低头看着地上的挑夫，没有理你。');return}
    if(x===1||x===2){
      const c=await choose(SZ.name,x===1?'……有消息了？':'找到了？',['「还没有，再去打听打听。」','「你看起来不像寻常大夫。」','「饿不饿？我这有馒头。」'],SE('worry'));
      if(c===0)await say(SZ.name,clues()?'嗯。快些。':'街上消息最灵的，是那个嘴碎的。',SZ.sp);
      else if(c===1){await say(SZ.name,'……是寻常大夫。',SE('shy'));await narr('她低头去看针，不再说话。')}
      else if(S.bag.bun){S.bag.bun--;await narr('她犹豫了一下，接过馒头，掰了一半塞进老周嘴边，又把另一半收进袖里。');await say(SZ.name,'……多谢。',SE('shy'));if(!hasFlag('xq_bun')){setFlag('xq_bun');await aff(1)}}
      else await say(SZ.name,'你没有馒头。',SE('angry'));
      return}
    if(x===3){
      await narr('你把小瓷瓶递过去。苏芷拔开塞子闻了闻，眉心极轻地一动。');
      await say(SZ.name,'……是它。',SE('surprise'));
      await narr('药灌下去不到一炷香，老周咳出一大口黑血，睁开了眼。');
      await say(ZHOU.name,'我、我这是……阎王爷不收？',ZHOU.sp);
      await say(SZ.name,'收的。我没让。',SE('smile'));
      await say(ZHOU.name,'恩公！女菩萨！小的给二位磕头——',ZHOU.sp);
      const c=await choose(S.name,'（老周抖抖索索摸出一串铜钱）',['「留着买药吧。」','「那我就收下了。」']);
      if(c===0){await moral(1);await aff(1)}else{S.silver+=15;await gain('银两 +15');await say(SZ.name,'……',SE('angry'))}
      S.bag.jieyao=0;xqSet(4);
      await narr('人群散了。苏芷收好金针，把那只空瓷瓶翻过来，盯着瓶底的青虫看了很久。');
      await recruit();return}
    if(x===4){await say(SZ.name,'还有事？',SZ.sp);await recruit(true)}}},
  {id:'liu',name:'疤脸刘',sp:'c_liu',x:27.9,y:21.1,dir:'r',verb:'对质',show:()=>XQ()===2,mark:()=>1,async act(n){await confront()}},
  {id:'thug1',name:'铁臂帮打手',sp:'c_bandit',x:26.2,y:21.25,dir:'r',verb:'搭话',show:()=>XQ()===2&&!hasFlag('xq_w1'),async act(n){
    await say(n.name,'看什么看？找我们刘爷说话去。',n.sp)}});

async function recruit(again){
  if(!again){
    await say(SZ.name,'这瓶子，是我师门的东西。',SE('worry'));
    const q=await choose(S.name,'（她说完这句便不再开口）',['「你的师门？」','（不追问，等她自己说）']);
    if(q===0){await say(SZ.name,'……以前的。',SE('worry'));await narr('她显然不打算多讲。')}
    else{await narr('你没有问。她似乎松了口气。');await aff(1)}
    await say(SZ.name,'账簿上写着东津渡。我要去。',SZ.sp)}
  const c=await choose(SZ.name,'你呢？',['「一起走吧。路上有个大夫，我也放心些。」','「我这人打架常受伤，你跟着正好。」','「各走各的吧，后会有期。」'],SE('smile'));
  if(c===2){setFlag('xq_decline');await say(SZ.name,'好。',SZ.sp);await narr('她转身去收拾药箱，背影很直。');hud();return}
  await say(SZ.name,c===0?'……嗯。':'那你少受些。我针不多。',SE(c===0?'shy':'smile'));
  if(c===1)await say(S.name,'（她这是……在说笑？）',HE('surprise'));
  S.party=S.party||[];if(!S.party.includes('suzhi'))S.party.push('suzhi');S.flags.xq=5;delete S.flags.xq_decline;hud();
  await aff(affOf('suzhi')>=3?1:2);
  await toast('苏芷 加入队伍',1800);
  if(!S.unlocked.ferry){S.unlocked.ferry=1;await toast('大地图新增 · 东津渡',1600)}
  await say(SZ.name,'走吧。',SE('smile'));hud();save()}

async function confront(){
  await narr('茶摊前，一个脸上带疤的汉子正把脚架在条凳上，两个膀大腰圆的打手一左一右。柳三娘攥着围裙，脸色发白。');
  await say(LIU.name,'三娘，这个月的例钱，拖了三天了啊。',LIU.sp);
  await say(LIU.name,'哎，别用那眼神看我。这叫「例钱」，不叫抢。抢是黑风寨干的——我们铁臂帮，正经帮派！',LIU.sp);
  const ev=clues()>=2;
  const c=await choose(S.name,'（该怎么办？）',[ev?'当众揭穿：「老周的毒，是你下的。」':'「老周的毒，是你下的吧？」','「三娘欠的钱，我替她交。」（20 两）','（撸起袖子）「废话少说。」'],HE('angry'));
  if(c===1){
    if(S.silver<20){await say(LIU.name,'就你？兜比脸还干净。',LIU.sp);return}
    S.silver-=20;setFlag('xq_pay');await gain('银两 -20');
    await say(LIU.name,'哟，还有替人出头的冤大头！兄弟们，喝酒去！',LIU.sp);
    await narr('两个打手嘻嘻哈哈地走了。疤脸刘数着银子，正要起身——');
    await say(SZ.name,'解药。在他左边袖袋里。',SE('battle'));
    await say(LIU.name,'……哪来的小娘皮？',LIU.sp);await moral(1);setFlag('xq_w1')}
  else if(c===0){
    if(ev){await narr('你把包打听的话、三娘看见的事，一桩桩摆在众人面前。围观的街坊交头接耳，看疤脸刘的眼神都变了。');
      await say(LIU.name,'放、放屁！给我打！',LIU.sp);await moral(1)}
    else await say(LIU.name,'证据呢？没证据就滚！',LIU.sp)}
  else{await say(LIU.name,'嘿，是个愣头青。正好，爷爷手痒！',LIU.sp)}
  if(!hasFlag('xq_w1')){
    const r=await battle({foes:[mk('thug'),mk('thug')],bg:'bg_street',noLose:true,intro:'铁臂帮打手围了上来！'});
    if(r!=='win'){await lost();return}
    setFlag('xq_w1');await say(LIU.name,'废物！看爷爷的铁臂功！',LIU.sp)}
  await narr('苏芷不知何时已站到你身侧，袖中金针微光一闪。');
  await say(SZ.name,'我也去。',SE('battle'));
  const tmp=!(S.party||[]).includes('suzhi');if(tmp)S.party.push('suzhi');
  let r;try{r=await battle({foes:[mk('scarliu'),mk('thug')],bg:'bg_street',boss:true,noLose:true,intro:'疤脸刘抡起铁臂，扑了上来！'})}
  finally{if(tmp)S.party=S.party.filter(m=>m!=='suzhi')}
  if(r!=='win'){await lost();return}
  await narr('疤脸刘跪倒在地，捂着胳膊直哼哼。你从他袖袋里摸出一只小瓷瓶，和一本油腻的账簿。');
  S.bag.jieyao=1;S.bag.ledger=1;await gain('获得 青蚨散解药 · 铁臂帮账簿');
  await say(LIU.name,'好汉饶命！毒……毒是上头给的，我就是个跑腿的！',LIU.sp);
  const f=await choose(S.name,'（怎么处置他？）',['「滚。再让我看见你收钱，打断另一条胳膊。」','把他押去城防营','「钱袋留下，人滚。」'],HE('angry'));
  if(f===0){S.flags.xq_fate='spare';await say(LIU.name,'谢好汉！谢好汉！',LIU.sp);await moral(1);await aff(1)}
  else if(f===1){S.flags.xq_fate='guard';await say('巡街兵丁','铁臂帮的？正愁抓不着把柄。这是赏钱，拿着。','c_soldier');S.silver+=20;await gain('银两 +20');await moral(2)}
  else{S.flags.xq_fate='rob';S.silver+=35;await gain('银两 +35');await moral(-2);await say(SZ.name,'……',SE('angry'));await aff(-2)}
  await say('柳三娘','小兄弟，今儿这茶三娘请了！往后来，一律不收钱！','c_lady');
  xqSet(3);hud()}
async function lost(){await narr('你被打得眼冒金星。苏芷把你拖到檐下，一针扎醒。');await say(SZ.name,'再来。',SE('worry'));const d=derived();S.hp=Math.max(S.hp,Math.round(d.mhp*.6));hud()}

// 包打听 / 柳三娘 / 说书老伯 / 铁匠：在原有互动前插入查访分支
(()=>{const N=id=>SC.street.npcs.find(n=>n.id===id);
  const gs=N('gossip'),ga=gs.act,gm=gs.mark;gs.mark=()=>(XQ()===1&&!hasFlag('xq_c_gossip'))||gm();
  gs.act=async function(n){if(XQ()>=1&&XQ()<3&&!hasFlag('xq_c_gossip')){
      await talk(n,'哟，打听街心那档子事？嘘——小点声。');
      const c=await choose(n.name,'这消息烫手，十两银子。',['给他 10 两','「五两。多一文我去问说书的。」','「街坊一场，赊着？」']);
      if(c===0){if(S.silver<10){await talk(n,'……没钱装什么阔少。');return}S.silver-=10;await gain('银两 -10')}
      else if(c===1){await talk(n,'五、五两？你这人……行行行，就当交个朋友。');if(S.silver<5){await talk(n,'五两都没有？！去去去。');return}S.silver-=5;await gain('银两 -5')}
      else{await talk(n,'赊？我包打听做了二十年买卖，头一回有人跟我赊消息。','……算了，你那眼神怪可怜的。这回白送，下不为例！')}
      await talk(n,'倒下那个叫老周，码头挑夫，老实人一个。','铁臂帮的疤脸刘管这片收例钱，老周脾气倔，连着三个月一文不给。','前天疤脸刘还放话：「不给钱，就给命。」——你说巧不巧？');
      await clueGot('gossip','老周不肯给铁臂帮交例钱');return}
    return ga.call(this,n)};
  const la=N('lady'),laa=la.act,lm=la.mark;la.mark=()=>(XQ()===1&&!hasFlag('xq_c_lady'))||lm();
  la.act=async function(n){if(XQ()>=1&&XQ()<3&&!hasFlag('xq_c_lady')){
      if(!hasFlag('couplet')){await talk(n,'老周？……三娘心里乱得很。','你先陪三娘对几副对子，让我定定神。');await laa.call(this,n)}
      await talk(n,'（压低声音）老周倒下前，就在三娘这儿喝的茶。','疤脸刘也在。他端起老周的碗看了一眼，又放下了——我当时只当他找茬……');
      const c=await choose(n.name,'小兄弟，这话你可千万别说是我讲的。他们今天还要来收钱……',['「三娘放心，今天我在。」','「你怎么不早报官？」']);
      if(c===0){await talk(n,'……哎。有你这句话，三娘这壶茶也泡得踏实些。');await moral(1)}
      else await talk(n,'报官？城防营管蒙古人都管不过来，谁管咱们卖茶的。');
      await clueGot('lady','疤脸刘碰过老周的茶碗');return}
    if(XQ()>=3&&!hasFlag('xq_tea')){setFlag('xq_tea');await talk(n,'哎哟，恩人来了！坐坐坐，这壶雨前是三娘的心意。');const d=derived();S.hp=d.mhp;S.mp=d.mmp;await gain('气血内力 回满');return}
    return laa.call(this,n)};
  const om=N('oldman'),oa=om.act,omm=om.mark;om.mark=()=>(XQ()===1&&!hasFlag('xq_c_oldman'))||omm();
  om.act=async function(n){if(XQ()>=1&&XQ()<3&&!hasFlag('xq_c_oldman')){
      if(!hasFlag('quiz')){await talk(n,'问毒？先听书，听完再说。');await oa.call(this,n)}
      await talk(n,'青蚨散？嘿，好名字。','老汉给你讲个古：南方有种虫叫青蚨，母子分不开。拿母虫的血涂了钱花出去，那钱夜里自己会飞回来。','起这名儿的人，意思是——欠的，总要还。','所以呀，这毒不是乱下的，是讨债的。讨债的人，解药从来揣在自己怀里，好拿来谈价钱。');
      await clueGot('oldman','下毒的人，解药多半随身带着');return}
    return oa.call(this,n)};
  const sm=N('smith'),sa=sm.act;sm.mark=()=>XQ()===2&&!hasFlag('xq_c_smith');
  sm.act=async function(n){if(XQ()===2&&!hasFlag('xq_c_smith')){setFlag('xq_c_smith');
      await talk(n,'铁臂帮？哼，那帮孙子上月来俺这儿打了四副铁护臂，到今儿还欠着账！','你要去找他们麻烦？好！俺这儿的东西，今天给你便宜——啊不，价钱照旧，但俺在心里给你喝彩！')}
    return sa.call(this,n)};
})();

// 同伴闲谈（ENGINE 在玩家与跟随同伴交谈时调用）
window.onCompanionTalk=async function(id){
  if(id==='dog'){await say(typeof DOG!=='undefined'?DOG.name:'大黄','汪！',typeof DOG!=='undefined'?DOG.sp:'c_dog');return}
  if(id!=='suzhi')return;
  const d=derived(),sc=S.scene,a=affOf('suzhi');
  if(S.hp<d.mhp*.5&&!hasFlag('sz_heal_'+sc)){setFlag('sz_heal_'+sc);await say(SZ.name,'你伤了。别动。',SE('worry'));S.hp=Math.min(d.mhp,S.hp+Math.round(d.mhp*.35));await gain('苏芷为你施针 · 气血回复');hud();return}
  const L=[];
  if(hasFlag('chief_dead'))L.push('……结束了？','青蚨散，不是黑风寨能配的。','（她望着江面，许久没有说话）');
  else if(sc==='street'||sc==='alley')L.push(S.flags.xq_fate==='rob'?'那钱袋……你留着吧。别再这样了。':'老周能挑担了。好。','柳三娘的茶，太甜。','包打听多收了你钱。我看见了。');
  else if(sc==='gate')L.push('城外的路，我走过。','往东，渡口。');
  else if(sc==='ferry')L.push('江风太湿，伤口不易好。当心些。','账簿上说，初一交钱。','船夫的手在抖。他怕。');
  else if(sc==='ferry_e')L.push(S.flags.bf_east==='fight'?'他们的船，是新的。三条都是。':'芦苇里有人。不止一个。','这里的鱼腥味底下……有血。','泥里的脚印，往东去的多，往西来的少。');
  else if(sc==='bgate'||sc==='cave')L.push('这里有药味。和那只瓶子一样。','……我的师门，在很远的地方。',a>=4?'若我有一日不告而别——别找。':'小心。');
  else if(sc==='temple'||sc==='temple_out')L.push('这庙里的老僧，气色不好。我留了方子。','很静。');
  else L.push('……嗯。');
  if(a>=5&&!hasFlag('sz_white')){setFlag('sz_white');await narr('她低头理针包。你第一次看清针尾刻着的东西——一只振翅的白鸟。');await say(SZ.name,'……别问。',SE('shy'));return}
  const i=(S.flags.sz_i=(S.flags.sz_i||0)+1)%L.length;await say(SZ.name,L[i],SZ.sp)};

// <scene:street> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.street,{gw:66,gh:39,bg:'m_street_v2',propImg:'m_street_v2_props',propK:3,mask:{w:330,h:195,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAB///gAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+H/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+H/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+H/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+H+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+H+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH//8AAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAH////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////+AAAAAAH////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////+AAAAAAH////+H/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////+AAAAAAH///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////+AAAAAAH///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAB4AAP////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAB4AAP////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAB4AAP////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAB4AAP////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAB4AAP////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////////////////////+AAAAAAAAAAAAAAAAAAAP//////////////////////////////////+AP///////+Af///////P//////////////////////////////////+AP///////+Af///////AAf////////////////////////////////+AP///////+Af///////AAf////////////////////////////////////////////////////AAf////////////////////////////////////////////////////AAf////////////////////////////////////////////////////AAf////////////////////////////////////////////////////AAf////////////////////////////////////////////////////AAf////////////////////////////////////////////////////P//////////////////////////////////////////////////////P//////////////////////////////////////////////////////AAAAB//////////////////////////////////////////////////AAAAB//////////////////////////////////////////////////AAAAB//////////////////////////////////////////////////AAAAB//////////////////////////////////////////////////AAAAB//////////////////////////////////////////////////AAAAB//////////////////////////////////////////////////AAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAH/////////////////////////////////////////////////////4H/////////////////////////////////////////////////////4H/////////////////////////////////////////////////////4H/////////8AAB////////////////////////gAAf////////////4H/////////8AAB////////////////////////gAAf//gf////////4H/////////8AAB////////////////////////gAAf//gf////////4AB///gB///8AAB////////////////////////gAAf//gf////////4AB///gB///8AAB////////////////////////gAAf//gf////////4AB///gB///8AAB////////////////////////gAAf////////////4AB///gB///8AABw///////////////////////gAAf///////////4YAB///gB///8AABw///////////////////////gAAf///////////4YAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="},
  props:[[0,0,376,197,756,3,522],[754,198,59,81,582,279,522],[814,198,59,81,408,279,522],[874,198,59,81,234,279,522],[934,198,59,81,60,279,522],[0,311,59,81,-114,279,522],[60,311,59,81,1881,279,522],[120,311,59,81,2055,279,522],[180,311,59,81,2229,279,522],[240,311,59,81,2403,279,522],[300,311,59,81,2577,279,522],[91,393,24,18,84,1068,1122],[994,311,22,22,255,1056,1122],[212,393,16,16,594,1068,1116],[350,393,22,15,675,1077,1122],[229,393,22,16,1035,1056,1104],[252,393,22,16,1701,1074,1122],[373,393,18,15,1791,1071,1116],[392,393,22,15,1917,1077,1122],[116,393,24,18,2280,1068,1122],[275,393,16,16,2424,1068,1116],[0,393,22,22,2517,1056,1122],[0,198,116,112,450,450,714],[383,198,104,99,906,507,804],[415,393,44,13,480,831,870],[460,393,44,13,648,831,870],[515,311,50,43,1590,591,720],[421,311,48,53,1584,711,870],[709,0,132,124,24,522,894],[117,198,134,111,1782,561,894],[488,198,136,88,2208,630,894],[842,0,136,113,12,1119,1458],[592,0,116,126,438,1080,1458],[377,0,214,144,1014,1026,1458],[252,198,130,100,1668,1158,1458],[625,198,128,83,2244,1209,1458],[360,311,60,59,768,423,600],[470,311,44,45,1722,465,600],[742,311,30,27,1500,705,786],[292,393,36,16,1374,708,756],[773,311,26,27,1497,537,618],[836,311,30,25,1149,567,642],[867,311,30,25,1401,567,642],[929,311,11,23,918,573,642],[941,311,11,23,1686,573,642],[800,311,17,27,1188,507,588],[818,311,17,27,1404,507,588],[329,393,20,16,2202,870,918],[141,393,24,18,1722,858,912],[898,311,30,25,12,891,966],[23,393,40,20,6,966,1026],[953,311,40,23,108,963,1032],[670,311,44,36,642,1434,1542],[619,311,50,41,1830,1413,1536],[566,311,52,42,510,1410,1536],[166,393,18,18,2121,1464,1518],[185,393,26,18,252,1482,1536],[715,311,26,35,2547,1437,1542],[64,393,26,20,15,1482,1542]]});
// </scene:street>








// <scene:alley> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.alley,{gw:60,gh:33,bg:'m_alley_v2',propImg:'m_alley_v2_props',propK:3,mask:{w:300,h:165,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//////////gAAAAAAAf//wAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AP//////gAAAAAAAf//wAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AP//////gAAAAAAAf//wAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AP//8D//gAAAAAAAf//wAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AP//8D//gAAAAAAAf//wAAAAAAAAAAAAAAAAAAAAAAAAAAAGAGAP//8D//gAAAAAAAf//wAAAAAAAAAAAAAAAAAAAAAAAAAAAGAGAP//8D//gAAAAAAAf//wAAAAAAAAAAAP//////8B///////+AGAP//8D//////////+AA///////8AAAAP//////8B///////+AH////////////////+AA////////gAAAP//////8B///////+AH////////////////+AA////////gAAAP//////8B///////+AH////////////////+AA////////gAAB////////////////+AH/////////////////////////////4B///////////////////////////////////+B///////////4B///////////////////////////////////+B///////////4B////////////////////////////////////////////////4B////////////////////////////////////////////////4B////////////////////////////////////////////////4B////////////////////////////////////////////////4B////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4/////////////////////////////////////////////////4//////////////////////gAAAAB//+AAAAAH////////////4//////////////////////gAAAAB//+AAAAAH////////////4B/////////////////////gAAAAB//+AAAAAH////////////4B/////////////////////gAAAAB//+AAAAAH////////////4Af////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAAgAAAAB//+AAAAAAAAAP///////4AAf////////////AAAAAAAA//////////////AAAAP///////4AAf////////////AAAAAAAA//////////////AAAAP///////4AAf////////////AAAAAAAA//////////////AAAAP///gD//4AAf///////////wAAAAAAAAD////////////wAAAAA///gD//4AAf///////////wAAAAAAAAD////////////wAAAAA///gD/+AAAf///////////wAAAAAAAAD////////////wAAAAA///gD/+AAAf////////////AAAAAAAA//////////////AAAAP///gD/+AAAf////////////AAAAAAAA//////////////AAAAP///gD//4AAfwA//////////AAAAAAAA//////////////AAAAP///gD//4AAfwA//////////AAAAAAAA//////////////AAAAP///gD//4AAfwA//////////AAAAAAAA//////////////AAAAP///gD//4AAfwA//////////AAAAAAAA//////////////AAAAP/h/////4AAfwA//////////AAAAAAAA//////////////AAAAP/h/////4AAfwA//////////AAAAAAAA//////////////AAAAP/h/////4AAfwA//////////AAAAAAAA//////////8AD/AAAAP/h/////4AAfwA////8/+B//AAAAAAAA//////////8AD/AAAAP///////4AAf//////8/+B/wAAAAAAAAD/////////8ADwAAAAA//////+AAAf///////////wAAAAAAAAD/////////8ADwAAAAA//////+AAAf///////////wAAAAAAAADgH///////8ADwAAAAA//////+AAAf////////////AAAAAAAA/gH///////8AD/AAAAP///////4AAf////////////AAAAAAAA/gH///////8AD/AAAAP///////4AAf////////////AAAAAAAA/gH///////8AD/AAAAP///////4AAf////////////AAAAAAAA//////////////AAAAP///////4AAf////////////AAAAAAAA//////////////AAAAAAAAAAAAAAAf////////////AAAAAAAA//////////////AAAAAAAAAAAAAAAf////////////AAAAAAAA//////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="},
  props:[[0,0,118,114,60,324,666],[368,0,130,84,468,414,666],[119,0,115,93,1422,387,666],[235,0,132,86,1872,408,666],[499,0,43,44,2178,522,654],[687,0,34,30,942,573,663],[910,0,26,20,858,642,702],[132,115,15,15,1188,618,663],[882,0,27,21,1752,657,720],[600,0,28,34,108,1017,1119],[543,0,56,41,408,1011,1134],[722,0,39,22,1080,921,987],[762,0,39,22,1200,921,987],[802,0,39,22,1500,921,987],[842,0,39,22,1620,921,987],[629,0,34,32,1560,1077,1173],[148,115,21,15,1113,1125,1170],[664,0,22,31,2121,993,1086],[170,115,12,14,2022,1074,1116],[937,0,21,16,636,1002,1050],[959,0,21,16,636,1104,1152],[981,0,21,16,1026,1002,1050],[1003,0,21,16,1026,1104,1152],[0,115,21,16,1692,1002,1050],[22,115,21,16,1692,1104,1152],[44,115,21,16,1908,1002,1050],[66,115,21,16,1908,1104,1152],[88,115,21,16,2292,1008,1056],[110,115,21,16,2292,1101,1149]]});
// </scene:alley>

// <scene:ferry> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.ferry,{gw:60,gh:33,bg:'m_ferry_v2',propImg:'m_ferry_v2_props',propK:3,mask:{w:300,h:165,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAEAAAAAA///////H//3////////////////D///8EAAAAAAAAMAEAAAAAA///4f//H///////////////////D///+MAAAAAAAAMAEAAAAAA///4f//H///////////////////D////8AAAAAAAAMAEAAAAAA////////////////////////////////8AAAAAAAAMP8AAAAAA////////////////////////////////8AAAAAAAAMP8AAAAAA////////////////////////////////8AAAAAAAAMP8AAAAAA//////////////////////////////gAcAAAAAAAAMP8AAAAAA//////////////////////////////gAcAAAAAAAAMP8AAAAAA/////gB///////////////////////gAcAAAAAAAAMP8AAAAAA/////gB///////////////////////gAcAAAAAAAAMP8AAAAAA/////gB///////////////////////gAcAAAAAAAAMP8AAAAAA/////gB/////8AAAAAA///////////gAcAAAAAAAAMP8AAAAAA/////gB/////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////gAf/8AAAAAAAAMP8AAAAAA////////////8AAAAAA//8AB////gAf/8AAAAAAAAMP8AAAAAA////////////8AAAAAA//8AB////gAf/8AAAAAAAAMP8AAAAAA////////////8AAAAAA//8AB////gAf/8AAAAAAAAMP8AAAAAA/w+8f///////8AAAAAA//8AB////gAf/8AAAAAAAAMP8AAAAAA/w+8Af//////8AAAAAA//8AB////gAf/8AAAAAAAAMP8AAAAAA////gf//////8AAAAAA//8AB////gAf/8AAAAAAAAMP8AAAAAA////gf//////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////gf//////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAMP8AAAAAA////////////8AAAAAA/////////////8AAAAAAAAM////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8/////8f/////////////8AAAAAA//////////////////////8/////8f/////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8////////////////////8AAAAAA//////////////////////8/////////////////////////////////////////////////8////////////////////////////////8AD//////////////8////////////////////////////////8AD//////////////8////////////////////////////////8AD//////////////8////////////////////////////////8AD//////////4A//8////////////////////////////////8AD//////////4A//8/////////////////////////////////////////////4A//8/////////////////////////////////////////////4A//8//////////////////////////////////////gD/////4A//8P/////////////////////////////////////gD/////////8P/////////////////////////////////////gD/////////8P/////////////////////////////////////gDAP///////8P/////////////////////////////////////gDAP///////8P/////////////////////////////////////gDAP///////8P///////////////////////////////////////AP///////8P///////4A//////////////////////////////AP///////8P///////4A//////////////////////////////AP///////8P///////4AwH/////////////////////////////////////8P///////4AwH/////////////////////////////////////8P///////4AwH/////////////////////////////////////8P///////4AwH/////////////////////////////////////8P/////////wH/////////////////////////////////////8P////////////////////////////////////////////////8P////////////////////////////////////////////////8P////////////////////////////////////////////////8P////////////////////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="},
  props:[[137,0,100,97,84,627,918],[238,0,100,95,990,723,1008],[0,0,136,105,1956,603,918],[302,106,34,22,1830,654,720],[244,106,30,26,1740,708,786],[831,106,26,19,636,675,732],[884,106,10,10,717,618,648],[895,106,10,10,1683,618,648],[547,0,14,44,879,510,642],[562,0,44,43,450,657,786],[337,106,40,22,1410,720,786],[867,106,16,13,588,765,804],[457,0,44,45,474,519,654],[339,0,56,55,1836,477,642],[817,0,30,34,-9,564,666],[60,106,22,29,321,555,642],[31,106,28,32,2058,540,636],[607,0,34,39,-15,1197,1314],[378,106,30,22,75,1248,1314],[83,106,22,29,171,1227,1314],[628,106,28,21,246,1251,1314],[848,0,30,34,327,1212,1314],[642,0,34,39,405,1197,1314],[409,106,30,22,495,1248,1314],[106,106,22,29,591,1227,1314],[657,106,28,21,666,1251,1314],[879,0,30,34,747,1212,1314],[677,0,34,39,825,1197,1314],[440,106,30,22,915,1248,1314],[129,106,22,29,1011,1227,1314],[686,106,28,21,1086,1251,1314],[910,0,30,34,1167,1212,1314],[712,0,34,39,1245,1197,1314],[471,106,30,22,1335,1248,1314],[152,106,22,29,1431,1227,1314],[715,106,28,21,1506,1251,1314],[941,0,30,34,1587,1212,1314],[747,0,34,39,1665,1197,1314],[502,106,30,22,1755,1248,1314],[175,106,22,29,1851,1227,1314],[744,106,28,21,1926,1251,1314],[972,0,30,34,2007,1212,1314],[782,0,34,39,2085,1197,1314],[533,106,30,22,2175,1248,1314],[198,106,22,29,2271,1227,1314],[773,106,28,21,2346,1251,1314],[396,0,60,54,1590,1098,1260],[564,106,40,22,1560,984,1050],[275,106,26,25,1830,1041,1116],[605,106,22,22,1920,1074,1140],[0,106,30,34,405,1074,1176],[221,106,22,29,495,1101,1188],[802,106,28,21,2178,1017,1080],[858,106,8,15,276,945,990],[502,0,44,45,684,1137,1272]]});
// </scene:ferry>

// <scene:temple> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.temple,{gw:48,gh:27,bg:'m_temple_v2',propImg:'m_temple_v2_props',propK:3,mask:{w:240,h:135,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////////+AAAAf/////////////AAAAAAAA/////////AAAH+AAAAf/////////////AAAAAAAA/////////AAAH+AAAAf/////////////AAAAAAAA/////////AAAH+AAAAf/////////////AAAAAAAA/////////AAAH+AAAAf/////////////AAAAAAAA/////////AAAH+AAAAf/////////////AAAAAAAA/////////AAAH+AAAAf//////////gP/AAAAAAAA/////////AAAH+AAAAf//////////gP/AAAAAAAA/////////AAAH+AAAAf//////////gP/AAAAAAAA/////////AAAH+AAAAf//////////gP/AAAAAAAA/////////AAAH+AAAAf//////////gP/AAAAAAAA/////////AAAH+AAAAf//////////gP/AAAAAAAA/////////////+AAAAf///////A//////////////////A///////+AAAAf///////A//////////////////A///////+AAAAf///////A//////////////////A///////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf///////////////////////////AA/////+AAAAf///////////////////////////AA/////+AAAAf////////////////////////gA/AA/////+AAAAf8Af/////////////////////gA/AA/////+AAAAf8Af/////////////////////gA/AA/////+AAAAf8Af/////////////////////gA/AA/////+AAAAf8Af/////////////////////gA/AA/////+AAAAf8Af/////////////////////gA/AA/////+AAAAf8Af///////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAcAH////////////////////////////////+AAAAcAH////////////////////////////////+AAAAcAH////////////////////////////////+AAAAcAH////////////////////////////////+AAAAcAH////////////////////////////////+AAAAcAH//////////////////////////////wB+AAAAcAH//////////////////////////////wB+AAAAf////////////////////////////////wB+AAAAf////////////////8P//////////////wB+AAAAf////////////////8P//////////////wB+AAAAf////////////////8P//////////////wB+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf///A//////////////////////////A///+AAAAf///A//////////////////////////A///+AAAAf///A//////////////////////////A///+AAAAf///A//////////////////////////A///+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAf//////////////////////////////////+AAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//4AAAAAAAAAAAAAAAAAA"},
  props:[[211,0,286,89,102,99,366],[498,0,286,89,960,99,366],[32,0,150,164,735,24,516],[846,0,17,30,636,438,528],[46,280,18,12,477,516,552],[183,0,13,145,486,90,552],[65,280,18,12,1389,516,552],[197,0,13,145,1398,90,552],[0,280,22,14,279,828,870],[0,0,15,279,288,0,870],[23,280,22,14,1575,828,870],[16,0,15,279,1584,0,870],[1000,0,11,15,942,741,786],[864,0,28,26,1302,594,672],[893,0,30,25,1440,591,666],[924,0,23,23,1698,717,786],[948,0,26,22,132,690,756],[975,0,24,20,174,618,678],[785,0,60,43,1578,387,516]]});
// </scene:temple>

// <scene:temple_out> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.temple_out,{gw:54,gh:30,bg:'m_temple_out_v2',propImg:'m_temple_out_v2_props',propK:3,mask:{w:270,h:150,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////4AAAH///4AAADwA///D/4AAAAAAAAAAAAAAAAD///////4AAAH///4AAADwA/////8AAAAAAAAAAAAAAAAH///////4AAAH///4AAAD///////8AAAAAAAAAAAAAAAAP//////D4AAAH///4AAADw//////+AAAAAAAAAAAAAAAAf//////D/////////////wf//////AAAAAAAAAAAAAAAA/////////////////////////////gAAAAAAAAAAAAAAB/////////////////////////////gAAAAAAAAAAAAAAD/////////////////////////////wAAAAAAAAAAAAAAD/////////////////////////////4AAAAAAAAAAAAAAH/////////////////////////////8AAAAAAAAAAAAAAP/////////////////////////////8AAAAAAAAAAAAAAf/////////////////////////////+AAAAAAAAAAAAAA//wAAB/////////////////////////AAAAAAAAAAAAAB//wAAB/////////////////////////gAAAAAAAAAAAAD//wAAB//////////////4A///+Rvj/AAAAAAAAAAAAAAH//wAAB//////////////4A////////AAAAAAAAAAAAAAH//wAAB//////////////4A////////AAAAAAAAAAAAAAf//wAAB//////////////4A////////AEAAAAAAAAAAAAf//wAAB//////////////4A////////AEAAAAAAAAAAAA///wAAB/////////A////4A/////////+AAAAAAAAAAAB////////////////A////////////////AAAAAAAAAAAB/////gAP////////A////////////////AAAAAAAAAAADAH///gAP////////A////////////////gAAAAAAAAAADAH///gAP////////A////////////////gAAAAAAAAAADAH///gAP/////////////////////////wAAAAAAAAAADAH///gAP/////////////////////////wAAAAAAAAAAHAH///gAP/////////////////////////4AAAAAAAAAAH/////gAP/////////////////////////4AAAAAAAAAAH/////gAP/////////////////////////8AAAAAAAAAAP////////gP///////////////////////8AAAAAAAAAAP////////gP///////////////////////+AAAAAAAAAAP////////gP///////////////////////+AAAAAAAAAAf//////////////////////////////////AAAAAAAAAAcAAAD///////////////////////////AH/AAAAAAAAAAcAAAD///////////////////////////AH/gAAAAAAAAA8AAAD///////////////////////////AH/gAAAAAAAAA8AAAD///////////////////////////AH/wAAAAAAAAA8AAAD///////////////////////////AH/wAAAAAAAAA8AAAD////////////////////////////8H4AAAAAAAAB8AAAD////////////////////////////+f4AAAAAAAAB8AAAD//////////////////////////////8AAAAAAAAB///////////////////////////////////8AAAAAAAAD///////////////////////////////////+AAAAAAAAD///////////////////////////////////+AAAAAAAAD/B/////////////////////////////////+AAAAAAAAD/j/////////////////////////////////+AAAAAAAAD///////////////////////////////////+AAAAAAAAD///////////////////////////////////+AAAAAAAAD//////////////4P///+D//////////////+AAAAAAAAD//////////////4P///+D//////////////+AAAAAAAAD//////////////4P///+D//////////////+AAAAAAAAD//////////////4P///+D//////////////+AAAAAAAAD///////////////////////////////////8AAAAAAAAD///////////////////////////////////8AAAAAAAAD///////////////////////////////////8AAAAAAAAD///8A//////////////////////////////8AAAAAAAAD///8A//////////////////////////////8AAAAAAAAD///8A///////////////////////wAAD///8AAAAAAAAD///8A///////////////////////wAAD///8AAAAAAAAD///8A///////////////////////wAAD///8AAAAAAAAD/Af8A///////////////////////wAAD///8AAAAAAAAD/Af/////////////////////////wAAD///8AAAAAAAAAfAf/////////////////////////wAAD///gAAAAAAAAAH///////////////////////////wAAD//+AAAAAAAAAAD///////////////////////////wAAD//4AAAAAAAAAAA/////////////////////////////////gAAAAAAAAAAAH///////////////////////////////8AAAAAAAAAAAAD///////////////////////////////4AAAAAAAAAAAAA///////////////////////////////AAAAAAAAAAAAAAH/////////////////////////////8AAAAAAAAAAAAAAD/////////////////////////////wAAAAAAAAAAAAAAA/////////////////////////////AAAAAAAAAAAAAAAAP///////////////////////////4AAAAAAAAAAAAAAAAD///////////////////////////gAAAAAAAAAAAAAAAAA//////////////////////////+AAAAAAAAAAAAAAAAAAP/////////////////////////4AAAAAAAAAAAAAAAAAAAA///////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAH//////////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//gAAAAAAAAAAAAAAAAAAAAA="},
  props:[[927,0,54,55,225,261,426],[760,0,23,62,408,282,468],[892,0,34,59,543,276,453],[0,154,53,54,1452,291,453],[784,0,23,62,1608,309,495],[856,0,35,61,1722,261,444],[54,154,52,53,1872,330,489],[0,0,194,153,789,57,438],[653,0,24,65,696,333,528],[678,0,24,65,1392,333,528],[697,154,26,22,1410,432,498],[505,154,22,27,1047,597,678],[616,154,12,24,936,828,900],[629,154,12,24,1194,828,900],[447,154,34,30,537,624,714],[528,154,62,26,276,738,816],[642,154,54,23,450,573,642],[867,154,18,15,678,699,744],[591,154,24,25,1320,573,648],[400,154,46,31,1575,519,612],[482,154,22,30,417,882,972],[341,154,58,36,1593,900,1008],[844,154,22,16,1779,738,786],[886,154,18,13,285,951,990],[724,154,30,22,276,636,702],[808,0,23,62,270,666,852],[755,154,30,22,1767,576,642],[832,0,23,62,1836,618,804],[389,0,86,88,-9,426,690],[107,154,70,44,15,768,900],[563,0,44,76,6,912,1140],[476,0,86,88,1911,444,708],[703,0,56,65,1986,735,930],[608,0,44,76,2034,948,1176],[195,0,96,99,132,915,1212],[292,0,96,99,1740,915,1212],[178,154,60,37,600,1101,1212],[239,154,60,37,1380,1101,1212],[786,154,28,21,798,1131,1194],[815,154,28,21,1278,1131,1194],[300,154,40,37,1818,417,528]]});
// </scene:temple_out>

// <scene:gate> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.gate,{gw:60,gh:36,bg:'m_gate_v2',propImg:'m_gate_v2_props',propK:3,mask:{w:300,h:180,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAAAAAAf////////////////////n//////n////////////////////+f////////////////////n//////n////////////////////+f////////////////////n//////n////////////////////+f////////////////////////////////////////////////+f/+AD/////////////////////////////////////+AD////+f/+AD/////////////////////////////////////+AD////+f/+ADgAB//////////////////////////////////+AD////+f/+ADgAB//////////////////////////////////+AD////+f/+ADgAB//////////////////////////////////+AD////+f/+ADgAB//////////////////////////////////+AD////+f/+ADgAB//////////////////////////////////+AD////+f////gAB/////////////////////////////////////////+f///////////////////AA//////AA///////////////////+f///////////////////AA//////AA///////////////////+f///////////////////AA//////AA///////////////////+AAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAf////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f//////////////////gAA//////AAB//////////////////+f///+P/////////wf//gAA//////AABgAB///////////////+f///8H/////////4///gAA//////AABgAB///////////w///+f///+P/////////////gAA//////AABgAB///////////wf//+f//////////AAA/////gAA//////AABgAB///////////////+f//////////AAA/////gAA//////AABgAAAf//4AAH///////+f//////////AAA/////gAA//////AABgAAAf//4AAH///////+f///////4APAAA/////////////////gAAAfwAYAAH8AB////+f///////4APAAA/////////////////gAAAfwAYAAH8AB////+f///////4APAAA4AAAA////////////gAAAfwAYAAH8ABj///+f///////4APAAA4AAAA////////////gAB//wAYAAH8ABj///+f///////4APAAA4AAAA////////////gAB//wAYAAH8AB////+f//////////AAA4AAAA/////////////////wAYAAH///////+f///////////////8AA/////////////////wAf//////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f///////////////////////////wf///////////////////+f///////////////////////////wf///////////////////+f///////////////////////////wf///////////////////+f///////////////////////////wf///////////////////+f///////////////////////////wf///////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f////////////////////////////////////////////////+f///////8Af////////////////////////////gD////////+f///////8Af/////gH/////////////////////gD////////+f///////8Af/////gH/////////////////////gD////////+AAAAAAAAAAAAAAAAAAAAAAD////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////wAAAAAAAAAAAAAAAAAAAAAA"},
  props:[[0,0,400,203,600,9,570],[401,0,112,132,267,189,585],[514,0,112,132,-66,189,585],[627,0,112,132,1797,189,585],[740,0,112,132,2130,189,585],[587,204,11,23,1014,573,642],[599,204,11,23,1350,573,642],[887,204,30,14,963,708,750],[918,204,30,14,1347,708,750],[435,204,44,25,924,1023,1098],[480,204,44,25,1344,1023,1098],[255,204,40,44,1500,1008,1140],[412,204,22,29,1623,1041,1128],[296,204,12,40,1014,888,1008],[309,204,12,40,1350,888,1008],[322,204,36,37,804,1047,1158],[359,204,52,35,510,1047,1152],[843,204,34,16,699,1098,1146],[779,204,28,18,408,1086,1140],[110,204,52,45,1842,1017,1152],[611,204,28,22,1746,1092,1158],[808,204,34,18,2049,1086,1140],[878,204,8,15,2166,1089,1134],[525,204,30,25,135,633,708],[698,204,40,20,252,654,714],[556,204,30,25,2055,633,708],[766,204,12,19,1362,1305,1362],[853,0,58,57,153,903,1074],[912,0,58,57,2103,909,1080],[163,204,46,45,681,933,1068],[61,204,48,49,108,1311,1458],[640,204,28,21,408,1371,1434],[739,204,26,20,771,1380,1440],[210,204,44,45,1614,1329,1464],[669,204,28,21,1878,1371,1434],[0,204,60,54,2160,1302,1464]]});
// </scene:gate>

// <scene:bgate> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.bgate,{gw:54,gh:30,bg:'m_bgate_v2',propImg:'m_bgate_v2_props',propK:3,mask:{w:270,h:150,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////////////gf////////wAAAAAAAAAAAAAAAAAf////////////////gf////////4AAAAAAAAAAAAAAAAAf/////////4P///+Dgf////////4AAAAAAAAAAAAAAAAA//////////4P///+D////8AAAH/4AAAAAAAAAAAAAAAAB//////////4P///+D////8AAAH/8AAAAAAAAAAAAAAAAD//////////4P///+D////8AAAH/8AAAAAAAAAAAAAAAAD/////////////////////8AAAH/8AAAAAAAAAAAAAAAAH/////////////////////8AAAH/+AAAAAAAAAAAAAAAAH///////AAB///////4AAP8AAAH/+AAAAAAAAAAAAAAAAP///////AAB///////4AAP8AAAH//AAAAAAAAAAAAAAAAf/wg4H//AAB///////4AAP8AAAH//AAAAAAAAAAAAAAAAf///////AAB///////4AAP8AAAH//AAAAAAAAAAAAAAAA////////AAB///////4AAP8AAAEAfgAAAAAAAAAAAAAAB////////AAB///////4AAP8AAAEAfgAAAAAAAAAAAAAAD////////AAB///////4AAP8AAAEAfgAAAAAAAAAAAAAAD//////////////////////8AAAEAfwAAAAAAAAAAAAAAH//////////////////////8AAAEAf4AAAAAAAAAAAAAAH//////////////////////8AAAEAf4AAAAAAAAAAAAAAP//////////////////////////8Af4AAAAAAAAAAAAAAf/////////////////////////////8AAAAAAAAAAAAAAf/8AP/////////////////////////8AAAAAAAAAAAAAAf/8AP+A///////////////////////8AAAAAAAAAAAAAA//8AP+A///////////////////////+AAAAAAAAAAAAAA//8AP+A///////////////////////+AAAAAAAAAAAAAB//8AP+A////////////////////////AAAAAAAAAAAAAD//8AP+A////////////////////////AAAAAAAAAAAAAD//8AP//////////////////////////AAAAAAAAAAAAAD///////////////////////////////gAAAAAAAAAAAAH///////////////////////////////gAAAAAAAAAAAAH///////////////////////////////gAAAAAAAAAAAAP///////////////////////////////gAAAAAAAAAAAAP///////////////////////////////AAAAAAAAAAAAAf///////////////////////////////AAAAAAAAAAAAAf///////////////////////////////AAAAAAAAAAAAA////////////////////////////////AAAAAAAAAAAAA////////////////////////////////AAAAAAAAAAAAA///////////////////////////////+AAAAAAAAAAAAA///////////////////////////////+AAAAAAAAAAAAA///////////////////////////////+AAAAAAAAAAAAA//////////////////////8Af//////+AAAAAAAAAAAAA//////////////////////8Af//gAAB8AAAAAAAAAAAAA//////////////////+H//8Af//gAAB8AAAAAAAAAAAAA/8H///////////////+H//8Af//gAAB8AAAAAAAAAAAAA/+f////////////////////////gAAB8AAAAAAAAAAAAA///////////////////////////gAAB8AAAAAAAAAAAAA///////////////////////////gAAB8AAAAAAAAAAAAAf//////////////////////////gAAB4AAAAAAAAAAAAAf//////////////////////////gAABgAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf//////////////////////////gAAAAAAAAAAAAAAAAAf/////////////////////////8AAAAAAAAAAAAAAAAAAf/////////////4D/////////wAAAAAAAAAAAAAAAAAAAf/////////////4AB///////AAAAAAAAAAAAAAAAAAAAAf/////////////gAAAH///gAAAAAAAAAAAAAAAAAAAAAAf/////////////AAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAf/////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="},
  props:[[0,0,310,174,615,0,462],[311,0,400,92,-495,210,486],[0,175,400,92,1455,210,486],[247,268,14,32,933,474,570],[262,268,14,32,1191,474,570],[345,268,46,26,765,564,642],[392,268,46,26,1269,564,642],[277,268,16,31,1254,459,552],[0,268,60,53,1476,507,666],[439,268,24,23,1662,609,678],[294,268,50,31,495,525,618],[489,268,16,20,618,672,732],[464,268,24,23,468,669,738],[230,268,16,33,1182,771,870],[126,268,42,39,321,759,876],[579,175,44,76,54,480,708],[861,175,56,65,126,375,570],[492,175,86,88,-27,726,990],[759,175,60,69,240,987,1194],[624,175,44,76,1974,462,690],[169,268,60,37,1830,477,588],[401,175,90,92,1845,714,990],[918,175,56,65,1596,795,990],[669,175,44,76,1344,852,1080],[61,268,64,40,1044,1092,1212],[820,175,40,69,840,1005,1212],[533,268,22,16,1377,822,870],[714,175,44,76,1704,996,1224],[506,268,26,19,141,1155,1212]]});
// </scene:bgate>

// <scene:cave> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.cave,{gw:54,gh:30,bg:'m_cave_v2',propImg:'m_cave_v2_props',propK:3,mask:{w:270,h:150,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////////////////AAAAA/////////////////wAAAAD/////////////////AAAAA/////////////////wAAAAD/////////////////AAAAA/////////////////wAAAAD/////////////////AAAAA/////////////////4AAAAH/////////////////AAAAA/////////////////4AAAAH/////////////////AAAAA/////////////////4AAAAH/////////////////AAAAA/////////////////4AAAAH/////////////////AAAAA/////////////////8AAAAH/////////////////AAAAA/////////////////8AAAAP/////////////////AAAAA////////wAAf/////8AAAAP/////////////////AAAAA////////wAAf/////8AAAAP/////////////////AAAAA////////wAAf/////8AAAAf/////////////////AAAAA///4Af//wAAf/AAD/+AAAAf/////////////////AAAAA///4Af//wAAf/AAD/+AAAAf//////////////8B/AAAAA/gP4Af//wAAf/AAD/+AAAAf/////////gAAD/8B/AAAAA/gP4Af//wAAf/AAD//AAAAf/////////gAAD/8B/AAAAA/gP4Af//wAAf/AAD//AAAA//////////gAAD/8B/AAAAA/gP/////wAAf/AAD//AAAA//////////gAAD/8B/AAAAA/gP/////wAAf/AAD//AAAA//////////gAf//8B///////gP///////////////AAAA4AH///////gAf////////////////////////////gAAB4AH///////gAf////////////////////////////gAAB4AH//////////////////////////////////////gAAB4AH//////////////////////////////////////gAAD4AH//////////////////////////////////////wAAD4AH/AAAH/////////////////////////////////wAAD4AH/AAAH/////////////////////////////////wAAD4AH/AAAH/////////////////////////////////4AAD////AAAH/////////////////////////////////4AAD////AAAH/////////////////////////////////wAAD////AAAH/////////////////////////////////wAAD////AAAH/////////////////////////////////wAAD/////////////////////////////////////////wAAD/////////////////////////////////////////wAAD/////////////////////////////////////////wAAD///+AAAD/////////////////////8AAD////////gAAD///+AAAD/////////////////////8AAD//////4AAAAB///+AAAD/////////////////////8AAD//////4AAAAB///+AAAD/////////////////////8AAD//////4AAAAB///+AAAD/////////////////////8AAD//////4AAAAB///+AAAD/////////////////////8AAD//////4AAAAB///+AAAD/////////////////////8AAD//////4AAAAB/////////////////////////////8AAD//////4AAAAB/////////////////////////////////////////AAAA/////////////////////////////////////////AAAA/////////////////////////////////////////AAAA/////////////////////////////////////////AAAAAH///////////////////////////////////////AAAAAH///////////////////////////////////////AAAAAH//////////////////////////////////gA///AAAAAH//////////////////////////////////gA///AAAAAH//////////////////////////////////gA//+AAAAAH//////////////////////////////////////+AAAAAH//////////////////////////////////////+AAAAAH//////////////////////////////////////+AAAAf///////////////////////////////////////+AAAAf///////////////////////////////////////8AAAAf///////////////////////////////////////8AAAAfgAH////////////////////////////////////8AAAAfgAH////////////////////////////////////8AAAAfgAH////////////////////////////////////8AAAAfgAH////////////////////////////////////4AAAAfgAH////////////////////////////////////wAAAAfgAH////////h///////////////////////////gAAAAPgAH////////h///////////////////////////gAAAAH///////////h///////////////////////////AAAAAD//////////////////////////////////////+AAAAAA//////////////////////////////////////8AAAAAAf/////////////////////////////////////4AAAAAAP/////////////////////////////////////wAAAAAAD/////////////////////////////////////gAAAAAAB/////////////////////////////////////AAAAAAAA/////////////////////////////////////AAAAAAAAf///////////////////////////////////+AAAAAAAAH///////////////////////////////////8AAAAAAAAD///////////////////////////////////4AAAAAAAAB///////////////////////////////////wAAAAAAAAAf4Af///////////////////////////////gAAAAAAAAAP4Af//////////////////4Af//////////gAAAAAAAAAH4Af//////////////////4Af//////////AAAAAAAAAAD4Af//////////////////4Af/////////8AAAAAAAAAAA4Af/////////gP///////4Af/////////8AAAAAAAAAAAYAf/////////gP///////4Af/////////AAAAAAAAAAAAAAf/////////gP/////////////////gAAAAAAAAAAAAAAAD/////////gP////////////////AAAAAAAAAAAAAAAAAAAH///////////////////////wAAAAAAAAAAAAAAAAAAAAAAf///////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAH/////////////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAfwAf///////+AD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAAAAAAAAAAAA="},
  props:[[0,0,452,122,-180,6,372],[453,0,452,122,984,6,372],[906,0,80,82,960,276,522],[275,123,22,33,843,435,534],[298,123,22,33,1251,435,534],[457,123,55,27,288,549,630],[581,123,62,22,279,642,708],[424,123,32,28,120,510,594],[513,123,30,27,585,471,552],[84,123,44,38,1602,414,528],[41,123,42,40,1821,402,522],[375,123,48,29,1518,633,720],[338,123,36,30,1824,696,786],[721,123,11,15,678,855,900],[321,123,16,31,876,963,1056],[644,123,26,19,1317,981,1038],[698,123,22,18,681,474,528],[671,123,26,19,1371,453,510],[544,123,36,25,156,819,894],[0,123,40,41,54,693,816],[240,123,34,35,303,945,1050],[129,123,36,37,774,1029,1140],[166,123,36,37,1278,1029,1140],[203,123,36,37,1986,609,720]]});
// </scene:cave>

// <scene:crossing> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.crossing,{gw:30,gh:18,bg:'m_crossing_v2',propImg:'m_crossing_v2_props',propK:3,mask:{w:150,h:90,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAH///////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="},
  props:[]});
SC.crossing.far={img:'m_crossing_far',strip:[0,0,400,52],skiff:[0,54,84,31],skiffL:[86,54,84,31],water:[0,87,200,200],k:3};
SC.crossing.boat=[210,348,780,186];
// </scene:crossing>

// <scene:ferry_e> 由 tools_scene/build_scene.py 生成，勿手改
Object.assign(SC.ferry_e,{gw:54,gh:30,bg:'m_ferry_e_v2',propImg:'m_ferry_e_v2_props',propK:3,mask:{w:270,h:150,d:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAH///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H//////w8MN/////////////////////////////////4H///////////////////////////////////////////4H///////////////////////////////////////////4H/////////////////////////////////////44P///4H/////////////////////////////////////44P///4AAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///gD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAB///gD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAB///wD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAB///wD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAB///wD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAB///wD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAB///wD/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAA///4D/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAf//4D/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAf//+D/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAP///D/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAH///j/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAD///7/////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAD/////////4AAAAAH////////AAAAAAAAAAAAAAAAAAAAB////////////////////////AAAAAAAAAAAAAAAAAAAAA//////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAf/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAf///4fcf//////////4AAAH/AAAAAAAAAAAAAAAAAAAAAP/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAH/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAD/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAD/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAB/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAA/////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAAf////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAAf////////////////4AAAH/AAAAAAAAAAAAAAAAAAAAAAP//////////////////////AAAAAAAAAAAAAAAAAAAAAAH//////////////////////AAAAAAAAAAAAAAAAAAAAAAA//////////////////////AAAAAAAAAAAAAAAAAAAAAAAD/////////////////////AAAAAAAAAAAAAAAAAAAAAAAAP////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD//////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAD//H///////////////wAAAAAAAAAAAAAAAAAAAAAAAAAD//H///////wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAD//////////wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAD//////////wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAD//////////wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAD//////////wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAD////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="},
  props:[[424,127,50,36,1245,192,300],[435,232,24,27,1554,231,312],[475,127,50,36,2025,192,300],[483,232,18,24,45,216,288],[460,232,22,25,417,207,282],[162,232,40,29,1080,207,294],[105,0,44,85,1806,225,480],[256,0,72,38,312,336,450],[0,0,104,87,1404,405,666],[150,0,64,40,1848,648,768],[215,0,40,39,1182,591,708],[329,0,50,38,1245,756,870],[408,232,26,28,1641,816,900],[190,263,26,22,2031,834,900],[380,0,52,38,-75,447,561],[433,0,52,38,18,441,555],[502,232,18,24,96,489,561],[486,0,52,38,162,456,570],[521,232,18,24,267,483,555],[225,199,26,30,417,474,564],[540,232,18,24,453,480,552],[252,199,26,30,525,456,546],[526,127,44,32,603,456,552],[279,199,26,30,723,480,570],[571,127,44,32,-3,525,621],[616,127,44,32,114,522,618],[539,0,52,38,225,522,636],[306,199,26,30,318,534,624],[661,127,44,32,411,522,618],[592,0,52,38,444,498,612],[645,0,52,38,570,516,630],[706,127,44,32,678,531,627],[698,0,52,38,738,504,618],[751,127,44,32,2127,528,624],[559,232,18,24,-39,606,678],[796,127,44,32,-18,597,693],[841,127,44,32,96,597,693],[886,127,44,32,171,600,696],[931,127,44,32,243,603,699],[333,199,26,30,393,594,684],[976,127,44,32,441,603,699],[360,199,26,30,594,606,696],[578,232,18,24,681,630,702],[751,0,52,38,717,576,690],[387,199,26,30,849,609,699],[597,232,18,24,2130,606,678],[414,199,26,30,75,678,768],[616,232,18,24,174,690,762],[0,166,44,32,192,669,765],[635,232,18,24,366,690,762],[45,166,44,32,366,660,756],[90,166,44,32,480,648,744],[135,166,44,32,558,669,765],[654,232,18,24,660,675,747],[673,232,18,24,753,678,750],[180,166,44,32,2133,651,747],[225,166,44,32,-66,732,828],[441,199,26,30,30,732,822],[692,232,18,24,153,762,834],[711,232,18,24,228,744,816],[468,199,26,30,258,723,813],[804,0,52,38,312,699,813],[730,232,18,24,486,741,813],[857,0,52,38,489,699,813],[495,199,26,30,675,723,813],[522,199,26,30,771,741,831],[549,199,26,30,810,738,828],[270,166,44,32,-57,801,897],[910,0,52,38,120,780,894],[963,0,52,38,198,771,885],[576,199,26,30,423,795,885],[603,199,26,30,504,801,891],[749,232,18,24,627,819,891],[315,166,44,32,690,795,891],[0,88,52,38,738,777,891],[630,199,26,30,882,795,885],[53,88,52,38,888,762,876],[768,232,18,24,1038,804,876],[657,199,26,30,2151,795,885],[106,88,52,38,0,837,951],[360,166,44,32,114,861,957],[159,88,52,38,159,840,954],[684,199,26,30,321,873,963],[212,88,52,38,321,837,951],[265,88,52,38,435,840,954],[711,199,26,30,567,870,960],[318,88,52,38,714,843,957],[371,88,52,38,777,849,963],[424,88,52,38,849,837,951],[405,166,44,32,951,846,942],[450,166,44,32,-45,921,1017],[495,166,44,32,84,921,1017],[787,232,18,24,219,939,1011],[477,88,52,38,285,918,1032],[530,88,52,38,399,900,1014],[583,88,52,38,495,894,1008],[806,232,18,24,594,939,1011],[540,166,44,32,651,915,1011],[585,166,44,32,735,933,1029],[636,88,52,38,795,918,1032],[825,232,18,24,-60,1020,1092],[630,166,44,32,-18,987,1083],[675,166,44,32,81,987,1083],[844,232,18,24,198,1002,1074],[738,199,26,30,267,990,1080],[765,199,26,30,348,987,1077],[792,199,26,30,507,996,1086],[863,232,18,24,609,1017,1089],[819,199,26,30,666,987,1077],[846,199,26,30,705,987,1077],[689,88,52,38,756,975,1089],[882,232,18,24,945,1020,1092],[901,232,18,24,1053,1020,1092],[742,88,52,38,1080,984,1098],[795,88,52,38,1155,975,1089],[720,166,44,32,1266,987,1083],[765,166,44,32,1470,996,1092],[873,199,26,30,1515,996,1086],[810,166,44,32,1731,990,1086],[900,199,26,30,1854,1008,1098],[920,232,18,24,2028,1020,1092],[939,232,18,24,2130,1020,1092],[927,199,26,30,-12,1074,1164],[958,232,18,24,87,1083,1155],[855,166,44,32,147,1068,1164],[900,166,44,32,180,1053,1149],[954,199,26,30,312,1053,1143],[848,88,52,38,444,1035,1149],[977,232,18,24,630,1092,1164],[981,199,26,30,687,1071,1161],[945,166,44,32,735,1047,1143],[901,88,52,38,789,1032,1146],[996,232,18,24,981,1074,1146],[0,199,44,32,1038,1047,1143],[0,232,26,30,1101,1071,1161],[27,232,26,30,1194,1065,1155],[54,232,26,30,1338,1068,1158],[954,88,52,38,1386,1047,1161],[45,199,44,32,1530,1047,1143],[0,263,18,24,1707,1071,1143],[0,127,52,38,1761,1032,1146],[81,232,26,30,1824,1059,1149],[53,127,52,38,1884,1047,1161],[19,263,18,24,2061,1089,1161],[106,127,52,38,-111,1098,1212],[38,263,18,24,27,1137,1209],[159,127,52,38,105,1104,1218],[90,199,44,32,261,1119,1215],[212,127,52,38,333,1113,1227],[135,199,44,32,435,1128,1224],[57,263,18,24,543,1158,1230],[265,127,52,38,687,1104,1218],[76,263,18,24,816,1158,1230],[95,263,18,24,912,1158,1230],[114,263,18,24,1008,1137,1209],[108,232,26,30,1071,1116,1206],[180,199,44,32,1128,1110,1206],[318,127,52,38,1242,1116,1230],[133,263,18,24,1479,1134,1206],[371,127,52,38,1500,1113,1227],[152,263,18,24,1779,1158,1230],[135,232,26,30,1848,1116,1206],[171,263,18,24,2016,1152,1224],[203,232,40,29,1296,465,552],[244,232,40,29,1374,459,546],[285,232,40,29,1638,465,552],[326,232,40,29,1722,459,546],[367,232,40,29,1800,465,552]]});
// </scene:ferry_e>
