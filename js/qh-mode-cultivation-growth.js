/* CH2-GROWTH-1: absolute progress ledger shared by protagonist, menus and battle. */
(function(root){'use strict';
const B=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-balance.js'):root.CultivationBalance;
const legacyRules={
 foundation:{name:'基础',targets:[['bonuses','mhp',4,120],['stats','con',40,5]],use:'气血上限与根骨'},
 coordination:{name:'协调',targets:[['bonuses','dodge',16,8]],use:'闪避'},
 footwork:{name:'步法',targets:[['bonuses','spd',12,12],['stats','agi',48,5]],use:'行动顺序与身法'},
 breathing:{name:'吐纳',targets:[['bonuses','mmp',4,80],['stats','wil',48,5]],use:'内力上限与定力；《吐故纳新篇》'},
 observation:{name:'察势',targets:[['bonuses','crit',20,10],['bonuses','dodge',20,10]],use:'识别破绽：暴击、闪避'},
 sword:{name:'剑法',targets:[['zy','剑',1,200]],use:'剑造诣、试锋剑法熟练；与拳法合计每48点臂力+1'},
 fist:{name:'拳法',targets:[['zy','拳',1,200]],use:'拳造诣、守拙拳法熟练；与剑法合计每48点臂力+1'},
 understanding:{name:'武学理解',targets:[['ji','shi',1,200],['stats','wis',48,5]],use:'悟性、武学常识与功法属性门槛'},
 medical_notes:{name:'医案记录',targets:[['medicine','yi',2,100]],use:'医术；队伍最高医术每2点提高药效1%'},
 herbs:{name:'辨药',targets:[['medicine','yi',3,100]],use:'医术与药圃收成'},
 cooking:{name:'炊事',targets:[['craft','food',40,2]],use:'每40点制干粮额外1份，最多额外2份'},
 sewing:{name:'缝补',targets:[['craft','pouch',40,2]],use:'每40点制布包额外1个，最多额外2个'},
 travel:{name:'行路',targets:[['bonuses','spd',40,3]],use:'负重行路与行动顺序'},
 correspondence:{name:'通信旧记录',targets:[],use:'信件、回物与实际人物关系；不再新发通信点'},
 qh_staff:{name:'护路棍法',targets:[],use:'已有护路棍法招式熟练，须有陆衡教学'}
};
const labels={atk:'攻击',棍:'棍造诣',mhp:'气血上限',mmp:'内力上限',crit:'暴击',dodge:'闪避',spd:'身速',con:'根骨',agi:'身法',wil:'定力',wis:'悟性',str:'臂力',yi:'医术',shi:'武学常识',food:'干粮额外产量',pouch:'布包额外产量','剑':'剑造诣','拳':'拳造诣'};
const courses={sword:{action:'K01',skillId:'gy_s1',systemId:'system_gy_foundation_s',name:'试锋剑法',move:'试锋探路'},fist:{action:'K02',skillId:'gy_p1',systemId:'system_gy_foundation_p',name:'守拙拳法',move:'守拙立桩'},breathing:{action:'B01',skillId:'tuna',systemId:'xf_tuna',name:'吐故纳新篇'}};
function counters(s,actions=[]){const values={...s.progress},seen=new Set(),fromHistory={};for(const h of s.history||[]){if(!h.id||seen.has(h.id))continue;seen.add(h.id);const key=h.gainKey||actions.find(a=>a.id===h.action)?.gain;if(!key||!Number.isFinite(h.gain)||h.gain<0)continue;fromHistory[key]=(fromHistory[key]||0)+h.gain;}
 // Do not add history on top of existing counters. Restore only a missing field.
 for(const[k,v]of Object.entries(fromHistory))if(values[k]===undefined)values[k]=v;
 return Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Math.max(0,Number(v)||0)]));}
