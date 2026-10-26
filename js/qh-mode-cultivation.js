/* 归云谷 V5：按 2026-10-04 确认预览制作；玩法数值只经过 CultivationCore。 */
(function(){
'use strict';
const D=window.CultivationData,C=window.CultivationCore,P=window.CultivationPresentation,Q=window.CultivationStory,V=window.CultivationVisitors,M=window.CultivationMail,slot='xjh.qihe.cultivation.save.v1'+(new URLSearchParams(location.search).get('chapterPresentationReview')?'.review.'+new URLSearchParams(location.search).get('chapterPresentationReview'):'');
let root=null,view=null,message='',gift='food',recipient='',broken=null;
const E=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=()=>S.cultivation;
const directPracticeResult=()=>!!window.CultivationRigTrial?.enabled;
const names={B03:'站桩',B02:'步法',B01:'吐纳',B04:'协调',B05:'听声',B06:'察势',P01:'照料药圃',P02:'制干粮',P03:'缝布包',A01:'武学复盘',A02:'医案记录',A03:'辨药',A04:'行路常识',A05:'炊事',A06:'缝补',D01:'挑水',D02:'扫院',D03:'整理晾架',D04:'磨墨',D05:'补竹篓',C01:'送信',C02:'送物',W01:'院内',W02:'药签',W03:'来信',W04:'溪畔',W05:'承诺',W06:'复盘',W07:'出行',visitor_songfeng_route:'路况',visitor_whiteheron_records:'交接',visitor_zhaochuan_greeting:'来帖',gy_ledger:'对账',gy_goose_steps:'追鹅',gy_ye_mother:'旧伤',gy_dou_runaway:'山口',gy_shimu_birthday:'生辰'};
const name=a=>names[a.id]||a.name;
const art=(id,label,extra='')=>`<canvas class="cu-art" width="${id==='guidance'?544:512}" height="${id==='guidance'?462:['hero-listen','ye-hand'].includes(id)?615:512}" data-art="${id}" ${extra} role="img" aria-label="${E(label)}"></canvas>`;
const icon=id=>art('icon',D.categories.find(c=>c.id===id)?.name||'休息',`data-index="${[...D.categories.map(c=>c.id),'rest'].indexOf(id)}"`);
const ornament=i=>`<span class="cu-ornament" style="background-position:${i%4*100/3}% ${Math.floor(i/4)*100}%" aria-hidden="true"></span>`;
const thumbnail=a=>a.icon?`<img class="cu-art cu-place-icon" src="${a.icon}" alt="${E(a.name)}" draggable="false">`:a.storyPortrait?`<img class="cu-art" src="${a.storyPortrait}" alt="${E(a.name)}" draggable="false">`:P.atlas[a.id]?art(a.id,name(a)):art('action',name(a),`data-action="${a.artAlias||a.id}"`);
const date=s=>`第${['一','二','三'][Math.floor((s.month-1)/12)]}年${(s.month-1)%12+1}月${D.phases[s.phase]}`;
const monthNames=['一','二','三','四','五','六','七','八','九','十','十一','十二'];
const season=s=>['spring','summer','autumn','winter'][Math.floor(((s.month-1)%12)/3)];
const category=()=>D.categories.find(c=>c.id===state().selection.category);
const selected=()=>D.actions.find(a=>a.id===state().selection.action);
const why=a=>C.availability(state(),a,a.id==='C02'?{gift,recipient:recipient||undefined}:{});
const walkReviewed=()=>C.hasActivityInPeriod(state(),'W04');
function categoryFee(cat){const values=D.actions.filter(a=>a.category===cat.id).map(C.actionCost),low=Math.min(...values),high=Math.max(...values);return low===high?'体力 '+low:'体力 '+low+'–'+high;}
const nextDate=s=>s.month===36&&s.phase===4?'三年修习收束':date({...s,month:s.phase===4?s.month+1:s.month,phase:s.phase===4?0:s.phase+1});
// 写档统一走 persistState（saveKey）；会话缓存只是附带。
function persist(){S.currentMode=state().screen==='world'?'scene':'cultivation';persistState(S);try{sessionStorage.setItem(slot,JSON.stringify(S));}catch(e){message='本地已保存；会话缓存暂不可用。';}}
// 读档修复或放弃前，原培养数据整份另存到 S.cultivationQuarantine（保留最近 3 份），不删除。
function quarantine(raw,error,repairs){const list=Array.isArray(S.cultivationQuarantine)?S.cultivationQuarantine:[];list.push({at:new Date().toISOString(),error,repairs,original:JSON.parse(JSON.stringify(raw))});S.cultivationQuarantine=list.slice(-3);}
function renderBroken(){root.innerHTML='';panel('培养存档无法读取',`<p>这份培养进度与当前版本不兼容，无法自动修复：${E(broken.error)}</p><p>选择「以新的培养进度继续」时，原进度会先整份另存在存档里，不会删除；也可以先返回首页，用其他存档继续。</p><div class="cu-recovery-actions"><button data-cu="recovery-restart">以新的培养进度继续</button> <button data-cu="recovery-title">返回首页</button></div>`,false).querySelector('button')?.focus();}
function announce(t){message=t;const el=root?.querySelector('#cultivation-status');if(el)el.textContent=t;}
function perform(fn,focus){const before=JSON.stringify(S);try{message='';fn();C.reconcileWorld(S);persist();}catch(e){S=JSON.parse(before);announce('操作未保存，已还原：'+e.message);}render(focus);}
function ensureRoot(){if(root)return;root=document.createElement('section');root.id='cultivation';root.hidden=true;root.setAttribute('aria-label','归云谷养成');$('game').appendChild(root);root.addEventListener('click',onClick);M.bind(root);root.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.hidden=true;e.target.parentNode.classList.add('cu-art-missing');}},true);}
// 闲逛只列地点（gated 地点此刻有事才列出）和溪畔观察；具体支线到地点后按时间触发，不单独列出。
function availableActions(cat){if(cat.id==='skill')return D.actions.filter(a=>a.category==='skill'&&a.learn&&state().learned[a.learn]);if(cat.id==='stroll')return D.actions.filter(a=>a.category==='stroll'&&(a.strollPlace?!a.gated||C.strollPool(state(),a.place).length>0:a.id==='W04'));return D.actions.filter(a=>a.category===cat.id&&!a.auto&&!a.hidden&&(!a.visitor||(C.period(state())>=a.window[0]-2&&C.period(state())<=a.window[1]&&!state().facts[a.once])));}
function offerAvailable(){const s=state();return s.mode==='home'&&s.joined&&s.learned.stance&&D.actions.some(a=>a.category==='skill'&&a.learn&&a.id!=='QH01'&&!s.learned[a.learn]&&!C.availability(s,a))&&s.facts.weapon_offer_period!==C.period(s);}
function render(focus){if(!root||root.hidden)return;if(broken){renderBroken();return;}const s=state(),moodInfo=C.moodState(s),mood=moodInfo.id==='comfortable'?'calm':moodInfo.id,moodName=moodInfo.name;
 const mandatory=!!s.pending||!!s.summary||s.mode!=='home'||!s.joined,locked=mandatory||!!view;
 M.reset();const mailActive=s.selection.category==='mail'&&(['picker','gift-npc','letter-npc','mail-inbox'].includes(view)||!!s.pending);root.classList.toggle('cu-mail-active',mailActive);
 root.dataset.layout='simple-approved-v5';root.dataset.activity=mailActive?'mail':['picker','gift-npc','letter-npc','mail-inbox'].includes(view)?s.selection.category:'';root.dataset.mode=s.mode;
 root.innerHTML=`<div class="cu-scene"><img class="cu-background" src="assets/production/cultivation/bg_mountain_${season(s)}_v1.png" alt="归云谷庭院与山水"></div>
 <header class="cu-top" aria-label="培养日期"><div class="cu-calendar" aria-label="${date(s)}">${ornament(0)}<span class="cu-calendar-copy"><span>第${['一','二','三'][Math.floor((s.month-1)/12)]}年</span><span>${monthNames[(s.month-1)%12]}月${s.phase===0?'初':s.phase===4?'底':D.phases[s.phase]}</span></span></div><div class="cu-energy" role="img" aria-label="剩余体力${s.energy}点">${ornament(1)}<strong>${s.energy}</strong><span class="cu-energy-label">${ornament(7)}<span>体力</span></span></div></header>
 <div class="cu-mood" data-mood="${mood}" aria-label="萧白，心情${moodName}，学习效率 ${CultivationBalance.efficiency(s)}" title="心情：${moodName}（学习效率 ${CultivationBalance.efficiency(s)}）"><button class="cu-mood-open" data-cu="jianghu" aria-label="打开江湖页" ${mandatory?'disabled':''}></button><div class="cu-mood-portrait">${art('avatar','萧白 · 仅眼睛微动')}${ornament(3)}<span class="cu-mood-ring" aria-hidden="true"></span><span class="cu-mood-face" aria-hidden="true"><img class="cu-mood-head" src="assets/production/cultivation/mood-avatars-v1/${mood}.png?v=20261012" alt="" draggable="false"><img class="cu-mood-fx" src="assets/production/cultivation/mood-avatars-v1/${mood}_fx.png?v=20261012" alt="" draggable="false"></span></div><span class="cu-mood-name">${ornament(7)}<span>萧白</span></span><span class="cu-mood-tag">${ornament(4)}<span class="cu-mood-copy"><span>${moodName}</span></span></span></div>
 <button class="cu-settings-button" data-cu="settings" aria-label="养成设置" ${mandatory?'disabled':''}>${ornament(6)}</button>
 <footer class="cu-bottom"><nav class="cu-categories" aria-label="培养活动">${D.categories.map(c=>`<button data-cu="category" data-id="${c.id}" class="cu-category" ${locked?'disabled':''} aria-label="${(c.id==='mail'?'邮箱':c.name)+'，'+categoryFee(c)}">${icon(c.id)}<span class="cu-ink-label">${c.id==='mail'?'邮箱'+(s.letters.filter(l=>!l.id.startsWith('notice-')&&!l.read&&l.due<=C.period(s)).length?' · '+s.letters.filter(l=>!l.id.startsWith('notice-')&&!l.read&&l.due<=C.period(s)).length:''):c.name}</span></button>`).join('')}<button data-cu="rest" class="cu-rest" ${locked?'disabled':''} aria-label="休息，结束本期">${icon('rest')}<span class="cu-ink-label">休息</span></button></nav></footer><div id="cultivation-status" role="status" aria-live="polite">${E(message)}</div>`;
 if(!mandatory&&!view&&debugSchedule())root.insertAdjacentHTML('beforeend',visitorBulletin());
 if(!s.pending&&!view&&!s.letters.some(l=>l.id.startsWith('notice-')&&!l.read&&l.due<=C.period(s))){const auto=C.dueStory?.(s);if(auto){try{C.start(s,auto.id,{story:true});persist();root.querySelector('.cu-visitor-bulletin')?.remove();}catch(e){announce(e.message);}}}
 if(s.pending)renderPending();
 else if(s.summary)renderSummary();
 else if(s.mode==='story')renderDelivery();
 else if(s.mode==='journey_ready')renderDeparture();
 else if(s.mode==='journey')renderTravel();
 else if(s.mode==='complete')renderCompletion();
 else if(!s.joined)renderArrival();
 else if(!view&&s.letters.some(l=>l.id.startsWith('notice-')&&!l.read&&l.due<=C.period(s)))renderNotices();
 else if(!view&&offerAvailable())renderOffer();
 else if(['picker','gift-npc','letter-npc','mail-inbox'].includes(view))renderPicker();
 else if(view==='walk-review')renderWalkReview();
 else if(view==='rest')renderRest();
 else if(view==='settings')renderSettings();
 else if(view==='games')renderGames();
 else if(view==='training-record')panel('修习成果',record());
 if(message){const msg=document.createElement('div');msg.className='cu-message';msg.textContent=message;root.appendChild(msg);}
 const modal=root.querySelector('[role="dialog"]');if(modal)root.querySelector('.cu-visitor-bulletin')?.remove();root.querySelectorAll('.cu-categories button').forEach(b=>b.disabled=!!modal||!!s.pending||s.mode!=='home'||view==='picker');root.querySelector('.cu-settings-button').disabled=!!modal||!!s.pending||s.mode!=='home';
 const target=focus&&root.querySelector(focus);if(target&&!target.disabled)target.focus();else if(modal)modal.querySelector('button:not(:disabled)')?.focus();
 P.mount(root,tick);
}
function tick(now){const s=state(),p=s.pending;if(!p||p.story)return false;
 if(p.animation&&!p.animation.done&&!p.animation.presented){
  const frame=root.querySelector('.cu-training-frame'),actor=frame?.querySelector('[data-art="action"]');
  if(!actor||!actor._drawn&&!actor.classList.contains('cu-art-missing'))return false;
  try{p.animation.startedAt=now;p.animation.presented=true;frame.dataset.startedAt=String(now);persist();}catch(e){p.animation.presented=false;announce('动画状态暂时无法保存：'+e.message);return false;}
 }
 if(p.animation&&!p.animation.done&&now-p.animation.startedAt>=p.animation.duration){perform(()=>{C.finishAnimation(state(),now);if(state().pending.stage==='ready'||directPracticeResult())applyWorldLearning(C.resolve(state(),undefined,{directResult:directPracticeResult()}));});return true;}
 // Existing saves may be waiting on the removed course choice. Settle normally
 // after the animation, without fabricating a selected answer or charging again.
 if(directPracticeResult()&&p.stage==='choice'&&(!p.animation||p.animation.done)){perform(()=>applyWorldLearning(C.resolve(state(),undefined,{directResult:true})));return true;}
 if(p.stage==='result'&&!D.actions.find(a=>a.id===p.action)?.mail&&!p.result?.courseBeat&&!p.result?.lesson&&!p.result?.trainingChanged&&now-(p.resolvedAt||0)>=1000){finishResult();return true;}return false;
}
function finishResult(){const p=state().pending;if(!p||p.stage!=='result')return;perform(()=>{const teach=state().pending.result.first;C.closeResult(state());view=teach&&offerAvailable()?null:'picker';});}
function panel(title,body,close=true){const el=document.createElement('section');el.className='cu-overlay';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',title);el.innerHTML=`<header><h2>${title}</h2>${close?'<button data-cu="close" aria-label="返回谷中">返回 · Esc</button>':''}</header><div class="cu-panel-body">${body}</div>`;root.appendChild(el);return el;}
function board({guidance=false,teacher='周砚',action=null,playing=false,story=false}={}){const el=document.createElement('section');el.className='cu-training-frame'+(story?' cu-story-frame':'');el.setAttribute('aria-label',guidance?teacher+'指导萧白':'修炼过程');
 const clip=action?.artAlias|| (guidance?(action?.once?(action.artAlias||action.id):teacher==='叶蘅'?'G02':'G01'):action?.id||'B01');
 if(action?.id==='QH01'){el.innerHTML=`<div class="cu-illustration"><img src="${action.storyPortrait}" alt="陆衡 · 护路棍法笔记来源" style="height:100%;max-width:100%;object-fit:contain"></div>`;root.appendChild(el);return el;}
 el.dataset.clip=clip;el.dataset.finished=String(!!state().pending?.animation?.done);
 el.innerHTML=`${art('frame','木质画框')}<div class="cu-illustration">${art('action',guidance?teacher+'指导萧白':action?.name||'修习',`data-action="${clip}"`)}</div>`;
 if(playing){el.classList.add('cu-playing');if(state().pending.animation.presented)el.dataset.startedAt=state().pending.animation.startedAt;}
 root.appendChild(el);return el;
}
function trainingHint(a){return ' · '+CultivationBalance.courseHint(state(),a)+'；'+CultivationGrowth.hints(state(),a.gain,D.actions);}
function footer(title,actions,locked=false){root.querySelector('.cu-categories').hidden=true;const el=document.createElement('nav');el.className='cu-submenu';el.setAttribute('aria-label',title);el.innerHTML=`<button class="cu-back" data-cu="close" aria-label="返回谷中" ${locked?'disabled':''}>${art('return','返回')}<span class="cu-ink-label">返回</span></button>${actions.map(a=>{const review=a.id==='W04'&&walkReviewed(),reason=review||a.mail?'':why(a),cost=review?0:C.actionCost(a),hint=review?'本期观察已记录 · 免费查看':reason||(a.strollPlace?a.task:name(a)+(cost?' · 体力 '+cost:'')+trainingHint(a));const dot=a.strollPlace&&!reason&&C.strollPool(state(),a.place).length>0;return `<button class="cu-course-card ${reason?'cu-unavailable':''}" data-cu="${review?'walk-review':a.mail?'mail-select':'practice'}" data-id="${a.id}" ${locked?'disabled':''} aria-disabled="${!!reason||locked}" ${a.mail?'':`aria-pressed="${state().pending?.action===a.id}"`} aria-label="${E(name(a))}，${E(hint)}">${a.id==='C01'?icon('mail'):a.id==='C02'?art('gift','送物'):thumbnail(a)}<span class="cu-ink-label">${E(name(a))}</span>${cost&&!review?`<b class="cu-cost" aria-hidden="true">${cost}</b>`:''}${dot?'<i class="cu-story-dot" aria-label="这里现在有事可遇"></i>':''}<span class="cu-tooltip" role="tooltip">${E(hint)}</span></button>`;}).join('')}`;root.querySelector('.cu-bottom').appendChild(el);return el;}
function renderPicker(){const cat=category();if(cat.id==='mail'){renderMail();return;}const list=availableActions(cat),f=footer(cat.name+'项目',list);if(!list.length)f.insertAdjacentHTML('beforeend','<p class="cu-empty">尚未学会招式，受教后在此练习。</p>');}
function renderWalkReview(){const a=D.actions.find(a=>a.id==='W04');applyScene(a);footer('闲逛项目',availableActions(category()),true);board({action:a});const h=state().history.findLast(h=>h.period===C.period(state())&&h.action==='W04'),el=document.createElement('div');el.className='cu-gain';el.setAttribute('role','status');el.innerHTML=`<strong>本期溪畔观察</strong><small>${E(a.feedback)}</small><small>已记录成果＋${h.gain} · 本次查看免费</small><button data-cu="close">返回</button>`;root.appendChild(el);}
function renderMail(kind=view==='mail-inbox'?'inbox':view==='gift-npc'?'gift':view==='letter-npc'?'letter':'mail'){M.mount(root,{kind,s:state(),world:S,items:ITEMS,recipient:state().pending?.recipient||recipient,date:date(state()),art});}
function closeView(){if(M.closeBag())return;const previous=view,picker=['gift-npc','letter-npc'].includes(previous);message='';view=picker||previous==='walk-review'?'picker':null;recipient='';render(previous==='walk-review'?'[data-cu="walk-review"]':picker?`[data-cu="mail-select"][data-id="${previous==='letter-npc'?'C01':'C02'}"]`:`[data-cu="category"][data-id="${state().selection.category}"]`);}
function gainSummary(r){const g=r.gainKey,b=r.training?.before.progress?.[g]||0,a=r.training?.after.progress?.[g]||0;return E(r.gainName||'修习')+(r.gain?' +'+r.gain+'（累计 '+b+' → '+a+'）':'');}
function trainingResult(r){const t=r.training;if(!t)return '';const changes=CultivationGrowth.outcome(t.before,t.after);r.trainingChanged=changes.length>0||!!r.nextEffect||!!r.relationshipChanges?.length;return `${r.courseBeat?`<p>${E(r.courseBeat)}</p>`:''}${changes.map(x=>`<span>${E(x.name)} +${x.delta}${x.unit}（培养累计 ${x.before} → ${x.after}）</span>`).join('')}${r.nextEffect?`<small>${E(r.nextEffect)}</small>`:''}${Object.entries(t.after.martial).filter(([k,v])=>v.level!==(t.before.martial[k]?.level||0)).map(([k,v])=>`<span>《${E(v.name)}》 ${t.before.martial[k]?.level||0} → ${v.level}${v.type==='inner'?'层':'重'}</span>`).join('')}${(r.relationshipChanges||[]).map(x=>`<span>♡ ${E(x.name)} ${x.before} → ${x.after}（${E(x.stage)}${x.reason?' · '+E(x.reason):''}）</span>`).join('')}`;}
// 剧情与活动的场景（地点＋时间）统一由 CultivationScenes 解析：换背景、挂地点牌、夜间人物压暗。
function applyScene(scene){const r=window.CultivationScenes?.resolve(scene,season(state()));const bg=root.querySelector('.cu-background');if(r&&bg){bg.src=r.src;bg.alt=r.alt;}return r;}
function sceneTag(el,r){if(!el||!r)return;el.dataset.place=r.place;el.dataset.time=r.shown;const tag=document.createElement('p');tag.className='cu-place-tag';tag.textContent=r.name;if(r.timeName){const tm=document.createElement('small');tm.textContent=r.timeName;tag.appendChild(tm);}el.appendChild(tag);}
const lineScene=(x,a)=>({place:x?.place!==undefined?x.place:a.place,time:x?.time!==undefined?x.time:a.time});
function renderPending(){
 const lp=state().pending;if(lp?.stage==='result'&&lp.result?.lesson){const ls=lp.result.lesson.lines,at=Math.min(lp.lessonCursor||0,ls.length-1),l=ls[at];const el=Q.render(root,{title:D.actions.find(a=>a.id===lp.action).name,text:l[1],speaker:l[0],cast:['hero',lp.result.lesson.speaker],buttons:Q.next(at===ls.length-1?'result-close':'lesson-next')});applyScene(D.actions.find(a=>a.id===lp.action));el.dataset.lesson=lp.result.lesson.kind;return;}
const p=state().pending,a=D.actions.find(a=>a.id===p.action),playing=!!p.animation&&!p.animation.done;
 if(p.story){renderActivityStory(a,p);return;}
 if(a.mail){renderMail(p.stage==='result'?'result':'motion');return;}
 applyScene(a);footer(category().name+'项目',availableActions(category()),true);board({guidance:!!p.guidance,teacher:a.teacher,action:a,playing});
 if(p.stage==='result'){const r=p.result;const msg=document.createElement('div');msg.className='cu-gain';msg.setAttribute('role','status');msg.innerHTML=`<strong>${a.mail?E(a.id==='C01'?'信已寄出':r.feedback):gainSummary(r)}</strong>${Object.entries(r.outputs).map(([k,n])=>`<span>${D.resources[k]} +${n}</span>`).join('')}${trainingResult(r)}<button data-cu="result-close">继续培养</button>`;root.appendChild(msg);return;}
 if(!playing&&p.stage==='choice'&&!directPracticeResult()){const el=document.createElement('div');el.className='cu-story-choice';el.setAttribute('role','dialog');el.setAttribute('aria-label','本次受教选择');el.innerHTML=a.choice.map((t,i)=>`<button data-cu="resolve" data-id="${i}">${E(t)}</button>`).join('');root.appendChild(el);}
}
function story(title,text,buttons,scene={}){board({guidance:true,story:true,...scene});const el=document.createElement('section');el.className='cu-story-caption';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',title);el.innerHTML=`<h2>${title}</h2><p>${text}</p><div class="cu-choices">${buttons}</div>`;root.appendChild(el);return el;}
const storyText=(id,fallback)=>window.CultivationDialogue?.ui[id]??fallback;
function renderArrival(){if(Q?.enabled){Q.render(root,{title:'归云谷 · 正式入门',text:storyText('arrival','既入了门，就安心留下。\n明早来练场，我教你站桩和调息。'),buttons:Q.next('arrival-next'),moods:{hero:'serious',zhou:'serious'}});return;}story('归云谷 · 正式入门','周砚收萧白入门。先从站稳与调息学起；武学须经正式受教。叶蘅仍是暂住医者。','<button data-cu="arrival-next">继续</button>');}
function renderOffer(){const skills=D.actions.filter(a=>a.category==='skill'&&a.learn&&!state().learned[a.learn]&&!C.availability(state(),a)),advanced=skills.some(a=>a.id.startsWith('TR_'));
 if(Q?.enabled){const choice=state().dialogue?.id==='weapon-offer'&&state().dialogue.period===C.period(state());Q.render(root,{title:'周砚传艺',text:advanced?(choice?'我想请教……':'旧课练得如何，我都看过了。\n今天可以往下学了，选好一门，我带你练。'):choice?storyText('offer-choice','师父，我想学……'):storyText('offer','今天的新课已经可以开始了。\n选好要学的，我带你拆开练。'),speaker:choice?'hero':'zhou',choice,moods:{hero:'serious',zhou:'serious'},buttons:choice?skills.map(a=>Q.answer('teach',a.id,name(a),C.actionCost(a))).join('')+Q.answer('offer-later','','改日受教'):Q.next('offer-next')});return;}
 const el=story('周砚传艺','根基已稳，可以开始学习一门入门招式。',skills.map(a=>`<button class="cu-teaching-pick" data-cu="teach" data-id="${a.id}">${thumbnail(a)}<span>${name(a)} · ${C.actionCost(a)}点</span></button>`).join('')+'<button data-cu="offer-later">改日受教</button>');el.classList.add('cu-offer');}
function renderActivityStory(a,p){if(a.visitor){renderVisitorStory(a,p);return;}const labels=Q?.labels||{zhou:'周砚',ye:'叶蘅',lu:'陆衡'},person=Object.keys(labels).find(id=>labels[id]===a.teacher)||'neighbor',choice=p.stage==='choice'&&p.storyStep===1,result=p.stage==='result';
 const lines=(a.introByDelivery?.[state().facts.first_delivery?.method])||a.introLines||[{speaker:person,text:a.task}],line=lines[Math.min(p.storyLine||0,lines.length-1)];
 const text=result?(a.resultLine||a.feedback):choice?'我想先……':line.text,speaker=result?person:choice?'hero':line.speaker;
 const buttons=result?(Q?.enabled?Q.next('story-result-close','结束这段剧情'):'<button data-cu="story-result-close">结束这段剧情</button>'):choice?a.choice.map((t,i)=>`<button data-cu="resolve" data-id="${i}">${E(t)}</button>`).join(''):(Q?.enabled?Q.next('activity-story-next'):'<button data-cu="activity-story-next">继续</button>');
 if(Q?.enabled){const sc=applyScene(a);const el=Q.render(root,{title:name(a),text,speaker,cast:line.cast||a.cast||['hero',person],choice,buttons});sceneTag(el,sc);return;}
 panel(name(a),`<p>${E(({hero:'萧白',zhou:'周砚',ye:'叶蘅',lu:'陆衡'})[speaker]||a.teacher)}：${E(text)}</p><div class="cu-choices">${buttons}</div>`,false);
}

function renderVisitorStory(a,p){
 const x=V.current(p),result=p.stage==='result',choice=!!x.choices&&!result;
 // 剧情场景：每句的地点＋时间（师门剧情逐句沿用，来客取定义），时间卡也先换好背景。
 const sc=Q?.render?applyScene(lineScene(x,a)):null;
 // 时间过场：全屏水墨字幕卡（入谷过渡等线性演出）。
 if(x.speaker==='title'&&!result){const el=document.createElement('section');el.className='cu-time-card';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',x.text);el.innerHTML=`<p>${E(x.text)}</p>${Q.next('visitor-next','继续')}`;root.appendChild(el);return;}
 const buttons=result?Q.next('story-result-close',a.household?'结束这段剧情':'结束来访，继续培养'):choice?(a.training&&p.visitor.context.preHangao?.route!=='life'?Q.answer('visitor-training','','开始考校：按师父口令收招'):a.fight?Q.answer('visitor-fight','',a.sparWith?'开始切磋':'迎战'):x.choices.map((c,i)=>Q.answer('visitor-choice',String(i),c.text)).join('')):Q.next('visitor-next');
 if(choice&&a.fight)x.text=a.sparWith?'（摆开架势。）':'（握紧手里的家伙。）';
 const text=x.text;
 const cast=x.cast||a.cast;
 if(Q?.render){const el=Q.render(root,{title:a.name,text,speaker:x.speaker,cast,choice,buttons,event:a.id,line:result?{speaker:x.speaker,text:x.text,duo:x.duo,duoCast:x.duoCast}:x});el.classList.add('cu-visitor-story');sceneTag(el,sc);el.dataset.visitor=a.id;el.dataset.phase=result?'result':p.visitor.phase;el.dataset.line=String(p.visitor.cursor);if(x.letterAuthor){el.classList.add('cu-letter-scene');el.querySelector('.cu-speech h2').textContent=x.letterAuthor+' · 署名信件';}if(result&&(p.result.gain||p.result.relationshipChanges?.length)){const gain=document.createElement('div');gain.className='cu-story-outcome';gain.setAttribute('role','status');gain.innerHTML=`${p.result.gain?`<strong>✦ ${gainSummary(p.result)}</strong>`:''}${trainingResult(p.result)}`;el.appendChild(gain);}}
 else panel(a.name,`<h3>${E(x.speaker==='narrator'?'旁白':a.teacher)}</h3><p>${E(text)}</p><div class="cu-choices">${buttons}</div>`,false);
}
const strollPlaceName=d=>{const S=window.CultivationScenes;return S?S.PLACES[S.placeKey(d.place)].name.replace('归云谷 · ',''):'';};
function householdLines(s){const quiet=d=>d.quiet;const H=V.household;if(!H)return '';return H.upcoming(s).filter(d=>!quiet(d)&&(!(d.heart||d.bottleneck)||!C.availability(s,D.actions.find(a=>a.id===d.id)))).map(d=>`<p class="cu-household-line"><strong>${E(d.heart?'心意 · '+d.heart+' · '+d.name:d.auto?'师门 · '+d.name:'师门支线 · '+d.name)}</strong><span>${E(d.auto?'到期自动开场':d.heart?'闲逛'+strollPlaceName(d)+(d.time==='night'?'（夜）':'')+' · 随时可去，不会过期':'闲逛'+strollPlaceName(d)+' · 至'+date({month:Math.floor(d.window[1]/5)+1,phase:d.window[1]%5}))}</span></p>`).join('');}
// 谷中日程是调试用的提示（2026-10-11 用户：暂时保留，正式版不显示）。设置里可关，存在本机。
const debugSchedule=()=>{try{return localStorage.getItem('cu.debugSchedule')!=='off';}catch(e){return true;}};
function visitorBulletin(){const s=state(),now=C.period(s);const visitors=V.definitions.filter(d=>now>=d.window[0]-2&&now<=d.window[1]+1),house=householdLines(s);if(!visitors.length&&!house||s.mode!=='home')return '';return '<section class="cu-visitor-bulletin" aria-label="谷中日程（调试）"><p class="cu-debug-tag">调试 · 谷中日程</p>'+house+visitors.map(d=>`<p><strong>${E(d.teacher)} · ${E(V.status(s,d))}</strong><span>${E(s.facts[d.id+'_seen']?'交谈已完成，相遇已记录':now>d.window[1]?d.expired:now<d.window[0]?d.notice:'在接待廊参与交谈')}</span></p>`).join('')+'</section>';}

function renderNotices(){const s=state(),letters=s.letters.filter(l=>l.id.startsWith('notice-')&&!l.read&&l.due<=C.period(s));panel('谷中消息',letters.map(l=>`<p>${E(l.body)}</p>`).join('')+'<button data-cu="notice-close">知道了 · 继续培养</button>',false);}
function renderRest(){const s=state();panel('结束本期',`<p>结束本期，自由安排下期活动。</p><p>下一阶段：${E(nextDate(s))}</p><button data-cu="close">继续安排</button><button data-cu="rest-confirm">确认休息</button>`);}
function renderSummary(){const s=state(),t=s.summary;panel('第'+t.month+'月 · 月底小结',`<p>完成${t.entries.length}次活动或行程。</p>${record()}<button data-cu="summary-close">继续</button>`,false);}
function renderDelivery(){if(Q?.enabled){const choice=state().dialogue?.id==='delivery';Q.render(root,{title:'三月中旬 · 同行送药',text:choice?storyText('delivery-choice','这段路，我想……'):(state().learned.footwork?storyText('delivery-trained','你练过落脚，前面那段跟我走。别光盯着脚下，也看看同伴在哪儿。'):storyText('delivery-untrained','步法还没练过，就先帮着分包。路上拿不准，叫我一声，别硬撑。')),speaker:choice?'hero':'lu',cast:['hero','ye','lu'],choice,buttons:choice?Q.answer('story-complete','协同行路','留意落脚，协同行路')+Q.answer('story-complete','请陆衡指导','请陆衡指出稳妥的路'):Q.next('delivery-next')});return;}story('三月中旬 · 同行送药',state().learned.footwork?'陆衡带队：用已学落脚，在指导下负责一段运输。本期占整期。':'陆衡带队：可以协助分包或直接求助，不把未练步法算成已经会用。本期占整期。','<button data-cu="story-complete" data-id="协同行路">留意落脚，协同行路</button><button data-cu="story-complete" data-id="请陆衡指导">请陆衡指出稳妥的路</button>',{guidance:false,action:D.actions.find(a=>a.id==='W04')});}
function renderDeparture(){panel('整月历练',`<p>本月用于自由探索，占用整月五期；谷中活动暂停。</p><p>返程后直接进入第 ${state().month+1} 月月初。</p><button class="cu-primary" data-cu="depart">出发</button>`,false);}
function renderTravel(){const s=state();if(s.journey.kind==='hangao_gate'){applyScene({place:'hangao_gate',time:'day'});const el=panel('汉皋 · 南门',`<p>这一程，到这里。未完待续。</p><p>同行之人、行囊与一路见闻都已记下。</p><button data-cu="jianghu">查看行记</button><button data-cu="gate-title">返回标题 · 已保存</button>`,false);el.classList.add('cu-gate-end');return;}const el=panel('本月行程',`<p>本月整月在外历练。提前返程仍占整月。</p>${view==='return-preview'?'<button class="cu-primary" data-cu="return-confirm">确认返程 · 进入下月</button><button data-cu="return-cancel">继续探索</button>':'<button data-cu="return-preview">准备返程</button>'}`,false);el.classList.add('cu-travel');}
function renderCompletion(){panel('三年修习收束',`<p>36个月已经走完。学习来源、生活材料与实际经历均已保留。</p><p>正式出师剧情与后续章节仍待补充。</p><button data-cu="completion-record">查看修习成果</button>${view==='completion-record'?record():''}`,false);}
function record(){const s=state();return `<div class="cu-record">${trainingResult({training:{before:C.growth(C.initial()),after:C.growth(s)}})}${Object.entries(s.progress).map(([k,n])=>`<p>${E(D.progressNames[k]||k)} <strong>${n}</strong><small>${E(CultivationGrowth.rules[k]?.use||'已记录的经历')} · ${E(CultivationGrowth.hints(s,k,D.actions))}</small></p>`).join('')||'<p>本次以休养为主。</p>'}</div>`;}
function renderSettings(){panel('养成设置',`<button data-cu="sound" aria-pressed="${!window.__audio?.muted}">${window.__audio?.muted?'开启声音':'关闭声音'}</button><button data-cu="martial-menu">武学与装备</button><button data-cu="debug-schedule" aria-pressed="${debugSchedule()}">调试：谷中日程 ${debugSchedule()?'开':'关'}</button><button data-cu="training-record">查看修习成果</button><button data-cu="games">小游戏候选试玩</button><p class="cu-settings-note">候选试玩不推进行程，不计入剧情与修习成果。</p>`);}
function renderGames(){const el=panel('小游戏候选试玩','<div class="cu-game-host"></div>');el.classList.add('cu-games');CultivationMinigames.mount(el.querySelector('.cu-game-host'));}
function applyWorldLearning(){C.reconcileWorld(S);}
// 切磋与实战：对白走到“开始”时进真实战斗，胜负各接一段对白（choices 的 win／lose）。战斗用培养里学到的招式，不会战败出局。
let fighting=false;
async function runFight(s){const d=D.actions.find(x=>x.id===s.pending?.action);if(fighting||!d?.fight||s.pending.visitor?.phase!=='choice')return;fighting=true;let result='lose';const practiceWeapon=S.weapon;
 try{applyWorldLearning();P.stop?.();root.hidden=true;document.body.classList.remove('cultivation-view');const options=V.household.fightOptions(d);options.guiyunHero=true;options.heroPor='gy_hero_long';if(d.id==='gy_bamboo_wolves')options.temporaryDou=true;result=await battle(options);}
 catch(e){console.error(e);announce('这场没有打成：'+e.message);}
 finally{S.weapon=practiceWeapon;mode='cultivation';for(const k of['hud','prompt','mapui','tpad','panel'])if($(k))$(k).hidden=true;root.hidden=false;document.body.classList.add('cultivation-view');fighting=false;}
 perform(()=>C.visitorChoose(s,result==='win'?0:1));}
async function runTraining(s){
 if(fighting||s.pending?.action!=='gy_zhou_test'||s.pending.visitor.phase!=='choice')return;
 fighting=true;const opt=GuiyunCombat.trainingOptions(s.pending.visitor.context.preHangao.route),weapon=S.weapon;opt.guiyunHero=true;opt.heroPor='gy_hero_long';
 try{applyWorldLearning();if(opt.training.route==='sword'&&ITEMS[S.weapon]?.weapon?.kind!=='剑')throw Error('剑路考校请先装备已领取或已有的剑');P.stop?.();root.hidden=true;document.body.classList.remove('cultivation-view');await battle(opt);
  const key=opt.training.result||'hasty',index=V.eventScript(s.pending).choices.findIndex(c=>c.key===key);if(index<0)throw Error('考校结果无法接续');C.visitorChoose(s,index);
 }catch(e){announce('考校未完成：'+e.message);}
 finally{S.weapon=weapon;mode='cultivation';for(const k of ['hud','prompt','mapui','tpad','panel'])if($(k))$(k).hidden=true;root.hidden=false;document.body.classList.add('cultivation-view');fighting=false;perform(()=>{});}
}
function begin(id,teaching=false){if(id==='QH01'){perform(()=>{C.start(state(),id,{directResult:true});C.resolve(state(),0);applyWorldLearning();view=null;});return;}const a=D.actions.find(a=>a.id===id);if(!a)return;if(a.category==='skill'&&a.learn&&!state().learned[a.learn]&&!teaching){announce('请先完成师父的传艺，再来练习。');return;}
 // 去的地方此刻没事：留在闲逛条上，把“没遇到什么”的那句话显示出来（以前直接关掉选项条，看起来像什么都没发生）。
 if(a.strollPlace){let idle='';perform(()=>{const r=C.stroll(state(),id);idle=r.story?'':r.text;view=r.story?null:'picker';});if(idle){message=idle;render(`[data-cu="practice"][data-id="${id}"]`);announce(idle);}return;}
 if(a.once){perform(()=>{C.start(state(),id,{story:true});view=null;});return;}
 perform(()=>{const guidance=!!a.learn&&!state().learned[a.learn]||!!a.once&&['周砚','叶蘅'].includes(a.teacher);C.start(state(),id,{theme:'近况',recipient:a.mail?recipient:undefined,gift:id==='C02'?gift:undefined,animate:true,directResult:directPracticeResult()});state().pending.guidance=guidance;state().pending.animation.presented=false;view=null;});}
function onClick(e){const b=e.target.closest('[data-cu]');if(!b||b.disabled)return;const a=b.dataset.cu,id=b.dataset.id,s=state();
 if(broken){if(a==='recovery-title')location.href=location.pathname;else if(a==='recovery-restart'){quarantine(S.cultivation,broken.error,[]);delete S.cultivation;broken=null;window.QiheCultivationBridge?.migrate();start({inherit:true});}return;}
 if(M.isBagOpen()&&!b.closest('.cu-mail-bag')&&a!=='mail-bag-close')return;
 if(M.handleAction(a))return;
 if(s.pending){if(['visitor-next','visitor-choice','visitor-fight','visitor-training','story-result-close','result-close','lesson-next'].includes(a))window.CharacterVoice?.stop();if(a==='lesson-next'){perform(()=>{s.pending.lessonCursor=(s.pending.lessonCursor||0)+1;});return;}if(a==='visitor-next'){const linear=!!D.actions.find(x=>x.id===s.pending.action)?.linear;perform(()=>{applyWorldLearning(C.visitorNext(s));if(linear&&s.pending?.stage==='result'){C.closeResult(s);view=null;}});return;}if(a==='visitor-choice'){perform(()=>C.visitorChoose(s,Number(id)));return;}if(a==='visitor-fight'){runFight(s);return;}if(a==='visitor-training'){runTraining(s);return;}if(s.pending.animation&&!s.pending.animation.done)return;
  if(s.pending.story&&a==='activity-story-next'){const x=D.actions.find(x=>x.id===s.pending.action),n=((x.introByDelivery?.[s.facts.first_delivery?.method])||x.introLines||[]).length,at=s.pending.storyLine||0;perform(()=>{if(at+1<n)s.pending.storyLine=at+1;else s.pending.storyStep=1;});return;}
  if(s.pending.story&&a==='story-result-close'){const auto=!!D.actions.find(x=>x.id===s.pending.action)?.auto;perform(()=>{C.closeResult(s);view=auto?null:'picker';});return;}
  if(a==='result-close'&&s.pending.stage==='result'){finishResult();return;}
  if(a==='resolve'){perform(()=>applyWorldLearning(C.resolve(s,Number(id))));}return;}
 if(a==='category'){const cat=D.categories.find(c=>c.id===id);if(!cat||s.mode!=='home')return;const list=availableActions(cat);s.selection={category:id,action:id==='skill'?null:list[0]?.id||D.actions.find(a=>a.category===id).id};view='picker';message='';render(id==='mail'?'.cu-mail-header button':'.cu-back');return;}
 if(a==='walk-review'){if(s.selection.category!=='stroll'||!walkReviewed())return;view='walk-review';message='';render('[data-cu="close"]');return;}
 if(a==='practice'){const action=D.actions.find(a=>a.id===id);const reason=why(action);if(reason){announce(reason);render();return;}s.selection.action=id;begin(id);return;}
 if(a==='mail-select'){if(s.selection.category!=='mail'||!['C01','C02'].includes(id))return;s.selection.action=id;message='';recipient='';view=id==='C01'?'letter-npc':'gift-npc';render(`[data-cu="${view}"]`);return;}
 if(a==='gift-npc'){if(view!=='gift-npc'||!C.giftRecipients(s).some(n=>n.name===id))return;recipient=id;render('[data-cu="mail-open-bag"]');return;}
 if(a==='letter-npc'){if(view!=='letter-npc'||!C.letterRecipients(s).some(n=>n.name===id))return;recipient=id;render(!C.availability(s,D.actions.find(a=>a.id==='C01'),{recipient:id})?'[data-cu="mail-send"]':'[data-cu="letter-npc"][aria-pressed="true"]');return;}
 if(a==='mail-inbox'){if(s.selection.category!=='mail')return;view='mail-inbox';render();return;}
 if(a==='mail-read'){if(view!=='mail-inbox')return;perform(()=>{const l=C.readLetter(s,id);message=Object.keys(l.returnItems||{}).length?'回信已读，回物已收进培养包裹。':'回信已读。';});return;}
 if(a==='mail-send'){if(view!=='letter-npc'||!M.canSendLetter())return;begin('C01');return;}
 if(a==='gift-item'){if(view!=='gift-npc'||!M.canGift(id,b.dataset.key))return;gift=id;begin('C02');return;}
 if(a==='close'){closeView();return;}
 if(a==='martial-menu'){P.stop();QiheCultivationBridge.openMartial();return;}
 if(a==='debug-schedule'){try{localStorage.setItem('cu.debugSchedule',debugSchedule()?'off':'on');}catch(e){}render('[data-cu="debug-schedule"]');return;}
 if(a==='jianghu'){if(s.pending||view)return;P.stop();QiheCultivationBridge.openJianghu();return;}
 if(a==='notice-close'){perform(()=>{for(const l of s.letters)if(l.id.startsWith('notice-')&&l.due<=C.period(s))l.read=true;view=null;});return;}
 if(a==='arrival-next'){perform(()=>{C.join(s);view=null;});return;}
 if(a==='offer-next'){perform(()=>{s.dialogue={id:'weapon-offer',period:C.period(s)};});return;}
 if(a==='delivery-next'){perform(()=>{s.dialogue={id:'delivery'};});return;}
 if(a==='teach'){perform(()=>{s.facts.weapon_offer_period=C.period(s);s.dialogue=null;});s.selection={category:'skill',action:id};begin(id,true);return;}
 if(a==='offer-later'){perform(()=>{s.facts.weapon_offer_period=C.period(s);s.dialogue=null;view=null;});return;}
 if(['rest','settings','games','training-record','return-preview','completion-record'].includes(a)){view=a;message='';render();return;}
 if(a==='return-cancel'){view=null;render();return;}
 if(a==='sound'){window.__audio?.setMute(!window.__audio.muted);render('[data-cu="sound"]');return;}
 if(a==='rest-confirm'){perform(()=>{C.advance(s);view=null;});return;}
 if(a==='summary-close'){perform(()=>{s.summary=null;view=null;});return;}
 if(a==='story-complete'){perform(()=>{C.completeStory(s,id);s.dialogue=null;view=null;});return;}
 if(a==='depart'){perform(()=>{C.depart(s);view=null;});return;}
 if(a==='gate-title'){persist();location.href=location.pathname;return;}
 if(a==='return-confirm'){perform(()=>{PeiCompanion.returnLoan(S);C.returnJourney(s);view=null;});return;}
}
// 旧版第 5 月「襄阳街市/南门/偏巷/渡口」走访与 #xiangyang 青蚨散章节衔接已于 2026-10-19 归档；现行第 5 月由汉皋城门剧情收束（qh-pre-hangao）。
function start(options={}){ensureRoot();let loaded=options.state||null;if(!loaded&&!options.inherit){try{loaded=JSON.parse(sessionStorage.getItem(slot)||'null');if(!loaded?.cultivation)loaded=null;}catch(e){loaded=null;}}
 P.stop();CultivationMotion.stop();if(loaded)S=loaded;else if(!options.inherit){S=newState();S.name='萧白';S.origin='prologue';S.skills={};S.bag={};S.weapon=null;S.armor=null;S.party=[];S.pet=null;S.pets={};}
 ORIGINS.prologue||={name:'异乡来客',desc:'萧白，现代来客；武学按正式教学学习。',bonus:{},skill:'fist',silver:0};
 SKILLS.fist.desc='普通拳脚攻击；门派所授《守拙拳法》另记为守拙立桩。';
 // 读档校验失败不抛错卡死：能修的修好并隔离原数据，修不了显示出口（renderBroken），不覆盖原存档。
 broken=null;let notice='';
 if(!S.cultivation)S.cultivation=C.initial();else{const r=C.recover(S.cultivation);if(!r.state){console.error('培养存档无法读取：',r.error);broken={error:r.error};$('panel').hidden=true;resetPanel();$('hud').hidden=true;$('prompt').hidden=true;$('mapui').hidden=true;$('tpad').hidden=true;if($('dlg'))$('dlg').hidden=true;mode='cultivation';busy=false;dlgBusy=false;root.hidden=false;document.body.classList.add('cultivation-view');view=null;render();return;}
  if(r.repairs.length){console.warn('培养存档已修复：',r.error,r.repairs);quarantine(S.cultivation,r.error,r.repairs);notice='培养存档有失效内容，已修复：'+r.repairs.join('；')+'。原数据已另存。';}S.cultivation=r.state;}
 const pending=state().pending;
 // Preserve the paid legacy event, moving its unresolved choice into dialogue.
 if(Q?.enabled&&pending&&!pending.story&&D.actions.find(a=>a.id===pending.action)?.once){pending.story=true;pending.storyStep=pending.animation&&!pending.animation.done?0:1;delete pending.animation;if(pending.stage!=='result')pending.stage='choice';}
 if(state().pending&&!state().pending.story&&state().pending.stage!=='result'&&!state().pending.animation)C.beginAnimation(state());
 if(state().pending?.animation&&!state().pending.animation.done)state().pending.animation.presented=false;
 C.syncNotices(state());C.reconcileWorld(S);const d=derived();if(!loaded&&!options.inherit){S.hp=d.mhp;S.mp=d.mmp;}S.hp=Math.max(1,Math.min(S.hp||d.mhp,d.mhp));S.mp=Math.min(S.mp||d.mmp,d.mmp);
 $('panel').hidden=true;resetPanel();$('hud').hidden=true;$('prompt').hidden=true;$('mapui').hidden=true;$('tpad').hidden=true;if($('dlg'))$('dlg').hidden=true;if($('cultivation-world-return'))$('cultivation-world-return').hidden=true;mode='cultivation';busy=false;dlgBusy=false;root.hidden=false;document.body.classList.add('cultivation-view');view=null;recipient='';message=notice;try{persist();}catch(e){message=(notice?notice+' ':'')+'进度未能保存：'+e.message;window.showSaveWarning?.(e);}render();
 // 旧存档若停在襄阳走访场景（screen='world'），回到本月行程面板，不再进入已归档的场景。
 if(state().screen==='world'){state().screen='hub';try{persist();}catch(e){}render();}
}
addEventListener('keydown',e=>{if(!root||root.hidden||mode!=='cultivation'||broken)return;if(view==='games'&&!['Escape','Tab'].includes(e.key))return;const key=e.key.toLowerCase(),s=state(),dialog=root.querySelector('[role="dialog"]');
 if(key==='m'&&view==='settings'){setTimeout(()=>{if(view==='settings')render('[data-cu="sound"]');},0);return;}
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!s.pending&&!s.summary&&['picker','gift-npc','letter-npc','walk-review','rest','settings','games','training-record'].includes(view)){closeView();}return;}
 // 对白有 ▾ 时，空格／回车直接推进，不依赖按钮焦点，也不让底层章节对话抢走按键。
 if([' ','Enter'].includes(e.key)&&!e.repeat){const nx=dialog?.querySelector('.cu-dialogue-next'),at=document.activeElement;if(nx&&(at===nx||!at||!at.closest?.('button,input,select,textarea'))){e.preventDefault();e.stopImmediatePropagation();nx.click();return;}}
 if(!s.pending&&!dialog&&s.mode==='home'){
  if(key==='r'){e.preventDefault();e.stopImmediatePropagation();view='rest';render();return;}
  if(/^[1-7]$/.test(key)){e.preventDefault();e.stopImmediatePropagation();const cat=D.categories[+key-1];const list=availableActions(cat);s.selection={category:cat.id,action:list[0]?.id||D.actions.find(a=>a.category===cat.id).id};view='picker';render(cat.id==='mail'?'.cu-mail-header button':'.cu-back');return;}
  if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)&&view==='picker'){const list=[...root.querySelectorAll('.cu-submenu button:not(:disabled)')],i=list.indexOf(document.activeElement);if(i>=0){e.preventDefault();e.stopImmediatePropagation();list[(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:list.length-1))%list.length].focus();return;}}
 }
 if(e.key==='Tab'&&dialog){const buttons=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(b=>b.getClientRects().length),i=buttons.indexOf(document.activeElement);if(buttons.length&&(e.shiftKey&&i<=0||!e.shiftKey&&(i===buttons.length-1||i<0))){e.preventDefault();buttons[e.shiftKey?buttons.length-1:0].focus();}}
},true);
window.Cultivation={start,continueFromChapter:()=>start({inherit:true}),state,render};
})();
