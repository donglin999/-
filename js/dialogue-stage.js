'use strict';
// Dialogue cast and stable slots. Presentation only; no party/save/quest mutations.
window.DialogueStage=(()=>{
 let state={scene:null,actors:[],active:null,closedAt:0,scope:null},serial=0;
 const scene=()=>typeof S==='undefined'?null:S.scene;
 const resolve=(who,sp)=>window.OpeningCharacters?.dialogueSprite(who,'',sp)||sp;
 const identity=(who,sp)=>{const k=(sp||'').replace(/^c_/,'').split(':')[0];return /^(?:opening_)?hero(?:_|$)/.test(k)?'hero':k||who;};
 // 立绘取景（640 高原图里眼线、下巴的 y；表情差分与本体取景相同）。2026-10-17 第二版：
 // 头顶受发髻、头巾、低头影响量不准（主角被缩小、全身像被放大，差了四成），改量“眼线到下巴”。
 // 显示时按这一段统一缩放（女性按男性九成），眼线对齐：男性 EYE_M，女性再低 EYE_F，人显得矮一些。
 const EYE_M=98,EYE_F=118,FACE_M=52,FACE_F=47;
 // 2026-10-17 起第一章所有对话立绘都换成 960×1280 高清半身像（_hd_20261017），这里按 640 高折半记录。
 const FRAMES={opening_hero_village:[108,160,'m'],opening_hero_modern:[108,160,'m'],ye:[120,171,'f'],opening_zhouyan:[104,160,'m'],opening_luheng:[106,160,'m'],
  opening_chengduo:[106,161,'m'],opening_wukui:[104,160,'m'],qh_shenyanhui_story:[120,170,'f'],qh_xulingyi_story:[116,168,'f'],qh_censhuang_story:[100,150,'f'],qh_song_story:[106,162,'m']};
 function frameOf(sp){const key=(sp||'').replace(/^c_/,'').split(':')[0],f=FRAMES[key];if(!f)return null;const fem=f[2]==='f';return {eye:f[0],line:fem?EYE_F:EYE_M,k:(fem?FACE_F:FACE_M)/(f[1]-f[0])};}
 function add(who,sp,slot){
  sp=resolve(who,sp);if(!sp||face(sp)==='none')return null;
  const id=identity(who,sp);let actor=state.actors.find(a=>a.id===id);
  if(actor){actor.who=who;actor.sp=sp;return actor;}
  const used=new Set(state.actors.map(a=>a.slot));
  slot=slot||(id==='hero'&&!used.has('left')?'left':!state.actors.length&&!state.scope?.hasHero?'left':!used.has('right')?'right':!used.has('left')?'left':!used.has('center')?'center':'rail');
  if(!['left','right','center','rail'].includes(slot))throw Error('未知立绘站位：'+slot);
  if(slot!=='rail'&&used.has(slot))throw Error('重复立绘站位：'+slot);
  actor={id,who,sp,slot};state.actors.push(actor);return actor;
 }
 function begin({id,cast=[]}={}){
  const previous=state,token=++serial,hasHero=cast.some(a=>identity(a.who,resolve(a.who,a.sp))==='hero');state={scene:scene(),actors:[],active:null,closedAt:0,scope:{id,token,previous,hasHero}};
  try{for(const actor of cast)add(actor.who,actor.sp,actor.slot);}catch(e){state=previous;throw e;}
  return token;
 }
 function end(token){if(state.scope?.token===token)state=state.scope.previous;}
 function closeLine(){state.closedAt=Date.now();}
 function enter(who,sp){
  // Cast continuity requires an explicit scope; timing alone cannot imply attendance.
  if(!state.scope){
   state={scene:scene(),actors:[],active:null,closedAt:0,scope:null};
   if(who){const name=typeof S!=='undefined'?S.name||'萧白':'萧白';add(name,'c_hero','left');}
  }
  const actor=who?add(who,sp):null;state.active=actor?.id||null;
 }
 function layout(){
  const active=state.actors.find(a=>a.id===state.active),center=state.actors.find(a=>a.slot==='center');
  const middle=active?.slot==='rail'?active:center;
  return state.actors.map(a=>({...a,sp:resolve(a.who,a.sp),displaySlot:a.slot==='left'||a.slot==='right'?a.slot:a===middle?'center':'rail',active:a.id===state.active}));
 }
 function avatar(a){
  const key=a.sp.replace(/^c_/,'').split(':')[0],source=window.OpeningCharacters?.active()&&window.OPENING_CHARACTER_ART?.avatars?.[key.replace(/^opening_/,'')];
  if(source)return {url:'url(assets/'+source+'.webp)',type:'head'};
  // Reuse the existing portrait face crop; a full body thumbnail is too small to identify.
  try{const portrait=a.sp.replace(/^c_/,'').replace(':','_'),head=window.BUI?.face({side:'ally',por:portrait,art:key,hp:1,mhp:1},48);if(head)return {url:'url('+head.toDataURL()+')',type:'head'};}catch(e){}
  return {url:face(a.sp),type:'portrait-fallback'};
 }
 // 对白框底边占对白层高度的百分比；量不到（隐藏、未排版）时按 1280×720 实测值 98%。
 function boxBottom(d){const box=d.querySelector('.box'),r=d.getBoundingClientRect(),b=box?.getBoundingClientRect();return r?.height>0&&b?.height>0?Math.min(100,(b.bottom-r.top)/r.height*100):98}
 function render(d,who,sp,{suppress=false,primary}={}){
  enter(who,sp);
  let ui=d._dialogueStage;
  if(!ui){const extra=document.createElement('div'),rail=document.createElement('div');extra.className='dialogue-cast';rail.className='dialogue-cast-rail';d.appendChild(extra);d.appendChild(rail);ui=d._dialogueStage={extra,rail};}
  ui.extra.replaceChildren();ui.rail.replaceChildren();
  // 2026-10-26 第十五轮第 7 题：说话的人没有立绘（路人、孩子、景物）时，不再把萧白的立绘留在左边压住小头像——这一句只显示说话人的小头像。
  const speakerless=!!who&&!state.active&&identity(who,sp)!=='hero';
  const actors=layout(),hidden=suppress||!who||speakerless,big=hidden?[]:actors.filter(a=>a.displaySlot!=='rail'),small=hidden?[]:actors.filter(a=>a.displaySlot==='rail');
  // Keep the legacy primary node as the speaking portrait for existing UI integrations.
  const speaker=big.find(a=>a.active)||big[0];primary.hidden=!speaker;
  function portrait(el,a){
   el.classList.add('dialogue-portrait');el.dataset.character=identity(a.who,a.sp);el.dataset.slot=a.displaySlot;
   el.dataset.speaking=String(a.active);el.setAttribute('aria-label',a.who+(a.active?'（正在发言）':''));
   const width=big.length>2?29:28,center=a.displaySlot==='left'?1.5+width/2:a.displaySlot==='right'?100-width/2-1.5:50;
   // 按脸的大小统一缩放、眼线对齐（2026-10-17）：半身像与全身像取景不同，直接按框高显示会一大一小。
   const f=frameOf(a.sp),k=f?f.k:1,h=72*k,w=width*k,top=f?28+72*(f.line-k*f.eye)/640:28;
   // 2026-10-21 整改（素材缺失）：立绘都是到膝的半身图，按脸缩放后下沿高低不一，硬切边会露在半透明对白框里或框下。
   // 让立绘下沿在对白框底（或图片本身的下沿，取较高者）之前渐隐，不改大小与眼线。
   const fadeEnd=Math.min(100,(boxBottom(d)-top)/h*100),fadeStart=Math.max(0,fadeEnd-14/h*100),mask=`linear-gradient(to bottom,#000 ${fadeStart.toFixed(2)}%,transparent ${fadeEnd.toFixed(2)}%)`;
   Object.assign(el.style,{left:(center-w/2)+'%',right:'auto',width:w+'%',height:h+'%',maxHeight:'none',top:top+'%',bottom:'auto',backgroundImage:face(a.sp),backgroundSize:'auto 100%',backgroundPosition:'center top',backgroundRepeat:'no-repeat',opacity:'1',maskImage:mask,webkitMaskImage:mask});el.hidden=false;
  }
  if(speaker)portrait(primary,speaker);
  for(const a of big.filter(a=>a!==speaker)){const el=document.createElement('div');el.className='face';portrait(el,a);ui.extra.appendChild(el);}
  for(const a of small){const tile=document.createElement('div'),image=document.createElement('div'),name=document.createElement('span'),head=avatar(a);tile.className='dialogue-cast-tile';image.className='dialogue-cast-avatar';image.style.backgroundImage=head.url;image.dataset.avatarType=head.type;name.textContent=a.who;tile.appendChild(image);tile.appendChild(name);ui.rail.appendChild(tile);}
  ui.rail.hidden=!small.length;d.dataset.castCount=String(big.length);d.dataset.castTotal=String(actors.length);
  d.classList.add('dialogue-staged');d.classList.toggle('hasface',!!big.length);return {big,small};
 }
 async function withCast(config,fn){const token=begin(config);try{return await fn();}finally{end(token);}}
 return {begin,end,withCast,enter,layout,render,closeLine,identity,get snapshot(){return {scene:state.scene,active:state.active,actors:layout(),scope:state.scope?.id||null};}};
})();
