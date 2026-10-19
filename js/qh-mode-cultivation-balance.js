/* CH2-BALANCE-2. Numbers are shared by actions, menus, battle, docs and simulations. */
(function(root){'use strict';
const L=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-library.js'):root.CultivationLibrary;
const curves={A:[0,25,75,150,250,375,525,700,900,1150],B:[0,25,75,175,325,525,775,1075,1425,1850],C:[0,50,125,275,500,800,1175,1625,2150,2750]};
const moods=[{id:'happy',name:'高兴',min:80,index:5},{id:'comfortable',name:'舒畅',min:60,index:4},{id:'calm',name:'平静',min:40,index:3},{id:'low',name:'低落',min:20,index:2},{id:'annoyed',name:'烦躁',min:0,index:1}];
const rules={
 foundation:{name:'基础经验',targets:[['bonuses','mhp',16,160],['stats','con',1200,7]],use:'气血、根骨；根骨同时增加防御与格挡'},
 coordination:{name:'协调经验',targets:[['bonuses','atk',120,10],['bonuses','dodge',240,4]],use:'攻击与闪避'},
 footwork:{name:'步法经验',targets:[['stats','agi',1000,9],['bonuses','spd',300,4]],use:'身法、身速、闪避与移动距离'},
 breathing:{name:'吐纳经验',targets:[['bonuses','mmp',20,100],['stats','wil',900,9]],use:'内力、定力；定力增加防御'},
 observation:{name:'察势经验',targets:[['bonuses','crit',180,10]],use:'暴击；听声和察势合并积累'},
 sword:{name:'剑路经验',targets:[['zy','剑',10,200]],use:'剑造诣每20点增伤1%；剑/拳合计每750经验臂力+1'},
 fist:{name:'拳路经验',targets:[['zy','拳',10,200]],use:'拳造诣每20点增伤1%；剑/拳合计每750经验臂力+1'},
 understanding:{name:'武学复盘',targets:[['ji','shi',1,200],['stats','wis',65,7]],use:'武学常识、悟性、学习效率、暴击与内力'},
 medical_notes:{name:'医案记录',targets:[['medicine','yi',2,100]],use:'医术；队伍最高医术每2点提高药物治疗1%'},
 herbs:{name:'辨药',targets:[['medicine','yi',3,100]],use:'医术与药圃实际采集'},
 cooking:{name:'炊事',targets:[['craft','food',40,2]],use:'每40点制作干粮额外1份，最多额外2份'},
 sewing:{name:'缝补',targets:[['craft','pouch',40,2]],use:'每40点制作布包额外1个，最多额外2个'},
 travel:{name:'行路',targets:[['bonuses','spd',24,2]],use:'行路熟练增加身速'},
 correspondence:{name:'往来记录',targets:[],use:'人物关系、来信与回物'},
 qh_staff:{name:'护路棍法笔记',targets:[['zy','棍',10,200]],use:'每期一份笔记熟练；与实战共用护路棍法进度'}
};
const legacyScale={foundation:6,coordination:8,footwork:7.5,breathing:3.75,observation:10,listening:10,sword:3.75,fist:3.75};
const artById=id=>L.arts.find(a=>a.id===id),artForAction=a=>L.arts.find(x=>x.action===(typeof a==='string'?a:a?.id)),artForSkill=id=>L.arts.find(a=>a.type==='external'&&a.moves.some(m=>m.id===id));
function mood(s){return moods.find(m=>(s.mood??60)>=m.min);}
function thresholds(a){const c=curves[a.curve];return a.type==='inner'?[c[0],c[2],c[4],c[6],c[9]]:c;}
function cap(s,a){if(s.balanceLegacyCaps?.[a.id])return Math.max(s.balanceLegacyCaps[a.id],s.month<=5?(a.type==='inner'?2:3):(a.type==='inner'?5:10));if(a.grade==='丁'&&s.month<=5)return a.type==='inner'?2:3;return a.type==='inner'?5:10;}
function level(s,a){const xp=s.martialXp?.[a.id]||0,t=thresholds(a);return Math.min(cap(s,a),1+t.slice(1).filter(n=>xp>=n).length);}
function stats(s){const p=s.progress||{},b=s.trainingBaseStats||{str:3,con:3,agi:3,wil:3,wis:3},v={str:Math.min(9,Math.floor(((p.sword||0)+(p.fist||0))/750)),con:0,agi:0,wil:0,wis:0};for(const [k,r]of Object.entries(rules))for(const [g,t,n,c]of r.targets)if(g==='stats')v[t]+=Math.min(c,Math.floor((p[k]||0)/n));return Object.fromEntries(Object.keys(v).map(k=>[k,(b[k]??3)+Math.max(v[k],s.balanceLegacy?.stats?.[k]||0)]));}
function efficiency(s){return Math.min(10,stats(s).wis)+Math.min(10,Math.floor(Math.min(200,s.progress?.understanding||0)/20))+mood(s).index;}
function preview(s,a,first=false,fg=null){const e=efficiency(s),key=fg?.gain||a.gain,art=artForAction(a);let gain=0,coefficient=0;
 if(a.once||a.visitor||a.auto)gain=fg?Math.round(fg.amount*(legacyScale[key]||1)):(a.amount||0);
 else if(a.id==='QH01'){coefficient=.4;gain=Math.round(e*2);}
 else if(a.id==='W04'){coefficient=1.4;gain=Math.round(e*7);}
 else if(a.category==='basic'){coefficient=['B03','B04'].includes(a.id)?1.6:(a.id==='B01'||art?.type==='inner')?1:2;gain=Math.round(5*e*coefficient);}
 else if(a.category==='skill'){coefficient=1;gain=5*e;}
 else if(a.category==='arts'){coefficient=1;gain=e;}
 else if(a.category==='production'){coefficient=.7;gain=Math.round(e*.7);}
 else if(a.category==='chores'){coefficient=a.id==='D01'?.2:.4;gain=Math.round(e*coefficient);}
 return {gain,key,efficiency:e,mood:mood(s),coefficient,artId:art?.id||null,xp:art&&!first?(a.id==='QH01'?gain:5*e):0};}
function addXp(s,id,raw){const a=artById(id);if(!a||!s.learned?.[a.key]||!Number.isFinite(raw)||raw<0)return null;s.martialXp||={};const prior=s.martialXp[id]||0,before=level(s,a),maximum=thresholds(a)[cap(s,a)-1];s.martialXp[id]=Math.min(maximum,Math.round((prior+raw)*10)/10);return {id,before,after:level(s,a),gain:s.martialXp[id]-prior};}
function grantLevel(s,id){const a=artById(id);if(!a)return null;const n=level(s,a);if(n>=cap(s,a))return null;return addXp(s,id,thresholds(a)[n]-(s.martialXp[id]||0));}
function gate(s,a){const art=artForAction(a);if(a.id==='QH01'&&s.history.some(h=>h.period===(s.month-1)*5+s.phase&&h.action==='QH01'))return'本期笔记已复盘，下期再来。';if(!art||s.learned[art.key])return'';if(s.month<art.month)return`《${art.name}》最早在第${art.month}个月传授。`;
 if(art.type==='external'&&art.grade!=='丁'&&art.id!=='qh_hulu_staff'&&s.facts.gy_martial_major?.path!==(art.path==='剑'?'sword':'fist'))return'须先选定对应主修路线。';
 if(art.prerequisite){const p=artById(art.prerequisite.art_id);if(!s.learned[p?.key]||level(s,p)<art.prerequisite.level)return`先把《${p?.name}》练到${art.prerequisite.level}${p?.type==='inner'?'层':'重'}。`;}
 if(art.grade==='乙'&&!s.facts.gy_year_exam_seen)return'先完成第一年的师门考校。';
 const st=stats(s);for(const [k,v]of Object.entries(art.learn_req||{}))if((st[k]||0)<v)return`根基不足：${({str:'臂力',con:'根骨',agi:'身法',wil:'定力',wis:'悟性'})[k]}需${v}，当前${st[k]||0}。`;return'';}
function courseHint(s,a){const r=preview(s,a,!!a.learn&&!s.learned[a.learn]),art=artForAction(a);let text=`本次${rules[r.key]?.name||'成果'} +${r.gain}（学习效率${r.efficiency}）`;
 if(art){if(!s.learned[art.key])return text+`；首次传授学会《${art.name}》一${art.type==='inner'?'层':'重'}`;const n=level(s,art),t=thresholds(art),xp=s.martialXp?.[art.id]||0,c=cap(s,art);text+=`；《${art.name}》${n}${art.type==='inner'?'层':'重'}，熟练${xp}/${t[c-1]}`;if(n<c)text+=`；距下一${art.type==='inner'?'层':'重'}${Math.max(0,Math.round((t[n]-xp)*10)/10)}经验，按当前效率约${Math.ceil((t[n]-xp)/Math.max(1,r.xp))}次`;else text+=c<t.length?'；当前授课已满，六月后继续':'；已练满，根基训练仍有效';}return text;}
function mastery(k,n){const a=artForSkill(k);return n>=10&&a?.mastery?.move_ids?.includes(k)?a.mastery.effect:{};}
function upgradeReason(s,id){const a=artById(id)||artForSkill(id);if(!a||!s.learned?.[a.key])return'尚未受教';const n=level(s,a);return n>=cap(s,a)?(cap(s,a)<thresholds(a).length?'已达当前授课上限，六月后继续修习':'已练满'):'';}
function install(D){for(const a of D.actions){a.legacyAmount=a.amount||0;a.legacyGain=a.gain;if(a.id==='B04')a.gain='coordination';if(a.once||a.visitor||a.auto)a.amount=Math.round((a.amount||0)*(legacyScale[a.gain]||1));}for(const[k,v]of Object.entries(rules))D.progressNames[k]=v.name;
 for(const art of L.arts){if(['K01','K02','B01','QH01'].includes(art.action))continue;const fist=art.path!=='剑',alias=art.type==='inner'?'B01':fist?'K02':'K01';D.actions.push({id:art.action,category:art.type==='inner'?'basic':'skill',name:art.name,teacher:art.id==='art_gy_p2'?'殷红缨':'周砚',place:art.type==='inner'?'竹径':'练武场',requires:['stance'],learn:art.key,gain:art.type==='inner'?'breathing':fist?'fist':'sword',amount:0,artAlias:alias,task:`正式受教《${art.name}》，首次学会后才能独练；${art.grade}级，使用已有招式。`,feedback:`《${art.name}》的起手与收势已经练过。`,beats:[`${art.id==='art_gy_p2'?'殷师叔':'师父'}把《${art.name}》的起手放慢，让你跟着走了一遍。`,'本次只练已受教的部分，进度与实战共用。']});}
}
const api={version:2,curves,moods,rules,legacyScale,library:L,artById,artForAction,artForSkill,mood,thresholds,cap,level,stats,efficiency,preview,addXp,grantLevel,gate,courseHint,install,upgradeReason,mastery};if(typeof module==='object'&&module.exports)module.exports=api;else root.CultivationBalance=api;
})(typeof globalThis!=='undefined'?globalThis:this);
