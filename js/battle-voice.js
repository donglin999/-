'use strict';
// Event cues use confirmed static audio only; never call the casting service in game.
(()=>{
 const bank=window.GAME_BATTLE_VOICES?.characters||{},names={};
 for(const [id,c] of Object.entries(bank))for(const name of c.aliases||[c.name])names[name]=id;
 const priority={turn:1,hurt:2,attack:3,support:3,down:4},cooldown={turn:10000,attack:2000,support:2000,hurt:3000,down:0};
 const cache=new Map(),last=new Map(),variants=new Map();let current=null,pending=null,pendingTimer=0,serial=0,session=null,downed=new WeakSet(),turned=new WeakSet();
 const getBattle=()=>typeof B!=='undefined'?B:null;
 const now=()=>performance.now();
 function identity(u){
  if(!u||u.isHero||u.pet||u.key==='hero'||u.key==='dog')return null;
  const explicit=u.voiceCharacterId||u.key;
  if(bank[explicit])return explicit;
  const name=String(u.name||'').split(' · ')[0];
  return names[name]||null;
 }
 function eligible(){return getBattle()&&typeof mode!=='undefined'&&mode==='battle'&&window.__audio?.started&&!__audio.muted&&!document.hidden&&document.getElementById('dlg')?.hidden!==false}
 function clearPending(){clearTimeout(pendingTimer);pendingTimer=0;pending=null}
 function finish(token){
  if(current?.token!==token)return;
  const c=current;current=null;c.audio.pause();c.audio.onended=c.audio.onerror=null;
  if(c.duck)window.__audio?.voice(false);
 }
 function stop(){clearPending();if(current)finish(current.token)}
 function begin(b){stop();session=b;last.clear();variants.clear();downed=new WeakSet();turned=new WeakSet()}
 function play(request){
  if(!eligible()||request.session!==getBattle()||now()>request.expires)return false;
  const {cid,event}=request,cues=bank[cid]?.events?.[event];if(!cues?.length)return false;
  if(current){if(priority[event]<=priority[current.event])return false;finish(current.token)}
  const key=cid+':'+event,previous=variants.get(key),index=previous===undefined?Math.floor(Math.random()*cues.length):(previous+1)%cues.length;
  const line=cues[index];let audio=cache.get(line.url);
  if(!audio){audio=new Audio(line.url);audio.preload='auto';audio.hidden=true;audio.dataset.battleVoice=cid;audio.dataset.event=event;audio.dataset.line=line.id;cache.set(line.url,audio);(document.getElementById('game')||document.body).appendChild(audio)}
  audio.currentTime=0;audio.volume=.8;audio.playbackRate=1;audio.preservesPitch=true;
  const token=++serial;current={audio,token,cid,event,duck:true};window.__audio?.voice(true);
  audio.onended=audio.onerror=()=>finish(token);
  try{Promise.resolve(audio.play()).then(()=>{if(current?.audio!==audio||!eligible())audio.pause()}).catch(()=>finish(token))}catch(e){finish(token);return false}
  variants.set(key,index);last.set(cid+':'+(event==='support'?'attack':event),now());return true;
 }
 function emit(u,event){
  if(!eligible()||!(event in priority))return false;
  const b=getBattle();if(session!==b)begin(b);
  const cid=identity(u);if(!cid||!bank[cid]?.events?.[event]?.length)return false;
  if(event==='down'){if(downed.has(u))return false;downed.add(u)}
  else if(u.hp<=0)return false;
  if(event==='turn'){
   if(u.side!=='ally'||b.auto||u.stun||u.broken)return false;
   const first=!turned.has(u);turned.add(u);if(!first&&Math.random()>.55)return false;
  }
  if(event==='hurt'&&u.hp>u.mhp*.3&&Math.random()>.45)return false;
  const key=cid+':'+(event==='support'?'attack':event);
  if(last.has(key)&&now()-last.get(key)<cooldown[event])return false;
  const request={cid,event,session:b,expires:now()+(event==='hurt'?400:150)};
  if(current&&priority[event]<=priority[current.event]){
   // A short, expiring injury cue may follow the current shout; never queue turns/attacks.
   if(event==='hurt'&&!pending){pending=request;pendingTimer=setTimeout(()=>{
    const next=pending;clearPending();if(next&&!current&&now()<=next.expires)play(next);
   },300)}
   return false;
  }
  clearPending();return play(request);
 }
 const loop0=battleLoop;battleLoop=function(){begin(getBattle());return loop0.apply(this,arguments)};
 const turn0=allyTurn;allyTurn=function(u){emit(u,'turn');return turn0.apply(this,arguments)};
 const attack0=doAttack;doAttack=function(u){emit(u,'attack');return attack0.apply(this,arguments)};
 const skill0=doSkill;doSkill=function(u,k){
  if(!SKILLS[k]||(window.QiheUIModel&&u.side==='ally'&&QiheUIModel.skillWhy(u,k)))return skill0.apply(this,arguments);
  emit(u,SKILLS[k].heal||BSK[k]?.buff?'support':'attack');return skill0.apply(this,arguments);
 };
 const foe0=foeAct;foeAct=function(u){if(!u.intent?.charge&&aliveOf('ally').length)emit(u,'attack');return foe0.apply(this,arguments)};
 const hurt0=hurt;hurt=function(u){const before=u.hp,result=hurt0.apply(this,arguments);if(before>u.hp&&before>0)emit(u,u.hp<=0?'down':'hurt');return result};
 const tick0=tickBuffs;tickBuffs=function(u){const before=u.hp,result=tick0.apply(this,arguments);if(before>0&&u.hp<=0)emit(u,'down');return result};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 function frame(){if((current||pending)&&(!eligible()||session!==getBattle()))stop();requestAnimationFrame(frame)}requestAnimationFrame(frame);
 window.BattleVoice={emit,stop,identity,get current(){return current?{character:current.cid,event:current.event,line:current.audio.dataset.line}:null}};
})();
