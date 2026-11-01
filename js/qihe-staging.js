'use strict';
// 2026-11-01 按站位表摆人（表见 qihe-staging-data.js，说明见 docs/updates/2026-11-01-staging.md）。
// 只动显示：不写存档，戏演完 NPC 回平时站位，萧白留在戏里的位置。
(()=>{
 if(!isQiheEntry())return;
 const T=window.QIHE_STAGING,ALIAS={蔺管事:'算命先生',算命先生:'蔺管事',阿炭:'新来的',新来的:'阿炭'},WHEN={firstNight:()=>!S?.qiheChapter};
 const keyOf={};for(const[key,e]of Object.entries(T.scenes))for(const k of e.knots)keyOf[k]=key;
 const offstageKnots=new Set(T.offstage);
 let active=null,pending=null,lastGo=0,muted=0;
 const named=(n,name)=>n.name===name||n.name===ALIAS[name];
 const node=(name,[x,y,dir])=>({id:'staged-'+name,name,sp:QiheChapter.spriteFor(name),x:x/TS,y:y/TS,dir,fixed:true,idle:false,cast:true,act:async()=>{}});
 function mount(name){const e=active,v=e.entry.cast[name];if(!v||e.placed.has(name)||window.QiheOffstage?.has(name))return;e.placed.add(name);e.sc.npcs=[...e.sc.npcs.filter(n=>!n.sp||!named(n,name)),node(name,v)];e.sc._npcs=npcsOf(e.sc)}
 function restore(){const e=active;if(!e)return;active=null;e.sc.npcs=e.original;e.sc._npcs=npcsOf(e.sc)}
 // 人离戏位远就黑场切过去，刚切图过来的不再黑一次
 async function apply(key){const entry=T.scenes[key];restore();const sc=cur,hero=entry.hero,far=hero&&Math.hypot(hero[0]-player.x,hero[1]-player.y)>70&&Date.now()-lastGo>900;
  const put=()=>{active={key,entry,sc,original:sc.npcs,placed:new Set()};for(const[name,v]of Object.entries(entry.cast))if(v[3]!=='late')mount(name);if(hero){player.x=hero[0];player.y=hero[1];player.dir=hero[2];player.path=null;player.goal=null;player.talkTo=null;if(typeof snapCam==='function')snapCam()}};
  if(far)await fade(put);else put()}
 async function within(key,fn){const entry=T.scenes[key],was=active?.key,outer=pending;if(was===key)return fn();pending=key;try{if(S.scene===entry.at)await apply(key);return await fn()}finally{if(pending===key)pending=outer;if(active?.key===key)restore()}}
 {const prev=StoryRuntime.play;StoryRuntime.play=(knot,opts)=>{const key=keyOf[knot];if(key)return within(key,()=>prev(knot,opts));if(offstageKnots.has(knot)){muted++;return Promise.resolve(prev(knot,opts)).finally(()=>muted--)}return prev(knot,opts)}}
 {const prev=goScene;goScene=async function(...a){restore();const r=await prev.apply(this,a);lastGo=Date.now();if(pending&&T.scenes[pending].at===S.scene)await apply(pending);return r};window.goScene=goScene}
 // 萧白转向说话人；“late”的人第一次开口才上图
 function look(who){if(!who||!cur||who===(S?.name||'萧白'))return;const base=String(who).split(' · ')[0];if(active?.entry.cast[base]&&!active.placed.has(base))mount(base);if(muted)return;const n=(cur._npcs||[]).find(x=>x.sp&&named(x,base));if(n&&Math.hypot(n.x*TS-player.x,n.y*TS-player.y)<420)player.dir=faceTo(n.x*TS-player.x,n.y*TS-player.y)}
 {const prevSay=say;say=function(who,...a){look(who);return prevSay.call(this,who,...a)};window.say=say;}
 // 平时站位：同一个 NPC 取第一条条件满足的规则
 const rules=new Map();for(const r of T.rest){const k=r.at;if(!rules.has(k))rules.set(k,[]);rules.get(k).push(r)}
 function applyRest(sc){const id=Object.keys(SC).find(k=>SC[k]===sc),list=rules.get(id);if(!list)return;for(const n of sc.npcs||[]){if(n.id?.startsWith('staged-')||n._rested===undefined&&!list.some(r=>r.id===n.id))continue;
   if(n._rested===undefined){n._rested={x:n.x,y:n.y,dir:n.dir,show:n.show};n.show=()=>{const r=ruleFor(id,n.id);return !r?.hide&&(!n._rested.show||n._rested.show())}}
   const r=ruleFor(id,n.id),b=n._rested;n.x=r?.x!=null?r.x/TS:b.x;n.y=r?.y!=null?r.y/TS:b.y;n.dir=r?.dir||b.dir;if(r?.talkR)n.talkR=r.talkR}}
 const ruleFor=(id,nid)=>(rules.get(id)||[]).find(r=>r.id===nid&&(!r.when||WHEN[r.when]()));
 {const prev=npcsOf;npcsOf=function(sc){applyRest(sc);return prev(sc)};window.npcsOf=npcsOf}
 window.QiheStaging={hold:within,active:()=>!!active,table:T,knotScene:k=>keyOf[k]||null};
})();
