'use strict';
// Choose a journey before loading it. A fresh prologue never overwrites an old run.
(()=>{
 const original='xjh.qihe-prologue.v2',latest='xjh.qihe-prologue.latest.v1';
 const validKey=k=>k===original||/^xjh\.qihe-prologue\.v2\.run\.[a-z0-9-]{8,64}$/.test(k||'');
 function read(key){if(!validKey(key))return null;try{const s=JSON.parse(localStorage.getItem(key));return s?.prologue?.version===2&&SC[s.scene]&&!s.qiheSave?.archivedAt?s:null}catch{return null}}
 function runs(){let current=saveKey(),recent;try{recent=localStorage.getItem(latest)}catch{}
  return [...new Set([qiheJourneyId()?current:recent,current,original])].map(key=>({key,state:read(key)})).filter(r=>r.state);
 }
 function description(s){return(window.QiheMilestones?.latest(s)||'初到栖河')+' · '+SC[s.scene].name}
 const url=key=>(location.pathname||'/index.html')+'?v=qihe-saves-20261006'+(key===original?'':'&journey='+key.slice(original.length+5))+'&play=1#qihe-map';
 function newJourneyURL(){let id;do{id=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}while(localStorage.getItem(qiheJourneySaveKey(id)));return url(qiheJourneySaveKey(id))}
 const review=()=>isQiheUIReview()||isQiheBattleReview()||isQiheStoryReview()||new URLSearchParams(location.search).has('chapterPresentationReview');
 function render(){mode='title';busy=false;keys={};$('hud').hidden=true;document.title='小江湖 · 栖河试玩 · 四向地图版';
  const p=openPanel('plain'),saved=runs();panelClose=null;p.classList.add('qihe-startup');
  p.innerHTML=`<div class="tt"><div class="logo">小江湖</div><div class="qihe-start-version">栖河试玩 · 四向地图版</div><div class="qihe-start-note">从后山初遇，走入栖河与归云谷。</div><div class="menu"><button id="qh-new-journey" class="pri">从头开始</button>${saved.map((r,i)=>`<button id="qh-continue-${i}">${i===0?'继续进度':r.key===original?'继续原有进度':'继续另一旅程'}<small>${esc(description(r.state))}</small></button>`).join('')}</div><div class="foot">从头开始保留现有进度 · 新旅程自动保存</div></div>`;
  $('qh-new-journey').onclick=()=>location.assign(newJourneyURL());
  saved.forEach((r,i)=>{$('qh-continue-'+i).onclick=()=>location.assign(url(r.key))});
  $('qh-new-journey').focus();
 }
 function start(){if(review())return qiheTrialStart();
  if(new URLSearchParams(location.search).get('play')==='1'){
   let raw;try{raw=localStorage.getItem(saveKey())}catch{}
   if(!raw||read(saveKey()))return qiheTrialStart();
   render();toast('这份进度暂时无法读取，原记录已保留。可开始新旅程。',3200);return;
  }
  render();
 }
 window.QiheEntry={start,runs,read,description,newJourneyURL,url};
})();
