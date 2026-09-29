'use strict';
// 江湖菜单：装备 / 背包 / 同伴养成（工作流 W4），设计见 docs/design/06-物品装备与经济、07-队伍与同伴、09-菜单与界面UI设计
// 加载顺序：core → ui → … → battle → bui/bfx/bposhi → menu → main → audio。本文件用"同名重声明 / 包一层"的方式覆盖：
//   derived        加入佩饰栏与物品词条（fx），返回值多带 st（含装备加成的五维）与 fx
//   mkHero/mkAlly  主角与同伴只带「已装配」武学；同伴用各自的加点、装备、武学重数与持久气血内力
//   battle         包一层：战后把同伴气血内力写回 S.mates；败北（非 noLose）回满
//   bagPanel       新江湖菜单（属性/武学/心法/行囊/装备/队伍/任务/设置），TABS 数组原地替换
//   equipItem/statRows  商店的「当场佩上」与对比行支持佩饰、需求
//   shop           铁匠铺追加第一章基础货品；hud 同伴有待分配点时也亮红点
// 存档新增字段（均可缺省，mnEnsure() 惰性补齐，旧档无需迁移脚本）：
//   S.acc                          主角佩饰（主角兵器/护具仍用旧字段 S.weapon / S.armor）
//   S.load / S.skSeen              主角武学装配（≤ MN_LOAD）与"已见过"的武学（新学武学自动补进空位）
//   S.mates[同伴] = {st,pts,lvSeen,equip:{weapon,armor,acc},skills:{k:重},load,skSeen,hp,mp,mpBonus}   （字段名与 03 §5.3 对齐）
//   S.chapter                      章节（第一章结算后置 2，存档保留；见 ending 覆盖）
//   （工作流 X）r.prof/r.profNote 武学熟练 · r.xinfa 心法 · r.zy 兵刃造诣 · r.ji 技艺（r = S 或 S.mates[同伴]）· S.virtue 品德分项；另包一层 doSkill/victory/layoutUnits/tickBuffs/foeAct/strike/hurt/moral
//     hp/mp 为 null 表示满；lvSeen 为已发放属性点的境界（与主角共享境界，每升一层 +3 点，入队时补发）

// ───────── 数据：品质、栏位、成员规则、新增物品 ─────────
const MN_Q=[['凡品','#6f6250'],['良品','#2f6b45'],['精品','#2d5a86'],['珍品','#6b3d8a'],['神兵','#b3561e']];
const MN_SLOTS=[['weapon','兵器','刃'],['armor','护具','甲'],['acc','佩饰','佩']];
const MN_LOAD=6;   // 武学栏格数（04 §4.7：每名角色 6 格），第一章即开放装配 UI，见 07 §4
const MN_FXN={block:'格挡',atk:'攻击',def:'防御',crit:'暴击',dodge:'闪避',mhp:'气血',mmp:'内力',spd:'身速',str:'臂力',con:'根骨',agi:'身法',wil:'定力',wis:'悟性'};
const MN_PCT={crit:1,dodge:1,block:1};
const MN_DK=['atk','def','mhp','mmp','crit','dodge','spd','block'];   // block 格挡（工作流 X，05 §6.4）
// 成员规则：wk 可用兵刃（null=不限）、slots 可用栏位、learn 可受传授的武学类别、teachAff 受传授所需好感、gives 可被请教的武学
const MN_SKCAP=()=>[0,4,6,7,8,9,10][Math.min(6,(S&&S.chapter)||1)];   // 章节重数上限（04 §2.4）
const MN_MEM={
  hero:{wk:null,slots:['weapon','armor','acc'],role:'主角'},
  suzhi:{wk:['暗器','剑'],slots:['weapon','armor','acc'],learn:['暗器','掌','内','医','剑'],teachAff:3,role:'游方医师',sect:'baixian',
    gives:[{sk:'huichun',aff:5,line:'回春散。药量宁少勿多——记住了？'}]},
  dog:{wk:[],slots:['acc'],learn:[],role:'忠犬',noXf:1}};
// 默认加点偏好（03 §7.1）：一键分配时循环取用
const MN_PREF={suzhi:['wis','wil','con','wis','wil','agi'],dog:['str','agi','con'],orphan:['wil','wis','con'],beggar:['agi','con','str'],shepherd:['str','con','agi']};
const mnCap=()=>8+(S.lv||1);                 // 单项上限 8+L（03 §5.1），装备加成不计
const mnQOn=()=>(S&&S.chapter||1)>=3;         // 装备品质第三章开放（01 §4），此前只存数据不显示
const mnDef=w=>MN_MEM[w]||{wk:null,slots:['weapon','armor','acc'],learn:[],role:'同伴'};
Object.assign(ITEMS.wood,{q:0});Object.assign(ITEMS.iron,{q:1,req:{str:5}});Object.assign(ITEMS.rusty,{q:1});
Object.assign(ITEMS.cloth,{q:0});Object.assign(ITEMS.vest,{q:1,req:{con:4}});
Object.assign(ITEMS,{
  club:{name:'枣木短棍',desc:'棍类兵器。枣木坚韧，放羊娃赶羊用的就是这个。',weapon:{kind:'棍',atk:5},price:16,q:0},
  knife:{name:'厚背柴刀',desc:'刀类兵器。刀背厚实，劈柴砍人都趁手。',weapon:{kind:'刀',atk:8},price:32,q:0,req:{str:4}},
  needles:{name:'铜针囊',desc:'暗器。一囊七枚铜针，医家也拿它刺穴。',weapon:{kind:'暗器',atk:5,crit:4},price:22,q:0},
  mianjia:{name:'麻布夹袄',desc:'护具。夹层絮了麻，挡得住寻常拳脚。',armor:6,fx:{mhp:15},price:38,q:1},
  charm:{name:'平安符',desc:'佩饰。羊太傅庙求来的黄纸符，贴身带着心里踏实。',acc:1,fx:{wil:1,mmp:10},price:18,q:0},
  collar:{name:'铜铃项圈',desc:'佩饰。叮当作响，戴在狗脖子上正合适。',acc:1,fx:{agi:1,dodge:3},price:15,q:0},
  jade:{name:'青玉佩',desc:'佩饰。成色一般的青玉，雕着一枝兰草。',acc:1,fx:{wis:1,crit:3},price:55,q:1},
  pelt:{name:'狼皮',desc:'野狼身上剥下的皮子，铁匠铺按半价收。',mat:1,price:16}});
Object.assign(ICO,{club:'棍',knife:'刀',needles:'针',mianjia:'袄',charm:'符',collar:'铃',jade:'玉',pelt:'皮',jieyao:'瓶',ledger:'账'});
if(typeof FOE_DEF!=='undefined'&&FOE_DEF.wolf)FOE_DEF.wolf.drops={pelt:60,bun:10};   // 野狼掉狼皮（卖 8 两），见 06 §6
const MN_SMITH=['club','wood','knife','needles','iron','cloth','mianjia','vest','charm','collar','jade'];

// ───────── 物品工具 ─────────
function mnSlot(k){const it=ITEMS[k];if(!it)return null;if(it.weapon)return'weapon';if(it.acc)return'acc';if(typeof it.armor==='number')return'armor';return null}
function mnFx(k){const it=ITEMS[k];if(!it)return{};const o={...(it.fx||{})};
  if(it.weapon){o.atk=(o.atk||0)+(it.weapon.atk||0);if(it.weapon.crit)o.crit=(o.crit||0)+it.weapon.crit}
  if(typeof it.armor==='number')o.def=(o.def||0)+it.armor;return o}
function mnCat(k){const it=ITEMS[k];const s=mnSlot(k);return s==='weapon'?'兵器':s==='armor'?'护具':s==='acc'?'佩饰':it.key?'要物':(it.heal||it.mp)?'药食':'杂物'}
const mnQ=k=>mnQOn()?MN_Q[(ITEMS[k]&&ITEMS[k].q)||0]:['','#3b2c1b'];
const mnFxTxt=(a,v)=>`${MN_FXN[a]||a} ${v>0?'+':''}${v}${MN_PCT[a]?'%':''}`;

// ───────── 存档补齐 / 迁移 ─────────
// 武学栏：去重 → 逐门复核装配规则（格数随境界、属性门槛、内力、群攻/兵刃互斥，见 mnLoadWhy）→ 新学武学若合规则自动补进空位
function mnSync(r,sk,w){r.prof=r.prof||{};r.profNote=r.profNote||{};const old=(r.load||[]).filter((k,i,a)=>sk[k]&&SKILLS[k]&&a.indexOf(k)===i);r.skSeen=r.skSeen||[];
  if(!w){r.load=old;return}r.load=[];for(const k of old)if(!mnLoadWhy(w,k,r.load))r.load.push(k);
  for(const k of Object.keys(sk)){if(k==='fist'||!SKILLS[k]||r.skSeen.includes(k))continue;r.skSeen.push(k);if(!r.load.includes(k)&&!mnLoadWhy(w,k,r.load))r.load.push(k)}}
function mnEnsure(){if(!S)return;const M=S.mates=S.mates||{};if(S.acc===undefined)S.acc=null;S.party=S.party||[];S.pts=S.pts||0;
  if(typeof petEnsure==='function')petEnsure();
  mnDimEnsure(S,'hero');mnSync(S,S.skills,'hero');mnXfEnsure(S,'hero');
  for(const k of S.party){const P=typeof PARTY_DEF!=='undefined'&&PARTY_DEF[k];if(!P)continue;let m=M[k];
    if(!m)m=M[k]={st:{...P.st},pts:0,lvSeen:1,equip:{weapon:null,armor:null,acc:null},skills:Object.fromEntries(P.skills.map(s=>[s,1])),hp:null,mp:null,mpBonus:0};
    m.st=m.st||{...P.st};m.equip=m.equip||{weapon:null,armor:null,acc:null};m.skills=m.skills||{};m.pts=m.pts||0;mnDimEnsure(m,k);mnSync(m,m.skills,k);mnXfEnsure(m,k);
    if(S.lv>(m.lvSeen||1)){m.pts+=(S.lv-(m.lvSeen||1))*3;m.lvSeen=S.lv;m.hp=null;m.mp=null}}}

// 派生属性（覆盖 core.js）：兵器 atk/crit、护具 armor→def、所有装备的 fx 词条（五维或派生值）。公式本体与 core.js 相同，见 03/08
function derived(u=S){if(u===S)mnEnsure();const b={};
  for(const k of[u.weapon,u.armor,u.acc])if(k&&ITEMS[k])for(const[a,v]of Object.entries(mnFx(k)))b[a]=(b[a]||0)+v;
  const s={};for(const k in STATN)s[k]=((u.st||{})[k]||0)+(b[k]||0);const lv=u.lv||1;
  const d={mhp:60+s.con*14+lv*12+(b.mhp||0),mmp:30+s.wil*7+s.wis*2+lv*5+(u.mpBonus||0)+(b.mmp||0),atk:8+s.str*3+lv*2+(b.atk||0)+(u.atkBonus||0),
    def:s.con+s.wil*2+(b.def||0),spd:s.agi+(b.spd||0),crit:5+s.wis*2+(b.crit||0),dodge:Math.round(s.agi*1.5)+(b.dodge||0),block:Math.min(30,s.con+(b.block||0)),move:2+Math.floor(s.agi/5),st:s,fx:b};
  // 心法（04 §3.3、03 §3.2 的 X.add / X.pct）：先加值后乘百分比；第二章起（或调试开关）生效
  const xw=u.xw||(u===S?'hero':null),X=xw&&typeof mnXfSum==='function'?mnXfSum(xw):null;
  if(X&&X.act.length)for(const k of MN_DK)if(X.add[k]||X.pct[k])d[k]=Math.round((d[k]+(X.add[k]||0))*(1+(X.pct[k]||0)));
  if(X)d.xf=X;return d}

// ───────── 成员访问 ─────────
function mnMembers(){if(!S)return['hero'];mnEnsure();return['hero',...S.party.filter(k=>S.mates[k])]}
const mnName=w=>w==='hero'?S.name:((typeof PARTY_DEF!=='undefined'&&PARTY_DEF[w])||{}).name||w;
const mnPts=w=>w==='hero'?S.pts||0:((S.mates[w]||{}).pts||0);
const mnSt=w=>w==='hero'?S.st:S.mates[w].st;
const mnSk=w=>w==='hero'?S.skills:S.mates[w].skills;
const mnRec=w=>w==='hero'?S:S.mates[w];
const mnEq=w=>w==='hero'?S:S.mates[w].equip;
function mnUnit(w,mod={}){const e=mnEq(w),st={...mnSt(w)};if(mod.st)for(const k in mod.st)st[k]=(st[k]||0)+mod.st[k];
  const r=w==='hero'?S:S.mates[w];return{st,lv:S.lv,weapon:e.weapon,armor:e.armor,acc:e.acc,...(mod.eq||{}),mpBonus:r.mpBonus||0,atkBonus:w==='hero'?S.atkBonus||0:0,xw:w}}
const mnD=(w,mod)=>derived(mnUnit(w,mod));
function mnHP(w){const d=mnD(w);if(w==='hero')return{hp:Math.min(S.hp,d.mhp),mp:Math.min(S.mp,d.mmp),d};const m=S.mates[w];
  return{hp:m.hp==null?d.mhp:Math.min(m.hp,d.mhp),mp:m.mp==null?d.mmp:Math.min(m.mp,d.mmp),d}}
function mnClampHP(w){const{hp,mp}=mnHP(w);if(w==='hero'){S.hp=hp;S.mp=mp}else{const m=S.mates[w];if(m.hp!=null)m.hp=hp;if(m.mp!=null)m.mp=mp}}
function mnCan(w,k){const it=ITEMS[k],sl=mnSlot(k),D=mnDef(w);if(!sl)return'不可装备';const sn=MN_SLOTS.find(s=>s[0]===sl)[1];
  if(!D.slots.includes(sl))return`${mnName(w)}用不了${sn}`;
  if(sl==='weapon'&&D.wk&&!D.wk.includes(it.weapon.kind))return`${mnName(w)}不使${it.weapon.kind}`;
  if(it.req){const st=mnSt(w);for(const[a,v]of Object.entries(it.req))if((st[a]||0)<v)return`需${STATN[a]} ${v}`}return''}
function mnEquip(w,k){if(mnCan(w,k)||!(S.bag[k]>0))return false;const sl=mnSlot(k),e=mnEq(w);if(e[sl])S.bag[e[sl]]=(S.bag[e[sl]]||0)+1;e[sl]=k;S.bag[k]--;mnClampHP(w);return true}
function mnUnequip(w,sl){const e=mnEq(w);if(!e[sl])return;S.bag[e[sl]]=(S.bag[e[sl]]||0)+1;e[sl]=null;mnClampHP(w)}
// 对比：换上某件（或加点）后派生值的变化行 [名, 旧, 新, 差]
function mnCmp(w,mod){const a=mnD(w),b=mnD(w,mod);return MN_DK.map(k=>[k,a[k],b[k],b[k]-a[k]])}
function mnWearer(k){return mnMembers().filter(w=>{const e=mnEq(w);return e.weapon===k||e.armor===k||e.acc===k})}

// 商店兼容（覆盖 ui.js）：当场佩上 / 对比行
function equipItem(k){mnEquip('hero',k)}
function statRows(k){const it=ITEMS[k],L=[],sl=mnSlot(k);
  if(sl){for(const[a,o,n,d]of mnCmp('hero',{eq:{[sl]:k}}))if(d)L.push([MN_FXN[a],`${n}${MN_PCT[a]?'%':''}`,d,`${o} → ${n}`]);
    if(!L.length)L.push(['属性','—',0,'与现有持平']);
    L.push(['词条',Object.entries(mnFx(k)).map(([a,v])=>mnFxTxt(a,v)).join('　'),null,mnQ(k)[0]||'—']);
    const cur=S[sl];L.push(['部位',MN_SLOTS.find(s=>s[0]===sl)[1],null,cur?`现用 ${ITEMS[cur].name}`:'现为空']);
    const why=mnCan('hero',k);if(it.req||why)L.push(['需求',it.req?Object.entries(it.req).map(([a,v])=>STATN[a]+' '+v).join(' '):'—',null,why?`<span style="color:#e07a5a">${why}</span>`:'已达'])}
  const d=derived();if(it.heal)L.push(['气血',`+${it.heal}`,null,`当前 ${S.hp}/${d.mhp}`]);if(it.mp)L.push(['内力',`+${it.mp}`,null,`当前 ${S.mp}/${d.mmp}`]);
  return L}
// 铁匠铺追加货品（按栏位排序），并把 ui.js KINDN 显示不了的「佩饰/材料」类名改正
const mnShop0=shop;
shop=function(n,list){if(n&&n.id==='smith'){const all=[...new Set([...MN_SMITH,...list])];const o=k=>({weapon:0,armor:1,acc:2}[mnSlot(k)]??3);list=all.filter(k=>ITEMS[k]).sort((a,b)=>o(a)-o(b))}return mnShop0(n,list)};
(function(){const fix=()=>{const p=$('panel');if(!p||!p.classList.contains('shopx'))return;const byName={};for(const k in ITEMS)byName[ITEMS[k].name]=k;
    p.querySelectorAll('.srow .nm').forEach(e=>{const k=byName[(e.firstChild&&e.firstChild.textContent||'').trim()],s=e.querySelector('small');if(k&&s){const c=mnCat(k);if(s.textContent!==c&&(ITEMS[k].acc||ITEMS[k].mat||mnSlot(k)==='armor'))s.textContent=c}});
    const dn=p.querySelector('.dn'),dk=p.querySelector('.dk');if(dn&&dk){const k=byName[dn.textContent.trim()];if(k&&(ITEMS[k].acc||ITEMS[k].mat||mnSlot(k)==='armor')&&dk.firstChild&&dk.firstChild.nodeType===3){const t=dk.firstChild.textContent,c=mnCat(k);if(!t.startsWith(c))dk.firstChild.textContent=t.replace(/^\S+?(?=　|$)/,c)}}};
  try{new MutationObserver(fix).observe($('panel'),{childList:true,subtree:true})}catch(e){}})();

// ───────── 战斗接入（覆盖 battle.js） ─────────
let mnLive=[];
function mkHero(){mnEnsure();const u=statUnit({...S,name:S.name},'ally'),d=derived();Object.assign(u,{mhp:d.mhp,mmp:d.mmp,atk:d.atk,def:d.def,spd:d.spd,crit:d.crit,dodge:d.dodge,block:d.block});
  u.hp=clamp(S.hp,1,u.mhp);u.mp=clamp(S.mp,0,u.mmp);u.isHero=true;u.art=pickArt(['hero']);u.por='hero';
  const w=S.weapon&&ITEMS[S.weapon]&&ITEMS[S.weapon].weapon;u.atkType=w?w.kind:'拳';u.atkName=w?ITEMS[S.weapon].name:'拳脚';
  u.skills=S.load.filter(k=>S.skills[k]&&SKILLS[k]);u.skLv=mnEffLv('hero');u.mw='hero';u.xf=mnXfSum('hero');return u}
function mkAlly(key){const P=PARTY_DEF[key];if(!P)return null;mnEnsure();const m=S.mates[key];
  if(!m){const u=statUnit({name:P.name,st:P.st,lv:Math.max(1,S.lv)},'ally');u.hp=u.mhp;u.mp=u.mmp;u.art=pickArt(P.art);u.por=P.por.find(p=>ok(IMG['p_'+p]))||P.por[0];u.key=key;u.atkType=P.atkType;u.atkName=P.atkName;u.skills=P.skills.slice();u.skLv={};return u}
  const u=statUnit({name:P.name,st:m.st,lv:Math.max(1,S.lv)},'ally'),d=mnD(key);Object.assign(u,{mhp:d.mhp,mmp:d.mmp,atk:d.atk,def:d.def,spd:d.spd,crit:d.crit,dodge:d.dodge,block:d.block});
  u.hp=m.hp==null?u.mhp:clamp(m.hp,1,u.mhp);u.mp=m.mp==null?u.mmp:clamp(m.mp,0,u.mmp);
  u.art=pickArt(P.art);u.por=P.por.find(p=>ok(IMG['p_'+p]))||P.por[0];u.key=key;
  const w=m.equip.weapon&&ITEMS[m.equip.weapon]&&ITEMS[m.equip.weapon].weapon;u.atkType=w?w.kind:P.atkType;u.atkName=w?ITEMS[m.equip.weapon].name:P.atkName;
  u.skills=m.load.filter(k=>m.skills[k]&&SKILLS[k]);u.skLv=mnEffLv(key);u.mw=key;u.xf=mnXfSum(key);mnLive.push([key,u]);return u}
const mnBattle0=battle;
battle=async function(opt={}){mnLive=[];mnProfLog={};mnZyLog={};mnSettled=false;const lv0=S?S.lv:1;let r;
  try{r=await mnBattle0.call(this,opt)}finally{
    // 败/逃：武学熟练按 50% 结算（04 §2.4）；心法不涨层；气脉未稳照常消耗一场
    // 战斗异常时底层会抛错并回滚主角状态；未取得结果就不能结算熟练或写回同伴残血。
    if(r&&S&&!mnSettled){try{const ev=mnSettle(.5,0);const ups=ev.filter(e=>e.lv);if(ups.length)setTimeout(()=>toast(ups.map(e=>`「${SKILLS[e.k].name}」突破至第 ${e.lv} 重`).join('　'),1800),600)}catch(e){console.error(e)}}
    if(r&&S){mnEnsure();for(const[k,u]of mnLive){const m=S.mates[k];if(!m)continue;
        if(r==='lose'&&!opt.noLose){m.hp=null;m.mp=null;continue}
        m.hp=Math.max(1,u.hp,r==='lose'?Math.round(u.mhp*.3):0);m.mp=Math.max(0,u.mp);if(m.hp>=u.mhp)m.hp=null}
      if(S.lv>lv0)mnEnsure();
      // 品德·勇气：临阵脱逃 −1，战胜头目 +2（03 §9.4）
      try{mnDimEnsure(S,'hero');if(r==='flee')S.virtue.yong-=1;else if(r==='win'&&opt.boss)S.virtue.yong+=2}catch(e){}}
    mnLive=[]}
  return r};

