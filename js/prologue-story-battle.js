'use strict';
// QH-P3: guidance layered over normal attacks/skills/items/defense/BP; normal HP victory.
// No permanent party member, skill, equipment, reward or ordinary defeat transition is created.
(() => {
 let running=false,lastResult=null,lastError=null;
 const clone=value=>JSON.parse(JSON.stringify(value));
 // Preserve nested object identity: the arrival caller may already hold its checkpoint object.
 function restore(target,snapshot){
  for(const key of Object.keys(target))if(!(key in snapshot))delete target[key];
  for(const [key,value] of Object.entries(snapshot)){
   if(value&&typeof value==='object'){
    const array=Array.isArray(value);
    if(!target[key]||typeof target[key]!=='object'||Array.isArray(target[key])!==array)target[key]=array?[]:{};
    restore(target[key],value);if(array)target[key].length=value.length;
   }else target[key]=value;
  }
 }
 async function preload(){
  const modern=window.BART?.hero_modern,dog=window.BART?.wolf,ye=window.BART?.ye_initial;
  if(!modern||modern.file!=='b_hero_modern_hd_20261017'||!dog||dog.file!=='b_wolf_hd_20261017'||dog.cell[0]!==480||dog.cell[1]!==324||dog.cols!==14||!ye||ye.file!=='b_ye_initial_needle_hd_20261017'||ye.cell[0]!==480||ye.cell[1]!==324||ye.cols!==16)throw Error('序章战斗动作尚未就绪');
  const files=['bb_prologue_backhill_v1',modern.file,dog.file,ye.file,'p_ye','p_opening_hero_modern','p_opening_hero_modern_guard','p_opening_hero_modern_hurt','a_opening_hero_modern'];
  await Promise.all(files.map(async key=>{if(!ok(IMG[key]))await loadOpt(key,key);if(!ok(IMG[key]))throw Error('无法载入序章战斗素材：'+key)}));
 }
 function makeLesson(){
  const lesson={normalCombat:true,guidance:true,action:null,actions:[],
   allies(){
    const hero=statUnit({name:S.name||'萧白',lv:1,st:{str:4,con:4,agi:4,wil:4,wis:4}},'ally');
    Object.assign(hero,{hp:clamp(S.hp,1,hero.mhp),mp:0,isHero:true,art:'hero_modern',por:'opening_hero_modern',atkType:'棍',atkName:'木杆',skills:[],skLv:{},dodge:0,crit:0,block:0});
    const ye=statUnit({name:'叶蘅',lv:3,st:{str:3,con:4,agi:5,wil:4,wis:5}},'ally');
    Object.assign(ye,{hp:ye.mhp,mp:ye.mmp,art:'ye_initial',por:'ye',key:'ye',storyYe:true,atkType:'暗器',atkName:'飞针',skills:['jinzhen'],skLv:{jinzhen:1},dodge:0,crit:0,block:0});
    return [hero,ye];
   },
   planIntent(u){planIntent(u);if(B.round===1&&u.intent&&!u.intent.all){u.intent.tgt=B.allies[B.foes.indexOf(u)%B.allies.length]}},
   events:[],guide:null,targetBox:null,raf:0,
   record(type,data={}){lesson.events.push({type,...data})},
   mount(){
    if(typeof document==='undefined')return;
    const el=$('bt');el.classList.add('teaching');
    const style=document.createElement('style');style.id='bt-teaching-style';style.textContent=`
#bt.teaching #bt-cmd{width:220px!important;max-width:280px;box-sizing:border-box}
#bt.teaching #bt-cmd .hd{height:auto!important;min-height:24px;flex-wrap:wrap;gap:6px}
#bt.teaching #bt-cmd .row{height:auto!important;min-height:27px;padding-top:3px!important;padding-bottom:3px!important;white-space:normal;align-items:center}
#bt.teaching #bt-cmd .row .l{overflow:visible!important;text-overflow:clip!important;white-space:normal!important;overflow-wrap:anywhere;flex:1;min-width:0;font-size:15px!important;line-height:20px;letter-spacing:.02em}
#bt.teaching #bt-cmd .row .r{flex:0 0 auto;max-width:82px;white-space:normal}
#bt.teaching #bt-hint{max-width:870px;white-space:normal;text-align:center;line-height:22px}
#bt .teaching-focus{outline:2px solid #f1d07b!important;outline-offset:3px}
#bt-teaching-guide{position:absolute;left:18px;bottom:22px;width:360px;padding:12px 16px;color:#fff0ca;background:rgba(19,24,22,.91);border:1px solid #bfa16b;font:15px/24px var(--serif);box-sizing:border-box;pointer-events:none;z-index:4}
#bt-teaching-guide b{display:block;color:#f1d07b;font-size:17px;margin-bottom:4px}
#bt-teaching-toggle{position:absolute;left:18px;top:92px;padding:5px 10px;background:rgba(19,24,22,.82);border:1px solid #8d7b58;color:#e7d5b3;font:13px var(--serif);z-index:5;pointer-events:auto;cursor:pointer}
#bt-teaching-toggle:disabled{opacity:.35;cursor:default}
#bt-teaching-target{position:absolute;border:2px solid #f1d07b;box-shadow:0 0 10px #f1d07b66;pointer-events:none;z-index:3;box-sizing:border-box}
`;el.appendChild(style);
    lesson.guide=document.createElement('div');lesson.guide.id='bt-teaching-guide';el.appendChild(lesson.guide);
    lesson.targetBox=document.createElement('div');lesson.targetBox.id='bt-teaching-target';lesson.targetBox.hidden=true;el.appendChild(lesson.targetBox);
    const help=document.createElement('button');help.id='bt-teaching-toggle';help.textContent='关闭指引';help.onclick=()=>{lesson.guidance=!lesson.guidance;help.textContent=lesson.guidance?'关闭指引':'显示指引';if(lesson.guide)lesson.guide.hidden=!lesson.guidance;if(lesson.targetBox)lesson.targetBox.hidden=true;B?.redraw?.()};el.appendChild(help);
   },
   show(step,text,u,target=null){
    lesson.uiStep=step;lesson.record('guide',{step,actor:u?.name});
    if(lesson.guide){lesson.guide.hidden=!lesson.guidance;lesson.guide.innerHTML='<b>第 '+B.round+' 回合 · '+esc(u?.name||'')+'</b>'+text;
     // The lower-left guide overlaps the dog at x300/y420 during target selection.
     // Move instructions to the empty upper-left while a canvas target is highlighted.
     /* 2026-10-17：指引框原来无目标时贴左下，挡住第二只狼；统一放在左上“关闭指引”下方。 */Object.assign(lesson.guide.style,{top:'132px',bottom:'auto'});}
    const el=$('bt');el?.querySelectorAll?.('.teaching-focus').forEach(n=>n.classList.remove('teaching-focus'));
    if(u?.side==='ally')$('bt-cards')?.querySelector?.('[data-i="'+B.allies.indexOf(u)+'"]')?.classList.add('teaching-focus');
    if(lesson.raf&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(lesson.raf);
    if(lesson.targetBox)lesson.targetBox.hidden=!target||!lesson.guidance;
    const fit=()=>{
     if(!B||!lesson.targetBox||!target)return;
     // Mirror production unitAt: half-width max(40,h*.32), top y-h, bottom y+30.
     const h=unitH(target),half=Math.max(40,h*.32),a=typeof CAM!=='undefined'&&typeof CAM.toScreen==='function'?CAM.toScreen(target.x-half,target.y-h):[target.x-half,target.y-h],b=typeof CAM!=='undefined'&&typeof CAM.toScreen==='function'?CAM.toScreen(target.x+half,target.y+30):[target.x+half,target.y+30];
     Object.assign(lesson.targetBox.style,{left:a[0]+'px',top:a[1]+'px',width:(b[0]-a[0])+'px',height:(b[1]-a[1])+'px'});
     if(typeof requestAnimationFrame==='function')lesson.raf=requestAnimationFrame(fit);
    };if(target&&lesson.guidance)fit();
   },
   onMenu(u,title,rows,selected){
    const first=!lesson.actions.some(a=>a.actor===u.name),dog=aliveOf('foe')[0],sub=title==='武学'||title==='道具';
    let expected=u.isHero?'atk':'sk',text,step;
    if(title==='武学'){step='skill-menu';expected='jinzhen';text='选择叶蘅已经会的「金针刺穴」，再选目标；会消耗内力并造成真实伤害。Esc 可返回。'}
    else if(title==='道具'){step='item-menu';expected=rows.find(r=>!r.dis)?.val;text='选择行囊中的补给，再选择使用对象。数量与回复效果遵循正式战斗规则。'}
    else if(first){step=u.isHero?'attack-menu':'ye-turn';text=u.isHero?'轮到萧白。选择「攻击」，再确认灰狼目标；↑↓ / W、S 选择，Enter / 空格确认，也可点击。未习武时武学自然不可用。':'轮到叶蘅。可用「攻击」飞针，或选择「武学 → 金针刺穴」并确认目标。看顶部行动顺序，两个角色由你分别操作。'}
    else if(dog?.broken){step='boost';expected='atk';text='灰狼已破势：暂时不能行动、受到伤害提高。按 E / → 投入 BP，Q / ← 减少；普攻增加连击，招式提高效果，再选目标确认。'}
    else{step='tactics';expected=dog?.intent?.tgt===u?'def':'atk';text='看灰狼头顶的攻击意图。「防御」让本回合受伤减半；也可攻击弱点削盾、使用武学或道具。BP 每回合积累，按 E 投入。所有可用指令都能正常使用。'}
    lesson.show(step,text,u);if(lesson.guidance){const i=rows.findIndex(r=>r.val===expected);$('bt-cmd')?.querySelector?.('[data-i="'+i+'"]')?.classList.add('teaching-focus')}
    lesson.record('selection',{actor:u.name,title,value:rows[selected]?.val});
   },
   wrong(u,row){lesson.record('unavailable',{actor:u.name,value:row.val});if(lesson.guide){lesson.guide.hidden=!lesson.guidance;lesson.guide.innerHTML='<b>当前不可用</b>'+(u.isHero&&row.val==='sk'?'萧白尚未习武，可以用木杆攻击或选择防御。':row.desc||row.why||'当前条件不足。')}},
   confirm(u,value,source){if(value!=='target')lesson.action=value;lesson.record('confirm',{actor:u.name,value,source})},
   onTarget(u,target){lesson.show('target',target.side==='foe'?'选择灰狼并确认。命中「棍 / 暗器」弱点会削减盾值；盾归零即破势。Esc 返回，E / Q 调整 BP。':'选择需要补给的角色，再按 Enter / 空格确认。Esc 返回。',u,target);lesson.record('target',{target:target.name})},
   afterAction(u,bp){const entry={actor:u.name,action:lesson.action,bp,enemyHP:B.foes[0].hp,shield:B.foes[0].shield,broken:B.foes[0].broken,mp:u.mp};lesson.actions.push(entry);lesson.record('action',entry)},
   async beforeFoe(dog){lesson.hpBefore=B.allies.map(u=>u.hp);lesson.show('enemy-intent','轮到灰狼。观察它的攻击目标、动作以及气血变化；防御减伤、弱点破势都使用正常规则。',dog,dog)},
   async afterFoe(){lesson.record('enemy-damage',{values:B.allies.map((u,i)=>lesson.hpBefore[i]-u.hp)});},
   clear(){if(lesson.raf&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(lesson.raf);lesson.raf=0;lesson.guide=null;lesson.targetBox=null;for(const id of ['bt-teaching-style','bt-teaching-guide','bt-teaching-toggle','bt-teaching-target'])$(id)?.remove();$('bt')?.classList.remove('teaching')}
  };return lesson;
 }
 async function play(options={}){
  if(running)throw Error('序章教学正在进行');
  if(typeof B!=='undefined'&&B)throw Error('已有战斗正在进行');
  running=true;lastError=null;const snapshot=clone(S),previousMode=mode;
  try{
   await preload();
   const storyLesson=makeLesson();
   const autoReview=options.autoReview===true&&typeof isQiheBattleReview==='function'&&isQiheBattleReview()&&new URLSearchParams(location.search).get('battleReview')==='ye';
   if(autoReview){storyLesson.guidance=false;storyLesson.mount=()=>{};}
   const result=await battle({storyLesson,allowAuto:autoReview,solo:true,noLose:true,noFlee:true,bg:'bb_prologue_backhill_v1',
    foes:[0,1].map(i=>({name:i?'受惊灰狼·后侧':'受惊灰狼·前侧',sp:'c_wolf',lv:1,st:{str:4,con:4,agi:1,wil:2,wis:2},skills:{bite:1},hpMul:.43,atkMul:.36,shield:2,weak:['棍','暗器'],exp:0,silver:0,drops:{},h:95}))});
   lastResult=result==='win'?'win':result==='lose'?'lose':'fail';return lastResult;
  }catch(error){
   lastError=String(error.message||error);lastResult='fail';console.error('序章灰狼教学中止：',error);
   await toast('战斗暂时无法继续，可重新挑战');return'fail';
  }finally{
   restore(S,snapshot);mode=previousMode;if(typeof keys!=='undefined')keys={};
   running=false;try{hud()}finally{restore(S,snapshot);save()}
  }
 }
 window.PrologueStoryBattle={play,preload,makeLesson,restore,get running(){return running},get lastResult(){return lastResult},get lastError(){return lastError}};
})();
