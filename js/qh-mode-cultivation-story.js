/* Approved foreground Q portraits + one speech balloon, 2026-10-04. */
(function(root){
'use strict';
const enabled=true;
const portraits={hero:'assets/production/cultivation/portraits/hero_listen_v2.png',zhou:'assets/production/cultivation/story-v6/zhou.png',ye:'assets/production/cultivation/portraits/ye_tidy_v2.png',lu:'assets/production/cultivation/story-v6/lu.png',neighbor:'assets/production/cultivation/story-v6/neighbor.png'};
Object.assign(portraits,{mo_songnian:'assets/production/cultivation/visitors-v1/mo_songnian.png',meng_zhiwei:'assets/production/cultivation/visitors-v1/meng_zhiwei.png',zhaochuan_courier:'assets/production/cultivation/visitors-v1/zhaochuan_courier.png'});
if(root.CultivationHousehold)Object.assign(portraits,root.CultivationHousehold.portraits);
const labels={hero:'萧白',zhou:'周砚',ye:'叶蘅',lu:'陆衡',neighbor:'乡邻',mo_songnian:'莫松年',meng_zhiwei:'孟知微',zhaochuan_courier:'照川来客',narrator:'旁白',...(root.CultivationHousehold?.actors||{})};
const escape=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let voiceEvent=null,voiceLine=null;
const voiceIds={ye:'ye',pei:'pei-zhigu',zhou:'zhouyan',lu:'lu-heng'};
// 按台词语气给同屏人物选表情：家里人有表情档，谷外人物仍用单张图。
function actorSrc(id,mood){const H=root.CultivationHousehold,st=typeof S!=='undefined'?S?.cultivation:null;if(H&&id==='hero')return H.heroPortrait(st,mood);if(H?.MOODS?.[id])return H.portraitFor(id,mood);return portraits[id];}
// 多人镜头保留完整名单；当前说话人和萧白始终在三幅大图中，其他在场人物用头像展示。
function composition(cast,speaker,primary){const all=[...new Set(cast)];if(portraits[speaker]&&!all.includes(speaker))all.push(speaker);
 if(all.length<=3)return {foreground:all,roster:[]};
 const chosen=new Set([speaker,all.find(a=>/^hero(_|$)/.test(a)),primary].filter(a=>all.includes(a)));
 for(const a of all){if(chosen.size===3)break;chosen.add(a);}
 return {foreground:all.filter(a=>chosen.has(a)),roster:all.filter(a=>!chosen.has(a))};
}
function render(host,{title,text,speaker='zhou',cast=['hero','zhou'],buttons='',choice=false,event=null,line=null,moods=null}){
 const encounter=typeof S!=='undefined'?S.cultivation?.pending?.id||event||title:event||title;
 const signature=encounter+'|'+speaker+'|'+text;
 if(signature!==voiceLine){voiceLine=signature;root.CharacterVoice?.stop();if(encounter!==voiceEvent){voiceEvent=encounter;root.CharacterVoice?.beginInteraction();}
  if(!choice&&speaker!=='narrator'&&!line?.letterAuthor&&voiceIds[speaker])root.CharacterVoice?.begin(labels[speaker],text,voiceIds[speaker]);}
 const H=root.CultivationHousehold,mood=moods||(H?H.moodsFor(event,line||{speaker,text},cast):{});
 const {foreground,roster}=composition(cast,speaker,H?.definitions.find(d=>d.id===event)?.actor);
 const el=document.createElement('section');el.className='cu-story-scene cu-visitor-story';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',title);el.dataset.speaker=speaker;el.dataset.choice=String(choice);el.dataset.narrator=String(speaker==='narrator');
 const position=foreground.indexOf(speaker),tail=position===0?'left':position===foreground.length-1?'right':'center';
 const characterClass=id=>`cu-story-${id}${id==='hero'&&H?' cu-story-hero_'+H.heroForm(typeof S!=='undefined'?S?.cultivation:null):''}`;
 const stateMood=id=>(H&&H.resolveMood(id==='hero'?'hero_'+H.heroForm(typeof S!=='undefined'?S?.cultivation:null):id,(mood[id]||'normal').replace(/^hurt_/,'')))||mood[id]||'';
 el.innerHTML=`<div class="cu-story-stage" aria-label="剧情人物">${foreground.map((id,i)=>`<img class="cu-story-actor ${characterClass(id)}" style="--actor-index:${i};--actor-count:${foreground.length}" src="${actorSrc(id,mood[id])}?v=20261012-performance1" data-mood="${stateMood(id)}" alt="${labels[id]} · Q版剧情形象" data-character="${id}" data-speaking="${id===speaker}" draggable="false">`).join('')}</div>${roster.length?`<aside class="cu-story-roster" aria-label="其他在场人物">${roster.map(id=>`<div class="cu-story-roster-person ${characterClass(id)}" data-character="${id}" data-mood="${stateMood(id)}"><span class="cu-story-avatar"><img src="${actorSrc(id,mood[id])}?v=20261012-performance1" alt="" draggable="false"></span><span>${labels[id]}</span></div>`).join('')}</aside>`:''}<div class="cu-speech cu-speech-${tail} ${choice?'cu-speech-choice':''}" aria-label="${labels[speaker]}的对白"><span class="cu-speech-tail" aria-hidden="true"></span><h2>${labels[speaker]}</h2><p>${escape(text)}</p><div class="cu-speech-answers ${choice?'':'cu-speech-continue'}">${buttons}</div></div>`;
 host.appendChild(el);return el;
}
function next(action,label='继续对白'){return `<button class="cu-dialogue-next" data-cu="${action}" aria-label="${label}"><span aria-hidden="true">▾</span></button>`;}
function answer(action,id,label,cost){return `<button class="cu-dialogue-answer" data-cu="${action}" data-id="${escape(id)}"><span>${escape(label)}</span>${cost===undefined||cost===0?'':`<small>体力 ${cost}</small>`}</button>`;}
const API={enabled,portraits,labels,composition,render,next,answer};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationStory=API;
if(enabled&&root.document)root.document.documentElement.dataset.cultivationStory='q-v6';
})(typeof globalThis!=='undefined'?globalThis:this);