// ───────── 武学养成：熟练 → 重数；装配规则（工作流 X，设计见 04 §2.4 §2.9、08 §12 TBD-12/13/27–33） ─────────
// 存档：r.prof[k] = 当前重数内累积的熟练（升重后扣除），r.profNote[k] = 已提示过"卡在门槛"的重数（避免每场重复提示）
const mnLvM=n=>1+.15*Math.min(n-1,3)+.08*Math.max(0,n-4);          // 重数倍率（1–4 重与旧 1+.15(n−1) 一致）TBD-12
const mnProfNeed=n=>6*n*n;                                           // n 重 → n+1 重所需熟练 TBD-13
const MN_GATE=[4,7];                                                 // 4→5、7→8 为"突破关"：熟练满也须残页 / 师父指点 / 奇遇
const mnWisMul=wis=>clamp(1+.04*(wis-5),.8,2);                       // 悟性 → 熟练获取倍率 TBD-13
const MN_LOAD_STEPS=[[1,3],[3,4],[6,5],[13,6]];                      // [境界层数, 武学栏格数] TBD-27（13 层 = 突破一「登堂入室」）
const mnLoadCap=(lv=(S&&S.lv)||1)=>MN_LOAD_STEPS.filter(s=>lv>=s[0]).pop()[1];
const MN_AOE_MAX=2;                                                  // 群攻（全体）武学至多装配 2 门 TBD-28
const MN_MP_RATIO=5;                                                 // 单招内力 × 5 ≤ 内力上限，否则"驾驭不住" TBD-29
// 武学的主属性 key（升重门槛）、装配门槛 req、火候 at5/at10（mp:内力增减 pow:威力/治疗量 reveal:出手看破）；数值见 04 §2.6 表
const MN_SKX={
  jingxin:{key:'wil',at5:{mp:-1},at10:{pow:.15}},      shuaibei:{key:'agi',at5:{reveal:1},at10:{pow:.15}},
  bianfa:{key:'str',at5:{mp:-1},at10:{pow:.15}},       fuhu:{key:'str',req:{str:3},at5:{pow:.1},at10:{mp:-1}},
  liuye:{key:'agi',req:{agi:3},at5:{mp:-1},at10:{pow:.15}}, lianhua:{key:'str',req:{str:4},at5:{pow:.1},at10:{mp:-2}},
  guafeng:{key:'agi',req:{agi:5},at5:{mp:-2},at10:{pow:.15}},
  jinzhen:{key:'wis',req:{wis:4},at5:{reveal:1},at10:{mp:-1}}, huichun:{key:'wis',req:{wis:5},at5:{mp:-1},at10:{pow:.15}},
  baicao:{key:'wis',req:{wis:6},at5:{mp:-2},at10:{pow:.15}},   dingshen:{key:'wil',req:{wil:5},at5:{mp:-1},at10:{mp:-2}},
  sniff:{key:'agi',at5:{reveal:1},at10:{pow:.15}},     lick:{key:'con',at5:{mp:-1},at10:{pow:.15}}};
for(const[k,v]of Object.entries(MN_SKX))if(SKILLS[k])Object.assign(SKILLS[k],v);
const mnBsk=k=>(typeof BSK!=='undefined'&&BSK[k])||{};
const mnIsAoe=k=>mnBsk(k).tgt==='foes';
const mnStE=w=>mnD(w).st;                                            // 门槛按"含装备加成"的五维判断（青玉佩等佩饰因此有用）
const mnReqTxt=req=>Object.entries(req||{}).map(([a,v])=>`${STATN[a]} ${v}`).join(' · ');
// 升至第 n 重的属性门槛：主属性 ≥ max(3, 装配门槛) + ⌊1.5(n−1)⌋  TBD-30
function mnUpReq(k,n){const s=SKILLS[k],a=s.key||'wis';return[a,Math.max(3,((s.req||{})[a])||0)+Math.floor(1.5*(n-1))]}
function mnHuo(k,n){const s=SKILLS[k],o={mp:0,pow:0,reveal:0};for(const[at,lv]of[['at5',5],['at10',10]])if(n>=lv&&s[at])for(const x in o)o[x]+=s[at][x]||0;return o}
const mnHuoTxt=h=>h?[h.mp?`内力 ${h.mp}`:'',h.pow?`威力 +${Math.round(h.pow*100)}%`:'',h.reveal?`出手看破 ${h.reveal} 处`:''].filter(Boolean).join('，'):'—';
const mnSkMp=(w,k)=>Math.max(0,(SKILLS[k].mp||0)+mnHuo(k,mnSk(w)[k]||1).mp);
// 装配校验：返回不能装配的原因（空串 = 可装配）。load 为"除它以外已装配的"列表
function mnLoadWhy(w,k,load){const s=SKILLS[k];if(!s)return'未知武学';const r=mnRec(w);load=(load||r.load||[]).filter(x=>x!==k);
  const st=mnStE(w);for(const[a,v]of Object.entries(s.req||{}))if((st[a]||0)<v)return`未达门槛：需${STATN[a]} ${v}（现 ${st[a]||0}）`;
  const mp=mnSkMp(w,k),mmp=mnD(w).mmp;if(mp*MN_MP_RATIO>mmp)return`内力上限不足：需 ${mp*MN_MP_RATIO}（现 ${mmp}）`;
  if(mnIsAoe(k)&&load.filter(mnIsAoe).length>=MN_AOE_MAX)return`群攻武学至多装配 ${MN_AOE_MAX} 门`;
  if(s.needWeapon){const o=load.find(x=>SKILLS[x]&&SKILLS[x].needWeapon&&SKILLS[x].needWeapon!==s.needWeapon);if(o)return`与「${SKILLS[o].name}」兵刃不同，只能择一`}
  if(load.length>=mnLoadCap()){const nx=MN_LOAD_STEPS.find(x=>x[0]>(S.lv||1));return`武学栏已满（${mnLoadCap()} 格${nx?`，境界 ${nx[0]} 层增至 ${nx[1]} 格`:''}）`}
  return''}
// 升重校验（book=残页/师父指点：可越过突破关）
function mnUpWhy(w,k,book){const n=mnSk(w)[k]||1,cap=MN_SKCAP();if(n>=10)return'已臻十重';if(n>=cap)return`本章重数上限 ${cap} 重`;
  if(!book&&MN_GATE.includes(n))return`第 ${n+1} 重为突破关：需残页或师父指点`;
  const[a,v]=mnUpReq(k,n+1),st=mnStE(w);if((st[a]||0)<v)return`需${STATN[a]} ${v}（现 ${st[a]||0}）`;
  const t=mnBsk(k).t;if(MN_ZY.includes(t)){const zv=Math.floor(((mnRec(w).zy||{})[t])||0),need=mnZyUp(n+1);if(zv<need)return`需${t}造诣 ${need}（现 ${zv}）`}return''}
// 熟练入账并尝试升重；返回事件 [{w,k,lv}|{w,k,block}]
function mnProfGain(w,k,raw){const r=mnRec(w),sk=mnSk(w);if(!r||!sk[k]||!SKILLS[k]||k==='fist')return[];r.prof=r.prof||{};r.profNote=r.profNote||{};
  const ev=[];let p=(r.prof[k]||0)+raw;
  for(let g=0;g<10;g++){const n=sk[k],need=mnProfNeed(n);if(p<need)break;const why=mnUpWhy(w,k);
    if(why){p=need;if(r.profNote[k]!==n){r.profNote[k]=n;ev.push({w,k,block:why})}break}
    p-=need;sk[k]=n+1;delete r.profNote[k];ev.push({w,k,lv:n+1})}
  r.prof[k]=Math.round(p*10)/10;return ev}
// 战斗中各成员武学的熟练记账：{w:{k:点}}（每次施展 +1；命中弱点 +1；每造成一次破势 +1）TBD-31
let mnProfLog={},mnSettled=false;
// 战斗倍率：重数 × (1 + 火候威力 + 心法同属/治疗加成)，折算成 bfx/battle 读取的 skLv（1+.15(lv−1)），不改那两处的公式
function mnSkBonus(w,k){const s=SKILLS[k],n=mnSk(w)[k]||1,bi=mnBsk(k),X=mnXfSum(w);let b=mnHuo(k,n).pow;
  if(bi.e&&X.eb[bi.e])b+=X.eb[bi.e];if(s.heal&&X.heal)b+=X.heal;if(mnNiXi(w,k))b-=.10;return b}
function mnEffLv(w){const sk=mnSk(w),o={};for(const k in sk){const m=mnLvM(sk[k])*(1+mnSkBonus(w,k));o[k]=Math.max(.1,Math.round((1+(m-1)/.15)*1e4)/1e4)}return o}

// ───────── 江湖维度：兵刃造诣 / 技艺 / 品德 / 内息 / 格挡（工作流 X 追加；参考《大侠立志传》，设计见 03 §9、05 §6.4、08 §15） ─────────
// 存档：r.zy = {刀,剑,拳,棍,暗器}（兵刃造诣 0–200）· r.ji = {yi 医术, du 毒术, shi 武学常识(底数)} · S.virtue = {ren,yi,xin,yong}（品德分项底数）
const MN_ZY=['刀','剑','拳','棍','暗器'];                            // 后续：枪 鞭 扇（随 WTYPES 扩充）
const MN_ZY_MAX=200;
const mnZyBonus=v=>Math.min(10,Math.floor((v||0)/20))/100;          // 造诣每 20 点该兵刃伤害 +1%，至多 +10% TBD-37
const mnZyUp=n=>6*(n-1);                                             // 兵刃武学升至第 n 重需该兵刃造诣 TBD-38
const MN_JI={yi:'医术',du:'毒术',shi:'武学常识'};
Object.assign(STATD,{str:'攻击力；拳掌、棍类武学升重',con:'气血、防御与格挡',agi:'出手顺序与闪避；剑、腿法武学升重',wil:'内力与防御；调息类武学升重',wis:'暴击与武学熟练；暗器、医术武学升重'});   // 03 §2（move 已删）
const MN_VIRT={ren:'仁德',yi:'义气',xin:'信用',yong:'勇气'};
const MN_ZY0={orphan:{拳:5},beggar:{拳:10},shepherd:{棍:10},suzhi:{暗器:30},dog:{刀:20}};
const MN_JI0={orphan:{shi:10},suzhi:{yi:40,du:15,shi:10}};
function mnDimEnsure(r,w){const k0=w==='hero'?S.origin:w;
  if(!r.zy){r.zy={};for(const t of MN_ZY)r.zy[t]=((MN_ZY0[k0]||{})[t])||0}for(const t of MN_ZY)r.zy[t]=clamp(+r.zy[t]||0,0,MN_ZY_MAX);
  if(!r.ji)r.ji={yi:0,du:0,shi:0,...(MN_JI0[k0]||{})};for(const j in MN_JI)r.ji[j]=Math.max(0,+r.ji[j]||0);
  if(w==='hero'&&!S.virtue)S.virtue={ren:(S.moral||10)-10,yi:0,xin:0,yong:0}}
// 技艺：武学常识 = 底数 + 每门已学武学 5 + 每多一重 2（随学随涨，旧档自动得分）
function mnJi(w){const r=mnRec(w),j={...(r.ji||{})},sk=mnSk(w);let s=j.shi||0;for(const k in sk)if(k!=='fist'&&SKILLS[k])s+=5+2*((sk[k]||1)-1);j.shi=s;return j}
// 品德：分项 = 底数 + 江湖事迹（义气看同伴与好感，信用看已毕支线）；侠义（S.moral）仍是总评，旧剧情判定不变
function mnVirt(){const v={...(S.virtue||{})};const aff=Object.values(S.aff||{}).reduce((a,b)=>a+(+b||0),0);
  v.yi=(v.yi||0)+2*(S.party||[]).length+Math.floor(aff/3);let done=0;try{done=mnQuests().filter(q=>q.done).length}catch(e){}v.xin=(v.xin||0)+2*done;return v}
// 内息：由主修心法之性决定（阳 / 阴 / 调）；未修心法为"先天"（可修任何心法）
function mnNeixi(w){if(!mnXfOn()||mnDef(w).noXf)return mnDef(w).noXf?'—':'先天';const x=mnXf(w);if(!x||!x.main)return'先天';const g=XINFA[x.main].xing;return g==='阳'?'阳':g==='阴'?'阴':'调'}
// 逆息：内息为阳时施展阴劲武学（或反之）威力 −10%（TBD-40）；毒/雷与调和不受影响
const mnNiXi=(w,k)=>{const n=mnNeixi(w),e=mnBsk(k).e;return(n==='阳'&&e==='阴')||(n==='阴'&&e==='阳')};
// 战斗记账：造诣（兵刃出手）与技艺（医/毒）
let mnZyLog={};
const mnStrike0=strike;
strike=function(u,t,o){try{if(u&&u.side==='ally'&&u.mw&&o&&MN_ZY.includes(o.t)&&S){const r=mnRec(u.mw);const L=mnZyLog[u.mw]=mnZyLog[u.mw]||{};L[o.t]=(L[o.t]||0)+1;
    const b=mnZyBonus(r&&r.zy&&r.zy[o.t]);if(b)o={...o,pow:o.pow*(1+b)}}}catch(e){}return mnStrike0.call(this,u,t,o)};
// 格挡：我方被敌方出手击中时，按格挡率受伤减半
const mnHurt0=hurt;
hurt=function(t,dmg,col,big){try{if(t&&t.side==='ally'&&B&&B.cur&&B.cur.side==='foe'&&t.block&&dmg>1&&chance(t.block)){dmg=Math.max(1,Math.round(dmg*.5));floatTxt(t,'格挡','#cfe3ff',18)}}catch(e){}return mnHurt0.call(this,t,dmg,col,big)};
// 侠义事件同时记入"仁德"分项
const mnMoral0=moral;
moral=function(d){try{if(S){mnDimEnsure(S,'hero');S.virtue.ren+=d}}catch(e){}return mnMoral0.apply(this,arguments)};
function mnDimSettle(mul){const ev=[];for(const[w,L]of Object.entries(mnZyLog)){if(w!=='hero'&&!(S.mates||{})[w])continue;const r=mnRec(w);mnDimEnsure(r,w);
    for(const[t,n]of Object.entries(L)){if(t[0]==='@'){const j=t.slice(1);r.ji[j]=Math.min(MN_ZY_MAX,Math.round(((r.ji[j]||0)+n*mul)*10)/10);continue}const v0=r.zy[t];r.zy[t]=Math.min(MN_ZY_MAX,Math.round((v0+n*mul)*10)/10);if(Math.floor(r.zy[t]/20)>Math.floor(v0/20))ev.push({w,zy:t,v:Math.floor(r.zy[t])})}}
  mnZyLog={};return ev}

