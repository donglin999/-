'use strict';
// Local Qihe journeys and immutable manual checkpoints. Review fixtures stay separate.
(()=>{
 const original='xjh.qihe-prologue.v2',slotPrefix=original+'.slot.';
 const isJourney=key=>key===original||/^xjh\.qihe-prologue\.v2\.run\.[a-z0-9-]{8,64}$/.test(key||'');
 const isSlot=key=>/^xjh\.qihe-prologue\.v2\.slot\.[a-z0-9-]{8,64}$/.test(key||'');
 const validKey=key=>isJourney(key)||isSlot(key);
 const clone=s=>JSON.parse(JSON.stringify(s));
 const valid=s=>s?.prologue?.version===2&&!!SC[s.scene];
 function read(key){if(!validKey(key))throw Error('不是本版本的正式存档');const s=JSON.parse(localStorage.getItem(key));if(!valid(s))throw Error('存档无法读取，原记录已保留');return s}
 const label=(key,s)=>s?.qiheSave?.name||(key===original?'原有旅程':isSlot(key)?'手动存档':'旅程 '+key.split('.').pop().slice(0,8));
 function list(){const rows=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!validKey(key))continue;try{const state=read(key);rows.push({key,state,name:label(key,state),manual:isSlot(key),current:key===saveKey(),archived:!!state.qiheSave?.archivedAt,savedAt:state.qiheSave?.savedAt||null})}catch{rows.push({key,name:label(key),invalid:true,current:key===saveKey()})}}
  return rows.sort((a,b)=>Number(b.current)-Number(a.current)||(Date.parse(b.savedAt)||0)-(Date.parse(a.savedAt)||0)||a.key.localeCompare(b.key));
 }
 function writable(){if(!isJourney(saveKey())||!isQiheEntry())throw Error('评审入口不能修改正式存档，请从首页进入游戏');if(!valid(S))throw Error('当前进度尚未就绪');if(!['scene','menu','panel'].includes(mode)||busy&&mode!=='menu'&&mode!=='panel'||dlgBusy)throw Error('当前剧情或战斗进行中，请结束后再操作')}
 function id(prefix){let key;do{key=prefix+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}while(localStorage.getItem(key));return key}
 function name(text){const n=String(text||'').trim();if(!n||n.length>24)throw Error('请输入1至24字的存档名称');return n}
 function live(){writable();return clone(S)}
 function saveCurrent(){const state=live();persistState(state);S=state;return{message:'已保存当前进度'}}
 function create(text){const state=live(),key=id(slotPrefix),now=new Date().toISOString();state.qiheSave={name:name(text),createdAt:now,savedAt:now};localStorage.setItem(key,JSON.stringify(state));return{key,message:'新存档已保存，原进度保留'}}
 function rename(key,text){writable();const state=key===saveKey()?live():read(key);state.qiheSave={...state.qiheSave,name:name(text)};localStorage.setItem(key,JSON.stringify(state));if(key===saveKey())S=state;return{message:'存档已重命名'}}
 function archive(key,restore=false){writable();if(key===saveKey())throw Error('当前旅程不能移入回收站');const state=read(key);state.qiheSave={...state.qiheSave};if(restore)delete state.qiheSave.archivedAt;else state.qiheSave.archivedAt=new Date().toISOString();localStorage.setItem(key,JSON.stringify(state));return{message:restore?'存档已恢复':'已移入回收站，可随时恢复'}}
 function load(key){writable();let state=read(key);if(state.qiheSave?.archivedAt)throw Error('请先在回收站恢复这份存档');if(key===saveKey())return{message:'正在游玩此旅程'};saveCurrent();let destination=key;
  if(isSlot(key)){destination=id(original+'.run.');state.qiheSave={name:label(key,state).slice(0,19)+' · 续玩',savedAt:new Date().toISOString()};localStorage.setItem(destination,JSON.stringify(state))}
  location.assign(QiheEntry.url(destination));return{navigating:true,message:'正在载入存档'};
 }
 const homeURL=()=>(location.pathname||'/index.html')+'?v=qihe-saves-20261006'+(qiheJourneyId()?'&journey='+qiheJourneyId():'')+'#qihe-map';
 function home(){saveCurrent();location.assign(homeURL());return{navigating:true,message:'进度已保存，返回首页'}}
 // Failures never claim success or navigate away. Metadata commits are single-record writes.
 function command(type,...args){try{const fn={save:saveCurrent,create,rename,archive,load,home}[type];if(!fn)throw Error('未知存档操作');return{ok:true,...fn(...args)}}catch(e){return{ok:false,reason:'操作未完成：'+(e.name==='QuotaExceededError'?'本地存储空间不足，请释放空间后重试':e.message||'浏览器无法保存，请重试')}}}
 window.QiheSaves={list,label,isJourney,homeURL,command};
})();
