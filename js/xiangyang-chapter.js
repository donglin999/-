'use strict';
// #xiangyang 体验章节：沿用街市、渡口与战斗系统，重写本片段的案情和人物位置。
// #street 旧流程保持原有脚本，便于回归。事件与对白总表见 docs/design/xiangyang-chapter.md。
const xySlice=()=>!!(S&&S.flags&&S.flags.xiangyang_slice);
const xyNpc=(scene,id)=>SC[scene].npcs.find(n=>n.id===id);
const xyYe=(line,expression)=>say('叶蘅',line,'c_ye'+(expression?':'+expression:''));
async function xyCG(src,caption,beats=[]){
  const img=new Image();img.src=src;
  try{await img.decode()}catch(e){return}
  const wasBusy=dlgBusy;dlgBusy=true;
  try{await new Promise(resolve=>{
    const veil=document.createElement('div');veil.className='xy-cg';veil.setAttribute('role','dialog');veil.setAttribute('aria-label',caption);
    const picture=document.createElement('img');picture.src=src;picture.alt=caption;
    const title=document.createElement('div');title.className='xy-cg-title';title.textContent=caption;
    const line=document.createElement('div');line.className='xy-cg-line';line.setAttribute('aria-live','polite');
    const speaker=document.createElement('strong'),words=document.createElement('span');line.append(speaker,words);
    const button=document.createElement('button');button.type='button';
    veil.append(picture,title,line,button);
    let i=0;
    const draw=()=>{const beat=beats[i];speaker.textContent=beat?.who||'';speaker.hidden=!beat?.who;words.textContent=beat?.text||'';button.textContent=i<beats.length-1?'继续　›':'返回街心　›'};
    const done=()=>{veil.remove();window.removeEventListener('keydown',key);resolve()};
    const next=()=>{if(i<beats.length-1){i++;draw()}else done()};
    const key=e=>{if(!e.repeat&&['Enter',' ','e','E'].includes(e.key)){e.preventDefault();next()}};
    veil.onclick=next;draw();$('game').appendChild(veil);window.addEventListener('keydown',key);button.focus();
  })}finally{dlgBusy=wasBusy}
}
Object.assign(ITEMS,{
  tea_bowl:{name:'老周的茶碗',desc:'柳三娘茶棚的粗陶碗。疤脸刘曾端起来，碗沿还留着茶渍。',key:1},
  ferry_tag:{name:'东津渡货签',desc:'从黑风寨取回的货签，记录渡口收货日子；毒的制作者仍待追查。',key:1}
});

const xyOldZhou=xyNpc('street','zhou').act;
xyNpc('street','zhou').act=async function(n){
  if(!xySlice())return xyOldZhou.call(this,n);
  if(XQ()===0){
    await narr('第一年夏，萧白与叶蘅来襄阳采买药材。街心忽然起了喧声，挑夫老周连人带货担倒在石板上。');
    await xyYe('他的指尖发凉，呼吸却急。萧白，替我把人群拦开。','worry');
    await say('苏芷','肩别抬，压住他的上臂。','c_suzhi');
    await xyCG('assets/cg_zhou_rescue.webp','街心 · 合力救治老周',[
      {text:'苏芷三针落下，叶蘅扶住老周的肩，指尖紧贴他的脉。街上的喧声渐渐远了。'},
      {who:'叶蘅',text:'脉又沉了一分。苏姑娘，左手指尖开始发青。'},
      {who:'苏芷',text:'我看到了。先守住气息，别让人给他灌水。'},
      {who:'叶蘅',text:'我数他的呼吸，你看毒走到哪儿。萧白，替我们留出地方。'},
      {text:'两人对看一眼，苏芷换针，叶蘅随即按住老周颤动的手。'}
    ]);
    const c=await choose('萧白','眼下先做什么？',['护住救治空地，让叶蘅按脉','取茶棚的清水和干净布带','追问围观者是谁碰过老周']);
    if(c===0){await xyYe('脉还在。苏姑娘的针压住了毒势，我能再替他稳一阵。');await moral(1)}
    else if(c===1){await xyYe('水留下，先别喂。他现在吞咽不稳。');await moral(1)}
    else await say('苏芷','先救人。问话还有时间。','c_suzhi');
    await say('苏芷','青蚨散。我能暂缓，解药得找经手的人。','c_suzhi');
    await xyYe('他的指甲缝里有茶渍，刚才应当在茶棚歇过脚。我们分头问。','surprise');
    await say('苏芷','我守着他。半日之内，把药带回来。','c_suzhi');
    xqSet(1);setFlag('suzhi_met');await toast('青蚨散案 · 查访街市',1500);hud();return;
  }
  if(XQ()>=3){await say('老周','……水……','c_zhou');await xyYe('他还昏着。解药先交给苏芷，我来守脉。','worry');return}
  await narr('老周侧卧在货担旁，胸口起伏微弱。叶蘅记下他的脉象，苏芷的针仍在颈侧。');
};