// ───────── 心法（被动内功）：主修 1 + 辅修随境界；第二章开放（04 §3、TBD-14/34–36） ─────────
// 存档：r.xinfa = {main, subs:[], lv:{id:层}, prog:{id:进度(以"级"为单位)}, known:[], unstable:剩余场数}
// 调试：?debug=xinfa 或 window.DEBUG_XINFA=1 → 第一章也开放，并习得全部心法（门派/属性/相冲限制照常）
const mnXfDebug=()=>{try{return !!window.DEBUG_XINFA||/[?&]debug=[^&#]*xinfa/.test(location.search)}catch(e){return false}};
const mnXfOn=()=>((S&&S.chapter)||1)>=2||mnXfDebug();
const MN_SECT={yuquan:'玉泉寺',gaibang:'丐帮',lumen:'鹿门书院',taihe:'太和观',yiyong:'京湖义勇',chuanbang:'汉江船帮',baixian:'白鹇谷'};
const mnSubCap=(lv=(S&&S.lv)||1)=>lv>=39?3:lv>=25?2:lv>=13?1:0;   // 辅修槽：突破一/二/三（03 §6.2，以境界层数代行，剧情突破实装后改读 S.realm）
const MN_XF_EB=.03;        // 主修同属内劲武学威力 +3%/层 TBD-34
const MN_XF_SWAP=3;        // 改修主修：气脉未稳场数（期间主修效果减半、特性失效），并清空当前内力 TBD-35
const mnXfStep=n=>.8*n;    // n 层 → n+1 层所需进度（以"一级修为"计）TBD-14
// per：每层 {pct:{派生:比例}, add:{派生:值}, heal:治疗, prof:熟练获取}；t3/t5：3/5 层特性（键见 mnXfSum）；todo:1 = 特性已登记、第二章实装
const XINFA={
  tuna:{name:'吐纳法',slot:'main',sect:null,xing:'中',e:[],per:{pct:{mmp:.05}},t3:{postMp:.10},t5:{postHp:.20},
    d3:'战后调息：回复 10% 内力',d5:'战后调息：另回复 20% 气血',desc:'行走江湖人人会的呼吸吐纳。未入门派者的主修。'},
  yq_xin:{name:'玉泉心经',slot:'main',sect:'yuquan',xing:'阳',e:['阳'],req:{con:5,wil:5},per:{pct:{mmp:.05,mhp:.04}},t3:{startDing:1},t5:{lowRegen:.05},
    d3:'开战时自身「定神」1 回合',d5:'气血低于三成时，每回合回复 5% 气血',desc:'玉泉寺根本心法，筋骨如石、心如古井。'},
  yq_shi:{name:'石佛功',slot:'sub',sect:'yuquan',xing:'阳',e:[],req:{con:5},per:{pct:{def:.05}},t3:{todo:1},t5:{todo:1},
    d3:'防御时受伤 ×0.5→×0.4',d5:'防御的回合蓄势照常 +1',desc:'打坐如石佛，挨打不还手的功夫。'},
  gb_xin:{name:'百衲功',slot:'main',sect:'gaibang',xing:'中',e:['毒'],req:{agi:5},per:{pct:{mhp:.05}},t3:{todo:1},t5:{todo:1},
    d3:'免疫中毒',d5:'攻击中毒目标时伤害 +15%',desc:'百家饭养出的百衲身，什么苦都吃得。'},
  gb_shi:{name:'市井身',slot:'sub',sect:'gaibang',xing:'中',e:[],req:{agi:4},per:{add:{dodge:1}},t3:{todo:1},t5:{todo:1},
    d3:'偏法失败不降声望',d5:'打听可对同一人再用一次',desc:'混迹市井的身段，躲闪腾挪自有一套。'},
  lm_xin:{name:'浩然诀',slot:'main',sect:'lumen',xing:'中',e:['雷'],req:{wis:6},per:{pct:{mmp:.05},add:{crit:2}},t3:{todo:1},t5:{todo:1},
    d3:'每场首次看破后，本回合攻击 ×1.3',d5:'暴击倍率 +0.3',desc:'读书养气，浩然之气亦可御敌。'},
  lm_bo:{name:'博闻',slot:'sub',sect:'lumen',xing:'中',e:[],req:{wis:5},per:{prof:.10},t3:{startReveal:1},t5:{startReveal:2},
    d3:'开战时看破每名敌人 1 处弱点',d5:'开战时看破 2 处',desc:'博闻强识，一眼看出对手路数。'},
  th_xin:{name:'太和玄功',slot:'main',sect:'taihe',xing:'阴',e:['阴','雷'],req:{wil:6,wis:5},per:{pct:{mmp:.06}},t3:{todo:1},t5:{mpRegen:.04},
    d3:'纯内劲武学内力 −10%',d5:'每回合回复 4% 内力',desc:'太和观玄门正宗，阴柔绵长，可引雷意。'},
  th_zuo:{name:'坐忘',slot:'sub',sect:'taihe',xing:'阴',e:[],req:{wil:5},per:{pct:{def:.06}},t3:{stunImm:1},t5:{todo:1},
    d3:'免疫眩晕',d5:'受内劲伤害 −15%',desc:'坐忘物我，外邪难侵。'},
  yy_xin:{name:'军中吐纳',slot:'main',sect:'yiyong',xing:'阳',e:['阳'],req:{str:5,con:5},per:{pct:{mhp:.06,mmp:.03}},t3:{startBp:1},t5:{todo:1},
    d3:'开战蓄势 +1',d5:'蓄势上限 6',desc:'行伍里练出来的粗豪呼吸法，气长力足。'},
  yy_zhen:{name:'行伍阵',slot:'sub',sect:'yiyong',xing:'阳',e:[],req:{con:5},per:{pct:{def:.03}},t3:{todo:1},t5:{add:{spd:1}},
    d3:'全队首回合防御提升',d5:'身速 +1',desc:'结阵而战，互为犄角。'},
  bx_xin:{name:'本草经',slot:'main',sect:'baixian',xing:'中',e:['毒'],req:{wis:6},per:{heal:.08,pct:{mmp:.04}},t3:{todo:1},t5:{allRegen:.03},
    d3:'治疗附带解除 1 个异常',d5:'自身回合结束时全队回复 3% 气血',desc:'白鹇谷医经，医毒同源。仅正式弟子可修。'},
  bx_du:{name:'毒经',slot:'sub',sect:'baixian',xing:'阴',e:[],req:{wis:5},per:{},t3:{todo:1},t5:{todo:1},
    d3:'中毒持续 +1 跳',d5:'施加中毒时看破 1 处',desc:'白鹇谷毒方，每层令中毒/流血每跳 +10%（第二章实装）。'}};
Object.assign(ITEMS,{xf_can:{name:'心法残卷',desc:'前人练功的手札残篇。使用后令一门心法进一层（第二章开放）。',xfbook:1}});ICO.xf_can='卷';
const mnXf=w=>mnRec(w).xinfa;
function mnXfEnsure(r,w){const x=r.xinfa=r.xinfa||{};x.main=x.main||null;x.subs=Array.isArray(x.subs)?x.subs.filter(id=>XINFA[id]):[];x.lv=x.lv||{};x.prog=x.prog||{};
  x.known=Array.isArray(x.known)?x.known.filter(id=>XINFA[id]):[];x.unstable=x.unstable||0;if(x.main&&!XINFA[x.main])x.main=null;
  if(mnDef(w).noXf)return;
  const add=id=>{if(!x.known.includes(id)){x.known.push(id);x.lv[id]=x.lv[id]||1}};
  if(((S&&S.chapter)||1)>=2){add('tuna');if(w==='suzhi')add('bx_xin');if(!x.main)x.main=w==='suzhi'?'bx_xin':'tuna'}   // 第二章开篇：人人得吐纳法；苏芷为白鹇谷正式弟子
  if(mnXfDebug())for(const id in XINFA)add(id)}
const mnXfList=w=>mnDef(w).noXf?[]:(mnXf(w).known||[]).filter(id=>XINFA[id]);
const mnSect=w=>w==='hero'?(S.sect||null):mnDef(w).sect||null;
// 运转中的心法（主修 + 辅修）的合计效果
function mnXfSum(w){const o={pct:{},add:{},eb:{},heal:0,prof:0,tr:{},act:[]};if(!S||!mnXfOn())return o;const r=mnRec(w);if(!r||!r.xinfa||mnDef(w).noXf)return o;const x=r.xinfa;
  const run=[x.main,...x.subs].filter(id=>id&&XINFA[id]);
  for(const id of run){const f=XINFA[id],n=x.lv[id]||1,main=id===x.main,k=main&&x.unstable>0?.5:1;o.act.push(id);
    for(const[a,v]of Object.entries(f.per.pct||{}))o.pct[a]=(o.pct[a]||0)+v*n*k;
    for(const[a,v]of Object.entries(f.per.add||{}))o.add[a]=(o.add[a]||0)+v*n*k;
    if(f.per.heal)o.heal+=f.per.heal*n*k;if(f.per.prof)o.prof+=f.per.prof*n*k;
    if(main)for(const e of f.e)o.eb[e]=(o.eb[e]||0)+MN_XF_EB*n*k;
    if(main&&x.unstable>0)continue;   // 气脉未稳：主修特性失效
    for(const[t,lv]of[['t3',3],['t5',5]])if(n>=lv&&f[t])for(const[a,v]of Object.entries(f[t])){if(a==='todo')continue;
      if(a==='add'){for(const[b,u]of Object.entries(v))o.add[b]=(o.add[b]||0)+u}else o.tr[a]=Math.max(o.tr[a]||0,v)}}
  return o}
// 能否运转：返回原因（空串 = 可以）。slot: 'main'|'sub'
function mnXfWhy(w,id,slot){const f=XINFA[id];if(!f)return'未知心法';if(!mnXfOn())return'心法【第二章开放】';if(mnDef(w).noXf)return`${mnName(w)}不修心法`;
  const x=mnXf(w);if(!x.known.includes(id))return'尚未习得';
  if(f.slot!==slot)return f.slot==='main'?'此为主修心法':'此为辅修心法';
  if(slot==='main'&&f.sect&&f.sect!==mnSect(w))return`须为${MN_SECT[f.sect]}门下方可主修`;
  if(slot==='sub'){const cap=mnSubCap();if(!cap)return'辅修须境界突破「登堂入室」（13 层）';if(!x.subs.includes(id)&&x.subs.length>=cap)return`辅修已满（${cap} 门）`}
  const st=mnStE(w);for(const[a,v]of Object.entries(f.req||{}))if((st[a]||0)<v)return`未达门槛：需${STATN[a]} ${v}（现 ${st[a]||0}）`;
  const others=[slot==='main'?null:x.main,...x.subs.filter(s=>slot==='main'||s!==id)].filter(s=>s&&s!==id&&XINFA[s]);
  if(f.xing!=='中'){const c=others.find(s=>XINFA[s].xing!=='中'&&XINFA[s].xing!==f.xing);if(c)return`与「${XINFA[c].name}」阴阳相冲`}
  return''}
function mnXfToggleSub(w,id){const x=mnXf(w),i=x.subs.indexOf(id);if(i>=0){x.subs.splice(i,1);mnClampHP(w);return''}const why=mnXfWhy(w,id,'sub');if(why)return why;x.subs.push(id);return''}
function mnXfSetMain(w,id){const x=mnXf(w),why=mnXfWhy(w,id,'main');if(why)return why;if(x.main===id)return'';const cost=!!x.main;x.main=id;
  if(cost){x.unstable=MN_XF_SWAP;if(w==='hero')S.mp=0;else S.mates[w].mp=0}
  // 与新主修相冲的辅修自动停修
  x.subs=x.subs.filter(s=>!(XINFA[s].xing!=='中'&&XINFA[id].xing!=='中'&&XINFA[s].xing!==XINFA[id].xing));mnClampHP(w);return''}
function mnXfMain(w,id){const x=mnXf(w),why=mnXfWhy(w,id,'main');if(why){toast(why,1300);return}if(x.main===id)return;
  if(!x.main){mnXfSetMain(w,id);mnDraw();return}
  mnWithHidden(async()=>{const c=await choose('',`改修「${XINFA[id].name}」为主修？代价：当前内力清空；此后 ${MN_XF_SWAP} 场战斗气脉未稳（主修效果减半、特性失效）。「${XINFA[x.main].name}」的层数保留。`,['改修','算了']);
    if(c===0){mnXfSetMain(w,id);await toast(`${mnName(w)} 改修「${XINFA[id].name}」· 气脉未稳`,1400)}})}
// 心法修炼：胜利修为折算为"级"的进度；主修全额、辅修一半；n → n+1 层需 0.8n 级
function mnXfGain(w,exp,lv){if(!mnXfOn()||mnDef(w).noXf)return[];const x=mnXf(w),ev=[],need=(typeof needExp==='function'?needExp(lv):lv*100);   // 升级所需修为：与 bui.js victory 现行 L×100 一致（08 §2.1 目标公式落地后改读 needExp）
  for(const id of[x.main,...x.subs].filter(Boolean)){let n=x.lv[id]||1;if(n>=5)continue;let p=(x.prog[id]||0)+exp/need*(id===x.main?1:.5);
    while(n<5&&p>=mnXfStep(n)){p-=mnXfStep(n);n++;ev.push({w,xf:id,lv:n})}x.lv[id]=n;x.prog[id]=n>=5?0:Math.round(p*1000)/1000}
  return ev}
// 战后结算：熟练（按倍率）、心法层数、战后调息、气脉未稳计数。mul：胜 1、败/逃 .5
function mnSettle(mul,exp,lv0){mnSettled=true;const ev=[];if(!S)return ev;mnEnsure();ev.push(...mnDimSettle(mul));
  for(const[w,L]of Object.entries(mnProfLog)){if(w!=='hero'&&!S.mates[w])continue;const X=mnXfSum(w),k=mul*mnWisMul(mnStE(w).wis||3)*(1+X.prof);
    for(const[sk,pts]of Object.entries(L))ev.push(...mnProfGain(w,sk,pts*k))}
  const who=['hero',...mnLive.map(l=>l[0])];
  if(exp>0)for(const w of who)ev.push(...mnXfGain(w,exp,lv0||S.lv));
  if(mul>=1)for(const w of who){const tr=mnXfSum(w).tr;if(!tr.postMp&&!tr.postHp)continue;const live=w==='hero'?null:(mnLive.find(l=>l[0]===w)||[])[1];
    if(w==='hero'){const d=derived();S.mp=Math.min(d.mmp,S.mp+Math.round(d.mmp*(tr.postMp||0)));S.hp=Math.min(d.mhp,S.hp+Math.round(d.mhp*(tr.postHp||0)))}
    else if(live){live.mp=Math.min(live.mmp,live.mp+Math.round(live.mmp*(tr.postMp||0)));if(live.hp>0)live.hp=Math.min(live.mhp,live.hp+Math.round(live.mhp*(tr.postHp||0)))}
    if(tr.postMp||tr.postHp)ev.push({w,rest:1})}
  for(const w of mnMembers()){const x=mnRec(w).xinfa;if(x&&x.unstable>0){x.unstable--;if(!x.unstable)ev.push({w,stable:1})}}
  mnProfLog={};mnEnsure();return ev}
function mnEvTxt(e){const n=esc(mnName(e.w));
  if(e.lv&&e.k)return`<div class="lv">${n} ·「${SKILLS[e.k].name}」突破至第 ${e.lv} 重</div>`;
  if(e.block)return`<div class="ln"><span>${n} ·「${SKILLS[e.k].name}」熟练已满</span><b>${esc(e.block)}</b></div>`;
  if(e.xf)return`<div class="lv">${n} ·「${XINFA[e.xf].name}」进至第 ${e.lv} 层</div>`;
  if(e.rest)return`<div class="ln"><span>${n}</span><b>吐纳调息 · 气血内力稍复</b></div>`;
  if(e.stable)return`<div class="ln"><span>${n}</span><b>气脉已稳</b></div>`;
  if(e.zy)return`<div class="ln"><span>${n} · ${e.zy}造诣</span><b>${e.v}（${e.zy}伤害 +${Math.round(mnZyBonus(e.v)*100)}%）</b></div>`;return''}
// 胜利结算之后追加一屏「精进」（与 bui.js 胜利面板同一 #bt-win 样式，点击/Enter 继续）
async function mnGrowPanel(ev){const html=ev.map(mnEvTxt).join('');if(!html||!$('bt'))return;const w=document.createElement('div');w.id='bt-win';w.className='jm-grow';
  w.innerHTML=`<div class="wt"><h2>精进</h2></div>${html}<div class="go">点击或按 Enter 继续</div>`;$('bt').appendChild(w);try{bsfx('chime',.6,1.2)}catch(e){}await wait(300);
  await new Promise(r=>{const f=()=>{removeEventListener('keydown',kf,true);w.removeEventListener('pointerdown',f);if(B)B.click=null;r()};
    const kf=e=>{if(['Enter',' ','z','Z','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();f()}};
    addEventListener('keydown',kf,true);w.addEventListener('pointerdown',f);if(B)B.click=()=>f()});w.remove()}
// ── 战斗钩子（均为"包一层"，不改 battle/bfx/bui 的实现） ──
// 施展武学：记熟练；火候的内力增减与出手看破
const mnDoSkill0=doSkill;
doSkill=async function(u,k,tgs,bp){const w=u&&u.side==='ally'&&u.mw?u.mw:null;const snap=(tgs||[]).filter(t=>t&&t.side==='foe').map(t=>[t,t.shield,!!t.broken]);
  const r=await mnDoSkill0.apply(this,arguments);
  if(w&&S){let weak=0,brk=0;for(const[t,sh,br]of snap){if(!br&&t.broken)brk++;if((!br&&t.broken)||t.shield<sh)weak=1}
    const L=mnProfLog[w]=mnProfLog[w]||{};L[k]=(L[k]||0)+1+weak+brk;
    const Z=mnZyLog[w]=mnZyLog[w]||{};if(SKILLS[k].heal)Z['@yi']=(Z['@yi']||0)+1;if(mnBsk(k).e==='毒')Z['@du']=(Z['@du']||0)+1;
    const h=mnHuo(k,mnSk(w)[k]||1);if(h.mp<0&&SKILLS[k].mp)u.mp=Math.min(u.mmp,u.mp-Math.max(h.mp,-SKILLS[k].mp));
    const t0=snap.map(s=>s[0]).find(t=>t.hp>0);if(h.reveal&&t0&&typeof reveal==='function')reveal(t0,h.reveal);try{renderCards()}catch(e){}}
  return r};
const mnVictory0=victory;
victory=async function(){let exp=0;try{for(const f of B.foes)exp+=f.exp||0;exp=Math.round(exp*(B.opt.tutorial?.5:1))}catch(e){}const lv0=S.lv;
  const r=await mnVictory0.apply(this,arguments);let ev=[];try{ev=mnSettle(1,exp,lv0)}catch(e){console.error(e)}if(ev.length)await mnGrowPanel(ev);return r};
// 开战：心法特性（蓄势 / 定神 / 看破）
const mnLayout0=layoutUnits;
layoutUnits=function(allies,foes,opt){const r=mnLayout0.apply(this,arguments);try{for(const u of allies){const tr=(u.xf||{}).tr||{};
    if(tr.startBp)u.bp=Math.min(5,u.bp+tr.startBp);if(tr.startDing)u.buffs.ding=Math.max(u.buffs.ding||0,tr.startDing+1);
    if(tr.startReveal)for(const f of foes){const hid=f.weak.filter(x=>!f.known.has(x));for(let i=0;i<tr.startReveal&&hid.length;i++)f.known.add(hid.splice(ri(0,hid.length-1),1)[0])}}}catch(e){console.error(e)}return r};
// 每名单位行动后：心法回复特性
const mnTick0=tickBuffs;
tickBuffs=function(u){const r=mnTick0.apply(this,arguments);try{const tr=u&&u.side==='ally'&&u.hp>0&&u.xf&&u.xf.tr;if(tr&&B){
    if(tr.mpRegen&&u.mp<u.mmp){const n=Math.max(1,Math.round(u.mmp*tr.mpRegen));u.mp=Math.min(u.mmp,u.mp+n);floatTxt(u,'内力+'+n,'#8cf',18)}
    if(tr.lowRegen&&u.hp<u.mhp*.3)heal(u,Math.max(1,Math.round(u.mhp*tr.lowRegen)));
    if(tr.allRegen)for(const a of aliveOf('ally'))if(a.hp<a.mhp)heal(a,Math.max(1,Math.round(a.mhp*tr.allRegen)))}}catch(e){console.error(e)}return r};
// 敌方出手后：坐忘免疫眩晕
const mnFoeAct0=foeAct;
foeAct=async function(){const r=await mnFoeAct0.apply(this,arguments);try{if(B)for(const u of B.allies)if(u.stun&&u.xf&&u.xf.tr.stunImm){u.stun=false;floatTxt(u,'坐忘 · 不为所动','#e0d6ff',18)}}catch(e){}return r};

// ───────── HUD 红点：同伴有待分配属性点 ─────────
const mnHud0=hud;
hud=function(){mnHud0();try{if(S&&mode==='scene'&&!S.pts&&mnMembers().some(w=>mnPts(w))){const b=$('hb');if(b&&!b.querySelector('.dot'))b.insertAdjacentHTML('beforeend','<span class="dot"></span>')}}catch(e){}};

// ───────── 江湖菜单 ─────────
TABS.length=0;TABS.push(['attr','属性','人'],['skill','武学','武'],['bag','行囊','囊'],['equip','装备','装'],['party','队伍','伴'],['quest','任务','志'],['sys','设置','设']);
const MN_MEMTABS=['attr','skill','bag','equip'];const mnMemTab=t=>MN_MEMTABS.includes(t);
let mnWho='hero',mnPend=null,mnBagCat='全部';
// 水墨素材（BUI 程序化生成，缓存为 dataURL）
const mnArt={};
function mnMk(key,f){if(mnArt[key]!==undefined)return mnArt[key];let v='';try{v=f()||''}catch(e){v=''}return mnArt[key]=v}
const mnB=()=>window.BUI;
const mnSw=(w,h,o,key)=>mnMk('sw'+key,()=>mnB().url(mnB().swash(w,h,o)));
function mnPaper(){return mnMk('paper',()=>{const U=mnB(),w=1000,h=580,p=U.paper(w,h,{pr:1,seed:11,col:'#eadcbb',edge:22});
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');let sd=5;const rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  const pts=[],J=(a)=>(rn()-.5)*a,M=9;
  for(let i=0;i<=w;i+=10)pts.push([i,M+J(6)+Math.sin(i*.013)*2]);for(let i=0;i<=h;i+=10)pts.push([w-M+J(6),i]);
  for(let i=w;i>=0;i-=10)pts.push([i,h-M+J(6)+Math.sin(i*.02)*2]);for(let i=h;i>=0;i-=10)pts.push([M+J(6),i]);
  x.filter='blur(1.2px)';x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fillStyle='#000';x.fill();x.filter='none';
  x.globalCompositeOperation='source-in';x.drawImage(p,0,0,w,h);
  // 淡墨晕：左上一抹远山
  x.globalCompositeOperation='source-atop';const gr=x.createRadialGradient(w*.9,h*.08,10,w*.9,h*.08,w*.35);gr.addColorStop(0,'rgba(60,45,30,.10)');gr.addColorStop(1,'rgba(60,45,30,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);
  return c.toDataURL('image/jpeg',.88).length>0?c.toDataURL('image/png'):''})}
function mnFace(w){return mnMk('face'+w,()=>{const U=mnB();let u;
  if(w==='hero')u={side:'ally',por:'hero',art:'hero',hp:1,mhp:1};else{const P=PARTY_DEF[w];u={side:'ally',por:P.por.find(p=>ok(IMG['p_'+p]))||P.por[0],art:pickArt(P.art),hp:1,mhp:1}}
  const c=U.face(u,72);if(c)return U.url(c);const m=miniSprite('c_'+u.art);return m?m.toDataURL():''})}
function mnPor(w){if(w==='hero')return'assets/p_hero.webp';const P=PARTY_DEF[w];const p=P.por.find(p=>ok(IMG['p_'+p]));if(p)return`assets/p_${p}.webp`;
  return mnMk('spr'+w,()=>{const m=miniSprite('c_'+pickArt(P.art));return m?m.toDataURL():''})}
const MN_KCOL={拳:'#b8612c',掌:'#a0522d',剑:'#2f6f8f',刀:'#6b6356',棍:'#8a6a3a',鞭:'#7a5a2a',腿:'#9a4a2a',暗器:'#4f5f78',内:'#3a4f8a',医:'#2f6b45',咬:'#6b4a3a'};
function mnBlot(ch,col,sz=30){return mnMk(`bl${ch}${col}${sz}`,()=>mnB().url(mnB().blot(ch,col,sz)))}
function mnIco(k,sz=30){if(icoAtlas()&&window.ART&&ART.icons&&ART.icons[k])return ico(k).replace('class="ico img"',`class="ico img jm-ai" style="width:${sz/16}em;height:${sz/16}em"`);const g=ICO[k]||(ITEMS[k]?.name||'?')[0];return`<img class="jm-blot" src="${mnBlot(g,mnQ(k)[1],sz)}" alt="">`}
function mnSkIco(k,sz=30){const s=SKILLS[k];const ch=(s.name||s.kind)[0];return`<img class="jm-blot" src="${mnBlot(ch,MN_KCOL[s.kind]||'#3b2c1b',sz)}" alt="">`}
function mnSeal(t,w=26,h=w){return mnMk(`se${t}${w}${h}`,()=>mnB().url(mnB().seal(t,w,h)))}
function mnBar(lbl,v,max,col,key){const p=clamp(v/Math.max(1,max),0,1)*100,tr=mnSw(300,10,{col:'#3b2c1b',a:.16,dry:.5,seed:71,tail:.2},'tr'),fl=mnSw(300,10,{col,a:.92,dry:.35,seed:key.length+72,tail:.12,head:.03},'f'+key);
  return`<div class="jm-bar"><span class="l">${lbl}</span><div class="tr" style="background-image:url(${tr})"><i style="width:${p}%;background-image:url(${fl});background-size:${p>0?1e4/p:100}% 100%"></i></div><b>${v}<small>/${max}</small></b></div>`}
const mnArrow=d=>d>0?`<em class="up">▲${d}</em>`:d<0?`<em class="dn">▼${-d}</em>`:'';

function bagPanel(tab,who){if(!S)return;mnEnsure();if(who)mnWho=who;if(!mnMembers().includes(mnWho))mnWho='hero';
  if(tab)menuTab=tab==='xinfa'?'skill':tab;else{const pw=mnMembers().find(w=>mnPts(w));if(pw){menuTab='attr';mnWho=pw}}
  if(!TABS.some(t=>t[0]===menuTab))menuTab='attr';mnPend=null;
  const p=openPanel('jm');panelClose=()=>{mnPend=null;hud()};p.onclick=mnClick;p.onpointermove=mnHover;p.onpointerleave=mnHideHover;p.onfocusin=mnHover;p.onfocusout=mnHideHover;try{mnB()&&mnB().injectFonts()}catch(e){}mnDraw()}
function mnDraw(){const p=$('panel');if(!p||p.hidden||!p.classList.contains('jm'))return;panelKind='menu';panelRedraw=mnDraw;mnCSS();mnEnsure();
  if(menuTab==='xinfa')menuTab='skill';if(!mnMembers().includes(mnWho))mnWho='hero';const T=TABS.find(t=>t[0]===menuTab)||TABS[0];
  const oldScroll=p.dataset.menuTab===menuTab&&p.dataset.menuWho===mnWho?p.querySelector('.jm-body')?.scrollTop||0:0;
  const pageNote={attr:'人物根基与江湖阅历',skill:'招式与心法，内外同修',bag:'随身器物与行路所需',equip:'兵刃衣甲，因人而择',party:'同行之人，共赴江湖',quest:'旧事新约，记于此卷',sys:'声画与行路习惯'}[menuTab];
  const tabs=TABS.map(([k,n,i],j)=>{const dot=(k==='attr'&&mnMembers().some(w=>mnPts(w)));return`<button data-a="tab" data-k="${k}" class="${menuTab===k?'on':''}" aria-label="${n}"><span class="n">${j+1}</span><span class="jm-navmark">${i}</span><span class="jm-navlabel">${n}</span>${dot?'<i class="jm-dot"></i>':''}</button>`}).join('');
  const mem=mnMemTab(menuTab)?`<div class="jm-mem">${mnMembers().map(w=>`<button data-a="who" data-w="${w}" class="jm-mc${w===mnWho?' on':''}" aria-label="${esc(mnName(w))}"><span class="f" style="background-image:url(${mnFace(w)})"></span><span class="r" style="background-image:url(${mnMk('enso'+(w===mnWho),()=>mnB().url(mnB().enso(64,{col:w===mnWho?'#a8261c':'#2b1e12',seed:w.length+3})))})"></span><span class="nm">${esc(mnName(w))}</span>${mnPts(w)?'<i class="jm-dot"></i>':''}</button>`).join('')}<span class="jm-memk">Z / C 切换</span></div>`:'';
  const side=mem&&matchMedia('(min-width:761px)').matches?(()=>{const {hp,mp,d}=mnHP(mnWho);return`<aside class="jm-side"><div class="jm-sideCaption">人物 · ${String(mnMembers().indexOf(mnWho)+1).padStart(2,'0')}</div><div class="jm-sidePortrait" style="background-image:url(${mnPor(mnWho)})"></div><div class="jm-sideName">${esc(mnName(mnWho))}</div><div class="jm-sideRole">${mnDef(mnWho).role} · 境界 ${S.lv} 层</div><div class="jm-sideVitals">${mnBar('气血',hp,d.mhp,'#b3261e','sidehp')}${mnBar('内力',mp,d.mmp,'#2d4f73','sidemp')}</div><div class="jm-sideLabel">同行人物</div>${mem}</aside>`})():mem;
  let body='';try{body=MN_TAB[menuTab]()}catch(e){console.error(e);body=`<div class="jm-empty">此页出错：${esc(e.message)}</div>`}
  p.innerHTML=`<div class="jm-top"><span class="jm-ttl">江湖行卷</span><span class="jm-topChapter">襄阳风云 · ${S.chapter||1} 卷</span><span class="jm-stat"><span><img src="${mnMk('coin',()=>mnB().url(mnB().coin('on',18)))}" alt="">银两 <b>${S.silver}</b></span><span>侠义 <b>${S.moral}</b></span><span>境界 <b>${S.lv}</b> 层</span></span><button class="jm-desktop-close" data-a="close" aria-label="返回江湖">×<small>Esc</small></button><button class="jm-mobile-close" data-a="close" aria-label="返回江湖">返回</button></div>
   <nav class="jm-tabs" style="--sw:url(${mnSw(200,44,{col:'#0d0806',a:.94,dry:.4,seed:9,halo:'#d8c49a',haloA:.28},'tab')})">${tabs}<button data-a="close" class="jm-close" aria-label="返回">返回<small>Esc</small></button></nav>
   <section class="jm-sheet jm-screen-${menuTab}" style="background-image:url(${mnPaper()})"><header class="jm-pagehead"><div class="jm-pageid">江 湖 行 卷 <span>·</span> ${String(TABS.findIndex(t=>t[0]===menuTab)+1).padStart(2,'0')} / ${String(TABS.length).padStart(2,'0')}</div><div class="jm-pageTitle">${T[1]}</div><p>${pageNote}</p><img src="${mnSeal(T[2],44)}" alt=""></header>${side}<div class="jm-body jm-${menuTab}">${body}</div></section>
   <div class="jm-keys">Q / E 翻页 · 1–${TABS.length} 直达 · Esc 返回</div><div class="jm-float" hidden></div>`;
  p.dataset.menuTab=menuTab;p.dataset.menuWho=mnWho;p.querySelector('.jm-body').scrollTop=oldScroll;
  if(matchMedia('(max-width:640px)').matches)p.querySelector('.jm-tabs button.on')?.scrollIntoView({block:'nearest',inline:'center'})}
function mnClick(e){const b=e.target.closest('[data-a]');if(!b||b.disabled||!$('panel').contains(b))return;e.stopPropagation();const a=b.dataset.a,k=b.dataset.k,w=b.dataset.w;
  const snd=n=>{try{window.__audio&&__audio.sfx(n,.5)}catch(e){}};
  switch(a){
  case'close':closePanel();return;
  case'tab':menuTab=k;break;
  case'who':if(mnWho!==w){mnWho=w;mnPend=null}break;
  case'pt':{const pts=mnPts(mnWho);if(!mnPend||mnPend.who!==mnWho)mnPend={who:mnWho,add:{}};const used=Object.values(mnPend.add).reduce((x,y)=>x+y,0),d=+b.dataset.d;
    if(d>0&&used<pts&&mnSt(mnWho)[k]+(mnPend.add[k]||0)<mnCap())mnPend.add[k]=(mnPend.add[k]||0)+1;else if(d<0&&(mnPend.add[k]||0)>0)mnPend.add[k]--;snd('blip');break}
  case'ptok':{if(!mnPend)break;const st=mnSt(mnPend.who);let n=0;for(const[s,v]of Object.entries(mnPend.add)){st[s]+=v;n+=v}
    if(mnPend.who==='hero')S.pts-=n;else S.mates[mnPend.who].pts-=n;
    // 气血/内力上限提升的部分直接补上（与升级回满的体验一致，避免"加根骨后血条变短"）
    const who=mnPend.who,d0=mnD(who,{st:Object.fromEntries(Object.keys(mnPend.add).map(s=>[s,-mnPend.add[s]]))}),d1=mnD(who);
    if(who==='hero'){S.hp+=Math.max(0,d1.mhp-d0.mhp);S.mp+=Math.max(0,d1.mmp-d0.mmp)}else{const m=S.mates[who];if(m.hp!=null)m.hp+=Math.max(0,d1.mhp-d0.mhp);if(m.mp!=null)m.mp+=Math.max(0,d1.mmp-d0.mmp)}
    mnPend=null;snd('chime');toast(`${mnName(who)} 根基精进`,900);hud();break}
  case'ptreset':mnPend=null;break;
  case'ptauto':{const pts=mnPts(mnWho),pr=MN_PREF[mnWho==='hero'?S.origin:mnWho]||['str','con','agi','wil','wis'],st=mnSt(mnWho);mnPend={who:mnWho,add:{}};
    for(let n=0,i=0;n<pts&&i<pts*6;i++){const s2=pr[i%pr.length];if(st[s2]+(mnPend.add[s2]||0)<mnCap()){mnPend.add[s2]=(mnPend.add[s2]||0)+1;n++}}snd('blip');break}
  case'ld':{const r=mnRec(mnWho),i=r.load.indexOf(k);if(i>=0)r.load.splice(i,1);else{const why=mnLoadWhy(mnWho,k,r.load);if(why){toast(why,1300);snd('menu_close');return}r.load.push(k)}snd('select');break}
  case'xfm':mnXfMain(mnWho,k);return;
  case'xfs':{const why=mnXfToggleSub(mnWho,k);if(why){toast(why,1300);snd('menu_close');return}snd('select');break}
  case'cat':mnBagCat=k;break;
  case'bagact':{const it=ITEMS[k];if(mnSlot(k)){const why=mnCan(mnWho,k);if(why){toast(why,1300);break}if(mnEquip(mnWho,k)){snd('select');toast(`${mnName(mnWho)} 装备 ${it.name}`,900)}}else if(it.heal||it.mp||it.book||it.xfbook||it.gall){mnUse(k,mnWho);return}break}
  case'uneq':mnUnequip(mnWho,k);snd('menu_close');break;
  case'cfg':mnWho=w;menuTab=k==='xinfa'?'skill':k||'attr';break;
  case'talk':mnTalk(w);return;
  case'mv':{const i=S.party.indexOf(w),j=i+(+b.dataset.d);if(i>=0&&j>=0&&j<S.party.length){[S.party[i],S.party[j]]=[S.party[j],S.party[i]]}break}
  case'petfeed':{const h=petHealth();if(h&&S.bag.bun>0&&h.hp<h.d.mhp){S.bag.bun--;S.pets[S.pet].hp=Math.min(h.d.mhp,h.hp+40);snd('chime');toast('大黄吃得欢快，气血恢复',1100)}break}
  case'peteq':{const p=S.pets[S.pet];if(p&&S.bag.collar>0&&!p.equip.acc){S.bag.collar--;p.equip.acc='collar';snd('select');toast('大黄戴上铜铃项圈',1100)}break}
  case'petuneq':{const p=S.pets[S.pet];if(p&&p.equip.acc){S.bag[p.equip.acc]=(S.bag[p.equip.acc]||0)+1;p.equip.acc=null;snd('select')}break}
  case'teach':{const m=S.mates[w];if(m&&!m.skills[k]){m.skills[k]=1;mnEnsure();snd('chime');toast(`${mnName(w)} 习得「${SKILLS[k].name}」`,1400)}break}
  case'ask':mnAsk(w,k);return;
  case'mute':try{__audio.setMute(!__audio.muted)}catch(e){}break;
  case'theme':try{BUI.setTheme(BUI.theme==='ink'?'scroll':'ink')}catch(e){}break;
  case'save':save();toast('已存档',900);break}
  mnDraw()}
async function mnWithHidden(f){const p=$('panel');p.hidden=true;try{await f()}finally{p.hidden=false;mnDraw()}}
function mnTalk(w){if(typeof window.onCompanionTalk!=='function')return;mnWithHidden(()=>window.onCompanionTalk(w))}
function mnAsk(w,k){const g=(mnDef(w).gives||[]).find(x=>x.sk===k);if(!g||S.skills[k])return;
  mnWithHidden(async()=>{const P=PARTY_DEF[w];await say(P.name,g.line,w==='suzhi'&&typeof SZ!=='undefined'?SZ.sp:'c_'+P.art[0]);S.skills[k]=1;mnEnsure();await toast(`习得武学「${SKILLS[k].name}」`,1400)})}
function mnUse(k,w){const it=ITEMS[k];if(!(S.bag[k]>0))return;
  if(it.book){const all=Object.keys(mnSk(w)).filter(s=>s!=='fist'&&SKILLS[s]),sk=all.filter(s=>!mnUpWhy(w,s,true));
    if(!sk.length){const r0=all.map(s=>`${SKILLS[s].name}：${mnUpWhy(w,s,true)}`)[0];toast(all.length?`无法参悟 · ${r0}`:'尚无可参悟的武学',1600);return}
    mnWithHidden(async()=>{const c=await choose('',`${mnName(w)}参悟哪门武学？`,[...sk.map(s=>`${SKILLS[s].name}（${mnSk(w)[s]} 重 → ${mnSk(w)[s]+1} 重）`),'算了']);if(c>=sk.length)return;
      mnSk(w)[sk[c]]++;S.bag[k]--;mnEnsure();await toast(`「${SKILLS[sk[c]].name}」突破至第 ${mnSk(w)[sk[c]]} 重`)});return}
  if(it.xfbook){const L=mnXfList(w).filter(id=>(mnXf(w).lv[id]||1)<5);if(!mnXfOn()||!L.length){toast(mnXfOn()?'尚无可精进的心法':'心法【第二章开放】',1200);return}
    mnWithHidden(async()=>{const X=mnXf(w),c=await choose('',`${mnName(w)}参悟哪门心法？`,[...L.map(id=>`${XINFA[id].name}（第 ${X.lv[id]||1} 层）`),'算了']);if(c>=L.length)return;
      X.lv[L[c]]=(X.lv[L[c]]||1)+1;X.prog[L[c]]=0;S.bag[k]--;await toast(`「${XINFA[L[c]].name}」进至第 ${X.lv[L[c]]} 层`)});return}
  if(it.gall){const r=w==='hero'?S:S.mates[w];r.mpBonus=(r.mpBonus||0)+30;S.bag[k]--;toast(`${mnName(w)} 内力上限 +30`,1000);mnDraw();return}
  const{hp,mp,d}=mnHP(w);if((!it.heal||hp>=d.mhp)&&(!it.mp||mp>=d.mmp)){toast(`${mnName(w)}无需服用`,900);return}
  const yi=Math.max(0,...mnMembers().map(x=>mnJi(x).yi||0)),hk=1+Math.min(yi,MN_ZY_MAX)/200;   // 医术：队中最高者每 2 点 +1%（03 §9.3）
  S.bag[k]--;const nh=Math.min(d.mhp,hp+Math.round((it.heal||0)*hk)),nm=Math.min(d.mmp,mp+(it.mp||0));
  if(w==='hero'){S.hp=nh;S.mp=nm}else{const m=S.mates[w];m.hp=nh>=d.mhp?null:nh;m.mp=nm>=d.mmp?null:nm}
  try{__audio.sfx('chime',.5)}catch(e){}toast(`${mnName(w)} 服下 ${it.name}`,900);mnDraw()}

// ───────── 各页 ─────────
const MN_TAB={
attr(){const w=mnWho,P=w==='hero'?null:PARTY_DEF[w],pts=mnPts(w),pend=mnPend&&mnPend.who===w?mnPend.add:{},used=Object.values(pend).reduce((a,b)=>a+b,0);
  const d=mnD(w),dn=used?mnD(w,{st:pend}):d,{hp,mp}=mnHP(w),base=mnSt(w);
  const sub=w==='hero'?`${ORIGINS[S.origin].name} · ${mnDef(w).role}`:mnDef(w).role;const a=w==='hero'?null:((S.aff||{})[w]);
  const aff=a==null?'':`<div class="jm-aff"><span class="l">好感</span><span class="h">${'♥'.repeat(clamp(Math.ceil(a/2),0,10))}<i>${'♡'.repeat(10-clamp(Math.ceil(a/2),0,10))}</i></span><span class="v">${a>=8?'知己':a>=5?'信赖':a>=2?'熟络':a>=0?'生疏':'冷淡'}</span></div>`;
  return`<div class="jm-card"><div class="por${P&&!P.por.some(p=>ok(IMG['p_'+p]))?' spr':''}" style="background-image:url(${mnPor(w)})"></div>
    <div class="nmw"><div class="nm">${esc(mnName(w))}</div><div class="or">${sub} · 境界 ${S.lv} 层${mnNeixi(w)!=='—'?` · 内息 <b class="jm-nx">${mnNeixi(w)}</b>`:''}</div></div>
    <div class="jm-bars">${mnBar('气血',hp,d.mhp,'#b3261e','hp')}${mnBar('内力',mp,d.mmp,'#2d4f73','mp')}${w==='hero'?mnBar('修为',S.exp,S.lv*100,'#b08a3a','xp'):''}</div>${aff}<div class="jm-dims one">${mnDimsHTML(w,1)}</div></div>
   <div class="jm-cols"><h4>根基${pts?`<img class="jm-seal" src="${mnSeal('待分',24)}" alt=""><span class="jm-red">可分配 ${pts-used} / ${pts} 点</span>`:'<span class="jm-dim">升一层境界得 3 点</span>'}</h4>
    <div class="jm-stats">${Object.keys(STATN).map(s=>{const eqb=d.st[s]-base[s],ad=pend[s]||0;return`<div class="row" title="${STATD[s]}"><span class="k">${STATN[s]}</span>
      <b>${base[s]+ad}</b><span class="ex">${ad?`<em class="up">+${ad}</em>`:''}${eqb?`<span class="eqb">装备 ${eqb>0?'+':''}${eqb}</span>`:''}</span><span class="ds">${STATD[s]}</span>
      ${pts?`<button class="jm-pm" data-a="pt" data-k="${s}" data-d="-1" ${ad?'':'disabled'} aria-label="${STATN[s]}减一">－</button><button class="jm-pm" data-a="pt" data-k="${s}" data-d="1" ${used<pts&&base[s]+ad<mnCap()?'':'disabled'} aria-label="${STATN[s]}加一">＋</button>`:''}</div>`}).join('')}</div>
    ${pts?`<div class="jm-acts"><span class="jm-dim cap">单项上限 ${mnCap()}（装备加成不计）</span>${used<pts?`<button class="jm-b ghost" data-a="ptauto">按${w==='hero'?'出身':'习性'}分配</button>`:''}${used?`<button class="jm-b ghost" data-a="ptreset">重置</button><button class="jm-b" data-a="ptok">确定加点</button>`:''}</div>`:''}
    <h4>武斗<span class="jm-dim">格挡：被击中时按此率受伤减半 · 命中、连击、反击【后续】</span></h4><div class="jm-der">${MN_DK.map(k=>`<div><span class="k">${MN_FXN[k]}</span><b>${d[k]}${MN_PCT[k]?'%':''}</b>${mnArrow(dn[k]-d[k])}</div>`).join('')}</div>
    <div class="jm-dims">${mnDimsHTML(w,0)}</div>
   </div>`},
skill(){const w=mnWho,r=mnRec(w),sk=mnSk(w),e=mnEq(w),wk=e.weapon&&ITEMS[e.weapon]?ITEMS[e.weapon].weapon.kind:null,cap=mnLoadCap(),chCap=MN_SKCAP(),st=mnStE(w);
  const list=Object.keys(sk).filter(k=>SKILLS[k]&&k!=='fist');
  const slot=i=>{const k=r.load[i];if(k)return`<button class="jm-ls on" data-a="ld" data-k="${k}" title="点击卸下">${mnSkIco(k,34)}<span class="nm">${SKILLS[k].name}</span><small>${sk[k]} 重 · 卸下</small></button>`;
    if(i>=cap){const s=MN_LOAD_STEPS.find(x=>x[1]===i+1);return`<div class="jm-ls lk"><span class="em">锁</span><small>${s?(s[0]>=13?'登堂入室':`境界 ${s[0]} 层`):''}</small></div>`}
    return`<div class="jm-ls"><span class="em">空</span><small>从下方装配</small></div>`};
  const nx=MN_LOAD_STEPS.find(x=>x[0]>(S.lv||1));
  return`<div class="jm-martial"><section class="jm-martial-art"><h4>招式装配<span class="jm-dim">${r.load.length} / ${cap} 格${nx?` · 境界 ${nx[0]} 层增至 ${nx[1]} 格`:''} · 普攻「${w==='hero'?(wk?ITEMS[e.weapon].name:'拳脚'):PARTY_DEF[w].atkName}」不占栏位</span></h4>
    <div class="jm-load">${[...Array(MN_LOAD).keys()].map(slot).join('')}</div>
    <details class="jm-rules"><summary>装配与精进规则</summary><p>群攻至多 ${MN_AOE_MAX} 门 · 需兵器的武学只择一种兵刃 · 单招内力 ×${MN_MP_RATIO} ≤ 内力上限 · 本章重数上限 ${chCap} 重 · 悟性 ${st.wis||0} → 熟练 ×${mnWisMul(st.wis||3).toFixed(2)}</p></details>
    <h4>已学招式<span class="jm-dim">${list.length} 门 · 悬停查看招式与进度，点击装配或卸下</span></h4>${list.length?`<div class="jm-skillgrid">${list.map(k=>mnSkillCard(k,w,r,sk)).join('')}</div>`:'<div class="jm-empty">尚未习得招式</div>'}</section><section class="jm-martial-inner"><h4>内功心法<span class="jm-dim">${mnXfOn()?'运转内息，常驻加成':'第二章开放'}</span></h4>${MN_TAB.xinfa()}</section></div>`},
xinfa(){if(!mnXfOn())return`<div class="jm-xf"><div class="slots">${['主修','辅修','辅修','辅修'].map((t,i)=>`<div class="c"><span class="mark">${i?'辅':'主'}</span><span>${t}</span><small>未开放</small></div>`).join('')}</div>
  <div class="tx"><img src="${mnSeal('后续',30)}" alt=""><strong>内功篇 · 第二章开启</strong><p>主修与辅修的槽位已列于此。习得心法后，可在本页悬停查看加成、点击运转。</p></div></div>`;
  const w=mnWho;if(mnDef(w).noXf)return`<div class="jm-empty">${esc(mnName(w))}是条狗，不修内功心法。<br>它的本事都在牙口与鼻子上。</div>`;
  const x=mnXf(w),X=mnXfSum(w),subCap=mnSubCap(),L=mnXfList(w).map((id,i)=>[id,(x.main===id||x.subs.includes(id))?0:mnXfWhy(w,id,XINFA[id].slot)?2:1,i]).sort((a,b)=>a[1]-b[1]||a[2]-b[2]).map(a=>a[0]),XC={阳:'#b8612c',阴:'#3a4f8a',中:'#2f6b45'};
  const circ=(id,lab,lock)=>id?`<div class="xc on"><img class="jm-blot" src="${mnBlot('心',XC[XINFA[id].xing],40)}" alt=""><b>${XINFA[id].name}</b><small>${lab} · 第 ${x.lv[id]||1} 层</small></div>`
    :`<div class="xc${lock?' lk':''}"><span class="em">${lock?'锁':'空'}</span><small>${lock||lab}</small></div>`;
  const subs=[0,1,2].map(i=>i<subCap?circ(x.subs[i],'辅修'):circ(null,'辅修',['登堂入室','融会贯通','出神入化'][i]));
  const pctTxt=Object.entries(X.pct).filter(([,v])=>v).map(([a,v])=>`${MN_FXN[a]} +${Math.round(v*1000)/10}%`),addTxt=Object.entries(X.add).filter(([,v])=>v).map(([a,v])=>`${MN_FXN[a]} +${Math.round(v*10)/10}`);
  const ebTxt=Object.entries(X.eb).map(([e2,v])=>`同属（${e2}）武学威力 +${Math.round(v*100)}%`);
  const sum=[...pctTxt,...addTxt,...ebTxt,X.heal?`治疗 +${Math.round(X.heal*100)}%`:'',X.prof?`武学熟练 +${Math.round(X.prof*100)}%`:''].filter(Boolean);
  const trN={postMp:'战后调息回内力',postHp:'战后调息回气血',startDing:'开战定神',lowRegen:'危时回血',mpRegen:'每回合回内力',startBp:'开战蓄势',startReveal:'开战看破',stunImm:'免疫眩晕',allRegen:'全队回血'};
  const trs=Object.keys(X.tr).map(t=>trN[t]||t);
  return`<div class="jm-xf2"><div class="xl"><h4>运转<span class="jm-dim">${mnXfDebug()&&((S.chapter||1)<2)?'调试开关 · ':''}主修 1 · 辅修 ${subCap} / 3</span></h4>
      <div class="xm">${circ(x.main,'主修')}</div><div class="xs">${subs.join('')}</div></div>
    <div class="xr"><h4>已习心法<span class="jm-dim">${L.length} 门 · 悬停看加成，点击运转或停修</span></h4>${L.length?`<div class="jm-skillgrid jm-xfgrid">${L.map(id=>mnXinfaCard(id,w,x)).join('')}</div>`:'<div class="jm-empty sm">尚未习得心法</div>'}</div>
    <div class="jm-xfsummary"><h4>加成</h4><div class="jm-xsum">${sum.length?sum.map(t=>`<span>${t}</span>`).join(''):'<span class="jm-dim">尚无</span>'}${trs.length?`<div class="tr">特性：${trs.join('、')}</div>`:''}</div>
      ${x.unstable?`<div class="jm-red" style="font-size:.8em">气脉未稳 · 还有 ${x.unstable} 场战斗（主修效果减半、特性失效）</div>`:''}
      <details class="jm-rules"><summary>修炼与改修规则</summary><p>战斗胜利：主修得全部修为进度、辅修一半；n 层升 n+1 层需 ${'0.8n'} 级修为 · 阳与阴相冲 · 改修主修：内力清空 + ${MN_XF_SWAP} 场气脉未稳</p></details></div></div>`},
bag(){const cats=['全部','兵器','护具','佩饰','药食','杂物','要物'],own=Object.keys(S.bag).filter(k=>S.bag[k]>0&&ITEMS[k]);
  const cnt=c=>own.filter(k=>c==='全部'||mnCat(k)===c).length,L=own.filter(k=>mnBagCat==='全部'||mnCat(k)===mnBagCat);
  const order=['兵器','护具','佩饰','药食','杂物','要物'];L.sort((a,b)=>order.indexOf(mnCat(a))-order.indexOf(mnCat(b))||((ITEMS[b].q||0)-(ITEMS[a].q||0)));
  return`<div class="jm-cats">${cats.map(c=>`<button data-a="cat" data-k="${c}" class="${mnBagCat===c?'on':''}">${c}<small>${cnt(c)}</small></button>`).join('')}<span class="jm-dim cap">当前使用者：${esc(mnName(mnWho))} · 悬停查看详情</span></div>
   ${L.length?`<div class="jm-inventory-grid">${L.map(k=>mnBagTile(k,mnWho)).join('')}</div>`:'<div class="jm-empty">这一格里空空如也</div>'}`},
equip(){const w=mnWho,e=mnEq(w),D=mnDef(w),{hp,mp,d}=mnHP(w);
  const slots=MN_SLOTS.map(([s,n,g])=>{const k=e[s],can=D.slots.includes(s);return`<div class="jm-wornslot${can?'':' unavailable'}" ${k?`data-tip-kind="item" data-k="${k}" data-w="${w}"`:''}>
    <span class="jm-wornicon">${k?mnIco(k,48):`<img class="jm-blot" src="${mnBlot(g,'#8a7a62',48)}" alt="">`}</span><span class="jm-worntxt"><small>${n}</small><strong>${k?esc(ITEMS[k].name):can?'尚未装备':'不可使用'}</strong></span>
    ${k?`<button class="jm-b ghost sm" data-a="uneq" data-k="${s}">卸下</button>`:''}</div>`}).join('');
  const groups=MN_SLOTS.map(([s,n])=>{const items=Object.keys(S.bag).filter(k=>S.bag[k]>0&&mnSlot(k)===s);return`<section class="jm-gearGroup"><h4>${n}<span class="jm-dim">${items.length} 件 · 悬停比较，点击装备</span></h4><div class="jm-geargrid">${items.length?items.map(k=>mnBagTile(k,w)).join(''):'<span class="jm-empty sm">暂无可用物品</span>'}</div></section>`}).join('');
  return`<div class="jm-equipBoard"><div class="jm-equipHero"><div class="jm-equipIdentity"><span class="face" style="background-image:url(${mnFace(w)})"></span><div><strong>${esc(mnName(w))}</strong><small>${mnDef(w).role} · 境界 ${S.lv} 层</small></div></div>
    ${mnBar('气血',hp,d.mhp,'#b3261e','eqhp')}${mnBar('内力',mp,d.mmp,'#2d4f73','eqmp')}
    <h4>身上装备</h4>${slots}<div class="jm-sum">${['atk','def','crit','dodge'].map(k=>`<span>${MN_FXN[k]} <b>${d[k]}${MN_PCT[k]?'%':''}</b></span>`).join('')}</div></div>
    <div class="jm-equipStock">${groups}</div></div>`},
party(){const M=mnMembers();
  const card=(w,i)=>{const{hp,mp,d}=mnHP(w),a=w==='hero'||!mnDef(w).teachAff?null:((S.aff||{})[w]||0),pts=mnPts(w),r=mnRec(w);
    return`<div class="jm-pc"><div class="fc" style="background-image:url(${mnFace(w)})"></div><div class="rg" style="background-image:url(${mnMk('enso0',()=>mnB().url(mnB().enso(64,{col:'#2b1e12',seed:3})))})"></div>
      <div class="nm">${esc(mnName(w))}</div><div class="jm-dim ro">${mnDef(w).role} · ${w==='hero'?'领队':`第 ${i+1} 位`}</div>
      ${mnBar('气血',hp,d.mhp,'#b3261e','hp')}${mnBar('内力',mp,d.mmp,'#2d4f73','mp')}
      <div class="ln">${a!=null?`<span class="jm-red">♥</span> 好感 ${a}`:w==='hero'?'<span class="jm-dim">侠义 '+S.moral+'</span>':'<span class="jm-dim">忠心耿耿</span>'}${pts?`<span class="jm-red">　待分配 ${pts}</span>`:''}</div>
      <div class="ln jm-dim">武学 ${r.load.map(k=>SKILLS[k].name).join('、')||'—'}</div>
      <div class="acts">${w!=='hero'&&typeof window.onCompanionTalk==='function'?`<button class="jm-b" data-a="talk" data-w="${w}">交谈</button>`:''}
        <button class="jm-b ghost" data-a="cfg" data-w="${w}" data-k="attr">加点</button><button class="jm-b ghost" data-a="cfg" data-w="${w}" data-k="equip">换装</button><button class="jm-b ghost" data-a="cfg" data-w="${w}" data-k="skill">武学</button>
        ${w!=='hero'&&S.party.length>1?`<button class="jm-pm" data-a="mv" data-w="${w}" data-d="-1" ${i?'':'disabled'} aria-label="前移">◀</button><button class="jm-pm" data-a="mv" data-w="${w}" data-d="1" ${i<S.party.length-1?'':'disabled'} aria-label="后移">▶</button>`:''}</div></div>`};
  const comps=M.filter(w=>w!=='hero');
  const teach=comps.map(w=>{const D=mnDef(w),a=(S.aff||{})[w]||0,m=S.mates[w],L=[];
    const can=Object.keys(S.skills).filter(k=>k!=='fist'&&SKILLS[k]&&(D.learn||[]).includes(SKILLS[k].kind)&&!m.skills[k]);
    for(const k of can)L.push(a>=(D.teachAff||99)?`<button class="jm-b ghost sm" data-a="teach" data-w="${w}" data-k="${k}">传授「${SKILLS[k].name}」</button>`:`<span class="jm-lock">传授「${SKILLS[k].name}」· 好感 ${D.teachAff} 解锁</span>`);
    for(const g of D.gives||[])if(!S.skills[g.sk])L.push(a>=g.aff?`<button class="jm-b sm" data-a="ask" data-w="${w}" data-k="${g.sk}">请教「${SKILLS[g.sk].name}」</button>`:`<span class="jm-lock">请教「${SKILLS[g.sk].name}」· 好感 ${g.aff} 解锁</span>`);
    return L.length?`<div class="jm-tc"><b>${esc(mnName(w))}</b>${L.join('')}</div>`:''}).join('');
  const pet=S.pet&&S.pets[S.pet],ph=pet&&petHealth(),pd=pet&&PARTY_DEF[S.pet];
  const petCard=pet&&ph&&pd?`<div class="jm-pc"><div class="fc" style="background-image:url(${mnFace(S.pet)})"></div><div class="nm">${esc(pd.name)}</div><div class="jm-dim ro">宠物 · 自动参战 · 不可控制</div>
    ${mnBar('气血',ph.hp,ph.d.mhp,'#b3261e','hp')}${mnBar('内力',ph.mp,ph.d.mmp,'#2d4f73','mp')}
    <div class="ln jm-dim">主角气血高于 50%：攻击、嗅探；低于 50%：护主；低于 30%：受伤时舔舐</div>
    <div class="ln jm-dim">佩饰：${pet.equip.acc?ITEMS[pet.equip.acc].name:'无'}</div>
    <div class="acts"><button class="jm-b ghost" data-a="petfeed" ${S.bag.bun>0&&ph.hp<ph.d.mhp?'':'disabled'}>喂馒头${S.bag.bun?' ×'+S.bag.bun:''}</button>
    ${pet.equip.acc?'<button class="jm-b ghost" data-a="petuneq">卸下项圈</button>':S.bag.collar>0?'<button class="jm-b ghost" data-a="peteq">戴上项圈</button>':''}</div></div>`:'<div class="jm-pc empty"><div class="jm-empty">尚无同行宠物</div></div>';
  return`<h4>人物同伴</h4><div class="jm-pgrid">${M.map((w,i)=>card(w,i-1)).join('')}${comps.length?'':'<div class="jm-pc empty"><div class="jm-empty">江湖路远<br>尚无同行之人</div></div>'}</div><h4>宠物</h4><div class="jm-pgrid">${petCard}</div>
    ${comps.length?`<h4>传授与请教<span class="jm-dim">把自己会的武学教给同伴，或向同伴讨教；好感越深，肯教的越多</span></h4>${teach||'<div class="jm-empty sm">眼下没有可传授的武学</div>'}`:''}`},
quest(){const main=(window.questLog?questLog():[]),side=mnQuests();
  const it=q=>`<div class="jm-q${q.done?' done':''}"><img src="${mnSeal(q.done?'毕':'行',26)}" alt=""><div><div class="nm">${esc(q.t)}${q.giver?`<small>${esc(q.giver)}</small>`:''}</div><div class="ds">${q.d||''}</div></div></div>`;
  return`<h4>主线<span class="jm-dim">第一章 · 襄阳风云</span></h4>${main.length?main.map(it).join(''):'<div class="jm-empty sm">尚无要事</div>'}
    <h4>支线<span class="jm-dim">市井小事，牵出江湖大局</span></h4>${side.length?side.map(it).join(''):'<div class="jm-empty sm">暂无支线。多在城里走走，和人聊聊。</div>'}`},
sys(){let muted=false;try{muted=__audio.muted}catch(e){}const th=(window.BUI&&BUI.theme)||'ink';
  return`<div class="jm-sys"><div class="row"><span class="k">声音</span><button class="jm-b ghost" data-a="mute">${muted?'已静音 · 点击开启':'开启中 · 点击静音'}</button></div>
    <div class="row"><span class="k">战斗界面</span><button class="jm-b ghost" data-a="theme">${th==='ink'?'墨迹题签':'卷轴木牌'} · 点击切换</button></div>
    <div class="row"><span class="k">存档</span><button class="jm-b" data-a="save">立即存档</button><span class="jm-dim">进场、入队与每 5 秒自动存档</span></div>
    <h4>操作</h4><div class="jm-keyt"><span>WASD / 方向键</span>行走<span>E / 空格</span>互动<span>I</span>江湖菜单<span>Q / E · 1–7</span>翻页 / 直达<span>Z / C</span>切换人物<span>Esc</span>返回<span>鼠标</span>寻路、交谈、操作格子</div></div>`}};
// 支线：读取 W3 的 window.QUESTS（数组或 {id:定义}）与 S.quests（{id:状态}）；结构未定时尽量宽松地取字段
function mnQuests(){const Q=window.QUESTS,st=(S&&S.quests)||{};try{if(Q&&typeof Q.log==='function')return Q.log().map(q=>({t:q.t||q.name||q.title,d:q.d||q.desc||'',done:!!q.done,giver:q.giver}))}catch(e){}
  let L=Array.isArray(Q)?Q:Q&&typeof Q==='object'?Object.entries(Q).filter(([,q])=>q&&typeof q==='object').map(([id,q])=>({id,...q})):[];
  return L.filter(q=>q.id&&st[q.id]).map(q=>{const s=st[q.id],state=typeof s==='object'?(s.state||s.status||(s.done?'done':'active')):s;
    const done=state==='done'||state==='finished'||state===2&&!q.steps||(typeof s==='object'&&s.done===true);const step=typeof s==='object'?(s.step??s.stage):typeof s==='number'?s:null;
    let d=q.desc||q.d||'';if(Array.isArray(q.steps)&&step!=null&&q.steps[step]){const x=q.steps[step];d=typeof x==='string'?x:(x.d||x.desc||x.t||d)}
    if(done&&q.doneText)d=q.doneText;return{t:q.name||q.title||q.t||q.id,d:typeof d==='function'?d():d,done:!!done,giver:q.giver||q.from}}).sort((a,b)=>a.done-b.done)}
// 桌面格子悬停详情：完整说明和数值对比在浮签中呈现，页面本身只保留图标与必要状态。
function mnTipItem(k,w){const it=ITEMS[k],sl=mnSlot(k),q=mnQ(k),fx=Object.entries(mnFx(k)),wear=sl&&mnEq(w)[sl],why=sl?mnCan(w,k):'';
  const diff=sl&&!why?mnCmp(w,{eq:{[sl]:k}}).filter(r=>r[3]):[];
  return`<div class="jm-tipkind">${mnCat(k)}${sl&&q[0]?' · '+q[0]:''}</div><div class="jm-tiphead">${mnIco(k,44)}<div><strong>${esc(it.name)}</strong><small>${sl?`给 ${esc(mnName(w))} 装备 · ${wear?`替换 ${esc(ITEMS[wear].name)}`:'当前空位'}`:`持有 ×${S.bag[k]||0}`}</small></div></div>
   <p>${esc(it.desc||'')}</p>${fx.length?`<div class="jm-tipfx">${fx.map(([a,v])=>`<span>${mnFxTxt(a,v)}</span>`).join('')}</div>`:''}
   ${it.heal||it.mp?`<div class="jm-tipfx">${it.heal?`<span>气血 +${it.heal}</span>`:''}${it.mp?`<span>内力 +${it.mp}</span>`:''}</div>`:''}
   ${diff.length?`<div class="jm-tipcompare"><b>装备后变化</b>${diff.map(([a,o,n,d])=>`<div><span>${MN_FXN[a]}</span><span>${o}${MN_PCT[a]?'%':''} → ${n}${MN_PCT[a]?'%':''}</span>${mnArrow(d)}</div>`).join('')}</div>`:''}
   ${it.req?`<div class="jm-tipnote">需求 ${Object.entries(it.req).map(([a,v])=>`${STATN[a]} ${v}`).join(' · ')}</div>`:''}${why?`<div class="jm-tipwarn">${esc(why)}</div>`:''}
   <div class="jm-tipfoot">${sl?'点击装备':it.heal||it.mp?'点击使用':it.book||it.xfbook?'点击参悟':it.gall?'点击服用':'随身携带'}${it.price&&!it.key?` · 市价 ${it.price} 两`:''}</div>`}
function mnTipSkill(k,w){const s=SKILLS[k],n=mnSk(w)[k]||1,r=mnRec(w),on=r.load.includes(k),mp=mnSkMp(w,k),need=mnProfNeed(n),prof=Math.floor((r.prof||{})[k]||0),why=on?'':mnLoadWhy(w,k,r.load),up=mnUpWhy(w,k),[ua,uv]=mnUpReq(k,n+1),zt=mnBsk(k).t,zv=MN_ZY.includes(zt)?Math.floor((r.zy||{})[zt]||0):null;
  return`<div class="jm-tipkind">${s.kind} · ${on?'已装配':'已习得'}</div><div class="jm-tiphead">${mnSkIco(k,44)}<div><strong>${esc(s.name)}</strong><small>第 ${n} 重${mnIsAoe(k)?' · 群攻':''} · 内力 ${mp||0}</small></div></div>
   <p>${esc(s.desc||'')}</p><div class="jm-tipfx"><span>熟练 ${Math.min(prof,need)} / ${need}</span><span>本章上限 ${MN_SKCAP()} 重</span></div>
   ${Object.keys(s.req||{}).length?`<div class="jm-tipnote">装配门槛 ${Object.entries(s.req).map(([a,v])=>`${STATN[a]} ${v}`).join(' · ')}</div>`:''}
   ${s.needWeapon?`<div class="jm-tipnote">施展兵刃：${s.needWeapon}</div>`:''}<div class="jm-tipnote">${n>=MN_SKCAP()?'已达本章重数上限':`升第 ${n+1} 重：${STATN[ua]} ${uv}${zv!=null?` · ${zt}造诣 ${zv}/${mnZyUp(n+1)}`:''}`}</div>
   <div class="jm-tipnote">五重：${esc(mnHuoTxt(s.at5))}<br>十重：${esc(mnHuoTxt(s.at10))}</div>
   ${why?`<div class="jm-tipwarn">${esc(why)}</div>`:prof>=need&&up?`<div class="jm-tipwarn">熟练已满 · ${esc(up)}</div>`:''}<div class="jm-tipfoot">点击${on?'卸下':'装配'}武学</div>`}
function mnSkillCard(k,w,r,sk){const s=SKILLS[k],n=sk[k],on=r.load.includes(k),why=on?'':mnLoadWhy(w,k,r.load),need=mnProfNeed(n),prof=Math.floor((r.prof||{})[k]||0),pct=Math.min(100,Math.round(prof/Math.max(1,need)*100));
  return`<button class="jm-skillcard${on?' on':''}${why?' locked':''}" data-a="ld" data-k="${k}" data-tip-kind="skill" data-w="${w}" style="--kind:${MN_KCOL[s.kind]||'#3b2c1b'}" aria-label="${esc(s.name)}，${on?'点击卸下':'点击装配'}">
    <span class="jm-skillart">${mnSkIco(k,54)}</span><span class="jm-skillname">${esc(s.name)}</span><span class="jm-skillmeta">${s.kind} · ${n} 重${mnIsAoe(k)?' · 群攻':''}</span>
    <span class="jm-skillprog"><i style="width:${pct}%"></i></span><span class="jm-skillstate">${on?'已装配':why?'暂不可装':'点击装配'}</span></button>`}
function mnBagTile(k,w){const it=ITEMS[k],sl=mnSlot(k),active=sl||it.heal||it.mp||it.book||it.xfbook||it.gall,wear=mnWearer(k).length,q=mnQ(k);
  return`<button class="jm-invcell${active?' action':''}" ${active?'data-a="bagact"':''} data-k="${k}" data-tip-kind="item" data-w="${w}" style="--kind:${q[1]}" aria-label="${esc(it.name)}${active?'，点击使用或装备':''}">
    <span class="jm-invicon">${mnIco(k,56)}</span><span class="jm-invcount">${S.bag[k]}</span>${wear?'<span class="jm-invwear">装</span>':''}
    <span class="jm-invname">${esc(it.name)}</span><span class="jm-invtype">${mnCat(k)}</span></button>`}
function mnXinfaCard(id,w,x){const f=XINFA[id],n=x.lv[id]||1,run=x.main===id||x.subs.includes(id),why=run?'':mnXfWhy(w,id,f.slot),step=mnXfStep(n),pct=n>=5?100:Math.min(100,Math.round((x.prog[id]||0)/step*100)),col={阳:'#b8612c',阴:'#3a4f8a',中:'#2f6b45'}[f.xing];
  return`<button class="jm-skillcard jm-xfcard${run?' on':''}${why?' locked':''}" data-a="${f.slot==='main'?'xfm':'xfs'}" data-k="${id}" data-w="${w}" data-tip-kind="xinfa" style="--kind:${col}" aria-label="${esc(f.name)}，${run?'运转中':'点击运转'}">
    <span class="jm-skillart"><img class="jm-blot" src="${mnBlot('心',col,54)}" alt=""></span><span class="jm-skillname">${esc(f.name)}</span><span class="jm-skillmeta">${f.slot==='main'?'主修':'辅修'} · 性${f.xing} · ${n} 层</span>
    <span class="jm-skillprog"><i style="width:${pct}%"></i></span><span class="jm-skillstate">${run?'运转中':why?'暂不可修':'点击运转'}</span></button>`}
function mnTipXinfa(id,w){const f=XINFA[id],x=mnXf(w),n=x.lv[id]||1,run=x.main===id||x.subs.includes(id),why=run?'':mnXfWhy(w,id,f.slot),per=f.per||{},effects=[...Object.entries(per.add||{}).map(([a,v])=>`${MN_FXN[a]||a} +${v}`),...Object.entries(per.pct||{}).map(([a,v])=>`${MN_FXN[a]||a} +${Math.round(v*100)}%`)];
  return`<div class="jm-tipkind">${f.slot==='main'?'主修':'辅修'} · 性${f.xing}${f.sect?' · '+MN_SECT[f.sect]:''}</div><div class="jm-tiphead"><img class="jm-blot" src="${mnBlot('心',{阳:'#b8612c',阴:'#3a4f8a',中:'#2f6b45'}[f.xing],44)}" alt=""><div><strong>${esc(f.name)}</strong><small>第 ${n} 层 · ${run?'运转中':'已习得'}</small></div></div>
    <p>${esc(f.desc)}</p><div class="jm-tipfx"><span>进度 ${x.prog[id]||0} / ${mnXfStep(n)}</span>${effects.map(t=>`<span>每层 ${t}</span>`).join('')}</div>
    <div class="jm-tipnote">门槛 ${f.req?mnReqTxt(f.req):'无'}<br>三层：${esc(f.d3)}<br>五层：${esc(f.d5)}</div>${why?`<div class="jm-tipwarn">${esc(why)}</div>`:''}<div class="jm-tipfoot">${run&&f.slot==='main'?'主修中':`点击${run?'停修':f.slot==='main'?'主修或改修':'辅修'}`}</div>`}
function mnHideHover(){const f=$('panel')?.querySelector('.jm-float');if(f)f.hidden=true}
function mnHover(e){const p=$('panel'),f=p?.querySelector('.jm-float'),t=e.target?.closest?.('[data-tip-kind]');if(!f||!t||!p.contains(t)){mnHideHover();return}
  const kind=t.dataset.tipKind,k=t.dataset.k,w=t.dataset.w||mnWho,id=kind+':'+k+':'+w;
  if(f.dataset.id!==id){f.innerHTML=kind==='skill'?mnTipSkill(k,w):kind==='xinfa'?mnTipXinfa(k,w):mnTipItem(k,w);f.dataset.id=id}f.hidden=false;
  const pr=p.getBoundingClientRect(),tr=t.getBoundingClientRect(),x=(e.clientX||tr.right)-pr.left,y=(e.clientY||tr.top)-pr.top;
  f.style.left=Math.max(8,Math.min(x+18,p.clientWidth-f.offsetWidth-10))+'px';f.style.top=Math.max(8,Math.min(y+16,p.clientHeight-f.offsetHeight-10))+'px'}
// 属性页下半：兵刃造诣 · 技艺 · 品德（主角）/ 师门（同伴）
function mnDimsHTML(w,part){const r=mnRec(w);mnDimEnsure(r,w);const ji=mnJi(w),bar=(v,max=MN_ZY_MAX)=>`<i class="bb"><b style="width:${clamp(v/max,0,1)*100}%"></b></i>`;
  const zy=MN_ZY.map(t=>{const v=Math.floor(r.zy[t]||0),b=mnZyBonus(v);return`<div class="r"><span class="k" style="color:${MN_KCOL[t==='暗器'?'暗器':t]||'inherit'}">${t}</span>${bar(v)}<b>${v}</b><small>${b?`伤 +${Math.round(b*100)}%`:''}</small></div>`}).join('');
  const jiE={yi:v=>`药效 +${Math.floor(Math.min(v,MN_ZY_MAX)/2)}%`,du:()=>'【后续】',shi:()=>''};
  const jj=Object.keys(MN_JI).map(j=>{const v=Math.floor(ji[j]||0);return`<div class="r"><span class="k">${MN_JI[j]}</span>${bar(v)}<b>${v}</b><small>${v||j==='du'?jiE[j](v):''}</small></div>`}).join('');
  let third;
  if(w==='hero'){const v=mnVirt();third=`<h5>品德<span>侠义 <b>${S.moral}</b></span></h5>`+Object.keys(MN_VIRT).map(k=>{const n=v[k]||0;return`<div class="r v"><span class="k">${MN_VIRT[k]}</span><b class="${n<0?'neg':''}">${n}</b><small>${{ren:'行善助人',yi:'同伴与好感',xin:'支线守诺',yong:'临阵不退'}[k]}</small></div>`}).join('')}
  else{const sc=mnSect(w);third=`<h5>师门<span>${sc?MN_SECT[sc]+'正式弟子':w==='dog'?'兽类，不入门派':'无门无派'}</span></h5>`}
  return part?`<div>${third}</div>`:`<div><h5>兵刃造诣<span>用则长 · 每 20 点该兵刃伤害 +1%</span></h5>${zy}</div><div><h5>技艺</h5>${jj}</div>`}
// 额外按键：6–7 直达、Z/C 切换人物（Q/E、←→、1–5、Esc 由 ui.js 处理）
addEventListener('keydown',e=>{if(panelKind!=='menu'||$('panel').hidden||dlgBusy||!$('panel').classList.contains('jm'))return;if(e.target&&e.target.matches&&e.target.matches('input'))return;const k=e.key.toLowerCase();
  if(k>='6'&&k<='7'&&TABS[+k-1]){menuTab=TABS[+k-1][0];e.preventDefault();mnDraw()}
  else if(k==='z'||k==='c'||k==='['||k===']'){const L=mnMembers(),i=L.indexOf(mnWho);mnWho=L[(i+(k==='z'||k==='['?-1:1)+L.length)%L.length];mnPend=null;e.preventDefault();mnDraw()}});

// ───────── 样式（水墨：宣纸卷面 + 墨迹签条 + 圆相 + 朱印；不用方框） ─────────
function mnCSS(){if($('jm-css'))return;const st=document.createElement('style');st.id='jm-css';const inkBtn=mnSw(160,40,{col:'#20150c',a:.95,dry:.35,seed:5,tail:.3},'btn'),redBtn=mnSw(160,40,{col:'#a8261c',a:.95,dry:.35,seed:5,tail:.3},'btnr'),
  line=mnSw(600,6,{col:'#3b2c1b',a:.55,dry:.6,seed:31,tail:.5,thick:.6},'line'),hl=mnSw(400,40,{col:'#b08a3a',a:.28,dry:.5,seed:14,tail:.35},'hl');
  st.textContent=`
#panel.jm{padding:0;display:block;text-align:left;line-height:1.5;background:radial-gradient(ellipse at 42% 40%,rgba(38,28,18,.8),rgba(6,4,3,.95) 78%);backdrop-filter:blur(3px);--ink:#2b1e12;--dimk:#7a6548;--cin:#a8261c;--jadek:#2f6b45}
#panel.jm button{background:none;border:none;box-shadow:none;color:inherit;padding:0;letter-spacing:inherit;font:inherit;cursor:pointer}
#panel.jm button:disabled{cursor:default}
.jm-top{position:absolute;left:2.2%;right:16%;top:1.2%;height:10%;display:flex;align-items:baseline;gap:.7em;color:var(--paper);padding-top:.4em}
.jm-ttl{font-family:"Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);font-size:2.2em;letter-spacing:.2em;color:#f1e4c6;text-shadow:0 2px 8px #000;line-height:1}
.jm-sub{font-family:"Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);font-size:1.35em;color:var(--gold);letter-spacing:.25em}
.jm-stat{margin-left:auto;font-family:var(--serif);font-size:.88em;color:#b3a283;display:flex;align-items:center;gap:.35em;white-space:nowrap}.jm-stat img{width:1.1em;height:1.1em}.jm-stat b{color:var(--hi);font-weight:500}.jm-stat .sep{opacity:.4;margin:0 .3em}
.jm-tabs{position:absolute;right:1%;top:2.5%;bottom:5%;width:13.5%;display:flex;flex-direction:column;gap:.1em}
#panel.jm .jm-tabs button{position:relative;display:flex;align-items:center;gap:.45em;padding:.32em .3em .32em 1em;font-family:"Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);font-size:1.22em;letter-spacing:.3em;color:#b9a888;text-shadow:0 1px 3px #000;transition:color .15s,transform .15s}
#panel.jm .jm-tabs button .n{font:500 .55em var(--sans);letter-spacing:0;color:#7d6c52;width:1em}
#panel.jm .jm-tabs button:hover,#panel.jm .jm-tabs button:focus-visible{color:#f3e6c8;transform:translateX(-3px);outline:none}
#panel.jm .jm-tabs button.on{color:#f7ecd6;background:var(--sw) center/100% 100% no-repeat}
#panel.jm .jm-tabs button.on::after{content:"";position:absolute;right:.35em;top:50%;width:.55em;height:.55em;margin-top:-.28em;background:var(--cin);transform:rotate(45deg);box-shadow:0 0 6px rgba(168,38,28,.8)}
#panel.jm .jm-tabs .jm-close{margin-top:auto;font-size:1.05em;color:#a3927a}#panel.jm .jm-tabs .jm-close small{font:.55em var(--sans);letter-spacing:0;opacity:.6;margin-left:.3em}
.jm-dot{display:inline-block;width:.45em;height:.45em;border-radius:50%;background:#d9553a;box-shadow:0 0 5px #d9553a;vertical-align:.3em;margin-left:.2em}
.jm-sheet{position:absolute;left:1.4%;top:12%;right:15.6%;bottom:2.4%;background:center/100% 100% no-repeat;filter:drop-shadow(0 8px 16px rgba(0,0,0,.65));color:var(--ink);padding:1em 2.2em 1em 2.3em;display:flex;flex-direction:column;font-family:var(--serif)}
.jm-body{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#9c8662 transparent;padding-right:.4em}
.jm-keys{position:absolute;left:2.2%;bottom:.1%;font-size:.68em;color:rgba(233,220,192,.45);letter-spacing:.08em}
.jm-sheet h4{margin:.5em 0 .45em;padding-bottom:.35em;font:400 1.15em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.2em;color:var(--ink);display:flex;align-items:center;gap:.6em;background:url(${line}) left bottom/100% 5px no-repeat}
.jm-sheet h4 .jm-dim,.jm-sheet h4 .jm-red{font:.62em var(--serif);letter-spacing:.05em}
.jm-sheet h5{margin:.9em 0 .35em;font:500 .85em var(--serif);color:var(--dimk);letter-spacing:.2em}
.jm-dim{color:var(--dimk)}.jm-red{color:var(--cin)}.jm-green{color:var(--jadek)}
.jm-empty{padding:1.6em;text-align:center;color:var(--dimk);letter-spacing:.15em;line-height:1.9}.jm-empty.sm{padding:.6em;text-align:left}
.jm-blot{width:1.9em;height:1.9em;flex:none;display:block}
.jm-sheet .ico{flex:none}.jm-sheet .ico.jm-ai{display:block;border-radius:50%;padding:.28em;background:radial-gradient(circle,#3a2a1a 55%,#1a120a);box-shadow:0 0 0 1.5px rgba(43,30,18,.55)}.jm-sheet .ico.jm-ai i{display:block;width:100%;height:100%;background-repeat:no-repeat;image-rendering:pixelated}
.jm-b{display:inline-flex;align-items:center;justify-content:center;min-width:4.6em;padding:.28em 1.2em!important;background:url(${inkBtn}) center/100% 100% no-repeat!important;color:#f3e6c8!important;font-family:var(--serif)!important;letter-spacing:.2em!important;font-size:.92em!important;transition:transform .12s,filter .12s}
.jm-b:hover:not(:disabled),.jm-b:focus-visible{background-image:url(${redBtn})!important;outline:none;transform:translateY(-1px)}
.jm-b.ghost{background:url(${hl}) center/100% 100% no-repeat!important;color:var(--ink)!important}
.jm-b.ghost:hover:not(:disabled),.jm-b.ghost:focus-visible{background-image:url(${redBtn})!important;color:#f3e6c8!important}
.jm-b.sm{font-size:.8em!important;padding:.2em .9em!important}
.jm-b:disabled{opacity:.35}
.jm-pm{width:1.7em;height:1.7em;display:inline-flex!important;align-items:center;justify-content:center;border-radius:47% 53% 44% 56%/55% 45% 55% 45%!important;background:#2b1e12!important;color:#f3e6c8!important;font-size:.85em!important;line-height:1}
.jm-pm:hover:not(:disabled),.jm-pm:focus-visible{background:var(--cin)!important;outline:none}.jm-pm:disabled{opacity:.25}
.jm-mem{display:flex;align-items:flex-end;gap:1.1em;padding:.1em 0 .45em;margin-bottom:.2em;background:url(${line}) left bottom/100% 4px no-repeat}
.jm-mc{position:relative;display:flex;flex-direction:column;align-items:center;gap:.1em;width:3.8em}
.jm-mc .f{width:2.7em;height:2.7em;border-radius:50%;background:#d8c9a6 center/cover;filter:grayscale(.55) sepia(.3);opacity:.75;transition:all .15s}
.jm-mc .r{position:absolute;top:-.25em;left:50%;width:3.2em;height:3.2em;margin-left:-1.6em;background:center/100% no-repeat;pointer-events:none}
.jm-mc .nm{font-size:.78em;letter-spacing:.1em;color:var(--dimk)}
.jm-mc.on .f,.jm-mc:hover .f{filter:none;opacity:1}.jm-mc.on .nm{color:var(--cin);font-weight:600}
.jm-mc .jm-dot{position:absolute;right:.2em;top:0}
.jm-memk{margin-left:auto;font-size:.7em;color:var(--dimk);letter-spacing:.1em}
/* 属性 */
.jm-attr{display:grid;grid-template-columns:36% 1fr;gap:1.4em}
.jm-card{position:relative;display:flex;flex-direction:column;min-height:0}
.jm-card .por{height:12.5em;background:center top/contain no-repeat;-webkit-mask:linear-gradient(#000 72%,transparent);mask:linear-gradient(#000 72%,transparent)}
.jm-card .por.spr{background-size:auto 80%;background-position:center 60%;image-rendering:pixelated}
.jm-card .nmw{margin-top:-1.6em;text-align:center;position:relative}
.jm-card .nm{font:400 1.7em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.25em;line-height:1.1}
.jm-card .or{font-size:.78em;color:var(--dimk);letter-spacing:.15em}
.jm-card .jm-bars{margin-top:.5em}
.jm-bar{display:grid;grid-template-columns:2.6em 1fr auto;gap:.5em;align-items:center;font-size:.85em;margin:.15em 0}
.jm-bar .l{color:var(--dimk);letter-spacing:.1em}.jm-bar .tr{height:.62em;background:center/100% 100% no-repeat;position:relative}
.jm-bar .tr i{position:absolute;left:0;top:0;bottom:0;background:left center no-repeat}.jm-bar b{font-weight:500;font-variant-numeric:tabular-nums;min-width:4.4em;text-align:right}.jm-bar b small{color:var(--dimk);font-weight:400}
.jm-aff{display:flex;gap:.6em;align-items:center;font-size:.85em;margin-top:.3em}.jm-aff .l{color:var(--dimk)}.jm-aff .h{color:var(--cin);letter-spacing:.05em}.jm-aff .h i{color:#b8a888;font-style:normal}.jm-aff .v{color:var(--dimk)}
.jm-seal{width:1.35em;height:1.35em}
.jm-stats .row{display:grid;grid-template-columns:3em 2em 4.2em 1fr auto auto;gap:.5em;align-items:center;padding:.28em .2em;background:url(${line}) left bottom/100% 3px no-repeat}
.jm-stats .k{letter-spacing:.2em;color:var(--dimk)}.jm-stats b{font-size:1.2em;font-weight:600;text-align:right;font-variant-numeric:tabular-nums}
.jm-stats .eqb{font-size:.75em;color:var(--jadek)}.jm-stats .ds{font-size:.74em;color:var(--dimk);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
em.up{font-style:normal;color:var(--jadek);font-size:.8em;font-weight:600}em.dn{font-style:normal;color:var(--cin);font-size:.8em;font-weight:600}
.jm-acts{display:flex;gap:.8em;justify-content:flex-end;align-items:center;margin:.6em 0 .1em}.jm-acts .cap{margin-right:auto;font-size:.75em}
.jm-der{display:grid;grid-template-columns:repeat(4,1fr);gap:.3em 1em}.jm-der>div{display:flex;align-items:baseline;gap:.35em;padding:.2em 0}.jm-der .k{color:var(--dimk);font-size:.85em;letter-spacing:.15em}.jm-der b{font-weight:600;font-variant-numeric:tabular-nums}
/* 武学 */
.jm-load{display:grid;grid-template-columns:repeat(6,1fr);gap:.5em;margin-bottom:.4em}
.jm-ls{position:relative;display:flex!important;flex-direction:column;align-items:center;gap:.1em;padding:.5em .2em .4em!important;min-height:5em;background:radial-gradient(ellipse at 50% 45%,rgba(43,30,18,.10),transparent 70%)!important}
.jm-ls::before{content:"";position:absolute;inset:.1em .4em;border:1.5px dashed rgba(43,30,18,.28);border-radius:46% 54% 50% 50%/40% 45% 55% 60%;pointer-events:none}
.jm-ls.on::before{border:2px solid rgba(43,30,18,.55)}.jm-ls.on:hover::before{border-color:var(--cin)}
.jm-ls .jm-blot{width:2.1em;height:2.1em}.jm-ls .nm{font-size:.82em;letter-spacing:.04em;white-space:nowrap}.jm-ls small{font-size:.68em;color:var(--dimk)}.jm-ls .em{font:1.4em "Ma Shan Zheng",var(--brush);color:rgba(43,30,18,.3)}
.jm-sr{display:grid;grid-template-columns:auto 1fr auto auto;gap:.8em;align-items:center;padding:.4em .2em;background:url(${line}) left bottom/100% 3px no-repeat}
.jm-sr .nm{font-weight:600;letter-spacing:.1em}.jm-sr .nm small{font-weight:400;color:var(--dimk);margin:0 .6em;font-size:.8em}.jm-sr .ds{font-size:.8em;color:var(--dimk)}.jm-sr .mp{font-size:.78em;color:#2d4f73;white-space:nowrap}
.jm-sr.on .nm{color:var(--cin)}
/* 心法占位 */
.jm-xf{display:flex;gap:2em;align-items:center;justify-content:center;height:100%;opacity:.9}
.jm-xf .slots{display:flex;flex-direction:column;gap:.8em}.jm-xf .c{width:5em;height:5em;border-radius:50%;border:2px dashed rgba(43,30,18,.3);display:flex;align-items:center;justify-content:center;color:rgba(43,30,18,.35);font:1.1em "Ma Shan Zheng",var(--brush)}
.jm-xf .tx{max-width:22em}.jm-xf .tx img{width:2em;float:right}.jm-xf h3{font:1.5em "Ma Shan Zheng",var(--brush);margin:.2em 0 .5em;letter-spacing:.2em;color:var(--ink)}.jm-xf h3::after{display:none}.jm-xf p{margin:.3em 0;line-height:1.8}
/* 武学养成 / 心法（工作流 X） */
.jm-ls.lk{opacity:.5}.jm-ls.lk::before{border-style:dotted}
.jm-rules{font-size:.72em;color:var(--dimk);letter-spacing:.04em;margin:.1em 0 .2em}
.jm-sr2{align-items:start}.jm-sr2>.jm-blot{margin-top:.2em}.jm-sr2>.mp,.jm-sr2>.jm-b{margin-top:.35em}
.jm-sr2.lock{opacity:.78}.jm-sr2.lock .nm{color:var(--dimk)}
.jm-pf{max-width:24em;margin:.1em 0}.jm-pf .jm-bar{font-size:.78em;margin:0}.jm-pf.top,.jm-pf .top{font-size:.75em;color:var(--jadek);letter-spacing:.08em}
.jm-gt{display:flex;flex-wrap:wrap;gap:.1em 1.1em;font-size:.72em;color:var(--dimk)}.jm-gt .ok{color:var(--jadek);font-weight:600}.jm-gt .no{color:var(--cin);font-weight:600}
.jm-gt i{font-style:normal;opacity:.7}.jm-gt i.ok{opacity:1}.jm-gt sup{font-size:.75em;color:var(--dimk);margin-left:.2em}
.jm-sr .why{font-size:.74em;margin-top:.1em}
.jm-sr2 .nm .jm-red{font-size:.72em;font-weight:400;letter-spacing:.05em}
.jm-xf2{display:grid;grid-template-columns:15em 1fr;gap:1.4em;min-height:0}
.jm-xf2 .xl{display:flex;flex-direction:column;gap:.3em}
.jm-xf2 .xm{display:flex;justify-content:center}.jm-xf2 .xs{display:flex;justify-content:space-between;gap:.3em}
.jm-xf2 .xc{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.05em;width:4.4em;height:4.4em;text-align:center}
.jm-xf2 .xm .xc{width:6.2em;height:6.2em}
.jm-xf2 .xc::before{content:"";position:absolute;inset:0;border:1.5px dashed rgba(43,30,18,.3);border-radius:47% 53% 50% 50%/45% 48% 52% 55%}
.jm-xf2 .xc.on::before{border:2px solid rgba(168,38,28,.6)}.jm-xf2 .xc.lk{opacity:.45}
.jm-xf2 .xc .jm-blot{width:1.8em;height:1.8em}.jm-xf2 .xm .xc .jm-blot{width:2.4em;height:2.4em}
.jm-xf2 .xc b{font-size:.74em;letter-spacing:.05em;line-height:1.1}.jm-xf2 .xc small{font-size:.6em;color:var(--dimk)}.jm-xf2 .xc .em{font:1.3em "Ma Shan Zheng",var(--brush);color:rgba(43,30,18,.3)}
.jm-xsum{display:flex;flex-wrap:wrap;gap:.15em .8em;font-size:.8em;color:var(--jadek);font-weight:600}.jm-xsum .tr{width:100%;color:var(--ink);font-weight:400}
.jm-xf2 .xr{min-height:0;overflow:auto}
#bt-win.jm-grow .lv{font-size:14px}
@media (max-width:760px){.jm-xf2{grid-template-columns:1fr}.jm-gt{font-size:.66em}}
/* 属性页：造诣 / 技艺 / 品德（工作流 X） */
.jm-nx{color:var(--cin);font-weight:600}
.jm-dims{display:grid;grid-template-columns:1.1fr 1fr;gap:1.2em;margin-top:.3em}.jm-dims.one{grid-template-columns:1fr;margin-top:.4em}
.jm-attr .jm-stats .row{padding:.12em .2em}.jm-attr .jm-stats b{font-size:1.1em}.jm-attr .jm-der>div{padding:.05em 0}.jm-attr h4{margin:.3em 0 .3em}
.jm-dims h5{margin:.2em 0 .25em;font:400 1em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.2em;color:var(--ink);display:flex;align-items:baseline;gap:.5em}
.jm-dims h5 span{font:.66em var(--serif);letter-spacing:.05em;color:var(--dimk)}.jm-dims h5 span b{color:var(--ink);font-size:1.3em}
.jm-dims .r{display:grid;grid-template-columns:minmax(2.6em,auto) 1fr 2em 3.8em;gap:.35em;align-items:center;font-size:.8em;line-height:1.4}
.jm-dims .r.v{grid-template-columns:2.8em 2.4em 1fr}.jm-dims.one .r.v{grid-template-columns:2.8em 2em 1fr}.jm-dims.one>div{display:grid;grid-template-columns:1fr 1fr;column-gap:1em}.jm-dims.one h5{grid-column:1/-1}
.jm-dims .k{color:var(--dimk);letter-spacing:.05em;white-space:nowrap}.jm-dims b{font-weight:600;text-align:right;font-variant-numeric:tabular-nums}.jm-dims b.neg{color:var(--cin)}
.jm-dims small{font-size:.82em;color:var(--jadek);white-space:nowrap}.jm-dims .r.v small{color:var(--dimk)}
.jm-dims .bb{display:block;height:.34em;background:rgba(43,30,18,.12);border-radius:2px;position:relative;overflow:hidden}.jm-dims .bb b{position:absolute;left:0;top:0;bottom:0;background:#6b4a2a;border-radius:2px}
/* 行囊 */
.jm-cats{display:flex;align-items:center;gap:.25em;flex-wrap:wrap;margin-bottom:.4em}
.jm-cats button{padding:.15em .75em!important;letter-spacing:.15em!important;color:var(--dimk)!important;border-radius:1em .3em 1em .4em!important}
.jm-cats button small{font-size:.7em;margin-left:.25em;opacity:.7}.jm-cats button.on{background:#2b1e12!important;color:#f3e6c8!important}.jm-cats button:hover:not(.on){color:var(--cin)!important}
.jm-cats .cap{margin-left:auto;font-size:.72em}
.jm-bagw{display:grid;grid-template-columns:1fr 17em;gap:1.2em;min-height:0}
.jm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(5.4em,1fr));gap:.5em;align-content:start}
.jm-tile{position:relative;display:flex!important;flex-direction:column;align-items:center;gap:.1em;padding:.45em .2em .35em!important;border-radius:40% 45% 38% 50%/30% 35% 30% 40%!important;background:radial-gradient(ellipse at 50% 40%,rgba(43,30,18,.08),transparent 72%)!important}
.jm-tile[style*="--q:#3b"]::after{display:none}.jm-tile::after{content:"";position:absolute;left:18%;right:18%;bottom:.15em;height:2px;background:var(--q);opacity:.7;border-radius:2px}
.jm-tile .jm-blot{width:2.2em;height:2.2em}.jm-tile .nm{font-size:.76em;letter-spacing:.04em;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}.jm-tile .n{position:absolute;right:.6em;top:.2em;font-size:.68em;color:var(--dimk)}
.jm-tile .eq{position:absolute;left:.5em;top:.25em;font-style:normal;font-size:.62em;background:var(--cin);color:#f7ecd6;padding:0 .2em;line-height:1.3}
.jm-tile:hover,.jm-tile.on{background:radial-gradient(ellipse at 50% 45%,rgba(168,38,28,.14),transparent 72%)!important}.jm-tile.on .nm{color:var(--cin);font-weight:600}
.jm-det{padding-left:1em;background:linear-gradient(rgba(43,30,18,.25),rgba(43,30,18,.25)) left/1.5px 100% no-repeat;font-size:.92em}
.jm-det .hd,.jm-cmp .hd{display:flex;gap:.6em;align-items:center}.jm-det .hd .jm-blot{width:2.6em;height:2.6em}.jm-det .nm,.jm-cmp .hd .nm{font:1.25em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.15em}
.jm-det .hd .jm-dim,.jm-cmp .hd .jm-dim{font-size:.78em}.jm-det .ds{margin:.6em 0;line-height:1.75}
.jm-det .fxl{display:flex;flex-wrap:wrap;gap:.3em .8em;color:var(--jadek);font-weight:600;font-size:.9em}.jm-det .req{margin-top:.3em;font-size:.85em;color:var(--dimk)}.jm-det .pr{font-size:.8em;margin-top:.3em}
.jm-to{display:flex;flex-direction:column;gap:.2em}
.jm-tw{display:grid!important;grid-template-columns:1.9em 3.6em 1fr;gap:.5em;align-items:center;padding:.2em .3em!important;text-align:left;border-radius:1em .3em 1em .3em!important}
.jm-tw .f{width:1.9em;height:1.9em;border-radius:50%;background:#d8c9a6 center/cover}.jm-tw .nm{letter-spacing:.1em;font-size:.9em}.jm-tw .fx{font-size:.78em}
.jm-tw:hover:not(:disabled),.jm-tw:focus-visible{background:rgba(168,38,28,.12)!important;outline:none}.jm-tw:disabled{opacity:.6}
/* 装备 */
.jm-eqw{display:grid;grid-template-columns:1.05fr 1fr 1fr;gap:1.2em;height:100%;min-height:0}
.jm-slots,.jm-cands,.jm-cmp{min-height:0;overflow:auto}
.jm-slot{display:flex!important;align-items:center;gap:.6em;width:100%;padding:.4em .3em!important;text-align:left;border-radius:1.2em .4em 1.2em .4em!important}
.jm-slot .jm-blot{width:2.3em;height:2.3em}.jm-slot .t{display:flex;flex-direction:column;min-width:0}.jm-slot .sn{font-size:.72em;color:var(--dimk);letter-spacing:.3em}.jm-slot .nm{font-weight:600;letter-spacing:.1em}.jm-slot .fx{font-size:.74em;color:var(--jadek)}
.jm-slot.on{background:radial-gradient(ellipse at 30% 50%,rgba(168,38,28,.16),transparent 75%)!important}.jm-slot:hover:not(:disabled){background:rgba(43,30,18,.07)!important}.jm-slot:disabled{opacity:.45}
.jm-slots .jm-b.sm{margin:-.2em 0 .3em 3.2em}
.jm-sum{display:flex;flex-wrap:wrap;gap:.2em 1em;margin-top:.6em;font-size:.82em;color:var(--dimk)}.jm-sum b{color:var(--ink)}
.jm-cand{display:flex!important;align-items:center;gap:.55em;width:100%;padding:.35em .3em!important;text-align:left;border-radius:1em .3em 1em .3em!important}
.jm-cand .t{display:flex;flex-direction:column}.jm-cand .nm{font-weight:600;letter-spacing:.08em}.jm-cand .nm small{font-weight:400;color:var(--dimk);margin-left:.4em}.jm-cand .fx{font-size:.76em}
.jm-cand.on{background:radial-gradient(ellipse at 30% 50%,rgba(168,38,28,.16),transparent 75%)!important}.jm-cand:hover{background:rgba(43,30,18,.07)!important}.jm-cand.no{opacity:.6}
.jm-cmp{padding-left:1em;background:linear-gradient(rgba(43,30,18,.25),rgba(43,30,18,.25)) left/1.5px 100% no-repeat}
.jm-cmp .rows{margin:.6em 0}.jm-cmp .rows>div{display:grid;grid-template-columns:2.8em 2.6em 1em 2.6em auto;gap:.3em;align-items:baseline;padding:.12em 0;font-variant-numeric:tabular-nums;color:var(--dimk)}
.jm-cmp .rows>div.ch{color:var(--ink)}.jm-cmp .rows .o{text-align:right}.jm-cmp .rows b{font-weight:600;text-align:right}.jm-cmp .rows .ar{opacity:.5;text-align:center}.jm-cmp .why{margin:.3em 0}
/* 队伍 */
.jm-pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(12em,1fr));gap:1.2em}
.jm-pc{position:relative;display:flex;flex-direction:column;align-items:center;gap:.1em;padding:.3em .4em;font-size:.92em}
.jm-pc .fc{width:4.4em;height:4.4em;border-radius:50%;background:#d8c9a6 center/cover}.jm-pc .rg{position:absolute;top:0;left:50%;width:5.2em;height:5.2em;margin:-.4em 0 0 -2.6em;background:center/100% no-repeat;pointer-events:none}
.jm-pc .nm{font:1.35em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.2em;margin-top:.2em}.jm-pc .ro{font-size:.76em;margin-bottom:.2em}.jm-pc .jm-bar{width:100%}
.jm-pc .ln{font-size:.8em;align-self:stretch;text-align:center}.jm-pc .acts{display:flex;flex-wrap:wrap;gap:.3em;justify-content:center;margin-top:.4em}.jm-pc .acts .jm-b{min-width:0;padding:.2em .8em!important;font-size:.8em!important}
.jm-tc{display:flex;flex-wrap:wrap;align-items:center;gap:.4em .6em;margin:.3em 0}.jm-tc>b{font-weight:600;letter-spacing:.15em;margin-right:.4em}
.jm-lock{font-size:.78em;color:var(--dimk);padding:.15em .6em;border:1px dashed rgba(43,30,18,.25);border-radius:1em .3em}
/* 任务 */
.jm-q{display:grid;grid-template-columns:1.8em 1fr;gap:.7em;align-items:start;padding:.4em .2em;background:url(${line}) left bottom/100% 3px no-repeat}
.jm-q img{width:1.6em;margin-top:.15em}.jm-q .nm{font-weight:600;letter-spacing:.1em}.jm-q .nm small{font-weight:400;color:var(--dimk);margin-left:.6em;font-size:.78em}.jm-q .ds{font-size:.85em;color:#4d3c28;line-height:1.7}
.jm-q.done{opacity:.55}.jm-q.done .nm{text-decoration:line-through;text-decoration-color:rgba(168,38,28,.6)}
/* 设置 */
.jm-sys .row{display:flex;align-items:center;gap:1em;padding:.5em .2em;background:url(${line}) left bottom/100% 3px no-repeat}.jm-sys .row .k{width:5em;letter-spacing:.2em;color:var(--dimk)}
.jm-keyt{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:.35em 1em;font-size:.88em}.jm-keyt span{color:var(--cin);font-family:var(--sans);font-size:.9em}
@media (max-width:760px){.jm-sheet{padding:.7em 1.3em}.jm-attr{grid-template-columns:32% 1fr;gap:.8em}.jm-card .por{height:8em}.jm-stats .ds{display:none}.jm-stats .row{grid-template-columns:2.8em 1.6em 3.6em 1fr auto auto}
  .jm-bagw{grid-template-columns:1fr 12em}.jm-eqw{grid-template-columns:1fr 1fr;}.jm-cmp{grid-column:1/-1;padding-left:0;background:none}.jm-der{grid-template-columns:repeat(2,1fr)}.jm-load{gap:.3em}.jm-keys{display:none}}
/* 行卷版式：标题、人物、内容三层；信息用淡墨分组，交互保留朱砂笔触。 */
#panel.jm{font-size:clamp(14px,1.35cqw,18px)}
.jm-top{left:2.7%;right:15.8%;top:1%;height:10%;align-items:center;padding:0}
.jm-ttl{font-size:2em;letter-spacing:.28em;white-space:nowrap}
.jm-stat{gap:1.2em;font-size:.82em}.jm-stat>span{display:inline-flex;align-items:center;gap:.3em;padding:.2em .5em;background:linear-gradient(90deg,rgba(233,220,192,.07),transparent);border-left:1px solid rgba(224,191,120,.35)}
#panel.jm .jm-mobile-close{display:none}
.jm-sheet{top:11%;bottom:3%;padding:1.2em 2.6em 1.4em 2.8em}
.jm-sheet::after{content:"";position:absolute;left:1.5em;top:4.8em;bottom:2em;width:1px;background:linear-gradient(transparent,rgba(117,83,44,.22) 12%,rgba(117,83,44,.22) 88%,transparent);pointer-events:none}
.jm-pagehead{position:relative;flex:none;display:grid;grid-template-columns:1fr auto;align-content:center;min-height:5.4em;padding:.1em .3em .6em 0;margin-bottom:.25em;background:url(${line}) left bottom/100% 4px no-repeat}
.jm-pageid{grid-column:1;font:500 .68em var(--serif);letter-spacing:.22em;color:var(--dimk)}.jm-pageid span{color:var(--cin);padding:0 .4em}
.jm-pageTitle{grid-column:1;font:400 2.35em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.24em;line-height:1.1;color:var(--ink)}
.jm-pagehead p{grid-column:1;margin:.1em 0 0;font-size:.77em;letter-spacing:.15em;color:var(--dimk)}
.jm-pagehead img{position:absolute;right:.4em;top:.7em;width:2.5em;height:2.5em;opacity:.88}
.jm-mem{flex:none;gap:1.3em;padding:.25em 0 .65em;margin-bottom:.55em}
.jm-mc{width:4.2em}.jm-mc .f{width:3em;height:3em}.jm-mc .r{width:3.5em;height:3.5em;margin-left:-1.75em}.jm-mc .nm{font-size:.82em}
.jm-body{padding:.35em .65em 1.2em .1em;scrollbar-gutter:stable}
.jm-sheet h4{font-size:1.28em;margin:.5em 0 .55em;padding-bottom:.35em;flex-wrap:wrap;row-gap:.08em}
.jm-sheet h4 .jm-dim,.jm-sheet h4 .jm-red{font-size:.65em;line-height:1.55}
.jm-sheet h5{font-size:.92em;margin:1em 0 .45em}
.jm-attr{grid-template-columns:minmax(13em,31%) minmax(0,1fr);gap:2.1em}
.jm-card{padding:.3em 1.2em .6em .2em;background:linear-gradient(90deg,rgba(118,82,39,.07),transparent 88%)}
.jm-card .por{height:13em}.jm-card .nm{font-size:1.85em}.jm-card .or{font-size:.82em;line-height:1.6}
.jm-card .jm-bars{margin-top:.9em}.jm-bar{font-size:.88em;margin:.24em 0}
.jm-stats .row,.jm-attr .jm-stats .row{min-height:2.15em;padding:.3em .4em;grid-template-columns:3em 1.8em minmax(3.3em,auto) minmax(0,1fr) auto auto;gap:.45em}
.jm-stats .row:nth-child(odd){background-color:rgba(118,82,39,.055)}
.jm-stats .ds{font-size:.79em;white-space:normal;line-height:1.35}
.jm-attr .jm-der>div{padding:.22em 0}.jm-der{grid-template-columns:repeat(2,minmax(0,1fr));gap:.15em 1.1em}
.jm-dims{gap:1.5em;margin-top:.8em}.jm-dims.one{margin-top:1em}.jm-dims .r{font-size:.85em;min-height:1.55em}.jm-dims h5{font-size:1.07em;margin:.5em 0 .45em}
.jm-acts{margin:.8em 0 1em}
.jm-load{gap:.65em;margin:.6em 0 .8em}.jm-ls{min-height:5.8em;padding:.75em .25em!important}.jm-ls .nm{font-size:.88em}
.jm-rules{font-size:.8em;line-height:1.7;margin:.45em 0 .9em}
.jm-sr{gap:1em;padding:.8em .5em}.jm-sr:nth-child(odd){background-color:rgba(118,82,39,.05)}
.jm-sr .ds{font-size:.86em;line-height:1.65}.jm-gt{font-size:.78em;line-height:1.55;gap:.2em 1.1em}.jm-sr .mp{font-size:.84em}
.jm-cats{gap:.4em;margin:.35em 0 .9em}.jm-cats button{padding:.38em .9em!important}.jm-grid{gap:.7em}.jm-tile{min-height:5.6em}.jm-tile .nm{font-size:.82em}
.jm-bagw{grid-template-columns:minmax(0,1fr) minmax(14em,31%);gap:1.7em}.jm-det,.jm-cmp{padding-left:1.3em}
.jm-eqw{gap:1.5em}.jm-slot,.jm-cand{padding:.62em .45em!important;min-height:3.3em}
.jm-pgrid{gap:1.1em}.jm-pc{padding:1em .7em;background:radial-gradient(ellipse at 50% 25%,rgba(118,82,39,.1),transparent 70%)}
.jm-q{padding:.75em .5em;gap:.9em}.jm-q:nth-child(odd){background-color:rgba(118,82,39,.05)}.jm-q .ds{font-size:.9em}
.jm-sys .row{padding:.75em .35em}
#panel.jm button:focus-visible{outline:2px solid var(--cin)!important;outline-offset:2px}
@media (max-width:760px){.jm-top{right:15.8%}.jm-stat{gap:.3em;font-size:.72em}.jm-stat>span{padding:.15em .25em}.jm-sheet{padding:.9em 1.55em}.jm-attr{grid-template-columns:minmax(10em,30%) minmax(0,1fr);gap:1em}.jm-card .por{height:9em}.jm-stats .ds{display:none}.jm-stats .row,.jm-attr .jm-stats .row{grid-template-columns:2.8em 1.6em 3.2em 1fr auto auto}.jm-dims{grid-template-columns:1fr}.jm-bagw{grid-template-columns:minmax(0,1fr) 12em}}
@media (max-width:640px){
 #game:has(#panel.jm:not([hidden])){position:fixed;inset:0;width:100vw!important;height:100dvh!important;max-width:none;aspect-ratio:auto;z-index:100}
 #panel.jm{font-size:16px;background:radial-gradient(ellipse at 40% 15%,#39281b,#0d0a08 80%)}
 .jm-top{left:4%;right:4%;top:0;height:7%;align-items:center}.jm-ttl{font-size:1.45em;letter-spacing:.16em}.jm-stat{margin-left:auto;gap:.35em;font-size:.72em}.jm-stat>span{padding:0;border:0;background:none}.jm-stat>span:nth-child(2){display:none}
 #panel.jm .jm-mobile-close{display:inline-flex;margin-left:.65em;padding:.25em .5em!important;color:var(--gold);font-size:.9em}
 .jm-tabs{left:0;right:0;top:7%;bottom:auto;width:auto;height:3.5em;display:flex;flex-direction:row;gap:.15em;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding:0 .5em;background:rgba(12,8,5,.72)}.jm-tabs::-webkit-scrollbar{display:none}
 #panel.jm .jm-tabs button{flex:0 0 auto;font-size:1.04em;padding:.6em .8em!important;letter-spacing:.08em;white-space:nowrap;min-height:2.7em}
 #panel.jm .jm-tabs button .n{font-size:.6em;width:auto}.jm-tabs .jm-close{display:none!important}
 #panel.jm .jm-tabs button.on::after{right:.4em;top:auto;bottom:.23em;width:.35em;height:.35em}
 .jm-sheet{left:0;right:0;top:calc(7% + 3.5em);bottom:0;padding:1.1em 1.2em 1.4em;background-color:#eadcbb;background-size:100% 100%;filter:none}
 .jm-sheet::after{left:.58em;top:4.5em;bottom:1em}.jm-pagehead{min-height:4.65em;margin-bottom:.25em;padding-bottom:.45em}.jm-pageTitle{font-size:2em}.jm-pagehead img{width:2.2em;height:2.2em}.jm-pagehead p{font-size:.72em}
 .jm-body{padding:.3em .35em 2em .1em;scrollbar-gutter:auto;overscroll-behavior:contain}
 .jm-mem{gap:.5em;overflow-x:auto;align-items:center;padding:.2em 0 .45em;margin-bottom:.2em}.jm-mc{flex:0 0 3.5em;width:3.5em}.jm-mc .f{width:2.4em;height:2.4em}.jm-mc .r{top:-.1em;width:2.8em;height:2.8em;margin-left:-1.4em}.jm-mc .nm{font-size:.74em}.jm-memk{display:none}
 .jm-sheet h4{font-size:1.2em}.jm-sheet h4 .jm-dim{flex-basis:100%;font-size:.67em}
 .jm-attr{display:block}.jm-card{display:grid;grid-template-columns:5.6em minmax(0,1fr);column-gap:.6em;align-items:center;padding:.15em .2em .75em;margin-bottom:.4em;background:linear-gradient(90deg,rgba(118,82,39,.08),transparent)}
 .jm-card .por{grid-row:1/3;height:7.2em;background-size:contain}.jm-card .nmw{grid-column:2;margin:0;text-align:left}.jm-card .nm{font-size:1.7em}.jm-card .jm-bars{grid-column:2;margin:0}.jm-card .jm-bar{font-size:.78em;margin:.08em 0}.jm-card .jm-aff{grid-column:1/-1}.jm-card .jm-dims.one{grid-column:1/-1;margin:.45em 0 0}
 .jm-stats .row,.jm-attr .jm-stats .row{grid-template-columns:2.8em 1.7em 3.3em 1fr auto auto;min-height:2.65em}.jm-stats .ds{display:none}.jm-pm{min-width:2.2em;min-height:2.2em}.jm-der{grid-template-columns:repeat(2,minmax(0,1fr))}.jm-dims{grid-template-columns:1fr;gap:.4em}.jm-dims .r{font-size:.82em}.jm-dims.one>div{column-gap:.55em}
 .jm-load{grid-template-columns:repeat(3,minmax(0,1fr));gap:.2em}.jm-ls{min-height:4.8em}.jm-sr{grid-template-columns:2em minmax(0,1fr) auto;gap:.5em;padding:.75em .15em}.jm-sr .mp{grid-column:2;grid-row:2}.jm-sr .jm-b{grid-column:3;grid-row:1/3}.jm-sr .nm{font-size:.94em}.jm-sr .nm small{display:block;margin:0}.jm-gt{font-size:.78em}
 .jm-xf{height:auto;min-height:100%;gap:1em}.jm-xf .slots{gap:.3em}.jm-xf .c{width:3.4em;height:3.4em;font-size:.78em}.jm-xf2{grid-template-columns:1fr;gap:.8em}.jm-xf2 .xr{overflow:visible}
 .jm-bagw{display:flex;flex-direction:column;gap:.9em}.jm-grid{grid-template-columns:repeat(auto-fill,minmax(5.2em,1fr))}.jm-det{order:-1;max-height:18em;overflow:auto;padding:.2em .2em 1em;background:linear-gradient(90deg,transparent,rgba(43,30,18,.35),transparent) bottom/100% 1px no-repeat}
 .jm-eqw{display:flex;flex-direction:column;height:auto;gap:.75em}.jm-slots,.jm-cands,.jm-cmp{overflow:visible}.jm-cmp{padding:0;background:none}.jm-pgrid{grid-template-columns:1fr;gap:.5em}.jm-pc{padding:.85em .7em}.jm-q{padding:.65em .2em}
 .jm-keyt{grid-template-columns:auto 1fr;gap:.2em .6em}.jm-keys{display:none}
}
/* 桌面 RPG 格子：内容常驻，详细说明由悬停浮签承担。 */
.jm-inventory-grid,.jm-geargrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(6.9em,1fr));gap:.65em;align-content:start;padding:.35em .15em 1em}
#panel.jm .jm-invcell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:7.5em;padding:.65em .3em .45em!important;background:radial-gradient(ellipse at 50% 42%,rgba(117,82,42,.2),rgba(117,82,42,.055) 58%,transparent 75%)!important;transition:transform .14s,filter .14s}
.jm-invcell::before{content:"";position:absolute;inset:.35em .45em .85em;border:1px solid rgba(95,67,36,.22);border-radius:37% 32% 38% 35%/25% 30% 28% 27%;transform:rotate(-2deg);pointer-events:none}
.jm-invcell::after{content:"";position:absolute;left:22%;right:22%;bottom:.18em;height:2px;background:var(--kind);opacity:.75}
.jm-invcell:hover,.jm-invcell:focus-visible{transform:translateY(-3px);filter:drop-shadow(0 5px 5px rgba(57,36,17,.24));outline:none}.jm-invcell:hover::before,.jm-invcell:focus-visible::before{border-color:var(--cin)}
.jm-invicon{display:grid;place-items:center;width:3.7em;height:3.7em;filter:drop-shadow(0 3px 3px rgba(30,20,10,.3))}.jm-invicon .jm-blot,.jm-invicon .jm-ai{width:3.2em!important;height:3.2em!important}
.jm-invname{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:.9em;color:var(--ink);letter-spacing:.03em}
.jm-invtype{font-size:.7em;color:var(--dimk)}.jm-invcount{position:absolute;right:.8em;top:.55em;font:600 .78em var(--sans);color:var(--ink)}.jm-invwear{position:absolute;left:.6em;top:.5em;font-size:.65em;color:#f1e4c6;background:var(--cin);padding:0 .25em}
.jm-cats{margin:.3em 0 .55em}.jm-cats .cap{white-space:nowrap}
.jm-skillgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(9em,1fr));gap:.7em;padding:.25em .1em 1em}
#panel.jm .jm-skillcard{position:relative;display:flex;flex-direction:column;align-items:center;min-width:0;min-height:9.4em;padding:.75em .45em .5em!important;background:radial-gradient(ellipse at 50% 35%,rgba(85,61,31,.2),rgba(85,61,31,.05) 66%,transparent 80%)!important;transition:transform .14s,filter .14s}
.jm-skillcard::before{content:"";position:absolute;inset:.35em .65em;border:1px solid rgba(95,67,36,.25);border-radius:43% 38% 40% 45%/23% 26% 25% 27%;pointer-events:none}.jm-skillcard.on::before{border:2px solid var(--cin)}
.jm-skillcard:hover,.jm-skillcard:focus-visible{transform:translateY(-3px);filter:drop-shadow(0 5px 5px rgba(57,36,17,.22));outline:none}.jm-skillcard:hover::before{border-color:var(--cin)}
.jm-skillart{display:grid;place-items:center;width:3.3em;height:3.3em}.jm-skillart .jm-blot{width:3.1em;height:3.1em}.jm-skillname{font:600 1em var(--serif);color:var(--ink);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.jm-skillmeta{font-size:.72em;color:var(--dimk)}
.jm-skillprog{width:80%;height:.27em;margin:.42em 0 .25em;background:rgba(43,30,18,.17);overflow:hidden}.jm-skillprog i{display:block;height:100%;background:var(--kind)}
.jm-skillstate{font-size:.72em;color:var(--dimk)}.jm-skillcard.on .jm-skillstate{color:var(--cin);font-weight:600}.jm-skillcard.locked{opacity:.65}
.jm-rules{margin:.45em 0 .8em;font-size:.8em}.jm-rules summary{display:inline-block;cursor:pointer;color:var(--dimk);text-decoration:underline;text-decoration-color:rgba(122,101,72,.4);text-underline-offset:.2em}.jm-rules p{margin:.3em 0;line-height:1.6}
.jm-equipBoard{display:grid;grid-template-columns:minmax(13em,30%) minmax(0,1fr);gap:1.7em;min-height:100%}.jm-equipHero{padding:.25em 1.1em .8em .2em;background:linear-gradient(90deg,rgba(117,82,42,.08),transparent)}
.jm-equipIdentity{display:flex;align-items:center;gap:.8em;margin:.25em 0 .8em}.jm-equipIdentity .face{width:4.2em;height:4.2em;flex:none;border-radius:50%;background:#d8c9a6 center/cover;box-shadow:0 0 0 2px rgba(168,38,28,.7)}
.jm-equipIdentity strong{display:block;font:1.6em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.15em}.jm-equipIdentity small{display:block;font-size:.75em;color:var(--dimk)}
.jm-wornslot{display:flex;align-items:center;gap:.55em;min-height:3.7em;padding:.35em .25em;background:url(${line}) left bottom/100% 3px no-repeat}.jm-wornslot.unavailable{opacity:.45}.jm-wornicon{width:2.9em;height:2.9em;display:grid;place-items:center;flex:none}.jm-wornicon .jm-blot,.jm-wornicon .jm-ai{width:2.7em!important;height:2.7em!important}.jm-worntxt{display:flex;flex-direction:column;min-width:0;flex:1}.jm-worntxt small{font-size:.72em;color:var(--dimk)}.jm-worntxt strong{font-size:.9em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.jm-wornslot .jm-b{min-width:0}
.jm-equipStock{min-width:0}.jm-gearGroup{margin-bottom:.6em}.jm-gearGroup h4{margin-top:.15em}.jm-geargrid{grid-template-columns:repeat(auto-fill,minmax(6.8em,1fr));gap:.35em}.jm-geargrid .jm-invcell{min-height:7em}
.jm-float{position:absolute;z-index:90;width:min(23em,38%);max-height:calc(100% - 16px);overflow:auto;pointer-events:none;padding:1em 1.2em 1.05em;background:linear-gradient(155deg,rgba(39,29,20,.98),rgba(13,10,8,.98));color:#e9dcc0;box-shadow:0 12px 30px rgba(0,0,0,.7),inset 3px 0 #b3261e;border-top:1px solid rgba(224,191,120,.65);font-family:var(--serif);font-size:.92em;line-height:1.55}
.jm-tipkind{font-size:.75em;letter-spacing:.2em;color:var(--gold)}.jm-tiphead{display:flex;align-items:center;gap:.7em;padding:.4em 0 .5em;background:linear-gradient(90deg,rgba(224,191,120,.4),transparent) bottom/100% 1px no-repeat}.jm-tiphead .jm-blot{width:2.6em;height:2.6em}.jm-tiphead strong{display:block;font-size:1.3em;color:#f2dfb8}.jm-tiphead small{display:block;font-size:.76em;color:#b7a384}.jm-float p{font-size:.86em;margin:.7em 0;color:#e0d0b0}
.jm-tipfx{display:flex;flex-wrap:wrap;gap:.25em .85em;margin:.45em 0;color:#9bd0a6;font-size:.85em}.jm-tipcompare{margin:.7em 0;padding:.45em 0;background:linear-gradient(90deg,rgba(224,191,120,.35),transparent) top/100% 1px no-repeat}.jm-tipcompare>b{display:block;color:var(--gold);font-weight:500;font-size:.85em;margin-bottom:.2em}.jm-tipcompare>div{display:grid;grid-template-columns:4em 1fr auto;gap:.4em;font-size:.8em;padding:.12em 0}.jm-tipcompare em{font-size:1em}.jm-tipnote{margin:.5em 0;font-size:.8em;color:#c6b694}.jm-tipwarn{margin:.5em 0;font-size:.83em;color:#eb8372}.jm-tipfoot{margin-top:.65em;padding-top:.45em;background:linear-gradient(90deg,rgba(224,191,120,.35),transparent) top/100% 1px no-repeat;color:var(--gold);font-size:.78em;letter-spacing:.12em}
.jm-pagehead{min-height:3.75em;padding-bottom:.25em;margin-bottom:.05em}.jm-pagehead p{display:none}.jm-pageTitle{font-size:2em}.jm-pagehead img{width:2.1em;height:2.1em;top:.55em}
.jm-mem{align-items:center;padding:.05em 0 .3em;margin-bottom:.2em}.jm-mc{width:3.4em}.jm-mc .f{width:2.35em;height:2.35em}.jm-mc .r{width:2.75em;height:2.75em;margin-left:-1.375em;top:-.15em}.jm-mc .nm{font-size:.72em}
.jm-load{margin:.25em 0 .3em}.jm-ls{min-height:4.8em;padding:.35em .2em!important}.jm-ls .jm-blot{width:1.8em;height:1.8em}.jm-skillcard{min-height:8em!important}.jm-skillart{width:2.8em;height:2.8em}.jm-skillart .jm-blot{width:2.7em;height:2.7em}
@media (max-width:760px){.jm-inventory-grid{grid-template-columns:repeat(auto-fill,minmax(6.2em,1fr))}.jm-skillgrid{grid-template-columns:repeat(auto-fill,minmax(8em,1fr))}.jm-equipBoard{grid-template-columns:1fr}.jm-float{width:22em}}
/* 桌面版界面骨架：深墨顶栏 + 横向功能签 + 人物侧栏 + 宣纸内容台。 */
.jm-topChapter,.jm-desktop-close{display:none}
@media (min-width:761px){
 #panel.jm{background:radial-gradient(ellipse at 50% 36%,#493624 0%,#21170f 53%,#080604 100%);font-size:clamp(15px,1.35cqw,18px)}
 .jm-top{left:2.2%;right:2.2%;top:.7%;height:8.6%;display:flex;align-items:center;gap:1.2em;padding:0 1em;background:linear-gradient(90deg,rgba(13,10,8,.15),rgba(13,10,8,.55) 25%,rgba(13,10,8,.25));border-bottom:1px solid rgba(224,191,120,.38)}
 .jm-ttl{font-size:1.85em;letter-spacing:.2em}.jm-topChapter{display:inline-block;font:.78em var(--serif);letter-spacing:.24em;color:#b79b69;padding-left:1.3em;border-left:1px solid rgba(224,191,120,.4)}
 .jm-stat{margin-left:auto;font-size:.8em}.jm-stat>span{background:none;border:0;padding:0 .2em}.jm-desktop-close{display:flex!important;align-items:center;justify-content:center;gap:.35em;width:3.1em;height:2.4em;margin-left:1em;color:#e0bf78!important;font-size:1.2em!important;background:radial-gradient(ellipse,rgba(224,191,120,.14),transparent 70%)!important}.jm-desktop-close small{font:500 .5em var(--sans);opacity:.7}
 #panel.jm .jm-tabs{left:3%;right:3%;top:10%;bottom:auto;width:auto;height:8%;display:flex;flex-direction:row;gap:.25em;align-items:stretch;padding:0 .25em;background:linear-gradient(180deg,rgba(9,6,4,.6),rgba(9,6,4,.14))}
 #panel.jm .jm-tabs button{flex:1;justify-content:center;gap:.25em;padding:.2em .4em!important;font-size:1em;letter-spacing:.1em;color:#c8b48e;text-shadow:none;min-width:0;transition:background .15s,color .15s,transform .15s}
 #panel.jm .jm-tabs button:hover,#panel.jm .jm-tabs button:focus-visible{transform:translateY(-2px);background:rgba(224,191,120,.09)!important;color:#fff0cd}
 #panel.jm .jm-tabs button.on{background:linear-gradient(180deg,rgba(112,72,34,.65),rgba(44,27,16,.9))!important;color:#f8ebcf;box-shadow:inset 0 2px rgba(224,191,120,.65),0 4px 9px rgba(0,0,0,.3)}
 #panel.jm .jm-tabs button.on::after{left:25%;right:25%;top:auto;bottom:0;width:auto;height:2px;margin:0;background:#b3261e;transform:none;box-shadow:0 0 8px #b3261e}
 #panel.jm .jm-tabs .jm-close{display:none!important}.jm-tabs .n{align-self:flex-start;font-size:.6em!important;color:#806e53!important}.jm-navmark{font:1.3em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);color:#d5b77c}.jm-tabs button.on .jm-navmark{color:#f5d99c}.jm-navlabel{font:1.12em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush)}
 .jm-sheet{left:2.7%;right:2.7%;top:19%;bottom:3%;display:grid;grid-template-columns:minmax(12em,22%) minmax(0,1fr);grid-template-rows:3.65em minmax(0,1fr);gap:0;padding:.7em 1.2em 1.1em;background-color:#eadcbb;background-size:100% 100%;filter:drop-shadow(0 12px 18px rgba(0,0,0,.8));box-shadow:inset 0 0 0 4px rgba(87,56,27,.22)}
 .jm-sheet::after{display:none}.jm-pagehead{grid-column:1/-1;grid-row:1;min-height:0;margin:0;padding:.2em 1em .35em;background:url(${line}) left bottom/100% 4px no-repeat;display:flex;align-items:center;gap:1em}
 .jm-pageid{grid-column:auto;order:0;white-space:nowrap;font-size:.67em}.jm-pageTitle{grid-column:auto;order:1;font-size:1.75em;line-height:1;letter-spacing:.16em}.jm-pagehead p{display:block;grid-column:auto;order:2;font-size:.72em;margin:0;color:#765c3d}.jm-pagehead img{right:.75em;top:.65em;width:2.1em;height:2.1em}
 .jm-side{grid-column:1;grid-row:2;position:relative;display:flex;flex-direction:column;min-height:0;padding:1em .9em .7em;background:linear-gradient(165deg,rgba(55,39,25,.97),rgba(17,12,9,.98));color:#eadcbc;box-shadow:inset 0 1px rgba(224,191,120,.4),inset -2px 0 rgba(224,191,120,.33),3px 0 9px rgba(31,19,8,.18);overflow:auto;scrollbar-width:thin;scrollbar-color:#8e6f43 transparent}
 .jm-side::before{content:"";position:absolute;inset:.35em;border:1px solid rgba(224,191,120,.13);pointer-events:none}.jm-sideCaption{font-size:.7em;color:#c8a875;letter-spacing:.25em}.jm-sidePortrait{flex:none;height:9.5em;margin:.1em .4em -.3em;background:center 14%/contain no-repeat;-webkit-mask:linear-gradient(#000 75%,transparent);mask:linear-gradient(#000 75%,transparent)}
 .jm-sideName{font:1.75em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);text-align:center;letter-spacing:.18em;color:#f6dfb5}.jm-sideRole{text-align:center;font-size:.72em;color:#c7b190;letter-spacing:.07em}.jm-sideVitals{padding:.65em .2em .3em}.jm-sideVitals .jm-bar{grid-template-columns:2.2em 1fr auto;font-size:.67em;gap:.28em;margin:.17em 0}.jm-sideVitals .jm-bar .l,.jm-sideVitals .jm-bar b small{color:#baaa8d}.jm-sideVitals .jm-bar b{min-width:3.8em;color:#f0dcb7}
 .jm-sideLabel{margin:.45em 0 .3em;padding:.2em .1em;font-size:.67em;letter-spacing:.2em;color:#c8a875;background:linear-gradient(90deg,rgba(224,191,120,.4),transparent) bottom/100% 1px no-repeat}
 .jm-side .jm-mem{display:flex;flex-direction:column;align-items:stretch;gap:.12em;overflow:visible;margin:0;padding:0;background:none}.jm-side .jm-mc{display:flex!important;flex-direction:row;align-items:center;gap:.5em;width:100%;min-height:2.7em;padding:.2em .45em!important;text-align:left;background:transparent!important}
 .jm-side .jm-mc.on{background:linear-gradient(90deg,rgba(179,38,30,.38),rgba(179,38,30,.02))!important;box-shadow:inset 3px 0 #c8533a}.jm-side .jm-mc .f{width:2.2em;height:2.2em;flex:none;filter:none;opacity:1}.jm-side .jm-mc .r{top:.1em;left:.45em;width:2.4em;height:2.4em;margin:0}.jm-side .jm-mc .nm{font-size:.86em;color:#dac8a8}.jm-side .jm-mc.on .nm{color:#fff0d1}.jm-side .jm-mc .jm-dot{right:.3em;top:.6em}.jm-side .jm-memk{display:none}
 .jm-sheet:has(.jm-side)>.jm-body{grid-column:2;grid-row:2;min-height:0;margin:0;padding:1em 1.15em 1.4em 1.4em}.jm-sheet:not(:has(.jm-side))>.jm-body{grid-column:1/-1;grid-row:2;min-height:0;padding:1em 1.5em 1.4em}
 .jm-sheet h4{font-size:1.23em;color:#352316;letter-spacing:.12em;margin:.15em 0 .5em}.jm-sheet h4::before{content:"";width:.17em;height:.8em;background:#a8261c;transform:skew(-12deg);flex:none}
 .jm-sheet h4 .jm-dim{font-size:.62em}.jm-sheet h5{color:#6c5033}
 .jm-screen-attr .jm-card .por,.jm-screen-attr .jm-card .nmw,.jm-screen-attr .jm-card .jm-bars,.jm-screen-attr .jm-card .jm-aff{display:none}.jm-screen-attr .jm-attr{display:flex;flex-direction:column}.jm-screen-attr .jm-attr .jm-cols{order:0}.jm-screen-attr .jm-attr .jm-card{order:1;margin-top:1em;padding:.3em .7em;background:rgba(126,84,40,.08)}
 .jm-martial{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);align-items:start;gap:1em}.jm-martial-art,.jm-martial-inner{min-width:0}.jm-martial-inner{min-height:23em;padding:.3em .8em .8em 1em;background:linear-gradient(145deg,rgba(75,50,29,.12),rgba(75,50,29,.02));border-left:3px solid rgba(168,38,28,.6)}.jm-martial-art .jm-load{grid-template-columns:repeat(3,minmax(0,1fr));gap:.2em}.jm-martial-art .jm-ls{min-height:4.1em;padding:.25em .1em!important}.jm-martial-art .jm-skillgrid{grid-template-columns:repeat(auto-fill,minmax(7.8em,1fr));gap:.35em}.jm-martial-art .jm-skillcard{min-height:6.5em!important}.jm-martial .jm-dim{line-height:1.35}.jm-martial .jm-rules{margin:.15em 0 .5em}.jm-martial-inner>.jm-xf{display:block;height:auto;min-height:0;opacity:1}.jm-martial-inner .jm-xf .slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));justify-items:center;gap:.45em;margin:.7em 0}.jm-martial-inner .jm-xf .c{position:relative;display:flex;flex-direction:column;gap:0;width:6.4em;height:6.4em;border:0;border-radius:0;clip-path:polygon(13% 0,100% 0,100% 87%,87% 100%,0 100%,0 13%);background:linear-gradient(145deg,#493625,#1c1510);box-shadow:inset 0 2px rgba(224,191,120,.48);color:#d7bc8b;font-size:.9em}.jm-martial-inner .jm-xf .c .mark{position:absolute;top:.35em;left:.6em;font:.7em var(--serif);color:#967952}.jm-martial-inner .jm-xf .c small{font:.65em var(--serif);color:#9c8560}.jm-martial-inner .jm-xf .tx{max-width:none;padding:.4em .2em}.jm-martial-inner .jm-xf .tx strong{font:1.2em "Ma Shan Zheng",var(--brush);color:#4a2d1b;letter-spacing:.15em}.jm-martial-inner .jm-xf .tx p{font-size:.73em;line-height:1.5}.jm-martial-inner .jm-xf .tx img{width:1.8em}.jm-martial-inner .jm-xf2{grid-template-columns:1fr;gap:.65em}.jm-martial-inner .jm-xf2 .xl{display:grid;grid-template-columns:6.4em minmax(0,1fr);gap:.2em;align-items:center}.jm-martial-inner .jm-xf2 .xl h4{grid-column:1/-1}.jm-martial-inner .jm-xf2 .xs{align-items:center}.jm-martial-inner .jm-xf2 .xs .xc{width:3.5em;height:4em}.jm-martial-inner .jm-xf2 .xr{overflow:visible}.jm-martial-inner .jm-xfgrid{grid-template-columns:repeat(auto-fill,minmax(7.8em,1fr))}
 .jm-equipBoard{grid-template-columns:minmax(11em,29%) minmax(0,1fr);gap:1em}.jm-equipIdentity,.jm-equipHero>.jm-bar{display:none}.jm-equipHero{padding:.1em .8em}.jm-equipHero h4{margin-top:0}.jm-wornslot{min-height:3.3em}
 .jm-inventory-grid,.jm-geargrid{grid-template-columns:repeat(auto-fill,minmax(6.6em,1fr));gap:.55em}
 #panel.jm .jm-invcell,#panel.jm .jm-skillcard{background:linear-gradient(145deg,#3b2d20 0%,#1b1510 75%)!important;color:#eadcbc;clip-path:polygon(8% 0,100% 0,100% 85%,92% 100%,0 100%,0 15%);box-shadow:none;min-height:7.1em}
 .jm-invcell::before,.jm-skillcard::before{inset:.25em;border:1px solid rgba(224,191,120,.32);border-radius:0;transform:none}.jm-invcell::after{background:var(--kind);opacity:1;bottom:0;height:3px;left:8%;right:8%}
 #panel.jm .jm-invcell:hover,#panel.jm .jm-invcell:focus-visible,#panel.jm .jm-skillcard:hover,#panel.jm .jm-skillcard:focus-visible{filter:drop-shadow(0 4px 5px rgba(0,0,0,.4));transform:translateY(-2px);background:linear-gradient(145deg,#5a3825,#271910)!important}
 .jm-invname,.jm-skillname{color:#f1dfbd}.jm-invtype,.jm-skillmeta{color:#b9a384}.jm-invcount{color:#e0bf78}.jm-skillstate{color:#cbb48f}.jm-skillcard.on{background:linear-gradient(145deg,#713329,#271810)!important}.jm-skillcard.on .jm-skillstate{color:#f3ae8f}.jm-skillcard.locked{opacity:.64}
 .jm-skillgrid{grid-template-columns:repeat(auto-fill,minmax(8.5em,1fr));gap:.6em}.jm-skillcard::after{content:"";position:absolute;left:9%;right:9%;bottom:0;height:3px;background:var(--kind)}
 .jm-invicon .jm-ai,.jm-wornicon .jm-ai{background:radial-gradient(circle,#5d442f,#2b1e12)!important}.jm-cats button.on{background:#493022!important}.jm-cats button:not(.on):hover{background:rgba(92,57,27,.13)!important}
 .jm-pgrid{grid-template-columns:repeat(auto-fill,minmax(17em,1fr));gap:.9em}.jm-pc{min-height:15em;padding:1em 1.1em;background:linear-gradient(150deg,#463425,#21170f 78%);color:#eadcbc;clip-path:polygon(5% 0,100% 0,100% 94%,95% 100%,0 100%,0 6%);box-shadow:inset 0 2px rgba(224,191,120,.45)}
 .jm-pc .nm{color:#f3dfb7}.jm-pc .jm-dim,.jm-pc .ro,.jm-pc .ln.jm-dim{color:#c6b18d}.jm-pc .jm-bar .l,.jm-pc .jm-bar b small{color:#bca989}.jm-pc .jm-bar b{color:#f5dfb8}.jm-pc .fc{width:4.5em;height:4.5em;box-shadow:0 0 0 2px #b58b52}.jm-pc .acts{margin-top:auto;padding-top:.6em}.jm-pc .acts .jm-b{font-size:.73em!important}.jm-pc .acts .jm-b.ghost{color:#eadcbc!important;background:linear-gradient(90deg,rgba(224,191,120,.16),rgba(224,191,120,.05))!important}.jm-pc .acts .jm-b.ghost:hover{background:#a8261c!important}
 .jm-body.jm-quest,.jm-body.jm-sys{position:relative;padding:1em 2em 1.5em!important}.jm-body.jm-quest::after,.jm-body.jm-sys::after{content:"";position:absolute;right:7%;top:22%;width:12em;height:12em;opacity:.07;background:url(${mnSeal('志',170)}) center/contain no-repeat;pointer-events:none}.jm-body.jm-sys::after{background-image:url(${mnSeal('设',170)})}
 .jm-q{max-width:47em;min-height:4em;padding:.85em 1em;margin:.4em 0;background:linear-gradient(90deg,rgba(125,85,43,.12),rgba(125,85,43,.03))!important;border-left:3px solid rgba(168,38,28,.65)}.jm-q.done{border-left-color:rgba(47,107,69,.55)}.jm-q .nm{font-size:1em}.jm-q .ds{font-size:.87em}
 .jm-body.jm-sys{display:block}.jm-body.jm-sys > .jm-sys{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.85em;max-width:58em}.jm-sys .row{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;min-height:7.3em;padding:1em 1.1em;background:linear-gradient(150deg,#463425,#21170f 78%);color:#eadcbc;clip-path:polygon(6% 0,100% 0,100% 92%,94% 100%,0 100%,0 8%);box-shadow:inset 0 2px rgba(224,191,120,.4)}.jm-sys .row .k{color:#d8b977;font-size:.8em}.jm-sys .row .jm-b.ghost{background:linear-gradient(90deg,rgba(224,191,120,.18),rgba(224,191,120,.04))!important;color:#f3e6c8!important}.jm-sys h4,.jm-sys .jm-keyt{grid-column:1/-1}.jm-sys .jm-keyt{padding:1em 1.2em;background:rgba(123,82,38,.08);grid-template-columns:auto 1fr auto 1fr;gap:.5em 1.1em}
 .jm-body.jm-xinfa .jm-xf{display:grid;grid-template-columns:16em minmax(0,1fr);align-content:center;gap:2em;width:min(100%,56em);min-height:22em;margin:auto;padding:1.5em 2em;background:linear-gradient(145deg,rgba(65,47,31,.12),rgba(65,47,31,.03));border-left:3px solid rgba(168,38,28,.55)}.jm-body.jm-xinfa .jm-xf .slots{display:grid;grid-template-columns:repeat(2,1fr);align-content:center;justify-items:center;gap:1em}.jm-body.jm-xinfa .jm-xf .c{width:6em;height:6em;border:1px solid rgba(224,191,120,.4);border-radius:0;clip-path:polygon(12% 0,100% 0,100% 88%,88% 100%,0 100%,0 12%);background:linear-gradient(145deg,#463425,#1b1510);color:#d5bc8e;box-shadow:inset 0 1px rgba(224,191,120,.45)}.jm-body.jm-xinfa .jm-xf .tx{max-width:none}.jm-body.jm-xinfa .jm-xf .tx p{font-size:.87em;line-height:1.6}.jm-body.jm-xinfa .jm-xf .tx p:last-child{margin-top:1em;padding:.6em 0;border-top:1px solid rgba(80,49,24,.2)}
 .jm-float{border-top:2px solid #c19c60;box-shadow:0 14px 32px rgba(0,0,0,.8),inset 4px 0 #b3261e}
 .jm-keys{left:3.5%;bottom:.35%}
}
`;document.head.appendChild(st)}

// ───────── 章节结算（覆盖 story.js ending；01 §5.3 #12 #13 #22） ─────────
// 正史结局：发放要物「苍龙白鸟图（上卷）」，S.chapter=2，存档保留以接第二章；落草结局为非正史，清档。
Object.assign(ITEMS,{canglong_map:{name:'苍龙白鸟图（上卷）',desc:'半张羊皮，画着盘龙与展翅的白鸟，边缘密密标着水道记号。另一半不知落在谁手里。',key:1}});
if(ITEMS.rusty&&!/龙尾/.test(ITEMS.rusty.desc))ITEMS.rusty.desc+=' 剑格上隐约刻着半截龙尾。';
ICO.canglong_map='图';
async function ending(kind){await fade(async()=>{mode='end';$('hud').hidden=true;$('prompt').hidden=true});mnCSS();
  const good=kind==='good';if(good){if(!S.bag.canglong_map)S.bag.canglong_map=1;S.chapter=Math.max(2,S.chapter||1);setFlag('ch1_done');save()}else{try{localStorage.removeItem('xjh.save')}catch(e){}}
  const p=openPanel('jm jm-end');panelClose=null;panelKind='end';const a=(S.aff||{}).suzhi;
  const mates=(S.party||[]).map(k=>((typeof PARTY_DEF!=='undefined'&&PARTY_DEF[k])||{}).name||k);
  p.innerHTML=`<section class="jm-sheet jm-endw" style="background-image:url(${mnPaper()})"><img class="seal" src="${mnSeal(good?'完':'歧',54)}" alt="">
    <div class="ttl">第一章 · ${good?'襄阳风云':'落草'}</div>
    <p>${good?'黑风寨一夜覆灭，东津渡重归太平。<br>那半张画着苍龙与白鸟的羊皮图，将把你引向更广阔的江湖……':'你成了黑风寨的二当家。东津渡的百姓从此又多了一个要提防的名字。<br>羊皮图上的苍龙与白鸟，在火把下显得格外刺眼……'}</p>
    <div class="sum"><span>境界 <b>${S.lv}</b> 层</span><span>侠义 <b>${S.moral}</b></span><span>武学 <b>${Object.keys(S.skills).filter(k=>k!=='fist').length}</b> 门</span><span>银两 <b>${S.silver}</b></span><span>同伴 <b>${mates.join('、')||'无'}</b></span><span>宠物 <b>${S.pet&&PARTY_DEF[S.pet]?PARTY_DEF[S.pet].name:'无'}</b></span>${a!=null&&S.party.includes('suzhi')?`<span>苏芷好感 <b>${a}</b></span>`:''}</div>
    ${good?'<p class="jm-dim">获得要物「苍龙白鸟图（上卷）」。存档已保留，第二章「岘山夜雨」将从此处接续。</p>':'<p class="jm-red">此路不通往第二章（非正史结局），存档已清除。</p>'}
    <div class="jm-acts" style="justify-content:center">${good?'<button class="jm-b ghost" data-a="roam">继续游历</button>':''}<button class="jm-b" data-a="title">回到标题</button></div></section>`;
  p.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='title')location.reload();else if(b.dataset.a==='roam'){closePanel();mode='scene';hud()}}}
(function(){const st=document.createElement('style');st.textContent=`
#panel.jm-end .jm-endw{left:14%;right:14%;top:8%;bottom:8%;align-items:center;justify-content:center;text-align:center;gap:.6em;padding:2em 3em}
.jm-endw .ttl{font:2.1em "Ma Shan Zheng","ZCOOL XiaoWei",var(--brush);letter-spacing:.3em}.jm-endw p{margin:.2em 0;line-height:1.9;max-width:30em}
.jm-endw .seal{position:absolute;right:9%;top:10%;width:3.2em;transform:rotate(6deg)}
.jm-endw .sum{width:100%;display:flex;flex-wrap:wrap;justify-content:center;gap:.3em 1.4em;margin:.5em 0;font-size:.92em;color:var(--dimk)}.jm-endw .sum b{color:var(--ink)}`;document.head.appendChild(st)})();
