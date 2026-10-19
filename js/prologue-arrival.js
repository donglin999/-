'use strict';
// OC-2026-10-04.3: fixed-foot backhill scene; P-01 water remains the sole story CG.
(() => {
let running=false,step=null,completion;
const checkpoint=()=>{S.x=player.x;S.y=player.y;save()};
function initial(legacy=false){return {version:1,stage:legacy?'done':'encounter',borrowed:legacy,originExpression:null,dogResult:null,greeted:{}}}
function state(){return PrologueVillage.state().arrival}
function mark(id){step=id;window.dispatchEvent(new CustomEvent('prologue-arrival-step',{detail:{id,stage:state().stage,borrowed:state().borrowed}}))}
async function line(id,who,text){mark(id);await say(who,text)}
// 2026-10-18 第 2 期：后山相遇、递水、遇狼的台词改由 ink 剧本提供（story/01-开始/序章-后山相遇.ink、序章-递水.ink、序章-遇狼.ink）。
// 这里只保留各场的游戏函数实现（站位、CG、战斗、存档）；台词、顺序、条件都以剧本为准，不要在 JS 里再写台词。
const backhill={
 backhill_show:shot=>PrologueBackhill.show(shot),
 backhill_guard:on=>on?PrologueBackhill.guard():PrologueBackhill.guard(false),
 backhill_retreat:()=>PrologueBackhill.retreat(),
 mark:id=>mark(id),
 checkpoint:()=>checkpoint()
};
async function encounter(){
 await StoryRuntime.play('prologue_encounter',{line,externals:{...backhill,
  water_scene:async()=>{const result=await PrologueWater.play({owned:true,fallback:true});if(!result)throw Error('递水片段尚未就绪');state().originExpression=['A','B','C'][result.branch]}
 }});
}
async function dog(){
 await StoryRuntime.play('prologue_dog',{line,externals:{...backhill,
  // 战斗与重试提示是游戏界面，不是剧情台词，留在 JS
  wolf_battle:async()=>{
   while(true){
    mark('P-02-07');const result=await PrologueDog.play();if(result==='win')return;
    const text=result==='lose'?'两人暂时退开，重新稳住脚步。可以重试，不损失物品。':'战斗未能完成，重新挑战可恢复到开战前。';
    if(await choose('',text,['重新挑战','稍后再试'])===1)throw Error('等待重新挑战后山战斗');
   }
  }
 }});
}
// 2026-10-18 迁移试点：进村第一夜的台词改由 ink 剧本提供（story/01-开始/序章-进村第一夜.ink，编译产物 js/story-data/qihe_lodging.js）。
// 这里只保留本场的游戏函数实现；台词、顺序、条件都以剧本为准，不要在 JS 里再写台词。
async function lodging(){
 await StoryRuntime.play('qihe_lodging',{line,externals:{
  go_scene:async()=>{const m=window.CHAPTER1_V2_MAPS?.clinic_interior;
   if(m&&SC.prologue_clinic_interior){const at=m.anchors.entry_front.map(v=>v*3/TS);await goScene('prologue_clinic_interior',at);busy=true}},
  clinic_stage:()=>{PrologueBackhill.clinic?.();player.alpha=1;OpeningCharacters.applyScene?.(cur)},
  mark:id=>mark(id),
  change_into_village_clothes:()=>fade(async()=>{state().borrowed=true;OpeningCharacters.modernEvent=false;OpeningCharacters.applyScene?.(cur);PrologueBackhill.release();player.alpha=1;checkpoint()}),
  checkpoint:()=>checkpoint(),
  toast:t=>toast(t,2800)
 }});
}
async function play(){
 if(running||dlgBusy||mode!=='scene'||!state()||state().stage==='done')return false;
 running=true;const oldZ=$('dlg').style.zIndex;busy=true;keys={};player.path=null;player.goal=null;player.talkTo=null;OpeningCharacters.modernEvent=!state().borrowed;$('dlg').style.zIndex='60';
 let castToken;
 try{
  castToken=window.DialogueStage?.begin({id:'prologue-arrival',cast:[{who:S.name||'萧白',sp:'c_hero',slot:'left'},{who:'叶蘅',sp:'c_ye',slot:'right'}]});
  if(state().stage==='encounter')await encounter();
  if(state().stage==='dog')await dog();
  if(state().stage==='lodging')await lodging();
  return true;
 }catch(e){console.error('序章开场未完成',e);toast('序章片段未能完成，可以点击“继续序章”重试。',4000);showRetry();return false}
 finally{if(castToken!==undefined)DialogueStage.end(castToken);PrologueBackhill.clearClinic?.();PrologueBackhill.release();player.alpha=1;OpeningCharacters.modernEvent=false;OpeningCharacters.applyScene?.(cur);$('dlg').style.zIndex=oldZ;$('dlg').hidden=true;$('dlg').onclick=null;dlgBusy=false;keys={};busy=false;running=false;step=null;hud()}
}
function showRetry(){let b=document.getElementById('prologue-retry');if(!b){b=document.createElement('button');b.id='prologue-retry';b.textContent='继续序章';b.style.cssText='position:fixed;left:50%;bottom:12%;transform:translateX(-50%);z-index:65;padding:12px 22px;background:#24271d;color:#f3dfb4;border:1px solid #bfa16b;cursor:pointer';document.body.appendChild(b)}b.onclick=async()=>{b.remove();await play()}}
// 2026-10-18 第 2 期：第一次搭话的寒暄改由 ink 剧本提供（story/01-开始/第一夜-问候.ink）；剧本里记 greeted 并存档。
const greetings={周婶:'qihe_greet_aunt',陈伯:'qihe_greet_chen',叶蘅:'qihe_greet_ye'};
function bindGreetings(){for(const [id,scene]of Object.entries(SC)){if(!id.startsWith('prologue_'))continue;for(const npc of scene.npcs||[]){const name=npc.name?.split(' · ')[0];if(!greetings[name]||npc._arrivalGreeting)continue;const act=npc.act;npc._arrivalGreeting=true;npc.act=async(...args)=>{const p=state();if(p?.stage==='done'&&!p.greeted[name]&&!p.legacy&&!p.bypassed){await DialogueStage.withCast({id:'arrival-greeting:'+npc.id,cast:[{who:S.name||'萧白',sp:'c_hero',slot:'left'},{who:name,sp:npc.sp,slot:'right'}].filter(a=>a.sp)},()=>StoryRuntime.play(greetings[name],{line:(id,who,text)=>say(who,text),externals:{checkpoint:()=>checkpoint()}}))}return act(...args)}}}}
window.PrologueArrival={initial,state,play,bindGreetings,get running(){return running},get step(){return step},get completion(){return completion}};
})();