const xyOldSu=xyNpc('street','suzhi').act;
xyNpc('street','suzhi').act=async function(n){
  if(!xySlice())return xyOldSu.call(this,n);
  if(XQ()===0){await say('苏芷','先看病人。','c_suzhi');return}
  if(XQ()<=2){
    const c=await choose('苏芷','老周的脉比方才平些，但留给他的时间不多。',['问解药的线索','问叶蘅能做什么','先去调查']);
    if(c===0)await say('苏芷','下毒者留解药，才有机会拿毒作筹码。查谁碰过他的茶碗。','c_suzhi');
    else if(c===1){await xyYe('我能稳住呼吸，也能认药性。你去找人证和物证，比站在这儿着急有用。');await say('苏芷','她看得准。','c_suzhi')}
    return;
  }
  if(XQ()===3){
    if(!S.bag.jieyao){await say('苏芷','解药还没到手。','c_suzhi');return}
    await xyCG('assets/cg_zhou_rescue.webp','街心 · 解药入喉',[
      {text:'萧白交出小瓷瓶。苏芷闻过药液，叶蘅取出布带，扶稳老周的肩。'},
      {who:'苏芷',text:'是对药。我先施针，等他能吞咽再喂。叶蘅，留意呼吸。'},
      {who:'叶蘅',text:'我数着……好了，他喉间有动静了。先喂一口。'},
      {who:'苏芷',text:'等他咽下去。别急。'},
      {text:'老周猛地咳出浊液。叶蘅重新搭脉，向苏芷轻轻点头；两人才收了针。'}
    ]);
    await say('老周','我还活着？货……货担呢？','c_zhou');
    await xyYe('担子在。先别起来，今天不能再扛货。','smile');
    const c=await choose('萧白','老周摸出一串铜钱，硬要谢你们。',['让他留着买药','收下，替他保管后续药费']);
    if(c===0){await moral(1);await xyYe('这钱留着。回去请人替你跑一趟货。')}
    else{S.silver+=15;await gain('银两 +15');await xyYe('我把方子写给你，药费先从这串钱里出。')}
    S.bag.jieyao=0;xqSet(4);setFlag('xq_saved');
    await say('苏芷','你刚才辨出的脉象，记成医案吧。若愿意，我能替你递给白鹇谷的一位医师。','c_suzhi');
    await xyYe('多谢。交不交、何时交，我想自己再想一想。','shy');
    setFlag('ye_referral_offer');
    await xyInvite();return;
  }
  if(XQ()===4){await xyInvite(true);return}
};

async function xyInvite(again=false){
  if(!again){await say('苏芷','账簿上有东津渡。我想去看看药从哪里来。','c_suzhi')}
  const c=await choose('苏芷','你们下一步怎么走？',['请苏芷同行查渡口','请苏芷先留城照看老周','先把老周的案子记下来']);
  if(c===0){
    if(!S.party.includes('suzhi'))S.party.push('suzhi');xqSet(5);delete S.flags.xq_decline;
    await say('苏芷','好。先把病人安顿好，随后出发。','c_suzhi');await xyYe('路上我想再请教你那三针。');
    await toast('苏芷 加入队伍',1500);
  }else if(c===1){setFlag('xq_decline');await say('苏芷','我留一日。若你们去渡口，回来告诉我看到了什么。','c_suzhi')}
  if(!S.unlocked.ferry){S.unlocked.ferry=1;await toast('大地图新增 · 东津渡',1500)}
  if(c===2)await ending('local');
  hud();save();
}

const xyOldGossip=xyNpc('street','gossip').act;
xyNpc('street','gossip').act=async function(n){
  if(!xySlice())return xyOldGossip.call(this,n);
  if(XQ()<1||XQ()>2||hasFlag('xq_c_gossip')){await say('包打听',XQ()<1?'今儿街上热闹。先去街心看看。':'刘爷那本账，比我这张嘴还会说话。','c_gossip');return}
  await say('包打听','老周三个月没给铁臂帮交例钱。疤脸刘前天还当街说，欠的早晚得还。','c_gossip');
  await xyYe('这是动机，不是下毒的证据。还得找谁碰过他的东西。','worry');
  await clueGot('gossip','老周与疤脸刘有例钱纠纷');
};

