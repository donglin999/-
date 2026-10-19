'use strict';
// Chapter-owned story checkpoint; this module only runs a temporary NPC battle stage.
(()=>{
 if(!isQiheEntry())return;
 const R=QiheClashRules,D=R.data;
 let readyPromise,fx,active=null,motionView=null,last=0,state=null,caption=null,playing=false;
 const bw=ms=>VFX.btWait(ms);
 const portrait={xu:'p_qh_xulingyi_story',cen:'p_qh_censhuang_story',shen:'p_qh_shenyanhui_story'};
 async function image(key,path){if(ok(IMG[key]))return;const im=new Image();im.src=path;await im.decode();IMG[key]=im}
 async function ready(){if(readyPromise)return readyPromise;readyPromise=(async()=>{
  const arts=window.QiheClashArt;if(!arts)throw Error('领队动作配置未加载');Object.assign(BART,arts);
  await Promise.all(Object.values(arts).map(a=>image(a.file,assetImagePath(a.file))));
  for(const a of Object.values(arts)){const im=IMG[a.file];if(im.naturalWidth!==a.cell[0]*a.cols||im.naturalHeight!==a.cell[1])throw Error('领队动作表尺寸不符：'+a.file)}
  for(const key of ['bandit','qh_raider_front_v1','qh_raider_rear_v1']){const a=BART[key];if(!a)throw Error('缺少随行者战斗表：'+key);await loadOpt(a.file,a.file);if(!ok(IMG[a.file]))throw Error('随行者动作未就绪：'+key)}
  await Promise.all(Object.values(portrait).map(k=>image(k,assetImagePath(k))));
  await image('bb_qh_faction_clash_20261012',assetImagePath('bb_qh_faction_clash_20261012'));
  await Promise.all(['am_v1','kit_v1','clash_v2'].map(k=>WuxiaFX.load(window.QiheClashFxRoot+k+'/')));// 2026-10-18 用户确认 v2 特效接入实机
  fx=new WuxiaFX(null,{overlay:true});fx.quiet=true;
 })().catch(e=>{readyPromise=null;throw e});return readyPromise}
 function mount(){
  document.body.classList.add('qh-faction-clash');
  if(!$('qh-clash-style')){const s=document.createElement('style');s.id='qh-clash-style';s.textContent=`
 .qh-faction-clash #bt-auto,.qh-faction-clash #bt-cmd,.qh-faction-clash #bt-help,.qh-faction-clash #toast{display:none!important}
 #qh-clash-caption{position:absolute;left:160px;right:199.7px;top:64px;min-height:70.02px;display:flex;align-items:center;gap:13.95px;padding:8.998px 19.97px;background:linear-gradient(90deg,transparent,#211c16e8 12%,#211c16e8 88%,transparent);color:#f4e7c6;pointer-events:none}
 #qh-clash-caption img{width:64px;height:76.03px;object-fit:cover;object-position:50% 12%;flex:none}#qh-clash-caption b{font-size:14.98px;display:block;color:#ddbc7f}#qh-clash-caption p{font-size:18.05px;margin:2.995px 0;line-height:1.55}
 #qh-clash-caption[hidden]{display:none}#qh-clash-caption .qh-clash-skip{position:absolute;right:17.92px;bottom:.64px;font-size:.1216px;color:#cdb68a;opacity:.75;letter-spacing:.1em}
 #qh-clash-label{position:absolute;top:17px;left:0;right:0;text-align:center;color:#efe0b5;font:17px var(--serif);letter-spacing:3px;text-shadow:0 2px 4px #000}`;document.head.append(s)}
  const label=document.createElement('div');label.id='qh-clash-label';label.textContent='侧口交锋 · 旁观';$('bt').append(label);
  caption=document.createElement('div');caption.id='qh-clash-caption';caption.hidden=true;$('bt').append(caption);
 }
  // 2026-10-17 试玩反馈：交锋喊话可用点击或空格／回车／Z 跳过（显示满 minMs 后才接受，防止连点误跳）
 function skipInput(minMs){let done,cancel=()=>{};const promise=new Promise(resolve=>{const t0=performance.now(),game=$('game');
   const finish=()=>{if(performance.now()-t0<minMs)return;cancel();resolve()};
   const key=e=>{if([' ','Enter','z','Z'].includes(e.key)){e.preventDefault();e.stopPropagation();finish()}},click=e=>{e.preventDefault();finish()};
   addEventListener('keydown',key,true);game?.addEventListener('pointerdown',click,true);
   cancel=()=>{removeEventListener('keydown',key,true);game?.removeEventListener('pointerdown',click,true)}});
  return {promise,cancel:()=>cancel()}}
 async function speak(who,text,key,ms=2100){caption.replaceChildren();if(key){const im=document.createElement('img');im.src=assetImagePath(portrait[key]);im.alt=who;caption.append(im)}const box=document.createElement('div'),name=document.createElement('b'),p=document.createElement('p');name.textContent=who;p.textContent=text;box.append(name,p);caption.append(box);caption.hidden=false;
  const voice=window.CharacterVoice?.begin(who,text);let timer;const skip=skipInput(250);
  const hint=document.createElement('small');hint.className='qh-clash-skip';hint.textContent='点击／空格 继续';box.append(hint);
  try{await Promise.race([skip.promise,Promise.all([bw(ms),Promise.race([voice?.finished||Promise.resolve(),new Promise(resolve=>{timer=setTimeout(resolve,15000)})])])])}
  finally{skip.cancel();clearTimeout(timer);if(voice)window.CharacterVoice?.stop(voice.token);if(caption)caption.hidden=true}
 }
 function clear(){markFlash.length=0;for(const k in markSeen)delete markSeen[k];active=null;motionView=null;window.CharacterVoice?.stop();fx?.reset();caption?.remove();caption=null;$('qh-clash-label')?.remove();document.body.classList.remove('qh-faction-clash')}
 function point(u,mirror){const x=u.x+(u.ox||0),y=u.y+(u.oy||0);return{x:(mirror?960-x:x)/1.5,y:(y-unitH(u)*.55)/1.5,gx:(mirror?960-x:x)/1.5,gy:y/1.5}}
 function startFx(u,k,t,ally,amount,group,pred){const mirror=u.side==='foe',a=point(u,mirror),target=point(t,mirror),friend=point(ally||u,mirror),scale=.8,pivot={x:(a.x+target.x)/2,y:(a.gy+target.gy)/2-40};
  const transform=p=>({x:pivot.x+(p.x-pivot.x)/scale,y:pivot.y+(p.y-pivot.y)/scale,gx:pivot.x+(p.gx-pivot.x)/scale,gy:pivot.y+(p.gy-pivot.y)/scale});
  const A=transform(a),T=transform(target),AL=transform(friend);fx.A.hand={x:A.x-14,y:A.y-4};fx.A.foot={x:A.gx,y:A.gy};fx.T=group&&group.length>1?group.map(v=>transform(point(v,mirror))):[T];fx.AL=[AL];fx.A.target={x:T.x-5,y:T.y+8};fx.A.ground={x:T.gx,y:T.gy};
  if(k==='am_s2'){fx.T=null;fx.AL=[T]}
  // 2026-10-18 专属特效补做：pred 为同一确定性规则在状态副本上的预判（只决定轨迹压在身上还是擦过），outcome 在真实结算后写入，命中反馈以它为准
  fx.low=matchMedia('(prefers-reduced-motion: reduce)').matches;if(pred){fx.pred=pred;fx.outcome=null}else{delete fx.pred;delete fx.outcome}
  fx.play(k,1210+state.log.length,{bp:0});fx.actualBP=amount||0;last=BT.now();active={mirror,scale,pivot,skill:k};
 }
 function tick(){if(!active||!B?.opt.factionClash)return;const now=BT.now();fx.update(Math.min(50,Math.max(0,now-last)));last=now;fx.render();if(fx.done)active=null}
 function paint(layer){if(!active||!B?.opt.factionClash)return;const v=active;g.save();if(v.mirror){g.translate(960,0);g.scale(-1,1)}g.translate(v.pivot.x*1.5,v.pivot.y*1.5);g.scale(v.scale,v.scale);g.translate(-v.pivot.x*1.5,-v.pivot.y*1.5);if(layer==='back')fx.drawBackInto(g,960,540);else fx.drawFrontInto(g,960,540);g.restore()}
 // 状态标记（按真实规则状态常驻，状态清除即消失）：明约合锋的金白“接应缺口”、被消费时短亮；缠腕短打的墨紫“制势”腕环
 const markSeen={},markFlash=[];
 function drawMarks(){if(!state||!B?.opt.factionClash)return;const now=BT.now();g.save();g.lineCap='round';
  for(const u of Object.values(state.units)){const h=unitH(u),dir=u.side==='foe'?1:-1,x=u.x+(u.ox||0),y=u.y+(u.oy||0);
   if(u.hp>0&&u.clashFollow){const t0=markSeen['f'+u.key]??(markSeen['f'+u.key]=now),a=Math.min(1,(now-t0)/220)*(.78+.22*Math.sin((now-t0)/240));notch(x+dir*h*.2,y-h*.66,a,1)}else delete markSeen['f'+u.key];
   if(u.hp>0&&u.clashBlunted){const t0=markSeen['b'+u.key]??(markSeen['b'+u.key]=now),a=Math.min(1,(now-t0)/260)*.85,cx=x+dir*h*.2,cy=y-h*.42;g.globalAlpha=a;g.lineWidth=3;g.strokeStyle='#24102c';g.beginPath();g.ellipse(cx,cy+1,10,5,-.35*dir,.5,5.9);g.stroke();g.lineWidth=1.6;g.strokeStyle='#a675b0';g.beginPath();g.ellipse(cx,cy,10,5,-.35*dir,.5,5.9);g.stroke()}else delete markSeen['b'+u.key]}
  for(let i=markFlash.length-1;i>=0;i--){const m=markFlash[i],e=now-m.t0,u=state.units[m.unit];if(e>360||!u){markFlash.splice(i,1);continue}const h=unitH(u),dir=u.side==='foe'?1:-1;notch(u.x+(u.ox||0)+dir*h*.2,u.y+(u.oy||0)-h*.66,1-e/360,1+.8*Math.min(1,e/120))}
  g.restore()}
 function notch(x,y,a,s){if(a<=.01)return;g.globalAlpha=a;g.shadowColor='#ffe39a';g.shadowBlur=8*s;for(const [col,w] of [['#7a4218',4*s],['#fff3c8',2*s]]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x-6*s,y-6*s);g.lineTo(x-1.5*s,y+5*s);g.moveTo(x+1.5*s,y+5*s);g.lineTo(x+6*s,y-6*s);g.stroke()}g.shadowBlur=0}
 const originalBg=drawBattleBg,originalFx=VFX.draw;
 drawBattleBg=function(){originalBg();tick();paint('back')};
 VFX.draw=function(){originalFx.apply(this,arguments);paint('front');drawMarks()};
 function showResult(record){for(const hit of record.hits){const t=state.units[hit.target];if(hit.miss){floatTxt(t,'闪避','#ddd',18);continue}t.hp=hit.hp;BFXI.act(t,'hurt');t.flash=performance.now();t.ghT=performance.now();floatTxt(t,String(hit.damage),'#f1d8b5',23)}
  // Existing ordinary sword impact only, once per simultaneous group. Whip audio is still unproduced.
  if(record.hits.some(h=>!h.miss)&&!record.skill.startsWith('cs_whip'))bsfx('clash_blade_hit_20261012',.6,1);
  // 2026-10-18 专属特效：同帧多目标命中只合并一次轻震（≤3 画布像素）与一次顿帧（≤60ms）；鞭类暂以现有 whoosh 提速代替鞭梢主声（专属鞭声未制作）
  if(OWN_FX.has(record.skill)&&record.hits.some(h=>!h.miss)){const jia=record.skill!=='cs_whip_s1';B.shake=Math.max(B.shake||0,jia?2.5:1.5);BT.stop(jia?50:35);if(record.skill.startsWith('cs_whip'))bsfx('whoosh',jia?.8:.55,jia?1.9:2.2)}
  for(const e of record.effects)if(e.kind==='followUsed')markFlash.push({unit:e.unit,t0:BT.now()});
  for(const e of record.effects){const u=state.units[e.unit];if(e.kind==='bp'){floatTxt(u,'蓄势 +'+e.value,'#f2ce6f',20);bsfx('clash_qi_transfer_20261012',.55,1)}if(e.kind==='unload')floatTxt(u,'援护','#9ecfd0',18);if(e.kind==='exposure')floatTxt(u,'破绽','#dd996d',18);if(e.kind==='defend')floatTxt(u,'防御','#9ecfd0',18);if(e.kind==='blunted')floatTxt(u,'制势','#bda3c7',18);if(e.kind==='follow')floatTxt(u,'接应','#dcc68e',18);if(e.kind==='followUsed')floatTxt(u,'合锋接应','#dcc68e',18)}renderCards();
 }
 // 群攻/缠腕的专属特效需在出手前知道每个目标是否命中（锋线压身或擦过）：在状态副本上跑同一确定性规则，只读结果，不改真实状态
 const OWN_FX=new Set(['am_s3','cs_whip_s1','cs_whip_s2']);
 function predict(step){try{const c=structuredClone(state),p=R.begin(c,step),r=R.impact(p);return p.targets.map(t=>r.hits.some(h=>h.target===t.key&&!h.miss))}catch(e){return null}}
 async function action(step){
  const pred=OWN_FX.has(step.skill)?predict(step):null;
  const a=R.begin(state,step),u=a.u,t=a.target;u.stationarySkill=!!D.skills[step.skill];if(u.stationarySkill){u.stepO=0;if(u.bx!=null)u.x=u.bx;}B.cur=u;renderCards();
  const sk=D.skills[step.skill];showName(u,sk?.name||(step.skill==='defend'?'稳住阵脚':'护卫交手'));
  if(step.skill==='defend'){BFXI.act(u,'cast');R.impact(a);showResult(a.record);await bw(450)}
  else if(sk){const support=state.units[step.support],presentation=D.presentation[step.skill];if(!presentation)throw Error('缺少招式动作合同：'+step.skill);
   const motion=presentation.motion;BFXI.act(u,motion,true);
   const definition=presentation.fxId?WuxiaSkills[presentation.fxId]:presentation;
   if(!definition)throw Error('已登记特效未加载：'+presentation.fxId);
   u.anim.t0=BT.now();
   motionView={skill:step.skill,motion,stationary:true,casterOrigin:{x:u.x,y:u.y,ox:u.ox||0,oy:u.oy||0},startedAt:BT.now(),hitAt:definition.hitAt,dur:definition.dur,fxStatus:presentation.fxStatus,targets:a.targets.map(t=>t.key)};
   // A missing dedicated effect deliberately has no template or blade-light fallback.
   if(presentation.fxId)startFx(u,presentation.fxId,t,support,step.skill==='am_s2'?Math.min(2,5-t.bp):0,a.targets,OWN_FX.has(step.skill)?(pred||a.targets.map(()=>true)):null);
   await bw(definition.hitAt);R.impact(a);if(active&&fx.outcome===null)fx.outcome=a.targets.map(v=>a.record.hits.some(h=>h.target===v.key&&!h.miss));showResult(a.record);
   await bw(definition.dur-definition.hitAt+120);u.anim=null;active=null;motionView=null;
  }else{await BFXI.dashTo(u,t);BFXI.act(u,'atk');await bw(BFXI.impactMs(u,'atk'));R.impact(a);
   // The complete BP attack is one rules action; present its real hits successively.
   const hits=a.record.hits.slice();t.hp=a.record.before.hp;for(let i=0;i<hits.length;i++){if(i){BFXI.act(u,'atk2');await bw(BFXI.impactMs(u,'atk2'))}showResult({...a.record,hits:[hits[i]],effects:[]});await bw(i===hits.length-1?170:180)}await BFXI.hopBack(u)}
  B.cur=null;renderCards();await bw(240);
 }
 async function run(){
  B.round=0;B.order=[];B.next=[];
  for(const line of D.dialogue.opening)await speak(...line);
  for(const step of D.sequence)await action(step);
  active=null;B.banner=null;for(const u of B.units){u.anim=null;u.mv=null}
  for(const line of D.dialogue.stopping){if(['xu','cen'].includes(line[2]))BFXI.act(state.units[line[2]],'win',true);await speak(...line)}
  window.__qiheClashLast={result:'stopped',participantKeys:Object.keys(state.units),log:JSON.parse(JSON.stringify(state.log)),units:JSON.parse(JSON.stringify(state.units))};
  return'stopped';
 }
 async function play(){if(playing||B)throw Error('已有战斗正在进行');playing=true;let snapshot;
  try{await ready();state=R.create();snapshot=JSON.stringify(S);return await battle({factionClash:true,storyLesson:{allies:()=>Object.values(state.units).filter(u=>u.side==='ally'),foes:()=>Object.values(state.units).filter(u=>u.side==='foe'),mount,run,clear},foes:[],bg:'bb_qh_faction_clash_20261012',allowAuto:false,noLose:true,noFlee:true})}
  finally{clear();playing=false;if(snapshot&&JSON.stringify(S)!==snapshot)throw Error('旁观演出意外改动了玩家状态')}
 }
 window.QiheFactionClash={play,ready,get state(){return state},get playing(){return playing},get fx(){return fx},get active(){return active},get presentation(){return motionView?{...motionView,elapsed:BT.now()-motionView.startedAt}:null}};
})();
