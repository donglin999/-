/* Approved foreground Q portraits + one speech balloon, 2026-10-04. */
(function(root){
'use strict';
const enabled=true;
const portraits={hero:'assets/production/cultivation/portraits/hero_listen_v2.png',zhou:'assets/production/cultivation/story-v6/zhou.png',ye:'assets/production/cultivation/portraits/ye_tidy_v2.png',lu:'assets/production/cultivation/story-v6/lu.png',neighbor:'assets/production/cultivation/story-v6/neighbor.png'};
Object.assign(portraits,{mo_songnian:'assets/production/cultivation/visitors-v1/mo_songnian.png',meng_zhiwei:'assets/production/cultivation/visitors-v1/meng_zhiwei.png',zhaochuan_courier:'assets/production/cultivation/visitors-v1/zhaochuan_courier.png'});
if(root.CultivationHousehold)Object.assign(portraits,root.CultivationHousehold.portraits);
const labels={hero:'萧白',zhou:'周砚',ye:'叶蘅',lu:'陆衡',neighbor:'乡邻',mo_songnian:'莫松年',meng_zhiwei:'孟知微',zhaochuan_courier:'照川来客',narrator:'旁白',...(root.CultivationHousehold?.actors||{})};
const escape=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let voiceEvent=null,voiceLine=null,lastDuo={event:null,src:null};
const voiceIds={ye:'ye',pei:'pei-zhigu',zhou:'zhouyan',lu:'lu-heng'};
// 按台词语气给同屏人物选表情：家里人有表情档，谷外人物仍用单张图。
function actorSrc0(id,mood){const H=root.CultivationHousehold,st=typeof S!=='undefined'?S?.cultivation:null;if(H&&id==='hero')return H.heroPortrait(st,mood);if(H?.MOODS?.[id])return H.portraitFor(id,mood);return portraits[id];}
// 2026-10-21 人物朝向（规范见 dialogue-staging.md「人物朝向」）：立绘多画成朝右，站右位会背对左边的人。
// 下列人物每个表情档都有重画的朝左版（文件名加 _left），多人镜头站最右位时换用；不镜像翻图。
// 朝左版取景可能和原档不同，站位按 data-facing="left" 单独给（build_actor_layout.py 逐张量脸），舞台上脸高、脸线不变。
const faceLeft=(id,i,n)=>n>1&&i===n-1&&LEFT_READY.has(id);
const LEFT_READY=new Set(['pei','peishu','zhou','yin','mo_songnian','meng_zhiwei','zhaochuan_courier']);
function actorSrc(id,mood,right){const src=actorSrc0(id,mood);return right&&LEFT_READY.has(id)&&src?src.replace(/\.png$/,'_left.png'):src;}
// 多人镜头保留完整名单；当前说话人和萧白始终在三幅大图中，其他在场人物用头像展示。
// 2026-10-20 用户：主角没有特殊原因时站在最左边和别人对话。cast 里写成什么顺序都先把萧白挪到第一位；
// 确需站右的剧情在定义里写 heroSide:'right'。
const isHero=a=>/^hero(_|$)/.test(a);
function heroFirst(list,heroSide){const h=list.filter(isHero),o=list.filter(a=>!isHero(a));return heroSide==='right'?[...o,...h]:[...h,...o];}
function composition(cast,speaker,primary,heroSide){const all=heroFirst([...new Set(cast)],heroSide);if(portraits[speaker]&&!all.includes(speaker))all.push(speaker);
 if(all.length<=3)return {foreground:heroFirst(all,heroSide),roster:[]};
 const chosen=new Set([speaker,all.find(isHero),primary].filter(a=>all.includes(a)));
 for(const a of all){if(chosen.size===3)break;chosen.add(a);}
 return {foreground:heroFirst(all.filter(a=>chosen.has(a)),heroSide),roster:all.filter(a=>!chosen.has(a))};
}
// 2026-10-20 立绘动感（规范见 xiaojianghu/docs/design/dialogue-staging.md「立绘动感」）：台词上写 motion，
// 'knock' 作用于说话人；{who:'pei',move:'knock'} 指定人物；who:'duo' 作用于双人图。一句最多一个动作。
const MOTIONS=['knock','flee','startle','step','drag','shake','slump','nod','enter'];
let motionLine=null;
function motionOf(line,speaker){const m=line?.motion;if(!m)return null;const o=typeof m==='string'?{move:m}:m;return MOTIONS.includes(o.move)?{who:o.who||speaker,move:o.move}:null;}
function applyMotion(el,motion,signature){
 const actors=[...el.querySelectorAll('.cu-story-stage .cu-story-actor')],n=actors.length;
 // 方向：--away 是背向对手（左位往左、右位往右），--toward 相反；中位按所在半边。
 actors.forEach((a,i)=>{const side=n===1?0:i===0?-1:i===n-1?1:(i<(n-1)/2?-1:1);a.style.setProperty('--away',String(side));a.style.setProperty('--toward',String(-side));});
 if(!motion||signature===motionLine)return;motionLine=signature;
 const target=motion.who==='duo'?el.querySelector('.cu-story-duo,[data-character="duo"]'):actors.find(a=>a.dataset.character===motion.who);
 if(target)target.dataset.motion=motion.move;
}
function render(host,{title,text,speaker='zhou',cast=['hero','zhou'],buttons='',choice=false,event=null,line=null,moods=null}){
 const encounter=typeof S!=='undefined'?S.cultivation?.pending?.id||event||title:event||title;
 const signature=encounter+'|'+speaker+'|'+text;
 if(signature!==voiceLine){voiceLine=signature;root.CharacterVoice?.stop();if(encounter!==voiceEvent){voiceEvent=encounter;root.CharacterVoice?.beginInteraction();}
  if(!choice&&speaker!=='narrator'&&!line?.letterAuthor&&voiceIds[speaker])root.CharacterVoice?.begin(labels[speaker],text,voiceIds[speaker]);}
 const H=root.CultivationHousehold,mood=moods||(H?H.moodsFor(event,line||{speaker,text},cast):{});
 // 2026-10-20 双人 Q 版两种用法：只写 duo＝整句只显示这张图（扶梯子，萧白在图里）；
 // 再写 duoCast＝图里是哪几个人，这张图只占一个站位，其余在场的人照常站（躲在父亲身后，萧白在左边和他们说话）。
 // 选项画面沿用上一句的双人图。
 const duo=line?.duo||(choice&&lastDuo.event===encounter?lastDuo.src:null),duoCast=duo?(line?.duo?line.duoCast:lastDuo.cast)||null:null;
 lastDuo=duo?{event:encounter,src:duo,cast:duoCast}:{event:null,src:null,cast:null};
 const slotted=!!(duo&&duoCast?.length),fullDuo=!!duo&&!slotted,inDuo=a=>slotted&&duoCast.includes(a),as=a=>inDuo(a)?'duo':a;
 const duoKey=duo?duo.split('/').pop().replace(/\.\w+$/,''):'';
 const def=H?.definitions.find(d=>d.id===event),{foreground,roster}=composition(slotted?[...cast.filter(a=>!inDuo(a)),'duo']:cast,as(speaker),as(def?.actor),def?.heroSide);
 const el=document.createElement('section');el.className='cu-story-scene cu-visitor-story';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',title);el.dataset.speaker=speaker;el.dataset.choice=String(choice);el.dataset.narrator=String(speaker==='narrator');
 const position=foreground.indexOf(as(speaker)),tail=fullDuo?'center':position===0?'left':position===foreground.length-1?'right':'center';
 const characterClass=id=>`cu-story-${id}${id==='hero'&&H?' cu-story-hero_'+H.heroForm(typeof S!=='undefined'?S?.cultivation:null):''}`;
 const stateMood=id=>(H&&H.resolveMood(id==='hero'?'hero_'+H.heroForm(typeof S!=='undefined'?S?.cultivation:null):id,(mood[id]||'normal').replace(/^hurt_/,'')))||mood[id]||'';
 el.innerHTML=`<div class="cu-story-stage" aria-label="剧情人物"${!fullDuo&&foreground.length===1&&isHero(foreground[0])?' data-solo="hero"':''}>${fullDuo?`<img class="cu-story-duo" src="${duo}" alt="${escape(title)} · 双人Q版" draggable="false">`:foreground.map((id,i)=>id==='duo'?`<img class="cu-story-actor cu-story-duo-actor cu-story-${duoKey}" style="--actor-index:${i};--actor-count:${foreground.length}" src="${duo}" alt="${escape(duoCast.map(a=>labels[a]).join('、'))} · 双人Q版" data-character="duo" data-speaking="${inDuo(speaker)}" draggable="false">`:`<img class="cu-story-actor ${characterClass(id)}" style="--actor-index:${i};--actor-count:${foreground.length}" src="${actorSrc(id,mood[id],faceLeft(id,i,foreground.length))}?v=20261012-performance1" data-mood="${stateMood(id)}"${faceLeft(id,i,foreground.length)?' data-facing="left"':''} alt="${labels[id]} · Q版剧情形象" data-character="${id}" data-speaking="${id===speaker}" draggable="false">`).join('')}</div>${!fullDuo&&roster.length?`<aside class="cu-story-roster" aria-label="其他在场人物">${roster.map(id=>`<div class="cu-story-roster-person ${characterClass(id)}" data-character="${id}" data-mood="${stateMood(id)}"><span class="cu-story-avatar"><img src="${actorSrc(id,mood[id])}?v=20261012-performance1" alt="" draggable="false"></span><span>${labels[id]}</span></div>`).join('')}</aside>`:''}<div class="cu-speech cu-speech-${tail} ${choice?'cu-speech-choice':''}" aria-label="${labels[speaker]}的对白"><span class="cu-speech-tail" aria-hidden="true"></span><h2>${labels[speaker]}</h2><p>${escape(text)}</p><div class="cu-speech-answers ${choice?'':'cu-speech-continue'}">${buttons}</div></div>`;
 // 选项画面沿用上一句，不重放动作；同一句重绘也不重放。
 const mo=choice?null:motionOf(line,speaker);if(mo)mo.who=as(mo.who);
 applyMotion(el,mo,signature);
 host.appendChild(el);return el;
}
function next(action,label='继续对白'){return `<button class="cu-dialogue-next" data-cu="${action}" aria-label="${label}"><span aria-hidden="true">▾</span></button>`;}
function answer(action,id,label,cost){return `<button class="cu-dialogue-answer" data-cu="${action}" data-id="${escape(id)}"><span>${escape(label)}</span>${cost===undefined||cost===0?'':`<small>体力 ${cost}</small>`}</button>`;}
const API={enabled,portraits,labels,composition,render,next,answer,MOTIONS,motionOf,LEFT_READY};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationStory=API;
if(enabled&&root.document)root.document.documentElement.dataset.cultivationStory='q-v6';
})(typeof globalThis!=='undefined'?globalThis:this);