function progress(s,actions=[]){const values=counters(s,actions);values.observation=(values.observation||0)+(values.listening||0);return values;}
function legacyGrowth(s,actions=[]){const p=progress(s,actions),g={version:1,counts:{},progress:p,stats:{str:0,con:0,agi:0,wil:0,wis:0},bonuses:{mhp:0,mmp:0,atk:0,spd:0,crit:0,dodge:0},ji:{yi:0,shi:0},zy:{剑:0,拳:0},craft:{food:0,pouch:0},medicine:{yi:0},martial:{}};
 const seen=new Set();for(const h of s.history||[]){if(!h.id||seen.has(h.id)||h.period<0)continue;seen.add(h.id);g.counts[h.action]=(g.counts[h.action]||0)+1;}
 for(const[k,r]of Object.entries(legacyRules))for(const[group,target,step,cap]of r.targets)g[group][target]=(g[group][target]||0)+Math.min(cap,Math.floor((p[k]||0)/step));
 g.ji.yi=Math.min(100,g.medicine.yi);g.stats.str=Math.min(5,Math.floor(((p.sword||0)+(p.fist||0))/48));
 for(const[key,c]of Object.entries(courses)){if(!s.learned?.[key])continue;const cap=key==='breathing'?2:3,maximum=cap===2?75:125,xp=Math.min(maximum,Math.max(0,Math.round(((p[key]||0)-8)*25/8)));const legacyXP=Math.min(maximum,Math.max(0,(g.counts[c.action]||0)-1)*25),effective=Math.max(xp,legacyXP);g.martial[key]={...c,xp:effective,level:cap===2?(effective>=75?2:1):(effective>=125?3:effective>=50?2:1),cap};}
 return g;}
const rules=B.rules;
function ensure(s,actions=[]){if(s.balanceVersion===B.version)return s;
 if(s.pending&&!s.pending.balanceVersion)s.pending.legacyBalance=true;const old=legacyGrowth(s,actions),has=(s.history||[]).length||Object.values(s.progress||{}).some(n=>n>0);
 s.balanceLegacy=has?{stats:old.stats,bonuses:old.bonuses,ji:old.ji,zy:old.zy,craft:old.craft}:null;
 s.progress=Object.fromEntries(Object.entries(counters(s,actions)).map(([k,v])=>[k,Math.round(v*(B.legacyScale[k]||1))]));
 // Missing old fields are sealed before the new units start accumulating.
 for(const k of Object.keys(rules))s.progress[k]??=0;
 s.martialXp||={};for(const [key,m]of Object.entries(old.martial)){const a=B.library.arts.find(a=>a.key===key);s.martialXp[a.id]=Math.max(s.martialXp[a.id]||0,B.thresholds(a)[m.level-1]);}
 s.balanceVersion=B.version;return s;}
function growth(source,actions=[]){const s=source.balanceVersion===B.version?source:ensure(JSON.parse(JSON.stringify(source)),actions),p=progress(s,actions),g={version:2,counts:{},progress:p,stats:{str:0,con:0,agi:0,wil:0,wis:0},bonuses:{mhp:0,mmp:0,atk:0,spd:0,crit:0,dodge:0},ji:{yi:0,shi:0},zy:{剑:0,拳:0,棍:0},craft:{food:0,pouch:0},medicine:{yi:0},martial:{}};
 const seen=new Set();for(const h of s.history||[]){if(!h.id||seen.has(h.id)||h.period<0)continue;seen.add(h.id);g.counts[h.action]=(g.counts[h.action]||0)+1;}
 for(const[k,r]of Object.entries(rules))for(const[group,target,step,limit]of r.targets)g[group][target]=(g[group][target]||0)+Math.min(limit,Math.floor((p[k]||0)/step));
 g.ji.yi=Math.min(100,g.medicine.yi);g.stats.str=Math.min(9,Math.floor(((p.sword||0)+(p.fist||0))/750));
 for(const group of ['stats','bonuses','ji','zy','craft'])for(const[k,v]of Object.entries(s.balanceLegacy?.[group]||{}))g[group][k]=Math.max(g[group][k]||0,v);
 for(const a of B.library.arts){if(!s.learned?.[a.key])continue;const level=B.level(s,a),cap=B.cap(s,a),xp=s.martialXp?.[a.id]||0;g.martial[a.key]={...a,skillId:a.moves[0]?.id||a.id,systemId:a.id,xp,level,cap,prof:Math.max(0,xp-B.thresholds(a)[level-1]),maximum:B.thresholds(a)[cap-1]};}
 return g;}