const xyOldLady=xyNpc('street','lady').act;
xyNpc('street','lady').act=async function(n){
  if(!xySlice())return xyOldLady.call(this,n);
  if(XQ()<1||XQ()>2||hasFlag('xq_c_lady')){await say('柳三娘',XQ()<1?'老周平日总在这儿歇脚。':'老周那只碗我认得。要对证，我还在。','c_lady');return}
  await say('柳三娘','老周倒下前在我这儿喝茶。疤脸刘端过他的碗，说是嫌水凉。','c_lady');
  const c=await choose('柳三娘','三娘攥着围裙，看向茶棚的碗。',['请她保存茶碗，作证时再拿出','先拿茶碗查验，不牵连三娘']);
  if(c===0){await say('柳三娘','成。有你们在，我就不藏这事了。','c_lady');await moral(1)}
  else await xyYe('我只取这只碗，三娘的名字先不记。');
  S.bag.tea_bowl=1;await gain('获得 老周的茶碗');
  await clueGot('lady','疤脸刘碰过老周的茶碗');
};

const xyOldOldman=xyNpc('street','oldman').act;
xyNpc('street','oldman').act=async function(n){
  if(!xySlice())return xyOldOldman.call(this,n);
  if(XQ()<1||XQ()>2||hasFlag('xq_c_oldman')){await say('说书老伯',XQ()<1?'街心闹哄哄的，我这书都说不下去了。':'那人的袖袋我没看错，左边。','c_oldman');return}
  await say('说书老伯','老周倒下前，那疤脸汉子又来催钱。我看见他摸过左边袖袋，像藏着个小瓶。','c_oldman');
  await say('萧白','您确定是左袖？','c_hero');
  await say('说书老伯','说书看的是眼，认错了砸自己饭碗。左袖，没错。','c_oldman');
  await clueGot('oldman','疤脸刘左袖藏有小瓶');
};

xyNpc('street','liu').act=async function(){if(!xySlice())return confront();return xyConfront()};
async function xyConfront(){
  if(XQ()!==2)return;
  await narr('茶棚前，疤脸刘正向柳三娘催例钱。铁护臂磕着桌沿，茶碗震得作响。');
  await say('疤脸刘','钱拖了三天。你们做买卖的，别叫我为难。','c_liu');
  const c=await choose('萧白','老周的毒还等着解药。',['摆出线索，当众问他左袖的小瓶','替三娘交二十两，换他退开','先动手制住他']);
  if(c===1){
    if(S.silver<20){await say('疤脸刘','钱不够就让开。','c_liu');return}
    S.silver-=20;setFlag('xq_pay');await gain('银两 -20');
    await say('疤脸刘','识相。下月也记得带钱来。','c_liu');
    await xyYe('例钱给了，解药还没给。你的左袖里是什么？','angry');
  }else if(c===0){
    const proof=[hasFlag('xq_c_gossip')?'老周拒交例钱后，你威胁过他。':null,hasFlag('xq_c_lady')?'柳三娘看见你碰了他的茶碗。':null,hasFlag('xq_c_oldman')?'有人看见你把小瓶塞进左袖。':null].filter(Boolean).join('');
    await say('萧白',proof+'现在把左袖里的瓶子拿出来。','c_hero');
    if(hasFlag('xq_c_lady'))await say('柳三娘','碗我留着。若要对质，我作证。','c_lady');
    await moral(1);
  }else await xyYe('别让他碰袖袋。先护住茶棚里的人。','battle');
  await say('疤脸刘','你们拿着半截话，就想定我的罪？兄弟们！','c_liu');
  await say('苏芷','叶蘅，退到老周那边。','c_suzhi');
  await xyYe('我能护住他。萧白，你看前面。','battle');
  const temp=!S.party.includes('suzhi');if(temp)S.party.push('suzhi');
  let result;try{result=await battle({foes:[mk('scarliu'),mk('thug')],bg:'bg_street',boss:true,noLose:true,intro:'疤脸刘与打手扑向茶棚！'})}
  finally{if(temp)S.party=S.party.filter(id=>id!=='suzhi')}
  if(result!=='win'){
    await narr('萧白踉跄退到茶棚檐下。叶蘅挡住追来的打手，苏芷替他止血。');
    await xyYe('先喘匀气。老周那边我看着，等你准备好再去。','worry');
    const d=derived();S.hp=Math.max(S.hp,Math.round(d.mhp*.6));hud();return;
  }
  setFlag('xq_w1');S.bag.jieyao=1;S.bag.ledger=1;
  await narr('疤脸刘的左袖里果然有一只青瓷瓶，腰带中还塞着铁臂帮的账簿。');
  await gain('获得 青蚨散解药 · 铁臂帮账簿');
  await say('疤脸刘','药是上头给的。我收钱、递碗，没配过毒！','c_liu');
  await xyYe('他承认经手，不等于说清药从哪儿来。先救老周。');
  const fate=await choose('萧白','如何处置疤脸刘？',['交给巡街军士并附上证物','逼他承诺不再收例钱后放走','留下他的钱袋充作老周药费']);
  if(fate===0){S.flags.xq_fate='guard';await moral(2);await say('巡街军士','账簿和人都收下，街坊可以来作证。','c_soldier')}
  else if(fate===1){S.flags.xq_fate='spare';await moral(1);await say('疤脸刘','我不来了！这条街的钱，我不收了！','c_liu')}
  else{S.flags.xq_fate='rob';S.silver+=35;await gain('银两 +35');await moral(-2);await xyYe('药费我会算清，多出的不能算在老周头上。','angry')}
  xqSet(3);await toast('取回解药 · 返回街心救人',1500);hud();save();
}

