'use strict';
// 支线任务与消息铺内容（工作流 W3），设计见 docs/design/13-支线任务与消息铺.md
// 加载在 story.js 之后：通过包装已登场 NPC 的 act（原剧情分支优先）插入支线入口；向场景追加少量互动点。
// 对外约定（供「江湖 · 任务」菜单读取）：
//   window.QUESTS[id] = {id,name,giver,where,early,kind,stages:[...各阶段描述],reward}
//   S.quests[id] = {stage, done, ...附加字段}   stage 0/缺省 = 未接；done=true 已了结（含失败结局，见 end 字段）
//   window.questEntries() → [{id,name,giver,where,stage,done,end,desc,reward}]（仅已接的）
//   window.questLog() 已被包装：在主线条目之后追加【支线】条目（{done,t,d}）
(()=>{
// ───────── 任务表 ─────────
const QUESTS={
  q_smith:{name:'风箱与箭镞',giver:'石铁匠',where:'襄阳街市 · 城门',early:true,kind:'帮工',
    stages:['','帮石铁匠拉完风箱，他托你把一捆箭镞送到城门守门军士手里。','箭镞已交到城防营手里，回铁匠铺结工钱。'],
    reward:'工钱 10–14 两 + 守卫赏钱 15 两 + 结账 15 两（或一件粗布短打）'},
  q_camp:{name:'校场募勇',giver:'守门军士',where:'襄阳城 · 城门',early:true,kind:'比武',
    stages:['','城防营在募勇，过一关给一关的赏钱。去找守门军士比试第一关。','第一关已过。第二关：什长。','前两关已过。第三关的教头只见「懂行」的人——先打听打听城防营的事。','三关已过。教头说，城头上给你留了个位置。'],
    reward:'第一关 10 两 · 第二关 20 两 + 金创药 · 第三关 30 两 + 武学残页'},
  q_book:{name:'说书匣',giver:'说书老伯',where:'襄阳街市 · 偏巷',early:true,kind:'追回',
    stages:['','一个泼皮抢了说书老伯的书钱匣子，往偏巷跑了。','书匣夺回来了，还给说书老伯。'],
    reward:'书钱 12 两，或悟性 +1（推辞谢礼）'},
  q_bamboo:{name:'竹片暗记',giver:'丐帮 吴长老',where:'偏巷 · 东津渡',kind:'跑腿',
    stages:['','吴长老托你把一片刻着丐帮暗记的竹片，带给东津渡的老船夫汤老舵（渡口在交出解药后开放）。','老船夫收下了竹片，托你带话回偏巷。'],
    reward:'武学「莲花落」（未学者）或 武学残页；侠义 +1'},
  q_salt:{name:'一船盐',giver:'汤老舵',where:'东津渡 · 渡船',kind:'护送',
    stages:['','盐商要搭汤老舵的渡船过江，江心常有水匪截船——请你在船上照应（下一趟过江时）。'],
    reward:'船钱 40 两（或让一半给船夫修船）+ 金创药'},
  q_monk:{name:'默庵的咳嗽',giver:'老僧 默庵',where:'羊太傅庙外',kind:'小义',
    stages:['','老僧说是早年在军中挨过一箭，落下的病根，逢阴雨便咳。药引要一壶竹叶青（铁匠铺有售）。'],
    reward:'定力 +1 · 侠义 +1（苏芷同行时可省下药引，好感 +1）'}};
window.QUESTS=Object.assign(window.QUESTS||{},Object.fromEntries(Object.entries(QUESTS).map(([k,v])=>[k,{id:k,...v}])));

// ───────── 状态 ─────────
const qs=id=>(S&&S.quests&&S.quests[id])||{stage:0,done:false};
function qset(id,stage,extra){S.quests=S.quests||{};const q=S.quests[id]||(S.quests[id]={stage:0,done:false});
  const first=!q.stage&&stage>0;q.stage=Math.max(q.stage||0,stage);if(extra)Object.assign(q,extra);
  if(first)toast(`【支线】${QUESTS[id].name}`,1500);hud();return q}
function qdone(id,end='ok'){const q=qset(id,qs(id).stage||1,{done:true,end});toast(`支线完成 · ${QUESTS[id].name}`,1500);hud();save();return q}
const qon=id=>{const q=qs(id);return q.stage>0&&!q.done};
const R=id=>!!(S.rumors&&S.rumors[id]);
const silver=async n=>{S.silver+=n;await gain(`银两 ${n>0?'+':''}${n}`)};
window.QAPI={get:qs,set:qset,done:qdone};
window.questEntries=function(){if(!S)return[];return Object.values(window.QUESTS).filter(Q=>qs(Q.id).stage>0).map(Q=>{const q=qs(Q.id);
  return{id:Q.id,name:Q.name,giver:Q.giver,where:Q.where,stage:q.stage,done:!!q.done,end:q.end||null,desc:q.done?endText(Q.id,q):(Q.stages[q.stage]||''),reward:Q.reward}})};
function endText(id,q){return{q_smith:'铁匠结清了工钱，说往后常来。',q_camp:'三关已过。教头说：城破之日，城头上给你留个位置。',
  q_book:q.end==='split'?'你和泼皮分了书钱。老伯什么也没说，第二天换了个地方说书。':'书匣物归原主。老伯的醒木又拍响了。',
  q_bamboo:'竹片送到，话也带回。丐帮记下了你这份人情。',q_salt:'盐包平安过了江心。',q_monk:'老僧的咳嗽轻了些。可那咳声，总让人心里发紧。'}[id]||'已了结。'}
// 江湖 · 任务：主线之后追加支线
const _log=window.questLog;
const sideRows=()=>window.questEntries().map(e=>({id:e.id,done:e.done,t:e.name,giver:e.giver,d:`${e.desc}<br><span class="muted">${e.where}　报酬：${e.reward}</span>`})).sort((a,b)=>a.done-b.done);
// W4 菜单（menu.js 的 mnQuests）优先调用 QUESTS.log()；不可枚举，避免被当成任务定义遍历
Object.defineProperty(window.QUESTS,'log',{value:sideRows,enumerable:false,configurable:true});
// 旧任务页（ui.js TAB.quest，仅在 menu.js 未接管时）：在主线之后追加【支线】
window.questLog=function(){const L=_log?_log():[];if(typeof mnQuests==='function')return L;for(const e of sideRows())L.push({done:e.done,t:'【支线】'+e.t,d:e.d});return L};

// ───────── 物品（要物，登记见文档 13 §5）─────────
for(const[k,v]of Object.entries({
  arrows:{name:'一捆箭镞',desc:'石铁匠刚淬好的三棱箭镞，用草绳捆着，送城门守门军士。',key:1},
  shuxia:{name:'说书匣',desc:'说书老伯装书钱的旧木匣，匣盖上刻着「岘山」二字。',key:1},
  zhupian:{name:'丐帮竹片',desc:'一片磨得发亮的竹片，刻着三道斜痕——丐帮的暗记。',key:1}}))if(!ITEMS[k])ITEMS[k]=v;
if(typeof ICO==='object')Object.assign(ICO,{arrows:'箭',shuxia:'匣',zhupian:'竹'});

// ───────── 坐标：由现有 NPC / 路人 / 场景起点派生（M 重排后自动跟随），并吸附到可站点 ─────────
function anchorXY(a){const sc=SC[a.sc];if(!sc)return[10,10];
  if(a.npc){const n=(sc.npcs||[]).find(n=>n.id===a.npc);if(n)return[n.x,n.y]}
  if(a.extra){const e=(sc.extras||[]).find(a.extra);if(e&&e.x!=null)return[e.x,e.y]}
  return a.xy||sc.start||[10,10]}
function spot(a){const c={k:'',x:0,y:0,ok:false};
  const upd=()=>{const[bx,by]=anchorXY(a),tx=bx+(a.dx||0),ty=by+(a.dy||0),k=tx+','+ty;if(c.k===k&&c.ok)return;c.k=k;c.x=tx;c.y=ty;c.ok=false;
    if(typeof cur==='undefined'||cur!==SC[a.sc]||!cur.grid)return;
    for(let r=0;r<=8;r+=.25)for(let i=0,m=r?Math.max(8,Math.round(r*10)):1;i<m;i++){const x=tx+Math.cos(i/m*6.283)*r,y=ty+Math.sin(i/m*6.283)*r;
      if(standOk(x*TS,y*TS)){c.x=x;c.y=y;c.ok=true;return}}c.ok=true};
  return{get x(){upd();return c.x},get y(){upd();return c.y}}}
function addNpc(scId,def,pos){const sc=SC[scId];if(!sc||(sc.npcs||[]).some(n=>n.id===def.id))return;
  Object.defineProperty(def,'x',{get:()=>pos.x,set(){},enumerable:true});Object.defineProperty(def,'y',{get:()=>pos.y,set(){},enumerable:true});(sc.npcs=sc.npcs||[]).push(def)}
function wrap(scId,id,fn,mark){const n=SC[scId]&&(SC[scId].npcs||[]).find(n=>n.id===id);if(!n)return;const prev=n.act,pm=n.mark;
  n.act=async function(x){return fn.call(this,x,()=>prev.call(this,x))};if(mark)n.mark=()=>!!(mark()||(pm&&pm()))}

// ───────── 消息铺：每条消息各有去向 ─────────
// kind：地点 / 折扣 / 看破 / 寻宝 / 支线 / 秘闻 / 引荐；need() 未满足时显示「未到货」
const KIND_C={地点:'#7fb7d8',折扣:'#e0bf78',看破:'#ff8a3a',寻宝:'#9fd48a',支线:'#e6a0c4',秘闻:'#b6a6ff',引荐:'#f0d060'};
const WEAK_HINT={wolf:{rid:'wolf',w:['剑','阳'],line:'（你想起侯七的话：狼皮薄，怕利刃；更怕火。）'},
  bandit:{rid:'bandit',w:['拳','棍'],line:'（你想起侯七的话：这帮人下盘虚浮，拳脚棍棒一扫就倒。）'},
  chief:{rid:'heifeng',w:['刀','阳'],line:'（你想起侯七的话：独眼阎罗瞎了左眼——从他左手边进刀，火把晃他那只好眼。）'}};
const RUMOR_DEF=[
  {id:'heifeng',t:'黑风寨近况',p:10,tag:'要闻',kind:'看破',val:'黑风寨底细 · 与独眼阎罗交手时自动看破「刀」「阳」',tease:'城外山贼闹得凶，官府都头疼……想知道底细？',unlock:'看破 · 独眼阎罗：刀、阳',
   txt:'黑风寨寨主「独眼阎罗」，早年在军中吃过粮，后来当了逃兵落草。他左眼瞎了，左手边是死角；夜里怕火把晃眼。寨子劫了东津渡好几条船，连军粮都敢动。渡口上天天有人去收「过江钱」，摆渡的老汉最清楚他们的底。',
   on(){setFlag('rumor')},follow:()=>hasFlag('chief_dead')?'✔ 独眼阎罗已伏诛':'✔ 与独眼阎罗交手时自动看破「刀」「阳」',
   after:'东津渡那边，等你手上的事了了再去。路上当心野狼。'},
  {id:'smith',t:'铁匠的老底',p:6,tag:'市井',kind:'折扣',val:'铁匠铺兵器、护甲从此八折',tease:'石铁匠左手为何少了两根指头？',unlock:'铁匠铺 · 兵器护甲八折',
   txt:'街上的石铁匠，年轻时在城防营当过十年弓手，左手两根指头是给北边人的马刀削掉的。脾气硬，心却软——跟他提一句「老营的弟兄」，刀剑甲胄他都肯让两成。',
   follow:()=>hasFlag('q_disc_told')?'✔ 石铁匠认了这份交情，兵器护甲八折':'→ 去铁匠铺，提一句「老营的弟兄」',after:'去铁匠铺提一句「老营的弟兄」，保你省下一截银子。'},
  {id:'wolf',t:'山道狼群',p:4,tag:'行路',kind:'看破',val:'战斗中自动看破野狼弱点（剑、阳）',tease:'出城的山道上，天一擦黑就有狼……',unlock:'看破 · 野狼：剑、阳',
   txt:'出城往东津渡的山道上，饿狼成群。老猎户说：狼皮薄，怕刀剑划；更怕火，火把一晃就夹尾巴。——遇上了，别跟它们硬顶拳头。',
   follow:()=>'✔ 与野狼交手时自动看破「剑」「阳」',after:'记住喽：狼怕刃，更怕火。'},
  {id:'cache',t:'土地龛下的私房钱',p:6,tag:'寻宝',kind:'寻宝',val:'偏巷标出一处藏银点（约 20 两 + 伤药）',tease:'一个赌鬼的私房钱，到现在还没人去取……',unlock:'偏巷 · 土地龛旁出现闪光',
   txt:'偏巷东头院墙边有个小土地龛，一个赌鬼把私房钱塞在龛下砖缝里。后来他欠了铁臂帮的债，逃回乡下去了，那钱就一直搁着。——别说是侯七讲的。',
   follow:()=>hasFlag('q_cache')?'✔ 砖缝里的钱已取出':'→ 偏巷东头院墙旁的土地龛',after:'院墙边的小土地龛，砖缝，自己摸。拿了钱，替那赌鬼给土地公上柱香。'},
  {id:'gaibang',t:'偏巷里的老叫化',p:5,tag:'江湖',kind:'支线',val:'吴长老会托你办事（支线「竹片暗记」）',tease:'偏巷那个讨饭的，可不是一般人。',unlock:'支线 · 竹片暗记',
   txt:'偏巷里那个讨饭的老头，眼睛亮得吓人，巷里的地痞见了他都绕道走。他是丐帮荆襄分舵的吴长老，暗里替城防营打听消息，江上也有他的眼线——你若当面叫破他的身份，他多半有事托你。',
   follow:()=>qs('q_bamboo').done?'✔ 已替吴长老办完事':qs('q_bamboo').stage?'… 支线「竹片暗记」进行中':'→ 去偏巷，当面问问吴长老',after:'见了吴长老，客气些。他要是托你办事，那是看得起你。'},
  {id:'yangmiao',t:'羊太傅庙的怪事',p:5,tag:'奇闻',kind:'秘闻',val:'庙外标出一处断碑（悟性 +1 · 武学线索）',tease:'城南那座破庙，半夜有人点灯……',unlock:'庙外空地 · 古井旁出现闪光',
   txt:'城南羊太傅庙香火稀了，守庙的老和尚夜里不睡觉，常点着灯看一卷旧东西；看累了，就去古井旁那半截断碑前坐着。那碑是羊公旧部立的，字给雨水冲得差不多了，据说还剩几行练兵的话。',
   follow:()=>hasFlag('q_stele')?'✔ 已拓读断碑':'→ 庙外空地，古井旁的荒草里',after:'读书人去看那断碑，兴许比我这张嘴值钱。'},
  {id:'fancheng',t:'樊城的探马',p:8,tag:'城防',kind:'引荐',val:'城防营教头愿意见你（校场第三关）',tease:'城头的兵为何夜里也不下城墙？',unlock:'校场募勇 · 第三关开放',
   need:()=>qs('q_camp').stage>0,needTxt:'先去城门跟城防营打过交道再说。',
   txt:'北边的探马这个月已经三回摸到樊城外头。城防营正四处收铁器、招壮丁，校场上的教头姓什么我不说，只告诉你：他只跟「知道樊城那三回探马」的人过招。',
   follow:()=>qs('q_camp').stage>=4?'✔ 已过校场第三关':'→ 城门守门军士：请见教头',after:'见了教头，就说你知道樊城那三回探马。'},
  {id:'bandit',t:'黑风喽啰的破绽',p:8,tag:'江湖',kind:'看破',val:'战斗中自动看破喽啰、打手弱点（拳、棍）',tease:'那帮山贼刀法看着凶，其实……',unlock:'看破 · 喽啰/打手：拳、棍',
   need:()=>XQ()>=2,needTxt:'你还没跟铁臂帮的人照过面，说了你也不信。',
   txt:'黑风寨的喽啰、铁臂帮的打手，都是一个路数：抡刀往前扑，下盘虚得很。拳脚、棍棒往腿上招呼，一扫一个跟头。',
   follow:()=>'✔ 与喽啰、打手交手时自动看破「拳」「棍」',after:'喽啰下盘虚，照腿招呼。'},
  {id:'qingchong',t:'账簿上的青虫印',p:15,tag:'秘闻',kind:'秘闻',val:'主线伏笔：青虫印的来处（第二章线索）',tease:'你手里那本账簿，末页压着个什么印？',unlock:'线索 · 青虫印与当票',
   need:()=>!!S.bag.ledger||XQ()>=3,needTxt:'等你手里有了铁臂帮的东西，再来问我。',
   txt:'（侯七盯着那枚青虫朱印看了很久，声音压得极低）这印我见过——在一张当票的背面。城里哪家当铺，侯七不敢说，也劝你别急着问。铁臂帮、黑风寨，都只是替人收钱的。',
   on(){setFlag('hint_qingchong')},follow:()=>'✔ 青虫印见于当票背面（第二章）',after:'今儿这话，出我口，入你耳。'}];
// 就地替换 RUMORS 内容（story.js 的 const 数组），旧档已买的 id 沿用
if(typeof RUMORS!=='undefined'){RUMORS.length=0;RUMORS.push(...RUMOR_DEF)}
const RM=typeof RUMORS!=='undefined'?RUMORS:RUMOR_DEF;
const rAvail=r=>!r.need||r.need();

(function css(){const st=document.createElement('style');st.textContent=`
.gp.bao .rlist{display:flex;flex-direction:column;gap:.28em;overflow:auto;min-height:0;flex:1 1 auto;scrollbar-width:thin;scrollbar-color:var(--bz) transparent}
.gp.bao .rrow .nm{display:flex;align-items:center;gap:.5em}
.gp.bao .rk{font-family:var(--sans);font-size:max(10px,.68em);padding:0 .45em;border:1px solid currentColor;letter-spacing:.05em;white-space:nowrap}
.gp.bao .rrow.lock{opacity:.55}
.gp.bao .rbuy .val{font-size:.85em;color:var(--jade)}
.gp.bao .note .fw{margin-top:.25em;font-size:.82em;color:#6a3a12;letter-spacing:.05em}`;document.head.appendChild(st)})();

// 覆盖 ui.js 的 rumorBroker：左侧货单（类型标签 · 未到货），右侧见闻簿（每条附「后续」进度）
rumorBroker=function(n,list){return new Promise(res=>{const p=openPanel('gp bao');S.rumors=S.rumors||{};const got=[];
  let sel=list.findIndex(r=>!S.rumors[r.id]&&rAvail(r));if(sel<0)sel=0;let flash=0,newId=null;
  const kd=e=>{if(dlgBusy||$('panel').hidden||panelKind!=='rumor')return;
    if(e.key==='ArrowDown'||e.key==='s'){sel=(sel+1)%list.length;e.preventDefault();draw()}
    else if(e.key==='ArrowUp'||e.key==='w'){sel=(sel-1+list.length)%list.length;e.preventDefault();draw()}
    else if(e.key==='Enter'||e.key===' '){const b=p.querySelector('#rb');if(b&&!b.disabled){e.preventDefault();b.click()}}};
  addEventListener('keydown',kd);
  panelClose=()=>{removeEventListener('keydown',kd);hud();res(got)};
  const badge=r=>`<span class="rk" style="color:${KIND_C[r.kind]||'#ccc'}">${r.kind}</span>`;
  const draw=()=>{panelKind='rumor';const r=list[sel];const known=list.filter(x=>S.rumors[x.id]);const av=rAvail(r);
    const buy=S.rumors[r.id]?`<span class="${r.id===newId?'jade':'muted'}">${r.id===newId?'已记入右侧「江湖见闻」。':'这条你已经听过了。'}</span><div class="val">${esc(r.follow?r.follow():'')}</div>`
      :!av?`<div class="hint2">${r.tease}</div><div class="why">未到货：${r.needTxt||'时候未到。'}</div>`
      :`<div class="hint2">${r.tease}</div><div class="val">买下可得：${r.val}</div><button id="rb" class="pri" ${S.silver<r.p?'disabled':''}>付 ${r.p} 两 · 打听</button>${S.silver<r.p?'<div class="why">银两不够——铁匠铺、城门校场都能挣几个钱</div>':''}`;
    p.innerHTML=gpShell(p,n,'包打听 · 消息铺',`银两 <b class="coin"><i class="cn"></i>${S.silver}</b>${flash?`<em class="fly">−${flash}</em>`:''}`)+
      `<div class="gp-main frame"><div class="baow">
        <div class="menu"><h3>今日有售</h3><div class="rlist">${list.map((x,j)=>{const k=S.rumors[x.id],a=rAvail(x);return`<button class="rrow${j===sel?' on':''}${k?' known':''}${!k&&!a?' lock':''}" data-j="${j}"><span class="nm">${badge(x)}${x.t}</span><span class="pr">${k?'已知':!a?'未到货':x.p+'<small>两</small>'}</span></button>`}).join('')}</div>
          <div class="rbuy">${buy}</div></div>
        <div class="log"><h3>江湖见闻<small>${known.length}/${list.length}</small></h3>${known.length?known.map(x=>`<div class="note${x.id===newId?' new':''}"><div class="nt">${x.t}${x.tag?`<span class="tag">${x.tag}</span>`:''}</div><p>${x.txt}</p>${x.unlock?`<div class="ul">✦ ${x.unlock}</div>`:''}${x.follow?`<div class="fw">${esc(x.follow())}</div>`:''}</div>`).join(''):'<div class="empty">尚未打听到任何消息</div>'}</div>
       </div></div><button id="pc" class="gp-close">离开</button>`;
    flash=0;panelRedraw=draw;
    p.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{sel=+b.dataset.j;draw()});
    p.querySelector('#pc').onclick=closePanel;
    p.querySelector('.rrow.on')?.scrollIntoView({block:'nearest'});
    const b=p.querySelector('#rb');if(b)b.onclick=()=>{if(S.silver<r.p||S.rumors[r.id]||!rAvail(r))return;S.silver-=r.p;S.rumors[r.id]=1;got.push(r.id);flash=r.p;newId=r.id;r.on&&r.on();draw();
      p.querySelector('.note.new')?.scrollIntoView({block:'nearest'})}};
  draw()})};

// 包打听：保留青蚨散查访分支（story.js），其余改为按所购消息逐条交代后续
wrap('street','gossip',async function(n,prev){
  if(XQ()>=1&&XQ()<3&&!hasFlag('xq_c_gossip'))return prev();
  S.rumors=S.rumors||{};if(hasFlag('rumor'))S.rumors.heifeng=1;
  const fresh=RM.filter(r=>!S.rumors[r.id]&&rAvail(r));
  if(!hasFlag('gossip_met')){setFlag('gossip_met');await talk(n,'哟，小兄弟面生得很，第一次进城？','耳目最灵的侯七，街坊都叫我「包打听」。江湖上的消息，只要你给得起价钱……','我这儿的消息可不是听个响——买了哪条，哪条就有用处：能省钱、能挣钱、能保命。')}
  else await talk(n,!fresh.length?'我肚子里的货都倒给你啦，过些日子再来。':RM.some(r=>!S.rumors[r.id]&&r.need&&r.need()&&!hasFlag('rseen_'+r.id))?'来得巧，今儿刚到了新货！':'又来照顾生意了？今儿个的消息，新鲜着呢。');
  for(const r of RM)if(rAvail(r))setFlag('rseen_'+r.id);
  const got=await rumorBroker(n,RM);
  for(const id of got){const r=RM.find(x=>x.id===id);if(r&&r.after)await talk(n,r.after)}
  if(!got.length){const cheap=Math.min(...RM.filter(r=>!S.rumors[r.id]&&rAvail(r)).map(r=>r.p).concat(99));
    if(cheap<99&&S.silver<cheap)await talk(n,'没钱？铁匠铺正缺人拉风箱，城门校场也在募勇——挣了钱再来。');
    else await talk(n,'不买？那就回头再来，消息可不等人。')}
  else if(got.length>1)await talk(n,'这些消息可只卖给你一个人，嘘——');
},()=>RM.some(r=>!S.rumors?.[r.id]&&r.need&&r.need()&&!hasFlag('rseen_'+r.id)));

// 主线门槛（01 §5.3 #10 #11）：渡口只在交出解药（xq≥4）后开放，与是否同行无关；消息铺不再开放地点
wrap('street','suzhi',async function(n,prev){await prev();if(XQ()>=4&&!S.unlocked.ferry){S.unlocked.ferry=1;await toast('大地图新增 · 东津渡',1600)}});

// ───────── 看破：买过的消息在战斗开场自动揭示弱点 ─────────
function hintsFor(foes){const out=[];for(const f of foes||[]){const k=(f.sp||'').replace(/^c_/,''),h=WEAK_HINT[k];if(h&&R(h.rid)&&!out.includes(h))out.push(h)}return out}
addEventListener('DOMContentLoaded',()=>{
  if(typeof mkFoe==='function'){const _mk=mkFoe;mkFoe=function(t,i){const u=_mk(t,i);const h=WEAK_HINT[u.key];
    if(h&&S&&R(h.rid))for(const w of h.w)if(u.weak.includes(w))u.known.add(w);return u}}
  if(typeof battle==='function'){const _b=battle;battle=function(opt={}){const hs=hintsFor(opt.foes);
    if(hs.length)opt=Object.assign({},opt,{intro:[].concat(opt.intro||[],hs.map(h=>h.line))});return _b(opt)}}});

// ───────── 隐藏互动点（消息解锁）─────────
addNpc('alley',{id:'q_cache',name:'土地龛',sp:null,verb:'摸索',show:()=>R('cache')&&!hasFlag('q_cache'),async act(){
  await narr('土地龛前香灰积了半指厚。你蹲下身，在龛座底下摸到一块松动的砖。');
  setFlag('q_cache');await narr('砖缝里塞着一只油布包：一把碎银，还有一小瓶伤药。');await silver(20);await giveItem('pill');
  const c=await choose('','（侯七说，拿了钱替那赌鬼给土地公上柱香）',['拈一撮香灰，拜三拜','拿了就走']);if(c===0)await moral(1)}},
  spot({sc:'alley',npc:'shrine',dx:-1.05,dy:.18,xy:[52.8,28.43]}));
addNpc('temple_out',{id:'q_stele',name:'断碑',sp:null,verb:'拓读',show:()=>R('yangmiao')&&!hasFlag('q_stele'),async act(){
  await narr('荒草里斜躺着半截石碑，碑面给雨水冲得坑坑洼洼，只剩几行字还能辨认。');
  await narr('「……守者，非坐城而待之也。敌来则示之以坚，敌去则抚之以恩……」');
  const c=await choose('','（你盯着这几行字看了许久——）',['细细揣摩字里的用兵之道','拓一张，改日给说书老伯看']);
  setFlag('q_stele');setFlag('hint_yangbei');
  if(c===0){S.st.wis++;await gain('悟性 +1');await narr('你隐约觉得，这几句话说的不只是守城，也是运气行功的道理。（心法线索【后续章节】）')}
  else{S.bag.book=(S.bag.book||0)+1;await gain('获得 武学残页');await narr('老伯见了拓片，定有话说。')}}},
  spot({sc:'temple_out',npc:'well',dx:-1.8,dy:6.05}));

// ───────── 支线一：风箱与箭镞（铁匠 → 城门守卫 → 铁匠）· 开局帮工 ─────────
const BELLOWS=[['炉膛里的火苗发红，懒洋洋地舔着铁坯。','快拉！',['快拉','慢拉','停一停'],0],
  ['火苗窜得发白，铁坯边上开始冒火星。','稳住——',['快拉','慢拉','停一停'],1],
  ['铁匠把铁坯夹到砧上，抡起了大锤。','这会儿别拉，免得火星溅他一脸。',['快拉','慢拉','停一停'],2]];
wrap('street','smith',async function(n,prev){
  const q=qs('q_smith'),disc=R('smith');
  let questHandled=false;
  if(!(XQ()===2&&!hasFlag('xq_c_smith'))){
    if(!q.stage){const first=!hasFlag('smith_met');setFlag('smith_met');
      await talk(n,first?'哟，生面孔！俺这铺子打了三十年铁，襄阳城里数一数二。':'又来啦？','城防营催一批箭镞，俺那徒弟跑去街心看热闹，一上午没见人影！');
      const c=await choose(n.name,'小兄弟，替俺拉一炷香的风箱？工钱照给。',['「我来。」','「先看看货。」'],n.sp);
      if(c===0){let right=0;await talk(n,'听俺吆喝，火候看颜色。');
        for(const[s,hint,o,a]of BELLOWS){await narr(s);const k=await choose(n.name,hint,o,n.sp);if(k===a){right++;await gain('火候正好')}else await narr('火苗一歪，铁匠皱了皱眉。')}
        const pay=8+right*2;await talk(n,right===3?'好手！比俺那徒弟强多了！':'还凑合。',`这 ${pay} 两是工钱。`);await silver(pay);
        await talk(n,'还有一桩：这捆箭镞，劳你送到城门守门军士手里。回来俺再结你一份。');await giveItem('arrows');qset('q_smith',1);questHandled=true}}
    else if(q.stage===1&&S.bag.arrows)await talk(n,'箭镞送去城门没？城头上等着用呢。');
    else if(q.stage===2&&!q.done){await talk(n,'送到啦？守卫没为难你吧？','说好的，再结你一份。钱，还是拿件衣裳？');
      const c=await choose(n.name,'（铁匠从柜底抽出一件粗布短打）',['要 15 两银子',`要那件粗布短打（值 ${ITEMS.cloth.price} 两）`],n.sp);
      if(c===0)await silver(15);else await giveItem('cloth');qdone('q_smith');await talk(n,'往后常来！');questHandled=true}}
  if(disc&&!hasFlag('q_disc_told')){setFlag('q_disc_told');await say(S.name,'老营的弟兄，给个实在价？',HE('smile'));
    await talk(n,'……你这娃，连俺在城防营当过兵都打听到了？','得，看在老营的面上，刀剑甲胄一律八折！')}
  if(questHandled)return;
  // 八折：只在本次买卖期间临时改价，结束即还原
  const saved=[];if(disc)for(const k of Object.keys(ITEMS)){const it=ITEMS[k];if(it.price&&(it.weapon||it.armor)){saved.push([k,it.price]);it.price=Math.round(it.price*.8)}}
  try{return await prev()}finally{for(const[k,v]of saved)ITEMS[k].price=v}
},()=>{const q=qs('q_smith');return !q.stage||(q.stage===2&&!q.done)||(R('smith')&&!hasFlag('q_disc_told'))});

// ───────── 支线二：校场募勇（守门军士）· 比武挣钱 ─────────
const CAMP=[
  {name:'城防营新兵',sp:'c_soldier',lv:2,st:{str:4,con:4,agi:3,wil:3,wis:2},skills:{fist:1},h:170,exp:15,silver:0,shield:2,weak:['拳','剑','阴']},
  {name:'城防营什长',sp:'c_soldier',lv:4,st:{str:6,con:5,agi:4,wil:4,wis:3},skills:{fist:1,blade:1},h:175,exp:40,silver:0,shield:3,weak:['拳','暗器','毒']},
  {name:'城防营教头',sp:'c_soldier',lv:6,st:{str:8,con:7,agi:6,wil:6,wis:5},skills:{fist:1,blade:1},h:180,hpMul:.6,exp:90,silver:0,shield:4,weak:['剑','阴','雷'],boss:true}];
async function campBout(n){const q=qs('q_camp'),i=Math.max(0,q.stage-1);
  if(i===2&&!R('fancheng')){await talk(n,'第三关？教头忙着呢，不见生人。','……你要是真懂城防上的事，再来。');return}
  const pre=['第一关，跟新来的弟兄过过手。点到为止！','第二关，什长亲自来。他手上可没轻重。','教头，这小子想见您。'][i];await talk(n,pre);
  if(i===2)await say('城防营教头','樊城那三回探马的事，你也知道？……好，来，让我看看你的斤两。','c_soldier');
  const r=await battle({bg:'bg_gate',foes:[JSON.parse(JSON.stringify(CAMP[i]))],noLose:true,boss:i===2});
  if(r!=='win'){await talk(n,'倒了？回去练练再来，校场不收你钱。');return}
  if(i===0){await talk(n,'有两下子！赏钱拿着。');await silver(10);qset('q_camp',2)}
  else if(i===1){await talk(n,'好！连什长都放倒了。这是赏钱，还有一瓶金创药。');await silver(20);await giveItem('pill');qset('q_camp',3)}
  else{await say('城防营教头','好身手。这卷残页是我从北边带回来的，你拿去。','c_soldier');await silver(30);await giveItem('book');
    await say('城防营教头','蒙古人迟早要来。到那天，城头上给你留个位置。','c_soldier');await moral(1);qset('q_camp',4);qdone('q_camp')}}
wrap('gate','soldier',async function(n,prev){
  if(!hasFlag('gate_ok')){await prev();if(hasFlag('gate_ok')&&!qs('q_camp').stage){await talk(n,'对了——城防营正在校场募勇，过一关给一关的赏钱。缺盘缠了就来找我。');qset('q_camp',1)}return}
  if(qs('q_smith').stage===1&&S.bag.arrows){
    await talk(n,'铁匠铺的箭镞？来得正好，城头的弩手等着呢！');S.bag.arrows=0;
    const c=await choose(n.name,'（守卫掏出一串铜钱）辛苦你跑一趟，这是赏钱。',['收下 15 两','「守城要紧，钱留给弟兄们买酒。」'],n.sp);
    if(c===0)await silver(15);else{await moral(1);await talk(n,'……好小子。这情我记下了。');setFlag('q_camp_friend')}
    qset('q_smith',2);if(!qs('q_camp').stage){await talk(n,'对了，城防营在校场募勇，过一关给一关的赏钱。有兴趣就来找我。');qset('q_camp',1)}return}
  const q=qs('q_camp');if(!q.stage){await talk(n,'城防营在校场募勇，过一关给一关的赏钱。');qset('q_camp',1);return}
  if(qon('q_camp')){const i=qs('q_camp').stage;const c=await choose(n.name,'要比试吗？',[`校场比试（第${'一二三'[i-1]}关）`,'改日再来'],n.sp);if(c===0)await campBout(n);return}
  return prev()},
()=>(qs('q_smith').stage===1&&S.bag.arrows)||(hasFlag('gate_ok')&&!qs('q_camp').stage)||(qs('q_camp').stage===3&&R('fancheng')));

// ───────── 支线三：说书匣（说书老伯 → 偏巷泼皮）─────────
const PIPI={name:'泼皮',sp:'c_bandit'};
wrap('street','oldman',async function(n,prev){
  if((XQ()>=1&&XQ()<3&&!hasFlag('xq_c_oldman'))||!hasFlag('quiz'))return prev();
  const q=qs('q_book');
  if(!q.stage){await talk(n,'哎呀！老汉的书钱匣子！','方才人一挤，一个歪戴帽子的泼皮顺手就摸了去，往偏巷那头跑了！');
    const c=await choose(n.name,'那里头是老汉半个月的饭钱……',['「老伯莫急，我去追。」','「……人都跑了，追不上了。」'],n.sp);
    if(c===0){qset('q_book',1);await talk(n,'好后生！当心些，那泼皮跟铁臂帮的人厮混。')}else await talk(n,'唉……');return}
  if(q.stage===1&&!q.done){await talk(n,'偏巷……那泼皮往偏巷跑了。');return}
  if(q.stage===2&&!q.done&&S.bag.shuxia){S.bag.shuxia=0;await talk(n,'我的匣子！一文都没少！');
    const c=await choose(n.name,'后生，这里头的一半你拿去——不，你别推辞！',['收下（12 两）','「老伯留着吃饭。给我再讲一段羊公吧。」'],n.sp);
    if(c===0){await silver(12);await talk(n,'拿着，拿着！')}
    else{await moral(1);await talk(n,'……好，好。老汉讲一段没往外讲过的：','羊公守襄阳，从不夜里偷营。他说，仗打得赢打不赢是一回事，人心收得住收不住是另一回事。','你听懂了这句，比听懂一百段书都强。');S.st.wis++;await gain('悟性 +1')}
    qdone('q_book');return}
  if(q.done&&q.end==='split'){await talk(n,'……今儿不讲了。');return}
  if(hasFlag('q_stele')&&!hasFlag('q_stele_told')){setFlag('q_stele_told');await talk(n,'你去看过庙外那半截断碑了？「示之以坚，抚之以恩」……','那是羊公的兵法心诀，没写全。剩下的半截，听说埋在岘山上。——那是往后的事喽。')}
  return prev()},()=>{const q=qs('q_book');return hasFlag('quiz')&&(!q.stage||(q.stage===2&&!q.done))});
addNpc('alley',{id:'q_pipi',...PIPI,dir:'l',verb:'讨回书匣',mark:()=>1,show:()=>qs('q_book').stage===1&&!qs('q_book').done,async act(n){
  await say(PIPI.name,'哟，谁家的狗腿子追到这儿来了？',PIPI.sp);
  const opts=['「匣子还来。」','「分我一半，我就当没看见。」'];if(S.silver>=10)opts.push('「十两银子，把匣子赎回去。」');
  const c=await choose(PIPI.name,'泼皮把书匣往怀里一揣，身后又冒出一个帮闲。',opts,PIPI.sp);
  if(c===1){await say(PIPI.name,'嘿，上道！',PIPI.sp);await silver(12);await moral(-2);qdone('q_book','split');return}
  if(c===2){S.silver-=10;await gain('银两 -10');await say(PIPI.name,'早这样不就结了。',PIPI.sp);await moral(1)}
  else{const r=await battle({bg:'bg_alley',foes:[Object.assign(mk('thug'),{name:'泼皮'}),Object.assign(mk('thug'),{name:'帮闲'})],noLose:true});
    if(r!=='win'){await narr('你被推了个趔趄，泼皮嘻嘻哈哈地看着你。（再来一次？）');return}
    await say(PIPI.name,'好汉饶命！匣子还你，还你！',PIPI.sp)}
  await giveItem('shuxia');qset('q_book',2)}},spot({sc:'alley',xy:[13.5,25.5]}));

// ───────── 支线四：竹片暗记（吴长老 → 老船夫 → 吴长老）─────────
wrap('alley','beggar',async function(n,prev){
  const q=qs('q_bamboo');
  if(q.stage===2&&!q.done){await talk(n,'船老汉怎么说？');
    await say(S.name,'他说：初一的船，照旧。江上多了三条生面孔的快船。',HE('think'));
    await talk(n,'……三条快船。嘿，黑风寨胃口不小。好，这话值钱。');
    if(!S.skills.lianhua){await talk(n,'老叫化没什么好谢你的，教你一套讨饭的掌法！');await learn('lianhua')}
    else{await talk(n,'莲花落你已经会了，这卷东西拿去参悟。');await giveItem('book')}
    await moral(1);qdone('q_bamboo');await talk(n,'这话老叫化今晚就递给城防营。往后碰见拿竹片的，报荆襄分舵吴某的名号。');return}
  if(q.stage===1&&!q.done){await talk(n,'竹片送到渡口了吗？别弄丢喽。');return}
  if(!q.stage&&(R('gaibang')||hasFlag('beggar_win'))){
    const c=await choose(n.name,hasFlag('beggar_win')?'小兄弟，来得正好，帮老叫化跑个腿？':'讨口饭吃哟～',
      [hasFlag('beggar_win')?'「长老请讲。」':'「侯七说，您是丐帮的长老。」','（像往常一样）'],n.sp);
    if(c===0){if(!hasFlag('beggar_win'))await talk(n,'……侯七那张嘴，早晚给人缝上。','嘿，既然叫破了，老叫化也不装了。荆襄分舵，吴。');
      await talk(n,'东津渡有个撑船的汤老舵，欠过丐帮一份人情。你把这竹片带给他，他自然知道要说什么。',S.unlocked.ferry?'':'不急——等你手上街心那档子事了了，再出城不迟。');
      await giveItem('zhupian');qset('q_bamboo',1);return}}
  return prev()},()=>{const q=qs('q_bamboo');return(q.stage===2&&!q.done)||(!q.stage&&(R('gaibang')||hasFlag('beggar_win')))});

// ───────── 支线五：一船盐（汤老舵）· 护送：护送战在渡船航程内（江心截船，story.js raid()；13 §3.5）─────────
wrap('ferry','bandits',async function(n,prev){const m=S.moral;await prev();if(hasFlag('ferry_ev')&&S.moral>m)setFlag('q_ferry_good')});
const ferryGood=()=>hasFlag('q_ferry_good')||(hasFlag('ferry_ev')&&!hasFlag('ferry_split')&&S.moral>=10&&!hasFlag('join_bandit'));
const saltOffer=()=>!qs('q_salt').stage&&ferryGood()&&!hasFlag('chief_dead');
wrap('ferry','boatman',async function(n,prev){
  if(qs('q_bamboo').stage===1&&S.bag.zhupian){S.bag.zhupian=0;
    await talk(n,'这竹片……吴老哥还记得老汉。','你替老汉带句话回去：「初一的船，照旧。江上多了三条生面孔的快船。」他听得懂。');qset('q_bamboo',2);return}
  if(saltOffer()){if(!hasFlag('tang_told'))await tangTell(n);
    await talk(n,'对了，恩公——城里有个盐商，几包盐要过江，在码头上等了三天。','江心那段水匪多，老汉一个人不敢载。恩公若过江，顺路照应一程？盐商说了，船钱分你一份。');
    const c=await choose(n.name,'让盐商搭这趟船？',['「让他上船，一起走。」','「改日吧。」'],n.sp);
    if(c===0){qset('q_salt',1);await say('盐商','好汉！好汉！盐包我这就搬上船！','c_merchant');await boardFerry();return}}
  return prev()},()=>(qs('q_bamboo').stage===1&&!!S.bag.zhupian)||saltOffer());
// 江心截船胜利后由 story.js raid() 调用：盐商结账
window.onSaltEscort=async function(){if(qs('q_salt').stage!==1||qs('q_salt').done)return;
  await say('盐商','好汉！好汉！盐包一包没少！这 40 两是说好的船钱！','c_merchant');
  const k=await choose(S.name,'（汤老舵在一旁摸着船帮上新添的刀痕）',['收下 40 两','「一半给船家修船吧。」（20 两）']);
  if(k===0)await silver(40);else{await silver(20);await moral(1);await say('汤老舵','恩公……老汉这条船，往后随你坐！','c_boatman')}
  await giveItem('pill');qdone('q_salt')};

// ───────── 支线六：默庵的咳嗽（老僧）· 小义（与 01 设定一致：老僧身中慢性青蚨散，本支线只埋伏笔，不揭破）─────────
wrap('temple_out','monk',async function(n,prev){
  if(!hasFlag('spar')||!hasFlag('gate_ok'))return prev();
  const q=qs('q_monk'),sz=(S.party||[]).includes('suzhi');
  if(!q.stage){await narr('老僧背过身去，咳了好一阵，手里的念珠停了又转。');
    const c=await choose(S.name,'（你从没见他咳得这么厉害）',['「大师，您这咳嗽……」','（装作没看见）']);
    if(c===1)return prev();
    await talk(n,'老毛病了。早年在军中挨过一箭，箭头取出来了，病根没取出来。','一到阴雨天，就咳。','城里铁匠铺有竹叶青卖，温一壶做药引，能好受些。老衲……不便进城。');qset('q_monk',1);return}
  if(q.stage===1&&!q.done){
    const opts=[];if(S.bag.wine)opts.push('奉上一壶竹叶青');if(sz)opts.push('请苏芷看看');opts.push('「还没买到，改日再来。」');
    const c=await choose(n.name,'咳……施主有心了。',opts,n.sp),o=opts[c];
    if(o.startsWith('奉上')){S.bag.wine--;await narr('你温了酒。老僧和着药末慢慢喝下，脸上泛起一点血色。')}
    else if(o.startsWith('请苏芷')){await narr('苏芷搭上老僧的腕子，搭了很久。');await say(SZ.name,'……脉有些怪。',SE('worry'));
      await talk(n,'老衲这把年纪，脉哪有不怪的。女施主费心了。');await narr('苏芷没再说话，取针在老僧背上连下七针，又留了一张止咳的方子。');await say(SZ.name,'先止咳。……我再想想。',SZ.sp);setFlag('q_monk_pulse');await aff(1)}
    else return prev();
    await talk(n,'……胸口松快多了。阿弥陀佛。','城守得住守不住，是将军的事；眼前这个人救不救，是你的事。','施主今日救的，是老衲。老衲记下了。');
    S.st.wil++;await gain('定力 +1');await moral(1);qdone('q_monk');return}
  return prev()},()=>hasFlag('spar')&&hasFlag('gate_ok')&&qs('q_monk').stage===1&&!qs('q_monk').done&&(!!S.bag.wine||(S.party||[]).includes('suzhi')));
})();
