/* First-year departure scripts and transactions. Pure state; no DOM/storage. */
(function(root){'use strict';
const D=typeof module==='object'&&module.exports?require('./qh-pre-hangao-data'):root.PreHangaoData;
const copy=x=>JSON.parse(JSON.stringify(x)),by=Object.fromEntries(D.scenes.map(s=>[s.id,s]));
function extra(s){const f=s.facts||{};return {preHangao:{facts:copy(f),weapon:s.preHangao?.weapon||null,
 pei:f.gn_chests_choice==='own'?'close':f.gn_lamp_seen?'known':'new',participants:copy(s.preHangao?.participants||[]),route:s.learned.sword?'sword':s.learned.fist?'fist':'life'}};}
function context(c){return {route:c.preHangao?.route||(c.sword?'sword':c.fist?'fist':'life'),pei:c.preHangao?.pei||(c.pei?.chests==='own'?'close':'new'),
 delivery:c.delivery||c.first_delivery?.method||null,injury:c.opening?.chen_injury||'unknown',weapon:c.preHangao?.weapon?'ready':'missing',footwork:!!c.footwork};}
function match(b,c){if(b.when&&!Object.entries(b.when).every(([k,v])=>Array.isArray(v)?v.includes(c[k]):v===c[k]))return false;
 if(!b.contextIndices)return true;
 const i=D.contexts.findIndex(t=>{const a=t.split('／'),skills=a[4];return a[0]==='未成年'&&a[1]==='关系0'&&a[2]===c.injury&&a[3]==='送药'+(c.delivery||'未发生')&&skills.includes('剑')===(c.route==='sword')&&skills.includes('拳')===(c.route==='fist')&&skills.includes('步法')===c.footwork;});
 return b.contextIndices.includes(i);}
function apply(id,base,c0){const s=by[id];if(!s)return base;const c=context(c0),line=b=>({...copy(b),place:s.place,time:s.time,
 text:b.text,speaker:b.speaker,cast:b.cast||s.cast});
 const opening=s.opening.filter(b=>match(b,c)).map(line),ending=s.ending.filter(b=>match(b,c)).map(line);
 for(const [i,l]of (s.letters||[]).entries())opening.push({speaker:'narrator',text:l.text,letterAuthor:l.author,cast:s.cast,place:s.place,time:s.time,id:id+':letter:'+i});
 let choices=s.choices.filter(ch=>match(ch,c)&&ch.lines.some(l=>match(l,c))).map(ch=>({key:ch.id,text:ch.label,lines:ch.lines.filter(l=>match(l,c)).map(line),effects:base?.choices?.find(x=>x.key===ch.id)?.effects||[]}));
 if(id==='gn_depart'){
  choices=s.productionChoices.map(ch=>({...copy(ch),lines:ch.lines.map(line)}));
 }
 if(!choices.length){const all=[...opening,...ending];return {intro:all.slice(0,-2),choices:[{key:'linear',text:'',auto:true,lines:[all.at(-2)],effects:base?.choices?.[0]?.effects||[]}],closing:[all.at(-1)]};}
 if(!ending.length)ending.push({speaker:'narrator',text:'……',cast:s.cast,place:s.place,time:s.time});
 return {intro:opening,choices,closing:ending};}
function definitions(list){
 for(const d of list){const s=by[d.id];if(s){Object.assign(d,{name:s.name,cast:s.cast,place:s.place,time:s.time});}
  if(['gy_spar_dou','gy_fang_spar','gy_spar_zhong'].includes(d.id))for(const foe of d.fight?.foes||[]){const level={c_gy_luxiaodou:10,c_gy_fangchi:36,c_gy_zhongzhuo:80}[foe.sp];if(level){foe.worldLevel=level;foe.teachingStatsLevel=foe.lv;}}
  if(d.id==='gy_m08')d.factRequires=['gn_depart_seen'];
  if(d.id==='gy_m09'){d.hidden=true;d.auto=false;}
  if(d.id==='gn_depart'){d.auto=true;d.window=[19,19];d.relNeed=null;d.factRequires=[];}
  if(d.id==='gy_zhou_test'){d.needSkill=false;d.training=true;d.fight=false;}
 }
 for(const s of D.scenes.filter(s=>s.status==='新增候选'))list.push({id:s.id,name:s.name,cast:s.cast,place:s.place,time:s.time,window:s.window,
  auto:true,main:true,actor:s.cast.find(k=>k!=='hero'),teacher:'师门',gain:'understanding',amount:0,requires:['joined'],factRequires:s.requires,
  ...(['hg_road','hg_gate'].includes(s.id)?{storyMode:'journey_ready'}:{})});
 const rank={gn_depart:1,gy_m08:2,hg_farewell:3,hg_road:4,hg_gate:5};
 list.sort((a,b)=>a.window[0]-b.window[0]||(rank[a.id]||0)-(rank[b.id]||0));
}
function effects(s,p,key){const f=s.facts;
 if(p.action==='gy_m07'){f.xiangyang_invitation=true;f.hangao_invitation=true;}
 if(p.action==='gy_m08')f.departure_goals=true;
 if(p.action==='gn_depart'){f.gy_pei_join||={period:p.period};f.pei_party_preference=key==='roster'?'roster':'join';}
 if(p.action==='hg_aftercare')f['hg.pre.qihe_letters_read']=true;
 if(p.action==='hg_trace_reply')f['hg.pre.inquiry_contact']='hangao_clinic';
 if(p.action==='hg_pack_review'){f['hg.pre.loadout_checked']=true;if(p.visitor.context.preHangao?.route==='sword'&&!p.visitor.context.preHangao.weapon)f['hg.pre.loan_request']=true;}
 if(p.action==='hg_farewell')f['hg.pre.farewell_seen']=true;
 if(p.action==='hg_road'){f['hg.pre.road_help']=key;s.preHangao||={};s.preHangao.roadParticipants=copy(p.visitor.context.preHangao?.participants||[]);}
 if(p.action==='hg_gate')f['hg.pre.gate_handoff']=true;
}
function due(s,actions,availability){if(!s.joined||s.pending||s.summary||s.month>5)return null;const slot=(s.month-1)*5+s.phase;
 return actions.find(a=>a.auto&&!a.hidden&&!(a.id==='gy_m05'&&s.facts.first_delivery)&&!s.facts[a.once]&&slot>=a.window[0]&&(!a.main&&slot>a.window[1]?false:true)&&!availability(s,{...a,window:undefined}))||null;}
function advanceGate(s,actions,availability){const d=due(s,actions,availability);return d?'先完成'+d.name+'，再结束本期。':'';}
function lesson(s,a,first,before,after){const id={B03:'lesson_stance',K01:'lesson_sword',K02:'lesson_fist',B01:'lesson_breath',B02:'lesson_footwork',A03:'lesson_notes'}[a.id];
 const l=D.lessons.find(l=>l.id===id);if(!l)return null;s.preHangao||={};const flags=s.preHangao.lessonMilestones||={};
 const milestone= a.id==='B03'?(s.progress.foundation||0)>=160:a.id==='B02'?(s.progress.footwork||0)>=300:a.id==='A03'?s.history.filter(h=>h.action==='A03').length>=3&&!!s.facts.herb_labels:
  a.id==='K01'?(after.martial?.sword?.level||0)>=2:a.id==='K02'?(after.martial?.fist?.level||0)>=2:(after.martial?.breathing?.level||0)>=2;
 const kind=first?'first':milestone&&!flags[id]?'milestone':'repeat';if(kind==='milestone')flags[id]=true;
 return {id,kind,lines:copy(l[kind]),speaker:l.actor};}
const API={data:D,has:id=>!!by[id],context,extra,apply,definitions,effects,due,advanceGate,lesson};
if(typeof module==='object'&&module.exports)module.exports=API;else root.PreHangao=API;
})(globalThis);
