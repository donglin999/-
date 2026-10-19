'use strict';
// Compare known journal facts; notices are session-only and never write a save.
(() => {
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const journal=window.QiheJournal;if(!journal)return;
 const pending=new Map(),duration=4800;
 let baseline=null,journey=null,timer=0,current=null,remaining=duration,until=0;
 const live=()=>typeof S!=='undefined'?S:null;
 const key=()=>typeof saveKey==='function'?saveKey():'';
 function snapshot(s){
  const quests=journal.tasks(s);
  return new Map(journal.people(s).map(p=>[p.id,{...p,facts:new Set([
   JSON.stringify(['profile',p.identity,p.bio,p.role,p.faction]),
   // Recording an old save's first location is metadata, not a new story event.
   ...p.events.map(e=>JSON.stringify(['event',e.text])),
   ...p.relations.map(r=>JSON.stringify(['relation',...r])),
   ...quests.filter(q=>q.people?.includes(p.id)).map(q=>JSON.stringify(['task',q.id,q.status,
    (q.progress||[]).filter(step=>step.done).map(step=>[step.title,step.detail]),q.paper?.fields||[]]))
  ])}]));
 }
 const element=()=>typeof document!=='undefined'?document.getElementById('qh-journal-notice'):null;
 function reset(s=live()){
  if(timer)clearTimeout(timer);timer=0;pending.clear();current=null;until=0;remaining=duration;
  const el=element();if(el)el.hidden=true;
  journey=key();baseline=s?.prologue?snapshot(s):null;
 }
 function schedule(){if(typeof document!=='undefined'&&!timer&&(pending.size||current))timer=setTimeout(()=>{timer=0;flush()},200)}
 function observe(s=live()){
  if(!s?.prologue){reset(s);return[]}
  if(journey!==key()||!baseline){reset(s);return[]}
  const next=snapshot(s),changes=[];
  for(const [id,p]of next){const old=baseline.get(id);
   if(!old||[...p.facts].some(fact=>!old.facts.has(fact))){
    const type=!old?'new':'updated';changes.push({id,name:p.name,type});
    // The first conversation often reveals identity too: keep one new-person card.
    pending.set(id,{...p,type:pending.get(id)?.type==='new'?'new':type});
   }
  }
  for(const id of pending.keys())if(!next.has(id))pending.delete(id);
  baseline=next;schedule();return changes;
 }
 function ready(){
  return typeof document!=='undefined'&&!document.hidden&&live()?.prologue&&
   typeof mode!=='undefined'&&mode==='scene'&&!(typeof busy!=='undefined'&&busy)&&
   !(typeof dlgBusy!=='undefined'&&dlgBusy)&&!window.QiheChapter?.running&&!window.QiheOutsiders?.running&&
   !window.DialogueStage?.snapshot?.scope&&document.getElementById('panel')?.hidden&&
   !document.getElementById('fade')?.classList.contains('on')&&
   !(typeof toastShowing!=='undefined'&&toastShowing);
 }
 const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function label(list){return list.length<=2?list.map(p=>p.name).join('、'):list[0].name+'等 '+list.length+' 人'}
 function dismiss(){const el=element();if(el)el.hidden=true;current=null;until=0;remaining=duration;schedule()}
 function view(){const id=current?.people[0]?.id;if(!id||element()?.hidden||!ready())return false;window.QiheJianghuUI?.openPerson(id);dismiss();return true}
 function render(){
  let el=element();if(!el){
   const game=document.getElementById('game');if(!game)return;
   el=document.createElement('aside');el.id='qh-journal-notice';el.className='qh-journal-notice';
   el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');
   game.appendChild(el);
   el.onclick=e=>{if(e.target.closest('[data-qjn="view"]'))view();else if(e.target.closest('[data-qjn="dismiss"]'))dismiss()};
  }
  const {people,type}=current,p=people[0],title=type==='new'?h('结识了'+label(people)):h(label(people)+'的')+'<span class="qhn-story">故事，又添一笔</span>';
  const image=p.art?`<span class="qhn-face ${p.full?'':'qhn-pixel'} ${p.id==='ye'?'qhn-ye':''}"><img src="${h(p.art)}" alt=""></span>`:'<span class="qhn-badge" aria-hidden="true"></span>';
  el.dataset.kind=type;el.dataset.people=people.map(p=>p.id).join(',');
  el.innerHTML=`${image}<div class="qhn-copy"><strong>${title}</strong><p>${type==='new'?'这段相识，已记入人物图鉴。':'最新见闻已记入人物图鉴。'}</p><button type="button" data-qjn="view" aria-label="查看${h(p.name)}人物图鉴">查看图鉴 <kbd>L</kbd><span aria-hidden="true"> ›</span></button></div><button type="button" class="qhn-dismiss" data-qjn="dismiss" aria-label="收起行记提示">×</button>`;
  el.hidden=false;
 }
 function flush(){
  if(journey!==key()||!live()?.prologue){reset();return}
  const el=element();
  if(!ready()){
   if(current&&until){remaining=Math.max(0,until-Date.now());until=0;if(el)el.hidden=true}
   schedule();return;
  }
  if(current){
   if(!until){until=Date.now()+remaining;if(el)el.hidden=false}
   if(Date.now()<until){schedule();return}
   if(el)el.hidden=true;current=null;remaining=duration;until=0;
  }
  if(pending.size){
   const type=[...pending.values()].some(p=>p.type==='new')?'new':'updated';
   const people=[...pending.values()].filter(p=>p.type===type).slice(0,3);
   for(const p of people)pending.delete(p.id);
   current={type,people};until=Date.now()+duration;render();
  }
  schedule();
 }
 window.QiheJournalNotices={reset,observe,flush,openCurrent:view,pending:()=>[...pending.values()].map(p=>({id:p.id,name:p.name,type:p.type})),version:1};
 // Observe actual conversations and normal checkpoints; menu readers stay pure.
 for(const name of ['say','choose']){
  const previous=window[name];if(typeof previous!=='function')continue;
  const wrapped=function(...args){observe();const result=previous.apply(this,args);observe();
   if(result?.then)result.then(()=>observe(),()=>observe());return result};
  if(name==='say'){say=wrapped;window.say=wrapped}else{choose=wrapped;window.choose=wrapped}
 }
 if(typeof loadSave==='function'){const previous=loadSave;loadSave=function(...args){const s=previous.apply(this,args);reset(s);return s};window.loadSave=loadSave}
 if(typeof persistState==='function'){const previous=persistState;persistState=function(s,...args){const result=previous.call(this,s,...args);if(s===live())observe(s);return result};window.persistState=persistState}
 if(typeof hud==='function'){const previous=hud;hud=function(...args){const result=previous.apply(this,args);observe();flush();return result};window.hud=hud}
})();