function reconcile(world,actions=[]){const s=world.cultivation;if(!s)return;ensure(s,actions);
 const applied=world.cultivationGrowthApplied||{stats:{},ji:{},zy:{}};s.trainingBaseStats=Object.fromEntries(['str','con','agi','wil','wis'].map(k=>[k,(world.st?.[k]??3)-(applied.stats?.[k]||0)]));
 world.skills||={};if(world.skills.guiyun_sword){const old=world.skills.guiyun_sword;world.skills.gy_s1=Math.max(world.skills.gy_s1||0,old);for(const field of ['prof','profNote'])if(world[field]?.guiyun_sword!==undefined){world[field].gy_s1=Math.max(world[field].gy_s1||0,world[field].guiyun_sword);delete world[field].guiyun_sword;}for(const field of ['load','skSeen'])if(world[field])world[field]=[...new Set(world[field].map(k=>k==='guiyun_sword'?'gy_s1':k))];delete world.skills.guiyun_sword;}
 if(!s.balanceWorldImported){for(const a of B.library.arts){if(!s.learned[a.key])continue;let n=a.type==='inner'?(world.xinfa?.lv?.[a.id]||1):Math.max(1,...a.moves.map(m=>world.skills[m.id]||1));if(a.key==='fist'&&growth(s,actions).counts.K02)n=Math.max(n,Math.min(3,world.skills.fist||1));if(n>B.cap(s,a)){s.balanceLegacyCaps||={};s.balanceLegacyCaps[a.id]=Math.min(B.thresholds(a).length,n);}n=Math.min(B.cap(s,a),n);const t=B.thresholds(a),oldProf=a.type==='inner'?0:Math.max(0,...a.moves.map(m=>world.prof?.[m.id]||0));s.martialXp[a.id]=Math.min(t[B.cap(s,a)-1],Math.max(s.martialXp[a.id]||0,t[n-1]+oldProf));}s.balanceWorldImported=true;}
 const g=growth(s,actions);
 for(const[group,field]of [['stats','st'],['ji','ji'],['zy','zy']]){world[field]||={};for(const[k,v]of Object.entries(g[group]))world[field][k]=(world[field][k]??(group==='stats'?3:0))+v-(applied[group]?.[k]||0);}
 world.cultivationGrowthApplied={version:2,stats:{...g.stats},ji:{...g.ji},zy:{...g.zy}};
 world.prof||={};for(const [key,m]of Object.entries(g.martial)){if(typeof s.learned[key]!=='object')s.learned[key]={source:'旧存档教学记录'};Object.assign(s.learned[key],{skillId:m.skillId,systemId:m.systemId});if(m.type==='inner'){const x=world.xinfa||={known:[],lv:{},prog:{},main:null,subs:[]};x.known||=[];x.lv||={};x.prog||={};if(!x.known.includes(m.id))x.known.push(m.id);x.lv[m.id]=m.level;x.prog[m.id]=m.prof;if(!x.main&&m.id==='tuna')x.main='tuna';continue;}
  for(const move of m.moves)if(m.level>=move.unlock_level){world.skills[move.id]=m.level;world.prof[move.id]=m.prof;}
 }
 return g;}
function hints(s,key,actions=[]){const g=growth(s,actions),r=rules[key];if(!r)return '';const value=g.progress[key]||0,segments=r.targets.map(([group,k,step,cap])=>{const own=Math.min(cap,Math.floor(value/step));return own>=cap?labels[k]+'培养已满':`再积累${step-value%step}${['foundation','coordination','footwork','breathing','observation','sword','fist'].includes(key)?'经验':'点'}，${labels[k]}+1${['crit','dodge'].includes(k)?'%':''}`;});if(['sword','fist'].includes(key)){const total=(g.progress.sword||0)+(g.progress.fist||0);segments.push(total>=6750?'臂力培养已满':`剑拳合计再积累${750-total%750}经验，臂力+1（攻击+3）`);}return segments.length?segments.join('；'):r.use;}
function outcome(before,after){const out=[];for(const group of ['stats','bonuses','ji','zy','craft'])for(const[k,v]of Object.entries(after[group]||{})){const old=before[group]?.[k]||0;if(v!==old)out.push({group,key:k,name:labels[k]||k,before:old,after:v,delta:v-old,unit:['crit','dodge'].includes(k)?'%':''});}return out;}
const api={rules,labels,courses,counters,progress,growth,reconcile,hints,outcome,ensure,legacyGrowth};if(typeof module==='object'&&module.exports)module.exports=api;else root.CultivationGrowth=api;
})(typeof globalThis!=='undefined'?globalThis:this);
