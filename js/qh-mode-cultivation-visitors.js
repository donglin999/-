/* Three visitor stories. Windows/costs mirror calendar/mountain-events.json;
 * tests enforce this contract. No save or DOM writes in this module. */
(function(root){
'use strict';
const definitions=[
 {id:'visitor_songfeng_route',place:'谷中接待廊',time:'day',name:'近路之外',teacher:'莫松年',actor:'mo_songnian',window:[8,9],cost:3,gain:'observation',amount:2,cast:['hero','zhou','mo_songnian'],notice:'松风观的行脚弟子莫松年将在二月下旬至月底带路况记录来谷，可去廊下看看。',expired:'莫松年已继续行路。公开路况摘要留在谷中，未参与不算已经相识。'},
 {id:'visitor_whiteheron_records',place:'谷中接待廊',time:'day',name:'纸上和送到的',teacher:'孟知微',actor:'meng_zhiwei',window:[13,14],cost:3,gain:'medical_notes',amount:2,cast:['hero','ye','meng_zhiwei'],notice:'白鹇谷医案执事孟知微将在三月下旬至月底核对普通药材记录，叶蘅准备了交接资料。',expired:'普通药材记录已交接。尚待核实的项目继续留空，未参与不算已经协助。'},
 {id:'visitor_zhaochuan_greeting',place:'谷中接待廊',time:'day',name:'礼数之外',teacher:'照川来客',actor:'zhaochuan_courier',window:[15,17],cost:3,gain:'understanding',amount:2,cast:['hero','zhou','zhaochuan_courier'],factRequires:['xiangyang_invitation'],notice:'照川送帖弟子将在四月月初至中旬补交公开试艺说明，可向来客询问适合旁观的项目。',expired:'照川来客已离谷。必要邀请与公开安排仍随免费出行交接送达。'}
];
// 归云谷师门剧情复用本引擎；定义与对白在 qh-mode-cultivation-household.js。
const H=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-household.js'):root.CultivationHousehold;
const T=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-dialogue.js'):root.CultivationDialogue;
const PH=typeof module==='object'&&module.exports?require('./qh-pre-hangao'):root.PreHangao;
const all=()=>[...definitions,...(H?H.definitions:[])],find=id=>all().find(d=>d.id===id);
const line=(speaker,text,cast)=>({speaker,text,...(cast?{cast}:{})});
function snapshot(s){return {footwork:!!s.learned.footwork,fist:!!s.learned.fist,sword:!!s.learned.sword,delivery:['guided_footwork','assisted_carry','asked_for_guidance'].includes(s.facts.first_delivery?.method)?s.facts.first_delivery.method:null};}
function raw(id,c){
 if(PH.has(id)&&!H.has(id))return {intro:[],choices:[],closing:[]};
 if(PH.has(id)&&id.startsWith('hg_'))return {intro:[],choices:[],closing:[]};
 if(H&&H.has(id))return H.script(id,c);
 if(id==='visitor_songfeng_route')return {
 intro:[line('mo_songnian','周先生，前些日子那处渡口水涨了。原来的记号先别照用，我把查看的日子添上了。'),line('zhou','萧白，来认识一下。松风观的莫松年，走过不少山路，今日在这儿歇脚。'),line('hero','我叫萧白，刚在谷里学起。图上这条线看着近，为什么还画了那么远一条？'),line('mo_songnian','近是近，水一涨就过不去。多画这条，是给赶路的人留个退路。'),line('zhou','练场里也是这个道理。哪里没看懂，趁他在，问问。')],
 choices:[{key:'verify_notes',text:'帮他分清已核实与待核实的路段',lines:[line('hero','这几处是你亲自走过的？我把日子抄在旁边，省得以后弄混。'),line('mo_songnian','行。听来的那几处，先搁着。我下回经过，再去瞧瞧。'),line('hero','（我在自己的纸上分两栏抄，原图一笔不动。）')]},{key:'route_questions',text:'请教雨后怎样决定绕路',lines:[line('hero','遇到湿滑的路，什么时候该试着走，什么时候该绕开？'),line('mo_songnian','先看同行的人和带的东西，再问路是何时查过的。拿不准就问，别只靠脚下有力气。'),line('hero',c.footwork?'师父让我先看退步落在哪儿。我可以先找有把握的地方，不急着跨过去。':'这些我还不会判断。先把要问什么记下来，回练场再请教师父。')]}],
 closing:[line('mo_songnian','原图我还得带着走。你这页自己留好。下回有新路况，再对一遍。'),line('zhou','莫兄弟还要赶路，就不耽搁他了。萧白，回头跟我说说，你记住了哪一段。')]};
 if(id==='visitor_whiteheron_records'){
 const delivery={guided_footwork:['上回陆大哥教我走过一段坡。送到哪家、哪日到的，都记下了。','正好，拿出来看看。有不清楚的，下回问问陆衡。'],assisted_carry:['上回我们分了包一起送。包数我记着，可有几处收件的地方，还得问问同伴。','那就把同送的人也记上。回头找人问，才知道该找谁。'],asked_for_guidance:['上回我没看懂，是陆大哥带着走的。单子上还有两处，想下回再请教他。','好，把那两处圈出来，下回就不会忘了问。']}[c.delivery];
 return {intro:[line('ye','药材都记在这里。寄出去的有回话了，这两份还没消息。'),line('meng_zhiwei','先别填。我叫孟知微，白鹇谷的医案和复诊归我管。今日来对药材单子，劳烦你了。'),line('hero','寄出去就算送到了吧？'),line('meng_zhiwei','可得问问送到谁手里，有没有误了日子、用上没有。不然下回备多备少，谁也说不准。'),line('ye','是。我还想问问那边的大夫，病人近来好些没有。'),line('meng_zhiwei','那就写进信里。那边的大夫天天见着病人，比我们隔着一张纸猜要强。'),...(delivery?[line('hero',delivery[0]),line('meng_zhiwei',delivery[1])]:[line('ye','那先看眼前这批药签。没送过的那几份，等回话再说。')])],
 choices:[{key:'check_receipt',text:'先核对日期与收件人',lines:[line('hero','这份只写了寄出的日子，还没有回信。先放在这边？'),line('meng_zhiwei','对。数目对不上也先圈着，查查是少装了，还是少收到一包。')]},{key:'prepare_questions',text:'整理下一封询问信的问题',lines:[line('hero','我问包数、哪天到的、有没有受潮。病人的近况，请那边的大夫说。'),line('ye','写完给我看看。关于父亲的事，我另写一封。'),line('meng_zhiwei','这样人家好答。写好落上名字，回信也知道该捎给谁。')]}],
 closing:[line('ye','我想多看看你们怎样安排复诊。这里的日常先继续做，之后怎么学，我还要想清楚。'),line('meng_zhiwei','下回来白鹇谷，我带你去看看。真想跟着学，咱们再慢慢谈。')]};}
 if(id==='visitor_zhaochuan_greeting')return {
 intro:[line('zhaochuan_courier','周先生，试艺的场地和时辰添在这张纸上了。若有变动，我们再捎信。'),line('zhou','有劳。萧白刚入门，也要跟我去。哪几场适合他看看，劳你指点。'),line('zhaochuan_courier','我是照川来送帖的。小兄弟练过什么？我给你挑两场。'),line('hero','我才学起，怕去了看不懂。'),line('zhou','看不懂才要去看。把练过的说说，不必拘着。')],
 choices:[...(c.fist?[{key:'fist_observation',text:'介绍已学拳脚',lines:[line('hero','先练了拳脚的起手和收势，还在纠正站位。'),line('zhaochuan_courier','可以先看攻防怎样轮换，别只盯谁打得响。不会的，场后问带队的先生。')]}]:[]),...(c.sword?[{key:'sword_observation',text:'介绍已学剑式',lines:[line('hero','学过入门剑式，距离与收势还在练。'),line('zhaochuan_courier','先看双方怎样留出间隔，什么时候才进。看见漂亮的一剑，也得问前面怎样走到那里。')]}]:[]),{key:'rules_first',text:'先问旁观安排',lines:[line('hero','我先在旁边看。有什么规矩要留心？'),line('zhaochuan_courier','自然。先听场上怎样开始、怎样停，别越过场边的线。报名也有要求，到了再问明白。')]}],
 closing:[line('zhaochuan_courier','我还要把别处的帖送完。到了汉皋，你们再核一下告示，免得临时改了还照旧走。'),line('zhou','好，先把要带的东西备齐。出发前的功课，可别偷懒。')]};
 throw Error('没有这段来访剧情。');
}
function script(id,c,legacy=false){const x=raw(id,c);if(!legacy&&PH.has(id))return PH.apply(id,x,c);if(H?.has(id))return T.apply(id,x);const d=find(id);
 const full=ls=>ls.map(l=>({...l,cast:l.cast||d.cast}));
 return T.apply(id,{...x,intro:full(x.intro),closing:full(x.closing),choices:x.choices.map(ch=>{const speaking=new Set(['hero',d.actor,...ch.lines.map(l=>l.speaker)]),cast=d.cast.filter(k=>speaking.has(k));return {...ch,lines:ch.lines.map(l=>({...l,cast:l.cast||cast}))};})});
}
function init(s,id){const context={...snapshot(s),...(H&&H.has(id)?H.extra(s):{})};return {version:2,phase:'intro',cursor:0,selected:null,context,scriptSnapshot:JSON.parse(JSON.stringify(script(id,context)))};}
function eventScript(p){const v=p.visitor;return v.scriptSnapshot||(v.version===1?script(p.action,v.context,true):script(p.action,v.context));}
// 句子上的场景（地点＋时间）；师门剧情由 CultivationHousehold.script 填好，来客没有则由定义补上。
const sceneOf=l=>l&&l.place!==undefined?{place:l.place,time:l.time}:{};
function current(p){const v=p.visitor,x=eventScript(p);if(v.phase==='choice'){const cast=x.intro.at(-1)?.cast||find(p.action).cast;return {speaker:cast.find(a=>a.startsWith('hero'))||'hero',text:'这次我想……',choices:x.choices,cast,...sceneOf(x.intro[x.intro.length-1])};}const lines=v.phase==='branch'?x.choices[v.selected].lines:v.phase==='closing'||v.phase==='commit'?x.closing:x.intro;let value=lines[Math.min(v.cursor,lines.length-1)];if(value&&lines===x.closing){const br=x.choices[v.selected]?.lines||[];let c=sceneOf(br.length?br[br.length-1]:x.intro[x.intro.length-1]);for(const l of x.closing.slice(0,Math.min(v.cursor,lines.length-1)+1))c={place:l.place!==undefined?l.place:c.place,time:l.time!==undefined?l.time:c.time};value={...value,...c};}return {...value,choices:null,cast:value.cast||find(p.action).cast};}
function validate(p){const v=p.visitor;if(!v||![1,2].includes(v.version)||!['intro','choice','branch','closing','commit'].includes(v.phase)||!Number.isInteger(v.cursor)||v.cursor<0||!v.context||!['footwork','fist','sword'].every(k=>typeof v.context[k]==='boolean')||![null,'guided_footwork','assisted_carry','asked_for_guidance'].includes(v.context.delivery))throw Error('来访剧情存档格式不正确。');const x=eventScript(p);if(v.selected!==null&&(!Number.isInteger(v.selected)||!x.choices[v.selected]))throw Error('来访选择不正确。');if(['branch','closing','commit'].includes(v.phase)&&v.selected===null)throw Error('缺少来访选择。');const len=v.phase==='branch'?x.choices[v.selected].lines.length:v.phase==='closing'||v.phase==='commit'?x.closing.length:v.phase==='intro'?x.intro.length:1;if(v.cursor>=len)throw Error('来访对白位置不正确。');return v;}
function next(p){validate(p);const v=p.visitor,x=eventScript(p);if(v.phase==='choice'||v.phase==='commit')throw Error('请先选择或结束当前剧情。');const lines=v.phase==='intro'?x.intro:v.phase==='branch'?x.choices[v.selected].lines:x.closing;if(v.cursor+1<lines.length)v.cursor++;else if(v.phase==='intro'){if(x.choices.length===1&&x.choices[0].auto){v.selected=0;v.phase='branch';}else v.phase='choice';v.cursor=0;}else if(v.phase==='branch'){v.phase='closing';v.cursor=0;}else{v.phase='commit';return true;}return false;}
function choose(p,index){validate(p);const v=p.visitor;if(v.phase!=='choice'||!Number.isInteger(index)||!eventScript(p).choices[index])throw Error('请选择当前可用的回答。');v.selected=index;v.phase='branch';v.cursor=0;}
function effects(s,p){const d=find(p.action),v=p.visitor,x=eventScript(p),key=x.choices[v.selected].key;s.facts[p.action+'_choice']=key;for(const actor of new Set([...x.intro,...x.choices[v.selected].lines,...x.closing].map(l=>l.speaker))){if(!actor.startsWith('hero')&&!['title','narrator'].includes(actor))s.facts['met_'+actor]||={source:p.action,period:p.period};}if(H&&H.has(p.action))H.effects(s,p,key);}
function status(s,d){const now=(s.month-1)*5+s.phase;return s.facts[d.id+'_seen']?'已相识':now<d.window[0]?'即将来访':now>d.window[1]?'已离谷':'正在来访';}
const actions=definitions.map(d=>({...d,category:'stroll',intro:d.notice,task:'参与来客的具体交接，先看已说明的安排。',requires:['joined'],costOverride:d.cost,fixedGain:true,visitor:true,once:d.id+'_seen',choice:['请选择当前可用的回答'],presentation:'dialogue',storyPortrait:'assets/production/cultivation/household-v1/'+d.actor+'.png',portraitRect:[0,0,1024,1536],feedback:d.name+'已完成；记录来自这次实际交谈。'}));
const notices=definitions.map(d=>({slot:d.window[0]-2,id:d.id+'_notice',text:d.notice}));
if(H){actions.push(...H.actions);notices.push(...H.notices);}
const selectedKey=(s,p)=>eventScript(p).choices[p.visitor.selected]?.key;
const API={selectedKey,definitions,household:H||null,all,actions,notices,snapshot,script,eventScript,init,current,validate,next,choose,effects,status};if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationVisitors=API;
})(typeof globalThis!=='undefined'?globalThis:this);
