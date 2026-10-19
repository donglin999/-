'use strict';
// P-01 CG segment, reusable by the future backhill flow. Review does not change story/save state.
(() => {
const asset='assets/production/shared/cg_p_water_v1.webp';
let running=false,step=null;
// 2026-10-18 第 2 期：递水台词（含三选一与 A/B/C 三支）改由 ink 剧本提供（story/01-开始/序章-递水.ink，编译产物 js/story-data/prologue_water.js）。
// 这里只保留 CG 的显示与收起；台词、顺序、分支都以剧本为准，不要在 JS 里再写台词。
function mark(id){step=id;window.dispatchEvent(new CustomEvent('prologue-cg-step',{detail:{id,visible:!!document.getElementById('prologue-cg')&&!document.getElementById('prologue-cg').hidden}}))}
async function line(id,who,text){mark(id);await say(who,text)}
async function play({owned=false,fallback=false}={}){
 if(running||(busy&&!owned)||dlgBusy||mode!=='scene'||!S?.scene?.startsWith('prologue_'))return false;
 running=true;
 const oldBusy=busy,oldModern=window.OpeningCharacters?.modernEvent,dlg=$('dlg'),oldZ=dlg.style.zIndex,wasCinematic=document.body.classList.contains('qh-cinematic');
 let cg;
 const hideImage=()=>{if(cg)cg.hidden=true;dlg.classList.remove('cg-story');dlg.style.zIndex=oldZ;if(!wasCinematic)document.body.classList.remove('qh-cinematic')};
 try{
  busy=true;keys={};player.path=null;player.goal=null;player.talkTo=null;
  let loaded=true;
  try{const image=new Image();image.src=asset;/* 2026-10-19：页面在后台时浏览器会暂停解码，最多等 2.5 秒就继续（图已下载，显示时再解码） */await Promise.race([image.decode(),new Promise(r=>setTimeout(r,2500))])}catch(e){if(!fallback)throw e;loaded=false;toast('递水图暂未加载，先以立绘与对白继续。',1800)}
  if(loaded){
  cg=document.getElementById('prologue-cg');
  if(!cg){cg=document.createElement('div');cg.id='prologue-cg';cg.setAttribute('role','img');cg.setAttribute('aria-label','后山初遇：叶蘅递水给现代短发的萧白');cg.style.cssText='position:absolute;inset:0;z-index:50;background:#181c1a center/contain no-repeat;pointer-events:none';$('game').appendChild(cg)}
  cg.style.backgroundImage='url('+asset+')';cg.hidden=false;document.body.classList.add('qh-cinematic');dlg.style.zIndex='60';dlg.classList.add('cg-story');
  }
  if(window.OpeningCharacters)window.OpeningCharacters.modernEvent=true;
  let branch=-1;
  await StoryRuntime.play('prologue_water',{line,externals:{
   mark:id=>mark(id),
   hide_water_cg:()=>hideImage(),
   water_branch:b=>{branch=['A','B','C'].indexOf(b)}
  }});
  return {branch,asset};
 }finally{
  hideImage();
  if(window.OpeningCharacters)window.OpeningCharacters.modernEvent=oldModern;
  keys={};busy=oldBusy;running=false;step=null;
 }
}
window.PrologueWater={play,asset,get running(){return running},get step(){return step}};
})();