SC.street.npcs.push({id:'xy_caseboard',name:'街心案卷',sp:null,x:34.7,y:18.5,verb:'结案',
  show:()=>xySlice()&&XQ()>=4&&!S.flags.xiangyang_result,mark:()=>1,
  async act(){await narr(`老周已经脱险。账簿、解药${S.bag.tea_bowl?'、茶碗':''}与街坊证言足以说明疤脸刘经手毒案；上游药源仍待追查。`);
    const c=await choose('萧白','要在这里结案，还是继续向渡口追？',['记录地方结案','继续追查东津渡']);if(c===0)await ending('local')}});

const xyOldQuestLine=questLine,xyOldQuestLog=questLog;
questLine=function(){if(!xySlice())return xyOldQuestLine();
  if(XQ()>=4&&!hasFlag('chief_dead')&&!hasFlag('ferry_ev'))return S.flags.xiangyang_result?'可选：去东津渡查药源':'老周已脱险 · 街心可结案，亦可去东津渡';
  return xyOldQuestLine()};
questLog=function(){const list=xyOldQuestLog();if(!xySlice())return list;
  if(XQ()>=1)list.unshift({done:XQ()>=4,t:'街心救治',d:'叶蘅与苏芷共同稳住老周的脉象；萧白追查解药。'});
  if(XQ()>=4)list.push({done:true,t:'老周脱险',d:'疤脸刘承认经手茶碗和解药。账簿指向东津渡，但制毒者尚未查明。'});
  return list};
window.questLine=questLine;window.questLog=questLog;

// 渡船停用旧主角身世暗示，改为与案件有关的货路见闻；叶蘅实际在船上。
const xyOldTang=xyNpc('crossing','boatman').act;
xyNpc('crossing','boatman').act=async function(n){if(!xySlice())return xyOldTang.call(this,n);
  if(!hasFlag('tang_story')){setFlag('tang_story');
    await say('汤老舵','铁臂帮的账，我在码头见过几回。钱袋用麻绳双扣，送上东岸从不让船户碰。','c_boatman');
    await xyYe('若瓶子也走这条路，收货的人应当留着货签。');
    if(needRaid())return raid();return}
  if(needRaid())return raid();
  await say('汤老舵','前头就是东岸，船头能靠岸了。','c_boatman')};
SC.crossing.npcs.push({id:'ye',name:'叶蘅',sp:'c_ye',x:18.2,y:11.3,dir:'r',show:()=>xySlice()&&inParty('ye'),
  async act(){await xyYe(hasFlag('cross_fight')?'水匪的船都往芦苇后头去。记下那条水路。':'老周的药瓶很小，若混在货里，得看封绳和货签。')}});

const xyOldFerryEnter=SC.ferry_e.enter;
SC.ferry_e.enter=async function(){await xyOldFerryEnter.call(this);if(xySlice()&&inParty('ye')&&!hasFlag('xy_east_ye')){
  setFlag('xy_east_ye');await xyYe('芦苇边有新拖过的箱痕，水匪把货先放在这儿，再送上山。')}};
const xyOldChief=xyNpc('cave','chief').act;
xyNpc('cave','chief').act=async function(n){if(!xySlice())return xyOldChief.call(this,n);
  await say(n.name,'从襄阳一路追到这儿，就为一个挑夫？','c_chief');
  await xyYe('为老周，也为你们每月送出去的毒。货是谁给的？','battle');
  await say(n.name,'我收钱、放货，不替人报家门。想看账，先过我的刀。','c_chief');
  const result=await battle({bg:'bg_bandit_cave',foes:[mk('chief'),mk('bandit'),mk('bandit')],boss:true,noLose:true});
  if(result!=='win'){await xyYe('这寨子不急着今晚打穿。我们先退，再找入口。','hurt');return}
  setFlag('chief_dead');S.bag.ferry_tag=1;await gain('获得 东津渡货签');
  await narr('货签记下几次东津渡交货的日子，收货的是黑风寨。签上没有制毒者的姓名。');
  if(inParty('suzhi'))await say('苏芷','青蚨散的来路还能查；不能凭这张签就断言与叶家的药有关。','c_suzhi');
  else await xyYe('货签能说明黑风寨收过货，还不能指认制毒的人。');
  await xyYe('案卷先写我们亲眼看见的。其余的，留待以后查。');
  await ending('good')};
